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
    "sap/ino/vc/wall/WallMixin"
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
    WallMixin) {
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
        SHARED: "sharedWalls"
    };

    return BaseController.extend("sap.ino.vc.wall.WallPicker", jQuery.extend({},WallMixin, {
        /* Controller reacts when these routes match */
        routes: [],

        /* ListModel defining filter, sorter and variants of the list */
        list: {
            "ADJUSTMENT_TITLE": "IDEA_LIST_TIT_ADJUSTMENT",
            "Sorter": {
                "Values": [{
                    "TEXT": "SORT_MIT_CHANGED",
                    "ACTION": mSort.CHANGED_AT,
                    "DEFAULT_ORDER": mOrder.DESC
                }, {
                    "TEXT": "SORT_MIT_TITLE",
                    "ACTION": mSort.NAME,
                    "DEFAULT_ORDER": mOrder.ASC
                }]
            },
            "Variants": {
                "DEFAULT_VARIANT": mVariant.MY,
                "Values": [{
                    "TEXT": "WALL_LIST_MIT_MY",
                    "ACTION": mVariant.MY,
                    "FILTER": mFilter.MY,
                    "DEFAULT_SORT": mSort.CHANGED_AT
                }, {
                    "TEXT": "WALL_LIST_MIT_SHARED",
                    "ACTION": mVariant.SHARED,
                    "FILTER": mFilter.SHARED,
                    "DEFAULT_SORT": mSort.NAME
                }]
            }
        },

        /* ViewModel storing the current configuration of the list */
        view: {
            "List": {
                "SORT": mSort.CHANGED_AT,
                "ORDER": undefined,
                "VARIANT": mVariant.MY,
                "SEARCH": undefined,
                "Default": {
                    "SORT": mSort.CHANGED_AT,
                    "ORDER": undefined,
                    "VARIANT": mVariant.MY
                }
            },
            "HIDE_HEADER_BUTTONS": false,
            "EDITABLE": false
        },
        
        delegates: {
            SYNC_VIEW_CONTROLLER : undefined  // will be called after picking a new wall
        },

        formatter: ObjectListFormatter,
        
        onInit: function() {
            this.getList().addStyleClass("sapInoWallListPreviewItems");
            
            BaseController.prototype.onInit.apply(this, arguments);

            var oViewModel = this.getModel("view");
            oViewModel.setData(this.view, true);
            
            var oQuery = {
                sort: "CHANGED_AT",
                order: "DESC"
            };
            var oSorter = {
                ACTION: "CHANGED_AT",
                DEFAULT_ORDER: "DESC",
                TEXT: "SORT_MIT_CHANGED"
            };
            var oVariant = this.getVariant("my");
            this.setParameters(oQuery, oVariant);
            this.setSorter(new Sorter(oSorter.ACTION, true));

            if (!this._oSearchField) {
                this._oSearchField = this.byId("searchFieldPicker");
            }

        },
        
        onBeforeRendering: function() {
            this._sRoute = "walllistvariant";
            this.bindListFromProperties();
            this._bInnerViewNavigation = true;
        },

        getList : function() {
            return this.byId("walllistpicker");
        },
        
        createTemplate: function() {
            return this.createFragment("sap.ino.vc.wall.fragments.WallListItem");
        },


        setParameters: function(oQuery, oVariant) {

            oQuery = oQuery || {};

            var aSorter = this.getSort(oVariant.DEFAULT_SORT);

            var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
            var sOrder = this.checkOrder(oQuery, aSorter[0].DEFAULT_ORDER);
            var aTags = this.checkTags(oQuery.tags);

            this.setViewProperty("/List/VARIANT", oVariant.ACTION);
            this.setViewProperty("/List/SORT", sSort);
            this.setViewProperty("/List/ORDER", sOrder);
            this.setViewProperty("/List/SEARCH", oQuery.search);
            this.setViewProperty("/List/TAGS", aTags);
            this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);

        },

        getQuery: function() {
            var oQuery = {};

            var sSort = this.getViewProperty("/List/SORT");
            var sOrder = this.getViewProperty("/List/ORDER");
            var sSearchTerm = this.getViewProperty("/List/SEARCH");
            var aTags = this.getViewProperty("/List/TAGS");

            if (sSort) {
                oQuery.sort = sSort;
                if (sOrder) {
                    oQuery.order = sOrder;
                }
            }
            if (sSearchTerm) {
                oQuery.search = sSearchTerm;
            }
            
            if (aTags && aTags.length > 0) {
                oQuery.tags = JSON.stringify(aTags);
            }

            return oQuery;
        },
        
        getItemTemplate: function() {
            return this.getFragment("sap.ino.vc.wall.fragments.WallListItem");
        },

        bindListFromProperties: function() {
            var sVariant = this.getViewProperty("/List/VARIANT") || this.getModel("list").getProperty("/Variants/DEFAULT_VARIANT") || "my";
            var oVariant = this.getVariant(sVariant);
            var sSearchTerm = this.getViewProperty("/List/SEARCH");
            var aSorter = this.getSort(this.getViewProperty("/List/SORT"));
            //this.setSorter(new Sorter(oSorter.ACTION, this.getViewProperty("/List/ORDER") === mOrder.DESC));
            this.setSorter(aSorter);
            this.bindList(sSearchTerm, oVariant.FILTER);
        },

        bindList: function(sSearchTerm, sVariantFilter) {
            sVariantFilter = sVariantFilter || "myWalls";
            var sPath = "data>/WallSearchParams(" +
                "searchToken='" + (sSearchTerm || "") + "'," +
                "filterName='" + (sVariantFilter || "") + "')/Results";
            this.setPath(sPath);
            BaseController.prototype.bindList.apply(this, arguments);

            var oBinding = this.getList().getBinding("items");
            oBinding.attachDataReceived(this.onListDataReceived, this);
        },

        onListDataReceived : function(oEvent) {
            var aListItems = this.getList().getItems();
            var aData = oEvent.getParameter("data").results;
            var aWallIds = [];
            
            aListItems.forEach(function(oItem) {
                var oWallPreview = oItem.getAggregation("content")[1];
                var iId = oWallPreview.getBindingContext("data").getProperty("ID");
                var aWallData = aData.filter(function( oData ) {
                    return oData.ID === iId;
                });
                
                if (aWallData && aWallData.length > 0) {
                    var oWall = WallFactory.createWallFromInoJSON(aWallData[0]);
                    
                    aWallIds.push(iId);
                    if (aWallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID) {
                        //TODO why are we doing this here?
                        oWall.setBackgroundImage(Configuration.getAttachmentDownloadURL(aWallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID));
                    }
                    
                    oWallPreview.setWall(oWall);
                    oWallPreview.invalidate();
                }
            });
            
            if (aWallIds && aWallIds.length > 0) {
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
                            var oWallPreview = oItem.getAggregation("content")[1];
                            var aWallItem = oWallItems[oWallPreview.getBindingContext("data").getProperty("ID")];
                            if (aWallItem && aWallItem.length > 0) {
                                var oWall = oWallPreview.getWallControl();
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
                        });
                    }
                });
            }
        },

        // this is a callback function, do not rename
        onItemPress: function(oEvent) {
            if (!(oEvent.getSource() instanceof sap.m.ListItemBase)) {
                return;
            }
            
            var oContext = oEvent.getSource().getBindingContext("data");
            var oIdea = this.getModel("object");
            
            if (oIdea && oContext) {
                var oWallPreview = oEvent.getSource().getAggregation("content")[1];
                var oWall = oWallPreview.getWallControl();
                var oWallData = WallFactory.createInoJSONFromWall(oWall);
                // oWallData.WALL_ID = oContext.getProperty("ID");
                oWallData.WALL_ID = oWallData.ID;
                oWallData.CREATED_BY_NAME = oContext.getProperty("CREATED_BY_NAME");
                oWallData.VIEW_COUNT = oContext.getProperty("VIEW_COUNT");
                this.delegates.SYNC_VIEW_CONTROLLER._wallMixinSetting.wallAddAction(oIdea, oWallData);
                if (this.delegates.SYNC_VIEW_CONTROLLER && jQuery.isFunction(this.delegates.SYNC_VIEW_CONTROLLER.onWallPicked)) {
                    this.delegates.SYNC_VIEW_CONTROLLER.onWallPicked(oWallData);
                }
            }
            var oParentDialog = this.getView().getParent();
            if (oParentDialog) {
                oParentDialog.close();
            }
        },

        // this is a callback function, do not rename
        setDefaultVariant: function() {
            var bVariantChanged = false;
            var sDefaultVariant = this.getModel("list").getProperty("/Variants/DEFAULT_VARIANT") || "my";
            if (this.getViewProperty("/List/VARIANT") !== sDefaultVariant) {
                this.setViewProperty("/List/VARIANT", sDefaultVariant);
                bVariantChanged = true;
            }
            return bVariantChanged;
        },
        
        onWallRemove: function(oEvent) {
            // dummy implementation to satisfy event handler definition <WallPreview remove=".onWallRemove"> in the re-usable fragment
        },
        
        onSorterChange: function(oEvent) {
		    var oSource = oEvent.getSource().getSelectedItem();
		    this.setViewProperty("/List/SORT", oSource.getBindingContext("list").getObject().ACTION);
            this.bindListFromProperties();
        },

        onSortReverse: function(oEvent) {
            var sOrder = this.getViewProperty("/List/ORDER");
            this.setViewProperty("/List/ORDER", (sOrder === mOrder.ASC) ? mOrder.DESC : mOrder.ASC);
            this.bindListFromProperties();
        },

        onSearchPicker: function(oEvent) {
            var sSearchTerm = this._oSearchField && this._oSearchField.getValue();
            this.setViewProperty("/List/SEARCH", sSearchTerm);
            this.bindListFromProperties();
     }

    }));
});