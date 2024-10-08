/*
 * !SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/base/ManagedObject', 'sap/ui/mdc/library'
], function (ManagedObject, mdcLibrary) {
	"use strict";

	var FilterExpression = mdcLibrary.FilterExpression;

	// Provides the PropertyInfo class.
	/**
	 * Constructor for a new PropertyInfo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The PropertyInfo for the field/property metadata used within MDC controls, an instance can be created to override the default/metadata
	 *        behavior.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.58
	 * @alias sap.ui.mdc.PropertyInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyInfo = ManagedObject.extend("sap.ui.mdc.PropertyInfo", /** @lends sap.ui.mdc.PropertyInfo.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * Defines the name/path of the property, has to be always filled. If there is no path additionally specified, the name is used as the
					 * path to the property.
					 */
					name: {
						type: "string",
						defaultValue: null
					},
					/*
					 * Optionally a path, if the name is not pointing to the property from which data can be retrieved. //TODO
					 */
					path: {
						type: "string",
						defaultValue: null
					},

					label: {
						type: "string",
						defaultValue: null
					},

					type: {
						type: "string",
						defaultValue: "string"
					},
					/**
					 * TODO: Fill this from Adapter once it is available. Not sure how this can be structured (E.g. maxLength and other constraints)
					 */
					constraints: {
						type: "object",
						defaultValue: null
					},
					/*
					 * @since 1.66.0
					 */
					formatOptions: {
						type: "object",
						defaultValue: null
					},

					sortable: {
						type: "boolean",
						defaultValue: true
					},

					filterable: {
						type: "boolean",
						defaultValue: true
					},

					// Maps to maxCondition; "com.sap.vocabularies.Common.v1.FilterExpressionType/SingleInterval/MultiValue/SingleValue"
					/*
					 * @since 1.61.0
					 */
					filterExpression: {
						type: "sap.ui.mdc.FilterExpression",
						defaultValue: FilterExpression.Multi
					},

					/*
					 * Indicates if the mandatory.
					 * @since 1.61.0
					 */
					required: {
						type: "boolean",
						defaultValue: false
					},

					/*
					 * @since 1.61.0
					 */
					tooltip: {
						type: "string",
						defaultValue: null
					},

					/*
					 * Contains the conditions.
					 * @since 1.61.0
					 */
					filterConditions: {
						type: "object[]",
						group: "Data",
						defaultValue: []
					},

					/*
					 * Contains the default condition.
					 * @since 1.61.0
					 */
					defaultFilterConditions: {
						type: "object[]",
						group: "Data",
						defaultValue: []
					},

					/*
					 * Indicates if the corresponding filter item is hidden.
					 * @since 1.61.0
					 */
					hiddenFilter: {
						type: "boolean",
						defaultValue: false
					},

					/*
					 * Allows to dynamically switch on/off properties.
					 * @since 1.61.0
					 */
					visible: {
						type: "boolean",
						defaultValue: false
					},

					/*
					 * Indicates, that value help should be considered.
					 * @since 1.61.0
					 */
					hasFieldHelp: {
						type: "boolean",
						defaultValue: false
					},

					/*
					 * Refers to an existing value help.
					 * @since 1.61.0
					 */
					fieldHelp: {
						type: "string",
						defaultValue: null
					}
				}
			}
		});

	return PropertyInfo;

}, true);
