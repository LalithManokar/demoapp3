var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var AOF = $.import("sap.ino.xs.aof.core", "framework");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var EvalMessage = $.import("sap.ino.xs.object.evaluation", "message");

var status = $.import("sap.ino.xs.object.status", "Status");
var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var EvaluationRequestItem = $.import("sap.ino.xs.object.evaluation", "EvaluationRequestItem");

var auth = $.import("sap.ino.xs.aof.lib", "authorization");

this.definition = {
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_create", "IDEA_ID", "IDEA_ID",
				EvalMessage.AUTH_MISSING_EVAL_REQ_CREATE),
			enabledCheck: createEnabledCheck,
			executionCheck: modifyExecutionCheck,
			historyEvent: "EVAL_REQ_CREATED"
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_update", "EVAL_REQ_ID", EvalMessage.AUTH_MISSING_EVAL_REQ_UPDATE),
			executionCheck: modifyExecutionCheck,
			historyEvent: "EVAL_REQ_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_delete", "EVAL_REQ_ID", EvalMessage.AUTH_MISSING_EVAL_REQ_DELETE),
			enabledCheck: deleteEnabledCheck,
			historyEvent: "EVAL_REQ_DELETED"
		},
		delDueToIdeaDel: {
			authorizationCheck: false,
			execute: delDueToIdeaDel,
			historyEvent: "EVAL_REQ_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_read", "EVAL_REQ_ID", EvalMessage.AUTH_MISSING_EVAL_REQ_READ)
		},
		bulkDeleteEvalReqs: {
			authorizationCheck: false,
			execute: bulkDeleteEvalReqs,
			historyEvent: "EVAL_REQ_EXPIRED",
			isStatic: true,
			isInternal: true
		},
		sendClarification: {
			authorizationCheck: false,
			execute: sendClarification,
			historyEvent: "EVAL_REQ_ITEM_CLARIFICATION_SENT"
		},
		determineForwardExpert: {
			authorizationCheck: false,
			execute: determineForwardExpert,
			historyEvent: "EVAL_REQ_EXPERT_FORWARDED",
			isInternal: true
		},
		checkBeforeUpdate: {
			authorizationCheck: false,
			historyEvent: "EVAL_REQ_CHECKED",
			execute: checkBeforeUpdate,
			isStatic: true
		}
	},
	Root: {
		table: "sap.ino.db.evaluation::t_evaluation_request",
		sequence: "sap.ino.db.evaluation::s_evaluation_request",
		historyTable: "sap.ino.db.evaluation::t_evaluation_request_h",
		determinations: {
			onCreate: [initEvaluationRequest],
			onModify: [determine.systemAdminData, determineEvalReqItems, determineAuthorExpert],
			onPersist: []
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			IDEA_ID: {
				foreignKeyTo: "sap.ino.xs.object.idea.Idea.Root",
				readOnly: check.readOnlyAfterCreateCheck(EvalMessage.EVAL_REQ_UNCHANGEABLE)
			},
			DESCRIPTION: {},
			IDEA_PHASE_CODE: {
				foreignKeyTo: "sap.ino.xs.object.campaign.Phase.Root",
				readOnly: check.readOnlyAfterCreateCheck(EvalMessage.EVAL_REQ_UNCHANGEABLE)
			},
			ACCEPT_DATE: {

			},
			COMPLETE_DATE: {

			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			COMMENT_COUNT: {
				readOnly: true
			}
		},
		nodes: {
			EvaluationRequestItems: {
				table: "sap.ino.db.evaluation::t_evaluation_request_item",
				sequence: "sap.ino.db.evaluation::s_evaluation_request_item",
				historyTable: "sap.ino.db.evaluation::t_evaluation_request_item_h",
				parentKey: "EVAL_REQ_ID",
				readOnly: true,
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					STATUS_CODE: {
						readOnly: true,
						foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
					}
				},
				nodes: {
					Expert: IdentityRole.node(IdentityRole.ObjectType.EvaluationRequestItem, IdentityRole.Role.EvaluationRequestExpert, false)
				}
			},
			Owner: IdentityRole.node(IdentityRole.ObjectType.EvaluationRequest, IdentityRole.Role.EvaluationRequestOwner, true),
			Experts: {
				table: "sap.ino.db.evaluation::t_evaluation_request_experts",
				sequence: "sap.ino.db.evaluation::s_evaluation_request_experts",
				parentKey: "EVAL_REQ_ID",
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			Forwards: {
				table: "sap.ino.db.evaluation::t_evaluation_request_item_forward",
				sequence: "sap.ino.db.evaluation::s_evaluation_request_item_forward",
				parentKey: "EVAL_REQ_ID",
				readOnly: true,
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					EVAL_REQ_ITEM_ID: {
						readOnly: true,
						foreignKeyTo: "sap.ino.xs.object.evaluation.EvaluationRequest.Root"
					},
					TO_IDENTITY: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					},
					FROM_IDENTITY: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			Clarifications: {
				table: "sap.ino.db.evaluation::t_evaluation_request_item_clarification",
				sequence: "sap.ino.db.evaluation::s_evaluation_request_item_clarification",
				parentKey: "EVAL_REQ_ID",
				readOnly: true,
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					EVAL_REQ_ITEM_ID: {
						readOnly: true,
						foreignKeyTo: "sap.ino.xs.object.evaluation.EvaluationRequest.Root"
					},
					TO_IDENTITY: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					},
					CREATED_BY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			}
		}
	}
};

function initEvaluationRequest(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oWorkObject.Owner = [{
		ID: fnNextHandle(),
		IDENTITY_ID: iUserId
    }];
	oWorkObject.COMMENT_COUNT = 0;

	//init eval req items from exprts
	oWorkObject.EvaluationRequestItems = [];
	var aExpertIDs = getAllUsersFromExperts(oWorkObject.Experts, oContext.getHQ());
	aExpertIDs = filterDuplExperts(aExpertIDs, oWorkObject, fnMessage, oContext.getHQ());
	_.each(aExpertIDs, function(iExpertID, iIndex) {
		oWorkObject.EvaluationRequestItems[iIndex] = {
			ID: fnNextHandle(),
			STATUS_CODE: EvaluationRequestItem.Status.Requested,
			Expert: [{
				ID: fnNextHandle(),
				IDENTITY_ID: iExpertID
		    }]
		};
	});
}

function delDueToIdeaDel(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {

	var eval_req_id = oContext.getHQ().statement(
		'select id from "sap.ino.db.evaluation::t_evaluation_request" where IDEA_ID = ? ').execute(oWorkObject.ID);
	if (eval_req_id.length > 0) {
		_.each(eval_req_id, function(evalReqId) {
			oContext.getHQ().statement(
				'delete from "sap.ino.db.evaluation::t_evaluation_request_item_forward" where eval_req_id = ? ').execute(evalReqId.ID);
			oContext.getHQ().statement(
				'delete from "sap.ino.db.evaluation::t_evaluation_request_item_clarification" where eval_req_id = ? ').execute(evalReqId.ID);
				oContext.getHQ().statement(
				'delete from "sap.ino.db.evaluation::t_evaluation_request_experts" where eval_req_id = ? ').execute(evalReqId.ID);
			oContext.getHQ().statement(
				'delete from "sap.ino.db.evaluation::t_evaluation_request_item" where eval_req_id = ? ').execute(evalReqId.ID);
			oContext.getHQ().statement(
				'delete from "sap.ino.db.evaluation::t_evaluation_request" where IDEA_ID = ? ').execute(oWorkObject.ID);
		});
	}
}

function bulkDeleteEvalReqs(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	var oResponse = oBulkAccess.del({
		Root: {}
	}, {
		condition: "IDEA_PHASE_CODE = ? and \
		        ID in (select ID from \"sap.ino.db.evaluation::v_evaluation_request\" where campaign_id = ?)",
		conditionParameters: [oParameters.PHASE_CODE, oParameters.CAMPAIGN_ID]
	});

	addMessage(oResponse.messages);
}

function deleteEnabledCheck(vKey, oWorkObject, addMessage, oContext) {
	for (var i = 0; i < oWorkObject.EvaluationRequestItems.length; i++) {
		if (oWorkObject.EvaluationRequestItems[i].STATUS_CODE !== EvaluationRequestItem.Status.Requested) {
			//if any EvaluationRequestItem have been modified, they shouldn't be delete
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_DELETE_FAILURE, vKey, "Root");
			return;
		}
	}
}

function modifyExecutionCheck(vKey, oChangeRequest, oWorkObject, oPersistedObject, addMessage, oContext) {
	var oHQ = oContext.getHQ();

	for (var i = 0; i < oWorkObject.EvaluationRequestItems.length; i++) {
		if (oWorkObject.EvaluationRequestItems[i].Expert.length !== 1) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_ONLY_ONE_EXPERT, vKey, "EvaluationRequestItems");
			return;
		}
	}

	if (oChangeRequest.ACCEPT_DATE || oChangeRequest.COMPLETE_DATE) {
		//campaign valid date check
		var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
		var oIdea = Idea.read(oWorkObject.IDEA_ID);
		var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
		var oCampaign = Campaign.read(oIdea.CAMPAIGN_ID);

		//create date object
		var dNow = new Date(oContext.getRequestTimestamp());
		dNow.setDate(dNow.getDate() - 1);

		if (oWorkObject.COMPLETE_DATE > oCampaign.VALID_TO ||
			oWorkObject.ACCEPT_DATE > oCampaign.VALID_TO) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.INVALID_EVAL_REQ_CAMP_DATE, vKey, "Root");
		}

		if (oWorkObject.COMPLETE_DATE < oWorkObject.ACCEPT_DATE ||
			new Date(oWorkObject.COMPLETE_DATE) < dNow ||
			new Date(oWorkObject.ACCEPT_DATE) < dNow) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.INVALID_EVAL_REQ_DATE, vKey, "Root");
		}
	}

	if (oChangeRequest.IDEA_PHASE_CODE) {
		var sSelectPhase = 'select top 1 * from "sap.ino.db.idea::t_idea" where id = ? and phase_code = ?';
		var aPhase = oHQ.statement(sSelectPhase).execute(oWorkObject.IDEA_ID, oWorkObject.IDEA_PHASE_CODE);
		if (aPhase.length === 0) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.INVALID_EVAL_REQ_PHASE, vKey, "Root", "IDEA_PHASE_CODE");
		}
	}

	//if there is no vKey, it is a create action
	// 	if (!vKey) {
	// 		var sSelect =
	// 			'select top 1 * from "sap.ino.db.evaluation::t_evaluation_request" \
	//                         where idea_id = ? and idea_phase_code = ?';
	// 		var aResult = oHQ.statement(sSelect).execute(oWorkObject.IDEA_ID, oWorkObject.IDEA_PHASE_CODE);
	// 		if (aResult.length > 0) {
	// 			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_DUPLICATED, vKey, "Root");
	// 		}
	// 	}

	//if there is a vKey, it is a update action
	if (vKey) {
		if (oChangeRequest && (oChangeRequest.DESCRIPTION || oChangeRequest.ACCEPT_DATE || oChangeRequest.COMPLETE_DATE)) {
			var sSelect =
				'select top 1 * from "sap.ino.db.evaluation::t_evaluation_request_item" \
                where eval_req_id = ? and status_code != ?';
			var aResult = oHQ.statement(sSelect).execute(vKey, "sap.ino.config.EVAL_REQ_REQUESTED");
			if (aResult.length > 0) {
				addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_UNCHANGEABLE, vKey, "Root");
			}
		}

		//re-assign Experts
		if (oChangeRequest.Experts && oWorkObject.ACCEPT_DATE < oContext.getRequestTimestamp().substring(0, 10)) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_EXPERT_UNCHANGEABLE, vKey, "Experts");
		}
	}

	if (oWorkObject.Experts.length === 0) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_EXPERTS_MANDATORY, vKey, "Experts");
	}
}

function getAllUsersFromExperts(aExperts, oHQ) {
	if (aExperts.length === 0) {
		return [];
	}

	var aIdentities = _.pluck(aExperts, 'IDENTITY_ID');
	var sSelect =
		'select distinct member_id as identity_id from "sap.ino.db.iam::v_group_member_transitive" \
                    where group_id in (' +
		aIdentities.join(',') + ") and TYPE_CODE = ?";
	var aUsers = oHQ.statement(sSelect).execute("USER");

	return _.pluck(aUsers, 'IDENTITY_ID');
}

function determineEvalReqItems(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();

	//if it's a update action, checck reassign items
	if (oPersistedObject && oContext.getHistoryEvent() !== "EVAL_REQ_EXPERT_FORWARDED") {
		var aOriginExpertIDs = getAllUsersFromExperts(oPersistedObject.Experts, oHQ);
		var aNewExpertIDs = getAllUsersFromExperts(oWorkObject.Experts, oHQ);
		var aNeedToAddExpertIDs = _.difference(aNewExpertIDs, aOriginExpertIDs);
		var aNeedToDelExpertIDs = _.difference(aOriginExpertIDs, aNewExpertIDs);
		aNeedToAddExpertIDs = filterDuplExperts(aNeedToAddExpertIDs, oWorkObject, addMessage, oHQ);

		oWorkObject.EvaluationRequestItems = _.reject(oWorkObject.EvaluationRequestItems, function(oEvalReqItem) {
			return _.find(aNeedToDelExpertIDs, function(iExpertID) {
				return oEvalReqItem.Expert[0].IDENTITY_ID === iExpertID;
			});
		});

		_.each(aNeedToAddExpertIDs, function(iExpertID) {
			oWorkObject.EvaluationRequestItems.push({
				ID: getNextHandle(),
				STATUS_CODE: EvaluationRequestItem.Status.Requested,
				Expert: [{
					ID: getNextHandle(),
					IDENTITY_ID: iExpertID
			    }]
			});
		});
	}

	if (oWorkObject.EvaluationRequestItems.length >= 10) {
		addMessage(Message.MessageSeverity.Warning, EvalMessage.EVAL_REQ_EXPERT_WARNING, vKey, "Experts");
	}
}

//if the experts contain idea author or co-authors, self-evaluation of idea phase check
function determineAuthorExpert(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oIdea = Idea.read(oWorkObject.IDEA_ID);
	var aIdeaAuthors = _.union(_.pluck(oIdea.Submitter, 'IDENTITY_ID'), _.pluck(oIdea.Contributors, 'IDENTITY_ID'));
	var aDifferentExperts = _.difference(_.pluck(oWorkObject.Experts, 'IDENTITY_ID'), aIdeaAuthors);

	if (aDifferentExperts.length !== oWorkObject.Experts.length) {
		//at least one expert is the idea author
		var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
		var oCampaign = Campaign.read(oIdea.CAMPAIGN_ID);
		var oEvalPhase = _.find(oCampaign.Phases, function(oPhase) {
			return oPhase.PHASE_CODE === oWorkObject.IDEA_PHASE_CODE;
		});

		if (!oEvalPhase.SELF_EVALUATION_ACTIVE) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_INVALID_EXPERT);
		}
	}
}

//if there is a Evaluation Request which is the same idea and phase, filter the Experts and give a warning message
function filterDuplExperts(aExpertIDs, oWorkObject, addMessage, oHQ) {
	if (aExpertIDs.length === 0) {
		return [];
	}

	var sSelect =
		'select identity_id from "sap.ino.db.evaluation::v_evaluation_request_item" as eval_req_item\
                    left outer join "sap.ino.db.iam::t_object_identity_role" as role\
                    on role.role_code = ? and role.object_id = eval_req_item.id\
                    where idea_id = ? and idea_phase_code = ?';
	var aResult = oHQ.statement(sSelect).execute('EVAL_REQUEST_EXPERT', oWorkObject.IDEA_ID, oWorkObject.IDEA_PHASE_CODE);
	var aExistedExpertIDs = _.pluck(aResult, 'IDENTITY_ID');
	var aDuplicatedExpertIDs = _.intersection(aExpertIDs, aExistedExpertIDs);

	//need to add a warning message
	if (aDuplicatedExpertIDs.length > 0) {
		var sSelectNames = 'select name from "sap.ino.db.iam::t_identity" where id in (' + aDuplicatedExpertIDs.join(',') + ')';
		var sDuplicateNames = _.pluck(oHQ.statement(sSelectNames).execute(), 'NAME').join(', ');
		addMessage(Message.MessageSeverity.Warning, EvalMessage.EVAL_REQ_DUPLICATED_EXPERTS, oWorkObject.ID, "Experts", "IDENTITY_ID",
			sDuplicateNames);
	}

	return _.difference(aExpertIDs, aDuplicatedExpertIDs);
}

function sendClarification(vKey, oParameters, oEvalReq, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.CONTENT || !oParameters.EVAL_REQ_ITEM_ID || !oParameters.TO_IDENTITY) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_CLARIFICATION, vKey);
	} else {
		var EvalReqItem = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
		EvalReqItem.sendClarification(oParameters.EVAL_REQ_ITEM_ID, {
			CONTENT: oParameters.CONTENT,
			TO_IDENTITY: oParameters.TO_IDENTITY
		});
	}
}

function determineForwardExpert(vKey, oParameters, oEvalReq, addMessage, getNextHandle, oContext) {
	//determine the Evaluation Request Rxperts
	var oFoundExpert = _.find(oEvalReq.Experts, function(oExpert) {
		return oExpert.IDENTITY_ID == oContext.getUser().ID;
	});

	if (oFoundExpert) {
		oFoundExpert.IDENTITY_ID = oParameters.EXPERT_ID;
	} else {
		oEvalReq.Experts.push({
			ID: getNextHandle(),
			IDENTITY_ID: oParameters.EXPERT_ID
		});
	}
}

function createEnabledCheck(vKey, oEvalReq, addMessage, oContext) {
	if (!oEvalReq.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CREATE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "IDEA_ID", oEvalReq.IDEA_ID);
	} else {
		var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
		var oIdea = Idea.read(oEvalReq.IDEA_ID);
		if (!oIdea || status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CREATE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "IDEA_ID", oEvalReq.IDEA_ID);
		}
	}

	var oHQ = oContext.getHQ();
	var bSystemEvalReqActive = parseInt(SystemSettings.getValue("sap.ino.config.EVAL_REQ_ACTIVE", oHQ), 10);
	if (!bSystemEvalReqActive) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.SYSTEM_EVAL_REQ_UNACTIVE, vKey);
		return;
	}
}

function getExistedEvaluation(aExpertIDs, iIdeaID, sIdeaPhaseCode, oHQ) {
	if (aExpertIDs.length === 0) {
		return [];
	}

	var sSelect =
		'select * from "sap.ino.db.evaluation::t_evaluation" \
        where idea_id = ? and idea_phase_code = ? \
        and created_by_id in (' +
		aExpertIDs.join(",") + ")";
	var aResult = oHQ.statement(sSelect).execute(iIdeaID, sIdeaPhaseCode);

	return aResult;
}

function checkBeforeUpdate(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	oParameters.Experts = _.filter(oParameters.Experts, function(oExpert) {
		return oExpert.ID < 0;
	});
	var aExpertIDs = getAllUsersFromExperts(oParameters.Experts, oHQ);

	var aExperts = filterDuplExperts(aExpertIDs, oParameters, addMessage, oHQ);
	var aEvaluation = getExistedEvaluation(aExpertIDs, oParameters.IDEA_ID, oParameters.IDEA_PHASE_CODE, oHQ);

	var aResult = [];
	if (aExpertIDs.length > 10) {
		aResult.push('EXPERT_AMOUNT_WARNING');
	}
	if (aExpertIDs.length !== aExperts.length) {
		//push duplicated expert names to frontend
		var aDuplExperts = _.difference(aExpertIDs, aExperts);
		var sSelectNames = 'select name from "sap.ino.db.iam::t_identity" where id in (' + aDuplExperts.join(',') + ')';
		var aNames = _.pluck(oHQ.statement(sSelectNames).execute(), 'NAME');
		aResult.push({
			MSG_CODE: 'DUPLICATED_EXPERT_WARNING',
			DuplExperts: aNames
		});
	}
	if (aEvaluation.length > 0) {
		aResult.push('EXISTED_EVALUATION_WARNING');
	}

	return aResult;
}