/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.declare("sap.ui.ino.views.backoffice.campaign.CampaignDefaultDateMixin");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignDefaultDateMixin = {
		_ARR_MONTH: ['JANURARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
		convertDefaultTaskDate: function(oStartDate, oEndDate) {
			var oController = this;
			return {
				Day: {
					Start: oStartDate,
					End: oEndDate
				},
				Month: {
					Start: oController._getStringMonth(oStartDate),
					End: oController._getStringMonth(oEndDate)
				},
				Quarter: {
					Start: oController._getStringQuarter(oStartDate),
					End: oController._getStringQuarter(oEndDate)
				},
				Year: {
					Start: oStartDate.getFullYear(),
					End: oEndDate.getFullYear()
				}
			};
		},

		convertDefaultMilestoneDate: function(sDateTypeCode, oDate, sYear, sQuarterCode, sMonthCode, oStartDate) {
			var sQuarter = this._subStrCode(sQuarterCode);
			var sMonth = this._subStrCode(sMonthCode);
			var oNewStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
			return {
				Day: this._getDayDate(sDateTypeCode, oDate, sYear, sQuarter, sMonth, oNewStartDate),
				Month: this._getMonthDate(sDateTypeCode, oDate, sYear, sQuarter, sMonth, oNewStartDate),
				Quarter: this._getQuarterDate(sDateTypeCode, oDate, sYear, sQuarter, sMonth),
				Year: sDateTypeCode === "DAY" ? oDate.getFullYear() : sYear
			};
		},

		_getStringMonth: function(dDate) {
			return this._ARR_MONTH[dDate.getMonth()];
		},

		_getStringQuarter: function(dDate) {
			var iMonth = dDate.getMonth();
			if (iMonth >= 9) {
				return "QUARTER_FOUR";
			}
			if (iMonth >= 6) {
				return "QUARTER_THREE";
			}
			if (iMonth >= 3) {
				return "QUARTER_TWO";
			}
			return "QUARTER_ONE";
		},

		_getDayDate: function(sDateTypeCode, oDate, sYear, sQuarter, sMonth, oNewStartDate) {
			if (sDateTypeCode === "DAY") {
				return oDate;
			}
			if (sDateTypeCode === "MONTH") {
				var oMonthDate = new Date(sYear, this._getIntMonthByMonth(sMonth), 15);
				if (oMonthDate >= oNewStartDate) {
					return oMonthDate;
				}
			}
			var oQuarterDate = new Date(sYear, this._getIntMonthByQuarter(sQuarter), 15);
			if (oQuarterDate > oNewStartDate) {
				return oQuarterDate;
			}
			return oNewStartDate;
		},

		_getMonthDate: function(sDateTypeCode, oDate, sYear, sQuarter, sMonth, oNewStartDate) {
			if (sDateTypeCode === "DAY") {
				return this._ARR_MONTH[oDate.getMonth()];
			}
			if (sDateTypeCode === "MONTH") {
				return sMonth;
			}
			var indexMonth = this._getIntMonthByQuarter(sQuarter);
			if (indexMonth < oNewStartDate.getMonth()) {
				indexMonth = oNewStartDate.getMonth();
			}
			return this._ARR_MONTH[indexMonth];
		},

		_getQuarterDate: function(sDateTypeCode, oDate, sYear, sQuarter, sMonth) {
			if (sDateTypeCode === "DAY") {
				return this._getStringQuarter(oDate);
			}
			if (sDateTypeCode === "MONTH") {
				return this._getStringQuarter(new Date(sYear, this._getIntMonthByMonth(sMonth)));
			}
			return sQuarter;
		},

		_getIntMonthByMonth: function(sMonth) {
			for (var index = 0; index <= this._ARR_MONTH.length - 1; index++) {
				if (this._ARR_MONTH[index] === sMonth) {
					return index;
				}
			}
		},

		_getIntMonthByQuarter: function(sQuarter) {
			if (sQuarter === "QUARTER_FOUR") {
				return 9;
			}
			if (sQuarter === "QUARTER_THREE") {
				return 6;
			}
			if (sQuarter === "QUARTER_TWO") {
				return 3;
			}
			return 0;
		},

		_subStrCode: function(strCode) {
			if (!strCode) {
				return "";
			}
			return strCode.substr(15);
		}
	};
}());