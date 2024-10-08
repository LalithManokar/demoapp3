// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ushell/applications/PageComposer/controller/BaseDialog.controller",
    "sap/ushell/applications/PageComposer/i18n/resources",
    "sap/base/util/merge",
    "sap/ui/core/Fragment",
    "sap/ui/core/library"
], function (JSONModel, BaseDialogController, resources, merge, Fragment, coreLibrary) {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.CreatePageDialog", {
        constructor: function (oView) {
            this._oView = oView;
            this._oModel = new JSONModel({
                validation: {
                    id: false,
                    title: false
                }
            });

            this.sViewId = "createPageDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.CreatePageDialog";
        },

        /**
         * Pre-filter packages by the ID namespace
         *
         * @param {string} sId The entered PageId
         * @param {boolean} bFetchSuggestionOnly Whether to only fetch suggestions or also set the value to the package input
         */
        handlePackageNamespaceChange: function (sId, bFetchSuggestionOnly) {
            var oTransportContainer = this._oView.byId("transportContainer");
            var oTransportComponent = oTransportContainer.getComponentInstance();
            var oPackageInput = oTransportComponent && oTransportComponent.getRootControl().byId("packageInput");
            if (oPackageInput && !oPackageInput.getValue().length) {
                var sPackageNamespace = sId.split("/"); sPackageNamespace.pop(); sPackageNamespace = sPackageNamespace.join("/");
                if (sPackageNamespace) {
                    if (bFetchSuggestionOnly) {
                        oPackageInput.fireLiveChange({ value: sPackageNamespace });
                    } else {
                        oPackageInput.setValue(sPackageNamespace);
                        oPackageInput.fireChange({ value: sPackageNamespace });
                    }
                }
            }
        },

        /**
         * Called if the save button is clicked
         * Retrieves all values and calls the confirm handler if set
         *
         * @private
         */
        onConfirm: function () {
            var oModel = this.getModel();

            var oResolvedResult = {
                content: {
                    id: oModel.getProperty("/id"),
                    title: oModel.getProperty("/title")
                },
                metadata: {}
            };

            if (this._fnConfirm) {
                this._fnConfirm(oResolvedResult);
            }
        },

        /**
         * Resets all fields to their initial values. If there are other values in the validation path, keep them.
         *
         * @param {sap.ui.model.json.JSONModel} oModel The JSONModel instance to reset
         *
         * @private
         */
        _resetModel: function (oModel) {
            oModel.setProperty("/id", "");
            oModel.setProperty("/title", "");
            var oValidation = merge({}, oModel.getProperty("/validation"), {
                id: false,
                title: false
            });
            oModel.setProperty("/validation", oValidation);
        },

        /**
         * Called before the CreatePageDialog opens.
         * Creates the validation model.
         *
         * @private
         */
        onBeforeOpen: function () {
            var oFragment = this._oView.byId("createPageDialog");
            sap.ui.getCore().getMessageManager().registerObject(oFragment, true);
            oFragment.setModel(resources.i18nModel, "i18n");
            this._resetModel(oFragment.getModel());
        },

        /**
         * Called on the change of the ID.
         *
         * @param {sap.ui.base.Event} oEvent The change event
         *
         * @private
         */
        onIdChange: function (oEvent) {
            var sNewId = oEvent.getParameters().value;
            this.handlePackageNamespaceChange(sNewId, false);
        },

        /**
         * Called on the live change of the ID
         *
         * @param {sap.ui.base.Event} oEvent The change event
         *
         * @private
         */
        onIdLiveChange: function (oEvent) {
            var oInput = oEvent.getSource(),
                oModel = this.getModel(),
                sInputValue = oInput.getValue(),
                bIsValid = this._isValidID(sInputValue),
                oValidation = merge({}, oModel.getProperty("/validation"), { id: bIsValid }),
                sValueState = bIsValid ? ValueState.None : ValueState.Error;
            oModel.setProperty("/validation", oValidation);
            oInput.setValueState(sValueState);
            if (sInputValue.length > 0) {
                oInput.setValueStateText(resources.i18n.getText("Message.InvalidPageID"));
            } else {
                oInput.setValueStateText(resources.i18n.getText("Message.EmptyPageID"));
            }
            this.handlePackageNamespaceChange(sInputValue, true);
        },

        /**
         * Called on the live change of the title
         *
         * @param {sap.ui.base.Event} oEvent The change event
         *
         * @private
         */
        onTitleLiveChange: function (oEvent) {
            var oInput = oEvent.getSource(),
                oModel = this.getModel(),
                sInputValue = oInput.getValue(),
                bIsValid = this._isValidTitle(sInputValue),
                oValidation = merge({}, oModel.getProperty("/validation"), { title: bIsValid }),
                sValueState = bIsValid ? ValueState.None : ValueState.Error;
            oModel.setProperty("/validation", oValidation);
            oInput.setValueState(sValueState);
        },

        /**
         * Returns true if the entered id is valid
         *
         * @param {string} id The given ID
         * @returns {boolean} The boolean result
         *
         * @private
         */
        _isValidID: function (id) {
            return /^[\w/]{1,35}$/g.test(id);
        },

        /**
         * Returns true if the entered title is valid
         *
         * @param {string} title The given title
         * @returns {boolean} The boolean result
         *
         * @private
         */
        _isValidTitle: function (title) {
            return /^.{1,100}$/g.test(title);
        }
    });
});
