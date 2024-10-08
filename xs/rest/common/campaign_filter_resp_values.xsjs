const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const campaignFilterRespValues = $.import("sap.ino.xs.xslib", "campaignFilterRespValues");

TraceWrapper.wrap_request_handler(function(){
    //var iCampaignId =  $.request.parameters.get("CAMPAIGN_ID");
    var oResponse = campaignFilterRespValues.getRespValues();
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});