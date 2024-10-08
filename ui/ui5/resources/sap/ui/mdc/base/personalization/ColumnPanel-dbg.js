/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/ui/core/ResizeHandler'
], function (XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, ResizeHandler) {
	"use strict";

	/**
	 * Constructor for a new ColumnPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>ColumnPanel</code> control is used to define chart-specific personalization settings.
	 * @extends sap.ui.mdc.XMLComposite
	 * @author SAP SE
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.ColumnPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPanel = XMLComposite.extend("sap.ui.mdc.base.personalization.ColumnPanel", /** @lends sap.ui.mdc.base.personalization.ColumnPanel.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * Determines whether the Reset button is shown inside the dialog. If a user clicks the Reset button, the <code>ColumnPanel</code> control
					 * fires the <code>reset</code> event.
					 */
					showReset: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					},

					/**
					 * Determines whether the Reset button is enabled. This property is only taken into account only if <code>showReset</code> is set
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
					 * The <code>ColumnPanel</code> control opens in a relative position to the <code>source</code>.
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
						type: "sap.ui.mdc.base.personalization.ColumnPanelItem",
						multiple: true,
						singularName: "item",
						invalidate: true
					}
				},
				events: {
					/**
					 * This event is fired when the initial items are ordered based on the sort algorithm of the <code>ColumnPanel</code> control.
					 */
					initialOrderChanged: {
						keys: {
							type: "string[]"
						}
					},
					/**
					 * This event is fired if there has a change been made within the <code>ColumnPanel</code> control.
					 */
					change: {},
					/**
					 * This event is fired if the Reset button in the <code>ColumnPanelModal</code> control is clicked. The consumer of the control
					 * has to make sure that the model data is reset.
					 */
					reset: {}
				}
			}
		});

	ColumnPanel.prototype.init = function () {

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
	ColumnPanel.prototype.exit = function () {
		this._sContainerResizeListener = null;
	};
	ColumnPanel.prototype.initialize = function () {
		// Remove 'old' marked item
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this._updateCountOfItems();

		this.fireInitialOrderChanged({
			keys: this._getInitialItemOrder()
		});

		// Set marked item initially to the first visible table item
		var oTableItem = this._getVisibleTableItems()[0];
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	ColumnPanel.prototype.onDrop = function (oEvent) {
		this._moveTableItem(oEvent.getParameter("draggedControl"), oEvent.getParameter("droppedControl"));
	};
	ColumnPanel.prototype.onDragStart = function (oEvent) {
		this._toggleMarkedTableItem(oEvent.getParameter("target"));
	};
	ColumnPanel.prototype.onChangeOfRole = function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		// Fire event only for valid selection
		if (oSelectedItem) {
			var oTableItem = oEvent.getSource().getParent();

			this.fireChange();
			this._toggleMarkedTableItem(oTableItem);
			this._updateEnableOfMoveButtons(oTableItem);
		}
	};
	ColumnPanel.prototype.onSelectionChange = function (oEvent) {
		oEvent.getParameter("listItems").forEach(function (oTableItem) {
			this._selectTableItem(oTableItem);
		}, this);
	};
	ColumnPanel.prototype.onItemPressed = function (oEvent) {
		var oTableItem = oEvent.getParameter('listItem');

		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	ColumnPanel.prototype.onSearchFieldLiveChange = function (oEvent) {
		var oSearchField = oEvent.getSource();
		this._defineTableFiltersByText(oSearchField ? oSearchField.getValue() : "");
		this._filterTable(this.aFilters);
	};
	ColumnPanel.prototype.onSwitchButtonShowSelected = function () {
		this._defineTableFiltersByText(this._getSearchText());
		this._filterTable(this.aFilters);
	};
	ColumnPanel.prototype.onPressButtonMoveToTop = function () {
		this._moveTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	ColumnPanel.prototype.onPressButtonMoveUp = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	ColumnPanel.prototype.onPressButtonMoveDown = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	ColumnPanel.prototype.onPressButtonMoveToBottom = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	ColumnPanel.prototype.onPressReset = function () {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		this.fireReset();
	};


	ColumnPanel.prototype._selectTableItem = function (oTableItem) {
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);

		this._updateCountOfItems();

		this.fireChange();
	};
	ColumnPanel.prototype._moveTableItem = function (oTableItemFrom, oTableItemTo) {
		// Remove style of current table item (otherwise the style remains on the item after move)
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		// We might not operate on table items as when the table is filtered (e.g. by search text or by selected items) we still
		// have to move the items regarding the whole list. Therefore we have to operate on aggregation items.

		//Set aRuntimeItems again in order to reflecet the right positioning
		var aRuntimeItems = this.getModel("$sapuimdcPanel").getData().items;
		var oMItem = _getArrayElementByName(this._getKeyByTableItem(oTableItemFrom), aRuntimeItems);
		aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
		aRuntimeItems.splice(this._getItemPositionOfKey(this._getKeyByTableItem(oTableItemTo)), 0, oMItem);
		this.getModel("$sapuimdcPanel").setProperty("/items", aRuntimeItems);

		this.fireChange();
		// The event positionChanged leads to binding update, so we have to reconstruct the table according the filters
		this._filterTable(this.aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	ColumnPanel.prototype._getInitialItemOrder = function () {
		// Notify the initial order of the table items
		var aKeysOfVisibleItems = this.getItems().filter(function (oItem) {
			return oItem.getVisible();
		}).map(function (oItem) {
			return oItem.getName();
		});
		var aKeysOfInvisibleItems = this.getItems().filter(function (oItem) {
			return !oItem.getVisible();
		}).sort(function (a, b) {
			if (a.getLabel() < b.getLabel()) {
				return -1;
			} else if (a.getLabel() > b.getLabel()) {
				return 1;
			} else {
				return 0;
			}
		}).map(function (oItem) {
			return oItem.getName();
		});
		return aKeysOfVisibleItems.concat(aKeysOfInvisibleItems);
	};
	ColumnPanel.prototype._isFilteredByShowSelected = function () {
		return false;
		// return this.byId("idShowSelected").getPressed();
	};
	ColumnPanel.prototype._getSearchText = function () {
		var oSearchField = this.byId("idSearchField") || null;
		return oSearchField ? oSearchField.getValue() : "";
	};
	ColumnPanel.prototype._getTable = function () {
		return this.byId("idList") || null;
	};
	ColumnPanel.prototype._getTableBinding = function () {
		return this._getTable().getBinding("items");
	};
	ColumnPanel.prototype._getTableBindingContext = function () {
		return this._getTableBinding().getContexts();
	};
	ColumnPanel.prototype._setMarkedTableItem = function (oTableItem) {
		this._sKeyOfMarkedItem = this._getKeyByTableItem(oTableItem);
	};
	ColumnPanel.prototype._getMarkedTableItem = function () {
		return this._getTableItemByKey(this._sKeyOfMarkedItem);
	};
	ColumnPanel.prototype._getVisibleTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return !!oTableItem.getVisible();
		});
	};
	ColumnPanel.prototype._getSelectedTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return !!oTableItem.getSelected();
		});
	};
	/**
	 * @returns {sap.m.ListItemBase | undefined}
	 * @private
	 */
	ColumnPanel.prototype._getTableItemByKey = function (sKey) {
		var aContext = this._getTableBindingContext();
		var aTableItem = this._getTable().getItems().filter(function (oTableItem, iIndex) {
			return aContext[iIndex].getObject().getName() === sKey;
		});
		return aTableItem[0];
	};
	/**
	 *
	 * @param {sap.m.ListItemBase} oTableItem
	 * @returns {string | null}
	 * @private
	 */
	ColumnPanel.prototype._getKeyByTableItem = function (oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTableBindingContext()[iIndex].getObject().getName();
	};
	ColumnPanel.prototype._getItemPositionOfKey = function (sKey) {
		return this.getItems().indexOf(this._getItemByKey(sKey));
	};
	ColumnPanel.prototype._getItemByKey = function (sKey) {
		var aItem = this.getItems().filter(function (oItem) {
			return oItem.getName() === sKey;
		});
		return aItem[0];
	};
	ColumnPanel.prototype._defineTableFiltersByText = function (sSearchText) {
		this.aFilters = [];
		if (this._isFilteredByShowSelected() === true) {
			this.aFilters.push(new Filter("visible", "EQ", true));
		}
		if (sSearchText) {
			this.aFilters.push(new Filter([
				new Filter("label", FilterOperator.Contains, sSearchText)
			], false));
		}
	};
	ColumnPanel.prototype._filterTable = function (aFilters) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this._getTableBinding().filter(aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	ColumnPanel.prototype._toggleMarkedTableItem = function (oTableItem) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		// When filter is set, the table items are reduced so marked table item can disappear.
		var sKey = this._getKeyByTableItem(oTableItem);
		if (sKey) {
			this._setMarkedTableItem(oTableItem);
			this._addMarkedStyleToTableItem(oTableItem);
		}
	};
	ColumnPanel.prototype._addMarkedStyleToTableItem = function (oTableItem) {
		if (oTableItem) {
			oTableItem.addStyleClass("sapUiMdcPersonalizationDialogMarked");
		}
	};
	ColumnPanel.prototype._setFocus = function (oItem) {
		//TODO: Set Focus not on the first table item!
		oItem.getDomRef().focus();
	};
	ColumnPanel.prototype._removeMarkedStyleFromTableItem = function (oTableItem) {
		if (oTableItem) {
			oTableItem.removeStyleClass("sapUiMdcPersonalizationDialogMarked");
		}
	};
	ColumnPanel.prototype._updateCountOfItems = function () {
		this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems", this._getSelectedTableItems().length);
	};
	ColumnPanel.prototype._updateEnableOfMoveButtons = function (oTableItem) {
		var aVisibleTableItems = this._getVisibleTableItems();

		// TODO: focus lost workaround
		var bEnabled = aVisibleTableItems.indexOf(oTableItem) > 0;
		if (this._getManagedObjectModel().getProperty("/@custom/isMoveUpButtonEnabled") === true && bEnabled === false) {
			this._setFocus(oTableItem);
		}
		this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled", bEnabled);
		bEnabled = aVisibleTableItems.indexOf(oTableItem) > -1 && aVisibleTableItems.indexOf(oTableItem) < aVisibleTableItems.length - 1;
		if (this._getManagedObjectModel().getProperty("/@custom/isMoveDownButtonEnabled") === true && bEnabled === false) {
			this._setFocus(oTableItem);
		}
		this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled", bEnabled);
		// TODO: end of focus lost workaround

	};
	function _getArrayElementByName(sName, aArray) {
		return aArray.filter(function (oMElement) {
			return oMElement.name === sName;
		})[0];
	}

	// TODO: focus lost workaround
	function _observeChanges(oChanges) {
		if (oChanges.object.isA("sap.ui.mdc.base.personalization.ColumnPanel")) {
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

	return ColumnPanel;

}, /* bExport= */true);
