sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/m/Token",
    "sap/ino/commons/models/object/Blog",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/core/ResizeHandler",
    "sap/ui/Device",
    "sap/ui/core/HTML",
    "sap/ino/commons/models/object/Attachment",
    "sap/m/MessageToast",
    "sap/ino/commons/application/Configuration"],
	function(BaseController, Token, Blog, TopLevelPageFacet, ResizeHandler, Device, HTML, Attachment,
		MessageToast, Configuration) {

		"use strict";
		return BaseController.extend("sap.ino.vc.blog.Modify", jQuery.extend({}, TopLevelPageFacet, {
			routes: ["blog-edit", "blog-create"],

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this._dViewShown = jQuery.Deferred();
				this.setViewProperty("/EDIT", true);
				this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());
				this._bindingTags();
			},

			onRouteMatched: function() {
				var oController = this;
				BaseController.prototype.onRouteMatched.apply(oController, arguments);
				oController._destroyRTE();
				jQuery.when(this._dViewShown).done(function() {
					oController._initRTE();
				});
				oController.setHelp("CAMPAIGN_BLOG_MODIFY");
			},

			createObjectModel: function(vObjectKey, sRoute, oRouteArgs) {
				var oKey = vObjectKey;
				var oSettings = {
					nodes: ["Root"],
					actions: ["submit", "publish", "majorPublishSubmit", "publishSubmit", "del"],
					continuousUse: true,
					concurrencyEnabled: true,
					readSource: {
						model: this.getDefaultODataModel()
					}
				};
				if (!oKey) {
					var mQuery = oRouteArgs["?query"] || {};
					try {
						oKey = {
							OBJECT_TYPE_CODE: "CAMPAIGN",
							OBJECT_ID: mQuery.campaign ? parseInt(mQuery.campaign, 10) : 0,
							CAMPAIGN_ID: mQuery.campaign ? parseInt(mQuery.campaign, 10) : 0,
							NAME: mQuery.title,
							DESCRIPTION: mQuery.description,
							Tags: mQuery.tags && mQuery.tags.split(",")
						};
					} catch (oError) {
						jQuery.sap.log.error("Failed parsing creation arguments", oError, "sap.ino.vc.blog.Modify.controller");
					}
				}
				return new Blog(oKey, oSettings);
			},

			onAfterHide: function() {
				this._dViewShown = jQuery.Deferred();
				this._destroyRTE();
			},

			onCampaignPressed: function() {
				//OBJECT_ID
				var iId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
				this.navigateTo("campaign", {
					id: iId
				}, true);
			},

			onFileUploaderChange: function(oEvent) {
				var oFileUploader = oEvent.getSource();
				var aFile = oEvent.getParameter("files");
				oFileUploader.setBusy(true);
				Attachment.prepareFileUploader(oFileUploader, aFile);
			},

			onFileUploaderComplete: function(oEvent) {
				var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
				var oFileUploader = oEvent.getSource();
				if (oResponse) {
					var oObject = this.getObjectModel();
					oObject.getMessageParser().parse(oResponse);
					if (oResponse.success) {
						oObject.setTitleImage({
							"ATTACHMENT_ID": oResponse.attachmentId,
							"FILE_NAME": oResponse.fileName,
							"MEDIA_TYPE": oResponse.mediaType
						});
					} else {
						MessageToast.show(this.getText("BLOG_OBJECT_MSG_TITLE_IMAGE_FAILED"));
					}
				} else {
					MessageToast.show(this.getText("BLOG_OBJECT_MSG_TITLE_IMAGE_ERROR"));
				}
				oFileUploader.setBusy(false);
				oFileUploader.clear();
			},

			onTagChanged: function(oEvent) {
				var oMultiInput = oEvent.getSource();
				var sValue = oEvent.getParameter("value");
				if (!sValue) {
					return;
				}
				if (!oEvent.getSource().getAggregation("tokenizer")) {
					return;
				}
				var aTokens = oEvent.getSource().getAggregation("tokenizer").getAggregation("tokens");
				var aTag = sValue.split(",");
				aTag.forEach(function(sTag) {
					sTag = sTag.trim();
					if (sTag === "") {
						return;
					}

					var oToken = new Token({
						text: sTag
					});
					// This is an application internal flag to handle
					// model update correctly
					var bTokenExisted;
					aTokens.forEach(function(oToken) {
						if (oToken.getProperty("text") === sTag) {
							bTokenExisted = true;
							return;
						}
					});
					if (!bTokenExisted) {
						oToken.bApplicationCreated = true;
						oMultiInput.addToken(oToken);
					}
				});
				oMultiInput.setValue("");
			},

			onTagTokenChanged: function(oEvent) {
				var oMultiInput = oEvent.getSource();

				if (!oEvent.getSource().getAggregation("tokenizer")) {
					return;
				}

				oMultiInput.setValue("");
			},

			onSave: function() {
				this._executeAction("submit");
			},

			onPublish: function() {
				this._executeAction("majorPublishSubmit");
			},

			onPublishAction: function(oEvent) {
				var sItem = oEvent.getParameter("item");
				if (!sItem) {
					return;
				}
				this._executeAction(sItem.getProperty("key") || "publishSubmit");
			},

			onUnPublish: function() {
				this._executeAction("unPublishSubmit");
			},

			onAfterShow: function() {
				this._dViewShown.resolve();
			},

			_executeAction: function(sAction) {
				var oController = this;
				oController.resetClientMessages();
				var oCurrrentModel = oController.getObjectModel();
				var isNew = oCurrrentModel.isNew();
				this._CheckContentAttachments(oCurrrentModel);
				var oModifyRequest = oController.executeObjectAction(sAction);
				oModifyRequest.done(function() {
					if (isNew && sAction === "submit") {
						oController.navigateTo("blog-edit", {
							id: oCurrrentModel.getKey()
						}, true);
					} else {
						oController.navigateTo("blog-display", {
							id: oCurrrentModel.getKey()
						}, true);
					}
				});
			},

			_initDetails: function() {
				this._sTitleText = undefined;
				this._sDescriptionText = undefined;
				this._aTags = undefined;
			},

			_bindingTags: function() {
				this.addMultiInputHandling(this.byId("Tags"), {
					childNodeName: "Tags",
					childNodeNameSingular: "Tag",
					suggestion: {
						key: "NAME",
						text: "NAME",
						path: "data>/SearchTagsParams(searchToken='$suggestValue')/Results",
						filter: [],
						sorter: []
					},
					token: {
						key: "NAME",
						text: "NAME"
					}
				});
			},

			// resizes the height of the richtext editor
			_onResize: function(oEvent) {
				var oView;
				var iHeight;
				var iOldHeight;
				if (oEvent) {
					oView = oEvent.control;
					iHeight = oEvent.size.height;
					iOldHeight = oEvent.oldSize.height;
				} else {
					oView = this.getView();
					iHeight = oView.$().height();
					iOldHeight = 0;
				}

				var oRTE = oView.getController()._getRTE();
				if (!oRTE || oRTE.getMetadata().getName() !== "sap.ino.controls.RichTextEditor") {
					return;
				}

				if (Math.abs(iHeight - iOldHeight) > 0) {
					var $Container = oView.$().find(".sapInoBlogModify");
					// this requires px values
					var iMin = parseInt($Container.css("min-height"), 10) || 400;
					var iMax = parseInt($Container.css("max-height"), 10) || 600;

					// the surounding container give only little possibilities to get the correct height
					// so we substract from the whole view the heights of the toolbar, header, other fields, ...
					iHeight = iHeight - 600;
					iHeight = iHeight < iMin ? iMin : iHeight;
					iHeight = iHeight > iMax ? iMax : iHeight;
					oRTE.setHeight(iHeight + "px");
				}
			},

			_initRTE: function() {
				var that = this;
				if (!Device.system.desktop) {
					return;
				}
				this._destroyRTE();
				// If it is not editable an HTML element is used as RTE otherwise updates
				// descriptions  also in read-only mode which leads to wrong data-loss handling
				// and the situation that blogs with non-editable descriptions cannot be saved any more
				var oRichTextContainer = this.byId("rteContainer");
				var oRichTextControl;
				that._TextControlID = "richtextBlogControl_" + new Date().getTime();

				// Otherwise there the RTE is not rendered properly when the application is launched uncached
				jQuery.sap.require("sap.ino.controls.RichTextEditor");
				oRichTextControl = new sap.ino.controls.RichTextEditor({
					id: this.createId(that._TextControlID),
					width: "100%",
					editable: true,
					editorType: "TinyMCE4",
					height: "300px",
					showGroupInsert: true,
					showGroupLink: true,
					showGroupFont: true,
					beforeEditorInit: function(c) {
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("image,", "");
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("powerpaste", "paste,imagetools");
						c.mParameters.configuration.paste_data_images = true;
						c.mParameters.configuration.automatic_uploads = true;
						c.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
							var oFileToUpload = oFile.blob();
							//oFileToUpload.name = "image-" + (new Date()).getTime() + Math.floor(Math.random() * 1000) + "." + oFileToUpload.type.substr(oFileToUpload.type.lastIndexOf("/") + 1);
							if (oFileToUpload) {
								Attachment.uploadFile(oFileToUpload).done(function(oResponse) {
									var oBlog = that.getObjectModel();
									success(Configuration.getAttachmentDownloadURL(oResponse.attachmentId));
									oBlog.setProperty("/DESCRIPTION", jQuery.sap._sanitizeHTML(tinymce.activeEditor.getContent()));
								}).fail(function() {
									failure();
									MessageToast.show(that.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_CROP_FAILED"));
								});
							}
						};
						c.mParameters.configuration.paste_postprocess = function(editor, fragment) {
							tinymce.activeEditor.uploadImages();
						};
					}
				});

				/*	oRichTextControl.addPlugin("paste");
				    oRichTextControl.attachBeforeEditorInit(function(c) {
					c.mParameters.configuration.paste_data_images = true;
				});*/
				oRichTextControl.attachReady(function onRTEReady() {
					this.bindProperty("value", {
						model: "object",
						path: "DESCRIPTION"
					});
					that._onResize();
					if (!this._sResizeRegId) {
						this._sResizeRegId = ResizeHandler.register(that.getView(), that._onResize);
					}
				});
				setTimeout(function() {
					oRichTextContainer.destroyItems();
					oRichTextContainer.addItem(oRichTextControl);
				}, 500);
			},

			_getRTE: function() {
				return this.byId(this._TextControlID);
			},

			_destroyRTE: function() {
				// Desktop: we use the RTE and need to calculate the best height
				if (this._sResizeRegId) {
					ResizeHandler.deregister(this._sResizeRegId);
				}

				// destroy RTE  when screen is not displayed any more as it will go mad
				// when bindings change and it is not displayed (yet)
				var oRTE = this._getRTE();
				if (oRTE) {
					oRTE.destroy();
				}
			},

			alternativeBlogBy: function(vBy, vIdentity, vAlternativeIdentity, vDate, vAlternativeDate, sStatusCode) {
				if (sStatusCode !== "sap.ino.config.BLOG_PUBLISHED") {
					return this.formatter.alternativeBy(vBy, vIdentity, vAlternativeIdentity, vDate, vAlternativeDate);
				} else {
					return this.formatter.alternativeBy(vBy, vIdentity, vAlternativeIdentity, vAlternativeDate, vDate);
				}
			},

			_CheckContentAttachments: function(oModel) {
				var content = oModel.getProperty("/DESCRIPTION"),
					aContentAttachments = [],
					aNewContentAttachments = [],
					aOriginContentAttachments = oModel.getProperty("/ContentAttachments");
				if (!content) {
					return;
				}
				var reg = new RegExp("<img.*attachment_download\.xsjs/(\\d+)\"", "g"),
					result;
				do {
					result = reg.exec(content);
					if (result && result.length === 2) {
						aContentAttachments.push(result[1]);
					}
				}
				while (result !== null);
				var tag = false,
					oTempAttachment = void 0;
				for (var i = 0; i <= aContentAttachments.length - 1; i++) {
					tag = false;
					oTempAttachment = undefined;
					for (var j = 0; j <= aOriginContentAttachments.length - 1; j++) {
						if (Number(aContentAttachments[i]) === aOriginContentAttachments[j].ATTACHMENT_ID) {
							tag = true;
							oTempAttachment = aOriginContentAttachments[j];
							break;
						}
					}
					if (tag) {
						aNewContentAttachments.push(oTempAttachment);
					} else {
						aNewContentAttachments.push({
							ID: oModel.getNextHandle(),
							ATTACHMENT_ID: Number(aContentAttachments[i])
						});
					}
				}
				oModel.setProperty("/ContentAttachments", aNewContentAttachments);
			}

		}));
	});