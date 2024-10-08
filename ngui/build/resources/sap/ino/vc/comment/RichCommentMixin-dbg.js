/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

sap.ui.define([
    "sap/ui/core/mvc/ViewType",
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/IdeaFollow",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Button"
], function(ViewType, BaseObjectController, Configuration, IdeaFollow, MsgToast, MessageBox, Button) {
	"use strict";
	/*
	 * @class Mixin that handles actions for Comment and Internal Note
	 */
	var objectTypeCode = {
		idea: "IDEA",
		campaign: "CAMPAIGN",
		blog: "BLOG"
	};
	var RichCommentMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	RichCommentMixin.defaultRichCommentSetting = {
		commentContainerId: "rteContainer",
		commentInputId: "rteCtrlInput",
		commentListId: "commentList",
		type:"comment",
		successMessageKey: "MSG_CREATE_SUCCESS_COMMENT",
		validateMsgKey: "MSG_CREATE_EMPTY_COMMENT",
		updateMsgKey: "MSG_UPDATE_SUCCESS_COMMENT",
		createReplyMsgKey: "MSG_CREATE_REPLY_SUCCESS_COMMENT",
		editDialogViewName: "sap.ino.vc.comment.RichEditCommentDialog",
		delDialogViewName: "sap.ino.vc.comment.RichDelDialog",
		editAttachmentDialogViewName: "sap.ino.vc.comment.RichAttachmentDialog",
		delReplyConfirmMsgKey: "MSG_COMMENT_REPLY_DEL_CONFIRM",
		delAllDataComfirmMsgKey: "MSG_COMMENT_DELETE_ALL_DATA_CONFIRM",
		delSuccessfulMsgKey: "MSG_COMMENT_DEL_SUCCESS",
		delBtnKey: "COMMENT_OBJECT_BTN_DELETE_COMMENT",
		delBtnAllDataKey: "COMMENT_OBJECT_BTN_DELETE_ALL_DATA"
	};

	RichCommentMixin.richCommentMixinInitRouterEvent = function(oSetting) {
		if (oSetting) {
			this.defaultRichCommentSetting = oSetting;
		}
		this._oRouter = this.getOwnerComponent().getRouter();
		this._oRouter.getRoute(this.routes).attachMatched(this._onCommentMixinRouteMatched, this);
	};

	RichCommentMixin.onExit = function() {
		this._oRouter.getRoute(this.routes).detachMatched(this._onCommentMixinRouteMatched, this);
	};

	RichCommentMixin.richCommentMixinInit = function(oSettings) {
		var oController = this;
		oController._commentMixinSettings = oSettings || this.defaultRichCommentSetting;
		oController._initRTE();
		oController._commentMixinResetCommentModel();
	};

	RichCommentMixin.richCommentMixinSubmit = function() {
		var oView = this.getBlockView();
        var oModel = this.getModel("comment") ?  this.getModel("comment") : this._commentMixinGetCommentModel();
		var sType = oView.data("modelObjectType");

		var sSuccessMessage = this._commentMixinSettings.successMessageKey;
		if (!oModel.getProperty("/COMMENT")) {
			MsgToast.show(this.getText(this._commentMixinSettings.validateMsgKey));
			return;
		}
		oView.setBusy(true);
		oModel.setProperty("/Imgs", this._getImgIds(oModel.getProperty("/COMMENT")));
		var oCreateRequest = BaseObjectController.prototype.executeObjectAction.call(this, "create", {
			messages: {
				success: sSuccessMessage,
				error: function(oServiceResult) {
					if (oServiceResult && oServiceResult.MESSAGES && oServiceResult.MESSAGES.length > 0) {
						MsgToast.show(oServiceResult.MESSAGES[0].MESSAGE_TEXT);
					}
				}
			},
			objectModelExt: oModel
		});
		var oRouter = this.getRouter();
		var that = this;
		oCreateRequest.done(function() {
			if (that.getCurrentRoute() === "idea-display" && (oRouter.getContext().indexOf("sectionComment") > -1 || oRouter.getContext().indexOf(
				"sectionInternal") > -1)) {
				that._commentMixinSetCommentModel(null);
			}
			that._commentMixinResetCommentModel();
			that._commentMixinRefresh();
			that.onVotedFollow(sType);
		});

		oCreateRequest.always(function() {
			oView.setBusy(false);
		});
	};

	RichCommentMixin.richCommentMixinOnUserPressed = function(oEvent) {
		var oSource = oEvent.getSource();
		var oDomRef = oEvent.getParameter("domRef");
		var oContext = oSource.getBindingContext("data");
		var iIdentityId = oContext.getProperty("CHANGED_BY_ID");
		if (oDomRef) {
			var oReferenceControl = sap.ui.getCore().byId(oDomRef.id);
		}
		if (!this.oIdentityCardView) {
			this.oIdentityCardView = sap.ui.xmlview({
				viewName: "sap.ino.vc.iam.IdentityCard"
			});
			this.getBlockView().addDependent(this.oIdentityCardView);
		}
		if (oReferenceControl) {
			this.oIdentityCardView.getController().open(oReferenceControl, iIdentityId);
		} else {
			this.oIdentityCardView.getController().open(oSource, iIdentityId);
		}
	};

	RichCommentMixin.richCommentMixinOnDetailPress = function(oEvent) {
		this._commentMixinResetCommentModel();
		var sModelObjectType = this.getBlockView().data("modelObjectType");

		if (!this.oEditDialog) {
			var sViewName = this._commentMixinSettings.editDialogViewName;
			this.oEditDialog = this.createView({
				type: ViewType.XML,
				viewName: sViewName
			});
			this.getBlockView().addDependent(this.oEditDialog);
		}
		var oBindingContext = oEvent.getSource().getBindingContext("data");
		var iId = oBindingContext.getProperty(oBindingContext.sPath).ID;
		this.oEditDialog.getController().open(iId, sModelObjectType);
	};

	RichCommentMixin.onVotedFollow = function(oType) {
		var oIdeaModel = this.getModel("object");
		if (oIdeaModel && oIdeaModel.getProperty("/AUTO_FOLLOW")) {
			var bAutoFollow = oIdeaModel.getProperty("/AUTO_FOLLOW");
			var iFollowId = oIdeaModel.getProperty("/FOLLOW");
			var aAllNotificationPeople = oIdeaModel.getProperty("/SubmitterContributorsCoach");
			var oPerson = aAllNotificationPeople.filter(function(submitter) {
				return submitter.IDENTITY_ID === Configuration.getCurrentUser().USER_ID;
			});
			if (oType === "sap.ino.commons.models.object.IdeaComment" && bAutoFollow && !iFollowId && !oPerson.length) {
				var iIdeaId = oIdeaModel.getProperty("/ID");
				var oFollow = IdeaFollow.follow(iIdeaId, "IDEA", 0);
				oFollow.done();
			}
		}
	};

	RichCommentMixin.richCommentMixinOnReply = function(oEvent) {
		var cusData = oEvent.getSource().getCustomData()[0];
		this._commentMixinOnEdit(-1, cusData.getValue());
	};

	RichCommentMixin.richCommentMixinOnEdit = function(oEvent) {
		var cusData = oEvent.getSource().getCustomData();
		this._commentMixinOnEdit(cusData[0].getValue(), cusData[1].getValue());
	};

	RichCommentMixin._commentMixinOnEdit = function(iId, iParentId) {
		var sModelObjectType = this.getBlockView().data("modelObjectType");
		if (!this.oEditDialog) {
			var sViewName = this._commentMixinSettings.editDialogViewName;
			this.oEditDialog = this.createView({
				type: ViewType.XML,
				viewName: sViewName
			});
			this.getBlockView().addDependent(this.oEditDialog);
		}
		this.oEditDialog.getController().open(iId, iParentId, sModelObjectType, this._commentMixinSettings);
	};

	RichCommentMixin.richCommentMixinOnAttach = function(id) {
		var sModelObjectType = this.getBlockView().data("modelObjectType");
		if (!this.oAttachmentDialog) {
			var sViewName = this._commentMixinSettings.editAttachmentDialogViewName;
			this.oAttachmentDialog = this.createView({
				type: ViewType.XML,
				viewName: sViewName
			});
			this.getBlockView().addDependent(this.oAttachmentDialog);
		}
		this.oAttachmentDialog.getController().open(id, sModelObjectType);
	};

	RichCommentMixin.onRichAttachmentFileDeleted = function(oEvent) {
		var oController = this;
		var commentID;
		if (oEvent.getParameter("item") && oEvent.getParameter("item").getCustomData() && oEvent.getParameter("item").getCustomData().length > 0) {
			commentID = oEvent.getParameter("item").getCustomData()[0].getValue();
		}
		var oRemovePromise = oController._commentMixinGetStaticCommentModel().removeAttachments({
			ATTACHMENT_ID: oEvent.getParameter("documentId"),
			ID: commentID
		});
		this.getBlockView().setBusy(true);
		oRemovePromise.done(function() {
			oController._commentMixinRefresh();
		});
		oRemovePromise.fail(function(oResponse) {
			MsgToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT);
		});
		oRemovePromise.always(function() {
			oController.getBlockView().setBusy(false);
		});
	};

	RichCommentMixin.richCommentMixinOnDel = function(iId, iParentId, sModelObjectType) {
		//Comment Delete Function popup msg
		var oController = this;
		var sObjectType;
		if (sModelObjectType.indexOf("IdeaComment") > -1) {
			sObjectType = objectTypeCode.idea;
		} else if (sModelObjectType.indexOf("CampaignComment") > -1) {
			sObjectType = objectTypeCode.campaign;
		} else if (sModelObjectType.indexOf("BlogComment") > -1) {
			sObjectType = objectTypeCode.blog;
		}
		if(!oController.getModel("comment")){
		this._commentMixinGetCommentModel();
		}
		var sConfirmMsg = iParentId ? oController._commentMixinSettings.delReplyConfirmMsgKey : oController._commentMixinSettings.delAllDataComfirmMsgKey;
		jQuery.sap.require(sModelObjectType);
		var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);
		var oDeferred = new jQuery.Deferred();
		var aActions = iParentId ? [MessageBox.Action.OK, MessageBox.Action.CANCEL] : [oController.getText(oController._commentMixinSettings.delBtnKey),
			oController.getText(oController._commentMixinSettings.delBtnAllDataKey), MessageBox.Action.CANCEL];
		MessageBox.confirm(oController.getText(sConfirmMsg), {
			actions: aActions,
			onClose: function(sAction) {
				var index = Math.pow(aActions.length, aActions.indexOf(sAction) + 1);
				if (index === 4 || index === 27 || index === 1) {
					oDeferred.resolve({
						confirmationCancelled: true
					});
					return;
				} else {
					var oActionRequest = BaseObjectController.prototype.executeObjectAction.call(oController, "delComment", {
						staticparameters: {
							COMMENT_ID: iId,
							ALL_DATA: index === 9 ? 1 : 0,
							OBJECT_TYPE: sObjectType,
							OBJECT_ID: oController.getModel("comment").getProperty("/OBJECT_ID")
						},
						messages: {
							success: oController._commentMixinSettings.delSuccessfulMsgKey
						},
						objectModelExt: CommentModelType
					});
					oActionRequest.done(oDeferred.resolve);
					oActionRequest.fail(oDeferred.reject);
				}
			}
		});
		return oDeferred.promise();
	};

	RichCommentMixin.richCommentMixinOnRemoveComments = function(oEvent) {
		var cusData = oEvent.getSource().getCustomData();
		var iId = cusData[0].getValue();
		var iParentId = cusData[1].getValue();
		var sModelObjectType = this.getBlockView().data("modelObjectType");
		var oController = this;
		var oDelPromise = this.richCommentMixinOnDel(iId, iParentId, sModelObjectType);
		oDelPromise.done(function(oResponse) {
			if (oResponse && oResponse.confirmationCancelled === true) {
				return;
			} else {
				oController._commentMixinRefresh();
			}
		});
	};

	RichCommentMixin.setAccessibilityProperty = function() {
		if (this.byId(this._commentMixinSettings.commentListId)) {
			this.byId(this._commentMixinSettings.commentListId).addEventDelegate({
				onAfterRendering: function(oEvent) {
					var oList = oEvent.srcControl;
					var aItems = oList.$().find("li");
					jQuery.each(aItems, function(iIdx, oItemDom) {
						var $Item = jQuery(oItemDom);
						$Item.attr("aria-label", $Item.getEncodedText());
					});
				}
			});
		}
	};

	RichCommentMixin._commentMixinResetCommentModel = function() {
		//this._commentMixinSetCommentModel(null);
		this._commentMixinGetCommentModel();
	};

	RichCommentMixin.commentMixinForceInitCommentModel = function() {
		if (!this.getBlockView().getModel("comment")) {
			var iObjectId = this.getBlockView().data("object_id") || (this.getModel("object") && this.getModel("object").getProperty("/ID"));
			if (iObjectId > 0) {
				this._commentMixinInitCommentModel(iObjectId);
			}
		}
	};

	RichCommentMixin._commentMixinInitCommentModel = function(iObjectId) {
		var oSettings = {
			continuousUse: true,
			readSource: {
				model: this.getDefaultODataModel()
			}
		};

		var sModelObjectType = this.getBlockView().data("modelObjectType");
		jQuery.sap.require(sModelObjectType);
		var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);

		var oModel = new CommentModelType({
			OBJECT_ID: iObjectId
		}, oSettings);
		this.addSomeMethodIntoModel(oModel);
		this._commentMixinSetCommentModel(oModel);
	};

	RichCommentMixin._commentMixinSetCommentModel = function(oModel) {
		this.getBlockView().setModel(oModel, "comment");
	};

	RichCommentMixin._commentMixinGetCommentModel = function() {
		if (this.getCurrentRoute() !== "idea-display") {
			this._commentMixinSetCommentModel(null);
		}

		if (this.getCurrentRoute() === "idea-display") {
			//When the Idea-Display page to record the sub view to Idea model
			var oIdea = this.getModel("object");
			if (this.getBlockView().getViewName() === "sap.ino.vc.comment.RichComment") {
				oIdea.setProperty("/IDEA_COMMENT_VIEW", this.getBlockView());

			}
			if (this.getBlockView().getViewName() === "sap.ino.vc.internal.InternalSection") {
				oIdea.setProperty("/IDEA_INTERNAL_COMMENT_VIEW", this.getBlockView());
			}
			if (this.getBlockView().getModel("comment") && this.getModel("object") && this.getBlockView().getModel("comment").getProperty("/OBJECT_ID") !==
				this.getModel("object").getProperty("/ID")) {
				this._commentMixinSetCommentModel(null);
			}
		}
		this.commentMixinForceInitCommentModel();
		return this.getBlockView().getModel("comment");
	};

	RichCommentMixin._commentMixinGetStaticCommentModel = function() {
		var sModelObjectType = this.getBlockView().data("modelObjectType");
		jQuery.sap.require(sModelObjectType);
		return jQuery.sap.getObject(sModelObjectType, 0);
	};

	RichCommentMixin._commentMixinGetSingleCommentModel = function(iObjectId) {
		var sModelObjectType = this.getBlockView().data("modelObjectType");
		jQuery.sap.require(sModelObjectType);
		var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);
		var oSettings = {
			continuousUse: true,
			readSource: {
				model: this.getDefaultODataModel()
			}
		};
		return new CommentModelType(iObjectId, oSettings);
	};

	RichCommentMixin._commentMixinRefresh = function(oBindingInfo) {
		var oController = this;
		jQuery.sap.delayedCall(0, oController, function() {
			var sListId = oController._commentMixinSettings.commentListId;
			var bindingInfo = oBindingInfo || jQuery.extend(true, {}, oController.getBlockView().byId(sListId).getBindingInfo("items"));
			oController.getBlockView().byId(sListId).destroyItems();
			oController.getBlockView().byId(sListId).bindItems(bindingInfo);
		});
	};

	RichCommentMixin._onCommentMixinRouteMatched = function(oEvent) {
		var oRouteArgs = oEvent.getParameter("arguments");
		var oQuery = oRouteArgs["?query"];
		var sSection = (oQuery && oQuery.section) || "sectionDetails";
		if (sSection === "sectionComments") { //"sap.ino.commons.models.object.IdeaComment") {
			this.getModel("view").setProperty("/IDEA_COMMENT", true);
		} else {
			this.getModel("view").setProperty("/IDEA_COMMENT", false);
		}
         this._commentMixinGetCommentModel();
// 		if (sSection === this.sectionName) {
// 			this.richCommentMixinInit();
// 			this.richAttachmentMixinInit();
// 		} 
	};

	return RichCommentMixin;
});