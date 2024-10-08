var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);


this.definition = {
    type : ObjectType.Configuration,
    actions : {
        create : {
            authorizationCheck : false
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
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.status::t_status",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_status"
        }
    }
};

var Status = this.Status = {
    Draft : "sap.ino.config.DRAFT",
    Discontinued : "sap.ino.config.DISCONTINUED",
    Completed : "sap.ino.config.COMPLETED",
    Merged : "sap.ino.config.MERGED",
    New : "sap.ino.config.NEW_IN_PHASE"
};

var CustomStatus = this.CustomStatus = {
    New : "NEW",
    Completed : "COMPLETED",
    Discontinued : "DISCONTINUED",
    InProcess : "IN_PROCESS"
};

var StatusType = {
    "sap.ino.config.DISCONTINUED": "DISCONTINUED",
    "sap.ino.config.COMPLETED": "COMPLETED",
    "sap.ino.config.IN_PROCESS": "IN_PROCESS"
};

this.getInitialStatus = function(iCampaignId, sPhaseCode) {
    var aCode = oHQ.statement('select distinct status.CODE from "sap.ino.db.campaign::t_campaign_phase" as campaign_phase \
                    inner join "sap.ino.db.status::t_status_model_transition" as status_transition \
                    on campaign_phase.STATUS_MODEL_CODE = status_transition.STATUS_MODEL_CODE and campaign_phase.CAMPAIGN_ID = ? and campaign_phase.PHASE_CODE = ? \
                    inner join "sap.ino.db.status::t_status" as status \
                    on status_transition.CURRENT_STATUS_CODE = status.CODE and (status.status_type = ? or status.code = ?)').execute(iCampaignId, sPhaseCode, CustomStatus.New, Status.New);
    return aCode.length > 0 ? aCode[0].CODE : "";
};

this.getInitialStatusByModel = function(sStatusModelCode) {
    var aCode = oHQ.statement('select distinct status.CODE from "sap.ino.db.status::t_status_model_transition" as transition \
                    inner join "sap.ino.db.status::t_status" as status \
                    on transition.STATUS_MODEL_CODE = ? and transition.CURRENT_STATUS_CODE = status.CODE \
                    and (status.STATUS_TYPE = ? or status.CODE = ?)').execute(sStatusModelCode, CustomStatus.New, Status.New);
    return aCode.length > 0 ? aCode[0].CODE : "";
};

this.isInitialStatus = function(sStatusCode) {
    var oCustomerType = oHQ.statement('select STATUS_TYPE from "sap.ino.db.status::t_status" where CODE = ?').execute(sStatusCode);
    if (oCustomerType.length > 0 && oCustomerType[0].STATUS_TYPE === CustomStatus.New) {
        return true;
    } else {
        return sStatusCode === Status.New;
    }
};

this.isFinalIdeaStatus = function(sStatusCode) {
    var oCustomerType = oHQ.statement('select STATUS_TYPE from "sap.ino.db.status::t_status" where CODE = ?').execute(sStatusCode);
    if (oCustomerType.length > 0 &&
        (oCustomerType[0].STATUS_TYPE === CustomStatus.Completed || oCustomerType[0].STATUS_TYPE === CustomStatus.Discontinued)) {
        return true;
    } else {
        return sStatusCode === Status.Discontinued || sStatusCode === Status.Completed || sStatusCode === Status.Merged;
    }
};

this.isDiscontinueStatus = function(sStatusCode) {
    var oCustomerType = oHQ.statement('select STATUS_TYPE from "sap.ino.db.status::t_status" where CODE = ?').execute(sStatusCode);
    if (oCustomerType.length > 0 && oCustomerType[0].STATUS_TYPE === CustomStatus.Discontinued) {
        return true;
    } else {
        return sStatusCode === Status.Discontinued;
    }
};

this.getStatusType = function(sStatusCode) {
    var oCustomerType = oHQ.statement('select STATUS_TYPE from "sap.ino.db.status::t_status" where CODE = ?').execute(sStatusCode);
    if (oCustomerType.length > 0 && oCustomerType[0].STATUS_TYPE !== null) {
        return oCustomerType[0].STATUS_TYPE;
    } else {
        return StatusType[sStatusCode] ? StatusType[sStatusCode] : '';
    }
};

this.isMergedStatus = function(sStatusCode) {
    var oCustomerType = oHQ.statement('select STATUS_TYPE from "sap.ino.db.status::t_status" where CODE = ?').execute(sStatusCode);
    if (oCustomerType.length > 0 && oCustomerType[0].STATUS_TYPE === CustomStatus.Merged) {
        return true;
    } else {
        return sStatusCode === Status.Merged;
    }
};

this.getStatusTransitions = function(oHQ, sStatusModelCode, sCurrentStatusCode, sStatusActionCode) {
    return oHQ.statement('select * from "sap.ino.db.status::t_status_model_transition" \
                                   where status_model_code = ? and current_status_code = ? and status_action_code = ?').execute(sStatusModelCode, sCurrentStatusCode, sStatusActionCode);

};

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext){
    
    // checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oContext.getHQ());
}