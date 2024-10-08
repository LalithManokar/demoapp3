/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides a class for the redlining elements.
sap.ui.define([
	"jquery.sap.global",
	"./RedlineElement",
	"./Redline"
], function(
	jQuery,
	RedlineElement,
	Redline
) {
	"use strict";

	/**
	 * Redline element control for rectangle.
	 *
	 * @class Provides a control for creating rectangle redline elements.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.RedlineElement
	 * @alias sap.ui.vk.RedlineElementRectangle
	 * @since 1.40.0
	 */

	var RedlineElementRectangle = RedlineElement.extend("sap.ui.vk.RedlineElementRectangle", {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				width: {
					type: "float",
					defaultValue: 0.001
				},
				height: {
					type: "float",
					defaultValue: 0.001
				},
				fillColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 0)"
				}
			}
		}
	});

	RedlineElementRectangle.prototype.init = function() {
		RedlineElement.prototype.init.apply(this);
		this._originX = 0;
		this._originY = 0;
	};

	RedlineElementRectangle.prototype.setOriginX = function(originX) {
		this.setProperty("originX", originX);
		this._originX = originX;
	};

	RedlineElementRectangle.prototype.setOriginY = function(originY) {
		this.setProperty("originY", originY);
		this._originY = originY;
	};

	/**
	 * Changes the current width and height of the rectangle redline element with the values passed as parameters.
	 * @param {number} offsetX The value in pixels that will be set as the width for the rectangle redline element.
	 * @param {number} offsetY The value in pixels that will be set as the height for the rectangle redline element.
	 * @returns {sap.ui.vk.RedlineElementRectangle} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineElementRectangle.prototype.edit = function(offsetX, offsetY) {
		var parent = this.getParent(),
			translated = parent._toVirtualSpace(offsetX, offsetY),
			width = translated.x - this._originX,
			height = translated.y - this._originY;

		this.setProperty("originX", width < 0 ? translated.x : this._originX);
		this.setProperty("originY", height < 0 ? translated.y : this._originY);
		this.setWidth(Math.abs(width));
		this.setHeight(Math.abs(height));

		return this;
	};

	/**
	 * Changes the current width and height of the rectangle redline element by a factor which gets passed as parameter.
	 * @param {number} zoomBy The factor to be applied to the current width and height.
	 * @returns {sap.ui.vk.RedlineElementRectangle} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineElementRectangle.prototype.applyZoom = function(zoomBy) {
		this.setProperty("width", this.getWidth() * zoomBy, true);
		this.setProperty("height", this.getHeight() * zoomBy, true);
		return this;
	};

	RedlineElementRectangle.prototype.setWidth = function(width) {
		this.setProperty("width", width, true);
		var domRef = this.getDomRef();
		if (domRef) {
			domRef.setAttribute("width", this.getParent()._toPixelSpace(width));
		}
	};

	RedlineElementRectangle.prototype.setHeight = function(height) {
		this.setProperty("height", height, true);
		var domRef = this.getDomRef();
		if (domRef) {
			domRef.setAttribute("height", this.getParent()._toPixelSpace(height));
		}
	};

	RedlineElementRectangle.prototype.renderElement = function(renderManager, halo) {
		var parent = this.getParent();
		renderManager.write("<rect");
		renderManager.writeElementData(this);
		var origin = parent._toPixelSpace(this.getOriginX(), this.getOriginY());
		renderManager.writeAttribute("x", origin.x);
		renderManager.writeAttribute("y", origin.y);
		renderManager.writeAttribute("width", parent._toPixelSpace(this.getWidth()));
		renderManager.writeAttribute("height", parent._toPixelSpace(this.getHeight()));
		renderManager.writeAttribute("fill", this.getFillColor());
		renderManager.writeAttribute("stroke", this.getStrokeColor());
		renderManager.writeAttribute("stroke-width", this.getStrokeWidth());
		if (this.getStrokeDashArray().length > 0) {
			renderManager.writeAttribute("stroke-dasharray", this.getStrokeDashArray().toString());
		}
		renderManager.writeAttribute("opacity", this.getOpacity());
		if (halo) {
			renderManager.writeAttribute("filter", "url(#halo)");
		}
		renderManager.write("></rect>");
	};

	/**
	 * Exports all the relevant data contained in the rectangle redline element to a JSON object.
	 * @returns {object} Data that can be serialized and later used to restore the rectangle redline element.
	 * @public
	 */
	RedlineElementRectangle.prototype.exportJSON = function() {
		return jQuery.extend(true, RedlineElement.prototype.exportJSON.call(this), {
			type: Redline.ElementType.Rectangle,
			version: 1,
			width: this.getWidth(),
			height: this.getHeight(),
			fillColor: this.getFillColor()
		});
	};

	/**
	 * Imports data from a JSON object into the rectangle redline element.
	 * @param {object} json Relevant data used to restore the rectangle redline element.
	 * @returns {sap.ui.vk.RedlineElementRectangle} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineElementRectangle.prototype.importJSON = function(json) {
		if (json.type === Redline.ElementType.Rectangle) {
			if (json.version === 1) {

				RedlineElement.prototype.importJSON.call(this, json);

				if (json.hasOwnProperty("width")) {
					this.setWidth(json.width);
				}

				if (json.hasOwnProperty("height")) {
					this.setHeight(json.height);
				}

				if (json.hasOwnProperty("fillColor")) {
					this.setFillColor(json.fillColor);
				}

			} else {
				// TO DO error version number
				jQuery.sap.log("wrong version number");
			}
		} else {
			jQuery.sap.log("Redlining JSON import: Wrong element type");
		}

		return this;
	};

	/**
	 * Exports all the relevant data contained in the rectangle redline element to an SVG rect element.
	 * @returns {object} SVG rect element that can be used to restore the rectangle redline element.
	 * @public
	 */
	RedlineElementRectangle.prototype.exportSVG = function() {
		var element = document.createElementNS(Redline.svgNamespace, "rect");

		element.setAttribute("x", this.getOriginX());
		element.setAttribute("y", this.getOriginY());
		element.setAttribute("height", this.getHeight());
		element.setAttribute("width", this.getWidth());
		element.setAttribute("fill", this.getFillColor());
		element.setAttribute("stroke", this.getStrokeColor());
		element.setAttribute("stroke-width", this.getStrokeWidth());
		if (this.getStrokeDashArray().length > 0) {
			element.setAttribute("stroke-dasharray", this.getStrokeDashArray().toString());
		}
		if (this.getOpacity() < 1) {
			element.setAttribute("opacity", this.getOpacity());
		}
		element.setAttribute("data-sap-element-id", this.getElementId());
		element.setAttribute("data-sap-halo", this.getHalo());

		return element;
	};

	/**
	 * Imports data from an SVG rect element into the rectangle redline element.
	 * @param {object} svg SVG rect element used to restore the rectangle redline element.
	 * @returns {sap.ui.vk.RedlineElementRectangle} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineElementRectangle.prototype.importSVG = function(svg) {
		if (svg.tagName === "rect") {
			RedlineElement.prototype.importSVG.call(this, svg);

			if (svg.getAttribute("width")) {
				this.setWidth(parseFloat(svg.getAttribute("width")));
			}

			if (svg.getAttribute("height")) {
				this.setHeight(parseFloat(svg.getAttribute("height")));
			}

			if (svg.getAttribute("fill")) {
				this.setFillColor(svg.getAttribute("fill"));
			}
		} else {
			jQuery.sap.log("Redlining SVG import: Wrong element type");
		}

		return this;
	};

	return RedlineElementRectangle;
});
