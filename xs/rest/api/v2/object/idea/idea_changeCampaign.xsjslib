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

function idea_changeCampaign(user, response) {
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		response = util.generateResponseData(403, "Error", "The UserID you input is not existed");
		return util.handleResponse(response);
	}

	if (!user.Parameters || !(user.Parameters instanceof Array) || (user.Parameters instanceof Array && user.Parameters.length === 0)) {
		response = util.generateResponseData(400, "Error", "Error type of your input Parameters,Please check Parameters is array or not");
		return util.handleResponse(response);
	}

	var changeCampaignResults = [];

	user.Parameters.forEach(function(parameter) {
		var idea_id = parameter.IDEA_ID;
		var campaignID = parameter.CAMPAIGN_ID;
		delete parameter.IDEA_ID;
		var oResponse;
		var resultData = {};

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"Msg": "Error type of your input IDEA_ID,Please check IDEA_ID is number or not"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		var campaign_id = oHQ.statement(
			'select ID from "sap.ino.db.campaign::t_campaign" where id = ?').execute(campaignID);

		if (campaign_id.length === 0) {
			resultData = {
				"IDEA_ID": idea_id,
				"CAMPAIGN_ID": campaignID,
				"Changed_Campaign": false,
				"Msg": "The campaign to reassign had not found,Please check again"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		var respListPackageName = oHQ.statement(
			'select  RESP_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaignID);

		if (respListPackageName.length === 0 && parameter.RESP_VALUE_CODE) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"CAMPAIGN_ID": campaignID,
				"Msg": "The campaign to reassign had no responsibility list,Please delete responsibility code"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		if (respListPackageName.length > 0 && !parameter.RESP_VALUE_CODE) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"CAMPAIGN_ID": campaignID,
				"Msg": "The campaign to reassign has responsibility list,Please add responsibility code"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		if (respListPackageName.length > 0 && parameter.RESP_VALUE_CODE) {
			var respListValue = oHQ.statement(
					'select  CODE from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where RESP_CODE  = ? and CODE = ?')
				.execute(respListPackageName[0].RESP_CODE, parameter.RESP_VALUE_CODE);
			if (respListValue.length === 0) {
				resultData = {
					"IDEA_ID": idea_id,
					"Changed_Campaign": false,
					"Msg": "The responsibility list value code you input not belong to this camapign's responsibility list"
				};
				changeCampaignResults.push(resultData);
				return false;
			}
		}

		var ideaForm = oHQ.statement(
			'select * from "sap.ino.db.ideaform::t_field_value" where IDEA_ID  = ?').execute(idea_id);

		var originalCampaign = oHQ.statement(
			'select CAMPAIGN_ID from "sap.ino.db.idea::t_idea" where ID  = ?').execute(idea_id);

		var originalCampaignID = originalCampaign.length > 0 ? originalCampaign[0].CAMPAIGN_ID : 0;

		var originalCampaignForm = oHQ.statement(
			'select FORM_CODE from "sap.ino.db.campaign::t_campaign" where ID  = ?').execute(originalCampaignID);

		var originalFormID = originalCampaignForm.length > 0 ? originalCampaignForm[0].FORM_CODE : 0;

		var assignCampaignForm = oHQ.statement(
			'select FORM_CODE from "sap.ino.db.campaign::t_campaign" where ID  = ?').execute(campaignID);

		var assignFormID = assignCampaignForm.length > 0 ? assignCampaignForm[0].FORM_CODE : 0;

		var bFormIDEqual = originalFormID === assignFormID ? true : false;

		if (ideaForm.length > 0 && !bFormIDEqual) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"Original_Campaign_Form":originalFormID,
				"Assign_Campaign_Form":assignFormID,
				"Msg": "Can not assign to other campaign,Beacuse the new campaign idea from is unequal to original campaign idea from"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		try {
			oResponse = Idea.reassignCampaign(idea_id, parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			changeCampaignResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			var msg = {};
			msg.MESSAGES = [];
			msg = util.error_response(oResponse, msg);
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Campaign": false,
				"Msg": msg.MESSAGES
			};
			changeCampaignResults.push(resultData);
			oConn.rollback();
		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"CAMPAIGN_ID": campaignID,
				"Changed_Campaign": true,
				"Msg": "Successfully changed an idea to other campaign"
			};
			changeCampaignResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = changeCampaignResults.every(function(oData) {
		return oData.Changed_Campaign === true;
	});

	var allFailed = changeCampaignResults.every(function(oData) {
		return oData.Changed_Campaign === false;
	});

	var data = {
		Changed_Campaign_Results: changeCampaignResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully changed all idea(s) to other campaign", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed changed all idea(s) to other campaign", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully changed partial idea(s) to other campaign,Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}