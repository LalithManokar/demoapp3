/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.views.common.CommentController");
jQuery.sap.require("sap.ui.ino.models.object.CampaignComment");

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignComment", jQuery.extend({}, sap.ui.ino.views.common.CommentController, {
    getCommentTemplate : function(iId) {
        return new sap.ui.ino.models.object.CampaignComment({
            OBJECT_ID : iId
        });
    },

    setHistoryState : function(oHistoryState) {
        if (oHistoryState && oHistoryState.campaignId) {
            this.campaignId = oHistoryState.campaignId;
        }
        this.getView().refreshComments();
    },

    getCommentsBindingPath : function() {
        return "/CampaignFull(" + this.campaignId + ")/Comments";
    },

    getCommentModelId : function() {
        return this.campaignId;
    },
    
    getAOFObject : function() {
        return sap.ui.ino.models.object.CampaignComment;
    }

}));