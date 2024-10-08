/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.NonEmptyFalsyBlankType");
(function() {
    "use strict";
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.NonEmptyFalsyBlankType", {
    	
        formatValue : function(vValue) {
            return vValue || "";
        },
        
        parseValue : function(vValue) {
            return vValue;
        },
        
        validateValue : function(vValue) {
        	if (vValue.length < 1){
    			throw new sap.ui.model.ValidateException("Validation of type constraints failed", ["minLength"]);
        	}
        	
            return true;
        }
    });
})();