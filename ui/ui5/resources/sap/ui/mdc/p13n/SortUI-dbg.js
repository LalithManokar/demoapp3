/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./SortableUI",
	"sap/m/Text",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/CustomListItem"
], function(SortableUI, Text, Select, Item, CustomListItem) {
	"use strict";

	/**
	 * Constructor for P13n Sort UI.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.p13n.SortableUI
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.61
	 * @alias sap.ui.mdc.p13n.SortUI
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortUI = SortableUI.extend("sap.ui.mdc.p13n.SortUI", {
		library: "sap.ui.mdc",
		metadata: {
		},
		init: function() {
			SortableUI.prototype.init.apply(this, arguments);

			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			this.setTitle(oRb.getText("sortui.SORT_FIELDS"));
			this.addStyleClass("sapUiMDCSortUI");
			this.setTemplate(new CustomListItem({
				selected: "{selected}",
				content: [
					new Text({
						width: "50%",
						text: "{label}"
					}).addStyleClass("sapUiSmallMarginBegin"),
					new Select({
						selectedKey: "{sortOrder}",
						items: [
							new Item({
								key: "",
								text: oRb.getText("sortui.SORT_NONE")
							}), new Item({
								key: "ascending",
								text: oRb.getText("sortui.SORT_ASCENDING")
							}), new Item({
								key: "descending",
								text: oRb.getText("sortui.SORT_DESCENDING")
							})
						]
					})
				]
			}).addStyleClass("sapMSLI")); // apply CSS of StandardListItem (fixes alignment)
		},
		renderer: {}
	});

	/**
	 * Returns only the sorted fields in a visual order.
	 *
	 * @returns {Object[]} Array of selected fields
	 * @public
	 */
	SortUI.prototype.getSortedFields = function() {
		return this._oModel.getData().slice().filter(function(oField) {
			return oField.sortOrder !== "";
		});
	};

	return SortUI;

}, /* bExport= */true);
