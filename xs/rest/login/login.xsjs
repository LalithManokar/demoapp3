// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var login = $.import("sap.ino.xs.object.iam", "login");

var _handleRequest = function() {
	var oHQ = hQuery.hQuery(oConn);
	var oResponse = login.login($.session, {
		backoffice: ($.request.parameters.get("includePrivileges") !== undefined)
	}, oHQ);
	if (oResponse) {
		$.response.status = oResponse.status;
		$.response.contentType = "application/json";
		$.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
		$.response.cacheControl = "no-cache, no-store";
	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest();
});