/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([], function() {
	"use strict";
	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBarHelper
	 */
	var FilterBarDelegate = {
		/**
		 * Fetches the relevant metadata for the filter bar and returns property info array.
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel - the instance of metadata model
		 * @param {string} sEntitySet - the name of the entity set
		 * @returns {Promise} once resolved an array of property info is returned
		 */
		fetchProperties: function(oModel, sEntitySet) {
			return Promise.resolve([]);
		},

		/**
		 * Creates the Filter for the specified property info and FilterBar
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @param {Object} oFilterBar - the instance of MDC base filterbar
		 * @returns {sap.ui.mdc.FilterField} instance of filter field
		 */
		createFilter: function(oPropertyInfo, oFilterBar) {
			return Promise.resolve(oFilterBar.createFilterField(oPropertyInfo));
		}
	};
	return FilterBarDelegate;
}, /* bExport= */false);
