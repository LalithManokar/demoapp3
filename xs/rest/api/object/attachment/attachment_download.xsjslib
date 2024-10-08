$.import("sap.ino.xs.xslib", "hQuery");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var util = $.import("sap.ino.xs.rest.api", "util");

function attachment_download(user, return_inf) {

	var attachmentId = user.Parameters.Attachment_ID;
	var sAttachmentViewName = "sap.ino.db.attachment::v_attachment";
	var errorMessages;
	if (util.check_type(attachmentId, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}

	var conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var hq = $.sap.ino.xs.xslib.hQuery.hQuery(conn);
	hq.setSchema("SAP_INO");

	var attachment = hq
		.statement("select MEDIA_TYPE, FILE_NAME, DATA from \"" + sAttachmentViewName + "\" where id = ?");
	var result = attachment.execute(attachmentId);

	if (result && result.length === 1) {
		$.response.contentType = result[0].MEDIA_TYPE;

		$.response.cacheControl = "public, max-age=31536000";
		$.response.headers.set("Last-Modified", new Date().toGMTString());

		$.response.headers.set("Content-Disposition",
			"attachment; filename=\"" + result[0].FILE_NAME + "\";");
		$.response.setBody(result[0].DATA);
		$.response.status = $.net.http.OK;

	} else {
		errorMessages = "The attachment_id you indicated is not found ";
		util.handlError(return_inf, user, errorMessages);
		return false;

	}

}