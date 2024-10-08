const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.setup.release_2_4_0.update_user_locale.xsjslib';

function error(line) {
	trace.error(whoAmI, line);
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
		var sUpdateSql =
			'UPDATE "sap.ino.db.basis::t_user_parameter" ' +
			' SET VALUE = \'en\' ' +
			' WHERE SECTION = \'locale\' ' +
			'	    AND KEY = \'locale\' ' +
			'	    AND VALUE = \'en-US\'; ';
		oHQ.statement(sUpdateSql).execute();
		$.response.setBody("work done！");
		conn.commit();
		return true;
	} catch (e) {
		$.response.setBody("errors ！");
		conn.rollback();
		conn.close();
		return false;
	}
	conn.close();
}

function clean(oConnection) {
	//nothing to do
	return true;
}