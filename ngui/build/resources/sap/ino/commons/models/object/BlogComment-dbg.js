/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/core/ReadSource"
   ], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend("sap.ino.commons.models.object.BlogComment", {
		objectName: "sap.ino.xs.object.blog.Comment",
		readSource: ReadSource.getDefaultAOFSource(),
		invalidation: {
			entitySets: ["BlogComment"]
		},
		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.Blog",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.Blog",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT"]
			}]
		}
	});
});