/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/core/MessageType",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/application/WebAnalytics",
    "sap/ui/model/resource/ResourceModel",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/commons/models/core/ModelSynchronizer",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/IconPool",
    "sap/ino/commons/models/misc/Notifications",
    "sap/m/MessageBox"
], function(UIComponent, JSONModel, Device, MessageType, Configuration, WebAnalytics,
	ResourceModel, CodeModel, ClipboardModel, ModelSynchronizer, ODataModel, IconPool, Notifications, MessageBox) {
	"use strict";

	// gets replaced by ui build
	var sVersionTimestamp = "2024-09-24 08:05:15";
	// inm bread crumbs route list
	var breadCrumbsTexts = [{
			"TEXT": "BREAD_HOME_TITLE_TEXT",
			"name": "home",
			"target": "home",
			"available": "all",
			"path": "home"
             }, {

			"name": "home-explicit",
			"target": "home"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_IDEAS",
			"MANAGETEXT": "PAGE_TIT_IDEAS",
			"name": "idealist",
			"target": "idealist",
			"available": "idea-display",
			"path": "home/idealist"

             }, {
			"variant": true,
			"name": "idealistvariant",
			"target": "idealist",
			"available": "idea-display",
			"path": "home/idealistvariant"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_WALLS",
			"name": "walllist",
			"target": "walllist",
			"available": "wall",
			"path": "home/walllist"
             }, {
			"variant": true,
			"name": "walllistvariant",
			"target": "walllist",
			"path": "home/walllist"
			 }, {
			"oData": "Wall",
			"pattern": "id",
			"title": "BREAD_WALL_TITLE_TEXT",
			"name": "wall",
			"available": "wall",
			"target": "wall",
			"path": "home/walllist/wall"

             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremote",
			"target": "wallremote",
			"path": "home/walllist/wallremote",
			"available": "wall"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-headline",
			"target": "wallremoteitem-headline",
			"path": "home/walllist/wallremote/wallremoteitem-headline"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-sticker",
			"target": "wallremoteitem-sticker",
			"path": "home/walllist/wallremote/wallremoteitem-sticker"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-link",
			"target": "wallremoteitem-link",
			"path": "home/walllist/wallremote/wallremoteitem-link"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-image",
			"target": "wallremoteitem-image",
			"path": "home/walllist/wallremote/wallremoteitem-image"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-text",
			"target": "wallremoteitem-text",
			"path": "home/walllist/wallremote/wallremoteitem-text"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-sprite",
			"target": "wallremoteitem-sprite",
			"path": "home/walllist/wallremote/wallremoteitem-sprite"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-person",
			"target": "wallremoteitem-person",
			"path": "home/walllist/wallremote/wallremoteitem-person"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-video",
			"target": "wallremoteitem-video",
			"path": "home/walllist/wallremote/wallremoteitem-video"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-attachment",
			"target": "wallremoteitem-attachment",
			"path": "home/walllist/wallremote/wallremoteitem-attachment"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-group",
			"target": "wallremoteitem-group",
			"path": "home/walllist/wallremote/wallremoteitem-group"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-line",
			"target": "wallremoteitem-line",
			"path": "home/walllist/wallremote/wallremoteitem-line"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-arrow",
			"target": "wallremoteitem-arrow",
			"path": "home/walllist/wallremote/wallremoteitem-arrow"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_CAMPAIGNS",
			"name": "campaignlist",
			"target": "campaignlist",
			"available": "campaign",
			"path": "home/campaignlist"
             }, {
			"variant": true,
			"name": "campaignlistvariant",
			"target": "campaignlist",
			"available": "campaign",
			"path": "home/campaignlistvariant"
             }, {
			"TEXT": "PAGE_TIT_PEOPLE",
			"name": "peoplelist",
			"target": "peoplelist",
			"path": "home/peoplelist"
             }, {
			"name": "peoplelistvariant",
			"target": "peoplelist",
			"path": "home/peoplelistvariant"
             }, {
			"TEXT": "PAGE_TIT_EXPERTFINDER",
			"name": "expertfinder",
			"target": "expertfinder",
			"path": "home/expertfinder"
             }, {
			"oData": "IdeaSmall",
			"pattern": "id",
			"title": "BREAD_IDEA_TITLE_TEXT",
			"name": "idea-display",
			"target": "idea-display",
			"available": "evaluation-display/evaluation-create/evaluationrequest-create/evaluationrequest-display/evaluationrequest-edit/idea-display",
			"path": "home/campaignlist/campaign/campaign-idealist/idea-display"
             }, {
			"TEXT": "PAGE_TIT_IDEA_EDIT",
			"oData": "IdeaSmall",
			"name": "idea-edit",
			"target": "idea-modify",
			"path": "home/idealist/idea-display/idea-edit"
             }, {
			"TEXT": "PAGE_TIT_IDEA_CREATE",
			"name": "idea-create",
			"target": "idea-modify",
			"path": "home/idea-create"
              }, {
			"oData": "CampaignFull",
			"pattern": "id",
			"title": "BREAD_CAMPAIGN_TITLE_TEXT",
			"name": "campaign",
			"target": "campaign",
			"available": "campaign-idealist/campaign-idealistvariant/campaign-bloglist/campaign-comment/campaign-feeds/campaign-managerlist/blog-create/idea-display/blog-display/idea-create/campaign-bloglistvariant",
			"path": "home/campaignlist/campaign"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_COMMENT",
			"name": "campaign-comment",
			"target": "campaign-comment",
			"path": "home/campaignlist/campaign/campaign-comment"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_FEEDS",
			"name": "campaign-feeds",
			"target": "campaign-feeds",
			"path": "home/campaignlist/campaign/campaign-feeds"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_CAMPAIGN_IDEAS",
			"name": "campaign-idealist",
			"target": "campaign-idealist",
			"available": "idea-display",
			"path": "home/campaignlist/campaign/campaign-idealist"
             }, {
			"variant": true,
			"name": "campaign-idealistvariant",
			"target": "campaign-idealist",
			"available": "idea-display",
			"path": "home/campaignlist/campaign/campaign-idealistvariant"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_MANAGERS",
			"variant": true,
			"name": "campaign-managerlist",
			"target": "campaign-managerlist",
			"path": "home/campaignlist/campaign/campaign-managerlist"
             }, {
			"TEXT": "PAGE_TIT_SEARCHCATEGORY",
			"name": "search",
			"target": "search",
			"path": "home/search"
             }, {

			"name": "searchcategory",
			"target": "searchcategory"
             }, {

			"name": "message",
			"target": "message"
             }, {

			"name": "vote",
			"target": "vote"
             }, {

			"name": "identitycard",
			"target": "identitycard"
             }, {

			"name": "processindicator",
			"target": "processindicator"
             }, {

			"name": "ideacard",
			"target": "ideacard"
             }, {

			"name": "campaigncard",
			"target": "campaigncard"
             }, {

			"name": "votedisplay",
			"target": "votedisplay",
			"path": "home/votedisplay"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_REPORTS",
			"name": "reportlist",
			"target": "reportlist",
			"path": "home/reportlist"
             }, {
			"variant": true,
			"name": "reportlistvariant",
			"target": "reportlist",
			"path": "home/reportlistvariant"
             }, {
			"oData": "ReportTemplates",
			"title": "BREAD_REPORT_TITLE_TEXT",
			"pattern": "code",
			"TEXT": "PAGE_TIT_REPORTS",
			"name": "report",
			"target": "report",
			"path": "home/reportlist/report"
             }, {
			//"oData":"IdeaEvaluation",
			//"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATION",
			"name": "evaluation-display",
			"target": "evaluation-display",
			"available": "evaluation-edit",
			"path": "home/evaluation-display"
             }, {
			"TEXT": "PAGE_TIT_EVALUATION_EDIT",
			"name": "evaluation-edit",
			"target": "evaluation-modify",
			"path": "home/evaluation-display/evaluation-edit"
             },
		{

			"name": "welcomepage",
			"target": "welcomepage"
             }, {
			"TEXT": "PAGE_TIT_EVALUATION_CREATE",
			"name": "evaluation-create",
			"target": "evaluation-modify"
             }, {
			"TEXT": "PAGE_TIT_FEEDS",
			"name": "feedlist",
			"target": "feedlist",
			"path": "home/feedlist"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_TAGS",
			"name": "taglist",
			"target": "taglist",
			"path": "home/taglist"
             }, {
			"TEXT": "PAGE_TIT_TAGS",
			"name": "taglistvariant",
			"target": "taglist",
			"path": "home/taglistvariant"
             }, {
			"variant": true,
			"name": "followlist",
			"target": "followlist",
			"path": "home/followlist"
			 }, {
			"variant": true,
			"name": "followlistvariant",
			"target": "followlist",
			"path": "home/followlistvariant"
			 }, {
			"variant": true,
			"TEXT": "REGISTER_APPR_LIST_TIT",
			"name": "registerapprovallist",
			"target": "registerapprovallist",
			"path": "home/registerapprovallist"
			 }, {
			"variant": true,
			"TEXT": "REGISTER_APPR_LIST_TIT",
			"name": "registerapprovallistvariant",
			"target": "registerapprovallist",
			"path": "home/registerapprovallistvariant"
			 }, {
			"variant": true,
			"TEXT": "REGISTER_APPR_LIST_TIT",
			"name": "campaign-registerapprovallistvariant",
			"target": "campaign-registerapprovallist",
			"path": "campaign/campaign-registerapprovallistvariant"
			 },
		{
			"TEXT": "PAGE_TIT_BLOGS",
			"name": "bloglist",
			"target": "bloglist",
			"available": "blog-display",
			"path": "home/bloglist"
             }, {
			"variant": true,
			"name": "bloglistvariant",
			"target": "bloglist",
			"available": "blog-display",
			"path": "home/bloglistvariant"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_CAMPAIGN_BLOGS",
			"name": "campaign-bloglist",
			"target": "campaign-bloglist",
			"available": "blog-display",
			"path": "home/campaignlist/campaign/campaign-bloglist"
             }, {
			"variant": true,
			"name": "campaign-bloglistvariant",
			"target": "campaign-bloglist",
			"available": "blog-display",
			"path": "home/campaignlist/campaign/campaign-bloglistvariant"
             }, {
			"TEXT": "PAGE_TIT_BLOG_EDIT",
			"name": "blog-edit",
			"target": "blog-modify",
			"path": "home/bloglist/blog-display/blog-edit"
             }, {
			"TEXT": "PAGE_TIT_BLOG_CREATE",
			"name": "blog-create",
			"target": "blog-modify",
			"path": "home/blog-create"
              }, {
			"oData": "CampaignBlogsSmall",
			"title": "BREAD_BLOG_TITLE_TEXT",
			"pattern": "id",
			"name": "blog-display",
			"available": "blog-display/blog-edit",
			"target": "blog-display",
			"path": "home/bloglist/blog-display"
              }, {
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_CREATE",
			"name": "evaluationrequest-create",
			"target": "evaluationrequestmodify",
			"path": "home/evaluationrequest-create"
             }, {
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_EDIT",
			"name": "evaluationrequest-edit",
			"target": "evaluationrequestmodify",
			"path": "home/evalreqlist/evaluationrequest-display/evaluationrequest-edit"
             }, {
			// "oData":"EvaluationRequestFull",
			//"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_DISPLAY",
			"name": "evaluationrequest-display",
			"target": "evaluationrequestdisplay",
			"available": "evaluationrequest-edit/evaluationrequest-item",
			"path": "home/evalreqlist/evaluationrequest-display"
             }, {
			//"oData":"EvaluationRequestFullItem",
			//	"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_ITEM",
			"name": "evaluationrequest-item",
			"target": "evaluationrequestitem",
			"path": "home/evalreqlist/evaluationrequest-display/evaluationrequest-item"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_REWARDS",
			"name": "rewardlist",
			"target": "rewardlist",
			"path": "home/rewardlist"
             }, {
			"variant": true,
			"name": "rewardlistvariant",
			"target": "rewardlist",
			"path": "home/rewardlistvariant"
             }, {
			"variant": true,
			"TEXT": "PAGE_TIT_EVALUATION_REQUESTS",
			"name": "evalreqlist",
			"target": "evalreqlist",
			"path": "home/evalreqlist"
             }, {
			"variant": true,
			"name": "evalreqlistvariant",
			"target": "evalreqlist",
			"path": "home/evalreqlistvariant"
             }, {
			"TEXT": "PAGE_TIT_MY_SETTING",
			"name": "mySetting",
			"target": "mySetting",
			"path": "home/mySetting"
             }, {
			"TEXT": "PAGE_TIT_LEADERBOARD",
			"name": "leaderboard",
			"target": "leaderboard",
			"path": "home/leaderboard"
             }
             ];
	/**
	 * Constructor for a new Component.
	 *
	 * Holding the general setup. Setting up models etc.
	 *
	 * @class BaseComponent holding the general setup of the application.
	 * @extends sap.ui.core.UIComponent
	 * @version 1.3.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ino.commons.application.BaseComponent
	 */
	return UIComponent.extend("sap.ino.commons.application.BaseComponent", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.initLanguage();
			this.initModels();
			this.initRouting();
			this.initURLWhitelist();
			this.initSessionTimeoutHandler();
			this.initTabHandler();
			this.start();
		},

		initLanguage: function() {
			var oUser = this._getCurrentUser();
			if (oUser) {
				sap.ui.getCore().getConfiguration().setLanguage(oUser.LOCALE);
			}
		},

		initModels: function() {
			var oMessageManager = sap.ui.getCore().getMessageManager();

			// device
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			// navigation
			var oNavigationModel = new JSONModel();
			this.setModel(oNavigationModel, "navigation");

			// Texts
			this._i18n = this.getModel("i18n");
			if (!this._i18n) {
				this._i18n = new ResourceModel({
					bundleUrl: Configuration.getResourceBundleURL("nguii18n")
				});
				this.setModel(this._i18n, "i18n");
			}
			oMessageManager.unregisterMessageProcessor(this._i18n);

			// System Settings Configuration
			this.setModel(Configuration.getSystemSettingsModel(), "config");
			oMessageManager.unregisterMessageProcessor(Configuration.getSystemSettingsModel());

			// User Configuration
			this.setModel(Configuration.getUserModel(), "user");
			oMessageManager.unregisterMessageProcessor(Configuration.getUserModel());

			// Search
			this.setModel(Configuration.getSearchModel(), "search");
			oMessageManager.unregisterMessageProcessor(Configuration.getSearchModel());

			// Message handling
			var oMessageModel = oMessageManager.getMessageModel();
			this.setModel(oMessageModel, "message");

			// OData
			var sODataPath = Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_APPLICATION");
			if (Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
				sODataPath = Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			}

			var oDefaultModel = new ODataModel(sODataPath, false);
			// backend does not support HEAD request
			oDefaultModel.bDisableHeadRequestForToken = true;
			// this is set to "None" to avoid expensive inline count calculations
			oDefaultModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			this.setModel(oDefaultModel, "data");
			ModelSynchronizer.setODataModel(oDefaultModel);
			// Messages from OData are not relevant for us as we do have application object models
			// As many bindings on the OData Model exist message processing consumes a lot of time for each
			// odata call
			oMessageManager.unregisterMessageProcessor(oDefaultModel);

			// TODO: also enable this when debug mode is switched on for customer debugging
			if (window.less && window.less.env === "development") {
				oDefaultModel.setUseBatch(false);
			}

			this.setModel(CodeModel, "code");

			var bPollingActivated = Device.system.desktop;
			var oNotificationModel = new Notifications(bPollingActivated);
			this.setModel(oNotificationModel, "notifications");
			oNotificationModel.updateNotificationCount();

			// TODO: Refactor this so that these texts are contained in i18n
			// Text Modules
			var oModuleBundle = this.getModel("module");
			if (!oModuleBundle) {
				oModuleBundle = new ResourceModel({
					// INM-418: add timestamp to retrieve this resource from backend instead of local cache every time when terms and conditions info updated.
					bundleUrl: Configuration.getResourceBundleURL("moduletexts") + '?t=' + Date.now()
				});
				this.setModel(oModuleBundle, "module");
			}

			// general models
			var oHelpModel = new JSONModel({});
			oHelpModel.setDefaultBindingMode("OneWay");
			this.setModel(oHelpModel, "help");

			var oSearchModel = new JSONModel({});
			oSearchModel.setDefaultBindingMode("OneWay");
			this.setModel(oSearchModel, "search");

			var oComponentModel = new JSONModel({
				"FULLSCREEN": !this.getShell().getAppWidthLimited(),
				"SHOW_BACKOFFICE": this.getModel("user").getProperty("/privileges/sap.ino.ui::backoffice.access"), // auto enable backoffice view,
				"SHOW_BACKOFFICE_BLOG": this.getModel("user").getProperty("/privileges/sap.ino.ui::campaign_manager") // auto enable backoffice blog
			});
			oComponentModel.setDefaultBindingMode("OneWay");
			this.setModel(oComponentModel, "component");

			// ClipBoard
			var oClipboardModel = ClipboardModel.sharedInstance();
			oClipboardModel.setODataModel(oDefaultModel);
			// clipboard is enabled only for desktop & if backoffice privileges exist
			oClipboardModel.setEnabled(!this.getModel("device").getProperty("/system/phone") &&
				this.getModel("user").getProperty("/privileges/sap.ino.ui::backoffice.access")
			);
			this.setModel(oClipboardModel, "clipboard");

			// History
			var oHistoryModel = new JSONModel({
				HashList: [],
				CurrentHash: null,
				Count: 0
			});
			var oDetailHistoryModel = new JSONModel({
				HashList: []
			});

			this.setModel(oDetailHistoryModel, "historyDetail");
			this.setModel(oHistoryModel, "history");

			//BreadCrumbs
			var oBreadCrumbsModel = new JSONModel({
				CurrentRoute: "",
				CurrentAvailable: "all",
				CurrentHash: "none"
			});
			this.setModel(oBreadCrumbsModel, "breadCrumbs");
		},

		// TODO Routing / Navigating should be part of the App controller (holding the UI5 App) not of the Component
		initRouting: function() {
			var that = this;
			var oRouter = this.getRouter();
			var fnRoutingCallback = function(fnNavigate, sRoute, sCurrent) {
				var sRouteName = sRoute;
				var fnNav = function() {
					var oRoute = that.getRouter().getRoute(sRouteName);
					var sPattern = oRoute ? oRoute.getPattern() : "";
					if (sPattern) {
						sPattern = sPattern.split(":")[0];
					}

					if (sCurrent !== sPattern) {
						that.getRootController().onBeforeNavigate(sRouteName);
					}

					setTimeout(function() {
						// we need to give the busy indicator "time" to get shown
						fnNavigate();
						// TODO: onAfterNavigate is never called in case of navigating to identical target
						jQuery.sap.delayedCall(100, that.getRootController(), 'onAfterNavigate');
					}, 0);
				};
				that._navigateIfAllowed(fnNav);
			};
			var fnCloseCallback = function() {
				return that.getRootController().isCloseAllowed();
			};
			var fnTitleChangeCallback = function() {
				var oHistoryInstance = sap.ui.core.routing.History.getInstance();
				var aHistory = oHistoryInstance.aHistory;
				var aCurrentTitle = aHistory[oHistoryInstance.iHistoryPosition].split("/");
				var sCurrentTitle = "";
				if (aCurrentTitle.length > 2 && aCurrentTitle[2].split("?")[0]) { //eg: campaign/10000/comment
					sCurrentTitle = aCurrentTitle[0] + "_" + aCurrentTitle[2].replace(/-/g, "_").split("?")[0];
				} else { //eg: campaigns/10000
					sCurrentTitle = aCurrentTitle[0].replace(/-/g, "_").split("?")[0];
				}
				if (sCurrentTitle.indexOf("tags") === 0) {
					sCurrentTitle = "tags";
				}
				var sCurrentHash = aHistory[oHistoryInstance.iHistoryPosition];
				var sCurrentDirection = oHistoryInstance._sCurrentDirection;
				var oHistoryModel = that.getRootView().getModel("history");
				var oBreadCrumbsModel = that.getRootView().getModel("breadCrumbs");
				var sLastHash = oBreadCrumbsModel.getProperty("/CurrentHash");
				oBreadCrumbsModel.setProperty("/CurrentHash", sCurrentHash);
				var aHashList = oHistoryModel.getProperty("/HashList");
				var oLastHash = oHistoryModel.getProperty("/CurrentHash");
				var oCurrentHash = {
					title: sCurrentTitle,
					hash: sCurrentHash
				};
				if (oLastHash && oLastHash.title === oCurrentHash.title && (oCurrentHash.hash.indexOf("?section") > 0 || oLastHash.hash.indexOf(
					"?section") > 0)) {
					//idle for idea detail section navigation
					return;
				} else if ((sCurrentDirection === "NewEntry" || sCurrentDirection === "Unknown" || sCurrentDirection === "Forwards") && oLastHash !==
					null && oLastHash.hash !== oCurrentHash.hash && oLastHash.title !== oCurrentHash.title /*new hash*/ && aHistory.indexOf(oLastHash.hash) >=
					0 /*in case history has no record*/ ) {
					//add the last visited hash as the latest navigation item
					aHashList.unshift(oLastHash);
				} else if (sCurrentDirection === "Backwards" && oLastHash.hash !== oCurrentHash.hash &&
					oLastHash.title !== oCurrentHash.title) { //remove navigation item when clicking shell backbutton or browser button
					aHashList.shift();
				}
				oHistoryModel.setProperty("/CurrentHash", oCurrentHash);
				oHistoryModel.setProperty("/HashList", aHashList);
				oHistoryModel.setProperty("/Count", aHashList.length);

				//For company centric view
				var bCommunityGroupView = that.getCurrentView().getController().getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW");
				if (bCommunityGroupView) {
					if (sCurrentTitle === "ideas_commented" || sCurrentTitle === "ideas_voted") {
						sCurrentTitle = sCurrentTitle === "ideas_commented" ? "ideas_my_commented" : "ideas_my_voted";
					}
				}
				var oResbundle = that._i18n.getResourceBundle();
				var sPageTitPrefix = oResbundle.getText("PAGE_TIT_" + (!sCurrentTitle ? "HOME" : sCurrentTitle.toUpperCase()));
				if (sCurrentTitle === "ideas_mygroup" || sCurrentTitle === "ideas_mygroupcommented" || sCurrentTitle === "ideas_mygroupvoted") {
					var sDisplayLabel = Configuration.getGroupConfiguration().DISPLAY_LABEL;
					sPageTitPrefix = oResbundle.getText("PAGE_TIT_" + sCurrentTitle.toUpperCase(), [sDisplayLabel]);
				}
				if (sCurrentTitle === "reports_customReports") {
					sPageTitPrefix = Configuration.getCustomReportsTile();
				}

				document.title = sPageTitPrefix + " - " + that._i18n.getResourceBundle().getText("PAGE_TIT_SUFFIX");

				//add inm bread crumbs
				var bOpenBreadCrumbs = Configuration.getSystemSetting("sap.ino.config.OPEN_FOR_INM_BREADCRUMBS") === "0" ? false : true;
				var oBreadCrumbs = that.getRootView().byId("inmBreadCrumbs");
				oBreadCrumbs.setVisible(bOpenBreadCrumbs);

				if (bOpenBreadCrumbs && (oCurrentHash.hash !== sLastHash)) {
					var sCurrentRoute = that.getCurrentRoute();
					if (sCurrentHash === 'my-setting') {
						sCurrentRoute = "mySetting";
					}

					var oCurrentRouteObject = that.getBreadObjectByName(sCurrentRoute);
					var innerShell = that.getRootView().byId("innerShell");
					innerShell.addStyleClass("sapInoInnoMgmtMShellBreadCrumbs");
					var sBreadCrumbsLength = oBreadCrumbs.getLinks().length;
					//var oLastBreadObject = that.getBreadObject(oLastHash?oLastHash.title:"");
					oBreadCrumbs.addStyleClass("inmBreadCrumbs");
					if (sCurrentRoute === oBreadCrumbsModel.getProperty("/CurrentRoute")) {
						oBreadCrumbs.removeLink(sBreadCrumbsLength - 1);
						that.maintainBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, oBreadCrumbsModel, sCurrentHash, sCurrentTitle);

					} else if (sCurrentDirection !== "Backwards") {
						that.maintainBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, oBreadCrumbsModel, sCurrentHash, sCurrentTitle);
					} else if (sBreadCrumbsLength === 1) {
						that.maintainBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, oBreadCrumbsModel, sCurrentHash, sCurrentTitle);
					} else {
						oBreadCrumbs.removeLink(sBreadCrumbsLength - 1);
						//	var sNumber = oBreadCrumbs.getLinks().length > 1 ? oBreadCrumbs.getLinks().length - 2 : oBreadCrumbs.getLinks().length - 1;
						var oCurentLink = oBreadCrumbs.getLinks()[oBreadCrumbs.getLinks().length - 1];
						oCurentLink.setEnabled(false);
						if (oBreadCrumbsModel.getProperty("/CurrentRoute") !== sCurrentRoute) {
							that.maintainBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, oBreadCrumbsModel, sCurrentHash, sCurrentTitle);
						}
					}
				}

			};

			var _routeMatchedHandle = function(e) {
				that.getRootView().fireEvent('routeMatchedEvent', e.getParameters());
			};

			oRouter.setRoutingCallback(fnRoutingCallback);
			oRouter.setCloseCallback(fnCloseCallback);
			// 			oRouter.setTitleChangeCallback(fnTitleChangeCallback);
			oRouter.attachRoutePatternMatched(null, fnTitleChangeCallback);
			oRouter.attachBypassed(null, fnRoutingCallback);
			oRouter.attachRouteMatched(null, _routeMatchedHandle);
		},

		initURLWhitelist: function() {
			var aWhitelist = Configuration.getURLWhitelist();
			if (aWhitelist && aWhitelist.length > 0) {
				// Add own host to whitelist so that attachments on the same host can be used and linked in rich
				// text editor. window.location.protocol contains protocol with colon, but is expected without
				jQuery.sap.addUrlWhitelist(window.location.protocol.split(':')[0], window.location.hostname, window.location.port, null);
				jQuery.each(aWhitelist, function(iIndex, oWhitelistEntry) {
					jQuery.sap.addUrlWhitelist(oWhitelistEntry.PROTOCOL, oWhitelistEntry.HOST, oWhitelistEntry.PORT, oWhitelistEntry.PATH);
				});
			} else {
				// Add own host to whitelist so that attachments on the same host can be used and linked in rich
				jQuery.sap.addUrlWhitelist(window.location.protocol.split(':')[0], window.location.hostname, window.location.port, null);
			}
		},

		initSessionTimeoutHandler: function() {
			var COMPLETED_READY_STATE = 4;
			var originalXHROpen = XMLHttpRequest.prototype.open;

			var fnTimeoutHandler = function(oEvent) {
				if (oEvent.type === "error") {
					jQuery.ajax({
						url: Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/checkSession.xsjs",
						success: function(res, status, xhr) {
							if (res.login === false) {
								window.location.reload(false);
							}
						}
					});
				}
				var oRegex = new RegExp(Configuration.getBackendRootURL(), "igm");
				//Handel SAPUI5 CDN
				if (this.readyState === COMPLETED_READY_STATE && (!this.responseURL || (this.responseURL && Configuration.isAbsoluteURL(this.responseURL) &&
					oRegex.test(this.responseURL)))) {
					var originLocation = this.getResponseHeader("x-sap-origin-location");
					var loginHeader = this.getResponseHeader('x-sap-login-page');
					if (loginHeader && originLocation) {
						window.location.reload(false);
					}
				}
			};

			XMLHttpRequest.prototype.open = function() {
				this.addEventListener('readystatechange', fnTimeoutHandler, false);
				this.addEventListener('error', fnTimeoutHandler, false);
				originalXHROpen.apply(this, arguments);
			};
		},

		/*Dealing with the accessibility issue: When foucs on the first element of the whole dom tree and press TAB+SHIFT,
    preventing navigate to the address bar and navigating to the first element in the List instead.*/
		initTabHandler: function() {
			$(document).ready(
				function() {
					document.onkeydown = function() {
						var oEvent = window.event;
						if (document.activeElement.id === "sap-ino-main--openMenu") {
							if (oEvent.which === jQuery.sap.KeyCodes.TAB && oEvent.shiftKey) {
								$("div[id$='list-after']").focus();
							}
						}
					};
				}
			);
		},

		start: function() {
			WebAnalytics.start(Configuration);
			this.getRouter().initialize();
		},

		getVersionTimestamp: function() {
			/* make sure @UI_VERSION_TIME... is not replaced by UI build */
			return jQuery.sap.startsWith(sVersionTimestamp, "@UI_VERSION_TIME") ? "development" : sVersionTimestamp;
		},

		getVersion: function() {
			var oMeatadata = this.getMetadata();
			//avoiding to get verserion from cust component
			while (oMeatadata && oMeatadata.getName() !== "sap.ino.apps.ino.Component") {
				oMeatadata = oMeatadata.getParent();
			}
			return !oMeatadata ? undefined : oMeatadata.getVersion();
		},

		getCurrentUserId: function() {
			return this._getCurrentUser().USER_ID;
		},

		getCurrentUserImageId: function() {
			return this._getCurrentUser().IDENTITY_IMAGE_ID;
		},

		getCurrentUserName: function() {
			return this._getCurrentUser().NAME;
		},

		getCurrentTechnicalUserName: function() {
			return this._getCurrentUser().USER_NAME;
		},

		getCurrentView: function() {
			return this.getRootController().getCurrentPage();
		},

		setCurrentRoute: function(sName) {
			this.getModel("navigation").setProperty("/Route", sName);
		},

		getCurrentRoute: function() {
			return this.getModel("navigation").getProperty("/Route");
		},

		navigateTo: function(sTarget, oData, bNoHistory, bNoBusy) {
			this.getRouter().navTo(sTarget, oData, bNoHistory, bNoBusy);
		},

		navigateToExternal: function(sTarget, oData) {
			var that = this;
			var navigate = function() {
				var sURL = that.getRouter().getURL(sTarget, oData);
				var windower = window.open(sURL, "InnovationManagement");
				windower.opener = null;
			};
			this._navigateIfAllowed(navigate);
		},

		navigateToByURL: function(sURL) {
			var navigate = function() {
				window.location.href = sURL;
			};
			this._navigateIfAllowed(navigate);
		},

		navigateToInNewWindow: function(sTarget, oData) {
			var sURL = this.getRouter().getURL(sTarget, oData);
			var windower = window.open(sURL, "_blank");
			windower.opener = null;
		},

		navigateToByURLInNewWindow: function(sURL) {
			var windower = window.open(sURL, "_blank");
			windower.opener = null;
		},

		getNavigationLink: function(sRouteName, oParameters) {
			return "#/" + this.getRouter().getURL(sRouteName, oParameters);
		},

		getRootView: function() {
			return this.getAggregation("rootControl");
		},

		getRootController: function() {
			return this.getRootView().getController();
		},

		getShell: function() {
			// return this.getRootView() ? this.getRootView().getContent()[0] : undefined;
			return this.getRootView() ? this.getRootView().byId("innerShell") : undefined;
		},

		logout: function() {
			var that = this;
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/token.xsjs",
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(res, status, xhr) {
					var sToken = xhr.getResponseHeader("X-CSRF-Token");
					jQuery.ajax({
						url: Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/logout.xscfunc",
						headers: {
							"X-CSRF-Token": sToken
						},
						type: "post",
						contentType: "application/xml",
						success: function(res, status, xhr) {
							window.location = Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/login.html?x-sap-origin-location=" +
								encodeURIComponent(window.location.pathname) + encodeURIComponent(window.location.hash);
						},
						error: function(oResponse) {
							that.showMessage(MessageType.Error, that._i18n.getResourceBundle().getText("LOGOUT_ERROR_MSG"));
						}
					});
				}
			});
		},

		setHelpContent: function(sHTML) {
			var oHelpModel = this.getModel("help");
			oHelpModel.setProperty("/CONTENT", sHTML);
		},

		_getCurrentUser: function() {
			if (!this._oCurrentUser) {
				this._oCurrentUser = Configuration.getCurrentUser();
			}
			return this._oCurrentUser;
		},

		_navigateIfAllowed: function(fnNavigate) {

			var that = this;

			var fnNavigateIfAllowed = function() {

				var bAllowed = that.getRootController().isNavigationAllowed();
				//reset TermAcceptCallback
				Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", null);
				if (!bAllowed) {
					var oRootController = that.getRootController();
					oRootController.showDataLossPopup(fnNavigate);
				} else {
					fnNavigate();
				}
			};

			var iTermAcceptStatus = Configuration.getUserModel().getProperty("/data/TERM_ACCEPTED");
			var sTermCode = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_TEXT");

			//"1" Active Term & Condtion,  "0" , Deactive Term & Conditioan
			var sTermConditionActive = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE");

			var oTermDialog = this.getRootController().getTermsDialog(this.getRootController());

			//reset TermAcceptCallback
			Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", null);

			if (iTermAcceptStatus === 0 && sTermCode && sTermConditionActive === "1" && !oTermDialog.isOpen()) {

				Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", 0);
				Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", fnNavigateIfAllowed);
				Configuration.getUserModel().setProperty("/data/TERMACTION", true);

				oTermDialog.setStretch(true);
				oTermDialog.open();
			} else {
				if (!oTermDialog.isOpen()) {
					fnNavigateIfAllowed();
				}
			}

		},

		attachNavigate: function(fnCallback, oHandler) {
			if (this.getRootView()) {
				this.getRootController().byId("app").attachNavigate(fnCallback, oHandler);
				return true;
			}
			return false;
		},

		detachNavigate: function(fnCallback, oHandler) {
			if (this.getRootView()) {
				this.getRootController().byId("app").detachNavigate(fnCallback, oHandler);
				return true;
			}
			return false;
		},

		attachAfterNavigate: function(fnCallback, oHandler) {
			if (this.getRootView()) {
				this.getRootController().byId("app").attachAfterNavigate(fnCallback, oHandler);
				return true;
			}
			return false;
		},

		detachAfterNavigate: function(fnCallback, oHandler) {
			if (this.getRootView()) {
				this.getRootController().byId("app").detachAfterNavigate(fnCallback, oHandler);
				return true;
			}
			return false;
		},
		//        inm Bread Crumbs function
		maintainBreadCrumbs: function(oBreadCrumbs, oCurrentRouteObject, oBreadModel, sCurrentHash, sCurrentTitle) {
			var bGoonBread;
			var bLastBread;
			var oParameter;
			var aPath = sCurrentHash.split("/").length > 1 ? sCurrentHash.split("/")[1] : "";
			var sVariant = oCurrentRouteObject.variant ? sCurrentTitle.split("_").pop() : "";
			if (oBreadModel.getProperty("/CurrentAvailable") === "all") {
				bGoonBread = false;

			} else if (oBreadModel.getProperty("/CurrentAvailable") !== "none") {
				var aAvailablePath = oBreadModel.getProperty("/CurrentAvailable").split("/");
				aAvailablePath.forEach(function(sName, iPathIndex) {
					if (!bGoonBread) {
						bGoonBread = sName === oCurrentRouteObject.name ? true : false;
						return;
					}
				});
			} else {
				bGoonBread = false;
			}
			if (bGoonBread) {

				bLastBread = true;
				oParameter = null;
				this.addBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, aPath, oBreadModel, bLastBread, oParameter, sVariant, oCurrentRouteObject);
			} else {
				// Determine trail parts
				oBreadCrumbs.destroyLinks();

				var aParts = oCurrentRouteObject.path.split("/");
				var slength = aParts.length;

				aParts.forEach(jQuery.proxy(function(sName, iPathIndex) {
					var oCrumbs = this.getBreadObjectByName(sName);
					if (oCrumbs.pattern) {
						oParameter = {};
						oParameter[oCrumbs.pattern] = aPath;
					}
					bLastBread = slength === iPathIndex + 1;
					this.addBreadCrumbs(oBreadCrumbs, oCrumbs, aPath, oBreadModel, bLastBread, oParameter, sVariant, oCurrentRouteObject);

				}, this));
			}
		},

		addBreadCrumbs: function(oBreadCrumbs, oCrumbs, aPath, oBreadModel, bLastBread, oParameter, sVariant, oCurrentRouteObject) {
			var sPrefix = Configuration.getBackendRootURL() + "/sap/ino/" + window.location.search;
			var sOdataPath = Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_APPLICATION");
			if (Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
				sOdataPath = Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			}
			sOdataPath += "/";

			if ((oCrumbs.name === "campaign" || oCrumbs.name === "campaign-idealist") && oCurrentRouteObject.name === "idea-display") {
				var oCampaignData = jQuery.ajax({
					url: sOdataPath + "IdeaSmall(" + aPath + ")",
					type: "GET",
					dataType: "json",
					async: false

				});
				oCampaignData.done(function(oResponse) {
					aPath = oResponse.d.CAMPAIGN_ID;
					oParameter.id = aPath;
				});
			}

			var sName, sTitle, sVariantText, sDefault, sTempCampaignId;
			var sObjectTitle = "";
			var oDataPath;
			//for custom reports odata
			if (oCrumbs.name === 'report') {
				var bMyReport = aPath.indexOf("MyReports") >= 0 ? true : false;
				if (bMyReport) {
					oDataPath = aPath;
				} else {
					var sReportPath = aPath.split("'")[1];
					oDataPath = oCrumbs.oData + "(CODE='" + sReportPath + "')";
				}

			} else {
				oDataPath = oCrumbs.oData + "(" + aPath + ")";
			}
			var that = this;
			if (oCrumbs.pattern) {
				var oObjectData = jQuery.ajax({
					url: sOdataPath + oDataPath,
					type: "GET",
					dataType: "json",
					async: false

				});
				oObjectData.done(function(oResponse) {
					sName = oResponse.d.SHORT_NAME ? oResponse.d.SHORT_NAME : oResponse.d.NAME;
					sTitle = oResponse.d.TITLE ? oResponse.d.TITLE : sName;
					sDefault = oResponse.d.DEFAULT_TEXT ? oResponse.d.DEFAULT_TEXT : sTitle;
					// custom report odata
					if (oCrumbs.name === 'report' && !bMyReport) {
						sDefault = that.getModel("code").getText("sap.ino.xs.object.analytics.ReportTemplate.Root", oResponse.d.CODE);
					}
					if (bMyReport) {
						var oConfigJson = JSON.parse(oResponse.d.CONFIG);
						sDefault = oConfigJson.Title;
						bMyReport = false;
					}
					if (oCrumbs.name === 'idea-display' && oCurrentRouteObject.name === "idea-display" && oCurrentRouteObject.path.indexOf('campaign-idealist/idea-display') > -1) {
						sTempCampaignId = oResponse.d.CAMPAIGN_ID;
					}

				});
				if (oCrumbs.title) {
					sObjectTitle = this._i18n.getResourceBundle().getText(oCrumbs.title) + " ";
				}
			}

			if (oCrumbs.variant && this.getCurrentRoute() === oCrumbs.name) {
				var sListVariant = this.getCurrentView().getController().getViewProperty(
					"/List/VARIANT");
				var currentSelectLink = this.getCurrentView().getController().list ? this.getCurrentView().getController().list.CURRENTSELECTLINK :
					"";
				this.getCurrentView().getController().getModel("list").setProperty("/CURRENTSELECTLINK", undefined);
				var aArray = this.getCurrentView().getController().list ? this.getCurrentView().getController().list.Variants : "";
				if (aArray !== "" && currentSelectLink && currentSelectLink.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
					sVariantText = currentSelectLink.LINK_TEXT;
				} else if (aArray !== "" && this.getObjectListVariantText(aArray, sListVariant)) {
					sVariantText = this.getObjectListVariantText(aArray, sListVariant);
				}
			} else if (oCrumbs.TEXT) {
				sVariantText = this._i18n.getResourceBundle().getText(oCrumbs.TEXT);
			} else {
				sVariantText = "";
			}
			//Fix campaign list->idea display click leadinng idea(different campaign: merge idea function)
			if (oCrumbs.name === 'idea-display' && oCurrentRouteObject.name === "idea-display" && oCurrentRouteObject.path.indexOf('campaign-idealist/idea-display') > -1) {
				var aLinks = oBreadCrumbs.getLinks();
				var oLastLink = aLinks[aLinks.length - 1];
				var sNewCampaignName;
				//this._i18n.getResourceBundle().getText("BREAD_CAMPAIGN_TITLE_TEXT")
				if (sTempCampaignId && oLastLink && oLastLink.getProperty("href").indexOf('campaign/') > -1 && oLastLink.getProperty("href").indexOf('campaign/' + sTempCampaignId) === -1) {
					var oCampaignDataOnceAgain = jQuery.ajax({
						url: sOdataPath + 'CampaignSmall(' + sTempCampaignId + ')',
						type: "GET",
						dataType: "json",
						async: false
					});
					oCampaignDataOnceAgain.done(function(oResponse) {
						sNewCampaignName = oResponse.d.SHORT_NAME ? oResponse.d.SHORT_NAME : oResponse.d.NAME;
					});

					oLastLink.setProperty("href", sPrefix + this.getNavigationLink('campaign', {
						id: sTempCampaignId
					}));
					oLastLink.setProperty("text", this._i18n.getResourceBundle().getText("BREAD_CAMPAIGN_TITLE_TEXT") + sNewCampaignName);
				}
			}

			oBreadCrumbs.addLink(new sap.m.Link({
				text: oCrumbs.pattern ? sObjectTitle + sDefault : sVariantText,
				target: "_top",
				enabled: bLastBread ? false : true,
				href: bLastBread ? window.location.href + window.location.search : sPrefix + this.getNavigationLink(oCrumbs.name, oParameter)
			}));
			if (bLastBread && oBreadCrumbs.getLinks().length > 1) {
				var sNumber = oBreadCrumbs.getLinks().length > 1 ? oBreadCrumbs.getLinks().length - 2 : oBreadCrumbs.getLinks().length - 1;
				oBreadCrumbs.getLinks()[sNumber].setEnabled(true);
				this.setHistoricalTitle(oCrumbs.pattern ? sObjectTitle + sDefault : sVariantText);
			}
			oBreadModel.setProperty("/CurrentAvailable", oCrumbs.available ? oCrumbs.available : "none");
			oBreadModel.setProperty("/CurrentRoute", oCrumbs.name);
		},
		setBreadCrumbsText: function(oBreadCrumbs, sText) {

			oBreadCrumbs.setCurrentLocationText(sText);

		},

		getBreadObjectByName: function(sText) {
			var breadCrumbsObject;
			jQuery.each(breadCrumbsTexts, function(i, val) {
				if (val.name === sText) {
					breadCrumbsObject = val;
				}

			});
			return breadCrumbsObject;
		},

		getObjectListVariantText: function(aArray, sText) {
			var aValues = aArray.Values;
			var sCode;
			jQuery.each(aValues, function(i, val) {
				if (val.ACTION === sText && val.TEXT) {
					sCode = val.TEXT;
				}
			});
			//For company centric view
			if (sText && sText.indexOf('mygroup') > -1 && sCode) {
				return this._i18n.getResourceBundle().getText(sCode, [Configuration.getGroupConfiguration().DISPLAY_LABEL]);
			}
			if (sCode) {
				return this._i18n.getResourceBundle().getText(sCode);
			}
			return "";
		},
		setHistoricalTitle: function(sVariantText) {
			var sCurrentHash = this.getModel("history").getProperty("/CurrentHash") ? this.getModel("history").getProperty("/CurrentHash").hash :
				'';
			var oHashObject = {
				detailTitle: sVariantText,
				hash: sCurrentHash
			};
			var aHashList = this.getModel("historyDetail").getProperty("/HashList");
			aHashList.unshift(oHashObject);
			this.getModel("historyDetail").setProperty("/HashList", aHashList);

		}
	});
});