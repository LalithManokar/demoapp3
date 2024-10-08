// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * <p>This module prepares the navigation data needed by the page dereferencer.</p>
 *
 * @version 1.71.58
 */

sap.ui.define([], function () {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("NavigationDataProvider")</code>.
     * Constructs a new instance of the navigation data provider service.
     *
     * @namespace sap.ushell.services.NavigationDataProvider
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     * @experimental Since 1.68.0
     *
     * @private
     */
    function NavigationDataProvider (/*adapter, serviceConfiguration*/) {
        this._init.apply(this, arguments);
    }

    /**
     * Private initializer.
     *
     * @param {object} adapter
     *     the navigation data provider adapter for the frontend server
     * @param {object} serviceConfiguration
     *     the navigation data provider service configuration
     * @experimental Since 1.68.0
     *
     * @private
     */
    NavigationDataProvider.prototype._init = function (adapter, serviceConfiguration) {
        this.oAdapter = adapter;
    };

    /**
     * An object representing navigation data containing inbounds and available system aliases.
     * @typedef {object} NavigationData
     * @property {object[]} object.inbounds The inbounds.
     * @property {object} object.systemAliases The system aliases.
     */

    /**
     * Loads and returns the relevant navigation data.
     *
     * @returns {Promise<NavigationData>} The navigation data.
     * @experimental Since 1.68.0
     *
     * @private
     */
    NavigationDataProvider.prototype.getNavigationData = function () {
        return new Promise(function (resolve, reject) {
            var oSystemAliases = (this.oAdapter.getSystemAliases && this.oAdapter.getSystemAliases()) || {};

            this.oAdapter.getInbounds()
                .then(function (aInbounds) {
                    resolve({
                        systemAliases: oSystemAliases,
                        inbounds: aInbounds
                    });
                })
                .fail(reject);
        }.bind(this));
    };

    NavigationDataProvider.hasNoAdapter = false;
    return NavigationDataProvider;
});