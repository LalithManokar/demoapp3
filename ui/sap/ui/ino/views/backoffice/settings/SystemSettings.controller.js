/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.models.object.LocalSystemSetting");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.Token");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.settings.SystemSettings", {

	onValueChanged: function(oEvent) {
		var oLocalSystemSetting = oEvent.getSource().getBindingContext().getObject();
		var oNewValue;
		var oCurrentBind = oEvent.getSource().getBindingInfo("checked");
		var i18nModel = sap.ui.getCore().getModel("i18n").getResourceBundle();
		if (oEvent.getParameter) {
			if (oCurrentBind && oCurrentBind.binding && /EXPORT_IDEALIST_VIA_EMAIL_ACTIVE/gim.test(oCurrentBind.binding.getContext().sPath) && !
				oEvent.getSource().getProperty(
					"checked")) {
				sap.m.MessageBox.show(i18nModel.getText("BO_LOCAL_SYSTEM_SETTING_MSG_WARNING_INFO"), sap.m.MessageBox.Icon.INFORMATION, i18nModel.getText(
					"BO_LOCAL_SYSTEM_SETTING_TIT_WARNING"), [
						sap.m.MessageBox.Action.OK]);
			}
			if (oEvent.getParameter("liveValue") !== undefined) {
				oNewValue = oEvent.getParameter("liveValue");
			}
			if (oEvent.getParameter("checked") !== undefined) {
				oNewValue = oEvent.getParameter("checked") ? 1 : 0;
			}
			if (oEvent.getParameter("selectedItem") !== undefined) {
				oNewValue = oEvent.getParameter("selectedItem").getKey();
			}
			if (oEvent.getParameter("selectedItems") !== undefined) {
				oNewValue = oEvent.getParameter("selectedItems").map(function(oItem) {
					return oItem.getKey();
				}).join(",");
			}
			if (oNewValue !== undefined) {
				this.updateValue(oLocalSystemSetting, oNewValue);
			}
		}
	},

	hasPendingChanges: function() {
		if (this.aChangedLocalSystemSetting) {
			return true;
		}

		return false;
	},

	onSetDefaultValue: function(oEvent) {
		var oLocalSystemSetting = oEvent.getSource().getBindingContext().getObject();
		var oInput = this.aButtonToInput[oEvent.getSource().getId()];
		if (oInput.setChecked) {
			oInput.setChecked(oLocalSystemSetting.DEFAULT_VALUE === "1");
			if (oLocalSystemSetting.CODE === "sap.ino.config.SWA_ACTIVE") {
				this._toggleTrackUsageConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_NEW_NOTIFICATION") {
				this._toggleNewNotificationConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_DELETE_NOTIFICATION_HIS") {
				this._toggleEnableNotificationDelConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_DELETE_INTEGRATION_HISTORY") {
				this._toggleEnableIntegrationDelConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ANONYMOUS_ENABLE") {
				this._toggleEnableAnonymousSettingConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ANONYMOUS_FOR_ENABLE_PARTLY") {
				this._toggleEnableAnonymousPartiallyOptionSettingConfig(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_IDEA_COMPANY_VIEW") {
				this._toggleEnableIdeaCompanyView(oInput.getChecked());
			} else if (oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_RETENTION_PERIOD") {
				this._toggleEnableRetetionPeriod(oInput.getChecked());
			} else if(oLocalSystemSetting.CODE === "sap.ino.config.ENABLE_CUSTOM_REPORTS"){
			    this._toggleEnableCustomReports(oInput.getChecked());
			}
		} else if (oInput.setSelectedKey) {
			oInput.setSelectedKey(oLocalSystemSetting.DEFAULT_VALUE);
		} else if (oInput.setSelectedKeys) {
			oInput.setSelectedKeys(oLocalSystemSetting.DEFAULT_VALUE.split(","));
			if (oInput.data("relControl")) {
				this.resetRelControlValue(oInput);
			}
		} else if (oInput.setValue) {
			oInput.setValue(oLocalSystemSetting.DEFAULT_VALUE);
		} else if (oInput.setAttachmentId) {
			oInput.setAttachmentId(undefined);
		}
		this.updateValue(oLocalSystemSetting, oLocalSystemSetting.DEFAULT_VALUE);
	},

	updateValue: function(oLocalSystemSetting, sNewValue) {
		if (this.aChangedLocalSystemSetting === undefined) {
			this.aChangedLocalSystemSetting = {};
		}
		this.aChangedLocalSystemSetting[oLocalSystemSetting.CODE] = oLocalSystemSetting;
		if (this.aChangedLocalSystemSettingNewValue === undefined) {
			this.aChangedLocalSystemSettingNewValue = {};
		}
		if (sNewValue !== null) {
			sNewValue = sNewValue + "";
		}
		this.aChangedLocalSystemSettingNewValue[oLocalSystemSetting.CODE] = sNewValue;
		if (oLocalSystemSetting.CODE === "sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION" || (sNewValue && sNewValue.split(",").length > 1 &&
			oLocalSystemSetting.DEFAULT_VALUE && oLocalSystemSetting.DEFAULT_VALUE.split(",").length > 1)) {
			this.aCodeToButton[oLocalSystemSetting.CODE].setEnabled(this.campareMultiValues(sNewValue, oLocalSystemSetting.DEFAULT_VALUE));
		}
		// 		else {
		// 		    this.aCodeToButton[oLocalSystemSetting.CODE].setEnabled(sNewValue !== oLocalSystemSetting.DEFAULT_VALUE);
		// 		}
		this.getView().oSaveButton.setEnabled(true);
		this.getView().oSystemSettings[oLocalSystemSetting.CODE] = sNewValue;
	},

	onSavePressed: function() {
		var that = this;

		var bIsActive = this.getView().oSystemSettings["sap.ino.config.REWARD_ACTIVE"];
		var sRewardUnitCode = this.getView().oSystemSettings["sap.ino.config.REWARD_UNIT_CODE"];
		var oData = this.getView().getModel().oData;
		var oIdeaFilter = {};
		jQuery.each(oData, function(iIndex, oSetting) {
			if (oSetting.CODE === "sap.ino.config.IDEA_FILTERS_CONFIG") {
				oIdeaFilter[oSetting.CODE] = {
					CODE: oSetting.CODE,
					CODE_TABLE: oSetting.CODE_TABLE,
					DATATYPE_CODE: oSetting.DATATYPE_CODE,
					DEFAULT_VALUE: oSetting.DEFAULT_VALUE,
					GROUP_ID: oSetting.GROUP_ID,
					GROUP_ORDER: oSetting.GROUP_ORDER,
					HAS_LOCAL_SYSTEM_SETTING: oSetting.HAS_LOCAL_SYSTEM_SETTING,
					ID: oSetting.ID,
					VALUE: oSetting.VALUE
				};
			}
			if (oSetting.CODE === "sap.ino.config.ENABLE_IDEA_COMPANY_VIEW") {
				oIdeaFilter[oSetting.CODE] = {
					CODE: oSetting.CODE,
					CODE_TABLE: oSetting.CODE_TABLE,
					DATATYPE_CODE: oSetting.DATATYPE_CODE,
					DEFAULT_VALUE: oSetting.DEFAULT_VALUE,
					GROUP_ID: oSetting.GROUP_ID,
					GROUP_ORDER: oSetting.GROUP_ORDER,
					HAS_LOCAL_SYSTEM_SETTING: oSetting.HAS_LOCAL_SYSTEM_SETTING,
					ID: oSetting.ID,
					VALUE: oSetting.VALUE
				};
			}

		});

		//var checkReward = true;
		if (this.aChangedLocalSystemSetting) {
			var oSettingCompanyView = this.aChangedLocalSystemSetting["sap.ino.config.ENABLE_IDEA_COMPANY_VIEW"];
			var bEnableCompanyView = oSettingCompanyView ? oSettingCompanyView.VALUE : oIdeaFilter["sap.ino.config.ENABLE_IDEA_COMPANY_VIEW"].VALUE;
			if (!(bEnableCompanyView * 1)) {
				var oIdeaFilterConfig = that.aChangedLocalSystemSetting["sap.ino.config.IDEA_FILTERS_CONFIG"];
				oIdeaFilterConfig = oIdeaFilterConfig ? oIdeaFilterConfig : oIdeaFilter["sap.ino.config.IDEA_FILTERS_CONFIG"];
				var oIdeaFilterConfigNewValue = that.aChangedLocalSystemSettingNewValue["sap.ino.config.IDEA_FILTERS_CONFIG"];
				oIdeaFilterConfigNewValue = oIdeaFilterConfigNewValue ? oIdeaFilterConfigNewValue : oIdeaFilter["sap.ino.config.IDEA_FILTERS_CONFIG"].VALUE;

				if (oIdeaFilterConfigNewValue && (oIdeaFilterConfigNewValue.indexOf("COMPANY_VIEW") > -1 || oIdeaFilterConfigNewValue.indexOf(
					",COMPANY_VIEW"))) {
					var aNewString = oIdeaFilterConfigNewValue.split(",");
					aNewString = aNewString.filter(function(oValue) {
						return oValue !== "COMPANY_VIEW";
					});
					oIdeaFilterConfigNewValue = aNewString.join(",");
				}

				that.aChangedLocalSystemSetting["sap.ino.config.IDEA_FILTERS_CONFIG"] = oIdeaFilterConfig;
				that.aChangedLocalSystemSettingNewValue["sap.ino.config.IDEA_FILTERS_CONFIG"] = oIdeaFilterConfigNewValue;
			}

			if (that.getView().oSystemSettings["sap.ino.config.REWARD_ACTIVE"] === '1' && !that.getView().oSystemSettings[
				"sap.ino.config.REWARD_UNIT_CODE"]) {
				var oRewardMessages = new sap.ui.ino.application.Message({
					text: sap.ui.getCore().getModel("i18n").getResourceBundle().getText("BO_LOCAL_SYSTEM_SETTING_REWARD_ACTIVE_ALLOWED_MANDATORY"),
					key: "MSG_CAMPAIGN_SUBMIT_TO_MANDATORY",
					level: sap.ui.core.MessageType.Error,
					group: "SYSTEM_SETTING"
				});
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages([oRewardMessages]);
				return;
			}
			if (that.getView().oSystemSettings["sap.ino.config.ENABLE_RETENTION_PERIOD"] === "1" && that.getView().oSystemSettings[
				"sap.ino.config.RETENTION_PERIOD_VALUE"] <= 0) {
				var oRetentionPeriodMessages = new sap.ui.ino.application.Message({
					text: sap.ui.getCore().getModel("i18n").getResourceBundle().getText("BO_LOCAL_SYSTEM_SETTING_RETENTION_PERIOD_VALUE_INCONSITENT"),
					key: "MSG_RETENTION_PERIOD_VALUE_NEGATIVE",
					level: sap.ui.core.MessageType.Error,
					group: "local_system_settings"
				});
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages([oRetentionPeriodMessages]);
				return;
			} else if (that.getView().oSystemSettings["sap.ino.config.ENABLE_RETENTION_PERIOD"] === "0") {
				delete this.aChangedLocalSystemSettingNewValue["sap.ino.config.RETENTION_PERIOD_VALUE"];
				delete this.aChangedLocalSystemSetting["sap.ino.config.RETENTION_PERIOD_VALUE"];
				delete this.aChangedLocalSystemSettingNewValue["sap.ino.config.RETENTION_PERIOD_UNIT"];
			}
			
			if (that.getView().oSystemSettings["sap.ino.config.ENABLE_CUSTOM_REPORTS"] === "1" && that.getView().oSystemSettings[
				"sap.ino.config.CUSTOM_REPORTS_TILE_NAME"].length === 0) {
				var oCustomReportMessages = new sap.ui.ino.application.Message({
					text: sap.ui.getCore().getModel("i18n").getResourceBundle().getText("BO_LOCAL_SYSTEM_SETTING_CUSTOM_REPORTS_TILE_NAME_NULL"),
					key: "MSG_CUSTOM_REPORTS_TILE_NAME_NULL",
					level: sap.ui.core.MessageType.Error,
					group: "local_system_settings"
				});
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages([oCustomReportMessages]);
				return;
			} else if (that.getView().oSystemSettings["sap.ino.config.ENABLE_CUSTOM_REPORTS"] === "0") {
				delete this.aChangedLocalSystemSettingNewValue["sap.ino.config.CUSTOM_REPORTS_TILE_NAME"];
				delete this.aChangedLocalSystemSetting["sap.ino.config.CUSTOM_REPORTS_TILE_NAME"];
			}
			var aPromises = [];
			jQuery.each(this.aChangedLocalSystemSetting, function(iIndex, oLocalSystemSetting) {
				var iId = oLocalSystemSetting.ID || undefined;
				var oChangedLocalSystemSetting = {
					ID: iId,
					CODE: oLocalSystemSetting.CODE,
					VALUE: that.aChangedLocalSystemSettingNewValue[oLocalSystemSetting.CODE]
				};

				if (oLocalSystemSetting.DATATYPE_CODE === "BLOB") {
					var sRoleTypeCode = null;
					switch (oLocalSystemSetting.CODE) {
						case "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_BACKGROUND_IMAGE":
							sRoleTypeCode = "BACKGROUND_IMG";
							break;
						case "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_LOGO_IMAGE":
							sRoleTypeCode = "LOGO_IMG";
							break;
						case "sap.ino.config.URL_PATH_UI_MOBILE_SMALL_DEFAULT_BACKGROUND_IMAGE":
							sRoleTypeCode = "SMALL_BACKGROUND_IMG";
							break;
					}
					oChangedLocalSystemSetting.Attachments = [];
					if (that.aChangedLocalSystemSettingNewValue[oLocalSystemSetting.CODE] !== oLocalSystemSetting.DEFAULT_VALUE && sRoleTypeCode) {
						oChangedLocalSystemSetting.Attachments.push({
							ATTACHMENT_ID: parseInt(that.aChangedLocalSystemSettingNewValue[oLocalSystemSetting.CODE]),
							ROLE_TYPE_CODE: sRoleTypeCode
						});
					}
				}
				var oModify = sap.ui.ino.models.object.LocalSystemSetting.modify(iId, oChangedLocalSystemSetting);
				aPromises.push(oModify);
				oModify.fail(function(oResponse) {
					var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
						"local_system_settings");
					if (aActionMessages && aActionMessages.length > 0) {
						sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
					}
				});
				// if (checkReward && that.getView().oSystemSettings["sap.ino.config.REWARD_ACTIVE"] === '1' && !that.getView().oSystemSettings["sap.ino.config.REWARD_UNIT_CODE"]){
				//     aPromises.push(oModify);
				//     oModify.fail(function(oResponse) {
				//         var aMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(), "local_system_settings");
				//         if (aMessages && aMessages.length > 0) {
				//             sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aMessages);
				//         }
				//   });
				//   checkReward = false;

				// }

			});

			jQuery.when.apply(undefined, aPromises).done(function() {
				//synchronize reward active status
				var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
				oSystemSetting.setProperty("/sap.ino.config.REWARD_ACTIVE", bIsActive);
				oSystemSetting.setProperty("/sap.ino.config.REWARD_UNIT_CODE", sRewardUnitCode);

				var oView = that.getView();
				oView.oSaveButton.setEnabled(false);
				//oView.bindRows();
				oView.refreshRows();
				that.aChangedLocalSystemSetting = undefined;
				that.aChangedLocalSystemSettingNewValue = undefined;
				var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
				var oMessageParameters = {
					key: "MSG_LOCAL_SETTINGS_SAVED",
					level: sap.ui.core.MessageType.Success,
					parameters: [],
					group: "local_system_settings",
					text: oMsg.getResourceBundle().getText("MSG_LOCAL_SETTINGS_SAVED")
				};

				var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				sap.ui.ino.application.Configuration.getBackendConfiguration(true, true);
				oApp.removeNotificationMessages("local_system_settings");
				oApp.addNotificationMessage(oMessage);
			});
		}
	},

	mapButtonToInput: function(sId, oInput) {
		if (this.aButtonToInput === undefined) {
			this.aButtonToInput = {};
		}
		this.aButtonToInput[sId] = oInput;
	},

	mapCodeToButton: function(sCode, oButton) {
		if (this.aCodeToButton === undefined) {
			this.aCodeToButton = {};
		}
		this.aCodeToButton[sCode] = oButton;
	},

	setFrontofficeBackgroundImage: function(oLocalSystemSetting, iAttachmenId, sFileName, sMediaType) {
		this.updateValue(oLocalSystemSetting, {
			ATTACHMENT_ID: iAttachmenId,
			FILE_NAME: sFileName,
			MEDIA_TYPE: sMediaType
		});
	},

	getCodeModelPrefix: function() {
		return "code>";
	},

	campareMultiValues: function(sNewValue, sDefaultValue) {
		var aNewValues = sNewValue.split(",").sort();
		var aDefaultValues = sDefaultValue.split(",").sort();
		return aNewValues.join(",") !== aDefaultValues.join(",");
	},

	resetRelControlValue: function(oControl) {
		var oRelControl = oControl.data("relControl");
		if (oRelControl.getMetadata().getName() === "sap.m.Tokenizer") {
			oRelControl.setTokens(oControl.getSelectedItems().map(function(oItem) {
				return new sap.m.Token({
					key: oItem.getKey(),
					text: oItem.getText()
				});
			}));
		}
	},

	handleEnableTrackUsage: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleTrackUsageConfig(bChecked);
	},

	_toggleTrackUsageConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oUsageReportingRow, bVisible);
	},

	handleEnableNewNotificationChange: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleNewNotificationConfig(bChecked);
	},

	_toggleNewNotificationConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oActiveJobRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oImmeMailTemplateRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oSummaryMailTemplateTextRow, bVisible);
	},
	handleEnableRetentionPeriod: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		var oSource = oEvent.getSource();
		var that = this;
		var i18nModel = sap.ui.getCore().getModel("i18n").getResourceBundle();
		if (bChecked) {
			sap.m.MessageBox.show(i18nModel.getText("BO_LOCAL_SYSTEM_SETTING_MSG_CHECK_ENABLE_RETENTION"), {
				icon: sap.m.MessageBox.Icon.WARNING,
				title: i18nModel.getText("BO_LOCAL_SYSTEM_SETTING_TIT_WARNING"),
				actions: [sap.m.MessageBox.Action.CANCEL, sap.m.MessageBox.Action.OK],
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.CANCEL) {
						oSource.setChecked(false);
					} else {
						that._toggleEnableRetetionPeriod(bChecked);
					}
				}
			});
		} else {
			that._toggleEnableRetetionPeriod(bChecked);
		}
	},
	handleEnableCustomReports: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
          this._toggleEnableCustomReports(bChecked);			

	},
	_toggleEnableCustomReports: function(bVisible){
	    var oView = this.getView();
	    oView.toggleMatrixRowDisplay(oView._oCustomReportsTileNameRow, bVisible);			
	},

	_toggleEnableRetetionPeriod: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oRetentionPeriodValueRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oRetentionPeriodUnitRow, bVisible);
	},

	handleEnableIntegrationDeletion: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleEnableIntegrationDelConfig(bChecked);
	},

	_toggleEnableIntegrationDelConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oDeletionOfIntegrationRow, bVisible);
	},

	handleEnableNotificationDeletion: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleEnableNotificationDelConfig(bChecked);
	},

	_toggleEnableNotificationDelConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oDeletionOfNotificationRow, bVisible);
	},

	handleEnableIdeaCompanyView: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleEnableIdeaCompanyView(bChecked);
	},
	_toggleEnableIdeaCompanyView: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oEnableIdeaCompanyViewRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oEnableIdeaCompanyViewTxtRow, bVisible);
		// if(!bVisible){
		//     var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
		//     oSystemSetting.setProperty("/sap.ino.config.IDEA_COMPANY_VIEW_TXT",null);
		//     oSystemSetting.setProperty("/sap.ino.config.IDEA_COMPANY_VIEW_OPTION",null);
		// }
	},

	handleEnableAnonymousSetting: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleEnableAnonymousSettingConfig(bChecked);
	},

	_toggleEnableAnonymousSettingConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oAnonymousEnableAllRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oAnonymousEnablePartiallyRow, bVisible);
		oView.toggleMatrixRowDisplay(oView._oAnonymousEnablePartiallyOptionRow, oView._oAnonymousEnablePartiallyCheckbox.getChecked() &&
			bVisible);
	},

	handleEnableAnonymousPartiallyOptionSetting: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		this._toggleEnableAnonymousPartiallyOptionSettingConfig(bChecked);
	},

	_toggleEnableAnonymousPartiallyOptionSettingConfig: function(bVisible) {
		var oView = this.getView();
		oView.toggleMatrixRowDisplay(oView._oAnonymousEnablePartiallyOptionRow, bVisible);
	},

	resetButtonEnable: function(vValue, vDefaultValue) {
		if (!vDefaultValue) {
			return false;
		}
		vDefaultValue += "";
		vValue += "";
		return vValue !== vDefaultValue;
	},
	handleDisableIdeaImage: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		var oView = this.getView();
		if (bChecked) {
			oView._oDisableIdeaImageCheckbox.setEnabled(false);
		} else {
			oView._oDisableIdeaImageCheckbox.setEnabled(true);
		}

	},
	handleDisableIdeaImagePhaseBar: function(oEvent) {
		var bChecked = oEvent.getParameter("checked");
		var oView = this.getView();
		if (bChecked) {
			oView._oDisableIdeaImageHidePhaseBarCheckbox.setEnabled(false);
		} else {
			oView._oDisableIdeaImageHidePhaseBarCheckbox.setEnabled(true);
		}

	}

});