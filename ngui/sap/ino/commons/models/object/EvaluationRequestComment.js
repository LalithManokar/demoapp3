/*!
 * @copyright@
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/core/ReadSource"
   ], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend("sap.ino.commons.models.object.EvaluationRequestComment", {
		objectName: "sap.ino.xs.object.evaluation.EvalReqComment",
		readSource: ReadSource.getDefaultAOFSource(),
		invalidation: {
			entitySets: ["EvaluationRequestComment"]
		},
		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.EvaluationRequest",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.EvaluationRequest",
				"objectKey": "OBJECT_ID",
				"impactedAttributes": ["COMMENT_COUNT"]
			}]
		}
	});
});