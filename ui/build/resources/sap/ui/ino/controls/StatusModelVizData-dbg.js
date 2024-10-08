/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.StatusModelVizData");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
(function() {
    "use strict";

    sap.ui.core.Element.extend("sap.ui.ino.controls.StatusModelVizData", {
        metadata : {
            properties : {
                code : {
                    type : "string"
                },
                currentStatusCode : {
                	type : "string"
                },
                currentStatusType : {
                	type : "string"
                },
                nextStatusCode : {
                	type : "string"
                },
                nextStatusType : {
                	type : "string"
                },
                statusActionCode : {
                	type : "string"
                },
                decisionRelevant : {
                	type : "boolean"
                },
                decisionReasonListCode : {
                	type : "string"
                }
            }
        },

        init : function() {
            this._resBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        exit : function() {
            this._resBundle = null;
        },
        
        getCurrentStatusText : function() {
        	return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Status.Root", this.getCurrentStatusCode());
        },
        
        getNextStatusText : function() {
        	return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Status.Root", this.getNextStatusCode());
        },
        
        getStatusActionText : function() {
        	return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", this.getStatusActionCode());
        }
    });
})();