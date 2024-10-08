sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/EvaluationRequestItem",
    "sap/ino/commons/models/object/EvaluationRequestComment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/model/Filter",
    "sap/m/Token",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/evaluation/EvaluationFormatter"
], function(BaseController, EvaluationRequestItem, EvaluationRequestComment, MessageToast, JSONModel, TopLevelPageFacet, PropertyModel,
	Filter, Token, FilterOperator,
	Sorter, MessageType, Message,MessageBox,Configuration, EvaluationFormatter) {
	"use strict";

	return BaseController.extend("sap.ino.vc.evaluation.RequestsItem", jQuery.extend({}, TopLevelPageFacet, {

		routes: ["evaluationrequest-item"],

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
		},

		onRouteMatched: function() {
			BaseController.prototype.onRouteMatched.apply(this, arguments);
			var oController = this;
			oController.setHelp("EVALUATIONREQUESTS_ITEM");
			var oRequestItem = this.getObjectModel();
			oRequestItem.getDataInitializedPromise().done(function(oData) {
				if (oRequestItem.oData.Clarifications.length > 0) {
					oController.setViewProperty("/CLARIFICATION_DISPLAY", false);
				}
				oController.bindDefaultODataModel.call(oController, oData.ID);
				oRequestItem.setProperty("/InitRefObjectId", oData.EVAL_REQ_ID);
				oController._commentMixinInitCommentModel();
			});

			oController.setViewProperty("/USER_IMAGE_ID", oController.getOwnerComponent().getCurrentUserImageId());
		},

		createObjectModel: function(vObjectKey) {
			return new EvaluationRequestItem(vObjectKey, {
				actions: ["update", "del", "executeStatusTransition", "sendClarification", "forward"],
				continuousUse: true,
				readSource: {
					model: this.getDefaultODataModel()
				}
			});
		},

		_commentMixinInitCommentModel: function() {
			this.byId("commentViewList").getController().commentMixinInit({
				commentInputId: "commentInputField",
				commentListId: "commentList",
				successMessageKey: "MSG_CREATE_SUCCESS_COMMENT",
				editDialogViewName: "sap.ino.vc.comment.EditCommentDialog"
			});
		},

		getODataEntitySet: function() {
			return "EvaluationRequestItem";
		},

		onOpenCreator: function(oEvent) {
			var oSource = oEvent.getSource();
			var iIdentityId = oSource.getBindingContext("object").getProperty("FROM_IDENTITY_ID");
			if (!this.oIdentityCardView) {
				this.oIdentityCardView = sap.ui.xmlview({
					viewName: "sap.ino.vc.iam.IdentityCard"
				});
				this.getView().addDependent(this.oIdentityCardView);
			}
			this.oIdentityCardView.getController().open(oSource, iIdentityId);
		},

		onRequestItemPress: function() {
			this.navigateTo("evaluationrequest-item", {
				id: this.getObjectModel().getKey()
			});
		},

		onIdeaPressed: function() {
			var iId = this.getObjectModel().getProperty("/IDEA_ID");
			this.navigateTo("idea-display", {
				id: iId
			}, true);
		},

		onAccept: function() {
			this.onExecuteStatusTransition("sap.ino.config.EVAL_REQ_ACCEPT");
		},

		onReject: function() {
			this.onExecuteStatusTransition("sap.ino.config.EVAL_REQ_REJECT");
		},
		onForward: function() {
			var oRequestForwardDialog = this.createRequestForwardDialog();
			var that = this;
			oRequestForwardDialog.open();
			that.addForwardExpertInputHandling(this.byId("inputForwardExpert"), {
				suggestion: {
					key: "ID",
					text: "NAME",
					additionalText: "USER_NAME",
					path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
					filters: [new Filter({
						path: "ID",
						operator: FilterOperator.NE,
						value1: Configuration.getCurrentUser().USER_ID
					})],
					sorter: new Sorter("NAME")
				},
				token: {
					key: "IDENTITY_ID",
					text: "NAME"
				}
			});
		},

		addForwardExpertInputHandling: function(oControl, mSettings) {
			if (!oControl) {
				return;
			}
			var that = this;
			var fnSuggestHandler = that._createSuggestHandler(mSettings.suggestion);
			oControl.attachSuggest(fnSuggestHandler, that);
		},

		onForwardClose: function() {
			this._oRequestForwardDialog.close();
			this.byId("inputForwardExpert").removeAllTokens();
			this.byId("txtAreaForwardReasonDes").setValue("");
		},
		onSubmitForward: function() {
			var that = this;
			var oForwardExpert = that.byId("inputForwardExpert").getTokens();
			var sText = that.byId("inputForwardExpert").getValue();
			if (oForwardExpert.length > 0 && !sText) {
				that.resetClientMessages();
				var iForwardID = parseInt(oForwardExpert[0].mProperties.key, 10);
				var oForwardAction = that.executeObjectAction("forward", {
					parameters: {
						EXPERT_ID: iForwardID,
						COMMENT_FORWARD: that.byId("txtAreaForwardReasonDes").getValue().trim()
					},
					messages: {
						success: "EVALUATIONREQUESTS_MSG_FORWARD_SUCCESS",
						error: "EVALUATIONREQUESTS_MSG_FORWARD_FAILURE"
					}
				});
				oForwardAction.fail(function(oResponseMsg){
			    if(oResponseMsg.MESSAGES.length > 0)	    
				{MessageBox.error(oResponseMsg.MESSAGES[0].MESSAGE_TEXT, {
					actions: [MessageBox.Action.OK],
					onClose: function(sDialogAction) {
					}
				}); }   
				});				
				oForwardAction.done(function() {
					that._oRequestForwardDialog.close();
					that.byId("inputForwardExpert").removeAllTokens();
					that.byId("txtAreaForwardReasonDes").setValue("");
					that.navigateTo("idea-display", {
						id: that.getObjectModel().oData.IDEA_ID
					}, true);
				});
				oForwardAction.always(function() {
					that._oRequestForwardDialog.setBusy(false);
				});
			} else {
				that.setClientMessage(
					new Message({
						code: "EVALUATIONREQUESTS_MSG_FORWARD_NO_EXPERT",
						type: MessageType.Error
					}),
					that.byId("inputForwardExpert"));
			}

		},

		onSubmitClarification: function() {
			var that = this;
			var sTextContent = that.byId("txtAreaClarificationReasonDes").getValue().trim();
			if (sTextContent) {
				that.resetClientMessages();
				var oSendClarificationReq = that.executeObjectAction("sendClarification", {
					parameters: {
						TO_IDENTITY: that.getObjectModel().getProperty("/OWNER_ID"),
						CONTENT: sTextContent
					},
					messages: {
						success: "EVALUATIONREQUESTS_MSG_CLARIFICATION_SUCCESS",
						error: "EVALUATIONREQUESTS_MSG_CLARIFICATION_FAILURE"
					}
				});
				oSendClarificationReq.done(function() {
					that.byId("txtAreaClarificationReasonDes").setValue("");
					that._oRequestClarificationDialog.close();
					that.setViewProperty("/CLARIFICATION_DISPLAY", false);
				});

				oSendClarificationReq.always(function() {
					that._oRequestClarificationDialog.setBusy(false);
				});
			} else {
				that.setClientMessage(
					new Message({
						code: "EVALUATIONREQUESTS_MSG_CLARIFICATION_NO_RESON",
						type: MessageType.Error
					}),
					this.byId("txtAreaClarificationReasonDes"));
				that.byId("txtAreaClarificationReasonDes").setValue("");
			}
		},

		onCreateClarification: function() {
			var oCreateClarificationDialog = this.createClarificationDialog();
			oCreateClarificationDialog.open();
		},

		onClarificationClose: function() {
			this.byId("txtAreaClarificationReasonDes").setValue("");
			this._oRequestClarificationDialog.close();
		},

		onCreateEvaluation: function() {
			this.navigateTo("evaluation-create", {
				query: {
					ideaId: this.getObjectModel().getProperty("/IDEA_ID"),
					EvalReqItemId: this.getObjectModel().getKey()
				}
			});
		},

		onExecuteStatusTransition: function(sStatusAction) {
			var oContorller = this;
			var oModel = oContorller.getObjectModel();
			var oActionRequest = oModel.executeStatusTransition({
				STATUS_ACTION_CODE: sStatusAction
			});
			if (oActionRequest) {
				oActionRequest.done(function() {
					MessageToast.show(oContorller.getText("OBJECT_MSG_STATUS_CHANGE_SUCCESS"));
				});
				oActionRequest.fail(function(o) {
					if (o.MESSAGES && o.MESSAGES.length > 0) {
						MessageToast.show(oContorller.getText(o.MESSAGES[0].MESSAGE_TEXT));
					}
				});
			}
		},
		createRequestForwardDialog: function() {
			if (!this._oRequestForwardDialog) {
				this._oRequestForwardDialog = this.createFragment("sap.ino.vc.evaluation.fragments.RequestForward", this.getView().getId());
				this.getView().addDependent(this._oRequestForwardDialog);
			}
			return this._oRequestForwardDialog;
		},

		createClarificationDialog: function() {
			if (!this._oRequestClarificationDialog) {
				this._oRequestClarificationDialog = this.createFragment("sap.ino.vc.evaluation.fragments.RequestCreateClarification", this.getView()
					.getId());
				this.getView().addDependent(this._oRequestClarificationDialog);
			}
			return this._oRequestClarificationDialog;
		},
		onEvaluationRequestOwnerPressed: function(oEvent) {
			oEvent.preventDefault();
			var oSource = oEvent.getSource();
			if (oSource) {
				var iIdentityId = oSource.getBindingContext("object") &&
					oSource.getBindingContext("object").getProperty("OWNER_ID");
				if (iIdentityId !== undefined && !this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				if (this.oIdentityCardView && this.oIdentityCardView.getController()) {
					this.oIdentityCardView.getController().open(oSource, iIdentityId);
				}
			}
		},
		createEvaluationFormatter: function(ideaId, statusCode) {
			if (statusCode === 'sap.ino.config.EVAL_REQ_EXPIRED' || statusCode === 'sap.ino.config.EVAL_REQ_REJECTED' || statusCode ===
				'sap.ino.config.EVAL_REQ_COMPLETED') {
				return false;
			}
			return EvaluationFormatter.createEvaluationDynamicFormatter(ideaId);
		}
	}));
});