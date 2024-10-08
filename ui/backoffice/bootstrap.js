/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */ 
(function() {
    "use strict";
    jQuery.sap.registerModulePath("sap.ui.ino", "/sap/ino/ui/build/resources/sap/ui/ino");
    jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
    sap.ui.ino.application.ApplicationBase.startApplication("sap.ui.ino.application.backoffice.Application");
})();