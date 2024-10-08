/*!
 * @copyright@
 */
sap.ui.define([], function() {
	"use strict";

	return {
		convertToUtcString: function(oDate, bEndDay) {
			if (!oDate) {
				return oDate;
			}
			if(typeof oDate === "string"){
			   oDate = new Date(oDate);
			}
			var sMoth = (oDate.getMonth() + 1) >= 10 ? oDate.getMonth() + 1 : "0" + (oDate.getMonth() + 1);
			var sDay = oDate.getDate() >= 10 ? oDate.getDate() : "0" + oDate.getDate();
			return oDate.getFullYear() + "-" + sMoth + "-" + sDay + (bEndDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z');
		},

		convertToLocalDate: function(oDate, bEndDay) {
			if (!oDate) {
				return oDate;
			}
            if(typeof oDate === "string"){
			   oDate = new Date(oDate);
			}
			return new Date(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(), bEndDay ? 23 : 0, bEndDay ? 59 : 0, bEndDay ? 59 : 0,
				bEndDay ? 999 : 0);
		}
	};
});