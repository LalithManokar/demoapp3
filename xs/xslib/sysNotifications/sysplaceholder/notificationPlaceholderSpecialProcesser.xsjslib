// notificationPlaceholderSpecialProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const ChangeAuthor = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderChangeAuthorProcesser");
const IdeaStatus = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderIdeaStatusProcesser");
const Reward = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderRewardProcesser");
const MergeIdea = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderMergeIdeaProcesser");
const Volunteer = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderVolunteerProcesser");
const Contributor = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderContributorProcesser");
const ReassignCampaign = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderReassignCampaignProcesser");
const FollowUp = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderIdeaFollowUpProcesser");
const Integration = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderIdeaIntegrationObjectProcesser");
const EvaluationReq = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderEvaluationReqProcesser");
const Coach = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderCoachProcesser");
const Expert = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderExpertProcesser");
const Coauthor = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderCoauthorProcesser");
const Evaluation = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderEvaluationProcesser");
const Blog = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder", "notificationPlaceholderBlogProcesser");

function SUBMIT_IDEA(oHQ, oNotification, oResult, sLang) {
	IdeaStatus.process(oHQ, oNotification, oResult, sLang);
}

function NOTIFY_AUTHOR(oHQ, oNotification, oResult, sLang) {
	IdeaStatus.process(oHQ, oNotification, oResult, sLang);
}

function CHANGE_STATUS(oHQ, oNotification, oResult, sLang) {
	IdeaStatus.process(oHQ, oNotification, oResult, sLang);
}

function CHANGE_IDEA_PHASE(oHQ, oNotification, oResult, sLang) {
	IdeaStatus.process(oHQ, oNotification, oResult, sLang);
}

function CHANGE_DECISION(oHQ, oNotification, oResult, sLang) {
	IdeaStatus.process(oHQ, oNotification, oResult, sLang);
}

function DELETE_IDEA(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, {
		"IDEA_NAME": oNotification.OBJECT_TEXT
	});
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.OWNER_ID), "AUTHOR_");
}

function MERGE_IDEA(oHQ, oNotification, oResult, sLang) {
	MergeIdea.process(oHQ, oNotification, oResult, sLang);
}

function ADD_VOLUNTEER(oHQ, oNotification, oResult, sLang) {
	Volunteer.process(oHQ, oNotification, oResult, sLang);
}

function LOOKING_FOR_CONTRIBUTOR(oHQ, oNotification, oResult, sLang) {
	Contributor.process(oHQ, oNotification, oResult, sLang);
}

function UNASSIGN_COACH(oHQ, oNotification, oResult, sLang) {
	Coach.process(oHQ, oNotification, oResult, sLang);
}

function ASSIGN_EXPERT(oHQ, oNotification, oResult, sLang) {
	Expert.process(oHQ, oNotification, oResult, sLang);
}

function UNASSIGN_EXPERT(oHQ, oNotification, oResult, sLang) {
	Expert.process(oHQ, oNotification, oResult, sLang);
}

function REASSIGN_CAMPAIGN(oHQ, oNotification, oResult, sLang) {
	ReassignCampaign.process(oHQ, oNotification, oResult, sLang);
}

function PUBLISH_CAMPAIGN_BLOG(oHQ, oNotification, oResult, sLang) {
	Blog.process(oHQ, oNotification, oResult, sLang);
}

function _processComment(oHQ, oNotification, oResult, sFiledName) {
	var oData = {};
	oData[sFiledName] = oNotification.SUB_TEXT;
	if (oNotification.ACTION_CODE === 'CREATE_IDEA_COMMENT' || oNotification.ACTION_CODE === 'CREATE_CAMPAIGN_COMMENT' || oNotification.ACTION_CODE ===
		'REPLY_IDEA_COMMENT') {
		oData[sFiledName] = _.stripTags(oNotification.SUB_TEXT || "").substring(0, 500);
	}
	CommonUtil.replacePlaceHolder(oResult, oData);
}

function _processCampaignComment(oHQ, oNotification, oResult) {
	_processComment(oHQ, oNotification, oResult, "CAMPAIGN_COMMENT");
}

function _processIdeaComment(oHQ, oNotification, oResult) {
	_processComment(oHQ, oNotification, oResult, "IDEA_COMMENT");
}

function CREATE_IDEA_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processIdeaComment(oHQ, oNotification, oResult, sLang);
}

function EDIT_IDEA_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processIdeaComment(oHQ, oNotification, oResult, sLang);
}

function DELETE_IDEA_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processIdeaComment(oHQ, oNotification, oResult, sLang);
}

function REPLY_IDEA_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processIdeaComment(oHQ, oNotification, oResult, sLang);
}

function IDEA_FOLLOW_UP(oHQ, oNotification, oResult, sLang) {
	FollowUp.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_SUBMITTED(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_PUBLISHED_TO_AUTHOR(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_PUBLISHED_TO_COMMUNITY(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_UNPUBLISHED(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REWORKED(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_DELETED(oHQ, oNotification, oResult, sLang) {
	Evaluation.process(oHQ, oNotification, oResult, sLang);
}

function CREATE_REWARD(oHQ, oNotification, oResult, sLang) {
	Reward.process(oHQ, oNotification, oResult, sLang);
}

function DELETE_REWARD(oHQ, oNotification, oResult, sLang) {
	Reward.process(oHQ, oNotification, oResult, sLang);
}

function CREATE_OBJECT(oHQ, oNotification, oResult, sLang) {
	Integration.process(oHQ, oNotification, oResult, sLang);
}

function UPDATE_OBJECT(oHQ, oNotification, oResult, sLang) {
	Integration.process(oHQ, oNotification, oResult, sLang);
}

function REMOVE_OBJECT(oHQ, oNotification, oResult, sLang) {
	Integration.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_CREATED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_DELETED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_FORWARDED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_ACCEPTED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_COMPLETED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_REJECTED(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function RECEIPT_OF_REQUEST_CLARIFICATION(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function DELIVERY_OF_REQUEST_CLARIFICATION(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_DUE_TO_EXPIRE_IN_ONE_DAY(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function EVALUATION_REQUEST_DUE_TO_EXPIRE(oHQ, oNotification, oResult, sLang) {
	EvaluationReq.process(oHQ, oNotification, oResult, sLang);
}

function REGISTER_FOR_CAMPAIGN(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.ACTOR_ID), "APPLICANT_");
}

function _LETTER_FOR_REGISTRATION(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.OWNER_ID), "APPLICANT_");
	CommonUtil.replacePlaceHolder(oResult, {
		"REGISTRATION_STATUS": CommonUtil.getCodeText(oNotification.SUB_TEXT === "sap.ino.config.REGISTER_REJECTED" ?
			"REG_MAS_APPR_BTN_REJECT_BUTTON" : "REG_MAS_APPR_BTN_ACCEPT_BUTTON", 'nguii18n', sLang)
	});
	CommonUtil.replacePlaceHolder(oResult, {
		"REGISTRATION_REASON": oNotification.HISTORY_OBJECT_INFO
	});
	if (oNotification.ACTOR_ID > 0) {
		CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.ACTOR_ID), "CAMPAIGN_MANAGER_");
	}
}

function REJECT_LETTER_FOR_REGISTRATION(oHQ, oNotification, oResult, sLang) {
	_LETTER_FOR_REGISTRATION(oHQ, oNotification, oResult, sLang);
}

function APPROVAL_LETTER_FOR_REGISTRATION(oHQ, oNotification, oResult, sLang) {
	_LETTER_FOR_REGISTRATION(oHQ, oNotification, oResult, sLang);
}

function CREATE_CAMPAIGN_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processCampaignComment(oHQ, oNotification, oResult, sLang);
}

function EDIT_CAMPAIGN_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processCampaignComment(oHQ, oNotification, oResult, sLang);
}

function DELETE_CAMPAIGN_COMMENT(oHQ, oNotification, oResult, sLang) {
	_processCampaignComment(oHQ, oNotification, oResult, sLang);
}

function ADD_COAUTHOR(oHQ, oNotification, oResult, sLang) {
	Coauthor.process(oHQ, oNotification, oResult, sLang);
}

function REMOVE_COAUTHOR(oHQ, oNotification, oResult, sLang) {
	Coauthor.process(oHQ, oNotification, oResult, sLang);
}

function CHANGE_AUTHOR(oHQ, oNotification, oResult, sLang) {
	ChangeAuthor.process(oHQ, oNotification, oResult, sLang);
}

function FOLLOW_TAG(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getTag(oHQ, oNotification.OBJECT_ID), "TAG_");
}

function UNFOLLOW_TAG(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getTag(oHQ, oNotification.OBJECT_ID), "TAG_");
}