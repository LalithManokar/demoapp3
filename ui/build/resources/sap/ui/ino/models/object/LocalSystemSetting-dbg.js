/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.LocalSystemSetting");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.LocalSystemSetting", {
        objectName : "sap.ino.xs.object.basis.LocalSystemSetting",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("LocalSystemSetting")
    });
})();