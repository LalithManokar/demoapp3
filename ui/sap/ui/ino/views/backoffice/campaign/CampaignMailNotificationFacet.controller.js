/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignMailNotificationFacet", jQuery.extend({}, sap.ui.ino.views.common
	.FacetAOController, {
		onEnterEditMode: function() {
			var oModel = this.getModel();
			if (oModel && !oModel.getProperty("/CampaignNotificationRefrsh")) {
				oModel.determinNotificationCreate();
			}
			var oViewModel = this._getViewModel();
			if (oViewModel) {
				oViewModel.setProperty("/ActionSelectedIndex", -1);
			}
		},
		
		onExitEditMode : function() {
			var oModel = this.getModel();
			if (oModel) {
				oModel.determinNotificationCreate();
			}
			var oViewModel = this._getViewModel();
			if (oViewModel) {
				oViewModel.setProperty("/ActionSelectedIndex", -1);
			}
        },

		onLiveChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
		},

		onAfterModeSwitch: function() {
			this._initialLanguageBinding();
			this._initialTemplateBinding();
			this._getViewModel().setProperty('/EditMode', this.isInEditMode());
		},

		_initViewModel: function() {
			if (!this._getViewModel()) {
				var oViewData = {
					ActionSelectedIndex: -1,
					ActionSelectedCode: '',
					ActionSelectedName: '',
					StatusModelSelectedIndex: -1,
					StatusModelSelectedCode: '',
					TransitionSelectedIndex: -1,
					TransitionSelectedCode: '',
					AllowMailNotification: false,
					TextModuleCode: '',
					Role: [],
					Language: '',
					EditMode: this.isInEditMode()
				};
				this._setViewModel(new sap.ui.model.json.JSONModel(jQuery.extend(true, {}, oViewData)),
					'viewCampNotification');
			}
		},

		_initStatusModel: function() {
			var aPhase = this.getModel().getProperty('/Phases');
			var aStatusModel = [];
			var sStatusModelCode = '';
			var iStatusIndex = -1;

			function _find(o, j) {
				if (o.CODE === sStatusModelCode && iStatusIndex === -1) {
					iStatusIndex = j;
				}
			}
			for (var i = 0; i < aPhase.length; i++) {
				var oStatusModel = {
					'CODE': aPhase[i].STATUS_MODEL_CODE,
					'PACKAGE_ID': aPhase[i].PACKAGE_ID,
					'DEFAULT_TEXT': aPhase[i].DEFAULT_TEXT
				};
				sStatusModelCode = aPhase[i].STATUS_MODEL_CODE;
				iStatusIndex = -1;
				aStatusModel.forEach(_find);
				if (iStatusIndex === -1) {
					aStatusModel.push(oStatusModel);
				}
			}
			this._getViewModel().setProperty('/StatusModel', aStatusModel);
		},

		_setViewModel: function(sModel, sModelName) {
			this.getThingInspectorController().getView().getInspector().setModel(sModel, sModelName);
		},

		_getViewModel: function() {
			return this.getThingInspectorController().getView().getInspector().getModel('viewCampNotification');
		},

		_initialTemplateBinding: function() {
			this._setTemplate(this.getModel().oData.MAIL_TEMPLATE_CODE);
			this._setTextModule(null);
		},

		onTemplateChange: function(oEvent) {
			var sKey = oEvent.mParameters.selectedItem.getKey();
			var aItems = oEvent.getSource().getItems();
			if (aItems.length > 0) {
				this._setTemplate(sKey);
			}
		},

		_setTemplate: function(sTemplateCode) {
			this.TemplateCode = sTemplateCode;
			this._updateTemplateField();
		},

		onTextChange: function(oEvent) {
			var sKey = oEvent.mParameters.selectedItem.getKey();
			var aItems = oEvent.getSource().getItems();
			if (aItems.length > 0) {
				this._setTextModule(sKey);
			}
		},

		onStatusTextChange: function(oEvent) {
			var sKey = oEvent.mParameters.selectedItem.getKey();
			var sStatusModelCode = this._getViewModel().getProperty('/StatusModelSelectedCode');
			var sTransitionCode = this._getViewModel().getProperty('/TransitionSelectedCode');
			this.getModel().updateSatausTextModuleCode(sStatusModelCode, sTransitionCode, sKey);
			this.onTextChange(oEvent);
		},

		_setTextModule: function(sTextCode) {
			this.TextCode = sTextCode;
			this._updateTemplateField();
			if (this._getViewModel()) {
				this._getViewModel().setProperty('/TextModuleCode', sTextCode);
			}
		},

		onRoleChange: function(oEvent) {
			var sRoleCode = oEvent.mParameters.selectedItem.getKey();
			this._setRoleCode(sRoleCode);
		},

		_setRoleCode: function(sRoleCode) {
			this.RoleCode = sRoleCode;
			this._updateTemplateField();
		},

		_getRoleList: function(iIndex) {
			var aRoleList = [{
				ROLE_CODE: ''
			}];
			if (iIndex > -1) {
				var oReceiverList = this.getModel().getProperty('/CampaignNotification/' + iIndex + '/CampaignNotificationReceiver') || [];
				if (oReceiverList.length) {
					for (var i = 0; i < oReceiverList.length; i++) {
						if (oReceiverList[i].IS_RECEIVE_EMAIL === 1) {
							aRoleList.push(oReceiverList[i]);
						}
					}
				}
			}
			return aRoleList;
		},

		_setActionCode: function(sActionCode) {
			this.ActionCode = sActionCode;
			this._updateTemplateField();
		},

		_updateTemplateField: function() {
			if (!this.TemplateCode && !this.TextCode) {
				this.getView()._oTemplateField.unbindProperty("content");
				this.getView()._oTemplateField.setModel(undefined);
			} else {
				var sPath = "/sap/ino/xs/rest/common/mail_preview.xsjs";
				sPath = sap.ui.ino.application.Configuration.getBackendRootURL() + sPath;

				if (this.TemplateCode) {
					sPath = sPath + "?TEMPLATE_CODE=" + this.TemplateCode;
					if (this.TextCode) {
						sPath = sPath + "&TEXT_CODE=" + this.TextCode;
					}
				} else {
					sPath = sPath + "?TEXT_CODE=" + this.TextCode;
				}

				if (this.RoleCode) {
					sPath += "&ROLE_CODE=" + this.RoleCode;
				}

				if (this.ActionCode) {
					sPath += "&ACTION_CODE=" + this.ActionCode;
				}

				sPath = sPath + "&CAMPAIGN=" + this.getModel().getProperty("/ID");
				sPath = sPath + "&LOCALE=" + this.getThingInspectorController()._sCurrentLanguage;

				this.getView()._oTemplateField.setModel(new sap.ui.model.json.JSONModel(sPath));
				this.getView()._oTemplateField.bindProperty("content", "/TEXT");
			}
		},

		_initialLanguageBinding: function() {
			this.getThingInspectorController()._initialLanguageBinding(this.getView());
		},

		onLanguageChange: function(oEvent) {
			var oView = this.getView();
			if (oEvent.getParameter("liveValue")) {
				oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
			}
			var aItems = oEvent.getSource().getItems();
			var sKey = oEvent.getSource().getSelectedKey();
			var oItem;

			var aLanguages = this.getModel().oData.LanguageTexts;
			if (aLanguages) {
				// Remember current selection to display the correct value after mode switch
				if (sKey) {
					this.getThingInspectorController()._sCurrentLanguageKey = sKey;
				}
				for (var ii = 0; ii < aItems.length; ++ii) {
					if (aItems[ii].getKey() === sKey) {
						oItem = aItems[ii];
						break;
					}
				}
				if (oItem) {
					var iLanguageIdx = 0;
					for (var i = 0; i < aLanguages.length; i++) {
						var oLanguage = this.getThingInspectorController().getLanguageByLang(aLanguages[i].LANG);
						if (oLanguage && oLanguage.CODE === sKey) {
							var sLanguage = aLanguages[i].LANG;
							this.getThingInspectorController()._sCurrentLanguage = sLanguage;
							iLanguageIdx = i;
							break;
						}
					}
					oView._oLanguageTemplate.bindElement(this.getFormatterPath("LanguageTexts/" + iLanguageIdx, true));
					this._updateTemplateField();
				}
			}
			oView.revalidateMessages();
		},

		onActionTableRowSelectionChange: function(oEvent) {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var oTable = oEvent.getSource();
			var iIndex = oTable.getSelectedIndex();
			var iNotificationIndex = -1;
			var aNotification = this.getModel().getProperty('/CampaignNotification');
			var sCode = '';
			var sName = '';
			var sTextModuleCode = '';

			// update view model properties
			if (iIndex > -1) {
				sCode = oTable.getContextByIndex(iIndex).getProperty('ACTION_CODE');
				sName = i18n.getText(sCode + '_TEXT');
				sTextModuleCode = oTable.getContextByIndex(iIndex).getProperty('TEXT_MODULE_CODE');
				iNotificationIndex = aNotification.indexOf(oTable.getContextByIndex(iIndex).getObject());
			}
			this._getViewModel().setProperty('/StatusModelSelectedIndex', -1);
			this._getViewModel().setProperty('/StatusModelSelectedCode', '');
			this._getViewModel().setProperty('/TransitionSelectedIndex', -1);
			this._getViewModel().setProperty('/TransitionSelectedCode', '');
			this._getViewModel().setProperty('/AllowMailNotification', false);
			this._getViewModel().setProperty('/ActionSelectedCode', sCode);
			this._getViewModel().setProperty('/ActionSelectedName', sName);
			this._getViewModel().setProperty('/ActionSelectedIndex', iIndex);
			this._getViewModel().setProperty('/TextModuleCode', sTextModuleCode);
			this._getViewModel().setProperty('/Role', this._getRoleList(iNotificationIndex));

			// update layout binding
			this.getView()._oActionSettingLayout.bindElement(this.getFormatterPath('CampaignNotification/' + iNotificationIndex, true));
			if (sCode === 'CHANGE_STATUS') {
				this.getView()._oStatusModelTable.bindRows({
					path: 'viewCampNotification>/StatusModel'
				});
			}

			// update preview with new text module code
			this._setRoleCode('');
			this._setActionCode(sCode);
			this._setTextModule(sTextModuleCode);
			this.getView()._oRoleDropdown.setSelectedKey('');

			// init receiver list combobox with selected items
			if (iIndex > -1 && this.isInEditMode()) {
				this.getView()._updateReceiverListComboBox();
			}

		},

		onStatusModelTableRowSelectionChange: function(oEvent) {
			var bUserInteraction = oEvent.getParameter('userInteraction');
			var oTable = oEvent.getSource();
			var iIndex = oTable.getSelectedIndex();
			var sStatusModelCode = '';

			if (iIndex > -1) {
				sStatusModelCode = bUserInteraction ? oTable.getContextByIndex(iIndex).getProperty('CODE') : this._getViewModel().getProperty(
					'/StatusModelSelectedCode');
				this.getView()._oTransitionTable.bindRows({
					path: "/StatusModelCode('" + sStatusModelCode + "')/Transitions"
				});
			} else {
				this._getViewModel().setProperty('/TransitionSelectedIndex', -1);
				this._getViewModel().setProperty('/TransitionSelectedCode', '');
				this._getViewModel().setProperty('/AllowMailNotification', false);
			}
			this._getViewModel().setProperty('/StatusModelSelectedIndex', iIndex);
			this._getViewModel().setProperty('/StatusModelSelectedCode', sStatusModelCode);
		},

		onStatusTransitionTableRowSelectionChange: function(oEvent) {
			if (!oEvent.getParameter('userInteraction')) {
				return;
			}
			var oTable = oEvent.getSource();
			var iTransitionIndex = oTable.getSelectedIndex();
			var bAllowMailNotification = iTransitionIndex > -1 ? oTable.getContextByIndex(iTransitionIndex).getProperty('INCLUDE_RESPONSE') : false;
			var sTransitionCode = iTransitionIndex > -1 ? oTable.getContextByIndex(iTransitionIndex).getProperty('CODE') : '';
			var sStatusModelCode = this._getViewModel().getProperty('/StatusModelSelectedCode');
			var aPhase = this.getModel().getProperty('/Phases');
			var iNotificationIndex = -1;
			var iPhaseIndex = -1;
			aPhase.forEach(function(oPhase, i) {
				if (oPhase.CampaignNotificationStatus && iPhaseIndex === -1) {
					oPhase.CampaignNotificationStatus.forEach(function(oNotification, j) {
						if (oNotification.STATUS_ACTION_CODE === sTransitionCode && iNotificationIndex === -1) {
							iNotificationIndex = j;
						}
					});
					if (iNotificationIndex > -1) {
						iPhaseIndex = i;
					}
				}
			});
			if (iPhaseIndex === -1 && iNotificationIndex === -1 && sStatusModelCode && sTransitionCode && bAllowMailNotification) {
				var oCreatedIndex = this.getModel().determinNotificationStatusCreate(sStatusModelCode, sTransitionCode);
				iPhaseIndex = oCreatedIndex.iPhaseIndex;
				iNotificationIndex = oCreatedIndex.iNotificationIndex;
			}
			var sPath = 'Phases/' + iPhaseIndex + '/CampaignNotificationStatus/' + iNotificationIndex;
			if (this.getModel().isNew() && this.getView()._oTransitionTable && this.getView()._oTransitionTable.getBinding() && this.getView()._oTransitionTable
				.getBinding().getModel() && this.getView()._oTransitionTable.getBinding().getModel().oData["StatusModelTransitionCode('" +
					sTransitionCode + "')"]) {
				var sStatusModelTextModule = this.getView()._oTransitionTable.getBinding().getModel().oData["StatusModelTransitionCode('" +
					sTransitionCode + "')"].TEXT_MODULE_CODE;
				this.getModel().setProperty('/' + sPath + '/TEXT_MODULE_CODE', sStatusModelTextModule);
			}
			var sTextModuleCode = this.getModel().getProperty('/' + sPath + '/TEXT_MODULE_CODE');
			this._setTextModule(sTextModuleCode);

			this.getView()._oTransitionSettingLayout.bindElement(this.getFormatterPath(sPath, true));

			this._getViewModel().setProperty('/AllowMailNotification', bAllowMailNotification);
			this._getViewModel().setProperty('/TransitionSelectedCode', sTransitionCode);
			this._getViewModel().setProperty('/TransitionSelectedIndex', iTransitionIndex);

		},

		_updateReceiverData: function(aReceivers, sCode, bReceiveEmail) {
			var aRoleList = [{
				ROLE_CODE: ''
			}];
			for (var i = 0; i < aReceivers.length; i++) {
				if (aReceivers[i].ROLE_CODE === sCode) {
					aReceivers[i].IS_RECEIVE_EMAIL = bReceiveEmail;
				}
				if (aReceivers[i].IS_RECEIVE_EMAIL === 1) {
					aRoleList.push(aReceivers[i]);
				}
			}
			this._getViewModel().setProperty('/Role', aRoleList);
			this._setRoleCode('');
			this.getView()._oRoleDropdown.setSelectedKey('');
		}

	}));