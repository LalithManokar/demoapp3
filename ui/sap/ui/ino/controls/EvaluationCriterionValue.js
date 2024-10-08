/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.EvaluationCriterionValue");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.EvaluationCriterionValueLine");
    jQuery.sap.require("sap.ui.ino.controls.EvaluationDataCriterionValue");
    jQuery.sap.require("sap.ui.ino.controls.CachedElementCloner");

    /**
     * 
     * An evaluation criterion value displays the value of a single evaluation criterion in a row. Depending on the data
     * type and customizing of a criterion the value is displayed as simple text field or a slider.
     * <ul>
     * <li>Properties
     * <ul>
     * <li>section: is control a section</li>
     * <li>editable: is control editable</li>
     * <li>initialOpen: is section initially open</li>
     * <li>hasDetailContent: does section have details and can be opened</li>
     * <li>visible: is control visible</li>
     * </ul>
     * <ul>
     * <li>Aggregations
     * <ul>
     * <li>criterionValue: sap.ui.ino.controls.EvaluationDataCriterionValue element representing the data of a
     * criterion value</li>
     * <li>_criterionLine: hidden controls used for cleanup</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>openCloseTriggered: Triggered when a criterion section line was open or closed</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.EvaluationCriterionValue", {
        metadata : {
            properties : {
                "isSection" : "boolean",
                "editable" : "boolean",
                "initialOpen" : "boolean",
                "hasDetailContent" : "boolean"
            },
            aggregations : {
                "criterionValue" : {
                    type : "sap.ui.ino.controls.EvaluationDataCriterionValue",
                    multiple : true,
                    bindable : true
                },

                "_criterionLine" : {
                    type : "sap.ui.ino.controls.EvaluationCriterionValueLine",
                    multiple : true,
                    visibility : "hidden"
                }
            },
            associations : {
                "sectionCriterionValue" : {
                    type : "sap.ui.ino.controls.EvaluationCriterionValue",
                    multiple : false,
                    bindable : true
                }
            },
            events : {
                "openCloseTriggered" : {}
            }
        },

        init : function() {
            this._oCloner = new sap.ui.ino.controls.CachedElementCloner();
        },
        
        isOpen : function() {
            var aCriterionLines = this.getAggregation("_criterionLine");
            if (aCriterionLines) {
                for ( var i = 0; i < aCriterionLines.length; i++) {
                    if (aCriterionLines[i].isOpen()) {
                        return true;
                    }
                }
            }
            return false;
        },
        
        getSectionCriterionControl : function() {
            return sap.ui.getCore().byId(this.getSectionCriterionValue());
        },
        
        isVisible : function() {
            if (this.getIsSection()) {
                return true;
            }
            var bOpen = false;
            if (this.getSectionCriterionValue()) {
                bOpen = this.getSectionCriterionControl().isOpen();
            } else {
                bOpen = true;
            }
            return bOpen;
        },

        renderer : function(oRm, oControl) {

            oRm.write("<div");
            oRm.addClass("sapUiInoEvalCriterionValue");
            oRm.writeClasses();
            if (!oControl.isVisible()) {
                oRm.addStyle("display", "none");
            }
            oRm.writeStyles();
            oRm.writeControlData(oControl);
            oRm.write(">");

            var aCriterionValue = oControl.getCriterionValue() || [];
            
            oRm.write("<div");
            oRm.addClass("sapUiInoEvalCriterionValueContent");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<table");
            oRm.writeAttribute("role", "presentation");
            oRm.addClass("sapUiInoEvalCriterionValueTable");
            for ( var i = 0; i < aCriterionValue.length; i++) {
                var oCriterionValue = aCriterionValue[i];
                if (oCriterionValue.getUomCode()) {
                    oRm.addClass("sapUiInoEvalCriterionValueTableWithUom");
                    break;
                }
            }
            oRm.writeClasses();
            oRm.write(">");
            
            var aCriterionLines = oControl.getAggregation("_criterionLine");
            
            for ( var i = 0; i < aCriterionValue.length; i++) {
                var oCriterionValue = aCriterionValue[i];
                if (oCriterionValue) {
                    var oCriterionLine = null;
                    if (!aCriterionLines) {
                        oCriterionLine = new sap.ui.ino.controls.EvaluationCriterionValueLine({
                            editable : oControl.getEditable(),
                            initialOpen : oControl.getInitialOpen(),
                            hasDetailContent : oControl.getHasDetailContent(),
                            openSectionText : "{i18n>CTRL_EVALUATIONCRITERIA_FLD_OPEN_SECTION}",
                            closeSectionText : "{i18n>CTRL_EVALUATIONCRITERIA_FLD_CLOSE_SECTION}",
                            addCommentText : "{i18n>CTRL_EVALUATIONCRITERIA_FLD_ADD_COMMENT}",
                            removeCommentText : "{i18n>CTRL_EVALUATIONCRITERIA_FLD_REMOVE_COMMENT}",
                            commentLabelText : "{i18n>CTRL_EVALUATIONCRITERIA_FLD_COMMENT}",
                            criterionValue : oControl._oCloner.getClone(oCriterionValue, "values"),
                            openCloseTriggered : function(oEvent) {
                                oControl.fireOpenCloseTriggered(oEvent.getParameters());
                            }
                        });
                        oControl.addAggregation("_criterionLine", oCriterionLine, true);
                    } else {
                        oCriterionLine = aCriterionLines[i];
                    }
                    oRm.renderControl(oCriterionLine);
                }
            }
            oRm.write("</table>");

            oRm.write("</div>");

            oRm.write("<div");
            oRm.addClass("sapUiInoEvalCriterionValueBottom");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("</div>");

            oRm.write("</div>");
        }
    });
})(); 