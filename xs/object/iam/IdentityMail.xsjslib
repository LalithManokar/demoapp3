var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

this.definition = {
    Root : {
        table : "sap.ino.db.iam::t_identity_mail",
        sequence : "sap.ino.db.iam::s_identity_mail",
        determinations : {
            onModify : [determine.systemAdminData], 
            onPersist : []
        },
        attributes : {
            TO_IDENTITY : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            MAIL_SENT_AT:{
                readOnly: true
            }
        }
    },
    actions : {
        create : {
            authorizationCheck : false
        }
    }
};
