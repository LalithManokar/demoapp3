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

function idea_changeStatus(user, response) {
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

	var changeStatusResults = [];

	user.Parameters.forEach(function(parameter) {

		var idea_id = parameter.IDEA_ID;
		delete parameter.IDEA_ID;
		var oResponse;
		var resultData = {};

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Status": false,
				"Msg": "Error type of your input IDEA_ID,Please check IDEA_ID is number or not"
			};
			changeStatusResults.push(resultData);
			return false;
		}

		var decisionName = parameter.DECISION_UESR ? parameter.DECISION_UESR : "";
		if (decisionName) {
			var decisionId = oHQ.statement(
					'select ID,USER_NAME from "sap.ino.db.iam::t_identity" where USER_NAME = ?'
				)
				.execute(decisionName);

			var bDecisionId = decisionId && ((decisionId.length > 0) ? decisionId[0].ID : "");

			if (bDecisionId) {
				parameter.DECIDER_ID = decisionId[0].ID;
				parameter.DECIDER_NAME = decisionId[0].USER_NAME;
				delete parameter.DECISION_UESR;
			} else {
				resultData = {
					"IDEA_ID": idea_id,
					"DECISION_UESR": parameter.DECISION_UESR,
					"Changed_Status": false,
					"Msg": "The DECISION_UESR of your input is not found,Please check again"
				};
				changeStatusResults.push(resultData);
				return false;
			}
		}

		try {
			oResponse = Idea.executeStatusTransition(idea_id, parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Status": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			changeStatusResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			var msg = {};
			msg.MESSAGES = [];
			msg = util.error_response(oResponse, msg);
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Status": false,
				"Msg": msg.MESSAGES
			};
			changeStatusResults.push(resultData);
			oConn.rollback();

		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Status": true,
				"Msg": "Successfully changed an idea status"
			};
			changeStatusResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = changeStatusResults.every(function(oData) {
		return oData.Changed_Status === true;
	});

	var allFailed = changeStatusResults.every(function(oData) {
		return oData.Changed_Status === false;
	});

	var data = {
		Changed_Status_Results: changeStatusResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully changed all idea(s) status", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed changed all idea(s) status", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully changed partial idea(s) status,Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}