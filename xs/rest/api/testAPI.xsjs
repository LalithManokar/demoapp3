const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const feedMail = $.import("sap.ino.xs.xslib", "feedEmail");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function execute() {
        const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
        const oHQ = hQuery.hQuery(oConn);

        const bUnderMaintenance = systemSettings.isUnderMaintenance();    
    try {

        if (bUnderMaintenance) {
            //do not run batch jobs if setup is incomplete
            message.createMessage(
                message.MessageSeverity.Error,
                "MSG_BATCH_SYSTEM_SETUP_RUNNING",
                undefined, undefined, undefined, undefined);
            return;
        }

        feedMail.execute(oHQ, oConn);
    } catch (e) {
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
            undefined, undefined, undefined, e.toString());
        oConn.rollback();
        throw e;
    }
}
execute();