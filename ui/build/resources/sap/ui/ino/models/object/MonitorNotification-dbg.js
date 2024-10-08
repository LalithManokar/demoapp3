/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.MonitorNotification");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.MonitorNotification", {
        objectName : "sap.ino.xs.object.notification.MonitorNotification",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("MonitorEmail"),
        invalidation : {
            entitySets : ["MonitorEmail", "SearchMonitorEmail"]
        }
    });
})();