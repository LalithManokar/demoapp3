/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/Base', 'sap/ui/core/CustomData'
], function(Base, CustomData) {
	"use strict";

	/**
	 * Change handler for setting a filter value for the <code>UiState</code> aggregation of sap.ui.mdc.Chart or sap.ui.mdc.base.filterbar.FilterBar.
	 * @constructor
	 * @alias sap.ui.mdc.changehandler.SetFilterValue
	 * @author SAP SE
	 * @version 1.71.61
	 */
	var SetFilterValue = {};

	SetFilterValue.createChange = function(mPropertyBag) {
		if (!mPropertyBag.control) {
			throw new Error("Invalid control. The existing control object is mandatory.");
		}
		return {
			selectorElement: mPropertyBag.control,
			changeSpecificData: {
				changeType: "setFilterValue",
				content: {
					path: mPropertyBag.key,
					conditions: mPropertyBag.conditions
				}
			}
		};
	};
	SetFilterValue.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
	};
	SetFilterValue.applyChange = function(oChange, oControl, mPropertyBag) {
		if (!oControl.getUiState) {
			return Base.markAsNotApplicable("We can apply the 'setFilterValue' change only during runtime, therefore the change can not be applied during XML processing.", true);
		}
		// First store the old value for revert
		var oUiState = mPropertyBag.modifier.getAggregation(oControl, "uiState");
		if (!oUiState) {
			oUiState = mPropertyBag.modifier.createControl("sap.ui.mdc.base.state.UiState", mPropertyBag.appComponent, mPropertyBag.view, undefined);
			mPropertyBag.modifier.insertAggregation(oControl, "uiState", oUiState);
		}
		var aSelectOption = mPropertyBag.modifier.getAggregation(oUiState, "selectOptions").filter(function(oSelectOption) {
			return oSelectOption.getPropertyName() === oChange.getContent().path;
		});
		oChange.setRevertData({
			conditions: aSelectOption[0] ? aSelectOption[0].getCustomData("conditions")[0].getValue().conditions : []
		});

		// Then set the new value
		aSelectOption.forEach(function(oSelectOption) {
			mPropertyBag.modifier.removeAggregation(oUiState, "selectOptions", oSelectOption);
		});
		var oSelectOption = mPropertyBag.modifier.createControl("sap.ui.mdc.base.state.SelectOption", mPropertyBag.appComponent, mPropertyBag.view, undefined, {
			propertyName: oChange.getContent().path,
			customData: new CustomData({
				key: "conditions",
				value: {
					conditions: oChange.getContent().conditions
				}
			})
		});
		mPropertyBag.modifier.insertAggregation(oUiState, "selectOptions", oSelectOption);

		if (oControl.applyFiltersAfterChangesApplied) {
			oControl.applyFiltersAfterChangesApplied();
		}
	};
	SetFilterValue.revertChange = function(oChange, oControl, mPropertyBag) {
		if (!oControl.getUiState) {
			return Base.markAsNotApplicable("We can apply the 'setFilterValue' change only during runtime, therefore the change can not be applied during XML processing.", true);
		}
		var oUiState = mPropertyBag.modifier.getAggregation(oControl, "uiState");
		if (!oUiState) {
			oUiState = mPropertyBag.modifier.createControl("sap.ui.mdc.base.state.UiState", mPropertyBag.appComponent, mPropertyBag.view, undefined);
			mPropertyBag.modifier.insertAggregation(oControl, "uiState", oUiState);
		}

		mPropertyBag.modifier.getAggregation(oUiState, "selectOptions").filter(function(oSelectOption) {
			return oSelectOption.getPropertyName() === oChange.getContent().path;
		}).forEach(function(oSelectOption) {
			mPropertyBag.modifier.removeAggregation(oUiState, "selectOptions", oSelectOption);
		});
		var oSelectOption = mPropertyBag.modifier.createControl("sap.ui.mdc.base.state.SelectOption", mPropertyBag.appComponent, mPropertyBag.view, undefined, {
			propertyName: oChange.getContent().path,
			customData: new CustomData({
				key: "conditions",
				value: {
					conditions: oChange.getRevertData().conditions
				}
			})
		});
		mPropertyBag.modifier.insertAggregation(oUiState, "selectOptions", oSelectOption);
		oChange.resetRevertData();

		if (oControl.applyFiltersAfterChangesApplied) {
			oControl.applyFiltersAfterChangesApplied();
		}
	};

	return SetFilterValue;
},
/* bExport= */true);
