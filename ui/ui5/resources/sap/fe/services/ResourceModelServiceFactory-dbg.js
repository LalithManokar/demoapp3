sap.ui.define(
	["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/resource/ResourceModel"],
	function(Service, ServiceFactory, ResourceModel) {
		"use strict";

		var ResourceModelService = Service.extend("sap.fe.services.ResourceModelService", {
			initPromise: Promise.resolve(),
			init: function() {
				var that = this;
				var oContext = this.getContext();
				var mSettings = oContext.settings;
				this.oFactory = oContext.factory;
				this.oResourceModel = new ResourceModel({ bundleName: mSettings.bundleName, async: true });
				if (oContext.scopeType === "component") {
					var oComponent = oContext.scopeObject;
					oComponent.setModel(this.oResourceModel, mSettings.modelName);
				}
				this.initPromise = new Promise(function(resolve, reject) {
					that.oResourceModel.attachRequestCompleted(function() {
						resolve(that);
					});
					that.oResourceModel.attachRequestFailed(reject);
				});
			},
			getResourceModel: function() {
				return this.oResourceModel;
			},
			exit: function() {
				// Deregister global instance
				this.oFactory.removeGlobalInstance();
			}
		});

		return ServiceFactory.extend("sap.fe.services.ResourceModelServiceFactory", {
			_oGlobalInstance: null,
			createInstance: function(oServiceContext) {
				if (!this._oGlobalInstance) {
					this._oGlobalInstance = new ResourceModelService(Object.assign({ factory: this }, oServiceContext));
				}
				return this._oGlobalInstance.initPromise;
			},
			removeGlobalInstance: function() {
				this._oGlobalInstance = null;
			}
		});
	},
	true
);
