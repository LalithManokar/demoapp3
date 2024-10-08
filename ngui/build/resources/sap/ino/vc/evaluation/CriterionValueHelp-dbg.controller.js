sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/formatters/ObjectFormatter"], function (
        Controller,
        ObjectFormatter) {
    "use strict";

    ObjectFormatter.criterionCodeWrapper = function(sCriterionCode, sAggregatingCriterionCode){
        if (sCriterionCode) {
            return ObjectFormatter.criterionCode(sCriterionCode);
        } else if (sAggregatingCriterionCode) {
            return ObjectFormatter.criterionCode(sAggregatingCriterionCode);
        }
        return undefined;
    };
    
    ObjectFormatter.criterionCodeLongTextWrapper = function(sCriterionCode, sAggregatingCriterionCode){
        if (sCriterionCode) {
            return ObjectFormatter.criterionCodeLongText(sCriterionCode);
        } else if (sAggregatingCriterionCode) {
            return ObjectFormatter.criterionCodeLongText(sAggregatingCriterionCode);
        }
        return undefined;
    };

    return Controller.extend("sap.ino.vc.evaluation.CriterionValueHelp", {
        
        formatter: ObjectFormatter,
        
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },

        open: function (oControl, sPath) {
            var oView = this.getView();
            var oCriterionValueHelp = oView.byId("criterionValueHelp");
            oView.bindElement({
                path: "object>" + sPath,
                events: {
                    change: function () {
                        oCriterionValueHelp.openBy(oControl);
                    }
                }
            });
        }

    });

});