/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.MonitorIntegration");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.MonitorIntegration", {
        objectName : "sap.ino.xs.object.integration.MonitorIntegration",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("MonitorIntegration"),
        invalidation : {
            entitySets : ["MonitorIntegration", "SearchMonitorFull"]
        }
    });
})();