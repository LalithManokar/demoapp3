const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
const importFunc = $.import("sap.ino.xs.rest.transport", "import");

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

var _handleRequest = function(req, res) {
	var oHQ = hQuery.hQuery(conn);
	var oMessage = {
		type: null,
		message: null,
		tables: []
	};
	var oConnection = oHQ.getConnection();
	if (req.method !== $.net.http.POST) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = ContentType.Plain;
		$.response.setBody("Method not supported");
		return;
	}
	try {
		importFunc.importData(oHQ, req, oMessage);
		if (oMessage.type === "S") {
			oConnection.commit();
		}
	} catch (e) {
		oMessage.type = "E";
		oMessage.message = oMessage.message + e.message;
		oConnection.rollback();
	} finally {
		oConnection.close();
	}

	if (oMessage.type === 'E') {
		res.status = $.net.http.ACCEPTED;
		res.contentType = ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));
	} else {
		res.status = $.net.http.OK;
		res.contentType = ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));
	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});