sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.TagFollow', {
        objectName: "sap.ino.xs.object.follow.Follow",
		readSource: ReadSource.getDefaultAOFSource(),
		actionImpacts: {
		    "create":[
		        {
				    "objectName": "sap.ino.commons.models.object.Tag",
				    "objectKey": "OBJECT_ID",
				    "impactedAttributes": ["FOLLOW"]
			    }
		    ],
			"del": [
			    {
			    	"objectName": "sap.ino.commons.models.object.Tag",
				    "objectKey": "OBJECT_ID",
				    "impactedAttributes": ["FOLLOW"]
			    }
			]
		},
		follow: function(objectId, type, value){
		    return !value ? this.modify(value, { OBJECT_ID:objectId, OBJECT_TYPE_CODE:type }) : this.del(value, { OBJECT_ID: objectId, OBJECT_TYPE_CODE: type});
		}
	});
});