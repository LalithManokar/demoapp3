/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.TextModuleStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.TextModuleStage", {
        objectName : "sap.ino.xs.object.basis.TextModuleStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingTextModule"),
        invalidation : {
            entitySets : ["StagingTextModule", "StagingTextModuleSearch"] 
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                var oInitialTextData = {
                    "PLAIN_CODE" : "",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : "",
                    TextModuleText : []
                };

                _mergeLanguageTexts(oInitialTextData, objectInstance);

                return oInitialTextData;
            },
            onRead : _mergeLanguageTexts,
            onNormalizeData : _normalizeData
        }
    });

    function _mergeLanguageTexts(oData, objectInstance) {
        var aExistingTextModuleText = oData.TextModuleText;
        var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
            var aFound = jQuery.grep(aExistingTextModuleText, function(oTextModuleText) {
                return oTextModuleText.LANG === oLanguage.ISO_CODE;
            });
            // only take currently unused language codes
            return aFound.length === 0;
        });

        var aInitialTextModuleText = jQuery.map(aCodes, function(oLanguageCode) {
            return {
                LANG : oLanguageCode.ISO_CODE,
                ID : objectInstance.getNextHandle(),
                TEXT_MODULE : ""
            };
        });

        oData.TextModuleText = oData.TextModuleText.concat(aInitialTextModuleText);

        return oData;
    }
    
    function _normalizeData(oData) {
        if(!oData.TextModuleText) {
            return oData;
        }
        oData.TextModuleText = jQuery.grep(oData.TextModuleText, function(oTextModule) {
            return oTextModule.TEXT_MODULE && oTextModule.TEXT_MODULE !== "";
        });
        jQuery.each(oData.TextModuleText, function(key, oTextModule) {
            if(oTextModule.TEXT_MODULE){
                var sNewLine = String.fromCharCode(10);
                var oRegExp = new RegExp(sNewLine, "g");
                oTextModule.TEXT_MODULE = oTextModule.TEXT_MODULE.replace(oRegExp,"");
            }
        });
        return oData;
    }
})();