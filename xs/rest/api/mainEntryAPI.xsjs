const SystemSetting = $.import("sap.ino.xs.xslib", "systemSettings");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper"); 

var returnInf = {},
	oReq, JSONstr;
if (!SystemSetting.isUnderMaintenance()) {
	try {
		oReq = $.import("sap.ino.xs.rest.api", "util").parseJSON();
	} catch (e) {
		$.response.status = 400;
		returnInf.RESULT = "E";
		returnInf.MESSAGES = [{
			"STATUS": "Please check  Specification of parameters"
        	}];
		JSONstr = JSON.stringify(returnInf, null, 4);
		$.response.contentType = "applition/json";
		$.response.setBody(JSONstr);
	}

	if (oReq.method) {
		try {
			var method = oReq.method;
			var str = oReq.method.split("_");
			var object = str[0];
			var url = "sap.ino.xs.rest.api.object." + object;
			var main = $.import(url, method);
			main[method](oReq, returnInf);
		} catch (e) {
		    TraceWrapper.log_exception(e);
			$.response.status = 400;
			returnInf.RESULT = "E";
			returnInf.MESSAGES = [{
				"STATUS": "Please check the method you indicated if supported or not "
        	}];
			JSONstr = JSON.stringify(returnInf, null, 4);
			$.response.contentType = "applition/json";
			$.response.setBody(JSONstr);
		}
	}
} else {
	$.response.status = 503;
	returnInf.RESULT = "E";
	returnInf.MESSAGES = [{
		"STATUS": "System is under maintenance, please contact your system admin"
	}];
	JSONstr = JSON.stringify(returnInf, null, 4);
	$.response.contentType = "applition/json";
	$.response.setBody(JSONstr);
}