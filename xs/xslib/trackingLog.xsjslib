var TrackingActionType = {
	submitIdea: "SUBMIT_IDEA",
	voteIdea: "VOTE_IDEA",
	commentIdea: "COMMENT_IDEA",
	commentCampaign: "COMMENT_CAMPAIGN",
	view: "VIEW"
};

function onTrackVoteLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	
	 var sQuerCampaignParcipants = 'select identity_id from \"sap.ino.db.campaign::v_campaign_participate_identity\" as campaign_participate ' + 
                   'left outer join \"sap.ino.db.idea::t_idea\" as idea ' +
                   'on campaign_participate.campaign_id = idea.campaign_id  where campaign_participate.identity_id = ? and idea.id = ?';
	 var aCampaignParcipants = oHQ.statement(sQuerCampaignParcipants).execute(oWorkObject.USER_ID, oWorkObject.IDEA_ID);
	if(aCampaignParcipants.length === 0){
        	return;
	}

	var sQueryTrackLogStatement =
		`SELECT top 1 IDENTITY_ID FROM "sap.ino.db.tracker::t_action_log" WHERE IDENTITY_ID = ? AND OBJECT_TYPE = 'IDEA' AND OBJECT_ID = ? AND ACTION_TYPE = 'VOTE_IDEA'`;
	var aResult = [];
	aResult = oHQ.statement(sQueryTrackLogStatement).execute(oWorkObject.USER_ID, oWorkObject.IDEA_ID);
	if (aResult.length > 0) {
		var sUpdateTrackLogStatement =
			`UPDATE "sap.ino.db.tracker::t_action_log" SET ACTED_AT = current_utctimestamp WHERE IDENTITY_ID = ? AND OBJECT_TYPE = 'IDEA' AND OBJECT_ID = ? AND ACTION_TYPE = 'VOTE_IDEA'`;
		oHQ.statement(sUpdateTrackLogStatement).execute(oWorkObject.USER_ID, oWorkObject.IDEA_ID);
	} else {
		var sInsertTrackLogStatement = `INSERT INTO "sap.ino.db.tracker::t_action_log" values(?,?,?,?,current_utctimestamp)`;
		oHQ.statement(sInsertTrackLogStatement).execute(oWorkObject.USER_ID, TrackingActionType.voteIdea, oWorkObject.IDEA_ID, "IDEA");
	}

}

function onTrackCommentLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	var sUserID = oContext.getUser().ID;
	var sCommentType = oWorkObject.OBJECT_TYPE_CODE;
	if (sCommentType === "BLOG") {
		return;
	}
	var sObjectType = sCommentType === "CAMPAIGN" ? "CAMPAIGN" : "IDEA";
	var sActionType = sCommentType === "CAMPAIGN" ? TrackingActionType.commentCampaign : TrackingActionType.commentIdea;
	var sQuerCampaignParcipants;
     if(sCommentType === "CAMPAIGN"){
       sQuerCampaignParcipants = 'select identity_id from \"sap.ino.db.campaign::v_campaign_participate_identity\" where identity_id = ? and campaign_id = ?';         
     }
     else{
	   sQuerCampaignParcipants = 'select identity_id from \"sap.ino.db.campaign::v_campaign_participate_identity\" as campaign_participate ' + 
                   'left outer join \"sap.ino.db.idea::t_idea\" as idea ' +
                   'on campaign_participate.campaign_id = idea.campaign_id  where campaign_participate.identity_id = ? and idea.id = ?';
     }
	 var aCampaignParcipants = oHQ.statement(sQuerCampaignParcipants).execute(sUserID, oWorkObject.OBJECT_ID);
	if(aCampaignParcipants.length === 0){
        	return;
	}
	
	var sQueryTrackLogStatement =
		`SELECT top 1  IDENTITY_ID FROM "sap.ino.db.tracker::t_action_log" WHERE IDENTITY_ID = ? AND OBJECT_TYPE = ? AND OBJECT_ID = ? AND ACTION_TYPE = ?`;
	var aResult = [];
	aResult = oHQ.statement(sQueryTrackLogStatement).execute(sUserID, sObjectType, oWorkObject.OBJECT_ID, sActionType);
	if (aResult.length > 0) {
		var sUpdateTrackLogStatement =
			`UPDATE "sap.ino.db.tracker::t_action_log" SET ACTED_AT = current_utctimestamp WHERE IDENTITY_ID = ? AND OBJECT_TYPE = ? AND OBJECT_ID = ? AND ACTION_TYPE = ?`;
		oHQ.statement(sUpdateTrackLogStatement).execute(sUserID, sObjectType, oWorkObject.OBJECT_ID, sActionType);
	} else {
		var sInsertTrackLogStatement = `INSERT INTO "sap.ino.db.tracker::t_action_log" values(?,?,?,?,current_utctimestamp)`;
		oHQ.statement(sInsertTrackLogStatement).execute(sUserID, sActionType, oWorkObject.OBJECT_ID, sObjectType);
	}

}

function onTrackViewLog(sEventType, iId, sUserName,oHQ) {
	var sObjectType = sEventType;
	var sActionType = TrackingActionType.view;
	var sQueryIdentityID = `select top 1 ID from "sap.ino.db.iam::v_identity" where user_name = ?`;
	var aIdentityID = oHQ.statement(sQueryIdentityID).execute(sUserName);
	if (aIdentityID.length === 0) {
		return;
	}
	var sQueryAuthorization;
	if(sEventType === "CAMPAIGN"){
	 sQueryAuthorization = `select top 1 campaign_id from "sap.ino.db.campaign::v_auth_campaigns" where campaign_id = ?`;
	} else if(sEventType === "IDEA"){
	 sQueryAuthorization = `select top 1 idea_id from "sap.ino.db.idea::v_auth_ideas" where idea_id = ?`;
	} else if(sEventType === "WALL"){
	 sQueryAuthorization = `select top 1 wall_id from "sap.ino.db.wall::v_auth_wall" where wall_id= ?`;
	}
	var aAuthResult = oHQ.statement(sQueryAuthorization).execute(iId);
	if(aAuthResult.length === 0){
	    return;
	}
	var sQueryTrackLogStatement =
		`SELECT top 1 IDENTITY_ID FROM "sap.ino.db.tracker::t_action_log" WHERE IDENTITY_ID = ? AND OBJECT_TYPE = ? AND OBJECT_ID = ? AND ACTION_TYPE = ?`;
	var aResult = [];
	aResult = oHQ.statement(sQueryTrackLogStatement).execute(aIdentityID[0].ID, sObjectType, iId, sActionType);
	if (aResult.length > 0) {
		var sUpdateTrackLogStatement =
			`UPDATE "sap.ino.db.tracker::t_action_log" SET ACTED_AT = current_utctimestamp WHERE IDENTITY_ID = ? AND OBJECT_TYPE = ? AND OBJECT_ID = ? AND ACTION_TYPE = ?`;
		oHQ.statement(sUpdateTrackLogStatement).execute(aIdentityID[0].ID, sObjectType, iId, sActionType);
	} else {
		var sInsertTrackLogStatement = `INSERT INTO "sap.ino.db.tracker::t_action_log" values(?,?,?,?,current_utctimestamp)`;
		oHQ.statement(sInsertTrackLogStatement).execute(aIdentityID[0].ID, sActionType, iId, sObjectType);
	}

}