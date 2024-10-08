$.import("sap.ino.xs.xslib", "hQuery");
var PARSER = $.import("sap.ino.xs.xslib", "csvParser");
//Database Connection
var conn = $.db.getConnection();
var Message = $.import("sap.ino.xs.aof.lib", "message");
// hQuery and sequence
var hq = $.sap.ino.xs.xslib.hQuery.hQuery(conn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var mAction = {
    CREATE: "CREATE",
    UPDATE:"UPDATE",
    DELETE:"DELETE",
    QUERY:"QUERY"
};

function processData(oHQ, oReq, oMessage) {
	var oBody, aHeaders;
	if (oReq.body) {
		oBody = JSON.parse(oReq.body.asString());
	} else {
		oMessage.type = "E";
		oMessage.message = "Request doesn't contain any body!";
		return undefined;
	}
	var sAction = oBody.ACTION;
	var sContent = oBody.CONTENT;
	
	if(sAction === mAction.QUERY){
       getCustomReportsData(oHQ,oMessage);
	} else if(sAction === mAction.CREATE){
	    //getCustomReportsData(oHQ);
	     createCustomReportsData(oHQ,oMessage,sContent);
	} else if(sAction === mAction.UPDATE){
	     updateCustomReportsData(oHQ,oMessage,sContent);
	} else if (sAction === mAction.DELETE ){
	    //getCustomReportsData(oHQ); 
	     deleteCustomReportsData(oHQ,oMessage);
	}
}
function createCustomReportsData(oHQ,oMessage,sContent){
    var oSession = $.session;
	var sUserName = oSession.getUsername();
	var sQueryIdentityID = 'select top 1 ID from "sap.ino.db.iam::v_identity" where user_name = ?';
	var aIdentityID = oHQ.statement(sQueryIdentityID).execute(sUserName);
	if (aIdentityID.length === 0) {
        oMessage.message = Message.getMessageText({messageKey:"MSG_CUSTOM_REPORTS_IDENTITY_ID_NOT_EXISTED"}, oHQ);	    
		oMessage.type = "E";
		return;
	}  
	var sUserID = aIdentityID[0].ID;
    var bInnoMgr = !!oSession.hasSystemPrivilege("sap.ino.xs.rest.admin.application::execute");
    if(bInnoMgr){
    var sCreateRecord = 'INSERT INTO "sap.ino.db.analytics::t_custom_reports_config" values("sap.ino.db.analytics::s_custom_reports_config".nextval,?,current_utctimestamp,?,current_utctimestamp,?)';
		oHQ.statement(sCreateRecord).execute(sContent,sUserID,sUserID);   
		oMessage.type = "S";
    } else {
        oMessage.message = Message.getMessageText({messageKey:"MSG_CUSTOM_REPORTS_USER_NOT_INNO_MANAGER"}, oHQ);	    
		oMessage.type = "E";
		return;        
    }
    
}
function updateCustomReportsData(oHQ,oMessage,sContent){
    var oSession = $.session;
	var sUserName = oSession.getUsername();
	var sQueryIdentityID = 'select top 1 ID from "sap.ino.db.iam::v_identity" where user_name = ?';
	var aIdentityID = oHQ.statement(sQueryIdentityID).execute(sUserName);
	if (aIdentityID.length === 0) {
        oMessage.message = Message.getMessageText({messageKey:"MSG_CUSTOM_REPORTS_IDENTITY_ID_NOT_EXISTED"}, oHQ);	    
		oMessage.type = "E";
		return;
	}  
	var sUserID = aIdentityID[0].ID;
	
    var bInnoMgr = !!oSession.hasSystemPrivilege("sap.ino.xs.rest.admin.application::execute");
    if(bInnoMgr){
    var sUpdateRecord = 'UPDATE "sap.ino.db.analytics::t_custom_reports_config" SET CONTENT = ?, CHANGED_AT = current_utctimestamp , CHANGED_BY_ID = ?';
		oHQ.statement(sUpdateRecord).execute(sContent,sUserID);   
		oMessage.type = "S";
    } else {
        oMessage.message = Message.getMessageText({messageKey:"MSG_CUSTOM_REPORTS_USER_NOT_INNO_MANAGER"}, oHQ);	    
		oMessage.type = "E";
		return;        
    }
    
}
function deleteCustomReportsData(oHQ,oMessage,sContent){
    var oSession = $.session;
	
    var bInnoMgr = !!oSession.hasSystemPrivilege("sap.ino.xs.rest.admin.application::execute");
    if(bInnoMgr){
    var sDeleteRecord = 'DELETE FROM "sap.ino.db.analytics::t_custom_reports_config"';
		oHQ.statement(sDeleteRecord).execute();   
		oMessage.type = "S";
    } else {
        oMessage.message = Message.getMessageText({messageKey:"MSG_CUSTOM_REPORTS_USER_NOT_INNO_MANAGER"}, oHQ);	    
		oMessage.type = "E";
		return;        
    }
    
}
function getCustomReportsData(oHQ,oMessage){
   		var sContentSelect = 'select content from "sap.ino.db.analytics::t_custom_reports_config"';
       	var aContent = oHQ.statement(sContentSelect).execute();
       	var sContent;
       	var hasContent = false;
       	if(aContent.length > 0){
           sContent = aContent[0].CONTENT;
           hasContent = true;
       	} else {
       	   sContent = '';
       	   hasContent = false;
       	}
       	oMessage.data = {content: sContent, hasContent:hasContent};
       	oMessage.type = 'S';
}