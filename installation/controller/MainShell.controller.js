sap.ui.define([
"sap/ino/installation/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sap.ino.installation.controller.MainShell", {
		onInit: function() {
          if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			}
			var oRouter = this.getRouter();
			oRouter.getRoute("home").attachMatched(this.onRouteMatched, this);
		},           
    onPressStart: function(oEvent){
     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);      
        
        oRouter.navTo("installationCreate");
        
    } ,
    onRouteMatched: function(oEvent){
        //var sTarget = "installationUpgrade";//installationCreate
       this.systemHasAlreadyUpgradeOrInstall(); 
      }
    });
});