/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.models.util.Ajax");

sap.ui.controller("sap.ui.ino.views.backoffice.config.MailTemplateDefinitionFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {

    onLanguageChange : function(oEvent) {
        var oView = this.getView();
        if (oEvent.getParameter("liveValue")) {
            oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
        }
        var aItems = oEvent.getSource().getItems();
        var sKey = oEvent.getSource().getSelectedKey();
        var oItem;

        var aLanguages = this.getModel().oData.MailTemplateText;
        if (aLanguages) {
            // Remember current selection to display the correct value after mode switch
            if (sKey) {
                this.getThingInspectorController()._sCurrentLanguageKey = sKey;
            }
            for (var ii = 0; ii < aItems.length; ++ii) {
                if (aItems[ii].getKey() === sKey) {
                    oItem = aItems[ii];
                    break;
                }
            }
            if (oItem) {
                var iLanguageIdx = 0;
                for (var i = 0; i < aLanguages.length; i++) {
                    var oLanguage = this.getLanguageByLang(aLanguages[i].LANG);
                    if (oLanguage && oLanguage.CODE === sKey) {
                        var sLanguage = aLanguages[i].LANG;
                        this.getThingInspectorController()._sCurrentLanguage = sLanguage;
                        iLanguageIdx = i;
                        
                        // WORKAROUND FOR RTE VALUE BINDING PROBLEM
                        this.getThingInspectorController().initLanguageTemplateModel("/MailTemplateText/" + i);
                        
                        break;
                    }
                }
                var oMailTemplate = this.getView()._oTemplate;
                oMailTemplate.bindElement(this.getFormatterPath("MailTemplateText/" + iLanguageIdx, true));
            }
        }
        oView.revalidateMessages();
    },
    
    getLanguages : function() {
        if (!this._aLanguages) {
            var oController = this;
            oController._aLanguages = [];
            var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root");
            oController._aLanguages = jQuery.map(aCodes, function(oLanguage) {
                return {
                    CODE : oLanguage.CODE,
                    LANG : oLanguage.ISO_CODE,
                    LANG_TEXT : oLanguage.TEXT
                };
            });
        }
        return this._aLanguages;
    },

    getLanguageByLang : function(sLang) {
        return jQuery.grep(this.getLanguages(), function(oLanguage) {
            return oLanguage.LANG === sLang;
        })[0];
    },

    getLanguageByCode : function(sCode) {
        return jQuery.grep(this.getLanguages(), function(oLanguage) {
            return oLanguage.CODE === sCode;
        })[0];
    },
    
    onAfterModeSwitch : function() {
        this._initialLanguageBinding();
    },
    
    _initialLanguageBinding : function() {
        var oLanguageDropdown = this.getView()._getLanguageDropdown();
        if (oLanguageDropdown) {
            if (!this._sCurrentLanguageKey) {
                // Show default language when the facet opens
                var oLanguage = this.getLanguageByLang(sap.ui.ino.application.Configuration.getSystemDefaultLanguage());
                if (oLanguage) {
                    oLanguageDropdown.setSelectedKey(oLanguage.CODE);
                }
                if (oLanguageDropdown.getSelectedKey().length > 0) {
                    oLanguageDropdown.fireChange({
                        newValue : oLanguageDropdown.getSelectedKey()
                    });
                    this._sCurrentLanguageKey = oLanguageDropdown.getSelectedKey();
                    this._sCurrentLanguage = oLanguage.LANG;
                }
            } else {
                oLanguageDropdown.setSelectedKey(this._sCurrentLanguageKey);
                oLanguageDropdown.fireChange({
                    newValue : this._sCurrentLanguageKey
                });
            }
        }
    },
    
    onRemove : function(sFileName, sMediaType) {
        var oAjaxSettings = {
            async: true,
            headers : {},
            type: "DELETE"
        };
        var sURL = sap.ui.ino.application.Configuration.getBackendRootURL() + "/" +
                        sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_REPOSITORY");
        oAjaxSettings.url = sURL + "?FILENAME=" + sFileName + "&MEDIATYPE=" + sMediaType;
        return sap.ui.ino.models.util.Ajax.process(oAjaxSettings);
    }
}));