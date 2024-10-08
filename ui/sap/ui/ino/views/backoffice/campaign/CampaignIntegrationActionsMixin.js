/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.commons.MessageBox");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationActionsMixin = {
		onExamplePress: function(oEvent) {
			this.getView()._openExampleDialog(oEvent);
		},
		onPreview: function(oEvent) {
			var oBindingItems = this.getView()._oLayoutTable.getBinding("rows");
			var oContext = oBindingItems.getContext();
			// 			var oTextModel = this.getTextModel();
			var aAttributes = this.getModel().getProperty(oContext.sPath + "/AttributesLayout");
			if (!aAttributes || aAttributes.length < 1) {
				this.getThingInspectorController().clearFacetMessages();
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_CAMPAIGN_INTEGRATION_PREVIEW_NO_DATA");
				return;
			}
			this.getView()._displayPreviewLayout(oEvent, aAttributes);
		},
		newCampaignIntegration: function() {
			var nDefaultTaskKey = this._getViewPropertyValue("/NewSysIntegration");
			var sysIntegartionModel = this._getModel("sysIntegration");
			if (!nDefaultTaskKey || !sysIntegartionModel) {
				return;
			}
			var that = this;
			var oSysIntegration;
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			if (Number(nDefaultTaskKey) === -1) {
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_SYSTEM_EMPTY_WARNING'),
					null,
					that.getTextModel().getText("BO_INTEGRATION_MAPPING_SYSTEM_EMPTY_WARNING_TITLE")
				);
				return;
			} else {
				oSysIntegration = sysIntegartionModel.getProperty("/d/results").filter(function(item) {
					return item.ID === Number(nDefaultTaskKey);
				})[0];
			}
			if (oSysIntegration && !that._validateIntegrationDuplicateSysMapping(oSysIntegration)) {
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_SYSTEM_DUPLICATE_WARNING', [oSysIntegration.APINAME]),
					function() {},
					that.getTextModel().getText("BO_INTEGRATION_MAPPING_SYSTEM_DUPLICATE_WARNING_TITLE")
				);
				return;
			} else if (!oSysIntegration) {
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_SYSTEM_NO_INTEGRATION_SELECTED'),
					function() {},
					that.getTextModel().getText("BO_INTEGRATION_MAPPING_SYSTEM_NO_INTEGRATION_TITLE")
				);
				return;
			}
			this.getModel().newCampaignIntegration(oSysIntegration);
		},
		delCampaignIntegration: function() {
			if (this._getViewPropertyValue("/CampaignMappingSelectedIndex") < 0) {
				return;
			}
			var selectedIndex = this._getViewPropertyValue("/CampaignMappingSelectedIndex");
			this.getModel().deleteCampaignIntegration(selectedIndex);
			var total = this.getModel().getProperty("/CampaignIntegration").length;
			this._onMappingTableChange(selectedIndex >= total ? -1 : selectedIndex);
		},
		onMappingTableChange: function(oEvent) {
			this._onMappingTableChange(oEvent.getParameter("rowIndex"));
			var oBindingContext = oEvent.oSource.getContextByIndex(oEvent.getParameter("rowIndex"));
			this.getView()._oLayoutTable.setBindingContext(oBindingContext, this.getModelName());
		},
		onApiFieldLayoutTableChange: function(oEvent) {
			this._setViewPropertyValue("/CampaignApiFieldLayoutSelectedIndex", this.getView()._oLayoutTable.getSelectedIndex());
			var oBindingContext = oEvent.oSource.getContextByIndex(oEvent.getParameter("rowIndex"));
			this.getView()._oApiFieldLayout.setBindingContext(oBindingContext, this.getModelName());
		},
		onSysIntegrationChange: function(oEvent) {
			this._setViewPropertyValue("/NewSysIntegration", oEvent.getParameter("selectedItem").getProperty("key"));
		},
		onSegmentBtnChange: function(oEvent) {
			this._saveCurrentMappingModel();
			this._setViewPropertyValue("/SegmentBtnSelectedIndex", Number(oEvent.getParameter("item").getProperty("key")));
			this.getModel().setProperty("/SegmentBtnSelectedIndex", Number(oEvent.getParameter("item").getProperty("key")));
			var segmentIndex = Number(oEvent.getParameter("item").getProperty("key"));
			if (segmentIndex === 0) {
				this._setViewModel(new sap.ui.model.json.JSONModel(this._getModel("inmFields").getData().filter(function(oItem) {
					return oItem.TYPE_CODE === "REQUEST_MAPPING";
				})), "inmCurrentReqFields");
			} else if (segmentIndex === 1) {
				this._setViewModel(new sap.ui.model.json.JSONModel(this._getModel("inmFields").getData().filter(function(oItem) {
					return (!!oItem.FIELD_CODE && oItem.TYPE_CODE !== "NON_MAPPING_FIELD") || (!oItem.FIELD_CODE && oItem.TYPE_CODE ===
						"REQUEST_MAPPING");
				})), "inmCurrentReqFields");
			}
			this._changeCurrentMappingModel();
		},
		onRequestMappingChange: function(oEvent) {
			this._changeCurrentMappingFieldModel(oEvent.getSource().getSelectedIndex() === -1 ? "" : oEvent.getParameter("rowContext").sPath,
				"/CurrentSysIntegrationReqFields");
			this._changeMappingDetailVisible(oEvent.getSource().getSelectedIndex() === -1 ? "" : oEvent.getParameter("rowContext").sPath,
				"/CampaignMappingReqDetailVisible");
		},
		onResponseMappingChange: function(oEvent) {
			this._changeCurrentMappingFieldModel(oEvent.getSource().getSelectedIndex() === -1 ? "" : oEvent.getParameter("rowContext").sPath,
				"/CurrentSysIntegrationResFields");
			this._changeMappingDetailVisible(oEvent.getSource().getSelectedIndex() === -1 ? "" : oEvent.getParameter("rowContext").sPath,
				"/CampaignMappingResDetailVisible");
		},
		onMappingValueTypeChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingPath("selectedKey")
				.substr(0, oEvent.getSource().getBindingPath("selectedKey").lastIndexOf("/") + 1);
			if (oEvent.getParameter("newValue") === this._MAPPING_VALUE_TYPES.VARIANT) {
				this._setViewPropertyValue(sPath + "constantsValue", "");
			} else if (oEvent.getParameter("newValue") === this._MAPPING_VALUE_TYPES.CONSTANT) {
				this._setViewPropertyValue(sPath + "mappingField", "");
			} else {
				this._setViewPropertyValue(sPath + "mappingField", "");
				this._setViewPropertyValue(sPath + "constantsValue", "");
			}
		},
		onINMAttriChange: function(oEvent, sFilterName) {
			if (sFilterName !== "RESPONSE_MAPPING") {
				return;
			}
			var that = this;
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			var oSourceCtrl = oEvent.getSource();
			if (!this._validateIntegrationResponseInmAttriDuplicate(oEvent.getParameter("newValue"))) {
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_DUPLICATE_WARNING', [oEvent.getParameter("newValue")]),
					function() {
						oSourceCtrl.setSelectedKey('');
					},
					that.getTextModel().getText("BO_INTEGRATION_MAPPING_FIELD_DUPLICATE_WARNING_TITLE")
				);
			}
		},
		onCollapseAll: function(treeTable) {
			treeTable.collapseAll();
		},
		onExpandAll: function(treeTable) {
			var oView = this.getView(),
				oModel = oView.getController()._getViewPropertyValue(treeTable.getBindingInfo("rows").path),
				nLevel = 0,
				fnSumLevel = function(aChildren) {
					var nMaxLevel = 0,
						nCurrentLevel = 0;
					for (var index = 0; index <= aChildren.length - 1; index++) {
						nCurrentLevel = (!aChildren[index].children || aChildren[index].length <= 0) ? 0 : fnSumLevel(aChildren[index].children);
						if (nCurrentLevel > nMaxLevel) {
							nMaxLevel = nCurrentLevel;
						}
					}
					return ++nMaxLevel;
				};
			if (oModel && oModel.children) {
				nLevel = fnSumLevel(oModel.children);
			}
			treeTable.expandToLevel(nLevel);
		},
		_onMappingTableChange: function(rowIndex) {
			this._saveCurrentMappingModel();
			this._setViewPropertyValue("/CampaignMappingSelectedIndex", rowIndex);
			this.getModel().setProperty("/CampaignMappingSelectedIndex", rowIndex);
			this._changeCurrentMappingModel();
		},
		_changeCurrentMappingModel: function() {
			var rowIndex = this._getViewPropertyValue("/CampaignMappingSelectedIndex");
			var currentSysIntegration = this.getModel().getProperty("/CampaignIntegration")[rowIndex],
				currentSysDesitination = [];
			var destList = this._getModel("destList");
			var segBtnSelectedIndex = this._getViewPropertyValue("/SegmentBtnSelectedIndex");
			if (currentSysIntegration && segBtnSelectedIndex < 2) {
				currentSysIntegration.REQ_JSON_TREE = segBtnSelectedIndex === 1 ? (!currentSysIntegration.FETCH_REQ_JSON ? null : JSON.parse(
					currentSysIntegration.FETCH_REQ_JSON)) : JSON.parse(currentSysIntegration.CREATE_REQ_JSON);
				currentSysIntegration.RES_JSON_TREE = segBtnSelectedIndex === 1 ? (!currentSysIntegration.FETCH_RES_JSON ? null : JSON.parse(
					currentSysIntegration.FETCH_RES_JSON)) : (!currentSysIntegration.CREATE_RES_JSON ? null : JSON.parse(currentSysIntegration.CREATE_RES_JSON));
				currentSysDesitination = destList.getData().filter(function(item) {
					return item.standardPackage === currentSysIntegration.SYSTEM_PACKAGE_NAME && item.standardName === currentSysIntegration.SYSTEM_NAME;
				});
			}
			this._setViewPropertyValue("/CurrentSysIntegration", currentSysIntegration);
			this._setViewPropertyValue("/CurrentSysDesitination", currentSysDesitination.length > 0 ? currentSysDesitination[0] : null);
			this._changeCurrentMappingFieldModel("", "/CurrentSysIntegrationResFields");
			this._changeCurrentMappingFieldModel("", "/CurrentSysIntegrationReqFields");

			this._setViewPropertyValue("/CurrentReqMappingFieldSelIndex", -1);
			this._setViewPropertyValue("/CurrentResMappingFieldSelIndex", -1);

			this._changeMappingDetailVisible("", "/CampaignMappingReqDetailVisible");
			this._changeMappingDetailVisible("", "/CampaignMappingResDetailVisible");
			this._setViewPropertyValue("/CampaignApiFieldLayoutSelectedIndex", -1);
		},
		_changeCurrentMappingFieldModel: function(sPath, sPropertyName) {
			var oMappingField = this._getViewPropertyValue(sPath);
			if (!oMappingField) {
				this._setViewPropertyValue(sPropertyName, {
					dataType: "",
					constantsValue: "",
					mappingField: "",
					technicalName: "",
					displayName: "",
					displaySequence: ""
				});
				return;
			}
			if (oMappingField.hasOwnProperty("children") && oMappingField.children.length > 0) {
				oMappingField.dataType = "";
				oMappingField.constantsValue = "";
				oMappingField.mappingField = "";
				oMappingField.displayName = "";
				oMappingField.displaySequence = "";
			}
			this._setViewPropertyValue(sPropertyName, !sPath ? null : oMappingField);
		},
		_changeMappingDetailVisible: function(sPath, sPropertyName) {
			if (!sPath) {
				this._setViewPropertyValue(sPropertyName, false);
				return;
			}
			var oMappingField = this._getViewPropertyValue(sPath);
			if (!oMappingField || (oMappingField.hasOwnProperty("children") && oMappingField.children.length > 0)) {
				this._setViewPropertyValue(sPropertyName, false);
				return;
			}
			this._setViewPropertyValue(sPropertyName, true);
		},
		newDisplayLayOut: function(oEvent) {
			var oBindingItems = this.getView()._oLayoutTable.getBinding("rows");
			var oContext = oBindingItems.getContext();
			var aAttributes = this.getModel().getProperty(oContext.sPath + "/AttributesLayout");
			if (aAttributes && aAttributes.length === 11) {
				this.getThingInspectorController().clearFacetMessages();
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_CAMPAIGN_INTEGRATION_DISPLAY_ADD_LIMIT");
				return;
			}
			this.getModel().newFieldLayout(oContext);
			var iSelectedIndex = this.getModel().getProperty(oContext.sPath + "/AttributesLayout").length - 1;
			this.getView()._oLayoutTable.setSelectedIndex(iSelectedIndex);
			this._setViewPropertyValue("/CampaignApiFieldLayoutSelectedIndex", iSelectedIndex);
		},
		delDisplayLayOut: function(oEvent) {
			var oBindingItems = this.getView()._oLayoutTable.getBinding("rows");
			var oContext = oBindingItems.getContext();
			var iIndex = this.getView()._oLayoutTable.getSelectedIndex();
			var aLayoutList = this.getModel().getProperty(oContext.sPath + "/AttributesLayout");
			this.getModel().delFieldLayout(oContext, iIndex);
			if (iIndex === aLayoutList.length) {
				this._setViewPropertyValue("/CampaignApiFieldLayoutSelectedIndex", iIndex - 1);
				this.getView()._oLayoutTable.setSelectedIndex(iIndex - 1);
			} else {
				this._setViewPropertyValue("/CampaignApiFieldLayoutSelectedIndex", iIndex);
				this.getView()._oLayoutTable.setSelectedIndex(iIndex);
			}
		},
		onMappingFieldCodeChange: function(oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var oBindingInfo = oSource.getBindingInfo("selectedKey");
			var iSourceSequence = this.getView()._oLayoutTable.getSelectedIndex() + 1;
			var oBindingTableItems = this.getView()._oLayoutTable.getBinding("rows");
			var oTableContext = oBindingTableItems.getContext();
			var aAttributes = this.getModel().getProperty(oTableContext.sPath + "/AttributesLayout");
			var aUsedFieldCode = aAttributes.filter(function(oAttribute) {
				return oAttribute.DISPLAY_SEQUENCE !== iSourceSequence;
			});

			var oContext = oBindingInfo.binding.oContext;
			var aCodes = this._getModel("inmAllCodeFields").getData();
			if (oContext && oSource.getSelectedKey()) {
				var oINMAttr = aCodes.filter(function(oAttr) {
					return oAttr.FIELD_CODE === oSource.getSelectedKey();
				})[0];
				this.getModel().setProperty(oContext.sPath + "/DISPLAY_NAME", oINMAttr.TEXT_CODE);
			}

			var aConfilctFieldCode = [];
			aConfilctFieldCode = aUsedFieldCode.filter(function(oUsedFieldCode) {
				return oUsedFieldCode.MAPPING_FIELD_CODE === oSource.getSelectedKey();
			});
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			if (aConfilctFieldCode.length > 0) {
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_LAYOUT_FIELD_DUPLICATE_WARNING', [oEvent.getParameter("newValue")]),
					function() {
						oSource.setSelectedKey('');
					},
					that.getTextModel().getText("BO_INTEGRATION_LAYOUT_FIELD_DUPLICATE_WARNING_TITLE")
				);
			}

		},
		onTextLiveChange: function(oEvent) {
			var oSource = oEvent.getSource();
			var sText = oSource.getValue();
			if (sText.trim().length === 0) {
				oSource.setValueState("Error");
			} else {
				oSource.setValueState("None");
			}
		}
	};
}());