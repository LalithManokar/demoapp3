var timeType = {
	day: "DAY",
	month: "MONTH",
	year: "YEAR"
};

function updateIdeaCorrespondingObjects(oHQ, timeSQL, retentionValue, userID) {
	//Idea Create

	var sIdeaUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'IDEA\' AND ROLE_CODE = \'IDEA_SUBMITTER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.idea::t_idea" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ?)';
	var sIdeaUpdateSubmitterRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'IDEA\' AND  ROLE_CODE = \'IDEA_SUBMITTER\'  and history_biz_event = \'IDEA_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.idea::t_idea" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ? )';	
	oHQ.statement(sIdeaUpdateSubmitterRoleH).execute( userID,userID, retentionValue, userID);		
	var sIdeaUpdateIdentityRoleH =
		'update "sap.ino.db.iam::t_object_identity_role_h" set history_actor_id = ? ' +
		'where object_type_code = \'IDEA\' AND ( ' +  
		' ROLE_CODE = \'IDEA_COACH\'  or ROLE_CODE = \'IDEA_CONTRIBUTOR\'  or ROLE_CODE = \'IDEA_EXPERT\' )'
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.idea::t_idea" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ? )';
	var sIdeaCreateSqlH = 'update top 10000 "sap.ino.db.idea::t_idea_h" set created_by_id = ' + userID + ', history_actor_id = ' + userID +
		', changed_by_id = ' + userID + ' where ' + timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? ' +
		' and (( history_db_event =\'UPDATED\' and (history_biz_event = \'IDEA_UPDATED\' OR history_biz_event LIKE \'STATUS_ACTION_%\' ' +
		' OR history_biz_event = \'IDEA_CAMPAIGN_REASSIGN\' or history_biz_event = \'IDEA_CHANGE_AUTHOR\' or history_biz_event = \'CHANGE_DECISION\'))' + 
		' OR (history_db_event =\'CREATED\' and history_biz_event = \'IDEA_CREATED\') OR history_biz_event in (\'COACH_ASSIGNED\', \'AUTO_COACH_ASSIGNED\', \'COACH_UNASSIGNED\', \'IDEA_CREATED\', \'IDEA_DELETED\', \'IDEA_UPDATED\' ) )';

	var sIdeaCreateSql = 'update top 10000 "sap.ino.db.idea::t_idea" set created_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
	oHQ.statement(sIdeaUpdateIdentityRole).execute(userID, retentionValue, userID);
	oHQ.statement(sIdeaUpdateIdentityRoleH).execute( userID, retentionValue, userID);
	oHQ.statement(sIdeaCreateSql).execute(userID, retentionValue, userID);
	oHQ.statement(sIdeaCreateSqlH).execute(retentionValue, userID);
	//Vote
	var sIdeaVote = 'update top 10000 "sap.ino.db.idea::t_vote" set user_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND USER_ID <> ?';

	oHQ.statement(sIdeaVote).execute(userID, retentionValue, userID);
	//  Register for Idea Contribution   
	var sIdeaVolunteer = 'update top 10000 "sap.ino.db.idea::t_volunteers" set identity_id = ?, CREATED_BY_ID = ? WHERE ' + timeSQL +
		'(CREATED_AT,CURRENT_UTCTIMESTAMP) <= ? AND IDENTITY_ID <> ?';
	oHQ.statement(sIdeaVolunteer).execute(userID, userID, retentionValue, userID);
	var sIdeaVolunteerH =
		'update top 10000 "sap.ino.db.idea::t_volunteers_h" set identity_id = ?, CREATED_BY_ID = ?, HISTORY_ACTOR_ID = ? WHERE ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_BIZ_EVENT = \'IDEA_VOLUNTEERS_CREATE\' AND HISTORY_DB_EVENT = \'CREATED\'' +
		' AND HISTORY_ACTOR_ID <> ?';
	oHQ.statement(sIdeaVolunteerH).execute(userID, userID, userID, retentionValue, userID);

}

function updateIdeaComment(oHQ, timeSQL, retentionValue, userID) {

	var sIdeaComment = 'update top 10000 "sap.ino.db.comment::t_comment" set CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';

	var sIdeaCommentH = 'update top 10000 "sap.ino.db.comment::t_comment_h" set HISTORY_ACTOR_ID = ? , CREATED_BY_ID = ? , CHANGED_BY_ID = ?' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ?' +
		' AND (HISTORY_BIZ_EVENT = \'COMMENT_CREATED\' OR HISTORY_BIZ_EVENT = \'COMMENT_UPDATED\' )';
		
	var sCommentUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'COMMENT\' AND ROLE_CODE = \'COMMENT_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.comment::t_comment"  where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';
	oHQ.statement(sCommentUpdateIdentityRole).execute(userID, retentionValue, userID);		
	var sCommentUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'COMMENT\' AND  ROLE_CODE = \'COMMENT_OWNER\'  and history_biz_event = \'COMMENT_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.comment::t_comment"  where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';		

	oHQ.statement(sCommentUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);
	
	oHQ.statement(sIdeaComment).execute(userID, userID, retentionValue, userID);
	oHQ.statement(sIdeaCommentH).execute(userID, userID, userID, retentionValue, userID);
}

function updateInternalNote(oHQ, timeSQL, retentionValue, userID) {
	var sInternalUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'INTERNAL_NOTE\' AND ROLE_CODE = \'INTERNAL_NOTE_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'INTERNAL_NOTE\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';
	oHQ.statement(sInternalUpdateIdentityRole).execute(userID, retentionValue, userID);		
	var sInternalUpdateIdentityRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'INTERNAL_NOTE\' AND  ROLE_CODE = \'INTERNAL_NOTE_OWNER\'  and history_biz_event = \'INTERNAL_NOTE_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'INTERNAL_NOTE\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';		

	oHQ.statement(sInternalUpdateIdentityRoleH).execute(userID, userID, retentionValue, userID);    
    
    
	var sInternalNote = 'update top 10000 "sap.ino.db.comment::t_comment" set CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'INTERNAL_NOTE\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';
	oHQ.statement(sInternalNote).execute(userID, userID, retentionValue, userID);
	var sInternalNoteH = 'update top 10000 "sap.ino.db.comment::t_comment_h" set HISTORY_ACTOR_ID = ? , CREATED_BY_ID = ? , CHANGED_BY_ID = ?' +
		'where type_code = \'INTERNAL_NOTE\' AND OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? ' +
		' AND HISTORY_BIZ_EVENT = \'INTERNAL_NOTE_CREATED\' AND HISTORY_ACTOR_ID <> ? ';

	oHQ.statement(sInternalNoteH).execute(userID, userID, userID, retentionValue, userID);
}

function updateExternalObjects(oHQ, timeSQL, retentionValue, userID) {
	var sExternalObjects = 'update top 10000 "sap.ino.db.integration::t_idea_object_integration" set CREATED_BY_ID = ? ' +
		'where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';
	oHQ.statement(sExternalObjects).execute(userID, retentionValue, userID);
	var sExternalObjectsH =
		'update top 10000 "sap.ino.db.integration::t_idea_object_integration_h" set HISTORY_ACTOR_ID = ? ' +
		'where ' + timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? AND ( HISTORY_BIZ_EVENT = \'OBJECT_CREATE\' or HISTORY_BIZ_EVENT = \'OBJECT_UPDATE\' ) AND HISTORY_ACTOR_ID <> ?';
	//Object Deleted
	oHQ.statement(sExternalObjectsH).execute(userID, retentionValue, userID);
}

function updateEvaluationObjects(oHQ, timeSQL, retentionValue, userID) {
	var sEvaluation = 'update top 10000 "sap.ino.db.evaluation::t_evaluation" set created_by_id = ? , changed_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
	var sEvaluatiobUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'EVALUATION\' AND ROLE_CODE = \'EVALUATION_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.evaluation::t_evaluation" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ?)';
	var sEvaluatioUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'EVALUATION\' AND  ROLE_CODE = \'EVALUATION_OWNER\'  and history_biz_event = \'EVAL_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.evaluation::t_evaluation" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ? )';	
	oHQ.statement(sEvaluatiobUpdateIdentityRole).execute( userID, retentionValue, userID);		
	oHQ.statement(sEvaluatioUpdateOwnerRoleH).execute( userID,userID, retentionValue, userID);			
	oHQ.statement(sEvaluation).execute(userID,userID, retentionValue, userID);
	//EVALUATOR WHO CREATED
	var sEvaluationH =
		'update top 10000 "sap.ino.db.evaluation::t_evaluation_h" set CREATED_BY_ID = ? , HISTORY_ACTOR_ID = ? , CHANGED_BY_ID = ? where ' +
		timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? ' +
		' AND (HISTORY_BIZ_EVENT = \'EVAL_CREATED\' OR HISTORY_BIZ_EVENT = \'EVAL_UPDATED\' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_PUB_COMMUNITY\'' +
		' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_REWORK\' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_PUB_SUBMITTER\' ' + 
		' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_UNPUBLISH\' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_SUBMIT\' )';
	oHQ.statement(sEvaluationH).execute(userID, userID, userID, retentionValue, userID);


}

function updateEvaluationRequestObjects(oHQ, timeSQL, retentionValue, userID) {
    
    
    
	var sEvaluationRequest = 'update top 10000 "sap.ino.db.evaluation::t_evaluation_request" set created_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';

	
	var sEvaluationRequestIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'EVAL_REQUEST\' AND ROLE_CODE = \'EVAL_REQUEST_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.evaluation::t_evaluation_request" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ?)';
	oHQ.statement(sEvaluationRequestIdentityRole).execute(userID, retentionValue, userID);	
	
	var sEvaluationRequestIdentityRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'EVAL_REQUEST\' AND ROLE_CODE = \'EVAL_REQUEST_OWNER\' AND HISTORY_DB_EVENT =  \'CREATED\' AND HISTORY_BIZ_EVENT = \'EVAL_REQ_CREATED\' ' +
		' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.evaluation::t_evaluation_request" where ' + timeSQL + '(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ?' +
		' and created_by_id <> ?)';
	oHQ.statement(sEvaluationRequestIdentityRoleH).execute(userID,userID, retentionValue, userID);			
	
	oHQ.statement(sEvaluationRequest).execute(userID, retentionValue, userID);
	
	var sEvaluationRequestH =
		'update top 10000 "sap.ino.db.evaluation::t_evaluation_request_h" set CREATED_BY_ID = ? , HISTORY_ACTOR_ID = ? , CHANGED_BY_ID = ? where ' +
		timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? and ' +
		'(HISTORY_BIZ_EVENT = \'EVAL_REQ_CREATED\' OR HISTORY_BIZ_EVENT = \'EVAL_REQ_UPDATED\' OR HISTORY_BIZ_EVENT = \'EVAL_REQ_DELETED\'' + 
		'OR HISTORY_BIZ_EVENT = \'EVAL_REQ_ITEM_CLARIFICATION_SENT\' OR  HISTORY_BIZ_EVENT = \'EVAL_REQ_EXPERT_FORWARDED\' )';
	oHQ.statement(sEvaluationRequestH).execute(userID, userID, userID, retentionValue, userID);
	
	var sClarification = 'update top 10000 "sap.ino.db.evaluation::t_evaluation_request_item_clarification" set created_by_id = ? where ' + timeSQL +
		'(created_at,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
		oHQ.statement(sClarification).execute(userID, retentionValue, userID);
	var sFoward = 'update top 10000 "sap.ino.db.evaluation::t_evaluation_request_item_forward" set from_identity = ? where ' + timeSQL +
		'(FORWARDED_AT,CURRENT_UTCTIMESTAMP) <= ? and from_identity <> ?';
		oHQ.statement(sFoward).execute(userID, retentionValue, userID);		
		
	var sEvaluationRequestItemH = 'update top 10000 "sap.ino.db.evaluation::t_evaluation_request_item_h" set  HISTORY_ACTOR_ID = ? where ' +
		timeSQL + '(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? and ' +
		'((HISTORY_DB_EVENT = \'CREATED\' AND (HISTORY_BIZ_EVENT = \'EVAL_REQ_CREATED\' OR HISTORY_BIZ_EVENT = \'EVAL_REQ_UPDATED\')) OR ' +
		'(HISTORY_DB_EVENT = \'UPDATED\' AND (HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_REQ_ACCEPT\' ' + 
		' OR HISTORY_BIZ_EVENT = \'STATUS_ACTION_sap.ino.config.EVAL_REQ_REJECT\' OR HISTORY_BIZ_EVENT = \'EVAL_REQ_ITEM_FORWARDED\' OR HISTORY_BIZ_EVENT = \'EVAL_REQ_ITEM_CLARIFICATION_SENT\' )))';

	oHQ.statement(sEvaluationRequestItemH).execute(userID, retentionValue, userID);

//Update evaluation request comment
	var sComment = 'update top 10000 "sap.ino.db.comment::t_comment" set CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'EVAL_REQUEST\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';

	var sCommentH = 'update top 10000 "sap.ino.db.comment::t_comment_h" set HISTORY_ACTOR_ID = ? , CREATED_BY_ID = ? , CHANGED_BY_ID = ?' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'EVAL_REQUEST\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ?' +
		' AND (HISTORY_BIZ_EVENT = \'COMMENT_CREATED\' OR HISTORY_BIZ_EVENT = \'COMMENT_UPDATED\' )';
		
	var sCommentUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'EVAL_REQUEST\' AND ROLE_CODE = \'COMMENT_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'EVAL_REQUEST\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';
	oHQ.statement(sCommentUpdateIdentityRole).execute(userID, retentionValue, userID);		
	var sCommentUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'EVAL_REQUEST\' AND  ROLE_CODE = \'COMMENT_OWNER\'  and history_biz_event = \'COMMENT_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'EVAL_REQUEST\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';		

	oHQ.statement(sCommentUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);
	
	oHQ.statement(sComment).execute(userID, userID, retentionValue, userID);
	oHQ.statement(sCommentH).execute(userID, userID, userID, retentionValue, userID);


}

function updateWallObjects(oHQ, timeSQL, retentionValue, userID) {
    
	var sWallUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'WALL\' AND ROLE_CODE = \'WALL_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.wall::t_wall"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?)';    
		
	oHQ.statement(sWallUpdateIdentityRole).execute(userID, retentionValue, userID); 
	
	//Set the owner to a new role with admin
	var sWallInsertIdentityRole = 'insert into "sap.ino.db.iam::t_object_identity_role" ' +
		'( select top 10000 "sap.ino.db.iam::s_object_identity_role".nextval,  created_by_id, id,' + 
		'\'WALL\', \'WALL_ADMIN\' from "sap.ino.db.wall::t_wall"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? )';    	
	oHQ.statement(sWallInsertIdentityRole).execute(retentionValue, userID); 	
	
	var sWallUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'WALL\' AND  ROLE_CODE = \'WALL_OWNER\'  and history_biz_event = \'WALL_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.wall::t_wall"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?)';		

	oHQ.statement(sWallUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);	
	
	
	//Set History Data	
	var sWallInsertIdentityRoleH = 'insert into "sap.ino.db.iam::t_object_identity_role_h" ' +
		'(select \'CREATED\',\'WALL_UPDATED\', current_utctimestamp,' + userID + ', role.id, WALL.created_by_id,role.OBJECT_ID,role.OBJECT_TYPE_CODE,role.ROLE_CODE from ' + 
		'( select top 10000 id, created_by_id from "sap.ino.db.wall::t_wall"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? ) as WALL inner join "sap.ino.db.iam::t_object_identity_role" as role on' 
        + ' role.object_id = wall.id and role.object_type_code = \'WALL\' AND ROLE.ROLE_CODE = \'WALL_ADMIN\' AND ROLE.IDENTITY_ID = WALL.CREATED_BY_ID )';    	
	oHQ.statement(sWallInsertIdentityRoleH).execute(retentionValue, userID); 		
	
	
	var sWall = 'update top 10000 "sap.ino.db.wall::t_wall" set created_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
		
	oHQ.statement(sWall).execute(userID, retentionValue, userID);
	
	var sWallH = 'update top 10000 "sap.ino.db.wall::t_wall_h" set  CREATED_BY_ID = ? , HISTORY_ACTOR_ID = ? , CHANGED_BY_ID = ? where ' +
		timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? and ( HISTORY_BIZ_EVENT = \'WALL_CREATED\' OR HISTORY_BIZ_EVENT = \'WALL_UPDATED\' )';
		
	oHQ.statement(sWallH).execute(userID, userID, userID, retentionValue, userID);
	
	var sWallItem = 'update top 10000 "sap.ino.db.wall::t_wall_item" set created_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
		
	oHQ.statement(sWallItem).execute(userID, retentionValue, userID);	
	
	var sWallItemH = 'update top 10000 "sap.ino.db.wall::t_wall_item_h" set CREATED_BY_ID = ? , HISTORY_ACTOR_ID = ? , CHANGED_BY_ID = ? where ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? and ( HISTORY_BIZ_EVENT = \'WALL_ITEM_CREATED\' OR HISTORY_BIZ_EVENT = \'WALL_ITEM_UPDATED\' ) ';
		
	oHQ.statement(sWallItemH).execute(userID, userID, userID, retentionValue, userID);	
	
	
}
function updateCampaignBlogs(oHQ, timeSQL, retentionValue, userID){
	var sBlogUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'BLOG\' AND ROLE_CODE = \'BLOG_AUTHOR\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.blog::t_blog"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? and object_type_code = \'CAMPAIGN\')';    
		
	oHQ.statement(sBlogUpdateIdentityRole).execute(userID, retentionValue, userID); 
	
	var sBlogUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'BLOG\' AND  ROLE_CODE = \'BLOG_AUTHOR\'  and history_biz_event = \'BLOG_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.blog::t_blog"  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? and object_type_code = \'CAMPAIGN\')';		

	oHQ.statement(sBlogUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);	    
    
    
    var sCampaignBlog = 'update top 10000 "sap.ino.db.blog::t_blog" set created_by_id = ?  where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? and object_type_code = \'CAMPAIGN\'';
		
		oHQ.statement(sCampaignBlog).execute(userID, retentionValue, userID);	
		
    var sCampaignBlogH = 'update top 10000 "sap.ino.db.blog::t_blog_h" set CREATED_BY_ID = ? , HISTORY_ACTOR_ID = ? , CHANGED_BY_ID = ? where ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ? and HISTORY_ACTOR_ID <> ? and ( HISTORY_BIZ_EVENT = \'BLOG_CREATED\' OR HISTORY_BIZ_EVENT = \'BLOG_PUBLISH\' ' +
		'OR HISTORY_BIZ_EVENT = \'BLOG_MAJORPUBLISH\' OR HISTORY_BIZ_EVENT = \'BLOG_UPDATED\' OR HISTORY_BIZ_EVENT = \'BLOG_UNPUBLISH\') ';
	
	oHQ.statement(sCampaignBlogH).execute(userID, userID, userID, retentionValue, userID);	
//Blog Comment
	var sComment = 'update top 10000 "sap.ino.db.comment::t_comment" set CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'BLOG\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';

	var sCommentH = 'update top 10000 "sap.ino.db.comment::t_comment_h" set HISTORY_ACTOR_ID = ? , CREATED_BY_ID = ? , CHANGED_BY_ID = ?' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'BLOG\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ?' +
		' AND (HISTORY_BIZ_EVENT = \'COMMENT_CREATED\' OR HISTORY_BIZ_EVENT = \'COMMENT_UPDATED\' )';    
		
	var sCommentUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'BLOG\' AND ROLE_CODE = \'COMMENT_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'BLOG\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';
	oHQ.statement(sCommentUpdateIdentityRole).execute(userID, retentionValue, userID);		
	var sCommentUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'BLOG\' AND  ROLE_CODE = \'COMMENT_OWNER\'  and history_biz_event = \'COMMENT_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'BLOG\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';		

	oHQ.statement(sCommentUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);
	
	oHQ.statement(sComment).execute(userID, userID, retentionValue, userID);
	oHQ.statement(sCommentH).execute(userID, userID, userID, retentionValue, userID);
	
    
}
function updateCampaignComment(oHQ, timeSQL, retentionValue, userID) {

	var sCampaignComment = 'update top 10000 "sap.ino.db.comment::t_comment" set CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'CAMPAIGN\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ?';

	var sCampaignCommentH = 'update top 10000 "sap.ino.db.comment::t_comment_h" set HISTORY_ACTOR_ID = ? , CREATED_BY_ID = ? , CHANGED_BY_ID = ? ' +
		'where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'CAMPAIGN\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ?' +
		' AND (HISTORY_BIZ_EVENT = \'COMMENT_CREATED\' OR HISTORY_BIZ_EVENT = \'COMMENT_UPDATED\' )';
		
	var sCommentUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'CAMPAIGN_COMMENT\' AND ROLE_CODE = \'COMMENT_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'CAMPAIGN\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';
	oHQ.statement(sCommentUpdateIdentityRole).execute(userID, retentionValue, userID);		
	var sCommentUpdateOwnerRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'CAMPAIGN_COMMENT\' AND  ROLE_CODE = \'COMMENT_OWNER\'  and history_biz_event = \'COMMENT_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.comment::t_comment" where type_code = \'COMMUNITY_COMMENT\' AND OBJECT_TYPE_CODE = \'CAMPAIGN\'  AND ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? AND CREATED_BY_ID <> ? )';		

	oHQ.statement(sCommentUpdateOwnerRoleH).execute(userID, userID, retentionValue, userID);		
		
		
	oHQ.statement(sCampaignComment).execute(userID, userID, retentionValue, userID);
	oHQ.statement(sCampaignCommentH).execute(userID, userID, userID, retentionValue, userID);
	
	
	
}
function updateFeeds(oHQ, timeSQL, retentionValue, userID){
    var sFeed = 'update top 10000 "sap.ino.db.feed::t_feed" set actor_id = ?  where ' + timeSQL +
		'(EVENT_AT,CURRENT_UTCTIMESTAMP) <= ? and actor_id <> ?';
		oHQ.statement(sFeed).execute(userID, retentionValue, userID);

//Feed include all feed and campaing feed
// sap.ino.db.feed.ext::v_ext_all_feeds
/* Idea Feeds*/
//1.Link & related ideas
 var sLinkH = 'update top 10000 "sap.ino.db.link::t_link_h" set HISTORY_ACTOR_ID = ? ' +
		'where OBJECT_TYPE_CODE = \'IDEA\' AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ? AND '
		+ 'HISTORY_DB_EVENT != \'UPDATED\' AND ( HISTORY_BIZ_EVENT = \'IDEA_UPDATED\'   OR HISTORY_BIZ_EVENT = \'RELATION_UPDATED\' or HISTORY_BIZ_EVENT = \'IDEA_CREATED\')';
		
		oHQ.statement(sLinkH).execute(userID, retentionValue, userID);	
		
		
//2.Idea Changes  please refer to 'updateIdeaCorrespondingObjects'  -> HISTORY_BIZ_EVENT = IDEA_UPDATED
//3.Tag Followed
 var sTagObjectH = 'update top 10000 "sap.ino.db.tag::t_object_tag_h" set HISTORY_ACTOR_ID = ? ' +
		'where OBJECT_TYPE_CODE = \'IDEA\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ? ';
		oHQ.statement(sTagObjectH).execute(userID, retentionValue, userID);	   
//4.Idea Comment -> updateIdeaComment

//5.Identity With Name  ->updateIdeaCorrespondingObjects

//6.Status Action  ->updateIdeaCorrespondingObjects

//7. Reassign Campaign  ->updateIdeaCorrespondingObjects
//8. Evaluation  ->updateEvaluationObjects
//9. Attachment 
	var sAttachmentUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? ' +
		'where object_type_code = \'ATTACHMENT\' AND ROLE_CODE = \'ATTACHMENT_OWNER\'' + ' AND OBJECT_ID IN' +
		' (select top 10000 id from "sap.ino.db.attachment::t_attachment" where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? )';
	oHQ.statement(sAttachmentUpdateIdentityRole).execute(userID, retentionValue, userID);
	
	var sAttachmentUpdateIdentityRoleH = 'update "sap.ino.db.iam::t_object_identity_role_h" set identity_id = ?, history_actor_id = ? ' +
		'where object_type_code = \'ATTACHMENT\' AND  ROLE_CODE = \'ATTACHMENT_OWNER\'  and history_biz_event = \'ATTACH_CREATED\' and history_db_event = \'CREATED\''
		+ ' AND OBJECT_ID IN (select top 10000 id from "sap.ino.db.attachment::t_attachment" where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ? )';		

	oHQ.statement(sAttachmentUpdateIdentityRoleH).execute(userID, userID, retentionValue, userID);	

	var sAttachment = 'update top 10000 "sap.ino.db.attachment::t_attachment" set created_by_id = ? where ' + timeSQL +
		'(CHANGED_AT,CURRENT_UTCTIMESTAMP) <= ? and created_by_id <> ?';
	oHQ.statement(sAttachment).execute(userID, retentionValue, userID);

 var sAttachmentAssignmentH = 'update top 10000 "sap.ino.db.attachment::t_attachment_assignment_h" set HISTORY_ACTOR_ID = ? ' +
		'where OWNER_TYPE_CODE = \'IDEA\'  AND HISTORY_BIZ_EVENT = \'IDEA_UPDATED\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ?  AND (ROLE_TYPE_CODE = \'ATTACHMENT\' or ' + 
        '(ROLE_TYPE_CODE = \'IDEA_TITLE_IMAGE\' and HISTORY_DB_EVENT = \'CREATED\'))';
		oHQ.statement(sAttachmentAssignmentH).execute(userID, retentionValue, userID);
//10. Wall assignment
 var sWallAssignmentH = 'update top 10000 "sap.ino.db.wall::t_wall_assignment_h" set HISTORY_ACTOR_ID = ? ' +
		'where ROLE_TYPE_CODE = \'WALL\'  AND ' + timeSQL +
		'(HISTORY_AT,CURRENT_UTCTIMESTAMP) <= ?  AND HISTORY_ACTOR_ID <> ? ';
		oHQ.statement(sWallAssignmentH).execute(userID, retentionValue, userID);	 

/* Campaign Feeds sap.ino.db.campaign.ext::v_ext_campaign_feed  */
//1.Campaign Changes no need to do 
//2.Submit Idea ->updateIdeaCorrespondingObjects
//3.Campaign Tag changes no need to do

}
function updateCorrespondingObjects(oHQ, retentionUnit, retentionValue, userID) {
	var sTimeSQL;
	switch (retentionUnit) {
		case timeType.day:
			sTimeSQL = "DAYS_BETWEEN";
			break;
		case timeType.month:
			sTimeSQL = "MONTHS_BETWEEN";
			break;
		case timeType.year:
			sTimeSQL = "YEARS_BETWEEN";
			break;
	}

	/*IDEA  Idea corresponding Objects
	Create (include Draft)	
	Submit	
	Change	
	Change Status	
	Change Phase	
	Vote	
	Register for Idea Contribution	
*/
// 	updateIdeaCorrespondingObjects(oHQ, sTimeSQL, retentionValue, userID);
//     //	IDEA comment
// 	updateIdeaComment(oHQ, sTimeSQL, retentionValue, userID);
// 	//Internal
// 	updateInternalNote(oHQ, sTimeSQL, retentionValue, userID);
// 	//External Objects
// 	updateExternalObjects(oHQ, sTimeSQL, retentionValue, userID);
// 	//Evaluation
// 	updateEvaluationObjects(oHQ, sTimeSQL, retentionValue, userID);
// 	//Idea Activity

// 	//Evaluation Request
    updateEvaluationRequestObjects(oHQ, sTimeSQL, retentionValue, userID);
	//Wall
    updateWallObjects(oHQ, sTimeSQL, retentionValue, userID);
	//Campaign Blog
// 	updateCampaignBlogs(oHQ, sTimeSQL, retentionValue, userID);
//     //CampaignComment
//     updateCampaignComment(oHQ, sTimeSQL, retentionValue, userID);
//     //Update Feeds
//     updateFeeds(oHQ, sTimeSQL, retentionValue, userID);
   
   
}