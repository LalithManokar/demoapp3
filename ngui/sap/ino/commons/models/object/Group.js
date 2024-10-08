sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.Group', {
        objectName: "sap.ino.xs.object.iam.Group",
		readSource: ReadSource.getDefaultAOFSource(),
	    createMember: function(groups){
	        return this.massCreateMember(groups);
	    }
	});
});