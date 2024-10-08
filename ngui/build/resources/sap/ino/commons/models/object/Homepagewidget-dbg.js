sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.Homepagewidget', {
        objectName: "sap.ino.xs.object.homepagewidget.Homepagewidget",
		readSource: ReadSource.getDefaultAOFSource()
	});
});