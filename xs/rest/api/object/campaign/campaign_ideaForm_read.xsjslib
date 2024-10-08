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

function campaign_ideaForm_read(user, return_inf) {
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
	var ideaFormValue;
	try {
		Campaign.read(user.Parameters.CAMPAIGN_ID);

		var ideaFormPackageName = oHQ.statement(
			'select  FORM_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaign_id);
		if (ideaFormPackageName.length === 0) {
			errorMessages = "This campaign has no responsibility list";
			util.handlError(return_inf, user, errorMessages);
			return false;
		} else {
			ideaFormValue = oHQ.statement(
				'select  CODE,DEFAULT_TEXT,DATATYPE_CODE,MANDATORY,VALUE_OPTION_LIST_CODE from "sap.ino.db.ideaform::t_field_stage" where form_code  = ? '
			)
				.execute(ideaFormPackageName[0].FORM_CODE);
			if (ideaFormValue.length === 0) {
				errorMessages = "The Idea Form you inquire is empty";
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

	return_inf = util.get_inf(user, return_inf, user.Parameters.CAMPAIGN_ID, ideaFormValue); //get successful information
	util.send_mes(return_inf);
	oConn.commit();
	return;
}