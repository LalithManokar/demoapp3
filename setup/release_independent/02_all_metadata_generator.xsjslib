var trace = $.import("sap.ino.xs.xslib", "trace");
var metadata = $.import("sap.ino.xs.xslib", "metadata");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = hQuery.hQuery(conn);

var whoAmI = 'sap.ino.setup.release_independent.02_all_metadata_generator.xsjslib';

function error(line) {
	trace.error(whoAmI, line);
}

function info(line) {
	trace.info(whoAmI, line);
}

function check() {
	return true;
}

function run() {
	try {
		var sql =
			'SELECT COUNT(1) AS active FROM "sap.ino.db.basis::t_package_extension" WHERE LAYER > 0 AND BASE_PACKAGE_ID = \'sap.ino.xs.object.idea\'';

		var aResult = oHQ.statement(sql).execute();
		if (aResult && aResult.length > 0 && aResult[0].active > 0) {
			metadata.internalProcess();
			$.response.setBody("generate meta data done！");
		} else {
			$.response.setBody("skip meta data done！");
		}
		return true;
	} catch (ex) {
		$.response.setBody("errors ！");
		TraceWrapper.log_exception(ex);
		return false;
	}
}

function clean() {
	return true;
}