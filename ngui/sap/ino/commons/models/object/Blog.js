/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ino/commons/application/Configuration",
    "sap/ino/controls/BlogStatusType"
], function(ApplicationObject, ReadSource, Message, MessageType, Configuration, BlogStatusType) {
	"use strict";

	var Blog = ApplicationObject.extend("sap.ino.commons.models.object.Blog", {
		objectName: "sap.ino.xs.object.blog.Blog",
		readSource: ReadSource.getDefaultODataSource("CampaignBlogsFull", {
			excludeNodes: ["Relations"]
		}),
		invalidation: {
			entitySets: ["CampaignBlogsFull"]
		},
		actionImpacts: {},
		determinations: {
			onCreate: _determineCreate
		},
		actions: {
			submit: {
				execute: _modify
			},
			majorPublishSubmit: {
				execute: _majorPublish
			},
			publishSubmit: {
				execute: _publish
			},
			unPublishSubmit: {
				execute: _unPublish
			}
		},
		setData: _setData,
		setProperty: _setProperty,
		addTag: _addTag,
		addAttachment: _addAttachment,
		removeAttachment: _removeAttachment
	});

	function _determineCreate(oData, oBlog) {
		var aTag = jQuery.map(oData.Tags || [], function(sTag) {
			return {
				ID: oBlog.getNextHandle(),
				NAME: sTag
			};
		});
		var oCurrentUser = Configuration.getCurrentUser();
		return {
			"TITLE": oData.TITLE || "",
			"DESCRIPTION": oData.DESCRIPTION || "",
			"CREATED_AT": new Date(),
			"CREATED_BY_NAME": oCurrentUser.NAME,
			"STATUS_CODE": BlogStatusType.Draft,
			"OBJECT_TYPE_CODE": "CAMPAIGN",
			"OBJECT_ID": oData.OBJECT_ID || 0,
			"Tags": aTag
		};
	}

	function _setData(oData) {
		/* jshint validthis: true */
		ApplicationObject.prototype.setData.apply(this, arguments);
		if (oData.OBJECT_ID > 0) {
			this.setProperty("/OBJECT_ID", oData.OBJECT_ID);
		}
	}

	function _setProperty(sPath, vValue, oContext, bAsyncUpdate) {
		/* jshint validthis: true */
		var bSuccess = false;
		bSuccess = ApplicationObject.prototype.setProperty.apply(this, arguments);
		// Normalize the path to be able to deal with bindings where the property of the root
		// model starts with "/"
		_handleCampaign.call(this, sPath, vValue, oContext, bAsyncUpdate);
		return bSuccess;
	}

	function _handleCampaign(sPath, vValue, oContext, bAsyncUpdate) {
		var sPropName = (sPath[0] === "/" ? sPath.substring(1) : sPath);
		if (sPropName !== "OBJECT_ID") {
			return;
		}
		var oDataModel = this.getReadSourceModel();
		var oBlog = this;
		var iCampaignId = vValue;
		// this happens when invalid values are entered in the combobox
		if (iCampaignId === "" || iCampaignId === "0") {
			iCampaignId = 0;
			ApplicationObject.prototype.setProperty.apply(oBlog, [sPath, iCampaignId, oContext, bAsyncUpdate]);
			return;
		}

		if (iCampaignId === 0) {
			_setCampaignDetails.call(oBlog, {
				NAME: "",
				SHORT_NAME: "",
				COLOR_CODE: "",
				PHASE_COUNT: 4,
				IDEA_DESCRIPTION_TEMPLATE: ""
			});
			return;
		}
		oDataModel.read("/CampaignSmall(" + iCampaignId + ")", {
			success: function(oCampaign) {
				_setCampaignDetails.call(oBlog, oCampaign);
			}
		});
	}

	function _setCampaignDetails(oCampaign) {
		this.setProperty("/CAMPAIGN_NAME", oCampaign.NAME);
		this.setProperty("/CAMPAIGN_SHORT_NAME", oCampaign.SHORT_NAME);
		this.setProperty("/CAMPAIGN_COLOR", oCampaign.COLOR_CODE);
		this.setProperty("/STEPS", oCampaign.PHASE_COUNT);
		this.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ID", oCampaign.CAMPAIGN_BACKGROUND_IMAGE_ID);
		this.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID", oCampaign.CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID);
		this.setProperty("/CAMPAIGN_VOTE_TYPE_CODE", oCampaign.VOTE_TYPE_CODE);
	}

	function _addTag(oNewTag) {
		/* jshint validthis: true */
		var oMessage;
		var aTags = this.getProperty("/Tags");

		if (!oNewTag.NAME || jQuery.trim(oNewTag.NAME).length === 0) {
			oMessage = new Message({
				key: "MSG_INVALID_EMPTY_TAG",
				type: MessageType.Error,
				group: "TAG"
			});
			return oMessage;
		}

		oNewTag.NAME = jQuery.trim(oNewTag.NAME);

		if (!oNewTag.TAG_ID && oNewTag.NAME) {
			// Tags are created "on the fly"
			// so for new tags (not only tag assignment)
			// a new handle is used
			oNewTag.TAG_ID = this.getNextHandle();
		}
		var aMatches = jQuery.grep(aTags, function(oTag) {
			return oTag.NAME.toLowerCase() === oNewTag.NAME.toLowerCase();
		});

		if (aMatches.length === 0) {
			this.addChild(oNewTag, "Tags");
		} else {
			return new Message({
				key: "MSG_DUPLICATE_TAG",
				type: MessageType.Error
			});
		}
	}

	function _addAttachment(oNewAttachment) {
		oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
		this.addChild(oNewAttachment, "Attachments");
	}

	function _removeAttachment(iId) {
		var aAttachment = jQuery.grep(this.getProperty("/Attachments") || [], function(oAttachment) {
			return oAttachment.ATTACHMENT_ID === iId;
		});
		var oFirstAttachment = aAttachment && aAttachment[0];
		if (oFirstAttachment) {
			this.removeChild(oFirstAttachment);
		}
	}

	function _unPublish(vKey, oBlog, oParameter, oActionMetadata, oSettings) {
		var oDeferred = new jQuery.Deferred();
		var oUnPublishRequest = oBlog.unPublish(oSettings);
		oUnPublishRequest.fail(oDeferred.reject);
		oUnPublishRequest.done(oDeferred.resolve);
		return oDeferred.promise();
	}

	function _modify(vKey, oBlog, oParameter, oActionMetadata, oSettings) {
		return _update.call(this, vKey, oBlog, oParameter, oActionMetadata, oSettings);
	}

	function _majorPublish(vKey, oBlog, oParameter, oActionMetadata, oSettings) {
		return _update.call(this, vKey, oBlog, oParameter, oActionMetadata, oSettings, "majorPublish");
	}

	function _publish(vKey, oBlog, oParameter, oActionMetadata, oSettings) {
		return _update.call(this, vKey, oBlog, oParameter, oActionMetadata, oSettings, "publish");
	}

	function _update(vKey, oBlog, oParameter, oActionMetadata, oSettings, sMethod) {
		var oDeferred = new jQuery.Deferred();
		var oModifyRequest = oBlog.modify(oSettings);
		oModifyRequest.fail(oDeferred.reject);
		if (!sMethod) {
			oModifyRequest.done(oDeferred.resolve);
		} else {
			oModifyRequest.done(function() {
				var oSubmitRequest = oBlog[sMethod](oParameter, oSettings);
				oSubmitRequest.fail(oDeferred.reject);
				oSubmitRequest.done(oDeferred.resolve);
			});
		}
		return oDeferred.promise();
	}

	return Blog;
});