const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const SelectAllIdeas = $.import("sap.ino.xs.xslib", "selectAllIdeas");

var ContentType = {
    Plain: "text/plain",
    JSON: "application/json"
};

function _handleRequest(oRequest){
    if (oRequest.method !== $.net.http.GET) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = ContentType.Plain;
		$.response.setBody("Method not supported");
		return;
	} else {
	    var oResponse = SelectAllIdeas.getAllIdeas($.request.parameters);
	    
		$.response.status = oResponse.status;
		$.response.contentType = "application/json";
		$.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
	}
}

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest($.request);
});