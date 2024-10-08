/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.StatusActionStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.StatusActionStage", {
        objectName : "sap.ino.xs.object.status.ActionStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingStatusActionCode"),
        invalidation : {
            entitySets : ["StagingStatusActionCode", "SearchStagingStatusAction","StatusActionCode"]
        },
        determinations : {
        }
    });
})();