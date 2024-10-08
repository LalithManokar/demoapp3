/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.MetadataDelegate
	 */
	var MetadataDelegate = function() {

	};
	/**
	 * Retrieve the metadata for the current binding context
	 *
	 * @returns {array} and array of property infos for personalization
	 */
	MetadataDelegate.retrieveAllMetadata = function(oModel, sDataPath) {
		return [];
	};
	/**
	 * Returns a control/fragment pointing to the current aggregation for a control
	 */
	MetadataDelegate.retrieveAggregationItem = function (sAggregationName, mMetadata) {
		return null;
	};
	/**
	 * may come for preprocessing note here we have currently no control...
	 *
	 * @param {object} oNode the XMLNode
	 * @param {ICallback} oVisitor the preprocessor callback
	 */
	MetadataDelegate.preConfiguration = function(oNode, oVisitor) {
		return oNode;
	};

	/**
	 * Get futher navigation targets for the field
	 *
	 *
	 * @param {object} oField the field
	 * @returns {array} and array of possible navigation targets
	 */
	MetadataDelegate.getNavigationTargets = function(oField) {
		return [];
	};

	return MetadataDelegate;
});
