var check = $.import("sap.ino.xs.aof.lib", "check");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CampaignMessage = $.import("sap.ino.xs.object.campaign", "message");

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
            enabledCheck : deleteEnabledCheck
        },
        read : {
            authorizationCheck : false,
            enabledCheck : configCheck.configEnabledCheck
        },
        copy : {
            authorizationCheck : false,
            enabledCheck : configCheck.configAvailableCheck
        },
    },
    Root : {
        table : "sap.ino.db.campaign::t_phase_stage",
        sequence : "sap.ino.db.campaign::s_phase",
        customProperties : {
            fileName : "t_phase",
            contentOnlyInRepository : false
        },
        consistencyChecks : [check.duplicateAlternativeKeyCheck("PLAIN_CODE", CampaignMessage.PHASE_DUPLICATE_CODE, true)],
        activationCheck : activationCheck,
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
            PLAIN_CODE : {
                required : true,
                consistencyChecks : [configCheck.validPlainCodeCheck],
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

function isPhaseUsed(sCode, oHQ) {
    return configUtil.isCodeUsed("sap.ino.xs.object.campaign.Phase", "Root", sCode, oHQ);
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
    var oHQ = oContext.getHQ();
    if (oRequestObject.PLAIN_CODE !== undefined) {
        if (isPhaseUsed(oPersistedObject.CODE, oHQ)) {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.PHASE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oWorkObject.PLAIN_CODE);
            return;
        }
    }

    // make sure that determined codes are set
    oWorkObject.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE);
}

function deleteEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
    configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
    if (isPhaseUsed(oPersistedObject.CODE, oContext.getHQ())) {
        addMessage(Message.MessageSeverity.Error, CampaignMessage.PHASE_UNCHANGEABLE, vKey, "Root");
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
        if ((oWorkObject.PLAIN_CODE !== oPersistedObject.PLAIN_CODE) && isPhaseUsed(oPersistedObject.CODE, oHQ)) {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.PHASE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oWorkObject.PLAIN_CODE);
        }
    }
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