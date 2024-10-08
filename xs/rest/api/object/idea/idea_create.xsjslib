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

function idea_create(user, return_inf) {
    var errorMessages, i;
	try {
		util.getSessionUser(user);//get user
	} catch (e) {
		 errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
	$.response.status = 403;
    util.handlError(return_inf, user, errorMessages, $.response);
					return false;
	} 
	var campaign_id = user.Parameters.CAMPAIGN_ID;
	
	var bContextData, aContextData;

	if (user.Parameters.CONTEXT_DATA) {
		bContextData = true;
		aContextData = JSON.stringify(user.Parameters.CONTEXT_DATA);
		delete user.Parameters.CONTEXT_DATA;
	} else {
		bContextData = false;
	}
	try {
		//handle attachment 
		if (user.Parameters.Attachments) {
			var attachmentID;
			var attachment_set = [];
			var attachment_response;
			var oAttachment = user.Parameters.Attachments;

			for (i = 0; i < oAttachment.length; i++) {
				oAttachment[i].ID = -1;
				try {
					oAttachment[i].DATA = $.util.codec.decodeBase64(oAttachment[i].DATA);
				} catch (ecodingE) {

				}
				attachment_response = Attachment.create(oAttachment[i]);
				attachmentID = attachment_response.generatedKeys[-1];
				attachment_set.push({
					ID: -2,
					ATTACHMENT_ID: attachmentID,
					ROLE_TYPE_CODE: "ATTACHMENT"
				});

			}
			user.Parameters.Attachments = attachment_set;
		}
		//handle InternalAttachment 
		if (user.Parameters.InternalAttachments) {
			var InternalAttachmentID;
			var InternalAttachment_set = [];
			var InternalAttachment_response;
			var oInternalAttachment = user.Parameters.InternalAttachments;

			for (i = 0; i < oInternalAttachment.length; i++) {
				oInternalAttachment[i].ID = -1;
				try {
					oInternalAttachment[i].DATA = $.util.codec.decodeBase64(oInternalAttachment[i].DATA);
				} catch (ecodingE) {

				}
				try {
					InternalAttachment_response = Attachment.create(oInternalAttachment[i]);
				} catch (eMissPrivilege) {
					errorMessages = "Please check whether the user you input has privilege ";
					$.response.status = 401;
					util.handlError(return_inf, user, errorMessages, $.response);
					return false;

				}

				InternalAttachmentID = InternalAttachment_response.generatedKeys[-1];
				InternalAttachment_set.push({
					ID: -2,
					ATTACHMENT_ID: InternalAttachmentID,
					ROLE_TYPE_CODE: "ATTACHMENT"
				});
			}
			user.Parameters.InternalAttachments = InternalAttachment_set;
		}
		if (util.check_type(campaign_id, "number", return_inf)) {
			return util.get_Wrong_inf(user, return_inf);
		}
		//handle responsibility list 
		if (user.Parameters.RESP_VALUE_CODE) {
			var respListPackageName = oHQ.statement(
				'select  RESP_CODE from "sap.ino.db.campaign::t_campaign" where id  = ?').execute(campaign_id);
			if (!respListPackageName[0].RESP_CODE) {
				errorMessages = "This campaign has no responsibility list";
				util.handlError(return_inf, user, errorMessages);
				return false;
			} else {
				var respListValue = oHQ.statement(
						'select  CODE from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where RESP_CODE  = ? and CODE = ?')
					.execute(respListPackageName[0].RESP_CODE, user.Parameters.RESP_VALUE_CODE);
				if (respListValue.length === 0) {
					errorMessages = "The responsibility list value code you input not belong to this camapign's responsibility list";
					util.handlError(return_inf, user, errorMessages);
					return false;
				}
			}
		}

	} catch (e) {
		errorMessages = "Please check your input Arributes ";
		util.handlError(return_inf, user, errorMessages);
		return false;
	}
	var oResponse;
	try {
		oResponse = Idea.create(user.Parameters);
	} catch (eMissPrivilege) {
		errorMessages = "Please check whether the user you input has privilege ";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;

	}

	if (oResponse.messages.length !== 0) {
		util.check_rep(oResponse, return_inf, user);
		return false;
	}
	var iKey = oResponse.generatedKeys[-1]; //get idea id
	oResponse = Idea.submit(iKey);
	if (oResponse.messages.length !== 0) {
		util.check_rep(oResponse, return_inf, user);
		return false;
	}
	oConn.commit();
	//auto vote
	
	var ideaPhaseCode = oHQ.statement(
						'select PHASE_CODE from"sap.ino.db.idea::t_idea"where id = ?')
					.execute(iKey);
	var votingActive =  oHQ.statement(
						'select VOTING_ACTIVE from"sap.ino.db.campaign::t_campaign_phase" where PHASE_CODE = ? and CAMPAIGN_ID = ?')
					.execute(ideaPhaseCode[0].PHASE_CODE,campaign_id);  
	if(votingActive.length > 0 && votingActive[0].VOTING_ACTIVE === 1){
	    var oScore;
	    var Vote = AOF.getApplicationObject("sap.ino.xs.object.idea.Vote");
	    var campaignVoteCode = oHQ.statement(
						'select VOTE_TYPE_CODE from"sap.ino.db.campaign::t_campaign"where id = ?')
					.execute(campaign_id);
	    if(campaignVoteCode.length > 0){
	       var VoteType = oHQ.statement(
						'select TYPE_CODE,MAX_STAR_NO,AUTO_VOTE from"sap.ino.db.campaign::t_vote_type" where code = ?')
					.execute(campaignVoteCode[0].VOTE_TYPE_CODE);  
		if(VoteType[0].AUTO_VOTE === 1){
		    	if(VoteType[0].TYPE_CODE === 'STAR'){
			     oScore = VoteType[0].MAX_STAR_NO;
		        }else {
		        oScore = 1;
	            }   
            	var oVoteResponse = Vote.create({
	            	ID: -1,
	            	IDEA_ID: iKey,
	            	SCORE: oScore
            	});
               if (oVoteResponse.messages.length !== 0) {
    	       	util.check_rep(oVoteResponse, return_inf, user);
    	       	return false;
	                 }
	       }
     	}
	}
	
	
	
	//handle context data 
	if (bContextData) {
		var strLength = aContextData.length;
		if (strLength < 5000) {
			var sqlStatment = "update  \"sap.ino.db.basis::t_extension\" set _TEXT_01 = \'" + aContextData + " \' where _object_id = ?";
			oHQ.statement(sqlStatment).execute(iKey);
		} else {
			errorMessages = "The context data you input exceeds the size limit ";
			util.handlError(return_inf, user, errorMessages);
			return false;
		}
	}
	return_inf = util.get_inf(user, return_inf, iKey);
	util.send_mes(return_inf);
	oConn.commit();

	return;

}