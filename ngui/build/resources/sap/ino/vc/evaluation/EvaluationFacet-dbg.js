sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/controls/EvaluationData",
    "sap/ino/controls/EvaluationDataCriterionValue",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ui/model/Sorter",
    "sap/ino/commons/models/types/StringNumberType"
], function(BaseObjectController,
	CodeModel,
	EvaluationData,
	EvaluationDataCriterionValue,
	EvaluationFormatter,
	Sorter,
	StringNumberType) {
	"use strict";

	/**
	 * @class
	 * Facet for view controllers that are used for evaluation display and modify.
	 */
	var Evaluation = function() {
		throw "Facet may not be instantiated directly";
	};

	var oFormatter = {};
	jQuery.extend(oFormatter, EvaluationFormatter);

	Evaluation.formatter = oFormatter;

	Evaluation.onCriterionPressed = function(oEvent) {
		var oSource = oEvent.getSource();
		if (oSource) {
			var sPath = oSource.getBindingContext("object") && oSource.getBindingContext("object").getPath();
			if (sPath) {
				if (!this.oCriterionValueHelpView) {
					this.oCriterionValueHelpView = sap.ui.xmlview({
						viewName: "sap.ino.vc.evaluation.CriterionValueHelp"
					});
					this.getView().addDependent(this.oCriterionValueHelpView);
				}
				if (this.oCriterionValueHelpView && this.oCriterionValueHelpView.getController()) {
					this.oCriterionValueHelpView.getController().open(oSource, sPath);
				}
			}
		}
	};

	Evaluation.onEvaluatorPressed = function(oEvent) {
		var oSource = oEvent.getSource();
		if (oSource) {
			var iIdentityId = oSource.getBindingContext("object") &&
				oSource.getBindingContext("object").getProperty("EVALUATOR_ID");
			if (iIdentityId !== undefined && !this.oIdentityCardView) {
				this.oIdentityCardView = sap.ui.xmlview({
					viewName: "sap.ino.vc.iam.IdentityCard"
				});
				this.getView().addDependent(this.oIdentityCardView);
			}
			if (this.oIdentityCardView && this.oIdentityCardView.getController()) {
				this.oIdentityCardView.getController().open(oSource, iIdentityId);
			}
		}
	};

	Evaluation.initMatrixControl = function() {
		var oCriterionValueTemplate = new EvaluationDataCriterionValue({
			criterionId: {
				path: "object>ID",
				mode: "OneTime"
			},
			criterionCode: {
				path: "object>CODE",
				mode: "OneTime"
			},
			parentCriterionCode: {
				path: "object>PARENT_CRITERION_CODE",
				mode: "OneTime"
			},
			criterionName: {
				path: "object>CODE",
				formatter: function(sCode) {
					return oFormatter.criterionCode(sCode);
				},
				mode: "OneTime"
			},
			criterionDescription: {
				path: "object>CODE",
				formatter: function(sCode) {
					return oFormatter.criterionCodeLongText(sCode);
				},
				mode: "OneTime"
			},
			criterionDataType: {
				path: "object>DATATYPE_CODE",
				mode: "OneTime"
			},
			criterionValue: {
				parts: [{
						path: "object>TEXT_VALUE"
					},
					{
						path: "object>BOOL_VALUE"
					},
					{
						path: "object>NUM_VALUE"
					},
					{
						path: "object>DATATYPE_CODE"
					}],
				formatter: function(sTextValue, bBoolValue, iNumValue, sCriterionDataType) {
					return oFormatter.getValue(sCriterionDataType, iNumValue, bBoolValue, sTextValue);
				}
			},
			criterionLabel: {
				parts: [{
						path: "object>VALUE_OPTION_LIST_CODE"
					},
					{
						path: "object>CODE"
					},
					{
						path: "object>TEXT_VALUE"
					},
					{
						path: "object>BOOL_VALUE"
					},
					{
						path: "object>NUM_VALUE"
					},
					{
						path: "object>DATATYPE_CODE"
					}],
				formatter: function(sValueListCode, sCode, sTextValue, bBoolValue, iNumValue, sCriterionDataType) {
					var sLabel = oFormatter.criterionCode(sCode);
					var sValue = oFormatter.getValue(sCriterionDataType, iNumValue, bBoolValue, sTextValue);
					var sText = sLabel + ": ";
					if (sValueListCode) {
						var sCodeTable = CodeModel.getConfigObjectNodeForValueOptionList(sValueListCode);
						sText = sText + CodeModel.getText(sCodeTable, sValue);
					} else {
						sText = sText + sValue;
					}
					return sText;
				}
			},
			numValueMin: {
				path: "object>NUM_VALUE_MIN",
				type: new StringNumberType(),
				mode: "OneTime"
			},
			numValueMax: {
				path: "object>NUM_VALUE_MAX",
				type: new StringNumberType(),
				mode: "OneTime"
			},
			numValueStepSize: {
				path: "object>NUM_VALUE_STEP_SIZE",
				type: new StringNumberType(),
				mode: "OneTime"
			},
			comment: "{object>COMMENT}",
			isDone: "{object>IS_DONE}",
			sequenceNo: {
				path: "object>SEQUENCE_NO",
				mode: "OneTime"
			},
			isOverallResult: {
				path: "object>IS_OVERALL_RESULT",
				mode: "OneTime"
			},
			uomCode: {
				path: "object>UOM_CODE",
				mode: "OneTime"
			},
			valueOptionListLabelCodes: {
				path: "object>VALUE_OPTION_LIST_CODE",
				formatter: function(listCode) {
					if (!listCode) {
						return null;
					}
					var sCodeTable = CodeModel.getConfigObjectNodeForValueOptionList(listCode);
					var aQLabelCode = CodeModel.getCodes(sCodeTable);
					var aSortedQLabelCode = aQLabelCode.sort(function(c1, c2) {
						return c1.CODE - c2.CODE;
					});
					// Translate codes
					for (var i = 0; i < aSortedQLabelCode.length; i++) {
						aSortedQLabelCode[i].TEXT = CodeModel.getText(sCodeTable, aSortedQLabelCode[i].CODE);
					}
					return aSortedQLabelCode;
				}
			},
			aggregationType: {
				path: "object>AGGREGATION_TYPE",
				mode: "OneTime"
			},
			weight: {
				path: "object>WEIGHT",
				formatter: function(sWeight) {
					return oFormatter.getWeight(sWeight);
				},
				mode: "OneTime"
			},
			xAxisCriterionCode: {
				path: "object>X_AXIS_CRITERION_CODE",
				mode: "OneTime"
			},
			xAxisCriterionCodeLabel: {
				path: "object>X_AXIS_CRITERION_CODE",
				formatter: function(code) {
					return oFormatter.uomCode(code);
				},
				mode: "OneTime"
			},
			xAxisSegmentNo: {
				path: "object>X_AXIS_SEGMENT_NO",
				mode: "OneTime"
			},
			yAxisCriterionCode: {
				path: "object>Y_AXIS_CRITERION_CODE",
				mode: "OneTime"
			},
			yAxisCriterionCodeLabel: {
				path: "{object>Y_AXIS_CRITERION_CODE}",
				formatter: function(code) {
					return oFormatter.uomCode(code);
				},
				mode: "OneTime"
			},
			yAxisSegmentNo: {
				path: "object>Y_AXIS_SEGMENT_NO",
				mode: "OneTime"
			},
			visParam1CriterionCode: {
				path: "object>VIS_PARAM_1_CRITERION_CODE",
				mode: "OneTime"
			},
			visParam1CriterionCodeLabel: {
				path: "object>UOM_CODE",
				formatter: function(code) {
					return oFormatter.uomCode(code);
				},
				mode: "OneTime"
			},
			visParam2CriterionCode: {
				path: "object>VIS_PARAM_2_CRITERION_CODE",
				mode: "OneTime"
			},
			visParam2CriterionCodeLabel: {
				path: "object>UOM_CODE",
				formatter: function(code) {
					return oFormatter.uomCode(code);
				},
				mode: "OneTime"
			}
		});

		this._oEvalDataTemplate = new EvaluationData({
			evaluationId: "{object>ID}",
			modelCode: "{object>MODEL_CODE}",
			modelName: {
				path: "object>MODEL_CODE",
				formatter: function(sCode) {
					return oFormatter.modelCode(sCode);
				}
			},
			modelDescription: {
				path: "object>MODEL_CODE",
				formatter: function(sCode) {
					return oFormatter.modelCodeLongText(sCode);
				}
			},
			ideaId: "{object>IDEA_ID}",
			statusCode: "{object>STATUS_CODE}",
			ideaPhaseCode: "{object>IDEA_PHASE_CODE}",
			evaluatorId: "{object>EVALUATOR_ID}",
			evaluatorName: "{object>EVALUATOR_NAME}",
			evaluationDate: {
				path: "object>CHANGED_AT",
				type: new sap.ui.model.type.Date({
					style: "medium"
				})
			},
			overallResult: function() {
				return {
					parts: [{
							path: "OV_RES_DATATYPE_CODE"
						},
						{
							path: "OV_RES_NUM_VALUE"
						},
						{
							path: "OV_RES_BOOL_VALUE"
						},
						{
							path: "OV_RES_TEXT_VALUE"
						},
						{
							path: "OV_RES_VALUE_OPTION_LIST_CODE"
						},
						{
							path: "OV_RES_UOM_CODE"
						}],
					formatter: function() {
						return function(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode) {
							return oFormatter.getFormattedValue(sDataType, fNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode);
						};
					}
				};
			},
			values: {
				path: "object>CriterionValues",
				template: oCriterionValueTemplate,
				sorter: new Sorter("SEQUENCE_NO", false),
				templateShareable: true
			}
		});

		var oEvaluationMatrix = this.byId("evaluationMatrix");
		var oBinding = oEvaluationMatrix.getBinding();
		if (oBinding) {
			oBinding.attachChange(oEvaluationMatrix.prepareMatrix, oEvaluationMatrix);
		}
	};

	/*
    Evaluation.setHelp = function(sHelpId) {
        var that = this;
        var sGeneralHelp = this.getText("HELP_EXP_" + sHelpId);
        var sSpecificHelp = "";
        var oData = this.getObjectModel() && this.getObjectModel().getData();

        if (oData && oData.criteriaHierarchy) {
            
            sSpecificHelp = this.getText("HELP_EXP_EVALUATION_DESCRIPTION");
            
            var aCriteria = oData.criteriaHierarchy.aggregatingCriteria;
            aCriteria.forEach(function(oCriterion) {
                if (oCriterion.criterion && oCriterion.criterion.CRITERION_CODE) {
                    sSpecificHelp += that.getText("HELP_EXP_EVALUATION_DESCRIPTION_VALUE", 
                        [that.formatter.criterionCode(oCriterion.criterion.CRITERION_CODE), that.formatter.criterionCodeLongText(oCriterion.criterion.CRITERION_CODE)]);
                }
                oCriterion.children.forEach(function(oChild) {
                    sSpecificHelp += that.getText("HELP_EXP_EVALUATION_DESCRIPTION_CHILD_VALUE", 
                        [that.formatter.criterionCode(oChild.CRITERION_CODE), that.formatter.criterionCodeLongText(oChild.CRITERION_CODE)]);
                });
            });
        }
        
        var oComponent = this.getOwnerComponent();
        oComponent.setHelpContent("<div>" + sGeneralHelp + sSpecificHelp + this.getText("HELP_EXP_" + sHelpId + "_FOOTER") + "</div>");
    };
    */

	Evaluation.bindMatrix = function() {
		var oMatrix = this.getView().byId("evaluationMatrix");
		oMatrix.addAggregation("evalData", this._oEvalDataTemplate);
		oMatrix.bindElement({
			path: "/",
			model: "object"
		});
	};

	Evaluation.onDelete = function(oEvent) {
		var oController = this;
		var oDelBtn = oEvent.getSource();
		var oDelRequest = this.executeObjectAction("del", {
			messages: {
				confirm: "MSG_DEL_CONFIRM",
				success: "MSG_DEL_SUCCESS"
			}
		});
		oDelRequest.done(function(oResponse) {
			if (oResponse && oResponse.confirmationCancelled === true) {
				if (oDelBtn && jQuery.type(oDelBtn.focus) === "function") {
					oDelBtn.focus();
				}
				return;
			}
			oController.onDeleteNavBack("idea", true);
		});
	};

	Evaluation.onSubmit = function() {
		var oController = this;
		var oEvaluation = oController.getObjectModel();
		var bIsNew = oEvaluation.isNew();
		var oSubmitRequest = oController.executeObjectAction("modifyAndSubmit", {
			messages: {
				confirm: "EVALUATION_OBJECT_MSG_SUBMIT_CONFIRM",
				success: function() {
					return oController.getText("EVALUATION_OBJECT_MSG_SUBMIT_OK");
				}
			},
			parameters: {
				IDEA_ID: oEvaluation.getProperty("/IDEA_ID"),
				EVAL_REQ_ITEM_ID: oEvaluation.getProperty("/EVAL_REQ_ITEM_ID")
			}
		});
		oSubmitRequest.done(function(oResponse) {
			oEvaluation.getPropertyModel().getDataInitializedPromise().done(function() {
				if (oController.setStatusChangeButtons) {
					oController.setStatusChangeButtons();
				}
			});
			if (oResponse && oResponse.confirmationCancelled === true) {
				oController.byId("evaluationSubmitBtn").focus();
				return;
			}
			if (bIsNew) {
				oController.navigateTo("evaluation-display", {
					id: oEvaluation.getKey()
				}, true);
			} else {
				oController.navigateBack();
			}
		});
	};

	return Evaluation;
});