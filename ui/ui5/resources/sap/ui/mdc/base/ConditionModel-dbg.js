/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
		'./ConditionModelPropertyBinding',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/ui/model/ChangeReason',
		'sap/ui/mdc/base/FilterOperatorConfig',
		'sap/base/util/merge',
		'sap/base/util/deepEqual',
		'sap/base/Log',
		'sap/ui/mdc/base/Condition'
	],
	function(
		ConditionModelPropertyBinding,
		JSONModel,
		Filter,
		ChangeReason,
		FilterOperatorConfig,
		merge,
		deepEqual,
		Log,
		Condition
	) {
		"use strict";

		/**
		 *
		 * @class JSON based Model for sap.ui.mdc.FilterField controls. The model stores the entered values as condition objects and applies the conditions to the ListBinding of e.g. a table.
		 * @extends sap.ui.model.json.JSONModel
		 *
		 * @author SAP SE
		 * @version 1.71.61
		 * @since 1.48.0
		 * @alias sap.ui.mdc.base.ConditionModel
		 *
		 * @private
		 * @experimental
		 * @sap-restricted
		 */
		var ConditionModel = JSONModel.extend("sap.ui.mdc.base.ConditionModel", {
			constructor: function() {
				JSONModel.apply(this, arguments);
				this.setSizeLimit(1000);

				this._oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
				sap.ui.getCore().attachLocalizationChanged(function() {
					this._oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
				}.bind(this));

				if (!this.getProperty("/conditions")) { // might already be initialized in the constructor
					this.setProperty("/conditions", {});
				}
				if (!this.getProperty("/fieldPath")) {
					this.setProperty("/fieldPath", {});
				}

				// map to store added FilterField instance
				this._mFieldPath = {};
			}
		});

		ConditionModel.prototype.bindProperty = function(sPath, oContext, mParameters) {

			if (sPath.startsWith("/conditions/")) {
				var sFieldPath = sPath.slice(12);
				this._getFieldPathProperty(sFieldPath); // to initialize FieldPath
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				sPath = "/conditions/" + sFieldPath;
			}

			var oBinding = new ConditionModelPropertyBinding(this, sPath, oContext, mParameters);
			return oBinding;
		};

		ConditionModel.prototype.getContext = function(sPath) {

			if (sPath.startsWith("/conditions/")) {
				var sFieldPath = sPath.slice(12);
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				sPath = "/conditions/" + sFieldPath;
			}

			return JSONModel.prototype.getContext.apply(this, [sPath]);

		};

		ConditionModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
			var oBinding = JSONModel.prototype.bindList.apply(this, arguments);
			oBinding.enableExtendedChangeDetection(true); // to force deep compare of data
			return oBinding;
		};

		ConditionModel._mModels = {};

		ConditionModel.prototype.destroy = function() {
			if (this._oListBinding) {
				delete ConditionModel._mModels[ConditionModel._createKey(this._oListBinding, this._sName)];
				this._oListBinding = undefined;
				this._sName = undefined;
			}

			JSONModel.prototype.destroy.apply(this, arguments);

			delete this._mFieldPath;
			delete this._oMessageBundle;
		};


		/**
		 * creates a clone of the ConditionModel which contains the conditions for the sFieldPath
		 * @param {string} sFieldPath specifies which conditions should be copied into the clone. If not specified all conditions will be copied.
		 * @return {sap.ui.mdc.base.ConditionModel} instance of new ConditionModel
		 * @public
		 */
		ConditionModel.prototype.clone = function(sFieldPath) {
			var oCM = new ConditionModel();

			//TODO the cloned CM get the same _oListBinding, so that the getFilterOperatorConfig() returns the same instance
			//TODO the ListBinding should be removed from the model
			oCM._oListBinding = this._oListBinding;
			oCM._sName = this._sName + "_clone";
			if (sFieldPath === undefined) {
				var aFF = this.getFilterFields();
				if (aFF) {
					aFF.forEach(function(oFF) {
						oCM.addFilterField(oFF);
					}, this);
				}
			} else {
				var oFF = this.getFilterField(sFieldPath);
				if (oFF) {
					oCM.addFilterField(oFF);
				} else {
					Log.error("ConditionModel", "clone of ConditionModel for fieldPath '" + sFieldPath + "' failed!");
					return oCM;
				}
			}

			var oClonedConditions = {};
			if (typeof sFieldPath === "string") {
				var aConditions = this.getConditions(sFieldPath);
				for (var i = 0; i < aConditions.length; i++) {
					var oCondition = aConditions[i];
					var sMyFieldPath = _escapeFieldPath.call(this, sFieldPath);
					if (!oClonedConditions[sMyFieldPath]) {
						oClonedConditions[sMyFieldPath] = [];
					}
					oClonedConditions[sMyFieldPath].push(merge({}, oCondition));
				}
			} else {
				oClonedConditions = merge({}, this.getAllConditions());
			}
			oCM.setConditions(oClonedConditions);

			return oCM;
		};

		/**
		 * merge conditions from the source conditionModel into this instance
		 * @param {string} sFieldPath specifies which conditions should be removed and replaced by the conditions from the source ConditionModel
		 * @param {sap.ui.mdc.base.ConditionModel} oSourceConditionModel source ConditionModel.
		 * @param {string} sSourceFieldPath specifies which conditions from the source should be merged.
		 * @public
		 */
		ConditionModel.prototype.merge = function(sFieldPath, oSourceConditionModel, sSourceFieldPath) {
			this.removeAllConditions(sFieldPath);
			var oSourceConditions = merge({}, oSourceConditionModel.getAllConditions());
			for (var sMyFieldPath in oSourceConditions) {
				if (!( typeof sSourceFieldPath === "string") || sMyFieldPath === sSourceFieldPath) {
					var aCleanedConditions = Condition._removeEmptyConditions(oSourceConditions[sMyFieldPath]);
					for (var i = 0; i < aCleanedConditions.length; i++) {
						var oCondition = aCleanedConditions[i];
						this.addCondition(sMyFieldPath, oCondition);
					}
				}
			}

			this.checkUpdate(true, true);
		};

		/**
		 * @param oListBinding
		 * @param {string} [sName] optinal model name for multiple ConditionModels on the same ListBinding
		 * @return {object} instance of the ConditionModel
		 * @deprecated use new ConditionModel
		 */
		ConditionModel.getFor = function(oListBinding, sName) { // TODO: support sName for multiple models
			var sKey = ConditionModel._createKey(oListBinding, sName);
			var oCM = ConditionModel._mModels[sKey]; // TODO the intenral model map should be removed.

			if (!oCM) {
				oCM = new ConditionModel();
				oCM._oListBinding = oListBinding;
				oCM._sName = sName;
				ConditionModel._mModels[sKey] = oCM;
			} else if (oCM._oListBinding !== oListBinding) {
				// update the oListBinding reverence
				oCM._oListBinding = oListBinding;
				oCM._sName = sName;
			}

			return oCM;
		};

		ConditionModel._createKey = function(oListBinding, sName) {
			if (!oListBinding) {
				return sName;
			}
			return oListBinding.getModel().getId() + "--" + oListBinding.getPath() + "#" + (sName === undefined ? "" : sName);
		};

		/**
		 * @param oListBinding
		 * @param {string} [sName]
		 * @returns {object} instance of the ConditionModel
		 * @deprecated use new ConditionModel and applyFilters(oListBinding)
		 */
		ConditionModel.prototype.setFor = function(oListBinding, sName) {
			delete ConditionModel._mModels[ConditionModel._createKey(this._oListBinding, sName)];
			this._oListBinding = oListBinding;
			this._sName = sName;
			ConditionModel._mModels[ConditionModel._createKey(this._oListBinding, sName)] = this;
			return this;
		};

		/**
		 * @param oConditionModel
		 * @param [sName]
		 * @deprecated use oConditionModel.destroy()
		 */
		ConditionModel.destroyCM = function(oConditionModel, sName) {
			oConditionModel.destroy();
		};

		ConditionModel._getAll = function(oListBinding) {
			var aOverallModels = [];
			var sKey = ConditionModel._createKey(oListBinding);
			sKey = sKey.slice(0, sKey.length - 1);
			for (var model in ConditionModel._mModels) {
				if (model.indexOf(sKey) === 0) {
					var oCM = ConditionModel._mModels[model];
					aOverallModels.push(oCM);
				}
			}

			return aOverallModels;
		};

		ConditionModel._getAllKeys = function(oListBinding) {
			var aOverallModelKeys = [];
			var sKey = ConditionModel._createKey(oListBinding);
			sKey = sKey.slice(0, sKey.length - 1);
			for (var model in ConditionModel._mModels) {
				if (model.indexOf(sKey) === 0) {
					aOverallModelKeys.push(model);
				}
			}

			return aOverallModelKeys;
		};

		/**
		 * Returns conditions for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @return {object[]} array of conditions
		 * @public
		 */
		ConditionModel.prototype.getConditions = function(sFieldPath) {
			//TODO: only works for simple flat condition model content
			return _getConditions.call(this, sFieldPath);
		};

		function _getConditions(sFieldPath, bCreateIfEmpty) {

			var oConditions = this.getProperty("/conditions");
			var aConditions;

			if (typeof sFieldPath == "string") { // to support empty string
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				if (!oConditions[sFieldPath] && bCreateIfEmpty) {
					oConditions[sFieldPath] = [];
				}
				aConditions = oConditions[sFieldPath] || [];
			} else {
				Log.error("ConditionModel", "getConditions without FieldPath is not supported!");
				aConditions = [];
				for (var sMyFieldPath in oConditions) {
					for (var i = 0; i < oConditions[sMyFieldPath].length; i++) {
						var oCondition = oConditions[sMyFieldPath][i];
						aConditions.push(oCondition);
					}
				}
			}

			return aConditions;
		}

		// check if there is at lease one condition in the ConditionModel
		function _hasConditions() {

			var oConditions = this.getProperty("/conditions");

			for (var sMyFieldPath in oConditions) {
				if (oConditions[sMyFieldPath].length > 0) {
					return true;
				}
			}

			return false;

		}

		/**
		 * Returns all conditions.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @return {object} object with array of conditions for each FieldPath
		 * @public
		 */
		ConditionModel.prototype.getAllConditions = function(sFieldPath) {

			var oConditions = this.getProperty("/conditions");
			var oResult = {};

			// use unescaped fieldPath for outside
			for (var sMyFieldPath in oConditions) {
				var oFieldPath = this.getProperty("/fieldPath");
				var oFildPathInfo = oFieldPath[sMyFieldPath]; // to get unescaped fieldPath
				var sFieldPath = oFildPathInfo ? oFildPathInfo.fieldPath : sMyFieldPath;
				oResult[sFieldPath] = merge([], oConditions[sMyFieldPath]);
			}

			return oResult;

		};

		/**
		 * Determines the index of a condition for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {object} oCondition condition to be searched
		 * @return {object} index of condition (-1 if not found)
		 * @public
		 */
		ConditionModel.prototype.indexOf = function(sFieldPath, oCondition) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			var iIndex = -1;
			var aConditions = this.getConditions(sFieldPath);
			var sCondition = JSON.stringify(oCondition, ['operator', 'values']);
			aConditions.some(function(oCondition, i) {
				if (JSON.stringify(oCondition, ['operator', 'values']) === sCondition) {
					iIndex = i;
					return true;
				}
				return false;
			});
			return iIndex;

		};

		ConditionModel.prototype.exist = function(oCondition, sFieldPath) {
			if (typeof sFieldPath === "string") {
				return this.indexOf(sFieldPath, oCondition) >= 0;
			} else {
				throw new Error("sFieldPath must be provided " + this);
			}
		};

		/**
		 * Sets conditions. All already existing conditions will be removed
		 *
		 * @param {object} oConditions object of conditions for corresponding fieldPaths
		 * @return {sap.ui.mdc.base.ConditionModel} Reference to <code>this</code> to allow method chaining.
		 * @public
		 */
		ConditionModel.prototype.setConditions = function(oConditions) {

			var i = 0;
			var oCondition;

			this.setProperty("/conditions", {});

			if (Array.isArray(oConditions)) {
				throw new Error("setConditions with an Array of condition is not supported! " + this);
			} else {
				this._bNoSingleEvent = true;
				for (var sMyFieldPath in oConditions) {
					this._getFieldPathProperty(sMyFieldPath); // to initialize FieldPath
					for (i = 0; i < oConditions[sMyFieldPath].length; i++) {
						oCondition = oConditions[sMyFieldPath][i];
						this.insertCondition(sMyFieldPath, -1, oCondition, true);
					}
					sMyFieldPath = _escapeFieldPath.call(this, sMyFieldPath);
					this.firePropertyChange({ reason: ChangeReason.Add, path: "/conditions/" + sMyFieldPath, context: undefined, value: oConditions[sMyFieldPath] });
				}
				this.checkUpdate(true, true);
				this._bNoSingleEvent = false;
			}

			return this;

		};

		/**
		 * Adds a condition for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {object} oCondition condition to be added
		 * @param {boolean} bForce if set the condition will be added even if it already exist
		 * @return {sap.ui.mdc.base.ConditionModel} Reference to <code>this</code> to allow method chaining.
		 * @public
		 */
		ConditionModel.prototype.addCondition = function(sFieldPath, oCondition, bForce) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}
			return this.insertCondition(sFieldPath, -1, oCondition, bForce);

		};

		/**
		 * Inserts a condition for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {int} iIndex index where the condition should be inserted
		 * @param {object} oCondition condition to be inserted
		 * @param {boolean} bForce if set the condition will be inserted even if it already exist
		 * @return {sap.ui.mdc.base.ConditionModel} Reference to <code>this</code> to allow method chaining.
		 * @public
		 */
		ConditionModel.prototype.insertCondition = function(sFieldPath, iIndex, oCondition, bForce) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			var aConditions;

			this._checkIsEmpty(oCondition);
			this._updateValues(oCondition);
			this._getFieldPathProperty(sFieldPath); // to create if not exist

			if (!bForce) {
				var i = this.indexOf(sFieldPath, oCondition);
				if (i >= 0) {
					return this;
				}
			}

			// add condition to model
			aConditions = _getConditions.call(this, sFieldPath, true);
			if (iIndex == -1) {
				aConditions.push(oCondition);
			} else {
				aConditions.splice(iIndex, 0, oCondition);
			}

			this._checkMaxConditions(sFieldPath);

			if (!this._bNoSingleEvent) {
				this.checkUpdate(true, true);
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				this.firePropertyChange({ reason: ChangeReason.Add, path: "/conditions/" + sFieldPath, context: undefined, value: aConditions });
			}

			return this;
		};

		/**
		 * creates a condition instance for the Item condition
		 *
		 * @param {string} sFieldPath the fieldPath name of the condition
		 * @param {string} sKey the operator for the condition
		 * @param {string} sDescription the description of the operator
		 * @return {object} the new condition object with the given fieldPath, the operator EEQ and the sKey and sDescription as aValues.
		 * @public
		 * @deprecated use the sap.ui.mdc.base.Condition.createItemCondition
		 */
		ConditionModel.prototype.createItemCondition = function(sFieldPath, sKey, sDescription) {
			Log.error("ConditionModel", "createItemCondition is deprecated");
			return Condition.createItemCondition(sKey, sDescription);
		};

		/**
		 * creates a condition instance for the condition model
		 *
		 * @param {string} sFieldPath the fieldPath name of the condition
		 * @param {string} sOperator the operator for the condition
		 * @param {any[]} aValues the array of values for the condition
		 * @return {object} the new condition object with the given fieldPath, operator and values.
		 * @public
		 * @deprecated use the sap.ui.mdc.base.Condition.createCondition
		 */
		ConditionModel.prototype.createCondition = function(sFieldPath, sOperator, aValues) {
			Log.error("ConditionModel", "createCondition is deprecated");
			return Condition.createCondition(sOperator, aValues);
		};

		/**
		 * Removes a condition for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {int | object} vCondition condition or index of the condition
		 * @return {boolean} flag if condition was removed.
		 * @public
		 */
		ConditionModel.prototype.removeCondition = function(sFieldPath, vCondition) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			var iIndex = -1;

			if (typeof vCondition === "object") {
				iIndex = this.indexOf(sFieldPath, vCondition);
			} else if (typeof vCondition === "number") {
				iIndex = vCondition;
			}

			var aConditions = this.getConditions(sFieldPath);
			if (aConditions.length > iIndex) {
				aConditions.splice(iIndex, 1);
				this.checkUpdate(true, true);
				this._checkMaxConditions(sFieldPath);
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				this.firePropertyChange({ reason: ChangeReason.Remove, path: "/conditions/" + sFieldPath, context: undefined, value: aConditions });
				return true;
			}

			return false;

		};

		/**
		 * Removes all conditions for a specified FieldPath.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @return {sap.ui.mdc.base.ConditionModel} Reference to <code>this</code> to allow method chaining.
		 * @public
		 */
		ConditionModel.prototype.removeAllConditions = function(sFieldPath) {

			var oConditions = this.getProperty("/conditions");

			if (typeof sFieldPath === "string") {
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				delete oConditions[sFieldPath];
				this.firePropertyChange({ reason: ChangeReason.Remove, path: "/conditions/" + sFieldPath, context: undefined, value: oConditions[sFieldPath] });
			} else {
				for (var sMyFieldPath in oConditions) {
					delete oConditions[sMyFieldPath];
					sMyFieldPath = _escapeFieldPath.call(this, sMyFieldPath);
					this.firePropertyChange({ reason: ChangeReason.Remove, path: "/conditions/" + sMyFieldPath, context: undefined, value: oConditions[sMyFieldPath] });
				}
			}

			this.checkUpdate(true, true);

			return this;

		};

		/**
		 * Deletes conditions from the condition model based on the context
		 * @param {sap.ui.model.Context|sap.ui.model.Context[]} oContext a single context or array of contexts to delete.
		 * @private
		 */
		ConditionModel.prototype.deleteConditions = function(oContext, oBinding) {
			var sFieldPath;
			if (!oContext || !oBinding) {
				return;
			}
			//normalize oContext
			if (!Array.isArray(oContext)) {
				oContext = [oContext];
			}

			//access the data node for the list binding in the model as reference
			var aData = oBinding.oModel.getProperty(oBinding.getPath(), oBinding.getContext()) || [];

			if (Array.isArray(oContext) && aData.length > 0) {
				//collect the indices from the context of each context
				var aIndices = [],
					fn, i, n;
				if (Array.isArray(aData)) {
					for (i = 0; i < oContext.length; i++) {
						for (var j = 0; j < aData.length; j++) {
							if (deepEqual(aData[j], oContext[i].getProperty())) {
								aIndices.push(j);
								break;
							}
						}
					}
					//in case of array, sort and delete reverse
					aIndices.sort(function(a, b) { return a - b; });
					fn = function(iIndex) {
						sFieldPath = aData[iIndex].fieldPath;
						aData.splice(iIndex, 1); //splice for array
					};
				} else if (typeof aData === "object") {
					for (n in aData) {
						var sIndex = oContext[i].getPath();
						sIndex = sIndex.substring(oContext[i].getPath().lastIndexOf("/") + 1);
						aIndices.push(n);
					}
					fn = function(sIndex) {
						delete aData[sIndex]; //delete for map
					};
				}
				//delete reverse
				for (i = aIndices.length - 1; i > -1; i--) {
					fn(aIndices[i]);
				}
			}
			oBinding.getModel().checkUpdate(true, true);

			this._checkMaxConditions(sFieldPath);
		};

		ConditionModel.prototype._checkIsEmpty = function(aConditions) {
			var oFilterOpConfig = this.getFilterOperatorConfig();

			aConditions = aConditions || this.getConditions();
			Condition.checkIsEmpty(aConditions, oFilterOpConfig);
		};

		ConditionModel.prototype._updateValues = function(aConditions) {
			var oFilterOpConfig = this.getFilterOperatorConfig();

			aConditions = aConditions || this.getConditions();
			Condition.updateValues(aConditions, oFilterOpConfig);
		};

		/**
		 * This function makes a required check for the given sFieldPath (or all).
		 * It only works when the Filterfields are attached to the ConditionModel.
		 * The function is checking that for a required FilterField at least one condition exists.
		 *
		 * @param {boolean} bShowMessage true, when an error message should be shown on the field
		 * @param {string} sFieldPath
		 * @return {boolean} true, if for a sFieldPath the FilterField with required=true no condition exists.
		 *
		 * @private
		 */
		ConditionModel.prototype._checkRequiredConditions = function(bShowMessage, sFieldPath) {
			var aFields = sFieldPath ? [sFieldPath] : Object.keys(this._mFieldPath || {});
			var bError = false;
			var sMsg = this._oMessageBundle.getText("conditionmodel.REQUIRED_CONDITION_MISSING");
			aFields.forEach(function(sFieldPath) {
				if (this._mFieldPath && this._mFieldPath[sFieldPath]) {
					var oFilterField = this._mFieldPath[sFieldPath];
					if (oFilterField.getRequired() && this.getConditions(sFieldPath).length <= 0) {
						if (bShowMessage) {
							this.addFieldPathMessage(sFieldPath, sMsg);
						}
						bError = true;
					} else {
						this.removeFieldPathMessage(sFieldPath, sMsg);
					}
				}
			}, this);

			return !bError;
		};

		/**
		 * This function makes a maxConditions check for the given sFieldPath (or all).
		 * It only works when the Filterfields are attached to the ConditionModel.
		 * The function is checking that for a FilterField the number of conditions is <=maxCondition.
		 *
		 * @param {string} sFieldPath
		 * @return {boolean} true, if for a sFieldPath the number of conditions > the FilterField.getMaxConditions.
		 *
		 * @private
		 */
		ConditionModel.prototype._checkMaxConditions = function(sFieldPath) {
			var aFields = sFieldPath ? [sFieldPath] : Object.keys(this._mFieldPath || {});
			var bError = false;
			var bShowMessage = false; // remove old conditions until # < maxConditions

			if (bShowMessage) {
				var sMsg = this._oMessageBundle.getText("conditionmodel.TOO_MANY_CONDITIONS");
				aFields.forEach(function(sFieldPath) {
					if (this._mFieldPath && this._mFieldPath[sFieldPath]) {
						var oFilterField = this._mFieldPath[sFieldPath];

						if (oFilterField.getMaxConditions() >= 0 && this.getConditions(sFieldPath).length > oFilterField.getMaxConditions()) {
							this.addFieldPathMessage(sFieldPath, sMsg);
							bError = true;
						} else {
							this.removeFieldPathMessage(sFieldPath, sMsg);
						}
					}
				}, this);

			} else { // remove old conditions
				aFields.forEach(function(sFieldPath) {
					if (this._mFieldPath && this._mFieldPath[sFieldPath]) {
						var oFilterField = this._mFieldPath[sFieldPath];
						var aConditions = this.getConditions(sFieldPath);
						var iLenght = 0;
						// TODO: ignore empty conditions????
						for (var i = 0; i < aConditions.length; i++) {
							if (!aConditions[i].isEmpty) {
								iLenght++;
							}
						}

						while (oFilterField.getMaxConditions() >= 0 && iLenght > oFilterField.getMaxConditions()) {
							this.removeCondition(sFieldPath, 0);
							iLenght--;
							bError = false;
						}
					}
				}, this);

			}
			return bError;
		};

		ConditionModel.prototype.addFilterField = function(oFilterField) {
			var sFieldPath = oFilterField.getFieldPath();
			this._mFieldPath[sFieldPath] = oFilterField;

			this._getFieldPathProperty(sFieldPath);
		};

		ConditionModel.prototype.getFilterField = function(sFieldPath) {
			var aFields = Object.keys(this._mFieldPath || {});
			return this._mFieldPath[sFieldPath || aFields[0]];
		};

		ConditionModel.prototype.getFilterFields = function() {
			var aFields = Object.keys(this._mFieldPath || {});
			var aFilterFields = [];
			aFields.forEach(function(sFieldPath) {
				aFilterFields.push(this._mFieldPath[sFieldPath]);
			}, this);
			return aFilterFields;
		};

		ConditionModel.prototype.removeFilterField = function(oFilterField) {
			var sFieldPath = oFilterField.getFieldPath();
			if (this._mFieldPath && this._mFieldPath[sFieldPath]) {
				delete this._mFieldPath[sFieldPath];
			}

			var oFieldPath = this.getProperty("/fieldPath");
			if (oFieldPath && oFieldPath[sFieldPath]) {
				delete oFieldPath[sFieldPath];
			}
		};

		ConditionModel.prototype._getFieldPathProperty = function(sFieldPath) {
			var sEscapedFieldPath = _escapeFieldPath.call(this, sFieldPath);
			var oFieldPath = this.getProperty("/fieldPath");
			if (!oFieldPath[sEscapedFieldPath]) {
				oFieldPath[sEscapedFieldPath] = {
					fieldPath: sFieldPath, // to store unescaped FieldPath (needed for Filter)
					valueState: "None",
					valueStateText: "",
					messages: []
				};
			}

			// create initial conditions array (to have it always for binding)
			var oConditions = this.getProperty("/conditions");
			if (!oConditions[sEscapedFieldPath]) {
				oConditions[sEscapedFieldPath] = [];
			}

			return oFieldPath[sEscapedFieldPath];
		};

		ConditionModel.prototype.addFieldPathMessage = function(sFieldPath, sMsg) {
			var oFieldPath = this._getFieldPathProperty(sFieldPath);

			if (!oFieldPath.messages.some(function(sItem, i) {
					if (sItem === sMsg) {
						return true;
					}
					return false;
				})) {
				oFieldPath.messages.push(sMsg);
			}

			this._updateValueState(sFieldPath);
		};

		ConditionModel.prototype.setUIMessage = function(sFieldPath, sMsg) {
			var oFieldPath = this._getFieldPathProperty(sFieldPath);

			oFieldPath.uiMessage = sMsg;

			this._updateValueState(sFieldPath);
		};

		ConditionModel.prototype.removeFieldPathMessage = function(sFieldPath, sMsg) {
			var iIndex;
			var oFieldPath = this._getFieldPathProperty(sFieldPath);
			if (oFieldPath.messages.some(function(sItem, i) {
					if (sItem === sMsg) {
						iIndex = i;
						return true;
					}
					return false;
				})) {
				oFieldPath.messages.splice(iIndex, 1);
				this._updateValueState(sFieldPath);
			}

		};

		ConditionModel.prototype.removeUIMessage = function(sFieldPath) {
			var oFieldPath = this._getFieldPathProperty(sFieldPath);

			delete oFieldPath.uiMessage;

			this._updateValueState(sFieldPath);
		};

		ConditionModel.prototype._updateValueState = function(sFieldPath) {
			var bUpdate = false,
				oFieldPath = this._getFieldPathProperty(sFieldPath),
				sValueState = "None",
				sValueStateText = "";

			if (oFieldPath.uiMessage) {
				sValueState = "Error";
				sValueStateText = oFieldPath.uiMessage;
			} else if (oFieldPath.messages.length > 0) {
				sValueState = "Error";
				sValueStateText = oFieldPath.messages[oFieldPath.messages.length - 1];
			}

			if (oFieldPath.valueState !== sValueState) {
				oFieldPath.valueState = sValueState;
				bUpdate = true;
			}

			if (oFieldPath.valueStateText !== sValueStateText) {
				oFieldPath.valueStateText = sValueStateText;
				bUpdate = true;
			}

			if (bUpdate) {
				this.checkUpdate(true, true);
			}
		};

		ConditionModel.prototype.isValid = function(bValidate, sFieldPath) {
			var aFields = sFieldPath ? [sFieldPath] : Object.keys(this._mFieldPath || {});
			var bValid = this._checkRequiredConditions(bValidate);
			aFields.forEach(function(sFieldPath) {
				var oFieldPath = this._getFieldPathProperty(sFieldPath);
				bValid = bValid && oFieldPath.valueState == "None";
			}, this);

			return bValid;
		};

		ConditionModel.prototype.applyFilters = function(oListBinding, bValidate, bAll) {
			if (oListBinding === undefined || typeof oListBinding === "boolean") {
				if (typeof oListBinding === "boolean") {
					bAll = bValidate;
					bValidate = oListBinding;
				}
				oListBinding = this._oListBinding;
			}
			if (!oListBinding) {
				Log.error("ConditionModel", "applyFilters without ListBinding can not be applied!");
				return false;
			}

			if (this.isValid(bValidate)) {
				var bHasBeenSuspended = false;

				if (oListBinding.changeParameters){
					if (!oListBinding.isSuspended()) {
						// as we trigger two changes this would result to two requests therefore we suspend the binding
						bHasBeenSuspended = true;
						oListBinding.suspend();
					}

					if (this.getConditions("$search").length) {
						var sValue = this.getConditions("$search")[0].values[0];
						oListBinding.changeParameters({ $search: sValue });
					} else {
						oListBinding.changeParameters({ $search: undefined });
					}
				}

				var oFilter;
				if (bAll) {
					oFilter = this.getAllFilters();
				} else {
					oFilter = this.getFilters();
				}
				if (oFilter) {
					oListBinding.filter(oFilter);
				} else { // no filters
					oListBinding.filter();
				}

				if (bHasBeenSuspended){
					oListBinding.resume();
				}

				if (oFilter) {
					window.console.log("CM-Filter:" + this._prettyPrintFilters(oFilter));
				}

				return true;
			}
			return false;
		};

		ConditionModel.prototype.getAllFilters = function() {
			var aOverallModels = ConditionModel._getAll(this._oListBinding);
			var aOverallFilters = [];
			aOverallModels.forEach(function(oCM) {
				var oFilter = oCM.getFilters();
				if (oFilter) {
					aOverallFilters.push(oFilter);
				}
			});

			var oFilter = null;
			if (aOverallFilters.length === 1) {
				oFilter = aOverallFilters[0]; // could omit this and have an ORed array with only one filter, but it's nice this way.
			} else if (aOverallFilters.length > 1) {
				oFilter = new Filter({ filters: aOverallFilters, and: true });
			}
			return oFilter;
		};

		ConditionModel.prototype._prettyPrintFilters = function(oFilter) {
			var sRes;
			if (!oFilter) {
				return "";
			}
			if (oFilter._bMultiFilter) {
				sRes = "";
				var bAnd = oFilter.bAnd;
				oFilter.aFilters.forEach(function(oFilter, index, aFilters) {
					sRes += this._prettyPrintFilters(oFilter);
					if (aFilters.length - 1 != index) {
						sRes += bAnd ? " and " : " or ";
					}
				}, this);
				return "(" + sRes + ")";
			} else {
				sRes = oFilter.sPath + " " + oFilter.sOperator + " '" + oFilter.oValue1 + "'";
				if (oFilter.sOperator === "BT") {
					sRes += "...'" + oFilter.oValue2 + "'";
				}
				return sRes;
			}
		};

		/**
		 *
		 * @public
		 */
		ConditionModel.prototype.getFilterOperatorConfig = function() {
			var oModel = this._oListBinding && this._oListBinding.getModel();
			return FilterOperatorConfig.getFor(oModel);
		};

		ConditionModel.prototype.getFilters = function(sFieldPath) {
			var i, aLocalFilters, aLocalNEFilters, aOverallFilters = [],
			oConditions,
			oToAnyFilterParam, aSections, sNavPath, sPropertyPath;

			var oFilterOpConfig = this.getFilterOperatorConfig();

			if (sFieldPath === undefined) {
				oConditions = this.getAllConditions();
			} else if (typeof sFieldPath === "string") {
				oConditions = {};
				oConditions[sFieldPath] = this.getConditions(sFieldPath);
			} else {
				oConditions = {};
			}

			var oOperator, oFilter;

			// OR-combine filters for each property
			for (var sMyFieldPath in oConditions) {
				aLocalFilters = [];
				aLocalNEFilters = [];
				oToAnyFilterParam = null;
				var aConditions = oConditions[sMyFieldPath];
				var oFieldPath = this.getProperty("/fieldPath");
				var oFildPathInfo = oFieldPath[sMyFieldPath]; // to get unescaped fieldPath
				var sFilterPath = oFildPathInfo ? oFildPathInfo.fieldPath : sMyFieldPath;

				for (i = 0; i < aConditions.length; i++) {
					// only collect conditions for fieldPath and operator != NE
					oOperator = oFilterOpConfig.getOperator(aConditions[i].operator);
					oFilter = oOperator.getModelFilter(aConditions[i], sFilterPath);

					if (!(oOperator.exclude && aConditions[i].operator === "NE")) {

						if (oFilter.sPath === "$search") {
							//ignore the $search conditions, this condition will be handled on the ListBinding as search parameter (see applyFilters)
							continue;
						}

						// basic search condition handling split the oFilter with sPath == "*xxx,yyy*" into multiple filter
						// e.g. fieldPath "*title,year*" - such fieldPath onlyworks with type  string and an operation with a single value (e.g. contains)
						//TODO this should be removed. Only $search will be supported as sPath. This mapping of a *fieldPath1,FieldPath2* is currently only used on the mockServer
						var $searchfilters = /^\*(.+)\*$/.exec(oFilter.sPath);
						if ($searchfilters) {
							// $search mapping
							var aFieldPath = $searchfilters[1].split(',');
							for (var j = 0; j < aFieldPath.length; j++) {
								aLocalFilters.push(new Filter(aFieldPath[j], oFilter.sOperator, oFilter.oValue1));
							}
							continue;
						}

						// ANY condition handling e.g. fieldPath "navPath*/propertyPath"
						if (oFilter.sPath && oFilter.sPath.indexOf('*/') > -1) {
							aSections = oFilter.sPath.split('*/');
							if (aSections.length === 2) {
								sNavPath = aSections[0];
								sPropertyPath = aSections[1];
								oFilter.sPath = 'L1/' + sPropertyPath;

								if (!oToAnyFilterParam) {
									oToAnyFilterParam = {
											path: sNavPath,
											operator: 'Any',
											variable: 'L1'
									};
								}
								aLocalFilters.push(oFilter);
							} else {
								throw new Error("Not Implemented");
							}
						} else {
							aLocalFilters.push(oFilter);
						}
					}
				}

				//collect all exclude (NE) conditions as AND fieldPath != "value"
				for (i = 0; i < aConditions.length; i++) {
					oOperator = oFilterOpConfig.getOperator(aConditions[i].operator);
					oFilter = oOperator.getModelFilter(aConditions[i], sFilterPath);
					if (oOperator.exclude && aConditions[i].operator === "NE") {
						aLocalNEFilters.push(oFilter);
					}
				}

				if (oToAnyFilterParam) {
					if (aLocalFilters.length === 1) {
						oToAnyFilterParam.condition = aLocalFilters[0];
					} else if (aLocalFilters.length > 1) {
						oToAnyFilterParam.condition = new Filter({ filters: aLocalFilters, and: false });
					}
					aLocalFilters = [new Filter(oToAnyFilterParam)];
				}

				// take the single Filter or combine all with OR
				if (aLocalFilters.length === 1) {
					aOverallFilters.push(aLocalFilters[0]); // could omit this and have an OR-ed array with only one filter, but it's nice this way.
				} else if (aLocalFilters.length > 1) {
					aOverallFilters.push(new Filter({ filters: aLocalFilters, and: false }));
				}

				// merge all NE filter into the Overallfilter, they will be AND added to the result
				if (aLocalNEFilters.length === 1) {
					aOverallFilters.push(aLocalNEFilters[0]); // could omit this and have an OR-ed array with only one filter, but it's nice this way.
				} else if (aLocalNEFilters.length > 1) {
					aOverallFilters = aOverallFilters.merge(aLocalNEFilters);
				}
			}

			// AND-combine filters for different properties and apply filters
			if (aOverallFilters.length === 1) {
				return aOverallFilters[0]; // could omit this and have an ORed array with only one filter, but it's nice this way.
			} else if (aOverallFilters.length > 1) {
				return new Filter({ filters: aOverallFilters, and: true });
			} else { // no filters
				return null;
			}
		};

		ConditionModel.prototype.serialize = function() {
			var oConditions = merge({}, this.getAllConditions());

			for (var sMyFieldPath in oConditions) {
				var aConditions = oConditions[sMyFieldPath];
				aConditions.forEach(function(oCondition) {
					delete oCondition.isEmpty;
				}, this);

				if (aConditions.length === 0) {
					delete oConditions[sMyFieldPath];
				}
			}

			return '{"conditions":' + JSON.stringify(oConditions) + "}";
		};

		ConditionModel.prototype.serializeMeta = function() {
			var aFields = Object.keys(this._mFieldPath || {});
			var r = "";
			aFields.forEach(function(sFieldPath) {
				if (this.getData().fieldPath[sFieldPath].valueState !== "None") {
					r += JSON.stringify(this.getData().fieldPath[sFieldPath]);
				}
			}, this);

			return '{"fieldPath":' + r + "}";
		};

		ConditionModel.prototype.parse = function(sObjects) {
			var dateTimeReviver = function(key, value) {
				var a;
				if (!isNaN(parseInt(key)) && (typeof value === 'string')) {
					a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/.exec(value);
					if (a) {
						return new Date(value);
					}
				}
				return value;
			};

			this.setConditions(JSON.parse(sObjects, dateTimeReviver).conditions);
		};

		ConditionModel.serialize = function(oListBinding) {
			var aOverallModelKeys = ConditionModel._getAllKeys(oListBinding);
			var sResult = "";

			aOverallModelKeys.forEach(function(oCMKey) {
				var oCM = ConditionModel._mModels[oCMKey];
				if (_hasConditions.call(oCM)) {
					sResult += ">>>" + oCMKey + "<<<";
					sResult += oCM.serialize();
				}
			});

			return sResult;
		};

		ConditionModel.serializeMeta = function(oListBinding) {
			var aOverallModelKeys = ConditionModel._getAllKeys(oListBinding);
			var sResult = "";

			aOverallModelKeys.forEach(function(oCMKey) {
				var oCM = ConditionModel._mModels[oCMKey];
				sResult += oCM.serializeMeta();
			});

			return sResult;
		};

		ConditionModel.parse = function(sObjects) {
			var aConditions = sObjects.split(">>>");
			aConditions.forEach(function(sCondition) {
				var aParts = sCondition.split("<<<");
				if (aParts.length > 1) {
					if (ConditionModel._mModels[aParts[0]]) {
						ConditionModel._mModels[aParts[0]].parse(aParts[1]);
					} else {
						var oCM = new ConditionModel(); //TODO oListBinding missing
						oCM.parse(aParts[1]);
						ConditionModel._mModels[aParts[0]] = oCM;
					}
				}
			});
		};

		function _escapeFieldPath(sFieldPath) {

			if (sFieldPath) {
				var aParts = sFieldPath.split("/");

				if (aParts.length > 1) {
					sFieldPath = "";

					for (var i = 0; i < aParts.length; i++) {
						var sPart = aParts[i];
						if (i > 0) {
							if (!isNaN(sPart) || !isNaN(aParts[i - 1])) {
								sFieldPath = sFieldPath + "/";
							} else {
								sFieldPath = sFieldPath + "_";
							}
						}
						sFieldPath = sFieldPath + sPart;
					}
				}

			}

			return sFieldPath;

		}

		return ConditionModel;
	}, /* bExport= */ true);
