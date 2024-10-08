var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

TraceWrapper.wrap_request_handler(function() {
	var installer = $.import("sap.ino.xs.rest.installation", "installation");
	if ($.request.method !== $.net.http.POST) {
		$.response.status = 405;
		return;
	}
	var execute = $.request.queryPath;
	var actions = ["preCheck", "saveSetting", "getSettingInfo", "createUser", "runNewConfig", "checkRestartDB", "runConfig",
		"setSystemConfig", "setSqlcc", "setApplicationConfig", "setSystemTimeout", "setSystemCache", "revokeTimeout", "cancelTimeout"];
	if (actions.indexOf(execute) < 0) {
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify({
			success: false,
			msg: "wrong url."
		}, null, 4));
		return;
	}
	if (!$.request.body) {
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify({
			success: false,
			msg: "wrong body."
		}, null, 4));
		return;
	}
	try {
		var reqBody = JSON.parse($.request.body.asString());
		var result = installer[execute](reqBody);

		$.response.contentType = "application/json";
		$.response.status = 200;
		$.response.setBody(JSON.stringify(result, null, 4));
	} catch (e) {
		$.response.status = 500;
		$.response.setBody(e.toString());
	}
});