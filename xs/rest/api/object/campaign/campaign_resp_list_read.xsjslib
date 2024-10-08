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

function campaign_resp_list_read(user, return_inf) {
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
	var campaign_id = user.Parameters.CAMPAIGN_ID;
	if (util.check_type(user.Parameters.CAMPAIGN_ID, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}
	var respListValue;
	try {
		Campaign.read(user.Parameters.CAMPAIGN_ID);

		var respListPackageName = oHQ.statement(
			'select  RESP_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaign_id);
		if (respListPackageName.length === 0) {
			errorMessages = "This campaign has no responsibility list";
			util.handlError(return_inf, user, errorMessages);
			return false;
		} else {
			respListValue = oHQ.statement(
				'select  CODE,DEFAULT_TEXT from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where RESP_CODE  = ? ')
				.execute(respListPackageName[0].RESP_CODE);
			if (respListValue.length === 0) {
				errorMessages = "The responsibility list value code you input not belong to this camapign's responsibility list";
				util.handlError(return_inf, user, errorMessages);
				return false;
			}
		}

	} catch (e) {
	 errorMessages = "Please check whether the user you input has privilege and your input";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}

	return_inf = util.get_inf(user, return_inf, user.Parameters.CAMPAIGN_ID, respListValue); //get successful information
	util.send_mes(return_inf);
	oConn.commit();
	return;
}