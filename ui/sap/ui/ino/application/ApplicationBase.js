/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.ApplicationBase");
(function(window, undefined) {
	"use strict";

	jQuery.sap.require("sap.ui.commons.MessageBox");

	jQuery.sap.require("sap.ui.ino.models.core.MetaModel");
	jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
	jQuery.sap.require("sap.ui.ino.application.NavigationHandler");
	jQuery.sap.require("sap.ui.ino.application.WebAnalytics");
	var NavigationHandler = sap.ui.ino.application.NavigationHandler;
	jQuery.sap.require("sap.ui.ino.application.Configuration");
	var Configuration = sap.ui.ino.application.Configuration;
	var WebAnalytics = sap.ui.ino.application.WebAnalytics;

	// gets replaced by ui build
	var sVersion = "@UI_VERSION@";

	sap.ui.base.ManagedObject.extend("sap.ui.ino.application.ApplicationBase", {
		metadata: {
			properties: {
				root: "string",
				oDataPath: "string",
				customBackHandling: "boolean",
				keepViewOnNavigation: "boolean",
				mobileMode: "boolean",
				navigationPaths: "object"
			},
			associations: {
				"rootContent": {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				"navigate": {},
				"helpContextChanged": {},
				"rootContentInitialized": {}
			}
		},

		constructor: function(oSettings) {
			sap.ui.base.ManagedObject.apply(this, arguments);

			// the init function is already called by managed
			// object

			// never copy this code without having understood licensing
			// conditions of the TinyMCE RichTextEditor (see JSDoc)
			if (sap.ui.richtexteditor) {
				sap.ui.richtexteditor.TinyMCELicense = "sap.only";
			}
            
            
			if (this.main) {
			    var that = this;
			    sap.ui.getCore().attachInit(function(){
                    jQuery(jQuery.proxy(that.main, that));
               });
			}

			if (this.onBeforeExit) {
				jQuery(window).on('beforeunload', jQuery.proxy(this.onBeforeExit, this));
			}

			if (this.onExit) {
				jQuery(window).on('pagehide', jQuery.proxy(this.onExit, this));
			}

			if (this.onError) {
				window.onerror = jQuery.proxy(function(sMessage, sFile, iLine) {
					this.onError(sMessage, sFile, iLine);
				}, this);
			}

			jQuery(window).on('pagehide', jQuery.proxy(function() {
				jQuery(document).off("keydown", jQuery.proxy(this.handlekeydown));
			}, this));
		},

		onBeforeExit: function() {
			// The logic of this method is like this (this is defined by browser vendors)
			// If we return a value a popup when leaving the application is displayed.
			// The string we return is added to a default browser popup which cannot be
			// influenced by the application
			if (this.hasCurrentViewPendingChanges()) {
				return this.getTextBundle().getText("FO_APPLICATION_INS_DATALOSS");
			}
		},

		main: function() {
			jQuery(document).on("keydown", jQuery.proxy(this.handlekeydown, this));

			var sUserLocale = Configuration.getUserLocale();
			sap.ui.getCore().getConfiguration().setLanguage(sUserLocale);

			this.initModels();

			var oTextModel = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT);
			this._updatePageLanguage(oTextModel.getResourceBundle().sLocale);

			this.initUser();
			this.initURLWhitelist();

			this._sCurrentHash = undefined;
			this._aHelpContext = [];
			this._additionalContext = [];
			this.initRootContent();

			this.initNavigationPaths(this.getNavigationPaths());

			var rootContent = this.getRootContentControl();
			rootContent.placeAt(this.getRoot(), "only");
			this.startNavigationHandling();
			this.fireRootContentInitialized({
				rootContent: rootContent
			});
		},

		initRootContent: function() {
			// This method has to be overridden in the specific application to initialize the shell
		},

		init: function() {},

		logout: function() {
			sap.ui.ino.application.ApplicationBase.logout();
		},

		handlekeydown: function(oEvent) {
			if (oEvent.shiftKey && oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.F) {
				if (this.setSearchFocus) {
					this.setSearchFocus(oEvent);
				}
			} else if (oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.M) {
				if (this.setMessageFocus) {
					this.setMessageFocus(oEvent);
				}
			}
		},

		initModels: function() {
			var that = this;

			var model;
			/**
			 * The following line is a temporary fix for the SAP UI5 problem with the direct use of localStorage
			 * that causes an application startup problem. This fix should be removed, once UI5 fixes this issue.
			 */
			sap.ui.getCore().getConfiguration().getStatistics = function() {
				return false;
			}
			/* End of fix*/
			var sODataPath = this.getODataPath() || Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_APPLICATION");

			try {
				// Global OData model for read access to data
				model = new sap.ui.model.odata.ODataModel(sODataPath, false);
			} catch (oError) {
				if (oError.name !== "SyntaxError" && oError.name !== "TypeError") {
					// this error happens from time to time, when xs does not redirect to the login page
					// a refresh solves the problem
					location.reload(true);
					throw "failed to load the application";
				} else {
					jQuery.sap.log.error(oError.name, null, "sap.ui.ino.application.ApplicationBase");
					throw "failed to load the application";
				}
			}

			// this is set to "None" to avoid expensive HANA inline count calculations
			model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			sap.ui.getCore().setModel(model);

			// Meta model
			sap.ui.getCore().setModel(sap.ui.ino.models.core.MetaModel, sap.ui.ino.application.ApplicationBase.MODEL_META);

			// Codes
			sap.ui.getCore().setModel(sap.ui.ino.models.core.CodeModel, sap.ui.ino.application.ApplicationBase.MODEL_CODE);

			// notification model => use a separate model to prevent refresh-dependencies between different entites
			var oNotificationModel = new sap.ui.model.odata.ODataModel(sODataPath, false);
			// this is set to "Inline" to get a performance boost of x2 as
			// otherwise separate calls are done to retrieve the counts
			oNotificationModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
			sap.ui.getCore().setModel(oNotificationModel, sap.ui.ino.application.ApplicationBase.MODEL_NOTIFICATION);

			// UI Texts
			var oUITextBundle = new sap.ui.model.resource.ResourceModel({
				bundleUrl: Configuration.getResourceBundleURL(sap.ui.ino.application.ApplicationBase.RESOURCE_UITEXT)
			});

			sap.ui.getCore().setModel(oUITextBundle, sap.ui.ino.application.ApplicationBase.MODEL_TEXT);

			// Message Texts
			var oMsgBundle = new sap.ui.model.resource.ResourceModel({
				bundleUrl: Configuration.getResourceBundleURL(sap.ui.ino.application.ApplicationBase.RESOURCE_MESSAGE)
			});

			sap.ui.getCore().setModel(oMsgBundle, sap.ui.ino.application.ApplicationBase.MODEL_MSG);

			// Text Modules
			var oModuleBundle = new sap.ui.model.resource.ResourceModel({
				// INM-418: retrieve this resource from backend instead of local cache every time when terms and conditions info updated.
				bundleUrl: Configuration.getResourceBundleURL(sap.ui.ino.application.ApplicationBase.RESOURCE_MODULE) + '?t=' + Date.now()
			});

			sap.ui.getCore().setModel(oModuleBundle, sap.ui.ino.application.ApplicationBase.MODEL_TEXT_MODULE);

			// Sysstem Settings
			sap.ui.getCore().setModel(Configuration.getSystemSettingsModel(), sap.ui.ino.application.ApplicationBase.MODEL_SYSTEM_SETTINGS);

			// be aware that this function is not called if a manual read is triggered on the model
			model.attachRequestFailed(function(oEvent) {
				if (that.getCurrentPageView().attachRequestFailed) {
					that.getCurrentPageView().attachRequestFailed(oEvent);
				} else {
					that.handleODataError(oEvent);
				}
			});

			var fnTimeoutHandler = function(event) {
				if (!event.getParameter("errorobject") && false === event.getParameter("success")) {
					that.logout();
				}
			};

			model.attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_META).attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_CODE).attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_NOTIFICATION).attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).attachRequestCompleted(fnTimeoutHandler);
			sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT_MODULE).attachRequestCompleted(fnTimeoutHandler);
		},

		handleODataError: function(oEvent) {
			// Overwrite in Application, e.g. use showODataError;
		},

		showODataError: function(oEvent) {
			var statusCode = oEvent.getParameter("statusCode");
			var oMsgBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			switch (statusCode) {
				case 404:
					break;
				default:
					statusCode = "GENERAL";
					break;
			}
			this.showError(oMsgBundle.getResourceBundle().getText("MSG_HTTP_ERROR_" + statusCode));
		},

		_updatePageLanguage: function(sLocale) {
			var $Html = jQuery('html');
			if (sLocale && !$Html.attr('lang')) {
				sLocale = sLocale.replace("_", "-"); // attribute requires "-" not "_"
				$Html.attr('lang', sLocale);
			}
		},

		getXSRFToken: function() {
			return Configuration.getXSRFToken();
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

		initUser: function() {
			this._oCurrentUser = Configuration.getCurrentUser();
		},

		showMessageError: function(sMessage, sTitle, fnOk) {},

		showMessageConfirm: function(sMessage, sTitle, fnOk, fnCancel) {},

		showError: function(sErrorMessage) {
			var that = this;

			// show the same error only once
			if (!this.aOpenMessages) {
				this.aOpenMessages = [];
			}
			if (-1 == jQuery.inArray(sErrorMessage, this.aOpenMessages)) {
				this.aOpenMessages.push(sErrorMessage);

				var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
				var sTitle = i18n.getText("GENERAL_APPLICATION_TIT_ERROR");
				this.showMessageError(sErrorMessage, sTitle, function() {
					// Navigating away is tedious for error analysis
					var index = that.aOpenMessages.indexOf(sErrorMessage);
					if (index > -1) {
						that.aOpenMessages.splice(index, 1);
					}
				});
			}
		},

		getRootContentControl: function() {
			return sap.ui.getCore().byId(this.getRootContent());
		},

		getDefaultPath: function() {
			var mPaths = this.getNavigationPaths();
			var sDefaultPath = "home";
			if(this.isNavigationEnabled("userlist") && !this.isNavigationEnabled("campaigntiles")){
			    return "userlist";
			}
			jQuery.each(mPaths, function(sPath, oPath) {
				if (oPath.isDefault) {
					sDefaultPath = sPath;
					return false;
				}
			});
			return sDefaultPath;
		},

		enhanceHistoryState: function(historyState) {
			return historyState;
		},

		initNavigationPaths: function(mNavigationPaths) {
			this._oNavHandler = new sap.ui.ino.application.NavigationHandler(mNavigationPaths, this.getMobileMode());
			this._oNavHandler.attachNavigationPathMatched(this.handleNavigation, this);
			this._oNavHandler.attachDefaultMatched(this.handleDefaultNavigation, this);
			this._oNavHandler.attachNothingMatched(this.handleDefaultNavigation, this);
		},

		startNavigationHandling: function() {
			this._oNavHandler.initialize();
		},

		handleNavigation: function(oEvent) {
			var oApp = this;
			var sPath = oEvent.getParameter("path");
			var vHistoryState = oEvent.getParameter("historyState");
			var oNavigationContext = oEvent.getParameter("context");
			var bBack = oEvent.getParameter("back");

			if (oApp.enhanceHistoryState) {
				vHistoryState = oApp.enhanceHistoryState(vHistoryState);
			}

			var oRootContent = oApp.getRootContentControl();

			var sViewId = sPath;
			var sViewName = oNavigationContext.pageView;
			var bAlwaysRecreate = oNavigationContext.alwaysRecreate;

			// Overwrite pageView default in case history state defines a target view (e.g. used in comment icon
			// of idea card)
			if (oNavigationContext.targetViews && vHistoryState.targetView && oNavigationContext.targetViews[vHistoryState.targetView]) {
				sViewId += "-" + vHistoryState.targetView;
				sViewName = oNavigationContext.targetViews[vHistoryState.targetView];
			}

			jQuery.sap.log.debug("History callback handler: Path: " + sPath + " History state: " + vHistoryState, null,
				"sap.ui.ino.application.ApplicationBase");

			if (oApp._bNavigationAbortPending) {
				oApp._bNavigationAbortPending = false;
				return;
			}

			oApp._navigateIfAllowed(bBack, function() {
				oApp._sCurrentHash = oApp._getCurrentBrowserHash();

				var oPageView;

				var oPreviousPageView = oApp.getCurrentPageView();

				if (bBack && oApp.getCustomBackHandling() && oRootContent.handleBack) {
					oPageView = oRootContent.handleBack(sViewId);
				} else {
					oPageView = sap.ui.getCore().byId(sViewId);
					if (oPageView && bAlwaysRecreate && !oApp.getKeepViewOnNavigation()) {
						oPageView.destroy();
						oPageView = null;
					}

					if (!oPageView) {
						oPageView = sap.ui.view({
							id: sViewId,
							viewName: sViewName,
							type: sap.ui.core.mvc.ViewType.JS,
							viewData: oNavigationContext.viewData
						});
					}
				}

				jQuery.sap.log.info("Navigating path " + sPath + " to " + sViewName, null, "sap.ui.ino.application.ApplicationBase");

				var oBeforePromise;
				if (oApp.beforeSetContent) {
					oBeforePromise = oApp.beforeSetContent({
						path: sPath,
						state: vHistoryState,
						pageView: oPageView,
						previousPageView: oPreviousPageView
					});
				}

				if (oBeforePromise) {
					oBeforePromise.done(setContent);
				} else {
					setContent();
				}

				function setContent() {
					// Finally we can destroy the old view (onBeforeExit)
					if (oPreviousPageView && !oPreviousPageView.bIsDestroyed && oPreviousPageView.destroy && oPreviousPageView !== oPageView && !oApp.getKeepViewOnNavigation()) {
						if (typeof oPreviousPageView.onBeforeExit === "function") {
							oPreviousPageView.onBeforeExit();
						}
					}

					oRootContent.setContent(oPageView);
					// hide system message for specific views
					if (oRootContent.setMsgHide) {
						if (oNavigationContext.hideMessage) {
							oRootContent.setMsgHide(true);
						} else {
							oRootContent.setMsgHide(false);
						}
					}

					// history is set AFTER setting the content in the shell
					// otherwise all bindings will be created delayed as
					// global models are only reflected if the view
					// has a parent
					if (oPageView.setHistoryState !== undefined) {
						oPageView.setHistoryState(vHistoryState, bBack);
					}

					oApp.fireNavigate();
					oApp.setHelpContext(oNavigationContext.helpContext, oNavigationContext.additionalHelpContext);

					// Finally we can destroy the old view
					if (oPreviousPageView && !oPreviousPageView.bIsDestroyed && oPreviousPageView.destroy && oPreviousPageView !== oPageView && !oApp.getKeepViewOnNavigation()) {
						oPreviousPageView.destroy();
					}

					if (oApp.afterSetContent) {
						oApp.afterSetContent({
							path: sPath,
							state: vHistoryState,
							pageView: oPageView
						});
					}
				}
			});
		},

		handleDefaultNavigation: function() {
			var sDefaultPath = this.getDefaultPath();
			this.navigateTo(sDefaultPath);
		},

		getTextBundle: function() {
			return sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
		},

		hasCurrentViewPendingChanges: function() {
			var oCurrentPageView = this.getCurrentPageView();
			return (oCurrentPageView && oCurrentPageView.hasPendingChanges && oCurrentPageView.hasPendingChanges());
		},

		_navigateIfAllowed: function(bBack, fnNavigationAllowed) {
			var that = this;
			var sCurrentHash = this._sCurrentHash;

			if (!this._bDatalossDialogPending) {
				this.isNavigationAllowed(function() {
					that._bNavigationAbortPending = false;
					that._fnAbortCallback = undefined;
					fnNavigationAllowed();
				}, function() {
					that._abortNavigation(sCurrentHash);
				});
			}
		},

		isNavigationAllowed: function(fnAllowedFunction, fnNotAllowedFunction) {
			var that = this;
			if (this.hasCurrentViewPendingChanges()) {
				// Don't open dialog a second time
				if (!this._bDatalossDialogPending) {
					this._bDatalossDialogPending = true;
					this.showDataLossPopoup(function(bResult) {
						that._bDatalossDialogPending = false;
						if (bResult === "OK") {
							if (fnAllowedFunction) {
								fnAllowedFunction();
							}
						} else {
							if (fnNotAllowedFunction) {
								fnNotAllowedFunction();
							}
						}
					});
				}
			} else {
				if (fnAllowedFunction) {
					fnAllowedFunction();
				}
			}
		},

		showDataLossPopoup: function(fnResultHandler) {
			var oBundle = this.getTextBundle();
			var sMessage = oBundle.getText("GENERAL_APPLICATION_INS_DATALOSS");
			var sTitle = oBundle.getText("GENERAL_APPLICATION_TIT_DATALOSS");
			this.showMessageConfirm(sMessage, sTitle, fnResultHandler);
		},

		// a "real" abort cannot be done as it was already processed
		// What we do instead: go to original target hash
		// is NOT executed by setting a flag
		_abortNavigation: function(sTargetHash) {
			jQuery.sap.debug("Aborting navigation", null, "sap.ui.ino.application.ApplicationBase");
			this._bNavigationAbortPending = true;
			this._oNavHandler.replaceHash(sTargetHash);
			if (this._fnAbortCallback) {
				this._fnAbortCallback();
				this._fnAbortCallback = undefined;
			}
		},

		_getCurrentBrowserHash: function() {
			return this._oNavHandler.getCurrentHash();
		},

		getCurrentPageView: function() {
			var oContent = sap.ui.getCore().byId(this.getRootContent()).getContent();
			if (jQuery.isArray(oContent)) {
				if (oContent.length > 0) {
					oContent = oContent[0];
				} else {
					oContent = null;
				}
			}
			return oContent;
		},

		/**
		 * returns { path : "{string}", historyState : "{object}"}
		 * */
		getCurrentNavigationState: function() {
			return this._oNavHandler.getCurrentNavigationState();
		},

		isNavigationEnabled: function(sPath) {
			var bNavigationEnabled = true,
				bTempNavEnabled = false;
			var oPathSettings = this.getNavigationPaths()[sPath];
			if (oPathSettings && oPathSettings.privilege) {
				if (jQuery.isArray(oPathSettings.privilege)) {
					bTempNavEnabled = false;
					for (var index = 0; !bTempNavEnabled && index < oPathSettings.privilege.length; index++) {
						bTempNavEnabled = this.hasCurrentUserPrivilege(oPathSettings.privilege[index]);
					}
					bNavigationEnabled = bTempNavEnabled;
				} else {
					bNavigationEnabled = this.hasCurrentUserPrivilege(oPathSettings.privilege);
				}
			}

			if (bNavigationEnabled && oPathSettings && oPathSettings.activityCode) {
				bNavigationEnabled = Configuration.isComponentActive(oPathSettings.activityCode);
			}
			return bNavigationEnabled;
		},

		getNavigationLink: function(sPath, oData) {
			return "#" + NavigationHandler.getHash(sPath, oData);
		},

		getExternalNavigationLink: function(sComponent, sPath, oData) {
			var sExternalPath = Configuration.getFullApplicationPath(sComponent);
			if (oData !== undefined && oData !== null) {
				sExternalPath = sExternalPath + '/' + this.getNavigationLink(sPath, oData);
			} else {
				sExternalPath = sExternalPath + '/';
			}
			return sExternalPath;
		},

		getEncodedNavigationLink: function(sComponent, sPath, oData) {
			return window.encodeURIComponent(this.getExternalNavigationLink(sComponent, sPath, oData));
		},

		navigateTo: function(sPath, oData, fnAbortCallback) {
			var sHash = NavigationHandler.getHash(sPath, oData, true);
			// this method already encodes, so the previous method should not encode the hash
			this._oNavHandler.setHash(sHash);
			this._fnAbortCallback = fnAbortCallback;
		},

		navigateToExternal: function(sComponent, sPath, oData, fnAbortCallack) {
			var sURL = this.getExternalNavigationLink(sComponent, sPath, oData);
			var windower = window.open(sURL, "InnovationManagement");
			windower.opener = null;
		},

		navigateToByURL: function(sURL, fnAbortCallback) {
			window.location.href = sURL;
			this._fnAbortCallback = fnAbortCallback;
		},
		
		navigateToInNewWindow: function(sPath, oData) {
			var sURL = this.getNavigationLink(sPath, oData);
			var windower = window.open(sURL, "_blank");
			windower.opener = null;
		},

		navigateToInNewModelWindow: function(sPath, oData, oIdeaFormId) {
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormModify");
			var sMode = "display";
			oModifyView.show(oIdeaFormId, sMode);
		},

		navigateToByURLInNewWindow: function(sURL) {
			var windower = window.open(sURL, "_blank");
			windower.opener = null;
		},

		navigateHome: function() {
			var sDefaultPath = this.getDefaultPath();
			this.navigateTo(sDefaultPath);
		},

		navigateBack: function(bStayInApplication) {
			this._oNavHandler.navigateBack(bStayInApplication);
		},

		getCurrentUserId: function() {
			return this._oCurrentUser.USER_ID;
		},

		getCurrentUserName: function() {
			return this._oCurrentUser.NAME;
		},

		getCurrentTechnialUserName: function() {
			return this._oCurrentUser.USER_NAME;
		},

		isUsingBasicAuth: function() {
			return this._oCurrentUser.BASIC_AUTH;
		},

		hasCurrentUserPrivilege: function(sPrivilege) {
			return Configuration.hasCurrentUserPrivilege(sPrivilege);
		},

		getHelpContext: function() {
			return this._aHelpContext[this._aHelpContext.length - 1];
		},

		getAdditionalContext: function() {
			return this._additionalContext[this._additionalContext.length - 1];
		},

		setHelpContext: function(sContext, additional) {
			this._aHelpContext = [sContext];
			this._additionalContext = [additional];
			this.fireHelpContextChanged({
				helpContext: sContext,
				additionalContext: additional
			});
		},

		pushHelpContext: function(sContext, additional) {
			this._aHelpContext.push(sContext);
			this._additionalContext = [additional];
			this.fireHelpContextChanged({
				helpContext: sContext,
				additionalContext: additional
			});
		},

		popHelpContext: function() {
			this._aHelpContext.pop();
			this._additionalContext.pop();
			var sContext = this.getHelpContext();
			var sAdditional = this.getAdditionalContext();
			this.fireHelpContextChanged({
				helpContext: sContext,
				additionalContext: sAdditional
			});
		},

		getUIVersion: function() {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			return i18n.getText("GENERAL_APPLICATION_FLD_VERSION", [sVersion]);
		},

		applyTheme: function(sUserTheme) {
			sap.ui.getCore().applyTheme(sUserTheme);
		},

		formatBackgroundImageURL: function(sCampaignBackgroundImageId, sCampaignSmallBackgroundImageId, sBackgroundImageURL,
			sSmallBackgroundImageId, bIsMobile) {
			var that = this;

			var bIsNonHighContrast = true;
			if (!bIsMobile) {
				var bIsHighContrast = sap.ui.getCore().getConfiguration().getTheme() === sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST;
				bIsNonHighContrast = !bIsHighContrast;
				sBackgroundImageURL = Configuration.getFrontofficeDefaultBackgroundImageURL(bIsHighContrast);
			}

			if (bIsNonHighContrast && sCampaignBackgroundImageId) {
				return that._getCampaignBackgroundImageURL(sCampaignBackgroundImageId, sCampaignSmallBackgroundImageId);
			}
			return that._getBackgroundImageURL(sBackgroundImageURL, sSmallBackgroundImageId);
		},

		_getCampaignBackgroundImageURL: function(sCampaignBackgroundImageId, sCampaignMobileSmallBackgroundImageId) {
			if (sap.ui.Device.system.phone) {
				return Configuration.getAttachmentTitleImageDownloadURL(sCampaignMobileSmallBackgroundImageId);
			}
			return Configuration.getAttachmentTitleImageDownloadURL(sCampaignBackgroundImageId);
		},

		_getBackgroundImageURL: function(sBackgroundImageURL, sSmallBackgroundImageURL) {
			var sImageURL = sBackgroundImageURL;
			if (sap.ui.Device.system.phone) {
				sImageURL = sSmallBackgroundImageURL;
			}

			if (jQuery.isNumeric(sImageURL)) {
				return Configuration.getAttachmentTitleImageDownloadURL(sImageURL);
			}
			return ("/" + sImageURL);
		}
	});

	sap.ui.ino.application.ApplicationBase.formatLogoURL = function(sDefaultLogoImageURL) {
		var sLogoImageURL = sDefaultLogoImageURL;
		if (jQuery.isNumeric(sLogoImageURL)) {
			sLogoImageURL = Configuration.getAttachmentTitleImageDownloadURL(sLogoImageURL);
		} else {
			sLogoImageURL = "/" + sLogoImageURL;
		}
		return sLogoImageURL;
	};

	sap.ui.ino.application.ApplicationBase.setWebPageTitle = function() {
		jQuery(document)[0].title = Configuration.getSystemSetting("sap.ino.config.APPLICATION_TITLE");
	};

	// Constants (have to be defined after the object definition)
	sap.ui.ino.application.ApplicationBase.MODEL_MSG = "msg";
	sap.ui.ino.application.ApplicationBase.MODEL_TEXT = "i18n";
	sap.ui.ino.application.ApplicationBase.MODEL_TEXT_MODULE = "module";
	sap.ui.ino.application.ApplicationBase.MODEL_NOTIFICATION = "notification";
	sap.ui.ino.application.ApplicationBase.MODEL_CODE = "code";
	sap.ui.ino.application.ApplicationBase.MODEL_META = "meta";
	sap.ui.ino.application.ApplicationBase.MODEL_SYSTEM_SETTINGS = "systemSettings";

	sap.ui.ino.application.ApplicationBase.RESOURCE_UITEXT = "uitexts";
	sap.ui.ino.application.ApplicationBase.RESOURCE_MESSAGE = "messages";
	sap.ui.ino.application.ApplicationBase.RESOURCE_MODULE = "moduletexts";

	sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST = "sap_hcb";
	sap.ui.ino.application.ApplicationBase.THEME_DEFAULT = "";

	sap.ui.ino.application.ApplicationBase.MAIL_ACTIVE = "active";
	sap.ui.ino.application.ApplicationBase.MAIL_INACTIVE = "incative";

	sap.ui.ino.application.ApplicationBase.TRACK = "tracking_active";
	sap.ui.ino.application.ApplicationBase.DO_NOT_TRACK = "tracking_inactive";

	var oCurrentApplication = null;

	sap.ui.ino.application.ApplicationBase.handleSessionError = function() {
		// WORKAROUND: if the session timed out and an oData call is started, currently XS returns an empty result
		// with http status 200
		// the header of this result contains information about the session timeout
		// an ajayComplete or ajaxError is NOT triggered, I guess due to the triggering element is no longer part of
		// the DOM
		// UI5 triggers a requestCompleted event with NO header information
		// => Current workaround: if any oData call returns an empty result, it is interpreted as a session timeout
		// what leads to a logout w/o remembering the current page

		var fnTimeoutHandler = function(event, xhr) {
			var sLogonPage = xhr.getResponseHeader("x-sap-login-page");
			// xhr.getResponseHeader("x-sap-origin-location") => maybe service.xsjs => use event url
			var sCurrentPage = event.currentTarget.URL;
			// if we get the logon page, the session timed out
			if (sLogonPage) {
				var sAppendUrl = "";
				if (sCurrentPage) {
					// get local url => remove host
					sCurrentPage = sCurrentPage.replace(/^(?:\/\/|[^\/]+)*\//, "/");
					sAppendUrl = "?x-sap-origin-location=" + window.encodeURIComponent(sCurrentPage);
				}
				window.location = sLogonPage + sAppendUrl;
			}
		};

		// this handles the normal html/http interaction but not odata calls
		// use ajaxComplete and ajaxError as both are not called all the time
		jQuery(document).ajaxError(fnTimeoutHandler);
		jQuery(document).ajaxComplete(fnTimeoutHandler);
	};

	sap.ui.ino.application.ApplicationBase.handleSessionError();

	sap.ui.ino.application.ApplicationBase.logout = function() {
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
						var i18n = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
						var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
						oApp.showError(i18n.getText("MSG_APPLICATION_LOGOUT_ERROR"));
					}
				});
			}
		});
	};

	sap.ui.ino.application.ApplicationBase.startApplication = function(sApplicationClassName, sComponentName, oInitSettings) {
		if (oCurrentApplication === null) {
			if (!sComponentName) {
				sComponentName = "sap.ui.ino";
			}
			sap.ui.getCore().createComponent({
				name: sComponentName
			});
			var oSettings = {
				root: "content"
			};

			jQuery.extend(oSettings, oInitSettings);
			var App = jQuery.sap.getObject(sApplicationClassName, 0);
			if (App) {
				var oUser = Configuration.getCurrentUser(!!App.getPrivilege);
				var bSetupCompleted = Configuration.setupCompleted();
				var aInconsistentPackages = Configuration.getInconsistentPackages();
				var sBootstrapErrorMsg;
				var aBootstrapErrorMsgParams = [];
				if (!oUser) {
					sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_ERROR_NO_USER";
				} else {
					if (App.getPrivilege) {
						var sPrivilege = App.getPrivilege();
						if (!Configuration.hasCurrentUserPrivilege(sPrivilege)) {
							sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_ERROR_NO_PRIVILEGE";
							aBootstrapErrorMsgParams.push(sPrivilege);

						}
					}
					if (!bSetupCompleted || bSetupCompleted !== true) {
						sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_ERROR_SETUP_INCOMPLETE";
						aBootstrapErrorMsgParams = [];
					}

					if (aInconsistentPackages && aInconsistentPackages.length > 0) {
						sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_INCONSISTENT_EXT_PACKAGES";
						aBootstrapErrorMsgParams = [aInconsistentPackages.join(",")];
					}
				}

				if (sBootstrapErrorMsg) {
					var oBundle = new sap.ui.model.resource.ResourceModel({
						// resource needs to be hard-coded as the configuration might not have been read
						bundleUrl: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/static/textBundle/" + sap.ui.ino.application.ApplicationBase.RESOURCE_UITEXT +
							".properties"
					});
					var sBootstrapErrorMsgText = oBundle.getResourceBundle().getText(sBootstrapErrorMsg, aBootstrapErrorMsgParams);

					var oBootStrapErrorView = sap.ui.view({
						viewName: "sap.ui.ino.views.common.BootstrapError",
						type: sap.ui.core.mvc.ViewType.JS,
						viewData: {
							errorMessage: sBootstrapErrorMsgText
						}
					});
					oBootStrapErrorView.placeAt(oSettings.root, "only");
					return;
				}
				WebAnalytics.start(Configuration);
				oCurrentApplication = new App(oSettings);

				// set user specific theme
				var sUserTheme = sap.ui.ino.application.Configuration.getTheme(!!App.getPrivilege);
				var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
				if (sUserTheme && sCurrentTheme !== sUserTheme) {
					oCurrentApplication.applyTheme(sUserTheme);
				}
			} else {
				jQuery.sap.log.error("Undefined type " + sApplicationClassName + " for starting the application", undefined,
					"sap.ui.ino.application.ApplicationBase");
			}

		} else {
			jQuery.sap.log.warning("Application already started", undefined, "sap.ui.ino.application.ApplicationBase");
		}
	};

	sap.ui.ino.application.ApplicationBase.getApplication = function() {
		return oCurrentApplication;
	};

})(window);