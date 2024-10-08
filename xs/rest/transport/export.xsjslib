$.import("sap.ino.xs.xslib", "hQuery");
var PARSER = $.import("sap.ino.xs.xslib", "csvParser");
var tableMapping = $.import("sap.ino.xs.rest.transport", "transportTableMapping");
//Database Connection
var conn = $.db.getConnection();
// hQuery and sequence
var hq = $.sap.ino.xs.xslib.hQuery.hQuery(conn);
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function exportData(oHQ, oReq, oMessage) {
	var oBody, aHeaders;
	if (oReq.body) {
		oBody = JSON.parse(oReq.body.asString());
	} else {
		oMessage.type = "E";
		oMessage.message = "Request doesn't contain any body!";
		return undefined;
	}
	var aExportScenarios = oBody.EXPORT_SCENARIO;
	if(!aExportScenarios){
		oMessage.type = "E";
		oMessage.message = "Body doesn't contain correct parameters!";
		return undefined;	    
	}
	if(aExportScenarios && aExportScenarios.length === 0){
		oMessage.type = "E";
		oMessage.message = "Scenarios is empty";
		return undefined;	    	    
	}
	
	return exportCorrespondingData(oHQ, aExportScenarios,oMessage);

}
	function prepareTableData(oHQ,oZip,tableName) {
	    var attr;
	    var aCSV = [];
		var sTableContentSelect = 'select * from "' + tableMapping.oTableMapping[tableName] + '"';

		var aTableContent = oHQ.statement(sTableContentSelect).execute();
		if (aTableContent.length > 0) {
				for (attr in aTableContent[0]) {
					aCSV.push(attr);
					aCSV.push(",");
				}		    
		        aCSV.push("\r");
		    
			for (var i = 0; i < aTableContent.length; i++) {
				for (attr in aTableContent[i]) {
				    let oValue = aTableContent[i][attr];
				// 	oValue = typeof(oValue) === "string" ? oValue.replace(/=/, " =") : oValue;
				// 	oValue = typeof(oValue) === "string" ? oValue.replace(/"/g, '""') : oValue;
					oValue = typeof(oValue) === "string" ? htmlEntityDecode.decode(oValue) : oValue;
 	                //Replase the special character to back(<comma> -> ','  <breakline> - > '\n') 					
					oValue = typeof(oValue) === "string" ? oValue.replace(/,/g, "<comma>") : oValue;
					oValue = typeof(oValue) === "string" ? oValue.replace(/\n/g, "<breakline>") : oValue;
					aCSV.push(oValue);
					aCSV.push(",");
				}
				if(i !== aTableContent.length - 1){
				aCSV.push("\r");
				}
			}
         var sFileName = tableName + ".csv";
		oZip[sFileName] = aCSV.join("");
		}
	}
	
	function exportCorrespondingData(oHQ, aScenarios,oMessage) {
		var oZip = new $.util.Zip();
		//Export Old system's package info
		 prepareTableData(oHQ,oZip,"T_PACKAGE_INFO");  
		
		for(var i = 0; i < aScenarios.length; i++ ){
		switch (aScenarios[i]) {
			case "unit":
                prepareTableData(oHQ,oZip,"T_UNIT");
                prepareTableData(oHQ,oZip,"T_UNIT_STAGE");
				break;
			case "value_list":
                prepareTableData(oHQ,oZip,"T_VALUE_OPTION");
                prepareTableData(oHQ,oZip,"T_VALUE_OPTION_STAGE");	
                prepareTableData(oHQ,oZip,"T_VALUE_OPTION_LIST");
                prepareTableData(oHQ,oZip,"T_VALUE_OPTION_LIST_STAGE");	                
			    break;
			case "vote_method":
                prepareTableData(oHQ,oZip,"T_VOTE_TYPE");
                prepareTableData(oHQ,oZip,"T_VOTE_TYPE_STAGE");    
                break;
			case "campaign_task":
                prepareTableData(oHQ,oZip,"T_MILESTONE_TASK");
                prepareTableData(oHQ,oZip,"T_MILESTONE_TASK_STAGE");    
                break; 
			case "url_whitelist":
                prepareTableData(oHQ,oZip,"T_URL_WHITELIST_UI");
                prepareTableData(oHQ,oZip,"T_URL_WHITELIST_UI_STAGE");    
                break;   
			case "idea_merge_rule":
                prepareTableData(oHQ,oZip,"T_MERGE_IDEA_CONFIG");
                break; 
			case "evaluation_method":
                prepareTableData(oHQ,oZip,"T_MODEL");
                prepareTableData(oHQ,oZip,"T_MODEL_STAGE");
                prepareTableData(oHQ,oZip,"T_CRITERION");
                prepareTableData(oHQ,oZip,"T_CRITERION_STAGE");
                break;
            case "custom_idea_form":
                prepareTableData(oHQ,oZip,"T_FORM");
                prepareTableData(oHQ,oZip,"T_FORM_STAGE");
                prepareTableData(oHQ,oZip,"T_FIELD");
                prepareTableData(oHQ,oZip,"T_FIELD_STAGE");                                 
                break;
            case "resp_list":
                prepareTableData(oHQ,oZip,"T_RESPONSIBILITY_STAGE");
                //Default Coach ID
                prepareTableData(oHQ,oZip,"T_RESPONSIBILITY_VALUE_STAGE");                
                break;
            case "phase":
                prepareTableData(oHQ,oZip,"T_PHASE");  
                prepareTableData(oHQ,oZip,"T_PHASE_STAGE"); 
                break;                
            case "email_template":
                prepareTableData(oHQ,oZip,"T_MAIL_TEMPLATE");  
                prepareTableData(oHQ,oZip,"T_MAIL_TEMPLATE_STAGE");
                prepareTableData(oHQ,oZip,"T_MAIL_TEMPLATE_T");  
                prepareTableData(oHQ,oZip,"T_MAIL_TEMPLATE_T_STAGE");                
                break; 
            case "text_module":
                prepareTableData(oHQ,oZip,"T_TEXT_MODULE");  
                prepareTableData(oHQ,oZip,"T_TEXT_MODULE_STAGE"); 
                prepareTableData(oHQ,oZip,"T_TEXT_MODULE_T");  
                prepareTableData(oHQ,oZip,"T_TEXT_MODULE_T_STAGE");                 
                break; 
            case "notification":
                prepareTableData(oHQ,oZip,"T_NOTIFICATION_SYSTEM_SETTING");  
                prepareTableData(oHQ,oZip,"T_NOTIFICATION_SYSTEM_SETTING_LOCAL"); 
                prepareTableData(oHQ,oZip,"T_NOTIFICATION_SYSTEM_SETTING_RECEIVER");  
                prepareTableData(oHQ,oZip,"T_NOTIFICATION_SYSTEM_SETTING_RECEIVER_LOCAL"); 
                prepareTableData(oHQ,oZip,"T_NOTIFICATION_RECEIVER_ROLE_MAPPING");                
                break;    
            case "status":
                prepareTableData(oHQ,oZip,"T_STATUS");  
                prepareTableData(oHQ,oZip,"T_STATUS_STAGE"); 
                prepareTableData(oHQ,oZip,"T_STATUS_AUTHORIZATION");  
                prepareTableData(oHQ,oZip,"T_STATUS_AUTHORIZATION_STAGE");                 
                break; 
            case "status_action":
                prepareTableData(oHQ,oZip,"T_STATUS_ACTION");  
                prepareTableData(oHQ,oZip,"T_STATUS_ACTION_STAGE"); 
                prepareTableData(oHQ,oZip,"T_STATUS_OBJECT_ACTION_ROLE_CODE");  
                break;
            case "status_model":
                //Decision List
                prepareTableData(oHQ,oZip,"T_STATUS_MODEL");  
                prepareTableData(oHQ,oZip,"T_STATUS_MODEL_STAGE"); 
                prepareTableData(oHQ,oZip,"T_STATUS_MODEL_TRANSITION");  
                prepareTableData(oHQ,oZip,"T_STATUS_MODEL_TRANSITION_STAGE");                  
                break;           
            case "gamification":
                //Badge Image
                prepareTableData(oHQ,oZip,"T_BADGE");  
                prepareTableData(oHQ,oZip,"T_DIMENSION"); 
                prepareTableData(oHQ,oZip,"T_ACTIVITY");                 
                prepareTableData(oHQ,oZip,"T_GAMIFICATION_SETTING");  
                break; 
            case "integration":
                prepareTableData(oHQ,oZip,"T_SYSTEM_INTEGRATION");  
                prepareTableData(oHQ,oZip,"T_INTEGRATION_FIELD_MAPPING"); 
                break;    
            case "test":
                prepareTableData(oHQ,oZip,"T_TEST");  
                break;  
            default:
            	 oMessage.type = "E";
		         oMessage.message = 'Scenario ( ' + aScenarios[i] + ' ) is not support!';
		         return undefined;	 
		   }
		}
	
		return oZip.asArrayBuffer();
	}
