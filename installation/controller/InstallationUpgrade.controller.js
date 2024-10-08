sap.ui.define([
   "sap/ino/installation/controller/BaseController"
], function(BaseController) {
	"use strict";
	return BaseController.extend("sap.ino.installation.controller.InstallationUpgrade", {
		onInit: function() {
			if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			}
			var oRouter = this.getRouter();
			oRouter.getRoute("installationUpgrade").attachMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function(oEvent) {
         this.systemHasAlreadyUpgradeOrInstall(); 
		},
		onPressUpgrade: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("installationUpgradeProcess");

		}

	});
});