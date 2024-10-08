const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2.2.14.init_notification_latest_event_at.xsjslib';

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
    var sExistsStatement = 'SELECT TOP 1 1 FROM "sap.ino.db.notification::t_notification_latest_time" WHERE ID = 1;';
    var sResult = oHQ.statement(sExistsStatement).execute();
    if(sResult && sResult.length >= 1){
        return true;
    }
    var sStatement = 'INSERT INTO "sap.ino.db.notification::t_notification_latest_time"(ID, LATEST_EVENT_AT) \
	SELECT 1 AS ID, IFNULL(MAX(event_at), CURRENT_UTCTIMESTAMP) AS LATEST_EVENT_AT  FROM "sap.ino.db.notification::t_notification"; ';
    oHQ.statement(sStatement).execute();
    return true;
}

function clean(oConnection) {
    return true;
}