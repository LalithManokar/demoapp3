/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/SimpleType"
], function (SimpleType) {
    "use strict";
    
    return SimpleType.extend("sap.ino.commons.models.types.IntBooleanType", {
        
        formatValue : function(iValue) {
            return iValue === 1;
        },
        
        parseValue : function(bValue) {
            return bValue ? 1 : 0;
        },
        
        validateValue : function(iValue) {
            return iValue === 0 || iValue === 1;
        }        
    });
});