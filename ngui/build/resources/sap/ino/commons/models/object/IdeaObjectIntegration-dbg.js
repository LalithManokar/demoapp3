/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject"
], function(ApplicationObject) {
    "use strict";

    var IdeaObjectIntegration = ApplicationObject.extend("sap.ino.commons.models.object.IdeaObjectIntegration", {
        objectName : "sap.ino.xs.object.integration.IdeaObjectIntegration"
    });
    
    return IdeaObjectIntegration;
});