sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/commons/models/object/User",
    "sap/m/VBox",
    "sap/m/Link",
    "sap/ui/model/Sorter",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/vc/attachment/AttachmentMixin",
    "sap/ino/vc/follow/mixins/FeedsMixin"
], function(Controller, TopLevelPageFacet, Formatter,
ClipboardModel, FollowMixin, User, VBox, Link, Sorter, RegistrationMixin, TagCardMixin, VoteMixin, VolunteerMixin, Attachment, AttachmentMixin, FeedsMixin) {
	"use strict"; 

	return Controller.extend("sap.ino.vc.follow.FeedList", jQuery.extend({},Formatter, RegistrationMixin,FollowMixin, TopLevelPageFacet, TagCardMixin, AttachmentMixin, FeedsMixin, {
		routes: ["feedlist"],
		formatter: Formatter,
		onInit: function() {
			Controller.prototype.onInit.apply(this, arguments);
		},
	    
		onRouteMatched: function() {
		    this.bindList();
		    this.setHelp("FEED_LIST");
		},
		
		bindList: function(){
			var oBindingInfo = this.getList().getBindingInfo("items");
			this.getList().bindItems(oBindingInfo);
		},
		
		getList: function() {
			return this.byId("feedList");
		},
		
		onRefresh: function(){
		    this.bindList();  
		}
		
	}));
});