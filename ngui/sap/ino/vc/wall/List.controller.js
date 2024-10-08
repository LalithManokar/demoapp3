/*!
 * @copyright@
 */
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Item",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/models/object/Wall",
    "sap/ino/wall/Wall",
    "sap/ino/vc/wall/util/WallFactory",
    "sap/ino/commons/models/core/ModelSynchronizer",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/m/MessageToast"
], function(BaseController,
    Device,
    JSONModel,
    Sorter,
    Item,
    Configuration,
    CodeModel,
    ViewType,
    Filter,
    FilterOperator,
    ObjectListFormatter,
    WallModel,
    Wall,
    WallFactory,
    ModelSynchronizer,
    TopLevelPageFacet,
    MessageToast) {
    "use strict";
    
    var mOrder = {
        ASC: "ASC",
        DESC: "DESC"
    };

    var mSort = {
        CHANGED_AT: "CHANGED_AT",
        NAME: "NAME",
        SCORE: "SCORE",
        SEARCH_SCORE: "SEARCH_SCORE"
    };

    var mVariant = {
        MY: "my",
        SHARED: "shared",
        MY_TEMPLATES: "templates",
        SHARED_TEMPLATES: "sharedtemplates"
    };

    var mFilter = {
        NONE: "myWalls",
        MY: "myWalls",
        SHARED: "sharedWalls",
        MY_TEMPLATES: "myWallTemplates",
        SHARED_TEMPLATES: "sharedWallTemplates"
    };

    var mListContext = {
        WALL : "walllist",
        WALL_VARIANT : "walllistvariant"
    };
    
    var mList = {
        ADJUSTMENT_TITLE: "IDEA_LIST_TIT_ADJUSTMENT",
        NAME:"WALL_LIST_MIT_NAME",
        Sorter: {
            Values: [{
                TEXT: "SORT_MIT_CHANGED",
                ACTION: mSort.CHANGED_AT,
                DEFAULT_ORDER: mOrder.DESC
            }, {
                TEXT: "SORT_MIT_TITLE",
                ACTION: mSort.NAME,
                DEFAULT_ORDER: mOrder.ASC
            }]
        },
        Order: {
		    Values: [{
		        TEXT: "ORDER_MIT_ASC",
		        ACTION: mOrder.ASC
		    }, {
		        TEXT: "ORDER_MIT_DESC",
		        ACTION: mOrder.DESC
		    }]
		},
        Variants: {
            DEFAULT_VARIANT: mVariant.MY,
            Values: [{
                TEXT: "WALL_LIST_MIT_MY",
                ACTION: mVariant.MY,
                FILTER: mFilter.MY,
                DEFAULT_SORT: mSort.CHANGED_AT
            }, {
                TEXT: "WALL_LIST_MIT_SHARED",
                ACTION: mVariant.SHARED,
                FILTER: mFilter.SHARED,
                DEFAULT_SORT: mSort.NAME,
                HIERARCHY_LEVEL : "1"
            }, {
                TEXT: "WALL_LIST_MIT_MY_TEMPLATES",
                ACTION: mVariant.MY_TEMPLATES,
                FILTER: mFilter.MY_TEMPLATES,
                DEFAULT_SORT: mSort.CHANGED_AT,
                HIERARCHY_LEVEL : "1"
            }, {
                TEXT: "WALL_LIST_MIT_SHARED_TEMPLATES",
                ACTION: mVariant.SHARED_TEMPLATES,
                FILTER: mFilter.SHARED_TEMPLATES,
                DEFAULT_SORT: mSort.NAME,
                HIERARCHY_LEVEL : "1"
            }]
        },
        Picker: {
            Variants: {
                Values: [{
                    TEXT: "WALL_LIST_MIT_MY_TEMPLATES",
                    ACTION: mVariant.MY_TEMPLATES,
                    FILTER: mFilter.MY_TEMPLATES,
                    DEFAULT_SORT: mSort.CHANGED_AT
                }, {
                    TEXT: "WALL_LIST_MIT_SHARED_TEMPLATES",
                    ACTION: mVariant.SHARED_TEMPLATES,
                    FILTER: mFilter.SHARED_TEMPLATES,
                    DEFAULT_SORT: mSort.NAME
                }]
            }
        }
    };

    var oWallList = BaseController.extend("sap.ino.vc.wall.List", jQuery.extend({}, TopLevelPageFacet, {
        /* Controller reacts when these routes match */
        routes: ["walllist", "walllistvariant"],

        /* ListModel defining filter, sorter and variants of the list */
        list: mList,
        
        initialFocus : "filterButton",

        /* ViewModel storing the current configuration of the list */
        view: {
            "List": {
                "SORT": mSort.CHANGED_AT,
                "ORDER": undefined,
                "VARIANT": mVariant.MY,
                "Default": {
                    "SORT": mSort.CHANGED_AT,
                    "ORDER": undefined,
                    "VARIANT": mVariant.MY
                },
                "MANAGE" : true // removes the list orientation button
            },
            "Picker": {
                "VARIANT": undefined // mVariant.MY_TEMPLATES will be set later
            },
            "ENABLE_CREATE": true
        },

        formatter: ObjectListFormatter,
        objectListFormatter: ObjectListFormatter,

        onInit: function() {
            this.getList().addStyleClass("sapInoWallListPreviewItems");
            
            BaseController.prototype.onInit.apply(this, arguments);
            var oViewModel = this.getModel("view");
            oViewModel.setData(this.view, true);
            
            //TODO where is this handle detached?
            this.getList().attachUpdateFinished(this.onUpdateFinished, this);
        },

        //TODO remove toplevelpagefacet, implement show function w/ signature to 1: route 2: query
        onRouteMatched: function(oEvent, oObject) {
            var sVariant;
            var oQuery;
            
            if (oEvent && oEvent.getParameter) {
                var oArguments = oEvent.getParameter("arguments");    
                this._sRoute = oEvent.getParameter("name");
                oQuery = oArguments["?query"];
                sVariant = oArguments.variant;
            }
            else {
                this._sRoute = oEvent;
                oQuery = oObject;
                sVariant = oObject.variant;
            }
            //TODO prevent the navigation to this view/controller on mobile => generic solution in router / component
            // if (!Device.system.desktop) {
            //     this.navigateTo("notFound", undefined, true);
            // }
            
            var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");

            var aSorter;
            var sVariantFilter;
            var oVariant = this.getVariant(sVariant);

            var bBound = this.getList().isBound("items");
            
            // even if there is no query defined, we need to add the default sorter that is applied
            if (!oQuery  || !oQuery.sort) {
                var sDefaultSort = this.getViewProperty("/List/Default/SORT");
                var sDefaultOrder = this.getSort(sDefaultSort)[0].DEFAULT_ORDER;

                oQuery = oQuery || {};

				oQuery.sort = oQuery.sort || sDefaultSort;
				
				// enhance for sort combination
				oQuery.sort = oQuery.sort + " " + (oQuery.order || sDefaultOrder);
            }

            var bRebindRequired = this.hasStateChanged(this._sRoute, sVariant, oQuery);

            if (!bBound || bRebindRequired) {
                oVariant = oVariant || this.getVariant(sDefaultVariant);
                this.setParameters(oQuery, oVariant);
                
                /* -- Do not show the filterbar automatically but let the user change it -- */

                aSorter = this.getSort(this.getViewProperty("/List/SORT"));
                this.setSorter(aSorter);

                this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));

                this.bindList();
                this.initialSorterItems();
                
                var oBinding = this.getList().getBinding("items");
                if (oBinding) {
                    //TODO where is this handle detached?
                    oBinding.attachDataReceived(this.onListDataReceived, this);
                }
            }
            
            var oListBinding = this.getList().getBinding("items");
            if (oListBinding) {
                //TODO where is this handle detached?
                oListBinding.attachChange(this.onListBindingChange, this);
            }

            /* used to prevent opening and closing the filter while changing the variant, etc. */
            this._bInnerViewNavigation = true;

            this.setHelp("WALL_LIST");
        },
        
        onRefresh : function() {
            BaseController.prototype.onRefresh.apply(this, arguments);
            var oBinding = this.getList().getBinding("items");
            //TODO where is this handle detached?
            oBinding.attachDataReceived(this.onListDataReceived, this);
        },
        
        getList : function() {
            return this.byId("objectlist");
        },
        
        onListBindingChange: function(){
            var aItems = this.getList().getAggregation("items");
            var that = this;
            if (aItems && aItems.length > 0) {
                var aWallIds = [];
                var aListItems = [];
                jQuery.each(aItems, function(iIndex, oItem) {
                    var oWallPreviewControl = oItem.getAggregation("content") && oItem.getAggregation("content")[1];
                    if (oWallPreviewControl) {
                        var oBoundObject = oWallPreviewControl.getBindingContext("data") && oWallPreviewControl.getBindingContext("data").getObject();
                        if (oBoundObject) {
                            var vKey = oBoundObject.ID;
                            if(that._oPreview2Wall && !oWallPreviewControl.getWallControl()) {
                                oWallPreviewControl.setWall(that._oPreview2Wall[vKey]);
                            }
                            var bRerenderRequired = false;
                            if (oWallPreviewControl.getWallControl() && oWallPreviewControl.getWallControl().getTitle() !== oBoundObject.NAME) {
                                oWallPreviewControl.getWallControl().setTitle(oBoundObject.NAME);
                                bRerenderRequired = true;
                            }
                            if (oWallPreviewControl.getWallControl() && !oWallPreviewControl.getWallControl().getBackgroundColor() && 
                                oWallPreviewControl.getWallControl().getBackgroundImage() !== oBoundObject.BACKGROUND_IMAGE_URL) {
                                oWallPreviewControl.getWallControl().setBackgroundImage(oBoundObject.BACKGROUND_IMAGE_URL);
                                bRerenderRequired = true;
                            }
                            if (oWallPreviewControl.getWallControl() && !oWallPreviewControl.getWallControl().getBackgroundImage() && 
                                oWallPreviewControl.getWallControl().getBackgroundColor() !== oBoundObject.BACKGROUND_COLOR) {
                                oWallPreviewControl.getWallControl().setBackgroundColor(oBoundObject.BACKGROUND_COLOR);
                                bRerenderRequired = true;
                            }
                            if (bRerenderRequired) {
                                aWallIds.push(vKey);
                                aListItems.push(oItem);
                                oWallPreviewControl.invalidate();
                            }
                            var aWallModels = ModelSynchronizer.getApplicationObject(WallModel.getMetadata()._sClassName, vKey);
                            if (aWallModels && aWallModels.length > 0) {
                                aWallIds.push(vKey);
                                aListItems.push(oItem);
                            }
                        }
                    }
                });
                this.addWallItems(aWallIds, aListItems);
            }
        },

        getItemTemplate: function() {
            return this.getFragment("sap.ino.vc.wall.fragments.WallListItem");
        },

        setParameters: function(oQuery, oVariant) {
            oQuery = oQuery || {};

            var oSorter = this.getSort(oVariant.DEFAULT_SORT);

            var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
            var sOrder = this.checkOrder(oQuery, oSorter.DEFAULT_ORDER);

            this.setViewProperty("/List/VARIANT", oVariant.ACTION);
            this.setViewProperty("/List/SORT", sSort);
            this.setViewProperty("/List/ORDER", sOrder);
            this.setViewProperty("/List/SEARCH", oQuery.search);
        },

        getQuery: function() {
            var oQuery = {};

            var sSort = this.getViewProperty("/List/SORT");
            var sOrder = this.getViewProperty("/List/ORDER");
            var sSearchTerm = this.getViewProperty("/List/SEARCH");

            if (sSort) {
                oQuery.sort = sSort;
                if (sOrder) {
                    oQuery.order = sOrder;
                }
            }
            if (sSearchTerm) {
                oQuery.search = sSearchTerm;
            }

            return oQuery;
        },

        bindList: function() {
            var sVariantFilter = this.getCurrentVariant().FILTER;
            var sSearchTerm = this.getViewProperty("/List/SEARCH");
            
            this.saveState();

            if (!sSearchTerm && sVariantFilter === "myWalls") {
                this.setPath("data>/MyWalls");
            } else if (sSearchTerm || sVariantFilter) {
                this.setPath("data>/WallSearchParams(searchToken='" + (sSearchTerm || "") + "'," +
                    "filterName='" + (sVariantFilter || "") + "')/Results");
            } else {
                this.setPath("data>/Wall");
            }            

            BaseController.prototype.bindList.apply(this, arguments);
        },

        onListDataReceived : function(oEvent) {
            var aListItems = this.getList().getItems();
            var aData = oEvent.getParameter("data").results;
            var aWallIds = [];
            var that = this;
            // stores a link between a wall preview and a wall control needed later
            // when the binding change event comes
            this._oPreview2Wall = this._oPreview2Wall || {};
            aListItems.forEach(function(oItem) {
                var oWallPreview = oItem.getAggregation("content")[1];
                var iId = oWallPreview.getBindingContext("data").getProperty("ID");
                var aWallData = aData.filter(function( oData ) {
                    return oData.ID === iId;
                });
                if (!oWallPreview.getWallControl()) {
                    if (aWallData && aWallData.length > 0) {
                        aWallIds.push(iId);
                        
                        var oWall = WallFactory.createWallFromInoJSON(aWallData[0]);
                        if (aWallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID) {
                            //TODO why are we doing this here?
                            oWall.setBackgroundImage(Configuration.getAttachmentDownloadURL(aWallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID));
                        }
                        // establish a link between a preview and a wall control through Wall IDs
                        that._oPreview2Wall[iId] = oWall;
                        oWallPreview.setWall(oWall);
                        oWallPreview.invalidate();
                    }
                } else if (oWallPreview.getWallControl().getItems().length === 0) {
                    if (aWallData && aWallData.length > 0) {
                        aWallIds.push(iId);
                    }
                }
            });
            
            if (aWallIds && aWallIds.length > 0) {
                this.addWallItems(aWallIds, aListItems);
            }
        },
        
        addWallItems: function(aWallIds, aListItems) {
            if (aWallIds.length === 0) {
                return;
            }
            WallModel.readItems(aWallIds).done(function(aJSON) {
                if (jQuery.isArray(aJSON)) {
                    var oWallItems = {};
                    aJSON.forEach(function(oData) {
                        if (!oWallItems[oData.WALL_ID]) {
                            oWallItems[oData.WALL_ID] = [];
                        }
                        oWallItems[oData.WALL_ID].push(oData);
                    });
                    aListItems.forEach(function(oItem) {
                        if (oItem && oItem.getAggregation("content")) {                            
                            var oWallPreview = oItem.getAggregation("content")[1];
                            var aWallItem = oWallItems[oWallPreview.getBindingContext("data").getProperty("ID")];
                            if (aWallItem && aWallItem.length > 0) {
                                var oWall = oWallPreview.getWallControl();
                                var aExistingItems = oWall && oWall.getItems();
                                if (aExistingItems && aExistingItems.length > 0) {
                                    jQuery.each(aExistingItems, function(iIndex, oExistingItem) {
                                        oWall.removeItemWithoutRendering(oExistingItem);
                                    });
                                }
                                var aItemJSON = WallFactory.createWallItemsFromInoJSON(aWallItem);
                                var aItems = [];
    
                                aItemJSON.forEach(function(oData) {
                                    aItems.push(Wall.createWallItemFromJSON(oData));
                                });
                                if (aItems && aItems.length > 0) {
                                    var iLength = aItems.length;
                                    for (var ii = 0; ii < iLength; ii++) {
                                        oWall.addItemWithoutRendering(aItems[ii]);
                                    }
                                    oWallPreview.setNumberOfItems(iLength);
                                    oWallPreview.invalidate();
                                }
                            }
                        }
                    });
                }
            });
        },
        
        onItemPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext("data");
            if (oContext) {
                this._navToWall(oContext.getProperty("ID"));
            }
        },

        onVariantBasePress : function(oEvent) {
            if (!this._getWallPickerDialog().isActive()) {
                return BaseController.prototype.onVariantBasePress.apply(this, arguments);
            } else {
                var oItem = oEvent.getSource();
                if (oItem.getSelectedItem && oItem.getSelectedItem()) {
                    oItem = oItem.getSelectedItem();
                }
                var oContext = oItem.getBindingContext("list");
                var sAction;
                var oObject;
                if (oContext) {
                    oObject = oContext.getObject();    
                    sAction = oObject ? oObject.ACTION : undefined;
                }
                this.onVariantPress(sAction, oEvent);    
            }
        },
        
        onVariantPress: function(sVariantAction, oEvent) {
            var oQuery = this.getQuery();
            if (!this._getWallPickerDialog().isActive()) {
                if (sVariantAction) {
                    this.navigateTo("walllistvariant", {
                        variant: sVariantAction,
                        query: oQuery
                    }, undefined, true);
                } else {
                    this.navigateTo("walllist", {
                        query: oQuery
                    }, undefined, true);
                }
            } else {
                this.setViewProperty("/Picker/VARIANT", sVariantAction);
                var oWallPickerView = this._getWallPickerView();
                if (oWallPickerView) {
                    oWallPickerView.getController().setViewProperty("/List/VARIANT", sVariantAction);
                    oWallPickerView.invalidate();
                }
            }
        },
        
        onCreateObject: function(oEvent) {
            var oController = this;
            var oButton = oEvent.getSource();
            var oVariant = this.getVariant(this.getModel("view").getProperty("/List/VARIANT"));
            switch(oVariant.ACTION) {
            case "my":
                
                if (!this._addWallMenu) {
				    this._addWallMenu = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.WallListAddMenu", this);
				    this.getView().addDependent(this._addWallMenu);
			    }
    			this._addWallMenu.openBy(oButton);
                break;
            case "templates":
                WallModel.create({
                    ID : -1,
                    NAME : oController.getText("WALL_BUT_CREATE_WALL_NAME"),
                    WALL_TYPE_CODE : "sap.ino.config.TEMPLATE",
                    BACKGROUND_IMAGE_REPEAT: 0,
                    BACKGROUND_IMAGE_URL: "cork.jpg",
                    BACKGROUND_IMAGE_ZOOM: 0
                }).done(function(oRequest) {
                    oController._navToWall(oRequest.GENERATED_IDS[-1]);
                });
                break;
            default:
                    MessageToast.show("Not yet implemented for\n" + this.getText(oVariant.TEXT));
            }
        },
        
        onCreateWall: function() {
            var oController = this;
            WallModel.create({
                ID : -1,
                NAME : oController.getText("WALL_BUT_CREATE_WALL_NAME"),
                WALL_TYPE_CODE : "sap.ino.config.WALL",
                BACKGROUND_IMAGE_REPEAT: 0,
                BACKGROUND_IMAGE_URL: "cork.jpg",
                BACKGROUND_IMAGE_ZOOM: 0
            }).done(function(oRequest) {
                oController._navToWall(oRequest.GENERATED_IDS[-1]);
            });
        },
        
        onCreateWallFromTemplate: function() {
            this._getWallPickerDialog().open();

            var sDefaultVariantAction = mVariant.MY_TEMPLATES;
            this.setViewProperty("/Picker/VARIANT", sDefaultVariantAction);
            var oWallPickerView = this._getWallPickerView();
            if (oWallPickerView) {
                var bVariantChanged = oWallPickerView.getController().setDefaultVariant();
                if (bVariantChanged) {
                    oWallPickerView.invalidate();
                }
            }
        },
        
        onCreateWallCancel: function() {
            this._getWallPickerDialog().close();
        },
        
        onWallPickerAfterClose: function() {
            this.byId("createObject").focus();
        },
        
        getVariantsPopover : function() {
            if (!this._getWallPickerDialog().isActive()) {
                return BaseController.prototype.getVariantsPopover.apply(this, arguments);
            } else {
                if (!this._oPickerVariantPopover) {
                    this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                    // if (Device.system.phone) {
                    //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariantsDialog", this);
                    // } else {
                    //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                    // }
                    this.getView().addDependent(this._oPickerVariantPopover);
                }
                return this._oPickerVariantPopover;
            }
        },

        getVariant : function(sAction) {
            if (!this._getWallPickerDialog().isActive()) {
               return BaseController.prototype.getVariant.apply(this, arguments);
            } else {
               return this._getListDefinitionEntry(sAction, "ACTION", "/Picker/Variants/Values");
            }
        },
        
        onWallPickerCancel : function() {
            this._getWallPickerDialog().close();
        },
        
        _getWallPickerDialog : function () {
            if (!this._oWallPickerDialog) {
                this._oWallPickerDialog = this.createFragment("sap.ino.vc.wall.fragments.TemplatePickerDialog", this.createId("wallpicker"));
                this.getView().addDependent(this._oWallPickerDialog);
                var oWallPickerView = this._oWallPickerDialog.getContent() && this._oWallPickerDialog.getContent()[0];
                if (oWallPickerView) {
                    oWallPickerView.getController().delegates.SYNC_VIEW_CONTROLLER = this;
                    if (!Device.system.phone) {
                        oWallPickerView.addStyleClass("sapUiSmallMargin");
                    }
                }
            }
            return this._oWallPickerDialog;
        },
        
        _getWallPickerView : function () {
            return this._getWallPickerDialog().getContent() && this._getWallPickerDialog().getContent()[0];
        },
        
        _navToWall : function (iId) {
	        this.navigateToWall("wall", {
	            id: iId
	        });
        }
    }));
    
    /* ListModel defining filter, sorter and variants of the list */
    oWallList.list = mList;
    oWallList.listContext = mListContext;
    
    return oWallList;
});