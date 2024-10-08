/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define([
	"sap/landvisz/library",
	"sap/ui/core/CustomData",
	"sap/ui/commons/Tree"
], function(landviszLibrary, CustomData, Tree) {
	"use strict";

	// shortcut for sap.landvisz.EntityCSSSize
	var EntityCSSSize = landviszLibrary.EntityCSSSize;

	/**
	 * TreeField renderer.
	 * @namespace
	 */
	var TreeFieldRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	TreeFieldRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.landvisz");

		if (!this.initializationDone) {
			oControl.initControls();
			oControl.initializationDone = true;

			// write the HTML into the render manager
			oRm.write("<div");
			oRm.writeControlData(oControl);

			if (oControl.getRenderingSize() == EntityCSSSize.Small)
				oRm.addClass("sapLandVisTreeFieldSmallSize");
			if (oControl.getRenderingSize() == EntityCSSSize.RegularSmall)
				oRm.addClass("sapLandVisTreeFieldRegularSmallSize");
			if (oControl.getRenderingSize() == EntityCSSSize.Regular)
				oRm.addClass("sapLandVisTreeFieldRegularSize");
			if (oControl.getRenderingSize() == EntityCSSSize.Medium)
				oRm.addClass("sapLandVisTreeFieldMediumSize");
			if (oControl.getRenderingSize() == EntityCSSSize.Large)
				oRm.addClass("sapLandVisTreeFieldLargeSize");

			oRm.writeClasses();
			oRm.write(">"); // span element

			// set the data to the
			var modelData = oControl.getTreeModel();
			var array = eval(oControl.getTreeModel());
			oControl.jsonModel.setData(modelData);

			oControl.tree.setShowHeader(false);
			oControl.tree.addStyleClass("landscapetree");
			oControl.tree.setModel(oControl.jsonModel);
			oControl.tree.setHeight("100%");
			oControl.oTreeNodeTemplate.bindProperty("text", "name");
			var customDataTemplate = new CustomData({
				key : "type",
				value : "{type}"
			});
			oControl.oTreeNodeTemplate.addCustomData(customDataTemplate);
			oControl.oTreeNodeTemplate.setExpanded(true);
			oControl.oTreeNodeTemplate.setSelectable(false);
			oControl.oTreeNodeTemplate
			oControl.tree.bindAggregation("nodes", '/' + oControl.getBindingName(),
					oControl.oTreeNodeTemplate);
			this._assignIconSrc(oControl.tree.getNodes());
			oRm.renderControl(oControl.tree);

			oRm.write("</div>");

		}
	};

	TreeFieldRenderer._assignIconSrc = function(nodes) {

		var node;
		var type;
		if (typeof (nodes) == "object") {
			for ( var i = 0; i < nodes.length; i++) {
				node = nodes[i];
				if (node.getNodes().length && node.getNodes().length > 0) {
					type = node.getCustomData()[0].getValue();
					this._setIcon(node, type);
					this._assignIconSrc(node.getNodes());
				} else {
					type = node.getCustomData()[0].getValue();
					this._setIcon(node, type);
				}
			}
		}
	};

	TreeFieldRenderer._setIcon = function(node, type) {

		if (type == "p")
			node.setIcon(sap.ui.resource("sap.landvisz",
					"themes/base/img/landscapeobjects/" + "24x24"
							+ "/Product_enable.png"));
		else if (type == "pv")
			node.setIcon(sap.ui.resource("sap.landvisz",
					"themes/base/img/landscapeobjects/" + "24x24"
							+ "/ProductVersion_enable.png"));
		if (type == "pi")
			node.setIcon(sap.ui.resource("sap.landvisz",
					"themes/base/img/landscapeobjects/" + "24x24"
							+ "/ProductInstance_enable.png"));
		if (type == "ps")
			node.setIcon(sap.ui.resource("sap.landvisz",
					"themes/base/img/landscapeobjects/" + "24x24"
							+ "/ProductSystem_enable.png"));

	};

	return TreeFieldRenderer;

}, /* bExport = */ true);
