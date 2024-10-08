/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.core.PropertyModelCache");

(function() {
    "use strict";

    sap.ui.model.json.JSONModel.extend("sap.ui.ino.models.core.PropertyModelCache", {
        metadata : {
            events : {
                "modelCacheUpdated" : {},
                "modelCacheInvalidated" : {}
            }
        }
    });
}());