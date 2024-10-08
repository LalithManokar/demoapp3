/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Element"
], function(Element) {
    "use strict";

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
     * <li>values: Elements of type sap.ino.controls.EvaluationDataCriterionValue for each value of that evaluation
     * </ul>
     * </li>
     * </ul>
     */
    return Element.extend("sap.ino.controls.EvaluationData", {
        metadata: {
            properties: {
                evaluationId: {
                    type: "int"
                },
                modelCode: {
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
                    type: "sap.ino.controls.EvaluationDataCriterionValue",
                    multiple: true,
                    singularName: "value",
                    bindable: true
                }
            }
        },

        /**
         * @returns sap.ino.controls.EvaluationDataCriterionValue whose are top level (parent criterion is null)
         */
        findTopLevelCriterionValue: function(bIncludeOverall) {
            var aValues = this.getValues();
            var aResultValues = [];
            for (var i = 0; i < aValues.length; i++) {
                if (!aValues[i].getParentCriterionCode() &&
                    (this.criterionHasChildren(aValues[i].getCriterionCode()) || !aValues[i].getAggregationType() ||
                        (bIncludeOverall || !aValues[i].getIsOverallResult()))) {
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
         * @returns Array of sap.ino.controls.EvaluationDataCriterionValue whose parent criterion is
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
         * @returns sap.ino.controls.EvaluationDataCriterionValue of aggregation type MATRIX
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
         * @returns sap.ino.controls.EvaluationDataCriterionValue for sCriterionCode
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
         * @returns sap.ino.controls.EvaluationDataCriterionValue which is overall result
         */
        findOverallCriterionCode: function() {
            var aValues = this.getValues();
            for (var i = 0; i < aValues.length; i++) {
                if (aValues[i].getIsOverallResult() === 1) {
                    return aValues[i];
                }
            }
            return null;
        }
    });
});