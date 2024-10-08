/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.views.common.CommentView");
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignComment", jQuery.extend({}, sap.ui.ino.views.common.CommentView, sap.ui.ino.views.common.MessageSupportView, {
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignComment";
    },
    createContent : function() {
        var controller = this.getController();
        return this.createViewContent(controller);
    },

    setHistoryState : function(oHistoryState) {
        this.getController().setHistoryState(oHistoryState);
        this.getController().setCommentModel();
        this.refreshComments();
    },

    init : function() {
        this.initMessageSupportView();
    },

    exit : function() {
        this.exitMessageSupportView();
        sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
    },

}

));