/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Tag");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Tag", {
        objectName : "sap.ino.xs.object.tag.Tag",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Tags"),
        invalidation : {
            entitySets : ["Tags", "SearchTags"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "NAME" : "",
                    "VANITY_CODE": ""
                };
            }
        }     
    });
})();