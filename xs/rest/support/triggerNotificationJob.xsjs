$.import("sap.ino.xs.xslib", "traceWrapper")
.wrap_request_handler(function() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);

    var sResponse = "";
    try {
    	var procedure = hq.procedure("SAP_INO", "sap.ino.db.notification::p_notification_service");
    	procedure.execute({});
    	conn.commit();
    } catch(e) {
        sResponse = e.toString();
    }

    $.response.contentType = "text/plain";
    $.response.setBody(sResponse);
    $.response.status = $.net.http.OK;
});