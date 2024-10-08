var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");

TraceWrapper.wrap_request_handler(function() {
	var sLocale = $.request.parameters.get("LOCALE");
	var sObject = $.request.parameters.get("OBJECT");
	var sPseudo = $.request.parameters.get("PSEUDO");
    sLocale = htmlEntityDecode.decode(sLocale);
    sObject = htmlEntityDecode.decode(sObject);
    sPseudo = htmlEntityDecode.decode(sPseudo);
	$.response.headers.set("Last-Modified", new Date().toGMTString());
	$.response.contentType = "text/plain";
	$.response.status = $.net.http.OK;
	$.response.setBody("");

	if (sObject === "moduletexts") {
		var sTextBundle = TextBundle.getTextBundle("\"SAP_INO\".\"sap.ino.db.basis::t_text_module_t\"", "TEXT_MODULE_CODE", "TEXT_MODULE",
			"LANG", sLocale, undefined, !!sPseudo);

		var AOF = $.import("sap.ino.xs.aof.core", "framework");
		var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
		var oHQ = AOF.getHQ();
		var sTermCode = SystemSettings.getValue("sap.ino.config.TERMS_AND_CONDITIONS_TEXT", oHQ) || undefined;
		
		var sSelectTerm, aTermModule, sTermChangedAt; 
		if (sTermCode) {
			sSelectTerm = 'select * from "sap.ino.db.basis::t_text_module_stage" where code = ?';
			aTermModule = oHQ.statement(sSelectTerm).execute(sTermCode);
			sTermChangedAt = aTermModule.length > 0 ? aTermModule[0].CHANGED_AT : undefined;
		}

		sTextBundle = sTextBundle + 'sap.ino.config.TERM_CODE=' + sTermCode + '\n';
		sTextBundle = sTextBundle + 'sap.ino.config.TERM_CHANGED_AT=' + sTermChangedAt;
		$.response.setBody(htmlEntityDecode.decode(sTextBundle));
	} else {
		$.response.cacheControl = "public, max-age=86400";
		var sExtensibleTextBundle = TextBundle.getExtensibleTextBundle(sObject, sLocale, undefined, !!sPseudo);
		if (sExtensibleTextBundle === "") {
			$.response.status = $.net.http.NOT_FOUND;
		} else {
			$.response.setBody(htmlEntityDecode.decode(sExtensibleTextBundle));
		}
	}
});