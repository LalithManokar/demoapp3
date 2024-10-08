sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/ResizeHandler",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/campaign/mixins/CampaignProfileMixin",
    "sap/ino/vc/campaign/mixins/MilestoneMixin",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"    
], function(Controller, Device, JSONModel, TopLevelPageFacet, Configuration, ResizeHandler, ObjectListFormatter,FollowMixin, RegistrationMixin,  CampaignProfileMixin, MilestoneMixin,Sorter,Filter,FilterOperator) {
	"use strict";
	
	var mLayout = {
		XS: {
			centerProfileContainer: "RegistrationProfileFragment--registrationProfile",
			centerCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers"
		},
		S: {
			leftProfileContainer: "RegistrationProfileFragment--registrationProfile",
			leftCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers"
		},
		M: {
			leftProfileContainer: "RegistrationProfileFragment--registrationProfile",
			leftrCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers"

		},
		L: {
			leftProfileContainer: "RegistrationProfileFragment--registrationProfile",
			leftCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers"
		},
		XL: {
			leftProfileContainer: "RegistrationProfileFragment--registrationProfile",
			leftCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers"
		}
	};
	
	return Controller.extend("sap.ino.vc.campaign.RegistrationHome", jQuery.extend({}, FollowMixin, RegistrationMixin, CampaignProfileMixin, MilestoneMixin, {

		formatter: jQuery.extend({}, this.formatter, ObjectListFormatter),

		// id of control that get initial focus
		//initialFocus: ["backofficeButton--backofficeToogle", "identityProfileFragment--createIdea"],

		onInit: function() {
			Controller.prototype.onInit.apply(this, arguments);
			this.aBusyControls = [this.getView()];
		},

		show: function(oParentView) {
			this._oParentView = oParentView;
			var banner = this.byId('campaignBannerList');
			banner.addEventDelegate({
			    onAfterRendering: function () {
			     //   $(".sapMCrslInner.sapMCrslBottomOffset").height($('#' + banner.getActivePage()).parents('.sapMCrslItem').height() + "px");					    
        //             $('#' + banner.getActivePage()).parents('.sapMCrslItem ').fadeIn().siblings().hide();    
                        $(".sapMCrslInner.sapMCrslBottomOffset").height($('#' + banner.getActivePage()).parents('.sapMCrslItem').height() + "px");					    
						$('#' + banner.getActivePage()).parents('.sapMCrslItem ').fadeIn();                    
				}
			});
			
			//bind contextObj for trigger mail
			this.getView().setModel(new JSONModel({
					ID: this.getView().getBindingContext("data").getProperty("ID"),
					NAME: this.getView().getBindingContext("data").getProperty("SHORT_NAME"),
					_OBJECT_TYPE_CODE: "CAMPAIGN"
				}), "contextObject");
			this.bindMilestone(this.getCampaignId());
			this._bindAdjustCampaignManagerList();
			//this._bindBlogs(this.getCampaignId());		
		},
			_bindBlogs: function() {
				if (this.getCampaignId()) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var sPath = "data>/BlogSearchParams(searchToken=''," +
						"tagsToken=''," +
						"filterName='publishedBlogs')/Results";
					var oBinding = {
						path: sPath,
						template: this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),
						sorter: new Sorter("PUBLISHED_AT", true),
						filters: [new Filter("CAMPAIGN_ID", "EQ", this.getCampaignId())],
						length: 4,
						top: 4
					};
					var that = this;
					if (bIsPhone) {
						var oCarousel = this.byId("blogsFragment--blogsCarousel");
						oCarousel.bindAggregation("pages", oBinding);
					} else {
						var oList = this.byId("blogsFragment--blogsList");
						if (oList) {
							oList.bindItems(oBinding);
							oList.attachEventOnce("updateFinished", function() {
								that.onResizeLayoutChange(null, that._sCurrentLayout);
							});
						}
					}
					var oTitle = this.byId("blogsFragment--panelBlogTitle");
					oTitle.setText(this.getText("HOMEPAGE_PANEL_CAMPAIGN_BLOGS"));
				}
			},		
		
		getLayout: function(sLayout) {
			return mLayout[sLayout];
		},

		getCampaignId: function() {
			return this.getView().getBindingContext("data") ? this.getView().getBindingContext("data").getProperty("ID") : undefined;
		},

		_bindBannerList: function() {
			var oBannerList = this.byId("campaignBannerList");
			if (oBannerList.getAggregation("pages") && oBannerList.getAggregation("pages").length && oBannerList.getAggregation("pages")[0]) {
				var oBinding = oBannerList.getBindingInfo("pages");
				oBannerList.bindAggregation("pages", oBinding);
			}
		},
		
		onNavigateToManagers: function(oEvent) {
		    	this.navigateTo("campaign-managerlist", {
				id: this.getCampaignId()
			});
		},

		onAfterShow: function() {
			this._bindBannerList();
		},
		
		onChangePage: function(event){
		    var parameters = event.getParameters();
		    var newPage = parameters.newActivePageId;
		    $(".sapMCrslInner.sapMCrslBottomOffset").height($('#' + newPage).parents('.sapMCrslItem').height() + "px");
		    $('#' + newPage).parents('.sapMCrslItem').fadeIn().siblings().hide().fadeIn();
		},
		_bindAdjustCampaignManagerList: function(){
			    var bHasHomePageSetting = !!this.getView().getBindingContext("data").getProperty("MANAGER_HAS_DISPLAY_HOMEPAGE_SETTING");
				var oCampaignManagerBind = this.byId("CampaignManagersFragment--CampaignManagersList").getBindingInfo("items");
				if(bHasHomePageSetting){
				   oCampaignManagerBind.sorter = [];
				   var oCampMgrFilter = new Filter("DISPLAY_HOMEPAGE","EQ",1);
				   oCampaignManagerBind.filters = oCampMgrFilter;
				}
				this.byId("CampaignManagersFragment--CampaignManagersList").bindItems(oCampaignManagerBind);
		}
	}));
});