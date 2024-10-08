/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["sap/fe/core/CommonUtils"], function(CommonUtils) {
	"use strict";
	var NS_CUSTOMDATA = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";

	return {
		//TODO discuss if it is better to remove the whole button and replace it with the inline create action button
		"disableEditableObjectPageHeader": {
			"changeHandler": {
				applyChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						aSections,
						oHeaderTitle,
						oExpandedHeader,
						oImageBox,
						oRevertData = {};

					// set the header content to always true
					oRevertData.showHeaderContent =
						oModifier.getPropertyBinding(oObjectPageLayout, "showHeaderContent") ||
						oModifier.getProperty(oObjectPageLayout, "showHeaderContent");
					oModifier.setProperty(oObjectPageLayout, "showHeaderContent", true);
					oHeaderTitle = oModifier.getAggregation(oObjectPageLayout, "headerTitle"); //oObjectPageLayout.getAggregation("headerTitle") && oObjectPageLayout.getAggregation("headerTitle").getAggregation("expandedHeading") && oObjectPageLayout.getAggregation("headerTitle").getAggregation("expandedHeading").getItems()[0];
					oExpandedHeader = oHeaderTitle && oModifier.getAggregation(oHeaderTitle, "expandedHeading");
					oImageBox = oExpandedHeader && oModifier.getAggregation(oExpandedHeader, "items")[0];
					if (oImageBox && oModifier.targets === "xmlTree" && oImageBox.nodeName.indexOf("FlexBox") > -1) {
						oModifier.setProperty(oImageBox, "visible", false);
					}
					// search for the editable header content
					aSections = oModifier.getAggregation(oObjectPageLayout, "sections");
					for (var i = 0; i < aSections.length; i++) {
						// currently the editable header content does not have a stable ID
						// therefore we search for the one not having a stable ID - to be changed later
						if (!oModifier.getId(aSections[i]) || oModifier.getId(aSections[i]).indexOf("fe::ops") === -1) {
							// set the editable header content to always hidden
							oRevertData.editabeHeaderContent =
								oModifier.getPropertyBinding(aSections[i], "visible") || oModifier.getProperty(aSections[i], "visible");
							oModifier.setProperty(aSections[i], "visible", false);
						}
					}

					oChange.setRevertData(oRevertData);
				},
				revertChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						aSections,
						oRevertData = oChange.getRevertData();

					// set the header content to the original binding/value
					if (typeof oRevertData.showHeaderContent === "object") {
						oModifier.setPropertyBinding(oObjectPageLayout, "showHeaderContent", oRevertData.showHeaderContent);
					} else {
						oModifier.setProperty(oObjectPageLayout, "showHeaderContent", oRevertData.showHeaderContent);
					}

					// search for the editable header content
					aSections = oModifier.getAggregation(oObjectPageLayout, "sections");
					for (var i = 0; i < aSections.length; i++) {
						// currently the editable header content does not have a stable ID
						// therefore we search for the one not having a stable ID - to be changed later
						if (oModifier.getId(aSections[i]).indexOf("fe::ops") === -1) {
							// set the editable header content to always hidden
							if (typeof oRevertData.editabeHeaderContent === "object") {
								oModifier.setPropertyBinding(aSections[i], "visible", oRevertData.editabeHeaderContent);
							} else {
								oModifier.setProperty(aSections[i], "visible", oRevertData.editabeHeaderContent);
							}
						}
					}
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					//Must exist
				}
			},
			"layers": {
				"CUSTOMER_BASE": false,
				"CUSTOMER": false
			}
		},
		"changeObjectPageLayout": {
			"changeHandler": {
				applyChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						oContent = oChange.getContent(),
						oRevertData = {};

					// set the useIconTabBar to the opposite of curret value
					oRevertData.useIconTabBar = oModifier.getProperty(oObjectPageLayout, "useIconTabBar");
					oModifier.setProperty(oObjectPageLayout, "useIconTabBar", oContent.useIconTabBar);
					oChange.setRevertData(oRevertData);
				},
				revertChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						oRevertData = oChange.getRevertData();

					// set the useIconTabBar to the original value
					oModifier.setProperty(oObjectPageLayout, "useIconTabBar", oRevertData.useIconTabBar);
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					//Must exist
				}
			},
			"layers": {
				"CUSTOMER_BASE": false,
				"CUSTOMER": false
			}
		},
		"changeRelatedApps": {
			"changeHandler": {
				applyChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						oContent = oChange.getContent(),
						oRevertData = {};

					var bIsRelatedApps = CommonUtils.resolveStringtoBoolean(oContent.showRelatedApps);

					if (oModifier.targets === "xmlTree") {
						oObjectPageLayout.setAttributeNS(NS_CUSTOMDATA, "showRelatedApps", bIsRelatedApps);
					} else {
						if (bIsRelatedApps) {
							// Update the related apps details and the visibility of button
							CommonUtils.updateRelatedAppsDetails(oObjectPageLayout);
						} else {
							// Code to Disable
							oObjectPageLayout.getModel("relatedAppsModel").setProperty("/visibility", false);
						}
						oObjectPageLayout.data("showRelatedApps", bIsRelatedApps);
					}

					oRevertData.showRelatedApps = !bIsRelatedApps;
					oChange.setRevertData(oRevertData);
				},
				revertChange: function(oChange, oObjectPageLayout, mPropertyBag) {
					var oRevertData = oChange.getRevertData();

					var bShowRelatedApps = oRevertData.showRelatedApps;
					// set the showRelatedApps to the original value
					oObjectPageLayout.data("showRelatedApps", bShowRelatedApps);
					oObjectPageLayout
						.getModel("relatedAppsModel")
						.setProperty("/visibility", CommonUtils.resolveStringtoBoolean(bShowRelatedApps));
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					//Must exist
				}
			},
			"layers": {
				"CUSTOMER_BASE": false,
				"CUSTOMER": false
			}
		}
	};
});
