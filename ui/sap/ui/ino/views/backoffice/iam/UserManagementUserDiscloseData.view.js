/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.Text");
jQuery.sap.require("sap.m.HBox");
jQuery.sap.require("sap.ui.ino.application.WebAnalytics");

var WebAnalytics = sap.ui.ino.application.WebAnalytics;

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementUserDiscloseData", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserManagementUserDiscloseData";
	},

	createFacetContent: function(oController) {
		var that = this;
		var oModel = this.getController().getModel();
		this._oDialog = this.createConfirmationDialog();

		this.oDiscloseDataTable = this.createDiscloseDataTable();
		this.getController().bindingData(this.oDiscloseDataTable);
		var oDataLayout = new sap.ui.layout.VerticalLayout({
			content: [this.oDiscloseDataTable, this.oTextView]
		});
		var oContent = new sap.ui.ux3.ThingGroup({
			content: oDataLayout,
			colspan: true
		});
        oController.getModel().getDataInitializedPromise().done(function (){
		if (!oModel.getProperty("/DISPLAY_DISCLOSE_DATA")) {
			that._oDialog.open();
		}            
        });

		return [oContent];
	},
	createConfirmationDialog: function() {
		var that = this;
		var oModel = this.getController().getModel();
		var oDialogYesBtn = new sap.ui.commons.Button({
			text: this.getText("CTRL_COMMON_FLD_YES"),
			press: function() {
				that._oDialog.close();
				that._oDialog.destroy();
				oModel.setProperty("/DISPLAY_DISCLOSE_DATA", true);
				var iId = oModel.getProperty("/ID");
				if (iId > 0) {
					WebAnalytics.logDiscloseDataView(iId);
				}
				//Log data to table for View Log
			}
		});
		var oDialogNoBtn = new sap.ui.commons.Button({
			text: this.getText("CTRL_COMMON_FLD_NO"),
			press: function() {
				that._oDialog.close();
				that._oDialog.destroy();
				oModel.setProperty("/DISPLAY_DISCLOSE_DATA", false);
				var oTi = that.getThingInspectorView();
				that.getThingInspectorView().getInspector().setSelectedFacet(oTi.aNavigationItems[0]);
				that.getThingInspectorController().facetSelectedCallback("sap.ui.ino.views.backoffice.iam.UserManagementUserDataFacet");
			}
		});
		var oDialog = new sap.ui.commons.Dialog({
			title: "{i18n>BO_IDENT_TIT_DISCLOSE_DATA_CONFIRM}",
			type: 'Message',
			modal: true,
			content: new sap.m.Text({
				text: this.getText("BO_IDENT_DISCLOSE_DATA_CONFIRM")
			}),
			buttons: [oDialogYesBtn, oDialogNoBtn]
		});
		return oDialog;
	},
	createDiscloseDataTable: function() {
		var that = this;
			var oExportMenu = new sap.ui.commons.Menu({
				items: [new sap.ui.commons.MenuItem({
					text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT_CSV}",
					customData: [new sap.ui.core.CustomData({
						key: "FORMAT",
						value: "csv"
					})]
				}), new sap.ui.commons.MenuItem({
					text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT_EXCEL}",
					customData: [new sap.ui.core.CustomData({
						key: "FORMAT",
						value: "xls"
					})]
				})]
			});

		var	oDownloadBtn = new sap.ui.commons.MenuButton({
			press: function(oEvent) {
				that.getController().onDownloadData(oEvent);
			},
				text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT}",
				menu: oExportMenu,
				lite: true
			});		
		
		
		/*var oDownloadBtn = new sap.ui.commons.Button({
			icon: "sap-icon://download",
			enabled: {
				path: that.getFormatterPath("/UserDisCloseDataDownload"),
				formatter: function(oData) {
					return oData.length > 0;
				}
			},
			press: function() {
				that.getController().onDownloadData();
			}
		});*/
		var oText = new sap.ui.commons.TextView({
			text: that.getText("BO_IDENT_DISCLOSE_DATA_DESCRIPTION")
		});
		var oToolBar = new sap.ui.commons.Toolbar({
			items: [oText],
			rightItems: [oDownloadBtn]
		});
		var oTreeTable = new sap.ui.table.TreeTable({
			expandFirstLevel: true,
			visibleRowCount: 15,
			visible: {
				path: that.getFormatterPath("/DISPLAY_DISCLOSE_DATA")
			},
			toolbar: oToolBar,
			columns: [new sap.ui.table.Column({
					label: this.createControl({
						Type: "label",
						Text: this.getText("BO_IDENT_DISCLOSE_DATA_DIS_DATA"),
						Tooltip: this.getText("BO_IDENT_DISCLOSE_DATA_DIS_DATA")
					}),
					template: new sap.m.HBox({
						items: [
				    new sap.ui.commons.Link({
								text: {
									path: that.getFormatterPath("name")
								},
								press: function(oEvent) {
									var oSource = oEvent.getSource();
									var oBindingInfo = oSource.mBindingInfos;
									var oBindingRowContext = oBindingInfo.text.binding.getContext();
									that.getController().onNavigateTo(oBindingRowContext.getProperty("type"), oBindingRowContext.getProperty("name"),
										oBindingRowContext.getProperty("id"), oBindingRowContext.getProperty("corrObjectName"), oBindingRowContext.getProperty(
											"corrObjectId"));
								},
								visible: {
									parts: [{
										path: that.getFormatterPath("id")
                        }, {
										path: that.getFormatterPath("type")
                        }],
									formatter: function(id, type) {
										return id !== null && type !== "TAG";
									}
								}
							}), new sap.ui.commons.TextView({
								text: {
									path: that.getFormatterPath("name")
								},
								visible: {
									parts: [{
										path: that.getFormatterPath("id")
                        }, {
										path: that.getFormatterPath("type")
                        }],
									formatter: function(id, type) {
										return id === null || type === "TAG";
									}
								}
							})
				    ]
					})
				}),
                new sap.ui.table.Column({
					label: this.createControl({
						Type: "label",
						Text: this.getText("BO_IDENT_DISCLOSE_DATA_RECORD"),
						Tooltip: this.getText("BO_IDENT_DISCLOSE_DATA_RECORD")
					}),
					template: this.createControl({
						Type: "textview",
						Node: "UserDiscloseData",
						Text: "record",
						Tooltip: this.getText("BO_IDENT_DISCLOSE_DATA_RECORD"),
						Editable: false
					})
				})]

		});

		return oTreeTable;
	}

}));