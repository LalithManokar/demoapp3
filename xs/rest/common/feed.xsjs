const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const feed = $.import("sap.ino.xs.xslib", "feed");

TraceWrapper.wrap_request_handler(function(){
    var iCampaignId =  $.request.parameters.get("campaign");
    var iLength =  parseInt($.request.parameters.get("top"), 0);
    var oResponse = feed.getCampaignFeed(iCampaignId, iLength);
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});