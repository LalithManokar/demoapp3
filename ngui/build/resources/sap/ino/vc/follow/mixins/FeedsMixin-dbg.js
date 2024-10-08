sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/ino/controls/IdentityActionCard",
    "sap/ino/vc/commons/mixins/IdentityQuickviewMixin"
], function(Configuration, JSONModel, Label, IdentityActionCard,IdentityQuickviewMixin) {
    "use strict";
    
    var FeedsMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
	FeedsMixin.onOpenActor = function(oEvent) {
		var oSource = oEvent.getSource();
		var sModelName = oSource.getBindingInfo("text") && oSource.getBindingInfo("text").parts[0].model || "data";
		var iIdentityId = oSource.getBindingContext(sModelName).getProperty("ACTOR_ID");
		if (!this.oIdentityCardView) {
			this.oIdentityCardView = sap.ui.xmlview({
				viewName: "sap.ino.vc.iam.IdentityCard"
			});
			this.getView().addDependent(this.oIdentityCardView);
		}
		this.oIdentityCardView.getController().open(oSource, iIdentityId);
	};
	
    /**
     * adds identity list item in panel
     * 
     * @private
     * @param   {object}    oSourceCtrl     the originating source control
     * @param   {int}       iIdentId         an identity ID
     */
    FeedsMixin._createPanelIdentity = function(oSourceCtrl, iIdentId) {
        var oSourceCtrl2 = oSourceCtrl;
        var oCtrl;
        
//         if (iIdentId) {
//             var sPath = "/Identity(" + iIdentId + ")";
//             var that = this;
//             var oDatamodel = this.getModel("data");
// 			oDatamodel.read(sPath, {
// 			    async: true,
// 				success: function(oData) {
// 				    var iImgId = oData.IDENTITY_IMAGE_ID;
// 				    var sUserName = oData.NAME;
// 				    oSourceCtrl2.removeAllContent();
// 					oCtrl = new IdentityActionCard({
//                         identityId: iIdentId,
//                         userImageUrl: iImgId ? that.formatter.userImage(iImgId) : null,
//                         userName: sUserName,
//                         actionable: false,
//                         pinnable: that.getModel("clipboard").getProperty("/enabled"),
//                         isPinned: that.formatIsUserInClipboard(iIdentId),
//                         pinPressed: [that.onUserPinPressed, that],
//                         identityPress: [that.onOpenIdentityQuickView, that]
//                     });
//                     oSourceCtrl2.addContent(oCtrl);
// 				},
// 				error: function() {
// 				  // idea has been deleted
// 				    oSourceCtrl2.removeAllContent();
//                     oCtrl = new Label({text: {path: "i18n>ACTIVITIES_MSG_TAG_NON_EXISTENT"}});
//                     oCtrl.addStyleClass("sapInoFeedDetailBox");
//                     oSourceCtrl2.addContent(oCtrl);  
// 				}
// 			});
//         } else {
//             // idea has been deleted
//             oSourceCtrl2.removeAllContent();
//             oCtrl = new Label({text: this.getText("ACTIVITIES_MSG_TAG_NON_EXISTENT")});
//             oCtrl.addStyleClass("sapInoFeedDetailBox");
//             oSourceCtrl2.addContent(oCtrl);
//         }
    };
    
    /**
     * adds tag to panel
     * 
     * @private
     * @param   {object}    oSourceCtrl     the originating source control
     * @param   {int}       iTagId          an tag ID
     */ 
    FeedsMixin._createPanelTag = function(oSourceCtrl, iTagId) {
        var oSourceCtrl2 = oSourceCtrl;
        var oCtrl;
        
        if (iTagId) {
            var sPath = "/SearchTagsAllFull(searchToken='',ID=" + iTagId + ")/";
            var that = this;
            var oDatamodel = this.getModel("data");
			oDatamodel.read(sPath, {
			    async: true,
				success: function() {
				    oSourceCtrl2.removeAllContent();
					oCtrl = that.getFragment("sap.ino.vc.tag.fragments.TagCard").clone();
                    oCtrl.addStyleClass("sapInoFeedDetailBox");
                    oCtrl.bindElement({path: "data>/SearchTagsAllFull(searchToken='',ID=" + iTagId + ")"});
                    oSourceCtrl2.addContent(oCtrl);
				},
				error: function() {
				  // idea has been deleted
				    oSourceCtrl2.removeAllContent();
                    oCtrl = new Label({text: {path: "i18n>ACTIVITIES_MSG_TAG_NON_EXISTENT"}});
                    oCtrl.addStyleClass("sapInoFeedDetailBox");
                    oSourceCtrl2.addContent(oCtrl);  
				}
			});
            
        } else {
            // idea has been deleted
            oSourceCtrl2.removeAllContent();
            oCtrl = new Label({text: this.getText("ACTIVITIES_MSG_TAG_NON_EXISTENT")});
            oCtrl.addStyleClass("sapInoFeedDetailBox");
            oSourceCtrl2.addContent(oCtrl);
        }
    };
    
    /**
     * adds attachment to panel
     * 
     * @private
     * @param   {object}    oSourceCtrl     the originating source control
     * @param   {int}       iAttachmentId         an attachment ID
     */ 
    FeedsMixin._createPanelAttachment = function(oSourceCtrl, iAttachmentId, sAttachmentType, bInternalAttachment) {
        var oSourceCtrl2 = oSourceCtrl;
        var oCtrl;
        var that = this;
        if (iAttachmentId) {
            var sPath = "/" + ( sAttachmentType === "CAMPAIGN" ? "Campaign" : "Idea") + (bInternalAttachment ? "Internal" : "") + "Attachment(" + iAttachmentId + ")/";
            var oDatamodel = this.getModel("data");
			oDatamodel.read(sPath, {
				async: true,
				success: function() {
				    oSourceCtrl2.removeAllContent();
				    // add suffix id to make attachment url work
					oCtrl = that.getFragment("sap.ino.vc.attachment.fragments.AttachmentListItem").clone((new Date()).getTime() + "-0");
                    oCtrl.bindElement({path: "data>" + sPath});
                    oSourceCtrl2.addContent(oCtrl);
				},
				error: function() {
				  // attachment has been deleted
				    oSourceCtrl2.removeAllContent();
                    oCtrl = new Label({text: {path: "i18n>ACTIVITIES_MSG_ATTACHMENT_NON_EXISTENT"}});
                    oCtrl.addStyleClass("sapInoFeedDetailBox");
                    oSourceCtrl2.addContent(oCtrl);  
				}
			});
        } else {
            // blog has been deleted
            oSourceCtrl2.removeAllContent();
            oCtrl = new Label({text: this.getText("ACTIVITIES_MSG_ATTACHMENT_NON_EXISTENT")});
            oCtrl.addStyleClass("sapInoFeedDetailBox");
            oSourceCtrl2.addContent(oCtrl);
        }
        
    };
    
    /**
     * opens wall
     */ 
    FeedsMixin.onOpenWall = function(oEvent) {
        var iWallId = oEvent.getSource().getBindingContext("data").getProperty("INVOLVED_ID");
        if (iWallId) {
            this.navigateToWall("wall", {id : iWallId});
        }
    };
    
    FeedsMixin._onAfterRendering = function(oEvent) {
	    var oSource = oEvent.getSource();
	    var sModelName = oSource.getBindingInfo("content") && oSource.getBindingInfo("content").parts[0].model || "data";
	    var oBindingContext = oSource.getBindingContext(sModelName);
	    var sInvolvedObjectType = oBindingContext.getProperty("INVOLVED_OBJ_TYPE_CODE");
	    var sInvolvedObjectId = oBindingContext.getProperty("INVOLVED_ID");
	    var sObjectType = oBindingContext.getProperty("OBJECT_TYPE_CODE");
	    var sObjectId = oBindingContext.getProperty("OBJECT_ID");
	    var oSourceCtrl = oSource.getParent().getParent().getItems();
	    var bInternalAttachment = oBindingContext.getProperty("FILTER_TYPE_CODE") === "BACKOFFICE";
	    oSourceCtrl = oSourceCtrl[oSourceCtrl.length - 1];
	    if(sObjectType === "TAG"){
	        this._createPanelTag(oSourceCtrl, sObjectId);
	    }else if(sInvolvedObjectType === "TAG"){
	        this._createPanelTag(oSourceCtrl, sInvolvedObjectId);
	    }
	    if(sInvolvedObjectType === "ATTACHMENT" || sInvolvedObjectType === "TITLE_IMAGE" || sInvolvedObjectType === "BACKGROUND_IMAGE" || sInvolvedObjectType === "CAMPAIGN_LIST_IMAGE"){
	        this._createPanelAttachment(oSourceCtrl, sInvolvedObjectId, sObjectType, bInternalAttachment);
	    }
	   // if(sInvolvedObjectType === "WALL"){
	   //     this._createPanelWall(oSourceCtrl, sInvolvedObjectId);
	   // }
	    if(sInvolvedObjectType === "EXPERT" || sInvolvedObjectType === "CONTRIBUTOR" || sInvolvedObjectType === "COACH"){
	        this._createPanelIdentity(oSourceCtrl, sInvolvedObjectId);
	    }
	};
    
    return FeedsMixin;
});