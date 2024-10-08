var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();


function getDisplayTextForForm(oResponse){
    //Fields join together
    //var aAllFields = oResponse.FieldsValue.Contact(oResponse.AdminFieldsValue);
    
    var sFieldSql = 'select IS_DISPLAY_ONLY, DISPLAY_TEXT from "sap.ino.db.ideaform::t_field" WHERE code = ?';            

	 function getDisplayText(aFields){
    	_.each(aFields,function(oField){
    	    var aCurrentCodeInfo = oHQ.statement(sFieldSql).execute(oField.FIELD_CODE);
    	    if(aCurrentCodeInfo.length > 0){
    	        oField.IS_DISPLAY_ONLY = aCurrentCodeInfo[0].IS_DISPLAY_ONLY;
    	        oField.IS_DISPLAY_TEXT = aCurrentCodeInfo[0].DISPLAY_TEXT;
    	    } else {
    	         oField.IS_DISPLAY_ONLY = null;
    	         oField.IS_DISPLAY_TEXT = "";
    	    }
    	});
    	return aFields;
	 }
     getDisplayText(oResponse.FieldsValue);
     getDisplayText(oResponse.AdminFieldsValue);    
    
    return oResponse;
    
}

function idea_read(user, return_inf) {
	var errorMessages;
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
		$.response.status = 403;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	var idea_id = user.Parameters.IDEA_ID;

	if (util.check_type(idea_id, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}
	var oResponse;
	try {
		oResponse = Idea.read(idea_id); //read the idea
		//Construct the Display text to the idea form or the admin Form
	    oResponse = getDisplayTextForForm(oResponse);
	} catch (eMissPrivilege) {
		errorMessages = "Please check whether the user you input has privilege read this idea";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;

	}
	if (oResponse === null) {
			errorMessages = "The idea id you indicated is not existed ";
		$.response.status = 400;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	return_inf = util.get_inf(user, return_inf, idea_id, oResponse);
	util.send_mes(return_inf);
	oConn.commit();

	return;

}
