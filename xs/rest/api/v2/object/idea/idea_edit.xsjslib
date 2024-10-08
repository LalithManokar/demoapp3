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

function idea_edit(user, response) {
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

	var changeEditResults = [];
	var resultData = {};

	var handleErrordResponse = function(oErrorResponse, idea_id) {
		var msg = {};
		msg.MESSAGES = [];
		msg = util.error_response(oErrorResponse, msg);
		resultData = {
			"IDEA_ID": idea_id,
			"Edited": false,
			"Msg": msg.MESSAGES
		};
		changeEditResults.push(resultData);
		oConn.rollback();
		return false;
	};

	user.Parameters.forEach(function(parameter) {

		var idea_id = parameter.IDEA_ID;
		delete parameter.IDEA_ID;
		var oResponse;
		var checkContributorError = [];

		if (util.check_type(idea_id, "number", response)) {
			resultData = {
				"IDEA_ID": idea_id,
				"Edited": false,
				"Msg": "Error type of your input IDEA_ID,Please check IDEA_ID is number or not"
			};
			changeEditResults.push(resultData);
			return false;
		}

		if (parameter.Contributors && parameter.Contributors instanceof Array && parameter.Contributors.length > 0) {
			parameter.Contributors.forEach(function(contributor) {
				var contributorId;
				var contributorName = contributor.CONTRIBUTOR_NAME ? contributor.CONTRIBUTOR_NAME : "";
				if (contributorName) {
					contributorId = oHQ.statement(
						'select ID from "sap.ino.db.iam::t_identity" where USER_NAME = ?'
					)
						.execute(contributorName);
				}

				var bContributorId = contributorId && ((contributorId.length > 0) ? contributorId[0].ID : "");

				if (bContributorId) {
					contributor.IDENTITY_ID = contributorId[0].ID;
					delete contributor.CONTRIBUTOR_NAME;
				} else {
					resultData = {
						"IDEA_ID": idea_id,
						"CONTRIBUTOR_NAME": contributor.CONTRIBUTOR_NAME,
						"Edited": false,
						"Msg": "The contributor of your input is not found,Please check again"
					};
					changeEditResults.push(resultData);
					checkContributorError.push(resultData);
					return false;
				}
			});
		}

		if (checkContributorError.length > 0) {
			return false;
		}

		//handle campaign Id
		var campaignId;
		if (parameter.CAMPAIGN_ID) {
			var campaign_id = oHQ.statement('select ID from"sap.ino.db.campaign::t_campaign" where id  = ?').execute(parameter.CAMPAIGN_ID);
			if (campaign_id.length === 0) {
				resultData = {
					"IDEA_ID": idea_id,
					"CAMPAIGN_ID": parameter.CAMPAIGN_ID,
					"Edited": false,
					"Msg": 'The campaign of your input is not found,Please check again'
				};
				changeEditResults.push(resultData);
				return false;
			} else {
				campaignId = campaign_id[0].ID;
				
				var ideaForm = oHQ.statement(
					'select * from "sap.ino.db.ideaform::t_field_value" where IDEA_ID  = ?').execute(idea_id);

				var originalCampaign = oHQ.statement(
					'select CAMPAIGN_ID from "sap.ino.db.idea::t_idea" where ID  = ?').execute(idea_id);

				var originalCampaignID = originalCampaign.length > 0 ? originalCampaign[0].CAMPAIGN_ID : 0;

				var originalCampaignForm = oHQ.statement(
					'select FORM_CODE from "sap.ino.db.campaign::t_campaign" where ID  = ?').execute(originalCampaignID);

				var originalFormID = originalCampaignForm.length > 0 ? originalCampaignForm[0].FORM_CODE : 0;

				var assignCampaignForm = oHQ.statement(
					'select FORM_CODE from "sap.ino.db.campaign::t_campaign" where ID  = ?').execute(campaignId);

				var assignFormID = assignCampaignForm.length > 0 ? assignCampaignForm[0].FORM_CODE : 0;

				var bFormIDEqual = (originalFormID === assignFormID) || (originalFormID === null) ? true : false;

				if ((ideaForm.length > 0 && !bFormIDEqual) || (parameter.FieldsValue && parameter.FieldsValue.length > 0 && !bFormIDEqual)) {
					resultData = {
						"IDEA_ID": idea_id,
						"Edited": false,
						"Original_Campaign_Form": originalFormID,
						"Assign_Campaign_Form": assignFormID,
						"Msg": "Can not assign to other campaign,Beacuse the new campaign idea from is unequal to original campaign idea from"
					};
					changeEditResults.push(resultData);
					return false;
				}
			}
		} else {
			campaign_id = oHQ.statement('select CAMPAIGN_ID from"sap.ino.db.idea::t_idea" where id =  ?').execute(idea_id);
			campaignId = campaign_id[0].CAMPAIGN_ID;
		}

		//handle responsibility list
		if (parameter.RESP_VALUE_CODE) {
			var respListPackageName = oHQ.statement('select RESP_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaignId);
			if (respListPackageName.length === 0) {
				resultData = {
					"IDEA_ID": idea_id,
					"CAMPAIGN_ID": campaignId,
					"Edited": false,
					"Msg": 'The campaign to which this idea belongs has no responsibility list'
				};
				changeEditResults.push(resultData);
				return false;
			} else {
				var respListValue = oHQ
					.statement('select  CODE from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where RESP_CODE  = ? and CODE = ?')
					.execute(respListPackageName[0].RESP_CODE, parameter.RESP_VALUE_CODE);
				if (respListValue.length === 0) {
					resultData = {
						"IDEA_ID": idea_id,
						"CAMPAIGN_ID": campaignId,
						"RESP_VALUE_CODE": parameter.RESP_VALUE_CODE,
						"Edited": false,
						"Msg": "The responsibility value code you input not belong to this camapign's responsibility list"
					};
					changeEditResults.push(resultData);
					return false;
				}
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
						"Edited": false,
						"REPLACE_ORIGINAL_COACH": parameter.REPLACE_ORIGINAL_COACH,
						"Msg": 'Because campaign opened auto assign coach and idea had original coach and new responsibility value had default coach. Need to Indicate replace original coach or not.Please input REPLACE_ORIGINAL_COACH'
					};
					changeEditResults.push(resultData);
					return false;
				} else {
					bAutoAssignCoachAPI = !!parameter.REPLACE_ORIGINAL_COACH;
				}
			} else {
				bAutoAssignCoachAPI = false;
			}
		}

		try {
			parameter.ID = idea_id;
			delete parameter.REPLACE_ORIGINAL_COACH;
			oResponse = Idea.update(parameter);
		} catch (e) {
			resultData = {
				"IDEA_ID": idea_id,
				"Edited": false,
				"Msg": "Please check whether the user you input has privilege"
			};
			changeEditResults.push(resultData);
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
			"Edited": true,
			"Msg": 'Successfully edited an idea'
		};
		changeEditResults.push(resultData);
		oConn.commit();
	});

	var allSuccess = changeEditResults.every(function(oData) {
		return oData.Edited === true;
	});

	var allFailed = changeEditResults.every(function(oData) {
		return oData.Edited === false;
	});

	var data = {
		Changed_Edit_Results: changeEditResults
	};

	if (allSuccess) {
		response = util.generateResponseData(200, "Success", "Successfully edited all idea(s)", data);
	} else if (allFailed) {
		response = util.generateResponseData(400, "Failed", "Failed edited all idea(s)", data);
	} else {
		response = util.generateResponseData(200, "Partial Success",
			"Successfully edited partial idea(s),Please check failed idea(s) again",
			data);
	}

	util.handleResponse(response);
}