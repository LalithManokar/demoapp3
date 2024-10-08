/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/SimpleType"
], function (SimpleType) {
    "use strict";
    return SimpleType.extend("sap.ino.commons.models.types.StringNumberType", {
            formatValue: function (oValue, sInternalType) {
                if(oValue === null) {
                    return null;
                }
                if(sInternalType === "float") {
                    return parseFloat(oValue);
                }
                return 0;
            },
            parseValue: function (oValue, sInternalType) {
                return oValue.toString();
            },
            validateValue: function (oValue) {
                return true;
            }
        }
    );
});