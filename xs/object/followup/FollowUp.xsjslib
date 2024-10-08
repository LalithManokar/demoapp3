var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var status = $.import("sap.ino.xs.object.status", "Status");
var FollowUpMessage = $.import("sap.ino.xs.object.followup", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
    actions : {
        create : {
            authorizationCheck : createAuthCheck,
            executionCheck : checkDoubleFollowUp
        },
        update : {
            authorizationCheck : authCheck(FollowUpMessage.AUTH_MISSING_FOLLOW_UP_UPDATE),
            executionCheck: checkFinalIdea
        },
        del : {
            authorizationCheck : authCheck(FollowUpMessage.AUTH_MISSING_FOLLOW_UP_DELETE)
        },
        read : {
            authorizationCheck : authCheck(FollowUpMessage.AUTH_MISSING_FOLLOW_UP_READ)
        },
        massModify : {
            authorizationCheck : false,
            execute : massModify,
            isStatic : true
        }
    },
    Root : {
        table : "sap.ino.db.followup::t_follow_up",
        sequence : "sap.ino.db.followup::s_follow_up",
        determinations : {
        	onUpdate : [resetNotificationFlag],
            onModify : [determine.systemAdminData]
        },
        consistencyChecks : [check.objectReferenceCheck("OBJECT_TYPE_CODE", "OBJECT_ID", "Root"),
                duplicateObjectCheck],
        attributes : {
            OBJECT_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.aof.object.ApplicationObject.Root",
                readOnly : check.readOnlyAfterCreateCheck(FollowUpMessage.FOLLOW_UP_OBJECT_TYPE_UNCHANGEABLE)
            },
            OBJECT_ID : {
                foreignKeyTo : "sap.ino.xs.object.idea.Idea.Root",
                readOnly : check.readOnlyAfterCreateCheck(FollowUpMessage.FOLLOW_UP_OBJECT_ID_UNCHANGEABLE)
            },
            CREATED_AT : {
                readOnly : true
            },
            CREATED_BY_ID : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true
            },
            CHANGED_BY_ID : {
                readOnly : true
            }
        }
    }
};

function _checkFollowUpDate(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext){
    var oDateNow = new Date(new Date().toISOString().substr(0, 10));
    if(!oRequestObject.DATE || new Date(oRequestObject.DATE) < oDateNow){
         addMessage(Message.MessageSeverity.Error, FollowUpMessage.FOLLOW_UP_FOLLOW_DATE_GE_TODAY, vKey, "Root",
            "OBJECT_ID", oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID);
    }
}

function checkDoubleFollowUp(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    _checkFollowUpDate(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext);
    var hq = oContext.getHQ();
    // lock idea to avoid duplicate follow-up for same idea, for update on
    // t_follow_up does not work as no record is there yet
    hq.statement('select id from "sap.ino.db.idea::t_idea" where id = ? for update').execute(oRequestObject.OBJECT_ID);

    var sSelect = 'select * from "sap.ino.db.followup::t_follow_up" where object_type_code = ? and object_id = ? and created_by_id = ?';
    var result = hq.statement(sSelect).execute(oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID, oContext.getUser().ID);
    if (result.length > 0) {
        addMessage(Message.MessageSeverity.Error, FollowUpMessage.DUPLICATE_FOLLOW_UP, vKey, "Root",
                "OBJECT_ID", oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID);
    }
    
    //stop follow up if idea is in final status
    var aIdeaStatus = hq.statement(
			'select STATUS_CODE from "sap.ino.db.idea::t_idea" where id = ?'
		).execute(oRequestObject.OBJECT_ID);
    if (aIdeaStatus.length > 0 && status.isFinalIdeaStatus(aIdeaStatus[0].STATUS_CODE)) {
	    addMessage(Message.MessageSeverity.Error, FollowUpMessage.FOLLOW_UP_FOLLOW_UP_NOT_POSSIBLE, vKey, "Root",
            "OBJECT_ID", oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID);
	}
}

function checkFinalIdea(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    _checkFollowUpDate(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext);
    var hq = oContext.getHQ();
    //stop follow up if idea is in final status
    if (oWorkObject.OBJECT_TYPE_CODE === "IDEA") {
        var aIdeaStatus = hq.statement(
    			'select STATUS_CODE from "sap.ino.db.idea::t_idea" where id = ?'
    		).execute(oWorkObject.OBJECT_ID);
        if (aIdeaStatus.length > 0 && status.isFinalIdeaStatus(aIdeaStatus[0].STATUS_CODE)) {
    	    addMessage(Message.MessageSeverity.Error, FollowUpMessage.FOLLOW_UP_FOLLOW_UP_NOT_POSSIBLE, vKey, "Root",
                "OBJECT_ID", oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID);
    	}  
    }
}

function massModify(oParameters, oBulkAccess, addMessage, getNextHandle, oContext, oMetadata) {
    var oFollowUp = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.followup.FollowUp");
        
    var sDate = oParameters.date;
    var aIdeaId = _.uniq(oParameters.ideaIds);
    
    var sStatement = "select ID, OBJECT_ID from \"sap.ino.db.followup::t_follow_up\" where created_by_id = ? and object_type_code = ?";
    sStatement += " and object_id in (" + _.times(aIdeaId.length, function() { return '?'; }).join(',') + ")";
    
    var oStatement = oContext.getHQ().statement(sStatement);
    var aResult = oStatement.execute.apply(oStatement, [oContext.getUser().ID, 'IDEA'].concat(aIdeaId));

    var oFollowUpIdea = _.indexBy(aResult, "OBJECT_ID");
    var oFollowUpIdeaIds = _.pluck(aResult, "OBJECT_ID");

    if (!sDate) {
        _.each(oFollowUpIdeaIds, function(iIdeaId) {
            var oResponse = oFollowUp.del(oFollowUpIdea[iIdeaId].ID);
            addMessage(oResponse.messages);
        });
    } else {
        _.each(oFollowUpIdeaIds, function(iIdeaId) {
            var oResponse = oFollowUp.update({
                ID: oFollowUpIdea[iIdeaId].ID,
                DATE: sDate
            });
            addMessage(oResponse.messages);
        });
        var oNoFollowUpIdeaIds = _.difference(aIdeaId, oFollowUpIdeaIds);   
         _.each(oNoFollowUpIdeaIds, function(iIdeaId) {
            var oResponse = oFollowUp.create({
                ID : -1,
                DATE : sDate,
                OBJECT_TYPE_CODE : 'IDEA',
                OBJECT_ID : iIdeaId
            });
            addMessage(oResponse.messages);
        });
    }
}

function authCheck(sAuthFailMsg) {
    return function (vKey, oWorkObject, fnMessage, oContext) {
        if (oWorkObject.CREATED_BY_ID != oContext.getUser().ID) {
            fnMessage(Message.MessageSeverity.Fatal, sAuthFailMsg, vKey, "Root", null);
            return false;
        }
        return true;
    };
}

function createAuthCheck(vKey, oWorkObject, fnMessage, oContext) {
    if (oWorkObject.OBJECT_ID > 0) {
        var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_idea_privilege", "IDEA_ID", FollowUpMessage.AUTH_MISSING_FOLLOW_UP_CREATE);
        return fnInstanceCheck(oWorkObject.OBJECT_ID, oWorkObject, fnMessage, oContext);        
    }
    return true;
}

function duplicateObjectCheck(vKey, oWorkObjectNode, addMessage, oContext) {
    if (oWorkObjectNode.OBJECT_TYPE_CODE && oWorkObjectNode.OBJECT_ID) {
        var oHQ = oContext.getHQ();
        var aExistingFollowUp = oHQ
                .statement(
                        "select ID from \"sap.ino.db.followup::t_follow_up\" where created_by_id = ? and object_type_code = ? and object_id = ?")
                .execute(oContext.getUser().ID, oWorkObjectNode.OBJECT_TYPE_CODE, oWorkObjectNode.OBJECT_ID);
        if (aExistingFollowUp.length > 1 || (aExistingFollowUp.length == 1 && aExistingFollowUp[0].ID != oWorkObjectNode.ID)) {
            addMessage(Message.MessageSeverity.Error, FollowUpMessage.DUPLICATE_FOLLOW_UP, vKey, "Root",
                    "OBJECT_ID", oWorkObjectNode.OBJECT_TYPE_CODE, oWorkObjectNode.OBJECT_ID);
        }
    }
}

function resetNotificationFlag(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    if (oWorkObject.DATE != oPersistedObject.DATE) {
        oWorkObject.IS_NOTIFICATION_GENERATED = 0;
    }
}