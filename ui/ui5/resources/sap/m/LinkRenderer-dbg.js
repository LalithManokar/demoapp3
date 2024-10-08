/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

 sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library', "sap/ui/util/defaultLinkTypes"],
	function(Renderer, coreLibrary, defaultLinkTypes) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * Link renderer
	 * @namespace
	 */
	var LinkRenderer = {
			apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	LinkRenderer.render = function(oRm, oControl) {
		var sTextDir = oControl.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oControl.getTextAlign(), sTextDir),
			bShouldHaveOwnLabelledBy = oControl._determineSelfReferencePresence(),
			sRel = defaultLinkTypes(oControl.getRel(), oControl.getTarget()),
			sHref = oControl.getHref(),
			oAccAttributes =  {
				labelledby: bShouldHaveOwnLabelledBy ? {value: oControl.getId(), append: true } : undefined
			},
			bEnabled = oControl.getEnabled();

		// Set a valid non empty value for the href attribute representing that there is no navigation,
		// so we don't confuse the screen readers.
		sHref = sHref && oControl._isHrefValid(sHref) && oControl.getEnabled() ? sHref : "#";

		// Link is rendered as a "<a>" element
		oRm.openStart("a", oControl);

		oRm.class("sapMLnk");
		if (oControl.getSubtle()) {
			oRm.class("sapMLnkSubtle");

			//Add aria-describedby for the SUBTLE announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkSubtleId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkSubtleId;
			}
		}

		if (oControl.getEmphasized()) {
			oRm.class("sapMLnkEmphasized");

			//Add aria-describedby for the EMPHASIZED announcement
			if (oAccAttributes.describedby) {
				oAccAttributes.describedby += " " + oControl._sAriaLinkEmphasizedId;
			} else {
				oAccAttributes.describedby = oControl._sAriaLinkEmphasizedId;
			}
		}

		if (!bEnabled) {
			oRm.class("sapMLnkDsbl");
			oRm.attr("disabled", "true");
			// no need for aria-disabled if a "disabled" attribute is in the DOM
			oAccAttributes.disabled = null;
		}
		oRm.attr("tabindex", oControl._getTabindex());

		if (oControl.getWrapping()) {
			oRm.class("sapMLnkWrapping");
		}

		if (oControl.getTooltip_AsString()) {
			oRm.attr("title", oControl.getTooltip_AsString());
		}

		oRm.attr("href", sHref);

		if (oControl.getTarget()) {
			oRm.attr("target", oControl.getTarget());
		}

		if (sRel) {
			oRm.attr("rel", sRel);
		}

		if (oControl.getWidth()) {
			oRm.style("width", oControl.getWidth());
		} else {
			oRm.class("sapMLnkMaxWidth");
		}

		if (sTextAlign) {
			oRm.style("text-align", sTextAlign);
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		oRm.accessibilityState(oControl, oAccAttributes);
		// opening <a> tag
		oRm.openEnd();

		if (this.writeText) {
			this.writeText(oRm, oControl);
		} else {
			this.renderText(oRm, oControl);
		}

		oRm.close("a");
	};

	/**
	 * Renders the normalized text property.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Link} oControl An object representation of the control that should be rendered.
	 */
	LinkRenderer.renderText = function(oRm, oControl) {
		oRm.text(oControl.getText());
	};

	return LinkRenderer;

 }, /* bExport= */ true);
