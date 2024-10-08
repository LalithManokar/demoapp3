/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusActionListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.statusconfig.StatusActionListDetails";
	},

	_labeledTextRow: function(sLabelText, oTextControl) {

		var oLabel = new sap.ui.commons.Label({
			text: sLabelText,
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oCellLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Begin,
			vAlign: sap.ui.commons.layout.VAlign.Top,
			content: [oLabel]
		});
		var oCellText = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Begin,
			vAlign: sap.ui.commons.layout.VAlign.Top,
			content: [oTextControl]
		});

		oLabel.setLabelFor(oTextControl);

		return new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [oCellLabel, oCellText]
		});
	},

	createContent: function(oController) {

		this.oDetailData = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['120px', 'auto']
		});

		this.oDetailData.addRow(this._labeledTextRow("{i18n>BO_STATUS_ACTION_FLD_ID}",
			new sap.ui.commons.TextView({
				text: "{ID}"
			})));
		this.oTypeRow = this._labeledTextRow("{i18n>BO_STATUS_ACTION_FLD_DEFAULT_TEXT}",
			new sap.ui.commons.TextView({
				text: "{DEFAULT_TEXT}"
			}));
		this.oDetailData.addRow(this.oTypeRow);

		this.oDescriptionRow = this._labeledTextRow("{i18n>BO_STATUS_ACTION_FLD_DEFAULT_LONG_TEXT}",
			new sap.ui.commons.TextView({
				text: "{DEFAULT_LONG_TEXT}"
			}));
		this.oDetailData.addRow(this.oDescriptionRow);

		this.oDetailRightData = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['120px', 'auto']
		});

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_STATUS_ACTION_ROW_CREATED_AT}",
			new sap.ui.ino.controls.TextView({
				text: {
					path: "CREATED_AT",
					type: new sap.ui.model.type.Date()
				}
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_STATUS_ACTION_ROW_CREATED_BY}",
			new sap.ui.commons.Link({
				text: "{CREATED_BY}",
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID",
					"user", false)
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_STATUS_ACTION_ROW_CHANGED_AT}",
			new sap.ui.ino.controls.TextView({
				text: {
					path: "CHANGED_AT",
					type: new sap.ui.model.type.Date()
				}
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_STATUS_ACTION_ROW_CHANGED_BY}",
			new sap.ui.commons.Link({
				text: "{CHANGED_BY}",
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID",
					"user", false)
			})));

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ['40%', '10%', '50%']
		});

		oLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDetailData,
				padding: sap.ui.commons.layout.Padding.End,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), // dummy layout cell
			new sap.ui.commons.layout.MatrixLayoutCell({
				padding: sap.ui.commons.layout.Padding.End,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDetailRightData,
				padding: sap.ui.commons.layout.Padding.Both,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}));

		// This is important to take the full height of the shell content
		this.setHeight('100%');
		// this avoids scrollbars for 100% height
		this.setDisplayBlock(true);

		var oPanel = new sap.ui.commons.Panel({
			content: oLayout,
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_STATUS_ACTION_DETAILS_HEADER}"
		});

		return oPanel;

	}
});