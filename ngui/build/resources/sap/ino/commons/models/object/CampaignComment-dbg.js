/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/core/ReadSource"
   ], function(ApplicationObject, ReadSource) {
        "use strict";
	    return ApplicationObject.extend("sap.ino.commons.models.object.CampaignComment", {
	        objectName : "sap.ino.xs.object.campaign.Comment",
	        readSource : ReadSource.getDefaultAOFSource(),
	        invalidation : {
	            entitySets : ["CampaignComment"]
	        },
	        actionImpacts : {
	            "del": [{"objectName": "sap.ino.commons.models.object.Campaign",
	                     "objectKey": "OBJECT_ID",
	                     "impactedAttributes": ["COMMENT_COUNT"]}],
	            "create": [{"objectName": "sap.ino.commons.models.object.Campaign",
	                        "objectKey": "OBJECT_ID",
	                        "impactedAttributes": ["COMMENT_COUNT"]}]
            }
    });
});