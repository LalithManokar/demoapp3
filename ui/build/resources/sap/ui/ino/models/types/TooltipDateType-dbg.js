/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.TooltipDateType");

(function() {
    "use strict";

    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.TooltipDateType", {

        constructor : function() {
            this.oDateFormatter = new sap.ui.model.type.Date();
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        formatValue : function(oValue, sInternalType) {
            var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
            if (sInternalType == "string") {

                if (oValue == null) {
                    return "";
                } else if (typeof (oValue) === "number") {
                    oValue = new Date(oValue);
                }

                var iTimeStamp = new Date(oValue).getTime();
                var iNow = new Date().getTime();

                var dTodayStart = new Date();
                dTodayStart.setHours(0);
                dTodayStart.setMinutes(0);
                dTodayStart.setSeconds(0);
                dTodayStart.setMilliseconds(1);
                var iTodayStart = dTodayStart.getTime();
                // Check for today
                if (iTimeStamp > iTodayStart) {
                    return sap.ui.core.format.DateFormat.getTimeInstance().format(oValue, false);
                }
                return sap.ui.core.format.DateFormat.getDateTimeInstance().format(oValue, false);

                throw new sap.ui.model.FormatException("Don't know how to format Date to " + sInternalType);
            }
        },

        validateValue : function(oValue) {
            return true;
        }
    });
})();