/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/controls/IdeaStatusType",
    "sap/ino/controls/VoteType",
    "sap/ui/base/Object",
    "sap/ui/model/type/Date",
    "sap/ui/core/IconPool",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
], function(BaseFormatter,
	CodeModel,
	Configuration,
	IdeaStatusType,
	VoteType,
	Object,
	DateType,
	IconPool,
	NumberFormat,
	DateFormat) {
	"use strict";

	var oFloatNumberFormat = NumberFormat.getFloatInstance({
		maxFractionDigits: 1

	});
	/*
	 * Attachment object
	 */
	var oObjectFormatter = Object.extend("sap.ino.commons.formatters.ObjectFormatter", {});

	jQuery.extend(oObjectFormatter, BaseFormatter);

	oObjectFormatter.alternativeBy = function(vBy, vIdentity, vAlternativeIdentity, vDate, vAlternativeDate) {
		if (vIdentity) {
			vDate = BaseFormatter.toRelativeDate(vDate);
			if (!vDate && vAlternativeDate) {
				vDate = BaseFormatter.toRelativeDate(vAlternativeDate);
			}
			return BaseFormatter.parameterizedText(vBy, vIdentity, vDate);
		} else if (vAlternativeIdentity) {
			vAlternativeDate = BaseFormatter.toRelativeDate(vAlternativeDate);
			return BaseFormatter.parameterizedText(vBy, vAlternativeIdentity, vAlternativeDate);
		} else return "";
	};

	oObjectFormatter.ideaDisplaySubtitle = function(sIdeaNumberTit, sIdeaNumber, sRespNameTit, sRespName, vBy, vIdentity,
		vAlternativeIdentity, vDate, vAlternativeDate, bWithoutImg) {
		if (bWithoutImg) {
			if (sRespName) {
				return sIdeaNumberTit + ": " + sIdeaNumber　 + ", " + sRespNameTit + ": " + sRespName;
			}
			return sIdeaNumberTit + ": " + sIdeaNumber;
		}
		return oObjectFormatter.alternativeBy(vBy, vIdentity, vAlternativeIdentity, vDate, vAlternativeDate);
	};

	oObjectFormatter.aContributorsTostring = function(aContributors) {
		if (!aContributors || aContributors.length <= 0) {
			return "";
		}
		var result = aContributors[0].NAME;
		for (var index = 1; index <= aContributors.length - 1; index++) {
			result += ", " + aContributors[index].NAME;
		}
		return result;
	};

	oObjectFormatter.alternativeDate = function(vDate, vAlternativeDate) {
		vDate = BaseFormatter.toRelativeDate(vDate);
		if (!vDate && vAlternativeDate) {
			vDate = BaseFormatter.toRelativeDate(vAlternativeDate);
		}
		return vDate || "";
	};

	oObjectFormatter.daysLeft = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var oDateInfinite = new Date("9999-12-30T00:00:00.000Z");
			var iDaysDiff = oNowDate.getTime() - oDate.getTime();
			var sLabel;
			if (iDaysDiff <= 0) {
				if (sDate >= oDateInfinite) {
					sLabel = this.getText("CAMPAIGN_LIST_FLD_DEADLINE_NO_END_DATE");
				} else {
					sLabel = this.getText("CAMPAIGN_FLD_DATE_DEADLINE", [BaseFormatter.toDateTime(oDate)]);
				}
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_DATE_DEADLINE_PASSED", [BaseFormatter.toDateTime(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.campaignStartsInDays = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var iDaysDiff = oDate.getTime() - oNowDate.getTime();
			var sLabel;
			if (iDaysDiff < 0) {
				sLabel = this.getText("CAMPAIGN_FLD_DATE_STARTED", [BaseFormatter.toDate(oDate)]);
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_DATE_WILL_START", [BaseFormatter.toDate(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.submissionDaysLeft = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var oDateInfinite = new Date("9999-12-30T00:00:00.000Z");
			var iDaysDiff = oNowDate.getTime() - oDate.getTime();
			var sLabel;
			if (iDaysDiff <= 0) {
				if (oDate >= oDateInfinite) {
					sLabel = this.getText("CAMPAIGN_LIST_FLD_SUBMISSION_DEADLINE_NO_END_DATE");
				} else {
					sLabel = this.getText("CAMPAIGN_FLD_SUBMISSION_DEADLINE", [BaseFormatter.toDateTime(oDate)]);
				}
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_SUBMISSION_DEADLINE_PASSED", [BaseFormatter.toDateTime(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.submissionStartsInDays = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var iDaysDiff = oDate.getTime() - oNowDate.getTime();
			var sLabel;
			if (iDaysDiff < 0) {
				sLabel = this.getText("CAMPAIGN_FLD_SUBMISSION_STARTED", [BaseFormatter.toDate(oDate)]);
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_SUBMISSION_WILL_START", [BaseFormatter.toDate(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.registrationDaysLeft = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var oDateInfinite = new Date("9999-12-30T00:00:00.000Z");
			var iDaysDiff = oNowDate.getTime() - oDate.getTime();
			var sLabel;
			if (iDaysDiff < 0) {
				if (oDate >= oDateInfinite) {
					sLabel = this.getText("CAMPAIGN_LIST_FLD_REGISTRATION_DEADLINE_NO_END_DATE");
				} else {
					sLabel = this.getText("CAMPAIGN_FLD_REGISTRATION_DEADLINE", [BaseFormatter.toDateTime(oDate)]);
				}
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_REGISTRATION_DEADLINE_PASSED", [BaseFormatter.toDateTime(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.registrationStartsInDays = function(sDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			var oNowDate = new Date();
			var iDaysDiff = oDate.getTime() - oNowDate.getTime();
			var sLabel;
			if (iDaysDiff < 0) {
				sLabel = this.getText("CAMPAIGN_FLD_REGISTRATION_STARTED", [BaseFormatter.toDate(oDate)]);
			} else {
				sLabel = this.getText("CAMPAIGN_FLD_REGISTRATION_WILL_START", [BaseFormatter.toDate(oDate)]);
			}
			return sLabel;
		}

		return undefined;
	};

	oObjectFormatter.formatInfinityWithTimeFormat = function(dDate) {
		if (!dDate) {
			return "";
		} else if (typeof(dDate) === "number" || typeof(dDate) === "string") {
			dDate = new Date(dDate);
		}
		dDate = new Date(dDate.getTime() + dDate.getTimezoneOffset() * 60 * 1000);
		return sap.ui.core.format.DateFormat.getDateTimeInstance({
			"pattern": "yyyy-MM-dd HH:mm:ss UTC"
		}).format(dDate, false);
	};

	/*
	 * Idea object
	 */
	oObjectFormatter.ideaImageUrl = function(iTitleImageId, sMediaType) {
		if (sMediaType && sMediaType.indexOf("image/") === 0) {
			return Configuration.getAttachmentTitleImageDownloadURL(iTitleImageId);
		}
		return null;
	};

	oObjectFormatter.ideaTitleImageUrl = function(iTitleImageId, sUrl, oChangedAt) {
		if (iTitleImageId && sUrl) {
			if (oChangedAt instanceof Date) {
				return '/' + sUrl + '/' + iTitleImageId + '?type=large&t=' + oChangedAt.getTime();
			} else {
				return '/' + sUrl + '/' + iTitleImageId + '?type=large';
			}
		}
		return null;
	};

	oObjectFormatter.ideaProcessStopped = function(sStatus) {
		if (sStatus) {
			return sStatus === IdeaStatusType.Discontinued || sStatus === IdeaStatusType.Merged;
		}
		return false;
	};

	oObjectFormatter.isIdeaProcessStoped = function(sStatus, sType) {
		if (sType) {
			return sType === "DISCONTINUED";
		} else if (sStatus) {
			return sStatus === IdeaStatusType.Discontinued || sStatus === IdeaStatusType.Merged;
		}
		return false;
	};

	oObjectFormatter.baseCampaignHomePageButtons = function(oPrivilege, oCampaignPrivilege) {
		return oPrivilege && oCampaignPrivilege;

	};

	oObjectFormatter.ideaStatus = CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root");

	oObjectFormatter.ideaStatusAction = CodeModel.getFormatter("sap.ino.xs.object.status.Action.Root");

	oObjectFormatter.ideaPhase = CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root");

	/**
	 * Evaluation object
	 */
	oObjectFormatter.criterionCode = CodeModel.getFormatter("sap.ino.xs.object.evaluation.Model.Criterion");

	oObjectFormatter.changeStatusActionCode = CodeModel.getFormatter("sap.ino.xs.object.status.Action.Root");

	oObjectFormatter.criterionCodeLongText = CodeModel.getLongTextFormatter("sap.ino.xs.object.evaluation.Model.Criterion");
	
	oObjectFormatter.criterionCodeLongTextVisible = function(sText){
	    return !!sText && sText.length > 0;
	};

	oObjectFormatter.modelCode = CodeModel.getFormatter("sap.ino.xs.object.evaluation.Model.Root");

	oObjectFormatter.modelCodeLongText = CodeModel.getLongTextFormatter("sap.ino.xs.object.evaluation.Model.Root");

	oObjectFormatter.valueOption = CodeModel.getFormatter("sap.ino.xs.object.basis.ValueOptionList.ValueOptions");

	oObjectFormatter.uomCode = CodeModel.getFormatter("sap.ino.xs.object.basis.Unit.Root");

	oObjectFormatter.ideaNavigationLink = function(iId, sSection) {
		if (!isNaN(parseInt(iId, 10))) {
			var oParams = {
				id: iId
			};
			if (sSection) {
				oParams.query = {
					section: sSection
				};
			}
			return BaseFormatter.navigationLink.apply(this, ["idea-display", oParams]);
		}
		return undefined;
	};

	oObjectFormatter.campaignNavigationLink = function(iId) {
		if (!isNaN(parseInt(iId, 10))) {
			return BaseFormatter.navigationLink.apply(this, ["campaign", {
				id: iId
			}]);
		}
		return undefined;
	};

	oObjectFormatter.rewardEmployeeName = function(employeeName, sId) {
		if (sId > 0) {
			return employeeName;
		} else if (sId === 0) {
			employeeName = this.getText("IDEA_OBJECT_TIT_IDEA_Anonymity");
			return employeeName;
		}
	};

	oObjectFormatter.rewardEmployeeNameLinkEnabled = function(sId) {
		if (sId > 0) {
			return true;
		} else {
			return false;
		}
	};

	oObjectFormatter.wallNavigationLink = function(iId) {
		if (!isNaN(parseInt(iId, 10))) {
			return BaseFormatter.navigationLink.apply(this, ["wall", {
				id: iId
			}]);
		}
		return undefined;
	};

	oObjectFormatter.evaluationNavigationLink = function(iId) {
		if (!isNaN(parseInt(iId, 10))) {
			return BaseFormatter.navigationLink.apply(this, ["evaluation-display", {
				id: iId
			}]);
		}
		return undefined;
	};

	oObjectFormatter.roleCode = CodeModel.getFormatter("sap.ino.xs.object.iam.RoleCode.Root");

	oObjectFormatter.multipleRoleCodes = function(sRoleCodes) {
		var sResult = "";
		if (sRoleCodes) {
			sResult = sRoleCodes.split(",").map(oObjectFormatter.roleCode).join(", ");
		}
		return sResult;
	};

	//TODO: check external calls
	oObjectFormatter.ideaAccessibilityLabel = function(sIdeaName, sPhase, iCurrentStep, iSteps, sStatus, sVotingType, iCommentCount,
		iViewCount, iIdeaScore, iMaxStarNo, iIdeaScoreLike, iIdeaScoreDislike) {
		if (sStatus === IdeaStatusType.Draft) {
			return this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_DRAFT", [sIdeaName]);
		}

		iViewCount = iViewCount || 0;
		iIdeaScore = iIdeaScore || 0;
		iMaxStarNo = iMaxStarNo || 0;
		iIdeaScoreLike = iIdeaScoreLike || 0;
		iIdeaScoreDislike = iIdeaScoreDislike || 0;
		iCurrentStep = iCurrentStep || 0;
		iSteps = iSteps || 0;

		var sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_NO");
		if (sVotingType === VoteType.TYPE_STAR) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_STAR", [iIdeaScore, iMaxStarNo]);
		} else if (sVotingType === VoteType.TYPE_LIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE", [iIdeaScore]);
		} else if (sVotingType === VoteType.TYPE_LIKE_DISLIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_DISLIKE", [iIdeaScoreLike, iIdeaScoreDislike]);
		}

		var sViewCount = Configuration.isUsageReportingActive() ? this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VIEW_COUNT", [iViewCount]) :
			"";

		return this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL", [sIdeaName, oObjectFormatter.ideaPhase(sPhase), iCurrentStep + 1, iSteps,
			oObjectFormatter.ideaStatus(sStatus), sVote, iCommentCount, sViewCount]);
	};

	oObjectFormatter.ideaAccessibilityLabelBackOfficeHome = function(sIdeaName, sCampaingName, sSumitterName, sCoachName, sPhase,
		iCurrentStep, iSteps, sStatus, sVotingType, iExpScore, iCommentCount, iEvaluationCount, sSummitedAt, sChangedAt, sFollowUpDate,
		iIdeaScore, iMaxStarNo, iIdeaScoreLike, iIdeaScoreDislike) {
		if (sStatus === IdeaStatusType.Draft) {
			return this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_DRAFT", [sIdeaName]);
		}

		iCurrentStep = iCurrentStep + 1 || 1;
		iSteps = iSteps || 0;
		iExpScore = iExpScore || 0;
		iCommentCount = iCommentCount || 0;
		iEvaluationCount = iEvaluationCount || 0;
		var sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_NO");
		if (sVotingType === VoteType.TYPE_STAR) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_STAR", [iIdeaScore, iMaxStarNo]);
		} else if (sVotingType === VoteType.TYPE_LIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE", [iIdeaScore]);
		} else if (sVotingType === VoteType.TYPE_LIKE_DISLIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_DISLIKE", [iIdeaScoreLike, iIdeaScoreDislike]);
		}

		sCoachName = sCoachName ? this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_COACH", [sCoachName]) : "";
		sFollowUpDate = sFollowUpDate ? this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_DUE_DATE", [BaseFormatter.toDate(sFollowUpDate)]) : "";

		return this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_BACKOFFICEHOME", [sIdeaName, sCampaingName, sSumitterName, sCoachName,
			oObjectFormatter.ideaPhase(sPhase), iCurrentStep, iSteps, oObjectFormatter.ideaStatus(sStatus), sVote, iExpScore, iCommentCount,
			iEvaluationCount, BaseFormatter.toDate(sSummitedAt), BaseFormatter.toDate(sChangedAt), sFollowUpDate]);
	};

	oObjectFormatter.ideaAccessibilityLabelListItem = function(sIdeaName, sPhase, iCurrentStep, iSteps, sStatus, sVotingType, iCommentCount,
		iViewCount, iIdeaScore, iMaxStarNo, iIdeaScoreLike, iIdeaScoreDislike) {
		if (sStatus === IdeaStatusType.Draft) {
			return this.getText("IDEA_LIST_ITEM_ALT_ACCESSIBILITY_LABEL_DRAFT", [sIdeaName]);
		}

		iViewCount = iViewCount || 0;
		iIdeaScore = iIdeaScore || 0;
		iMaxStarNo = iMaxStarNo || 0;
		iIdeaScoreLike = iIdeaScoreLike || 0;
		iIdeaScoreDislike = iIdeaScoreDislike || 0;
		iCurrentStep = iCurrentStep || 0;
		iSteps = iSteps || 0;

		var sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_NO");
		if (sVotingType === VoteType.TYPE_STAR) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_STAR", [iIdeaScore, iMaxStarNo]);
		} else if (sVotingType === VoteType.TYPE_LIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE", [iIdeaScore]);
		} else if (sVotingType === VoteType.TYPE_LIKE_DISLIKE) {
			sVote = this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VOTING_EXT_LIKE_DISLIKE", [iIdeaScoreLike, iIdeaScoreDislike]);
		}

		var sViewCount = Configuration.isUsageReportingActive() ? this.getText("IDEA_LIST_ALT_ACCESSIBILITY_LABEL_VIEW_COUNT", [iViewCount]) :
			"";

		return this.getText("IDEA_LIST_ITEM_ALT_ACCESSIBILITY_LABEL", [sIdeaName, oObjectFormatter.ideaPhase(sPhase), iCurrentStep + 1, iSteps,
			oObjectFormatter.ideaStatus(sStatus), sVote, iCommentCount, sViewCount]);
	};

	oObjectFormatter.campaignAccessibilityLabel = function(sName, sValidTo, iTotalIdeas, iTotalParticipants, iViewCount, iOpen, iSubmittable,
		isOpen) {
		var sValidity = oObjectFormatter.daysLeft.apply(this, [sValidTo]);
		var bOpen = (iOpen + iSubmittable === 2);

		iTotalIdeas = iTotalIdeas || 0;
		iTotalParticipants = iTotalParticipants || 0;
		iViewCount = iViewCount || 0;

		var sViewCount = Configuration.isUsageReportingActive() ? this.getText("CAMPAIGN_LIST_ALT_ACCESSIBILITY_LABEL_VIEW_COUNT", [iViewCount]) :
			"";

		if (!isOpen) {
			return this.getText("CAMPAIGN_LIST_ALT_ACCESSIBILITY_LABEL" + (bOpen ? "_NEW_SUBMITTABLE" : ""), [sName, sValidity, iTotalIdeas,
				iTotalParticipants, sViewCount]);
		} else {
			return this.getText("CAMPAIGN_LIST_ITEM_ALT_ACCESSIBILITY_LABEL_REGISTER", [sName]);
		}

	};

	oObjectFormatter.campaignAccessibilityLabelBackOfficeHome = function(sName, sValidTo, iUnassignedIdeas, iTotalIdeas, iTotalParticipants,
		iViewCount, iOpen, iSubmittable, isOpen) {
		var sValidity = oObjectFormatter.daysLeft.apply(this, [sValidTo]);
		var bOpen = (iOpen + iSubmittable === 2);
		iUnassignedIdeas = iUnassignedIdeas || 0;
		iTotalIdeas = iTotalIdeas || 0;
		iTotalParticipants = iTotalParticipants || 0;
		iViewCount = iViewCount || 0;

		var sViewCount = Configuration.isUsageReportingActive() ? this.getText("CAMPAIGN_LIST_ALT_ACCESSIBILITY_LABEL_VIEW_COUNT", [iViewCount]) :
			"";

		if (isOpen) {
			return this.getText("CAMPAIGN_LIST_ITEM_ALT_ACCESSIBILITY_LABEL_REGISTER", [sName]);
		}

		return this.getText("CAMPAIGN_LIST_ALT_ACCESSIBILITY_BACKOFFICEHOME", [sName, sValidity, iUnassignedIdeas, iTotalIdeas,
			iTotalParticipants, sViewCount]);

	};

	oObjectFormatter.campaignAccessibilityLabelListItem = function(sName, sValidTo, iTotalIdeas, iTotalParticipants, iViewCount, iOpen,
		iSubmittable) {
		var sValidity = oObjectFormatter.daysLeft.apply(this, [sValidTo]);
		var bOpen = (iOpen + iSubmittable === 2);

		iTotalIdeas = iTotalIdeas || 0;
		iTotalParticipants = iTotalParticipants || 0;
		iViewCount = iViewCount || 0;

		var sViewCount = Configuration.isUsageReportingActive() ? this.getText("CAMPAIGN_LIST_ALT_ACCESSIBILITY_LABEL_VIEW_COUNT", [iViewCount]) :
			"";

		return this.getText("CAMPAIGN_LIST_ITEM_ALT_ACCESSIBILITY_LABEL", [sName, sValidity, iTotalIdeas, iTotalParticipants, sViewCount]);
	};

	oObjectFormatter.comAccessibilityLabelListItem = function() {
		if (!arguments || !arguments.length) {
			return false;
		}
		return Array.prototype.join.call(arguments, ' ');
	};

	oObjectFormatter.blogAccessibilityLabelListItem = function(sBlogName, sCampaingName, iAttachmentCount, iCommentCount) {
		return this.getText("BLOG_LIST_ITEM_ALT_ACCESSIBILITY_LABEL", [sBlogName, sCampaingName, iAttachmentCount, iCommentCount]);
	};

	oObjectFormatter.registerAccessibilityApprovalListItem = function(sName, sValidTo, sSubmitIdeaTo, sRequester, sOrginazation, sSubmit) {
		var sValidity = oObjectFormatter.daysLeft.apply(this, [sValidTo]);
		var sSubmitIdeaEnd = oObjectFormatter.submissionDaysLeft.apply(this, [sSubmitIdeaTo]);
		// var sSubmitTime = DateFormatter.formatDueDate.apply(this,[ssubmit]);

		return this.getText("REGISTER_APPROVAL_LIST_ITEM_ALT_ACCESSIBILITY_LABEL", [sName, sValidity, sSubmitIdeaEnd, sRequester, sOrginazation,
			sSubmit]);
	};

	oObjectFormatter.blogNavigationLink = function(iId, sSection) {
		if (!isNaN(parseInt(iId, 10))) {
			var oParams = {
				id: iId
			};
			if (sSection) {
				oParams.query = {
					section: sSection
				};
			}
			return BaseFormatter.navigationLink.apply(this, ["blog-display", oParams]);
		}
		return undefined;
	};

	oObjectFormatter.controlTooltip = function(sControlText, sText) {
		var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		return !sText ? oRB.getText(sControlText) : oRB.getText(sControlText, sText);
	};
	
	oObjectFormatter.formatMsg = function(sText) {
	    if(arguments){
		    return jQuery.sap.formatMessage(sText, Array.prototype.splice.call(arguments,1));
	    }
	};

	oObjectFormatter.viewCount = function(nCount) {
		if (nCount) {
			var oNumberFormat = NumberFormat.getIntegerInstance({
				style: "short"
			});

			return oNumberFormat.format(nCount);
		}

		return "1";
	};

	oObjectFormatter.toInt = function(sNumber) {
		var iNumber = parseInt(sNumber, 10);
		if (isNaN(iNumber)) {
			iNumber = 0;
		}
		return iNumber;
	};

	oObjectFormatter.toFloat = function(sNumber) {
		var iNumber = parseFloat(sNumber);
		if (isNaN(iNumber)) {
			iNumber = 0;
		}
		return iNumber;
	};

	oObjectFormatter.votingActive = function(sStatus, iVoteActive,iCanVote,iOpenStatusSetting,iVotePrivilege) {

	     var bStatusVote = ( iOpenStatusSetting > 0 && iVotePrivilege > 0 ) || !iOpenStatusSetting;
		return iVoteActive > 0 && IdeaStatusType.Draft !== sStatus && IdeaStatusType.Discontinued !== sStatus && IdeaStatusType.Merged !==
			sStatus && bStatusVote && iCanVote > 0;
	};

	oObjectFormatter.commentTooltip = function(iCommentHasPrivilege,iCanComment,iOpenStatusSetting) {
		var bStatusComment = iOpenStatusSetting > 0 && iCommentHasPrivilege > 0 || !iOpenStatusSetting;
		if (iCanComment > 0 && bStatusComment) {
			return this.getText("CTRL_IDEACARD_BUT_COMMENT_BUTTON");
		}
		
		return this.getText("VOTE_MSG_COMMENT_NO_PRIVILEGE");
	};

	oObjectFormatter.voteTooltip = function(sStatus, iVotePrivilege, iVoteActive, sPhase, sVoteType, iVoteCount, sScore, iUserScore,
		bDisplayOnly,iCanVote,iOpenStatusSetting) {
		var bProcessRunning = sStatus !== IdeaStatusType.Draft && sStatus !== IdeaStatusType.Discontinued && sStatus !== IdeaStatusType.Merged;
		if (!bProcessRunning) {
			return this.getText("VOTE_MSG_VOTING_NOT_POSSIBLE");
		}
		var bStatusVote = ( iOpenStatusSetting > 0 && iVotePrivilege > 0 ) || !iOpenStatusSetting;
		if (!bStatusVote || !iCanVote) {
			return this.getText("VOTE_MSG_VOTING_NO_PRIVILEGE");
		}
		var bVoteActive = iVoteActive > 0;
		if (!bVoteActive) {
			return this.getText("VOTE_MSG_VOTING_INACTIVE", [CodeModel.getText("sap.ino.xs.object.campaign.Phase.Root", sPhase)]);
		}
		switch (sVoteType) {
			case VoteType.TYPE_STAR:
				var fScore = oFloatNumberFormat.format(this.formatter.toFloat(sScore));
				if (iUserScore) {
					return this.getText("VOTE_FLD_STAR_RATING_TOOLTIP_USER_VOTED", [iUserScore, iVoteCount, fScore]);
				} else if (!bDisplayOnly) {
					return this.getText("VOTE_FLD_STAR_RATING_TOOLTIP");
				}
				break;
			case VoteType.TYPE_LIKE:
				if (iUserScore) {
					return this.getText("VOTE_FLD_LIKE_TOOLTIP_USER_VOTED", [iUserScore, iVoteCount, fScore]);
				} else if (!bDisplayOnly) {
					return this.getText("VOTE_FLD_LIKE_TOOLTIP");
				}
				break;
			case VoteType.TYPE_LIKE_DISLIKE:
				if (iUserScore) {
					if (iUserScore === 1) {
						return this.getText("VOTE_FLD_LIKE_DISLIKE_LIKE_TOOLTIP_USER_VOTED", [iUserScore, iVoteCount, fScore]);
					}
					if (iUserScore === -1) {
						return this.getText("VOTE_FLD_LIKE_DISLIKE_DISLIKE_TOOLTIP_USER_VOTED", [iUserScore, iVoteCount, fScore]);
					}
				} else if (!bDisplayOnly) {
					return this.getText("VOTE_FLD_LIKE_DISLIKE_TOOLTIP");
				}
				break;
		}

		return this.getText("IDEA_LIST_ALT_IDEA_VOTE_TOOLTIP_VOTE");
	};

	oObjectFormatter.isDraft = function(sStatus) {
		return sStatus === IdeaStatusType.Draft;
	};

	oObjectFormatter.isFinal = function(sStatus) {
		var sStatusType;
		jQuery.each(Configuration.getBackendConfiguration().ideaStatus, function(iIndex, oStatus) {
			if (oStatus.CODE === sStatus) {
				sStatusType = oStatus.STATUS_TYPE;
				return;
			}
		});
		return sStatus === IdeaStatusType.Completed ||
			sStatus === IdeaStatusType.Discontinued ||
			sStatus === IdeaStatusType.Merged ||
			sStatusType === IdeaStatusType.TypeCompleted ||
			sStatusType === IdeaStatusType.TypeDiscontinued;
	};

	oObjectFormatter.isMerged = function(sStatus) {
		return sStatus === IdeaStatusType.Merged;
	};

	oObjectFormatter.linkLabel = function(sLabel, sURL) {
		return sLabel || sURL;
	};

	oObjectFormatter.imageIcon = function(imageId) {
		return !imageId ? "sap-icon://person-placeholder" : "";
	};

	/**
	 * Formatter to bind to the object key to find out whether objects are new
	 * @returns {boolean}
	 */
	oObjectFormatter.isNewObject = function() {
		var oObject = this.getObjectModel();
		return oObject && oObject.isNew();
	};

	/**
	 * Formatter to bind to the object to find out whether objects are existing already
	 * @returns {boolean}
	 */
	oObjectFormatter.isExistingObject = function() {
		var oObject = this.getObjectModel();
		return oObject && !oObject.isNew();
	};

	oObjectFormatter.getLikeIconUrl = function() {
		return IconPool.getIconURI("heart", "InoIcons");
	};

	oObjectFormatter.widthCampaignBanner = function(oSystem) {
		if (oSystem.phone) {
			return "300px";
		} else {
			return "350px";
		}
	};

	oObjectFormatter.heightCampaignBanner = function(oSystem) {
		if (oSystem.phone) {
			return "160px";
		} else {
			return "213px";
		}
	};

	oObjectFormatter.blogStatus = function(sStatus) {
		return sStatus === "sap.ino.config.DRAFT" ? this.getText("BLOG_LIST_MIT_DRAFT_STATUS") : "";
	};

	oObjectFormatter.isBlogStatusDraft = function(sStatus) {
		return sStatus === "sap.ino.config.DRAFT";
	};

	oObjectFormatter.urlVisible = function(url) {
		return jQuery.sap.validateUrl(url);
	};

	oObjectFormatter.ideaShortDescription = function(sDescription) {
		function parseHTML(s) {
			if (jQuery.parseHTML) {
				var a = jQuery.parseHTML(s);
				if (a) {
					var start = 0,
						end = a.length;
					while (start < end && a[start].nodeType !== 1) {
						start++;
					}
					while (start < end && a[end - 1].nodeType !== 1) {
						end--;
					}
					if (start > 0 || end < a.length) {
						a = a.slice(start, end);
					}
					return jQuery(a);
				}
			}
			return jQuery(s);
		}
		if (sDescription) {
			sDescription = "<span>" + sDescription + "</span>";
			var aParsed = parseHTML(sDescription);
			var sText = aParsed && aParsed[0] && aParsed[0].innerText;
			return sText;
		}
		return sDescription;
	};
	oObjectFormatter.enableRejectOKButton = function(sReason){
	    if(sReason.length > 0){
	        return true;
	    }
	    return false;
	};

	return oObjectFormatter;
});