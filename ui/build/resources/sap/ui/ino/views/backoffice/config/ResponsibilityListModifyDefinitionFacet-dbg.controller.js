/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.application.Configuration");
sap.ui.controller("sap.ui.ino.views.backoffice.config.ResponsibilityListModifyDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
		onExit: function() {
			//this.getView().oFieldsDetailView.exit();
		},
		onLiveChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
		},
		onAfterModelAction: function() {
			// this.getView().oFieldsDetailView.getController().refresh();
		},
		formatterPublic: function(cid, id) {
			return id <= 0 || !id || sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute") ||
				Number(cid) === sap.ui.ino.application.Configuration.getCurrentUser().USER_ID;
		}
	}));