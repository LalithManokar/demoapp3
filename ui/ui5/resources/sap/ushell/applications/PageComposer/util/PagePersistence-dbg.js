// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview PagePersistence utility to interact with the /UI2/FDM_PAGE_REPOSITORY_SRV service on ABAP
 * @version 1.71.58
 */
sap.ui.define([
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (
    resources
) {
    "use strict";

    /**
    * Constructs a new instance of the PagePersistence utility.
    *
    * @param {sap.ui.model.odata.v2.ODataModel} oDataModel The ODataModel for the PageRepositoryService
    * @constructor
    *
    * @since 1.70.0
    *
    * @private
    */
    var PagePersistence = function (oDataModel) {
        this._oODataModel = oDataModel;
        this._oEtags = {};
    };

    /**
    * Returns a promise which resolves to an array of page headers of all available pages.
    *
    * @returns {Promise<object[]>} Resolves to an array of page headers
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.getPages = function () {
        return this._readPages()
            .then(function (pages) {
                for (var i = 0; i < pages.results.length; i++) {
                    this._storeETag(pages.results[i]);
                }
                return pages;
            }.bind(this))
            .then(this._convertODataToPageList)
            .catch(this._rejectWithErrorMessage);
    };

    /**
    * Returns a page
    *
    * @param {string} sPageId The page ID
    * @returns {Promise<object>} Resolves to a page
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.getPage = function (sPageId) {
        return this._readPage(sPageId)
            .then(function (page) {
                this._storeETag(page);
                return page;
            }.bind(this))
            .then(this._convertODataToReferencePage)
            .catch(this._rejectWithErrorMessage);
    };

    /**
    * Creates a new page
    *
    * @param {object} oPageToCreate The new page
    * @returns {Promise} Resolves when the page has been created successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.createPage = function (oPageToCreate) {
        var pageToCreate = this._convertReferencePageToOData(oPageToCreate);

        return this._createPage(pageToCreate).then(this._storeETag.bind(this));
    };

    /**
    * Updates a page. This method expects to get the complete page. Sections and tiles
    * that are left out will be deleted.
    *
    * @param {object} oUpdatedPage The updated page data
    * @returns {Promise} Resolves when the page has been updated successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.updatePage = function (oUpdatedPage) {
        var oUpdatedODataPage = this._convertReferencePageToOData(oUpdatedPage);

        oUpdatedODataPage.modifiedOn = this._oEtags[oUpdatedPage.content.id].modifiedOn;

        return this._createPage(oUpdatedODataPage).then(this._storeETag.bind(this)).catch(this._rejectWithErrorMessage);
    };

    /**
    * Deletes a  page
    *
    * @param {string} sPageId The ID of the page to be deleted
    * @param {string} sTransportId The transport workbench
    * @returns {Promise} Resolves when the page has been deleted successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.deletePage = function (sPageId, sTransportId) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.callFunction("/deletePage", {
                method: "POST",
                urlParameters: {
                    pageId: sPageId,
                    transportId: sTransportId,
                    modifiedOn: this._oEtags[sPageId].modifiedOn
                },
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Reads the headers of the available pages from the server
    *
    * @returns {Promise<object>} Resolves to the page headers in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._readPages = function () {
        return new Promise(function (resolve, reject) {
            this._oODataModel.read("/pageSet", {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Reads a page from the server
    *
    * @param {string} sPageId The page ID
    * @returns {Promise<object>} Resolves to a page in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._readPage = function (sPageId) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.read("/pageSet('" + encodeURIComponent(sPageId) + "')", {
                urlParameters: {
                    "$expand": "sections/tiles"
                },
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Creates a page on the server
    *
    * @param {object} oNewPage The page data
    * @returns {Promise} Page the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._createPage = function (oNewPage) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.create("/pageSet", oNewPage, {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Converts a list of page headers from the OData format into the FLP internal format
    *
    * @param {object[]} aPages The page headers in the OData format
    * @returns {object[]} The page headers in the FLP-internal format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertODataToPageList = function (aPages) {
        return aPages.results.map(function (oPage) {
            return {
                content: {
                    id: oPage.id,
                    title: oPage.title,
                    description: oPage.description,
                    createdBy: oPage.createdBy,
                    createdOn: oPage.createdOn,
                    modifiedBy: oPage.modifiedBy,
                    modifiedOn: oPage.modifiedOn
                },
                metadata: {
                    devclass: oPage.devclass,
                    transportId: oPage.transportId
                }
            };
        });
    };

    /**
    * Converts a reference page from the OData format to the FLP internal format
    *
    * @param {object} oPage The page in the OData format
    * @returns {object} The page in the FLP format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertODataToReferencePage = function (oPage) {
        return {
            content: {
                id: oPage.id,
                title: oPage.title,
                description: oPage.description,
                createdBy: oPage.createdBy,
                createdOn: oPage.createdOn,
                modifiedBy: oPage.modifiedBy,
                modifiedOn: oPage.modifiedOn,
                sections: oPage.sections.results.map(function (section) {
                    return {
                        id: section.id,
                        title: section.title,
                        visualizations: section.tiles.results.map(function (tile) {
                            return {
                                id: tile.id,
                                vizId: tile.catalogTile,
                                inboundPermanentKey: tile.targetMapping
                            };
                        })
                    };
                })
            },
            metadata: {
                transportId: oPage.transportId,
                devclass: oPage.devclass
            }
        };
    };

    /**
    * Converts the reference page from the FLP internal format to the OData format
    *
    * @param {object} oPage The page in the FLP format
    * @returns {object} The page in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertReferencePageToOData = function (oPage) {
        var oReferencePage = oPage.content,
            oMetadata = oPage.metadata;

        var oODataPage = {
            id: oReferencePage.id,
            title: oReferencePage.title,
            description: oReferencePage.description,
            devclass: oMetadata.devclass,
            transportId: oMetadata.transportId,
            sections: (oReferencePage.sections || []).map(function (section) {
                return {
                    id: section.id,
                    title: section.title,
                    tiles: (section.visualizations || []).map(function (tile) {
                        return {
                            id: tile.id,
                            catalogTile: tile.vizId,
                            targetMapping: tile.inboundPermanentKey
                        };
                    })
                };
            })
        };

        return oODataPage;
    };

    /**
    * Stores the etag for a newly retrieved
    *
    * @param {object} oPage The newly retrieved
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._storeETag = function (oPage) {
        this._oEtags[oPage.id] = {
            // this is used as an etag for the deep update
            modifiedOn: oPage.modifiedOn,
            // this etag is used for deletion
            etag: oPage.__metadata.etag
        };
    };

    /**
    * Extracts the error message from an error object
    *
    * @param {object} oError The error object
    * @returns {Promise} A rejected promise containing the error message
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._rejectWithErrorMessage = function (oError) {
        var sErrorMessage;

        if (oError.statusCode === 412) {
            sErrorMessage = resources.i18n.getText("Message.PageIsOutdated");
        } else {
            try {
                sErrorMessage = JSON.parse(oError.responseText).error.message.value || oError.message;
            } catch (error) {
                sErrorMessage = oError.message;
            }
        }
        return Promise.reject(sErrorMessage);
    };

    return PagePersistence;
}, true /* bExport */);
