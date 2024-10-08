/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/SimpleType"
], function (SimpleType) {
    "use strict";
    
    return SimpleType.extend("sap.ino.commons.models.types.StringBooleanType", {
        
        formatValue : function(sValue) {
            return sValue === "1";
        },
        
        parseValue : function(bValue) {
            return bValue ? "1" : "0";
        },
        
        validateValue : function(sValue) {
            return sValue === "0" || sValue === "1";
        }        
    });
});