/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Element"
], function(
    Element) {
    "use strict";

    /**
     *
     * Evaluation Data Criterion Value is an element representing the single value a criterion has in an evaluation.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>criterionId: Technical id of criterion</li>
     * <li>criterionCode: Technical code of criterion</li>
     * <li>parentCriterionCode: Technical code of parent criterion</li>
     * <li>parentCriterionId: Technical id of parent criterion</li>
     * <li>criterionName: human readable name of criterion</li>
     * <li>criterionDescription: detailed description of criterion</li>
     * <li>criterionDataType: data type of criterion. Possible values: BOOLEAN, NUMERIC, INTEGER, TEXT</li>
     * <li>numValue: Value of criterion for data type numeric or integer</li>
     * <li>numValueMin: Minimum criterion value for data type numeric or integer</li>
     * <li>numValueMax: Maximum criterion value for data type numeric or integer</li>
     * <li>textValue: Value of criterion for data type text</li>
     * <li>boolValue: Value of criterion for data type boolean (0 = false, 1 = true, null = not set)</li>
     * <li>comment: Comment by the evaluator for a specific value</li>
     * <li>isDone: Flag for criterion is done</li>
     * <li>sequenceNo: Relative order of the criterion</li>
     * <li>isOverallResult: Criterion represents the evaluation overall result</li>
     * <li>uomCode: Unit of measure code</li>
     * <li>valueOptionListCode: Code for value options</li>
     * <li>aggregationType: Aggregation type (SUM, AVG, AND, OR, MATRIX)</li>
     * <li>xAxisCriterionCode: Criterion representing the x-axis of the matrix (in case of aggregation type MATRIX)</li>
     * <li>xAxisSegmentNo: Number of segments on x-axis of the matrix (in case of aggregation type MATRIX)</li>
     * <li>yAxisCriterionCode: Criterion representing the y-axis of the matrix (in case of aggregation type MATRIX)</li>
     * <li>yAxisSegmentNo: Number of segments on y-axis of the matrix (in case of aggregation type MATRIX)</li>
     * <li>visParam1CriterionCode: Criterion representing the visual parameter 1 (e.g. inner radius in case of
     * aggregation type MATRIX)</li>
     * <li>visParam2CriterionCode: Criterion representing the visual parameter 2 (e.g. outer radius in case of
     * aggregation type MATRIX)</li>
     * </ul>
     * </li>
     * </ul>
     */
    return Element.extend("sap.ino.controls.EvaluationDataCriterionValue", {
        metadata : {
            properties : {
                criterionId : {
                    type : "int"
                },

                criterionCode : {
                    type : "string"
                },

                parentCriterionCode : {
                    type : "string"
                },
                
                parentCriterionId : {
                    type : "int"
                },

                criterionName : {
                    type : "string"
                },

                criterionDescription : {
                    type : "string"
                },

                criterionDataType : {
                    type : "string"
                },

                criterionLabel: {
                    type:"string"
                },

                numValueMin : {
                    type : "float"
                },

                numValueMax : {
                    type : "float"
                },
                
                numValueStepSize : {
                    type : "float"
                },

                comment : {
                    type : "string"
                },

                isDone : {
                    type : "int"
                },

                sequenceNo : {
                    type : "int"
                },

                isOverallResult : {
                    type : "int"
                },

                uomCode : {
                    type : "string"
                },

                valueOptionListLabelCodes : {
                    type:"object"
                },

                aggregationType : {
                    type : "string"
                },
                
                weight : {
                    type : "string"
                },

                xAxisCriterionCode : {
                    type : "string"
                },

                xAxisCriterionCodeLabel : {
                    type : "string"
                },

                xAxisSegmentNo : {
                    type : "int"
                },

                yAxisCriterionCode : {
                    type : "string"
                },

                yAxisCriterionCodeLabel : {
                    type : "string"
                },

                yAxisSegmentNo : {
                    type : "int"
                },

                visParam1CriterionCode : {
                    type : "string"
                },

                visParam1CriterionCodeLabel : {
                    type : "string"
                },

                visParam2CriterionCode : {
                    type : "string"
                },

                visParam2CriterionCodeLabel : {
                    type : "string"
                },
                criterionValue: {
                    type: "string"
                }
            }
        },

        /**
         * 
         * @returns Minimum value of numeric or integer criterion
         */
        getValueMin : function() {
            switch (this.getCriterionDataType()) {
                case 'INTEGER' :
                case 'NUMERIC' :
                    return this.getNumValueMin();
                default :
                    return null;
            }
        },

        /**
         * 
         * @returns Maximum value of numeric or integer criterion
         */
        getValueMax : function() {
            switch (this.getCriterionDataType()) {
                case 'INTEGER' :
                case 'NUMERIC' :
                    return this.getNumValueMax();
                default :
                    return null;
            }
        },
        
        /**
         * 
         * @returns Step Size of numeric or integer criterion
         */
        getStepSize : function() {
            switch (this.getCriterionDataType()) {
                case 'INTEGER' :
                case 'NUMERIC' :
                    return this.getNumValueStepSize();
                default :
                    return null;
            }
        },
        
        /**
         * 
         * @returns The allowed string length of the input field
         */
        getMaxLength : function() {
            switch (this.getCriterionDataType()) {
                case 'INTEGER' :
                case 'NUMERIC' :
                    var nMaxValue = this.getNumValueMax();
                    if(nMaxValue){
                        var sMaxValue = nMaxValue.toString();
                        return sMaxValue.length;
                    }
                    return 16; //string length of MAXINT
                case 'BOOLEAN' : 
                    return 1;
                default :
                    return 5000; //HANA NVARCHAR length
            }
        }
    });
});