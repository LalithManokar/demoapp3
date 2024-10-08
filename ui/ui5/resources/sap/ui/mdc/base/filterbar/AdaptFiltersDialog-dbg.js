/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/m/MessageBox'
], function(XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, MessageBox) {
	"use strict";

	/**
	 * Constructor for a new AdaptFiltersDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The AdaptFiltersDialog control is used to show <code>items</code>.
	 * @extends sap.ui.mdc.XMLComposite
	 * @author SAP SE
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.filterbar.AdaptFiltersDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AdaptFiltersDialog = XMLComposite.extend("sap.ui.mdc.base.filterbar.AdaptFiltersDialog", /** @lends sap.ui.mdc.base.filterbar.AdaptFiltersDialog.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * This property determines whether the 'Restore' button is shown inside the dialog. If this property is set to true, clicking the
				 * 'Reset' button will trigger the <code>reset</code> event sending a notification that model data must be reset.
				 */
				showReset: {
					type: "boolean",
					defaultValue: false,
					invalidate: true
				},

				/**
				 * This property determines whether the 'Restore' button is enabled and is taken into account only if <code>showReset</code> is set
				 * to <code>true</code>.
				 */
				showResetEnabled: {
					type: "boolean",
					defaultValue: false,
					invalidate: true
				}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Defines personalization items.
				 */
				items: {
					type: "sap.ui.mdc.base.filterbar.AdaptFiltersDialogItem",
					multiple: true,
					singularName: "item"
				}
			},
			events: {
				/**
				 * Event fired if an item in <code>AdaptFiltersDialog</code> is set as visible or invisible.
				 */
				visibilityChanged: {
					key: {
						type: "string"
					},
					visible: {
						type: "boolean"
					}
				},
				/**
				 * Event fired if an item in <code>AdaptFiltersDialog</code> is moved.
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
				 * Event fired if the 'ok' button in <code>AdaptFiltersDialog</code> is clicked.
				 */
				ok: {},
				/**
				 * Event fired if the 'cancel' button in <code>AdaptFiltersDialog</code> is clicked.
				 */
				cancel: {},
				/**
				 * Event fired if the 'reset' button in <code>AdaptFiltersDialog</code> is clicked.
				 */
				reset: {}
			}
		}
	});

	AdaptFiltersDialog.prototype.init = function() {
		// Set device model
		var oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		// Due to the re-binding during execution of _filterTableItemsByText() the sap.m.Table re-create all items.
		// So we have to store the 'key' in order to mark the item after re-binding.
		this._sKeyOfMarkedItem = null;

	};
	AdaptFiltersDialog.prototype.open = function() {
		this.initialize();
		this._getCompositeAggregation().open();
	};
	AdaptFiltersDialog.prototype.initialize = function() {
		// Remove 'old' marked item
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this._updateCountOfItems();
		this._initVisualIndex();
		this._sortTableItemsByVisualIndex();
		this._updateTableItems();

		// Set marked item initially to the first visible table item
		var oTableItem = this._getVisibleTableItems()[0];
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	AdaptFiltersDialog.prototype.close = function() {
		this._getCompositeAggregation().close();
	};
	AdaptFiltersDialog.prototype.onSelectionChange = function(oEvent) {
		oEvent.getParameter("listItems").forEach(function(oTableItem) {
			this._selectTableItem(oTableItem);
		}, this);
	};
	AdaptFiltersDialog.prototype.onItemPressed = function(oEvent) {
		var oTableItem = oEvent.getParameter('listItem');

		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	AdaptFiltersDialog.prototype.onSearchFieldLiveChange = function(oEvent) {
		var oSearchField = oEvent.getSource();
		this._filterTableItemsByText(oSearchField ? oSearchField.getValue() : "");
	};
	AdaptFiltersDialog.prototype.onSwitchButtonShowSelected = function() {
		this._filterTableItemsByText(this._getSearchText());
	};
	AdaptFiltersDialog.prototype.onPressButtonMoveToTop = function() {
		this._moveTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	AdaptFiltersDialog.prototype.onPressButtonMoveUp = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	AdaptFiltersDialog.prototype.onPressButtonMoveDown = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	AdaptFiltersDialog.prototype.onPressButtonMoveToBottom = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	AdaptFiltersDialog.prototype.onPressOk = function() {
		this.fireOk();
	};
	AdaptFiltersDialog.prototype.onPressCancel = function() {
		this.fireCancel();
	};
	AdaptFiltersDialog.prototype.onPressReset = function() {
		this.fireReset();
	};
	AdaptFiltersDialog.prototype.onAfterClose = function() {
		this.fireCancel();
	};

	AdaptFiltersDialog.prototype._selectTableItem = function(oTableItem) {
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);

		this._updateCountOfItems();

		this.fireVisibilityChanged({
			key: this._getKeyByTableItem(oTableItem),
			visible: oTableItem.getSelected()
		});
		var iRelativePosition = this._getRelativePositionOf(oTableItem);
		if (iRelativePosition > 0) {
			this.firePositionChanged({
				key: this._getKeyByTableItem(oTableItem),
				relativePosition: iRelativePosition
			});
		}
	};
	AdaptFiltersDialog.prototype._moveTableItem = function(oTableItemFrom, oTableItemTo) {
		// Remove style of current table item (otherwise the style remains on the item after move)
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		// Update the new visualIndex on the items
		var oItemFrom = this._getItemByKey(this._getKeyByTableItem(oTableItemFrom));
		var oItemTo = this._getItemByKey(this._getKeyByTableItem(oTableItemTo));
		oItemFrom.visualIndex = oItemTo.visualIndex + (oItemFrom.visualIndex < oItemTo.visualIndex ? 1 : -1); // move behind of the itemTo, not on the same position

		// Sort table items by the visual order and move the item's control according to the visible table item
		var iRelativePositionOld = this._getRelativePositionOf(oTableItemFrom);
		this._sortTableItemsByVisualIndex();

		var aSelectedTableItems = this._getSelectedTableItems();
		this._getTable().getItems().forEach(function(oTableItem, iIndex) {
			var oItem = this._getItemByKey(this._getKeyByTableItem(oTableItem));
			// Update the visualIndex
			oItem.visualIndex = iIndex;
			// Update item's relativePosition
			oItem.setRelativePosition(aSelectedTableItems.indexOf(oTableItem));
			// _updateTableItems() inline
			oTableItem.insertCell(oItem.getControls()[0].clone(), 1);
		}.bind(this));

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());

		var sKey = this._getKeyByTableItem(oTableItemTo);
		var oItem = this._getItemByKey(sKey);
		if (iRelativePositionOld !== oItem.getRelativePosition() && oItem.getRelativePosition() > -1) {
			// Fire position changed event
			this.firePositionChanged({
				key: sKey,
				relativePosition: oItem.getRelativePosition()
			});
		}
	};
	AdaptFiltersDialog.prototype._initVisualIndex = function() {
		// Store at the items the initial sorted order of the table items

		var aItemsVisibleSortedByRelativePosition = this.getItems().filter(function(oItem) {
			return oItem.getVisible();
		}).sort(function(a, b) {
			return a.getRelativePosition() - b.getRelativePosition();
		});
		aItemsVisibleSortedByRelativePosition.forEach(function(oItem, iIndex) {
			oItem.visualIndex = iIndex;
		});
		var aItemsInvisibleSortedByText = this.getItems().filter(function(oItem) {
			return !oItem.getVisible();
		}).sort(function(a, b) {
			if (a.getText() < b.getText()) {
				return -1;
			} else if (a.getText() > b.getText()) {
				return 1;
			} else {
				return 0;
			}
		});
		var iIndexOffset = aItemsVisibleSortedByRelativePosition.length;
		aItemsInvisibleSortedByText.forEach(function(oItem, iIndex) {
			oItem.visualIndex = iIndex + iIndexOffset;
		});
	};
	AdaptFiltersDialog.prototype._sortTableItemsByVisualIndex = function() {
		this._getTableBinding().sort(new sap.ui.model.Sorter({
			path: '',
			descending: false,
			group: false,
			comparator: function(a, b) {
				return a.visualIndex - b.visualIndex;
			}
		}));
	};
	AdaptFiltersDialog.prototype._updateTableItems = function() {
		// Move item's control according to the sorted table items
		this._getTable().getItems().forEach(function(oTableItem) {
			var oItem = this._getItemByKey(this._getKeyByTableItem(oTableItem));
			oTableItem.insertCell(oItem.getControls()[0].clone(), 1);
		}.bind(this));
	};
	AdaptFiltersDialog.prototype._isFilteredByShowSelected = function() {
		return sap.ui.getCore().byId(this.getId() + "--idShowSelected").getPressed();
	};
	AdaptFiltersDialog.prototype._getSearchText = function() {
		var oSearchField = sap.ui.getCore().byId(this.getId() + "--idSearchField") || null;
		return oSearchField ? oSearchField.getValue() : "";
	};
	AdaptFiltersDialog.prototype._getTable = function() {
		return sap.ui.getCore().byId(this.getId() + "--idList") || null;
	};
	AdaptFiltersDialog.prototype._getTableBinding = function() {
		return this._getTable().getBinding("items");
	};
	AdaptFiltersDialog.prototype._getTableBindingContext = function() {
		return this._getTableBinding().getContexts();
	};
	AdaptFiltersDialog.prototype._setMarkedTableItem = function(oTableItem) {
		this._sKeyOfMarkedItem = this._getKeyByTableItem(oTableItem);
	};
	AdaptFiltersDialog.prototype._getMarkedTableItem = function() {
		return this._getTableItemByKey(this._sKeyOfMarkedItem);
	};
	AdaptFiltersDialog.prototype._getVisibleTableItems = function() {
		return this._getTable().getItems().filter(function(oTableItem) {
			return !!oTableItem.getVisible();
		});
	};
	AdaptFiltersDialog.prototype._getSelectedTableItems = function() {
		return this._getTable().getItems().filter(function(oTableItem) {
			return !!oTableItem.getSelected();
		});
	};
	/**
	 * @returns {sap.m.ListItemBase | undefined}
	 * @private
	 */
	AdaptFiltersDialog.prototype._getTableItemByKey = function(sKey) {
		var aContext = this._getTableBindingContext();
		var aTableItem = this._getTable().getItems().filter(function(oTableItem, iIndex) {
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
	AdaptFiltersDialog.prototype._getKeyByTableItem = function(oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTableBindingContext()[iIndex].getObject().getKey();
	};
	AdaptFiltersDialog.prototype._getItemByKey = function(sKey) {
		var aItem = this.getItems().filter(function(oItem) {
			return oItem.getKey() === sKey;
		});
		return aItem[0];
	};
	AdaptFiltersDialog.prototype._filterTableItemsByText = function(sSearchText) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		var aFilters = [];
		if (this._isFilteredByShowSelected() === true) {
			aFilters.push(new sap.ui.model.Filter("visible", "EQ", true));
		}
		if (sSearchText) {
			aFilters.push(new Filter([
				new Filter("text", FilterOperator.Contains, sSearchText), new Filter("tooltip", FilterOperator.Contains, sSearchText)
			], false));
		}
		this._getTableBinding().filter(aFilters);
		this._sortTableItemsByVisualIndex();
		this._updateTableItems();

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	AdaptFiltersDialog.prototype._toggleMarkedTableItem = function(oTableItem) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		// When filter is set, the table items are reduced so marked table item can disappear.
		var sKey = this._getKeyByTableItem(oTableItem);
		if (sKey) {
			this._setMarkedTableItem(oTableItem);
			this._addMarkedStyleToTableItem(oTableItem);
		}
	};
	AdaptFiltersDialog.prototype._addMarkedStyleToTableItem = function(oTableItem) {
		if (oTableItem) {
			oTableItem.addStyleClass("sapUiMdcBaseFilterBarAdaptFiltersDialogMarked");
		}
	};
	AdaptFiltersDialog.prototype._removeMarkedStyleFromTableItem = function(oTableItem) {
		if (oTableItem) {
			oTableItem.removeStyleClass("sapUiMdcBaseFilterBarAdaptFiltersDialogMarked");
		}
	};
	AdaptFiltersDialog.prototype._updateCountOfItems = function() {
		this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems", this._getSelectedTableItems().length);
	};
	AdaptFiltersDialog.prototype._updateEnableOfMoveButtons = function(oTableItem) {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled", aVisibleTableItems.indexOf(oTableItem) > 0);
		this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled", aVisibleTableItems.indexOf(oTableItem) > -1 && aVisibleTableItems.indexOf(oTableItem) < aVisibleTableItems.length - 1);
	};
	AdaptFiltersDialog.prototype._getRelativePositionOf = function(oTableItem) {
		return this._getSelectedTableItems().indexOf(oTableItem);
	};
	AdaptFiltersDialog._getItemByKey = function(sKey, aArray) {
		return aArray.filter(function(oMElement) {
			return oMElement.key === sKey;
		})[0];
	};

	return AdaptFiltersDialog;

}, /* bExport= */true);
