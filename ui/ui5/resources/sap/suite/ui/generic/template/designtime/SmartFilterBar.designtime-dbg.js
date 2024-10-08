sap.ui.define([
		"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils",
		"sap/suite/ui/generic/template/designtime/library.designtime"
	],
	function (Utils, DesigntimeUtils) {
		"use strict";

		var SELECTIONFIELDS = "com.sap.vocabularies.UI.v1.SelectionFields";
		var oResourceBundle = sap.ui.getCore().getModel("i18nDesigntime").getResourceBundle();

		/**
		 * Gets the propagated and redefined designtime for a sap.ui.comp.smartfilterbar.SmartFilterBar element, as presented in a list report.
		 *
		 * @param {object} oElement The current UI element which must me sap.ui.comp.smartfilterbar.SmartFilterBar
		 * @returns {object} designtime metadata, with embedded functions
		 * @public
		 */
		return {
			'default': {},   // default scope: take original definitions from (smart) controls
			'strict': {      // scope = strict UX compatibility for Fiori Elements
				name: {
					singular: function() {
						return oResourceBundle.getText("FE_FILTERBAR");
					}
				},
				actions: null,
				aggregations: {
					filterItems: {
						ignore: true
					},
					controlConfiguration: {
						ignore: true
					},
					filterGroupItems:  {
						ignore: true
					},
					groupConfiguration: {
						ignore: true
					},
					content: {
						ignore: false,

						propagateRelevantContainer : true,

						propagateMetadata: function (oElement) {
							switch (oElement.getMetadata().getElementName()) {

								case "sap.m.Panel":
								case "sap.ui.layout.form.Form":
								case "sap.m.ToolbarSeparator":
								case "sap.m.ToolbarSpacer":
								case "sap.ui.comp.smartfilterbar.ControlConfiguration":
									return {
										properties: function(oElement) {
											return DesigntimeUtils.ignoreAllProperties(oElement);
										},
										actions: null
									};
								case "sap.m.MultiComboBox":
								case "sap.m.Select":
									return {
										properties: function(oElement) {
											return DesigntimeUtils.ignoreAllProperties(oElement);
										},
										aggregations: {
											items: {
												ignore: true
											}
										}
									};

								case "sap.m.MultiInput":
									return {
										properties: function(oElement) {
											return DesigntimeUtils.ignoreAllProperties(oElement);
										},
										aggregations: {
											suggestionItems: {
												ignore: true
											},
											suggestionColumns: {
												ignore: true
											},
											suggestionRows: {
												ignore: true
											},
											tokens: {
												ignore: true
											}
										}
									};

								case "sap.ui.layout.AlignedFlowLayout":
									return {
										name: {
											singular: function() {
												return oResourceBundle.getText("FE_SELECTIONFIELD");
											},
											plural: function() {
												return oResourceBundle.getText("FE_SELECTIONFIELDS");
											}
										},
										properties: function(oElement) {
											return DesigntimeUtils.ignoreAllProperties(oElement);
										},
										aggregations: {
											content: {
												domRef: ":sap-domref",
												actions: {
													move: "moveFilterItems"
												}
											}
										},
										getStableElements: function (oAlignedFlowLayout) {
											// Use the ID of the SmartFilterBar
											var fnFindSmartFilterBar = function(oElement){
												if (oElement.getMetadata().getName() === "sap.ui.comp.smartfilterbar.SmartFilterBar"){
													return oElement;
												} else {
													return fnFindSmartFilterBar(oElement.getParent());
												}
											};
											return [fnFindSmartFilterBar(oAlignedFlowLayout).getId()];
										}
									};
								case "sap.ui.layout.VerticalLayout":
									return {
										getLabel: function (oControl) {
											return oControl.getContent()[0].getText();
										},
										getCommonInstanceData: function(oVerticalLayout) {
											var sTarget,
												oTemplData = Utils.getTemplatingInfo(Utils.getSmartFilterBarControlConfiguration(oVerticalLayout));

											if (oTemplData) {
												var sEntityType = oTemplData.target;
												var oMetaModel = oVerticalLayout.getModel().getMetaModel();
												var oEntityType = oMetaModel.getODataEntityType(sEntityType);
												var sRecordIndex = Utils.getRecordIndexForSelectionField(oVerticalLayout);
												if (oEntityType && sRecordIndex) {
													sTarget = oEntityType.namespace + "." + oEntityType.name + "/" + SELECTIONFIELDS + "/" + sRecordIndex;
												}
											}
											return {
												target: sTarget,
												annotation: SELECTIONFIELDS,
												qualifier: null //for LRP, could play a role on OBJ
											};
										},
										links: {
											guidelines: [{
												href: "/filter-bar/",
												text: function() {
													return oResourceBundle.getText("FE_FILTERBAR_GUIDE");
												}
											}],
											developer: [{
												href: "/topic/609c39a7498541559dbef503c1ffd194.html",
												text: function() {
													return oResourceBundle.getText("FE_GUIDE_FILTERBAR");
												}
											},{
												href: "/api/sap.ui.comp.smartfilterbar.SmartFilterBar/annotations/SelectionFields",
												text: function() {
													return oResourceBundle.getText("FE_API_SMART_FILTER_ANNOTATIONS");
												}
											}]
										},
										aggregations: {
											content: {
												ignore: true
											}
										},
										actions: {
											remove: {
												changeType: "removeFilterItem",
												changeOnRelevantContainer: true
											},
											reveal: {
												changeType: "revealFilterItem",
												changeOnRelevantContainer: true
											}
										},
										properties: function(oElement) {
											return DesigntimeUtils.ignoreAllProperties(oElement);
										},
										annotations: {
											//filterLabelOnProperty: {
											//	namespace: "com.sap.vocabularies.Common.v1",
											//	annotation: "Label",
											//	target: ["Property"],
											//	appliesTo: ["filterItem/label"],
											//	links: {
											//		developer: [ {
											//			href: "/topic/609c39a7498541559dbef503c1ffd194.html",
											//			text: function() {
											//				return oResourceBundle.getText("FE_GUIDE_FILTERBAR");
											//			}
											//		}, {
											//			href: "/api/sap.ui.comp.smartfilterbar.SmartFilterBar/annotations/Label",
											//			text: function() {
											//				return oResourceBundle.getText("FE_API_SMART_TABLE_ANNOTATIONS");
											//			}
											//		}],
											//		guidelines: [{
											//			href: "/filter-bar/",
											//			text: function() {
											//				return oResourceBundle.getText("FE_FILTERBAR_GUIDE");
											//			}
											//		}]
											//	}
											//},
											//filterVisible: {
											//	namespace: "com.sap.vocabularies.Common.v1",
											//	annotation: "FieldControl",
											//	target: ["Property"],
											//	whiteList: {
											//		values: ["Hidden"]
											//	},
											//	defaultValue: "false",
											//	links: {
											//		developer: [ {
											//			href: "/topic/609c39a7498541559dbef503c1ffd194.html",
											//			text: function() {
											//				return oResourceBundle.getText("FE_GUIDE_FILTERBAR");
											//			}
											//		},{
											//			href: "/api/sap.ui.comp.smartfilterbar.SmartFilterBar/annotations/FieldControlType",
											//			text: function() {
											//				return oResourceBundle.getText("FE_API_SMART_FILTER_ANNOTATIONS");
											//			}
											//		}],
											//		guidelines: [{
											//			href: "/filter-bar/",
											//			text: function() {
											//				return oResourceBundle.getText("FE_FILTERBAR_GUIDE");
											//			}
											//		}]
											//	},
											//	appliesTo: ["filterItem/#/visible"]
											//}
											filterRestrictions: {
												ignore: true // must be set on entity set level
											},
											FilterRestrictions: {
												ignore: true // duplicate
											},
											FilterDefaultValue: {
												ignore: true // must be set on property level
											},
											filterExpression: {
												ignore: true
											}
										},
										// Use the ID of the main control in the filter
										getStableElements: function (oVerticalLayout) {
											var oCtrlConf = Utils.getSmartFilterBarControlConfiguration(oVerticalLayout);
											// only consider filters that are coming from annotations (i.e. that are represented by controlConfigurations with dt:annotation)
											if (oCtrlConf
													&& oCtrlConf.data("sap-ui-custom-settings")
													&& oCtrlConf.data("sap-ui-custom-settings")["sap.ui.dt"]
													&& oCtrlConf.data("sap-ui-custom-settings")["sap.ui.dt"].annotation) {
												var aContent = oVerticalLayout.getContent();
												var sId;
												if (aContent.some(function(oElement){
													if (oElement.getMetadata().getName() === "sap.m.Select"
														|| oElement.getMetadata().getName() === "sap.m.MultiComboBox"
														|| oElement.getMetadata().getName() === "sap.m.MultiInput"){
														sId = oElement.getId();
														return true;
													}
												})) {
													return [sId];
												}
											}
										}
									};
								default:
									return {
										actions: null
									};
							}
						},
						childNames: {
							plural: function() {
								return oResourceBundle.getText("FE_SELECTIONFIELDS");
							},
							singular: function() {
								return oResourceBundle.getText("FE_SELECTIONFIELD");
							}
						},
						actions : {
							move : "moveFilterItems",
							addODataProperty: function (oSmartFilterBar) {
								return {
									changeType: "addFilterItem",
									changeOnRelevantContainer: true
								};
							}
						}
					}
				},
				properties: function(oElement) {
					return DesigntimeUtils.ignoreAllProperties(oElement);
				},
				annotations: {
					fieldGroup: { ignore: true }, // only relevant on object page
					filterFacet: { ignore: true }, // not supported by FE
					filterLabelOnLineItem: { ignore: true }, // defined on selection field level
					filterHidden: { ignore: true },  //rather use fieldControlType
					selectionBVariant: { ignore: true },
					selectionFields: { ignore: true }, // defined on content aggregation level
					filterVisible: { ignore: true }, // defined on selection field level
					filterLabelOnProperty: { ignore: true }, // defined on selection field level
					filterRestrictions: { ignore: true }, // target = EntitySet, not supported yet
					valueList: { ignore: true }, // to be defined on BO level
					valueListWithFixedValues: { ignore: true }, // to be defined on BO level
					hidden: { ignore: true }, // to be defined on BO level
					hiddenFilter: { ignore: true }, // to be defined on BO level
					filterExpression: { ignore: true }, // to be defined on BO level
					FilterRestrictions: { ignore: true }, //duplicate
					FilterDefaultValue: { ignore: true } //to be activated along with filterRestrictions
				}
			}
		};
	}
);
