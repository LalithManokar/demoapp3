/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.Evaluation");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	var Status = {
		Draft: "sap.ino.config.EVAL_DRAFT"
	};

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Evaluation", {
		objectName: "sap.ino.xs.object.evaluation.Evaluation",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("IdeaEvaluation", {
			includeNodes: [{
				name: "OverallCriterionValue",
				parentNode: "Root"
            }],
			excludeNodes: ["Owner"]
		}),
		invalidation: {
			entitySets: ["IdeaEvaluation"]
		},
		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				var oEvaluationTemplate = {};
				var iIdeaId = oDefaultData.IDEA_ID;
				if (iIdeaId > 0) {
					sap.ui.getCore().getModel().read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate", null, null, false, function(oEvaluation) {
						oEvaluationTemplate = oEvaluation;
						sap.ui.getCore().getModel().read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate/CriterionValues", null, null, false, function(
							oEvaluationCriterionValues) {
							oEvaluationTemplate.CriterionValues = oEvaluationCriterionValues.results;
						});
					});
					oEvaluationTemplate = sap.ui.ino.models.core.ReadSource.cleanData(oEvaluationTemplate);
				} else {
					oEvaluationTemplate = oDefaultData;
				}
				var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
				var sTodaysDate = new Date();
				if (oEvaluationTemplate) {
					oEvaluationTemplate.EVALUATOR_NAME = oApp.getCurrentUserName();
					oEvaluationTemplate.CREATED_AT = sTodaysDate;
					oEvaluationTemplate.CHANGED_AT = sTodaysDate;
					if (oEvaluationTemplate.CriterionValues) {
						jQuery.each(oEvaluationTemplate.CriterionValues, function(iIndex, oValue) {
							if (!oValue.NUM_VALUE && oValue.NUM_VALUE_MIN != null) {
								oValue.NUM_VALUE = oValue.NUM_VALUE_MIN;
							}
							// Default Matrix value to first value of value option list
							if (oValue.AGGREGATION_TYPE === "MATRIX") {
								oValue.NUM_VALUE = 1;
							}
							oValue.ID = objectInstance.getNextHandle();
						});
					} else {
						oEvaluationTemplate.CriterionValues = [];
					}
				}
				var aCriterionValue = oEvaluationTemplate.CriterionValues;
				if (oDefaultData && oDefaultData.aggregationData) {
					if (aCriterionValue) {
						for (var sCriterionCode in oDefaultData.aggregationData) {
							var oCriterionValue = _getCriterionByCode(aCriterionValue, sCriterionCode);
							if (oCriterionValue && (oCriterionValue.DATATYPE_CODE == "INTEGER" || oCriterionValue.DATATYPE_CODE == "NUMERIC")) {
								oCriterionValue.NUM_VALUE = oDefaultData.aggregationData[sCriterionCode];
							} else if (oCriterionValue && oCriterionValue.DATATYPE_CODE == "BOOLEAN") {
								oCriterionValue.BOOL_VALUE = oDefaultData.aggregationData[sCriterionCode];
							}
						}
					}
				}
				oEvaluationTemplate.CriterionValues.sort(function(a, b) {
					return a.SEQUENCE_NO - b.SEQUENCE_NO;
				});
				if (aCriterionValue) {
					_updateCompleteCalculations(aCriterionValue);
				}
				return oEvaluationTemplate;
			},
			onRead: function(oDefaultData, objectInstance) {
				if (oDefaultData && oDefaultData.CriterionValues) {
					oDefaultData.CriterionValues.sort(function(a, b) {
						return a.SEQUENCE_NO - b.SEQUENCE_NO;
					});
				}
			},
			onPersist: function(vKey, oChangeRequest, objectInstance, oAction, fnRegisterDirtyObject) {}
		},
		actions: {
			modifyAndSubmit: {
				enabledCheck: function(oObjectInstance, bEnabled) {
					var sStatus = oObjectInstance.getProperty("/STATUS_CODE");
					return sStatus === Status.Draft;
				},
				execute: function(vKey, oObjectInstance, oParameter, oActionMetadata) {
					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oObjectInstance.modify();
					oModifyRequest.fail(oDeferred.reject);
					oModifyRequest.done(function() {
						var oSubmitRequest = oObjectInstance.submit();
						oSubmitRequest.fail(oDeferred.reject);
						oSubmitRequest.done(oDeferred.resolve);
					});
					return oDeferred.promise();
				}
			},
			del: {
				enabledCheck: function(oIdea, bEnabled) {
					if (bEnabled === undefined) {
						return false;
					}
				}
			},
			executeStatusTransition: {
				initParameter: function(oParameter, sStatusAction) {
					oParameter.STATUS_ACTION_CODE = sStatusAction;
				}
			}
		},

		setProperty: setProperty,
		updateDeltaCalculation: updateDeltaCalculation
	});

	sap.ui.ino.models.object.Evaluation.Status = Status;

	function setProperty(sPath, vValue, oContext) {
		// IE does not now the constants
		var MIN_INT = Number.MIN_SAFE_INTEGER || -9007199254740991;
		var MAX_INT = Number.MAX_SAFE_INTEGER || 9007199254740991;
		var bSuccess = false;

		if (sPath === "NUM_VALUE" && (vValue > MAX_INT || vValue < MIN_INT)) {
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			throw new sap.ui.model.ParseException(oMsg.getResourceBundle().getText("MSG_NUMERIC_INTERVAL", [vValue, MIN_INT, MAX_INT]));
		}

		bSuccess = sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, arguments);
		var aCriterionValue = this.getData().CriterionValues;
		if (arguments.length >= 3) {
			if (oContext && (sPath === "NUM_VALUE" || sPath === "BOOL_VALUE")) {
				this.updateDeltaCalculation(aCriterionValue, oContext, sPath);
			}
		} else if (arguments.length == 2) {
			if (sPath === "/CriterionValues") {
				_updateCompleteCalculations(aCriterionValue);
			}
		}
		return bSuccess;
	}

	function updateDeltaCalculation(aCriterionValue, oContext, sAggregationProperty) {
		var sPath = oContext.getPath();
		if (sPath.indexOf("/CriterionValues/") == 0) {
			var bCalcDone = false;
			if (_calcParentAggregation(aCriterionValue, sAggregationProperty, this.getProperty("PARENT_CRITERION_CODE", oContext))) {
				bCalcDone = true;
			}
			if (_calcMatrixAggregation(aCriterionValue)) {
				bCalcDone = true;
			}
			if (bCalcDone) {
				sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, ["/CriterionValues", aCriterionValue]);
			}
		}
	}

	function _updateCompleteCalculations(aCriterionValue) {
		for (var i = 0; i < aCriterionValue.length; i++) {
			var oCriterionValue = aCriterionValue[i];
			if (!oCriterionValue.PARENT_CRITERION_CODE) {
				var sDataType = oCriterionValue.DATATYPE_CODE;
				if (sDataType === "INTEGER" || sDataType === "NUMERIC") {
					_calcParentAggregation(aCriterionValue, "NUM_VALUE", oCriterionValue.CODE);
				} else if (sDataType === "BOOLEAN") {
					_calcParentAggregation(aCriterionValue, "BOOL_VALUE", oCriterionValue.CODE);
				}
			}
		}
		_calcMatrixAggregation(aCriterionValue);
	}

	function _calcMatrixAggregation(aCriterionValue) {
		var aMatrixCriterionValue = _getCriterionByAggregationTypeMatrix(aCriterionValue);
		if (aMatrixCriterionValue.length <= 0) {
			return;
		}
		for (var i = 0; i < aMatrixCriterionValue.length; i++) {
			var oMatrixCriterionValue = aMatrixCriterionValue[i];

			if (!oMatrixCriterionValue.X_AXIS_SEGMENT_NO || !oMatrixCriterionValue.X_AXIS_SEGMENT_NO) {
				return;
			}

			var sDataType = oMatrixCriterionValue.DATATYPE_CODE;
			if (sDataType != "INTEGER" && sDataType != "NUMERIC") {
				return;
			}
			var oXAxisCriterionValue = _getCriterionByCode(aCriterionValue, oMatrixCriterionValue.X_AXIS_CRITERION_CODE);
			var oYAxisCriterionValue = _getCriterionByCode(aCriterionValue, oMatrixCriterionValue.Y_AXIS_CRITERION_CODE);
			if (!oXAxisCriterionValue || !oYAxisCriterionValue) {
				return;
			}

			if (oXAxisCriterionValue.NUM_VALUE_MIN == null || oXAxisCriterionValue.NUM_VALUE_MAX == null || oYAxisCriterionValue.NUM_VALUE_MIN ==
				null || oYAxisCriterionValue.NUM_VALUE_MAX == null) {
				return;
			}

			if (oXAxisCriterionValue.NUM_VALUE < oXAxisCriterionValue.NUM_VALUE_MIN || oXAxisCriterionValue.NUM_VALUE > oXAxisCriterionValue.NUM_VALUE_MAX) {
				return;
			}

			if (oYAxisCriterionValue.NUM_VALUE < oYAxisCriterionValue.NUM_VALUE_MIN || oYAxisCriterionValue.NUM_VALUE > oYAxisCriterionValue.NUM_VALUE_MAX) {
				return;
			}

			var xSegment = Math.floor((oXAxisCriterionValue.NUM_VALUE - oXAxisCriterionValue.NUM_VALUE_MIN) / ((oXAxisCriterionValue.NUM_VALUE_MAX -
				oXAxisCriterionValue.NUM_VALUE_MIN) / oMatrixCriterionValue.X_AXIS_SEGMENT_NO)) + 1;
			xSegment = xSegment > oMatrixCriterionValue.X_AXIS_SEGMENT_NO ? oMatrixCriterionValue.X_AXIS_SEGMENT_NO : xSegment;

			var ySegment = Math.floor((oYAxisCriterionValue.NUM_VALUE - oYAxisCriterionValue.NUM_VALUE_MIN) / ((oYAxisCriterionValue.NUM_VALUE_MAX -
				oYAxisCriterionValue.NUM_VALUE_MIN) / oMatrixCriterionValue.Y_AXIS_SEGMENT_NO)) + 1;
			ySegment = ySegment > oMatrixCriterionValue.Y_AXIS_SEGMENT_NO ? oMatrixCriterionValue.Y_AXIS_SEGMENT_NO : ySegment;

			oMatrixCriterionValue.NUM_VALUE = xSegment + (ySegment - 1) * oMatrixCriterionValue.X_AXIS_SEGMENT_NO;
		}
		return true;
	}

	function _calcParentAggregation(aCriterionValue, sAggregationProperty, sParentCriterionCode) {
		if (sAggregationProperty != "NUM_VALUE" && sAggregationProperty != "BOOL_VALUE") {
			return false;
		}
		var bChanged = false;
		if (sParentCriterionCode) {
			var oParentCriterionValue = _getCriterionByCode(aCriterionValue, sParentCriterionCode);
			if (!oParentCriterionValue) {
				return false;
			}
			var aChildCriterionValue = _getCriterionsByParentCode(aCriterionValue, sParentCriterionCode);
			var sDataType = oParentCriterionValue.DATATYPE_CODE;
			var sAggregationType = oParentCriterionValue.AGGREGATION_TYPE;

			if (sDataType === "INTEGER" || sDataType === "NUMERIC") {
				if (sAggregationType === "SUM" || sAggregationType === "AVG") {
					bChanged = _aggregate(aChildCriterionValue, oParentCriterionValue, sAggregationProperty);
				} else if (sAggregationType === "FORMULA") {
					bChanged = _getFormulaValue(aCriterionValue, oParentCriterionValue, sAggregationProperty);
				}
			} else if (sDataType === "BOOLEAN") {
				if (sAggregationType === "AND" || sAggregationType === "OR") {
					var bAndValue = true;
					var bOrValue = false;
					jQuery.each(aChildCriterionValue, function(i, oCriterionValue) {
						if (oCriterionValue.DATATYPE_CODE === sDataType) {
							bAndValue = bAndValue && oCriterionValue[sAggregationProperty] && oCriterionValue[sAggregationProperty] == 1;
							if (oCriterionValue[sAggregationProperty]) {
								bOrValue = bOrValue || oCriterionValue[sAggregationProperty] == 1;
							}
						}
					});
					if (sAggregationType === "AND") {
						oParentCriterionValue[sAggregationProperty] = bAndValue ? 1 : 0;
					} else if (sAggregationType === "OR") {
						oParentCriterionValue[sAggregationProperty] = bOrValue ? 1 : 0;
					}
					bChanged = true;
				}
				if (sAggregationType === "AVG") {
					bChanged = _aggregate(aChildCriterionValue, oParentCriterionValue, sAggregationProperty);
				}
			}
			if (oParentCriterionValue.PARENT_CRITERION_CODE) {
				if (_calcParentAggregation(aCriterionValue, sAggregationProperty, oParentCriterionValue.PARENT_CRITERION_CODE)) {
					return true;
				}
			}
		}
		return bChanged;
	}

	function _getFormulaValue(aAllCriterionValue, oParentCriterionValue, sAggregationProperty) {
		var sDataType = oParentCriterionValue.DATATYPE_CODE;
		var sAggregationType = oParentCriterionValue.AGGREGATION_TYPE;

		if ((sDataType === "BOOL_VALUE" || sAggregationProperty === "BOOL_VALUE") && sDataType !== sAggregationProperty) {
			return false;
		}

		function getShortCriterionCode(sCode) {
			if (!sCode) {
				return "";
			}
			if (sCode.lastIndexOf(".") > -1) {
				return sCode.substr(sCode.lastIndexOf(".") + 1);
			}
			return sCode;
		}
		var aValues = aAllCriterionValue,
			sFormula = oParentCriterionValue.FORMULA,
			aReplaceValues = sFormula.match(/\$([^+\-*\/\s\)\(,]+)/gm),
			nCurrentValue = void 0;
		for (var i = 0; i < aValues.length; i++) {
			for (var j = 0; j < aReplaceValues.length; j++) {
				if (aReplaceValues[j] === "$" + getShortCriterionCode(aValues[i].PLAIN_CODE)) {
					nCurrentValue = aValues[i][sAggregationProperty];
					if (!aValues[i].AGGREGATION_TYPE && (aValues[i].DATATYPE_CODE === "NUMERIC" || aValues[i].DATATYPE_CODE === "INTEGER")) {
						var weight = aValues[i].WEIGHT;
						if (!weight) {
							weight = 100;
						}
						nCurrentValue *= (Number(weight) || 100) / 100;
					}
					sFormula = sFormula.replace(aReplaceValues[j], nCurrentValue);
				}
			}
		}
		try {
		    var oParentWeight = oParentCriterionValue.WEIGHT;
		    if (!oParentWeight) {
				oParentWeight = 100;
			}
			oParentCriterionValue[sAggregationProperty] = Math.round(Number(window.eval(sFormula)) * Number(oParentWeight)) / 100;
		} catch (ex) {
			oParentCriterionValue[sAggregationProperty] = 0;
		}
		return true;
	}

	function _aggregate(aChildCriterionValue, oParentCriterionValue, sAggregationProperty) {
		var sDataType = oParentCriterionValue.DATATYPE_CODE;
		var sAggregationType = oParentCriterionValue.AGGREGATION_TYPE;

		if ((sDataType === "BOOL_VALUE" || sAggregationProperty === "BOOL_VALUE") && sDataType !== sAggregationProperty) {
			return false;
		}

		var fSumValue = 0;
		var fAvgCount = 0;
		jQuery.each(aChildCriterionValue, function(i, oCriterionValue) {
			if (((oCriterionValue.DATATYPE_CODE === "INTEGER" || oCriterionValue.DATATYPE_CODE === "NUMERIC") && sAggregationProperty ===
				"NUM_VALUE") || (oCriterionValue.DATATYPE_CODE === "BOOLEAN" && sAggregationProperty === "BOOL_VALUE")) {
				if (oCriterionValue[sAggregationProperty]) {
					var weight = 100;
					if (oCriterionValue.WEIGHT || oCriterionValue.WEIGHT === 0) {
						weight = Number(oCriterionValue.WEIGHT);
					}
					fSumValue += oCriterionValue[sAggregationProperty] * weight / 100;
				}
				fAvgCount++;
			}
		});
		var pweight = 100;
		if (oParentCriterionValue.WEIGHT || oParentCriterionValue.WEIGHT === 0) {
			pweight = Number(oParentCriterionValue.WEIGHT);
		}
		if (sAggregationType === "SUM") {
			if (sDataType === "BOOLEAN") {
				oParentCriterionValue[sAggregationProperty] = Math.max(fSumValue, 1);
			} else {
				oParentCriterionValue[sAggregationProperty] = (fSumValue * pweight) / 100;
			}
		} else if (sAggregationType === "AVG") {
			oParentCriterionValue[sAggregationProperty] = (fSumValue * pweight) / (fAvgCount * 100);
			if (sDataType === "INTEGER" || sDataType === "BOOLEAN") {
				oParentCriterionValue[sAggregationProperty] = Math.round(oParentCriterionValue[sAggregationProperty]);
			}
		}
		return true;
	}

	function _getCriterionByCode(aCriterionValue, sCriterionCode) {
		return jQuery.map(aCriterionValue, function(oCriterionValue) {
			if (oCriterionValue.CODE === sCriterionCode) {
				return oCriterionValue;
			}
		})[0];
	}

	function _getCriterionsByParentCode(aCriterionValue, sParentCriterionCode) {
		return jQuery.map(aCriterionValue, function(oCriterionValue) {
			if (oCriterionValue.PARENT_CRITERION_CODE === sParentCriterionCode) {
				return oCriterionValue;
			}
		});
	}

	function _getCriterionByAggregationTypeMatrix(aCriterionValue, sCriterionCode) {
		return jQuery.map(aCriterionValue, function(oCriterionValue) {
			if (oCriterionValue.AGGREGATION_TYPE === "MATRIX") {
				return oCriterionValue;
			}
		});
	}
})();