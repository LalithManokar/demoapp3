/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.EvaluationCriterionValueLine");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationDataCriterionValue");

    /**
     * 
     * An evaluation criterion value displays the value of a single evaluation criterion in a row. Depending on the data
     * type and customizing of a criterion the value is displayed as simple text field or a slider.
     * <ul>
     * <li>Properties
     * <ul>
     * <li>editable: is control editable</li>
     * <li>initialOpen: is section initially open</li>
     * <li>hasDetailContent: does section have details and can be opened</li>
     * <li>addCommentText: tooltip for add comment button</li>
     * <li>removeCommentText: tooltip for remove comment button</li>
     * <li>openSectionText: tooltip for open section</li>
     * <li>closeSectionText: tooltip for close section</li>
     * <li>commentLabelText: comment label text</li>
     * </ul>
     * <ul>
     * <li>Aggregations
     * <ul>
     * <li>criterionValue: sap.ui.ino.controls.EvaluationDataCriterionValue element representing the data of a
     * criterion value</li>
     * <li>_openCloseButton: hidden control used for cleanup</li>
     * <li>_label: hidden control used for cleanup</li>
     * <li>_valueControl: hidden control used for cleanup</li>
     * <li>_valueUoM: hidden control used for cleanup</li>
     * <li>_doneCheckBox: hidden control used for cleanup</li>
     * <li>_addRemoveCommentButton: hidden control used for cleanup</li>
     * <li>_commentTextArea: hidden control used for cleanup</li>
     * </ul>
     * </li>
     * </li>
     * <li>Events
     * <ul>
     * <li>openCloseTriggered: Triggered when a criterion section line was open or closed</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.EvaluationCriterionValueLine", {
        metadata : {
            properties : {
                "editable" : "boolean",
                "initialOpen" : "boolean",
                "hasDetailContent" : "boolean",
                "addCommentText" : "string",
                "removeCommentText" : "string",
                "openSectionText" : "string",
                "closeSectionText" : "string",
                "commentLabelText" : "string"
            },
            aggregations : {
                "criterionValue" : {
                    type : "sap.ui.ino.controls.EvaluationDataCriterionValue",
                    multiple : false,
                    bindable : true
                },

                "_openCloseButton" : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                },

                "_label" : {
                    type : "sap.ui.commons.Label",
                    multiple : false,
                    visibility : "hidden"
                },

                "_valueControl" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },

                "_valueUom" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },

                "_doneCheckBox" : {
                    type : "sap.ui.commons.CheckBox",
                    multiple : false,
                    visibility : "hidden"
                },

                "_addRemoveCommentButton" : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                },

                "_commentTextArea" : {
                    type : "sap.ui.commons.TextArea",
                    multiple : false,
                    visibility : "hidden"
                },

                "_icon" : {
                    type : "sap.ui.commons.Image",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                "openCloseTriggered" : {}
            }
        },

        constructor : function(sId, mSettings) {
            sap.ui.core.Control.apply(this, arguments);
            this._sectionOpen = this.getInitialOpen();
        },

        isOpen : function() {
            return this._sectionOpen;
        },

        init : function() {
            this._resBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        renderer : function(oRm, oControl) {

            oRm.write("<tbody");
            oRm.writeControlData(oControl);
            oRm.writeClasses();
            oRm.write(">");

            var oCriterionValue = oControl.getCriterionValue();
            if (oCriterionValue) {

                var sCriterionCode = oCriterionValue.getCriterionCode();
                var bTopLevelCriterion = false;
                if (sCriterionCode === undefined || sCriterionCode === null || sCriterionCode === "" ) {
                    // Criterion was just created (Preview Mode), no code yet just a negative id
                    var iParentCriterionId = oCriterionValue.getParentCriterionId();
                    bTopLevelCriterion = (iParentCriterionId === null) || (iParentCriterionId === 0 || iParentCriterionId === undefined);
                } else {
                    var sParentCriterionCode = oCriterionValue.getParentCriterionCode();
                    bTopLevelCriterion = (sParentCriterionCode === null) || (sParentCriterionCode === "" || sParentCriterionCode === undefined);
                }
                var bRowSpan = oCriterionValue.getCriterionDataType() && oCriterionValue.getUomCode() ? true : false;

                // Open Button
                oRm.write("<td ");
                oRm.addClass("sapUiInoEvalCriterionValueOpenCloseSection");
                oRm.writeClasses();
                if (bRowSpan) {
                    oRm.writeAttribute("rowspan", "2");
                }
                oRm.write(">");

                if (oControl.getHasDetailContent() && bTopLevelCriterion) {
                    var oOpenCloseButton = oControl.getAggregation("_openCloseButton");
                    if (!oOpenCloseButton) {
                        oOpenCloseButton = new sap.ui.commons.Button({
                            lite : true,
                            tooltip : oControl.getInitialOpen() ? oControl.getCloseSectionText() : oControl.getOpenSectionText(),
                            press : function() {
                                var oControlDom = jQuery(this.getDomRef());
                                if (oControl._sectionOpen) {
                                    oControlDom.attr("title", oControl.getOpenSectionText());
                                    oControlDom.addClass("sapUiInoEvalCriterionValueOpenCloseButtonClose");
                                    oControlDom.removeClass("sapUiInoEvalCriterionValueOpenCloseButtonOpen");
                                } else {
                                    oControlDom.attr("title", oControl.getCloseSectionText());
                                    oControlDom.addClass("sapUiInoEvalCriterionValueOpenCloseButtonOpen");
                                    oControlDom.removeClass("sapUiInoEvalCriterionValueOpenCloseButtonClose");
                                }
                                oControl._sectionOpen = !oControl._sectionOpen;
                                oControl.fireOpenCloseTriggered({
                                    open : oControl._sectionOpen
                                });
                            }
                        });
                        oOpenCloseButton.addStyleClass("sapUiInoEvalCriterionValueOpenCloseButton");
                        oControl.setAggregation("_openCloseButton", oOpenCloseButton, true);
                    }
                    if (oControl._sectionOpen) {
                        oOpenCloseButton.addStyleClass("sapUiInoEvalCriterionValueOpenCloseButtonOpen");
                        oOpenCloseButton.removeStyleClass("sapUiInoEvalCriterionValueOpenCloseButtonClose");
                    } else {
                        oOpenCloseButton.addStyleClass("sapUiInoEvalCriterionValueOpenCloseButtonClose");
                        oOpenCloseButton.removeStyleClass("sapUiInoEvalCriterionValueOpenCloseButtonOpene");
                    }
                    oRm.renderControl(oOpenCloseButton);
                }
                oRm.write("</td>");

                // Name
                oRm.write("<td ");
                oRm.addClass("sapUiInoEvalCriterionValueName");
                if (!bTopLevelCriterion) {
                    oRm.addClass("sapUiInoEvalCriterionValueNameAlignRight");
                }
                oRm.writeClasses();
                if (bRowSpan) {
                    oRm.writeAttribute("rowspan", "2");
                }
                oRm.write(">");

                var oLabel = null;
                var sCriterionName = oCriterionValue.getCriterionName();
                var sCriterionWeight = oCriterionValue.getWeight()
                if (sCriterionName) {
                    oLabel = oControl.getAggregation("_label");
                    if (!oLabel) {
                        oLabel = new sap.ui.commons.Label({
                            text : sCriterionName + (!sCriterionWeight ? "" : "("+sCriterionWeight+"%)"),
                            textAlign : bTopLevelCriterion ? sap.ui.core.TextAlign.Left : sap.ui.core.TextAlign.Right
                        });
                        oLabel.addStyleClass("sapUiInoEvalCriterionValueNameLabel");
                        oControl.setAggregation("_label", oLabel, true);
                    }
                    oRm.renderControl(oLabel);
                }
                oRm.write("</td>");

                // Info
                oRm.write("<td ");
                oRm.addClass("sapUiInoEvalCriterionValueInfo");
                oRm.writeClasses();
                if (bRowSpan) {
                    oRm.writeAttribute("rowspan", "2");
                }
                oRm.write(">");

                var sCriterionDescription = oCriterionValue.getCriterionDescription();
                if (sCriterionDescription) {
                    var oIcon = oControl.getAggregation("_icon");
                    if (!oIcon) {
                        oIcon = new sap.ui.commons.Image({
                            decorative : false,
                            alt : sCriterionDescription,
                            tooltip: sCriterionDescription
                        });
                        oIcon.addStyleClass("sapUiInoEvalCriterionValueInfoIcon");
                        oControl.setAggregation("_icon", oIcon, true);
                    }
                    oRm.renderControl(oIcon);
                }
                oRm.writeClasses();
                oRm.write("</td>");

                // Value
                oRm.write("<td ");
                oRm.addClass("sapUiInoEvalCriterionValueValue");
                oRm.writeClasses();
                oRm.write(">");

                var oValueControl = oControl.getAggregation("_valueControl");
                if (!oValueControl) {
                    if (oCriterionValue.getCriterionDataType()) {
                        if (oCriterionValue.getAggregationType()) {
                            oValueControl = sap.ui.ino.views.common.ControlFactory.getValueControlForType({
                                dataType : oCriterionValue.getCriterionDataType(),
                                bindingRef : oCriterionValue,
                                editable : false,
                                valueOptionListCode : oCriterionValue.getValueOptionListCode()
                            });
                            if (oCriterionValue.getCriterionDataType() != "TEXT" || oCriterionValue.getValueOptionListCode()) {
                                oValueControl.setTextAlign(sap.ui.core.TextAlign.Right);
                                oValueControl.addStyleClass("sapUiInoEvalCriterionValueAggregation");
                            }
                        } else {
                            oValueControl = sap.ui.ino.views.common.ControlFactory.getValueControlForType({
                                dataType : oCriterionValue.getCriterionDataType(),
                                bindingRef : oCriterionValue,
                                editable : oControl.getEditable(),
                                minValue : oCriterionValue.getValueMin(),
                                maxValue : oCriterionValue.getValueMax(),
                                stepSize : oCriterionValue.getStepSize(),
                                maxLength : oCriterionValue.getMaxLength(),
                                valueOptionListCode : oCriterionValue.getValueOptionListCode(),
                                slider : true,
                                width : "100%"
                            /*
                             * validationHandler : function(oEvent) { // Notify view },
                             */
                            });
                            if (!oControl.getEditable()) {
                                if (oValueControl instanceof sap.ui.commons.TextView) {
                                    oValueControl.setTextAlign(sap.ui.core.TextAlign.Right);
                                    if (bTopLevelCriterion) {
                                        oValueControl.addStyleClass("sapUiInoEvalCriterionValueSection");
                                    } else {
                                        oValueControl.addStyleClass("sapUiInoEvalCriterionValueDetail");
                                    }
                                }
                            }
                        }
                        oControl.setAggregation("_valueControl", oValueControl, true);
                    }
                }
                if (oLabel && oValueControl) {
                    oLabel.setLabelFor(oValueControl);
                    if (oValueControl.addAriaLabelledBy) {
                        if (oValueControl.removeAllAriaLabelledBy) {
                            oValueControl.removeAllAriaLabelledBy();
                        }
                        oValueControl.addAriaLabelledBy(oLabel);
                    }
                }
                if (oValueControl) {
                    oRm.renderControl(oValueControl);
                }

                var oValueUom = oControl.getAggregation("_valueUom");
                if (!oValueUom) {
                    if (oCriterionValue.getCriterionDataType() && oCriterionValue.getUomCode()) {
                        oValueUom = sap.ui.ino.views.common.ControlFactory.getControlTableCode("uomCode", {
                            bindingRef : oCriterionValue,
                            editable : false,
                            codeTable : "sap.ino.xs.object.basis.Unit.Root"
                        });
                        oValueUom.addStyleClass("sapUiInoEvalCriterionValueUom");
                        oControl.setAggregation("_valueUom", oValueUom, true);
                    }
                    if (oValueUom && oValueControl) {
                        // do not remove other describedby values, as controls like the slider are using this internally
                        if (oValueControl.addAriaDescribedBy) {
                            oValueControl.addAriaDescribedBy(oValueUom);
                        }
                    }
                }

                oRm.write("</td>");

                if (oControl.getEditable()) {
                    // Comment
                    oRm.write("<td ");
                    oRm.addClass("sapUiInoEvalCriterionValueAddRemoveComment");
                    oRm.writeClasses();
                    oRm.write(">");

                    if (oCriterionValue.getCriterionDataType() != "TEXT") {

                        var oCommentTextArea = oControl.getAggregation("_commentTextArea");
                        if (!oCommentTextArea) {
                            oCommentTextArea = sap.ui.ino.views.common.ControlFactory.getControlText("comment", {
                                bindingRef : oCriterionValue,
                                editable : oControl.getEditable(),
                                width : "100%"
                            });
                            if (oCommentTextArea.setRows) {
                                oCommentTextArea.setRows(3);
                            }
                            oCommentTextArea.setVisible(oCriterionValue.getComment() !== undefined && oCriterionValue.getComment() !== null && oCriterionValue.getComment() !== "");
                            oControl.setAggregation("_commentTextArea", oCommentTextArea, true);
                        }

                        var oAddRemoveCommentButton = oControl.getAggregation("_addRemoveCommentButton");
                        if (!oAddRemoveCommentButton) {
                            oAddRemoveCommentButton = new sap.ui.commons.Button({
                                lite : true,
                                tooltip : oCommentTextArea.getVisible() ? oControl.getRemoveCommentText() : oControl.getAddCommentText(),
                                press : function() {
                                    var oCommentTextArea = oControl.getAggregation("_commentTextArea");
                                    if (!oCommentTextArea.getVisible()) {
                                        this.setTooltip(oControl.getRemoveCommentText());
                                        oCommentTextArea.setVisible(true);
                                        // timeout required due to rendering delay
                                        setTimeout(function() {
                                            oCommentTextArea.focus();
                                        }, 50);
                                        this.removeStyleClass("sapUiInoEvalCriterionValueAddCommentIcon");
                                        this.addStyleClass("sapUiInoEvalCriterionValueRemoveCommentIcon");
                                    } else {
                                        this.setTooltip(oControl.getAddCommentText());
                                        oCommentTextArea.setValue(null);
                                        oCommentTextArea.setVisible(false);
                                        this.removeStyleClass("sapUiInoEvalCriterionValueRemoveCommentIcon");
                                        this.addStyleClass("sapUiInoEvalCriterionValueAddCommentIcon");
                                    }
                                }
                            });
                            oAddRemoveCommentButton.addStyleClass("sapUiInoEvalCriterionValueComment");
                            oAddRemoveCommentButton.addStyleClass("sapUiInoEvalCriterionValueCommentIcon");
                            if (oCommentTextArea.getVisible()) {
                                oAddRemoveCommentButton.addStyleClass("sapUiInoEvalCriterionValueRemoveCommentIcon");
                            } else {
                                oAddRemoveCommentButton.addStyleClass("sapUiInoEvalCriterionValueAddCommentIcon");
                            }
                            oAddRemoveCommentButton.addStyleClass("sapUiInoEvalCriterionValueCommentIconButton");
                            oControl.setAggregation("_addRemoveCommentButton", oAddRemoveCommentButton, true);
                        }
                        oRm.renderControl(oAddRemoveCommentButton);
                    }

                    oRm.write("</td>");

                } else {
                    oRm.write("<td ");
                    oRm.addClass("sapUiInoEvalCriterionValueComment");
                    oRm.writeClasses();
                    oRm.write(">");

                    if (oCriterionValue.getCriterionDataType() != "TEXT") {

                        if (oCriterionValue.getComment()) {
                            var oIcon = new sap.ui.commons.Image({
                                decorative : false,
                                tooltip : oCriterionValue.getComment()
                            });
                            oIcon.addStyleClass("sapUiInoEvalCriterionValueTooltipContainer");
                            oIcon.addStyleClass("sapUiInoEvalCriterionValueCommentIcon");
                            oIcon.setParent(oControl);
                            oRm.renderControl(oIcon);
                        }
                    }

                    oRm.write("</td>");
                }

                oRm.write("</tr>");

                var oValueUom = oControl.getAggregation("_valueUom");
                if (oValueUom) {
                    oRm.write("<tr>");
                    oRm.write("<td>");
                    oRm.renderControl(oValueUom);
                    oRm.write("</td>");
                    oRm.write("<td/>");
                    oRm.write("</tr>");
                }

                var oCommentTextArea = oControl.getAggregation("_commentTextArea");
                if (oControl.getEditable() && oCommentTextArea) {
                    oRm.write("<tr>");
                    oRm.write("<td colspan=3>");
                    oRm.write("</td>");
                    oRm.write("<td colspan=2>");
                    oRm.renderControl(oCommentTextArea);
                    oRm.write("</td>");
                    oRm.write("</tr>");
                }
            }

            oRm.write("</tbody>");
        }
    });
})();