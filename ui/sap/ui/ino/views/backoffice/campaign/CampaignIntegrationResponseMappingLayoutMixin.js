/*!
 * @copyright@
 */

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationResponseMappingLayoutMixin = {
		_CONST_CAMPAIGN_INTEGRATION_RESPONSE: {
			MAPPING_TABLE_PATH: {
				INM_ATTRI: "INM_ATTRI",
				VALUE_TYPE: "VALUE_TYPE",
				TARGET_SYSTEM: "TARGET_SYSTEM",
				VALUE: "VALUE"
			},
			MAPPING_TABLE_I18N_PATH: {
				INM_ATTRI: "BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_INM",
				VALUE_TYPE: "BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_VALUE_TYPE",
				TARGET_SYSTEM: "BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_TARGET_SYS",
				VALUE: "BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_VALUE"
			}
		},
		_createCampaignMappingResponsePanel: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var aColumns = [{
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.TARGET_SYSTEM,
				txt: ["viewCampIntegration>technicalName"]
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.INM_ATTRI,
				txt: ["viewCampIntegration>mappingField"],
				formatter: function(sMappingField) {
					return oView.getController().formatterMappingField(sMappingField);
				}
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.VALUE_TYPE,
				txt: ["viewCampIntegration>dataType"],
				formatter: function(sDataType) {
					return oView.getController().formatterDataTypeValue(sDataType);
				}
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.VALUE,
				txt: ["viewCampIntegration>constantsValue"]
			}];
			var oExampleBtn = new sap.m.Button({
				text: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_FLD_RESPONSE_EXAMPLE"),
				press: function(oEvent) {
					oController.onExamplePress(oEvent);
				}
			});
			oExampleBtn.addStyleClass("sapInoCampIntegrationMappingSmallMarginLeft");
			var aRow = [
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.VALUE_TYPE,
					control: [oView._createValueType("{viewCampIntegration>/CurrentSysIntegrationResFields/dataType}", function(oEvent) {
						oView.getController().onMappingValueTypeChange(oEvent);
					},"viewCampIntegration>/CurrentSysIntegrationResFields/technicalName","RESPONSE_MAPPING")]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.TARGET_SYSTEM,
					control: [new sap.m.Text({
						text: "{viewCampIntegration>/CurrentSysIntegrationResFields/technicalName}"
					})]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.INM_ATTRI,
					control: [oView._createINMAttri("{viewCampIntegration>/CurrentSysIntegrationResFields/mappingField}",
						"viewCampIntegration>/CurrentSysIntegrationResFields/dataType", 'RESPONSE_MAPPING')]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_RESPONSE.MAPPING_TABLE_I18N_PATH.VALUE,
					control: [new sap.m.Input({
						value: {
							path: "viewCampIntegration>/CurrentSysIntegrationResFields/constantsValue"
						},
						editable: {
							parts: [{
								path: "viewCampIntegration>/CurrentSysIntegrationResFields/dataType"
						    }],
							formatter: function(sDataType) {
								return oView.getController().formatterDataType(sDataType);
							}
						},
						enabled: {
							parts: [{
								path: "viewCampIntegration>/CurrentSysIntegrationResFields/dataType"
						    }],
							formatter: function(sDataType) {
								return oView.getController().formatterDataType(sDataType);
							}
						}
					})]
			    }
			];
			var oPanel = new sap.m.Panel({
				visible: {
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"},{path: "viewCampIntegration>/SegmentBtnSelectedIndex"}],
					formatter: function(nDestIndex, nSelIndex) {
						return nDestIndex > -1 && oView.getController().formatterResReqPanel(nSelIndex);
					}
				},
				headerText: oController.getTextModel().getText("BO_CAMPAIGN_INTEGRATION_FLD_TITLE_RESPONSE_MAPPING"),
				content: [oView._createCampaignMappingTreeTable(aColumns, "viewCampIntegration>/CurrentSysIntegration/RES_JSON_TREE",
					"viewCampIntegration>/CurrentResMappingFieldSelIndex", function(
						oEvent) {
						oView.getController().onResponseMappingChange(oEvent);
					})]
			});
			if (bEdit) {
				oPanel.addContent(oView._createCampaignMappingTreeTableDetail(aRow, "viewCampIntegration>/CampaignMappingResDetailVisible"));
			}
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPanel]
			}));
			oPanel.addStyleClass("sapInoCampIntegrationPanel");
			oLayout.addRow(oRow);
		}
	};
}());