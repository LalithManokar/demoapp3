/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/Device", "sap/ui/core/Control", "sap/m/List", "sap/m/StandardListItem", "sap/m/OverflowToolbar", "sap/m/ToolbarSpacer", "sap/m/Title", "sap/m/Button", "sap/m/SearchField", "sap/m/FlexBox", "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/ui/model/json/JSONModel", "sap/ui/core/dnd/DragInfo", "sap/ui/core/dnd/DragDropInfo"
], function(Device, Control, List, StandardListItem, OverflowToolbar, ToolbarSpacer, Title, Button, SearchField, FlexBox, Filter, Sorter, JSONModel, DragInfo, DragDropInfo) {
	"use strict";

	/**
	 * Constructor for P13n Fields UI.
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
	 * @since 1.61
	 * @alias sap.ui.mdc.p13n.FieldsUI
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldsUI = Control.extend("sap.ui.mdc.p13n.FieldsUI", {
		library: "sap.ui.mdc",
		metadata: {
			properties: {
				fetchFields: {
					type: "function"
				}
			},
			aggregations: {
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		init: function() {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			var sDirection = (Device.system.desktop || Device.system.combi) ? "Row" : "Column";

			this._oAvailableList = new List(this.getId() + "-availableList", {
				mode: "MultiSelect",
				growing: true,
				growingThreshold: 50,
				growingScrollToLoad: true,
				includeItemInSelection: true,
				rememberSelections: false,
				noDataText: oRb.getText("fieldsui.NO_FIELDS_TEXT"),
				sticky: ["HeaderToolbar"],
				headerToolbar: new OverflowToolbar({
					content: [
						new Title({
							text: oRb.getText("fieldsui.AVAILABLE_FIELDS")
						}), new ToolbarSpacer(), new SearchField({
							width: "15rem",
							liveChange: [
								this._onAvailableListSearch, this
							]
						})
					]
				}),
				items: {
					path: "/",
					sorter: new Sorter("label"),
					template: new StandardListItem({
						title: "{label}"
					})
				},
				dragDropConfig: [
					new DragDropInfo({
						sourceAggregation: "items",
						targetElement: this.getId() + "-selectedList",
						drop: [
							this._onMoveToSelected, this
						]
					}), new DragInfo({
						sourceAggregation: "items",
						dragStart: [
							this._onDragStart, this
						]
					})
				]
			});
			this._oAvailableModel = new JSONModel([]);
			this._oAvailableList.setModel(this._oAvailableModel);

			this._oSelectedList = new List(this.getId() + "-selectedList", {
				mode: "MultiSelect",
				growing: true,
				growingThreshold: 50,
				growingScrollToLoad: true,
				includeItemInSelection: true,
				rememberSelections: false,
				noDataText: oRb.getText("fieldsui.MOVE_TO_SELECTED"),
				headerToolbar: new OverflowToolbar({
					content: [
						new Title({
							text: oRb.getText("fieldsui.SELECTED_FIELDS")
						}), new ToolbarSpacer(), new SearchField({
							width: "15rem",
							liveChange: [
								this._onSelectedListSearch, this
							]
						}), new Button({
							icon: "sap-icon://collapse-group",
							tooltip: oRb.getText("fieldsui.MOVE_TO_TOP"),
							press: [
								this._onMoveTop, this
							]
						}), new Button({
							icon: "sap-icon://slim-arrow-up",
							tooltip: oRb.getText("fieldsui.MOVE_UP"),
							press: [
								this._onMoveUp, this
							]
						}), new Button({
							icon: "sap-icon://slim-arrow-down",
							tooltip: oRb.getText("fieldsui.MOVE_DOWN"),
							press: [
								this._onMoveDown, this
							]
						}), new Button({
							icon: "sap-icon://expand-group",
							tooltip: oRb.getText("fieldsui.MOVE_TO_BOTTOM"),
							press: [
								this._onMoveBottom, this
							]
						})
					]
				}),
				items: {
					path: "/",
					template: new StandardListItem({
						title: "{label}"
					})
				},
				dragDropConfig: [
					new DragDropInfo({
						sourceAggregation: "items",
						targetAggregation: "items",
						dropPosition: "Between",
						drop: [
							this._onRearrange, this
						]
					}), new DragDropInfo({
						sourceAggregation: "items",
						targetElement: this.getId() + "-availableList",
						drop: [
							this._onMoveToAvailable, this
						]
					}), new DragInfo({
						sourceAggregation: "items",
						dragStart: [
							this._onDragStart, this
						]
					})
				]
			});
			this._oSelectedModel = new JSONModel([]);
			this._oSelectedList.setModel(this._oSelectedModel);

			this.setAggregation("_content", new FlexBox({
				direction: sDirection,
				renderType: "Bare",
				items: [
					this._oAvailableList, new FlexBox({
						direction: (sDirection == "Row") ? "Column" : "Row",
						justifyContent: "Center",
						items: [
							new Button({
								icon: "sap-icon://slim-arrow-" + (sDirection == "Row" ? "right" : "down"),
								tooltip: oRb.getText("fieldsui.MOVE_TO_SELECTED"),
								press: [
									this._onMoveToSelected, this
								]
							}).addStyleClass("sapUiTinyMarginBeginEnd"), new Button({
								icon: "sap-icon://slim-arrow-" + (sDirection == "Row" ? "left" : "up"),
								tooltip: oRb.getText("fieldsui.MOVE_TO_AVAILABLE"),
								press: [
									this._onMoveToAvailable, this
								]
							}).addStyleClass("sapUiTinyMarginBeginEnd")
						]
					}), this._oSelectedList
				]
			}));
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiMDCFieldsUI");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_content"));
			oRm.write("</div>");
		}
	});

	FieldsUI.prototype.exit = function() {
		this._oSelectedList = null;
		this._oAvailableList = null;
		this._oSelectedModel.destroy();
		this._oAvailableModel.destroy();
		this._oSelectedModel = null;
		this._oAvailableModel = null;
	};

	FieldsUI.prototype.setFetchFields = function(fnFetchFields) {
		this.setProperty("fetchFields", fnFetchFields, true);
		this.refreshFields();
		return this;
	};

	/**
	 * Fetches all the fields and refreshes the UI.
	 *
	 * @public
	 */
	FieldsUI.prototype.refreshFields = function() {
		var aSelectedFields = [];
		var aAvailableFields = [];
		var aAllFields = this.getFetchFields()() || [];
		aAllFields.forEach(function(mField, iIndex) {
			if (mField.selected) {
				aSelectedFields.push(mField);
			} else {
				aAvailableFields.push(mField);
			}
		});
		aSelectedFields.sort(function(mField1, mField2) {
			return (mField1.position || 0) - (mField2.position || 0);
		});
		aAvailableFields.sort(function(mField1, mField2) {
			return (mField1.label || "").localeCompare(mField2.label || "");
		});
		this._oSelectedModel.setData(aSelectedFields);
		this._oAvailableModel.setData(aAvailableFields);
	};

	/**
	 * Returns selected fields in a visual order.
	 *
	 * @returns {Object[]} Array of selected fields
	 * @public
	 */
	FieldsUI.prototype.getSelectedFields = function() {
		return this._oSelectedModel.getData().slice();
	};

	/**
	 * Returns available fields.
	 *
	 * @returns {Object[]} Array of available fields
	 * @public
	 */
	FieldsUI.prototype.getAvailableFields = function() {
		return this._oAvailableModel.getData().slice();
	};

	/**
	 * Returns selected and available fields.
	 *
	 * @returns {Object[]} Array of selected and available fields
	 * @public
	 */
	FieldsUI.prototype.getAllFields = function() {
		return this.getSelectedFields().concat(this.getAvailableFields());
	};

	FieldsUI.prototype._onAvailableListSearch = function(oEvent) {
		this._oAvailableList.getBinding("items").filter(new Filter("label", "Contains", oEvent.getParameter("newValue")));
	};

	FieldsUI.prototype._onSelectedListSearch = function(oEvent) {
		this._oSelectedList.getBinding("items").filter(new Filter("label", "Contains", oEvent.getParameter("newValue")));
	};

	FieldsUI.prototype._moveItem = function(oItem, iNewIndex) {
		var aItems = this._oSelectedList.getItems();
		var aSelectedFields = this._oSelectedModel.getData();

		// index of the item in the model not the index in the aggregation
		var iOldIndex = aSelectedFields.indexOf(oItem.getBindingContext().getObject());

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		iNewIndex = aSelectedFields.indexOf(aItems[iNewIndex].getBindingContext().getObject());
		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aSelectedFields.splice(iNewIndex, 0, aSelectedFields.splice(iOldIndex, 1)[0]);
		this._oSelectedModel.setData(aSelectedFields);

		// deselect old index and select the new index
		aItems = this._oSelectedList.getItems();
		aItems[iOldIndex].setSelected(false);
		aItems[iNewIndex].setSelected(true).focus();
	};

	FieldsUI.prototype._moveSelectedItem = function(vNewIndex) {
		var aItems = this._oSelectedList.getItems();
		var oSelectedItem = this._oSelectedList.getSelectedItem();
		var iSelectedIndex = aItems.indexOf(oSelectedItem);
		if (iSelectedIndex < 0) {
			return;
		}

		// determine the new index relative to selected index when "Up" or "Down" is passed as a parameter
		var iNewIndex = (typeof vNewIndex == "number") ? vNewIndex : iSelectedIndex + (vNewIndex == "Up" ? -1 : 1);
		this._moveItem(oSelectedItem, iNewIndex, true);
	};

	FieldsUI.prototype._onMoveTop = function(oEvent) {
		this._moveSelectedItem(0);
	};

	FieldsUI.prototype._onMoveUp = function(oEvent) {
		this._moveSelectedItem("Up");
	};

	FieldsUI.prototype._onMoveDown = function(oEvent) {
		this._moveSelectedItem("Down");
	};

	FieldsUI.prototype._onMoveBottom = function(oEvent) {
		this._moveSelectedItem(this._oSelectedList.getItems().length - 1);
	};

	FieldsUI.prototype._onRearrange = function(oEvent) {
		var oDraggedItem = oEvent.getParameter("draggedControl");
		var oDroppedItem = oEvent.getParameter("droppedControl");
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oSelectedList.indexOfItem(oDraggedItem);
		var iDroppedIndex = this._oSelectedList.indexOfItem(oDroppedItem);
		var iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this._moveItem(oDraggedItem, iActualDroppedIndex);
	};

	FieldsUI.prototype._swapSelectedAndAvailable = function(oSourceList, oTargetList) {
		var aSelectedItems = oSourceList.getSelectedItems();
		if (!aSelectedItems.length) {
			return;
		}

		var oSourceModel = oSourceList.getModel();
		var oTargetModel = oTargetList.getModel();
		var aSourceFields = oSourceModel.getData();
		var aTargetFields = oTargetModel.getData();

		// get all model index of selected items and process in reverse order
		var aSelectedIndexes = aSelectedItems.map(function(oItem) {
			return aSourceFields.indexOf(oItem.getBindingContext().getObject());
		}).sort(function(a, b) {
			return b - a;
		});

		// holds swapped fields to determine what to select after swap is done
		var aSwappedFields = [];

		// update the selected respectively and swap selected indexes
		aSelectedIndexes.forEach(function(iIndex) {
			var mField = aSourceFields.splice(iIndex, 1)[0];
			mField.selected = (oTargetList === this._oSelectedList);
			aSwappedFields.push(mField);
			aTargetFields.push(mField);
		}, this);

		oSourceModel.setData(aSourceFields);
		oTargetModel.setData(aTargetFields);

		// select all swapped items to highlight
		oTargetList.getItems().forEach(function(oItem) {
			if (aSwappedFields.indexOf(oItem.getBindingContext().getObject()) > -1) {
				oItem.setSelected(true);
			}
		});
	};

	FieldsUI.prototype._onMoveToSelected = function(oEvent) {
		this._swapSelectedAndAvailable(this._oAvailableList, this._oSelectedList);
	};

	FieldsUI.prototype._onMoveToAvailable = function(oEvent) {
		this._swapSelectedAndAvailable(this._oSelectedList, this._oAvailableList);
	};

	FieldsUI.prototype._onDragStart = function(oEvent) {
		oEvent.getParameter("target").setSelected(true);
	};
	return FieldsUI;

}, /* bExport= */true);
