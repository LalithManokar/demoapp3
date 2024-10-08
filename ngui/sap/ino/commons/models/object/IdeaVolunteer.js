sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
    "use strict";
    
    return ApplicationObject.extend("sap.ino.commons.models.object.IdeaVolunteer", {
        objectName: "sap.ino.xs.object.idea.Volunteer",
        readSource: ReadSource.getDefaultAOFSource(),
        invalidation: {
			entitySets: ["IdeaVolunteers"]
		},
        actionImpacts: {
            "create": [{
                "objectName": "sap.ino.commons.models.object.Idea",
                "objectKey": "IDEA_ID",
                "impactedAttributes": ["VOLUNTEER_ID"]
            }],
            "del": [{
                "objectName": "sap.ino.commons.models.object.Idea",
                "objectKey": "IDEA_ID",
                "impactedAttributes": ["VOLUNTEER_ID"]
            }]
        },
        toggleVolunteer: function(iKey, iIdeaId) {
            return !!iKey ? this.del(iKey, {IDEA_ID: iIdeaId}) : this.create({IDEA_ID: iIdeaId});
        }
    });
});