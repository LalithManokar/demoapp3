/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignMailTemplateFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

    onLiveChange: function(oEvent) {
        oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
    },

    onAfterModeSwitch: function() {
        this._initialLanguageBinding();
        this._initialTemplateBinding();
    },

    _initialTemplateBinding: function() {
        this._setTemplate(this.getModel().oData.MAIL_TEMPLATE_CODE);
        this._setTextModule(this.getModel().oData.MAIL_SUCCESS_CODE);
    },

    onTemplateChange: function(oEvent) {
        var sKey = oEvent.mParameters.selectedItem.getKey();
        var aItems = oEvent.getSource().getItems();
        if(aItems.length > 0) {
            this._setTemplate(sKey);
        }
    },

    _setTemplate: function(sTemplateCode) {
        this.TemplateCode = sTemplateCode;
        this._updateTemplateField();
    },

    onTextChange: function(oEvent) {
        var sKey = oEvent.mParameters.selectedItem.getKey();
        var aItems = oEvent.getSource().getItems();
        if (aItems.length > 0) {
            this._setTextModule(sKey);
        }
    },

    _setTextModule: function(sTextCode) {
        this.TextCode = sTextCode;
        this._updateTemplateField();
    },

    _updateTemplateField: function() {
        if(!this.TemplateCode && !this.TextCode) {
            this.getView()._oTemplateField.unbindProperty("content");
            this.getView()._oTemplateField.setModel(undefined);
        } else {
            var sPath = "/sap/ino/xs/rest/common/mail_preview.xsjs";
            sPath = sap.ui.ino.application.Configuration.getBackendRootURL() + sPath;
    
            if(this.TemplateCode) {
                sPath = sPath + "?TEMPLATE_CODE=" + this.TemplateCode;    
                if(this.TextCode) {
                    sPath = sPath + "&TEXT_CODE=" + this.TextCode;
                }
            } else {
                sPath = sPath + "?TEXT_CODE=" + this.TextCode;
            }

            sPath = sPath + "&CAMPAIGN=" + this.getModel().getProperty("/ID");
            sPath = sPath + "&LOCALE=" + this.getThingInspectorController()._sCurrentLanguage;
    
            this.getView()._oTemplateField.setModel(new sap.ui.model.json.JSONModel(sPath));
            this.getView()._oTemplateField.bindProperty("content", "/TEXT");
        }
    },

    _initialLanguageBinding: function() {
        this.getThingInspectorController()._initialLanguageBinding(this.getView());
    },

    onLanguageChange: function(oEvent) {
        var oView = this.getView();
        if (oEvent.getParameter("liveValue")) {
            oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
        }
        var aItems = oEvent.getSource().getItems();
        var sKey = oEvent.getSource().getSelectedKey();
        var oItem;

        var aLanguages = this.getModel().oData.LanguageTexts;
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
                    var oLanguage = this.getThingInspectorController().getLanguageByLang(aLanguages[i].LANG);
                    if (oLanguage && oLanguage.CODE === sKey) {
                        var sLanguage = aLanguages[i].LANG;
                        this.getThingInspectorController()._sCurrentLanguage = sLanguage;
                        iLanguageIdx = i;
                        break;
                    }
                }
                oView._oLanguageTemplate.bindElement(this.getFormatterPath("LanguageTexts/" + iLanguageIdx, true));
                this._updateTemplateField();
            }
        }
        oView.revalidateMessages();
    }
}));