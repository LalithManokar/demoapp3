sap.ui.define([
   "sap/ino/installation/controller/BaseController"
], function(BaseController) {
	"use strict";
	return BaseController.extend("sap.ino.installation.controller.InstallationUpgradeSuccess", {
		onInit: function() {
			if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			}
			var oRouter = this.getRouter();
			oRouter.getRoute("installationUpgradeSuccess").attachMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function(oEvent) {
			var test = 1234;
		}

	});
});