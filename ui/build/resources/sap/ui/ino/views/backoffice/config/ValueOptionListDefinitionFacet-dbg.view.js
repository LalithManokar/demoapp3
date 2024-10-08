/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.model.FilterOperator");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ValueOptionListDefinitionFacet";
	},

	createFacetContent: function(oController) {
		var bEdit = oController.isInEditMode();
		var oValueListGroup = this.createValueListGroup(bEdit);
		var oValueGroup = this.createValueGroup(bEdit);

		return [oValueListGroup, oValueGroup];
	},

	createValueListGroup: function(bEdit) {
		var oController = this.getController();
		var oValueListLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['100px', '150px', '100px', '40%']
		});

		var oNameLabel = this.createControl({
			Type: "label",
			Text: "BO_VALUE_OPTION_LIST_FLD_DEFAULT_TEXT",
			Tooltip: "BO_VALUE_OPTION_LIST_FLD_DEFAULT_TEXT"
		});
		var oNameField = this.createControl({
			Type: "textfield",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit,
			LabelControl: oNameLabel
		});

		var oDescriptionLabel = this.createControl({
			Type: "label",
			Text: "BO_VALUE_OPTION_LIST_FLD_DEFAULT_LONG_TEXT",
			Tooltip: "BO_VALUE_OPTION_LIST_FLD_DEFAULT_LONG_TEXT"
		});
		var oDescriptionField = this.createControl({
			Type: "textarea",
			Text: "/DEFAULT_LONG_TEXT",
			Editable: bEdit,
			LabelControl: oDescriptionLabel
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				rowSpan: 3
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 3
			})]
		});
		oValueListLayout.addRow(oRow);

		var oCodeLabel = this.createControl({
			Type: "label",
			Text: "BO_VALUE_OPTION_LIST_FLD_CODE",
			Tooltip: "BO_VALUE_OPTION_LIST_FLD_CODE"
		});
		var sCodePath = "";
		if (bEdit === false) {
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
			Editable: bEdit,
			LabelControl: oCodeLabel
		});

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
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
		oValueListLayout.addRow(oRow);

		var oDataTypeLabel = this.createControl({
			Type: "label",
			Text: "BO_VALUE_OPTION_LIST_FLD_DATATYPE",
			Tooltip: "BO_VALUE_OPTION_LIST_FLD_DATATYPE"
		});
		var oDataTypeField = this.createDropDownBoxForCode({
			Path: "/DATATYPE_CODE",
			CodeTable: "sap.ino.xs.object.basis.Datatype.Root",
			Editable: bEdit,
			Visible: true,
			WithEmpty: false,
			LabelControl: oDataTypeLabel,
			Filters: new sap.ui.model.Filter([new sap.ui.model.Filter("CODE", sap.ui.model.FilterOperator.NE, "DATE"), new sap.ui.model.Filter(
				"CODE", sap.ui.model.FilterOperator.NE, "RICHTEXT")], true)
		});
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDataTypeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDataTypeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oValueListLayout.addRow(oRow);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_VALUE_OPTION_LIST_TIT_GENERAL_INFO"),
			content: [oValueListLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createValueGroup: function(bEdit) {
		var oController = this.getController();
		this._oCreateButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_CREATE"),
			press: [oController.onValueOptionCreatePressed, oController],
			lite: false,
			enabled: oController.isInEditMode()
		});

		this._oDeleteButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_DELETE"),
			press: [oController.onValueOptionDeletePressed, oController],
			lite: false,
			enabled: false
		});
		this._oUpButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_UP"),
			press:  [oController.moveUpValueOption,oController],
			lite: false,
			enabled: false
		});
		this._oDownButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_DOWN"),
			press: [oController.moveDownValueOption,oController],
			lite: false,
			enabled: false
		});	
		
		this._oSortDescButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_SORT_DESC"),
			press: [oController.sortByNameDesc,oController],
			lite: false,
			enabled: bEdit
		});	
		this._oSortAscButton = new sap.ui.commons.Button({
			text: this.getController().getTextPath("BO_VALUE_OPTION_BUT_SORT_ASC"),
			press: [oController.sortByNameAsc,oController],
			lite: false,
			enabled: bEdit
		});			

		this.oTable = new sap.ui.table.Table({
			enableColumnReordering: true,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			rowSelectionChange: function(oEvent) {
				oController.onValueOptionSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
			visibleRowCount: 6,
			toolbar: new sap.ui.commons.Toolbar({
				items: [this._oCreateButton, this._oDeleteButton,this._oUpButton,this._oDownButton,this._oSortDescButton,this._oSortAscButton]
			})
		});

		this.oTable.bindRows({
			path: this.getFormatterPath("/ValueOptions")
		});

		this.setupColumns();

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_VALUE_OPTION_LIST_TIT_OPTIONS"),
			content: [this.oTable, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	getColumnTemplate: function(sProperty, oValueType) {
		var oController = this.getController();

		oValueType = oValueType || new sap.ui.model.type.String();
		if (sProperty === "ACTIVE") {
			return new sap.ui.commons.CheckBox({
				checked: {
					path: this.getFormatterPath(sProperty),
					formatter: function(oValue) {
						if (oValue === 1 ) {
							return true;
						} else {
							return false;
						}
					},
					type: null
				},
				change: [oController.checkBoxValueChange, oController],
				editable: oController.isInEditMode()
			});

		}
		if (oController.isInEditMode()) {
			return new sap.ui.commons.TextField({
				value: {
					path: this.getFormatterPath(sProperty),
					type: oValueType
				},
				maxLength: this.getBoundPath("/meta/nodes/ValueOptions/attributes/" + sProperty + "/maxLength"),
				required: this.getBoundPath("/meta/nodes/ValueOptions/attributes/" + sProperty + "/required"),
				enabled: this.getBoundPath("/meta/nodes/ValueOptions/attributes/" + sProperty + "/changeable")
			});
		} else {
			return new sap.ui.commons.TextView({
				text: this.getBoundPath(sProperty)
			});
		}
	},

	setupColumns: function() {
		var oController = this.getController();
		// Must run after model has been initialized
		var sDataTypeCode = oController.getModel().getProperty("/DATATYPE_CODE");

		this.oTable.destroyColumns();

		this.oDefaultTextColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getController().getTextPath("BO_VALUE_OPTION_ROW_DEFAULT_TEXT")
			}),
			template: this.getColumnTemplate("DEFAULT_TEXT"),
			sortProperty: "DEFAULT_TEXT",
			filterProperty: "DEFAULT_TEXT"
		});
		this.oTable.addColumn(this.oDefaultTextColumn);

		this.oDefaultLongTextColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getController().getTextPath("BO_VALUE_OPTION_ROW_DEFAULT_LONG_TEXT")
			}),
			template: this.getColumnTemplate("DEFAULT_LONG_TEXT"),
			sortProperty: "DEFAULT_LONG_TEXT",
			filterProperty: "DEFAULT_LONG_TEXT"
		});
		this.oTable.addColumn(this.oDefaultLongTextColumn);

		this.oCodeColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getController().getTextPath("BO_VALUE_OPTION_ROW_CODE")
			}),
			template: this.getColumnTemplate("PLAIN_CODE"),
			sortProperty: "PLAIN_CODE",
			filterProperty: "PLAIN_CODE"
		});
		this.oTable.addColumn(this.oCodeColumn);

		// Transient property, which is distributed in the model according to data type
		var oValueType = null;
		if (sDataTypeCode === "INTEGER") {
			oValueType = new sap.ui.model.type.Integer();
		} else if (sDataTypeCode === "NUMERIC") {
			oValueType = new sap.ui.model.type.Float();
		} else if (sDataTypeCode === "TEXT") {
			oValueType = new sap.ui.model.type.String();
		} else if (sDataTypeCode === "BOOLEAN") {
			oValueType = new sap.ui.model.type.Integer({
				groupingEnabled: false,
				minFractionDigits: 0,
				maxFractionDigits: 0
			}, {
				minimum: 0,
				maximum: 1
			});
		}

		this.oValueColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getController().getTextPath("BO_VALUE_OPTION_ROW_VALUE")
			}),
			template: this.getColumnTemplate("VALUE", oValueType)
		});
		this.oTable.addColumn(this.oValueColumn);

		this.oActiveColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: this.getController().getTextPath("BO_VALUE_OPTION_ROW_ACTIVE")
			}),
			template: this.getColumnTemplate("ACTIVE")
		});
		this.oTable.addColumn(this.oActiveColumn);

	},

	getSelectedRowContext: function() {
		var selectedIndex = this.oTable.getSelectedIndex();
		if (selectedIndex > -1 && this.oTable.getContextByIndex(selectedIndex) != null) {
			return this.oTable.getContextByIndex(selectedIndex);
		};
		return null;
	},

	getSelectedRowContexts: function() {
		var aSelectedIndex = this.oTable.getSelectedIndices();
		var aSelectedRowContext = [];
		for (var i = 0; i < aSelectedIndex.length; i++) {
			var selectedIndex = aSelectedIndex[i];
			aSelectedRowContext.push(this.oTable.getContextByIndex(selectedIndex));
		};
		return aSelectedRowContext;
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},
}));