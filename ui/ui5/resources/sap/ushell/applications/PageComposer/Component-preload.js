//@ui5-bundle Component-preload.js
sap.ui.require.preload({
	"sap/ushell/applications/PageComposer/Component.js":function(){//${copyright}

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
},
	"sap/ushell/applications/PageComposer/controller/App.controller.js":function(){// ${copyright}
sap.ui.define([
    "sap/ushell/applications/PageComposer/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.App", {});
});
},
	"sap/ushell/applications/PageComposer/controller/BaseController.js":function(){// ${copyright}
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
},
	"sap/ushell/applications/PageComposer/controller/BaseDialog.controller.js":function(){// ${copyright}

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
},
	"sap/ushell/applications/PageComposer/controller/CopyDialog.js":function(){// ${copyright}

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
},
	"sap/ushell/applications/PageComposer/controller/CreatePageDialog.controller.js":function(){// ${copyright}

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
},
	"sap/ushell/applications/PageComposer/controller/DeleteDialog.controller.js":function(){// ${copyright}

sap.ui.define([
    "sap/base/strings/formatMessage",
    "sap/ushell/applications/PageComposer/controller/BaseDialog.controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (
    formatMessage,
    BaseDialogController,
    Fragment,
    JSONModel
) {
    "use strict";

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.DeleteDialog.controller", {
        constructor: function (oView) {
            this._oView = oView;
            this._createOrResetModel();

            this.sViewId = "deleteDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.DeleteDialog";
        },
        /**
         * Create model or reset if it doesn't exist.
         *
         * @private
         */
        _createOrResetModel: function () {
            if (!this._oModel) {
                this._oModel = new JSONModel();
            }
            this._oModel.setData({
                title: "",
                message: "",
                validation: {}
            });
        },
        /**
         * Destroys the control
         *
         * @private
         */
        destroy: function () {
            this._createOrResetModel();
            BaseDialogController.prototype.destroy.apply(this, arguments);
        }
    });
});
},
	"sap/ushell/applications/PageComposer/controller/EditDialog.controller.js":function(){// ${copyright}

sap.ui.define([
    "sap/base/strings/formatMessage",
    "sap/ushell/applications/PageComposer/controller/BaseDialog.controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (
    formatMessage,
    BaseDialogController,
    Fragment,
    JSONModel
) {
    "use strict";

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.EditDialog.controller", {
        constructor: function (oView) {
            this._oView = oView;
            this._oModel = new JSONModel({
                title: "",
                message: "",
                validation: {}
            });

            this.sViewId = "editDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.EditDialog";
        },

        /**
         * Called if the delete dialog is confirmed
         * Close the dialog
         * @protected
         */
        onConfirm: function () {
            this._oView.byId("editDialog").close();
            BaseDialogController.prototype.onConfirm.apply(this, arguments);
        }
    });
});
},
	"sap/ushell/applications/PageComposer/controller/ErrorDialog.js":function(){// ${copyright}

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
},
	"sap/ushell/applications/PageComposer/controller/Page.js":function(){// ${copyright}

sap.ui.define([
    "sap/base/util/isEmptyObject",
    "sap/ui/model/json/JSONModel",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/NumericContent",
    "sap/m/TileContent",
    "sap/ushell/Config"
], function (
    isEmptyObject,
    JSONModel,
    GenericTile,
    ImageContent,
    NumericContent,
    TileContent,
    Config
) {
    "use strict";

    /**
     * @typedef {object} GroupError An error that occured in a group
     * @property {string} type The error type
     * @property {string} title The title of the error
     * @property {string} subtitle The subtitle of the error
     * @property {string} description The description of the error
     */

    var oMainController,
        oPage,
        resources = {};

    var oViewSettingsModel = new JSONModel({
        sizeBehavior: Config.last("/core/home/sizeBehavior")
    });

    var _aDoableObject = Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
        oViewSettingsModel.setProperty("/sizeBehavior", sSizeBehavior);
    });

    /**
     * Returns the model relevant indicies from the given widget
     *
     * @param {sap.ui.core.Control} oWidget The widget that is inside of a model.
     * @return {object} The relevant indicies of the model
     * @private
     */
    function _getModelDataFromWidget (oWidget) {
        var aPath = oWidget.getBindingContext().getPath().split("/"),
            iWidgetIndex = aPath.pop();

        aPath.pop();
        return {
            widgetIndex: iWidgetIndex,
            groupIndex: aPath.pop()
        };
    }

    return {
        /**
         * Initializes the Page fragment logic
         *
         * @param {sap.ui.core.mvc.Controller} oController The controller that uses the Page fragment
         *
         * @protected
         */
        init: function (oController) {
            oMainController = oController;

            oPage = oController.getView().byId("page");
            oPage.setModel(oController.getModel());
            oPage.setModel(oViewSettingsModel, "viewSettings");

            resources.i18n = oController.getResourceBundle();

            var bEdit = oController.getModel().getProperty("/edit");
            oPage.toggleStyleClass("sapUshellPageComposing", !!bEdit);
        },

        exit: function () {
            _aDoableObject.off();
        },

        /**
         * Creates the content inside of the GridContainers
         *
         * @param {string} sId The ID of the content
         * @param {sap.ui.model.Context} oContext The data for the specific content
         * @returns {sap.m.GenericTile} A control that is a content of the GridContainer
         *
         * @private
         */
        itemFactory: function (sId, oContext) {
            var oContextData = oContext.getProperty(oContext.sPath),
                oCatalogTile = oMainController.mCatalogTiles[oContextData.vizId],
                oControl;

            if (oCatalogTile) {
                var oLPService = sap.ushell.Container.getService("LaunchPage");
                var sHeader = oLPService.getCatalogTilePreviewTitle(oCatalogTile) || oLPService.getCatalogTileTitle(oCatalogTile);
                var sSubheader = oLPService.getCatalogTilePreviewSubtitle(oCatalogTile);
                var sFooter = oLPService.getCatalogTilePreviewInfo(oCatalogTile);
                var sIcon = oLPService.getCatalogTilePreviewIcon(oCatalogTile);
                var bShowCount;
                var oContentControl;

                // TBD: The following content definition logic is a temporary solution
                // until the corresponding API is provided by the service:
                if (oCatalogTile.getChip) { // ABAP
                    bShowCount = oCatalogTile.getChip().getBaseChipId() === "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER";
                } else if (oCatalogTile.tileResolutionResult) { // CDM
                    bShowCount = !!oCatalogTile.tileResolutionResult.indicatorDataSource;
                } else { // Local
                    bShowCount = oCatalogTile.tileType === "sap.ushell.ui.tile.DynamicTile";
                }

                if (bShowCount) {
                    oContentControl = new NumericContent({ // Dynamic Tile
                        icon: sIcon,
                        value: "0",
                        width: "100%"
                    });
                } else {
                    oContentControl = new ImageContent({ // Static Tile
                        src: sIcon
                    });
                }

                oControl = new GenericTile(sId, {
                    header: sHeader,
                    subheader: sSubheader,
                    tileContent: [new TileContent({
                        footer: sFooter,
                        content: [oContentControl]
                    })]
                });

                if (oContextData.error) {
                    oControl.setState("Failed");
                }
            } else if (!isEmptyObject(oMainController.mCatalogTiles)) {
                oControl = new GenericTile(sId, { state: "Failed" });
            } else {
                oControl = new GenericTile(sId, { state: "Loading" });
            }

            oControl.attachPress(function (oEvent) {
                if (oEvent.getParameter("action") === "Remove") {
                    var oContent = oEvent.getSource(),
                        oWidgetModelData = _getModelDataFromWidget(oContent);

                    oMainController.deleteContentInGroup(oWidgetModelData.widgetIndex, oWidgetModelData.groupIndex);
                }
            });

            // sizeBehavior for tiles: Small/Responsive
            oControl.bindProperty("sizeBehavior", "viewSettings>/sizeBehavior");
            oControl.setScope(oMainController.getModel().getProperty("/edit") ? "Actions" : "Display");

            return oControl;
        },

        /**
         * Collects all errors that occured in the groups.
         *
         * @returns {GroupError[]} A collection of errors that occured in the groups.
         *
         * @protected
         */
        collectErrors: function () {
            var aErrors = [];

            oPage.getGroups().forEach(function (oGroup, iGroupIndex) {

                var oGroupTitle = oGroup.byId("title-edit");
                if (oGroup.getTitle() === "") {
                    oGroupTitle.setValueState("Warning");
                    oGroupTitle.setValueStateText(resources.i18n.getText("Message.InvalidGroupTitle"));
                    aErrors.push({
                        type: "Warning",
                        title: resources.i18n.getText("Title.NoGroupTitle", iGroupIndex + 1),
                        description: resources.i18n.getText("Message.NoGroupTitle", iGroupIndex + 1)
                    });
                } else {
                    oGroupTitle.setValueState("None");
                }

                oGroup.getWidgets().forEach(function (oTile, iTileIndex) {
                    if (oTile.getState() === "Failed") {
                        if (oTile.getHeader() === "" && oTile.getSubheader() === "") {
                            aErrors.push({
                                type: "Error",
                                title: resources.i18n.getText("Title.UnsufficientRoles"),
                                subtitle: resources.i18n.getText("Title.ContentIsNotVisible"),
                                description: resources.i18n.getText("Message.LoadTileError", [(iTileIndex + 1) + ".", oGroup.getTitle()])
                            });
                        } else {
                            aErrors.push({
                                type: "Warning",
                                title: resources.i18n.getText("Message.NavigationTargetError"),
                                subtitle: resources.i18n.getText("Title.ContentNotNavigateable"),
                                description: resources.i18n.getText("Message.NavTargetResolutionError", oTile.getHeader())
                            });
                        }
                    }
                });
            });

            return aErrors;
        },

        /**
         * Adds a new Group to the Page.
         *
         * @param {sap.ui.base.Event} [oEvent] The event data. If not given, group is added at the first position.
         *
         * @protected
         */
        addGroup: function (oEvent) {
            var iGroupIndex = oEvent ? oEvent.getParameter("index") : 0;

            oMainController.addGroupAt(iGroupIndex);
        },

        /**
         * Deletes a Group from the Page
         *
         * @param {sap.ui.base.Event} oEvent contains event data
         *
         * @private
         */
        deleteGroup: function (oEvent) {
            var oGroup = oEvent.getSource();

            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                function deleteGroup (oAction) {
                    if (oAction === MessageBox.Action.DELETE) {
                        oMainController.deleteGroup(oPage.indexOfGroup(oGroup));
                    }
                }

                sap.ushell.Container.getService("Message").confirm(
                    resources.i18n.getText("Message.DeleteGroup", oGroup.getTitle()),
                    deleteGroup,
                    resources.i18n.getText("Button.Delete"),
                    [
                        MessageBox.Action.DELETE,
                        MessageBox.Action.CANCEL
                    ]
                );
            });
        },

        /**
         * Moves a group inside of the Page
         *
         * @param {object} oInfo Drag and drop event data
         * @private
         */
        moveGroup: function (oInfo) {
            var oDragged = oInfo.getParameter("draggedControl"),
                oDropped = oInfo.getParameter("droppedControl"),
                sInsertPosition = oInfo.getParameter("dropPosition"),
                iDragPosition = oPage.indexOfGroup(oDragged),
                iDropPosition = oPage.indexOfGroup(oDropped);

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
            }

            oMainController.moveGroup(iDragPosition, iDropPosition);
        },

        /**
         * Moves a content inside or between different groups.
         *
         * @param {object} oDropInfo Drag and drop event data
         *
         * @private
         */
        moveContent: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                sInsertPosition = oDropInfo.getParameter("dropPosition"),
                oDroppedModelData = _getModelDataFromWidget(oDropped),
                iDropContentPosition = oDroppedModelData.widgetIndex,
                iDropGroupPosition = oDroppedModelData.groupIndex;

            if (oDragged.isA("sap.m.CustomTreeItem")) {
                var fnDragSessionCallback = oDropInfo.getParameter("dragSession").getComplexData("callback");
                if (sInsertPosition === "After") {
                    iDropContentPosition++;
                }
                fnDragSessionCallback(iDropContentPosition, iDropGroupPosition);
                return;
            }
            var oDraggedModelData = _getModelDataFromWidget(oDragged),
                iDragContentPosition = oDraggedModelData.widgetIndex,
                iDragGroupPosition = oDraggedModelData.groupIndex;

            if (iDragGroupPosition === iDropGroupPosition) {
                if (sInsertPosition === "After") {
                    if (iDropContentPosition < iDragContentPosition) {
                        iDropContentPosition++;
                    }
                } else if (iDropContentPosition > iDragContentPosition) {
                    iDropContentPosition--;
                }
            } else if (sInsertPosition === "After") {
                iDropContentPosition++;
            }

            oMainController.moveContentInGroup(iDragContentPosition, iDropContentPosition, iDragGroupPosition, iDropGroupPosition);
        },

        /**
         * Adds content to a group in the Page.
         *
         * @param {object} oDropInfo Drag and drop event data
         *
         * @private
         */
        addContent: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                iDropContentPosition = oDropped.getWidgets().length,
                iDropGroupPosition = oPage.indexOfGroup(oDropped);

            if (oDragged.isA("sap.m.CustomTreeItem")) {
                oDropInfo.getParameter("dragSession").getComplexData("callback")(iDropContentPosition, iDropGroupPosition);
                return;
            }

            var oDraggedModelData = _getModelDataFromWidget(oDragged),
                iDragContentPosition = oDraggedModelData.widgetIndex,
                iDragGroupPosition = oDraggedModelData.groupIndex;

            oMainController.moveContentInGroup(iDragContentPosition, iDropContentPosition, iDragGroupPosition, iDropGroupPosition);
        }
    };
});
},
	"sap/ushell/applications/PageComposer/controller/PageDetail.controller.js":function(){// ${copyright}

sap.ui.define([
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/ushell/applications/PageComposer/controller/Page",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/base/Log",
    "sap/base/strings/formatMessage"
], function (
    BaseController,
    Page,
    JSONModel,
    MessageToast,
    Log,
    formatMessage
) {
    "use strict";

    /**
     * @typedef {object} ContentCatalogs Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalog tiles
     * @property {string} catalogTitles The catalog titles
     * @property {string} catalogTiles The catalog tiles in a catalog
     * @property {string} mCatalogTiles A map from vizId to tile
     */

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.PageDetail", {
        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onPageMatched, this);

            this.oCopyDialogModel = new JSONModel({
                page: null,
                approvalText: ""
            });

            this.setModel(new JSONModel({
                page: {},
                editMode: false
            }));

            this.Page.init(this);
        },
        /**
         * Called when page detail view is exited.
         *
         * @private
         */
        onExit: function () {
            this.Page.exit();
        },

        mCatalogTiles: {},
        Page: Page,
        formatMessage: formatMessage,

        /**
         * Called if the route matched the pattern for viewing a page.
         * Loads the page with the id given in the URL parameter
         *
         * @param {sap.ui.base.Event} event The routing event
         *
         * @private
         */
        _onPageMatched: function (event) {
            var sPageId = event.getParameter("arguments").pageId;

            this._loadPage(decodeURIComponent(sPageId)).then(function (oPage) {
                this.getModel().setProperty("/page", oPage);

                this.Page.init(this);
                this._fetchCatalogInfo().then(function (catalogInfo) {
                    this.mCatalogTiles = catalogInfo.mCatalogTiles;
                    this.getModel().updateBindings(true);
                }.bind(this));
            }.bind(this), function (sErrorMsg) {
                this.showMessageBoxError(sErrorMsg, true);
            }.bind(this));
        },

        /**
         * Loads the page with the given pageId from the PagePersistence
         *
         * @param {string} pageId The pageId to load
         * @returns {Promise<object>} A promise resolving to the page
         *
         * @private
         */
        _loadPage: function (pageId) {
            return this.getPageRepository().getPage(pageId);
        },

        /**
         * Navigates to the page detail page
         *
         * @param {string} pageId The pageId to navigate to
         *
         * @private
         */
        _navigateToEdit: function (pageId) {
            this.getRouter().navTo("edit", {
                pageId: encodeURIComponent(pageId)
            });
        },

        /**
         * Called if the delete action has been cancelled
         *
         * @private
         */
        onDeleteCancel: function () {
            var oDialog = this.byId("deleteDialog");
            oDialog.close();
        },

        /**
         * Called if the delete action has been confirmed
         *
         * @param {sap.ui.base.Event} oEvent The deletePage event
         * @returns {Promise<void>} A promise resolving when the page has been deleted
         *
         * @private
         */
        _deletePage: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var sTransportId = oEvent.metadata && oEvent.metadata.transportId || "";
            var sPageToDeleteId = this.getModel().getProperty("/page/content/id");
            var sSuccessMsg = this.getResourceBundle().getText("Message.SuccessDeletePage");

            return this.getPageRepository().deletePage(sPageToDeleteId, sTransportId)
                .then(function () {
                    this.navigateToPageOverview();
                    MessageToast.show(sSuccessMsg, {
                        closeOnBrowserNavigation: false
                    });
                    oDialog.close();
                }.bind(this))
                .catch(this.handleBackendError.bind(this));
        },

        /**
         * Copies a page
         *
         * @private
         */
        _copyPage: function () {
            //@TODO: implement
            // var oDialog = oEvent.getSource().getParent();
        },

        /**
         * Called if the Edit button is clicked.
         * Loads the edit route
         *
         * @private
         */
        onEdit: function () {
            this._navigateToEdit(this.getModel().getProperty("/page/content/id"));
        },

        /**
         * Called if the delete button is clicked
         * Shows the Delete Dialog
         *
         * @private
         */
        onDelete: function () {
            var oPage = this.getModel().getProperty("/page");
            this.checkShowDeleteDialog(oPage, this._deletePage.bind(this));
        },

        /**
         * Called if the copy button is clicked
         *
         * @private
         */
        onCopy: function () {
            var oPage = this.getModel().getProperty("/page");
            var sApprovalText = this.getResourceBundle().getText("CopyDialog.Message", [oPage.content.id, oPage.content.title]);
            this.oCopyDialogModel.setProperty("/page", oPage);
            this.oCopyDialogModel.setProperty("/approvalText", sApprovalText);
            this.getOwnerComponent().showCopyDialog(this.oCopyDialogModel, this._copyPage.bind(this));
        },

        /**
         * Fetches the catalog information.
         *
         * @returns {ContentCatalogs} Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalogtiles
         *
         * @private
         */
        _fetchCatalogInfo: function () {
            return sap.ushell.Container.getServiceAsync("LaunchPage").then(function (launchPageService) {
                return launchPageService.getCatalogs().then(function (aCatalogs) {
                    var aCatalogTitles = aCatalogs.map(function (oCatalog) {
                        var sCatalogId = launchPageService.getCatalogId(oCatalog) || "";
                        return launchPageService.getCatalogTitle(oCatalog) || sCatalogId.split(":").slice(1).join(":");
                    });

                    // CDM catalogs do not have the tiles[] array, get the tiles in a separate call
                    return Promise.all(aCatalogs.map(function (oCatalog) {
                        return launchPageService.getCatalogTiles(oCatalog);
                    })).then(function (catalogTiles) {
                        var mVizIdToCatalogTiles = {};
                        for (var i = 0; i < catalogTiles.length; i++) {
                            for (var j = 0; j < catalogTiles[i].length; j++) {
                                mVizIdToCatalogTiles[launchPageService.getCatalogTileId(catalogTiles[i][j])] = catalogTiles[i][j];
                            }
                        }

                        return {
                            catalogTitles: aCatalogTitles,
                            catalogTiles: catalogTiles,
                            mCatalogTiles: mVizIdToCatalogTiles
                        };
                    });
                });
            });
        }
    });
});
},
	"sap/ushell/applications/PageComposer/controller/PageDetailEdit.controller.js":function(){// ${copyright}

sap.ui.define([
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/ushell/applications/PageComposer/controller/Page",
    "sap/ushell/applications/PageComposer/controller/TileSelector",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/MessageToast"
], function (
    MessagePopover,
    MessageItem,
    BaseController,
    Page,
    TileSelector,
    JSONModel,
    MessageBox,
    coreLibrary,
    MessageToast
) {
    "use strict";

    /**
     * @typedef {object} ContentCatalogs Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalog tiles
     * @property {string} catalogTitles The catalog titles
     * @property {string} catalogTiles The catalog tiles in a catalog
     * @property {string} mCatalogTiles A map from vizId to tile
     */

    var oModel = new JSONModel();
    var resources = {};
    /**
     * Convenience method to initialize the page model
     *
     * @param {object} model Page model to be initialized
     * @property {object} model.page Page of the model
     * @property {boolean} model.edit Wheter the page is in edit mode
     * @property {array} model.errors The errors on the page
     * @property {number} model.errorslength The number of errors on the page
     * @property {boolean} model.headerExpanded Wheter the page header is expanded
     *
     * @private
     */
    function _initModel (model) {
        model.setData({
            page: {},
            edit: true,
            errors: [],
            errorslength: 0,
            headerExpanded: true
        });
    }

    //JSONModel change event does not work properly
    oModel.setProperty = function (sPath) {
        if (sPath.indexOf("/page") === 0 && !jQuery.isEmptyObject(oModel.getProperty("/page"))) {
            sap.ushell.Container.setDirtyFlag(true);
        }
        JSONModel.prototype.setProperty.apply(this, arguments);
    };


    return BaseController.extend("sap.ushell.applications.PageComposer.controller.PageDetailEdit", {
        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("edit").attachPatternMatched(this._onPageMatched, this);
            this.setModel(oModel);
            resources.i18n = this.getResourceBundle();

            this.Page.init(this);
            this.TileSelector.init(this);
            this.TileSelector.setAddTileHandler(this._addContentToGroup.bind(this));
        },

        /**
         * Called when page detail view is exited.
         *
         * @private
         */
        onExit: function () {
            this.Page.exit();
        },

        mCatalogTiles: {},
        Page: Page,
        TileSelector: new TileSelector(),
        oMessagePopover: new MessagePopover({
            items: {
                path: "/errors",
                template: new MessageItem({
                    type: "{type}",
                    title: "{title}",
                    activeTitle: "{active}",
                    description: "{description}",
                    subtitle: "{subtitle}",
                    counter: "{counter}"
                })
            }
        }).setModel(oModel),

        /**
         * Handles the message popover press in the footer bar.
         *
         * @param {sap.ui.base.Event} oEvent The press event.
         *
         * @private
         */
        handleMessagePopoverPress: function (oEvent) {
            this.oMessagePopover.toggle(oEvent.getSource());
        },

        /**
         * Called if the show/hide catalogs button is called.
         * Used to show or hide the side content.
         *
         * @private
         */
        onUpdateSideContentVisibility: function () {
            var oPageDesigner = this.getView().byId("layoutContent");
            oPageDesigner.setShowSideContent(!oPageDesigner.isSideContentVisible());
        },

        /**
         * Called if the title is changed
         * If the title is empty, the valueState changes to ERROR
         *
         * @param {sap.ui.base.Event} oEvent The change event
         *
         * @private
         */
        onTitleChange: function (oEvent) {
            var oInput = oEvent.getSource();
            oInput.setValueStateText(resources.i18n.getText("Message.EmptyTitle"));

            if (!oInput.getValue()) {
                oInput.setValueState(coreLibrary.ValueState.Error);
            } else {
                oInput.setValueState(coreLibrary.ValueState.None);
            }
        },

        /**
         * Called if the save button is pressed.
         * MessageToast will confirm that the changes have been successfully saved
         *
         * @private
         */
        onSave: function () {
            var fnSave = function (sClickedAction) {
                if (sClickedAction === MessageBox.Action.OK) {
                    this._savePage(oModel.getProperty("/page")).then(function () {
                        sap.ushell.Container.setDirtyFlag(false);
                        MessageToast.show(resources.i18n.getText("Message.SavedChanges"), {
                            closeOnBrowserNavigation: false
                        });
                    }, function (sErrorMsg) {
                        this.showMessageBoxError(sErrorMsg, false);
                    }.bind(this));
                }
            }.bind(this);

            if (!oModel.getProperty("/page/content/title")) {
                this.showMessageBoxError(resources.i18n.getText("Message.EmptyTitle"));
                oModel.setProperty("/headerExpanded", true);

                return;
            }

            if (!window.navigator.onLine) {
                this.showMessageBoxError(resources.i18n.getText("Message.NoInternetConnection"));

                return;
            }

            if (oModel.getProperty("/errorslength") > 0) {
                var sTitle = resources.i18n.getText("Title.TilesHaveErrors"),
                    sMessage = resources.i18n.getText("Message.TilesHaveErrors");
                sap.ushell.Container.getService("Message").confirm(sMessage, fnSave, sTitle);

                return;
            }

            fnSave(MessageBox.Action.OK);
        },

        /**
         * Called if the cancel button is pressed.
         * Navigates to the page overview without saving changes.
         *
         * @private
         */
        onCancel: function () {
            this.navigateToPageOverview();
        },

        /**
         * Set the new transportId to the page object
         *
         * @param {sap.ui.base.Event} event The object containing the metadata
         *
         * @private
         */
        _updatePageWithMetadata: function (event) {
            if (event && event.metadata && event.metadata.transportId) {
                oModel.setProperty("/page/metadata/transportId", event.metadata.transportId);
            }
        },

        /**
         * Called if the route matched the pattern for the editing of a page.
         * Loads the page with the id given in the URL parameter.
         *
         * @param {sap.ui.base.Event} event The routing event
         *
         * @private
         */
        _onPageMatched: function (event) {
            var sPageId = event.getParameter("arguments").pageId;
            _initModel(oModel);
            this._loadPage(decodeURIComponent(sPageId)).then(function (oPage) {
                oModel.setProperty("/page", oPage);
                oModel.setProperty("/edit", true);

                this.checkShowEditDialog(
                    oPage,
                    this._updatePageWithMetadata.bind(this),
                    this.navigateToPageOverview.bind(this)
                );

                this.Page.init(this);
                this._fetchCatalogInfo().then(function (catalogInfo) {
                    this.mCatalogTiles = catalogInfo.mCatalogTiles;
                    this.TileSelector.initTiles(catalogInfo);
                    oModel.updateBindings(true);
                    this._pageUpdated();
                    if (!oModel.getProperty("/page/content/sections").length) {
                        this.Page.addGroup();
                    }
                }.bind(this)).then(function () {
                    sap.ushell.Container.setDirtyFlag(false);
                }).catch(function (sErrorMsg) {
                    this.showMessageBoxError(sErrorMsg, true);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Loads the page with the given pageId from the PagePersistence.
         *
         * @param {string} pageId The pageId to load
         * @returns {Promise<object>} A promise resolving to the page
         *
         * @private
         */
        _loadPage: function (pageId) {
            return this.getPageRepository().getPage(pageId);
        },

        /**
         * Saves the page model using the PagePersistence service
         *
         * @param {object} page The page model to save
         * @returns {Promise<void>} A promise
         *
         * @private
         */
        _savePage: function (page) {
            return this.getPageRepository().updatePage(page);
        },

        /**
         * Fetches the catalog information.
         *
         * @returns {ContentCatalogs} Contains the titles of each catalog, the tiles of each catalog and a map of vizIds to catalogtiles
         *
         * @private
         */
        _fetchCatalogInfo: function () {
            return sap.ushell.Container.getServiceAsync("LaunchPage").then(function (launchPageService) {
                return launchPageService.getCatalogs().then(function (aCatalogs) {
                    var aCatalogTitles = aCatalogs.map(function (oCatalog) {
                        var sCatalogId = launchPageService.getCatalogId(oCatalog) || "";
                        return launchPageService.getCatalogTitle(oCatalog) || sCatalogId.split(":").slice(1).join(":");
                    });

                    // CDM catalogs do not have the tiles[] array, get the tiles in a separate call
                    return Promise.all(aCatalogs.map(function (oCatalog) {
                        return launchPageService.getCatalogTiles(oCatalog);
                    })).then(function (aCatalogTiles) {
                        var mVizIdToCatalogTiles = {};
                        for (var i = 0; i < aCatalogTiles.length; i++) {
                            for (var j = 0; j < aCatalogTiles[i].length; j++) {
                                mVizIdToCatalogTiles[launchPageService.getCatalogTileId(aCatalogTiles[i][j])] = aCatalogTiles[i][j];
                            }
                        }

                        return {
                            catalogTitles: aCatalogTitles,
                            catalogTiles: aCatalogTiles,
                            mCatalogTiles: mVizIdToCatalogTiles
                        };
                    });
                });
            });
        },

        /**
         * Updates the error count and sets the dirty flag.
         *
         * @private
         */
        _pageUpdated: function () {
            sap.ushell.Container.setDirtyFlag(true);

            var aErrors = this.Page.collectErrors();

            oModel.setProperty("/errors", aErrors);
            oModel.setProperty("/errorslength", aErrors.length);
        },

        /* Group - Model API */

        /**
         * Adds a group to the model at the given index.
         *
         * @param {integer} groupIndex The index of where to add the group in the array
         *
         * @protected
         */
        addGroupAt: function (groupIndex) {
            var aGroups = oModel.getProperty("/page/content/sections");

            if (!groupIndex && groupIndex !== 0) {
                groupIndex = aGroups.length;
            }
            aGroups.splice(groupIndex, 0, {
                visualizations: []
            });

            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /**
         * Handles the deletion of a group using and updating the model
         *
         * @param {integer} groupIndex The index of the group, that should be deleted
         *
         * @protected
         */
        deleteGroup: function (groupIndex) {
            if (!groupIndex && groupIndex !== 0) {
                return;
            }

            var aGroups = oModel.getProperty("/page/content/sections");
            aGroups.splice(groupIndex, 1);
            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /* Content - Model API */

        /**
         * Handles the moving of a group using and updating the model
         *
         * @param {integer} originalGroupIndex The old index of the group, that should be moved
         * @param {integer} newGroupIndex The new index of the group, that should be moved
         *
         * @protected
         */
        moveGroup: function (originalGroupIndex, newGroupIndex) {
            if (!originalGroupIndex && originalGroupIndex !== 0
                || !newGroupIndex && newGroupIndex !== 0) {
                return;
            }

            var aGroups = oModel.getProperty("/page/content/sections"),
                oGroupToBeMoved = aGroups.splice(originalGroupIndex, 1)[0];

            aGroups.splice(newGroupIndex, 0, oGroupToBeMoved);
            oModel.setProperty("/page/content/sections", aGroups);

            this._pageUpdated();
        },

        /**
         * Handles the addition of content to a group using and updating the model
         *
         * @param {object} content The content, that should be added
         * @param {number[]} groupIndices The indices of groups, the content should be added to
         * @param {integer} contentIndex The index, the content should be added at
         *
         * @private
         */
        _addContentToGroup: function (content, groupIndices, contentIndex) {
            if (!content || !groupIndices.length) {
                return;
            }

            groupIndices.forEach(function (iGroupIndex) {
                var aContent = oModel.getProperty("/page/content/sections/" + iGroupIndex + "/visualizations");

                if (!contentIndex && contentIndex !== 0) {
                    contentIndex = aContent.length;
                }

                aContent.splice(contentIndex, 0, content);

                oModel.setProperty("/page/content/sections/" + iGroupIndex + "/visualizations", aContent);

                this._pageUpdated();
            }.bind(this));
        },

        /**
         * Handles the deletion of content inside a group using and updating the model
         *
         * @param {integer} contentIndex The index of the content, that should be deleted
         * @param {integer} groupIndex The index of the group, the content is in
         *
         * @protected
         */
        deleteContentInGroup: function (contentIndex, groupIndex) {
            if (!contentIndex && contentIndex !== 0
                || !groupIndex && groupIndex !== 0) {
                return;
            }

            var aContent = oModel.getProperty("/page/content/sections/" + groupIndex + "/visualizations");
            aContent.splice(contentIndex, 1);
            oModel.setProperty("/page/content/sections/" + groupIndex + "/visualizations", aContent);

            this._pageUpdated();
        },

        /**
         * Handles the movement of content inside a group and between different groups,
         * using and updating the model
         *
         * @param {integer} originalContentIndex The old index, where the content was from
         * @param {integer} newContentIndex The new index, where the content should go
         * @param {integer} originalGroupIndex The index of the group, the content was in
         * @param {integer} newGroupIndex The index of the group, where the content should be added
         *
         * @protected
         */
        moveContentInGroup: function (originalContentIndex, newContentIndex, originalGroupIndex, newGroupIndex) {
            if (!originalContentIndex && originalContentIndex !== 0
                || !newContentIndex && newContentIndex !== 0
                || !originalGroupIndex && originalGroupIndex !== 0
                || !newGroupIndex && newGroupIndex !== 0) {
                return;
            }

            var sOriginalContentPath = "/page/content/sections/" + originalGroupIndex + "/visualizations",
                sNewContentPath = "/page/content/sections/" + newGroupIndex + "/visualizations",
                aOriginalContent = oModel.getProperty(sOriginalContentPath),
                aNewContent = oModel.getProperty(sNewContentPath),
                oContent = aOriginalContent.splice(originalContentIndex, 1);

            aNewContent.splice(newContentIndex, 0, oContent[0]);

            oModel.setProperty(sOriginalContentPath, aOriginalContent);
            oModel.setProperty(sNewContentPath, aNewContent);

            this._pageUpdated();
        }
    });
});
},
	"sap/ushell/applications/PageComposer/controller/PageOverview.controller.js":function(){//${copyright}
/**
 * @fileOverview Controller of the PageOverview fragment.
 */
sap.ui.define([
    "sap/ushell/applications/PageComposer/controller/BaseController",
    "sap/base/Log",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    BaseController,
    Log,
    MessageToast,
    JSONModel,
    Filter,
    FilterOperator
) {
    "use strict";

    /**
     * @typedef {object} ButtonStateModel The model for the button states (e.g. delete button)
     * @property {boolean} isDeleteEnabled Whether the delete button is enabled
     */

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.Main", {

        aPropertiesToFilter: ["id", "title", "description", "createdBy", "modifiedBy", "BusinessRoleId", "BusinessRole"],
        oDialogFactory: null,
        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            this.setModel(new JSONModel({busy: false, pages: []}));
            this.getRouter().getRoute("overview").attachPatternMatched(this._onPageOverviewMatched, this);
            this.setModel(this._createInitialButtonStateModel(), "buttonStates");
        },

        /**
         * Called if a list item in the pageOverview table is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
         */
        onItemPress: function (oEvent) {
            var oPage = oEvent.getParameter("listItem").getBindingContext().getObject();
            this._navigateToDetail(oPage.content.id);
        },

        /**
         * Called if the route is entered. Refreshes the model.
         *
         * @private
         */
        _onPageOverviewMatched: function () {
            this._refreshModel();
        },

        /**
         * Navigates to the page edit page.
         *
         * @param {string} pageId The pageId to navigate to
         *
         * @private
         */
        _navigateToEdit: function (pageId) {
            this.getRouter().navTo("edit", {
                pageId: encodeURIComponent(pageId)
            });
        },

        /**
         * Navigates to the page detail page
         *
         * @param {string} pageId The page ID to navigate to
         *
         * @private
         */
        _navigateToDetail: function (pageId) {
            this.getRouter().navTo("detail", {
                pageId: encodeURIComponent(pageId)
            });
        },

        /**
         * Called if a list item in the pageOverview table is selected
         * Sets the state of the Delete button to enabled.
         *
         * @param {sap.ui.base.Event} oEvent The select event
         *
         * @private
         */
        onSelectionChange: function (oEvent) {
            this._setDeleteButtonEnabled(true);
        },

        /**
         * Called if the edit button in the pageOverview table is pressed
         * Sets the config values and navigates to the dashboard
         *
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
         */
        onEdit: function (oEvent) {
            var oPage = oEvent.getSource().getBindingContext().getObject();
            this._navigateToEdit(oPage.content.id);
        },

        /**
         * Called if the add button is clicked
         * Creates and saves (!) a new page, then sets the config values and navigates to the dashboard
         *
         * @private
         */
        onAdd: function () {
            this.showCreateDialog(function (pageInfo) {
                sap.ushell.Container.getServiceAsync("PageReferencing")
                    .then(function (PageReferencing) {
                        return PageReferencing.createReferencePage(pageInfo, []);
                    })
                    .then(function (oReferencePage) {
                        return this.getPageRepository().createPage(oReferencePage);
                    }.bind(this))
                    .then(function () {
                        this._navigateToEdit(pageInfo.content.id);
                        MessageToast.show(this.getResourceBundle().getText("Message.PageCreated"), {
                            closeOnBrowserNavigation: false
                        });
                    }.bind(this))
                    .catch(this.handleBackendError.bind(this));
            }.bind(this));
        },

        /**
         * Called if the delete dialog is confirmed
         * Deletes the selected page and refreshes the model to display the change in the pageOverview table
         *
         * @param {sap.ui.base.Event} oEvent The press event
         * @returns {Promise<void>} The delete promise
         *
         * @private
         */
        _deletePage: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var sTransportId = oEvent.metadata && oEvent.metadata.transportId || "";
            var oTable = this.byId("table");
            var aItemsToDelete = oTable.getSelectedItems().map(function (item) {
                return item.getBindingContext().getObject();
            });
            var sSuccessMsg = this.getResourceBundle().getText("Message.SuccessDeletePage");

            var aDeletePromises = aItemsToDelete.map(function (oItemToDelete) {
                return this.getPageRepository().deletePage(oItemToDelete.content.id, sTransportId);
            }.bind(this));

            return Promise.all(aDeletePromises)
                .then(function () {
                    return this._refreshModel();
                }.bind(this))
                .then(function () {
                    oTable.fireSelectionChange();
                    MessageToast.show(sSuccessMsg, {
                        closeOnBrowserNavigation: false
                    });
                    oDialog.close();
                })
                .catch(this.handleBackendError.bind(this));
        },

        /**
         * Called if the delete button is clicked
         * Displays the delete dialog with the pages to delete
         * on confirmation deletes the pages
         * on cancel closes the dialog
         *
         * @private
         */
        onDelete: function () {
            var oTable = this.byId("table");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                return;
            }

            this.checkShowDeleteDialog(
                oSelectedItem.getBindingContext().getObject(),
                this._deletePage.bind(this)
            );
        },

        /**
         * Filters the Table
         * @param {sap.ui.base.Event} oEvent The press event
         *
         * @private
         */
        onSearch: function (oEvent) {
            var oTable = this.byId("table");
            var oBinding = oTable.getBinding("items");
            var sSearchValue = oEvent.getSource().getValue();

            var aFilters = this.aPropertiesToFilter.map(
                function (sPropertyToFilter) {
                    return new Filter({
                        path: "content/" + sPropertyToFilter,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    });
                }
            );

            var oFilter = new Filter({
                filters: aFilters,
                and: false
            });

            oBinding.filter([oFilter]);
        },

        /**
         * Loads available pages and sets the model
         *
         * @returns {Promise<void>} Promise that resolves when the pages have been loaded
         *
         * @private
         */
        _refreshModel: function () {
            this.getModel().setProperty("/busy", true);
            return this._loadAvailablePages().then(function (pages) {
                this.getModel().setSizeLimit(pages.pages.length);
                this.getModel().setProperty("/pages", pages.pages);
                this.getModel().setProperty("/busy", false);
            }.bind(this), function (sErrorMsg) {
                this.getModel().setProperty("/busy", false);
                this.showMessageBoxError(sErrorMsg);
            }.bind(this));
        },

        /**
         * Called when table was updated, for example, filter items via search
         *
         * @private
         */
        onTableUpdate: function () {
            var oTable = this.byId("table"),
                oModel = this.getView().getModel("buttonStates");
            //if filter hides selected item, we need to reset delete button and selected item
            if (oTable.getSelectedItems().length === 0 && oModel.getProperty("/isDeleteEnabled")) {
                //true -> remove all seceltions (also hidden by filter)
                oTable.removeSelections(true);
                this._setDeleteButtonEnabled(false);
            }
        },

        /**
         * Load available pages from the page persistence
         *
         * @returns {Promise<{pages: array}>} A promise which contains an object with the pages
         *
         * @private
         */
        _loadAvailablePages: function () {
            return this.getPageRepository().getPages().then(function (aPages) {
                return {
                    pages: aPages
                };
            });
        },

        /**
         * Creates the model for the state of the delete button
         * @returns {ButtonStateModel} The Model for storing the button
         *
         * @private
         */
        _createInitialButtonStateModel: function () {
            return new JSONModel({
                isDeleteEnabled: false
            });
        },

        /**
         * Changes the state model of the delete button.
         * @param {boolean} bEnabled Whether the delete button should be enabled.
         *
         * @private
         */
        _setDeleteButtonEnabled: function (bEnabled) {
            this.getView().getModel("buttonStates").setProperty("/isDeleteEnabled", bEnabled);
        }
    });
});
},
	"sap/ushell/applications/PageComposer/controller/TileSelector.js":function(){// ${copyright}

/**
 * @fileoverview Provides functionality for "sap/ushell/applications/PageComposer/view/TileSelector.fragment.xml"
 */
sap.ui.define([
    "sap/m/library",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/ResponsivePopover",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ushell/applications/PageComposer/i18n/resources",
    "sap/ushell/services/Container" // required for "sap.ushell.Container.getServiceAsync()"
], function (
    mobileLibrary,
    Button,
    List,
    StandardListItem,
    ResponsivePopover,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    resources
    // Container
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.m.ListMode
    var ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListSeparators
    var ListSeparators = mobileLibrary.ListSeparators;

    /**
     * TileSelector constructor
     *
     * @constructor
     *
     * @protected
     */
    return function () {
        var oParentView,
            oTree,
            oToolbar,
            oAddSelectedTilesButton,
            oAddSingleTileData,
            oGroupList,
            oGroupSelectionPopover,
            fnAddTileHandler,
            bSortAscending,
            oTargetResults = {},
            mCatalogTiles = {};

        /**
         * Initializes the TileSelector, must be called before usage.
         *
         * @param {sap.ui.core.mvc.Controller} oController A reference to the controller it is going to be used on.
         *
         * @private
         */
        this.init = function (oController) {
            oParentView = oController.getView();
            oTree = oParentView.byId("tileSelectorList");
            oToolbar = oParentView.byId("tileSelectorToolbar");
            oAddSelectedTilesButton = oParentView.byId("tileSelectorAddButton");

            oTree.setBusy(true);

            oGroupList = new List({
                mode: ListMode.MultiSelect,
                showSeparators: ListSeparators.None,
                includeItemInSelection: true,
                selectionChange: function () { oGroupSelectionPopover.getBeginButton().setEnabled(!!oGroupList.getSelectedItem()); },
                items: {
                    path: "/page/content/sections",
                    template: new StandardListItem({ title: "{title}" })
                },
                noDataText: resources.i18n.getText("Message.NoGroups")
            }).setModel(oParentView.getModel());

            oAddSelectedTilesButton.setEnabled(false);
            oTree.attachSelectionChange(this._onSelectionChange);
        };

        /**
         * Consumes catalog data and builds the catalog tree, replacing the model with it.
         *
         * @param {object} oCatalogData The catalog object
         * @param {object[]} [oCatalogData.aTreeOverride] If present, other properties are ignored and this property is used as the catalog tree
         * instead of building one using the other properties.
         * @param {string[]} oCatalogData.catalogTitles An array of catalog titles
         * @param {string[][]} oCatalogData.catalogTiles An array of arrays of tiles (one array of tiles for each catalog)
         * @param {string[]} oCatalogData.mCatalogTiles A map of "vizId"s to tiles
         *
         * @private
         */
        this.initTiles = function (oCatalogData) {
            if (oCatalogData.aTreeOverride) {
                _setCatalogTree(oCatalogData.aTreeOverride);
                return;
            }
            sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                mCatalogTiles = oCatalogData.mCatalogTiles;
                var aCatalogTree = oCatalogData.catalogTiles.reduce(function (tree, tiles, i) {
                    if (tiles.length) {
                        tree.push({
                            catalogTitle: oCatalogData.catalogTitles[i],
                            tiles: tiles.map(function (tile) {
                                return {
                                    vizId: oLaunchPageService.getCatalogTileId(tile),
                                    title: oLaunchPageService.getCatalogTilePreviewTitle(tile) || oLaunchPageService.getCatalogTileTitle(tile),
                                    subtitle: oLaunchPageService.getCatalogTilePreviewSubtitle(tile),
                                    icon: oLaunchPageService.getCatalogTilePreviewIcon(tile)
                                };
                            }).sort(function (a, b) { // sorts tiles by title in ascending lexicographical order
                                if (a.title > b.title) { return 1; }
                                if (a.title < b.title) { return -1; }
                                return 0;
                            })
                        });
                    }
                    return tree;
                }, []);
                _setCatalogTree(aCatalogTree);
            });
        };

        /**
         * Intended to be called by the view (e.g. a SearchField) for handling tile search events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onSearchTiles = function (/*oEvent*/) {
            searchForTiles();
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling add tile events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onAddTiles = function (oEvent) {
            var aGroupListItems = oGroupList.getItems(),
                oBindingContext = oEvent.getSource().getBindingContext("catalogs");
            oAddSingleTileData = oBindingContext ? oBindingContext.getProperty() : null;
            if (aGroupListItems.length === 1) { // skip asking to which group(s) if there is only one group
                aGroupListItems[0].setSelected(true);
                _addTiles();
            } else {
                _openGroupSelectionPopover(oEvent);
            }
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling sort catalogs toggle events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onSortCatalogsToggle = function (/*oEvent*/) {
            sortCatalogsToggle();
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling collapse all catalogs events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onCollapseAllCatalogs = function (/*oEvent*/) {
            collapseAllCatalogs(true);
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling expand all catalogs events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onExpandAllCatalogs = function (/*oEvent*/) {
            collapseAllCatalogs(false);
        };

        /**
         * Intended to be called by the view (e.g. a Tree) for handling catalog item press events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onCatalogItemPress = function (oEvent) {
            _toggleCollapseTreeItem(oEvent.getParameters().listItem);
        };

        /**
         * Intended to be called by the view (e.g. a Tree) for handling selection change events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this._onSelectionChange = function (oEvent) {
            if (oGroupSelectionPopover && oGroupSelectionPopover.isOpen()) {
                oGroupSelectionPopover.getBeginButton().setEnabled(false);
                oGroupSelectionPopover.close();
            }
            oEvent.getParameters().listItems.forEach(function (item) {
                if (item.getBindingContext("catalogs").getProperty().tiles) { // catalog (root item)
                    item.setSelected(false); // currently, catalogs should not be selectable
                    _toggleCollapseTreeItem(item); // instead, allow toggling collapse with space bar
                }
            });
            oAddSelectedTilesButton.setEnabled(!!_getSelectedTreeItemsData().length);
        };

        /**
         * Sets a callback function for the add tiles event.
         *
         * @param {function} newAddTileHandler The callback function to be called when adding tiles.
         *   This function receives two arguments in the following order:
         *     1. A tile object.
         *     2. An array of group indices.
         *
         * @private
         */
        this.setAddTileHandler = function (newAddTileHandler) {
            fnAddTileHandler = newAddTileHandler;
        };

        /**
         * Called when starting to drag a tile.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         *
         * @private
         */
        this.onDragStart = function (oEvent) {
            var oItemData = oEvent.getParameter("target").getBindingContext("catalogs").getProperty();
            if (!oItemData.vizId) { // prevent dragging of items without vizId
                oEvent.preventDefault();
                return;
            }
            oEvent.getParameter("dragSession").setComplexData("callback", function callback (tileIndex, groupIndex) {
                Promise.all([
                    sap.ushell.Container.getServiceAsync("LaunchPage"),
                    sap.ushell.Container.getServiceAsync("NavTargetResolution")
                ]).then(function (aServices) {
                    _getInboundPermanentKey(oItemData.vizId, aServices[0], aServices[1]).then(function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, [groupIndex], tileIndex);
                    }, function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, [groupIndex], tileIndex);
                    });
                });
            });
        };

        /**
         * Sets (overwrites) the "catalogs" model with the provided tree.
         *
         * @param {object[]} aCatalogTree The catalog tree to set (overwrite) the "catalogs" model.
         *
         * @private
         */
        function _setCatalogTree (aCatalogTree) {
            var oModel = new JSONModel({ catalogs: aCatalogTree });
            oModel.setSizeLimit(Infinity); // allow more list bindings than the model default limit of 100 entries
            oParentView.setModel(oModel, "catalogs");
            bSortAscending = true;
            sortCatalogsToggle();
            oTree.expandToLevel(1);
            oTree.setBusy(false);
        }

        /**
         * Handler for searching tiles using the SearchField input.
         *
         * @private
         */
        function searchForTiles () {
            var sSearchText = oParentView.getModel().getProperty("/searchText") || "";
            oTree.getBinding("items").filter([
                new Filter([
                    new Filter("title", FilterOperator.Contains, sSearchText),
                    new Filter("subtitle", FilterOperator.Contains, sSearchText)
                ], false)
            ]);
        }

        /**
         * Toggles the sort order (ascending/descending) of the catalog tree, restricted to the first tree level (i.e. the catalog level).
         *
         * @private
         */
        function sortCatalogsToggle () {
            bSortAscending = !bSortAscending;
            var oItems = oTree.getBinding("items"),
                oSorterCatalog = new Sorter("catalogTitle", bSortAscending);
            oItems.sort(oSorterCatalog);
        }

        /**
         * Controls collapsing and expanding all catalogs.
         *
         * @param {boolean} bCollapse Whether it should collapse all catalogs instead of expanding all catalogs.
         *
         * @private
         */
        function collapseAllCatalogs (bCollapse) {
            if (bCollapse) {
                oTree.collapseAll();
            } else {
                oTree.expandToLevel(1);
            }
        }

        /**
         * Toggles the collapse state of a tree item between collapsed and expanded.
         *
         * @param {sap.m.TreeItemBase} oTreeItem The tree item to have its collapse state toggled.
         *
         * @private
         */
        function _toggleCollapseTreeItem (oTreeItem) {
            var iTreeItemIndex = oTree.indexOfItem(oTreeItem);
            if (oTreeItem.getExpanded()) {
                oTree.collapse(iTreeItemIndex);
            } else {
                oTree.expand(iTreeItemIndex);
            }
        }

        /**
         * Get the item data of every selected tree item.
         * This is needed because "getSelectedItems()" do not return selected items within collapsed parents.
         *
         * @returns {object[]} An array of selected tree item data.
         *
         * @private
         */
        function _getSelectedTreeItemsData () {
            return oTree.getSelectedContextPaths().map(function (sSelectedItemContextPath) {
                return oParentView.getModel("catalogs").getContext(sSelectedItemContextPath).getProperty();
            });
        }

        /**
         * Opens the add tiles popover, containing the group list for selection of the tiles target groups.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised the operation (e.g. a click on the "Add" button).
         *
         * @private
         */
        function _openGroupSelectionPopover (oEvent) {
            if (!oGroupSelectionPopover || oGroupSelectionPopover.bIsDestroyed) {
                _createGroupSelectionPopover();
            }
            oGroupList.removeSelections(true);
            oGroupSelectionPopover.getBeginButton().setEnabled(false);
            oGroupSelectionPopover.getEndButton().setEnabled(true);
            if (!oAddSingleTileData && _isOverflownInOverflowToolbar(oAddSelectedTilesButton)) {
                oGroupSelectionPopover.openBy(oToolbar.getAggregation("_overflowButton"));
            } else {
                oGroupSelectionPopover.openBy(oEvent.getSource());
            }
        }

        /**
         * Checks if a control is currently overflown inside of an OverflowToolbar.
         *
         * @param {sap.ui.core.Control} oControl The control to check.
         * @returns {boolean} Whether the control is or is not overflown inside of an OverflowToolbar.
         *
         * @private
         */
        function _isOverflownInOverflowToolbar (oControl) {
            return (oControl.hasStyleClass("sapMOTAPButtonNoIcon") || oControl.hasStyleClass("sapMOTAPButtonWithIcon"));
        }

        /**
         * Creates the group selection popover, used to select to which group(s) the tile(s) should go to.
         *
         * @private
         */
        function _createGroupSelectionPopover () {
            oGroupSelectionPopover = new ResponsivePopover({
                placement: PlacementType.Auto,
                title: resources.i18n.getText("Tooltip.AddToGroups"),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: resources.i18n.getText("Button.Add"),
                    press: function () { this.setEnabled(false); oGroupSelectionPopover.close(); _addTiles(); }
                }),
                endButton: new Button({
                    text: resources.i18n.getText("Button.Cancel"),
                    press: function () { this.setEnabled(false); oGroupSelectionPopover.close(); }
                }),
                content: oGroupList,
                initialFocus: oGroupList
            });
            oParentView.addDependent(oGroupSelectionPopover);
        }

        /**
         * Calculates the inboundPermanentKey for the given visualization id
         *
         * @param {string} sVizId the visualization id of a tile
         * @param {object} launchPageService the LaunchPage service
         * @param {object} navTargetResolutionService the NavTargetResolution service
         *
         * @returns {Promise<object>} the visualization id and the inboundPermanentKey
         *
         * @private
         */
        function _getInboundPermanentKey (sVizId, launchPageService, navTargetResolutionService) {
            var sTarget = launchPageService.getCatalogTileTargetURL(mCatalogTiles[sVizId]);
            if (sTarget && sTarget[0] === "#") {
                if (!oTargetResults[sTarget]) {
                    oTargetResults[sTarget] = navTargetResolutionService.resolveHashFragment(sTarget);
                }
                return Promise.resolve(oTargetResults[sTarget].then(
                    function (oResolutionResult) {
                        return {
                            vizId: sVizId,
                            inboundPermanentKey: oResolutionResult.inboundPermanentKey
                        };
                    }, function () {
                        return {
                            vizId: sVizId,
                            inboundPermanentKey: "",
                            error: "Resolving the hash fragment " + sTarget + " failed."
                        };
                    }));
            }
            return Promise.resolve({
                vizId: sVizId,
                inboundPermanentKey: ""
            });
        }

        /**
         * Calls the handler for adding tiles. Does nothing if no function is set for the add tiles handler.
         *
         * @see setAddTileHandler
         *
         * @private
         */
        function _addTiles () {
            if (typeof fnAddTileHandler !== "function") {
                return;
            }
            var aSelectedGroupsIndexes = oGroupList.getSelectedItems().map(function (oSelectedGroup) {
                return oGroupList.indexOfItem(oSelectedGroup);
            });
            var aTileData;
            if (oAddSingleTileData) {
                aTileData = [oAddSingleTileData]; // adds a single tile (from its own "Add" button)
            } else {
                aTileData = _getSelectedTreeItemsData(); // adds all selected tiles (from header "Add" button)
            }
            Promise.all([
                sap.ushell.Container.getServiceAsync("LaunchPage"),
                sap.ushell.Container.getServiceAsync("NavTargetResolution")
            ]).then(function (aServices) {
                aTileData.forEach(function (oTileData) {
                    _getInboundPermanentKey(oTileData.vizId, aServices[0], aServices[1]).then(function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, aSelectedGroupsIndexes);
                    }, function (oEnrichedTileData) {
                        fnAddTileHandler(oEnrichedTileData, aSelectedGroupsIndexes);
                    });
                });
                if (!oAddSingleTileData) { // unselect all tiles only when adding through the header "Add" button
                    oAddSelectedTilesButton.setEnabled(false);
                    oTree.removeSelections(true);
                }
            });
        }
    };
});
},
	"sap/ushell/applications/PageComposer/i18n/i18n.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# __ldi.translation.uuid=ba56f460-d533-11e9-aaef-0800200c9a66\n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Maintain Pages\n\n\n#XBUT\nButton.Add=Add\n#XBUT\nButton.Cancel=Cancel\n#XBUT\nButton.Copy=Copy\n#XBUT\nButton.Create=Create\n#XBUT\nButton.Delete=Delete\n#XBUT\nButton.Edit=Edit\n#XBUT\nButton.Save=Save\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Toggle Catalogs\n#XBUT\nButton.SortCatalogs=Toggle Catalog Sort Order\n#XBUT\nButton.CollapseCatalogs=Collapse All Catalogs\n#XBUT\nButton.ExpandCatalogs=Expand All Catalogs\n#XBUT\nButton.ShowDetails=Show Details\n#XBUT\nButton.PagePreview=Page Preview\n\n\n#XTOL\nTooltip.AddToGroups=Add to Groups\n#XTOL Tooltip for the search button\nTooltip.Search=Search\n#XTOL\nTooltip.SearchForTiles=Search for Tiles\n\n\n#XFLD\nLabel.PageID=Page ID\n#XFLD\nLabel.WorkbenchRequest=Workbench Request\n#XFLD\nLabel.Package=Package\n#XFLD\nLabel.TransportInformation=Transport Information\n#XFLD\nLabel.Details=Details:\n#XFLD\nLabel.ResponseCode=Response Code:\n#XFLD\nLabel.Description=Description\n#XFLD\nLabel.CreatedBy=Created By\n#XFLD\nLabel.CreatedOn=Created On\n#XFLD\nLabel.ChangedBy=Changed By\n#XFLD\nLabel.ChangedOn=Changed On\n#XFLD\nLabel.PageTitle=Page Title\n#XFLD\nLabel.AssignedRole=Assigned Role\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Title\n#XCOL\nColumn.PageDescription=Description\n#XCOL\nColumn.PageCreatedBy=Created By\n#XCOL\nColumn.PageCreatedOn=Created On\n#XCOL\nColumn.PageChangedBy=Changed By\n#XCOL\nColumn.PageChangedOn=Changed On\n\n\n#XTOL\nPlaceholder.GroupName=Enter group name\n#XTOL\nPlaceholder.SearchForTiles=Search for tiles\n\n#MSG\nMessage.NoGroupTitle=Group {0} has no title. For a consistent user experience, we recommend you enter a group name for each group.\n#XMSG\nMessage.InvalidGroupTitle=Ideally, you should enter a group name.\n#XMSG\nMessage.NoInternetConnection=Please check your internet connection.\n#XMSG\nMessage.SavedChanges=Your changes have been saved.\n#XMSG\nMessage.InvalidPageID=Please only use the following characters: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Please provide the Page ID.\n#XMSG\nMessage.EmptyTitle=Please provide the title.\n#XMSG\nMessage.SuccessDeletePage=The selected page has been deleted.\n#XMSG\nMessage.ClipboardCopySuccess=Details were copied successfully.\n#YMSE\nMessage.ClipboardCopyFail=An error occurred while copying details.\n#XMSG\nMessage.DeletePageConfirmation=Do you really want to delete \\n {0} {1}?\n#XMSG\nMessage.PageCreated=The page has been created.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=No Tiles\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=No Groups\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Failed to load the {0} tile in the "{1}" group.\\n\\n This is most likely caused by an incorrect SAP Fiori launchpad content configuration or by a missing role assignment.\\n\\n The content will be invisible to the user.\\n\\n To resolve this issue, please check the catalogs and target mappings assigned to this role.\n#XMSG\nMessage.NavigationTargetError=Navigation target could not be resolved.\n#XMSG\nMessage.TilesHaveErrors=Some of the tiles or groups have errors or warnings. Are you sure you want to continue saving?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Failed to resolve the navigation target of tile: "{0}".\\n\\n This is most likely caused by an incorrect SAP Fiori launchpad content configuration or by a missing role assignment.\\n\\n The tile "{0}" will be shown to the user, but the user will not be able to navigate using this tile.\n#XMSG\nMessage.DeleteGroup=Are you sure you want to delete the group "{0}"?\n#XMSG\nMessage.PageIsOutdated=A newer version of this page has already been saved.\n#XMSG\nMessage.SaveChanges=Please save your changes.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=New Page\n#XTIT\nTitle.TilesHaveErrors=Tiles Have Errors\n#XTIT\nDeleteDialog.Title=Delete\n#XMSG\nDeleteDialog.Text=Are you sure you want to delete the selected page?\n#XBUT\nDeleteDialog.ConfirmButton=Delete\n#XTIT\nDeleteDialog.LockedTitle=Page Locked\n#XMSG\nDeleteDialog.LockedText=The selected page is locked by user {0}.\n#XMSG\nDeleteDialog.TransportRequired=Please select a transport to delete the selected page.\n\n#XMSG\nEditDialog.LockedText=The selected page is locked by user {0}.\n#XMSG\nEditDialog.TransportRequired=Please select a transport to edit the selected page.\n#XTIT\nEditDialog.Title=Edit Page\n\n#XTIT\nErrorDialog.Title=Error\n\n#XTIT\nPageOverview.Title=Maintain Pages\n\n\n#XTIT\nCopyDialog.Title=Copy\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Do you want to copy {0}?\n#XFLD\nCopyDialog.NewID=Copy of {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Group title of group {0} is empty.\n#XMSG\nTitle.UnsufficientRoles=Insufficent role assignment to show content.\n#XMSG\nTitle.ContentIsNotVisible=Content will be invisible to the user.\n#XMSG\nTitle.ContentNotNavigateable=Content will not be navigateable.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ar.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u0635\\u064A\\u0627\\u0646\\u0629 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0627\\u062A\n\n\n#XBUT\nButton.Add=\\u0625\\u0636\\u0627\\u0641\\u0629\n#XBUT\nButton.Cancel=\\u0625\\u0644\\u063A\\u0627\\u0621\n#XBUT\nButton.Copy=\\u0646\\u0633\\u062E\n#XBUT\nButton.Create=\\u0625\\u0646\\u0634\\u0627\\u0621\n#XBUT\nButton.Delete=\\u062D\\u0630\\u0641\n#XBUT\nButton.Edit=\\u062A\\u062D\\u0631\\u064A\\u0631\n#XBUT\nButton.Save=\\u062D\\u0641\\u0638\n#XBUT\nButton.Ok=\\u0645\\u0648\\u0627\\u0641\\u0642\n#XBUT\nButton.ShowCatalogs=\\u062A\\u0628\\u062F\\u064A\\u0644 \\u0627\\u0644\\u062F\\u0644\\u0627\\u0626\\u0644\n#XBUT\nButton.SortCatalogs=\\u062A\\u0628\\u062F\\u064A\\u0644 \\u062A\\u0633\\u0644\\u0633\\u0644 \\u062A\\u0631\\u062A\\u064A\\u0628 \\u0627\\u0644\\u062F\\u0644\\u064A\\u0644\n#XBUT\nButton.CollapseCatalogs=\\u0637\\u064A \\u062C\\u0645\\u064A\\u0639 \\u0627\\u0644\\u062F\\u0644\\u0627\\u0626\\u0644\n#XBUT\nButton.ExpandCatalogs=\\u062A\\u0648\\u0633\\u064A\\u0639 \\u062C\\u0645\\u064A\\u0639 \\u0627\\u0644\\u062F\\u0644\\u0627\\u0626\\u0644\n#XBUT\nButton.ShowDetails=\\u0625\\u0638\\u0647\\u0627\\u0631 \\u0627\\u0644\\u062A\\u0641\\u0627\\u0635\\u064A\\u0644\n#XBUT\nButton.PagePreview=\\u0645\\u0639\\u0627\\u064A\\u0646\\u0629 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629\n\n\n#XTOL\nTooltip.AddToGroups=\\u0625\\u0636\\u0627\\u0641\\u0629 \\u0625\\u0644\\u0649 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0627\\u062A\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0628\\u062D\\u062B\n#XTOL\nTooltip.SearchForTiles=\\u0627\\u0644\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0625\\u0637\\u0627\\u0631\\u0627\\u062A\n\n\n#XFLD\nLabel.PageID=\\u0645\\u0639\\u0631\\u0641 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629\n#XFLD\nLabel.WorkbenchRequest=\\u0637\\u0644\\u0628 \\u0645\\u0646\\u0636\\u062F\\u0629 \\u0627\\u0644\\u0639\\u0645\\u0644\n#XFLD\nLabel.Package=\\u0627\\u0644\\u062D\\u0632\\u0645\\u0629\n#XFLD\nLabel.TransportInformation=\\u0645\\u0639\\u0644\\u0648\\u0645\\u0627\\u062A \\u0627\\u0644\\u0646\\u0642\\u0644\n#XFLD\nLabel.Details=\\u0627\\u0644\\u062A\\u0641\\u0627\\u0635\\u064A\\u0644\\:\n#XFLD\nLabel.ResponseCode=\\u0631\\u0645\\u0632 \\u0627\\u0644\\u0627\\u0633\\u062A\\u062C\\u0627\\u0628\\u0629\\:\n#XFLD\nLabel.Description=\\u0627\\u0644\\u0648\\u0635\\u0641\n#XFLD\nLabel.CreatedBy=\\u062A\\u0645 \\u0627\\u0644\\u0625\\u0646\\u0634\\u0627\\u0621 \\u0628\\u0648\\u0627\\u0633\\u0637\\u0629\n#XFLD\nLabel.CreatedOn=\\u062A\\u0627\\u0631\\u064A\\u062E \\u0627\\u0644\\u0625\\u0646\\u0634\\u0627\\u0621\n#XFLD\nLabel.ChangedBy=\\u062A\\u0645 \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631 \\u0628\\u0648\\u0627\\u0633\\u0637\\u0629\n#XFLD\nLabel.ChangedOn=\\u062A\\u0627\\u0631\\u064A\\u062E \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631\n#XFLD\nLabel.PageTitle=\\u0639\\u0646\\u0648\\u0627\\u0646 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629\n#XFLD\nLabel.AssignedRole=\\u0627\\u0644\\u062F\\u0648\\u0631 \\u0627\\u0644\\u0645\\u0639\\u064A\\u0651\\u064E\\u0646\n\n\n#XCOL\nColumn.PageID=\\u0627\\u0644\\u0645\\u0639\\u0631\\u0641\n#XCOL\nColumn.PageTitle=\\u0627\\u0644\\u0639\\u0646\\u0648\\u0627\\u0646\n#XCOL\nColumn.PageDescription=\\u0627\\u0644\\u0648\\u0635\\u0641\n#XCOL\nColumn.PageCreatedBy=\\u062A\\u0645 \\u0627\\u0644\\u0625\\u0646\\u0634\\u0627\\u0621 \\u0628\\u0648\\u0627\\u0633\\u0637\\u0629\n#XCOL\nColumn.PageCreatedOn=\\u062A\\u0627\\u0631\\u064A\\u062E \\u0627\\u0644\\u0625\\u0646\\u0634\\u0627\\u0621\n#XCOL\nColumn.PageChangedBy=\\u062A\\u0645 \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631 \\u0628\\u0648\\u0627\\u0633\\u0637\\u0629\n#XCOL\nColumn.PageChangedOn=\\u062A\\u0627\\u0631\\u064A\\u062E \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631\n\n\n#XTOL\nPlaceholder.GroupName=\\u0625\\u062F\\u062E\\u0627\\u0644 \\u0627\\u0633\\u0645 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629\n#XTOL\nPlaceholder.SearchForTiles=\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0627\\u0644\\u0644\\u0648\\u062D\\u0627\\u062A\n\n#MSG\nMessage.NoGroupTitle=\\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 {0} \\u0644\\u064A\\u0633 \\u0628\\u0647\\u0627 \\u0639\\u0646\\u0648\\u0627\\u0646\\u060C \\u0644\\u0636\\u0645\\u0627\\u0646 \\u062A\\u062C\\u0631\\u0628\\u0629 \\u0645\\u062A\\u0633\\u0642\\u0629 \\u0644\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645\\u060C \\u0645\\u0646 \\u0627\\u0644\\u0645\\u0633\\u062A\\u062D\\u0633\\u0646 \\u0625\\u062F\\u062E\\u0627\\u0644 \\u0627\\u0633\\u0645 \\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 \\u0644\\u0643\\u0644 \\u0645\\u062C\\u0645\\u0648\\u0639\\u0629.\n#XMSG\nMessage.InvalidGroupTitle=\\u064A\\u062C\\u0628 \\u0639\\u0644\\u064A\\u0643 \\u0625\\u062F\\u062E\\u0627\\u0644 \\u0627\\u0633\\u0645 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 \\u0628\\u0634\\u0643\\u0644 \\u0645\\u062B\\u0627\\u0644\\u064A.\n#XMSG\nMessage.NoInternetConnection=\\u0627\\u0644\\u0631\\u062C\\u0627\\u0621 \\u0641\\u062D\\u0635 \\u0627\\u062A\\u0635\\u0627\\u0644 \\u0627\\u0644\\u0625\\u0646\\u062A\\u0631\\u0646\\u062A.\n#XMSG\nMessage.SavedChanges=\\u062A\\u0645 \\u062D\\u0641\\u0638 \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631\\u0627\\u062A \\u0627\\u0644\\u062E\\u0627\\u0635\\u0629 \\u0628\\u0643.\n#XMSG\nMessage.InvalidPageID=\\u064A\\u0631\\u062C\\u0649 \\u0627\\u0633\\u062A\\u062E\\u062F\\u0627\\u0645 \\u0627\\u0644\\u0623\\u062D\\u0631\\u0641 \\u0627\\u0644\\u062A\\u0627\\u0644\\u064A\\u0629 \\u0641\\u0642\\u0637\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u064A\\u0631\\u062C\\u0649 \\u062A\\u0642\\u062F\\u064A\\u0645 \\u0645\\u0639\\u0631\\u0641 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629.\n#XMSG\nMessage.EmptyTitle=\\u064A\\u0631\\u062C\\u0649 \\u062A\\u0642\\u062F\\u064A\\u0645 \\u0627\\u0644\\u0639\\u0646\\u0648\\u0627\\u0646.\n#XMSG\nMessage.SuccessDeletePage=\\u062A\\u0645 \\u062D\\u0630\\u0641 \\u0627\\u0644\\u0643\\u0627\\u0626\\u0646 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F.\n#XMSG\nMessage.ClipboardCopySuccess=\\u062A\\u0645 \\u0646\\u0633\\u062E \\u0627\\u0644\\u062A\\u0641\\u0627\\u0635\\u064A\\u0644 \\u0628\\u0646\\u062C\\u0627\\u062D.\n#YMSE\nMessage.ClipboardCopyFail=\\u062D\\u062F\\u062B \\u062E\\u0637\\u0623 \\u0623\\u062B\\u0646\\u0627\\u0621 \\u0646\\u0633\\u062E \\u0627\\u0644\\u062A\\u0641\\u0627\\u0635\\u064A\\u0644.\n#XMSG\nMessage.DeletePageConfirmation=\\u0647\\u0644 \\u062A\\u0631\\u064A\\u062F \\u062D\\u0630\\u0641 {0} {1}\\u0628\\u0627\\u0644\\u062A\\u0623\\u0643\\u064A\\u062F\\u061F\n#XMSG\nMessage.PageCreated=\\u062A\\u0645 \\u0625\\u0646\\u0634\\u0627\\u0621 \\u0635\\u0641\\u062D\\u0629.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u0644\\u0627 \\u062A\\u0648\\u062C\\u062F \\u0644\\u0648\\u062D\\u0627\\u062A\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u0644\\u0627 \\u062A\\u0648\\u062C\\u062F \\u0645\\u062C\\u0645\\u0648\\u0639\\u0627\\u062A\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u0641\\u0634\\u0644 \\u062A\\u062D\\u0645\\u064A\\u0644 \\u0625\\u0637\\u0627\\u0631 {0} \\u0641\\u064A \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 "{1}".\\n\\n\\u0647\\u0630\\u0627 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u0623\\u0631\\u062C\\u062D \\u0628\\u0633\\u0628\\u0628 \\u062A\\u0643\\u0648\\u064A\\u0646 \\u0645\\u062D\\u062A\\u0648\\u0649 \\u0644\\u0648\\u062D\\u0629 \\u062A\\u0634\\u063A\\u064A\\u0644SAP Fiori \\u063A\\u064A\\u0631 \\u0635\\u062D\\u064A\\u062D \\u0623\\u0648 \\u0628\\u0633\\u0628\\u0628 \\u062A\\u0639\\u064A\\u064A\\u0646 \\u062F\\u0648\\u0631 \\u0645\\u0641\\u0642\\u0648\\u062F.\\n\\n\\u0633\\u064A\\u0643\\u0648\\u0646 \\u0627\\u0644\\u0645\\u062D\\u062A\\u0648\\u0649 \\u063A\\u064A\\u0631 \\u0645\\u0631\\u0626\\u064A \\u0644\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645.\\n\\n\\u0644\\u062D\\u0644 \\u0647\\u0630\\u0647 \\u0627\\u0644\\u0645\\u0634\\u0643\\u0644\\u0629\\u060C \\u064A\\u0631\\u062C\\u0649 \\u0627\\u0644\\u062A\\u062D\\u0642\\u0642 \\u0645\\u0646 \\u0627\\u0644\\u062F\\u0644\\u0627\\u0626\\u0644 \\u0648\\u0639\\u0645\\u0644\\u064A\\u0627\\u062A \\u0627\\u0644\\u0631\\u0628\\u0637 \\u0627\\u0644\\u0645\\u0633\\u062A\\u0647\\u062F\\u0641\\u0629 \\u0627\\u0644\\u0645\\u0639\\u064A\\u0646\\u0629 \\u0644\\u0647\\u0630\\u0627 \\u0627\\u0644\\u062F\\u0648\\u0631.\n#XMSG\nMessage.NavigationTargetError=\\u0644\\u0627 \\u064A\\u0645\\u0643\\u0646 \\u062D\\u0644 \\u0645\\u0633\\u062A\\u0647\\u062F\\u0641 \\u0627\\u0644\\u062A\\u0646\\u0642\\u0644.\n#XMSG\nMessage.TilesHaveErrors=\\u062A\\u062D\\u062A\\u0648\\u064A \\u0628\\u0639\\u0636 \\u0627\\u0644\\u0625\\u0637\\u0627\\u0631\\u0627\\u062A \\u0623\\u0648 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0627\\u062A \\u0639\\u0644\\u0649 \\u0623\\u062E\\u0637\\u0627\\u0621 \\u0623\\u0648 \\u062A\\u062D\\u0630\\u064A\\u0631\\u0627\\u062A. \\u0647\\u0644 \\u0623\\u0646\\u062A \\u0645\\u062A\\u0623\\u0643\\u062F \\u0645\\u0646 \\u0623\\u0646\\u0643 \\u062A\\u0631\\u064A\\u062F \\u0645\\u062A\\u0627\\u0628\\u0639\\u0629 \\u0627\\u0644\\u062D\\u0641\\u0638\\u061F\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u0641\\u0634\\u0644 \\u062D\\u0644 \\u0645\\u0633\\u062A\\u0647\\u062F\\u0641 \\u0627\\u0644\\u062A\\u0646\\u0642\\u0644 \\u0644\\u0644\\u0625\\u0637\\u0627\\u0631\\: "{0}".\\n\\n\\u0647\\u0630\\u0627 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u0623\\u0631\\u062C\\u062D \\u0628\\u0633\\u0628\\u0628 \\u062A\\u0643\\u0648\\u064A\\u0646 \\u0645\\u062D\\u062A\\u0648\\u0649 \\u0644\\u0648\\u062D\\u0629 \\u062A\\u0634\\u063A\\u064A\\u0644SAP Fiori \\u063A\\u064A\\u0631 \\u0635\\u062D\\u064A\\u062D \\u0623\\u0648 \\u0628\\u0633\\u0628\\u0628 \\u062A\\u0639\\u064A\\u064A\\u0646 \\u062F\\u0648\\u0631 \\u0645\\u0641\\u0642\\u0648\\u062F.\\n\\n\\u0633\\u064A\\u062A\\u0645 \\u0639\\u0631\\u0636 \\u0627\\u0644\\u0625\\u0637\\u0627\\u0631 "{0}"  \\u0644\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645 \\u060C \\u0648\\u0644\\u0643\\u0646 \\u0644\\u0646 \\u064A\\u062A\\u0645\\u0643\\u0646 \\u0627\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645 \\u0645\\u0646 \\u0627\\u0644\\u062A\\u0646\\u0642\\u0644 \\u0628\\u0627\\u0633\\u062A\\u062E\\u062F\\u0627\\u0645 \\u0647\\u0630\\u0627 \\u0627\\u0644\\u0625\\u0637\\u0627\\u0631.\n#XMSG\nMessage.DeleteGroup=\\u0647\\u0644 \\u062A\\u0631\\u064A\\u062F \\u062D\\u0642\\u064B\\u0627 \\u062D\\u0630\\u0641 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 "{0}"\\u061F\n#XMSG\nMessage.PageIsOutdated=\\u062A\\u0645 \\u062D\\u0641\\u0638 \\u0623\\u062D\\u062F\\u062B \\u0625\\u0635\\u062F\\u0627\\u0631 \\u0645\\u0646 \\u0647\\u0630\\u0647 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629.\n#XMSG\nMessage.SaveChanges=\\u064A\\u0631\\u062C\\u0649 \\u062D\\u0641\\u0638 \\u0627\\u0644\\u062A\\u063A\\u064A\\u064A\\u0631\\u0627\\u062A \\u0627\\u0644\\u062E\\u0627\\u0635\\u0629 \\u0628\\u0643.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u0635\\u0641\\u062D\\u0629 \\u062C\\u062F\\u064A\\u062F\\u0629\n#XTIT\nTitle.TilesHaveErrors=\\u062A\\u062D\\u062A\\u0648\\u0649 \\u0627\\u0644\\u0625\\u0637\\u0627\\u0631\\u0627\\u062A \\u0639\\u0644\\u0649 \\u0623\\u062E\\u0637\\u0627\\u0621\n#XTIT\nDeleteDialog.Title=\\u062D\\u0630\\u0641\n#XMSG\nDeleteDialog.Text=\\u0647\\u0644 \\u062A\\u0631\\u064A\\u062F \\u0628\\u0627\\u0644\\u062A\\u0623\\u0643\\u064A\\u062F \\u062D\\u0630\\u0641 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0627\\u062A \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\\u0629\\u061F\n#XBUT\nDeleteDialog.ConfirmButton=\\u062D\\u0630\\u0641\n#XTIT\nDeleteDialog.LockedTitle=\\u062A\\u0645 \\u062A\\u0623\\u0645\\u064A\\u0646 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629\n#XMSG\nDeleteDialog.LockedText=\\u0627\\u0644\\u0635\\u0641\\u062D\\u0629 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\\u0629 \\u0645\\u0624\\u0645\\u0646\\u0629 \\u0645\\u0646 \\u0642\\u0628\\u0644 \\u0627\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645 {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u064A\\u0631\\u062C\\u0649 \\u062A\\u062D\\u062F\\u064A\\u062F \\u0627\\u0644\\u0646\\u0642\\u0644 \\u0644\\u062D\\u0630\\u0641 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\\u0629.\n\n#XMSG\nEditDialog.LockedText=\\u0627\\u0644\\u0635\\u0641\\u062D\\u0629 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\\u0629 \\u0645\\u0624\\u0645\\u0646\\u0629 \\u0645\\u0646 \\u0642\\u0628\\u0644 \\u0627\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645 {0}.\n#XMSG\nEditDialog.TransportRequired=\\u064A\\u0631\\u062C\\u0649 \\u062A\\u062D\\u062F\\u064A\\u062F \\u0627\\u0644\\u0646\\u0642\\u0644 \\u0644\\u062A\\u062D\\u0631\\u064A\\u0631 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\\u0629.\n#XTIT\nEditDialog.Title=\\u062A\\u062D\\u0631\\u064A\\u0631 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0629\n\n#XTIT\nErrorDialog.Title=\\u062E\\u0637\\u0623\n\n#XTIT\nPageOverview.Title=\\u0635\\u064A\\u0627\\u0646\\u0629 \\u0627\\u0644\\u0635\\u0641\\u062D\\u0627\\u062A\n\n\n#XTIT\nCopyDialog.Title=\\u0646\\u0633\\u062E\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0647\\u0644 \\u062A\\u0631\\u064A\\u062F \\u0646\\u0633\\u062E {0}\\u061F\n#XFLD\nCopyDialog.NewID=\\u0646\\u0633\\u062E \\u0645\\u0646 {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0639\\u0646\\u0648\\u0627\\u0646 \\u0627\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 \\u0644\\u0644\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 {0} \\u0641\\u0627\\u0631\\u063A.\n#XMSG\nTitle.UnsufficientRoles=\\u062A\\u0639\\u064A\\u064A\\u0646 \\u062F\\u0648\\u0631 \\u063A\\u064A\\u0631 \\u0643\\u0627\\u0641\\u0650 \\u0644\\u0625\\u0638\\u0647\\u0627\\u0631 \\u0627\\u0644\\u0645\\u062D\\u062A\\u0648\\u0649\n#XMSG\nTitle.ContentIsNotVisible=\\u0627\\u0644\\u0645\\u062D\\u062A\\u0648\\u0649 \\u0633\\u064A\\u0643\\u0648\\u0646 \\u063A\\u064A\\u0631 \\u0645\\u0631\\u0626\\u064A \\u0644\\u0644\\u0645\\u0633\\u062A\\u062E\\u062F\\u0645.\n#XMSG\nTitle.ContentNotNavigateable=\\u0644\\u0646 \\u064A\\u0643\\u0648\\u0646 \\u0627\\u0644\\u0645\\u062D\\u062A\\u0648\\u0649 \\u0642\\u0627\\u0628\\u0644\\u0627\\u064B \\u0644\\u0644\\u062A\\u0646\\u0642\\u0644.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_bg.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u041F\\u043E\\u0434\\u0434\\u0440\\u044A\\u0436\\u043A\\u0430 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0438\n\n\n#XBUT\nButton.Add=\\u0414\\u043E\\u0431\\u0430\\u0432\\u044F\\u043D\\u0435\n#XBUT\nButton.Cancel=\\u041E\\u0442\\u043A\\u0430\\u0437\n#XBUT\nButton.Copy=\\u041A\\u043E\\u043F\\u0438\\u0440\\u0430\\u043D\\u0435\n#XBUT\nButton.Create=\\u0421\\u044A\\u0437\\u0434\\u0430\\u0432\\u0430\\u043D\\u0435\n#XBUT\nButton.Delete=\\u0418\\u0437\\u0442\\u0440\\u0438\\u0432\\u0430\\u043D\\u0435\n#XBUT\nButton.Edit=\\u0420\\u0435\\u0434\\u0430\\u043A\\u0442\\u0438\\u0440\\u0430\\u043D\\u0435\n#XBUT\nButton.Save=\\u0417\\u0430\\u043F\\u0430\\u0437\\u0432\\u0430\\u043D\\u0435\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u041F\\u0440\\u0435\\u0432\\u043A\\u043B\\u044E\\u0447\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0437\\u0438\n#XBUT\nButton.SortCatalogs=\\u041F\\u0440\\u0435\\u0432\\u043A\\u043B\\u044E\\u0447\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0440\\u0435\\u0434\\u0430 \\u043D\\u0430 \\u0441\\u043E\\u0440\\u0442\\u0438\\u0440\\u0430\\u043D\\u0435 \\u0437\\u0430 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0437\\u0438\n#XBUT\nButton.CollapseCatalogs=\\u0421\\u0432\\u0438\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0432\\u0441\\u0438\\u0447\\u043A\\u0438 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0437\\u0438\n#XBUT\nButton.ExpandCatalogs=\\u0420\\u0430\\u0437\\u0433\\u0440\\u044A\\u0449\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0432\\u0441\\u0438\\u0447\\u043A\\u0438 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0437\\u0438\n#XBUT\nButton.ShowDetails=\\u041F\\u043E\\u043A\\u0430\\u0437\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u043F\\u043E\\u0434\\u0440\\u043E\\u0431\\u043D\\u0438 \\u0434\\u0430\\u043D\\u043D\\u0438\n#XBUT\nButton.PagePreview=\\u041F\\u0440\\u0435\\u0434\\u0432\\u0430\\u0440\\u0438\\u0442\\u0435\\u043B\\u0435\\u043D \\u043F\\u0440\\u0435\\u0433\\u043B\\u0435\\u0434 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\\u0442\\u0430\n\n\n#XTOL\nTooltip.AddToGroups=\\u0414\\u043E\\u0431\\u0430\\u0432\\u044F\\u043D\\u0435 \\u043A\\u044A\\u043C \\u0433\\u0440\\u0443\\u043F\\u0438\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0422\\u044A\\u0440\\u0441\\u0435\\u043D\\u0435\n#XTOL\nTooltip.SearchForTiles=\\u0422\\u044A\\u0440\\u0441\\u0435\\u043D\\u0435 \\u043D\\u0430 \\u043F\\u043B\\u043E\\u0447\\u043A\\u0438\n\n\n#XFLD\nLabel.PageID=\\u0418\\u0414 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n#XFLD\nLabel.WorkbenchRequest=\\u0417\\u0430\\u044F\\u0432\\u043A\\u0430 \\u0437\\u0430 \\u0438\\u043D\\u0441\\u0442\\u0440\\u0443\\u043C\\u0435\\u043D\\u0442\\u0430\\u043B\\u043D\\u0438 \\u0441\\u0440\\u0435\\u0434\\u0441\\u0442\\u0432\\u0430\n#XFLD\nLabel.Package=\\u041F\\u0430\\u043A\\u0435\\u0442\n#XFLD\nLabel.TransportInformation=\\u0418\\u043D\\u0444\\u043E\\u0440\\u043C\\u0430\\u0446\\u0438\\u044F \\u0437\\u0430 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\n#XFLD\nLabel.Details=\\u041F\\u043E\\u0434\\u0440\\u043E\\u0431\\u043D\\u0438 \\u0434\\u0430\\u043D\\u043D\\u0438\\:\n#XFLD\nLabel.ResponseCode=\\u041A\\u043E\\u0434 \\u043D\\u0430 \\u043E\\u0442\\u0433\\u043E\\u0432\\u043E\\u0440\\:\n#XFLD\nLabel.Description=\\u041E\\u043F\\u0438\\u0441\\u0430\\u043D\\u0438\\u0435\n#XFLD\nLabel.CreatedBy=\\u0421\\u044A\\u0437\\u0434\\u0430\\u043B\n#XFLD\nLabel.CreatedOn=\\u0421\\u044A\\u0437\\u0434\\u0430\\u0434\\u0435\\u043D \\u043D\\u0430\n#XFLD\nLabel.ChangedBy=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0435\\u043D \\u043E\\u0442\n#XFLD\nLabel.ChangedOn=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0435\\u043D \\u043D\\u0430\n#XFLD\nLabel.PageTitle=\\u0417\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n#XFLD\nLabel.AssignedRole=\\u041F\\u0440\\u0438\\u0441\\u044A\\u0435\\u0434\\u0438\\u043D\\u0435\\u043D\\u0430 \\u0440\\u043E\\u043B\\u044F\n\n\n#XCOL\nColumn.PageID=\\u0418\\u0414\n#XCOL\nColumn.PageTitle=\\u0417\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435\n#XCOL\nColumn.PageDescription=\\u041E\\u043F\\u0438\\u0441\\u0430\\u043D\\u0438\\u0435\n#XCOL\nColumn.PageCreatedBy=\\u0421\\u044A\\u0437\\u0434\\u0430\\u043B\n#XCOL\nColumn.PageCreatedOn=\\u0421\\u044A\\u0437\\u0434\\u0430\\u0434\\u0435\\u043D \\u043D\\u0430\n#XCOL\nColumn.PageChangedBy=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0438\\u043B\n#XCOL\nColumn.PageChangedOn=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0435\\u043D \\u043D\\u0430\n\n\n#XTOL\nPlaceholder.GroupName=\\u0412\\u044A\\u0432\\u0435\\u0436\\u0434\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0438\\u043C\\u0435 \\u043D\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0430\n#XTOL\nPlaceholder.SearchForTiles=\\u0422\\u044A\\u0440\\u0441\\u0435\\u043D\\u0435 \\u043D\\u0430 \\u043F\\u043B\\u043E\\u0447\\u043A\\u0438\n\n#MSG\nMessage.NoGroupTitle=\\u0413\\u0440\\u0443\\u043F\\u0430 {0} \\u043D\\u044F\\u043C\\u0430 \\u0437\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435. \\u0417\\u0430 \\u043E\\u0441\\u0438\\u0433\\u0443\\u0440\\u044F\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0443\\u043D\\u0438\\u0444\\u0438\\u0446\\u0438\\u0440\\u0430\\u043D\\u043E \\u043F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u0441\\u043A\\u043E \\u043F\\u0440\\u0435\\u0436\\u0438\\u0432\\u044F\\u0432\\u0430\\u043D\\u0435 \\u0432\\u0438 \\u043F\\u0440\\u0435\\u043F\\u043E\\u0440\\u044A\\u0447\\u0432\\u0430\\u043C\\u0435 \\u0434\\u0430 \\u0432\\u044A\\u0432\\u0435\\u0434\\u0435\\u0442\\u0435 \\u0438\\u043C\\u0435 \\u0437\\u0430 \\u0432\\u0441\\u044F\\u043A\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0430.\n#XMSG\nMessage.InvalidGroupTitle=\\u041F\\u043E \\u0432\\u044A\\u0437\\u043C\\u043E\\u0436\\u043D\\u043E\\u0441\\u0442 \\u0432\\u044A\\u0432\\u0435\\u0434\\u0435\\u0442\\u0435 \\u0438\\u043C\\u0435 \\u043D\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0430.\n#XMSG\nMessage.NoInternetConnection=\\u041C\\u043E\\u043B\\u044F, \\u043F\\u0440\\u043E\\u0432\\u0435\\u0440\\u0435\\u0442\\u0435 \\u0438\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442 \\u0432\\u0440\\u044A\\u0437\\u043A\\u0430\\u0442\\u0430 \\u0441\\u0438.\n#XMSG\nMessage.SavedChanges=\\u0412\\u0430\\u0448\\u0438\\u0442\\u0435 \\u043F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0438 \\u0441\\u0430 \\u0437\\u0430\\u043F\\u0430\\u0437\\u0435\\u043D\\u0438.\n#XMSG\nMessage.InvalidPageID=\\u041C\\u043E\\u043B\\u044F, \\u0438\\u0437\\u043F\\u043E\\u043B\\u0437\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0441\\u0430\\u043C\\u043E \\u0441\\u043B\\u0435\\u0434\\u043D\\u0438\\u0442\\u0435 \\u0441\\u0438\\u043C\\u0432\\u043E\\u043B\\u0438\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u041C\\u043E\\u043B\\u044F, \\u0434\\u0430\\u0439\\u0442\\u0435 \\u0418\\u0414 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430.\n#XMSG\nMessage.EmptyTitle=\\u041C\\u043E\\u043B\\u044F, \\u043F\\u043E\\u0441\\u043E\\u0447\\u0435\\u0442\\u0435 \\u0437\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435\\u0442\\u043E.\n#XMSG\nMessage.SuccessDeletePage=\\u0418\\u0437\\u0431\\u0440\\u0430\\u043D\\u0438\\u044F\\u0442 \\u043E\\u0431\\u0435\\u043A\\u0442 \\u0435 \\u0438\\u0437\\u0442\\u0440\\u0438\\u0442.\n#XMSG\nMessage.ClipboardCopySuccess=\\u041F\\u043E\\u0434\\u0440\\u043E\\u0431\\u043D\\u0438\\u0442\\u0435 \\u0434\\u0430\\u043D\\u043D\\u0438 \\u0441\\u0430 \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u043D\\u0438 \\u0443\\u0441\\u043F\\u0435\\u0448\\u043D\\u043E.\n#YMSE\nMessage.ClipboardCopyFail=\\u0412\\u044A\\u0437\\u043D\\u0438\\u043A\\u043D\\u0430 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0430 \\u043F\\u043E \\u0432\\u0440\\u0435\\u043C\\u0435 \\u043D\\u0430 \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u043F\\u043E\\u0434\\u0440\\u043E\\u0431\\u043D\\u0438 \\u0434\\u0430\\u043D\\u043D\\u0438.\n#XMSG\nMessage.DeletePageConfirmation=\\u041D\\u0430\\u0438\\u0441\\u0442\\u0438\\u043D\\u0430 \\u043B\\u0438 \\u0436\\u0435\\u043B\\u0430\\u0435\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0442\\u0440\\u0438\\u0435\\u0442\\u0435 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\\u0442\\u0430 \\u0435 \\u0441\\u044A\\u0437\\u0434\\u0430\\u0434\\u0435\\u043D\\u0430.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u0411\\u0435\\u0437 \\u0447\\u0430\\u0441\\u0442\\u0438 \\u043E\\u0442 \\u0435\\u043A\\u0440\\u0430\\u043D\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u041D\\u044F\\u043C\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0438\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u041D\\u0435\\u0443\\u0441\\u043F\\u0435\\u0448\\u043D\\u043E \\u0437\\u0430\\u0440\\u0435\\u0436\\u0434\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u043F\\u043B\\u043E\\u0447\\u043A\\u0430 {0} \\u0432 \\u0433\\u0440\\u0443\\u043F\\u0430\\u0442\\u0430 "{1}".\\n\\n\\u0422\\u043E\\u0432\\u0430 \\u043D\\u0430\\u0439-\\u0432\\u0435\\u0440\\u043E\\u044F\\u0442\\u043D\\u043E \\u0441\\u0435 \\u0434\\u044A\\u043B\\u0436\\u0438 \\u043D\\u0430 \\u0433\\u0440\\u0435\\u0448\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u044F \\u043D\\u0430 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435 \\u0432 \\u043A\\u043E\\u043D\\u0442\\u0440\\u043E\\u043B\\u043D\\u0438\\u044F \\u043F\\u0430\\u043D\\u0435\\u043B SAP Fiori \\u0438\\u043B\\u0438 \\u043D\\u0430 \\u043B\\u0438\\u043F\\u0441\\u0432\\u0430\\u0449\\u043E \\u043F\\u0440\\u0438\\u0441\\u044A\\u0435\\u0434\\u0438\\u043D\\u044F\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0440\\u043E\\u043B\\u044F.\\n\\n\\u041F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u044F\\u0442 \\u043D\\u044F\\u043C\\u0430 \\u0434\\u0430 \\u043C\\u043E\\u0436\\u0435 \\u0434\\u0430 \\u0432\\u0438\\u0436\\u0434\\u0430 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435\\u0442\\u043E.\\n\\n\\u0417\\u0430 \\u0434\\u0430 \\u0440\\u0430\\u0437\\u0440\\u0435\\u0448\\u0438\\u0442\\u0435 \\u0442\\u043E\\u0437\\u0438 \\u043F\\u0440\\u043E\\u0431\\u043B\\u0435\\u043C, \\u043C\\u043E\\u043B\\u044F \\u043F\\u0440\\u043E\\u0432\\u0435\\u0440\\u0435\\u0442\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0437\\u0438\\u0442\\u0435 \\u0438 \\u043C\\u0430\\u043F\\u0438\\u0440\\u0430\\u043D\\u0438\\u044F\\u0442\\u0430 \\u043D\\u0430 \\u0446\\u0435\\u043B\\u0438, \\u043F\\u0440\\u0438\\u0441\\u044A\\u0435\\u0434\\u0438\\u043D\\u0435\\u043D\\u0438 \\u043A\\u044A\\u043C \\u0442\\u0430\\u0437\\u0438 \\u0440\\u043E\\u043B\\u044F.\n#XMSG\nMessage.NavigationTargetError=\\u041D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u043E\\u043D\\u043D\\u0430\\u0442\\u0430 \\u0446\\u0435\\u043B \\u043D\\u0435 \\u043C\\u043E\\u0436\\u0435 \\u0434\\u0430 \\u0431\\u044A\\u0434\\u0435 \\u0440\\u0435\\u0448\\u0435\\u043D\\u0430.\n#XMSG\nMessage.TilesHaveErrors=\\u0417\\u0430 \\u043D\\u044F\\u043A\\u043E\\u0438 \\u043E\\u0442 \\u043F\\u043B\\u043E\\u0447\\u043A\\u0438\\u0442\\u0435 \\u0438\\u043B\\u0438 \\u0433\\u0440\\u0443\\u043F\\u0438\\u0442\\u0435 \\u0438\\u043C\\u0430 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0438 \\u0438\\u043B\\u0438 \\u043F\\u0440\\u0435\\u0434\\u0443\\u043F\\u0440\\u0435\\u0436\\u0434\\u0435\\u043D\\u0438\\u044F. \\u041D\\u0430\\u0438\\u0441\\u0442\\u0438\\u043D\\u0430 \\u043B\\u0438 \\u0438\\u0441\\u043A\\u0430\\u0442\\u0435 \\u0434\\u0430 \\u043F\\u0440\\u043E\\u0434\\u044A\\u043B\\u0436\\u0438\\u0442\\u0435 \\u0441\\u044A\\u0441 \\u0437\\u0430\\u043F\\u0430\\u0437\\u0432\\u0430\\u043D\\u0435\\u0442\\u043E?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u041D\\u0435\\u0443\\u0441\\u043F\\u0435\\u0448\\u043D\\u043E \\u0440\\u0435\\u0448\\u0430\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u043D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u043E\\u043D\\u043D\\u0430\\u0442\\u0430 \\u0446\\u0435\\u043B \\u043D\\u0430 \\u043F\\u043B\\u043E\\u0447\\u043A\\u0430\\: "{0}".\\n\\n\\u0422\\u043E\\u0432\\u0430 \\u043D\\u0430\\u0439-\\u0432\\u0435\\u0440\\u043E\\u044F\\u0442\\u043D\\u043E \\u0441\\u0435 \\u0434\\u044A\\u043B\\u0436\\u0438 \\u043D\\u0430 \\u0433\\u0440\\u0435\\u0448\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u044F \\u043D\\u0430 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435 \\u0432 \\u043A\\u043E\\u043D\\u0442\\u0440\\u043E\\u043B\\u043D\\u0438\\u044F \\u043F\\u0430\\u043D\\u0435\\u043B SAP Fiori \\u0438\\u043B\\u0438 \\u043D\\u0430 \\u043B\\u0438\\u043F\\u0441\\u0432\\u0430\\u0449\\u043E \\u043F\\u0440\\u0438\\u0441\\u044A\\u0435\\u0434\\u0438\\u043D\\u044F\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0440\\u043E\\u043B\\u044F.\\n\\n\\u041F\\u043B\\u043E\\u0447\\u043A\\u0430\\u0442\\u0430 "{0}" \\u0449\\u0435 \\u0431\\u044A\\u0434\\u0435 \\u0432\\u0438\\u0434\\u0438\\u043C\\u0430 \\u0437\\u0430 \\u043F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u044F, \\u043D\\u043E \\u043D\\u044F\\u043C\\u0430 \\u0434\\u0430 \\u043C\\u043E\\u0436\\u0435 \\u0434\\u0430 \\u0441\\u0435 \\u043D\\u0430\\u0432\\u0438\\u0433\\u0438\\u0440\\u0430 \\u0432 \\u043D\\u0435\\u044F.\n#XMSG\nMessage.DeleteGroup=\\u041F\\u043E\\u0442\\u0432\\u044A\\u0440\\u0436\\u0434\\u0430\\u0432\\u0430\\u0442\\u0435 \\u043B\\u0438, \\u0447\\u0435 \\u0436\\u0435\\u043B\\u0430\\u0435\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0442\\u0440\\u0438\\u0435\\u0442\\u0435 \\u0433\\u0440\\u0443\\u043F\\u0430 "{0}"?\n#XMSG\nMessage.PageIsOutdated=\\u0412\\u0435\\u0447\\u0435 \\u0435 \\u0437\\u0430\\u043F\\u0430\\u0437\\u0435\\u043D\\u0430 \\u043F\\u043E-\\u043D\\u043E\\u0432\\u0430 \\u0432\\u0435\\u0440\\u0441\\u0438\\u044F \\u043D\\u0430 \\u0442\\u0430\\u0437\\u0438 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430.\n#XMSG\nMessage.SaveChanges=\\u041C\\u043E\\u043B\\u044F, \\u0437\\u0430\\u043F\\u0430\\u0437\\u0435\\u0442\\u0435 \\u043D\\u0430\\u043F\\u0440\\u0430\\u0432\\u0435\\u043D\\u0438\\u0442\\u0435 \\u043E\\u0442 \\u0432\\u0430\\u0441 \\u043F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0438.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u041D\\u043E\\u0432\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n#XTIT\nTitle.TilesHaveErrors=\\u041F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0438 \\u0441\\u0430 \\u0441 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0438\n#XTIT\nDeleteDialog.Title=\\u0418\\u0437\\u0442\\u0440\\u0438\\u0432\\u0430\\u043D\\u0435\n#XMSG\nDeleteDialog.Text=\\u041D\\u0430\\u0438\\u0441\\u0442\\u0438\\u043D\\u0430 \\u043B\\u0438 \\u0436\\u0435\\u043B\\u0430\\u0435\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0442\\u0440\\u0438\\u0435\\u0442\\u0435 \\u0438\\u0437\\u0431\\u0440\\u0430\\u043D\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0418\\u0437\\u0442\\u0440\\u0438\\u0432\\u0430\\u043D\\u0435\n#XTIT\nDeleteDialog.LockedTitle=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\\u0442\\u0430 \\u0435 \\u0437\\u0430\\u043A\\u043B\\u044E\\u0447\\u0435\\u043D\\u0430\n#XMSG\nDeleteDialog.LockedText=\\u0418\\u0437\\u0431\\u0440\\u0430\\u043D\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0435 \\u0437\\u0430\\u043A\\u043B\\u044E\\u0447\\u0435\\u043D\\u0430 \\u043E\\u0442 \\u043F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u044F {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u041C\\u043E\\u043B\\u044F, \\u0438\\u0437\\u0431\\u0435\\u0440\\u0435\\u0442\\u0435 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442 \\u0437\\u0430 \\u0438\\u0437\\u0442\\u0440\\u0438\\u0432\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0438\\u0437\\u0431\\u0440\\u0430\\u043D\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430.\n\n#XMSG\nEditDialog.LockedText=\\u0418\\u0437\\u0431\\u0440\\u0430\\u043D\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0435 \\u0437\\u0430\\u043A\\u043B\\u044E\\u0447\\u0435\\u043D\\u0430 \\u043E\\u0442 \\u043F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u044F {0}.\n#XMSG\nEditDialog.TransportRequired=\\u041C\\u043E\\u043B\\u044F, \\u0438\\u0437\\u0431\\u0435\\u0440\\u0435\\u0442\\u0435 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442 \\u0437\\u0430 \\u0440\\u0435\\u0434\\u0430\\u043A\\u0442\\u0438\\u0440\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0438\\u0437\\u0431\\u0440\\u0430\\u043D\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430.\n#XTIT\nEditDialog.Title=\\u0420\\u0435\\u0434\\u0430\\u043A\\u0442\\u0438\\u0440\\u0430\\u043D\\u0435 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n\n#XTIT\nErrorDialog.Title=\\u0413\\u0440\\u0435\\u0448\\u043A\\u0430\n\n#XTIT\nPageOverview.Title=\\u041F\\u043E\\u0434\\u0434\\u0440\\u044A\\u0436\\u043A\\u0430 \\u043D\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0438\n\n\n#XTIT\nCopyDialog.Title=\\u041A\\u043E\\u043F\\u0438\\u0440\\u0430\\u043D\\u0435\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0416\\u0435\\u043B\\u0430\\u0435\\u0442\\u0435 \\u043B\\u0438 \\u0434\\u0430 \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u0442\\u0435 {0}?\n#XFLD\nCopyDialog.NewID=\\u041A\\u043E\\u043F\\u0438\\u0435 \\u043D\\u0430 {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0417\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435\\u0442\\u043E \\u043D\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0430 {0} \\u0435 \\u043F\\u0440\\u0430\\u0437\\u043D\\u043E.\n#XMSG\nTitle.UnsufficientRoles=\\u041D\\u0435 \\u0435 \\u043F\\u0440\\u0438\\u0441\\u044A\\u0435\\u0434\\u0438\\u043D\\u0435\\u043D\\u0430 \\u043D\\u0435\\u043E\\u0431\\u0445\\u043E\\u0434\\u0438\\u043C\\u0430\\u0442\\u0430 \\u0440\\u043E\\u043B\\u044F \\u0437\\u0430 \\u043F\\u0440\\u0435\\u0433\\u043B\\u0435\\u0434 \\u043D\\u0430 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435\\u0442\\u043E\n#XMSG\nTitle.ContentIsNotVisible=\\u041F\\u043E\\u0442\\u0440\\u0435\\u0431\\u0438\\u0442\\u0435\\u043B\\u044F\\u0442 \\u043D\\u044F\\u043C\\u0430 \\u0434\\u0430 \\u0432\\u0438\\u0436\\u0434\\u0430 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435\\u0442\\u043E.\n#XMSG\nTitle.ContentNotNavigateable=\\u041D\\u0430\\u0432\\u0438\\u0433\\u0438\\u0440\\u0430\\u043D\\u0435\\u0442\\u043E \\u0432 \\u0441\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435\\u0442\\u043E \\u043D\\u044F\\u043C\\u0430 \\u0434\\u0430 \\u0435 \\u0432\\u044A\\u0437\\u043C\\u043E\\u0436\\u043D\\u043E.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ca.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Actualitzar p\\u00E0gines\n\n\n#XBUT\nButton.Add=Afegir\n#XBUT\nButton.Cancel=Cancel\\u00B7lar\n#XBUT\nButton.Copy=Copiar\n#XBUT\nButton.Create=Crear\n#XBUT\nButton.Delete=Suprimir\n#XBUT\nButton.Edit=Tractar\n#XBUT\nButton.Save=Desar\n#XBUT\nButton.Ok=D\'acord\n#XBUT\nButton.ShowCatalogs=Alternar cat\\u00E0legs\n#XBUT\nButton.SortCatalogs=Alternar ordre de classificaci\\u00F3 del cat\\u00E0leg\n#XBUT\nButton.CollapseCatalogs=Comprimir tots els cat\\u00E0legs\n#XBUT\nButton.ExpandCatalogs=Desplegar tots els cat\\u00E0legs\n#XBUT\nButton.ShowDetails=Mostrar detalls\n#XBUT\nButton.PagePreview=Previsualitzaci\\u00F3 de p\\u00E0gina\n\n\n#XTOL\nTooltip.AddToGroups=Afegir a grups\n#XTOL Tooltip for the search button\nTooltip.Search=Cercar\n#XTOL\nTooltip.SearchForTiles=Cercar mosaics\n\n\n#XFLD\nLabel.PageID=ID de p\\u00E0gina\n#XFLD\nLabel.WorkbenchRequest=Ordre de workenbch\n#XFLD\nLabel.Package=Paquet\n#XFLD\nLabel.TransportInformation=Informaci\\u00F3 de transport\n#XFLD\nLabel.Details=Detalls\\:\n#XFLD\nLabel.ResponseCode=Codi de resposta\\:\n#XFLD\nLabel.Description=Descripci\\u00F3\n#XFLD\nLabel.CreatedBy=Creat per\n#XFLD\nLabel.CreatedOn=Creat el\n#XFLD\nLabel.ChangedBy=Modificat per\n#XFLD\nLabel.ChangedOn=Modificat el\n#XFLD\nLabel.PageTitle=T\\u00EDtol de p\\u00E0gina\n#XFLD\nLabel.AssignedRole=Rol assignat\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=T\\u00EDtol\n#XCOL\nColumn.PageDescription=Descripci\\u00F3\n#XCOL\nColumn.PageCreatedBy=Creat per\n#XCOL\nColumn.PageCreatedOn=Creat el\n#XCOL\nColumn.PageChangedBy=Modificat per\n#XCOL\nColumn.PageChangedOn=Modificat el\n\n\n#XTOL\nPlaceholder.GroupName=Introduir nom de grup\n#XTOL\nPlaceholder.SearchForTiles=Cercar mosaics\n\n#MSG\nMessage.NoGroupTitle=El grup {0} no t\\u00E9 t\\u00EDtol. Per garantir una experi\\u00E8ncia d\'\'usuari consistent, es recomana introduir un nom de grup per a cada grup.\n#XMSG\nMessage.InvalidGroupTitle=Haur\\u00EDeu d\\u2019introduir un nom de grup.\n#XMSG\nMessage.NoInternetConnection=Verifiqueu la connexi\\u00F3 a Internet.\n#XMSG\nMessage.SavedChanges=S\'han desat les modificacions.\n#XMSG\nMessage.InvalidPageID=Feu servir nom\\u00E9s els seg\\u00FCents car\\u00E0cters\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Indiqueu un ID de p\\u00E0gina.\n#XMSG\nMessage.EmptyTitle=Indiqueu un t\\u00EDtol.\n#XMSG\nMessage.SuccessDeletePage=S\\u2019ha suprimit l\'objecte seleccionat.\n#XMSG\nMessage.ClipboardCopySuccess=Els detalls s\'han copiat correctament.\n#YMSE\nMessage.ClipboardCopyFail=S\'ha produ\\u00EFt un error en copiar els detalls.\n#XMSG\nMessage.DeletePageConfirmation=Segur que voleu suprimir \\n {0} {1}?\n#XMSG\nMessage.PageCreated=S\\u2019ha creat la p\\u00E0gina.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Cap mosaic\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Cap grup\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=No s\'\'ha pogut carregar el mosaic {0} al grup "{1}".\\n\\nSegurament a causa d\'\'una configuraci\\u00F3 de contingut de la plataforma de llan\\u00E7ament de SAP Fiori incorrecta o perqu\\u00E8 falta una assignaci\\u00F3 de rol.\\n\\nEl contingut no ser\\u00E0 visible per l\'\'usuari.\\n\\nPer solucionar aquest problema, verifiqueu els cat\\u00E0legs i les assignacions de destinaci\\u00F3 assignades a aquest rol.\n#XMSG\nMessage.NavigationTargetError=No s\'ha pogut solucionar la destinaci\\u00F3 de navegaci\\u00F3.\n#XMSG\nMessage.TilesHaveErrors=Alguns dels mosaics o grups tenen errors o advert\\u00E8ncies. Segur que voleu continuar desant les dades?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=No s\'\'ha pogut solucionar la destinaci\\u00F3 de navegaci\\u00F3 del mosaic\\: "{0}".\\n\\nSegurament a causa d\'\'una configuraci\\u00F3 de contingut de la plataforma de llan\\u00E7ament de SAP Fiori incorrecta o perqu\\u00E8 falta una assignaci\\u00F3 de rol.\\n\\nEl mosaic "{0}" es mostrar\\u00E0 a l\'\'usuari per\\u00F2 no podr\\u00E0 navegar utilitzant aquest mosaic.\n#XMSG\nMessage.DeleteGroup=Segur que voleu suprimir el grup "{0}"?\n#XMSG\nMessage.PageIsOutdated=Ja s\'ha desat una versi\\u00F3 m\\u00E9s recent d\'aquesta p\\u00E0gina.\n#XMSG\nMessage.SaveChanges=Deseu les modificacions.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=P\\u00E0gina nova\n#XTIT\nTitle.TilesHaveErrors=Els mosaics tenen errors\n#XTIT\nDeleteDialog.Title=Suprimir\n#XMSG\nDeleteDialog.Text=Segur que voleu suprimir la p\\u00E0gina seleccionada?\n#XBUT\nDeleteDialog.ConfirmButton=Suprimir\n#XTIT\nDeleteDialog.LockedTitle=P\\u00E0gina bloquejada\n#XMSG\nDeleteDialog.LockedText=L\\u2019usuari {0} ha bloquejat la p\\u00E0gina seleccionada.\n#XMSG\nDeleteDialog.TransportRequired=Seleccioneu un transport per suprimir la p\\u00E0gina seleccionada.\n\n#XMSG\nEditDialog.LockedText=L\\u2019usuari {0} ha bloquejat la p\\u00E0gina seleccionada.\n#XMSG\nEditDialog.TransportRequired=Seleccioneu un transport per editar la p\\u00E0gina seleccionada.\n#XTIT\nEditDialog.Title=Editar p\\u00E0gina\n\n#XTIT\nErrorDialog.Title=Error\n\n#XTIT\nPageOverview.Title=Actualitzar p\\u00E0gines\n\n\n#XTIT\nCopyDialog.Title=Copiar\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Voleu copiar {0}?\n#XFLD\nCopyDialog.NewID=C\\u00F2pia de {0}\n\n\n#XMSG\nTitle.NoGroupTitle=El t\\u00EDtol del grup {0} \\u00E9s buit.\n#XMSG\nTitle.UnsufficientRoles=Assignaci\\u00F3 de rol insuficient per mostrar el contingut\n#XMSG\nTitle.ContentIsNotVisible=El contingut ser\\u00E0 visible per l\'usuari.\n#XMSG\nTitle.ContentNotNavigateable=El contingut no ser\\u00E0 navegable.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_cs.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Prov\\u00E9st \\u00FAdr\\u017Ebu str\\u00E1nek\n\n\n#XBUT\nButton.Add=P\\u0159idat\n#XBUT\nButton.Cancel=Zru\\u0161it\n#XBUT\nButton.Copy=Kop\\u00EDrovat\n#XBUT\nButton.Create=Vytvo\\u0159it\n#XBUT\nButton.Delete=Odstranit\n#XBUT\nButton.Edit=Upravit\n#XBUT\nButton.Save=Ulo\\u017Eit\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=P\\u0159epnout katalogy\n#XBUT\nButton.SortCatalogs=P\\u0159epnout po\\u0159ad\\u00ED t\\u0159\\u00EDd\\u011Bn\\u00ED katalogu\n#XBUT\nButton.CollapseCatalogs=Sbalit v\\u0161echny katalogy\n#XBUT\nButton.ExpandCatalogs=Rozbalit v\\u0161echny katalogy\n#XBUT\nButton.ShowDetails=Zobrazit detaily\n#XBUT\nButton.PagePreview=N\\u00E1hled str\\u00E1nky\n\n\n#XTOL\nTooltip.AddToGroups=P\\u0159idat ke skupin\\u00E1m\n#XTOL Tooltip for the search button\nTooltip.Search=Hledat\n#XTOL\nTooltip.SearchForTiles=Hledat dla\\u017Edice\n\n\n#XFLD\nLabel.PageID=ID str\\u00E1nky\n#XFLD\nLabel.WorkbenchRequest=Po\\u017Eadavek na workbench\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Informace o transportu\n#XFLD\nLabel.Details=Detaily\\:\n#XFLD\nLabel.ResponseCode=K\\u00F3d odpov\\u011Bdi\\:\n#XFLD\nLabel.Description=Popis\n#XFLD\nLabel.CreatedBy=Vytvo\\u0159il(a)\n#XFLD\nLabel.CreatedOn=Vytvo\\u0159eno dne\n#XFLD\nLabel.ChangedBy=Autor zm\\u011Bny\n#XFLD\nLabel.ChangedOn=Zm\\u011Bn\\u011Bno dne\n#XFLD\nLabel.PageTitle=Titulek str\\u00E1nky\n#XFLD\nLabel.AssignedRole=P\\u0159i\\u0159azen\\u00E1 role\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titulek\n#XCOL\nColumn.PageDescription=Popis\n#XCOL\nColumn.PageCreatedBy=Vytvo\\u0159il(a)\n#XCOL\nColumn.PageCreatedOn=Vytvo\\u0159eno dne\n#XCOL\nColumn.PageChangedBy=Autor zm\\u011Bny\n#XCOL\nColumn.PageChangedOn=Zm\\u011Bn\\u011Bno dne\n\n\n#XTOL\nPlaceholder.GroupName=Zadejte n\\u00E1zev skupiny\n#XTOL\nPlaceholder.SearchForTiles=Hledat dla\\u017Edice\n\n#MSG\nMessage.NoGroupTitle=Skupina {0} nem\\u00E1 titulek. Pro zaji\\u0161t\\u011Bn\\u00ED konzistentn\\u00ED u\\u017Eivatelsk\\u00E9 zku\\u0161enosti doporu\\u010Dujeme zad\\u00E1n\\u00ED n\\u00E1zvu skupiny pro ka\\u017Edou skupinu.\n#XMSG\nMessage.InvalidGroupTitle=V ide\\u00E1ln\\u00EDm p\\u0159\\u00EDpad\\u011B byste m\\u011Bli zadat n\\u00E1zev skupiny.\n#XMSG\nMessage.NoInternetConnection=Zkontrolujte va\\u0161e p\\u0159ipojen\\u00ED k internetu.\n#XMSG\nMessage.SavedChanges=Va\\u0161e zm\\u011Bny byly ulo\\u017Eeny.\n#XMSG\nMessage.InvalidPageID=Pou\\u017E\\u00EDvejte jen n\\u00E1sleduj\\u00EDc\\u00ED znaky\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Zadejte ID str\\u00E1nky.\n#XMSG\nMessage.EmptyTitle=Zadejte dla\\u017Edici.\n#XMSG\nMessage.SuccessDeletePage=Vybran\\u00FD objekt byl odstran\\u011Bn.\n#XMSG\nMessage.ClipboardCopySuccess=Detaily byly \\u00FAsp\\u011B\\u0161n\\u011B zkop\\u00EDrov\\u00E1ny.\n#YMSE\nMessage.ClipboardCopyFail=P\\u0159i kop\\u00EDrov\\u00E1n\\u00ED detail\\u016F do\\u0161lo k chyb\\u011B.\n#XMSG\nMessage.DeletePageConfirmation=Opravdu chcete odstranit \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Str\\u00E1nka byla vytvo\\u0159ena.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u017D\\u00E1dn\\u00E9 dla\\u017Edice\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u017D\\u00E1dn\\u00E9 skupiny\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Nezda\\u0159ilo se zav\\u00E9st dla\\u017Edici {0} do skupiny "{1}".\\n\\nTo je zp\\u016Fsobeno pravd\\u011Bpodobn\\u011B nespr\\u00E1vnou konfigurac\\u00ED obsahu launchpadu SAP Fiori nebo chyb\\u011Bj\\u00EDc\\u00EDm p\\u0159i\\u0159azen\\u00EDm role.\\n\\nObsah bude pro u\\u017Eivatele neviditeln\\u00FD.\\n\\nAbyste tento probl\\u00E9m vy\\u0159e\\u0161ili, zkontrolujte katalogy a mapov\\u00E1n\\u00ED c\\u00EDl\\u016F p\\u0159i\\u0159azen\\u00E9 k t\\u00E9to roli.\n#XMSG\nMessage.NavigationTargetError=C\\u00EDl navigace nebylo mo\\u017En\\u00E9 rozli\\u0161it.\n#XMSG\nMessage.TilesHaveErrors=N\\u011Bkter\\u00E9 z dla\\u017Edic nebo skupin maj\\u00ED chyby nebo upozorn\\u011Bn\\u00ED. Opravdu chcete pokra\\u010Dovat v ukl\\u00E1d\\u00E1n\\u00ED?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Nezda\\u0159ilo se rozli\\u0161it c\\u00EDl navigace dla\\u017Edice\\: "{0}".\\n\\nTo je zp\\u016Fsobeno pravd\\u011Bpodobn\\u011B nespr\\u00E1vnou konfigurac\\u00ED obsahu launchpadu SAP Fiori nebo chyb\\u011Bj\\u00EDc\\u00EDm p\\u0159i\\u0159azen\\u00EDm role.\\n\\nDla\\u017Edice "{0}" se u\\u017Eivateli zobraz\\u00ED, ale u\\u017Eivatel nebude moci pomoc\\u00ED t\\u00E9to dla\\u017Edice navigovat.\n#XMSG\nMessage.DeleteGroup=Opravdu chcete skupinu "{0}" odstranit?\n#XMSG\nMessage.PageIsOutdated=Ji\\u017E byla ulo\\u017Eena nov\\u011Bj\\u0161\\u00ED verze t\\u00E9to str\\u00E1nky.\n#XMSG\nMessage.SaveChanges=Ulo\\u017Ete va\\u0161e zm\\u011Bny.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nov\\u00E1 str\\u00E1nka\n#XTIT\nTitle.TilesHaveErrors=Dla\\u017Edice maj\\u00ED chyby\n#XTIT\nDeleteDialog.Title=Odstranit\n#XMSG\nDeleteDialog.Text=Chcete opravdu odstranit vybranou str\\u00E1nku?\n#XBUT\nDeleteDialog.ConfirmButton=Odstranit\n#XTIT\nDeleteDialog.LockedTitle=Str\\u00E1nka blokov\\u00E1na\n#XMSG\nDeleteDialog.LockedText=Vybran\\u00E1 str\\u00E1nka je blokov\\u00E1na u\\u017Eivatelem {0}.\n#XMSG\nDeleteDialog.TransportRequired=Vyberte transport pro odstran\\u011Bn\\u00ED vybran\\u00E9 str\\u00E1nky.\n\n#XMSG\nEditDialog.LockedText=Vybran\\u00E1 str\\u00E1nka je blokov\\u00E1na u\\u017Eivatelem {0}.\n#XMSG\nEditDialog.TransportRequired=Vyberte transport pro \\u00FApravu vybran\\u00E9 str\\u00E1nky.\n#XTIT\nEditDialog.Title=Upravit str\\u00E1nku\n\n#XTIT\nErrorDialog.Title=Chyba\n\n#XTIT\nPageOverview.Title=Prov\\u00E9st \\u00FAdr\\u017Ebu str\\u00E1nek\n\n\n#XTIT\nCopyDialog.Title=Kop\\u00EDrovat\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Chcete kop\\u00EDrovat {0}?\n#XFLD\nCopyDialog.NewID=Kopie {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Titulek skupiny {0} je pr\\u00E1zdn\\u00FD.\n#XMSG\nTitle.UnsufficientRoles=Nedostate\\u010Dn\\u00E9 p\\u0159i\\u0159azen\\u00ED role pro zobrazen\\u00ED obsahu\n#XMSG\nTitle.ContentIsNotVisible=Obsah bude pro u\\u017Eivatele neviditeln\\u00FD.\n#XMSG\nTitle.ContentNotNavigateable=Obsah nebude schopn\\u00FD navigace.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_da.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Vedligehold sider\n\n\n#XBUT\nButton.Add=Tilf\\u00F8j\n#XBUT\nButton.Cancel=Afbryd\n#XBUT\nButton.Copy=Kopi\\u00E9r\n#XBUT\nButton.Create=Opret\n#XBUT\nButton.Delete=Slet\n#XBUT\nButton.Edit=Rediger\n#XBUT\nButton.Save=Gem\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Skift kataloger\n#XBUT\nButton.SortCatalogs=Skift sorteringsr\\u00E6kkef\\u00F8lge for katalog\n#XBUT\nButton.CollapseCatalogs=Komprimer alle kataloger\n#XBUT\nButton.ExpandCatalogs=Ekspander alle kataloger\n#XBUT\nButton.ShowDetails=Vis detaljer\n#XBUT\nButton.PagePreview=Sideeksempel\n\n\n#XTOL\nTooltip.AddToGroups=Tilf\\u00F8j til grupper\n#XTOL Tooltip for the search button\nTooltip.Search=S\\u00F8g\n#XTOL\nTooltip.SearchForTiles=S\\u00F8g efter fliser\n\n\n#XFLD\nLabel.PageID=Side-ID\n#XFLD\nLabel.WorkbenchRequest=Workbench-ordre\n#XFLD\nLabel.Package=Pakke\n#XFLD\nLabel.TransportInformation=Transportinformationer\n#XFLD\nLabel.Details=Detaljer\\:\n#XFLD\nLabel.ResponseCode=Svarkode\\:\n#XFLD\nLabel.Description=Beskrivelse\n#XFLD\nLabel.CreatedBy=Oprettet af\n#XFLD\nLabel.CreatedOn=Oprettet den\n#XFLD\nLabel.ChangedBy=\\u00C6ndret af\n#XFLD\nLabel.ChangedOn=\\u00C6ndret den\n#XFLD\nLabel.PageTitle=Sidetitel\n#XFLD\nLabel.AssignedRole=Allokeret rolle\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titel\n#XCOL\nColumn.PageDescription=Beskrivelse\n#XCOL\nColumn.PageCreatedBy=Oprettet af\n#XCOL\nColumn.PageCreatedOn=Oprettet den\n#XCOL\nColumn.PageChangedBy=\\u00C6ndret af\n#XCOL\nColumn.PageChangedOn=\\u00C6ndret den\n\n\n#XTOL\nPlaceholder.GroupName=Indtast navn p\\u00E5 gruppe\n#XTOL\nPlaceholder.SearchForTiles=S\\u00F8g efter fliser\n\n#MSG\nMessage.NoGroupTitle=Gruppe {0} har ikke en titel. Vi anbefaler, at du indtaster et gruppenavn for hver gruppe for at f\\u00E5 en konsistent brugeroplevelse.\n#XMSG\nMessage.InvalidGroupTitle=Ideelt set b\\u00F8r du indtaste et gruppenavn.\n#XMSG\nMessage.NoInternetConnection=Kontroller din internetforbindelse.\n#XMSG\nMessage.SavedChanges=Dine \\u00E6ndringer er gemt.\n#XMSG\nMessage.InvalidPageID=Anvend kun f\\u00F8lgende tegn\\: A-\\u00C5 a-\\u00E5 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Angiv side-ID\'en.\n#XMSG\nMessage.EmptyTitle=Angiv titlen.\n#XMSG\nMessage.SuccessDeletePage=Det valgte objekt er slettet.\n#XMSG\nMessage.ClipboardCopySuccess=Detaljer blev kopieret uden fejl.\n#YMSE\nMessage.ClipboardCopyFail=Der opstod en fejl ved kopiering af detaljer.\n#XMSG\nMessage.DeletePageConfirmation=Er du sikker p\\u00E5, at du vil slette \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Siden er oprettet.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Ingen fliser\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Ingen grupper\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Kunne ikke indl\\u00E6se {0} flise i gruppe "{1}".\\n\\nDette skyldes h\\u00F8jst sandsynligt en forkert SAP Fiori-launchpad-indholdskonfiguration eller en manglende rolleallokering.\\n\\nIndholdet bliver usynligt for brugeren.\\n\\nFor at l\\u00F8se dette problem skal du kontrollere katalogerne og m\\u00E5lallokeringerne, der er allokeret til denne rolle.\n#XMSG\nMessage.NavigationTargetError=Navigationsm\\u00E5let kunne ikke opl\\u00F8ses.\n#XMSG\nMessage.TilesHaveErrors=Nogle af fliserne eller grupperne har fejl eller advarsler. Er du sikker p\\u00E5, at du vil forts\\u00E6tte med at gemme?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Kunne ikke opl\\u00F8se navigationsm\\u00E5let for flise\\: "{0}".\\n\\n Dette skyldes h\\u00F8jst sandsynligt en forkert SAP Fiori-launchpad-indholdskonfiguration eller en manglende rolleallokering.\\n\\n Flise "{0}" vises til brugeren, men brugeren vil ikke v\\u00E6re i stand til at navigere ved hj\\u00E6lp af denne flise.\n#XMSG\nMessage.DeleteGroup=Er du sikker p\\u00E5, at du vil slette gruppe "{0}"?\n#XMSG\nMessage.PageIsOutdated=En nyere version af denne side er allerede gemt.\n#XMSG\nMessage.SaveChanges=Gem dine \\u00E6ndringer.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Ny side\n#XTIT\nTitle.TilesHaveErrors=Fliserne har fejl\n#XTIT\nDeleteDialog.Title=Slet\n#XMSG\nDeleteDialog.Text=Er du sikker p\\u00E5, du vil slette den valgte side?\n#XBUT\nDeleteDialog.ConfirmButton=Slet\n#XTIT\nDeleteDialog.LockedTitle=Side sp\\u00E6rret\n#XMSG\nDeleteDialog.LockedText=Den valgte side er sp\\u00E6rret af bruger {0}.\n#XMSG\nDeleteDialog.TransportRequired=V\\u00E6lg en transport for at slette den valgte side.\n\n#XMSG\nEditDialog.LockedText=Den valgte side er sp\\u00E6rret af bruger {0}.\n#XMSG\nEditDialog.TransportRequired=V\\u00E6lg en transport for at redigere den valgte side.\n#XTIT\nEditDialog.Title=Rediger side\n\n#XTIT\nErrorDialog.Title=Fejl\n\n#XTIT\nPageOverview.Title=Vedligehold sider\n\n\n#XTIT\nCopyDialog.Title=Kopi\\u00E9r\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Vil du kopiere {0}?\n#XFLD\nCopyDialog.NewID=Kopi af {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Gruppetitel p\\u00E5 gruppe {0} er tom.\n#XMSG\nTitle.UnsufficientRoles=Utilstr\\u00E6kkelig rolleallokering til at vise indhold\n#XMSG\nTitle.ContentIsNotVisible=Indhold bliver usynligt for brugeren.\n#XMSG\nTitle.ContentNotNavigateable=Indhold vil ikke v\\u00E6re navigerbart.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_de.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Seiten pflegen\n\n\n#XBUT\nButton.Add=Hinzuf\\u00FCgen\n#XBUT\nButton.Cancel=Abbrechen\n#XBUT\nButton.Copy=Kopieren\n#XBUT\nButton.Create=Anlegen\n#XBUT\nButton.Delete=L\\u00F6schen\n#XBUT\nButton.Edit=Bearbeiten\n#XBUT\nButton.Save=Sichern\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Kataloge wechseln\n#XBUT\nButton.SortCatalogs=Katalogsortierreihenfolge wechseln\n#XBUT\nButton.CollapseCatalogs=Alle Kataloge komprimieren\n#XBUT\nButton.ExpandCatalogs=Alle Kataloge expandieren\n#XBUT\nButton.ShowDetails=Details anzeigen\n#XBUT\nButton.PagePreview=Seitenvorschau\n\n\n#XTOL\nTooltip.AddToGroups=Zu Gruppen hinzuf\\u00FCgen\n#XTOL Tooltip for the search button\nTooltip.Search=Suchen\n#XTOL\nTooltip.SearchForTiles=Kacheln suchen\n\n\n#XFLD\nLabel.PageID=Seiten-ID\n#XFLD\nLabel.WorkbenchRequest=Workbench-Auftrag\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Transportinformationen\n#XFLD\nLabel.Details=Details\\:\n#XFLD\nLabel.ResponseCode=Antwortcode\\:\n#XFLD\nLabel.Description=Beschreibung\n#XFLD\nLabel.CreatedBy=Angelegt von\n#XFLD\nLabel.CreatedOn=Angelegt am\n#XFLD\nLabel.ChangedBy=Ge\\u00E4ndert von\n#XFLD\nLabel.ChangedOn=Ge\\u00E4ndert am\n#XFLD\nLabel.PageTitle=Seitentitel\n#XFLD\nLabel.AssignedRole=Zugewiesene Rolle\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titel\n#XCOL\nColumn.PageDescription=Beschreibung\n#XCOL\nColumn.PageCreatedBy=Angelegt von\n#XCOL\nColumn.PageCreatedOn=Angelegt am\n#XCOL\nColumn.PageChangedBy=Ge\\u00E4ndert von\n#XCOL\nColumn.PageChangedOn=Ge\\u00E4ndert am\n\n\n#XTOL\nPlaceholder.GroupName=Gruppennamen eingeben\n#XTOL\nPlaceholder.SearchForTiles=Kacheln suchen\n\n#MSG\nMessage.NoGroupTitle=Die Gruppe {0} hat keinen Titel. F\\u00FCr eine konsistente Benutzerfreundlichkeit empfehlen wir, f\\u00FCr jede Gruppe einen Gruppennamen einzugeben.\n#XMSG\nMessage.InvalidGroupTitle=Im Idealfall sollten Sie einen Gruppennamen eingeben.\n#XMSG\nMessage.NoInternetConnection=Bitte pr\\u00FCfen Sie Ihre Internetverbindung.\n#XMSG\nMessage.SavedChanges=Ihre \\u00C4nderungen wurden gesichert.\n#XMSG\nMessage.InvalidPageID=Bitte verwenden Sie nur die folgenden Zeichen\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Bitte geben Sie die Seiten-ID an.\n#XMSG\nMessage.EmptyTitle=Bitte geben Sie den Titel an.\n#XMSG\nMessage.SuccessDeletePage=Das ausgew\\u00E4hlte Objekt wurde gel\\u00F6scht.\n#XMSG\nMessage.ClipboardCopySuccess=Details wurden erfolgreich kopiert.\n#YMSE\nMessage.ClipboardCopyFail=Fehler beim Kopieren der Details.\n#XMSG\nMessage.DeletePageConfirmation=Sind Sie sicher, dass Sie \\n {0} {1} l\\u00F6schen wollen?\n#XMSG\nMessage.PageCreated=Die Seite wurde angelegt.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Keine Kacheln\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Keine Gruppen\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Die Kachel {0} in der Gruppe "{1}" konnte nicht geladen werden.\\n\\nM\\u00F6gliche Ursache\\: Entweder ist der Inhalt des SAP Fiori Launchpad inkorrekt konfiguriert worden oder es fehlt eine Rollenzuordnung.\\n\\nDer Inhalt ist f\\u00FCr den Benutzer nicht sichtbar.\\n\\nBitte pr\\u00FCfen Sie zur L\\u00F6sung des Problems die Kataloge und Zielzuordnungen, die dieser Rolle zugeordnet sind.\n#XMSG\nMessage.NavigationTargetError=Das Navigationsziel konnte nicht aufgel\\u00F6st werden.\n#XMSG\nMessage.TilesHaveErrors=Einige der Kacheln oder Gruppen haben Fehler oder Warnungen. Wollen Sie wirklich mit dem Sichern fortfahren?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Das Navigationsziel der Kachel "{0}" konnte nicht aufgel\\u00F6st werden.\\n\\nM\\u00F6gliche Ursache\\: Entweder ist der Inhalt des SAP Fiori Launchpad inkorrekt konfiguriert worden oder es fehlt eine Rollenzuordnung.\\n\\nDie Kachel "{0}" ist f\\u00FCr den Benutzer sichtbar, aber der Benutzer kann mithilfe dieser Kachel nicht navigieren.\n#XMSG\nMessage.DeleteGroup=Wollen Sie die Gruppe "{0}" wirklich l\\u00F6schen?\n#XMSG\nMessage.PageIsOutdated=Eine neuere Version dieser Seite wurde bereits gesichert.\n#XMSG\nMessage.SaveChanges=Bitte sichern Sie Ihre \\u00C4nderungen.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Neue Seite\n#XTIT\nTitle.TilesHaveErrors=Kacheln haben Fehler\n#XTIT\nDeleteDialog.Title=L\\u00F6schen\n#XMSG\nDeleteDialog.Text=Wollen Sie die ausgew\\u00E4hlte Seite wirklich l\\u00F6schen?\n#XBUT\nDeleteDialog.ConfirmButton=L\\u00F6schen\n#XTIT\nDeleteDialog.LockedTitle=Seite gesperrt\n#XMSG\nDeleteDialog.LockedText=Die ausgew\\u00E4hlte Seite ist durch Benutzer {0} gesperrt.\n#XMSG\nDeleteDialog.TransportRequired=Bitte w\\u00E4hlen Sie einen Transport aus, um die ausgew\\u00E4hlte Seite zu l\\u00F6schen.\n\n#XMSG\nEditDialog.LockedText=Die ausgew\\u00E4hlte Seite ist durch Benutzer {0} gesperrt.\n#XMSG\nEditDialog.TransportRequired=Bitte w\\u00E4hlen Sie einen Transport aus, um die ausgew\\u00E4hlte Seite zu bearbeiten.\n#XTIT\nEditDialog.Title=Seite bearbeiten\n\n#XTIT\nErrorDialog.Title=Fehler\n\n#XTIT\nPageOverview.Title=Seiten pflegen\n\n\n#XTIT\nCopyDialog.Title=Kopieren\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Wollen Sie {0} kopieren?\n#XFLD\nCopyDialog.NewID=Kopie von {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Gruppentitel der Gruppe {0} ist leer.\n#XMSG\nTitle.UnsufficientRoles=Rollenzuordnung ist unzureichend f\\u00FCr Inhaltsanzeige\n#XMSG\nTitle.ContentIsNotVisible=Der Inhalt ist f\\u00FCr den Benutzer nicht sichtbar.\n#XMSG\nTitle.ContentNotNavigateable=Der Inhalt ist nicht navigierbar.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_el.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u03A3\\u03C5\\u03BD\\u03C4\\u03AE\\u03C1\\u03B7\\u03C3\\u03B7 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03C9\\u03BD\n\n\n#XBUT\nButton.Add=\\u03A0\\u03C1\\u03BF\\u03C3\\u03B8\\u03AE\\u03BA\\u03B7\n#XBUT\nButton.Cancel=\\u0391\\u03BA\\u03CD\\u03C1\\u03C9\\u03C3\\u03B7\n#XBUT\nButton.Copy=\\u0391\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XBUT\nButton.Create=\\u0394\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AF\\u03B1\n#XBUT\nButton.Delete=\\u0394\\u03B9\\u03B1\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XBUT\nButton.Edit=E\\u03C0\\u03B5\\u03BE\\u03B5\\u03C1\\u03B3\\u03B1\\u03C3\\u03AF\\u03B1\n#XBUT\nButton.Save=\\u0391\\u03C0\\u03BF\\u03B8\\u03AE\\u03BA\\u03B5\\u03C5\\u03C3\\u03B7\n#XBUT\nButton.Ok=\\u039F\\u039A\n#XBUT\nButton.ShowCatalogs=\\u0395\\u03BD\\u03B1\\u03BB\\u03BB\\u03B1\\u03B3\\u03AE \\u039A\\u03B1\\u03C4\\u03B1\\u03BB\\u03CC\\u03B3\\u03C9\\u03BD\n#XBUT\nButton.SortCatalogs=\\u0395\\u03BD\\u03B1\\u03BB\\u03BB\\u03B1\\u03B3\\u03AE \\u03A3\\u03B5\\u03B9\\u03C1\\u03AC\\u03C2 \\u03A4\\u03B1\\u03BE\\u03B9\\u03BD\\u03CC\\u03BC\\u03B7\\u03C3\\u03B7\\u03C2 \\u039A\\u03B1\\u03C4\\u03B1\\u03BB\\u03CC\\u03B3\\u03BF\\u03C5\n#XBUT\nButton.CollapseCatalogs=\\u03A3\\u03CD\\u03BC\\u03C0\\u03C4\\u03C5\\u03BE\\u03B7 \\u039F\\u03BB\\u03C9\\u03BD \\u03C4\\u03C9\\u03BD \\u039A\\u03B1\\u03C4\\u03B1\\u03BB\\u03CC\\u03B3\\u03C9\\u03BD\n#XBUT\nButton.ExpandCatalogs=\\u0395\\u03C0\\u03AD\\u03BA\\u03C4\\u03B1\\u03C3\\u03B7 \\u039F\\u03BB\\u03C9\\u03BD \\u03C4\\u03C9\\u03BD \\u039A\\u03B1\\u03C4\\u03B1\\u03BB\\u03CC\\u03B3\\u03C9\\u03BD\n#XBUT\nButton.ShowDetails=\\u0395\\u03BC\\u03C6\\u03AC\\u03BD\\u03B9\\u03C3\\u03B7 \\u039B\\u03B5\\u03C0\\u03C4\\u03BF\\u03BC\\u03B5\\u03C1\\u03B5\\u03B9\\u03CE\\u03BD\n#XBUT\nButton.PagePreview=\\u03A0\\u03C1\\u03BF\\u03B5\\u03C0\\u03B9\\u03C3\\u03BA\\u03CC\\u03C0\\u03B7\\u03C3\\u03B7 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2\n\n\n#XTOL\nTooltip.AddToGroups=\\u03A0\\u03C1\\u03BF\\u03C3\\u03B8\\u03AE\\u03BA\\u03B7 \\u03C3\\u03B5 \\u039F\\u03BC\\u03AC\\u03B4\\u03B5\\u03C2\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0391\\u03BD\\u03B1\\u03B6\\u03AE\\u03C4\\u03B7\\u03C3\\u03B7\n#XTOL\nTooltip.SearchForTiles=\\u0391\\u03BD\\u03B1\\u03B6\\u03AE\\u03C4\\u03B7\\u03C3\\u03B7 \\u03A0\\u03BB\\u03B1\\u03BA\\u03B9\\u03B4\\u03AF\\u03C9\\u03BD\n\n\n#XFLD\nLabel.PageID=ID \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2\n#XFLD\nLabel.WorkbenchRequest=\\u0391\\u03AF\\u03C4\\u03B7\\u03C3\\u03B7 \\u03A0\\u03B5\\u03B4\\u03AF\\u03BF\\u03C5 \\u0395\\u03C1\\u03B3\\u03B1\\u03C3\\u03B9\\u03CE\\u03BD\n#XFLD\nLabel.Package=\\u03A0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF\n#XFLD\nLabel.TransportInformation=\\u03A0\\u03BB\\u03B7\\u03C1\\u03BF\\u03C6\\u03BF\\u03C1\\u03AF\\u03B5\\u03C2 \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\\u03C2\n#XFLD\nLabel.Details=\\u039B\\u03B5\\u03C0\\u03C4\\u03BF\\u03BC\\u03AD\\u03C1\\u03B5\\u03B9\\u03B5\\u03C2\\:\n#XFLD\nLabel.ResponseCode=\\u039A\\u03C9\\u03B4\\u03B9\\u03BA\\u03CC\\u03C2 \\u0391\\u03C0\\u03AC\\u03BD\\u03C4\\u03B7\\u03C3\\u03B7\\u03C2\\:\n#XFLD\nLabel.Description=\\u03A0\\u03B5\\u03C1\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XFLD\nLabel.CreatedBy=\\u0394\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u0391\\u03C0\\u03CC\n#XFLD\nLabel.CreatedOn=\\u0394\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u03A3\\u03C4\\u03B9\\u03C2\n#XFLD\nLabel.ChangedBy=\\u0391\\u03BB\\u03BB\\u03B1\\u03B3\\u03BC\\u03AD\\u03BD\\u03BF \\u0391\\u03C0\\u03CC\n#XFLD\nLabel.ChangedOn=\\u0391\\u03BB\\u03BB\\u03B1\\u03BE\\u03B5 \\u03A3\\u03C4\\u03B9\\u03C2\n#XFLD\nLabel.PageTitle=\\u03A4\\u03AF\\u03C4\\u03BB\\u03BF\\u03C2 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2\n#XFLD\nLabel.AssignedRole=\\u0391\\u03BD\\u03C4\\u03B9\\u03C3\\u03C4\\u03BF\\u03B9\\u03C7\\u03B9\\u03C3\\u03BC\\u03AD\\u03BD\\u03BF\\u03C2 \\u03A1\\u03CC\\u03BB\\u03BF\\u03C2\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u03A4\\u03AF\\u03C4\\u03BB\\u03BF\\u03C2\n#XCOL\nColumn.PageDescription=\\u03A0\\u03B5\\u03C1\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XCOL\nColumn.PageCreatedBy=\\u0394\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u0391\\u03C0\\u03CC\n#XCOL\nColumn.PageCreatedOn=\\u0394\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u03A3\\u03C4\\u03B9\\u03C2\n#XCOL\nColumn.PageChangedBy=\\u0391\\u03BB\\u03BB\\u03B1\\u03B3\\u03BC\\u03AD\\u03BD\\u03BF \\u0391\\u03C0\\u03CC\n#XCOL\nColumn.PageChangedOn=\\u0391\\u03BB\\u03BB\\u03B1\\u03BE\\u03B5 \\u03A3\\u03C4\\u03B9\\u03C2\n\n\n#XTOL\nPlaceholder.GroupName=\\u039A\\u03B1\\u03C4\\u03B1\\u03C7\\u03CE\\u03C1\\u03B9\\u03C3\\u03B7 \\u03BF\\u03BD\\u03CC\\u03BC\\u03B1\\u03C4\\u03BF\\u03C2 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1\\u03C2\n#XTOL\nPlaceholder.SearchForTiles=\\u0391\\u03BD\\u03B1\\u03B6\\u03AE\\u03C4\\u03B7\\u03C3\\u03B7 \\u03C0\\u03BB\\u03B1\\u03BA\\u03B9\\u03B4\\u03AF\\u03C9\\u03BD\n\n#MSG\nMessage.NoGroupTitle=\\u0397 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1 {0} \\u03B4\\u03B5\\u03BD \\u03AD\\u03C7\\u03B5\\u03B9 \\u03C4\\u03AF\\u03C4\\u03BB\\u03BF. \\u0393\\u03B9\\u03B1 \\u03BD\\u03B1 \\u03B5\\u03BE\\u03B1\\u03C3\\u03C6\\u03B1\\u03BB\\u03AF\\u03C3\\u03B5\\u03C4\\u03B5 \\u03B1\\u03C0\\u03C1\\u03CC\\u03C3\\u03BA\\u03BF\\u03C0\\u03C4\\u03B7 \\u03B5\\u03BC\\u03C0\\u03B5\\u03B9\\u03C1\\u03AF\\u03B1 \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7, \\u03C3\\u03B1\\u03C2 \\u03C0\\u03C1\\u03BF\\u03C4\\u03B5\\u03AF\\u03BD\\u03BF\\u03C5\\u03BC\\u03B5 \\u03BD\\u03B1 \\u03B5\\u03B9\\u03C3\\u03AC\\u03B3\\u03B5\\u03C4\\u03B5 \\u03C4\\u03BF \\u03CC\\u03BD\\u03BF\\u03BC\\u03B1 \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7 \\u03B3\\u03B9\\u03B1 \\u03BA\\u03AC\\u03B8\\u03B5 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1.\n#XMSG\nMessage.InvalidGroupTitle=\\u0399\\u03B4\\u03B1\\u03BD\\u03B9\\u03BA\\u03AC, \\u03C0\\u03C1\\u03AD\\u03C0\\u03B5\\u03B9 \\u03BD\\u03B1 \\u03B5\\u03B9\\u03C3\\u03AC\\u03B3\\u03B5\\u03C4\\u03B5 \\u03CC\\u03BD\\u03BF\\u03BC\\u03B1 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1\\u03C2.\n#XMSG\nMessage.NoInternetConnection=\\u0395\\u03BB\\u03AD\\u03B3\\u03BE\\u03C4\\u03B5 \\u03C4\\u03B7 \\u03C3\\u03CD\\u03BD\\u03B4\\u03B5\\u03C3\\u03AE \\u03C3\\u03B1\\u03C2 \\u03C3\\u03C4\\u03BF \\u03B4\\u03B9\\u03B1\\u03B4\\u03AF\\u03BA\\u03C4\\u03C5\\u03BF.\n#XMSG\nMessage.SavedChanges=\\u039F\\u03B9 \\u03B1\\u03BB\\u03BB\\u03B1\\u03B3\\u03AD\\u03C2 \\u03C3\\u03B1\\u03C2 \\u03B1\\u03C0\\u03BF\\u03B8\\u03B7\\u03BA\\u03B5\\u03CD\\u03C4\\u03B7\\u03BA\\u03B1\\u03BD.\n#XMSG\nMessage.InvalidPageID=\\u03A7\\u03C1\\u03B7\\u03C3\\u03B9\\u03BC\\u03BF\\u03C0\\u03BF\\u03B9\\u03AE\\u03C3\\u03C4\\u03B5 \\u03BC\\u03CC\\u03BD\\u03BF \\u03C4\\u03BF\\u03C5\\u03C2 \\u03B5\\u03BE\\u03AE\\u03C2 \\u03C7\\u03B1\\u03C1\\u03B1\\u03BA\\u03C4\\u03AE\\u03C1\\u03B5\\u03C2\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0395\\u03B9\\u03C3\\u03AC\\u03B3\\u03B5\\u03C4\\u03B5 \\u03C4\\u03BF ID \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2.\n#XMSG\nMessage.EmptyTitle=\\u0395\\u03B9\\u03C3\\u03AC\\u03B3\\u03B5\\u03C4\\u03B5 \\u03C4\\u03BF\\u03BD \\u03C4\\u03AF\\u03C4\\u03BB\\u03BF.\n#XMSG\nMessage.SuccessDeletePage=\\u03A4\\u03BF \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03BF \\u03B1\\u03BD\\u03C4\\u03B9\\u03BA\\u03B5\\u03AF\\u03BC\\u03B5\\u03BD\\u03BF \\u03B4\\u03B9\\u03B1\\u03B3\\u03C1\\u03AC\\u03C6\\u03B7\\u03BA\\u03B5.\n#XMSG\nMessage.ClipboardCopySuccess=\\u039B\\u03B5\\u03C0\\u03C4\\u03BF\\u03BC\\u03AD\\u03C1\\u03B5\\u03B9\\u03B5\\u03C2 \\u03B1\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03AC\\u03C6\\u03B7\\u03BA\\u03B1\\u03BD \\u03B5\\u03C0\\u03B9\\u03C4\\u03C5\\u03C7\\u03CE\\u03C2.\n#YMSE\nMessage.ClipboardCopyFail=\\u03A3\\u03C6\\u03AC\\u03BB\\u03BC\\u03B1 \\u03B5\\u03BC\\u03C6\\u03B1\\u03BD\\u03AF\\u03C3\\u03C4\\u03B7\\u03BA\\u03B5 \\u03B1\\u03BA\\u03C4\\u03AC \\u03C4\\u03B7\\u03BD \\u03B1\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE \\u03BB\\u03B5\\u03C0\\u03C4\\u03BF\\u03BC\\u03B5\\u03C1\\u03B5\\u03B9\\u03CE\\u03BD.\n#XMSG\nMessage.DeletePageConfirmation=\\u0398\\u03AD\\u03BB\\u03B5\\u03C4\\u03B5 \\u03BD\\u03B1 \\u03B4\\u03B9\\u03B1\\u03B3\\u03C1\\u03AC\\u03C8\\u03B5\\u03C4\\u03B5 \\n {0} {1};\n#XMSG\nMessage.PageCreated=\\u0397 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1 \\u03B4\\u03B7\\u03BC\\u03B9\\u03BF\\u03C5\\u03C1\\u03B3\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u03A7\\u03C9\\u03C1\\u03AF\\u03C2 \\u03C0\\u03BB\\u03B1\\u03BA\\u03AF\\u03B4\\u03B9\\u03B1\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u039A\\u03B1\\u03BC\\u03AF\\u03B1 \\u039F\\u03BC\\u03AC\\u03B4\\u03B1\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u0391\\u03C0\\u03BF\\u03C4\\u03C5\\u03C7\\u03AF\\u03B1 \\u03C6\\u03CC\\u03C1\\u03C4\\u03C9\\u03C3\\u03B7\\u03C2 \\u03C4\\u03BF\\u03C5 \\u03C0\\u03BB\\u03B1\\u03BA\\u03B9\\u03B4\\u03AF\\u03BF\\u03C5 {0} \\u03C3\\u03C4\\u03B7\\u03BD \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1 \\u00AB{1}\\u00BB.\\n\\n\\u0391\\u03C5\\u03C4\\u03CC \\u03C0\\u03B9\\u03B8\\u03B1\\u03BD\\u03CE\\u03C2 \\u03C0\\u03C1\\u03BF\\u03BA\\u03BB\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u03B1\\u03C0\\u03CC \\u03BB\\u03B1\\u03BD\\u03B8\\u03B1\\u03C3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03B4\\u03B9\\u03B1\\u03BC\\u03CC\\u03C1\\u03C6\\u03C9\\u03C3\\u03B7 \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03BF\\u03BC\\u03AD\\u03BD\\u03BF\\u03C5 SAP Fiori launchpad \\u03AE \\u03B1\\u03C0\\u03CC \\u03B1\\u03BD\\u03C4\\u03B9\\u03C3\\u03C4\\u03BF\\u03AF\\u03C7\\u03B9\\u03C3\\u03B7 \\u03C1\\u03CC\\u03BB\\u03BF\\u03C5 \\u03C0\\u03BF\\u03C5 \\u03BB\\u03B5\\u03AF\\u03C0\\u03B5\\u03B9.\\n\\n\\u03A4\\u03BF \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03CC\\u03BC\\u03B5\\u03BD\\u03BF \\u03B4\\u03B5\\u03BD \\u03B8\\u03B1 \\u03B5\\u03AF\\u03BD\\u03B1\\u03B9 \\u03BF\\u03C1\\u03B1\\u03C4\\u03CC \\u03C3\\u03C4\\u03BF\\u03BD \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7.\\n\\n\\u0393\\u03B9\\u03B1 \\u03BD\\u03B1 \\u03B5\\u03C0\\u03B9\\u03BB\\u03CD\\u03C3\\u03B5\\u03C4\\u03B5 \\u03B1\\u03C5\\u03C4\\u03CC \\u03C4\\u03BF \\u03C0\\u03C1\\u03CC\\u03B2\\u03BB\\u03B7\\u03BC\\u03B1, \\u03B5\\u03BB\\u03AD\\u03B3\\u03BE\\u03C4\\u03B5 \\u03C4\\u03BF\\u03C5\\u03C2 \\u03BA\\u03B1\\u03C4\\u03B1\\u03BB\\u03CC\\u03B3\\u03BF\\u03C5\\u03C2 \\u03BA\\u03B1\\u03B9 \\u03C4\\u03B9\\u03C2 \\u03B1\\u03C0\\u03B5\\u03B9\\u03BA\\u03BF\\u03BD\\u03AF\\u03C3\\u03B5\\u03B9\\u03C2 \\u03C3\\u03C4\\u03CC\\u03C7\\u03BF\\u03C5 \\u03C0\\u03BF\\u03C5 \\u03AD\\u03C7\\u03BF\\u03C5\\u03BD \\u03B1\\u03BD\\u03C4\\u03B9\\u03C3\\u03C4\\u03BF\\u03B9\\u03C7\\u03B9\\u03C3\\u03C4\\u03B5\\u03AF \\u03C3\\u03B5 \\u03B1\\u03C5\\u03C4\\u03CC\\u03BD \\u03C4\\u03BF\\u03BD \\u03C1\\u03CC\\u03BB\\u03BF.\n#XMSG\nMessage.NavigationTargetError=\\u03A3\\u03C4\\u03CC\\u03C7\\u03BF\\u03C2 \\u03C0\\u03BB\\u03BF\\u03AE\\u03B3\\u03B7\\u03C3\\u03B7\\u03C2 \\u03B4\\u03B5\\u03BD \\u03B5\\u03C0\\u03B9\\u03BB\\u03CD\\u03B8\\u03B7\\u03BA\\u03B5.\n#XMSG\nMessage.TilesHaveErrors=\\u039C\\u03B5\\u03C1\\u03B9\\u03BA\\u03AC \\u03C0\\u03BB\\u03B1\\u03BA\\u03AF\\u03B4\\u03B9\\u03B1 \\u03AE \\u03BC\\u03B5\\u03C1\\u03B9\\u03BA\\u03AD\\u03C2 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B5\\u03C2 \\u03AD\\u03C7\\u03BF\\u03C5\\u03BD \\u03C3\\u03C6\\u03AC\\u03BB\\u03BC\\u03B1\\u03C4\\u03B1 \\u03AE \\u03C0\\u03C1\\u03BF\\u03B5\\u03B9\\u03B4\\u03BF\\u03C0\\u03BF\\u03B9\\u03AE\\u03C3\\u03B5\\u03B9\\u03C2. \\u0398\\u03AD\\u03BB\\u03B5\\u03C4\\u03B5 \\u03BD\\u03B1 \\u03C3\\u03C5\\u03BD\\u03B5\\u03C7\\u03AF\\u03C3\\u03B5\\u03C4\\u03B5 \\u03BC\\u03B5 \\u03C4\\u03B7\\u03BD \\u03B1\\u03C0\\u03BF\\u03B8\\u03AE\\u03BA\\u03B5\\u03C5\\u03C3\\u03B7;\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u0391\\u03C0\\u03BF\\u03C4\\u03C5\\u03C7\\u03AF\\u03B1 \\u03B5\\u03C0\\u03AF\\u03BB\\u03C5\\u03C3\\u03B7\\u03C2 \\u03C4\\u03BF\\u03C5 \\u03C3\\u03C4\\u03CC\\u03C7\\u03BF\\u03C5 \\u03C0\\u03BB\\u03BF\\u03AE\\u03B3\\u03B7\\u03C3\\u03B7\\u03C2 \\u03C4\\u03BF\\u03C5 \\u03C0\\u03BB\\u03B1\\u03BA\\u03B9\\u03B4\\u03AF\\u03BF\\u03C5 \\u00AB{0}\\u00BB.\\n\\n\\u0391\\u03C5\\u03C4\\u03CC \\u03C0\\u03B9\\u03B8\\u03B1\\u03BD\\u03CE\\u03C2 \\u03BD\\u03B1 \\u03C0\\u03C1\\u03BF\\u03BA\\u03B1\\u03BB\\u03B5\\u03AF\\u03C4\\u03B1\\u03B9 \\u03B1\\u03C0\\u03CC \\u03BB\\u03B1\\u03BD\\u03B8\\u03B1\\u03C3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03B4\\u03B9\\u03B1\\u03BC\\u03CC\\u03C1\\u03C6\\u03C9\\u03C3\\u03B7 \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03BF\\u03BC\\u03AD\\u03BD\\u03BF\\u03C5 SAP Fiori launchpad \\u03AE \\u03B1\\u03C0\\u03CC \\u03B1\\u03BD\\u03C4\\u03B9\\u03C3\\u03C4\\u03BF\\u03AF\\u03C7\\u03B9\\u03C3\\u03B7 \\u03C1\\u03CC\\u03BB\\u03BF\\u03C5 \\u03C0\\u03BF\\u03C5 \\u03BB\\u03B5\\u03AF\\u03C0\\u03B5\\u03B9.\\n\\n\\u03A4\\u03BF \\u03C0\\u03BB\\u03B1\\u03BA\\u03AF\\u03B4\\u03B9\\u03BF \\u00AB{0}\\u00BB \\u03B8\\u03B1 \\u03B5\\u03BC\\u03C6\\u03B1\\u03BD\\u03AF\\u03B6\\u03B5\\u03C4\\u03B1\\u03B9 \\u03C3\\u03C4\\u03BF\\u03BD \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7, \\u03B1\\u03BB\\u03BB\\u03AC \\u03BF \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7\\u03C2 \\u03B4\\u03B5\\u03BD \\u03B8\\u03B1 \\u03BC\\u03C0\\u03BF\\u03C1\\u03B5\\u03AF \\u03BD\\u03B1 \\u03C0\\u03BB\\u03BF\\u03B7\\u03B3\\u03B7\\u03B8\\u03B5\\u03AF \\u03C7\\u03C1\\u03B7\\u03C3\\u03B9\\u03BC\\u03BF\\u03C0\\u03BF\\u03B9\\u03CE\\u03BD\\u03C4\\u03B1\\u03C2 \\u03B1\\u03C5\\u03C4\\u03CC \\u03C4\\u03BF \\u03C0\\u03BB\\u03B1\\u03BA\\u03AF\\u03B4\\u03B9\\u03BF.\n#XMSG\nMessage.DeleteGroup=\\u0398\\u03AD\\u03BB\\u03B5\\u03C4\\u03B5 \\u03BD\\u03B1 \\u03B4\\u03B9\\u03B1\\u03B3\\u03C1\\u03AC\\u03C8\\u03B5\\u03C4\\u03B5 \\u03C4\\u03B7\\u03BD \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1 \\u00AB{0}\\u00BB;\n#XMSG\nMessage.PageIsOutdated=\\u039C\\u03AF\\u03B1 \\u03BD\\u03AD\\u03B1 \\u03AD\\u03BA\\u03B4\\u03BF\\u03C3\\u03B7 \\u03B1\\u03C5\\u03C4\\u03AE\\u03C2 \\u03C4\\u03B7\\u03C2 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2 \\u03B1\\u03C0\\u03BF\\u03B8\\u03B7\\u03BA\\u03B5\\u03CD\\u03C4\\u03B7\\u03BA\\u03B5 \\u03AE\\u03B4\\u03B7.\n#XMSG\nMessage.SaveChanges=\\u0391\\u03C0\\u03BF\\u03B8\\u03B7\\u03BA\\u03B5\\u03CD\\u03C3\\u03C4\\u03B5 \\u03C4\\u03B9\\u03C2 \\u03B1\\u03BB\\u03BB\\u03B1\\u03B3\\u03AD\\u03C2.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u039D\\u03AD\\u03B1 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\n#XTIT\nTitle.TilesHaveErrors=\\u03A0\\u03BB\\u03B1\\u03BA\\u03AF\\u03B4\\u03B9\\u03B1 \\u0395\\u03C7\\u03BF\\u03C5\\u03BD \\u03A3\\u03C6\\u03AC\\u03BB\\u03BC\\u03B1\\u03C4\\u03B1\n#XTIT\nDeleteDialog.Title=\\u0394\\u03B9\\u03B1\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XMSG\nDeleteDialog.Text=\\u0398\\u03AD\\u03BB\\u03B5\\u03C4\\u03B5 \\u03BD\\u03B1 \\u03B4\\u03B9\\u03B1\\u03B3\\u03C1\\u03AC\\u03C8\\u03B5\\u03C4\\u03B5 \\u03C4\\u03B7\\u03BD \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1;\n#XBUT\nDeleteDialog.ConfirmButton=\\u0394\\u03B9\\u03B1\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XTIT\nDeleteDialog.LockedTitle=\\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1 \\u03BA\\u03BB\\u03B5\\u03B9\\u03B4\\u03CE\\u03B8\\u03B7\\u03BA\\u03B5\n#XMSG\nDeleteDialog.LockedText=\\u0397 \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1 \\u03B5\\u03AF\\u03BD\\u03B1\\u03B9 \\u03BA\\u03BB\\u03B5\\u03B9\\u03B4\\u03C9\\u03BC\\u03AD\\u03BD\\u03B7 \\u03B1\\u03C0\\u03CC \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7 {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u0395\\u03C0\\u03B9\\u03BB\\u03AD\\u03BE\\u03C4\\u03B5 \\u03BC\\u03B9\\u03B1 \\u03BC\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC \\u03B3\\u03B9\\u03B1 \\u03B4\\u03B9\\u03B1\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE \\u03C4\\u03B7\\u03C2 \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7\\u03C2 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2.\n\n#XMSG\nEditDialog.LockedText=\\u0397 \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1 \\u03B5\\u03AF\\u03BD\\u03B1\\u03B9 \\u03BA\\u03BB\\u03B5\\u03B9\\u03B4\\u03C9\\u03BC\\u03AD\\u03BD\\u03B7 \\u03B1\\u03C0\\u03CC \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7 {0}.\n#XMSG\nEditDialog.TransportRequired=\\u0395\\u03C0\\u03B9\\u03BB\\u03AD\\u03BE\\u03C4\\u03B5 \\u03BC\\u03B9\\u03B1 \\u03BC\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC \\u03B3\\u03B9\\u03B1 \\u03B5\\u03C0\\u03B5\\u03BE\\u03B5\\u03C1\\u03B3\\u03B1\\u03C3\\u03AF\\u03B1 \\u03C4\\u03B7\\u03C2 \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7\\u03C2 \\u03C3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2.\n#XTIT\nEditDialog.Title=\\u0395\\u03C0\\u03B5\\u03BE\\u03B5\\u03C1\\u03B3\\u03B1\\u03C3\\u03AF\\u03B1 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03B1\\u03C2\n\n#XTIT\nErrorDialog.Title=\\u03A3\\u03C6\\u03AC\\u03BB\\u03BC\\u03B1\n\n#XTIT\nPageOverview.Title=\\u03A3\\u03C5\\u03BD\\u03C4\\u03AE\\u03C1\\u03B7\\u03C3\\u03B7 \\u03A3\\u03B5\\u03BB\\u03AF\\u03B4\\u03C9\\u03BD\n\n\n#XTIT\nCopyDialog.Title=\\u0391\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0398\\u03AD\\u03BB\\u03B5\\u03C4\\u03B5 \\u03BD\\u03B1 \\u03B1\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03AC\\u03C8\\u03B5\\u03C4\\u03B5 {0};\n#XFLD\nCopyDialog.NewID=\\u0391\\u03BD\\u03C4\\u03AF\\u03B3\\u03C1\\u03B1\\u03C6\\u03BF \\u03C4\\u03BF\\u03C5 {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u03A4\\u03AF\\u03C4\\u03BB\\u03BF\\u03C2 \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1\\u03C2 \\u03B3\\u03B9\\u03B1 \\u03C4\\u03B7\\u03BD \\u03BF\\u03BC\\u03AC\\u03B4\\u03B1 {0} \\u03B5\\u03AF\\u03BD\\u03B1\\u03B9 \\u03BA\\u03B5\\u03BD\\u03CC\\u03C2.\n#XMSG\nTitle.UnsufficientRoles=\\u0391\\u03BD\\u03B5\\u03C0\\u03B1\\u03C1\\u03BA\\u03AE\\u03C2 \\u03B1\\u03BD\\u03C4\\u03B9\\u03C3\\u03C4\\u03BF\\u03AF\\u03C7\\u03B9\\u03C3\\u03B7 \\u03C1\\u03CC\\u03BB\\u03BF\\u03C5 \\u03B3\\u03B9\\u03B1 \\u03B5\\u03BC\\u03C6\\u03AC\\u03BD\\u03B9\\u03C3\\u03B7 \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03BF\\u03BC\\u03AD\\u03BD\\u03BF\\u03C5\n#XMSG\nTitle.ContentIsNotVisible=\\u03A4\\u03BF \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03CC\\u03BC\\u03B5\\u03BD\\u03BF \\u03B4\\u03B5\\u03BD \\u03B8\\u03B1 \\u03B5\\u03AF\\u03BD\\u03B1\\u03B9 \\u03BF\\u03C1\\u03B1\\u03C4\\u03CC \\u03C3\\u03C4\\u03BF\\u03BD \\u03C7\\u03C1\\u03AE\\u03C3\\u03C4\\u03B7.\n#XMSG\nTitle.ContentNotNavigateable=\\u03A4\\u03BF \\u03C0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03CC\\u03BC\\u03B5\\u03BD\\u03BF \\u03B4\\u03B5\\u03BD \\u03B8\\u03B1 \\u03AD\\u03C7\\u03B5\\u03B9 \\u03B4\\u03C5\\u03BD\\u03B1\\u03C4\\u03CC\\u03C4\\u03B7\\u03C4\\u03B1 \\u03C0\\u03BB\\u03BF\\u03AE\\u03B3\\u03B7\\u03C3\\u03B7\\u03C2.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_en.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Maintain Pages\n\n\n#XBUT\nButton.Add=Add\n#XBUT\nButton.Cancel=Cancel\n#XBUT\nButton.Copy=Copy\n#XBUT\nButton.Create=Create\n#XBUT\nButton.Delete=Delete\n#XBUT\nButton.Edit=Edit\n#XBUT\nButton.Save=Save\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Toggle Catalogs\n#XBUT\nButton.SortCatalogs=Toggle Catalog Sort Order\n#XBUT\nButton.CollapseCatalogs=Collapse All Catalogs\n#XBUT\nButton.ExpandCatalogs=Expand All Catalogs\n#XBUT\nButton.ShowDetails=Show Details\n#XBUT\nButton.PagePreview=Page Preview\n\n\n#XTOL\nTooltip.AddToGroups=Add to Groups\n#XTOL Tooltip for the search button\nTooltip.Search=Search\n#XTOL\nTooltip.SearchForTiles=Search for Tiles\n\n\n#XFLD\nLabel.PageID=Page ID\n#XFLD\nLabel.WorkbenchRequest=Workbench Request\n#XFLD\nLabel.Package=Package\n#XFLD\nLabel.TransportInformation=Transport Information\n#XFLD\nLabel.Details=Details\\:\n#XFLD\nLabel.ResponseCode=Response Code\\:\n#XFLD\nLabel.Description=Description\n#XFLD\nLabel.CreatedBy=Created By\n#XFLD\nLabel.CreatedOn=Created On\n#XFLD\nLabel.ChangedBy=Changed By\n#XFLD\nLabel.ChangedOn=Changed On\n#XFLD\nLabel.PageTitle=Page Title\n#XFLD\nLabel.AssignedRole=Assigned Role\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Title\n#XCOL\nColumn.PageDescription=Description\n#XCOL\nColumn.PageCreatedBy=Created By\n#XCOL\nColumn.PageCreatedOn=Created On\n#XCOL\nColumn.PageChangedBy=Changed By\n#XCOL\nColumn.PageChangedOn=Changed On\n\n\n#XTOL\nPlaceholder.GroupName=Enter group name\n#XTOL\nPlaceholder.SearchForTiles=Search for tiles\n\n#MSG\nMessage.NoGroupTitle=Group {0} does not have a title. To ensure consistent user experience, we recommend entering a group name for each group.\n#XMSG\nMessage.InvalidGroupTitle=Ideally, you should enter a group name.\n#XMSG\nMessage.NoInternetConnection=Please check your internet connection.\n#XMSG\nMessage.SavedChanges=Your changes have been saved.\n#XMSG\nMessage.InvalidPageID=Please only use the following characters\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Please provide the page ID.\n#XMSG\nMessage.EmptyTitle=Please provide the title.\n#XMSG\nMessage.SuccessDeletePage=The selected object has been deleted.\n#XMSG\nMessage.ClipboardCopySuccess=Details were copied successfully.\n#YMSE\nMessage.ClipboardCopyFail=An error occurred while copying details.\n#XMSG\nMessage.DeletePageConfirmation=Do you really want to delete \\n {0} {1}?\n#XMSG\nMessage.PageCreated=The page has been created.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=No tiles\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=No Groups\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Failed to load the {0} tile in group "{1}".\\n\\nThis is most likely caused by an incorrect SAP Fiori launchpad content configuration or by a missing role assignment.\\n\\nThe content will be invisible to the user.\\n\\nTo resolve this issue, please check the catalogs and target mappings assigned to this role.\n#XMSG\nMessage.NavigationTargetError=Navigation target could not be resolved.\n#XMSG\nMessage.TilesHaveErrors=Some of the tiles or groups have errors or warnings. Are you sure you want to continue saving?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Failed to resolve the navigation target of tile\\: "{0}".\\n\\n This is most likely caused by an incorrect SAP Fiori launchpad content configuration or by a missing role assignment.\\n\\n Tile "{0}" will be shown to the user, but the user will not be able to navigate using this tile.\n#XMSG\nMessage.DeleteGroup=Are you sure you want to delete group "{0}"?\n#XMSG\nMessage.PageIsOutdated=A newer version of this page has already been saved.\n#XMSG\nMessage.SaveChanges=Please save your changes.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=New Page\n#XTIT\nTitle.TilesHaveErrors=Tiles Have Errors\n#XTIT\nDeleteDialog.Title=Delete\n#XMSG\nDeleteDialog.Text=Are you sure you want to delete the selected page?\n#XBUT\nDeleteDialog.ConfirmButton=Delete\n#XTIT\nDeleteDialog.LockedTitle=Page locked\n#XMSG\nDeleteDialog.LockedText=The selected page is locked by user {0}.\n#XMSG\nDeleteDialog.TransportRequired=Please select a transport to delete the selected page.\n\n#XMSG\nEditDialog.LockedText=The selected page is locked by user {0}.\n#XMSG\nEditDialog.TransportRequired=Please select a transport to edit the selected page.\n#XTIT\nEditDialog.Title=Edit Page\n\n#XTIT\nErrorDialog.Title=Error\n\n#XTIT\nPageOverview.Title=Maintain Pages\n\n\n#XTIT\nCopyDialog.Title=Copy\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Do you want to copy {0}?\n#XFLD\nCopyDialog.NewID=Copy of {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Group title of group {0} is empty.\n#XMSG\nTitle.UnsufficientRoles=Insufficent role assignment to show content\n#XMSG\nTitle.ContentIsNotVisible=Content will be invisible to the user.\n#XMSG\nTitle.ContentNotNavigateable=Content will not be navigatable.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_es.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Actualizar p\\u00E1ginas\n\n\n#XBUT\nButton.Add=A\\u00F1adir\n#XBUT\nButton.Cancel=Cancelar\n#XBUT\nButton.Copy=Copiar\n#XBUT\nButton.Create=Crear\n#XBUT\nButton.Delete=Borrar\n#XBUT\nButton.Edit=Tratar\n#XBUT\nButton.Save=Grabar\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Conmutar cat\\u00E1logos\n#XBUT\nButton.SortCatalogs=Conmutar el orden de clasificaci\\u00F3n del cat\\u00E1logo\n#XBUT\nButton.CollapseCatalogs=Contraer todos los cat\\u00E1logos\n#XBUT\nButton.ExpandCatalogs=Desplegar todos los cat\\u00E1logos\n#XBUT\nButton.ShowDetails=Mostrar detalles\n#XBUT\nButton.PagePreview=Vista previa de la p\\u00E1gina\n\n\n#XTOL\nTooltip.AddToGroups=A\\u00F1adir a grupos\n#XTOL Tooltip for the search button\nTooltip.Search=Buscar\n#XTOL\nTooltip.SearchForTiles=Buscar mosaicos\n\n\n#XFLD\nLabel.PageID=ID de p\\u00E1gina\n#XFLD\nLabel.WorkbenchRequest=Orden de Workbench\n#XFLD\nLabel.Package=Paquete\n#XFLD\nLabel.TransportInformation=Informaci\\u00F3n de transporte\n#XFLD\nLabel.Details=Detalles\\:\n#XFLD\nLabel.ResponseCode=C\\u00F3digo de respuesta\\:\n#XFLD\nLabel.Description=Descripci\\u00F3n\n#XFLD\nLabel.CreatedBy=Creado por\n#XFLD\nLabel.CreatedOn=Creado el\n#XFLD\nLabel.ChangedBy=Modificado por\n#XFLD\nLabel.ChangedOn=Modificado el\n#XFLD\nLabel.PageTitle=T\\u00EDtulo de p\\u00E1gina\n#XFLD\nLabel.AssignedRole=Rol asignado\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=T\\u00EDtulo\n#XCOL\nColumn.PageDescription=Descripci\\u00F3n\n#XCOL\nColumn.PageCreatedBy=Creado por\n#XCOL\nColumn.PageCreatedOn=Creado el\n#XCOL\nColumn.PageChangedBy=Modificado por\n#XCOL\nColumn.PageChangedOn=Modificado el\n\n\n#XTOL\nPlaceholder.GroupName=Introducir nombre de grupo\n#XTOL\nPlaceholder.SearchForTiles=Buscar mosaicos\n\n#MSG\nMessage.NoGroupTitle=El grupo {0} no tiene t\\u00EDtulo. Para garantizar una experiencia de usuario consistente, se recomienda introducir un nombre de grupo para cada grupo.\n#XMSG\nMessage.InvalidGroupTitle=Deber\\u00EDa introducir un nombre de grupo.\n#XMSG\nMessage.NoInternetConnection=Compruebe la conexi\\u00F3n a Internet.\n#XMSG\nMessage.SavedChanges=Los cambios se han grabado.\n#XMSG\nMessage.InvalidPageID=Utilice solo los siguientes caracteres\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Proporcione el ID de p\\u00E1gina.\n#XMSG\nMessage.EmptyTitle=Proporcione el t\\u00EDtulo.\n#XMSG\nMessage.SuccessDeletePage=Se ha borrado el objeto seleccionado.\n#XMSG\nMessage.ClipboardCopySuccess=Los detalles se han copiado correctamente.\n#YMSE\nMessage.ClipboardCopyFail=Se ha producido un error al copiar detalles.\n#XMSG\nMessage.DeletePageConfirmation=\\u00BFSeguro que desea borrar \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Se ha creado la p\\u00E1gina.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Ning\\u00FAn mosaico\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Ning\\u00FAn grupo\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Se ha producido un error al cargar el mosaico {0} en el grupo "{1}".\\n\\nEsto se debe probablemente a una configuraci\\u00F3n de contenido de la rampa de lanzamiento de SAP Fiori incorrecta o a que falta una asignaci\\u00F3n de roles.\\n\\nEl contenido no ser\\u00E1 visible para el usuario.\\n\\nPara solucionar el problema, verifique los cat\\u00E1logos y las asignaciones de destino asignadas a este rol.\n#XMSG\nMessage.NavigationTargetError=No se ha podido solucionar el destino de navegaci\\u00F3n.\n#XMSG\nMessage.TilesHaveErrors=Algunos de los mosaicos o grupos tienen errores o advertencias. \\u00BFSeguro que desea continuar grabando los datos?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Se ha producido un error al solucionar el destino de navegaci\\u00F3n del mosaico\\: "{0}".\\n\\nEsto se debe probablemente a una configuraci\\u00F3n de contenido de la rampa de lanzamiento de SAP Fiori incorrecta o a que falta una asignaci\\u00F3n de roles.\\n\\nEl mosaico "{0}" se mostrar\\u00E1 al usuario pero el usuario no podr\\u00E1 navegar utilizando este mosaico.\n#XMSG\nMessage.DeleteGroup=\\u00BFSeguro que desea borrar el grupo "{0}"?\n#XMSG\nMessage.PageIsOutdated=Ya se ha grabado una versi\\u00F3n m\\u00E1s reciente de esta p\\u00E1gina.\n#XMSG\nMessage.SaveChanges=Grabe los cambios.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=P\\u00E1gina nueva\n#XTIT\nTitle.TilesHaveErrors=Los mosaicos tienen errores\n#XTIT\nDeleteDialog.Title=Borrar\n#XMSG\nDeleteDialog.Text=\\u00BFSeguro que desea borrar la p\\u00E1gina seleccionada?\n#XBUT\nDeleteDialog.ConfirmButton=Borrar\n#XTIT\nDeleteDialog.LockedTitle=P\\u00E1gina bloqueada\n#XMSG\nDeleteDialog.LockedText=El usuario {0} ha bloqueado la p\\u00E1gina seleccionada.\n#XMSG\nDeleteDialog.TransportRequired=Seleccione un transporte para borrar la p\\u00E1gina seleccionada.\n\n#XMSG\nEditDialog.LockedText=El usuario {0} ha bloqueado la p\\u00E1gina seleccionada.\n#XMSG\nEditDialog.TransportRequired=Seleccione un transporte para editar la p\\u00E1gina seleccionada.\n#XTIT\nEditDialog.Title=Editar p\\u00E1gina\n\n#XTIT\nErrorDialog.Title=Error\n\n#XTIT\nPageOverview.Title=Actualizar p\\u00E1ginas\n\n\n#XTIT\nCopyDialog.Title=Copiar\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u00BFDesea copiar {0}?\n#XFLD\nCopyDialog.NewID=Copia de {0}\n\n\n#XMSG\nTitle.NoGroupTitle=El t\\u00EDtulo de grupo del grupo {0} est\\u00E1 vac\\u00EDo.\n#XMSG\nTitle.UnsufficientRoles=Asignaci\\u00F3n de rol insuficiente para mostrar contenido\n#XMSG\nTitle.ContentIsNotVisible=El contenido ser\\u00E1 visible para el usuario.\n#XMSG\nTitle.ContentNotNavigateable=El contenido no ser\\u00E1 navegable.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_et.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Halda lehti\n\n\n#XBUT\nButton.Add=Lisa\n#XBUT\nButton.Cancel=T\\u00FChista\n#XBUT\nButton.Copy=Kopeeri\n#XBUT\nButton.Create=Loo\n#XBUT\nButton.Delete=Kustuta\n#XBUT\nButton.Edit=Redigeeri\n#XBUT\nButton.Save=Salvesta\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Vaheta katalooge\n#XBUT\nButton.SortCatalogs=Vaheta kataloogi sortimisj\\u00E4rjestust\n#XBUT\nButton.CollapseCatalogs=Ahenda k\\u00F5ik kataloogid\n#XBUT\nButton.ExpandCatalogs=Laienda k\\u00F5ik kataloogid\n#XBUT\nButton.ShowDetails=Kuva \\u00FCksikasjad\n#XBUT\nButton.PagePreview=Lehe eelvaade\n\n\n#XTOL\nTooltip.AddToGroups=Lisa gruppidele\n#XTOL Tooltip for the search button\nTooltip.Search=Otsi\n#XTOL\nTooltip.SearchForTiles=Otsi paane\n\n\n#XFLD\nLabel.PageID=Lehe ID\n#XFLD\nLabel.WorkbenchRequest=T\\u00F6\\u00F6lauataotlus\n#XFLD\nLabel.Package=Pakett\n#XFLD\nLabel.TransportInformation=Transporditeave\n#XFLD\nLabel.Details=\\u00DCksikasjad\\:\n#XFLD\nLabel.ResponseCode=Vastuse kood\\:\n#XFLD\nLabel.Description=Kirjeldus\n#XFLD\nLabel.CreatedBy=Autor\n#XFLD\nLabel.CreatedOn=Loomiskuup\\u00E4ev\n#XFLD\nLabel.ChangedBy=Muutja\n#XFLD\nLabel.ChangedOn=Muutmiskuup\\u00E4ev\n#XFLD\nLabel.PageTitle=Lehe tiitel\n#XFLD\nLabel.AssignedRole=M\\u00E4\\u00E4ratud roll\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Pealkiri\n#XCOL\nColumn.PageDescription=Kirjeldus\n#XCOL\nColumn.PageCreatedBy=Autor\n#XCOL\nColumn.PageCreatedOn=Loomiskuup\\u00E4ev\n#XCOL\nColumn.PageChangedBy=Muutja\n#XCOL\nColumn.PageChangedOn=Muutmiskuup\\u00E4ev\n\n\n#XTOL\nPlaceholder.GroupName=Sisestage grupi nimi\n#XTOL\nPlaceholder.SearchForTiles=Otsi paane\n\n#MSG\nMessage.NoGroupTitle=Grupil {0} pole tiitlit. S\\u00FCsteemse kasutuskogemuse tagamiseks soovitame igale grupile sisestada grupi nime.\n#XMSG\nMessage.InvalidGroupTitle=Soovitatav on sisestada grupi nimi.\n#XMSG\nMessage.NoInternetConnection=Kontrollige oma Interneti-\\u00FChendust.\n#XMSG\nMessage.SavedChanges=Teie muudatused on salvestatud.\n#XMSG\nMessage.InvalidPageID=Kasutage ainult j\\u00E4rgmisi m\\u00E4rke\\: A\\u2013Z a\\u2013z 0\\u20139 _ /\n#XMSG\nMessage.EmptyPageID=Sisestage lehe ID.\n#XMSG\nMessage.EmptyTitle=Sisestage pealkiri.\n#XMSG\nMessage.SuccessDeletePage=Valitud objekt on kustutatud.\n#XMSG\nMessage.ClipboardCopySuccess=\\u00DCksikasjad on kopeeritud.\n#YMSE\nMessage.ClipboardCopyFail=\\u00DCksikasjade kopeerimisel ilmnes t\\u00F5rge.\n#XMSG\nMessage.DeletePageConfirmation=Kas soovite kindlasti kustutada \\u00FCksuse \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Leht on loodud.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Paane pole\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Gruppe pole\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Paani {0} laadimine grupis \\u201E{1}\\u201C nurjus.\\n\\nSelle p\\u00F5hjuseks on t\\u00F5en\\u00E4oliselt SAP Fiori k\\u00E4ivituspaani sisu vale konfiguratsioon v\\u00F5i puuduv rollim\\u00E4\\u00E4rang.\\n\\nSisu pole kasutajale n\\u00E4htav.\\n\\nProbleemi lahendamiseks kontrollige rollile m\\u00E4\\u00E4ratud katalooge ja sihtvastendusi.\n#XMSG\nMessage.NavigationTargetError=Navigeerimise sihti ei saanud lahendada.\n#XMSG\nMessage.TilesHaveErrors=M\\u00F5nel paanil v\\u00F5i m\\u00F5nes grupis on t\\u00F5rkeid v\\u00F5i hoiatusi. Kas soovite kindlasti salvestamist j\\u00E4tkata?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Paani navigeerimise sihi lahendamine nurjus\\: \\u201E{0}\\u201C.\\n\\n Selle p\\u00F5hjus on t\\u00F5en\\u00E4oliselt SAP Fiori k\\u00E4ivituspaani sisu vale konfiguratsioon v\\u00F5i puuduv rollim\\u00E4\\u00E4rang.\\n\\nPaan \\u201E{0}\\u201C kuvatakse kasutajale, kuid kasutaja ei saa selle paani abil navigeerida.\n#XMSG\nMessage.DeleteGroup=Kas soovite kindlasti grupi "{0}" kustutada?\n#XMSG\nMessage.PageIsOutdated=Sellest lehest on juba salvestatud uuem versioon.\n#XMSG\nMessage.SaveChanges=Salvestage oma muudatused.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Uus leht\n#XTIT\nTitle.TilesHaveErrors=Paanidel on t\\u00F5rkeid\n#XTIT\nDeleteDialog.Title=Kustuta\n#XMSG\nDeleteDialog.Text=Kas soovite valitud lehe kustutada?\n#XBUT\nDeleteDialog.ConfirmButton=Kustuta\n#XTIT\nDeleteDialog.LockedTitle=Leht on lukus\n#XMSG\nDeleteDialog.LockedText=Kasutaja {0} on valitud lehe lukustanud.\n#XMSG\nDeleteDialog.TransportRequired=Valitud lehe kustutamiseks valige transport.\n\n#XMSG\nEditDialog.LockedText=Kasutaja {0} on valitud lehe lukustanud.\n#XMSG\nEditDialog.TransportRequired=Valitud lehe redigeerimiseks valige transport.\n#XTIT\nEditDialog.Title=Redigeeri lehte\n\n#XTIT\nErrorDialog.Title=T\\u00F5rge\n\n#XTIT\nPageOverview.Title=Halda lehti\n\n\n#XTIT\nCopyDialog.Title=Kopeeri\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Kas soovite \\u00FCksuse {0} kopeerida?\n#XFLD\nCopyDialog.NewID=Koopia\\: {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Grupi {0} tiitel on t\\u00FChi.\n#XMSG\nTitle.UnsufficientRoles=Rollim\\u00E4\\u00E4rang pole sisu kuvamiseks piisav\n#XMSG\nTitle.ContentIsNotVisible=Sisu pole kasutajale n\\u00E4htav.\n#XMSG\nTitle.ContentNotNavigateable=Sisu pole navigeeritav.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_fi.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Yll\\u00E4pid\\u00E4 sivuja\n\n\n#XBUT\nButton.Add=Lis\\u00E4\\u00E4\n#XBUT\nButton.Cancel=Peruuta\n#XBUT\nButton.Copy=Kopioi\n#XBUT\nButton.Create=Luo\n#XBUT\nButton.Delete=Poista\n#XBUT\nButton.Edit=Muokkaa\n#XBUT\nButton.Save=Tallenna\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=N\\u00E4yt\\u00E4/piilota luettelot\n#XBUT\nButton.SortCatalogs=Vaihda luettelon lajitteluj\\u00E4rjestys\n#XBUT\nButton.CollapseCatalogs=Tiivist\\u00E4 kaikki luettelot\n#XBUT\nButton.ExpandCatalogs=Laajenna kaikki luettelot\n#XBUT\nButton.ShowDetails=N\\u00E4yt\\u00E4 lis\\u00E4tiedot\n#XBUT\nButton.PagePreview=Sivun esikatselu\n\n\n#XTOL\nTooltip.AddToGroups=Lis\\u00E4\\u00E4 ryhmiin\n#XTOL Tooltip for the search button\nTooltip.Search=Hae\n#XTOL\nTooltip.SearchForTiles=Hae ruutuja\n\n\n#XFLD\nLabel.PageID=Sivun tunnus\n#XFLD\nLabel.WorkbenchRequest=Ty\\u00F6p\\u00F6yt\\u00E4tilaus\n#XFLD\nLabel.Package=Paketti\n#XFLD\nLabel.TransportInformation=Siirron tiedot\n#XFLD\nLabel.Details=Lis\\u00E4tiedot\\:\n#XFLD\nLabel.ResponseCode=Vastauskoodi\\:\n#XFLD\nLabel.Description=Kuvaus\n#XFLD\nLabel.CreatedBy=Tekij\\u00E4\n#XFLD\nLabel.CreatedOn=Luontip\\u00E4iv\\u00E4m\\u00E4\\u00E4r\\u00E4\n#XFLD\nLabel.ChangedBy=Muuttaja\n#XFLD\nLabel.ChangedOn=Muutosp\\u00E4iv\\u00E4m\\u00E4\\u00E4r\\u00E4\n#XFLD\nLabel.PageTitle=Sivun otsikko\n#XFLD\nLabel.AssignedRole=Kohdistettu rooli\n\n\n#XCOL\nColumn.PageID=Tunnus\n#XCOL\nColumn.PageTitle=Otsikko\n#XCOL\nColumn.PageDescription=Kuvaus\n#XCOL\nColumn.PageCreatedBy=Tekij\\u00E4\n#XCOL\nColumn.PageCreatedOn=Luontip\\u00E4iv\\u00E4m\\u00E4\\u00E4r\\u00E4\n#XCOL\nColumn.PageChangedBy=Muuttaja\n#XCOL\nColumn.PageChangedOn=Muutosp\\u00E4iv\\u00E4m\\u00E4\\u00E4r\\u00E4\n\n\n#XTOL\nPlaceholder.GroupName=Sy\\u00F6t\\u00E4 ryhm\\u00E4n nimi\n#XTOL\nPlaceholder.SearchForTiles=Hae ruutuja\n\n#MSG\nMessage.NoGroupTitle=Ryhm\\u00E4ll\\u00E4 {0} ei ole otsikkoa. Yhten\\u00E4isen k\\u00E4ytt\\u00F6kokemuksen varmistamiseksi suosittelemme ryhm\\u00E4n nimen sy\\u00F6tt\\u00E4mist\\u00E4 jokaiselle ryhm\\u00E4lle.\n#XMSG\nMessage.InvalidGroupTitle=Ryhm\\u00E4n nimen sy\\u00F6tt\\u00E4minen on suositeltavaa.\n#XMSG\nMessage.NoInternetConnection=Tarkista internet-yhteytesi.\n#XMSG\nMessage.SavedChanges=Muutoksesi on tallennettu.\n#XMSG\nMessage.InvalidPageID=K\\u00E4yt\\u00E4 vain seuraavia merkkej\\u00E4\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Anna sivun tunnus.\n#XMSG\nMessage.EmptyTitle=Anna otsikko.\n#XMSG\nMessage.SuccessDeletePage=Valittu objekti on poistettu.\n#XMSG\nMessage.ClipboardCopySuccess=Lis\\u00E4tietojen kopiointi onnistui.\n#YMSE\nMessage.ClipboardCopyFail=Lis\\u00E4tietojen kopioinnissa tapahtui virhe.\n#XMSG\nMessage.DeletePageConfirmation=Haluatko todella poistaa kohteen \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Sivu on luotu.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Ei ruutuja\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Ei ryhmi\\u00E4\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Ruudun {0} lataaminen ep\\u00E4onnistui ryhm\\u00E4ss\\u00E4 "{1}".\\n\\nT\\u00E4m\\u00E4 johtuu todenn\\u00E4k\\u00F6isesti virheellisest\\u00E4 SAP Fiori -aloituspaneelin sis\\u00E4ll\\u00F6n konfiguraatiosta tai puuttuvasta roolikohdistuksesta.\\n\\nSis\\u00E4lt\\u00F6 on n\\u00E4kym\\u00E4t\\u00F6n k\\u00E4ytt\\u00E4j\\u00E4lle.\\n\\nTarkista t\\u00E4m\\u00E4n ongelman ratkaisemiseksi t\\u00E4h\\u00E4n rooliin kohdistetut luettelot ja kohdekohdistukset.\n#XMSG\nMessage.NavigationTargetError=Navigointikohdetta ei voitu ratkaista.\n#XMSG\nMessage.TilesHaveErrors=Joillakin ruuduilla tai ryhmill\\u00E4 on virheit\\u00E4 tai varoituksia. Haluatko varmasti jatkaa tallentamista?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Ruudun "{0}" navigointikohteen ratkaiseminen ep\\u00E4onnistui.\\n\\n T\\u00E4m\\u00E4 johtuu todenn\\u00E4k\\u00F6isesti virheellisest\\u00E4 SAP Fiori -aloituspaneelin sis\\u00E4ll\\u00F6n konfiguraatiosta tai puuttuvasta roolikohdistuksesta.\\n\\n Ruutu "{0}" n\\u00E4ytet\\u00E4\\u00E4n k\\u00E4ytt\\u00E4j\\u00E4lle, mutta k\\u00E4ytt\\u00E4j\\u00E4 ei voi navigoida t\\u00E4t\\u00E4 ruutua k\\u00E4ytt\\u00E4m\\u00E4ll\\u00E4.\n#XMSG\nMessage.DeleteGroup=Haluatko varmasti poistaa ryhm\\u00E4n "{0}"?\n#XMSG\nMessage.PageIsOutdated=T\\u00E4m\\u00E4n sivun uudempi versio on jo tallennettu.\n#XMSG\nMessage.SaveChanges=Tallenna muutoksesi.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Uusi sivu\n#XTIT\nTitle.TilesHaveErrors=Ruuduissa on virheit\\u00E4.\n#XTIT\nDeleteDialog.Title=Poista\n#XMSG\nDeleteDialog.Text=Haluatko varmasti poistaa valitun sivun?\n#XBUT\nDeleteDialog.ConfirmButton=Poista\n#XTIT\nDeleteDialog.LockedTitle=Sivu lukittu\n#XMSG\nDeleteDialog.LockedText=K\\u00E4ytt\\u00E4j\\u00E4 {0} on lukinnut valitun sivun.\n#XMSG\nDeleteDialog.TransportRequired=Valitse siirto valitun sivun poistamiseksi.\n\n#XMSG\nEditDialog.LockedText=K\\u00E4ytt\\u00E4j\\u00E4 {0} on lukinnut valitun sivun.\n#XMSG\nEditDialog.TransportRequired=Valitse siirto valitun sivun muokkaamista varten.\n#XTIT\nEditDialog.Title=Muokkaa sivua\n\n#XTIT\nErrorDialog.Title=Virhe\n\n#XTIT\nPageOverview.Title=Yll\\u00E4pid\\u00E4 sivuja\n\n\n#XTIT\nCopyDialog.Title=Kopioi\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Haluatko kopioida kohteen {0}?\n#XFLD\nCopyDialog.NewID=Kopio\\: {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Ryhm\\u00E4n {0} otsikko on tyhj\\u00E4.\n#XMSG\nTitle.UnsufficientRoles=Riitt\\u00E4m\\u00E4t\\u00F6n roolikohdistus sis\\u00E4ll\\u00F6n n\\u00E4ytt\\u00E4mist\\u00E4 varten\n#XMSG\nTitle.ContentIsNotVisible=Sis\\u00E4lt\\u00F6 on n\\u00E4kym\\u00E4t\\u00F6n k\\u00E4ytt\\u00E4j\\u00E4lle.\n#XMSG\nTitle.ContentNotNavigateable=Sis\\u00E4lt\\u00F6 ei ole navigointikelpoinen.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_fr.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=G\\u00E9rer pages\n\n\n#XBUT\nButton.Add=Ajouter\n#XBUT\nButton.Cancel=Annuler\n#XBUT\nButton.Copy=Copier\n#XBUT\nButton.Create=Cr\\u00E9er\n#XBUT\nButton.Delete=Supprimer\n#XBUT\nButton.Edit=Modifier\n#XBUT\nButton.Save=Sauvegarder\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Basculer entre les catalogues\n#XBUT\nButton.SortCatalogs=Changer l\'ordre de tri du catalogue\n#XBUT\nButton.CollapseCatalogs=R\\u00E9duire tous les catalogues\n#XBUT\nButton.ExpandCatalogs=D\\u00E9velopper tous les catalogues\n#XBUT\nButton.ShowDetails=Afficher les d\\u00E9tails\n#XBUT\nButton.PagePreview=Aper\\u00E7u de la page\n\n\n#XTOL\nTooltip.AddToGroups=Ajouter aux groupes\n#XTOL Tooltip for the search button\nTooltip.Search=Rechercher\n#XTOL\nTooltip.SearchForTiles=Rechercher des vignettes\n\n\n#XFLD\nLabel.PageID=ID de page\n#XFLD\nLabel.WorkbenchRequest=Ordre du Workbench\n#XFLD\nLabel.Package=Package\n#XFLD\nLabel.TransportInformation=Informations de transport\n#XFLD\nLabel.Details=D\\u00E9tails\n#XFLD\nLabel.ResponseCode=Code de r\\u00E9ponse\n#XFLD\nLabel.Description=Description\n#XFLD\nLabel.CreatedBy=Cr\\u00E9\\u00E9 par\n#XFLD\nLabel.CreatedOn=Cr\\u00E9\\u00E9 le\n#XFLD\nLabel.ChangedBy=Modifi\\u00E9 par\n#XFLD\nLabel.ChangedOn=Modifi\\u00E9 le\n#XFLD\nLabel.PageTitle=Titre de page\n#XFLD\nLabel.AssignedRole=R\\u00F4le affect\\u00E9\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titre\n#XCOL\nColumn.PageDescription=D\\u00E9signation\n#XCOL\nColumn.PageCreatedBy=Cr\\u00E9\\u00E9 par\n#XCOL\nColumn.PageCreatedOn=Cr\\u00E9\\u00E9 le\n#XCOL\nColumn.PageChangedBy=Modifi\\u00E9 par\n#XCOL\nColumn.PageChangedOn=Modifi\\u00E9 le\n\n\n#XTOL\nPlaceholder.GroupName=Entrer nom de groupe\n#XTOL\nPlaceholder.SearchForTiles=Rechercher vignettes\n\n#MSG\nMessage.NoGroupTitle=Le groupe {0} n\'\'a pas de titre. Pour garantir une exp\\u00E9rience utilisateur coh\\u00E9rente, SAP recommande d\'\'entrer un nom pour chaque groupe.\n#XMSG\nMessage.InvalidGroupTitle=Id\\u00E9alement, vous devez entrer un nom de groupe.\n#XMSG\nMessage.NoInternetConnection=V\\u00E9rifiez votre connexion Internet.\n#XMSG\nMessage.SavedChanges=Vos modifications ont \\u00E9t\\u00E9 sauvegard\\u00E9es.\n#XMSG\nMessage.InvalidPageID=Utilisez uniquement les caract\\u00E8res suivants \\: A-Z, a-z, 0-9, _, /.\n#XMSG\nMessage.EmptyPageID=Indiquez l\'ID de page.\n#XMSG\nMessage.EmptyTitle=Indiquez le titre.\n#XMSG\nMessage.SuccessDeletePage=Objet s\\u00E9lectionn\\u00E9 supprim\\u00E9\n#XMSG\nMessage.ClipboardCopySuccess=D\\u00E9tails copi\\u00E9s correctement.\n#YMSE\nMessage.ClipboardCopyFail=Une erreur est survenue lors de la copie des d\\u00E9tails.\n#XMSG\nMessage.DeletePageConfirmation=Voulez-vraiment supprimer\\n {0} {1} ?\n#XMSG\nMessage.PageCreated=La page a \\u00E9t\\u00E9 cr\\u00E9\\u00E9e.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Aucune vignette\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Aucun groupe\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Le chargement de la vignette {0} dans le groupe "{1}" a \\u00E9chou\\u00E9.\\n\\nCela est tr\\u00E8s probablement d\\u00FB \\u00E0 une configuration incorrecte du contenu de la barre de lancement SAP Fiori ou \\u00E0 une affectation de r\\u00F4le manquante.\\n\\nLe contenu sera invisible \\u00E0 l\'\'utilisateur.\\n\\nPour r\\u00E9soudre ce probl\\u00E8me, v\\u00E9rifiez les catalogues et les mappages cibles affect\\u00E9s \\u00E0 ce r\\u00F4le.\n#XMSG\nMessage.NavigationTargetError=Impossible de r\\u00E9soudre la cible de navigation\n#XMSG\nMessage.TilesHaveErrors=Certaines vignettes ou groupes comportent des erreurs ou des avertissements. Voulez-vous vraiment sauvegarder ?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=La r\\u00E9solution de la cible de navigation de la vignette a \\u00E9chou\\u00E9 \\: "{0}".\\n\\nCela est tr\\u00E8s probablement d\\u00FB \\u00E0 une configuration incorrecte du contenu de la barre de lancement SAP Fiori ou \\u00E0 une affectation de r\\u00F4le manquante.\\n\\nLa vignette "{0}" s\'\'affichera pour l\'\'utilisateur mais ce dernier ne pourra pas l\'\'utiliser pour naviguer.\n#XMSG\nMessage.DeleteGroup=Voulez-vous vraiment supprimer le groupe "{0}"\\u00A0?\n#XMSG\nMessage.PageIsOutdated=Une nouvelle version de cette page a d\\u00E9j\\u00E0 \\u00E9t\\u00E9 sauvegard\\u00E9e.\n#XMSG\nMessage.SaveChanges=Sauvegardez vos modifications.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nouvelle page\n#XTIT\nTitle.TilesHaveErrors=Vignettes avec erreurs\n#XTIT\nDeleteDialog.Title=Supprimer\n#XMSG\nDeleteDialog.Text=Voulez-vous vraiment supprimer la page s\\u00E9lectionn\\u00E9e\\u00A0?\n#XBUT\nDeleteDialog.ConfirmButton=Supprimer\n#XTIT\nDeleteDialog.LockedTitle=Page bloqu\\u00E9e\n#XMSG\nDeleteDialog.LockedText=La page s\\u00E9lectionn\\u00E9e est bloqu\\u00E9e par l\'\'utilisateur {0}.\n#XMSG\nDeleteDialog.TransportRequired=S\\u00E9lectionnez un transport pour supprimer la page s\\u00E9lectionn\\u00E9e.\n\n#XMSG\nEditDialog.LockedText=La page s\\u00E9lectionn\\u00E9e est bloqu\\u00E9e par l\'\'utilisateur {0}.\n#XMSG\nEditDialog.TransportRequired=S\\u00E9lectionnez un transport pour traiter la page s\\u00E9lectionn\\u00E9e.\n#XTIT\nEditDialog.Title=Traiter page\n\n#XTIT\nErrorDialog.Title=Erreur\n\n#XTIT\nPageOverview.Title=G\\u00E9rer pages\n\n\n#XTIT\nCopyDialog.Title=Copier\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Voulez-vous copier {0} ?\n#XFLD\nCopyDialog.NewID=Copie de {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Titre du groupe {0} vide\n#XMSG\nTitle.UnsufficientRoles=Affectation de r\\u00F4le insuffisante pour afficher contenu\n#XMSG\nTitle.ContentIsNotVisible=Contenu invisible pour l\'utilisateur\n#XMSG\nTitle.ContentNotNavigateable=Vous ne pourrez pas acc\\u00E9der \\u00E0 ce contenu.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_hi.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u092C\\u0928\\u093E\\u090F \\u0930\\u0916\\u0947\\u0902\n\n\n#XBUT\nButton.Add=\\u091C\\u094B\\u0921\\u093C\\u0947\n#XBUT\nButton.Cancel=\\u0930\\u0926\\u094D\\u0926 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.Copy=\\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u090F\\u0902\n#XBUT\nButton.Create=\\u092C\\u0928\\u093E\\u090F\\u0902\n#XBUT\nButton.Delete=\\u0939\\u091F\\u093E\\u090F\\u0902\n#XBUT\nButton.Edit=\\u0938\\u0902\\u092A\\u093E\\u0926\\u093F\\u0924 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.Save=\\u0938\\u0939\\u0947\\u091C\\u0947\\u0902\n#XBUT\nButton.Ok=\\u0920\\u0940\\u0915\n#XBUT\nButton.ShowCatalogs=\\u0915\\u0948\\u091F\\u0932\\u0949\\u0917 \\u091F\\u0949\\u0917\\u0932 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.SortCatalogs=\\u0915\\u0948\\u091F\\u0932\\u0949\\u0917 \\u0938\\u0949\\u0930\\u094D\\u091F \\u0911\\u0930\\u094D\\u0921\\u0930 \\u0915\\u094B \\u091F\\u0949\\u0917\\u0932 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.CollapseCatalogs=\\u0938\\u092D\\u0940 \\u0915\\u0948\\u091F\\u0932\\u0949\\u0917 \\u0915\\u094B \\u0938\\u0902\\u0915\\u0941\\u091A\\u093F\\u0924 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.ExpandCatalogs=\\u0938\\u092D\\u0940 \\u0915\\u0948\\u091F\\u0932\\u0949\\u0917 \\u0915\\u094B \\u0935\\u093F\\u0938\\u094D\\u0924\\u0943\\u0924 \\u0915\\u0930\\u0947\\u0902\n#XBUT\nButton.ShowDetails=\\u0935\\u093F\\u0935\\u0930\\u0923\\u094B\\u0902 \\u0915\\u094B \\u0926\\u093F\\u0916\\u093E\\u090F\\u0902\n#XBUT\nButton.PagePreview=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u092A\\u0942\\u0930\\u094D\\u0935\\u093E\\u0935\\u0932\\u094B\\u0915\\u0928\n\n\n#XTOL\nTooltip.AddToGroups=\\u0938\\u092E\\u0942\\u0939 \\u0915\\u094B \\u091C\\u094B\\u0921\\u093C\\u0947\\u0902\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0916\\u094B\\u091C\\u0947\\u0902\n#XTOL\nTooltip.SearchForTiles=\\u091F\\u093E\\u0907\\u0932 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0916\\u094B\\u091C\\u0947\\u0902\n\n\n#XFLD\nLabel.PageID=\\u092A\\u0943\\u0937\\u094D\\u0920 ID\n#XFLD\nLabel.WorkbenchRequest=\\u0935\\u0930\\u094D\\u0915\\u092C\\u0947\\u0902\\u091A \\u0905\\u0928\\u0941\\u0930\\u094B\\u0927\n#XFLD\nLabel.Package=\\u092A\\u0948\\u0915\\u0947\\u091C\n#XFLD\nLabel.TransportInformation=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u091C\\u093E\\u0928\\u0915\\u093E\\u0930\\u0940\n#XFLD\nLabel.Details=\\u0935\\u093F\\u0935\\u0930\\u0923\\u0903\n#XFLD\nLabel.ResponseCode=\\u092A\\u094D\\u0930\\u0924\\u093F\\u0915\\u094D\\u0930\\u093F\\u092F\\u093E \\u0915\\u094B\\u0921\\:\n#XFLD\nLabel.Description=\\u0935\\u0930\\u094D\\u0923\\u0928\n#XFLD\nLabel.CreatedBy=\\u0928\\u093F\\u0930\\u094D\\u092E\\u093E\\u0924\\u093E\n#XFLD\nLabel.CreatedOn=\\u0928\\u093F\\u0930\\u094D\\u092E\\u093E\\u0923 \\u0926\\u093F\\u0928\\u093E\\u0902\\u0915\n#XFLD\nLabel.ChangedBy=\\u092A\\u0930\\u093F\\u0935\\u0930\\u094D\\u0924\\u0928\\u0915\\u0930\\u094D\\u0924\\u093E\n#XFLD\nLabel.ChangedOn=\\u0907\\u0938 \\u0926\\u093F\\u0928\\u093E\\u0902\\u0915 \\u0915\\u094B \\u092A\\u0930\\u093F.\n#XFLD\nLabel.PageTitle=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u0936\\u0940\\u0930\\u094D\\u0937\\u0915\n#XFLD\nLabel.AssignedRole=\\u0905\\u0938\\u093E\\u0907\\u0928 \\u0915\\u0940 \\u0917\\u0908 \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u0936\\u0940\\u0930\\u094D\\u0937\\u0915\n#XCOL\nColumn.PageDescription=\\u0935\\u0930\\u094D\\u0923\\u0928\n#XCOL\nColumn.PageCreatedBy=\\u0928\\u093F\\u0930\\u094D\\u092E\\u093E\\u0924\\u093E\n#XCOL\nColumn.PageCreatedOn=\\u0928\\u093F\\u0930\\u094D\\u092E\\u093E\\u0923 \\u0926\\u093F\\u0928\\u093E\\u0902\\u0915\n#XCOL\nColumn.PageChangedBy=\\u092A\\u0930\\u093F\\u0935\\u0930\\u094D\\u0924\\u0928\\u0915\\u0930\\u094D\\u0924\\u093E\n#XCOL\nColumn.PageChangedOn=\\u0907\\u0938 \\u0926\\u093F\\u0928\\u093E\\u0902\\u0915 \\u0915\\u094B \\u092A\\u0930\\u093F.\n\n\n#XTOL\nPlaceholder.GroupName=\\u0938\\u092E\\u0942\\u0939 \\u0915\\u093E \\u0928\\u093E\\u092E \\u0926\\u0930\\u094D\\u091C \\u0915\\u0930\\u0947\\u0902\n#XTOL\nPlaceholder.SearchForTiles=\\u091F\\u093E\\u0907\\u0932 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0916\\u094B\\u091C\n\n#MSG\nMessage.NoGroupTitle=\\u0938\\u092E\\u0942\\u0939 {0} \\u0915\\u093E \\u0915\\u094B\\u0908 \\u0936\\u0940\\u0930\\u094D\\u0937\\u0915 \\u0928\\u0939\\u0940\\u0902 \\u0939\\u0948. \\u0905\\u0928\\u0941\\u0915\\u0942\\u0932 \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0905\\u0928\\u0941\\u092D\\u0935 \\u0938\\u0941\\u0928\\u093F\\u0936\\u094D\\u091A\\u093F\\u0924 \\u0915\\u0930\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093F\\u090F, \\u0939\\u092E \\u092A\\u094D\\u0930\\u0924\\u094D\\u092F\\u0947\\u0915 \\u0938\\u092E\\u0942\\u0939 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0938\\u092E\\u0942\\u0939 \\u0928\\u093E\\u092E \\u0926\\u0930\\u094D\\u091C \\u0915\\u0930\\u0928\\u0947 \\u0915\\u0940 \\u0905\\u0928\\u0941\\u0936\\u0902\\u0938\\u093E \\u0915\\u0930\\u0924\\u0947 \\u0939\\u0948\\u0902.\n#XMSG\nMessage.InvalidGroupTitle=\\u0906\\u092E\\u0924\\u094C\\u0930 \\u092A\\u0930, \\u0906\\u092A\\u0915\\u094B \\u0915\\u094B\\u0908 \\u0938\\u092E\\u0942\\u0939 \\u0928\\u093E\\u092E \\u0926\\u0930\\u094D\\u091C \\u0915\\u0930\\u0928\\u093E \\u091A\\u093E\\u0939\\u093F\\u090F.\n#XMSG\nMessage.NoInternetConnection=\\u0915\\u0943\\u092A\\u092F\\u093E \\u0905\\u092A\\u0928\\u0947 \\u0907\\u0902\\u091F\\u0930\\u0928\\u0947\\u091F \\u0915\\u0928\\u0947\\u0915\\u094D\\u0936\\u0928 \\u0915\\u0940 \\u091C\\u093E\\u0902\\u091A \\u0915\\u0930\\u0947\\u0902.\n#XMSG\nMessage.SavedChanges=\\u0906\\u092A\\u0915\\u0947 \\u092A\\u0930\\u093F\\u0935\\u0930\\u094D\\u0924\\u0928\\u094B\\u0902 \\u0915\\u094B \\u0938\\u0939\\u0947\\u091C\\u093E \\u0917\\u092F\\u093E \\u0939\\u0948.\n#XMSG\nMessage.InvalidPageID=\\u0915\\u0943\\u092A\\u092F\\u093E \\u0915\\u0947\\u0935\\u0932 \\u0928\\u093F\\u092E\\u094D\\u0928\\u0932\\u093F\\u0916\\u093F\\u0924 \\u0935\\u0930\\u094D\\u0923\\u094B\\u0902 \\u0915\\u093E \\u0909\\u092A\\u092F\\u094B\\u0917 \\u0915\\u0930\\u0947\\u0902\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0915\\u0943\\u092A\\u092F\\u093E \\u092A\\u0943\\u0937\\u094D\\u0920 ID \\u092A\\u094D\\u0930\\u0926\\u093E\\u0928 \\u0915\\u0930\\u0947\\u0902.\n#XMSG\nMessage.EmptyTitle=\\u0915\\u0943\\u092A\\u092F\\u093E \\u0936\\u0940\\u0930\\u094D\\u0937\\u0915 \\u092A\\u094D\\u0930\\u0926\\u093E\\u0928 \\u0915\\u0930\\u0947\\u0902.\n#XMSG\nMessage.SuccessDeletePage=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u0911\\u092C\\u094D\\u091C\\u0947\\u0915\\u094D\\u091F \\u0939\\u091F\\u093E \\u0926\\u093F\\u092F\\u093E \\u0917\\u092F\\u093E \\u0939\\u0948.\n#XMSG\nMessage.ClipboardCopySuccess=\\u0935\\u093F\\u0935\\u0930\\u0923 \\u0938\\u092B\\u0932\\u0924\\u093E\\u092A\\u0942\\u0930\\u094D\\u0935\\u0915 \\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u092F\\u093E \\u0917\\u092F\\u093E.\n#YMSE\nMessage.ClipboardCopyFail=\\u0935\\u093F\\u0935\\u0930\\u0923 \\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u0924\\u0947 \\u0938\\u092E\\u092F \\u0924\\u094D\\u0930\\u0941\\u091F\\u093F \\u0909\\u0924\\u094D\\u092A\\u0928\\u094D\\u0928 \\u0939\\u0941\\u0908.\n#XMSG\nMessage.DeletePageConfirmation=\\u0915\\u094D\\u092F\\u093E \\u0906\\u092A \\u0935\\u093E\\u0915\\u0908  {0} {1} \\u0915\\u094B \\u0939\\u091F\\u093E\\u0928\\u093E \\u091A\\u093E\\u0939\\u0924\\u0947 \\u0939\\u0948\\u0902?\n#XMSG\nMessage.PageCreated=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u092C\\u0928\\u093E\\u0908 \\u091C\\u093E \\u091A\\u0941\\u0915\\u0940 \\u0939\\u0948.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u0915\\u094B\\u0908 \\u091F\\u093E\\u0907\\u0932 \\u0928\\u0939\\u0940\\u0902\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u0915\\u094B\\u0908 \\u0938\\u092E\\u0942\\u0939 \\u0928\\u0939\\u0940\\u0902\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError="{1}" \\u0938\\u092E\\u0942\\u0939 \\u092E\\u0947\\u0902 {0} \\u0932\\u094B\\u0921 \\u0915\\u0930\\u0928\\u0947 \\u092E\\u0947\\u0902 \\u0935\\u093F\\u092B\\u0932.\\n\\n\\u092F\\u0939 \\u0917\\u0932\\u0924SAP Fiori \\u0932\\u0949\\u0928\\u094D\\u091A\\u092A\\u0948\\u0921 \\u0915\\u0902\\u091F\\u0947\\u0902\\u091F \\u0915\\u0949\\u0928\\u094D\\u092B\\u093C\\u093F\\u0917\\u0930\\u0947\\u0936\\u0928 \\u092F\\u093E \\u090F\\u0915 \\u0917\\u0941\\u092E \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E \\u0905\\u0938\\u093E\\u0907\\u0928\\u092E\\u0947\\u0902\\u091F \\u0915\\u0947 \\u0915\\u093E\\u0930\\u0923 \\u0938\\u092C\\u0938\\u0947 \\u0905\\u0927\\u093F\\u0915 \\u0938\\u0902\\u092D\\u093E\\u0935\\u0928\\u093E \\u0939\\u0948.\\n\\n\\u0938\\u093E\\u092E\\u0917\\u094D\\u0930\\u0940 \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0915\\u094B \\u0926\\u093F\\u0916\\u093E\\u0908 \\u0928\\u0939\\u0940\\u0902 \\u0926\\u0947\\u0917\\u0940.\\n\\n\\u0907\\u0938 \\u0938\\u092E\\u0938\\u094D\\u092F\\u093E \\u0915\\u094B \\u0939\\u0932 \\u0915\\u0930\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093F\\u090F, \\u0915\\u0943\\u092A\\u092F\\u093E \\u0907\\u0938 \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E \\u0915\\u094B \\u0905\\u0938\\u093E\\u0907\\u0928 \\u0915\\u093F\\u090F \\u0917\\u090F \\u0915\\u0948\\u091F\\u0932\\u0949\\u0917 \\u0914\\u0930 \\u0932\\u0915\\u094D\\u0937\\u094D\\u092F \\u092E\\u0948\\u092A\\u093F\\u0902\\u0917 \\u0915\\u0940 \\u091C\\u093E\\u0902\\u091A \\u0915\\u0930\\u0947\\u0902.\n#XMSG\nMessage.NavigationTargetError=\\u0928\\u0947\\u0935\\u093F\\u0917\\u0947\\u0936\\u0928 \\u0932\\u0915\\u094D\\u0937\\u094D\\u092F \\u0915\\u094B \\u0939\\u0932 \\u0928\\u0939\\u0940\\u0902 \\u0915\\u093F\\u092F\\u093E \\u091C\\u093E \\u0938\\u0915\\u093E.\n#XMSG\nMessage.TilesHaveErrors=\\u0915\\u0941\\u091B \\u091F\\u093E\\u0907\\u0932\\u094B\\u0902 \\u092F\\u093E \\u0938\\u092E\\u0942\\u0939\\u094B\\u0902 \\u092E\\u0947\\u0902 \\u0924\\u094D\\u0930\\u0941\\u091F\\u093F\\u092F\\u093E\\u0902 \\u092F\\u093E \\u091A\\u0947\\u0924\\u093E\\u0935\\u0928\\u0940 \\u0939\\u0948\\u0902. \\u0915\\u094D\\u092F\\u093E \\u0906\\u092A \\u0935\\u093E\\u0915\\u0908 \\u0938\\u0939\\u0947\\u091C\\u0928\\u093E \\u091C\\u093E\\u0930\\u0940 \\u0930\\u0916\\u0928\\u093E \\u091A\\u093E\\u0939\\u0924\\u0947 \\u0939\\u0948\\u0902?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u091F\\u093E\\u0907\\u0932 \\u0915\\u0947 \\u0928\\u0947\\u0935\\u093F\\u0917\\u0947\\u0936\\u0928 \\u0932\\u0915\\u094D\\u0937\\u094D\\u092F \\u0915\\u094B \\u0939\\u0932 \\u0915\\u0930\\u0928\\u0947 \\u092E\\u0947\\u0902 \\u0935\\u093F\\u092B\\u0932\\: "{0}".\\n\\n\\u092F\\u0939 \\u0917\\u0932\\u0924 SAP Fiori \\u0932\\u0949\\u0928\\u094D\\u091A\\u092A\\u0948\\u0921 \\u0915\\u0902\\u091F\\u0947\\u0902\\u091F \\u0915\\u0949\\u0928\\u094D\\u092B\\u093C\\u093F\\u0917\\u0930\\u0947\\u0936\\u0928 \\u092F\\u093E \\u090F\\u0915 \\u0917\\u0941\\u092E \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E \\u0905\\u0938\\u093E\\u0907\\u0928\\u092E\\u0947\\u0902\\u091F \\u0915\\u0947 \\u0915\\u093E\\u0930\\u0923 \\u0938\\u092C\\u0938\\u0947 \\u0905\\u0927\\u093F\\u0915 \\u0938\\u0902\\u092D\\u093E\\u0935\\u0928\\u093E \\u0939\\u0948.\\n\\n\\u091F\\u093E\\u0907\\u0932 "{0}\\u201D \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0915\\u094B \\u0926\\u093F\\u0916\\u093E\\u0908 \\u091C\\u093E\\u090F\\u0917\\u0940, \\u0932\\u0947\\u0915\\u093F\\u0928 \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0907\\u0938 \\u091F\\u093E\\u0907\\u0932 \\u0915\\u093E \\u0909\\u092A\\u092F\\u094B\\u0917 \\u0915\\u0930\\u0915\\u0947 \\u0928\\u0947\\u0935\\u093F\\u0917\\u0947\\u091F \\u0915\\u0930\\u0928\\u0947 \\u092E\\u0947\\u0902 \\u0938\\u0915\\u094D\\u0937\\u092E \\u0928\\u0939\\u0940\\u0902 \\u0939\\u094B\\u0917\\u093E.\n#XMSG\nMessage.DeleteGroup=\\u0915\\u094D\\u092F\\u093E \\u0906\\u092A \\u0928\\u093F\\u0936\\u094D\\u091A\\u093F\\u0924 \\u0930\\u0942\\u092A \\u0938\\u0947 "{0}\\u201D \\u0938\\u092E\\u0942\\u0939 \\u0915\\u094B \\u0939\\u091F\\u093E\\u0928\\u093E \\u091A\\u093E\\u0939\\u0924\\u0947 \\u0939\\u0948\\u0902?\n#XMSG\nMessage.PageIsOutdated=\\u0907\\u0938 \\u092A\\u0943\\u0937\\u094D\\u0920 \\u0915\\u093E \\u0928\\u092F\\u093E \\u0938\\u0902\\u0938\\u094D\\u0915\\u0930\\u0923 \\u092A\\u0939\\u0932\\u0947 \\u0939\\u0940 \\u0938\\u0939\\u0947\\u091C\\u093E \\u091C\\u093E \\u091A\\u0941\\u0915\\u093E \\u0939\\u0948.\n#XMSG\nMessage.SaveChanges=\\u0915\\u0943\\u092A\\u092F\\u093E \\u0905\\u092A\\u0928\\u0947 \\u092C\\u0926\\u0932\\u093E\\u0935\\u094B\\u0902 \\u0915\\u094B \\u0938\\u0939\\u0947\\u091C\\u0947\\u0902.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u0928\\u092F\\u093E \\u092A\\u0943\\u0937\\u094D\\u0920\n#XTIT\nTitle.TilesHaveErrors=\\u091F\\u093E\\u0907\\u0932 \\u092E\\u0947\\u0902 \\u0924\\u094D\\u0930\\u0941\\u091F\\u093F\\u092F\\u093E\\u0902 \\u0939\\u0948\\u0902\n#XTIT\nDeleteDialog.Title=\\u0939\\u091F\\u093E\\u090F\\u0902\n#XMSG\nDeleteDialog.Text=\\u0915\\u094D\\u092F\\u093E \\u0906\\u092A \\u0935\\u093E\\u0915\\u0908 \\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0943\\u0937\\u094D\\u0920 \\u0939\\u091F\\u093E\\u0928\\u093E \\u091A\\u093E\\u0939\\u0924\\u0947 \\u0939\\u0948?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0939\\u091F\\u093E\\u090F\\u0902\n#XTIT\nDeleteDialog.LockedTitle=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u0932\\u0949\\u0915 \\u0939\\u0948\n#XMSG\nDeleteDialog.LockedText=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0943\\u0937\\u094D\\u0920 {0} \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0915\\u0947 \\u0926\\u094D\\u0935\\u093E\\u0930\\u093E \\u0932\\u0949\\u0915 \\u0915\\u0930 \\u0926\\u093F\\u092F\\u093E \\u0917\\u092F\\u093E \\u0939\\u0948.\n#XMSG\nDeleteDialog.TransportRequired=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0943\\u0937\\u094D\\u0920 \\u0915\\u094B \\u0939\\u091F\\u093E\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0915\\u0943\\u092A\\u092F\\u093E \\u0915\\u094B\\u0908 \\u091F\\u094D\\u0930\\u093E\\u0902\\u0938\\u092A\\u094B\\u0930\\u094D\\u091F \\u091A\\u0941\\u0928\\u0947\\u0902.\n\n#XMSG\nEditDialog.LockedText=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0943\\u0937\\u094D\\u0920 {0} \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0915\\u0947 \\u0926\\u094D\\u0935\\u093E\\u0930\\u093E \\u0932\\u0949\\u0915 \\u0915\\u0930 \\u0926\\u093F\\u092F\\u093E \\u0917\\u092F\\u093E \\u0939\\u0948.\n#XMSG\nEditDialog.TransportRequired=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0943\\u0937\\u094D\\u0920 \\u0915\\u094B \\u0938\\u0902\\u092A\\u093E\\u0926\\u093F\\u0924 \\u0915\\u0930\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0915\\u0943\\u092A\\u092F\\u093E \\u0915\\u094B\\u0908 \\u091F\\u094D\\u0930\\u093E\\u0902\\u0938\\u092A\\u094B\\u0930\\u094D\\u091F \\u091A\\u0941\\u0928\\u0947\\u0902.\n#XTIT\nEditDialog.Title=\\u0938\\u0902\\u092A\\u093E\\u0926\\u0928 \\u092A\\u0943\\u0937\\u094D\\u0920\n\n#XTIT\nErrorDialog.Title=\\u0924\\u094D\\u0930\\u0941\\u091F\\u093F\n\n#XTIT\nPageOverview.Title=\\u092A\\u0943\\u0937\\u094D\\u0920 \\u092C\\u0928\\u093E\\u090F \\u0930\\u0916\\u0947\\u0902\n\n\n#XTIT\nCopyDialog.Title=\\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u090F\\u0902\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0915\\u094D\\u092F\\u093E \\u0906\\u092A {0} \\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u0928\\u093E \\u091A\\u093E\\u0939\\u0924\\u0947 \\u0939\\u0948\\u0902?\n#XFLD\nCopyDialog.NewID={0} \\u0915\\u0940 \\u092A\\u094D\\u0930\\u0924\\u093F \\u092C\\u0928\\u093E\\u0908 \\u0917\\u0908\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0938\\u092E\\u0942\\u0939 {0} \\u0915\\u093E \\u0938\\u092E\\u0942\\u0939 \\u091F\\u093E\\u0907\\u0932 \\u0916\\u093E\\u0932\\u0940 \\u0939\\u0948.\n#XMSG\nTitle.UnsufficientRoles=\\u0938\\u093E\\u092E\\u0917\\u094D\\u0930\\u0940 \\u0926\\u093F\\u0916\\u093E\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0905\\u092A\\u0930\\u094D\\u092F\\u093E\\u092A\\u094D\\u0924 \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E \\u0905\\u0938\\u093E\\u0907\\u0928\\u092E\\u0947\\u0902\\u091F\n#XMSG\nTitle.ContentIsNotVisible=\\u0938\\u093E\\u092E\\u0917\\u094D\\u0930\\u0940 \\u0909\\u092A\\u092F\\u094B\\u0917\\u0915\\u0930\\u094D\\u0924\\u093E \\u0915\\u094B \\u0926\\u093F\\u0916\\u093E\\u0908 \\u0928\\u0939\\u0940\\u0902 \\u0926\\u0947\\u0917\\u0940.\n#XMSG\nTitle.ContentNotNavigateable=\\u0938\\u093E\\u092E\\u0917\\u094D\\u0930\\u0940 \\u0928\\u0947\\u0935\\u093F\\u0917\\u0947\\u091F \\u0915\\u0930\\u0928\\u0947 \\u092F\\u094B\\u0917\\u094D\\u092F \\u0928\\u0939\\u0940\\u0902 \\u0939\\u094B\\u0917\\u0940.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_hr.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Odr\\u017Eavaj stranice\n\n\n#XBUT\nButton.Add=Dodaj\n#XBUT\nButton.Cancel=Otka\\u017Ei\n#XBUT\nButton.Copy=Kopiraj\n#XBUT\nButton.Create=Kreiraj\n#XBUT\nButton.Delete=Izbri\\u0161i\n#XBUT\nButton.Edit=Uredi\n#XBUT\nButton.Save=Snimi\n#XBUT\nButton.Ok=U redu\n#XBUT\nButton.ShowCatalogs=Zamijeni kataloge\n#XBUT\nButton.SortCatalogs=Zamijeni redoslijed sortiranja kataloga\n#XBUT\nButton.CollapseCatalogs=Sa\\u017Emi sve kataloge\n#XBUT\nButton.ExpandCatalogs=Pro\\u0161iri sve kataloge\n#XBUT\nButton.ShowDetails=Poka\\u017Ei detalje\n#XBUT\nButton.PagePreview=Pregled stranice\n\n\n#XTOL\nTooltip.AddToGroups=Dodaj grupama\n#XTOL Tooltip for the search button\nTooltip.Search=Tra\\u017Ei\n#XTOL\nTooltip.SearchForTiles=Tra\\u017Ei podekrane\n\n\n#XFLD\nLabel.PageID=ID stranice\n#XFLD\nLabel.WorkbenchRequest=Workbench zahtjev\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Informacije o transportu\n#XFLD\nLabel.Details=Detalji\\:\n#XFLD\nLabel.ResponseCode=\\u0160ifra odgovora\\:\n#XFLD\nLabel.Description=Opis\n#XFLD\nLabel.CreatedBy=Kreirao\n#XFLD\nLabel.CreatedOn=Datum kreiranja\n#XFLD\nLabel.ChangedBy=Promijenio\n#XFLD\nLabel.ChangedOn=Datum promjene\n#XFLD\nLabel.PageTitle=Naslov stranice\n#XFLD\nLabel.AssignedRole=Dodijeljena uloga\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Naslov\n#XCOL\nColumn.PageDescription=Opis\n#XCOL\nColumn.PageCreatedBy=Kreirao\n#XCOL\nColumn.PageCreatedOn=Datum kreiranja\n#XCOL\nColumn.PageChangedBy=Promijenio\n#XCOL\nColumn.PageChangedOn=Datum promjene\n\n\n#XTOL\nPlaceholder.GroupName=Unesi naziv grupe\n#XTOL\nPlaceholder.SearchForTiles=Tra\\u017Ei podekrane\n\n#MSG\nMessage.NoGroupTitle=Grupa {0} nema naslov. Kako bi se osigurao dosljedni korisni\\u010Dki do\\u017Eivljaj, preporu\\u010Dujemo unos naziva grupe za svaku grupu.\n#XMSG\nMessage.InvalidGroupTitle=U idealnom slu\\u010Daju trebali biste unijeti naziv grupe.\n#XMSG\nMessage.NoInternetConnection=Provjerite svoju internetsku vezu.\n#XMSG\nMessage.SavedChanges=Va\\u0161e su promjene snimljene.\n#XMSG\nMessage.InvalidPageID=Upotrebljavajte samo sljede\\u0107e znakove\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Navedite ID stranice.\n#XMSG\nMessage.EmptyTitle=Navedite podekran.\n#XMSG\nMessage.SuccessDeletePage=Odabrani objekt izbrisan je.\n#XMSG\nMessage.ClipboardCopySuccess=Detalji uspje\\u0161no kopirani.\n#YMSE\nMessage.ClipboardCopyFail=Pojavila se gre\\u0161ka pri kopiranju detalja.\n#XMSG\nMessage.DeletePageConfirmation=\\u017Delite li zaista izbrisati \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Stranica je kreirana.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Nema podekrana\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Nema grupa\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=U\\u010Ditavanje podekrana {0} u grupu "{1}" nije uspjelo.\\n\\nUzrok tome najvjerojatnije je neto\\u010Dna konfiguracija sadr\\u017Eaja SAP Fiori launchpada ili nedostaju\\u0107a dodjela uloge.\\n\\nSadr\\u017Eaj \\u0107e biti nevidljiv za korisnika.\\n\\nKako biste razrije\\u0161ili problem, provjerite kataloge i ciljna mapiranja dodijeljena ovoj ulozi.\n#XMSG\nMessage.NavigationTargetError=Cilj usmjeravanja nije mogu\\u0107e razrije\\u0161iti.\n#XMSG\nMessage.TilesHaveErrors=Neki podekrani ili grupe imaju gre\\u0161ke ili upozorenja. \\u017Delite li zaista nastaviti sa snimanjem?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Nije uspjelo razrje\\u0161avanje cilja usmjeravanja podekrana\\: "{0}".\\n\\n Uzrok tome najvjerojatnije je neto\\u010Dna konfiguracija sadr\\u017Eaja SAP Fiori launchpada ili nedostaju\\u0107a dodjela uloge.\\n\\n Podekran "{0}" prikazat \\u0107e se korisniku, ali korisnik ne\\u0107e mo\\u0107i usmjeravati koriste\\u0107i ovaj podekran.\n#XMSG\nMessage.DeleteGroup=\\u017Delite li zaista izbrisati grupu "{0}"?\n#XMSG\nMessage.PageIsOutdated=Novija verzija ove stranice ve\\u0107 je snimljena.\n#XMSG\nMessage.SaveChanges=Snimite svoje promjene.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nova stranica\n#XTIT\nTitle.TilesHaveErrors=Podekrani imaju gre\\u0161ke\n#XTIT\nDeleteDialog.Title=Izbri\\u0161i\n#XMSG\nDeleteDialog.Text=\\u017Delite li zaista izbrisati odabran stranicu?\n#XBUT\nDeleteDialog.ConfirmButton=Izbri\\u0161i\n#XTIT\nDeleteDialog.LockedTitle=Stranica zaklju\\u010Dana\n#XMSG\nDeleteDialog.LockedText=Odabranu stranicu zaklju\\u010Dao je korisnik {0}.\n#XMSG\nDeleteDialog.TransportRequired=Odaberite transport za brisanje odabrane stranice.\n\n#XMSG\nEditDialog.LockedText=Odabranu stranicu zaklju\\u010Dao je korisnik {0}.\n#XMSG\nEditDialog.TransportRequired=Odaberite transport za ure\\u0111ivanje odabrane stranice.\n#XTIT\nEditDialog.Title=Uredi stranicu\n\n#XTIT\nErrorDialog.Title=Gre\\u0161ka\n\n#XTIT\nPageOverview.Title=Odr\\u017Eavaj stranice\n\n\n#XTIT\nCopyDialog.Title=Kopiraj\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u017Delite li kopirati {0}?\n#XFLD\nCopyDialog.NewID=Kopija {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Naslov grupe {0} prazan je.\n#XMSG\nTitle.UnsufficientRoles=Nedovoljna dodjela uloge za prikaz sadr\\u017Eaja\n#XMSG\nTitle.ContentIsNotVisible=Sadr\\u017Eaj \\u0107e biti nevidljiv za korisnika.\n#XMSG\nTitle.ContentNotNavigateable=Usmjeravanje u sadr\\u017Eaju ne\\u0107e biti mogu\\u0107e.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_hu.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Oldalak karbantart\\u00E1sa\n\n\n#XBUT\nButton.Add=Hozz\\u00E1ad\\u00E1s\n#XBUT\nButton.Cancel=M\\u00E9gse\n#XBUT\nButton.Copy=M\\u00E1sol\\u00E1s\n#XBUT\nButton.Create=L\\u00E9trehoz\\u00E1s\n#XBUT\nButton.Delete=T\\u00F6rl\\u00E9s\n#XBUT\nButton.Edit=Szerkeszt\\u00E9s\n#XBUT\nButton.Save=Ment\\u00E9s\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Katal\\u00F3gusok \\u00E1tkapcsol\\u00E1sa\n#XBUT\nButton.SortCatalogs=Katal\\u00F3gus rendez\\u00E9si sorrendj\\u00E9nek v\\u00E1lt\\u00E1sa\n#XBUT\nButton.CollapseCatalogs=\\u00D6sszes katal\\u00F3gus visszaz\\u00E1r\\u00E1sa\n#XBUT\nButton.ExpandCatalogs=\\u00D6sszes katal\\u00F3gus kibont\\u00E1sa\n#XBUT\nButton.ShowDetails=R\\u00E9szletek megjelen\\u00EDt\\u00E9se\n#XBUT\nButton.PagePreview=Oldal el\\u0151n\\u00E9zete\n\n\n#XTOL\nTooltip.AddToGroups=Hozz\\u00E1ad\\u00E1s csoportokhoz\n#XTOL Tooltip for the search button\nTooltip.Search=Keres\\u00E9s\n#XTOL\nTooltip.SearchForTiles=Csemp\\u00E9k keres\\u00E9se\n\n\n#XFLD\nLabel.PageID=Oldal azonos\\u00EDt\\u00F3ja\n#XFLD\nLabel.WorkbenchRequest=Workbench-k\\u00E9relem\n#XFLD\nLabel.Package=Csomag\n#XFLD\nLabel.TransportInformation=Transzportinform\\u00E1ci\\u00F3\n#XFLD\nLabel.Details=R\\u00E9szletek\\:\n#XFLD\nLabel.ResponseCode=V\\u00E1laszk\\u00F3d\\:\n#XFLD\nLabel.Description=Le\\u00EDr\\u00E1s\n#XFLD\nLabel.CreatedBy=L\\u00E9trehozta\\:\n#XFLD\nLabel.CreatedOn=L\\u00E9trehoz\\u00E1s d\\u00E1tuma\n#XFLD\nLabel.ChangedBy=M\\u00F3dos\\u00EDt\\u00F3\n#XFLD\nLabel.ChangedOn=M\\u00F3dos\\u00EDt\\u00E1s d\\u00E1tuma\n#XFLD\nLabel.PageTitle=Oldal c\\u00EDme\n#XFLD\nLabel.AssignedRole=Hozz\\u00E1rendelt szerep\n\n\n#XCOL\nColumn.PageID=Azonos\\u00EDt\\u00F3\n#XCOL\nColumn.PageTitle=C\\u00EDm\n#XCOL\nColumn.PageDescription=Le\\u00EDr\\u00E1s\n#XCOL\nColumn.PageCreatedBy=L\\u00E9trehozta\n#XCOL\nColumn.PageCreatedOn=L\\u00E9trehoz\\u00E1s d\\u00E1tuma\n#XCOL\nColumn.PageChangedBy=M\\u00F3dos\\u00EDt\\u00F3\n#XCOL\nColumn.PageChangedOn=M\\u00F3dos\\u00EDt\\u00E1s d\\u00E1tuma\n\n\n#XTOL\nPlaceholder.GroupName=Adja meg a csoport nev\\u00E9t\n#XTOL\nPlaceholder.SearchForTiles=Csemp\\u00E9k keres\\u00E9se\n\n#MSG\nMessage.NoGroupTitle=A(z) {0} csoportnak nincs megnevez\\u00E9se. Az egys\\u00E9ges felhaszn\\u00E1l\\u00F3i \\u00E9lm\\u00E9ny \\u00E9rdek\\u00E9ben javasoljuk, hogy minden csoportnak adjon nevet.\n#XMSG\nMessage.InvalidGroupTitle=C\\u00E9lszer\\u0171 megadni a csoport nev\\u00E9t.\n#XMSG\nMessage.NoInternetConnection=Ellen\\u0151rizze az internetkapcsolat\\u00E1t.\n#XMSG\nMessage.SavedChanges=A m\\u00F3dos\\u00EDt\\u00E1sok mentve.\n#XMSG\nMessage.InvalidPageID=Csak ezeket a karaktereket haszn\\u00E1lja\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Adja meg az oldal azonos\\u00EDt\\u00F3j\\u00E1t.\n#XMSG\nMessage.EmptyTitle=Adja meg a c\\u00EDmet.\n#XMSG\nMessage.SuccessDeletePage=A kiv\\u00E1lasztott objektum t\\u00F6rl\\u0151d\\u00F6tt.\n#XMSG\nMessage.ClipboardCopySuccess=A r\\u00E9szletek sikeresen m\\u00E1solva.\n#YMSE\nMessage.ClipboardCopyFail=Hiba l\\u00E9pett fel a r\\u00E9szletek m\\u00E1sol\\u00E1sakor.\n#XMSG\nMessage.DeletePageConfirmation=Biztosan t\\u00F6rli a k\\u00F6vetkez\\u0151t\\: \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Az oldal l\\u00E9trej\\u00F6tt.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Nincs csempe\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Nincs csoport\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Nem siker\\u00FClt bet\\u00F6lteni a(z) {1} csoportban tal\\u00E1lhat\\u00F3 {0} csemp\\u00E9t.\\n\\nEnnek oka val\\u00F3sz\\u00EDn\\u0171leg egy helytelen SAP Fiori-ind\\u00EDt\\u00F3pulti tartalomkonfigur\\u00E1ci\\u00F3 vagy egy hi\\u00E1nyz\\u00F3 szerep-hozz\\u00E1rendel\\u00E9s.\\n\\nA felhaszn\\u00E1l\\u00F3 nem fogja l\\u00E1tni a tartalmat.\\n\\nA probl\\u00E9ma megold\\u00E1s\\u00E1hoz ellen\\u0151rizze a szerephez hozz\\u00E1rendelt katal\\u00F3gus- \\u00E9s c\\u00E9lhozz\\u00E1rendel\\u00E9seket.\n#XMSG\nMessage.NavigationTargetError=A navig\\u00E1ci\\u00F3s c\\u00E9l nem tal\\u00E1lhat\\u00F3.\n#XMSG\nMessage.TilesHaveErrors=Egyes csemp\\u00E9kn\\u00E9l vagy csoportokn\\u00E1l hib\\u00E1k vagy figyelmeztet\\u00E9sek tal\\u00E1lhat\\u00F3k. Biztosan folytatja a ment\\u00E9st?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=A(z) {0} csempe navig\\u00E1ci\\u00F3s c\\u00E9lja nem tal\\u00E1lhat\\u00F3.\\n\\nEnnek oka val\\u00F3sz\\u00EDn\\u0171leg egy helytelen SAP Fiori-ind\\u00EDt\\u00F3pulti tartalomkonfigur\\u00E1ci\\u00F3 vagy egy hi\\u00E1nyz\\u00F3 szerep-hozz\\u00E1rendel\\u00E9s.\\n\\nA rendszer megjelen\\u00EDti a(z) {0} csemp\\u00E9t a felhaszn\\u00E1l\\u00F3 sz\\u00E1m\\u00E1ra, de a felhaszn\\u00E1l\\u00F3 a csempe haszn\\u00E1lat\\u00E1val nem fog tudni a tartalomhoz navig\\u00E1lni.\n#XMSG\nMessage.DeleteGroup=Biztosan t\\u00F6rli a(z) {0} csoportot?\n#XMSG\nMessage.PageIsOutdated=M\\u00E1r mentett\\u00E9k az oldal \\u00FAjabb verzi\\u00F3j\\u00E1t.\n#XMSG\nMessage.SaveChanges=Mentse a m\\u00F3dos\\u00EDt\\u00E1sait.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u00DAj oldal\n#XTIT\nTitle.TilesHaveErrors=Hib\\u00E1s csemp\\u00E9k\n#XTIT\nDeleteDialog.Title=T\\u00F6rl\\u00E9s\n#XMSG\nDeleteDialog.Text=Biztosan t\\u00F6rli a kijel\\u00F6lt oldalt?\n#XBUT\nDeleteDialog.ConfirmButton=T\\u00F6rl\\u00E9s\n#XTIT\nDeleteDialog.LockedTitle=Az oldal z\\u00E1rolva\n#XMSG\nDeleteDialog.LockedText=A kiv\\u00E1lasztott oldalt {0} felhaszn\\u00E1l\\u00F3 z\\u00E1rolja.\n#XMSG\nDeleteDialog.TransportRequired=V\\u00E1lasszon egy transzportot a kiv\\u00E1lasztott oldal t\\u00F6rl\\u00E9s\\u00E9hez.\n\n#XMSG\nEditDialog.LockedText=A kiv\\u00E1lasztott oldalt {0} felhaszn\\u00E1l\\u00F3 z\\u00E1rolja.\n#XMSG\nEditDialog.TransportRequired=V\\u00E1lasszon egy transzportot a kiv\\u00E1lasztott oldal szerkeszt\\u00E9s\\u00E9hez.\n#XTIT\nEditDialog.Title=Oldal szerkeszt\\u00E9se\n\n#XTIT\nErrorDialog.Title=Hiba\n\n#XTIT\nPageOverview.Title=Oldalak karbantart\\u00E1sa\n\n\n#XTIT\nCopyDialog.Title=M\\u00E1sol\\u00E1s\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=M\\u00E1solja a k\\u00F6vetkez\\u0151t\\: {0}?\n#XFLD\nCopyDialog.NewID={0} m\\u00E1solata\n\n\n#XMSG\nTitle.NoGroupTitle=A(z) {0} csoport megnevez\\u00E9se \\u00FCres.\n#XMSG\nTitle.UnsufficientRoles=A szerep-hozz\\u00E1rendel\\u00E9s nem megfelel\\u0151 a tartalom megjelen\\u00EDt\\u00E9s\\u00E9hez.\n#XMSG\nTitle.ContentIsNotVisible=A felhaszn\\u00E1l\\u00F3 nem fogja l\\u00E1tni a tartalmat.\n#XMSG\nTitle.ContentNotNavigateable=Nem lehet a tartalomhoz navig\\u00E1lni.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_it.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Elabora pagine\n\n\n#XBUT\nButton.Add=Aggiungi\n#XBUT\nButton.Cancel=Annulla\n#XBUT\nButton.Copy=Copia\n#XBUT\nButton.Create=Crea\n#XBUT\nButton.Delete=Elimina\n#XBUT\nButton.Edit=Elabora\n#XBUT\nButton.Save=Salva\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Attiva/disattiva cataloghi\n#XBUT\nButton.SortCatalogs=Attiva/disattiva ordine di classificazione catalogo\n#XBUT\nButton.CollapseCatalogs=Comprimi tutti i cataloghi\n#XBUT\nButton.ExpandCatalogs=Esplodi tutti i cataloghi\n#XBUT\nButton.ShowDetails=Visualizza dettagli\n#XBUT\nButton.PagePreview=Anteprima pagina\n\n\n#XTOL\nTooltip.AddToGroups=Aggiungi ai gruppi\n#XTOL Tooltip for the search button\nTooltip.Search=Ricerca\n#XTOL\nTooltip.SearchForTiles=Cerca tiles\n\n\n#XFLD\nLabel.PageID=ID pagina\n#XFLD\nLabel.WorkbenchRequest=Richiesta workbench\n#XFLD\nLabel.Package=Pacchetto\n#XFLD\nLabel.TransportInformation=Informazioni trasporto\n#XFLD\nLabel.Details=Dettagli\\:\n#XFLD\nLabel.ResponseCode=Codice risposta\\:\n#XFLD\nLabel.Description=Descrizione\n#XFLD\nLabel.CreatedBy=Autore creazione\n#XFLD\nLabel.CreatedOn=Data di creazione\n#XFLD\nLabel.ChangedBy=Autore modifica\n#XFLD\nLabel.ChangedOn=Data di modifica\n#XFLD\nLabel.PageTitle=Titolo pagina\n#XFLD\nLabel.AssignedRole=Ruolo attribuito\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titolo\n#XCOL\nColumn.PageDescription=Descrizione\n#XCOL\nColumn.PageCreatedBy=Autore creazione\n#XCOL\nColumn.PageCreatedOn=Data di creazione\n#XCOL\nColumn.PageChangedBy=Autore modifica\n#XCOL\nColumn.PageChangedOn=Data di modifica\n\n\n#XTOL\nPlaceholder.GroupName=Inserisci nome gruppo\n#XTOL\nPlaceholder.SearchForTiles=Cerca tiles\n\n#MSG\nMessage.NoGroupTitle=Il gruppo {0} non ha alcun titolo. Per garantire un\'\'esperienza utente uniforme, si consiglia di inserire un nome di gruppo per ogni gruppo.\n#XMSG\nMessage.InvalidGroupTitle=Inserire preferibilmente un nome di gruppo.\n#XMSG\nMessage.NoInternetConnection=Controlla la connessione Internet.\n#XMSG\nMessage.SavedChanges=Le modifiche sono state salvate.\n#XMSG\nMessage.InvalidPageID=Utilizza solo i seguenti caratteri\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Indica l\\u2019ID della pagina.\n#XMSG\nMessage.EmptyTitle=Indica il titolo.\n#XMSG\nMessage.SuccessDeletePage=L\'oggetto selezionato \\u00E8 stato eliminato.\n#XMSG\nMessage.ClipboardCopySuccess=I dettagli sono stati copiati correttamente.\n#YMSE\nMessage.ClipboardCopyFail=Errore durante la copia dei dettagli.\n#XMSG\nMessage.DeletePageConfirmation=Confermare eliminazione di\\n {0} {1}?\n#XMSG\nMessage.PageCreated=La pagina \\u00E8 stata creata.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Nessun tile\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Nessun gruppo\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Il tile {0} non \\u00E8 stato caricato nel gruppo "{1}".\\n\\n Ci\\u00F2 dipende molto probabilmente da una configurazione errata del contenuto del launchpad di SAP Fiori oppure da un\'\'attribuzione ruoli mancante.\\n\\n Il contenuto sar\\u00E0 visibile all\\u2019utente.\\n\\n Per risolvere la questione, controlla i cataloghi e mappaggi di destinazione attribuiti al presente ruolo.\n#XMSG\nMessage.NavigationTargetError=La destinazione di navigazione non \\u00E8 stata risolta.\n#XMSG\nMessage.TilesHaveErrors=Alcuni dei tile o dei gruppi hanno errori o messaggi di avvertimento. Procedere ugualmente con il salvataggio?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=La destinazione di navigazione del tile\\: "{0}\\u201D non \\u00E8 stata risolta.\\n\\n Ci\\u00F2 dipende molto probabilmente da una configurazione errata del contenuto del launchpad di SAP Fiori oppure da un\'\'attribuzione ruoli mancante.\\n\\n Il tile "{0}" sar\\u00E0 visibile all\\u2019utente ma l\'\'utente non sar\\u00E0 in grado di navigare utilizzando il tile.\n#XMSG\nMessage.DeleteGroup=Confermare eliminazione del gruppo "{0}"?\n#XMSG\nMessage.PageIsOutdated=Una versione pi\\u00F9 recente di questa pagina \\u00E8 gi\\u00E0 stata salvata.\n#XMSG\nMessage.SaveChanges=Salva le modifiche.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nuova pagina\n#XTIT\nTitle.TilesHaveErrors=I tile hanno errori\n#XTIT\nDeleteDialog.Title=Elimina\n#XMSG\nDeleteDialog.Text=Confermare l\'eliminazione della pagina selezionata?\n#XBUT\nDeleteDialog.ConfirmButton=Elimina\n#XTIT\nDeleteDialog.LockedTitle=Pagina bloccata\n#XMSG\nDeleteDialog.LockedText=La pagina selezionata \\u00E8 bloccata dall\'\'utente {0}.\n#XMSG\nDeleteDialog.TransportRequired=Seleziona un trasporto per eliminare la pagina selezionata.\n\n#XMSG\nEditDialog.LockedText=La pagina selezionata \\u00E8 bloccata dall\'\'utente {0}.\n#XMSG\nEditDialog.TransportRequired=Seleziona un trasporto per elaborare la pagina selezionata.\n#XTIT\nEditDialog.Title=Elabora pagina\n\n#XTIT\nErrorDialog.Title=Errore/i\n\n#XTIT\nPageOverview.Title=Elabora pagine\n\n\n#XTIT\nCopyDialog.Title=Copia\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Copiare {0}?\n#XFLD\nCopyDialog.NewID=Copia di {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Il titolo gruppo del gruppo {0} \\u00E8 vuoto.\n#XMSG\nTitle.UnsufficientRoles=Attribuzione ruoli insufficiente per mostrare il contenuto\n#XMSG\nTitle.ContentIsNotVisible=Il contenuto non sar\\u00E0 visibile all\\u2019utente.\n#XMSG\nTitle.ContentNotNavigateable=Il contenuto non sar\\u00E0 navigabile.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_iw.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u05EA\\u05D7\\u05D6\\u05E7 \\u05D3\\u05E4\\u05D9\\u05DD\n\n\n#XBUT\nButton.Add=\\u05D4\\u05D5\\u05E1\\u05E3\n#XBUT\nButton.Cancel=\\u05D1\\u05D8\\u05DC\n#XBUT\nButton.Copy=\\u05D4\\u05E2\\u05EA\\u05E7\n#XBUT\nButton.Create=\\u05E6\\u05D5\\u05E8\n#XBUT\nButton.Delete=\\u05DE\\u05D7\\u05E7\n#XBUT\nButton.Edit=\\u05E2\\u05E8\\u05D5\\u05DA\n#XBUT\nButton.Save=\\u05E9\\u05DE\\u05D5\\u05E8\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u05D4\\u05D7\\u05DC\\u05E3 \\u05E7\\u05D8\\u05DC\\u05D5\\u05D2\\u05D9\\u05DD\n#XBUT\nButton.SortCatalogs=\\u05D4\\u05D7\\u05DC\\u05E3 \\u05D0\\u05EA \\u05E1\\u05D3\\u05E8 \\u05DE\\u05D9\\u05D5\\u05DF \\u05D4\\u05E7\\u05D8\\u05DC\\u05D5\\u05D2\n#XBUT\nButton.CollapseCatalogs=\\u05E6\\u05DE\\u05E6\\u05DD \\u05D0\\u05EA \\u05DB\\u05DC \\u05D4\\u05E7\\u05D8\\u05DC\\u05D5\\u05D2\\u05D9\\u05DD\n#XBUT\nButton.ExpandCatalogs=\\u05D4\\u05E8\\u05D7\\u05D1 \\u05D0\\u05EA \\u05DB\\u05DC \\u05D4\\u05E7\\u05D8\\u05DC\\u05D5\\u05D2\\u05D9\\u05DD\n#XBUT\nButton.ShowDetails=\\u05D4\\u05E6\\u05D2 \\u05E4\\u05E8\\u05D8\\u05D9\\u05DD\n#XBUT\nButton.PagePreview=\\u05EA\\u05E6\\u05D5\\u05D2\\u05D4 \\u05DE\\u05E7\\u05D3\\u05D9\\u05DE\\u05D4 \\u05E9\\u05DC \\u05D3\\u05E3\n\n\n#XTOL\nTooltip.AddToGroups=\\u05D4\\u05D5\\u05E1\\u05E3 \\u05DC\\u05E7\\u05D1\\u05D5\\u05E6\\u05D5\\u05EA\n#XTOL Tooltip for the search button\nTooltip.Search=\\u05D7\\u05D9\\u05E4\\u05D5\\u05E9\n#XTOL\nTooltip.SearchForTiles=\\u05D7\\u05E4\\u05E9 \\u05D0\\u05E8\\u05D9\\u05D7\\u05D9\\u05DD\n\n\n#XFLD\nLabel.PageID=\\u05D6\\u05D9\\u05D4\\u05D5\\u05D9 \\u05D3\\u05E3\n#XFLD\nLabel.WorkbenchRequest=\\u05D1\\u05E7\\u05E9\\u05EA Workbench\n#XFLD\nLabel.Package=\\u05D7\\u05D1\\u05D9\\u05DC\\u05D4\n#XFLD\nLabel.TransportInformation=\\u05DE\\u05D9\\u05D3\\u05E2 \\u05E2\\u05DC \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\n#XFLD\nLabel.Details=\\u05E4\\u05E8\\u05D8\\u05D9\\u05DD\\:\n#XFLD\nLabel.ResponseCode=\\u05E7\\u05D5\\u05D3 \\u05EA\\u05D2\\u05D5\\u05D1\\u05D4\\:\n#XFLD\nLabel.Description=\\u05EA\\u05D9\\u05D0\\u05D5\\u05E8\n#XFLD\nLabel.CreatedBy=\\u05E0\\u05D5\\u05E6\\u05E8 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9\n#XFLD\nLabel.CreatedOn=\\u05E0\\u05D5\\u05E6\\u05E8 \\u05D1\\u05EA\\u05D0\\u05E8\\u05D9\\u05DA\n#XFLD\nLabel.ChangedBy=\\u05E9\\u05D5\\u05E0\\u05D4 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9\n#XFLD\nLabel.ChangedOn=\\u05E9\\u05D5\\u05E0\\u05D4 \\u05D1\\u05EA\\u05D0\\u05E8\\u05D9\\u05DA\n#XFLD\nLabel.PageTitle=\\u05DB\\u05D5\\u05EA\\u05E8\\u05EA \\u05D3\\u05E3\n#XFLD\nLabel.AssignedRole=\\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05DE\\u05D5\\u05E7\\u05E6\\u05D4\n\n\n#XCOL\nColumn.PageID=\\u05D6\\u05D9\\u05D4\\u05D5\\u05D9\n#XCOL\nColumn.PageTitle=\\u05DB\\u05D5\\u05EA\\u05E8\\u05EA\n#XCOL\nColumn.PageDescription=\\u05EA\\u05D9\\u05D0\\u05D5\\u05E8\n#XCOL\nColumn.PageCreatedBy=\\u05E0\\u05D5\\u05E6\\u05E8 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9\n#XCOL\nColumn.PageCreatedOn=\\u05E0\\u05D5\\u05E6\\u05E8 \\u05D1\\u05EA\\u05D0\\u05E8\\u05D9\\u05DA\n#XCOL\nColumn.PageChangedBy=\\u05E9\\u05D5\\u05E0\\u05D4 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9\n#XCOL\nColumn.PageChangedOn=\\u05E9\\u05D5\\u05E0\\u05D4 \\u05D1\\u05EA\\u05D0\\u05E8\\u05D9\\u05DA\n\n\n#XTOL\nPlaceholder.GroupName=\\u05D4\\u05D6\\u05DF \\u05E9\\u05DD \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4\n#XTOL\nPlaceholder.SearchForTiles=\\u05D7\\u05E4\\u05E9 \\u05D0\\u05D7\\u05E8 \\u05D0\\u05E8\\u05D9\\u05D7\\u05D9\\u05DD\n\n#MSG\nMessage.NoGroupTitle=\\u05D0\\u05D9\\u05DF \\u05DB\\u05D5\\u05EA\\u05E8\\u05EA \\u05DC\\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 {0}. \\u05DB\\u05D3\\u05D9 \\u05DC\\u05D4\\u05D1\\u05D8\\u05D9\\u05D7 \\u05D7\\u05D5\\u05D5\\u05D9\\u05D9\\u05EA \\u05DE\\u05E9\\u05EA\\u05DE\\u05E9 \\u05E2\\u05E7\\u05D1\\u05D9\\u05EA, \\u05DE\\u05D5\\u05DE\\u05DC\\u05E5 \\u05DC\\u05D4\\u05D6\\u05D9\\u05DF \\u05E9\\u05DD \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 \\u05DC\\u05DB\\u05DC \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4.\n#XMSG\nMessage.InvalidGroupTitle=\\u05D1\\u05D0\\u05D5\\u05E4\\u05DF \\u05D0\\u05D9\\u05D3\\u05D9\\u05D0\\u05DC\\u05D9 \\u05E2\\u05DC\\u05D9\\u05DA \\u05DC\\u05D4\\u05D6\\u05D9\\u05DF \\u05E9\\u05DD \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4.\n#XMSG\nMessage.NoInternetConnection=\\u05D1\\u05D3\\u05D5\\u05E7 \\u05D0\\u05EA \\u05D7\\u05D9\\u05D1\\u05D5\\u05E8 \\u05D4\\u05D0\\u05D9\\u05E0\\u05D8\\u05E8\\u05E0\\u05D8 \\u05E9\\u05DC\\u05DA.\n#XMSG\nMessage.SavedChanges=\\u05D4\\u05E9\\u05D9\\u05E0\\u05D5\\u05D9\\u05D9\\u05DD \\u05E9\\u05D1\\u05D9\\u05E6\\u05E2\\u05EA \\u05E0\\u05E9\\u05DE\\u05E8\\u05D5.\n#XMSG\nMessage.InvalidPageID=\\u05D4\\u05E9\\u05EA\\u05DE\\u05E9 \\u05E8\\u05E7 \\u05D1\\u05EA\\u05D5\\u05D5\\u05D9\\u05DD \\u05D4\\u05D1\\u05D0\\u05D9\\u05DD\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u05E1\\u05E4\\u05E7 \\u05D0\\u05EA \\u05D6\\u05D9\\u05D4\\u05D5\\u05D9 \\u05D4\\u05D3\\u05E3.\n#XMSG\nMessage.EmptyTitle=\\u05E1\\u05E4\\u05E7 \\u05D0\\u05EA \\u05D4\\u05DB\\u05D5\\u05EA\\u05E8\\u05EA.\n#XMSG\nMessage.SuccessDeletePage=\\u05D4\\u05D0\\u05D5\\u05D1\\u05D9\\u05D9\\u05E7\\u05D8 \\u05E9\\u05E0\\u05D1\\u05D7\\u05E8 \\u05E0\\u05DE\\u05D7\\u05E7.\n#XMSG\nMessage.ClipboardCopySuccess=\\u05E4\\u05E8\\u05D8\\u05D9\\u05DD \\u05D4\\u05D5\\u05E2\\u05EA\\u05E7\\u05D5 \\u05D1\\u05D4\\u05E6\\u05DC\\u05D7\\u05D4.\n#YMSE\nMessage.ClipboardCopyFail=\\u05D0\\u05D9\\u05E8\\u05E2\\u05D4 \\u05E9\\u05D2\\u05D9\\u05D0\\u05D4 \\u05D1\\u05DE\\u05D4\\u05DC\\u05DA \\u05D4\\u05E2\\u05EA\\u05E7\\u05EA \\u05E4\\u05E8\\u05D8\\u05D9\\u05DD.\n#XMSG\nMessage.DeletePageConfirmation=\\u05D4\\u05D0\\u05DD \\u05D0\\u05EA\\u05D4 \\u05D1\\u05D8\\u05D5\\u05D7 \\u05E9\\u05D1\\u05E8\\u05E6\\u05D5\\u05E0\\u05DA \\u05DC\\u05DE\\u05D7\\u05D5\\u05E7 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u05D4\\u05D3\\u05E3 \\u05E0\\u05D5\\u05E6\\u05E8.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u05D0\\u05D9\\u05DF \\u05D0\\u05E8\\u05D9\\u05D7\\u05D9\\u05DD\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u05D0\\u05D9\\u05DF \\u05E7\\u05D1\\u05D5\\u05E6\\u05D5\\u05EA\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u05D8\\u05E2\\u05D9\\u05E0\\u05EA \\u05D4\\u05D0\\u05E8\\u05D9\\u05D7 {0} \\u05D1\\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 "{1}" \\u05E0\\u05DB\\u05E9\\u05DC\\u05D4.\\n\\n\\u05E1\\u05D1\\u05D9\\u05E8 \\u05DC\\u05D4\\u05E0\\u05D9\\u05D7 \\u05E9\\u05DB\\u05D9\\u05E9\\u05DC\\u05D5\\u05DF \\u05D4\\u05D8\\u05E2\\u05D9\\u05E0\\u05D4 \\u05E0\\u05D2\\u05E8\\u05DD \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05EA\\u05E6\\u05D5\\u05E8\\u05D4 \\u05E9\\u05D2\\u05D5\\u05D9\\u05D4 \\u05E9\\u05DC \\u05EA\\u05D5\\u05DB\\u05DF \\u05DC\\u05D5\\u05D7 \\u05D4\\u05E4\\u05E2\\u05DC\\u05D4 \\u05E9\\u05DC SAP Fiori \\u05D0\\u05D5 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05D4\\u05E7\\u05E6\\u05D0\\u05EA \\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05D7\\u05E1\\u05E8\\u05D4.\\n\\n\\u05D4\\u05EA\\u05D5\\u05DB\\u05DF \\u05D9\\u05D4\\u05D9\\u05D4 \\u05DE\\u05D5\\u05E1\\u05EA\\u05E8 \\u05DE\\u05D4\\u05DE\\u05E9\\u05EA\\u05DE\\u05E9.\\n\\n\\u05DB\\u05D3\\u05D9 \\u05DC\\u05E4\\u05EA\\u05D5\\u05E8 \\u05D1\\u05E2\\u05D9\\u05D4 \\u05D6\\u05D5, \\u05D1\\u05D3\\u05D5\\u05E7 \\u05D0\\u05EA \\u05D4\\u05E7\\u05D8\\u05DC\\u05D5\\u05D2\\u05D9\\u05DD \\u05D5\\u05DE\\u05D9\\u05E4\\u05D5\\u05D9\\u05D9 \\u05D4\\u05D9\\u05E2\\u05D3 \\u05E9\\u05DE\\u05D5\\u05E7\\u05E6\\u05D9\\u05DD \\u05DC\\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05D6\\u05D4.\n#XMSG\nMessage.NavigationTargetError=\\u05DC\\u05D0 \\u05E0\\u05D9\\u05EA\\u05DF \\u05D4\\u05D9\\u05D4 \\u05DC\\u05E7\\u05D1\\u05D5\\u05E2 \\u05D9\\u05E2\\u05D3 \\u05E0\\u05D9\\u05D5\\u05D5\\u05D8.\n#XMSG\nMessage.TilesHaveErrors=\\u05D7\\u05DC\\u05E7 \\u05DE\\u05D4\\u05D0\\u05E8\\u05D9\\u05D7\\u05D9\\u05DD \\u05D0\\u05D5 \\u05DE\\u05D4\\u05E7\\u05D1\\u05D5\\u05E6\\u05D5\\u05EA \\u05DE\\u05DB\\u05D9\\u05DC\\u05D9\\u05DD \\u05E9\\u05D2\\u05D9\\u05D0\\u05D5\\u05EA \\u05D0\\u05D5 \\u05D0\\u05D6\\u05D4\\u05E8\\u05D5\\u05EA. \\u05D4\\u05D0\\u05DD \\u05D0\\u05EA\\u05D4 \\u05D1\\u05D8\\u05D5\\u05D7 \\u05E9\\u05D1\\u05E8\\u05E6\\u05D5\\u05E0\\u05DA \\u05DC\\u05D4\\u05DE\\u05E9\\u05D9\\u05DA \\u05D1\\u05EA\\u05D4\\u05DC\\u05D9\\u05DA \\u05D4\\u05E9\\u05DE\\u05D9\\u05E8\\u05D4?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u05E7\\u05D1\\u05D9\\u05E2\\u05EA \\u05D9\\u05E2\\u05D3 \\u05D4\\u05E0\\u05D9\\u05D5\\u05D5\\u05D8 \\u05E9\\u05DC \\u05D4\\u05D0\\u05E8\\u05D9\\u05D7 \\u05E0\\u05DB\\u05E9\\u05DC\\u05D4\\: "{0}".\\n\\n\\u05E1\\u05D1\\u05D9\\u05E8 \\u05DC\\u05D4\\u05E0\\u05D9\\u05D7 \\u05E9\\u05D4\\u05DB\\u05D9\\u05E9\\u05DC\\u05D5\\u05DF \\u05E0\\u05D2\\u05E8\\u05DD \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05EA\\u05E6\\u05D5\\u05E8\\u05D4 \\u05E9\\u05D2\\u05D5\\u05D9\\u05D4 \\u05E9\\u05DC \\u05EA\\u05D5\\u05DB\\u05DF \\u05DC\\u05D5\\u05D7 \\u05D4\\u05E4\\u05E2\\u05DC\\u05D4 \\u05E9\\u05DC SAP Fiori \\u05D0\\u05D5 \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05D4\\u05E7\\u05E6\\u05D0\\u05EA \\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05D7\\u05E1\\u05E8\\u05D4.\\n\\n\\u05D4\\u05D0\\u05E8\\u05D9\\u05D7 "{0}" \\u05D9\\u05D5\\u05E6\\u05D2 \\u05DC\\u05DE\\u05E9\\u05EA\\u05DE\\u05E9, \\u05D0\\u05D1\\u05DC \\u05D4\\u05DE\\u05E9\\u05EA\\u05DE\\u05E9 \\u05DC\\u05D0 \\u05D9\\u05D5\\u05DB\\u05DC \\u05DC\\u05E0\\u05D5\\u05D5\\u05D8 \\u05D1\\u05D0\\u05DE\\u05E6\\u05E2\\u05D5\\u05EA \\u05D0\\u05E8\\u05D9\\u05D7 \\u05D6\\u05D4.\n#XMSG\nMessage.DeleteGroup=\\u05D4\\u05D0\\u05DD \\u05D0\\u05EA\\u05D4 \\u05D1\\u05D8\\u05D5\\u05D7 \\u05E9\\u05D1\\u05E8\\u05E6\\u05D5\\u05E0\\u05DA \\u05DC\\u05DE\\u05D7\\u05D5\\u05E7 \\u05D0\\u05EA \\u05D4\\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 "{0}"?\n#XMSG\nMessage.PageIsOutdated=\\u05D2\\u05E8\\u05E1\\u05D4 \\u05D7\\u05D3\\u05E9\\u05D4 \\u05D9\\u05D5\\u05EA\\u05E8 \\u05E9\\u05DC \\u05D3\\u05E3 \\u05D6\\u05D4 \\u05DB\\u05D1\\u05E8 \\u05E0\\u05E9\\u05DE\\u05E8\\u05D4.\n#XMSG\nMessage.SaveChanges=\\u05E9\\u05DE\\u05D5\\u05E8 \\u05D0\\u05EA \\u05D4\\u05E9\\u05D9\\u05E0\\u05D5\\u05D9\\u05D9\\u05DD.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u05D3\\u05E3 \\u05D7\\u05D3\\u05E9\n#XTIT\nTitle.TilesHaveErrors=\\u05D9\\u05E9 \\u05D1\\u05D0\\u05E8\\u05D9\\u05D7\\u05D9\\u05DD \\u05E9\\u05D2\\u05D9\\u05D0\\u05D5\\u05EA\n#XTIT\nDeleteDialog.Title=\\u05DE\\u05D7\\u05E7\n#XMSG\nDeleteDialog.Text=\\u05D4\\u05D0\\u05DD \\u05D0\\u05EA\\u05D4 \\u05D1\\u05D8\\u05D5\\u05D7 \\u05E9\\u05D1\\u05E8\\u05E6\\u05D5\\u05E0\\u05DA \\u05DC\\u05DE\\u05D7\\u05D5\\u05E7 \\u05D0\\u05EA \\u05D4\\u05D3\\u05E3 \\u05E9\\u05E0\\u05D1\\u05D7\\u05E8?\n#XBUT\nDeleteDialog.ConfirmButton=\\u05DE\\u05D7\\u05E7\n#XTIT\nDeleteDialog.LockedTitle=\\u05D4\\u05D3\\u05E3 \\u05E0\\u05E2\\u05D5\\u05DC\n#XMSG\nDeleteDialog.LockedText=\\u05D4\\u05D3\\u05E3 \\u05E9\\u05E0\\u05D1\\u05D7\\u05E8 \\u05E0\\u05E0\\u05E2\\u05DC \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05DE\\u05E9\\u05EA\\u05DE\\u05E9 {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u05D1\\u05D7\\u05E8 \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8 \\u05DC\\u05DE\\u05D7\\u05D9\\u05E7\\u05EA \\u05D4\\u05D3\\u05E3 \\u05D4\\u05E0\\u05D1\\u05D7\\u05E8.\n\n#XMSG\nEditDialog.LockedText=\\u05D4\\u05D3\\u05E3 \\u05E9\\u05E0\\u05D1\\u05D7\\u05E8 \\u05E0\\u05E0\\u05E2\\u05DC \\u05E2\\u05DC-\\u05D9\\u05D3\\u05D9 \\u05DE\\u05E9\\u05EA\\u05DE\\u05E9 {0}.\n#XMSG\nEditDialog.TransportRequired=\\u05D1\\u05D7\\u05E8 \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8 \\u05DC\\u05E2\\u05E8\\u05D9\\u05DB\\u05EA \\u05D4\\u05D3\\u05E3 \\u05D4\\u05E0\\u05D1\\u05D7\\u05E8.\n#XTIT\nEditDialog.Title=\\u05E2\\u05E8\\u05D5\\u05DA \\u05D3\\u05E3\n\n#XTIT\nErrorDialog.Title=\\u05E9\\u05D2\\u05D9\\u05D0\\u05D4\n\n#XTIT\nPageOverview.Title=\\u05EA\\u05D7\\u05D6\\u05E7 \\u05D3\\u05E4\\u05D9\\u05DD\n\n\n#XTIT\nCopyDialog.Title=\\u05D4\\u05E2\\u05EA\\u05E7\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u05D4\\u05D0\\u05DD \\u05D1\\u05E8\\u05E6\\u05D5\\u05E0\\u05DA \\u05DC\\u05D4\\u05E2\\u05EA\\u05D9\\u05E7 {0}?\n#XFLD\nCopyDialog.NewID=\\u05E2\\u05D5\\u05EA\\u05E7 \\u05E9\\u05DC {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u05DB\\u05D5\\u05EA\\u05E8\\u05EA \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 \\u05E9\\u05DC \\u05E7\\u05D1\\u05D5\\u05E6\\u05D4 {0} \\u05E8\\u05D9\\u05E7\\u05D4.\n#XMSG\nTitle.UnsufficientRoles=\\u05D4\\u05E7\\u05E6\\u05D0\\u05EA \\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05DC\\u05D0 \\u05DE\\u05E1\\u05E4\\u05D9\\u05E7\\u05D4 \\u05DC\\u05D4\\u05E6\\u05D2\\u05EA \\u05EA\\u05D5\\u05DB\\u05DF\n#XMSG\nTitle.ContentIsNotVisible=\\u05D4\\u05EA\\u05D5\\u05DB\\u05DF \\u05D9\\u05D5\\u05E1\\u05EA\\u05E8 \\u05DE\\u05D4\\u05DE\\u05E9\\u05EA\\u05DE\\u05E9.\n#XMSG\nTitle.ContentNotNavigateable=\\u05DC\\u05D0 \\u05E0\\u05D9\\u05EA\\u05DF \\u05D9\\u05D4\\u05D9\\u05D4 \\u05DC\\u05E0\\u05D5\\u05D5\\u05D8 \\u05D1\\u05EA\\u05D5\\u05DB\\u05DF.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ja.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u30DA\\u30FC\\u30B8\\u66F4\\u65B0\n\n\n#XBUT\nButton.Add=\\u8FFD\\u52A0\n#XBUT\nButton.Cancel=\\u4E2D\\u6B62\n#XBUT\nButton.Copy=\\u30B3\\u30D4\\u30FC\n#XBUT\nButton.Create=\\u4F5C\\u6210\n#XBUT\nButton.Delete=\\u524A\\u9664\n#XBUT\nButton.Edit=\\u7DE8\\u96C6\n#XBUT\nButton.Save=\\u4FDD\\u5B58\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u30AB\\u30BF\\u30ED\\u30B0\\u5207\\u66FF\n#XBUT\nButton.SortCatalogs=\\u30AB\\u30BF\\u30ED\\u30B0\\u30BD\\u30FC\\u30C8\\u9806\\u5E8F\\u306E\\u5207\\u66FF\n#XBUT\nButton.CollapseCatalogs=\\u3059\\u3079\\u3066\\u306E\\u30AB\\u30BF\\u30ED\\u30B0\\u3092\\u6298\\u308A\\u305F\\u305F\\u307F\n#XBUT\nButton.ExpandCatalogs=\\u3059\\u3079\\u3066\\u306E\\u30AB\\u30BF\\u30ED\\u30B0\\u3092\\u5C55\\u958B\n#XBUT\nButton.ShowDetails=\\u8A73\\u7D30\\u8868\\u793A\n#XBUT\nButton.PagePreview=\\u30DA\\u30FC\\u30B8\\u30D7\\u30EC\\u30D3\\u30E5\\u30FC\n\n\n#XTOL\nTooltip.AddToGroups=\\u30B0\\u30EB\\u30FC\\u30D7\\u306B\\u8FFD\\u52A0\n#XTOL Tooltip for the search button\nTooltip.Search=\\u691C\\u7D22\n#XTOL\nTooltip.SearchForTiles=\\u30BF\\u30A4\\u30EB\\u691C\\u7D22\n\n\n#XFLD\nLabel.PageID=\\u30DA\\u30FC\\u30B8 ID\n#XFLD\nLabel.WorkbenchRequest=\\u30EF\\u30FC\\u30AF\\u30D9\\u30F3\\u30C1\\u4F9D\\u983C\n#XFLD\nLabel.Package=\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\n#XFLD\nLabel.TransportInformation=\\u79FB\\u9001\\u60C5\\u5831\n#XFLD\nLabel.Details=\\u8A73\\u7D30\\:\n#XFLD\nLabel.ResponseCode=\\u5FDC\\u7B54\\u30B3\\u30FC\\u30C9\\:\n#XFLD\nLabel.Description=\\u8AAC\\u660E\n#XFLD\nLabel.CreatedBy=\\u4F5C\\u6210\\u8005\n#XFLD\nLabel.CreatedOn=\\u4F5C\\u6210\\u6642\\u9593\n#XFLD\nLabel.ChangedBy=\\u5909\\u66F4\\u8005\n#XFLD\nLabel.ChangedOn=\\u5909\\u66F4\\u65E5\\u4ED8\n#XFLD\nLabel.PageTitle=\\u30DA\\u30FC\\u30B8\\u30BF\\u30A4\\u30C8\\u30EB\n#XFLD\nLabel.AssignedRole=\\u5272\\u308A\\u5F53\\u3066\\u3089\\u308C\\u305F\\u30ED\\u30FC\\u30EB\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u30BF\\u30A4\\u30C8\\u30EB\n#XCOL\nColumn.PageDescription=\\u8AAC\\u660E\n#XCOL\nColumn.PageCreatedBy=\\u4F5C\\u6210\\u8005\n#XCOL\nColumn.PageCreatedOn=\\u4F5C\\u6210\\u6642\\u9593\n#XCOL\nColumn.PageChangedBy=\\u5909\\u66F4\\u8005\n#XCOL\nColumn.PageChangedOn=\\u5909\\u66F4\\u65E5\\u4ED8\n\n\n#XTOL\nPlaceholder.GroupName=\\u30B0\\u30EB\\u30FC\\u30D7\\u540D\\u5165\\u529B\n#XTOL\nPlaceholder.SearchForTiles=\\u30BF\\u30A4\\u30EB\\u691C\\u7D22\n\n#MSG\nMessage.NoGroupTitle=\\u30B0\\u30EB\\u30FC\\u30D7 {0} \\u306B\\u306F\\u30BF\\u30A4\\u30C8\\u30EB\\u304C\\u3042\\u308A\\u307E\\u305B\\u3093\\u3002\\u30E6\\u30FC\\u30B6\\u30A8\\u30AF\\u30B9\\u30DA\\u30EA\\u30A8\\u30F3\\u30B9\\u306E\\u4E00\\u8CAB\\u6027\\u3092\\u4FDD\\u3064\\u305F\\u3081\\u306B\\u3001\\u5404\\u30B0\\u30EB\\u30FC\\u30D7\\u306E\\u30B0\\u30EB\\u30FC\\u30D7\\u540D\\u3092\\u5165\\u529B\\u3059\\u308B\\u3053\\u3068\\u3092\\u304A\\u5968\\u3081\\u3057\\u307E\\u3059\\u3002\n#XMSG\nMessage.InvalidGroupTitle=\\u53EF\\u80FD\\u3067\\u3042\\u308C\\u3070\\u3001\\u30B0\\u30EB\\u30FC\\u30D7\\u540D\\u3092\\u5165\\u529B\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.NoInternetConnection=\\u30A4\\u30F3\\u30BF\\u30FC\\u30CD\\u30C3\\u30C8\\u63A5\\u7D9A\\u3092\\u30C1\\u30A7\\u30C3\\u30AF\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.SavedChanges=\\u5909\\u66F4\\u304C\\u4FDD\\u5B58\\u3055\\u308C\\u307E\\u3057\\u305F\\u3002\n#XMSG\nMessage.InvalidPageID=A-Z a-z 0-9 _ / \\u306E\\u6587\\u5B57\\u306E\\u307F\\u3092\\u4F7F\\u7528\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.EmptyPageID=\\u30DA\\u30FC\\u30B8 ID \\u3092\\u5165\\u529B\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.EmptyTitle=\\u30BF\\u30A4\\u30C8\\u30EB\\u3092\\u5165\\u529B\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.SuccessDeletePage=\\u9078\\u629E\\u3057\\u305F\\u30AA\\u30D6\\u30B8\\u30A7\\u30AF\\u30C8\\u304C\\u524A\\u9664\\u3055\\u308C\\u307E\\u3057\\u305F\n#XMSG\nMessage.ClipboardCopySuccess=\\u8A73\\u7D30\\u304C\\u6B63\\u5E38\\u306B\\u30B3\\u30D4\\u30FC\\u3055\\u308C\\u307E\\u3057\\u305F\\u3002\n#YMSE\nMessage.ClipboardCopyFail=\\u8A73\\u7D30\\u306E\\u30B3\\u30D4\\u30FC\\u4E2D\\u306B\\u30A8\\u30E9\\u30FC\\u304C\\u767A\\u751F\\u3057\\u307E\\u3057\\u305F\\u3002\n#XMSG\nMessage.DeletePageConfirmation={0} {1} \\u3092\\u524A\\u9664\\u3057\\u307E\\u3059\\u304B?\n#XMSG\nMessage.PageCreated=\\u30DA\\u30FC\\u30B8\\u304C\\u4F5C\\u6210\\u3055\\u308C\\u307E\\u3057\\u305F\\u3002\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u30BF\\u30A4\\u30EB\\u304C\\u3042\\u308A\\u307E\\u305B\\u3093\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u30B0\\u30EB\\u30FC\\u30D7\\u306A\\u3057\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError={0} \\u30BF\\u30A4\\u30EB\\u3092\\u30B0\\u30EB\\u30FC\\u30D7 "{1}" \\u306B\\u30ED\\u30FC\\u30C9\\u3067\\u304D\\u307E\\u305B\\u3093\\u3067\\u3057\\u305F\\u3002\\n\\n\\u3053\\u308C\\u306F\\u3001SAP Fiori \\u30E9\\u30A6\\u30F3\\u30C1\\u30D1\\u30C3\\u30C9\\u306E\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u8A2D\\u5B9A\\u304C\\u4E0D\\u9069\\u5207\\u304B\\u3001\\u307E\\u305F\\u306F\\u30ED\\u30FC\\u30EB\\u5272\\u5F53\\u304C\\u5B58\\u5728\\u3057\\u306A\\u3044\\u5834\\u5408\\u306B\\u6700\\u3082\\u591A\\u304F\\u767A\\u751F\\u3057\\u307E\\u3059\\u3002\\n\\n\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u306F\\u30E6\\u30FC\\u30B6\\u306B\\u8868\\u793A\\u3055\\u308C\\u307E\\u305B\\u3093\\u3002\\n\\n\\u3053\\u306E\\u554F\\u984C\\u3092\\u89E3\\u6C7A\\u3059\\u308B\\u305F\\u3081\\u306B\\u3001\\u3053\\u306E\\u30ED\\u30FC\\u30EB\\u306B\\u5272\\u308A\\u5F53\\u3066\\u3089\\u308C\\u305F\\u30AB\\u30BF\\u30ED\\u30B0\\u304A\\u3088\\u3073\\u30BF\\u30FC\\u30B2\\u30C3\\u30C8\\u30DE\\u30C3\\u30D4\\u30F3\\u30B0\\u3092\\u30C1\\u30A7\\u30C3\\u30AF\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XMSG\nMessage.NavigationTargetError=\\u30CA\\u30D3\\u30B2\\u30FC\\u30B7\\u30E7\\u30F3\\u30BF\\u30FC\\u30B2\\u30C3\\u30C8\\u3092\\u89E3\\u6790\\u3067\\u304D\\u307E\\u305B\\u3093\\u3067\\u3057\\u305F\\u3002\n#XMSG\nMessage.TilesHaveErrors=\\u4E00\\u90E8\\u306E\\u30BF\\u30A4\\u30EB\\u307E\\u305F\\u306F\\u30B0\\u30EB\\u30FC\\u30D7\\u306B\\u30A8\\u30E9\\u30FC\\u307E\\u305F\\u306F\\u8B66\\u544A\\u304C\\u3042\\u308A\\u307E\\u3059\\u3002\\u4FDD\\u5B58\\u3092\\u7D9A\\u884C\\u3057\\u307E\\u3059\\u304B\\u3002\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u30BF\\u30A4\\u30EB "{0}" \\u306E\\u30CA\\u30D3\\u30B2\\u30FC\\u30B7\\u30E7\\u30F3\\u30BF\\u30FC\\u30B2\\u30C3\\u30C8\\u3092\\u89E3\\u6790\\u3067\\u304D\\u307E\\u305B\\u3093\\u3067\\u3057\\u305F\\u3002\\n\\n\\u3053\\u308C\\u306F\\u3001SAP Fiori \\u30E9\\u30A6\\u30F3\\u30C1\\u30D1\\u30C3\\u30C9\\u306E\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u8A2D\\u5B9A\\u304C\\u4E0D\\u9069\\u5207\\u304B\\u3001\\u307E\\u305F\\u306F\\u30ED\\u30FC\\u30EB\\u5272\\u5F53\\u304C\\u5B58\\u5728\\u3057\\u306A\\u3044\\u5834\\u5408\\u306B\\u6700\\u3082\\u591A\\u304F\\u767A\\u751F\\u3057\\u307E\\u3059\\u3002\\n\\n\\u30BF\\u30A4\\u30EB "{0}" \\u306F\\u30E6\\u30FC\\u30B6\\u306B\\u8868\\u793A\\u3055\\u308C\\u307E\\u3059\\u304C\\u3001\\u3053\\u306E\\u30BF\\u30A4\\u30EB\\u3092\\u4F7F\\u7528\\u3057\\u3066\\u30E6\\u30FC\\u30B6\\u304C\\u30CA\\u30D3\\u30B2\\u30FC\\u30B7\\u30E7\\u30F3\\u3092\\u884C\\u3046\\u3053\\u3068\\u306F\\u3067\\u304D\\u307E\\u305B\\u3093\\u3002\n#XMSG\nMessage.DeleteGroup=\\u30B0\\u30EB\\u30FC\\u30D7 "{0}" \\u3092\\u524A\\u9664\\u3057\\u3066\\u3082\\u3088\\u308D\\u3057\\u3044\\u3067\\u3059\\u304B\\u3002\n#XMSG\nMessage.PageIsOutdated=\\u3053\\u306E\\u30DA\\u30FC\\u30B8\\u306E\\u65B0\\u3057\\u3044\\u30D0\\u30FC\\u30B8\\u30E7\\u30F3\\u304C\\u3059\\u3067\\u306B\\u4FDD\\u5B58\\u3055\\u308C\\u3066\\u3044\\u307E\\u3059\\u3002\n#XMSG\nMessage.SaveChanges=\\u5909\\u66F4\\u3092\\u4FDD\\u5B58\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u65B0\\u898F\\u30DA\\u30FC\\u30B8\n#XTIT\nTitle.TilesHaveErrors=\\u30BF\\u30A4\\u30EB\\u306B\\u30A8\\u30E9\\u30FC\\u304C\\u3042\\u308A\\u307E\\u3059\n#XTIT\nDeleteDialog.Title=\\u524A\\u9664\n#XMSG\nDeleteDialog.Text=\\u9078\\u629E\\u3057\\u305F\\u30DA\\u30FC\\u30B8\\u3092\\u524A\\u9664\\u3057\\u307E\\u3059\\u304B?\n#XBUT\nDeleteDialog.ConfirmButton=\\u524A\\u9664\n#XTIT\nDeleteDialog.LockedTitle=\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\\u304C\\u30ED\\u30C3\\u30AF\\u3055\\u308C\\u3066\\u3044\\u307E\\u3059\n#XMSG\nDeleteDialog.LockedText=\\u9078\\u629E\\u3057\\u305F\\u30DA\\u30FC\\u30B8\\u306F\\u3001\\u30E6\\u30FC\\u30B6 {0} \\u306B\\u3088\\u3063\\u3066\\u30ED\\u30C3\\u30AF\\u3055\\u308C\\u3066\\u3044\\u307E\\u3059\\u3002\n#XMSG\nDeleteDialog.TransportRequired=\\u9078\\u629E\\u3057\\u305F\\u30DA\\u30FC\\u30B8\\u3092\\u524A\\u9664\\u3059\\u308B\\u306B\\u306F\\u3001\\u79FB\\u9001\\u3092\\u9078\\u629E\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n\n#XMSG\nEditDialog.LockedText=\\u9078\\u629E\\u3057\\u305F\\u30DA\\u30FC\\u30B8\\u306F\\u3001\\u30E6\\u30FC\\u30B6 {0} \\u306B\\u3088\\u3063\\u3066\\u30ED\\u30C3\\u30AF\\u3055\\u308C\\u3066\\u3044\\u307E\\u3059\\u3002\n#XMSG\nEditDialog.TransportRequired=\\u9078\\u629E\\u3057\\u305F\\u30DA\\u30FC\\u30B8\\u3092\\u7DE8\\u96C6\\u3059\\u308B\\u306B\\u306F\\u3001\\u79FB\\u9001\\u3092\\u9078\\u629E\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n#XTIT\nEditDialog.Title=\\u30DA\\u30FC\\u30B8\\u7DE8\\u96C6\n\n#XTIT\nErrorDialog.Title=\\u30A8\\u30E9\\u30FC\n\n#XTIT\nPageOverview.Title=\\u30DA\\u30FC\\u30B8\\u66F4\\u65B0\n\n\n#XTIT\nCopyDialog.Title=\\u30B3\\u30D4\\u30FC\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message={0} \\u3092\\u30B3\\u30D4\\u30FC\\u3057\\u307E\\u3059\\u304B\\u3002\n#XFLD\nCopyDialog.NewID={0} \\u306E\\u30B3\\u30D4\\u30FC\n\n\n#XMSG\nTitle.NoGroupTitle={0} \\u306E\\u30BB\\u30AF\\u30B7\\u30E7\\u30F3\\u30BF\\u30A4\\u30C8\\u30EB\\u304C\\u7A7A\\u3067\\u3059\\u3002\n#XMSG\nTitle.UnsufficientRoles=\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u3092\\u8868\\u793A\\u3059\\u308B\\u306B\\u306F\\u3001\\u30ED\\u30FC\\u30EB\\u5272\\u5F53\\u304C\\u4E0D\\u5341\\u5206\\u3067\\u3059\n#XMSG\nTitle.ContentIsNotVisible=\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u306F\\u30E6\\u30FC\\u30B6\\u306B\\u8868\\u793A\\u3055\\u308C\\u307E\\u305B\\u3093\\u3002\n#XMSG\nTitle.ContentNotNavigateable=\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u306F\\u30CA\\u30D3\\u30B2\\u30FC\\u30C8\\u53EF\\u80FD\\u306B\\u306A\\u308A\\u307E\\u305B\\u3093\\u3002\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_kk.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u0411\\u0435\\u0442\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0436\\u04AF\\u0440\\u0433\\u0456\\u0437\\u0443\n\n\n#XBUT\nButton.Add=\\u049A\\u043E\\u0441\\u0443\n#XBUT\nButton.Cancel=\\u0411\\u043E\\u043B\\u0434\\u044B\\u0440\\u043C\\u0430\\u0443\n#XBUT\nButton.Copy=\\u041A\\u04E9\\u0448\\u0456\\u0440\\u0443\n#XBUT\nButton.Create=\\u0416\\u0430\\u0441\\u0430\\u0443\n#XBUT\nButton.Delete=\\u0416\\u043E\\u044E\n#XBUT\nButton.Edit=\\u04E8\\u04A3\\u0434\\u0435\\u0443\n#XBUT\nButton.Save=\\u0421\\u0430\\u049B\\u0442\\u0430\\u0443\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u041A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0430\\u0443\\u044B\\u0441\\u0442\\u044B\\u0440\\u0443\n#XBUT\nButton.SortCatalogs=\\u041A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0442\\u0456 \\u0441\\u04B1\\u0440\\u044B\\u043F\\u0442\\u0430\\u0443 \\u0440\\u0435\\u0442\\u0456\\u043D \\u0430\\u0443\\u044B\\u0441\\u0442\\u044B\\u0440\\u0443\n#XBUT\nButton.CollapseCatalogs=\\u0411\\u0430\\u0440\\u043B\\u044B\\u049B \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0436\\u0438\\u044E\n#XBUT\nButton.ExpandCatalogs=\\u0411\\u0430\\u0440\\u043B\\u044B\\u049B \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0436\\u0430\\u044E\n#XBUT\nButton.ShowDetails=\\u0422\\u043E\\u043B\\u044B\\u049B \\u043C\\u04D9\\u043B\\u0456\\u043C\\u0435\\u0442\\u0442\\u0456 \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0443\n#XBUT\nButton.PagePreview=\\u0411\\u0435\\u0442\\u0442\\u0456 \\u0430\\u043B\\u0434\\u044B\\u043D \\u0430\\u043B\\u0430 \\u043A\\u04E9\\u0440\\u0443\n\n\n#XTOL\nTooltip.AddToGroups=\\u0422\\u043E\\u043F\\u0442\\u0430\\u0440\\u0493\\u0430 \\u049B\\u043E\\u0441\\u0443\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0406\\u0437\\u0434\\u0435\\u0443\n#XTOL\nTooltip.SearchForTiles=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043B\\u0430\\u0440\\u0434\\u044B \\u0456\\u0437\\u0434\\u0435\\u0443\n\n\n#XFLD\nLabel.PageID=\\u0411\\u0435\\u0442 \\u0438\\u0434.\n#XFLD\nLabel.WorkbenchRequest=\\u0410\\u0441\\u043F\\u0430\\u043F\\u0442\\u044B\\u049B \\u049B\\u04B1\\u0440\\u0430\\u043B\\u0434\\u0430\\u0440 \\u0441\\u04B1\\u0440\\u0430\\u0443\\u044B\n#XFLD\nLabel.Package=\\u0411\\u0443\\u043C\\u0430\n#XFLD\nLabel.TransportInformation=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B\\u0434\\u0430\\u0443 \\u0442\\u0443\\u0440\\u0430\\u043B\\u044B \\u0430\\u049B\\u043F\\u0430\\u0440\\u0430\\u0442\n#XFLD\nLabel.Details=\\u0422\\u043E\\u043B\\u044B\\u049B \\u043C\\u04D9\\u043B\\u0456\\u043C\\u0435\\u0442\\:\n#XFLD\nLabel.ResponseCode=\\u0416\\u0430\\u0443\\u0430\\u043F \\u043A\\u043E\\u0434\\u044B\\:\n#XFLD\nLabel.Description=\\u0421\\u0438\\u043F\\u0430\\u0442\\u0442\\u0430\\u043C\\u0430\n#XFLD\nLabel.CreatedBy=\\u0416\\u0430\\u0441\\u0430\\u0493\\u0430\\u043D\n#XFLD\nLabel.CreatedOn=\\u0416\\u0430\\u0441\\u0430\\u043B\\u0493\\u0430\\u043D \\u043A\\u04AF\\u043D\\u0456\n#XFLD\nLabel.ChangedBy=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0442\\u043A\\u0435\\u043D\n#XFLD\nLabel.ChangedOn=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0442\\u0456\\u043B\\u0433\\u0435\\u043D \\u043A\\u04AF\\u043D\\u0456\n#XFLD\nLabel.PageTitle=\\u0411\\u0435\\u0442 \\u0442\\u0430\\u049B\\u044B\\u0440\\u044B\\u0431\\u044B\n#XFLD\nLabel.AssignedRole=\\u0422\\u0430\\u0493\\u0430\\u0439\\u044B\\u043D\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0440\\u04E9\\u043B\n\n\n#XCOL\nColumn.PageID=\\u0418\\u0434.\n#XCOL\nColumn.PageTitle=\\u0410\\u0442\\u0430\\u0443\n#XCOL\nColumn.PageDescription=\\u0421\\u0438\\u043F\\u0430\\u0442\\u0442\\u0430\\u043C\\u0430\n#XCOL\nColumn.PageCreatedBy=\\u0416\\u0430\\u0441\\u0430\\u0493\\u0430\\u043D\n#XCOL\nColumn.PageCreatedOn=\\u0416\\u0430\\u0441\\u0430\\u043B\\u0493\\u0430\\u043D \\u043A\\u04AF\\u043D\\u0456\n#XCOL\nColumn.PageChangedBy=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0442\\u043A\\u0435\\u043D\n#XCOL\nColumn.PageChangedOn=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0442\\u0456\\u043B\\u0433\\u0435\\u043D \\u043A\\u04AF\\u043D\\u0456\n\n\n#XTOL\nPlaceholder.GroupName=\\u0422\\u043E\\u043F \\u0430\\u0442\\u044B\\u043D \\u0435\\u043D\\u0433\\u0456\\u0437\\u0443\n#XTOL\nPlaceholder.SearchForTiles=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043B\\u0430\\u0440\\u0434\\u044B \\u0456\\u0437\\u0434\\u0435\\u0443\n\n#MSG\nMessage.NoGroupTitle={0} \\u0442\\u043E\\u0431\\u044B\\u043D\\u044B\\u04A3 \\u0442\\u0430\\u049B\\u044B\\u0440\\u044B\\u0431\\u044B \\u0436\\u043E\\u049B. \\u04AE\\u0439\\u043B\\u0435\\u0441\\u0456\\u043C\\u0434\\u0456 \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B \\u0442\\u04D9\\u0436\\u0456\\u0440\\u0438\\u0431\\u0435\\u0441\\u0456\\u043D \\u049B\\u0430\\u043C\\u0442\\u0430\\u043C\\u0430\\u0441\\u044B\\u0437 \\u0435\\u0442\\u0443 \\u04AF\\u0448\\u0456\\u043D \\u04D9\\u0440 \\u0442\\u043E\\u043F \\u04AF\\u0448\\u0456\\u043D \\u0442\\u043E\\u043F \\u0430\\u0442\\u044B\\u043D \\u0435\\u043D\\u0433\\u0456\\u0437\\u0443\\u0433\\u0435 \\u043A\\u0435\\u04A3\\u0435\\u0441 \\u0431\\u0435\\u0440\\u0435\\u043C\\u0456\\u0437.\n#XMSG\nMessage.InvalidGroupTitle=\\u0422\\u043E\\u043F \\u0430\\u0442\\u044B\\u043D \\u0435\\u043D\\u0433\\u0456\\u0437\\u0433\\u0435\\u043D \\u0436\\u04E9\\u043D.\n#XMSG\nMessage.NoInternetConnection=\\u0418\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442 \\u0431\\u0430\\u0439\\u043B\\u0430\\u043D\\u044B\\u0441\\u044B\\u043D \\u0442\\u0435\\u043A\\u0441\\u0435\\u0440\\u0456\\u04A3\\u0456\\u0437.\n#XMSG\nMessage.SavedChanges=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0456\\u0441\\u0442\\u0435\\u0440 \\u0441\\u0430\\u049B\\u0442\\u0430\\u043B\\u0434\\u044B.\n#XMSG\nMessage.InvalidPageID=\\u0422\\u0435\\u043A \\u043A\\u0435\\u043B\\u0435\\u0441\\u0456 \\u0442\\u0430\\u04A3\\u0431\\u0430\\u043B\\u0430\\u0440\\u0434\\u044B \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u044B\\u04A3\\u044B\\u0437\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0411\\u0435\\u0442 \\u0438\\u0434. \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0456\\u04A3\\u0456\\u0437.\n#XMSG\nMessage.EmptyTitle=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043D\\u044B \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0456\\u04A3\\u0456\\u0437.\n#XMSG\nMessage.SuccessDeletePage=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u043D\\u044B\\u0441\\u0430\\u043D \\u0436\\u043E\\u0439\\u044B\\u043B\\u0434\\u044B.\n#XMSG\nMessage.ClipboardCopySuccess=\\u0422\\u043E\\u043B\\u044B\\u049B \\u043C\\u04D9\\u043B\\u0456\\u043C\\u0435\\u0442 \\u0441\\u04D9\\u0442\\u0442\\u0456 \\u043A\\u04E9\\u0448\\u0456\\u0440\\u0456\\u043B\\u0434\\u0456.\n#YMSE\nMessage.ClipboardCopyFail=\\u041C\\u04D9\\u043B\\u0456\\u043C\\u0435\\u0442\\u0442\\u0435\\u0440\\u0434\\u0456 \\u043A\\u04E9\\u0448\\u0456\\u0440\\u0443 \\u043A\\u0435\\u0437\\u0456\\u043D\\u0434\\u0435 \\u049B\\u0430\\u0442\\u0435 \\u043E\\u0440\\u044B\\u043D \\u0430\\u043B\\u0434\\u044B.\n#XMSG\nMessage.DeletePageConfirmation={0} {1} \\u0436\\u043E\\u044E\\u0493\\u0430 \\u0441\\u0435\\u043D\\u0456\\u043C\\u0434\\u0456\\u0441\\u0456\\u0437 \\u0431\\u0435?\n#XMSG\nMessage.PageCreated=\\u0411\\u0435\\u0442 \\u0436\\u0430\\u0441\\u0430\\u043B\\u0434\\u044B.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043B\\u0430\\u0440 \\u0436\\u043E\\u049B\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u0422\\u043E\\u043F\\u0442\\u0430\\u0440 \\u0436\\u043E\\u049B\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError={0} \\u043F\\u043B\\u0438\\u0442\\u043A\\u0430\\u0441\\u044B\\u043D "{1}" \\u0442\\u043E\\u0431\\u044B\\u043D\\u0430 \\u0436\\u04AF\\u043A\\u0442\\u0435\\u0443 \\u0441\\u04D9\\u0442\\u0441\\u0456\\u0437 \\u0430\\u044F\\u049B\\u0442\\u0430\\u043B\\u0434\\u044B.\\n\\n\\u0411\\u04B1\\u0493\\u0430\\u043D \\u0441\\u0435\\u0431\\u0435\\u043F SAP Fiori \\u0456\\u0441\\u043A\\u0435 \\u049B\\u043E\\u0441\\u0443 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0456 \\u043C\\u0430\\u0437\\u043C\\u04B1\\u043D\\u044B\\u043D\\u044B\\u04A3 \\u0434\\u04B1\\u0440\\u044B\\u0441 \\u0435\\u043C\\u0435\\u0441 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u044F\\u0441\\u044B \\u043D\\u0435\\u043C\\u0435\\u0441\\u0435 \\u049B\\u043E\\u043B\\u0434\\u0430\\u043D\\u044B\\u0441\\u0442\\u0430 \\u0436\\u043E\\u049B \\u0440\\u04E9\\u043B \\u0442\\u0430\\u0493\\u0430\\u0439\\u044B\\u043D\\u0434\\u0430\\u0443\\u044B \\u0431\\u043E\\u043B\\u0443\\u044B \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D.\\n\\n\\u041C\\u0430\\u0437\\u043C\\u04B1\\u043D \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B\\u0493\\u0430 \\u043A\\u04E9\\u0440\\u0456\\u043D\\u0431\\u0435\\u0439\\u0434\\u0456.\\n\\n\\u0411\\u04B1\\u043B \\u043C\\u04D9\\u0441\\u0435\\u043B\\u0435\\u043D\\u0456 \\u0448\\u0435\\u0448\\u0443 \\u04AF\\u0448\\u0456\\u043D \\u043E\\u0441\\u044B \\u0440\\u04E9\\u043B\\u0433\\u0435 \\u0442\\u0430\\u0493\\u0430\\u0439\\u044B\\u043D\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0442\\u0435\\u0440 \\u043C\\u0435\\u043D \\u043C\\u0430\\u049B\\u0441\\u0430\\u0442\\u0442\\u044B \\u043C\\u044D\\u043F\\u043F\\u0438\\u043D\\u0433\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0442\\u0435\\u043A\\u0441\\u0435\\u0440\\u0456\\u04A3\\u0456\\u0437.\n#XMSG\nMessage.NavigationTargetError=\\u041D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u044F \\u043C\\u0430\\u049B\\u0441\\u0430\\u0442\\u044B\\u043D \\u0448\\u0435\\u0448\\u0443 \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D \\u0431\\u043E\\u043B\\u043C\\u0430\\u0434\\u044B.\n#XMSG\nMessage.TilesHaveErrors=\\u041A\\u0435\\u0439\\u0431\\u0456\\u0440 \\u043F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043B\\u0430\\u0440\\u0434\\u0430 \\u043D\\u0435\\u043C\\u0435\\u0441\\u0435 \\u0442\\u043E\\u043F\\u0442\\u0430\\u0440\\u0434\\u0430 \\u049B\\u0430\\u0442\\u0435\\u043B\\u0435\\u0440 \\u043D\\u0435\\u043C\\u0435\\u0441\\u0435 \\u0435\\u0441\\u043A\\u0435\\u0440\\u0442\\u0443\\u043B\\u0435\\u0440 \\u0431\\u0430\\u0440. \\u0421\\u0430\\u049B\\u0442\\u0430\\u0443\\u0434\\u044B \\u0448\\u044B\\u043D\\u044B\\u043C\\u0435\\u043D \\u0436\\u0430\\u043B\\u0493\\u0430\\u0441\\u0442\\u044B\\u0440\\u0443 \\u043A\\u0435\\u0440\\u0435\\u043A \\u043F\\u0435?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043D\\u044B\\u04A3 \\u043D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u044F \\u043C\\u0430\\u049B\\u0441\\u0430\\u0442\\u044B\\u043D \\u0448\\u0435\\u0448\\u0443 \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D \\u0431\\u043E\\u043B\\u043C\\u0430\\u0434\\u044B\\: "{0}".\\n\\n \\u0411\\u04B1\\u0493\\u0430\\u043D \\u0441\\u0435\\u0431\\u0435\\u043F SAP Fiori \\u0456\\u0441\\u043A\\u0435 \\u049B\\u043E\\u0441\\u0443 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0456 \\u043C\\u0430\\u0437\\u043C\\u04B1\\u043D\\u044B\\u043D\\u044B\\u04A3 \\u0434\\u04B1\\u0440\\u044B\\u0441 \\u0435\\u043C\\u0435\\u0441 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u044F\\u0441\\u044B \\u043D\\u0435\\u043C\\u0435\\u0441\\u0435 \\u049B\\u043E\\u043B\\u0434\\u0430\\u043D\\u044B\\u0441\\u0442\\u0430 \\u0436\\u043E\\u049B \\u0440\\u04E9\\u043B \\u0442\\u0430\\u0493\\u0430\\u0439\\u044B\\u043D\\u0434\\u0430\\u0443\\u044B \\u0431\\u043E\\u043B\\u0443\\u044B \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D.\\n\\n "{0}" \\u043F\\u043B\\u0438\\u0442\\u043A\\u0430\\u0441\\u044B \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B\\u0493\\u0430 \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0456\\u043B\\u0435\\u0434\\u0456, \\u0431\\u0456\\u0440\\u0430\\u049B \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B \\u0431\\u04B1\\u043B \\u043F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043C\\u0435\\u043D \\u0448\\u0430\\u0440\\u043B\\u0430\\u0439 \\u0430\\u043B\\u043C\\u0430\\u0439\\u0434\\u044B.\n#XMSG\nMessage.DeleteGroup="{0}" \\u0442\\u043E\\u0431\\u044B\\u043D \\u0436\\u043E\\u044E\\u0493\\u0430 \\u0441\\u0435\\u043D\\u0456\\u043C\\u0434\\u0456\\u0441\\u0456\\u0437 \\u0431\\u0435?\n#XMSG\nMessage.PageIsOutdated=\\u0411\\u04B1\\u043B \\u0431\\u0435\\u0442\\u0442\\u0456\\u04A3 \\u0436\\u0430\\u04A3\\u0430 \\u043D\\u04B1\\u0441\\u049B\\u0430\\u0441\\u044B \\u04D9\\u043B\\u0434\\u0435\\u049B\\u0430\\u0448\\u0430\\u043D \\u0441\\u0430\\u049B\\u0442\\u0430\\u043B\\u0434\\u044B.\n#XMSG\nMessage.SaveChanges=\\u04E8\\u0437\\u0433\\u0435\\u0440\\u0456\\u0441\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0441\\u0430\\u049B\\u0442\\u0430\\u04A3\\u044B\\u0437.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u0416\\u0430\\u04A3\\u0430 \\u0431\\u0435\\u0442\n#XTIT\nTitle.TilesHaveErrors=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430\\u043B\\u0430\\u0440\\u0434\\u0430 \\u049B\\u0430\\u0442\\u0435\\u043B\\u0435\\u0440 \\u0431\\u0430\\u0440\n#XTIT\nDeleteDialog.Title=\\u0416\\u043E\\u044E\n#XMSG\nDeleteDialog.Text=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0431\\u0435\\u0442\\u0442\\u0456 \\u0448\\u044B\\u043D\\u044B\\u043C\\u0435\\u043D \\u0436\\u043E\\u044E \\u043A\\u0435\\u0440\\u0435\\u043A \\u043F\\u0435?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0416\\u043E\\u044E\n#XTIT\nDeleteDialog.LockedTitle=\\u0411\\u0435\\u0442 \\u049B\\u04B1\\u043B\\u044B\\u043F\\u0442\\u0430\\u043D\\u0493\\u0430\\u043D\n#XMSG\nDeleteDialog.LockedText=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0431\\u0435\\u0442 {0} \\u0430\\u0442\\u0442\\u044B \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B\\u043D\\u044B\\u04A3 \\u0442\\u0430\\u0440\\u0430\\u043F\\u044B\\u043D\\u0430\\u043D \\u049B\\u04B1\\u043B\\u044B\\u043F\\u0442\\u0430\\u043D\\u0493\\u0430\\u043D.\n#XMSG\nDeleteDialog.TransportRequired=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0431\\u0435\\u0442\\u0442\\u0456 \\u0436\\u043E\\u044E \\u04AF\\u0448\\u0456\\u043D \\u0442\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B\\u0434\\u044B \\u0442\\u0430\\u04A3\\u0434\\u0430\\u04A3\\u044B\\u0437.\n\n#XMSG\nEditDialog.LockedText=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0431\\u0435\\u0442 {0} \\u0430\\u0442\\u0442\\u044B \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B\\u043D\\u044B\\u04A3 \\u0442\\u0430\\u0440\\u0430\\u043F\\u044B\\u043D\\u0430\\u043D \\u049B\\u04B1\\u043B\\u044B\\u043F\\u0442\\u0430\\u043D\\u0493\\u0430\\u043D.\n#XMSG\nEditDialog.TransportRequired=\\u0422\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0431\\u0435\\u0442\\u0442\\u0456 \\u04E9\\u04A3\\u0434\\u0435\\u0443 \\u04AF\\u0448\\u0456\\u043D \\u0442\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B\\u0434\\u044B \\u0442\\u0430\\u04A3\\u0434\\u0430\\u04A3\\u044B\\u0437.\n#XTIT\nEditDialog.Title=\\u0411\\u0435\\u0442\\u0442\\u0456 \\u04E9\\u04A3\\u0434\\u0435\\u0443\n\n#XTIT\nErrorDialog.Title=\\u049A\\u0430\\u0442\\u0435\n\n#XTIT\nPageOverview.Title=\\u0411\\u0435\\u0442\\u0442\\u0435\\u0440\\u0434\\u0456 \\u0436\\u04AF\\u0440\\u0433\\u0456\\u0437\\u0443\n\n\n#XTIT\nCopyDialog.Title=\\u041A\\u04E9\\u0448\\u0456\\u0440\\u0443\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message={0} \\u043A\\u04E9\\u0448\\u0456\\u0440\\u0443 \\u049B\\u0430\\u0436\\u0435\\u0442 \\u043F\\u0435?\n#XFLD\nCopyDialog.NewID={0} \\u043A\\u04E9\\u0448\\u0456\\u0440\\u043C\\u0435\\u0441\\u0456\n\n\n#XMSG\nTitle.NoGroupTitle={0} \\u0442\\u043E\\u0431\\u044B\\u043D\\u044B\\u04A3 \\u0442\\u0430\\u049B\\u044B\\u0440\\u044B\\u0431\\u044B \\u0431\\u043E\\u0441.\n#XMSG\nTitle.UnsufficientRoles=\\u041C\\u0430\\u0437\\u043C\\u04B1\\u043D\\u0434\\u044B \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0443 \\u04AF\\u0448\\u0456\\u043D \\u0440\\u04E9\\u043B \\u0442\\u0430\\u0493\\u0430\\u0439\\u044B\\u043D\\u0434\\u0430\\u0443\\u044B \\u0436\\u0435\\u0442\\u043A\\u0456\\u043B\\u0456\\u043A\\u0441\\u0456\\u0437\n#XMSG\nTitle.ContentIsNotVisible=\\u041C\\u0430\\u0437\\u043C\\u04B1\\u043D \\u043F\\u0430\\u0439\\u0434\\u0430\\u043B\\u0430\\u043D\\u0443\\u0448\\u044B\\u0493\\u0430 \\u043A\\u04E9\\u0440\\u0456\\u043D\\u0431\\u0435\\u0439\\u0434\\u0456.\n#XMSG\nTitle.ContentNotNavigateable=\\u041C\\u0430\\u0437\\u043C\\u04B1\\u043D \\u0430\\u0440\\u049B\\u044B\\u043B\\u044B \\u0448\\u0430\\u0440\\u043B\\u0430\\u0443 \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D \\u0431\\u043E\\u043B\\u043C\\u0430\\u0439\\u0434\\u044B.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ko.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\uD398\\uC774\\uC9C0 \\uC720\\uC9C0\\uBCF4\\uC218\n\n\n#XBUT\nButton.Add=\\uCD94\\uAC00\n#XBUT\nButton.Cancel=\\uCDE8\\uC18C\n#XBUT\nButton.Copy=\\uBCF5\\uC0AC\n#XBUT\nButton.Create=\\uC0DD\\uC131\n#XBUT\nButton.Delete=\\uC0AD\\uC81C\n#XBUT\nButton.Edit=\\uD3B8\\uC9D1\n#XBUT\nButton.Save=\\uC800\\uC7A5\n#XBUT\nButton.Ok=\\uD655\\uC778\n#XBUT\nButton.ShowCatalogs=\\uCE74\\uD0C8\\uB85C\\uADF8 \\uC804\\uD658\n#XBUT\nButton.SortCatalogs=\\uCE74\\uD0C8\\uB85C\\uADF8 \\uC815\\uB82C \\uC21C\\uC11C \\uC804\\uD658\n#XBUT\nButton.CollapseCatalogs=\\uBAA8\\uB4E0 \\uCE74\\uD0C8\\uB85C\\uADF8 \\uC811\\uAE30\n#XBUT\nButton.ExpandCatalogs=\\uBAA8\\uB4E0 \\uCE74\\uD0C8\\uB85C\\uADF8 \\uD3BC\\uCE58\\uAE30\n#XBUT\nButton.ShowDetails=\\uC138\\uBD80\\uC0AC\\uD56D \\uD45C\\uC2DC\n#XBUT\nButton.PagePreview=\\uD398\\uC774\\uC9C0 \\uBBF8\\uB9AC\\uBCF4\\uAE30\n\n\n#XTOL\nTooltip.AddToGroups=\\uADF8\\uB8F9\\uC5D0 \\uCD94\\uAC00\n#XTOL Tooltip for the search button\nTooltip.Search=\\uAC80\\uC0C9\n#XTOL\nTooltip.SearchForTiles=\\uD0C0\\uC77C \\uAC80\\uC0C9\n\n\n#XFLD\nLabel.PageID=\\uD398\\uC774\\uC9C0 ID\n#XFLD\nLabel.WorkbenchRequest=\\uC6CC\\uD06C\\uBCA4\\uCE58 \\uC694\\uCCAD\n#XFLD\nLabel.Package=\\uD328\\uD0A4\\uC9C0\n#XFLD\nLabel.TransportInformation=\\uC804\\uC1A1 \\uC815\\uBCF4\n#XFLD\nLabel.Details=\\uC138\\uBD80\\uC0AC\\uD56D\\:\n#XFLD\nLabel.ResponseCode=\\uC751\\uB2F5 \\uCF54\\uB4DC\\:\n#XFLD\nLabel.Description=\\uB0B4\\uC5ED\n#XFLD\nLabel.CreatedBy=\\uC0DD\\uC131\\uC790\n#XFLD\nLabel.CreatedOn=\\uC0DD\\uC131\\uC77C\n#XFLD\nLabel.ChangedBy=\\uBCC0\\uACBD\\uC790\n#XFLD\nLabel.ChangedOn=\\uBCC0\\uACBD\\uC77C\n#XFLD\nLabel.PageTitle=\\uD398\\uC774\\uC9C0 \\uC81C\\uBAA9\n#XFLD\nLabel.AssignedRole=\\uC9C0\\uC815\\uB41C \\uC5ED\\uD560\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\uC81C\\uBAA9\n#XCOL\nColumn.PageDescription=\\uB0B4\\uC5ED\n#XCOL\nColumn.PageCreatedBy=\\uC0DD\\uC131\\uC790\n#XCOL\nColumn.PageCreatedOn=\\uC0DD\\uC131\\uC77C\n#XCOL\nColumn.PageChangedBy=\\uBCC0\\uACBD\\uC790\n#XCOL\nColumn.PageChangedOn=\\uBCC0\\uACBD\\uC77C\n\n\n#XTOL\nPlaceholder.GroupName=\\uADF8\\uB8F9 \\uC774\\uB984 \\uC785\\uB825\n#XTOL\nPlaceholder.SearchForTiles=\\uD0C0\\uC77C \\uAC80\\uC0C9\n\n#MSG\nMessage.NoGroupTitle=\\uADF8\\uB8F9 {0}\\uC5D0 \\uD0C0\\uC77C\\uC774 \\uC5C6\\uC2B5\\uB2C8\\uB2E4. \\uC0AC\\uC6A9\\uC790 \\uACBD\\uD5D8\\uC774 \\uC77C\\uAD00\\uB418\\uAC8C \\uD558\\uB824\\uBA74 \\uAC01\\uAC01\\uC758 \\uADF8\\uB8F9\\uC5D0 \\uADF8\\uB8F9 \\uC774\\uB984\\uC744 \\uC785\\uB825\\uD558\\uB294 \\uAC83\\uC774 \\uC88B\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.InvalidGroupTitle=\\uADF8\\uB8F9 \\uC774\\uB984\\uC744 \\uC785\\uB825\\uD558\\uB294 \\uAC83\\uC774 \\uC88B\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.NoInternetConnection=\\uC778\\uD130\\uB137 \\uC5F0\\uACB0\\uC744 \\uC810\\uAC80\\uD558\\uC2ED\\uC2DC\\uC624.\n#XMSG\nMessage.SavedChanges=\\uBCC0\\uACBD \\uB0B4\\uC6A9\\uC774 \\uC800\\uC7A5\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.InvalidPageID=A-Z a-z 0-9 _ / \\uBB38\\uC790\\uB9CC \\uC0AC\\uC6A9\\uD558\\uC2ED\\uC2DC\\uC624.\n#XMSG\nMessage.EmptyPageID=\\uD398\\uC774\\uC9C0 ID\\uB97C \\uC785\\uB825\\uD558\\uC2ED\\uC2DC\\uC624.\n#XMSG\nMessage.EmptyTitle=\\uD0C0\\uC77C\\uC744 \\uC785\\uB825\\uD558\\uC2ED\\uC2DC\\uC624.\n#XMSG\nMessage.SuccessDeletePage=\\uC120\\uD0DD\\uD55C \\uC624\\uBE0C\\uC81D\\uD2B8\\uAC00 \\uC0AD\\uC81C\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.ClipboardCopySuccess=\\uC138\\uBD80\\uC0AC\\uD56D\\uC774 \\uBCF5\\uC0AC\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n#YMSE\nMessage.ClipboardCopyFail=\\uC138\\uBD80\\uC0AC\\uD56D \\uBCF5\\uC0AC \\uC911 \\uC624\\uB958\\uAC00 \\uBC1C\\uC0DD\\uD588\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.DeletePageConfirmation={0} {1}\\uC744(\\uB97C) \\n \\uC0AD\\uC81C\\uD558\\uC2DC\\uACA0\\uC2B5\\uB2C8\\uAE4C?\n#XMSG\nMessage.PageCreated=\\uD398\\uC774\\uC9C0\\uAC00 \\uC0DD\\uC131\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\uD0C0\\uC77C\\uC774 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\uADF8\\uB8F9 \\uC5C6\\uC74C\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\uADF8\\uB8F9 "{1}"\\uC5D0\\uC11C \\uD0C0\\uC77C {0}\\uC744(\\uB97C) \\uB85C\\uB4DC\\uD558\\uC9C0 \\uBABB\\uD588\\uC2B5\\uB2C8\\uB2E4.\\n\\n\\uC774\\uB294 SAP Fiori LaunchPad \\uCEE8\\uD150\\uD2B8 \\uAD6C\\uC131\\uC774 \\uC798\\uBABB\\uB418\\uC5C8\\uAC70\\uB098 \\uC5ED\\uD560 \\uC9C0\\uC815\\uC774 \\uB204\\uB77D\\uB418\\uC5B4 \\uBC1C\\uC0DD\\uD560 \\uAC00\\uB2A5\\uC131\\uC774 \\uB192\\uC2B5\\uB2C8\\uB2E4.\\n\\n\\uCEE8\\uD150\\uD2B8\\uAC00 \\uC0AC\\uC6A9\\uC790\\uC5D0\\uAC8C \\uD45C\\uC2DC\\uB418\\uC9C0 \\uC54A\\uC2B5\\uB2C8\\uB2E4.\\n\\n\\uC774 \\uBB38\\uC81C\\uB97C \\uD574\\uACB0\\uD558\\uB824\\uBA74 \\uC774 \\uC5ED\\uD560\\uC5D0 \\uC9C0\\uC815\\uB41C \\uCE74\\uD0C8\\uB85C\\uADF8 \\uBC0F \\uB300\\uC0C1 \\uB9E4\\uD551\\uC744 \\uD655\\uC778\\uD558\\uC2ED\\uC2DC\\uC624.\n#XMSG\nMessage.NavigationTargetError=\\uD0D0\\uC0C9 \\uB300\\uC0C1\\uC744 \\uACB0\\uC815\\uD560 \\uC218 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.TilesHaveErrors=\\uC77C\\uBD80 \\uD0C0\\uC77C\\uC774\\uB098 \\uADF8\\uB8F9\\uC5D0 \\uC624\\uB958\\uB098 \\uACBD\\uACE0\\uAC00 \\uC788\\uC2B5\\uB2C8\\uB2E4. \\uACC4\\uC18D \\uC800\\uC7A5\\uD558\\uC2DC\\uACA0\\uC2B5\\uB2C8\\uAE4C?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\uD0C0\\uC77C\\uC758 \\uD0D0\\uC0C9 \\uB300\\uC0C1\\uC744 \\uACB0\\uC815\\uD558\\uC9C0 \\uBABB\\uD568\\: "{0}".\\n\\n\\uC774\\uB294 SAP Fiori LaunchPad \\uCEE8\\uD150\\uD2B8 \\uAD6C\\uC131\\uC774 \\uC798\\uBABB\\uB418\\uC5C8\\uAC70\\uB098 \\uC5ED\\uD560 \\uC9C0\\uC815\\uC774 \\uB204\\uB77D\\uB418\\uC5B4 \\uBC1C\\uC0DD\\uD560 \\uAC00\\uB2A5\\uC131\\uC774 \\uB192\\uC2B5\\uB2C8\\uB2E4.\\n\\n\\uD0C0\\uC77C "{0}"\\uC740(\\uB294) \\uC0AC\\uC6A9\\uC790\\uC5D0\\uAC8C \\uD45C\\uC2DC\\uB418\\uC9C0\\uB9CC \\uC0AC\\uC6A9\\uC790\\uB294 \\uC774 \\uD0C0\\uC77C\\uC744 \\uC0AC\\uC6A9\\uD558\\uC5EC \\uD0D0\\uC0C9\\uD560 \\uC218 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.DeleteGroup=\\uADF8\\uB8F9 "{0}"\\uC744(\\uB97C) \\uC0AD\\uC81C\\uD558\\uC2DC\\uACA0\\uC2B5\\uB2C8\\uAE4C?\n#XMSG\nMessage.PageIsOutdated=\\uC774 \\uD398\\uC774\\uC9C0\\uC758 \\uCD5C\\uC2E0 \\uBC84\\uC804\\uC774 \\uC774\\uBBF8 \\uC800\\uC7A5\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nMessage.SaveChanges=\\uBCC0\\uACBD\\uC0AC\\uD56D\\uC744 \\uC800\\uC7A5\\uD558\\uC2ED\\uC2DC\\uC624.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\uC2E0\\uADDC \\uD398\\uC774\\uC9C0\n#XTIT\nTitle.TilesHaveErrors=\\uD0C0\\uC77C\\uC5D0 \\uC624\\uB958 \\uC788\\uC74C\n#XTIT\nDeleteDialog.Title=\\uC0AD\\uC81C\n#XMSG\nDeleteDialog.Text=\\uC120\\uD0DD\\uD55C \\uD398\\uC774\\uC9C0\\uB97C \\uC0AD\\uC81C\\uD558\\uC2DC\\uACA0\\uC2B5\\uB2C8\\uAE4C?\n#XBUT\nDeleteDialog.ConfirmButton=\\uC0AD\\uC81C\n#XTIT\nDeleteDialog.LockedTitle=\\uD398\\uC774\\uC9C0 \\uC7A0\\uAE40\n#XMSG\nDeleteDialog.LockedText=\\uC120\\uD0DD\\uD55C \\uD398\\uC774\\uC9C0\\uB97C {0} \\uC0AC\\uC6A9\\uC790\\uAC00 \\uC7A0\\uAC14\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nDeleteDialog.TransportRequired=\\uC120\\uD0DD\\uD55C \\uD398\\uC774\\uC9C0\\uB97C \\uC0AD\\uC81C\\uD558\\uB824\\uBA74 \\uC804\\uC1A1\\uC744 \\uC120\\uD0DD\\uD558\\uC2ED\\uC2DC\\uC624.\n\n#XMSG\nEditDialog.LockedText=\\uC120\\uD0DD\\uD55C \\uD398\\uC774\\uC9C0\\uB97C {0} \\uC0AC\\uC6A9\\uC790\\uAC00 \\uC7A0\\uAC14\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nEditDialog.TransportRequired=\\uC120\\uD0DD\\uD55C \\uD398\\uC774\\uC9C0\\uB97C \\uD3B8\\uC9D1\\uD558\\uB824\\uBA74 \\uC804\\uC1A1\\uC744 \\uC120\\uD0DD\\uD558\\uC2ED\\uC2DC\\uC624.\n#XTIT\nEditDialog.Title=\\uD398\\uC774\\uC9C0 \\uD3B8\\uC9D1\n\n#XTIT\nErrorDialog.Title=\\uC624\\uB958\n\n#XTIT\nPageOverview.Title=\\uD398\\uC774\\uC9C0 \\uC720\\uC9C0\\uBCF4\\uC218\n\n\n#XTIT\nCopyDialog.Title=\\uBCF5\\uC0AC\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message={0}\\uC744(\\uB97C) \\uBCF5\\uC0AC\\uD558\\uC2DC\\uACA0\\uC2B5\\uB2C8\\uAE4C?\n#XFLD\nCopyDialog.NewID={0} \\uBCF5\\uC0AC\n\n\n#XMSG\nTitle.NoGroupTitle=\\uADF8\\uB8F9 {0}\\uC758 \\uADF8\\uB8F9 \\uD0C0\\uC77C\\uC774 \\uBE44\\uC5B4 \\uC788\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nTitle.UnsufficientRoles=\\uCEE8\\uD150\\uD2B8\\uB97C \\uD45C\\uC2DC\\uD558\\uAE30\\uC5D0 \\uC5ED\\uD560 \\uC9C0\\uC815\\uC774 \\uCDA9\\uBD84\\uD558\\uC9C0 \\uC54A\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nTitle.ContentIsNotVisible=\\uCEE8\\uD150\\uD2B8\\uAC00 \\uC0AC\\uC6A9\\uC790\\uC5D0\\uAC8C \\uD45C\\uC2DC\\uB418\\uC9C0 \\uC54A\\uC2B5\\uB2C8\\uB2E4.\n#XMSG\nTitle.ContentNotNavigateable=\\uCEE8\\uD150\\uD2B8\\uB97C \\uD0D0\\uC0C9\\uD560 \\uC218 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_lt.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Tvarkyti puslapius\n\n\n#XBUT\nButton.Add=Prid\\u0117ti\n#XBUT\nButton.Cancel=At\\u0161aukti\n#XBUT\nButton.Copy=Kopijuoti\n#XBUT\nButton.Create=Kurti\n#XBUT\nButton.Delete=Naikinti\n#XBUT\nButton.Edit=Redaguoti\n#XBUT\nButton.Save=\\u012Era\\u0161yti\n#XBUT\nButton.Ok=Gerai\n#XBUT\nButton.ShowCatalogs=Perjungti katalogus\n#XBUT\nButton.SortCatalogs=Perjungti katalogo r\\u016B\\u0161iavimo tvark\\u0105\n#XBUT\nButton.CollapseCatalogs=Sutraukti visus katalogus\n#XBUT\nButton.ExpandCatalogs=I\\u0161pl\\u0117sti visus katalogus\n#XBUT\nButton.ShowDetails=Rodyti i\\u0161sami\\u0105 informacij\\u0105\n#XBUT\nButton.PagePreview=Puslapio per\\u017Ei\\u016Bra\n\n\n#XTOL\nTooltip.AddToGroups=\\u012Etraukti \\u012F grupes\n#XTOL Tooltip for the search button\nTooltip.Search=Ie\\u0161koti\n#XTOL\nTooltip.SearchForTiles=Ie\\u0161koti poekrani\\u0173\n\n\n#XFLD\nLabel.PageID=Puslapio ID\n#XFLD\nLabel.WorkbenchRequest=Instrumentini\\u0173 priemoni\\u0173 u\\u017Eklausa\n#XFLD\nLabel.Package=Paketas\n#XFLD\nLabel.TransportInformation=Transporto informacija\n#XFLD\nLabel.Details=I\\u0161sami informacija\\:\n#XFLD\nLabel.ResponseCode=Atsakymo kodas\\:\n#XFLD\nLabel.Description=Apra\\u0161as\n#XFLD\nLabel.CreatedBy=Autorius\n#XFLD\nLabel.CreatedOn=Suk\\u016Brimo data\n#XFLD\nLabel.ChangedBy=Keitimo autorius\n#XFLD\nLabel.ChangedOn=Keitimo data\n#XFLD\nLabel.PageTitle=Puslapio pavadinimas\n#XFLD\nLabel.AssignedRole=Priskirtas vaidmuo\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Antra\\u0161t\\u0117\n#XCOL\nColumn.PageDescription=Apra\\u0161as\n#XCOL\nColumn.PageCreatedBy=Autorius\n#XCOL\nColumn.PageCreatedOn=Suk\\u016Brimo data\n#XCOL\nColumn.PageChangedBy=Keitimo autorius\n#XCOL\nColumn.PageChangedOn=Keitimo data\n\n\n#XTOL\nPlaceholder.GroupName=\\u012Eveskite grup\\u0117s pavadinim\\u0105\n#XTOL\nPlaceholder.SearchForTiles=Ie\\u0161koti poekrani\\u0173\n\n#MSG\nMessage.NoGroupTitle=Grup\\u0117 {0} neturi pavadinimo. Norint u\\u017Etikrinti nuosekli\\u0105 vartotojo patirt\\u012F, rekomenduojame \\u012Fvesti kiekvienos grup\\u0117s grup\\u0117s pavadinim\\u0105.\n#XMSG\nMessage.InvalidGroupTitle=Idealiu atveju, tur\\u0117tum\\u0117te \\u012Fvesti grup\\u0117s pavadinim\\u0105.\n#XMSG\nMessage.NoInternetConnection=Patikrinkite interneto ry\\u0161\\u012F.\n#XMSG\nMessage.SavedChanges=J\\u016Bs\\u0173 pakeitimai \\u012Fra\\u0161yti.\n#XMSG\nMessage.InvalidPageID=Naudokite tik \\u0161iuos simbolius\\: A\\u2013Z a\\u2013z 0\\u20139 _ /\n#XMSG\nMessage.EmptyPageID=Pateikite puslapio ID.\n#XMSG\nMessage.EmptyTitle=Pateikite pavadinim\\u0105.\n#XMSG\nMessage.SuccessDeletePage=Pasirinktas objektas buvo panaikintas.\n#XMSG\nMessage.ClipboardCopySuccess=Informacija nukopijuota s\\u0117kmingai.\n#YMSE\nMessage.ClipboardCopyFail=Kopijuojant informacij\\u0105 \\u012Fvyko klaida.\n#XMSG\nMessage.DeletePageConfirmation=Ar tikrai norite panaikinti \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Puslapis sukurtas.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=N\\u0117ra poekrani\\u0173\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Grupi\\u0173 n\\u0117ra\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Nepavyko \\u012Fkelti {0} poekranio \\u012F grup\\u0119 \\u201E{1}\\u201C.\\n\\nTai grei\\u010Diausiai \\u012Fvyko d\\u0117l netinkamos \\u201ESAP Fiori\\u201C paleidimo skydelio turinio konfig\\u016Bracijos arba d\\u0117l tr\\u016Bkstamo vaidmens priskyrimo.\\n\\nTurinys bus nematomas vartotojui.\\n\\nNor\\u0117dami i\\u0161spr\\u0119sti \\u0161i\\u0105 problem\\u0105, patikrinkite katalogus ir tikslinius susiejimus, priskirtus \\u0161iam vaidmeniui.\n#XMSG\nMessage.NavigationTargetError=Nar\\u0161ymo tikslo nepavyko i\\u0161spr\\u0119sti.\n#XMSG\nMessage.TilesHaveErrors=Kai kuriuose poekranuose arba grup\\u0117se yra klaid\\u0173. Ar tikrai norite t\\u0119sti?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Nepavyko i\\u0161spr\\u0119sti failo \\u201E{0}\\u201C nar\\u0161ymo tikslo.\\n\\nTai grei\\u010Diausiai \\u012Fvyko d\\u0117l netinkamos \\u201ESAP Fiori\\u201C paleidimo skydelio turinio konfig\\u016Bracijos arba nes tr\\u016Bksta vaidmens priskyrimo.\\n\\nPoekranis \\u201E{0}\\u201C bus rodomas vartotojui, ta\\u010Diau vartotojas negal\\u0117s nar\\u0161yti naudodamas \\u0161\\u012F poekran\\u012F.\n#XMSG\nMessage.DeleteGroup=Ar tikrai norite panaikinti grup\\u0119 \\u201E{0}\\u201C?\n#XMSG\nMessage.PageIsOutdated=Jau yra \\u012Fra\\u0161yta naujesn\\u0117 \\u0161io puslapio versija.\n#XMSG\nMessage.SaveChanges=\\u012Era\\u0161ykite savo keitimus.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Naujas puslapis\n#XTIT\nTitle.TilesHaveErrors=Poekraniuose yra klaid\\u0173.\n#XTIT\nDeleteDialog.Title=Naikinti\n#XMSG\nDeleteDialog.Text=Ar tikrai norite naikinti pasirinkt\\u0105 puslap\\u012F?\n#XBUT\nDeleteDialog.ConfirmButton=Naikinti\n#XTIT\nDeleteDialog.LockedTitle=Puslapis u\\u017Erakintas.\n#XMSG\nDeleteDialog.LockedText=Pasirinkt\\u0105 puslap\\u012F u\\u017Erakino vartotojas {0}.\n#XMSG\nDeleteDialog.TransportRequired=Pasirinkite perk\\u0117lim\\u0105, kad panaikintum\\u0117te pasirinkt\\u0105 puslap\\u012F.\n\n#XMSG\nEditDialog.LockedText=Pasirinkt\\u0105 puslap\\u012F u\\u017Erakino vartotojas {0}.\n#XMSG\nEditDialog.TransportRequired=Pasirinkite perk\\u0117lim\\u0105, kad gal\\u0117tum\\u0117te redaguoti pasirinkt\\u0105 puslap\\u012F.\n#XTIT\nEditDialog.Title=Redaguoti puslap\\u012F\n\n#XTIT\nErrorDialog.Title=Klaida\n\n#XTIT\nPageOverview.Title=Tvarkyti puslapius\n\n\n#XTIT\nCopyDialog.Title=Kopijuoti\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Ar norite nukopijuoti {0}?\n#XFLD\nCopyDialog.NewID={0} kopija\n\n\n#XMSG\nTitle.NoGroupTitle=Grup\\u0117s {0} grup\\u0117s pavadinimo vieta yra tu\\u0161\\u010Dia.\n#XMSG\nTitle.UnsufficientRoles=Nepakankamas vaidmens priskyrimas, kad b\\u016Bt\\u0173 rodomas turinys\n#XMSG\nTitle.ContentIsNotVisible=Turinys vartotojui bus nematomas.\n#XMSG\nTitle.ContentNotNavigateable=Turinio nebus galima nar\\u0161yti.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_lv.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Uztur\\u0113t lapas\n\n\n#XBUT\nButton.Add=Pievienot\n#XBUT\nButton.Cancel=Atcelt\n#XBUT\nButton.Copy=Kop\\u0113t\n#XBUT\nButton.Create=Izveidot\n#XBUT\nButton.Delete=Dz\\u0113st\n#XBUT\nButton.Edit=Redi\\u0123\\u0113t\n#XBUT\nButton.Save=Saglab\\u0101t\n#XBUT\nButton.Ok=Labi\n#XBUT\nButton.ShowCatalogs=P\\u0101rsl\\u0113gt katalogus\n#XBUT\nButton.SortCatalogs=P\\u0101rsl\\u0113gt kataloga k\\u0101rto\\u0161anas sec\\u012Bbu\n#XBUT\nButton.CollapseCatalogs=Sak\\u013Caut visus katalogus\n#XBUT\nButton.ExpandCatalogs=Izv\\u0113rst visus katalogus\n#XBUT\nButton.ShowDetails=R\\u0101d\\u012Bt detaliz\\u0113tu inform\\u0101ciju\n#XBUT\nButton.PagePreview=Lapas priek\\u0161skat\\u012Bjums\n\n\n#XTOL\nTooltip.AddToGroups=Pievienot grup\\u0101m\n#XTOL Tooltip for the search button\nTooltip.Search=Mekl\\u0113t\n#XTOL\nTooltip.SearchForTiles=Mekl\\u0113t moza\\u012Bkas\n\n\n#XFLD\nLabel.PageID=Lapas ID\n#XFLD\nLabel.WorkbenchRequest=Darbtelpas piepras\\u012Bjums\n#XFLD\nLabel.Package=Pakotne\n#XFLD\nLabel.TransportInformation=Transporta inform\\u0101cija\n#XFLD\nLabel.Details=Detaliz\\u0113ta inform\\u0101cija\\:\n#XFLD\nLabel.ResponseCode=Atbildes kods\\:\n#XFLD\nLabel.Description=Apraksts\n#XFLD\nLabel.CreatedBy=Izveidoja\n#XFLD\nLabel.CreatedOn=Izveides datums\n#XFLD\nLabel.ChangedBy=Main\\u012Bja\n#XFLD\nLabel.ChangedOn=Main\\u012B\\u0161anas datums\n#XFLD\nLabel.PageTitle=Lapas virsraksts\n#XFLD\nLabel.AssignedRole=Pie\\u0161\\u0137irt\\u0101 loma\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Virsraksts\n#XCOL\nColumn.PageDescription=Apraksts\n#XCOL\nColumn.PageCreatedBy=Izveidoja\n#XCOL\nColumn.PageCreatedOn=Izveides datums\n#XCOL\nColumn.PageChangedBy=Main\\u012Bja\n#XCOL\nColumn.PageChangedOn=Main\\u012B\\u0161anas datums\n\n\n#XTOL\nPlaceholder.GroupName=Ievad\\u012Bt grupas nosaukumu\n#XTOL\nPlaceholder.SearchForTiles=Mekl\\u0113t moza\\u012Bkas\n\n#MSG\nMessage.NoGroupTitle=Grupai {0} nav virsraksta. Lai nodro\\u0161in\\u0101tu konsekventu lietot\\u0101ja pieredzi, ieteicams ievad\\u012Bt grupas nosaukumu katrai grupai.\n#XMSG\nMessage.InvalidGroupTitle=Ide\\u0101l\\u0101 variant\\u0101 jums j\\u0101ievada grupas nosaukums.\n#XMSG\nMessage.NoInternetConnection=L\\u016Bdzu, p\\u0101rbaudiet interneta savienojumu.\n#XMSG\nMessage.SavedChanges=J\\u016Bsu veikt\\u0101s izmai\\u0146as ir saglab\\u0101tas.\n#XMSG\nMessage.InvalidPageID=L\\u016Bdzu, izmantojiet tikai \\u0161\\u012Bs rakstz\\u012Bmes\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=L\\u016Bdzu, nodro\\u0161iniet lapas ID.\n#XMSG\nMessage.EmptyTitle=L\\u016Bdzu, nodro\\u0161iniet virsrakstu.\n#XMSG\nMessage.SuccessDeletePage=Atlas\\u012Btais objekts tika izdz\\u0113sts.\n#XMSG\nMessage.ClipboardCopySuccess=Detaliz\\u0113t\\u0101 inform\\u0101cija ir sekm\\u012Bgi nokop\\u0113ta.\n#YMSE\nMessage.ClipboardCopyFail=Kop\\u0113jot detaliz\\u0113to inform\\u0101ciju, rad\\u0101s k\\u013C\\u016Bda.\n#XMSG\nMessage.DeletePageConfirmation=Vai tie\\u0161\\u0101m v\\u0113laties dz\\u0113st \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Lapa ir izveidota.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Bez moza\\u012Bk\\u0101m\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Bez grup\\u0101m\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Neizdev\\u0101s iel\\u0101d\\u0113t {0} fl\\u012Bz\\u012Bti grup\\u0101 "{1}".\\n\\nParasti to izraisa nepareiza SAP Fiori palai\\u0161anas pane\\u013Ca satura konfigur\\u0101cija vai tr\\u016Bksto\\u0161a lomas piesaiste.\\n\\nSaturs lietot\\u0101jam b\\u016Bs neredzams.\\n\\nLai atrisin\\u0101tu \\u0161o probl\\u0113mu, l\\u016Bdzu, p\\u0101rbaudiet \\u0161ai lomai piesaist\\u012Btos katalogu un m\\u0113r\\u0137a kart\\u0113jumus.\n#XMSG\nMessage.NavigationTargetError=Navig\\u0101cijas m\\u0113r\\u0137i nevar\\u0113ja atrisin\\u0101t.\n#XMSG\nMessage.TilesHaveErrors=Da\\u017E\\u0101s fl\\u012Bz\\u012Bt\\u0113s vai grup\\u0101s ir k\\u013C\\u016Bdas vai br\\u012Bdin\\u0101jumi. Vai tie\\u0161\\u0101m v\\u0113laties turpin\\u0101t saglab\\u0101\\u0161anu?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Neizdev\\u0101s atrisin\\u0101t fl\\u012Bz\\u012Btes navig\\u0101cijas m\\u0113r\\u0137i\\: "{0}".\\n\\nParasti to izraisa nepareiza SAP Fiori palai\\u0161anas pane\\u013Ca satura konfigur\\u0101cijas vai tr\\u016Bksto\\u0161\\u0101s lomas piesaiste .\\n\\n Fl\\u012Bz\\u012Bte "{0}" tiks par\\u0101d\\u012Bta lietot\\u0101jam, bet lietot\\u0101js nevar\\u0113s navi\\u0123\\u0113t, izmantojot \\u0161o fl\\u012Bz\\u012Bti.\n#XMSG\nMessage.DeleteGroup=Vai tie\\u0161\\u0101m v\\u0113laties izdz\\u0113st grupu \\u201C{0}\\u201D?\n#XMSG\nMessage.PageIsOutdated=\\u0160\\u012Bs lapas jaun\\u0101k\\u0101 versija jau tika saglab\\u0101ta.\n#XMSG\nMessage.SaveChanges=L\\u016Bdzu, saglab\\u0101jiet izmai\\u0146as.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Jauna lapa\n#XTIT\nTitle.TilesHaveErrors=Fl\\u012Bz\\u012Bt\\u0113s ir k\\u013C\\u016Bdas\n#XTIT\nDeleteDialog.Title=Dz\\u0113st\n#XMSG\nDeleteDialog.Text=Vai tie\\u0161\\u0101m v\\u0113laties dz\\u0113st atlas\\u012Bto lapu?\n#XBUT\nDeleteDialog.ConfirmButton=Dz\\u0113st\n#XTIT\nDeleteDialog.LockedTitle=Lapa blo\\u0137\\u0113ta\n#XMSG\nDeleteDialog.LockedText=Atlas\\u012Bto lapu blo\\u0137\\u0113ja lietot\\u0101js {0}.\n#XMSG\nDeleteDialog.TransportRequired=Lai dz\\u0113stu atlas\\u012Bto lapu, l\\u016Bdzu, atlasiet transport\\u0113\\u0161anu.\n\n#XMSG\nEditDialog.LockedText=Atlas\\u012Bto lapu blo\\u0137\\u0113ja lietot\\u0101js {0}.\n#XMSG\nEditDialog.TransportRequired=Lai redi\\u0123\\u0113tu atlas\\u012Bto lapu, l\\u016Bdzu, atlasiet transport\\u0113\\u0161anu.\n#XTIT\nEditDialog.Title=Lapas redi\\u0123\\u0113\\u0161ana\n\n#XTIT\nErrorDialog.Title=K\\u013C\\u016Bda\n\n#XTIT\nPageOverview.Title=Uztur\\u0113t lapas\n\n\n#XTIT\nCopyDialog.Title=Kop\\u0113t\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Vai v\\u0113laties kop\\u0113t {0}?\n#XFLD\nCopyDialog.NewID={0} kopija\n\n\n#XMSG\nTitle.NoGroupTitle=Grupas {0} grupas virsraksts ir tuk\\u0161s.\n#XMSG\nTitle.UnsufficientRoles=Nepietiekama lomas piesaiste, lai r\\u0101d\\u012Btu saturu\n#XMSG\nTitle.ContentIsNotVisible=Saturs lietot\\u0101jam b\\u016Bs neredzams.\n#XMSG\nTitle.ContentNotNavigateable=Saturu nevar\\u0113s navi\\u0123\\u0113t.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ms.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Selenggarakan Halaman\n\n\n#XBUT\nButton.Add=Tambah\n#XBUT\nButton.Cancel=Batal\n#XBUT\nButton.Copy=Salin\n#XBUT\nButton.Create=Cipta\n#XBUT\nButton.Delete=Padam\n#XBUT\nButton.Edit=Edit\n#XBUT\nButton.Save=Simpan\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Katalog Togol\n#XBUT\nButton.SortCatalogs=Aturan Isih Katalog Togol\n#XBUT\nButton.CollapseCatalogs=Runtuhkan Semua Katalog\n#XBUT\nButton.ExpandCatalogs=Kembangkan Semua Katalog\n#XBUT\nButton.ShowDetails=Tunjukkan Butiran\n#XBUT\nButton.PagePreview=Pratonton Halaman\n\n\n#XTOL\nTooltip.AddToGroups=Tambah ke Kumpulan\n#XTOL Tooltip for the search button\nTooltip.Search=Cari\n#XTOL\nTooltip.SearchForTiles=Mencari Jubin\n\n\n#XFLD\nLabel.PageID=ID Halaman\n#XFLD\nLabel.WorkbenchRequest=Permintaan Workbench\n#XFLD\nLabel.Package=Pakej\n#XFLD\nLabel.TransportInformation=Maklumat Pengangkutan\n#XFLD\nLabel.Details=Butiran\\:\n#XFLD\nLabel.ResponseCode=Kod Maklum Balas\\:\n#XFLD\nLabel.Description=Perihalan\n#XFLD\nLabel.CreatedBy=Dicipta oleh\n#XFLD\nLabel.CreatedOn=Dicipta pada\n#XFLD\nLabel.ChangedBy=Diubah oleh\n#XFLD\nLabel.ChangedOn=Diubah pada\n#XFLD\nLabel.PageTitle=Tajuk Halaman\n#XFLD\nLabel.AssignedRole=Fungsi Diumpukkan\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Tajuk\n#XCOL\nColumn.PageDescription=Perihalan\n#XCOL\nColumn.PageCreatedBy=Dicipta oleh\n#XCOL\nColumn.PageCreatedOn=Dicipta pada\n#XCOL\nColumn.PageChangedBy=Diubah oleh\n#XCOL\nColumn.PageChangedOn=Diubah pada\n\n\n#XTOL\nPlaceholder.GroupName=Masukkan nama kumpulan\n#XTOL\nPlaceholder.SearchForTiles=Mencari jubin\n\n#MSG\nMessage.NoGroupTitle=Kumpulan {0} tidak mempunyai tajuk. Untuk memastikan pengalaman pengguna konsisten, kami mencadangkan nama kumpulan dimasukkan untuk setiap kumpulan.\n#XMSG\nMessage.InvalidGroupTitle=Anda sepatutnya memasukkan nama kumpulan.\n#XMSG\nMessage.NoInternetConnection=Sila semak sambungan internet anda.\n#XMSG\nMessage.SavedChanges=Perubahan anda telah disimpan.\n#XMSG\nMessage.InvalidPageID=Sila gunakan hanya aksara berikut\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Sila sediakan ID halaman.\n#XMSG\nMessage.EmptyTitle=Sila sediakan tajuk.\n#XMSG\nMessage.SuccessDeletePage=Objek terpilih telah dipadam.\n#XMSG\nMessage.ClipboardCopySuccess=Butiran berjaya disalin.\n#YMSE\nMessage.ClipboardCopyFail=Ralat berlaku ketika menyalin butiran.\n#XMSG\nMessage.DeletePageConfirmation=Adakah anda pasti ingin padam \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Halaman telah dicipta.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Tiada jubin\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Tiada Kumpulan\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Gagal untuk muat jubin {0} dalam kumpulan "{1}".\\n\\nPerkara ini berkemungkinan besar disebabkan oleh konfigurasi kandungan launchpad SAP Fiori yang salah atau ketiadaan umpukan fungsi.\\n\\nKandungan tidak boleh dilihat oleh pengguna.\\n\\nUntuk selesaikan isu ini, sila semak katalog dan pemetaan sasaran yang diumpukkan ke fungsi ini.\n#XMSG\nMessage.NavigationTargetError=Sasaran navigasi tidak boleh diselesaikan.\n#XMSG\nMessage.TilesHaveErrors=Beberapa jubin atau kumpulan mempunyai ralat. Adakah anda pasti ingin terus menyimpan?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Gagal untuk selesaikan sasaran navigasi bagi jubin\\: "{0}".\\n\\n Perkara ini berkemungkinan besar disebabkan oleh konfigurasi kandungan SAP Fiori launchpad yang salah atau ketiadaan umpukan fungsi.\\n\\n Jubin "{0}" akan ditunjukkan kepada pengguna, tetapi pengguna tidak boleh navigasi menggunakan jubin ini.\n#XMSG\nMessage.DeleteGroup=Adakah anda pasti ingin padam kumpulan "{0}"?\n#XMSG\nMessage.PageIsOutdated=Versi terkini bagi halaman ini telah disimpan.\n#XMSG\nMessage.SaveChanges=Sila simpan perubahan anda.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Halaman Baharu\n#XTIT\nTitle.TilesHaveErrors=Jubin Mempunyai Ralat\n#XTIT\nDeleteDialog.Title=Padam\n#XMSG\nDeleteDialog.Text=Adakah anda pasti anda ingin memadam halaman dipilih?\n#XBUT\nDeleteDialog.ConfirmButton=Padam\n#XTIT\nDeleteDialog.LockedTitle=Halaman dikunci\n#XMSG\nDeleteDialog.LockedText=Halaman dipilih dikunci oleh pengguna {0}.\n#XMSG\nDeleteDialog.TransportRequired=Sila pilih pemindahan untuk memadam halaman dipilih.\n\n#XMSG\nEditDialog.LockedText=Halaman dipilih dikunci oleh pengguna {0}.\n#XMSG\nEditDialog.TransportRequired=Sila pilih pemindahan untuk mengedit halaman dipilih.\n#XTIT\nEditDialog.Title=Edit Halaman\n\n#XTIT\nErrorDialog.Title=Ralat\n\n#XTIT\nPageOverview.Title=Selenggarakan Halaman\n\n\n#XTIT\nCopyDialog.Title=Salin\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Adakah anda ingin salin {0}?\n#XFLD\nCopyDialog.NewID=Salinan bagi {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Kumpulan tajuk bagi kumpulan {0} kosong.\n#XMSG\nTitle.UnsufficientRoles=Kekurangan umpukan fungsi untuk menunjukkan kandungan\n#XMSG\nTitle.ContentIsNotVisible=Kandungan tidak boleh dilihat oleh pengguna.\n#XMSG\nTitle.ContentNotNavigateable=Kandungan tidak boleh dinavigasi.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_nl.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Pagina\'s verzorgen\n\n\n#XBUT\nButton.Add=Toevoegen\n#XBUT\nButton.Cancel=Annuleren\n#XBUT\nButton.Copy=Kopi\\u00EBren\n#XBUT\nButton.Create=Cre\\u00EBren\n#XBUT\nButton.Delete=Verwijderen\n#XBUT\nButton.Edit=Bewerken\n#XBUT\nButton.Save=Opslaan\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Catalogi omschakelen\n#XBUT\nButton.SortCatalogs=Sorteervolgorde catalogus omschakelen\n#XBUT\nButton.CollapseCatalogs=Alle catalogi verbergen\n#XBUT\nButton.ExpandCatalogs=Alle catalogi weergeven\n#XBUT\nButton.ShowDetails=Details weergeven\n#XBUT\nButton.PagePreview=Paginavoorbeeld\n\n\n#XTOL\nTooltip.AddToGroups=Aan groepen toevoegen\n#XTOL Tooltip for the search button\nTooltip.Search=Zoeken\n#XTOL\nTooltip.SearchForTiles=Zoeken naar tegels\n\n\n#XFLD\nLabel.PageID=Pagina-ID\n#XFLD\nLabel.WorkbenchRequest=Workbenchopdracht\n#XFLD\nLabel.Package=Pakket\n#XFLD\nLabel.TransportInformation=Transportinformatie\n#XFLD\nLabel.Details=Details\\:\n#XFLD\nLabel.ResponseCode=Responscode\\:\n#XFLD\nLabel.Description=Omschrijving\n#XFLD\nLabel.CreatedBy=Gecre\\u00EBerd door\n#XFLD\nLabel.CreatedOn=Gecre\\u00EBerd op\n#XFLD\nLabel.ChangedBy=Gewijzigd door\n#XFLD\nLabel.ChangedOn=Gewijzigd op\n#XFLD\nLabel.PageTitle=Paginatitel\n#XFLD\nLabel.AssignedRole=Toegewezen rol\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titel\n#XCOL\nColumn.PageDescription=Omschrijving\n#XCOL\nColumn.PageCreatedBy=Gecre\\u00EBerd door\n#XCOL\nColumn.PageCreatedOn=Gecre\\u00EBerd op\n#XCOL\nColumn.PageChangedBy=Gewijzigd door\n#XCOL\nColumn.PageChangedOn=Gewijzigd op\n\n\n#XTOL\nPlaceholder.GroupName=Groepsnaam invoeren\n#XTOL\nPlaceholder.SearchForTiles=Zoeken naar tegels\n\n#MSG\nMessage.NoGroupTitle=Groep {0} heeft geen titel. Om een consistente gebruikerservaring te garanderen, raden wij aan om een groepsnaam voor elke groep in te voeren.\n#XMSG\nMessage.InvalidGroupTitle=Het is raadzaam dat u een groepsnaam invoert.\n#XMSG\nMessage.NoInternetConnection=Controleer uw internetverbinding.\n#XMSG\nMessage.SavedChanges=Uw wijzigingen zijn opgeslagen.\n#XMSG\nMessage.InvalidPageID=Gebruik alleen de volgende tekens\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Geef de pagina-ID op.\n#XMSG\nMessage.EmptyTitle=Geef de titel op.\n#XMSG\nMessage.SuccessDeletePage=Het geselecteerde object is verwijderd.\n#XMSG\nMessage.ClipboardCopySuccess=Details zijn gekopieerd.\n#YMSE\nMessage.ClipboardCopyFail=Fout opgetreden tijdens kopi\\u00EBren van details.\n#XMSG\nMessage.DeletePageConfirmation=Weet u zeker dat u \\n {0} {1} wilt verwijderen?\n#XMSG\nMessage.PageCreated=De pagina is gecre\\u00EBerd.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Geen tegels\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Geen groepen\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Laden van tegel {0} in groep "{1}" is mislukt.\\n\\nDit komt vermoedelijk door onjuist geconfigureerde SAP Fiori-launchpadcontent of door een ontbrekende roltoewijzing.\\n\\nDe content zal niet zichtbaar zijn voor de gebruiker.\\n\\nU kunt dit probleem oplossen door de catalogi en doeltoewijzingen te controleren die aan deze rol zijn toegewezen.\n#XMSG\nMessage.NavigationTargetError=Navigatiedoel kan niet worden opgelost.\n#XMSG\nMessage.TilesHaveErrors=Sommige tegels of groepen bevatten fouten of waarschuwingen. Weet u zeker dat u uw gegevens wilt opslaan?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Navigatiedoel kan niet worden opgelost voor tegel\\: "{0}".\\n\\nDit komt vermoedelijk door onjuist geconfigureerde SAP Fiori-launchpadcontent of door een ontbrekende roltoewijzing.\\n\\n Tegel "{0}" wordt weergegeven voor de gebruiker, maar de gebruiker kan niet navigeren met behulp van deze tegel.\n#XMSG\nMessage.DeleteGroup=Weet u zeker dat u groep "{0}" wilt verwijderen?\n#XMSG\nMessage.PageIsOutdated=Er is al een nieuwere versie van deze pagina opgeslagen.\n#XMSG\nMessage.SaveChanges=Sla uw wijzigingen op.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nieuwe pagina\n#XTIT\nTitle.TilesHaveErrors=Tegels bevatten fouten\n#XTIT\nDeleteDialog.Title=Verwijderen\n#XMSG\nDeleteDialog.Text=Weet u zeker dat u de geselecteerde pagina wilt verwijderen?\n#XBUT\nDeleteDialog.ConfirmButton=Verwijderen\n#XTIT\nDeleteDialog.LockedTitle=Pagina geblokkeerd\n#XMSG\nDeleteDialog.LockedText=De geselecteerde pagina is geblokkeerd door gebruiker {0}.\n#XMSG\nDeleteDialog.TransportRequired=Selecteer een transport om de geselecteerde pagina te verwijderen.\n\n#XMSG\nEditDialog.LockedText=De geselecteerde pagina is geblokkeerd door gebruiker {0}.\n#XMSG\nEditDialog.TransportRequired=Selecteer een transport om de geselecteerde pagina te bewerken.\n#XTIT\nEditDialog.Title=Pagina bewerken\n\n#XTIT\nErrorDialog.Title=Fout\n\n#XTIT\nPageOverview.Title=Pagina\'s verzorgen\n\n\n#XTIT\nCopyDialog.Title=Kopi\\u00EBren\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Wilt u {0} kopi\\u00EBren?\n#XFLD\nCopyDialog.NewID=Kopie van {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Groepstitel van groep {0} is leeg.\n#XMSG\nTitle.UnsufficientRoles=Ontoereikende roltoewijzing om content weer te geven\n#XMSG\nTitle.ContentIsNotVisible=Content zal onzichtbaar zijn voor de gebruiker.\n#XMSG\nTitle.ContentNotNavigateable=Geen navigatie mogelijk in content.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_no.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Vedlikehold sider\n\n\n#XBUT\nButton.Add=Legg til\n#XBUT\nButton.Cancel=Avbryt\n#XBUT\nButton.Copy=Kopier\n#XBUT\nButton.Create=Opprett\n#XBUT\nButton.Delete=Slett\n#XBUT\nButton.Edit=Rediger\n#XBUT\nButton.Save=Lagre\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Vis/skjul kataloger\n#XBUT\nButton.SortCatalogs=Veksle katalogsortering\n#XBUT\nButton.CollapseCatalogs=Komprimer alle kataloger\n#XBUT\nButton.ExpandCatalogs=Utvid alle kataloger\n#XBUT\nButton.ShowDetails=Vis detaljer\n#XBUT\nButton.PagePreview=Forh\\u00E5ndsvisning av side\n\n\n#XTOL\nTooltip.AddToGroups=Legg til i grupper\n#XTOL Tooltip for the search button\nTooltip.Search=S\\u00F8k\n#XTOL\nTooltip.SearchForTiles=S\\u00F8k etter ruter\n\n\n#XFLD\nLabel.PageID=Side-ID\n#XFLD\nLabel.WorkbenchRequest=Workbenchordre\n#XFLD\nLabel.Package=Pakke\n#XFLD\nLabel.TransportInformation=Transportinformasjon\n#XFLD\nLabel.Details=Detaljer\\:\n#XFLD\nLabel.ResponseCode=Svarkode\\:\n#XFLD\nLabel.Description=Beskrivelse\n#XFLD\nLabel.CreatedBy=Opprettet av\n#XFLD\nLabel.CreatedOn=Opprettet den\n#XFLD\nLabel.ChangedBy=Endret av\n#XFLD\nLabel.ChangedOn=Endret den\n#XFLD\nLabel.PageTitle=Sidetittel\n#XFLD\nLabel.AssignedRole=Tilordnet rolle\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Tittel\n#XCOL\nColumn.PageDescription=Beskrivelse\n#XCOL\nColumn.PageCreatedBy=Opprettet av\n#XCOL\nColumn.PageCreatedOn=Opprettet den\n#XCOL\nColumn.PageChangedBy=Endret av\n#XCOL\nColumn.PageChangedOn=Endret den\n\n\n#XTOL\nPlaceholder.GroupName=Oppgi gruppenavn\n#XTOL\nPlaceholder.SearchForTiles=S\\u00F8k etter ruter\n\n#MSG\nMessage.NoGroupTitle=Gruppe {0} har ingen tittel. For \\u00E5 sikre en konsistent brukeropplevelse anbefaler vi \\u00E5 oppgi et gruppenavn for hver gruppe.\n#XMSG\nMessage.InvalidGroupTitle=Ideelt sett b\\u00F8r du oppgi et navn p\\u00E5 gruppen.\n#XMSG\nMessage.NoInternetConnection=Kontroller Internett-forbindelsen.\n#XMSG\nMessage.SavedChanges=Endringene er lagret.\n#XMSG\nMessage.InvalidPageID=Bruk bare f\\u00F8lgende tegn\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Oppgi side-ID.\n#XMSG\nMessage.EmptyTitle=Oppgi rute.\n#XMSG\nMessage.SuccessDeletePage=Valgt objekt er slettet.\n#XMSG\nMessage.ClipboardCopySuccess=Detaljene er kopiert.\n#YMSE\nMessage.ClipboardCopyFail=Det oppstod en feil under kopiering av detaljer.\n#XMSG\nMessage.DeletePageConfirmation=Er du sikker p\\u00E5 at du vil slette \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Siden er opprettet.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Ingen ruter\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Ingen grupper\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Mislykket lasting av ruten {0} i gruppen "{1}".\\n\\nDette skyldes mest sannsynlig feil konfigurasjon av SAP Fiori-startfeltinnhold eller en manglende rolletilordning.\\n\\nInnholdet vil v\\u00E6re usynlig for brukeren.\\n\\nFor \\u00E5 l\\u00F8se problemet m\\u00E5 du kontrollere katalogene og m\\u00E5ltilordningene som er tilordnet til denne rollen.\n#XMSG\nMessage.NavigationTargetError=Kan ikke bryte ned navigeringsm\\u00E5let.\n#XMSG\nMessage.TilesHaveErrors=Noen av rutene eller gruppene har feil eller advarsler. Er du sikker p\\u00E5 at du vil fortsette lagringen?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Kan ikke bryte ned navigeringsm\\u00E5let for ruten\\: "{0}".\\n\\n Dette skyldes mest sannsynlig feil konfigurasjon av SAP Fiori-startfeltinnhold eller en manglende rolletilordning.\\n\\n Ruten "{0}" vil v\\u00E6re synlig for brukeren, men brukeren vil ikke kunne navigere ved hjelp av denne ruten.\n#XMSG\nMessage.DeleteGroup=Vil du slette gruppe "{0}"?\n#XMSG\nMessage.PageIsOutdated=En nyere versjon av denne siden er allerede lagret.\n#XMSG\nMessage.SaveChanges=Lagre endringene.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Ny side\n#XTIT\nTitle.TilesHaveErrors=Ruter har feil\n#XTIT\nDeleteDialog.Title=Slett\n#XMSG\nDeleteDialog.Text=Er du sikker p\\u00E5 at du vil slette valgt side?\n#XBUT\nDeleteDialog.ConfirmButton=Slett\n#XTIT\nDeleteDialog.LockedTitle=Side sperret\n#XMSG\nDeleteDialog.LockedText=Valgt side er sperret av brukeren {0}.\n#XMSG\nDeleteDialog.TransportRequired=Velg en overf\\u00F8ring for \\u00E5 slette valgt side.\n\n#XMSG\nEditDialog.LockedText=Valgt side er sperret av brukeren {0}.\n#XMSG\nEditDialog.TransportRequired=Velg en overf\\u00F8ring for \\u00E5 redigere valgt side.\n#XTIT\nEditDialog.Title=Rediger side\n\n#XTIT\nErrorDialog.Title=Feil\n\n#XTIT\nPageOverview.Title=Vedlikehold sider\n\n\n#XTIT\nCopyDialog.Title=Kopier\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Vil du kopiere {0}?\n#XFLD\nCopyDialog.NewID=Kopi av {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Gruppetittelen p\\u00E5 gruppe {0} er tom.\n#XMSG\nTitle.UnsufficientRoles=Utilstrekkelig rolletilordning for visning av innhold\n#XMSG\nTitle.ContentIsNotVisible=Innholdet vil v\\u00E6re usynlig for brukeren.\n#XMSG\nTitle.ContentNotNavigateable=Innholdet vil ikke v\\u00E6re navigerbart.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_pl.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Opracowanie stron\n\n\n#XBUT\nButton.Add=Dodaj\n#XBUT\nButton.Cancel=Anuluj\n#XBUT\nButton.Copy=Kopiuj\n#XBUT\nButton.Create=Utw\\u00F3rz\n#XBUT\nButton.Delete=Usu\\u0144\n#XBUT\nButton.Edit=Edytuj\n#XBUT\nButton.Save=Zapisz\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Prze\\u0142\\u0105cz katalogi\n#XBUT\nButton.SortCatalogs=Zmie\\u0144 kolejno\\u015B\\u0107 sortowania katalog\\u00F3w\n#XBUT\nButton.CollapseCatalogs=Zwi\\u0144 wszystkie katalogi\n#XBUT\nButton.ExpandCatalogs=Rozwi\\u0144 wszystkie katalogi\n#XBUT\nButton.ShowDetails=Poka\\u017C szczeg\\u00F3\\u0142y\n#XBUT\nButton.PagePreview=Podgl\\u0105d strony\n\n\n#XTOL\nTooltip.AddToGroups=Dodaj do grup\n#XTOL Tooltip for the search button\nTooltip.Search=Szukaj\n#XTOL\nTooltip.SearchForTiles=Szukaj kafelk\\u00F3w\n\n\n#XFLD\nLabel.PageID=ID strony\n#XFLD\nLabel.WorkbenchRequest=Zlecenie Workbench\n#XFLD\nLabel.Package=Pakiet\n#XFLD\nLabel.TransportInformation=Informacje o transporcie\n#XFLD\nLabel.Details=Szczeg\\u00F3\\u0142y\\:\n#XFLD\nLabel.ResponseCode=Kod odpowiedzi\\:\n#XFLD\nLabel.Description=Opis\n#XFLD\nLabel.CreatedBy=Utworzone przez\n#XFLD\nLabel.CreatedOn=Utworzono dnia\n#XFLD\nLabel.ChangedBy=Zmienione przez\n#XFLD\nLabel.ChangedOn=Zmieniono dnia\n#XFLD\nLabel.PageTitle=Tytu\\u0142 strony\n#XFLD\nLabel.AssignedRole=Przypisana rola\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Tytu\\u0142\n#XCOL\nColumn.PageDescription=Opis\n#XCOL\nColumn.PageCreatedBy=Utworzone przez\n#XCOL\nColumn.PageCreatedOn=Utworzono dnia\n#XCOL\nColumn.PageChangedBy=Zmienione przez\n#XCOL\nColumn.PageChangedOn=Zmieniono dnia\n\n\n#XTOL\nPlaceholder.GroupName=Wprowad\\u017A nazw\\u0119 grupy\n#XTOL\nPlaceholder.SearchForTiles=Szukaj kafelk\\u00F3w\n\n#MSG\nMessage.NoGroupTitle=Grupa {0} nie ma tytu\\u0142u. W celu zapewnienia niezmiennego poziomu wygody korzystania zalecamy wprowadzenie nazwy dla ka\\u017Cdej grupy.\n#XMSG\nMessage.InvalidGroupTitle=Najlepiej wprowadzi\\u0107 nazw\\u0119 grupy.\n#XMSG\nMessage.NoInternetConnection=Sprawd\\u017A po\\u0142\\u0105czenie z Internetem.\n#XMSG\nMessage.SavedChanges=Twoje zmiany zosta\\u0142y zapisane.\n#XMSG\nMessage.InvalidPageID=U\\u017Cyj tylko nast\\u0119puj\\u0105cych znak\\u00F3w\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Podaj ID strony.\n#XMSG\nMessage.EmptyTitle=Podaj tytu\\u0142.\n#XMSG\nMessage.SuccessDeletePage=Wybrany obiekt zosta\\u0142 usuni\\u0119ty.\n#XMSG\nMessage.ClipboardCopySuccess=Pomy\\u015Blnie skopiowano szczeg\\u00F3\\u0142y.\n#YMSE\nMessage.ClipboardCopyFail=Wyst\\u0105pi\\u0142 b\\u0142\\u0105d podczas kopiowania szczeg\\u00F3\\u0142\\u00F3w.\n#XMSG\nMessage.DeletePageConfirmation=Czy na pewno chcesz usun\\u0105\\u0107 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Utworzono stron\\u0119.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Brak kafelk\\u00F3w\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Brak grup\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=B\\u0142\\u0105d wczytywania kafelka {0} w grupie "{1}".\\n\\nNajprawdopodobniej jest to spowodowane nieprawid\\u0142ow\\u0105 konfiguracj\\u0105 zawarto\\u015Bci okna wywo\\u0142a\\u0144 SAP Fiori lub brakuj\\u0105cym przypisaniem roli.\\n\\nZawarto\\u015B\\u0107 nie b\\u0119dzie widoczna dla u\\u017Cytkownika.\\n\\nAby rozwi\\u0105za\\u0107 ten problem, sprawd\\u017A katalogi i mapowania docelowe przypisane do tej roli.\n#XMSG\nMessage.NavigationTargetError=Nie mo\\u017Cna by\\u0142o rozwin\\u0105\\u0107 celu nawigacji.\n#XMSG\nMessage.TilesHaveErrors=Niekt\\u00F3re kafelki lub grupy zawieraj\\u0105 b\\u0142\\u0119dy b\\u0105d\\u017A ostrze\\u017Cenia. Czy na pewno chcesz kontynuowa\\u0107 zapis?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=B\\u0142\\u0105d rozwijania celu nawigacji kafelka\\: "{0}".\\n\\nNajprawdopodobniej jest to spowodowane nieprawid\\u0142ow\\u0105 konfiguracj\\u0105 zawarto\\u015Bci okna wywo\\u0142a\\u0144 SAP Fiori lub brakuj\\u0105cym przypisaniem roli.\\n\\nKafelek "{0}" b\\u0119dzie widoczny dla u\\u017Cytkownika, ale nie b\\u0119dzie on m\\u00F3g\\u0142 nawigowa\\u0107 przy jego u\\u017Cyciu.\n#XMSG\nMessage.DeleteGroup=Czy na pewno chcesz usun\\u0105\\u0107 grup\\u0119 "{0}"?\n#XMSG\nMessage.PageIsOutdated=Zapisano ju\\u017C nowsz\\u0105 wersj\\u0119 tej strony.\n#XMSG\nMessage.SaveChanges=Zapisz zmiany.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nowa strona\n#XTIT\nTitle.TilesHaveErrors=Kafelki zawieraj\\u0105 b\\u0142\\u0119dy\n#XTIT\nDeleteDialog.Title=Usuwanie\n#XMSG\nDeleteDialog.Text=Czy na pewno chcesz usun\\u0105\\u0107 wybran\\u0105 stron\\u0119?\n#XBUT\nDeleteDialog.ConfirmButton=Usu\\u0144\n#XTIT\nDeleteDialog.LockedTitle=Strona zablokowana\n#XMSG\nDeleteDialog.LockedText=Wybrana strona jest zablokowana przez u\\u017Cytkownika {0}.\n#XMSG\nDeleteDialog.TransportRequired=Wybierz transport, aby usun\\u0105\\u0107 wybran\\u0105 stron\\u0119.\n\n#XMSG\nEditDialog.LockedText=Wybrana strona jest zablokowana przez u\\u017Cytkownika {0}.\n#XMSG\nEditDialog.TransportRequired=Wybierz transport, aby edytowa\\u0107 wybran\\u0105 stron\\u0119.\n#XTIT\nEditDialog.Title=Edycja strony\n\n#XTIT\nErrorDialog.Title=B\\u0142\\u0105d\n\n#XTIT\nPageOverview.Title=Opracowanie stron\n\n\n#XTIT\nCopyDialog.Title=Kopiowanie\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Czy chcesz skopiowa\\u0107 {0}?\n#XFLD\nCopyDialog.NewID=Kopia {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Tytu\\u0142 grupy {0} jest pusty.\n#XMSG\nTitle.UnsufficientRoles=Przypisanie roli nie jest wystarczaj\\u0105ce do wy\\u015Bwietlenia zawarto\\u015Bci\n#XMSG\nTitle.ContentIsNotVisible=Zawarto\\u015B\\u0107 nie b\\u0119dzie widoczna dla u\\u017Cytkownika.\n#XMSG\nTitle.ContentNotNavigateable=Nawigacja dla zawarto\\u015Bci nie b\\u0119dzie mo\\u017Cliwa.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_pt.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Atualizar p\\u00E1ginas\n\n\n#XBUT\nButton.Add=Adicionar\n#XBUT\nButton.Cancel=Cancelar\n#XBUT\nButton.Copy=Copiar\n#XBUT\nButton.Create=Criar\n#XBUT\nButton.Delete=Eliminar\n#XBUT\nButton.Edit=Processar\n#XBUT\nButton.Save=Gravar\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Comutar cat\\u00E1logos\n#XBUT\nButton.SortCatalogs=Comutar sequ\\u00EAncia de ordena\\u00E7\\u00E3o de cat\\u00E1logo\n#XBUT\nButton.CollapseCatalogs=Comprimir todos os cat\\u00E1logos\n#XBUT\nButton.ExpandCatalogs=Expandir todos os cat\\u00E1logos\n#XBUT\nButton.ShowDetails=Visualizar detalhes\n#XBUT\nButton.PagePreview=Visualiza\\u00E7\\u00E3o da p\\u00E1gina\n\n\n#XTOL\nTooltip.AddToGroups=Adicionar aos grupos\n#XTOL Tooltip for the search button\nTooltip.Search=Procurar\n#XTOL\nTooltip.SearchForTiles=Procurar blocos\n\n\n#XFLD\nLabel.PageID=ID da p\\u00E1gina\n#XFLD\nLabel.WorkbenchRequest=Ordem de workbench\n#XFLD\nLabel.Package=Pacote\n#XFLD\nLabel.TransportInformation=Informa\\u00E7\\u00E3o de transporte\n#XFLD\nLabel.Details=Detalhes\\:\n#XFLD\nLabel.ResponseCode=C\\u00F3digo de resposta\\:\n#XFLD\nLabel.Description=Descri\\u00E7\\u00E3o\n#XFLD\nLabel.CreatedBy=Criado por\n#XFLD\nLabel.CreatedOn=Criada em\n#XFLD\nLabel.ChangedBy=Modificado por\n#XFLD\nLabel.ChangedOn=Modificado em\n#XFLD\nLabel.PageTitle=T\\u00EDtulo da p\\u00E1gina\n#XFLD\nLabel.AssignedRole=Fun\\u00E7\\u00E3o atribu\\u00EDda\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=T\\u00EDtulo\n#XCOL\nColumn.PageDescription=Descri\\u00E7\\u00E3o\n#XCOL\nColumn.PageCreatedBy=Criado por\n#XCOL\nColumn.PageCreatedOn=Criada em\n#XCOL\nColumn.PageChangedBy=Modificado por\n#XCOL\nColumn.PageChangedOn=Modificado em\n\n\n#XTOL\nPlaceholder.GroupName=Inserir nome do grupo\n#XTOL\nPlaceholder.SearchForTiles=Procurar blocos\n\n#MSG\nMessage.NoGroupTitle=O grupo {0} n\\u00E3o tem um t\\u00EDtulo. Para assegurar uma experi\\u00EAncia consistente do usu\\u00E1rio, recomendamos que insira um nome do grupo para cada grupo.\n#XMSG\nMessage.InvalidGroupTitle=Idealmente, voc\\u00EA deve inserir um nome do grupo.\n#XMSG\nMessage.NoInternetConnection=Verifique a sua conex\\u00E3o de Internet.\n#XMSG\nMessage.SavedChanges=As suas modifica\\u00E7\\u00F5es foram gravadas.\n#XMSG\nMessage.InvalidPageID=Utilize somente os seguintes caracteres\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Forne\\u00E7a o ID da p\\u00E1gina.\n#XMSG\nMessage.EmptyTitle=Forne\\u00E7a o bloco.\n#XMSG\nMessage.SuccessDeletePage=O objeto selecionado foi eliminado.\n#XMSG\nMessage.ClipboardCopySuccess=Os detalhes foram copiados com \\u00EAxito.\n#YMSE\nMessage.ClipboardCopyFail=Ocorreu um erro ao copiar os detalhes.\n#XMSG\nMessage.DeletePageConfirmation=Eliminar {0} {1}?\n#XMSG\nMessage.PageCreated=A p\\u00E1gina foi criada.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Nenhum bloco\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Nenhum grupo\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Falha ao carregar o bloco {0} no grupo "{1}".\\n\\nIsto \\u00E9 muito provavelmente causado por uma configura\\u00E7\\u00E3o de conte\\u00FAdo do launchpad do SAP Fiori incorreta ou por uma atribui\\u00E7\\u00E3o de fun\\u00E7\\u00F5es em falta.\\n\\nO conte\\u00FAdo ser\\u00E1 invis\\u00EDvel para o usu\\u00E1rio.\\n\\nPara resolver esse problema, verifique os cat\\u00E1logos e mapeamentos de destino atribu\\u00EDdos a esta fun\\u00E7\\u00E3o.\n#XMSG\nMessage.NavigationTargetError=N\\u00E3o foi poss\\u00EDvel resolver o destino de navega\\u00E7\\u00E3o.\n#XMSG\nMessage.TilesHaveErrors=Alguns dos blocos ou grupos t\\u00EAm erros ou advert\\u00EAncias. Voc\\u00EA quer mesmo continuar a grava\\u00E7\\u00E3o?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Falha ao resolver o destino de navega\\u00E7\\u00E3o do bloco\\: "{0}".\\n\\n Isto \\u00E9 muito provavelmente causado por uma configura\\u00E7\\u00E3o de conte\\u00FAdo do launchpad do SAP Fiori incorreta ou por uma atribui\\u00E7\\u00E3o de fun\\u00E7\\u00F5es em falta.\\n\\n O bloco "{0}" ser\\u00E1 exibido para o usu\\u00E1rio, mas o usu\\u00E1rio n\\u00E3o poder\\u00E1 navegar utilizando este bloco.\n#XMSG\nMessage.DeleteGroup=Eliminar o grupo "{0}"?\n#XMSG\nMessage.PageIsOutdated=J\\u00E1 foi gravada uma vers\\u00E3o mais recente dessa p\\u00E1gina.\n#XMSG\nMessage.SaveChanges=Grave suas modifica\\u00E7\\u00F5es.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nova p\\u00E1gina\n#XTIT\nTitle.TilesHaveErrors=Os blocos t\\u00EAm erros\n#XTIT\nDeleteDialog.Title=Eliminar\n#XMSG\nDeleteDialog.Text=Voc\\u00EA quer mesmo eliminar a p\\u00E1gina selecionada?\n#XBUT\nDeleteDialog.ConfirmButton=Eliminar\n#XTIT\nDeleteDialog.LockedTitle=P\\u00E1gina bloqueada\n#XMSG\nDeleteDialog.LockedText=A p\\u00E1gina selecionada est\\u00E1 bloqueada pelo usu\\u00E1rio {0}.\n#XMSG\nDeleteDialog.TransportRequired=Selecione um transporte para eliminar a p\\u00E1gina selecionada.\n\n#XMSG\nEditDialog.LockedText=A p\\u00E1gina selecionada est\\u00E1 bloqueada pelo usu\\u00E1rio {0}.\n#XMSG\nEditDialog.TransportRequired=Selecione um transporte para processar a p\\u00E1gina selecionada.\n#XTIT\nEditDialog.Title=Processar p\\u00E1gina\n\n#XTIT\nErrorDialog.Title=Erro\n\n#XTIT\nPageOverview.Title=Atualizar p\\u00E1ginas\n\n\n#XTIT\nCopyDialog.Title=Copiar\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Copiar {0}?\n#XFLD\nCopyDialog.NewID=C\\u00F3pia de {0}\n\n\n#XMSG\nTitle.NoGroupTitle=T\\u00EDtulo do grupo {0} est\\u00E1 vazio.\n#XMSG\nTitle.UnsufficientRoles=Atribui\\u00E7\\u00E3o de fun\\u00E7\\u00F5es insuficiente para exibir conte\\u00FAdo\n#XMSG\nTitle.ContentIsNotVisible=O conte\\u00FAdo ser\\u00E1 invis\\u00EDvel para o usu\\u00E1rio.\n#XMSG\nTitle.ContentNotNavigateable=O conte\\u00FAdo n\\u00E3o poder\\u00E1 ser navegado.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ro.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u00CEntre\\u021Binere pagini\n\n\n#XBUT\nButton.Add=Ad\\u0103ugare\n#XBUT\nButton.Cancel=Anulare\n#XBUT\nButton.Copy=Copiere\n#XBUT\nButton.Create=Creare\n#XBUT\nButton.Delete=\\u0218tergere\n#XBUT\nButton.Edit=Editare\n#XBUT\nButton.Save=Salvare\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Comutare cataloage\n#XBUT\nButton.SortCatalogs=Comutare secven\\u021B\\u0103 de sortare catalog\n#XBUT\nButton.CollapseCatalogs=Comprimare toate cataloagele\n#XBUT\nButton.ExpandCatalogs=Expandare toate cataloagele\n#XBUT\nButton.ShowDetails=Afi\\u0219are detalii\n#XBUT\nButton.PagePreview=Previzualizare pagin\\u0103\n\n\n#XTOL\nTooltip.AddToGroups=Ad\\u0103ugare la grupuri\n#XTOL Tooltip for the search button\nTooltip.Search=C\\u0103utare\n#XTOL\nTooltip.SearchForTiles=C\\u0103utare mozaicuri\n\n\n#XFLD\nLabel.PageID=ID pagin\\u0103\n#XFLD\nLabel.WorkbenchRequest=Cerere de workbench\n#XFLD\nLabel.Package=Pachet\n#XFLD\nLabel.TransportInformation=Informa\\u021Bii transport\n#XFLD\nLabel.Details=Detalii\\:\n#XFLD\nLabel.ResponseCode=Cod r\\u0103spuns\\:\n#XFLD\nLabel.Description=Descriere\n#XFLD\nLabel.CreatedBy=Creat de\n#XFLD\nLabel.CreatedOn=Creat pe\n#XFLD\nLabel.ChangedBy=Modificat de\n#XFLD\nLabel.ChangedOn=Modificat pe\n#XFLD\nLabel.PageTitle=Titlu pagin\\u0103\n#XFLD\nLabel.AssignedRole=Rol alocat\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Titlu\n#XCOL\nColumn.PageDescription=Descriere\n#XCOL\nColumn.PageCreatedBy=Creat de\n#XCOL\nColumn.PageCreatedOn=Creat pe\n#XCOL\nColumn.PageChangedBy=Modificat de\n#XCOL\nColumn.PageChangedOn=Modificat pe\n\n\n#XTOL\nPlaceholder.GroupName=Introducere nume grup\n#XTOL\nPlaceholder.SearchForTiles=C\\u0103utare mozaicuri\n\n#MSG\nMessage.NoGroupTitle=Grup {0} nu are un titlu. Pentru a asigura o experien\\u021B\\u0103 de utilizator consistent\\u0103, v\\u0103 recomand\\u0103m s\\u0103 introduce\\u021Bi un nume de grup pentru fiecare grup.\n#XMSG\nMessage.InvalidGroupTitle=Ideal, trebuie s\\u0103 introduce\\u021Bi un nume de grup.\n#XMSG\nMessage.NoInternetConnection=Verifica\\u021Bi conexiunea dvs. la internet.\n#XMSG\nMessage.SavedChanges=Modific\\u0103rile dvs. au fost salvate.\n#XMSG\nMessage.InvalidPageID=Folosi\\u021Bi doar urm\\u0103toarele caractere\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Furniza\\u021Bi ID pagin\\u0103.\n#XMSG\nMessage.EmptyTitle=Furniza\\u021Bi mozaicul.\n#XMSG\nMessage.SuccessDeletePage=Obiectul selectat a fost \\u0219ters.\n#XMSG\nMessage.ClipboardCopySuccess=Detaliile au fost copiate cu succes.\n#YMSE\nMessage.ClipboardCopyFail=A ap\\u0103rut o eroare la copiere detalii.\n#XMSG\nMessage.DeletePageConfirmation=Sigur dori\\u021Bi s\\u0103 \\u0219terge\\u021Bi \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Pagina a fost creat\\u0103.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=F\\u0103r\\u0103 mozaicuri\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=F\\u0103r\\u0103 grupuri\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Eroare la \\u00EEnc\\u0103rcarea mozaicului {0} \\u00EEn grupul "{1}".\\n\\nCel mai probabil, acest lucru a fost cauzat de o configurare de con\\u021Binut launchpad SAP Fiori incorect\\u0103 sau printr-o alocare de rol lips\\u0103.\\n\\nCon\\u021Binutul va fi invizibil pentru utilizator.\\n\\nPentru a rezolva aceast\\u0103 problem\\u0103, verifica\\u021Bi cataloagele \\u0219i map\\u0103rile \\u021Bint\\u0103 alocate la acest rol.\n#XMSG\nMessage.NavigationTargetError=\\u021Ainta de navigare nu a putut fi rezolvat\\u0103.\n#XMSG\nMessage.TilesHaveErrors=C\\u00E2teva dintre mozaicuri sau grupuri au erori sau avertiz\\u0103ri. Sigur dori\\u021Bi s\\u0103 continua\\u021Bi salvarea?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Eroare la rezolvare \\u021Bint\\u0103 de navigare pentru mozaic\\: "{0}".\\n\\n Cel mai probabil este cauzat\\u0103 de configurare de con\\u021Binut launchpad SAP Fiori incorect\\u0103 sau de o alocare de rol lips\\u0103.\\n\\n Mozaicul "{0}" va fi afi\\u0219at pentru utilizator, dar utilizatorul nu va putea naviga folosind acest mozaic.\n#XMSG\nMessage.DeleteGroup=Sigur dori\\u021Bi s\\u0103 \\u0219terge\\u021Bi grupul "{0}"?\n#XMSG\nMessage.PageIsOutdated=O versiune mai nou\\u0103 a acestei pagini a fost salvat\\u0103 deja.\n#XMSG\nMessage.SaveChanges=Salva\\u021Bi modific\\u0103rile dvs.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Pagin\\u0103 nou\\u0103\n#XTIT\nTitle.TilesHaveErrors=Mozaicurile au erori\n#XTIT\nDeleteDialog.Title=\\u0218tergere\n#XMSG\nDeleteDialog.Text=Sigur dori\\u021Bi s\\u0103 \\u0219terge\\u021Bi pagina selectat\\u0103?\n#XBUT\nDeleteDialog.ConfirmButton=\\u015Etergere\n#XTIT\nDeleteDialog.LockedTitle=Pagin\\u0103 blocat\\u0103\n#XMSG\nDeleteDialog.LockedText=Pagina selectat\\u0103 este blocat\\u0103 de utilizatorul {0}.\n#XMSG\nDeleteDialog.TransportRequired=Selecta\\u021Bi un transport pentru a \\u0219terge pagina selectat\\u0103.\n\n#XMSG\nEditDialog.LockedText=Pagina selectat\\u0103 este blocat\\u0103 de utilizatorul {0}.\n#XMSG\nEditDialog.TransportRequired=Selecta\\u021Bi un transport pentru a edita pagina selectat\\u0103.\n#XTIT\nEditDialog.Title=Editare pagin\\u0103\n\n#XTIT\nErrorDialog.Title=Eroare\n\n#XTIT\nPageOverview.Title=\\u00CEntre\\u021Binere pagini\n\n\n#XTIT\nCopyDialog.Title=Copiere\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Dori\\u021Bi s\\u0103 copia\\u021Bi {0}?\n#XFLD\nCopyDialog.NewID=Copie pentru {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Titlu de grup pentru grupul {0} este gol.\n#XMSG\nTitle.UnsufficientRoles=Alocare rol insuficient pentru afi\\u0219are consim\\u021B\\u0103m\\u00E2nt\n#XMSG\nTitle.ContentIsNotVisible=Con\\u021Binutul va fi invizibil pentru utilizator.\n#XMSG\nTitle.ContentNotNavigateable=Con\\u021Binutul nu va putea fi navigat.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_ru.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u0412\\u0435\\u0434\\u0435\\u043D\\u0438\\u0435 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\n\n\n#XBUT\nButton.Add=\\u0414\\u043E\\u0431\\u0430\\u0432\\u0438\\u0442\\u044C\n#XBUT\nButton.Cancel=\\u041E\\u0442\\u043C\\u0435\\u043D\\u0438\\u0442\\u044C\n#XBUT\nButton.Copy=\\u0421\\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u0442\\u044C\n#XBUT\nButton.Create=\\u0421\\u043E\\u0437\\u0434\\u0430\\u0442\\u044C\n#XBUT\nButton.Delete=\\u0423\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C\n#XBUT\nButton.Edit=\\u041E\\u0431\\u0440\\u0430\\u0431\\u043E\\u0442\\u0430\\u0442\\u044C\n#XBUT\nButton.Save=\\u0421\\u043E\\u0445\\u0440\\u0430\\u043D\\u0438\\u0442\\u044C\n#XBUT\nButton.Ok=\\u041E\\u041A\n#XBUT\nButton.ShowCatalogs=\\u041F\\u0435\\u0440\\u0435\\u043A\\u043B\\u044E\\u0447\\u0438\\u0442\\u044C \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.SortCatalogs=\\u041F\\u0435\\u0440\\u0435\\u043A\\u043B\\u044E\\u0447\\u0438\\u0442\\u044C \\u0441\\u043E\\u0440\\u0442\\u0438\\u0440\\u043E\\u0432\\u043A\\u0443 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u043E\\u0432\n#XBUT\nButton.CollapseCatalogs=\\u0421\\u0432\\u0435\\u0440\\u043D\\u0443\\u0442\\u044C \\u0432\\u0441\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.ExpandCatalogs=\\u0420\\u0430\\u0437\\u0432\\u0435\\u0440\\u043D\\u0443\\u0442\\u044C \\u0432\\u0441\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.ShowDetails=\\u041F\\u043E\\u043A\\u0430\\u0437\\u0430\\u0442\\u044C \\u0441\\u0432\\u0435\\u0434\\u0435\\u043D\\u0438\\u044F\n#XBUT\nButton.PagePreview=\\u041F\\u0440\\u0435\\u0434\\u043F\\u0440\\u043E\\u0441\\u043C\\u043E\\u0442\\u0440 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B\n\n\n#XTOL\nTooltip.AddToGroups=\\u0414\\u043E\\u0431\\u0430\\u0432\\u0438\\u0442\\u044C \\u0432 \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B\n#XTOL Tooltip for the search button\nTooltip.Search=\\u041F\\u043E\\u0438\\u0441\\u043A\n#XTOL\nTooltip.SearchForTiles=\\u041F\\u043E\\u0438\\u0441\\u043A \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n\n\n#XFLD\nLabel.PageID=\\u0418\\u0434. \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B\n#XFLD\nLabel.WorkbenchRequest=\\u0417\\u0430\\u043F\\u0440\\u043E\\u0441 \\u043A \\u0438\\u043D\\u0441\\u0442\\u0440\\u0443\\u043C\\u0435\\u043D\\u0442\\u0430\\u043B\\u044C\\u043D\\u044B\\u043C \\u0441\\u0440\\u0435\\u0434\\u0441\\u0442\\u0432\\u0430\\u043C\n#XFLD\nLabel.Package=\\u041F\\u0430\\u043A\\u0435\\u0442\n#XFLD\nLabel.TransportInformation=\\u0418\\u043D\\u0444\\u043E\\u0440\\u043C\\u0430\\u0446\\u0438\\u044F \\u043E \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0435\n#XFLD\nLabel.Details=\\u0421\\u0432\\u0435\\u0434\\u0435\\u043D\\u0438\\u044F\\:\n#XFLD\nLabel.ResponseCode=\\u041A\\u043E\\u0434 \\u043E\\u0442\\u0432\\u0435\\u0442\\u0430\\:\n#XFLD\nLabel.Description=\\u041E\\u043F\\u0438\\u0441\\u0430\\u043D\\u0438\\u0435\n#XFLD\nLabel.CreatedBy=\\u0421\\u043E\\u0437\\u0434\\u0430\\u043B\n#XFLD\nLabel.CreatedOn=\\u0414\\u0430\\u0442\\u0430 \\u0441\\u043E\\u0437\\u0434\\u0430\\u043D\\u0438\\u044F\n#XFLD\nLabel.ChangedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F\n#XFLD\nLabel.ChangedOn=\\u0414\\u0430\\u0442\\u0430 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F\n#XFLD\nLabel.PageTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B\n#XFLD\nLabel.AssignedRole=\\u041F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0435\\u043D\\u043D\\u0430\\u044F \\u0440\\u043E\\u043B\\u044C\n\n\n#XCOL\nColumn.PageID=\\u0418\\u0434\\u0435\\u043D\\u0442\\u0438\\u0444\\u0438\\u043A\\u0430\\u0442\\u043E\\u0440\n#XCOL\nColumn.PageTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A\n#XCOL\nColumn.PageDescription=\\u041E\\u043F\\u0438\\u0441\\u0430\\u043D\\u0438\\u0435\n#XCOL\nColumn.PageCreatedBy=\\u0421\\u043E\\u0437\\u0434\\u0430\\u043B\n#XCOL\nColumn.PageCreatedOn=\\u0414\\u0430\\u0442\\u0430 \\u0441\\u043E\\u0437\\u0434\\u0430\\u043D\\u0438\\u044F\n#XCOL\nColumn.PageChangedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F\n#XCOL\nColumn.PageChangedOn=\\u0414\\u0430\\u0442\\u0430 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F\n\n\n#XTOL\nPlaceholder.GroupName=\\u0412\\u0432\\u0435\\u0441\\u0442\\u0438 \\u0438\\u043C\\u044F \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B\n#XTOL\nPlaceholder.SearchForTiles=\\u041F\\u043E\\u0438\\u0441\\u043A \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n\n#MSG\nMessage.NoGroupTitle=\\u0413\\u0440\\u0443\\u043F\\u043F\\u0430 {0} \\u043D\\u0435 \\u0438\\u043C\\u0435\\u0435\\u0442 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043A\\u0430. \\u0412\\u043E \\u0438\\u0437\\u0431\\u0435\\u0436\\u0430\\u043D\\u0438\\u0435 \\u043F\\u0440\\u043E\\u0442\\u0438\\u0432\\u043E\\u0440\\u0435\\u0447\\u0438\\u0432\\u043E\\u0441\\u0442\\u0435\\u0439 \\u0432\\u043E \\u0432\\u0440\\u0435\\u043C\\u044F \\u0440\\u0430\\u0431\\u043E\\u0442\\u044B \\u0440\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u0435\\u0442\\u0441\\u044F \\u0443\\u043A\\u0430\\u0437\\u0430\\u0442\\u044C \\u0438\\u043C\\u044F \\u0434\\u043B\\u044F \\u043A\\u0430\\u0436\\u0434\\u043E\\u0439 \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B.\n#XMSG\nMessage.InvalidGroupTitle=\\u041D\\u0435\\u043E\\u0431\\u0445\\u043E\\u0434\\u0438\\u043C\\u043E \\u0432\\u0432\\u0435\\u0441\\u0442\\u0438 \\u0438\\u043C\\u044F \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B.\n#XMSG\nMessage.NoInternetConnection=\\u041F\\u0440\\u043E\\u0432\\u0435\\u0440\\u044C\\u0442\\u0435 \\u0438\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442-\\u0441\\u043E\\u0435\\u0434\\u0438\\u043D\\u0435\\u043D\\u0438\\u0435.\n#XMSG\nMessage.SavedChanges=\\u0412\\u0430\\u0448\\u0438 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F \\u0441\\u043E\\u0445\\u0440\\u0430\\u043D\\u0435\\u043D\\u044B.\n#XMSG\nMessage.InvalidPageID=\\u041C\\u043E\\u0436\\u043D\\u043E \\u0438\\u0441\\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u044C \\u0442\\u043E\\u043B\\u044C\\u043A\\u043E \\u0441\\u043B\\u0435\\u0434\\u0443\\u044E\\u0449\\u0438\\u0435 \\u0441\\u0438\\u043C\\u0432\\u043E\\u043B\\u044B\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u0438\\u0434. \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B.\n#XMSG\nMessage.EmptyTitle=\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A.\n#XMSG\nMessage.SuccessDeletePage=\\u0412\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u044B\\u0439 \\u043E\\u0431\\u044A\\u0435\\u043A\\u0442 \\u0443\\u0434\\u0430\\u043B\\u0435\\u043D.\n#XMSG\nMessage.ClipboardCopySuccess=\\u0421\\u0432\\u0435\\u0434\\u0435\\u043D\\u0438\\u044F \\u0441\\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u044B.\n#YMSE\nMessage.ClipboardCopyFail=\\u041F\\u0440\\u0438 \\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0438\\u0438 \\u0441\\u0432\\u0435\\u0434\\u0435\\u043D\\u0438\\u0439 \\u043F\\u0440\\u043E\\u0438\\u0437\\u043E\\u0448\\u043B\\u0430 \\u043E\\u0448\\u0438\\u0431\\u043A\\u0430.\n#XMSG\nMessage.DeletePageConfirmation=\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0442\\u0435\\u043B\\u044C\\u043D\\u043E \\u0443\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C \\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0441\\u043E\\u0437\\u0434\\u0430\\u043D\\u0430.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u041D\\u0435\\u0442 \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u041D\\u0435\\u0442 \\u0433\\u0440\\u0443\\u043F\\u043F\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u041D\\u0435 \\u0443\\u0434\\u0430\\u043B\\u043E\\u0441\\u044C \\u0437\\u0430\\u0433\\u0440\\u0443\\u0437\\u0438\\u0442\\u044C \\u043F\\u043B\\u0438\\u0442\\u043A\\u0443 {0} \\u0432 \\u0433\\u0440\\u0443\\u043F\\u043F\\u0443 "{1}".\\n\\n\\u0421\\u043A\\u043E\\u0440\\u0435\\u0435 \\u0432\\u0441\\u0435\\u0433\\u043E, \\u044D\\u0442\\u043E\\u0433\\u043E \\u0432\\u044B\\u0437\\u0432\\u0430\\u043D\\u043E \\u043D\\u0435\\u043F\\u0440\\u0430\\u0432\\u0438\\u043B\\u044C\\u043D\\u043E\\u0439 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u0435\\u0439 \\u043A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442\\u0430 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0438 \\u0437\\u0430\\u043F\\u0443\\u0441\\u043A\\u0430 SAP Fiori \\u0438\\u043B\\u0438 \\u043E\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435\\u043C \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0435\\u043D\\u0438\\u044F \\u0440\\u043E\\u043B\\u0438.\\n\\n\\u041A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0438\\u043C\\u044B\\u043C \\u0434\\u043B\\u044F \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u044F.\\n\\n\\u0414\\u043B\\u044F \\u0440\\u0435\\u0448\\u0435\\u043D\\u0438\\u044F \\u044D\\u0442\\u043E\\u0439 \\u043F\\u0440\\u043E\\u0431\\u043B\\u0435\\u043C\\u044B \\u043F\\u0440\\u043E\\u0432\\u0435\\u0440\\u044C\\u0442\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438 \\u0438 \\u0441\\u043E\\u043F\\u043E\\u0441\\u0442\\u0430\\u0432\\u043B\\u0435\\u043D\\u0438\\u044F \\u0446\\u0435\\u043B\\u0435\\u0439, \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0435\\u043D\\u043D\\u044B\\u0435 \\u044D\\u0442\\u043E\\u0439 \\u0440\\u043E\\u043B\\u0438.\n#XMSG\nMessage.NavigationTargetError=\\u041D\\u0435 \\u0443\\u0434\\u0430\\u043B\\u043E\\u0441\\u044C \\u0440\\u0430\\u0437\\u0432\\u0435\\u0440\\u043D\\u0443\\u0442\\u044C \\u0446\\u0435\\u043B\\u044C \\u043D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u0438.\n#XMSG\nMessage.TilesHaveErrors=\\u041D\\u0435\\u043A\\u043E\\u0442\\u043E\\u0440\\u044B\\u0435 \\u043F\\u043B\\u0438\\u0442\\u043A\\u0438 \\u0438\\u043B\\u0438 \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B \\u0441\\u043E\\u0434\\u0435\\u0440\\u0436\\u0430\\u0442 \\u043E\\u0448\\u0438\\u0431\\u043A\\u0438 \\u0438\\u043B\\u0438 \\u043F\\u0440\\u0435\\u0434\\u0443\\u043F\\u0440\\u0435\\u0436\\u0434\\u0435\\u043D\\u0438\\u044F. \\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0442\\u0435\\u043B\\u044C\\u043D\\u043E \\u043F\\u0440\\u043E\\u0434\\u043E\\u043B\\u0436\\u0438\\u0442\\u044C \\u0441\\u043E\\u0445\\u0440\\u0430\\u043D\\u0435\\u043D\\u0438\\u0435?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u041D\\u0435 \\u0443\\u0434\\u0430\\u043B\\u043E\\u0441\\u044C \\u0440\\u0430\\u0437\\u0432\\u0435\\u0440\\u043D\\u0443\\u0442\\u044C \\u0446\\u0435\\u043B\\u044C \\u043D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u0438 \\u0434\\u043B\\u044F \\u043F\\u043B\\u0438\\u0442\\u043A\\u0438\\: "{0}".\\n\\n \\u0421\\u043A\\u043E\\u0440\\u0435\\u0435 \\u0432\\u0441\\u0435\\u0433\\u043E \\u044D\\u0442\\u043E \\u0432\\u044B\\u0437\\u0432\\u0430\\u043D\\u043E \\u043D\\u0435\\u043F\\u0440\\u0430\\u0432\\u0438\\u043B\\u044C\\u043D\\u043E\\u0439 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u0435\\u0439 \\u043A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442\\u0430 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0438 \\u0437\\u0430\\u043F\\u0443\\u0441\\u043A\\u0430 SAP Fiori \\u0438\\u043B\\u0438 \\u043E\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435\\u043C \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0435\\u043D\\u0438\\u044F \\u0440\\u043E\\u043B\\u0438.\\n\\n \\u041F\\u043B\\u0438\\u0442\\u043A\\u0430 "{0}" \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0432\\u0438\\u0434\\u0438\\u043C\\u0430 \\u0434\\u043B\\u044F \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u044F, \\u043D\\u043E \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u044C \\u043D\\u0435 \\u0441\\u043C\\u043E\\u0436\\u0435\\u0442 \\u0438\\u0441\\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u044C \\u0435\\u0435 \\u0434\\u043B\\u044F \\u043D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u0438.\n#XMSG\nMessage.DeleteGroup=\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0442\\u0435\\u043B\\u044C\\u043D\\u043E \\u0443\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C \\u0433\\u0440\\u0443\\u043F\\u043F\\u0443 "{0}" ?\n#XMSG\nMessage.PageIsOutdated=\\u041D\\u043E\\u0432\\u0430\\u044F \\u0432\\u0435\\u0440\\u0441\\u0438\\u044F \\u044D\\u0442\\u043E\\u0439 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B \\u0443\\u0436\\u0435 \\u0441\\u043E\\u0445\\u0440\\u0430\\u043D\\u0435\\u043D\\u0430.\n#XMSG\nMessage.SaveChanges=\\u0421\\u043E\\u0445\\u0440\\u0430\\u043D\\u0438\\u0442\\u0435 \\u0441\\u0432\\u043E\\u0438 \\u0438\\u0437\\u043C\\u0435\\u043D\\u0435\\u043D\\u0438\\u044F.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u041D\\u043E\\u0432\\u0430\\u044F \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n#XTIT\nTitle.TilesHaveErrors=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0438 \\u0441\\u043E\\u0434\\u0435\\u0440\\u0436\\u0430\\u0442 \\u043E\\u0448\\u0438\\u0431\\u043A\\u0438\n#XTIT\nDeleteDialog.Title=\\u0423\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C\n#XMSG\nDeleteDialog.Text=\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0442\\u0435\\u043B\\u044C\\u043D\\u043E \\u0443\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C \\u0432\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u0443\\u044E \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0423\\u0434\\u0430\\u043B\\u0438\\u0442\\u044C\n#XTIT\nDeleteDialog.LockedTitle=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0430\n#XMSG\nDeleteDialog.LockedText=\\u0412\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u0430\\u044F \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0430 \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u0435\\u043C {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u0412\\u044B\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441 \\u0434\\u043B\\u044F \\u0443\\u0434\\u0430\\u043B\\u0435\\u043D\\u0438\\u044F \\u0432\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u043E\\u0439 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B.\n\n#XMSG\nEditDialog.LockedText=\\u0412\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u0430\\u044F \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0430 \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u0435\\u043C {0}.\n#XMSG\nEditDialog.TransportRequired=\\u0412\\u044B\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441 \\u0434\\u043B\\u044F \\u0440\\u0435\\u0434\\u0430\\u043A\\u0442\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0438\\u044F \\u0432\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u043E\\u0439 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u044B.\n#XTIT\nEditDialog.Title=\\u0420\\u0435\\u0434\\u0430\\u043A\\u0442\\u0438\\u0440\\u043E\\u0432\\u0430\\u0442\\u044C \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443\n\n#XTIT\nErrorDialog.Title=\\u041E\\u0448\\u0438\\u0431\\u043A\\u0430\n\n#XTIT\nPageOverview.Title=\\u0412\\u0435\\u0434\\u0435\\u043D\\u0438\\u0435 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\n\n\n#XTIT\nCopyDialog.Title=\\u0421\\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u0442\\u044C\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0421\\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u0442\\u044C {0}?\n#XFLD\nCopyDialog.NewID=\\u041A\\u043E\\u043F\\u0438\\u044F {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A \\u0433\\u0440\\u0443\\u043F\\u043F\\u044B {0} \\u043F\\u0443\\u0441\\u0442.\n#XMSG\nTitle.UnsufficientRoles=\\u041F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0435\\u043D\\u0438\\u0435 \\u043D\\u0435\\u0434\\u043E\\u0441\\u0442\\u0430\\u0442\\u043E\\u0447\\u043D\\u043E\\u0439 \\u0440\\u043E\\u043B\\u0438 \\u0434\\u043B\\u044F \\u043F\\u0440\\u043E\\u0441\\u043C\\u043E\\u0442\\u0440\\u0430 \\u043A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442\\u0430\n#XMSG\nTitle.ContentIsNotVisible=\\u041A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0438\\u043C\\u044B\\u043C \\u0434\\u043B\\u044F \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u044F.\n#XMSG\nTitle.ContentNotNavigateable=\\u041D\\u0430\\u0432\\u0438\\u0433\\u0430\\u0446\\u0438\\u044F \\u043A \\u043A\\u043E\\u043D\\u0442\\u0435\\u043D\\u0442\\u0443 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u043D\\u0435\\u0432\\u043E\\u0437\\u043C\\u043E\\u0436\\u043D\\u0430.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_sh.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Odr\\u017Eavaj stranice\n\n\n#XBUT\nButton.Add=Dodaj\n#XBUT\nButton.Cancel=Odustani\n#XBUT\nButton.Copy=Kopiraj\n#XBUT\nButton.Create=Kreiraj\n#XBUT\nButton.Delete=Izbri\\u0161i\n#XBUT\nButton.Edit=Uredi\n#XBUT\nButton.Save=Sa\\u010Duvaj\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Zameni kataloge\n#XBUT\nButton.SortCatalogs=Zameni redosled re\\u0111anja kataloga\n#XBUT\nButton.CollapseCatalogs=Sa\\u017Emi sve kataloge\n#XBUT\nButton.ExpandCatalogs=Pro\\u0161iri sve kataloge\n#XBUT\nButton.ShowDetails=Poka\\u017Ei detalje\n#XBUT\nButton.PagePreview=Prethodni prikaz stranice\n\n\n#XTOL\nTooltip.AddToGroups=Dodaj grupama\n#XTOL Tooltip for the search button\nTooltip.Search=Tra\\u017Ei\n#XTOL\nTooltip.SearchForTiles=Tra\\u017Ei podekrane\n\n\n#XFLD\nLabel.PageID=ID stranice\n#XFLD\nLabel.WorkbenchRequest=Zahtev za radno okru\\u017Eenje\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Informacije o prenosu\n#XFLD\nLabel.Details=Detalji\\:\n#XFLD\nLabel.ResponseCode=\\u0160ifra odgovora\\:\n#XFLD\nLabel.Description=Opis\n#XFLD\nLabel.CreatedBy=Kreirao\n#XFLD\nLabel.CreatedOn=Kreirano\n#XFLD\nLabel.ChangedBy=Promenio\n#XFLD\nLabel.ChangedOn=Promenjeno\n#XFLD\nLabel.PageTitle=Naslov stranice\n#XFLD\nLabel.AssignedRole=Dodeljena uloga\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Naslov\n#XCOL\nColumn.PageDescription=Opis\n#XCOL\nColumn.PageCreatedBy=Kreirao\n#XCOL\nColumn.PageCreatedOn=Kreirano\n#XCOL\nColumn.PageChangedBy=Promenio\n#XCOL\nColumn.PageChangedOn=Promenjeno\n\n\n#XTOL\nPlaceholder.GroupName=Unesite naziv grupe\n#XTOL\nPlaceholder.SearchForTiles=Tra\\u017Ei podekrane\n\n#MSG\nMessage.NoGroupTitle=Grupa {0} nema naslov. Da biste osigurali dosledno korisni\\u010Dko iskustvo, preporu\\u010Dujemo da unesete naziv grupe za svaku grupu.\n#XMSG\nMessage.InvalidGroupTitle=Idealno bi bilo da unesete naziv grupe.\n#XMSG\nMessage.NoInternetConnection=Proverite internet vezu.\n#XMSG\nMessage.SavedChanges=Va\\u0161e promene su sa\\u010Duvane.\n#XMSG\nMessage.InvalidPageID=Koristite samo slede\\u0107e znakove\\: A-\\u0160 a-\\u0161 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Navedite ID stranice.\n#XMSG\nMessage.EmptyTitle=Navedite naslov.\n#XMSG\nMessage.SuccessDeletePage=Odabrani objekat je izbrisan.\n#XMSG\nMessage.ClipboardCopySuccess=Detalji su uspe\\u0161no kopirani.\n#YMSE\nMessage.ClipboardCopyFail=Gre\\u0161ka pri kopiranju detalja.\n#XMSG\nMessage.DeletePageConfirmation=Da li zaista \\u017Eelite da izbri\\u0161ete \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Stranica je kreirana.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Nema podekrana\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Nema grupa\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Nije uspelo u\\u010Ditavanje {0} podekrana u grupi "{1}".\\n\\nNajverovatniji uzrok je neta\\u010Dna konfiguracija sadr\\u017Eaja SAP Fiori launchpad-a ili nepostojanje dodele uloge.\\n\\nSadr\\u017Eaj \\u0107e biti nevidljiv korisniku.\\n\\nDa biste re\\u0161ili ovaj problem, proverite kataloge i ciljna preslikavanja dodeljena ovoj ulozi.\n#XMSG\nMessage.NavigationTargetError=Cilj usmeravanja se ne mo\\u017Ee razre\\u0161iti.\n#XMSG\nMessage.TilesHaveErrors=Neki podekrani ili grupe imaju gre\\u0161ke ili upozorenja. Da li sigurno \\u017Eelite da nastavite sa snimanjem?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Nije uspelo razre\\u0161enje cilja usmeravanja podekrana\\: "{0}".\\n\\n Najverovatniji uzrok je neta\\u010Dna konfiguracija sadr\\u017Eaja SAP Fiori launchpad-a ili nepostojanje dodele uloge.\\n\\n Podekran "{0}" \\u0107e biti prikazan korisniku, ali korisnik ne\\u0107e mo\\u0107i da usmerava pomo\\u0107u ovog podekrana.\n#XMSG\nMessage.DeleteGroup=Da li sigurno \\u017Eelite da izbri\\u0161ete grupu "{0}"?\n#XMSG\nMessage.PageIsOutdated=Novija verzija ove stranice je ve\\u0107 sa\\u010Duvana.\n#XMSG\nMessage.SaveChanges=Sa\\u010Duvajte svoje promene.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nova stranica\n#XTIT\nTitle.TilesHaveErrors=Podekrani imaju gre\\u0161ke\n#XTIT\nDeleteDialog.Title=Izbri\\u0161i\n#XMSG\nDeleteDialog.Text=Da li sigurno \\u017Eelite da izbri\\u0161ete odabranu stranicu?\n#XBUT\nDeleteDialog.ConfirmButton=Izbri\\u0161i\n#XTIT\nDeleteDialog.LockedTitle=Stranica zaklju\\u010Dana\n#XMSG\nDeleteDialog.LockedText=Odabranu stranicu je zaklju\\u010Dao korisnik {0}.\n#XMSG\nDeleteDialog.TransportRequired=Odaberite prenos za brisanje odabrane stranice.\n\n#XMSG\nEditDialog.LockedText=Odabranu stranicu je zaklju\\u010Dao korisnik {0}.\n#XMSG\nEditDialog.TransportRequired=Odaberite prenos za ure\\u0111ivanje odabrane stranice.\n#XTIT\nEditDialog.Title=Uredi stranicu\n\n#XTIT\nErrorDialog.Title=Gre\\u0161ka\n\n#XTIT\nPageOverview.Title=Odr\\u017Eavaj stranice\n\n\n#XTIT\nCopyDialog.Title=Kopiraj\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Da li \\u017Eelite da kopirate {0}?\n#XFLD\nCopyDialog.NewID=Kopija {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Naslov grupe za grupu {0} je prazan.\n#XMSG\nTitle.UnsufficientRoles=Nedovoljna dodela uloge za prikaz sadr\\u017Eaja\n#XMSG\nTitle.ContentIsNotVisible=Sadr\\u017Eaj \\u0107e biti nevidljiv korisniku.\n#XMSG\nTitle.ContentNotNavigateable=Usmeravanje u sadr\\u017Eaju ne\\u0107e biti mogu\\u0107e.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_sk.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u00DAdr\\u017Eba str\\u00E1nok\n\n\n#XBUT\nButton.Add=Prida\\u0165\n#XBUT\nButton.Cancel=Zru\\u0161i\\u0165\n#XBUT\nButton.Copy=Kop\\u00EDrova\\u0165\n#XBUT\nButton.Create=Vytvori\\u0165\n#XBUT\nButton.Delete=Vymaza\\u0165\n#XBUT\nButton.Edit=Upravi\\u0165\n#XBUT\nButton.Save=Ulo\\u017Ei\\u0165\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=Prepn\\u00FA\\u0165 katal\\u00F3gy\n#XBUT\nButton.SortCatalogs=Prepn\\u00FA\\u0165 poradie triedenia katal\\u00F3gu\n#XBUT\nButton.CollapseCatalogs=Zbali\\u0165 v\\u0161etky katal\\u00F3gy\n#XBUT\nButton.ExpandCatalogs=Rozbali\\u0165 v\\u0161etky katal\\u00F3gy\n#XBUT\nButton.ShowDetails=Zobrazi\\u0165 detaily\n#XBUT\nButton.PagePreview=N\\u00E1h\\u013Ead str\\u00E1nky\n\n\n#XTOL\nTooltip.AddToGroups=Prida\\u0165 k skupin\\u00E1m\n#XTOL Tooltip for the search button\nTooltip.Search=H\\u013Eada\\u0165\n#XTOL\nTooltip.SearchForTiles=H\\u013Eada\\u0165 dla\\u017Edice\n\n\n#XFLD\nLabel.PageID=ID str\\u00E1nky\n#XFLD\nLabel.WorkbenchRequest=Po\\u017Eiadavka na workbench\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Inform\\u00E1cie o transporte\n#XFLD\nLabel.Details=Detaily\\:\n#XFLD\nLabel.ResponseCode=K\\u00F3d odpovede\\:\n#XFLD\nLabel.Description=Popis\n#XFLD\nLabel.CreatedBy=Vytvoril\n#XFLD\nLabel.CreatedOn=Vytvoren\\u00E9 d\\u0148a\n#XFLD\nLabel.ChangedBy=Zmenil\n#XFLD\nLabel.ChangedOn=Zmenen\\u00E9 d\\u0148a\n#XFLD\nLabel.PageTitle=Nadpis str\\u00E1nky\n#XFLD\nLabel.AssignedRole=Priraden\\u00E1 rola\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Nadpis\n#XCOL\nColumn.PageDescription=Popis\n#XCOL\nColumn.PageCreatedBy=Vytvoril\n#XCOL\nColumn.PageCreatedOn=Vytvoren\\u00E9 d\\u0148a\n#XCOL\nColumn.PageChangedBy=Zmenil\n#XCOL\nColumn.PageChangedOn=Zmenen\\u00E9 d\\u0148a\n\n\n#XTOL\nPlaceholder.GroupName=Zadajte n\\u00E1zov skupiny\n#XTOL\nPlaceholder.SearchForTiles=H\\u013Eada\\u0165 dla\\u017Edice\n\n#MSG\nMessage.NoGroupTitle=Skupina {0} nem\\u00E1 n\\u00E1zov. Kv\\u00F4li konzistentn\\u00E9mu pou\\u017E\\u00EDvate\\u013Esk\\u00E9mu prostrediu sa odpor\\u00FA\\u010Da zada\\u0165 n\\u00E1zov pre ka\\u017Ed\\u00FA skupinu.\n#XMSG\nMessage.InvalidGroupTitle=Ide\\u00E1lne je zada\\u0165 n\\u00E1zov skupiny.\n#XMSG\nMessage.NoInternetConnection=Skontrolujte internetov\\u00E9 pripojenie.\n#XMSG\nMessage.SavedChanges=Va\\u0161e zmeny boli ulo\\u017Een\\u00E9.\n#XMSG\nMessage.InvalidPageID=Pou\\u017Eite len nasledovn\\u00E9 znaky\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Zadajte ID str\\u00E1nky.\n#XMSG\nMessage.EmptyTitle=Zadajte nadpis.\n#XMSG\nMessage.SuccessDeletePage=Zvolen\\u00FD objekt bol vymazan\\u00FD.\n#XMSG\nMessage.ClipboardCopySuccess=Detaily boli \\u00FAspe\\u0161ne skop\\u00EDrovan\\u00E9.\n#YMSE\nMessage.ClipboardCopyFail=Pri kop\\u00EDrovan\\u00ED detailov sa vyskytla chyba.\n#XMSG\nMessage.DeletePageConfirmation=Naozaj chcete vymaza\\u0165 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Str\\u00E1nka bola vytvoren\\u00E1.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u017Diadne dla\\u017Edice\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u017Diadne skupiny\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Nepodarilo sa na\\u010D\\u00EDta\\u0165 {0} dla\\u017Edicu v skupine "{1}".\\n\\nJe to pravdepodobne sp\\u00F4soben\\u00E9 nespr\\u00E1vnou konfigur\\u00E1ciou obsahu launchpadu SAP Fiori alebo ch\\u00FDbaj\\u00FAcim priraden\\u00EDm roly.\\n\\nObsah bude pre pou\\u017E\\u00EDvate\\u013Ea nevidite\\u013En\\u00FD.\\n\\nAk chcete tento probl\\u00E9m vyrie\\u0161i\\u0165, skontrolujte katal\\u00F3gy a cie\\u013Eov\\u00E9 mapovania priraden\\u00E9 k tejto role.\n#XMSG\nMessage.NavigationTargetError=Cie\\u013E navig\\u00E1cie sa nepodarilo rozpozna\\u0165.\n#XMSG\nMessage.TilesHaveErrors=Niektor\\u00E9 dla\\u017Edice alebo skupiny obsahuj\\u00FA chyby alebo upozornenia. Naozaj chcete pokra\\u010Dova\\u0165 v ukladan\\u00ED?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Nepodarilo sa rozpozna\\u0165 cie\\u013E navig\\u00E1cie pre dla\\u017Edicu\\: "{0}".\\n\\n Je to pravdepodobne sp\\u00F4soben\\u00E9 nespr\\u00E1vnou konfigur\\u00E1ciou obsahu launchpadu SAP Fiori alebo ch\\u00FDbaj\\u00FAcim priraden\\u00EDm roly.\\n\\n Dla\\u017Edica "{0}" sa pou\\u017E\\u00EDvate\\u013Eovi zobraz\\u00ED, ale pou\\u017E\\u00EDvate\\u013E nebude m\\u00F4c\\u0165 pomocou tejto dla\\u017Edice navigova\\u0165.\n#XMSG\nMessage.DeleteGroup=Naozaj chcete skupinu "{0}" odstr\\u00E1ni\\u0165?\n#XMSG\nMessage.PageIsOutdated=Nov\\u0161ia verzia tejto str\\u00E1nky u\\u017E bola ulo\\u017Een\\u00E1.\n#XMSG\nMessage.SaveChanges=Ulo\\u017Ete svoje zmeny.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nov\\u00E1 str\\u00E1nka\n#XTIT\nTitle.TilesHaveErrors=Dla\\u017Edice obsahuj\\u00FA chyby\n#XTIT\nDeleteDialog.Title=Vymaza\\u0165\n#XMSG\nDeleteDialog.Text=Chcete vybrat\\u00FA str\\u00E1nku naozaj vymaza\\u0165?\n#XBUT\nDeleteDialog.ConfirmButton=Vymaza\\u0165\n#XTIT\nDeleteDialog.LockedTitle=Str\\u00E1nka je zablokovan\\u00E1\n#XMSG\nDeleteDialog.LockedText=Zvolen\\u00FA str\\u00E1nku blokuje pou\\u017E\\u00EDvate\\u013E {0}.\n#XMSG\nDeleteDialog.TransportRequired=Ak chcete zvolen\\u00FA str\\u00E1nku vymaza\\u0165, vyberte transport.\n\n#XMSG\nEditDialog.LockedText=Zvolen\\u00FA str\\u00E1nku blokuje pou\\u017E\\u00EDvate\\u013E {0}.\n#XMSG\nEditDialog.TransportRequired=Ak chcete zvolen\\u00FA str\\u00E1nku upravi\\u0165, vyberte transport.\n#XTIT\nEditDialog.Title=Upravi\\u0165 str\\u00E1nku\n\n#XTIT\nErrorDialog.Title=Chyba\n\n#XTIT\nPageOverview.Title=\\u00DAdr\\u017Eba str\\u00E1nok\n\n\n#XTIT\nCopyDialog.Title=Kop\\u00EDrova\\u0165\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Chcete {0} skop\\u00EDrova\\u0165?\n#XFLD\nCopyDialog.NewID=K\\u00F3pia {0}\n\n\n#XMSG\nTitle.NoGroupTitle=N\\u00E1zov skupiny {0} je pr\\u00E1zdny.\n#XMSG\nTitle.UnsufficientRoles=Nedostato\\u010Dn\\u00E9 priradenie roly na zobrazenie obsahu\n#XMSG\nTitle.ContentIsNotVisible=Obsah bude pre pou\\u017E\\u00EDvate\\u013Ea nevidite\\u013En\\u00FD.\n#XMSG\nTitle.ContentNotNavigateable=Obsah nebude navigovate\\u013En\\u00FD.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_sl.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Vzdr\\u017Eevanje strani\n\n\n#XBUT\nButton.Add=Dodajanje\n#XBUT\nButton.Cancel=Preklic\n#XBUT\nButton.Copy=Kopiranje\n#XBUT\nButton.Create=Kreiranje\n#XBUT\nButton.Delete=Brisanje\n#XBUT\nButton.Edit=Urejanje\n#XBUT\nButton.Save=Shranjevanje\n#XBUT\nButton.Ok=V redu\n#XBUT\nButton.ShowCatalogs=Preklopi kataloge\n#XBUT\nButton.SortCatalogs=Preklop zaporedja razvr\\u0161\\u010Danja kataloga\n#XBUT\nButton.CollapseCatalogs=Skr\\u010Di vse kataloge\n#XBUT\nButton.ExpandCatalogs=Raz\\u0161iri vse kataloge\n#XBUT\nButton.ShowDetails=Prika\\u017Ei detajle\n#XBUT\nButton.PagePreview=Predogled strani\n\n\n#XTOL\nTooltip.AddToGroups=Dodaj skupinam\n#XTOL Tooltip for the search button\nTooltip.Search=Iskanje\n#XTOL\nTooltip.SearchForTiles=Iskanje plo\\u0161\\u010Dic\n\n\n#XFLD\nLabel.PageID=ID strani\n#XFLD\nLabel.WorkbenchRequest=Zahteva za Workbench\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Informacije o transportu\n#XFLD\nLabel.Details=Detajli\\:\n#XFLD\nLabel.ResponseCode=Koda odgovora\\:\n#XFLD\nLabel.Description=Opis\n#XFLD\nLabel.CreatedBy=Kreiral\n#XFLD\nLabel.CreatedOn=Kreirano dne\n#XFLD\nLabel.ChangedBy=Spremenil\n#XFLD\nLabel.ChangedOn=Spremenjeno dne\n#XFLD\nLabel.PageTitle=Naslov strani\n#XFLD\nLabel.AssignedRole=Dodeljena vloga\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Naslov\n#XCOL\nColumn.PageDescription=Opis\n#XCOL\nColumn.PageCreatedBy=Kreiral\n#XCOL\nColumn.PageCreatedOn=Kreirano dne\n#XCOL\nColumn.PageChangedBy=Spremenil\n#XCOL\nColumn.PageChangedOn=Spremenjeno dne\n\n\n#XTOL\nPlaceholder.GroupName=Vnesi ime skupine\n#XTOL\nPlaceholder.SearchForTiles=Iskanje plo\\u0161\\u010Dic\n\n#MSG\nMessage.NoGroupTitle=Skupina {0} nima naslova. Za zagotovitev dosledne uporabni\\u0161ke izku\\u0161nje priporo\\u010Damo, da za vsako skupino vnesete ime.\n#XMSG\nMessage.InvalidGroupTitle=\\u010Ce je mogo\\u010De, vnesite ime skupine.\n#XMSG\nMessage.NoInternetConnection=Prosim, preverite svojo internetno povezavo.\n#XMSG\nMessage.SavedChanges=Va\\u0161e spremembe so bile shranjene.\n#XMSG\nMessage.InvalidPageID=Prosim, uporabite le naslednje znake\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Prosim, navedite ID strani.\n#XMSG\nMessage.EmptyTitle=Prosim, navedite naslov.\n#XMSG\nMessage.SuccessDeletePage=Izbrani objekt je bil izbrisan.\n#XMSG\nMessage.ClipboardCopySuccess=Detajli so bili uspe\\u0161no kopirani.\n#YMSE\nMessage.ClipboardCopyFail=Pri kopiranju detajlov je pri\\u0161lo do napake.\n#XMSG\nMessage.DeletePageConfirmation=\\u017Delite res izbrisati\\n {0} {1}?\n#XMSG\nMessage.PageCreated=Stran je bila kreirana.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Brez plo\\u0161\\u010Dic\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Ni skupin\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Plo\\u0161\\u010Dice {0} v skupini "{1}" ni uspelo nalo\\u017Eiti.\\n\\nRazlog je verjetno nepravilna konfiguracija vsebine SAP Fiori Launchpada ali manjkajo\\u010Da dodelitev vlog.\\n\\nVsebina ne bo vidna uporabniku.\\n\\nDa odpravite to te\\u017Eavo, preverite kataloge in preslikave ciljev, dodeljene tej vlogi.\n#XMSG\nMessage.NavigationTargetError=Cilja navigacije ni bilo mogo\\u010De razre\\u0161iti.\n#XMSG\nMessage.TilesHaveErrors=Nekatere plo\\u0161\\u010Dice ali skupine imajo napake ali opozorila. Res \\u017Eelite nadaljevati shranjevanje?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Cilja navigacije plo\\u0161\\u010Dice ni bilo mogo\\u010De razre\\u0161iti\\: "{0}".\\n\\n Razlog je verjetno nepravilna konfiguracija vsebine SAP Fiori Launchpada ali manjkajo\\u010Da dodelitev vlog.\\n\\n Plo\\u0161\\u010Dica "{0}" bo prikazana uporabniku, vendar uporabnik ne bo mogel navigirati s to plo\\u0161\\u010Dico.\n#XMSG\nMessage.DeleteGroup=Res \\u017Eelite izbrisati skupino "{0}"?\n#XMSG\nMessage.PageIsOutdated=Novej\\u0161a verzija te strani je bila \\u017Ee shranjena.\n#XMSG\nMessage.SaveChanges=Prosim, shranite svoje spremembe.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Nova stran\n#XTIT\nTitle.TilesHaveErrors=Plo\\u0161\\u010Dice imajo napake\n#XTIT\nDeleteDialog.Title=Brisanje\n#XMSG\nDeleteDialog.Text=Res \\u017Eelite izbrisati izbrano stran?\n#XBUT\nDeleteDialog.ConfirmButton=Brisanje\n#XTIT\nDeleteDialog.LockedTitle=Stran blokirana\n#XMSG\nDeleteDialog.LockedText=Izbrano stran je blokiral uporabnik {0}.\n#XMSG\nDeleteDialog.TransportRequired=Prosim, izberite transport za brisanje izbrane strani.\n\n#XMSG\nEditDialog.LockedText=Izbrano stran je blokiral uporabnik {0}.\n#XMSG\nEditDialog.TransportRequired=Prosim, izberite transport za obdelavo izbrane strani.\n#XTIT\nEditDialog.Title=Obdelava strani\n\n#XTIT\nErrorDialog.Title=Napaka\n\n#XTIT\nPageOverview.Title=Vzdr\\u017Eevanje strani\n\n\n#XTIT\nCopyDialog.Title=Kopiranje\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u017Delite kopirati {0}?\n#XFLD\nCopyDialog.NewID=Kopiranje {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Naslov skupine za skupino {0} je prazen.\n#XMSG\nTitle.UnsufficientRoles=Nezadostna dodelitev vloge za prikaz vsebine\n#XMSG\nTitle.ContentIsNotVisible=Vsebina ne bo vidna uporabniku.\n#XMSG\nTitle.ContentNotNavigateable=Navigacija po vsebini ne bo mogo\\u010Da.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_sr.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u041E\\u0434\\u0440\\u0436\\u0430\\u0432\\u0430\\u0458 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435\n\n\n#XBUT\nButton.Add=\\u0414\\u043E\\u0434\\u0430\\u0458\n#XBUT\nButton.Cancel=\\u041E\\u0434\\u0443\\u0441\\u0442\\u0430\\u043D\\u0438\n#XBUT\nButton.Copy=\\u041A\\u043E\\u043F\\u0438\\u0440\\u0430\\u0458\n#XBUT\nButton.Create=\\u041A\\u0440\\u0435\\u0438\\u0440\\u0430\\u0458\n#XBUT\nButton.Delete=\\u0418\\u0437\\u0431\\u0440\\u0438\\u0448\\u0438\n#XBUT\nButton.Edit=\\u0423\\u0440\\u0435\\u0434\\u0438\n#XBUT\nButton.Save=\\u0421\\u0430\\u0447\\u0443\\u0432\\u0430\\u0458\n#XBUT\nButton.Ok=\\u041E\\u041A\n#XBUT\nButton.ShowCatalogs=\\u0417\\u0430\\u043C\\u0435\\u043D\\u0438 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0435\n#XBUT\nButton.SortCatalogs=\\u0417\\u0430\\u043C\\u0435\\u043D\\u0438 \\u0440\\u0435\\u0434\\u043E\\u0441\\u043B\\u0435\\u0434 \\u0440\\u0435\\u0452\\u0430\\u045A\\u0430 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0430\n#XBUT\nButton.CollapseCatalogs=\\u0421\\u0430\\u0436\\u043C\\u0438 \\u0441\\u0432\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0435\n#XBUT\nButton.ExpandCatalogs=\\u041F\\u0440\\u043E\\u0448\\u0438\\u0440\\u0438 \\u0441\\u0432\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0435\n#XBUT\nButton.ShowDetails=\\u041F\\u043E\\u043A\\u0430\\u0436\\u0438 \\u0434\\u0435\\u0442\\u0430\\u0459\\u0435\n#XBUT\nButton.PagePreview=\\u041F\\u0440\\u0435\\u0442\\u0445\\u043E\\u0434\\u043D\\u0438 \\u043F\\u0440\\u0438\\u043A\\u0430\\u0437 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435\n\n\n#XTOL\nTooltip.AddToGroups=\\u0414\\u043E\\u0434\\u0430\\u0458 \\u0433\\u0440\\u0443\\u043F\\u0430\\u043C\\u0430\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0422\\u0440\\u0430\\u0436\\u0438\n#XTOL\nTooltip.SearchForTiles=\\u0422\\u0440\\u0430\\u0436\\u0438 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0435\n\n\n#XFLD\nLabel.PageID=ID \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435\n#XFLD\nLabel.WorkbenchRequest=\\u0417\\u0430\\u0445\\u0442\\u0435\\u0432 \\u0437\\u0430 \\u0440\\u0430\\u0434\\u043D\\u043E \\u043E\\u043A\\u0440\\u0443\\u0436\\u0435\\u045A\\u0435\n#XFLD\nLabel.Package=\\u041F\\u0430\\u043A\\u0435\\u0442\n#XFLD\nLabel.TransportInformation=\\u0418\\u043D\\u0444\\u043E\\u0440\\u043C\\u0430\\u0446\\u0438\\u0458\\u0435 \\u043E \\u043F\\u0440\\u0435\\u043D\\u043E\\u0441\\u0443\n#XFLD\nLabel.Details=\\u0414\\u0435\\u0442\\u0430\\u0459\\u0438\\:\n#XFLD\nLabel.ResponseCode=\\u0428\\u0438\\u0444\\u0440\\u0430 \\u043E\\u0434\\u0433\\u043E\\u0432\\u043E\\u0440\\u0430\\:\n#XFLD\nLabel.Description=\\u041E\\u043F\\u0438\\u0441\n#XFLD\nLabel.CreatedBy=\\u041A\\u0440\\u0435\\u0438\\u0440\\u0430\\u043E\n#XFLD\nLabel.CreatedOn=\\u041A\\u0440\\u0435\\u0438\\u0440\\u0430\\u043D\\u043E\n#XFLD\nLabel.ChangedBy=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0438\\u043E\n#XFLD\nLabel.ChangedOn=\\u041F\\u0440\\u043E\\u043C\\u0435\\u045A\\u0435\\u043D\\u043E\n#XFLD\nLabel.PageTitle=\\u041D\\u0430\\u0441\\u043B\\u043E\\u0432 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435\n#XFLD\nLabel.AssignedRole=\\u0414\\u043E\\u0434\\u0435\\u0459\\u0435\\u043D\\u0430 \\u0443\\u043B\\u043E\\u0433\\u0430\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u041D\\u0430\\u0441\\u043B\\u043E\\u0432\n#XCOL\nColumn.PageDescription=\\u041E\\u043F\\u0438\\u0441\n#XCOL\nColumn.PageCreatedBy=\\u041A\\u0440\\u0435\\u0438\\u0440\\u0430\\u043E\n#XCOL\nColumn.PageCreatedOn=\\u041A\\u0440\\u0435\\u0438\\u0440\\u0430\\u043D\\u043E\n#XCOL\nColumn.PageChangedBy=\\u041F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0438\\u043E\n#XCOL\nColumn.PageChangedOn=\\u041F\\u0440\\u043E\\u043C\\u0435\\u045A\\u0435\\u043D\\u043E\n\n\n#XTOL\nPlaceholder.GroupName=\\u0423\\u043D\\u0435\\u0441\\u0438\\u0442\\u0435 \\u043D\\u0430\\u0437\\u0438\\u0432 \\u0433\\u0440\\u0443\\u043F\\u0435\n#XTOL\nPlaceholder.SearchForTiles=\\u0422\\u0440\\u0430\\u0436\\u0438 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0435\n\n#MSG\nMessage.NoGroupTitle=\\u0413\\u0440\\u0443\\u043F\\u0430 {0} \\u043D\\u0435\\u043C\\u0430 \\u043D\\u0430\\u0441\\u043B\\u043E\\u0432. \\u0414\\u0430 \\u0431\\u0438\\u0441\\u0442\\u0435 \\u043E\\u0441\\u0438\\u0433\\u0443\\u0440\\u0430\\u043B\\u0438 \\u0434\\u043E\\u0441\\u043B\\u0435\\u0434\\u043D\\u043E \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u0447\\u043A\\u043E \\u0438\\u0441\\u043A\\u0443\\u0441\\u0442\\u0432\\u043E, \\u043F\\u0440\\u0435\\u043F\\u043E\\u0440\\u0443\\u0447\\u0443\\u0458\\u0435\\u043C\\u043E \\u0434\\u0430 \\u0443\\u043D\\u0435\\u0441\\u0435\\u0442\\u0435 \\u043D\\u0430\\u0437\\u0438\\u0432 \\u0433\\u0440\\u0443\\u043F\\u0435 \\u0437\\u0430 \\u0441\\u0432\\u0430\\u043A\\u0443 \\u0433\\u0440\\u0443\\u043F\\u0443.\n#XMSG\nMessage.InvalidGroupTitle=\\u0418\\u0434\\u0435\\u0430\\u043B\\u043D\\u043E \\u0431\\u0438 \\u0431\\u0438\\u043B\\u043E \\u0434\\u0430 \\u0443\\u043D\\u0435\\u0441\\u0435\\u0442\\u0435 \\u043D\\u0430\\u0437\\u0438\\u0432 \\u0433\\u0440\\u0443\\u043F\\u0435.\n#XMSG\nMessage.NoInternetConnection=\\u041F\\u0440\\u043E\\u0432\\u0435\\u0440\\u0438\\u0442\\u0435 \\u0438\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442 \\u0432\\u0435\\u0437\\u0443.\n#XMSG\nMessage.SavedChanges=\\u0412\\u0430\\u0448\\u0435 \\u043F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0435 \\u0441\\u0443 \\u0441\\u0430\\u0447\\u0443\\u0432\\u0430\\u043D\\u0435.\n#XMSG\nMessage.InvalidPageID=\\u041A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0438\\u0442\\u0435 \\u0441\\u0430\\u043C\\u043E \\u0441\\u043B\\u0435\\u0434\\u0435\\u045B\\u0435 \\u0437\\u043D\\u0430\\u043A\\u043E\\u0432\\u0435\\: \\u0410-\\u0160 \\u0430-\\u0161 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u041D\\u0430\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 ID \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435.\n#XMSG\nMessage.EmptyTitle=\\u041D\\u0430\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043D\\u0430\\u0441\\u043B\\u043E\\u0432.\n#XMSG\nMessage.SuccessDeletePage=\\u041E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0438 \\u043E\\u0431\\u0458\\u0435\\u043A\\u0430\\u0442 \\u0458\\u0435 \\u0438\\u0437\\u0431\\u0440\\u0438\\u0441\\u0430\\u043D.\n#XMSG\nMessage.ClipboardCopySuccess=\\u0414\\u0435\\u0442\\u0430\\u0459\\u0438 \\u0441\\u0443 \\u0443\\u0441\\u043F\\u0435\\u0448\\u043D\\u043E \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u043D\\u0438.\n#YMSE\nMessage.ClipboardCopyFail=\\u0413\\u0440\\u0435\\u0448\\u043A\\u0430 \\u043F\\u0440\\u0438 \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u045A\\u0443 \\u0434\\u0435\\u0442\\u0430\\u0459\\u0430.\n#XMSG\nMessage.DeletePageConfirmation=\\u0414\\u0430 \\u043B\\u0438 \\u0437\\u0430\\u0438\\u0441\\u0442\\u0430 \\u0436\\u0435\\u043B\\u0438\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0431\\u0440\\u0438\\u0448\\u0435\\u0442\\u0435 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0458\\u0435 \\u043A\\u0440\\u0435\\u0438\\u0440\\u0430\\u043D\\u0430.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u041D\\u0435\\u043C\\u0430 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u041D\\u0435\\u043C\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0430\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u041D\\u0438\\u0458\\u0435 \\u0443\\u0441\\u043F\\u0435\\u043B\\u043E \\u0443\\u0447\\u0438\\u0442\\u0430\\u0432\\u0430\\u045A\\u0435 {0} \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430 \\u0443 \\u0433\\u0440\\u0443\\u043F\\u0438 "{1}".\\n\\n\\u041D\\u0430\\u0458\\u0432\\u0435\\u0440\\u043E\\u0432\\u0430\\u0442\\u043D\\u0438\\u0458\\u0438 \\u0443\\u0437\\u0440\\u043E\\u043A \\u0458\\u0435 \\u043D\\u0435\\u0442\\u0430\\u0447\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u0458\\u0430 \\u0441\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458\\u0430 SAP Fiori launchpad-a \\u0438\\u043B\\u0438 \\u043D\\u0435\\u043F\\u043E\\u0441\\u0442\\u043E\\u0458\\u0430\\u045A\\u0435 \\u0434\\u043E\\u0434\\u0435\\u043B\\u0435 \\u0443\\u043B\\u043E\\u0433\\u0435.\\n\\n\\u0421\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458 \\u045B\\u0435 \\u0431\\u0438\\u0442\\u0438 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0459\\u0438\\u0432 \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A\\u0443.\\n\\n\\u0414\\u0430 \\u0431\\u0438\\u0441\\u0442\\u0435 \\u0440\\u0435\\u0448\\u0438\\u043B\\u0438 \\u043E\\u0432\\u0430\\u0458 \\u043F\\u0440\\u043E\\u0431\\u043B\\u0435\\u043C, \\u043F\\u0440\\u043E\\u0432\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0435 \\u0438 \\u0446\\u0438\\u0459\\u043D\\u0430 \\u043F\\u0440\\u0435\\u0441\\u043B\\u0438\\u043A\\u0430\\u0432\\u0430\\u045A\\u0430 \\u0434\\u043E\\u0434\\u0435\\u0459\\u0435\\u043D\\u0430 \\u043E\\u0432\\u043E\\u0458 \\u0443\\u043B\\u043E\\u0437\\u0438.\n#XMSG\nMessage.NavigationTargetError=\\u0426\\u0438\\u0459 \\u0443\\u0441\\u043C\\u0435\\u0440\\u0430\\u0432\\u0430\\u045A\\u0430 \\u0441\\u0435 \\u043D\\u0435 \\u043C\\u043E\\u0436\\u0435 \\u0440\\u0430\\u0437\\u0440\\u0435\\u0448\\u0438\\u0442\\u0438.\n#XMSG\nMessage.TilesHaveErrors=\\u041D\\u0435\\u043A\\u0438 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0438 \\u0438\\u043B\\u0438 \\u0433\\u0440\\u0443\\u043F\\u0435 \\u0438\\u043C\\u0430\\u0458\\u0443 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0435 \\u0438\\u043B\\u0438 \\u0443\\u043F\\u043E\\u0437\\u043E\\u0440\\u0435\\u045A\\u0430. \\u0414\\u0430 \\u043B\\u0438 \\u0441\\u0438\\u0433\\u0443\\u0440\\u043D\\u043E \\u0436\\u0435\\u043B\\u0438\\u0442\\u0435 \\u0434\\u0430 \\u043D\\u0430\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u0435 \\u0441\\u0430 \\u0441\\u043D\\u0438\\u043C\\u0430\\u045A\\u0435\\u043C?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u041D\\u0438\\u0458\\u0435 \\u0443\\u0441\\u043F\\u0435\\u043B\\u043E \\u0440\\u0430\\u0437\\u0440\\u0435\\u0448\\u0435\\u045A\\u0435 \\u0446\\u0438\\u0459\\u0430 \\u0443\\u0441\\u043C\\u0435\\u0440\\u0430\\u0432\\u0430\\u045A\\u0430 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430\\: "{0}".\\n\\n \\u041D\\u0430\\u0458\\u0432\\u0435\\u0440\\u043E\\u0432\\u0430\\u0442\\u043D\\u0438\\u0458\\u0438 \\u0443\\u0437\\u0440\\u043E\\u043A \\u0458\\u0435 \\u043D\\u0435\\u0442\\u0430\\u0447\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0438\\u0433\\u0443\\u0440\\u0430\\u0446\\u0438\\u0458\\u0430 \\u0441\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458\\u0430 SAP Fiori launchpad-a \\u0438\\u043B\\u0438 \\u043D\\u0435\\u043F\\u043E\\u0441\\u0442\\u043E\\u0458\\u0430\\u045A\\u0435 \\u0434\\u043E\\u0434\\u0435\\u043B\\u0435 \\u0443\\u043B\\u043E\\u0433\\u0435.\\n\\n \\u041F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D "{0}" \\u045B\\u0435 \\u0431\\u0438\\u0442\\u0438 \\u043F\\u0440\\u0438\\u043A\\u0430\\u0437\\u0430\\u043D \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A\\u0443, \\u0430\\u043B\\u0438 \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A \\u043D\\u0435\\u045B\\u0435 \\u043C\\u043E\\u045B\\u0438 \\u0434\\u0430 \\u0443\\u0441\\u043C\\u0435\\u0440\\u0430\\u0432\\u0430 \\u043F\\u043E\\u043C\\u043E\\u045B\\u0443 \\u043E\\u0432\\u043E\\u0433 \\u043F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430.\n#XMSG\nMessage.DeleteGroup=\\u0414\\u0430 \\u043B\\u0438 \\u0441\\u0438\\u0433\\u0443\\u0440\\u043D\\u043E \\u0436\\u0435\\u043B\\u0438\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0431\\u0440\\u0438\\u0448\\u0435\\u0442\\u0435 \\u0433\\u0440\\u0443\\u043F\\u0443 "{0}"?\n#XMSG\nMessage.PageIsOutdated=\\u041D\\u043E\\u0432\\u0438\\u0458\\u0430 \\u0432\\u0435\\u0440\\u0437\\u0438\\u0458\\u0430 \\u043E\\u0432\\u0435 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435 \\u0458\\u0435 \\u0432\\u0435\\u045B \\u0441\\u0430\\u0447\\u0443\\u0432\\u0430\\u043D\\u0430.\n#XMSG\nMessage.SaveChanges=\\u0421\\u0430\\u0447\\u0443\\u0432\\u0430\\u0458\\u0442\\u0435 \\u0441\\u0432\\u043E\\u0458\\u0435 \\u043F\\u0440\\u043E\\u043C\\u0435\\u043D\\u0435.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u041D\\u043E\\u0432\\u0430 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\n#XTIT\nTitle.TilesHaveErrors=\\u041F\\u043E\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0438 \\u0438\\u043C\\u0430\\u0458\\u0443 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0435\n#XTIT\nDeleteDialog.Title=\\u0418\\u0437\\u0431\\u0440\\u0438\\u0448\\u0438\n#XMSG\nDeleteDialog.Text=\\u0414\\u0430 \\u043B\\u0438 \\u0441\\u0438\\u0433\\u0443\\u0440\\u043D\\u043E \\u0436\\u0435\\u043B\\u0438\\u0442\\u0435 \\u0434\\u0430 \\u0438\\u0437\\u0431\\u0440\\u0438\\u0448\\u0435\\u0442\\u0435 \\u043E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0443 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0418\\u0437\\u0431\\u0440\\u0438\\u0448\\u0438\n#XTIT\nDeleteDialog.LockedTitle=\\u0421\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430 \\u0437\\u0430\\u043A\\u0459\\u0443\\u0447\\u0430\\u043D\\u0430\n#XMSG\nDeleteDialog.LockedText=\\u041E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0443 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443 \\u0458\\u0435 \\u0437\\u0430\\u043A\\u0459\\u0443\\u0447\\u0430\\u043E \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u041E\\u0434\\u0430\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043F\\u0440\\u0435\\u043D\\u043E\\u0441 \\u0437\\u0430 \\u0431\\u0440\\u0438\\u0441\\u0430\\u045A\\u0435 \\u043E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0435 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435.\n\n#XMSG\nEditDialog.LockedText=\\u041E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0443 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443 \\u0458\\u0435 \\u0437\\u0430\\u043A\\u0459\\u0443\\u0447\\u0430\\u043E \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A {0}.\n#XMSG\nEditDialog.TransportRequired=\\u041E\\u0434\\u0430\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043F\\u0440\\u0435\\u043D\\u043E\\u0441 \\u0437\\u0430 \\u0443\\u0440\\u0435\\u0452\\u0438\\u0432\\u0430\\u045A\\u0435 \\u043E\\u0434\\u0430\\u0431\\u0440\\u0430\\u043D\\u0435 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435.\n#XTIT\nEditDialog.Title=\\u0423\\u0440\\u0435\\u0434\\u0438 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0443\n\n#XTIT\nErrorDialog.Title=\\u0413\\u0440\\u0435\\u0448\\u043A\\u0430\n\n#XTIT\nPageOverview.Title=\\u041E\\u0434\\u0440\\u0436\\u0430\\u0432\\u0430\\u0458 \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0435\n\n\n#XTIT\nCopyDialog.Title=\\u041A\\u043E\\u043F\\u0438\\u0440\\u0430\\u0458\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0414\\u0430 \\u043B\\u0438 \\u0436\\u0435\\u043B\\u0438\\u0442\\u0435 \\u0434\\u0430 \\u043A\\u043E\\u043F\\u0438\\u0440\\u0430\\u0442\\u0435 {0}?\n#XFLD\nCopyDialog.NewID=\\u041A\\u043E\\u043F\\u0438\\u0458\\u0430 {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u041D\\u0430\\u0441\\u043B\\u043E\\u0432 \\u0433\\u0440\\u0443\\u043F\\u0435 \\u0437\\u0430 \\u0433\\u0440\\u0443\\u043F\\u0443 {0} \\u0458\\u0435 \\u043F\\u0440\\u0430\\u0437\\u0430\\u043D.\n#XMSG\nTitle.UnsufficientRoles=\\u041D\\u0435\\u0434\\u043E\\u0432\\u043E\\u0459\\u043D\\u0430 \\u0434\\u043E\\u0434\\u0435\\u043B\\u0430 \\u0443\\u043B\\u043E\\u0433\\u0435 \\u0437\\u0430 \\u043F\\u0440\\u0438\\u043A\\u0430\\u0437 \\u0441\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458\\u0430\n#XMSG\nTitle.ContentIsNotVisible=\\u0421\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458 \\u045B\\u0435 \\u0431\\u0438\\u0442\\u0438 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0459\\u0438\\u0432 \\u043A\\u043E\\u0440\\u0438\\u0441\\u043D\\u0438\\u043A\\u0443.\n#XMSG\nTitle.ContentNotNavigateable=\\u0423\\u0441\\u043C\\u0435\\u0440\\u0430\\u0432\\u0430\\u045A\\u0435 \\u0443 \\u0441\\u0430\\u0434\\u0440\\u0436\\u0430\\u0458\\u0443 \\u043D\\u0435\\u045B\\u0435 \\u0431\\u0438\\u0442\\u0438 \\u043C\\u043E\\u0433\\u0443\\u045B\\u0435.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_sv.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Underh\\u00E5ll sidor\n\n\n#XBUT\nButton.Add=L\\u00E4gg till\n#XBUT\nButton.Cancel=Avbryt\n#XBUT\nButton.Copy=Kopiera\n#XBUT\nButton.Create=Skapa\n#XBUT\nButton.Delete=Radera\n#XBUT\nButton.Edit=Bearbeta\n#XBUT\nButton.Save=Spara\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=V\\u00E4xla kataloger\n#XBUT\nButton.SortCatalogs=V\\u00E4xla sorteringsf\\u00F6ljd i katalog\n#XBUT\nButton.CollapseCatalogs=Komprimera alla kataloger\n#XBUT\nButton.ExpandCatalogs=Expandera alla kataloger\n#XBUT\nButton.ShowDetails=Visa detaljer\n#XBUT\nButton.PagePreview=F\\u00F6rhandsgranskning av sida\n\n\n#XTOL\nTooltip.AddToGroups=L\\u00E4gg till i grupper\n#XTOL Tooltip for the search button\nTooltip.Search=S\\u00F6k\n#XTOL\nTooltip.SearchForTiles=S\\u00F6k paneler\n\n\n#XFLD\nLabel.PageID=Sid-ID\n#XFLD\nLabel.WorkbenchRequest=Workbenchorder\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Transportinformation\n#XFLD\nLabel.Details=Detaljer\\:\n#XFLD\nLabel.ResponseCode=Svarskod\\:\n#XFLD\nLabel.Description=Beskrivning\n#XFLD\nLabel.CreatedBy=Uppl\\u00E4ggning av\n#XFLD\nLabel.CreatedOn=Uppl\\u00E4ggning den\n#XFLD\nLabel.ChangedBy=\\u00C4ndring av\n#XFLD\nLabel.ChangedOn=\\u00C4ndring den\n#XFLD\nLabel.PageTitle=Sidrubrik\n#XFLD\nLabel.AssignedRole=Allokerad roll\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Rubrik\n#XCOL\nColumn.PageDescription=Beskrivning\n#XCOL\nColumn.PageCreatedBy=Uppl\\u00E4ggning av\n#XCOL\nColumn.PageCreatedOn=Uppl\\u00E4ggning den\n#XCOL\nColumn.PageChangedBy=\\u00C4ndring av\n#XCOL\nColumn.PageChangedOn=\\u00C4ndring den\n\n\n#XTOL\nPlaceholder.GroupName=Ange gruppnamn\n#XTOL\nPlaceholder.SearchForTiles=S\\u00F6k paneler\n\n#MSG\nMessage.NoGroupTitle=Grupp {0} har ingen titel. Vi rekommenderar att ange gruppnamn f\\u00F6r varje grupp, f\\u00F6r en konsistent anv\\u00E4ndarupplevelse.\n#XMSG\nMessage.InvalidGroupTitle=Du b\\u00F6r ange ett gruppnamn.\n#XMSG\nMessage.NoInternetConnection=Kontrollera internetuppkopplingen.\n#XMSG\nMessage.SavedChanges=\\u00C4ndringar har sparats.\n#XMSG\nMessage.InvalidPageID=Anv\\u00E4nd endast f\\u00F6ljande tecken\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Ange sid-ID.\n#XMSG\nMessage.EmptyTitle=Ange rubrik.\n#XMSG\nMessage.SuccessDeletePage=Valt objekt har raderats.\n#XMSG\nMessage.ClipboardCopySuccess=Detaljer har kopierats.\n#YMSE\nMessage.ClipboardCopyFail=Ett fel intr\\u00E4ffade vid kopiering av detaljer.\n#XMSG\nMessage.DeletePageConfirmation=Ska {0} {1} \\nraderas?\n#XMSG\nMessage.PageCreated=Sidan har skapats.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Inga paneler\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Inga grupper\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Panel {0} kunde inte l\\u00E4sas in i grupp "{1}".\\n\\nDetta beror troligen p\\u00E5 en felaktig inneh\\u00E5llskonfiguration f\\u00F6r SAP Fiori-launchpad eller att en rollallokering saknas.\\n\\nInneh\\u00E5llet visas inte f\\u00F6r anv\\u00E4ndaren.\\n\\nF\\u00F6r att \\u00E5tg\\u00E4rda felet, kontrollera kataloger och m\\u00E5lmappningar som allokerats till denna roll.\n#XMSG\nMessage.NavigationTargetError=Navigeringsm\\u00E5l kunde inte \\u00E5tg\\u00E4rdas.\n#XMSG\nMessage.TilesHaveErrors=N\\u00E5gra av panelerna eller grupperna inneh\\u00E5ller fel eller varningar. Vill du forts\\u00E4tta spara?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Navigeringsm\\u00E5l f\\u00F6r panel kunde inte \\u00E5tg\\u00E4rdas\\: "{0}".\\n\\nDetta beror troligen p\\u00E5 en felaktig inneh\\u00E5llskonfiguration f\\u00F6r SAP Fiori-launchpad eller att en rollallokering saknas.\\n\\nPanelen "{0}" visas f\\u00F6r anv\\u00E4ndaren, men anv\\u00E4ndaren kan inte navigera med hj\\u00E4lp av denna panel.\n#XMSG\nMessage.DeleteGroup=Ska grupp "{0}" raderas?\n#XMSG\nMessage.PageIsOutdated=En nyare version av denna sida har redan sparats.\n#XMSG\nMessage.SaveChanges=Spara dina \\u00E4ndringar.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Ny sida\n#XTIT\nTitle.TilesHaveErrors=Paneler inneh\\u00E5ller fel\n#XTIT\nDeleteDialog.Title=Radera\n#XMSG\nDeleteDialog.Text=Ska vald sida raderas?\n#XBUT\nDeleteDialog.ConfirmButton=Radera\n#XTIT\nDeleteDialog.LockedTitle=Sida sp\\u00E4rras\n#XMSG\nDeleteDialog.LockedText=Vald sida sp\\u00E4rras av anv\\u00E4ndare {0}.\n#XMSG\nDeleteDialog.TransportRequired=V\\u00E4lj en transport f\\u00F6r att radera vald sida.\n\n#XMSG\nEditDialog.LockedText=Vald sida sp\\u00E4rras av anv\\u00E4ndare {0}.\n#XMSG\nEditDialog.TransportRequired=V\\u00E4lj en transport f\\u00F6r att bearbeta vald sida.\n#XTIT\nEditDialog.Title=Bearbeta sida\n\n#XTIT\nErrorDialog.Title=Fel\n\n#XTIT\nPageOverview.Title=Underh\\u00E5ll sidor\n\n\n#XTIT\nCopyDialog.Title=Kopiera\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Ska {0} kopieras?\n#XFLD\nCopyDialog.NewID=Kopia av {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Grupprubrik f\\u00F6r grupp {0} \\u00E4r tom.\n#XMSG\nTitle.UnsufficientRoles=Otillr\\u00E4cklig rollallokering f\\u00F6r visning av inneh\\u00E5ll\n#XMSG\nTitle.ContentIsNotVisible=Inneh\\u00E5ll visas inte f\\u00F6r anv\\u00E4ndaren.\n#XMSG\nTitle.ContentNotNavigateable=Navigering i inneh\\u00E5llet \\u00E4r ej m\\u00F6jlig.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_th.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u0E1B\\u0E23\\u0E31\\u0E1A\\u0E1B\\u0E23\\u0E38\\u0E07\\u0E2B\\u0E19\\u0E49\\u0E32\n\n\n#XBUT\nButton.Add=\\u0E40\\u0E1E\\u0E34\\u0E48\\u0E21\n#XBUT\nButton.Cancel=\\u0E22\\u0E01\\u0E40\\u0E25\\u0E34\\u0E01\n#XBUT\nButton.Copy=\\u0E04\\u0E31\\u0E14\\u0E25\\u0E2D\\u0E01\n#XBUT\nButton.Create=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\n#XBUT\nButton.Delete=\\u0E25\\u0E1A\n#XBUT\nButton.Edit=\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\n#XBUT\nButton.Save=\\u0E40\\u0E01\\u0E47\\u0E1A\\u0E1A\\u0E31\\u0E19\\u0E17\\u0E36\\u0E01\n#XBUT\nButton.Ok=\\u0E15\\u0E01\\u0E25\\u0E07\n#XBUT\nButton.ShowCatalogs=\\u0E2A\\u0E25\\u0E31\\u0E1A\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\n#XBUT\nButton.SortCatalogs=\\u0E2A\\u0E25\\u0E31\\u0E1A\\u0E25\\u0E33\\u0E14\\u0E31\\u0E1A\\u0E01\\u0E32\\u0E23\\u0E08\\u0E31\\u0E14\\u0E40\\u0E23\\u0E35\\u0E22\\u0E07\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\n#XBUT\nButton.CollapseCatalogs=\\u0E22\\u0E48\\u0E2D\\u0E23\\u0E27\\u0E21\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\\u0E17\\u0E31\\u0E49\\u0E07\\u0E2B\\u0E21\\u0E14\n#XBUT\nButton.ExpandCatalogs=\\u0E02\\u0E22\\u0E32\\u0E22\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\\u0E17\\u0E31\\u0E49\\u0E07\\u0E2B\\u0E21\\u0E14\n#XBUT\nButton.ShowDetails=\\u0E41\\u0E2A\\u0E14\\u0E07\\u0E23\\u0E32\\u0E22\\u0E25\\u0E30\\u0E40\\u0E2D\\u0E35\\u0E22\\u0E14\n#XBUT\nButton.PagePreview=\\u0E01\\u0E32\\u0E23\\u0E41\\u0E2A\\u0E14\\u0E07\\u0E15\\u0E31\\u0E27\\u0E2D\\u0E22\\u0E48\\u0E32\\u0E07\\u0E2B\\u0E19\\u0E49\\u0E32\n\n\n#XTOL\nTooltip.AddToGroups=\\u0E40\\u0E1E\\u0E34\\u0E48\\u0E21\\u0E43\\u0E19\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\n#XTOL Tooltip for the search button\nTooltip.Search=\\u0E04\\u0E49\\u0E19\\u0E2B\\u0E32\n#XTOL\nTooltip.SearchForTiles=\\u0E04\\u0E49\\u0E19\\u0E2B\\u0E32 Tile\n\n\n#XFLD\nLabel.PageID=ID \\u0E2B\\u0E19\\u0E49\\u0E32\n#XFLD\nLabel.WorkbenchRequest=\\u0E04\\u0E33\\u0E02\\u0E2D Workbench\n#XFLD\nLabel.Package=\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\n#XFLD\nLabel.TransportInformation=\\u0E02\\u0E49\\u0E2D\\u0E21\\u0E39\\u0E25\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\n#XFLD\nLabel.Details=\\u0E23\\u0E32\\u0E22\\u0E25\\u0E30\\u0E40\\u0E2D\\u0E35\\u0E22\\u0E14\\:\n#XFLD\nLabel.ResponseCode=\\u0E23\\u0E2B\\u0E31\\u0E2A\\u0E01\\u0E32\\u0E23\\u0E15\\u0E2D\\u0E1A\\u0E2A\\u0E19\\u0E2D\\u0E07\\:\n#XFLD\nLabel.Description=\\u0E04\\u0E33\\u0E2D\\u0E18\\u0E34\\u0E1A\\u0E32\\u0E22\n#XFLD\nLabel.CreatedBy=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\\u0E42\\u0E14\\u0E22\n#XFLD\nLabel.CreatedOn=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\\u0E40\\u0E21\\u0E37\\u0E48\\u0E2D\n#XFLD\nLabel.ChangedBy=\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E42\\u0E14\\u0E22\n#XFLD\nLabel.ChangedOn=\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E40\\u0E21\\u0E37\\u0E48\\u0E2D\n#XFLD\nLabel.PageTitle=\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E2B\\u0E19\\u0E49\\u0E32\n#XFLD\nLabel.AssignedRole=\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E17\\u0E35\\u0E48\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E40\\u0E23\\u0E37\\u0E48\\u0E2D\\u0E07\n#XCOL\nColumn.PageDescription=\\u0E04\\u0E33\\u0E2D\\u0E18\\u0E34\\u0E1A\\u0E32\\u0E22\n#XCOL\nColumn.PageCreatedBy=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\\u0E42\\u0E14\\u0E22\n#XCOL\nColumn.PageCreatedOn=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\\u0E40\\u0E21\\u0E37\\u0E48\\u0E2D\n#XCOL\nColumn.PageChangedBy=\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E42\\u0E14\\u0E22\n#XCOL\nColumn.PageChangedOn=\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E40\\u0E21\\u0E37\\u0E48\\u0E2D\n\n\n#XTOL\nPlaceholder.GroupName=\\u0E1B\\u0E49\\u0E2D\\u0E19\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\n#XTOL\nPlaceholder.SearchForTiles=\\u0E04\\u0E49\\u0E19\\u0E2B\\u0E32 Tile\n\n#MSG\nMessage.NoGroupTitle=\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21 {0} \\u0E44\\u0E21\\u0E21\\u0E35\\u0E0A\\u0E37\\u0E48\\u0E2D \\u0E40\\u0E1E\\u0E37\\u0E48\\u0E2D\\u0E43\\u0E2B\\u0E49\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E1B\\u0E23\\u0E30\\u0E2A\\u0E1A\\u0E01\\u0E32\\u0E23\\u0E13\\u0E4C\\u0E01\\u0E32\\u0E23\\u0E43\\u0E0A\\u0E49\\u0E07\\u0E32\\u0E19\\u0E02\\u0E2D\\u0E07\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49\\u0E17\\u0E35\\u0E48\\u0E2A\\u0E2D\\u0E14\\u0E04\\u0E25\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E31\\u0E19 \\u0E40\\u0E23\\u0E32\\u0E02\\u0E2D\\u0E41\\u0E19\\u0E30\\u0E19\\u0E33\\u0E43\\u0E2B\\u0E49\\u0E1B\\u0E49\\u0E2D\\u0E19\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\\u0E2A\\u0E33\\u0E2B\\u0E23\\u0E31\\u0E1A\\u0E41\\u0E15\\u0E48\\u0E25\\u0E30\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\n#XMSG\nMessage.InvalidGroupTitle=\\u0E15\\u0E32\\u0E21\\u0E2B\\u0E25\\u0E31\\u0E01\\u0E01\\u0E32\\u0E23 \\u0E04\\u0E38\\u0E13\\u0E04\\u0E27\\u0E23\\u0E1B\\u0E49\\u0E2D\\u0E19\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\n#XMSG\nMessage.NoInternetConnection=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E15\\u0E23\\u0E27\\u0E08\\u0E2A\\u0E2D\\u0E1A\\u0E01\\u0E32\\u0E23\\u0E40\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E21\\u0E15\\u0E48\\u0E2D\\u0E2D\\u0E34\\u0E19\\u0E40\\u0E15\\u0E2D\\u0E23\\u0E4C\\u0E40\\u0E19\\u0E47\\u0E15\\u0E02\\u0E2D\\u0E07\\u0E04\\u0E38\\u0E13\n#XMSG\nMessage.SavedChanges=\\u0E01\\u0E32\\u0E23\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E02\\u0E2D\\u0E07\\u0E04\\u0E38\\u0E13\\u0E16\\u0E39\\u0E01\\u0E40\\u0E01\\u0E47\\u0E1A\\u0E1A\\u0E31\\u0E19\\u0E17\\u0E36\\u0E01\\u0E41\\u0E25\\u0E49\\u0E27\n#XMSG\nMessage.InvalidPageID=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E43\\u0E0A\\u0E49\\u0E2D\\u0E31\\u0E01\\u0E02\\u0E23\\u0E30\\u0E15\\u0E48\\u0E2D\\u0E44\\u0E1B\\u0E19\\u0E35\\u0E49\\u0E40\\u0E17\\u0E48\\u0E32\\u0E19\\u0E31\\u0E49\\u0E19\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E23\\u0E30\\u0E1A\\u0E38 ID \\u0E2B\\u0E19\\u0E49\\u0E32\n#XMSG\nMessage.EmptyTitle=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E23\\u0E30\\u0E1A\\u0E38\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E40\\u0E23\\u0E37\\u0E48\\u0E2D\\u0E07\n#XMSG\nMessage.SuccessDeletePage=\\u0E2D\\u0E2D\\u0E1A\\u0E40\\u0E08\\u0E04\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E16\\u0E39\\u0E01\\u0E25\\u0E1A\\u0E41\\u0E25\\u0E49\\u0E27\n#XMSG\nMessage.ClipboardCopySuccess=\\u0E04\\u0E31\\u0E14\\u0E25\\u0E2D\\u0E01\\u0E23\\u0E32\\u0E22\\u0E25\\u0E30\\u0E40\\u0E2D\\u0E35\\u0E22\\u0E14\\u0E44\\u0E14\\u0E49\\u0E2A\\u0E33\\u0E40\\u0E23\\u0E47\\u0E08\n#YMSE\nMessage.ClipboardCopyFail=\\u0E21\\u0E35\\u0E02\\u0E49\\u0E2D\\u0E1C\\u0E34\\u0E14\\u0E1E\\u0E25\\u0E32\\u0E14\\u0E40\\u0E01\\u0E34\\u0E14\\u0E02\\u0E36\\u0E49\\u0E19\\u0E02\\u0E13\\u0E30\\u0E04\\u0E31\\u0E14\\u0E25\\u0E2D\\u0E01\\u0E23\\u0E32\\u0E22\\u0E25\\u0E30\\u0E40\\u0E2D\\u0E35\\u0E22\\u0E14\n#XMSG\nMessage.DeletePageConfirmation=\\u0E04\\u0E38\\u0E13\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E44\\u0E21\\u0E48\\u0E27\\u0E48\\u0E32\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E25\\u0E1A\\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u0E2A\\u0E23\\u0E49\\u0E32\\u0E07\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E41\\u0E25\\u0E49\\u0E27\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u0E44\\u0E21\\u0E48\\u0E21\\u0E35\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E40\\u0E23\\u0E37\\u0E48\\u0E2D\\u0E07\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u0E44\\u0E21\\u0E48\\u0E21\\u0E35\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E42\\u0E2B\\u0E25\\u0E14 Tile {0} \\u0E43\\u0E19\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21 "{1}" \\n\\n\\u0E40\\u0E1B\\u0E47\\u0E19\\u0E44\\u0E1B\\u0E44\\u0E14\\u0E49\\u0E27\\u0E48\\u0E32\\u0E08\\u0E30\\u0E40\\u0E01\\u0E34\\u0E14\\u0E08\\u0E32\\u0E01\\u0E01\\u0E32\\u0E23\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E23\\u0E39\\u0E1B\\u0E41\\u0E1A\\u0E1A\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32 SAP Fiori Launchpad \\u0E44\\u0E21\\u0E48\\u0E16\\u0E39\\u0E01\\u0E15\\u0E49\\u0E2D\\u0E07 \\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E01\\u0E32\\u0E23\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E02\\u0E32\\u0E14\\u0E2B\\u0E32\\u0E22\\u0E44\\u0E1B\\n\\n\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49\\u0E08\\u0E30\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E21\\u0E2D\\u0E07\\u0E40\\u0E2B\\u0E47\\u0E19\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32\\n\\n\\u0E40\\u0E21\\u0E37\\u0E48\\u0E2D\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\\u0E1B\\u0E31\\u0E0D\\u0E2B\\u0E32\\u0E19\\u0E35\\u0E49 \\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E15\\u0E23\\u0E27\\u0E08\\u0E2A\\u0E2D\\u0E1A\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\\u0E41\\u0E25\\u0E30\\u0E01\\u0E32\\u0E23\\u0E41\\u0E21\\u0E47\\u0E1B\\u0E40\\u0E1B\\u0E49\\u0E32\\u0E2B\\u0E21\\u0E32\\u0E22\\u0E17\\u0E35\\u0E48\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E43\\u0E2B\\u0E49\\u0E01\\u0E31\\u0E1A\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E19\\u0E35\\u0E49\n#XMSG\nMessage.NavigationTargetError=\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\\u0E40\\u0E1B\\u0E49\\u0E32\\u0E2B\\u0E21\\u0E32\\u0E22\\u0E01\\u0E32\\u0E23\\u0E40\\u0E19\\u0E27\\u0E34\\u0E40\\u0E01\\u0E15\n#XMSG\nMessage.TilesHaveErrors=\\u0E1A\\u0E32\\u0E07 Tile \\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\\u0E21\\u0E35\\u0E02\\u0E49\\u0E2D\\u0E1C\\u0E34\\u0E14\\u0E1E\\u0E25\\u0E32\\u0E14\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E04\\u0E33\\u0E40\\u0E15\\u0E37\\u0E2D\\u0E19 \\u0E04\\u0E38\\u0E13\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E44\\u0E21\\u0E48\\u0E27\\u0E48\\u0E32\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E14\\u0E33\\u0E40\\u0E19\\u0E34\\u0E19\\u0E01\\u0E32\\u0E23\\u0E40\\u0E01\\u0E47\\u0E1A\\u0E1A\\u0E31\\u0E19\\u0E17\\u0E36\\u0E01\\u0E15\\u0E48\\u0E2D?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\\u0E40\\u0E1B\\u0E49\\u0E32\\u0E2B\\u0E21\\u0E32\\u0E22\\u0E01\\u0E32\\u0E23\\u0E40\\u0E19\\u0E27\\u0E34\\u0E40\\u0E01\\u0E15\\u0E02\\u0E2D\\u0E07 Tile\\: "{0}"\\n\\n\\u0E40\\u0E1B\\u0E47\\u0E19\\u0E44\\u0E1B\\u0E44\\u0E14\\u0E49\\u0E27\\u0E48\\u0E32\\u0E08\\u0E30\\u0E40\\u0E01\\u0E34\\u0E14\\u0E08\\u0E32\\u0E01\\u0E01\\u0E32\\u0E23\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E23\\u0E39\\u0E1B\\u0E41\\u0E1A\\u0E1A\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32 SAP Fiori Launchpad \\u0E44\\u0E21\\u0E48\\u0E16\\u0E39\\u0E01\\u0E15\\u0E49\\u0E2D\\u0E07 \\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E01\\u0E32\\u0E23\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E02\\u0E32\\u0E14\\u0E2B\\u0E32\\u0E22\\u0E44\\u0E1B\\n\\nTile "{0}" \\u0E08\\u0E30\\u0E41\\u0E2A\\u0E14\\u0E07\\u0E2A\\u0E33\\u0E2B\\u0E23\\u0E31\\u0E1A\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49 \\u0E41\\u0E15\\u0E48\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49\\u0E08\\u0E30\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E40\\u0E19\\u0E27\\u0E34\\u0E40\\u0E01\\u0E15\\u0E42\\u0E14\\u0E22\\u0E43\\u0E0A\\u0E49 Tile \\u0E19\\u0E35\\u0E49\n#XMSG\nMessage.DeleteGroup=\\u0E04\\u0E38\\u0E13\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E44\\u0E21\\u0E48\\u0E27\\u0E48\\u0E32\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E25\\u0E1A\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21 "{0}"?\n#XMSG\nMessage.PageIsOutdated=\\u0E40\\u0E27\\u0E2D\\u0E23\\u0E4C\\u0E0A\\u0E31\\u0E19\\u0E17\\u0E35\\u0E48\\u0E43\\u0E2B\\u0E21\\u0E48\\u0E01\\u0E27\\u0E48\\u0E32\\u0E02\\u0E2D\\u0E07\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E19\\u0E35\\u0E49\\u0E16\\u0E39\\u0E01\\u0E40\\u0E01\\u0E47\\u0E1A\\u0E1A\\u0E31\\u0E19\\u0E17\\u0E36\\u0E01\\u0E41\\u0E25\\u0E49\\u0E27\n#XMSG\nMessage.SaveChanges=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E40\\u0E01\\u0E47\\u0E1A\\u0E1A\\u0E31\\u0E19\\u0E17\\u0E36\\u0E01\\u0E01\\u0E32\\u0E23\\u0E40\\u0E1B\\u0E25\\u0E35\\u0E48\\u0E22\\u0E19\\u0E41\\u0E1B\\u0E25\\u0E07\\u0E02\\u0E2D\\u0E07\\u0E04\\u0E38\\u0E13\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E43\\u0E2B\\u0E21\\u0E48\n#XTIT\nTitle.TilesHaveErrors=Tile \\u0E21\\u0E35\\u0E02\\u0E49\\u0E2D\\u0E1C\\u0E34\\u0E14\\u0E1E\\u0E25\\u0E32\\u0E14\n#XTIT\nDeleteDialog.Title=\\u0E25\\u0E1A\n#XMSG\nDeleteDialog.Text=\\u0E04\\u0E38\\u0E13\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E44\\u0E21\\u0E48\\u0E27\\u0E48\\u0E32\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E25\\u0E1A\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0E25\\u0E1A\n#XTIT\nDeleteDialog.LockedTitle=\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E16\\u0E39\\u0E01\\u0E25\\u0E47\\u0E2D\\u0E04\n#XMSG\nDeleteDialog.LockedText=\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E16\\u0E39\\u0E01\\u0E25\\u0E47\\u0E2D\\u0E04\\u0E42\\u0E14\\u0E22\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49 {0}\n#XMSG\nDeleteDialog.TransportRequired=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\u0E40\\u0E1E\\u0E37\\u0E48\\u0E2D\\u0E25\\u0E1A\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\n\n#XMSG\nEditDialog.LockedText=\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E16\\u0E39\\u0E01\\u0E25\\u0E47\\u0E2D\\u0E04\\u0E42\\u0E14\\u0E22\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49 {0}\n#XMSG\nEditDialog.TransportRequired=\\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\u0E40\\u0E1E\\u0E37\\u0E48\\u0E2D\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\\u0E2B\\u0E19\\u0E49\\u0E32\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\n#XTIT\nEditDialog.Title=\\u0E41\\u0E01\\u0E49\\u0E44\\u0E02\\u0E2B\\u0E19\\u0E49\\u0E32\n\n#XTIT\nErrorDialog.Title=\\u0E02\\u0E49\\u0E2D\\u0E1C\\u0E34\\u0E14\\u0E1E\\u0E25\\u0E32\\u0E14\n\n#XTIT\nPageOverview.Title=\\u0E1B\\u0E23\\u0E31\\u0E1A\\u0E1B\\u0E23\\u0E38\\u0E07\\u0E2B\\u0E19\\u0E49\\u0E32\n\n\n#XTIT\nCopyDialog.Title=\\u0E04\\u0E31\\u0E14\\u0E25\\u0E2D\\u0E01\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u0E04\\u0E38\\u0E13\\u0E41\\u0E19\\u0E48\\u0E43\\u0E08\\u0E2B\\u0E23\\u0E37\\u0E2D\\u0E44\\u0E21\\u0E48\\u0E27\\u0E48\\u0E32\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E01\\u0E32\\u0E23\\u0E04\\u0E31\\u0E14\\u0E25\\u0E2D\\u0E01 {0}?\n#XFLD\nCopyDialog.NewID=\\u0E2A\\u0E33\\u0E40\\u0E19\\u0E32\\u0E02\\u0E2D\\u0E07 {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\\u0E02\\u0E2D\\u0E07\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21 {0} \\u0E27\\u0E48\\u0E32\\u0E07\\u0E40\\u0E1B\\u0E25\\u0E48\\u0E32\n#XMSG\nTitle.UnsufficientRoles=\\u0E01\\u0E32\\u0E23\\u0E01\\u0E33\\u0E2B\\u0E19\\u0E14\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E44\\u0E21\\u0E48\\u0E40\\u0E1E\\u0E35\\u0E22\\u0E07\\u0E1E\\u0E2D\\u0E17\\u0E35\\u0E48\\u0E08\\u0E30\\u0E41\\u0E2A\\u0E14\\u0E07\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32\n#XMSG\nTitle.ContentIsNotVisible=\\u0E1C\\u0E39\\u0E49\\u0E43\\u0E0A\\u0E49\\u0E08\\u0E30\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E21\\u0E2D\\u0E07\\u0E40\\u0E2B\\u0E47\\u0E19\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32\n#XMSG\nTitle.ContentNotNavigateable=\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32\\u0E08\\u0E30\\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E40\\u0E19\\u0E27\\u0E34\\u0E40\\u0E01\\u0E15\\u0E44\\u0E14\\u0E49\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_tr.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Sayfalar\\u0131n bak\\u0131m\\u0131n\\u0131 yap\n\n\n#XBUT\nButton.Add=Ekle\n#XBUT\nButton.Cancel=\\u0130ptal et\n#XBUT\nButton.Copy=Kopyala\n#XBUT\nButton.Create=Olu\\u015Ftur\n#XBUT\nButton.Delete=Sil\n#XBUT\nButton.Edit=D\\u00FCzenle\n#XBUT\nButton.Save=Kaydet\n#XBUT\nButton.Ok=Tamam\n#XBUT\nButton.ShowCatalogs=Kataloglar\\u0131 de\\u011Fi\\u015Ftir\n#XBUT\nButton.SortCatalogs=Katalog s\\u0131ralamas\\u0131n\\u0131 de\\u011Fi\\u015Ftir\n#XBUT\nButton.CollapseCatalogs=T\\u00FCm kataloglar\\u0131 daralt\n#XBUT\nButton.ExpandCatalogs=T\\u00FCm kataloglar\\u0131 geni\\u015Flet\n#XBUT\nButton.ShowDetails=Ayr\\u0131nt\\u0131lar\\u0131 g\\u00F6ster\n#XBUT\nButton.PagePreview=Sayfa \\u00F6ng\\u00F6r\\u00FCn\\u00FCm\\u00FC\n\n\n#XTOL\nTooltip.AddToGroups=Gruplara ekle\n#XTOL Tooltip for the search button\nTooltip.Search=Ara\n#XTOL\nTooltip.SearchForTiles=Kutucuklar\\u0131 ara\n\n\n#XFLD\nLabel.PageID=Sayfa tan\\u0131t\\u0131c\\u0131s\\u0131\n#XFLD\nLabel.WorkbenchRequest=\\u00C7al\\u0131\\u015Fma ekran\\u0131 talebi\n#XFLD\nLabel.Package=Paket\n#XFLD\nLabel.TransportInformation=Ta\\u015F\\u0131ma bilgileri\n#XFLD\nLabel.Details=Ayr\\u0131nt\\u0131lar\\:\n#XFLD\nLabel.ResponseCode=Yan\\u0131t kodu\\:\n#XFLD\nLabel.Description=Tan\\u0131m\n#XFLD\nLabel.CreatedBy=Olu\\u015Fturan\n#XFLD\nLabel.CreatedOn=Olu\\u015Fturma tarihi\n#XFLD\nLabel.ChangedBy=De\\u011Fi\\u015Ftiren\n#XFLD\nLabel.ChangedOn=De\\u011Fi\\u015Fiklik tarihi\n#XFLD\nLabel.PageTitle=Sayfa ba\\u015Fl\\u0131\\u011F\\u0131\n#XFLD\nLabel.AssignedRole=Tayin edilen rol\n\n\n#XCOL\nColumn.PageID=Tan\\u0131t\\u0131c\\u0131\n#XCOL\nColumn.PageTitle=Ba\\u015Fl\\u0131k\n#XCOL\nColumn.PageDescription=Tan\\u0131m\n#XCOL\nColumn.PageCreatedBy=Olu\\u015Fturan\n#XCOL\nColumn.PageCreatedOn=Olu\\u015Fturma tarihi\n#XCOL\nColumn.PageChangedBy=De\\u011Fi\\u015Ftiren\n#XCOL\nColumn.PageChangedOn=De\\u011Fi\\u015Fiklik tarihi\n\n\n#XTOL\nPlaceholder.GroupName=Grup ad\\u0131 girin\n#XTOL\nPlaceholder.SearchForTiles=Kutucuklar\\u0131 ara\n\n#MSG\nMessage.NoGroupTitle=Grup {0}, ba\\u015Fl\\u0131\\u011Fa sahip de\\u011Fil. Tutarl\\u0131 kullan\\u0131c\\u0131 deneyimi i\\u00E7in her gruba y\\u00F6nelik grup ad\\u0131 girilmesini \\u00F6neririz.\n#XMSG\nMessage.InvalidGroupTitle=\\u0130deal olarak bir grup ad\\u0131 girmelisiniz.\n#XMSG\nMessage.NoInternetConnection=\\u0130nternet ba\\u011Flant\\u0131n\\u0131z\\u0131 kontrol edin.\n#XMSG\nMessage.SavedChanges=De\\u011Fi\\u015Fiklikleriniz kaydedildi.\n#XMSG\nMessage.InvalidPageID=Yaln\\u0131zca \\u015Fu karakterleri kullan\\u0131n\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Sayfa tan\\u0131t\\u0131c\\u0131s\\u0131 belirtin.\n#XMSG\nMessage.EmptyTitle=Ba\\u015Fl\\u0131k belirtin.\n#XMSG\nMessage.SuccessDeletePage=Se\\u00E7ilen nesne silindi.\n#XMSG\nMessage.ClipboardCopySuccess=Ayr\\u0131nt\\u0131lar ba\\u015Far\\u0131yla kopyaland\\u0131.\n#YMSE\nMessage.ClipboardCopyFail=Ayr\\u0131nt\\u0131lar kopyalan\\u0131rken hata olu\\u015Ftu.\n#XMSG\nMessage.DeletePageConfirmation={0} {1} \\u00F6\\u011Fesini ger\\u00E7ekten silmek \\nistiyor musunuz?\n#XMSG\nMessage.PageCreated=Sayfa olu\\u015Fturuldu.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Kutucuk yok\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Grup yok\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError="{1}" grubunda {0} kutucu\\u011Fu y\\u00FCklenemedi. \\n\\nBunun nedeni b\\u00FCy\\u00FCk ihtimalle yanl\\u0131\\u015F SAP Fiori ba\\u015Flatma \\u00E7ubu\\u011Fu i\\u00E7erik konfig\\u00FCrasyonu veya eksik rol tayinidir.\\n\\n\\u0130\\u00E7erik kullan\\u0131c\\u0131ya g\\u00F6r\\u00FCnmeyecek.\\n\\nBu sorunu \\u00E7\\u00F6zmek i\\u00E7in bu role tayin edilen hedef e\\u015Flemeleri ve kataloglar\\u0131 kontrol edin.\n#XMSG\nMessage.NavigationTargetError=Dola\\u015Fma hedefi \\u00E7\\u00F6z\\u00FClemedi.\n#XMSG\nMessage.TilesHaveErrors=Baz\\u0131 kutucuklar veya gruplar hatalar ya da uyar\\u0131lar i\\u00E7eriyor. Kaydetmeye devam etmek istedi\\u011Finizden emin misiniz?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Kutucu\\u011Fun dola\\u015Fma hedefi \\u00E7\\u00F6z\\u00FClemedi\\: "{0}".\\n\\n Bunun nedeni b\\u00FCy\\u00FCk olas\\u0131l\\u0131kla yanl\\u0131\\u015F SAP Fiori ba\\u015Flatma \\u00E7ubu\\u011Fu i\\u00E7erik konfig\\u00FCrasyonu veya eksik rol tayinidir.\\n\\n"{0}" kutucu\\u011Fu kullan\\u0131c\\u0131ya g\\u00F6sterilecek ancak kullan\\u0131c\\u0131 bu kutucu\\u011Fu kullanarak dola\\u015Fma ger\\u00E7ekle\\u015Ftiremeyecektir.\n#XMSG\nMessage.DeleteGroup="{0}" grubunu silmek istiyor musunuz?\n#XMSG\nMessage.PageIsOutdated=Bu sayfan\\u0131n daha yeni versiyonu zaten sakland\\u0131.\n#XMSG\nMessage.SaveChanges=De\\u011Fi\\u015Fikliklerinizi kaydedin.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Yeni sayfa\n#XTIT\nTitle.TilesHaveErrors=Kutucuklar hatalar i\\u00E7eriyor\n#XTIT\nDeleteDialog.Title=Sil\n#XMSG\nDeleteDialog.Text=Se\\u00E7ilen sayfay\\u0131 silmek istedi\\u011Finizden emin misiniz?\n#XBUT\nDeleteDialog.ConfirmButton=Sil\n#XTIT\nDeleteDialog.LockedTitle=Sayfa kilitlendi\n#XMSG\nDeleteDialog.LockedText=Se\\u00E7ilen sayfa {0} kullan\\u0131c\\u0131s\\u0131 taraf\\u0131ndan kilitlendi.\n#XMSG\nDeleteDialog.TransportRequired=Se\\u00E7ilen sayfay\\u0131 silmek i\\u00E7in aktar\\u0131m se\\u00E7in.\n\n#XMSG\nEditDialog.LockedText=Se\\u00E7ilen sayfa {0} kullan\\u0131c\\u0131s\\u0131 taraf\\u0131ndan kilitlendi.\n#XMSG\nEditDialog.TransportRequired=Se\\u00E7ilen sayfay\\u0131 d\\u00FCzenlemek i\\u00E7in aktar\\u0131m se\\u00E7in.\n#XTIT\nEditDialog.Title=Sayfay\\u0131 d\\u00FCzenle\n\n#XTIT\nErrorDialog.Title=Hata\n\n#XTIT\nPageOverview.Title=Sayfalar\\u0131n bak\\u0131m\\u0131n\\u0131 yap\n\n\n#XTIT\nCopyDialog.Title=Kopyala\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message={0} \\u00F6\\u011Fesini kopyalamak istiyor musunuz?\n#XFLD\nCopyDialog.NewID={0} kopyas\\u0131\n\n\n#XMSG\nTitle.NoGroupTitle={0} grubunun grup ba\\u015Fl\\u0131\\u011F\\u0131 bo\\u015F.\n#XMSG\nTitle.UnsufficientRoles=\\u0130\\u00E7eri\\u011Fi g\\u00F6stermek i\\u00E7in yetersiz rol tayini\n#XMSG\nTitle.ContentIsNotVisible=\\u0130\\u00E7erik kullan\\u0131c\\u0131ya g\\u00F6r\\u00FCnmeyecek.\n#XMSG\nTitle.ContentNotNavigateable=\\u0130\\u00E7eri\\u011Fe gidilemeyecek.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_uk.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u0412\\u0435\\u0441\\u0442\\u0438 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438\n\n\n#XBUT\nButton.Add=\\u0414\\u043E\\u0434\\u0430\\u0442\\u0438\n#XBUT\nButton.Cancel=\\u0421\\u043A\\u0430\\u0441\\u0443\\u0432\\u0430\\u0442\\u0438\n#XBUT\nButton.Copy=\\u041A\\u043E\\u043F\\u0456\\u044E\\u0432\\u0430\\u0442\\u0438\n#XBUT\nButton.Create=\\u0421\\u0442\\u0432\\u043E\\u0440\\u0438\\u0442\\u0438\n#XBUT\nButton.Delete=\\u0412\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438\n#XBUT\nButton.Edit=\\u0420\\u0435\\u0434\\u0430\\u0433\\u0443\\u0432\\u0430\\u0442\\u0438\n#XBUT\nButton.Save=\\u0417\\u0431\\u0435\\u0440\\u0435\\u0433\\u0442\\u0438\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u041F\\u0435\\u0440\\u0435\\u043C\\u043A\\u043D\\u0443\\u0442\\u0438 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.SortCatalogs=\\u041F\\u0435\\u0440\\u0435\\u043C\\u043A\\u043D\\u0443\\u0442\\u0438 \\u043F\\u043E\\u0440\\u044F\\u0434\\u043E\\u043A \\u0441\\u043E\\u0440\\u0442\\u0443\\u0432\\u0430\\u043D\\u043D\\u044F \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0456\\u0432\n#XBUT\nButton.CollapseCatalogs=\\u0417\\u0433\\u043E\\u0440\\u043D\\u0443\\u0442\\u0438 \\u0432\\u0441\\u0456 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.ExpandCatalogs=\\u0420\\u043E\\u0437\\u0433\\u043E\\u0440\\u043D\\u0443\\u0442\\u0438 \\u0432\\u0441\\u0456 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438\n#XBUT\nButton.ShowDetails=\\u041F\\u043E\\u043A\\u0430\\u0437\\u0430\\u0442\\u0438 \\u043F\\u043E\\u0434\\u0440\\u043E\\u0431\\u0438\\u0446\\u0456\n#XBUT\nButton.PagePreview=\\u041F\\u043E\\u043F\\u0435\\u0440\\u0435\\u0434\\u043D\\u0456\\u0439 \\u043F\\u0435\\u0440\\u0435\\u0433\\u043B\\u044F\\u0434 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438\n\n\n#XTOL\nTooltip.AddToGroups=\\u0414\\u043E\\u0434\\u0430\\u0442\\u0438 \\u0434\\u043E \\u0433\\u0440\\u0443\\u043F\n#XTOL Tooltip for the search button\nTooltip.Search=\\u041F\\u043E\\u0448\\u0443\\u043A\n#XTOL\nTooltip.SearchForTiles=\\u041F\\u043E\\u0448\\u0443\\u043A \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n\n\n#XFLD\nLabel.PageID=\\u0406\\u0414 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438\n#XFLD\nLabel.WorkbenchRequest=\\u0417\\u0430\\u043F\\u0438\\u0442 \\u0456\\u043D\\u0441\\u0442\\u0440\\u0443\\u043C\\u0435\\u043D\\u0442\\u0430\\u043B\\u044C\\u043D\\u0438\\u0445 \\u0437\\u0430\\u0441\\u043E\\u0431\\u0456\\u0432\n#XFLD\nLabel.Package=\\u041F\\u0430\\u043A\\u0435\\u0442\n#XFLD\nLabel.TransportInformation=\\u0406\\u043D\\u0444\\u043E\\u0440\\u043C\\u0430\\u0446\\u0456\\u044F \\u043F\\u0440\\u043E \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\n#XFLD\nLabel.Details=\\u041F\\u043E\\u0434\\u0440\\u043E\\u0431\\u0438\\u0446\\u0456\\:\n#XFLD\nLabel.ResponseCode=\\u041A\\u043E\\u0434 \\u0432\\u0456\\u0434\\u043F\\u043E\\u0432\\u0456\\u0434\\u0456\\:\n#XFLD\nLabel.Description=\\u041E\\u043F\\u0438\\u0441\n#XFLD\nLabel.CreatedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0441\\u0442\\u0432\\u043E\\u0440\\u0435\\u043D\\u043D\\u044F\n#XFLD\nLabel.CreatedOn=\\u0414\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0432\\u043E\\u0440\\u0435\\u043D\\u043D\\u044F\n#XFLD\nLabel.ChangedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0437\\u043C\\u0456\\u043D\\u0438\n#XFLD\nLabel.ChangedOn=\\u0414\\u0430\\u0442\\u0430 \\u0437\\u043C\\u0456\\u043D\\u0438\n#XFLD\nLabel.PageTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438\n#XFLD\nLabel.AssignedRole=\\u041F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0454\\u043D\\u0430 \\u0440\\u043E\\u043B\\u044C\n\n\n#XCOL\nColumn.PageID=\\u0406\\u0414\n#XCOL\nColumn.PageTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A\n#XCOL\nColumn.PageDescription=\\u041E\\u043F\\u0438\\u0441\n#XCOL\nColumn.PageCreatedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0441\\u0442\\u0432\\u043E\\u0440\\u0435\\u043D\\u043D\\u044F\n#XCOL\nColumn.PageCreatedOn=\\u0414\\u0430\\u0442\\u0430 \\u0441\\u0442\\u0432\\u043E\\u0440\\u0435\\u043D\\u043D\\u044F\n#XCOL\nColumn.PageChangedBy=\\u0410\\u0432\\u0442\\u043E\\u0440 \\u0437\\u043C\\u0456\\u043D\\u0438\n#XCOL\nColumn.PageChangedOn=\\u0414\\u0430\\u0442\\u0430 \\u0437\\u043C\\u0456\\u043D\\u0438\n\n\n#XTOL\nPlaceholder.GroupName=\\u0412\\u0432\\u0435\\u0441\\u0442\\u0438 \\u0456\\u043C\'\\u044F \\u0433\\u0440\\u0443\\u043F\\u0438\n#XTOL\nPlaceholder.SearchForTiles=\\u041F\\u043E\\u0448\\u0443\\u043A \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n\n#MSG\nMessage.NoGroupTitle=\\u0413\\u0440\\u0443\\u043F\\u0430 {0} \\u043D\\u0435 \\u043C\\u0430\\u0454 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043A\\u0430. \\u0429\\u043E\\u0431 \\u0437\\u0430\\u0431\\u0435\\u0437\\u043F\\u0435\\u0447\\u0438\\u0442\\u0438 \\u043D\\u0435\\u0441\\u0443\\u043F\\u0435\\u0440\\u0435\\u0447\\u043D\\u0443 \\u0432\\u0437\\u0430\\u0454\\u043C\\u043E\\u0434\\u0456\\u044E \\u0437 \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0435\\u043C, \\u0440\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0443\\u0454\\u043C\\u043E \\u0432\\u0432\\u0435\\u0441\\u0442\\u0438 \\u0456\\u043C\'\'\\u044F \\u0434\\u043B\\u044F \\u043A\\u043E\\u0436\\u043D\\u043E\\u0457 \\u0433\\u0440\\u0443\\u043F\\u0438.\n#XMSG\nMessage.InvalidGroupTitle=\\u0412 \\u0456\\u0434\\u0435\\u0430\\u043B\\u0456 \\u043D\\u0435\\u043E\\u0431\\u0445\\u0456\\u0434\\u043D\\u043E \\u0432\\u0432\\u0435\\u0441\\u0442\\u0438 \\u0456\\u043C\'\\u044F \\u0433\\u0440\\u0443\\u043F\\u0438.\n#XMSG\nMessage.NoInternetConnection=\\u041F\\u0435\\u0440\\u0435\\u0432\\u0456\\u0440\\u0442\\u0435 \\u0432\\u0430\\u0448\\u0435 \\u0406\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442-\\u043F\\u0456\\u0434\\u043A\\u043B\\u044E\\u0447\\u0435\\u043D\\u043D\\u044F.\n#XMSG\nMessage.SavedChanges=\\u0412\\u0430\\u0448\\u0456 \\u0437\\u043C\\u0456\\u043D\\u0438 \\u0437\\u0431\\u0435\\u0440\\u0435\\u0436\\u0435\\u043D\\u043E.\n#XMSG\nMessage.InvalidPageID=\\u0412\\u0438\\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u043E\\u0432\\u0443\\u0439\\u0442\\u0435 \\u043B\\u0438\\u0448\\u0435 \\u043D\\u0430\\u0441\\u0442\\u0443\\u043F\\u043D\\u0456 \\u0441\\u0438\\u043C\\u0432\\u043E\\u043B\\u0438\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u0412\\u043A\\u0430\\u0436\\u0456\\u0442\\u044C \\u0406\\u0414 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438.\n#XMSG\nMessage.EmptyTitle=\\u0412\\u043A\\u0430\\u0436\\u0456\\u0442\\u044C \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A.\n#XMSG\nMessage.SuccessDeletePage=\\u0412\\u0438\\u0431\\u0440\\u0430\\u043D\\u0438\\u0439 \\u043E\\u0431\'\\u0454\\u043A\\u0442 \\u0432\\u0438\\u0434\\u0430\\u043B\\u0435\\u043D\\u043E.\n#XMSG\nMessage.ClipboardCopySuccess=\\u041F\\u043E\\u0434\\u0440\\u043E\\u0431\\u0438\\u0446\\u0456 \\u0443\\u0441\\u043F\\u0456\\u0448\\u043D\\u043E \\u0441\\u043A\\u043E\\u043F\\u0456\\u0439\\u043E\\u0432\\u0430\\u043D\\u043E\n#YMSE\nMessage.ClipboardCopyFail=\\u041F\\u0440\\u0438 \\u043A\\u043E\\u043F\\u0456\\u044E\\u0432\\u0430\\u043D\\u043D\\u0456 \\u043F\\u043E\\u0434\\u0440\\u043E\\u0431\\u0438\\u0446\\u044C \\u0441\\u0442\\u0430\\u043B\\u0430\\u0441\\u044F \\u043F\\u043E\\u043C\\u0438\\u043B\\u043A\\u0430.\n#XMSG\nMessage.DeletePageConfirmation=\\u0412\\u0438 \\u0434\\u0456\\u0439\\u0441\\u043D\\u043E \\u0431\\u0430\\u0436\\u0430\\u0454\\u0442\\u0435 \\u0432\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438 \\n {0} {1}?\n#XMSG\nMessage.PageCreated=\\u0421\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0430 \\u0441\\u0442\\u0432\\u043E\\u0440\\u0435\\u043D\\u0430.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u0411\\u0435\\u0437 \\u043F\\u043B\\u0438\\u0442\\u043E\\u043A\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u0411\\u0435\\u0437 \\u0433\\u0440\\u0443\\u043F\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u041D\\u0435 \\u0432\\u0434\\u0430\\u043B\\u043E\\u0441\\u044F \\u0437\\u0430\\u0432\\u0430\\u043D\\u0442\\u0430\\u0436\\u0438\\u0442\\u0438 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A \\u043F\\u0456\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430 {0} \\u0432 \\u0433\\u0440\\u0443\\u043F\\u0456 "{1}".\\n\\n\\u0419\\u043C\\u043E\\u0432\\u0456\\u0440\\u043D\\u0456\\u0448\\u0435 \\u0437\\u0430 \\u0432\\u0441\\u0435 \\u043F\\u0440\\u0438\\u0447\\u0438\\u043D\\u043E\\u044E \\u0446\\u044C\\u043E\\u0433\\u043E \\u0454 \\u043D\\u0435\\u043F\\u0440\\u0430\\u0432\\u0438\\u043B\\u044C\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0456\\u0433\\u0443\\u0440\\u0430\\u0446\\u0456\\u044F \\u0432\\u043C\\u0456\\u0441\\u0442\\u0443 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0456 \\u0437\\u0430\\u043F\\u0443\\u0441\\u043A\\u0443 SAP Fiori \\u0430\\u0431\\u043E \\u0432\\u0456\\u0434\\u0441\\u0443\\u0442\\u043D\\u0456\\u0441\\u0442\\u044C \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u044E\\u0432\\u0430\\u043D\\u043D\\u044F \\u0440\\u043E\\u043B\\u0456.\\n\\n\\u0412\\u043C\\u0456\\u0441\\u0442 \\u0431\\u0443\\u0434\\u0435 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0438\\u043C\\u0438\\u0439 \\u0434\\u043B\\u044F \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0430.\\n\\n\\u0429\\u043E\\u0431 \\u0432\\u0438\\u0440\\u0456\\u0448\\u0438\\u0442\\u0438 \\u0446\\u044E \\u043F\\u0440\\u043E\\u0431\\u043B\\u0435\\u043C\\u0443 \\u043F\\u0435\\u0440\\u0435\\u0432\\u0456\\u0440\\u0442\\u0435 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0438 \\u0439 \\u0446\\u0456\\u043B\\u044C\\u043E\\u0432\\u0456 \\u043F\\u0440\\u0438\\u0437\\u043D\\u0430\\u0447\\u0435\\u043D\\u043D\\u044F, \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u0454\\u043D\\u0456 \\u0434\\u043E \\u0446\\u0456\\u0454\\u0457 \\u0440\\u043E\\u043B\\u0456.\n#XMSG\nMessage.NavigationTargetError=\\u041D\\u0435 \\u0432\\u0434\\u0430\\u043B\\u043E\\u0441\\u044F \\u0440\\u043E\\u0437\\u0432\'\\u044F\\u0437\\u0430\\u0442\\u0438 \\u0446\\u0456\\u043B\\u044C \\u043D\\u0430\\u0432\\u0456\\u0433\\u0430\\u0446\\u0456\\u0457.\n#XMSG\nMessage.TilesHaveErrors=\\u0414\\u0435\\u044F\\u043A\\u0456 \\u043F\\u0456\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0438 \\u0430\\u0431\\u043E \\u0433\\u0440\\u0443\\u043F\\u0438 \\u043C\\u0456\\u0441\\u0442\\u044F\\u0442\\u044C \\u043F\\u043E\\u043C\\u0438\\u043B\\u043A\\u0438 \\u0430\\u0431\\u043E \\u0437\\u0430\\u0441\\u0442\\u0435\\u0440\\u0435\\u0436\\u0435\\u043D\\u043D\\u044F. \\u0412\\u0438 \\u0434\\u0456\\u0439\\u0441\\u043D\\u043E \\u0431\\u0430\\u0436\\u0430\\u0454\\u0442\\u0435 \\u043F\\u0440\\u043E\\u0434\\u043E\\u0432\\u0436\\u0438\\u0442\\u0438 \\u0437\\u0431\\u0435\\u0440\\u0435\\u0436\\u0435\\u043D\\u043D\\u044F?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u041D\\u0435 \\u0432\\u0434\\u0430\\u043B\\u043E\\u0441\\u044F \\u0440\\u043E\\u0437\\u0432\'\'\\u044F\\u0437\\u0430\\u0442\\u0438 \\u0446\\u0456\\u043B\\u044C \\u043D\\u0430\\u0432\\u0456\\u0433\\u0430\\u0446\\u0456\\u0457 \\u043F\\u0456\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430\\: "{0}".\\n\\n\\u0419\\u043C\\u043E\\u0432\\u0456\\u0440\\u043D\\u0456\\u0448\\u0435 \\u0437\\u0430 \\u0432\\u0441\\u0435 \\u043F\\u0440\\u0438\\u0447\\u0438\\u043D\\u043E\\u044E \\u0446\\u044C\\u043E\\u0433\\u043E \\u0454 \\u043D\\u0435\\u043F\\u0440\\u0430\\u0432\\u0438\\u043B\\u044C\\u043D\\u0430 \\u043A\\u043E\\u043D\\u0444\\u0456\\u0433\\u0443\\u0440\\u0430\\u0446\\u0456\\u044F \\u0432\\u043C\\u0456\\u0441\\u0442\\u0443 \\u043F\\u0430\\u043D\\u0435\\u043B\\u0456 \\u0437\\u0430\\u043F\\u0443\\u0441\\u043A\\u0443 SAP Fiori \\u0430\\u0431\\u043E \\u0432\\u0456\\u0434\\u0441\\u0443\\u0442\\u043D\\u0456\\u0441\\u0442\\u044C \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u044E\\u0432\\u0430\\u043D\\u043D\\u044F \\u0440\\u043E\\u043B\\u0456.\\n\\n\\u041F\\u0456\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D "{0}" \\u0431\\u0443\\u0434\\u0435 \\u043F\\u043E\\u043A\\u0430\\u0437\\u0430\\u043D\\u043E \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0443, \\u0430\\u043B\\u0435 \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447 \\u043D\\u0435 \\u0437\\u043C\\u043E\\u0436\\u0435 \\u043F\\u0435\\u0440\\u0435\\u0439\\u0442\\u0438 \\u0437\\u0430 \\u0434\\u043E\\u043F\\u043E\\u043C\\u043E\\u0433\\u043E\\u044E \\u0446\\u044C\\u043E\\u0433\\u043E \\u043F\\u0456\\u0434\\u0435\\u043A\\u0440\\u0430\\u043D\\u0430.\n#XMSG\nMessage.DeleteGroup=\\u0412\\u0438 \\u0434\\u0456\\u0439\\u0441\\u043D\\u043E \\u0431\\u0430\\u0436\\u0430\\u0454\\u0442\\u0435 \\u0432\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438 \\u0433\\u0440\\u0443\\u043F\\u0443 "{0}"?\n#XMSG\nMessage.PageIsOutdated=\\u041D\\u043E\\u0432\\u0456\\u0448\\u0430 \\u0432\\u0435\\u0440\\u0441\\u0456\\u044F \\u0446\\u0456\\u0454\\u0457 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438 \\u0443\\u0441\\u043F\\u0456\\u0448\\u043D\\u043E \\u0437\\u0431\\u0435\\u0440\\u0435\\u0436\\u0435\\u043D\\u0430.\n#XMSG\nMessage.SaveChanges=\\u0417\\u0431\\u0435\\u0440\\u0435\\u0436\\u0456\\u0442\\u044C \\u0432\\u0430\\u0448\\u0456 \\u0437\\u043C\\u0456\\u043D\\u0438\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u041D\\u043E\\u0432\\u0430 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0430\n#XTIT\nTitle.TilesHaveErrors=\\u041F\\u043B\\u0438\\u0442\\u043A\\u0430 \\u043C\\u0430\\u0454 \\u043F\\u043E\\u043C\\u0438\\u043B\\u043A\\u0438\n#XTIT\nDeleteDialog.Title=\\u0412\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438\n#XMSG\nDeleteDialog.Text=\\u0412\\u0438 \\u0434\\u0456\\u0439\\u0441\\u043D\\u043E \\u0431\\u0430\\u0436\\u0430\\u0454\\u0442\\u0435 \\u0432\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438 \\u0432\\u0438\\u0431\\u0440\\u0430\\u043D\\u0443 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0443?\n#XBUT\nDeleteDialog.ConfirmButton=\\u0412\\u0438\\u0434\\u0430\\u043B\\u0438\\u0442\\u0438\n#XTIT\nDeleteDialog.LockedTitle=\\u0421\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u043E\\u0432\\u0430\\u043D\\u0430\n#XMSG\nDeleteDialog.LockedText=\\u0412\\u0438\\u0431\\u0440\\u0430\\u043D\\u0430 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u043E\\u0432\\u0430\\u043D\\u0430 \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0435\\u043C {0}.\n#XMSG\nDeleteDialog.TransportRequired=\\u0412\\u0438\\u0431\\u0435\\u0440\\u0456\\u0442\\u044C \\u043F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0435\\u043D\\u043D\\u044F \\u0434\\u043B\\u044F \\u0432\\u0438\\u0434\\u0430\\u043B\\u0435\\u043D\\u043D\\u044F \\u0432\\u0438\\u0431\\u0440\\u0430\\u043D\\u043E\\u0457 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438.\n\n#XMSG\nEditDialog.LockedText=\\u0412\\u0438\\u0431\\u0440\\u0430\\u043D\\u0430 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0430 \\u0437\\u0430\\u0431\\u043B\\u043E\\u043A\\u043E\\u0432\\u0430\\u043D\\u0430 \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0435\\u043C {0}.\n#XMSG\nEditDialog.TransportRequired=\\u0412\\u0438\\u0431\\u0435\\u0440\\u0456\\u0442\\u044C \\u043F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0435\\u043D\\u043D\\u044F \\u0434\\u043B\\u044F \\u0440\\u0435\\u0434\\u0430\\u0433\\u0443\\u0432\\u0430\\u043D\\u043D\\u044F \\u0432\\u0438\\u0431\\u0440\\u0430\\u043D\\u043E\\u0457 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438.\n#XTIT\nEditDialog.Title=\\u0420\\u0435\\u0434\\u0430\\u0433\\u0443\\u0432\\u0430\\u0442\\u0438 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0443\n\n#XTIT\nErrorDialog.Title=\\u041F\\u043E\\u043C\\u0438\\u043B\\u043A\\u0430\n\n#XTIT\nPageOverview.Title=\\u0412\\u0435\\u0441\\u0442\\u0438 \\u0441\\u0442\\u043E\\u0440\\u0456\\u043D\\u043A\\u0438\n\n\n#XTIT\nCopyDialog.Title=\\u041A\\u043E\\u043F\\u0456\\u044E\\u0432\\u0430\\u0442\\u0438\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u041A\\u043E\\u043F\\u0456\\u044E\\u0432\\u0430\\u0442\\u0438 {0}?\n#XFLD\nCopyDialog.NewID=\\u041A\\u043E\\u043F\\u0456\\u044F {0}\n\n\n#XMSG\nTitle.NoGroupTitle=\\u0417\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043E\\u043A \\u0433\\u0440\\u0443\\u043F\\u0438 \\u0430\\u0431\\u043E \\u0433\\u0440\\u0443\\u043F\\u0430 {0} \\u043F\\u043E\\u0440\\u043E\\u0436\\u043D\\u044F.\n#XMSG\nTitle.UnsufficientRoles=\\u041D\\u0435\\u0434\\u043E\\u0441\\u0442\\u0430\\u0442\\u043D\\u0454 \\u043F\\u0440\\u0438\\u0441\\u0432\\u043E\\u044E\\u0432\\u0430\\u043D\\u043D\\u044F \\u0440\\u043E\\u043B\\u0456 \\u0434\\u043B\\u044F \\u043F\\u043E\\u043A\\u0430\\u0437\\u0443 \\u0432\\u043C\\u0456\\u0441\\u0442\\u0443\n#XMSG\nTitle.ContentIsNotVisible=\\u0412\\u043C\\u0456\\u0441\\u0442 \\u0431\\u0443\\u0434\\u0435 \\u043D\\u0435\\u0432\\u0438\\u0434\\u0438\\u043C\\u0438\\u0439 \\u0434\\u043B\\u044F \\u043A\\u043E\\u0440\\u0438\\u0441\\u0442\\u0443\\u0432\\u0430\\u0447\\u0430.\n#XMSG\nTitle.ContentNotNavigateable=\\u041D\\u0430\\u0432\\u0456\\u0433\\u0430\\u0446\\u0456\\u044F \\u0443 \\u0432\\u043C\\u0456\\u0441\\u0442\\u0456 \\u0431\\u0443\\u0434\\u0435 \\u043D\\u0435\\u043C\\u043E\\u0436\\u043B\\u0438\\u0432\\u0430.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_vi.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=Duy tri\\u0300 trang\n\n\n#XBUT\nButton.Add=Th\\u00EAm\n#XBUT\nButton.Cancel=Hu\\u0309y\n#XBUT\nButton.Copy=Sao che\\u0301p\n#XBUT\nButton.Create=Ta\\u0323o\n#XBUT\nButton.Delete=Xo\\u0301a\n#XBUT\nButton.Edit=Hi\\u1EC7u ch\\u1EC9nh\n#XBUT\nButton.Save=L\\u01B0u\n#XBUT\nButton.Ok=OK\n#XBUT\nButton.ShowCatalogs=\\u0110a\\u0309o tra\\u0323ng tha\\u0301i danh mu\\u0323c\n#XBUT\nButton.SortCatalogs=\\u0110a\\u0309o tra\\u0323ng tha\\u0301i th\\u01B0\\u0301 t\\u01B0\\u0323 s\\u0103\\u0301p x\\u00EA\\u0301p danh mu\\u0323c\n#XBUT\nButton.CollapseCatalogs=Thu go\\u0323n t\\u00E2\\u0301t ca\\u0309 danh mu\\u0323c\n#XBUT\nButton.ExpandCatalogs=M\\u01A1\\u0309 r\\u00F4\\u0323ng t\\u00E2\\u0301t ca\\u0309 danh mu\\u0323c\n#XBUT\nButton.ShowDetails=Hi\\u00EA\\u0323n chi ti\\u00EA\\u0301t\n#XBUT\nButton.PagePreview=Xem tr\\u01B0\\u01A1\\u0301c trang\n\n\n#XTOL\nTooltip.AddToGroups=Th\\u00EAm v\\u00E0o nh\\u00F3m\n#XTOL Tooltip for the search button\nTooltip.Search=Ti\\u0300m ki\\u00EA\\u0301m\n#XTOL\nTooltip.SearchForTiles=Ti\\u0300m ki\\u00EA\\u0301m hi\\u0300nh x\\u00EA\\u0301p\n\n\n#XFLD\nLabel.PageID=ID trang\n#XFLD\nLabel.WorkbenchRequest=Y\\u00EAu c\\u00E2\\u0300u workbench\n#XFLD\nLabel.Package=G\\u00F3i\n#XFLD\nLabel.TransportInformation=Chuy\\u00EA\\u0309n th\\u00F4ng tin\n#XFLD\nLabel.Details=Chi ti\\u00EA\\u0301t\\:\n#XFLD\nLabel.ResponseCode=Ma\\u0303 pha\\u0309n h\\u00F4\\u0300i\\:\n#XFLD\nLabel.Description=M\\u00F4 ta\\u0309\n#XFLD\nLabel.CreatedBy=\\u0110\\u01B0\\u01A1\\u0323c ta\\u0323o b\\u01A1\\u0309i\n#XFLD\nLabel.CreatedOn=\\u0110\\u01B0\\u01A1\\u0323c ta\\u0323o va\\u0300o nga\\u0300y\n#XFLD\nLabel.ChangedBy=Thay \\u0111\\u00F4\\u0309i b\\u01A1\\u0309i\n#XFLD\nLabel.ChangedOn=Thay \\u0111\\u1ED5i v\\u00E0o\n#XFLD\nLabel.PageTitle=Ti\\u00EAu \\u0111\\u00EA\\u0300 trang\n#XFLD\nLabel.AssignedRole=Vai tro\\u0300 \\u0111a\\u0303 ga\\u0301n\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=Ti\\u00EAu \\u0111\\u00EA\\u0300\n#XCOL\nColumn.PageDescription=M\\u00F4 ta\\u0309\n#XCOL\nColumn.PageCreatedBy=\\u0110\\u01B0\\u01A1\\u0323c ta\\u0323o b\\u01A1\\u0309i\n#XCOL\nColumn.PageCreatedOn=\\u0110\\u01B0\\u01A1\\u0323c ta\\u0323o va\\u0300o nga\\u0300y\n#XCOL\nColumn.PageChangedBy=Thay \\u0111\\u00F4\\u0309i b\\u01A1\\u0309i\n#XCOL\nColumn.PageChangedOn=Thay \\u0111\\u1ED5i v\\u00E0o\n\n\n#XTOL\nPlaceholder.GroupName=Nh\\u00E2\\u0323p t\\u00EAn nho\\u0301m\n#XTOL\nPlaceholder.SearchForTiles=T\\u00ECm ki\\u1EBFm h\\u00ECnh x\\u1EBFp\n\n#MSG\nMessage.NoGroupTitle=Nho\\u0301m {0} kh\\u00F4ng co\\u0301 ti\\u00EAu \\u0111\\u00EA\\u0300. \\u0110\\u00EA\\u0309 \\u0111a\\u0309m ba\\u0309o tra\\u0309i nghi\\u00EA\\u0323m cu\\u0309a ng\\u01B0\\u01A1\\u0300i du\\u0300ng nh\\u00E2\\u0301t qua\\u0301n, chu\\u0301ng t\\u00F4i \\u0111\\u00EA\\u0300 nghi\\u0323 nh\\u00E2\\u0323p t\\u00EAn nho\\u0301m cho m\\u00F4\\u0303i nho\\u0301m.\n#XMSG\nMessage.InvalidGroupTitle=Ly\\u0301 t\\u01B0\\u01A1\\u0309ng la\\u0300 ba\\u0323n n\\u00EAn nh\\u00E2\\u0323p t\\u00EAn nho\\u0301m.\n#XMSG\nMessage.NoInternetConnection=Vui lo\\u0300ng ki\\u00EA\\u0309m tra k\\u00EA\\u0301t n\\u00F4\\u0301i internet cu\\u0309a ba\\u0323n.\n#XMSG\nMessage.SavedChanges=Thay \\u0111\\u00F4\\u0309i cu\\u0309a ba\\u0323n \\u0111a\\u0303 \\u0111\\u01B0\\u01A1\\u0323c l\\u01B0u.\n#XMSG\nMessage.InvalidPageID=Vui lo\\u0300ng chi\\u0309 s\\u01B0\\u0309 du\\u0323ng ca\\u0301c ky\\u0301 t\\u01B0\\u0323 sau \\u0111\\u00E2y\\: A-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=Vui lo\\u0300ng cung c\\u00E2\\u0301p ID trang.\n#XMSG\nMessage.EmptyTitle=Vui lo\\u0300ng cung c\\u00E2\\u0301p ti\\u00EAu \\u0111\\u00EA\\u0300.\n#XMSG\nMessage.SuccessDeletePage=\\u0110\\u00F4\\u0301i t\\u01B0\\u01A1\\u0323ng \\u0111\\u01B0\\u01A1\\u0323c cho\\u0323n \\u0111a\\u0303 bi\\u0323 xo\\u0301a.\n#XMSG\nMessage.ClipboardCopySuccess=Sao che\\u0301p chi ti\\u00EA\\u0301t tha\\u0300nh c\\u00F4ng.\n#YMSE\nMessage.ClipboardCopyFail=\\u0110a\\u0303 xa\\u0309y ra l\\u00F4\\u0303i trong khi sao che\\u0301p chi ti\\u00EA\\u0301t.\n#XMSG\nMessage.DeletePageConfirmation=Ba\\u0323n co\\u0301 th\\u01B0\\u0323c s\\u01B0\\u0323 mu\\u00F4\\u0301n xo\\u0301a \\n {0} {1}?\n#XMSG\nMessage.PageCreated=Trang \\u0111a\\u0303 \\u0111\\u01B0\\u01A1\\u0323c ta\\u0323o.\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=Kh\\u00F4ng co\\u0301 hi\\u0300nh x\\u00EA\\u0301p\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=Kh\\u00F4ng co\\u0301 nho\\u0301m\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=Kh\\u00F4ng th\\u00EA\\u0309 ta\\u0309i hi\\u0300nh x\\u00EA\\u0301p {0} trong nho\\u0301m "{1}".\\n\\n\\u0110i\\u00EA\\u0300u na\\u0300y co\\u0301 th\\u00EA\\u0309 \\u0111\\u01B0\\u01A1\\u0323c g\\u00E2y ra b\\u01A1\\u0309i c\\u00E2\\u0301u hi\\u0300nh n\\u00F4\\u0323i dung h\\u00F4\\u0323p kh\\u01A1\\u0309i \\u0111\\u00F4\\u0323ng SAP Fiori kh\\u00F4ng \\u0111u\\u0301ng ho\\u0103\\u0323c b\\u01A1\\u0309i ga\\u0301n vai tro\\u0300 bi\\u0323 thi\\u00EA\\u0301u.\\n\\nN\\u00F4\\u0323i dung se\\u0303 bi\\u0323 \\u00E2\\u0309n \\u0111\\u00F4\\u0301i v\\u01A1\\u0301i ng\\u01B0\\u01A1\\u0300i du\\u0300ng.\\n\\n\\u0110\\u00EA\\u0309 gia\\u0309i quy\\u00EA\\u0301t v\\u00E2\\u0301n \\u0111\\u00EA\\u0300 na\\u0300y, vui lo\\u0300ng ki\\u00EA\\u0309m tra danh mu\\u0323c va\\u0300 a\\u0301nh xa\\u0323 \\u0111i\\u0301ch \\u0111\\u01B0\\u01A1\\u0323c ga\\u0301n cho vai tro\\u0300 na\\u0300y.\n#XMSG\nMessage.NavigationTargetError=Kh\\u00F4ng th\\u00EA\\u0309 gia\\u0309i quy\\u00EA\\u0301t \\u0111i\\u0301ch \\u0111i\\u00EA\\u0300u h\\u01B0\\u01A1\\u0301ng.\n#XMSG\nMessage.TilesHaveErrors=M\\u00F4\\u0323t s\\u00F4\\u0301 hi\\u0300nh x\\u00EA\\u0301p ho\\u0103\\u0323c nho\\u0301m co\\u0301 l\\u00F4\\u0303i ho\\u0103\\u0323c ca\\u0309nh ba\\u0301o. Ba\\u0323n co\\u0301 ch\\u0103\\u0301c la\\u0300 ba\\u0323n mu\\u00F4\\u0301n ti\\u00EA\\u0301p tu\\u0323c l\\u01B0u kh\\u00F4ng?\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=Kh\\u00F4ng th\\u00EA\\u0309 gia\\u0309i quy\\u00EA\\u0301t \\u0111i\\u0301ch \\u0111i\\u00EA\\u0300u h\\u01B0\\u01A1\\u0301ng cu\\u0309a hi\\u0300nh x\\u00EA\\u0301p\\: "{0}".\\n\\n \\u0110i\\u00EA\\u0300u na\\u0300y co\\u0301 th\\u00EA\\u0309 \\u0111\\u01B0\\u01A1\\u0323c g\\u00E2y ra b\\u01A1\\u0309i c\\u00E2\\u0301u hi\\u0300nh n\\u00F4\\u0323i dung h\\u00F4\\u0323p kh\\u01A1\\u0309i \\u0111\\u00F4\\u0323ng SAP Fiori kh\\u00F4ng \\u0111u\\u0301ng ho\\u0103\\u0323c b\\u01A1\\u0309i ga\\u0301n vai tro\\u0300 bi\\u0323 thi\\u00EA\\u0301u.\\n\\n Hi\\u0300nh x\\u00EA\\u0301p "{0}" se\\u0303 \\u0111\\u01B0\\u01A1\\u0323c hi\\u00EA\\u0309n thi\\u0323 cho ng\\u01B0\\u01A1\\u0300i du\\u0300ng, nh\\u01B0ng ng\\u01B0\\u01A1\\u0300i du\\u0300ng se\\u0303 kh\\u00F4ng th\\u00EA\\u0309 \\u0111i\\u00EA\\u0300u h\\u01B0\\u01A1\\u0301ng b\\u0103\\u0300ng ca\\u0301ch s\\u01B0\\u0309 du\\u0323ng hi\\u0300nh x\\u00EA\\u0301p na\\u0300y.\n#XMSG\nMessage.DeleteGroup=Ba\\u0323n co\\u0301 ch\\u0103\\u0301c la\\u0300 ba\\u0323n mu\\u00F4\\u0301n xo\\u0301a nho\\u0301m "{0}"?\n#XMSG\nMessage.PageIsOutdated=Phi\\u00EAn ba\\u0309n m\\u01A1\\u0301i h\\u01A1n cu\\u0309a trang na\\u0300y \\u0111a\\u0303 \\u0111\\u01B0\\u01A1\\u0323c l\\u01B0u.\n#XMSG\nMessage.SaveChanges=Vui lo\\u0300ng l\\u01B0u ca\\u0301c thay \\u0111\\u00F4\\u0309i cu\\u0309a ba\\u0323n.\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=Trang m\\u01A1\\u0301i\n#XTIT\nTitle.TilesHaveErrors=Hi\\u0300nh x\\u00EA\\u0301p co\\u0301 l\\u00F4\\u0303i\n#XTIT\nDeleteDialog.Title=Xo\\u0301a\n#XMSG\nDeleteDialog.Text=Ba\\u0323n co\\u0301 ch\\u0103\\u0301c la\\u0300 ba\\u0323n mu\\u00F4\\u0301n xo\\u0301a ca\\u0301c trang \\u0111a\\u0303 cho\\u0323n kh\\u00F4ng?\n#XBUT\nDeleteDialog.ConfirmButton=Xo\\u0301a\n#XTIT\nDeleteDialog.LockedTitle=Trang bi\\u0323 kho\\u0301a\n#XMSG\nDeleteDialog.LockedText=Trang \\u0111a\\u0303 cho\\u0323n bi\\u0323 kho\\u0301a b\\u01A1\\u0309i ng\\u01B0\\u01A1\\u0300i du\\u0300ng {0}.\n#XMSG\nDeleteDialog.TransportRequired=Vui lo\\u0300ng cho\\u0323n chuy\\u00EA\\u0309n ta\\u0309i \\u0111\\u00EA\\u0309 xo\\u0301a trang \\u0111a\\u0303 cho\\u0323n.\n\n#XMSG\nEditDialog.LockedText=Trang \\u0111a\\u0303 cho\\u0323n bi\\u0323 kho\\u0301a b\\u01A1\\u0309i ng\\u01B0\\u01A1\\u0300i du\\u0300ng {0}.\n#XMSG\nEditDialog.TransportRequired=Vui lo\\u0300ng cho\\u0323n chuy\\u00EA\\u0309n ta\\u0309i \\u0111\\u00EA\\u0309 hi\\u00EA\\u0323u chi\\u0309nh trang \\u0111a\\u0303 cho\\u0323n.\n#XTIT\nEditDialog.Title=Hi\\u00EA\\u0323u chi\\u0309nh trang\n\n#XTIT\nErrorDialog.Title=L\\u00F4\\u0303i\n\n#XTIT\nPageOverview.Title=Duy tri\\u0300 trang\n\n\n#XTIT\nCopyDialog.Title=Sao ch\\u00E9p\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=Ba\\u0323n co\\u0301 mu\\u00F4\\u0301n sao che\\u0301p {0}?\n#XFLD\nCopyDialog.NewID=Ba\\u0309n sao cu\\u0309a {0}\n\n\n#XMSG\nTitle.NoGroupTitle=Ti\\u00EAu \\u0111\\u00EA\\u0300 nho\\u0301m cu\\u0309a ph\\u00E2\\u0300n {0} tr\\u00F4\\u0301ng.\n#XMSG\nTitle.UnsufficientRoles=Ga\\u0301n vai tro\\u0300 kh\\u00F4ng \\u0111u\\u0309 \\u0111\\u00EA\\u0309 hi\\u00EA\\u0309n thi\\u0323 n\\u00F4\\u0323i dung\n#XMSG\nTitle.ContentIsNotVisible=N\\u00F4\\u0323i dung se\\u0303 bi\\u0323 \\u00E2\\u0309n \\u0111\\u00F4\\u0301i v\\u01A1\\u0301i ng\\u01B0\\u01A1\\u0300i du\\u0300ng.\n#XMSG\nTitle.ContentNotNavigateable=Se\\u0303 kh\\u00F4ng th\\u00EA\\u0309 \\u0111i\\u00EA\\u0300u h\\u01B0\\u01A1\\u0301ng n\\u00F4\\u0323i dung.\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_zh_CN.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u7EF4\\u62A4\\u9875\\u9762\n\n\n#XBUT\nButton.Add=\\u6DFB\\u52A0\n#XBUT\nButton.Cancel=\\u53D6\\u6D88\n#XBUT\nButton.Copy=\\u590D\\u5236\n#XBUT\nButton.Create=\\u521B\\u5EFA\n#XBUT\nButton.Delete=\\u5220\\u9664\n#XBUT\nButton.Edit=\\u7F16\\u8F91\n#XBUT\nButton.Save=\\u4FDD\\u5B58\n#XBUT\nButton.Ok=\\u786E\\u5B9A\n#XBUT\nButton.ShowCatalogs=\\u5207\\u6362\\u76EE\\u5F55\n#XBUT\nButton.SortCatalogs=\\u5207\\u6362\\u76EE\\u5F55\\u6392\\u5E8F\\u987A\\u5E8F\n#XBUT\nButton.CollapseCatalogs=\\u6298\\u53E0\\u6240\\u6709\\u76EE\\u5F55\n#XBUT\nButton.ExpandCatalogs=\\u5C55\\u5F00\\u6240\\u6709\\u76EE\\u5F55\n#XBUT\nButton.ShowDetails=\\u663E\\u793A\\u8BE6\\u7EC6\\u4FE1\\u606F\n#XBUT\nButton.PagePreview=\\u9875\\u9762\\u9884\\u89C8\n\n\n#XTOL\nTooltip.AddToGroups=\\u6DFB\\u52A0\\u5230\\u7EC4\n#XTOL Tooltip for the search button\nTooltip.Search=\\u641C\\u7D22\n#XTOL\nTooltip.SearchForTiles=\\u641C\\u7D22\\u78C1\\u8D34\n\n\n#XFLD\nLabel.PageID=\\u9875\\u9762\\u6807\\u8BC6\n#XFLD\nLabel.WorkbenchRequest=\\u5DE5\\u4F5C\\u53F0\\u8BF7\\u6C42\n#XFLD\nLabel.Package=\\u5305\n#XFLD\nLabel.TransportInformation=\\u4F20\\u8F93\\u4FE1\\u606F\n#XFLD\nLabel.Details=\\u8BE6\\u7EC6\\u4FE1\\u606F\\uFF1A\n#XFLD\nLabel.ResponseCode=\\u54CD\\u5E94\\u4EE3\\u7801\\uFF1A\n#XFLD\nLabel.Description=\\u63CF\\u8FF0\n#XFLD\nLabel.CreatedBy=\\u521B\\u5EFA\\u8005\n#XFLD\nLabel.CreatedOn=\\u521B\\u5EFA\\u65E5\\u671F\n#XFLD\nLabel.ChangedBy=\\u66F4\\u6539\\u8005\n#XFLD\nLabel.ChangedOn=\\u66F4\\u6539\\u65E5\\u671F\n#XFLD\nLabel.PageTitle=\\u9875\\u9762\\u6807\\u9898\n#XFLD\nLabel.AssignedRole=\\u5DF2\\u5206\\u914D\\u89D2\\u8272\n\n\n#XCOL\nColumn.PageID=\\u6807\\u8BC6\n#XCOL\nColumn.PageTitle=\\u6807\\u9898\n#XCOL\nColumn.PageDescription=\\u63CF\\u8FF0\n#XCOL\nColumn.PageCreatedBy=\\u521B\\u5EFA\\u8005\n#XCOL\nColumn.PageCreatedOn=\\u521B\\u5EFA\\u65E5\\u671F\n#XCOL\nColumn.PageChangedBy=\\u66F4\\u6539\\u8005\n#XCOL\nColumn.PageChangedOn=\\u66F4\\u6539\\u65E5\\u671F\n\n\n#XTOL\nPlaceholder.GroupName=\\u8F93\\u5165\\u7EC4\\u540D\\u79F0\n#XTOL\nPlaceholder.SearchForTiles=\\u641C\\u7D22\\u78C1\\u8D34\n\n#MSG\nMessage.NoGroupTitle=\\u7EC4 {0} \\u6CA1\\u6709\\u6807\\u9898\\u3002\\u4E3A\\u786E\\u4FDD\\u4E00\\u81F4\\u7684\\u7528\\u6237\\u4F53\\u9A8C\\uFF0C\\u5EFA\\u8BAE\\u4E3A\\u6BCF\\u4E2A\\u7EC4\\u8F93\\u5165\\u7EC4\\u540D\\u79F0\\u3002\n#XMSG\nMessage.InvalidGroupTitle=\\u6700\\u597D\\u662F\\u8F93\\u5165\\u7EC4\\u540D\\u79F0\\u3002\n#XMSG\nMessage.NoInternetConnection=\\u8BF7\\u68C0\\u67E5 internet \\u8FDE\\u63A5\\u3002\n#XMSG\nMessage.SavedChanges=\\u6240\\u505A\\u66F4\\u6539\\u5DF2\\u4FDD\\u5B58\\u3002\n#XMSG\nMessage.InvalidPageID=\\u8BF7\\u4EC5\\u4F7F\\u7528\\u4EE5\\u4E0B\\u5B57\\u7B26\\uFF1AA-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u8BF7\\u63D0\\u4F9B\\u9875\\u9762\\u6807\\u8BC6\\u3002\n#XMSG\nMessage.EmptyTitle=\\u8BF7\\u63D0\\u4F9B\\u78C1\\u8D34\\u3002\n#XMSG\nMessage.SuccessDeletePage=\\u6240\\u9009\\u5BF9\\u8C61\\u5DF2\\u5220\\u9664\\u3002\n#XMSG\nMessage.ClipboardCopySuccess=\\u8BE6\\u7EC6\\u4FE1\\u606F\\u5DF2\\u6210\\u529F\\u590D\\u5236\\u3002\n#YMSE\nMessage.ClipboardCopyFail=\\u590D\\u5236\\u8BE6\\u7EC6\\u4FE1\\u606F\\u65F6\\u51FA\\u9519\\u3002\n#XMSG\nMessage.DeletePageConfirmation=\\u662F\\u5426\\u786E\\u5B9E\\u8981\\u5220\\u9664 \\n {0} {1}\\uFF1F\n#XMSG\nMessage.PageCreated=\\u9875\\u9762\\u5DF2\\u521B\\u5EFA\\u3002\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u65E0\\u78C1\\u8D34\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u6CA1\\u6709\\u7EC4\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u52A0\\u8F7D\\u7EC4 "{1}" \\u4E2D\\u7684 {0} \\u78C1\\u8D34\\u5931\\u8D25\\u3002\\n\\n\\u539F\\u56E0\\u6781\\u6709\\u53EF\\u80FD\\u662F SAP Fiori \\u5FEB\\u901F\\u542F\\u52A8\\u677F\\u5185\\u5BB9\\u914D\\u7F6E\\u4E0D\\u5F53\\uFF0C\\u6216\\u7F3A\\u5C11\\u89D2\\u8272\\u5206\\u914D\\u3002\\n\\n\\u5185\\u5BB9\\u5C06\\u5BF9\\u7528\\u6237\\u4E0D\\u53EF\\u89C1\\u3002\\n\\n\\u8981\\u89E3\\u51B3\\u6B64\\u95EE\\u9898\\uFF0C\\u8BF7\\u68C0\\u67E5\\u5206\\u914D\\u7ED9\\u6B64\\u89D2\\u8272\\u7684\\u76EE\\u5F55\\u548C\\u76EE\\u6807\\u6620\\u5C04\\u3002\n#XMSG\nMessage.NavigationTargetError=\\u65E0\\u6CD5\\u89E3\\u6790\\u5BFC\\u822A\\u76EE\\u6807\\u3002\n#XMSG\nMessage.TilesHaveErrors=\\u67D0\\u4E9B\\u78C1\\u8D34\\u6216\\u7EC4\\u6709\\u9519\\u8BEF\\u6216\\u8B66\\u544A\\u3002\\u662F\\u5426\\u786E\\u5B9A\\u8981\\u7EE7\\u7EED\\u4FDD\\u5B58\\uFF1F\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u89E3\\u6790\\u78C1\\u8D34\\u7684\\u5BFC\\u822A\\u76EE\\u6807\\u5931\\u8D25\\uFF1A"{0}"\\u3002\\n\\n\\u539F\\u56E0\\u6781\\u6709\\u53EF\\u80FD\\u662F SAP Fiori \\u5FEB\\u901F\\u542F\\u52A8\\u677F\\u5185\\u5BB9\\u914D\\u7F6E\\u4E0D\\u5F53\\uFF0C\\u6216\\u7F3A\\u5C11\\u89D2\\u8272\\u5206\\u914D\\u3002\\n\\n\\u78C1\\u8D34 "{0}" \\u5C06\\u4F1A\\u663E\\u793A\\u7ED9\\u7528\\u6237\\uFF0C\\u4F46\\u7528\\u6237\\u5C06\\u65E0\\u6CD5\\u4F7F\\u7528\\u6B64\\u78C1\\u8D34\\u8FDB\\u884C\\u5BFC\\u822A\\u3002\n#XMSG\nMessage.DeleteGroup=\\u662F\\u5426\\u786E\\u5B9A\\u8981\\u5220\\u9664\\u7EC4 "{0}"\\uFF1F\n#XMSG\nMessage.PageIsOutdated=\\u5DF2\\u4FDD\\u5B58\\u6B64\\u9875\\u9762\\u7684\\u8F83\\u65B0\\u7248\\u672C\\u3002\n#XMSG\nMessage.SaveChanges=\\u8BF7\\u4FDD\\u5B58\\u6240\\u505A\\u66F4\\u6539\\u3002\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u65B0\\u9875\\u9762\n#XTIT\nTitle.TilesHaveErrors=\\u78C1\\u8D34\\u6709\\u9519\\u8BEF\n#XTIT\nDeleteDialog.Title=\\u5220\\u9664\n#XMSG\nDeleteDialog.Text=\\u662F\\u5426\\u786E\\u5B9A\\u8981\\u5220\\u9664\\u6240\\u9009\\u9875\\u9762\\uFF1F\n#XBUT\nDeleteDialog.ConfirmButton=\\u5220\\u9664\n#XTIT\nDeleteDialog.LockedTitle=\\u9875\\u9762\\u5DF2\\u9501\\u5B9A\n#XMSG\nDeleteDialog.LockedText=\\u6240\\u9009\\u9875\\u9762\\u5DF2\\u7531\\u7528\\u6237 {0} \\u9501\\u5B9A\\u3002\n#XMSG\nDeleteDialog.TransportRequired=\\u8BF7\\u9009\\u62E9\\u4F20\\u8F93\\u4EE5\\u5220\\u9664\\u6240\\u9009\\u9875\\u9762\\u3002\n\n#XMSG\nEditDialog.LockedText=\\u6240\\u9009\\u9875\\u9762\\u5DF2\\u7531\\u7528\\u6237 {0} \\u9501\\u5B9A\\u3002\n#XMSG\nEditDialog.TransportRequired=\\u8BF7\\u9009\\u62E9\\u4F20\\u8F93\\u4EE5\\u7F16\\u8F91\\u6240\\u9009\\u9875\\u9762\\u3002\n#XTIT\nEditDialog.Title=\\u7F16\\u8F91\\u9875\\u9762\n\n#XTIT\nErrorDialog.Title=\\u9519\\u8BEF\n\n#XTIT\nPageOverview.Title=\\u7EF4\\u62A4\\u9875\\u9762\n\n\n#XTIT\nCopyDialog.Title=\\u590D\\u5236\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u662F\\u5426\\u8981\\u590D\\u5236 {0}\\uFF1F\n#XFLD\nCopyDialog.NewID={0} \\u7684\\u526F\\u672C\n\n\n#XMSG\nTitle.NoGroupTitle=\\u7EC4 {0} \\u7684\\u7EC4\\u6807\\u9898\\u4E3A\\u7A7A\\u3002\n#XMSG\nTitle.UnsufficientRoles=\\u89D2\\u8272\\u5206\\u914D\\u4E0D\\u8DB3\\u4EE5\\u663E\\u793A\\u5185\\u5BB9\n#XMSG\nTitle.ContentIsNotVisible=\\u5185\\u5BB9\\u5C06\\u5BF9\\u7528\\u6237\\u4E0D\\u53EF\\u89C1\\u3002\n#XMSG\nTitle.ContentNotNavigateable=\\u5185\\u5BB9\\u5C06\\u65E0\\u6CD5\\u5BFC\\u822A\\u3002\n',
	"sap/ushell/applications/PageComposer/i18n/i18n_zh_TW.properties":'# Translatable texts for the Fiori Launchpad Page Composer application\n# \n\n\n# XTIT: Title for the Maintain Pages Application\nPageComposer.AppTitle=\\u7DAD\\u8B77\\u9801\\u9762\n\n\n#XBUT\nButton.Add=\\u65B0\\u589E\n#XBUT\nButton.Cancel=\\u53D6\\u6D88\n#XBUT\nButton.Copy=\\u8907\\u88FD\n#XBUT\nButton.Create=\\u5EFA\\u7ACB\n#XBUT\nButton.Delete=\\u522A\\u9664\n#XBUT\nButton.Edit=\\u7DE8\\u8F2F\n#XBUT\nButton.Save=\\u5132\\u5B58\n#XBUT\nButton.Ok=\\u78BA\\u5B9A\n#XBUT\nButton.ShowCatalogs=\\u5207\\u63DB\\u76EE\\u9304\n#XBUT\nButton.SortCatalogs=\\u5207\\u63DB\\u76EE\\u9304\\u6392\\u5E8F\\u9806\\u5E8F\n#XBUT\nButton.CollapseCatalogs=\\u6536\\u5408\\u6240\\u6709\\u76EE\\u9304\n#XBUT\nButton.ExpandCatalogs=\\u5C55\\u958B\\u6240\\u6709\\u76EE\\u9304\n#XBUT\nButton.ShowDetails=\\u986F\\u793A\\u660E\\u7D30\n#XBUT\nButton.PagePreview=\\u9801\\u9762\\u9810\\u89BD\n\n\n#XTOL\nTooltip.AddToGroups=\\u65B0\\u589E\\u81F3\\u7FA4\\u7D44\n#XTOL Tooltip for the search button\nTooltip.Search=\\u641C\\u5C0B\n#XTOL\nTooltip.SearchForTiles=\\u641C\\u5C0B\\u529F\\u80FD\\u78DA\n\n\n#XFLD\nLabel.PageID=\\u9801\\u9762 ID\n#XFLD\nLabel.WorkbenchRequest=\\u5DE5\\u4F5C\\u53F0\\u8ACB\\u6C42\n#XFLD\nLabel.Package=\\u5957\\u4EF6\n#XFLD\nLabel.TransportInformation=\\u50B3\\u8F38\\u8CC7\\u8A0A\n#XFLD\nLabel.Details=\\u660E\\u7D30\\uFF1A\n#XFLD\nLabel.ResponseCode=\\u56DE\\u61C9\\u4EE3\\u78BC\\uFF1A\n#XFLD\nLabel.Description=\\u8AAA\\u660E\n#XFLD\nLabel.CreatedBy=\\u5EFA\\u7ACB\\u8005\n#XFLD\nLabel.CreatedOn=\\u5EFA\\u7ACB\\u65E5\\u671F\n#XFLD\nLabel.ChangedBy=\\u66F4\\u6539\\u8005\n#XFLD\nLabel.ChangedOn=\\u66F4\\u6539\\u65E5\\u671F\n#XFLD\nLabel.PageTitle=\\u9801\\u9762\\u6A19\\u984C\n#XFLD\nLabel.AssignedRole=\\u6307\\u6D3E\\u89D2\\u8272\n\n\n#XCOL\nColumn.PageID=ID\n#XCOL\nColumn.PageTitle=\\u6A19\\u984C\n#XCOL\nColumn.PageDescription=\\u8AAA\\u660E\n#XCOL\nColumn.PageCreatedBy=\\u5EFA\\u7ACB\\u8005\n#XCOL\nColumn.PageCreatedOn=\\u5EFA\\u7ACB\\u65E5\\u671F\n#XCOL\nColumn.PageChangedBy=\\u66F4\\u6539\\u8005\n#XCOL\nColumn.PageChangedOn=\\u66F4\\u6539\\u65E5\\u671F\n\n\n#XTOL\nPlaceholder.GroupName=\\u8F38\\u5165\\u7FA4\\u7D44\\u540D\\u7A31\n#XTOL\nPlaceholder.SearchForTiles=\\u641C\\u5C0B\\u529F\\u80FD\\u78DA\n\n#MSG\nMessage.NoGroupTitle=\\u7FA4\\u7D44 {0} \\u6C92\\u6709\\u6A19\\u984C\\uFF1B\\u82E5\\u8981\\u78BA\\u4FDD\\u4E00\\u81F4\\u7684\\u4F7F\\u7528\\u8005\\u9AD4\\u9A57\\uFF0C\\u5EFA\\u8B70\\u60A8\\u8F38\\u5165\\u6BCF\\u500B\\u7FA4\\u7D44\\u7684\\u7FA4\\u7D44\\u540D\\u7A31\\u3002\n#XMSG\nMessage.InvalidGroupTitle=\\u539F\\u5247\\u4E0A\\uFF0C\\u60A8\\u61C9\\u8F38\\u5165\\u7FA4\\u7D44\\u540D\\u7A31\\u3002\n#XMSG\nMessage.NoInternetConnection=\\u8ACB\\u6AA2\\u67E5\\u60A8\\u7684\\u7DB2\\u8DEF\\u9023\\u7DDA\\u3002\n#XMSG\nMessage.SavedChanges=\\u5DF2\\u5132\\u5B58\\u60A8\\u7684\\u66F4\\u6539\\u3002\n#XMSG\nMessage.InvalidPageID=\\u8ACB\\u50C5\\u4F7F\\u7528\\u4EE5\\u4E0B\\u5B57\\u5143\\uFF1AA-Z a-z 0-9 _ /\n#XMSG\nMessage.EmptyPageID=\\u8ACB\\u63D0\\u4F9B\\u9801\\u9762 ID\\u3002\n#XMSG\nMessage.EmptyTitle=\\u8ACB\\u63D0\\u4F9B\\u6A19\\u984C\\u3002\n#XMSG\nMessage.SuccessDeletePage=\\u5DF2\\u522A\\u9664\\u6240\\u9078\\u7269\\u4EF6\\u3002\n#XMSG\nMessage.ClipboardCopySuccess=\\u5DF2\\u6210\\u529F\\u8907\\u88FD\\u660E\\u7D30\\u3002\n#YMSE\nMessage.ClipboardCopyFail=\\u8907\\u88FD\\u660E\\u7D30\\u6642\\u767C\\u751F\\u932F\\u8AA4\\u3002\n#XMSG\nMessage.DeletePageConfirmation=\\u60A8\\u78BA\\u5B9A\\u8981\\u522A\\u9664 \\n {0} {1} \\u55CE\\uFF1F\n#XMSG\nMessage.PageCreated=\\u5DF2\\u5EFA\\u7ACB\\u9801\\u9762\\u3002\n#XMSG: Message displayed inside of the TileSelector when there are no tiles available or when the search found no results\nMessage.NoTiles=\\u6C92\\u6709\\u529F\\u80FD\\u78DA\n#XMSG: Message displayed inside of the TileSelector GroupSelectionPopover when there are no groups\nMessage.NoGroups=\\u6C92\\u6709\\u7FA4\\u7D44\n#YMSG: First parameter {0} is numbers "1.", "2.", "3."; second parameter {1} is the group/section name\nMessage.LoadTileError=\\u7121\\u6CD5\\u5728 "{1}" \\u7FA4\\u7D44\\u4E2D\\u8F09\\u5165 {0} \\u529F\\u80FD\\u78DA\\u3002\\n\\n\\u6700\\u53EF\\u80FD\\u7684\\u539F\\u56E0\\u662F\\u4F7F\\u7528\\u4E0D\\u6B63\\u78BA\\u7684 SAP Fiori \\u555F\\u52D5\\u53F0\\u5167\\u5BB9\\u7D44\\u614B\\uFF0C\\u6216\\u662F\\u7F3A\\u5C11\\u89D2\\u8272\\u6307\\u6D3E\\u3002\\n\\n\\u4F7F\\u7528\\u8005\\u7121\\u6CD5\\u770B\\u5230\\u5167\\u5BB9\\u3002\\n\\n\\u82E5\\u8981\\u89E3\\u6C7A\\u6B64\\u554F\\u984C\\uFF0C\\u8ACB\\u6AA2\\u67E5\\u5DF2\\u6307\\u6D3E\\u7D66\\u6B64\\u89D2\\u8272\\u7684\\u76EE\\u9304\\u548C\\u76EE\\u6A19\\u5C0D\\u6620\\u3002\n#XMSG\nMessage.NavigationTargetError=\\u7121\\u6CD5\\u89E3\\u6C7A\\u700F\\u89BD\\u76EE\\u6A19\\u3002\n#XMSG\nMessage.TilesHaveErrors=\\u90E8\\u4EFD\\u529F\\u80FD\\u78DA\\u6216\\u7FA4\\u7D44\\u767C\\u751F\\u932F\\u8AA4\\u6216\\u8B66\\u544A\\uFF1B\\u60A8\\u78BA\\u5B9A\\u8981\\u7E7C\\u7E8C\\u5132\\u5B58\\u55CE\\uFF1F\n#YMSG: First parameter {0} is the the title of the application launch tile\nMessage.NavTargetResolutionError=\\u7121\\u6CD5\\u89E3\\u6C7A\\u529F\\u80FD\\u78DA "{0}" \\u7684\\u700F\\u89BD\\u76EE\\u6A19\\u3002\\n\\n\\u6700\\u53EF\\u80FD\\u7684\\u539F\\u56E0\\u662F\\u4F7F\\u7528\\u4E0D\\u6B63\\u78BA\\u7684 SAP Fiori \\u555F\\u52D5\\u53F0\\u5167\\u5BB9\\u7D44\\u614B\\uFF0C\\u6216\\u662F\\u7F3A\\u5C11\\u89D2\\u8272\\u6307\\u6D3E\\u3002\\n\\n\\u4F7F\\u7528\\u8005\\u5C07\\u53EF\\u770B\\u5230\\u529F\\u80FD\\u78DA "{0}"\\uFF0C\\u4F46\\u7121\\u6CD5\\u4F7F\\u7528\\u6B64\\u529F\\u80FD\\u78DA\\u9032\\u884C\\u700F\\u89BD\\u3002\n#XMSG\nMessage.DeleteGroup=\\u60A8\\u78BA\\u5B9A\\u8981\\u522A\\u9664\\u7FA4\\u7D44 "{0}" \\u55CE\\uFF1F\n#XMSG\nMessage.PageIsOutdated=\\u5DF2\\u5132\\u5B58\\u6B64\\u9801\\u9762\\u7684\\u8F03\\u65B0\\u7248\\u672C\\u3002\n#XMSG\nMessage.SaveChanges=\\u8ACB\\u5132\\u5B58\\u60A8\\u7684\\u66F4\\u6539\\u3002\n\n\n##############\n# Dialogs\n##############\n\n#XTIT: Dialog Title\nCreatePageDialog.Title=\\u65B0\\u9801\\u9762\n#XTIT\nTitle.TilesHaveErrors=\\u529F\\u80FD\\u78DA\\u767C\\u751F\\u932F\\u8AA4\n#XTIT\nDeleteDialog.Title=\\u522A\\u9664\n#XMSG\nDeleteDialog.Text=\\u60A8\\u78BA\\u5B9A\\u8981\\u522A\\u9664\\u6240\\u9078\\u9801\\u9762\\u55CE\\uFF1F\n#XBUT\nDeleteDialog.ConfirmButton=\\u522A\\u9664\n#XTIT\nDeleteDialog.LockedTitle=\\u5DF2\\u9396\\u4F4F\\u9801\\u9762\n#XMSG\nDeleteDialog.LockedText=\\u4F7F\\u7528\\u8005 {0} \\u9396\\u4F4F\\u6240\\u9078\\u9801\\u9762\\u3002\n#XMSG\nDeleteDialog.TransportRequired=\\u8ACB\\u9078\\u64C7\\u50B3\\u8F38\\u4EE5\\u522A\\u9664\\u6240\\u9078\\u9801\\u9762\\u3002\n\n#XMSG\nEditDialog.LockedText=\\u4F7F\\u7528\\u8005 {0} \\u9396\\u4F4F\\u6240\\u9078\\u9801\\u9762\\u3002\n#XMSG\nEditDialog.TransportRequired=\\u8ACB\\u9078\\u64C7\\u50B3\\u8F38\\u4EE5\\u7DE8\\u8F2F\\u6240\\u9078\\u9801\\u9762\\u3002\n#XTIT\nEditDialog.Title=\\u7DE8\\u8F2F\\u9801\\u9762\n\n#XTIT\nErrorDialog.Title=\\u932F\\u8AA4\n\n#XTIT\nPageOverview.Title=\\u7DAD\\u8B77\\u9801\\u9762\n\n\n#XTIT\nCopyDialog.Title=\\u8907\\u88FD\n#XMSG: Paremeter {0} is the title of the page being copied\nCopyDialog.Message=\\u60A8\\u8981\\u8907\\u88FD {0} \\u55CE\\uFF1F\n#XFLD\nCopyDialog.NewID={0} \\u7684\\u526F\\u672C\n\n\n#XMSG\nTitle.NoGroupTitle=\\u7FA4\\u7D44 {0} \\u7684\\u7FA4\\u7D44\\u6A19\\u984C\\u7A7A\\u767D\\u3002\n#XMSG\nTitle.UnsufficientRoles=\\u89D2\\u8272\\u6307\\u6D3E\\u4E0D\\u8DB3\\uFF0C\\u7121\\u6CD5\\u986F\\u793A\\u5167\\u5BB9\n#XMSG\nTitle.ContentIsNotVisible=\\u4F7F\\u7528\\u8005\\u7121\\u6CD5\\u770B\\u5230\\u5167\\u5BB9\\u3002\n#XMSG\nTitle.ContentNotNavigateable=\\u7121\\u6CD5\\u700F\\u89BD\\u5167\\u5BB9\\u3002\n',
	"sap/ushell/applications/PageComposer/i18n/resources.js":function(){// ${copyright}
/**
 * @fileOverview This file handles the resource bundles.
 */

sap.ui.define(['sap/ui/model/resource/ResourceModel'],
	function(ResourceModel) {
	"use strict";

    // ensure that sap.ushell exists
    var resources = { };

    resources.getTranslationModel = function (sLocale) {
     // create translation resource model
        var oTranslationModel = new ResourceModel({
            bundleUrl : jQuery.sap.getModulePath(
                "sap.ushell.applications.PageComposer.i18n.i18n",
                ".properties"
            ),
            bundleLocale : sLocale
        });
        return oTranslationModel;
    };

    resources.i18nModel = resources.getTranslationModel(sap.ui.getCore().getConfiguration().getLanguage());
    resources.i18n = resources.i18nModel.getResourceBundle();


	return resources;

}, /* bExport= */ true);
},
	"sap/ushell/applications/PageComposer/manifest.json":'{\n    "_version": "1.1.0",\n\n    "sap.app": {\n        "_version": "1.1.0",\n        "i18n": "i18n/i18n.properties",\n        "id": "sap.ushell.applications.PageComposer",\n        "type": "component",\n        "embeddedBy": "",\n        "title": "{{PageComposer.AppTitle}}",\n        "ach": "CA-FLP-COR",\n        "dataSources": {\n            "PageRepositoryService": {\n                "uri": "/sap/opu/odata/UI2/FDM_PAGE_REPOSITORY_SRV/",\n                "type": "OData",\n                "settings": {\n                    "odataVersion": "2.0",\n                    "localUri": "localService/metadata.xml"\n                }\n            }\n        },\n        "cdsViews": [],\n        "offline": false\n    },\n    "sap.ui": {\n        "_version": "1.1.0",\n\n        "technology": "UI5",\n        "icons": {\n            "icon" : "sap-icon://Fiori2/F0003",\n            "favIcon" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/favicon/F0003_Manage_Tasks.ico",\n            "phone" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/57_iPhone_Desktop_Launch.png",\n            "phone@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/114_iPhone-Retina_Web_Clip.png",\n            "tablet" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/72_iPad_Desktop_Launch.png",\n            "tablet@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/144_iPad_Retina_Web_Clip.png",\n            "homeScreenIconPhone" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/57_iPhone_Desktop_Launch.png",\n            "homeScreenIconPhone@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/114_iPhone-Retina_Web_Clip.png",\n            "homeScreenIconTablet" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/72_iPad_Desktop_Launch.png",\n            "homeScreenIconTablet@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0003_Manage_Tasks/144_iPad_Retina_Web_Clip.png",\n            "startupImage320x460" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/320_x_460.png",\n            "startupImage640x920" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/640_x_920.png",\n            "startupImage640x1096" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/640_x_1096.png",\n            "startupImage768x1004" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/768_x_1004.png",\n            "startupImage748x1024" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/1024_x_748.png",\n            "startupImage1536x2008" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/1536_x_2008.png",\n            "startupImage1496x2048" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/2048_x_1496.png"\n        },\n        "deviceTypes": {\n            "desktop": true,\n            "tablet": false,\n            "phone": false\n        },\n        "fullWidth": true\n    },\n    "sap.ui5": {\n        "_version": "1.1.0",\n        "resources": {\n            "js": [],\n            "css": [\n                {\n                    "uri": "css/style.css"\n                }\n            ]\n        },\n        "componentUsages":{\n            "transportInformation": {\n                "name": "sap.ushell_abap.transport",\n                "settings": {},\n                "componentData": {},\n                "manifest" : true\n            }\n        },\n        "dependencies": {\n            "libs": {\n                "sap.f": {\n                    "minVersion": "1.68"\n                },\n                "sap.m": {\n                    "minVersion": "1.68"\n                },\n                "sap.ui.layout": {\n                    "minVersion": "1.68"\n                },\n                "sap.ushell": {\n                    "minVersion": "1.68"\n                }\n            }\n        },\n        "models": {\n            "PageRepository": {\n                "dataSource": "PageRepositoryService",\n                "settings": {\n                    "defaultCountMode": "None",\n                    "skipMetadataAnnotationParsing": true,\n                    "useBatch": true\n                }\n            },\n            "i18n": {\n                "type": "sap.ui.model.resource.ResourceModel",\n                "uri": "i18n/i18n.properties"\n            }\n        },\n        "rootView": {\n            "viewName": "sap.ushell.applications.PageComposer.view.App",\n            "type": "XML",\n            "async": true,\n            "id": "pageComposer"\n        },\n        "handleValidation": false,\n        "config": {\n            "fullWidth": true\n        },\n        "routing": {\n            "config": {\n                "routerClass": "sap.m.routing.Router",\n                "viewType": "XML",\n                "viewPath": "sap.ushell.applications.PageComposer.view",\n                "controlId": "pageComposer",\n                "controlAggregation": "pages",\n                "async": true,\n                "fullWidth" : true\n            },\n            "routes": [\n                {\n                    "pattern": "",\n                    "name": "overview",\n                    "target": "overview"\n                },\n                {\n                    "pattern": "view/{pageId}",\n                    "name": "detail",\n                    "target": "detail"\n                },\n                {\n                    "pattern": "edit/{pageId}",\n                    "name": "edit",\n                    "target": "edit"\n                }\n            ],\n            "targets": {\n                "overview": {\n                    "viewId": "pageOverview",\n                    "viewName": "PageOverview"\n                },\n                "detail": {\n                    "viewId": "detail",\n                    "viewName": "PageDetail"\n                },\n                "edit": {\n                    "viewId": "edit",\n                    "viewName": "PageDetailEdit"\n                }\n            }\n        },\n        "contentDensities": { "compact": true, "cozy": true }\n    }\n}\n',
	"sap/ushell/applications/PageComposer/util/PagePersistence.js":function(){// ${copyright}
/**
 * @fileOverview PagePersistence utility to interact with the /UI2/FDM_PAGE_REPOSITORY_SRV service on ABAP
 * @version ${version}
 */
sap.ui.define([
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (
    resources
) {
    "use strict";

    /**
    * Constructs a new instance of the PagePersistence utility.
    *
    * @param {sap.ui.model.odata.v2.ODataModel} oDataModel The ODataModel for the PageRepositoryService
    * @constructor
    *
    * @since 1.70.0
    *
    * @private
    */
    var PagePersistence = function (oDataModel) {
        this._oODataModel = oDataModel;
        this._oEtags = {};
    };

    /**
    * Returns a promise which resolves to an array of page headers of all available pages.
    *
    * @returns {Promise<object[]>} Resolves to an array of page headers
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.getPages = function () {
        return this._readPages()
            .then(function (pages) {
                for (var i = 0; i < pages.results.length; i++) {
                    this._storeETag(pages.results[i]);
                }
                return pages;
            }.bind(this))
            .then(this._convertODataToPageList)
            .catch(this._rejectWithErrorMessage);
    };

    /**
    * Returns a page
    *
    * @param {string} sPageId The page ID
    * @returns {Promise<object>} Resolves to a page
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.getPage = function (sPageId) {
        return this._readPage(sPageId)
            .then(function (page) {
                this._storeETag(page);
                return page;
            }.bind(this))
            .then(this._convertODataToReferencePage)
            .catch(this._rejectWithErrorMessage);
    };

    /**
    * Creates a new page
    *
    * @param {object} oPageToCreate The new page
    * @returns {Promise} Resolves when the page has been created successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.createPage = function (oPageToCreate) {
        var pageToCreate = this._convertReferencePageToOData(oPageToCreate);

        return this._createPage(pageToCreate).then(this._storeETag.bind(this));
    };

    /**
    * Updates a page. This method expects to get the complete page. Sections and tiles
    * that are left out will be deleted.
    *
    * @param {object} oUpdatedPage The updated page data
    * @returns {Promise} Resolves when the page has been updated successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.updatePage = function (oUpdatedPage) {
        var oUpdatedODataPage = this._convertReferencePageToOData(oUpdatedPage);

        oUpdatedODataPage.modifiedOn = this._oEtags[oUpdatedPage.content.id].modifiedOn;

        return this._createPage(oUpdatedODataPage).then(this._storeETag.bind(this)).catch(this._rejectWithErrorMessage);
    };

    /**
    * Deletes a  page
    *
    * @param {string} sPageId The ID of the page to be deleted
    * @param {string} sTransportId The transport workbench
    * @returns {Promise} Resolves when the page has been deleted successfully
    *
    * @since 1.70.0
    *
    * @protected
    */
    PagePersistence.prototype.deletePage = function (sPageId, sTransportId) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.callFunction("/deletePage", {
                method: "POST",
                urlParameters: {
                    pageId: sPageId,
                    transportId: sTransportId,
                    modifiedOn: this._oEtags[sPageId].modifiedOn
                },
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Reads the headers of the available pages from the server
    *
    * @returns {Promise<object>} Resolves to the page headers in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._readPages = function () {
        return new Promise(function (resolve, reject) {
            this._oODataModel.read("/pageSet", {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Reads a page from the server
    *
    * @param {string} sPageId The page ID
    * @returns {Promise<object>} Resolves to a page in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._readPage = function (sPageId) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.read("/pageSet('" + encodeURIComponent(sPageId) + "')", {
                urlParameters: {
                    "$expand": "sections/tiles"
                },
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Creates a page on the server
    *
    * @param {object} oNewPage The page data
    * @returns {Promise} Page the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._createPage = function (oNewPage) {
        return new Promise(function (resolve, reject) {
            this._oODataModel.create("/pageSet", oNewPage, {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
    * Converts a list of page headers from the OData format into the FLP internal format
    *
    * @param {object[]} aPages The page headers in the OData format
    * @returns {object[]} The page headers in the FLP-internal format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertODataToPageList = function (aPages) {
        return aPages.results.map(function (oPage) {
            return {
                content: {
                    id: oPage.id,
                    title: oPage.title,
                    description: oPage.description,
                    createdBy: oPage.createdBy,
                    createdOn: oPage.createdOn,
                    modifiedBy: oPage.modifiedBy,
                    modifiedOn: oPage.modifiedOn
                },
                metadata: {
                    devclass: oPage.devclass,
                    transportId: oPage.transportId
                }
            };
        });
    };

    /**
    * Converts a reference page from the OData format to the FLP internal format
    *
    * @param {object} oPage The page in the OData format
    * @returns {object} The page in the FLP format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertODataToReferencePage = function (oPage) {
        return {
            content: {
                id: oPage.id,
                title: oPage.title,
                description: oPage.description,
                createdBy: oPage.createdBy,
                createdOn: oPage.createdOn,
                modifiedBy: oPage.modifiedBy,
                modifiedOn: oPage.modifiedOn,
                sections: oPage.sections.results.map(function (section) {
                    return {
                        id: section.id,
                        title: section.title,
                        visualizations: section.tiles.results.map(function (tile) {
                            return {
                                id: tile.id,
                                vizId: tile.catalogTile,
                                inboundPermanentKey: tile.targetMapping
                            };
                        })
                    };
                })
            },
            metadata: {
                transportId: oPage.transportId,
                devclass: oPage.devclass
            }
        };
    };

    /**
    * Converts the reference page from the FLP internal format to the OData format
    *
    * @param {object} oPage The page in the FLP format
    * @returns {object} The page in the OData format
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._convertReferencePageToOData = function (oPage) {
        var oReferencePage = oPage.content,
            oMetadata = oPage.metadata;

        var oODataPage = {
            id: oReferencePage.id,
            title: oReferencePage.title,
            description: oReferencePage.description,
            devclass: oMetadata.devclass,
            transportId: oMetadata.transportId,
            sections: (oReferencePage.sections || []).map(function (section) {
                return {
                    id: section.id,
                    title: section.title,
                    tiles: (section.visualizations || []).map(function (tile) {
                        return {
                            id: tile.id,
                            catalogTile: tile.vizId,
                            targetMapping: tile.inboundPermanentKey
                        };
                    })
                };
            })
        };

        return oODataPage;
    };

    /**
    * Stores the etag for a newly retrieved
    *
    * @param {object} oPage The newly retrieved
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._storeETag = function (oPage) {
        this._oEtags[oPage.id] = {
            // this is used as an etag for the deep update
            modifiedOn: oPage.modifiedOn,
            // this etag is used for deletion
            etag: oPage.__metadata.etag
        };
    };

    /**
    * Extracts the error message from an error object
    *
    * @param {object} oError The error object
    * @returns {Promise} A rejected promise containing the error message
    *
    * @since 1.70.0
    *
    * @private
    */
    PagePersistence.prototype._rejectWithErrorMessage = function (oError) {
        var sErrorMessage;

        if (oError.statusCode === 412) {
            sErrorMessage = resources.i18n.getText("Message.PageIsOutdated");
        } else {
            try {
                sErrorMessage = JSON.parse(oError.responseText).error.message.value || oError.message;
            } catch (error) {
                sErrorMessage = oError.message;
            }
        }
        return Promise.reject(sErrorMessage);
    };

    return PagePersistence;
}, true /* bExport */);
},
	"sap/ushell/applications/PageComposer/util/Transport.js":function(){// ${copyright}

sap.ui.define([
    "sap/ushell/Config",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/Component",
    "sap/ushell/applications/PageComposer/i18n/resources"
], function (Config, ODataModel, Component, resources) {
    "use strict";

    var TransportHelper = function () {};

    /**
     * Creates the oData model
     *
     * @returns {sap.ui.model.odata.v2.ODataModel} The created model
     *
     * @private
     */
    TransportHelper.prototype._getODataModel = function () {
        if (!this._oODataModel) {
            var sTransportServiceUrl = Config.last("/core/pageComposition/transport/serviceUrl");
            this._oODataModel = new ODataModel({
                serviceUrl: sTransportServiceUrl,
                headers: {
                    "sap-language": sap.ushell.Container.getUser().getLanguage()
                },
                defaultCountMode: "None",
                skipMetadataAnnotationParsing: true,
                useBatch: false
            });
        }

        return this._oODataModel;
    };

    /**
     * Returns a promise which resolves to
     * - the transport information if there are results
     * - true if there are no results
     *
     * @param {string} sPageId The pageId to check
     * @returns {Promise<boolean|object>} A promise resolving to the object or true
     *
     * @private
     */
    TransportHelper.prototype._getTransportLockedInformation = function (sPageId) {
        return this._readTransportInformation(sPageId)
            .then(function (oTransport) {
                return oTransport.results.length ? oTransport.results[0] : true;
            });
    };

    /**
     * Reads the transport information for the given pageId
     *
     * @param {string} sPageId The pageId to check
     * @returns {Promise<object>} A promise resolving to a result object
     *
     * @private
     */
    TransportHelper.prototype._readTransportInformation = function (sPageId) {
        var sUrl = "/transportSet";
        var filter = new sap.ui.model.Filter("pageId", sap.ui.model.FilterOperator.EQ, sPageId);
        return new Promise(function (resolve, reject) {
            this._getODataModel().read(sUrl, {
                filters: [filter],
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
     * Checks if a transport is required for the given package name
     *
     * @param {string} sPackageName The package name
     * @returns {Promise<boolean>} A promise resolving to boolean
     *
     * @private
     */
    TransportHelper.prototype._isPackageTransportRequired = function (sPackageName) {
        return this._readPackageInformation(sPackageName)
            .then(function (result) {
                return result.transportRequired;
            });
    };

    /**
     * Reads information for a given package
     *
     * @param {string} sPackageName The package name
     * @returns {Promise<object>} A promise resolving to the result object
     *
     * @private
     */
    TransportHelper.prototype._readPackageInformation = function (sPackageName) {
        var sUrl = "/packageSet('" + encodeURIComponent(sPackageName) + "')";
        return new Promise(function (resolve, reject) {
            this._getODataModel().read(sUrl, {
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    /**
     * Checks if the transport information should be displayed
     *
     * True if the transportId is NOT set but transport is required for the package
     *
     * @param {object} oPage The page object to delete
     * @returns {Promise<boolean>} A promise resolving to the boolean result
     *
     * @private
     */
    TransportHelper.prototype._showTransport = function (oPage) {
        var sPackageName = oPage.metadata.devclass;

        if (oPage && oPage.metadata && !oPage.metadata.transportId) {
            return this._isPackageTransportRequired(sPackageName);
        }

        return Promise.resolve(false);
    };

    /**
     * Returns a function to call when the transport information is changed
     * The returned function adds the transport validation to the given dialog's model
     *
     * @param {sap.ushell.applications.PageComposer.controller.CreatePageDialog} oDialog The dialog controller
     * @returns {function} The change handler function
     *
     * @private
     */
    TransportHelper.prototype._changeHandler = function (oDialog) {
        return function (value) {
            var oModel = oDialog.getModel();
            var oValidation = jQuery.extend({}, oModel.getProperty("/validation"), {
                transport: value
            });
            oModel.setProperty("/validation", oValidation);
        };
    };

    /**
     * Checks if the config value for transport is set to true
     *
     * @returns {boolean} The result
     *
     * @protected
     */
    TransportHelper.prototype.isTransportSupported = function () {
        return Config.last("/core/pageComposition/transport/support");
    };

    /**
     * Adds the transportComponent to the extension point and adds the relevant handlers.
     *
     * @param {sap.ushell.applications.PageComposer.controller.CreatePageDialog} dialog The dialog controller
     * @param {object} transportComponent The component with the transport fields
     * @param {function} onConfirm The confirm function
     * @returns {sap.ushell.applications.PageComposer.controller.CreatePageDialog} The enhanced dialog
     *
     * @protected
     */
    TransportHelper.prototype.enhanceDialogWithTransport = function (dialog, transportComponent, onConfirm) {
        var fnChangeHandler = this._changeHandler(dialog);
        fnChangeHandler(false);
        var fnConfirmHandler = function (pageInfo) {
            var oPageInfo = transportComponent.decorateResultWithTransportInformation(pageInfo);
            onConfirm(oPageInfo);
        };
        transportComponent.attachChangeEventHandler(fnChangeHandler);
        dialog.attachConfirm(fnConfirmHandler);
        dialog.transportExtensionPoint(transportComponent);

        return dialog;
    };

    /**
     * Checks if the EditPage dialog needs to be shown
     *
     * @param {object} page The page to delete
     * @returns {Promise<boolean>} A promise resolving to the boolean result
     *
     * @protected
     */
    TransportHelper.prototype.checkShowTransport = function (page) {
        if (!this.isTransportSupported()) {
            return Promise.resolve(false);
        }

        return this._showTransport(page).then(function (showTransport) {
            return showTransport;
        });
    };

    /**
     * Checks if the EditPage0 dialog should show a locked message
     *
     * @param {object} page The page to edit
     * @returns {Promise<boolean|object>} A promise with the transport information or false if the page is not locked
     *
     * @protected
     */
    TransportHelper.prototype.checkShowLocked = function (page) {
        if (!this.isTransportSupported()) {
            return Promise.resolve(false);
        }

        return this._getTransportLockedInformation(page.content.id).then(function (transportLockedInformation) {
            if (transportLockedInformation.foreignOwner) {
                return transportLockedInformation;
            }
            return false;
        });
    };

    if (!this.transportHelper) {
        this.transportHelper = new TransportHelper();
    }

    return this.transportHelper;
});
},
	"sap/ushell/applications/PageComposer/view/App.view.xml":'<mvc:View\n        controllerName="sap.ushell.applications.PageComposer.controller.App"\n        xmlns="sap.m"\n        xmlns:mvc="sap.ui.core.mvc"\n        height="100%"\n        class="sapUiGlobalBackgroundColor"\n        displayBlock="true">\n    <NavContainer id="pageComposer" />\n</mvc:View>',
	"sap/ushell/applications/PageComposer/view/CopyDialog.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core" >\n    <Dialog\n        title="{i18n>CopyDialog.Title}"\n        id="copyDialog"\n        afterClose="onAfterClose"\n        type="Message">\n        <content>\n            <VBox>\n                <Text text="{parts: [\'i18n>CopyDialog.Message\', \'/page/content/id\'], formatter: \'.formatMessage\'}" />\n                <Label text="{i18n>Label.PageID}" labelFor="copyId" />\n                <Input value="{parts: [\'i18n>CopyDialog.NewID\', \'/page/content/id\'], formatter: \'.formatMessage\'}"\n                       required="true"\n                       id="copyId"/>\n            </VBox>\n        </content>\n\n        <beginButton>\n            <Button text="{i18n>Button.Copy}" press="onConfirm" type="Emphasized"/>\n        </beginButton>\n\n        <endButton>\n            <Button text="{i18n>Button.Cancel}" press="onCancel" />\n        </endButton>\n    </Dialog>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/CreatePageDialog.fragment.xml":'<Dialog\n    xmlns="sap.m"\n    id="createPageDialog"\n    title="{i18n>CreatePageDialog.Title}"\n    beforeOpen=".onBeforeOpen"\n    afterClose=".destroy"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:core="sap.ui.core">\n    <content>\n        <f:SimpleForm editable="true">\n            <Label text="{i18n>Label.PageID}" />\n            <Input\n                maxLength="35"\n                required="true"\n                id="createPageIdInput"\n                change=".onIdChange"\n                liveChange=".onIdLiveChange"\n                valueLiveUpdate="true"\n                value="{ path: \'/id\', type: \'sap.ui.model.type.String\' }" />\n            <Label text="{i18n>Label.PageTitle}" />\n            <Input\n                maxLength="100"\n                required="true"\n                id="createPageTitleInput"\n                liveChange=".onTitleLiveChange"\n                valueLiveUpdate="true"\n                valueStateText="{i18n>Message.EmptyTitle}"\n                value="{ path: \'/title\', type: \'sap.ui.model.type.String\' }" />\n        </f:SimpleForm>\n\n        <core:ComponentContainer id="transportContainer"/>\n    </content>\n    <beginButton>\n        <Button\n            id="createPageSaveButton"\n            type="Emphasized"\n            text="{i18n>Button.Create}"\n            press=".onConfirm"\n            enabled="{ path: \'/validation\', formatter: \'.validate\' }" />\n    </beginButton>\n    <endButton>\n        <Button id="createPageCancelButton" text="{i18n>Button.Cancel}" press=".onCancel" />\n    </endButton>\n</Dialog>\n',
	"sap/ushell/applications/PageComposer/view/DeleteDialog.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core" >\n    <Dialog\n            id="deleteDialog"\n            title="{i18n>DeleteDialog.Title}"\n            type="Message"\n            afterClose=".destroy"\n            state="Warning">\n        <content>\n            <Text text="{/message}" />\n\n            <core:ComponentContainer id="transportContainer"/>\n        </content>\n\n        <beginButton>\n            <Button text="{i18n>DeleteDialog.ConfirmButton}"\n                    press=".onConfirm"\n                    type="Emphasized"\n                    enabled="{ path: \'/validation\', formatter: \'.validate\' }" />\n        </beginButton>\n\n        <endButton>\n            <Button text="{i18n>Button.Cancel}" press="onCancel" />\n        </endButton>\n    </Dialog>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/EditDialog.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core" >\n    <Dialog\n            id="editDialog"\n            title="{i18n>EditDialog.Title}"\n            type="Message"\n            afterClose=".destroy"\n            state="Warning">\n        <content>\n            <Text text="{/message}" />\n\n            <core:ComponentContainer id="transportContainer"/>\n        </content>\n\n        <beginButton>\n            <Button text="{i18n>Button.Save}"\n                    press=".onConfirm"\n                    type="Emphasized"\n                    enabled="{ path: \'/validation\', formatter: \'.validate\' }" />\n        </beginButton>\n\n        <endButton>\n            <Button text="{i18n>Button.Cancel}" press="onCancel" />\n        </endButton>\n    </Dialog>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/ErrorDialog.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core" >\n    <Dialog\n        id="sapUshellPagesErrorDialog"\n        title="{i18n>ErrorDialog.Title}"\n        type="Message"\n        afterClose=".onAfterClose"\n        contentWidth="30rem"\n        state="Error">\n        <content>\n            <VBox>\n                <Text\n                    text="{/message}"\n                    class="sapUiSmallMarginBottom" />\n                <Link\n                    text="{i18n>Button.ShowDetails}"\n                    visible="{=!${/showDetails}}"\n                    press=".onShowDetails" />\n            </VBox>\n            <VBox visible="{/showDetails}">\n                <Text text="{i18n>Label.ResponseCode} {/statusCode} - {/statusText}" class="sapUiSmallMarginBottom" />\n                <Text text="{i18n>Label.Details}" />\n                <Text text="{/description}" renderWhitespace="true" />\n            </VBox>\n        </content>\n\n        <buttons>\n            <Button text="{i18n>Button.Ok}" press=".onConfirm" />\n            <Button text="{i18n>Button.Copy}" press=".onCopy" />\n        </buttons>\n    </Dialog>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/Page.fragment.xml":'<core:FragmentDefinition\n    xmlns:core="sap.ui.core"\n    xmlns:dnd="sap.ui.core.dnd"\n    xmlns="sap.ushell.ui.launchpad">\n    <Page\n        id="page"\n        edit="{/edit}"\n        enableGroupReordering="{/edit}"\n        groups="{/page/content/sections}"\n        groupDrop=".Page.moveGroup"\n        addGroupButtonPressed=".Page.addGroup">\n        <groups>\n            <Section\n                editable="{/edit}"\n                enableAddButton="false"\n                enableGridBreakpoints="{= !${/edit}}"\n                enableResetButton="false"\n                enableShowHideButton="false"\n                enableWidgetReordering="{/edit}"\n                title="{title}"\n                showNoWidgetsText="true"\n                sizeBehavior="{viewSettings>/sizeBehavior}"\n                widgets="{\n                    path: \'visualizations\',\n                    factory: \'.Page.itemFactory\',\n                    key: \'vizId\'\n                }"\n                delete=".Page.deleteGroup"\n                titleChange="._pageUpdated"\n                widgetDrop=".Page.moveContent" />\n        </groups>\n        <dragDropConfig>\n            <dnd:DropInfo\n                groupName="Section"\n                targetAggregation="groups"\n                drop=".Page.addContent" />\n        </dragDropConfig>\n    </Page>\n</core:FragmentDefinition>\n',
	"sap/ushell/applications/PageComposer/view/PageDetail.view.xml":'<mvc:View\n        controllerName="sap.ushell.applications.PageComposer.controller.PageDetail"\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"\n        xmlns:f="sap.f"\n        xmlns:mvc="sap.ui.core.mvc">\n    <f:DynamicPage id="pageDetail" fitContent="true" class="sapUshellPageLayout" backgroundDesign="Transparent">\n        <f:title>\n            <f:DynamicPageTitle>\n                <f:heading>\n                    <Title text="{/page/content/title}"/>\n                </f:heading>\n                <f:expandedContent>\n                    <HBox displayInline="true">\n                        <ObjectAttribute title="{i18n>Label.PageID}" text="{/page/content/id}"/>\n                        <!-- TBD: make visible when the role ID is available -->\n                        <ObjectAttribute\n                            visible="false"\n                            title="{i18n>Label.AssignedRole}"\n                            text=""\n                            class="sapUiLargeMarginBegin"/>\n                    </HBox>\n                </f:expandedContent>\n                <f:snappedContent>\n                    <HBox displayInline="true">\n                        <ObjectAttribute title="{i18n>Label.PageID}" text="{/page/content/id}"/>\n                        <!-- TBD: make visible when the role ID is available -->\n                        <ObjectAttribute\n                            visible="false"\n                            title="{i18n>Label.AssignedRole}"\n                            text="assigned role"\n                            class="sapUiLargeMarginBegin"/>\n                    </HBox>\n                </f:snappedContent>\n                <f:actions>\n                    <Button\n                            text="{i18n>Button.Edit}"\n                            type="Emphasized"\n                            press="onEdit"/>\n                    <!-- Do not show the Copy button until the functionality is implemented -->\n                    <Button\n                            visible="false"\n                            text="{i18n>Button.Copy}"\n                            type="Transparent"\n                            press="onCopy"/>\n                    <Button\n                            text="{i18n>Button.Delete}"\n                            type="Transparent"\n                            press="onDelete"/>\n                    <Button\n                            text="{i18n>Button.PagePreview}"\n                            type="Transparent"\n                            press="preview(${/page/content/id})"/>\n                </f:actions>\n            </f:DynamicPageTitle>\n        </f:title>\n        <f:header>\n            <f:DynamicPageHeader pinnable="false">\n                <core:Fragment fragmentName="sap.ushell.applications.PageComposer.view.PageInfo" type="XML"/>\n            </f:DynamicPageHeader>\n        </f:header>\n        <f:content>\n            <core:Fragment fragmentName="sap.ushell.applications.PageComposer.view.Page" type="XML" />\n        </f:content>\n    </f:DynamicPage>\n</mvc:View>\n',
	"sap/ushell/applications/PageComposer/view/PageDetailEdit.view.xml":'<mvc:View\n    controllerName="sap.ushell.applications.PageComposer.controller.PageDetailEdit"\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:l="sap.ui.layout"\n    xmlns:f="sap.f"\n    xmlns:mvc="sap.ui.core.mvc">\n    <f:DynamicPage\n        id="pageDetailEdit"\n        fitContent="true"\n        headerExpanded="{/headerExpanded}"\n        backgroundDesign="Transparent"\n        class="sapUiNoContentPadding">\n        <f:title>\n            <f:DynamicPageTitle>\n                <f:heading>\n                    <Title text="{/page/content/title}" wrapping="true" />\n                </f:heading>\n                <f:expandedContent>\n                    <HBox displayInline="true">\n                        <ObjectAttribute title="{i18n>Label.PageID}" text="{/page/content/id}" />\n                        <!-- TBD: make visible when the role ID is available -->\n                        <ObjectAttribute\n                            visible="false"\n                            title="{i18n>Label.AssignedRole}"\n                            text=""\n                            class="sapUiLargeMarginBegin" />\n                    </HBox>\n                </f:expandedContent>\n                <f:snappedContent>\n                    <!-- Maximize working area when the header is snapped -->\n                </f:snappedContent>\n                <f:actions>\n                    <Button text="{i18n>Button.ShowCatalogs}" type="Transparent" press=".onUpdateSideContentVisibility" />\n                    <Button text="{i18n>Button.PagePreview}" type="Transparent" press=".preview(${/page/content/id})" />\n                </f:actions>\n            </f:DynamicPageTitle>\n        </f:title>\n        <f:header>\n            <f:DynamicPageHeader pinnable="false">\n                <core:Fragment fragmentName="sap.ushell.applications.PageComposer.view.PageInfoEdit" type="XML" />\n            </f:DynamicPageHeader>\n        </f:header>\n        <f:content>\n            <Page showHeader="false">\n                <content>\n                    <l:DynamicSideContent\n                        id="layoutContent"\n                        sideContentFallDown="BelowM"\n                        sideContentPosition="End"\n                        containerQuery="true">\n                        <l:mainContent>\n                            <core:Fragment fragmentName="sap.ushell.applications.PageComposer.view.Page" type="XML" />\n                        </l:mainContent>\n                        <l:sideContent>\n                            <core:Fragment fragmentName="sap.ushell.applications.PageComposer.view.TileSelector" type="XML" />\n                        </l:sideContent>\n                    </l:DynamicSideContent>\n                </content>\n                <footer>\n                    <OverflowToolbar id="footer">\n                        <Button icon="sap-icon://message-popup" text="{/errorslength}" type="Emphasized" press=".handleMessagePopoverPress" visible="{= !!${/errorslength} }"/>\n                        <ToolbarSpacer />\n                        <Button text="{i18n>Button.Save}" type="Emphasized" press=".onSave" />\n                        <Button text="{i18n>Button.Cancel}" type="Transparent" press=".onCancel" />\n                    </OverflowToolbar>\n                </footer>\n            </Page>\n        </f:content>\n    </f:DynamicPage>\n</mvc:View>\n',
	"sap/ushell/applications/PageComposer/view/PageInfo.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"\n        xmlns:form="sap.ui.layout.form" >\n    <form:Form id="pageInfoForm" editable="false">\n        <form:layout>\n            <form:ResponsiveGridLayout\n                labelSpanXL="4"\n                labelSpanL= "4"\n                labelSpanM="4"\n                labelSpanS="12"\n                adjusLabelSpan="true"\n                emptySpanXL="0"\n                emptySpanL="0"\n                emptySpanM="0"\n                emptySpanS="0"\n                columnsXL="3"\n                columnsL="3"\n                columnsM="1"/>\n        </form:layout>\n        <form:formContainers>\n            <form:FormContainer class="sapUiNoContentPadding">\n                <form:formElements>\n                    <form:FormElement label="{i18n>Label.Description}">\n                        <Text text="{/page/content/description}" maxLines="2" id="pageInfoDescription"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n\n            <form:FormContainer>\n                <form:formElements>\n                    <form:FormElement label="{i18n>Label.CreatedBy}" >\n                        <Text text="{/page/content/createdBy}" id="pageInfoCreatedBy"/>\n                    </form:FormElement>\n                    <form:FormElement label="{i18n>Label.CreatedOn}" >\n                        <Text\n                            text="{\n                                path: \'/page/content/createdOn\',\n                                type: \'sap.ui.model.type.Date\',\n                                formatOptions: {style: \'medium\'}\n                            }"\n                            id="pageDetailCreatedOn"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n\n            <form:FormContainer>\n                <form:formElements>\n                    <form:FormElement label="{i18n>Label.ChangedBy}">\n                        <Text text="{/page/content/modifiedBy}" id="pageInfoModifiedBy"/>\n                    </form:FormElement>\n                    <form:FormElement label="{i18n>Label.ChangedOn}">\n                        <Text\n                            text="{\n                                path: \'/page/content/modifiedOn\',\n                                type: \'sap.ui.model.type.Date\',\n                                formatOptions: {style: \'medium\'}\n                            }"\n                            id="pageDetailModifiedOn"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n        </form:formContainers>\n    </form:Form>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/PageInfoEdit.fragment.xml":'<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"\n        xmlns:form="sap.ui.layout.form" >\n    <form:Form id="pageInfoEditForm" editable="true">\n        <form:layout>\n            <form:ResponsiveGridLayout\n                labelSpanXL="3"\n                labelSpanL="3"\n                labelSpanM="3"\n                labelSpanS="12"\n                emptySpanXL="0"\n                emptySpanL="0"\n                emptySpanM="0"\n                emptySpanS="0"\n                columnsXL="3"\n                columnsL="3"\n                columnsM="1"/>\n        </form:layout>\n        <form:formContainers>\n            <form:FormContainer class="sapUiNoContentPadding">\n                <form:formElements>\n\n                    <form:FormElement label="{i18n>Label.PageTitle}">\n                        <Input\n                            value="{/page/content/title}"\n                            required="true"\n                            id="pageInfoEditTitle"\n                            valueStateText="{i18n>Message.EmptyTitle}"\n                            liveChange="onTitleChange"\n                            valueLiveUpdate="true"/>\n                    </form:FormElement>\n\n                    <form:FormElement label="{i18n>Label.Description}">\n                        <TextArea\n                            value="{/page/content/description}"\n                            rows="2"\n                            maxLength="100"\n                            id="pageInfoEditDescription"\n                            valueLiveUpdate="true"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n\n            <form:FormContainer>\n                <form:formElements>\n                    <form:FormElement label="{i18n>Label.CreatedBy}" >\n                        <Text text="{/page/content/createdBy}" id="pageInfoEditCreatedBy"/>\n                    </form:FormElement>\n                    <form:FormElement label="{i18n>Label.CreatedOn}" >\n                        <Text\n                            text="{\n                                path: \'/page/content/createdOn\',\n                                type: \'sap.ui.model.type.Date\',\n                                formatOptions: {style: \'medium\'}\n                            }"\n                            id="pageDetailEditCreatedOn"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n\n            <form:FormContainer>\n                <form:formElements>\n                    <form:FormElement label="{i18n>Label.ChangedBy}">\n                        <Text text="{/page/content/modifiedBy}" id="pageInfoEditModifiedBy"/>\n                    </form:FormElement>\n                    <form:FormElement label="{i18n>Label.ChangedOn}">\n                        <Text\n                            text="{\n                                path: \'/page/content/modifiedOn\',\n                                type: \'sap.ui.model.type.Date\',\n                                formatOptions: {style: \'medium\'}\n                            }"\n                            id="pageDetailCreatedOn"/>\n                    </form:FormElement>\n                </form:formElements>\n            </form:FormContainer>\n        </form:formContainers>\n    </form:Form>\n</core:FragmentDefinition>',
	"sap/ushell/applications/PageComposer/view/PageOverview.view.xml":'<mvc:View xmlns:mvc="sap.ui.core.mvc"\n          xmlns="sap.m"\n          height="100%"\n          controllerName="sap.ushell.applications.PageComposer.controller.PageOverview">\n\n    <Page id="pageOverview">\n        <customHeader>\n            <Bar>\n                <contentLeft>\n                    <Title text="{i18n>PageOverview.Title}" class="sapUiMediumMarginBegin" />\n                </contentLeft>\n            </Bar>\n        </customHeader>\n        <content>\n            <Table\n                class="sapUiMediumMarginBeginEnd sapUiTinyMarginTopBottom sapUiForceWidthAuto"\n                id="table"\n                busy="{/busy}"\n                items="{\n                    path: \'/pages\',\n                    key: \'id\',\n                    sorter : {\n                        path : \'content/modifiedOn\',\n                        descending: \'true\'\n                    }\n                }"\n                itemPress=".onItemPress"\n                selectionChange=".onSelectionChange"\n                updateFinished=".onTableUpdate"\n                mode="SingleSelectLeft"\n                sticky="ColumnHeaders">\n                <headerToolbar>\n                    <OverflowToolbar design="Solid">\n                        <ToolbarSpacer/>\n                        <SearchField\n                            showRefreshButton="false"\n                            tooltip="{i18n>Tooltip.Search}"\n                            search=".onSearch"\n                            width="auto">\n                        </SearchField>\n                        <Button\n                            id="addButton"\n                            text="{i18n>Button.Create}"\n                            type="Transparent"\n                            press=".onAdd"/>\n                        <Button\n                            id="deleteButton"\n                            text="{i18n>Button.Delete}"\n                            type="Transparent"\n                            enabled="{buttonStates>/isDeleteEnabled}"\n                            press=".onDelete"/>\n                    </OverflowToolbar>\n                </headerToolbar>\n                <columns>\n                    <Column>\n                        <Text text="{i18n>Column.PageID} / {i18n>Column.PageTitle}"/>\n                    </Column>\n                    <Column>\n                        <Text text="{i18n>Column.PageDescription}"/>\n                    </Column>\n                    <Column width="10%">\n                        <Text text="{i18n>Column.PageCreatedBy}" class="sapUiSmallMarginBegin"/>\n                    </Column>\n                    <Column hAlign="End" width="10%">\n                        <Text text="{i18n>Column.PageCreatedOn}" class="sapUiSmallMarginEnd"/>\n                    </Column>\n                    <Column width="10%">\n                        <Text text="{i18n>Column.PageChangedBy}" class="sapUiSmallMarginBegin"/>\n                    </Column>\n                    <Column hAlign="End" width="10%">\n                        <Text text="{i18n>Column.PageChangedOn}" class="sapUiSmallMarginEnd"/>\n                    </Column>\n                    <Column hAlign="End" width="5%">\n                    </Column>\n                </columns>\n                <items>\n                    <ColumnListItem  type="Navigation">\n                        <cells>\n                            <ObjectIdentifier title="{content/id}" text="{content/title}"/>\n                        </cells>\n                        <cells>\n                            <Text text="{content/description}"/>\n                        </cells>\n                        <cells>\n                            <Text text="{content/createdBy}" class="sapUiSmallMarginBegin"/>\n                        </cells>\n                        <cells>\n                            <Text\n                                text="{\n                                    path: \'content/createdOn\',\n                                    type: \'sap.ui.model.type.Date\',\n                                    formatOptions: {style: \'medium\'}\n                                }"\n                                class="sapUiSmallMarginEnd"/>\n                        </cells>\n                        <cells>\n                            <Text text="{content/modifiedBy}" class="sapUiSmallMarginBegin"/>\n                        </cells>\n                        <cells>\n                            <Text\n                                text="{\n                                    path: \'content/modifiedOn\',\n                                    type: \'sap.ui.model.type.Date\',\n                                    formatOptions: {style: \'medium\'}\n                                }"\n                                class="sapUiSmallMarginEnd"/>\n                        </cells>\n                        <cells>\n                            <Button press=".onEdit" icon="sap-icon://edit" type="Transparent"/>\n                        </cells>\n                    </ColumnListItem>\n                </items>\n            </Table>\n        </content>\n\n    </Page>\n\n</mvc:View>\n',
	"sap/ushell/applications/PageComposer/view/TileSelector.fragment.xml":'<Page\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:dnd="sap.ui.core.dnd"\n    id="tileSelector">\n    <layoutData><FlexItemData growFactor="1" /></layoutData> <!-- workaround for fragment used inside of a flex container -->\n    <customHeader>\n        <OverflowToolbar id="tileSelectorToolbar">\n            <SearchField\n                showRefreshButton="false"\n                width="auto"\n                liveChange=".TileSelector.onSearchTiles"\n                search=".TileSelector.onSearchTiles"\n                value="{/searchText}"\n                tooltip="{i18n>Tooltip.SearchForTiles}"\n                placeholder="{i18n>Placeholder.SearchForTiles}" />\n            <ToolbarSpacer />\n            <Button\n                id="tileSelectorAddButton"\n                type="Transparent"\n                press=".TileSelector.onAddTiles"\n                text="{i18n>Button.Add}" />\n            <OverflowToolbarButton\n                icon="sap-icon://sort"\n                press=".TileSelector.onSortCatalogsToggle"\n                text="{i18n>Button.SortCatalogs}"\n                tooltip="{i18n>Button.SortCatalogs}" />\n            <OverflowToolbarButton\n                icon="sap-icon://collapse-all"\n                press=".TileSelector.onCollapseAllCatalogs"\n                text="{i18n>Button.CollapseCatalogs}"\n                tooltip="{i18n>Button.CollapseCatalogs}" />\n            <OverflowToolbarButton\n                icon="sap-icon://expand-all"\n                press=".TileSelector.onExpandAllCatalogs"\n                text="{i18n>Button.ExpandCatalogs}"\n                tooltip="{i18n>Button.ExpandCatalogs}" />\n        </OverflowToolbar>\n    </customHeader>\n    <content>\n        <Tree\n            id="tileSelectorList"\n            mode="MultiSelect"\n            modeAnimationOn="false"\n            itemPress=".TileSelector.onCatalogItemPress"\n            items="{ path: \'catalogs>/catalogs\', key: \'vizId\' }"\n            noDataText="{i18n>Message.NoTiles}">\n            <items>\n                <CustomTreeItem\n                    class="sapUshellTileSelectorListItem"\n                    type="{=!!${catalogs>catalogTitle} ? \'Active\' : \'Inactive\'}"> <!-- only catalogs should fire "onCatalogItemPress" -->\n                    <FlexBox class="sapUiTinyMargin" width="100%">\n                        <items>\n                            <HBox justifyContent="SpaceBetween" alignItems="Center" width="100%">\n                                <!-- TODO: do not display tile icon until specification is ready -->\n                                <!-- <core:Icon visible="{=!${catalogs>catalogTitle}}" src="{catalogs>icon}" size="1.5rem" width="1.5rem" class="sapUiSmallMarginEnd" /> -->\n                                <VBox width="0">\n                                    <layoutData><FlexItemData growFactor="1" /></layoutData>\n                                    <Title visible="{=!!${catalogs>catalogTitle}}" text="{catalogs>catalogTitle}" />\n                                    <Title visible="{=!!${catalogs>title}}" text="{catalogs>title}" />\n                                    <Text visible="{=!!${catalogs>subtitle}}" text="{catalogs>subtitle}" />\n                                </VBox>\n                                <Button\n                                    visible="{=!${catalogs>catalogTitle}}"\n                                    type="Transparent"\n                                    press=".TileSelector.onAddTiles"\n                                    text="{i18n>Button.Add}">\n                                </Button>\n                            </HBox>\n                        </items>\n                    </FlexBox>\n                </CustomTreeItem>\n            </items>\n            <dragDropConfig>\n                <dnd:DragInfo\n                    groupName="Section"\n                    sourceAggregation="items"\n                    dragStart=".TileSelector.onDragStart" />\n            </dragDropConfig>\n        </Tree>\n    </content>\n</Page>\n'
},"Component-preload"
);
