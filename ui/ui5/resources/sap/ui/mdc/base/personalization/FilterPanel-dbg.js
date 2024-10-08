/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/ui/core/ResizeHandler'
], function (XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, ResizeHandler) {
	"use strict";

	/**
	 * Constructor for a new FilterPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FilterPanel</code> control is used to define filter-specific personalization settings.
	 * @extends sap.ui.mdc.XMLComposite
	 * @author SAP SE
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.FilterPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterPanel = XMLComposite.extend("sap.ui.mdc.base.personalization.FilterPanel", /** @lends sap.ui.mdc.base.personalization.FilterPanel.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * Determines whether the Reset button is shown inside the dialog. If a user clicks the Reset button, the <code>FilterPanel</code> control
					 * fires the <code>reset</code> event.
					 */
					showReset: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					},

					/**
					 * Determines whether the Reset button is enabled. This property is only taken into account if <code>showReset</code> is set
					 * to <code>true</code>.
					 */
					showResetEnabled: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					}
				},
				associations: {
					/**
					 * The <code>FilterPanel</code> control opens in a relative position to the <code>source</code>.
					 */
					source: {
						type: "sap.ui.core.Control"
					}
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * Defines personalization items.
					 */
					items: {
						type: "sap.ui.mdc.base.personalization.FilterPanelItem",
						multiple: true,
						singularName: "item"
					}
				},
				events: {
					/**
					 *  This event is fired when the initial items are ordered based on the sort algorithm of the <code>FilterPanel</code> control.
					 */
					initialOrderChanged: {
						keys: {
							type: "string[]"
						}
					},
					/**
					 * This event is fired if an item in the <code>FilterPanel</code> control is moved.
					 */
					positionChanged: {
						key: {
							type: "string"
						},
						relativePosition: {
							type: "integer"
						}
					},
					/**
					 * This event is fired if the Reset button in the <code>FilterPanel</code> control is clicked. The consumer of the control
					 * has to make sure that the model data is reset.
					 */
					reset: {}
				}
			}
		});

	FilterPanel.prototype.init = function () {

		// Set device model
		var oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		// Due to the re-binding during execution of _defineTableFiltersByText() the sap.m.Table re-create all items.
		// So we have to store the 'key' in order to mark the item after re-binding.
		this._sKeyOfMarkedItem = null;
		this.aFilters = [];

		// --> live changes
		// TODO: focus lost workaround
		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			properties: [
				"showResetEnabled"
			]
		});
		// TODO: end of focus lost workaround

		//Calculate the height for the scrollcontainer for the sap.m.Table, since the height is not correctly provided on setting 'height=100%'
		var oScrollContainer = this.byId("idScrollContainer");
		this._fnHandleResize = function () {
			var bChangeResult = false;
			if (!this.getParent) {
				return bChangeResult;
			}
			var oParent = this.getParent();
			if (!oParent || !oParent.$) {
				return bChangeResult;
			}
			var oToolbar = this._getCompositeAggregation().getContent()[0];
			var $dialogCont = oParent.$("cont");
			var iContentHeight, iHeaderHeight;
			if ($dialogCont.children().length > 0 && oToolbar.$().length > 0) {
				var iScrollContainerHeightOld = oScrollContainer.$()[0].clientHeight;

				iContentHeight = $dialogCont.children()[0].clientHeight;
				iHeaderHeight = oToolbar ? oToolbar.$()[0].clientHeight : 0;

				var iScrollContainerHeightNew = iContentHeight - iHeaderHeight;

				if (iScrollContainerHeightOld !== iScrollContainerHeightNew) {
					oScrollContainer.setHeight(iScrollContainerHeightNew + 'px');
					bChangeResult = true;
				}
			}
			return bChangeResult;
		}.bind(this);
		this._sContainerResizeListener = ResizeHandler.register(oScrollContainer, this._fnHandleResize);
	};
	FilterPanel.prototype.initialize = function () {
		// Remove 'old' marked item
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this.fireInitialOrderChanged({
			keys: this._getInitialItemOrder()
		});

		this._updateTableItems();

		// Set marked item initially to the first visible table item
		var oTableItem = this._getVisibleTableItems()[0];
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	FilterPanel.prototype.onSearchFieldLiveChange = function (oEvent) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		var oSearchField = oEvent.getSource();
		this._defineTableFiltersByText(oSearchField ? oSearchField.getValue() : "");

		this._filterTable(this.aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	FilterPanel.prototype.onPressButtonMoveToTop = function () {
		this._moveTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	FilterPanel.prototype.onPressButtonMoveUp = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	FilterPanel.prototype.onPressButtonMoveDown = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	FilterPanel.prototype.onPressButtonMoveToBottom = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	FilterPanel.prototype.onPressReset = function () {
		this.fireReset();
	};
	FilterPanel.prototype._moveTableItem = function (oTableItemFrom, oTableItemTo) {
		// Remove style of current table item (otherwise the style remains on the item after move)
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		// We might not operate on table items as when the table is filtered (e.g. by search text or by
		// items) we still
		// have to move the items regarding the whole list. Therefore we have to operate on aggregation items.
		this.firePositionChanged({
			key: this._getKeyByTableItem(oTableItemFrom),
			position: this._getItemPositionOfKey(this._getKeyByTableItem(oTableItemTo))
		});
		// The event positionChanged leads to binding update, so we have to reconstruct the table according the filters
		this._filterTable(this.aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	FilterPanel.prototype._getInitialItemOrder = function () {
		return this.getItems().sort(function (a, b) {
			if (a.getText() < b.getText()) {
				return -1;
			} else if (a.getText() > b.getText()) {
				return 1;
			} else {
				return 0;
			}
		}).map(function (oItem) {
			return oItem.getKey();
		});

		// // Notify the initial order of the table items
		// var aKeysOfVisibleItems = this.getItems().filter(function(oItem) {
		// 	return this._isItemSelected(oItem);
		// }.bind(this)).map(function(oItem) {
		// 	return oItem.getKey();
		// });
		// var aKeysOfInvisibleItems = this.getItems().filter(function(oItem) {
		// 	return !this._isItemSelected(oItem);
		// }.bind(this)).sort(function(a, b) {
		// 	if (a.getText() < b.getText()) {
		// 		return -1;
		// 	} else if (a.getText() > b.getText()) {
		// 		return 1;
		// 	} else {
		// 		return 0;
		// 	}
		// }).map(function(oItem) {
		// 	return oItem.getKey();
		// });
		// return aKeysOfVisibleItems.concat(aKeysOfInvisibleItems);
	};
	FilterPanel.prototype._updateTableItems = function () {
		// Move item's control according to the sorted table items
		this._getTable().getItems().forEach(function (oTableItem) {
			var oItem = this._getItemByKey(this._getKeyByTableItem(oTableItem));
			if (oTableItem.getCells().length === 2) {
				oTableItem.removeCell(oTableItem.getCells()[1]);
			}
			if (oItem.getControls()[0]) {
				var oControlClone = oItem.getControls()[0].clone();
				// oControlClone.bindProperty("editMode", {
				// 	path: oItem.getBindingContext().getPath() + "/selected",
				// 	formatter: function(bSelected) {
				// 		return bSelected ? sap.ui.mdc.EditMode.Editable : sap.ui.mdc.EditMode.ReadOnly;
				// 	}
				// });
				oTableItem.insertCell(oControlClone, 1);
			}
		}.bind(this));
	};
	FilterPanel.prototype._isFilteredByShowSelected = function () {
		return false;
		// return this.byId("idShowSelected").getPressed();
	};
	FilterPanel.prototype._getSearchText = function () {
		var oSearchField = this.byId("idSearchField") || null;
		return oSearchField ? oSearchField.getValue() : "";
	};
	FilterPanel.prototype._getTable = function () {
		return this.byId("idList") || null;
	};
	FilterPanel.prototype._getTableBinding = function () {
		return this._getTable().getBinding("items");
	};
	FilterPanel.prototype._getTableBindingContext = function () {
		return this._getTableBinding().getContexts();
	};
	FilterPanel.prototype._setMarkedTableItem = function (oTableItem) {
		this._sKeyOfMarkedItem = this._getKeyByTableItem(oTableItem);
	};
	FilterPanel.prototype._getMarkedTableItem = function () {
		return this._getTableItemByKey(this._sKeyOfMarkedItem);
	};
	FilterPanel.prototype._getVisibleTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return !!oTableItem.getVisible();
		});
	};
	FilterPanel.prototype._getSelectedTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return this._isItemSelected(this._getItemByKey(this._getKeyByTableItem(oTableItem)));
		});
	};
	FilterPanel.prototype._isItemSelected = function (oItem) {
		return oItem.getControls()[0].getConditions().length > 0;
	};
	/**
	 * @returns {sap.m.ListItemBase | undefined}
	 * @private
	 */
	FilterPanel.prototype._getTableItemByKey = function (sKey) {
		var aContext = this._getTableBindingContext();
		var aTableItem = this._getTable().getItems().filter(function (oTableItem, iIndex) {
			return aContext[iIndex].getObject().getKey() === sKey;
		});
		return aTableItem[0];
	};
	/**
	 *
	 * @param {sap.m.ListItemBase} oTableItem
	 * @returns {string | null}
	 * @private
	 */
	FilterPanel.prototype._getKeyByTableItem = function (oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTableBindingContext()[iIndex].getObject().getKey();
	};
	FilterPanel.prototype._getItemPositionOfKey = function (sKey) {
		return this.getItems().indexOf(this._getItemByKey(sKey));
	};
	FilterPanel.prototype._getItemByKey = function (sKey) {
		var aItem = this.getItems().filter(function (oItem) {
			return oItem.getKey() === sKey;
		});
		return aItem[0];
	};
	FilterPanel.prototype._defineTableFiltersByText = function (sSearchText) {
		this.aFilters = [];
		// if (this._isFilteredByShowSelected() === true) {
		// 	this.aFilters.push(new sap.ui.model.Filter("selected", "EQ", true));
		// }
		if (sSearchText) {
			this.aFilters.push(new Filter([
				new Filter("text", FilterOperator.Contains, sSearchText), new Filter("tooltip", FilterOperator.Contains, sSearchText)
			], false));
		}
	};
	FilterPanel.prototype._filterTable = function (aFilters) {
		this._getTableBinding().filter(aFilters);
		this._updateTableItems();
	};
	FilterPanel.prototype._toggleMarkedTableItem = function (oTableItem) {
		// this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		// // When filter is set, the table items are reduced so marked table item can disappear.
		// var sKey = this._getKeyByTableItem(oTableItem);
		// if (sKey) {
		// 	this._setMarkedTableItem(oTableItem);
		// 	this._addMarkedStyleToTableItem(oTableItem);
		// }
	};
	FilterPanel.prototype._addMarkedStyleToTableItem = function (oTableItem) {
		if (oTableItem) {
			oTableItem.addStyleClass("sapUiMdcPersonalizationDialogMarked");
		}
	};
	FilterPanel.prototype._removeMarkedStyleFromTableItem = function (oTableItem) {
		// if (oTableItem) {
		// 	oTableItem.removeStyleClass("sapUiMdcPersonalizationDialogMarked");
		// }
	};
	FilterPanel.prototype._setFocus = function (oItem) {
		//TODO: Set Focus not on the first table item!
		oItem.getDomRef().focus();
	};
	FilterPanel.prototype._updateCountOfItems = function () {
		this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems", this._getSelectedTableItems().length);
	};
	FilterPanel.prototype._updateEnableOfMoveButtons = function (oTableItem) {
		// var aVisibleTableItems = this._getVisibleTableItems();
		// this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled", aVisibleTableItems.indexOf(oTableItem) > 0);
		// this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled", aVisibleTableItems.indexOf(oTableItem) > -1 && aVisibleTableItems.indexOf(oTableItem) < aVisibleTableItems.length - 1);

		// // TODO: focus lost workaround
		// var aVisibleTableItems = this._getVisibleTableItems();
		//
		// var bEnabled = aVisibleTableItems.indexOf(oTableItem) > 0;
		// if (this._getManagedObjectModel().getProperty("/@custom/isMoveUpButtonEnabled") === true && bEnabled === false) {
		// 	this._getCompositeAggregation().getDomRef().focus();
		// }
		// this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled", bEnabled);
		//
		// bEnabled = aVisibleTableItems.indexOf(oTableItem) > -1 && aVisibleTableItems.indexOf(oTableItem) < aVisibleTableItems.length - 1;
		// if (this._getManagedObjectModel().getProperty("/@custom/isMoveDownButtonEnabled") === true && bEnabled === false) {
		// 	this._getCompositeAggregation().getDomRef().focus();
		// }
		// this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled", bEnabled);
		// // TODO: end of focus lost workaround
	};
	FilterPanel._getItemByKey = function (sKey, aArray) {
		return aArray.filter(function (oMElement) {
			return oMElement.key === sKey;
		})[0];
	};
	// TODO: focus lost workaround
	function _observeChanges(oChanges) {
		if (oChanges.object.isA("sap.ui.mdc.base.personalization.FilterPanel")) {
			switch (oChanges.name) {
				case "showResetEnabled":
					if (oChanges.current === false && oChanges.old === true) {
						// Move the focus to the popover
						this._setFocus(this._getCompositeAggregation());
					}
					break;
				default:
					Log.error("The property or aggregation '" + oChanges.name + "' has not been registered.");
			}
		}
	}
	// TODO: end of focus lost workaround
	return FilterPanel;

}, /* bExport= */true);
