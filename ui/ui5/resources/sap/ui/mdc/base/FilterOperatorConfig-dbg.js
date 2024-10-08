/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
*/
sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Filter",
		"sap/ui/model/ParseException",
		"sap/ui/model/ValidateException",
		"sap/base/Log",
		"sap/base/util/ObjectPath",
		"sap/base/util/merge",
		"./Condition"
	],

	function(
		BaseObject,
		ModelOperator,
		Filter,
		ParseException,
		ValidateException,
		Log,
		ObjectPath,
		merge,
		Condition
	) {
		"use strict";

		/**
		 *
		 * @class Configuration of model-specific filter operators depending on data types.
		 * @extends sap.ui.base.Object
		 *
		 * @author SAP SE
		 * @version 1.71.61
		 * @since 1.48.0
		 * @alias sap.ui.mdc.base.FilterOperatorConfig
		 *
		 * @private
		 * @experimental
		 * @sap-restricted
		 */
		var FilterOperatorConfig = BaseObject.extend("sap.ui.mdc.base.FilterOperatorConfig", /** @lends sap.ui.mdc.base.FilterOperatorConfig.prototype */ {

			/**
			 * Not to be called by applications, just by models
			 * @protected
			 */
			constructor: function() {
				BaseObject.apply(this);

				// use clone of default config map for this instance
				this.mOperators = merge({}, FilterOperatorConfig._mOperators);
				this.mTypes = merge({}, FilterOperatorConfig._mTypes);
				this.mOpsForType = merge({}, FilterOperatorConfig._mOpsForType);
			}
		});




		// base config of types and operators

		sap.ui.model.type.String.extend("sap.ui.model.type.Key", {});

		// default types, operators, and mappings - could be static settings for ALL FilterOperatorConfigs or defined by an extended FilterOperatorConfig for a certain model type

		FilterOperatorConfig._mTypes = {
			// basic
			"base": undefined, // TODO: needed?
			"string": "base",
			"numeric": "base",
			"date": "base",
			"datetime": "base",
			"time": "base",
			"boolean": "base",
			"int": "numeric",
			"float": "numeric",

			// simple
			"sap.ui.model.type.Boolean": "boolean",
			"sap.ui.model.type.Date": "date",
			"sap.ui.model.type.FileSize": "string",
			"sap.ui.model.type.Float": "float",
			"sap.ui.model.type.Integer": "int",
			"sap.ui.model.type.String": "string",
			"sap.ui.model.type.Time": "time",
			"sap.ui.model.type.Unit": "numeric",
			"sap.ui.model.type.Currency": "numeric",
			// odata
			"sap.ui.model.odata.type.Boolean": "boolean",
			"sap.ui.model.odata.type.Byte": "int",
			"sap.ui.model.odata.type.Date": "date",
			"sap.ui.model.odata.type.DateTime": "datetime",
			"sap.ui.model.odata.type.DateTimeOffset": "datetime",
			"sap.ui.model.odata.type.Decimal": "float",
			"sap.ui.model.odata.type.Double": "float",
			"sap.ui.model.odata.type.Single": "float",
			"sap.ui.model.odata.type.Guid": "string",
			"sap.ui.model.odata.type.Int16": "int",
			"sap.ui.model.odata.type.Int32": "int",
			"sap.ui.model.odata.type.Int64": "int",
			"sap.ui.model.odata.type.Raw": "string",
			"sap.ui.model.odata.type.SByte": "int",
			"sap.ui.model.odata.type.String": "string",
			"sap.ui.model.odata.type.Time": "time",
			"sap.ui.model.odata.type.TimeOfDay": "time",
			"sap.ui.model.odata.type.Unit": "numeric",
			"sap.ui.model.odata.type.Currency": "numeric",

			//edm
			"Edm.Boolean": "sap.ui.model.odata.type.Boolean",
			"Edm.Byte": "sap.ui.model.odata.type.Byte",
			"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
			"Edm.DateTime": "sap.ui.model.odata.type.DateTime", // only for V2  constraints: {displayFormat: 'Date' }
			"Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset", //constraints: { V4: true, precision: n }
			"Edm.Decimal": "sap.ui.model.odata.type.Decimal", //constraints: { precision, scale, minimum, maximum, minimumExclusive, maximumExclusive}
			"Edm.Double": "sap.ui.model.odata.type.Double",
			"Edm.Single": "sap.ui.model.odata.type.Single",
			"Edm.Guid": "sap.ui.model.odata.type.Guid",
			"Edm.Int16": "sap.ui.model.odata.type.Int16",
			"Edm.Int32": "sap.ui.model.odata.type.Int32",
			"Edm.Int64": "sap.ui.model.odata.type.Int64",
			//Edm.Raw not supported
			"Edm.SByte": "sap.ui.model.odata.type.SByte",
			"Edm.String": "sap.ui.model.odata.type.String", //constraints: {maxLength, isDigitSequence}
			"Edm.Time": "sap.ui.model.odata.type.Time", // only V2
			"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
		};
		Object.freeze(FilterOperatorConfig._mTypes);

		FilterOperatorConfig._mOpsForType = { // defines operators for types
			"base": {
				operators: ["Contains", "EQ", "BT", "StartsWith", "EndsWith", "LE", "LT", "GE", "GT", "NE"], // all operators are supported
				defaultOperator: "EQ"
			},
			"string": {
				operators: ["EEQ", "Contains", "EQ", "BT", "StartsWith", "EndsWith", "Empty", "NotEmpty", "LE", "LT", "GE", "GT", "NE"], // all operators are supported
				defaultOperator: "Contains"
			},
			"date": {
				operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"]
			},
			"datetime": {
				operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"]
			},
			"numeric": {
				operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"]
			},
			"time": {
				operators: ["EQ", "BT", "LE", "LT", "GE", "GT"]
			},
			"boolean": {
				operators: ["EQ", "NE"]
			}
		};
		Object.freeze(FilterOperatorConfig._mOpsForType);

		FilterOperatorConfig._mOperators = {};




		// translation utils

		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		sap.ui.getCore().attachLocalizationChanged(function() {
			oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		});

		function getText(sKey, sType) {
			var key = sKey + (sType ? "." + sType : ""),
				sText;

			if (oMessageBundle.hasText(key)) {
				sText = oMessageBundle.getText(key);
			} else
			if (sType) {
				sText = oMessageBundle.getText(sKey);
			} else {
				sText = key;
			}
			return sText;
		}




		// Managing different FilterOperatorConfigs


		FilterOperatorConfig._mInstances = {}; // FilterOperatorConfig instances for all model instances needing one will be registered here  TODO: remove on destroy

		FilterOperatorConfig._mClasses = { // Model classes can register their own instances here
			undefined: FilterOperatorConfig // the default if a model type has no specific config registered (and none of its base classes): this base FilterOperatorConfig
		};


		/**
		 * Returns the FilterOperatorConfig for a specific model instance (and creates it lazily if required).
		 *
		 * @param oModel the model for which the filter operator configuration is requested
		 *
		 * @public
		 * @since 1.48
		 */
		FilterOperatorConfig.getFor = function(oModel) {
			var sKey = oModel && oModel.getId();
			var oFOC = FilterOperatorConfig._mInstances[sKey];

			if (!oFOC) {
				var oModelMeta = oModel && oModel.getMetadata();
				var oClass = FilterOperatorConfig._mClasses[oModelMeta && oModelMeta.getName()];
				while (!oClass) {
					oModelMeta = oModelMeta.getParent();
					oClass = FilterOperatorConfig._mClasses[oModelMeta && oModelMeta.getName()]; // try parent class - or use undefined, which returns the base config
				}

				oFOC = new oClass(); // instantiate the config and assign to the model in the map
				FilterOperatorConfig._mInstances[sKey] = oFOC;
			}

			return oFOC;
		};


		/**
		 * Registers a certain type of FilterOperatorConfig for the given model type.
		 * When someone requests the FilterOperatorConfig for a model of the given type, an instance of the config will be created and assigned to the model instance.
		 *
		 * This method may only be called by the model whose type is given as first parameter <code>sModelClassName</code>.
		 *
		 * @param {string} sModelClassName the name of the model class for which the given config should be used
		 * @param {object} oFOC the FilterOperatorConfig class (not an instance) to be used for the given model type
		 *
		 * @protected
		 */
		FilterOperatorConfig.registerFor = function(sModelClassName, oFOC) { // TODO: class or class name? Class name allows lazy require, but leads to async APIs all over the place
			FilterOperatorConfig._mClasses[sModelClassName] = oFOC;
		};



		// Using the configuration


		/**
		 * Gets the config defined for exactly this type, does not go up the type hierarchy.
		 *
		 * @param {string} sType
		 * @param {string} sConfigName
		 * @return {object} the config defined for exactly the given type
		 *
		 * @private
		 */
		FilterOperatorConfig.prototype._getConfig = function(sType, sConfigName) { // no vType support here, because called often
			var oConfig = this.mOpsForType[sType];
			if (oConfig) {
				return oConfig[sConfigName];
			}
		};


		/**
		 * Returns the required configuration, looks up the type hierarchy if required. Result might still be undefined.
		 * @param {string|sap.ui.model.SimpleType} vType
		 * @param {string} sConfigName
		 * @return {object} the config applicable for the given type (defined for this type or a base type)
		 *
		 * @private
		 */
		FilterOperatorConfig.prototype._findConfig = function(vType, sConfigName) {
			if (typeof vType === "object") {
				vType = vType.getMetadata().getName();
			}

			var oConfig;
			while (vType && !(oConfig = this._getConfig(vType, sConfigName))) { // search until we have a type with known operators
				vType = this.getParentType(vType); // go to parent type
			}
			// either vType is undefined because no type in the hierarchy had the config, or oConfig does now have the desired information

			return oConfig; // TODO: return base config if undefined? However, this only makes a difference when a type is not derived from base. Would this be intentional or an error?
		};


		/**
		 * Returns all available operators for the given type; see FilterOperatorConfig.getOperators()
		 *
		 * @param {string|sap.ui.model.SimpleType} vType
		 * @return {string[]} an array with the names of the supported filter operators
		 *
		 * @public
		 */
		FilterOperatorConfig.prototype.getOperatorsForType = function(vType) {
			return this._findConfig(vType, "operators") || [];
		};


		/**
		 * Returns the default operator for the given type
		 *
		 * @param {string|sap.ui.model.SimpleType} vType a type or its name
		 * @return {string} the name of the default filter operator for the given type
		 *
		 * @public
		 */
		FilterOperatorConfig.prototype.getDefaultOperator = function(vType) {
			return this._findConfig(vType, "defaultOperator") || [];
		};


		/**
		 * Returns the possible operators for the given type and (if given) value.
		 *
		 * @param {string|sap.ui.model.SimpleType} vType
		 * @param {string} [sValue] the value entered so far
		 * @return {object[]} the operator objects suitable to the given input string, considering the given type
		 *
		 * @public
		 */
		FilterOperatorConfig.prototype.getMatchingOperators = function(vType, sValue) {
			var aOperators = this.getOperatorsForType(vType);

			return this._getMatchingOperators(aOperators, sValue);
		};


		/**
		 * Returns those of the given operators which match the given value
		 *
		 * @param {string[]} aOperators the names of the operators which should be checked for matching; must be valid for the current type: this function only checks the operator against values
		 * @param {string} sValue the value to check the operators with
		 * @return {object[]} the operator objects suitable to the given input string
		 *
		 * @private
		 */
		FilterOperatorConfig.prototype._getMatchingOperators = function(aOperators, sValue) {
			// TODO: sType will be needed for checking the value content:   "=5" matches the EQ operator, but should only match when type is e.g. number, not for e.g. boolean
			var aResult = [],
				oOperator;

			aOperators.some(function(sOperatorName) {
				oOperator = this.getOperator(sOperatorName);
				if (oOperator && oOperator.test(sValue)) {
					aResult.push(oOperator);
				}
			}.bind(this));

			return aResult;
		};


		// TODO: doc
		FilterOperatorConfig.prototype.addType = function(sType, sBaseType) {
			if (this.mTypes[sType]) {
				// FIXME
				throw new Error("Type already exists: " + sType);
			} else {
				this.mTypes[sType] = sBaseType;
			}
		};

		FilterOperatorConfig.prototype.getParentType = function(sType) {
			return this.mTypes[sType];
		};


		/**
		 * Adds one or more operator(s) (given by name or array of names) to the given type
		 *
		 * @public
		 */
		FilterOperatorConfig.prototype.addOperatorsToType = function(vType, vOperators) {
			var sType = vType;
			if (typeof sType === "object") {
				sType = sType.getMetadata().getName();
			}
			var aOperators = this.getOperatorsForType(vType);

			if (!(typeof vOperators === "string")) { // vOperators is array
				aOperators = aOperators.concat(vOperators);
			} else {
				aOperators.push(vOperators); // vOperators is a plain string
			}

			this.mOpsForType[sType] = this.mOpsForType[sType] || {};
			this.mOpsForType[sType].operators = aOperators;
		};


		/**
		 * Adds a operator to the list of operators
		 * Initially the bDefaultConfiguration is true and the operators are added globally
		 *
		 * @param {object} oOperator the operator configuration object
		 * @param {string} oOperator.name the operator's name
		 * @param {string} oOperator.filterOperator the operator's default filter operator that is created as defined in sap.ui.model.FilterOperator
		 * @param {string} oOperator.tokenParse the string representation of the regular expression that is used to parse the operator by a control
		 *                 within the string, placeholder can refer to the translated tokenText can be used. #tokenText# will refer to the
		 *                 given oOperator.tokenText property if given.
		 * @param {string} oOperator.tokenFormat the string representation of the regular expression that is used to parse the operator by a control
		 *                 within the string, placeholder can refer to the translated tokenText can be used. #tokenText# will refer to the
		 *                 given oOperator.tokenText property if given.
		 * @param {string[]} oOperator.valueTypes array of type name to be used. The length of the array defines the number of values that
		 *                 need to be entered with the operator.
		//  * @param {string} [oOperator.shortText] string representation of the operator as a short text.
		//  *                If the shortText is not given it will be looked up in the resource bundle of the sap.ui.mdc library by the key
		//  *                operators.{oOperator.name}.shortText
		 * @param {string} [oOperator.longText] string representation of the operator as a long text.
		 *                If the longText is not given it will be looked up in the resource bundle of the sap.ui.mdc library by the key
		 *                operators.{oOperator.name}.longText
		 * @param {string} [oOperator.tokenText] string representation of the operator as a short text.
		 *                If the token Text is not given it will be looked up in the resource bundle of the sap.ui.mdc library by the key
		 *                operators.{oOperator.name}.tokenText
		 */
		FilterOperatorConfig.prototype.addOperator = function(oOperator) {
			FilterOperatorConfig._addOperatorTo(oOperator, this.mOperators);
		};

		/**
		 * @static
		 */
		FilterOperatorConfig._addOperatorTo = function(oOperator, mOperators) {
			var mCurrent = mOperators;
			if (!oOperator.name) {
				Log.warning("Operator configuration expects a name property");
			}
			if (!oOperator.filterOperator && !oOperator.getModelFilter) {
				Log.error("Operator configuration for " + oOperator.name + " needs a default filter operator from sap.ui.model.FilterOperator or the function getModelFilter");
				return;
			}
			if (!bDefaultConfiguration) {
				if (mCurrent[oOperator.name] && !mCurrent[oOperator.name].custom) {
					Log.warning("Duplicate Type Configuration: " + oOperator.name + ". A default type cannot be extended or overwritten.");
					return;
				}
				oOperator.custom = true;
			} else {
				Log.debug("Operator Configuration for " + oOperator.name + " defined as default configuration");
			}
			oOperator = extendOperator(oOperator);
			if (bDefaultConfiguration) {
				//freeze the default operators for changes
				// not possible because we need to add context later?!?  TODO          Object.freeze(oOperator);
			}
			mOperators[oOperator.name] = oOperator;
		};


		//private function for configuration
		//enhance the operators from the configuration, create regexps and load texts
		function extendOperator(oObj) {
			var i;
			var sTextKey = oObj.textKey || "operators." + oObj.name;
			// oObj.shortText = oObj.shortText || getText(sTextKey + ".shortText") || "";
			oObj.longText = oObj.longText || getText(sTextKey + ".longText") || "";
			oObj.tokenText = oObj.tokenText || getText(sTextKey + ".tokenText") || "";

			// create token parsing RegExp
			if (oObj.tokenParse) {
				if (oObj.tokenText) {
					oObj.tokenParse = oObj.tokenParse.replace(/#tokenText#/g, oObj.tokenText);
					var iCount = oObj.valueTypes.length;
					for (i = 0; i < iCount; i++) {
						var sReplace = oObj.paramTypes ? oObj.paramTypes[i] : oObj.valueTypes[i];
						oObj.tokenParse = oObj.tokenParse.replace(new RegExp("\\$" + i, "g"), sReplace);
					}
					oObj.tokenParseRegExp = new RegExp(oObj.tokenParse, "i");
				}
			} else if (oObj.tokenText) {
				oObj.tokenParseRegExp = new RegExp(oObj.tokenText, "i"); // operator without value
			}

			// create token formatter
			if (oObj.tokenFormat) {
				if (oObj.tokenText) {
					oObj.tokenFormat = oObj.tokenFormat.replace(/\#tokenText\#/g, oObj.tokenText);
				}
			} else if (oObj.tokenText) {
				oObj.tokenFormat = oObj.tokenText; // static operator with no value (e.g. "THIS YEAR")
			}
			oObj.format = oObj.format || formatOperator.bind(oObj);
			oObj.parse = oObj.parse || parseOperator.bind(oObj);
			oObj.validate = oObj.validate || validateOperator.bind(oObj);
			oObj.test = oObj.test || testOperator.bind(oObj);
			oObj.getCondition = oObj.getCondition || getOperatorCondition.bind(oObj);
			oObj.getModelFilter = oObj.getModelFilter || getModelFilterObject.bind(oObj);
			oObj._setOwner = setOwnerForOperator.bind(oObj);
			oObj.getTypeText = getText.bind(oObj);
			oObj._createLocalType = _createLocalType.bind(oObj);
			oObj.isEmpty = oObj.isEmpty || _isEmpty.bind(oObj);
			oObj.createControl = oObj.createControl;

			//more enhancements to be done...
			return oObj;
		}

		function setOwnerForOperator(oFilterOperatorConfig) { // creates the connection from operator to its FilterOperatorConfig instance (lazily done in getOperator)
			this.oFilterOperatorConfig = oFilterOperatorConfig;
			return this;
		}

		function getModelFilterObject(oCondition, sFieldPath) {
			var oOperator = this.oFilterOperatorConfig.getOperator(oCondition.operator);
			var vValue = oCondition.values[0];
			var oFilter;
			var oFilterUnit;
			var aFieldPaths = sFieldPath.split(",");
			// TODO: CompositeType (Unit/Currency) -> also filter for unit
			if (Array.isArray(vValue) && aFieldPaths.length > 1) {
				vValue = vValue[0];
				sFieldPath = aFieldPaths[0];
				oFilterUnit = new Filter({path: aFieldPaths[1], operator: "EQ", value1: oCondition.values[0][1]});
			}
			if (oFilterUnit && vValue === undefined) {
				// filter only for unit
				oFilter = oFilterUnit;
				oFilterUnit = undefined;
			} else if (oOperator.valueTypes.length == 1) {
				oFilter = new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: vValue });
			} else {
				var vValue2 = oCondition.values[1];
				if (Array.isArray(vValue2) && aFieldPaths.length > 1) {
					vValue2 = vValue2[0];
					// use same unit as for value1
				}
				oFilter = new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: vValue, value2: vValue2 });
			}

			if (oFilterUnit) {
				oFilter = new Filter({ filters: [oFilter, oFilterUnit], and: true });
			}

			return oFilter;
		}

		function _isEmpty(oCondition, oType) {
			var isEmpty = false;
			for (var i = 0; i < this.valueTypes.length; i++) {
				var v = oCondition.values[i];
				if (v === null || v === undefined || v === "") { // empty has to use the oType information
					isEmpty = true;
					break;
				}
			}
			return isEmpty;
		}

		function formatOperator(aValues, oCondition, oType) {
			var sTokenText = this.tokenFormat,
				iCount = this.valueTypes.length;
			for (var i = 0; i < iCount; i++) {
				var v = aValues[i] !== undefined && aValues[i] !== null ? aValues[i] : "";
				if (this.valueTypes[i] !== "self") {
					oType = this._createLocalType(this.valueTypes[i]);
				}
				var sReplace = oType ? oType.formatValue(v, "string") : v;
				sTokenText = sTokenText.replace(new RegExp("\\$" + i, "g"), sReplace);
			}
			return sTokenText;
		}

		function parseOperator(sText, oType) {
			var aMatch = sText.match(this.tokenParseRegExp);
			var aResult; // might remain undefined - if no match
			if (aMatch) {
				aResult = [];
				for (var i = 0; i < this.valueTypes.length; i++) {
					if (this.valueTypes[i] !== "self") {
						oType = this._createLocalType(this.valueTypes[i]);
					}
					try {
						var sValue = aMatch[i + 1];
						var vValue = parseValue.call(this, sValue, oType);
						aResult.push(vValue);
					} catch (err) {
						// Error
						Log.warning(err.message);
						throw err;
					}
				}
			}
			return aResult; // currently returns empty array for operators without values, undefined for no match
		}

		function parseValue(sValue, oType) {

			if (sValue === undefined) {
				return sValue; // as some types running in errors with undefined and in this case there is nothing to parse
			}

			var aCurrentValue;
			if (oType instanceof sap.ui.model.CompositeType && oType._aCurrentValue && oType.getParseWithValues()) {
				aCurrentValue = oType._aCurrentValue;
			}

			var vValue = oType ? oType.parseValue(sValue, "string", aCurrentValue) : sValue;

			if (aCurrentValue && Array.isArray(vValue)) {
				// in case the user only entered a part of the CompositeType, we add the missing parts from aCurrentValue
				// but add only the parts that have entries in array after parsing ( not set one-time parts)
				for (var j = 0; j < vValue.length; j++) {
					if (vValue[j] === undefined) {
						vValue[j] = aCurrentValue[j];
					}
				}
			}

			return vValue;

		}

		function validateOperator(aValues, oType) {

			var iCount = this.valueTypes.length;
			for (var i = 0; i < iCount; i++) {
				var vValue = aValues[i] !== undefined && aValues[i] !== null ? aValues[i] : "";
				if (this.valueTypes[i]) { // do not validate Description in EEQ case
					if (this.valueTypes[i] !== "self") {
						oType = this._createLocalType(this.valueTypes[i]);
					}
					if (oType) {
						oType.validateValue(vValue);
					}
				}
			}

		}

		function _createLocalType(sType) {
			if (!this._oType) {
				sap.ui.requireSync(sType.replace(/\./g, "/"));
				var oTypeClass = ObjectPath.get(sType || "");
				this._oType = new oTypeClass();
			}
			return this._oType;
		}

		function testOperator(sText/*, oType*/) {
			var bMatch = this.tokenParseRegExp.test(sText);
//			if (bMatch && oType) {
//				var aValues = this.parse(sText, oType, sDisplayFormat);
//				bMatch = aValues.length == this.valueTypes.length;
//			}
			return bMatch;
		}

		function getOperatorCondition(sText, oType, sDisplayFormat) {
			if (this.test(sText/*, oType*/)) {
				var aValues = this.parse(sText, oType, sDisplayFormat);
				if (aValues.length == this.valueTypes.length) {
					return Condition.createCondition( this.name, aValues );
				} else {
					throw new ParseException("Parsed value don't meet operator");
				}
			}
			return null;
		}

		/**
		 * Returns the operator object for the given operator name
		 * @param {string} sOperator the name of the operator
		 * @returns {object} the operator object, or undefined if the operator with the requested name does not exist
		 */
		FilterOperatorConfig.prototype.getOperator = function(sOperator) {
			var oOperator = this.mOperators[sOperator];
			return oOperator ? oOperator._setOwner(this) : undefined; // TODO: could also be done when cloning the initial map!
		};





		/**
		 * Initially the bDefaultConfiguration is true and the types are added globally
		 * Types can extend from a base type and will overwrite the default settings
		 */
		/**
		 * Adding default operators
		 *
		 */
		var bDefaultConfiguration = true;

		FilterOperatorConfig._addOperatorTo({
			name: "EEQ",
			showInSuggest: false,
			filterOperator: ModelOperator.EQ,
			tokenParse: "^==([\\s\\S]*)$", // to allow line breaks
			tokenFormat: "$1 ($0)",
			valueTypes: ["self", null],
			longText: "EEQ",
			displayFormats: {
				DescriptionValue: "$1 ($0)",
				ValueDescription: "$0 ($1)",
				Description: "$1",
				Value: "$0"
			},
			format: function(aValues, oContext, oType, sDisplayFormat) {
				sDisplayFormat = sDisplayFormat || "DescriptionValue";
				var iCount = this.valueTypes.length,
					sTokenText = this.displayFormats[sDisplayFormat];
				// if (oContext.description) {
				// 	//TODO workaround to handle the old .description values.
				// 	// Can be removed when the fe is using the aValues for the description
				// 	aValues[1] = oContext.description;
				// 	delete oContext.description;
				// }

				if (!aValues[1]) {
					sTokenText = this.displayFormats["Value"];
					iCount = 1;
				}

				for (var i = 0; i < iCount; i++) {
					var sReplace, vValue = aValues[i];

					if (vValue === null || vValue === undefined) { // support boolean
						vValue = "";
					}

					if (i == 0 && oType && (typeof oType.formatValue === "function")) {
						// only the first value can be formatted. second value is the description string
						sReplace = oType.formatValue(vValue, "string");
					} else {
						sReplace = vValue;
					}

					sTokenText = sReplace == null ? null : sTokenText.replace(new RegExp("\\$" + i, "g"), sReplace);
				}

				return sTokenText;
			},
			parse: function(sText, oType, sDisplayFormat) {
				sDisplayFormat = sDisplayFormat || "DescriptionValue";
				var aMatch = sText.match(this.tokenParseRegExp);
				var aResult; // might remain undefined - if no match
				if (aMatch) {
					try {
						var sValue = aMatch[1];
						aResult = this.splitText(sValue, sDisplayFormat);

						if (aResult.length > 0) {
							aResult[0] = parseValue.call(this, aResult[0], oType);
						}
					} catch (err) {
						// Error
						Log.warning(err.message);
						throw err;
					}
				}
				return aResult; // currently returns empty array for operators without values, undefined for no match
			},
			splitText: function(sText, sDisplayFormat) { // TODO: function available only for EEQ operator? - to be reused from field for suggestion
				sDisplayFormat = sDisplayFormat || "DescriptionValue";
				var sTokenText = this.displayFormats[sDisplayFormat];
				var iKeyIndex = sTokenText.indexOf("$0");
				var iDescriptionIndex = sTokenText.indexOf("$1");
				var sKey;
				var sDescription;

				if (iKeyIndex >= 0 && iDescriptionIndex >= 0) {
					// split string
					if (sText.indexOf("(") > 0) {
						var iEnd = sText.length;
						if (sText[iEnd - 1] === ")") {
							iEnd--;
						}
						var sText1 = sText.substring(0, sText.lastIndexOf("("));
						if (sText1[sText1.length - 1] === " ") {
							sText1 = sText1.substring(0, sText1.length - 1);
						}
						var sText2 = sText.substring(sText.lastIndexOf("(") + 1, iEnd);
						if (iKeyIndex < iDescriptionIndex) {
							sKey = sText1;
							sDescription = sText2;
						} else {
							sKey = sText2;
							sDescription = sText1;
						}
					} else if (iKeyIndex < iDescriptionIndex) {
						sKey = sText;
					} else {
						sDescription = sText;
					}
				} else if (iKeyIndex >= 0) {
					// use as key
					sKey = sText;
				} else {
					// use as description
					sDescription = sText;
				}

				return [sKey, sDescription];
			},
			isEmpty: function(oCondition, oType) {
				var isEmpty = false;
				var v = oCondition.values[0];
				if (v === null || v === undefined || v === "") { // empty has to use the oType information
					isEmpty = true;
				}
				return isEmpty;
			}
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "EQ",
			filterOperator: ModelOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "=$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "BT",
			filterOperator: ModelOperator.BT,
			tokenParse: "^(.+)\\.\\.\\.(.+)$", // TODO: does this work?? At least also matches crap like ".....". I guess validation of value types needs to get rid of those.
			tokenFormat: "$0...$1",
			valueTypes: ["self", "self"],
			validate: function(aValues, oType) {
				// in Between 2 Values must be defined
				// TODO: check if one greater than the other?
				if (aValues.length < 2) {
					throw new ValidateException("Between must have two values");
				}
				if (aValues[0] === aValues[1]) {
					throw new ValidateException("Between must have two different values");
				}

				validateOperator.call(this, aValues, oType);

			}
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "LT",
			filterOperator: ModelOperator.LT,
			tokenParse: "^<(.*)$",
			tokenFormat: "<$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "GT",
			filterOperator: ModelOperator.GT,
			tokenParse: "^>(.*)$",
			tokenFormat: ">$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "LE",
			filterOperator: ModelOperator.LE,
			tokenParse: "^<=(.*)$",
			tokenFormat: "<=$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "GE",
			filterOperator: ModelOperator.GE,
			tokenParse: "^>=(.*)$",
			tokenFormat: ">=$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "StartsWith",
			filterOperator: ModelOperator.StartsWith,
			tokenParse: "^([^\*].*)\\*$",
			tokenFormat: "$0*",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "EndsWith",
			filterOperator: ModelOperator.EndsWith,
			tokenParse: "^\\*(.*[^\*])$",
			tokenFormat: "*$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "Contains",
			filterOperator: ModelOperator.Contains,
			tokenParse: "^\\*(.*)\\*$",
			tokenFormat: "*$0*",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		/* TODO
		 *
		FilterOperatorConfig._addOperatorTo({
			name: "ANY",
			filterOperator: ModelOperator.ANY,
			tokenParse: "^#tokenText#(.*)\\*$",
			tokenFormat: "#tokenText#$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "ALL",
			filterOperator: ModelOperator.ALL,
			tokenParse: "^#tokenText#(.*)$",
			tokenFormat: "#tokenText#$0",
			valueTypes: ["self"]
		}, FilterOperatorConfig._mOperators);
		*/

		FilterOperatorConfig._addOperatorTo({
			name: "NE",
			filterOperator: ModelOperator.NE,
			tokenParse: "^!=(.+)$",
			tokenFormat: "!=$0",
			valueTypes: ["self"],
			exclude: true
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "Empty",
			filterOperator: ModelOperator.EQ,
			tokenParse: "^<#tokenText#>$",
			tokenFormat: "<#tokenText#>",
			valueTypes: [],
			getModelFilter: function(oCondition, sFieldPath) {
				var oOperator = this.oFilterOperatorConfig.getOperator(oCondition.operator);
				return new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: "" });
			}
		}, FilterOperatorConfig._mOperators);

		FilterOperatorConfig._addOperatorTo({
			name: "NotEmpty",
			filterOperator: ModelOperator.NE,
			tokenParse: "^!\\(<empty>\\)$",
			tokenFormat: "!(<empty>)",
			valueTypes: [],
			getModelFilter: function(oCondition, sFieldPath) {
				var oOperator = this.oFilterOperatorConfig.getOperator(oCondition.operator);
				return new Filter({ path: sFieldPath, operator: oOperator.filterOperator, value1: "" });
			}
		}, FilterOperatorConfig._mOperators);

		bDefaultConfiguration = false;

		Object.freeze(FilterOperatorConfig._mOperators); // this is the general operator config, which all instances clone first before doing any custom modification

		return FilterOperatorConfig;
	},
	/* bExport= */
	true);
