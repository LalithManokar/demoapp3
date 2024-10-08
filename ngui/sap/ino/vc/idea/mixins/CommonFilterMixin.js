sap.ui.define(["sap/ui/model/json/JSONModel"],
	function(JSONModel) {
		var CommonFilterMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		CommonFilterMixin.initFilterItemModel = function() {
			this.setModel(new JSONModel(), "filterItemModel");
			this.setFilterItem("/IsValidDueFrom", true);
			this.setFilterItem("/IsValidDueTo", true);
		};

		CommonFilterMixin.getFilterItemModel = function() {
			return this.getModel("filterItemModel");
		};

		CommonFilterMixin.getFilterItem = function(sPath) {
			return this.getModel("filterItemModel").getProperty(sPath);
		};

		CommonFilterMixin.setFilterItem = function(sPath, value) {
			return this.getModel("filterItemModel").setProperty(sPath, value);
		};

		CommonFilterMixin.isCanApply = function() {
			return this.getModel("filterItemModel").getProperty("/IsValidDueFrom") &&
				this.getModel("filterItemModel").getProperty("/IsValidDueTo");
		};

		return CommonFilterMixin;
	});