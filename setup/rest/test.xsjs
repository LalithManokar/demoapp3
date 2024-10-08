// This service bundles access to configuration data the user interface needs for bootstrapping
// It only contains user context independent data so that the configuration part may be cached

var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var AOFRestDispatcher = $.import("sap.ino.xs.aof.rest", "dispatcher");
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const repo = $.import("sap.ino.xsdc.xslib", "repo");

var _handleRequest = function() {
// 	var oHQ = hQuery.hQuery(oConn);
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.headers.set("Last-Modified", new Date().toGMTString());
	$.response.setBody(JSON.stringify("ok"));
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest();
});