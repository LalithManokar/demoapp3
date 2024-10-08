var check = $.import("sap.ino.xs.aof.lib", "check");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var AnalyticsMessage = $.import("sap.ino.xs.object.analytics", "message");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Stage,
    actions : {
        create : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        update : {
            authorizationCheck : false,
            executionCheck : updateExecutionCheck,
            enabledCheck : configCheck.configEnabledCheck
        },
        del : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        read : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        copy : {
            authorizationCheck : false,
            enabledCheck : configCheck.configAvailableCheck
        }
    },
    Root : {
        table : "sap.ino.db.analytics::t_report_template_stage",
        sequence : "sap.ino.db.analytics::s_report_template",
        customProperties : {
            fileName : "t_report_template",
            contentOnlyInRepository : true
        },
        consistencyChecks : [check.duplicateAlternativeKeyCheck("PLAIN_CODE", AnalyticsMessage.REPORT_DUPLICATE_CODE, true)],
        activationCheck : activationCheck,
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onModify : [configDetermine.determinePackageAndCode, determine.systemAdminData]
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            },
            PLAIN_CODE : {
                required : true,
                consistencyChecks : [configCheck.validPlainCodeCheck]
            },
            CONFIG : {
                required : true
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

function activationCheck(oActiveConfiguration, oStage, addMessage, oContext) {
    //test of the config can be parsed into a valid JSON Object!
    try{
        var oConfig = JSON.parse(oStage.CONFIG);
        if(!oConfig){
           addMessage(Message.MessageSeverity.Error, AnalyticsMessage.REPORT_CONFIG_INVALID, oStage.CODE, "Root", "CONFIG", oStage.CONFIG); 
        }
    } catch(e){
        addMessage(Message.MessageSeverity.Error, AnalyticsMessage.REPORT_CONFIG_INVALID, oStage.CODE, "Root", "CONFIG", oStage.CONFIG, e);
    }
}