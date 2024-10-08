/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.models.util.Date");
jQuery.sap.declare("sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin = {
		_MONTH_DIC: {
			"JANURARY": {
				month: 0,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"FEBRUARY": {
				month: 1,
				startDateDay: 1,
				milestoneDateDay: 15
			},
			"MARCH": {
				month: 2,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"APRIL": {
				month: 3,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"MAY": {
				month: 4,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"JUNE": {
				month: 5,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"JULY": {
				month: 6,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"AUGUST": {
				month: 7,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"SEPTEMBER": {
				month: 8,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"OCTOBER": {
				month: 9,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"NOVEMBER": {
				month: 10,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"DECEMBER": {
				month: 11,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			}
		},

		_QUARTER_DIC: {
			"QUARTER_ONE": {
				startMonth: 0,
				endMonth: 2,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			},
			"QUARTER_TWO": {
				startMonth: 3,
				endMonth: 5,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"QUARTER_THREE": {
				startMonth: 6,
				endMonth: 8,
				startDateDay: 1,
				endDateDay: 30,
				milestoneDateDay: 15
			},
			"QUARTER_FOUR": {
				startMonth: 9,
				endMonth: 11,
				startDateDay: 1,
				endDateDay: 31,
				milestoneDateDay: 15
			}
		},

		convertDateOfTaskAndMilestone: function(oStartDate, oEndDate, aTasks) {
			if (!aTasks || aTasks.length <= 0) {
				return;
			}
			var oController = this;
			var oNewStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
			var oNewEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
			oController._convertDateOfTask(oNewStartDate, oNewEndDate, aTasks);
			jQuery.each(aTasks, function(nTask, oTask) {
				oController.convertDateOfMilestone(oTask.START_DATE, oTask.END_DATE, oTask.Milestones, "MILESTONE_DATE");
			});
		},

		convertDateOfMilestone: function(oStartDate, oEndDate, aMilestones, sFieldName) {
			if (!aMilestones || aMilestones.length <= 0 || !oStartDate || !oEndDate) {
				return;
			}
			var oController = this;
			var oNewStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
			var oNewEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
			jQuery.each(aMilestones, function(nMilestone, oMilestone) {
				if (oMilestone.DATE_TYPE_CODE === 'MONTH') {
					oController._calculateMonthDateOfMilestone(oNewStartDate, oNewEndDate, oMilestone, sFieldName);
				} else if (oMilestone.DATE_TYPE_CODE === 'QUARTER') {
					oController._calculateQuarterDateOfMilestone(oNewStartDate, oNewEndDate, oMilestone, sFieldName);
				}
				oController._calculateDayDateOfMilestone(oMilestone, sFieldName);
			});
		},

		convertDateOfMilestoneIncludeDay: function(oStartDate, oEndDate, aMilestones, sFieldName) {
			if (!aMilestones || aMilestones.length <= 0 || !oStartDate || !oEndDate) {
				return;
			}
			var oController = this;
			var oNewStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
			var oNewEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
			jQuery.each(aMilestones, function(nMilestone, oMilestone) {
				if (oMilestone.DATE_TYPE_CODE === 'MONTH') {
					oController._calculateMonthDateOfMilestone(oNewStartDate, oNewEndDate, oMilestone, sFieldName);
				} else if (oMilestone.DATE_TYPE_CODE === 'QUARTER') {
					oController._calculateQuarterDateOfMilestone(oNewStartDate, oNewEndDate, oMilestone, sFieldName);
				} else {
					oMilestone[sFieldName] = oMilestone.MILESTONE_DATE;
				}
			});
		},


		_convertDateOfTask: function(oStartDate, oEndDate, aTasks) {
			if (!aTasks || aTasks.length <= 0) {
				return;
			}
			var oController = this;
			jQuery.each(aTasks, function(nTask, oTask) {
				if (oTask.DATE_TYPE_CODE === 'MONTH') {
					oController._calculateMonthDateOfTask(oStartDate, oEndDate, oTask);
				} else if (oTask.DATE_TYPE_CODE === 'QUARTER') {
					oController._calculateQuarterDateOfTask(oStartDate, oEndDate, oTask);
				}
				oController._calculateDayDateOfTask(oTask);
			});
		},
		
		_calculateMonthDateOfTask: function(oStartDate, oEndDate, oTask) {
			if (oTask.START_MONTH_CODE) {
				var oStartMonth = this._MONTH_DIC[oTask.START_MONTH_CODE.substring(15)];
				var nStartYear = parseInt(oTask.START_YEAR, 10);
				if (nStartYear) {
					var oNewStartDateOfStart = new Date(nStartYear, oStartMonth.month, oStartMonth.startDateDay);
					var oNewStartDateOfEnd = new Date(nStartYear, oStartMonth.month, this._getEndDateDay(oStartMonth.endDateDay, nStartYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewStartDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewStartDateOfEnd);
					if (oNewStartDateOfEnd >= oStartDate && oNewStartDateOfStart <= oStartDate) {
						oTask.START_DATE = oStartDate;
					} else {
						oTask.START_DATE = oNewStartDateOfStart;
					}
				}
			}
			if (oTask.END_MONTH_CODE) {
				var oEndMonth = this._MONTH_DIC[oTask.END_MONTH_CODE.substring(15)];
				var nEndYear = parseInt(oTask.END_YEAR, 10);
				if (nEndYear) {
					var oNewEndDateOfStart = new Date(nEndYear, oEndMonth.month, oEndMonth.startDateDay);
					var oNewEndDateOfEnd = new Date(nEndYear, oEndMonth.month, this._getEndDateDay(oEndMonth.endDateDay, nEndYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewEndDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewEndDateOfEnd);
					if (oNewEndDateOfStart <= oEndDate && oNewEndDateOfEnd >= oEndDate) {
						oTask.END_DATE = oEndDate;
					} else {
						oTask.END_DATE = oNewEndDateOfEnd;
					}
				}
			}
		},

		_calculateQuarterDateOfTask: function(oStartDate, oEndDate, oTask) {
			if (oTask.START_QUARTER_CODE) {
				var oStartQuarter = this._QUARTER_DIC[oTask.START_QUARTER_CODE.substring(15)];
				var nStartYear = parseInt(oTask.START_YEAR, 10);
				if (nStartYear) {
					var oNewStartDateOfStart = new Date(nStartYear, oStartQuarter.startMonth, oStartQuarter.startDateDay);
					var oNewStartDateOfEnd = new Date(nStartYear, oStartQuarter.endMonth, this._getEndDateDay(oStartQuarter.endDateDay, nStartYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewStartDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewStartDateOfEnd);
					if (oNewStartDateOfEnd >= oStartDate && oNewStartDateOfStart <= oStartDate) {
						oTask.START_DATE = oStartDate;
					} else {
						oTask.START_DATE = oNewStartDateOfStart;
					}
				}
			}
			if (oTask.END_MONTH_CODE) {
				var oEndQuarter = this._QUARTER_DIC[oTask.END_QUARTER_CODE.substring(15)];
				var nEndYear = parseInt(oTask.END_YEAR, 10);
				if (nEndYear) {
					var oNewEndDateOfStart = new Date(nEndYear, oEndQuarter.startMonth, oEndQuarter.startDateDay);
					var oNewEndDateOfEnd = new Date(nEndYear, oEndQuarter.endMonth, this._getEndDateDay(oStartQuarter.endDateDay, nEndYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewEndDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewEndDateOfEnd);
					if (oNewEndDateOfStart <= oEndDate && oNewEndDateOfEnd >= oEndDate) {
						oTask.END_DATE = oEndDate;
					} else {
						oTask.END_DATE = oNewEndDateOfEnd;
					}
				}
			}
		},

		_calculateDayDateOfTask: function(oTask) {
			sap.ui.ino.models.util.Date.setBeginOfDay(oTask.START_DATE);
			sap.ui.ino.models.util.Date.setBeginOfDay(oTask.END_DATE);
		},

		_calculateMonthDateOfMilestone: function(oStartDate, oEndDate, oMilestone, sFieldName) {
			if (oMilestone.MILESTONE_MONTH_CODE) {
				var oMonth = this._MONTH_DIC[oMilestone.MILESTONE_MONTH_CODE.substring(15)];
				var nStartYear = parseInt(oMilestone.MILESTONE_YEAR, 10);
				if (nStartYear) {
					var oNewDateOfStart = new Date(nStartYear, oMonth.month, oMonth.startDateDay);
					var oNewDateOfEnd = new Date(nStartYear, oMonth.month, this._getEndDateDay(oMonth.endDateDay, nStartYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewDateOfEnd);
					if (oNewDateOfEnd >= oStartDate && oNewDateOfStart <= oStartDate) {
						oMilestone[sFieldName] = oStartDate;
					} else {
						oMilestone[sFieldName] = oNewDateOfStart;
					}
				}
			}
		},

		_calculateQuarterDateOfMilestone: function(oStartDate, oEndDate, oMilestone, sFieldName) {
			if (oMilestone.MILESTONE_QUARTER_CODE) {
				var oQuarter = this._QUARTER_DIC[oMilestone.MILESTONE_QUARTER_CODE.substring(15)];
				var nStartYear = parseInt(oMilestone.MILESTONE_YEAR, 10);
				if (nStartYear) {
					var oNewDateOfStart = new Date(nStartYear, oQuarter.startMonth, oQuarter.startDateDay);
					var oNewDateOfEnd = new Date(nStartYear, oQuarter.endMonth, this._getEndDateDay(oQuarter.endDateDay, nStartYear));
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewDateOfStart);
					sap.ui.ino.models.util.Date.setBeginOfDay(oNewDateOfEnd);
					if (oNewDateOfEnd >= oStartDate && oNewDateOfStart <= oStartDate) {
						oMilestone[sFieldName] = oStartDate;
					} else {
						oMilestone[sFieldName] = oNewDateOfStart;
					}
				}
			}
		},

		_calculateDayDateOfMilestone: function(oMilestone, sFieldName) {
			sap.ui.ino.models.util.Date.setBeginOfDay(oMilestone[sFieldName]);
		},

		_getEndDateDay: function(nEndDateDay, nYear) {
			if (nEndDateDay) {
				return nEndDateDay;
			}
			return this._isLeapYear(nYear) ? 29 : 28;
		},

		_isLeapYear: function(nYear) {
			return (nYear % 4 === 0 && nYear % 100 !== 0) || nYear % 400 === 0;
		}

	};
}());