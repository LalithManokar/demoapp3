/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.backoffice.Application");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
	jQuery.sap.require("sap.ui.ino.application.Configuration");
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
	jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
	var Configuration = sap.ui.ino.application.Configuration;
	jQuery.sap.require("sap.ui.ino.models.object.Campaign");
	jQuery.sap.require("sap.ui.ino.application.WebAnalytics");
	var WebAnalytics = sap.ui.ino.application.WebAnalytics;

	var _sNoId = "NO_ID";

	sap.ui.ino.application.ApplicationBase.extend("sap.ui.ino.application.backoffice.Application", {

		metadata: {
			properties: {
				campaignId: {
					type: "string",
					defaultValue: _sNoId
				},
				currentView: "string"
			}
		},

		init: function() {
			// Moved to init to prevent synchronous calls in bootstrap causing endless loop when login into cached UI in
			// Chrome
			jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
			jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
			jQuery.sap.require("sap.ui.ino.models.object.Notification");
			jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
			jQuery.sap.require("sap.ui.ino.controls.MessageBox");
			jQuery.sap.require("sap.ui.ino.application.Message");
			jQuery.sap.require("sap.ui.ino.application.ControlFactory");

			sap.ui.ino.application.ApplicationBase.prototype.init.apply(this, arguments);

			this.setODataPath(Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE"));
			this.setNavigationPaths({
				"campaigntiles": {
					pageView: "sap.ui.ino.views.backoffice.campaign.CampaignTilesContainer",
					isDefault: true,
					alwaysRecreate: true,
				// 	privilege: ["sap.ino.ui::campaign_manager"],
					helpContext: "BO_CAMPAIGN_LIST"
				},
				"campaignlist": {
					pageView: "sap.ui.ino.views.backoffice.campaign.CampaignList",
					alwaysRecreate: true,
				// 	privilege: ["sap.ino.ui::campaign_manager"],
					helpContext: "BO_CAMPAIGN_LIST"
				},
				"campaign": {
					pageView: "sap.ui.ino.views.backoffice.campaign.CampaignTilesContainer",
					instanceView: "sap.ui.ino.views.backoffice.campaign.CampaignInstance",
					mandatoryHistoryState: true,
					helpContext: "BO_CAMPAIGN_DETAIL_EXP_HELP",
					additionalHelpContext: "BO_CAMPAIGN_DETAIL_ADDITIONAL_EXP_HELP" // the new text bundle 
				},
				"taglist": {
					pageView: "sap.ui.ino.views.backoffice.tag.TagList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_TAG_LIST"
				},
				"tag": {
					pageView: "sap.ui.ino.views.backoffice.tag.TagList",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					instanceView: "sap.ui.ino.views.backoffice.tag.TagModify",
					mandatoryHistoryState: true,
					parentNavigationPath: "taglist"
				},
				"taggrouplist": {
					pageView: "sap.ui.ino.views.backoffice.tag.TagGroupManagementList",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					alwaysRecreate: true,
					helpContext: "BO_TAG_LIST"
				},
				"taggroup": {
					pageView: "sap.ui.ino.views.backoffice.tag.TagGroupManagementList",
					instanceView: "sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance",
					parentNavigationPath: "taggrouplist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_TAG_LIST"
				},
				"userlist": {
					pageView: "sap.ui.ino.views.backoffice.iam.UserManagementList",
					alwaysRecreate: true,
					privilege: ["sap.ino.xs.rest.admin.application::execute", "sap.ino.xs.rest.admin.application::user"],
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"user": {
					pageView: "sap.ui.ino.views.backoffice.iam.UserManagementList",
					instanceView: "sap.ui.ino.views.backoffice.iam.UserManagementInstance",
					parentNavigationPath: "userlist",
					privilege: ["sap.ino.xs.rest.admin.application::execute", "sap.ino.xs.rest.admin.application::user"],
					mandatoryHistoryState: true,
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"grouplist": {
					pageView: "sap.ui.ino.views.backoffice.iam.GroupManagementList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"group": {
					pageView: "sap.ui.ino.views.backoffice.iam.GroupManagementList",
					instanceView: "sap.ui.ino.views.backoffice.iam.GroupManagementInstance",
					parentNavigationPath: "grouplist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"userProfile": {
					pageView: "sap.ui.ino.views.backoffice.iam.UserProfile",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				 "gamificationsetting": {
				 	pageView: "sap.ui.ino.views.backoffice.gamification.Setting",
                    alwaysRecreate: true,
				 	privilege: "sap.ino.xs.rest.admin.application::execute",
				 	helpContext: "BO_GAMIFICATIONMANAGEMENT",
				 	additionalHelpContext: "BO_GAMIFICATIONMANAGEMENT_ADDITIONAL"
				 },
				 "gamificationdimensionlist": {
				 	pageView: "sap.ui.ino.views.backoffice.gamification.DimensionList",
				 	alwaysRecreate: true,
				 	privilege: "sap.ino.xs.rest.admin.application::execute",
				 	helpContext: "BO_GAMIFICATIONMANAGEMENT",
				 	additionalHelpContext: "BO_GAMIFICATIONMANAGEMENT_ADDITIONAL"
				 },
				"configvalueoptionlist": {
					pageView: "sap.ui.ino.views.backoffice.config.ValueOptionList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"configvalueoption": {
					pageView: "sap.ui.ino.views.backoffice.config.ValueOptionList",
					instanceView: "sap.ui.ino.views.backoffice.config.ValueOptionListModify",
					parentNavigationPath: "configvalueoption",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configevaluationmodellist": {
					pageView: "sap.ui.ino.views.backoffice.config.EvaluationModelList",
					alwaysRecreate: true,
					privilege: ["sap.ino.xs.rest.admin.application::execute","sap.ino.ui::campaign_manager"],
					helpContext: "BO_CONFIGURATION"
				},
				"configevaluationmodel": {
					pageView: "sap.ui.ino.views.backoffice.config.EvaluationModelList",
					instanceView: "sap.ui.ino.views.backoffice.config.EvaluationModelModify",
					parentNavigationPath: "configevaluationmodellist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configunitlist": {
					pageView: "sap.ui.ino.views.backoffice.config.UnitList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"configunit": {
					pageView: "sap.ui.ino.views.backoffice.config.UnitList",
					instanceView: "sap.ui.ino.views.backoffice.config.UnitModify",
					parentNavigationPath: "configunitlist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configmailtemplatelist": {
					pageView: "sap.ui.ino.views.backoffice.config.MailTemplateList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"configmailtemplate": {
					pageView: "sap.ui.ino.views.backoffice.config.MailTemplateList",
					instanceView: "sap.ui.ino.views.backoffice.config.MailTemplateModify",
					parentNavigationPath: "configmailtemplatelist",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configtextmodulelist": {
					pageView: "sap.ui.ino.views.backoffice.config.TextModuleList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"configtextmodule": {
					pageView: "sap.ui.ino.views.backoffice.config.TextModuleList",
					instanceView: "sap.ui.ino.views.backoffice.config.TextModuleModify",
					parentNavigationPath: "configtextmodulelist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configcampaignphaselist": {
					pageView: "sap.ui.ino.views.backoffice.config.CampaignPhaseList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"configcampaignphase": {
					pageView: "sap.ui.ino.views.backoffice.config.CampaignPhaseList",
					instanceView: "sap.ui.ino.views.backoffice.config.CampaignPhaseModify",
					parentNavigationPath: "configcampaignphaselist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configideaformlist": {
					pageView: "sap.ui.ino.views.backoffice.config.IdeaFormList",
					privilege: ["sap.ino.xs.rest.admin.application::execute","sap.ino.ui::campaign_manager"],
					alwaysRecreate: true,
					helpContext: "BO_CONFIGURATION"
				},
				"configresponsibilitylists": {
					pageView: "sap.ui.ino.views.backoffice.config.ResponsibilityLists",
					privilege: ["sap.ino.xs.rest.admin.application::execute","sap.ino.ui::campaign_manager"],
					alwaysRecreate: true,
					helpContext: "BO_CONFIGURATION"
				},
				"expertfinder": {
					pageView: "sap.ui.ino.views.backoffice.ExpertFinder",
					helpContext: "BO_EXPERTFINDER",
					privilege: ["sap.ino.ui::campaign_manager"],
					activityCode: "sap.ino.config.EXPERT_FINDER_ACTIVE"
				},
				"search": {
					pageView: "sap.ui.ino.views.backoffice.SearchResults"
				},
				"configstatusmodellist": {
					pageView: "sap.ui.ino.views.backoffice.statusconfig.StatusModelList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_STATUS_CONFIGURATION"
				},
				"configstatusmodel": {
					pageView: "sap.ui.ino.views.backoffice.statusconfig.StatusModelList",
					instanceView: "sap.ui.ino.views.backoffice.statusconfig.StatusModelModify",
					parentNavigationPath: "configstatusmodellist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					mandatoryHistoryState: true,
					helpContext: "BO_STATUS_CONFIGURATION"
				},
				"configstatusnamelist": {
					pageView: "sap.ui.ino.views.backoffice.statusconfig.StatusNameList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_STATUS_CONFIGURATION"
				},
				"configstatusactionlist": {
					pageView: "sap.ui.ino.views.backoffice.statusconfig.StatusActionList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_STATUS_CONFIGURATION"
				},
				"configVoteTypelist": {
					pageView: "sap.ui.ino.views.backoffice.config.VoteTypeList",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_CONFIGURATION"
				},
				"settings": {
					pageView: "sap.ui.ino.views.backoffice.settings.SystemSettings",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					alwaysRecreate: true,
					helpContext: "BO_SYS_SETTINGS_MANAGEMENT",
					additionalHelpContext: "BO_SYS_SETTINGS_MANAGEMENT_ADDITIONAL"
				},
				"configcampaigntakslists": {
					pageView: "sap.ui.ino.views.backoffice.config.CampaignTaskList",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					alwaysRecreate: true,
					helpContext: "BO_CONFIGURATION"
				},
				"urlwhitelist": {
					pageView: "sap.ui.ino.views.backoffice.config.UrlWhitelist",
					privilege: "sap.ino.xs.rest.admin.application::execute",
					alwaysRecreate: true,
					helpContext: "BO_CONFIGURATION"
				},
				"userLogSetting": {
					pageView: "sap.ui.ino.views.backoffice.iam.UserLogSetting",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"userConsumptionReport": {
					pageView: "sap.ui.ino.views.backoffice.iam.UserConsumptionReport",
					alwaysRecreate: true,
					privilege: "sap.ino.xs.rest.admin.application::execute",
					helpContext: "BO_USERMANAGEMENT",
					additionalHelpContext: "BO_USERMANAGEMENT_ADDITIONAL"
				},
				"innoOfficeHomePageWidget": {
				    pageView: "sap.ui.ino.views.backoffice.homepagewidget.InnoOfficeHomePageWidget",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_HOMEPAGE_WIDGET"
				},
				"communityHomePageWidget": {
				    pageView: "sap.ui.ino.views.backoffice.homepagewidget.CommunityHomePageWidget",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_HOMEPAGE_WIDGET"
				},
				"integrationMappingList": {
				    pageView: "sap.ui.ino.views.backoffice.integration.IntegrationMappingList",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_INTEGRATION"
				},
				"integrationMonitorList": {
				    pageView: "sap.ui.ino.views.backoffice.monitoring.IntegrationMonitorList",
				    alwaysRecreate: true,
				    privilege: ["sap.ino.xs.rest.admin.application::execute", "sap.ino.ui::campaign_manager", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"],
				    helpContext: "BO_MONITORS"
				},
				"notificationsEmailMonitorList": {
				    pageView: "sap.ui.ino.views.backoffice.monitoring.NotificationsEmailMonitorList",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_MONITORS"
				},
				"configIdeaMergeRule": {
				    pageView: "sap.ui.ino.views.backoffice.config.IdeaMergeRule",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_CONFIGURATION"
				},
				"configNotification": {
				    pageView: "sap.ui.ino.views.backoffice.config.NotificationActionList",
				    alwaysRecreate: true,
				    privilege: "sap.ino.xs.rest.admin.application::execute",
				    helpContext: "BO_CONFIGURATION"
				}
			});

			sap.ui.ino.controls.BusyIndicator.imageOnly = false;
		},

		initRootContent: function() {
			var oShell = sap.ui.ino.application.backoffice.ControlFactory.createShell(this);
			this._initObjectChangeListeners();
			oShell.attachPaneBarItemSelected(this.paneBarOpened, this);
			oShell.attachPaneClosed(this.paneBarClosed, this);
			this.setRootContent(oShell);
			this._initNotificationBar();
			oShell.setNotificationBar(this.oNotificationBar);
			sap.ui.ino.models.core.ClipboardModel.sharedInstance().prepare();

		},

		_initObjectChangeListeners: function() {
			var that = this;
			var sApplicationObject = "sap.ui.ino.models.object.Campaign";
			var fRevalidateBackofficeShell = function(oEvent) {
				var iCampaignId = oEvent.getParameter("key");
				if (iCampaignId) {
					sap.ui.ino.models.core.InvalidationManager.validateEntity("/CampaignSmall(" + iCampaignId + ")");
				}
			};

			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, function(oEvent) {
				var oApplicationObject = oEvent.getParameter("object");
				var sInitiatingApplicationObject = oApplicationObject.getMetadata().getName();
				var oCurrentNavState = sap.ui.ino.application.ApplicationBase.getApplication().getCurrentNavigationState();
				if (sInitiatingApplicationObject === sApplicationObject && oCurrentNavState.path == "ideaList" && oCurrentNavState.historyState.campaignId) {
					sap.ui.ino.application.ApplicationBase.getApplication().navigateTo("campaigntiles", {
						tableView: "active"
					});
				}
			});

			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Update, function(
				oEvent) {
				var oApplicationObject = oEvent.getParameter("object");
				var sInitiatingApplicationObject = oApplicationObject.getMetadata().getName();
				if (sInitiatingApplicationObject === sApplicationObject) {
					fRevalidateBackofficeShell(oEvent);
				}
			});

			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Action, function(
				oEvent, data) {
				var oApplicationObject = oEvent.getParameter("object");
				var sInitiatingApplicationObject = oApplicationObject.getMetadata().getName();
				if (sInitiatingApplicationObject === sApplicationObject) {
					fRevalidateBackofficeShell(oEvent);
				}
			});
		},

		_initNotificationBar: function() {
			var that = this;

			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

			this.oNotificationBar = new sap.ui.ux3.NotificationBar({
				display: this._handleNotificationDisplayListener,
				visibleStatus: sap.ui.ux3.NotificationBarStatus.Default
			});

			// this notifier is used to display messages like errors, etc.
			this.oMessageNotifier = new sap.ui.ux3.Notifier({
				title: "{i18n>BO_APPLICATION_TIT_NOTIF_MSG}"
			});

			this.oNotificationBar.setMessageNotifier(this.oMessageNotifier);

			// this notifier is used to display messages for events e.g. new comments etc.
			this.oNotifier = new sap.ui.ux3.Notifier(this.oNotificationBar.getId() + "-Notifier-Notifications", {
				title: "{i18n>BO_APPLICATION_TIT_NOTIF_NOTIFICATIONS}"
			});

			this.oNotificationBar.insertNotifier(this.oNotifier, 0);
			this.oNotifier.attachMessageSelected(this._onNotificationClick);

			// there is no other suitable event we can register on (resize or display do not work)
			var notificationBar_onAfterRendering = sap.ui.ux3.NotificationBar.prototype.onAfterRendering;
			sap.ui.ux3.NotificationBar.prototype.onAfterRendering = function() {
				notificationBar_onAfterRendering.apply(this, arguments);
				that._handleNotificationBarExtension();
				/*
                if (jQuery(that.oNotificationBar.getDomRef()).attr("role") !== "alert") {
                    jQuery(that.oNotificationBar.getDomRef()).attr("role", "alert");
                }
                //this.$().find(".sapUiNotifier").attr("aria-live", "off");     
                var aMessages = jQuery(that.oNotificationBar.getDomRef()).find(".sapUiInPlaceMessage");
                setTimeout(function() {
                    aMessages.each(function(iIdx, oMessage) {
                        jQuery(oMessage).attr("display", "none");
                        jQuery(oMessage).attr("role", "alert");
                    });
                },500);
                setTimeout(function() {
                    aMessages.each(function(iIdx, oMessage) {
                        jQuery(oMessage).attr("display", "inline");
                    });                    
                }, 1000); // perform a change of the area AFTER the afterrendering to trigger the screenreader to read
                */
			};

			this._sCloseText = i18n.getText("BO_APPLICATION_LNK_NOTIF_CLOSE");

			that.refreshNotification();
			that.attachNavigate({}, that.refreshNotification, that);
		},

		// directly passing the oNotification.refresh resulted in an exception in sap.ui.core
		// during the fireNavigate() in the application
		refreshNotification: function() {
			/*var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/notification_messages.xsjs";
			var oNotificationModel = new sap.ui.model.json.JSONModel();
			oNotificationModel.loadData(sPath, null, false);
			var aCurrentDisplayedMessages = this.oNotifier.getMessages();
			var aMessages = oNotificationModel.getData().NOTIFICATIONS.reverse();

			var a2Add = jQuery.grep(aMessages, function(oMessage) {
				var isEntry = false;
				jQuery.each(aCurrentDisplayedMessages, function(iIndex, oValue) {
					if (oValue.getKey() === oMessage.ID.toString()) {
						isEntry = true;
					}
				});
				return !isEntry;
			});
			var a2Delete = jQuery.grep(aCurrentDisplayedMessages, function(oValue) {
				var isEntry = false;
				jQuery.each(aMessages, function(iIndex, oMessage) {
					if (oValue.getKey() === oMessage.ID.toString()) {
						isEntry = true;
					}
				});
				return !isEntry;
			});

			// this manual change prevents flickering
			// add new messages
			var that = this;
			jQuery.each(a2Add, function(iIndex, oMessage) {
				that.oNotifier.addMessage(that._createMessage(oMessage));
			});
			// remove not up-to-date messages
			jQuery.each(a2Delete, function(iIndex, oMessage) {
				that.oNotifier.removeMessage(oMessage);
			});*/
		},

		_createMessage: function(oData) {
			var oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

			return new sap.ui.ino.application.Message({
				text: oTextBundle.getText("BO_APPLICATION_MSG_NOTIFICATION_TEXT", [oData.OBJECT_TEXT, oData.SUBTITLE]),
				timestamp: oData.RELATIVE_TIMESTAMP,
				level: sap.ui.core.MessageType.Information,
				key: oData.ID,
				group: "notifications",
				customData: [new sap.ui.core.CustomData({
					key: "OBJECT_ID",
					value: oData.OBJECT_ID
				}), new sap.ui.core.CustomData({
					key: "OBJECT_TYPE_CODE",
					value: oData.OBJECT_TYPE_CODE
				}), new sap.ui.core.CustomData({
					key: "NOTIFICATION_CODE",
					value: oData.NOTIFICATION_CODE
				})]
			});
		},

		// either re-write the notification bar renderer or attach the close button like this
		_handleNotificationBarExtension: function() {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

			jQuery(".sapUiNotifierMessageCloseAll").remove();
			jQuery("#" + this.oNotificationBar.getId() + "-Notifier-Notifications-notifierView-title").append(
				'<a class="sapUiNotifierMessageCloseAll" tabindex="0" title="' + i18n.getText("BO_APPLICATION_EXP_NOTIFICATION_REMOVE_ALL") + '">' +
				i18n.getText("BO_APPLICATION_LNK_NOTIF_CLOSE_ALL") + '</a>');

			var fnCloseAll = function() {
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				var aNotifications = oApp.oNotifier.getMessages();
				var oLatestMessage = aNotifications[aNotifications.length - 1];
				sap.ui.ino.models.object.Notification.readAllNotifications(oLatestMessage.getKey());
				oApp.oNotifier.removeAllMessages();

				// if there are messages left (from the other notifier), focus one of these messages
				// otherwise the message bar is closed and we try to focus the control, that had the focus before we
				// opened the message bar
				// => as the message notifier is displayed above the notification notifier, focus the last message
				var aMessages = oApp.oMessageNotifier.getMessages();
				if (aMessages && aMessages.length > 0) {
					var sNewFocusId = oApp.oMessageNotifier.getId() + "-messageNotifierView-messageView-" + aMessages[aMessages.length - 1].sId;
					jQuery.sap.byId(sNewFocusId).focus();
				} else {
					oApp._setBeforeFocus();
				}
			};

			jQuery(".sapUiNotifierMessageCloseAll").click(function() {
				fnCloseAll();
			});
			// keypress does not work in chrome
			jQuery(".sapUiNotifierMessageCloseAll").keydown(function(oEvent) {
				if (oEvent.keyCode === jQuery.sap.KeyCodes.SPACE || oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
					fnCloseAll();
				}
			});

			// close message bar if esc is pressed
			jQuery(".sapUiNotifierContainers").keydown(function(oEvent) {
				if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
					var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
					oApp.setMessageFocus();
				}
			});

			// open message bar if icon is pressed (key)
			jQuery(".sapUiNotifier").keydown(function(oEvent) {
				if (oEvent.keyCode === jQuery.sap.KeyCodes.SPACE || oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
					var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
					oApp.setMessageFocus();
				}
			});

			jQuery(".sapUiNotifierMessageClose").remove();
			// add a remove link to the notifications (only)
			jQuery("#" + this.oNotificationBar.getId() + "-Notifier-Notifications-notifierView").find(".sapUiNotifierMessageText").after(
				'<div class="sapUiNotifierMessageClose" tabindex="-1" title="' + i18n.getText("BO_APPLICATION_EXP_NOTIFICATION_REMOVE") + '">' + this
				._sCloseText + '</div>');

			jQuery(".sapUiNotifierMessageClose").click(function() {
				// as bubbling is guaranteed this is called before the parent click function
				// => here we currently have the old message, wait for the parent's click function
				sap.ui.ino.application.backoffice.Application.getInstance()._bDeleteCurrentMessage = true;
			});
			// keypress does not work in chrome
			jQuery(".sapUiNotifierMessageClose").keydown(function(oEvent) {
				if (oEvent.keyCode === jQuery.sap.KeyCodes.SPACE || oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
					sap.ui.ino.application.backoffice.Application.getInstance()._bDeleteCurrentMessage = true;
				}
			});

			// add aria-label for DELETE
			jQuery("#" + this.oNotificationBar.getId() + "-Notifier-Notifications-notifierView").find(".sapUiNotifierMessage").attr("aria-label",
				i18n.getText("BO_APPLICATION_EXP_NOTIFICATION_ARIA_REMOVE"));

			jQuery(".sapUiNotifierMessage").keydown(function(oEvent) {
				if (oEvent.keyCode === jQuery.sap.KeyCodes.DELETE) {
					jQuery(oEvent.target).find(".sapUiNotifierMessageClose").click();
				}
			});

		},

		_deleteMessage: function(oEvent) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

			var oMessage = oEvent.getParameter("message");
			var aMessages = jQuery(".sapUiNotifierMessage");
			var iCurrentIndex = jQuery(aMessages).index(jQuery("#" + jQuery(".sapUiNotificationBar")[0].id +
				"-Notifier-Notifications-notifierView-messageView-" + oMessage.sId));
			var oNewFocus;

			if (aMessages.length > iCurrentIndex + 1) {
				oNewFocus = aMessages[iCurrentIndex + 1];
			} else if (aMessages.length > 1) {
				oNewFocus = aMessages[iCurrentIndex - 1];
			}
			// else no more messages available

			sap.ui.ino.models.object.Notification.readNotification(oMessage.getKey());
			oApp._bDeleteCurrentMessage = false;

			oApp.oNotifier.removeMessage(oMessage);

			// set the focus to the next message, if available
			if (oNewFocus) {
				// wait for the notification bar to be rerendered
				setTimeout(function() {
					oNewFocus.focus();
					jQuery.sap.byId(oNewFocus.id).focus();
				}, 20);
			}
			// if no more messages available, close the message bar (auto) and set the focus reasonable
			else {
				oApp._setBeforeFocus();
			}
		},

		_openMessageObject: function(oEvent) {
			var aCustomData = oEvent.getParameter("message").getCustomData();
			if (aCustomData[1].getValue() === "IDEA" && aCustomData[2].getValue() !== "IDEA_DELETED") {
				var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
				var iId = oEvent.getParameter("message").getCustomData()[0].getValue();
				oApp.navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iId);
			}
		},

		_onNotificationClick: function(oEvent) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

			if (oApp._bDeleteCurrentMessage) {
				oApp._deleteMessage(oEvent);
			} else {
				oApp._openMessageObject(oEvent);
			}
		},

		_handleNotificationDisplayListener: function(oEvent) {
			// during a odata refresh this function is called several times with different show parameters
			// => delay the execution and only react to the "last" event
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			oApp._bDisplayNotificationBar = oEvent.getParameter("show");

			function updateBarAfterTimeout() {
				if (oApp._bDisplayNotificationBar) {
					if (oApp.oNotificationBar.getVisibleStatus() !== sap.ui.ux3.NotificationBarStatus.Default) {
						oApp.oNotificationBar.setVisibleStatus(sap.ui.ux3.NotificationBarStatus.Default);
					}
				} else {
					if (oApp.oNotificationBar.getVisibleStatus() !== sap.ui.ux3.NotificationBarStatus.None) {
						oApp.oNotificationBar.setVisibleStatus(sap.ui.ux3.NotificationBarStatus.None);
					}
				}
			}
			setTimeout(updateBarAfterTimeout, 1000);
		},

		addNotificationMessage: function(oMessage) {
			var oStatusBefore = this.oNotificationBar.getVisibleStatus();
			if (!!oMessage && oMessage.getProperty("text") && oStatusBefore === sap.ui.ux3.NotificationBarStatus.None) {
				oStatusBefore = sap.ui.ux3.NotificationBarStatus.Default;
			}
			if (oStatusBefore === sap.ui.ux3.NotificationBarStatus.None || oStatusBefore === sap.ui.ux3.NotificationBarStatus.Min) {
				this.oNotificationBar.setVisibleStatus(sap.ui.ux3.NotificationBarStatus.Default);
			}

			this.oMessageNotifier.addMessage(oMessage);
			this.scheduleTimeoutToHideMessages(oStatusBefore);
		},

		addNotificationMessages: function(aMessages) {
			var oStatusBefore = this.oNotificationBar.getVisibleStatus();
			if (!!aMessages && aMessages.length > 0 && oStatusBefore === sap.ui.ux3.NotificationBarStatus.None) {
				oStatusBefore = sap.ui.ux3.NotificationBarStatus.Default;
			}
			if (oStatusBefore === sap.ui.ux3.NotificationBarStatus.None || oStatusBefore === sap.ui.ux3.NotificationBarStatus.Min) {
				this.oNotificationBar.setVisibleStatus(sap.ui.ux3.NotificationBarStatus.Default);
			}

			var that = this;
			jQuery.each(aMessages, function(iIndex, oMessage) {
				that.addNotificationMessage(oMessage);
			});
			this.scheduleTimeoutToHideMessages(oStatusBefore);
		},

		addDelayedNotificationMessage: function(oMessage) {

			if (!this.aDelayedNotificationsMessages) {
				this.aDelayedNotificationsMessages = [];
			}
			this.aDelayedNotificationsMessages.push(oMessage);

		},

		addDelayedNotificationMessages: function(aMessages) {

			var that = this;
			jQuery.each(aMessages, function(iIndex, oMessage) {
				that.addDelayedNotificationMessage(oMessage);
			});

		},

		removeNotificationMessages: function(sGroup, sLevel) {
			var that = this;
			jQuery.each(this.oMessageNotifier.getMessages(), function(iIndex, oMessage) {
				if ((!sGroup || sGroup === oMessage.getGroup()) && (!sLevel || sLevel === oMessage.getLevel())) {
					that.oMessageNotifier.removeMessage(oMessage);
				}
			});
		},

		showDelayedNotificationMessages: function() {
			this.removeNotificationMessages();
			if (this.aDelayedNotificationsMessages) {
				this.addNotificationMessages(this.aDelayedNotificationsMessages);
				this.aDelayedNotificationsMessages = null;
			}

		},

		scheduleTimeoutToHideMessages: function(oRequiredStatus) {
			var _oRequiredStatus = oRequiredStatus;
			var that = this;

			function hideMessagesAfterTimeout() {
				if (that.oNotificationBar.getVisibleStatus() !== sap.ui.ux3.NotificationBarStatus.None) {
					var bOnlySuccessOrInfo = true;
					jQuery.each(that.oMessageNotifier.getMessages(), function(iIndex, oMessage) {
						if (oMessage.getLevel() !== sap.ui.core.MessageType.Success && oMessage.getLevel() !== sap.ui.core.MessageType.Info) {
							bOnlySuccessOrInfo = false;
							return false;
						}
						return true;
					});
					if (bOnlySuccessOrInfo) {
						if (!_oRequiredStatus) {
							_oRequiredStatus = sap.ui.ux3.NotificationBarStatus.Min;
						}
						that.oNotificationBar.setVisibleStatus(_oRequiredStatus);
					}
				}
			}
			setTimeout(hideMessagesAfterTimeout, 5000);
		},

		beforeSetContent: function(oContext) {
			var sURL = "";
			var oShell = this.getRootContentControl();
			var iCampaignId;

			if (oContext.state && oContext.state.campaignId) {
				iCampaignId = oContext.state.campaignId;
			}
			// indicate if context has changed and rebuilding is required
			// this.getCampaignId() returns a string => no comparison of types!
			// this.getCampaignId() returns _sNoId in case of no campaign context
			// iCampaignId is undefined in case of no campaign context
			var bShellContextChanged = (iCampaignId === undefined && this.getCampaignId() === _sNoId) ? false : (iCampaignId != this.getCampaignId());
			// special handle to enable context switch between campaigntile and campaignList
			if (!bShellContextChanged && oContext.previousPageView && oContext.path) {
				bShellContextChanged = (oContext.pageView.sId === "campaigntiles" || oContext.pageView.sId === "campaignlist") && (oContext.previousPageView
					.sId === "campaigntiles" || oContext.previousPageView.sId === "campaignlist");
			}

			this.setCampaignId(iCampaignId);

			if (oContext.state) {
				var oViewState = {};
				if (oContext.state.tableView) {
					oViewState.tableView = oContext.state.tableView;
				}
				if (iCampaignId) {
					oViewState.campaignId = iCampaignId;
				}
				sURL = this.getNavigationLink(oContext.path, oViewState);
			} else {
				sURL = this.getNavigationLink(oContext.path);
			}

			if (bShellContextChanged) {
				if (iCampaignId) {
					var sBindingPath = "/CampaignSmall(" + iCampaignId + ")";
					oShell.bindHeaderElement(true, sBindingPath);
					if (iCampaignId > 0) {
						WebAnalytics.logCampaignView(iCampaignId);
					}
				} else {
					oShell.bindHeaderElement(false);
				}
				var aRemovedWorksetItems = oShell.removeAllWorksetItems();
				jQuery.each(aRemovedWorksetItems, function(iIndex, oItem) {
					oItem.destroySubItems();
					oItem.destroy();
				});
				var aWorksetItems = sap.ui.ino.application.backoffice.ControlFactory.createWorksetItems(iCampaignId);
				jQuery.each(aWorksetItems, function(iIndex, oItem) {
					oShell.addWorksetItem(oItem);
				});
			} else if (!oShell.getWorksetItems() || oShell.getWorksetItems().length === 0) {
				oShell.bindHeaderElement(false);
				var aWSItems = sap.ui.ino.application.backoffice.ControlFactory.createWorksetItems();
				jQuery.each(aWSItems, function(iIndex, oItem) {
					oShell.addWorksetItem(oItem);
				});
			}
			this.setWorkItemSelectionState(sURL);
		},

		setWorkItemSelectionState: function(sURL) {
			var oShell = this.getRootContentControl();

			function getSubItemsRecursive(oItem) {
				if (oItem !== undefined) {
					var aSubItems = oItem.getSubItems();
					var aAllSubItems = [];
					for (var i = 0; i < aSubItems.length; i++) {
						aAllSubItems = aAllSubItems.concat(getSubItemsRecursive(aSubItems[i]));
					}
					aAllSubItems.push(oItem);
					return aAllSubItems;
				}
			}

			// Go through workset items and subitems
			var aAllWorkSetItems = jQuery.map(oShell.getWorksetItems(), function(oItem) {
				return getSubItemsRecursive(oItem);
			});

			jQuery.each(aAllWorkSetItems, function(index, worksetItem) {
				if (worksetItem.getHref() === sURL) {
					oShell.setSelectedWorksetItem(worksetItem);
					return;
				}
			});
		},

		openOverlay: function(sNavigationPath, vKey) {
			if (!this.getActiveOverlay()) {
				var oNavigationPath = this.getNavigationPaths()[sNavigationPath];
				var oPageInstanceView = sap.ui.jsview(oNavigationPath.instanceView);
				oPageInstanceView.show(vKey, "display");
			} else {
				this.navigateToInNewWindow(sNavigationPath, vKey.toString());
			}
		},

		hasCurrentViewPendingChanges: function() {
			var bHasPendingChanges = sap.ui.ino.application.ApplicationBase.prototype.hasCurrentViewPendingChanges.apply(this, arguments);
			if (!bHasPendingChanges) {
				if (this.getActiveOverlay()) {
					if (this.getActiveOverlay().hasPendingChanges()) {
						bHasPendingChanges = true;
					}
					if (!bHasPendingChanges && this.getActiveOverlay().getActiveFacet) {
						var oActiveFacet = this.getActiveOverlay().getActiveFacet();
						if (oActiveFacet && oActiveFacet.hasPendingChanges && oActiveFacet.hasPendingChanges()) {
							bHasPendingChanges = true;
						}
					}
				}
			}
			return bHasPendingChanges;
		},

		_navigateIfAllowed: function(sNavType, fnNavigationAllowed) {
			var that = this;
			var oCaller = arguments;

			var fnNavigation = function() {
				if (!that.getActiveOverlay()) {
					sap.ui.ino.application.ApplicationBase.prototype._navigateIfAllowed.apply(that, oCaller);
				} else {
					sap.ui.ino.application.ApplicationBase.prototype._navigateIfAllowed.apply(that, [sNavType,
						function() {
							that._abortNavigation(sNavType);
							if (that.getActiveOverlay() && that.getActiveOverlay().close) {
								that.getActiveOverlay().close();
							}
					}]);
				}
			};

			var iAcceptTerm = Configuration.getUserModel().getProperty("/data/TERM_ACCEPTED");
			var sTermCode = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_TEXT");

			//"1" Active Term & Condtion,  "0" , Deactive Term & Conditioan
			var sTermConditionActive = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE");

			var oTermDialog = sap.ui.ino.application.ControlFactory.createTermsAndConditionsDialog(this);

			//reset TermAcceptCallback
			Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", null);

			if (iAcceptTerm === 0 && sTermCode && sTermConditionActive === "1" && !oTermDialog.isOpen()) {

				Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", false);
				Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", fnNavigation);
				Configuration.getUserModel().setProperty("/data/TERMACTION", true);

				sap.ui.ino.controls.BusyIndicator.show();

				var fnSetTermDialogZindex = function() {

					jQuery.sap.delayedCall(100, that, function() {
						jQuery("#termsAndConditions").css("z-index", 30);
					});
					sap.ui.ino.controls.BusyIndicator.hide();
				};

				oTermDialog.oPopup.attachEvent("opened", fnSetTermDialogZindex, oTermDialog);

				oTermDialog.open();
			} else {

				if (!oTermDialog.isOpen()) {
					fnNavigation();
				}
			}

		},

		afterSetContent: function(oContext) {
			if (!this.onShellAfterRendering) {
				var that = this;
				this.onShellAfterRendering = function() {
					that.showTI(oContext);
				};
				this.getRootContentControl().addDelegate({
					onAfterRendering: this.onShellAfterRendering
				});

				if (jQuery.sap.byId(this.getRootContentControl().getId()).length > 0) {
					// root control already rendered => call the after rendering function directly
					that.showTI(oContext);
				}
			}
		},

		showTI: function(oContext) {
			var navigationPath = this.getNavigationPaths()[oContext.path];
			if (navigationPath.instanceView) {
				this.activeInspectorViewId = oContext.path + "-instance";
				var pageInstanceView = sap.ui.getCore().byId(this.activeInspectorViewId);
				if (pageInstanceView) {
					pageInstanceView.destroy();
				}

				if (navigationPath.instanceViewIsInoView) {
					pageInstanceView = sap.ui.ino.inoview(this.activeInspectorViewId, navigationPath.instanceView);
				} else {
					pageInstanceView = sap.ui.view({
						id: this.activeInspectorViewId,
						viewName: navigationPath.instanceView,
						type: sap.ui.core.mvc.ViewType.JS,
						viewData: navigationPath.instanceViewData
					});
				}

				if (navigationPath.parentNavigationPath) {
					var sParentURL = this.getNavigationLink(navigationPath.parentNavigationPath);
					this.setWorkItemSelectionState(sParentURL);
				}

				pageInstanceView.setHistoryState(oContext.path, oContext.state);

				this.oNotificationBar.setVisibleStatus(sap.ui.ux3.NotificationBarStatus.Min);
			} else {
				if (this.activeInspectorViewId) {
					var pageView = sap.ui.getCore().byId(this.activeInspectorViewId);
					if (pageView) {
						pageView.close(true);
						pageView.destroy();
					}
					this.activeInspectorViewId = null;
				}
			}

			this.removeNotificationMessages();
		},

		getActiveOverlay: function() {
			this.aActiveOverlay = this.aActiveOverlay || [];
			if (this.aActiveOverlay.length > 0) {
				return this.aActiveOverlay[this.aActiveOverlay.length - 1];
			}
			return undefined;
		},

		setActiveOverlay: function(oOverlay) {
			this.aActiveOverlay = this.aActiveOverlay || [];
			this.aActiveOverlay.push(oOverlay);
		},

		clearActiveOverlay: function() {
			this.aActiveOverlay = this.aActiveOverlay || [];
			this.aActiveOverlay.pop();
		},

		setSearchFocus: function() {
			if (!this.getActiveOverlay()) {
				// do not open search field popup, if there is an overlay opened
				jQuery(".sapUiUx3ShellTool-search").click();
			}
		},

		_setBeforeFocus: function() {
			var that = this;
			setTimeout(function() {
				if (that._$MessageBeforeFocus) {
					that._$MessageBeforeFocus.focus();
					that._$MessageBeforeFocus = undefined;
				}
			}, 1);
		},

		setMessageFocus: function() {
			var that = this;
			var $MessageBar = jQuery(".sapUiNotifierContainers");
			if ($MessageBar.find(":focus").length > 0) {
				// the notification bar is already open and an item of the content has focus
				// => close the bar and focus on the previous element (if we have one)
				jQuery(".sapUiBarToggleArrowDown").click();
				that._setBeforeFocus();
			} else {
				// remember the current focus
				this._$MessageBeforeFocus = jQuery(":focus");

				jQuery(".sapUiBarToggleArrowUp").click();

				setTimeout(function() {

					// select the first message
					var aMessages = jQuery(".sapUiNotifierMessage[tabindex=0]");
					if (!aMessages || aMessages.length === 0) {
						aMessages = jQuery(".sapUiNotifierMessage");
					}
					if (aMessages && aMessages.length > 0) {
						// set notification bar in correct state...
						that.oNotificationBar.focus();
						// than focus correct message
						setTimeout(function() {
							jQuery(aMessages[0]).focus();
						}, 1);
					}

				}, 200);

			}
		},

		getApplicationCode: function() {
			return 'sap.ino.config.URL_PATH_UI_BACKOFFICE';
		},

		handleODataError: function(oEvent) {
			var sUrl = oEvent.getParameter("url");
			var bIgnore = false;
			var that = this;
			jQuery.each(jQuery.extend({}, this._ignoreODataErrorEntities), function(sKey) {
				if (sUrl.substring(sUrl.lastIndexOf("/")) === sKey) {
					bIgnore = true;
					delete that._ignoreODataErrorEntities[sKey];
				}
			});
			if (!bIgnore) {
				this.showODataError(oEvent);
			}
		},

		ignoreODataError: function(oData) {
			if (!this._ignoreODataErrorEntities) {
				this._ignoreODataErrorEntities = {};
			}
			this._ignoreODataErrorEntities["/" + oData.entityKey] = true;
		},

		showMessageError: function(sMessage, sTitle, fnOk) {
			sap.ui.ino.controls.MessageBox.show(sMessage, sap.ui.commons.MessageBox.Icon.ERROR, sTitle, [sap.ui.commons.MessageBox.Action.OK],
				fnOk, sap.ui.commons.MessageBox.Action.OK);
		},

		showMessageConfirm: function(sMessage, sTitle, fnOk, fnCancel) {
			sap.ui.ino.controls.MessageBox.show(sMessage, sap.ui.commons.MessageBox.Icon.NONE, sTitle, [sap.ui.commons.MessageBox.Action.OK, sap.ui
				.commons.MessageBox.Action.CANCEL], fnOk, sap.ui.commons.MessageBox.Action.CANCEL);
		},

		initModels: function() {
			sap.ui.ino.application.ApplicationBase.prototype.initModels.apply(this, arguments);
			sap.ui.getCore().setModel(sap.ui.ino.models.core.ClipboardModel.sharedInstance(), sap.ui.ino.application.backoffice.Application.MODEL_CLIPBOARD);
			sap.ui.ino.models.core.ClipboardModel.sharedInstance().attachEvent("objectAdded", function(oEvent) {
				sap.ui.ino.application.backoffice.Application.getInstance().showClipboard(oEvent.getParameter("objectName"));
			});
			sap.ui.ino.models.core.ClipboardModel.sharedInstance().attachEvent("clipboardOpen", function(oEvent) {
				sap.ui.ino.application.backoffice.Application.getInstance().showClipboard();
			});
			sap.ui.ino.models.core.ClipboardModel.sharedInstance().attachEvent("objectInvalid", function(oEvent) {
				sap.ui.ino.application.backoffice.Application.getInstance().ignoreODataError(oEvent.getParameters());
			});
		},

		getClipboardModel: function() {
			return sap.ui.getCore().getModel(sap.ui.ino.application.backoffice.Application.MODEL_CLIPBOARD);
		},

		showClipboard: function(sObjectName) {
			var oShell = this.getRootContentControl();
			var aResult = jQuery.grep(oShell.getPaneBarItems(), function(oPaneBarItem) {
				return oPaneBarItem.getKey() === "clipboard";
			});
			if (aResult.length !== 0) {
				oShell.openPane(aResult[0].getId());
			}
		},

		hideClipboard: function() {
			var oShell = this.getRootContentControl();
			oShell.closePane();
		},

		paneBarOpened: function(oEvent) {
			if (oEvent.getParameter("key") === "clipboard") {
				this.getClipboardModel().clipboardOpened();
			}
		},

		paneBarClosed: function(oEvent) {
			this.getClipboardModel().clipboardClosed();
		},

		campaignSettingsPressed: function(oEvent) {
			var oController = this;
			if (oController.preventParallelOpeningEvent) {
				return;
			}

			var iCampaignId = oEvent.campaignId;
			var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
			oInstanceView.show(iCampaignId, "display", function() {});
		}
	});

	sap.ui.ino.application.backoffice.Application.MODEL_CLIPBOARD = "clipboard";

	sap.ui.ino.application.backoffice.Application.getInstance = function() {
		return sap.ui.ino.application.ApplicationBase.getApplication();
	};

	sap.ui.ino.application.backoffice.Application.getPrivilege = function() {
		return "sap.ino.ui::backoffice.access";
	};

})();