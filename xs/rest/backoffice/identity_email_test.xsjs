const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const identityEmail = $.import("sap.ino.xs.xslib", "identityEmail");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();

function execute() {
    try {
        const oHQ = hQuery.hQuery(oConn);

        const bUnderMaintenance = systemSettings.isUnderMaintenance();
        if (bUnderMaintenance) {
            //do not run batch jobs if setup is incomplete
            message.createMessage(
                message.MessageSeverity.Error,
                "MSG_BATCH_SYSTEM_SETUP_RUNNING",
                undefined, undefined, undefined, undefined);
            return;
        }

        identityEmail.execute(oHQ, oConn);
        oConn.close();
    } catch (e) {
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
            undefined, undefined, undefined, e.toString());
        oConn.rollback();
        oConn.close();
        throw e;
    }
}

execute();