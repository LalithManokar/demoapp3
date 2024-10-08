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

function idea_merge(user, response) {
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

	var mergeResults = [];

	user.Parameters.forEach(function(parameter) {

		var oResponse;
		var resultData = {};

		var sourceIdeas = parameter.SOURCE_IDEAS;
		var mergeRule = parameter.MERGE_RULE;
		var leadingIdea = parameter.LEADING_IDEA;

		if (!sourceIdeas || !(sourceIdeas instanceof Array) || (sourceIdeas instanceof Array &&
			sourceIdeas.length === 0)) {
			resultData = {
				"SOURCE_IDEAS": sourceIdeas,
				"Merged": false,
				"Msg": "Error type of your input SOURCE_IDEAS,Please check SOURCE_IDEAS is array or not"
			};
			mergeResults.push(resultData);
			return false;
		}

		if (util.check_type(leadingIdea, "number", response)) {
			resultData = {
				"LEADING_IDEA": leadingIdea,
				"Merged": false,
				"Msg": "Error type of your input LEADING_IDEA,Please check LEADING_IDEA is number or not"
			};
			mergeResults.push(resultData);
			return false;
		}

		sourceIdeas.forEach(function(sourceIdea) {
			try {
				var parameters = {
					SOURCE_IDEAS: [sourceIdea],
					MERGE_RULE: mergeRule
				};
				oResponse = Idea.mergeIdeas(leadingIdea, parameters);
			} catch (e) {
				resultData = {
					"SOURCE_IDEA": sourceIdea,
					"Merged": false,
					"Msg": "Please check whether the user you input has privilege"
				};
				mergeResults.push(resultData);
				return false;
			}

			if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
				var msg = {};
				msg.MESSAGES = [];
				msg = util.error_response(oResponse, msg);
				resultData = {
					"SOURCE_IDEA": sourceIdea,
					"Merged": false,
					"Msg": msg.MESSAGES
				};
				mergeResults.push(resultData);
				oConn.rollback();
			} else {
				resultData = {
				    "LEADING_IDEA": leadingIdea,
					"SOURCE_IDEA": sourceIdea,
					"Merged": true,
					"Msg": "Successfully merged " + sourceIdea + " in to " + leadingIdea
				};
				mergeResults.push(resultData);
				oConn.commit();
			}
		});
	});

	var allSuccess = mergeResults.every(function(oData) {
		return oData.Merged === true;
	});

	var allFailed = mergeResults.every(function(oData) {
		return oData.Merged === false;
	});

	var data = {
		Merge_Results: mergeResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully merged all idea(s)", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed merged all idea(s)", data);
	} else {
		response = util.generateResponseData(200, "Partial Success", "Successfully merged partial idea(s),Please check failed idea(s) again",
			data);
	}
	util.handleResponse(response);
}