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

function attachment_create(user, return_inf) {
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
	var oAttachment, attachment_response, attachment_set = [];

	try {

		var attachmentID;
		oAttachment = user.Parameters.Attachments;
		for (var i = 0; i < oAttachment.length; i++) {
			 oAttachment[i].ID = -1;
                attachment_response = Attachment.create(oAttachment[i]);
                attachmentID = attachment_response.generatedKeys[-1];
			attachment_set.push({
				ATTACHMENT_ID: attachmentID
			});

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

	if (attachment_response.messages.length !== 0) {
		util.check_rep(attachment_response, return_inf, user);
		return;
	}
	return_inf = util.get_inf(user, return_inf, attachment_set);
	util.send_mes(return_inf);
	oConn.commit();

	return;
}