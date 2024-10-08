/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.VoteTypeStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.VoteTypeStage", {
        objectName : "sap.ino.xs.object.campaign.VoteTypeStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingVoteType"),
        invalidation : {
            entitySets : ["StagingVoteType", "StagingVoteTypeSearch"]
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