/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/commons/BaseListController",
    "sap/ino/commons/models/object/Wall",
    "sap/ino/commons/models/object/WallItem",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/wall/util/Helper",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/ui/core/MessageType"
], function(BaseController, Wall, WallItem, BaseFormatter, TopLevelPageFacet, Helper, MessageToast, JSONModel, Sorter, MessageBox, MessageType) {
    
    "use strict";
    
    var oFormatter = jQuery.extend({}, BaseFormatter);
    oFormatter.correctContent = function(oContent) {
        var description;
        if (oContent.CAPTION) {
            description = oContent.CAPTION;
        } else if(oContent.TEXT) {
            description = Helper.stripTags(oContent.TEXT);
        } else if (oContent.NAME) {
       	    description = oContent.NAME;
        } else if(oContent.ORIENTATION){
            description = oContent.ORIENTATION.charAt(0) + oContent.ORIENTATION.slice(1).toLowerCase();
        } else {
            description = "";
        }
        return description;
    };
    oFormatter.correctIcon = function(sType) {
        return this.oWallData[sType].listIcon;
    };
    oFormatter.correctTitle = function(sType) {
        return this.getText(this.oWallData[sType].textKey);
    };

    return BaseController.extend("sap.ino.vc.wall.remote.WallRemote", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremote"],
        formatter: oFormatter,
        
        onInit: function() {
            BaseController.prototype.onInit.apply(this, arguments);
            Helper.initHelper(this.getOwnerComponent());   
            var oWallData = Helper.getWallItemTemplates();
            
            var aWallData = [];
            for(var key in oWallData) {
                if (oWallData.hasOwnProperty(key)) {
                    var oItem = oWallData[key];
                    oItem.type = key;
                    aWallData.push(oItem);
                }
            }
            
            this.setViewProperty("/edit", false); 
            
            this.oWallData = oWallData;
            this.getList().attachUpdateFinished(this.onUpdateFinished, this);
            this.setViewProperty("/Items", aWallData);
            this.initCreateItemsDialog();
        },
        
        onRouteMatched : function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var iWallId = parseInt(oArgs.id, 10);
            
            if(iWallId !== this.iWallId) {
                Helper.resetItemPosition();
            }
            this.iWallId = iWallId;

            if(!Helper.isOffline()) {
                this.setOnlineModel();
            }
            this.setViewProperty("/edit", false);
            this.bindList();
        },

        onOfflineMode : function(oEvent){
            var bOffline = oEvent.getParameter("pressed");
            
            var that = this;
            this.setViewProperty("/edit", false);
            if(bOffline) {
                this.setOfflineModel(bOffline);
            } else {
                if(Helper.hasUnsavedChanges()) {
                    var confirmNavigation = function(oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            Helper.setOffline(false);
                            that.setOnlineModel();
                        }
                        if(oAction === MessageBox.Action.CANCEL) {
                            that.byId("offlineButton").setPressed(true);
                        }
                    };
                    this.getOwnerComponent().getRootController().showConfirmation(MessageType.QUESTION, this.getText("WALL_REMOTE_DATALOSS"), this.getText("COMMON_TIT_DATALOSS"), confirmNavigation);
                } else {
                    Helper.setOffline(bOffline);
                    that.setOnlineModel();
                }
            }
        },
        
        setOnlineModel : function() {
            this.oWallModel = new Wall(this.iWallId);
            this.setModel(this.oWallModel, "wall");
            var oPromise = this.oWallModel.getDataInitializedPromise();
            var that = this;
            oPromise.done(function() {
                that.setInitSpriteValue();
            });
            
            return oPromise;
        },
        
        setOfflineModel : function (bOffline) {
            Helper.setOffline(bOffline);
            Helper.load(this.iWallId, this.getModel("wall").getData());
            Helper.store(this.iWallId);
            this.setModel(Helper.getOfflineModel(), "wall");
            Helper.setOfflineChanges();
        },

        getRemoteModel : function () {
           return this.getOwnerComponent().getModel("wallremote"); 
        },
        
        getList : function() {
            return this.byId("wallRemotelist");
        },
        
        onCreateIdeaFromWall : function() {
            this.navigateTo("idea-create", { "query" : { wall : this.getWallModel().getKey() } });
        },
        
        onNavBack : function () {
            var that = this;
            if(Helper.isOffline() && Helper.hasChanges()) {
                var confirmNavigation = function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        BaseController.prototype.onNavBack.apply(that, arguments);
                        Helper.deleteAll();
                        Helper.setOffline(false);
                    }
                };
                this.getOwnerComponent().getRootController().showConfirmation(MessageType.QUESTION, this.getText("WALL_REMOTE_DATALOSS"), this.getText("COMMON_TIT_DATALOSS"), confirmNavigation);
            } else {
                BaseController.prototype.onNavBack.apply(this, arguments);
            }
        },
         
        onRefresh : function () {
            var oWallModel = this.getWallModel();
            var that = this;
            oWallModel.sync();
            oWallModel.getDataInitializedPromise().done(function() {
                that.getView().byId("pullToRefresh").hide();
            });
        },
        
        onActivateItem : function (oEvent) {
            var aItems = Helper.getOfflineModel().getProperty("/Items");
            var iItemId = oEvent.getSource().getBindingContext("wall").getProperty("ID");
            var oItemData;
            aItems.forEach(function(oItem) {
                if(oItem.ID === iItemId) {
                    oItemData = oItem;
                }
            });
            
            var that = this;
            oItemData = this.setDefaultTitle(oItemData);
            var oWallItem = new WallItem();
            oWallItem.setData(oItemData);
            var oPromise = oWallItem.modify();
            
            oPromise.done(function() {
                that.syncActivation(oWallItem, oItemData.ID);
            });
            oPromise.fail(function(){
                that.onRefresh();
                MessageToast.show(that.getText("WALL_REMOTE_ITEM_CREATE_FAIL"));
            });
            return oPromise;
            
        },
        
        setDefaultTitle : function (oItemData) {
            if (oItemData.CONTENT.CAPTION !== undefined && oItemData.CONTENT.CAPTION === "") {
                oItemData.CONTENT.CAPTION = this.getText(Helper.getWallItemTemplates(this)[oItemData.WALL_ITEM_TYPE_CODE].defaultTextKey);
            } else if(oItemData.CONTENT.TEXT !== undefined && oItemData.CONTENT.TEXT === "") {
               oItemData.CONTENT.TEXT = this.getText(Helper.getWallItemTemplates(this)[oItemData.WALL_ITEM_TYPE_CODE].defaultTextKey);
            } else if (oItemData.CONTENT.NAME !== undefined && oItemData.CONTENT.NAME === "") {
           	   oItemData.CONTENT.NAME = this.getText(Helper.getWallItemTemplates(this)[oItemData.WALL_ITEM_TYPE_CODE].defaultTextKey);
            }
            return oItemData;
        },
        
        syncActivation : function (oWallItem, iId) {
            oWallItem.setProperty("/changed", false);
            Helper.delete(iId, this.iWallId);
            this.onRefresh();
            Helper.setOfflineChanges();
        },
        
        onActivateAllItems : function () {
            var aItems = Helper.getOfflineModel().getProperty("/Items");
            var that = this;
            var oWallModel = new Wall();
            oWallModel.setData({
                ID : this.iWallId
            });
            var aChangedItems = [];
            for (var i = 0; i < aItems.length; i++) {
                if(aItems[i].changed) {
                    aItems[i] = this.setDefaultTitle(aItems[i]);
                    aChangedItems.push(aItems[i]);    
                }
            }
            var oPromise = oWallModel.saveItems(aChangedItems, false, true);


            oPromise.done(function() {
                that.onDiscardChanges(false);
            });
            
            return oPromise;
        },
        
        onListSwipe : function (oEvent) {
            var bChanged = !Helper.isOffline() || oEvent.getParameter("listItem").getBindingContext("wall").getProperty("changed");
            this.byId("listDeleteButton").setVisible(bChanged || false);
        },
        
        onEditPressed : function() {
		    var bEdit = !this.getViewProperty("/edit");
		    if (!bEdit) {
                this.saveWallData();
		    }
		    this.setViewProperty("/edit", bEdit);
            var oWallList = this.byId("wallRemotelist");
		    if (bEdit) {
		        oWallList.setMode(sap.m.ListMode.Delete);
		    } else {
		        oWallList.setMode(sap.m.ListMode.None);
		    }
        },

        onTitleChange : function() {
            this.saveWallData();
        },
        
        saveWallData : function() {
            this.byId("editButton").focus();
            if (this.getWallModel().hasPendingChanges()) {
                var that = this;
                
                var oPromise = this.getWallModel().modify();
            
                oPromise.done(function() {
                });
                oPromise.fail(function() {
                    MessageToast.show(that.getText("WALL_REMOTE_TITLE_CHANGE_FAIL"));
                    that.getWallModel().sync();
                });  
                this.getWallModel().setAfterInitChanges();
                return oPromise;
            }
        },
        
        onDiscardChanges : function(bDiscard) {
            var oOnlineModel = new Wall(this.iWallId);
            var oPromise = oOnlineModel.getDataInitializedPromise();
            var that = this;
            
            oPromise.done(function(oEvent) {
                var bSuccess = Helper.resetOfflineItems(oEvent);
            
                if(bDiscard) {
                   that.deleteMessage(bSuccess);
                } else {
                    Helper.setOfflineChanges();
                }
                
            });
            
            oPromise.fail(function() {
                that.deleteMessage(false);
            });
            
            return oPromise;
        },
        
        deleteMessage : function (bSuccess) {
            var that = this;
            if(bSuccess) {
                if(Helper.isOffline()) {
                    MessageToast.show(that.getText("WALL_REMOTE_DISCARD_SUCCESSFUL"));
                } else {
                    MessageToast.show(that.getText("WALL_REMOTE_ITEM_DELETE_SUCCESSFUL"));
                }
            } else {
                if(Helper.isOffline()) {
                    MessageToast.show(that.getText("WALL_REMOTE_DISCARD_FAIL"));
                } else {
                    MessageToast.show(that.getText("WALL_REMOTE_ITEM_DELETE_FAIL"));
                }
                
            }   
        },
        
        onItemDelete : function(oEvent) {
            var that = this;
             var oItem;
            if(oEvent.sId === "delete") {
                 oItem = oEvent.getParameter("listItem");
            } else {
                var oList = oEvent.getSource().getParent();
                oItem = oList.getSwipedItem();
                oList.swipeOut();
            }
           
            var iItemId = oItem.getBindingContext("wall").getProperty("ID");
            
            if(Helper.isOffline()) {
                var bSuccess;
                if(iItemId < 0) {
                    bSuccess = Helper.delete(iItemId, that.iWallId);    
                } else {
                    var oOnlineModel = new Wall(this.iWallId);
                    var oPromiseOffline = oOnlineModel.getDataInitializedPromise();
                    
                    oPromiseOffline.done(function(oEventi) {
                        bSuccess = Helper.resetOfflineItem(oEventi, iItemId);
                        that.deleteMessage(bSuccess);
                    });
                    oPromiseOffline.fail(function() {
                       that.deleteMessage(false);
                    });
                    return oPromiseOffline;
                }
                this.deleteMessage(bSuccess);
            } else {
                this.executeDelete([iItemId], true); 
            }
        },
        
        executeDelete : function(aItemIds, bSingleDelete, aItems) {
            if(bSingleDelete) {
                aItems = this.getWallModel().getProperty("/Items");
                aItems = jQuery.grep(aItems, function (oListItem) {
                    return oListItem.ID !== aItemIds[0];
                });    
            }

            var oPromise = this.getWallModel().deleteItems(aItemIds);
            this.getWallModel().setProperty("/Items", aItems);
            var that = this;
            if(bSingleDelete) {
                oPromise.done(function() {
                    that.deleteMessage(true);
                    that.getWallModel().sync();
                });
            } else {
                oPromise.done(function() {
                    MessageToast.show(that.getText("WALL_REMOTE_ALL_ITEM_DELETE_SUCCESSFUL"));
                    that.getWallModel().sync();
                });
            }

            oPromise.fail(function() {
                that.deleteMessage(false);
                that.getWallModel().sync();
            });  
            
            return oPromise;
        },
        
        onDeleteAllItems : function() {
            var aItems = this.getWallModel().getProperty("/Items");
            var aItemIds = jQuery.map(aItems, function(oItem) {
                return oItem.ID;
            });
            this.executeDelete(aItemIds, false, aItems); 
        },
        
        onWallDelete : function(oEvent) {
            var that = this;
            var oWallModel = this.getWallModel();
            function deleteWall(oAction) {
                if (oAction === MessageBox.Action.OK) {
                    var oDeleteRequest = oWallModel.del();
                    oDeleteRequest.done(function() {
                        oWallModel._bDeleted = true;
                        BaseController.prototype.onNavBack.apply(that, arguments);
                    });
                    oDeleteRequest.fail(function(oResponse) {
                        MessageToast.show(that.getText("WALL_REMOTE_DELETE_FAIL"));
                    });
                }
            }
            MessageBox.confirm(this.getText("WALL_INS_WALL_DELETE"), deleteWall, this.getText("WALL_TIT_WALL_DELETE"));
        },

        initCreateItemsDialog : function () {
            var oDialog = this.createFragment("sap.ino.vc.wall.fragments.WallRemoteCreateItemsDialog");
            this.getView().addDependent(oDialog);
            oDialog.bindElement({
                path : "view>/"
            });
            this.oDialog = oDialog;
        },
        
        onWallPickerCancel : function (oEvent) {
            oEvent.getSource().getParent().close();
        },
        
        getWallModel : function() {
            return this.oWallModel;  
        },
        
        getItemTemplate : function() {
            return this.getFragment("sap.ino.vc.wall.fragments.WallRemoteListItem");
        },
        
        bindList: function() {
            this.setPath("wall>/Items");
            this.setSorter(new Sorter("CHANGED_AT", true));
            BaseController.prototype.bindList.apply(this, arguments);
        },
        
        onItemPress : function (oEvent) {
            var oContext = oEvent.getParameter("listItem").getBindingContext("wall");
            var sPath = oContext.getProperty("WALL_ITEM_TYPE_CODE").split(".")[3];
            this.getRemoteModel().setProperty("MAX_ZINDEX", this.getMaxZindex());
            this.navigateTo("wallremoteitem-" + sPath.toLowerCase(), {
                id: oContext.getProperty("ID"),
                wallid: this.iWallId
            });
        },
        
        onCreateItemPressed : function() {
            this.oDialog.open();
        },
        
        getMaxZindex : function () {
            var iMaxZindex = 0;
            var aWallItems = this.oWallModel.getData().Items;
            for(var i = 0; i < aWallItems.length; i++) {
                iMaxZindex = Math.max(iMaxZindex, aWallItems[i].ZINDEX); 
            }
            return iMaxZindex;
        },
        
        saveItem : function (oItemData) {
            var oWallItem = new WallItem();
            oWallItem.setData(oItemData);
            var oPromise = oWallItem.modify();
            
            return oPromise;
        },

        onCreateItem : function (oEvent) {
            var that = this;
            var sItemType = oEvent.getSource().data("item");
            var oRemoteModel = this.getRemoteModel();
            oRemoteModel.setProperty("MAX_ZINDEX", this.getMaxZindex());
            //shallow copy or deep copy?
            var oItemData = this.getCreateItemData(sItemType, jQuery.extend(true, {}, this.oWallData[sItemType]), oRemoteModel.getData().MAX_ZINDEX);
            
            if(Helper.isOffline()) {
                Helper.addOfflineItem(oItemData, this.iWallId);
                that.navAfterCreation(sItemType, oItemData, that);
            } else {
                var oPromise = this.saveItem(oItemData);
                oPromise.done(function() {
                    that.navAfterCreation(sItemType, oItemData, that);   
                    Helper.setOfflineChanges();
                });
                oPromise.fail(function(){
                    that.onRefresh();
                    MessageToast.show(that.getText("WALL_REMOTE_ITEM_CREATE_FAIL"));
                });
            }
        },
        
        navAfterCreation : function (sItemType, oItemData, that) {
            var sPath = sItemType.split(".")[3];
                    that.navigateTo("wallremoteitem-" + sPath.toLowerCase(), {
                        id: oItemData.ID,
                        wallid: that.iWallId
                    });
            jQuery.sap.delayedCall(500, null, function() {    
                MessageToast.show(that.getText("WALL_REMOTE_CREATE_ITEM", that.getText("WALL_REMOTE_LIST_MIT_" + sPath)), {
                    closeOnBrowserNavigation: false
                });
            });
        },
        
        getCreateItemData : function(sWallItemType, oWallData, iMaxZindex) {
            var oContent = oWallData.wallData;
            var iSize = oWallData.size || 200;
            if(sWallItemType === "sap.ino.config.SPRITE") {
                //this.setInitSpriteValue();
                oContent.TEXT = this.getNextInitSpriteValue();
            }
            if(sWallItemType === "sap.ino.config.SPRITE" || sWallItemType === "sap.ino.config.GROUP") {
                oContent.COLOR = Helper.createRandomHexColor();
            }
            var oPos = Helper.getOrderedPosition();
            //4900 + Math.round(this.getRandomFactor()
            return {
                ID : -1,
                WALL_ID : this.iWallId,
                POSITION_X : oPos.x,
                POSITION_Y : oPos.y,
                WIDTH : iSize,
                HEIGHT : iSize,
                ZINDEX : iMaxZindex + 1,
                CONTENT : oContent,
                WALL_ITEM_TYPE_CODE : sWallItemType,
                changed : true
            };
        },
        
        setInitSpriteValue : function () {
            var aItems = this.getModel("wall").getProperty("/Items");
            Helper.initSpriteValue = 0;
            aItems.forEach(function(oItem) {
                if(oItem.WALL_ITEM_TYPE_CODE === "sap.ino.config.SPRITE") {
                    var sTitle = oItem.CONTENT.TEXT;
                    if (/^[a-z]$/.test(sTitle)) { // one lowercase letter
                        // set count to current lowercase letter
                        Helper.initSpriteValue = Math.max(sTitle.charCodeAt(0) - 97 + 1, Helper.initSpriteValue);
                    }   
                }
            });
        },
        
        getNextInitSpriteValue : function () {
            var iValue = Helper.initSpriteValue;
            Helper.initSpriteValue++;
            return String.fromCharCode(97 + (iValue % 26));
        },
        
        getRandomFactor : function() {
            return (Math.random() - 0.5) * 1000;   
        }
    }));
});