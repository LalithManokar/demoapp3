var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Blog = AOF.getApplicationObject("sap.ino.xs.object.blog.Blog");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function campaign_publishBlog(user, response) {
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

	var publishBlogResults = [];
	var resultData = {};

	var handleErrordResponse = function(oErrorResponse, campaign_id) {
		var msg = {};
		msg.MESSAGES = [];
		msg = util.error_response(oErrorResponse, msg);
		resultData = {
			"CAMPAIGN_ID": campaign_id,
			"Publish_Blog": false,
			"Msg": msg.MESSAGES
		};
		publishBlogResults.push(resultData);
		oConn.rollback();
		return false;
	};

	user.Parameters.forEach(function(parameter) {

		var campaign_id = parameter.CAMPAIGN_ID;
		var publishType = parameter.Publish_Type && parameter.Publish_Type === "Minor" ? "Minor" : "Major";
		delete parameter.CAMPAIGN_ID;
		delete parameter.Publish_Type;
		var oResponse;

		if (util.check_type(campaign_id, "number", response)) {
			resultData = {
				"CAMPAIGN_ID": campaign_id,
				"Publish_Blog": false,
				"Msg": "Error type of your input CAMPAIGN_ID,Please check CAMPAIGN_ID is number or not"
			};
			publishBlogResults.push(resultData);
			return false;
		}

		try {
			parameter.OBJECT_ID = campaign_id;
			parameter.OBJECT_TYPE_CODE = "CAMPAIGN";
			parameter.ID = -1;
			oResponse = Blog.create(parameter);
		} catch (e) {
			resultData = {
				"CAMPAIGN_ID": campaign_id,
				"Publish_Blog": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			publishBlogResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			return handleErrordResponse(oResponse, campaign_id);
		}

		var iKey = oResponse.generatedKeys[-1]; //get idea id

		if (publishType === "Minor") {
			var oSubmitResponse = Blog.publish(iKey);
		} else {
			oSubmitResponse = Blog.majorPublish(iKey);
		}

		if (oSubmitResponse.messages && oSubmitResponse.messages.length !== 0 && oSubmitResponse.messages[0].severity <= 2) {
			return handleErrordResponse(oSubmitResponse, campaign_id);
		} else {
			resultData = {
				"CAMPAIGN_ID": campaign_id,
				"Publish_Blog": true,
				"Msg": "Successfully published blog"
			};
			publishBlogResults.push(resultData);
			oConn.commit();
		}
	});

	var allSuccess = publishBlogResults.every(function(oData) {
		return oData.Publish_Blog === true;
	});

	var allFailed = publishBlogResults.every(function(oData) {
		return oData.Publish_Blog === false;
	});

	var data = {
		Publish_Blog_Results: publishBlogResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully published all idea(s) blog", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed published all idea(s) blog", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully published partial idea(s) blog,Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}