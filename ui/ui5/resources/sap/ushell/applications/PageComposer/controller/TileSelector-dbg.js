// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

/**
 * @fileoverview Provides functionality for "sap/ushell/applications/PageComposer/view/TileSelector.fragment.xml"
 */
sap.ui.define([
    "sap/m/library",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/ResponsivePopover",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ushell/applications/PageComposer/i18n/resources",
    "sap/ushell/services/Container" // required for "sap.ushell.Container.getServiceAsync()"
], function (
    mobileLibrary,
    Button,
    List,
    StandardListItem,
    ResponsivePopover,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    resources
    // Container
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.m.ListMode
    var ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListSeparators
    var ListSeparators = mobileLibrary.ListSeparators;

    /**
     * TileSelector constructor
     *
     * @constructor
     *
     * @protected
     */
    return function () {
        var oParentView,
            oTree,
            oToolbar,
            oAddSelectedTilesButton,
            oAddSingleTileData,
            oGroupList,
            oGroupSelectionPopover,
            fnAddTileHandler,
            bSortAscending,
            oTargetResults = {},
            mCatalogTiles = {};

        /**
         * Initializes the TileSelector, must be called before usage.
         *
         * @param {sap.ui.core.mvc.Controller} oController A reference to the controller it is going to be used on.
         *
         * @private
         */
        this.init = function (oController) {
            oParentView = oController.getView();
            oTree = oParentView.byId("tileSelectorList");
            oToolbar = oParentView.byId("tileSelectorToolbar");
            oAddSelectedTilesButton = oParentView.byId("tileSelectorAddButton");

            oTree.setBusy(true);

            oGroupList = new List({
                mode: ListMode.MultiSelect,
                showSeparators: ListSeparators.None,
                includeItemInSelection: true,
                selectionChange: function () { oGroupSelectionPopover.getBeginButton().setEnabled(!!oGroupList.getSelectedItem()); },
                items: {
                    path: "/page/content/sections",
                    template: new StandardListItem({ title: "{title}" })
                },
                noDataText: resources.i18n.getText("Message.NoGroups")
            }).setModel(oParentView.getModel());

            oAddSelectedTilesButton.setEnabled(false);
            oTree.attachSelectionChange(this._onSelectionChange);
        };

        /**
         * Consumes catalog data and builds the catalog tree, replacing the model with it.
         *
         * @param {object} oCatalogData The catalog object
         * @param {object[]} [oCatalogData.aTreeOverride] If present, other properties are ignored and this property is used as the catalog tree
         * instead of building one using the other properties.
         * @param {string[]} oCatalogData.catalogTitles An array of catalog titles
         * @param {string[][]} oCatalogData.catalogTiles An array of arrays of tiles (one array of tiles for each catalog)
         * @param {string[]} oCatalogData.mCatalogTiles A map of "vizId"s to tiles
         *
         * @private
         */
        this.initTiles = function (oCatalogData) {
            if (oCatalogData.aTreeOverride) {
                _setCatalogTree(oCatalogData.aTreeOverride);
                return;
            }
            sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                mCatalogTiles = oCatalogData.mCatalogTiles;
                var aCatalogTree = oCatalogData.catalogTiles.reduce(function (tree, tiles, i) {
                    if (tiles.length) {
                        tree.push({
                            catalogTitle: oCatalogData.catalogTitles[i],
                            tiles: tiles.map(function (tile) {
                                return {
                                    vizId: oLaunchPageService.getCatalogTileId(tile),
                                    title: oLaunchPageService.getCatalogTilePreviewTitle(tile) || oLaunchPageService.getCatalogTileTitle(tile),
                                    subtitle: oLaunchPageService.getCatalogTilePreviewSubtitle(tile),
                                    icon: oLaunchPageService.getCatalogTilePreviewIcon(tile)
                                };
                            }).sort(function (a, b) { // sorts tiles by title in ascending lexicographical order
                                if (a.title > b.title) { return 1; }
                                if (a.title < b.title) { return -1; }
                                return 0;
                            })
                        });
                    }
                    return tree;
                }, []);
                _setCatalogTree(aCatalogTree);
            });
        };

        /**
         * Intended to be called by the view (e.g. a SearchField) for handling tile search events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onSearchTiles = function (/*oEvent*/) {
            searchForTiles();
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling add tile events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onAddTiles = function (oEvent) {
            var aGroupListItems = oGroupList.getItems(),
                oBindingContext = oEvent.getSource().getBindingContext("catalogs");
            oAddSingleTileData = oBindingContext ? oBindingContext.getProperty() : null;
            if (aGroupListItems.length === 1) { // skip asking to which group(s) if there is only one group
                aGroupListItems[0].setSelected(true);
                _addTiles();
            } else {
                _openGroupSelectionPopover(oEvent);
            }
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling sort catalogs toggle events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onSortCatalogsToggle = function (/*oEvent*/) {
            sortCatalogsToggle();
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling collapse all catalogs events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onCollapseAllCatalogs = function (/*oEvent*/) {
            collapseAllCatalogs(true);
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling expand all catalogs events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onExpandAllCatalogs = function (/*oEvent*/) {
            collapseAllCatalogs(false);
        };

        /**
         * Intended to be called by the view (e.g. a Tree) for handling catalog item press events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onCatalogItemPress = function (oEvent) {
            _toggleCollapseTreeItem(oEvent.getParameters().listItem);
        };

        /**
         * Intended to be called by the view (e.g. a Tree) for handling selection change events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this._onSelectionChange = function (oEvent) {
            if (oGroupSelectionPopover && oGroupSelectionPopover.isOpen()) {
                oGroupSelectionPopover.getBeginButton().setEnabled(false);
                oGroupSelectionPopover.close();
            }
            oEvent.getParameters().listItems.forEach(function (item) {
                if (item.getBindingContext("catalogs").getProperty().tiles) { // catalog (root item)
                    item.setSelected(false); // currently, catalogs should not be selectable
                    _toggleCollapseTreeItem(item); // instead, allow toggling collapse with space bar
                }
            });
            oAddSelectedTilesButton.setEnabled(!!_getSelectedTreeItemsData().length);
        };

        /**
         * Sets a callback function for the add tiles event.
         *
         * @param {function} newAddTileHandler The callback function to be called when adding tiles.
         *   This function receives two arguments in the following order:
         *     1. A tile object.
         *     2. An array of group indices.
         *
         * @private
         */
        this.setAddTileHandler = function (newAddTileHandler) {
            fnAddTileHandler = newAddTileHandler;
        };

        /**
         * Called when starting to drag a tile.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onDragStart = function (oEvent) {
            var oItemData = oEvent.getParameter("target").getBindingContext("catalogs").getProperty();
            if (!oItemData.vizId) { // prevent dragging of items without vizId
                oEvent.preventDefault();
                return;
            }
            oEvent.getParameter("dragSession").setComplexData("callback", function callback (tileIndex, groupIndex) {
                Promise.all([
                    sap.ushell.Container.getServiceAsync("LaunchPage"),
                    sap.ushell.Container.getServiceAsync("NavTargetResolution")
                ]).then(function (aServices) {
                    _getInboundPermanentKey(oItemData.vizId, aServices[0], aServices[1]).then(function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, [groupIndex], tileIndex);
                    }, function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, [groupIndex], tileIndex);
                    });
                });
            });
        };

        /**
         * Sets (overwrites) the "catalogs" model with the provided tree.
         *
         * @param {object[]} aCatalogTree The catalog tree to set (overwrite) the "catalogs" model.
         *
         * @private
         */
        function _setCatalogTree (aCatalogTree) {
            var oModel = new JSONModel({ catalogs: aCatalogTree });
            oModel.setSizeLimit(Infinity); // allow more list bindings than the model default limit of 100 entries
            oParentView.setModel(oModel, "catalogs");
            bSortAscending = true;
            sortCatalogsToggle();
            oTree.expandToLevel(1);
            oTree.setBusy(false);
        }

        /**
         * Handler for searching tiles using the SearchField input.
         *
         * @private
         */
        function searchForTiles () {
            var sSearchText = oParentView.getModel().getProperty("/searchText") || "";
            oTree.getBinding("items").filter([
                new Filter([
                    new Filter("title", FilterOperator.Contains, sSearchText),
                    new Filter("subtitle", FilterOperator.Contains, sSearchText)
                ], false)
            ]);
        }

        /**
         * Toggles the sort order (ascending/descending) of the catalog tree, restricted to the first tree level (i.e. the catalog level).
         *
         * @private
         */
        function sortCatalogsToggle () {
            bSortAscending = !bSortAscending;
            var oItems = oTree.getBinding("items"),
                oSorterCatalog = new Sorter("catalogTitle", bSortAscending);
            oItems.sort(oSorterCatalog);
        }

        /**
         * Controls collapsing and expanding all catalogs.
         *
         * @param {boolean} bCollapse Whether it should collapse all catalogs instead of expanding all catalogs.
         *
         * @private
         */
        function collapseAllCatalogs (bCollapse) {
            if (bCollapse) {
                oTree.collapseAll();
            } else {
                oTree.expandToLevel(1);
            }
        }

        /**
         * Toggles the collapse state of a tree item between collapsed and expanded.
         *
         * @param {sap.m.TreeItemBase} oTreeItem The tree item to have its collapse state toggled.
         *
         * @private
         */
        function _toggleCollapseTreeItem (oTreeItem) {
            var iTreeItemIndex = oTree.indexOfItem(oTreeItem);
            if (oTreeItem.getExpanded()) {
                oTree.collapse(iTreeItemIndex);
            } else {
                oTree.expand(iTreeItemIndex);
            }
        }

        /**
         * Get the item data of every selected tree item.
         * This is needed because "getSelectedItems()" do not return selected items within collapsed parents.
         *
         * @returns {object[]} An array of selected tree item data.
         *
         * @private
         */
        function _getSelectedTreeItemsData () {
            return oTree.getSelectedContextPaths().map(function (sSelectedItemContextPath) {
                return oParentView.getModel("catalogs").getContext(sSelectedItemContextPath).getProperty();
            });
        }

        /**
         * Opens the add tiles popover, containing the group list for selection of the tiles target groups.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised the operation (e.g. a click on the "Add" button).
         *
         * @private
         */
        function _openGroupSelectionPopover (oEvent) {
            if (!oGroupSelectionPopover || oGroupSelectionPopover.bIsDestroyed) {
                _createGroupSelectionPopover();
            }
            oGroupList.removeSelections(true);
            oGroupSelectionPopover.getBeginButton().setEnabled(false);
            oGroupSelectionPopover.getEndButton().setEnabled(true);
            if (!oAddSingleTileData && _isOverflownInOverflowToolbar(oAddSelectedTilesButton)) {
                oGroupSelectionPopover.openBy(oToolbar.getAggregation("_overflowButton"));
            } else {
                oGroupSelectionPopover.openBy(oEvent.getSource());
            }
        }

        /**
         * Checks if a control is currently overflown inside of an OverflowToolbar.
         *
         * @param {sap.ui.core.Control} oControl The control to check.
         * @returns {boolean} Whether the control is or is not overflown inside of an OverflowToolbar.
         *
         * @private
         */
        function _isOverflownInOverflowToolbar (oControl) {
            return (oControl.hasStyleClass("sapMOTAPButtonNoIcon") || oControl.hasStyleClass("sapMOTAPButtonWithIcon"));
        }

        /**
         * Creates the group selection popover, used to select to which group(s) the tile(s) should go to.
         *
         * @private
         */
        function _createGroupSelectionPopover () {
            oGroupSelectionPopover = new ResponsivePopover({
                placement: PlacementType.Auto,
                title: resources.i18n.getText("Tooltip.AddToGroups"),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: resources.i18n.getText("Button.Add"),
                    press: function () { this.setEnabled(false); oGroupSelectionPopover.close(); _addTiles(); }
                }),
                endButton: new Button({
                    text: resources.i18n.getText("Button.Cancel"),
                    press: function () { this.setEnabled(false); oGroupSelectionPopover.close(); }
                }),
                content: oGroupList,
                initialFocus: oGroupList
            });
            oParentView.addDependent(oGroupSelectionPopover);
        }

        /**
         * Calculates the inboundPermanentKey for the given visualization id
         *
         * @param {string} sVizId the visualization id of a tile
         * @param {object} launchPageService the LaunchPage service
         * @param {object} navTargetResolutionService the NavTargetResolution service
         *
         * @returns {Promise<object>} the visualization id and the inboundPermanentKey
         *
         * @private
         */
        function _getInboundPermanentKey (sVizId, launchPageService, navTargetResolutionService) {
            var sTarget = launchPageService.getCatalogTileTargetURL(mCatalogTiles[sVizId]);
            if (sTarget && sTarget[0] === "#") {
                if (!oTargetResults[sTarget]) {
                    oTargetResults[sTarget] = navTargetResolutionService.resolveHashFragment(sTarget);
                }
                return Promise.resolve(oTargetResults[sTarget].then(
                    function (oResolutionResult) {
                        return {
                            vizId: sVizId,
                            inboundPermanentKey: oResolutionResult.inboundPermanentKey
                        };
                    }, function () {
                        return {
                            vizId: sVizId,
                            inboundPermanentKey: "",
                            error: "Resolving the hash fragment " + sTarget + " failed."
                        };
                    }));
            }
            return Promise.resolve({
                vizId: sVizId,
                inboundPermanentKey: ""
            });
        }

        /**
         * Calls the handler for adding tiles. Does nothing if no function is set for the add tiles handler.
         *
         * @see setAddTileHandler
         *
         * @private
         */
        function _addTiles () {
            if (typeof fnAddTileHandler !== "function") {
                return;
            }
            var aSelectedGroupsIndexes = oGroupList.getSelectedItems().map(function (oSelectedGroup) {
                return oGroupList.indexOfItem(oSelectedGroup);
            });
            var aTileData;
            if (oAddSingleTileData) {
                aTileData = [oAddSingleTileData]; // adds a single tile (from its own "Add" button)
            } else {
                aTileData = _getSelectedTreeItemsData(); // adds all selected tiles (from header "Add" button)
            }
            Promise.all([
                sap.ushell.Container.getServiceAsync("LaunchPage"),
                sap.ushell.Container.getServiceAsync("NavTargetResolution")
            ]).then(function (aServices) {
                aTileData.forEach(function (oTileData) {
                    _getInboundPermanentKey(oTileData.vizId, aServices[0], aServices[1]).then(function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, aSelectedGroupsIndexes);
                    }, function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, aSelectedGroupsIndexes);
                    });
                });
                if (!oAddSingleTileData) { // unselect all tiles only when adding through the header "Add" button
                    oAddSelectedTilesButton.setEnabled(false);
                    oTree.removeSelections(true);
                }
            });
        }
    };
});
