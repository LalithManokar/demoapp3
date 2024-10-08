/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.controller("sap.ui.ino.views.backoffice.config.NotificationActionListDetail", {
    onInit : function() {
    },

    onExit : function() {
    },
    
    getText: function(sKey) {
        if (!this._oTextModule) {
            this._oTextModule = sap.ui.getCore().getModel("i18n").getResourceBundle();
        }
        return this._oTextModule.getText(sKey);
    }
});