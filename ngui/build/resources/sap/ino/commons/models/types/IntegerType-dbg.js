/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/type/Integer",
    "sap/ui/model/ParseException"
], function (IntegerType, ParseException) {
    "use strict";
    
    return IntegerType.extend("sap.ino.commons.models.types.IntegerType", {
        
        formatValue : function(oValue, sInternalType) {
            return IntegerType.prototype.formatValue.apply(this, [oValue, sInternalType]);
        },
        
        parseValue : function(oValue, sInternalType) {
            //to avoid UI5 wrong integer format, ex. -6,0 to -60
            if(oValue.indexOf(",") > -1 || jQuery.trim(oValue).indexOf(" ") > -1){
                var oBundle = sap.ui.getCore().getLibraryResourceBundle();
			    throw new ParseException(oBundle.getText("Integer.Invalid"));
			    return;
            }
            
            return IntegerType.prototype.parseValue.apply(this, [oValue, sInternalType]);
        },
        
        validateValue : function(oValue) {
            return IntegerType.prototype.validateValue.apply(this, [oValue]);
        }
    });
});