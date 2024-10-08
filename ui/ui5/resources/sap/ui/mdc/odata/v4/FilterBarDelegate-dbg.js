/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",  "sap/ui/mdc/library", "sap/ui/core/format/DateFormat"
], function (FilterBarDelegate, mdcLib, DateFormat) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.v4.FilterBarDelegate
	 */
	var ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	// TO DO
	var mDefaultTypeForEdmType = {
		"Edm.Boolean": "Bool",
		"Edm.Byte": "Int",
		"Edm.DateTime": "Date",
		"Edm.DateTimeOffset": "DateTimeOffset",
		"Edm.Decimal": "Decimal",
		"Edm.Double": "Float",
		"Edm.Float": "Float",
		"Edm.Guid": "Guid",
		"Edm.Int16": "Int",
		"Edm.Int32": "Int",
		"Edm.Int64": "Int",
		"Edm.SByte": "Int",
		"Edm.Single": "Float",
		"Edm.String": "String",
		"Edm.Time": "TimeOfDay"
	};

	/**
	 * Fetches the relevant metadata for the filter bar and returns property info array
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel - the instance of metadata model
	 * @param {string} sEntitySet - the name of the entity set
	 * @returns {Object} once fullfilled an array of property info is returned
	 */
	ODataFilterBarDelegate.fetchProperties = function (oModel, sEntitySet) {
		var aProperties = [], oObj, oEntityType, sEntitySetPath, oMetaModel;
		var aNonFilterableProps = [], aRequiredProps = [], aSelectionFields = [], mAllowedExpressions = {};
		var sLabel;

		if (sEntitySet) {

			return new Promise(function (resolve) {
				sEntitySetPath = '/' + sEntitySet;
				oMetaModel = oModel.getMetaModel();

				var oAnnotation = oMetaModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
				if (oAnnotation) {

					if (oAnnotation.NonFilterableProperties) {
						oAnnotation.NonFilterableProperties.every(function (oProperty) {
							//return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
							aNonFilterableProps.push(oProperty.$PropertyPath);
							return true;
						});
					}

					if (oAnnotation.RequiredProperties) {
						oAnnotation.RequiredProperties.every(function (oProperty) {
							//return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
							aRequiredProps.push(oProperty.$PropertyPath);
							return true;
						});
					}

					if (oAnnotation.FilterExpressionType) {
						oAnnotation.FilterExpressionType.every(function (oProperty) {
							mAllowedExpressions[oProperty.Property.$PropertyPath] = oProperty.AllowedExpressions;

							//https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#FilterExpressionType
							//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
							return true;
						});
					}
				}

				oAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + "@com.sap.vocabularies.UI.v1.SelectionFields");
				if (oAnnotation) {
					oAnnotation.every(function (oProperty) {
						aSelectionFields.push(oProperty.$PropertyPath);
						return true;
					});
				}


				var bHiddenFilter, oValue, sValue, bRequired, bVisibleInFilterBar, oDefaultValueAnnotation, oProperty, oConstraints, bIsDigitalSequence;

				oEntityType = oMetaModel.getObject(sEntitySetPath + "/");
				for (var sKey in oEntityType) {
					oObj = oEntityType[sKey];
					if (oObj && oObj.$kind === "Property") {

						if (aNonFilterableProps.indexOf(sKey) >= 0) {
							continue;
						}

						if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.UI.v1.Hidden")) {
							continue;
						}

						bHiddenFilter = false;
						if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.UI.v1.HiddenFilter")) {
							bHiddenFilter = true;
						}

						bIsDigitalSequence = false;
						if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.IsDigitSequence")) {
							bIsDigitalSequence = true;
						}

						oValue = null;
						oDefaultValueAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.FilterDefaultValue");
						if (oDefaultValueAnnotation) {
							sValue = oDefaultValueAnnotation["$" + mDefaultTypeForEdmType[oObj.$Type]];
							switch (oObj.$Type) {
								case "Edm.DateTimeOffset": oValue = ODataFilterBarDelegate._parseDateTimeOffset(sValue); break;
								default: oValue = sValue;
							}
						}


						bRequired = (aRequiredProps.indexOf(sKey) >= 0) ? true : false;
						bVisibleInFilterBar = (aSelectionFields.indexOf(sKey) >= 0) ? true : false;

						sLabel = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Label") || sKey;

						if (oObj.$MaxLength || oObj.$Precision || oObj.$Scale || bIsDigitalSequence) {
							oConstraints = {};
							if (oObj.$MaxLength) {
								oConstraints.maxLength = oObj.$MaxLength;
							}
							if (oObj.$Precision) {
								oConstraints.precision = oObj.$Precision;
							}
							if (oObj.$Scale) {
								oConstraints.precision = oObj.$Scale;
							}
							if (bIsDigitalSequence) {
								oConstraints.isDigitSequence = bIsDigitalSequence;
							}
						} else {
							oConstraints = null;
						}


						oProperty = {
							name: sKey,
							label: sLabel,
							type: oObj.$Type,
							required: bRequired,
							hiddenFilter: bHiddenFilter,
							visible: bVisibleInFilterBar
						};
						if (oConstraints) {
							oProperty.constraints = oConstraints;
						}

						if (oValue) {
							oProperty.defaultFilterConditions = [{ fieldPath: sKey, operator: "EQ", values: [oValue] }];
						}

						if (mAllowedExpressions[sKey]) {
							oProperty.filterExpression = mAllowedExpressions[sKey];
						} else {
							oProperty.filterExpression = "auto";  // default
						}

						aProperties.push(oProperty);
					}
				}

				resolve(aProperties);
			});
		} else {
			return Promise.resolve([]);
		}
	};


	ODataFilterBarDelegate._parseDateTimeOffset = function (sDateTimeOffset) {
		var sDateValue = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
			sTimeOfDayValue = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(\\.\\d{1,12})?)?",
			rDateTimeOffset = new RegExp("^" + sDateValue + "T" + sTimeOfDayValue + "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i"),
			oDateTimeOffset, aMatches = rDateTimeOffset.exec(sDateTimeOffset);

		if (aMatches) {
			if (aMatches[1] && aMatches[1].length > 4) {
				// "round" to millis, BEWARE of the dot!
				sDateTimeOffset
					= sDateTimeOffset.replace(aMatches[1], aMatches[1].slice(0, 4));
			}
			oDateTimeOffset = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
				strictParsing: true
			}).parse(sDateTimeOffset.toUpperCase());
		}
		if (!oDateTimeOffset) {
			throw new Error("Not a valid Edm.DateTimeOffset value: " + sDateTimeOffset);
		}
		return oDateTimeOffset;
	};


	return ODataFilterBarDelegate;
}, /* bExport= */false);
