sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/commons/mixins/MailMixin",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ui/Device",
    "sap/ino/commons/models/object/PersonalizeSetting",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/vc/commons/mixins/UserGroupMixin",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ui/core/format/NumberFormat",
    "sap/ino/vc/iam/mixins/NotificationSettingMixin",
    "sap/ino/vc/iam/mixins/FeedsSettingMixin",
    "sap/ino/vc/iam/mixins/ProfileDataMixin",
    "sap/ino/vc/iam/mixins/UserCommonMixin",
    "sap/ino/controls/QuickViewGroupDimension",
    "sap/ui/core/format/DateFormat",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
], function(BaseController, MailMixin, JSONModel, Configuration, Device, PersonalizeSetting, MessageBox, MessageToast, Attachment,
	CodeModel,
	UserGroupMixin, BaseFormatter, NumberFormat, NotificationSettingMixin, FeedsSettingMixin, ProfileDataTestMixin, UserCommonMixin,
	QuickViewGroupDimension,DateFormat, exportLibrary, Spreadsheet) {
	"use strict";

	return BaseController.extend("sap.ino.vc.iam.mySetting", jQuery.extend({}, UserGroupMixin, NotificationSettingMixin, ProfileDataTestMixin,
		FeedsSettingMixin, UserCommonMixin, {
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
					if (sNavigationTarget !== "expertfinder") {
						return bVisible;
					} else {
						return bVisible && (this.getView().getModel("config").oData["sap.ino.config.EXPERT_FINDER_ACTIVE"] === "1");
					}
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

			}, BaseController.prototype.formatter),

			requestQueue: [],

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);

				this.setViewProperty("/EDIT", true);
				this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());

				this.aBusyControls = [this.byId("userSettings")];

				var oSystemSetting = Configuration.getSystemSettingsModel();
				this.isEnableNewNotification = oSystemSetting.getProperty("/sap.ino.config.ENABLE_NEW_NOTIFICATION") === "0" ? false : true;
				this.setViewProperty("/ENABLE_NEW_NOTIFICATION", this.isEnableNewNotification);
				this.enableFeedEmail = oSystemSetting.getProperty("/sap.ino.config.SWITCH_OFF_FEED_EMAIL") === "0" ? true : false;
				this.setViewProperty("/ENABLE_FEED_EMAIL", this.enableFeedEmail);
			},

			onBeforeRendering: function() {
				this.getProfileData();
				this.getPersonalizeSetting();

				if (this.isEnableNewNotification) {
					this.getNewNotificationSetting();
					// 	this.getNewFeedsSetting();
				} else {
					this.getNotificationSetting();
					// 	this.getFeedsSetting();
				}
				this.getNewFeedsSetting();
				this.bindIdentityLog();
				this.getMemberGroup();
				this.bindUserGroup();
				this.getProfileDataSetting();
			},

			onAfterRendering: function() {

			},

			getPersonalizeSetting: function() {
				var self = this;
				var defaultData = PersonalizeSetting.defaultPesonalize;
				PersonalizeSetting.getSettings().done(function(data) {
					var settingData = $.extend(defaultData, data.RESULT || {});
					self.getView().setModel(new JSONModel(settingData), 'PERSONALIZE');
					Configuration.setPersonalize(settingData);
				});
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
				});
			},
			onSettingTabSelect: function(oEvent) {
				var oSource = oEvent.getSource();
				var oSelectedKey = oSource.getSelectedKey();
				if (oSelectedKey.indexOf('mySettingIdentityCardPage') > -1) {
					this.getProfileData();
				}

			},
			
			getProfileData: function() {
				var self = this;
				var iId = Configuration.getCurrentUser().USER_ID;
				self._oIdentityModel = new JSONModel();
				if (Configuration.getUserProfileByTextURL(iId)) {
					self._oIdentityModel.loadData(Configuration.getUserProfileByTextURL(iId), {
						"USER_ID": iId
					}, true, "GET");
					self._oIdentityModel.attachRequestCompleted(null, function() {
						var indentityData = self._oIdentityModel.getData();
						var identityLogList = self.byId("identityLogList");
                         indentityData.open_group = Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1;						
				    	indentityData.ENABLE_GAMIFICATION = self.getView().getModel("config").getProperty("/ENABLE_GAMIFICATION") === 1 ? true : false;
						self._oIdentityModel.setData(indentityData);
						self.getView().setModel(self._oIdentityModel, "identityData");
						if (indentityData.ENABLE_GAMIFICATION) {
							self.constructGamificationDimension(self._oIdentityModel, self.byId('mySettingIdentityCardPage'));
						}
						if (identityLogList) {
							identityLogList.bindItems({
								path: "data>/" + this.getIdentityEntityName() + "(" + iId + ")/IdentityLog",
								sorter: new sap.ui.model.Sorter("CHANGED_AT", true),
								template: this.getFragment("sap.ino.vc.iam.fragments.IdentityLogTemplate")
							});
						}
					}, self);
				}
			},
            
            exportProfileData: function() {
                var EdmType = exportLibrary.EdmType;
                var aCols = [];
                var oRowBinding, oSettings, oSheet,fileName;
				var self = this;
				var iId = Configuration.getCurrentUser().USER_ID;
				
				self._oIdentityModel = new JSONModel();
				if (Configuration.getUserProfileByTextURL(iId)) {
					self._oIdentityModel.loadData(Configuration.getUserProfileByTextURL(iId), {
						"USER_ID": iId
					}, true, "GET");
					self._oIdentityModel.attachRequestCompleted(null, function() {
						var indentityData = self._oIdentityModel.getData();
            			aCols=[
            			    {
                				label: self.getText("USER_DETAILS_FIRST_NAME"),
                				property: 'Firstname',
                				type: EdmType.String
            			    },
            			    {
                				label: self.getText("SORT_MIT_LAST_NAME"),
                				property: 'Lastname',
                				type: EdmType.String
            			    },
            			    {
                				label: self.getText("IDEA_LIST_REWARD_LIST_GAMIFICATION_FLD_FULL_NAME"),
                				property: 'Fullname',
                				type: EdmType.String
            			    },
            			    {
                				label: self.getText("IDEA_LIST_REWARD_LIST_GAMIFICATION_FLD_USER_NAME"),
                				property: 'Username',
                				type: EdmType.String
            			    },
            			    {
                				label: self.getText("SORT_MIT_VALID_TO"),
                				property: 'Validationto',
                				type: EdmType.String
            			    },
                			{
                				label: self.getText("USER_DETAILS_PHONE"),
                				property: 'Phone',
                				type: EdmType.String
            			    },
            			    {
                				label: self.getText("USER_DETAILS_EMAIL"),
                				property: 'Email',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_MOBILE"),
                				property: 'Mobile',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_COST_CENTER"),
                				property: 'Costcenter',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_COMPANY"),
                				property: 'Company',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_OFFICE"),
                				property: 'Office',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_ORGANIZATION"),
                				property: 'Organization',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_COUNTRY"),
                				property: 'Country',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_ZIP_CODE"),
                				property: 'Zipcode',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_CITY"),
                				property: 'City',
                				type: EdmType.String
                			},
                			{
                				label: self.getText("USER_DETAILS_STREET"),
                				property: 'Street',
                				type: EdmType.String
                			}];
            			
            			oRowBinding = [{
                            Lastname:indentityData.LAST_NAME,
                            Firstname:indentityData.FIRST_NAME,
                            Username:indentityData.USER_NAME,
                            Fullname:indentityData.NAME,
                            Costcenter:indentityData.CORP_INFO.COST_CENTER,
                            Mobile:indentityData.CONTACT_DETAIL.MOBILE,
                            Email:indentityData.CONTACT_DETAIL.EMAIL,
                            Validationto:indentityData.VALIDATION_TO,
                            Phone:indentityData.CONTACT_DETAIL.PHONE,
                            Office:indentityData.CORP_INFO.OFFICE,
                            Company:indentityData.CORP_INFO.COMPANY,
                            Organization:indentityData.ORGANIZATION,
                            Street:indentityData.ADDR_INFO.STREET,
                            City:indentityData.ADDR_INFO.CITY,
                            Country:indentityData.ADDR_INFO.COUNTRY,
                            Zipcode:indentityData.ADDR_INFO.ZIP_CODE
                        }];
                        var oDateFormat = DateFormat.getDateTimeInstance({
                            pattern: "dd-MM-yyyy_HH-mm"
                          });
                        fileName = self.getText('USER_DETAILS_MY_PERSONAL_DATA')+oDateFormat.format(new Date())+".xlsx";
                        oSettings = {
            				workbook: {
            					columns: aCols
            				},
            				dataSource: oRowBinding,
            				fileName: fileName
            			};
                        oSheet = new Spreadsheet(oSettings);
            			oSheet.build().finally(function () {
            				oSheet.destroy();
            			});
					}, self);
					
				} 


			},
            
			bindIdentityLog: function() {
				var iId = Configuration.getCurrentUser().USER_ID;
				if (this.byId("changeHistoryLog")) {
					this.byId("changeHistoryLog").bindItems({
						path: "data>/" + this.getIdentityEntityName() + "(" + iId + ")/IdentityLog/Results"
					});
				}
			},

			getMemberGroup: function() {
				var self = this;
				var openGroup = Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1;
				self.setModel(new JSONModel(openGroup), 'identityData>/open_group');
				if (openGroup) {
					if (!this.requestQueue.length) {
						this.requestQueue.push(this.getMemberGroups());
						this.requestQueue[0].done(function(data) {
							self.setModel(new JSONModel(data), 'identityData>/groups');
						});
					}
				}

				this.getMemberGroups().done(function(data) {
					self.setModel(new JSONModel(data), 'identityData>/groups');
				});
			},

			bindUserGroup: function() {
				var self = this;
				var view = this.getView();
				var groupTable = view.byId('mySettingUserGroup--userGroupTable');
				var groupRequire = this._bindUserGroupModel();
				groupTable.getBinding('rows').filter([]);
				groupRequire.attachRequestCompleted(function() {
					self.reBindSelectedData(groupTable);
				});
			},

			saveUserGroup: function() {
				var self = this;
				var view = this.getView();
				var groupTable = view.byId('mySettingUserGroup--userGroupTable');
				this.putGroupSelected(groupTable).done(function() {
				    var oTable = self.getView().byId('mySettingUserGroup--userGroupTable');
		            var tableData = oTable.getModel('USER_GROUPS').getData();
		            var selectedNoneGorup = tableData.SELECTED_NONE || false;	
		            if(oTable.getSelectedIndices().length === 0 && !selectedNoneGorup){
		                MessageToast.show(self.getText('USER_GROUP_UNSELECT_SUCCESS'));
		            } else {
					MessageToast.show(self.getText('USER_GROUP_SELECT_SUCCESS'));
		            }
				});
			},

			getIdentityEntityName: function() {
				return "Identity";
			},
			constructGamificationDimension: function(oModel, oIdentityCardPage) {
				var oQuickViewDimensionCtrl, sImageUrl, sStartLevel, sEndLevel, iDiffPointsBTlvl, iPointsToNextLvl, currentPointsBWBadge;
				if (!oIdentityCardPage) {
					return;
				}
				oQuickViewDimensionCtrl = oIdentityCardPage.getContent()[0];
				var aDimensions = oModel.getData().GAMIFICATION_INFO;
				oQuickViewDimensionCtrl.removeAllDimensionGroups();
				if (!Array.isArray(aDimensions)) {
					return;
				}
				for (var i = 0; i < aDimensions.length; i++) {
					sStartLevel = "";
					sEndLevel = "";
					iDiffPointsBTlvl = 0;
					iPointsToNextLvl = 0;
					sImageUrl = "";
					currentPointsBWBadge = 0;
					if (JSON.stringify(aDimensions[i].BADGE) !== "{}") {
						sStartLevel = aDimensions[i].BADGE.currentBadge.NAME;
						sEndLevel = !aDimensions[i].BADGE.nextBadge.NAME ? "" : aDimensions[i].BADGE.nextBadge.NAME;

						if (aDimensions[i].BADGE.nextBadge.NAME && aDimensions[i].BADGE.currentBadge.NAME) {
							iDiffPointsBTlvl = aDimensions[i].BADGE.nextBadge.BADGE_VALUE - aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
						}
						if (aDimensions[i].BADGE.nextBadge.NAME && !aDimensions[i].BADGE.currentBadge.NAME) {
							iDiffPointsBTlvl = aDimensions[i].BADGE.nextBadge.BADGE_VALUE;
						}
						if (!aDimensions[i].BADGE.nextBadge.NAME && aDimensions[i].BADGE.currentBadge.NAME) {
							iDiffPointsBTlvl = aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
						}

						iPointsToNextLvl = aDimensions[i].BADGE.nextBadge.NAME ? aDimensions[i].BADGE.nextBadge.BADGE_VALUE - parseInt(aDimensions[i].TOTAL,
							10) : 0;

						if (JSON.stringify(aDimensions[i].BADGE.currentBadge) !== "{}" && aDimensions[i].BADGE.currentBadge.Attachment.length > 0) {
							sImageUrl = Configuration.getAttachmentTitleImageDownloadURL(aDimensions[i].BADGE.currentBadge.Attachment[0].ATTACHMENT_ID);
						}
						if (JSON.stringify(aDimensions[i].BADGE.currentBadge) !== "{}") {
							var iDiffTotalBWBadge = parseInt(aDimensions[i].TOTAL, 10) - aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
							currentPointsBWBadge = iDiffTotalBWBadge > 0 ? iDiffTotalBWBadge : parseInt(aDimensions[i].TOTAL, 10);
						} else {
							currentPointsBWBadge = parseInt(aDimensions[i].TOTAL, 10);
						}
					}

					oQuickViewDimensionCtrl.addDimensionGroup(new QuickViewGroupDimension({
						heading: aDimensions[i].NAME,
						headingIcon: sImageUrl,
						totalPoints: parseInt(aDimensions[i].TOTAL, 10),
						pointsToNextLevel: iPointsToNextLvl,
						startLevel: sStartLevel, //aDimensions[i].currentBadge.NAME,
						nextLevel: sEndLevel, //aDimensions[i].nextBadge.NAME,
						currentPointsBWBadge: currentPointsBWBadge,
						diffPointsToNextLevel: iDiffPointsBTlvl,
						dimensionUnit: aDimensions[i].UNIT,
						redeemPoints: aDimensions[i].TOTAL_FOR_REDEEM,
						redeemEnabled: !!aDimensions[i].REDEEM
					}));
				}

			}
		}));
});