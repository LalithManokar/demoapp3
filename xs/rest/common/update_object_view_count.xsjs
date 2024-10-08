// This service bundles access to user information the user interface needs for bootstrapping
// It is implemented as separate service (companion to ui_config.xsjs) to allow caching the 
// config

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
const trackingLog = $.import("sap.ino.xs.xslib", "trackingLog");

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
     var oBody;
	if (req.body) {
		oBody = JSON.parse(req.body.asString());
		
		//TraceWrapper.log_exception(oBody);
		//oBody = req.body; 
		//sEventType(CAMPAIGN,IDEA), iId, sUserName,oHQ
		var sObjectType = oBody.OBJECT_TYPE,iObjectId = oBody.OBJECT_ID,sUserName = oBody.USER_NAME; 
		if(sObjectType === "CAMPAIGN" || sObjectType === "IDEA" || sObjectType === "WALL" ){
		trackingLog.onTrackViewLog(sObjectType,iObjectId,sUserName,oHQ);
		}
	}		
	} catch (e) {
		oMessage.type = "E";
		oMessage.message = e.message;
	} finally {
	    oMessage.type = "S";
	    oMessage.message = "Log Successfully";
		oConnection.commit();
		oConnection.close();
	}

	if (oMessage.type === 'E') {
		res.status = $.net.http.ACCEPTED;
		res.contentType = ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));
	} else {
		res.status = $.net.http.OK;
		res.contentType =  ContentType.JSON;
		res.setBody(JSON.stringify(oMessage));
	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});