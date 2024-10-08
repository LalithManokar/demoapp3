/*!
 * @copyright@
 */
 
 jQuery.sap.declare("sap.ui.ino.models.object.IdentityAttributeSetting");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.IdentityAttributeSetting", {
        objectName : "sap.ino.xs.object.iam.IdentityAttributeSetting",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("IdentityAttributes")
    });
})();