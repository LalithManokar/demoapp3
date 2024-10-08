/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
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