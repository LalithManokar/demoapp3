/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.IntBooleanType");
(function() {
    "use strict";
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.IntBooleanType", {
        formatValue : function(iValue) {
            return iValue == 1;
        },
        parseValue : function(bValue) {
            return bValue ? 1 : 0;
        },
        validateValue : function(iValue) {
            return true;
        }
    });
})();