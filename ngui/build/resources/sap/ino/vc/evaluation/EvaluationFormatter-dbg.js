/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/base/Object",
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/models/aof/PropertyModelCache"
], function(CodeModel,
	NumberFormat,
	Object,
	ObjectFormatter,
	PropertyModel,
	PropertyModelCache) {
	"use strict";

	var oFloatNumberFormat = NumberFormat.getFloatInstance({
		maxFractionDigits: 2
	});

	var oEvaluationFormatter = Object.extend("sap.ino.vc.evaluation.EvaluationFormatter", {});
	jQuery.extend(oEvaluationFormatter, ObjectFormatter);

	var fnEvaluationCreateFormatter = PropertyModel.getStaticActionEnabledStaticFormatter(
		"sap.ino.xs.object.evaluation.Evaluation", "create", function(iIdeaId) {
			return {
				IDEA_ID: iIdeaId
			};
		});

	var fnEvaluationCreateDynamicFormatter = PropertyModel.getStaticActionEnabledDynamicFormatter(
		"sap.ino.xs.object.evaluation.Evaluation", "create", function(iIdeaId) {
			return {
				IDEA_ID: iIdeaId
			};
		});

	var fnEvaluationRequestCreateFormatter = PropertyModel.getStaticActionEnabledDynamicFormatter(
		"sap.ino.xs.object.evaluation.EvaluationRequest", "create", function(iIdeaId) {
			return {
				IDEA_ID: iIdeaId
			};
		});
	/**
	 * Get formatted value
	 *
	 * @param sDataType
	 *            Data type
	 * @param fNumValue
	 *            Numeric/Integer Value
	 * @param bBoolValue
	 *            Boolean Value
	 * @param sTextValue
	 *            Text Value
	 * @param sVoLCode
	 *            Value Option List Code
	 * @param sUoMCode
	 *            Unit of Measure Code
	 * @returns {String} Formatted value
	 */
	oEvaluationFormatter.getFormattedValue = function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode, aValueOptionList,
		oController) {
		var vValue = oEvaluationFormatter.getValue(sDataType, fNumValue, bBoolValue, sTextValue);
		var sFormattedValue = "";
		if (sVoLCode) {
			var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sVoLCode;
			var vRawValue = oEvaluationFormatter.getRawValue(sDataType, fNumValue, bBoolValue, sTextValue);
			sFormattedValue = CodeModel.getText(sCodeTable, vRawValue);
		} else {
			switch (sDataType) {
				case "INTEGER":
					sFormattedValue = Math.round(vValue).toString();
					break;
				case "NUMERIC":
					sFormattedValue = oFloatNumberFormat.format(oEvaluationFormatter.toFloat(vValue));
					break;
				case "BOOLEAN":
					sFormattedValue = oEvaluationFormatter.booleanValueToString(vValue, oController ? oController : this);
					break;
				case "TEXT":
					sFormattedValue = vValue;
					break;
				default:
					sFormattedValue = vValue.toString();
					break;
			}
		}
		if (!sFormattedValue) {
			sFormattedValue = "";
		}
		if (sUoMCode) {
			sFormattedValue = sFormattedValue + " " + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", sUoMCode);
		}
		return sFormattedValue;
	};

	oEvaluationFormatter.getFormattedValueEvaluations = function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode, aValueOptionList,
		oController) {
		var vValue = oEvaluationFormatter.getValueEvaluations(sDataType, fNumValue, bBoolValue, sTextValue);
		var sFormattedValue = "";
		if (sVoLCode) {
			var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sVoLCode;
			var vRawValue = oEvaluationFormatter.getRawValue(sDataType, fNumValue, bBoolValue, sTextValue);
			sFormattedValue = CodeModel.getText(sCodeTable, vRawValue);
		} else {
			switch (sDataType) {
				case "INTEGER":
					sFormattedValue = Math.round(vValue).toString();
					break;
				case "NUMERIC":
					sFormattedValue = oFloatNumberFormat.format(oEvaluationFormatter.toFloat(vValue));
					break;
				case "BOOLEAN":
					sFormattedValue = oEvaluationFormatter.booleanValueToString(vValue, oController ? oController : this);
					break;
				case "TEXT":
					sFormattedValue = vValue;
					break;
				default:
					sFormattedValue = vValue.toString();
					break;
			}
		}
		if (!sFormattedValue) {
			sFormattedValue = "";
		}
		if (sUoMCode) {
			sFormattedValue = sFormattedValue + " " + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", sUoMCode);
		}
		return sFormattedValue;
	};


	/**
	 * Get visibility of formatted value
	 *
	 * @param sDataType
	 *            Data type
	 * @param fNumValue
	 *            Numeric/Integer Value
	 * @param bBoolValue
	 *            Boolean Value
	 * @param sTextValue
	 *            Text Value
	 * @param sVoLCode
	 *            Value Option List Code
	 * @param sUoMCode
	 *            Unit of Measure Code
	 * @returns {String} Formatted value
	 */
	oEvaluationFormatter.isFormattedValueVisible = function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode,
		aValueOptionList, oController) {
		if (!oController) {
			oController = this;
		}
		var sFormattedValue = oEvaluationFormatter.getFormattedValue(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode,
			aValueOptionList, oController);
		return sFormattedValue ? sFormattedValue.trim().length > 0 : false;
	};

	/**
	 * Get Value according to specified data type
	 *
	 * @param sDataType
	 *            Data type
	 * @param fNumValue
	 *            Numeric/Integer Value
	 * @param bBoolValue
	 *            Boolean Value
	 * @param sTextValue
	 *            Text Value
	 * @returns Value according to specified data type
	 */
	oEvaluationFormatter.getValue = function(sDataType, fNumValue, bBoolValue, sTextValue) {
		var vValue = null;
		switch (sDataType) {
			case "INTEGER":
				vValue = Math.round(fNumValue);
				break;
			case "NUMERIC":
				vValue = typeof fNumValue === "string" ? oFloatNumberFormat.parse(fNumValue) : fNumValue;
				break;
			case "BOOLEAN":
				vValue = bBoolValue === 1;
				break;
			case "TEXT":
				vValue = sTextValue;
				break;
			default:
				break;
		}
		switch (sDataType) {
			case "INTEGER":
			case "NUMERIC":
				if (isNaN(vValue) || vValue === undefined || vValue === null) {
					vValue = 0;
				}
				break;
			case "BOOLEAN":
				if (vValue === undefined || vValue === null) {
					vValue = false;
				}
				break;
			case "TEXT":
				if (vValue === undefined || vValue === null) {
					vValue = "";
				}
				break;
			default:
				if (vValue === undefined || vValue === null) {
					vValue = "";
				}
				break;
		}
		return vValue;
	};
	
	oEvaluationFormatter.getValueEvaluations = function(sDataType, fNumValue, bBoolValue, sTextValue) {
		var vValue = null;
		switch (sDataType) {
			case "INTEGER":
				vValue = Math.round(fNumValue);
				break;
			case "NUMERIC":
			    fNumValue = parseFloat(fNumValue);
				vValue = typeof fNumValue === "string" ? oFloatNumberFormat.parse(fNumValue) : fNumValue;
				break;
			case "BOOLEAN":
				vValue = bBoolValue === 1;
				break;
			case "TEXT":
				vValue = sTextValue;
				break;
			default:
				break;
		}
		switch (sDataType) {
			case "INTEGER":
			case "NUMERIC":
				if (isNaN(vValue) || vValue === undefined || vValue === null) {
					vValue = 0;
				}
				break;
			case "BOOLEAN":
				if (vValue === undefined || vValue === null) {
					vValue = false;
				}
				break;
			case "TEXT":
				if (vValue === undefined || vValue === null) {
					vValue = "";
				}
				break;
			default:
				if (vValue === undefined || vValue === null) {
					vValue = "";
				}
				break;
		}
		return vValue;
	};	

	/**
	 * Get Raw Value according to specified data type
	 *
	 * @param sDataType
	 *            Data type
	 * @param fNumValue
	 *            Numeric/Integer Value
	 * @param bBoolValue
	 *            Boolean Value
	 * @param sTextValue
	 *            Text Value
	 * @returns Value according to specified data type
	 */
	oEvaluationFormatter.getRawValue = function(sDataType, fNumValue, bBoolValue, sTextValue) {
		var vValue = null;
		switch (sDataType) {
			case "INTEGER":
				vValue = fNumValue;
				if (jQuery.type(fNumValue)) {
					vValue = parseInt(fNumValue, 10);
				}
				break;
			case "NUMERIC":
				vValue = fNumValue;
				if (jQuery.type(fNumValue) === 'string') {
                	var oRawFloatNumberFormat = NumberFormat.getFloatInstance({});				    
					vValue = oRawFloatNumberFormat.parse(fNumValue);
				} else {
				    vValue = parseFloat(fNumValue, 10);
				}
				break;
			case "BOOLEAN":
				vValue = bBoolValue;
				break;
			case "TEXT":
				vValue = sTextValue;
				break;
			default:
				break;
		}
		if (sDataType !== "TEXT" && (isNaN(vValue) || vValue === undefined || vValue === null)) {
			switch (sDataType) {
				case "INTEGER":
				case "NUMERIC":
				case "BOOLEAN":
					vValue = 0;
					break;
				default:
					vValue = "";
					break;
			}
		}
		return vValue;
	};

    oEvaluationFormatter.getWeight = function(sWeight){
        var vWeight = null;
        if(sWeight === undefined || sWeight === null){
            vWeight = "";
        }else {
            vWeight = "\(" + sWeight + "\%" + "\)";
        }
        return vWeight;
    };
    
    oEvaluationFormatter.getWeightMultiply = function(sWeight){
        var vWeight = null;
        if(sWeight === undefined || sWeight === null){
            vWeight = "";
        }else {
            vWeight = "\*" + sWeight + "\%";
        }
        return vWeight;
    };

	oEvaluationFormatter.booleanValueToString = function(iValue, oController) {
		if (iValue === undefined || iValue === null) {
			return oController.getText("EVALUATION_FLD_UNKNOWN");
		} else if (iValue === 1 || iValue === true) {
			return oController.getText("EVALUATION_FLD_YES");
		} else if (iValue === 0 || iValue === false) {
			return oController.getText("EVALUATION_FLD_NO");
		} else {
			return oController.getText("EVALUATION_FLD_UNKNOWN");
		}
	};

	oEvaluationFormatter.hasSubcriteria = function(aChildren) {
		if (aChildren && aChildren.length > 0) {
			return true;
		}
		return false;
	};

	oEvaluationFormatter.isComboBoxControl = function(sVOLCode) {
		if (sVOLCode) {
			return true;
		}
		return false;
	};

	function matchesTypeVoL(sDatatypeCode, sVOLCode, sType) {
		if (sDatatypeCode === sType && oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return true;
		}
		return false;
	}

	oEvaluationFormatter.isTextVoL = function(sDatatypeCode, sVOLCode) {
		return matchesTypeVoL(sDatatypeCode, sVOLCode, "TEXT");
	};

	oEvaluationFormatter.isIntegerVoL = function(sDatatypeCode, sVOLCode) {
		return matchesTypeVoL(sDatatypeCode, sVOLCode, "INTEGER");
	};

	oEvaluationFormatter.isNumericVoL = function(sDatatypeCode, sVOLCode) {
		return matchesTypeVoL(sDatatypeCode, sVOLCode, "NUMERIC");
	};

	oEvaluationFormatter.isBooleanVoL = function(sDatatypeCode, sVOLCode) {
		return matchesTypeVoL(sDatatypeCode, sVOLCode, "BOOLEAN");
	};

	oEvaluationFormatter.isTextControl = function(sDatatypeCode, sVOLCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		return sDatatypeCode === "TEXT";
	};

	oEvaluationFormatter.isBooleanControl = function(sDatatypeCode, sVOLCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		return sDatatypeCode === "BOOLEAN";
	};

	oEvaluationFormatter.isInputControl = function(sDatatypeCode, sVOLCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		return sDatatypeCode === "NUMERIC" || sDatatypeCode === "INTEGER";
	};

	oEvaluationFormatter.isProgressIndicatorControl = function(sNumValueMin, sNumValueMax, sVOLCode, sDatatypeCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		if (sDatatypeCode !== "INTEGER" && sDatatypeCode !== "NUMERIC") {
			return false;
		}
		if (sNumValueMin === undefined || sNumValueMin === null ||
			sNumValueMax === undefined || sNumValueMax === null) {
			return false;
		}
		if (sNumValueMin === sNumValueMax) {
			return false;
		}
		return true;
	};

	oEvaluationFormatter.isProgressIndicator = function(sNumValueMin, sNumValueMax, sVOLCode, sDatatypeCode) {
		if (oEvaluationFormatter.isProgressIndicatorControl(sNumValueMin, sNumValueMax, sVOLCode, sDatatypeCode)) {
			return "true";
		}
		return "false";
	};

	oEvaluationFormatter.formatSliderStep = function(sNumValueMin, sNumValueMax, sNumValueStepSize, sDatatypeCode) {
		if (jQuery.isNumeric(sNumValueMin) && jQuery.isNumeric(sNumValueMax) && jQuery.isNumeric(sNumValueStepSize)) {
			var fNumValueMax = parseFloat(sNumValueMax);
			var fNumValueMin = parseFloat(sNumValueMin);
			var fNumValueStepSize = parseFloat(sNumValueStepSize);
			var fDiff = fNumValueMax - fNumValueMin;

			/** if (fNumValueStepSize === 0) {
                var fDiff = fNumValueMax - fNumValueMin;
                if (fDiff < 1 && fDiff > 0) {
                    return fDiff;
                } else {
                    return 1;
                }
            }
            return fNumValueStepSize;
        } **/
			if (sDatatypeCode === "INTEGER") {
				if (fNumValueStepSize === 0) {
					if (fDiff < 1 && fDiff > 0) {
						return fDiff;
					} else {
						return 1;
					}
				}
				return fNumValueStepSize;
			}
			if (sDatatypeCode === "NUMERIC") {
				if (fNumValueStepSize === 0) {
					if (fDiff < 1 && fDiff > 0) {
						return fDiff;
					} else {
						return 0.01;
					}
				}
				return fNumValueStepSize;
			}
		}
		return 1;
	};

	oEvaluationFormatter.showInputControl = function(sDatatypeCode, sNumValueMin, sNumValueMax, sVOLCode, aChildren) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		if (aChildren && aChildren.length > 0) {
			return false;
		}
		if ((sDatatypeCode === "INTEGER" || sDatatypeCode === "NUMERIC") && !oEvaluationFormatter.isProgressIndicatorControl(sNumValueMin,
			sNumValueMax, sVOLCode, sDatatypeCode)) {
			return true;
		}
		return false;
	};

	oEvaluationFormatter.showAggregatingProgressIndicatorControl = function(sNumValueMin, sNumValueMax, aChildren, sVOLCode, sDatatypeCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		if (aChildren && aChildren.length > 0) {
			return false;
		}
		return oEvaluationFormatter.isProgressIndicatorControl(sNumValueMin, sNumValueMax, sVOLCode, sDatatypeCode) && (sDatatypeCode ===
			"INTEGER" || sDatatypeCode === "NUMERIC");
	};

	oEvaluationFormatter.showAggregatingCheckBoxControl = function(sDatatypeCode, aChildren, sVOLCode) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		if (aChildren && aChildren.length > 0) {
			return false;
		}
		return oEvaluationFormatter.isBooleanControl(sDatatypeCode, sVOLCode);
	};

	oEvaluationFormatter.showValue = function(sDatatypeCode, sNumValueMin, sNumValueMax, sVOLCode) {
		if (sDatatypeCode === "INTEGER") {
			return oEvaluationFormatter.isProgressIndicatorControl(sNumValueMin, sNumValueMax, sVOLCode, sDatatypeCode);
		}
		return false;
	};

	oEvaluationFormatter.showTextValue = function(sDatatypeCode, sVOLCode, sNumValueMin, sNumValueMax) {
		return (oEvaluationFormatter.isTextControl(sDatatypeCode, sVOLCode) ||
			oEvaluationFormatter.isBooleanControl(sDatatypeCode) ||
			oEvaluationFormatter.showInputControl(sDatatypeCode, sNumValueMin, sNumValueMax, sVOLCode));
	};

	oEvaluationFormatter.showAggregatingValue = function(sDatatypeCode, sNumValueMin, sNumValueMax, sVOLCode, aChildren) {
		if (oEvaluationFormatter.isComboBoxControl(sVOLCode)) {
			return false;
		}
		if (aChildren && aChildren.length > 0) {
			return false;
		}
		if (oEvaluationFormatter.showInputControl(sDatatypeCode, sNumValueMin, sNumValueMax, sVOLCode, aChildren)) {
			return false;
		}
		return oEvaluationFormatter.showAggregatingValueDisplay(sDatatypeCode, sNumValueMin, sNumValueMax);
	};

	oEvaluationFormatter.showAggregatingBooleanValue = function(sDatatypeCode, aChildren) {
		return sDatatypeCode !== "TEXT" && (aChildren && aChildren.length > 0);
	};

	oEvaluationFormatter.showAggregatingValueDisplay = function(sDatatypeCode, sNumValueMin, sNumValueMax) {
		return (sDatatypeCode === "INTEGER" &&
			!oEvaluationFormatter.showInputControl(sDatatypeCode, sNumValueMin, sNumValueMax));
	};

	oEvaluationFormatter.showComment = function(sDatatypeCode, sComment) {
		if (sComment) {
			return true;
		}
		return !oEvaluationFormatter.isTextControl(sDatatypeCode);
	};
	
	oEvaluationFormatter.showWarningMsg = function(sMsg) {
		if (sMsg) {
			return true;
		}
		return false;
	};

	oEvaluationFormatter.showCommentDisplay = function(sDatatypeCode, sComment) {
		if (sComment && !oEvaluationFormatter.isTextControl(sDatatypeCode)) {
			return true;
		}
		return false;
	};
	
	oEvaluationFormatter.showEvaluationCommentDisplay = function(sComment) {
		if (sComment) {
			return true;
		}
		return false;
	};

	oEvaluationFormatter.progressIndicatorValue = function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode, sMinValue,
		sMaxValue) {
		var oValue = oEvaluationFormatter.getFormattedValue(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode, undefined, this);
		var iValue = parseInt(oValue, 10);
		var iMinValue = parseInt(sMinValue, 10);
		var iMaxValue = parseInt(sMaxValue, 10);
		if (jQuery.type(iValue) === "number" && jQuery.type(iMinValue) === "number" && jQuery.type(iMaxValue) === "number") {
			return Math.round(100 * (iValue - iMinValue) / (iMaxValue - iMinValue));
		}
		return 0;
	};

	oEvaluationFormatter.hasMyEvaluations = function(aMyEvaluations) {
		var bHas = false;
		var iIdeaId = this.getView() && this.getView().getModel && this.getView().getModel("object") && this.getView().getModel("object").getProperty(
			"/ID");
		if (iIdeaId !== undefined) {
			if (aMyEvaluations) {
				jQuery.each(aMyEvaluations, function(iIndex, oEntity) {
					if (iIndex && iIndex.indexOf("IdeaMyEvaluation") === 0 && oEntity && oEntity.IDEA_ID === iIdeaId) {
						bHas = true;
					}
				});
			}
		} else {
			bHas = true;
		}

		return bHas;
	};

	oEvaluationFormatter.statusActionCode = function(sActionCode) {
		return CodeModel.getText("sap.ino.xs.object.status.Action.Root", sActionCode);
	};

	oEvaluationFormatter.submitButtonVisible = function(sStatusCode, bEnabled, iEvaluationId) {
		if (bEnabled) {
			return true;
		}
		if (sStatusCode === 'sap.ino.config.EVAL_DRAFT' && iEvaluationId < 0) {
			return true;
		}
		return false;
	};

	oEvaluationFormatter.createEvaluationEnabled = function(iIdeaId) {
		if (iIdeaId) {
			return fnEvaluationCreateFormatter(iIdeaId);
		}
		return false;
	};

	oEvaluationFormatter.createEvaluationDynamicFormatter = function(iIdeaId) {
		if (iIdeaId) {
			return fnEvaluationCreateDynamicFormatter(iIdeaId);
		}
		return false;
	};

	oEvaluationFormatter.selfEvaluationButtonLabel = function(iIdeaId) {
		var oController = this.getView().getController();
		if (iIdeaId) {
			if (fnEvaluationCreateDynamicFormatter(iIdeaId) &&
				PropertyModel.getCacheModel().getProperty(
					"/sap.ino.xs.object.evaluation.Evaluation/actions/create/customProperties/SELF_EVALUATION_ACTIVE")) {
				return oController.getText("IDEA_OBJECT_BTN_CREATE_SELF_EVALUATION");
			}
		}
		return oController.getText("IDEA_OBJECT_BTN_CREATE_EVALUATION");
	};

	oEvaluationFormatter.createEvaluationRequestEnabled = function(iIdeaId) {
		if (iIdeaId) {
			return fnEvaluationRequestCreateFormatter(iIdeaId);
		}
		return false;
	};

	return oEvaluationFormatter;
});