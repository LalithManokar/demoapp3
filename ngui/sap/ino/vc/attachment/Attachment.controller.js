sap.ui.define([
    "sap/ino/vc/commons/BaseBlockController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/attachment/AttachmentMixin"
], function(BaseController,
	JSONModel,
	MessageToast,
	Attachment,
	Configuration,
	AttachmentMixin) {
	"use strict";

	var attachmentUploadUrl = Attachment.getEndpointURL();

	return BaseController.extend("sap.ino.vc.attachment.Attachment", jQuery.extend({}, AttachmentMixin, {

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			if (!this.getModel("local")) {
				this.setModel(new JSONModel({
					ATTACHMENT_UPLOAD_URL: attachmentUploadUrl
				}), "local");
			}
		},
		onFileRenamed: function(oEvent) {
			var that = this;
			that.getView().setBusy(true);
			var oActionRequest = Attachment.rename({
				id: oEvent.getParameter("documentId"),
				fileName: oEvent.getParameter("fileName")
			});
			oActionRequest.always(function() {
				that.getView().setBusy(false);
			});
			oActionRequest.fail(function(oResponse) {
				if (oResponse && oResponse.MESSAGES && oResponse.MESSAGES.length > 0) {
					MessageToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT, {
						autoClose: false
					});
				}
			});
		},
		onAfterRendering: function() {
			this._attachmentMixinInit({
				attachmentId: "Attachments",
				updateObject: function(oObject) {

				},
				uploadSuccess: function(oObject, oResponse) {
					oObject.addAttachment({
						"CREATED_BY_NAME": Configuration.getCurrentUser().NAME,
						"ATTACHMENT_ID": oResponse.attachmentId,
						"FILE_NAME": oResponse.fileName,
						"MEDIA_TYPE": oResponse.mediaType,
						"CREATED_AT": new Date()
					});
				}
			});
		}
	}));
});