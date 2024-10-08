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

function idea_delete(user, return_inf) {
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
		oResponse = Idea.del(idea_id);
	} catch (eMissPrivilege) {
		errorMessages = "Please check whether the user you input has privilege ";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;

	}
	if (oResponse.messages.length !== 0) {
		util.check_rep(oResponse, return_inf, user);
		return;
	}

	return_inf = util.get_inf(user, return_inf, idea_id); //get successful information
	util.send_mes(return_inf);
	oConn.commit();

	return;

}