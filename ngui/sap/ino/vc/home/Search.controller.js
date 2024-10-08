sap.ui.define([
   "sap/ino/vc/commons/BaseController"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.ino.vc.home.Search", {
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        }
   });
});