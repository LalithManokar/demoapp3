$.response.cacheControl = "no-cache, no-store";
$.response.contentType = "text/html";
$.response.status = $.net.http.OK;
$.response.setBody(buildHtml());

function buildHtml() {
	var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
	var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
	var oHQ = hQuery.hQuery(oConn);	
	var sSql = `SELECT TOP 2 CODE, VALUE FROM "sap.ino.db.basis.ext::v_ext_system_setting"  
    WHERE (CODE = 'sap.ino.config.DEFAULT_SYSTEM_CDN_ACTIVE' AND VALUE = '1') 
    OR (CODE='sap.ino.config.DEFAULT_CDN_LINK_UI5_LIB_VERSION')
    `;
	var oSystemSetting = oHQ.statement(sSql).execute();

	var sContent =
		`
<!DOCTYPE HTML>
<html> <!-- lang is set dynamically -->
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <link rel="shortcut icon" href="img/SAP_Innovation_Management.ico"/>
    <title>SAP Innovation Management</title>
    <script   src="`;
	if (oSystemSetting && oSystemSetting.length > 0 && _.findWhere(oSystemSetting, {
		"CODE": "sap.ino.config.DEFAULT_SYSTEM_CDN_ACTIVE"
	})) {
        sContent += _.findWhere(oSystemSetting,{"CODE":"sap.ino.config.DEFAULT_CDN_LINK_UI5_LIB_VERSION"}).VALUE;
	} else {
		sContent += "/sap/ino/ui/ui5/resources/sap-ui-core.js";
	}
	sContent +=
		`" id="sap-ui-bootstrap"
        	data-sap-ui-libs="sap.ui.commons,sap.ui.table,sap.ui.ux3,sap.ui.richtexteditor,sap.m,sap.viz,sap.ui.unified"
        	data-sap-ui-theme="sap_bluecrystal"
        	data-sap-ui-frameOptions="deny">
    </script>
    <script src="bootstrap_dev.js"></script>
</head>
<body role="application" class="sapUiBody sapUiSizeCompact">
	<div id="content"></div>
</body>
</html>
    `;
	return sContent;
}