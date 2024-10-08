/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.views.common.PeopleFacetView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupTreeCriteria", jQuery.extend({}, sap.ui.ino.views.common.PeopleFacetView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.tag.TagGroupTreeCriteria";
	},

	getBoundPath: function(sPath, bAbsolute) {
		return this.getController().getBoundPath(sPath, bAbsolute);
	},

	getBoundObject: function(oBinding, absolute, oType) {
		return this.getController().getBoundObject(oBinding, absolute, oType);
	},

	setTreeValueBinding: function(oBinding) {
		var oController = this.getController();
		var oModel = this.getModel(oController.getModelName());
		if (!oModel) {
			// Model was not yet set, do that now, publish the default model
			this.setModel(this.getModel(), oController.getModelName());
		}
		// first clean all rows of the criterion detail display
		this.oGroupTreeDetailLayout.destroyRows();
		this.oGroupTreeDetailLayout.removeAllRows();

		// set the binding
		this.oGroupTreeTable.bindRows(oBinding);
	},

	setTagGroupContextBySiblingID: function(iID) {
		this.setTagGroupContextByID(iID);
	},

	setTagGroupContextByChildID: function(iParentID, iRecordID, iSelectedIndex) {
		var oModel = this.getController().getModel();
		var aRows = this.oGroupTreeTable.getRows();
		var allAssignmentTags = this.getController().convertToFlatList(oModel.getProperty("/AssignmentTags"), false);
		var iLength = allAssignmentTags.length > aRows.length ? allAssignmentTags.length : aRows.length;

		for (var i = iSelectedIndex; i < iLength; i++) {
			var oRowContext = this.oGroupTreeTable.getContextByIndex(i);
			var iID = oModel.getProperty("TAG_ID", oRowContext);
			var oTypeCode = oModel.getProperty("OBJECT_TYPE_CODE", oRowContext);
			if (iID === iParentID && oTypeCode === "TAG_GROUP") {
				this.oGroupTreeTable.expand(i);
				this.setTagGroupContextByID(iRecordID, iSelectedIndex);
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

	setTagGroupContextByID: function(iRecordID, iSelecedIndex) {
		var that = this;
		var oModel = this.getController().getModel();
		var allAssignmentTags = this.getController().convertToFlatList(oModel.getProperty("/AssignmentTags"), false);
		if (!iSelecedIndex) {
			iSelecedIndex = 0;
		}

		var fnRespTableRowUpdateHandler = function() {
			var aRows = that.oGroupTreeTable.getRows();
			var iLength = allAssignmentTags.length > aRows.length ? allAssignmentTags.length : aRows.length;
			for (var i = iSelecedIndex; i < iLength; i++) {
				var oRowContext = that.oGroupTreeTable.getContextByIndex(i);
				var iID = oModel.getProperty("ID", oRowContext);
				if (iID === iRecordID) {
					that.oGroupTreeDetailLayout.setBindingContext(oRowContext, that.getController().getModelName());
					that.oGroupTreeTable.setSelectedIndex(i);
					break;
				}
			}
			that.oGroupTreeTable.detachEvent("_rowsUpdated", fnRespTableRowUpdateHandler);
		};

		this.oGroupTreeTable.attachEvent("_rowsUpdated", fnRespTableRowUpdateHandler);
	},

	setTagGroupValueContext: function(oBindingContext) {
		this.oGroupTreeDetailLayout.setBindingContext(oBindingContext, this.getController().getModelName());
		if (this.oButtonToolbar) {
			this.oButtonToolbar.setBindingContext(oBindingContext, this.getController().getModelName());
		}
		var bEdit = this.getController().isInEditMode();
		this.createTagGroupDetailContent(bEdit, this.oGroupTreeDetailLayout, oBindingContext);

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
		this.oGroupTreeLayout = this.createLayoutGroupTree(bEdit);

		return this.oGroupTreeLayout;
	},

	createLayoutGroupTree: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['250px', '20px', '320px', '1%']
		});

		if (this.bIncludeToolbar === true) {
			this.oButtonToolbar = this.createGroupTreeButtonToolbar(bEdit);

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

		this.oGroupTreeTable = this.createGroupTreeTable(bEdit);
		this.oGroupTreeDetailLayout = this.createGroupTreeDetailLayout(bEdit);

		var oFieldRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oGroupTreeTable,
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
				content: this.oGroupTreeDetailLayout,
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

	createGroupTreeButtonToolbar: function(bEdit) {
		var oButtonToolbar = new sap.ui.commons.Toolbar();

		//var oExpandButtonFormatter = this.createTagGroupExistsFormatter("expand");
		var oExpandAllButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_TAG_GROUP_CRITERIA_BUT_EXPAND_ALL"),
			press: [

				function(oEvent) {
					this.getController().onExpandAll(oEvent);
                },
			this],
			enabled: true
		});

		oButtonToolbar.addItem(oExpandAllButton);

		var oAddSiblingButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_TAG_GROUP_CRITERIA_BUT_ADD_SIBLING"),
			press: [

				function(oEvent) {
					this.getController().onAddSibling(oEvent, this.getSelectedTagGroupContext());
            },
				this],
			enabled: bEdit
		});

		oButtonToolbar.addItem(oAddSiblingButton);

		//var oAddChilduttonFormatter = this.createTagGroupExistsFormatter("addChild");
		var oAddChildButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_TAG_GROUP_CRITERIA_BUT_ADD_CHILD"),
			press: [

				function(oEvent) {
					this.getController().onAddChild(oEvent, this.getSelectedTagGroupContext());
            },
				this],
			enabled: {
				path: this.getFormatterPath("OBJECT_TYPE_CODE", false),
				formatter: function(code) {
					return code === "TAG_GROUP" && bEdit;
				}
			}
		});

		oButtonToolbar.addItem(oAddChildButton);
		//var oDeleteButtonFormatter = this.createTagGroupExistsFormatter("del");
		var oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_TAG_GROUP_CRITERIA_BUT_DELETE"),
			press: [

				function(oEvent) {
					this.getController().onDeleteAssignmentTagGroup(oEvent, this.getSelectedTagGroupContext());
            },
				this],
			enabled: {
				path: this.getFormatterPath("ID", false),
				formatter: function(sID) {
					if (!sID || sID === 0) {
						return false && bEdit;
					}
					return true && bEdit;
				}
			}
		});

		this.oDeleteButton = oDeleteButton;

		oButtonToolbar.addItem(oDeleteButton);

		//this.createCopyAsDialog();

		return oButtonToolbar;
	},
	createGroupTreeTable: function() {
		var oController = this.getController();
		var oImage = new sap.ui.core.Icon({
			src: "sap-icon://group-2",
			visible: {
				path: this.getFormatterPath("OBJECT_TYPE_CODE"),
				type: null,
				formatter: function(sType) {
					if (sType === "TAG_GROUP") {
						return true;
					} else {
						return false;
					}
				}

			}
		});
		oImage.addStyleClass("sapUiInoTagGrpIcon");
		var oTextField = new sap.ui.commons.TextView({
			editable: false,
			text: this.getBoundPath("NAME")
		});

		var oGroupHbox = new sap.m.HBox({
			items: [oImage, oTextField]
		});
		var oGroupTreeTable = new sap.ui.table.TreeTable({
			columns: [
                new sap.ui.table.Column({
					label: this.createControl({
						Type: "label",
						Text: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT",
						Tooltip: "BO_RESPONSIBILITY_LIST_CRITERIA_FLD_DEFAULT_LONG_TEXT"
					}),
					template: oGroupHbox
				})],
			enableSelectAll: false,
			selectionMode: sap.ui.table.SelectionMode.Single,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
			toggleOpenState: [this.delayRevalidateMessages, this] //function (oEvent){oController.onToggleOpenState(oEvent);} 
		});
		return oGroupTreeTable;
	},

	createGroupTreeDetailLayout: function() {
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
	createTagGroupDetailContent: function(bEdit, oTagGroupDetailLayout, oBindingContext, oEventSourceControl) {
		this.oGroupTreeDetailLayout.destroyRows();
		this.oGroupTreeDetailLayout.removeAllRows();
		if (!oBindingContext) {
			return;
		}
		this._addRowIntoGroupTreeDetailLayout(oTagGroupDetailLayout, this._createTagGroupInput(bEdit, oBindingContext));
		this._addRowIntoGroupTreeDetailLayout(oTagGroupDetailLayout, this._createGeneralLayout(bEdit, oBindingContext));
	},
	createTagGroupExistsFormatter: function(sType) {
		var that = this;

		var oFormatter = {
			parts: [{
					path: this.getFormatterPath("TAG_ID", false)
				},
				{
					path: this.getFormatterPath("TAG_GROUP_ID", false)
				}],
			formatter: function(sID, sParentValueId) {
				var oModel = that.getController().getModel();
				var aTagGroupByParentValueID = oModel.getAssignmentTagGroupByParentValueId(sParentValueId);

				if (!that.getController().isInEditMode()) {
					return false;
				}

				// if (sID && aTagGroupByParentValueID && aTagGroupByParentValueID !== null && sID !== 0) {
				// 	for (var iIdx = 0; iIdx < aTagGroupByParentValueID.length; iIdx++) {

				// 	}
				// }

				if (!sID || sID === 0) {
					return false;
				}
				return true;

			}
		};

		return oFormatter;

	},

	getSelectedTagGroupContext: function() {
		var selectedIndex = this.oGroupTreeTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oGroupTreeTable.getContextByIndex(selectedIndex) !== null) {
			return this.oGroupTreeTable.getContextByIndex(selectedIndex);
		}
		return null;
	},

	_addRowIntoGroupTreeDetailLayout: function(oLayout, oContent) {
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oContent,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		}));
	},

	_createGeneralLayout: function(bEdit, oBindingContext) {
		var oTextBoundle = this.getModel("i18n").getResourceBundle();
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['100px', '60%']
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_NAME_TEXT", this.createControl({
			Type: "textfield",
			Node: "AssignmentTags",
			Text: "NAME",
			Editable: false
		})));
		var oObjectTypeCode = new sap.ui.commons.TextField({
			value: {
				path: this.getFormatterPath("OBJECT_TYPE_CODE"),
				formatter: function(sType) {
					if (sType === "TAG" || !sType) {
						return oTextBoundle.getText("BO_TAG_GROUP_FIELD_TYPE_TAG");
					} else {
						return oTextBoundle.getText("BO_TAG_GROUP_FIELD_TYPE_TAG_GROUP");
					}
				}
			},
			editable: false
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_OBJECT_TYPE_TEXT", oObjectTypeCode));
		//Usage Count
		var oUsageCount = new sap.ui.commons.TextField({
			value: {
				path: this.getFormatterPath("USAGE_COUNT")
			},
			editable: false,

			visible: {
				path: this.getFormatterPath("OBJECT_TYPE_CODE"),
				type: null,
				formatter: function(sType) {
					if (sType === "TAG" || !sType) {
						return true;
					} else {
						return false;
					}
				}
			}
		});

		var oUsageLbl = new sap.ui.commons.Label({
			text: oTextBoundle.getText("BO_TAG_GROUP_ROW_USAGE_COUNT_TEXT"),
			labelFor: oUsageCount,
			visible: {
				path: this.getFormatterPath("OBJECT_TYPE_CODE"),
				type: null,
				formatter: function(sType) {
					if (sType === "TAG" || !sType) {
						return true;
					} else {
						return false;
					}

				}
			}
		});
		var oUsageCountRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oUsageLbl,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oUsageCount,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});

		oContent.addRow(oUsageCountRow);
		//Created ON
		var oCreatedOn = new sap.ui.commons.TextField({
			value: {
				path: this.getFormatterPath("CREATED_AT"),
				formatter: function(date) {
					var oDate = new Date(date);
					if(!date)
					{
					    oDate = new Date();
					}					
					return new sap.ui.model.type.Date().formatValue(oDate, 'sap.ui.model.type.Date');
				}
			},
			editable: false
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_CREATED_AT", oCreatedOn));
		//Created by
		var oCreatedBy = new sap.ui.commons.Link({
			text: this.getBoundPath("CREATED_BY"),
			press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_CREATED_BY", oCreatedBy));
		//Changed At

		var oChangedAt = new sap.ui.commons.TextField({
			value: {
				path: this.getFormatterPath("CHANGED_AT"),
				formatter: function(date) {
					var oDate = new Date(date);
					if(!date)
					{
					    oDate = new Date();
					}
					return new sap.ui.model.type.Date().formatValue(oDate, 'sap.ui.model.type.Date');
				}
			},
			editable: false
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_CHANGED_AT", oChangedAt));
		//Changed by
		var oChangedBy = new sap.ui.commons.Link({
			text: this.getBoundPath("CHANGED_BY"),
			press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
		});
		oContent.addRow(this._createGeneralRow("BO_TAG_GROUP_ROW_CHANGED_BY", oChangedBy));
		return oContent;
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
	_createTagGroupInput: function(bEdit, oBindingContext) {
		var oController = this.getController();
		var that = this;
		var oAddTagGroupTextField = new sap.ui.ino.controls.AutoComplete({
			placeholder: "{i18n>BO_TAG_GROUP_FLD_ADD_TAG_OR_GROUP_PLACEHOLDER}",
			maxPopupItems: 10,
			editable: bEdit,
			visible: bEdit,
			displaySecondaryValues: true,
			searchThreshold: 500,
			width: "200px",
			suggest: function(oEvent) {
				var sValue = oEvent.getParameter("suggestValue");
				var oListTemplate = new sap.ui.core.ListItem({
					text: "{NAME}",
					additionalText: "{OBJECT_TYPE_CODE}",
					key: "{ID}"
				});
				//var instanceSelection = sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"];
				oEvent.getSource().bindAggregation("items", {
					path: "/SearchTagsGroupsParams(searchToken='" + sValue + "')/Results",
					template: oListTemplate,
					length: 30,
					parameters: {
						select: "searchToken,ID,NAME,OBJECT_TYPE_CODE,USAGE_COUNT,CREATED_AT,CREATED_BY,CHANGED_AT,CHANGED_BY"
					}
				});
			},
			confirm: function() {
				oController.addTagOrGroup(this, oBindingContext);
			}
		});
        oAddTagGroupTextField.addStyleClass("sapUiInoTagGrpInput");
		oAddTagGroupTextField.setFilterFunction(function(sValue, oItem) {
			var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
				sValue.toLowerCase()) !== -1);
			return bEquals;
		});
		var oAddButton = new sap.ui.commons.Button({
			text: "{i18n>BO_TAG_GROUP_BUT_ADD_TAG}",
			press: function() {
				oController.addTagOrGroup(oAddTagGroupTextField, oBindingContext);
			},
			enabled: bEdit
		});
		var oCreateTag = new sap.ui.commons.Button({
			text: "{i18n>BO_TAG_GROUP_BUT_NEW_TAG}",
			press: function() {
				oController.onCreateNewTag();
			},
			enabled: bEdit
		});
		var oCreateTagGroup = new sap.ui.commons.Button({
			text: "{i18n>BO_TAG_GROUP_BUT_NEW_TAG_GROUP}",
			press: function() {
				oController.onCreateNewTagGroup();
			},
			enabled: bEdit
		});
		var oBtnToolbar = new sap.ui.commons.Toolbar({
			items: [oAddButton, oCreateTag, oCreateTagGroup]
		});

		return new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			rows: new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oAddTagGroupTextField,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oBtnToolbar
				})]
			}),
			widths: ['50%', '50%']
		});

	},

	getFormatterPath: function(sPath, absolute) {
		return this.getController().getFormatterPath(sPath, absolute);
	},

	onBeforeExit: function() {

	},
	revalidateMessages: function() {
		if (this.facetView) {
			var oThingInspectorView = this.facetView.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateTableMessages(this.oGroupTreeTable, "AssignmentTags");
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