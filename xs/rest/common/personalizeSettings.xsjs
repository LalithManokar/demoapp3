const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const Auth = $.import("sap.ino.xs.aof.core", "authorization");
const PersonalizeSettings = $.import("sap.ino.xs.xslib", "personalizeSettings");

TraceWrapper.wrap_request_handler(function() {
    
    var oSettings = PersonalizeSettings.getPersonalizeSettings(Auth.getApplicationUser().ID);
    
    $.response.status = $.net.http.OK;
    $.response.contentType = "application/json";
    $.response.setBody(oSettings ? JSON.stringify(oSettings) : "");
});