const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const Field = $.import("sap.ino.xs.xslib.idea", "ideaCustomFormFields");

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
	    var campaignId = $.request.parameters.get("CAMPAIGN_ID");
        if(campaignId) {
    		var body = JSON.stringify(Field.getFormFields(campaignId));
            $.response.contentType = ContentType.JSON;
            $.response.setBody(body); 
            $.response.status = $.net.http.OK;
        } else {
            $.response.contentType = ContentType.Plain;
            $.response.setBody('');
            $.response.status = $.net.http.BAD_REQUEST;
        }
	}
}

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest($.request);
});