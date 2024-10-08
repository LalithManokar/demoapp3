var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var VoteMessage = $.import("sap.ino.xs.object.idea", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var aof = $.import("sap.ino.xs.aof.core", "framework");
var IdeaMessage = $.import("sap.ino.xs.object.idea", "message");

var connection = $.hdb.getConnection();

this.definition = {
    Root : {
        table : "sap.ino.db.idea::t_idea_read",
        sequence : "sap.ino.db.idea::s_idea_read",
        determinations : {
            onUpdate: []
        },
        attributes : {
            IDEA_ID : {
                foreignKeyTo : "sap.ino.xs.object.idea.Idea.Root",
                readOnly : check.readOnlyAfterCreateCheck(VoteMessage.FIELD_VALUE_INVALID_DATA)
            },
            CREATED_BY_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root",
                readOnly : true
            },
            CREATED_AT : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true
            },
            CHANGED_BY_ID: {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root",
                readOnly : true
            },
            IS_READ: {
                 
            }
        }
    },
    actions: {
        read: {
            authorizationCheck : false
        },
        update: {
            authorizationCheck : false
        },
        markRead: {
            authorizationCheck : false,
            execute: markIdeaAsRead
        }
    }
};

function authCheck(sAuthFailMsg) {

}

function markIdeaAsRead(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
    oWorkObject.IS_READ = 1;
    oWorkObject.CHANGED_AT = oContext.getRequestTimestamp();
    oWorkObject.CHANGED_BY_ID = oContext.getUser().ID;
}
