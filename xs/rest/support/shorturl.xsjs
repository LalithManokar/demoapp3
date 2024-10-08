var shortUrl = $.import("sap.ino.xs.xslib", "shortUrl");

$.import("sap.ino.xs.xslib", "traceWrapper").wrap_request_handler(function() {
    shortUrl.forwardUrl();
});