const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const oConnection = dbConnection.getConnection();
const oSecondaryConnection = dbConnection.getSecondaryConnection();

const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const hq = HQ.hQuery(oConnection);
const hq2 = HQ.hQuery(oSecondaryConnection);

const traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.setup';

function error(line) {
	trace.error(whoAmI, line);
}

function info(line) {
	trace.info(whoAmI, line);
}

function debug(line) {
	trace.debug(whoAmI, line);
}

function lockLog() {
	const sLockStatement = 'lock table "SAP_INO"."sap.ino.setup.db::t_log" in exclusive mode nowait';
	var result = hq2.statement(sLockStatement).execute();
	debug('Lock for table "SAP_INO"."sap.ino.setup.db::t_log" obtained');
}

function log(sVersion, sVersionSp, sVersionPatch, sName, sStep, sState) {
	lockLog();
	var sLogStatement =
		'insert into "sap.ino.setup.db::t_log" (version, version_sp, version_patch, name, time, executed_by, step, state)' +
		'    values (?, ?, ?, ?, current_timestamp, ?, ?, ?)';
	hq2.statement(sLogStatement).execute(String(sVersion), String(sVersionSp), String(sVersionPatch), sName, $.session.getUsername(), sStep,
		sState);
	oSecondaryConnection.commit();
	// unfortunately the commit will release the lock
	// we will be unprotected for a fraction of a second
	lockLog();
}

function commit() {
	oConnection.commit();
}

function rollback() {
	oConnection.rollback();
}

function setupCompleted() {
	const aRegister = getRegister();
	return !aRegister || aRegister.length == 0;
}

function isUnderMaintenance() {
	const aRegister = getRegister();
	const bSetupDone = !aRegister || aRegister.length == 0;

	const sMaintenanceModeQuery = 'SELECT 1 as no from "SAP_INO"."sap.ino.db.basis::v_ino_system_settings" ' +
		"where key = 'maintenance_mode' and value = '1'";
	const result = hq2.statement(sMaintenanceModeQuery).execute();
	const bUnderMaintenance = result.length !== 0;

	return bUnderMaintenance || !bSetupDone;
}

function readBaseRelease() {
	// determine last successfully upgraded path or default to 0.0.0
	// char is used as type of version, version_sp and version_patch is character-like in t_log.hdbtable
	const sBaseReleaseQuery =
		'select top 1' +
		'    to_int(VERSION)       as "version",' +
		'    to_int(VERSION_SP)    as "version_sp",' +
		'    to_int(VERSION_PATCH) as "version_patch"' +
		'from "sap.ino.setup.db::t_log"' +
		"where step = 'run' and name = 'sap.ino.setup.release_independent.99_setup_completed' and state = 'finished'" +
		'order by "version" desc, "version_sp" desc, "version_patch" desc';
	const aResult = hq2.statement(sBaseReleaseQuery).execute();
	const oResult = aResult.length === 1 ? aResult[0] : {
		version: 0,
		version_sp: 0,
		version_patch: 0
	};
	info("base release: " + JSON.stringify(oResult));
	return oResult;
}

var _register = $.import("sap.ino.setup.xslib", "register").aRegister;

function overwriteRegister(register) {
	_register = register;
}

function getRegister() {
	const oBaseRelease = readBaseRelease();

	// read the part of the register that is after the base release
	const aRelevantRegister = _.filter(_register,
		function(oRegisterEntry) {
			return oRegisterEntry.version > oBaseRelease.version ||
				(oRegisterEntry.version == oBaseRelease.version &&
					oRegisterEntry.version_sp > oBaseRelease.version_sp) ||
				(oRegisterEntry.version == oBaseRelease.version &&
					oRegisterEntry.version_sp == oBaseRelease.version_sp &&
					oRegisterEntry.version_patch > oBaseRelease.version_patch);
		});

	// preprocess the result for easier processing later on
	const aMappedRegister = _.map(aRelevantRegister, function(oRegisterEntry) {
		return _.map(oRegisterEntry.library, function(sFullName) {
			var aPath = sFullName.split(".");
			const sName = aPath.pop();
			const sPackage = aPath.join(".");

			return {
				library_full_name: sFullName,
				library_package: sPackage,
				library_name: sName,
				library: $.import(sPackage, sName),
				version: parseInt(oRegisterEntry.version),
				version_sp: parseInt(oRegisterEntry.version_sp),
				version_patch: parseInt(oRegisterEntry.version_patch)
			};
		});
	});
	return aMappedRegister;
}

// string helpers
function padLeft(sString) {
	return (sString + "     ").slice(0, 16);
}

function startsWith(sString, sPrefix) {
	return sString.indexOf(sPrefix) == 0;
}

function endsWith(sString, sSuffix) {
	return sString.indexOf(sSuffix, sString.length - sSuffix.length - 1) != -1;
}

function startsOrEndsWith(sString, sSubstring) {
	return startsWith(sString, sSubstring) || endsWith(sString, sSubstring);
}

// "run" a library, that is cycle through the check/run/clean steps depending on how they succeed or fail
function runner(bTrace, oLibraryMeta) {
	return genericCall(bTrace, oLibraryMeta, 'check') &&
		(genericCall(bTrace, oLibraryMeta, 'run') || genericCall(bTrace, oLibraryMeta, 'clean') && false);
}

// process one step (= one xsjslib file)
function genericCall(bTrace, oLibraryMeta, sMethod) {
	log(oLibraryMeta.version, oLibraryMeta.version_sp, oLibraryMeta.version_patch, oLibraryMeta.library_full_name, sMethod, 'started');
	info(padLeft('execute ' + sMethod + ': ') + oLibraryMeta.library_full_name);
	try {
		var bOK = oLibraryMeta.library[sMethod](oConnection, oLibraryMeta);
		(bOK ? commit : rollback)();
	} catch (e) {
	    traceWrapper.log_exception(e);
		bOK = false;
		rollback();
		error("execution terminated with an exception");
		if (bTrace) {
			throw (e);
		}
	}
	var sResultState = bOK ? 'finished' : 'error';
	var sOut = padLeft(sMethod + ' ' + sResultState + ': ') + oLibraryMeta.library_full_name;
	(bOK ? info : error)(sOut);
	log(oLibraryMeta.version, oLibraryMeta.version_sp, oLibraryMeta.version_patch, oLibraryMeta.library_full_name, sMethod, sResultState);

	return bOK;
}

function latestRunFinishedAndWasNotCleaned(oLibrary) {
	// it would be sufficient to query for step and state but for debug purposes we select *
	const sFinalStepQuery =
		'select top 1 * from "sap.ino.setup.db::t_log"' +
		"    where" +
		"        name = ?" +
		"    and (step = 'run' and state = 'finished' or step = 'clean')" +
		"    and version = ?" +
		"    and version_sp = ?" +
		"    and version_patch = ?" +
		"    order by" +
		"        time desc";
	var result = hq2.statement(sFinalStepQuery).execute(oLibrary.library_full_name, String(oLibrary.version), String(oLibrary.version_sp),
		String(oLibrary.version_patch));

	var bFoundRunFinished = result.length == 1 && result[0].STEP == 'run' && result[0].STATE == 'finished';
	return bFoundRunFinished;
}

function setResponse(response, status, contentType, body) {
	response.status = status;
	response.contentType = contentType;
	response.setBody(body);
	return body;
}

const sHalmSetup = "HALM_SETUP";

// iterate the "relevant" steps
// a step is upgrade relevant if
//    - it belongs to a release after the base release
// relevant steps may be filtered
//    - by default steps that were run successful will not be processed
//        - a step was run successful if it is in the log as "run finished"
//          AND it has no successive log entry for "clean".
//    - if steps are explicitly filtered by means of URL parameters no check of their relevance will happen
function execute(request, response, fnHandler, sMethod, bTrace) {
	trace.setTransientMode('i');

	if (request.method !== sHalmSetup && request.method != $.net.http.POST) {
		return setResponse(response, $.net.http.METHOD_NOT_ALLOWED, "plain/text", "Unsupported method");
	}

	const oConnection = dbConnection.getConnection();

	const aRegister = getRegister();
	const bOK = _.every(aRegister, function(aReleaseVersionLibraries) {
		function libraryShallBeProcessed(oLibrary) {
			return (
				request.parameters.length == 0 ? !latestRunFinishedAndWasNotCleaned(oLibrary) :
				_.some(request.parameters, function(oParameter) {
					return startsOrEndsWith(oLibrary.library_full_name, oParameter.name);
				})
			);
		}
		var aFilteredLibraries = _.filter(aReleaseVersionLibraries, libraryShallBeProcessed);

		// Notice that "_.every" will stop iteration once the first failure is
		// encountered.
		var bOK = _.every(aFilteredLibraries, function executeAndHandleExceptions(oLibraryMeta) {
			var bOK;
			try {
				bOK = fnHandler(bTrace, oLibraryMeta, sMethod);
				info('');
			} catch (e) {
				bOK = false;
	            traceWrapper.log_exception(e);
				rollback();
				if (e.code == 146) {
					// 146 - resource busy and acquire with NOWAIT specified
					error('table sap.ino.setup.db::t_log is locked - probably the setup is already running')
				} else {
					error("execution terminated with an internal exception");
				}
				if (bTrace) {
					throw (e);
				}
			}
			return bOK;
		});
		(bOK ? info : error)('done');
		return bOK;
	});

	if (request.method === sHalmSetup) {
		return trace.getRawTransientTrace();
	} else {
		return setResponse(response,
			bOK ? $.net.http.OK : $.net.http.INTERNAL_SERVER_ERROR,
			"text/plain", trace.getTransientTrace());
	}
}

function wrap(request, response, fnHandler, sMethod) {
	traceWrapper.wrap_request_handler(function(bTrace) {
		execute(request, response, fnHandler, sMethod, bTrace);
	});
}

/*
// entry points for the calls from sap.ino.setup.rest 
*/
function run(request, response) {
	wrap(request, response, runner);
}

function check(request, response) {
	wrap(request, response, genericCall, 'check');
}

function clean(request, response) {
	wrap(request, response, genericCall, 'clean');
}

/*
// entry points for HALM setup tool
*/
function halmSetup(iParam) {
	const aRawTrace = traceWrapper.wrap_request_handler(function(bTrace) {
		return execute({
			method: sHalmSetup,
			parameters: []
		}, undefined, runner, null, bTrace);
	});

	const aLog = _.map(aRawTrace, function(aRawEntry) {
		return {
			MSG_TYPE: aRawEntry.level.toUpperCase(),
			MSG_TEXT: aRawEntry.message
		};
	});

	const oParam = {
		OTLog: aLog
	};
	return oParam;
}
// name of function according to HALM convention, otherwise
// metadata will not be found
function halmSetup_Metadata() {
	const property = {
		name: "OTLog",
		mode: "OUT",
		type: "sap.hana.xs.lm.pe.db::TT_LOG"
	};
	const metaData = [property];
	return metaData;
}