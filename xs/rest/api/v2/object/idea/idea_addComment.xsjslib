var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Comment = AOF.getApplicationObject("sap.ino.xs.object.idea.Comment");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function idea_addComment(user, response) {
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

	var addCommentResults = [];

	user.Parameters.forEach(function(parameter) {

		var idea_id = parameter.IDEA_ID;
		delete parameter.IDEA_ID;
		var oResponse;
		var resultData = {};

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Add_Comment": false,
				"Msg": "Error type of your input IDEA_ID,Please check IDEA_ID is number or not"
			};
			addCommentResults.push(resultData);
			return false;
		}

		try {
		    parameter.OBJECT_ID = idea_id;
			oResponse = Comment.create(parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Add_Comment": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			addCommentResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			var msg = {};
			msg.MESSAGES = [];
			msg = util.error_response(oResponse, msg);
			resultData = {
				"IDEA_ID": idea_id,
				"Add_Comment": false,
				"Msg": msg.MESSAGES
			};
			addCommentResults.push(resultData);
			oConn.rollback();

		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"Add_Comment": true,
				"Msg": "Successfully add comment on an idea"
			};
			addCommentResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = addCommentResults.every(function(oData) {
		return oData.Add_Comment === true;
	});

	var allFailed = addCommentResults.every(function(oData) {
		return oData.Add_Comment === false;
	});

	var data = {
		Add_Comment_Results: addCommentResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully add all idea(s) comment", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed add all idea(s) comment", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully add partial idea(s) comment,Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}