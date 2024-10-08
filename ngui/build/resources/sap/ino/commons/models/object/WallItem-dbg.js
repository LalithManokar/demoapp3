/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ino/commons/models/util/UUID",
    "sap/ino/commons/models/object/Wall"
], function(ApplicationObject, ReadSource, UUID, Wall) {
    "use strict";
    
    var sObjectName = "sap.ino.xs.object.wall.WallItem";

    var WallItem = ApplicationObject.extend("sap.ino.commons.models.object.WallItem", {
        objectName : sObjectName,
        readSource : function(vKey, sObjectName, oMetadata, oAdditionalSettings) {
            oAdditionalSettings = oAdditionalSettings || {};
            oAdditionalSettings.headers = oAdditionalSettings.headers || {};
            oAdditionalSettings.headers["wall-action"] = "readItemById";
            oAdditionalSettings.headers["wall-wallItemId"] = vKey;
            return ReadSource.getDefaultAOFSource({
                cache : false
            })("", sObjectName, oMetadata, oAdditionalSettings);
        },
        
        invalidation : {
            entitySets : ["WallItems"]
        },

        constructor : function() {
            ApplicationObject.apply(this, arguments);
            this._wallSessionUUID = UUID.generate();
        },

        process : function(oAjaxSettings) {
            if(oAjaxSettings.type === "DELETE") {
                var iSplitIdx = oAjaxSettings.url.lastIndexOf("/");
                oAjaxSettings.headers["wall-wallItemIds"] = oAjaxSettings.url.substring(iSplitIdx + 1);
                oAjaxSettings.url = oAjaxSettings.url.substring(0,iSplitIdx);
            } else {    
                var oItemData = JSON.parse(oAjaxSettings.data);
                oItemData.CONTENT = JSON.parse(oItemData.CONTENT);
                oAjaxSettings.data = JSON.stringify({
                    ID : oItemData.WALL_ID,
                    Items: [oItemData]
                });
            }
            return Wall.processRequest(this, oAjaxSettings);
        },
   
        getChangeRequest : function(bComplete) {
            var oCurrentData = jQuery.extend({}, this.getData());
            oCurrentData.CONTENT = JSON.stringify(oCurrentData.CONTENT); 
            var oChangeRequest = this.calculateChangeRequest(this.getApplicationObject(), this._oBeforeData || {}, oCurrentData, bComplete, this);
            oChangeRequest.WALL_ID = oCurrentData.WALL_ID;
            return oChangeRequest;
        }
    });
 
    return WallItem;
});