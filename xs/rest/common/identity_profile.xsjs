const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const identityProfile = $.import("sap.ino.xs.xslib", "identityProfile");
var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};
TraceWrapper.wrap_request_handler(function(){
    var iUserId =  $.request.parameters.get("USER_ID");
	if ( $.request.method !== $.net.http.GET) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = "text/plain";
		$.response.setBody("Method not supported");
		return;
	}   
    var oResponse = identityProfile.getTargetUserData($.session, iUserId);	
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.cacheControl = "must-revalidate";
    $.response.cacheControl = "no-cache";
    $.response.headers.set("Last-Modified", new Date().toGMTString());
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});