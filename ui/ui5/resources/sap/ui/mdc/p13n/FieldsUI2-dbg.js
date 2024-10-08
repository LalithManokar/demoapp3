/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./SortableUI", "sap/m/Text", "sap/m/StandardListItem"
], function(SortableUI, Text, StandardListItem) {
	"use strict";

	/**
	 * Constructor for yet another P13n Field UI.
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
	 * @alias sap.ui.mdc.p13n.FieldsUI2
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldsUI2 = SortableUI.extend("sap.ui.mdc.p13n.SortUI", {
		library: "sap.ui.mdc",
		metadata: {},
		init: function() {
			SortableUI.prototype.init.apply(this, arguments);

			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			this.setTitle(oRb.getText("fieldsui.SELECTED_FIELDS"));
			this.addStyleClass("sapUiMDCFieldsUI");
			this.setMultiSelection(true);
			this.setTemplate(new StandardListItem({
				title: "{label}",
				selected: "{selected}"
			}));
		},
		renderer: {}
	});

	/**
	 * Returns selected fields in a visual order.
	 *
	 * @returns {Object[]} Array of selected fields
	 * @public
	 */
	FieldsUI2.prototype.getSelectedFields = function() {
		var aFields = this._oModel.getData().slice();
		return aFields.filter(function(o) {
			return o.selected;
		});
	};

	return FieldsUI2;
}, /* bExport= */false);
