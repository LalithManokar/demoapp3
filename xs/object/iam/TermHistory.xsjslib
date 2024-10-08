var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

var TypeCode = $.import("sap.ino.xs.object.iam", "TypeCode");
var SourceTypeCode = $.import("sap.ino.xs.object.iam", "SourceTypeCode");

this.definition = {
    Root : {
        table : "sap.ino.db.iam::t_term_accept_history",
        sequence : "sap.ino.db.iam::s_term_accept_history",
        determinations : {
            onModify : [determineTermId],
            onPersist : []
        },
        attributes : {
            TERM_CODE : {
                foreignKeyTo : "sap.ino.xs.object.basis.TextModule.Root"
            },
            TERM_ID : { 
                foreignKeyTo : "sap.ino.xs.object.basis.TextModuleStage.Root"
            },
            TERM_CHANGED_AT : {
                
            },
            USER_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            TERM_ACCEPTED_AT : {
                
            }
        }
    },
    actions : {
        create : {
            authorizationCheck : false
        }
    }
};

function determineTermId(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    var oHQ = oContext.getHQ();
    var sSelectTerm = 'select * from "sap.ino.db.basis::t_text_module_stage" where code = ?';
    var aTermModule = oHQ.statement(sSelectTerm).execute(oWorkObject.TERM_CODE);
    var sTermID = aTermModule[0].ID;
    oWorkObject.TERM_ID = parseInt(sTermID, 0);
    oWorkObject.TERM_CHANGED_AT = aTermModule[0].CHANGED_AT;
}