// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");

var _handleRequest = function() {
    var oHQ = hQuery.hQuery(conn);
    tracker.log($.session, $.request, oHQ);
    oHQ.getConnection().commit();
    oHQ.getConnection().close();
    $.response.status = 204;
};

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest();
});