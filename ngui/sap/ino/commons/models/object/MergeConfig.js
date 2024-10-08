/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.MergeConfig', {
        objectName: "sap.ino.xs.object.idea.MergeConfig",
		readSource: ReadSource.getDefaultAOFSource()
	});
});