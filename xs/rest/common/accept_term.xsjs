const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const AcceptTerm = $.import("sap.ino.xs.xslib", "acceptTerm");

var ContentType = {
    Plain: "text/plain",
    JSON: "application/json"
};

function _handleRequest(oRequest){
    if (oRequest.method !== $.net.http.PUT && oRequest.method !== $.net.http.POST) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = ContentType.Plain;
		$.response.setBody("Method not supported");
		return;
	} else {
	    var oResponse = AcceptTerm.putAcceptHistory($.session, JSON.parse(oRequest.body.asString()));
	    
		$.response.status = oResponse.status;
		$.response.contentType = "application/json";
		$.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
	}
}

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest($.request);
});