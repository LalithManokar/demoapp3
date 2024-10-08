/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/mdc/library',
	'./InParameter'
	], function(
			library,
			InParameter
	) {
	"use strict";

	var OutParameterMode = library.OutParameterMode;

	/**
	 * Constructor for a new OutParameter.
	 *
	 * The <code>FieldValueHelp</code> supports out-parameters. The binding to the data is defined in this type
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Base type for <code>InParameter</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.66.0
	 * @alias sap.ui.mdc.base.InParameter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OutParameter = InParameter.extend("sap.ui.mdc.base.OutParameter", /** @lends sap.ui.mdc.base.OutParameter.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Fixed value the OutParameter should be set.
				 *
				 * <b>Note:</b> This property is only used if <code>helpPath</code> is not set.
				 */
				fixedValue: {
					type: "any",
					defaultValue: null
				},
				/**
				 * Update mode of the out-parameter
				 */
				mode: {
					type: "sap.ui.mdc.OutParameterMode",
					defaultValue: OutParameterMode.Always
				}
			},
			defaultProperty: "value"
		}
	});

	return OutParameter;

}, /* bExport= */true);