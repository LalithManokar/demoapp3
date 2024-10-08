/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.WebAnalytics");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationCommonActionsMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationValidationMixin");

var WebAnalytics = sap.ui.ino.application.WebAnalytics;

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController,
	sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin,
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationCommonActionsMixin,
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationValidationMixin, {

		mMessageParameters: {
			group: "campaign",
			save: {
				success: "MSG_CAMPAIGN_SAVE_SUCCESS"
			},
			submit: {
				success: "MSG_CAMPAIGN_SUBMIT_SUCCESS"
			},
			silent: {
				noBusy: true
			},
			submittedChange: {
				success: "MSG_CAMPAIGN_SUBMITTED_UPDATE_SUCCESS"
			},
			del: {
				success: "MSG_CAMPAIGN_DELETED", // text key for delete success message
				title: "BO_CAMPAIGN_INSTANCE_TIT_DEL_CAMPAIGN", // text key for dialog title
				dialog: "BO_CAMPAIGN_INSTANCE_INS_DEL_CAMPAIGN" // text key for dialog message
			}
		},

		closeFunction: function(oView) {
			sap.ui.ino.views.common.ThingInspectorAOController.closeFunction.call(this, oView);
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			var oNavState = oApp.getCurrentNavigationState();
			var oPath = oNavState.path;
			var sCampaignStatus, sCurrentView;

			if (oPath !== "campaigntiles" && oPath !== "campaignlist") {
				return;
			}
			if (oNavState.historyState) {
				sCurrentView = oNavState.historyState.tableView;
			}
			if (!sCurrentView) {
				sCurrentView = "active";
			}
			var oInstanceData = this.getModel().oData;

			if (oInstanceData.STATUS_CODE === "sap.ino.config.CAMP_DRAFT") {
				sCampaignStatus = "draft";
			} else if (oInstanceData.STATUS_CODE === "sap.ino.config.COMPLETED") {
				sCampaignStatus = "completed";
			} else if (oInstanceData.STATUS_CODE === "sap.ino.config.CAMP_PUBLISHED" && oInstanceData.VALID_TO && oInstanceData.VALID_TO.getTime() <
				new Date().getTime()) {
				sCampaignStatus = "completed";
			} else if (oInstanceData.VALID_FROM && oInstanceData.VALID_FROM.getTime() > new Date().getTime()) {
				sCampaignStatus = "future";
			} else {
				sCampaignStatus = "active";
			}
			if (sCurrentView !== sCampaignStatus && (oInstanceData.ID > 0 && !this.hasPendingChanges())) {
				oApp.navigateTo(oPath, {
					tableView: sCampaignStatus
				});
			}
		},

		close: function(oEvent) {
			sap.ui.ino.views.common.ThingInspectorAOController.close.call(this, oEvent);
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			if (this.bForceToGoHome) {
				oApp.navigateTo("campaigntiles", {
					tableView: "active"
				});
			}

		},

		onDelete: function() {
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			//set when the TI is opened in campaign-specific view and delete is pressed.
			this.bForceToGoHome = oApp.getCurrentNavigationState().path === "idealist";
			sap.ui.ino.views.common.ThingInspectorAOController.onDelete.call(this);
		},

		getODataPath: function() {
			// can be redefined if OData Model is needed;
			return "/CampaignFull";
		},

		initLanguageTemplateModel: function(sPagePath) {
			var oLanguageTemplateModel = sap.ui.getCore().getModel("specialLanguageModel");
			var that = this;
			if (!oLanguageTemplateModel) {
				oLanguageTemplateModel = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oLanguageTemplateModel, "specialLanguageModel");
			}

			var oData = {
				IDEA_DESCRIPTION_TEMPLATE: undefined,
				HTML_CONTENT: undefined,
				TITLE: undefined
			};

			if (this._sCurrentLanguage && this.oModel && jQuery.type(this.oModel.getData().LanguageTexts) === "array") {
				this.oModel.getData().LanguageTexts.forEach(function(oLang) {
					if (oLang.LANG === that._sCurrentLanguage) {
						oData.IDEA_DESCRIPTION_TEMPLATE = oLang.IDEA_DESCRIPTION_TEMPLATE;
					}
				});
			}

			if (sPagePath && this.oModel) {
				oData.HTML_CONTENT = this.oModel.getProperty(sPagePath + "/HTML_CONTENT");
				oData.TITLE = this.oModel.getProperty(sPagePath + "/TITLE");
			}

			oLanguageTemplateModel.setData(oData);
		},

		createModel: function(iId) {
			var that = this;

			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.Campaign(iId > 0 ? iId : undefined, {
					actions: ["create", "submit", "update", "save", "del", "replaceVoteType", "replacePhaseCode", "replaceStatusModelCode",
						"deletePhase"],
					nodes: ["Root", "Extension", "Phases"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			jQuery.when(this.oModel.getPropertyModelInitializedPromise(), this.oModel.getDataInitializedPromise()).done(function(oPropertyModelData,
				oDataInitializedData) {
				// WORKAROUND FOR RTE VALUE BINDING PROBLEM
				that.initLanguageTemplateModel();
				that.oModel.initMilestoneYears();
				that._initIntegrationViewModel();
				that._initNotificationCreateData();
				// that.oModel.initGamificationDimensions();
			});
            this._initGamificationDimensions();
			// we also need an oData Model
			this.bindODataModel(iId);

			if (iId > 0) {
				WebAnalytics.logCampaignView(iId);
			}

			return this.oModel;
		},

        _initGamificationDimensions:function(){
            var that = this;
			var Configuration = sap.ui.ino.application.Configuration;
			var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			var oDimensionModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
				"/Dimension?$skip=0&$top=10&$filter=STATUS%20eq%201&$orderby=NAME%20asc");
			oDimensionModel.attachRequestCompleted(oDimensionModel, function() {
				var oData = oDimensionModel.getProperty("/d/results");
				var oTI = that.getView().getInspector();
				if (oTI) {
					oTI.setModel(new sap.ui.model.json.JSONModel(oData), "ALL_GAMIFICATION_DIMENSIONS");
				}
			}, this);
        },

		_initNotificationCreateData: function() {
			this.getModel().determinNotificationCreate();
		},

		getLanguages: function() {
			if (!this._aLanguages) {
				var oController = this;
				oController._aLanguages = [];
				var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root");
				oController._aLanguages = jQuery.map(aCodes, function(oLanguage) {
					return {
						CODE: oLanguage.CODE,
						LANG: oLanguage.ISO_CODE,
						LANG_TEXT: oLanguage.TEXT
					};
				});
			}
			return this._aLanguages;
		},

		getLanguageByLang: function(sLang) {
			return jQuery.grep(this.getLanguages(), function(oLanguage) {
				return oLanguage.LANG === sLang;
			})[0];
		},

		getLanguageByCode: function(sCode) {
			return jQuery.grep(this.getLanguages(), function(oLanguage) {
				return oLanguage.CODE === sCode;
			})[0];
		},

		_isValid: function() {
			var oCampaign = this.getModel();
			this.clearMessages();
			var aBackendMessage = oCampaign.validateHTML();
			if (aBackendMessage.length > 0) {
				this.addMessages(aBackendMessage, "html_save");
				return false;
			}
			aBackendMessage = oCampaign.validateNotification();
			if (aBackendMessage.length > 0) {
				this.addMessages(aBackendMessage, "notification_save");
				return false;
			}
			this._saveCurrentMappingModel();
			return true;
		},

		onSave: function() {
			if (typeof this.fnRunBeforeSave === "function") {
				this.fnRunBeforeSave();
			}

			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");

			if (!this._isValid()) {
				if (this.getActiveFacet() && this.getActiveFacet().revalidateMessages) {
					this.getActiveFacet().revalidateMessages();
				}
				return;
			}

			var that = this;
			var thatArguments = arguments;
			// 			return this._isPeopleValid().done(function() {
			// 				sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(that, thatArguments);
			// 			});
			/***
			for (var i = 0; i < this.oModel.oData.Participants.length; i++) {
				this.oModel.oData.Participants[i].LimitOfParticipants = [{
						"ACTION_CODE": "IDEA_VOTE",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_VOTE)
                		 },
					{
						"ACTION_CODE": "CAMPAIGN_SUBMIT",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_SUBMIT)
                		 },
					{
						"ACTION_CODE": "IDEA_COMMENT",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_COMMENT)
                		 }];
			}
			for (var j = 0; j < this.oModel.oData.Registers.length; j++) {
			     this.oModel.oData.Registers[j].DISABLED = 0;
			}
			***/
			var oModel = that.getModel();
			that.convertDateOfTaskAndMilestone(oModel.getProperty("/VALID_FROM"), oModel.getProperty("/VALID_TO"), oModel.getProperty("/Tasks"));
			that._saveCurrentMappingModel();
			return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(that, thatArguments);
		},

		generateFeedDialog: function() {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var oController = this;

			function fnSubmit(bResult) {
				if (bResult) {
					var oModel = oController.getModel();
					oController.convertDateOfTaskAndMilestone(oModel.getProperty("/VALID_FROM"), oModel.getProperty("/VALID_TO"), oModel.getProperty(
						"/Tasks"));
					oController._saveCurrentMappingModel();
					oController.onModelAction(oModel.publish, "submit", true);
				}
			}

			function fnFeed(bResult) {
				if (bResult) {
					var oModel = oController.getModel();
					oController.convertDateOfTaskAndMilestone(oModel.getProperty("/VALID_FROM"), oModel.getProperty("/VALID_TO"), oModel.getProperty(
						"/Tasks"));
					oController._saveCurrentMappingModel();
					oController.onModelAction(oModel.majorpublish, "submit", true, false, false, oController.getModel().getChangeRequest());
				}
			}

			if (oController.getModel().oData["STATUS_CODE"] === "sap.ino.config.CAMP_DRAFT") {
				sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_INSTANCE_INS_SUBMIT_CAMPAIGN"), fnSubmit, i18n.getText(
					"BO_CAMPAIGN_INSTANCE_TIT_SUBMIT_CAMPAIGN"));
			} else {
				var sChangedFields = oController.getChangedFields();
				if (sChangedFields === '') {
					sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_INSTANCE_INS_SUBMIT_CAMPAIGN"), fnSubmit, i18n.getText(
						"BO_CAMPAIGN_INSTANCE_TIT_SUBMIT_CAMPAIGN"));
				} else {
					sap.ui.ino.controls.MessageBox.show(i18n.getText("BO_CAMPAIGN_INSTANCE_INS_SUBMIT_WITHFEED_CAMPAIGN"),
						sap.ui.commons.MessageBox.Icon.NONE, i18n.getText("GENERAL_APPLICATION_TIT_PUBLISH_FEED"), [sap.ui.commons.MessageBox.Action.YES,
							sap.ui.commons.MessageBox.Action.NO, sap.ui.commons.MessageBox.Action.CANCEL], function(bResult) {
							if (bResult === sap.ui.commons.MessageBox.Action.YES) {
								fnFeed(bResult);
							} else if (bResult === sap.ui.commons.MessageBox.Action.NO) {
								fnSubmit(bResult);
							}
						}, sap.ui.commons.MessageBox.Action.CLOSE, 'FEED_DIALOG');
					document.getElementById("FEED_DIALOG--btn-YES").childNodes[0].nodeValue = i18n.getText("BO_CAMPAIGN_BTN_MAJOR_PUBLISH");
					document.getElementById("FEED_DIALOG--btn-NO").childNodes[0].nodeValue = i18n.getText("BO_CAMPAIGN_BTN_NOFEED_PUBLISH");
				}
			}

		},

		onSubmit: function() {
			if (typeof this.fnRunBeforeSave === "function") {
				this.fnRunBeforeSave();
			}

			var oController = this;
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");

			if (!this._isValid()) {
				return;
			}
			/***
			for (var i = 0; i < this.oModel.oData.Participants.length; i++) {
				this.oModel.oData.Participants[i].LimitOfParticipants = [{
						"ACTION_CODE": "IDEA_VOTE",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_VOTE)
                		 },
					{
						"ACTION_CODE": "CAMPAIGN_SUBMIT",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_SUBMIT)
                		 },
					{
						"ACTION_CODE": "IDEA_COMMENT",
						"DISABLED": Number(!this.oModel.oData.Participants[i].CAN_COMMENT)
                		 }];
			}
			if(this.oModel.oData.Registers !== undefined ){
			for (var j = 0; j < this.oModel.oData.Registers.length; j++) {
			     this.oModel.oData.Registers[j].DISABLED = 0;
			}	
			}
			***/
			//return this._isPeopleValid().done(oController.generateFeedDialog());

			return oController.generateFeedDialog();

		},

		getChangedFields: function() {
			var aGeneralPage = ['LanguageTexts',
        'Tags',
        'SUBMIT_FROM',
        'SUBMIT_TO',
        'VALID_FROM',
        'VALID_TO',
        'REGISTER_FROM',
        'IS_BLACK_BOX',
        'IS_REGISTER_AUTO_APPROVE',
        'IS_AUTO_ASSIGN_RL_COACH',
        'REWARD',
        'REWARD_UNIT_CODE',
        'FORM_CODE',
        'RESP_CODE',
        'REGISTER_TO'];
			var aLandingPage = ['COLOR_CODE',
        'Attachments',
        'LanguagePages'];
			var sChanges = '';
			var oChanges = this.getModel().getChangeRequest();
			var keys = Object.keys(oChanges);
			if (keys.filter(function(key) {
				return aGeneralPage.some(function(field) {
					return field === key;
				});
			}).length > 0) {
				sChanges = 'General Data';
			}

			if (keys.filter(function(key) {
				return aLandingPage.some(function(field) {
					return field === key;
				});
			}).length > 0) {
				sChanges = sChanges === '' ? 'Landing Page' : sChanges + ',' + ' Landing Page';
			}

			if (keys.filter(function(key) {
				return key === 'Phases';
			}).length > 0) {
				sChanges = sChanges === '' ? 'Process' : sChanges + ',' + 'Process';
			}

			return sChanges;
		},

		// 		_isPeopleValid: function() {
		// 			var oController = this;
		// 			var oModel = oController.getModel();
		// 			var rListData = oModel.getProperty("/RESP_CODE");
		// 			var expertsData = oModel.getProperty("/Experts");
		// 			var coachesData = oModel.getProperty("/Coaches");
		// 			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		// 			var oDeferred = new jQuery.Deferred();

		// 			function fnConfirm(bResult) {
		// 				if (bResult) {
		// 					oModel.setProperty("/Experts", []);
		// 					oModel.setProperty("/Coaches", []);
		// 					oDeferred.resolve();
		// 				} else {
		// 					oDeferred.reject();
		// 				}
		// 			}

		// 			if (rListData && (expertsData.length || coachesData.length)) {
		// 				sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_INSTANCE_INS_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"), fnConfirm, i18n
		// 					.getText("BO_CAMPAIGN_INSTANCE_TIT_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"));
		// 			} else {
		// 				oDeferred.resolve();
		// 			}
		// 			return oDeferred;
		// 		},

		_initialLanguageBinding: function(oView) {
			if (oView.getLanguageDropdown) {
				var oLanguageDropdown = oView.getLanguageDropdown();
				if (oLanguageDropdown) {
					if (!this._sCurrentLanguageKey) {
						// Show default language when the facet opens
						var oLanguage = this.getLanguageByLang(sap.ui.ino.application.Configuration.getSystemDefaultLanguage());
						if (oLanguage) {
							oLanguageDropdown.setSelectedKey(oLanguage.CODE);
						}
						if (oLanguageDropdown.getSelectedKey().length > 0) {
							oLanguageDropdown.fireChange({
								newValue: oLanguageDropdown.getSelectedKey()
							});
							this._sCurrentLanguageKey = oLanguageDropdown.getSelectedKey();
							this._sCurrentLanguage = oLanguage.LANG;
						}
					} else {
						oLanguageDropdown.setSelectedKey(this._sCurrentLanguageKey);
						oLanguageDropdown.fireChange({
							newValue: this._sCurrentLanguageKey
						});
					}
				}
			}
		},

		onAfterModelAction: function(sActionName) {
			//if (!this.isOdataModelBound && (sActionName === "submit" || sActionName === "save")) {
			// var iId = this.getModel().getProperty("/ID");
			// this.bindODataModel(iId);
			//}
			if (sActionName === "submit" || sActionName === "save") {
				if (!this.isOdataModelBound) {
					var iId = this.getModel().getProperty("/ID");
					this.bindODataModel(iId);
					this.reloadActiveFacet();
				} else {
					this.reloadActiveFacet();
				}
			}
		}

	}));