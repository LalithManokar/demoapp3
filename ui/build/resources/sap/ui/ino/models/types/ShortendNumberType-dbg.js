/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.ShortendNumberType");

(function() {
    "use strict";

    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.ShortendNumberType", {

        constructor : function() {
        },

        formatValue : function(oValue, sInternalType) {
            if (sInternalType == "string") {
                if (oValue != null) {
                    if (oValue / 1000 < 1) {
                        return oValue.toString();
                    }
                    var numberOfThousands = oValue/1000; 
                    if(numberOfThousands > 1 && numberOfThousands < 1000) {
                        return Math.floor (numberOfThousands) + " K";
                    }
                    var numberOfMillions = oValue/1000000; 
                    if(numberOfMillions > 1) {
                        return Math.floor (numberOfMillions) + " M";
                    }
                    return "";
                } else  {
                    return "";
                }

            } else {
                throw new sap.ui.model.FormatException("Don't know how to format value (" + oValue + ")to " + sInternalType);
            }
        },

        validateValue : function(oValue) {
            return true;
        }
    });
})();