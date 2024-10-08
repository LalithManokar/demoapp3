/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormListDetail", {

	oParentView: null,
	bIncludeToolbar: false,
	oFieldTable: null,
	oFieldDetailLayout: null,
	oButtonToolbar: null,
	oNameField: null,
	oCodeField: null,
	oMandatoryField: null,
	oDataTypeField: null,
	oMinValueField: null,
	oMaxValueField: null,
	oStepSizeField: null,
	oUnitField: null,
	oValueHelpField: null,
	oDescriptionField: null,

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.IdeaFormListDetail";
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

	createContent: function() {
		var oViewData = this.getViewData();
		var oController = this.getController();

		this.oParentView = oViewData.parentView;
		this.bIncludeToolbar = oViewData.includeToolbar;
		oController.setParentController(this.oParentView.getController());
		oController.setToolBarProperyModel();

		var oModel = this.getModel(oController.getModelName());

		if (!oModel) {
			this.setModel(this.getModel(), oController.getModelName());
		}

		this.attachBeforeExit(this.onBeforeExit);

		var bEdit = oController.isInEditMode();
		this.oFieldLayout = this.createLayoutFields(bEdit);

		return this.oFieldLayout;
	},
	createLayoutFields: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['45%', '3%', '50%', '2%']
		});

		if (bEdit === true && this.bIncludeToolbar === true) {
			this.oButtonToolbar = this.createFieldButtonToolbar(bEdit);

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

		this.oFieldTable = this.createFieldTable(bEdit);
		this.oFieldDetailLayout = this.createFieldDetailLayout();

		var oFieldRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oFieldTable,
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
				content: this.oFieldDetailLayout,
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

		oContent.addRow(oFieldRow);

		return oContent;
	},

	createFieldTable: function(bEdit) {
		var oController = this.getController();

		var oFieldTable = new sap.ui.table.Table({
			columns: [new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_DEFAULT_TEXT",
					Tooltip: "BO_FIELD_FLD_DEFAULT_TEXT"
				}),
				template: this.createControl({
					Type: "textview",
					Node: "Fields",
					Text: "DEFAULT_TEXT",
					Tooltip: "BO_FIELD_FLD_DEFAULT_TEXT",
					Editable: false
				})
			}), new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_DATATYPE_CODE",
					Tooltip: "BO_FIELD_FLD_DATATYPE_CODE"
				}),
				template: this.createControl({
					Type: "textview",
					Node: "Fields",
					Text: "DATATYPE_CODE",
					Tooltip: "BO_FIELD_FLD_DATATYPE_CODE",
					Editable: false
				})
			}), new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_MANDATORY",
					Tooltip: "BO_FIELD_FLD_MANDATORY"
				}),
				template: this.createControl({
					Type: "checkbox",
					Node: "Fields",
					Text: "MANDATORY",
					Tooltip: "BO_FIELD_FLD_MANDATORY",
					Editable: false
				})
			}),new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_PUBLISH",
					Tooltip: "BO_FIELD_FLD_PUBLISH"
				}),
				template: this.createControl({
					Type: "checkbox",
					Node: "Fields",
					Text: "IS_PUBLISH",
					Tooltip: "BO_FIELD_FLD_PUBLISH",
					Editable: false
				}),
				visible:{
				    path:"IS_ADMIN_FORM",
				    formatter: function(isAdmin){
				        if(isAdmin){
				            return true;
				        }else{
				            return false;
				        }
				    }
				}
			}),new sap.ui.table.Column({
				label: this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_HIDDEN",
					Tooltip: "BO_FIELD_FLD_HIDDEN"
				}),
				template: this.createControl({
					Type: "checkbox",
					Node: "Fields",
					Text: "IS_HIDDEN",
					Tooltip: "BO_FIELD_FLD_HIDDEN",
					Editable: false
				}),
				visible:{
				    path:"IS_ADMIN_FORM",
				    formatter: function(isAdmin){
				        if(isAdmin){
				            return false;
				        }else{
				            return true;
				        }
				    }
				}
			})],
			selectionMode: sap.ui.table.SelectionMode.Single,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			}
		});

		return oFieldTable;
	},

	createFieldDetailLayout: function() {
		var oFieldDetailLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['140px', '60%']
		});

		return oFieldDetailLayout;
	},

	createFieldButtonToolbar: function(bEdit) {

		var oFieldButtonToolbar = new sap.ui.commons.Toolbar();

		var oNewButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_FIELD_BUT_CREATE"),
			press: [

				function(oEvent) {
					this.getController().createNewField(oEvent);
            },
				this],
			enabled: bEdit
		});

		oFieldButtonToolbar.addItem(oNewButton);

		var oUpButtonFormatter = this.createFieldExistsFormatter("up");
		var oUpButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_FIELD_BUT_UP"),
			press: [

				function(oEvent) {
					this.getController().moveFieldUp(oEvent, this.getSelectedFieldContext());
            },
				this],
			enabled: oUpButtonFormatter
		});

		oFieldButtonToolbar.addItem(oUpButton);

		var oDownButtonFormatter = this.createFieldExistsFormatter("down");
		var oDownButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_FIELD_BUT_DOWN"),
			press: [

				function(oEvent) {
					this.getController().moveFieldDown(oEvent, this.getSelectedFieldContext());
            },
				this],
			enabled: oDownButtonFormatter
		});

		oFieldButtonToolbar.addItem(oDownButton);

		var oDeleteButtonFormatter = this.createFieldExistsFormatter("del");
		var oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_FIELD_BUT_DELETE"),
			press: [

				function(oEvent) {
					this.getController().deleteField(oEvent, this.getSelectedFieldContext());
            },
				this],
			enabled: oDeleteButtonFormatter
		});

		oFieldButtonToolbar.addItem(oDeleteButton);

		return oFieldButtonToolbar;
	},

	refreshFieldDetailContent: function(oEvent) {
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
		var oRowContext = this.getSelectedFieldContext();
		this.createFieldDetailContent(bEdit, this.oFieldDetailLayout, oRowContext, oSourceControl);
		if (oSourceControl) {
			oSourceControl.focus();
		}
		this.bRefreshOngoing = false;
	},

	createFieldDetailContent: function(bEdit, oFieldDetailLayout, oBindingContext, oEventSourceControl) {
		var that = this;
		// set watch-guard
		this.bRefreshOngoing = true;
		// first clean all rows
		oFieldDetailLayout.removeAllRows();
		var oController = this.getController();
		var oModel = oController.getModel();

		// get the ID
		var iID = oModel.getProperty("ID", oBindingContext);
		if (!iID) {
			// maybe there is a code
			iID = oModel.getProperty("CODE", oBindingContext);
		}
		var sDataType = oModel.getProperty("DATATYPE_CODE", oBindingContext);
		var sValueOptionListCode = oModel.getProperty("VALUE_OPTION_LIST_CODE", oBindingContext);

		// no ID? Return, nothing to do
		if (!iID || iID === 0 || iID === "") {
			// deactivate watch-guard! Do not forget that!
			this.bRefreshOngoing = false;
			return;
		}

		//Name
		if (!this.oNameLabel || this.oNameLabel.bIsDestroyed === true) {
			this.oNameLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_DEFAULT_TEXT",
				Tooltip: "BO_FIELD_FLD_DEFAULT_TEXT"
			});
		}
		if (!this.oNameField || this.oNameField.bIsDestroyed === true) {
			this.oNameField = this.createControl({
				Type: "textfield",
				Node: "Field",
				Text: "DEFAULT_TEXT",
				Editable: bEdit,
				LabelControl: this.oNameLabel
			});
		}
		//add  mandtory star to name label
		this.oNameLabel.addStyleClass(bEdit ? "sapUiLblReqEnd" : "");

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
		oFieldDetailLayout.addRow(oRow);

		//Technical Name 
		if (!this.oCodeLabel || this.oCodeLabel.bIsDestroyed === true) {
			this.oCodeLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_PLAIN_CODE",
				Tooltip: "BO_FIELD_FLD_PLAIN_CODE"
			});
		}

		if (!this.oCodeField || this.oCodeField.bIsDestroyed === true) {
			var sCodePath = "PLAIN_CODE";
			this.oCodeField = this.createControl({
				Type: "textfield",
				Node: "Field",
				Text: sCodePath,
				Editable: bEdit,
				LabelControl: this.oCodeLabel
			});
		}
		//add  mandtory star to code label
		this.oCodeLabel.addStyleClass(bEdit ? "sapUiLblReqEnd" : "");

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
		oFieldDetailLayout.addRow(oRow);
		
		this.createActiveRow(oModel, bEdit, oFieldDetailLayout,oBindingContext);
        //Dsiplay Only setting
        this.createDisplayOnlyRow(oModel, bEdit, oFieldDetailLayout,oBindingContext);

		// Mandatory 
		if (!this.oMandatoryLabel || this.oMandatoryLabel.bIsDestroyed === true) {
			this.oMandatoryLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_MANDATORY",
				Tooltip: "BO_FIELD_FLD_MANDATORY",
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                           formatter: function(isDisplayOnly){
                             return isDisplayOnly === 1 ? false : true;
                           },
                           type: 'sap.ui.model.type.Boolean'
                }				
			});
		}
		if (!this.oMandatoryField || this.oMandatoryField.bIsDestroyed === true) {
			this.oMandatoryField = this.createControl({
				Type: "checkbox",
				Node: "Field",
				Text: "MANDATORY",
				Editable: bEdit,
				LabelControl: this.oMandatoryLabel,
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY",false),
                           formatter: function(isDisplayOnly){
                             return isDisplayOnly === 1 ? false : true;
                           },
                           type: 'sap.ui.model.type.Boolean'
                }				
			});
		}

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oMandatoryLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oMandatoryField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oFieldDetailLayout.addRow(oRow);
		///Hidden
		this.createHiddenPublishRow(oModel, bEdit, oFieldDetailLayout,oBindingContext);

		//Data Type
		if (!this.oDataTypeLabel || this.oDataTypeLabel.bIsDestroyed === true) {
			this.oDataTypeLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_DATATYPE_CODE",
				Tooltip: "BO_FIELD_FLD_DATATYPE_CODE",
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                           formatter: function(isDisplayOnly){
                             return isDisplayOnly === 1 ? false : true;
                           },
                           type: 'sap.ui.model.type.Boolean'
                }					
			});
		}
		if (!this.oDataTypeField || this.oDataTypeField.bIsDestroyed === true) {
			this.oDataTypeField = this.createDropDownBoxForCode({
				Path: "DATATYPE_CODE",
				CodeTable: "sap.ino.xs.object.basis.Datatype.Root",
				Editable: bEdit,
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                           formatter: function(isDisplayOnly){
                             return isDisplayOnly === 1 ? false : true;
                           },
                           type: 'sap.ui.model.type.Boolean'
                },
				onChange: function(oEvent) {
					var oSourceController = oEvent.getSource();
					var oRowContext = this.getSelectedFieldContext();
					var oSelectedKey = oSourceController.getSelectedKey();

					//set key to code list  
					oRowContext.getModel().setProperty(oRowContext.getPath() + "/DATATYPE_CODE", oSelectedKey);

					that.refreshFieldDetailContent(oEvent);
				},
				WithEmpty: true,
				LabelControl: this.oDataTypeLabel
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
		oFieldDetailLayout.addRow(oRow);

		//add Mandtory indicator to data type
		this.oDataTypeLabel.addStyleClass(bEdit ? "sapUiLblReqEnd" : "");

		//Mini Value & Max value

		if ((!sValueOptionListCode || sValueOptionListCode === "") && (sDataType === "INTEGER" || sDataType === "NUMERIC")) {
			//Min Value
			if (!this.oMinValueLabel || this.oMinValueLabel.bIsDestroyed === true) {
				this.oMinValueLabel = this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_NUM_VALUE_MIN",
					Tooltip: "BO_FIELD_FLD_NUM_VALUE_MIN",
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }						
				});
			}
			if (!this.oMinValueField || this.oMinValueField.bIsDestroyed === true) {
				this.oMinValueField = this.createControl({
					Type: "textfield",
					Node: "Field",
					Text: "NUM_VALUE_MIN",
					Editable: bEdit,
					DataType: new sap.ui.model.type.String(), // allow null values => use string type and check for
					// float in the model
					LabelControl: this.oMinValueLabel,
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }					
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
			oFieldDetailLayout.addRow(oRow);
			//Max Value
			if (!this.oMaxValueLabel || this.oMaxValueLabel.bIsDestroyed === true) {
				this.oMaxValueLabel = this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_NUM_VALUE_MAX",
					Tooltip: "BO_FIELD_FLD_NUM_VALUE_MAX",
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }					
				});
			}
			if (!this.oMaxValueField || this.oMaxValueField.bIsDestroyed === true) {
				this.oMaxValueField = this.createControl({
					Type: "textfield",
					Node: "Field",
					Text: "NUM_VALUE_MAX",
					Editable: bEdit,
					DataType: new sap.ui.model.type.String(), // allow null values => use string type and check for
					// float in the model
					LabelControl: this.oMaxValueLabel,
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }					
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
			oFieldDetailLayout.addRow(oRow);
		}

		if (sDataType === "INTEGER" || sDataType === "NUMERIC") {
			//Unit
			if (!this.oUnitLabel || this.oUnitLabel.bIsDestroyed === true) {
				this.oUnitLabel = this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_UOM_CODE",
					Tooltip: "BO_FIELD_FLD_UOM_CODE",
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }					
				});
			}
			if (!this.oUnitField || this.oUnitField.bIsDestroyed === true) {
				this.oUnitField = this.createDropDownBoxForCode({
					Path: "UOM_CODE",
					CodeTable: "sap.ino.xs.object.basis.Unit.Root",
					Editable: bEdit,
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    },
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
			oFieldDetailLayout.addRow(oRow);
		}

		//value List 
		if (sDataType !== "RICHTEXT" && sDataType !== "DATE") {
			if (!this.oValueHelpLabel || this.oValueHelpLabel.bIsDestroyed === true) {
				this.oValueHelpLabel = this.createControl({
					Type: "label",
					Text: "BO_FIELD_FLD_VALUE_OPTION_LIST_CODE",
					Tooltip: "BO_FIELD_FLD_VALUE_OPTION_LIST_CODE",
                    Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }					
				});
			}

			var aValueListFilters = this.createFilterForValueList(sDataType);
			var oValueListSettings = {
				Path: "VALUE_OPTION_LIST_CODE",
				CodeTable: "sap.ino.xs.object.basis.ValueOptionList.Root",
				Editable: bEdit,
				Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    },
				onChange: this.refreshFieldDetailContent,
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

				if (oValueHelpTypeBinding) {
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
			oFieldDetailLayout.addRow(oRow);
		}

		//Description
		if (!this.oDescriptionLabel || this.oDescriptionLabel.bIsDestroyed === true) {
			this.oDescriptionLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_DEFAULT_LONG_TEXT",
				Tooltip: "BO_FIELD_FLD_DEFAULT_LONG_TEXT",
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }				
			});
		}
		if (!this.oDescriptionField || this.oDescriptionField.bIsDestroyed === true) {
			this.oDescriptionField = this.createControl({
				Type: "textarea",
				Node: "Field",
				Text: "DEFAULT_LONG_TEXT",
				Editable: bEdit,
				LabelControl: this.oDescriptionLabel,
                Visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }				
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
		oFieldDetailLayout.addRow(oRow);

        //oController.setVisibleForOtherControls(this.oControls,bIsDisplayOnly);
		// deactivate Watchguard! Do not forget that!
		this.bRefreshOngoing = false;

		// Revalidate error messages for new controls and tree control
		this.revalidateMessages();

	},

	revalidateMessages: function() {
		if (this.facetView) {
			var oThingInspectorView = this.facetView.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateTableMessages(this.oFieldTable, "Fields");
		}
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

	createFieldExistsFormatter: function(sType) {
		var oView = this;

		var oFormatter = {
			path: this.getToolBarFormatterPath(sType),
			formatter: function(sValue) {
				return sValue;
			},
			type: null
		};
		return oFormatter;
	},

	setFieldsBinding: function(oBinding) {
		var oController = this.getController();
		var oModel = this.getModel(oController.getModelName());
		if (!oModel) {
			// Model was not yet set, do that now, publish the default model
			this.setModel(this.getModel(), oController.getModelName());
		}
		// first clean all rows of the criterion detail display
		this.oFieldDetailLayout.destroyRows();
		this.oFieldDetailLayout.removeAllRows();
		// set the binding
		this.oFieldTable.bindRows(oBinding);
	},

	setFieldContext: function(oBindingContext) {
		this.oFieldDetailLayout.setBindingContext(oBindingContext, this.getController().getModelName());
		var bEdit = this.getController().isInEditMode();

		//clear Mandtory Field
		//delete this.oMandatoryField;
		this.oFieldDetailLayout.destroyRows();
		this.oFieldDetailLayout.removeAllRows();
		this.createFieldDetailContent(bEdit, this.oFieldDetailLayout, oBindingContext);
	},

	setFieldContextByID: function(iFieldID) {
		var oModel = this.getController().getModel();
		var aRows = this.oFieldTable.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRowContext = this.oFieldTable.getContextByIndex(i);
			var iID = oModel.getProperty("ID", oRowContext);
			if (iID === iFieldID) {
				this.oFieldDetailLayout.setBindingContext(oRowContext, this.getController().getModelName());
				this.oFieldTable.setSelectedIndex(i);
				this.getController().updatePropertyModel(i);
				return;
			}
		}
	},
	getSelectedFieldContext: function() {
		var selectedIndex = this.oFieldTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oFieldTable.getContextByIndex(selectedIndex) !== null) {
			return this.oFieldTable.getContextByIndex(selectedIndex);
		}
		return null;
	},

	getBoundPath: function(sPath, bAbsolute) {
		return this.getController().getBoundPath(sPath, bAbsolute);
	},

	getBoundObject: function(oBinding, absolute, oType) {
		return this.getController().getBoundObject(oBinding, absolute, oType);
	},

	getToolBarFormatterPath: function(sPath) {
		return this.getController().getToolBarFormatterpath(sPath);
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
	createHiddenPublishRow: function(oModel, bEdit, oDetailLayout,oBindingContext) {
	    var oDataType = new sap.ui.ino.models.types.IntBooleanType();
		//if (!oModel.getProperty("/IS_ADMIN_FORM")) {
		if (!this.oHiddenLabel || this.oHiddenLabel.bIsDestroyed === true) {
			this.oHiddenLabel = new sap.ui.commons.Label({
                text: this.getController().getTextPath("BO_FIELD_FLD_HIDDEN"),
				tooltip:this.getController().getTextPath("BO_FIELD_FLD_HIDDEN"),
				visible: { path: this.getFormatterPath("IS_ADMIN_FORM",true),
                           formatter: function(isAdminForm){
                             return isAdminForm === 1 ? false : true;
                           }
				}				
			});				
		}
		if (!this.oHiddenField || this.oHiddenField.bIsDestroyed === true) {
			this.oHiddenField = new sap.ui.commons.CheckBox({
				checked: {
					path: this.getFormatterPath("IS_HIDDEN"),
					type: oDataType
				},
				ariaLabelledBy:this.oHiddenField,
				editable: bEdit,
				enabled:bEdit,
				visible: { path: this.getFormatterPath("IS_ADMIN_FORM",true),
                           formatter: function(isAdminForm){
                             return isAdminForm === 1 ? false : true;
                           }
				}				
			});			
		}

		if (!this.oPublishLabel || this.oPublishLabel.bIsDestroyed === true) {
// 			this.oPublishLabel = this.createControl({
// 				Type: "label",
// 				Text: "BO_FIELD_FLD_PUBLISH",
// 				Tooltip: "BO_FIELD_FLD_PUBLISH"
// 			});
			this.oPublishLabel = new sap.ui.commons.Label({
                text: this.getController().getTextPath("BO_FIELD_FLD_PUBLISH"),
				tooltip:this.getController().getTextPath("BO_FIELD_FLD_PUBLISH"),
				visible: { path: this.getFormatterPath("IS_ADMIN_FORM",true),
                           formatter: function(isAdminForm){
                             return isAdminForm === 1 ? true : false;
                           }
				}				
			});				
		}
		if (!this.oPubulishField || this.oPubulishField.bIsDestroyed === true) {
			this.oPubulishField = new sap.ui.commons.CheckBox({
				checked: {
					path: this.getFormatterPath("IS_PUBLISH"),
					type: oDataType
				},
				ariaLabelledBy:this.oPublishLabel,
				editable: bEdit,
				enabled:bEdit,
				visible: { path: this.getFormatterPath("IS_ADMIN_FORM",true),
                           formatter: function(isAdminForm){
                             return isAdminForm === 1 ? true : false;
                           }
				}
			});	
		}

		var oHboxLabel = new sap.m.HBox({
 			items: [this.oHiddenLabel,this.oPublishLabel],
 			visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    }
 		});
 		var oHboxField = new sap.m.HBox({
 			items: [this.oHiddenField,this.oPubulishField],
 			visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? false : true;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    } 			
 		});
		var oHidenRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oHboxLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oHboxField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oHidenRow = oHidenRow;

		oDetailLayout.addRow(oHidenRow);
		this.oDetailLayout = oDetailLayout;
	},
	createActiveRow: function(oModel, bEdit, oDetailLayout,oBindingContext){
		if (!this.oActiveLabel || this.oActiveLabel.bIsDestroyed === true) {
			this.oActiveLabel = this.createControl({
				Type: "label",
				Text: "BO_FIELD_FLD_ACTIVE",
				Tooltip: "BO_FIELD_FLD_ACTIVE"
			});
		}
		if (!this.oActiveField || this.oActiveField.bIsDestroyed === true) {
			this.oActiveField = this.createControl({
				Type: "checkbox",
				Node: "Field",
				Text: "IS_ACTIVE",
				Editable: bEdit,
				LabelControl: this.oActiveLabel
			});
		}

		var oActiveRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oActiveLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oActiveField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
			this.oActiveRow = oActiveRow;
		oDetailLayout.addRow(oActiveRow);	 
		//this.oDetailLayout = oDetailLayout;
	},
	createDisplayOnlyRow: function(oModel, bEdit, oDetailLayout,oBindingContext) {
	    var that = this;
	    var oDataType = new sap.ui.ino.models.types.IntBooleanType();
       //Display Only check box	    
		if (!this.oDisplayOnlyLabel || this.oDisplayOnlyLabel.bIsDestroyed === true) {
			this.oDisplayOnlyLabel = new sap.ui.commons.Label({
                text: this.getController().getTextPath("BO_FIELD_FLD_DISPLAY_ONLY"),
				tooltip:this.getController().getTextPath("BO_FIELD_FLD_DISPLAY_ONLY")
			});		
		}
		if (!this.oDisplayOnlyField || this.oDisplayOnlyField.bIsDestroyed === true) {
			this.oDisplayOnlyField = new sap.ui.commons.CheckBox({
				checked: {
					path: this.getFormatterPath("IS_DISPLAY_ONLY"),
					type: oDataType
				},
				ariaLabelledBy:this.oDisplayOnlyField,
				editable: bEdit,
				enabled:bEdit,
				change: function(oEvent) {
					that.getController().changeMandatoryFieldValue(oEvent,oBindingContext);
				}				
				
			});			
		}

		var oDisplayOnlyRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDisplayOnlyLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDisplayOnlyField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oDisplayOnlyRow = oDisplayOnlyRow;

		oDetailLayout.addRow(oDisplayOnlyRow);
        ///Display Text Rich Text Show		
		if (!this.oDisplayTextLabel || this.oDisplayTextLabel.bIsDestroyed === true) {
			this.oDisplayTextLabel = new sap.ui.commons.Label({
                text: this.getController().getTextPath("BO_FIELD_FLD_DISPLAY_TEXT"),
				tooltip:this.getController().getTextPath("BO_FIELD_FLD_DISPLAY_TEXT"),
 			    visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? true : false;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    } 				
			});		
		this.oDisplayTextLabel.addStyleClass(bEdit ? "sapUiLblReqEnd" : "");				
		}
		if (!this.oDisplayTextField || this.oDisplayTextField.bIsDestroyed === true) {
// 			this.oDisplayOnlyField = new sap.ui.commons.CheckBox({
// 				checked: {
// 					path: this.getFormatterPath("IS_DISPLAY_ONLY"),
// 					type: oDataType
// 				},
// 				ariaLabelledBy:this.oDisplayOnlyField,
// 				editable: bEdit,
// 				enabled:bEdit,
// 				change: function(oEvent) {
// 				// 	that.refreshFieldDetailContent(oEvent);
// 				}				
				
// 			});	
        var sBindingPath = this.getFormatterPath(oBindingContext.sPath + "/DISPLAY_TEXT", false);
    	if (bEdit) {
            var oRichText = sap.ui.ino.application.ControlFactory.createRichTextEditor(undefined, sBindingPath, "400px", true, false, false,false,true,true);
		 var oHboxField = new sap.m.HBox({
 			items: [oRichText],
 			visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? true : false;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    } 			
 		});    
 		this.oDisplayTextField = oHboxField;
        } else {
            this.oDisplayTextField = new sap.ui.core.HTML({
                content : {
                    path : sBindingPath,
                    formatter : function(sTemplate) {
                        // content is expected to be wrapped by proper HTML
                        // we ensure this by adding the divs around it
                        return "<div style='word-wrap: break-word;'>" + (sTemplate || "") + "</div>";
                    },
                    visible:{ path: this.getFormatterPath(oBindingContext.sPath + "/IS_DISPLAY_ONLY", false),
                               formatter: function(isDisplayOnly){
                                 return isDisplayOnly === 1 ? true : false;
                               },
                               type: 'sap.ui.model.type.Boolean'
                    } 
                },
                sanitizeContent : true
            });
        }
		}

		var oDisplayTextRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDisplayTextLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDisplayTextField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oDisplayTextRow = oDisplayTextRow;

		oDetailLayout.addRow(oDisplayTextRow);		
		
		this.oDetailLayout = oDetailLayout;
	},	
	
	
	onBeforeExit: function() {

		this.oParentView = null;
		this.bIncludeToolbar = false;
		this.oFieldTable = null;
		this.oFieldDetailLayout = null;
		this.oButtonToolbar = null;
		this.oNameField = null;
		this.oCodeField = null;
		this.oMandatoryField = null;
		this.oDataTypeField = null;
		this.oMinValueField = null;
		this.oMaxValueField = null;
		this.oStepSizeField = null;
		this.oUnitField = null;
		this.oValueHelpField = null;
		this.oDescriptionField = null;
	}
});