const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.02_move_mail_settings.xsjslib';

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
        // no table entry, no need to move anything
        return true;
    }

    sStatement = "select top 1 user_id from \"SAP_INO\".\"sap.ino.db.basis::t_user_parameter\" where section ='notification' and key = 'mail'";
    aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        info("sap.ino.db.basis::t_user_parameter already contains data in section 'notification' for key 'mail'");
        return true;
    }

    //all clear -> true
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sStatement = "select top 1 id from \"SAP_INO\".\"sap.ino.db.notification::t_notification_settings\"";
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length === 0) {
        return true;
    }
    
    const sMoveSettings =
        "insert into \"sap.ino.db.basis::t_user_parameter\" (USER_ID, SECTION, KEY, VALUE) " +
            "select identity_id as USERID, 'notification' as SECTION, 'mail' as KEY, case when sum(send_mail) > 0 then 'active' else 'inactive' end as VALUE " +
                "from \"sap.ino.db.notification::t_notification_settings\" group by identity_id";

    oHQ.statement(sMoveSettings).execute();

    return true;
}

function clean(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sCleanComment = "delete from \"SAP_INO\".\"sap.ino.db.basis::t_user_parameter\" where section = 'notification' and key = 'mail'";
    
    oHQ.statement(sCleanComment).execute();
    return true;
}