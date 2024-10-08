/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([     "sap/ui/layout/GridData"],
	function(GridData) {
		"use strict";

		/**
		 * @class QuickViewPage renderer.
		 * @static
		 */
		var QuickViewPageEnhanceRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control}
		 *          oQuickView an object representation of the control that should be rendered
		 */
		QuickViewPageEnhanceRenderer.render = function(oRm, oQuickViewPage) {

			var mPageContent = oQuickViewPage.getPageContent();

			oRm.write("<div");
			oRm.addClass("sapMQuickViewPage sapInoMySettingPage");
			oRm.writeControlData(oQuickViewPage);
			oRm.writeClasses();
			oRm.write(">");

			if (mPageContent.header) {
				oRm.renderControl(mPageContent.header);
			}
			if(mPageContent.dimensionForm){
			   var aContents = mPageContent.dimensionForm.getContent();
			   for(var i = 0; i < aContents.length; i++){
			       aContents[i].setLayoutData(new GridData({span:"XL5 L5 M12 S12"}));
			   }
			   oRm.renderControl(mPageContent.dimensionForm);
			}
			oRm.renderControl(mPageContent.form);
			oRm.write("</div>");
		};

		return QuickViewPageEnhanceRenderer;

	}, /* bExport= */ true);
