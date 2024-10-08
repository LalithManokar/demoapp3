/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.views.extensibility.StableIdentifier");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

var StableIdentifier = sap.ui.ino.views.extensibility.StableIdentifier;

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementUserLog", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserManagementUserLog";
	},

	createFacetContent: function(oController) {
		this.oUserLogTable = this.createUserLogTable();
		oController.bindUserLogTable();
		this._oMasterDetailLayout = new sap.ui.layout.VerticalLayout({
			content: [this.oUserLogTable]
		});

		return [new sap.ui.ux3.ThingGroup({
			content: this._oMasterDetailLayout,
			colspan: true
		})];
	},

	createActionButtons: function() {
		var oView = this;
		var oController = oView.getController();
		this._oExportButton = sap.ui.ino.application.backoffice.ControlFactory.createExportButton([oController.onExport, oController], void 0);
		this.oDeleteButton = new sap.ui.commons.Button({
			press: function() {
				oController.onDelete();
			},
			text: "{i18n>BO_IDENT_BUT_DELETE}",
			lite: false,
			enabled: false
		});

		return [this._oExportButton, this.oDeleteButton];
	},

	createUserLogTable: function() {
		var oController = this.getController();
		var oUserLogTable = new sap.ui.table.Table({
			enableColumnReordering: false,
			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
			visibleRowCount: 10,
			firstVisibleRow: 0,
			selectionMode: sap.ui.table.SelectionMode.Single,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent);
			},
			toolbar: new sap.ui.commons.Toolbar({
				items: this.createActionButtons()
			})
		});

		oUserLogTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getText("BO_IDENT_USER_LOG_CHANGED_BY")
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "CHANGED_BY_NAME"
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}),
			sortProperty: "CHANGED_BY_ID"
		}));

		oUserLogTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getText("BO_IDENT_USER_LOG_CHANGED_ON")
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: "CHANGED_AT",
					type: new sap.ui.model.type.DateTime()
				}
			}),
			sortProperty: "CHANGED_AT"
		}));

		oUserLogTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getText("BO_IDENT_USER_LOG_CHANGED_ATTRIBUTE")
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: "CHANGED_ATTRIBUTE",
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.IdentityLogSetting.Root")
				}
			}),
			sortProperty: "CHANGED_ATTRIBUTE"
		}));

		oUserLogTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getText("BO_IDENT_USER_LOG_OLD_VALUE")
			}),
			template: new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: "DATE_OLD_VALUE"
                    }, {
						path: "STRING_OLD_VALUE"
                    }, {
						path: "INT_OLD_VALUE"
                    }],
					formatter: function( dDval, sSval, sIval) {
					    return oController.fomatterValue(dDval, sSval, sIval);
					}
				}
			})
		}));

		oUserLogTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getText("BO_IDENT_USER_LOG_NEW_VALUE")
			}),
			template: new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: "DATE_NEW_VALUE"
                    }, {
						path: "STRING_NEW_VALUE"
                    }, {
						path: "INT_NEW_VALUE"
                    }],
					formatter: function(dDval, sSval, sIval) {
					    return oController.fomatterValue(dDval, sSval, sIval);
					}
				}
			})
		}));

		return oUserLogTable;
	},
	getSelectedRowContext: function() {
		var selectedIndex = this.oUserLogTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oUserLogTable.getContextByIndex(selectedIndex) !== null) {
			return this.oUserLogTable.getContextByIndex(selectedIndex);
		}
		return null;
	}
}));