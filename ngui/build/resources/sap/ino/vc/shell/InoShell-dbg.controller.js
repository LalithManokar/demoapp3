/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
// required to set the correct library paths before using the libraries
jQuery.sap.require("sap.ino.apps.ino.Component");

sap.ui.define([
   "sap/ino/vc/commons/BaseController",
   "sap/ui/core/ComponentContainer",
   "sap/ui/core/routing/History",
   "sap/ui/unified/Menu",
   "sap/ui/core/MessageType",
   "sap/ui/Device",
   "sap/ino/commons/application/Configuration",
   "sap/ui/model/json/JSONModel",
   "sap/ui/core/mvc/ViewType",
   "sap/ui/core/Item",
   "sap/ui/core/CustomData",
   "sap/m/MessageBox",
   "sap/m/MessageToast",
   "sap/m/GroupHeaderListItem",
   "sap/ino/commons/formatters/ObjectListFormatter",
   "sap/ui/core/format/NumberFormat",
   "sap/ino/commons/models/core/ClipboardModel",
   "sap/ino/commons/formatters/BaseFormatter",
   "sap/ino/commons/models/core/CodeModel",
   "sap/ino/vc/commons/mixins/UserGroupMixin",
   "sap/ino/commons/models/object/PersonalizeSetting",
   "sap/ino/vc/commons/mixins/GlobalSearchMixin"
], function(
	Controller,
	ComponentContainer,
	History,
	Menu,
	MessageType,
	Device,
	Configuration,
	JSONModel,
	ViewType,
	Item,
	CustomData,
	MessageBox,
	MessageToast,
	GroupHeaderListItem,
	ObjectListFormatter,
	NumberFormat,
	Clipboard,
	BaseFormatter,
	CodeModel,
	UserGroupMixin,
	PersonalizeSetting,
	GlobalSearchMixin
) {
	"use strict";

	var iNotificationTimeout = 30000;

	var UserSettings = {
		Theme: {
			HCB: "sap_hcb"
		},
		Mail: {
			Active: "active",
			Inactive: "inactive"
		}
	};

	return Controller.extend("sap.ino.vc.shell.InoShell", jQuery.extend({}, UserGroupMixin, GlobalSearchMixin, {
		formatter: jQuery.extend({
			helpMenuButton: function(oSystem) {
				return oSystem.phone;
			},

			fullScreenToggle: function(oSystem) {
				// fullscreen toggling is deprecated for HTTP connections => HTTPS must be used
				return !oSystem.desktop && window.location.protocol === "https:";
			},

			displayTermsConditions: function() {
				return Configuration.isComponentActive("sap.ino.config.DISPLAY_TERMS_CONDITIONS");
			},

			termsConditions: function(sCode) {
				if (sCode === null || sCode === undefined) {
					return undefined;
				}
				var oModel = this.getView().getModel("module");
				return oModel.getProperty(sCode);
			},

			version: function() {
				return this._i18n.getResourceBundle().getText("ABOUT_VERSION_FLD", [this._oComponent.getVersion(), this._oComponent.getVersionTimestamp()]);
			},

			text: function(sText) {
				return this._i18n.getResourceBundle().getText(sText);
			},

			icon: function(sIconURL) {
				if (jQuery.isNumeric(sIconURL)) {
					sIconURL = Configuration.getAttachmentTitleImageDownloadURL(sIconURL);
				} else if (sIconURL) {
					sIconURL = "/" + sIconURL;
				} else {
					sIconURL = "sap-icon://error";
				}
				return sIconURL;
			},

			groupHeader: function(oGroup) {
				return new GroupHeaderListItem({
					title: this._i18n.getResourceBundle().getText("MENU_TIT_" + oGroup.key)
				});
			},

			visibleWithSearch: function(bSearchVisible, bPhone, bLimitedSpace) {
				return (bPhone !== undefined && !bPhone) || !bSearchVisible || (bLimitedSpace !== undefined && !bLimitedSpace);
			},

			visibleAppTitle: function(bPhone, bTitle) {
				if (bTitle.length === 0 || bTitle.match(/^\s+$/g)) {
					var emptyTitle = true;
				}
				return (bPhone !== undefined && !bPhone) && (emptyTitle === undefined || !emptyTitle);
			},

			generateMailURL: function(sMailAddress) {
				return sap.m.URLHelper.normalizeEmail(sMailAddress);
			},

			notificationTooltip: function(nCount) {
				if (nCount) {
					var oNumberFormat = NumberFormat.getIntegerInstance({
						style: "short"
					});

					var iNum = oNumberFormat.format(nCount);
					if (iNum === 0) {
						return this._i18n.getResourceBundle().getText("SHELL_EXP_NOTIFICATION_EMPTY");
					} else if (iNum === 1) {
						return this._i18n.getResourceBundle().getText("SHELL_EXP_NOTIFICATION_SINGLE");
					} else {
						return this._i18n.getResourceBundle().getText("SHELL_EXP_NOTIFICATION_COUNT", [oNumberFormat.format(nCount)]);
					}
				}

				return this._i18n.getResourceBundle().getText("SHELL_EXP_NOTIFICATION_EMPTY");
			},
			notificationCountFormatter: function(nCount) {
				if (nCount && nCount > 999) {
					return 999;
				}

				return nCount;
			},

			notificationText: function(sText) {
				// the notification item does a rudimentary check for embedded bindings that can fail for texts using brackets => remove the brackets
				return sText.split("{").join("").split("}").join("");
			},

			clipboardObjectName: function(sCode) {
				return sCode ? this._i18n.getResourceBundle().getText("CLIPBOARD_OBJECT_NAME_" + sCode) : "";
			},

			navigationItemSelected: function(sRoute, sNavigationTarget) {
				if (!sRoute || !sNavigationTarget) {
					return false;
				}
				if (sRoute === sNavigationTarget ||
					sRoute === sNavigationTarget + "variant" ||
					sRoute + "list" === sNavigationTarget) {
					return true;
				}
				//prevent double selections
				var aNavigationTargets = jQuery.grep(this.menu.Navigation, function(target) {
					return sRoute === target.TO ||
						sRoute === target.TO + "variant" ||
						sRoute + "list" === target.TO;
				});
				if (aNavigationTargets.length === 0 && sRoute.indexOf("-") > -1) {
					var aRoute = sRoute.split("-");
					if (aRoute[1] === sNavigationTarget ||
						aRoute[1] === sNavigationTarget + "variant") {
						return true;
					}
					var aSubNavigationTargets = jQuery.grep(this.menu.Navigation, function(target) {
						return aRoute[1] === target.TO ||
							aRoute[1] === target.TO + "variant";
					});
					if (aSubNavigationTargets.length === 0 &&
						sRoute.split("-")[0] + 'list' === sNavigationTarget) {
						return true;
					}
				}
				return false;
			},

			navigationItemVisible: function(bBackOfficeAccess, bFrontOfficeEnabled, bMobileEnabled, bPhone, sNavigationTarget) {
				var bVisible = (!bPhone || (bPhone && bMobileEnabled)) && (bFrontOfficeEnabled || (!bFrontOfficeEnabled && bBackOfficeAccess));
				if (sNavigationTarget === "evalreqlist") {
					return bVisible && Configuration.getSystemSetting("sap.ino.config.EVAL_REQ_ACTIVE") === "1";
				}
				if (sNavigationTarget === "rewardlist") {
					return bVisible && (this.getModel("user").getProperty("/privileges/sap.ino.ui::campaign_manager") || this.getModel("user").getProperty(
							"/privileges/sap.ino.xs.rest.admin.application::execute")) && Configuration.getSystemSetting("sap.ino.config.REWARD_ACTIVE") ===
						"1";
				}
				if (sNavigationTarget === "expertfinder") {
					return bVisible && (this.getView().getModel("config").oData["sap.ino.config.EXPERT_FINDER_ACTIVE"] === "1");
				}
				if (sNavigationTarget === "peoplelist") {
					return bVisible && (this.getView().getModel("config").oData["sap.ino.config.PEOPLE_MENU_FOR_ALL_ACTIVE"] === "1");
				}
				if (sNavigationTarget === "leaderboard") {
					return bVisible && !!this.getView().getModel("config").oData.ENABLE_GAMIFICATION && !!this.getView().getModel("config").oData.ENABLE_LEADERBOARD;
				}
				return bVisible;
			},

			historyEnable: function(iCount) {
				return Number(iCount) >= 1;
			},

			historyTooltip: function(aHistory, iCount) {
				if (aHistory.length) {
					return this.getText("PAGE_TIT_" + (!aHistory[0].title ? "HOME" : aHistory[0].title.toUpperCase()));
				} else {
					return "";
				}
			},

			historyMenu: function(sText) {
				return this.getText("PAGE_TIT_" + (!sText ? "HOME" : sText.toUpperCase()));
			},

			historyMenuDetail: function(sText, sHash) {
				var aDetailHashList = this.getOwnerComponent().getModel("historyDetail").getProperty("/HashList");
				var detailTitle = null;
				aDetailHashList.forEach(function(item, index) {
					if (sHash === item.hash) {
						detailTitle = item.detailTitle;
					}
				});
				return detailTitle ? detailTitle : this.getText("PAGE_TIT_" + (!sText ? "HOME" : sText.toUpperCase()));
			},

			formatChangeLogValue: function(sStr, sInt, sDate) {
				if (sDate) {
					return BaseFormatter.toDate(sDate);
				} else if (sInt) {
					return sInt;
				} else if (sStr) {
					return sStr;
				} else {
					return "";
				}
			},

			formatIdentityCode: function(sCode) {
				return CodeModel.getFormatter("sap.ino.xs.object.iam.IdentityLogSetting.Root")(sCode);
			}

		}, Controller.prototype.formatter),

		objectListFormatter: ObjectListFormatter, // used in TemplatePickerDialog

		menu: {
			"Navigation": [{
					"ICON": "sap-icon://InoIcons/idea-add",
					"TITLE": "MENU_MIT_CREATE_IDEA",
					"TO": "idea-create",
					"GROUP": "ACTION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://home",
					"TITLE": "MENU_MIT_HOME",
					"TO": "home",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://InoIcons/campaign",
					"TITLE": "MENU_MIT_CAMPAIGNS",
					"TO": "campaignlist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://lightbulb",
					"TITLE": "MENU_MIT_IDEAS",
					"TO": "idealist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://person-placeholder",
					"TITLE": "MENU_MIT_IDENTITIES",
					"TO": "peoplelist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://InoIcons/wall",
					"TITLE": "MENU_MIT_WALLS",
					"TO": "walllist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://tags",
					"TITLE": "MENU_MIT_TAGS",
					"TO": "taglist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://feed",
					"TITLE": "MENU_MIT_FEEDS",
					"TO": "feedlist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": true
                }, {
					"ICON": "sap-icon://employee-lookup",
					"TITLE": "MENU_MIT_EXPERT_FINDER",
					"TO": "expertfinder",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": false,
					"MOBILE_ENABLED": false
                }, {
					"ICON": "sap-icon://bar-chart",
					"TITLE": "MENU_MIT_REPORTS",
					"TO": "reportlist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": false,
					"MOBILE_ENABLED": false
                }, {
					"ICON": "sap-icon://clinical-tast-tracker",
					"TITLE": "MENU_MIT_EVALUATION_REQUEST",
					"TO": "evalreqlist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": false
                }, {
					"ICON": "sap-icon://competitor",
					"TITLE": "MENU_MIT_REWARDS_MANAGEMENT",
					"TO": "rewardlist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": false,
					"MOBILE_ENABLED": false
                }, {
					"ICON": "sap-icon://InoIcons/leaderboard_fire",
					"TITLE": "MENU_MIT_GAMEFICATION_LEADERBOARD",
					"TO": "leaderboard",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": false
                }
                /**{
					"ICON": "sap-icon://activity-individual",
					"TITLE": "MENU_MIT_NOTICE_UPDATE",
					"TO": "noticelist",
					"GROUP": "NAVIGATION",
					"FRONTOFFICE_ENABLED": true,
					"MOBILE_ENABLED": false
                }**/
            ]
		},
		view: {
			"Picker": {
				"VARIANT": "templates"
			},
			"Search": {
				"LIMITED_SPACE": Device.orientation.portrait
			}
		},

		list: {
			"Variants": {
				"Values": [{
					"TEXT": "WALL_LIST_MIT_MY_TEMPLATES",
					"ACTION": "templates",
					"FILTER": "myWallTemplates"
                }, {
					"TEXT": "WALL_LIST_MIT_SHARED_TEMPLATES",
					"ACTION": "sharedtemplates",
					"FILTER": "sharedWallTemplates"
                }]
			}
		},

		requestQueue: [],

		onInit: function() {
			Controller.prototype.onInit.apply(this, arguments);
			var oController = this;
			var oUI5Configuration = sap.ui.getCore().getConfiguration();

			// register for change event @ invalidation manager
			//this._initApplicationObjectChangeListeners();

			var oUser = Configuration.getCurrentUser();
			if (oUser) {
				oUI5Configuration.setLanguage(oUser.LOCALE);
			}
			if (!oUser) {
				return;
			}

			// Register styles
			jQuery.each(Configuration.getStylePaths() || [], function(iIndex, sStylePath) {
				jQuery.sap.includeStyleSheet(sStylePath);
			});

			// Register component
			var sComponentName = Configuration.getComponentName();
			if (("sap.ino.ngui." + sComponentName) != gSAPInoAppName) {
				jQuery.sap.registerModulePath(sComponentName, "/" + sComponentName.replace(/\./g, "/"));
			}
			var oComponent = new ComponentContainer({
				id: this.createId("componentcontainer"),
				name: sComponentName,
				height: "100%",
				width: "100%"
			});
			var oToolPage = this.byId("toolPage");
			oToolPage.addAggregation("mainContents", oComponent);

			// var sBootstrapErrorMsg;
			//  if (!oUser) {
			//         sBootstrapErrorMsg = "GENERAL_APPLICATION_TIT_ERROR_NO_USER";
			//          this.byId("componentcontainer").getComponentInstance().navigateTo("welcomepage",sBootstrapErrorMsg);
			//       }
			// TODO: monkey patch update messagebox resource bundle => https://support.wdf.sap.corp/sap/support/message/1670267929
			MessageBox._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			// set user specific theme
			// 			var sUserTheme = Configuration.getTheme();
			// 			var sCurrentTheme = oUI5Configuration.getTheme();
			// 			if (sUserTheme && sCurrentTheme !== sUserTheme) {
			// 				sap.ui.getCore().applyTheme(sUserTheme);
			// 			}

			// set view model
			this.setViewData(this.view);

			if (oUser) {
				// read user model
				var oUserModel = new JSONModel({
					"USER_ID": oUser.USER_ID,
					"NAME": oUser.NAME,
					"IMAGE_ID": oUser.IDENTITY_IMAGE_ID
				});

				oUserModel.setDefaultBindingMode("TwoWay");
				this.getView().setModel(oUserModel, "userData");
			}

			//attach sideExpanded event in mobile and tablet
			if (!Device.system.desktop && (Device.system.phone || Device.system.tablet)) {
				oToolPage.mAggregations.mainContents[0].attachBrowserEvent("click", function() {
					if (oToolPage.getSideExpanded() && !Clipboard.sharedInstance().clipboardVisible) {
						oToolPage.setSideExpanded(false);
					}
				});
			}

			Device.orientation.attachHandler(this._onOrientationChange, this);

			var that = this;
			Clipboard.sharedInstance().attachEvent("objectAdded", function() {
				that.toggleClipboard(true);
			});

			this.getPersonalizeSetting();

		},

		updateModel: function() {
			var a = 1;
		},

		onExit: function() {
			Device.orientation.detachHandler(this._onOrientationChange, this);
		},

		onBeforeRendering: function() {
			var that = this;
			// Check open group for community user .
			var openGroup = Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1;
			that.setModel(new JSONModel(openGroup), 'identityData>/open_group');
			if (openGroup) {
				if (!this.requestQueue.length) {
					this.requestQueue.push(this.getMemberGroups());
					this.requestQueue[0].done(function(data) {
						that.setModel(new JSONModel(data), 'identityData>/groups');
						if (!data || !data.length) {
							that.openUserGroupDialog();
						}
					});
				}
			}
		},

		onAfterRendering: function() {

			var sUserTheme = Configuration.getTheme();
			var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
			if (sUserTheme && sCurrentTheme !== sUserTheme) {
				sap.ui.getCore().applyTheme(sUserTheme);
			}

			var oUser = Configuration.getCurrentUser();
			var bSetupCompleted = Configuration.setupCompleted();
			if (!oUser || !bSetupCompleted) {
				var oBootStrapErrorView = sap.ui.view({
					viewName: "sap.ino.vc.commons.BootStrapError",
					type: sap.ui.core.mvc.ViewType.XML
				});
				oBootStrapErrorView.placeAt("content", "only");
				return;
			}
			var oView = this.getView();
			var oContainer = this.byId("componentcontainer");

			this._oShell = this.byId("mainShell");

			// remember the component of the underlying app
			this._oComponent = oContainer.getComponentInstance();

			// set the language of the page
			var oTextModel = this._oComponent.getModel("i18n");
			this.updatePageLanguage(oTextModel.getResourceBundle().sLocale);

			// remove scrollbars            
			var sStyle = "overflow-y: hidden;" + oContainer.$().attr("style");
			oContainer.$().attr("style", sStyle);

			// get the models from the component
			this._i18n = this._oComponent.getModel("i18n");
			oView.setModel(this._i18n, "i18n");

			var oDeviceModel = this._oComponent.getModel("device");
			oView.setModel(oDeviceModel, "device");

			var oUserModel = this._oComponent.getModel("user");
			oView.setModel(oUserModel, "user");

			var oNavigationModel = this._oComponent.getModel("navigation");
			oView.setModel(oNavigationModel, "navigation");

			var oSystemSettingsModel = this._oComponent.getModel("config");
			oView.setModel(oSystemSettingsModel, "config");

			var oModuleModel = this._oComponent.getModel("module");
			oView.setModel(oModuleModel, "module");

			var oCodeModel = this._oComponent.getModel("code");
			oView.setModel(oCodeModel, "code");

			var oDataModel = this._oComponent.getModel("data");
			oView.setModel(oDataModel, "data");

			var oNotificationModel = this._oComponent.getModel("notifications");
			oView.setModel(oNotificationModel, "notifications");

			var oSearchModel = this._oComponent.getModel("search");
			oView.setModel(oSearchModel, "search");

			var oClipboardModel = this._oComponent.getModel("clipboard");
			oView.setModel(oClipboardModel, "clipboard");

			// init navigation (we need the text model to do this)
			var oNavigationModel = new JSONModel(this.menu);
			this._oSideNavigation = this.byId("sideNavigation");
			this._oSideNavigation.setModel(oNavigationModel, "navigationList");

			var oHistoryModel = this._oComponent.getModel("history");
			oView.setModel(oHistoryModel, "history");

			// ATTENTION: we manipulate the DOM of the SplitContainer here, but
			// for accessibility reasons make sure the split areas are always placed in the DOM the way they are displayed
			jQuery(".sapInoInnoMgmtShell #main--split-canvas").before(jQuery(".sapInoInnoMgmtShell #main--split-pane"));

			// set initial focus to nav menu
			this.byId("openMenu").focus();

			this.setCategroyData();

			this.listenRouteMatch();
		},

		updatePageLanguage: function(sLocale) {
			var $Html = jQuery("html");
			if (sLocale && !$Html.attr("lang")) {
				sLocale = sLocale.replace("_", "-"); // attribute requires "-" not "_"
				$Html.attr("lang", sLocale);
			}
		},

		_onOrientationChange: function() {
			var oViewModel = this.getModel("view");
			oViewModel.setProperty("/Search/LIMITED_SPACE", Device.orientation.portrait);
		},

		onToggleFullScreen: function() {
			var doc = window.document;
			var docEl = doc.documentElement;

			var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
			var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

			if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
				requestFullScreen.call(docEl);
			} else {
				cancelFullScreen.call(doc);
			}
		},

		onShowNotification: function(oEvent) {
			if (!this._oNotificationPopover) {
				this._oNotificationPopover = this.createFragment("sap.ino.vc.shell.fragments.Notifications");
				this.getView().addDependent(this._oNotificationPopover);

			}

			//attach close action and replace close icon
			if (!this._oNotificationPopover.isOpen()) {
				this.getModel("notifications").updateNotifications();
				//   var nItems = sap.ui.getCore().byId("nlist").getItems();

				//     for( var i=0; i< nItems.length; i++){
				//       //nItems[i].attachClose(this.onRemoveNotification);
				//       // nItems[i]._closeButton.setIcon("sap-icon://sys-cancel");
				//     }
				this._oNotificationPopover.openBy(this.byId("notification"));

			} else {
				this.closeNotifications();
			}
		},

		closeNotifications: function() {
			if (this._oNotificationPopover && this._oNotificationPopover.isOpen()) {
				this._oNotificationPopover.close();
			}
		},

		onRemoveNotification: function(oEvent) {
			var oButton = oEvent.getSource();
			var oItem = oButton.getParent().getParent();
			var iNotificationId = oItem.data("notification_id");
			var oNotifications = this.getModel("notifications");
			oNotifications.markNotificationAsRead(iNotificationId).done(function() {
				oNotifications.updateNotifications();
			});
		},

		onRemoveAllNotifications: function(oEvent) {
			var oButton = oEvent.getSource();
			var iNotificationId = oButton.data("latest_notification_id");
			if (iNotificationId > 0) {
				var oNotifications = this.getModel("notifications");
				oNotifications.markNotificationsAsRead(iNotificationId);
			}
			this.closeNotifications();
		},

		onNotificationNavigate: function(oEvent) {
			var oItem = oEvent.getSource();
			var sType = oItem.data("object_type_code");
			var sId = oItem.data("object_id");
			var sCode = oItem.data("notification_code");

			if (Device.system.phone) {
				this._oNotificationPopover.close();
			}

			if (sCode === "IDEA_DELETED") {
				return null;
			}

			switch (sType) {
				case "IDEA":
					if (sCode === "COMMENT_CREATED" || sCode === "COMMENT_DELETED") {
						this.navigateTo("idea-display", {
							id: sId,
							query: {
								section: "sectionComments"
							}
						});
					} else if (sCode === "EXPERT_ASSIGNED" || sCode === "EXPERT_UNASSIGNED") {
						this.navigateTo("idea-display", {
							id: sId,
							query: {
								section: "sectionExperts"
							}
						});

					} else if (sCode === "STATUS_ACTION_sap.ino.config.EVAL_SUBMIT" || sCode === "STATUS_ACTION_sap.ino.config.EVAL_PUB_SUBMITTER" ||
						sCode === "STATUS_ACTION_sap.ino.config.EVAL_PUB_COMMUNITY") {
						this.navigateTo("idea-display", {
							id: sId,
							query: {
								section: "sectionEvaluations"
							}
						});

					} else {
						this.navigateTo("idea-display", {
							id: sId
						});
					}
					break;
				case "CAMPAIGN":

					this.navigateTo("campaign", {
						id: sId
					});
					break;
				case "REGISTRATION_REQUEST":
					if (sCode === 'CAMP_REGISTER_CREATED') {
						this.navigateTo("registerapprovallist");
					} else {
						this.navigateTo("campaign", {
							id: sId
						});
					}
					break;
				case "EVAL_REQUEST_ITEM":
					this.navigateTo("evaluationrequest-item", {
						id: sId
					});
					break;
				case "EVAL_REQUEST":
					this.navigateTo("evaluationrequest-display", {
						id: sId
					});
					break;
				default:
					break;

			}

			this.closeNotifications();
		},

		showMenu: function(bShow) {

			if (this._oSplitContainer) {
				if (Device.system.phone) {
					this.byId("openMenu").setSelected(bShow);
					this.byId("menutoolbar").setProperty("visible", false);
					this._oSplitContainer.setSecondaryContentSize("100%");
				} else {
					this._oSplitContainer.setSecondaryContentSize("250px");
				}
				this._oSplitContainer.setShowSecondaryContent(bShow);
			}
		},

		onShowMenu: function(oEvent) {
			if (Clipboard.sharedInstance().clipboardVisible) {
				this.toggleClipboard(false);
				if (!this._oToolPage) {
					this._oToolPage = this.byId("toolPage");
				}
				this._oToolPage.setSideExpanded(!this._oToolPage.getSideExpanded());
			} else {
				if (!this._oToolPage) {
					this._oToolPage = this.byId("toolPage");
				}

				this._oToolPage.setSideExpanded(!this._oToolPage.getSideExpanded());
				if (Device.system.phone) {
					this._oToolPage.getAggregation('sideContent').setExpanded(this._oToolPage.getSideExpanded());
				}
				oEvent.getSource().setTooltip(this._oToolPage.getSideExpanded() ? this._i18n.getResourceBundle().getText("SHELL_EXP_MENU_COLLAPSE") :
					this._i18n.getResourceBundle().getText("SHELL_EXP_MENU_EXPAND"));

				// this._oToolPage.getSideContent().getItem().setExpanded(true);
				// jQuery.each(this._oToolPage.getSideContent().getItem().getItems(), function(iIndex, oItem){
				//     oItem.rerender();
				// });
			}
		},

		onLogoIcon: function(oEvent) {
			this._oComponent.navigateTo("home");
		},

		onNavigate: function(oEvent) {
			var oItem = oEvent.getSource();
			var sNav = oItem.data("TO");

			if (sNav && sNav !== "") {
				var sCurrentNav = this.getModel("navigation").getProperty("/Route");
				if (sCurrentNav !== sNav) {
					this.getModel("navigation").setProperty("/Route", sNav);

					var fnOnNav = oItem.getBindingContext("navigationList").getObject().ON_NAV;
					if (fnOnNav) {
						fnOnNav(this, oItem, sNav);
					} else {
						this._oComponent.navigateTo(sNav);
					}
				}
			} else {
				// Navigation failed, let component handle this
				this._oComponent.showMessage(MessageType.Error, this._i18n.getResourceBundle().getText("NAVIGATION_EXP_UNKNOWN_TARGET"));
			}

			if (Device.system.phone) {
				var oToolPage = this.byId("toolPage");
				oToolPage.setSideExpanded(false);
			}

			var bMenuOpen = !!oItem.getBindingContext("navigationList").getObject().KEEP_MENU_OPEN;
			this.showMenu(bMenuOpen);
		},

		onNavFooterPressed: function(oEvent) {
			var oItem = oEvent.getSource();

			switch (oItem.data("ITEM")) {
				case "HELP_CLIPBOARD":
					this.openHelpScreen("HELP_EXP_CLIPBOARD");
					break;
				case "HELP":
					this.openHelpScreen();
					break;
				case "CLIPBOARD":
					this.toggleClipboard(true);
					break;
				default:
					break;
			}
		},

		onLogout: function() {
			this._oComponent.logout();
		},

		onUserOpen: function(oEvent) {
			var that = this;
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._oUserActionSheet) {
				this._oUserActionSheet = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.UserAction", this);
				this._oUserActionSheet.addStyleClass("sapInoMobileCancel");
				this._oUserActionSheet.attachAfterClose(function() {
					if (!that._getUserDataDialog().isOpen() && !that._getSettingsDialog().isOpen() &&
						!that._getTermsDialog().isOpen() && !that._getAboutDialog().isOpen()) {
						oButton.focus();
					}
				}, this);

				this.getView().addDependent(this._oUserActionSheet);
			}

			this._oUserActionSheet.openBy(oButton);
		},

		onBackBtnPress: function() {
			//this._oComponent.getRouter().onNavBack();
			var oHistoryModel = this.getModel("history");
			var aHashList = oHistoryModel.getProperty("/HashList");
			var oLastHash = aHashList[0];
			var oCurrentHash = oLastHash;
			var sUrl = location.href.split("#")[0] + "#/" + oLastHash.hash;
			aHashList.shift();
			oHistoryModel.setProperty("/CurrentHash", oCurrentHash);
			oHistoryModel.setProperty("/HashList", aHashList);
			oHistoryModel.setProperty("/Count", aHashList.length);
			this._oComponent.navigateToByURL(sUrl);
		},

		onBackMenuPress: function(oEvent) {
			var oSource = oEvent.getSource();
			var sHash = oSource.getBindingContext("history").getProperty("hash");
			var sUrl = location.href.split("#")[0] + "#/" + sHash;
			var oHistoryModel = this.getModel("history");
			var aHashList = oHistoryModel.getProperty("/HashList");
			var aIndex = oSource.getBindingContext("history").sPath.split("/");
			var iIndex = Number(aIndex[aIndex.length - 1]);
			var oCurrentHash = aHashList[iIndex];
			aHashList = aHashList.slice(iIndex + 1);
			oHistoryModel.setProperty("/CurrentHash", oCurrentHash);
			oHistoryModel.setProperty("/HashList", aHashList);
			oHistoryModel.setProperty("/Count", aHashList.length);
			this._oComponent.navigateToByURL(sUrl);
		},

		onBackMenuOpen: function(oEvent) {
			var oButtonBegin = oEvent.getSource();
			var oButtonEnd = $(oButtonBegin.getDomRef()).next("a");

			//in order to improve performance of history menu
			if (this.getOwnerComponent().getModel("historyDetail").getProperty("/HashList").length > 10000) {
				var aHistoryDetailModel = this.getOwnerComponent().getModel("historyDetail").getProperty("/HashList");
				var aUsedHistoricList = jQuery.extend([], this.getModel("history").getProperty("/HashList"));
				aUsedHistoricList.push(this.getModel("history").getProperty("/CurrentHash"));
				var aNewDetailLit = [];
				aHistoryDetailModel.forEach(function(item, index) {
					if (aUsedHistoricList.find(function(detailItem, index) {
						return detailItem.hash === item.hash;
					})) {
						aNewDetailLit.push(item);
					}
				});
				this.getOwnerComponent().getModel("historyDetail").setProperty("/HashList", aNewDetailLit);
			}

			// create action sheet only once
			if (!this._oBackActionSheet) {
				this._oBackActionSheet = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.BackAction", this);
				this._oBackActionSheet.addStyleClass("sapInoMobileCancel sapUiBackActionSheet");
				this.getView().addDependent(this._oBackActionSheet);
			}

			this._oBackActionSheet.attachAfterClose(function() {
				oButtonEnd.focus();
				oButtonBegin._toggleIcon(oButtonEnd, "sap-icon://slim-arrow-down");
			}, this);

			this._oBackActionSheet.openBy(oButtonEnd);
		},

		_getUserDataDialog: function() {
			var that = this;

			if (!this._oUserDataDialog) {
				this._oUserDataDialog = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.UserDataDialog", this);
				this.getView().addDependent(this._oUserDataDialog);

				if (!Device.system.phone) {
					this._oUserDataDialog.getContent()[0].addStyleClass("sapUiSmallMargin sapInoUserDataDialog");
				}

				var iId = that._oComponent.getCurrentUserId();
				that._oIdentityModel = new JSONModel();
				if (Configuration.getUserProfileByTextURL(iId)) {
					that._oIdentityModel.loadData(Configuration.getUserProfileByTextURL(iId), {
						"USER_ID": iId
					}, true, "GET");
					that._oIdentityModel.attachRequestCompleted(null, function() {
						var indentityData = that._oIdentityModel.getData();
						indentityData['open_group'] = Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1;
						that._oIdentityModel.setData(indentityData);
						that._oUserDataDialog.setModel(that._oIdentityModel, "identityData");
						if (sap.ui.getCore().byId("identityLogList")) {
							sap.ui.getCore().byId("identityLogList").bindItems({
								path: "data>/Identity(" + iId + ")/IdentityLog",
								sorter: new sap.ui.model.Sorter("CHANGED_AT", true),
								template: this.getFragment("sap.ino.vc.iam.fragments.IdentityLogTemplate")
							});
						}
					}, that);
				}

				this._oUserDataDialog.attachAfterClose(function() {
					that._oShell.getUser().focus();
				});
			}
			return this._oUserDataDialog;
		},

		onUserData: function() {
			var that = this;
			var oDialog = that._getUserDataDialog();
			jQuery.sap.delayedCall(0, this, function() {
				oDialog.open();
				if (this.byId("changeHistoryLog")) {
					this.byId("changeHistoryLog").bindItems({
						path: "data>/Identity(" + that._oComponent.getCurrentUserId() + ")/IdentityLog/Results"
					});
				}
				this.getMemberGroups().done(function(data) {
					that.setModel(new JSONModel(data), 'identityData>/groups');
				});
			});
		},

		onUserDataClose: function() {
			var dialog = this._getUserDataDialog();
			dialog.close();
		},

		openHelpPressed: function() {
			this.openHelpScreen();
		},

		openHelpScreen: function(sTextId) {
			this._oComponent.getRootController().openHelpScreen(sTextId);
		},

		toggleClipboard: function(bShowClipboard) {
			var oSideNavigation = this.byId("sideNavigation");
			var oToolPage = this.byId("toolPage");

			if (!this._oClipboardFragment) {
				this._oNavigationFragment = oSideNavigation.getItem();
				this._oNavigationFooterFragment = oSideNavigation.getFixedItem();
				this._oClipboardFragment = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.Clipboard", this);
				this._oClipboardFooterFragment = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.ClipboardFooter", this);
			}

			if (bShowClipboard) {
				oSideNavigation.setItem(this._oClipboardFragment);
				oSideNavigation.setFixedItem(this._oClipboardFooterFragment);

				if (!oToolPage.getSideExpanded()) {
					oToolPage.setSideExpanded(true);
				}

				Clipboard.sharedInstance().clipboardOpened();
			} else {
				oSideNavigation.setItem(this._oNavigationFragment);
				oSideNavigation.setFixedItem(this._oNavigationFooterFragment);

				if (oToolPage.getSideExpanded()) {
					oToolPage.setSideExpanded(false);
				}

				Clipboard.sharedInstance().clipboardClosed();
			}
		},

		onCloseClipboard: function() {
			var oToolPage = this.byId("toolPage");
			oToolPage.setSideExpanded(false);

			this.toggleClipboard(false);
		},

		onRemoveAllClipboardObjects: function() {
			Clipboard.sharedInstance().remove();
		},

		onRemoveClipboardObject: function(oEvent) {
			var oSource = oEvent.getSource();

			var sObjectName = oSource.data("OBJECT_NAME");
			var vKey = oSource.data("OBJECT_KEY");

			var oApplicationObject = Clipboard.loadObject(sObjectName);

			Clipboard.sharedInstance().remove(oApplicationObject, vKey);
		},

		onOpenClipboardObject: function(oEvent) {
			var oSource = oEvent.getSource();
			var sObjectName = oSource.data("OBJECT_NAME");
			var vKey = oSource.data("OBJECT_KEY");
			switch (sObjectName) {
				case "sap.ino.commons.models.object.Idea":
					this.navigateTo("idea-display", {
						id: vKey
					});
					break;

				case "sap.ino.commons.models.object.User":
					if (!this.oIdentityCardView || this.oIdentityCardView.getController() === null) {
						this.oIdentityCardView = sap.ui.xmlview({
							viewName: "sap.ino.vc.iam.IdentityCard"
						});
						oSource.addDependent(this.oIdentityCardView);
					}

					this.oIdentityCardView.getController().open(oSource, vKey);
					break;
				default:
					break;
			}

		},

		_getSettingsDialog: function() {
			var that = this;

			if (!this._oSettingsDialog) {

				this._oSettingsController = sap.ui.controller("sap.ino.vc.shell.Settings");
				var oUserDataModel = this.getView() && this.getView().getModel("userData");
				if (oUserDataModel && this._oSettingsController.setUserDataModel) {
					this._oSettingsController.setUserDataModel(oUserDataModel);
				}
				this._oSettingsView = sap.ui.view({
					type: ViewType.XML,
					viewName: "sap.ino.vc.shell.Settings",
					controller: this._oSettingsController
				});

				this._oSettingsDialog = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.SettingsDialog", this);
				this.getView().addDependent(this._oSettingsDialog);

				this._oSettingsDialog.addContent(this._oSettingsView);

				this._oSettingsDialog.attachAfterClose(function() {
					that._oShell.getUser().focus();
				});
			}
			return this._oSettingsDialog;
		},

		onSettings: function() {
			this._getSettingsDialog().open();
		},

		_cropImage: function(oImageCroppingCtrl) {
			var that = this;
			var oDeferred = jQuery.Deferred();
			var oFile = oImageCroppingCtrl.crop();
			if (oFile) {
				jQuery.sap.require("sap.ino.commons.models.object.Attachment");
				var Attachment = sap.ino.commons.models.object.Attachment;
				Attachment.uploadFile(oFile).done(function(oResponse) {
					var oObject = that._oSettingsController.getObjectModel();
					oObject.setUserImage({
						"ATTACHMENT_ID": oResponse.attachmentId,
						"FILE_NAME": oResponse.fileName,
						"MEDIA_TYPE": oResponse.mediaType
					});
					oDeferred.resolve({
						messages: [{
							"TYPE": "I",
							"MESSAGE": "SETTINGS_MSG_USER_IMAGE_CROP",
							"MESSAGE_TEXT": that.getText("SETTINGS_MSG_USER_IMAGE_CROP"),
							"REF_FIELD": ""
                        }]
					});
				}).fail(function() {
					MessageToast.show(that.getText("SETTINGS_MSG_USER_IMAGE_CROP_FAILED"));
					oDeferred.reject();
				});
			} else {
				oDeferred.resolve();
			}
			return oDeferred.promise();
		},

		_openRestartDialog: function() {
			var sMessage = this.getText("SETTINGS_RESTART_MESSAGE");
			var sTitle = this.getText("SETTINGS_RESTART_TITLE");
			var fnRestart = function(oAction) {
				if (oAction === MessageBox.Action.YES) {
					location.reload();
				}
			};
			MessageBox.confirm(sMessage, {
				icon: MessageBox.Icon.ERROR,
				title: sTitle,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: fnRestart,
				styleClass: "sapUiSizeCompact"
			});
		},

		onSettingsOk: function() {
		    throw new Error("obsolete method.");
			var that = this;
			var _saveSettings = function() {
				//sap.ui.ino.controls.BusyIndicator.show(0);
				var oView = that._oSettingsView;
				var oObjectModel = that._oSettingsController.getObjectModel();
				var oLocale = oView.byId("settingLOCALE");
				var oNotificationMail = oView.byId("settingMAIL");
				var oHCB = oView.byId("settingHCB");
				var sHCBvalue = oHCB.getSelected() ? UserSettings.Theme.HCB : "";

				that._sHCBPropOLD = oObjectModel._oBeforeData.Settings.THEME; //oObjectModel.getProperty("/Settings/THEME");
				that._sHCBPropOLD = (that._sHCBPropOLD === null) ? "" : that._sHCBPropOLD;
				that._sLocalePropOLD = oObjectModel._oBeforeData.Settings.LOCALE;
				that._sLocalePropOLD = (that._sLocalePropOLD === null) ? "" : that._sLocalePropOLD;

				var oRequest = oObjectModel.updateUserSettings([{
					SECTION: "locale",
					KEY: "locale",
					VALUE: oLocale.getSelectedKey()
                }, {
					SECTION: "notification",
					KEY: "mail",
					VALUE: oNotificationMail && oNotificationMail.getSelected() ? UserSettings.Mail.Active : UserSettings.Mail.Inactive
                }, {
					SECTION: "ui",
					KEY: "theme",
					VALUE: sHCBvalue
                }]);

				oObjectModel.modify(); // update image
				oRequest.always(function() {
					var sHCBPropNEW = oObjectModel.getProperty("/Settings/THEME");
					sHCBPropNEW = (sHCBPropNEW === null) ? "" : sHCBPropNEW;

					var sLocalePropNEW = oObjectModel.getProperty("/Settings/LOCALE");
					sLocalePropNEW = (sLocalePropNEW === null) ? "" : sLocalePropNEW;

					var bRestart = (sLocalePropNEW !== that._sLocalePropOLD) || (sHCBPropNEW !== that._sHCBPropOLD);
					if (bRestart) {
						that._openRestartDialog();
					}
				});

				oRequest.done(function() {
					Configuration.refreshBackendConfiguration();
				});
			};

			var oImageCropping = this._oSettingsView.byId("imageSettingCropping");
			this._cropImage(oImageCropping).done(_saveSettings);
		},

		onSettingsCancel: function() {
			this._getSettingsDialog().close();
		},

		_getTermsDialog: function() {
			var that = this;

			if (!this._oTermsDialog) {
				this._oTermsDialog = this.getTermsDialog(this);
				Configuration.getUserModel().setProperty("/data/TERMACTION", false);
				Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", 1);

				this._oTermsDialog.attachAfterClose(function() {
					that._oShell.getUser().focus();
				});
			}
			return this._oTermsDialog;
		},

		onTermsConditions: function() {
			this._getTermsDialog().open();
		},

		_getAboutDialog: function() {
			var that = this;

			if (!this._oAboutDialog) {
				this._oAboutDialog = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.AboutDialog", this);
				this.getView().addDependent(this._oAboutDialog);

				this._oAboutDialog.attachAfterClose(function() {
					that._oShell.getUser().focus();
				});
			}
			return this._oAboutDialog;
		},

		onAbout: function() {
			this._getAboutDialog().open();
		},

		onAboutClose: function() {
			this._getAboutDialog().close();
		},

		selectGroupTab: function(event) {
			var self = this;
			var param = event.getParameters();
			if (param.selectedKey === 'userDataGroupPage') {
				var groupRequire = this._bindUserGroupModel();
				var table = param.selectedItem.getContent()[0];
				table.getBinding('rows').filter([]);
				groupRequire.attachRequestCompleted(function() {
					self.reBindSelectedData(table);
				});
			}
		},

		_getUserGroupDialog: function() {
			if (!this._userGroupDialog) {
				this._userGroupDialog = sap.ui.xmlfragment('sap.ino.vc.shell.fragments.UserGroupDialog', this);
				this._bindUserGroupModel(this._userGroupDialog);
				this.getView().addDependent(this._userGroupDialog);
			}
			return this._userGroupDialog;
		},

		openUserGroupDialog: function() {
			var dialog = this._getUserGroupDialog();

			return dialog.open();
		},

		onSubmitSelectedGroups: function() {
			var self = this;
			var submited = this.putGroupSelected(this._getUserGroupDialog().getContent()[0], true);
			if (submited) {
				submited.done(function() {
					MessageToast.show(self.getText('USER_GROUP_SELECT_SUCCESS'));
					self._getUserGroupDialog().close();
				});
			}
		},

		onPersonalize: function() {
			var self = this;
			var settingData = Configuration.getPersonalize();

			self.getView().setModel(new JSONModel(settingData), 'PERSONALIZE');

			return this._getPersonalizeDialog().open();
		},

		closePersonalize: function() {
			return this._getPersonalizeDialog().close();
		},

		_getPersonalizeDialog: function() {
			if (!this._personalizeDialog) {
				this._personalizeDialog = sap.ui.xmlfragment('sap.ino.vc.shell.fragments.Personalize', this);
				this.getView().addDependent(this._personalizeDialog);
			}
			return this._personalizeDialog;
		},

		getPersonalizeSetting: function() {
			var defaultData = PersonalizeSetting.defaultPesonalize;
			// 			PersonalizeSetting.getSettings().done(function(data) {
			// 				var settingData = $.extend(defaultData, data.RESULT || {});
			// 				Configuration.setPersonalize(settingData);
			// 			});
			return $.extend(defaultData, Configuration.getPersonalize());
		},

		personalizeSave: function() {
			var self = this;
			var personalizeModel = self.getView().getModel('PERSONALIZE');
			var personalizeData = personalizeModel.getData();
			PersonalizeSetting.updateSettings({
				personalize: personalizeData
			}).done(function() {
				MessageToast.show(self.getText("PERSONALIZE_CHANGE_SUCCESS"));
				self.getView().setModel(new JSONModel(personalizeData), 'PERSONALIZE');
				self._getPersonalizeDialog().close();
			});
		},

		onPersonalSetting: function() {
			this.navigateTo('mySetting');
		},

		formatterLatestNotificationId: function(aNotifications) {
			if (aNotifications && aNotifications.length > 0) {
				return aNotifications.sort(function(oPre, oNext) {
					return oNext.ID - oPre.ID;
				})[0].ID;
			}
		}
	}));
});