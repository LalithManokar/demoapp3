/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
// -----------------------------------------------------------------------------
// Retrieves the data for a value list from the OData metadata to bind to a given control/aggregation
//
// -----------------------------------------------------------------------------
sap.ui.define([
	'sap/ui/core/library', 'sap/ui/comp/library', 'sap/m/library', 'sap/m/Column', 'sap/m/ColumnListItem', 'sap/m/Text', 'sap/m/Token', './BaseValueListProvider', 'sap/ui/core/Item', 'sap/ui/model/Filter', 'sap/ui/model/Sorter', 'sap/ui/model/json/JSONModel', 'sap/ui/model/FilterOperator', 'sap/ui/comp/util/FormatUtil', 'sap/ui/comp/smartfilterbar/FilterProvider', 'sap/ui/Device', 'sap/base/Log'
], function(coreLibrary, library, mLibrary, Column, ColumnListItem, Text, Token, BaseValueListProvider, Item, Filter, Sorter, JSONModel, FilterOperator, FormatUtil, FilterProvider, Device, Log) {
	"use strict";

	// shortcut for sap.ui.comp.smartfilterbar.DisplayBehaviour
	var DisplayBehaviour = library.smartfilterbar.DisplayBehaviour;

	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = mLibrary.PopinDisplay;

	var WrappingType = mLibrary.WrappingType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Retrieves the data for a collection from the OData metadata to bind to a given control/aggregation
	 *
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mParams - map containing the control,aggregation,annotation and the oODataModel
	 * @param {string} mParams.aggregation - name of the control aggregation which shows the value list (items or suggestRows)
	 * @param {boolean} mParams.typeAheadEnabled - enable typeAhead (default false)
	 * @param {boolean} [mParams.enableShowTableSuggestionValueHelp] - makes the Show More on the suggest drop down visible (default true)
	 * @param {} mParams.dropdownItemKeyType - type of the suggest item key part
	 * @param {} mParams.deferredGroupId
	 * @param {string} [mParams.context] context for which ValueListProvider is initiated. For example: "SmartFilterBar", "SmartField", "ValueHelp" ...
	 * @author SAP SE
	 */
	var ValueListProvider = BaseValueListProvider.extend("sap.ui.comp.providers.ValueListProvider", {
		constructor: function(mParams) {
			if (!FilterProvider) {
				FilterProvider = sap.ui.require("sap/ui/comp/smartfilterbar/FilterProvider"); // because of cycle in define
			}

			if (mParams) {
				this.sAggregationName = mParams.aggregation;
				this.bTypeAheadEnabled = !!mParams.typeAheadEnabled;
				this.bEnableShowTableSuggestionValueHelp = mParams.enableShowTableSuggestionValueHelp === undefined ? true : mParams.enableShowTableSuggestionValueHelp;
				this.dropdownItemKeyType = mParams.dropdownItemKeyType;
				this.sDeferredGroupId = mParams.deferredGroupId;
				this.sContext = mParams.context;
			}
			BaseValueListProvider.apply(this, arguments);
			this._onInitialise();
		}
	});

	/**
	 * Initialise the relevant stuff
	 *
	 * @private
	 */
	ValueListProvider.prototype._onInitialise = function() {

		if (!this.bTypeAheadEnabled) {

			/**
			 * Delay the fetch of data for standard dropdowns until the rendering is done! This inherently causes only the relevant data to be fetched
			 * from the backend!
			 */
			this.oAfterRenderingEventDelegate = {
				onAfterRendering: this._onMetadataInitialised
			};
			this.oControl.addEventDelegate(this.oAfterRenderingEventDelegate, this);

		} else if (this.oControl.attachSuggest) {

			// Check if Suggest is supported by the control
			this._fSuggest = function(oEvent) {
				this.oControl = oEvent.getSource();
				if (!this.bInitialised) {
					return;
				}
				if (!this.oTemplate || !this.oControl.data("_hassuggestionTemplate")) {
					this._createSuggestionTemplate();
				}
				var sSearchText = oEvent.getParameter("suggestValue");
				this._fetchData(sSearchText);
			}.bind(this);
			this.oControl.attachSuggest(this._fSuggest);

			if (!this.oFilterModel) {
				var that = this;

				// store original reference to the ManagedObject.prototype.setParent() method
				var fnSetParent = this.oControl.setParent;

				// decorate the .setParent() method of the this.oControl control instance to detect when the control is removed
				// from the control tree
				this.oControl.setParent = function(oNewParent, sAggregationName, bSuppressInvalidate) {

					// get the current parent
					var oOldParent = this.getParent();

					// call the ManagedObject.prototype.setParent() method with the same arguments passed to this function
					var oReturn = fnSetParent.apply(this, arguments);

					// get the possible new parent
					oNewParent = this.getParent();

					var bAggregationChanged = !(oNewParent && (oOldParent === null));

					// unbind the aggregation only if the parent changes
					if ((oNewParent !== oOldParent) && bAggregationChanged) {
						that.unbindAggregation();
					}

					return oReturn;
				};
			}

			this._handleSelect();
		}
	};

	/**
	 * Metadata is available --> Initialise the relevant stuff
	 *
	 * @private
	 */
	ValueListProvider.prototype._onMetadataInitialised = function() {
		if (this.bInitialised) {

			if (this.oAfterRenderingEventDelegate) {
				this.oControl.removeEventDelegate(this.oAfterRenderingEventDelegate);
			}

			if (this.oPrimaryValueListAnnotation) {
				if (this.sAggregationName && this.sAggregationName == "suggestionRows") {
					this._createSuggestionTemplate();
				} else {
					this._createDropDownTemplate();
				}
				this._fetchData();

			} else {
				Log.error("ValueListProvider", "Missing primary ValueListAnnotation for " + (this._sFullyQualifiedFieldName || this.sFieldName));
			}

			if (this.oAfterRenderingEventDelegate) {
				delete this.oAfterRenderingEventDelegate;
			}
		}
	};

	ValueListProvider.prototype._isSortable = function(sName) {
		if (this.oPrimaryValueListAnnotation) {
			for (var i = 0; i < this.oPrimaryValueListAnnotation.valueListFields.length; i++) {
				if (this.oPrimaryValueListAnnotation.valueListFields[i].name === sName) {
					return this.oPrimaryValueListAnnotation.valueListFields[i].sortable !== false;
				}
			}

			return false;
		}

		return false;
	};

	/**
	 * Creates a template for drop down fields
	 *
	 * @private
	 */
	ValueListProvider.prototype._createDropDownTemplate = function() {
		this._oTemplate = new Item({
			key: {
				path: this.sKey,
				type: this.dropdownItemKeyType
			},
			text: {
				parts: [
					{
						path: this.sKey,
						type: this.dropdownItemKeyType
					}, {
						path: this.sDescription
					}
				],
				formatter: FormatUtil.getFormatterFunctionFromDisplayBehaviour(this.sDDLBDisplayBehaviour)
			}
		});

		this._oSorter = null;

		// ComboBox/MultiComboBox:
		// Sort based on key if displayBehaviour is based on id
		if (this.sDDLBDisplayBehaviour === DisplayBehaviour.idOnly || this.sDDLBDisplayBehaviour === DisplayBehaviour.idAndDescription) {

			if (this._isSortable(this.sKey)) {
				this._oSorter = new Sorter(this.sKey);
			}
		} else {
			// Sort based on description by default
			if (this._isSortable(this.sDescription)) {
				this._oSorter = new Sorter(this.sDescription);
			} else if ((this.sDescription !== this.sKey) && this._isSortable(this.sKey)) {
				this._oSorter = new Sorter(this.sKey);
			}
		}
	};

	/**
	 * Creates a template for multi-column suggest
	 *
	 * @private
	 */
	ValueListProvider.prototype._createSuggestionTemplate = function() {
		var i = 0, iLen = 0, fSuggestWidth = 0;
		// Create a template
		this._oTemplate = new ColumnListItem();
		if (this._aCols) {
			// remove any exiting columns
			this.oControl.removeAllSuggestionColumns();
			iLen = this._aCols.length;
			for (i = 0; i < iLen; i++) {
				var bDemandPopin = false, sMinScreenWidth = "1px", sWidth = this._aCols[i].width;
				// In the phone mode don't set a fixed width for columns;
				// instead enable demand popin when there are over 2 columns, and not enough space
				if (Device.system.phone) {
					sWidth = undefined;
					if (i >= 2) {
						bDemandPopin = true;
						sMinScreenWidth = (i + 1) * 10 + "rem";
					}
				}
				// add Column headers
				this.oControl.addSuggestionColumn(new Column({
					header: new Text({
						wrapping: true,
						wrappingType: WrappingType.Hyphenated,
						text: this._aCols[i].label
					}),
					demandPopin: bDemandPopin,
					popinDisplay: PopinDisplay.Inline,
					minScreenWidth: sMinScreenWidth,
					width: sWidth
				}));

				// Add cells to the template
				this._oTemplate.addCell(new Text({
					wrapping: true,
					text: {
						path: this._aCols[i].template,
						type: this._aCols[i].oType
					}
				}));

				// we calculate the sum of all columns width (assumption is that the sWidth is always given in em)
				if (sWidth) {
					fSuggestWidth += parseFloat(sWidth.substring(0, sWidth.length - 2));
				}
			}

			// set the total width of all columns as Width for the suggest popover.
			// Add a small delta based on number of columns since there seems to be a padding added for some browsers
			if (fSuggestWidth > 0) {
				// BCP: 1770294638
				// this.oControl.setMaxSuggestionWidth(fSuggestWidth + iLen + "em");
				this.oControl.setProperty('maxSuggestionWidth', fSuggestWidth + iLen + "em", true);
			}
		}
		this.oControl.data("_hassuggestionTemplate", true);
	};

	/**
	 * @private
	 */
	ValueListProvider.prototype._handleRowSelect = function(oDataModelRow, fCallback) {
		var sKey, sText, oToken;
		if (oDataModelRow) {
			sKey = oDataModelRow[this.sKey];
			sText = oDataModelRow[this.sDescription];
		}
		// Key found
		if (sKey || (sKey === "")) {
			// MultiInput field --> Create a token with the selected key
			if (this.oControl.addToken) {
				// Format the text as per the displayBehaviour
				sText = FormatUtil.getFormattedExpressionFromDisplayBehaviour(this.sTokenDisplayBehaviour, sKey, sText);
				oToken = new Token();
				oToken.setKey(sKey);
				oToken.setText(sText);
				oToken.setTooltip(sText);
				oToken.data("row", oDataModelRow);
				if (fCallback) {
					fCallback(oToken);
				}

				// BCP: 1980361768 Upon creating the token from suggest sometimes the model binding is not updated when
				// the element in the suggest is highlighted and than the focus moves -> a token is created but the value
				// in the model is not reset to an empty string. By setting the value again in this case we force the
				// control to update the model.
				// Note: This should be removed only when the issue is fully resolved by the MultiInput control.
				if (this.oControl.getValue() === "") {
					this.oControl.setValue("");
				}

				// Clear the ValidationText
				delete this.oControl.__sValidationText;
			} else {
				// normal input field --> just set the value
				this.oControl.setValue(sKey);
				// Manually trigger the change event on sapUI5 control since it doesn't do this internally on setValue!
				this.oControl.fireChange({
					value: sKey,
					validated: true
				});
			}
		}
		// do this last --> since when used in an aggregation - some model updates (setting IN/OUT params to ODataModel) destroy this
		// instance/control!
		this._calculateAndSetFilterOutputData([
			oDataModelRow
		]);

	};

	/**
	 * @private
	 */
	ValueListProvider.prototype._multiInputValidator = function(oData) {
		if (!this.bInitialised) {
			return;
		}

		// queue the validator calls
		if (this._aValidators) {
			var oToken;
			this._aValidators.some(function(fValidator) {
				oToken = fValidator(oData);
				return oToken;
			}, this);

			if (oToken) {
				return oToken;
			}
		}

		var oRow = oData.suggestionObject, oDataModelRow, sInput = oData.text;
		// Selection via suggestion row --> no round trip needed
		if (oRow) {
			// Get the actual datamodel row
			// BCP: 0020751294 0000254992 2019
			// because the this.oOdataModel instance can be old and the controls has a different model attached,
			// we always have to fetch the Data from the current model attached to the control/row.
			var oModel = oRow.getModel();
			oDataModelRow = oModel.getData(oRow.getBindingContextPath());
			this._handleRowSelect(oDataModelRow, oData.asyncCallback);
		} else if (sInput) {
			// Validation required from backend
			this._validateInput(sInput, oData.asyncCallback);
		}
	};

	/**
	 * @private
	 */
	ValueListProvider.prototype._validateInput = function (sInput, fAsyncCallback) {
		var aFilters = [],
			oControl = this.oControl,
			mParams;

		// Check if input needs to be converted to upper case
		if (this.sDisplayFormat === "UpperCase") {
			sInput = sInput.toUpperCase();
		}

		// Check if the entered input text is same as the ValidationText
		if (oControl.__sValidationText !== sInput) {
			// Store the input as Validation text
			oControl.__sValidationText = sInput;

			if (sInput === this._truncateSearchText(sInput)) {
				// Set flag to indicate token validation is in progress
				oControl.__bValidatingToken = true;
				this._calculateFilterInputData();
				if (this.mFilterInputData && this.aFilterField) {
					aFilters = FilterProvider.generateFilters(this.aFilterField, this.mFilterInputData);
				}

				aFilters.push(new Filter(this.sKey, FilterOperator.EQ, sInput));
				if (this.bSupportBasicSearch) {
					mParams = {
						"search-focus": this.sKey
					};
				}
				this.oODataModel.read("/" + this.sValueListEntitySetName, {
					filters: aFilters,
					urlParameters: mParams,
					success: function(oResponseData) {

						if (!this.oControl || !this.oControl.hasOwnProperty("__bValidatingToken")) {
							// ignore the result completely
							return;
						}
						var oResultRow = oResponseData;
						// first remove the token validation flag
						delete this.oControl.__bValidatingToken;
						if (oResponseData) {
							// Check if result has rows
							if (oResponseData.results && oResponseData.results.length >= 1) {
								// handle response for creating tokens only if 1 unique result exists!
								if (oResponseData.results.length === 1) {
									oResultRow = oResponseData.results[0];
								}
								if (this.oControl.data("__validationError")) {
									this.oControl.data("__validationError", null);
									this.oControl.setValueState("None");
								}
							} else {
								this.oControl.setValueState("Error");
								this.oControl.data("__validationError", true);
							}
							// If returned row has the key do the selection!
							if (oResultRow && oResultRow[this.sKey]) {
								this._handleRowSelect(oResultRow, fAsyncCallback);
							}
						}
						// Trigger after token validation handling
						this._afterTokenValidate();
					}.bind(this),
					error: function() {
						// Clear previous validation error state if current validation fails!
						if (this.oControl.data("__validationError")) {
							this.oControl.setValueState("None");
						}
						// Remove the token validation flag
						delete this.oControl.__bValidatingToken;
						// Trigger after token validation handling
						this._afterTokenValidate();
					}.bind(this)
				});
			}
		} else {
			// Re-set the error state if same value is entered again!
			if (oControl.data("__validationError")) {
				oControl.setValueState(ValueState.Error);
			}
		}
	};

	/**
	 * This method is used to validate string single field with value list
	 * @private
	 */
	ValueListProvider.prototype._validateStringSingleWithValueList = function (oEvent) {
		var sValue;

		// In case the event object is already validated (from suggest row) we don't do any further validation
		if (oEvent.getParameter("validated")) {
			return;
		}

		// In case the value is equal to empty string or it is undefined we don't do any further validation
		sValue = oEvent.getParameter("value");
		if (sValue === "" || sValue === undefined) {
			return;
		}

		this._validateInput(sValue);
	};

	/**
	 * @private
	 */
	ValueListProvider.prototype._afterTokenValidate = function() {
		// trigger search on the SmartFilter if search was pending
		if (this.oFilterProvider && this.oFilterProvider._oSmartFilter && this.oFilterProvider._oSmartFilter.bIsSearchPending && this.oFilterProvider._oSmartFilter.search) {
			if (this.oFilterProvider._oSmartFilter.getLiveMode && this.oFilterProvider._oSmartFilter.getLiveMode()) {
				return;
			}

			this.oFilterProvider._oSmartFilter.search();
		}
	};

	/**
	 * @private
	 */
	ValueListProvider.prototype._onSuggestionItemSelected = function(oEvent) {
		var oRow = oEvent.getParameter("selectedRow");
		// MultiColumn Suggest
		if (oRow) {
			// Get the actual data model row
			this._handleRowSelect(oRow.getModel().getData(oRow.getBindingContextPath()));
		}
	};

	/**
	 * Handle validation/selection of Item
	 *
	 * @private
	 */
	ValueListProvider.prototype._handleSelect = function() {
		// Selection handling has to be done manually for Multi-Column suggest!
		// add Validators --> Only available for Multi-Input
		if (this.oControl.addValidator) {
			this._aValidators = this.oControl._tokenizer ? this.oControl._tokenizer._aTokenValidators.slice() : [];
			this.oControl.removeAllValidators();

			this._fValidator = this._multiInputValidator.bind(this);
			this.oControl.addValidator(this._fValidator);
		} else if (this.oControl.attachSuggestionItemSelected) {
			// Single-Input --> just enable selection handling
			this.oControl.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);

			// Attach validation against value list key
			if (this.sContext === "SmartFilterBar" &&
				this._fieldViewMetadata &&
				this._fieldViewMetadata.hasValueListAnnotation
			) {
				this.oControl.attachChange(this._validateStringSingleWithValueList, this);
			}
		}
		// custom result filter function for tabular suggestions - selection text;
		// the returned result will be shown on the input when the user uses the arrow key on suggest
		this.oControl.setRowResultFunction(function(oSelectedItem) {
			var oContext, sResult = "";
			if (oSelectedItem) {
				oContext = oSelectedItem.getBindingContext();
			}
			if (oContext && this.sKey) {
				sResult = oContext.getProperty(this.sKey);
			}
			return sResult;
		}.bind(this));
	};

	/**
	 * Bind the control to internally read the data (ODataModel takes care of this) from backend with optional search text to filter data
	 *
	 * @param {object} sSearchText - the optional search text
	 * @private
	 */
	ValueListProvider.prototype._fetchData = function(sSearchText) {
		var mParams = {}, aFilters = [], length, oEvents;
		if (this.bTypeAheadEnabled) {
			// Convert search text to UpperCase if displayFormat = "UpperCase"
			if (sSearchText && this.sDisplayFormat === "UpperCase") {
				sSearchText = sSearchText.toUpperCase();
			}
			if (this.bSupportBasicSearch) {
				mParams["custom"] = {
					"search-focus": this.sKey,
					"search": sSearchText
				};
			}
			this._calculateFilterInputData();
			if (this.mFilterInputData && this.aFilterField) {
				aFilters = FilterProvider.generateFilters(this.aFilterField, this.mFilterInputData, {
					dateSettings: this._oDateFormatSettings
				});
			}
			// If SearchSupported = false; create a $filter for the keyfield with a StartsWith operator for the typed in/search text
			if (!this.bSupportBasicSearch) {

				if (this._sType === "numc") {
					aFilters.push(new Filter(this.sKey, FilterOperator.Contains, sSearchText));
				} else
					if (this._truncateSearchText(sSearchText) === sSearchText) {
						aFilters.push(new Filter(this.sKey, FilterOperator.StartsWith, sSearchText));
					} else {
						this.oControl.closeSuggestions();
						return;
					}

			}
			// Restrict to 10 records for type Ahead
			length = 10;
			if (this.bEnableShowTableSuggestionValueHelp) {
				// Hide the Show All Items button if the number if items is less than the length (restriction)
				oEvents = {
					dataReceived: function(oEvent) {
						var oBinding = oEvent.getSource(), iBindingLength;
						if (oBinding) {
							iBindingLength = oBinding.getLength();
							if (iBindingLength && iBindingLength <= length) {
								this.oControl.setShowTableSuggestionValueHelp(false);
							} else {
								this.oControl.setShowTableSuggestionValueHelp(true);
							}
						}
					}.bind(this)
				};
			} else {
				// Hide the Show All Items as per configuration
				this.oControl.setShowTableSuggestionValueHelp(false);
			}
		}

		if (this.aSelect && this.aSelect.length) {
			mParams["select"] = this.aSelect.toString();
		}

		if (!this.sValueListEntitySetName) {
			Log.error("ValueListProvider", "Empty sValueListEntitySetName for " + this.sAggregationName + " binding! (missing primaryValueListAnnotation)");
		}

		if (this.sDeferredGroupId) {
			// notice according to documentation, of sap.ui.model.odata.v2.ODataListBinding, it really is called "batchGroupId" and not "groupId"
			mParams["batchGroupId"] = this.sDeferredGroupId;
		}

		// Bind the specified aggregation with valueList path in the model
		this.oControl.bindAggregation(this.sAggregationName, {
			path: "/" + this.sValueListEntitySetName,
			length: length,
			parameters: mParams,
			filters: aFilters,
			sorter: this._oSorter,
			events: oEvents,
			template: this._oTemplate,
			templateShareable: false
		});
	};

	/**
	 * check if a maxLength is given for the field and truncate the entered searchText if length > maxLength
	 *
	 * @param {string} sSearchText - the search text
	 * @return {string} new truncated sSearchText
	 * @private
	 */
	ValueListProvider.prototype._truncateSearchText = function(sSearchText) {
		// because the Field itself allow to enter many characters, but the fieldMetadata has set a maxLength, we truncate the SearchText when we
		// reach the maxLength
		var iMaxLength = -1;
		if (this._sMaxLength) {
			// maxLength can be given as property (SmartField)
			iMaxLength = parseInt(this._sMaxLength);
		} else if (this._fieldViewMetadata && this._fieldViewMetadata.maxLength) {
			// or as part of the metadat object (for Filterbar fields)
			iMaxLength = parseInt(this._fieldViewMetadata.maxLength);
		}

		if (iMaxLength > -1 && sSearchText.length > iMaxLength) {
			sSearchText = sSearchText.substr(0, iMaxLength);
		}
		return sSearchText;
	};

	/**
	 * Unbind the aggregation from the model.
	 *
	 * @returns {sap.ui.comp.providers.ValueListProvider} The <code>this</code> instance to allow method chaining
	 * @protected
	 * @since 1.54
	 */
	ValueListProvider.prototype.unbindAggregation = function() {
		if (this.oControl) {
			this.oControl.unbindAggregation(this.sAggregationName);
		}

		return this;
	};

	/**
	 * Destroys the object
	 */
	ValueListProvider.prototype.destroy = function() {
		if (this.oControl) {
			if (this.oControl.detachSuggest && this._fSuggest) {
				this.oControl.detachSuggest(this._fSuggest);
				this._fSuggest = null;
			}
			if (this.oControl.removeValidator && this._fValidator) {
				this.oControl.removeValidator(this._fValidator);
				this._fValidator = null;
			} else if (this.oControl.detachSuggestionItemSelected) {
				this.oControl.detachSuggestionItemSelected(this._onSuggestionItemSelected, this);
			}
			if (this.oControl.detachChange) {
				this.oControl.detachChange(this._validateStringSingleWithValueList, this);
			}
			this.oControl.unbindAggregation(this.sAggregationName);
			this.oControl.data("_hassuggestionTemplate", false);
			delete this.oControl.__sValidationText;
			delete this.oControl.__bValidatingToken;
		}
		BaseValueListProvider.prototype.destroy.apply(this, arguments);
		// Destroy other local data
		if (this.oJsonModel) {
			this.oJsonModel.destroy();
			this.oJsonModel = null;
		}

		if (this._oTemplate) {
			this._oTemplate.destroy();
		}

		this._oTemplate = null;
		this.sAggregationName = null;
		this.bTypeAheadEnabled = null;
		this._oSorter = null;
	};

	return ValueListProvider;

}, /* bExport= */true);
