/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/type/Float",
    "sap/ui/model/type/Integer",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/model/ParseException",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject,
	CodeModel,
	Configuration,
	Float,
	Integer,
	Message,
	MessageType,
	ParseException,
	ReadSource) {
	"use strict";

	var Status = {
		Draft: "sap.ino.config.EVAL_DRAFT"
	};

	var Evaluation = ApplicationObject.extend("sap.ino.commons.models.object.Evaluation", {
		objectName: "sap.ino.xs.object.evaluation.Evaluation",

		readSource: ReadSource.getDefaultODataSource("IdeaEvaluation", {
			excludeNodes: ["Owner"]
		}),

		invalidation: {
			entitySets: ["IdeaEvaluation", "IdeaMyEvaluation", "IdeaPublishedEvaluation", "EvaluationRequestItems"]
		},

		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EVALUATION_COUNT"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EVALUATION_COUNT"]
			}],
			"modifyAndSubmit": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EVALUATION_COUNT"]
			}, {
				"objectName": "sap.ino.commons.models.object.EvaluationRequestItem",
				"objectKey": "EVAL_REQ_ITEM_ID",
				"impactedAttributes": ["STATUS_CODE"]
			}],
			"executeStatusTransition": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EVALUATION_COUNT"]
			}]
		},

		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				var iIdeaId = oDefaultData.IDEA_ID;
				var oDeferred = jQuery.Deferred();
				var oTemplatePromise = oDeferred.promise();
				if (iIdeaId > 0) {
					var oModel = objectInstance.getReadSourceModel();
					// TODO: Parallelize two requests
					var aDeferred = [];	
					var oTempDeferred = new jQuery.Deferred();
					oModel.read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate", {
						success: function(oEvaluation) {
							oTempDeferred.resolve({
								"oEvaluation": oEvaluation
							});
						},
						error: function(oError) {
							oTempDeferred.reject(oError);
						}
					});
					aDeferred.push(oTempDeferred);
					
					var oCriValDeferred = new jQuery.Deferred();
					oModel.read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate/CriterionValues", {
						success: function(oEvaluationCriterionValues) {
							oCriValDeferred.resolve({
								"oEvaluationCriterionValues": oEvaluationCriterionValues
							});
						},
						error: function(oError) {
							oCriValDeferred.reject(oError);
						}
					});
					aDeferred.push(oCriValDeferred);
					
					jQuery.when.apply(jQuery, aDeferred).done(function() {
					    var oEvaluation, oEvaluationCriterionValues;
					    jQuery.each(arguments, function(index, oData) {
							if (oData.hasOwnProperty("oEvaluation")) {
								oEvaluation = oData.oEvaluation;
							} else if (oData.hasOwnProperty("oEvaluationCriterionValues")) {
								oEvaluationCriterionValues = oData.oEvaluationCriterionValues;
							}
						});
						oEvaluation.CriterionValues = oEvaluationCriterionValues.results;
						oEvaluation = ReadSource.cleanData(oEvaluation);
						fnHandleTemplate(oEvaluation);
						oDeferred.resolve(oEvaluation);
					});
					
				// 	oModel.read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate", {
				// 		success: function(oEvaluation) {
				// 			oModel.read("/IdeaFull(" + iIdeaId + ")/EvaluationTemplate/CriterionValues", {
				// 				success: function(oEvaluationCriterionValues) {
				// 					oEvaluation.CriterionValues = oEvaluationCriterionValues.results;
				// 					oEvaluation = ReadSource.cleanData(oEvaluation);
				// 					fnHandleTemplate(oEvaluation);
				// 					oDeferred.resolve(oEvaluation);
				// 				}
				// 			});
				// 		}
				// 	});
				} else {
					fnHandleTemplate(oDefaultData);
					oDeferred.resolve(oDefaultData);
				}

				var fnHandleTemplate = function(oEvaluationTemplate) {
					var sTodaysDate = new Date();
					if (oEvaluationTemplate) {
						oEvaluationTemplate.EVALUATOR_NAME = Configuration.getCurrentUser() && Configuration.getCurrentUser().NAME;
						oEvaluationTemplate.CREATED_AT = sTodaysDate;
						oEvaluationTemplate.CHANGED_AT = sTodaysDate;
						if (oEvaluationTemplate.CriterionValues) {
							jQuery.each(oEvaluationTemplate.CriterionValues, function(iIndex, oValue) {
								if (!oValue.NUM_VALUE && oValue.NUM_VALUE_MIN !== null) {
									oValue.NUM_VALUE = oValue.NUM_VALUE_MIN;
								}
								// handle null values: convert null values to 0
								if (oValue.NUM_VALUE === null) {
									oValue.NUM_VALUE = 0;
								}
								// make sure that "0" is converted to 0
								oValue.NUM_VALUE = parseFloat(oValue.NUM_VALUE);

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
							//TODO: Replace with each
							for (var sCriterionCode in oDefaultData.aggregationData) {
								var oCriterionValue = _getCriterionByCode(aCriterionValue, sCriterionCode);
								if (oCriterionValue && (oCriterionValue.DATATYPE_CODE === "INTEGER" || oCriterionValue.DATATYPE_CODE === "NUMERIC")) {
									oCriterionValue.NUM_VALUE = oDefaultData.aggregationData[sCriterionCode];
								} else if (oCriterionValue && oCriterionValue.DATATYPE_CODE === "BOOLEAN") {
									oCriterionValue.BOOL_VALUE = oDefaultData.aggregationData[sCriterionCode];
								}
							}
						}
					}
					if (oDefaultData && oDefaultData.totalData) {
						if (aCriterionValue) {
							//TODO: Replace with each
							for (var sCriterionCode in oDefaultData.totalData) {
								var oCriterionValue = _getCriterionByCode(aCriterionValue, sCriterionCode);
								if (oCriterionValue && (oCriterionValue.DATATYPE_CODE === "INTEGER" || oCriterionValue.DATATYPE_CODE === "NUMERIC")) {
									oCriterionValue.NUM_VALUE = oDefaultData.totalData[sCriterionCode].value;
								} else if (oCriterionValue && oCriterionValue.DATATYPE_CODE === "BOOLEAN") {
									oCriterionValue.BOOL_VALUE = oDefaultData.totalData[sCriterionCode].value;
								} else if (oCriterionValue && oCriterionValue.DATATYPE_CODE === "TEXT") {
									oCriterionValue.TEXT_VALUE = oDefaultData.totalData[sCriterionCode].value;
								}
								oCriterionValue.MSG = oDefaultData.totalData[sCriterionCode].msg;
								oCriterionValue.MSG_TOOLTIP = oDefaultData.totalData[sCriterionCode].msg_tooltip;
								oCriterionValue.COMMENT = oDefaultData.totalData[sCriterionCode].comment;
							}
						}
					}
					oEvaluationTemplate.CriterionValues.sort(function(a, b) {
						return a.SEQUENCE_NO - b.SEQUENCE_NO;
					});
					if (aCriterionValue) {
						_updateCompleteCalculations(aCriterionValue);
					}
					_buildCriteriaHierarchy(oEvaluationTemplate);
				};
				if (oDefaultData.averEval) {
					jQuery.each(oDefaultData.EvalAttachments, function(index, oEval) {
						oEval.ID = objectInstance.getNextHandle();
					});
				}
				return oTemplatePromise;
			},

			onRead: function(oDefaultData, objectInstance) {
				if (oDefaultData && oDefaultData.CriterionValues) {
					oDefaultData.CriterionValues.sort(function(a, b) {
						return a.SEQUENCE_NO - b.SEQUENCE_NO;
					});
					_buildCriteriaHierarchy(oDefaultData);
				}
			},

			onPersist: function(vKey, oChangeRequest, oInstanceData, oAction, fnRegisterDirtyObject, oObjectInstance) {},

			onNormalizeData: function(oEvaluation) {
				var aCriterionValues = oEvaluation.CriterionValues;
				if (aCriterionValues) {
					jQuery.each(oEvaluation.CriterionValues, function(iIndex, oValue) {
						oValue.NUM_VALUE = parseFloat(oValue.NUM_VALUE);
						if (oValue.DATATYPE_CODE === "TEXT") {
							oValue.NUM_VALUE = null;
						}
					});
				}
				return oEvaluation;
			}
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

		updateDeltaCalculation: updateDeltaCalculation,

		addBinding: addBinding,
		addAttachment: _addAttachment,
		removeAttachment: _removeAttachment
	});

	Evaluation.Status = Status;

	var aNumValuePaths = ["NUM_VALUE", "criterion/NUM_VALUE"];

	function addBinding(oBinding) {
		/* jshint validthis: true */
		ApplicationObject.prototype.addBinding.apply(this, arguments);
		var sPath = oBinding && oBinding.sPath;
		var oContext = oBinding.getContext();
		if (sPath && aNumValuePaths && aNumValuePaths.indexOf(sPath) > -1 && oContext) {
			var oObject;
			if (sPath === "NUM_VALUE") {
				oObject = oContext.getObject();
			} else if (sPath === "criterion/NUM_VALUE") {
				oObject = oContext.getObject().criterion;
			}
			if (oObject) {
				switch (oObject.DATATYPE_CODE) {
					case "INTEGER":
						oBinding.setType(new Integer(), oBinding.sInternalType);
						break;
					case "NUMERIC":
						oBinding.setType(new Float(), oBinding.sInternalType);
						break;
				}
			}
		}
	}

	function setProperty(sPath, vValue, oContext) {
		/* jshint validthis: true */
		// IE does not know the constants
		var MIN_INT = Number.MIN_SAFE_INTEGER || -9007199254740991;
		var MAX_INT = Number.MAX_SAFE_INTEGER || 9007199254740991;
		var bSuccess = false;
		var oObject = oContext && oContext.getObject();
		if (!oContext && sPath.indexOf("/") === 0) {
			oObject = this.getData();
			sPath = sPath.substr(1);
		}

		if (sPath.indexOf("NUM_VALUE") > -1 && (vValue > MAX_INT || vValue < MIN_INT)) {
			// TODO: Replace getCore() with a different approach to get the message bundle
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			throw new ParseException(oMsg.getResourceBundle().getText("MSG_NUMERIC_INTERVAL", [vValue, MIN_INT, MAX_INT]));
		}

		if (oObject && sPath) {
			if (oObject && sPath && oObject.hasOwnProperty(sPath)) {
				if (oObject.VALUE_OPTION_LIST_CODE) {
					if (sPath === "COMMENT") {
						oObject[sPath] = vValue;
					}
					if (oObject.DATATYPE_CODE === "INTEGER" && sPath.indexOf("NUM_VALUE") > -1) {
						oObject[sPath] = vValue;
					} else if (oObject.DATATYPE_CODE === "NUMERIC" && sPath.indexOf("NUM_VALUE") > -1) {
						oObject[sPath] = vValue;
					} else if (oObject.DATATYPE_CODE === "TEXT" && sPath.indexOf("TEXT_VALUE") > -1) {
						oObject[sPath] = vValue;
					} else if (oObject.DATATYPE_CODE === "BOOLEAN" && sPath.indexOf("BOOL_VALUE") > -1) {
						oObject[sPath] = vValue;
					}
				} else {
					oObject[sPath] = vValue;
				}

			} else if (sPath.indexOf("criterion") > -1) {
				var sPropertyName = sPath.replace("criterion/", "");
				var oCriterion = oObject.criterion;
				if (oCriterion.hasOwnProperty(sPropertyName)) {
					if (oCriterion.VALUE_OPTION_LIST_CODE) {
						if (sPropertyName === "COMMENT") {
							oCriterion[sPropertyName] = vValue;
							bSuccess = true;
						}
						if (oCriterion.DATATYPE_CODE === "INTEGER" && sPath.indexOf("NUM_VALUE") > -1) {
							oCriterion[sPropertyName] = vValue;
							bSuccess = true;
						} else if (oCriterion.DATATYPE_CODE === "NUMERIC" && sPath.indexOf("NUM_VALUE") > -1) {
							oCriterion[sPropertyName] = vValue;
							bSuccess = true;
						} else if (oCriterion.DATATYPE_CODE === "TEXT" && sPath.indexOf("TEXT_VALUE") > -1) {
							oCriterion[sPropertyName] = vValue;
							bSuccess = true;
						} else if (oCriterion.DATATYPE_CODE === "BOOLEAN" && sPath.indexOf("BOOL_VALUE") > -1) {
							oCriterion[sPropertyName] = vValue;
							bSuccess = true;
						}
					} else {
						oCriterion[sPropertyName] = vValue;
						bSuccess = true;
					}
				}
			}
		}

		var aCriterionValue = this.getData().CriterionValues;
		if (arguments.length >= 3) {
			if (oContext && (sPath.indexOf("NUM_VALUE") > -1 || sPath.indexOf("BOOL_VALUE") > -1)) {
				this.updateDeltaCalculation(aCriterionValue, oContext, sPath);
			}
		} else if (arguments.length === 2) {
			if (sPath === "/CriterionValues") {
				_updateCompleteCalculations(aCriterionValue);
				//this.checkUpdate(true, false);
			}
		}

		var oData = oContext && oContext.getModel() && oContext.getModel().getData();
		if (oData) {
			var aRootCriteria = oContext.getModel().getData().CriterionValues;
			var aOverallResult = jQuery.grep(aRootCriteria, function(oCriterion, iIndex) {
				return oCriterion.IS_OVERALL_RESULT;
			});
			var aCriterionValues = oData.CriterionValues;
			var sCriterionValues = _getNumCriterion(aCriterionValues);
			var aCalcFormula = oData.MODEL_CALC_FORMULA;
			var aEnableFormula = oData.MODEL_ENABLE_FORMULA;
			if (aEnableFormula) {
				// aCalcFormula = aCalcFormula.replace(/\$/g, "");
				for (var i = 0; i < sCriterionValues.length; i++) {
					var sCriterionValue = sCriterionValues[i];
					if (sCriterionValue.DATATYPE_CODE === "NUMERIC" || sCriterionValue.DATATYPE_CODE === "INTEGER") {
						var sCriterionCode = sCriterionValue.CRITERION_CODE.split('.');
						sCriterionCode = sCriterionCode.slice(sCriterionCode.length - 1).toString();
						var sCriterionNumValue = sCriterionValue.NUM_VALUE || 0;
						sCriterionNumValue = (!sCriterionValue.AGGREGATION_TYPE && sCriterionValue.WEIGHT !== null && sCriterionValue.WEIGHT !== undefined) ?
							sCriterionNumValue * sCriterionValue.WEIGHT * 0.01 : sCriterionNumValue;
						aCalcFormula = aCalcFormula.replace(new RegExp("\\$" + sCriterionCode + "(?=[\\/+\\-*\\s,)(]|$)", 'g'), sCriterionNumValue);
					} else {
						aCalcFormula = aCalcFormula.replace(new RegExp("\\$" + sCriterionCode + "(?=[\\/+\\-*\\s,)(]|$)", 'g'), 0);
					}
				}
				oData.OV_RES_NUM_VALUE = eval(aCalcFormula);
				oData.OV_RES_DATATYPE_CODE = "NUMERIC";
			} else if (aOverallResult && aOverallResult[0]) {
				switch (oData.OV_RES_DATATYPE_CODE) {
					case "INTEGER":
						oData.OV_RES_NUM_VALUE = aOverallResult[0].NUM_VALUE;
						break;
					case "NUMERIC":
						oData.OV_RES_NUM_VALUE = aOverallResult[0].NUM_VALUE;
						break;
					case "BOOLEAN":
						oData.OV_RES_BOOL_VALUE = aOverallResult[0].BOOL_VALUE;
						break;
					case "TEXT":
						oData.OV_RES_TEXT_VALUE = aOverallResult[0].TEXT_VALUE;
						break;
				}
			}
		}
		this.checkUpdate(false, false);

		return bSuccess;
	}

	function updateDeltaCalculation(aCriterionValue, oContext, sAggregationProperty) {
		/* jshint validthis: true */
		var sPath = oContext.getPath();
		if (sPath.indexOf("/CriterionValues/") === 0 || sPath.indexOf("/criteriaHierarchy/") === 0) {
			var bCalcDone = false;
			if (_calcParentAggregation(aCriterionValue, sAggregationProperty, this.getProperty("PARENT_CRITERION_CODE", oContext))) {
				bCalcDone = true;
			}
			if (_calcMatrixAggregation(aCriterionValue)) {
				bCalcDone = true;
			}
			if (bCalcDone) {
				this.getData().CriterionValues = aCriterionValue;
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
			if (sDataType !== "INTEGER" && sDataType !== "NUMERIC") {
				return;
			}
			var oXAxisCriterionValue = _getCriterionByCode(aCriterionValue, oMatrixCriterionValue.X_AXIS_CRITERION_CODE);
			var oYAxisCriterionValue = _getCriterionByCode(aCriterionValue, oMatrixCriterionValue.Y_AXIS_CRITERION_CODE);
			if (!oXAxisCriterionValue || !oYAxisCriterionValue) {
				return;
			}

			if (oXAxisCriterionValue.NUM_VALUE_MIN === null || oXAxisCriterionValue.NUM_VALUE_MAX === null || oYAxisCriterionValue.NUM_VALUE_MIN ===
				null || oYAxisCriterionValue.NUM_VALUE_MAX === null) {
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
		if (sAggregationProperty !== "NUM_VALUE" && sAggregationProperty !== "BOOL_VALUE") {
			return;
		}
		var bChanged = false;
		if (sParentCriterionCode) {
			var oParentCriterionValue = _getCriterionByCode(aCriterionValue, sParentCriterionCode);
			if (!oParentCriterionValue) {
				return;
			}
			var aChildCriterionValue = _getCriterionsByParentCode(aCriterionValue, sParentCriterionCode);
			var sDataType = oParentCriterionValue.DATATYPE_CODE;
			var sAggregationType = oParentCriterionValue.AGGREGATION_TYPE;

			if (sDataType === "INTEGER" || sDataType === "NUMERIC") {
				if (sAggregationType === "SUM" || sAggregationType === "AVG") {
					bChanged = _aggregate(aChildCriterionValue, oParentCriterionValue, sAggregationProperty);
				}else if (sAggregationType === "FORMULA") {
					bChanged = _getFormulaValue(aCriterionValue, oParentCriterionValue, sAggregationProperty);
				}
			} else if (sDataType === "BOOLEAN") {
				if (sAggregationType === "AND" || sAggregationType === "OR") {
					var bAndValue = true;
					var bOrValue = false;
					jQuery.each(aChildCriterionValue, function(i, oCriterionValue) {
						if (oCriterionValue.DATATYPE_CODE === sDataType) {
							bAndValue = bAndValue && oCriterionValue[sAggregationProperty] && oCriterionValue[sAggregationProperty] === 1;
							if (oCriterionValue[sAggregationProperty]) {
								bOrValue = bOrValue || oCriterionValue[sAggregationProperty] === 1;
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

	function _aggregate(aChildCriterionValue, oParentCriterionValue, sAggregationProperty) {
		var sDataType = oParentCriterionValue.DATATYPE_CODE;
		var sAggregationType = oParentCriterionValue.AGGREGATION_TYPE;

		if ((sDataType === "BOOL_VALUE" || sAggregationProperty === "BOOL_VALUE") && sDataType !== sAggregationProperty) {
			return;
		}

		var fSumValue = 0;
		var fAvgCount = 0;
		jQuery.each(aChildCriterionValue, function(i, oCriterionValue) {
			if (((oCriterionValue.DATATYPE_CODE === "INTEGER" || oCriterionValue.DATATYPE_CODE === "NUMERIC") && sAggregationProperty ===
				"NUM_VALUE") || (oCriterionValue.DATATYPE_CODE === "BOOLEAN" && sAggregationProperty === "BOOL_VALUE")) {
				if (oCriterionValue[sAggregationProperty]) {
					if (oCriterionValue.WEIGHT === undefined || oCriterionValue.WEIGHT === null) {
						fSumValue += oCriterionValue[sAggregationProperty];
					} else {
						fSumValue += oCriterionValue[sAggregationProperty] * oCriterionValue.WEIGHT * 0.01;
					}
				}
				fAvgCount++;
			}
		});
		if (sAggregationType === "SUM") {
			if (sDataType === "BOOLEAN") {
				oParentCriterionValue[sAggregationProperty] = Math.max(fSumValue, 1);
			} else if (sDataType === "INTEGER") {
				if (oParentCriterionValue.WEIGHT === undefined || oParentCriterionValue.WEIGHT === null) {
					oParentCriterionValue[sAggregationProperty] = Math.round(fSumValue);
				} else {
					oParentCriterionValue[sAggregationProperty] = Math.round(fSumValue * oParentCriterionValue.WEIGHT * 0.01);
				}
			} else {
				if (oParentCriterionValue.WEIGHT === undefined || oParentCriterionValue.WEIGHT === null) {
					oParentCriterionValue[sAggregationProperty] = fSumValue;
				} else {
					oParentCriterionValue[sAggregationProperty] = fSumValue * oParentCriterionValue.WEIGHT * 0.01;
				}
			}
		} else if (sAggregationType === "AVG") {
			oParentCriterionValue[sAggregationProperty] = fSumValue / fAvgCount;
			if (sDataType === "BOOLEAN") {
				oParentCriterionValue[sAggregationProperty] = Math.round(oParentCriterionValue[sAggregationProperty]);
			} else if (sDataType === "INTEGER") {
				oParentCriterionValue[sAggregationProperty] = (oParentCriterionValue.WEIGHT === undefined || oParentCriterionValue.WEIGHT === null) ?
					Math.round(oParentCriterionValue[sAggregationProperty]) : Math.round(oParentCriterionValue[sAggregationProperty] *
						oParentCriterionValue.WEIGHT *
						0.01);
			} else {
				oParentCriterionValue[sAggregationProperty] = (oParentCriterionValue.WEIGHT === undefined || oParentCriterionValue.WEIGHT === null) ?
					oParentCriterionValue[sAggregationProperty] : oParentCriterionValue[sAggregationProperty] * oParentCriterionValue.WEIGHT * 0.01;
			}
		}
		return true;
	}
	
	function _getFormulaValue(aAllCriterionValue, oParentCriterionValue, sAggregationProperty) {
		var sDataType = oParentCriterionValue.DATATYPE_CODE;
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
				if (aReplaceValues[j] === "$" + getShortCriterionCode(aValues[i].CODE)) {
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
			var sResult = Math.round(Number(window.eval(sFormula)) * Number(oParentWeight)) / 100;
			if(sDataType === "INTEGER"){
			    sResult = Math.round(sResult);
			}
			oParentCriterionValue[sAggregationProperty] = sResult;
		} catch (ex) {
			oParentCriterionValue[sAggregationProperty] = 0;
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

	function _getRootCriteria(aCriterionValue) {
		return jQuery.map(aCriterionValue, function(oCriterionValue) {
			if (oCriterionValue.PARENT_CRITERION_CODE === null || oCriterionValue.PARENT_CRITERION_CODE === "") {
				return oCriterionValue;
			}
		});
	}

	function _getNumCriterion(aCriterionValue) {
		return jQuery.map(aCriterionValue, function(oCriterionValue) {
			if (oCriterionValue.DATATYPE_CODE === "NUMERIC" || oCriterionValue.DATATYPE_CODE === "INTEGER") {
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
	//todo how it is updated
	function _calculateOVResult(oDefaultData) {
		var oOverallResultCriterion = oDefaultData &&
			oDefaultData.criteriaHierarchy &&
			oDefaultData.criteriaHierarchy.overallResultCriterion;
		var aCriterionValues = oDefaultData.CriterionValues;
		var sCriterionValues = _getNumCriterion(aCriterionValues);
		var aCalcFormula = oDefaultData.MODEL_CALC_FORMULA;
		var aEnableFormula = oDefaultData.MODEL_ENABLE_FORMULA;
		if (aEnableFormula) {
			// 			aCalcFormula = aCalcFormula.replace(/\$/g, "");
			for (var i = 0; i < sCriterionValues.length; i++) {
				var sCriterionValue = sCriterionValues[i];
				if (sCriterionValue.DATATYPE_CODE === "NUMERIC" || sCriterionValue.DATATYPE_CODE === "INTEGER") {
					var sCriterionCode = sCriterionValue.CRITERION_CODE.split('.');
					sCriterionCode = sCriterionCode.slice(sCriterionCode.length - 1).toString();
					var sCriterionNumValue = sCriterionValue.NUM_VALUE || 0;
					if (isNaN(sCriterionNumValue)) {
						sCriterionNumValue = 0;
					}
					sCriterionNumValue = (!sCriterionValue.AGGREGATION_TYPE && sCriterionValue.WEIGHT !== null && sCriterionValue.WEIGHT !== undefined) ?
						sCriterionNumValue * sCriterionValue.WEIGHT * 0.01 : sCriterionNumValue;
					aCalcFormula = aCalcFormula.replace(new RegExp("\\$" + sCriterionCode + "(?=[\\/+\\-*\\s,)(]|$)", 'g'), sCriterionNumValue);
				} else {
					aCalcFormula = aCalcFormula.replace(new RegExp("\\$" + sCriterionCode + "(?=[\\/+\\-*\\s,)(]|$)", 'g'), 0);
				}
			}
			oDefaultData.OV_RES_NUM_VALUE = eval(aCalcFormula);
			oDefaultData.OV_RES_DATATYPE_CODE = "NUMERIC";
		} else if (oOverallResultCriterion) {
			oDefaultData.OV_RES_NUM_VALUE = oOverallResultCriterion.NUM_VALUE;
			oDefaultData.OV_RES_BOOL_VALUE = oOverallResultCriterion.BOOL_VALUE;
			oDefaultData.OV_RES_DATATYPE_CODE = oOverallResultCriterion.DATATYPE_CODE;
			oDefaultData.OV_RES_VALUE_OPTION_LIST_CODE = oOverallResultCriterion.VALUE_OPTION_LIST_CODE;
			oDefaultData.OV_RES_UOM_CODE = oOverallResultCriterion.UOM_CODE;
		}
	}

	function _buildCriteriaHierarchy(oDefaultData) {
		var oHierarchy = {};

		var aCriterionValues = oDefaultData.CriterionValues;
		var aRootCriteria = _getRootCriteria(aCriterionValues);
		var aOverallResult = jQuery.grep(aRootCriteria, function(oCriterion, iIndex) {
			return oCriterion.IS_OVERALL_RESULT;
		});
		oHierarchy.overallResultCriterion = aOverallResult[0];
		var aAggregatingCriteria = jQuery.grep(aRootCriteria, function(oCriterion, iIndex) {
			return oCriterion.IS_OVERALL_RESULT === 0;
		});
		oHierarchy.aggregatingCriteria = [];
		if (aOverallResult && aOverallResult.length > 0 && aOverallResult[0].AGGREGATION_TYPE !== "MATRIX") {
			oHierarchy.aggregatingCriteria.push({
				criterion: oHierarchy.overallResultCriterion,
				children: _getCriterionsByParentCode(aCriterionValues, oHierarchy.overallResultCriterion.CRITERION_CODE)
			});
		}
		if (aAggregatingCriteria && aAggregatingCriteria.length > 0) {
			jQuery.each(aAggregatingCriteria, function(iIndex, oCriterion) {
				oHierarchy.aggregatingCriteria.push({
					criterion: oCriterion,
					children: _getCriterionsByParentCode(aCriterionValues, oCriterion.CRITERION_CODE)
				});
			});
		}

		//TODO: put into separate function
		jQuery.each(aCriterionValues, function(iIndex, oCriterion) {
			if (oCriterion.VALUE_OPTION_LIST_CODE) {
				var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oCriterion.VALUE_OPTION_LIST_CODE;
				oCriterion.valueOptionList = CodeModel.getCodes(sCodeTable, function(oCode) {
					return oCode.ACTIVE === 1;
				});
			}
			if(oCriterion.NUM_VALUE){
			    oCriterion.NUM_VALUE = Math.round(oCriterion.NUM_VALUE * 100) / 100;
			}
		});

		oDefaultData.criteriaHierarchy = oHierarchy;
		if (oDefaultData.OV_RES_DATATYPE_CODE || oDefaultData.MODEL_ENABLE_FORMULA) {
			_calculateOVResult(oDefaultData);
		}
	}

	function _addAttachment(oNewAttachment) {
		oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
		this.addChild(oNewAttachment, "EvalAttachments");
	}

	function _removeAttachment(iId) {
		var aAttachment = jQuery.grep(this.getProperty("/EvalAttachments") || [], function(oAttachment) {
			return oAttachment.ID === iId;
		});
		var oFirstAttachment = aAttachment && aAttachment[0];
		if (oFirstAttachment) {
			this.removeChild(oFirstAttachment);
		}
	}

	Evaluation.createAverageEvaluation = function(iIdeaId, aEvaluationsCriterion, oSettings, aEvalAttachments, sComment) {
		var oAggregationData = {};
		var oAggregationDataCount = {};
		var oAggregationDataType = {};

		var fnAggregation = function(oEvaluationCriterion, sValueField) {
			var fAggregationValue = oAggregationData[oEvaluationCriterion.CRITERION_CODE];
			if (!fAggregationValue) {
				fAggregationValue = 0;
			}
			fAggregationValue += parseFloat(oEvaluationCriterion[sValueField]) || 0;
			oAggregationData[oEvaluationCriterion.CRITERION_CODE] = fAggregationValue;

			var iAggregationDataCount = oAggregationDataCount[oEvaluationCriterion.CRITERION_CODE];
			if (!iAggregationDataCount) {
				iAggregationDataCount = 0;
			}
			iAggregationDataCount++;
			oAggregationDataCount[oEvaluationCriterion.CRITERION_CODE] = iAggregationDataCount;

			var sAggregationDataType = oAggregationDataType[oEvaluationCriterion.CRITERION_CODE];
			if (!sAggregationDataType) {
				sAggregationDataType = oEvaluationCriterion.DATATYPE_CODE;
				oAggregationDataType[oEvaluationCriterion.CRITERION_CODE] = sAggregationDataType;
			}
		};

		jQuery.each(aEvaluationsCriterion, function(iIndex, aEvaluationCriterion) {
			jQuery.each(aEvaluationCriterion, function(iCriterionIndex, oEvaluationCriterion) {
				if (oEvaluationCriterion.DATATYPE_CODE === "INTEGER" || oEvaluationCriterion.DATATYPE_CODE === "NUMERIC") {
					fnAggregation(oEvaluationCriterion, "NUM_VALUE");
				} else if (oEvaluationCriterion.DATATYPE_CODE === "BOOLEAN") {
					fnAggregation(oEvaluationCriterion, "BOOL_VALUE");
				}
			});
		});

		for (var sCriterionCode in oAggregationData) {
			var fValue = oAggregationData[sCriterionCode];
			var iCount = oAggregationDataCount[sCriterionCode];
			var sDataType = oAggregationDataType[sCriterionCode];
			fValue = fValue / iCount;
			if (sDataType === "INTEGER" || sDataType === "BOOLEAN") {
				fValue = Math.round(fValue);
			} else if (sDataType === "NUMERIC") {
				fValue = Math.round(fValue * 100) / 100;
			}
			oAggregationData[sCriterionCode] = fValue;
		}

		var aEvalAttachs = [];
		jQuery.each(aEvalAttachments, function(index, evalAttach) {
			aEvalAttachs = aEvalAttachs.concat(evalAttach);
		});

		var oEval = new Evaluation({
			IDEA_ID: iIdeaId,
			aggregationData: oAggregationData,
			averEval: true,
			COMMENT: sComment,
			EvalAttachments: aEvalAttachs
		}, oSettings);
		return oEval;
	};

	Evaluation.createTotalEvaluation = function(iIdeaId, aEvaluationsCriterion, oSettings, aEvalAttachments, sComment, nEvaluationId,
		fnFormat) {
		var oTotalData = {};
		var oAggregationDataType = {};

		var fnAggregation = function(oEvaluationCriterion, sValueField) {
			oTotalData[oEvaluationCriterion.CRITERION_CODE] = oTotalData[oEvaluationCriterion.CRITERION_CODE] || {
				comment: ""
			};
			var fAggregationValue = oTotalData[oEvaluationCriterion.CRITERION_CODE].value;
			if (!fAggregationValue) {
				fAggregationValue = 0;
			}
			fAggregationValue += parseFloat(oEvaluationCriterion[sValueField]) || 0;

			oTotalData[oEvaluationCriterion.CRITERION_CODE].value = fAggregationValue;
			oTotalData[oEvaluationCriterion.CRITERION_CODE].maxVal = parseFloat(oEvaluationCriterion.NUM_VALUE_MAX) || 0;
			oTotalData[oEvaluationCriterion.CRITERION_CODE].minVal = parseFloat(oEvaluationCriterion.NUM_VALUE_MIN) || -9007199254740991;

			var sAggregationDataType = oAggregationDataType[oEvaluationCriterion.CRITERION_CODE];
			if (!sAggregationDataType) {
				sAggregationDataType = oEvaluationCriterion.DATATYPE_CODE;
				oAggregationDataType[oEvaluationCriterion.CRITERION_CODE] = sAggregationDataType;
			}
		};
		jQuery.each(aEvaluationsCriterion, function(iIndex, aEvaluationCriterion) {
			jQuery.each(aEvaluationCriterion, function(iCriterionIndex, oEvaluationCriterion) {
				oTotalData[oEvaluationCriterion.CRITERION_CODE] = oTotalData[oEvaluationCriterion.CRITERION_CODE] || {
					comment: ""
				};
				if (oEvaluationCriterion.DATATYPE_CODE === "INTEGER" || oEvaluationCriterion.DATATYPE_CODE === "NUMERIC") {
					fnAggregation(oEvaluationCriterion, "NUM_VALUE");
				} else if (oEvaluationCriterion.DATATYPE_CODE === "BOOLEAN") {
					if (oTotalData[oEvaluationCriterion.CRITERION_CODE].value === undefined || oTotalData[oEvaluationCriterion.CRITERION_CODE].value === null) {
						oTotalData[oEvaluationCriterion.CRITERION_CODE].value = oEvaluationCriterion.BOOL_VALUE;
					}
				} else if (oEvaluationCriterion.DATATYPE_CODE === "TEXT") {
					if (!oTotalData[oEvaluationCriterion.CRITERION_CODE].value || oTotalData[oEvaluationCriterion.CRITERION_CODE].value.trim().length === 0) {
						oTotalData[oEvaluationCriterion.CRITERION_CODE].value = oEvaluationCriterion.TEXT_VALUE;
					}
				}
				oTotalData[oEvaluationCriterion.CRITERION_CODE].comment += " " + (oEvaluationCriterion.COMMENT || "");
			});
		});

		for (var sCriterionCode in oTotalData) {
			var sDataType = oAggregationDataType[sCriterionCode];
			if (oTotalData[sCriterionCode].hasOwnProperty("maxVal")) {
				var nMax = oTotalData[sCriterionCode].maxVal;
				if (nMax && oTotalData[sCriterionCode].value > nMax) {
					var oMsg = fnFormat([oTotalData[sCriterionCode].value, nMax],1);
					oTotalData[sCriterionCode].msg = oMsg.msg;
					oTotalData[sCriterionCode].msg_tooltip = oMsg.msg_tooltip;
					oTotalData[sCriterionCode].value = nMax;
				}
			}
			if (oTotalData[sCriterionCode].hasOwnProperty("minVal")) {
				var nMin = oTotalData[sCriterionCode].minVal;
				if (nMin && oTotalData[sCriterionCode].value < nMin) {
					var oMinMsg = fnFormat([oTotalData[sCriterionCode].value, nMin],2);
					oTotalData[sCriterionCode].msg = oMinMsg.msg;
					oTotalData[sCriterionCode].msg_tooltip = oMinMsg.msg_tooltip;
					oTotalData[sCriterionCode].value = nMin;
				}
			}
			if (sDataType === "INTEGER") {
				oTotalData[sCriterionCode].value = Math.round(oTotalData[sCriterionCode].value);
			} else if (sDataType === "NUMERIC") {
				oTotalData[sCriterionCode].value = Math.round(oTotalData[sCriterionCode].value * 100) / 100;
			}
		}

		var aEvalAttachs = [];
		jQuery.each(aEvalAttachments, function(index, evalAttach) {
			aEvalAttachs = aEvalAttachs.concat(evalAttach);
		});

		var oEval = new Evaluation({
			IDEA_ID: iIdeaId,
			totalData: oTotalData,
			averEval: true,
			EvalAttachments: aEvalAttachs,
			COMMENT: sComment
		}, oSettings);
		return oEval;
	};

	return Evaluation;
});