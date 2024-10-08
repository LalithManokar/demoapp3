var trace = $.import("sap.ino.xs.xslib", "trace");
var traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var notification = $.import("sap.ino.xs.xslib.sysNotifications", "notification");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;


traceWrapper.wrap_request_handler(function() {
    var sLang = $.application.language;

    var iTop = $.request.parameters.get("TOP") || 9999;
    var iSkip = $.request.parameters.get("SKIP") || 0;
    var bCountOnly = $.request.parameters.get("countOnly") === "true" || false;
    
    var body;
    try {
        body = JSON.stringify(notification.getNotifications(iTop, iSkip, sLang, bCountOnly));
    } catch (e) {
        body = JSON.stringify({
            "NOTIFICATIONS" : []
        });
    }
    
    $.response.contentType = "application/json";
    $.response.setBody(body); 
    $.response.status = $.net.http.OK;
});


//Example calls:
//select top 10 notification messages
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/notification_messages.xsjs?TOP=10