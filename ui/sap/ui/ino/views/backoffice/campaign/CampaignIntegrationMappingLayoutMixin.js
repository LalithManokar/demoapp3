/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingLayoutMixin = {
		_CONST_CAMPAIGN_INTEGRATION: {
			MAPPING_TABLE_PATH: {
				TECHNICAL_NAME: "TECHNICAL_NAME",
				PACKAGE_NAME: "SYSTEM_PACKAGE_NAME",
				DISPLAY_NAME: "APINAME",
				TARGET_SYSTEM: "SYSTEM_NAME",
				STATUS: "STATUS"
			},
			MAPPING_TABLE_I18N_PATH: {
				TECHNICAL_NAME: "BO_CAMPAIGN_INTEGRATION_FLD_TECH_NAME",
				PACKAGE_NAME: "BO_CAMPAIGN_INTEGRATION_FLD_PACKAGE_NAME",
				DISPLAY_NAME: "BO_CAMPAIGN_INTEGRATION_FLD_DISPLAY_NAME",
				TARGET_SYSTEM: "BO_CAMPAIGN_INTEGRATION_FLD_TARGET_SYS",
				STATUS: "BO_CAMPAIGN_INTEGRATION_FLD_STATUS"
			}
		},

		_createEnableRow: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oLabel = oView.createControl({
				Type: "label",
				Text: "BO_CAMPAIGN_FACET_INTEGRATION_FLD_ENABLE"
			});
			oLabel.addStyleClass("sapInoCampaginIntegrationEnabled");
			var oChkBox = new sap.ui.commons.CheckBox({
				editable: bEdit,
				checked: {
					path: oController.getFormatterPath("IS_INTEGRATION_ACTIVE", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				ariaLabelledBy: oLabel
			});
			oLabel.setLabelFor(oChkBox);
			var oHBox = new sap.m.HBox({
				items: [oLabel, new sap.ui.commons.Label({
					width: "20px"
				}), oChkBox]
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oHBox]
			}));
			oLayout.addRow(oRow);
		},

		_createCampaignMappingPanel: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oPanel = new sap.m.Panel({
				headerText: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_FLD_TITLE_MAPPING"),
				content: [oView._createCampaignMappingButtons(bEdit),
				oView._createCampaignMappingTable(),
				oView._createCampaignMappingMappingTable(),
				oView._createCampaignMappingSegmentedBtns(),
				oView._createCampaignMappingDestinationTable()
				]
			});
			oPanel.addStyleClass("sapInoCampIntegrationPanel");
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPanel]
			}));
			oLayout.addRow(oRow);
		},

		_createMappingCombox: function() {
			var oController = this.getController();
			var oCmb = new sap.ui.commons.DropdownBox({
				width: "200px",
				change: function(oEvent) {
					oController.onSysIntegrationChange(oEvent);
				},
				displaySecondaryValues: true
			});
			oCmb.addItem(new sap.ui.core.ListItem({
				key: "",
				text: ""
			}));
			var oItemTemp = new sap.ui.core.ListItem({
				key: "{sysIntegration>ID}",
				text: "{sysIntegration>APINAME}",
				additionalText: "{sysIntegration>TECHNICAL_NAME}"
			});
			oCmb.bindItems({
				path: "sysIntegration>/d/results/",
				filters: [new sap.ui.model.Filter({
					path: 'STATUS',
					operator: 'NE',
					value1: 'inactive'
				})],
				sorter: new sap.ui.model.Sorter('APINAME'),
				template: oItemTemp
			});
			return oCmb;
		},

		_createCampaignMappingButtons: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			if (!bEdit) {
				return undefined;
			}
			var oToolBar = new sap.ui.commons.Toolbar({
				width: '100%'
			});
			oToolBar.addStyleClass("sapInoCampMappingBtns");
			oToolBar.addItem(oView._createMappingCombox());
			oToolBar.addItem(new sap.ui.commons.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_ADD"),
				press: function(oEvent) {
					oController.newCampaignIntegration(oEvent);
				}
			}));

			oToolBar.addItem(new sap.ui.commons.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_REMOVE"),
				press: function(oEvent) {
					oController.delCampaignIntegration(oEvent);
				},
				enabled: {
					path: "viewCampIntegration>/CampaignMappingSelectedIndex",
					formatter: function(nSelectedIndex) {
						return oController.formatterRemoveBtn(nSelectedIndex);
					}
				}
			}));
			return oToolBar;
		},

		_createCampaignMappingTable: function() {
			var oView = this;
			var oController = oView.getController();
			var oTable = new sap.ui.table.Table({
				rows: oController.getBoundPath("CampaignIntegration", true),
				selectionMode: sap.ui.table.SelectionMode.Single,
				visibleRowCount: 5,
				rowSelectionChange: function(oEvent) {
					oController.onMappingTableChange(oEvent);
				},
				selectedIndex: {
					path: "viewCampIntegration>/CampaignMappingSelectedIndex"
				},
				columns: [new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.TECHNICAL_NAME
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.TECHNICAL_NAME)
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.PACKAGE_NAME
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.PACKAGE_NAME)
						    }, {
								path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.TARGET_SYSTEM)
							}],
							formatter: function(sysPkgName, sysName) {
								return oController.formatterExtensionDest(sysPkgName, sysName, "destPackage");
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.DISPLAY_NAME
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.DISPLAY_NAME)
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.TARGET_SYSTEM
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.PACKAGE_NAME)
						    }, {
								path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.TARGET_SYSTEM)
							}],
							formatter: function(sysPkgName, sysName) {
								return oController.formatterExtensionDest(sysPkgName, sysName, "destName");
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.STATUS
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: oController.getFormatterPath(oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_PATH.STATUS)
						}
					})
				})]
			});
			return oTable;
		},

		_createCampaignMappingMappingTable: function() {
			var oView = this;
			return oView._createCampaignMappingDetailTable([{
				lbls: [oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.DISPLAY_NAME, oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH
					.STATUS],
				txts: [["viewCampIntegration>/CurrentSysIntegration/APINAME"], ["viewCampIntegration>/CurrentSysIntegration/STATUS"]]
			}, {
				lbls: [oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH.TECHNICAL_NAME, oView._CONST_CAMPAIGN_INTEGRATION.MAPPING_TABLE_I18N_PATH
					.TARGET_SYSTEM],
				txts: [["viewCampIntegration>/CurrentSysIntegration/TECHNICAL_NAME"],
				["viewCampIntegration>/CurrentSysIntegration/SYSTEM_PACKAGE_NAME", "viewCampIntegration>/CurrentSysIntegration/SYSTEM_NAME"]],
				formatter: [null,
					function(sysPkgName, sysName) {
						return oView.getController().formatterExtensionDest(sysPkgName, sysName, "destName");
				}]
			}], true);
		},

		_createCampaignMappingDetailTable: function(aRows, bVisible) {
			var oView = this;
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				visible: {
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"},{path: "viewCampIntegration>/SegmentBtnSelectedIndex"}],
					formatter: function(nDestIndex, nSelIndex) {
						return nDestIndex > -1 && (bVisible || oView.getController().formatterMappingDetailTable(nSelIndex));
					}
				},
				columns: 5,
				widths: ['180px', '50%', '20px', '180px', '50%']
			});
			oLayout.addStyleClass("sapInoCampIntegrationMappingSmallMarginTop");
			if (aRows && aRows.length > 0) {
				for (var index = 0; index < aRows.length; index++) {
					this._createCampaignMappingDetailTableRow(oLayout, aRows[index].lbls, aRows[index].txts, aRows[index].formatter);
				}
			}
			return oLayout;
		},

		_createCampaignMappingDetailTableRow: function(oLayout, aLbls, aTxts, fnFormatter) {
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oView = this,
				paths = [];
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oView.createControl({
					Type: "label",
					Text: aLbls[0]
				})]
			}));
			aTxts[0].forEach(function(sPath) {
				paths.push({
					"path": sPath
				});
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: aLbls.length > 1 ? 1 : 3,
				content: [new sap.ui.commons.TextView({
					text: {
						parts: paths,
						formatter: !fnFormatter ? null : fnFormatter[0]
					}
				})]
			}));
			if (aLbls.length > 1) {
				oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
				oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oView.createControl({
						Type: "label",
						Text: aLbls[1]
					})]
				}));
				paths = [];
				aTxts[1].forEach(function(sPath) {
					paths.push({
						"path": sPath
					});
				});
				oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.TextView({
						text: {
							parts: paths,
							formatter: !fnFormatter ? null : fnFormatter[1]
						}
					})]
				}));
			}
			oLayout.addRow(oRow);
		},

		_createCampaignMappingSegmentedBtns: function() {
			var oController = this.getController();
			var oSegmentBtn = new sap.m.SegmentedButton({
			    visible:{
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"}],
					formatter: function(nDestIndex) {
						return nDestIndex > -1;
					}
				},
				selectedKey: {
					path: "viewCampIntegration>/SegmentBtnSelectedIndex"
				},
				items: [
		            new sap.m.SegmentedButtonItem({
						text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_CREATE_API"),
						key: 0
					}),
		            new sap.m.SegmentedButtonItem({
						text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_UPDATE_API"),
						key: 1
					}),
		            new sap.m.SegmentedButtonItem({
						text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_CONFIG_DISPLAY_SEQUENCE"),
						key: 2
					})
	            ],
				selectionChange: function(oEvent) {
					oController.onSegmentBtnChange(oEvent);
				}
			});
			oSegmentBtn.addStyleClass("sapInoCampaignIntegrationSegmentBtns");
			return oSegmentBtn;
		},

		_createCampaignMappingDestinationTable: function() {
			var oView = this;
			return oView._createCampaignMappingDetailTable([{
				lbls: ["BO_CAMPAIGN_INTEGRATION_BTN_API_HOST_URL"],
				txts: [["viewCampIntegration>/CurrentSysDesitination/destHost", "viewCampIntegration>/CurrentSysDesitination/destPort",
					"viewCampIntegration>/CurrentSysDesitination/destPathPrefix", "viewCampIntegration>/CurrentSysIntegration/CREATE_PATH",
					"viewCampIntegration>/CurrentSysIntegration/FETCH_PATH", "viewCampIntegration>/SegmentBtnSelectedIndex","viewCampIntegration>/CurrentSysIntegration/FETCH_LOCATION_ID",
					"viewCampIntegration>/CurrentSysIntegration/CREATE_LOCATION_ID"]],
				formatter: [

					function() {
						return oView.getController().formatterDestHost(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
				}]
			}, {
				lbls: ["BO_CAMPAIGN_INTEGRATION_BTN_API_METHOD"],
				txts: [["viewCampIntegration>/CurrentSysIntegration/CREATE_METHOD", "viewCampIntegration>/CurrentSysIntegration/FETCH_METHOD",
					"viewCampIntegration>/SegmentBtnSelectedIndex"]],
				formatter: [

					function() {
						return oView.getController().formatterApi(arguments[0], arguments[1], arguments[2]);
				}]
			}], false);
		}
	};
}());