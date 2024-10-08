/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.StringBooleanType");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ValueOptionListDetails";
	},

	setRowContext: function(oBindingContext) {
		if (!oBindingContext) {
			return;
		}
		var iID = oBindingContext.getProperty("ID");

		var sKey = "StagingValueOptionList(" + iID + ")";
		sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
		var sPath = "/" + sKey;
		this.bindElement(sPath);
	},

	createContent: function(oController) {
		var oPanel = new sap.ui.commons.Panel({
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_VALUE_OPTION_LIST_DETAILS_HEADER}"
		});

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 3,
			width: '100%',
			widths: ['33%', '33%', '34%']
		});

		var oRow = this.createValueListDetailRow();
		oLayout.addRow(oRow);

		var oRowValues = this.createValueRow();
		oLayout.addRow(oRowValues);

		oPanel.addContent(oLayout);

		return oPanel;
	},

	createValueListDetailRow: function() {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		var oContent = this.createValueListDetailLeft();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		oContent = this.createValueListDetailMiddle();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		oContent = this.createValueListDetailRight();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		return oRow;
	},

	createValueRow: function() {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin,
			colSpan: 3
		});

		var oTable = this.createValueTable();
		oCell.addContent(oTable);

		oRow.addCell(oCell);

		return oRow;
	},

	createValueTable: function() {
		var oController = this.getController();

		var oTable = new sap.ui.table.Table({
			enableColumnReordering: true,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
			},
			visibleRowCount: 6
		});

		var oCodeColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_VALUE_OPTION_ROW_CODE}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: "CODE",
					formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
				}
			})
		});
		oTable.addColumn(oCodeColumn);

		var oValueColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_VALUE_OPTION_ROW_VALUE}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: "DATATYPE_CODE"
                    }, {
						path: "NUM_VALUE"
                    }, {
						path: "TEXT_VALUE"
                    }, {
						path: "BOOL_VALUE"
                    }],
					formatter: function(sDataTypeCode, fNumber, sText, bBoolean) {
						if (sDataTypeCode === "INTEGER") {
							return Math.round(fNumber);
						} else if (sDataTypeCode === "NUMERIC") {
							return fNumber;
						} else if (sDataTypeCode === "BOOLEAN") {
							return new sap.ui.ino.models.types.StringBooleanType().formatValue(bBoolean);
						} else {
							return sText;
						}
					}
				}
			})
		});
		oTable.addColumn(oValueColumn);

		var oDefaultTextColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_VALUE_OPTION_ROW_DEFAULT_TEXT}"
			}),
			template: new sap.ui.commons.TextView({
				text: "{DEFAULT_TEXT}"
			}),
			sortProperty: "DEFAULT_TEXT",
			filterProperty: "DEFAULT_TEXT"
		});
		oTable.addColumn(oDefaultTextColumn);

		var oDefaultLongTextColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_VALUE_OPTION_ROW_DEFAULT_LONG_TEXT}"
			}),
			template: new sap.ui.commons.TextView({
				text: "{DEFAULT_LONG_TEXT}"
			}),
			sortProperty: "DEFAULT_LONG_TEXT",
			filterProperty: "DEFAULT_LONG_TEXT"
		});
		oTable.addColumn(oDefaultLongTextColumn);

		var oActiveColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_VALUE_OPTION_ROW_ACTIVE}"
			}),
			template: new sap.ui.commons.CheckBox({
				checked: {
					parts: [{
						path: "ACTIVE"
                    }],
					formatter: function(oValue) {
						if (oValue === 1) {
							return true;
						} else {
							return false;
						}
					},
					type: null
				},
				editable: false
			}),
			sortProperty: "ACTIVE",
			filterProperty: "ACTIVE"
		});
		oTable.addColumn(oActiveColumn);

		oTable.bindRows({
			path: "ValueOptions",
			sorter: new sap.ui.model.Sorter("SEQUENCE_NO", false)
		});

		return oTable;
	},

	createValueListDetailLeft: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['120px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VALUE_OPTION_LIST_TIT_VOL}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oText = new sap.ui.ino.controls.TextView({
			text: {
				path: "CODE",
				formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
			}
		});

		oLabel.setLabelFor(oText);

		oLayout.createRow(oLabel, oText);

		return oLayout;
	},

	createValueListDetailMiddle: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['120px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VALUE_OPTION_LIST_ROW_CREATED_AT}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oText = new sap.ui.ino.controls.TextView({
			text: {
				path: "CREATED_AT",
				type: new sap.ui.model.type.Date()
			}
		});

		oLabel.setLabelFor(oText);

		oLayout.createRow(oLabel, oText);

		return oLayout;
	},

	createValueListDetailRight: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['120px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VALUE_OPTION_LIST_ROW_CREATED_BY}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oLink = new sap.ui.commons.Link({
			text: "{CREATED_BY}",
			press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user", false)
		});

		oLabel.setLabelFor(oLink);

		oLayout.createRow(oLabel, oLink);

		return oLayout;
	}
});