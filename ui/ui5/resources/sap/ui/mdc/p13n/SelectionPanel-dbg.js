/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"./BasePanel", "sap/ui/core/Fragment"
], function(BasePanel, Fragment) {
	"use strict";

	/**
	 * Constructor for SelectionPanel
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
	 * @alias sap.ui.mdc.p13n.SelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionPanel = BasePanel.extend("sap.ui.mdc.p13n.SelectionPanel", {
		library: "sap.ui.mdc",
		metadata: {},
		init: function() {

			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);

			// Load the template for the SelectionPanel
			Fragment.load({
				name: "sap.ui.mdc.p13n.SelectionPanel",
				controller: this
			}).then(function(oSelectionPanelTemplate) {
				this.setTemplate(oSelectionPanelTemplate);
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
				this.setPanelColumns(oResourceBundle.getText("fieldsui.COLUMNS"));
			}.bind(this));
		},
		renderer: {}
	});

	return SelectionPanel;

}, /* bExport= */true);
