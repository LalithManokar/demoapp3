sap.ui.define([
    "sap/ui/core/mvc/ViewType",
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/models/object/IdeaFollow",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel"
], function(ViewType, BaseObjectController, IdeaFollow, Configuration, JSONModel) {

	"use strict";

	/*
	 * @class Mixin that handles actions for Comment and Internal Note
	 */
	var CommentMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	CommentMixin.commentMixinInit = function(oSettings) {
		this._commentMixinSettings = oSettings;
		this.setViewProperty("/USER_IMAGE_ID", this.getOwnerComponent().getCurrentUserImageId());
		this._commentMixinResetCommentModel();
	};

	CommentMixin._commentMixinResetCommentModel = function() {
		this._commentMixinSetCommentModel(null);
		this._commentMixinGetCommentModel();
	};

	CommentMixin._commentMixinInitCommentModel = function(iObjectId) {
		var oSettings = {
			continuousUse: true,
			readSource: {
				model: this.getDefaultODataModel()
			}
		};

		var sModelObjectType = this.getView().data("modelObjectType");
		jQuery.sap.require(sModelObjectType);
		var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);

		var oModel = new CommentModelType({
			OBJECT_ID: iObjectId
		}, oSettings);

		this._commentMixinSetCommentModel(oModel);
	};

	/**
	 * Sets an object to as current model, it will be set on view level and bind it in the view
	 *
	 * Afterwards you can use it on the view using the name "comment"
	 *
	 * @param oModel
	 */
	CommentMixin._commentMixinSetCommentModel = function(oModel) {
		this.getView().setModel(oModel, "comment");
	};

	/**
	 * @returns current object
	 */
	CommentMixin._commentMixinGetCommentModel = function() {
		if (!this.getView().getModel("comment")) {
			// 			var iObjectId = this.getView().data("object_id") || (this.getObjectModel() && this.getObjectModel().getProperty("/ID"));
			var iObjectId = this.getView().data("object_id") || (this.getModel("object") && this.getModel("object").getProperty("/ID"));
			if (iObjectId > 0) {
				this._commentMixinInitCommentModel(iObjectId);
			}
		}
		return this.getView().getModel("comment");
	};

	CommentMixin.commentMixinSubmit = function(oEvent) {
		var oButton = oEvent.getSource();
		oButton.setEnabled(false);

		var oView = this.getView();
		var oModel = this._commentMixinGetCommentModel();
		var sType = oView.data("modelObjectType");

		var sSuccessMessage = this._commentMixinSettings.successMessageKey;
		oView.setBusy(true);

		var oCreateRequest = BaseObjectController.prototype.executeObjectAction.call(this, "create", {
			messages: {
				success: sSuccessMessage
			},
			objectModelExt: oModel
		});

		var that = this;
		oCreateRequest.done(function() {
			// Initialize comment after submit
			that._commentMixinResetCommentModel();
			that._commentMixinRefresh();
			that.onVotedFollow(sType);
		});

		oCreateRequest.always(function() {
			oView.setBusy(false);
			oButton.setEnabled(true);
		});
	};
	CommentMixin.onVotedFollow = function(oType) {
		var that = this;
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
	CommentMixin.commentMixinOnUserPressed = function(oEvent) {
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
			this.getView().addDependent(this.oIdentityCardView);
		}
		if (oReferenceControl) {
			this.oIdentityCardView.getController().open(oReferenceControl, iIdentityId);
		} else {
			this.oIdentityCardView.getController().open(oSource, iIdentityId);
		}

	};

	CommentMixin.commentMixinOnDetailPress = function(oEvent) {
		this._commentMixinResetCommentModel();
		var sModelObjectType = this.getView().data("modelObjectType");

		if (!this.oEditDialog) {
			// var that = this;
			// var oController;
			var sViewName = this._commentMixinSettings.editDialogViewName;
			this.oEditDialog = this.createView({
				type: ViewType.XML,
				viewName: sViewName
			});
			this.getView().addDependent(this.oEditDialog);
		}
		var oBindingContext = oEvent.getSource().getBindingContext("data");
		var iId = oBindingContext.getProperty(oBindingContext.sPath).ID;
		this.oEditDialog.getController().open(iId, sModelObjectType);
	};

	CommentMixin._commentMixinRefresh = function() {
		// var sModelObjectType = this.getView().data("modelObjectType");
		var sListId = this._commentMixinSettings.commentListId;
		var oBindingInfo = this.getView().byId(sListId).getBindingInfo("items");
		this.getView().byId(sListId).bindItems(oBindingInfo);

	};

	return CommentMixin;
});