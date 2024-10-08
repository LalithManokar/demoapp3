const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var trackingLog = $.import("sap.ino.xs.xslib", "trackingLog");

var log = function(oSession, oRequest, oHQ) {

	var sEventType = oRequest.parameters.get("event_type");
	if (sEventType != "load" && sEventType != "custom") {
		return;
	}
	var sUrl = oRequest.parameters.get("url");
	var sSessionId = oRequest.parameters.get("_id");
	var sUserName = oSession.getUsername();
	if (sSessionId === null || sSessionId === null || sUserName === null) {
		return;
	}
	var oDate = new Date();
	oDate.setMilliseconds(0);
	oDate.setSeconds(0);
	var sDate = oDate.toISOString();
	var aURLparts = sUrl.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
	if (aURLparts === null || aURLparts.length < 6) {
		return;
	}
	var sPath = aURLparts[5];
	if (sPath === null) {
		return;
	}

	var iId = null,
		sDiscloseType;
	if (sEventType === "custom") {
		iId = oRequest.parameters.get("e_a");
		if (isNaN(iId) && parseInt(Number(iId)) !== iId) {
			return;
		}
		sEventType = oRequest.parameters.get("e_c");
		sDiscloseType = sEventType;
		if (sEventType !== "WALL" && sEventType !== "CAMPAIGN" && sEventType !== "IDEA" && sEventType !== "DISCLOSE_DATA") {
			return;
		}
	}
	var oPreparedStatementViewLoad = oHQ.statement(
		"INSERT INTO \"sap.ino.db.tracker::t_event_log\" (ACCESSED_AT, SESSION_ID, USER_NAME, EVENT_TYPE, OBJECT_ID, URL_PATH) values (?, ?, ?, ?, ?, ?)"
	);
	oPreparedStatementViewLoad.execute(sDate, sSessionId, sUserName, sEventType, iId, sPath);
	if (sDiscloseType === "DISCLOSE_DATA") {
		var oPrepStatementInsertDataViewLog = oHQ.statement("insert into \"sap.ino.db.iam::t_identity_data_view_log\" " +
			"select \"SAP_INO\".\"sap.ino.db.iam::s_identity_data_view_log\".nextval as ID," +
			"IDENTITY_ID,disclosed_at,disclosed_by_id from (select top 1 events.object_id as IDENTITY_ID, events.accessed_at as disclosed_at ,identity.id as disclosed_by_id  from \"sap.ino.db.tracker::t_event_log\" as events " +
			"inner join \"sap.ino.db.iam::t_identity\" as identity on events.user_name = identity.user_name  where event_type = 'DISCLOSE_DATA' and object_id = '" +
			iId + "' order by disclosed_at desc)");
		oPrepStatementInsertDataViewLog.execute();

	}

	
};

var aggregateEvents = function(oSession, oRequest, oHQ) {
	var oDate = new Date();
	oDate.setMilliseconds(0);
	oDate.setSeconds(0);
	oDate.setMinutes(0);
	var sDate = oDate.toISOString();

	var oPrepStatementLockTable = oHQ.statement("LOCK TABLE \"SAP_INO\".\"sap.ino.db.tracker::t_application_views\" IN EXCLUSIVE MODE NOWAIT");
	oPrepStatementLockTable.execute();

	var oPrepStatementObjectViews = oHQ.statement(
		"INSERT INTO \"sap.ino.db.tracker::t_object_views\" (VIEWS, OBJECT_ID, APPLICATION, object_type, year, month, week, day, hour, user_name) " +
		"select count(*), object_id, APPLICATION, event_type as object_type, year, month, week, day, hour, user_name from ( " +
		"select " +
		"distinct session_id, " +
		"object_id,  " +
		"CASE " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_BACKOFFICE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_BACKOFFICE' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_MASHUP')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_MASHUP' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_MOBILE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_MOBILE' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_FRONTOFFICE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_FRONTOFFICE' " +
		"ELSE '' END AS APPLICATION, " +
		"event_type, " +
		"EXTRACT (year FROM accessed_at)  as  year, " +
		"EXTRACT (month FROM accessed_at) as  month, " +
		"WEEK (accessed_at) as week, " +
		"EXTRACT (day FROM accessed_at)   as  day, " +
		"EXTRACT (HOUR FROM accessed_at)  as  hour, " +
		"user_name " +
		"from \"sap.ino.db.tracker::t_event_log\" " +
		"where (event_type = 'CAMPAIGN' OR event_type = 'IDEA' OR event_type = 'WALL') AND ACCESSED_AT < ? AND object_id IS NOT NULL) " +
		"group by object_id, year, month, week, day, hour, APPLICATION, event_type, user_name");
	oPrepStatementObjectViews.execute(sDate);

	var oPrepStatementApplicationViews = oHQ.statement(
		"INSERT INTO \"sap.ino.db.tracker::t_application_views\" (VIEWS, YEAR, MONTH, WEEK, DAY, HOUR, APPLICATION) " +
		"select count(*), YEAR, MONTH, WEEK, DAY, HOUR, APPLICATION from (select APPLICATION, " +
		"EXTRACT (year FROM accessed_at) as year, " +
		"EXTRACT (month FROM accessed_at) as month, " +
		"WEEK (accessed_at) as  week, " +
		"EXTRACT (day FROM accessed_at) as day, " +
		"EXTRACT (HOUR FROM accessed_at) as hour from (select distinct session_id, " +
		"CASE " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_BACKOFFICE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_BACKOFFICE' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_MASHUP')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_MASHUP' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_MOBILE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_MOBILE' " +
		"WHEN url_path LIKE CONCAT(CONCAT('%',(select value from \"sap.ino.db.basis::t_system_setting\" where CODE = 'sap.ino.config.URL_PATH_UI_FRONTOFFICE')), '%') " +
		"THEN 'sap.ino.config.URL_PATH_UI_FRONTOFFICE' " +
		"ELSE '' END AS APPLICATION, " +
		"ACCESSED_AT from \"sap.ino.db.tracker::t_event_log\" where ACCESSED_AT < ?)) " +
		"group by APPLICATION,  year, month, week, day, hour");
	oPrepStatementApplicationViews.execute(sDate);

	var oPrepStatementUniqueVisitors = oHQ.statement(
		"insert into \"sap.ino.db.tracker::t_object_unique_visitors\" (object_id, identity_id, object_type) " +
		"select object_id, user_views.identity_id, event_type as object_type from (select distinct object_id, event_type, identity.id as identity_id from \"sap.ino.db.tracker::t_event_log\" as events " +
		"inner join \"sap.ino.db.iam::t_identity\" as identity on events.user_name = identity.user_name  where event_type = 'CAMPAIGN' OR event_type = 'IDEA' OR event_type = 'WALL')  as user_views " +
		"where not Exists (select object_id, identity_id, object_type from \"sap.ino.db.tracker::t_object_unique_visitors\" as visitors where visitors.identity_id = user_views.identity_id and visitors.object_id = user_views.object_id and visitors.object_type = user_views.event_type)"
	);
	oPrepStatementUniqueVisitors.execute();

	var oPrepStatementUpdateIdeaViewCount = oHQ.statement('update "sap.ino.db.idea::t_idea" as idea ' +
		'set view_count = (select sum(views) as integer from "sap.ino.db.tracker::t_object_views" where object_id=idea.id and object_type = \'IDEA\')'
	);
	oPrepStatementUpdateIdeaViewCount.execute();

	//     var oPrepStatementUpdateWallViewCount = oHQ.statement('update "sap.ino.db.wall::t_wall" as wall ' + 
	// 	    	'set view_count = (select sum(views) as integer from "sap.ino.db.tracker::t_object_views" where object_id=wall.id and object_type = \'WALL\')');
	// 	oPrepStatementUpdateWallViewCount.execute();

	var oPrepStatementUpdateCampaignCount = oHQ.statement('update "sap.ino.db.campaign::t_campaign" as campaign ' +
		'set view_count = (select sum(views) as integer from "sap.ino.db.tracker::t_object_views" where object_id=campaign.id and object_type = \'CAMPAIGN\'),' +
		'    visitor_count = (select count(distinct identity_id) from "sap.ino.db.tracker::t_object_unique_visitors" where object_id=campaign.id and object_type = \'CAMPAIGN\'),' +
		// '    active_participant_count = (select count(distinct identity_id) from "sap.ino.db.tracker::t_object_unique_visitors" as visitors where object_id=campaign.id and object_type = \'CAMPAIGN\' and identity_id in (select identity_id from "sap.ino.db.campaign::v_campaign_participants_user_transitive" where object_id = visitors.object_id))');
		'    active_participant_count = (select count(distinct vistors.identity_id) from "sap.ino.db.tracker::t_object_unique_visitors" as vistors left outer join "sap.ino.db.campaign::v_campaign_participants_user_transitive" as participants on vistors.object_id  = participants.object_id where vistors.object_id=campaign.id and vistors.object_type = \'CAMPAIGN\' )'
	);

	oPrepStatementUpdateCampaignCount.execute();
	
	//count the active user per hour
	var oPrepStatementIdenViews = oHQ.statement(
		"INSERT INTO \"sap.ino.db.tracker::t_identity_views\" (IDENTITY_ID, ACCESSED_AT) " +
		"SELECT " +
		"DISTINCT IDEN.ID AS IDENTITY_ID, LOG.ACCESSED_AT " +
		"FROM \"sap.ino.db.tracker::t_event_log\" AS LOG " +
		"INNER JOIN \"sap.ino.db.iam::t_identity\" AS IDEN "+
		"ON LOG.USER_NAME = IDEN.USER_NAME "+
		"WHERE LOG.EVENT_TYPE = 'load' AND LOG.ACCESSED_AT < ?");
	oPrepStatementIdenViews.execute(sDate);
	//CLEAN USER VIEW DATA
    	oHQ.statement("DELETE FROM \"sap.ino.db.tracker::t_identity_views\" WHERE ACCESSED_AT < ADD_YEARS(CURRENT_UTCDATE,-1);").execute();
	
	//delete data
	var oPrepStatementDelete = oHQ.statement("delete from \"sap.ino.db.tracker::t_event_log\" where accessed_at < ?");
	oPrepStatementDelete.execute(sDate);
};