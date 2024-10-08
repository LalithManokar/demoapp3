$.import("sap.ino.xs.xslib", "hQuery");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var auth = $.import("sap.ino.xs.aof.core", "authorization");

function getAttachmentId() {
	var queryPath = $.request.queryPath;
	if (queryPath) {
		var queryPathParts = queryPath.split(/[/@]+/) || [];
		if (queryPathParts.length >= 1 && !isNaN(queryPathParts[0])) {
			var id = parseInt(queryPathParts[0]);
			return id;
		}
	}
	return 0;
}

function processRequest(sAttachmentViewName) {
	if ($.request.method == $.net.http.GET) {
		TraceWrapper
			.wrap_request_handler(function() {
				var found = false;
				var attachmentId = getAttachmentId();
				if (attachmentId > 0) {

					var conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
					var hq = $.sap.ino.xs.xslib.hQuery.hQuery(conn);
					hq.setSchema("SAP_INO");

					// var attachmentAuthor = hq
					//         .statement("select identity.user_name from\"sap.ino.db.attachment::t_attachment\" as attachment inner join\"sap.ino.db.iam::t_identity\" as identity on attachment.created_by_id = identity.id where attachment.id = ?");
					// var author = attachmentAuthor.execute(attachmentId);
					// if(author.length > 0){
					//     auth.setApplicationUser(author[0].USER_NAME);
					// }

					var compressed_type_list = ['SMALL', 'LARGE'];
					var compressed_type = ($.request.parameters.get("type") || '').toUpperCase();
					var data_field_name = compressed_type_list.indexOf(compressed_type) >= 0 ? 'DATA_' + compressed_type : 'DATA';
					var attachment = hq
						.statement("select MEDIA_TYPE, FILE_NAME, DATA, DATA_SMALL, DATA_LARGE from \"" + sAttachmentViewName + "\" where id = ?");
					/*
					 * Execute Raw does not return a JSON-Object, but the Result-Set of the SQL execute The Result-Set
					 * is used in the setBody function of $.response, passing the Result-Set and the index of the
					 * column, the binary data resides. In that way the binary data does not have to be materialized in
					 * the Javascript engine.
					 */
					var result = attachment.execute(attachmentId);

					if (result && result.length === 1) {
						$.response.contentType = result[0].MEDIA_TYPE;

						// Make it cacheable for 1 year (which is the maximum HTTP standard recommend)
						// $.response.cacheControl = "public, max-age=31536000";
						// $.response.headers.set("Last-Modified", new Date().toGMTString());

						// INM-291: add cache for image resources only for a year
						if (result[0].MEDIA_TYPE.startsWith('image/')) {
							$.response.cacheControl = "private, max-age=31536000";
						} else {
							$.response.cacheControl = "no-cache, no-store, must-revalidate";
						}
						$.response.headers.set("Content-Disposition",
							"attachment; filename=\"" + result[0].FILE_NAME + "\";");
						var data = result[0][data_field_name];
						if (!data) {
							data = result[0].DATA;
						}
						$.response.setBody(data);
						$.response.status = $.net.http.OK;
						found = true;
					}
				}

				if (!found) {
					// INM-291,BCP-1880716176: remove cache for non found resources
					$.response.cacheControl = "no-cache, no-store, must-revalidate";
					$.response.contentType = "plain/text";
					$.response.setBody("Not found");
					$.response.status = $.net.http.NOT_FOUND;
				}
			});
	} else if ($.request.method == $.net.http.PUT) {
		$.response.cacheControl = "no-cache, no-store, must-revalidate";
		$.response.contentType = "plain/text";
		$.response.setBody("Updated");
		$.response.status = $.net.http.OK;
	} else {
		$.response.contentType = "plain/text";
		$.response.setBody("Unknown Action");
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	}
}