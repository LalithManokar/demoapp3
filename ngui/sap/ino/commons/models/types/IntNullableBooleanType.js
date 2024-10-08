/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/type/Integer"
], function (IntegerType) {
    "use strict";
    
    return IntegerType.extend("sap.ino.commons.models.types.IntNullableBooleanType", {
        
        formatValue : function(oValue, sInternalType) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return oValue;
            }
            return IntegerType.prototype.formatValue.apply(this, [oValue, sInternalType]);
        },
        
        parseValue : function(oValue, sInternalType) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return oValue;
            }
            return IntegerType.prototype.parseValue.apply(this, [oValue, sInternalType]);
        },
        
        validateValue : function(oValue) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return true;
            }
            return IntegerType.prototype.validateValue.apply(this, [oValue]);
        }
    });
});