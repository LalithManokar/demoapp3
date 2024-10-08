/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/core/ReadSource"
   ], function(ApplicationObject, ReadSource) {
       "use strict";
       return ApplicationObject.extend("sap.ino.commons.models.object.InternalNote", {
          objectName : "sap.ino.xs.object.idea.InternalNote",
          readSource : ReadSource.getDefaultAOFSource(),
          invalidation : {
	            entitySets : ["IdeaInternalNote"]
	        },
		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["INTERNAL_NOTE_COUNT", "INTERNAL_ATTACHMENT_COUNT"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["INTERNAL_NOTE_COUNT", "INTERNAL_ATTACHMENT_COUNT"]
			}],
			"delComment": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["INTERNAL_NOTE_COUNT", "INTERNAL_ATTACHMENT_COUNT"]
			}]
		}	        
       });
       
   });