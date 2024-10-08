// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/ushell/applications/PageComposer/controller/Page",
    "sap/ushell/applications/PageComposer/controller/TileSelector",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/MessageToast"
], function (
    MessagePopover,
    MessageItem,
    BaseController,
    Page,
    TileSelector,
    JSONModel,
    MessageBox,
    coreLibrary,
    MessageToast
) {
    "use strict";

    /**
     * @typedef {object} ContentCatalogs Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalog tiles
     * @property {string} catalogTitles The catalog titles
     * @property {string} catalogTiles The catalog tiles in a catalog
     * @property {string} mCatalogTiles A map from vizId to tile
     */

    var oModel = new JSONModel();
    var resources = {};
    /**
     * Convenience method to initialize the page model
     *
     * @param {object} model Page model to be initialized
     * @property {object} model.page Page of the model
     * @property {boolean} model.edit Wheter the page is in edit mode
     * @property {array} model.errors The errors on the page
     * @property {number} model.errorslength The number of errors on the page
     * @property {boolean} model.headerExpanded Wheter the page header is expanded
     *
     * @private
     */
    function _initModel (model) {
        model.setData({
            page: {},
            edit: true,
            errors: [],
            errorslength: 0,
            headerExpanded: true
        });
    }

    //JSONModel change event does not work properly
    oModel.setProperty = function (sPath) {
        if (sPath.indexOf("/page") === 0 && !jQuery.isEmptyObject(oModel.getProperty("/page"))) {
            sap.ushell.Container.setDirtyFlag(true);
        }
        JSONModel.prototype.setProperty.apply(this, arguments);
    };


    return BaseController.extend("sap.ushell.applications.PageComposer.controller.PageDetailEdit", {
        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("edit").attachPatternMatched(this._onPageMatched, this);
            this.setModel(oModel);
            resources.i18n = this.getResourceBundle();

            this.Page.init(this);
            this.TileSelector.init(this);
            this.TileSelector.setAddTileHandler(this._addContentToGroup.bind(this));
        },

        /**
         * Called when page detail view is exited.
         *
         * @private
         */
        onExit: function () {
            this.Page.exit();
        },

        mCatalogTiles: {},
        Page: Page,
        TileSelector: new TileSelector(),
        oMessagePopover: new MessagePopover({
            items: {
                path: "/errors",
                template: new MessageItem({
                    type: "{type}",
                    title: "{title}",
                    activeTitle: "{active}",
                    description: "{description}",
                    subtitle: "{subtitle}",
                    counter: "{counter}"
                })
            }
        }).setModel(oModel),

        /**
         * Handles the message popover press in the footer bar.
         *
         * @param {sap.ui.base.Event} oEvent The press event.
         *
         * @private
         */
        handleMessagePopoverPress: function (oEvent) {
            this.oMessagePopover.toggle(oEvent.getSource());
        },

        /**
         * Called if the show/hide catalogs button is called.
         * Used to show or hide the side content.
         *
         * @private
         */
        onUpdateSideContentVisibility: function () {
            var oPageDesigner = this.getView().byId("layoutContent");
            oPageDesigner.setShowSideContent(!oPageDesigner.isSideContentVisible());
        },

        /**
         * Called if the title is changed
         * If the title is empty, the valueState changes to ERROR
         *
         * @param {sap.ui.base.Event} oEvent The change event
         *
         * @private
         */
        onTitleChange: function (oEvent) {
            var oInput = oEvent.getSource();
            oInput.setValueStateText(resources.i18n.getText("Message.EmptyTitle"));

            if (!oInput.getValue()) {
                oInput.setValueState(coreLibrary.ValueState.Error);
            } else {
                oInput.setValueState(coreLibrary.ValueState.None);
            }
        },

        /**
         * Called if the save button is pressed.
         * MessageToast will confirm that the changes have been successfully saved
         *
         * @private
         */
        onSave: function () {
            var fnSave = function (sClickedAction) {
                if (sClickedAction === MessageBox.Action.OK) {
                    this._savePage(oModel.getProperty("/page")).then(function () {
                        sap.ushell.Container.setDirtyFlag(false);
                        MessageToast.show(resources.i18n.getText("Message.SavedChanges"), {
                            closeOnBrowserNavigation: false
                        });
                    }, function (sErrorMsg) {
                        this.showMessageBoxError(sErrorMsg, false);
                    }.bind(this));
                }
            }.bind(this);

            if (!oModel.getProperty("/page/content/title")) {
                this.showMessageBoxError(resources.i18n.getText("Message.EmptyTitle"));
                oModel.setProperty("/headerExpanded", true);

                return;
            }

            if (!window.navigator.onLine) {
                this.showMessageBoxError(resources.i18n.getText("Message.NoInternetConnection"));

                return;
            }

            if (oModel.getProperty("/errorslength") > 0) {
                var sTitle = resources.i18n.getText("Title.TilesHaveErrors"),
                    sMessage = resources.i18n.getText("Message.TilesHaveErrors");
                sap.ushell.Container.getService("Message").confirm(sMessage, fnSave, sTitle);

                return;
            }

            fnSave(MessageBox.Action.OK);
        },

        /**
         * Called if the cancel button is pressed.
         * Navigates to the page overview without saving changes.
         *
         * @private
         */
        onCancel: function () {
            this.navigateToPageOverview();
        },

        /**
         * Set the new transportId to the page object
         *
         * @param {sap.ui.base.Event} event The object containing the metadata
         *
         * @private
         */
        _updatePageWithMetadata: function (event) {
            if (event && event.metadata && event.metadata.transportId) {
                oModel.setProperty("/page/metadata/transportId", event.metadata.transportId);
            }
        },

        /**
         * Called if the route matched the pattern for the editing of a page.
         * Loads the page with the id given in the URL parameter.
         *
         * @param {sap.ui.base.Event} event The routing event
         *
         * @private
         */
        _onPageMatched: function (event) {
            var sPageId = event.getParameter("arguments").pageId;
            _initModel(oModel);
            this._loadPage(decodeURIComponent(sPageId)).then(function (oPage) {
                oModel.setProperty("/page", oPage);
                oModel.setProperty("/edit", true);

                this.checkShowEditDialog(
                    oPage,
                    this._updatePageWithMetadata.bind(this),
                    this.navigateToPageOverview.bind(this)
                );

                this.Page.init(this);
                this._fetchCatalogInfo().then(function (catalogInfo) {
                    this.mCatalogTiles = catalogInfo.mCatalogTiles;
                    this.TileSelector.initTiles(catalogInfo);
                    oModel.updateBindings(true);
                    this._pageUpdated();
                    if (!oModel.getProperty("/page/content/sections").length) {
                        this.Page.addGroup();
                    }
                }.bind(this)).then(function () {
                    sap.ushell.Container.setDirtyFlag(false);
                }).catch(function (sErrorMsg) {
                    this.showMessageBoxError(sErrorMsg, true);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Loads the page with the given pageId from the PagePersistence.
         *
         * @param {string} pageId The pageId to load
         * @returns {Promise<object>} A promise resolving to the page
         *
         * @private
         */
        _loadPage: function (pageId) {
            return this.getPageRepository().getPage(pageId);
        },

        /**
         * Saves the page model using the PagePersistence service
         *
         * @param {object} page The page model to save
         * @returns {Promise<void>} A promise
         *
         * @private
         */
        _savePage: function (page) {
            return this.getPageRepository().updatePage(page);
        },

        /**
         * Fetches the catalog information.
         *
         * @returns {ContentCatalogs} Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalogtiles
         *
         * @private
         */
        _fetchCatalogInfo: function () {
            return sap.ushell.Container.getServiceAsync("LaunchPage").then(function (launchPageService) {
                return launchPageService.getCatalogs().then(function (aCatalogs) {
                    var aCatalogTitles = aCatalogs.map(function (oCatalog) {
                        var sCatalogId = launchPageService.getCatalogId(oCatalog) || "";
                        return launchPageService.getCatalogTitle(oCatalog) || sCatalogId.split(":").slice(1).join(":");
                    });

                    // CDM catalogs do not have the tiles[] array, get the tiles in a separate call
                    return Promise.all(aCatalogs.map(function (oCatalog) {
                        return launchPageService.getCatalogTiles(oCatalog);
                    })).then(function (aCatalogTiles) {
                        var mVizIdToCatalogTiles = {};
                        for (var i = 0; i < aCatalogTiles.length; i++) {
                            for (var j = 0; j < aCatalogTiles[i].length; j++) {
                                mVizIdToCatalogTiles[launchPageService.getCatalogTileId(aCatalogTiles[i][j])] = aCatalogTiles[i][j];
                            }
                        }

                        return {
                            catalogTitles: aCatalogTitles,
                            catalogTiles: aCatalogTiles,
                            mCatalogTiles: mVizIdToCatalogTiles
                        };
                    });
                });
            });
        },

        /**
         * Updates the error count and sets the dirty flag.
         *
         * @private
         */
        _pageUpdated: function () {
            sap.ushell.Container.setDirtyFlag(true);

            var aErrors = this.Page.collectErrors();

            oModel.setProperty("/errors", aErrors);
            oModel.setProperty("/errorslength", aErrors.length);
        },

        /* Group - Model API */

        /**
         * Adds a group to the model at the given index.
         *
         * @param {integer} groupIndex The index of where to add the group in the array
         *
         * @protected
         */
        addGroupAt: function (groupIndex) {
            var aGroups = oModel.getProperty("/page/content/sections");

            if (!groupIndex && groupIndex !== 0) {
                groupIndex = aGroups.length;
            }
            aGroups.splice(groupIndex, 0, {
                visualizations: []
            });

            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /**
         * Handles the deletion of a group using and updating the model
         *
         * @param {integer} groupIndex The index of the group, that should be deleted
         *
         * @protected
         */
        deleteGroup: function (groupIndex) {
            if (!groupIndex && groupIndex !== 0) {
                return;
            }

            var aGroups = oModel.getProperty("/page/content/sections");
            aGroups.splice(groupIndex, 1);
            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /* Content - Model API */

        /**
         * Handles the moving of a group using and updating the model
         *
         * @param {integer} originalGroupIndex The old index of the group, that should be moved
         * @param {integer} newGroupIndex The new index of the group, that should be moved
         *
         * @protected
         */
        moveGroup: function (originalGroupIndex, newGroupIndex) {
            if (!originalGroupIndex && originalGroupIndex !== 0
                || !newGroupIndex && newGroupIndex !== 0) {
                return;
            }

            var aGroups = oModel.getProperty("/page/content/sections"),
                oGroupToBeMoved = aGroups.splice(originalGroupIndex, 1)[0];

            aGroups.splice(newGroupIndex, 0, oGroupToBeMoved);
            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /**
         * Handles the addition of content to a group using and updating the model
         *
         * @param {object} content The content, that should be added
         * @param {number[]} groupIndices The indices of groups, the content should be added to
         * @param {integer} contentIndex The index, the content should be added at
         *
         * @private
         */
        _addContentToGroup: function (content, groupIndices, contentIndex) {
            if (!content || !groupIndices.length) {
                return;
            }

            groupIndices.forEach(function (iGroupIndex) {
                var aContent = oModel.getProperty("/page/content/sections/" + iGroupIndex + "/visualizations");

                if (!contentIndex && contentIndex !== 0) {
                    contentIndex = aContent.length;
                }

                aContent.splice(contentIndex, 0, content);

                oModel.setProperty("/page/content/sections/" + iGroupIndex + "/visualizations", aContent);

                this._pageUpdated();
            }.bind(this));
        },

        /**
         * Handles the deletion of content inside a group using and updating the model
         *
         * @param {integer} contentIndex The index of the content, that should be deleted
         * @param {integer} groupIndex The index of the group, the content is in
         *
         * @protected
         */
        deleteContentInGroup: function (contentIndex, groupIndex) {
            if (!contentIndex && contentIndex !== 0
                || !groupIndex && groupIndex !== 0) {
                return;
            }

            var aContent = oModel.getProperty("/page/content/sections/" + groupIndex + "/visualizations");
            aContent.splice(contentIndex, 1);
            oModel.setProperty("/page/content/sections/" + groupIndex + "/visualizations", aContent);

            this._pageUpdated();
        },

        /**
         * Handles the movement of content inside a group and between different groups,
         * using and updating the model
         *
         * @param {integer} originalContentIndex The old index, where the content was from
         * @param {integer} newContentIndex The new index, where the content should go
         * @param {integer} originalGroupIndex The index of the group, the content was in
         * @param {integer} newGroupIndex The index of the group, where the content should be added
         *
         * @protected
         */
        moveContentInGroup: function (originalContentIndex, newContentIndex, originalGroupIndex, newGroupIndex) {
            if (!originalContentIndex && originalContentIndex !== 0
                || !newContentIndex && newContentIndex !== 0
                || !originalGroupIndex && originalGroupIndex !== 0
                || !newGroupIndex && newGroupIndex !== 0) {
                return;
            }

            var sOriginalContentPath = "/page/content/sections/" + originalGroupIndex + "/visualizations",
                sNewContentPath = "/page/content/sections/" + newGroupIndex + "/visualizations",
                aOriginalContent = oModel.getProperty(sOriginalContentPath),
                aNewContent = oModel.getProperty(sNewContentPath),
                oContent = aOriginalContent.splice(originalContentIndex, 1);

            aNewContent.splice(newContentIndex, 0, oContent[0]);

            oModel.setProperty(sOriginalContentPath, aOriginalContent);
            oModel.setProperty(sNewContentPath, aNewContent);

            this._pageUpdated();
        }
    });
});
