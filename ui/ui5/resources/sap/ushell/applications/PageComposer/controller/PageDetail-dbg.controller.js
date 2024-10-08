// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/ushell/applications/PageComposer/controller/Page",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/base/Log",
    "sap/base/strings/formatMessage"
], function (
    BaseController,
    Page,
    JSONModel,
    MessageToast,
    Log,
    formatMessage
) {
    "use strict";

    /**
     * @typedef {object} ContentCatalogs Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalog tiles
     * @property {string} catalogTitles The catalog titles
     * @property {string} catalogTiles The catalog tiles in a catalog
     * @property {string} mCatalogTiles A map from vizId to tile
     */

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.PageDetail", {
        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onPageMatched, this);

            this.oCopyDialogModel = new JSONModel({
                page: null,
                approvalText: ""
            });

            this.setModel(new JSONModel({
                page: {},
                editMode: false
            }));

            this.Page.init(this);
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
        formatMessage: formatMessage,

        /**
         * Called if the route matched the pattern for viewing a page.
         * Loads the page with the id given in the URL parameter
         *
         * @param {sap.ui.base.Event} event The routing event
         *
         * @private
         */
        _onPageMatched: function (event) {
            var sPageId = event.getParameter("arguments").pageId;

            this._loadPage(decodeURIComponent(sPageId)).then(function (oPage) {
                this.getModel().setProperty("/page", oPage);

                this.Page.init(this);
                this._fetchCatalogInfo().then(function (catalogInfo) {
                    this.mCatalogTiles = catalogInfo.mCatalogTiles;
                    this.getModel().updateBindings(true);
                }.bind(this));
            }.bind(this), function (sErrorMsg) {
                this.showMessageBoxError(sErrorMsg, true);
            }.bind(this));
        },

        /**
         * Loads the page with the given pageId from the PagePersistence
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
         * Navigates to the page detail page
         *
         * @param {string} pageId The pageId to navigate to
         *
         * @private
         */
        _navigateToEdit: function (pageId) {
            this.getRouter().navTo("edit", {
                pageId: encodeURIComponent(pageId)
            });
        },

        /**
         * Called if the delete action has been cancelled
         *
         * @private
         */
        onDeleteCancel: function () {
            var oDialog = this.byId("deleteDialog");
            oDialog.close();
        },

        /**
         * Called if the delete action has been confirmed
         *
         * @param {sap.ui.base.Event} oEvent The deletePage event
         * @returns {Promise<void>} A promise resolving when the page has been deleted
         *
         * @private
         */
        _deletePage: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var sTransportId = oEvent.metadata && oEvent.metadata.transportId || "";
            var sPageToDeleteId = this.getModel().getProperty("/page/content/id");
            var sSuccessMsg = this.getResourceBundle().getText("Message.SuccessDeletePage");

            return this.getPageRepository().deletePage(sPageToDeleteId, sTransportId)
                .then(function () {
                    this.navigateToPageOverview();
                    MessageToast.show(sSuccessMsg, {
                        closeOnBrowserNavigation: false
                    });
                    oDialog.close();
                }.bind(this))
                .catch(this.handleBackendError.bind(this));
        },

        /**
         * Copies a page
         *
         * @private
         */
        _copyPage: function () {
            //@TODO: implement
            // var oDialog = oEvent.getSource().getParent();
        },

        /**
         * Called if the Edit button is clicked.
         * Loads the edit route
         *
         * @private
         */
        onEdit: function () {
            this._navigateToEdit(this.getModel().getProperty("/page/content/id"));
        },

        /**
         * Called if the delete button is clicked
         * Shows the Delete Dialog
         *
         * @private
         */
        onDelete: function () {
            var oPage = this.getModel().getProperty("/page");
            this.checkShowDeleteDialog(oPage, this._deletePage.bind(this));
        },

        /**
         * Called if the copy button is clicked
         *
         * @private
         */
        onCopy: function () {
            var oPage = this.getModel().getProperty("/page");
            var sApprovalText = this.getResourceBundle().getText("CopyDialog.Message", [oPage.content.id, oPage.content.title]);
            this.oCopyDialogModel.setProperty("/page", oPage);
            this.oCopyDialogModel.setProperty("/approvalText", sApprovalText);
            this.getOwnerComponent().showCopyDialog(this.oCopyDialogModel, this._copyPage.bind(this));
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
                    })).then(function (catalogTiles) {
                        var mVizIdToCatalogTiles = {};
                        for (var i = 0; i < catalogTiles.length; i++) {
                            for (var j = 0; j < catalogTiles[i].length; j++) {
                                mVizIdToCatalogTiles[launchPageService.getCatalogTileId(catalogTiles[i][j])] = catalogTiles[i][j];
                            }
                        }

                        return {
                            catalogTitles: aCatalogTitles,
                            catalogTiles: catalogTiles,
                            mCatalogTiles: mVizIdToCatalogTiles
                        };
                    });
                });
            });
        }
    });
});
