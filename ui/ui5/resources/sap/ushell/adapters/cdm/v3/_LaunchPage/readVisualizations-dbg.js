// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview Helper of accessing visualization data for the 'CDM' platform.
 *
 * TODO: Simplify function names
 *
 * @version 1.71.58
 * @private
 */
sap.ui.define( [
    "sap/ushell/utils/type"
], function (oTypeUtils) {
    "use strict";

    /* ***** Access to visualizations ***** */

    /**
     * Returns the map of visualizations.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all visualizations as properties (property name
     *      is the vizId, property value is the visualizations data)
     */
    function getMap (oSite) {
        return oSite.visualizations;
    }

    /**
     * Returns the visualization with the given ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the visualization to be returned
     *  @returns {object}
     *      the visualization with the specified ID or undefined if not present
     */
    function get (oSite, sId) {
        return oSite.visualizations[sId];
    }

    /* ***** Access to visualization types ***** */

    /**
     * Returns the map of visualization types.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all visualization types as properties (property name
     *      is the vizTypeId, property value is the visualization type data)
     */
    function getTypeMap (oSite) {
        return oSite.vizTypes;
    }

    /**
     * Returns the visualization type with the given ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the visualization type to be returned
     *  @returns {object}
     *      the visualization type with the specified ID or undefined if not present
     */
    function getType (oSite, sId) {
        return oSite.vizTypes[sId];
    }

    /**
     * Returns the visualization type ID.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization type ID or undefined if not present
     */
    function getTypeId (oVisualization) {
        return oVisualization.vizType;
    }

    /* ***** Access to visualization config and its attributes ***** */

    /**
     * Returns the configuration of the visualization
     *
     * @param {object} oVisualization
     */
    function getConfig (oVisualization) {
        var oConfig;
        oConfig = oVisualization["vizConfig"];

        return oConfig;
    }

    /**
     * Returns the visualization's target app ID,
     * which is located inside the its configuration
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization's app ID or undefined if not present
     */
    function getAppId (oVisualization) {
        return (getTarget(oVisualization) || {}).appId;
    }

    /**
     * Returns the visualization's target,
     * which is located inside the its configuration
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization's app ID or undefined if not present
     */
    function getTarget (oVisualization) {
        return ((( getConfig(oVisualization) || {} )["sap.flp"]) || {}).target;
    }

    /**
     * Returns the outbound for a visualization. Appends the parameter sap-ui-app-id-hint
     * to the parameter list.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @param {object} oInbound
     *      Inbound
     *  @returns {object}
     *      The outbound based on the visualization and the inbound
     */
    function getOutbound (oVisualization, oInbound) {

        var oOutbound;

        oOutbound = {
            semanticObject: oInbound.semanticObject,
            action: oInbound.action,
            parameters: getTarget( oVisualization ).parameters || {}
        };

        oOutbound.parameters["sap-ui-app-id-hint"] = {
            value: {
                format: "plain",
                value: getAppId(oVisualization)
            }
        };

        return oOutbound;
    }


    /**
     * Checks whether a visualization starts an external URL.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {boolean}
     *      Returns whether the visualization starts an external URL
     */
    function startsExternalUrl (oVisualization) {

        return (getTarget(oVisualization) || {}).type === "URL";

    }

    /* ***** Access to site application descriptor ***** */

    /**
     * Returns the app descriptor with the given app ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the app descriptor to be returned
     *  @returns {object}
     *      the app descriptor with the specified ID or undefined if not present
     */
    function getAppDescriptor (oSite, sId) {
        return oSite.applications && oSite.applications[sId];
    }

    /* ***** // Return visualization read access ***** */
    return {

        // Access to visualizations
        getMap: getMap,
        get: get,

        // Access to visualization types
        getTypeMap: getTypeMap,
        getType: getType,
        getTypeId: getTypeId,

        // Access to visualization's configuration and its attributes
        getConfig: getConfig,
        getAppId: getAppId,
        getTarget: getTarget,
        getOutbound : getOutbound,
        startsExternalUrl: startsExternalUrl,

        // Access to site application
        getAppDescriptor: getAppDescriptor
    };

}, /* bExport = */ true );
