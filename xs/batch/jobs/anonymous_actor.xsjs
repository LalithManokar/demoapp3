const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const anonymousActor = $.import("sap.ino.xs.xslib", "anonymousActor");

//const anonymousActor = $.import("sap.ino.xs.xslib", "anonymousActorTestUsage");

var AOF = $.import("sap.ino.xs.aof.core", "framework");

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

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	try {
		const oHQ = hQuery.hQuery(oConn);
		const bUnderMaintenance = systemSettings.isUnderMaintenance();
		if (bUnderMaintenance) {
			//do not run batch jobs if setup is incomplete
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		
		//Check the dummy user whether it is existed
		var sUSER_NAME = "DUMMY_USER_FOR_ALUMNUS";
		var sQueryUser = 'select id from "sap.ino.db.iam::t_identity" where user_name = ? and erased = 0';
		var aUser = oHQ.statement(sQueryUser).execute(sUSER_NAME);
		var sUserId;
		if(aUser.length > 0){
		    sUserId = aUser[0].ID;
		} else {//Create New User
		if (!setSystemAdminApplicationUser(oHQ)) {
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_CREATE_DUMMY_USER_NOT_FOUND_ADMIN_USER",
				undefined, undefined, undefined, undefined);		    
				return;
			}
			var aofUser =  AOF.getApplicationObject("sap.ino.xs.object.iam.User");
		    var oResponse = aofUser.create({
		                    ID:-1,
		                    TYPE_CODE:"USER",
		                    SOURCE_TYPE_CODE:"UPLOAD",
		                    USER_NAME:"DUMMY_USER_FOR_ALUMNUS",
		                    STAGED:1,
		                    IS_EXTERNAL: 0,
		                    FIRST_NAME:"Alumnus",
		                    LAST_NAME:" ",
		                    NAME: "Alumnus"
		    });
		    
		    var aErrorCreateMessage = oResponse.messages.filter(function(oMessage){
		        return oMessage.severity === 2;
		    });
		    
		    if(aErrorCreateMessage.length > 0){
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_CREATE_DUMMY_USER_FAILED",
				undefined, undefined, undefined, aErrorCreateMessage[0].messageText);		    
		        return;
		    }
		     sUserId = oResponse.generatedKeys[-1];
		     resetSystemAdminApplicationUser($.session);
		}
		///Get user OK, then go to modify the corresponding objects.
		
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
		
		if(!(iEnableRentention * 1) || !iRententionPeriodValue){
		    return;
		}
// 		sRetentionPeriodUnit = "DAY";
// 		iRententionPeriodValue = 0;
		anonymousActor.updateCorrespondingObjects(oHQ,sRetentionPeriodUnit,iRententionPeriodValue,sUserId);
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	} finally {
		oConn.close();
	}
}