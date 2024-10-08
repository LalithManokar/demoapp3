const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const Criterion = $.import("sap.ino.xs.xslib.idea", "ideaEvaluationCriterions");

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
	    var phaseName = $.request.parameters.get("PHASE_NAME");
	    if(campaignId || phaseName) {
	        var body = JSON.stringify(Criterion.getEvaluationCriterions(campaignId, phaseName));
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