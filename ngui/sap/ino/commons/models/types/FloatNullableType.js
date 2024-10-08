/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/type/Float",
    "sap/ui/model/ParseException"
], function (FloatType, ParseException) {
    "use strict";

    return FloatType.extend("sap.ino.commons.models.types.FloatNullableType", {
        
        formatValue : function(oValue, sInternalType) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return oValue;
            }
            return FloatType.prototype.formatValue.apply(this, [oValue, sInternalType]);
        },
        
        parseValue : function(oValue, sInternalType) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return oValue;
            }
            
            //to avoid UI5 wrong integer format, ex. -6,0 to -60
    //         if(oValue.indexOf(",") > -1 || jQuery.trim(oValue).indexOf(" ") > -1){
    //             var oBundle = sap.ui.getCore().getLibraryResourceBundle();
			 //   throw new ParseException(oBundle.getText("Integer.Invalid"));
			 //   return;
    //         }
            
            return FloatType.prototype.parseValue.apply(this, [oValue, sInternalType]);
        },
        
        validateValue : function(oValue) {
            if(oValue === null || oValue === undefined || oValue === ""){
                return true;
            }
            return FloatType.prototype.validateValue.apply(this, [oValue]);
        }
    });
});