/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.types.RelativeDateType");

(function() {
    "use strict";

    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.RelativeDateType", {

        constructor : function() {
            this.oDateFormatter = new sap.ui.model.type.Date();
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        formatValue : function(oValue, sInternalType) {
            function monthDiff(oDate1, oDate2) {
                var months;
                months = (oDate2.getFullYear() - oDate1.getFullYear()) * 12;
                months -= oDate1.getMonth() + 1;
                months += oDate2.getMonth();
                return months;
            }
            
            if (sInternalType == "string") {
                if (oValue == null) {
                    return "";
                } else if (typeof (oValue) === "number") {
                    oValue = new Date(oValue);
                }
                
                oValue.setHours(0);
                oValue.setMinutes(0);
                oValue.setSeconds(0);
                oValue.setMilliseconds(1);
                
                var iTimeStamp = new Date(oValue).getTime();
                var iNow = new Date().getTime();

                var iOneMinuteAgo = iNow - 1000 * 60;
                var iTwoMinutesAgo = iNow - 1000 * 60 * 2;
                var iOneHourAgo = iNow - 1000 * 60 * 60;
                var iTwoHoursAgo = iNow - 1000 * 60 * 60 * 2;
                var iSixHoursAgo = iNow - 1000 * 60 * 60 * 6;

                var dTodayStart = new Date();
                dTodayStart.setHours(0);
                dTodayStart.setMinutes(0);
                dTodayStart.setSeconds(0);
                dTodayStart.setMilliseconds(1);
                var iTodayStart = dTodayStart.getTime();

                var dTomorrowStart = new Date();
                dTomorrowStart.setHours(0);
                dTomorrowStart.setMinutes(0);
                dTomorrowStart.setSeconds(0);
                dTomorrowStart.setMilliseconds(1);
                dTomorrowStart.setDate(dTomorrowStart.getDate() + 1);
                var iTomorrowStart = dTomorrowStart.getTime();

                var dTomorrowEnd = new Date();
                dTomorrowEnd.setHours(23);
                dTomorrowEnd.setMinutes(59);
                dTomorrowEnd.setSeconds(59);
                dTomorrowEnd.setMilliseconds(999);
                dTomorrowEnd.setDate(dTomorrowEnd.getDate() + 1);
                var iTomorrowEnd = dTomorrowEnd.getTime();

                var dYesterdayStart = new Date();
                dYesterdayStart.setHours(0);
                dYesterdayStart.setMinutes(0);
                dYesterdayStart.setSeconds(0);
                dYesterdayStart.setMilliseconds(1);
                dYesterdayStart.setDate(dYesterdayStart.getDate() - 1);
                var iYesterdayStart = dYesterdayStart.getTime();

                var iDaysCount = Math.floor((iTimeStamp - iTodayStart) / (1000 * 60 * 60 * 24));
                var iMonthsCount = monthDiff(new Date(iNow), new Date(iTimeStamp));
                var iYearsCount = Math.floor(iMonthsCount / 12);


                if (iTomorrowStart > iTimeStamp && iTimeStamp  >= iTodayStart) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_TODAY");
                }
                if (iTomorrowEnd >= iTimeStamp && iTimeStamp >= iTomorrowStart) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_TOMORROW");
                }
                if (iTimeStamp >= iTomorrowEnd && iMonthsCount <= 1) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_CUSTOM_DAYS", [iDaysCount]);
                }
                if (iMonthsCount == 1) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_CUSTOM_MONTH");
                }
                if (iTimeStamp >= iTomorrowEnd && iYearsCount <= 1) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_CUSTOM_MONTHS", [iMonthsCount]);
                }
                if (iYearsCount == 1) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_CUSTOM_YEAR");
                }
                if (iTimeStamp >= iTomorrowEnd && iYearsCount >= 1) {
                    return this.i18n.getText("CTRL_RELATIVEDATE_SEL_CUSTOM_YEARS", [iYearsCount]);
                }
                else {
                    return this.oDateFormatter.formatValue(oValue, sInternalType);
                }
            } else {
                throw new sap.ui.model.FormatException("Don't know how to format Date to " + sInternalType);
            }
        },

        validateValue : function(oValue) {
            return true;
        }
    });
})();