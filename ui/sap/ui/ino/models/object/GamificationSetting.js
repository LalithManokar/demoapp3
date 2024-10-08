/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.GamificationSetting");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.GamificationSetting", {
        objectName : "sap.ino.xs.object.gamification.Gamification",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultAOFSource()
    });
})();