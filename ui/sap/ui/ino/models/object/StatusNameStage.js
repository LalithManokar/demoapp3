/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.StatusNameStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.StatusNameStage", {
        objectName : "sap.ino.xs.object.status.StatusStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingStatusNameCode"),
        invalidation : {
            entitySets : ["StagingStatusNameCode", "SearchStagingStatusName","StatusNameCode"]
        },
        determinations : {
        }
    });
})();