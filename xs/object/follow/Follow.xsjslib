
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var check = $.import("sap.ino.xs.aof.lib", "check");
var FollowMessage = $.import("sap.ino.xs.object.follow", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
    actions : { 
        create : {
            authorizationCheck : createAuthCheck,
            executionCheck : checkDoubleFollow,
            historyEvent: "FOLLOW_CREATED"
        },
        update : {
            authorizationCheck : authCheck(FollowMessage.AUTH_MISSING_FOLLOW_UPDATE)
        },
        del : {
            authorizationCheck : authCheck(FollowMessage.AUTH_MISSING_FOLLOW_DELETE),
            historyEvent: "FOLLOW_DELETED"    
        },
        read : {
            authorizationCheck : authCheck(FollowMessage.AUTH_MISSING_FOLLOW_READ)
        }
    },   
    Root : {
        table : "sap.ino.db.follow::t_follow",
        sequence : "sap.ino.db.follow::s_follow",
		historyTable: "sap.ino.db.follow::t_follow_h",        
        determinations : {
            onModify : [determineSystemAdminData]
        },
        attributes : {
            OBJECT_TYPE_CODE : {
                readOnly:check.readOnlyAfterCreateCheck(FollowMessage.FOLLOW_OBJECT_TYPE_UNCHANGEABLE)
            }, 
            OBJECT_ID :{
                readOnly:check.readOnlyAfterCreateCheck(FollowMessage.FOLLOW_OBJECT_TYPE_UNCHANGEABLE)
            },
            CREATED_BY_ID: {
                foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
                //readOnly : true
            },
            CREATED_AT: {
                readOnly : true
            }
        }
    }
};

function createAuthCheck(vKey, oWorkObject, fnMessage, oContext) {
    var sObjectTypeCode = oWorkObject.OBJECT_TYPE_CODE.toLowerCase();
    if (oWorkObject.OBJECT_ID > 0) {
        if(sObjectTypeCode === "campaign" || sObjectTypeCode === "idea") {
            var fnparentInstanceAccessCheck = auth.parentInstanceAccessCheck("sap.ino.db." + sObjectTypeCode + "::v_auth_follow_create", sObjectTypeCode + "_ID", "OBJECT_ID", FollowMessage.AUTH_MISSING_FOLLOW_CREATE);
            return fnparentInstanceAccessCheck(oWorkObject.OBJECT_ID, oWorkObject, fnMessage, oContext);    
        }
        return true;
    }
    return true;
}

function checkDoubleFollow(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    var hq = oContext.getHQ();
    var iCreatedById = !oWorkObject.CREATED_BY_ID ? oContext.getUser().ID : oWorkObject.CREATED_BY_ID;
    // lock idea/campaign/tag to avoid duplicate follow for same obeject, for update on
    // t_follow does not work as no record is there yet
   // hq.statement('select id from "sap.ino.db.'+ oRequestObject.OBJECT_TYPE_CODE + '::t_'+ oRequestObject.OBJECT_TYPE_CODE + 'where id = ? for update').execute(oRequestObject.OBJECT_ID);
    var sSelect = 'select * from "sap.ino.db.follow::t_follow" where object_type_code = ? and object_id = ? and created_by_id = ?';
    var result = hq.statement(sSelect).execute(oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID, iCreatedById);
    if (result.length > 0) {
        addMessage(Message.MessageSeverity.Error, FollowMessage.DUPLICATE_FOLLOW, vKey, "Root",
                "OBJECT_ID", oRequestObject.OBJECT_TYPE_CODE, oRequestObject.OBJECT_ID);
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

function determineSystemAdminData(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    var oUser = oContext.getUser();
    if(!oWorkObject.CREATED_BY_ID){
    oWorkObject.CREATED_BY_ID = oUser && oUser.ID;
    }
    oWorkObject.CREATED_AT = oContext.getRequestTimestamp();
}