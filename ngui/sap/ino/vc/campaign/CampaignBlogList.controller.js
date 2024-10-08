sap.ui.define([
    "sap/ino/vc/blog/List.controller",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/vc/commons/mixins/TagGroupMixin"
], function (BlogList,
             TopLevelPageFacet,
             Device,
             Configuration,
             JSONModel,
             PropertyModel,
             TagGroupMixin) {
    "use strict";
   
    return BlogList.extend("sap.ino.vc.campaign.CampaignBlogList", jQuery.extend({}, TopLevelPageFacet, TagGroupMixin, {
        /* Controller reacts when these routes match */ 
        routes : ["campaign-bloglist", "campaign-bloglistvariant"],
        
        onInit: function () {
            BlogList.prototype.onInit.apply(this, arguments);
            this.setViewProperty("/HIDE_CAMPAIGN_FILTER", true);
            this.setViewProperty("/List/IS_FILTER_SUBPAGE", false);
        },
        
        onRouteMatched : function(oEvent) {
            this.setGlobalFilter([]);
            
            var oArguments = oEvent.mParameters.arguments;
            var oQuery = oArguments["?query"] || {};
            oQuery.campaign = oArguments.id;
            oQuery.variant = oArguments.variant;
            
            var that = this;
            // var iImageId;
            // var iSmallImageId;
            var oView = this.getView();
            
            var fnInit = function() {
                that.updateBackgroundColor(oView.getBindingContext("data").getProperty("COLOR_CODE"));
                //iImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_BACKGROUND_IMAGE_ID");
                // iSmallImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
                // that.setBackgroundImages(iImageId, iSmallImageId);
            
                that.show((this.getRoute() === "campaign-bloglist") ? "bloglist" : "bloglistvariant" , oQuery);    
            };
            
            var fnSetVariantVisibility = function(oEvnt) {
                // set visibility information of variants in filter sidebar
                var oProps = oEvnt.getSource();
                var aVariants = that.getModel("list").getProperty("/Variants/Values");
                
                for (var i = 0; i < aVariants.length; i += 1) {
                    var oVariant = aVariants[i];
                    var bIsManage = oVariant.MANAGE || false;
                    var bVisible =                         
                        // user has general backoffice privileges and variant has manage flag
                        !bIsManage || (bIsManage && oProps.getProperty("/nodes/Root/customProperties/backofficeCampaignPrivilege"));
                    that.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
                }
                
                oProps.destroy();
            };

            this._iCampaignId = parseInt(oArguments.id, 10);

            // static privilege is needed to technically access campaign properties
            if (Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
                var oTemp = new PropertyModel("sap.ino.xs.object.campaign.Campaign", this._iCampaignId, { nodes: ["Root"] }, false, fnSetVariantVisibility);
            }

            this.bindCampaignODataModel(this._iCampaignId, fnInit);
        },
        
        hasBackgroundImage: function(){
            //return true;
            return false;
        },
        
        onVariantPress : function(sVariantAction) {
            if(!Device.system.desktop) {
                //no navigation on mobile phones yet
                return;
            }
            
            var oQuery = this.getQuery();
            
            // do not show invalid filters in URL => they are ignored, but we don't want to confuse users
            this.removeInvalidFilters(oQuery);
            
            // remove campaign filter
            delete oQuery.campaign;

            if (sVariantAction) {
                this.navigateTo(this.getRoute(true), { id : this._iCampaignId, variant: sVariantAction, query : oQuery}, true, true);
            }
            else {
                this.navigateTo(this.getRoute(false), { id : this._iCampaignId, query : oQuery }, true, true);
            }
        },
        
        navigateIntern : function(oQuery, bReplace) {
            var sVariant = this.getViewProperty("/List/VARIANT");
            
            this.navigateTo(this.getCurrentRoute(), {
                "variant" : sVariant,
			    "query" : oQuery,
			    "id" : this._iCampaignId
		    }, bReplace, true);
        },
        
        
        bindTagCloud: function() {
			var oBindingParameter = this.getBindingParameter();
			var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagcloud_blogs.xsjs";
			var oController = this;
			
			var aParameter = [];
			if (this._iCampaignId) {
				aParameter.push("CAMPAIGN=" + this._iCampaignId);
			}
			if (!this.includeDrafts()) {
				aParameter.push("EXCL_STATUS=sap.ino.config.CAMP_DRAFT");
			}
			if (oBindingParameter && oBindingParameter.TagIds) {
				jQuery.each(oBindingParameter.TagIds, function(key, iValue) {
					aParameter.push("TAG=" + iValue);
				});
			}
			if (oBindingParameter.SearchTerm && oBindingParameter.SearchTerm.length > 0) {
				aParameter.push("SEARCHTERM=" + oBindingParameter.SearchTerm);
			}
			if (oBindingParameter.VariantFilter) {
				aParameter.push("FILTERNAME=" + oBindingParameter.VariantFilter);
			}
			if (aParameter.length > 0) {
				sPath = sPath + "?" + aParameter.join("&");
			}
			
			// check whether refresh is necessary
			if (this._lastTagServicePath !== sPath) {
				var oTagModel = new JSONModel(sPath);
				var sOtherTxt = this.getText("BLOG_LIST_MIT_FILTER_TAG_OTHER");
				oTagModel.attachRequestCompleted(null, function() {
					var oRankedTag = oTagModel.getData().RANKED_TAG;
					var oTagData = oController.groupByTagGroup(oRankedTag, oController.getViewProperty("/List/TAGS"), sOtherTxt);
					oController.setTagCloudProperty(oTagData, oTagModel.getData().WITHOUT_GROUP !== "X");
					oTagModel.setData({
						"RANKED_TAG": oTagData
					}, false);
					this.setFilterModel(oTagModel, "tag");
				}, this);
			}
			// swap last path for refresh checking
			this._lastTagServicePath = sPath;
		},
        
        bindCampaignODataModel : function(iId, fnCallback) {
            var that = this;
            var sEntitySet = "CampaignFull";
            
            if (iId > 0) {
                this.getView().bindElement({ 
                    path : "data>/" + sEntitySet + "(" + iId + ")",
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