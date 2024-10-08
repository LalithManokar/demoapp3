/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/Base"
], function(FLBase) {
	"use strict";
	// TODO: this is just a workaround until we get suspend/resume working; i.e. get to know at what point in time the binding can be resumed!
	var fRebindControl = function(oControl) {
		clearTimeout(fRebindControl.iTimer);
		fRebindControl.iTimer = setTimeout(function() {
			if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound()) {
				oControl.rebindTable();
			}
		});
	};
	var Column = {};
	Column.removeColumn = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oChangeContent.id ? oChangeContent.id : oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--" + oChangeContent.name;
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var oMDCColumn = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);

				if (!oMDCColumn) {
					FLBase.markAsNotApplicable("Specified change is already existing", true);
				}

				var iIndex = oModifier.findIndexInParentAggregation(oMDCColumn);
				oModifier.removeAggregation(oControl, "columns", oMDCColumn);
				// column will be destroyed later with table, if needed
				if (oMDCColumn.isA) {
					oModifier.insertAggregation(oControl, "dependent", oMDCColumn);
				}

				// Set revert data on the change
				oChange.setRevertData({
					id: oChangeContent.id,
					preventRebind: oChangeContent.preventRebind,
					label: oModifier.getProperty(oMDCColumn, "header"),
					dataProperties: oModifier.getProperty(oMDCColumn, "dataProperties"),
					controlSelector: oControlSelector,
					index: iIndex
				});
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				if ((!oChange.getContent() || !oChange.getContent().id) && mChangeSpecificInfo.removedElement) {
					oChange.setContent(mChangeSpecificInfo.removedElement);
				}
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();
				var oControlSelector = oRevertData.controlSelector;
				var oMDCColumn = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				if (!oMDCColumn) {
					oMDCColumn = oModifier.createControl("sap.ui.mdc.Column", mPropertyBag.appComponent, mPropertyBag.view, oRevertData.id, {
						header: oRevertData.label,
						dataProperties: oRevertData.dataProperties
					});
				}

				// check if the column is already existing in the aggregation
				if (!oModifier.findAggregation(oMDCColumn, "columns")) {
					oModifier.insertAggregation(oControl, "columns", oMDCColumn, oRevertData.index);
				}

				// Clear the revert data on the change
				oChange.resetRevertData();
				// Rebind Table if needed
				if (!oRevertData.preventRebind) {
					fRebindControl(oControl);
				}
			}
		},
		"layers": {
			"USER": true
		}
	};
	Column.addColumn = { // TODO: consider to generalize this and possible move some parts to a BaseFlex file
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oChangeContent.id ? oChangeContent.id : oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--" + oChangeContent.name;
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var oMDCColumn = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				var aColumns, iIndex;

				if (!oMDCColumn) {
					oMDCColumn = oModifier.createControl("sap.ui.mdc.Column", mPropertyBag.appComponent, mPropertyBag.view, sId, {
						header: oChangeContent.label || oChangeContent.name,
						dataProperties: [
							oChangeContent.name
						]
					});
				}
				aColumns = oModifier.getAggregation(oControl, "columns");
				iIndex = oChangeContent.index > -1 ? oChangeContent.index : aColumns.length;

				// check if the column is already existing in the aggregation
				if (!oModifier.findAggregation(oMDCColumn, "columns")) {
					oModifier.insertAggregation(oControl, "columns", oMDCColumn, iIndex);
				} else {
					// mark the change as not applicable since the according item is already existing
					FLBase.markAsNotApplicable("Specified change is already existing", true);
				}

				// Set revert data on the change
				oChange.setRevertData({
					id: oChangeContent.id,
					column: sId
				});
				// Rebind Table if needed
				if (!oChangeContent.preventRebind) {
					fRebindControl(oControl);
				}
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();
				var oControlSelector = oModifier.getSelector(oRevertData.column, mPropertyBag.appComponent);
				var oMDCColumn = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				oModifier.removeAggregation(oControl, "columns", oMDCColumn);
				// Clear the revert data on the change
				oChange.resetRevertData();
			}
		},
		"layers": {
			"USER": true
		}
	};
	return Column;
});
