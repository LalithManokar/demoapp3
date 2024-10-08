const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const ideaFilterRespValues = $.import("sap.ino.xs.xslib", "ideaFilterRespValues");

TraceWrapper.wrap_request_handler(function(){
    var iCampaignId =  $.request.parameters.get("CAMPAIGN_ID");
    var oResponse = ideaFilterRespValues.getRespValues(iCampaignId);
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});