/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.FileUploader");

(function() {
	"use strict";
	jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
	jQuery.sap.require("sap.ui.ino.models.object.Attachment");
	jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
	jQuery.sap.require("sap.ui.ino.application.Configuration");
	var Configuration = sap.ui.ino.application.Configuration;
	jQuery.sap.require("sap.ui.ino.thirdparty.jimp");
	var jimp = sap.ui.ino.thirdparty.jimp;
	/**
	 *
	 * A File Uploader is control to upload files via file browser or drag & drop. I provides a delete button, to clear
	 * the uploaded file, if a preview exists. It can be configured to restrict the uploaded files to specific accept
	 * type, i.e. 'image/*'. The File Uploader Control does has different visual styles for different uses cases
	 * according to the role type id, e.g. (role type: 1 - Attachment, role type: 2 - Idea Title Image, role type: 3 -
	 * Campaign Detail Image).
	 *
	 * The File Uploader Control supports browsers capable of HTML5 file upload and enables drag & drop. For browser not
	 * supporting HTML5 file upload, like for example IE9, the SAP UI 5 File Uploader is integrated and styled
	 * accordingly. The SAP UI 5 File Uploader has some restrictions, like not multiple file upload and drag & drop.
	 *
	 * If for certain styles the uploaded file is of media type 'image', this image will be previewed in the control and
	 * a delete button will be provided to clear the upload. Otherwise for other styles, a default 'Add' icon is shown
	 * or the background is transparent.
	 *
	 * The File Uploader uses the AttachmentWriteModel to communicate with the backend. There the URL endpoint
	 * '../../xs/rest/attachment.xsjs' is used. A multipart form request is sent to the backend to upload the binary
	 * data of the selected files. Browser not supporting HTML, i.e. IE9, use the SAP UI5 FileUploader (no drag&drop and
	 * multiple file upload) is supported.
	 *
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>assignmentId: Unique id, representing the attachment assignment in the backend</li>
	 * <li>attachmentId: Unique id, representing the attachment in the backend</li>
	 * <li>attachmentMediaType: Media type of the attachment in the backend</li>
	 * <li>ownerId: Unique id, representing the owner of the attachment in the backend</li>
	 * <li>uploadTooltip: A describing text, used as tooltip for the control</li>
	 * <li>clearTooltip: A describing text, used as tooltip for clearing the uploaded file</li>
	 * <li>zoomPlusTooltip: A describing text, used as tooltip for zooming in </li>
	 * <li>zoomMinusTooltip: A describing text, used as tooltip for zooming out </li>
	 * <li>moveUpTooltip: A describing text, used as tooltip for scrolling up</li>
	 * <li>moveDownTooltip: A describing text, used as tooltip for scrolling down</li>
	 * <li>moveLeftTooltip: A describing text, used as tooltip for scrolling left</li>
	 * <li>moveRightTooltip: A describing text, used as tooltip for scrolling right</li>
	 * <li>showStnadardControls: Boolean stating if standard control buttons (e.g. clear button) are displayed</li>
	 * <li>showZoomControls: Boolean stating if zoom control buttons are displayed</li>
	 * <li>showMoveControls: Boolean stating if move control buttons are displayed</li>
	 * <li>zoomStep: Amount of pixel the image is zoomed when zoom buttons are pressed</li>
	 * <li>moveStep: Amount of pixel the image is scrolled when move buttons are pressed</li>
	 * <li>accept: MIME type pattern to restrict allowed types for uploading, e.g. 'image/*'</li>
	 * <li>multiple: Flag if multiple uploads are supported. Only available if browser supports HTML5 file upload and
	 * the control style supports this</li>
	 * <li>style: Style of the File Uploader control. File Uploader is used in different contexts having different
	 * visual representation. Possible values are: Attachment - add attachment to an owner, IdeaTitleImage - set or
	 * clear a a title image of an idea, CampaignDetailImage - set or clear a detail image of an campaign</li>
	 * <li>activityIndicatorSrc: Activity indicator image source</li>
	 * </ul>
	 * </li>
	 * <li>Aggregations
	 * <ul>
	 * <li>_fileUploader: (private) In case the browser does not support HTML5 file upload, the SAP UI 5 File Uploader
	 * is used as fallback. Managed internally</li>
	 * <li>_clearButton: (private) In case a preview is displayed in the File Uploader, it can be cleared using the
	 * clear button. Managed internally</li>
	 * <li>_zoomPlusButton: (private) Image can be zoomed in by button. Managed internally</li>
	 * <li>_zoomMinusButton: (private) Image can be zoomed out by button. Managed internally</li>
	 * <li>_moveUpButton: (private) Image can be scrolled up by button. Managed internally</li>
	 * <li>_moveDownButton: (private) Image can be scrolled down by button. Managed internally</li>
	 * <li>_moveLeftButton: (private) Image can be scrolled left by button. Managed internally</li>
	 * <li>_moveRightButton: (private) Image can be scrolled right by button. Managed internally</li>
	 * </ul>
	 * </li>
	 * <li>Events
	 * <ul>
	 * <li>uploadSuccessful: Fired when the chosen file(s) were uploaded successfully</li>
	 * <li>uploadFailed: Fired when the upload failed of the chosen file(s)</li>
	 * <li>clearSuccessful: Fired when the removal of the file upload was successful</li>
	 * <li>clearFailed: Fired when the removal of the file upload failed</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */

	sap.ui.core.Control.extend("sap.ui.ino.controls.FileUploader", {
		metadata: {
			properties: {
				"assignmentId": "int",
				"attachmentId": "int",
				"attachmentMediaType": "string",
				"ownerId": "int",
				"uploadTooltip": "string",
				"clearTooltip": "string",
				"cropTooltip": "string",
				"zoomPlusTooltip": "string",
				"zoomMinusTooltip": "string",
				"moveUpTooltip": "string",
				"moveDownTooltip": "string",
				"moveLeftTooltip": "string",
				"moveRightTooltip": "string",
				"showStandardControls": {
					type: "boolean",
					defaultValue: true
				},
				"showZoomControls": "boolean",
				"showMoveControls": "boolean",
				"showCropControls": {
					type: "boolean",
					defaultValue: false
				},
				"showUploadFileControls": {
					type: "boolean",
					defaultValue: false
				},
				"uploadFileControlsTooltip": "string",
				"uploadFileControlsText": "string",
				"showFileUploaderTextControls": {
					type: "boolean",
					defaultValue: true
				},
				"zoomStep": {
					type: "int",
					defaultValue: 1
				},
				"moveStep": {
					type: "int",
					defaultValue: 1
				},
				"accept": "string",
				"multiple": {
					type: "boolean",
					defaultValue: true
				},
				"style": {
					type: "sap.ui.ino.controls.FileUploaderStyle",
					group: "Appearance",
					defaultValue: sap.ui.ino.controls.FileUploaderStyle.Attachment
				},
				"activityIndicatorSrc": "string",
				"rtMode": {
					type: "boolean",
					defaultValue: false
				},
				"imageDefaultValue": "string",
				config: {
					type: 'object',
					defaultValue: {
						small: {
							quality: 40
						},
						large: {
							quality: 70
						}
					}
				},
				"compressed": {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				"_fileUploader": {
					type: "sap.ui.commons.FileUploader",
					multiple: false,
					visibility: "hidden"
				},
				"_clearButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_zoomPlusButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_zoomMinusButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_moveUpButton": {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_moveDownButton": {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_moveLeftButton": {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_moveRightButton": {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_cropButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				"_uploadFileButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				}

			},
			events: {
				"uploadSuccessful": {},
				"uploadFailed": {},
				"clearSuccessful": {},
				"clearFailed": {},
				"crop": {},
				"uploadFileBtn": {},
				"uploadStart": {}
			}
		},

		constructor: function(sId, mSettings) {
			var sAgent = window.navigator.userAgent;
			var bIsMSIE9 = sAgent.indexOf("MSIE 9") > -1;
			this._alreadyRenderBtn = 0;
			sap.ui.core.Control.apply(this, arguments);
			this.bFileUploadSupported = bIsMSIE9 || (!!(window.File) && !!(window.FileReader) && !!(window.FileList) && !!(window.Blob));
		},

		init: function() {
			this._reset();
		},

		exit: function() {
			this._reset();
		},

		_reset: function() {
			this._cropImageContainer = null;
		},

		setAttachmentId: function(attachmentId) {
			this._reset();
			this.setProperty("attachmentId", attachmentId);
		},

		_setAlreadyRenderBtn: function() {
			this._alreadyRenderBtn++;
		},

		_classForStyle: function() {
			switch (this.getStyle()) {
				case sap.ui.ino.controls.FileUploaderStyle.Attachment:
					return "sapUiInoFileUploaderAttachment spriteFileUploader sapUiInoFileUploader_add_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage:
					return "sapUiInoFileUploaderAttachmentTitleImage spriteFileUploader sapUiInoFileUploader_title_image_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleVideo:
					return "sapUiInoFileUploaderAttachmentTitleVideo spriteFileUploader sapUiInoFileUploader_title_video_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage:
					return "sapUiInoFileUploaderIdeaTitleImage";
				case sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue:
					return "sapUiInoFileUploaderAttachmentTitleImage spriteFileUploader sapUiInoFileUploader_image_with_default_value";
				case sap.ui.ino.controls.FileUploaderStyle.CampaignDetailImage:
					return "sapUiInoFileUploaderCampaignDetailImage";
				case sap.ui.ino.controls.FileUploaderStyle.UserImage:
					return "sapUiInoFileUploaderUserImage spriteFileUploader sapUiInoFileUploader_user_image_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage:
					return "sapUiInoFileUploaderCampaignTitleImage spriteFileUploader sapUiInoFileUploader_campaign_title_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.CampaignListImage:
					return "sapUiInoFileUploaderCampaignListImage spriteFileUploader sapUiInoFileUploader_campaign_list_attachment";
				case sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage:
					return "sapUiInoFileUploaderDimensionBadgeImage spriteFileUploader sapUiInoFileUploader_dimension_badge_attachment";	
				default:
					return "sapUiInoFileUploaderAttachment spriteFileUploader sapUiInoFileUploader_add_attachment";
			}
		},

		_sValueStyle: "sapUiInoFileUploaderValueStateNone",

		setValueState: function(vState) {
			switch (vState) {
				case sap.ui.core.ValueState.Error:
					this._sValueStyle = "sapUiInoFileUploaderValueStateError";
					break;
				case sap.ui.core.ValueState.Warning:
					this._sValueStyle = "sapUiInoFileUploaderValueStateWarning";
					break;
				case sap.ui.core.ValueState.Success:
					this._sValueStyle = "sapUiInoFileUploaderValueStateSuccess";
					break;
				case sap.ui.core.ValueState.None:
					this._sValueStyle = "sapUiInoFileUploaderValueStateNone";
					break;
				default:
					this._sValueStyle = "sapUiInoFileUploaderValueStateNone";
			}

			var oControl = jQuery(this.getDomRef());

			jQuery(oControl).removeClass("sapUiInoFileUploaderValueStateError");
			jQuery(oControl).removeClass("sapUiInoFileUploaderValueStateWarning");
			jQuery(oControl).removeClass("sapUiInoFileUploaderValueStateSuccess");
			jQuery(oControl).removeClass("sapUiInoFileUploaderValueStateNone");

			jQuery(oControl).addClass(this._sValueStyle);
		},

		_getAttachmentUploadURL: function() {
			if (this.getRtMode()) {
				return Configuration.getBackendRootURL() + "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_REPOSITORY");
			} else {
				return sap.ui.ino.models.object.Attachment.getEndpointURL();
			}
		},

		_getAttachmentDownloadURL: function(iAttachmentId) {
			var sURL = Configuration.getBackendRootURL();
			if (this.getRtMode()) {
				sURL = "";
			} else {
				sURL = sURL + "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD");
			}
			if (iAttachmentId) {
				sURL = sURL + "/" + iAttachmentId;
			}
			return sURL;
		},

		_getTitleImageDownloadURL: function(iAttachmentId) {
			var sURL = Configuration.getBackendRootURL() + "/" + Configuration.getSystemSetting(
				"sap.ino.config.URL_PATH_XS_ATTACHMENT_TITLE_IMAGE_DOWNLOAD");
			if (iAttachmentId) {
				sURL = sURL + "/" + iAttachmentId;
			}
			return sURL;
		},

		_addPreview: function() {
			var preview;
			if (this.bFileUploadSupported) {
				preview = jQuery(this.getDomRef());
			} else {
				preview = jQuery(this.getDomRef()).find(".sapUiInoFileUploaderButton");
			}
			jQuery(preview).addClass("sapUiInoFileUploaderPreview");
			jQuery(preview).css("background-image", "url(" + this._getAttachmentDownloadURL(this.getAttachmentId()) + ")");

			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.ImageWithDefaultValue) {
				if (this.getAttachmentId()) {
					jQuery(preview).addClass("sapUiInoFileUploaderBackgroundPreview");
				}
			}
		},

		_removePreview: function() {
			var preview;
			if (this.bFileUploadSupported) {
				preview = jQuery(this.getDomRef());
			} else {
				preview = jQuery(this.getDomRef()).find(".sapUiInoFileUploaderButton");
			}
			jQuery(preview).removeClass("sapUiInoFileUploaderPreview");
			jQuery(preview).css("background-image", "");

			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.ImageWithDefaultValue) {
				jQuery(preview).removeClass("sapUiInoFileUploaderBackgroundPreview");
			}
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue) {
				jQuery(preview).css("background-image", "url(" + this.getImageDefaultValue() + ")");
			}
		},

		_startActivityIndicator: function() {
			this._removePreview();
			if (this.bFileUploadSupported) {
				jQuery(this.getDomRef()).addClass("sapUiInoFileUploaderWait");
				if (this.getActivityIndicatorSrc()) {
					jQuery(this.getDomRef()).css("background-image", "url(" + this.getActivityIndicatorSrc() + ")");
				}
			} else {
				var oFileUploader = this.getAggregation("_fileUploader");
				var oFileUploaderGroup = jQuery(oFileUploader.getDomRef()).find(".sapUiFupGroup");
				var oFileUploaderButton = jQuery(oFileUploaderGroup).find("button");
				oFileUploaderButton.addClass("sapUiInoFileUploaderWait");
				if (this.getActivityIndicatorSrc()) {
					oFileUploaderButton.css("background-image", "url(" + this.getActivityIndicatorSrc() + ")");
				}
			}
		},

		_stopActivityIndicator: function() {
			if (this.bFileUploadSupported) {
				jQuery(this.getDomRef()).removeClass("sapUiInoFileUploaderWait");
				if (this.getActivityIndicatorSrc()) {
					jQuery(this.getDomRef()).css("background-image", "");
				}
			} else {
				var oFileUploader = this.getAggregation("_fileUploader");
				var oFileUploaderGroup = jQuery(oFileUploader.getDomRef()).find(".sapUiFupGroup");
				var oFileUploaderButton = jQuery(oFileUploaderGroup).find("button");
				oFileUploaderButton.removeClass("sapUiInoFileUploaderWait");
				if (this.getActivityIndicatorSrc()) {
					oFileUploaderButton.css("background-image", "");
				}
			}
		},

		_clearInput: function() {
			if (this.bFileUploadSupported) {
				jQuery(this.getDomRef()).find("input").val("");
				jQuery(this.getDomRef()).removeClass("sapUiInoFileUploaderDragOver");
			}
		},

		_uploadSuccessful: function(data) {
			this._reset();
			this.setAttachmentId(data.attachmentId);
			this.fireUploadSuccessful(data);
			this._clearInput();
			this._sFocus = "preview";
		},

		_uploadFailed: function(data) {
			if (data.messages === undefined) {
				data.messages = [];
				data.messages.push({
					MESSAGE: "MSG_ATTACHMENT_UNKNOWN_ERROR",
					PARAMETERS: [],
					REF_FIELD: "FILE_NAME",
					REF_NODE: "Root",
					TYPE: "E"
				});
			}
			this.fireUploadFailed(data);
			this._sFocus = "click";
			this._clearInput();
		},

		_clearSuccessful: function() {
			this.fireClearSuccessful({
				assignmentId: this.getAssignmentId(),
				attachmentId: this.getAttachmentId()
			});
			this.setAttachmentId(0);
			this._sFocus = "click";
		},

		_clearFailed: function() {
			this.fireClearFailed({
				assignmentId: this.getAssignmentId(),
				attachmentId: this.getAttachmentId()
			});
			this._sFocus = "preview";
		},

		_clearAttachment: function() {
			if (this.getOwnerId() <= 0) {
				var that = this;
				var oDeleteRequest = sap.ui.ino.models.object.Attachment.del(this.getAttachmentId());
				oDeleteRequest.done(function(oResponse) {
					that._clearSuccessful();
				});
				oDeleteRequest.done(function(oResponse) {
					that._clearFailed();
				});
			} else {
				this._clearSuccessful();
			}
			this._reset();
		},

		_uploadFiles: function(files, sDefaultFileName) {
			var aDeferred = [];
			if (files.length > 0 && this.bFileUploadSupported) {
				var that = this;
				var aFile = files;
				var bValidFileFound = false;
				for (var j = 0; j < aFile.length; j++) {
					if (aFile[j].name || aFile[j].type) {
						bValidFileFound = true;
						break;
					}
				}
				if (bValidFileFound) {
					that._startActivityIndicator();
				} else {
					this._clearInput();
					var oMessage = {
						TYPE: "E",
						MESSAGE: "MSG_ATTACHMENT_UNKNOWN_TYPE",
						REF_ID: 0,
						REF_FIELD: "",
						PARAMETERS: []
					};
					that._uploadFailed({
						fileName: "",
						mediaType: "",
						messages: [oMessage]
					});
					return;
				}
				for (var i = 0; i < aFile.length; i++) {
					if (!aFile[i].name && !aFile[i].type) {
						continue;
					}
					var sFilename = null;
					if (sDefaultFileName) {
						sFilename = sDefaultFileName;
					} else {
						if (aFile[i].name) {
							sFilename = aFile[0].name;
						} else if (aFile[i].type) {
							sFilename = aFile[0].type.replace(/\//g, '.');
						}
					}
				}
				var oDeferred = new jQuery.Deferred();
				aDeferred.push(oDeferred);
				this._callUpload(aFile, sFilename, function(oResponse) {
					that._stopActivityIndicator();
					var aMessages = that.checkMediaType(oResponse.GENERATED_IDS[-1], oResponse.FILE_NAME, oResponse.MEDIA_TYPE);
					if (aMessages.length === 0) {
						that._uploadSuccessful({
							attachmentId: oResponse.GENERATED_IDS[-1],
							fileName: oResponse.FILE_NAME,
							mediaType: oResponse.MEDIA_TYPE
						});
					} else {
						that._uploadFailed({
							fileName: oResponse.FILE_NAME,
							mediaType: oResponse.MEDIA_TYPE,
							messages: aMessages
						});
					}
					oDeferred.resolve();
				}, function(oResponse) {
					that._stopActivityIndicator();
					that._uploadFailed({
						fileName: oResponse.FILE_NAME,
						mediaType: oResponse.MEDIA_TYPE,
						messages: oResponse.MESSAGES
					});
					oDeferred.reject();
				});

			}
			this._clearInput();
			return jQuery.when.apply(jQuery, aDeferred);
		},

		_callUpload: function(oFile, sFilename, fnSuccess, fnError) {
			var sURL = this.getRtMode() ? this._getAttachmentUploadURL() : undefined;
			sap.ui.ino.models.object.Attachment.upload(oFile, sFilename, fnSuccess, fnError, sURL);
		},

		_linkUrl: function(url) {
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || this.getStyle() === sap.ui.ino.controls
				.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleVideo || this.getStyle() ===
				sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage) {
				var iId = parseInt(url.split(/(\\|\/)/g).pop(), 10);
				var sURL = this._getAttachmentDownloadURL();
				if (url.indexOf(sURL) === 0 && typeof iId === "number" && iId > 0) {
					this._uploadSuccessful({
						attachmentId: iId
					});
					return;
				} else {
					sURL = this._getTitleImageDownloadURL();
					if (url.indexOf(sURL) === 0 && typeof iId === "number" && iId > 0) {
						this._uploadSuccessful({
							attachmentId: iId
						});
						return;
					}
				}
			}
			this._clearInput();
			if (this.bFileUploadSupported) {
				// Only possible if server allows cross-origin access...
				jQuery("<img/>").attr("src", url).attr("crossOrigin", "Anonymous").load(function() {
					var oCanvas = document.createElement("canvas");
					oCanvas.width = this.width;
					oCanvas.height = this.height;
					var ctx = oCanvas.getContext("2d");
					ctx.drawImage(this, 0, 0);
					var sMediaType = "image/" + this.src.substring(this.src.lastIndexOf(".") + 1);
					var sImageUrl = oCanvas.toDataURL(sMediaType);
					var aBlobBin = atob(sImageUrl.split(",")[1]);
					var aArray = [];
					for (var i = 0; i < aBlobBin.length; i++) {
						aArray.push(aBlobBin.charCodeAt(i));
					}
					var oFile = new Blob([new Uint8Array(aArray)], {
						type: sMediaType
					});
					var sFileName = this.src.substring(this.src.lastIndexOf("/") + 1);
					this._uploadFiles([oFile], sFileName);
				});
			}
		},

		_compressFiles: function(aBlobs) {
			var that = this;
			var promiseList = [];
			Array.prototype.slice.call(aBlobs).forEach(function(oBlob) {
				promiseList.push(that._getPromise(oBlob));
				promiseList.push(that._getPromise(oBlob, 'small'));
				promiseList.push(that._getPromise(oBlob, 'large'));
			});
			return Promise.all(promiseList);
		},

		_getPromise: function(oBlob, compressType) {
			var config = this.getConfig();
			return new Promise(function(resolve) {
				if (!compressType) {
					resolve(oBlob);
				}
				var quality = config[compressType].quality;
				try {
					if (oBlob.type.startsWith('image') && jimp) {
						var reader = new FileReader();

						reader.onload = function() {
							var fBuffer = reader.result;

							var oJimpDeffered = jimp.read(fBuffer);
							oJimpDeffered.then(function(img) {
								var compressedImg = img;

								compressedImg = compressedImg.quality(
									quality
								);

								compressedImg
									.getBufferAsync(oBlob.type)
									.then(function(compressedBuffer) {
										var newBlob = new Blob([compressedBuffer], {
											type: oBlob.type
										});
										// assign file.name to blob
										newBlob.name = oBlob.name.split(".")[0] + '_' + compressType + '.' + oBlob.name.split(".")[1];

										// Sometimes the compressed image will be larger than the original size
										if (newBlob.size > oBlob.size) {
											resolve(oBlob);
										} else {
											resolve(newBlob);
										}

									});
							});

						};

						reader.readAsArrayBuffer(oBlob);

					} else {
						// no image
						resolve(oBlob);
					}
				} catch (err) {
					// compress failed, downgrade to original blob file
					//MessageToast.show('compress img failed');
					resolve(oBlob);
				}

			});
		},

		onBeforeRendering: function() {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var that = this;
			if (!this.bFileUploadSupported) {
				var oApplication = sap.ui.ino.application.ApplicationBase.getApplication();
				var sXSRFToken = oApplication.getXSRFToken();

				var oFileUploader = new sap.ui.commons.FileUploader({
					uploadUrl: Configuration.getApplicationObject("sap.ino.xs.object.attachment.Attachment"),
					name: "fileUploader",
					tooltip: this.getUploadTooltip() || "",
					parameters: [new sap.ui.commons.FileUploaderParameter({
						name: "X-CSRF-Token",
						value: sXSRFToken
					})],
					uploadOnChange: true,
					change: function() {
						that._startActivityIndicator();
					},
					uploadComplete: function(oEvent) {
						var sFileName = "";
						var sMediaType = "";
						var aMessages = [];
						var sResponse = oEvent.getParameter("response");
						if (sResponse) {
							var sCode = sResponse.substring(1, 4);
							sResponse = sResponse.substring(6);
							var oResponse = null;
							try {
								oResponse = JSON.parse(sResponse);
								sFileName = (oResponse.FILE_NAME || "");
								sMediaType = (oResponse.MEDIA_TYPE || "");
								aMessages = (oResponse.MESSAGES || "");
								if (sCode === "200" && !oResponse.ERROR) {
									var GENERATED_IDS = (oResponse.GENERATED_IDS || []);
									var iId = GENERATED_IDS[-1];
									if (iId) {
										aMessages = that.checkMediaType(iId, sFileName, sMediaType);
										if (aMessages.length === 0) {
											that._stopActivityIndicator();
											that._uploadSuccessful({
												attachmentId: iId,
												fileName: sFileName,
												mediaType: sMediaType
											});
											return;
										}
									}
								}
							} catch (e) {
								var oMessage = {
									TYPE: "E",
									MESSAGE: "MSG_ATTACHMENT_UNKNOWN_ERROR",
									REF_ID: 0,
									REF_FIELD: "",
									PARAMETERS: []
								};
								aMessages = [oMessage];
							}
						}
						that._stopActivityIndicator();
						that._uploadFailed({
							fileName: sFileName,
							mediaType: sMediaType,
							messages: aMessages
						});
					}
				});
				this.setAggregation("_fileUploader", oFileUploader);
			}
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || this.getStyle() === sap.ui.ino.controls
				.FileUploaderStyle.CampaignDetailImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.UserImage || this.getStyle() ===
				sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || 
				this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage
			) {
				if (this.getShowStandardControls()) {
					var oClearButton = new sap.m.Button({
						icon: "sap-icon://sys-cancel",
						tooltip: this.getClearTooltip() || "",
						press: function(oEvent) {
							oEvent.cancelBubble();
							oEvent.preventDefault();
							that._clearAttachment();
							that.getFocusDomRef().focus();
						}
					});
					oClearButton.addStyleClass("sapUiInoImageCropButton").addStyleClass("sapUiInoImageCropClear");
					if (!this.bFileUploadSupported) {
						oClearButton.addStyleClass("sapUiInoFileUploaderControlClear");
					}
					this.setAggregation("_clearButton", oClearButton);
				}

				if (this.bFileUploadSupported) {
					if (this.getShowCropControls()) {
						var oCropButton = new sap.m.Button({
							icon: "sap-icon://crop",
							tooltip: this.getCropTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.fireCrop({
									file: that.crop()
								});
								that.getFocusDomRef().focus();
							}
						});
						oCropButton.addStyleClass("sapUiInoImageCropButton").addStyleClass("sapUiInoImageCropCrop");

						this.setAggregation("_cropButton", oCropButton);
					}

					if (this.getShowZoomControls()) {
						var oZoomPlusButton = new sap.m.Button({
							icon: "sap-icon://zoom-in",
							tooltip: this.getZoomPlusTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropZoom(that.getZoomStep());
								that.getFocusDomRef().focus();
							},
							enabled: false
						});
						oZoomPlusButton.addStyleClass("sapUiInoImageCropButton").addStyleClass("sapUiInoImageCropZoomPlus");
						this.setAggregation("_zoomPlusButton", oZoomPlusButton);

						var oZoomMinusButton = new sap.m.Button({
							icon: "sap-icon://zoom-out",
							tooltip: this.getZoomMinusTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropZoom(-that.getZoomStep());
								that.getFocusDomRef().focus();
							}
						});
						oZoomMinusButton.addStyleClass("sapUiInoImageCropButton").addStyleClass("sapUiInoImageCropZoomMinus");
						this.setAggregation("_zoomMinusButton", oZoomMinusButton);
					}

					if (this.getShowMoveControls()) {
						var oMoveUpButton = new sap.ui.commons.Button({
							lite: true,
							tooltip: this.getMoveUpTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropMoveBy(0, -that.getMoveStep());
								that.getFocusDomRef().focus();
							}
						});
						oMoveUpButton.addStyleClass("sapUiInoFileUploaderCropImageMoveUp").addStyleClass("sapUiInoFileUploader_move_n").addStyleClass(
							"spriteFileUploader");
						this.setAggregation("_moveUpButton", oMoveUpButton);

						var oMoveDownButton = new sap.ui.commons.Button({
							lite: true,
							tooltip: this.getMoveDownTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropMoveBy(0, that.getMoveStep());
								that.getFocusDomRef().focus();
							}
						});
						oMoveDownButton.addStyleClass("sapUiInoFileUploaderCropImageMoveDown").addStyleClass("sapUiInoFileUploader_move_s").addStyleClass(
							"spriteFileUploader");
						this.setAggregation("_moveDownButton", oMoveDownButton);

						var oMoveLeftButton = new sap.ui.commons.Button({
							lite: true,
							tooltip: this.getMoveLeftTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropMoveBy(-that.getMoveStep(), 0);
								that.getFocusDomRef().focus();
							}
						});
						oMoveLeftButton.addStyleClass("sapUiInoFileUploaderCropImageMoveLeft").addStyleClass("sapUiInoFileUploader_move_w").addStyleClass(
							"spriteFileUploader");
						this.setAggregation("_moveLeftButton", oMoveLeftButton);

						var oMoveRightButton = new sap.ui.commons.Button({
							lite: true,
							tooltip: this.getMoveRightTooltip() || "",
							press: function(oEvent) {
								oEvent.cancelBubble();
								oEvent.preventDefault();
								that.cropMoveBy(that.getMoveStep(), 0);
								that.getFocusDomRef().focus();
							}
						});
						oMoveRightButton.addStyleClass("sapUiInoFileUploaderCropImageMoveRight").addStyleClass("sapUiInoFileUploader_move_e").addStyleClass(
							"spriteFileUploader");
						this.setAggregation("_moveRightButton", oMoveRightButton);
					}

					if (this.getShowUploadFileControls()) {
						if (!this.getAggregation("_uploadFileButton")) {
							var oUploadFileButton = new sap.m.Button({
								icon: "sap-icon://upload",
								text: i18n.getText("CTRL_USERSETTINGSCTRL_EXP_UPLOAD_USER_IMAGE") || "",
								tooltip: this.getUploadFileControlsTooltip() || "",
								press: function(oEvent) {
									oEvent.cancelBubble();
									oEvent.preventDefault();
									that.fireUploadFileBtn({
										file: that.uploadFileBtn()
									});
									that.getFocusDomRef().focus();
								}
							});
							oUploadFileButton.addStyleClass("sapUiInoUploadFileButton");

							this.setAggregation("_uploadFileButton", oUploadFileButton);
						}
					}
				}
			}
		},

		checkMediaType: function(iId, sFileName, sMediaType) {
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage) {
				var sFileExt = sFileName.split('.').pop();
				if (!sFileExt || sFileExt.length === 0 || (sMediaType.indexOf("image/") !== 0 && sMediaType.indexOf("video/") !== 0)) {
					var oMessage = {
						TYPE: 'E',
						MESSAGE: 'MSG_ATTACHMENT_FILE_EXT_NOT_ALLOWED_IMG_VID',
						REF_ID: iId,
						REF_FIELD: 'FILE_NAME',
						PARAMETERS: []
					};
					return [oMessage];
				}
			}
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino
				.controls.FileUploaderStyle.UserImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage) {
				var sFileExt = sFileName.split('.').pop();
				if (!sFileExt || sFileExt.length === 0 || sMediaType.indexOf("image/") !== 0) {
					var oMessage = {
						TYPE: 'E',
						MESSAGE: 'MSG_ATTACHMENT_FILE_EXT_NOT_ALLOWED_IMG',
						REF_ID: iId,
						REF_FIELD: 'FILE_NAME',
						PARAMETERS: []
					};
					return [oMessage];
				}
			}
			if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleVideo) {
				var sFileExt = sFileName.split('.').pop();
				if (!sFileExt || sFileExt.length === 0 || sMediaType.indexOf("video/") !== 0) {
					var oMessage = {
						TYPE: 'E',
						MESSAGE: 'MSG_ATTACHMENT_FILE_EXT_NOT_ALLOWED_VID',
						REF_ID: iId,
						REF_FIELD: 'FILE_NAME',
						PARAMETERS: []
					};
					return [oMessage];
				}
			}
			return [];
		},

		renderer: function(oRm, oControl) {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass(oControl._sValueStyle);
			oRm.writeClasses();
			oRm.write(">");

			if (oControl.bFileUploadSupported) {
				if ((oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle
						.CampaignListImage || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || oControl.getStyle() === sap.ui
						.ino.controls.FileUploaderStyle.CampaignDetailImage || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.UserImage || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage) &&
					oControl.getAttachmentId() > 0) {
					if (oControl.getAttachmentMediaType() && oControl.getAttachmentMediaType().indexOf("image/") === 0) {
						if (!oControl._cropImageContainer) {
							oRm.write("<div");
							oRm.writeAttributeEscaped("tabindex", "0");
							oRm.writeAttributeEscaped("title", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR_CROP_TITLEIMAGE"));
							oRm.addClass("sapUiInoFileUploaderCropImageContainer");
							oRm.addClass("sapUiInoFileUploaderCropImageContainerHidden");
							oRm.writeClasses();
							oRm.write(">");
							oRm.write("<img");
							oRm.writeAttributeEscaped("src", Configuration.getAttachmentDownloadURL(oControl.getAttachmentId()));
							oRm.writeAttributeEscaped("title", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR_CROP_TITLEIMAGE"));
							oRm.addClass("sapUiInoFileUploaderCropImage");
							oRm.writeClasses();
							oRm.write("></img>");
							oRm.write("</div>");
						} else {
							oRm.write(oControl._cropImageContainer.outerHTML);
						}
					}
				}

				oRm.write("<div");
				oRm.addClass("sapUiInoFileUploaderInputContainer");
				oRm.writeClasses();
				oRm.write(">");

				oRm.write("<input type=\"file\" name=\"files[]\" tabindex=\"-1\"");
				if (oControl.getUploadTooltip()) {
					oRm.write(" title=\"" + oControl.getUploadTooltip() + "\"");
				}
				if (oControl.getAccept()) {
					oRm.write(" accept=\"" + oControl.getAccept() + "\"");
				}
				if (oControl.getMultiple() && oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.Attachment) {
					oRm.write(" multiple");
				}
				oRm.write("/>");

				oRm.write("</div>");

				oRm.write("<div");
				oRm.addClass("sapUiInoFileUploaderClick");
				var iStyle = oControl.getStyle();
				if (oControl.getAttachmentId() > 0 || iStyle === sap.ui.ino.controls.FileUploaderStyle.Attachment || iStyle === sap.ui.ino.controls.FileUploaderStyle
					.AttachmentTitleImage || iStyle === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleVideo || iStyle === sap.ui.ino.controls.FileUploaderStyle
					.ImageWithDefaultValue) {
					oRm.writeAttributeEscaped("tabindex", "-1");
				} else {
					oRm.writeAttributeEscaped("tabindex", "0");
				}
				oRm.writeClasses();
				if (oControl.getUploadTooltip()) {
					oRm.write(" title=\"" + oControl.getUploadTooltip() + "\"");
				}
				oRm.write(">");
				oRm.write("</div>");

			} else {
				oRm.renderControl(oControl.getAggregation("_fileUploader"));
			}

			if (oControl.getAttachmentId() > 0) {
				if (oControl.getAggregation("_clearButton")) {
					oRm.renderControl(oControl.getAggregation("_clearButton"));
				}
				if (oControl.getAggregation("_cropButton")) {
					oRm.renderControl(oControl.getAggregation("_cropButton"));
				}
				if (oControl.getAttachmentMediaType() && oControl.getAttachmentMediaType().indexOf("image/") === 0) {
					if (oControl.getAggregation("_zoomPlusButton")) {
						oRm.renderControl(oControl.getAggregation("_zoomPlusButton"));
					}
					if (oControl.getAggregation("_zoomMinusButton")) {
						oRm.renderControl(oControl.getAggregation("_zoomMinusButton"));
					}
					if (oControl.getAggregation("_moveUpButton")) {
						oRm.renderControl(oControl.getAggregation("_moveUpButton"));
					}
					if (oControl.getAggregation("_moveDownButton")) {
						oRm.renderControl(oControl.getAggregation("_moveDownButton"));
					}
					if (oControl.getAggregation("_moveLeftButton")) {
						oRm.renderControl(oControl.getAggregation("_moveLeftButton"));
					}
					if (oControl.getAggregation("_moveRightButton")) {
						oRm.renderControl(oControl.getAggregation("_moveRightButton"));
					}
				}
			}

			if (oControl.getShowFileUploaderTextControls() && (oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.Attachment ||
				oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.AttachmentTitleVideo || oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue)) {

				oRm.write("<div");
				oRm.addClass("sapUiInoFileUploaderNameContainer");
				oRm.writeClasses();
				oRm.write(">");

				if (oControl.bFileUploadSupported) {
					oRm.write("<a");
					oRm.writeAttributeEscaped("tabindex", "0");
					if (oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage) {
						oRm.writeAttributeEscaped("aria-label", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR_TITLEIMAGE"));
					} else if (oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleVideo) {
						oRm.writeAttributeEscaped("aria-label", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR_TITLEVIDEO"));
					} else if (oControl.getStyle() === sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue) {
						oRm.writeAttributeEscaped("aria-label", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR_BACKGROUNDIMAGE"));
					} else {
						oRm.writeAttributeEscaped("aria-label", i18n.getText("CTRL_FILEUPLOADER_EXP_WAI_ARIA_SELECTOR"));
					}
				} else {
					oRm.write("<div");
				}
				oRm.addClass("sapUiInoFileUploaderName");
				oRm.writeClasses();
				oRm.write(" title=\"" + oControl.getUploadTooltip() + "\"");
				oRm.write(">");
				oRm.writeEscaped(oControl.getUploadTooltip());
				if (oControl.bFileUploadSupported) {
					oRm.write("</a>");
				} else {
					oRm.write("</div>");
				}

				oRm.write("</div>");
			}
			oRm.write("</div>");

			oRm.write("<div");
			oRm.writeControlData(oControl);
			//oRm.addClass("sapUiInoFileUploaderName");
			//oRm.writeClasses();
			oRm.write(">");
			if (oControl.bFileUploadSupported) {
				if (oControl.getShowUploadFileControls()) {
					if (oControl.getAggregation("_uploadFileButton") && oControl._alreadyRenderBtn < 2) {
						oRm.renderControl(oControl.getAggregation("_uploadFileButton"));
						oControl._setAlreadyRenderBtn();
						if (oControl.getUploadFileControlsText()) {
							oRm.write("&nbsp;<span");
							oRm.addClass("sapUiInoUploadFileControlsText");
							oRm.writeClasses();
							oRm.write(">");
							oRm.write(oControl.getUploadFileControlsText() + "</span>");
						}
					}
				}
			}
			oRm.write("</div>");

		},

		onAfterRendering: function() {
			this._setFocus();

			var sStyle = this._classForStyle();
			var that = this;
			if (this.bFileUploadSupported) {
				jQuery(this.getDomRef()).find(".sapUiInoFileUploaderClick").click(function() {
					that._sFocus = "preview";
					jQuery(that.getDomRef()).find("input").click();
				});
				if (that.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || that.getStyle() === sap.ui.ino.controls.FileUploaderStyle
					.CampaignListImage || that.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || that.getStyle() === sap.ui.ino.controls
					.FileUploaderStyle.UserImage || that.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage) {
					jQuery(this.getDomRef()).find(".sapUiInoFileUploaderClick").keypress(function(oEvent) {
						if (oEvent.which === 13 /* ENTER */ || oEvent.which === 32 /* SPACE */ ) {
							that._sFocus = "preview";
							jQuery(that.getDomRef()).find("input").click();
							oEvent.preventDefault();
							oEvent.stopPropagation();
						}
					});
				}

				jQuery(this.getDomRef()).find(".sapUiInoFileUploaderName").click(function() {
					that._sFocus = "name";
					jQuery(that.getDomRef()).find("input").click();
				});
				jQuery(this.getDomRef()).find(".sapUiInoFileUploaderName").keypress(function(oEvent) {
					if (oEvent.which === 13 /* ENTER */ || oEvent.which === 32 /* SPACE */ ) {
						that._sFocus = "name";
						jQuery(that.getDomRef()).find("input").click();
						oEvent.preventDefault();
						oEvent.stopPropagation();
					}
				});
				jQuery(this.getDomRef()).find("input").on("change", function(evt) {
					evt.originalEvent.stopPropagation();
					evt.originalEvent.preventDefault();
					if(that.getCompressed()){
    					that._compressFiles(evt.originalEvent.target.files).then(function(aBlobs) {
    						that._uploadFiles(aBlobs);
    					});
					} else {
					    that._uploadFiles([evt.originalEvent.target.files[0]]);
					}
				});

				var dropZone = jQuery(this.getDomRef());
				dropZone.on("dragover", function(evt) {
					evt.originalEvent.stopPropagation();
					evt.originalEvent.preventDefault();
					evt.originalEvent.dataTransfer.dropEffect = "copy";
					jQuery(that.getDomRef()).addClass("sapUiInoFileUploaderDragOver");
					// Currently evt.originalEvent.dataTransfer.items only supported in Chrome
					/*
					 * if (that.getStyle() != sap.ui.ino.controls.FileUploaderStyle.Attachment) {
					 * evt.originalEvent.dataTransfer.dropEffect = "copy";
					 * jQuery(that.getDomRef()).addClass("sapUiInoFileUploaderDragOver"); } else { if
					 * (evt.originalEvent.dataTransfer && evt.originalEvent.dataTransfer.items &&
					 * evt.originalEvent.dataTransfer.items.length > 0) { for ( var i = 0; i <
					 * evt.originalEvent.dataTransfer.items.length; i++) { if
					 * (evt.originalEvent.dataTransfer.items[i].kind == "file") {
					 * evt.originalEvent.dataTransfer.dropEffect = "copy";
					 * jQuery(that.getDomRef()).addClass("sapUiInoFileUploaderDragOver"); break; } } } }
					 */
				});
				dropZone.on("dragleave", function(evt) {
					evt.originalEvent.stopPropagation();
					evt.originalEvent.preventDefault();
					jQuery(that.getDomRef()).removeClass("sapUiInoFileUploaderDragOver");
				});
				dropZone.on("drop", function(evt) {
					evt.originalEvent.stopPropagation();
					evt.originalEvent.preventDefault();
					if (evt.originalEvent.dataTransfer) {
						if (evt.originalEvent.dataTransfer.files && evt.originalEvent.dataTransfer.files.length > 0) {
							that._uploadFiles(evt.originalEvent.dataTransfer.files);
						} else if (evt.originalEvent.dataTransfer.getData("text/uri-list")) {
							that._linkUrl(evt.originalEvent.dataTransfer.getData("text/uri-list"));
						}
					}
				});
				jQuery(this.getDomRef()).addClass("sapUiInoFileUploader");
				jQuery(this.getDomRef()).addClass(sStyle);

				if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
					.ImageWithDefaultValue) {
					if (this.getAttachmentId()) {
						this._addPreview();
					} else {
						this._removePreview();
					}
				}

				if (this.getAttachmentMediaType() && this.getAttachmentMediaType().indexOf("image/") === 0) {
					if (!this._cropImageContainer) {
						var oImg = this.cropImage();
						if (oImg) {
							oImg.onload = function() {
								that.cropInit();
								jQuery(that.cropImageContainer()).removeClass("sapUiInoFileUploaderCropImageContainerHidden");
							};
						}
					} else {
						that.cropInit(true);
					}
					this._cropImageContainer = this.cropImageContainer();
				}

			} else {
				var fileUploader = this.getAggregation("_fileUploader");
				jQuery(fileUploader.getDomRef()).addClass("sapUiInoFileUploaderControl");
				var oFileInputGroup = jQuery(fileUploader.getDomRef()).find(".sapUiFupGroup");
				var ofileUploaderInput = jQuery(oFileInputGroup).find("input");
				ofileUploaderInput.addClass("sapUiInoFileUploaderInput");
				var ofileUploaderButton = jQuery(oFileInputGroup).find("button");
				ofileUploaderButton.html("");
				ofileUploaderButton.attr("title", this.getUploadTooltip());
				ofileUploaderButton.addClass("sapUiInoFileUploader");
				ofileUploaderButton.addClass("sapUiInoFileUploaderButton");
				ofileUploaderButton.addClass(sStyle);
				if (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
					.ImageWithDefaultValue) {
					if (this.getAttachmentId()) {
						this._addPreview();
					} else {
						this._removePreview();
					}
				}

				var oFileInputMask = jQuery(fileUploader.getDomRef()).find(".sapUiFupInputMask");
				var ofileUploaderMaskFileInput = jQuery(oFileInputMask).find("input:file");
				if (this.getAccept()) {
					ofileUploaderMaskFileInput.attr("accept", this.getAccept());
				}

				ofileUploaderInput.attr("tabindex", "-1");
				ofileUploaderButton.attr("tabindex", "-1");

				var aFileUploaderInput = jQuery(oFileInputMask).find("input");
				for (var ii = 0; ii < aFileUploaderInput.length; ++ii) {
					jQuery(aFileUploaderInput[ii]).attr("tabindex", "-1");
				}

				// for IE 9 no tabindex
				var sAgent = window.navigator.userAgent;
				var bIsMSIE9 = sAgent.indexOf("MSIE 9") > -1;

				if (bIsMSIE9 || ((this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls
						.FileUploaderStyle.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || this.getStyle() ===
						sap.ui.ino.controls.FileUploaderStyle.CampaignDetailImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.UserImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage) &&
					this.getAttachmentId() > 0 && this.getAccept())) {
					ofileUploaderMaskFileInput.attr("tabindex", "-1");
				} else {
					ofileUploaderMaskFileInput.attr("tabindex", "0");
				}

				fileUploader.onfocusin = function() {
					if (!jQuery(fileUploader.getDomRef()).hasClass("sapUiInoFileUploadFocus")) {
						jQuery(fileUploader.getDomRef()).addClass("sapUiInoFileUploadFocus");
					}
				};

				fileUploader.onfocusout = function() {
					jQuery(fileUploader.getDomRef()).removeClass("sapUiInoFileUploadFocus");
				};

				/*
				 * Not supported: if (this.getMultiple()) { ofileUploaderMaskFileInput.attr("multiple", "multiple"); }
				 */
			}

			if (!this._cropImageContainer && (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage || this.getStyle() ===
				sap.ui.ino.controls.FileUploaderStyle.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage ||
				this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignDetailImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.UserImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.AttachmentTitleImage || this.getStyle() === sap.ui.ino.controls
				.FileUploaderStyle.ImageWithDefaultValue) && this.getAttachmentId() > 0) {
				if (!this.getAttachmentMediaType() || this.getAttachmentMediaType().indexOf("image/") === 0) {
					this._addPreview();
				}
			}
		},

		_setFocus: function() {
			var that = this;

			if ((this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
					.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage || this.getStyle() === sap.ui.ino.controls
					.FileUploaderStyle.CampaignDetailImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.UserImage) && this.getAttachmentId() >
				0 && this.getAccept()) {

				switch (that._sFocus) {
					case "preview":
						if (this.cropImage()) {
							jQuery(this.cropImage()).parent().focus();
						}
						break;
					case "click":
						setTimeout(function() {
							if (that.bFileUploadSupported) {
								jQuery(that.getDomRef()).find(".sapUiInoFileUploaderClick").focus();
							} else {
								var fileUploader = that.getAggregation("_fileUploader");
								var oFileInputMask = jQuery(fileUploader.getDomRef()).find(".sapUiFupInputMask");
								var ofileUploaderMaskFileInput = jQuery(oFileInputMask).find("input:file");
								ofileUploaderMaskFileInput.focus();
							}
						}, 1);
						break;
					case "name":
						setTimeout(function() {
							jQuery(that.getDomRef()).find(".sapUiInoFileUploaderName").focus();
						}, 1);
						break;
					default:
						break;
				}
			} else {
				switch (that._sFocus) {
					case "preview":
					case "click":
					case "name":
						setTimeout(function() {
							if (that.bFileUploadSupported) {
								jQuery(that.getDomRef()).find(".sapUiInoFileUploaderClick").focus();
							} else {
								var fileUploader = that.getAggregation("_fileUploader");
								var oFileInputMask = jQuery(fileUploader.getDomRef()).find(".sapUiFupInputMask");
								var ofileUploaderMaskFileInput = jQuery(oFileInputMask).find("input:file");
								ofileUploaderMaskFileInput.focus();
							}
						}, 1);
						break;
					default:
						break;

				}
			}

			this._sFocus = undefined;
		},

		cropInit: function(bSupressInitImage) {
			this.cropInitMove();
			this.cropInitScrollZoom();
			if (!bSupressInitImage) {
				this.cropInitImage();
			}
			this.cropCheckButtons();
		},

		cropImageContainer: function() {
			return jQuery(this.getDomRef()).find(".sapUiInoFileUploaderCropImageContainer")[0];
		},

		cropImage: function() {
			return jQuery(this.getDomRef()).find(".sapUiInoFileUploaderCropImage")[0];
		},

		cropInitImage: function() {
			var oImg = this.cropImage();
			var jDom = jQuery(this.getDomRef());
			var ratio = oImg.naturalWidth / oImg.naturalHeight;
			var zoomX = jDom.width() - oImg.naturalWidth;
			var zoomY = jDom.height() - oImg.naturalHeight;
			var dx = zoomX > zoomY * ratio ? zoomX : zoomY * ratio;
			this.cropZoomBy(dx);
			jQuery(oImg).css({
				"left": 0,
				"top": 0,
				"position": "relative"
			});
		},

		cropInitMove: function() {
			var that = this;
			var oImg = this.cropImage();
			var jImg = jQuery(oImg);
			// Desktop Mouse
			jImg.on("mousedown", function(e) {
				e.preventDefault();
				var posX = jImg.offset().left - e.pageX;
				var posY = jImg.offset().top - e.pageY;
				jImg.on("mousemove", function(e) {
					that.cropMoveAt(posX + e.pageX, posY + e.pageY);
				});
			}).on("mouseup", function() {
				jImg.off("mousemove");
			}).on("mouseout", function() {
				jImg.off("mousemove");
			});
			// Mobile Touch
			jImg.on("touchstart", function(e) {
				e.preventDefault();
				if (e.touches && e.touches.length > 0) {
					var t = e.touches[0];
					var posX = jImg.offset().left - t.pageX;
					var posY = jImg.offset().top - t.pageY;
					var dist = -1;
					jImg.on("touchmove", function(e) {
						if (e.touches && e.touches.length > 0) {
							if (e.touches.length == 2) {
								var t1 = e.touches[0];
								var t2 = e.touches[1];
								var newDist = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2));
								if (dist > 0) {
									that.cropZoomBy(newDist - dist);
								}
								dist = newDist;
							} else {
								var t = e.touches[0];
								that.cropMoveAt(posX + t.pageX, posY + t.pageY);
							}
						}
					});
				}
			}).on("touchend", function() {
				jImg.off("touchmove");
			});
		},

		cropInitScrollZoom: function() {
			var that = this;
			var oImg = this.cropImage();
			var jImg = jQuery(oImg);
			jImg.parent().bind("wheel mousewheel", function(e) {
				if (e.originalEvent.deltaY > 0) {
					that.cropZoom(-1.0);
				} else {
					that.cropZoom(1.0);
				}
				e.originalEvent.preventDefault();
				e.originalEvent.stopPropagation();
				e.originalEvent.stopImmediatePropagation();
				return false;
			});
		},

		onkeydown: function(oEvent) {
			var bStopBubble = true;
			switch (oEvent.keyCode) {
				case jQuery.sap.KeyCodes.ARROW_LEFT:
					this.cropMoveBy(-1, 0);
					break;
				case jQuery.sap.KeyCodes.ARROW_UP:
					this.cropMoveBy(0, -1);
					break;
				case jQuery.sap.KeyCodes.ARROW_RIGHT:
					this.cropMoveBy(1, 0);
					break;
				case jQuery.sap.KeyCodes.ARROW_DOWN:
					this.cropMoveBy(0, 1);
					break;
				case jQuery.sap.KeyCodes.PLUS:
				case jQuery.sap.KeyCodes.NUMPAD_PLUS:
				case 171: // Firefox: PLUS (no constant)
					this.cropZoom(1.0);
					break;
				case jQuery.sap.KeyCodes.SLASH:
				case jQuery.sap.KeyCodes.MINUS:
				case jQuery.sap.KeyCodes.NUMPAD_MINUS:
				case 173: // Firefox: MINUS (no constant)
					this.cropZoom(-1.0);
					break;
				default:
					bStopBubble = false;
					break;
			}
			if (bStopBubble) {
				oEvent.preventDefault();
				oEvent.stopPropagation();
				oEvent.stopImmediatePropagation();
			}
		},

		cropCheckButtons: function() {
			var jImg = jQuery(this.cropImage());
			var jDom = jQuery(this.getDomRef());
			var maxLeft = -(jImg.width() - jDom.width());
			var maxTop = -(jImg.height() - jDom.height());
			var left = parseInt(jImg.css("left"), 10);
			var top = parseInt(jImg.css("top"), 10);

			if (this.getAggregation("_zoomPlusButton")) {
				this.getAggregation("_zoomPlusButton").setEnabled(true);
			}
			if (this.getAggregation("_zoomMinusButton")) {
				this.getAggregation("_zoomMinusButton").setEnabled(jImg.width() > jDom.width() && jImg.height() > jDom.height());
			}
			if (this.getAggregation("_moveUpButton")) {
				this.getAggregation("_moveUpButton").setEnabled(top > maxTop);
			}
			if (this.getAggregation("_moveDownButton")) {
				this.getAggregation("_moveDownButton").setEnabled(top < 0);
			}
			if (this.getAggregation("_moveLeftButton")) {
				this.getAggregation("_moveLeftButton").setEnabled(left > maxLeft);
			}
			if (this.getAggregation("_moveRightButton")) {
				this.getAggregation("_moveRightButton").setEnabled(left < 0);
			}
		},

		cropMoveAt: function(x, y) {
			var oImg = this.cropImage();
			var jImg = jQuery(oImg);
			var jDom = jQuery(this.getDomRef());
			jImg.offset({
				left: x,
				top: y
			});
			var maxLeft = -(jImg.width() - jDom.width());
			var maxTop = -(jImg.height() - jDom.height());
			var left = parseInt(jImg.css("left"), 10);
			var top = parseInt(jImg.css("top"), 10);
			if (top > 0) {
				jImg.css("top", 0);
			}
			if (top < maxTop) {
				jImg.css("top", maxTop);
			}
			if (left > 0) {
				jImg.css("left", 0);
			}
			if (left < maxLeft) {
				jImg.css("left", maxLeft);
			}
			this.cropCheckButtons();
		},

		cropMoveBy: function(dx, dy) {
			var oImg = this.cropImage();
			var pos = jQuery(oImg).offset();
			this.cropMoveAt(pos.left + dx, pos.top + dy);
		},

		cropZoom: function(factor) {
			this.cropZoomBy(10.0 * (factor || 1.0));
		},

		cropZoomBy: function(dx) {
			var oImg = this.cropImage();
			var jImg = jQuery(oImg);
			var jDom = jQuery(this.getDomRef());
			var ratio = jImg.width() / jImg.height();
			var newWidth = jImg.width() + dx;
			var newHeight = newWidth / ratio;
			if (newWidth < jDom.width() || newHeight < jDom.height()) {
				if (newWidth - jDom.width() < newHeight - jDom.height()) {
					newWidth = jDom.width();
					newHeight = newWidth / ratio;
				} else {
					newHeight = jDom.height();
					newWidth = ratio * newHeight;
				}
			}
			jImg.width(newWidth);
			jImg.height(newHeight);
			var pos = jImg.offset();
			this.cropMoveAt(pos.left - dx / 2.0, pos.top - dx / 2.0);
			this.cropCheckButtons();
		},

		crop: function() {
			var that = this;
			if (this.bFileUploadSupported && (this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage || this.getStyle() ===
				sap.ui.ino.controls.FileUploaderStyle.CampaignListImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.IdeaTitleImage ||
				this.getStyle() === sap.ui.ino.controls.FileUploaderStyle.CampaignDetailImage || this.getStyle() === sap.ui.ino.controls.FileUploaderStyle
				.UserImage) && this.getAttachmentId() > 0 && this.getAttachmentMediaType() && this.getAttachmentMediaType().indexOf("image/") === 0) {
				var oImg = this.cropImage();
				if (oImg) {
					var jImg = jQuery(oImg);
					var jDom = jQuery(this.getDomRef());
					if (jImg.width() !== jDom.width() || jImg.height() !== jDom.height()) {
						var oCanvas = document.createElement("canvas");
						var oContext = oCanvas.getContext("2d");
						oContext.mozImageSmoothingEnabled = true;
						oContext.webkitImageSmoothingEnabled = true;
						oContext.msImageSmoothingEnabled = true;
						oContext.imageSmoothingEnabled = true;

						oCanvas.width = jDom.width();
						oCanvas.height = jDom.height();

						oContext.fillStyle = "#FFFFFF";
						oContext.fillRect(0, 0, oCanvas.width, oCanvas.height);

						// Safari has issues when sx + swidth > naturalWidth or sy + sheight > naturalHeight
						// This happens when the image was zoomed and the cropped area is outside of the natural size
						// bounds in the zoomed image:
						// To fix this the following is performed on the width and heights
						// - Current image left position (originalLeft) is substracted from width
						// - Current image top position (originalTop) is substracted from height
						// - Relative image left position to natural (left) is substracted from swidth
						// - Relative image top position to natural (top) is substracted from swidth
						var originalLeft = Math.abs(parseInt(jImg.css("left"), 10));
						var originalTop = Math.abs(parseInt(jImg.css("top"), 10));
						var left = originalLeft * (oImg.naturalWidth / jImg.width());
						var top = originalTop * (oImg.naturalHeight / jImg.height());

						var width = oImg.naturalWidth;
						var height = oImg.naturalHeight;

						var oImgNameRequest = sap.ui.ino.models.object.Attachment.getAttachmentImgName(that.getAttachmentId());
						oImgNameRequest.done(function(oResponse) {
							that.cropDrawImage(oContext, oImg, left, top, width - left, height - top, 0, 0, jImg.width() - originalLeft, jImg.height() -
								originalTop);
							var sCropImageUrl = oCanvas.toDataURL(that.getAttachmentMediaType());

							var aBlobBin = atob(sCropImageUrl.split(",")[1]);
							var aArray = [];
							for (var i = 0; i < aBlobBin.length; i++) {
								aArray.push(aBlobBin.charCodeAt(i));
							}
							var oFile = new Blob([new Uint8Array(aArray)], {
								type: that.getAttachmentMediaType()
							});
							oFile.name = oResponse.split('"FILE_NAME":"')[1].split('"')[0];
							that._compressFiles([oFile]).then(function(aBlobs) {
								var oDeferred = new jQuery.Deferred();
								that._uploadFiles(aBlobs).then(function() {
									oDeferred.resolve(true);
								}, function() {
									oDeferred.resolve(false);
								});
								return oDeferred.promise();
							});
						});
					}
				}
			}
			return false;
		},

		cropCalcVerticalRatio: function(oImg) {
			if (!sap.ui.Device.os.ios) {
				return 1.0;
			}
			// iOS does not draw images in correct ratio on canvas => calculate correct vertical ratio
			var iNaturalHeight = oImg.naturalHeight;
			var oCanvas = document.createElement("canvas");
			oCanvas.width = 1.0;
			oCanvas.height = iNaturalHeight;
			var oContext = oCanvas.getContext("2d");
			oContext.drawImage(oImg, 0, 0);
			var aData = oContext.getImageData(0, 0, 1, iNaturalHeight).data;
			var iStartY = 0;
			var iCurrentY = iNaturalHeight;
			var iPointY = iNaturalHeight;
			while (iPointY > iStartY) {
				var fAlpha = aData[(iPointY - 1) * 4 + 3];
				if (fAlpha === 0) {
					iCurrentY = iPointY;
				} else {
					iStartY = iPointY;
				}
				iPointY = (iCurrentY + iStartY) >> 1;
			}
			var fRatio = (iPointY / iNaturalHeight);
			return (fRatio === 0) ? 1.0 : fRatio;
		},

		cropDrawImage: function(context, img, sx, sy, swidth, sheight, x, y, width, height) {
			var fVerticalRatio = 1.0; // this.cropCalcVerticalRatio(img); iOS Bug - already fixed
			context.drawImage(img, sx * fVerticalRatio, sy * fVerticalRatio, swidth * fVerticalRatio, sheight * fVerticalRatio, x, y, width,
				height);
		},

		uploadFileBtn: function() {
			this._sFocus = "preview";
			jQuery(this.getDomRef()).find("input").click();
		}
	});
})();