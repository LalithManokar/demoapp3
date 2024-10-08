/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.IdentityLog");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.IdentityLog", {
        objectName : "sap.ino.xs.object.iam.IdentityLog",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("IdentityLog")
    });
})();