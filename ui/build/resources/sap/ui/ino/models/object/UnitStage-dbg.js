/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.UnitStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.UnitStage", {
        objectName : "sap.ino.xs.object.basis.UnitStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingUnit"),
        invalidation : {
            entitySets : ["StagingUnit", "StagingUnitSearch"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "PLAIN_CODE" : "",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : ""
                };
            }
        }      
    });
})();