$.import("sap.ino.xs.xslib", "traceWrapper")
.wrap_request_handler(function() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
    const notificationMail = $.import("sap.ino.xs.xslib", "notificationEmail");

    var sResponse = "";
    try {    
        notificationMail.execute(hq, conn);
    } catch(e) {
        sResponse = e.toString();
    }

    $.response.contentType = "text/plain";
    $.response.setBody(sResponse);
    $.response.status = $.net.http.OK;
});