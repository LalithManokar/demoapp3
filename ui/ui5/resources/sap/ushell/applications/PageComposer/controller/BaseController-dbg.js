// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ushell/applications/PageComposer/util/PagePersistence",
    "sap/ushell/applications/PageComposer/util/Transport",
    "sap/m/MessageBox",
    "sap/m/library",
    "sap/base/Log",
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (
    Controller,
    UIComponent,
    PagePersistence,
    transportHelper,
    MessageBox,
    sapMLibrary,
    Log,
    resources
) {
    "use strict";

    return Controller.extend("sap.ushell.applications.PageComposer.controller.BaseController", {
        /**
         * Instantiates the page persistence utility and returns the created instance.
         *
         * @returns {sap.ushell.applications.PageComposer.util.PagePersistence} An instance of the page persistence utility
         *
         * @protected
         */
        getPageRepository: function () {
            if (!this.oPagePersistenceInstance) {
                this.oPagePersistenceInstance = new PagePersistence(this.getView().getModel("PageRepository"));
            }
            return this.oPagePersistenceInstance;
        },

        /**
         * Convenience method for accessing the router.
         *
         * @returns {sap.ui.core.routing.Router} The router for this component.
         *
         * @protected
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         *
         * @param {string} [sName] The model name
         * @returns {sap.ui.model.Model} The model instance
         *
         * @protected
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         *
         * @param {sap.ui.model.Model} oModel The model instance
         * @param {string} [sName] The model name
         * @returns {sap.ui.mvc.View} The view instance
         *
         * @protected
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         *
         * @returns {sap.ui.model.resource.ResourceModel} The resource model of the component
         *
         * @protected
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Creates an edit dialog
         *
         * @param {function} onConfirm The confirm function
         * @param {function} onCancel Function to call when delete is cancelled
         * @returns {Promise<object>} A promise resolving to the EditPage dialog controller
         *
         * @private
         */
        _createEditDialog: function (onConfirm, onCancel) {
            var oView = this.getOwnerComponent().getRootControl();

            return new Promise(function (resolve, reject) {
                sap.ui.require(["sap/ushell/applications/PageComposer/controller/EditDialog.controller"], function (EditPageDialogController) {
                    if (!this.oEditPageDialogController) {
                        this.oEditPageDialogController = new EditPageDialogController(oView);
                    }
                    this.oEditPageDialogController.attachCancel(onCancel);
                    this.oEditPageDialogController.attachConfirm(onConfirm);
                    this.oEditPageDialogController.load().then(function () {
                        resolve(this.oEditPageDialogController);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        /**
         * Shows the create page dialog and enhances it with transport fields if required
         *
         * @param {function} onConfirm Function to call when create is confirmed
         * @param {function} onCancel Function to call when create is cancelled
         *
         * @protected
         */
        showCreateDialog: function (onConfirm, onCancel) {
            var oView = this.getOwnerComponent().getRootControl();
            sap.ui.require([
                "sap/ushell/applications/PageComposer/controller/CreatePageDialog.controller"
            ], function (CreatePageDialogController) {
                if (!this.oCreatePageDialogController) {
                    this.oCreatePageDialogController = new CreatePageDialogController(oView);
                }
                this.oCreatePageDialogController.attachConfirm(onConfirm);
                this.oCreatePageDialogController.attachCancel(onCancel);
                this.oCreatePageDialogController.load().then(function () {
                    if (transportHelper.isTransportSupported()) {
                        return this.getOwnerComponent().createTransportComponent().then(function (transportComponent) {
                            return transportHelper.enhanceDialogWithTransport(
                                this.oCreatePageDialogController,
                                transportComponent,
                                onConfirm
                            );
                        }.bind(this));
                    }

                    return this.oCreatePageDialogController;
                }.bind(this)).then(function (enhancedDialog) {
                    if (enhancedDialog) {
                        enhancedDialog.open();
                    }
                }).catch(function (error) {
                    this.oCreatePageDialogController.destroy();
                    this.handleBackendError(error);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Shows the delete page dialog
         *
         * @param {function} onConfirm Function to call when delete is confirmed
         * @param {function} onCancel Function to call when delete is cancelled
         *
         * @returns {Promise<object>} A promise resolving to the delete dialog controller
         *
         * @private
         */
        _createDeleteDialog: function (onConfirm, onCancel) {
            var oView = this.getOwnerComponent().getRootControl();

            return new Promise(function (resolve, reject) {
                sap.ui.require(["sap/ushell/applications/PageComposer/controller/DeleteDialog.controller"], function (DeleteDialogController) {
                    if (!this.oDeletePageDialogController) {
                        this.oDeletePageDialogController = new DeleteDialogController(oView);
                    }
                    this.oDeletePageDialogController.attachCancel(onCancel);
                    this.oDeletePageDialogController.attachConfirm(onConfirm);
                    this.oDeletePageDialogController.load().then(function () {
                        resolve(this.oDeletePageDialogController);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        /**
         * Checks if the edit dialog should be shown and creates the dialog if required
         *
         * @param {object} page The page to edit
         * @param {function} onConfirm The confirm function
         * @param {function} onCancel Function to call when delete is cancelled
         *
         * @protected
         */
        checkShowEditDialog: function (page, onConfirm, onCancel) {
            transportHelper.checkShowTransport(page).then(function (showTransport) {
                if (showTransport) {
                    return Promise.all([
                        this.getOwnerComponent().createTransportComponent(page.metadata.devclass),
                        this._createEditDialog(onConfirm, onCancel)
                    ]).then(function (result) {
                        var oTransportComponent = result[0];
                        var oDialog = result[1];
                        oDialog.getModel().setProperty("/message", resources.i18n.getText("EditDialog.TransportRequired"));
                        var oEnhancedDialog = transportHelper.enhanceDialogWithTransport(oDialog, oTransportComponent, onConfirm);
                        oEnhancedDialog.open();
                    });
                }

                return transportHelper.checkShowLocked(page).then(function (transportInformation) {
                    if (transportInformation) {
                        return this.showMessageBoxError(resources.i18n.getText(
                            "EditDialog.LockedText",
                            [transportInformation.foreignOwner]
                        ), true);
                    }
                }.bind(this));
            }.bind(this)).catch(function (error) {
                this.handleBackendError(error);
            }.bind(this));
        },

        /**
         * Checks if the delete dialog should be shown and creates the dialog if required
         *
         * @param {object} page The page object
         * @param {function} [onConfirm] The confirm function handler
         * @param {function} [onCancel] The cancel function handler
         * @protected
         */
        checkShowDeleteDialog: function (page, onConfirm, onCancel) {
            transportHelper.checkShowTransport(page).then(function (showTransport) {
                if (showTransport) {
                    return Promise.all([
                        this.getOwnerComponent().createTransportComponent(page.metadata.devclass),
                        this._createDeleteDialog(onConfirm, onCancel)
                    ]).then(function (result) {
                        var oTransportComponent = result[0];
                        var oDialog = result[1];
                        oDialog.getModel().setProperty("/message", resources.i18n.getText("DeleteDialog.TransportRequired"));
                        var oEnhancedDialog = transportHelper.enhanceDialogWithTransport(oDialog, oTransportComponent, onConfirm);
                        oEnhancedDialog.open();
                    });
                }

                return transportHelper.checkShowLocked(page).then(function (transportInformation) {
                    if (transportInformation) {
                        return this.showMessageBoxError(resources.i18n.getText(
                            "DeleteDialog.LockedText",
                            [transportInformation.foreignOwner]
                        ), true);
                    }

                    return this._createDeleteDialog(onConfirm, onCancel).then(function (oDialog) {
                        oDialog.getModel().setProperty("/message", resources.i18n.getText("DeleteDialog.Text"));
                        oDialog.open();
                    });
                }.bind(this));
            }.bind(this)).catch(function (error) {
                this.handleBackendError(error);
            }.bind(this));
        },

        /**
         * Displays a MessageBox with an error message
         *
         * @param {string} sErrorMsg The error message
         * @param {boolean} [bNavToPageOverview] Indicates whether to navigate to the page overview after close
         *
         * @protected
         */
        showMessageBoxError: function (sErrorMsg, bNavToPageOverview) {
            if (bNavToPageOverview) {
                MessageBox.error(sErrorMsg, {onClose: function () {
                    this.navigateToPageOverview();
                }.bind(this)});
            } else {
                MessageBox.error(sErrorMsg);
            }
        },

        /**
         * Navigates to the pageOverview page
         *
         * @protected
         */
        navigateToPageOverview: function () {
            this.getRouter().navTo("overview");
        },

        /**
         * Navigates to the preview mode of the page
         *
         * @param {string} sPageId The ID of the page to preview
         *
         * @protected
         */
        preview: function (sPageId) {
            if (sap.ushell.Container.getDirtyFlag()) {
                this.showMessageBoxError(this.getResourceBundle().getText("Message.SaveChanges"));
            } else {
                var oUrlParsing = sap.ushell.Container.getService("URLParsing");

                var oParams = oUrlParsing.parseParameters(window.location.search);
                oParams["sap-ushell-xx-overwrite-config"] = ["ushell/pages/enable:true"];
                oParams["sap-ushell-page"] = [sPageId];

                var sParams = oUrlParsing.paramsToString(oParams);
                var sPreviewUrl = window.location.pathname + "?" + sParams;

                sapMLibrary.URLHelper.redirect(sPreviewUrl, true);
            }
        },

        /**
         * Called if a backend error needs to be handled
         *
         * @param {object} oError The error object
         *
         * @protected
         */
        handleBackendError: function (oError) {
            if (oError.responseText) {
                this.getOwnerComponent().showErrorDialog(oError);
            } else {
                Log.error(oError);
            }
        }
    });
});