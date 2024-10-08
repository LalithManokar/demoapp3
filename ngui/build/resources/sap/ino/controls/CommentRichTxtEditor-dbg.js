/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "jquery.sap.global",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/Attachment"],
	function(jQuery, RichTextEditor, Configuration, Attachment) {
		"use strict";

		var CommentRichTxtEditor = RichTextEditor.extend("sap.ino.controls.CommentRichTxtEditor", {
			metadata: {
				properties: {
					saveText: {
						type: "string",
						group: "Data",
						defaultValue: ''
					},
					saveIcon: {
						type: "string",
						group: "Data",
						defaultValue: 'save'
					},
					saveTooltip: {
						type: "string",
						group: "Data",
						defaultValue: ''
					},
					failureMsg: {
						type: "string",
						group: "Data",
						defaultValue: ''
					}
				}
			},
			constructor: function(mSettings) {
				var that = this;
				var oSettings = jQuery.extend(true, {
						width: "100%",
						editable: true,
						editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
						showGroupInsert: true,
						showGroupLink: true,
						showGroupFont: true,
						showGroupClipboard: false,
						showGroupStructure: false,
						useLegacyTheme: false,
						beforeEditorInit: function(config) {
							config.mParameters.configuration.powerpaste_word_import = "clean";
							config.mParameters.configuration.powerpaste_html_import = "clean";
							config.mParameters.configuration.image_advtab = false;
							config.mParameters.configuration.paste_data_images = true;
							config.mParameters.configuration.automatic_uploads = true;
							config.mParameters.configuration.images_reuse_filename = false;
							config.mParameters.configuration.image_title = true;
							config.mParameters.configuration.file_picker_types = 'image';
                            config.mParameters.configuration.default_link_target = "_blank";
							config.mParameters.configuration.toolbar = "fontsizeselect | " + config.mParameters.configuration.toolbar.join(" | ").replace(
								"image", "image emoticons ").replace(
								"| alignleft aligncenter alignright alignjustify", "");
							config.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
								var oFileToUpload = oFile.blob();
								if (oFileToUpload) {
									Attachment.uploadFile(oFileToUpload).done(function(oResponse) {
										success("/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD") + "/" + oResponse.attachmentId);
									}).fail(function() {
										failure(that.getFailureMsg());
									});
								}
							};
							config.mParameters.configuration.file_picker_callback = function(cb, value, meta) {
								var input = document.createElement('input');
								input.setAttribute('type', 'file');
								input.setAttribute('accept', 'image/*');
								input.onchange = function() {
									var file = this.files[0];
									var reader = new FileReader();
									reader.onload = function() {
										var id = 'blobid' + (new Date()).getTime();
										var blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
										var base64 = reader.result.split(',')[1];
										var blobInfo = blobCache.create(id, file, base64);
										blobCache.add(blobInfo);
										cb(blobInfo.blobUri(), {
											title: file.name
										});
									};
									reader.readAsDataURL(file);
								};
								input.click();
							};
						}
					},
					mSettings);
				RichTextEditor.apply(that, [oSettings]);
			},
			renderer: "sap.ui.richtexteditor.RichTextEditorRenderer"
		});

		CommentRichTxtEditor.prototype.init = function() {
			RichTextEditor.prototype.init.call(this);
			this.setButtonGroups([{
					name: "font-style",
					visible: true,
					row: 0,
					priority: 10,
					buttons: [
                        "bold", "italic", "underline", "strikethrough"
                    ]
                }, {
					name: "undo",
					visible: true,
					row: 0,
					priority: 40,
					buttons: [
                        "undo", "redo"
                    ]
                }, {
					name: "insert",
					visible: false,
					row: 0,
					priority: 50,
					buttons: [
                        "image"
                    ]
                }, {
					name: "link",
					visible: false,
					row: 0,
					priority: 60,
					buttons: [
                        "link", "unlink"
                    ]
                }
            ]);
			this.removePlugin("paste");
			this.removePlugin("lists");
			//this.removePlugin("emoticons");
			this.removePlugin("text-align");
			this.removePlugin("directionality");
			this.removePlugin("textpattern");
		};
		return CommentRichTxtEditor;
	});