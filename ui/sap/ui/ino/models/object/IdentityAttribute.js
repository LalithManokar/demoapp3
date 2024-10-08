/*!
 * @copyright@
 */
 
 jQuery.sap.declare("sap.ui.ino.models.object.IdentityAttribute");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.IdentityAttribute", {
        objectName : "sap.ino.xs.object.iam.IdentityAttribute",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("IdentityAttributes")
    });
})();