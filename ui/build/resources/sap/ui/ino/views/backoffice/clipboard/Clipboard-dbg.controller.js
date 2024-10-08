/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.clipboard.Clipboard", {

    onAfterRendering : function() {
        jQuery(document.getElementById(this.getView().oPanel.sId)).attr("aria-live", "polite");
    },
    
    open : function(oEvent) {
        var oObject = oEvent.getSource().getBindingContext("clipboard").getObject();
        var oSelectionDefinition = sap.ui.ino.views.common.ObjectInstanceSelection
                .getDefinitionByUIObject(oObject.objectName);
        if (oSelectionDefinition) {
            var sAppCode = sap.ui.ino.application.ApplicationBase.getApplication().getApplicationCode();
            var sNavigationPath = oSelectionDefinition.navigation[sAppCode];
            if (sNavigationPath) {
                sap.ui.ino.application.ApplicationBase.getApplication().openOverlay(sNavigationPath, oObject.key);
            }
        }
    },

    onRemoveAll : function(oEvent) {
        sap.ui.ino.models.core.ClipboardModel.sharedInstance().remove();
    },

    onRemoveObject : function(oEvent) {
        var oObject = oEvent.getSource().getBindingContext("clipboard").getObject();
        if (oObject) {
            sap.ui.ino.models.core.ClipboardModel.sharedInstance().remove(oObject.name);
        }
    },

    onRemoveInstance : function(oEvent) {
        var oObject = oEvent.getSource().getBindingContext("clipboard").getObject();
        if (oObject) {
            var oApplicationObject = sap.ui.ino.models.core.ClipboardModel.loadObject(oObject.objectName);
            sap.ui.ino.models.core.ClipboardModel.sharedInstance().remove(oApplicationObject, oObject.key);
        }
    }
});