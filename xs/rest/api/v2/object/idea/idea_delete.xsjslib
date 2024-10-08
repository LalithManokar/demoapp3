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

function idea_delete(user, response) {
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		response = util.generateResponseData(403, "Error", "The UserID you input is not existed");
		return util.handleResponse(response);
	}

	if (!user.Parameters.IDEA_IDS || !(user.Parameters.IDEA_IDS instanceof Array) || (user.Parameters.IDEA_IDS instanceof Array && user.Parameters
		.IDEA_IDS.length === 0)) {
		response = util.generateResponseData(400, "Error", "Error from your input IDEA_IDS,Please check again");
		return util.handleResponse(response);
	}

	var idea_ids = user.Parameters.IDEA_IDS;
	var oResponse;
	var resultData = {};
	var deleteResults = [];

	idea_ids.forEach(function(idea_id) {
		try {
			oResponse = Idea.del(idea_id);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Deleted": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			deleteResults.push(resultData);
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			var msg = {};
			msg.MESSAGES = [];
			msg = util.error_response(oResponse, msg);
			resultData = {
				"IDEA_ID": idea_id,
				"Deleted": false,
				"Msg": msg.MESSAGES
			};
			deleteResults.push(resultData);
			oConn.rollback();
		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"Deleted": true,
				"Msg": "Successfully deleted an idea"
			};
			deleteResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = deleteResults.every(function(oData) {
		return oData.Deleted === true;
	});

	var allFailed = deleteResults.every(function(oData) {
		return oData.Deleted === false;
	});
	
	var data = {
	    Delete_Results:deleteResults
	};

	if (allSuccess) {
	    response = util.generateResponseData(200, "Success", "Successfully deleted all idea(s)",data);
	} else if (allFailed) {
	    response = util.generateResponseData(400, "Failed", "Failed deleted all idea(s)",data);
	} else {
	    response = util.generateResponseData(200, "Partial Success", "Successfully deleted partial idea(s),Please check failed idea(s) again",data);
	}
	
	util.handleResponse(response);
}