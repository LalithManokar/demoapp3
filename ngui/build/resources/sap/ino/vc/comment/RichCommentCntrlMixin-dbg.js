/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/controls/CommentRichTxtEditor",
    "sap/m/Text",
    "sap/ino/commons/application/Configuration"
], function(CommentRichTxtEditor, Text, Configuration) {
	"use strict";
	/*
	 * @class Mixin that handles actions for Comment and Internal Note
	 */
	var RichCommentCntrlMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	RichCommentCntrlMixin._DIC_NEW_TITLE_LIST_ = {
		"sap.ino.commons.models.object.IdeaComment": {
			"title": "COMMENT_OBJECT_NEW_COMMENT_TIT"
		}
	};
	RichCommentCntrlMixin._destroyRTECtrl = function(controlId) {
		var oRte = this.byId(controlId);
		if (oRte) {
			oRte.destroy();
		}
	};
	RichCommentCntrlMixin._initRTE = function(oSetting) {
		var oController = this;
		var oRichTextContainer = oController._getRTEContainer();
		var oRichTextControl;

		if (oController._commentMixinSettings.type === "comment") {
			if (oRichTextContainer && oRichTextContainer.getItems().length > 1) {
				oRichTextContainer.removeItem(oRichTextContainer.getItems()[1]);
			}
			this._destroyRTECtrl(this._commentControlId);
			this._commentControlId = "commentControl" + new Date().getTime();
			oRichTextControl = new CommentRichTxtEditor({
				id: oController.createId(this._commentControlId),
				editable: {
					parts: [{
							path: 'data>COMMENT_HAS_PRIVILEGE'
							},
						{
							path: 'data>PARTICIPANT_CAN_COMMENT'
							},
						{
							path: 'data>OPEN_STATUS_SETTING'
							}],
					formatter: function(iCommentHasPrivilege, iCanComment, iOpenStatusSetting) {
						return oController.formatter.commentEnabled(iCommentHasPrivilege, iCanComment, iOpenStatusSetting);
					}
				},
				height: "200px"
			});
		} else if (oController._commentMixinSettings.type === "comment_reply") {
			if (oRichTextContainer && oRichTextContainer.getItems().length > 0) {
				oRichTextContainer.removeItem(oRichTextContainer.getItems()[0]);
			}
			this._destroyRTECtrl(this._commentReplyControlId);
			this._commentReplyControlId = "commentReplyControl" + new Date().getTime();
			oRichTextControl = new CommentRichTxtEditor({
				id: oController.createId(this._commentReplyControlId),
				editable: {
					parts: [{
							path: 'data>COMMENT_HAS_PRIVILEGE'
							},
						{
							path: 'data>PARTICIPANT_CAN_COMMENT'
							},
						{
							path: 'data>OPEN_STATUS_SETTING'
							}],
					formatter: function(iCommentHasPrivilege, iCanComment, iOpenStatusSetting) {
						return oController.formatter.commentEnabled(iCommentHasPrivilege, iCanComment, iOpenStatusSetting);
					}
				},
				height: "200px"
			});

		} else {
			if (oRichTextContainer && oRichTextContainer.getItems().length > 0) {
				oRichTextContainer.removeItem(oRichTextContainer.getItems()[0]);
			}
			this._destroyRTECtrl(this._internalControlId);
			this._internalControlId = "internalControl" + new Date().getTime();
			oRichTextControl = new CommentRichTxtEditor({
				id: oController.createId(this._internalControlId),
				height: "200px"
			});
		}

		oRichTextControl.attachReady(function onRTEReady() {
			oController.commentMixinForceInitCommentModel();
			this.bindProperty("value", {
				model: "comment",
				path: "/COMMENT"
			});
			oController._changePosHandleForTinyMce();
		});
		// 		oController.commentMixinForceInitCommentModel();

		// 		oController._changePosHandleForTinyMce();
		if (!oController._TITLE_TXT && oController.getBlockView().data("modelObjectType") && oController._DIC_NEW_TITLE_LIST_[oController.getBlockView()
			.data(
				"modelObjectType")]) {
			oRichTextContainer.insertItem(new Text({
				text: oController.getText(oController._DIC_NEW_TITLE_LIST_[oController.getBlockView().data("modelObjectType")].title)
			}), 0);
			oController._TITLE_TXT = true;
		}
		oRichTextContainer.addItem(oRichTextControl);
		// 		sap.ui.getCore().applyChanges();
	};

	RichCommentCntrlMixin._getRTEContainer = function() {
		return this.byId(this._commentMixinSettings.commentContainerId);
	};

	RichCommentCntrlMixin._getImgIds = function(sContent) {
		if (!sContent) {
			return [];
		}
		var url = this._getAttachmentDownloadUrl();
		if (!url) {
			return [];
		}
		var re = new RegExp(url.substr(url.lastIndexOf("/") + 1) + "/(\\d+)", "ig");
		var result = [];
		var oMatch = re.exec(sContent);
		while (oMatch) {
			result.push({
				ATTACHMENT_ID: Number(oMatch[1])
			});
			oMatch = re.exec(sContent);
		}
		return result;
	};

	RichCommentCntrlMixin._getAttachmentDownloadUrl = function() {
		var url = Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD");
		if (url) {
			return url.substr(url.lastIndexOf("/") + 1);
		}
		return "";
	};

	RichCommentCntrlMixin._changePosHandleForTinyMce = function() {
		var oController = this;
		if (window.tinyMCE && window.tinyMCE.dom && window.tinyMCE.dom.DOMUtils && window.tinyMCE.dom.DOMUtils.prototype.getPos) {
			window.tinyMCE.dom.DOMUtils.prototype.getPos = function(elm, rootElm) {
				return oController._getPosForTinyMce.call(window.tinyMCE.dom.DOMUtils.DOM, elm, rootElm);
			};
		}
	};

	RichCommentCntrlMixin._getPosForTinyMce = function(elm, rootElm) {
		var self = this,
			x = 0,
			y = 0,
			offsetParent, doc = self.doc,
			body = doc.body,
			pos, aTransform = "none";

		elm = self.get(elm);
		rootElm = rootElm || body;

		if (elm) {
			// Use getBoundingClientRect if it exists since it's faster than looping offset nodes
			// Fallback to offsetParent calculations if the body isn't static better since it stops at the body root
			if (rootElm === body && elm.getBoundingClientRect && $(body).css('position') === 'static') {
				pos = elm.getBoundingClientRect();
				rootElm = self.boxModel ? doc.documentElement : body;

				// Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
				// Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
				x = pos.left + (doc.documentElement.scrollLeft || body.scrollLeft) - rootElm.clientLeft;
				y = pos.top + (doc.documentElement.scrollTop || body.scrollTop) - rootElm.clientTop;

				return {
					x: x,
					y: y
				};
			}

			offsetParent = elm;
			while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType) {
				x += offsetParent.offsetLeft || 0;
				y += offsetParent.offsetTop || 0;
				if (offsetParent.translate && getComputedStyle(offsetParent).transform !== "none") {
					aTransform = getComputedStyle(offsetParent).transform.split("(")[1].split(")")[0].split(",");
					x += Number(aTransform[4]) || 0;
					y += Number(aTransform[5]) || 0;
				}
				offsetParent = offsetParent.offsetParent;
			}

			offsetParent = elm.parentNode;
			while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType) {
				x -= offsetParent.scrollLeft || 0;
				y -= offsetParent.scrollTop || 0;
				offsetParent = offsetParent.parentNode;
			}
		}

		return {
			x: x,
			y: y
		};
	};
	return RichCommentCntrlMixin;
});