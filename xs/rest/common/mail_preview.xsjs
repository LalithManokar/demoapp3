const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const oMail = $.import("sap.ino.xs.xslib.sysNotifications","notificationEmail");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

TraceWrapper.wrap_request_handler(function() {
    var iDecisionId =  $.request.parameters.get("DECISION");
    var sContent, iIdeaId, iCampaignId, iDecider,iActorId, sAction, sLang, sPhase, sStatus,sReasoncode, sReason,sLabel, sURL;
    var sTemplateCode, sTextCode , sRoleCode, sActionCode;
    var bEnableNewNotification = CommonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_NEW_NOTIFICATION");
    if(iDecisionId) {
        if(iDecisionId === undefined || iDecisionId === null) {
            $.response.contentType = "text/plain";
            $.response.setBody("");
            $.response.status = $.net.http.BAD_REQUEST;
            return;
        }
        
        var aDecision = oHQ.statement(
            'select decision.decider_id, decision.status_action_code, decision.text_module_code, ' +
            'decision.reason_code, decision.reason, decision.status_code, decision.phase_code, decision.link_label, decision.link_url, decision.response, ' +
            'idea.id as idea_id from "SAP_INO_EXT"."sap.ino.db.idea.ext::v_ext_idea_decision" as decision ' +
                'inner join "SAP_INO"."sap.ino.db.idea::t_idea" as idea ' +
                'on decision.idea_id = idea.id ' +
                'where send_response = 1 ' +
                'and decision.id = ?').execute(iDecisionId);
        
        if(aDecision.length === 0) {
            $.response.contentType = "text/plain";
            $.response.setBody("");
            $.response.status = $.net.http.OK;
            return;
        }
        
        var oDecision = aDecision[0];    
        
        var aLang = oHQ.statement(
            'select locale from "sap.ino.db.iam::v_logon_user"').execute();
        sLang = aLang[0].LOCALE;
        
        sContent = oDecision.RESPONSE ? oDecision.RESPONSE : ""; 
        iIdeaId = oDecision.IDEA_ID;
        sAction = oDecision.STATUS_ACTION_CODE;
        iDecider = oDecision.DECIDER_ID;
        iActorId = oDecision.DECIDER_ID;
        sTextCode = oDecision.TEXT_MODULE_CODE;
        sReasoncode = oDecision.REASON_CODE;
        sReason = oDecision.REASON;
        sLabel = oDecision.LINK_LABEL;
        sURL = oDecision.LINK_URL;
        sPhase =  oDecision.PHASE_CODE;
        sStatus = oDecision.STATUS_CODE;
        sRoleCode = oDecision.ROLE_CODE;
        sActionCode = oDecision.ACTION_CODE;
    } else {
        sContent = $.request.parameters.get("CONTENT");
        iIdeaId = $.request.parameters.get("IDEA");
        iCampaignId = $.request.parameters.get("CAMPAIGN");
        iDecider = $.request.parameters.get("DECIDER");
        iActorId = $.request.parameters.get("ACTOR");
        sAction = $.request.parameters.get("ACTION");
        sLang = $.request.parameters.get("LOCALE");
        sPhase =  $.request.parameters.get("PHASE");
        sStatus = $.request.parameters.get("STATUS");
        sReason = ($.request.parameters.get("REASON") === 'null'? "":$.request.parameters.get("REASON"));
        sTemplateCode = $.request.parameters.get("TEMPLATE_CODE");
        sTextCode = ($.request.parameters.get("TEXT_CODE") === 'null'? "":$.request.parameters.get("TEXT_CODE"));
        sReasoncode = ($.request.parameters.get("REASON_CODE") === 'null'? "":$.request.parameters.get("REASON_CODE"));
        sLabel = ($.request.parameters.get("LINK_LABEL") === 'null'? "":$.request.parameters.get("LINK_LABEL"));
        sURL =($.request.parameters.get("LINK_URL") === 'null'? "":$.request.parameters.get("LINK_URL"));
        sRoleCode =($.request.parameters.get("ROLE_CODE") === 'null'? "":$.request.parameters.get("ROLE_CODE"));
        sActionCode =($.request.parameters.get("ACTION_CODE") === 'null'? "":$.request.parameters.get("ACTION_CODE"));
    }

    if(sLang.indexOf("_") !== -1) {
        sLang = sLang.split("_")[0];
    }
    
    oMail.setHost(systemSettings.getIniValue('host', oHQ));

    $.response.contentType = "application/json";
    $.response.status = $.net.http.OK;
    
    var sMailText;
    if (iCampaignId  && (sTemplateCode || sTextCode)){
        sMailText = oMail.getTemplatePreview(sTemplateCode, sTextCode, iCampaignId, sLang,sRoleCode,sActionCode);
        $.response.setBody(
            JSON.stringify({
                TEXT : decode(sMailText)
            })    
        );
    }else if(!iCampaignId  && sTemplateCode && bEnableNewNotification){
        sMailText = oMail.getTemplatePreview(sTemplateCode, sTextCode, undefined, sLang,sRoleCode,sActionCode);
        $.response.setBody(
            JSON.stringify({
                TEXT : decode(sMailText)
            })    
        );
    }else if(sTextCode && sTextCode !== 'null'){
        sMailText = oMail.getMailwithTextcodePreview(iIdeaId, sAction, iDecider,iActorId, sLang, sContent, sPhase, sStatus,sTextCode,
        sReasoncode, sReason, sLabel, sURL);
            $.response.setBody(
                JSON.stringify({
                    TEXT : decode(sMailText)
                })    
            );
    } 
    else {
        if(iIdeaId === undefined || sAction === undefined) {
            $.response.contentType = "text/plain";
            $.response.setBody("");
            $.response.status = $.net.http.BAD_REQUEST;
        } else {
            sMailText = oMail.getMailPreview(iIdeaId, sAction, iDecider,iActorId, sLang, sContent, sPhase, sStatus,sReason);
            $.response.setBody(
                JSON.stringify({
                    TEXT : decode(sMailText)
                })    
            );
        }
    }
    
     function decode(sText){
         return (sText || "").replace(/{/g,"&#x7b;").replace(/}/g,"&#x7d;");
     }
});
