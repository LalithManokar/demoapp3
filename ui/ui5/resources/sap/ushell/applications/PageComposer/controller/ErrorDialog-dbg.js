// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/ushell/applications/PageComposer/i18n/resources",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (
    Fragment,
    resources,
    JSONModel,
    MessageToast
) {
    "use strict";

    /**
     * @typedef {object} BackendError An error object sent from backend
     * @property {string} message The error message
     * @property {string} statusCode The HTML status code
     * @property {string} statusText The status text
     */

    var oController = {

        /**
         * Destroy the dialog after each use.
         *
         * @param {sap.ui.base.Event} oEvent The closing event
         *
         * @private
        */
        onAfterClose: function (oEvent) {
            oEvent.getSource().destroy();
        },


        /**
         * Show error details.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
        */
        onShowDetails: function (oEvent) {
            oEvent.getSource().getModel().setProperty("/showDetails", true);
        },

        /**
         * Closes the dialog.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
        */
        onConfirm: function (oEvent) {
            oEvent.getSource().getParent().close(); // The parent of the button id the dialog
        },

        /**
         * Copies the error message to the clipboard.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
         */
        onCopy: function (oEvent) {
            var oTemporaryDomElement = document.createElement("textarea");
            try {
                oTemporaryDomElement.contentEditable = true;
                oTemporaryDomElement.readonly = false;
                oTemporaryDomElement.textContent = oEvent.getSource().getModel().getProperty("/description");
                document.documentElement.appendChild(oTemporaryDomElement);

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    var oRange = document.createRange();
                    oRange.selectNodeContents(oTemporaryDomElement);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(oRange);
                    oTemporaryDomElement.setSelectionRange(0, 999999);
                } else {
                    jQuery(oTemporaryDomElement).select();
                }

                document.execCommand("copy");
                MessageToast.show(resources.i18n.getText("Message.ClipboardCopySuccess"), {
                    closeOnBrowserNavigation: false
                });
            } catch (oException) {
                MessageToast.show(resources.i18n.getText("Message.ClipboardCopyFail"), {
                    closeOnBrowserNavigation: false
                });
            } finally {
                jQuery(oTemporaryDomElement).remove();
            }
        }
    };

    /**
     * Load the fragment and open the dialog
     *
     * @param {BackendError} error The error object
     *
     * @protected
     */
    function open (error) {
        var oResponse = JSON.parse(error.responseText);

        var oModel = new JSONModel({
            message: oResponse.error.message.value,
            description: JSON.stringify(oResponse, null, 3).replace(/\{|\}/g, ""),
            statusCode: error.statusCode,
            statusText: error.statusText,
            showDetails: false
        });
        Fragment.load({
            name: "sap.ushell.applications.PageComposer.view.ErrorDialog",
            controller: oController
        }).then(function (oDialog) {
            oDialog.setModel(oModel);
            oDialog.setModel(resources.i18nModel, "i18n");
            oDialog.open();
        });
    }

    return {open: open};
});