/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignAdvanceChange", {

    onInit : function() {
    	this._oChange = {};
    	sap.ui.ino.application.backoffice.Application.getInstance().setActiveOverlay(this.getView());
    },

    onExit : function() {
        sap.ui.ino.application.backoffice.Application.getInstance().clearActiveOverlay();        
    },

    onCancel : function() {
        var oView = this.getView();
        oView.oDialog.close();
    },
    
    onApplyChanges : function() {
    	if (this._fnCallback) {
    		this._fnCallback.apply([], this._oCallbackHandler || this);
    	}
    }
});