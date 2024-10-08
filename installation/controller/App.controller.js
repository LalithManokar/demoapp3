
sap.ui.define([
   "sap/ino/installation/controller/BaseController"
], function (BaseController) {
   "use strict";
   return BaseController.extend("sap.ino.installation.controller.App", {

		onInit: function() {
		},       
       
      onShowHello : function () {
         // show a native JavaScript alert
         var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("newpage");
         alert("app installation ready for router to new page");
      },
    onRouteMatched: function(oEvent){
          var test = 1234;
      },
    onPressStart: function(oEvent){
     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);      
        
        oRouter.navTo("installationCreate");
        
    }  
      
   });
});