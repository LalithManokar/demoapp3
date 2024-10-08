/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.controls.Evaluation");
jQuery.sap.require("sap.ui.ino.controls.EvaluationData");
jQuery.sap.require("sap.ui.ino.controls.EvaluationDataCriterionValue");
jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelModifyPreviewFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.EvaluationModelModifyPreviewFacet";
            },
            
            needsSavedData : function(){
                //can be overwritten: Returns true when the Facet needs a saved data state to run. 
                //TI will bring a save popup to save. If data is not saved facet will not be displayed
                return true;
            },
            
            onShow : function(){
                //it is crucial that the data of the TI was saved before the onShow is called as the preview Model needs the saved data
                var oController = this.getController();
                oController.setPreviewModel();
            },

            createFacetContent : function() {
                var oPreviewGroup = this.createLayoutPreview();
                return [oPreviewGroup];
            },

            createLayoutPreview : function() {
                var oController = this.getController();
                var oEvaluationPreview = new sap.ui.ino.controls.Evaluation({
                    visible : true,
                    editable : true,
                    displayMatrix : true,
                    displayFirstDetails : true
                });
                oEvaluationPreview.addStyleClass("sapUiInoEvaluation");

                var oEvaluationDataTemplate = this.createEvaluationDataTemplate(oController.sPreviewModelName);
                oEvaluationPreview.addData(oEvaluationDataTemplate);

                var oEvaluationDetailThingGroup = new sap.ui.ux3.ThingGroup({
                    title : this.getController().getTextPath("BO_MODEL_PREVIEW_TIT"),
                    content : [oEvaluationPreview],
                    colspan : true
                });
                return oEvaluationDetailThingGroup;
            },

            createEvaluationDataTemplate : function(sModelName) {
                var sModelPrefix = sModelName + ">";

                var oCriterionValueTemplate = new sap.ui.ino.controls.EvaluationDataCriterionValue({
                    criterionId : "{" + sModelPrefix + "ID}",
                    criterionCode : "{" + sModelPrefix + "CODE}",
                    parentCriterionCode : "{" + sModelPrefix + "PARENT_CRITERION_CODE}",
                    parentCriterionId : "{" + sModelPrefix + "PARENT_CRITERION_ID}",
                    criterionName : "{" + sModelPrefix + "DEFAULT_TEXT}",
                    criterionDescription : "{" + sModelPrefix + "DEFAULT_LONG_TEXT}",
                    criterionDataType : "{" + sModelPrefix + "DATATYPE_CODE}",
                    numValue : "{" + sModelPrefix + "NUM_VALUE}",
                    numValueMin : "{" + sModelPrefix + "NUM_VALUE_MIN}",
                    numValueMax : "{" + sModelPrefix + "NUM_VALUE_MAX}",
                    numValueStepSize : "{" + sModelPrefix + "NUM_VALUE_STEP_SIZE}",
                    textValue : "{" + sModelPrefix + "TEXT_VALUE}",
                    boolValue : "{" + sModelPrefix + "BOOL_VALUE}",
                    comment : "{" + sModelPrefix + "COMMENT}",
                    isDone : "{" + sModelPrefix + "IS_DONE}",
                    sequenceNo : "{" + sModelPrefix + "SEQUENCE_NO}",
                    isOverallResult : "{" + sModelPrefix + "IS_OVERALL_RESULT}",
                    uomCode : "{" + sModelPrefix + "UOM_CODE}",
                    valueOptionListCode : "{" + sModelPrefix + "VALUE_OPTION_LIST_CODE}",
                    aggregationType : "{" + sModelPrefix + "AGGREGATION_TYPE}",
                    xAxisCriterionCode : "{" + sModelPrefix + "X_AXIS_CRITERION_CODE}",
                    xAxisSegmentNo : "{" + sModelPrefix + "X_AXIS_SEGMENT_NO}",
                    yAxisCriterionCode : "{" + sModelPrefix + "Y_AXIS_CRITERION_CODE}",
                    yAxisSegmentNo : "{" + sModelPrefix + "Y_AXIS_SEGMENT_NO}",
                    visParam1CriterionCode : "{" + sModelPrefix + "VIS_PARAM_1_CRITERION_CODE}",
                    visParam2CriterionCode : "{" + sModelPrefix + "VIS_PARAM_2_CRITERION_CODE}",
                    weight : "{" + sModelPrefix + "WEIGHT}"
                });

                return new sap.ui.ino.controls.EvaluationData({
                    evaluationId : "{" + sModelPrefix + "/ID}",
                    modelCode : "{" + sModelPrefix + "/CODE}",
                    enableFormula : "{" + sModelPrefix + "/ENABLE_FORMULA}",
                    calcFormula : "{" + sModelPrefix + "/CALC_FORMULA}",
                    modelName : "{" + sModelPrefix + "/DEFAULT_TEXT}",
                    modelDescription : "{" + sModelPrefix + "/DEFAULT_LONG_TEXT}",
                    ideaId : "{" + sModelPrefix + "/IDEA_ID}",
                    statusCode : "{" + sModelPrefix + "/STATUS_CODE}",
                    status : {
                        path : "",
                        formatter : sap.ui.ino.models.core.CodeModel
                                .getFormatter("sap.ino.xs.object.status.Status.Root")
                    },
                    ideaPhaseCode : "{" + sModelPrefix + "/IDEA_PHASE_CODE}",
                    ideaPhase : {
                        path : "",
                        formatter : sap.ui.ino.models.core.CodeModel
                                .getFormatter("sap.ino.xs.object.campaign.Phase.Root")
                    },
                    evaluatorName : "{" + sModelPrefix + "/CHANGED_BY}",
                    evaluationDate : {
                        path : sModelPrefix + "/CHANGED_AT",
                        type : new sap.ui.model.type.Date()
                    },
                    overallResult : sap.ui.ino.views.common.ControlFactory.createValueTextBinding("OV_RES_"),
                    values : {
                        path : sModelPrefix + "/CriterionValues",
                        template : oCriterionValueTemplate,
                        sorter : [new sap.ui.model.Sorter("SEQUENCE_NO", false)],
                        templateShareable : true
                    }
                });
            }
        }));
