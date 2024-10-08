sap.ui.define([
    "sap/ino/vc/idea/List.controller",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/vc/campaign/mixins/CampaignInstanceRolesMixin"
], function(IdeaList,
	TopLevelPageFacet,
	Device,
	Configuration,
	JSONModel,
	PropertyModel,
	CampaignInstanceRolesMixin) {
	"use strict";

	return IdeaList.extend("sap.ino.vc.campaign.CampaignIdeaList", jQuery.extend({}, CampaignInstanceRolesMixin, TopLevelPageFacet, {
		/* Controller reacts when these routes match */
		routes: ["campaign-idealist", "campaign-idealistvariant"],

		onInit: function() {
			IdeaList.prototype.onInit.apply(this, arguments);
			this.setViewProperty("/HIDE_CAMPAIGN_FILTER", true);
		},

		onRouteMatched: function(oEvent) {
			this.setGlobalFilter([]);

			var oArguments = oEvent.mParameters.arguments;
			var oQuery = oArguments["?query"] || {};
			oQuery.campaign = oArguments.id;
			oQuery.variant = oArguments.variant;

			var that = this;
			var iImageId;
			var iSmallImageId;
			var oView = this.getView();

			var fnInit = function() {
				that.updateBackgroundColor(oView.getBindingContext("data").getProperty("COLOR_CODE"));
				iImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_BACKGROUND_IMAGE_ID");
				iSmallImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
				that.setBackgroundImages(iImageId, iSmallImageId);

				that.show((this.getRoute() === "campaign-idealist") ? "idealist" : "idealistvariant", oQuery);
				that.getCampaignInstanceRolesData(that._iCampaignId);
			};

			var fnSetVariantVisibility = function(oEvnt) {
				// set visibility information of variants in filter sidebar
				var oProps = oEvnt.getSource();
				var aVariants = that.getModel("list").getProperty("/Variants/Values");

				// for (var i = 0; i < aVariants.length; i += 1) {
				// 	var oVariant = aVariants[i];
				// 	var bIsManage = oVariant.MANAGE || false;
				// 	var bIsExpert = oVariant.EXPERT || false;
				// 	var bIsCampaignManage = oVariant.CAMPAIGN_MANAGE || false;

				// 	var bVisible = (!bIsManage && !bIsExpert && !bIsCampaignManage) ||
				// 		// user has expert role and variant is for experts
				// 		(bIsExpert && oProps.getProperty("/nodes/Root/customProperties/expertInCampaign")) ||
				// 		// user has campaign manager role and variant is for campaign manager
				// 		(bIsCampaignManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager") && Configuration.getSystemSetting(
				// 			"sap.ino.config.REWARD_ACTIVE") === "1") ||
				// 		// user has general backoffice privileges and variant has manage flag
				// 		(bIsManage && oProps.getProperty("/nodes/Root/customProperties/backofficeCampaignPrivilege")) ||
				// 		bIsManage;
				// 	that.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
				// }

				oProps.destroy();
			};

			this._iCampaignId = parseInt(oArguments.id, 10);

			// static privilege is needed to technically access campaign properties
			if (Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
				var oTemp = new PropertyModel("sap.ino.xs.object.campaign.Campaign", this._iCampaignId, {
					nodes: ["Root"]
				}, false, fnSetVariantVisibility);
			}

			this.bindCampaignODataModel(this._iCampaignId, fnInit);
		},

		onAfterShow: function() {
			this._bPreviouslyFullscreen = this.getFullScreen();
			if (!this._bPreviouslyFullscreen) {
				this.setFullScreen(true);
			}
		},

		onBeforeHide: function() {
			this.setFullScreen(this._bPreviouslyFullscreen);
		},

		hasBackgroundImage: function() {
			return true;
		},

		onVariantPress: function(sVariantAction) {
			if (!Device.system.desktop) {
				//no navigation on mobile phones yet
				return;
			}

			var oQuery = this.getQuery();

			// do not show invalid filters in URL => they are ignored, but we don't want to confuse users
			this.removeInvalidFilters(oQuery);

			// remove campaign filter
			delete oQuery.campaign;

			if (sVariantAction) {
				this.navigateTo(this.getRoute(true), {
					id: this._iCampaignId,
					variant: sVariantAction,
					query: oQuery
				}, true, true);
			} else {
				this.navigateTo(this.getRoute(false), {
					id: this._iCampaignId,
					query: oQuery
				}, true, true);
			}
		},

		navigateIntern: function(oQuery, bReplace) {
			var sVariant = this.getViewProperty("/List/VARIANT");

			this.navigateTo(this.getCurrentRoute(), {
				"variant": sVariant,
				"query": oQuery,
				"id": this._iCampaignId
			}, bReplace, true);
		},

		bindTagCloud: function() {
			var oBindingParameter = this.getBindingParameter();
			var sPath = Configuration.getTagcloudServiceURL(oBindingParameter.CampaignId, oBindingParameter.TagIds, oBindingParameter.SearchTerm,
				oBindingParameter.VariantFilter, !this.includeDrafts(), undefined, oBindingParameter.Filters);
			var oController = this;
			// check whether refresh is necessary
				if (this._lastTagServicePath !== sPath) {
					var oTagModel = new JSONModel(sPath);
					var sOtherTxt = this.getText("IDEA_LIST_MIT_FILTER_TAG_OTHER");
					oTagModel.attachRequestCompleted(null, function() {
						var oRankedTag = oTagModel.getData().RANKED_TAG || [];
						var aTagGroup = oTagModel.getData().TAG_GROUP;
						var oTagData = oController.groupByTagGroup(oRankedTag, oController.getViewProperty("/List/TAGS"), sOtherTxt);
						jQuery.each(oTagData, function(element, object) {
							if (object.GROUP_NAME === "Other") {
								aTagGroup.push(object);
							}
						});
						oController.setTagCloudProperty(oTagData, oTagModel.getData().WITHOUT_GROUP !== "X");
						oTagModel.setData({
							"RANKED_TAG": oTagData,
							"TAG_GROUP": aTagGroup
						}, false);
						this.setFilterModel(oTagModel, "tag");
					}, this);
				}
				// swap last path for refresh checking
				this._lastTagServicePath = sPath;
		},

		bindCampaignODataModel: function(iId, fnCallback) {
			var that = this;
			var sEntitySet = "CampaignFull";

			if (iId > 0) {
				this.getView().bindElement({
					path: "data>/" + sEntitySet + "(" + iId + ")",
					events: {
						dataRequested: function() {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(true);
								}
							});
						},
						dataReceived: function() {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(false);
								}
							});
							if (typeof fnCallback === "function") {
								fnCallback.apply(that);
							}
						}
					}
				});

				// if no request is needed, immediately trigger the callback
				if (typeof fnCallback === "function") {
					var oContext = this.getView().getBindingContext("data");
					if (oContext && oContext.getPath() === ("/" + sEntitySet + "(" + iId + ")")) {
						fnCallback.apply(that);
					}
				}
			}
		}
	}));
});