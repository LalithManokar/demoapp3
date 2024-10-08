/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.EvaluationData");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.controls.EvaluationDataCriterionValue");

	/**
	 *
	 * Evaluation Data is an element representing data of an evaluation, thus there is no visual representation.
	 *
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>evaluationId: Technical integer id of the evaluation</li>
	 * <li>modelCode: Technical code of underlying evaluation model</li>
	 * <li>modelName: Human readable name of evaluation model</li>
	 * <li>modeDescription: Human readable description of evaluation model</li>
	 * <li>ideaId: Technical integer id of the evaluation's idea</li>
	 * <li>statusCode: Status code of the evaluation</li>
	 * <li>ideaPhaseCode: Phase code of the evaluation's idea</li>
	 * <li>evaluatorID: ID of person which has done the evaluation</li>
	 * <li>evaluatorName: Human readable name of person which has done the evaluation</li>
	 * <li>evaluationDate: Date when evaluation has been made</li>
	 * <li>overallResult: Overall result of the evaluation</li>
	 * </ul>
	 * </li>
	 * <li>Aggregations
	 * <ul>
	 * <li>values: Elements of type sap.ui.ino.controls.EvaluationDataCriterionValue for each value of that evaluation
	 * </ul>
	 * </li>
	 * </ul>
	 */
	sap.ui.core.Element.extend("sap.ui.ino.controls.EvaluationData", {
		metadata: {
			properties: {
				evaluationId: {
					type: "int"
				},
				modelCode: {
					type: "string"
				},
				calcFormula: {
					type: "string"
				},
				enableFormula: {
					type: "int"
				},
				comment: {
				    type: "string"
				},
				modelName: {
					type: "string"
				},
				modelDescription: {
					type: "string"
				},
				ideaId: {
					type: "int"
				},
				statusCode: {
					type: "string"
				},
				status: {
					type: "string"
				},
				ideaPhaseCode: {
					type: "string"
				},
				ideaPhase: {
					type: "string"
				},
				evaluatorId: {
					type: "int"
				},
				evaluatorName: {
					type: "string"
				},
				evaluationDate: {
					type: "string"
				},
				overallResult: {
					type: "string"
				}
			},
			aggregations: {
				"values": {
					type: "sap.ui.ino.controls.EvaluationDataCriterionValue",
					multiple: true,
					singularName: "value",
					bindable: true
				}
			}
		},

		/**
		 * @returns sap.ui.ino.controls.EvaluationDataCriterionValue whose are top level (parent criterion is null)
		 */
		findTopLevelCriterionValue: function(bIncludeOverall) {
			var aValues = this.getValues();
			var aResultValues = [];
			for (var i = 0; i < aValues.length; i++) {
				if (!aValues[i].getParentCriterionCode() && (this.criterionHasChildren(aValues[i].getCriterionCode()) || !aValues[i].getAggregationType() ||
					(bIncludeOverall || !aValues[i]
						.getIsOverallResult()))) {
					aResultValues.push(aValues[i]);
				}
			}
			return aResultValues.sort(function(oCriterion1, oCriterion2) {
				return oCriterion1.getSequenceNo() - oCriterion2.getSequenceNo();
			});
		},

		criterionHasChildren: function(sCriterionCode) {
			if (sCriterionCode) {
				var aValues = this.getValues();
				for (var i = 0; i < aValues.length; i++) {
					if (aValues[i].getParentCriterionCode() === sCriterionCode) {
						return true;
					}
				}
			}
			return false;
		},

		/**
		 * @param sParentCriterionCode
		 * @returns Array of sap.ui.ino.controls.EvaluationDataCriterionValue whose parent criterion is
		 *          sParentCriterionCode
		 */
		findValuesByParentCriterionCode: function(sParentCriterionCode) {
			if (sParentCriterionCode) {
				var aValues = this.getValues();
				var aResultValues = [];
				for (var i = 0; i < aValues.length; i++) {
					if (aValues[i].getParentCriterionCode() === sParentCriterionCode) {
						aResultValues.push(aValues[i]);
					}
				}
				return aResultValues.sort(function(oCriterion1, oCriterion2) {
					return oCriterion1.getSequenceNo() - oCriterion2.getSequenceNo();
				});
			}
			return [];
		},

		/**
		 * @returns sap.ui.ino.controls.EvaluationDataCriterionValue of aggregation type MATRIX
		 */
		findValueByAggregationTypeMatrix: function() {
			var aValues = this.getValues();
			for (var i = 0; i < aValues.length; i++) {
				if (aValues[i].getAggregationType() === "MATRIX") {
					return aValues[i];
				}
			}
			return null;
		},

		/**
		 * @param sCriterionCode
		 * @returns sap.ui.ino.controls.EvaluationDataCriterionValue for sCriterionCode
		 */
		findValueByCriterionCode: function(sCriterionCode) {
			if (sCriterionCode) {
				var aValues = this.getValues();
				for (var i = 0; i < aValues.length; i++) {
					if (aValues[i].getCriterionCode() === sCriterionCode) {
						return aValues[i];
					}
				}
			}
			return null;
		},

		/**
		 * @returns sap.ui.ino.controls.EvaluationDataCriterionValue which is overall result
		 */
		findOverallCriterionCode: function() {
			var aValues = this.getValues();
			for (var i = 0; i < aValues.length; i++) {
				if (aValues[i].getIsOverallResult() === 1) {
					return aValues[i];
				}
			}
			return null;
		},

		getCalResult: function() {
			function getShortCriterionCode(sCode) {
				if (!sCode) {
					return "";
				}
				if (sCode.lastIndexOf(".") > -1) {
					return sCode.substr(sCode.lastIndexOf(".") + 1);
				}
				return sCode;
			}
			if (this.getEnableFormula() === 0) {
				return "";
			}
			if (!this.getCalcFormula()) {
				return "";
			}
			var aValues = this.getValues(),
				sFormula = this.getCalcFormula(),
				aReplaceValues = sFormula.match(/\$([^+\-*\/\s\)\(,]+)/gm),
				nCurrentValue = void 0;
			for (var i = 0; i < aValues.length; i++) {
				for (var j = 0; j < aReplaceValues.length; j++) {
					if (aReplaceValues[j] === "$" + getShortCriterionCode(aValues[i].getCriterionCode())) {
					    nCurrentValue = aValues[i].getValue();
					    if(!aValues[i].getAggregationType() && (aValues[i].getCriterionDataType() === "NUMERIC" || aValues[i].getCriterionDataType() === "INTEGER")){
					        nCurrentValue *= (aValues[i].getWeight() || 100) / 100;
					    }
						sFormula = sFormula.replace(aReplaceValues[j], nCurrentValue);
					}
				}
			}
			try {
				return Math.round(Number(window.eval(sFormula)) * 100) / 100;
			} catch (ex) {
				return 0;
			}
		}
	});
})();