/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/core/Control', 'sap/base/util/merge', 'sap/base/util/deepEqual', 'sap/ui/model/PropertyBinding', 'sap/ui/model/Context', 'sap/ui/model/base/ManagedObjectModel', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/mdc/library', 'sap/ui/mdc/base/filterbar/FilterItemLayout', 'sap/ui/mdc/base/ConditionModel', 'sap/ui/mdc/base/Condition', 'sap/ui/mdc/FilterField', 'sap/ui/mdc/field/FieldValueHelp', 'sap/ui/mdc/util/IdentifierUtil', 'sap/ui/mdc/util/ConditionUtil', 'sap/ui/layout/AlignedFlowLayout', 'sap/m/library', 'sap/m/Button', 'sap/ui/model/json/JSONModel', "sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
], function(Control, merge, deepEqual, PropertyBinding, Context, ManagedObjectModel, ManagedObjectObserver, Log, mdcLibrary, FilterItemLayout, ConditionModel, Condition, FilterField, FieldValueHelp, IdentifierUtil, ConditionUtil, AlignedFlowLayout, mLibrary, Button, JSONModel, ControlPersonalizationWriteAPI, FlexRuntimeInfoAPI) {
	"use strict";

	var ButtonType = mLibrary.ButtonType;

	/**
	 * Constructor for a new FilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The FilterBar control is used to display filter properties.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterBar = Control.extend("sap.ui.mdc.FilterBar", /** @lends sap.ui.mdc.FilterBar.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/FilterBar.designtime",
			defaultAggregation: "filterItems",
			interfaces : [
				"sap.ui.mdc.IFilter"
			],
			properties: {

				/**
				 * Defines the path to the metadata retrieval class for the FilterBar.
				 */
				metadataDelegate: {
					type: "string",
					defaultValue: "sap/ui/mdc/FilterBarDelegate"
				},

				/**
				 * If set the search will be automatically triggered, when a filter value was changed.
				 * Note: is set the 'Go' button will not be displayed.
				 */
				liveMode: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Handles visibility of the Go button on the FilterBar.
				 * Note: if property <code>liveMode</code> is set to true, this property will be ignored.
				 */
				showGoButton: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Handles visibility of the 'Adapt Filters' button on the FilterBar.
				 * Note: if property <code>supportP13N</code> is set to false, this property will be ignored.
				 */
				showAdaptFiltersButton: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Specifies if the the personalization mode is supported.
				 * Note: is set to false, the 'Adapt Filters' button will not be offered.
				 */
				supportP13N: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Specifies the filter conditions. This property is exclusive used for changes handling. Do not use it otherwise.
				 * Note: this property may only be used in the xml-view to specify an initial filters condition.
				 *
				 * @since 1.66.0
				 */
				filtersConditions: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Specifies the information of the metadata model. This model is used to obtain the properties information.
				 * The structure of this property is defined as such:<br>
				 * <code>{ modelName: <string>,
				 *   collectionName: <string> }</code>
				 * Note: this property has to be set during the construction of the FilterBar and may not be changed otherwise.
				 *
				 * @since 1.66.0
				 */
				metadataInfo: {
					type: "object",
					defaultValue: {}
				}
			},
			aggregations: {

				/**
				 * Contains all FilterBar filters.
				 */
				filterItems: {
					type: "sap.ui.mdc.FilterField",
					multiple: true
				},

				/**
				 * Contains eventual basic search field.
				 */
				basicSearchField: {
					type: "sap.ui.mdc.FilterField",
					multiple: false
				}
			},
			events: {

				/**
				 * This event is fired when the Go button is pressed.
				 */
				search: {
					conditions: {
						type: "object"   // map of "filterName": [ Conditions ]
					}
				},

				/**
				 * This event is fired when the Reset button is pressed.
				 */
				reset: {},

				/**
				 * This event is fired when a filter value was changed.
				 */
				filtersChanged: {
					filtersText: { // optional
						type: "string"
					}
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl._getContent());
			oRm.write("</div>");
		}
	});

	FilterBar.INNER_MODEL_NAME = "$sap.ui.mdc.FilterBar";
	FilterBar.CONDITION_MODEL_NAME = "$filters";

	var AdaptFiltersDialog = null;
	var AdaptFiltersDialogItem = null;

	FilterBar.prototype.init = function() {

		this.addStyleClass("sapUiMdcBaseFilterBar");
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._createInnerModel();

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			aggregations: [
				"filterItems"
			]
		});

		this._oFilterBarLayout = new AlignedFlowLayout();

		this._addButtons();

		this._clearChanges();

		this._aProperties = null;

		this._fResolveFilterBarMetaModelSet = undefined;
		this._oMetaModelSetPromise = new Promise(function(resolve) {
			this._fResolveFilterBarMetaModelSet = resolve;
		}.bind(this));

		this._fResolveFilterBarMetadataApplied = undefined;
		this._oMetadataAppliedPromise = new Promise(function(resolve) {
			this._fResolveFilterBarMetadataApplied = resolve;
		}.bind(this));

		this._fResolveFilterBarConditionModel = undefined;
		this._oConditionModelPromise = new Promise(function(resolve) {
			this._fResolveFilterBarConditionModel = resolve;
		}.bind(this));

		this._fResolveInitialFiltersApplied = undefined;
		this._oInitialFiltersAppliedPromise = new Promise(function(resolve) {
			this._fResolveInitialFiltersApplied  = resolve;
		}.bind(this));

		this._bIgnoreChanges = false;
		this.bWaiting = false;
	};


	FilterBar.prototype._getConditionModel = function() {
		return this._oConditionModel;
	};

	/**
	 * Returns the name of the inner FilterBar condition model.
	 * @public
	 * @returns {string} name the inner FilterBar condition model
	 */
	FilterBar.prototype.getConditionModelName = function() {
		return this._getConditionModelName();
	};

	FilterBar.prototype._getConditionModelName = function() {
		return  FilterBar.CONDITION_MODEL_NAME;
	};

	FilterBar.prototype._createConditionModel = function() {

		this._oConditionModel = new ConditionModel();
		this.setModel(this._oConditionModel, this._getConditionModelName());

		if (!this._oMetadataPromise) {
			this._oMetadataPromise = this._retrieveMetadata();
		}

		Promise.all([this._oMetadataPromise]).then(function() {
			if (this._oConditionModel) {
				this._oConditionChangeBinding = this._oConditionModel.bindProperty("/conditions", this._oConditionModel.getContext("/conditions"));
				this._oConditionChangeBinding.attachChange(this._handleConditionModelChange, this);

				this._fResolveFilterBarConditionModel();
			}
		}.bind(this));
	};

	FilterBar.prototype._getMetaModelName = function() {
		return this.getMetadataInfo().modelName;
	};
	FilterBar.prototype._getEntitySetName = function() {
		return this.getMetadataInfo().collectionName;
	};

	FilterBar.prototype._setMetadataModel = function() {
		var oMetadataModel = null, sMetaModelName = this._getMetaModelName();
		if (sMetaModelName) {
			oMetadataModel = this.getModel(sMetaModelName);
		} else {
			oMetadataModel = this.getModel();
		}

		if (oMetadataModel) {
			this.detachModelContextChange(this._setMetadataModel, this);
			this._fResolveFilterBarMetaModelSet(oMetadataModel);
		}
	};


	FilterBar.prototype.applySettings = function(mSettings, oScope) {
		Control.prototype.applySettings.apply(this, arguments);

		this._createConditionModel();

		this._oConditionModelPromise.then(function() {
			this._applyInitialFiltersConditions();
		}.bind(this));
	};

	FilterBar.prototype.setMetadataDelegate = function(sPath) {
		this.setProperty("metadataDelegate", sPath);

		return this;
	};

	FilterBar.prototype._createInnerModel = function() {
		this._oModel = new ManagedObjectModel(this);
		this.setModel(this._oModel, FilterBar.INNER_MODEL_NAME);
		return this;
	};

	FilterBar.prototype._addButtons = function() {

		if (this._oFilterBarLayout) {

			this._btnAdapt = new Button(this.getId() + "-btnAdapt", {
				text: this._oRb.getText("filterbar.ADAPT"),
				press: this.onAdaptFilters.bind(this)
			});
			this._btnAdapt.setModel(this._oModel, FilterBar.INNER_MODEL_NAME);
			this._btnAdapt.bindProperty("visible", {
				parts: [
					{
						path: '/showAdaptFiltersButton',
						model: FilterBar.INNER_MODEL_NAME
					}, {
						path: "/supportP13N",
						model: FilterBar.INNER_MODEL_NAME
					}
				],
				formatter: function(bValue1, bValue2) {
					return bValue1 && bValue2;
				}
			});
			this._btnAdapt.addStyleClass("sapUiMdcBaseFilterBarButtonPaddingRight");

			this._oFilterBarLayout.addEndContent(this._btnAdapt);

			this._btnSearch = new Button(this.getId() + "-btnSearch", {
				text: this._oRb.getText("filterbar.GO"),
				press: this.onSearch.bind(this),
				type: ButtonType.Emphasized
			});
			this._btnSearch.setModel(this._oModel, FilterBar.INNER_MODEL_NAME);
			this._btnSearch.bindProperty("visible", {
				parts: [
					{
						path: '/showGoButton',
						model: FilterBar.INNER_MODEL_NAME
					}, {
						path: "/liveMode",
						model: FilterBar.INNER_MODEL_NAME
					}
				],
				formatter: function(bValue1, bValue2) {
					return bValue1 && !bValue2;
				}
			});
			this._oFilterBarLayout.addEndContent(this._btnSearch);
		}
	};


	FilterBar.prototype._initializeProvider = function() {
		var sMetadataDelegate = this.getMetadataDelegate();
		if (!sMetadataDelegate) {
			return Promise.resolve(null);
		}

		var oMetadataInfo = this.getMetadataInfo();
		if (Object.keys(oMetadataInfo).length > 0) {
			this.attachModelContextChange(this._setMetadataModel, this);
		} else {
			this._fResolveFilterBarMetaModelSet(null);
		}

		return this._loadProvider(sMetadataDelegate);
	};

	FilterBar.prototype._loadProvider = function(sMetadataDelegate) {
		return new Promise(function(fResolve) {
			sap.ui.require([
				sMetadataDelegate
			], function(Provider) {
				fResolve(Provider);
			});
		});
	};

	FilterBar.prototype.onAdaptFilters = function(oEvent) {
		this.showFiltersDialog();
	};


	FilterBar.prototype._getAssignedFilterNames = function() {
		var oConditions, sName, aFilterNames = null, oModel = this._getConditionModel(), oFilterField;
		if (oModel) {
			oConditions = oModel.getAllConditions();
			aFilterNames = [];

			for (sName in oConditions) {

				if (aFilterNames.indexOf(sName) < 0) {
					var aConditions = oModel.getConditions(sName);
					if (aConditions && aConditions.length > 0) {

						if (sName === "$search") {
							aFilterNames.push(this._oRb.getText("filterbar.ADAPT_SEARCHTERM"));
						} else {

							oFilterField = this._getFilterField(sName);
							if (oFilterField) {
								if (oFilterField.getVisible()) {
									aFilterNames.push(sName);
								}
							} else {
								aFilterNames.push(sName);
							}
						}
					}
				}
			}
		}

		return aFilterNames;
	};

	FilterBar.prototype._getAssignedFiltersText = function(aFilterNames) {
		var sAssignedFiltersText, aMaxFilterNames;

		aFilterNames = aFilterNames || [];

		// if basic search is available - first entry
		if (aFilterNames.length > 5) {
			aMaxFilterNames = aFilterNames.slice(0, 5);
			aMaxFilterNames.push("...");
		} else {
			aMaxFilterNames = aFilterNames;
		}

		sAssignedFiltersText = Object.keys(aMaxFilterNames).map(function(i) {return aMaxFilterNames[i];}).join(", ");

		if (aFilterNames.length) {
			return this._oRb.getText("filterbar.ADAPT_FILTERED", [
				aFilterNames.length, sAssignedFiltersText
			]);
		}

		return this._oRb.getText("filterbar.ADAPT_NOTFILTERED");
	};

	/**
	 * Returns a summary string that contains information about the filters currently assigned. The string starts with "Filtered By", followed by the number of set filters and their labels.<br>
	 * Example:<br>
	 * <i>Filtered By (3): Company Code, Fiscal Year, Customer</i>
	 * @public
	 * @returns {string} A string that contains the number of set filters and their names
	 */
	FilterBar.prototype.getAssignedFiltersText = function() {
		return this._getAssignedFiltersText(this._getAssignedFilterNames());
	};

	FilterBar.prototype._handleConditionModelChange = function(oEvent) {
		if (!this._bIgnoreChanges) {
			this._handleAssignedFilterNames(oEvent);
			this._handleCalculateDifferences();
		}
	};

	FilterBar.prototype._handleCalculateDifferences = function(aShadowConditions, oCModel) {
		var aPrevState = this.getProperty("filtersConditions");
		this._calculateConditionsDiffsToPrevState(aPrevState, this._getConditionModel());
	};

	FilterBar.prototype._calculateConditionsDiffsToPrevState = function(aPreviousConditions, oCModel) {

		if (!this.getSupportP13N()) {
			return;
		}

		if (!oCModel) {
			return;
		}

		var aConditions = oCModel.getAllConditions();

		if (!deepEqual(aConditions, aPreviousConditions)) {
			for (var sFieldPath in aConditions) {
				if (!aPreviousConditions[sFieldPath]) {
					for (var  i = 0; i < aConditions[sFieldPath].length; i++) {
						var oChange = this._createAddRemoveConditionChangeWithFieldPath("addCondition", sFieldPath, aConditions[sFieldPath][i]);
						if (oChange) {
							this._aChanges.push(oChange);
						}
					}
				} else {
					this._calculateConditionsDifference(sFieldPath, aConditions, aPreviousConditions);
				}
			}
		}

		this._storeChanges();
	};

	FilterBar.prototype._determineType = function(sFieldPath) {
			var oPI, oFF = this._getFilterField(sFieldPath);
			if (oFF) {
				return oFF;
			}
			oPI = this._getPropertyByName(sFieldPath);
			if (oPI) {
				return oPI;
			}

			Log.error("not able to resolve metadata for " + sFieldPath);
			return null;
	};

	FilterBar.prototype._calculateConditionsDifference = function(sFieldPath, aOrigConditions, aOrigShadowConditions) {

		var sType, oFormatOptions, oConstraints, oObj;

		var aConditions = aOrigConditions[sFieldPath]  ? merge([], aOrigConditions[sFieldPath]) : [];
		var aShadowConditions = aOrigShadowConditions[sFieldPath] ? merge([], aOrigShadowConditions[sFieldPath]) : [];

		this._cleanupConditions(aConditions);
		this._cleanupConditions(aShadowConditions);

		if (deepEqual(aConditions, aShadowConditions)) {
			return;
		}

		this._removeSameConditions(aConditions, aShadowConditions);

		if ((aConditions.length > 0) || (aShadowConditions.length > 0)) {

			oObj = this._determineType(sFieldPath);
			if (!oObj) {
				return;
			}
			if (oObj.isA && oObj.isA("sap.ui.mdc.FilterField")) {
				sType = oObj.getDataType();
				oFormatOptions = oObj.getDataTypeFormatOptions();
				oConstraints = oObj.getDataTypeConstraints();
			} else  {
				sType = oObj.type;
				oFormatOptions = oObj.formatOptions;
				oConstraints = oObj.constraints;
			}


			aConditions.forEach(function(oCondition) {
				oCondition = ConditionUtil.toExternal(oCondition, sType, oFormatOptions, oConstraints);
			});


			aShadowConditions.forEach(function(oCondition) {
				this._aChanges.push(this._createAddRemoveConditionChange("removeCondition", sFieldPath, sType, oFormatOptions, oConstraints, oCondition));
			}.bind(this));

			aConditions.forEach(function(oCondition) {
				this._aChanges.push(this._createAddRemoveConditionChange("addCondition", sFieldPath, sType, oFormatOptions, oConstraints, oCondition));
			}.bind(this));

		}
	};


	FilterBar.prototype._cleanupConditions = function(aConditions) {
		if (aConditions) {
			aConditions.forEach( function(oCondition) {
				if (oCondition.hasOwnProperty("isEmpty")) {
					delete oCondition.isEmpty;
				}
			});
		}
	};

	FilterBar.prototype._removeSameConditions = function(aConditions, aShadowConditions) {
		var bRunAgain;

		do  {
			bRunAgain = false;

			for (var i = 0; i < aConditions.length; i++) {
				for (var j = 0; j < aShadowConditions.length; j++) {
					if (deepEqual(aConditions[i], aShadowConditions[j])) {
						aConditions.splice(i, 1);
						aShadowConditions.splice(j, 1);
						bRunAgain = true;
						break;
					}
				}

				if (bRunAgain) {
					break;
				}
			}
		}  while (bRunAgain);
	};

	FilterBar.prototype._handleAssignedFilterNames = function(oEvent) {

		var oObj = {}, aFilterNames = this._getAssignedFilterNames();
		if (aFilterNames) {
			if (this._btnAdapt) {
				this._btnAdapt.setText(this._oRb.getText(aFilterNames.length ? "filterbar.ADAPT_NONZERO" : "filterbar.ADAPT", aFilterNames.length));

				//TODO: waiting for a public solution
				this._oFilterBarLayout.reflow();
			}

			oObj.filtersText = this._getAssignedFiltersText(aFilterNames);

			this.fireFiltersChanged(oObj);

			if (this.getLiveMode()) {
				this.fireSearch();
			}
		}
	};

	FilterBar.prototype.onReset = function(oEvent) {
		this.fireReset();
	};
	FilterBar.prototype.onSearch = function(oEvent) {
		this.fireSearch();
	};

	FilterBar.prototype.fireSearch = function(oEvent) {
		var mConditions = this.getConditions(true);
		this.fireEvent("search", {conditions: mConditions });
	};

	/**
	 * Returns the conditions of the inner condition model.
	 * This method may only be used for value help scenarios.
	 * @protected
	 * @param {boolean} bDoNotCleanUp indicates if the returning conditions should remove secondary information
	 * @returns {map} a map containing the conditions.
	 */
	FilterBar.prototype.getConditions = function(bDoNotCleanUp) {
		var mConditions = {}, oModel = this._getConditionModel();
		if (oModel) {
			var aAllConditions = oModel.getAllConditions();
			for (var sFieldPath in aAllConditions) {
				if (aAllConditions[sFieldPath] && (aAllConditions[sFieldPath].length > 0)) {
					mConditions[sFieldPath] = merge([], aAllConditions[sFieldPath]);
					if (!bDoNotCleanUp) {
						this._cleanupConditions(mConditions[sFieldPath]);
					}
				}
			}
		}

		return mConditions;
	};

	/**
	 * Allows the settings of conditions for the inner condition model.
	 * This method will only be called for filling the in-parameters for value help scenarios.
	 * @protected
	 * @param {map} mConditions - a map containing the conditions
	 */
	FilterBar.prototype.setConditions = function(mConditions) {
		var oModel = this._getConditionModel();
		if (oModel) {
			for (var sFieldPath in mConditions) {

				oModel.removeAllConditions(sFieldPath);

				var aConditions = mConditions[sFieldPath];

				 /* eslint-disable no-loop-func */
				aConditions.forEach(function(oCondition) {
					oModel.addCondition(sFieldPath, oCondition);
				});
				 /* eslint-enable no-loop-func */
			}
		}
	};


	FilterBar.prototype.showFiltersDialog = function() {

		if (!this._oMetadataPromise) {
			this._oMetadataPromise = this._retrieveMetadata();
		}

		if (!AdaptFiltersDialog) {
			sap.ui.require([
				"sap/ui/mdc/base/filterbar/AdaptFiltersDialog", "sap/ui/mdc/base/filterbar/AdaptFiltersDialogItem"
			], function(fnAdaptFiltersDialog, fnAdaptFiltersDialogItem) {

				this._oMetadataPromise.then(function() {
					AdaptFiltersDialog = fnAdaptFiltersDialog;
					AdaptFiltersDialogItem = fnAdaptFiltersDialogItem;
					this._showFiltersDialog();
				}.bind(this));

			}.bind(this));
		} else {
			this._showFiltersDialog();
		}
	};


	FilterBar.prototype._showFiltersDialog = function() {

		this._clearChanges();

		var oJSONModel = new JSONModel({
			showResetEnabled: false,
			items: this._setItemsForAdaptFiltersDialog()
		});

		var oAdaptFiltersDialogItemTemplate = new AdaptFiltersDialogItem({
			key: "{$sapuimdcbasefilterbarAdaptFiltersDialog>key}",
			text: "{$sapuimdcbasefilterbarAdaptFiltersDialog>text}",
			tooltip: "{$sapuimdcbasefilterbarAdaptFiltersDialog>tooltip}",
			required: "{$sapuimdcbasefilterbarAdaptFiltersDialog>required}",
			visible: "{$sapuimdcbasefilterbarAdaptFiltersDialog>visible}",
			relativePosition: "{$sapuimdcbasefilterbarAdaptFiltersDialog>relativePosition}",
			controls: {
				path: '$sapuimdcbasefilterbarAdaptFiltersDialog>controls',
				templateShareable: false,
				factory: function(sId, oBindingContext) {
					return oBindingContext.getObject(oBindingContext.getPath());
				}
			}
		});

		var oAdaptFiltersDialog = new AdaptFiltersDialog({
			showReset: false,
			showResetEnabled: {
				path: '$sapuimdcbasefilterbarAdaptFiltersDialog>/showResetEnabled'
			},
			items: {
				path: '$sapuimdcbasefilterbarAdaptFiltersDialog>/items',
				templateShareable: false,
				template: oAdaptFiltersDialogItemTemplate
			},
			visibilityChanged: function(oEvent) {
				this._addFilterVisibilityChange(oEvent.getParameter("key"), oEvent.getParameter("visible"));
			}.bind(this),
			positionChanged: function(oEvent) {
				this._addFilterPositionyChange(oEvent.getParameter("key"), oEvent.getParameter("relativePosition"));
			}.bind(this),
			ok: function(oEvent) {

				var oModel = this._oAdaptFiltersDialog.getModel("cmodel");  //TODO: change model name
				this._calculateConditionsDiffsToPrevState(this._getConditionModel().getAllConditions(), oModel);

				oEvent.getSource().close();
				oEvent.getSource().destroy();

				this._oAdaptFiltersDialog = null;
			}.bind(this),
			reset: function() {
				this._oAdaptFiltersDialog = null;
			}.bind(this),
			cancel: function(oEvent) {
				oEvent.getSource().close();
				oEvent.getSource().destroy();

				this._oAdaptFiltersDialog = null;
			}.bind(this)
		});

		oAdaptFiltersDialog.setModel(oJSONModel, "$sapuimdcbasefilterbarAdaptFiltersDialog");

		var oAdaptDialogConditionModel = this._getConditionModel().clone();
		oAdaptFiltersDialog.setModel(oAdaptDialogConditionModel, "cmodel");

		this.addDependent(oAdaptFiltersDialog);

		this._oAdaptFiltersDialog = oAdaptFiltersDialog;

		oAdaptFiltersDialog.open();
	};

	FilterBar.prototype._addFilterPositionyChange = function(sName, nPosition) {
		var oFilterField = this._getFilterField(sName);
		var sId = oFilterField ? oFilterField.getId() : this._getFilterFieldId(sName);

		this._removeSetFilterPositionChange(sId);

		var oContent = {
			id: sId,
			position: nPosition
		};

		this._aChanges.push({
			selectorElement: this,
			changeSpecificData: {
				changeType: "setFilterPosition",
				content: oContent
			}
		});
	};

	FilterBar.prototype._createFilterVisibilityChangeContent = function(sId, sName, sType, oConstraints, oFormatOptions, bRequired, sLabel, maxCondition, sFieldHelp) {
		return {
			id: sId,
			name: sName,
			type: sType,
			conditions: '\{' + this._getConditionModelName() + ">/conditions/" + sName + '\}',
			constraints: merge({}, oConstraints),
			formatOptions: merge({}, oFormatOptions),
			required: bRequired,
			label: sLabel,
			maxConditions: maxCondition,
			fieldHelp: sFieldHelp
		};
	};

	FilterBar.prototype._isMultiValue = function(oProperty) {
		var bIsMultiValue = true;

		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression

		switch (oProperty.filterExpression) {
			case "SearchExpression":
			case "SingleRange":
			case "SingleValue": bIsMultiValue = false; break;
			default: break;
		}

		return bIsMultiValue;
	};

	FilterBar.prototype._createFilterVisibilityChangeContentByProperty = function(sId, sKey, oProperty) {
		var maxCond = this._isMultiValue(oProperty) ? -1 : 1;

		return this._createFilterVisibilityChangeContent(sId, sKey, oProperty.type, oProperty.constraints, oProperty.formatOptions, oProperty.required, oProperty.label, maxCond, oProperty.fieldHelp);
	};

	FilterBar.prototype._createFilterVisibilityChangeContentByFilterField = function(sId, sKey, oFilterField) {
		return this._createFilterVisibilityChangeContent(sId, sKey, oFilterField.getDataType(), oFilterField.getDataTypeConstraints(), oFilterField.getDataTypeFormatOptions(), oFilterField.getRequired(), oFilterField.getLabel(), oFilterField.getMaxConditions(), oFilterField.getFieldHelp());
	};

	FilterBar.prototype._addFilterVisibilityChange = function(sName, bVisible) {
		var oFilterField = this._getFilterField(sName), oProperty = this._getNonHiddenPropertyByName(sName);

		if (bVisible) {
			if (!oFilterField) {
				this._aChanges.push({
					selectorElement: this,
					changeSpecificData: {
						changeType: "addFilter",
						content: this._createFilterVisibilityChangeContentByProperty(this._getFilterFieldId(sName), sName, oProperty)
					}
				});
			} else {
				if (oFilterField.getVisible()) {
					this._removeRemoveFilterChange(oFilterField);
				} else {
					this._aChanges.push({
							selectorElement: this,
							changeSpecificData: {
								changeType: "addFilter",
								content: this._createFilterVisibilityChangeContentByFilterField(oFilterField.getId(), sName, oFilterField)
							}
						});
				}
			}
		} else {
			if (oFilterField) {
				this._aChanges.push({
					selectorElement: this,
					changeSpecificData: {
						changeType: "removeFilter",
						content: this._createFilterVisibilityChangeContentByFilterField(oFilterField.getId(), sName, oFilterField)
					}
				});

			} else {
				this._removeAddFilterChange(oProperty);
			}
		}
	};

	FilterBar.prototype._createAddRemoveConditionChangeWithFieldPath = function(sChangeType, sFieldPath, oCondition) {

		var oObj = this._determineType(sFieldPath);
		if (!oObj) {
			return null;
		}

		if (oObj.isA && oObj.isA("sap.ui.mdc.FilterField")) {
			return this._createAddRemoveConditionChangeWithField(sChangeType, oObj, oCondition);
		} else {
			return this._createAddRemoveConditionChange(sChangeType, sFieldPath, oObj.type, oObj.formatOptions, oObj.constraints, oCondition);
		}
	};

	FilterBar.prototype._createAddRemoveConditionChange = function(sChangeType, sFieldPath, sType, oFormatOptions, oConstraints, oCondition, aOutConditions, nIndex) {

		var oConditionExternalValue = oCondition;

		if (oCondition && oCondition.values && oCondition.values.length > 0) {
			oConditionExternalValue = ConditionUtil.toExternal(oCondition, sType, oFormatOptions, oConstraints);
		}

		var oChange = {
			selectorElement: this,
			changeSpecificData: {
				changeType: sChangeType,
				content: {
					name: sFieldPath,
					condition: oConditionExternalValue,
					index: nIndex,
					outConditions: aOutConditions ? aOutConditions : null
				}
			}
		};

		return oChange;
	};

	FilterBar.prototype._createAddRemoveConditionChangeWithField = function(sChangeType, oFilterField, oCondition, aOutConditions, nIndex) {
		return this._createAddRemoveConditionChange(sChangeType, oFilterField.getFieldPath(), oFilterField.getDataType(), oFilterField.getDataTypeFormatOptions(), oFilterField.getDataTypeConstraints(), oCondition, aOutConditions, nIndex);
	};

	FilterBar.prototype._removeAddFilterChange = function(oProperty) {
		var nIndex = -1;
		this._aChanges.some(function(oChange, nIdx) {
			if ((oChange.changeSpecificData.changeType === "addFilter") && (oChange.changeSpecificData.content.name === oProperty.name)) {
				nIndex = nIdx;
			}
			return nIndex > -1;
		});

		if (nIndex > -1) {
			this._aChanges.splice(nIndex, 1);
		}
	};

	FilterBar.prototype._removeRemoveFilterChange = function(oFilterField) {
		var nIndex = -1;
		this._aChanges.some(function(oChange, nIdx) {
			if ((oChange.changeSpecificData.changeType === "removeFilter") && (oChange.changeSpecificData.content.id === oFilterField.getId())) {
				nIndex = nIdx;
			}

			return nIndex > -1;
		});

		if (nIndex > -1) {
			this._aChanges.splice(nIndex, 1);
		}
	};

	FilterBar.prototype._removeSetFilterPositionChange = function(sId) {
		var nIndex = -1;
		this._aChanges.some(function(oChange, nIdx) {
			if ((oChange.changeSpecificData.changeType === "setFilterPosition") && (oChange.changeSpecificData.content.id === sId)) {
				nIndex = nIdx;
			}
			return nIndex > -1;
		});

		if (nIndex > -1) {
			this._aChanges.splice(nIndex, 1);
		}
	};

	FilterBar.prototype._clearChanges = function() {
		this._aChanges = [];
	};

	//will be removed, once the AFDialog sents only information about marked items
	FilterBar.prototype._condenseChange = function() {
		var aResultingChanges = [];
		this._aChanges.every(function(oChange) {
			var i, oCurrentChange, bIgnoreChange = false;
			if (oChange.changeSpecificData.changeType === "setFilterPosition") {
				if (oChange.changeSpecificData.content.id) {
					for (i = 0; i < this._aChanges.length; i++) {
						oCurrentChange = this._aChanges[i];
						// removeFilter is already condensed
						if ((oCurrentChange.changeSpecificData.changeType === "removeFilter") && (oCurrentChange.changeSpecificData.content.id === oChange.changeSpecificData.content.id)) {
							bIgnoreChange = true;
							break;
						}
					}
				} else if (oChange.changeSpecificData.content.name) {
					bIgnoreChange = true;
					for (i = 0; i < this._aChanges.length; i++) {
						oCurrentChange = this._aChanges[i];
						// addFilter is already condensed
						if ((oCurrentChange.changeSpecificData.changeType === "addFilter") && (oCurrentChange.changeSpecificData.content.name === oChange.changeSpecificData.content.name)) {
							bIgnoreChange = false;
							break;
						}
					}
				}

				if (!bIgnoreChange) {
					aResultingChanges.push(oChange);
				}
			} else {
				aResultingChanges.push(oChange);
			}

			return true;
		}.bind(this));

		this._aChanges = aResultingChanges;
	};

	FilterBar.prototype._storeChanges = function() {
		if (!this.getSupportP13N()) {
			this._clearChanges();
			return;
		}

		this._condenseChange();

		if (this._aChanges && this._aChanges.length) {
			var bHasVariantManagement = FlexRuntimeInfoAPI.hasVariantManagement({element: this});

			try {

				ControlPersonalizationWriteAPI.add({
					changes: this._aChanges,
					ignoreVariantManagement: !bHasVariantManagement
				});
			} catch (ex) {
				Log.error("error while saving changes - " + ex.message);
			}

			this._clearChanges();
		}
	};


	FilterBar.prototype._setItemsForAdaptFiltersDialog = function() {
		var aFilterItems = this.getFilterItems();

		if (this._getNonHiddenPropertyInfoSet().length > 0) {


			return this._getNonHiddenPropertyInfoSet().map(function(oProperty, iIndex) {

				var sKey = this._getFilterFieldPath(oProperty);
				var oFilterField = this._getFilterField(sKey);
				var iPosition = aFilterItems.indexOf(oFilterField);

				var oFilterItem = oFilterField ? oFilterField.clone() : this.createFilterField(oProperty);
				oFilterItem.setVisible(true);

				oFilterItem.bindProperty("conditions", {
					path: "cmodel>/conditions/" + sKey
				});

				return {
					key: sKey,
					text: oProperty.label,
					tooltip: oProperty.tooltip,
					required: oProperty.required,
					relativePosition: iPosition,
					visible: (iPosition > -1) && oFilterField.getVisible(), // Assumption: all filter items existing in the filterItems aggregation are visible
					controls: [
						oFilterItem
						]
				};
			}.bind(this));

		} else {

			return aFilterItems.map(function(oFilterField, iIndex) {
				var oFilterItem = oFilterField.clone();

				oFilterItem.bindProperty("conditions", {
					path: "cmodel>/conditions/" + oFilterItem.getFieldPath()
				});

				return {
					key: oFilterItem.getFieldPath(),
					text: oFilterItem.getFieldPath(),
					tooltip: oFilterItem.getTooltip(),
					required: oFilterItem.getRequired(),
					relativePosition: iIndex,
					visible: oFilterField.getVisible(),
					controls: [
						oFilterItem
						]
				};
			});

		}
	};


	FilterBar.prototype._getContent = function() {
		return this._oFilterBarLayout;
	};

	FilterBar.prototype._insertFilterFieldtoContent = function(oFilterItem, nIdx) {

		if (!FilterItemLayout) {
			return;
		}

		var oLayoutItem = new FilterItemLayout();
		oLayoutItem.setFilterField(oFilterItem);

		this._oFilterBarLayout.insertContent(oLayoutItem, nIdx);
	};

	FilterBar.prototype._filterItemInserted = function(oFilterField) {

		if (!oFilterField.getVisible()) {
			return;
		}

		if (oFilterField.setWidth) {
			oFilterField.setWidth("");
		}

		if (this._isChangeApplying()) {
			this._suspendBinding(oFilterField);
		}

		this._applyFilterItemInserted(oFilterField);
	};

	FilterBar.prototype._applyFilterItemInserted = function(oFilterField) {
		var nIndex, iIndex;

		iIndex = this.indexOfAggregation("filterItems", oFilterField);
		if (this.getAggregation("basicSearchField")) {
			iIndex++;
		}

		nIndex = iIndex;
		var aFilterFields = this.getFilterItems();
		for (var i = 0; i < nIndex; i++) {
			if (!aFilterFields[i].getVisible()) {
				iIndex--;
			}
		}

		this._insertFilterFieldtoContent(oFilterField, iIndex);

		if (!this._oObserver.isObserved(oFilterField, {properties: ["visible"]})) {
			this._oObserver.observe(oFilterField, {properties: ["visible"]});
		}
	};

	FilterBar.prototype._filterItemRemoved = function(oFilterItem) {
		this._applyFilterItemRemoved(oFilterItem.getFieldPath());
	};

	FilterBar.prototype._applyFilterItemRemoved = function(sFieldPath) {
		this._removeFilterFieldFromContentByName(sFieldPath);
	};

	FilterBar.prototype._removeFilterFieldFromContent = function(oFilterItem) {
		this._removeFilterFieldFromContentByName(oFilterItem.getFieldPath());
	};

	FilterBar.prototype._removeFilterFieldFromContentByName = function(sFieldPath) {
		var oLayoutItem = this._getFilterItemLayoutByName(sFieldPath);

		if (oLayoutItem) {
			this._oFilterBarLayout.removeContent(oLayoutItem);
			oLayoutItem.destroy();
		}
	};

	FilterBar.prototype._observeChanges = function(oChanges) {

		if (oChanges.type === "aggregation" && oChanges.name === "filterItems") {

			switch (oChanges.mutation) {
				case "insert":
					this._filterItemInserted(oChanges.child);
					break;
				case "remove":
					this._filterItemRemoved(oChanges.child);
					break;
				default:
					Log.error("operation " + oChanges.mutation + " not yet implemented");
			}
		} else if (oChanges.type === "property") {
			var oFilterField;

			if (oChanges.object.isA && oChanges.object.isA("sap.ui.mdc.FilterField")) { // only visible is considered
				oFilterField = oChanges.object; //this._getFilterField(oChanges.object.getFieldPath());
				if (oFilterField) {
					if (oChanges.current) {
						this._filterItemInserted(oFilterField);
					} else {
						this._filterItemRemoved(oFilterField);
					}

					this._oFilterBarLayout.rerender();
				}
			}
		}
	};

	FilterBar.prototype._getFilterItemLayout = function(oFilterField) {
		return this._getFilterItemLayoutByName(oFilterField.getFieldPath());
	};
	FilterBar.prototype._getFilterItemLayoutByName = function(sFieldPath) {
		var oFilterItemLayout = null;

		this._oFilterBarLayout.getContent().some(function(oItemLayout) {
			if (oItemLayout._getFieldPath() === sFieldPath) {
				oFilterItemLayout = oItemLayout;
			}

			return oFilterItemLayout !== null;
		});

		return oFilterItemLayout;
	};

	FilterBar.prototype._getFilterField = function(sName) {
		var oFilterField = null;
		this.getFilterItems().some(function(oFilterItem) {
			if (oFilterItem && oFilterItem.getFieldPath && (oFilterItem.getFieldPath() === sName)) {
				oFilterField = oFilterItem;
			}

			return oFilterField !== null;
		});

		return oFilterField;
	};


	FilterBar.prototype._retrieveMetadata = function() {

		return new Promise(function(resolve) {
			Promise.all([ this._initializeProvider(), this._oMetaModelSetPromise
				]).then(function(aArgs) {

					if (!this._bIsBeingDestroyed) {

						var oProvider = aArgs[0];
						var oMetadataModel = aArgs[1];

						this._aProperties = [];

						if (oProvider && oProvider.fetchProperties) {
							try {
								oProvider.fetchProperties(oMetadataModel, this._getEntitySetName()).then(function(aProperties) {
									this._aProperties = aProperties;

									if (this._aProperties.length === 0) {
										this._createLocalPropertySet();
									}

									this._fResolveFilterBarMetadataApplied();
								}.bind(this));
							} catch (ex) {
								Log.error("Exception during fetchProperties occured: " + ex.message);
							}
						} else {
							Log.error("Provided metadataDelegate '" + this.getMetadataDelegate() + "' not valid.");
						}

						if (this._aProperties.length === 0) {
							this._createLocalPropertySet();
						}

						this._fResolveFilterBarMetadataApplied();
					}

					resolve();

				}.bind(this));
		}.bind(this));
	};


	FilterBar.prototype._createLocalPropertySet = function() {

		this.getFilterItems().forEach(function(oFF) {
			var bLocalVHelp = this._isInternalVH(oFF);
			var oPI = {
				name: oFF.getFieldPath(),
				label: oFF.getLabel(),
				required: oFF.getRequired(),
				type: oFF.getDataType(),
				constraints: oFF.getDataTypeConstraints(),
				formatOptions: oFF.getDataTypeFormatOptions(),
				visible: oFF.getVisible(),
				filterable: true,
				hiddenFilter: false,
				//filterExpression: ((oFF.getMaxConditions() === 1) ? FilterExpression.Single : FilterExpression.Multiple),
				hasFieldHelp: bLocalVHelp,
				fieldHelp: bLocalVHelp ? "" : oFF.getFieldHelp()
			};

			this._aProperties.push(oPI);
		}.bind(this));
	};

	FilterBar.prototype._isInternalVH = function(oFilterField) {
		var oControl, oValueHelp, bIsLocal = false;
		if (oFilterField.getFieldHelp()) {
			oValueHelp = sap.ui.getCore().byId(oFilterField.getFieldHelp());
			if (oValueHelp) {
				do {
					oControl = oValueHelp.getParent();
					if (oControl === oFilterField) {
						bIsLocal = true;
					} else if (oControl === this) {
						oControl = null;
					}

				} while (!bIsLocal && oControl);
			}
		}

		return bIsLocal;
	};


	FilterBar.prototype.setBasicSearchField = function(oBasicSearchField) {

		var oOldBasicSearchField = this.getAggregation("basicSearchField");
		if (oOldBasicSearchField) {
			this._removeFilterFieldFromContent(oOldBasicSearchField);
		}

		this.setAggregation("basicSearchField", oBasicSearchField);

		if (oBasicSearchField) {

			if (!this._oObserver.isObserved(oBasicSearchField, {properties: ["visible"]})) {
				this._oObserver.observe(oBasicSearchField, {properties: ["visible"]});
			}

			this._insertFilterFieldtoContent(oBasicSearchField, 0);
		}

		return this;
	};


	FilterBar.prototype.getPropertyInfoSet = function() {
		return this._aProperties || [];
	};

	FilterBar.prototype._getNonHiddenPropertyInfoSet = function() {
		var aVisibleProperties = [];
		this.getPropertyInfoSet().every(function(oProperty) {
			if (!oProperty.hiddenFilter) {

				if (oProperty.name !== "$search") {
					aVisibleProperties.push(oProperty);
				}
			}

			return true;
		});

		return aVisibleProperties;
	};


	FilterBar.prototype._getNonHiddenPropertyByName = function(sName) {
		var oProperty = null;
		this._getNonHiddenPropertyInfoSet().some(function(oProp) {
			if (oProp.name === sName) {
				oProperty = oProp;
			}

			return oProperty != null;
		});

		return oProperty;
	};

	FilterBar.prototype._getPropertyByName = function(sName) {
		var oProperty = null;
		this.getPropertyInfoSet().some(function(oProp) {
			if (oProp.name === sName) {
				oProperty = oProp;
			}

			return oProperty != null;
		});

		return oProperty;
	};

	FilterBar.prototype._getFilterFieldId = function(sName) {
		return this.getId() + "--filter--" + IdentifierUtil.replace(sName);
	};


	FilterBar.prototype._getFilterFieldPath = function(oProperty) {
		if (oProperty) {
			return oProperty.path || oProperty.name;
		}

		return null;
	};

	/**
	 * Returns a new FilterField instance.
	 * @public
	 * @param {sap.ui.mdc.PropertyInfo} oProperty metadata describing a filter.
	 * @returns {sap.ui.mdc.FilterField} An instance of the FilterField.
	 */
	FilterBar.prototype.createFilterField = function(oProperty) {
		var oFilterField, nMaxCondition = 1, sVHId = null;

		if (this._isMultiValue(oProperty)) {
			nMaxCondition = -1;
		}

		oFilterField = new FilterField(this._getFilterFieldId(oProperty.name), {
			label: oProperty.label,
			dataType: oProperty.type,
			dataTypeConstraints: merge({}, oProperty.constraints),
			dataTypeFormatOptions: merge({}, oProperty.formatOptions),
			maxConditions: nMaxCondition,
			required: oProperty.required,
			visible: oProperty.visible
		});

		oFilterField.bindProperty("conditions", {
			path: this._getConditionModelName() + ">/conditions/" + this._getFilterFieldPath(oProperty)
		}, true);

		var aValues = oProperty.filterConditions;
		if (aValues && (aValues.length > 0)) {
			oFilterField.setConditions(aValues);
		}

		if (oProperty.tooltip) {
			oFilterField.setTooltip(oProperty.tooltip);
		}

		sVHId  = oProperty.fieldHelp;
		if (sVHId) {
			oFilterField.setFieldHelp(this._getView().createId(sVHId));
		}

		var oModel = this._getConditionModel();
		if (oModel) {
			oFilterField.setModel(oModel, this._getConditionModelName());
		}

		return oFilterField;
	};


	FilterBar.prototype.applyConditionsAfterChangesApplied = function() {
		if (this._isChangeApplying()) {
			return;
		}
		this._bIgnoreChanges = true;

		var aFilterFields = this.getFilterItems();
		aFilterFields.forEach( function(oFilterField) {
			this._suspendBinding(oFilterField);
		}.bind(this));

		// Wait until all changes have been applied
		this._oFlexPromise = FlexRuntimeInfoAPI.waitForChanges({element: this});
		this._bIgnoreChanges = true;

		Promise.all([this._oFlexPromise, this._oInitialFiltersAppliedPromise]).then(function(vArgs) {

			this._applyFiltersConditionsChanges();

			this._resumeBindings();

			this._oFlexPromise = null;

			if (!this._iShadowModelResolveTimer && !this._iShadowModelTimer) {
				this._iShadowModelTimer = setTimeout(function() {
					delete this._iShadowModelTimer;
					this._createShadowModel();
				}.bind(this), 0);
			}

		}.bind(this));
	};

	FilterBar.prototype.waitForInitialFiltersApplied = function() {
		return this._oInitialFiltersAppliedPromise;
	};

	FilterBar.prototype._suspendBinding = function(oFilterField) {

		if (oFilterField) {
			var oBinding = oFilterField.getBinding("conditions");
			if (oBinding) {
				if (!this._aBindings) {
					this._aBindings = [];
				}
				oBinding.suspend();
				this._aBindings.push(oFilterField);
			}
		}
	};

	FilterBar.prototype._resumeBindings = function() {
		if (this._aBindings) {
			this._aBindings.forEach(function(oFilterField) {
				if (!oFilterField.bIsDestroy) {
					var oBinding = oFilterField.getBinding("conditions");
					if (oBinding) {
						oBinding.resume();
					}
				}
			});

			this._aBindings = null;
		}
	};


	FilterBar.prototype._isChangeApplying = function() {
		return  !!this._oFlexPromise;
	};

	FilterBar.prototype._applyInitialFiltersConditions = function() {

		this._bIgnoreChanges = true;

		this._applyFiltersConditionsChanges();

		if (!this._iShadowModelResolveTimer) {
			if (this._iShadowModelTimer) {
				// shadow model is created here too, do not need twice
				clearTimeout(this._iShadowModelTimer);
				delete this._iShadowModelTimer;
			}
			this._iShadowModelResolveTimer = setTimeout(function() {
				delete this._iShadowModelResolveTimer;
				this._createShadowModel();

				this._fResolveInitialFiltersApplied();
			}.bind(this), 0);
		}

	};

	FilterBar.prototype._applyFiltersConditionsChanges = function() {

		var aConditions, aConditionsData, oConditionModel, oObj, sType, oFormatOptions, oConstraints;

		var mSettings = this.getProperty("filtersConditions");
		if (Object.keys(mSettings).length > 0) {

			aConditionsData = merge([], mSettings);
			oConditionModel = this._getConditionModel();


			oConditionModel.removeAllConditions(); //TODO: needs more consideration.


			if (aConditionsData) {
				for ( var sFieldPath in aConditionsData) {
					aConditions = aConditionsData[sFieldPath];

					oObj = this._determineType(sFieldPath);
					if (oObj) {
						if (oObj.isA && oObj.isA("sap.ui.mdc.FilterField")) {
							sType = oObj.getDataType();
							oFormatOptions = oObj.getDataTypeFormatOptions();
							oConstraints = oObj.getDataTypeConstraints();
						} else {
							sType = oObj.type;
							oFormatOptions = oObj.formatOptions;
							oConstraints = oObj.constraints;
						}

						/* eslint-disable no-loop-func */
						aConditions.forEach(function(oCondition) {
							oCondition = ConditionUtil.toInternal(oCondition, sType, oFormatOptions, oConstraints);
							var oNewCondition = Condition.createCondition(oCondition.operator, oCondition.values);
							oConditionModel.addCondition(sFieldPath, oNewCondition);
						});
						/* eslint-enable no-loop-func */
					}
				}
			}
		}
	};

	FilterBar.prototype._createShadowModel = function() {
		var aConditions, mSettings = {};
		var oConditionModel = this._getConditionModel();

		var aConditionsModelData = oConditionModel.getAllConditions();

		for (var sFieldPath in aConditionsModelData) {
			 aConditions = aConditionsModelData[sFieldPath];

			 /* eslint-disable no-loop-func */
			 aConditions.forEach(function(oCondition) {

				 if (!mSettings[sFieldPath]) {
					 mSettings[sFieldPath] = [];
				 }
				 mSettings[sFieldPath].push(oCondition);
			 });
			 /* eslint-enable no-loop-func */


			 this._cleanupConditions(mSettings[sFieldPath]);
		}

		this.setProperty("filtersConditions", mSettings);

		this._bIgnoreChanges = false;

		this._handleConditionModelChange();
	};

	FilterBar.prototype._getView = function() {
		if (!this._oView) {
			var oObj = this.getParent();
			while (oObj) {
				if (oObj.isA("sap.ui.core.mvc.View")) {
					this._oView = oObj;
					break;
				}
				oObj = oObj.getParent();
			}
		}
		return this._oView;
	};

	/**
	 * Returns array of model Filter instances from the inner ConditionModel.
	 *
	 * @public
	 * @returns {sap.ui.model.Filter[]} Array containing model filters or empty.
	 */
	FilterBar.prototype.getFilters = function() {
		return this._getConditionModel() ? this._getConditionModel().getFilters() : [];
	};

	FilterBar.prototype.exit = function() {

		Control.prototype.exit.apply(this, arguments);

		if (this._oFilterBarLayout) {
			this._oFilterBarLayout.destroy();
			this._oFilterBarLayout = null;
		}

		this._btnAdapt = undefined;
		this._btnSearch = undefined;

		this._oRb = null;

		if (this._oModel) {
			this._oModel.destroy();
			this._oModel = null;
		}

		if (this._oConditionChangeBinding) {
			this._oConditionChangeBinding.detachChange(this._handleConditionModelChange, this);
			this._oConditionChangeBinding = null;
		}

		if (this._oConditionModel) {
			this._oConditionModel.destroy();
			this._oConditionModel = null;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

		this._aProperties = null;

		this._oFlexPromise = null;
		this._oMetadataPromise = null;

		this._fResolveFilterBarConditionModel = undefined;
		this._oConditionModelPromise = null;

		this._fResolveFilterBarMetaModelSet = undefined;
		this._oMetaModelSetPromise = null;

		this._fResolveFilterBarMetadataApplied = undefined;
		this._oMetadataAppliedPromise = null;

		this._fResolveInitialFiltersApplied = undefined;
		this._oInitialFiltersAppliedPromise = null;

		if (this._iShadowModelTimer) {
			clearTimeout(this._iShadowModelTimer);
			delete this._iShadowModelTimer;
		}

		if (this._iShadowModelResolveTimer) {
			clearTimeout(this._iShadowModelResolveTimer);
			delete this._iShadowModelResolveTimer;
		}

		this._aChanges = null;
		this._oView = null;
		this._aBindings = null;
	};

	return FilterBar;

}, /* bExport= */true);