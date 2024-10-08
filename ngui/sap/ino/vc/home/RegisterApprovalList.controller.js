sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/ino/controls/IdentityActionCard",
    "sap/ino/commons/models/object/User",
    "sap/m/VBox",
    "sap/m/Link",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ui/model/Filter"
], function(Controller, TopLevelPageFacet, ObjectListFormatter, BaseFormatter, Configuration, JSONModel, Label, IdentityActionCard, User,
	VBox, Link, RegistrationMixin, Filter) {
	"use strict";

	return Controller.extend("sap.ino.vc.home.RegisterApprovalList", jQuery.extend({}, ObjectListFormatter, BaseFormatter, TopLevelPageFacet,
		RegistrationMixin, {
			routes: ["registerapprovallist", "registerapprovallistvariant","campaign-registerapprovallistvariant"],
			formatter: jQuery.extend({}, ObjectListFormatter, BaseFormatter),
			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
			},

			getList: function() {
				return this.byId("registerList");
			},
			bindList: function() {
				var sListId = "registerList";
				var oBindingInfo = this.getView().byId(sListId).getBindingInfo("items");
				this.getView().byId(sListId).bindItems(oBindingInfo);
			},
			onCampaignsListItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("campaign", {
						id: oContext.getProperty("CAMPAIGN_ID")
					});
				}
			},
            // 	ACCESSIBILITY
			onAfterRendering: function() {
				this._initTabs();
			},
			_getTabs: function() {
				return this._tabs;
			},
			_initTabs: function() {
				this._tabs = [];
				// if (this.getAggregation("_campaignLink") && this.getAggregation("_campaignLink").$().length) {
				// 	this._tabs.push(this.getAggregation("_campaignLink").$()[0].id);
				// }
				// if (this.getAggregation("_ideaLink") && this.getAggregation("_ideaLink").$().length) {
				// 	this._tabs.push(this.getAggregation("_ideaLink").$()[0].id);
				// }
				// if (this.getAggregation("followPlaceholder")) {
				// 	this._tabs.push(this.getAggregation("followPlaceholder").$().find("[tabindex=0],button")[0].id);
				// }
			},
			_defaultOnKeyDown: function(oEvent) {
				if (Control.prototype.onkeydown) {
					Control.prototype.onkeydown.apply(this, arguments);
				}
			},
			
            onRouteMatched : function (oEvent) {
				var oArguments = oEvent.getParameter("arguments");
				var sCampaignID = oArguments["id"];
    			var sListId = "registerList";
    			var oBindingInfo = this.getView().byId(sListId).getBindingInfo("items");                
                if(oBindingInfo.filters.length > 1){ 
                    oBindingInfo.filters.pop();
                }                    
                if(sCampaignID){
                var oCampaignFilter = new Filter("CAMPAIGN_ID","EQ",sCampaignID);                    
                     oBindingInfo.filters.push(oCampaignFilter);
                }
                this.getView().byId(sListId).bindItems(oBindingInfo);
                this.setHelp("APPROVAL_LIST");
            },

			onkeydown: function(oEvent) {
				var aTabs = this._getTabs();
				var fnUpdate = this._incr;

				if (oEvent.shiftKey || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
					fnUpdate = this._decr;
				}

				if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
					this.getParent().focus();
				} else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB ||
					oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
					oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
					oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
					oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
					var $Current = jQuery(":focus");
					var iIdx = -1;
					if ($Current && $Current.length > 0) {
						iIdx = aTabs.indexOf($Current[0].id);
						iIdx = fnUpdate(iIdx, aTabs.length - 1);
						this._focus(jQuery("#" + aTabs[iIdx]));

						oEvent.preventDefault();
						oEvent.stopPropagation();
					} else {
						this.getParent().focus();
					}
				} else {
					this._defaultOnKeyDown(oEvent);
				}
			},
			_incr: function(iVal, iMax) {
				iVal++;
				if (iVal > iMax) {
					return 0;
				}
				return iVal;
			},

			/**
			 * @private
			 */
			_decr: function(iVal, iMax) {
				iVal--;
				if (iVal < 0) {
					return iMax;
				}
				return iVal;
			},
			_focus: function(oElement) {
				if (jQuery.type(oElement.focus) === "function") {
					setTimeout(function() {
						oElement.focus();
					}, 0);
				}
			}

		}));
});