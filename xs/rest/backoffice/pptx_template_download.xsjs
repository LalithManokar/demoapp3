var traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

var attachmentRepository = $.import("sap.ino.xs.xslib", "attachment_repository");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");

traceWrapper.wrap_request_handler(function() {
    if ($.request.method !== $.net.http.GET) {
        $.response.contentType = "text/plain";
        $.response.setBody('');
        $.response.status = $.net.http.NOT_FOUND;
    } else {
        $.response.contentType = "plain/text";
        $.response.setBody("Not found");
        $.response.status = $.net.http.NOT_FOUND;
        
        var sFileName = $.request.parameters.get("FILENAME") || $.request.parameters.get("FILE_NAME");
        sFileName = htmlEntityDecode.decode(sFileName);
        
        if(!sFileName) {
            return;
        }
        
        var aTemplateData = oHQ.statement('select * from "sap.ino.db.attachment.ext::v_ext_repository_powerpoint" where file_name = ?').execute(sFileName);
        if(aTemplateData.length === 0) {
            return;
        }
        
        var oTemplateData = aTemplateData[0];
        var oAttachment = attachmentRepository.readAttachment(oTemplateData.PACKAGE_ID, sFileName, "pptx", oHQ);
        
        if(!oAttachment) {
            return;
        }
        
        $.response.contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

        $.response.headers.set("Content-Disposition",
            "Content-Disposition: attachment; filename=\"" + sFileName + "\"");
        $.response.setBody(oAttachment);
        $.response.status = $.net.http.OK;
    }
});