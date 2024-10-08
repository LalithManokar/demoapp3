/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/Control", "sap/m/List", "sap/m/StandardListItem", "sap/m/OverflowToolbar", "sap/m/ToolbarSpacer", "sap/m/Title", "sap/m/Button", "sap/m/SearchField", "sap/m/FlexBox", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/core/dnd/DragDropInfo"
], function(Control, List, StandardListItem, OverflowToolbar, ToolbarSpacer, Title, Button, SearchField, FlexBox, JSONModel, Filter, DragDropInfo) {
	"use strict";

	/**
	 * Constructor for P13n Sortable UI.
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
	 * @alias sap.ui.mdc.p13n.SortableUI
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortableUI = Control.extend("sap.ui.mdc.p13n.SortableUI", {
		library: "sap.ui.mdc",
		metadata: {
			defaultAggregation: "template",
			properties: {
				fetchFields: {
					type: "function"
				},
				title: {
					type: "string",
					defaultValue: ""
				},
				noData: {
					type: "string",
					defaultValue: ""
				},
				multiSelection: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},
		init: function() {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

			this._oList = new List(this.getId() + "-list", {
				growing: true,
				growingThreshold: 50,
				growingScrollToLoad: true,
				mode: "SingleSelectMaster",
				includeItemInSelection: true,
				rememberSelections: false,
				noDataText: this.getNoData(),
				sticky: [
					"HeaderToolbar"
				],
				headerToolbar: new OverflowToolbar({
					content: [
						new Title(this.getId() + "-title", {
							text: this.getTitle()
						})
					].concat(this.getToolbarActions()).concat([
						new SearchField({
							width: "15rem",
							liveChange: [
								this._onSearch, this
							]
						}), new Button({
							icon: "sap-icon://collapse-group",
							tooltip: oRb.getText("sortableui.MOVE_TO_TOP"),
							press: [
								this._onMoveTop, this
							]
						}), new Button({
							icon: "sap-icon://slim-arrow-up",
							tooltip: oRb.getText("sortableui.MOVE_UP"),
							press: [
								this._onMoveUp, this
							]
						}), new Button({
							icon: "sap-icon://slim-arrow-down",
							tooltip: oRb.getText("sortableui.MOVE_DOWN"),
							press: [
								this._onMoveDown, this
							]
						}), new Button({
							icon: "sap-icon://expand-group",
							tooltip: oRb.getText("sortableui.MOVE_TO_BOTTOM"),
							press: [
								this._onMoveBottom, this
							]
						})
					])
				}),
				dragDropConfig: [
					new DragDropInfo({
						sourceAggregation: "items",
						targetAggregation: "items",
						dropPosition: "Between",
						drop: [
							this._onRearrange, this
						],
						dragStart: [
							this._onDragStart, this
						]
					})
				]
			});

			this._oModel = new JSONModel([]);
			this._oList.setModel(this._oModel);
			this.setAggregation("_content", this._oList);
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiMDCSortableUI");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_content"));
			oRm.write("</div>");
		}
	});

	SortableUI.prototype.exit = function() {
		this._oList = null;
		this._oModel.destroy();
		this._oModel = null;
	};

	SortableUI.prototype.getList = function() {
		return this._oList;
	};

	SortableUI.prototype.setTitle = function(sTitle) {
		this.setProperty("title", sTitle, true);
		sap.ui.getCore().byId(this.getId() + "-title").setText(sTitle);
		return this;
	};

	SortableUI.prototype.setNoData = function(sNoData) {
		this.setProperty("noData", sNoData, true);
		this._oList.setNoData(sNoData);
		return this;
	};

	SortableUI.prototype.setMultiSelection = function(bMultiSelection) {
		this.setProperty("multiSelection", bMultiSelection, true);
		this._oList.setMode(this.getMultiSelection() ? "MultiSelect" : "SingleSelectMaster");
		return this;
	};

	SortableUI.prototype.getToolbarActions = function() {
		return [
			new ToolbarSpacer()
		];
	};

	SortableUI.prototype.getDefaultTemplate = function() {
		return new StandardListItem({
			title: "{label}"
		});
	};

	SortableUI.prototype.bindListItems = function(mBindingInfo) {
		this._oList.bindItems(Object.assign({
			path: "/",
			key: "label",
			templateShareable: false,
			template: this.getTemplate() ? this.getTemplate().clone() : this.getDefaultTemplate()
		}, mBindingInfo));
	};

	SortableUI.prototype.setTemplate = function(oTemplate) {
		this.setAggregation("template", oTemplate);
		this.bindListItems();
		return this;
	};

	SortableUI.prototype.setFetchFields = function(fnFetchFields) {
		this.setProperty("fetchFields", fnFetchFields, true);
		this.refreshFields();
		return this;
	};

	/**
	 * Fetches all the fields and refreshes the UI.
	 *
	 * @public
	 */
	SortableUI.prototype.refreshFields = function() {
		var aFields = this.getFetchFields()() || [];

		aFields.sort(function(mField1, mField2) {
			if (mField1.selected && mField2.selected) {
				return (mField1.position || 0) - (mField2.position || 0);
			} else if (mField1.selected) {
				return -1;
			} else if (mField2.selected) {
				return 1;
			}
			return 0;
		});

		this._oModel.setData(aFields);
		if (!this.getTemplate()) {
			this.bindListItems();
		}
	};

	/**
	 * Returns the fields in a visual order.
	 *
	 * @returns {Object[]} Array of selected fields
	 * @public
	 */
	SortableUI.prototype.getFields = function() {
		return this._oModel.getData().slice();
	};

	/**
	 * Returns only the selected fields in a visual order.
	 *
	 * @returns {Object[]} Array of selected fields
	 * @public
	 */
	SortableUI.prototype.getSelectedFields = function() {
		return this._oList.getSelectedItems().map(function(oItem) {
			return oItem.getBindingContext();
		});
	};

	SortableUI.prototype._onSearch = function(oEvent) {
		this._oList.getBinding("items").filter(new Filter("label", "Contains", oEvent.getParameter("newValue")));
	};

	SortableUI.prototype._moveItem = function(oItem, iNewIndex) {
		var aItems = this._oList.getItems();
		var aFields = this._oModel.getData();

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
		this._oModel.setData(aFields);

		// select the new index
		aItems = this._oList.getItems();
		aItems[iNewIndex].setSelected(true).focus();
	};

	SortableUI.prototype._moveSelectedItem = function(vNewIndex) {
		var aItems = this._oList.getItems();
		var oSelectedItem = this._oList.getSelectedItem();
		var iSelectedIndex = aItems.indexOf(oSelectedItem);
		if (iSelectedIndex < 0) {
			return;
		}

		// determine the new index relative to selected index when "Up" or "Down" is passed as a parameter
		var iNewIndex = (typeof vNewIndex == "number") ? vNewIndex : iSelectedIndex + (vNewIndex == "Up" ? -1 : 1);
		this._moveItem(oSelectedItem, iNewIndex, true);
	};

	SortableUI.prototype._onMoveTop = function(oEvent) {
		this._moveSelectedItem(0);
	};

	SortableUI.prototype._onMoveUp = function(oEvent) {
		this._moveSelectedItem("Up");
	};

	SortableUI.prototype._onMoveDown = function(oEvent) {
		this._moveSelectedItem("Down");
	};

	SortableUI.prototype._onMoveBottom = function(oEvent) {
		this._moveSelectedItem(this._oList.getItems().length - 1);
	};

	SortableUI.prototype._onRearrange = function(oEvent) {
		var oDraggedItem = oEvent.getParameter("draggedControl");
		var oDroppedItem = oEvent.getParameter("droppedControl");
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oList.indexOfItem(oDraggedItem);
		var iDroppedIndex = this._oList.indexOfItem(oDroppedItem);
		var iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this._moveItem(oDraggedItem, iActualDroppedIndex);
	};

	SortableUI.prototype._onDragStart = function(oEvent) {
		oEvent.getParameter("target").setSelected(true);
	};

	return SortableUI;

}, /* bExport= */true);
