/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationApiFieldLayoutMixin = {
		_createCampaignConfigApiFieldLayout: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oPanel = new sap.m.Panel({
				headerText: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_FLD_CONFIG_DISPLAY_SEQUENCE"),
				content: [oView._createCampaignApiFieldLayoutButtons(bEdit),
				oView._createCampaignApiFieldLayoutTable(bEdit),
				oView._createCampaginApiFieldLayoutRow(bEdit)
				],
				visible: {
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"},{path: "viewCampIntegration>/SegmentBtnSelectedIndex"}],
					formatter: function(nDestIndex, nSelIndex) {
						return nDestIndex > -1 && oView.getController().formatterPreviewContent(nSelIndex);
					}
				}
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPanel]
			}));
			oPanel.addStyleClass("sapInoCampIntegrationPanel");
			oLayout.addRow(oRow);
		},

		_createCampaignApiFieldLayoutButtons: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			// 			if (!bEdit) {
			// 				return undefined;
			// 			}
			var oToolBar = new sap.ui.commons.Toolbar({
				width: '100%'
			});
			oToolBar.addStyleClass("sapInoCampMappingBtns");
			//oToolBar.addItem(oView._createMappingCombox());
			oToolBar.addItem(new sap.ui.commons.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_ADD"),
				press: function(oEvent) {
					oController.newDisplayLayOut(oEvent);
				},
				enabled: {
					path: "viewCampIntegration>/CampaignMappingSelectedIndex",
					formatter: function(nSelIndex) {
						return oView.getController().formatterFieldLayoutAddBtn(nSelIndex, bEdit);
					}
				}
			}));

			oToolBar.addItem(new sap.ui.commons.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_BTN_REMOVE"),
				press: function(oEvent) {
					oController.delDisplayLayOut(oEvent);
				},
				enabled: {
					path: "viewCampIntegration>/CampaignApiFieldLayoutSelectedIndex",
					formatter: function(nSelectedIndex) {
						return oController.formatterFieldLayoutRemoveBtn(nSelectedIndex, bEdit);
					}
				}
			}));
			var oExampleBtn = new sap.ui.commons.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_EXAMPLE"),
				press: function(oEvent) {
					oController.onExamplePress(oEvent);
				}
			});

			oToolBar.addItem(oExampleBtn);
			return oToolBar;
		},
		_createCampaignApiFieldLayoutTable: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oMappingDropDownBox = this._createMappingFieldDropDown(bEdit);
			//var oSequenceDropDownBox = this._createSequenceDropDown(bEdit);
			this._oLayoutTable = new sap.ui.table.Table({
				rows: oController.getBoundPath("AttributesLayout"),
				selectionMode: sap.ui.table.SelectionMode.Single,
				rowSelectionChange: function(oEvent) {
					oController.onApiFieldLayoutTableChange(oEvent);
				},
				visibleRowCount: 5,
				columns: [
				    new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_SEQUENCE_NUMBER}"
						}),
						template: new sap.m.HBox({
							items: [
					     new sap.ui.commons.TextView({
									text: {
										path: oController.getFormatterPath("DISPLAY_SEQUENCE")
									}
								})
                        ]
						})
					}),
                    new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_MAPPING_CODE}"
						}),
						template:
					     new sap.ui.commons.TextView({
									text: {
										path: oController.getFormatterPath("MAPPING_FIELD_CODE")
									}
								})
					}),
				    new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_DISPLAY_NAME}"
						}),
						template: 
					     new sap.ui.commons.TextView({
									text: { 
										path: oController.getFormatterPath("DISPLAY_NAME")
									}
								})


					})]
			});

			return this._oLayoutTable;
		},
		_createCampaginApiFieldLayoutRow: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			this._oApiFieldLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 3,
				widths: ['15%', '20%','65%'],
				visible: {
					path: "viewCampIntegration>/CampaignApiFieldLayoutSelectedIndex",
					formatter: function(nSelectedIndex) {
						return oController.formatterFieldLayoutRemoveBtn(nSelectedIndex);
					}
				}
			});
			this._oApiFieldLayout.addStyleClass("sapUiSmallMarginTop");
			var oLblSequence = new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_SEQUENCE_NUMBER}"
			});
			var oSquence = new sap.ui.commons.TextView({
				text: oController.getBoundPath("DISPLAY_SEQUENCE")
			});
			//var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oLblSequence
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oSquence
				})]
			});
			this._oApiFieldLayout.addRow(oRow);
			
		   var oMappingDropDownBox = this._createMappingFieldDropDown(bEdit);
			//var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oDisplayFieldCodeRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_MAPPING_CODE}",
				required: true
			})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.m.HBox({
							items: [
					     new sap.ui.commons.TextView({
									text: {
										path: oController.getFormatterPath("MAPPING_FIELD_CODE")
									},
									visible: !bEdit
								}),
                           oMappingDropDownBox]
						})
				})]
			});
			this._oApiFieldLayout.addRow(oDisplayFieldCodeRow);
			var oDisplayNameRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_API_FIELD_DISPLAY_NAME}",
				required: true
			})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.m.HBox({
							items: [
					     new sap.ui.commons.TextView({
									text: {
										path: oController.getFormatterPath("DISPLAY_NAME")
									},
									visible: !bEdit
								}),
					     new sap.ui.commons.TextField({
									value: {
										path: oController.getFormatterPath("DISPLAY_NAME")
									},
									visible: bEdit
								// 	liveChange: function(oEvent){
								// 	 oController.onTextLiveChange(oEvent);   
								// 	}
									
								})]
						})
				})]
			});
			this._oApiFieldLayout.addRow(oDisplayNameRow);			

			return this._oApiFieldLayout;

		},
		_createMappingFieldDropDown: function(bEdit) {
			var oView = this;
			var oMappingFiedDropDownlist = new sap.ui.commons.DropdownBox({
				selectedKey: this.getBoundPath("MAPPING_FIELD_CODE"),
				visible: bEdit,
				change: function(oEvent) {
					oView.getController().onMappingFieldCodeChange(oEvent);
				}
			});
			var oItemTemp = new sap.ui.core.ListItem({
				key: "{inmAllCodeFields>FIELD_CODE}",
				text: "{inmAllCodeFields>FIELD_CODE}"
			});
			oMappingFiedDropDownlist.bindItems({
				path: "inmAllCodeFields>/",
				sorter: new sap.ui.model.Sorter('FIELD_CODE'),
				template: oItemTemp
			});
			return oMappingFiedDropDownlist;
		},
		_createSequenceDropDown: function(bEdit) {
			var oSequenceDropDownlist = new sap.ui.commons.DropdownBox({
				selectedKey: this.getBoundPath("DISPLAY_SEQUENCE"),
				visible: bEdit,
				change: function(oEvent) {
					//oView.getController().onINMAttriChange(oEvent, sFilterName);
				}
			});

			for (var i = 0; i < 8; i++) {
				oSequenceDropDownlist.addItem(new sap.ui.core.ListItem({
					key: i + 1,
					text: i + 1
				}));
			}

			return oSequenceDropDownlist;

		}
	};
}());