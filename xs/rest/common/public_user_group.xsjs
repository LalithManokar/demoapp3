const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const publicUserGroup = $.import("sap.ino.xs.xslib", "publicUserGroup");

TraceWrapper.wrap_request_handler(function(){
    var oResponse = publicUserGroup.getPublicUserGroup();
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});