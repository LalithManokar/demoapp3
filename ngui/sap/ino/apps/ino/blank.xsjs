$.response.cacheControl = "no-cache, no-store";
$.response.contentType = "text/html";
$.response.status = $.net.http.SEE_OTHER;
var hasher = [];

var login = $.import("sap.ino.xs.object.iam", "login");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = hQuery.hQuery(oConn);
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

function updateUserInfo(oSession) {
	var oResponse = {};
	if (oSession) {
		try {
			oResponse = login.samlLoginUpdateUserInfo($.session, oHQ);
		} catch (e) {
			oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
			oResponse.body = e.message;
			TraceWrapper.log_exception(e);
		}
		if (oResponse && (oResponse.status === $.net.http.INTERNAL_SERVER_ERROR || oResponse.status === $.net.http.FORBIDDEN)) {
			$.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
			$.response.contentType = "application/json";
			$.response.status = oResponse.status;
			return false;
		} else if (!oResponse) {
			return false;
		} else {
			return true;
		}

	}
}

if ($.request.parameters && $.request.parameters.length > 0) {
	for (var i = 0; i <= $.request.parameters.length - 1; i++) {
		if ($.request.parameters[i].name === "sap_inm") {
			hasher.unshift($.request.parameters[i].value);
		} else {
			hasher.push($.request.parameters[i].name + "=" + encodeURIComponent($.request.parameters[i].value));
		}
	}
	if (updateUserInfo($.session)) {
		$.response.headers.set("Location", "/sap/ino/#" + hasher.join("&"));
	}
} else {
	if (updateUserInfo($.session)) {
		$.response.headers.set("Location", "/sap/ino/");
	}
}