/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define(['sap/base/util/merge', 'sap/base/util/deepEqual'], function (merge, deepEqual) {
	"use strict";

	/**
	 * FilterBar-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.FilterBar
	 * @author SAP SE
	 * @version 1.71.61
	 */

	var fAddFilter = function(oChange, oControl, mPropertyBag, nIndex) {
		var oModifier, oChangeContent, oView;

		oChangeContent = oChange.getContent();

		oModifier = mPropertyBag.modifier;
		oView = mPropertyBag.view;

		//var oSelector = {id: oChangeContent.id, isLocalId: true};

		return oModifier.createControl("sap.ui.mdc.FilterField", mPropertyBag.appComponent, mPropertyBag.view, oChangeContent.id, {
			dataType: oChangeContent.type,
			conditions: oChangeContent.conditions,
			required: oChangeContent.required,
			label: oChangeContent.label,
			maxConditions: oChangeContent.maxConditions
		}, true).then(function(oFilterField) {

			if (oChangeContent.fieldHelp) {
				//TODO: rework, once RTA clarifies the association handling
				if (oModifier.targets === "jsControlTree") {
					oFilterField.setFieldHelp(oView.createId(oChangeContent.fieldHelp));
				} else {
					oModifier.setProperty(oFilterField, "fieldHelp", oChangeContent.fieldHelp);
				}
//				oModifier.setAssociation(oFilterField, "fieldHelp", oChangeContent.fieldHelp);
			}

			var oConstraints = oChangeContent.constraints;
			if (oConstraints) {
				oModifier.setProperty(oFilterField, "dataTypeConstraints", oConstraints);
			}
			var oFormatOptions = oChangeContent.formatOptions;
			if (oFormatOptions) {
				oModifier.setProperty(oFilterField, "dataTypeFormatOptions", oFormatOptions);
			}

			var aFilterItems = oModifier.getAggregation(oControl, "filterItems");

			nIndex = nIndex || aFilterItems.length;
			oModifier.insertAggregation(oControl, "filterItems", oFilterField, nIndex);

			// Set revert data on the change
			return oModifier.getId(oFilterField);
		});
	};

	var fRemoveFilter = function(oChange, oChangeContent, oControl, mPropertyBag, bRevert) {
		var oModifier = mPropertyBag.modifier;
		var oControlSelector = oModifier.getSelector(oChangeContent.id, mPropertyBag.appComponent);

		var oFilterField = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
		var iIndex = oModifier.findIndexInParentAggregation(oFilterField);
		oModifier.removeAggregation(oControl, "filterItems", oFilterField);
		oModifier.destroy(oFilterField);

		if (!bRevert) {
			oChange.setRevertData({
				id: oChangeContent.id,
				index: iIndex
			});
		}
	};

	var fSetFilterPosition = function(oChange, oChangeContent, oControl, mPropertyBag, bRevert) {
		var oModifier = mPropertyBag.modifier;
		var oControlSelector, oFilterField = null;
		var iIndex, nIndex = oChangeContent.position;

		if (oChangeContent.id) {
			oControlSelector = oModifier.getSelector(oChangeContent.id, mPropertyBag.appComponent);
			oFilterField = oModifier.bySelector(oControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
		}

		if (oFilterField) {
			iIndex = oModifier.findIndexInParentAggregation(oFilterField);

			if (iIndex != nIndex) {
				oModifier.removeAggregation(oControl, "filterItems", oFilterField);
				oModifier.insertAggregation(oControl, "filterItems", oFilterField, nIndex);
			}

			if (!bRevert) {
				oChange.setRevertData({
					id: oChangeContent.id,
					position: nIndex
				});
			}
		}
	};

	var fAddCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bRevert) {

		if (oControl.applyConditionsAfterChangesApplied) {
			oControl.applyConditionsAfterChangesApplied();
		}

		return new Promise(function(resolve) {

			var mConditionsData, aConditions = null, oModifier = mPropertyBag.modifier;

			mConditionsData = merge({}, oModifier.getProperty(oControl, "filtersConditions"));
			if (mConditionsData) {
				for ( var sFieldPath in mConditionsData) {
					if (sFieldPath === oChangeContent.name) {
						aConditions = mConditionsData[sFieldPath];
						break;
					}
				}
			}

			if (!aConditions) {
				mConditionsData[oChangeContent.name] = [];
				aConditions = mConditionsData[oChangeContent.name];
			}

			var bConditionExisist = false;
			mConditionsData[oChangeContent.name].some(function(oCondition) {
				// if (deepEqual(oCondition, oChangeContent.condition)) {
				if (deepEqual(oCondition.operator, oChangeContent.condition.operator) && deepEqual(oCondition.values, oChangeContent.condition.values)) {
					bConditionExisist = true;
				}

				return bConditionExisist;
			});

			if (!bConditionExisist) {
				aConditions.push(oChangeContent.condition);

				oModifier.setProperty(oControl, "filtersConditions", mConditionsData);

				if (!bRevert) {
					// Set revert data on the change
					oChange.setRevertData({
						name: oChangeContent.name,
						condition: oChangeContent.condition
					});
				}
			}

			resolve();
		});
	};

	var fRemoveCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bRevert) {

		if (oControl.applyConditionsAfterChangesApplied) {
			oControl.applyConditionsAfterChangesApplied();
		}

		return new Promise(function(resolve) {
			var mConditionsData, aConditions, nDelIndex = -1, oModifier = mPropertyBag.modifier;

			mConditionsData = merge({}, oModifier.getProperty(oControl, "filtersConditions"));
			if (mConditionsData) {
				for ( var sFieldPath in mConditionsData) {
					if (sFieldPath === oChangeContent.name) {
						aConditions = mConditionsData[sFieldPath];
						break;
					}
				}
			}

			if (aConditions && (aConditions.length > 0)) {

				aConditions.some(function(oEntry, nIdx) {
					//if (deepEqual(oEntry, oChangeContent.condition)) {
					if (deepEqual(oEntry.operator, oChangeContent.condition.operator) && deepEqual(oEntry.values, oChangeContent.condition.values)) {
						nDelIndex = nIdx;
					}

					return nDelIndex >= 0;
				});

				if (nDelIndex >= 0) {
					aConditions.splice(nDelIndex, 1);
//					if (aConditions.length === 0) {
//						delete mConditionsData[oChangeContent.name];
//					}
					oModifier.setProperty(oControl, "filtersConditions", mConditionsData);

					if (!bRevert) {
						// Set revert data on the change
						oChange.setRevertData({
							name: oChangeContent.name,
							condition: oChangeContent.condition
						});
					}
				}
			}

			resolve();
		});
	};


	return {
		"hideControl": "default",
		"unhideControl": "default",
		"removeFilter": {
			"changeHandler": {
				applyChange: function (oChange, oControl, mPropertyBag) {
					return fRemoveFilter(oChange, oChange.getContent(), oControl, mPropertyBag);
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					//oChange.setContent(mChangeSpecificInfo.removedElement);
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					var oRevertData = oChange.getRevertData();
					return fAddFilter(oChange, oControl, mPropertyBag, oRevertData.index).then(function(sId) {
						// Clear the revert data on the change
						oChange.resetRevertData();
					});
				}
			},
			"layers": {
				"USER": true
			}
		},
		"addFilter": {
			"changeHandler": {
				applyChange: function (oChange, oControl, mPropertyBag) {
					return fAddFilter(oChange, oControl, mPropertyBag).then(function(sId) {
						oChange.setRevertData({
							id: sId
						});
					});
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// TODO
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					fRemoveFilter(oChange, oChange.getRevertData(), oControl, mPropertyBag, true);
					// Clear the revert data on the change
					oChange.resetRevertData();
				}
			},
			"layers": {
				"USER": true
			}
		},
		"setFilterPosition": {
			"changeHandler": {
				applyChange: function (oChange, oControl, mPropertyBag) {
					fSetFilterPosition(oChange, oChange.getContent(), oControl, mPropertyBag);

				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// TODO
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					fSetFilterPosition(oChange, oChange.getRevertData(), oControl, mPropertyBag, true);

					// Clear the revert data on the change
					oChange.resetRevertData();
				}
			},
			"layers": {
				"USER": true
			}
		},
		"addCondition": {
			"changeHandler": {
				applyChange: function (oChange, oControl, mPropertyBag) {
					//return fAddRemoveCondition(oChange, oChange.getContent(), oControl, mPropertyBag);
					return fAddCondition(oChange, oChange.getContent(), oControl, mPropertyBag);
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// TODO
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					return fRemoveCondition(oChange, oChange.getRevertData(), oControl, mPropertyBag, true).then(function() {
						oChange.resetRevertData();
					});

				}
			},
			"layers": {
				"USER": true
			}
		},
		"removeCondition": {
			"changeHandler": {
				applyChange: function (oChange, oControl, mPropertyBag) {
					return fRemoveCondition(oChange, oChange.getContent(), oControl, mPropertyBag);
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// TODO
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					return fAddCondition(oChange, oChange.getRevertData(), oControl, mPropertyBag, true).then(function() {
						oChange.resetRevertData();
					});

				}
			},
			"layers": {
				"USER": true
			}
		}
	};
}, /* bExport= */true);
