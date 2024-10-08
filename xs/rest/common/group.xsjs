const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

TraceWrapper.wrap_request_handler(function(){
    var iUserId =  $.request.parameters.get("id");
    var sSelect = "select group_member.GROUP_ID from \"sap.ino.db.iam::t_identity_group_member\" as group_member " +
                "inner join \"sap.ino.db.iam::v_group_attribute\" as group_attribute on group_member.group_id = group_attribute.group_id where member_id = ? and group_attribute.is_public = 1";
    
    var result = oHQ.statement(sSelect).execute(iUserId);
    
    var oResponse = { status: $.net.http.OK, body: result};
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(JSON.stringify(oResponse.body));
});