var conf = $.import("sap.ino.xs.aof.config", "activation");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

var ContentType = {
    Plain: "text/plain",
    JSON: "application/json"
};

function _handleRequest(oRequest, oResponse) {
    if (oRequest.method !== $.net.http.PUT && oRequest.method !== $.net.http.POST) {
        oResponse.status = $.net.http.METHOD_NOT_ALLOWED;
        oResponse.contentType = ContentType.Plain;
        oResponse.setBody("Method not supported");
        return;
    } else {
        conf.handleActivation(oResponse);
    }
}

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest($.request, $.response);
});