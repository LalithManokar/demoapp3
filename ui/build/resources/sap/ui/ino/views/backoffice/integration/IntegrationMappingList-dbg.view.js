/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");

sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMappingList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
        getControllerName: function() {
			return "sap.ui.ino.views.backoffice.integration.IntegrationMappingList";
		},

		hasPendingChanges: function() {
			return this.getController().hasPendingChanges();
		},
		
		createActionButtons: function(oController) {
		    this._oCreateButton = new sap.ui.commons.Button({
				id: this.createId("BUT_CREATE"),
				text: "{i18n>BO_INTEGRATION_MAPPING_LIST_BUT_CREATE}",
				press: [oController.hanldeCreate, oController],
				lite: false,
				enabled: "{property>/actions/create/enabled}"
			});
			this._oEditButton = new sap.ui.commons.Button({
				id: this.createId("BUT_EDIT"),
				text: "{i18n>BO_INTEGRATION_MAPPING_LIST_BUT_Edit}",
				press: [oController.handleEdit, oController],
				lite: false,
				enabled: "{property>/actions/update/enabled}"
			});

			this._oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				text: "{i18n>BO_INTEGRATION_MAPPING_LIST_BUT_Delete}",
				press: [oController.handleDelete, oController],
				lite: false,
				enabled: "{property>/actions/del/enabled}"
			});
			
			this._oSyncButton = new sap.ui.commons.Button({
				id: this.createId("BUT_SYNC"),
				text: "{i18n>BO_INTEGRATION_MAPPING_LIST_BUT_Sync}",
				press: [oController.handleSync, oController],
				lite: false
			});
			return [this._oCreateButton, this._oEditButton, this._oDeleteButton, this._oSyncButton];
		},
		
		createColumns: function() {
		    var oController = this.getController();
		    
		    return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("TECH_NAME"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_TECH_NAME}"
					}),
					template: new sap.ui.commons.Link({
						text: "{TECHNICAL_NAME}",
						press: function(oEvent) {
							var oBindingContext = oEvent.getSource().getBindingContext();
							var iId = oBindingContext.getObject().ID;
							oController.onNavigateToModel(iId, false);
						}
					})
		    })), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("PACKAGE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_PACKAGE}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{SYSTEM_PACKAGE_NAME}"
					})
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("NAME"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_NAME}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{APINAME}"
					})
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("TARGET_SYSTEM"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_TARGET_SYSTEM}"
					}),
					template: new sap.ui.commons.TextView({
						//text: "{SYSTEM_NAME}"
						text: {
						    parts: ["SYSTEM_NAME", "targetSystems>/"],
						    formatter: oController.formatTargetSystemName
						}
					})
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("STATUS"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_STATUS}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{STATUS}"
					})
			}))];
		},
		
		createDetailsView: function() {
			return sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMappingListDetail");
		}
}));