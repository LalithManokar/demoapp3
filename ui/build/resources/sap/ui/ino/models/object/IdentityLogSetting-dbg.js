/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.IdentityLogSetting");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.IdentityLogSetting", {
        objectName : "sap.ino.xs.object.iam.IdentityLogSetting",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("IdentityLogSetting")
    });
})();