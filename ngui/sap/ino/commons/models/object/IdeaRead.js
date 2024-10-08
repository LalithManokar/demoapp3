sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.IdeaRead', {
        objectName: "sap.ino.xs.object.idea.IdeaRead",
		readSource: ReadSource.getDefaultAOFSource(),
		invalidation : {
            entitySets : ["IdeaRead"]
        },
		actionImpacts: {
		    "markRead":[{
			    "objectName": "sap.ino.commons.models.object.Idea",
			    "objectKey": "IDEA_ID",
			    "impactedAttributes": ["IS_READ", "READ_ID"]
		    }]
		}
	});
});