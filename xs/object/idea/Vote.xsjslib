var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var VoteMessage = $.import("sap.ino.xs.object.idea", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var aof = $.import("sap.ino.xs.aof.core", "framework");
var trackingLog = $.import("sap.ino.xs.xslib", "trackingLog");
var ObjectOnPersistCallBack = $.import("sap.ino.xs.xslib", "ObjectOnPersistCallback");

var VoteType = {
    Star : "STAR",
    Like : "LIKE",
    LikeDislike : "LIKE_DISLIKE"
};

this.definition = {
    actions : {
        create : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.idea::v_auth_votes_modify",
                    "IDEA_ID", "IDEA_ID", VoteMessage.AUTH_MISSING_VOTE_CREATE),
            executionCheck : checkDoubleVote,
            enabledCheck : checkIdeaStatus
        },
        update : {
            authorizationCheck : userVoteAuthCheck(VoteMessage.AUTH_MISSING_VOTE_UPDATE),
            enabledCheck : checkIdeaStatus
        },
        del : {
            authorizationCheck : userVoteAuthCheck(VoteMessage.AUTH_MISSING_VOTE_DELETE),
            enabledCheck : checkIdeaStatus
        },
        read : {
            authorizationCheck : userVoteAuthCheck(VoteMessage.AUTH_MISSING_VOTE_READ)
        },
        bulkDeleteVotes : {
            authorizationCheck : false,
            execute : bulkDeleteVotes,
            isStatic : true,
            isInternal : true,
            customProperties : bulkDeleteVotesProperties
        },
    },
    Root : {
        table : "sap.ino.db.idea::t_vote",
        sequence : "sap.ino.db.idea::s_vote",
        determinations : {
            onModify : [determineSystemAdminData,onTrackVoteLog],
            onPersist : [updateAggregationScore, ObjectOnPersistCallBack.entry]
        },
        consistencyChecks : [checkVoteSetting],
        attributes : {
            IDEA_ID : {
                foreignKeyTo : "sap.ino.xs.object.idea.Idea.Root",
                readOnly : check.readOnlyAfterCreateCheck(VoteMessage.VOTE_IDEA_UNCHANGEABLE)
            },
            USER_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root",
                readOnly : true
            },
            CREATED_AT : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true,
                concurrencyControl: true
            }
        }
    }
};

function userVoteAuthCheck(sMessageKey) {
    return function(vKey, oPersistedObject, addMessage, oContext) {
        if (oContext.getUser().ID != oPersistedObject.USER_ID) {
            addMessage(Message.MessageSeverity.Error, sMessageKey, vKey);
        }
    };
}

function determineSystemAdminData(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    oWorkObject.USER_ID = oContext.getUser().ID;
    
    var sNowISO = oContext.getRequestTimestamp();
    var oUser = oContext.getUser();
    oWorkObject.USER_ID = oUser && oUser.ID;

    if (!oWorkObject.CREATED_AT || oContext.getAction().name == "copy") {
        oWorkObject.CREATED_AT = sNowISO;        
    }

    oWorkObject.CHANGED_AT = sNowISO;
}

function checkDoubleVote(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    var hq = oContext.getHQ();
    // lock idea to avoid duplicate votes for same idea, for update on
    // t_vote does not work as no record is there yet
    hq.statement('select id from "sap.ino.db.idea::t_idea" where id = ? for update').execute(oRequestObject.IDEA_ID);

    var sSelect = 'select * from "sap.ino.db.idea::t_vote" where idea_id = ? and user_id = ?';
    var result = hq.statement(sSelect).execute(oRequestObject.IDEA_ID, oContext.getUser().ID);
    if (result.length > 0) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.DOUBLE_VOTE_ON_IDEA, vKey);
    }
}

function checkIdeaStatus(vKey, oRequestObject, addMessage, oContext) {
    var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
    var oIdea = Idea.read(oRequestObject.IDEA_ID);
    if (oIdea.STATUS_CODE == 'sap.ino.config.DRAFT') {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_IDEA_DRAFT_VALIDITY, vKey);
    }
    if (oIdea.STATUS_CODE == 'sap.ino.config.DISCONTINUED') {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_IDEA_DISCONTINUED, vKey);
    }
    if (oIdea.STATUS_CODE == 'sap.ino.config.MERGED') {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_IDEA_MERGED, vKey);
    }
}

function checkVoteEnable(vKey, oRequestObject, addMessage, oContext) {
    // var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
    // var oIdea = Idea.read(oRequestObject.IDEA_ID);
}

function checkVoteSetting(vKey, oVote, addMessage, oContext) {
    var oHQ = oContext.getHQ();
    var aVoteSetting = oHQ.statement('select * from "sap.ino.db.idea::v_vote_setting" where idea_id = ?').execute(
            oVote.IDEA_ID);
    var oVoteSetting = _.first(aVoteSetting);
    if (!oVoteSetting || !_.toBool(oVoteSetting.VOTING_ACTIVE)) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_CAMPAIGN_PHASE_VALIDITY, vKey);
    }

    if (!_.isInteger(oVote.SCORE)) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_INVALID_VOTE_SCORE, vKey);
    }

    if (oVoteSetting.TYPE_CODE === VoteType.Star && (oVote.SCORE <= 0 || oVote.SCORE > oVoteSetting.MAX_STAR_NO)) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_INVALID_STAR_VOTE, vKey);
    }

    if (oVoteSetting.TYPE_CODE === VoteType.Like && oVote.SCORE !== 1) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_INVALID_LIKE_VOTE, vKey);
    }

    if (oVoteSetting.TYPE_CODE === VoteType.LikeDislike && (oVote.SCORE < -1 || oVote.SCORE > 1)) {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_INVALID_DISLIKE_VOTE, vKey);
    }
}

function updateAggregationScore(vKey, oVote, oPersistedObject, addMessage, getNextHandle, oContext) {
	_updateAggregationScore(oPersistedObject.IDEA_ID, oContext);
}

function _updateAggregationScore(ideaId, oContext){
	var oHQ = oContext.getHQ();
    oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_vote_update_aggr_score").execute({
        IT_IDEAS : [{
            ID : ideaId
        }]
    });
}


function _bulkDeleteVotes(oParameters, oBulkAccess, addMessage, oContext, bSimulate) {
    if(oParameters && oParameters.CAMPAIGN_ID && oParameters.IDEA_ID){
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_BULK_DELETE_TOO_MANY_PARAMETERS, undefined, "Root");
        return null;
    }
	
	if(oParameters && (oParameters.CAMPAIGN_ID || oParameters.IDEA_ID)){
		// assume that CAMPAIGN_ID is passed as parameter
		var condition = "IDEA_ID in (select ID from \"sap.ino.db.idea::t_idea\" where CAMPAIGN_ID = ?)";
		var conditionParameter = oParameters.CAMPAIGN_ID;
		// prepare conditions for the case IDEA_ID was passed as parameter
		if(oParameters.IDEA_ID){
			condition = "IDEA_ID = ?";
			conditionParameter = oParameters.IDEA_ID;
		}
		// execute bulk update
		var oResponse = oBulkAccess.del({
	        Root : { }
	    }, {
	        condition : condition,
	        conditionParameters : [conditionParameter]
	    },
	    bSimulate || false);
		
		if (!bSimulate) {
    		// recalculate the aggregated vote scores after the deletion of votes
    	    if(oParameters.IDEA_ID){
    	        _updateAggregationScore(oParameters.IDEA_ID, oContext);
    	    }
    	    if(oParameters.CAMPAIGN_ID){
    			var oHQ = oContext.getHQ();
    		    var aVoteDeleteStmt = oHQ.statement('delete from "sap.ino.db.idea::t_vote_aggr_score" where idea_id in (select ID from \"sap.ino.db.idea::t_idea\" where CAMPAIGN_ID = ?)');
    		    aVoteDeleteStmt.execute(oParameters.CAMPAIGN_ID);
    	    }
		}
		
	    addMessage(oResponse.messages);
	    return oResponse.affectedNodes.Root.count;
	}else {
        addMessage(Message.MessageSeverity.Error, VoteMessage.VOTE_BULK_DELETE_PARAMETER_REQUIRED, undefined, "Root");
        return null;
    }	
}

function bulkDeleteVotes(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	return _bulkDeleteVotes(oParameters, oBulkAccess, addMessage, oContext);
}

function bulkDeleteVotesProperties(oParameters, oBulkAccess, addMessage, oContext) {
	return _bulkDeleteVotes(oParameters, oBulkAccess, addMessage, oContext, true);
}


function onTrackVoteLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
 
 trackingLog.onTrackVoteLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext);
    
}