/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/core/ReadSource"
   ], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend("sap.ino.commons.models.object.IdeaComment", {
		objectName: "sap.ino.xs.object.idea.Comment",
		readSource: ReadSource.getDefaultAOFSource(),
		invalidation: {
			entitySets: ["IdeaComment"]
		},
		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT", "FOLLOW"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT", "FOLLOW"]
			}],
			"delComment": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT", "FOLLOW"]
			}]
		}
	});
});