/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.Evaluation");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.CachedElementCloner");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationData");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationMatrix");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationMatrixItem");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationCollapsibleSectionCriteria");
    jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

    /**
     * Display evaluation
     * <ul>
     * <li>Properties
     * <ul>
     * <li>visible: is control visible</li>
     * <li>editable: is control editable</li>
     * <li>displayFirstDetails: display first details</li>
     * <li>displayMatrix: flag if evaluation matrix will be displayed if available</li> *
     * <li>displayMatrixOnly: display only matrix control and not detail list</li>
     * </ul>
     * <ul>
     * <li>Aggregations</li>
     * <ul>
     * <li>data: sap.ui.ino.controls.EvaluationData element for evaluation which is being displayed</li>
     * <li>_matrix: hidden control used for cleanup</li>
     * <li>_criterion_control: hidden control used for cleanup</li>
     * </ul>
     * </li>
     * <li>Events</li>
     * <ul>
     * <li>selectionChanged: triggered when evaluation navigation selection changes</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.Evaluation", {
        metadata : {
            properties : {
                "visible" : {
                    type : "boolean",
                    defaultValue : true
                },
                "editable" : "boolean",
                "displayFirstDetails" : {
                    type : "boolean",
                    defaultValue : true
                },
                "displayMatrix" : {
                    type : "boolean",
                    defaultValue : true
                },
                "displayMatrixOnly" : {
                    type : "boolean",
                    defaultValue : false
                }
            },
            aggregations : {
                "data" : {
                    type : "sap.ui.ino.controls.EvaluationData",
                    multiple : true,
                    singularName : "data",
                    bindable : true
                },

                "_matrix" : {
                    type : "sap.ui.ino.controls.EvaluationMatrix",
                    multiple : false,
                    visibility : "hidden"
                },

                "_criterion_control" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                selectionChanged : {}
            }
        },

        init : function() {
            this._oCloner = new sap.ui.ino.controls.CachedElementCloner();
        },

        constructor : function(sId, mSettings) {
            sap.ui.core.Control.apply(this, arguments);

            var oMatrix = new sap.ui.ino.controls.EvaluationMatrix({
                width : 325,
                height : 350,
                rMax : 30,
                legendHeight : 50,
                displayLegend : true,
                innerCircleText : "{i18n>CTRL_EVALUATION_FLD_MATRIX_INNER_CIRCLE}",
                outerCircleText : "{i18n>CTRL_EVALUATION_FLD_MATRIX_OUTER_CIRCLE}",
                clickable : !this.getEditable()
            });
            this.setAggregation("_matrix", oMatrix);
        },

        _getCriterionControl : function() {
            var oCriterionControl = this.getAggregation("_criterion_control");
            if (!oCriterionControl) {
                oCriterionControl = new sap.ui.ino.controls.EvaluationCollapsibleSectionCriteria({
                    evaluationText : "{i18n>CTRL_EVALUATION_FLD_EVALUATION}",
                    showDetailsText : "{i18n>CTRL_EVALUATION_BUT_SHOW_DETAILS}",
                    openFirstSection : this.getDisplayFirstDetails(),
                    editable : this.getEditable(),
                    displayHeader : true
                });
                this.setAggregation("_criterion_control", oCriterionControl);
            }
            return oCriterionControl;
        },

        setEditable : function(bValue) {
            this.setProperty("editable", bValue);
            var oMatrix = this.getAggregation("_matrix");
            if (oMatrix) {
                oMatrix.setClickable(!bValue);
            }
            var oPrevCriterionControl = this.getAggregation("_criterion_control");
            if (oPrevCriterionControl) {
                var aData = oPrevCriterionControl.getData();
                var selectedEvaluation = oPrevCriterionControl.getSelectedEvaluation();
                this.removeAllAggregation("_criterion_control");
                var oCriterionControl = this._getCriterionControl();
                if (aData) {
                    for (var i = 0; i < aData.length; i++) {
                        oCriterionControl.addData(aData[i]);
                    }
                }
                if (selectedEvaluation) {
                    oCriterionControl.setSelectedEvaluation(selectedEvaluation.getEvaluationId());
                }
            }
        },

        exit : function() {
            this._oCloner = null;
        },

        addAggregation : function(sAggregationName, oObject, bSuppressInvalidate) {
            sap.ui.core.Control.prototype.addAggregation.apply(this, [sAggregationName, oObject, bSuppressInvalidate]);
            if (sAggregationName === "data") {
                var oClone = this._oCloner.getClone(oObject, "data");
                var oCriterionControl = this._getCriterionControl();
                oCriterionControl.addData(oClone);
            }
        },

        removeAllAggregation : function(sName) {
            sap.ui.base.ManagedObject.prototype.removeAllAggregation.apply(this, arguments);
            if (sName === "data") {
                this.removeAllAggregation("_criterion_control");
            }
        },

        destroyAggregation : function(sName) {
            // All controls are invalid if data is destroyed
            sap.ui.base.ManagedObject.prototype.destroyAggregation.apply(this, arguments);
        },

        getTitle : function() {
            var aData = this.getData();
            // All evaluations in one control have to be instances
            // of the same model - so we can take the first one for the title
            if (aData && aData.length > 0) {
                return aData[0].getModelName();
            }
        },

        updateSelectedEvaluationId : function() {
            var aData = this.getData();
            var oCriterionControl = this._getCriterionControl();
            if (oCriterionControl && aData && aData.length > 0) {
                oCriterionControl.setSelectedEvaluation(aData[0].getEvaluationId());
            }
        },

        onBeforeRendering : function() {
            var that = this;
            var aData = this.getData();
            if (aData.length === 0)
                return;

            var oCriterionControl = this._getCriterionControl();
            if (oCriterionControl && !oCriterionControl.getSelectedEvaluationId() && aData && aData.length > 0) {
                oCriterionControl.setSelectedEvaluation(aData[0].getEvaluationId());
            }

            // Prepare matrix
            var oMatrix = this.getAggregation("_matrix");
            oMatrix.removeAllItems();
            oMatrix.setSelectedItemName(aData[0].getEvaluationId());

            for (var i = 0; i < aData.length; i++) {

                var oMatrixCriterion = aData[i].findValueByAggregationTypeMatrix();
                if (oMatrixCriterion) {

                    oMatrix.setXSegments(oMatrixCriterion.getXAxisSegmentNo());
                    oMatrix.setYSegments(oMatrixCriterion.getYAxisSegmentNo());
                    oMatrix.setQLabelValueOptionListCode(oMatrixCriterion.getValueOptionListCode());

                    var xAxisScore = aData[i].findValueByCriterionCode(oMatrixCriterion.getXAxisCriterionCode());
                    var yAxisScore = aData[i].findValueByCriterionCode(oMatrixCriterion.getYAxisCriterionCode());

                    oMatrix.setXLabel(xAxisScore.getCriterionName());
                    if (xAxisScore.getUomCode()) {
                        oMatrix.setXLabelUom(sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", xAxisScore.getUomCode()));
                    }
                    oMatrix.setYLabel(yAxisScore.getCriterionName());
                    if (yAxisScore.getUomCode()) {
                        oMatrix.setYLabelUom(sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", yAxisScore.getUomCode()));
                    }

                    var visParam1Score = undefined;
                    if (oMatrixCriterion.getVisParam1CriterionCode()) {
                        visParam1Score = aData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam1CriterionCode());
                        if (visParam1Score) {
                            oMatrix.setR1Label(visParam1Score.getCriterionName());
                            if (visParam1Score.getUomCode()) {
                                oMatrix.setR1LabelUom(sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", visParam1Score.getUomCode()));
                            }
                            if(visParam1Score.getValueOptionListCode()){
                                oMatrix.setR1ValueOptionListCode(visParam1Score.getValueOptionListCode());  
                            }
                        }
                    }

                    var visParam2Score = undefined;
                    if (oMatrixCriterion.getVisParam2CriterionCode()) {
                        visParam2Score = aData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam2CriterionCode());
                        if (visParam2Score) {
                            oMatrix.setR2Label(visParam2Score.getCriterionName());
                            if (visParam2Score.getUomCode()) {
                                oMatrix.setR2LabelUom(sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", visParam2Score.getUomCode()));
                            }
                            if(visParam2Score.getValueOptionListCode()){
                                oMatrix.setR2ValueOptionListCode(visParam2Score.getValueOptionListCode()); 
                            }
                        }
                    }

                    if (yAxisScore && xAxisScore) {
                        var oMatrixItem = new sap.ui.ino.controls.EvaluationMatrixItem({
                            name : aData[i].getEvaluationId()
                        });

                        // X-Axis
                        if (xAxisScore.getValue()) {
                            oMatrixItem.setXValue(xAxisScore.getValue());
                            oMatrixItem.setXValueDataType(xAxisScore.getCriterionDataType());
                        }

                        if (xAxisScore.getValueMin()) {
                            oMatrix.setXMin(xAxisScore.getValueMin());
                        }

                        if (xAxisScore.getValueMax()) {
                            oMatrix.setXMax(xAxisScore.getValueMax());
                        }

                        // Y-Axis
                        if (yAxisScore.getValue()) {
                            oMatrixItem.setYValue(yAxisScore.getValue());
                            oMatrixItem.setYValueDataType(yAxisScore.getCriterionDataType());
                        }

                        if (yAxisScore.getValueMin()) {
                            oMatrix.setYMin(yAxisScore.getValueMin());
                        }

                        if (yAxisScore.getValueMax()) {
                            oMatrix.setYMax(yAxisScore.getValueMax());
                        }

                        // Inner Radius
                        if (visParam1Score) {
                            if (visParam1Score.getValue()) {
                                oMatrixItem.setR1Value(visParam1Score.getValue());
                                oMatrixItem.setR1ValueDataType(visParam1Score.getCriterionDataType());
                            }

                            if (visParam1Score.getValueMin()) {
                                oMatrix.setR1Min(visParam1Score.getValueMin());
                            }

                            if (visParam1Score.getValueMax()) {
                                oMatrix.setR1Max(visParam1Score.getValueMax());
                            }
                        }

                        // Outer Radius
                        if (visParam2Score) {
                            if (visParam2Score.getValue()) {
                                oMatrixItem.setR2Value(visParam2Score.getValue());
                                oMatrixItem.setR2ValueDataType(visParam2Score.getCriterionDataType());
                            }

                            if (visParam2Score.getValueMin()) {
                                oMatrix.setR2Min(visParam2Score.getValueMin());
                            }

                            if (visParam2Score.getValueMax()) {
                                oMatrix.setR2Max(visParam2Score.getValueMax());
                            }
                        }

                        oMatrix.addItem(oMatrixItem);
                    }
                }
            }

            if (oCriterionControl && oCriterionControl.getData()) {
                oMatrix.setSelectedItemName(oCriterionControl.getSelectedEvaluationId());
            }

            oMatrix.attachItemSelected(function(oEvent) {
                var itemName = oEvent.getParameter("itemName");
                for (var i = 0; i < aData.length; i++) {
                    if (aData[i] && aData[i].getEvaluationId() && aData[i].getEvaluationId() == itemName) {
                        var iEvaluationId = aData[i].getEvaluationId();
                        oCriterionControl.setSelectedEvaluation(iEvaluationId);
                        that.fireSelectionChanged({
                            evaluationId : iEvaluationId
                        });
                        break;
                    }
                }
            });
        },

        selectEvaluation : function(evaluationId) {
            var oMatrix = this.getAggregation("_matrix");
            if (oMatrix) {
                oMatrix.setSelectedItemName(evaluationId);
            }
            var oCriterionControl = this._getCriterionControl();
            if (oCriterionControl) {
                var iEvaluationId = parseInt(evaluationId);
                oCriterionControl.setSelectedEvaluation(iEvaluationId);
            }
            this.fireSelectionChanged({
                evaluationId : evaluationId
            });
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            if (oControl.getDisplayMatrixOnly()) {
                oRm.addClass("sapUiInoEvaluationMatrixOnly");
            }
            oRm.writeClasses();
            oRm.write(">");

            if (oControl.getVisible()) {

                var oMatrix = oControl.getAggregation("_matrix");
                var bIncludeTitle = oControl.getTitle && (!oControl.getDisplayMatrixOnly() || (oMatrix && oMatrix.getItems().length > 0));

                if (bIncludeTitle) {
                    var sTitle = oControl.getTitle();
                    if (!sTitle) {
                        sTitle = "";
                    }
                    oRm.write("<div");
                    oRm.addClass("sapUiInoEvaluationHeader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.writeEscaped(sTitle);
                    oRm.write("</div>");
                }

                if (oMatrix && oMatrix.getItems().length > 0 && oControl.getDisplayMatrix()) {
                    oRm.write("<div");
                    oRm.writeAttributeEscaped("ariaDescribedBy", oControl.getId() + "-EvaluationDetail");
                    oRm.addClass("sapUiInoEvaluationMatrix");
                    if (bIncludeTitle) {
                        oRm.addClass("sapUiInoEvaluationMatrixTitle");
                    }
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oMatrix);
                    oRm.write("</div>");
                }

                if (!oControl.getDisplayMatrixOnly()) {
                    oRm.write("<div");
                    oRm.writeAttributeEscaped("id", oControl.getId() + "-EvaluationDetail");
                    oRm.addClass("sapUiInoEvaluationDetail");
                    oRm.writeClasses();
                    oRm.write(">");
                    var oCriterionControl = oControl._getCriterionControl();
                    oRm.renderControl(oCriterionControl);
                    oRm.write("</div>");
                }
            }

            oRm.write("</div>");
        }
    });
})();