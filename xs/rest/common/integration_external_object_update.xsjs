// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
const integrationObjectUpdate = $.import("sap.ino.xs.xslib.integration", "integration_external_object_update");

var _handleRequest = function(req,res) {
    var oHQ = hQuery.hQuery(conn);

  
  
  
    //oHQ.getConnection().commit();
    //oHQ.getConnection().close();
    var obody = {test: "HQ", value:"Lyle"};

    res.status = $.net.http.OK;
    res.contentType = 'application/json';
    res.setBody(JSON.stringify(obody));
};

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest($.request,  $.response);
});