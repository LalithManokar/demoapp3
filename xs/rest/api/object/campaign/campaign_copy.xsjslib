var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

var util = $.import("sap.ino.xs.rest.api", "util");

function campaign_copy(user, return_inf) {
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
	var Campaign_ID = user.Parameters.Campaign_ID;
	delete user.Parameters.Campaign_ID;
	//check Title Character limit
	var Maximum_title = 100;
	var Maximum_stitle = 40;
	var oName = user.Parameters.LanguageTexts[0] ? user.Parameters.LanguageTexts[0].NAME : "";
	var oShort_Name = user.Parameters.LanguageTexts[0] ? user.Parameters.LanguageTexts[0].SHORT_NAME : "";
	var Title_len = util.getLength(oName);
	var Stitle_len = util.getLength(oShort_Name);
	if (Title_len > Maximum_title) {
		return_inf.error = " Title has exceeded Character limit";
		$.response.status = 400;
		util.send_mes(return_inf);
		return;
	}
	if (Stitle_len > Maximum_stitle) {
		return_inf.error = " Short Title has exceeded Character limit";
		$.response.status = 400;
		util.send_mes(return_inf);
		return;
	}
	//check input campaign_id
	if (util.check_type(Campaign_ID, "number", return_inf)) {
		util.get_Wrong_inf(user, return_inf);
		return;
	}
	try{
	    checkDate(user.Parameters);
	}catch (e) {
		$.response.status = 401;
		util.handlError(return_inf, user, e.message, $.response);
		return;
	}
	setEndOfDay(user.Parameters);
	var oResponse;
	try {
		oResponse = Campaign.copy(Campaign_ID, user.Parameters);
	} catch (eMissPrivilege) {
		errorMessages = "Please check whether the user you input has privilege ";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return;

	}
	user.Parameters.Campaign_ID = Campaign_ID;
	if (oResponse.messages.length !== 0) {
		util.check_rep(oResponse, return_inf, user);
		return;
	}
	var iKey = oResponse.generatedKeys[-1];
	//return response 

	return_inf = util.get_inf(user, return_inf, iKey);
	util.send_mes(return_inf);
	oConn.commit();
	return;
}

function checkDate(oParam) {
	if (!oParam) {
		return;
	}
	if (oParam.VALID_FROM && util.hasTime(new Date(oParam.VALID_FROM))) {
		throw new Error("VALID_FROM is invalid");
	}
	if (oParam.VALID_TO && util.hasTime(new Date(oParam.VALID_TO))) {
		throw new Error("VALID_TO is invalid");
	}
	if (oParam.SUBMIT_FROM && util.hasTime(new Date(oParam.SUBMIT_FROM))) {
		throw new Error("SUBMIT_FROM is invalid");
	}
	if (oParam.SUBMIT_TO && util.hasTime(new Date(oParam.SUBMIT_TO))) {
		throw new Error("SUBMIT_TO is invalid");
	}
	if (oParam.REGISTER_FROM && util.hasTime(new Date(oParam.REGISTER_FROM))) {
		throw new Error("REGISTER_FROM is invalid");
	}
	if (oParam.REGISTER_TO && util.hasTime(new Date(oParam.REGISTER_TO))) {
		throw new Error("REGISTER_TO is invalid");
	}
}

function setEndOfDay(oParam){
    if(!oParam){
        return;
    }
	if (oParam.VALID_TO) {
		oParam.VALID_TO = util.setEndOfDay(new Date(oParam.VALID_TO));
	}
	if (oParam.SUBMIT_TO) {
		oParam.SUBMIT_TO = util.setEndOfDay(new Date(oParam.SUBMIT_TO));
	}
	if (oParam.REGISTER_TO) {
		oParam.REGISTER_TO = util.setEndOfDay(new Date(oParam.REGISTER_TO));
	}
}