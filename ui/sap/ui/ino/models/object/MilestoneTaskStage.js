/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.MilestoneTaskStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.MilestoneTaskStage", {
        objectName : "sap.ino.xs.object.basis.MilestoneTaskStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingMilestoneTask"),
        invalidation : {
            entitySets : ["StagingMilestoneTask", "StagingMilestoneTaskSearch"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "PLAIN_CODE" : "",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : ""
                };
            }
        }      
    });
})();