const checkPackageSecurity = $.import("sap.ino.xs.xslib", "checkPackageSecurity");
const textBundle = $.import("sap.ino.xs.xslib", "textBundle");

var setApplicationContent = function() {
	$.response.cacheControl = "no-cache, no-store";
	$.response.contentType = "text/html";
	$.response.status = $.net.http.OK;
	$.response.setBody($.import("sap.ino.ui.backoffice", "index").getApplication());
};

if ($.session.getUsername()) {
	this.setApplicationContent();
} else {
	var bIsSamlSecured = checkPackageSecurity.check("sap.ino.ui.backoffice", "SAML");
	$.response.cacheControl = "no-cache, no-store";
	$.response.contentType = "text/html";
	$.response.status = $.net.http.SEE_OTHER;
	if (bIsSamlSecured) {
		$.response.headers.set("Location", "/sap/ino/ui/backoffice/blank.xsjs");
	} else {
		$.response.headers.set("Location", "/sap/ino/ui/backoffice/login.xsjs");
	}
}