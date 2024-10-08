const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_4_2.init_existsed_notification_receiver.xsjslib';

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
	const oHQ = HQ.hQuery(oConnection);
	var sSelect =
		`
	SELECT COUNT(1) AS C
FROM "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
WHERE ROLE_CODE = 'CAMPAIGN_FOLLOWER'
	`;
	var aResult = oHQ.statement(sSelect).execute();
	if (!aResult || aResult.length === 0 || aResult[0].C <= 0) {
		oHQ
			.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_init_exists_campaign_receiver_follower")
			.execute();
		oHQ.getConnection().commit();
	};
	sSelect =
		`
	SELECT COUNT(1) AS C
FROM "sap.ino.db.newnotification::t_notification_system_setting_receiver_local"
WHERE ROLE_CODE = 'CAMPAIGN_FOLLOWER'
	`;
	aResult = oHQ.statement(sSelect).execute();
	if (!aResult || aResult.length === 0 || aResult[0].C <= 0) {
		var sSql_CampaignFollower = ' ' +
			' INSERT INTO "SAP_INO"."sap.ino.db.newnotification::t_notification_system_setting_receiver_local"(ROLE_CODE, IS_RECEIVE_EMAIL, ID, ACTION_CODE, ACTION_ID)' +
			' SELECT \'CAMPAIGN_FOLLOWER\', ' +
			' 		0, ' +
			' 		"sap.ino.db.newnotification::s_notification_system_setting_receiver_local".nextval, ' +
			' 		ACTION_CODE, ' +
			' 		ACTION_ID ' +
			' 	FROM "SAP_INO"."sap.ino.db.newnotification::t_notification_system_setting_receiver_local" ' +
			' 	WHERE ACTION_CODE = \'SUBMIT_IDEA\' ' +
			' 		AND ROLE_CODE = \'PARTICIPANT\' ';
		oHQ.statement(sSql_CampaignFollower).execute();
		oHQ.getConnection().commit();
	}
	sSelect =
		`
	SELECT COUNT(1) AS C
FROM "sap.ino.db.newnotification::t_notification_system_setting_receiver_local"
WHERE ROLE_CODE = 'TAG_FOLLOWER'
	`;
	aResult = oHQ.statement(sSelect).execute();
	if (!aResult || aResult.length === 0 || aResult[0].C <= 0) {
		var sSql_TagFollower = ' ' +
			' INSERT INTO "SAP_INO"."sap.ino.db.newnotification::t_notification_system_setting_receiver_local"(ROLE_CODE, IS_RECEIVE_EMAIL, ID, ACTION_CODE, ACTION_ID)' +
			' SELECT \'TAG_FOLLOWER\', ' +
			' 		0, ' +
			' 		"sap.ino.db.newnotification::s_notification_system_setting_receiver_local".nextval, ' +
			' 		ACTION_CODE, ' +
			' 		ACTION_ID ' +
			' 	FROM "SAP_INO"."sap.ino.db.newnotification::t_notification_system_setting_receiver_local" ' +
			' 	WHERE ACTION_CODE = \'PUBLISH_CAMPAIGN\' ' +
			' 		AND ROLE_CODE = \'PARTICIPANT\' ';
		oHQ.statement(sSql_TagFollower).execute();
		oHQ.getConnection().commit();
	}
	$.response.setBody("work done！");
	return true;
}

function clean(oConnection) {
	return true;
}