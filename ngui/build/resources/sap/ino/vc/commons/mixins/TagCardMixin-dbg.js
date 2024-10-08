sap.ui.define(["sap/ino/vc/commons/mixins/FollowMixin"], function(FollowMixin) {
    "use strict";
    
    var TagCardMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    TagCardMixin.navigateToIdea = function(oEvent) {
        var oQuery = {"tags": [{
            "ID": oEvent.getParameter("tagId"),
            "NAME":  window.encodeURIComponent(oEvent.getParameter("tagName")),
            "GROUP_ID": oEvent.getParameter("tagGroupId")
        }]};
        oQuery.tags = JSON.stringify(oQuery.tags);
        this.navigateTo("idealist", {
            "query": oQuery
        }, false, true);
    };
    
    TagCardMixin.navigateToCampaign = function(oEvent) {
        var oQuery = {"tags": [{
            "ID": oEvent.getParameter("tagId"),
            "NAME":  window.encodeURIComponent(oEvent.getParameter("tagName")),
            "GROUP_ID": oEvent.getParameter("tagGroupId")
        }]};
        oQuery.tags = JSON.stringify(oQuery.tags);
        this.navigateTo("campaignlist", {
            query: oQuery
        }, false, true);
    };
    
    TagCardMixin.doFollow = function(oEvent) {
        FollowMixin.onFollow.call(this, oEvent);
        if (this._oPopover && this._oPopover.isOpen()) {
            this._oPopover.close();
        }
    };
    
    return TagCardMixin;
});