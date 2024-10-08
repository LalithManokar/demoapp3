/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType"
], function(ApplicationObject, ReadSource, Message, MessageType) {
    "use strict";

    var IdeaLatest = ApplicationObject.extend("sap.ino.commons.models.object.IdeaLatest", {
        objectName : "sap.ino.xs.object.idea.IdeaLatest",
        readSource : ReadSource.getDefaultAOFSource()
    });
    
    return IdeaLatest;
});