/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.views.common.PeopleFacetView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.controls.MessageLog");
jQuery.sap.require("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.types.IntegerNullableType");
var oDropDownBox;
sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListValueCriteria", jQuery.extend({}, sap.ui.ino.views.common.PeopleFacetView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ResponsibilityListValueCriteria";
	},

	getBoundPath: function(sPath, bAbsolute) {
		return this.getController().getBoundPath(sPath, bAbsolute);
	},

	getBoundObject: function(oBinding, absolute, oType) {
		return this.getController().getBoundObject(oBinding, absolute, oType);
	},

	setRespValuesBinding: function(oBinding) {
		var oController = this.getController();
		var oModel = this.getModel(oController.getModelName());
		if (!oModel) {
			// Model was not yet set, do that now, publish the default model
			this.setModel(this.getModel(), oController.getModelName());
		}
		// first clean all rows of the criterion detail display
		this.oRespValuesDetailLayout.destroyRows();
		this.oRespValuesDetailLayout.removeAllRows();

		// set the binding
		this.oRespValuesTable.bindRows(oBinding);
	},

	setRespValuesContextBySiblingID: function(iRespvalueID) {
		this.setRespValuesContextByID(iRespvalueID);
	},

	setRespValuesContextByChildID: function(iParentID, iRespvalueID) {
		var oModel = this.getController().getModel();
		var aRows = this.oRespValuesTable.getRows();

		for (var i = 0; i < aRows.length; i++) {
			var oRowContext = this.oRespValuesTable.getContextByIndex(i);
			var iID = oModel.getProperty("ID", oRowContext);
			if (iID === iParentID) {
				this.oRespValuesTable.expand(i);
				this.setRespValuesContextByID(iRespvalueID);
				break;
			}
		}
	},

	/** In TreeTable API , if we want to expaned to rows after we modify the model ,
	 * method setSelectedIndex will not working due to the rows in the Tree Table is not updated
	 * After check the source code for TreeTable, envent "_rowsUpdated" could be used for our case once we add a new row in the Tree Table
	 *
	 * Note:
	 * event "_rowsUpdated" is not released in SAP UI5 API  sap.ui.table.Table
	 *  event "_rowsUpdated" is  triggered when the table rows is updated
	 *
	 * source code from Tabble.js line 395 to 420:
	 *
	 *         this._performUpdateRows = function(j) {
	 *    if (!i.bIsDestroyed) {
	 *            i._lastCalledUpdateRows = Date.now();
	 *            i._updateBindingContexts(undefined, undefined, j);
	 *            if (!i._bInvalid) {
	 *                if (i._updateTableContent) {
	 *                    i._updateTableContent();
	 *                }
	 *                i._getAccExtension().updateAccForCurrentCell(false);
	 *                i._updateSelection();
	 *                i._updateGroupHeader();
	 *                var l = i._collectTableSizes();
	 *                i._updateRowHeader(l.tableRowHeights);
	 *                i._syncColumnHeaders(l);
	 *                if (T.isVariableRowHeightEnabled(i)) {
	 *                    i._adjustTablePosition();
	 *                }
	 *                if (i._bBindingLengthChanged || T.isVariableRowHeightEnabled(i)) {
	 *                    i._updateVSb(l);
	 *                }
	 *            }
	 *            i._mTimeouts.bindingTimer = undefined;
	 *            i.fireEvent('_rowsUpdated');
	 *        }
	 *       i._bBindingLengthChanged = false;
	 *   }
	 **/

	setRespValuesContextByID: function(iRespvalueID) {
		var that = this;
		var oModel = this.getController().getModel();

		var fnRespTableRowUpdateHandler = function() {
			var aRows = that.oRespValuesTable.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRowContext = that.oRespValuesTable.getContextByIndex(i);
				var iID = oModel.getProperty("ID", oRowContext);
				if (iID === iRespvalueID) {
					that.oRespValuesDetailLayout.setBindingContext(oRowContext, that.getController().getModelName());
					that.oRespValuesTable.setSelectedIndex(i);
					break;
				}
			}
			that.oRespValuesTable.detachEvent("_rowsUpdated", fnRespTableRowUpdateHandler);
		};

		this.oRespValuesTable.attachEvent("_rowsUpdated", fnRespTableRowUpdateHandler);
	},

	setRespValueContext: function(oBindingContext) {
		this.oRespValuesDetailLayout.setBindingContext(oBindingContext, this.getController().getModelName());
		if (this.oButtonToolbar) {
			this.oButtonToolbar.setBindingContext(oBindingContext, this.getController().getModelName());
		}
		var bEdit = this.getController().isInEditMode();
		this.createRespValueDetailContent(bEdit, this.oRespValuesDetailLayout, oBindingContext);

		// Revalidate error messages for new controls and tree control
		this.revalidateMessages();
	},

	createControl: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.create(oSettings);
	},

	createContent: function() {
		var oViewData = this.getViewData();
		var oController = this.getController();

		this.oParentView = oViewData.parentView;
		this.bIncludeToolbar = oViewData.includeToolbar;
		oController.setParentController(this.oParentView.getController());

		var oModel = this.getModel(oController.getModelName());

		if (!oModel) {
			this.setModel(this.getModel(), oController.getModelName());
		}

		this.attachBeforeExit(this.onBeforeExit);

		var bEdit = oController.isInEditMode();
		this.oRespValuesLayout = this.createLayoutRespValues(bEdit);

		return this.oRespValuesLayout;
	},

	createLayoutRespValues: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['250px', '20px', '350px', '5%']
		});

		if (this.bIncludeToolbar === true) {
			this.oButtonToolbar = this.createRespValuesButtonToolbar(bEdit);

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

		this.oRespValuesTable = this.createRespValuesTable(bEdit);
		this.oRespValuesDetailLayout = this.createRespValuesDetailLayout(bEdit);

		var oFieldRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oRespValuesTable,
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
				content: this.oRespValuesDetailLayout,
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

	createRespValuesButtonToolbar: function(bEdit) {
		var oRespValuesButtonToolbar = new sap.ui.commons.Toolbar();

		//var oExpandButtonFormatter = this.createRespValuesExistsFormatter("expand");
		var oExpandAllButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_EXPAND_ALL"),
			press: [

				function(oEvent) {
					this.getController().onExpandAllRespValues(oEvent);
                },
			this],
			enabled: true
		});

		oRespValuesButtonToolbar.addItem(oExpandAllButton);

		var oAddSiblingButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_ADD_SIBLING"),
			press: [

				function(oEvent) {
					this.getController().onAddSibling(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: bEdit
		});

		oRespValuesButtonToolbar.addItem(oAddSiblingButton);

		var oAddChilduttonFormatter = this.createRespValuesExistsFormatter("addChild");
		var oAddChildButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_ADD_CHILD"),
			press: [

				function(oEvent) {
					this.getController().onAddChild(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: oAddChilduttonFormatter
		});

		oRespValuesButtonToolbar.addItem(oAddChildButton);

		var oCopyButtonFormatter = this.createRespValuesExistsFormatter("copy");
		var oCopyButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_COPY"),
			press: [

				function(oEvent) {
					this.getController().onCopyRespValues(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: oCopyButtonFormatter
		});

		oRespValuesButtonToolbar.addItem(oCopyButton);

		var oUpButtonFormatter = this.createRespValuesExistsFormatter("up");
		var oUpButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_UP"),
			press: [

				function(oEvent) {
					this.getController().onMoveRespValueUp(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: oUpButtonFormatter
		});

		oRespValuesButtonToolbar.addItem(oUpButton);

		var oDownButtonFormatter = this.createRespValuesExistsFormatter("down");
		var oDownButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_DOWN"),
			press: [

				function(oEvent) {
					this.getController().onMoveRespValueDown(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: oDownButtonFormatter
		});

		oRespValuesButtonToolbar.addItem(oDownButton);

		//usage
		var oUsageButtonFormatter = this.createUsageExistsFormatter();
		var oUsageButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_USAGE_TIT"),
			press: [

				function() {
					this._createUsageDialog(this.getSelectedRespValuesContext()).open();
            },
				this],
			enabled: oUsageButtonFormatter
		});
		oRespValuesButtonToolbar.addItem(oUsageButton);

		var oDeleteButtonFormatter = this.createRespValuesExistsFormatter("del");
		var oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_DELETE"),
			press: [

				function(oEvent) {
					this.getController().onDeleteRespValues(oEvent, this.getSelectedRespValuesContext());
            },
				this],
			enabled: oDeleteButtonFormatter
		});

		this.oDeleteButton = oDeleteButton;

		oRespValuesButtonToolbar.addItem(oDeleteButton);
//Add sort button for Desc/Asc
		var oSortButtonAsc = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_SORT_ASC" ),
			press: [
				function(oEvent) {
					this.getController().onSortRespValues(oEvent, "ASC");
            },
				this],
				enabled: bEdit
		});

		this.oSortButtonAsc = oSortButtonAsc;

		oRespValuesButtonToolbar.addItem(oSortButtonAsc);

		var oSortButtonDesc = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_SORT_DESC"),
			press: [
				function(oEvent) {
					this.getController().onSortRespValues(oEvent, "DESC");
            },
				this],
				enabled: bEdit
		});

		this.oSortButtonDesc = oSortButtonDesc;

		oRespValuesButtonToolbar.addItem(oSortButtonDesc);		

		this.createCopyAsDialog();

		return oRespValuesButtonToolbar;
	},

	createRespValuesTable: function() {
		var oController = this.getController();
		var oRespValueslTable = new sap.ui.table.TreeTable({
			columns: [
                new sap.ui.table.Column({
					label: this.createControl({
						Type: "label",
						Text: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT",
						Tooltip: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT"
					}),
					template: this.createControl({
						Type: "textview",
						Node: "RespValues",
						Text: "DEFAULT_TEXT",
						Tooltip: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT",
						Editable: false
					})
				})],
			enableSelectAll: false,
			selectionMode: sap.ui.table.SelectionMode.Single,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
			toggleOpenState: [this.delayRevalidateMessages, this]
		});
		return oRespValueslTable;
	},

	createRespValuesDetailLayout: function() {
		return new sap.ui.commons.layout.MatrixLayout({
			rows: new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.core.HTML({
						content: "<br/>",
						sanitizeContent: true
					}),
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			})
		});
	},
	createRespValueDetailContent: function(bEdit, oRespValuesDetailLayout, oBindingContext, oEventSourceControl) {
		this.oRespValuesDetailLayout.destroyRows();
		this.oRespValuesDetailLayout.removeAllRows();
		if (!oBindingContext) {
			return;
		}
		this._addRowIntoRespValuesDetailLayout(oRespValuesDetailLayout, this._createActiveLayout(bEdit, oBindingContext));
		this._addRowIntoRespValuesDetailLayout(oRespValuesDetailLayout, this._createGeneralLayout(bEdit, oBindingContext));
		this._addRowIntoRespValuesDetailLayout(oRespValuesDetailLayout, this._createUrlLayout(bEdit, oBindingContext));
		this._addRowIntoRespValuesDetailLayout(oRespValuesDetailLayout, this._createCoachesLayout(bEdit, oBindingContext));
		this._addRowIntoRespValuesDetailLayout(oRespValuesDetailLayout, this._createTagsLayout(bEdit, oBindingContext));

		if (this.__oTabStrip && this.__oTabStrip.getSelectedIndex() !== 0) {
			this.__oTabStrip.setSelectedIndex(0);
		}
	},
	createRespValuesExistsFormatter: function(sType) {
		var that = this;

		var oFormatter = {
			parts: [{
					path: this.getFormatterPath("ID", false)
				},
				{
					path: this.getFormatterPath("PARENT_VALUE_ID", false)
				}],
			formatter: function(sID, sParentValueId) {
				var oModel = that.getController().getModel();
				var aRespValuesByParentValueID = oModel.getRespValuesByParentValueId(sParentValueId);

				if (!that.getController().isInEditMode()) {
					return false;
				}

				if (sID && aRespValuesByParentValueID && aRespValuesByParentValueID !== null && sID !== 0) {
					for (var iIdx = 0; iIdx < aRespValuesByParentValueID.length; iIdx++) {

						//if exist only one entry ,  we should enable up and down button to false
						if (aRespValuesByParentValueID.length === 1) {
							if (sType === "up" || sType === "down") {
								return false;
							}
						}

						//if curreny ID in first row 
						if (aRespValuesByParentValueID[iIdx].ID === sID && iIdx === 0) {

							if (sType === "up") {
								return false;
							}

							if (sType === "down") {
								return true;
							}

						}

						//if curreny ID in last row 
						if (aRespValuesByParentValueID[iIdx].ID === sID && iIdx === aRespValuesByParentValueID.length - 1 && sType === "down") {

							if (sType === "up") {
								return true;
							}

							if (sType === "down") {
								return false;
							}

						}

						// if current ID not in first and last row
						if (aRespValuesByParentValueID[iIdx].ID === sID && aRespValuesByParentValueID.length > 2 && iIdx !== aRespValuesByParentValueID.length -
							1) {
							if (sType === "up" || sType === "down") {
								return true;
							}
						}
					}
				}

				if (!sID || sID === 0) {
					return false;
				}
				return true;

			}
		};

		return oFormatter;

	},

	createUsageExistsFormatter: function() {
		var oFormatter = {
			parts: [{
				path: this.getFormatterPath("ID", false)
				}],
			formatter: function(sID) {
				return sID > 0;
			}
		};
		return oFormatter;
	},

	getSelectedRespValuesContext: function() {
		var selectedIndex = this.oRespValuesTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oRespValuesTable.getContextByIndex(selectedIndex) !== null) {
			return this.oRespValuesTable.getContextByIndex(selectedIndex);
		}
		return null;
	},
	//Copy As Dialog
	createCopyAsDialog: function() {
		var oOverlay = this;
		var oDialogCopyButton = new sap.ui.commons.Button({
			text: "{i18n>BO_COMMON_BUT_COPY}",
			press: function(oEvent) {
				oOverlay.getController().onCopyPressed(oOverlay.oCopyAsCodeField.getValue(), oOverlay.getSelectedRespValuesContext());
			}
		});
		var oDialogCancelButton = new sap.ui.commons.Button({
			text: "{i18n>BO_COMMON_BUT_CANCEL}",
			press: function() {
				oOverlay.oCopyAsDialog.close();
			}
		});

		var oCopyAsCodeLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_RESPONSIBILITY_LIST_CRITERIA_FLD_PLAIN_CODE}"
		});

		this.oCopyAsCodeField = new sap.ui.commons.TextField({
			ariaLabelledBy: oCopyAsCodeLabel,
			liveChange: function(oEvent) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				if (oEvent.getParameters().liveValue.length > 0) {
					oDialogCopyButton.setEnabled(true);
				} else {
					oDialogCopyButton.setEnabled(false);
				}
			}
		});

		oCopyAsCodeLabel.setLabelFor(this.oCopyAsCodeField);

		var oCopyAsLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['140px', '60%']
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCopyAsCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCopyAsCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCopyAsLayout.addRow(oRow);

		this.oCopyAsDialog = new sap.ui.commons.Dialog({
			title: "{i18n>BO_RESPONSIBILITY_LIST_TIT_DIALOG_COPY}",
			content: [oCopyAsLayout]
		});
		this.oCopyAsDialog.addButton(oDialogCopyButton);
		this.oCopyAsDialog.addButton(oDialogCancelButton);
	},

	getCopyAsDialog: function() {
		return this.oCopyAsDialog;
	},

	getCopyAsCodeField: function() {
		return this.oCopyAsCodeField;
	},

	_addRowIntoRespValuesDetailLayout: function(oLayout, oContent) {
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oContent,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		}));
	},

	_createGeneralLayout: function(bEdit, oBindingContext) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['100px', '60%']
		});
		//Name
		oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_TEXT", this.createControl({
			Type: "textfield",
			Node: "RespValues",
			Text: "DEFAULT_TEXT",
			Editable: bEdit
		})));
		//Technical Name
		oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_PLAIN_TEXT", this.createControl({
			Type: "textfield",
			Node: "RespValues",
			Text: "PLAIN_CODE",
			Editable: bEdit
		})));
		//Description
		oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT", this.createControl({
			Type: "textarea",
			Node: "RespValues",
			Text: "DEFAULT_LONG_TEXT",
			Editable: bEdit
		})));
		//Default Coach
		oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_COACH", this._createDropdownBoxForDefault(bEdit,
			this.getSelectedRespValuesContext())));
		return oContent;
	},

	_createUsageDialog: function(oBindingContext) {
		var oController = this.getController();
		var oModel = oController.getModel("applicationObject");
		var content = this._createUsageLayout(oBindingContext, oModel);
		var dialog = new sap.ui.commons.Dialog({
			width: "90%",
			height: "85%",
			title: oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_TIT_DIALOG_USAGE_VALUE_LIST", oModel.getProperty("DEFAULT_TEXT",
				oBindingContext)),
			content: content,
			modal: true,
			resizable: false,
			keepInWindow: true
		});
		var oOkButton = new sap.ui.commons.Button({
			text: "{i18n>BO_COMMON_BUT_OK}",
			press: function() {
				dialog.close();
				dialog.destroy();
			}
		});
		dialog.addButton(oOkButton);
		return dialog;
	},

	_createUsageLayout: function(oBindingContext, oModel) {
		var sCode = oModel.getProperty("CODE", oBindingContext);
		var usageView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListValueUsage");
		usageView.getController().setCode(sCode);
		return usageView;
	},

	_createGeneralRow: function(oLblTxt, oCodeText) {
		return new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: oLblTxt,
					LabelControl: oCodeText
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeText,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
	},

	_createCoachesLayout: function(bEdit, oBindingContext) {
		var path = "";
		if (oBindingContext && oBindingContext.sPath) {
			path = oBindingContext.sPath.substring(1) + "/";
		}
		var oContent = this.createPeopleTabStrip("BO_RESPONSIBILITY_LIST_CRITERIA", undefined, [{
			childPath: path + "Coaches",
			identifier: "COACH",
			text: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_IDEACOACHES_TEXT",
			settings: {
				edit: bEdit,
				enableContact: false
			}
    		}, {
			childPath: path + "Experts",
			identifier: "EXPERT",
			text: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_EXPERTS_TEXT",
			settings: {
				edit: bEdit,
				enableContact: false
			}
    		}]);
		return oContent[0].getContent();
	},

	_createTagsLayout: function(bEdit, oBindingContext) {
		var oController = this.getController();
		var path = oController.getBindingPath(oBindingContext);
		var oTagsLabel = new sap.ui.commons.Label({
			text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_TAGS_TEXT"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		});

		var oTagLayout = new sap.ui.layout.VerticalLayout({
			width: "100%"
		});

		var oMessageLogTags = new sap.ui.ino.controls.MessageLog({
			messages: "{" + this.getViewData().parentView.getThingInspectorView().MESSAGE_LOG_MODEL_NAME + ">/messages}",
			groups: ["TAG"]
		});
		oTagLayout.addContent(oMessageLogTags);
		var oTagRepeater = new sap.ui.ino.controls.Repeater();

		function fnRemoveTag(oEvent) {
			oController.onTagRemoved(oEvent);
		}
		var oTagTemplate = sap.ui.ino.application.backoffice.ControlFactory.createTagTemplate(oController.getModelName(), "TAG_ID", "NAME",
			bEdit, fnRemoveTag);

		var oEditTagLayout = new sap.ui.commons.layout.HorizontalLayout();

		if (bEdit) {
			var oAddTagTextField = new sap.ui.ino.controls.AutoComplete({
				placeholder: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_ADD_TAG_TEXT"),
				maxLength: 30,
				maxPopupItems: 10,
				displaySecondaryValues: false,
				width: "auto",
				suggest: function(oEvent) {
					var sValue = oEvent.getParameter("suggestValue");
					var oListTemplate = new sap.ui.core.ListItem({
						text: "{NAME}",
						key: "{ID}"
					});
					oEvent.getSource().bindAggregation("items", {
						path: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"].createSearchPath(sValue),
						template: oListTemplate,
						parameters: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"].parameters
					});
				}
			});
			var fnTagSapEnter = oAddTagTextField.onsapenter;
			oAddTagTextField.onsapenter = function() {
				fnTagSapEnter.apply(oAddTagTextField, []);
				oController.onTagAdded(oAddTagTextField);
			};

			oAddTagTextField.setFilterFunction(function(sValue, oItem) {
				var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1);
				var model = oController.getModel();
				var aTags = model.getProperty("/" + path + "Tags");

				var fnFind = function(tagList, id) {
					if (!tagList) {
						return [];
					}
					return jQuery.grep(tagList, function(object) {
						return object.TAG_ID === id;
					});
				};
				return bEquals && (fnFind(aTags, oItem.getKey()).length === 0);
			});

			var oAddTagButton = new sap.ui.commons.Button({
				text: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_BUT_ADD_TAG_TEXT"),
				tooltip: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_ADD_TAG_TEXT"),
				press: function() {
					oController.onTagAdded(oAddTagTextField, path + "Tags");
				}
			});

			oEditTagLayout.addContent(oAddTagTextField);
			oEditTagLayout.addContent(new sap.ui.core.HTML({
				content: "<div style='width: 10px;' />",
				sanitizeContent: true
			}));
			oEditTagLayout.addContent(oAddTagButton);

			var oAddTagFromClipboardButton = new sap.ui.commons.Button({
				text: this.getController().getTextPath("BO_COMMON_BUT_ADD_FROM_CLIPBOARD"),
				enabled: {
					path: "clipboard>/changed",
					formatter: function() {
						var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag);
						return !bEmpty;
					}
				}
			});
			oAddTagFromClipboardButton.attachPress(function() {
				oController.addTagsFromClipboard(oAddTagFromClipboardButton, path + "Tags");
			});
			oEditTagLayout.addContent(oAddTagFromClipboardButton);
			oTagLayout.addContent(oEditTagLayout);
		}

		oTagRepeater.bindRows(this.getFormatterPath(path + "Tags", true), oTagTemplate);
		oTagLayout.addContent(oTagRepeater);

		return new sap.ui.commons.layout.MatrixLayout({
			rows: new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oTagsLabel,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oTagLayout,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				})]
			}),
			widths: ["38px", "90%"]
		});
	},

	_createActiveLayout: function(bEdit, oBindingContext) {
		var oView = this;
		var oController = oView.getController();
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['100px', '60%']
		});
		oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_ACTIVE_TEXT", this.createControl({
			Type: "checkbox",
			Node: "RespValues",
			Text: "IS_ACTIVE",
			Editable: {
				path: oController.getFormatterPath("IS_PARENT_ACTIVE"),
				formatter: function(bActive) {
					if (!oView.getController().isInEditMode()) {
						return false;
					}

					if (bActive) {
						return true;
					}
					return false;

				}
			},
			onChange: function(oEvent) {
				oController.onActiveChange(oEvent);
			}
		})));
		return oContent;
	},

	_createUrlLayout: function(bEdit, oBindingContext) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['100px', '60%']
		});
		var oView = this;
		var oController = oView.getController();

		var oMessageLogUrl = new sap.ui.ino.controls.MessageLog({
			messages: "{" + this.getViewData().parentView.getThingInspectorView().MESSAGE_LOG_MODEL_NAME + ">/messages}",
			groups: ["URL"]
		});

		oContent.addRow(this._createGeneralRow("", oMessageLogUrl));

		if (bEdit) {
			oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_LINK_URL", new sap.ui.commons.TextField({
				value: {
					path: oController.getFormatterPath("LINK_URL")
				},
				width: '100%',
				editable: bEdit,
				change: function(oEvent) {
					oController.onLinkUrlChanged(oEvent);
				}
			})));
		} else {
			oContent.addRow(this._createGeneralRow("BO_RESPONSIBILITY_LIST_CRITERIA_FLD_LINK_URL", this.createControl({
				Type: "link",
				Text: "LINK_URL",
				Visible: true,
				URL: {
					path: oController.getFormatterPath("LINK_URL")
				}
			})));
		}

		return oContent;
	},
	getFormatterPath: function(sPath, absolute) {
		return this.getController().getFormatterPath(sPath, absolute);
	},

	onBeforeExit: function() {

	},

	_createDropdownBoxForDefault: function(bEdit, oSelectedContext) {
		var that = this;
		oDropDownBox = new sap.ui.commons.DropdownBox({
			editable: {
				path: this.getFormatterPath(oSelectedContext.sPath + "/Coaches"),
				formatter: function(coaches) {
					var defaultCoaches = [{
						IDENTITY_ID: null,
						NAME: ''
					}];
					if (coaches) {
						for (var i = 0; i < coaches.length; i++) {
							if (coaches[i].TYPE_CODE !== "GROUP") {
								defaultCoaches.push({
									IDENTITY_ID: coaches[i].IDENTITY_ID,
									NAME: coaches[i].NAME
								});
							}
						}
					}
					that.getModel("applicationObject").setProperty(oSelectedContext.sPath + "/DefaultCoaches", defaultCoaches);
					return bEdit;
				}
			},
			selectedKey: {
				path: this.getFormatterPath(oSelectedContext.sPath + "/DEFAULT_COACH"),
				type: new sap.ui.ino.models.types.IntegerNullableType()
			},
			width: "100%"
		});
		var oItemTemplate;
		oItemTemplate = new sap.ui.core.ListItem({
			text: {
				path: this.getFormatterPath("NAME")
			},
			key: {
				path: this.getFormatterPath("IDENTITY_ID"),
				type: new sap.ui.ino.models.types.IntegerNullableType()
			},
			tooltip: {
				path: this.getFormatterPath("NAME")
			}
		});
		var sBindingPath = this.getFormatterPath(oSelectedContext.sPath + "/DefaultCoaches");
		var oBindingInfo = {
			path: sBindingPath,
			template: oItemTemplate
		};
		oDropDownBox.bindItems(oBindingInfo);
		return oDropDownBox;
	},
	revalidateMessages: function() {
		if (this.facetView) {
			var oThingInspectorView = this.facetView.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateTableMessages(this.oRespValuesTable, "RespValues");
		}
	},

	delayRevalidateMessages: function() {
		//delat call revalidate messages because it would not render all fields immediately
		var that = this;

		setTimeout(function() {
			that.revalidateMessages();
		}, 0);
	}

}));