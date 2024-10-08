var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var CampMessage = $.import("sap.ino.xs.object.campaign", "message");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var dateUtil = $.import("sap.ino.xs.aof.lib", "date");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Message = $.import("sap.ino.xs.aof.lib", "message");

var Status = this.Status = {
    New : "sap.ino.config.REGISTER_NEW",
    Approved : "sap.ino.config.REGISTER_APPROVED",
    Rejected : "sap.ino.config.REGISTER_REJECTED"
};

this.definition = {
    isExtensible : true,
    actions : {
        create : {
            authorizationCheck : false,
            executionCheck : registerCheck,
            historyEvent : "CAMP_REGISTER_CREATED"
        },
        update : {
            authorizationCheck : authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_register", CampMessage.AUTH_MISSING_CAMPAIGN_REGISTER),
            executionCheck : updateCheck,
            historyEvent : "CAMP_REGISTER_UPDATED"
        },
        read : {
            authorizationCheck : authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_register", CampMessage.AUTH_MISSING_CAMPAIGN_REGISTER)
        },
        del : {
            authorizationCheck : false,
            historyEvent : "CAMP_REGISTER_LEAVED"
        },
        massUpdate : {
            authorizationCheck : false,
            execute : massUpdate,
            isStatic : true
        }
    },
    Root : {
        table : "sap.ino.db.campaign::t_registration",
        sequence : "sap.ino.db.campaign::s_registration",
        historyTable : "sap.ino.db.campaign::t_registration_h",
        determinations : {
            onModify : [determine.systemAdminData, determinBusinessData, addParticipantsForCampaign],
            onDelete: [addParticipantsForCampaign]
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            },
            CAMPAIGN_ID : {
                foreignKeyTo : 'sap.ino.xs.object.campaign.Campaign.Root'
            },
            CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
            CHANGED_AT : {
                readOnly: true,
                concurrencyControl : true
            },
            CHANGED_BY_ID: {
				readOnly: true
			}
        }
    }
};

function massUpdate(oParameters, oBulkAccess, addMessage, getNextHandle, oContext, oMetadata) {
    if (oParameters.status !== Status.Approved && oParameters.status !== Status.Rejected) {
        addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_ERROR);
        return;
    }
    var oRegister = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.campaign.Registration");
    _.each(oParameters.ids, function(id) {
        var oResponse = oRegister.update({
            ID : id,
            STATUS : oParameters.status,
            REASON: oParameters.REASON
        });
        addMessage(oResponse.messages);
    });
}

function addParticipantsForCampaign(vKey, oWorkObject, oPersistedObject, addMessage, fnNextHandle, oContext) {
    var oCampaignModel;
    var oCampaign;
    var oResponse;
    if (oContext.getAction().name === 'update') {
        if (oWorkObject.STATUS === Status.Approved) {
            oCampaignModel = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
            // get campaign info by id
            oCampaign = oCampaignModel.read(oWorkObject.CAMPAIGN_ID);
            // add a participants
            oCampaign.Participants.push({
                ID : -1,
                IDENTITY_ID : oWorkObject.APPLICANT_ID,
                OBJECT_ID : oWorkObject.CAMPAIGN_ID,
                OBJECT_TYPE_CODE : IdentityRole.ObjectType.Campaign,
                ROLE_CODE : IdentityRole.Role.CampaignUser
            });
           oResponse =  oCampaignModel.update(oCampaign);
           addMessage(oResponse.messages);
        }
    } else if (oContext.getAction().name === 'del') {
        oCampaignModel = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
        // get campaign info by id
        oCampaign = oCampaignModel.read(oPersistedObject.CAMPAIGN_ID);
        var aNewParticipants = _.filter(oCampaign.Participants, function(participant) {
            return participant.IDENTITY_ID !== oPersistedObject.APPLICANT_ID;
        });
        if (aNewParticipants.length < oCampaign.Participants.length) {
            oCampaign.Participants = aNewParticipants;
            oResponse =  oCampaignModel.update(oCampaign);
            addMessage(oResponse.messages);
        }
    }
}

function determinBusinessData(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    if (oContext.getAction().name === 'create') {
        oWorkObject.APPLICANT_ID = oContext.getUser().ID;
    } else if (oContext.getAction().name === 'update') {
        var oCampaignModel = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
        var oCampaign = oCampaignModel.read(oWorkObject.CAMPAIGN_ID);
        if (!oCampaign) {
            return;
        }
        // check is a auto prove campaign
        if (!oCampaign.IS_REGISTER_AUTO_APPROVE) {
            oWorkObject.APPROVER_ID = oContext.getUser().ID;
        }
    }
}

function registerCheck(vKey, oChangeRequest, oRegister, oPersistedCampaign, addMessage, oContext) {
    var oCampaignModel = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
    var oCampaign = oCampaignModel.read(oRegister.CAMPAIGN_ID);
    var oHQ = oContext.getHQ();
	var sSelect = 'select top 1 ID from "sap.ino.db.campaign::t_registration" where campaign_id = ? and APPLICANT_ID = ? and status=\'sap.ino.config.REGISTER_NEW\'';
	var result = oHQ.statement(sSelect).execute(oRegister.CAMPAIGN_ID, oContext.getUser().ID);
	if (result.length > 0) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_ERROR);
	} else if (!dateUtil.isNowBetween(oCampaign.REGISTER_FROM, oCampaign.REGISTER_TO)) {
        addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_ERROR);
    } else if (oRegister.STATUS !== Status.New) {
        addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_ERROR);
    }
}

function updateCheck(vKey, oChangeRequest, oRegister, oPersistedCampaign, addMessage, oContext) {
    if (oRegister.STATUS !== Status.Approved && oRegister.STATUS !== Status.Rejected) {
        addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_ERROR);
    }
    if(oRegister.STATUS === Status.Rejected && !oRegister.REASON){
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_APPLY_REASON_ERROR, undefined, "Root", "REASON");
    } 
}

function authCheckAdminOr(sAuthView, sAuthFailMsg) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var fnCampInstanceCheck = auth.instanceAccessCheck(sAuthView, "REGISTER_ID", sAuthFailMsg);
        var fnPrivilegeCheck = auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", sAuthFailMsg);
        var fnMessageIgnoreFunction = function() {
        };

        var bSuccess = fnPrivilegeCheck(vKey, oRequest, fnMessageIgnoreFunction, oContext);
        if (!bSuccess) {
            bSuccess = fnCampInstanceCheck(vKey, oRequest, fnMessage, oContext);
        }
        return bSuccess;
    };
}