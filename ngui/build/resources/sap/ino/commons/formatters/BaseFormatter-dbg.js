/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ui/base/Object",
    "sap/ui/core/MessageType",
    "sap/ui/core/IconPool",
    "sap/ui/model/type/Date",
    "sap/ui/model/FormatException",
    "sap/ui/Device",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Locale",
    "sap/m/ListType"
], function(Configuration,
	Object,
	MessageType,
	IconPool,
	DateType,
	FormatException,
	Device,
	NumberFormat,
	DateFormat,
	Locale,
	ListType) {
	"use strict";

	var mMessageTypeIcons = {};
	mMessageTypeIcons[MessageType.Error] = "message-error";
	mMessageTypeIcons[MessageType.Warning] = "message-warning";
	mMessageTypeIcons[MessageType.Success] = "message-success";
	mMessageTypeIcons[MessageType.Information] = "message-information";

	var mMessageTypePriority = {};
	mMessageTypePriority[MessageType.Error] = 1;
	mMessageTypePriority[MessageType.Warning] = 2;
	mMessageTypePriority[MessageType.Success] = 3;
	mMessageTypePriority[MessageType.Information] = 4;

	function mostSevereMessageType(aMessages) {
		if (aMessages.length === 0) {
			return undefined;
		}
		return aMessages.reduce(function(sMostSevereMessageType, oMessage) {
			if (mMessageTypePriority[oMessage.type] === undefined) {
				return sMostSevereMessageType;
			}
			if (mMessageTypePriority[oMessage.type] < mMessageTypePriority[sMostSevereMessageType]) {
				return oMessage.type;
			} else {
				return sMostSevereMessageType;
			}
		}, MessageType.Information);
	}

	function getCompanyViewTxt() {
		return Configuration.getSysCompanyView() === "1" ? "LIST_TIT_FILTER_COMPANY_VIEW_HEADER" : "LIST_TIT_FILTER_ORGANIZATION_VIEW_HEADER";
	}

	var oBaseFormatter = Object.extend("sap.ino.commons.formatters.BaseFormatter", {});

	var _oRelativeDateFormatter;
	var fnGetRelativeDateFormatter = function(that) {
		if (!_oRelativeDateFormatter) {
			if (that.getOwnerComponent) {
				_oRelativeDateFormatter = DateFormat.getDateInstance({
					relative: true
				}, new Locale(that.getOwnerComponent().getModel("user").getProperty("/data/LOCALE")));
			} else {
				// currently no locale available
				return DateFormat.getDateInstance({
					relative: true
				});
			}
		}

		return _oRelativeDateFormatter;
	};

	var _oRelativeDateAutoFormatter;
	var fnGetRelativeDateAutoFormatter = function(that) {
		if (!_oRelativeDateAutoFormatter) {
			if (that.getOwnerComponent) {
				_oRelativeDateAutoFormatter = DateFormat.getDateInstance({
					relative: true,
					relativeScale: "auto"
				}, new Locale(that.getOwnerComponent().getModel("user").getProperty("/data/LOCALE")));
			} else {
				// currently no locale available
				return DateFormat.getDateInstance({
					relative: true,
					relativeScale: "auto"
				});
			}
		}

		return _oRelativeDateAutoFormatter;
	};

	var _oDateFormatter;
	var fnGetDateFormatter = function(that) {
		if (!_oDateFormatter) {
			if (that.getOwnerComponent) {
				_oDateFormatter = DateFormat.getDateInstance({
					relative: false
				}, new Locale(that.getOwnerComponent().getModel("user").getProperty("/data/LOCALE")));
			} else {
				// currently no locale available
				return DateFormat.getDateInstance({
					relative: false
				});
			}
		}

		return _oDateFormatter;
	};

	var _oTimeFormatter;
	var fnGetTimeFormatter = function(that) {
		if (!_oTimeFormatter) {
			if (that.getOwnerComponent) {
				_oTimeFormatter = DateFormat.getTimeInstance({
					relative: false,
					format: 'Hm'
				}, new Locale(that.getOwnerComponent().getModel("user").getProperty("/data/LOCALE")));
			} else {
				// currently no locale available
				return DateFormat.getTimeInstance({
					relative: false,
					format: 'Hm'
				});
			}
		}

		return _oTimeFormatter;
	};

	/*
	 * Buttons formatters
	 */
	oBaseFormatter.showCreateButton = function(iOpen, iSubmittable) {
		return iOpen + iSubmittable === 2;
	};

	oBaseFormatter.titleImageURL = function(iImageId, oChangedAt) {
		var sSearch = oChangedAt instanceof Date ? '&t=' + oChangedAt.getTime() : '';
		var sUrl = Configuration.getAttachmentTitleImageDownloadURL(iImageId, null, 'small');
		if (sSearch) {
			return sUrl + sSearch;
		}
		return sUrl;
	};

	oBaseFormatter.campaignTitleImageURL = function(iImageId, oChangedAt) {
		var sSearch = oChangedAt instanceof Date ? '&t=' + oChangedAt.getTime() : '';
		var sUrl = Configuration.getAttachmentTitleImageDownloadURL(iImageId, null, 'large');
		if (sSearch) {
			return sUrl + sSearch;
		}
		return sUrl;
	};

	oBaseFormatter.campaignListImageURL = function(iTitleImageId, iCampaignListId) {
		if (iCampaignListId === null) {
			return Configuration.getAttachmentTitleImageDownloadURL(iTitleImageId, null, 'small');
		} else {
			return Configuration.getAttachmentTitleImageDownloadURL(iCampaignListId, null, 'small');
		}
	};

	oBaseFormatter.parameterizedText = function(sText) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		if (sText) {
			jQuery.each(args || [], function(iIndex, sParameter) {
				sText = sText.replace(new RegExp("\\{" + iIndex + "\\}", "g"), sParameter || "");
			});
		}
		return sText;
	};

	oBaseFormatter.TagGroupName = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			return this.getText(sText);
		}
		return "";
	};

	oBaseFormatter.TagGroupLinkEnable = function(aTagGroup, sTagGroup) {
		var tagGroup = {};
		var tagGroupKey = [];
		aTagGroup.forEach(function(item, index) {
			if (!tagGroup[item.ROOTGROUPID]) {
				tagGroup[item.ROOTGROUPID] = {};
				tagGroupKey.push(item.ROOTGROUPID);
			}
		});
		return !!~tagGroupKey.indexOf(sTagGroup) || (tagGroupKey.length < 5);
	};

	oBaseFormatter.text = function(sText, aParameters) {
	    if(!sText){
	        return "";
	    }
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			return this.getText(sText);
		}
		return "";
	};

	oBaseFormatter.getManageContinuesText = function(sText, aParameters) {
		if (aParameters) {
			return this.getText("PERSONALIZE_FILTER_ACTIVE_IDEA_LABEL");
		} else {
			return this.getText("PERSONALIZE_MANAGED_ALL_IDEA_LABEL");
		}
		return "";
	};
	oBaseFormatter.getManageContinuesTooltip = function(sText, aParameters) {
		if (aParameters) {
			return this.getText("PERSONALIZE_MANAGED_ALL_IDEA_LABEL");
		} else {
			return this.getText("PERSONALIZE_FILTER_ACTIVE_IDEA_LABEL");
		}
		return "";
	};

	oBaseFormatter.getManageContinuesToggle = function(sText, aParameters) {
		if (aParameters) {
			return true;
		} else {
			return false;
		}
		return "";
	};

	oBaseFormatter.getManageTextTooltip = function(sText, aParameters) {
		if (aParameters) {
			return this.getText("PERSONALIZE_FILTER_ACTIVE_IDEA_LABEL_TOOLTIP");
		} else {
			return this.getText("PERSONALIZE_MANAGED_ALL_IDEA_LABEL_TOOLTIP");
		}
		return "";
	};

	oBaseFormatter.campaignListCountNumber = function(aParameters) {
		if (aParameters) {
			var CampaignFilterModel = Configuration.getCampaignFilterCount();
			return CampaignFilterModel[aParameters];
		}

	};
	oBaseFormatter.ideaListCountNumber = function(aParameters) {
		if (aParameters) {
			var IdeaFilterModel = Configuration.getIdeaFilterCountData();
			return IdeaFilterModel[aParameters];
		}

	};
	oBaseFormatter.color = function(sColor) {
		if (sColor && sColor.length === 6) {
			return "#" + sColor;
		} else {
			return "#FFFFFF";
		}
	};

	oBaseFormatter.isEqual = function(vA, vB) {
		return vA === vB;
	};

	oBaseFormatter.system = function(vSystem) {
		var bShow = false;
		if (!vSystem) {
			bShow = true;
		} else if (jQuery.type(vSystem) === "array") {
			jQuery.each(vSystem, function(iIdx, sSystem) {
				bShow = bShow || Device.system[sSystem];
			});
		} else if (jQuery.type(vSystem) === "string") {
			bShow = Device.system[vSystem];
		}

		return !!bShow;
	};

	oBaseFormatter.mostSevereMessageTypeIcon = function(aMessage) {
		var sMessageType = mostSevereMessageType(aMessage);
		return "sap-icon://" + mMessageTypeIcons[sMessageType] || "";
	};

	oBaseFormatter.uploadEnabled = function(iId, bContentEditable, bEdit) {
		if (bEdit === undefined) {
			var bEditable = this.getView().data("editable");
			bEdit = bEditable === "true" || bEditable === null;
		}
		return (bEdit !== false) && (iId < 0 || bContentEditable !== false);
	};

	oBaseFormatter.downloadUrl = function(iAttachmentId, sFileName) {
		if (!sFileName) {
			return Configuration.getAttachmentDownloadURL(iAttachmentId);
		}
		return Configuration.getAttachmentDownloadURL(iAttachmentId) + "?filename=" + encodeURIComponent(sFileName);
	};

	oBaseFormatter.previewUrl = function(sMediaType, iAttachmentId) {
		if (sMediaType && sMediaType.indexOf("image/") === 0) {
			return Configuration.getAttachmentDownloadURL(iAttachmentId);
		}
		return undefined;
	};

	oBaseFormatter.attachmentEditable = function(iAttachmentAssignmentId) {
		return iAttachmentAssignmentId > 0;
	};

	oBaseFormatter.attachmentDeletable = function(iAttachmentAssignmentId, bContentEditable, bEdit) {
		if (bEdit === undefined && this.getView().data) {
			var bEditable = this.getView().data("editable");
			bEdit = bEditable === "true" || bEditable === null;
		}
		return (bEdit !== false) && (iAttachmentAssignmentId < 0 || bContentEditable !== false);
	};

	oBaseFormatter.navigationLink = function(sRouteName, oParameter) {
		return this.getOwnerComponent().getNavigationLink(sRouteName, oParameter);
	};

	oBaseFormatter.commentSaveTooltip = function(iCommentHasPrivilege, iCanComment, iOpenStatusSetting) {
		var bStatusComment = iOpenStatusSetting > 0 && iCommentHasPrivilege > 0 || !iOpenStatusSetting;

		if (!(bStatusComment && iCanComment > 0)) {
			return this.getText("MSG_COMMENT_HAS_PRIVILEGE");
		} else {
			return this.getText("MSG_COMMENT_SAVE_BUTTON");
		}
	};

	oBaseFormatter.setIdeaListLatestUpdateBackGroundColor = function(iCreate, iUpdate, iComment, iStatusChange) {
		if (!iCreate && !iUpdate && !iComment && !iStatusChange) {
			return "LATESTUPDATE_BACKGROUND";
		} else {
			return "null";
		}
	};

	oBaseFormatter.setMgrCoachBackGroundColor = function(bIdeaComment, createdID, aCoach, aCampaignManagers) {
		//var sOldClass = "sapInoCommentList";
		var oRouter = this.getRouter();

		if (!bIdeaComment && oRouter.getContext().indexOf("sectionComments") < 0) {
			return "null";
		}

		var aIsPersonCoach = [];
		var aIsPersonManager = [];
		if (aCoach && aCoach.length > 0) {
			aIsPersonCoach = aCoach.filter(function(coach) {
				return coach.IDENTITY_ID === createdID;
			});
		}
		if (aCampaignManagers && aCampaignManagers.length > 0) {
			aIsPersonManager = aCampaignManagers.filter(function(manager) {
				return manager.IDENTITY_ID === createdID;
			});
		}
		if (aIsPersonManager.length > 0 || aIsPersonCoach.length > 0) {
			return "MGRCOACH_BACKGROUND";
		} else {
			return "null";
		}

	};
	/**
	 *
	 * @param imageId
	 * @param bIsImage if set true, and imageId is null, empty string will be returned
	 * @returns {*}
	 */
	oBaseFormatter.userIcon = function(imageId, oChangedAt) {
		if (!imageId || !oChangedAt) {
			return IconPool.getIconURI("person-placeholder");
		}
		var sSearch = oChangedAt instanceof Date ? '&t=' + oChangedAt.getTime() : '&t=' + (new Date(oChangedAt)).getTime();
		var sUrl = Configuration.getAttachmentDownloadURL(imageId, null, 'small');
		if (sSearch) {
			return sUrl + sSearch;
		}
		return sUrl;
	};

	oBaseFormatter.userIconEdit = function(imageId, oChangedAt) {
		if (!imageId) {
			return IconPool.getIconURI("person-placeholder");
		}
		var sSearch = oChangedAt instanceof Date ? '&t=' + oChangedAt.getTime() : '';
		var sUrl = Configuration.getAttachmentDownloadURL(imageId, null, 'large');
		if (sSearch) {
			return sUrl + sSearch;
		}
		return sUrl;
	};

	oBaseFormatter.feedIdentityCard = function(FEED_CODE, phone) {
		if (FEED_CODE === "DATE_REACHED_SUBMIT_FROM" || FEED_CODE === "DATE_REACHED_SUBMIT_TO" || FEED_CODE === "DATE_REACHED_VALID_TO" ||
			FEED_CODE === "DATE_REACHED_REGISTER_FROM" || FEED_CODE === "DATE_REACHED_REGISTER_TO" || phone) {
			return false;
		}
	};

	oBaseFormatter.feedNoIdentityCard = function(FEED_CODE, phone) {
		if (phone) {
			return false;
		}

		if (FEED_CODE === "DATE_REACHED_SUBMIT_FROM" || FEED_CODE === "DATE_REACHED_SUBMIT_TO" || FEED_CODE === "DATE_REACHED_VALID_TO" ||
			FEED_CODE === "DATE_REACHED_REGISTER_FROM" || FEED_CODE === "DATE_REACHED_REGISTER_TO") {
			return true;
		}
		return false;
	};

	oBaseFormatter.feedLink = function(FEED_CODE, ACTOR_ID) {
		if (ACTOR_ID <= 0) {
			return false;
		}
		if (FEED_CODE === "DATE_REACHED_SUBMIT_FROM" || FEED_CODE === "DATE_REACHED_SUBMIT_TO" || FEED_CODE === "DATE_REACHED_VALID_TO" ||
			FEED_CODE === "DATE_REACHED_REGISTER_FROM" || FEED_CODE === "DATE_REACHED_REGISTER_TO") {
			return false;
		}

	};

	oBaseFormatter.userImage = function(imageId) {
		return !imageId ? "" : Configuration.getAttachmentTitleImageDownloadURL(imageId);
	};

	oBaseFormatter.isValidEmailAddr = function(sMailAddr) {
		//var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
		if (!sMailAddr || typeof sMailAddr !== "string") {
			return false;
		}
		return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g.test(sMailAddr.trim());
	};

	oBaseFormatter.isUsageReportingActive = function() {
		return Configuration.isUsageReportingActive();
	};

	oBaseFormatter.returnIfUsageReportingActive = function(vObject) {
		return Configuration.isUsageReportingActive() ? vObject : undefined;
	};

	oBaseFormatter.toInt = function(sNumber) {
		var iNumber = parseInt(sNumber, 10);
		if (isNaN(iNumber)) {
			iNumber = 0;
		} else {
			throw new FormatException("Don't know how to format " + sNumber + " to int");
		}
		return iNumber;
	};

	oBaseFormatter.toFloat = function(sNumber) {
		var iNumber = parseFloat(sNumber);
		if (isNaN(iNumber)) {
			iNumber = 0;
		} else {
			throw new FormatException("Don't know how to format " + sNumber + " to float");
		}
		return iNumber;
	};

	oBaseFormatter.toString = function(oNumber) {
		return oNumber.toString();
	};

	oBaseFormatter.notEmpty = function(vObject) {
		if (jQuery.type(vObject) === "array") {
			return vObject.length > 0;
		} else {
			return !!vObject;
		}
	};

	oBaseFormatter.toRelativeDate = function(oDate) {
		if (!oDate) {
			return "";
		} else if (typeof(oDate) === "number") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "string") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "object") {
			//ok              
		} else {
			throw new FormatException("Don't know how to format " + oDate + " to relative Date");
		}

		return fnGetRelativeDateFormatter(this).format(oDate);
	};

	oBaseFormatter.toRelativeDateAuto = function(oDate) {
		if (!oDate) {
			return "";
		} else if (typeof(oDate) === "number") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "string") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "object") {
			//ok              
		} else {
			throw new FormatException("Don't know how to format " + oDate + " to relative Date (Auto)");
		}

		return fnGetRelativeDateAutoFormatter(this).format(oDate);
	};

	oBaseFormatter.toDate = function(oDate) {
		if (!oDate) {
			return "";
		} else if (typeof(oDate) === "number") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "string") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "object") {
			//ok              
		} else {
			throw new FormatException("Don't know how to format " + oDate + " to Date");
		}

		return fnGetDateFormatter(this).format(oDate);
	};

	oBaseFormatter.toDateTime = function(oDateTime, bWithoutSpan) {
		if (!oDateTime) {
			return "";
		} else if (typeof(oDateTime) === "number") {
			oDateTime = new Date(oDateTime);
		} else if (typeof(oDateTime) === "string") {
			oDateTime = new Date(oDateTime);
		} else if (typeof(oDateTime) === "object") {
			//ok              
		} else {
			throw new FormatException("Don't know how to format " + oDateTime + " to oDateTime");
		}

		var sDate = fnGetDateFormatter(this).format(oDateTime);
		var sTime = fnGetTimeFormatter(this).format(oDateTime);
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		if (bRtl) {
			return sTime + " " + sDate;
		}
		if(bWithoutSpan){
		    return sDate + " " + sTime ;
		}
		return "<span style='display:inline-block'>" + sDate + " " + sTime + "</span>";
	};

	oBaseFormatter.isVisible = function(oDate) {
		return !!oDate;
	};

	oBaseFormatter.isFutureDate = function(oDate) {
		if (!oDate) {
			return false;
		} else if (typeof(oDate) === "number") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "string") {
			oDate = new Date(oDate);
		} else if (typeof(oDate) === "object") {
			//ok              
		} else {
			throw new FormatException("Don't know how to format " + oDate);
		}

		var now = new Date();
		var iNowSeconds = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

		return oDate.getTime() > iNowSeconds;
	};

	oBaseFormatter.toBool = function(sNumber) {
		return parseInt(sNumber, 10) === 1;
	};

	oBaseFormatter.toBoolNot = function(sNumber) {
		return parseInt(sNumber, 10) !== 1;
	};

	oBaseFormatter.toBoolText = function(sNumber) {
		if (typeof sNumber === "boolean") {
			sNumber = (sNumber === true ? 1 : 0);
		}
		return parseInt(sNumber, 10) === 1 ? this.getText("BOOL_FLD_TEXT_YES") : this.getText("BOOL_FLD_TEXT_NO");
	};

	oBaseFormatter.toBoolInt = function(sNumber) {
		if (typeof sNumber === "boolean") {
			return (sNumber === true ? 1 : 0);
		}
		var iNumber = parseInt(sNumber, 10);
		if (isNaN(iNumber) || iNumber === 0) {
			return 0;
		} else {
			return 1;
		}
	};

	oBaseFormatter.atLeastOne = function(sNumber) {
		return parseInt(sNumber, 10) || 1;
	};

	// oBaseFormatter.notEmpty = function(vValue) {
	//     return !!vValue;
	// };

	oBaseFormatter.asPercent = function(vValue) {
		return this.getText("PERCENTAGE_FLD_TEXT", [(vValue || 0)]);
	};

	oBaseFormatter.atLeastZero = function(vValue) {
		return (vValue || 0.0);
	};

	oBaseFormatter.convertToInt = function(fNumber) {
		return Math.floor(fNumber);
	};

	oBaseFormatter.count = function(nCount) {
		if (nCount) {
			var oNumberFormat = NumberFormat.getIntegerInstance({
				style: "short"
			});

			return oNumberFormat.format(nCount);
		}

		return "0";
	};

	oBaseFormatter.isIdIncluded = function(iId, aObjects) {
		aObjects = aObjects ? aObjects : [];
		return jQuery.grep(aObjects, function(o) {
			return o.ID === iId;
		}).length > 0;
	};

	oBaseFormatter.isIdNotIncluded = function(iId, aObjects) {
		aObjects = aObjects ? aObjects : [];
		return jQuery.grep(aObjects, function(o) {
			return o.ID === iId;
		}).length === 0;
	};

	oBaseFormatter.incativeWhenIncluded = function(iId, aObjects) {
		return this.formatter.isIdNotIncluded(iId, aObjects) ? ListType.Active : ListType.Inactive;
	};

	oBaseFormatter.expertRolesKeyToText = function(aRole) {
		var that = this;
		var aRoleText = [];
		jQuery.each(aRole, function(i, sRole) {
			switch (sRole) {
				case "SUBMITTER":
					aRoleText.push(that.getText("CTRL_EXPERTS_GRP_SUBMITTER"));
					break;
				case "CONTRIBUTOR":
					aRoleText.push(that.getText("CTRL_EXPERTS_GRP_CONTRIBUTOR"));
					break;
				case "COMMENTATOR":
					aRoleText.push(that.getText("CTRL_EXPERTS_GRP_COMMENTATOR"));
					break;
				case "COACH":
					aRoleText.push(that.getText("CTRL_EXPERTS_GRP_COACH"));
					break;
				case "EVALUATOR":
					aRoleText.push(that.getText("CTRL_EXPERTS_GRP_EVALUATOR"));
					break;
				default:
					aRoleText.push(sRole);
			}
		});
		return aRoleText.join(", ");
	};

	oBaseFormatter.wrapHTML = function(sHTML) {
		return "<div>" + (sHTML || "") + "</div>";
	};

	oBaseFormatter.wrapToHTML = function(sHtml) {
		if (sHtml && !(/^<(\w+)>.*<\/\1>$/gim.test(sHtml))) {
			return "<p>" + sHtml + "</p>";
		}
		return sHtml;
	};

	oBaseFormatter.decodeURI = function(sURI) {
		return decodeURIComponent(sURI);
	};

	oBaseFormatter.termsConditions = function(sCode) {
		if (sCode === null || sCode === undefined) {
			return undefined;
		}
		var oModel = this.getView().getModel("module");
		return oModel.getProperty(sCode);
	};

	oBaseFormatter.generateDescription = function(sOrganization, sValidTo, sLastLogin) {
		var that = this;
// 		if (!sValidTo) {
// 			sValidTo = new Date(9999, 11, 31);
// 		}
		if (sOrganization) {
		    if (sLastLogin) {
		        return jQuery.sap.formatMessage(that.getText("INO_IDENTITY_DATA_VALIDATIONTO"), sOrganization, oBaseFormatter.toDate(sValidTo), oBaseFormatter.toDateTime(sLastLogin,true));
		    }
			return jQuery.sap.formatMessage(that.getText("INO_IDENTITY_DATA_VALIDATIONTO_WITHOUT_LAST_LOGIN"), sOrganization, oBaseFormatter.toDate(sValidTo));
		}
		if (sLastLogin) {
		    return jQuery.sap.formatMessage(that.getText("INO_IDENTITY_DATA_VALIDATIONTO_WITHOUT_ORGANIZATION"),oBaseFormatter.toDate(sValidTo), oBaseFormatter.toDateTime(sLastLogin,true));
		}
		return jQuery.sap.formatMessage(that.getText("INO_IDENTITY_DATA_VALIDATIONTO_WITHOUT_ORGANIZATION_WITHOUT_LAST_LOGIN"), oBaseFormatter.toDate(sValidTo));
	};
	oBaseFormatter.checkVisibleText = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText !== "manage" &&
				sText !== "draft" && sText !== "publish" &&
				sText !== "submittable") {
				return true;
			}
		}
		return false;
	};
	oBaseFormatter.ideaCheckVisibleText = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText !== "manage" &&
				sText !== "follow" && sText !== "unassigned" &&
				sText !== "coachme" &&
				sText !== "evaldone" &&
				sText !== "managedcompleted") {
				return true;
			}
		}
		return false;
	};
	oBaseFormatter.checkVisibleText2 = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText !== "all" &&
				sText !== "active" && sText !== "open" &&
				sText !== "future" && sText !== "past" &&
				sText !== "registered") {
				return true;
			}
		}
		return false;
	};
	oBaseFormatter.ideaCheckVisibleText2 = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText !== "all" &&
				sText !== "my" && sText !== "voted" &&
				sText !== "commented" &&
				sText !== "vote" &&
				sText !== "eval" &&
				sText !== "evalpending" &&
				sText !== "evalopen" &&
				sText !== "completed") {
				return true;
			}
		}
		return false;
	};
	oBaseFormatter.parentText = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText === "CAMPAIGN_LIST_MIT_ALL") {
				return "Campaigns";
			}
		}
		return "";
	};
	oBaseFormatter.parentText2 = function(sText, aParameters) {
		if (aParameters) {
			return this.getText(sText, aParameters);
		} else {
			if (sText === "CAMPAIGN_LIST_MIT_MANAGE") {
				return "Managed Campaigns";
			}
		}
		return "";
	};
	oBaseFormatter.checkList = function(aParameters) {
		if (aParameters === "CAMPAIGN_LIST_TIT_NAME" || aParameters === "IDEA_LIST_TIT_NAME") {
			return true;
		}
		return false;
	};

	oBaseFormatter.i18nText = function(sText) {
		var i18n = this.getModel('i18n');
		return i18n.getResourceBundle().getText(sText) || '';
	};
	
	oBaseFormatter.formatGlobalSearchKey = function(sText, bNotFormatter) {
	    if(bNotFormatter){
	        return sText;
	    }
		var i18n = this.getModel('i18n');
		return i18n.getResourceBundle().getText(sText) || '';
	};

	oBaseFormatter.URIdecoding = function(text) {
		return text && window.decodeURIComponent(text) || '';
	};

	oBaseFormatter.anonymousIconFormatter = function(anonymousCode) {
		if (anonymousCode === "ALL") {
			return "sap-icon://theater";
		} else if (anonymousCode === "PARTLY") {
			return "sap-icon://personnel-view";
		}
	};
	oBaseFormatter.anonymousIconVisibleFormatter = function(anonymousCode) {
		if (anonymousCode === null) {
			return false;
		} else {
			return true;
		}
	};
	oBaseFormatter.anonymousIconTooltipFormatter = function(anonymousCode) {
		if (anonymousCode === "ALL") {
			return this.getText("IDEA_ANONYMOUS_FOR_ALL");
		} else if (anonymousCode === "PARTLY") {
			return this.getText("IDEA_NOT_ANONYMOUS_CAMPAIGN_MANAGER");
		}
	};
	oBaseFormatter.anonymousIconLabelFormatter = function(anonymousCode) {
		if (anonymousCode === "ALL") {
			return this.getText("IDEA_ANONYMOUS_FOR_ALL");
		} else if (anonymousCode === "PARTLY") {
			return this.getText("IDEA_NOT_ANONYMOUS_CAMPAIGN_MANAGER");
		}
	};
	oBaseFormatter.adminFormTitle = function(adminField) {
		if (adminField && adminField.length > 0) {
			var res = adminField[0].FORM_DEFAULT_TEXT;
			return res;
		} else {
			return "";
		}
	};
	oBaseFormatter.ideaPersonalizationFilterTextInDialog = function(typeCode) {
		switch (typeCode) {
			case 'CAMPAIGN':
				return this.getText("LIST_TIT_FILTER_CAMPAIGN_HEADER");
			case 'CUSTOM_IDEA_FORM':
				return this.getText("LIST_TIT_FILTER_CAMPAIGN_FORM_HEADER");
			case 'PHASE':
				return this.getText("LIST_TIT_FILTER_PHASE_HEADER");
			case 'STATUS_TYPE':
				return this.getText("LIST_TIT_FILTER_STATUS_HEADER");
			case 'STATUS':
				return this.getText("LIST_TIT_FILTER_SUB_STATUS");
			case 'VOTE_NUMBER':
				return this.getText("LIST_TIT_FILTER_VOTE_NUMBER");
			case 'RESPONSIBILITY_LIST':
				return this.getText("LIST_TIT_FILTER_RESPONSIBILITY_LIST_HEADER");
			case 'AUTHOR':
				return this.getText("LIST_TIT_FILTER_AUTHOR_HEADER");
			case 'COACH':
				return this.getText("LIST_TIT_FILTER_COACH_HEADER");
			case 'DUE_DATE':
				return this.getText("LIST_TIT_FILTER_DUE_HEADER");
			case 'LATEST_UPDATE':
				return this.getText("LIST_TIT_FILTER_LATEST_UPDATE_HEADER");
			case 'COMPANY_VIEW':
				return this.getText(getCompanyViewTxt());
		}
	};

	oBaseFormatter.quickLinkStandardListVisible = function(sText, sBackOffice) {
		if (sBackOffice) {
			if (sText !== "all" &&
				sText !== "my" && sText !== "voted" &&
				sText !== "commented" &&
				sText !== "vote" &&
				sText !== "eval" &&
				sText !== "evalpending" &&
				sText !== "evalopen" &&
				sText !== "completed") {
				return true;
			}
		} else {
			if (sText !== "manage" &&
				sText !== "follow" && sText !== "unassigned" &&
				sText !== "coachme" &&
				sText !== "evaldone" &&
				sText !== "managedcompleted") {
				return true;
			}
		}
		return false;
	};
	oBaseFormatter.shortByQuickSortText = function(sQuickSort) {
		if (!sQuickSort) {
			return;
		}
		var aQuickSortSource = this.getListProperty('/QuickSorter');
		var sText;
		aQuickSortSource.forEach(function(item) {
			if (item.ACTION === sQuickSort) {
				sText = item.TEXT;
			}
		});
		return this.getText(sText);
	};

	oBaseFormatter.shortBySortText1 = function(sSort) {
		if (!sSort) {
			return;
		}
		var aSortOrder = sSort.split(",");
		var aSO = aSortOrder[0].split(" ");
		var aQuickSortSource = this.getListProperty('/Sorter/Values');
		var sText;
		aQuickSortSource.forEach(function(item) {
			if (item.ACTION === aSO[0]) {
				sText = item.TEXT;
			}
		});
		return this.getText(sText);
	};

	oBaseFormatter.shortBySortText2 = function(sSort) {
		if (!sSort) {
			return;
		}
		if (sSort.indexOf(",") !== -1) {
			var aSortOrder = sSort.split(",");
			var aSO = aSortOrder[1].split(" ");
			var aQuickSortSource = this.getListProperty('/Sorter/Values');
			var sText;
			aQuickSortSource.forEach(function(item) {
				if (item.ACTION === aSO[0]) {
					sText = item.TEXT;
				}
			});
			return this.getText(sText);
		} else {
			return "";
		}
	};

	oBaseFormatter.shortBySortVisible = function(sSort) {
		if (!sSort) {
			return false;
		}
		if (sSort.indexOf(",") !== -1) {
			return true;
		} else {
			return false;
		}
	};

	oBaseFormatter.quickLinkTextFormate = function(text, linkText, displayLabel) {
		if (linkText) {
			return linkText;
		} else {
			if (displayLabel) {
				return this.getText(text, [displayLabel]);
			} else if(text){
				return this.getText(text);
			}else{
			    return "";
			}
		}
	};

	oBaseFormatter.quickLinkListSelected = function(sAction, nLinkId, sListVariant, sSearchVariant, bNewQuickLink, nSelectId) {
		if (!bNewQuickLink && (sAction === sListVariant || sAction === sSearchVariant)) {
			return true;
		}
		if (bNewQuickLink && nLinkId && nSelectId && nLinkId === nSelectId) {
			return true;
		}
		if (bNewQuickLink && !nSelectId && (sAction === sListVariant || sAction === sSearchVariant)) {
			return true;
		}
		return false;
	};
	oBaseFormatter.commentEnabled = function(iCommentHasPrivilege, iCanComment, iOpenStatusSetting) {
		var bStatusComment = iOpenStatusSetting > 0 && iCommentHasPrivilege > 0 || !iOpenStatusSetting;

		return iCanComment > 0 && bStatusComment;
	};
	oBaseFormatter.disableQuickLinkAllIdeas = function(sText) {
		if (sText === "all" || sText === "manage") {
			return false;
		} else {
			return true;
		}
	};
	oBaseFormatter.formatInsufficientObjectId = function(sText, aParameters) {
		return jQuery.sap.formatMessage(sText, aParameters);
	};
	oBaseFormatter.formatInsufficientObjectExists = function(sId, sObjectName) {
		if (!sObjectName) {
			return Configuration.getBackendRootURL() + "/sap/ino/" + window.location.search;
		}
		var oObjectName = {
			"sap.ino.xs.object.idea.Idea": function(sCampId) {
				return Configuration.getBackendRootURL() + "/sap/ino/" + window.location.search + "#/campaign/" + sCampId;
			}
		};
		return oObjectName[sObjectName](sId);
	};

	oBaseFormatter.getCommunityGroupViewTooltip = function(bGroupView) {
		if (!bGroupView) {
			return this.getText("IDEA_LIST_TIT_NAME_FOR_MY_VIEW");
		} else {
			return this.getText("IDEA_LIST_TIT_NAME");
		}
	};
	oBaseFormatter.getIdeaListTitleText = function(bEnableGroupView, bGroupView) {
		if (!bEnableGroupView) {
			return this.getText("IDEA_LIST_TIT_NAME");
		} else {
			if (!bGroupView) {
				return this.getText("IDEA_LIST_TIT_NAME");
			} else {
				return this.getText("IDEA_LIST_TIT_NAME_FOR_MY_VIEW");
			}
		}

	};
	oBaseFormatter.getCommunityGroupViewToggle = function(bGroupView) {
		if (bGroupView) {
			return true;
		} else {
			return false;
		}
	};

	return oBaseFormatter;
});