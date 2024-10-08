const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const ideaFilterPhase = $.import("sap.ino.xs.xslib", "ideaFilterPhase");

TraceWrapper.wrap_request_handler(function(){
    var iCampaignId =  $.request.parameters.get("CAMPAIGN_ID");
    var oResponse = ideaFilterPhase.getPhases(iCampaignId);
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});