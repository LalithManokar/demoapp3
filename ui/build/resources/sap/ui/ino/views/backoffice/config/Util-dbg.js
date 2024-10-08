/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.backoffice.config.Util");

(function() {
    "use strict";

    sap.ui.ino.views.backoffice.config.Util = function() {
        throw new Error("Static utilities may not be instantiated");
    };

    // Formatter function which strips off all technical parts
    // of a code and only displays the part after the last "." the name
    // Example: Full code name: sap.ino.custz.abc.XYZ will return XYZ
    sap.ui.ino.views.backoffice.config.Util.formatPlainCode = function(sCode) {
        if (!sCode) {
            return "";
        }
        var aParts = sCode.split(".");
        if (aParts.length > 0) {
            return aParts[aParts.length - 1];
        } else {
            return sCode;
        }
    };
   
})();