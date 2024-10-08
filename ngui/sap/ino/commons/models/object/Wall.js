/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ino/commons/models/util/WallMapper",
    "sap/ino/commons/models/util/UUID",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/aof/ApplicationObjectChange"
], function(ApplicationObject, ReadSource, WallMapper, UUID, Configuration, ApplicationObjectChange) {
    "use strict";
    
    var WallMode = {
            Readonly : "Readonly",
            Write : "Write"
    };
    
    var sObjectName = "sap.ino.xs.object.wall.Wall";
    
    var Wall;
    Wall = ApplicationObject.extend("sap.ino.commons.models.object.Wall", {
        objectName : sObjectName,
        readSource : ReadSource.getDefaultAOFSource({
            cache : false
        }),

        invalidation : {
            entitySets : ["Wall", "MyWalls", "WallSearch"]
        },
        
        actionImpacts: {
            "create": [{"objectName": "sap.ino.commons.models.object.Idea",
	                    "objectKey": "IDEA_ID"}]
        },

        determinations : {
            onRead : determineRead,
            onNormalizeData : normalizeData
        },

        constructor : function() {
            ApplicationObject.apply(this, arguments);
            this._wallSessionUUID = UUID.generate();
        },

        process : function(oAjaxSettings) {
            return Wall.processRequest(this, oAjaxSettings);
        },

        getSyncDate : function() {
            return new Date(this.getLastReadDate().getTime() - 2500);
        },
        
        /**
         * Reads wall delta changes compared to last read date
         */
        readDeltaData : function() {
            var oPromise = this.readData({
                cache : false,
                headers : {
                    "wall-last-read" : this.getSyncDate().toUTCString(),
                    "wall-session-uuid" : this._wallSessionUUID
                }
            });
            this._lastReadDate = new Date();
            return oPromise;
        },

        /**
         * Poll wall delta changes compared to last read date
         */
        pollDeltaData : function() {
            var oPromise = jQuery.ajax({
                url : this.getEndpointURL().replace("/wall.xsjs", "/wall_poll.xsjs") + "/" + this.getKey(),
                type : "GET",
                dataType : "json",
                contentType : "application/json",
                cache : false,
                headers : {
                    "wall-last-read" : this.getSyncDate().toUTCString(),
                    "wall-session-uuid" : this._wallSessionUUID
                }
            });
            this._lastReadDate = new Date();
            return oPromise;
        },

        save : function(oSettings) {
            var that = this;
            var oPromise = this.modify(oSettings);
            oPromise.done(function() {
                var oData = that.getData();
                normalizeData(oData, that);
                setWallProperties(oData, that);
                that.setProperty("/WALL_EDITABLE", oData.WALL_EDITABLE);
                that.setProperty("/WALL_ADMINISTRABLE", oData.WALL_ADMINISTRABLE);
                that.setProperty("/CHANGED_AT", (new Date()).toJSON());
            });
            return oPromise;
        },

        /**
         * Stores one or multiple items in the backend.
         * 
         * Make sure to refresh/re-read the Wall if this method was not triggered by a change of the Wall.
         * 
         * @param aItem: the items that have changed 
         * @param bSync: save is triggered sync
         */
        saveItems : function(aItem, bSync, bSupressMapping) {
            var that = this;
            var sJSON = this._stringifyItems(aItem, true, bSupressMapping);
            var oPromise = this.process({
                type : "POST",
                cache : false,
                url : this.getEndpointURL(),
                data : sJSON,
                async : !bSync,
                contentType: "application/json; charset=UTF-8"
            });
            oPromise.done(function(oResponse) {
                that.setProperty("/CHANGED_AT", (new Date()).toJSON());
                var oChange = {
                    object: that.getApplicationObject(),
                    key: that.getProperty("/ID"),
                    dataUpdate: {CHANGED_AT: that.getProperty("/CHANGED_AT")},
                };
                ApplicationObjectChange.fireChange(oChange);
            });
            
            return oPromise;
        },

        /**
         * Deletes one or multiple items in the backend.
         * 
         * Make sure to refresh/re-read the Wall if this method was not triggered by a change of the Wall.
         * 
         * @param aItemId: item ids to be deleted
         */
        deleteItems : function(aItemId) {
            var that = this;
            var sIDs = aItemId.join();
            var oPromise = this.process({
                type : "DELETE",
                cache : false,
                url : this.getEndpointURL(),
                headers : {
                    "wall-wallItemIds" : sIDs
                }
            });
            oPromise.done(function(oResponse){
                var oChange = {
                    object: that.getApplicationObject(),
                    key: that.getProperty("/ID"),
                    dataUpdate: {CHANGED_AT: that.getProperty("/CHANGED_AT")}
                };
                ApplicationObjectChange.fireChange(oChange);
            });
            return oPromise;
        },

        addPermission : function(oNewPermission) {
            var aPermission = this.getProperty("/Permissions");
            var aMatches = jQuery.grep(aPermission, function(oPermission) {
                return oPermission.ID === oNewPermission.ID || oPermission.IDENTITY_ID === oNewPermission.IDENTITY_ID;
            });
            if (aMatches.length === 0) {
                oNewPermission.ID = this.getNextHandle();
                this.oData.Permissions.push(oNewPermission);
                this.oData.Permissions.sort(Wall.fnSortByName);

                this.checkUpdate(true);
                return true;
            }
            return false;
        },

        notifyPermissionUpdated : function(iPermissionId) {
            var aPermission = jQuery.grep(this.getProperty("/Permissions") || [], function(oPermission) {
                return oPermission.ID === iPermissionId;
            });
            return aPermission.length > 0;
        },

        removePermission : function(iPermissionId) {
            var that = this;
            var aPermission = jQuery.grep(this.getProperty("/Permissions") || [], function(oPermission) {
                return oPermission.ID === iPermissionId;
            });
            jQuery.each(aPermission, function(index, oPermission) {
                that.removeChild(oPermission);
            });
            return aPermission.length !== 0;
        },

        setBackgroundAttachmentImage : setBackgroundAttachmentImage,

        clearBackgroundAttachmentImage : clearBackgroundAttachmentImage,

        deltaUpdate : deltaUpdate,

        /**
         * Stringifies items to INO format.
         * 
         * @param vWallItem: items in WALL format
         * @param bIncludeWallId: includes the items with wall id in a object structure
         */
        _stringifyItems : function(vWallItem, bIncludeWallId, bSupressMapping) {
            var that = this;
            var vItem;
            if(bSupressMapping) {
                vItem = vWallItem;
            } else {
                vItem = this._mapWallItemsWallToIno(vWallItem);    
            }
            

            if (bIncludeWallId) {
                if (jQuery.type(vItem) !== "array") {
                    vItem = [vItem];
                }

                var oWall = {
                    ID : this.getKey(),
                    Items : vItem
                };

                return JSON.stringify(oWall);
            } else {
                return JSON.stringify(vItem);
            }
        },

        /**
         * Format one or multiple WALL items to INO format.
         */
        _mapWallItemsWallToIno : function(vWallItem) {
            var that = this;

            if (jQuery.type(vWallItem) == "array") {
                var aWallItems = [];
                vWallItem.forEach(function(oItem) {
                    aWallItems.push(that._mapWallItemsWallToIno(oItem));
                });

                return aWallItems;
            } else {

                return WallMapper.mapItemToIno(vWallItem);
            }
        }
    });

    function determineRead(oData, oWall) {
        jQuery.each(oData.Items || [], function(iIndex, oItem) {
            if (oItem.CHANGED_AT > oData.CHANGED_AT) {
                oData.CHANGED_AT = oItem.CHANGED_AT;
            }
        });
        setWallAggregations(oData, oWall);
        setWallProperties(oData, oWall);
        return oData;
    }

    function setWallAggregations(oData, oWall) {
        oData.Permissions = [].concat(oData.Readers).concat(oData.Writers).concat(oData.Admins);
        oData.Permissions.sort(Wall.fnSortByName);
    }

    function setWallProperties(oData, oWall) {
        oData.WALL_EDITABLE = !oData.IS_LOCKED && oData.IS_EDITABLE === 1;
        oData.WALL_ADMINISTRABLE = !oData.IS_LOCKED && oData.IS_ADMINISTRABLE === 1;
    }

    function deltaUpdate(oData, fnCallback) {
        /* jshint validthis: true */
        if (!oData) {
            return undefined;
        }
        if (oData.ACTION_CODE != "DELETED") {
            var oWallJSON = WallMapper.mapWallFromIno(oData, true);
            if (oData.ITEM_SCOPE) {
                delete oWallJSON.strongestAuth;
            }
            fnCallback(oWallJSON);
            delete oData.ID;
            delete oData.ITEM_SCOPE;
            delete oData.ACTION_CODE;
            oData = jQuery.extend(this.getData(), oData);
            setWallAggregations(oData, this);
            setWallProperties(oData, this);
            this.setData(oData);
            this.setAfterInitChanges();
            return true;
        }
        return false;
    }

    function setBackgroundAttachmentImage(iAttachmentId) {
        /* jshint validthis: true */
        var aBackgroundImage = this.getProperty("/BackgroundImage") || [];
        if (aBackgroundImage.length === 0) {
            aBackgroundImage = [{
                ID : this.getNextHandle()
            }];
        }
        aBackgroundImage[0].ATTACHMENT_ID = iAttachmentId;
        this.setProperty("/BackgroundImage", aBackgroundImage);
        this.setProperty("/BACKGROUND_IMAGE_URL", "");
        this.setProperty("/BACKGROUND_COLOR", "");
        this.setProperty("/BACKGROUND_IMAGE_ZOOM", 100);
        this.setProperty("/BACKGROUND_IMAGE_REPEAT", 0);
        this.setProperty("/BACKGROUND_IMAGE_POSITION_X", 0);
        this.setProperty("/BACKGROUND_IMAGE_POSITION_Y", 0);
    }

    function clearBackgroundAttachmentImage(bExcludeURL) {
        /* jshint validthis: true */
        this.setProperty("/BackgroundImage", []);
        if (!bExcludeURL) {
            this.setProperty("/BACKGROUND_IMAGE_URL", "");
        }
        this.setProperty("/BACKGROUND_IMAGE_ZOOM", null);
        this.setProperty("/BACKGROUND_IMAGE_REPEAT", null);
        this.setProperty("/BACKGROUND_IMAGE_POSITION_X", null);
        this.setProperty("/BACKGROUND_IMAGE_POSITION_Y", null);
    }

    function normalizeData(oData, oWall) {
        var oBeforeData = oWall.getBeforeData();
        oData.Readers = [];
        oData.Writers = [];
        oData.Admins = [];
        jQuery.each(oData.Permissions || [], function(index, oPermission) {
            var aBeforeMatchingPermission = jQuery.grep(oBeforeData.Permissions, function(oBeforePermission) {
                return oBeforePermission.IDENTITY_ID === oPermission.IDENTITY_ID;
            });
            var iId = oPermission.ID;
            if (aBeforeMatchingPermission.length > 0 && aBeforeMatchingPermission[0].ROLE_CODE !== oPermission.ROLE_CODE) {
                iId = oWall.getNextHandle();
            }

            switch (oPermission.ROLE_CODE) {
                case "WALL_READER" :
                    oData.Readers.push({
                        ID : iId,
                        IDENTITY_ID : oPermission.IDENTITY_ID
                    });
                    break;
                case "WALL_WRITER" :
                    oData.Writers.push({
                        ID : iId,
                        IDENTITY_ID : oPermission.IDENTITY_ID
                    });
                    break;
                case "WALL_ADMIN" :
                    oData.Admins.push({
                        ID : iId,
                        IDENTITY_ID : oPermission.IDENTITY_ID
                    });
                    break;
                default:
                    break;
            }
        });
        return oData;
    }

    Wall.readItems = function(aWallId, bAsync) {
        return jQuery.ajax({
            url : Wall.getBackendUrl(),
            headers : {
                "wall-action" : "readItems",
                "wall-wallIds" : aWallId.toString()
            },
            accepts : "application/json",
            async : bAsync !== false,
            cache : false
        });
    };

    Wall.readWalls = function(aWallId, bAsync) {
        return jQuery.ajax({
            url : Wall.getBackendUrl(),
            headers : {
                "wall-action" : "readWalls",
                "wall-wallIds" : aWallId.toString()
            },
            accepts : "application/json",
            async : bAsync !== false,
            cache : false
        });
    };

    Wall.getBackendUrl = function() {
        return Configuration.getBackendRootURL() + Configuration.getApplicationObject(sObjectName);
    };

    Wall.fnSortByName = function(a, b) {
        var aName = a && a.IDENTITY_NAME && a.IDENTITY_NAME.toLowerCase();
        var bName = b && b.IDENTITY_NAME && b.IDENTITY_NAME.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    };
    
    Wall.processRequest = function(oWall, oAjaxSettings) {
        var aProcessArguments = [oAjaxSettings];

        if (!oAjaxSettings.headers || !oAjaxSettings.headers["wall-session-uuid"]) {
            if (!oAjaxSettings.headers) {
                oAjaxSettings.headers = {};
            }
            oAjaxSettings.headers["wall-session-uuid"] = oWall._wallSessionUUID || UUID.generate();
        }

        var oPromise;

        if (!oWall._lastProcessPromise) {
            oPromise = ApplicationObject.prototype.process.apply(oWall, aProcessArguments);
        } else {
            var oDeferred = jQuery.Deferred();
            oWall._lastProcessPromise.hasSuccessor = true;
            oWall._lastProcessPromise.always(function() {
                ApplicationObject.prototype.process.apply(oWall, aProcessArguments).always(function(oResponse, sSuccess, oAjaxResponse) {
                    oDeferred.resolve(oResponse, sSuccess, oAjaxResponse);
                }).fail(function(oResponse) {
                    oDeferred.reject(oResponse);
                });
            });
            oPromise = oDeferred.promise();
        }
        oWall._lastProcessPromise = oPromise;
        oPromise.always(function() {
            if (oWall._lastProcessPromise && !oWall._lastProcessPromise.hasSuccessor) {
                oWall._lastProcessPromise = null;
            }
        });

        return oPromise;     
    };
    
    return Wall;
});