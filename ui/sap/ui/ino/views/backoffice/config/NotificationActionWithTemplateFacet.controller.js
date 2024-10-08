/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.controller("sap.ui.ino.views.backoffice.config.NotificationActionWithTemplateFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
	    
    onAfterModelAction: function(sActionName) {
		if (sActionName === 'save') {
			this.handleShowPreview();
		}
	},

	onAfterModeSwitch: function(sNewMode) {
		if (sNewMode === 'edit' || sNewMode === 'display') {
			this.handleShowPreview();
		}
	    this.getView()._createReceiverTokenizer(sNewMode === 'edit');
	},
	
	handleAppModelPropertyChange: function(oEvent) {
	    var sPath = oEvent.getParameter("path");
	    if (sPath === "/TEXT_MODULE_CODE" || sPath === "/previewLang" || sPath === "/previewRole") {
	        this.handleShowPreview();
	    }
	},
	
	handleShowPreview: function() {
	    var oView = this.getView();
	    var oModel = this.getThingInspectorController().getView().getInspector().getModel("applicationObject");
	    var sPreviewLang = oModel.getProperty("/previewLang");
	    var sPreviewRole = oModel.getProperty("/previewRole");
	    var sTextModuleCode = oModel.getProperty("/TEXT_MODULE_CODE");
	    var sActionCode = oModel.getProperty("/ACTION_CODE");
	    if (!sPreviewLang || !sPreviewRole || !sTextModuleCode) {
	        oView._oPreviewField.unbindProperty("content");
            oView._oPreviewField.setModel(undefined);
            return;
	    }
	    var sContentPath = [
            sap.ui.ino.application.Configuration.getBackendRootURL(), 
            "/sap/ino/xs/rest/common/mail_preview.xsjs",
            "?TEMPLATE_CODE=" + oModel.getProperty("/EMAIL_TEMPLATE_CODE"),
            "&TEXT_CODE=" + sTextModuleCode,
            "&LOCALE=" + sPreviewLang,
            "&ROLE_CODE=" + sPreviewRole,
            "&ACTION_CODE=" + sActionCode].join("");
        oView._oPreviewField.setModel(new sap.ui.model.json.JSONModel(sContentPath));
        oView._oPreviewField.bindProperty("content", "/TEXT");
	}
}));