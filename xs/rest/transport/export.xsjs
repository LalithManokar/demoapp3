const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
const exportFunc = $.import("sap.ino.xs.rest.transport", "export");

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

var _handleRequest = function(req, res) {
	var oHQ = hQuery.hQuery(conn);
	var oMessage = {
		type: null,
		message: null
	};
	var oConnection = oHQ.getConnection();
	if (req.method !== $.net.http.POST) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = ContentType.Plain;
		$.response.setBody("Method not supported");
		return;
	}
	try {
		var oZip = exportFunc.exportData(oHQ, req, oMessage);
		if (oZip) {
			res.headers.set("Content-Disposition", "attachment; filename=\"" + "ExportConfigTables.zip" + "\";");
			res.setBody(oZip);
			res.contentType = "application/zip";
			oConnection.commit();
		} else {
			oConnection.rollback();
			res.status = $.net.http.ACCEPTED;
			res.contentType = ContentType.JSON;
			res.setBody(JSON.stringify(oMessage));
		}
	} catch (e) {
		oMessage.type = "E";
		oMessage.message = e.message;
		res.status = $.net.http.ACCEPTED;
		res.contentType = ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));
		oConnection.rollback();
	} finally {
		oConnection.close();
	}

	// 	if (oMessage.type === 'E') {
	// 		res.status = $.net.http.ACCEPTED;
	// 		res.contentType = ContentType.JSON;
	// 		res.setBody(JSON.stringify(oMessage));
	// 	} else {
	// 		res.status = $.net.http.OK;
	// 		res.contentType =  ContentType.JSON;
	// 		res.setBody(JSON.stringify(oMessage));
	// 	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});