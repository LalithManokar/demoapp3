// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/strings/formatMessage",
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (
    formatMessage,
    BaseController,
    Fragment,
    resources
) {
    "use strict";

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.BaseDialog.controller", {
        /**
         * Destroys the control
         * @protected
         */
        destroy: function () {
            if (this._oView.byId(this.sViewId)) {
                this._oView.byId(this.sViewId).destroy();
            }
        },
        /**
         * Closes the dialog
         * @protected
         */
        onCancel: function () {
            this._oView.byId(this.sViewId).close();

            if (this._fnCancel) {
                this._fnCancel();
            }
        },

        /**
         * Attaches a confirm function which is called when dialog confirm button is pressed
         *
         * @param {function} confirm The confirm function
         * @protected
         */
        attachConfirm: function (confirm) {
            this._fnConfirm = confirm;
        },

        /**
         * Called when the user presses the confirm button.
         * Calls the attached confirm function if there is one.
         *
         * @param {sap.ui.base.Event} event The press event
         * @protected
         */
        onConfirm: function (event) {
            if (this._fnConfirm) {
                this._fnConfirm(event);
            }
        },

        /**
         * Returns the model of this dialog instance
         *
         * @returns {sap.ui.model.json.JSONModel} The JSONModel
         * @protected
         */
        getModel: function () {
            return this._oModel;
        },

        /**
         * Returns true if all values of the given object are truthy
         *
         * @param {object} validation The object containing the validation keys
         * @param {boolean} validation.id Whether the ID is valid
         * @param {boolean} validation.title Whether the title is valid
         *
         * @returns {boolean} The validation result
         * @private
         */
        validate: function (validation) {
            for (var i in validation) {
                if (!validation[i]) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Attaches a cancel function which is called when dialog cancel button is pressed
         *
         * @param {function} cancel The cancel function
         * @protected
         */
        attachCancel: function (cancel) {
            this._fnCancel = cancel;
        },

        /**
         * Inserts the given component into the ComponentContainer control with id "transportContainer"
         *
         * @param {object} component The component to insert
         * @protected
         */
        transportExtensionPoint: function (component) {
            this._oView.byId("transportContainer").setComponent(component);
        },

        /**
         * Loads the dialog fragment without displaying it
         *
         * @returns {Promise<void>} Promise resolving when the fragment is loaded
         * @protected
         */
        load: function () {
            var oFragmentLoadOptions = {
                id: this._oView.getId(),
                name: this.sId,
                controller: this
            };

            return Fragment.load(oFragmentLoadOptions).then(function (fragment) {
                fragment.setModel(this._oModel);
                fragment.setModel(resources.i18nModel, "i18n");
            }.bind(this));
        },

        /**
         * Shows the dialog
         * @protected
         */
        open: function () {
            var oDialog = this._oView.byId(this.sViewId);
            this._oView.addDependent(oDialog);

            oDialog.open();
        }
    });
});