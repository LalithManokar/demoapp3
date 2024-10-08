const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const customReports = $.import("sap.ino.xs.xslib", "customReports");

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

var _handleRequest = function(req, res) {
	var oHQ = hQuery.hQuery(conn);
	var oMessage = {
		type: null,
		message: null,
		data: null
	};
	var oConnection = oHQ.getConnection();
	if (req.method !== $.net.http.POST) {
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response.contentType = ContentType.Plain;
		$.response.setBody("Method not supported");
		return;
	}
	
	try {
      customReports.processData(oHQ, req, oMessage);
	  oConnection.commit();  
	} catch (e) {
		oMessage.type = "E";
		oMessage.message = e.message;
		oConnection.rollback();
	} finally {
		res.status = $.net.http.ACCEPTED;
		res.contentType = ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));	    
		oConnection.close();
	}

};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});