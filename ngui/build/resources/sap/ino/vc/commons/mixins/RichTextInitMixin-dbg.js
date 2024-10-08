// RichTextInitMixin
sap.ui.define([
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageToast"],
	function(Attachment, Configuration, MessageToast) {
		"use strict";
		/**
		 * @class
		 * Mixin that relate to similar ideas
		 */
		var RichTextInitMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		RichTextInitMixin.beforeIformEditorInit = function(c) {
			var that = this;
			c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("image,", "");
			c.mParameters.configuration.link_context_toolbar = true;
			c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("powerpaste", "powerpaste,imagetools");
			c.mParameters.configuration.paste_data_images = true;
			c.mParameters.configuration.automatic_uploads = true;
			c.mParameters.configuration.powerpaste_word_import = "clean";
			c.mParameters.configuration.powerpaste_html_import = "clean";
			c.mParameters.configuration.default_link_target = "_blank";
			c.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
				var oFileToUpload = oFile.blob();
				if (oFileToUpload) {
					Attachment.uploadFileIncludeFileLabel(oFileToUpload, "IDEA_FORM_DESC")
						.done(function(oResponse) {
							success(Configuration.getAttachmentDownloadURL(oResponse.attachmentId));
						}).fail(function() {
							failure();
							MessageToast.show(that.getText("IDEA_OBJECT_MSG_IDEA_FROM_IMAGE_UPLOAD_FAILED"));
						});
				}
			};
			c.mParameters.configuration.paste_postprocess = function() {
				window.tinymce.activeEditor.uploadImages();
			};
		};

		return RichTextInitMixin;
	});