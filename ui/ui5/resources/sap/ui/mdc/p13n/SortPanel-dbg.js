/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"./BasePanel", "sap/ui/core/Fragment"
], function(BasePanel, Fragment) {
	"use strict";

	/**
	 * Constructor for SortPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.p13n.BasePanel
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.66
	 * @alias sap.ui.mdc.p13n.SortPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortPanel = BasePanel.extend("sap.ui.mdc.p13n.SortPanel", {
		library: "sap.ui.mdc",
		metadata: {},
		init: function() {

			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);

			// Load the template for the SortPanel
			Fragment.load({
				name: "sap.ui.mdc.p13n.SortPanel",
				controller: this
			}).then(function(oSortPanelTemplate) {
				this.setTemplate(oSortPanelTemplate);
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
				this.setPanelColumns([
					oResourceBundle.getText("sort.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION"), oResourceBundle.getText("sort.PERSONALIZATION_DIALOG_COLUMN_SORTORDER")
				]);
			}.bind(this));
		},
		renderer: {}
	});

	SortPanel.prototype.onChangeOfSortOrder = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		// Fire event only for valid selection
		if (oSelectedItem) {
			this.fireChange();
		}
	};

	return SortPanel;

}, /* bExport= */true);
