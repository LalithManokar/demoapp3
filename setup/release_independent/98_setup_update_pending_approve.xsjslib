const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const configuration = $.import("sap.ino.xs.aof.config", "activation");
var msg = $.import("sap.ino.xs.aof.lib", "message");

const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const register = $.import("sap.ino.xs.xslib", "registrationApproval");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_independent.97_setup_activate_configuration.xsjslib';
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

function error(line) {
	// 	trace.error(whoAmI, line);
}

function info(line) {
	trace.info(whoAmI, line);
}

function check(oConnection) {
	return true;
}

function run(oConnection) {
	const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	const oHQ = hQuery.hQuery(conn);

	try {
		approve(oHQ, conn);
		return true;
	} catch (e) {
		$.response.setBody("errors ！");
		TraceWrapper.log_exception(e);
		conn.rollback();
		return false;
	}

	function getNewRegistrations(oHQ) {
		var sStatement =
			"select distinct registration.id as register_id " +
			"from \"sap.ino.db.campaign::t_registration\" as registration " +
			"inner join \"sap.ino.db.campaign::t_campaign\" as campaign on registration.CAMPAIGN_ID = campaign.ID " +
			"where registration.status = 'sap.ino.config.REGISTER_NEW' and campaign.is_register_auto_approve = 1";

		var aRegistration = oHQ.statement(sStatement).execute();
		if (aRegistration && aRegistration.length === 0) {
			return {};
		}

		return aRegistration;
	}

	function approve(oHQ, conn) {
		var aRegistration = getNewRegistrations(oHQ);
		var oRegistration = AOF.getApplicationObject("sap.ino.xs.object.campaign.Registration");

		_.each(aRegistration, function(oRegister) {
			if (oRegister.REGISTER_ID) {
				oRegistration.update({
					ID: oRegister.REGISTER_ID,
					STATUS: 'sap.ino.config.REGISTER_APPROVED'
				});
			}
		});
		$.response.setBody("work done！");
		conn.commit();
	}
}

function clean(oConnection) {
	//nothing to do
	return true;
}