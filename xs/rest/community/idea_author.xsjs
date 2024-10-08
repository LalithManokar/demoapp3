const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const ideaFilterPhase = $.import("sap.ino.xs.xslib", "ideaFilterPhase");

TraceWrapper.wrap_request_handler(function(){
	var operator = $.import("sap.ino.xs.xslib.idea", "authorOperators");
	if ($.request.method !== $.net.http.POST) {
		$.response.status = 405;
		return;
	}
	var execute = $.request.queryPath;
	var actions = ["getAuthorList", "preCheck", "changeAuthor"];
	if (actions.indexOf(execute) < 0) {
		$.response.status = 403;
		return;
	}
	if (!$.request.body) {
		$.response.status = 400;
		return;
	}
	try {
		var reqBody = JSON.parse($.request.body.asString());
		var result = operator[execute](reqBody);

		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(result, null, 4));
	} catch (e) {
		$.response.status = 500;
		$.response.setBody("MSG_CHANGE_AUTHOR_APPLICATION_ERROR");
	}
});