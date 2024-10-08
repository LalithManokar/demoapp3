var check = $.import("sap.ino.xs.aof.lib", "check");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var BasisMessage = $.import("sap.ino.xs.object.basis", "message");

this.definition = {
    type : ObjectType.Stage,
    actions : {
        create : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck,
			historyEvent: "SYSTEM_SETTING_CREATE"
        },
        update : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck,
			historyEvent: "SYSTEM_SETTING_UPDATE"
        },
        del : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck,
			historyEvent: "SYSTEM_SETTING_DELETE"
        },
        read : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        copy: {
            authorizationCheck : false,
            enabledCheck : configCheck.configAvailableCheck,
			historyEvent: "SYSTEM_SETTING_COPY"
        }
    },
    Root : {
        table : "sap.ino.db.basis::t_system_setting_stage",
        sequence : "sap.ino.db.basis::s_system_setting",
        customProperties : {
            fileName : "t_system_setting",
            contentOnlyInRepository : true
        },
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onModify : [configDetermine.determinePackageAndCode, determine.systemAdminData],
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            },
            CODE : {
                readOnly : true
            },
            PLAIN_CODE : {
                required : true,
                consistencyChecks : [configCheck.validPlainCodeCheck]
            },
            DATATYPE_CODE : {
                required : true,
                foreignKeyTo : "sap.ino.xs.object.basis.Datatype.Root"
            },
            DEFAULT_TEXT : {
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