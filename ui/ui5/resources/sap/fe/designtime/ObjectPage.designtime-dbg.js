/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
// Provides the Design Time Metadata for the sap.m.Button control if used in table
sap.ui.define(
	["sap/fe/core/CommonUtils"],
	function(CommonUtils) {
		"use strict";
		return {
			actions: {
				settings: {
					"disableEditableObjectPageHeader": {
						name: sap.ui
							.getCore()
							.getLibraryResourceBundle("sap.fe.designtime")
							.getText("OBJECTPAGE_DISABLE_EDITABLE_HEADER"),
						isEnabled: function(oObjectPage) {
							// as long there is a binding on the showHeaderContent the disable action can be called
							// to be checked how this can be checked in a more stable way
							return oObjectPage.getBinding("showHeaderContent") !== undefined;
						},
						handler: function(oObjectPage) {
							return Promise.resolve().then(function() {
								return [
									{
										selectorControl: oObjectPage,
										changeSpecificData: {
											changeType: "disableEditableObjectPageHeader",
											content: false
										}
									}
								];
							});
						}
					},
					"changeObjectPageLayout": {
						name: function(oObjectPage) {
							return sap.ui
								.getCore()
								.getLibraryResourceBundle("sap.fe.designtime")
								.getText(
									"OBJECTPAGE_SET_ICON_TAB_BAR_FOR_LAYOUT",
									oObjectPage.getProperty("useIconTabBar") ? "Disable" : "Enable"
								);
						},
						handler: function(oObjectPage) {
							return Promise.resolve().then(function() {
								return [
									{
										selectorControl: oObjectPage,
										changeSpecificData: {
											changeType: "changeObjectPageLayout",
											content: {
												useIconTabBar: !oObjectPage.getProperty("useIconTabBar")
											}
										}
									}
								];
							});
						}
					},
					"changeRelatedApps": {
						name: function(oObjectPage) {
							var bShowRelatedApps = oObjectPage.data("showRelatedApps");
							var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.designtime");
							return CommonUtils.resolveStringtoBoolean(bShowRelatedApps)
								? oResourceBundle.getText("OBJECTPAGE_DISABLE_RELATED_APPS")
								: oResourceBundle.getText("OBJECTPAGE_ENABLE_RELATED_APPS");
						},
						handler: function(oObjectPage) {
							var bShowRelatedApps = oObjectPage.data("showRelatedApps");
							return Promise.resolve().then(function() {
								return [
									{
										selectorControl: oObjectPage,
										changeSpecificData: {
											changeType: "changeRelatedApps",
											content: {
												showRelatedApps: !CommonUtils.resolveStringtoBoolean(bShowRelatedApps)
											}
										}
									}
								];
							});
						}
					}
				}
			}
		};
	},
	/* bExport= */ false
);
