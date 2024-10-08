// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's platform independent sap.ushell.adapters.PagesCommonDataModelAdapter.
 *
 * @version 1.71.58
 */

sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the platform independent PagesCommonDataModelAdapter.
     *
     * @param {object} unused Not used by this adapter
     * @param {string} parameter Not used by this adapter
     * @param {object} adapterConfiguration The Adapter configuration
     *
     * @class
     * @constructor
     * @see {@link sap.ushell.adapters.PagesCommonDataModelAdapter}
     *
     * @experimental Since 1.69.0
     * @private
     */
    var PagesCommonDataModelAdapter = function (unused, parameter, adapterConfiguration) {
        this.sComponent = "sap/ushell/adapters/cdm/PagesCommonDataModelAdapter";
        this.oCDMSiteRequestPromise = new Promise(function (resolve, reject) {
            if (adapterConfiguration && adapterConfiguration.config && adapterConfiguration.config.pageId) {
                Promise.all([
                    sap.ushell.Container.getServiceAsync("NavigationDataProvider"),
                    sap.ushell.Container.getServiceAsync("VisualizationDataProvider"),
                    sap.ushell.Container.getServiceAsync("PagePersistence")
                ]).then(function (aServices) {
                    var oNavigationDataPromise = aServices[0] && aServices[0].getNavigationData();
                    var oVisualizationDataPromise = aServices[1] && aServices[1].getVisualizationData();
                    var oPageDataPromise = aServices[2] && aServices[2].getPage(adapterConfiguration.config.pageId);
                    Promise.all([oPageDataPromise, oVisualizationDataPromise, oNavigationDataPromise]).then(resolve);
                }).catch(function (error) {
                    Log.fatal("PagesCommonDataModelAdapter encountered an error while fetching required services: ", error, this.sComponent);
                    reject(error);
                }.bind(this));
            } else {
                var sErrorMessage = "PagesCommonDataModelAdapter was instantiated without a configured page";
                Log.fatal(sErrorMessage, null, this.sComponent);
                reject(sErrorMessage);
            }
        }.bind(this));
    };

    /**
     * Retrieves the CDM site using data provided by the NavigationDataProvider-, VisualizationDataProvider- and PagePersistence Service
     *
     * @returns {jQuery.Deferred.Promise}
     *   The promise's done handler returns the CDM site object.
     *   In case an error occurred, the promise's fail handler returns an error message.
     *
     * @experimental Since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getSite = function () {
        var oDeferred = new jQuery.Deferred();

        Promise.all([
            this.oCDMSiteRequestPromise,
            sap.ushell.Container.getServiceAsync("PageReferencing")
        ]).then(function (aResult) {
            var aServiceData = aResult[0];
            var PageReferencing = aResult[1];

            var oPage = aServiceData[0] && aServiceData[0].content;
            var oVisualizationData = aServiceData[1];
            var oNavigationData = aServiceData[2];

            var oCDMSite = PageReferencing.dereferencePage(oPage, oVisualizationData, oNavigationData);
            oDeferred.resolve(oCDMSite);
        }).catch(function (sMessage) {
            Log.error("PagesCommonDataModelAdapter:getSite encountered an error while acquiring the data - ", sMessage, this.sComponent);
            oDeferred.reject(sMessage);
        }.bind(this));

        return oDeferred.promise();
    };

    /**
     * Retrieves the personalization part of the CDM site
     *
     * @returns {jQuery.Deferred.Promise}
     *   The promise's done handler returns the personalization object of the CDM site.
     *   In case an error occurred, the promise's fail handler returns an error message.
     *
     * @experimental Since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getPersonalization = function () {
        // No implementation until further notice
        return new jQuery.Deferred().resolve({}).promise();
    };

    /**
     * Wraps the logic for storing the personalization data.
     *
     * @param {object} oPersonalizationData
     *   Personalization data which should get stored
     * @returns {jQuery.Deferred.Promise} promise
     *   The promise's done handler indicates successful storing of personalization data.
     *   In case an error occured, the promise's fail handler returns an error message.
     *
     * @experiment Since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.setPersonalization = function (oPersonalizationData) {
        // No implementation until further notice
        return new jQuery.Deferred().resolve().promise();
    };

    return PagesCommonDataModelAdapter;
}, /*export=*/ true);
