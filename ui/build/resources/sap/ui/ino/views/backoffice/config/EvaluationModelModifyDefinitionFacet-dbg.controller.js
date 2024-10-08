/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.config.EvaluationModelModifyDefinitionFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {

            onExit : function() {
                //also make sure the sub-view is exited
                this.getView().oCriterionDetailView.exit();
            },

            onLiveChange : function(oEvent) {
                oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
            },
            
            onAfterModelAction : function(){
                this.getView().oCriterionDetailView.getController().refresh();
            }
        }));