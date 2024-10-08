/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserManagementListDetails";
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

		this.oDetailData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_NAME}", new sap.ui.commons.TextView({
			text: "{NAME}"
		})));

		this.oFirstNameRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_FIRST_NAME}", new sap.ui.commons.TextView({
			text: "{FIRST_NAME}"
		}));
		this.oDetailData.addRow(this.oFirstNameRow);

		this.oLastNameRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_LAST_NAME}", new sap.ui.commons.TextView({
			text: "{LAST_NAME}"
		}));
		this.oDetailData.addRow(this.oLastNameRow);

		this.oUserNameRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_USER_NAME}", new sap.ui.commons.TextView({
			text: "{USER_NAME}"
		}));
		this.oDetailData.addRow(this.oUserNameRow);

		this.oOriginRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_SOURCE_TYPE_CODE}", new sap.ui.commons.TextView({
			text: {
				path: "SOURCE_TYPE_CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.SourceTypeCode.Root")
			}
		}));
		this.oDetailData.addRow(this.oOriginRow);

		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			style: "medium"
		});
		this.oValidationToRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_VALIDATIONTO}", new sap.ui.commons.TextView({
			text: {
				path: "VALIDATION_TO",
				formatter: function(oDate) {
					if (!oDate) {
						oDate = new Date("9999-12-31T00:00:00.000Z");
					}
					return oDateFormat.format(oDate);
				}
			}
		}));
		this.oDetailData.addRow(this.oValidationToRow);

		this.oIsExternalRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_EXTERNAL}", new sap.ui.commons.CheckBox({
			editable: false,
			checked: {
				path: "IS_EXTERNAL",
				type: new sap.ui.ino.models.types.IntBooleanType()
			}
		}));
		this.oDetailData.addRow(this.oIsExternalRow);

		this.oEmailRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_EMAIL}", new sap.ui.commons.Link({
			text: "{EMAIL}",
			href: {
				path: "EMAIL",
				formatter: function(sVal) {
					return "mailto:" + sVal;
				}
			}
		}));
		this.oDetailData.addRow(this.oEmailRow);

		this.oDetailRightData = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['120px', 'auto']
		});

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CREATED_AT}", new sap.ui.ino.controls.TextView({
			text: {
				path: "CREATED_AT",
				type: new sap.ui.model.type.Date()
			}
		})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CREATED_BY}", new sap.ui.commons.Link({
			text: "{CREATED_BY_NAME}",
			press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
		})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CHANGED_AT}", new sap.ui.ino.controls.TextView({
			text: {
				path: "CHANGED_AT",
				type: new sap.ui.model.type.Date()
			}
		})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CHANGED_BY}", new sap.ui.commons.Link({
			text: "{CHANGED_BY_NAME}",
			press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
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
			text: "{i18n>BO_USER_LIST_DETAILS_HEADER}"
		});

		return oPanel;

	}
});