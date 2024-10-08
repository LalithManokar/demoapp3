sap.ui.define(["sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/base/Log",
	"sap/suite/ui/generic/template/ObjectPage/controller/MultipleViewsSingleTableModeHelper"
], function(BaseObject, Filter, testableHelper, Log, MultiViewsSingleTableHelper) {
		"use strict";

		/*
		 * This helper class handles multiple views in the object page section table.
		 * It is a wrapper for MultipleViewSingleTableModeHelper
		 * this class is created in onInit of the ObjectPage controller.


		 *  That controller forwards all tasks
		 * connected to the single table mode of the multiple views feature to this instance.
		 * The mode can be switched on and configured via the quickVariantSelection.variants section in the manifest.
		 *
		 */

		// constants
		// This class uses a section in the template private model to transfer information between javascript and UI.
		// The following constants represent the pathes in the model that are used to access this information
		var PATH_TO_PROPERTIES = "/objectPage/multipleViews"; // root path for all properties used for this feature
		var PATH_TO_SELECTED_KEY = "/selectedKey"; // path to the key of the currently active view
		var PATH_TO_ITEMS = "/items";
		// These data are needed by formatter formatItemTextForMultipleView to determine the text (including counts) for this item
		// Therefore, this map is only created when the showCounts property is set. In this case the item data contain the following properties:
		// text: The fixed text belonging to this item
		// count: Current count of this item
		// state: possible values are "" = count can be used, "busy" = count is currently being determined, "error" = error happened when determining the count

		// oState is used as a channel to transfer data to the controller and back.
		// oController is the controller of the enclosing ObjectPage
		// oTemplateUtils are the template utils as passed to the controller implementation
		function getMethods(oState, oController, oTemplateUtils, oCurrentSection) {
			// Begin: Instance variables
			var oImplementingHelper;
			var oQuickVariantSelectionEffective;
			var sMode;
			var bShowCounts;
			var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel(); // the template private model used to transfer data between javascript and UI
			// Variables representing the current state
			var mItemData; // maps the keys of the items onto metadata of the corresponding views used in this class. The metadata contains the following properties:
			// selectionVariantFilters: The filters valid for this item
			// templateSortOrder: the sort order used for this item
			// implementingControl: The control (smart table or chart) implementing the view
			// the following properties are only available when the showCounts property is set:
			// numberOfUpdates: a counter increased for each call request that is performed for updating the text for this item. Used to identify outdated requests.
			// updateStartFunction, updateSuccessFunction, errorFunction: functions to be called, when the update of counters is started, has entered successfully, has run into an error
			//         each of these function gets the value of numberOfUpdates valid when the update is started as first parameter
			//         updateSuccessFunction gets the count that was retrieved as second parameter
			// dirtyState: 0 = ok, 1 = needs rebind, 2 = needs refresh, 3 = needs both
			// The following additional properties are only added in the MultipleTable case (by the ImplementingHelper):
			// id: id of implementing control
			// only in multiple entityType case: entitySet, properties

			var iDefaultDelayMs = oTemplateUtils.oServices.oApplication.getBusyHelper().getBusyDelay();
			// End: Instance variables

			// Begin private instance methods

			// formatter for the text on the items (only used when showCounts is switched on)
			// oItemDataModel: current data for the item as described in the comment for PATH_TO_ITEMS
			// returns the text to be used for the item
			function formatItemTextForMultipleView(oItemDataModel) {
				var sFormatedValue;
				if (!oItemDataModel) {
					return "";
				}
				if (oItemDataModel.state === "error") {
					return oTemplateUtils.oCommonUtils.getText("SEG_BUTTON_ERROR", oItemDataModel.text); // originally the text was for segmented button only but is now used for all texts with multiple views
				}
				if (oItemDataModel.state === "" || oItemDataModel.state === "busy") {
					var oIntegerInstance = sap.ui.core.format.NumberFormat.getIntegerInstance({
						groupingEnabled: true
					});
					sFormatedValue = oIntegerInstance.format(oItemDataModel.count);
				}
				return oTemplateUtils.oCommonUtils.getText("SEG_BUTTON_TEXT", [oItemDataModel.text, oItemDataModel.state === "busyLong" ? "..." : sFormatedValue]); // // originally the text was for segmented button only but is now used for all texts with multiple views
			}

			// get the key of the currently selected item
			function getVariantSelectionKey() {
				return oTemplatePrivateModel.getProperty(getPropertyPath(PATH_TO_SELECTED_KEY));
			}

			function getSelectionVariantFilters(oEntityType, oCustomDataParent) {
				var aSelectionVariantFilters = [], oSelectionVariantPath;
				var sSelectionVariantPath = oTemplateUtils.oCommonUtils.getElementCustomData(oCustomDataParent).variantAnnotationPath;
				if (sSelectionVariantPath) {
					var oVariant = oEntityType[sSelectionVariantPath];
					if (!oVariant) {
						return [];
					}
					if (!oVariant.SelectOptions && oVariant.SelectionVariant) {
						// for SelectionPresentationVariants, make sure to refer to SelectionVariant
						oVariant = oVariant.SelectionVariant;
						if (oVariant.Path) {
							// resolve reference to SelectionVariant via path
							sSelectionVariantPath = oVariant.Path.split("@")[1];
							oVariant = sSelectionVariantPath && oEntityType[sSelectionVariantPath];
						}
					}
					if (oVariant.AnnotationPath) {
						oSelectionVariantPath = oVariant.AnnotationPath.split("@")[1];
						oVariant = oEntityType[oSelectionVariantPath];
					}
					for (var i in oVariant.SelectOptions) {
						if (oVariant.SelectOptions[i].PropertyName) {
							var sPath = oVariant.SelectOptions[i].PropertyName.PropertyPath;
							for (var j in oVariant.SelectOptions[i].Ranges) {
								var oOperator = oVariant.SelectOptions[i].Ranges[j].Option;
								oOperator.EnumMember = oOperator.EnumMember.replace("com.sap.vocabularies.UI.v1.SelectionRangeOptionType/", "");
								var oValueLow = oVariant.SelectOptions[i].Ranges[j].Low;
								var oValueHigh = oVariant.SelectOptions[i].Ranges[j].High;
								var sKeyLow = Object.keys(oValueLow)[0];
								if (oValueHigh) {
									var sKeyHigh = Object.keys(oValueHigh)[0];
									aSelectionVariantFilters.push(new Filter(sPath, oOperator.EnumMember, oValueLow[sKeyLow], oValueHigh[sKeyHigh]));
								} else {
									aSelectionVariantFilters.push(new Filter(sPath, oOperator.EnumMember, oValueLow[sKeyLow]));
								}
							}
						}
					}
				}
				return aSelectionVariantFilters;
			}

			// Note: This method is called for each smart table/chart used to realize the feature when it is initialized.
			// In single mode this is exactly once, in multi mode it will be several times.
			function fnInit(oEvent) {
				if (!oImplementingHelper) {
					return;
				}
				var oSmartTableOrChart = oEvent.getSource();
				var oModel = oSmartTableOrChart.getModel();
				var oMetaModel = oModel.getMetaModel();
				var sEntitySet = oSmartTableOrChart.getEntitySet();
				var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

				var setModelDataForItem = function(sKey, oControl) {
					var aSelectionVariantFilters = getSelectionVariantFilters(oEntityType, oControl);
					var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oControl); // retrieve custom data for this table
					// ImplementingHelper might already have initialized the item data for this key. In this case enhance them, otherwise create them.
					var oItemData = mItemData[sKey] || Object.create(null);
					oItemData.selectionVariantFilters = aSelectionVariantFilters;
					oItemData.templateSortOrder = oCustomData.TemplateSortOrder;
					oItemData.implementingControl = oSmartTableOrChart;
					oItemData.dirtyState = 0;
					mItemData[sKey] = oItemData;
					if (bShowCounts) {
						var sPathToTheItem = getPropertyPath(PATH_TO_ITEMS) + "/" + sKey;
						// sState can be "busy" (start of determination of counts), "busyLong" (determination of counts lasts longer than 1000ms), "" (determination was finished successfully), "error" (determination failed)
						// iNumberOfUpdates is the identification of the backend call
						// iNewCount is the newly determined count (only valid when sState is "")
						var fnUpdateFunction = function(sState, iNumberOfUpdates, iNewCount) {
							if (oItemData.numberOfUpdates !== iNumberOfUpdates) { // this is the response for an outdated request
								return;
							}
							var oModelEntry = Object.assign({}, oTemplatePrivateModel.getProperty(sPathToTheItem)); // must create a new instance. Otherwise UI5 will not recognize the change
							if (!oModelEntry.state && sState == "busy") {
								setTimeout(function() {
									if (oTemplatePrivateModel.getProperty(sPathToTheItem).state === "busy") {
										oModelEntry = Object.assign({}, oTemplatePrivateModel.getProperty(sPathToTheItem)); // must create a new instance. Otherwise UI5 will not recognize the change
										oModelEntry.state = "busyLong";
										oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry); // Note that this will trigger the call of formatItemTextForMultipleView
									}
								}, iDefaultDelayMs);
							}
							oModelEntry.state = sState; // update the state
							if (!sState) { // determination was successfull -> update the count
								oModelEntry.count = iNewCount;
							}
							oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry); // Note that this will trigger the call of formatItemTextForMultipleView
						};
						oItemData.numberOfUpdates = 0;
						oItemData.updateStartFunction = fnUpdateFunction.bind(null, "busy");
						oItemData.updateSuccessFunction = fnUpdateFunction.bind(null, "");
						oItemData.errorFunction = fnUpdateFunction.bind(null, "error");
						var oModelEntry = {
							text: oCustomData.text,
							count: 0, // at initialization 0 will be displayed as counter everywhere
							state: "",
							facetId: oCurrentSection.key
						};
						oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry);
					}
				};

				oImplementingHelper.init(oEvent, setModelDataForItem);
			}

			function getMode() {
				return sMode;
			}

			// get metadata of the currently selected item
			function getCurrentItemData() {
				return mItemData[oTemplatePrivateModel.getProperty(getPropertyPath(PATH_TO_SELECTED_KEY))]; // return metadata of selected item
			}

			function getPropertyPath(sPath) {
				return PATH_TO_PROPERTIES + "/" + oCurrentSection.key + sPath;
			}

			// callback called by onBeforeRebindTable of the smart table
			// add filters of the selected item to the search condition
			function onRebindContentControl(oEvent) {
				if (!oImplementingHelper) {
					return;
				}
				var oBindingParams = oEvent.getParameter("bindingParams");
				oState.oMultipleViewsHandler[oCurrentSection.key].oFiltersWithoutSmartFilterBar = jQuery.extend(true, {}, oBindingParams);
				oState.oMultipleViewsHandler[oCurrentSection.key].oFiltersForCounts = jQuery.extend(true, {}, oBindingParams);
				fnAddFiltersFromSelectionVariant(oBindingParams);
			}

			function fnAddFiltersFromSelectionVariant(oBindingParams) {
				var oItemData = getCurrentItemData(); // get metadata of selected item
				if (oItemData) {
					var aSelectionVariantFilters = oItemData.selectionVariantFilters;
					for (var i in aSelectionVariantFilters) { // add the filters of the selected item
						oBindingParams.filters.push(aSelectionVariantFilters[i]);
					}
				}
			}

			function fnRemoveTableSettingsFromFilters(aFiltersToBeRemovedFrom, aFiltersToBeRemoved) {
				for (var i in aFiltersToBeRemoved) {
					var oFilterToBeRemoved = aFiltersToBeRemoved[i];
					for (var j = aFiltersToBeRemovedFrom.length; j--; j >= 0) {
						if (JSON.stringify(aFiltersToBeRemovedFrom[j]) === JSON.stringify(oFilterToBeRemoved)) {
							aFiltersToBeRemovedFrom.splice(j, 1);
							break;
						}
					}
				}
			}

			/* Triggers update of the texts on all items
			 * oState.[oCurrentSection.key].oFiltersForCounts contains editing status and custom filters if any
			 */
			function fnUpdateCounts() {
				var oSmartTable = oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable;
				var oModel = oSmartTable.getModel();
				var oBindingContext = oSmartTable.getBindingContext();
				var sContextPath = oBindingContext.getPath();
				var sTableBindingPath = oSmartTable.getTableBindingPath();
				var aFilters = [], sTableEntitySet;
				var aFiltersTemp;
				for (var sKey in mItemData) { // loop over all items
					aFiltersTemp = jQuery.extend(true, {}, oState.oMultipleViewsHandler[oCurrentSection.key].oFiltersForCounts); // oState.[oCurrentSection.key].oFiltersForCounts contains "editing status" and custom filters if any
					var oItemData = mItemData[sKey]; // get metadata for this item
					sTableEntitySet = oItemData.entitySet;
					if (!sTableEntitySet) {
						sTableEntitySet = oSmartTable.getEntitySet();
					}
					oItemData.numberOfUpdates++; // start a new update call
					oItemData.updateStartFunction(oItemData.numberOfUpdates); // set counter busy

					aFilters = aFiltersTemp.filters.concat(oItemData.selectionVariantFilters); // note, that this does not modify the arrays which are concatenated

					oModel.read(sContextPath + "/" + sTableBindingPath + "/$count", {
						//urlParameters: oSearch,
						filters: aFilters,
						groupId: "updateMultipleViewsItemsCounts", // send the requests for all count updates in one batch request
						success: oItemData.updateSuccessFunction.bind(null, oItemData.numberOfUpdates), // bind the success handler to the current request
						error: oItemData.errorFunction.bind(null, oItemData.numberOfUpdates) // bind the error handler to the current request
					});
				}
			}

			function onDataRequested() {
				if (bShowCounts) {
					fnUpdateCounts();
				}
			}

			function getShowCounts() {
				return bShowCounts;
			}

			/*
			 * function returns all entity set properties of the relevant control (oControl)
			 */
			function findEntityProperties(oControl) {
				var sKey;
				for (sKey in mItemData) {
					if (mItemData[sKey].implementingControl === oControl) {
						return mItemData[sKey].properties;
					}
				}
			}

			// iRequest: 1 = rebind, 2 = refresh, 3 = both
			function fnRefreshOperationOnCurrentSmartControl(iRequest){
				var bIsSmartTable = oTemplateUtils.oCommonUtils.isSmartTable(oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable);
				if (iRequest !== 2){ // rebind needed
					oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable["rebindTable"]();
				}
				if (iRequest > 1){ // refresh needed
					if (bIsSmartTable){
						oTemplateUtils.oCommonUtils.refreshSmartTable(oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable);
					} else {
						// todo ?
					}
				}
			}

			//Create objects in MultipleViewsHandler & if exists already, then just update it.
			function createOrUpdateMultipleViewsObject(oValue) {
				var oPathToProperty = oTemplatePrivateModel.getProperty(PATH_TO_PROPERTIES);
				if (!oPathToProperty) {
					oPathToProperty = {};
					oPathToProperty[oCurrentSection.key] = oValue;
				} else if (oPathToProperty && !oPathToProperty[oCurrentSection.key]) {
					oPathToProperty[oCurrentSection.key] = oValue;
				} else if (oPathToProperty && oPathToProperty[oCurrentSection.key]) {
					for (var attrname in oValue) {
						oPathToProperty[oCurrentSection.key][attrname] = oValue[attrname];
					}
				}
				oTemplatePrivateModel.setProperty(PATH_TO_PROPERTIES, oPathToProperty);
			}

			// End private instance methods

			(function() { // constructor coding encapsulated in order to reduce scope of helper variables
				//var oConfig, oSettings, oQuickVariantSelectionX,
				var oQuickVariantSelection;
				//console.log(oCurrentSection);
				// oConfig = oController.getOwnerComponent().getAppComponent().getConfig();
				// oSettings = oConfig && oConfig.pages[0] && oConfig.pages[0].component && oConfig.pages[0].component.settings;
				if (!oCurrentSection) {
					return;
				}
				//oQuickVariantSelectionX = oSettings.quickVariantSelectionX;
				oQuickVariantSelection = oCurrentSection.quickVariantSelection;
				// if (oQuickVariantSelectionX && oQuickVariantSelection) {
				// 	throw new Error("Defining both QuickVariantSelection and QuickVariantSelectionX in the manifest is not allowed.");
				// }
				oQuickVariantSelectionEffective = oQuickVariantSelection;
				if (!oQuickVariantSelectionEffective) {
					return;
				}
				bShowCounts = oQuickVariantSelectionEffective.showCounts;
				mItemData = Object.create(null);

				createOrUpdateMultipleViewsObject({"items": {}});

				var fnSetInitialKey = function(sInitialKey){
					createOrUpdateMultipleViewsObject({ "selectedKey" : sInitialKey });
					// register on binding change after initial set of key
					var oBinding = oTemplatePrivateModel.bindProperty(getPropertyPath(PATH_TO_SELECTED_KEY));
					oBinding.attachChange(function(oChangeEvent) {
						var sNewKey = oChangeEvent.getSource().getValue();
						if (oImplementingHelper.onSelectedKeyChanged) {
							oImplementingHelper.onSelectedKeyChanged(sNewKey);
						}
						// The following logic checks whether we need to rebind or refresh (or both) the SmartControl which is switched to.
						// In single mode a rebind needs to be performed on every tab switch
						var iRequest = (sMode === "single") ? 3 : mItemData[sNewKey].dirtyState;
						if (iRequest < 2) {
							iRequest = iRequest + 2; // worklist is always refreshed
						}
						if (iRequest > 0){
							fnRefreshOperationOnCurrentSmartControl(iRequest);
						} else {
							// need to update the toolbar button visibility here as the delete button would not be updated otherwise
							// see BCP:1770601204
							oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oState.oMultipleViewsHandler[oCurrentSection.key].oSmartTable);
						}
						// Reset the dirty state: Note that the refresh still may fail due to technical problems.
						// However, in this case the uswer gets feedback and knows that he needs to retrigger anyway.
						mItemData[sNewKey] = mItemData[sNewKey] || {};
						mItemData[sNewKey].dirtyState = 0;
					});
				};
				if (oQuickVariantSelection) {
					oImplementingHelper = new MultiViewsSingleTableHelper(oQuickVariantSelection, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, oCurrentSection);
					sMode = "single";
					Log.info("This section supports multiple views with single table");
				}
				createOrUpdateMultipleViewsObject({ "mode" : sMode });
			})();

			/* eslint-disable */
			var fnRemoveTableSettingsFromFilters = testableHelper.testable(fnRemoveTableSettingsFromFilters, "fnRemoveTableSettingsFromFilters");
			var findEntityProperties = testableHelper.testable(findEntityProperties, "findEntityProperties");
			var getSelectionVariantFilters = testableHelper.testable(getSelectionVariantFilters, "getSelectionVariantFilters");
			/* eslint-enable */

			// Make implementing helper accessible for unit tests.
			testableHelper.testable(function(){
				return oImplementingHelper;
			}, "getImplementingHelper");

			// public instance methods
			return {
				onDataRequested: onDataRequested,
				formatItemTextForMultipleView: formatItemTextForMultipleView,
				getVariantSelectionKey: getVariantSelectionKey, // expose the selected key for extensionAPI
				init: fnInit,
				getMode: getMode,
				onRebindContentControl: onRebindContentControl,
				getShowCounts: getShowCounts
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.controller.MultipleViewsHandler", {
			constructor: function(oState, oController, oTemplateUtils, oCurrentSection) {
				Object.assign(this, getMethods(oState, oController, oTemplateUtils, oCurrentSection));
			}
		});
	});
