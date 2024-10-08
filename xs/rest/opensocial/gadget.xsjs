var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");

TraceWrapper.wrap_request_handler(function() {
    $.response.contentType = "application/xml";
    $.response.status = $.net.http.OK;
    
    var sBody = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" +
                "<Module>" +
                  "<ModulePrefs title=\"{{TITLE}}\">" +
                    "<Link rel=\"Icon\" href=\"{{ICON_URL}}/sap/ino/ui/mashup/img/SAP_Innovation_Management_S.png\"/>" +
                    "<Link rel=\"MediumIcon\" href=\"{{ICON_URL}}/sap/ino/ui/mashup/img/SAP_Innovation_Management_M.png\"/>" +
                    "<Link rel=\"LargeIcon\" href=\"{{ICON_URL}}/sap/ino/ui/mashup/img/SAP_Innovation_Management_L.png\"/>" +
                  "</ModulePrefs><Content type=\"url\" href=\"{{WIDGET_URL}}\"/>" +
                "</Module>";
    
    var sHostPort = htmlEntityDecode.decode($.request.headers.get("host"));
    var sProtocol = htmlEntityDecode.decode($.request.headers.get("clientprotocol"));
    var sLanguage = htmlEntityDecode.decode($.request.headers.get("accept-language"));
    sLanguage = sLanguage.split(",")[0];

    var sTitle;
    switch($.request.parameters.get("OBJECT")) {
        case "recentcomments":
            sTitle = TextBundle.getExtensibleTextBundleObject("uitexts", sLanguage, "MW_RCO_TIT_RECENT_COMMENTS")[0].CONTENT;
            break;
        case "topcommentators":
            sTitle = TextBundle.getExtensibleTextBundleObject("uitexts", sLanguage, "MW_TCO_TIT_TOP_COMMENTATORS")[0].CONTENT;
            break;
        case "topcontributors":
            sTitle = TextBundle.getExtensibleTextBundleObject("uitexts", sLanguage, "MW_TCO_TIT_TOP_CONTRIBUTORS")[0].CONTENT;
            break;
        case "recentideas":
        case "recentideacards":
            sTitle = TextBundle.getExtensibleTextBundleObject("uitexts", sLanguage, "MW_RID_TIT_RECENT_IDEAS")[0].CONTENT;
            break;
    }
    var aReqPara = $.request.parameters;
    var sParameter = _.reduce(aReqPara, function(memo, parameter){
            if(parameter.name === "OBJECT") {
                return memo;
            }
            if(memo === "") {
                return "?" + htmlEntityDecode.decode(parameter.name) + "=" + htmlEntityDecode.decode(parameter.value); 
            } 
            return memo + "&" + htmlEntityDecode.decode(parameter.name) + "=" + htmlEntityDecode.decode(parameter.value); 
        }, "");
    
    var sWidgetURL = sProtocol + "://" + sHostPort +
                        "/sap/ino/ui/mashup/" +
                        sParameter +
                        "#" + htmlEntityDecode.decode($.request.parameters.get("OBJECT"));
    sWidgetURL = htmlEntityDecode.decode(sWidgetURL);
                        
    var sIconURL = sProtocol + "://" + sHostPort;
    sIconURL = htmlEntityDecode.decode(sIconURL);
    
    sBody = sBody.replace("{{WIDGET_URL}}", sWidgetURL);
    sBody = sBody.replace(new RegExp("{{ICON_URL}}", "g"), sIconURL);
    sBody = sBody.replace("{{TITLE}}", sTitle);

    $.response.setBody(sBody);
});