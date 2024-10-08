const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const ideaFilterPhase = $.import("sap.ino.xs.xslib", "ideaFilterPhase");
const ideaFilterResp = $.import("sap.ino.xs.xslib", "ideaFilterRespValues");
const SqlInjectionSafe = $.import("sap.ino.xs.xslib", "sqlInjectionSafe"); 
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

TraceWrapper.wrap_request_handler(function(){
    var iCampaignId =  $.request.parameters.get("CAMPAIGN_ID");
    var sStatus = $.request.parameters.get("STATUS");
    var bIsManaged = $.request.parameters.get("IS_MANAGED");
    var bIncludeDraft = $.request.parameters.get("INCLUDE_DRAFT");
    var oResponse = {
        status: $.net.http.OK,
        body: {}
    };
    if(iCampaignId && iCampaignId !== null){
        iCampaignId = iCampaignId.replace(/\'/g,"''");
    }
    var oPhaseResult = ideaFilterPhase.getPhases(iCampaignId);
    var oRespResult = ideaFilterResp.getRespValues(iCampaignId);
    
    oResponse.body.Phases = oPhaseResult.body.Phases;
    oResponse.body.RespValues = oRespResult.body.RespValues;
    oResponse.body.Substatus = getIdeaSubstatus(iCampaignId, sStatus, bIsManaged, bIncludeDraft);
    
    $.response.status = oResponse.status;
    $.response.contentType = "application/json";
    $.response.setBody(oResponse.body ? JSON.stringify(oResponse.body) : "");
});

function getIdeaSubstatus(iCampaignId, sStatus, bIsManaged, bIncludeDraft) {
    var sCampaignId = iCampaignId ? iCampaignId : 0;
    var sSelect = 'select status, text, status_type, base_package from "sap.ino.db.idea.ext::V_EXT_IDEA_FILTER_STATUS"' +
                '(\'placeholder\'=(\'$$campaignId$$\',\'' + sCampaignId + '\'))';
    if (sStatus === 'COMPLETED') {
        sSelect += " where status_type = 'COMPLETED' or (status_type = '' and status = 'sap.ino.config.COMPLETED')";
    } else if (sStatus === 'DISCONTINUED') {
         sSelect += " where status_type = 'DISCONTINUED' or (status_type = '' and status = 'sap.ino.config.DISCONTINUED') or (status_type = '' and status = 'sap.ino.config.MERGED')";
    } else if (sStatus === 'ACTIVE') {
        sSelect += " where status_type <> 'COMPLETED' and status_type <> 'DISCONTINUED' and BASE_PACKAGE <> 'sap.ino.config' or";
        sSelect += " status_type = '' and status <> 'sap.ino.config.COMPLETED' and status <> 'sap.ino.config.DISCONTINUED' and status <> 'sap.ino.config.MERGED'";
        if (!bIsManaged && !bIncludeDraft) {
            sSelect += " and status <> 'sap.ino.config.DRAFT'";
        }
    } else if (sStatus === 'NEW') {
        sSelect += " where status_type = 'NEW' or (status_type = '' and status = 'sap.ino.config.NEW_IN_PHASE')";
    }
    return oHQ.statement(sSelect).execute(); 
}