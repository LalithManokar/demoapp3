var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var StatusMessage = $.import("sap.ino.xs.object.status", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
    type : ObjectType.Stage,
    actions : {
        create : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        copy : {
            authorizationCheck : false,
            enabledCheck : configCheck.configAvailableCheck
        },
        update : {
            authorizationCheck : false,
            executionCheck : updateExecutionCheck,
            enabledCheck : configCheck.configEnabledCheck
        },
        read : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        del : {
            authorizationCheck : false,
            executionCheck : deleteExecutionCheck,
            enabledCheck : deleteEnableCheck
        }
    },
    Root : {
        table : "sap.ino.db.status::t_status_action_stage",
        sequence : "sap.ino.db.status::s_status_action",
        customProperties : {
            fileName : "t_status_action",
            codeTextBundle : "sap.ino.config::t_status_action",
            contentOnlyInRepository : false
        },
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onCopy : [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
            onModify : [configDetermine.determinePackageAndCode, determine.systemAdminData],
            onPersist : [configDetermine.activateContent]
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            },
            CODE : {
                readOnly : true
            },
            PACKAGE_ID : {
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
                readOnly : true,
                concurrencyControl : true
            },
            CHANGED_BY_ID : {
                readOnly : true
            }
        }
    }
};

function deleteEnableCheck(vKey, oPersistedObject, addMessage, oContext) {

    configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
    var oHQ = oContext.getHQ();
    // check for being used or not
    var aResult = oHQ.statement('select CODE from "sap.ino.db.status::t_status_model_transition" \
                    where STATUS_ACTION_CODE = ?').execute(oPersistedObject.CODE);
    if (aResult.length > 0) {
        addMessage(Message.MessageSeverity.Error, StatusMessage.SYSTEM_STATUS_ACTION_UNCHANGEABLE);
    }
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext){
    
    var oHQ = oContext.getHQ();
    // check for being used or not
    var aResult = oHQ.statement('select CODE from "sap.ino.db.status::t_status_model_transition" \
                    where STATUS_ACTION_CODE = ?').execute(oWorkObject.CODE);
    if (aResult.length > 0 && (oRequestObject.DEFAULT_TEXT !== undefined || oRequestObject.PLAIN_CODE !== undefined)) {
        addMessage(Message.MessageSeverity.Error, StatusMessage.STATUS_ACTION_UNCHANGEABLE, vKey, "Root", "CODE", oWorkObject.CODE);
        return;
    }
}

function deleteExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    if (oWorkObject.PACKAGE_ID === 'sap.ino.config') {
        addMessage(Message.MessageSeverity.Error, StatusMessage.SYSTEM_STATUS_ACTION_UNCHANGEABLE);
        return;
    }
    updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext);
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
    var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
    var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

    var sDefaultText = oWorkObject.DEFAULT_TEXT;
    var sPrefix = textBundle.getText("uitexts", "BO_PHASE_COPY_PREFIX", [], "", false, oContext.getHQ());
    sDefaultText = sPrefix + sDefaultText;

    // check length
    sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

    oWorkObject.DEFAULT_TEXT = sDefaultText;

    var sPlainCodeText = oWorkObject.PLAIN_CODE;
    // check length
    sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

    oWorkObject.PLAIN_CODE = sPlainCodeText;
}