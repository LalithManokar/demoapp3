sap.ui.define(
	["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/fe/model/NamedBindingModel", "sap/ui/core/Component"],
	function(Service, ServiceFactory, NamedBindingModel, Component) {
		"use strict";

		var NamedBindingModelService = Service.extend("sap.fe.services.NamedBindingModelService", {
			initPromise: Promise.resolve(this),
			init: function() {
				var that = this;
				var oContext = this.getContext();
				var mSettings = oContext.settings;
				var sModelName = mSettings.modelName;
				if (oContext.scopeType === "component") {
					var oComponent = oContext.scopeObject;
					var oAppComponent = Component.getOwnerComponentFor(oComponent);
					var oODataModel = oComponent.getModel(sModelName);
					// In case the service is used as in a child component we shall retrieve the parent modelBre
					if (!oODataModel) {
						oODataModel = oAppComponent.getModel(sModelName);
					}
					this.initPromise = NamedBindingModel.upgrade(oODataModel).then(function() {
						return that;
					});
				}
			},
			getResourceModel: function() {
				return this.oResourceModel;
			}
		});

		return ServiceFactory.extend("sap.fe.services.NamedBindingModelServiceFactory", {
			_oGlobalInstance: null,
			createInstance: function(oServiceContext) {
				var oNamedBindingModelService = new NamedBindingModelService(oServiceContext);
				return oNamedBindingModelService.initPromise;
			}
		});
	},
	true
);
