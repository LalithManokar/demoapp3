sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController"
], function (BaseController) {
    "use strict";

   return BaseController.extend("sap.ino.vc.idea.DecisionQuickView", jQuery.extend({}, {
        
        open: function (oControl, iId) {
            var that = this;
            var oView = this.getView();
            var oDecisionCard = oView.byId("decisionCard");
            
            oView.bindElement({
                path: "data>/IdeaDecision(" + iId + ")",
                events: {
                    change: function (oEvent) {
                        jQuery.sap.delayedCall(0, that, function () {
                            oDecisionCard.openBy(oControl);
                        });
                    }
                }
            });
        }
    }));

});