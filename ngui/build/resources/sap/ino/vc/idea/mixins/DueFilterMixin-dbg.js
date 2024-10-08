sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat"],
	function(Filter, FilterOperator, ValueState, DateFormat) {
		var KEY_FILTER_NAME = "FOLLOW_UP_DATE";
		var oFilterValues = {
			from: undefined,
			to: undefined
		};
		var DateFormatter = DateFormat.getInstance({
			pattern: "YYYY-MM-dd"
		});

		function validValue(oEvent, bFrom) {
			if (!oEvent.getParameter("valid")) {
				oEvent.getSource().setValueState(ValueState.Error);
				return false;
			}
			oEvent.getSource().setValueState(ValueState.None);
			var sValue = DateFormatter.format(oEvent.getSource().getDateValue());
			if (bFrom && oFilterValues.to && sValue > oFilterValues.to) {
				oEvent.getSource().setValueState(ValueState.Error);
				return false;
			}
			if (!bFrom && oFilterValues.from && sValue < oFilterValues.from) {
				oEvent.getSource().setValueState(ValueState.Error);
				return false;
			}
			return true;
		}

		var DueFilterMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		DueFilterMixin.hasDueFromFilter = function() {
			return !!oFilterValues.from;
		};

		DueFilterMixin.hasDueToFilter = function() {
			return !!oFilterValues.to;
		};

		DueFilterMixin.hasDueFilter = function() {
			return this.hasDueFromFilter() || this.hasDueToFilter();
		};

		DueFilterMixin.getDueFilter = function() {
			if (oFilterValues.from && oFilterValues.to) {
				return new Filter({
					filters: [
        				new Filter({
							filters: [
        					    new Filter(KEY_FILTER_NAME, FilterOperator.EQ, DateFormatter.parse(oFilterValues.from)),
        			            new Filter(KEY_FILTER_NAME, FilterOperator.GE, DateFormatter.parse(oFilterValues.from))],
							and: false
						}),
        				new Filter({
							filters: [
        					    new Filter(KEY_FILTER_NAME, FilterOperator.EQ, DateFormatter.parse(oFilterValues.to)),
        			            new Filter(KEY_FILTER_NAME, FilterOperator.LE, DateFormatter.parse(oFilterValues.to))],
							and: false
						})],
					and: true
				});
			}
			if (oFilterValues.from) {
				return new Filter(KEY_FILTER_NAME, FilterOperator.EQ, DateFormatter.parse(oFilterValues.from));
			}
			if (oFilterValues.to) {
				return new Filter(KEY_FILTER_NAME, FilterOperator.EQ, DateFormatter.parse(oFilterValues.to));
			}
			return new Filter(KEY_FILTER_NAME, FilterOperator.EQ, '');
		};

		DueFilterMixin.setDueFrom = function(oEvent) {
			if (!validValue(oEvent, true)) {
				oEvent.getSource().setValueStateText(this.getText("LIST_TIT_FILTER_DUEFROM_GT_DUETO"));
				this.setFilterItem("/IsValidDueFrom", false);
				return;
			}
			var dueFrom = DateFormatter.format(oEvent.getSource().getDateValue());
			this.setFilterItem("/DueFrom", dueFrom);
			this.setFilterItem("/IsValidDueFrom", true);
			oFilterValues.from = dueFrom;
		};

		DueFilterMixin.setDueTo = function(oEvent) {
			if (!validValue(oEvent, false)) {
				oEvent.getSource().setValueStateText(this.getText("LIST_TIT_FILTER_DUEFROM_GT_DUETO"));
				this.setFilterItem("/IsValidDueTo", false);
				return;
			}
			var dueTo = DateFormatter.format(oEvent.getSource().getDateValue());
			this.setFilterItem("/DueTo", dueTo);
			this.setFilterItem("/IsValidDueTo", true);
			oFilterValues.to = dueTo;
		};

		DueFilterMixin.setDueFromValue = function(oValue) {
			var dueFrom = "";
			if(oValue){
			    dueFrom = DateFormatter.format(DateFormatter.parse(oValue));
			}
			this.setFilterItem("/DueFrom", dueFrom);
			oFilterValues.from = dueFrom;
		};

		DueFilterMixin.setDueToValue = function(oValue) {
			var dueTo = "";
			if(oValue){
			    dueTo = DateFormatter.format(DateFormatter.parse(oValue));
			}
			this.setFilterItem("/DueTo", dueTo);
			oFilterValues.to = dueTo;
		};

		DueFilterMixin.restDue = function() {
			oFilterValues = {
				from: undefined,
				to: undefined
			};

			this.setFilterItem("/DueFrom", undefined);
			this.setFilterItem("/DueTo", undefined);
		};

		DueFilterMixin.clearDueValueState = function() {
			var aCtr = [this.byId("dpDue"), this.byId("dpDueTo")];
			jQuery.each(aCtr, function(index, ctr) {
				ctr.setValueState(ValueState.None);
			});
		};
		return DueFilterMixin;

	});