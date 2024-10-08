sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/vc/comment/RichCommentCntrlMixin",
    "sap/ino/vc/comment/RichCommentAttachmentMixin",
    "sap/ui/core/mvc/ViewType",
    "sap/m/MessageToast",
    "sap/ino/vc/comment/RichCommentMixin"
], function(Controller, RichCommentCntrlMixin, RichCommentAttachmentMixin, ViewType, MsgToast, RichCommentMixin) {
	"use strict";

	return Controller.extend("sap.ino.vc.comment.RichEditCommentDialog", jQuery.extend({}, RichCommentCntrlMixin, RichCommentAttachmentMixin,
		RichCommentMixin, {
			_cId: "richEditCommentDialog",
			_dicODataPaths: {
				"sap.ino.commons.models.object.IdeaComment": {
					"Parent": "IdeaComment",
					"Child": "IdeaChildrenComment",
					"Prefix": "COMMENT"
				},
				"sap.ino.commons.models.object.InternalNote": {
					"Parent": "IdeaInternalNote",
					"Child": "IdeaInternalNoteChildrenComment",
					"Prefix": "INTERNALNOTE"
				}
			},

			open: function(iId, iParentId, sModelObjectType, oViewSetting) {
				this._open(iId, iParentId, sModelObjectType, oViewSetting);
			},

			_open: function(iId, iParentId, sModelObjectType, oViewSetting) {
				this.setViewProperty("/parentId", iParentId);
				this.setViewProperty("/id", iId);
				this.setViewProperty("/type", sModelObjectType);
				this._iId = iId;
				this._modelObjectType = sModelObjectType;
				this._commentMixinSettings = jQuery.extend(true, {}, oViewSetting);
				this._commentMixinSettings.commentContainerId = "rteCommentReplyContainer";
	            this._commentMixinSettings.type = "comment_reply";				
				var that = this;
				var oSettings = {
					actions: ["update", "del"],
					continuousUse: true,
					readSource: {
						model: this.getDefaultODataModel()
					}
				};
				var RteSetting = {
					height: "300px"
				};
				jQuery.sap.require(sModelObjectType);
				var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);
				var oCommentModel = new CommentModelType(iId, oSettings);
				this.addSomeMethodIntoModel(oCommentModel);
				that.setModel(oCommentModel, "comment");				
				var oDataModel = oCommentModel.getReadSourceModel();
				oDataModel.read("/" + this._dicODataPaths[sModelObjectType][!iParentId ? "Parent" : "Child"] + "(" + iId + ")/CommentAttachments", {
					success: function(oCommentAttachments) {
						oCommentModel.setProperty("/Attachments", oCommentAttachments.results);
					}
				});
				var oView = that.getView();
				this._initRTE(RteSetting);
				this.richAttachmentMixinInit();
				oCommentModel.getDataInitializedPromise().done(function(oData) {
                oView.byId(that._cId).open();
				});					
				//oView.byId(this._cId).open();
			},

			onDeletePressed: function(oEvent) {
				// 		if (!this.oDelDialog) {
				// 			var sViewName = this._commentMixinSettings.delDialogViewName;
				// 			this.oDelDialog = this.createView({
				// 				type: ViewType.XML,
				// 				viewName: sViewName
				// 			});
				// 			this.getView().addDependent(this.oDelDialog);
				// 		}
				// 		this.oDelDialog.getController().open(this._iId, this._modelObjectType, this.onCloseDialog);
				var cusData = oEvent.getSource().getCustomData();
				var iId = cusData[0].getValue();
				var iParentId = cusData[1].getValue();
				var sModelObjectType = this.getViewProperty("/type");
				var oView = this.getView();
				var oController = this;
				var oDelPromise = this.richCommentMixinOnDel(iId, iParentId, sModelObjectType);
				oDelPromise.done(function(oResponse) {
					if (oResponse && oResponse.confirmationCancelled === true) {
						return;
					} else {
						oController._clearData();
						oView.getParent().getController()._commentMixinRefresh();
						oView.byId(oController._cId).close();
					}
				});

			},

			onCloseDialog: function() {
				var oController = this;
				var oView = this.getView();
				oController._clearData();
				oView.byId(oController._cId).close();
			},

			onUpdatePressed: function() {
				var oController = this;
				var commentModel = oController.getModel("comment");
				if (!commentModel.getProperty("/COMMENT")) {
					MsgToast.show(this.getText(this._commentMixinSettings.validateMsgKey));
					return;
				}
				commentModel.setProperty("/Imgs", this._getImgIds(commentModel.getProperty("/COMMENT")));
				var oModifyPromise = this.executeObjectAction("update", {
					objectModelExt: commentModel,
					messages: {
						success: oController._commentMixinSettings.updateMsgKey
					}
				});
				var oView = this.getView();
				oModifyPromise.done(function() {
					oController._clearData();
					oView.getParent().getController()._commentMixinRefresh();
					oView.byId(oController._cId).close();
				});
			},

			onReplyPressed: function() {
				var oController = this;
				var commentModel = oController.getModel("comment");
				if (!commentModel.getProperty("/COMMENT")) {
					MsgToast.show(this.getText(this._commentMixinSettings.validateMsgKey));
					return;
				}
				commentModel.setProperty("/Imgs", this._getImgIds(commentModel.getProperty("/COMMENT")));
				commentModel.setProperty("/PARENT_ID", oController.getViewProperty("/parentId"));
				commentModel.setProperty("/OBJECT_ID", this.getModel("object").getProperty("/ID"));
				var oModifyPromise = this.executeObjectAction("create", {
					objectModelExt: commentModel,
					messages: {
						success: oController._commentMixinSettings.createReplyMsgKey,
						error: function(oServiceResult) {
							if (oServiceResult && oServiceResult.MESSAGES && oServiceResult.MESSAGES.length > 0) {
								MsgToast.show(oServiceResult.MESSAGES[0].MESSAGE_TEXT);
							}
						}
					}
				});
				var oView = this.getView();
				oModifyPromise.done(function() {
					oController._clearData();
					oView.byId(oController._cId).close();
					oView.byId(oController._commentReplyControlId).destroy();					
					oView.getParent().getController()._commentMixinRefresh();
					
				});
			},

			onCancelPressed: function() {
				var oView = this.getView();
				this.resetInputTypeValidations();
				this._clearData();
				oView.byId(this._cId).close();
			},

			_clearData: function() {
				this.getViewProperty("/parentId", null);
				this.getViewProperty("/id", null);
				this._iId = null;
				this._modelObjectType = null;
			},

			formatTitle: function(id, parentId, type) {
				if (!type) {
					return "";
				}
				var sTxtKey = this._dicODataPaths[type].Prefix;
				if (id > 0) {
					if (!parentId) {
						sTxtKey += "_EDIT_OBJECT_TIT";
					} else {
						sTxtKey += "_EDIT_REPLY_OBJECT_TIT";
					}
				} else {
					sTxtKey += "_CREATE_REPLY_OBJECT_TIT";
				}
				return this.getText(sTxtKey);
			}
			//end
		}));
});