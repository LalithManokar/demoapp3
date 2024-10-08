/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.Configuration");
(function() {
    "use strict";

    sap.ui.ino.application.Configuration = {};

    var sBackendRootURL = window.location.protocol + '//' + window.location.host;
    sap.ui.ino.application.Configuration.getBackendRootURL = function() {
        return sBackendRootURL;
    };

    sap.ui.ino.application.Configuration.getAttachmentDownloadURL = function(iAttachmentId, sDefaultURL) {
        if (iAttachmentId && iAttachmentId > 0) {
            return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + 
                    sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD") + "/" + iAttachmentId;
        } else {
            if (sDefaultURL) {
                return sDefaultURL;
            }
            return null;
        }
    };

    sap.ui.ino.application.Configuration.getAttachmentTitleImageDownloadURL = function(iAttachmentTitleImageId, sDefaultURL) {
        if (iAttachmentTitleImageId && iAttachmentTitleImageId > 0) {
            return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + 
                    sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_TITLE_IMAGE_DOWNLOAD") + "/" + iAttachmentTitleImageId;
        } else {
            if (sDefaultURL) {
                return sDefaultURL;
            }
            return null;
        }
    };

    sap.ui.ino.application.Configuration.getResourceBundleURL = function(sResourceName) {
        if (sResourceName) {
            return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + 
                    sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_RESOURCE") + "/" +
                    sResourceName + ".properties";
        } else {
            return null;
        }
    };

    sap.ui.ino.application.Configuration.setBackendRootURL = function(sTheBackendRootURL) {
        sBackendRootURL = sTheBackendRootURL;
    };

    var bBackendTraceActive = !!jQuery.sap.getUriParameters().get("sap-ui-ino-backendtrace");
    sap.ui.ino.application.Configuration.isBackendTraceActive = function() {
        return bBackendTraceActive;
    };

    sap.ui.ino.application.Configuration.setBackendTraceActive = function(bActive) {
        bBackendTraceActive = bActive;
    };

    sap.ui.ino.application.Configuration.isComponentActive = function(sComponent) {
        if (this.getBackendConfiguration().systemSettings[sComponent] === undefined || isNaN(this.getBackendConfiguration().systemSettings[sComponent].VALUE)) {
            return false;
        }
        return !!parseInt(this.getBackendConfiguration().systemSettings[sComponent].VALUE, 10);
    };

    sap.ui.ino.application.Configuration.getSystemSetting = function(sKey) {
        return this.getBackendConfiguration().systemSettings[sKey] && this.getBackendConfiguration().systemSettings[sKey].VALUE;
    };

    sap.ui.ino.application.Configuration.getApplicationPath = function(sApplication) {
        return this.getBackendConfiguration().systemSettings[sApplication] && this.getBackendConfiguration().systemSettings[sApplication].VALUE;
    };

    sap.ui.ino.application.Configuration.getFullApplicationPath = function(sApplication) {
        return this.getBackendRootURL() + "/" + this.getApplicationPath(sApplication);
    };

    sap.ui.ino.application.Configuration.getApplicationObjects = function() {
        return this.getBackendConfiguration().applicationObjects;
    };

    sap.ui.ino.application.Configuration.getApplicationObject = function(sName) {
        return this.getBackendConfiguration().applicationObjects[sName];
    };

    sap.ui.ino.application.Configuration.getSystemDefaultLanguage = function() {
        return this.getBackendConfiguration().systemDefaultLanguage;
    };

    sap.ui.ino.application.Configuration.getURLWhitelist = function() {
        return this.getBackendConfiguration().urlWhitelist;
    };

    sap.ui.ino.application.Configuration.getCustomConfigurationPackage = function() {
        return this.getBackendConfiguration().customConfigurationPackage;
    };

    sap.ui.ino.application.Configuration.getInconsistentPackages = function() {
        return this.getBackendConfiguration().inconsistentPackages;
    };

    sap.ui.ino.application.Configuration.getSWABaseURL = function() {
        var sURL = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_SWA_BASE");
        if(sap.ui.ino.application.Configuration.isAbsoluteURL(sURL)){
            return sURL;
        }else{
            return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + sURL;
        }
    };
    
    sap.ui.ino.application.Configuration.getSWATrackerURL = function() {
        var sURL = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_SWA_TRACKER");
        if(sap.ui.ino.application.Configuration.isAbsoluteURL(sURL)){
            return sURL;
        }else{
            return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + sURL;
        }
    };
    
    sap.ui.ino.application.Configuration.isUsageReportingActive = function() {
        var sTrackingActive = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.SWA_ACTIVE");
        var sReportingActive = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.USAGE_REPORTING_ACTIVE");
        if(sTrackingActive === "0"){
            return false;
        } else if(sTrackingActive === "1" && sReportingActive === "0" && (this.hasCurrentUserPrivilege(
            "sap.ino.xs.rest.admin.application::execute") || this.hasCurrentUserPrivilege(
                "sap.ino.ui::camps_coach_role") || this.hasCurrentUserPrivilege(
                    "sap.ino.ui::camps_mgr_role"))){
            return true;
        } else if(sTrackingActive === "1" && sReportingActive === "1"){
            return true;
        } else {
            return false;
        }
    };
    
    sap.ui.ino.application.Configuration.getFrontofficeDefaultBackgroundImageURL = function(bIsHighContrast) {    	
        var sURL = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_BACKGROUND_IMAGE");
        if(bIsHighContrast) {
        	sURL = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_HC_BACKGROUND_IMAGE");
        }        
        return sURL;
    };
    
    sap.ui.ino.application.Configuration.getMobileSmallDefaultBackgroundImageURL = function() {    	
        return sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_MOBILE_SMALL_DEFAULT_BACKGROUND_IMAGE");
    };

    sap.ui.ino.application.Configuration.setupCompleted = function() {
        return this.getBackendConfiguration().setupCompleted;
    };
    
    sap.ui.ino.application.Configuration.systemMessage = function() {
        return this.getBackendConfiguration().systemMessage;
    };

    sap.ui.ino.application.Configuration.getXSRFToken = function() {
        return this.getBackendConfiguration().XSRFToken;
    };

    sap.ui.ino.application.Configuration.setXSRFToken = function(sToken) {
        this.getBackendConfiguration().XSRFToken = sToken;
        jQuery.ajaxSetup({
            headers : {
                "X-CSRF-Token" : sToken
            }
        });
    };

    sap.ui.ino.application.Configuration.validateXSRFToken = function(oResponse) {
        if (oResponse.status === 403) {
            var sXSRF = oResponse.getResponseHeader("x-csrf-token");
            if (sXSRF && sXSRF.toLowerCase() === "required") {
                // No longer valid -> refresh
                var sPingURL =  sap.ui.ino.application.Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/ping.xsjs";
                var oAjaxPromise = jQuery.ajax({
                    url : sPingURL,
                    headers : {
                        "X-CSRF-Token" : "Fetch"
                    },
                    type : "GET",
                    contentType : "application/json; charset=UTF-8",
                    async : false
                });
                oAjaxPromise.done(function(oResponseBody, sResponseText, oResponse) {
                    sap.ui.ino.application.Configuration.setXSRFToken(oResponse.getResponseHeader("X-CSRF-Token"));
                });
                return false;
            }
        }
        return true;
    };

    sap.ui.ino.application.Configuration.getTheme = function(bIncludePrivileges) {
        return this.getBackendConfiguration(bIncludePrivileges).theme;
    };

    sap.ui.ino.application.Configuration.getCurrentUser = function(bIncludePrivileges) {
        // this function seems a bit foreign here - however the data is loaded
        // with the bootstrap.xsjs and Configuration is the accessor to it
        // bIncludePrivileges will only where when getCurrentUser is the first call
        return this.getBackendConfiguration(bIncludePrivileges).user;
    };

    sap.ui.ino.application.Configuration.getCurrentUserPrivileges = function() {
        // see getCurrentUser(...)
        return this.getBackendConfiguration().privileges;
    };

    sap.ui.ino.application.Configuration.hasCurrentUserPrivilege = function(sPrivilege) {
        return !!this.getCurrentUserPrivileges()[sPrivilege];
    };

    sap.ui.ino.application.Configuration.getUserLocale = function() {
        return this.getBackendConfiguration().user.LOCALE;
    };

    sap.ui.ino.application.Configuration.getBackendConfiguration = function(bIncludePrivileges ,bRefreshSystemsetting) {
        return getBackendConfiguration(this.getBackendRootURL(), bIncludePrivileges ,bRefreshSystemsetting);
    };
    
    sap.ui.ino.application.Configuration.isAbsoluteURL = function(sURL){
        if(sURL.search(/^http(s)?:\/\//) === -1){
            return false;
        }else{
            return true;
        }
    };
    sap.ui.ino.application.Configuration.getUserModel = function(){
        if (!this.oUserModel) {
            this.oUserModel = new sap.ui.model.json.JSONModel({});
            }
        return this.oUserModel;
    };

    var oBackendConfiguration;
    
    var oSystemSettingsModel;
    
    sap.ui.ino.application.Configuration.getSystemSettingsModel = function() {
    	return oSystemSettingsModel;
    };
    
    function getBackendConfiguration(sRootURL, bIncludePrivileges,bRefreshSystemsetting) {
        if (bRefreshSystemsetting || !oBackendConfiguration) {
            // login.xsjs is not cached and returns user logon information
            // ui_config.xsjs is cached and returns static configuration information
            // X-CSRF-Token may only be retrieved from *un*-cached services
            var sUserURL = sRootURL + "/sap/ino/xs/rest/login/login.xsjs/";
            // Include privileges only when required as it is performance-intensive
            sUserURL += "?locale=" + sap.ui.getCore().getConfiguration().getLanguage();
            if (bIncludePrivileges) {
                sUserURL += "&includePrivileges=true";
            }

            var sConfigURL = sRootURL + "/sap/ino/xs/rest/static/ui_config.xsjs";
            var oAjaxPromise = jQuery.ajax({
                url : sUserURL,
                headers : {
                    "X-CSRF-Token" : "Fetch"
                },
                type : "GET",
                contentType : "application/json; charset=UTF-8",
                async : false
            });
            
            var fnAddSystemSettingModel = function(oResponse) {
            	var oSystemSettings = {};
            	jQuery.each(oResponse.systemSettings, function(iIndex, oObject){
            		oSystemSettings[oObject.CODE] = oObject.VALUE;
            	});
            	oSystemSettingsModel = new sap.ui.model.json.JSONModel(oSystemSettings);
            };

            oAjaxPromise.done(function(oResponse, sResponseText, oXHR) {
                oBackendConfiguration = oResponse;
                
                sap.ui.ino.application.Configuration.setXSRFToken(oXHR.getResponseHeader("X-CSRF-Token"));
                oAjaxPromise = jQuery.ajax({
                    url : sConfigURL,
                    type : "GET",
                    contentType : "application/json; charset=UTF-8",
                    async : false
                });

                oAjaxPromise.done(function(oResponse) {
                    jQuery.extend(oBackendConfiguration, oResponse);
                    sap.ui.ino.application.Configuration.getUserModel().setProperty("/data", oBackendConfiguration.user);
                    sap.ui.ino.application.Configuration.getUserModel().setProperty("/privileges", oBackendConfiguration.privileges);
                    fnAddSystemSettingModel(oResponse);
                });

                oAjaxPromise.fail(function() {
                    oBackendConfiguration = {};
                    jQuery.sap.log.error("reading backend configuration failed.");
                });
            });
            oAjaxPromise.fail(function(oResponse) {
                oBackendConfiguration = {};
                jQuery.sap.log.error("Reading user info failed.");
                jQuery.sap.log.error(oResponse.responseText);
            });
        }
        return oBackendConfiguration;
    }

})();