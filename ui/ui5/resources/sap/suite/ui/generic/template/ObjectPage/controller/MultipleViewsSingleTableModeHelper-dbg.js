sap.ui.define(["sap/ui/base/Object", "sap/suite/ui/generic/template/js/StableIdHelper"],
	function(BaseObject, StableIdHelper) {
		"use strict";

		// oController is the controller of the enclosing ObjectPage
		// oTemplateUtils are the template utils as passed to the controller implementation
		// fnSetInitialKey a function to set the initially set key
		function getMethods(oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, oCurrentSection) {

			// Begin private instance methods

			// method to be called in onTableInit() of the smart table used to realize all the views (which is actually oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable)
			function fnInit(oEvent, setModelDataForItem) {
				var sFacetId = oCurrentSection && oCurrentSection.key;
				var sStableIdForSegmentedButton = StableIdHelper.getStableId({
					type: "ObjectPageTable",
					subType: "SegmentedButton",
					sFacet: sFacetId
				});
				var sStableIdForVariantSelection = StableIdHelper.getStableId({
					type: "ObjectPageTable",
					subType: "VariantSelection",
					sFacet: sFacetId
				});
				//var oImplementingControl = oController.byId("template:::ObjectPageTable:::SegmentedButton") || oController.byId("template:::ObjectPageTable:::VariantSelection");
				var oImplementingControl = oController.byId(sStableIdForSegmentedButton) || oController.byId(sStableIdForVariantSelection);
				var aPossibleItems = oImplementingControl ? oImplementingControl.getItems() : []; // retrieve items to transfer the custom data into the maps used in this class
				for (var i = 0; i < aPossibleItems.length; i++) {
					var oItem = aPossibleItems[i];
					var sKey = oItem.getKey();
					setModelDataForItem(sKey, oItem);
				}
				// initialize with the first item being selected
				if (aPossibleItems.length > 0) {
					fnSetInitialKey(aPossibleItems[0].getKey());
				}
			}

			// End private instance methods

			// public instance methods
			return {
				init: fnInit
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.controller.MultipleViewsSingleTableModeHelper", {
			constructor: function(oQuickVariantSelection, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, oCurrentSection) {
				Object.assign(this, getMethods(oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, oCurrentSection));
			}
		});
	});
