// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

/**
 * @fileOverview The menu service provides the entries for the menu bar
 * @version 1.71.58
 */
sap.ui.define([
    "sap/ushell/Config"
], function (
    Config
) {
    "use strict";

    /**
     * @typedef {object} MenuEntry A Menu Entry
     * @property {string} text The text of the menu entry
     * @property {string} intent The intent of the menu entry
     */

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("Menu")</code>.
     * Constructs a new instance of the menu service.
     *
     * @namespace sap.ushell.services.Menu
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     *
     * @since 1.71.0
     * @private
     */
    function Menu () {

    }

    /**
     * Returns whether the menu is enabled
     *
     * @returns {Promise<boolean>} Is the menu enabled?
     *
     * @since 1.71.0
     * @private
     */
    Menu.prototype.isMenuEnabled = function () {
        // currently the pages are the only use case for the menu
        return Promise.resolve(Config.last("/core/pages/enable"));
    };

    /**
     * Gets the menu entries sorted alphabetically by their text
     *
     * @returns {Promise<MenuEntry[]>} The menu entries
     *
     * @since 1.71.0
     * @private
     */
    Menu.prototype.getMenuEntries = function () {
        var aMenuEntries = this._getPageMenuEntries();

        aMenuEntries.sort(function (oEntryA, oEntryB) {
            return oEntryA.text.localeCompare(oEntryB.text);
        });

        return Promise.resolve(aMenuEntries);
    };

    /**
     * Gets the menu entries for the pages assigned to the user
     *
     * @returns {Promise<MenuEntry[]>} The menu entries
     *
     * @since 1.71.0
     * @private
     */
    Menu.prototype._getPageMenuEntries = function () {
        var oPages = Config.last("/core/pages/assignedPages") || {},
            sPageId,
            sEncodedPageId;

        var aPageMenuEntries = Object.keys(oPages).map(function (key) {
            sPageId = oPages[key];
            sEncodedPageId = encodeURIComponent(sPageId);

            return {
                // currently the title is not available so the page ID is used as text
                text: sPageId,
                // currently there is no space ID in the config but the page ID is the same as the space ID
                intent: "#Shell-showPage?spaceId=" + sEncodedPageId + "&pageId=" + sEncodedPageId
            };
        });

        return aPageMenuEntries;
    };

    Menu.hasNoAdapter = true;
    return Menu;
});