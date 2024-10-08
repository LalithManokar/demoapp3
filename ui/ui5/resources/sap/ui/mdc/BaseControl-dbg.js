/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	/**
	 * The base class for MDC composite controls
	 *
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.Control
	 */
	var BaseControl = Control.extend("sap.ui.mdc.BaseControl", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The width
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%",
					invalidate: true
				},
				/**
				 * The height
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%",
					invalidate: true
				},
				/**
				 * The module path of the metadata DELEGATE
				 */
				metadataDelegate: {
					type: "string",
					group: "Data"
				},
				/**
				 * The personalization
				 */
				personalization: {
					type: "any",
					multiple: false
				}
			}
		},
		renderer: Control.renderer
	});

	BaseControl.prototype.setMetadataDelegate = function(sMetadataDelegateModule) {
		this.oDelegatePromise = new Promise(function(resolve, reject) {
			sap.ui.require([
				sMetadataDelegateModule
			], function(MetadataDelegate) {
				this.DELEGATE = MetadataDelegate;
				resolve(MetadataDelegate);
			}.bind(this), function() {
				reject("Module not found control is not ready to use");
			});
		}.bind(this));

		return this.setProperty("metadataDelegate", sMetadataDelegateModule, true);
	};

	BaseControl.prototype.exit = function() {
	};

	return BaseControl;
}, /* bExport= */true);
