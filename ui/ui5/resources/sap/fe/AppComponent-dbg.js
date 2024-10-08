/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// ----------------------------------------------------------------------------------
// Provides base class sap.fe.AppComponent for all generic app components
// ----------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/m/NavContainer",
		"sap/fe/core/BusyHelper",
		"sap/fe/model/DraftModel",
		"sap/fe/controllerextensions/Routing",
		"sap/ui/core/routing/HashChanger",
		"sap/ui/model/resource/ResourceModel",
		"sap/base/Log"
	],
	function(UIComponent, NavContainer, BusyHelper, DraftModel, Routing, HashChanger, ResourceModel, Log) {
		"use strict";

		var AppComponent = UIComponent.extend("sap.fe.AppComponent", {
			metadata: {
				config: {
					fullWidth: true
				},
				manifest: {
					"sap.ui5": {
						services: {
							resourceModel: {
								factoryName: "sap.fe.services.ResourceModelService",
								"startup": "waitFor",
								"settings": {
									"bundleName": "sap/fe/messagebundle",
									"modelName": "sap.fe.i18n"
								}
							},
							namedBindingModel: {
								factoryName: "sap.fe.services.NamedBindingModelService",
								"startup": "waitFor"
							}
						}
					}
				},
				designtime: "sap/fe/designtime/AppComponent.designtime",

				routing: {
					"config": {
						"routerClass": "sap.m.routing.Router",
						"viewType": "XML",
						"controlId": "appContent",
						"controlAggregation": "pages",
						"async": true,
						"containerOptions": {
							"propagateModel": true
						}
					}
				},

				library: "sap.fe"
			},

			_getText: function(sId) {
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe");
				return oResourceBundle.getText(sId);
			},

			constructor: function() {
				this._oRouting = new Routing();
				this._oTemplateContract = {
					oAppComponent: this
				};

				UIComponent.apply(this, arguments);
				return this.getInterface();
			},

			init: function() {
				var oShellServiceFactory;

				oShellServiceFactory = sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.ShellUIService");
				this._oTemplateContract.oShellServicePromise =
					(oShellServiceFactory && oShellServiceFactory.createInstance()) || Promise.reject();
				this._oTemplateContract.oShellServicePromise.catch(function() {
					Log.warning("No ShellService available");
				});

				var oModel = this.getModel();
				if (oModel) {
					// upgrade the model to a named binding model
					// we call the UIComponent init once we upgraded our model to a named binding model
					UIComponent.prototype.init.apply(this, arguments);

					if (this._oTemplateContract.oBusyHelper) {
						this._oTemplateContract.oBusyHelper.setBusy(this._oTemplateContract.oShellServicePromise);
						this._oTemplateContract.oBusyHelper.setBusyReason("initAppComponent", false);
					}
					// Test if draft Model
					DraftModel.isDraftModel(oModel).then(
						function(bIsDraft) {
							if (bIsDraft) {
								// service contains a draft entity therefore upgrade the model to a draft model
								DraftModel.upgrade(oModel).then(
									function() {
										this.setModel(oModel.getDraftAccessModel(), "$draft");
									}.bind(this)
								);
							}
						}.bind(this)
					);

					// Error handling for erroneous metadata request
					oModel
						.getMetaModel()
						.requestObject("/$EntityContainer/")
						.catch(
							function(oError) {
								var oNavContainer = this.getRootControl(),
									that = this;

								that._oRouting.navigateToMessagePage(that._getText("SAPFE_APPSTART_TECHNICAL_ISSUES"), {
									title: that._getText("SAPFE_ERROR"),
									description: oError.message,
									navContainer: oNavContainer
								});
							}.bind(this)
						);
				}
				//
				// var oI18nModel = new ResourceModel({
				// 	bundleName: "sap/fe/messagebundle",
				// 	async: true
				// });
				//
				// oI18nModel.getResourceBundle().then(function(oResourceBundle) {
				// 	// once the library is loaded provide sync access
				// 	oI18nModel.getResourceBundle = function() {
				// 		return oResourceBundle;
				// 	};
				// });
				//
				// this.setModel(oI18nModel, "sap.fe.i18n");
			},

			exit: function() {
				this._oRouting.fireOnAfterNavigation();

				if (this._oTemplateContract.oNavContainer) {
					this._oTemplateContract.oNavContainer.destroy();
				}
			},

			createContent: function() {
				// Method must only be called once
				if (!this._oTemplateContract.bContentCreated) {
					var oManifestUI5 = this.getManifestEntry("sap.ui5");
					if (!oManifestUI5.rootView) {
						// TODO: to be checked if it's really required
						// When we navigate to OP from related apps the previous appContent is still present which results in duplicate id issue
						if (sap.ui.getCore().byId("appContent")) {
							sap.ui
								.getCore()
								.byId("appContent")
								.destroy();
						}
						this._oTemplateContract.oNavContainer = new NavContainer({
							// TODO: to be checked if and why we need to add the app component ID
							id: "appContent"
						});
						this._oTemplateContract.oNavContainer;
					} else {
						this._oTemplateContract.oNavContainer = UIComponent.prototype.createContent.apply(this, arguments);
					}
					this._oTemplateContract.oBusyHelper = new BusyHelper(this._oTemplateContract);
					this._oTemplateContract.oBusyHelper.setBusyReason("initAppComponent", true, true);

					//TODO: First Version, needs to rework
					this._oRouting.initializeRouting(this);
					this._oTemplateContract.bContentCreated = true;
				}

				return this._oTemplateContract.oNavContainer;
			},

			getMetaModel: function() {
				return this.getModel().getMetaModel();
			}
		});

		return AppComponent;
	}
);
