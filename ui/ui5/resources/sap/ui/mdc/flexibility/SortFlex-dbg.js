/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([], function() {
	"use strict";
	var fRebindControl = function(oControl) {
		clearTimeout(fRebindControl.iTimer);
		fRebindControl.iTimer = setTimeout(function() {
			if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound()) {
				oControl.rebindTable();
			}
			if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Chart")) {
				oControl._rebind();
			}
		});
	};
	var Sort = {};
	Sort.removeSort = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--p13nData";
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var oP13nData = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				if (!oP13nData) {
					return;
				}

				var oValue, sValue = oValue = oModifier.getProperty(oP13nData, "value");

				if (typeof sValue === "string") {
					sValue = sValue = sValue.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
					oValue = JSON.parse(sValue);
				}

				if (!oValue) {
					return;
				}

				var aFoundValue = oValue.filter(function(o) {
					return o.name === oChangeContent.name;
				});
				var iIndex = oValue.indexOf(aFoundValue[0]);
				var oSortContent = {
					name: oChangeContent.name,
					index: iIndex,
					sortOrder: oChangeContent.sortOrder
				};
				oValue.splice(iIndex, 1);

				sValue = JSON.stringify(oValue);

				sValue = sValue.replace(/{/g, "\\{"); // Escape to NOT interpret custom data as binding

				oModifier.setProperty(oP13nData, "value", sValue);

				// Set revert data on the change //TODO!
				oChange.setRevertData({
					p13nId: sId,
					sortContent: oSortContent
				});
				// Rebind Table if needed
				fRebindControl(oControl);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				if (!oChange.getContent() && mChangeSpecificInfo.removedElement) {
					oChange.setContent(mChangeSpecificInfo.removedElement);
				}
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();
				var oControlSelector = oModifier.getSelector(oRevertData.p13nId, mPropertyBag.appComponent);
				var oP13nData = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				if (!oP13nData) {
					return;
				}
				var oValue, sValue = oValue = oModifier.getProperty(oP13nData, "value");

				if (typeof sValue === "string") {
					sValue = sValue = sValue.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
					oValue = JSON.parse(sValue);
				}

				if (!oValue) {
					return;
				}

				oValue.splice(oRevertData.sortContent.index, 0, oRevertData.sortContent);
				sValue = JSON.stringify(oValue);

				sValue = sValue.replace(/{/g, "\\{"); // Escape to NOT interpret custom data as binding

				oModifier.setProperty(oP13nData, "value", sValue);
				// Clear the revert data on the change
				oChange.resetRevertData();
				// Rebind Table if needed
				fRebindControl(oControl);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Sort.addSort = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--p13nData";
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var oP13nData = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				if (!oP13nData) {
					oP13nData = oModifier.createControl("sap.ui.core.CustomData", mPropertyBag.appComponent, mPropertyBag.view, sId, {
						key: "$p13nSort"
					});
					oModifier.insertAggregation(oControl, "customData", oP13nData, null, mPropertyBag.view);
				}

				var oValue, sValue = oValue = oModifier.getProperty(oP13nData, "value");

				if (typeof sValue === "string") {
					sValue = sValue = sValue.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
					oValue = JSON.parse(sValue);
				}

				if (!oValue) {
					oValue = [];
				}

				var oSortContent = {
					name: oChangeContent.name,
					index: oChangeContent.index,
					sortOrder: oChangeContent.sortOrder
				};
				oValue.splice(oSortContent.index, 0, oSortContent);

				sValue = JSON.stringify(oValue);

				sValue = sValue.replace(/{/g, "\\{"); // Escape to NOT interpret custom data as binding

				oModifier.setProperty(oP13nData, "value", sValue);

				// Set revert data on the change //TODO!
				oChange.setRevertData({
					p13nId: sId,
					sortContent: oSortContent
				});
				// Rebind Table if needed
				fRebindControl(oControl);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();
				var oControlSelector = oModifier.getSelector(oRevertData.p13nId, mPropertyBag.appComponent);
				var oP13nData = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				if (!oP13nData) {
					return;
				}
				var oValue, sValue = oValue = oModifier.getProperty(oP13nData, "value");

				if (typeof sValue === "string") {
					sValue = sValue = sValue.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
					oValue = JSON.parse(sValue);
				}

				if (!oValue) {
					return;
				}
				var aFoundValue = oValue.filter(function(o) {
					return o.name === oRevertData.sortContent.name;
				});
				var iIndex = oValue.indexOf(aFoundValue[0]);
				oValue.splice(iIndex, 1);

				sValue = JSON.stringify(oValue);

				sValue = sValue.replace(/{/g, "\\{"); // Escape to NOT interpret custom data as binding

				oModifier.setProperty(oP13nData, "value", sValue);
				// Clear the revert data on the change
				oChange.resetRevertData();
				// Rebind Table if needed
				fRebindControl(oControl);
			}
		},
		"layers": {
			"USER": true
		}
	};
	return Sort;
});
