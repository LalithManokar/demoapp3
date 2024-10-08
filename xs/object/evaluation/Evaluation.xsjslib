var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var check = $.import("sap.ino.xs.aof.lib", "check");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var aof = $.import("sap.ino.xs.aof.core", "framework");
var status = $.import("sap.ino.xs.object.status", "Status");
var Idea = $.import("sap.ino.xs.object.idea", "Idea");
var EvalReqItem = $.import("sap.ino.xs.object.evaluation", "EvaluationRequestItem");
var ideaCounts = $.import("sap.ino.xs.object.idea", "ideaCounts");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var ObjectOnPersistCallBack = $.import("sap.ino.xs.xslib", "ObjectOnPersistCallback");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var EvalMessage = $.import("sap.ino.xs.object.evaluation", "message");
var DataType = $.import("sap.ino.xs.object.basis", "Datatype").DataType;
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var Attachment = $.import("sap.ino.xs.object.attachment", "Attachment");

var Status = {
	Draft: "sap.ino.config.EVAL_DRAFT",
	Submitted: "sap.ino.config.EVAL_FINISHED",
	PublishedToCommunity: "sap.ino.config.EVAL_PUB_COMMUNITY",
	PublishedToSubmitter: "sap.ino.config.EVAL_PUB_SUBMITTER"
};

var StatusAction = {
	Submit: "sap.ino.config.EVAL_SUBMIT",
	PublishToSubmitter: "sap.ino.config.EVAL_PUB_SUBMITTER",
	PublishToCommunity: "sap.ino.config.EVAL_PUB_COMMUNITY"
};

var AutoPublication = {
	ToSubmitter: "sap.ino.config.SUBMITTER",
	ToCommunity: "sap.ino.config.COMMUNITY"
};

this.definition = {
	isExtensible: true,
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_create", "IDEA_ID", "IDEA_ID", EvalMessage.AUTH_MISSING_EVALUATION_CREATE),
			enabledCheck: createEnabledCheck,
			historyEvent: "EVAL_CREATED",
			customProperties: createCustomProperties
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_update", "EVALUATION_ID", EvalMessage.AUTH_MISSING_EVALUATION_UPDATE),
			enabledCheck: updateEnabledCheck,
			historyEvent: "EVAL_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_delete", "EVALUATION_ID", EvalMessage.AUTH_MISSING_EVALUATION_DELETE),
			historyEvent: "EVAL_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_read", "EVALUATION_ID", EvalMessage.AUTH_MISSING_EVALUATION_READ)
		},
		submit: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_update", "EVALUATION_ID", EvalMessage.AUTH_MISSING_EVALUATION_UPDATE),
			execute: submit,
			enabledCheck: submitEnabledCheck,
			historyEvent: "STATUS_ACTION_sap.ino.config.EVAL_SUBMIT"
		},
		executeStatusTransition: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_status_transition", "EVALUATION_ID", EvalMessage.AUTH_MISSING_EVALUATION_STATUS_TRANS),
			execute: executeStatusTransition,
			historyEvent: "STATUS_ACTION",
			customProperties: statusTransitionProperties,
			enabledCheck: executeStatusTransitionEnabledCheck
		},
		//refer to Idea.xsjslib
		changeAuthorIdeaSelfEvaluation: {
			authorizationCheck: false,
			execute: bulkChangeAuthorIdeaSelfEvaluation,
			historyEvent: "EVALUATION_CHANGE_AUTHOR",
			isStatic: true,
			isInternal: true
		}
	},
	Root: {
		table: "sap.ino.db.evaluation::t_evaluation",
		sequence: "sap.ino.db.evaluation::s_evaluation",
		historyTable: "sap.ino.db.evaluation::t_evaluation_h",
		determinations: {
			onCreate: [initEvaluation],
			onModify: [determine.systemAdminData, determineCriterionValues],
			onPersist: [ideaCounts.update,ObjectOnPersistCallBack.entry]
		},
		attributes: {
			IDEA_ID: {
				foreignKeyTo: "sap.ino.xs.object.idea.Idea.Root",
				readOnly: check.readOnlyAfterCreateCheck(EvalMessage.EVALUATION_IDEA_UNCHANGEABLE)
			},
			MODEL_CODE: {
				foreignKeyTo: "sap.ino.xs.object.evaluation.Model.Root",
				readOnly: check.readOnlyAfterCreateCheck(EvalMessage.EVALUATION_MODEL_UNCHANGEABLE)
			},
			STATUS_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
			},
			IDEA_PHASE_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.campaign.Phase.Root"
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			CAL_NUM_VALUE: {
				readOnly: true
			},
			COMMENT: {
			    readOnly: false
			}
		},
		nodes: {
			Owner: IdentityRole.node(IdentityRole.ObjectType.Evaluation, IdentityRole.Role.EvaluationOwner, true),
			CriterionValues: {
				table: "sap.ino.db.evaluation::t_criterion_value",
				sequence: "sap.ino.db.evaluation::s_criterion_value",
				parentKey: "EVALUATION_ID",
				consistencyChecks: [check.duplicateCheck("CRITERION_CODE", EvalMessage.DUPLICATE_CRITERION)],
				attributes: {
					CRITERION_CODE: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.Model.Criterion"
					}
				}
			},
			EvalAttachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Evaluation, AttachmentAssignment.FilterTypeCode.Frontoffice)
		}
	}
};

function initEvaluation(vKey, oEvaluation, oPersistedObject, addMessage, getNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oEvaluation.Owner = [{
		ID: getNextHandle(),
		IDENTITY_ID: iUserId
    }];

	oEvaluation.STATUS_CODE = Status.Draft;

	if (!oEvaluation.MODEL_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_MODEL_MISSING, vKey);
		return;
	}

	if (!oEvaluation.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_IDEA_MISSING, vKey);
		return;
	}

	var oHQ = oContext.getHQ();
	var aModelCode = oHQ.statement(
		'select model_code from \
                    "sap.ino.db.evaluation::v_evaluation_template" \
                    where idea_id = ? and model_code = ?'
	).execute(oEvaluation.IDEA_ID, oEvaluation.MODEL_CODE);

	if (aModelCode.length === 0 || aModelCode[0].MODEL_CODE !== oEvaluation.MODEL_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_MODEL_INVALID_FOR_PHASE, vKey);
		return;
	}

	var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oIdea = Idea.read(oEvaluation.IDEA_ID);
	if (!oIdea) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_IDEA_MISSING, vKey);
		return;
	}

	oEvaluation.IDEA_PHASE_CODE = oIdea.PHASE_CODE;

	//execute Evaluation Request states transtion and add Expert to Idea
	var oEvalReqItem = getEvalReqItem(oEvaluation, oContext);
	var EvalReqItemModel = aof.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
	if (oEvalReqItem && (oEvalReqItem.STATUS_CODE === EvalReqItem.Status.Requested ||
		oEvalReqItem.STATUS_CODE === EvalReqItem.Status.Accepted ||
		oEvalReqItem.STATUS_CODE === EvalReqItem.Status.InClarification)) {
		EvalReqItemModel.executeStatusTransition(oEvalReqItem.ID, {
			STATUS_ACTION_CODE: EvalReqItem.StatusAction.StartProcess
		});

		var isIdeaContributor = _.find(oIdea.Submitter.concat(oIdea.Contributors).concat(oIdea.Experts), function(oAuthor) {
			return oEvalReqItem.Expert[0].IDENTITY_ID === oAuthor.IDENTITY_ID;
		});
		if (!isIdeaContributor) {
			EvalReqItem.assignIdeaExpert(oEvalReqItem, oContext);
		}
	}
}

function determineCriterionValues(vKey, oEvaluation, oPersistedObject, addMessage, getNextHandle, oContext) {
	var Model = aof.getApplicationObject("sap.ino.xs.object.evaluation.Model");
	if (!oEvaluation.MODEL_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_MODEL_MISSING, vKey);
		return;
	}
	var bErroneous = false;
	var oModel = Model.read(oEvaluation.MODEL_CODE);
	if (!oModel) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_MODEL_MISSING, vKey);
		return;
	}
	var oEnableFormula = oModel.ENABLE_FORMULA;
	var oCalcFormula = oModel.CALC_FORMULA;
	var aMergedCriterionValues = _.map(oModel.Criterion, function(oCriterion) {
		var aExistingCriterionValue = _.where(oEvaluation.CriterionValues || [], {
			CRITERION_CODE: oCriterion.CODE
		});

		if (_.size(aExistingCriterionValue) > 1) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CRITERION_TWICE, vKey);
			bErroneous = true;
			return undefined;
		}

		var oEvaluationCriterionValue = _.isEmpty(aExistingCriterionValue) ? {
			ID: getNextHandle(),
			CRITERION_CODE: oCriterion.CODE
		} : _.first(aExistingCriterionValue);

		//replace checking logic for value option list max value and min value
		const iMaxInt = 9007199254740992; // Max Int
		const iMinInt = -9007199254740992; // Min Int

		var fnDetermineNumValueMinMaxFromValueOptionList = function(oCriterion, oValueOptionList) {
			var iMinValue = iMaxInt;
			var iMaxValue = iMinInt;
			_.each(oValueOptionList.ValueOptions, function(oValueOption) {
				if (oValueOption.NUM_VALUE < iMinValue) {
					iMinValue = oValueOption.NUM_VALUE;
				}
				if (oValueOption.NUM_VALUE > iMaxValue) {
					iMaxValue = oValueOption.NUM_VALUE;
				}
			});

			// set the values if changed
			if (iMinValue < iMaxInt) {
				oCriterion.NUM_VALUE_MIN = iMinValue;
			}

			if (iMaxValue > iMinInt) {
				oCriterion.NUM_VALUE_MAX = iMaxValue;
			}
			//set step size to 0
			oCriterion.NUM_VALUE_STEP_SIZE = 0;
		};

		var ValueOptionList = aof.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
		var oValueOptionList = ValueOptionList.read(oCriterion.VALUE_OPTION_LIST_CODE);
		fnDetermineNumValueMinMaxFromValueOptionList(oCriterion, oValueOptionList);

		checkValue(oEvaluationCriterionValue, oCriterion, _.wrap(addMessage, function(fnAddMessage) {
			bErroneous = true;
			fnAddMessage.apply(undefined, (_.rest(_.toArray(arguments))));
		}));
		
		if (bErroneous === true) {
			return undefined;
		}
		return oEvaluationCriterionValue;
	});

	if (!bErroneous) {
		oEvaluation.CriterionValues = calculateCriterionValues(aMergedCriterionValues, oModel.Criterion);
		oEvaluation.CAL_NUM_VALUE = calculateCalcNumValue(aMergedCriterionValues, oModel.Criterion, oEnableFormula, oCalcFormula, addMessage);

	}
}

function checkValue(oCriterionValue, oCriterion, addMessage) {
	var DataTypeAttr = {};
	DataTypeAttr[DataType.Boolean] = "BOOL_VALUE";
	DataTypeAttr[DataType.Numeric] = "NUM_VALUE";
	DataTypeAttr[DataType.Integer] = "NUM_VALUE";
	DataTypeAttr[DataType.Text] = "TEXT_VALUE";

	function inRange(vNumValue, vMin, vMax, vStepSize) {
		return vNumValue ? ((vMin <= vNumValue || vMin === null || vMin === undefined) && (vNumValue <= vMax || vMax === null || vMax ===
			undefined) && (vNumValue % vStepSize === 0 || vStepSize === 0 || vStepSize === null || vStepSize === undefined) || vMin == vMax) : true;
	}

	var bValid = false;
	switch (oCriterion.DATATYPE_CODE) {
		case DataType.Boolean:
			bValid = !oCriterionValue.NUM_VALUE && !oCriterionValue.TEXT_VALUE && (!oCriterionValue.BOOL_VALUE || (_.toBool(oCriterionValue.BOOL_VALUE) !==
				undefined));
			break;
		case DataType.Numeric:
			bValid = !oCriterionValue.BOOL_VALUE && !oCriterionValue.TEXT_VALUE && (!oCriterionValue.NUM_VALUE || (_.isFinite(oCriterionValue.NUM_VALUE) &&
				inRange(oCriterionValue.NUM_VALUE, oCriterion.NUM_VALUE_MIN, oCriterion.NUM_VALUE_MAX, oCriterion.NUM_VALUE_STEP_SIZE)) || 
				oCriterion.AGGREGATION_TYPE);
			break;
		case DataType.Integer:
			bValid = !oCriterionValue.BOOL_VALUE && !oCriterionValue.TEXT_VALUE && (!oCriterionValue.NUM_VALUE || (_.isInteger(oCriterionValue.NUM_VALUE) &&
				inRange(oCriterionValue.NUM_VALUE, oCriterion.NUM_VALUE_MIN, oCriterion.NUM_VALUE_MAX, oCriterion.NUM_VALUE_STEP_SIZE)) || 
				oCriterion.AGGREGATION_TYPE);
			break;
		case DataType.Text:
			bValid = !oCriterionValue.NUM_VALUE && !oCriterionValue.BOOL_VALUE && (!oCriterionValue.TEXT_VALUE || _.isString(oCriterionValue.TEXT_VALUE));
			break;
		default:
			bValid = true;
			break;
	}

	if (bValid && oCriterion.VALUE_OPTION_LIST_CODE && oCriterionValue[DataTypeAttr[oCriterion.DATATYPE_CODE]]) {
		var ValueOptionList = aof.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
		var oValueOptionList = ValueOptionList.read(oCriterion.VALUE_OPTION_LIST_CODE);
		var oWhere = {};
		oWhere[DataTypeAttr[oCriterion.DATATYPE_CODE]] = oCriterionValue[DataTypeAttr[oCriterion.DATATYPE_CODE]];
		bValid = !!_.findWhere(oValueOptionList.ValueOptions, oWhere);
	}

	if (!bValid) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_INVALID_DATA, oCriterionValue.ID);
	}
}

function calculateCriterionValues(aCriterionValue, aCriteria) {
	function getValue(sCriterionCode) {
		return _.findWhere(aCriterionValue, {
			CRITERION_CODE: sCriterionCode
		});
	}

	function sum(aCriterionValue, oAggrCriterion, aCriteria) {
		var vSum = null;
		_.each(aCriterionValue, function(oCriterionValue) {
			var oCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			if (oAggrCriterion.DATATYPE_CODE == DataType.Numeric || oAggrCriterion.DATATYPE_CODE == DataType.Integer) {
				if (oCriterionValue.NUM_VALUE && _.isNumber(oCriterionValue.NUM_VALUE) && (oCriterion.DATATYPE_CODE == DataType.Integer || oCriterion.DATATYPE_CODE ==
					DataType.Numeric)) {
					if (oCriterion.WEIGHT === undefined || oCriterion.WEIGHT === null) {
						vSum = vSum + oCriterionValue.NUM_VALUE;
					} else {
						vSum = vSum + oCriterionValue.NUM_VALUE * oCriterion.WEIGHT * 0.01;
					}
				}
			} else if (oAggrCriterion.DATATYPE_CODE == DataType.Boolean) {
				if (oCriterionValue.BOOL_VALUE && _.isNumber(oCriterionValue.BOOL_VALUE) && oCriterion.DATATYPE_CODE == DataType.Boolean) {
					vSum = vSum + oCriterionValue.BOOL_VALUE;
				}
			}
		});
		if (oAggrCriterion.DATATYPE_CODE == DataType.Numeric) {
			if (oAggrCriterion.WEIGHT === undefined || oAggrCriterion.WEIGHT === null) {
				vSum = vSum;
			} else {
				vSum = vSum * oAggrCriterion.WEIGHT * 0.01;
			}
		} else if (oAggrCriterion.DATATYPE_CODE == DataType.Integer) {
			if (oAggrCriterion.WEIGHT === undefined || oAggrCriterion.WEIGHT === null) {
				vSum = Math.round(vSum);
			} else {
				vSum = Math.round(vSum * oAggrCriterion.WEIGHT * 0.01);
			}
		}
		return vSum;
	}

	function avg(aCriterionValue, oAggrCriterion, aCriteria) {
		var vSum = sum(aCriterionValue, oAggrCriterion, aCriteria);

		// we treat boolean as integer: true is 1, false is 0. The average of a boolean value is the value that occurs
		// most.

		var iCount = 0;
		_.each(aCriterionValue, function(oCriterionValue) {
			var oCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			if (((oCriterion.DATATYPE_CODE === DataType.Integer ||
						oCriterion.DATATYPE_CODE === DataType.Numeric) &&
					(oAggrCriterion.DATATYPE_CODE === DataType.Integer ||
						oAggrCriterion.DATATYPE_CODE === DataType.Numeric)) ||
				(oCriterion.DATATYPE_CODE === DataType.Boolean &&
					oAggrCriterion.DATATYPE_CODE === DataType.Boolean)) {
				iCount++;
			}
		});

		if (oAggrCriterion.DATATYPE_CODE != DataType.Numeric && oAggrCriterion.DATATYPE_CODE != DataType.Integer && oAggrCriterion.DATATYPE_CODE !=
			DataType.Boolean) {
			return null;
		} else if (vSum === null) {
			return null;
		} else {
			var nAverage = iCount === 0 ? null : vSum / iCount;
			if (nAverage && (oAggrCriterion.DATATYPE_CODE == DataType.Integer || oAggrCriterion.DATATYPE_CODE == DataType.Boolean)) {
				nAverage = Math.round(nAverage);
			}
			return nAverage;
		}
	}

	function and(aCriterionValue, oAggrCriterion, aCriteria) {
		var bAndValue = true;
		_.each(aCriterionValue, function(oCriterionValue) {
			var oCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			if (oCriterion.DATATYPE_CODE == DataType.Boolean) {
				bAndValue = bAndValue && oCriterionValue.BOOL_VALUE && oCriterionValue.BOOL_VALUE == 1;
			}
		});

		var iResult = bAndValue ? 1 : 0;
		return iResult;
	}

	function or(aCriterionValue, oAggrCriterion, aCriteria) {
		var bOrValue = false;
		_.each(aCriterionValue, function(oCriterionValue) {
			var oCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			if (oCriterion.DATATYPE_CODE == DataType.Boolean) {
				if (oCriterionValue.BOOL_VALUE) {
					bOrValue = bOrValue || oCriterionValue.BOOL_VALUE == 1;
				}
			}
		});

		var iResult = bOrValue ? 1 : 0;
		return iResult;
	}

	var mAggrFn = {
		"SUM": {
			execute: sum,
			resultAttr: {
				"INTEGER": "NUM_VALUE",
				"NUMERIC": "NUM_VALUE",
				"BOOLEAN": "BOOL_VALUE"
			}
		},
		"AVG": {
			execute: avg,
			resultAttr: {
				"INTEGER": "NUM_VALUE",
				"NUMERIC": "NUM_VALUE",
				"BOOLEAN": "BOOL_VALUE"
			}
		},
		"AND": {
			execute: and,
			resultAttr: {
				"BOOLEAN": "BOOL_VALUE"
			}
		},
		"OR": {
			execute: or,
			resultAttr: {
				"BOOLEAN": "BOOL_VALUE"
			}
		}
	};

	var aAggrCriteria = _.filter(aCriteria, function(oCriterion) {
		return _.contains(_.keys(mAggrFn), oCriterion.AGGREGATION_TYPE);
	});

	_.each(aAggrCriteria, function(oCriterion) {
		var aChildValue = _.filter(aCriterionValue, function(oCriterionValue) {
			var oValueCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			// Text values should be totally ignored in calculations
			return (oValueCriterion.PARENT_CRITERION_CODE === oCriterion.CODE) && (oValueCriterion.DATATYPE_CODE != DataType.Text);
		});
		var oParentValue = _.findWhere(aCriterionValue, {
			CRITERION_CODE: oCriterion.CODE
		});

		var oAggrFn = mAggrFn[oCriterion.AGGREGATION_TYPE];
		var vAggrValue = oAggrFn.execute(aChildValue, oCriterion, aCriteria);
		var sResultAttr = oAggrFn.resultAttr[oCriterion.DATATYPE_CODE];
		oParentValue[sResultAttr] = vAggrValue;
	});

	// Matrix calculation
	//
	// A two-dimensional matrix is used for classification purposes.
	// On each axis the number of evenly distributed segments is configurable, as
	// well as the minimum and maximum value.
	// The result of the calculation is an integer value representing the cell.
	// The cells are numbered from the bottom left of the matrix, row by row:
	//
	// y
	// ^
	// |
	// +---+---+---+
	// + 4 + 5 + 6 +
	// +---+---+---+
	// + 1 + 2 + 3 +
	// +---+---+---+---> x
	//
	// When a value is exactly hitting the border it is included in the UPPER segment,
	// i.e. a segment n is defined as [...). The last segment includes both borders: [...]

	var aMatrixCriteria = _.where(aCriteria, {
		AGGREGATION_TYPE: "MATRIX"
	});

	_.each(aMatrixCriteria, function(oCriterion) {
		function getAxisSegment(oValue, iSegmentNo) {
			var oAxisCriterion = _.findWhere(aCriteria, {
				CODE: oValue.CRITERION_CODE
			});
			var fSegmentLength = (oAxisCriterion.NUM_VALUE_MAX - oAxisCriterion.NUM_VALUE_MIN) / iSegmentNo;
			var iSegment = Math.floor((oValue.NUM_VALUE - oAxisCriterion.NUM_VALUE_MIN) / fSegmentLength) + 1;
			// for maximum value the iSegment is 1 higher than the segment no
			// so we reset segment to number of segments
			return Math.min(iSegment, iSegmentNo);
		}

		var oXValue = getValue(oCriterion.X_AXIS_CRITERION_CODE);
		var oYValue = getValue(oCriterion.Y_AXIS_CRITERION_CODE);
		var iXSegment = getAxisSegment(oXValue, oCriterion.X_AXIS_SEGMENT_NO);
		var iYSegment = getAxisSegment(oYValue, oCriterion.Y_AXIS_SEGMENT_NO);

		var iMatrixPosition = iXSegment + (iYSegment - 1) * oCriterion.X_AXIS_SEGMENT_NO;
		var oMatrixValue = getValue(oCriterion.CODE);
		oMatrixValue.NUM_VALUE = iMatrixPosition;
	});
	return aCriterionValue;
}

function calculateCalcNumValue(aCriterionValue, aCriteria, aEnableFormula, aCalcFormula, addMessage) {
	var bCalcValue = null;
	var sCriterionValue = _.filter(aCriterionValue, function(oCriterionValue) {
		var oValueCriterion = _.findWhere(aCriteria, {
			CODE: oCriterionValue.CRITERION_CODE
		});
		return (oValueCriterion.DATATYPE_CODE === DataType.Numeric || oValueCriterion.DATATYPE_CODE == DataType.Integer);
	});
	if (aEnableFormula && aCalcFormula) {
		_.each(sCriterionValue, function(oCriterionValue) {
			var oCriterion = _.findWhere(aCriteria, {
				CODE: oCriterionValue.CRITERION_CODE
			});
			var oCriterionCode = oCriterion.CODE.split('.');
			oCriterionCode = oCriterionCode.slice(oCriterionCode.length - 1).toString();
			var oReg = new RegExp("\\$" + oCriterionCode + "(?=[\\/+\\-*\\s)(,]|$)", 'g');
			var sCriterionNumValue = oCriterionValue.NUM_VALUE || 0;
			sCriterionNumValue = (!oCriterion.AGGREGATION_TYPE && oCriterion.WEIGHT !== null && oCriterion.WEIGHT !== undefined) ?
				sCriterionNumValue * oCriterion.WEIGHT * 0.01 : sCriterionNumValue;
			aCalcFormula = aCalcFormula.replace(oReg, sCriterionNumValue);
		});
		bCalcValue = eval.call(this, aCalcFormula);
		if(Number.POSITIVE_INFINITY === bCalcValue || Number.NEGATIVE_INFINITY === bCalcValue || Number.isNaN(bCalcValue)){
		    addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_INVALID_DATA);
		}
	}
	return bCalcValue;
}

function createEnabledCheck(vKey, oEvaluation, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	if (!oEvaluation.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CREATE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "IDEA_ID", oEvaluation.IDEA_ID);
	} else {
	    //check for empty evaluation method
		var sEvaluationMethodSelect =
			'select distinct phase.EVALUATION_MODEL_CODE from "sap.ino.db.idea::t_idea" as idea \
                    inner join "sap.ino.db.campaign::t_campaign" as campaign \
                    on campaign.id = idea.campaign_id \
                    inner join "sap.ino.db.campaign::t_campaign_phase" as phase \
                    on idea.campaign_id = phase.campaign_id \
                    where idea.phase_code = phase.phase_code and idea.id = ? ';
		var oEvaluationMethod = oHQ.statement(sEvaluationMethodSelect).execute(oEvaluation.IDEA_ID);
		if(oEvaluationMethod && oEvaluationMethod[0].EVALUATION_MODEL_CODE !== null) {
		    // limitation on status
		var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
		var oIdea = Idea.read(oEvaluation.IDEA_ID);
		var sSelect =
			'select authorization.setting_code, \
                                authorization.value, \
                                idea.id\
                         from "sap.ino.db.status::t_status_stage" as stage \
                         inner join "sap.ino.db.idea::t_idea" as idea \
                         on idea.status_code = stage.code \
                         inner join "sap.ino.db.status::t_status_authorization_stage" as authorization\
                         on authorization.ID_OF_STATUS_STAGE = stage.id\
                        where idea.id=  ? ';
		var oSettingValue = oHQ.statement(sSelect).execute(oEvaluation.IDEA_ID);
		if (oSettingValue.length > 0 && oSettingValue[0].VALUE === 1) {
			return;
		}
		if (!oIdea || status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
			addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CREATE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "IDEA_ID", oEvaluation.IDEA_ID);
		}
		} else {
		    addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_CREATE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "IDEA_ID", oEvaluation.IDEA_ID);
		}
		
	    
		
	}
}

function updateEnabledCheck(vKey, oEvaluation, addMessage, oContext) {
	if (oEvaluation.STATUS_CODE != Status.Draft) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_UNCHANGEABLE, vKey);
	}
}

function submitEnabledCheck(vKey, oEvaluation, addMessage, oContext) {
	var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oIdea = Idea.read(oEvaluation.IDEA_ID);
	if (oIdea.PHASE_CODE !== oEvaluation.IDEA_PHASE_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_SUBMIT_PHASE_CHANGED, vKey);
	}
	var oHQ = oContext.getHQ();
	var aStatusTransitions = status.getStatusTransitions(oHQ, "sap.ino.config.EVALUATION", oEvaluation.STATUS_CODE, StatusAction.Submit);
	if (!aStatusTransitions || aStatusTransitions.length !== 1) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_INVALID_STATUS_TRANSITION, vKey);
	}
}

function submit(vKey, oParameters, oEvaluation, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();

	// Submit
	var aStatusTransitions = status.getStatusTransitions(oHQ, "sap.ino.config.EVALUATION", oEvaluation.STATUS_CODE, StatusAction.Submit);
	_executeStatusTransition(vKey, aStatusTransitions, oEvaluation, addMessage, oContext);

	// Automatic Evaluation Publication
	var aPhase = oHQ.statement(
		'select AUTO_EVAL_PUB_CODE from "sap.ino.db.evaluation::v_evaluation_campaign_phase" \
                                where evaluation_id = ? and phase_code = ?'
	).execute(vKey, oEvaluation.IDEA_PHASE_CODE);
	if (aPhase.length > 0) {
		var oPhase = aPhase[0];
		if (oPhase.AUTO_EVAL_PUB_CODE === AutoPublication.ToSubmitter) {
			aStatusTransitions = status.getStatusTransitions(oHQ, "sap.ino.config.EVALUATION", oEvaluation.STATUS_CODE, StatusAction.PublishToSubmitter);
			_executeStatusTransition(vKey, aStatusTransitions, oEvaluation, addMessage, oContext);
		} else if (oPhase.AUTO_EVAL_PUB_CODE === AutoPublication.ToCommunity) {
			aStatusTransitions = status.getStatusTransitions(oHQ, "sap.ino.config.EVALUATION", oEvaluation.STATUS_CODE, StatusAction.PublishToCommunity);
			_executeStatusTransition(vKey, aStatusTransitions, oEvaluation, addMessage, oContext);
		}
	}

	//execute Evaluation Request states transtion
	var oEvalReqItem = getEvalReqItem(oEvaluation, oContext);
	var EvalReqItemModel = aof.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
	if (oEvalReqItem && (oEvalReqItem.STATUS_CODE === EvalReqItem.Status.Requested ||
		oEvalReqItem.STATUS_CODE === EvalReqItem.Status.Accepted ||
		oEvalReqItem.STATUS_CODE === EvalReqItem.Status.InProcess ||
		oEvalReqItem.STATUS_CODE === EvalReqItem.Status.InClarification)) {
		EvalReqItemModel.executeStatusTransition(oEvalReqItem.ID, {
			STATUS_ACTION_CODE: EvalReqItem.StatusAction.Complete
		});
	}
}

function statusTransitionProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                    from "sap.ino.db.evaluation::v_evaluation_status_transition" \
                    where id = ?').execute(
		vKey);
	return {
		statusTransitions: aStatusTransition
	};
}

function executeStatusTransitionEnabledCheck(vKey, oEvaluation, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                    from "sap.ino.db.evaluation::v_evaluation_status_transition" \
                    where id = ?').execute(
		vKey);
	if (aStatusTransition.length === 0) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_NO_STATUS_TRANSITIONS, vKey);
	}
}

function executeStatusTransition(vKey, oParameters, oEvaluation, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.STATUS_ACTION_CODE) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_INVALID_STATUS_TRANSITION, vKey);
	}

	var sStatusActionCode = oParameters.STATUS_ACTION_CODE;

	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                        from "sap.ino.db.evaluation::v_evaluation_status_transition" \
                        where id = ? and status_action_code = ?'
	).execute(vKey, sStatusActionCode);

	_executeStatusTransition(vKey, aStatusTransition, oEvaluation, addMessage, oContext);
}

function _executeStatusTransition(vKey, aStatusTransition, oEvaluation, addMessage, oContext) {
	if (_.size(aStatusTransition) !== 1) {
		addMessage(Message.MessageSeverity.Error, EvalMessage.EVALUATION_INVALID_STATUS_TRANSITION, vKey);
		return;
	}
	var oStatusTransition = _.first(aStatusTransition);
	oEvaluation.STATUS_CODE = oStatusTransition.NEXT_STATUS_CODE;
	oContext.setHistoryEvent("STATUS_ACTION_" + oStatusTransition.STATUS_ACTION_CODE);
}

function createCustomProperties(oParameters, oPersistedObject, addMessage, oContext, oActionMetadata) {
	var oHQ = oContext.getHQ();
	var aSelfEvalFlag = oHQ.statement('select ORIGIN from "sap.ino.db.evaluation::v_auth_evaluation_create" where idea_id = ?').execute(
		oParameters.IDEA_ID);
	var bSelfInFlags = _.pluck(aSelfEvalFlag, "ORIGIN").indexOf("SELF") !== -1;
	return {
		SELF_EVALUATION_ACTIVE: bSelfInFlags
	};
}

function getEvalReqItem(oEvaluation, oContext) {
	var oHQ = oContext.getHQ();

	var sSelectEvalReq =
		'select top 1 ID from "sap.ino.db.evaluation::v_evaluation_request_item" \
                            where idea_id = ? and idea_phase_code = ? and expert_id = ?';
	var aResult = oHQ.statement(sSelectEvalReq).execute(oEvaluation.IDEA_ID, oEvaluation.IDEA_PHASE_CODE, oContext.getUser().ID);

	if (aResult.length > 0) {
		var EvalReqItemModel = aof.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
		var oEvalReqItem = EvalReqItemModel.read(aResult[0].ID);
		return oEvalReqItem;
	} else {
		return null;
	}
}

function bulkChangeAuthorIdeaSelfEvaluation(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.AUTHOR_ID && oParameters.ORIGIN_AUTHOR_ID && oParameters.keys) {
		var sCondition = "(IDEA_ID = ? ";
		for (var index = 1; index < oParameters.keys.length; index++) {
			sCondition += " OR IDEA_ID = ? ";
		}
		sCondition += ") AND CREATED_BY_ID = ? ";
		//change identity object role
		changeIdentityObjectRole(oParameters, oContext, addMessage);
		//change attachment
		// 		var oResponse = Attachment.changeAuthor({
		// 			"AUTHOR_ID": oParameters.AUTHOR_ID,
		// 			"ORIGIN_AUTHOR_ID": oParameters.ORIGIN_AUTHOR_ID,
		// 			"keys": oParameters.keys
		// 		});
		// 		addMessage(oResponse.messages);
		var oResponse = oBulkAccess.update({
			Root: {
				CREATED_BY_ID: oParameters.AUTHOR_ID,
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: sCondition,
			conditionParameters: oParameters.keys.concat(oParameters.ORIGIN_AUTHOR_ID)
		});
		addMessage(oResponse.messages);
	}
}

function changeIdentityObjectRole(oParameters, oContext, addMessage) {
	var sCondition = "AND (E.IDEA_ID = ? ";
	for (var index = 1; index < oParameters.keys.length; index++) {
		sCondition += " OR E.IDEA_ID = ? ";
	}

	var sHistorySql =
		`
INSERT INTO "SAP_INO"."sap.ino.db.iam::t_object_identity_role_h"
(
    "HISTORY_DB_EVENT",
	"HISTORY_BIZ_EVENT",
	"HISTORY_AT",
	"HISTORY_ACTOR_ID",
	"ID",
	"IDENTITY_ID",
	"OBJECT_ID",
	"OBJECT_TYPE_CODE",
	"ROLE_CODE"
) 
SELECT 'UPDATED', 
	'IDETITY_ROLE_CHANGE_AUTHOR', 
	?, 
	?, 
	IR."ID", 
	?, 
	IR."OBJECT_ID", 
	IR."OBJECT_TYPE_CODE", 
	IR."ROLE_CODE" 
FROM "SAP_INO"."sap.ino.db.iam::t_object_identity_role" AS IR 
	INNER JOIN "sap.ino.db.evaluation::t_evaluation" AS E 
	ON IR.OBJECT_ID = E.ID 
WHERE OBJECT_TYPE_CODE = 'EVALUATION' 
	AND ROLE_CODE = 'EVALUATION_OWNER' 
	AND CREATED_BY_ID = ?  
`;
	sHistorySql = sHistorySql + sCondition + ") ";

	var sUpdateSql =
		`
UPDATE IR
SET IR.IDENTITY_ID = ?
FROM "SAP_INO"."sap.ino.db.iam::t_object_identity_role" AS IR
	INNER JOIN "sap.ino.db.evaluation::t_evaluation" AS E
	ON IR.OBJECT_ID = E.ID
WHERE OBJECT_TYPE_CODE = 'EVALUATION'
	AND ROLE_CODE = 'EVALUATION_OWNER'
	AND CREATED_BY_ID = ? 
	`;
	sUpdateSql = sUpdateSql + sCondition + ") ";

	var oHQ = oContext.getHQ();
	try {
		oHQ.statement(sHistorySql).execute([oContext.getRequestTimestamp(), oContext.getUser().ID,
			oParameters.AUTHOR_ID, oParameters.ORIGIN_AUTHOR_ID].concat(oParameters.keys));

		oHQ.statement(sUpdateSql).execute([oParameters.AUTHOR_ID, oParameters.ORIGIN_AUTHOR_ID].concat(oParameters.keys));
	} catch (e) {
		TraceWrapper.log_exception(e);
		addMessage(Message.MessageSeverity.Error, EvalMessage.IDENTITY_OBJECT_ROLE_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
	}
}