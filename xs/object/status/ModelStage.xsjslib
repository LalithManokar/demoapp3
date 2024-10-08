var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var MessageSeverity = $.import("sap.ino.xs.aof.lib", "message").MessageSeverity;
var StatusMessage = $.import("sap.ino.xs.object.status", "message");
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var StatusModel = $.import("sap.ino.xs.object.status", "Status");
var util = $.import("sap.ino.xs.aof.config", "util");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		create: {
			authorizationCheck: false,
			executionCheck: createExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck
		},
		copy: {
			authorizationCheck: false,
			executionCheck: createExecutionCheck,
			enabledCheck: configCheck.configAvailableCheck
		},
		update: {
			authorizationCheck: false,
			executionCheck: updateExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck,
			customProperties: updateCustomProperties
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			executionCheck: isBeingUsedCheck,
			enabledCheck: deleteEnableCheck
		}
	},
	Root: {
		table: "sap.ino.db.status::t_status_model_stage",
		sequence: "sap.ino.db.status::s_status_model",
		customProperties: {
			fileName: "t_status_model",
			contentOnlyInRepository: false
		},
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			// onCopy : [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
			onModify: [configDetermine.determinePackageAndCode, determine.systemAdminData, addBusinessData],
			onPersist: [configDetermine.activateContent]
		},
		// activationCheck : activationCheck,
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			CODE: {
				readOnly: true
			},
			PACKAGE_ID: {
				readOnly: true
			},
			PLAIN_CODE: {
				required: true,
				consistencyChecks: [configCheck.validPlainCodeCheck]
			},
			DEFAULT_TEXT: {
				required: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		},
		nodes: {
			Transitions: {
				table: "sap.ino.db.status::t_status_model_transition_stage",
				sequence: "sap.ino.db.status::s_status_model_transition",
				customProperties: {
					fileName: "t_status_model_transition"
				},
				parentKey: "MODEL_ID",
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					DECISION_REASON_LIST_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.Root"
					},
					TEXT_MODULE_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.TextModule.Root"
					}
				}
			}
		}
	}
};

var StatusAction = {
	NextPhase: "sap.ino.config.START_NEXT_PHASE",
	PrevPhase: "sap.ino.config.RESTART_PREV_PHASE",
	RestartPhase: "sap.ino.config.RESTART_PHASE"
};

var Status = {
	Draft: "sap.ino.config.DRAFT",
	NewInPhase: "sap.ino.config.NEW_IN_PHASE"
};

function activationCheck(oPersistedObject, oWorkObject, addMessage) {
	if (oWorkObject.OBJECT_TYPE_CODE !== "IDEA") {
		return;
	}

	var aTransition = oWorkObject.Transitions || [];
	var aContainsDraft = _.filter(aTransition, function(oTransition) {
		return (oTransition.CURRENT_STATUS_CODE === Status.Draft || oTransition.NEXT_STATUS_CODE === Status.Draft);
	});

	_.each(aContainsDraft, function(oTransition) {
		addMessage(MessageSeverity.Error, StatusMessage.INVALID_DRAFT_USAGE, oTransition.CODE, "Transitions");
	});

	var aCurrentStatus = [];
	var aNextStatus = [];
	var bHasNextPhaseAction = false;

	_.each(oWorkObject.Transitions, function(oTransition) {
		aCurrentStatus.push(oTransition.CURRENT_STATUS_CODE);
		aNextStatus.push(oTransition.NEXT_STATUS_CODE);

		if (oTransition.STATUS_ACTION_CODE === StatusAction.NextPhase) {
			bHasNextPhaseAction = true;
		}

		// if the action is "START_NEXT_PHASE" || "RESTART_PREV_PHASE" || "RESTART_PHASE"
		// the next status must be initial status
		if ((oTransition.STATUS_ACTION_CODE === StatusAction.NextPhase || oTransition.STATUS_ACTION_CODE === StatusAction.PrevPhase ||
			oTransition.STATUS_ACTION_CODE === StatusAction.RestartPhase) && !StatusModel.isInitialStatus(oTransition.NEXT_STATUS_CODE)) {

			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_INITIAL_STATUS_MODEL, oTransition.CODE, "Transitions",
				"STATUS_ACTION_CODE", oTransition.NEXT_STATUS_CODE);
		}
	});

	// each status model can only have one initital status
	var aInitialStatus = [];
	_.each(aCurrentStatus, function(sStatus) {
		if (StatusModel.isInitialStatus(sStatus) && _.indexOf(aInitialStatus, sStatus) === -1) {
			aInitialStatus.push(sStatus);
		}
	});

	if (aTransition.length > 0 && aInitialStatus.length === 0) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.INITIAL_STATUS_MISSING, oWorkObject.CODE, "Root");
	}

	if (aInitialStatus.length > 1) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.TOO_MANY_NEW_STATUS, oWorkObject.CODE, "Root");
	}

	// besides initial status, all current status should be maintained in next status collection
	_.each(aCurrentStatus, function(sStatus, iIndex) {
		if (_.indexOf(aNextStatus, sStatus) === -1) {
			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_CURRENT_STATUS_MODEL, oWorkObject.Transitions[iIndex].CODE,
				"Transitions", "CURRENT_STATUS_CODE", sStatus);
		}
	});

	// all next status should be maintained in current status collection
	_.each(aNextStatus, function(sStatus, iIndex) {
		if (_.indexOf(aCurrentStatus, sStatus) === -1) {
			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_NEXT_STATUS_MODEL, oWorkObject.Transitions[iIndex].CODE, "Transitions",
				"NEXT_STATUS_CODE", sStatus);
		}
	});

	// each status model should have a "next phase" action
	if (oWorkObject.Transitions && oWorkObject.Transitions.length > 0 && !bHasNextPhaseAction) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.NEED_START_NEXT_PHASE_ACTION, oWorkObject.CODE, "Transitions",
			"STATUS_ACTION_CODE");
	}
}

function deleteEnableCheck(vKey, oPersistedObject, addMessage, oContext) {

	configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
	isBeingUsedCheck(vKey, null, null, oPersistedObject, addMessage, oContext);
}

function isModelUsed(sCode, oHQ) {
	return configUtil.isCodeUsed("sap.ino.xs.object.status.Model", "Root", sCode, oHQ);
}

function validateTransitions(oWorkObject, addMessage, vKey) {
	var aTransition = oWorkObject.Transitions || [];
	var aContainsDraft = _.filter(aTransition, function(oTransition) {
		return (oTransition.CURRENT_STATUS_CODE === Status.Draft || oTransition.NEXT_STATUS_CODE === Status.Draft);
	});

	_.each(aContainsDraft, function(oTransition) {
		addMessage(MessageSeverity.Error, StatusMessage.INVALID_DRAFT_USAGE, oTransition.CODE, "Transitions");
	});

	var aCurrentStatus = [];
	var aNextStatus = [];
	var bHasNextPhaseAction = false;

	_.each(oWorkObject.Transitions, function(oTransition) {
		aCurrentStatus.push(oTransition.CURRENT_STATUS_CODE);
		aNextStatus.push(oTransition.NEXT_STATUS_CODE);

		if (oTransition.STATUS_ACTION_CODE === StatusAction.NextPhase) {
			bHasNextPhaseAction = true;
		}

		// if the action is "START_NEXT_PHASE" || "RESTART_PREV_PHASE" || "RESTART_PHASE"
		// the next status must be initial status
		if ((oTransition.STATUS_ACTION_CODE === StatusAction.NextPhase || oTransition.STATUS_ACTION_CODE === StatusAction.PrevPhase ||
			oTransition.STATUS_ACTION_CODE === StatusAction.RestartPhase) && !StatusModel.isInitialStatus(oTransition.NEXT_STATUS_CODE)) {

			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_INITIAL_STATUS_MODEL, vKey, "Transitions", "STATUS_ACTION_CODE",
				oTransition.NEXT_STATUS_CODE);
		}
	});

	// each status model can only have one initital status
	var aInitialStatus = [];
	_.each(aCurrentStatus, function(sStatus) {
		if (StatusModel.isInitialStatus(sStatus) && _.indexOf(aInitialStatus, sStatus) === -1) {
			aInitialStatus.push(sStatus);
		}
	});

	if (aTransition.length > 0 && aInitialStatus.length === 0) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.INITIAL_STATUS_MISSING, oWorkObject.CODE, "Root");
	}

	if (aInitialStatus.length > 1) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.TOO_MANY_NEW_STATUS, oWorkObject.CODE, "Root");
	}

	// besides initial status, all current status should be maintained in next status collection
	_.each(aCurrentStatus, function(sStatus, iIndex) {
		if (_.indexOf(aNextStatus, sStatus) === -1) {
			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_CURRENT_STATUS_MODEL, oWorkObject.Transitions[iIndex].CODE,
				"Transitions", "CURRENT_STATUS_CODE", sStatus);
		}
	});

	// all next status should be maintained in current status collection
	_.each(aNextStatus, function(sStatus, iIndex) {
		if (_.indexOf(aCurrentStatus, sStatus) === -1) {
			addMessage(Message.MessageSeverity.Error, StatusMessage.INVALID_NEXT_STATUS_MODEL, oWorkObject.Transitions[iIndex].CODE, "Transitions",
				"NEXT_STATUS_CODE", sStatus);
		}
	});

	// each status model should have a "next phase" action
	if (oWorkObject.Transitions && oWorkObject.Transitions.length > 0 && !bHasNextPhaseAction) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.NEED_START_NEXT_PHASE_ACTION, oWorkObject.CODE, "Transitions",
			"STATUS_ACTION_CODE");
	}
}

function checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
	if (!oPersistedObject) {
		return;
	}
	var oWo = oPersistedObject.Transitions || [];
	var oPo = oPersistedObject.Transitions || [];
	if (oWo.length > 0) {
		oWo.sort(function(a, b) {
			return a.SEQUENCE_NO - b.SEQUENCE_NO;
		});
	}
	if (oPo.length > 0) {
		oPo.sort(function(a, b) {
			return a.SEQUENCE_NO - b.SEQUENCE_NO;
		});
	}
	var bIsEqual = _.isEqualOmit(oWo, oPo, ["DECISION_REASON_LIST_CODE", "DECISION_REASON_LIST_VISIBLE",
		"DECISION_RELEVANT", "INCLUDE_RESPONSE", "TEXT_MODULE_CODE"]);
	var bModelUsed = isModelUsed(oPersistedObject.CODE, oHQ);

	if (!bIsEqual && bModelUsed) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.STATUS_MODEL_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
		return;
	}

	// add check for validing transition
	validateTransitions(oWorkObject, addMessage, vKey);
}

function isBeingUsedCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	if (!oPersistedObject) {
		return;
	}
	var bModelUsed = isModelUsed(oPersistedObject.CODE, oContext.getHQ());

	if (bModelUsed) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.STATUS_MODEL_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oContext.getHQ());
}

function createExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {

	validateTransitions(oWorkObject, addMessage, vKey);
}

function getMaxTransitionCodeNum(oHQ) {
	var oConfigPackage = util.getConfigPackage(oHQ);
	var sCustomPackageId = oConfigPackage ? oConfigPackage.PACKAGE_ID : undefined;
	if (sCustomPackageId) {
		var oMaxCode = oHQ.statement(
			'select max(TO_INTEGER(SUBSTRING(code, ?))) as max_code from "sap.ino.db.status::t_status_model_transition_stage" \
                    where package_id = ?'
		).execute(sCustomPackageId.length + 2, sCustomPackageId);
		return oMaxCode.length > 0 ? oMaxCode[0].MAX_CODE : 0;
	}
}

function addBusinessData(vKey, oWorkObject, oPersistedObject, fnMessage, fnHandle, oContext) {
	if (oContext.getAction().name !== 'create' && oContext.getAction().name !== 'update' && oContext.getAction().name !== 'copy') {
		return;
	}
	var oHQ = oContext.getHQ();
	var oConfigPackage = util.getConfigPackage(oHQ);
	if (oWorkObject.ID < 0) {
		oWorkObject.OBJECT_TYPE_CODE = "IDEA";
	}
	var iMaxTransitionCode = getMaxTransitionCodeNum(oHQ);
	_.each(oWorkObject.Transitions, function(oTransition, idx) {
		if (oTransition.ID < 0) {
			oTransition.PACKAGE_ID = oConfigPackage.PACKAGE_ID;
			oTransition.PLAIN_CODE = (iMaxTransitionCode + idx + 1) + "";
			oTransition.CODE = oConfigPackage.PACKAGE_ID + "." + oTransition.PLAIN_CODE;
		}
		if (oTransition.STATUS_MODEL_CODE !== oWorkObject.CODE) {
			oTransition.STATUS_MODEL_CODE = oWorkObject.CODE;
		}
	});
}

function updateCustomProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	return {
		bModelUsed: isModelUsed(oPersistedObject.CODE, oContext.getHQ())
	};
}