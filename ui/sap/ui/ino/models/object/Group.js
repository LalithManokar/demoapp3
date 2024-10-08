/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Group");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Group", {
        objectName : "sap.ino.xs.object.iam.Group",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Identity"),
        invalidation : {
            entitySets : ["Identity", "SearchIdentity"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                if(oDefaultData.GroupAttribute.length === 0){
                    oDefaultData.GroupAttribute.push({"ID":-2,"GROUP_ID":oDefaultData.ID,"IS_PUBLIC":0});   
                }
                return {
                    "ID" : -1,
                    "NAME" : "",
                    "SOURCE_TYPE_CODE" : "USER"
                };
            }, 
            onRead : function(oDefaultData, objectInstance){
                if(oDefaultData.GroupAttribute.length === 0){
                    oDefaultData.GroupAttribute.push({"ID":-2,"GROUP_ID":oDefaultData.ID,"IS_PUBLIC":0});   
                }                
            }
        }
        
    });
})();