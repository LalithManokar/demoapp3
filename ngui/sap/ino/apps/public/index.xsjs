const checkPackageSecurity = $.import("sap.ino.xs.xslib","checkPackageSecurity");
const textBundle = $.import("sap.ino.xs.xslib","textBundle");

const sApplication = $.request.parameters.get("sap-ino-origin");

var setApplicationContent = function() {
    $.response.cacheControl = "no-cache, no-store";
    $.response.contentType = "text/html";
    $.response.status = $.net.http.OK;
    $.response.setBody($.import("sap.ino.ngui.sap.ino.apps.ino","index").getApplication());
};
var setStartupContent = function() {
    $.response.cacheControl = "no-cache, no-store";
    $.response.contentType = "text/html";
    $.response.status = $.net.http.OK;
    $.response.setBody(
        "<!doctype html>\n\
        <html>\n\
          <head>\n\
            <meta charset=\"utf-8\">\n\
            <script>\n\
                var sBaseUrl = window.location.protocol + \"//\" + window.location.host;\n\
                if(window.location.hash){\n\
                    window.location = sBaseUrl + \"/sap/ino/ngui/sap/ino/apps/ino/blank.xsjs?sap_inm=\"+window.location.hash.substr(1)\n\
                }else{\n\
                    window.location = sBaseUrl + \"/sap/ino/ngui/sap/ino/apps/ino/blank.xsjs\"\n\
                }\n\
            </script>\n\
          </head>\n\
          <body style=\"height: 100%;width: 100%;position: fixed;text-align: center\">\n\
          </body>\n\
        </html>");
};


if($.session.getUsername()) {
    this.setApplicationContent();
} else {
    var bIsSamlSecured = checkPackageSecurity.check("sap.ino.ngui.sap.ino.apps.ino", "SAML");
    if(bIsSamlSecured) {
        this.setStartupContent();
    } else {
       $.response.cacheControl = "no-cache, no-store";
        $.response.contentType = "text/html";
        $.response.status = $.net.http.SEE_OTHER;
        $.response.headers.set("Location", "/sap/ino/ngui/sap/ino/apps/ino/login.xsjs");
    }
}


