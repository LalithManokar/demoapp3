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
            enabledCheck : configCheck.configEnabledCheck
        },
        update : {
            authorizationCheck : false,
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
        table : "sap.ino.db.basis::t_language_stage",
        sequence : "sap.ino.db.basis::s_language",
        customProperties : {
            fileName : "t_language",
            contentOnlyInRepository : true
        },
        consistencyChecks : [check.duplicateAlternativeKeyCheck("PLAIN_CODE", BasisMessage.LANGUAGE_DUPLICATE_CODE, true)],
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onModify : [configDetermine.determinePackageAndCode, determine.systemAdminData]
        },
        nodes : {
            Locale : {
                table : "sap.ino.db.basis::t_locale_stage",
                sequence : "sap.ino.db.basis::s_locale",
                customProperties : {
                    fileName : "t_locale"
                },
                parentKey : "LANGUAGE_ID",
                attributes : {
                    ID : {
                        isPrimaryKey : true
                    },
                    CODE : {
                        readOnly : true
                    }
                }
            }
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
