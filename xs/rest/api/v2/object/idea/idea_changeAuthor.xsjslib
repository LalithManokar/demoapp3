var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function idea_changeAuthor(user, response) {
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

	var changeAuthorResults = [];

	user.Parameters.forEach(function(parameter) {
		var _parameter = _.clone(parameter);
		var idea_id = parameter.IDEA_ID;
		delete parameter.IDEA_ID;
		var oResponse;
		var resultData = {};

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Author": false,
				"Msg": "Error type of your input IDEA_ID,Please check IDEA_ID is number or not"
			};
			changeAuthorResults.push(resultData);
			return false;
		}

		var newAuthorId;
		var newAuthorName = parameter.NEW_AUTHOR_NAME ? parameter.NEW_AUTHOR_NAME : "";
		if (newAuthorName) {
			newAuthorId = oHQ.statement(
				'select ID from "sap.ino.db.iam::t_identity" where USER_NAME = ?'
			)
				.execute(newAuthorName);
		}
		delete parameter.NEW_AUTHOR_NAME;

		var bNewAuthorId = newAuthorId && ((newAuthorId.length > 0) ? newAuthorId[0].ID : "");

		if (bNewAuthorId) {
			parameter.AUTHOR_ID = newAuthorId[0].ID;
		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"NEW_AUTHOR_NAME": newAuthorName,
				"Changed_Author": false,
				"Msg": "The author of your input is not found,Please check again"
			};
			changeAuthorResults.push(resultData);
			return false;
		}

		var ORIGIN_AUTHOR_ID = oHQ.statement(
				'select IDENTITY_ID from "sap.ino.db.iam::t_object_identity_role" where object_type_code = ? and role_code = ? and object_id = ?'
			)
			.execute('IDEA','IDEA_SUBMITTER',idea_id);

		if (ORIGIN_AUTHOR_ID && ORIGIN_AUTHOR_ID.length > 0) {
			parameter.ORIGIN_AUTHOR_ID = ORIGIN_AUTHOR_ID[0].IDENTITY_ID;
		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Author": false,
				"Msg": "The idea author is not found,Please check again"
			};
			changeAuthorResults.push(resultData);
			return false;
		}

		try {
			parameter.keys = [idea_id];
			oResponse = Idea.changeAuthorStatic(parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Author": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			changeAuthorResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			var msg = {};
			msg.MESSAGES = [];
			msg = util.error_response(oResponse, msg);
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Author": false,
				"Msg": msg.MESSAGES
			};
			changeAuthorResults.push(resultData);
			oConn.rollback();
		} else {
			resultData = _parameter;
			resultData.Changed_Author = true;
			resultData.Msg = "Successfully changed an idea to other author";
			changeAuthorResults.push(resultData);
			oConn.commit();
		}

	});

	var allSuccess = changeAuthorResults.every(function(oData) {
		return oData.Changed_Author === true;
	});

	var allFailed = changeAuthorResults.every(function(oData) {
		return oData.Changed_Author === false;
	});

	var data = {
		Changed_Author_Results: changeAuthorResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully changed all idea(s) to other author", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed changed all idea(s) to other author", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully changed partial idea(s) to other author,Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}