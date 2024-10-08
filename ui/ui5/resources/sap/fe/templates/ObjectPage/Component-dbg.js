/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/fe/core/TemplateComponent", "sap/ui/model/odata/v4/ODataListBinding"],
	function(TemplateComponent, ODataListBinding) {
		"use strict";

		var ObjectPageComponent = TemplateComponent.extend("sap.fe.templates.ObjectPage.Component", {
			metadata: {
				properties: {},
				library: "sap.fe",
				manifest: "json"
			},

			onBeforeBinding: function(oContext, mParameters) {
				// for now we just forward this to the object page controller
				return this.getRootControl()
					.getController()
					.onBeforeBinding(oContext, mParameters);
			},

			onAfterBinding: function(oContext, mParameters) {
				// for now we just forward this to the object page controller
				this.getRootControl()
					.getController()
					.onAfterBinding(oContext, mParameters);
			},

			// TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
			// object page - for now keep it here
			createDeferredContext: function(sPath) {
				var oListBinding,
					that = this;

				oListBinding = new ODataListBinding(this.getModel(), sPath.replace("(...)", ""));

				var oView = this.getRootControl();
				var oNavContainer = oView
					.getController()
					.getOwnerComponent()
					.getRootControl();
				oNavContainer.setBusy(true);

				// for now wait until the view and the controller is created
				that.getRootControl()
					.getController()
					.editFlow.createDocument(oListBinding, {
						creationMode: "Sync",
						noHistoryEntry: true
					})
					.catch(function() {
						// the creation failed or was aborted by the user - showing the object page doesn't make any sense
						// now - for now just use window.history.back to navigate back
						oNavContainer.setBusy(false);
						window.history.back();
					});
			},

			getViewData: function() {
				var oViewData = {};
				return oViewData;
			},

			exit: function() {
				var oObjectPage = this.getRootControl();
				if (oObjectPage.getBindingContext() && oObjectPage.getBindingContext().hasPendingChanges()) {
					oObjectPage
						.getBindingContext()
						.getBinding()
						.resetChanges();
				}
			}
		});
		return ObjectPageComponent;
	},
	/* bExport= */ true
);
