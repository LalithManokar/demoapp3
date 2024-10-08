/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Control', 'sap/m/Column', 'sap/m/Text', 'sap/ui/model/Filter', "sap/ui/core/Fragment", "sap/m/ButtonType"
], function(Control, Column, Text, Filter, Fragment, ButtonType) {
	"use strict";

	/**
	 * Constructor for BasePanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.66
	 * @alias sap.ui.mdc.p13n.BasePanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BasePanel = Control.extend("sap.ui.mdc.p13n.BasePanel", {
		library: "sap.ui.mdc",

		metadata: {
			library: "sap.ui.mdc",
			associations: {},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Content to be set for the <code>BasePanel</code>.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * This template is going to be set from the implementing panel using the <code>BasePanel</code> control, by setting the template
				 * for the columns of the inner <code>sap.m.Table</code>.
				 */
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired if there has been made any change within the <code>BasePanel</code> control.
				 */
				change: {}
			}
		},
		init: function() {

			var sFragmentId = Fragment.createId(this.getId(), "BasePanelFragment");
			this._bShowSelected = true;

			Fragment.load({
				name: "sap.ui.mdc.p13n.BasePanel",
				id: sFragmentId,
				controller: this
			}).then(function(oMTable) {

				// list is necessary to set the template + model on
				this._oMTable = oMTable;

				//disable 'select all'
				this._oMTable.selectAll = function(){};

				// Note: Below code is needed when fragments are really asynchronously loaded
				// update columns if they were set before the table was loaded
				// only needed if table is created after columns were attempted to be updated
				if (this._aColTexts) {
					this._addTableColumns(this._aColTexts);
					this._aColTexts = null;
				}
				// update binding if template was loaded before the table
				if (this.getTemplate()) {
					this._bindListItems();
				}

				this.setAggregation("_content", oMTable);

				// set the buttons for moving items
				this._moveTopButton = Fragment.byId(sFragmentId, "IDButtonMoveToTop");
				this._moveUpButton = Fragment.byId(sFragmentId, "IDButtonMoveUp");
				this._moveDownButton = Fragment.byId(sFragmentId, "IDButtonMoveDown");
				this._moveBottomButton = Fragment.byId(sFragmentId, "IDButtonMoveToBottom");

			}.bind(this));
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_content"));
			oRm.write("</div>");
		}
	});

	BasePanel.prototype.setTemplate = function(oTemplate) {
		this.setAggregation("template", oTemplate);
		// bind table, only if it already exists
		// due to async template load only the template may be set
		if (this._oMTable) {
			this._bindListItems();
		}
		return this;
	};

	BasePanel.prototype.setPanelColumns = function(sTexts) {
		var aTexts;
		if (sTexts instanceof Array) {
			aTexts = sTexts;
		} else {
			aTexts = [
				sTexts
			];
		}
		// update columns if table already exists
		if (this._oMTable) {
			this._addTableColumns(aTexts);
		} else {
			// save the texts, so columns can be created once table fragment is loaded
			this._aColTexts = aTexts;
		}
	};

	BasePanel.prototype._addTableColumns = function(aTexts) {
		aTexts.forEach(function(sText) {
			this._oMTable.addColumn(new Column({
				header: new Text({
					text: sText
				})
			}));
		}, this);
	};

	BasePanel.prototype._bindListItems = function(mBindingInfo) {
		this._oMTable.bindItems(Object.assign({
			path: "/items",
			key: "name",
			templateShareable: false,
			template: this.getTemplate().clone()
		}, mBindingInfo));
	};

	BasePanel.prototype._onSelectionChange = function(oEvent) {

		var aListItems = oEvent.getParameter("listItems");
		var bSelectAll = oEvent.getParameter("selectAll");
		var bDeSelectAll = !bSelectAll && aListItems.length > 1;

		aListItems.forEach(function(oTableItem) {
			this._selectTableItem(oTableItem, bSelectAll || bDeSelectAll);
		}, this);

		if (bSelectAll || bDeSelectAll) {
			this.fireChange();
		}

		// in case of 'deselect all', the move buttons for positioning are going to be disabled
		if (bDeSelectAll) {
			this._moveTopButton.setEnabled(false);
			this._moveUpButton.setEnabled(false);
			this._moveDownButton.setEnabled(false);
			this._moveBottomButton.setEnabled(false);
		}
	};

	BasePanel.prototype._onItemPressed = function(oEvent) {
		var oTableItem = oEvent.getParameter('listItem');
		this._toggleMarkedTableItem(this._oSelectedItem, oTableItem);
		this._oSelectedItem = oTableItem;
		this._updateEnableOfMoveButtons(oTableItem);
	};

	BasePanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		this._oMTable.getBinding("items").filter(new Filter("label", "Contains", oEvent.getSource().getValue()));
	};

	BasePanel.prototype._onPressButtonMoveToTop = function() {
		this._moveSelectedItem(0);
	};

	BasePanel.prototype._onPressButtonMoveUp = function() {
		this._moveSelectedItem("Up");
	};

	BasePanel.prototype._onPressButtonMoveDown = function() {
		this._moveSelectedItem("Down");
	};

	BasePanel.prototype._onPressButtonMoveToBottom = function() {
		this._moveSelectedItem(this._oMTable.getItems().length - 1);
	};

	BasePanel.prototype._onPressShowSelected = function(oEvent) {
		this._oMTable.getItems().forEach(function(oItem){
			if (!oItem.getSelected()) {
				oItem.setVisible(this._bShowSelected ? false : true);
			}
		}.bind(this));
		oEvent.getSource().setType(this._bShowSelected ? ButtonType.Emphasized : ButtonType.Default);
		this._bShowSelected = this._bShowSelected ? false : true;
	};

	BasePanel.prototype._selectTableItem = function(oTableItem, bSelectAll) {
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
		this._oSelectedItem = oTableItem;
		if (!bSelectAll) {
			// only fire this event if one item is being selected in a live scenario, else fire the change event in the _onSelectionChange method
			this.fireChange();
		}
	};

	BasePanel.prototype._moveSelectedItem = function(vNewIndex) {
		var aItems = this._oMTable.getItems();
		var oSelectedItem = this._oSelectedItem;
		var iSelectedIndex = aItems.indexOf(oSelectedItem);
		if (iSelectedIndex < 0) {
			return;
		}

		// determine the new index relative to selected index when "Up" or "Down" is passed as a parameter
		var iNewIndex = (typeof vNewIndex == "number") ? vNewIndex : iSelectedIndex + (vNewIndex == "Up" ? -1 : 1);
		this._moveTableItem(oSelectedItem, iNewIndex);

	};

	BasePanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		var aItems = this._oMTable.getItems();
		var aFields = this._oMTable.getModel().getData().items;

		// index of the item in the model not the index in the aggregation
		var iOldIndex = aFields.indexOf(oItem.getBindingContext().getObject());

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		iNewIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext().getObject());
		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewIndex, 0, aFields.splice(iOldIndex, 1)[0]);
		this._oMTable.getModel().setProperty("/items", aFields);

		// store the moved item again due to binding
		this._oSelectedItem = aItems[iNewIndex];

		// set the 'highlighting' effect on the item
		this._toggleMarkedTableItem(aItems[iOldIndex], aItems[iNewIndex]);
		this._updateEnableOfMoveButtons(this._oSelectedItem);

		this.fireChange();
	};

	BasePanel.prototype._toggleMarkedTableItem = function(oTableItemOld, oTableItemNew) {

	};

	BasePanel.prototype._onRearrange = function(oEvent) {
		var oDraggedItem = oEvent.getParameter("draggedControl");
		var oDroppedItem = oEvent.getParameter("droppedControl");
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oMTable.indexOfItem(oDraggedItem);
		var iDroppedIndex = this._oMTable.indexOfItem(oDroppedItem);
		var iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this._moveTableItem(oDraggedItem, iActualDroppedIndex);
		this._updateEnableOfMoveButtons(oDraggedItem);
	};

	BasePanel.prototype._updateEnableOfMoveButtons = function(oTableItem) {
		var iTableItemPos = this._oMTable.getItems().indexOf(oTableItem);
		var bUpEnabled = true, bDownEnabled = true;
		if (iTableItemPos == 0) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}
		if (iTableItemPos == oTableItem.getParent().getItems().length - 1) {
			// disable move buttons downwards, if the item is at the bottom
			bDownEnabled = false;
		}
		this._moveTopButton.setEnabled(bUpEnabled);
		this._moveUpButton.setEnabled(bUpEnabled);
		this._moveDownButton.setEnabled(bDownEnabled);
		this._moveBottomButton.setEnabled(bDownEnabled);
		oTableItem.focus();
	};

	return BasePanel;
}, /* bExport= */true);
