function getApplication() {
    var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
	var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
	var oHQ = hQuery.hQuery(oConn);
	var sSql = `SELECT TOP 2 CODE, VALUE FROM "sap.ino.db.basis.ext::v_ext_system_setting"  
    WHERE (CODE = 'sap.ino.config.DEFAULT_SYSTEM_CDN_ACTIVE' AND VALUE = '1') 
    OR (CODE='sap.ino.config.DEFAULT_CDN_LINK_UI5_LIB_VERSION')
    `;
	var oSystemSetting = oHQ.statement(sSql).execute();

    var sContent = "<!DOCTYPE HTML>" +
        "<html>" +
            "<!-- Copyright (c) 2016 SAP AG, All Rights Reserved -->" +
            "<head>" +
                "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />" +
                "<meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\"/>" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" +
                "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">" +
                "<meta name=\"mobile-web-app-capable\" content=\"yes\">";
                sContent += "<meta name=\"google\" content=\"notranslate\" />";
            sContent +="<link rel=\"shortcut icon\" href=\"/sap/ino/ngui/sap/ino/assets/img/SAP_Innovation_Management.ico\"/>" +
                "<title>SAP Innovation Management Installation</title>" +
            "</head>" +
            "<!-- UI Content -->" +
            "<body role=\"application\" class=\"sapUiBody\">" +
            "<div data-sap-ui-component data-name=\"sap.ino.installation\" data-id=\"container\" data-settings='{\"id\" : \"installation\"}'></div>" + 
            "<div id=\"content\">" +
                "<div id=\"splashscreen\"></div>" +
        	"</div>" +
            "</body>" +
            "<script type=\"text/javascript\">" +
                "document.getElementById(\"splashscreen\").style.height = window.innerHeight + \"px\";" +
                "document.getElementById(\"splashscreen\").style.margin = \"-20px 0 0 0\";" +
                "document.getElementById(\"splashscreen\").style.background = \"no-repeat 50% 45% / 200px auto url('data:image/png;base64,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')\";" +
            "</script>" +
            "<!--  Bootstrap the UI5 core library -->" +
            "<script id=\"sap-ui-bootstrap\" src=\"";
            	if (oSystemSetting && oSystemSetting.length > 0 && _.findWhere(oSystemSetting, {
            		"CODE": "sap.ino.config.DEFAULT_SYSTEM_CDN_ACTIVE"
            	})) {
                    sContent += _.findWhere(oSystemSetting,{"CODE":"sap.ino.config.DEFAULT_CDN_LINK_UI5_LIB_VERSION"}).VALUE;
            	} else {
            		sContent += "/sap/ino/ui/ui5/resources/sap-ui-core.js";
            	}
                sContent +=  "\" data-sap-ui-theme=\"sap_belize\" " +
                "data-sap-ui-xx-bindingSyntax=\"complex\" " +
                "data-sap-ui-async=\"true\" "  +
                "data-sap-ui-compatVersion=\"edge\" " +
                "data-sap-ui-resourceroots='{\"sap.ino.installation\" : \"./\"}' " + 
                "data-sap-ui-oninit=\"module:sap/ui/core/ComponentSupport\" " + 
                "data-sap-ui-frameOptions=\"deny\" " +
                "data-sap-ui-versionedLibCss=\"true\">" +
            "</script>" + 
            "<script type=\"text/javascript\">" +
                "var gSAPInoAppName = \"sap.ino.installation\";" +
            "</script>";

//     if(bDevelopment) {
//         sContent += 
// 				"<!-- resourceroots is overwritten in the component -->" +
// 				"<script src=\"/sap/ino/installation/bootstrap.js\"></script>";
// 	} 
	sContent += 
	       // "<script type=\"text/javascript\">" +
	       //     "$.ajaxSetup({beforeSend: function(event, settings){var path = this.url && this.url.split('/');if(this.type === 'GET' && ~path.indexOf('corelib')){ settings.url += '?v=" + version + "'}}});" +
        //         "sap.ui.getCore().attachInitEvent(function() {";
        //         // if(!bDevelopment) {
        //         //     sContent += 
        //         //     "jQuery.sap.registerModulePath(\"sap.ino.corelib\", \"/sap/ino/ngui/build/resources/sap/ino/corelib\");" +
        //         //     "jQuery.sap.registerResourcePath(\"sap.ino.corelib\", \"/sap/ino/ngui/build/resources/sap/ino/corelib\");" +
        //         //     "sap.ui.getCore().loadLibrary(\"sap.ino.corelib\");";
        //         // }
        //             sContent +=  
        //             // "jQuery.sap.require(\"sap.ino.commons.application.Configuration\");" +
        //             // "sap.ino.commons.application.Configuration.getBackendConfiguration();" +
        //         	"var fnContentDensityClass = function() {" +
        //                 "if (sap.ui.Device.system.desktop || !sap.ui.Device.support.touch) {" +
        //                     "return \"sapUiSizeCompact\";" +
        //                 "} else {" +
        //                     "return \"sapUiSizeCozy\";" +
        //                 "}" +
        //             "};" +
        //             "jQuery(\"body\").addClass(fnContentDensityClass());" +
        //             "var oView = sap.ui.xmlview({" +
        //                 "id : \"sap-ino-main\"," +
        //                 "viewName : \"App\"" +
        //             "});" +
        //             "/* setTimeout => avoid rendering of app with wrong icon font */" +
        //             "setTimeout(function() {" +
        //                 "oView.placeAt(\"content\");" +
        //             "}, 0);" +
        //         "});" +
        //     "</script>" +
        
//         	"<script type=\"text/javascript\">"
// 	+"sap.ui.getCore().attachInit(function () {"
// 			+ "sap.ui.require([\"sap/ui/core/ComponentContainer\"], function (ComponentContainer) {"
// 						// initialize the UI component
// 	       + "var oComp = sap.ui.getCore().createComponent({"+
// 			        "name: \"sap.ino.installation\", " +
// 			        "id: \"myAppComponent\"" + 
// 			    "});" +
				
// 				"var oCompCont = new ComponentContainer({" + 
// 						"component:oComp,"+
// 						"height:\"100%\" " +
// 				"});" +
// 				"oCompCont.placeAt(\"content\");" +
// 		"});" +
// 		"});"+
//  "</script>" +
        
        
        
            "<style>" +
                "/* disable scrolling of the body at any time (must be last, otherwise splashscreen is not shown)*/" +
                "body {" +
                    "position: fixed !important;" +
                "}" +
            "</style>" +
        "</html>";
	return sContent;
}