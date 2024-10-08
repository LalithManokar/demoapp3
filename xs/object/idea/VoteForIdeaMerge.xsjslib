var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var VoteMessage = $.import("sap.ino.xs.object.idea", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var aof = $.import("sap.ino.xs.aof.core", "framework");

var VoteType = {
    Star : "STAR",
    Like : "LIKE",
    LikeDislike : "LIKE_DISLIKE"
};

this.definition = {
    actions : {
        create : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.idea::t_vote",
        sequence : "sap.ino.db.idea::s_vote",
        determinations : {
            onModify : [determineSystemAdminData],
            onPersist : [updateAggregationScore]
        },
        attributes : {
            IDEA_ID : {
                foreignKeyTo : "sap.ino.xs.object.idea.Idea.Root",
                readOnly : check.readOnlyAfterCreateCheck(VoteMessage.VOTE_IDEA_UNCHANGEABLE)
            },
            USER_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            CREATED_AT : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true
            }
        }
    }
};



function determineSystemAdminData(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    
    var sNowISO = oContext.getRequestTimestamp();

    if (!oWorkObject.CREATED_AT || oContext.getAction().name == "copy") {
        oWorkObject.CREATED_AT = sNowISO;        
    }

    oWorkObject.CHANGED_AT = sNowISO;
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



