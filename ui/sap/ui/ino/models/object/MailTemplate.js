/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.MailTemplate");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    jQuery.sap.require("sap.ui.ino.application.Configuration");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.MailTemplate", {
        objectName : "sap.ino.xs.object.notification.MailTemplate",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("MailTemplate", {
            includeNodes : [{
                name : "MailTemplateText",
                parentNode : "Root"
            }]
        }),
        getLanguageTemplate : getLanguageTemplate
    });
    
    function getLanguageTemplate(sDefaultText) {
        var aTemplates = this.getProperty("/MailTemplateText");
        var userLang = navigator.language || navigator.userLanguage;
        userLang = userLang.split("-")[0];
        if(userLang) {
            aTemplates = (jQuery(aTemplates).filter(function(){
                return this.LANG === userLang &&
                    this.TEMPLATE !== "";
            }));
            if(aTemplates.length > 0) {
                return aTemplates[0].TEMPLATE;
            }
        }
        var sLanguage = sap.ui.ino.application.Configuration.getSystemDefaultLanguage();
        aTemplates = this.getProperty("/MailTemplateText");
        aTemplates = (jQuery(aTemplates).filter(function(){
            return this.LANG === sLanguage &&
                this.TEMPLATE !== "";
        }));
        if(aTemplates.length > 0) {
            return aTemplates[0].TEMPLATE;
        }
        jQuery.each(aTemplates, function(iIndex, oTemplate){
           if(oTemplate.TEMPLATE !== "") {
               return oTemplate.TEMPLATE;
           } 
        });
        return sDefaultText;
    }
})();