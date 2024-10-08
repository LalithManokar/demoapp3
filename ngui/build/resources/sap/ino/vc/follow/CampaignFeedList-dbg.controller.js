sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/m/Label",
    "sap/ino/controls/IdentityActionCard",
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/commons/models/object/User",
    "sap/m/VBox",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/follow/mixins/FeedsMixin"
], function(Controller, FeedFormatter, TopLevelPageFacet, Label, IdentityActionCard, ClipboardModel, User, VBox, RegistrationMixin,
	JSONModel, Configuration,
	TagCardMixin, VoteMixin, FollowMixin, VolunteerMixin, FeedsMixin) {
	"use strict";

	return Controller.extend("sap.ino.vc.follow.CampaignFeedList", jQuery.extend({}, FeedFormatter, RegistrationMixin, TagCardMixin,
		TopLevelPageFacet, FeedsMixin, {
			formatter: jQuery.extend({}, this.formatter, FeedFormatter),

			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
			},

			onRouteMatched: function(oEvent) {
				var oArgs = oEvent.getParameter("arguments");
				this.iCampaignId = parseInt(oArgs.id, 0);
				this.bindList();
			},

			getList: function() {
				return this.byId("campaignFeedList");
			},

			bindList: function() {
				var self = this;
				var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/feed.xsjs";
				var aParameter = [];
				var oFeedList = this.byId("campaignFeedList");
				
				oFeedList.setBusy(true);
				if (this.iCampaignId) {
					aParameter.push("campaign=" + this.iCampaignId);
				}

				if (aParameter.length > 0) {
					sPath = sPath + "?" + aParameter.join("&");
				}

				var oFeedModel = new JSONModel(sPath);
				
				oFeedModel.attachRequestCompleted(null, function() {
				    oFeedList.setBusy(false);
				    if(oFeedModel.oData.results) {
    				      jQuery.each(oFeedModel.oData.results, function(iIndex, oFeed) {
    				        oFeed.EVENT_AT = new Date(oFeed.EVENT_AT);
    				      });
				    }
				    self.getView().setModel(oFeedModel, "feed");  
				}, oFeedModel);
			},

			onRefresh: function() {
				this.bindList();
			}
		}));
});