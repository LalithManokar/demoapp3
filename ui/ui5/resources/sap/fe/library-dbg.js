/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

/**
 * @namespace reserved for Fiori Elements
 * @name sap.fe
 * @private
 * @experimental
 */

/**
 * Initialization Code and shared classes of library sap.fe
 */
sap.ui.define(
	[
		"sap/fe/services/TemplatedViewServiceFactory",
		"sap/fe/services/ResourceModelServiceFactory",
		"sap/fe/services/CacheHandlerServiceFactory",
		"sap/fe/services/NamedBindingModelServiceFactory",
		"sap/ui/core/service/ServiceFactoryRegistry"
	],
	function(
		TemplatedViewServiceFactory,
		ResourceModelServiceFactory,
		CacheHandlerServiceFactory,
		NamedBindingModelService,
		ServiceFactoryRegistry
	) {
		"use strict";

		/**
		 * Fiori Elements Library
		 *
		 * @namespace
		 * @name sap.fe
		 * @private
		 * @experimental
		 */

		// library dependencies
		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "sap.fe",
			dependencies: ["sap.ui.core"],
			types: ["sap.fe.VariantManagement"],
			interfaces: [],
			controls: [],
			elements: [],
			version: "1.71.2"
		});

		sap.fe.VariantManagement = {
			/**
			 * No variant management at all.
			 * @public
			 */
			None: "None",

			/**
			 * One variant configuration for the whole page.
			 * @public
			 */
			Page: "Page",

			/**
			 * Variant management on control level.
			 * @public
			 */
			Control: "Control"
		};

		ServiceFactoryRegistry.register("sap.fe.services.TemplatedViewService", new TemplatedViewServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.services.ResourceModelService", new ResourceModelServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.services.CacheHandlerService", new CacheHandlerServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.services.NamedBindingModelService", new NamedBindingModelService());

		return sap.fe;
	},
	/* bExport= */ false
);
