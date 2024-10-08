/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.types.RelativeDateTimeType");

(function() {
    "use strict";
    
    sap.ui.model.SimpleType.extend("sap.ui.ino.models.types.RelativeDateTimeType", {
        
        constructor : function() {
            this.oDateFormatter = new sap.ui.model.type.Date();
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        formatValue : function(oValue, sInternalType) {
            if(sInternalType == "string") {
                    if (oValue == null) {
                        return "";
                    } else if (typeof(oValue) === "number") {
                        oValue = new Date(oValue);
                    }

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
                    var dYesterdayStart = new Date();
                    dYesterdayStart.setHours(0);
                    dYesterdayStart.setMinutes(0);
                    dYesterdayStart.setSeconds(0);
                    dYesterdayStart.setMilliseconds(1);
                    dYesterdayStart.setDate(dYesterdayStart.getDate() - 1);
                    var iYesterdayStart = dYesterdayStart.getTime();

                    // make "now" more tolerant regarding the future
                    iNow += 1000 * 30;
                    
                    if (iTimeStamp > iNow) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_FUTURE");
                    } else if (iTimeStamp < iNow && iTimeStamp > iOneMinuteAgo) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_NOW");
                    } else if (iTimeStamp <= iOneMinuteAgo && iTimeStamp > iTwoMinutesAgo) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_MINUTE");
                    } else if (iTimeStamp <= iTwoMinutesAgo && iTimeStamp > iOneHourAgo) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_MINUTES");
                    } else if (iTimeStamp <= iOneHourAgo && iTimeStamp > iTwoHoursAgo) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_HOUR");
                    } else if (iTimeStamp <= iTwoHoursAgo && iTimeStamp > iSixHoursAgo) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_HOURS");
                    } else if (iTimeStamp > iTodayStart) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_TODAY");
                    } else if (iTimeStamp > iYesterdayStart) {
                      return this.i18n.getText("CTRL_RELATIVEDATE_SEL_YESTERDAY");
                    } else {
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