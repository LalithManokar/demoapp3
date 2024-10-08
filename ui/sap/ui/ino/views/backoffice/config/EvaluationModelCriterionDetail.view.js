/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelCriterionDetail", {

	// global controls
	oParentView: null,
	bIncludeToolbar: false,
	oCriterionLayout: null,
	oCriterionTreeTable: null,
	oCriterionDetailLayout: null,
	oButtonToolbar: null,
	bRefreshOngoing: false,
	oCodeField: null,
	oNameField: null,
	oIsOverallResultField: null,
	oDataTypeField: null,
	oAggregationTypeField: null,
	oMinValueField: null,
	oMaxValueField: null,
	oStepSizeField: null,
	oUnitField: null,
	oXAxisCriterionField: null,
	oYAxisCriterionField: null,
	oXAxisSegmentsField: null,
	oYAxisSegmentsField: null,
	oValueHelpField: null,
	oInnerCircleCriterionField: null,
	oOuterCircleCriterionField: null,
	oDescriptionField: null,

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.EvaluationModelCriterionDetail";
	},

	createContent: function(oController) {
		var oViewData = this.getViewData();
		var oController = this.getController();
		this.oParentView = oViewData.parentView;
		this.bIncludeToolbar = oViewData.includeToolbar;
		oController.setParentController(this.oParentView.getController());
		var oModel = this.getModel(oController.getModelName());
		if (!oModel) {
			// Model was not yet set, do that now, publish the default model
			this.setModel(this.getModel(), oController.getModelName());
		}

		this.attachBeforeExit(this.onBeforeExit);

		var bEdit = oController.isInEditMode();
		this.oCriterionLayout = this.createLayoutCriterions(bEdit);
		return this.oCriterionLayout;
	},

	setIncludeToolbar: function(bIncludeToolbar) {
		this.bIncludeToolbar = bIncludeToolbar;
	},

	setCriterionBinding: function(oBinding) {
		var oController = this.getController();
		var oModel = this.getModel(oController.getModelName());
		if (!oModel) {
			// Model was not yet set, do that now, publish the default model
			this.setModel(this.getModel(), oController.getModelName());
		}
		// first clean all rows of the criterion detail display
		this.oCriterionDetailLayout.destroyRows();
		this.oCriterionDetailLayout.removeAllRows();
		// set the binding
		try{
		    if(this.oCriterionTreeTable.getBinding("rows")){
		        this.oCriterionTreeTable.unbindRows();
		    }
		}catch(ex){
		}
		this.oCriterionTreeTable.bindRows(oBinding);
	},

	setCriterionContext: function(oBindingContext) {
		this.oCriterionDetailLayout.setBindingContext(oBindingContext, this.getController().getModelName());
		if (this.oButtonToolbar) {
			this.oButtonToolbar.setBindingContext(oBindingContext, this.getController().getModelName());
		}
		var bEdit = this.getController().isInEditMode();
		this.createCriterionDetailContent(bEdit, this.oCriterionDetailLayout, oBindingContext);
	},

	setCriterionContextByCriterionID: function(iCriterionID) {
		this.setCriterionContextByID(iCriterionID);
	},

	setCriterionContextBySubCriterionID: function(sParentID, iCriterionID) {
		var oModel = this.getController().getModel();
		var aRows = this.oCriterionTreeTable.getRows();

		for (var i = 0; i < aRows.length; i++) {
			var oRowContext = this.oCriterionTreeTable.getContextByIndex(i);
			var iID = oModel.getProperty("ID", oRowContext);
			if (iID === sParentID) {
				this.oCriterionTreeTable.expand(i);
				this.setCriterionContextByID(iCriterionID);
				break;
			}
		}
	},

	setCriterionContextByID: function(iCriterionID) {
		var that = this;
		var oModel = this.getController().getModel();

		//private event "_rowupdate" is in Table API , not delivered
		//private event "_rowupdate"  triggered when treetable is updated the models
		var fnEvaluationCriterionUpdate = function() {
			var aRows = that.oCriterionTreeTable.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRowContext = that.oCriterionTreeTable.getContextByIndex(i);
				var iID = oModel.getProperty("ID", oRowContext);
				if (iID === iCriterionID) {
					that.oCriterionDetailLayout.setBindingContext(oRowContext, that.getController().getModelName());
					that.oCriterionTreeTable.setSelectedIndex(i);
					break;
				}
			}
			that.oCriterionTreeTable.detachEvent("_rowsUpdated", fnEvaluationCriterionUpdate);
		};

		this.oCriterionTreeTable.attachEvent("_rowsUpdated", fnEvaluationCriterionUpdate);

	},

	getSelectedCriterionContext: function() {
		var selectedIndex = this.oCriterionTreeTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oCriterionTreeTable.getContextByIndex(selectedIndex) != null) {
			return this.oCriterionTreeTable.getContextByIndex(selectedIndex);
		};
		return null;
	},

	createLayoutCriterions: function(bEdit) {

		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['250px', '20px', '300px', '10%']
		});

		if (bEdit == true && this.bIncludeToolbar == true) {
			this.oButtonToolbar = this.createCriterionButtonToolbar(bEdit);

			var oButtonRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oButtonToolbar,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin,
					colSpan: 3
				})]

			});
			oContent.addRow(oButtonRow);
		}

		this.oCriterionTreeTable = this.createCriterionTreeTable(bEdit);
		this.oCriterionDetailLayout = this.createCriterionDetailLayout(bEdit);

		var oCriterionRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCriterionTreeTable,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCriterionDetailLayout,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});

		oContent.addRow(oCriterionRow);

		return oContent;
	},

	createCriterionDetailLayout: function(bEdit) {
		var oCriterionDetailLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['140px', '60%']
		});

		return oCriterionDetailLayout;
	},

	refreshCriterionDetailContent: function(oEvent) {
		// watchguard for the endless recursion
		if (this.bRefreshOngoing === true) {
			return;
		}

		this.bRefreshOngoing = true;
		var oSourceControl = null;
		if (oEvent) {
			oSourceControl = oEvent.getSource();
		}
		var bEdit = this.getController().isInEditMode();
		var oRowContext = this.getSelectedCriterionContext();
		if (bEdit) {
			var oController = this.getController();
			var oModel = oController.getModel();
			var sDataType = oModel.getProperty("DATATYPE_CODE", oRowContext);
			var sAggregationType = oModel.getProperty("AGGREGATION_TYPE", oRowContext);
			var sValueOptionListCode = oModel.getProperty("VALUE_OPTION_LIST_CODE", oRowContext);

			if (oRowContext && (!!sAggregationType || !!sValueOptionListCode || (sDataType !== "INTEGER" && sDataType !== "NUMERIC"))) {
			    var value = oModel.getProperty(oRowContext.getPath() + "/NUM_VALUE_STEP_SIZE");
				oModel.setProperty(oRowContext.getPath() + "/NUM_VALUE_STEP_SIZE", value);
			}
		}
		this.createCriterionDetailContent(bEdit, this.oCriterionDetailLayout, oRowContext, oSourceControl);
		if (oSourceControl) {
			oSourceControl.focus();
		}
		this.bRefreshOngoing = false;
	},

	createCriterionDetailContent: function(bEdit, oCriterionDetailLayout, oBindingContext, oEventSourceControl) {
		// set watch-guard
		this.bRefreshOngoing = true;
		// first clean all rows
		oCriterionDetailLayout.removeAllRows();

		var oController = this.getController();
		var oModel = oController.getModel();

		// get the ID
		var iID = oModel.getProperty("ID", oBindingContext);
		if (!iID) {
			// maybe there is a code
			iID = oModel.getProperty("CODE", oBindingContext);
		}
		var iParentID = oModel.getProperty("PARENT_CRITERION_ID", oBindingContext);
		if (!iParentID) {
			// maybe there is a code
			iParentID = oModel.getProperty("PARENT_CRITERION_CODE", oBindingContext);
		}
		var sDataType = oModel.getProperty("DATATYPE_CODE", oBindingContext);
		var sAggregationType = oModel.getProperty("AGGREGATION_TYPE", oBindingContext);
		var sValueOptionListCode = oModel.getProperty("VALUE_OPTION_LIST_CODE", oBindingContext);
		var iIsOverallResult = oModel.getProperty("IS_OVERALL_RESULT", oBindingContext);
		// no ID? Return, nothing to do
		if (!iID || iID === 0 || iID === "") {
			// deactivate watch-guard! Do not forget that!
			this.bRefreshOngoing = false;
			return;
		}

		var sCodeModelName = null;
		if (oModel.getCriterionCodeModel) {
			var oCriterionCodeModel = oModel.getCriterionCodeModel();
			sCodeModelName = "criterionCode";
			this.setModel(oCriterionCodeModel, sCodeModelName);
		}

		if (!this.oNameLabel || this.oNameLabel.bIsDestroyed === true) {
			this.oNameLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_DEFAULT_TEXT",
				Tooltip: "BO_CRITERION_FLD_DEFAULT_TEXT"
			});
		}
		if (!this.oNameField || this.oNameField.bIsDestroyed === true) {
			this.oNameField = this.createControl({
				Type: "textfield",
				Node: "Criterion",
				Text: "DEFAULT_TEXT",
				Editable: bEdit,
				LabelControl: this.oNameLabel
			});
		}
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oNameLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oNameField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCriterionDetailLayout.addRow(oRow);

		if (!this.oCodeLabel || this.oCodeLabel.bIsDestroyed === true) {
			this.oCodeLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_PLAIN_CODE",
				Tooltip: "BO_CRITERION_FLD_PLAIN_CODE"
			});
		}

		if (!this.oCodeField || this.oCodeField.bIsDestroyed === true) {
			var sCodePath = "PLAIN_CODE";
			this.oCodeField = this.createControl({
				Type: "textfield",
				Node: "Criterion",
				Text: sCodePath,
				Editable: bEdit,
				LabelControl: this.oCodeLabel
			});
		}

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCriterionDetailLayout.addRow(oRow);

		if (!iParentID || iParentID === 0 || iParentID === "") {
			if (!this.oIsOverallResultLabel || this.oIsOverallResultLabel.bIsDestroyed === true) {
				this.oIsOverallResultLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_IS_OVERALL_RESULT",
					Tooltip: "BO_CRITERION_TOOLTIP_IS_OVERALL_RESULT"
				});
			}
			if (!this.oIsOverallResultField || this.oIsOverallResultField.bIsDestroyed === true) {
				this.oIsOverallResultField = this.createCheckBoxWithChangeHandler("IS_OVERALL_RESULT", "BO_CRITERION_TOOLTIP_IS_OVERALL_RESULT", bEdit,
					true, this.refreshCriterionDetailContent, this.oIsOverallResultLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oIsOverallResultLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oIsOverallResultField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if (!this.oDataTypeLabel || this.oDataTypeLabel.bIsDestroyed === true) {
			this.oDataTypeLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_DATATYPE_CODE",
				Tooltip: "BO_CRITERION_FLD_DATATYPE_CODE"
			});
		}
		if (!this.oDataTypeField || this.oDataTypeField.bIsDestroyed === true) {
			var aValueListFilters = this.createFilterForDataTypeList();
			this.oDataTypeField = this.createDropDownBoxForCode({
				Path: "DATATYPE_CODE",
				CodeTable: "sap.ino.xs.object.basis.Datatype.Root",
				Editable: bEdit,
				Visible: true,
				onChange: this.refreshCriterionDetailContent,
				WithEmpty: true,
				LabelControl: this.oDataTypeLabel,
				Filters: aValueListFilters
			});
		}
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDataTypeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDataTypeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCriterionDetailLayout.addRow(oRow);

		if ((!iParentID || iParentID === 0 || iParentID === "") && sDataType !== "TEXT") {
			if (!this.oAggregationTypeLabel || this.oAggregationTypeLabel.bIsDestroyed === true) {
				this.oAggregationTypeLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_AGGREGATION_TYPE",
					Tooltip: "BO_CRITERION_FLD_AGGREGATION_TYPE"
				});
			}
			var aAggregationTypeFilters = this.createFilterForAggregationType(sDataType);
			var oAggregationTypeSettings = {
				Path: "AGGREGATION_TYPE",
				CodeTable: "sap.ino.xs.object.evaluation.AggregationType.Root",
				Editable: bEdit,
				Visible: true,
				onChange: this.refreshCriterionDetailContent,
				WithEmpty: true,
				Filters: aAggregationTypeFilters,
				LabelControl: this.oAggregationTypeLabel
			};

			if (!this.oAggregationTypeField || this.oAggregationTypeField.bIsDestroyed === true || !this.oAggregationTypeField.getBinding("items")) {
				this.oAggregationTypeField = this.createDropDownBoxForCode(oAggregationTypeSettings);
			} else if (oEventSourceControl !== this.oAggregationTypeField) {
				// just update the binding to consider the changed filters if event that causes the recreation was not
				// triggered by that control
				var oAggregationTypeBinding = this.oAggregationTypeField.getBinding("items");

				if (aAggregationTypeFilters && oAggregationTypeBinding) {
					oAggregationTypeBinding.filter(aAggregationTypeFilters);
				}
			}

			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oAggregationTypeLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oAggregationTypeField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if ((!sAggregationType || sAggregationType === "" || sAggregationType === "AVG" || sAggregationType === "SUM" || sAggregationType === "FORMULA") && (sDataType === "INTEGER" || sDataType === "NUMERIC")) {
			if (!this.oWeightLabel || this.oWeightLabel.bIsDestroyed === true) {
				var oWeightLabel = new sap.m.HBox();
				oWeightLabel.addItem(this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_WEIGHT",
					Tooltip: "BO_CRITERION_FLD_WEIGHT_TIP"
				}));
				var oIcon = new sap.ui.core.Icon({
					src: "sap-icon://message-information",
					tooltip: "{i18n>BO_CRITERION_FLD_WEIGHT_TIP}"
				});
				oIcon.addStyleClass("sapUiInoEvaluationDetailInfo");
				oWeightLabel.addItem(oIcon);
				this.oWeightLabel = oWeightLabel;
			}
			if (!this.oWeightField || this.oWeightField.bIsDestroyed === true) {
				this.oWeightField = this.createControl({
					Type: "textfield",
					Node: "Criterion",
					Text: "WEIGHT",
					Editable: bEdit,
					LabelControl: this.oWeightLabel,
					Tooltip: "BO_CRITERION_FLD_WEIGHT_TIP"
				});
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oWeightLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oWeightField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if ((!sAggregationType || sAggregationType === "" || sAggregationType === "FORMULA") 
		    && (!sValueOptionListCode || sValueOptionListCode === "") 
		    && (sDataType === "INTEGER" || sDataType === "NUMERIC")) {
			if (!this.oMinValueLabel || this.oMinValueLabel.bIsDestroyed === true) {
				this.oMinValueLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_NUM_VALUE_MIN",
					Tooltip: "BO_CRITERION_FLD_NUM_VALUE_MIN"
				});
			}
			if (!this.oMinValueField || this.oMinValueField.bIsDestroyed === true) {
				this.oMinValueField = this.createControl({
					Type: "textfield",
					Node: "Criterion",
					Text: "NUM_VALUE_MIN",
					Editable: bEdit,
					DataType: new sap.ui.model.type.String(), // allow null values => use string type and check for
					// float in the model
					LabelControl: this.oMinValueLabel
				});
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oMinValueLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oMinValueField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);

			if (!this.oMaxValueLabel || this.oMaxValueLabel.bIsDestroyed === true) {
				this.oMaxValueLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_NUM_VALUE_MAX",
					Tooltip: "BO_CRITERION_FLD_NUM_VALUE_MAX"
				});
			}
			if (!this.oMaxValueField || this.oMaxValueField.bIsDestroyed === true) {
				this.oMaxValueField = this.createControl({
					Type: "textfield",
					Node: "Criterion",
					Text: "NUM_VALUE_MAX",
					Editable: bEdit,
					DataType: new sap.ui.model.type.String(), // allow null values => use string type and check for
					// float in the model
					LabelControl: this.oMaxValueLabel
				});
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oMaxValueLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oMaxValueField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
            if(sAggregationType !== "FORMULA"){
    			if (!this.oStepSizeLabel || this.oMaxValueLabel.bIsDestroyed === true) {
    				this.oStepSizeLabel = this.createControl({
    					Type: "label",
    					Text: "BO_CRITERION_FLD_NUM_VALUE_STEP_SIZE",
    					Tooltip: "BO_CRITERION_FLD_NUM_VALUE_STEP_SIZE"
    				});
    			}
    			if (!this.oStepSizeField || this.oStepSizeField.bIsDestroyed === true) {
    				this.oStepSizeField = this.createControl({
    					Type: "textfield",
    					Node: "Criterion",
    					Text: "NUM_VALUE_STEP_SIZE",
    					Editable: bEdit,
    					DataType: new sap.ui.model.type.String(), // allow null values => use string type and check for
    					// float in the model
    					LabelControl: this.oMaxValueLabel
    				});
    			}
    			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
    				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
    					content: this.oStepSizeLabel,
    					vAlign: sap.ui.commons.layout.VAlign.Top,
    					hAlign: sap.ui.commons.layout.HAlign.Begin
    				}), new sap.ui.commons.layout.MatrixLayoutCell({
    					content: this.oStepSizeField,
    					vAlign: sap.ui.commons.layout.VAlign.Top,
    					hAlign: sap.ui.commons.layout.HAlign.Begin
    				})]
    			});
    			oCriterionDetailLayout.addRow(oRow);
            }
		}

		if ((!sAggregationType || sAggregationType === "") && (sDataType === "INTEGER" || sDataType === "NUMERIC")) {
			if (!this.oUnitLabel || this.oUnitLabel.bIsDestroyed === true) {
				this.oUnitLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_UOM_CODE",
					Tooltip: "BO_CRITERION_FLD_UOM_CODE"
				});
			}
			if (!this.oUnitField || this.oUnitField.bIsDestroyed === true) {
				this.oUnitField = this.createDropDownBoxForCode({
					Path: "UOM_CODE",
					CodeTable: "sap.ino.xs.object.basis.Unit.Root",
					Editable: bEdit,
					Visible: true,
					WithEmpty: true,
					LabelControl: this.oUnitLabel
				});
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oUnitLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oUnitField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if (sAggregationType === "MATRIX") {
			if (!this.oXAxisCriterionLabel || this.oXAxisCriterionLabel.bIsDestroyed === true) {
				this.oXAxisCriterionLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_X_AXIS_CRITERION_CODE",
					Tooltip: "BO_CRITERION_FLD_X_AXIS_CRITERION_CODE"
				});
			}
			if (!this.oXAxisCriterionField || this.oXAxisCriterionField.bIsDestroyed === true) {
				this.oXAxisCriterionField = this.createDropDownBoxForCriterion(sCodeModelName, "X_AXIS_CRITERION_ID", "X_AXIS_CRITERION_CODE", bEdit,
					true, this.oXAxisCriterionLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oXAxisCriterionLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oXAxisCriterionField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);

			if (!this.oYAxisCriterionLabel || this.oYAxisCriterionLabel.bIsDestroyed === true) {
				this.oYAxisCriterionLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_Y_AXIS_CRITERION_CODE",
					Tooltip: "BO_CRITERION_FLD_Y_AXIS_CRITERION_CODE"
				});
			}
			if (!this.oYAxisCriterionField || this.oYAxisCriterionField.bIsDestroyed === true) {
				this.oYAxisCriterionField = this.createDropDownBoxForCriterion(sCodeModelName, "Y_AXIS_CRITERION_ID", "Y_AXIS_CRITERION_CODE", bEdit,
					true, this.oYAxisCriterionLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oYAxisCriterionLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oYAxisCriterionField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);

			if (!this.oXAxisSegmentsLabel || this.oXAxisSegmentsLabel.bIsDestroyed === true) {
				this.oXAxisSegmentsLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_X_AXIS_SEGMENT_NO",
					Tooltip: "BO_CRITERION_FLD_X_AXIS_SEGMENT_NO"
				});
			}
			if (!this.oXAxisSegmentsField || this.oXAxisSegmentsField.bIsDestroyed === true) {
				this.oXAxisSegmentsField = this.createSliderForAxis("X_AXIS_SEGMENT_NO", bEdit, true, this.oXAxisSegmentsLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oXAxisSegmentsLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oXAxisSegmentsField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);

			if (!this.oYAxisSegmentsLabel || this.oYAxisSegmentsLabel.bIsDestroyed === true) {
				this.oYAxisSegmentsLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_Y_AXIS_SEGMENT_NO",
					Tooltip: "BO_CRITERION_FLD_Y_AXIS_SEGMENT_NO"
				});
			}
			if (!this.oYAxisSegmentsField || this.oYAxisSegmentsField.bIsDestroyed === true) {
				this.oYAxisSegmentsField = this.createSliderForAxis("Y_AXIS_SEGMENT_NO", bEdit, true, this.oYAxisSegmentsLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oYAxisSegmentsLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oYAxisSegmentsField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if (!sAggregationType || sAggregationType === "MATRIX") {
			if (!this.oValueHelpLabel || this.oValueHelpLabel.bIsDestroyed === true) {
				this.oValueHelpLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_VALUE_OPTION_LIST_CODE",
					Tooltip: "BO_CRITERION_FLD_VALUE_OPTION_LIST_CODE"
				});
			}

			var aValueListFilters = this.createFilterForValueList(sDataType);
			var oValueListSettings = {
				Path: "VALUE_OPTION_LIST_CODE",
				CodeTable: "sap.ino.xs.object.basis.ValueOptionList.Root",
				Editable: bEdit,
				Visible: true,
				onChange: this.refreshCriterionDetailContent,
				WithEmpty: true,
				LabelControl: this.oValueHelpLabel,
				Filters: aValueListFilters
			};

			if (!this.oValueHelpField || this.oValueHelpField.bIsDestroyed === true) {
				this.oValueHelpField = this.createDropDownBoxForCode(oValueListSettings);
			} else if (oEventSourceControl !== this.oValueHelpField) {
				// update binding to consider the new filters if event that causes the recreation was not triggered by
				// that control
				var oValueHelpTypeBinding = this.oValueHelpField.getBinding("items");
				if (aValueListFilters && oValueHelpTypeBinding) {
					oValueHelpTypeBinding.filter(aValueListFilters);
				}
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oValueHelpLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oValueHelpField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

		if (sAggregationType === "MATRIX" && iIsOverallResult === 1) {
			if (!this.oInnerCircleCriterionLabel || this.oInnerCircleCriterionLabel.bIsDestroyed === true) {
				this.oInnerCircleCriterionLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_VIS_PARAM_1_CRITERION_CODE",
					Tooltip: "BO_CRITERION_FLD_VIS_PARAM_1_CRITERION_CODE"
				});
			}
			if (!this.oInnerCircleCriterionField || this.oInnerCircleCriterionField.bIsDestroyed === true) {
				this.oInnerCircleCriterionField = this.createDropDownBoxForCriterion(sCodeModelName, "VIS_PARAM_1_CRITERION_ID",
					"VIS_PARAM_1_CRITERION_CODE", bEdit, true, this.oInnerCircleCriterionLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oInnerCircleCriterionLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oInnerCircleCriterionField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);

			if (!this.oOuterCircleCriterionLabel || this.oOuterCircleCriterionLabel.bIsDestroyed === true) {
				this.oOuterCircleCriterionLabel = this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_VIS_PARAM_2_CRITERION_CODE",
					Tooltip: "BO_CRITERION_FLD_VIS_PARAM_2_CRITERION_CODE"
				});
			}
			if (!this.oOuterCircleCriterionField || this.oOuterCircleCriterionField.bIsDestroyed === true) {
				this.oOuterCircleCriterionField = this.createDropDownBoxForCriterion(sCodeModelName, "VIS_PARAM_2_CRITERION_ID",
					"VIS_PARAM_2_CRITERION_CODE", bEdit, true, this.oOuterCircleCriterionLabel);
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oOuterCircleCriterionLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oOuterCircleCriterionField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
		}

        if(sAggregationType === "FORMULA" && (sDataType === "INTEGER" || sDataType === "NUMERIC")){
            if (!this.oFormulaLabel || this.oFormulaLabel.bIsDestroyed === true) {
				var oFormulaLabel = new sap.m.HBox();
				oFormulaLabel.addItem(this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_FORMULA",
					Tooltip: "BO_MODEL_FLD_CALC_FORMULA_TIP"
				}));
				var oFormulaIcon = new sap.ui.core.Icon({
					src: "sap-icon://message-information",
					tooltip: "{i18n>BO_MODEL_FLD_CALC_FORMULA_TIP}"
				});
				oFormulaIcon.addStyleClass("sapUiInoEvaluationDetailInfo");
				oFormulaLabel.addItem(oFormulaIcon);
				this.oFormulaLabel = oFormulaLabel;
			}
			if (!this.oFormulaField || this.oFormulaField.bIsDestroyed === true) {
				this.oFormulaField = this.createControl({
					Type: "textfield",
					Node: "Criterion",
					Text: "FORMULA",
					Editable: bEdit,
					LabelControl: this.oFormulaLabel,
					Tooltip: "BO_MODEL_FLD_CALC_FORMULA_TIP"
				});
			}
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oFormulaLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oFormulaField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			});
			oCriterionDetailLayout.addRow(oRow);
        }

		if (!this.oDescriptionLabel || this.oDescriptionLabel.bIsDestroyed === true) {
			this.oDescriptionLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_DEFAULT_LONG_TEXT",
				Tooltip: "BO_CRITERION_FLD_DEFAULT_LONG_TEXT"
			});
		}
		if (!this.oDescriptionField || this.oDescriptionField.bIsDestroyed === true) {
			this.oDescriptionField = this.createControl({
				Type: "textarea",
				Node: "Criterion",
				Text: "DEFAULT_LONG_TEXT",
				Editable: bEdit,
				LabelControl: this.oDescriptionLabel
			});
		}
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDescriptionLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDescriptionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCriterionDetailLayout.addRow(oRow);

		// deactivate Watchguard! Do not forget that!
		this.bRefreshOngoing = false;

		// Revalidate error messages for new controls and tree control
		this.revalidateMessages();
	},

	createFilterForDataTypeList: function() {
		var sFilterBoundPath = "CODE";
		var aFilters = [];

		aFilters.push(new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, ""));
		aFilters.push(new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, "BOOLEAN"));
		aFilters.push(new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, "INTEGER"));
		aFilters.push(new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, "TEXT"));
		aFilters.push(new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, "NUMERIC"));
		var oOrFilter = new sap.ui.model.Filter(aFilters, false);
		return oOrFilter;
	},

	revalidateMessages: function() {
		if (this.facetView) {
			var oThingInspectorView = this.facetView.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateTableMessages(this.oCriterionTreeTable, "Criterion");
		}
	},

	createCriterionTreeTable: function(bEdit) {
		var oController = this.getController();
		var oAggregationTypeFormatter = {
			path: oController.getFormatterPath("AGGREGATION_TYPE"),
			formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.evaluation.AggregationType.Root"),
			// defined in config.xsodata
		};

		var oCriterionTreeTable = new sap.ui.table.TreeTable({
			columns: [new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_DEFAULT_TEXT",
					Tooltip: "BO_CRITERION_FLD_DEFAULT_TEXT"
				}),
				template: this.createControl({
					Type: "textview",
					Node: "Criterion",
					Text: "DEFAULT_TEXT",
					Tooltip: "BO_CRITERION_FLD_DEFAULT_TEXT",
					Editable: false,
				})
			}), new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_IS_OVERALL_RESULT",
					Tooltip: "BO_CRITERION_TOOLTIP_IS_OVERALL_RESULT"
				}),
				template: this.createControl({
					Type: "checkbox",
					Node: "Criterion",
					Text: "IS_OVERALL_RESULT",
					Tooltip: "BO_CRITERION_TOOLTIP_IS_OVERALL_RESULT",
					Editable: false,
				})
			}), new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_CRITERION_FLD_AGGREGATION_TYPE",
					Tooltip: "BO_CRITERION_FLD_AGGREGATION_TYPE",
				}),
				template: this.createControl({
					Type: "textview",
					Node: "Criterion",
					Text: oAggregationTypeFormatter,
					Tooltip: "BO_CRITERION_FLD_AGGREGATION_TYPE",
					Editable: false,
				})
			}), ],
			selectionMode: sap.ui.table.SelectionMode.Single,
			expandFirstLevel: true,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
		});
		return oCriterionTreeTable;
	},

	createCriterionButtonToolbar: function(bEdit) {

		var oCriterionButtonToolbar = new sap.ui.commons.Toolbar();

		var oNewButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_CRITERION_BUT_CREATE"),
			press: [
				function(oEvent) {
					this.getController().createNewCriterion(oEvent);
            },
				this],
			enabled: bEdit,
		});

		oCriterionButtonToolbar.addItem(oNewButton);

		var oNewSubButtonFormatter = this.createParentCriterionExistsFormatter();
		var oNewSubButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_CRITERION_BUT_CREATE_SUB"),
			press: [
				function(oEvent) {
					this.getController().createNewSubCriterion(oEvent, this.getSelectedCriterionContext());
            },
				this],
			enabled: oNewSubButtonFormatter,
		});

		oCriterionButtonToolbar.addItem(oNewSubButton);

		var oUpButtonFormatter = this.createCriterionExistsFormatter("up");
		var oUpButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_CRITERION_BUT_UP"),
			press: [
				function(oEvent) {
					this.getController().moveCriterionUp(oEvent, this.getSelectedCriterionContext());
            },
				this],
			enabled: oUpButtonFormatter,
		});

		oCriterionButtonToolbar.addItem(oUpButton);

		var oDownButtonFormatter = this.createCriterionExistsFormatter("down");
		var oDownButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_CRITERION_BUT_DOWN"),
			press: [
				function(oEvent) {
					this.getController().moveCriterionDown(oEvent, this.getSelectedCriterionContext());
            },
				this],
			enabled: oDownButtonFormatter,
		});

		oCriterionButtonToolbar.addItem(oDownButton);

		var oDeleteButtonFormatter = this.createCriterionExistsFormatter("del");
		var oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_CRITERION_BUT_DELETE"),
			press: [
				function(oEvent) {
					this.getController().deleteCriterion(oEvent, this.getSelectedCriterionContext());
            },
				this],
			enabled: oDeleteButtonFormatter,
		});

		oCriterionButtonToolbar.addItem(oDeleteButton);

		return oCriterionButtonToolbar;
	},

	createCriterionExistsFormatter: function(sType) {
		var oView = this;
		var oFormatter = {
			path: this.getFormatterPath("ID", false),
			formatter: function(sID) {
				if (!sID || sID == 0) {
					// always hide if there is no ID (means not bound)
					return false;
				}

				var aCriterion = oView.getModel("applicationObject").getProperty("/Criterion");
				var aCriterionResult = jQuery.grep(aCriterion, function(oCriterion) {
					return oCriterion.ID == sID;
				});
				var aResult = [];
				if (aCriterionResult.length === 1) {
					aResult = aCriterion;
				} else {
					jQuery.each(aCriterion, function(iIndex, oCriterion) {
						if (oCriterion.children && oCriterion.children.length > 0) {
							var oChildResult = jQuery.grep(oCriterion.children, function(oChild) {
								return oChild.ID == sID;
							});
							if (oChildResult.length === 1) {
								aResult = oCriterion.children;
							}
						}
					});
				}

				var iIdx = aResult.map(function(oCriterion) {
					return oCriterion.ID;
				}).indexOf(sID);

				if (sType == "del") {
					return true;
				} else if (sType == "up" && iIdx !== 0) {
					return true;
				} else if (sType == "down" && iIdx !== aResult.length - 1) {
					return true;
				}

				return false;

			},
			type: null,
		};
		return oFormatter;
	},

	createParentCriterionExistsAndIsNotTextFormatter: function() {
		var aParts = [];
		var oPartCriterionCode = {
			path: this.getFormatterPath("ID", false)
		};
		aParts.push(oPartCriterionCode);
		var oPartParentCriterionCode = {
			path: this.getFormatterPath("PARENT_CRITERION_ID", false)
		};
		aParts.push(oPartParentCriterionCode);
		var oPartDataTypeCode = {
			path: this.getFormatterPath("DATATYPE_CODE", false)
		};
		aParts.push(oPartDataTypeCode);
		var oFormatter = {
			parts: aParts,
			formatter: function(sID, sParentID, sDataType) {
				if (!sID || sID == 0) {
					// always hide if there is no ID (means not bound)
					return false;
				}
				if (sParentID && sParentID != 0) {
					return false;
				}
				if (!sDataType || sDataType == "" || sDataType == "TEXT") {
					return false;
				} else {
					return true;
				}
			},
			type: null,
		};
		return oFormatter;
	},

	createParentCriterionExistsFormatter: function() {
		var aParts = [];
		var oPartCriterionCode = {
			path: this.getFormatterPath("ID", false)
		};
		aParts.push(oPartCriterionCode);
		var oPartParentCriterionCode = {
			path: this.getFormatterPath("PARENT_CRITERION_ID", false)
		};
		aParts.push(oPartParentCriterionCode);
		var oFormatter = {
			parts: aParts,
			formatter: function(sID, sParentID) {
				if (!sID || sID == 0) {
					// always hide if there is no ID (means not bound)
					return false;
				}

				if (sParentID && sParentID != 0) {
					return false;
				} else {
					return true;
				}
			},
			type: null,
		};
		return oFormatter;
	},

	createDropDownBoxForCriterion: function(sCodeModelName, sPathID, sPathCode, bEdit, bVisible, oLabel) {
		// if it is never editable create a textview instead
		var oDropDownBox = null;
		if (bEdit === false || !sCodeModelName) {
			if (!sCodeModelName) {
				sCodeModelName = this.getController().getModelName();
			}
			var oFormatter = {
				path: this.getFormatterPath(sPathCode, false),
				formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
			};
			oDropDownBox = this.createControl({
				Type: "textview",
				Node: "Criterion",
				Text: oFormatter,
				Editable: bEdit,
				LabelControl: oLabel
			});
		} else {
			oDropDownBox = new sap.ui.commons.DropdownBox({
				selectedKey: this.getBoundPath(sPathID, false),
				editable: bEdit,
				visible: bVisible,
				ariaLabelledBy: oLabel ? oLabel : undefined
			});

			var sPlainCodeBoundPath = "{" + sCodeModelName + ">PLAIN_CODE}";
			var sCodeBoundPath = "{" + sCodeModelName + ">ID}";
			var sCriterionPath = sCodeModelName + ">/";

			var oItemTemplate = new sap.ui.core.ListItem({
				text: sPlainCodeBoundPath,
				key: sCodeBoundPath
			});
			oDropDownBox.bindItems({
				path: sCriterionPath,
				template: oItemTemplate,
				parameters: {
					includeEmptyCode: true
				}
			});
		}

		if (oLabel && typeof oLabel.setLabelFor === "function") {
			oLabel.setLabelFor(oDropDownBox);
		}
		return oDropDownBox;
	},

	createSliderForAxis: function(sPath, bEdit, bVisible, oLabel) {
		var oSlider = new sap.ui.commons.Slider({
			width: "30%",
			min: 1,
			max: 4,
			value: this.getBoundPath(sPath),
			totalUnits: 3,
			smallStepWidth: 1,
			stepLabels: true,
			editable: bEdit,
			visible: bVisible,
			ariaLabelledBy: oLabel ? oLabel : undefined
		});
		if (oLabel && typeof oLabel.setLabelFor === "function") {
			oLabel.setLabelFor(oSlider);
		}
		return oSlider;
	},

	createCheckBoxWithChangeHandler: function(sText, sTooltip, bEditable, bVisible, fnOnChange, oLabel) {
		var oBox = new sap.ui.commons.CheckBox({
			checked: {
				path: this.getFormatterPath(sText),
				type: new sap.ui.ino.models.types.IntBooleanType(),
				visible: bVisible
			},
			tooltip: sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
			editable: {
				path: this.getFormatterPath("ENABLE_FORMULA", true),
				type: null,
				formatter: function(nEnabelFormula) {
					return bEditable && (!nEnabelFormula || nEnabelFormula <= 0);
				}
			},
			visible: bVisible,
			change: [fnOnChange, this],
			ariaLabelledBy: oLabel ? oLabel : undefined
		});
		if (oLabel && typeof oLabel.setLabelFor === "function") {
			oLabel.setLabelFor(oBox);
		}
		return oBox;
	},

	getBoundPath: function(sPath, bAbsolute) {
		return this.getController().getBoundPath(sPath, bAbsolute);
	},

	getBoundObject: function(oBinding, absolute, oType) {
		return this.getController().getBoundObject(oBinding, absolute, oType);
	},

	getFormatterPath: function(sPath, absolute) {
		return this.getController().getFormatterPath(sPath, absolute);
	},

	getResourceBundle: function() {
		return sap.ui.getCore().getModel("i18n").getResourceBundle();
	},

	getText: function(sTextKey) {
		return this.getController().getTextModel().getText(sTextKey);
	},

	hasPendingChanges: function() {
		return false; // False by default since most facets do not have an independent edit mode
	},

	createControl: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}

		return sap.ui.ino.views.common.GenericControl.create(oSettings);
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	createFilterForAggregationType: function(sDataType) {
		var sCodeBoundPath = "CODE";
		var aFilters = [];
		// Always add the empty code value
		var oEmptyFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "");
		aFilters.push(oEmptyFilter);
		if (sDataType === "INTEGER" || sDataType === "NUMERIC") {
			var oSumFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "SUM");
			aFilters.push(oSumFilter);
			var oAvgFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "AVG");
			aFilters.push(oAvgFilter);
			var oFormulaFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "FORMULA");
			aFilters.push(oFormulaFilter);
		}
		if (sDataType === "INTEGER") {
			var oMatrixFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "MATRIX");
			aFilters.push(oMatrixFilter);
			var oFormulaFilter1 = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "FORMULA");
			aFilters.push(oFormulaFilter1);
		}
		if (sDataType === "BOOLEAN") {
			var oAndFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "AND");
			aFilters.push(oAndFilter);
			var oOrFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "OR");
			aFilters.push(oOrFilter);
			var oAvgFilter1 = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "AVG");
			aFilters.push(oAvgFilter1);
		}
		return aFilters;
	},

	createFilterForValueList: function(sDataType) {
		var sCodeBoundPath = "CODE";
		var sFilterBoundPath = "DATATYPE_CODE";
		var aFilters = [];
		// Always add the empty code value
		var oEmptyFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "");
		aFilters.push(oEmptyFilter);
		// add the data type filter
		var oDataTypeFilter = new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, sDataType);
		aFilters.push(oDataTypeFilter);
		// add an OR filter arround
		var oOrFilter = new sap.ui.model.Filter(aFilters, false);
		return oOrFilter;
	},

	onBeforeExit: function(oEvent) {
		// clear all member variables:
		this.oCodeField = null;
		this.oNameField = null;
		this.oIsOverallResultField = null;
		this.oDataTypeField = null;
		this.oAggregationTypeField = null;
		this.oMinValueField = null;
		this.oMaxValueField = null;
		this.oUnitField = null;
		this.oXAxisCriterionField = null;
		this.oYAxisCriterionField = null;
		this.oXAxisSegmentsField = null;
		this.oYAxisSegmentsField = null;
		this.oValueHelpField = null;
		this.oInnerCircleCriterionField = null;
		this.oOuterCircleCriterionField = null;
		this.oDescriptionField = null;

		this.oCodeLabel = null;
		this.oNameLabel = null;
		this.oIsOverallResultLabel = null;
		this.oDataTypeLabel = null;
		this.oAggregationTypeLabel = null;
		this.oMinValueLabel = null;
		this.oMaxValueLabel = null;
		this.oUnitLabel = null;
		this.oXAxisCriterionLabel = null;
		this.oYAxisCriterionLabel = null;
		this.oXAxisSegmentsLabel = null;
		this.oYAxisSegmentsLabel = null;
		this.oValueHelpLabel = null;
		this.oInnerCircleCriterionLabel = null;
		this.oOuterCircleCriterionLabel = null;
		this.oDescriptionLabel = null;

		this.oParentView = null;
		this.bIncludeToolbar = false;
		this.oCriterionLayout = null;
		this.oCriterionTreeTable = null;
		this.oCriterionDetailLayout = null;
		this.oButtonToolbar = null;
		this.bRefreshOngoing = false;
	}
});