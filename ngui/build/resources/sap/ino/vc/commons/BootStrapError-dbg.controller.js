sap.ui.define([
   "sap/ino/vc/commons/BaseController",
   "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
   "sap/ino/commons/application/Configuration"
], function(Controller, ResourceModel, JSONModel, Configuration) {
	"use strict";

	return Controller.extend("sap.ino.vc.commons.BootStrapError", {
		onInit: function() {

			Controller.prototype.onInit.apply(this, arguments);

			var sBundleURL = Configuration.getResourceBundleURL("nguii18n");
			if (sBundleURL) {
			    var oBundle  = new ResourceModel({
				    bundleUrl: sBundleURL
			    });
			}

			var oData;
			if (Configuration.userErrorMessage) {
				oData = {
					message: Configuration.userErrorMessage 
				};
			} else {
			    var MaintenanceMessage = oBundle && oBundle.getResourceBundle().getText("GENERAL_APPLICATION_TIT_ERROR_SETUP_INCOMPLETE");
				oData = {
					message: MaintenanceMessage
				};
			}
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "error");
		},

		onLogout: function() {
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/token.xsjs",
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(res, status, xhr) {
					var sToken = xhr.getResponseHeader("X-CSRF-Token");
					jQuery.ajax({
						url: Configuration.getBackendRootURL() + "/sap/hana/xs/formLogin/logout.xscfunc",
						headers: {
							"X-CSRF-Token": sToken
						},
						type: "post",
						contentType: "application/xml",
						success: function() {
							window.location = Configuration.getBackendRootURL() +
								"/sap/hana/xs/formLogin/login.html?x-sap-origin-location=" + encodeURIComponent(window.location.pathname) + encodeURIComponent(
									window.location.hash);
						}
					});
				}
			});

		}
	});
});