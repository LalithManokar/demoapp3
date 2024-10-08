/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.ui.table.Column");
jQuery.sap.require("sap.m.Label");
jQuery.sap.require("sap.m.Text");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingCommonLayoutMixin = {
		_createCampaignMappingTreeTable: function(aColumn, sTreePath, sSelIndexPath, fnSelChange) {
			var oView = this;
			var treeTable = new sap.ui.table.TreeTable({
				selectedIndex: {
					path: sSelIndexPath
				},
				selectionMode: 'Single',
				rowSelectionChange: fnSelChange,
				columns: this._createCampaignMappingTreeTableColumn(aColumn),
				rows: {
					path: sTreePath,
					parameters: {
						arrayNames: ['children'],
						numberOfExpandedLevels: 1
					}
				},
				extension: new sap.m.OverflowToolbar({
					content: [new sap.m.Button({
						enabled: {
							path: "viewCampIntegration>/CampaignMappingSelectedIndex",
							formatter: function(nSelIndex) {
								return oView.getController().formatterRemoveBtn(nSelIndex);
							}
						},
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_COLLAPSE_ALL}",
						press: function() {
							oView.getController().onCollapseAll(treeTable);
						}
					}), new sap.m.Button({
						enabled: {
							path: "viewCampIntegration>/CampaignMappingSelectedIndex",
							formatter: function(nSelIndex) {
								return oView.getController().formatterRemoveBtn(nSelIndex);
							}
						},
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_EXPAND_ALL}",
						press: function() {
							oView.getController().onExpandAll(treeTable);
						}
					})]
				})
			});
			return treeTable;
		},

		_createCampaignMappingTreeTableColumn: function(aColumn) {
			var aTColumn = [],
				aPath = [];
			var oView = this;
			for (var tcIndex = 0; tcIndex < aColumn.length; tcIndex++) {
				aPath = [];
				aColumn[tcIndex].txt.forEach(function(sPath) {
					aPath.push({
						path: sPath
					});
				});
				aTColumn.push(new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: aColumn[tcIndex].lbl
					}),
					template: new sap.m.Text({
						text: {
							parts: aPath,
							formatter: aColumn[tcIndex].formatter
						}
					})
				}));
			}
			return aTColumn;
		},

		_createCampaignMappingTreeTableDetail: function(aRows, sVisiblePath) {
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				visible: {
					parts: [{
						path: sVisiblePath
				    }]
				},
				columns: 3,
				widths: ['180px', '35%', '65%']
			});
			if (aRows && aRows.length > 0) {
				for (var index = 0; index < aRows.length; index++) {
					this._createCampaignMappingTreeTableDetailRow(oLayout, aRows[index].lbl, aRows[index].control);
				}
			}
			oLayout.addStyleClass("sapInoCampIntegrationMappingSmallMarginTop");
			return oLayout;
		},

		_createCampaignMappingTreeTableDetailRow: function(oLayout, sLbl, aControls) {
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oView = this;
			if (!sLbl) {
				oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			} else {
				oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oView.createControl({
						Type: "label",
						Text: sLbl,
						LabelControl: aControls[0]
					})]
				}));
			}
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.m.HBox({
					items: aControls
				})
			}));
			oLayout.addRow(oRow);
		},

		_createINMAttri: function(sSelKeyPath, sEnablePath, sFilterName) {
			var oView = this,
				sModelName = "inmCurrentReqFields";
			if (sFilterName === "RESPONSE_MAPPING") {
				sModelName = "inmCurrentResFields";
			}
			var oINMAttr = new sap.ui.commons.DropdownBox({
				width: "164px",
				selectedKey: sSelKeyPath,
				editable: {
					parts: [{
						path: sEnablePath
				    }],
					formatter: function(sDataType) {
					    if(sFilterName === "RESPONSE_MAPPING"){
					        return true;
					    }
						return !!sDataType && !oView.getController().formatterDataType(sDataType);
					}
				},
				enabled: {
					parts: [{
						path: sEnablePath
				    }],
					formatter: function(sDataType) {
					    if(sFilterName === "RESPONSE_MAPPING"){
					        return true;
					    }
						return !!sDataType && !oView.getController().formatterDataType(sDataType);
					}
				},
				change: function(oEvent) {
					oView.getController().onINMAttriChange(oEvent, sFilterName);
				},
				displaySecondaryValues: true
			});
			var oItemTemp = new sap.ui.core.ListItem({
				key: "{" + sModelName + ">FIELD_CODE}",
				text: "{" + sModelName + ">FIELD_CODE}",
				additionalText: "{" + sModelName + ">TEXT_CODE}"
			});
			oINMAttr.bindItems({
				path: sModelName + ">/",
				sorter: new sap.ui.model.Sorter('FIELD_CODE'),
				template: oItemTemp
			});
			return oINMAttr;
		},

		_createValueType: function(sSelKeyPath, fnChange, sEnablePath, sFilterName) {
			var oView = this;
			var oValueType = new sap.ui.commons.DropdownBox({
				width: "164px",
				selectedKey: sSelKeyPath,
				editable: {
					parts: [{
						path: sEnablePath
				    }],
					formatter: function(sTechnicalName) {
					    if(sFilterName !== "RESPONSE_MAPPING"){
					        return true;
					    }
					    if(sTechnicalName){
					        return true;
					    }
						return false; 
					}
				},
				enabled: {
					parts: [{
						path: sEnablePath
				    }],
					formatter: function(sTechnicalName) {
					    if(sFilterName !== "RESPONSE_MAPPING"){
					        return true;
					    }
					    if(sTechnicalName){
					        return true;
					    }
						return false; 
					}
				},
				change: fnChange
			});
			oValueType.addItem(new sap.ui.core.ListItem({
				key: "",
				text: ""
			}));
			oValueType.addItem(new sap.ui.core.ListItem({
				key: oView.getController()._MAPPING_VALUE_TYPES.VARIANT,
				text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_VARIANT_ITEM}"
			}));
			oValueType.addItem(new sap.ui.core.ListItem({
				key: oView.getController()._MAPPING_VALUE_TYPES.CONSTANT,
				text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_CONSTANT_ITEM}"
			}));
			return oValueType;
		}
	};
}());