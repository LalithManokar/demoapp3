/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.types.StringBooleanType");
(function() {
    "use strict";
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.StringBooleanType", {
        
        constructor : function() {
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },
        
        formatValue : function(iValue) {
            if (iValue === undefined || iValue === null) {
                return this.i18n.getText("CTRL_COMMON_FLD_UNKNOWN");;
            } else if (iValue === 1 || iValue == true) {
                return this.i18n.getText("CTRL_COMMON_FLD_YES");
            } else if (iValue === 0 || iValue == false) {
                return this.i18n.getText("CTRL_COMMON_FLD_NO");
            } else {
                return this.i18n.getText("CTRL_COMMON_FLD_UNKNOWN");;
            }
        },
        parseValue : function(sValue) {
            if (sValue.toLowerCase() === this.i18n.getText("CTRL_COMMON_FLD_YES").toLowerCase()) {
                return 1;
            } else if (sValue.toLowerCase() === this.i18n.getText("CTRL_COMMON_FLD_NO").toLowerCase()) {
                return 0;
            }
            return null;
        },
        
        validateValue : function(iValue) {
            return true;
        }
    });
})();