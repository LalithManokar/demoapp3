var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var wall = $.import("sap.ino.xs.rest.common", "wall");

TraceWrapper.wrap_request_handler(function() {
    return wall.handleRequest();
});