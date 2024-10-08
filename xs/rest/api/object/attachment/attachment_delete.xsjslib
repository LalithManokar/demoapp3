var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function attachment_delete(user, return_inf) {
var errorMessages;
	try {
		util.getSessionUser(user);//get user
	} catch (e) {
		  errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
	$.response.status = 403;
    util.handlError(return_inf, user, errorMessages, $.response);
					return false;
	} 
	var oAttachment, attachment_response;

	try {

	
		oAttachment = user.Parameters.Attachments;
		for (var i = 0; i < oAttachment.length; i++) {
		    	if(oAttachment[i].Owner_ID && !oAttachment[i].Attachment_ID){
			attachment_response = oHQ.statement(
			'delete from "sap.ino.db.attachment::t_attachment_assignment"where owner_id = ?' 
		).execute(oAttachment[i].Owner_ID);
		    }
		    	if(!oAttachment[i].Owner_ID && oAttachment[i].Attachment_ID){
			attachment_response = oHQ.statement(
			'delete from "sap.ino.db.attachment::t_attachment_assignment"where attachment_id = ?' 
		).execute(oAttachment[i].Attachment_ID);
		    }
		    	if(oAttachment[i].Owner_ID && oAttachment[i].Attachment_ID){
			attachment_response = oHQ.statement(
			'delete from "sap.ino.db.attachment::t_attachment_assignment"where owner_id = ? and attachment_id = ?' 
		).execute(oAttachment[i].Owner_ID,oAttachment[i].Attachment_ID);
		    }
        }
	} catch (e) {
		return_inf.RESULT = "E";
		return_inf.MESSAGES = [];
		var messages = {
			"STATUS": "Please check your Attachments Arributes "
		};
		return_inf.MESSAGES.push(messages);
		util.get_Wrong_inf(user, return_inf);
        return;
	}


		return_inf = {
			"RESULT": "S",
			"MESSAGES": [
				{
					"STATUS": "Deleted the attachments successfully"
                                }
                            ]

		};
$.response.contentType = "applition/json";
	$.response.setBody(JSON.stringify(return_inf, null, 4)); 
	oConn.commit();

	return $.response;
}