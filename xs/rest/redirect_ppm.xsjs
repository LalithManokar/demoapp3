var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.xs.rest.redirect_ppm';

function debug(line) {
	trace.error(whoAmI, line);
}

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

function _forwardRequest(oRequest, oResponse) {
	var iMethod = oRequest.method;
	var sQueryPath = oRequest.queryPath;

	var aSplitPath = sQueryPath.split("/");
	var sPathTail = aSplitPath.pop();
	var bTraceActive = (sPathTail.indexOf("trace") === 0);
	if (bTraceActive) {
		sQueryPath = aSplitPath.join('/');
	}

	var aParameters = oRequest.parameters;
	debug('Request Parameters: ' + JSON.stringify(aParameters));
	var aHeaders = oRequest.headers;
	debug('Request Headers: ' + JSON.stringify(aHeaders));

	if (iMethod !== $.net.http.GET) {
		oResponse.status = $.net.http.METHOD_NOT_ALLOWED;
		oResponse.contentType = ContentType.Plain;
		oResponse.setBody("Method not supported");
		return undefined;
	} else {
		var sPath = sQueryPath;
		var oPPMResponse = _sendRequest(sPath, aParameters, aHeaders);
		oResponse.setBody(oPPMResponse.body.asString());
		var sContentType = oPPMResponse.headers.get("Content-Type");
		oResponse.headers.set("Content-Type", sContentType);
		debug('Response Headers: ' + JSON.stringify(oPPMResponse.headers));
		return oPPMResponse.body.asString();
	}
}

function _getPPMDestination() {
	return $.net.http.readDestination("sap.ino.xs.rest", "ppm");
}

function _sendRequest(sPath, aParameters, aHeaders) {
	var oHttpClient = new $.net.http.Client();
	var oDest = _getPPMDestination();
	debug('Destination: ' + JSON.stringify(oDest));
	debug('Request Path: ' + sPath);
	var oRequest = new $.net.http.Request($.net.http.GET, sPath);
	var i = 0;
	for (i = 0; i < aParameters.length; i++) {
		debug(aParameters[i].name + ': ' + aParameters[i].value);
		oRequest.parameters.set(aParameters[i].name, aParameters[i].value);
	}
	oRequest.headers.set("accept", aHeaders.get("accept"));
	oRequest.headers.set("accept-language", aHeaders.get("accept-language"));
	oRequest.headers.set("accept-encoding", aHeaders.get("accept-encoding"));
	debug('Before Request Headers: ' + JSON.stringify(oRequest.headers));
	var oResponse = oHttpClient.request(oRequest, oDest).getResponse();
	debug('After Request Headers: ' + JSON.stringify(oRequest.headers));
	return oResponse;
}

$.import("sap.ino.xs.xslib", "traceWrapper")
	.wrap_request_handler(function() {
		return _forwardRequest($.request, $.response);
	});