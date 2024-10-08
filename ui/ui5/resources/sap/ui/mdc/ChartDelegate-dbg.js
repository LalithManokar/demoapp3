/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the chart/item and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/library"
], function(MDCLib, Object) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.Chart.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.62
	 * @alias sap.ui.mdc.ChartDelegate
	 */
	var ChartDelegate = {};

	/**
	 * An object that represent the result of the chart delegates metadata structure
	 * @object
	 * @private
	 * @since 1.62
	 * @ui5-metamodel This object also will be described in the UI5 (legacy) designtime metamodel
	 */
	ChartDelegate.Metadata = {
		/**
		 * An array containing the items a {@link sap.ui.mdc.Chart} can use to define its content.
		 * Each item it of the structure {@link sap.ui.mdc.ChartDelegate.MetadataProperty} and resolves to either a measure
		 * or a dimension item.
		 */
		items: [],
		/**
		 * An array of the properties the entity set that is used via the {@link sap.ui.mdc.Chart}.
		 * Although being part of the entity not every property results in a chart item only those
		 * properties that support aggregation or grouping
		 */
		properties: [],
		/**
		 * A boolean that corresponds to he sortability of the charts data binding
		 */
		sortable: true,
		/**
		 * A boolean that corresponds to he filterability of the charts data binding
		 */
		filterable: true
	};

	/**
	 * An object that represent the result of the chart delegates metadata item structure
	 * @object
	 * @private
	 * @since 1.62
	 * @ui5-metamodel This object also will be described in the UI5 (legacy) designtime metamodel
	 */
	ChartDelegate.MetadataProperty = {
		/**
		 * The name/path of the property
		 */
		name: "SalesAmount",
		/**
		 * The path to the corresponding object attribute, in the model only evaluated for measures
		 */
		propertyPath: "sumSalesAmount",
		/**
		 * The a string respresenting the UI label of the chart item
		 */
		label: "Total Sales Amount",
		/**
		 * The reference to a textProperty for a property
		 */
		textProperty: null,
		/**
		 * A boolean flag to decide whether the property is sortable
		 */
		sortable: true,
		/**
		 * A string defining the sort direction of the property, possible values are both,asc,desc
		 */
		sortDirection: "both",
		/**
		 * A boolean flag to decide whether the property is filterable
		 */
		filterable: true,
		/**
		 * An array containing allowed filter expressions
		 */
		allowedExpressions: [],
		/**
		 * A boolea flag to decide whether the corresponding property is reflected in one or more chart items
		 */
		inChart: true,
		/**
		 * An arre containing a reference to the chart items derived from this property
		 */
		chartItems: []
	};

	/**
	 * An object that represent the result of the chart delegates metadata item structure
	 * @object
	 * @private
	 * @since 1.62
	 * @ui5-metamodel This object also will be described in the UI5 (legacy) designtime metamodel
	 */
	ChartDelegate.MetadataProperty = {
		/**
		 * The kind of the item see {@link sap.ui.mdc.ChartItemType}
		 */
		kind: "Measure",
		/**
		 * The default role of the item see {@link sap.ui.mdc.ChartItemRoleType}
		 */
		role: "axis1",
		/**
		 * An array of context defining properties (TBD)
		 */
		contextDefiningProperties: [],
		/**
		 * The chart item class name reflecting to the chart aggregation items, [@link sap.ui.mcd.chart.MeasureItem}
		 * and [@link sap.ui.mcd.chart.DimensionItem}
		 */
		className: "sap.ui.mcd.chart.MeasureItem",
		/**
		 * For measures a string corresponding to the aggregation method, e.g. min, max, sum,
		 * average, count, countdistinct, if not set for a measure the measure is a custom aggregate
		 */
		aggregationMethod: "sum",
		/**
		 * A boolean flag indicating whether the aggregation method is the default method
		 */
		"default": true,
		/**
		 *  A boolean flag indicating whether the corresponding chart item as a measure is a custom aggregate
		 */
		custom: false,
		/**
		 * The name of the chart item which for measures coincides with the alias
		 */
		name: "sumSalesAmount",
		/**
		 * The path to the corresponding object attribute, in the model only evaluated for measures
		 */
		propertyPath: "SalesAmount",
		/**
		 * The a string respresenting the UI label of the chart item
		 */
		label: "Total Sales Amount",
		/**
		 * The reference to a textProperty for a chart item, ony used for dimensions
		 */
		textProperty: null,
		/**
		 * A boolean flag to decide whether the chart item is sortable
		 */
		sortable: true,
		/**
		 * A string defining the sort direction of the chart item, possible values are both,asc,desc
		 */
		sortDirection: "both",
		/**
		 * A boolean flag to decide whether the chart item is filterable
		 */
		filterable: true,
		/**
		 * An array containing allowed filter expressions
		 */
		allowedExpressions: []
	};

	/**
	 * Fetches the relevant metadata for the Chart and returns property info array
	 *
	 * @param {Object} oChart - the instance of MDC Chart
	 * @returns {Promise} oPromise of metadata which when resolved results in a (@link sap.ui.mdc.ChartDelegate.Metadata}
	 *
	 */
	ChartDelegate.retrieveAllMetadata = function(oModel, sCollectionPath) {
		var mDefaultResult = {
			properties: [],
			attributes: [],
			sortable: true,
			filterable: true
		};

		return new Promise(function(resolve) {
			resolve(mDefaultResult);
		});
	};

	/**
	 * Fetches the metadata properties that can be used as items for the chart
	 *
	 * @param oModel the model of the charts entity set
	 * @param sEntitySetPath the path to the entity set
	 * @return {Promise<Array>} a promise that when resolved
	 * 			results in an array of (@link sap.ui.mdc.ChartDelegate.MetadataProperty}
	 */
	ChartDelegate.fetchProperties = function(oModel, sCollectionPath) {
		return ChartDelegate.retrieveAllMetadata(oModel, sCollectionPath).then(function(mMetadata) {
			return mMetadata.properties;
		});
	};

	/**
	 * Returns a control/fragment pointing to the current aggregation for a control
	 */
	ChartDelegate.retrieveAggregationItem = function(sAggregationName, mMetadata) {
		var mAggregation = {
			className: "",
			settings: {}
		};

		if (mMetadata.kind == MDCLib.ChartItemType.Dimension) {
			mAggregation.className = "sap.ui.mdc.chart.DimensionItem";
			mAggregation.settings = {
				key: mMetadata.name,
				label: mMetadata.label,
				textProperty: mMetadata.textProperty,
				type: mMetadata.type,
				timeUnit: mMetadata.timeUnit,
				displayText: true,
				criticality: mMetadata.criticality
			};
		} else {
			mAggregation.className = "sap.ui.mdc.chart.MeasureItem";
			mAggregation.settings = {
				key: mMetadata.name,
				propertyPath: mMetadata.propertyPath,
				label: mMetadata.label,
				type: mMetadata.type,
				aggregationMethod: mMetadata.aggregationMethod
			};
		}
		return mAggregation;
	};

	return ChartDelegate;
}, /* bExport= */true);
