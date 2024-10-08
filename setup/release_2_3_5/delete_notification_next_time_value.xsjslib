const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.setup.release_2_3_5.delete_notification_next_time_value.xsjslib';

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
		update(oHQ, conn);
		return true;
	} catch (e) {
		$.response.setBody("errors ！");
		conn.rollback();
		conn.close();
		return false;
	}

	function update(oHQ, conn) {
		// add assigned coach 
		var sDelone =
			`DELETE FROM "sap.ino.db.iam::t_personalize_setting"
WHERE (IDENTITY_ID IN (SELECT DISTINCT IDENTITY_ID
			FROM "sap.ino.db.iam::t_personalize_setting"
			WHERE object_type_code = 'NOTIFICATION_KEY' AND TYPE_CODE = 'NOTIFICATION' AND SETTING_VALUE <= 0))
	AND object_type_code = 'NEXT_TIME'
	AND TYPE_CODE = 'NOTIFICATION';
`;
		oHQ.statement(sDelone).execute();
		
		var sDeltwo =
			`DELETE FROM "sap.ino.db.iam::t_personalize_setting"
WHERE (IDENTITY_ID IN (SELECT DISTINCT IDENTITY_ID
			FROM "sap.ino.db.iam::t_personalize_setting"
			WHERE object_type_code = 'NEWNOTIFICATION_KEY' AND TYPE_CODE = 'NEWNOTIFICATION' AND SETTING_VALUE <= 0))
	AND object_type_code = 'NEXT_TIME'
	AND TYPE_CODE = 'NEWNOTIFICATION';
`;
		oHQ.statement(sDeltwo).execute();
		$.response.setBody("work done！");
		conn.commit();
	}
	conn.close();
}

function clean(oConnection) {
	//nothing to do
	return true;
}