const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const anonymousActor = $.import("sap.ino.xs.xslib", "anonymousActor");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
const message = $.import("sap.ino.xs.aof.lib", "message");
var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};
var timeType = {
    day:"DAY",
    month:"MONTH",
    year:"YEAR"
};

function setSystemAdminApplicationUser(oHQ) {
	const auth = $.import("sap.ino.xs.aof.core", "authorization");
	// the admin is the first user which created himself during the bootstrap
	const aAdmin = oHQ.statement(
		'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = created_by_id order by erased asc, created_at asc').execute();
	var oAdmin = aAdmin && aAdmin.length !== 0 ? aAdmin[0] : undefined;
	if (!oAdmin) {
		return false;
	}
	auth.setApplicationUser(oAdmin.USER_NAME);
	return true;
}

function resetSystemAdminApplicationUser(oSession) {
	const auth = $.import("sap.ino.xs.aof.core", "authorization");
	auth.setApplicationUser(oSession.getUsername());
}

var _handleRequest = function(req, res) {
	var oHQ = hQuery.hQuery(conn);
	var oMessage = {
		type: null,
		message: null
	};
	var aMessages = [];
	var oConnection = oHQ.getConnection();
	try {
		//Check the dummy user whether it is existed
// 		var sUSER_NAME = "DUMMY_USER_FOR_ALUMNUS";
// 		var sQueryUser = 'select id from "sap.ino.db.iam::t_identity" where user_name = ? and erased = 0';
// 		var aUser = oHQ.statement(sQueryUser).execute(sUSER_NAME);
// 		var sUserId;
// 		if(aUser.length > 0){
// 		    sUserId = aUser[0].ID;
// 		} else {//Create New User
// 		if (!setSystemAdminApplicationUser(oHQ)) {
// 			message.createMessage(
// 				message.MessageSeverity.Error,
// 				"MSG_BATCH_CREATE_DUMMY_USER_NOT_FOUND_ADMIN_USER",
// 				undefined, undefined, undefined, undefined);		    
// 				return;
// 			}
// 			var aofUser =  AOF.getApplicationObject("sap.ino.xs.object.iam.User");
// 		    var oResponse = aofUser.create({
// 		                    ID:-1,
// 		                    TYPE_CODE:"USER",
// 		                    SOURCE_TYPE_CODE:"UPLOAD",
// 		                    USER_NAME:"DUMMY_USER_FOR_ALUMNUS",
// 		                    STAGED:1,
// 		                    IS_EXTERNAL: 0,
// 		                    FIRST_NAME:"Alumnus",
// 		                    LAST_NAME:" ",
// 		                    NAME: "Alumnus"
// 		    });
		    
// 		    var aErrorCreateMessage = oResponse.messages.filter(function(oMessage){
// 		        return oMessage.severity === 2;
// 		    });
		    
// 		    if(aErrorCreateMessage.length > 0){
// 			message.createMessage(
// 				message.MessageSeverity.Error,
// 				"MSG_BATCH_CREATE_DUMMY_USER_FAILED",
// 				undefined, undefined, undefined, aErrorCreateMessage[0].messageText);
// 				 aMessages.push({
// 						type: "S",
// 						message: aErrorCreateMessage[0].messageText
// 					});	
				
// 		        return;
// 		    }
// 		     sUserId = oResponse.generatedKeys[-1];
// 		     resetSystemAdminApplicationUser($.session);
// 		       					aMessages.push({
// 						type: "S",
// 						message: "Update succesffully"
// 					});	     
// 		}

		var sSystemRetentionSetting = 'select * from "sap.ino.db.basis.ext::v_ext_system_setting" where code = ? or code = ? or code = ?';
		
		var aSystemValues = oHQ.statement(sSystemRetentionSetting).execute("sap.ino.config.RETENTION_PERIOD_UNIT","sap.ino.config.RETENTION_PERIOD_VALUE","sap.ino.config.ENABLE_RETENTION_PERIOD");
		var iRententionPeriodValue, sRetentionPeriodUnit,iEnableRentention;
		for(var i = 0; i < aSystemValues.length; i++ ){
		    if(aSystemValues[i].CODE === 'sap.ino.config.RETENTION_PERIOD_UNIT'){
		        sRetentionPeriodUnit = aSystemValues[i].VALUE;
		    } 
		    if(aSystemValues[i].CODE === 'sap.ino.config.RETENTION_PERIOD_VALUE'){
		        iRententionPeriodValue = aSystemValues[i].VALUE;
		    }
		    if(aSystemValues[i].CODE === 'sap.ino.config.ENABLE_RETENTION_PERIOD'){
		        iEnableRentention = aSystemValues[i].VALUE;
		    }
		}
		

var sTimeSQL;
var retentionUnit = 'DAY';
var retentionValue = 0;
// switch(sRetentionPeriodUnit){
// case timeType.day:
//     sTimeSQL = "DAYS_BETWEEN";
//     break;
// case timeType.month:
//     sTimeSQL = "MONTHS_BETWEEN";    
//     break;
// case timeType.year:
//     sTimeSQL = "YEARS_BETWEEN";
//     break;
// }   
// 				 aMessages.push({
// 						type: "S",
// 						message: sTimeSQL + " | " + sRetentionPeriodUnit + " | " + iRententionPeriodValue + " | " + iEnableRentention
// 					});	
// 		if(!(iEnableRentention * 1) || !iRententionPeriodValue){
// 				 aMessages.push({
// 						type: "S",
// 						message: "Error"
// 					});			    
// 		    return;
// 		}
		
		
		
    // var sIdeaCreateSql = 'update "sap.ino.db.idea::t_idea" set created_by_id = ? where ' + sTimeSQL + '(CREATED_AT,CURRENT_UTCTIMESTAMP) >= ? and id = ?';
    
    // var sIdeaUpdateIdentityRole = 'update "sap.ino.db.iam::t_object_identity_role" set identity_id = ? where object_type_code = \'IDEA\' AND ROLE_CODE = \'IDEA_SUBMITTER\'' + ' AND OBJECT_ID IN' +
    //  ' (select id from "sap.ino.db.idea::t_idea" where ' + sTimeSQL + '(CREATED_AT,CURRENT_UTCTIMESTAMP) >= '+ retentionValue + ' and id = ?)';
    // //447266
    // 		oHQ.statement(sIdeaCreateSql).execute(925653,retentionValue,346071);  
    // 		oHQ.statement(sIdeaUpdateIdentityRole).execute(925653,346071);  
    		
  		// 			aMessages.push({
				// 		type: "S",
				// 		message: "Update succesffully"
				// 	});	                
		anonymousActor.updateCorrespondingObjects(oHQ,retentionUnit,retentionValue,927905);
	} catch (e) {
		oMessage.type = "E";
		oMessage.message = e.message;
		aMessages.push(oMessage);
	} finally {
		oConnection.commit();
		oConnection.close();
	}

	// 	if (oMessage.type === 'E') {
	// 		res.status = $.net.http.ACCEPTED;
	// 		res.contentType = ContentType.JSON;
	// 		res.setBody(JSON.stringify(oMessage));
	// 	} else {
	res.status = $.net.http.OK;
	res.contentType = ContentType.JSON;
	res.setBody(JSON.stringify(aMessages));
	// 	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});