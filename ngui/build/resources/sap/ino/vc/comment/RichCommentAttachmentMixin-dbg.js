/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ui/unified/FileUploaderParameter",
    "sap/ino/commons/models/object/Attachment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/UploadCollection",
    "sap/ui/Device"
], function(Configuration, FileUploaderParameter, Attachment, MessageToast, JSONModel, UploadCollection, Device) {
	"use strict";
	/**
	 * @class
	 * Mixin that handles actions for Comment and Internal Note
	 */
	var RichCommentAttachmentMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	RichCommentAttachmentMixin.richAttachmentMixinInit = function() {
		this._attachmentCtlSetting = {
			listId: "commentAttachmentList",
			uploaderId: "commentAttachmentUploader"
		};
		if (!this.getBlockView().getModel("local")) {
			this.setModel(new JSONModel({
				ATTACHMENT_UPLOAD_URL: Attachment.getEndpointURL()
			}), "local");
		}
		var oAttachments = this.byId(this._attachmentCtlSetting.listId);
		var attachMentsList = this.getBlockView().byId(this._attachmentCtlSetting.listId);
		if (!oAttachments.getUploadEnabled()) {
			oAttachments.addStyleClass("sapInoAttachmentUploadInvisible");
		}
		attachMentsList.addEventDelegate({
			onAfterRendering: jQuery.proxy(function() {
				this.setRichAttachmentAccessibility();
			}, this)
		});
	};

	RichCommentAttachmentMixin.onRichCommentFileUploaderChange = function(oEvent) {
		var oFileUploader = oEvent.getSource();
		var aFile = oEvent.getParameter("files");
		oFileUploader.setBusy(true);
		Attachment.prepareFileUploader(oFileUploader, aFile);
	};

	RichCommentAttachmentMixin.onRichCommentFileUploaderComplete = function(oEvent) {
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
				MessageToast.show(this.getText("MSG_COMMENT_ATTACHMENT_IMAGE_FAILED"));
			}
		} else {
			MessageToast.show(this.getText("MSG_COMMENT_ATTACHEMENT_IMAGE_ERROR"));
		}
		oFileUploader.setBusy(false);
		oFileUploader.clear();
	};

	// called once per upload (not per file)
	RichCommentAttachmentMixin.richAttachmentMixinOnChange = function(oEvent) {
		var oUploadCollection = oEvent.getSource();
		var oCustomerHeaderToken = new FileUploaderParameter({
			name: "x-csrf-token",
			value: Configuration.getXSRFToken()
		});
		oUploadCollection.removeAllAggregation("headerParameters", true);
		oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		this._onRichCommentChange(oEvent);
	};

	RichCommentAttachmentMixin._onRichCommentChange = function(oEvent) {
		if (!oEvent) {
			return;
		}
		var that = this;
		var sRequestValue, iCountFiles, i, sFileName, oItem, sStatus;
		if (Device.browser.msie && Device.browser.version <= 9) {
			// FileUploader does not support files parameter for IE9 for the time being
			var sNewValue = oEvent.getParameter("newValue");
			if (!sNewValue) {
				return;
			}
			sFileName = sNewValue.split(/\" "/)[0];
			//sometimes onChange is called if no data was selected
			if (sFileName.length === 0) {
				return;
			}
		} else {
			iCountFiles = oEvent.getParameter("files").length;
			// FileUploader fires the change event also if no file was selected by the user
			// If so, do nothing.
			if (iCountFiles === 0) {
				return;
			}
		}
		var attachmentList = that.byId(this._attachmentCtlSetting.listId),
			uploader = that.byId(this._attachmentCtlSetting.uploaderId);
		var aParametersAfter = attachmentList.getAggregation("parameters");
		// parameters
		if (aParametersAfter) {
			jQuery.each(aParametersAfter, function(iIndex, parameter) {
				var oParameter = new sap.ui.unified.FileUploaderParameter({
					name: parameter.getProperty("name"),
					value: parameter.getProperty("value")
				});
				uploader.addParameter(oParameter);
			});
		}

		sStatus = UploadCollection._uploadingStatus;
		if (Device.browser.msie && Device.browser.version <= 9) {
			oItem = new sap.m.UploadCollectionItem({
				fileName: sFileName
			});
			oItem._status = sStatus;
			oItem._internalFileIndexWithinFileUploader = 1;
			oItem._percentUploaded = 0;
			attachmentList.aItems.unshift(oItem);
		} else {
			attachmentList._requestIdValue = attachmentList._requestIdValue + 1;
			sRequestValue = attachmentList._requestIdValue.toString();
			var aHeaderParametersAfter = attachmentList.getAggregation("headerParameters");

			for (i = 0; i < iCountFiles; i++) {
				oItem = new sap.m.UploadCollectionItem({
					fileName: oEvent.getParameter("files")[i].name
				});
				oItem._status = sStatus;
				oItem._internalFileIndexWithinFileUploader = i + 1;
				oItem._requestIdName = sRequestValue;
				oItem._percentUploaded = 0;
				attachmentList.aItems.unshift(oItem);
			}
			//headerParameters
			if (aHeaderParametersAfter) {
				jQuery.each(aHeaderParametersAfter, function(iIndex, headerParameter) {
					uploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
						name: headerParameter.getProperty("name"),
						value: headerParameter.getProperty("value")
					}));
				});
			}
			uploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: attachmentList._headerParamConst.requestIdName,
				value: sRequestValue
			}));
		}

		attachmentList.invalidate();
	};

	RichCommentAttachmentMixin.richAttachmentMixinonFileDeleted = function(oEvent) {
		var oItem = oEvent.getParameter("item");
		var oObject = this.getBlockView().getModel("comment");
		oObject.removeAttachment(parseInt(oItem.getDocumentId(), 10));
	};

	// called for every file
	RichCommentAttachmentMixin.richAttachmentMixinonBeforeUploadStarts = function(oEvent) {
		var oCustomerHeaderFilename = new FileUploaderParameter({
			name: "unicode_filename",
			value: Attachment.stringToUnicode(oEvent.getParameter("fileName"))
		});
		oEvent.getParameter("requestHeaders").push(oCustomerHeaderFilename);
		//oEvent.getParameters().addHeaderParameter(oCustomerHeaderFilename);
	};

	RichCommentAttachmentMixin.richAttachmentMixinonUploadProgress = function(oEvent) {
		if (!oEvent) {
			return;
		}
		var attachmentList = this.byId(this._attachmentCtlSetting.listId);
		var i, sPercentUploaded, iPercentUploaded, sRequestId, cItems, oProgressLabel, sItemId, $busyIndicator;
		sRequestId = attachmentList._getRequestId(oEvent);
		iPercentUploaded = Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100);
		if (iPercentUploaded === 100) {
			sPercentUploaded = attachmentList._oRb.getText("UPLOADCOLLECTION_UPLOAD_COMPLETED");
		} else {
			sPercentUploaded = attachmentList._oRb.getText("UPLOADCOLLECTION_UPLOADING", [iPercentUploaded]);
		}
		cItems = attachmentList.aItems.length;
		for (i = 0; i < cItems; i++) {
			if (attachmentList.aItems[i]._requestIdName === sRequestId &&
				attachmentList.aItems[i]._status === UploadCollection._uploadingStatus) {
				oProgressLabel = sap.ui.getCore().byId(attachmentList.aItems[i].getId() + "-ta_progress");
				//necessary for IE otherwise it comes to an error if onUploadProgress happens before the new item is added to the list
				if (!oProgressLabel) {
					continue;
				}
				oProgressLabel.setText(sPercentUploaded);
				attachmentList.aItems[i]._percentUploaded = iPercentUploaded;
				// add ARIA attribute for screen reader support
				sItemId = attachmentList.aItems[i].getId();
				$busyIndicator = jQuery.sap.byId(sItemId + "-ia_indicator");
				if (iPercentUploaded === 100) {
					$busyIndicator.attr("aria-label", sPercentUploaded);
				} else {
					$busyIndicator.attr("aria-valuenow", iPercentUploaded);
				}
				break;
			}
		}
	};

	RichCommentAttachmentMixin._onRichCommentUploadComplete = function(oEvent) {
		var that = this;
		var oObject = this.getBlockView().getModel("comment");
		var aFile = [{
			fileName: oEvent.getParameter("fileName"),
			responseRaw: oEvent.getParameter("responseRaw"),
			reponse: oEvent.getParameter("response"),
			status: oEvent.getParameter("status"),
			headers: oEvent.getParameter("headers")
		}];
		if (aFile.length > 0) {
			var bError = false;
			aFile.forEach(function(oFile) {
				var oResponse = Attachment.parseUploadResponse(oFile.responseRaw);
				oObject.getMessageParser().parse(oResponse);
				if (oResponse) {
					if (oResponse.success) {
						bError = that.uploadRichAttachmentSuccess(oObject, oResponse);
					} else {
						MessageToast.show(that.getText("OBJECT_MSG_ATTACHMENT_FAILED"));
						bError = true;
					}
				} else {
					MessageToast.show(that.getText("OBJECT_MSG_ATTACHMENT_ERROR"));
					bError = true;
				}
			});
			if (bError) {
				var oUploadCollection = this.byId(this._attachmentCtlSetting.listId);
				oUploadCollection.aItems = [];
				oUploadCollection.rerender();
			}
		}
	};

	RichCommentAttachmentMixin.richAttachmentMixinonUploadComplete = function(oEvent) {
		if (!oEvent) {
			return;
		}
		var oUploadCollection = this.byId(this._attachmentCtlSetting.listId);
		var i, sRequestId, sUploadedFile, cItems, bUploadSuccessful = checkRequestStatus();
		sRequestId = oUploadCollection._getRequestId(oEvent);
		sUploadedFile = oEvent.getParameter("fileName");

		// at the moment parameter fileName is not set in IE9
		if (!sUploadedFile) {
			var aUploadedFile = (oEvent.getSource().getProperty("value")).split(/\" "/);
			sUploadedFile = aUploadedFile[0];
		}
		cItems = oUploadCollection.aItems.length;
		for (i = 0; i < cItems; i++) {
			// sRequestId should be null only in case of IE9 because FileUploader does not support header parameters for it
			if (!sRequestId) {
				if (oUploadCollection.aItems[i]._status === UploadCollection._uploadingStatus && bUploadSuccessful) {
					oUploadCollection.aItems[i]._percentUploaded = 100;
					oUploadCollection.aItems[i]._status = UploadCollection._displayStatus;
					oUploadCollection._oItemToUpdate = null;
					break;
				} else if (oUploadCollection.aItems[i]._status === UploadCollection._uploadingStatus) {
					oUploadCollection.aItems.splice(i, 1);
					oUploadCollection._oItemToUpdate = null;
					break;
				}
			} else if (oUploadCollection.aItems[i]._requestIdName === sRequestId &&
				oUploadCollection.aItems[i]._status === UploadCollection._uploadingStatus && bUploadSuccessful) {
				oUploadCollection.aItems[i]._percentUploaded = 100;
				oUploadCollection.aItems[i]._status = UploadCollection._displayStatus;
				oUploadCollection._oItemToUpdate = null;
				break;
			} else if (oUploadCollection.aItems[i]._requestIdName === sRequestId &&
				oUploadCollection.aItems[i]._status === UploadCollection._uploadingStatus ||
				oUploadCollection.aItems[i]._status === UploadCollection._pendingUploadStatus) {
				oUploadCollection.aItems.splice(i, 1);
				oUploadCollection._oItemToUpdate = null;
				break;
			}
		}
		this._onRichCommentUploadComplete(oEvent);

		oUploadCollection.invalidate();

		function checkRequestStatus() {
			var sRequestStatus = oEvent.getParameter("status").toString() || "200"; // In case of IE version < 10, this function will not work.
			if (sRequestStatus[0] === "2" || sRequestStatus[0] === "3") {
				return true;
			} else {
				return false;
			}
		}
	};

	RichCommentAttachmentMixin.setRichAttachmentAccessibility = function() {
		var view = this.getBlockView();
		var element = view.byId(this._attachmentCtlSetting.listId).$();
		var isNone = element.find('.sapMListNoData');
		var list = element.find('.sapMListModeNone ');

		if (isNone.length) {
			list.hide();
			list.siblings().attr('tabindex', '-1');
		}
	};

	RichCommentAttachmentMixin.uploadRichAttachmentSuccess = function(oObject, oResponse) {
		oObject.addAttachment({
			"CREATED_BY_NAME": Configuration.getCurrentUser().NAME,
			"ATTACHMENT_ID": oResponse.attachmentId,
			"FILE_NAME": oResponse.fileName,
			"MEDIA_TYPE": oResponse.mediaType,
			"CREATED_AT": new Date()
		});
	};

	RichCommentAttachmentMixin.onRichCmtImgPressed = function(oEvent) {
		sap.m.URLHelper.redirect(oEvent.oSource.getProperty("src"), true);
	};

	RichCommentAttachmentMixin.onRichCmtIconPressed = function(oEvent) {
		var oItemList = oEvent.oSource.oParent.getItems();
		if (oItemList && oItemList.length >= 2) {
			sap.m.URLHelper.redirect(oItemList[2].getProperty("href"), true);
		}
	};

	RichCommentAttachmentMixin.addSomeMethodIntoModel = function(oModel) {
		oModel.addAttachment = function(oNewAttachment) {
			oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
			this.addChild(oNewAttachment, "Attachments");
		};

		oModel.removeAttachment = function(iId) {
			var aAttachment = jQuery.grep(this.getProperty("/Attachments") || [], function(oAttachment) {
				return oAttachment.ID === iId;
			});
			var oFirstAttachment = aAttachment && aAttachment[0];
			if (oFirstAttachment) {
				this.removeChild(oFirstAttachment);
			}
		};
	};

	return RichCommentAttachmentMixin;
});