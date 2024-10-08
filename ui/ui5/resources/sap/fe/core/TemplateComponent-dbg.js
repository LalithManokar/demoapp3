/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/ui/core/UIComponent"],
	function(UIComponent) {
		"use strict";

		var TemplateComponent = UIComponent.extend("sap.fe.core.TemplateComponent", {
			metadata: {
				properties: {
					/**
					 * OData EntitySet name
					 */
					entitySet: {
						type: "string",
						defaultValue: null
					},
					/**
					 * Map of used OData navigations and its routing targets
					 */
					navigation: {
						type: "object"
					}
				},
				library: "sap.fe"
			},

			// This event is triggered always before a binding is going to be set
			onBeforeBinding: function(oContext, mParameters) {
				return true;
			},

			// This event is triggered always after a binding was set
			onAfterBinding: function(oContext) {
				return true;
			}
		});
		return TemplateComponent;
	},
	/* bExport= */ true
);
