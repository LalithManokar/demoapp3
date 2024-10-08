const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const campaignMilestone = $.import("sap.ino.xs.xslib", "campaignTaskMilestone");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

TraceWrapper.wrap_request_handler(function(){
    var sCampaignId =  $.request.parameters.get("CAMPAIGN_ID");
	if (!sCampaignId || !_.isInteger(sCampaignId)) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.contentType = "text/plain";
		$.response.setBody("Error in payload.");
		return;
	}
    var oResponse = campaignMilestone.getMilestone(sCampaignId);
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});