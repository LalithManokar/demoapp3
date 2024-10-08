/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.CampaignComment");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    jQuery.sap.require("sap.ui.ino.models.object.Campaign");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.CampaignComment", {
        objectName : "sap.ino.xs.object.campaign.Comment",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultAOFSource(),
        determinations : {
            onPersist : function(vKey, oChangeRequest, oComment, oAction) {
                if (!oComment) {
                    return;
                }
                var iCampaignId = oComment.OBJECT_ID;

                var InvalidationManager = sap.ui.ino.models.core.InvalidationManager;
                var Campaign = sap.ui.ino.models.object.Campaign;

                function calculateCommentCount(sEntitySet, getProperty, setProperty) {
                    var iCommentCount = getProperty("COMMENT_COUNT");
                    if (iCommentCount == undefined) {
                        return;
                    }
                    if (oAction.name === sap.ui.ino.models.core.ApplicationObject.Action.Create) {
                        iCommentCount++;
                    }
                    if (oAction.name === sap.ui.ino.models.core.ApplicationObject.Action.Del) {
                        iCommentCount--;
                    }
                    setProperty("COMMENT_COUNT", iCommentCount);
                };
                InvalidationManager.recalculateAttributes(Campaign, iCampaignId, calculateCommentCount);
            }
        }
    });
})();