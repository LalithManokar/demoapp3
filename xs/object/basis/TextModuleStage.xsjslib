var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

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
			historyEvent: "TEXT_MODULE_CREATE"
        },
        update : {
            authorizationCheck : false,
            executionCheck : updateExecutionCheck,
            enabledCheck : configCheck.configEnabledCheck,
			historyEvent: "TEXT_MODULE_UPDATE"
        },
        del : {
            authorizationCheck : false,
            enabledCheck : deleteEnabledCheck,
			historyEvent: "TEXT_MODULE_DELETE"
        },
        read : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        copy : {
            authorizationCheck : false,
            enabledCheck : copyEnabledCheck,
			historyEvent: "TEXT_MODULE_COPY"
        }
    },
    Root : {
        table : "sap.ino.db.basis::t_text_module_stage",
        sequence : "sap.ino.db.basis::s_text_module_stage",
		historyTable: "sap.ino.db.basis::t_text_module_stage_h",
        customProperties : {
            fileName : "t_text_module",
            contentOnlyInRepository : false
        },
        consistencyChecks : [check.duplicateAlternativeKeyCheck("PLAIN_CODE", BasisMessage.TEXT_MODULE_DUPLICATE_CODE, true)],
        activationCheck : activationCheck,
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onCopy : [configDetermine.determineConfigPackage, updateTitles, determineCode],
            onModify : [determineCode, determine.systemAdminData],
            onPersist : [configDetermine.activateContent]
        },
        nodes : {
            TextModuleText : {
                table : "sap.ino.db.basis::t_text_module_t_stage",
                sequence : "sap.ino.db.basis::s_text_module_t_stage",
		        historyTable: "sap.ino.db.basis::t_text_module_t_stage_h",
                customProperties : {
                    fileName : "t_text_module_t"
                },
                parentKey : "TEXT_MODULE_ID",
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

function isTextModuleUsed(sCode, oHQ) {
    // not all references are modeled as foreign key releation (e.g. local system settings)
    // therefore we cannot use the util function
    var sSelect = 'select 1 as no from "SAP_INO"."sap.ino.db.basis::v_text_module_usage" where text_module_code = ?';
    var aResult = oHQ.statement(sSelect).execute(sCode);
    if (aResult && aResult.length > 0) {
        return true;
    }
    return false;
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    var oHQ = oContext.getHQ();
    if (oRequestObject.PLAIN_CODE !== undefined) {
        if (isTextModuleUsed(oPersistedObject.CODE, oHQ)) {
            addMessage(Message.MessageSeverity.Error, BasisMessage.TEXT_MODULE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oWorkObject.PLAIN_CODE);
            return;
        }
    }

    // make sure that determined codes are set
    oWorkObject.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE);
}

function deleteEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
    configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
    if (isTextModuleUsed(oPersistedObject.CODE, oContext.getHQ())) {
        addMessage(Message.MessageSeverity.Error, BasisMessage.TEXT_MODULE_UNCHANGEABLE, vKey, "Root");
    }
}

function activationCheck(oActiveConfiguration, oStage, addMessage, oContext) {
    if (oActiveConfiguration) {
        checkUpdateAllowed(oStage, oActiveConfiguration, oStage.CODE, addMessage, oContext.getHQ());
    }
}

function checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
    if (!oPersistedObject) {
        return;
    }
    // the code may not be changed when references exist
    // an undefined plain code may happen if we are in the activation, there only the final code exists!
    if (oWorkObject.PLAIN_CODE) {
        if ((oWorkObject.PLAIN_CODE !== oPersistedObject.PLAIN_CODE) && isTextModuleUsed(oPersistedObject.CODE, oHQ)) {
            addMessage(Message.MessageSeverity.Error, BasisMessage.TEXT_MODULE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oWorkObject.PLAIN_CODE);
        }
    }
}

function determineCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    oWorkObject.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE);
    if (oWorkObject.TextModuleText) {
        // First determine all codes!
        _.each(oWorkObject.TextModuleText, function(oTextModuleText) {
        	oTextModuleText.PACKAGE_ID = oWorkObject.PACKAGE_ID;
        	oTextModuleText.CODE = configUtil.getFullCode(oWorkObject.CODE, oWorkObject.PLAIN_CODE + "_" + oTextModuleText.LANG);
        	oTextModuleText.TEXT_MODULE_CODE = oWorkObject.CODE;
        });
    }
}

function copyEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
    configCheck.configAvailableCheck(vKey, oPersistedObject, addMessage, oContext);

    // if the Model has no ID it cannot be copied...
    if (!oPersistedObject.ID || oPersistedObject.ID <= 0) {
        addMessage(Message.MessageSeverity.Error, BasisMessage.TEXT_MODULE_NO_COPY, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
    }
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
    var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
    var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

    var sDefaultText = oWorkObject.DEFAULT_TEXT;
    var sPrefix = textBundle.getText("uitexts", "BO_TEXT_MODULE_COPY_PREFIX", [], "", false, oContext.getHQ());
    sDefaultText = sPrefix + sDefaultText;

    // check length
    sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

    oWorkObject.DEFAULT_TEXT = sDefaultText;

    var sPlainCodeText = oWorkObject.PLAIN_CODE;
    // check length
    sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

    oWorkObject.PLAIN_CODE = sPlainCodeText;

}