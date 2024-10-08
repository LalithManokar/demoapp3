//Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "./controller/CopyDialog",
    "./controller/DeleteDialog.controller",
    "./controller/ErrorDialog"
], function (UIComponent, CopyDialog, DeleteDialog, ErrorDialog) {
    "use strict";

    return UIComponent.extend("sap.ushell.applications.PageComposer.Component", {

        metadata: {
            "manifest": "json"
        },

        /**
         * Initializes the component
         *
         * @protected
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();

            this.getModel("PageRepository").setHeaders({
                "sap-language": sap.ushell.Container.getUser().getLanguage(),
                "sap-client": sap.ushell.Container.getLogonSystem().getClient()
            });
        },

        /**
         * Shows an error dialog
         * @param {object} oError The error object
         *
         * @protected
         */
        showErrorDialog: function (oError) {
            ErrorDialog.open(oError);
        },

        /**
         * Get the component defined in the metadata "componentUsages" property
         *
         * @param {string} [pagePackage] The page package name
         * @returns {Promise<sap.ui.core.Component>} Promise resolving to the component instance
         *
         * @protected
         */
        createTransportComponent: function (pagePackage) {
            return this.createComponent({
                async: true,
                usage: "transportInformation",
                componentData: {
                    "package": pagePackage
                }
            });
        }

    });
});
