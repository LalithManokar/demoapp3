// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");

var _handleRequest = function() {
    var oHQ = hQuery.hQuery(conn);
   var oDate = new Date();
    oDate.setMilliseconds(0);
    oDate.setSeconds(0);
    oDate.setMinutes(0);
    var sDate = oDate.toISOString();
    var oPrepStatementObjectViews = oHQ.statement(
        "INSERT INTO \"sap.ino.db.tracker::t_object_views\" (VIEWS, OBJECT_ID, APPLICATION, object_type, year, month, week, day, hour) " +
        "select count(*), object_id, APPLICATION, event_type as object_type, year, month, week, day, hour from ( " +
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
        "EXTRACT (HOUR FROM accessed_at)  as  hour " +
        "from \"sap.ino.db.tracker::t_event_log\" " +
        "where (event_type = 'CAMPAIGN' OR event_type = 'IDEA' OR event_type = 'WALL') AND ACCESSED_AT < ? AND object_id IS NOT NULL) " +
        "group by object_id, year, month, week, day, hour, APPLICATION, event_type");
    oPrepStatementObjectViews.execute(sDate);
    
     var oPrepStatementUpdateCampaignCount = oHQ.statement('update "sap.ino.db.campaign::t_campaign" as campaign ' +
            'set view_count = (select sum(views) as integer from "sap.ino.db.tracker::t_object_views" where object_id=campaign.id and object_type = \'CAMPAIGN\'),' + 
            '    visitor_count = (select count(distinct identity_id) from "sap.ino.db.tracker::t_object_unique_visitors" where object_id=campaign.id and object_type = \'CAMPAIGN\'),' +
            '    active_participant_count = (select count(distinct identity_id) from "sap.ino.db.tracker::t_object_unique_visitors" as visitors where object_id=campaign.id and object_type = \'CAMPAIGN\' and identity_id in (select identity_id from "sap.ino.db.campaign::v_campaign_participants_user_transitive" where object_id = visitors.object_id))');
    oPrepStatementUpdateCampaignCount.execute();
     var oPrepStatementDelete = oHQ.statement("delete from \"sap.ino.db.tracker::t_event_log\" where accessed_at < ?");
    oPrepStatementDelete.execute(sDate);
  
  
  
    oHQ.getConnection().commit();
    oHQ.getConnection().close();
    $.response.status = 200;
};

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest();
});