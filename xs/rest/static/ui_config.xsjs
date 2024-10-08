// This service bundles access to configuration data the user interface needs for bootstrapping
// It only contains user context independent data so that the configuration part may be cached

var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var AOFRestDispatcher = $.import("sap.ino.xs.aof.rest", "dispatcher");
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

var aStyleFile = ["style.css"];

var _handleRequest = function() {
    var oHQ = hQuery.hQuery(oConn);
    var oResult = {
        urlWhitelist : [],
        systemSettings : {},
        systemDefaultLanguage : undefined,
        applicationObjects : {},
        customConfigurationPackage : undefined,
        inconsistentPackages : []
    };

    oResult.setupCompleted = !systemSettings.isUnderMaintenance();
    oResult.systemMessage = systemSettings.systemMessage();

    oResult.urlWhitelist = oHQ.statement('select * from "sap.ino.db.basis.ext::v_ext_url_whitelist"').execute();
    oResult.ideaStatus = oHQ.statement('select * from "sap.ino.db.idea.ext::v_ext_status"').execute();
    oResult.systemSettings = _.indexBy(oHQ.statement('select * from "sap.ino.db.basis.ext::v_ext_system_setting"')
            .execute(), 'CODE');
    var aDefaultLang = oHQ.statement('select * from "sap.ino.db.basis.ext::v_ext_system_default_language"').execute();
    if (aDefaultLang && aDefaultLang.length === 1) {
        oResult.systemDefaultLanguage = aDefaultLang[0].ISO_CODE;
    }
    var aConfigPackage = oHQ.statement('select * from "sap.ino.db.config.ext::v_ext_config_content_package"').execute();
    if (aConfigPackage && aConfigPackage.length === 1) {
        oResult.customConfigurationPackage = aConfigPackage[0].PACKAGE_ID;
    }
    oResult.inconsistentPackages = _.pluck(oHQ.statement('select package_id from "sap.ino.db.basis.ext::v_ext_inconsistent_package_extension"').execute(), 'PACKAGE_ID');

    oResult.applicationObjects = AOFRestDispatcher.getDefaultReverseDefinition();

    oResult.styles = [];    
    var sAppName = $.request.parameters.get("appName");
    if (sAppName) {
        if (!(TraceWrapper.has_debug_authorization() && $.request.parameters.get("disableExtensions"))) {
            // Styles
            var aPackage = oHQ.statement('select EXT_PACKAGE_ID from "sap.ino.db.basis::t_package_extension" where base_package_id = ? and LAYER >= 0 order by LAYER asc').execute(sAppName + ".styles");
            if (aPackage && aPackage.length > 0) {
                _.each(aPackage, function (oPackage) {
                    var sPath = "/" + oPackage.EXT_PACKAGE_ID.replace(/\./g, "/"); 
                    _.each(aStyleFile, function (sStyleFile) {
                        oResult.styles.push(sPath + "/" + sStyleFile);  
                    });
                });
            }        
            // Component
            aPackage = oHQ.statement('select top 1 EXT_PACKAGE_ID from "sap.ino.db.basis::t_package_extension" where base_package_id = ? and LAYER >= 0 order by LAYER desc').execute(sAppName);
            if (aPackage && aPackage.length > 0) {
                oResult.componentName = aPackage[0].EXT_PACKAGE_ID;
            }
        }
        // Strip SAP NGUI location for default component
        if (!oResult.componentName && sAppName.indexOf("sap.ino.ngui.") === 0) {
            oResult.componentName = sAppName.substring(13);     
        }
    }
    oResult.gamificationSetting = undefined;
    var oGamificationSetting = oHQ.statement('select ENABLE_GAMIFICATION,ENABLE_LEADERBOARD,PUBLISH_BADGE from "sap.ino.db.gamification::t_gamification_setting"').execute();
    if(oGamificationSetting && oGamificationSetting.length > 0){
        oResult.gamificationSetting = oGamificationSetting[0];
    }
    
    $.response.status = $.net.http.OK;
    $.response.contentType = "application/json";
    //$.response.cacheControl = "public, max-age=3600";
    $.response.headers.set("Last-Modified", new Date().toGMTString());
    $.response.setBody(JSON.stringify(oResult));
};

TraceWrapper.wrap_request_handler(function() {
    return _handleRequest();
});
