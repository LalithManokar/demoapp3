var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var check = $.import("sap.ino.xs.aof.lib", "check");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CampaignMessage = $.import("sap.ino.xs.object.campaign", "message");

var oTypeCode = {
    STAR : "STAR",
    LIKE : "LIKE",
    LIKE_DISLIKE : "LIKE_DISLIKE"
};

this.definition = {
    type : ObjectType.Stage,
    actions : {
        create : {
            authorizationCheck : false,
            executionCheck: updateExecutionCheck,
            enabledCheck : configCheck.configEnabledCheck
        },
        update : {
            authorizationCheck : false,
            executionCheck: updateExecutionCheck,
            enabledCheck : configCheck.configEnabledCheck
        },
        del : {
            authorizationCheck : false,
            enabledCheck : deleteEnableCheck
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
        table : "sap.ino.db.campaign::t_vote_type_stage",
        sequence : "sap.ino.db.campaign::s_vote_type",
        customProperties : {
            fileName : "t_vote_type",
            contentOnlyInRepository : false
        },
        determinations : {
            onCreate : [configDetermine.determineConfigPackage],
            onCopy : [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
            onModify : [configDetermine.determinePackageAndCode, determine.systemAdminData],
            onPersist : [configDetermine.activateContent]
        },
        activationCheck : activationCheck,
        consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", CampaignMessage.FORM_DUPLICATE_CODE, true)],
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
            },
            VOTE_REASON_CODE: {
                foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.Root"
            }
        }
    }
};

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

function updateExecutionCheck(vKey, oChangeRequest, oWorkObject, oPersistedObject, addMessage, oContext) {
    
    for (var key in oChangeRequest) {
        if (typeof oChangeRequest[key] !=="function") {
            if (key !== "ID" && key !== "DEFAULT_LONG_TEXT") {
                checkUpdateAllowed(oPersistedObject, vKey, addMessage, oContext.getHQ());
                break;
            }
        }
    }
    
    if (oWorkObject.TYPE_CODE && oWorkObject.TYPE_CODE === "STAR") {
        if (!oWorkObject.MAX_STAR_NO || oWorkObject.MAX_STAR_NO === "" || oWorkObject.MAX_STAR_NO === 0) {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.CAMPAIGN_VOTE_STAR_NO_MISSING, vKey, "Root", "MAX_STAR_NO");
        }
    }
    /* validation for vote by group*/
    if (oWorkObject.VOTED_BY_GROUP) {
        if (oWorkObject.TYPE_CODE !== "LIKE" ) {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.CAMPAIGN_VOTE_BY_GROUP_ERROR, vKey, "Root", "VOTED_BY_GROUP");
        }
    }
    
    if (oWorkObject.VOTE_COMMENT_TYPE && oWorkObject.VOTE_COMMENT_TYPE === "LIST") {
        if (!oWorkObject.VOTE_REASON_CODE || oWorkObject.VOTE_REASON_CODE === "") {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.CAMPAIGN_VOTE_REASON_LIST_MISSING, vKey, "Root", "VOTE_REASON_CODE");
        }
    }
    
    if (oWorkObject.VOTE_COMMENT_TYPE && oWorkObject.VOTE_COMMENT_TYPE === "LIST" && oWorkObject.VOTE_REASON_CODE) {
        var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.basis::v_value_option", "LIST_CODE", CampaignMessage.AUTH_MISSING_BACKOFFICE_PRIVILEGES);
        var bValueOptionListExist = fnInstanceCheck(oWorkObject.VOTE_REASON_CODE, oWorkObject, function() {}, oContext);
        if (!bValueOptionListExist) {
           addMessage(Message.MessageSeverity.Error, CampaignMessage.CAMPAIGN_VOTE_EMPTY_REASON_LIST, vKey, "Root", "VOTE_REASON_CODE", oWorkObject.VOTE_REASON_CODE); 
        }
    }
}

function deleteEnableCheck(vKey, oPersistedObject, addMessage, oContext){
    configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
    checkUpdateAllowed(oPersistedObject, vKey, addMessage, oContext.getHQ());
}


function checkUpdateAllowed(oPersistedObject, vKey, addMessage, oHQ) {
    if (!oPersistedObject) {
        return;
    }
    
    var bModelUsed = isModelUsed(oPersistedObject.CODE, oHQ);
    
    if (bModelUsed) {
        addMessage(Message.MessageSeverity.Error, CampaignMessage.CAMPAIGN_VOTE_TYPE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
    }
}

function isModelUsed(sCode, oHQ) {
    return configUtil.isCodeUsed("sap.ino.xs.object.campaign.VoteType", "Root", sCode, oHQ);
}

function activationCheck(oPersistedObject, oWorkObject, addMessage) {
    // check max star score
    if (oWorkObject.TYPE_CODE === oTypeCode.STAR) {
        if (_.isNull(oWorkObject.MAX_STAR_NO)) {
            addMessage(Message.MessageSeverity.Error, CampaignMessage.VOTE_ACTIVATION_INVALID_STAR_VOTE, oWorkObject.CODE, "Root", "MAX_STAR_NO", oWorkObject.CODE);
        } else {
            var iMaxStar = parseInt(oWorkObject.MAX_STAR_NO, 10);
        	if (isNaN(iMaxStar)) {
        	    addMessage(Message.MessageSeverity.Error, CampaignMessage.VOTE_ACTIVATION_INVALID_VOTE_SCORE, oWorkObject.CODE, "Root", "MAX_STAR_NO", oWorkObject.CODE);
        	} else if (iMaxStar > 5 || iMaxStar <= 0) {
                addMessage(Message.MessageSeverity.Error, CampaignMessage.VOTE_ACTIVATION_INVALID_STAR_VOTE, oWorkObject.CODE, "Root", "MAX_STAR_NO", oWorkObject.CODE);
            }
        }
    }
}