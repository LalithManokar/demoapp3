$.import("sap.ino.xs.xslib", "traceWrapper")
.wrap_request_handler(function() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
    hq.setSchema('SAP_INO');
    var result = hq.statement("select 'pong' as pong from dummy").execute()[0].PONG;

    $.response.contentType = "text/plain";
    $.response.setBody(result);
    $.response.status = $.net.http.OK;
});
