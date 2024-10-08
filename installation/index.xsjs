const checkPackageSecurity = $.import("sap.ino.xs.xslib", "checkPackageSecurity");
const textBundle = $.import("sap.ino.xs.xslib", "textBundle");

const sApplication = $.request.parameters.get("sap-ino-origin");

var setApplicationContent = function() {
	$.response.cacheControl = "no-cache, no-store";
	$.response.contentType = "text/html";
	$.response.status = $.net.http.OK;
	$.response.setBody($.import("sap.ino.installation", "index").getApplication());
};

if ($.session.getUsername()) {
	this.setApplicationContent();
} else {
	$.response.cacheControl = "no-cache, no-store";
	$.response.contentType = "text/html";
	$.response.status = $.net.http.SEE_OTHER;
	$.response.headers.set("Location", "/sap/ino/ngui/sap/ino/apps/ino/login.xsjs");
}