/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.FalsyBlankType");
(function() {
    "use strict";
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.FalsyBlankType", {
        formatValue : function(vValue) {
            return vValue || "";
        },
        parseValue : function(vValue) {
            return vValue;
        },
        validateValue : function(vValue) {
            return true;
        }
    });
})();