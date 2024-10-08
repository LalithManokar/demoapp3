var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var aof = $.import("sap.ino.xs.aof.core", "framework");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var EvaluationMessage = $.import("sap.ino.xs.object.evaluation", "message");

var AggregationType = $.import("sap.ino.xs.object.evaluation", "AggregationType");
var DataType = $.import("sap.ino.xs.object.basis", "Datatype");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		// static authorization is checked for exposed XSJS
		// no further check needed here
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		update: {
			authorizationCheck: false,
			executionCheck: updateExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			enabledCheck: deleteEnabledCheck,
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: copyEnabledCheck,
		},
	},
	Root: {
		table: "sap.ino.db.evaluation::t_model_stage",
		sequence: "sap.ino.db.evaluation::s_model",
		customProperties: {
			fileName: "t_model",
			contentOnlyInRepository: false
		},
		consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", EvaluationMessage.MODEL_DUPLICATE_CODE, true), RootNodeCheck],
		activationCheck: activationCheck,
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, determineCode],
			onModify: [determineCode, determine.systemAdminData, determineNumValueMinMax, cleanupFields],
			onPersist: [configDetermine.activateContent]
		},
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
				consistencyChecks: [configCheck.validPlainCodeCheck],
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
			Criterion: {
				table: "sap.ino.db.evaluation::t_criterion_stage",
				sequence: "sap.ino.db.evaluation::s_criterion",
				customProperties: {
					fileName: "t_criterion"
				},
				consistencyChecks: [check.duplicateCheck("PLAIN_CODE", EvaluationMessage.MODEL_DUPLICATE_CODE, true), CriterionNodeCheck],
				parentKey: "MODEL_ID",
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
					SEQUENCE_NO: {
						required: true,
						consistencyChecks: [validSequenceNoCheck]
					},
					DATATYPE_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.Datatype.Root"
					},
					UOM_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.Unit.Root"
					},
					VALUE_OPTION_LIST_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.Root"
					},
					AGGREGATION_TYPE: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.AggregationType.Root"
					},
					PLAIN_CODE: {
						required: true,
						consistencyChecks: [configCheck.validPlainCodeCheck],
					},
					DEFAULT_TEXT: {
						required: true
					},
					MODEL_CODE: {
						readOnly: true
					},
					PARENT_CRITERION_CODE: {
						readOnly: true
					},
					PARENT_CRITERION_ID: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.ModelStage.Criterion",
						foreignKeyIntraObject: true,
					},
					X_AXIS_CRITERION_CODE: {
						readOnly: true
					},
					Y_AXIS_CRITERION_CODE: {
						readOnly: true
					},
					VIS_PARAM_1_CRITERION_CODE: {
						readOnly: true
					},
					VIS_PARAM_2_CRITERION_CODE: {
						readOnly: true
					},
					X_AXIS_CRITERION_ID: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.ModelStage.Criterion",
						foreignKeyIntraObject: true,
					},
					Y_AXIS_CRITERION_ID: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.ModelStage.Criterion",
						foreignKeyIntraObject: true,
					},
					VIS_PARAM_1_CRITERION_ID: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.ModelStage.Criterion",
						foreignKeyIntraObject: true,
					},
					VIS_PARAM_2_CRITERION_ID: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.ModelStage.Criterion",
						foreignKeyIntraObject: true,
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
					}
				}
			}
		}
	}
};

function determineReferenceCriterionCodeFromId(aCriterion, oCriterion, sID, sCode, sErrorMessage, addMessage) {
	if (!oCriterion[sID]) {
		oCriterion[sID] = 0;
	}
	if (oCriterion[sID] !== 0) {
		// determine the code out of the ID again
		var oRefCriterion = _.findWhere(aCriterion, {
			ID: oCriterion[sID]
		});
		if (oRefCriterion) {
			oCriterion[sCode] = oRefCriterion.CODE;
			if (oCriterion[sCode] == oCriterion.CODE) {
				// The criterion reference code must not be the criterion itself
				addMessage(Message.MessageSeverity.Error, EvaluationMessage[sErrorMessage], oCriterion.ID, "Criterion", sCode, oCriterion.PLAIN_CODE ||
					oCriterion.CODE);
			}
		} else {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage[sErrorMessage], oCriterion.ID, "Criterion", sCode, oCriterion.PLAIN_CODE ||
				oCriterion.CODE);
		}
	} else {
		// clear the code
		oCriterion[sCode] = "";
	}
}

function determineCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	oWorkObject.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE);
	if (oWorkObject.Criterion) {
		// First determine all codes!
		_.each(oWorkObject.Criterion, function(oCriterion) {
			oCriterion.PACKAGE_ID = oWorkObject.PACKAGE_ID;
			oCriterion.CODE = configUtil.getFullCode(oWorkObject.CODE, oCriterion.PLAIN_CODE);
			oCriterion.MODEL_CODE = oWorkObject.CODE;
		});

		// after all codes are there, set the code references
		_.each(oWorkObject.Criterion, function(oCriterion) {
			determineReferenceCriterionCodeFromId(oWorkObject.Criterion, oCriterion, "PARENT_CRITERION_ID", "PARENT_CRITERION_CODE",
				"CRITERION_INVALID_PARENT_CRITERION_CODE", addMessage);

			determineReferenceCriterionCodeFromId(oWorkObject.Criterion, oCriterion, "X_AXIS_CRITERION_ID", "X_AXIS_CRITERION_CODE",
				"CRITERION_X_AXIS_CRITERION_CODE_INVALID", addMessage);

			determineReferenceCriterionCodeFromId(oWorkObject.Criterion, oCriterion, "Y_AXIS_CRITERION_ID", "Y_AXIS_CRITERION_CODE",
				"CRITERION_Y_AXIS_CRITERION_CODE_INVALID", addMessage);

			determineReferenceCriterionCodeFromId(oWorkObject.Criterion, oCriterion, "VIS_PARAM_1_CRITERION_ID", "VIS_PARAM_1_CRITERION_CODE",
				"CRITERION_VIS_PARAM_1_CRITERION_CODE_INVALID", addMessage);

			determineReferenceCriterionCodeFromId(oWorkObject.Criterion, oCriterion, "VIS_PARAM_2_CRITERION_ID", "VIS_PARAM_2_CRITERION_CODE",
				"CRITERION_VIS_PARAM_2_CRITERION_CODE_INVALID", addMessage);
		});
	}
}

const iMaxInt = 9007199254740992; // Max Int
const iMinInt = -9007199254740992; // Min Int

function determineNumValueMinMax(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	// determinations only exist on root node
	if (!oWorkObject.Criterion) {
	    return;
	}
	_.each(oWorkObject.Criterion, function(oCriterion) {
		if ((oCriterion.VALUE_OPTION_LIST_CODE) && (oCriterion.DATATYPE_CODE === DataType.DataType.Integer || oCriterion.DATATYPE_CODE ==
			DataType.DataType.Numeric)) {
			// if there is a value list, determine the min max out of the value list
			var oValueOptionListAO = aof.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
			var oValueOptionList = oValueOptionListAO.read(oCriterion.VALUE_OPTION_LIST_CODE);
			if (!oValueOptionList) {
				// error message value option list does not exist
				addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_VALUE_OPTION_LIST_INVALID, oCriterion.ID, "Criterion",
					"VALUE_OPTION_LIST_CODE", oCriterion.VALUE_OPTION_LIST_CODE);
			}
			determineNumValueMinMaxFromValueOptionList(oCriterion, oValueOptionList);
		}
	});
	_.each(oWorkObject.Criterion, function(oCriterion) {
		if (!oCriterion.PARENT_CRITERION_CODE || oCriterion.PARENT_CRITERION_CODE === "") {
			if (oCriterion.DATATYPE_CODE == DataType.DataType.Integer || oCriterion.DATATYPE_CODE == DataType.DataType.Numeric) {
				var sAggregationType = oCriterion.AGGREGATION_TYPE;
				if (sAggregationType === AggregationType.AggregationType.Sum) {
					determineNumValueMinMaxSum(oCriterion, oWorkObject.Criterion);
				} else if (sAggregationType === AggregationType.AggregationType.Avg) {
					determineNumValueMinMaxAvg(oCriterion, oWorkObject.Criterion);
				} else if (sAggregationType === AggregationType.AggregationType.FORMULA) {
					determineNumValueMinMaxFormula(oCriterion, oWorkObject.Criterion);
				} else {
					determineNumValueMinMaxInterval(oCriterion, oWorkObject.Criterion);
				}
			} else if (oCriterion.DATATYPE_CODE === DataType.DataType.Text) {
				// No aggregation allowed with Text
				oCriterion.AGGREGATION_TYPE = null;
			}
		} 
	});
}

function determineNumValueMinMaxFromValueOptionList(oCriterion, oValueOptionList) {
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
}

function determineNumValueMinMaxInterval(oCriterion, aCriterion) {
	// if the criterion is a parent and data type is integer or numeric: add up min and max value to the total
	var iMinValue = iMaxInt;
	var iMaxValue = iMinInt;
	var iStepSize = 0;
	_.each(aCriterion, function(oCriterionChild) {
		if (oCriterionChild.PARENT_CRITERION_CODE && oCriterionChild.PARENT_CRITERION_CODE == oCriterion.CODE && (oCriterionChild.DATATYPE_CODE ==
			DataType.DataType.Integer || oCriterionChild.DATATYPE_CODE == DataType.DataType.Numeric)) {
			if (oCriterionChild.NUM_VALUE_MIN < iMinValue) {
				iMinValue = oCriterionChild.NUM_VALUE_MIN;
			}
			if (oCriterionChild.NUM_VALUE_MAX > iMaxValue) {
				iMaxValue = oCriterionChild.NUM_VALUE_MAX;
			}
			if (oCriterionChild.NUM_VALUE_STEP_SIZE > iStepSize) {
				iStepSize = oCriterionChild.NUM_VALUE_STEP_SIZE;
			}
		}
	});
	// set the values if changed
	if (iMinValue < iMaxInt) {
		oCriterion.NUM_VALUE_MIN = iMinValue;
	}
	if (iMaxValue > iMinInt) {
		oCriterion.NUM_VALUE_MAX = iMaxValue;
	}
	if (iStepSize > 0) {
		oCriterion.NUM_VALUE_STEP_SIZE = iStepSize;
	}
}

function determineNumValueMinMaxSum(oCriterion, aCriterion) {
	// if the criterion is a root and data type is integer or numeric: add up min and max value to the total
	var iMinValue = null;
	var iMaxValue = null;
	var iStepSize = 0;
	_.each(aCriterion, function(oCriterionChild) {
		if (oCriterionChild.PARENT_CRITERION_CODE && oCriterionChild.PARENT_CRITERION_CODE === oCriterion.CODE && (oCriterionChild.DATATYPE_CODE ==
			DataType.DataType.Integer || oCriterionChild.DATATYPE_CODE === DataType.DataType.Numeric)) {
			if (oCriterionChild.NUM_VALUE_MIN || oCriterionChild.NUM_VALUE_MIN === 0) {
				iMinValue = iMinValue + oCriterionChild.NUM_VALUE_MIN;
			}
			if (oCriterionChild.NUM_VALUE_MAX || oCriterionChild.NUM_VALUE_MAX === 0) {
				iMaxValue = iMaxValue + oCriterionChild.NUM_VALUE_MAX;
			}
			if (oCriterionChild.NUM_VALUE_STEP_SIZE > iStepSize) {
				iStepSize = oCriterionChild.NUM_VALUE_STEP_SIZE;
			}
		}
	});
	// set the values if changed
	if (iMinValue !== null) {
		oCriterion.NUM_VALUE_MIN = iMinValue;
	}

	if (iMaxValue !== null) {
		oCriterion.NUM_VALUE_MAX = iMaxValue;
	}
	if (iStepSize > 0) {
		oCriterion.NUM_VALUE_STEP_SIZE = iStepSize;
	}
}

function determineNumValueMinMaxFormula(oCriterion, aCriterion) {
    if(!oCriterion.FORMULA){
        return;
    }
	var iMinValue = null;
	var iMaxValue = null;
	function getShortCriterionCode(sCode) {
		if (!sCode) {
			return "";
		}
		if (sCode.lastIndexOf(".") > -1) {
			return sCode.substr(sCode.lastIndexOf(".") + 1);
		}
		return sCode;
	}
	var aValues = aCriterion,
		sFormula_min = oCriterion.FORMULA,
		sFormula_max = oCriterion.FORMULA,
		aReplaceValues = sFormula_min.match(/\$([^+\-*\/\s\)\(,]+)/gm),
		nCurrentValue_min = void 0, nCurrentValue_max = void 0;
	for (var i = 0; i < aValues.length; i++) {
		for (var j = 0; j < aReplaceValues.length; j++) {
			if (aReplaceValues[j] === "$" + getShortCriterionCode(aValues[i].CODE)) {
				nCurrentValue_min = aValues[i].NUM_VALUE_MIN;
				nCurrentValue_max = aValues[i].NUM_VALUE_MAX;
				if (!aValues[i].AGGREGATION_TYPE && (aValues[i].DATATYPE_CODE === "NUMERIC" || aValues[i].DATATYPE_CODE === "INTEGER")) {
					var weight = aValues[i].WEIGHT;
					if (!weight) {
						weight = 100;
					}
					nCurrentValue_min *= (Number(weight) || 100) / 100;
					nCurrentValue_max *= (Number(weight) || 100) / 100;
				}
				sFormula_min = sFormula_min.replace(aReplaceValues[j], nCurrentValue_min);
				sFormula_max = sFormula_max.replace(aReplaceValues[j], nCurrentValue_max);
			}
		}
	}
	try {
		iMinValue = Math.round(Number(eval(sFormula_min)) * 100) / 100;
		if(oCriterion.DATATYPE_CODE === DataType.DataType.Integer){
		    iMinValue = Math.round(iMinValue);
		}
	} catch (ex) {
		iMinValue = iMinInt;
	}
	try {
		iMaxValue = Math.round(Number(eval(sFormula_max)) * 100) / 100;
		if(oCriterion.DATATYPE_CODE === DataType.DataType.Integer){
		    iMaxValue = Math.round(iMaxValue);
		}
	} catch (ex) {
		iMaxValue = iMaxInt;
	}

	// set the values if changed
	if (iMinValue !== null && !oCriterion.NUM_VALUE_MIN && oCriterion.NUM_VALUE_MIN !== 0) {
		oCriterion.NUM_VALUE_MIN = iMinValue;
	}

	if (iMaxValue !== null && !oCriterion.NUM_VALUE_MAX) {
		oCriterion.NUM_VALUE_MAX = iMaxValue;
	}
	oCriterion.NUM_VALUE_STEP_SIZE = null;
}

function determineNumValueMinMaxAvg(oCriterion, aCriterion) {
	// if the criterion is a root and data type is integer or numeric: add up min and max value to the total
	var iMinValue = null;
	var iMaxValue = null;
	var iMinCount = 0;
	var iMaxCount = 0;
	var iStepSize = 0;
	_.each(aCriterion, function(oCriterionChild) {
		if (oCriterionChild.PARENT_CRITERION_CODE && oCriterionChild.PARENT_CRITERION_CODE == oCriterion.CODE && (oCriterionChild.DATATYPE_CODE ==
			DataType.DataType.Integer || oCriterionChild.DATATYPE_CODE == DataType.DataType.Numeric)) {
			if (oCriterionChild.NUM_VALUE_MIN || oCriterionChild.NUM_VALUE_MIN === 0) {
				iMinValue = iMinValue + oCriterionChild.NUM_VALUE_MIN;
				iMinCount++;
			}
			if (oCriterionChild.NUM_VALUE_MAX || oCriterionChild.NUM_VALUE_MAX === 0) {
				iMaxValue = iMaxValue + oCriterionChild.NUM_VALUE_MAX;
				iMaxCount++;
			}
			if (oCriterionChild.NUM_VALUE_STEP_SIZE > iStepSize) {
				iStepSize = oCriterionChild.NUM_VALUE_STEP_SIZE;
			}
		}
	});
	// set the values if changed
	if (iMinCount !== 0) {
		oCriterion.NUM_VALUE_MIN = iMinValue / iMinCount;
	}

	if (iMaxCount !== 0) {
		oCriterion.NUM_VALUE_MAX = iMaxValue / iMaxCount;
	}
	if (iStepSize > 0) {
		oCriterion.NUM_VALUE_STEP_SIZE = iStepSize;
	}
}

function cleanupFields(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	//cleanup the non-valid combinations, UI hides fields dependent on the settings. The hidden fields shall be cleared here
	_.each(oWorkObject.Criterion, function(oCriterion) {
		cleanupFieldsCriterion(oCriterion);
	});
}

function cleanupFieldsCriterion(oCriterion) {
	if (oCriterion.PARENT_CRITERION_CODE && oCriterion.PARENT_CRITERION_CODE !== "") {
		//if the criterion is a child, it cannot be the overall result
		oCriterion.IS_OVERALL_RESULT = 0;
		//if the criterion is a child it cannot have an aggregation type
		oCriterion.AGGREGATION_TYPE = null;
	} else {
		//initialize with 0
		oCriterion.PARENT_CRITERION_CODE = null;
		oCriterion.PARENT_CRITERION_ID = 0;
	}
	if (oCriterion.DATATYPE_CODE == DataType.DataType.Text) {
		//if the data type is text, it cannot have an aggregation type
		oCriterion.AGGREGATION_TYPE = null;
		//if the data type is text, also NUM_VALUE_MIN/MAX is not allowed
		oCriterion.NUM_VALUE_MAX = null;
		oCriterion.NUM_VALUE_MIN = null;
		oCriterion.NUM_VALUE_STEP_SIZE = null;
		//if the data type is text no unit is allowed
		oCriterion.UOM_CODE = null;
	}
	if (oCriterion.DATATYPE_CODE == DataType.DataType.Boolean) {
		//if the data type is boolean, also NUM_VALUE_MIN/MAX is not allowed
		oCriterion.NUM_VALUE_MAX = null;
		oCriterion.NUM_VALUE_MIN = null;
		oCriterion.NUM_VALUE_STEP_SIZE = null;
		//if the data type is boolean no unit is allowed
		oCriterion.UOM_CODE = null;
	}
	if (!oCriterion.AGGREGATION_TYPE || oCriterion.AGGREGATION_TYPE !== AggregationType.AggregationType.Matrix) {
		//if the data type is not matrix, criterion for x/y axis and segment numbers are not allowed
		oCriterion.X_AXIS_CRITERION_ID = 0;
		oCriterion.Y_AXIS_CRITERION_ID = 0;
		oCriterion.X_AXIS_CRITERION_CODE = null;
		oCriterion.Y_AXIS_CRITERION_CODE = null;
		oCriterion.VIS_PARAM_1_CRITERION_ID = 0;
		oCriterion.VIS_PARAM_2_CRITERION_ID = 0;
		oCriterion.VIS_PARAM_1_CRITERION_CODE = null;
		oCriterion.VIS_PARAM_2_CRITERION_CODE = null;
		oCriterion.X_AXIS_SEGMENT_NO = 0;
		oCriterion.Y_AXIS_SEGMENT_NO = 0;
		//if the aggregation type also is not empty, no value list is allowed
		if (oCriterion.AGGREGATION_TYPE && oCriterion.AGGREGATION_TYPE !== "") {
			oCriterion.VALUE_OPTION_LIST_CODE = null;
		}
	}
	if (oCriterion.AGGREGATION_TYPE === AggregationType.AggregationType.Matrix) {
		oCriterion.NUM_VALUE_MAX = null;
		oCriterion.NUM_VALUE_MIN = null;
	}
	if (oCriterion.AGGREGATION_TYPE !== AggregationType.AggregationType.FORMULA) {
		oCriterion.FORMULA = null;
	}
}

function validSequenceNoCheck(vKey, oAttribute, addMessage, oContext, oNodeMetadata) {
	if (oAttribute.value < 1) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_SEQUENCE_NO, vKey, oNodeMetadata.name, "SEQUENCE_NO",
			oAttribute.value);
	}
}

function ModelCheck(oWorkObjectNode, addMessage, sMessageKey) {

	// Check the Code
	if (!oWorkObjectNode.CODE) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.MODEL_INVALID_CODE, oWorkObjectNode[sMessageKey], "Root", "CODE",
			oWorkObjectNode.CODE || undefined);
	}

	if (oWorkObjectNode.Criterion) {
		// Loop over all Criterions where PARENT_CRITERION_CODE is not initial with _.each
		// for each do a _.findWhere on all criterions and seek for CODE = current.PARENT_CRITERION_CODE
		_.each(oWorkObjectNode.Criterion, function(oCriterion) {
			if (oCriterion.PARENT_CRITERION_CODE) {
				if (oCriterion.PARENT_CRITERION_CODE == oCriterion.CODE) {
					// the parent criterion code must not be the code of the criterion itself (cycle)
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_PARENT_CRITERION_CODE, oCriterion[sMessageKey],
						"Criterion", "PARENT_CRITERION_CODE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}

				// find the actual parent
				var oParentCriterion = _.findWhere(oWorkObjectNode.Criterion, {
					CODE: oCriterion.PARENT_CRITERION_CODE,
				});
				if (!oParentCriterion) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_PARENT_CRITERION_CODE, oCriterion[sMessageKey],
						"Criterion", "PARENT_CRITERION_CODE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				} else {
					// the hierarchy must be only 2 levels deep, so the parent must not have another parent criterion
					// code
					if (oParentCriterion.PARENT_CRITERION_CODE) {
						addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_PARENT_CRITERION_CODE, oParentCriterion[sMessageKey],
							"Criterion", "PARENT_CRITERION_CODE", oParentCriterion.PLAIN_CODE || oParentCriterion[sMessageKey]);
					}
				}
			}
			// check if the x or y axis criteria is set and it must have a min and max value
			if (oCriterion.X_AXIS_CRITERION_CODE) {
				AxisCriterionCheck(oWorkObjectNode.Criterion, oCriterion, sMessageKey, "X_AXIS_CRITERION_CODE",
					"CRITERION_X_AXIS_CRITERION_CODE_INVALID", addMessage);
			}
			if (oCriterion.Y_AXIS_CRITERION_CODE) {
				AxisCriterionCheck(oWorkObjectNode.Criterion, oCriterion, sMessageKey, "Y_AXIS_CRITERION_CODE",
					"CRITERION_Y_AXIS_CRITERION_CODE_INVALID", addMessage);
			}
			if (oCriterion.VIS_PARAM_1_CRITERION_CODE) {
				VisParamCriterionCheck(oWorkObjectNode.Criterion, oCriterion, sMessageKey, "VIS_PARAM_1_CRITERION_CODE",
					"CRITERION_VIS_PARAM_1_CRITERION_CODE_INVALID", addMessage);
			}
			if (oCriterion.VIS_PARAM_2_CRITERION_CODE) {
				VisParamCriterionCheck(oWorkObjectNode.Criterion, oCriterion, sMessageKey, "VIS_PARAM_2_CRITERION_CODE",
					"CRITERION_VIS_PARAM_2_CRITERION_CODE_INVALID", addMessage);
			}
		});
		// Check if maximum one node is the overall result
		var iResultCounter = 0;
		_.each(oWorkObjectNode.Criterion, function validCriterionOverallResultCodeCheck(oCriterion) {
			if (oCriterion.IS_OVERALL_RESULT) {
				if (oCriterion.IS_OVERALL_RESULT == 1) {
					iResultCounter++;
					if (iResultCounter > 1) {
						addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_IS_OVERALL_RESULT_UNIQUE, oCriterion[sMessageKey], "Criterion",
							"IS_OVERALL_RESULT", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
					}
				}
			}
		});
	}
}

function AxisCriterionCheck(aCriterion, oCriterion, sMessageKey, sAxisCriterionCode, sErrorMessage, addMessage) {
	var oAxisCriterion = _.findWhere(aCriterion, {
		CODE: oCriterion[sAxisCriterionCode],
	});
	if (!oAxisCriterion) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage[sErrorMessage], oCriterion[sMessageKey], "Criterion", sAxisCriterionCode,
			oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
	} else {
		// the Axis Criterion must be of Datatype Integer or Numeric
		if (oAxisCriterion.DATATYPE_CODE !== DataType.DataType.Integer && oAxisCriterion.DATATYPE_CODE !== DataType.DataType.Numeric) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_DATATYPE, oAxisCriterion[sMessageKey], "Criterion",
				"DATATYPE_CODE", oAxisCriterion.PLAIN_CODE || oAxisCriterion[sMessageKey]);
		}

		// the Axis Criterion must have a min and max value
		if (!oAxisCriterion.NUM_VALUE_MIN && oAxisCriterion.NUM_VALUE_MIN !== 0) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_NUM_VALUE_MIN_INITIAL, oAxisCriterion[sMessageKey], "Criterion",
				"NUM_VALUE_MIN", oAxisCriterion.PLAIN_CODE || oAxisCriterion[sMessageKey]);
		}
		if (!oAxisCriterion.NUM_VALUE_MAX && oAxisCriterion.NUM_VALUE_MAX !== 0) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_NUM_VALUE_MAX_INITIAL, oAxisCriterion[sMessageKey], "Criterion",
				"NUM_VALUE_MAX", oAxisCriterion.PLAIN_CODE || oAxisCriterion[sMessageKey]);
		}
		if (oAxisCriterion.NUM_VALUE_MAX <= oAxisCriterion.NUM_VALUE_MIN) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_NUM_VALUE_INTERVAL_INVALID, oAxisCriterion[sMessageKey],
				"Criterion", "NUM_VALUE_MAX", oAxisCriterion.PLAIN_CODE || oAxisCriterion[sMessageKey]);
		}
	}
}

function VisParamCriterionCheck(aCriterion, oCriterion, sMessageKey, sVisParamCriterionCode, sErrorMessage, addMessage) {
	var oVisParamCriterion = _.findWhere(aCriterion, {
		CODE: oCriterion[sVisParamCriterionCode],
	});
	if (!oVisParamCriterion) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage[sErrorMessage], oCriterion[sMessageKey], "Criterion", sVisParamCriterionCode,
			oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
	} else {
		// the Vis Param (Inner/Outer Circle) Criterion must be of Datatype Integer or Numeric
		if (oVisParamCriterion.DATATYPE_CODE != DataType.DataType.Integer && oVisParamCriterion.DATATYPE_CODE != DataType.DataType.Numeric) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_INVALID_DATATYPE, oVisParamCriterion[sMessageKey], "Criterion",
				"DATATYPE_CODE", oVisParamCriterion.PLAIN_CODE || oVisParamCriterion[sMessageKey]);
		}
	}
}

function CriterionCheck(oWorkObjectNode, addMessage, sMessageKey) {
	_.each(oWorkObjectNode, function(oCriterion) {

		// Check the Code
		if (!oCriterion.CODE) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.MODEL_INVALID_CODE, oCriterion[sMessageKey], "Criterion", "CODE",
				oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
		}

		// check the aggregation types
		if (oCriterion.AGGREGATION_TYPE) {
			if (oCriterion.AGGREGATION_TYPE === AggregationType.AggregationType.Matrix) {
				if (!oCriterion.X_AXIS_CRITERION_CODE) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_X_AXIS_CRITERION_CODE_INITIAL, oCriterion[sMessageKey],
						"Criterion", "X_AXIS_CRITERION_ID", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}
				if (!oCriterion.Y_AXIS_CRITERION_CODE) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_Y_AXIS_CRITERION_CODE_INITIAL, oCriterion[sMessageKey],
						"Criterion", "Y_AXIS_CRITERION_ID", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}
				if (!oCriterion.X_AXIS_SEGMENT_NO) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_X_AXIS_SEGMENT_NO_INITIAL, oCriterion[sMessageKey], "Criterion",
						"X_AXIS_SEGMENT_NO", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}
				if (!oCriterion.Y_AXIS_SEGMENT_NO) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_Y_AXIS_SEGMENT_NO_INITIAL, oCriterion[sMessageKey], "Criterion",
						"Y_AXIS_SEGMENT_NO", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}
			}else if(oCriterion.AGGREGATION_TYPE === AggregationType.AggregationType.FORMULA){
			    if(!oCriterion.FORMULA){
			        addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_FORMULA_INVALID, oCriterion[sMessageKey], "Criterion",
						"FORMULA", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
			    }
			}
		} else if (oCriterion.DATATYPE_CODE) {
			// no aggregation happening
			if (oCriterion.DATATYPE_CODE == DataType.DataType.Integer || oCriterion.DATATYPE_CODE == DataType.DataType.Numeric) {
				// Make sure min and max are maintained correctly
				if (oCriterion.NUM_VALUE_MIN !== undefined && oCriterion.NUM_VALUE_MAX !== undefined) {
					if (oCriterion.NUM_VALUE_MAX < oCriterion.NUM_VALUE_MIN) {
						addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_NUM_VALUE_INTERVAL_INVALID, oCriterion[sMessageKey],
							"Criterion", "NUM_VALUE_MAX", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
					}
				}
				if (oCriterion.NUM_VALUE_STEP_SIZE < 0) {
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_NUM_VALUE_STEP_SIZE_NEGATIVE, oCriterion[sMessageKey],
						"Criterion", "NUM_VALUE_STEP_SIZE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}

				// max - min should be a multiple of the step size
				if (oCriterion.NUM_VALUE_STEP_SIZE &&
					oCriterion.NUM_VALUE_MIN !== undefined &&
					oCriterion.NUM_VALUE_MAX !== undefined &&
					((oCriterion.NUM_VALUE_MAX - oCriterion.NUM_VALUE_MIN) % oCriterion.NUM_VALUE_STEP_SIZE) !== 0) {
					addMessage(Message.MessageSeverity.Warning, EvaluationMessage.CRITERION_NUM_VALUE_STEP_SIZE_INVALID, oCriterion[sMessageKey],
						"Criterion", "NUM_VALUE_STEP_SIZE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}

				// Step size without min/max does not make sense
				if (oCriterion.NUM_VALUE_STEP_SIZE &&
					(oCriterion.NUM_VALUE_MIN === undefined ||
						oCriterion.NUM_VALUE_MAX === undefined)) {
					addMessage(Message.MessageSeverity.Warning, EvaluationMessage.CRITERION_NUM_VALUE_STEP_SIZE_INVALID, oCriterion[sMessageKey],
						"Criterion", "NUM_VALUE_STEP_SIZE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				}
			}
			// if there is a value list, check if it has the same data type
			if (oCriterion.VALUE_OPTION_LIST_CODE) {
				var oValueOptionList = configUtil.readStageObject(oCriterion.VALUE_OPTION_LIST_CODE, "sap.ino.xs.object.basis.ValueOptionList");
				if (!oValueOptionList) {
					// error message value option list does not exist
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_VALUE_OPTION_LIST_INVALID, oCriterion[sMessageKey], "Criterion",
						"VALUE_OPTION_LIST_CODE", oCriterion.PLAIN_CODE || oCriterion[sMessageKey]);
				} else if (oValueOptionList.DATATYPE_CODE != oCriterion.DATATYPE_CODE) {
					// error message: value option list must have the same data type as the criterion
					addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_VALUE_OPTION_LIST_WRONG_DATATYPE, oCriterion[sMessageKey],
						"Criterion", "VALUE_OPTION_LIST_CODE", oCriterion.VALUE_OPTION_LIST_CODE, oCriterion[sMessageKey]);
				}
			}
		}
	});
}

function RootNodeCheck(vKey, oWorkObjectNode, addMessage, oContext) {
	ModelCheck(oWorkObjectNode, addMessage, "ID");
}

function CriterionNodeCheck(vKey, oWorkObjectNode, addMessage, oContext) {
	CriterionCheck(oWorkObjectNode, addMessage, "ID");
}

function activationCheck(oActiveConfiguration, oStage, addMessage, oContext) {
	ModelCheck(oStage, addMessage, "CODE");
	CriterionCheck(oStage.Criterion, addMessage, "CODE");
	if (oActiveConfiguration) {
		checkUpdateAllowed(oStage, oActiveConfiguration, oStage.CODE, addMessage, oContext.getHQ());
	}
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	determineCode(vKey, oWorkObject, oPersistedObject, addMessage, undefined, oContext);
	checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oContext.getHQ());
}

function isModelUsed(sCode, oHQ) {
	return configUtil.isCodeUsed("sap.ino.xs.object.evaluation.Model", "Root", sCode, oHQ);
}

function isCriterionUsed(sCode, oHQ) {
	return configUtil.isCodeUsed("sap.ino.xs.object.evaluation.Model", "Criterion", sCode, oHQ);
}

function isCriteriaUsed(aCriterion, oHQ) {
	// loop over all criterions and check if any of that is already used.
	for (var i = 0; i < aCriterion.length; i++) {
		var sCriterionCode = aCriterion[i].CODE;
		var bIsUsed = isCriterionUsed(sCriterionCode, oHQ);
		if (bIsUsed === true) {
			return true;
		}
	}
	return false;
}

function checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
	if (!oPersistedObject) {
		return;
	}

	var bCriterionUsed = isCriteriaUsed(oPersistedObject.Criterion, oHQ);
	var bModelUsed = isModelUsed(oPersistedObject.CODE, oHQ);

	var aWorkCriterion = _.sortBy(oWorkObject.Criterion, "CODE");
	var aPersistedCriterion = _.sortBy(oPersistedObject.Criterion, "CODE");

	//assure the workobject is cleaned (check may called before in the cleanUpFields determination)
	_.each(aWorkCriterion, function(oCriterion) {
		cleanupFieldsCriterion(oCriterion);
	});

	//To allow a proper update, run the cleanup of the fields also for the persisted object
	//so changes regarding the cleanup operations are ignored here, which is ok
	//the workobject was already cleaned before in the cleanUpFields determination
	_.each(aPersistedCriterion, function(oCriterion) {
		cleanupFieldsCriterion(oCriterion);
	});
	
	if (oWorkObject.CALC_FORMULA !== oPersistedObject.CALC_FORMULA && bCriterionUsed) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.EVALUATION_MODEL_UNCHANGEABLE, vKey, "Root", "CALC_FORMULA",
			oPersistedObject.CALC_FORMULA);
	}
	if (oWorkObject.ENABLE_FORMULA !== oPersistedObject.ENABLE_FORMULA && bCriterionUsed) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.EVALUATION_MODEL_UNCHANGEABLE, vKey, "Root", "ENABLE_FORMULA",
			oPersistedObject.CALC_FORMULA);
	}
	
	var bIsEqual = _.isEqualOmit(aWorkCriterion, aPersistedCriterion, ["DEFAULT_TEXT", "DEFAULT_LONG_TEXT"]);

	// if evaluations have been created the criteria may not be changed any more
	// Sort before comparison as the order is significant when comparing arrays
	if (!bIsEqual && bCriterionUsed) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_UNCHANGEABLE, vKey, "Root", "", oPersistedObject.DEFAULT_TEXT);
	}
	// the code may not be changed when evaluations or campaign references exist
	// an undefined plain code may happen if we are in the activation, there only the final code exists!
	if (oWorkObject.PLAIN_CODE) {
		if ((oWorkObject.PLAIN_CODE !== oPersistedObject.PLAIN_CODE) && (bCriterionUsed || bModelUsed)) {
			addMessage(Message.MessageSeverity.Error, EvaluationMessage.MODEL_CODE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
		}
	}
}

function deleteEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
	var oHQ = oContext.getHQ();
	if (isModelUsed(oPersistedObject.CODE, oHQ) || isCriteriaUsed(oPersistedObject.Criterion, oHQ)) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.CRITERION_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function copyEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configAvailableCheck(vKey, oPersistedObject, addMessage, oContext);

	// if the Model has no ID it cannot be copied...
	if (!oPersistedObject.ID || oPersistedObject.ID <= 0) {
		addMessage(Message.MessageSeverity.Error, EvaluationMessage.MODEL_NO_COPY, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
	var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

	var sDefaultText = oWorkObject.DEFAULT_TEXT;
	var sPrefix = textBundle.getText("uitexts", "BO_MODEL_COPY_PREFIX", [], "", false, oContext.getHQ());
	sDefaultText = sPrefix + sDefaultText;

	// check length
	sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

	oWorkObject.DEFAULT_TEXT = sDefaultText;

	var sPlainCodeText = oWorkObject.PLAIN_CODE;
	// check length
	sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

	oWorkObject.PLAIN_CODE = sPlainCodeText;
}