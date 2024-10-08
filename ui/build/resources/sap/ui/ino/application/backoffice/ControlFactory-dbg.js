/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.application.backoffice.ControlFactory");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.extensions.sap.ui.model.odata.ODataTreeBinding");
	jQuery.sap.require("sap.ui.ino.extensions.sap.ui.ux3.Shell");
	jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
	jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
	jQuery.sap.require("sap.ui.ino.application.ControlFactory");
	jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
	jQuery.sap.require("sap.ui.ino.controls.ToolPopup");
	jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
	jQuery.sap.require("sap.ui.ino.models.object.Group");
	jQuery.sap.require("sap.ui.ino.models.object.User");
	jQuery.sap.require("sap.ui.ino.models.object.Tag");
	jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

	jQuery.sap.require("sap.ui.ino.application.Configuration");
	jQuery.sap.require("sap.ui.ino.controls.BackofficeShell");
	jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

	var Configuration = sap.ui.ino.application.Configuration;
	var USER_TYPE = {
		group: "GROUP",
		user: "USER"
	};

	/**
	 * the control factory creates control for backoffice views which are needed in that configuration ACROSS all
	 * backoffice views
	 */

	function _getApplication() {
		return sap.ui.ino.application.ApplicationBase.getApplication();
	}

	function _getResourceBundle() {
		return sap.ui.getCore().getModel("i18n").getResourceBundle();
	}

	sap.ui.ino.application.backoffice.ControlFactory = jQuery.extend({}, sap.ui.ino.application.ControlFactory, {
		createShell: function(oApplication) {
			// Dummy assignment for JSHint and UI Check
			var ODataTreeBinding = sap.ui.ino.extensions.sap.ui.model.odata.ODataTreeBinding;
			var ShellExtension = sap.ui.ino.extensions.sap.ui.ux3.Shell;
			var oControlFactory = this;
			var bDisplayTermsAndConditions = Configuration.isComponentActive("sap.ino.config.DISPLAY_TERMS_CONDITIONS");
			var aHeaderItems = [];

			//Add Message Strip
			if (Configuration.systemMessage()) {
				var oSystemMessage = new sap.ui.commons.TextView({
					text: Configuration.systemMessage(),
					semanticColor: sap.ui.commons.TextViewColor.Critical,
					design: sap.ui.commons.TextViewDesign.Small
				});

				aHeaderItems.push(oSystemMessage);
			}

			var oFrontOfficeLink = new sap.ui.commons.Link({
				text: "{i18n>BO_APPLICATION_MIT_FRONTOFFICE}",
				press: function() {
					oApplication.navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', "ideabrowser");
				}
			});
			aHeaderItems.push(oFrontOfficeLink);

			if (bDisplayTermsAndConditions) {
				var oTermsAndConditionLink = new sap.ui.commons.Link({
					visible: {
						path: "i18n>FO_APPLICATION_EXP_TERM_CONDITIONS",
						formatter: function(sText) {
							return !!sText;
						}
					},
					text: "{i18n>FO_APPLICATION_MIT_TERM_CONDITIONS}",
					target: "popup",
					press: function(oEvent) {
						var oDialog = oControlFactory.createTermsAndConditionsDialog(oApplication);
						var fnClosed = function() {
							oDialog.detachClosed(fnClosed);
						};

						Configuration.getUserModel().setProperty("/data/TERMACTION", false);
						Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", true);
						Configuration.getUserModel().setProperty("/data/TERMACCEPTCALLBACK", null);

						oDialog.attachClosed(fnClosed);
						oDialog.open();
					}
				});
				aHeaderItems.push(oTermsAndConditionLink);
			}

			var oSettingsView, oSettingsPopup;
			var oSettings = new sap.ui.commons.Link({
				text: oApplication.getCurrentUserName(),
				press: function() {
					if (oSettingsPopup.isOpen()) {
						oSettingsPopup.close();
					} else {
						if (oSettingsView === undefined) {
							oSettingsView = new sap.ui.view({
								viewName: "sap.ui.ino.views.common.UserSettings",
								type: sap.ui.core.mvc.ViewType.JS,
								viewData: {
									container: oSettingsPopup
								}
							});
							oSettingsPopup.addContent(oSettingsView);
						}
						oSettingsPopup.open(sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom);
					}
				}
			});

			oSettingsPopup = new sap.ui.ino.controls.ToolPopup({
				inverted: false,
				opener: oSettings,
				closed: function() {
					oSettings.focus();
				}
			}).addStyleClass("sapUiInoLargeToolPopup");
			aHeaderItems.push(oSettings);

			var oHeaderLayout = new sap.ui.layout.HorizontalLayout({
				content: aHeaderItems
			});

			function updateHelpPane(sHelpContext, additional) {
				var sHelpTitleKey;
				var sHelpTextKey;
				var additionalKey = '';

				if (sHelpContext) {
					sHelpTitleKey = "{i18n>" + sHelpContext + "_TIT_HELP}";
					sHelpTextKey = "i18n>" + sHelpContext + "_EXP_HELP";
				} else {
					sHelpTitleKey = "{i18n>BO_APPLICATION_MIT_HELP}";
					sHelpTextKey = "i18n>BO_APPLICATION_NO_EXP_HELP";
				}

				if (additional) {
					additionalKey = "i18n>" + additional + "_EXP_HELP";
				}
				var oHelpPanel = new sap.ui.commons.Panel({
					text: sHelpTitleKey,
					showCollapseIcon: false,
					content: [new sap.ui.core.HTML({
						content: {
							parts: [{
								path: sHelpTextKey
							}, {
								path: additionalKey
							}],
							formatter: function(sContent, additional) {
								var text = additional === additionalKey || !additional ? '' : additional;
								return "<span class=\"sapUiFTV\">" + sContent + text + "</span>";
							}
						},
						sanitizeContent: true
					})]
				});
				oHelpPanel.addStyleClass("sapUiInoHelpPanel");
				oShell.setPaneContent(oHelpPanel, true);
			}

			function onHelpContextChanged(oEvent) {
				var sHelpContext = oEvent.getParameter("helpContext");
				var additionalContnet = oEvent.getParameter('additionalContext');
				updateHelpPane(sHelpContext, additionalContnet);
			}

			// init logout model: handles session timeouts & manual logout
			var oShell = new sap.ui.ino.controls.BackofficeShell({
				appTitle: "{i18n>BO_APPLICATION_TIT_PRODUCT}",
				appIcon: "/sap/ino/ui/backoffice/img/logo.png",
				appIconTooltip: "{i18n>BO_APPLICATION_TIT_PRODUCT}",
				showLogoutButton: oApplication.isUsingBasicAuth(),
				showSearchTool: true,
				showFeederTool: false,
				designType: sap.ui.ux3.ShellDesignType.Crystal,
				// worksetItems : will be created campaign dependently in Application.beforeSetContent()
				headerHomeTitle: "{i18n>BO_APPLICATION_MIT_HEADER_HOME}",
				settingsBtnTooltipText: "{i18n>BO_APPLICATION_SETTINGS_TOOLTIP_TEXT}",
				headerItems: [oHeaderLayout],
				headerType: sap.ui.ux3.ShellHeaderType.Standard,
				worksetItemSelected: function(oEvent) {
					var oItem = oEvent.getParameter("item");
					oApplication.navigateToByURL(oItem.getHref());
				},
				paneBarItems: [new sap.ui.core.Item({
					key: "help",
					text: "{i18n>BO_APPLICATION_MIT_HELP}"
				}), new sap.ui.core.Item({
					key: "clipboard",
					text: "{i18n>BO_APPLICATION_MIT_CLIPBOARD}"
				})],
				paneBarItemSelected: function(oEvent) {
					var oShell = oEvent.getSource();
					var sKey = oEvent.getParameter("key");
					if (sKey === "help") {
						updateHelpPane(oApplication.getHelpContext(), oApplication.getAdditionalContext());
						oApplication.attachHelpContextChanged(onHelpContextChanged);
					} else if (sKey === "clipboard") {
						oApplication.detachHelpContextChanged(onHelpContextChanged);
						var oClipboard = sap.ui.view({
							viewName: "sap.ui.ino.views.backoffice.clipboard.Clipboard",
							type: sap.ui.core.mvc.ViewType.JS
						});
						oClipboard.addStyleClass("sapUiInoClipboard");
						oShell.setPaneContent(oClipboard, true);
					}
				},
				paneClosed: function(oEvent) {
					oApplication.detachHelpContextChanged(onHelpContextChanged);
				},
				search: function(oEvent) {
					oApplication.navigateTo("search", {
						searchTerm: oEvent.getParameter("text").substr(0, 1000)
					});

					if (this._getSearchTool) {
						var content = this._getSearchTool().getContent();
						for (var i = 0; i < content.length; i++) {
							if (content[i] instanceof sap.ui.commons.SearchField) {
								content[i].setValue("");
								break;
							}
						}
						this._getSearchTool().close();
					}
				},
				logout: function() {
					_getApplication().logout();
				},
				fullHeightContent: true

			});

			// we don't want the focus to be changed when the pane opens
			oShell.focusPaneStart = function() {};
			oShell.addStyleClass("sapUiInoShell");

			return oShell;
		},

		createTagTemplate: function(sModelName, sIdProperty, sNameProperty, bEdit, fnRemove) {
			var sBackgroundDesign = sap.ui.commons.layout.BackgroundDesign.Transparent;
			var oTagTemplate = new sap.ui.commons.layout.HorizontalLayout();

			if (!sModelName) {
				sModelName = undefined;
			}

			var oTagLink = new sap.ui.commons.Link({
				text: sModelName ? "{" + sModelName + ">" + sNameProperty + "}" : "{" + sNameProperty + "}",
				press: function(oEvent) {
					var oRowBindingContext = oEvent.getSource().getBindingContext(sModelName);
					var iObjectID = oRowBindingContext.getProperty(sIdProperty);
					if (iObjectID > 0) {
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						if (oApp.getActiveOverlay()) {
							sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("tag", {
								id: iObjectID,
								edit: false
							});
						} else {
							sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify").show(iObjectID, "display");
						}
					}
				}
			});

			oTagTemplate.addContent(oTagLink);

			var oToggleClipboardButton = this.createClipboardToggleButton(sap.ui.ino.models.object.Tag, sIdProperty, sModelName, oTagLink);
			oToggleClipboardButton.addStyleClass("sapUiInoBackofficeSmallButton");

			oTagTemplate.addContent(oToggleClipboardButton);

			if (bEdit) {
				var oRemoveButton = new sap.ui.commons.Button({
					tooltip: "{i18n>BO_COMMON_BUT_REMOVE}",
					press: fnRemove,
					icon: sap.ui.ino.controls.ThemeFactory.getImage("remove_small.png"),
					lite: true,
					ariaLabelledBy: oTagLink
				});
				oRemoveButton.addStyleClass("sapUiInoBackofficeSmallButton");

				oTagTemplate.addContent(oRemoveButton);
			}

			return oTagTemplate;
		},

		createWorksetItems: function(iCampaignId) {
			var oApplication = _getApplication();
			var sCampaignPath = oApplication.getCurrentNavigationState().path;
			if (sCampaignPath !== "campaignlist") {
				sCampaignPath = "campaigntiles";
			}
			return [new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_CAMPAIGNS}",
				href: oApplication.getNavigationLink(sCampaignPath),
				visible: oApplication.isNavigationEnabled(sCampaignPath),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_ACTIVE_CAMPAIGNS}",
					href: oApplication.getNavigationLink(sCampaignPath, {
						tableView: "active"
					})
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_DRAFT_CAMPAIGNS}",
					href: oApplication.getNavigationLink(sCampaignPath, {
						tableView: "draft"
					})
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_FUTURE_CAMPAIGNS}",
					href: oApplication.getNavigationLink(sCampaignPath, {
						tableView: "future"
					})
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_COMPLETED_CAMPAIGNS}",
					href: oApplication.getNavigationLink(sCampaignPath, {
						tableView: "completed"
					})
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_TAG_MANAGEMENT}",
				href: oApplication.getNavigationLink("taglist"),
				visible: oApplication.isNavigationEnabled("taglist"),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_TAGS}",
					href: oApplication.getNavigationLink("taglist"),
					visible: oApplication.isNavigationEnabled("taglist")
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_TAGGRUOPS}",
					href: oApplication.getNavigationLink("taggrouplist"),
					visible: oApplication.isNavigationEnabled("taggrouplist")
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_EXPERT_FINDER}",
				href: oApplication.getNavigationLink("expertfinder"),
				visible: oApplication.isNavigationEnabled("expertfinder")
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_USER_MANAGEMENT}",
				href: oApplication.getNavigationLink("userlist"),
				visible: oApplication.isNavigationEnabled("userlist"),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_USERS}",
					href: oApplication.getNavigationLink("userlist"),
					visible: oApplication.isNavigationEnabled("userlist")
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_GROUPS}",
					href: oApplication.getNavigationLink("grouplist"),
					visible: oApplication.isNavigationEnabled("grouplist")
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_USERSPROFILE}",
					href: oApplication.getNavigationLink("userProfile"),
					visible: oApplication.isNavigationEnabled("userProfile")
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_USERLOGSETTING}",
					href: oApplication.getNavigationLink("userLogSetting"),
					visible: oApplication.isNavigationEnabled("userLogSetting")
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_USERCONSUMPTIONREPORT}",
					href: oApplication.getNavigationLink("userConsumptionReport"),
					visible: oApplication.isNavigationEnabled("userConsumptionReport")
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_GAMIFICATION_CONFIG}",
				href: oApplication.getNavigationLink("gamificationsetting"),
				visible: oApplication.isNavigationEnabled("gamificationsetting"),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_GAMIFICATION_SETTING}",
					href: oApplication.getNavigationLink("gamificationsetting"),
					visible: oApplication.isNavigationEnabled("gamificationsetting"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_GAMIFICATION_SETTING}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_GAMIFICATION_DIMENSION_LIST}",
					href: oApplication.getNavigationLink("gamificationdimensionlist"),
					visible: oApplication.isNavigationEnabled("gamificationdimensionlist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_GAMIFICATION_DIMENSION_LIST}"
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_STATUS_CONFIG}",
				href: oApplication.getNavigationLink("configstatusnamelist"),
				visible: oApplication.isNavigationEnabled("configstatusnamelist"),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_STATUS_NAME}",
					href: oApplication.getNavigationLink("configstatusnamelist"),
					visible: oApplication.isNavigationEnabled("configstatusnamelist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_STATUS_NAME}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_STATUS_ACTION}",
					href: oApplication.getNavigationLink("configstatusactionlist"),
					visible: oApplication.isNavigationEnabled("configstatusactionlist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_STATUS_ACTION}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_STATUS_MODEL}",
					href: oApplication.getNavigationLink("configstatusmodellist"),
					visible: oApplication.isNavigationEnabled("configstatusmodellist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_STATUS_MODEL}"
				})]
			}), new sap.ui.ux3.NavigationItem("Search", {
				text: "{i18n>BO_APPLICATION_MIT_SEARCH_RESULTS}",
				href: oApplication.getNavigationLink("search"),
				visible: false
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_CONFIG}",
				href: oApplication.getNavigationLink("configevaluationmodellist"),
				visible: oApplication.isNavigationEnabled("configevaluationmodellist"),
				subItems: [new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_EVALUATION_MODELS}",
					href: oApplication.getNavigationLink("configevaluationmodellist"),
					visible: oApplication.isNavigationEnabled("configevaluationmodellist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_EVALUATION_MODELS}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_VALUE_LISTS}",
					href: oApplication.getNavigationLink("configvalueoptionlist"),
					visible: oApplication.isNavigationEnabled("configvalueoptionlist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_VALUE_LISTS}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_RESPONSIBILITY_LISTS}",
					href: oApplication.getNavigationLink("configresponsibilitylists"),
					visible: oApplication.isNavigationEnabled("configresponsibilitylists"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_RESPONSIBILITY_LISTS}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_UNITS}",
					href: oApplication.getNavigationLink("configunitlist"),
					visible: oApplication.isNavigationEnabled("configunitlist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_UNITS}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_PHASES}",
					href: oApplication.getNavigationLink("configcampaignphaselist"),
					visible: oApplication.isNavigationEnabled("configcampaignphaselist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_PHASES}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_MAIL_TEMPLATES}",
					href: oApplication.getNavigationLink("configmailtemplatelist"),
					visible: oApplication.isNavigationEnabled("configmailtemplatelist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_MAIL_TEMPLATES}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_TEXT_MODULES}",
					href: oApplication.getNavigationLink("configtextmodulelist"),
					visible: oApplication.isNavigationEnabled("configtextmodulelist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_TEXT_MODULES}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_FORM_ADMINISTRATION}",
					href: oApplication.getNavigationLink("configideaformlist"),
					visible: oApplication.isNavigationEnabled("configideaformlist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_ADMINISTRATION}"
				}), new sap.ui.ux3.NavigationItem({
				    text: "{i18n>BO_APPLICATION_MIT_NOTIFICATION}",
					href: oApplication.getNavigationLink("configNotification"),
					visible: oApplication.isNavigationEnabled("configNotification"),
					tooltip: "{i18n>BO_APPLICATION_MIT_NOTIFICATION}"
				}) , new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_VOTE_TYPE}",
					href: oApplication.getNavigationLink("configVoteTypelist"),
					visible: oApplication.isNavigationEnabled("configVoteTypelist"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_VOTE_TYPE}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_CAMPAIGN_TASKS}",
					href: oApplication.getNavigationLink("configcampaigntakslists"),
					visible: oApplication.isNavigationEnabled("configcampaigntakslists"),
					tooltip: "{i18n>BO_APPLICATION_TOOLTIP_FORM_CAMPAIGN_TASKS}"
				}), new sap.ui.ux3.NavigationItem({
					text: "{i18n>BO_APPLICATION_MIT_URL_WHITELIST}",
					href: oApplication.getNavigationLink("urlwhitelist"),
					visible: oApplication.isNavigationEnabled("urlwhitelist")
				}), new sap.ui.ux3.NavigationItem({
				    text: "{i18n>BO_APPLICATION_MIT_IDEA_MERGERULE}",
					href: oApplication.getNavigationLink("configIdeaMergeRule"),
					visible: oApplication.isNavigationEnabled("configIdeaMergeRule")
				})]
			}), new sap.ui.ux3.NavigationItem({
			    text: "{i18n>BO_INTEGRATION_NAVIGATION_ITEM}",
				href: oApplication.getNavigationLink("integrationMappingList"),
				visible: oApplication.isNavigationEnabled("integrationMappingList"),
				subItems: [new sap.ui.ux3.NavigationItem({
    				text: "{i18n>BO_INTEGRATION_NAVIGATION_SUB_ITEM_MAPPING}",
    				href: oApplication.getNavigationLink("integrationMappingList"),
    				visible: oApplication.isNavigationEnabled("integrationMappingList")
				})]
			}), new sap.ui.ux3.NavigationItem({
			    text: "{i18n>BO_MONITOR_NAVIGATION_ITEM}",
				href: oApplication.getNavigationLink("integrationMonitorList"),
				visible: oApplication.isNavigationEnabled("integrationMonitorList"),
				subItems: [new sap.ui.ux3.NavigationItem({
    				text: "{i18n>BO_MONITOR_NAVIGATION_SUB_ITEM_INTEGRATION_MONITOR}",
    				href: oApplication.getNavigationLink("integrationMonitorList"),
    				visible: oApplication.isNavigationEnabled("integrationMonitorList")
				}),new sap.ui.ux3.NavigationItem({
    				text: "{i18n>BO_MONITOR_NAVIGATION_SUB_ITEM_NOTIFICATION_EMAIL_MONITOR}",
    				href: oApplication.getNavigationLink("notificationsEmailMonitorList"),
    				visible: oApplication.isNavigationEnabled("notificationsEmailMonitorList")
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_HOMEPAFE_WIDGET}",
				href: oApplication.getNavigationLink("innoOfficeHomePageWidget"),
				visible: oApplication.isNavigationEnabled("innoOfficeHomePageWidget"),
				subItems: [new sap.ui.ux3.NavigationItem({
    				text: "{i18n>BO_APPLICATION_MIT_INNO_OFFICE_WIDGET}",
    				href: oApplication.getNavigationLink("innoOfficeHomePageWidget"),
    				visible: oApplication.isNavigationEnabled("innoOfficeHomePageWidget")
				}), new sap.ui.ux3.NavigationItem({
    				text: "{i18n>BO_APPLICATION_MIT_COMMUNITY_WIDGET}",
    				href: oApplication.getNavigationLink("communityHomePageWidget"),
    				visible: oApplication.isNavigationEnabled("communityHomePageWidget")
				})]
			}), new sap.ui.ux3.NavigationItem({
				text: "{i18n>BO_APPLICATION_MIT_SETTINGS}",
				href: oApplication.getNavigationLink("settings"),
				visible: oApplication.isNavigationEnabled("settings")
			})
			];
		},

		createParticipantTemplate: function(sModelName, sIdProperty, bFilled, bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty,
			bSelfDeletion) {
			var oParticipantTemplate = new sap.ui.commons.layout.MatrixLayout({
				widths: ["34%", "17%", "17%", "17%", "15%"],
				columns: 5
			});
			var oParticipantRow = new sap.ui.commons.layout.MatrixLayoutRow();
			//PARTICIPANTS ROW TEMPLATE
			var oNameDetailTemplate = sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(sModelName, sIdProperty, bFilled,
				bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty, bSelfDeletion);

			//	var sIdProperty = "IDENTITY_ID";

			var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				content: oNameDetailTemplate
			});

			oParticipantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: oHorizontalLayout
			}));

			//Submit check
			var submitCheck = new sap.ui.commons.CheckBox({
				//id:"participantSubmitCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "CAN_SUBMIT" : "CAN_SUBMIT",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(submitCheckedValue) {
						if (submitCheckedValue === 1) {
							return true;
						} else {
							return false;
						}
					}
				},
				editable: bEdit,
				change: function(oEvent) {
					var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					var limitProperty = sap.ui.ino.application.backoffice.ControlFactory.setLimitProperty(oEvent, cellNo, 1);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_SUBMIT", Number(oEvent.getParameter(
						"checked")));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/LimitOfParticipants/",
						limitProperty);

				}
			});
			var commentCheck = new sap.ui.commons.CheckBox({
				// id:"participantCommentCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "CAN_COMMENT" : "CAN_COMMENT",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(commentCheckedValue) {
						if (commentCheckedValue === 1) {
							return true;
						} else {
							return false;
						}
					}
				},
				editable: bEdit,
				change: function(oEvent) {
					var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					var limitProperty = sap.ui.ino.application.backoffice.ControlFactory.setLimitProperty(oEvent, cellNo, 2);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_COMMENT", Number(oEvent
						.getParameter("checked")));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/LimitOfParticipants/",
						limitProperty);

				}
			});
			var voteCheck = new sap.ui.commons.CheckBox({
				// id:"participantVoteCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "CAN_VOTE" : "CAN_VOTE",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(voteCheckedValue) {
						if (voteCheckedValue === 1) {
							return true;
						} else {
							return false;
						}
					}
				},
				editable: bEdit,
				change: function(oEvent) {
					var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					var limitProperty = sap.ui.ino.application.backoffice.ControlFactory.setLimitProperty(oEvent, cellNo, 0);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_VOTE", Number(oEvent.getParameter(
						"checked")));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/LimitOfParticipants/",
						limitProperty);

				}
			});
			var viewCheck = new sap.ui.commons.CheckBox({
				//  id:"participantViewCheckbox",
				checked: {
					parts: [{
						path: sModelName ? sModelName + ">" + "CAN_SUBMIT" : "CAN_SUBMIT"
                        }, {
						path: sModelName ? sModelName + ">" + "CAN_VOTE" : "CAN_VOTE"
                        }, {
						path: sModelName ? sModelName + ">" + "CAN_COMMENT" : "CAN_COMMENT"
                        }],
					formatter: function(submit, vote, comment) {
						return !(submit || vote || comment);
					}
				},
				editable: bEdit,
				change: function(oEvent) {
					var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_SUBMIT", Number(!oEvent
						.getParameter("checked")));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_COMMENT", Number(!
						oEvent.getParameter("checked")));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/CAN_VOTE", Number(!oEvent.getParameter(
						"checked")));
					var limitProperty = sap.ui.ino.application.backoffice.ControlFactory.setLimitProperty(oEvent, cellNo, 3);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Participants/" + cellNo + "/LimitOfParticipants/",
						limitProperty);

				}

			});
			oParticipantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: submitCheck
			}));
			//Comment check
			oParticipantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: commentCheck
			}));
			//Vote check
			oParticipantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: voteCheck
			}));
			//View Only check
			oParticipantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: viewCheck
			}));
			oParticipantTemplate.addRow(oParticipantRow);
			return oParticipantTemplate;
		},

		//IF property of limitaction undefined, return 0
		getLimitPropertyCheck: function(oEvent, cellNo, actionCode) {
			var limitProperty = oEvent.getSource().getParent().getModel("applicationObject").getProperty("/Participants/" + cellNo +
				"/LimitOfParticipants/" + actionCode + "/DISABLED");
			if (limitProperty === null || limitProperty === undefined) {
				return 0;
			} else {
				return limitProperty;
			}
		},

		//set limit Action_Code
		setLimitProperty: function(oEvent, cellNo, actionCode) {
			var limitProperties = [];
			var disabledVote = sap.ui.ino.application.backoffice.ControlFactory.getLimitPropertyCheck(oEvent, cellNo, 0);
			var disabledSubmit = sap.ui.ino.application.backoffice.ControlFactory.getLimitPropertyCheck(oEvent, cellNo, 1);
			var disabledComment = sap.ui.ino.application.backoffice.ControlFactory.getLimitPropertyCheck(oEvent, cellNo, 2);

			if (actionCode === 0) {
				disabledVote = Number(!oEvent.getParameter("checked"));
			} else if (actionCode === 1) {
				disabledSubmit = Number(!oEvent.getParameter("checked"));
			} else if (actionCode === 2) {
				disabledComment = Number(!oEvent.getParameter("checked"));
			} else if (actionCode === 3) {
				if (oEvent.getParameter("checked")) {
					disabledVote = 1;
					disabledSubmit = 1;
					disabledComment = 1;
				} else {
					disabledVote = 0;
					disabledSubmit = 0;
					disabledComment = 0;
				}
			}
			limitProperties = [{
					"ACTION_CODE": "IDEA_VOTE",
					"DISABLED": disabledVote
                		 },
				{
					"ACTION_CODE": "CAMPAIGN_SUBMIT",
					"DISABLED": disabledSubmit
                		 },
				{
					"ACTION_CODE": "IDEA_COMMENT",
					"DISABLED": disabledComment
                		 }];
			return limitProperties;
		},
		
		createRegistrationTemplate: function(sModelName, sIdProperty, bFilled, bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty,
			bSelfDeletion) {
			var oRegistrationTemplate = new sap.ui.commons.layout.MatrixLayout({
				widths: ["40%", "22%", "22%", "16%"],
				columns: 4
			});
			var oRegistrationRow = new sap.ui.commons.layout.MatrixLayoutRow();
			//REGISTRATION ROW TEMPLATE
			var oNameDetailTemplate = sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(sModelName, sIdProperty, bFilled,
				bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty, bSelfDeletion);

			//	var sIdProperty = "IDENTITY_ID";

			var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				content: oNameDetailTemplate
			});

			oRegistrationRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: oHorizontalLayout
			}));

			//Register check
			var registerCheck = new sap.ui.commons.CheckBox({
				//id:"participantSubmitCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "REGISTER_DISABLED" : "REGISTER_DISABLED",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(voteCheckedValue) {
						if (voteCheckedValue === 0) {
							return true;
						} else {
							return false;
						}
					}
				},
				editable: bEdit,
				change: function(oEvent) {
				    var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
				    var  registerValueNum = Number(!oEvent.getParameter("checked"));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Registers/" + cellNo + "/REGISTER_DISABLED", registerValueNum);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Registers/" + cellNo + "/DISABLED", registerValueNum);
				}
			});
			var viewCheck = new sap.ui.commons.CheckBox({
				// id:"participantCommentCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "REGISTER_DISABLED" : "REGISTER_DISABLED",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(voteCheckedValue) {
						if (voteCheckedValue === 1) {
							return true;
						} else {
							return false;
						}
					}
				},
				editable: bEdit,
				change: function(oEvent) {
				    var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					var  registerValueNum = Number(oEvent.getParameter("checked"));
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Registers/" + cellNo + "/REGISTER_DISABLED", registerValueNum);
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Registers/" + cellNo + "/DISABLED", registerValueNum);
				}
			});
			oRegistrationRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: registerCheck
			}));
			//View Only check
			oRegistrationRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: viewCheck
			}));
			oRegistrationTemplate.addRow(oRegistrationRow);
			return oRegistrationTemplate;
		},
		
		setManagerLimitProperty: function(oEvent, cellNo, actionCode){
			var limitProperties = [];
			var disabledDsiplayHomePage;
// 	        var disabledDsiplayHomePage = oEvent.getSource().getParent().getModel("applicationObject").getProperty("/Managers/" + cellNo +
// 				"/LimitOfManagers/" + actionCode + "/DISABLED");
// 			if (disabledDsiplayHomePage === null || disabledDsiplayHomePage === undefined) {
// 				disabledDsiplayHomePage = 0;
// 			}	
			disabledDsiplayHomePage = Number(!oEvent.getParameter("checked"));
			limitProperties = [{
					"ACTION_CODE": "MGR_DISPLAY_HOMEPAGE",
					"DISABLED": disabledDsiplayHomePage
                		 }];
            return   limitProperties;      		 
		},
		
	createCampMgrTemplate: function(sModelName, sIdProperty, bFilled, bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty,
			bSelfDeletion) {
			var oCampMgrTemplate = new sap.ui.commons.layout.MatrixLayout({
                widths: ["40%", "22%", "22%", "16%"],
				columns: 4
			});
			var oCampMgrRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oNameDetailTemplate = sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(sModelName, sIdProperty, bFilled,
				bNewTargetWindow, bEdit, fnRemove, sendMail, sNameProperty, bSelfDeletion);


			var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				content: oNameDetailTemplate
			});

			oCampMgrRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: oHorizontalLayout
			}));
			var viewCheck = new sap.ui.commons.CheckBox({
				//  id:"participantViewCheckbox",
				checked: {
					path: sModelName ? sModelName + ">" + "DISPLAY_HOMEPAGE" : "DISPLAY_HOMEPAGE",
					//type: new sap.ui.ino.models.types.IntBooleanType()
					formatter: function(displayHomepage) {
						if (displayHomepage === 1) {
							return true;
						} else {
							return false;
						}
					}
				},
				//bEdit
				editable: { 
				    parts: [{
						path: sModelName ? sModelName + ">/" + "Managers" : "Managers"
                        }, {
						path: sModelName ? sModelName + ">" + "DISPLAY_HOMEPAGE" : "DISPLAY_HOMEPAGE"
                        },
                        {
						path: sModelName ? sModelName + ">" + "DISABLE_EDIT" : "DISABLE_EDIT"
                        }],
				    formatter: function(aManagers,displayHomePage,disableEdit){
                    var bCanEdit = false;
                    var aDisplayManagers = aManagers.filter(function(oManager){
                        return oManager.DISPLAY_HOMEPAGE === 1;
                    });
                    if(aDisplayManagers.length === 3 && displayHomePage === 1){
                        bCanEdit = true;
                    } else if(aDisplayManagers.length < 3){
                        bCanEdit = true;
                    } 
                    return bEdit && bCanEdit && !disableEdit;
				    }
				},
				
				change: function(oEvent) {
					var cellNo = oEvent.getSource().getParent().getParent().getParent().getParent().indexOfRow(oEvent.getSource().getParent().getParent()
						.getParent());
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Managers/" + cellNo + "/DISPLAY_HOMEPAGE", Number(oEvent
						.getParameter("checked")));
				    //Adjust the other manager can edit the display homepage attribute
				    var aManagers = 	oEvent.getSource().getParent().getModel("applicationObject").getProperty("/Managers");
                    var aDisplayManagers = aManagers.filter(function(oManager){
                        return oManager.DISPLAY_HOMEPAGE === 1;
                    });				    
				    for(var i = 0; i < aManagers.length; i++){
				        aManagers[i].DISABLE_EDIT = false;
                    if(aDisplayManagers.length === 3 && aManagers[i].DISPLAY_HOMEPAGE === 0){
                         aManagers[i].DISABLE_EDIT = true;
                     }  
				    }
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Managers",aManagers);
						
					var limitProperty = sap.ui.ino.application.backoffice.ControlFactory.setManagerLimitProperty(oEvent, cellNo, "MGR_DISPLAY_HOMEPAGE");
					oEvent.getSource().getParent().getModel("applicationObject").setProperty("/Managers/" + cellNo + "/LimitOfCampaignManagers/",
						limitProperty);
				}
			});
			//View Only check
			oCampMgrRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: viewCheck
			}));
			oCampMgrTemplate.addRow(oCampMgrRow);
			return oCampMgrTemplate;
		},
		
		createIdentityTemplate: function(sModelName, sIdProperty, bFilled, bNewTargetWindow, bEdit, fnRemove, fnSendMail, sNameProperty,
			bSelfDeletion) {
			var sBackgroundDesign = sap.ui.commons.layout.BackgroundDesign.Transparent;
			if (bFilled) {
				sBackgroundDesign = sap.ui.commons.layout.BackgroundDesign.Plain;
			}

			if (!sIdProperty) {
				sIdProperty = "ID";
			}

			if (!sNameProperty) {
				sNameProperty = "NAME";
			}
			var oIdentityTemplate = new sap.ui.commons.layout.MatrixLayout({
				layoutFixed: false,
				width: '100%',
				columns: 2,
				widths: ['80px']
			});

			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

			var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
				rowSpan: 2,
				backgroundDesign: sBackgroundDesign,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				// padding : sap.ui.commons.layout.Padding.None,
				content: new sap.ui.core.HTML({
					content: {
						parts: [{
							path: sModelName ? sModelName + ">" + "TYPE_CODE" : "TYPE_CODE"
                        }, {
							path: sModelName ? sModelName + ">" + "IMAGE_ID" : "IMAGE_ID"
                        }, {
							path: sModelName ? sModelName + ">" + "IDENTITY_IMAGE_ID" : "IDENTITY_IMAGE_ID"
                        }, {
							path: sModelName ? sModelName + ">" + "NAME" : "NAME"
                        }],
						formatter: function(sTypeCode, iUserImageId, iIdentityImageId, sName) {
								if (!iUserImageId || iUserImageId === 0) {
									iUserImageId = iIdentityImageId;
								}

								if (iUserImageId && iUserImageId !== 0) {
									return "<div class='sapUiUx3TVIconBar sapUiInoUserIconBar'>" +
										"<div class='sapUiUx3TVIcon sapUiInoUserIcon'><div title='" +
										sName + "' class='sapUiInoUserIconImage' style='background-image:url(\"" +
										Configuration.getAttachmentTitleImageDownloadURL(iUserImageId) +
										"\")' style='vertical-align: middle;'/></div></div></div>";
								} else if(sTypeCode === USER_TYPE.group) {
    								return "<div class='sapUiUx3TVIconBar sapUiInoUserIconBar'>" +
									"<div class='sapUiUx3TVIcon sapUiInoUserIconPlaceholder'><img alt='" +
									sName + "' title='" + sName + "' role='presentation' src='" +
									sap.ui.ino.controls.ThemeFactory.getImage("group_48x48.png") +
									"' style='vertical-align: middle;'/></div></div>";                                    
								}
								else {
								    return "<div class='sapUiUx3TVIconBar sapUiInoUserIconBar'>" +
										"<div class='sapUiUx3TVIcon sapUiInoUserIconPlaceholder'><img alt='" +
										sName + "' title='" + sName + "' role='presentation' src='" +
										sap.ui.ino.controls.ThemeFactory.getImage("user_48x48.png") +
										"' style='vertical-align: middle;'/></div></div>";
								}
						}
					},
					sanitizeContent: true
				})
			});

			oRow.addCell(oCell);

			oCell = new sap.ui.commons.layout.MatrixLayoutCell({
				backgroundDesign: sBackgroundDesign,
				padding: sap.ui.commons.layout.Padding.None,
				vAlign: sap.ui.commons.layout.VAlign.Bottom
			});

			var oName = new sap.ui.commons.Link({
				text: {
					path: sModelName ? sModelName + ">" + "NAME" : "NAME",
					formatter: function(name) {
						if (name) {
							if (name.length > 20) {
								return name.substring(0, 20) + "...";
							} else {
								return name;
							}
						} else {
							return name;
						}
					}
				},
				press: function() {
					var iId = this.getCustomData()[0].getValue();
					var sCode = this.getCustomData()[1].getValue();
					if (iId <= 0 || !sCode) {
						return;
					}
					if (bNewTargetWindow) {
						if (sCode === USER_TYPE.group) {
							var oGroupView = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
							oGroupView.show(iId, "display");
							return;
						}
						sCode = sCode.toLowerCase();
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(sCode, {
							id: iId,
							edit: false
						});
					} else {
						var oThingInspector = null;
						if (sCode === USER_TYPE.group) {
							oThingInspector = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
						} else if (sCode === USER_TYPE.user) {
							oThingInspector = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance");
						}
						if (oThingInspector) {
							oThingInspector.show(iId, "display");
						}
					}
				},
				customData: [new sap.ui.core.CustomData({
					key: "ID",
					value: {
						path: sModelName ? sModelName + ">" + sIdProperty : sIdProperty,
						type: null
					}
				}), new sap.ui.core.CustomData({
					key: "TYPE_CODE",
					value: sModelName ? "{" + sModelName + ">" + "TYPE_CODE}" : "{TYPE_CODE}"
				})]
			});
			oName.addStyleClass("sapUiInoBackofficeNavigationLink");

			var oToggleClipboardButton = this.createClipboardToggleButtonForIdentity(sIdProperty, sModelName);
			oToggleClipboardButton.addStyleClass("sapUiInoBackofficeSmallButton");

			var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				content: [oName, oToggleClipboardButton]
			});

			if (bEdit) {
				var oRemoveButton = new sap.ui.commons.Button({
					tooltip: "{i18n>BO_COMMON_BUT_REMOVE}",
					press: fnRemove,
					icon: sap.ui.ino.controls.ThemeFactory.getImage("remove_small.png"),
					lite: true,
					enabled: {
						path: sModelName ? sModelName + ">" + sIdProperty : sIdProperty,
						type: null,
						formatter: function(iIdentityId) {
							if (bSelfDeletion === false) {
								return (iIdentityId !== Configuration.getCurrentUser().USER_ID);
							} else {
								return true;
							}
						}
					}
				});
				oRemoveButton.addStyleClass("sapUiInoBackofficeSmallButton");
				oHorizontalLayout.addContent(oRemoveButton);
			}

			oCell.addContent(oHorizontalLayout);
			oRow.addCell(oCell);
			oIdentityTemplate.addRow(oRow);

			oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oCell = new sap.ui.commons.layout.MatrixLayoutCell({
				backgroundDesign: sBackgroundDesign,
				padding: sap.ui.commons.layout.Padding.None
			});

			var oDetailLayout = new sap.ui.commons.layout.MatrixLayout({
				layoutFixed: false,
				width: '100%',
				columns: 2,
				widths: ['80px']
			});

			var oIdentityLabel = new sap.ui.commons.Label({
				text: {
					path: sModelName ? sModelName + ">" + "TYPE_CODE" : "TYPE_CODE",
					formatter: function(sCode) {
						if (sCode !== USER_TYPE.group) {
							return _getResourceBundle().getText("FACTORY_COMMON_FLD_LABEL", [_getResourceBundle().getText("BO_FACTORY_FLD_USER")]);
						} else {
							return _getResourceBundle().getText("FACTORY_COMMON_FLD_LABEL", [_getResourceBundle().getText("BO_FACTORY_FLD_DESCRIPTION")]);
						}
					}
				}
			}).addStyleClass("sapUiInoIdentityTemplateLabel");
			var oDetailRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oLabelLayout = new sap.ui.layout.VerticalLayout({
				content: oIdentityLabel
			});

			var oMailLabel = new sap.ui.commons.Label({
				text: {
					path: sModelName ? sModelName + ">" + "EMAIL" : "EMAIL",
					formatter: function(sEMail) {
						if (sEMail) {
							return _getResourceBundle().getText("FACTORY_COMMON_FLD_LABEL", [_getResourceBundle().getText("BO_FACTORY_FLD_EMAIL")]);
						}
					}
				}
			}).addStyleClass("sapUiInoIdentityTemplateLabel");

			oLabelLayout.addContent(oMailLabel);

			var oDetailCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: oLabelLayout,
				padding: sap.ui.commons.layout.Padding.None
			});
			oDetailRow.addCell(oDetailCell);

			var oIdentityText = new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: sModelName ? sModelName + ">" + "USER_NAME" : "USER_NAME"
                    }, {
						path: sModelName ? sModelName + ">" + "DESCRIPTION" : "DESCRIPTION"
                    }, {
						path: sModelName ? sModelName + ">" + "TYPE_CODE" : "TYPE_CODE"
                    }],
					formatter: function(sUserName, sDescription, sCode) {
						if (sCode === USER_TYPE.group) {
							if (sDescription === null || sDescription === undefined) {
								sDescription = "";
							}
							return sDescription;
						} else {
							return sUserName;
						}
					}
				},
				wrapping: true,
				ariaLabelledBy: oIdentityLabel
			});

			oIdentityLabel.setLabelFor(oIdentityText);

			var oContentLayout = new sap.ui.layout.VerticalLayout({
				content: oIdentityText
			});

			var oMailLink = new sap.ui.commons.Link({
				text: {
					path: sModelName ? sModelName + ">" + "EMAIL" : "EMAIL",
					formatter: function(sEMail) {
						if (sEMail) {
							return sEMail;
						} else {
							this.setEnabled(false);
							return undefined;
						}
					}
				},
				press: function(oControlEvent) {
					var sMailAddress = oControlEvent.getSource().getBindingInfo("text").binding.oValue;
					if (fnSendMail) {
						fnSendMail([sMailAddress]);
					} else {
						window.location = "mailto:" + sMailAddress;
					}
				},
				customData: [new sap.ui.core.CustomData({
					key: "TYPE_CODE",
					value: sModelName ? "{" + sModelName + ">" + "TYPE_CODE}" : "{TYPE_CODE}"
				})],
				ariaLabelledBy: oMailLabel
			});

			oMailLabel.setLabelFor(oMailLink);

			oContentLayout.addContent(oMailLink);

			oDetailCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: oContentLayout,
				padding: sap.ui.commons.layout.Padding.None
			});

			oDetailRow.addCell(oDetailCell);
			oDetailLayout.addRow(oDetailRow);

			oCell.addContent(oDetailLayout);
			oRow.addCell(oCell);
			oIdentityTemplate.addRow(oRow);

			return oIdentityTemplate;
		},

		createTableColumnCodeFilterMenu: function(oTable, oColumn, sCodeIdentifier, aFilteredCodes, sFilterType, sBindingPath) {
			var sCodePath = "";
			var sModelPrefix = null;
			sFilterType = sFilterType || "CODE";
			if (!sBindingPath) {
				sModelPrefix = "code";
				var sBindingPath = sModelPrefix + ">/" + sCodeIdentifier;
				sCodePath = sModelPrefix + ">" + sFilterType;
			} else {
				sCodePath = sFilterType;
			}
			var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();

			// this is the path to the themed filter icon of table columns
			var sFilterIconURL = sap.ui.resource("sap.ui.table", "themes/" + sCurrentTheme + "/img/ico12_filter.gif");
			var oMenu = new sap.ui.unified.Menu();
			oMenu._sFilterValue = "";

			function resetAllFilterIcons() {
				var aItems = oMenu.getItems();
				for (var j = 0; j < aItems.length; j++) {
					aItems[j].setIcon(null);
				}
			}

			var oCodeFormatter = sap.ui.ino.models.core.CodeModel.getFormatter(sCodeIdentifier);

			var oMenuItemTemplate = new sap.ui.unified.MenuItem({
				text: {
					path: sCodePath,
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeIdentifier)
				},
				visible: {
					path: sCodePath,
					formatter: function(sCode) {
						return (-1 == jQuery.inArray(sCode, aFilteredCodes));
					}
				},
				select: function(oEvent) {
					var oSource = oEvent.getSource();
					var sValue = oSource.getBindingContext(sModelPrefix).getObject()[sFilterType];
					if (oMenu._sFilterValue === sValue) {
						oTable.filter(oColumn, "");
						oMenu._sFilterValue = "";
						oSource.setIcon(null);
					} else {
						// = in the value forces an EQ filter
						oTable.filter(oColumn, "=" + sValue);
						oMenu._sFilterValue = sValue;
						resetAllFilterIcons();
						oSource.setIcon(sFilterIconURL);
					}
				}
			});

			oMenu.bindAggregation("items", {
				path: sBindingPath,
				template: oMenuItemTemplate
			});

			var oFilterItem = new sap.ui.unified.MenuItem({
				icon: sFilterIconURL,
				text: "{i18n>BO_COMMON_MIT_FILTER_BY_COLUMN}",
				submenu: oMenu
			});

			return oFilterItem;

		},

		createTableColumnBoolFilterMenu: function(oTable, oColumn) {

			var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();

			// this is the path to the themed filter icon of table columns
			var sFilterIconURL = sap.ui.resource("sap.ui.table", "themes/" + sCurrentTheme + "/img/ico12_filter.gif");
			var oMenu = new sap.ui.commons.Menu();
			oMenu._bFilterValue = undefined;

			function resetAllFilterIcons() {
				var aItems = oMenu.getItems();
				for (var j = 0; j < aItems.length; j++) {
					aItems[j].setIcon(null);
				}
			}

			function selectHandler(bActive) {
				return function(oEvent) {
					var oSource = oEvent.getSource();
					if (oMenu._bFilterValue === bActive) {
						oTable.filter(oColumn, "");
						oMenu._bFilterValue = undefined;
						oSource.setIcon(null);
					} else {
						// = in the value forces an EQ filter
						oTable.filter(oColumn, "=" + (bActive ? "1" : "0"));
						oMenu._bFilterValue = bActive;
						resetAllFilterIcons();
						oSource.setIcon(sFilterIconURL);
					}
				}
			}

			oMenu.addItem(new sap.ui.commons.MenuItem({
				text: "{i18n>BO_COMMON_MIT_BOOL_FILTER_TRUE}",
				select: selectHandler(true)
			}));

			oMenu.addItem(new sap.ui.commons.MenuItem({
				text: "{i18n>BO_COMMON_MIT_BOOL_FILTER_FALSE}",
				select: selectHandler(false)
			}));

			var oFilterItem = new sap.ui.commons.MenuItem({
				icon: sFilterIconURL,
				text: "{i18n>BO_COMMON_MIT_FILTER_BY_COLUMN}",
				submenu: oMenu
			});

			return oFilterItem;
		},

		getOpenIdentityHandler: function(sProperty, sType) {
			return function(oEvent) {
				var iId = null;
				if (oEvent.getSource().getBindingContext()) {
					iId = oEvent.getSource().getBindingContext().getProperty(sProperty);
				}
				if (!iId) {
					var oBinding = oEvent.getSource().getBinding("text");
					if (oBinding) {
						var sContextPath = null;
						if (oBinding.getContext()) {
							sContextPath = oBinding.getContext().getPath();
						} else {
							sContextPath = "";
						}
						if (sContextPath !== null) {
							iId = oBinding.getModel().getProperty(sContextPath + "/" + sProperty);
						}
					}
				}
				if (!iId) {
					return;
				}

				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				if (oApp.getActiveOverlay()) {
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(sType, {
						id: iId,
						edit: false
					});
				} else {
					var oThingInspector = null;
					if (sType === USER_TYPE.user.toLowerCase()) {
						oThingInspector = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance");
					} else if (sType === USER_TYPE.group.toLowerCase()) {
						oThingInspector = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
					}
					if (oThingInspector) {
						oThingInspector.show(iId, "display");
						oThingInspector.oTI.destroyActionBar();
					}
				}
			};
		},

		createExportButton: function(onPress, sExportButtonId) {
			var oExportMenu = new sap.ui.commons.Menu({
				items: [new sap.ui.commons.MenuItem({
					text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT_CSV}",
					customData: [new sap.ui.core.CustomData({
						key: "FORMAT",
						value: "csv"
					})]
				}), new sap.ui.commons.MenuItem({
					text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT_EXCEL}",
					customData: [new sap.ui.core.CustomData({
						key: "FORMAT",
						value: "xls"
					})]
				})]
			});

			return new sap.ui.commons.MenuButton({
				id: sExportButtonId,
				press: onPress,
				text: "{i18n>GENERAL_MASTER_DETAIL_BUT_EXPORT}",
				menu: oExportMenu,
				lite: true
			});
		},

		createClipboardColumn: function(sId, oApplicationObject, sKeyAttribute, sModelName) {
			var oButton = this.createClipboardToggleButton(oApplicationObject, sKeyAttribute, sModelName);
			oButton.addStyleClass("sapUiInoClipboardRow");
			return new sap.ui.table.Column({
				id: sId,
				width: "34px",
				label: new sap.ui.core.Icon({
					src: "sap-icon://pushpin-off",
					tooltip: "{i18n>BO_APPLICATION_ROW_CLIPBOARD_IN}"
				}),
				tooltip: "{i18n>BO_APPLICATION_ROW_CLIPBOARD_IN}",
				template: oButton,
				customData: [new sap.ui.core.CustomData({
					key: "ignoreExport",
					value: true
				})]
			});
		},

		createClipboardToggleButton: function(oApplicationObject, sKeyAttribute, sModelName, vAriaLabel) {
			if (!sKeyAttribute) {
				sKeyAttribute = oApplicationObject.getApplicationObjectMetadata().nodes["Root"].primaryKey;
			}
			var sKeyPath = "";
			if (!sModelName) {
				sModelName = undefined;
				sKeyPath = sKeyAttribute;
			} else {
				sKeyPath = sModelName + ">" + sKeyAttribute;
			}

			var oButton = new sap.ui.commons.Button({
				icon: {
					parts: [{
						path: sKeyPath,
						type: null
                    }, {
						path: "clipboard>/changed"
                    }],
					formatter: function(vKey, vChanged) {
						return sap.ui.ino.models.core.ClipboardModel.sharedInstance().isInClipboard(oApplicationObject, vKey) ? "sap-icon://pushpin-on" :
							"sap-icon://pushpin-off";
					}
				},
				tooltip: {
					parts: [{
						path: sKeyPath,
						type: null
                    }, {
						path: "clipboard>/changed"
                    }, {
						path: "i18n>CLIPBOARD_OBJECT_IN"
                    }, {
						path: "i18n>CLIPBOARD_OBJECT_NOT_IN"
                    }],
					formatter: function(vKey, vChanged, sTextInClipboard, sTextNotInClipboard) {
						if (sap.ui.ino.models.core.ClipboardModel.sharedInstance().isInClipboard(oApplicationObject, vKey)) {
							return sTextInClipboard;
						}
						return sTextNotInClipboard;
					}
				},
				press: function(oEvent) {
					var vKey = 0;
					var oBindingContext = oEvent.getSource().getBindingContext(sModelName);
					if (oBindingContext) {
						vKey = oBindingContext.getObject()[sKeyAttribute];
					} else {
						vKey = oEvent.getSource().getModel(sModelName).getProperty(sKeyAttribute);
					}
					sap.ui.ino.models.core.ClipboardModel.sharedInstance().toggle(oApplicationObject, vKey);
					oEvent.getSource().invalidate();
				},
				enabled: {
					path: sKeyPath,
					type: null,
					formatter: function(vKey) {
						return vKey > 0;
					}
				},
				lite: true,
				ariaLabelledBy: vAriaLabel
			});

			return oButton;
		},

		createClipboardColumnForIdentity: function(sId, sKeyAttribute, sModelName) {
			var oButton = sap.ui.ino.application.backoffice.ControlFactory.createClipboardToggleButtonForIdentity(sKeyAttribute, sModelName);
			oButton.addStyleClass("sapUiInoClipboardRow");
			return new sap.ui.table.Column({
				id: sId,
				width: "34px",
				label: new sap.ui.core.Icon({
					src: "sap-icon://pushpin-off",
					tooltip: "{i18n>BO_APPLICATION_ROW_CLIPBOARD_IN}"
				}),
				tooltip: "{i18n>BO_APPLICATION_ROW_CLIPBOARD_IN}",
				template: oButton,
				customData: [new sap.ui.core.CustomData({
					key: "ignoreExport",
					value: true
				})]
			});
		},

		createClipboardToggleButtonForIdentity: function(sKeyAttribute, sModelName) {
			var sKeyPath = "";
			var sTypePath = "";
			if (!sModelName) {
				sModelName = undefined;
				sKeyPath = sKeyAttribute;
				sTypePath = 'TYPE_CODE';
			} else {
				sKeyPath = sModelName + ">" + sKeyAttribute;
				sTypePath = sModelName + ">" + "TYPE_CODE";
			}

			return new sap.ui.commons.Button({
				icon: {
					parts: [{
						path: sKeyPath,
						type: null
                    }, {
						path: "clipboard>/changed"
                    }, {
						path: sTypePath
                    }],
					formatter: function(vKey, vChanged, sTypeCode) {
						var oApplicationObject = null;
						if (sTypeCode === USER_TYPE.group) {
							oApplicationObject = sap.ui.ino.models.object.Group;
						} else {
							oApplicationObject = sap.ui.ino.models.object.User;
						}
						return sap.ui.ino.models.core.ClipboardModel.sharedInstance().isInClipboard(oApplicationObject, vKey) ? "sap-icon://pushpin-on" :
							"sap-icon://pushpin-off";
					}
				},
				tooltip: {
					parts: [{
						path: sKeyPath,
						type: null
                    }, {
						path: "clipboard>/changed"
                    }, {
						path: sTypePath
                    }, {
						path: "i18n>CLIPBOARD_OBJECT_IN"
                    }, {
						path: "i18n>CLIPBOARD_OBJECT_NOT_IN"
                    }],
					formatter: function(vKey, vChanged, sTypeCode, sTextInClipboard, sTextNotInClipboard) {
						var oApplicationObject = null;
						if (sTypeCode === USER_TYPE.group) {
							oApplicationObject = sap.ui.ino.models.object.Group;
						} else {
							oApplicationObject = sap.ui.ino.models.object.User;
						}

						if (sap.ui.ino.models.core.ClipboardModel.sharedInstance().isInClipboard(oApplicationObject, vKey)) {
							return sTextInClipboard;
						}
						return sTextNotInClipboard;
					}
				},
				press: function(oEvent) {
					var oIdentity = oEvent.getSource().getBindingContext(sModelName).getObject();
					var vKey = oIdentity[sKeyAttribute];
					var sTypeCode = oIdentity.TYPE_CODE;
					var oApplicationObject = null;
					if (sTypeCode === USER_TYPE.group) {
						oApplicationObject = sap.ui.ino.models.object.Group;
					} else {
						oApplicationObject = sap.ui.ino.models.object.User;
					}
					sap.ui.ino.models.core.ClipboardModel.sharedInstance().toggle(oApplicationObject, vKey);
					oEvent.getSource().invalidate();
				},
				enabled: {
					path: sKeyPath,
					type: null,
					formatter: function(vKey) {
						return vKey > 0;
					}
				},
				lite: true
			});
		}
	});
})();