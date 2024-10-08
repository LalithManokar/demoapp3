/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/SimpleType"
], function (SimpleType) {
    "use strict";
    
    function sameDate(oDate1, oDate2) {
        return oDate1.getFullYear() === oDate2.getFullYear() && oDate1.getMonth() === oDate2.getMonth() && oDate1.getDate() === oDate2.getDate();
    }
    
    return SimpleType.extend("sap.ino.commons.models.types.FollowUpRelativeDateType", {

        formatValue: function (oFollowUpDate) {
            if (oFollowUpDate) {
                var oCurrentDate = new Date();
                var iDay = oCurrentDate.getDate();
                var iMonth = oCurrentDate.getMonth();
                var iYear = oCurrentDate.getFullYear();
                var oNow = new Date(iYear, iMonth, iDay);
                if (sameDate(oFollowUpDate, oNow)) {
                    return "TODAY";
                }
                if (sameDate(oFollowUpDate, new Date(iYear, iMonth, iDay + 1))) {
                    return "TOMORROW";
                }
                var oDate = new Date(iYear, iMonth, iDay);
                oDate.setDate(oDate.getDate() + 5 - oDate.getDay());
                if (sameDate(oFollowUpDate, oDate)) {
                    return "THIS_WEEK";
                }
                oDate = new Date(iYear, iMonth, iDay);
                oDate.setDate(oDate.getDate() + 8 - oDate.getDay());
                if (sameDate(oFollowUpDate, oDate)) {
                    return "NEXT_WEEK";
                }
                oDate = new Date(iYear, iMonth, iDay);
                oDate.setDate(oNow.getDate() + 7);
                if (sameDate(oFollowUpDate, oDate)) {
                    return "IN_A_WEEK";
                }
                oDate = new Date(iYear, iMonth, iDay);
                oDate.setDate(oNow.getDate() + 14);
                if (sameDate(oFollowUpDate, oDate)) {
                    return "IN_TWO_WEEKS";
                }
                if (sameDate(oFollowUpDate, new Date(iYear, iMonth + 1, 0))) {
                    return "THIS_MONTH";
                }
                if (sameDate(oFollowUpDate, new Date(iYear, iMonth + 1, 15))) {
                    return "NEXT_MONTH";
                }
                if (sameDate(oFollowUpDate, new Date(iYear, iMonth + 1, iDay))) {
                    return "IN_A_MONTH";
                }
                if (sameDate(oFollowUpDate, new Date(iYear, iMonth + 2, iDay))) {
                    return "IN_TWO_MONTHS";
                }
            }
            return "NONE";
        },

        parseValue: function (sRelativeDate) {
            var oCurrentDate = new Date();
            var iDay = oCurrentDate.getDate();
            var iMonth = oCurrentDate.getMonth();
            var iYear = oCurrentDate.getFullYear();
            var oNow = new Date(iYear, iMonth, iDay);
            var oDate = null;
            switch (sRelativeDate) {
                case "NONE" :
                    break;
                case "NO_FOLLOW_UP" :
                    break;
                case "TODAY" :
                    oDate = oNow;
                    break;
                case "TOMORROW" :
                    oDate = new Date(iYear, iMonth, iDay);
                    oDate.setDate(oNow.getDate() + 1);
                    break;
                case "THIS_WEEK" :
                    oDate = new Date(iYear, iMonth, iDay);
                    oDate.setDate(oDate.getDate() + 5 - oDate.getDay());
                    break;
                case "NEXT_WEEK" :
                    oDate = new Date(iYear, iMonth, iDay);
                    oDate.setDate(oDate.getDate() + 8 - oDate.getDay());
                    break;
                case "IN_A_WEEK" :
                    oDate = new Date(iYear, iMonth, iDay);
                    oDate.setDate(oNow.getDate() + 7);
                    break;
                case "IN_TWO_WEEKS" :
                    oDate = new Date(iYear, iMonth, iDay);
                    oDate.setDate(oNow.getDate() + 14);
                    break;
                case "THIS_MONTH" :
                    oDate = new Date(iYear, iMonth + 1, 0);
                    break;
                case "NEXT_MONTH" :
                    oDate = new Date(iYear, iMonth + 1, 15);
                    break;
                case "IN_A_MONTH" :
                    oDate = new Date(iYear, iMonth + 1, iDay);
                    break;
                case "IN_TWO_MONTHS" :
                    oDate = new Date(iYear, iMonth + 2, iDay);
                    break;
            }
            return oDate;
        },

        validateValue: function () {
            return true;
        }

    });
    
});