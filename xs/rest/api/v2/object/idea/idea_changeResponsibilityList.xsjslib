var AOF = $.import('sap.ino.xs.aof.core', 'framework');
var auth = $.import('sap.ino.xs.aof.core', 'authorization');
var Idea = AOF.getApplicationObject('sap.ino.xs.object.idea.Idea');
var Attachment = AOF.getApplicationObject('sap.ino.xs.object.attachment.Attachment');
var hQuery = $.import('sap.ino.xs.xslib', 'hQuery');
var dbConnection = $.import('sap.ino.xs.xslib', 'dbConnection');
var util = $.import('sap.ino.xs.rest.api', 'util');
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function idea_changeResponsibilityList(user, response) {
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		response = util.generateResponseData(403, 'Error', 'The UserID you input is not existed');
		return util.handleResponse(response);
	}

	if (!user.Parameters || !(user.Parameters instanceof Array) || (user.Parameters instanceof Array && user.Parameters.length === 0)) {
		response = util.generateResponseData(400, 'Error', 'Error type of your input Parameters,Please check Parameters is array or not');
		return util.handleResponse(response);
	}

	var changeCategoryResults = [];
	var resultData = {};

	var handleErrordResponse = function(oErrorResponse, idea_id) {
		var msg = {};
		msg.MESSAGES = [];
		msg = util.error_response(oErrorResponse, msg);
		resultData = {
			"IDEA_ID": idea_id,
			"Changed_Category": false,
			"Msg": msg.MESSAGES
		};
		changeCategoryResults.push(resultData);
		oConn.rollback();
		return false;
	};

	user.Parameters.forEach(function(parameter) {
		var idea_id = parameter.IDEA_ID;
		var oResponse;
		delete parameter.IDEA_IDS;

		if (util.check_type(idea_id, 'number', response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Category": false,
				"Msg": 'Error type of your input IDEA_ID,Please check IDEA_ID is number or not'
			};
			changeCategoryResults.push(resultData);
			return false;
		}

		//handle responsibility list
		if (parameter.RESP_VALUE_CODE) {
			var campaign_id = oHQ.statement('select CAMPAIGN_ID from"sap.ino.db.idea::t_idea" where id =  ?').execute(idea_id);
			if (campaign_id.length === 0) {
				resultData = {
					"IDEA_ID": idea_id,
					"Changed_Category": false,
					"Msg": 'The campaign to which this idea belongs had not found'
				};
				changeCategoryResults.push(resultData);
				return false;
			} else {
				var campaignId = campaign_id[0].CAMPAIGN_ID;
				var respListPackageName = oHQ.statement('select RESP_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaignId);
				if (!respListPackageName[0].RESP_CODE) {
					resultData = {
						"IDEA_ID": idea_id,
						"Changed_Category": false,
						"Msg": 'The campaign to which this idea belongs has no responsibility list'
					};
					changeCategoryResults.push(resultData);
					return false;
				} else {
					var respListValue = oHQ
						.statement('select  CODE from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where RESP_CODE  = ? and CODE = ?')
						.execute(respListPackageName[0].RESP_CODE, parameter.RESP_VALUE_CODE);
					if (respListValue.length === 0) {
						resultData = {
							"IDEA_ID": idea_id,
							"Changed_Category": false,
							"Msg": "The responsibility value code you input not belong to this camapign's responsibility list"
						};
						changeCategoryResults.push(resultData);
						return false;
					}
				}
			}
		} else {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Category": false,
				"Msg": 'Please input responsibility value code'
			};
			changeCategoryResults.push(resultData);
			return false;
		}

		var aAutoAssignCoach = oHQ.statement('select IS_AUTO_ASSIGN_RL_COACH from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(
			campaignId);

		var aDefaultCoach = oHQ
			.statement('select DEFAULT_COACH from "sap.ino.db.subresponsibility.ext::v_ext_responsibility_value" WHERE CODE = ?')
			.execute(parameter.RESP_VALUE_CODE);

		var aOriginalCoach = oHQ
			.statement(
				'select IDENTITY_ID from "sap.ino.db.iam::t_object_identity_role" where object_type_code = ? and role_code = ? and object_id = ?')
			.execute('IDEA', 'IDEA_COACH', idea_id);

		var bAutoAssignCoach = aAutoAssignCoach.length > 0 && aAutoAssignCoach[0].IS_AUTO_ASSIGN_RL_COACH === 1 ? true : false;
		var defaultCoach = aDefaultCoach.length > 0 && aDefaultCoach[0].DEFAULT_COACH ? aDefaultCoach[0].DEFAULT_COACH : '';
		var originalCoach = aOriginalCoach.length > 0 && aOriginalCoach[0].IDENTITY_ID ? aOriginalCoach[0].IDENTITY_ID : '';
		var bAutoAssignCoachAPI = true;

		if (bAutoAssignCoach && defaultCoach) {
			if (!originalCoach) {
				bAutoAssignCoachAPI = true;
			} else if (originalCoach && parameter.REPLACE_ORIGINAL_COACH === undefined || '') {
				resultData = {
					"IDEA_ID": idea_id,
					"Changed_Category": false,
					"REPLACE_ORIGINAL_COACH": parameter.REPLACE_ORIGINAL_COACH,
					"Msg": 'Because campaign opened auto assign coach and idea had original coach and new responsibility value had default coach. Need to Indicate replace original coach or not.Please input REPLACE_ORIGINAL_COACH'
				};
				changeCategoryResults.push(resultData);
				return false;
			} else {
				bAutoAssignCoachAPI = !!parameter.REPLACE_ORIGINAL_COACH;
			}
		} else {
			bAutoAssignCoachAPI = false;
		}

		try {
			parameter.ID = idea_id;
			delete parameter.REPLACE_ORIGINAL_COACH;
			oResponse = Idea.update(parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Changed_Category": false,
				"Msg": 'Please check whether the user you input has privilege'
			};
			changeCategoryResults.push(resultData);
			return false;
		}

		if (oResponse.messages && oResponse.messages.length !== 0 && oResponse.messages[0].severity <= 2) {
			return handleErrordResponse(oResponse, idea_id);
		}

		if (bAutoAssignCoachAPI) {
			var oAutoAssignCoachResponse = Idea.autoAssignCoach(idea_id, {
				DEFAULT_COACH: defaultCoach
			});
			if (oAutoAssignCoachResponse.messages && oAutoAssignCoachResponse.messages.length !== 0 && oAutoAssignCoachResponse.messages[0].severity <=
				2) {
				return handleErrordResponse(oAutoAssignCoachResponse, idea_id);
			}
		}

		resultData = {
			"IDEA_ID": idea_id,
			"RESP_VALUE_CODE": parameter.RESP_VALUE_CODE,
			"Changed_Category": true,
			"Msg": 'Successfully changed category for an idea'
		};
		changeCategoryResults.push(resultData);
		oConn.commit();
	});

	var allSuccess = changeCategoryResults.every(function(oData) {
		return oData.Changed_Category === true;
	});

	var allFailed = changeCategoryResults.every(function(oData) {
		return oData.Changed_Category === false;
	});

	var data = {
		Changed_Category_Results: changeCategoryResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, 'Success', 'Successfully changed category for all idea(s)', data);
	} else if (allFailed) {
		response = util.generateResponseData(400, 'Failed', 'Failed changed category for all idea(s)', data);
	} else {
		response = util.generateResponseData(200, 'Partial Success',
			'Successfully changed category for partial idea(s),Please check failed idea(s) again', data);
	}

	util.handleResponse(response);
}