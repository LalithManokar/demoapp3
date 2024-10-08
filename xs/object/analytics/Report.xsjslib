var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var AnalyticsMessage = $.import("sap.ino.xs.object.analytics", "message");

this.definition = {
    actions : {
        create : {
            authorizationCheck : false
        },
        update : {
            executionCheck : updateExecutionCheck,
            authorizationCheck : userAuthCheck(AnalyticsMessage.AUTH_MISSING_REPORT_UPDATE)
        },
        del : {
            authorizationCheck : userAuthCheck(AnalyticsMessage.AUTH_MISSING_REPORT_DELETE)
        },
        read : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.analytics::t_custom_report",
        sequence : "sap.ino.db.analytics::s_custom_report",
        determinations : {
            onCreate : [determineIds],
            onModify : [determine.systemAdminData]
        },
        attributes : {
            IDENTITY_ID : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            CAMPAIGN_ID : {
                foreignKeyTo : "sap.ino.xs.object.campaign.Campaign.Root"
            },
            REPORT_TEMPLATE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.analytics.ReportTemplate.Root"
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

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    //test of the config can be parsed into a valid JSON Object!
    try{
        var oConfig = JSON.parse(oWorkObject.CONFIG);
        if(!oConfig){
           addMessage(Message.MessageSeverity.Error, AnalyticsMessage.REPORT_CONFIG_INVALID, vKey, "Root", "CONFIG", oWorkObject.CONFIG); 
        }
    } catch(e){
        addMessage(Message.MessageSeverity.Error, AnalyticsMessage.REPORT_CONFIG_INVALID, vKey, "Root", "CONFIG", oWorkObject.CONFIG, e);
    }
}

function determineIds(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    oWorkObject.IDENTITY_ID = oContext.getUser().ID; 
}

function userAuthCheck(sMessageKey) {
    return function(vKey, oPersistedObject, addMessage, oContext) {
        if (oContext.getUser().ID != oPersistedObject.IDENTITY_ID) {
            addMessage(Message.MessageSeverity.Error, sMessageKey, vKey);
        }
    };
}
