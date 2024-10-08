/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.GroupManagementListDetails";
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

		this.oDetailData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_NAME}",
			new sap.ui.commons.TextView({
				text: "{NAME}"
			})));

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

		this.oMembersRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_MEMBERS}",
			new sap.ui.commons.TextView({
				text: "{MEMBERS}"
			}));
		this.oDetailData.addRow(this.oMembersRow);

		this.oDescriptionRow = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_DESCRIPTION}",
			new sap.ui.commons.TextView({
				text: "{DESCRIPTION}"
			}));
		this.oDetailData.addRow(this.oDescriptionRow);

		this.oIsMgrPublic = this._labeledTextRow("{i18n>BO_GROUPMGMT_GROUP_ROW_IS_MANAGER_PUBLIC}",
			new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: "IS_MANAGER_PUBLIC",
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			}));
		this.oDetailData.addRow(this.oIsMgrPublic);

		this.oDetailRightData = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['120px', 'auto']
		});
		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CREATED_AT}",
			new sap.ui.ino.controls.TextView({
				text: {
					path: "CREATED_AT",
					type: new sap.ui.model.type.Date()
				}
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CREATED_BY}",
			new sap.ui.commons.Link({
				text: "{CREATED_BY_NAME}",
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID",
					"user", false)
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CHANGED_AT}",
			new sap.ui.ino.controls.TextView({
				text: {
					path: "CHANGED_AT",
					type: new sap.ui.model.type.Date()
				}
			})));

		this.oDetailRightData.addRow(this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_FLD_CHANGED_BY}",
			new sap.ui.commons.Link({
				text: "{CHANGED_BY_NAME}",
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID",
					"user", false)
			})));

		if (sap.ui.ino.application.Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1) {
			this.oIsPublic = this._labeledTextRow("{i18n>BO_USERMANAGEMENT_LIST_ROW_PUBLIC}",
				new sap.ui.commons.CheckBox({
					editable: false,
					checked: {
						path: "IS_PUBLIC",
						type: new sap.ui.ino.models.types.IntBooleanType()
					}
				}));
			this.oDetailRightData.addRow(this.oIsPublic);
		}

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
			text: "{i18n>BO_GROUP_LIST_DETAILS_HEADER}"
		});

		return oPanel;
	}
});