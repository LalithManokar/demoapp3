



sap.ui.define([
   "sap/ino/installation/controller/BaseController"
], function (BaseController) {
   "use strict";
   return BaseController.extend("sap.ino.installation.controller.Newpage", {
      onNavBack : function () {
         // show a native JavaScript alert
         var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
      }

      
   });
});