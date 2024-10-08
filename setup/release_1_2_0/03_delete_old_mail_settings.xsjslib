const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.03_delete_old_mail_settings.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = "select top 1 id from \"SAP_INO\".\"sap.ino.db.notification::t_notification_settings\"";
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length === 0) {
        // no table entry, no need to delete anything
        return true;
    }

    //all clear!
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = "select top 1 id from \"SAP_INO\".\"sap.ino.db.notification::t_notification_settings\"";
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length === 0) {
        // no table entry, no need to delete anything
        return true;
    }
    
    sStatement    = "select coalesce(old.id, new.id) as id " +
                          "from (select distinct identity_id as id from \"SAP_INO\".\"sap.ino.db.notification::t_notification_settings\") as old " +
                          "full outer join (select user_id as id from \"SAP_INO\".\"sap.ino.db.basis::t_user_parameter\" where section ='notification' and key = 'mail') as new " +
                          "on old.id = new.id " +
                          "where old.id is null or new.id is null";

    aResult = oHQ.statement(sStatement).execute();
    if(aResult.length > 0){
        error("\"SAP_INO\".\"sap.ino.db.notifciation::t_notification_settings\" and \"SAP_INO\".\"sap.ino.db.basis::t_user_parameter\" do not match;");
        error("Step 02_move_mail_settings must be executed before;");
        return false;
    }

    var sCleanSettings = 'delete from "SAP_INO"."sap.ino.db.notification::t_notification_settings"';

    oHQ.statement(sCleanSettings).execute();
    info('Table content of "SAP_INO"."sap.ino.db.notifciation::t_notification_settings" successfully deleted.');

    return true;
}

function clean(oConnection) {
    //nothing to do
    return true;
}