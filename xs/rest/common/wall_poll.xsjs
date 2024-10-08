var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var wall = $.import("sap.ino.xs.rest.common", "wall");

var SESSION_KEEP_TIME = 10 * 1000;
var WALL_POLL_TIME = 0.25 * 1000;

var ContentType = {
    Plain : "text/plain"
};

var _handleRequest = function() {
    if ($.request.method == $.net.http.GET) {
        var now = Date.now();
        var start = now;
        var poll = now;
        var bWallChange = false;
        while (!bWallChange && now - start < SESSION_KEEP_TIME) {
            now = Date.now();
            if (now - poll >= WALL_POLL_TIME) {
                wall.handleRequest();
                if ($.response.status != $.net.http.NOT_MODIFIED) {
                    bWallChange = true;
                }
                poll = Date.now();
            }
        }
        if (!bWallChange) {
            $.response.contentType = ContentType.Plain;
            $.response.setBody("Not modified");
            $.response.status = $.net.http.NOT_MODIFIED;
        }
    }
};

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest();
});