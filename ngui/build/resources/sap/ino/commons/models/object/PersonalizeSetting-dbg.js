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

    var Personalize = ApplicationObject.extend("sap.ino.commons.models.object.PersonalizeSetting", {
        objectName : "sap.ino.xs.object.iam.PersonalizeSetting",
        readSource : ReadSource.getDefaultAOFSource(),
        checkQuickLinkNameValid: checkQuickLinkNameValid
    });
    
    Personalize.defaultPesonalize = {
        IDEA_VIEW: true,
        CAMPAIGN_VIEW: true,
        SCREEN_SIZE: true,
        FILTER: true,
        SIMILAR_IDEA: true,
        FILTER_ACTIVE_IDEA: false,
        REPORT_VIEW: false
    };
    
    function checkQuickLinkNameValid(aData, sName, aStandardName){
        var bValid = true;
        for(var i = 0; i < aData.length; i++){
            if(aData[i].LINK_TEXT === sName || aStandardName.indexOf(sName) >= 0){
                bValid = false;
            }
        }
        return bValid;
    }
    
    return Personalize;
});