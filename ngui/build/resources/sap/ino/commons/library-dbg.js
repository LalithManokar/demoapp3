/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    'sap/ui/core/library',
    'sap/m/library'
], function() {
    "use strict";
    
    sap.ui.getCore().initLibrary({
        name : "sap.ino.commons",
        dependencies : ["sap.ui.core", "sap.m"],
        types : [], 
        interfaces : [],
        controls : [
            "sap.ino.commons.application.BaseComponent",
            "sap.ino.commons.application.Configuration",
            "sap.ino.commons.application.Router",
            "sap.ino.commons.application.WebAnalytics",
            
            "sap.ino.commons.formatters.BaseFormatter",
            "sap.ino.commons.formatters.BaseListFormatter",
            "sap.ino.commons.formatters.ListFormatter",
            "sap.ino.commons.formatters.ObjectFormatter",
            "sap.ino.commons.formatters.ObjectListFormatter",
            
            "sap.ino.commons.models.aof.ApplicationObject",
            "sap.ino.commons.models.aof.ApplicationObjectChange",
            "sap.ino.commons.models.aof.MessageParser",
            "sap.ino.commons.models.aof.MetaModel",
            "sap.ino.commons.models.aof.PropertyModel",
            "sap.ino.commons.models.aof.PropertyModelCache",
            
            "sap.ino.commons.models.core.CoreModel",
            "sap.ino.commons.models.core.Extensibility",
            "sap.ino.commons.models.core.ModelSynchronizer",
            "sap.ino.commons.models.core.ReadSource",
            
            "sap.ino.commons.models.object.Attachment",
            "sap.ino.commons.models.object.Campaign",
            "sap.ino.commons.models.object.CampaignComment",
            "sap.ino.commons.models.object.Evaluation",
            "sap.ino.commons.models.object.Idea",
            "sap.ino.commons.models.object.IdeaComment",
            "sap.ino.commons.models.object.Notification",
            "sap.ino.commons.models.object.UserSettings",
            "sap.ino.commons.models.object.Vote",
            "sap.ino.commons.models.object.Wall",
            "sap.ino.commons.models.object.WallItem",
            
            "sap.ino.commons.models.util.UUID",
            "sap.ino.commons.models.util.WallMapper"
        ],
        noLibraryCSS: true,  
        elements : [
        ],
        version : "2.4.16"
    });
});