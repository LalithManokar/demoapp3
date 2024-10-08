var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var EvalMessage = $.import("sap.ino.xs.object.evaluation", "message");

var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

var auth = $.import("sap.ino.xs.aof.lib", "authorization");

var Status = this.Status = {
	Requested: "sap.ino.config.EVAL_REQ_REQUESTED",
	Accepted: "sap.ino.config.EVAL_REQ_ACCEPTED",
	Rejected: "sap.ino.config.EVAL_REQ_REJECTED",
	InProcess: "sap.ino.config.EVAL_REQ_IN_PROCESS",
	InClarification: "sap.ino.config.EVAL_REQ_IN_CLARIFICATION",
	Completed: "sap.ino.config.EVAL_REQ_COMPLETED",
	Expired: "sap.ino.config.EVAL_REQ_EXPIRED"
};

var StatusAction = this.StatusAction = {
	Accept: "sap.ino.config.EVAL_REQ_ACCEPT",
	Reject: "sap.ino.config.EVAL_REQ_REJECT",
	StartProcess: "sap.ino.config.EVAL_REQ_START_PROCESS",
	AskForClari: "sap.ino.config.EVAL_REQ_ASK_FOR_CLARI",
	ReturnToRequest: "sap.ino.config.EVAL_REQ_RET_TO_REQUEST",
	Complete: "sap.ino.config.EVAL_REQ_COMPLETE",
	Expire: "sap.ino.config.EVAL_REQ_EXPIRE"
};

this.definition = {
	actions: {
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_item_update", "EVAL_REQ_ITEM_ID",
				EvalMessage.AUTH_MISSING_EVAL_REQ_ITEM_UPDATE),
			executionCheck: modifyExecutionCheck,
			historyEvent: "EVAL_REQ_ITEM_UPDATED"
		},
		executeStatusTransition: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_item_status_transition",
				"EVAL_REQ_ITEM_ID", EvalMessage.AUTH_MISSING_EVAL_REQ_ITEM_STATUS_TRANS),
			execute: executeStatusTransition,
			historyEvent: "EVAL_REQ_ITEM_STATUS_ACTION",
			enabledCheck: executeStatusTransitionEnabledCheck
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_item_read", "EVAL_REQ_ITEM_ID",
				EvalMessage.AUTH_MISSING_EVAL_REQ_ITEM_READ)
		},
		forward: {
			authorizationCheck: false,
			execute: forward,
			historyEvent: "EVAL_REQ_ITEM_FORWARDED",
			enabledCheck: forwardEnabledCheck
		},
		sendClarification: {
			authorizationCheck: false,
			execute: sendClarification,
			historyEvent: "EVAL_REQ_ITEM_CLARIFICATION_SENT",
			enabledCheck: sendClarificationEnabledCheck
		},
		bulkExpireItems: {
			authorizationCheck: false,
			execute: bulkExpireItems,
			historyEvent: "EVAL_REQ_ITEM_EXPIRED",
			isStatic: true,
			isInternal: true
		},
		bulkJobExpireItems: {
			authorizationCheck: false,
			execute: bulkJobExpireItems,
			historyEvent: "EVAL_REQ_ITEM_EXPIRED",
			isStatic: true
		},
		bulkDeleteItems: {
			authorizationCheck: false,
			execute: bulkDeleteItems,
			historyEvent: "EVAL_REQ_ITEM_BULK_DELETED",
			isStatic: true
		},
		del: {
			authorizationCheck: false,
			historyEvent: "EVAL_REQ_ITEM_DELETED",
			isInternal: true
		}
	},
	Root: {
		table: "sap.ino.db.evaluation::t_evaluation_request_item",
		sequence: "sap.ino.db.evaluation::s_evaluation_request_item",
		historyTable: "sap.ino.db.evaluation::t_evaluation_request_item_h",
		determinations: {
			onModify: [determine.systemAdminData],
			onPersist: []
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			EVAL_REQ_ID: {
				foreignKeyTo: "sap.ino.xs.object.evaluation.EvaluationRequest.Root",
				readOnly: check.readOnlyAfterCreateCheck(EvalMessage.EVAL_REQ_UNCHANGEABLE)

			},
			STATUS_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
			}
		},
		nodes: {
			Expert: IdentityRole.node(IdentityRole.ObjectType.EvaluationRequestItem, IdentityRole.Role.EvaluationRequestExpert, true),
			Forwards: {
				table: "sap.ino.db.evaluation::t_evaluation_request_item_forward",
				sequence: "sap.ino.db.evaluation::s_evaluation_request_item_forward",
				parentKey: "EVAL_REQ_ITEM_ID",
				readOnly: true,
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					EVAL_REQ_ID: {
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
				parentKey: "EVAL_REQ_ITEM_ID",
				readOnly: true,
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					EVAL_REQ_ID: {
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

function executeStatusTransition(vKey, oParameters, oEvalReqItem, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.STATUS_ACTION_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_STATUS_TRANSITION, vKey);
	}

	var sStatusActionCode = oParameters.STATUS_ACTION_CODE;

	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
	                    from "sap.ino.db.evaluation::v_evaluation_requests_status_transition" \
	                    where id = ? and status_action_code = ?'
	).execute(vKey, sStatusActionCode);

	_executeStatusTransition(vKey, aStatusTransition, oEvalReqItem, addMessage, oContext);

	//auto assign expert to the idea
	if (oParameters.STATUS_ACTION_CODE === StatusAction.Accept) {
		assignIdeaExpert(oEvalReqItem, oContext);
	}
}

function _executeStatusTransition(vKey, aStatusTransition, oEvalReqItem, addMessage, oContext) {
	if (_.size(aStatusTransition) !== 1) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_STATUS_TRANSITION, vKey);
		return;
	}
	var oStatusTransition = _.first(aStatusTransition);
	oEvalReqItem.STATUS_CODE = oStatusTransition.NEXT_STATUS_CODE;
	oContext.setHistoryEvent("STATUS_ACTION_" + oStatusTransition.STATUS_ACTION_CODE);
}

function executeStatusTransitionEnabledCheck(vKey, oEvalReqItem, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                    from "sap.ino.db.evaluation::v_evaluation_requests_status_transition" \
                    where id = ?'
	).execute(vKey);
	if (aStatusTransition.length === 0) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_NO_STATUS_TRANSITIONS, vKey);
	}
}

function modifyExecutionCheck(vKey, oChangeRequest, oWorkObject, oPersistedObject, addMessage, oContext) {
	if (oWorkObject.Expert.length !== 1) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_ONLY_ONE_EXPERT, vKey, "Expert");
	}
}

function getIdeaInstance(oWorkObject) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var EvalReq = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequest");

	var oEvalReq = EvalReq.read(oWorkObject.EVAL_REQ_ID);
	var oIdea = Idea.read(oEvalReq.IDEA_ID);

	return oIdea;
}

function getEvalReqInstance(oWorkObject) {
	var EvalReq = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequest");
	var oEvalReq = EvalReq.read(oWorkObject.EVAL_REQ_ID);

	return oEvalReq;
}

function checkIsIdeaEvalCreater(oIdea, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect =
		'select top 1 * from "sap.ino.db.evaluation::v_evaluation_creater" \
                    where idea_id = ? and identity_id = ?';
	var aResult = oHQ.statement(sSelect).execute(oIdea.ID, oContext.getUser().ID);
	var bIsIdeaEvalCreater = aResult.length > 0;

	return bIsIdeaEvalCreater;
}

function assignIdeaExpert(oWorkObject, oContext) {
	var oIdea = getIdeaInstance(oWorkObject);
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");

	if (!checkIsIdeaEvalCreater(oIdea, oContext)) {
		//assign the user to idea expert if he is a Eval Creater
		Idea.evalReqAssignExpert(oIdea.ID, {
			IDENTITY_ID: oContext.getUser().ID
		});
	}
}

function unassignIdeaExpert(oWorkObject, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oIdea = getIdeaInstance(oWorkObject);

	Idea.evalReqUnassignExpert(oIdea.ID, {
		IDENTITY_ID: oContext.getUser().ID
	});
}

function determineIdeaExpert(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oPersistedObject.Expert[0].IDENTITY_ID !== oWorkObject.Expert[0].IDENTITY_ID) {
		//if the Expert has been changed, it is a forward action
		unassignIdeaExpert(oWorkObject, oContext);
	}
}

function forward(vKey, oParameters, oEvalReqItem, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.EXPERT_ID) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_FOWARD_INVALID_EXPERT, vKey);
	} else {
		//check if the expert has been assigned to a evaluation_request_item
		var oHQ = oContext.getHQ();
		var sSelect =
			'select top 1 * from "sap.ino.db.evaluation::v_evaluation_request_item" \
	                    where eval_req_id = ? and expert_id = ?';
		var aResult = oHQ.statement(sSelect).execute(oEvalReqItem.EVAL_REQ_ID, oParameters.EXPERT_ID);

		if (aResult.length > 0) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_FORWARD_WITH_DUPLICATE_EXPERTS, vKey);
			return;
		}

		//check if the expert is the idea author or co-author
		var oIdea = getIdeaInstance(oEvalReqItem);
		var aIdeaAuthors = _.union(_.pluck(oIdea.Submitter, 'IDENTITY_ID'), _.pluck(oIdea.Contributors, 'IDENTITY_ID'));
		if (_.find(aIdeaAuthors, function(iAuthor) {
			return iAuthor == oParameters.EXPERT_ID;
		})) {
			var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
			var oCampaign = Campaign.read(oIdea.CAMPAIGN_ID);
			var oEvalReq = getEvalReqInstance(oEvalReqItem);
			var oEvalPhase = _.find(oCampaign.Phases, function(oPhase) {
				return oPhase.PHASE_CODE === oEvalReq.IDEA_PHASE_CODE;
			});

			if (!oEvalPhase.SELF_EVALUATION_ACTIVE) {
				addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_FOWARD_INVALID_EXPERT);
			} 
		}

		oEvalReqItem.STATUS_CODE = Status.Requested;
		oEvalReqItem.Expert = [{
			ID: getNextHandle(),
			IDENTITY_ID: oParameters.EXPERT_ID
	    }];

		oEvalReqItem.Forwards.push({
			ID: getNextHandle(),
			EVAL_REQ_ID: oEvalReqItem.EVAL_REQ_ID,
			FROM_IDENTITY: oContext.getUser().ID,
			TO_IDENTITY: oParameters.EXPERT_ID,
			FORWARDED_AT: oContext.getRequestTimestamp(),
			COMMENT_FORWARD: oParameters.COMMENT_FORWARD || ''
		});

		//determine the Evaluation Request Rxperts
		var EvalReq = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequest");
		EvalReq.determineForwardExpert(oEvalReqItem.EVAL_REQ_ID, {
			EXPERT_ID: oParameters.EXPERT_ID
		});
	}
}

function forwardEnabledCheck(vKey, oEvalReqItem, addMessage, oContext) {
	var oEvalReq = getEvalReqInstance(oEvalReqItem);
	if (oEvalReq.ACCEPT_DATE < oContext.getRequestTimestamp().substring(0, 10)) {
		//if the accept time was over, evaluation request couldn't be forwarded
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_FORWARD_WITH_INVALID_DATE, vKey);
	}

	if (oEvalReqItem.STATUS_CODE === Status.Rejected ||
		oEvalReqItem.STATUS_CODE === Status.Completed ||
		oEvalReqItem.STATUS_CODE === Status.Expired) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_FORWARD_WITH_INVALID_STATUS, vKey);
	}
}

function sendClarification(vKey, oParameters, oEvalReqItem, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.CONTENT || !oParameters.TO_IDENTITY) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_CLARIFICATION, vKey);
	} else {
		var oEvalReq = getEvalReqInstance(oEvalReqItem);
		var iOwnerId = oEvalReq.Owner[0].IDENTITY_ID;
		var iExpertId = oEvalReqItem.Expert[0].IDENTITY_ID;
		if ((oContext.getUser().ID != iOwnerId && oContext.getUser().ID != iExpertId) || (oParameters.TO_IDENTITY != iOwnerId && oParameters.TO_IDENTITY !=
			iExpertId)) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_CLARIFICATION, vKey);
		} else if (oContext.getUser().ID == iOwnerId) {
			oEvalReqItem.STATUS_CODE = Status.Requested;
			oEvalReqItem.Clarifications.push({
				ID: getNextHandle(),
				EVAL_REQ_ID: oEvalReqItem.EVAL_REQ_ID,
				CONTENT: oParameters.CONTENT,
				TO_IDENTITY: iExpertId,
				CREATED_BY_ID: iOwnerId,
				CREATED_AT: oContext.getRequestTimestamp()
			});
		} else {
			oEvalReqItem.STATUS_CODE = Status.InClarification;
			oEvalReqItem.Clarifications.push({
				ID: getNextHandle(),
				EVAL_REQ_ID: oEvalReqItem.EVAL_REQ_ID,
				CONTENT: oParameters.CONTENT,
				TO_IDENTITY: iOwnerId,
				CREATED_BY_ID: iExpertId,
				CREATED_AT: oContext.getRequestTimestamp()
			});
		}
	}
}

function sendClarificationEnabledCheck(vKey, oEvalReqItem, addMessage, oContext) {
	if (oEvalReqItem.STATUS_CODE !== Status.Requested && oEvalReqItem.STATUS_CODE !== Status.InClarification) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_INVALID_CLARIFICATION, vKey);
	}
}

function bulkExpireItems(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	var oResponse = oBulkAccess.update({
		Root: {
			STATUS_CODE: Status.Expired,
			CHANGED_BY_ID: oContext.getUser().ID,
			CHANGED_AT: oContext.getRequestTimestamp()
		}
	}, {
		condition: "ID in \
		    (select id from \"sap.ino.db.evaluation::v_evaluation_request_item\" \
		    where idea_id = ? and idea_phase_code = ? \
		    and status_code != 'sap.ino.config.EVAL_REQ_REJECTED' \
		    and status_code != 'sap.ino.config.EVAL_REQ_COMPLETED' \
		    and status_code != 'sap.ino.config.EVAL_REQ_EXPIRED')",
		conditionParameters: [oParameters.IDEA_ID, oParameters.IDEA_PHASE_CODE]
	});

	addMessage(oResponse.messages);
}

function bulkJobExpireItems(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	var oResponse = oBulkAccess.update({
		Root: {
			STATUS_CODE: Status.Expired,
			CHANGED_BY_ID: oContext.getUser().ID,
			CHANGED_AT: oContext.getRequestTimestamp()
		}
	}, {
		condition: "ID in \
		    (select id from \"sap.ino.db.evaluation::v_expired_evaluation_request_item\")",
		conditionParameters: []
	}, false);

	addMessage(oResponse.messages);
}

function bulkDeleteItems(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.EVAL_REQ_ITEM_ID && oParameters.EVAL_REQ_ITEM_ID.length > 0) {
		var oHQ = oContext.getHQ();
		var sSelect =
			'select distinct eval_req_id \
                from "sap.ino.db.evaluation::t_evaluation_request_item" \
                where id in (' +
			oParameters.EVAL_REQ_ITEM_ID.join(",") + ')';
		var aPersistedResult = oHQ.statement(sSelect).execute();
		var aPersistedEvalReq = _.pluck(aPersistedResult, 'EVAL_REQ_ID');

		var EvalReqItem = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
		_.each(oParameters.EVAL_REQ_ITEM_ID, function(iEvalReqItem) {
			EvalReqItem.del(iEvalReqItem);
		});

		var sSelectEvalReq =
			'select distinct eval_req_id \
                from "sap.ino.db.evaluation::t_evaluation_request_item" \
                where eval_req_id in (' +
			aPersistedEvalReq.join(",") + ')';

		var aResult = oHQ.statement(sSelectEvalReq).execute();
		var aEvalReq = _.pluck(aResult, 'EVAL_REQ_ID');

		var aDeleteEvalReq = _.difference(aPersistedEvalReq, aEvalReq);
		if (aDeleteEvalReq.length > 0) {
			var EvalReq = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequest");
			_.each(aDeleteEvalReq, function(iEvalReq) {
				EvalReq.del(iEvalReq);
			});
		}

		//addMessage(oResponse.messages);
	} else {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVAL_REQ_ITEM_BULK_DELETE_PARAMETER_REQUIRED);
	}
}