/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/m/Image"

],
function(
	jQuery,
	Control,
	Image
	) {

	"use strict";

	var ViewGalleryThumbnail = Image.extend("sap.ui.vk.ViewGalleryThumbnail", /** @lends sap.m.Image.prototype */ {
		metadata: {
			associations: {
				viewGallery: {
					type: "sap.ui.vk.ViewGallery"
				}
			},
			properties: {
				enabled: { type: "boolean", defaultValue: true },
				thumbnailWidth: { type: "sap.ui.core.CSSSize", defaultValue: "5rem" },
				thumbnailHeight: { type: "sap.ui.core.CSSSize", defaultValue: "5rem" },
				source: { type: "string", defaultValue: "" },
				tooltip: { type: "string", defaultValue: "" },
				selected: { type: "boolean", defaultValue: false },
				processing: { type: "boolean", defaultValue: false },
				animated: { type: "boolean", defaultValue: false }
			}
		}
	});

	ViewGalleryThumbnail.prototype.init = function() {

	};

	/*
	 * Returns the responsible gallery control
	 *
	 * @returns {sap.ui.vk.ViewGallery|undefined}
	 * @protected
	 */
	ViewGalleryThumbnail.prototype.getViewGallery = function() {
		var ViewGallery = sap.ui.getCore().byId(this.getAssociation("viewGallery"));
		if (ViewGallery instanceof sap.ui.vk.ViewGallery) {
			return ViewGallery;
		}
	};

	ViewGalleryThumbnail.prototype._getIndex = function() {
		var ViewGallery = this.getViewGallery();
		var index = ViewGallery._viewItems.indexOf(this);

		return index;
	};


	return ViewGalleryThumbnail;
});
