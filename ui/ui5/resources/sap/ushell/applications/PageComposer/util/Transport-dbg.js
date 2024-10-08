// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Config",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/Component",
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (Config, ODataModel, Component, resources) {
    "use strict";

    var TransportHelper = function () {};

    /**
     * Creates the oData model
     *
     * @returns {sap.ui.model.odata.v2.ODataModel} The created model
     *
     * @private
     */
    TransportHelper.prototype._getODataModel = function () {
        if (!this._oODataModel) {
            var sTransportServiceUrl = Config.last("/core/pageComposition/transport/serviceUrl");
            this._oODataModel = new ODataModel({
                serviceUrl: sTransportServiceUrl,
                headers: {
                    "sap-language": sap.ushell.Container.getUser().getLanguage()
                },
                defaultCountMode: "None",
                skipMetadataAnnotationParsing: true,
                useBatch: false
            });
        }

        return this._oODataModel;
    };

    /**
     * Returns a promise which resolves to
     * - the transport information if there are results
     * - true if there are no results
     *
     * @param {string} sPageId The pageId to check
     * @returns {Promise<boolean|object>} A promise resolving to the object or true
     *
     * @private
     */
    TransportHelper.prototype._getTransportLockedInformation = function (sPageId) {
        return this._readTransportInformation(sPageId)
            .then(function (oTransport) {
                return oTransport.results.length ? oTransport.results[0] : true;
            });
    };

    /**
     * Reads the transport information for the given pageId
     *
     * @param {string} sPageId The pageId to check
     * @returns {Promise<object>} A promise resolving to a result object
     *
     * @private
     */
    TransportHelper.prototype._readTransportInformation = function (sPageId) {
        var sUrl = "/transportSet";
        var filter = new sap.ui.model.Filter("pageId", sap.ui.model.FilterOperator.EQ, sPageId);
        return new Promise(function (resolve, reject) {
            this._getODataModel().read(sUrl, {
                filters: [filter],
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
     * Checks if a transport is required for the given package name
     *
     * @param {string} sPackageName The package name
     * @returns {Promise<boolean>} A promise resolving to boolean
     *
     * @private
     */
    TransportHelper.prototype._isPackageTransportRequired = function (sPackageName) {
        return this._readPackageInformation(sPackageName)
            .then(function (result) {
                return result.transportRequired;
            });
    };

    /**
     * Reads information for a given package
     *
     * @param {string} sPackageName The package name
     * @returns {Promise<object>} A promise resolving to the result object
     *
     * @private
     */
    TransportHelper.prototype._readPackageInformation = function (sPackageName) {
        var sUrl = "/packageSet('" + encodeURIComponent(sPackageName) + "')";
        return new Promise(function (resolve, reject) {
            this._getODataModel().read(sUrl, {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
     * Checks if the transport information should be displayed
     *
     * True if the transportId is NOT set but transport is required for the package
     *
     * @param {object} oPage The page object to delete
     * @returns {Promise<boolean>} A promise resolving to the boolean result
     *
     * @private
     */
    TransportHelper.prototype._showTransport = function (oPage) {
        var sPackageName = oPage.metadata.devclass;

        if (oPage && oPage.metadata && !oPage.metadata.transportId) {
            return this._isPackageTransportRequired(sPackageName);
        }

        return Promise.resolve(false);
    };

    /**
     * Returns a function to call when the transport information is changed
     * The returned function adds the transport validation to the given dialog's model
     *
     * @param {sap.ushell.applications.PageComposer.controller.CreatePageDialog} oDialog The dialog controller
     * @returns {function} The change handler function
     *
     * @private
     */
    TransportHelper.prototype._changeHandler = function (oDialog) {
        return function (value) {
            var oModel = oDialog.getModel();
            var oValidation = jQuery.extend({}, oModel.getProperty("/validation"), {
                transport: value
            });
            oModel.setProperty("/validation", oValidation);
        };
    };

    /**
     * Checks if the config value for transport is set to true
     *
     * @returns {boolean} The result
     *
     * @protected
     */
    TransportHelper.prototype.isTransportSupported = function () {
        return Config.last("/core/pageComposition/transport/support");
    };

    /**
     * Adds the transportComponent to the extension point and adds the relevant handlers.
     *
     * @param {sap.ushell.applications.PageComposer.controller.CreatePageDialog} dialog The dialog controller
     * @param {object} transportComponent The component with the transport fields
     * @param {function} onConfirm The confirm function
     * @returns {sap.ushell.applications.PageComposer.controller.CreatePageDialog} The enhanced dialog
     *
     * @protected
     */
    TransportHelper.prototype.enhanceDialogWithTransport = function (dialog, transportComponent, onConfirm) {
        var fnChangeHandler = this._changeHandler(dialog);
        fnChangeHandler(false);
        var fnConfirmHandler = function (pageInfo) {
            var oPageInfo = transportComponent.decorateResultWithTransportInformation(pageInfo);
            onConfirm(oPageInfo);
        };
        transportComponent.attachChangeEventHandler(fnChangeHandler);
        dialog.attachConfirm(fnConfirmHandler);
        dialog.transportExtensionPoint(transportComponent);

        return dialog;
    };

    /**
     * Checks if the EditPage dialog needs to be shown
     *
     * @param {object} page The page to delete
     * @returns {Promise<boolean>} A promise resolving to the boolean result
     *
     * @protected
     */
    TransportHelper.prototype.checkShowTransport = function (page) {
        if (!this.isTransportSupported()) {
            return Promise.resolve(false);
        }

        return this._showTransport(page).then(function (showTransport) {
            return showTransport;
        });
    };

    /**
     * Checks if the EditPage0 dialog should show a locked message
     *
     * @param {object} page The page to edit
     * @returns {Promise<boolean|object>} A promise with the transport information or false if the page is not locked
     *
     * @protected
     */
    TransportHelper.prototype.checkShowLocked = function (page) {
        if (!this.isTransportSupported()) {
            return Promise.resolve(false);
        }

        return this._getTransportLockedInformation(page.content.id).then(function (transportLockedInformation) {
            if (transportLockedInformation.foreignOwner) {
                return transportLockedInformation;
            }
            return false;
        });
    };

    if (!this.transportHelper) {
        this.transportHelper = new TransportHelper();
    }

    return this.transportHelper;
});