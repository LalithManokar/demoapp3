/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.CampaignPhaseStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.CampaignPhaseStage", {
        objectName : "sap.ino.xs.object.campaign.PhaseStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingPhase"),
        invalidation : {
            entitySets : ["StagingPhase", "StagingPhaseSearch"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "PLAIN_CODE" : "",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : ""
                };
            },
        },        
    });
})();