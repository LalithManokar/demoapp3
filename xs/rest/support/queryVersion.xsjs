$.import("sap.ino.xs.xslib", "traceWrapper")
.wrap_request_handler(function() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
    hq.setSchema('SAP_INO');
    var result = hq.statement(
        "SELECT "+
        "    'HCO_INO: ' || du.version || '.' ||  du.version_sp || '.' || du.version_patch "+
        "||  ', DB Version: ' ||  db.version as VERSIONINFO "+
        "FROM "+
        "    SYS.M_DATABASE           as db, "+
        '    _SYS_REPO.DELIVERY_UNITS as du '+
        "WHERE "+
        "    delivery_unit = 'HCO_INO'"
    ).execute()[0].VERSIONINFO;

    $.response.contentType = "text/plain";
    $.response.setBody(result);
    $.response.status = $.net.http.OK;
});
