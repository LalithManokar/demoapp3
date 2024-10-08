/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyDefinitionFacet";
	},

	onShow: function() {
		this.revalidateMessages();
	},

	createFacetContent: function() {
		var bEdit = this.getController().isInEditMode();
		var bNew = this.getController().getModel().isNew();
		if(!bNew && this.getController().getModel().getPropertyModel()){
		    bNew = !this.getController().getModel().getPropertyModel().getProperty("/actions/update/customProperties/bModelUsed");
		}
		var oGroupGeneral = this.createLayoutGeneral(bEdit, bNew);
		var oGroupTransitions = this.createLayoutTransitions(bEdit, bNew);

		return [oGroupGeneral, oGroupTransitions];
	},

	createLayoutGeneral: function(bEdit, bNew) {

		var oController = this.getController();

		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['100px', '150px', '100px', '40%']
		});

		var oCodeLabel = this.createControl({
			Type: "label",
			Text: "BO_VALUE_OPTION_LIST_FLD_CODE",
			Tooltip: "BO_VALUE_OPTION_LIST_FLD_CODE"
		});

		var sCodePath = "";
		if (!bEdit) {
			sCodePath = {
				path: oController.getFormatterPath("CODE", true),
				formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
			};
		} else {
			sCodePath = "/PLAIN_CODE";
		}

		var oCodeField = this.createControl({
			Type: "textfield",
			Text: sCodePath,
			Editable: bEdit && bNew,
			LabelControl: oCodeLabel
		});

		var oNameText = this.createControl({
			Type: "textfield",
			Node: "Root",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit && bNew
		});

		var oReasonText = this.createControl({
			Type: "checkbox",
			Node: "Root",
			Text: "/SHOW_REASON",
			Editable: bEdit
		});

		var oRow1 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_MODEL_FLD_DEFAULT_TEXT",
						LabelControl: oNameText
					}),
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oNameText,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})

            ]
		});
		oContent.addRow(oRow1);

		var oRow2 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRow2);

		var oRow3 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_IDEA_FLD_SHOW_DECISION_REASON",
					LabelControl: oReasonText
				}),
				vAlign: sap.ui.commons.layout.VAlign.Center,
				hAlign: sap.ui.commons.layout.HAlign.begin

			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oReasonText,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin

			})]
		});

		oContent.addRow(oRow3);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_MODEL_GENERAL_INFO_TIT"),
			content: [oContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	setTransitionContext: function(oBindingContext) {
		//Binding detail info
		this.oTransitionDetailLayout.setBindingContext(oBindingContext, this.getController().getModelName());
		var bEdit = this.getController().isInEditMode();
		var bNew = this.getController().getModel().isNew();
		if(!bNew && this.getController().getModel().getPropertyModel()){
		    bNew = !this.getController().getModel().getPropertyModel().getProperty("/actions/update/customProperties/bModelUsed");
		}
		//Detail Content layout 
		this.createTransitionDetailContent(bEdit, this.oTransitionDetailLayout, oBindingContext, undefined, bNew);

	},

	createTransitionDetailContent: function(bEdit, oTransitionDetailLayout, oBindingContext, oEventSourceControl, bNew) {
		this.bRefreshOngoing = true;
		// first clean all rows
		oTransitionDetailLayout.removeAllRows();

		var oController = this.getController();
		var oModel = oController.getModel();
		if (!oModel.getProperty("ID", oBindingContext)) {

			this.bRefreshOngoing = false;
			return;
		}

		// current_status_detail
		if (!this.oCurrentStatusLabel || this.oCurrentStatusLabel.bIsDestroyed === true) {
			this.oCurrentStatusLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_CURRENT_STATUS_NAME",
				Tooltip: "BO_IDEA_FLD_CURRENT_STATUS_NAME"
			});
		}

		var oCurrentStatusFieldSettings = {
			Path: "CURRENT_STATUS_CODE",
			CodeTable: "sap.ino.xs.object.status.StatusStage.Root",
			Editable: bEdit && bNew,
			Visible: true,
			onChange: this.refreshTransitionDetailContent,
			WithEmpty: true,
			LabelControl: this.oCurrentStatusLabel,
			ShowTechName: true,
			DisplaySecondaryValues: true
		};
		if (!this.oCurrentStatusField || this.oCurrentStatusField.bIsDestroyed === true) {
			this.oCurrentStatusField = this.createDropDownBoxForCode(oCurrentStatusFieldSettings);
		}

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCurrentStatusLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCurrentStatusField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oTransitionDetailLayout.addRow(oRow);

		// status_action_detail
		if (!this.oActionLabel || this.oActionLabel.bIsDestroyed === true) {
			this.oActionLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_STATUS_ACTION_NAME",
				Tooltip: "BO_IDEA_FLD_STATUS_ACTION_NAME"
			});
		}

		if (!this.oActionLabel || this.oActionLabel.bIsDestroyed === true) {
			this.oActionLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_STATUS_ACTION_NAME",
				Tooltip: "BO_IDEA_FLD_STATUS_ACTION_NAME"
			});
		}
		var oStatusActionSettings = {
			Path: "STATUS_ACTION_CODE",
			CodeTable: "sap.ino.xs.object.status.ActionStage.Root",
			Editable: bEdit && bNew,
			Visible: true,
			onChange: this.refreshTransitionDetailContent,
			WithEmpty: true,
			LabelControl: this.oActionLabel,
			ShowTechName: true,
			DisplaySecondaryValues: true
		};
		if (!this.oActionField || this.oActionField.bIsDestroyed === true) {
			this.oActionField = this.createDropDownBoxForCode(oStatusActionSettings);
		}

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oActionLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oActionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oTransitionDetailLayout.addRow(oRow);
		// next_status_detail
		if (!this.oNextStatusLabel || this.oNextStatusLabel.bIsDestroyed === true) {
			this.oNextStatusLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_NEXT_STATUS_NAME",
				Tooltip: "BO_IDEA_FLD_NEXT_STATUS_NAME"
			});
		}
		var oNextStatusFieldSettings = {
			Path: "NEXT_STATUS_CODE",
			CodeTable: "sap.ino.xs.object.status.StatusStage.Root",
			Editable: bEdit && bNew,
			Visible: true,
			onChange: this.refreshTransitionDetailContent,
			WithEmpty: true,
			LabelControl: this.oNextStatusLabel,
			ShowTechName: true,
			DisplaySecondaryValues: true
		};
		if (!this.oNextStatusField || this.oNextStatusField.bIsDestroyed === true) {
			this.oNextStatusField = this.createDropDownBoxForCode(oNextStatusFieldSettings);
		}

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oNextStatusLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oNextStatusField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oTransitionDetailLayout.addRow(oRow);
		// Decision relavant
		if (!this.oDecisionRelevantLabel || this.oDecisionRelevantLabel.bIsDestroyed === true) {
			this.oDecisionRelevantLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_DECISION_RELEVANT_NAME",
				Tooltip: "BO_IDEA_FLD_DECISION_RELEVANT_NAME"
			});
		}
		if (!this.oDecisionRelevant || this.oDecisionRelevant.bIsDestroyed === true) {
			this.oDecisionRelevant = this.createControl({
				Type: "checkbox",
				Node: "Transitions",
				Text: "DECISION_RELEVANT",
				Editable: bEdit,
				onChange: function(oEvent) {
					oController.onDecisionChange(oEvent);
				}
			});
		}
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDecisionRelevantLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDecisionRelevant,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oTransitionDetailLayout.addRow(oRow);
		//Allow Email
		if (!this.oResponseLabel || this.oResponseLabel.bIsDestroyed === true) {
			this.oResponseLabel = this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_RESPONSE_NAME",
				Tooltip: "BO_IDEA_FLD_RESPONSE_NAME"
			});
		}
		if (!this.oResponseInclude || this.oResponseInclude.bIsDestroyed === true) {
			this.oResponseInclude = this.createControl({
				Type: "checkbox",
				Node: "Transitions",
				Text: "INCLUDE_RESPONSE",
				Editable: bEdit,
				onChange: function(oEvent) {
					oController.onIncludeRespChange(oEvent);
				}
			});
		}
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oResponseLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oResponseInclude,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oTransitionDetailLayout.addRow(oRow);

		// Reason List Detail
		if (!this.oValueHelpLabel || this.oValueHelpLabel.bIsDestroyed === true) {
			this.oValueHelpLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_DECISION_REASON_LIST",
				Tooltip: "BO_CRITERION_FLD_DECISION_REASON_LIST"
			});
		}
		var aValueListFilters = this.createFilterForValueList("TEXT");
		var oValueListSettings = {
			Path: "DECISION_REASON_LIST_CODE",
			CodeTable: "sap.ino.xs.object.basis.ValueOptionList.Root",
			Editable: bEdit,
			Visible: true,
			onChange: this.refreshTransitionDetailContent,
			WithEmpty: true,
			LabelControl: this.oValueHelpLabel,
			Filters: aValueListFilters
		};

		if (!this.oValueHelpField || this.oValueHelpField.bIsDestroyed === true) {
			this.oValueHelpField = this.createDropDownBoxForCode(oValueListSettings);
		} else if (oEventSourceControl !== this.oValueHelpField) {
			// update binding to consider the new filters if event that causes the recreation was not triggered by
			// that control
			//var oValueHelpTypeBinding = this.oValueHelpField.getBinding("items");
			//oValueHelpTypeBinding.filter(aValueListFilters);
		}

		var oDecisionListRow = new sap.ui.commons.layout.MatrixLayoutRow({
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
		this.oDecisionListRow = oDecisionListRow;
		if (oBindingContext.getProperty("DECISION_RELEVANT")) {
			oTransitionDetailLayout.addRow(oDecisionListRow);
		}
		// Text Module Detail
		if (!this.oTextModuleLabel || this.oTextModuleLabel.bIsDestroyed === true) {
			this.oTextModuleLabel = this.createControl({
				Type: "label",
				Text: "BO_CRITERION_FLD_TEXT_MODULE_LIST",
				Tooltip: "BO_CRITERION_FLD_TEXT_MODULE_LIST"
			});
		}
		//   var aValueListFilters = this.createFilterForValueList("TEXT");
		var oTextModuleSettings = {
			Path: "TEXT_MODULE_CODE",
			CodeTable: "sap.ino.xs.object.basis.TextModule.Root",
			Editable: bEdit,
			Visible: true,
			onChange: this.refreshTransitionDetailContent,
			WithEmpty: true,
			LabelControl: this.oTextModuleLabel
		};

		if (!this.oTextModuleField || this.oTextModuleField.bIsDestroyed === true) {
			this.oTextModuleField = this.createDropDownBoxForCode(oTextModuleSettings);
		} else if (oEventSourceControl !== this.oTextModuleField) {
			// update binding to consider the new filters if event that causes the recreation was not triggered by
			// that control
			//var oValueHelpTypeBinding = this.oValueHelpField.getBinding("items");
			//oValueHelpTypeBinding.filter(aValueListFilters);
		}

		var oTextModuleListRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oTextModuleLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oTextModuleField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oTextModuleListRow = oTextModuleListRow;
		if (oBindingContext.getProperty("INCLUDE_RESPONSE")) {
			oTransitionDetailLayout.addRow(oTextModuleListRow);
		}
	},

	refreshTransitionDetailContent: function(oEvent) {
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
		var bNew = this.getController().getModel().isNew();
		if(!bNew && this.getController().getModel().getPropertyModel()){
		    bNew = !this.getController().getModel().getPropertyModel().getProperty("/actions/update/customProperties/bModelUsed");
		}
		var oRowContext = this.getSelectedTransitionContext();
		this.createTransitionDetailContent(bEdit, this.oTransitionDetailLayout, oRowContext, oSourceControl, bNew);
		if (oSourceControl) {
			oSourceControl.focus();
		}
		this.bRefreshOngoing = false;
	},

	getSelectedTransitionContext: function() {
		var selectedIndex = this.oTransitionTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oTransitionTable.getContextByIndex(selectedIndex) !== null) {
			return this.oTransitionTable.getContextByIndex(selectedIndex);
		}
		return null;
	},

	createTransitionTable: function() {
		var oController = this.getController();
		var oTable = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			enableColumnReordering: true,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
			visibleRowCount: 6
		});
		var oCurrentColumn = new sap.ui.table.Column({
			label: this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_CURRENT_STATUS_NAME",
				Tooltip: "BO_IDEA_FLD_CURRENT_STATUS_NAME"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CURRENT_STATUS_CODE"),
					formatter: this.getController().formatIdeaStatus
				}
			})
		});
		oTable.addColumn(oCurrentColumn);
		var oActionColumn = new sap.ui.table.Column({

			label: this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_STATUS_ACTION_NAME",
				Tooltip: "BO_IDEA_FLD_STATUS_ACTION_NAME"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("STATUS_ACTION_CODE"),
					formatter: this.getController().formatIdeaAction
				}
			})
		});
		oTable.addColumn(oActionColumn);
		var oNextColumn = new sap.ui.table.Column({
			label: this.createControl({
				Type: "label",
				Text: "BO_IDEA_FLD_NEXT_STATUS_NAME",
				Tooltip: "BO_IDEA_FLD_NEXT_STATUS_NAME"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("NEXT_STATUS_CODE"),
					formatter: this.getController().formatIdeaStatus
				}
			})

		});
		oTable.addColumn(oNextColumn);

		oTable.bindRows({
			path: this.getFormatterPath("/Transitions"),
			sorter: new sap.ui.model.Sorter("SEQUENCE_NO")
		});

		return oTable;
	},

	createTransitionDetailLayout: function() {
		var oTransitionDetailLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['140px', '60%'] //['30%', '35%', '35%']
		});

		return oTransitionDetailLayout;
	},

	createLayoutTransitions: function(bEdit, bNew) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['250px', '20px', '300px', '5%'] //['37%', '1%', '62%']
		});

		if (bEdit && bNew) {
			this.oButtonToolbar = this.createFieldButtonToolbar();

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

		this.oTransitionTable = this.createTransitionTable();
		this.oTransitionDetailLayout = this.createTransitionDetailLayout();

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oTransitionTable,
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
				content: this.oTransitionDetailLayout,
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

		oContent.addRow(oRow);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_TRANSITION_OPTION_LIST_TIT_OPTIONS"),
			content: [oContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
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
	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	revalidateMessages: function() {
		var oThingInspectorView = this.getController().getThingInspectorController().getView();
		oThingInspectorView.revalidateTableMessages(this.oTransitionTable, "Transition");

		sap.ui.ino.views.common.FacetAOView.revalidateMessages.apply(this, arguments);
	},

	setTransitionContextByID: function(iFieldID) {
		var oModel = this.getController().getModel();
		var aRows = oModel.oData.Transitions;
		for (var i = 0; i < aRows.length; i++) {
			var oRowContext = this.oTransitionTable.getContextByIndex(i);
			var iID = oModel.getProperty("ID", oRowContext);
			if (iID === iFieldID) {
				this.oTransitionDetailLayout.setBindingContext(oRowContext, this.getController().getModelName());
				this.oTransitionTable.setSelectedIndex(i);
				var iFirstVisileRow = this.oTransitionTable.getFirstVisibleRow();
				if (i - iFirstVisileRow > this.oTransitionTable.getRows().length - 1 || i - iFirstVisileRow < 0) {
					this.oTransitionTable.setFirstVisibleRow(i);
				}
				return;
			}
		}
	},
	//Create toolbar button	
	createFieldButtonToolbar: function() {
		var oFieldButtonToolbar = new sap.ui.commons.Toolbar();
		var oController = this.getController();
		this._oCreateButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_STATUS_BUT_CREATE"),
			press: [oController.onStatusCreatePressed, oController],
			lite: false,
			enabled: oController.isInEditMode()
		});
		oFieldButtonToolbar.addItem(this._oCreateButton);
		this._oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_STATUS_BUT_DELETE"),
			press: [

				function(oEvent) {
					this.getController().onStatusDeletePressed(oEvent, this.getSelectedTransitionContext());
            },
				this],
			lite: false,
			enabled: false
		});
		oFieldButtonToolbar.addItem(this._oDeleteButton);

		this._oUpButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_STATUS_BUT_UP"),
			press: [

				function(oEvent) {
					this.getController().onStatusUpPressed(oEvent, this.getSelectedTransitionContext());
            },
				this],
			lite: false,
			enabled: false
		});
		oFieldButtonToolbar.addItem(this._oUpButton);
		this._oDownButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_STATUS_BUT_DOWN"),
			press: [

				function(oEvent) {
					this.getController().onStatusDownPressed(oEvent, this.getSelectedTransitionContext());
            },
				this],
			lite: false,
			enabled: false
		});
		oFieldButtonToolbar.addItem(this._oDownButton);

		return oFieldButtonToolbar;
	}

}));