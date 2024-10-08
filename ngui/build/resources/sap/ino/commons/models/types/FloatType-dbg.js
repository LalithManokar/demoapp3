/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/type/Float",
    "sap/ui/model/ParseException"
], function (FloatType, ParseException) {
    "use strict";

    return FloatType.extend("sap.ino.commons.models.types.FloatType", {
        
        formatValue : function(oValue, sInternalType) {
            return FloatType.prototype.formatValue.apply(this, [oValue, sInternalType]);
        },
        
        parseValue : function(oValue, sInternalType) {
            //to avoid UI5 wrong integer format, ex. -6,0 to -60
            if(typeof oValue === "string" && (oValue.indexOf(",") > -1 || jQuery.trim(oValue).indexOf(" ") > -1)){
                var oBundle = sap.ui.getCore().getLibraryResourceBundle();
			    throw new ParseException(oBundle.getText("Integer.Invalid"));
			    return;
            }
            
            return FloatType.prototype.parseValue.apply(this, [oValue, sInternalType]);
        },
        
        validateValue : function(oValue) {
            return FloatType.prototype.validateValue.apply(this, [oValue]);
        }
    });
});