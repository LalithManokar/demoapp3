/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.EvaluationCollapsibleSectionCriteria");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.controls.CachedElementCloner");
	jQuery.sap.require("sap.ui.ino.controls.EvaluationData");
	jQuery.sap.require("sap.ui.ino.controls.EvaluationCriterionValue");

	jQuery.sap.require("sap.ui.ino.application.ControlFactory");

	/**
	 *
	 * The collapsible section criterion control shows criterion values of an evaluation in a collapsible section
	 * pattern: The sections are collapsible allowing to drill-down in the criterion how it is calculated.
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>editable: is control editable</li>
	 * <li>openFirstSection: Boolean indicator whether the first section (having detailed values) should be opened by
	 * default in not editable mode. All are open in edit mode.</li>
	 * <li>selectedEvaluationId: Identifier of selected evaluation</li>
	 * <li>evaluationText: Header evaluation title</li>
	 * <li>showDetailsText: Text which should be shown to indicate navigation to criterion details</li>
	 * <li>displayHeader: Boolean indicator whether to show evaluator name and evaluation date as header</li>
	 * </ul>
	 * </li>
	 * <li>Aggregations
	 * <ul>
	 * <li>data: sap.ui.ino.controls.EvaluationData element</li>
	 * <li>_criterion_sections: hidden control used for cleanup</li>
	 * <li>_criterion_details: hidden control used for cleanup</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */

	sap.ui.core.Control.extend("sap.ui.ino.controls.EvaluationCollapsibleSectionCriteria", {
		metadata: {
			properties: {
				"editable": {
					type: "boolean",
					defaultValue: true
				},
				"openFirstSection": {
					type: "boolean"
				},
				"selectedEvaluationId": {
					type: "int"
				},
				"evaluationText": {
					type: "string"
				},
				"showDetailsText": {
					type: "string"
				},
				"displayHeader": {
					type: "boolean"
				}
			},

			aggregations: {
				"data": {
					type: "sap.ui.ino.controls.EvaluationData",
					multiple: true,
					bindable: true
				},
				"_criterion_sections": {
					type: "sap.ui.ino.controls.EvaluationCriterionValue",
					multiple: true,
					visibility: "hidden"
				},
				"_criterion_details": {
					type: "sap.ui.ino.controls.EvaluationCriterionValue",
					multiple: true,
					visibility: "hidden"
				}
			}
		},

		init: function() {
			// cloner is needed in order to clone aggregations of element data passed to inner controls,
			// otherwise they would be removed from the aggregation of this control
			this._oCloner = new sap.ui.ino.controls.CachedElementCloner();
		},

		exit: function() {
			this._oCloner = null;
		},

		setSelectedEvaluation: function(iEvaluationId) {
			this.removeAllAggregation("_criterion_sections");
			this.removeAllAggregation("_criterion_details");
			this.setSelectedEvaluationId(iEvaluationId);
		},

		getSelectedEvaluation: function() {
			var oData = null;
			var aData = this.getData();

			if (!this.getSelectedEvaluationId() && aData && aData.length > 0) {
				this.setSelectedEvaluation(aData[0].getEvaluationId());
			}

			for (var i = 0; i < aData.length; i++) {
				if (aData[i].getEvaluationId() === this.getSelectedEvaluationId()) {
					oData = aData[i];
					break;
				}
			}
			return oData;
		},

		getCriterionDetails: function(iSectionIndex) {
			var aCriterionDetailControl = this.getAggregation("_criterion_details");
			for (var i = 0; i < aCriterionDetailControl.length; i++) {
				var oCriterionDetailControl = aCriterionDetailControl[i];
				if (oCriterionDetailControl.sectionIndex === iSectionIndex) {
					return oCriterionDetailControl;
				}
			}
			return null;
		},

		renderer: function(oRm, oControl) {
			var oData = oControl.getSelectedEvaluation();
			var aValues = oData && oData.getValues() || [];
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			if (!oData) {
				oRm.write("</div>");
				return;
			}
			// Title
			if (oControl.getDisplayHeader()) {
				oRm.write("<div");
				oRm.addClass("sapUiInoEvalCollapsibleTitle");
				oRm.writeClasses();
				oRm.write(">");
				if (oData.getModelCode()) {
					oRm.write("<div");
					oRm.addClass("sapUiInoEvalCollapsibleTitleEvaluation");
					oRm.writeClasses();
					oRm.write(">");
					oRm.writeEscaped(" " + oControl.getEvaluationText());
					oRm.write("</div>");
					if (oControl.getEditable()) {
						var bEnableFormula = oData.getEnableFormula();
						if (bEnableFormula === 1) {
							oRm.write("<div");
							oRm.addClass("sapUiInoEvalCollapsibleTitleOverall");
							oRm.writeClasses();
							oRm.write(">");
							oRm.writeEscaped(": " + oData.getCalResult());
							oRm.write("</div>");
						} else {
							var oOverallCriterionCode = oData.findOverallCriterionCode();
							if (oOverallCriterionCode) {
								oRm.write("<div");
								oRm.addClass("sapUiInoEvalCollapsibleTitleOverall");
								oRm.writeClasses();
								oRm.write(">");
								oRm.writeEscaped(": " + oOverallCriterionCode.getFormattedValue(true));
								oRm.write("</div>");
							}
						}
					} 
				// 	else {
				// 		var oOverallResult = oData.getOverallResult();
				// 		if (oOverallResult) {
				// 			oRm.write("<div");
				// 			oRm.addClass("sapUiInoEvalCollapsibleTitleOverall");
				// 			oRm.writeClasses();
				// 			oRm.write(">");
				// 			oRm.writeEscaped(": " + oOverallResult);
				// 			oRm.write("</div>");
				// 		}
				// 	}
					if (oData.getModelDescription()) {
						var oInfo = new sap.ui.commons.Image({
							decorative: false,
							tooltip: oData.getModelDescription()
						});
						oInfo.addStyleClass("sapUiInoEvalCollapsibleTitleModelDescr");
						oRm.renderControl(oInfo);
					}
					if (oData.getEvaluatorName()) {
						var oEvaluatorName = new sap.ui.commons.Label({
							text: oData.getEvaluatorName()
						});
						oEvaluatorName.addStyleClass("sapUiInoEvalCollapsibleTitleEvaluatorName");
						if (oData.getEvaluatorId()) {
							oEvaluatorName.setTooltip(sap.ui.ino.application.ControlFactory.createIdentityCallout(oData.getEvaluatorId()));
						}
						oRm.renderControl(oEvaluatorName);
					}
					if (oData.getEvaluationDate()) {
						oRm.write("<div");
						oRm.addClass("sapUiInoEvalCollapsibleTitleEvaluationDate");
						oRm.writeClasses();
						oRm.write(">");
						oRm.writeEscaped(" " + oData.getEvaluationDate() + " ");
						oRm.write("</div>");
					}
				}
				oRm.write("</div>");
			}

			// Section Criterion
			var aCriterionSectionControl = oControl.getAggregation("_criterion_sections");
			var aCriterionDetailControl = oControl.getAggregation("_criterion_details");

			// Exclude Overall
			var aSectionCriterionValue = oData.findTopLevelCriterionValue(false);

			if (aSectionCriterionValue && aSectionCriterionValue.length > 0 && aValues && aValues.length > 0) {
				for (var i = 0; i < aSectionCriterionValue.length; i++) {
					var oSectionCriterionValue = aSectionCriterionValue[i];
					var aDetailCriteriaValue = oData.findValuesByParentCriterionCode(oSectionCriterionValue.getCriterionCode());
					oRm.write("<div");
					oRm.addClass("sapUiInoEvalCollapsibleSectionHeader");
					oRm.writeClasses();
					oRm.write(">");

					var oCriterionSectionControl = null;
					if (!aCriterionSectionControl) {
						oCriterionSectionControl = new sap.ui.ino.controls.EvaluationCriterionValue({
							isSection: true,
							editable: oControl.getEditable(),
							initialOpen: oControl.getEditable() || (i === 0 && oControl.getOpenFirstSection() ? true : false),
							hasDetailContent: aDetailCriteriaValue && aDetailCriteriaValue.length > 0 ? true : false,
							criterionValue: [oControl._oCloner.getClone(oSectionCriterionValue, "values")],
							openCloseTriggered: function(oEvent) {
								var iSectionIndex = this.sectionIndex;
								var oCriterionDetailControl = oControl.getCriterionDetails(iSectionIndex);
								if (oCriterionDetailControl) {
									var oControlDom = jQuery(oCriterionDetailControl.getDomRef());
									if (oEvent.getParameters().open) {
										// 0: temporary fix for problems in IE
										// introduce a css animation instead
										oControlDom.slideDown(0);
									} else {
										oControlDom.slideUp(0);
									}
								}
							}
						});
						oCriterionSectionControl.sectionIndex = i;
						oControl.addAggregation("_criterion_sections", oCriterionSectionControl, true);
					} else {
						oCriterionSectionControl = aCriterionSectionControl[i];
					}
					oRm.renderControl(oCriterionSectionControl);

					oRm.write("</div>");
					// Section Criterion Details
					if (aDetailCriteriaValue && aDetailCriteriaValue.length > 0) {
						oRm.write("<div");
						oRm.addClass("sapUiInoEvalCollapsibleSectionDetail");
						oRm.writeClasses();
						oRm.write(">");
						var oCriterionDetailControl = null;
						if (!aCriterionDetailControl) {
							oCriterionDetailControl = new sap.ui.ino.controls.EvaluationCriterionValue({
								editable: oControl.getEditable(),
								criterionValue: oControl._oCloner.getClones(aDetailCriteriaValue, "values"),
								sectionCriterionValue: oCriterionSectionControl
							});
							oCriterionDetailControl.sectionIndex = i;
							oControl.addAggregation("_criterion_details", oCriterionDetailControl, true);
						} else {
							oCriterionDetailControl = oControl.getCriterionDetails(i);
						}
						oRm.renderControl(oCriterionDetailControl);

						oRm.write("</div>");
					}
				}
			}
			oRm.write("</div>");
		}
	});
})();