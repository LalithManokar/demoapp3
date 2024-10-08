/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";
    return JSONModel.extend("sap.ino.commons.models.aof.PropertyModelCache", {
        metadata: {
            events: {
                "modelCacheUpdated": {},
                "modelCacheInvalidated": {}
            }
        }
    });
});