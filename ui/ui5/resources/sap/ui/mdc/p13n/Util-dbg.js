/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/model/json/JSONModel', "sap/base/util/array/diff", "sap/m/Button", 'sap/base/util/merge'
], function (JSONModel, diff, Button, merge) {
	"use strict";
	// Check if we are in a modal scenario, maybe also think about putting this in a property
	var bIsModal = jQuery.sap.getUriParameters().get("P13nModal") === "true";
	var Util = {
		showP13nChart: function (oControl, oSource, oP13nData, fnAfterCreateChanges) {

			this.sP13nType = "Chart";
			var sPanelPath = "sap/ui/mdc/p13n/ChartItemPanel";
			return this._showDialog(oControl, oSource, oP13nData, fnAfterCreateChanges, sPanelPath);

		},
		showP13nColumns: function (oControl, oSource, oP13nData, fnAfterCreateChanges) {

			this.sP13nType = "Columns";
			var sPanelPath = "sap/ui/mdc/p13n/SelectionPanel";
			return this._showDialog(oControl, oSource, oP13nData, fnAfterCreateChanges, sPanelPath);

		},
		showP13nSort: function (oControl, oSource, oP13nData, fnAfterCreateChanges) {

			this.sP13nType = "Sort";
			var sPanelPath = "sap/ui/mdc/p13n/SortPanel";
			return this._showDialog(oControl, oSource, oP13nData, fnAfterCreateChanges, sPanelPath);

		},
		_showDialog: function (oControl, oSource, oP13nData, fnAfterCreateChanges, sPanelPath) {
			return new Promise(function (resolve, reject) {

				// Load either sap.m.Dialog or sap.m.ResponsivePopover, depending on the setting
				sap.ui.require(bIsModal ? [
					'sap/m/Dialog', sPanelPath
				] : [
						'sap/m/ResponsivePopover', sPanelPath
					], function (Container, Panel) {

						this.sortP13nData(oP13nData);

						//set the model for runtime and save the initial state for the later diff (sap.base.util.merge creates a deep copy)
						this.oJSONModel = new JSONModel(oP13nData);
						this.oState = merge({}, oP13nData);
						this.oControl = oControl;

						// get the matching title for the according personalization scenario
						var sTitle = this._getPanelTitle(this.sP13nType);

						this.fnHandleChange = function (aChanges) {
							Util.handleUserChanges(aChanges, oControl).then(function () {
								if (fnAfterCreateChanges) {
									fnAfterCreateChanges();
								}
								if (this.oJSONModel) {
									//overwrite the initial state with the current model to ensure the correct diff
									this.oState = merge({}, this.oJSONModel.getData());
								}
							}.bind(this));
						}.bind(this);

						var oPanel = new Panel({
							change: bIsModal ? function () { } : this._registerChangeEvent.bind(this)
						});
						oPanel.setModel(this.oJSONModel);

						// Build the dialog
						var oDialog = this._createDialog(Container, oPanel, bIsModal, this.oJSONModel, oControl, sTitle, this.fnHandleChange);
						oControl.addDependent(oDialog);
						if (bIsModal) {
							oDialog.open();
						} else {
							oDialog.openBy(oSource);
						}
						resolve();
					}.bind(this));
			}.bind(this));
		},
		_registerChangeEvent: function () {
			var aChanges = [], fnSymbol, aChangeOperations = [], aInitialState = [], aCurrentState = [];

			switch (this.sP13nType) {
				case "Sort":
					fnSymbol = function (o) { return o.name + o.sortOrder; };
					aChangeOperations = ["removeSort", "addSort"];
					break;
				case "Columns":
					fnSymbol = function (o) { return o.name; };
					aChangeOperations = ["removeColumn", "addColumn"];
					break;
				case "Chart":
					fnSymbol = function (o) { return o.name + o.role; };
					aChangeOperations = ["removeItem", "addItem"];
					break;
			}

			var fFilter = function(oItem) {
				return oItem.selected;
			};
			aInitialState = this.oState.items.filter(fFilter);
			aCurrentState = this.oJSONModel.getData().items.filter(fFilter);

			aChanges = this._processResult(aInitialState, aCurrentState, fnSymbol, this.oControl, aChangeOperations[0], aChangeOperations[1]);

			this.oState = merge({}, this.oJSONModel.getData());

			this.fnHandleChange(aChanges);
		},
		_createDialog: function (Container, oPanel, bIsModal, oJSONModel, oControl, sMessageIdForTitle, fnCreateChanges) {
			var oContainer;
			var oDataBeforeOpen = merge({}, oJSONModel.getProperty("/"));
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!bIsModal) {
				// Livechanges: create a Popover and instantly apply every change
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: true,
					contentWidth: "25rem",
					resizable: true,
					placement: "HorizontalPreferredRight",
					content: oPanel,
					afterClose: function () {
						// resolve the Promise with an empty array, to be able to reload the settings
						oContainer.destroy();
						fnCreateChanges([]);
					}
				});
			} else {
				// Modal Dialog: create a Dialog and collect every change made during runtime in aRuntimeChanges
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: true,
					contentWidth: "40rem",
					contentHeight: "55rem",
					draggable: true,
					resizable: true,
					stretch: "{device>/system/phone}",
					content: oPanel,
					buttons: [
						new Button({
							text: oResourceBundle.getText("p13nDialog.OK"),
							type: "Emphasized",
							press: function () {
								// Apply a diff to create changes for flex
								this._registerChangeEvent();
								oContainer.close();
								oContainer.destroy();
							}.bind(this)
						}), new Button({
							text: oResourceBundle.getText("p13nDialog.CANCEL"),
							press: function () {
								// Discard the collected changes
								oContainer.close();
								oContainer.destroy();
								oJSONModel.setProperty("/", merge({}, oDataBeforeOpen));
								// resolve the Promise with an empty array, to be able to reload the settings
								fnCreateChanges([]);
							}
						})
					]
				});
			}
			// Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");
			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl.getDomRef()).closest(".sapUiSizeCompact").length);
			return oContainer;
		},
		_processResult: function (aExistingArray, aChangedArray, fnSymBol, oControl, sRemoveOperation, sInsertOperation) {
			var aResults = diff(aExistingArray, aChangedArray, fnSymBol);

			var fMatch = function (oField, aArray) {
				return aArray.filter(function (oExistingField) {
					return oExistingField && (oExistingField.name === oField.name);
				})[0];
			};

			var aChanges = [];
			var aProcessedArray = aExistingArray.slice(0);
			aResults.forEach(function (oResult) {
				// Begin --> hack for handling result returned by diff
				if (oResult.type === "delete" && aProcessedArray[oResult.index] === undefined) {
					aProcessedArray.splice(oResult.index, 1);
					return;
				}

				var oExistingProp;
				if (oResult.type === "insert") {
					oExistingProp = fMatch(aChangedArray[oResult.index], aProcessedArray);
					if (oExistingProp) {
						oExistingProp.index = aProcessedArray.indexOf(oExistingProp);
						aProcessedArray.splice(oExistingProp.index, 1, undefined);
						aChanges.push({
							selectorElement: oControl,
							changeSpecificData: {
								changeType: sRemoveOperation,
								content: oExistingProp
							}
						});
					}
				}
				// End hack
				var oProp = oResult.type === "delete" ? aProcessedArray[oResult.index] : aChangedArray[oResult.index];
				oProp.index = oResult.index;
				if (oResult.type === "delete") {
					aProcessedArray.splice(oProp.index, 1);
				} else {
					aProcessedArray.splice(oProp.index, 0, oProp);
				}
				aChanges.push({
					selectorElement: oControl,
					changeSpecificData: {
						changeType: oResult.type === "delete" ? sRemoveOperation : sInsertOperation,
						content: oProp
					}
				});
			});
			return aChanges;
		},
		sortP13nData: function (oData) {

			var sLocale = sap.ui.getCore().getConfiguration().getLocale().toString();

			var oCollator = window.Intl.Collator(sLocale, {});

			//group selected / unselected --> sort alphabetically in each group
			oData.items.sort(function (mField1, mField2) {
				if (mField1.selected && mField2.selected) {
					return (mField1.position || 0) - (mField2.position || 0);
				} else if (mField1.selected) {
					return -1;
				} else if (mField2.selected) {
					return 1;
				} else if (!mField1.selected && !mField2.selected) {
					return oCollator.compare(mField1.label, mField2.label);
				}
			});

		},
		_getPanelTitle: function (sP13nType) {
			var sTitle;
			switch (sP13nType) {
				case "Sort":
					sTitle = "sort.PERSONALIZATION_DIALOG_TITLE";
					break;
				case "Columns":
					sTitle = "fieldsui.COLUMNS";
					break;
				case "Chart":
					sTitle = "chart.PERSONALIZATION_DIALOG_TITLE";
					break;
			}
			return sTitle;
		},
		handleUserChanges: function (aChanges, oControl) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.add({
						changes: aChanges
					}).then(function (aDirtyChanges) {
						resolve(aDirtyChanges);
					});
				});
			});
		}
	};
	return Util;
});
