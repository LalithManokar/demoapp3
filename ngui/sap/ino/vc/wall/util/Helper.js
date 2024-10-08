/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "jquery.sap.storage"
], function(JSONModel) {
    "use strict";
    
    var Helper = {};
    var Component = {};
    var StorageKey = "sap.ino.vc.wall.util.Helper-";
    var Storage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
    /**
     * removes unwanted HTML tags from a string
     * 
     * @param {string}
     *            sStyle the style string
     * @returns {string} the prefixed style string
     * @public
     */
    Helper.stripTags = function(sInput, sAllowed) {
        var sTags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, sComments = /<!--[\s\S]*?-->/gi;
        sAllowed = (((sAllowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
        return sInput.replace(sComments, '').replace(sTags, function($0, $1) {
            return sAllowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    };
    
    Helper.initHelper = function (oComponent) {
        Component = oComponent;
        if(!Component.getModel("wallremote")) {
            var oWallRemoteModel = new JSONModel({
                MAX_ZINDEX : 100,
                Offline : false,
                OfflineItemId : -1,
                OfflineChanges : false,
                ItemPositionX : 4200,
                ItemPositionY : 4200
            });
            Component.setModel(oWallRemoteModel, "wallremote");
        }
        if(!Component.getModel("walloffline")) {
            var oWallOfflineModel = new JSONModel();
            Component.setModel(oWallOfflineModel, "walloffline");
        }
    };
    
    Helper._getNextNegativeItemId = function (aItems) {
        var iItemId =  Component.getModel("wallremote").getProperty("/OfflineItemId");
        if(iItemId === -1) {
            aItems.forEach(function (oItem) {
                if(oItem && oItem !== null) {
                    iItemId = Math.min(iItemId, oItem.ID);    
                }
            });
            if(iItemId === -1) {
                Component.getModel("wallremote").setProperty("/OfflineItemId", iItemId - 1);
                return iItemId;
            }
        }
        iItemId--;
        Component.getModel("wallremote").setProperty("/OfflineItemId", iItemId);
        return iItemId;
    };
    
    Helper.setOffline = function (bOffline) {
       Component.getModel("wallremote").setProperty("/Offline", bOffline);
    };
    
    Helper.isOffline = function () {
        return Component.getModel("wallremote").getProperty("/Offline"); 
    };
    
    Helper.deleteAll = function() {
        Component.getModel("walloffline").setData({});
        Storage.clear();
        return true;
    };
    
    Helper.resetOfflineItems = function(oData) {
        Storage.remove(StorageKey + oData.ID);
        Component.getModel("walloffline").setProperty("/Items", oData.Items);
        Helper.setOfflineChanges();
        return true;
    };

    Helper.resetOfflineItem = function(oData, iItemId) {
        var aOfflineItems = Component.getModel("walloffline").getProperty("/Items");
        var iIndex = 0;
        for(var i = 0; i < aOfflineItems.length; i++) {
            if(iItemId === aOfflineItems[i].ID) {
                iIndex = i;
                aOfflineItems.splice(i, 1); 
            }
        }
        
        Helper.store(oData.ID);
        
        oData.Items.forEach(function(oItem) {
            if(oItem.ID === iItemId) {
                aOfflineItems.splice(iIndex, 0, oItem);
            } 
        });
        Component.getModel("walloffline").checkUpdate();
        return true;
    };
    
    Helper.delete = function(iWallItemId, iWallId) {
        if(iWallItemId < 0) {
            var oOfflineData = Component.getModel("walloffline").getData();
            var aOfflineItems = oOfflineData.Items;
            for(var i = aOfflineItems.length - 1; i >= 0; i--){
                if(aOfflineItems[i].ID === iWallItemId) {
                    aOfflineItems.splice(i, 1);       
                }
            }   
        }
        Storage.remove(StorageKey + iWallId);
        Helper.store(iWallId);
        Helper.setOfflineChanges();
        return true;
    };
    
    Helper.store = function (iWallId) {
        if(Storage.isSupported()) {
            Component.getModel("walloffline").checkUpdate();
            var aItems = Component.getModel("walloffline").getProperty("/Items");
            var aStoreArray = [];
            for(var i = 0; i < aItems.length; i++) {
                if(aItems[i].ID < 0 || aItems[i].changed) {
                    aStoreArray.push(aItems[i]);
                }
            }

            Storage.put(StorageKey + iWallId, aStoreArray);    
        }
    };
    
    Helper.load = function (iWallId, oOnlineData) {
        if(Storage.isSupported()) {
            var aOfflineItems = Storage.get(StorageKey + iWallId);
        
            var aOnlineItems = oOnlineData.Items;
            var aItems = [];
        
            if(aOfflineItems && aOfflineItems[0] !== null) {
                for(var i = aOfflineItems.length - 1; i >= 0; i--){
                   if(aOfflineItems[i].ID >= 0) {
                        aOfflineItems.splice(i, 1);       
                   }
                }
    
                aItems = aOnlineItems.concat(aOfflineItems);    
            } else if(aOnlineItems) {
                aItems = aOnlineItems;
            }
            oOnlineData.Items = aItems;
            Component.getModel("walloffline").setData(oOnlineData);
        }
    };
    
    Helper.addOfflineItem = function(oItemData, iWallId) {
        var aItems = Component.getModel("walloffline").getProperty("/Items");
        if(aItems) {
            oItemData.ID = Helper._getNextNegativeItemId(aItems);
            aItems.unshift(oItemData);   
        }
        Component.getModel("walloffline").checkUpdate();
        Helper.store(iWallId);
        Helper.setOfflineChanges();
    };
    
    Helper.getCurrentItemData = function(iWallItemId) {
        var aItems = Component.getModel("walloffline").getData().Items;
        if(aItems) {
            var aMatchedItems = jQuery.grep(aItems, function(oItem) {
                return oItem.ID === iWallItemId;
            });
            if(aMatchedItems && aMatchedItems.length > 0 ) {
                return aMatchedItems[0];
            }
        }
        return undefined;
    };
    
    Helper.getOfflineModel = function() {
        return Component.getModel("walloffline");  
    };
    
    Helper.hasChanges = function () {
        var aItems = Component.getModel("walloffline").getProperty("/Items");
        if(aItems) {
            for(var i = 0; i < aItems.length; i++) {
                if(aItems[i].changed) {
                    return true;
                }
            }
        }
        return false;
    };
    
    Helper.hasUnsavedChanges = function() {
        var aItems = Component.getModel("walloffline").getProperty("/Items");
        
        for(var i = 0; i < aItems.length; i++) {
            if(aItems[i].ID >= 0 && aItems[i].changed) {
                return true;
            }
        }
        return false;
    };
    
    Helper.setOfflineChanges = function () {
        Component.getModel("wallremote").setProperty("/OfflineChanges", Helper.hasChanges());
    };
    
    Helper.createRandomHexColor = function() {
        var sColor = Math.floor(Math.random() * 16777215).toString(16);

        // fill prepending 0s
        while (sColor.length < 6) {
            sColor = "0" + sColor;
        }

        return sColor;
    };
    
    Helper.getOrderedPosition = function () {
        var iX = Component.getModel("wallremote").getProperty("/ItemPositionX");
        var iY = Component.getModel("wallremote").getProperty("/ItemPositionY");
        if(iX >= 5400) {
            iX = 4500;
            if(iY >= 4800) {
                iY = 4500;
            } else {
                iY += 300;  
            }
        } else {
            iX += 300;
        }
        Component.getModel("wallremote").setProperty("/ItemPositionX", iX);
        Component.getModel("wallremote").setProperty("/ItemPositionY", iY);
        return {x : iX, y : iY};
    };
    
    Helper.resetItemPosition = function () {
        Component.getModel("wallremote").setProperty("/ItemPositionX", 4200);
        Component.getModel("wallremote").setProperty("/ItemPositionY", 4200);
    };
    
    Helper.getText = function (sText, aParameters) {
        return Component.getModel("i18n").getResourceBundle().getText(sText, aParameters);
    };
    
    Helper.getWallItemTemplates = function () {
        var oWallData = {
            "sap.ino.config.HEADLINE" : {
                wallData : {
                    "TEXT" : Helper.getText("WALL_ITEMHEADLINE_NEW_TEXT"),
                    "STYLE" : "CLEAR",
                    "SIZE" : "H3"
                },
                "listIcon" : "sap-icon://header",
                "textKey" : "WALL_REMOTE_LIST_MIT_HEADLINE",
                "defaultTextKey" : "WALL_ITEMHEADLINE_NEW_TEXT"
            },
            "sap.ino.config.STICKER" : {
                wallData : {
                    "TEXT" : Helper.getText("WALL_ITEMSTICKER_NEW_TEXT"),
                    "COLOR" : "FCF294"
                },
                "listIcon" : "sap-icon://notes",
                "textKey" : "WALL_REMOTE_LIST_MIT_STICKER",
                "defaultTextKey" : "WALL_ITEMSTICKER_NEW_TEXT"
            },
            "sap.ino.config.LINK" : {
                wallData : {
                    "TEXT" : Helper.getText("WALL_ITEMLINK_NEW_TEXT"),
                    "URL" : "",
                    "ICON" : "MISC"
                },
                "listIcon" : "sap-icon://chain-link",
                "textKey" : "WALL_REMOTE_LIST_MIT_LINK",
                "defaultTextKey" : "WALL_ITEMLINK_NEW_TEXT"
            },
            "sap.ino.config.IMAGE" : {
                wallData : {
                    "CAPTION" : Helper.getText("WALL_ITEMIMAGE_NEW_TEXT"),
                    "SHOW_AS_ICON" : false
                },
                "listIcon" : "sap-icon://image-viewer",
                "textKey" : "WALL_REMOTE_LIST_MIT_IMAGE",
                "defaultTextKey" : "WALL_ITEMIMAGE_NEW_TEXT"
            },
            "sap.ino.config.TEXT" : {
                wallData : {
                    "CAPTION" : Helper.getText("WALL_ITEMTEXT_NEW_TEXT"),
                    "TEXT" : ""
                },
                "listIcon" : "sap-icon://document-text",
                "textKey" : "WALL_REMOTE_LIST_MIT_TEXT",
                "defaultTextKey" : "WALL_ITEMTEXT_NEW_TEXT"
            },
            "sap.ino.config.SPRITE" : {
                wallData : {
                    "COLOR" : "2865f6",
                    "SHAPE" : "ROUND",
                    "TEXT" : ""
                },
                "size" : 50,
                "listIcon" : "sap-icon://number-sign",
                "textKey" : "WALL_REMOTE_LIST_MIT_SPRITE",
                "defaultTextKey" : "WALL_ITEMHEADLINE_NEW_TEXT"
            },
            "sap.ino.config.PERSON" : {
                wallData : {
                    "NAME" : "",
                    "PHONE" : "",
                    "EMAIL" : "",
                    "ORIGIN_ID" : 0,
                    "REQUEST_IMAGE" : false
                },
                "listIcon" : "sap-icon://person-placeholder",
                "textKey" : "WALL_REMOTE_LIST_MIT_PERSON",
                "defaultTextKey" : "WALL_ITEMPERSON_NEW_TEXT"
            },
            "sap.ino.config.VIDEO" : {
                wallData : {
                    "URL" : "",
                    "CAPTION" : Helper.getText("WALL_ITEMVIDEO_NEW_TEXT")
                },
                "listIcon" : "sap-icon://video",
                "textKey" : "WALL_REMOTE_LIST_MIT_VIDEO",
                "defaultTextKey" : "WALL_ITEMVIDEO_NEW_TEXT"
            },
            "sap.ino.config.ATTACHMENT" : {
                wallData : {
                    "CAPTION" : Helper.getText("WALL_ITEMATTACHMENT_NEW_TEXT"),
                    "FILE_NAME" : Helper.getText("WALL_ITEMATTACHMENT_NEW_TEXT"),
                    "TYPE" : "DOCUMENT"
                },
                "listIcon" : "sap-icon://attachment",
                "textKey" : "WALL_REMOTE_LIST_MIT_ATTACHMENT",
                "defaultTextKey" : "WALL_ITEMATTACHMENT_NEW_TEXT"
            },
            "sap.ino.config.GROUP" : {
                wallData : {
                    "TEXT" : Helper.getText("WALL_ITEMGROUP_NEW_TEXT"),
                    "COLOR" : "FCF294"
                },
                "size" : 300,
                "listIcon" : "sap-icon://folder-blank",
                "textKey" : "WALL_REMOTE_LIST_MIT_GROUP",
                "defaultTextKey" : "WALL_ITEMGROUP_NEW_TEXT"
            },
            "sap.ino.config.LINE" : { 
                wallData : {
                    "ORIENTATION" : "VERTICAL",
                    "THICKNESS" : 4,
                    "STYLE" : "SOLID",
                    "COLOR" : "FCF294"
                },
                "listIcon" : "sap-icon://less",
                "textKey" : "WALL_REMOTE_LIST_MIT_LINE",
                "defaultTextKey" : "WALL_ITEMHEADLINE_NEW_TEXT"
            },
            "sap.ino.config.ARROW" : {
                wallData : {
                    "X1": 4800,
                    "X2": 5000,
                    "Y1": 4800,
                    "Y2": 5000,
                    "COLOR": "000000",
                    "HEAD_STYLE": "END",
                    "STYLE": "SOLID",
                    "TEXT": "",
                    "THICKNESS": 4
                },
                "listIcon" : "sap-icon://chart-axis",
                "textKey" : "WALL_REMOTE_LIST_MIT_ARROW",
                "defaultTextKey" : ""
            }
        };
        return oWallData;
    };
    return Helper;
});