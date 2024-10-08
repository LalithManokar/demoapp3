/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Notification");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Notification", {
        objectName : "sap.ino.xs.object.notification.Notification",
        invalidation : {
            entitySets : ["NotificationCount", "EntityCount"]
        },
        determinations : {
            onPersist : function(vKey, oChangeRequest, oObject, oAction) {
                var InvalidationManager = sap.ui.ino.models.core.InvalidationManager;
                function calculateCount(sEntitySet, getProperty, setProperty) {
                	var sProperty;
                	if (sEntitySet == "NotificationCount") {
                		sProperty = "COUNT";
                	} else {
                		sProperty = "NOTIFICATION_COUNT";
                	} 
                    var iCount = getProperty(sProperty);
                    if (oAction.name === "readNotification" && iCount > 0) {
                        iCount--;
                    }
                    else if (oAction.name === "readAllNotifications") {
	                    iCount = 0;
	                }
                    setProperty(sProperty, iCount);
                };
                // 1 is the artificial key for the count
                InvalidationManager.recalculateAttributes(sap.ui.ino.models.object.Notification, 1, calculateCount);
            }
        }        
    });
})();