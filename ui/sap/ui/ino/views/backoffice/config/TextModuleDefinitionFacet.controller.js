/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.controller("sap.ui.ino.views.backoffice.config.TextModuleDefinitionFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {

    onLanguageChange : function(oEvent) {
        var oView = this.getView();
        if (oEvent.getParameter("liveValue")) {
            oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
        }
        var aItems = oEvent.getSource().getItems();
        var sKey = oEvent.getSource().getSelectedKey();
        var oItem;

        var aLanguages = this.getModel().oData.TextModuleText;
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
                        this.getThingInspectorController().initLanguageTemplateModel("/TextModuleText/" + i);
                        
                        break;
                    }
                }
                var oTextModule = this.getView().getTextModule();
                oTextModule.bindElement(this.getFormatterPath("TextModuleText/" + iLanguageIdx, true));
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
    }
}));