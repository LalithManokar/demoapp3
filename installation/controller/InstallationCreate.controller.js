
sap.ui.define([
   "sap/ino/installation/controller/BaseController"
], function (BaseController) {
   "use strict";
   return BaseController.extend("sap.ino.installation.controller.InstallationCreate", {
		onInit: function() {
          if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			} 
       	var oRouter = this.getRouter();
			oRouter.getRoute("installationCreate").attachMatched(this.onRouteMatched, this);	
		},  
    onRouteMatched: function(oEvent){
        //Call Service to check the status
      this.systemHasAlreadyUpgradeOrInstall(); 
      },
    onPressStart: function(oEvent){
     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);      
        
        oRouter.navTo("installationCreateProcess");
        
    }  
      
   });
});