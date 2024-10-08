/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.TextModule");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    jQuery.sap.require("sap.ui.ino.application.Configuration");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.TextModule", {
        objectName : "sap.ino.xs.object.basis.TextModule",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("TextModule", {
            includeNodes : [{
                name : "TextModuleText",
                parentNode : "Root"
            }]
        }),
        getLanguageTemplate : getLanguageTemplate
    });
    
    function getLanguageTemplate(sDefaultText) {
        var aTemplates = this.getProperty("/TextModuleText");
        var userLang = navigator.language || navigator.userLanguage;
        userLang = userLang.split("-")[0];
        if(userLang) {
            aTemplates = (jQuery(aTemplates).filter(function(){
                return this.LANG === userLang &&
                    this.TEXT_MODULE !== "";
            }));
            if(aTemplates.length > 0) {
                return aTemplates[0].TEXT_MODULE;
            }
        }
        var sLanguage = sap.ui.ino.application.Configuration.getSystemDefaultLanguage();
        aTemplates = this.getProperty("/TextModuleText");
        aTemplates = (jQuery(aTemplates).filter(function(){
            return this.LANG === sLanguage &&
                this.TEXT_MODULE !== "";
        }));
        if(aTemplates.length > 0) {
            return aTemplates[0].TEXT_MODULE;
        }
        jQuery.each(aTemplates, function(iIndex, oTemplate){
           if(oTemplate.TEXT_MODULE !== "") {
               return oTemplate.TEXT_MODULE;
           } 
        });
        return sDefaultText;
    }
})();