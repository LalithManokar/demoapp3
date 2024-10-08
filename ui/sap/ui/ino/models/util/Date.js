/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.util.Date");
(function() {
	"use strict";

	sap.ui.ino.models.util.Date = {};

	sap.ui.ino.models.util.Date.setBeginOfDay = function(oDate) {
		if (!oDate) {
			return oDate;
		}

		oDate.setHours(0);
		oDate.setMinutes(0);
		oDate.setSeconds(0);
		oDate.setMilliseconds(0);
		return oDate;
	};

	sap.ui.ino.models.util.Date.setEndOfDay = function(oDate) {
		if (!oDate) {
			return oDate;
		}

		oDate.setHours(23);
		oDate.setMinutes(59);
		oDate.setSeconds(59);
		oDate.setMilliseconds(999);
		return oDate;
	};

	sap.ui.ino.models.util.Date.convertToUtcString = function(oDate, bEndDay) {
		if (!oDate) {
			return oDate;
		}
		var sMoth = (oDate.getMonth() + 1) >= 10 ? oDate.getMonth() + 1 : "0" + (oDate.getMonth() + 1);
		var sDay = oDate.getDate() >= 10 ? oDate.getDate() : "0" + oDate.getDate();
		return oDate.getFullYear() + "-" + sMoth + "-" + sDay + (bEndDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z');
	};

	sap.ui.ino.models.util.Date.convertToLocalDate = function(oDate, bEndDay) {
		if (!oDate) {
			return oDate;
		}

		return new Date(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(), bEndDay ? 23 : 0, bEndDay ? 59 : 0, bEndDay ? 59 : 0,
			bEndDay ? 999 : 0);
	};

})();