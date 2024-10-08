const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");
$.response.cacheControl = "no-cache, no-store";
$.response.contentType = "text/html";
$.response.status = $.net.http.MOVED_PERMANENTLY;

// sOrigin must be set as par of the target of a rewrite rule in .xsaccess to identify the original legacy URL
// Example:
//  { 
//      "source": "/ui/mobile/",
//      "target": "/ngui/sap/ino/apps/ino/legacy-redirect/redirect.xsjs?sap-ino-origin=mobile" 
//  }
var sOrigin = "?sap-ino-origin=" + $.request.parameters.get("sap-ino-origin") || "";
sOrigin = htmlEntityDecode.decode(sOrigin);
var sTarget = "&sap-ino-target=" + systemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE");
$.response.headers.set("Location", "/sap/ino/ngui/sap/ino/apps/ino/legacy-redirect/redirect.html" + sOrigin + sTarget);

$.response.setBody(
   "<!DOCTYPE HTML>\
    <html>\
        <head>\
            <title>SAP Innovation Management - Application Moved Permanently</title>\
        </head>\
        <body>\
            <h1>SAP Innovation Management - Application Moved Permanently</h1>\
        </body>\
    </html>\
");