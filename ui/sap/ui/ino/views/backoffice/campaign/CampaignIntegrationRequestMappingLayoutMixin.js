/*!
 * @copyright@
 */

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationRequestMappingLayoutMixin = {
		_CONST_CAMPAIGN_INTEGRATION_REQUEST: {
			MAPPING_TABLE_PATH: {
				INM_ATTRI: "INM_ATTRI",
				VALUE_TYPE: "VALUE_TYPE",
				TARGET_SYSTEM: "TARGET_SYSTEM",
				VALUE: "VALUE"
			},
			MAPPING_TABLE_I18N_PATH: {
				INM_ATTRI: "BO_CAMPAIGN_INTEGRATION_FLD_REQUEST_INM",
				VALUE_TYPE: "BO_CAMPAIGN_INTEGRATION_FLD_REQUEST_VALUE_TYPE",
				TARGET_SYSTEM: "BO_CAMPAIGN_INTEGRATION_FLD_REQUEST_TARGET_SYS",
				VALUE: "BO_CAMPAIGN_INTEGRATION_FLD_REQUEST_VALUE"
			}
		},

		_createCampaignMappingRequestPanel: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var aColumns = [{
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.TARGET_SYSTEM,
				txt: ["viewCampIntegration>technicalName"]
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.INM_ATTRI,
				txt: ["viewCampIntegration>mappingField"],
				formatter: function(sMappingField) {
					return oView.getController().formatterMappingField(sMappingField);
				}
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.VALUE_TYPE,
				txt: ["viewCampIntegration>dataType"],
				formatter: function(sDataType) {
					return oView.getController().formatterDataTypeValue(sDataType);
				}
			}, {
				lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.VALUE,
				txt: ["viewCampIntegration>constantsValue"]
			}];

			var aRow = [
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.VALUE_TYPE,
					control: [oView._createValueType("{viewCampIntegration>/CurrentSysIntegrationReqFields/dataType}", function(oEvent) {
						oView.getController().onMappingValueTypeChange(oEvent);
					},"viewCampIntegration>/CurrentSysIntegrationReqFields/technicalName","REQUEST_MAPPING")]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.INM_ATTRI,
					control: [oView._createINMAttri("{viewCampIntegration>/CurrentSysIntegrationReqFields/mappingField}",
						"viewCampIntegration>/CurrentSysIntegrationReqFields/dataType", 'REQUEST_MAPPING')]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.VALUE,
					control: [new sap.m.Input({
						value: {
							path: "viewCampIntegration>/CurrentSysIntegrationReqFields/constantsValue"
						},
						editable: {
							parts: [{
								path: "viewCampIntegration>/CurrentSysIntegrationReqFields/dataType"
						    }],
							formatter: function(sDataType) {
								return oView.getController().formatterDataType(sDataType);
							}
						},
						enabled: {
							parts: [{
								path: "viewCampIntegration>/CurrentSysIntegrationReqFields/dataType"
						    }],
							formatter: function(sDataType) {
								return oView.getController().formatterDataType(sDataType);
							}
						}
					})]
			    },
				{
					lbl: oView._CONST_CAMPAIGN_INTEGRATION_REQUEST.MAPPING_TABLE_I18N_PATH.TARGET_SYSTEM,
					control: [new sap.m.Text({
						text: "{viewCampIntegration>/CurrentSysIntegrationReqFields/technicalName}"
					})]
			    }
			];
			var oPanel = new sap.m.Panel({
				visible: {
					parts: [{
						path: "viewCampIntegration>/CampaignMappingSelectedIndex"
					}, {
						path: "viewCampIntegration>/SegmentBtnSelectedIndex"
					}],
					formatter: function(nDestIndex, nSelIndex) {
						return nDestIndex > -1 && oView.getController().formatterResReqPanel(nSelIndex);
					}
				},
				headerText: {
					parts: [{
						path: "viewCampIntegration>/SegmentBtnSelectedIndex"
					}],
					formatter: function(nSelIndex) {
						var sTxtKey = "BO_CAMPAIGN_INTEGRATION_FLD_TITLE_REQUEST_MAPPING_MANDATORY";
						if (nSelIndex === 1) {
							sTxtKey = "BO_CAMPAIGN_INTEGRATION_FLD_TITLE_REQUEST_MAPPING";
						}
						return oController.getTextModel().getText(sTxtKey);
					}
				},
				content: [oView._createCampaignMappingTreeTable(aColumns, "viewCampIntegration>/CurrentSysIntegration/REQ_JSON_TREE",
					"viewCampIntegration>/CurrentReqMappingFieldSelIndex", function(oEvent) {
						oView.getController().onRequestMappingChange(oEvent);
					})]
			});
			if (bEdit) {
				oPanel.addContent(oView._createCampaignMappingTreeTableDetail(aRow, "viewCampIntegration>/CampaignMappingReqDetailVisible"));
			}
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPanel]
			}));
			oPanel.addStyleClass("sapInoCampIntegrationPanel");
			oLayout.addRow(oRow);
		}
	};
}());