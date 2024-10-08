/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusNameModifyDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
	    __handleTabSelection: function() {
			this.getThingInspectorController().__iCurrentSelectedTab = this.getView().__oTabStrip.getSelectedIndex();
			for (var sKey in this.__oIdentityFields) {
				this.__oIdentityFields[sKey].setValueState(sap.ui.core.ValueState.None);
			}
			this.getThingInspectorController().clearFacetMessages();
		},
	    __reSelectTab: function() {
			if (this.getThingInspectorController().__iCurrentSelectedTab && this.getView().__oTabStrip) {
				this.getView().__oTabStrip.setSelectedIndex(this.getThingInspectorController().__iCurrentSelectedTab);
			}
		},
		_handleColorPickerLiveChange : function(oEvent) {
        var oColors = oEvent.getParameters();
        if (oColors.hex && oColors.hex.length == 7) {
            this.getModel().setProperty("/COLOR_CODE", oColors.hex.substr(1));
        } else {
            // Invalid color, default to white
            this.getModel().setProperty("/COLOR_CODE", "333333");
        }
    }
	}));