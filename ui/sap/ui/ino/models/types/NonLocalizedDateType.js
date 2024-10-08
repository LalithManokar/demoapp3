/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.types.NonLocalizedDateType");
(function() {
    "use strict";

    var oNonLocalizedDateType = new sap.ui.model.type.Date({
        source : {
            pattern : "yyyy-MM-dd"
        }
    }, {
        minimum : "1970-01-01"
    });
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.NonLocalizedDateType", {

        constructor : function() {
        },

        formatValue : function(oDate) {
            if (oDate) {
                try {
                    return sap.ui.ino.models.types.NonLocalizedDateType.convertToNonLocalizedFormattedDateString(oDate);
                } catch (e) {
                }
            }
            return "";
        },

        parseValue : function(sDate) {
            if (sDate) {
                return new Date(sDate);
            }
            return new Date(0);
        },

        validateValue : function(sDate) {
            try {
                new Date(sDate);
                return true;
            } catch (e) {
            }
            return false;
        }
    });
    
    sap.ui.ino.models.types.NonLocalizedDateType.convertToNonLocalizedDateString = function(oDate) {
        return oDate.toISOString().substring(0, 10);
    };
    
    sap.ui.ino.models.types.NonLocalizedDateType.convertToNonLocalizedFormattedDateString = function(oDate) {
        var sNonLocalizedDateString = sap.ui.ino.models.types.NonLocalizedDateType.convertToNonLocalizedDateString(oDate);
        return oNonLocalizedDateType.formatValue(sNonLocalizedDateString, "string");
    };
})();