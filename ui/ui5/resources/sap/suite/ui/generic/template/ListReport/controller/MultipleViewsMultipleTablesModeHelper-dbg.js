sap.ui.define(["sap/ui/base/Object", "sap/ui/Device"],
	function(BaseObject, Device) {
		"use strict";

		/*
		 * This class is a helper class for the generic class MultipleViewsHandler. More, precisely an instance of
		 * this class is created in the constructor of that class in case, that the multiple table mode of the multiple views feature
		 * has been switched on.
		 * The mode can be switched on and configured via the quickVariantSelectionX.variants section in the manifest.
		 * You can have either a SmartTable or a SmartChart per a tab.
		 * We check under the corresponding SelectionPresentationVariant/PresentationVariant/Vizualizations or PresentationVariant/Vizualizations the first entry in the collection.
		 *  If it is a UI.LineItem then a corresponding SmartTable will be generated. If it is a UI.Chart then a SmartChart is displayed.
		 */

		var PATH_TO_PROPERTIES = "/listReport/multipleViews"; // root path for all properties used for this feature
		var PATH_TO_SELECTED_KEY = PATH_TO_PROPERTIES + "/selectedKey"; // path to the key of the currently active view
		var PATH_TO_MESSAGE_VISIBILITY = PATH_TO_PROPERTIES + "/msgVisibility"; // path to visible property of the message strip
		var PATH_TO_FINAL_MESSAGE = PATH_TO_PROPERTIES + "/finalMessage"; // path to the final message to be displayed if filters are not applied

		// oState is used as a channel to transfer data to the controller and back.
		// oController is the controller of the enclosing ListReport
		// oTemplateUtils are the template utils as passed to the controller implementation
		// fnSetInitialKey a function to set the initially set key
		function getMethods(oQuickVariantSelectionX, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, setModelDataForItem) {

			var bDifferentEntitySets; // each tab can have its own entitySet in this case; entitySets are set in manifest per tab
			var sSelectedTabText, aUnAppliedFilter = []; // variables used for displaying filter message across all tabs
			var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel(); // the template private model used to transfer data between javascript and UI

			function onDetailsActionPress(oEvent) {
				var oBindingContext = oEvent.getParameter("itemContexts") && oEvent.getParameter("itemContexts")[0];
				oTemplateUtils.oCommonEventHandlers.onListNavigate(oEvent, oState, undefined, oBindingContext);
			}

			function onChartSelectData(oEvent) {
				var oChart, oSmartChart;
				oChart = oEvent.getSource();
				oSmartChart = oChart.getParent();
				oState.updateControlOnSelectionChange(oSmartChart);
			}

			function fnRegisterToChartEvents(oEvent) {
				var oSmartChart;
				oSmartChart = oEvent.getSource();
				oSmartChart.getChartAsync().then(function(oChart){
					//attach to the selectData event of the sap.chart.Chart
					oChart.attachSelectData(onChartSelectData);
					oChart.attachDeselectData(onChartSelectData);
				});
			}

			// Functions for storing and restoring the state of the controls
			function getContentForIappState(sSelectedKey) {
				var sKey, oTmpTable, oVariantsIds = {};
				for (sKey in mItemData) {
					oTmpTable = mItemData[sKey].implementingControl;
					oVariantsIds[oTmpTable.getId()] = oTmpTable.getCurrentVariantId() || "";
				}
				return {
					selectedTab: sSelectedKey,
					tableVariantIds: oVariantsIds
				};
			}

			function getSelectedKeyAndRestoreFromIappState(oGenericData){
				var j, oTmpTable, sVariantId;
				if (oGenericData) {
					if (oGenericData.tableVariantIds) {
						for (j in mItemData) {
							oTmpTable = mItemData[j].implementingControl;
							sVariantId = oGenericData.tableVariantIds[oTmpTable.getId()];
							if (sVariantId) {
								oTmpTable.setCurrentVariantId(sVariantId);
							}
						}
					}
					return oGenericData.selectedTab;
				}
			}
			// Setting control variant passed from another app
			function fnSetControlVariant(sChartVariantId, sTableVariantId, sPageVariantId){
				for (var key in mItemData) {
					var control = mItemData[key].implementingControl;
					if ((sTableVariantId || sPageVariantId) && control.getTable){
						control.setCurrentVariantId(sTableVariantId || sPageVariantId);
					} else if ((sChartVariantId || sPageVariantId) && control.getChart){
						control.setCurrentVariantId(sChartVariantId || sPageVariantId);
					}

				}
			}

			function getIsDifferentEntitySets() {
				return bDifferentEntitySets;
			}

			/*
			 * gets properties for the entityType of a oSmartControl
			 * oSmartControl can be either a SmartTable or a SmartChart
			 */
			function getEntityTypeProperties(oSmartControl) {
				var oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oSmartControl);
				return oEntityType.property;
			}

			function onSelectedKeyChanged(sNewKey){
				oState.oSmartTable = mItemData[sNewKey].implementingControl;
			}

			/*
			 * function which sets custom data related to active button for selected smart control
			 * oSmartControl can be either a SmartTable or a SmartChart
			 */
			function fnSetActiveButtonState() {
				var oSmartControl = oState.oSmartTable;
				var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
				var oCustomData = fnGetActiveButtonStateCustomData();
				var bActiveButtonState = JSON.parse(oCustomData.getValue());
				if (oCustomData) {
					oSmartControl.removeCustomData(oCustomData);
				}
				oSmartControl.addCustomData(new sap.ui.core.CustomData({
					"key": "activeButtonTableState",
					"value": !bActiveButtonState
				}));
				oTemplatePrivateModel.setProperty("/listReport/activeObjectEnabled", !bActiveButtonState);
			}

			/*
			 * function which returns custom data related to active button for selected smart control
			 * oSmartControl can be either a SmartTable or a SmartChart
			 */
			function fnGetActiveButtonStateCustomData() {
				var oSmartControl = oState.oSmartTable;
				var oControlCustomData;
				var aControlCustomData = oSmartControl.getCustomData();
				for (var index = 0; index < aControlCustomData.length; index++) {
					if (aControlCustomData[index].getKey() && aControlCustomData[index].getKey() === "activeButtonTableState") {
						oControlCustomData = aControlCustomData[index];
						break;
					}
				}
				return oControlCustomData;
			}

			/*
			 * function to update the state of the "Show Active Only" button in smart control custom data
			 * upon external navigation or refresh of the app
			 * oSmartControl can be either a SmartTable or a SmartChart
			 */
			function fnRestoreActiveButtonState() {
				var oSmartControl = oState.oSmartTable;
				var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
				var bActiveButtonState = oTemplatePrivateModel.getProperty("/listReport/activeObjectEnabled");
				var oCustomData = fnGetActiveButtonStateCustomData();
				if (oCustomData) {
					oSmartControl.removeCustomData(oCustomData);
				}
				oSmartControl.addCustomData(new sap.ui.core.CustomData({
					"key": "activeButtonTableState",
					"value": bActiveButtonState
				}));
			}

			/*Functions related to displaying filter message for different entity sets*/

			/**
			 * This method determines the labels of the filters not applicable, determines the seleted tab name,
			 * sets the custom data of the selected control
			 * @param  {string} sFilterPropertyName - property name returned by smart filter bar
			 * @param  {object} oSmartControl - selected table or chart
			 */
			function fnFormatNotAppliedFilters(aUnAppliedFilterTemp, oSmartControl) {
				var oProperty, sPropertyLabel, aUnAppliedFilterLabelTemp = [];
				var oSelectedControl = mItemData[oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY)];
				// compare the entity sets of the selected control and smart control. Also compare the type of the controls since a table and chart can exist with same entity set.
				if (oSelectedControl && oSelectedControl.entitySet === oSmartControl.getEntitySet() && (oSelectedControl.implementingControl.getMetadata().getElementName() === oSmartControl.getMetadata().getElementName())) {
					for (var index in aUnAppliedFilterTemp) {
						oProperty = fnGetFilterProperty(aUnAppliedFilterTemp[index], oSmartControl);
						sPropertyLabel = oProperty["sap:label"] ? oProperty["sap:label"] : oProperty.name;
						if (aUnAppliedFilterLabelTemp.indexOf(sPropertyLabel) === -1) {
							aUnAppliedFilterLabelTemp.push(sPropertyLabel);
						}
					}
					sSelectedTabText = getIconTabFilterText(oSmartControl);
					formatTextForMultiViewFilter(aUnAppliedFilterLabelTemp,sSelectedTabText);
				}
				fnSetNotAppliedFilter(aUnAppliedFilterLabelTemp);
			}

			/**
			 * This method sets custom data for the selected smart control
			 * @param  {object} oControlFilterMessageInfo - custom data object
			 * @param  {object} oSmartControl - selected table or chart
			 */
			function fnSetCustomDataForTableMessage(oSmartControl, oControlFilterMessageInfo) {
				var oControlCustomData;
				oControlCustomData = fnGetCustomDataForControl(oSmartControl);
				if (oControlCustomData) {
					oSmartControl.removeCustomData(oControlCustomData);
				}
				oSmartControl.addCustomData(new sap.ui.core.CustomData({
					"key": "multiTabMessageInfo",
					"value": oControlFilterMessageInfo
				}));
			}

			/**
			 * Since the unapplied filter is not part of the entity set of the selected tab,
			 * we should get all the properties of all entity sets in order to find the label of the unapplied filter
			 * @param  {object} oSmartControl - selected table or chart
			 * @return {array} aProperty - all properties of other entity sets
			 */
			function findOtherEntityProperties(oControl) {
				var sKey, aProperties = [];
				for (sKey in mItemData) {
					if (mItemData[sKey].implementingControl !== oControl) {
						aProperties.push(mItemData[sKey].properties);
					}
				}
				return aProperties;
			}

			/**
			 * This method returns the selected tab text to be displayed in the filter message
			 * @param  {object} oSmartControl - selected table or chart
			 * @return {string} aProperty - selected tab label
			 */
			function getIconTabFilterText(oSmartControl) {
				var oSelectedTab;
				var sSelectedTab = oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY);
				var oConfig = oController.getOwnerComponent().getAppComponent().getConfig();
				var oSettings = oConfig && oConfig.pages[0] && oConfig.pages[0].component && oConfig.pages[0].component.settings;
				for (var index in oSettings.quickVariantSelectionX.variants) {
					if (oSettings.quickVariantSelectionX.variants[index].key === sSelectedTab) {
						oSelectedTab = oSettings.quickVariantSelectionX.variants[index];
						break;
					}
				}
				var oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oSmartControl);
				var oSelectionVariant = oSelectedTab ? oEntityType[oSelectedTab.annotationPath] : null;
				if (oSelectionVariant && oSelectionVariant.Text) {
					if (oSelectionVariant.Text.String.indexOf("i18n") !== -1) {
						var sLabelTemp = oSelectionVariant.Text.String;
						// remove {} and ">" from the string and return i18n property
						sLabelTemp = sLabelTemp.substring(1, sLabelTemp.length - 1).split(">").pop();
						return oTemplateUtils.oCommonUtils.getText(sLabelTemp);
					} else {
						return (oSelectionVariant.Text.String);
					}
				}
			}

			/**
			 * This method sets the message visibility model of the message strip
			 * @param  {array} aNotApplicableFilter - array of labels not applied to filter
			 */
			function fnSetMessageVisibility(aNotApplicableFilter) {
				if (aNotApplicableFilter && aNotApplicableFilter.length > 0) {
					oTemplatePrivateModel.setProperty(PATH_TO_MESSAGE_VISIBILITY, true);
				} else {
					oTemplatePrivateModel.setProperty(PATH_TO_MESSAGE_VISIBILITY, false);
				}
			}

			/**
			 * This is an event handler for the close button on the message strip
			 */
			function onMessageCloseActionPress() {
				var oSmartControl = oState.oSmartTable;
				var oControlCustomData = fnGetCustomDataForControl(oSmartControl);
				if (oControlCustomData) {
					// set isClosed property in table data
					var oNewControlFilterMessageInfo = {
					"filters": oControlCustomData.getValue().filters,
					"selectedKey": oControlCustomData.getValue().selectedKey,
					"isClosed": true
				};
				fnSetCustomDataForTableMessage(oSmartControl, oNewControlFilterMessageInfo);
				fnSetMessageVisibility();
				}
			}

			/**
			 * This method checks if close of the message strip is pressed. If not pressed, it displays the message.
			 * If pressed, then it checks if there is any change in filter and then displays the message.
			 * @param  {array} aUnAppliedFilter - array of labels not applied to filter
			 */
			function fnCheckForMessageDisplay(aUnAppliedFilter) {
				var bSameFilters = false;
				var oSmartControl = oState.oSmartTable;
				var oControlCustomData = fnGetCustomDataForControl(oSmartControl);
				// check if close button of message strip is clicked
				if (oControlCustomData && oControlCustomData.getValue().isClosed) {
					// check if the filters have changed when the message was closed
					// if they have changed, then show the new message. Else, do not show the previous message.
					if (oControlCustomData.getValue().filters.length === aUnAppliedFilter.length) {
						// even though the array length can be same, but the content may differ.
						if (JSON.stringify(oControlCustomData.getValue().filters) === JSON.stringify(aUnAppliedFilter)) {
							bSameFilters = true;
						}
					}
				}
				oControlCustomData = {
					"filters": aUnAppliedFilter,
					"selectedKey": sSelectedTabText
				};
				if (bSameFilters) {
					// if same filters are not applied, do not show message if close was pressed.
					fnSetMessageVisibility();
					oControlCustomData.isClosed = true;
				} else {
					// in all other cases, display the fiter message
					fnSetMessageVisibility(aUnAppliedFilter);
					oControlCustomData.isClosed = false;
				}
				fnSetCustomDataForTableMessage(oSmartControl, oControlCustomData);
			}

			/**
			 * This method returns filter property from which label cab be identified which is not applied to that entity set to be displayed on message strip.
			 * @param  {string} sPropertyName -  filter name for which label should be identified
			 * @param  {object} oSmartControl - selected table or chart
			 * @return {string} oUnappliedProperty - Property that is not applied in filter
			 */
			function fnGetFilterProperty(sPropertyName, oSmartControl) {
				var oUnappliedProperty;
				var aEntityProperties = findOtherEntityProperties(oSmartControl);
				for (var sKey in aEntityProperties) {
					var oUnappliedProperty = fnGetFilterPropertyLabel(aEntityProperties[sKey], sPropertyName);
					if (oUnappliedProperty) {
						break;
					}
				}
				return oUnappliedProperty;
			}

			function fnGetFilterPropertyLabel(aEntityProperties, sPropertyName) {
				return aEntityProperties.filter(function(oProperty) {
					return oProperty.name === sPropertyName;
				})[0];
			}

			/**
			 * This method constructs the final string to be displayed on message strip for the unapplied filters based on the device
			 * @param  {array} aUnAppliedFilterLabel -  array of unapplied labels
			 * @param  {string} sSelectedTabText - label of the selected tab
			 */
			function formatTextForMultiViewFilter(aUnAppliedFilterLabel, sSelectedTabText) {
				var sFinalMessage = "";
				if (aUnAppliedFilterLabel && aUnAppliedFilterLabel.length > 0) {
					if ((Device.system.tablet || Device.system.phone) && !Device.system.desktop) {
						if (aUnAppliedFilterLabel.length > 1) {
							sFinalMessage = oTemplateUtils.oCommonUtils.getText("MESSAGE_MULTIPLE_VALUES_S_FORM", [aUnAppliedFilterLabel.join(", "), sSelectedTabText]);
						} else {
							sFinalMessage = oTemplateUtils.oCommonUtils.getText("MESSAGE_SINGLE_VALUE_S_FORM", [aUnAppliedFilterLabel[0], sSelectedTabText]);
						}
					} else {
						if (aUnAppliedFilterLabel.length > 1) {
							sFinalMessage = oTemplateUtils.oCommonUtils.getText("MESSAGE_MULTIPLE_VALUES_L_FORM", [aUnAppliedFilterLabel.join(", "), sSelectedTabText]);
						} else {
							sFinalMessage = oTemplateUtils.oCommonUtils.getText("MESSAGE_SINGLE_VALUE_L_FORM", [aUnAppliedFilterLabel[0], sSelectedTabText]);
						}
					}
				}
				oTemplatePrivateModel.setProperty(PATH_TO_FINAL_MESSAGE,sFinalMessage);
			}

			/**
			 * When tab is selected not for the first time, then table will not rebind. In this case, however, correct message
			 * in the message strip should be displayed when there are unapplied filters.
			 * @param  {object} oSmartControl - selected table or chart
			 */
			function fnUpdateMessageForFilter(oSmartControl) {
				var oControlCustomData;
				oControlCustomData = fnGetCustomDataForControl(oSmartControl);
				if (oControlCustomData) {
					var oControlData = oControlCustomData.getValue();
					formatTextForMultiViewFilter(oControlData.filters, oControlData.selectedKey);
					fnSetMessageVisibility(oControlData.filters);
				} else {
					fnSetMessageVisibility(aUnAppliedFilter);
				}
			}

			/**
			 * This method returns custom data related to filter message for the smart control
			 * @param  {object} oSmartControl - selected table or chart
			 * @return {object} oControlCustomData - custom data object related to filter message
			 */
			function fnGetCustomDataForControl(oSmartControl) {
				var oControlCustomData;
				var oSelectedControl = mItemData[oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY)];
				if (oSelectedControl.entitySet === oSmartControl.getEntitySet() && (oSelectedControl.implementingControl.getMetadata().getElementName() === oSmartControl.getMetadata().getElementName())) {
					var aControlCustomData = oSmartControl.getCustomData();
					for (var index = 0; index < aControlCustomData.length; index++) {
						if (aControlCustomData[index].getKey() && aControlCustomData[index].getKey() === "multiTabMessageInfo") {
							oControlCustomData = aControlCustomData[index];
							break;
						}
					}
				}
				return oControlCustomData;
			}

			// setter for aUnAppliedFilter
			function fnSetNotAppliedFilter(aUnAppliedFilterTemp) {
				aUnAppliedFilter = aUnAppliedFilterTemp;
			}

			// getter for aUnAppliedFilter
			function fnGetNotAppliedFilter() {
				return aUnAppliedFilter;
			}

			/*End of functions related to displaying filter message for different entity sets*/

			// End private instance methods

			(function() { // constructor coding encapsulated in order to reduce scope of helper variables
				var oIconTabBar = oController.byId("template::IconTabBar");
				if (!oIconTabBar) {
					return;
				}
				var sMainEntitySet = oController.getOwnerComponent().getEntitySet();
				var aTabs = oIconTabBar.getItems();

				bDifferentEntitySets = false;
				for (var i = 0; i < aTabs.length; i++) {
					var sKey = aTabs[i].getKey();
					if (i === 0){ // initialize with the first item being selected
						fnSetInitialKey(sKey);
					}
					var oTmpTable = oController.byId("listReport-" + sKey);
					if (!oState.oSmartTable) {
						oState.oSmartTable = oTmpTable;
					}
					mItemData[sKey] = {
						id: oTmpTable.getId(),
						entitySet: oTmpTable.getEntitySet(),
						properties: getEntityTypeProperties(oTmpTable)
					};
					bDifferentEntitySets = bDifferentEntitySets || mItemData[sKey].entitySet !== sMainEntitySet;
					setModelDataForItem(sKey, oTmpTable, oTmpTable.getEntitySet());
				}

				// Attach to “Search” event on SmartFilterBar ( Press on 'Go' button)
				oState.oSmartFilterbar.attachSearch(function(oEvent) {
					oState.oMultipleViewsHandler.refreshOperation(3);
				});
			})();

			// public instance methods
			return {
				fnRegisterToChartEvents: fnRegisterToChartEvents,
				onDetailsActionPress: onDetailsActionPress,
				getContentForIappState: getContentForIappState,
				getSelectedKeyAndRestoreFromIappState: getSelectedKeyAndRestoreFromIappState,
				onSelectedKeyChanged: onSelectedKeyChanged,
				getIsDifferentEntitySets: getIsDifferentEntitySets,
				setActiveButtonState: fnSetActiveButtonState,
				restoreActiveButtonState: fnRestoreActiveButtonState,
				getActiveButtonStateCustomData: fnGetActiveButtonStateCustomData,
				formatNotAppliedFilters: fnFormatNotAppliedFilters,
				onMessageCloseActionPress: onMessageCloseActionPress,
				fnCheckForMessageDisplay: fnCheckForMessageDisplay,
				fnSetMessageVisibility: fnSetMessageVisibility,
				fnSetNotAppliedFilter: fnSetNotAppliedFilter,
				fnGetNotAppliedFilter: fnGetNotAppliedFilter,
				fnUpdateMessageForFilter: fnUpdateMessageForFilter,
				setControlVariant: fnSetControlVariant
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ListReport.controller.MultipleViewsMultipleTablesModeHelper", {
			constructor: function(oQuickVariantSelectionX, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, setModelDataForItem) {
				Object.assign(this, getMethods(oQuickVariantSelectionX, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, setModelDataForItem));
			}
		});
	});
