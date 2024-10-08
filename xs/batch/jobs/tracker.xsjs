// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();


var aggregateEvents = function() {
    var oHQ = hQuery.hQuery(conn);
    
    const bUnderMaintenance = systemSettings.isUnderMaintenance();
    if (bUnderMaintenance) {
        //do not run batch jobs if setup is incomplete
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_BATCH_SYSTEM_SETUP_RUNNING",
            undefined, undefined, undefined, undefined);
        return;
    }

    try {
        tracker.aggregateEvents($.session, $.request, oHQ);
        oHQ.getConnection().commit();
    }
    catch(e) {
        oHQ.getConnection().rollback();
    }
    
    oHQ.getConnection().close();
};
