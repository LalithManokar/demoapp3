// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/strings/formatMessage",
    "sap/ui/core/Fragment"
], function (
    formatMessage,
    Fragment
) {
    "use strict";

    return function (oView) {
        this._oView = oView;

        this.destroy = function () {
            delete this._oView;
        };

        /**
         * Loads the fragment and opens the dialog.
         *
         * @param {sap.ui.model.Model} oModel The model to set to the dialog
         * @param {function} fnResolve Function called if the dialog action is confirmed
         *
         * @protected
         */
        this.open = function (oModel, fnResolve) {
            var oThisView = this._oView;
            var oFragmentLoadOptions = {
                id: oThisView.getId(),
                name: "sap.ushell.applications.PageComposer.view.CopyDialog",
                controller: {
                    formatMessage: formatMessage,

                    /**
                     * Called after the dialog closes. Destroys the control.
                     *
                     * @private
                     */
                    onAfterClose: function () {
                        oThisView.byId("copyDialog").destroy();
                    },

                    /**
                     * Called if the cancel button is pressed
                     *
                     * @private
                     */
                    onCancel: function () {
                        oThisView.byId("copyDialog").close();
                    },

                    onConfirm: fnResolve
                }
            };
            Fragment.load(oFragmentLoadOptions).then(function (fragment) {
                fragment.setModel(oModel);
                oThisView.addDependent(fragment);
                fragment.open();
            });
        };
    };
});