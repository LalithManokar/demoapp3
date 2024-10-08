var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function campaign_read(user, return_inf) {
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

	if (util.check_type(user.Parameters.Campaign_ID, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}
	var oResponse;
	try {
		oResponse = Campaign.read(user.Parameters.Campaign_ID);
	} catch (e) {
		errorMessages = "Please check whether the user you input has privilege to read this campaign ";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	if (oResponse === null) {
		errorMessages = "The campaign id you indicated is not existed ";
		$.response.status = 400;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	return_inf = util.get_inf(user, return_inf, user.Parameters.Campaign_ID, oResponse); //get successful information
	util.send_mes(return_inf);
	oConn.commit();

	return;

}