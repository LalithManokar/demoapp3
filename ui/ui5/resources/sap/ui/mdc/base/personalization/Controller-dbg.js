/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/core/Item', 'sap/ui/model/json/JSONModel'
], function (Item, JSONModel) {
	"use strict";

	/**
	 * Controller for personalization dialogs.
	 *
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.base.personalization.Controller
	 */
	var Controller = {
		showVisibilityDialog: function (oSource, oDataInitial, oDataRuntime, oControl, fnCreateChanges) {
			return new Promise(function (resolve) {
				var bIsModal = false; //this._isModalSwitchedOn();
				sap.ui.require(bIsModal ? [
					'sap/m/Dialog', 'sap/ui/mdc/base/personalization/VisibilityPanel', 'sap/ui/mdc/base/personalization/VisibilityPanelItem', 'sap/m/Button'
				] : [
						'sap/m/ResponsivePopover', 'sap/ui/mdc/base/personalization/VisibilityPanel', 'sap/ui/mdc/base/personalization/VisibilityPanelItem'
					], function (Container, Panel, DialogItem, Button) {
						oDataInitial.items.sort(function (a, b) {
							if (a.text < b.text) {
								return -1;
							} else if (a.text > b.text) {
								return 1;
							} else {
								return 0;
							}
						});
						var aItemsRuntimeNotExisting = oDataInitial.items.filter(function (oMItemInitial) {
							return !this._getArrayElementByKey(oMItemInitial.key, oDataRuntime.items);
						}.bind(this));
						Object.assign(oDataRuntime, {
							items: oDataRuntime.items.concat(aItemsRuntimeNotExisting)
						});
						Object.assign(oDataRuntime, {
							showResetEnabled: this._isDirtyChart(oDataInitial, oDataRuntime)
						});
						var oJSONModelRuntime = new JSONModel(oDataRuntime);

						// Collect all runtime changes
						var aRuntimeChanges = [];
						var fnHandleChange = function (oChangeData) {
							if (bIsModal) {
								aRuntimeChanges.push(oChangeData);
							} else {
								fnCreateChanges([
									oChangeData
								]);
							}
						};

						var mAttributes = {
							showReset: false,
							showResetEnabled: {
								path: '$sapuimdcVisibilityPanel>/showResetEnabled'
							},
							items: {
								path: '$sapuimdcVisibilityPanel>/items',
								templateShareable: false,
								template: new DialogItem({
									key: "{$sapuimdcVisibilityPanel>key}",
									text: "{$sapuimdcVisibilityPanel>text}",
									tooltip: "{$sapuimdcVisibilityPanel>tooltip}",
									visible: "{$sapuimdcVisibilityPanel>visible}"
								})
							},
							initialOrderChanged: function (oEvent) {
								var aRuntimeItems = oJSONModelRuntime.getProperty("/items");
								var aRuntimeItemsOrdered = [];
								oEvent.getParameter("keys").forEach(function (sKey) {
									aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
								}.bind(this));
								oJSONModelRuntime.setProperty("/items", aRuntimeItemsOrdered);
							}.bind(this),
							visibilityChanged: function (oEvent) {
								fnHandleChange({
									changeType: oEvent.getParameter("visible") ? "createItem" : "removeItem",
									control: oControl,
									key: oEvent.getParameter("key"),
									items: oJSONModelRuntime.getProperty("/items")
								});
							},
							positionChanged: function (oEvent) {
								// Update the JSON model as the moving of aggregation items is responsible the controller and not the VisibilityPanel
								var aRuntimeItems = oJSONModelRuntime.getProperty("/items");
								var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
								aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
								aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
								oJSONModelRuntime.setProperty("/items", aRuntimeItems);

								var iRelativePosition = this._getVisibleItems(aRuntimeItems).indexOf(oMItem);
								if (iRelativePosition > -1) {
									fnHandleChange({
										changeType: "moveItem",
										control: oControl,
										key: oEvent.getParameter("key"),
										relativePosition: iRelativePosition,
										items: oJSONModelRuntime.getProperty("/items")
									});
								}
							}.bind(this)
						};
						//Build the dialog
						var oPanel = new Panel(mAttributes);
						oPanel.setModel(oJSONModelRuntime, "$sapuimdcVisibilityPanel");
						var oDialog = this._createDialog(Container, oPanel, bIsModal, Button, aRuntimeChanges, fnCreateChanges, oJSONModelRuntime, oControl, "visibility.PERSONALIZATION_DIALOG_TITLE");
						oControl.addDependent(oDialog);
						if (bIsModal) {
							oDialog.open();
						} else {
							oDialog.openBy(oSource);
						}
					}.bind(this));
			}.bind(this));
		},
		showFilterDialog: function (oSource, oDataInitial, oDataRuntime, sModelName, oModel, oControl, fnCreateChanges) {
			return new Promise(function (resolve, reject) {
				var bIsModal = this._isModalSwitchedOn();
				sap.ui.require(bIsModal ? [
					'sap/m/Dialog', 'sap/ui/mdc/base/personalization/FilterPanel', 'sap/ui/mdc/base/personalization/FilterPanelItem', 'sap/m/Button'
				] : [
						'sap/m/ResponsivePopover', 'sap/ui/mdc/base/personalization/FilterPanel', 'sap/ui/mdc/base/personalization/FilterPanelItem'
					], function (Container, Panel, DialogItem, Button) {
						oDataInitial.items.sort(function (a, b) {
							if (a.text < b.text) {
								return -1;
							} else if (a.text > b.text) {
								return 1;
							} else {
								return 0;
							}
						});
						var aItemsRuntimeNotExisting = oDataInitial.items.filter(function (oMItemInitial) {
							return !this._getArrayElementByKey(oMItemInitial.key, oDataRuntime.items);
						}.bind(this));
						Object.assign(oDataRuntime, {
							items: oDataRuntime.items.concat(aItemsRuntimeNotExisting)
						});
						Object.assign(oDataRuntime, {
							showResetEnabled: this._isDirtyFilter(oDataInitial, oDataRuntime)
						});
						var oJSONModelRuntime = new JSONModel(oDataRuntime);

						// Collect all runtime changes
						var aRuntimeChanges = [];
						var fnHandleChange = function (oChangeData) {
							if (bIsModal) {
								aRuntimeChanges.push(oChangeData);
							} else {
								fnCreateChanges([
									oChangeData
								]);
							}
						};
						var fnOnChange = function (oEvent) {
							var oFilterField = oEvent.getSource();
							fnHandleChange(Controller.createChangeDataForSetFilterValue(oFilterField.getFieldPath(), oEvent.getParameter("conditions"), oControl));
						};
						var fnOnOpen = function () {
							var oDialog = this.oDialog;
							if (oDialog) {
								oDialog.setModal(true);
							}
						};
						var fnOnAfterClose = function () {
							var oDialog = this.oDialog;
							if (oDialog) {
								oDialog.setModal(false);
							}
						};
						var mAttributes = {
							showReset: false,
							showResetEnabled: {
								path: '$sapuimdcFilterPanel>/showResetEnabled'
							},
							items: {
								path: '$sapuimdcFilterPanel>/items',
								templateShareable: false,
								template: new DialogItem({
									key: "{$sapuimdcFilterPanel>key}",
									text: "{$sapuimdcFilterPanel>text}",
									tooltip: "{$sapuimdcFilterPanel>tooltip}",
									required: "{$sapuimdcFilterPanel>required}",
									controls: {
										path: '$sapuimdcFilterPanel>controls',
										templateShareable: false,
										factory: function (sId, oBindingContext) {
											var oFilterFieldClone = oBindingContext.getObject(oBindingContext.getPath()).clone();
											oFilterFieldClone.attachChange(fnOnChange, this);
											if (oFilterFieldClone.getFieldHelp()) {
												var oFieldValueHelp = sap.ui.getCore().byId(oFilterFieldClone.getFieldHelp());
												oFieldValueHelp.attachOpen(fnOnOpen, this);
												oFieldValueHelp.attachAfterClose(fnOnAfterClose, this);
											}
											return oFilterFieldClone;
										}.bind(this)
									}
								})
							},
							initialOrderChanged: function (oEvent) {
								var aRuntimeItems = oJSONModelRuntime.getProperty("/items");
								var aRuntimeItemsOrdered = [];
								oEvent.getParameter("keys").forEach(function (sKey) {
									aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
								}.bind(this));
								oJSONModelRuntime.setProperty("/items", aRuntimeItemsOrdered);
							}.bind(this),
							positionChanged: function (oEvent) {
								// Update the JSON model as the moving of aggregation items is responsible the controller and not the FilterPanel
								var aRuntimeItems = oJSONModelRuntime.getProperty("/items");
								var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
								aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
								aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
								oJSONModelRuntime.setProperty("/items", aRuntimeItems);

								// var iRelativePosition = this._getSelectedItems(aRuntimeItems).indexOf(oMItem);
								// if (iRelativePosition > -1) {
								//     this._createAndApplyMoveFilter(oCMRuntime, ChartFlexibility, ControlPersonalizationAPI, oAppComponent, oEvent.getParameter("key"), iRelativePosition, fnRefreshCallback);
								// }
							}.bind(this)
						};
						//Build the dialog
						var oPanel = new Panel(mAttributes);
						oPanel.setModel(oJSONModelRuntime, "$sapuimdcFilterPanel");
						//in case of FilterPanel: set ConditionModel
						oPanel.setModel(oModel, sModelName);
						var oDialog = this._createDialog(Container, oPanel, bIsModal, Button, aRuntimeChanges, fnCreateChanges, oJSONModelRuntime, oControl, "filter.PERSONALIZATION_DIALOG_TITLE");
						this.oDialog = oDialog;
						oControl.addDependent(oDialog);
						if (bIsModal) {
							oDialog.open();
						} else {
							oDialog.openBy(oSource);
						}
					}.bind(this));
			}.bind(this));
		},
		_createDialog: function (Container, oPanel, bIsModal, Button, aRuntimeChanges, fnCreateChanges, oJSONModelRuntime, oControl, sMessageIdForTitle) {
			var oContainer;
			var oDataBeforeOpen = jQuery.extend(true, {}, oJSONModelRuntime.getProperty("/"));
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!bIsModal) {
				//Livechanges: create a Popover and instantly apply every change
				oPanel.initialize();
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: false,
					contentWidth: "25rem",
					resizable: true,
					placement: "HorizontalPreferredRight",
					content: oPanel
				});
			} else {
				//Modal Dialog: create a Dialog and collect every change made during runtime in aRuntimeChanges
				oPanel.initialize();
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					contentWidth: "40rem",
					contentHeight: "55rem",
					draggable: true,
					resizable: true,
					stretch: "{device>/system/phone}",
					afterClose: "onAfterClose",
					content: oPanel,
					buttons: [
						new Button({
							text: oResourceBundle.getText("p13nDialog.OK"),
							type: "Emphasized",
							press: function () {
								//Apply the collected changes from aRuntimeChanges
								oContainer.close();
								oContainer.destroy();
								fnCreateChanges(aRuntimeChanges);
							}
						}),
						new Button({
							text: oResourceBundle.getText("p13nDialog.CANCEL"),
							press: function () {
								//Discard the collected changes from aRuntimeChanges
								oContainer.close();
								oContainer.destroy();
								oJSONModelRuntime.setProperty("/", jQuery.extend(true, {}, oDataBeforeOpen));
								aRuntimeChanges = [];
							}
						})
					]
				});
			}
			//Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");
			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl.getDomRef()).closest(".sapUiSizeCompact").length);
			return oContainer;
		},
		addChange: function (ChangeHandler, sChangeType, oChangeData, bIgnoreVariantManagement) {
			return new Promise(function (resolve) {
				sap.ui.getCore().loadLibrary('sap.ui.fl', {
					async: true
				}).then(function () {
					sap.ui.require([
						'sap/ui/fl/write/api/ControlPersonalizationWriteAPI'
					], function (ControlPersonalizationWriteAPI) {
						ControlPersonalizationWriteAPI.add({
							changes: [
								ChangeHandler[sChangeType].changeHandler.createChange(oChangeData)
							],
							ignoreVariantManagement: bIgnoreVariantManagement
						}).then(function (aFlexChanges) {
							resolve(aFlexChanges);
						});
					});
				});
			});
		},
		createChangeDataForSetChartType: function (sChartType, oChart) {
			return {
				control: oChart,
				chartType: sChartType
			};
		},
		createChangeDataForSetFilterValue: function (sKey, aConditions, oControl) {
			return {
				changeType: "setFilterValue",
				control: oControl,
				key: sKey,
				conditions: aConditions
			};
		},
		saveChanges: function (aFlexChanges, oControl) {
			return new Promise(function (resolve) {
				sap.ui.getCore().loadLibrary('sap.ui.fl', {
					async: true
				}).then(function () {
					sap.ui.require([
						'sap/ui/fl/write/api/ControlPersonalizationWriteAPI'
					], function (ControlPersonalizationWriteAPI) {
						ControlPersonalizationWriteAPI.save({
							selector: oControl,
							changes: aFlexChanges
						}).then(function (aFlexChanges) {
							resolve();
						});
					});
				});
			});
		},
		_createItem: function (ControlPersonalizationWriteAPI, Utils, sId, oChangeData, bIgnoreVariantManagement, fnCreateChange) {
			if (sap.ui.getCore().byId(sId)) {
				return Promise.resolve([]);
			}
			return ControlPersonalizationWriteAPI.add({
				changes: [
					fnCreateChange({
						control: oChangeData.control,
						id: sId,
						key: oChangeData.key
					})
				],
				ignoreVariantManagement: bIgnoreVariantManagement
			});
		},
		_getItemId: function (Utils, oChangeData) {
			var oView = Utils.getViewForControl(oChangeData.control);
			return this._getArrayElementByKey(oChangeData.key, oChangeData.items).id || oView.createId(oChangeData.control.getId() + oChangeData.key);
		},
		_isModalSwitchedOn: function () {
			return jQuery.sap.getUriParameters().get("P13nModal") === "true";
		},
		_getArrayElementByKey: function (sKey, aArray) {
			var aElements = aArray.filter(function (oElement) {
				return oElement.key !== undefined && oElement.key === sKey;
			});
			return aElements.length ? aElements[0] : null;
		},
		_getSelectedItems: function (aMItems) {
			return aMItems.filter(function (oMItem) {
				return oMItem.selected;
			});
		},
		_getVisibleItems: function (aMItems) {
			return aMItems.filter(function (oMItem) {
				return oMItem.visible;
			});
		},
		_isDirtyFilter: function (oDataInitial, oDataRuntime) {
			return false;
		}
	};

	return Controller;
}, /* bExport= */true);
