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

function idea_copy(user, response) {
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

	var copyResults = [];
	var resultData = {};

	var handleErrordResponse = function(oErrorResponse, idea_id) {
		var msg = {};
		msg.MESSAGES = [];
		msg = util.error_response(oErrorResponse, msg);
		resultData = {
			"ORIGINAL_IDEA_ID": idea_id,
			"Copied": false,
			"Msg": msg.MESSAGES
		};
		copyResults.push(resultData);
		oConn.rollback();
		return false;
	};

	user.Parameters.forEach(function(parameter) {

		var idea_id = parameter.ORIGINAL_IDEA_ID;
		var new_idea_name = parameter.NEW_IDEA_NAME;
		var oResponse;
		delete parameter.ORIGINAL_IDEA_ID;
		delete parameter.NEW_IDEA_NAME;
		parameter.NAME = new_idea_name;
		parameter.ID = -1;

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"ORIGINAL_IDEA_ID": idea_id,
				"Copied": false,
				"Msg": "Error type of your input ORIGINAL_IDEA_ID,Please check ORIGINAL_IDEA_ID is number or not"
			};
			copyResults.push(resultData);
			return false;
		}
		try {
			oResponse = Idea.copy(idea_id, parameter);
		} catch (e) {
			resultData = {
				"ORIGINAL_IDEA_ID": idea_id,
				"Copied": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			copyResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			return handleErrordResponse(oResponse, idea_id);
		}

		var iKey = oResponse.generatedKeys[-1]; //get idea id
		var oSubmitResponse = Idea.submit(iKey);
		if (oSubmitResponse.messages && oSubmitResponse.messages.length !== 0 && oSubmitResponse.messages[0].severity <= 2) {
			return handleErrordResponse(oSubmitResponse, idea_id);
		} else {
			resultData = {
				"ORIGINAL_IDEA_ID": idea_id,
				"NEW_IDEA_ID": iKey,
				"NEW_IDEA_NAME": new_idea_name,
				"Copied": true,
				"Msg": "Successfully copied an idea"
			};
			copyResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = copyResults.every(function(oData) {
		return oData.Copied === true;
	});

	var allFailed = copyResults.every(function(oData) {
		return oData.Copied === false;
	});

	var data = {
		Copy_Results: copyResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully copied all idea(s)", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed copied all idea(s)", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully copied partial idea(s),Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}