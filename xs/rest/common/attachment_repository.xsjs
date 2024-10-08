var trace = $.import("sap.ino.xs.xslib", "trace");
var traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var attachmentRepository = $.import("sap.ino.xs.xslib", "attachment_repository");

traceWrapper.wrap_request_handler(function() {
    var aEntities = $.request.entities;
    
    if ($.request.method === $.net.http.POST || 
            ($.request.method === $.net.http.PUT && $.request.entities && $.request.entities.length > 0)) {
        var oResult = attachmentRepository.storeAttachment(aEntities);
        
        var sBody = "<html><head></head><body>";
        if(oResult && oResult.MESSAGES && oResult.MESSAGES.length > 0) {
            sBody += "[400]:";
        } else {
            sBody += "[200]:";
        }
        sBody += JSON.stringify(oResult);
        sBody += "</body></html>";
    
        $.response.status = $.net.http.OK;
        $.response.contentType = "text/html";
        $.response.setBody(sBody); 
    } else if ($.request.method === $.net.http.DEL) {
        var sFilename = $.request.parameters.get("FILENAME");
        var sMediaType = $.request.parameters.get("MEDIATYPE");

        var oResultDelete = attachmentRepository.deleteAttachment(sFilename, sMediaType);

        if(oResultDelete && oResultDelete.MESSAGES && oResultDelete.MESSAGES.length > 0) {
            $.response.status = $.net.http.BAD_REQUEST;
        } else {
            $.response.status = $.net.http.OK;
        }

        $.response.contentType = "text/html";
        $.response.setBody(JSON.stringify(oResultDelete)); 
    }
});