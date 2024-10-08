var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var TextBundle = $.import("sap.ino.xs.xslib","textBundle");

TraceWrapper.wrap_request_handler(function() {
    var sCampaign = $.request.parameters.get("campaign");
});