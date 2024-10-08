/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/mdc/odata/v4/ChartDelegate",
	"sap/ui/fl/changeHandler/Base"
], function (MetadataDelegate, FLBase) {
	"use strict";
	var fRebindControl = function (oControl) {
		clearTimeout(fRebindControl.iTimer);
		fRebindControl.iTimer = setTimeout(function () {
			if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Chart")) {
				oControl._rebind();
			}
		});
	};
	var ChartItem = {};
	ChartItem.removeItem = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {

				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oChangeContent.id ? oChangeContent.id : oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--" + oChangeContent.name;
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var oItem = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				var iIndex = oModifier.findIndexInParentAggregation(oItem);

				if (!oItem) {
					//mark the change as not applicable since the according item is already existing
					FLBase.markAsNotApplicable("Specified change is already existing", true);
				}

				oModifier.removeAggregation(oControl, "items", oItem);
				oModifier.destroy(oItem);

				var mAggregation = MetadataDelegate.retrieveAggregationItem("items,", oChangeContent);

				// Set revert data on the change, reverting 'removeItem' results in 'addItem'
				oChange.setRevertData({
					id: oChangeContent.id,
					label: oModifier.getProperty(oItem, "label"),
					settings: mAggregation.settings,
					controlSelector: oControlSelector,
					index: iIndex,
					role: oChangeContent.role
				});

			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				if ((!oChange.getContent() || !oChange.getContent().id) && mChangeSpecificInfo.removedElement) {
					oChange.setContent(mChangeSpecificInfo.removedElement);
				}
			},
			revertChange: function (oChange, oControl, mPropertyBag) {

				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();

				var mAggregation = MetadataDelegate.retrieveAggregationItem("items", oRevertData);
				var oControlSelector = oRevertData.controlSelector;
				var oItem = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);

				//check if the item is already existing
				if (!oItem) {
					oItem = oModifier.createControl(mAggregation.className, mPropertyBag.appComponent, mPropertyBag.view, oRevertData.id, mAggregation.settings);
					oItem.setProperty("role", oRevertData.role);
					var aItems = oModifier.getAggregation(oControl, "items");
					var iIndex = oRevertData.index > -1 ? oRevertData.index : aItems.length;
					oModifier.insertAggregation(oControl, "items", oItem, iIndex);
				}

				// Clear the revert data on the change
				oChange.resetRevertData();
				// Rebind Chart if needed
				if (!oRevertData.preventRebind) {
					fRebindControl(oControl);
				}

			}
		},
		"layers": {
			"USER": true
		}
	};
	ChartItem.addItem = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = oChange.getContent();
				var sId = oChangeContent.id ? oChangeContent.id : oModifier.getControlIdBySelector(oChange.getSelector(), mPropertyBag.appComponent) + "--" + oChangeContent.name;
				var oControlSelector = oModifier.getSelector(sId, mPropertyBag.appComponent);
				var mAggregation = MetadataDelegate.retrieveAggregationItem("items,", oChangeContent);

				var oItem = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);

				//check if the item is already existing
				if (!oItem){
					oItem = oModifier.createControl(mAggregation.className, mPropertyBag.appComponent, mPropertyBag.view, sId, mAggregation.settings);
					oItem.setProperty("role", oChangeContent.role);				var aItems = oModifier.getAggregation(oControl, "items");
					var iIndex = oChangeContent.index > -1 ? oChangeContent.index : aItems.length;
					oModifier.insertAggregation(oControl, "items", oItem, iIndex);
				} else {
					//mark the change as not applicable since the according item is already existing
					FLBase.markAsNotApplicable("Specified change is already existing", true);
				}

				// Set revert data on the change, reverting 'addItem' results in 'removeItem'
				oChange.setRevertData({
					id: oChangeContent.id,
					item: sId,
					role: oChangeContent.role
				});
				// Rebind Chart if needed
				if (!oChangeContent.preventRebind) {
					fRebindControl(oControl);
				}
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oRevertData = oChange.getRevertData();
				var oControlSelector = oModifier.getSelector(oRevertData.item, mPropertyBag.appComponent);
				var oItem = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
				oModifier.removeAggregation(oControl, "items", oItem);
				oModifier.destroy(oItem);
				// Clear the revert data on the change
				oChange.resetRevertData();
			}
		},
		"layers": {
			"USER": true
		}
	};
	return ChartItem;
});
