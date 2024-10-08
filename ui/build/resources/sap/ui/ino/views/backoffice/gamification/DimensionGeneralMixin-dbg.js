/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.declare("sap.ui.ino.views.backoffice.gamification.DimensionGeneralMixin");

(function() {
	sap.ui.ino.views.backoffice.gamification.DimensionGeneralMixin = {
		createGeneralContentThingGroup: function(bEdit) {
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 5,
				widths: ['15%', '35%', '50px', '15%', '35%']
			});
			this.createGeneralContent(oLayout, bEdit);
			return new sap.m.Panel({
				headerText: this.getController().getTextPath("BO_GAMIFICATION_DIMENSION_GENERAL_INFO_TIT"),
				content: [oLayout]
			});
		},

		createGeneralContent: function(oLayout, bEdit) {
			var oNameLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_NAME",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_NAME"
			});
			var oNameField = this.createControl({
				Type: "textfield",
				Text: "/NAME",
				Editable: bEdit,
				LabelControl: oNameLabel
			});
			var oUnitLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_UNIT",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_UNIT"
			});
			var oUnit = this.createDropDownBoxForCode({
				Path: "/UNIT",
				CodeTable: "sap.ino.xs.object.basis.Unit.Root",
				Editable: {
					path: this.getFormatterPath("property/nodes/Root/attributes/UNIT/changeable", true),
					formatter: function(bChangeable) {
						return (bEdit && bChangeable);
					}
				},
				Visible: true,
				onChange: function(oEvent) {},
				onLiveChange: function(oEvent) {},
				WithEmpty: true,
				LabelControl: oUnitLabel
			});

			var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: oNameLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oNameField
					}), new sap.ui.commons.layout.MatrixLayoutCell(),
			 new sap.ui.commons.layout.MatrixLayoutCell({
						content: oUnitLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oUnit
					})]
			});
			oLayout.addRow(oRow);

			var oTechNameLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_TECH_NAME",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_TECH_NAME"
			});
			var oTechNameField = this.createControl({
				Type: "textfield",
				Text: "/TECHNICAL_NAME",
				Editable: bEdit,
				LabelControl: oTechNameLabel
			});
// 			var oScopeLabel = this.createControl({
// 				Type: "label",
// 				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_SCOPE",
// 				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_SCOPE"
// 			});
// 			var oScope = new sap.ui.commons.DropdownBox({
// 				selectedKey: this.getBoundPath("SCOPE", true),
// 				editable: false,
// 				width: "100%",
// 				required: true
// 			});
// 			oScopeLabel.setLabelFor(oScope);
// 			oScope.addItem(new sap.ui.core.ListItem({
// 				key: "SYSTEM",
// 				text: "{i18n>BO_GAMIFICATION_DIMENSION_DETAIL_SYSTEM_SCOPE}"
// 			}));

			var oDescLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_DESCRIPTION",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_DESCRIPTION"
			});
			var oDesc = this.createControl({
				Type: "textarea",
				Text: "/DESCRIPTION",
				Editable: bEdit,
				LabelControl: oDescLabel
			});
			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: oTechNameLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oTechNameField
					}), new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.layout.MatrixLayoutCell({
						content: oDescLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oDesc,
						rowSpan: 3
					})]
			});
			oLayout.addRow(oRow);

			var oStatusLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_STATUS",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_STATUS"
			});
			var oStatus = new sap.ui.commons.DropdownBox({
				selectedKey: this.getBoundPath("STATUS", true),
				editable: bEdit,
				required: true,
				width: "100%"
			});
			oStatusLabel.setLabelFor(oStatus);
			oStatus.addItem(new sap.ui.core.ListItem({
				key: 1,
				text: "{i18n>BO_GAMIFICATION_DIMENSION_DETAIL_ACTIVE_ITEM}"
			}));
			oStatus.addItem(new sap.ui.core.ListItem({
				key: 0,
				text: "{i18n>BO_GAMIFICATION_DIMENSION_DETAIL_INACTIVE_ITEM}"
			}));

			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: oStatusLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oStatus
					}), new sap.ui.commons.layout.MatrixLayoutCell()]
			});
			oLayout.addRow(oRow);

			var oRedeemLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_REDEEM",
				Tooltip: "BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_REDEEM"
			});
			var oRedeem = this.createControl({
				Type: "checkbox",
				Text: "/REDEEM",
				Editable: bEdit,
				LabelControl: oRedeemLabel
			});

			oRow = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: oRedeemLabel,
						hAlign: sap.ui.commons.layout.HAlign.End
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: oRedeem
					}), new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.layout.MatrixLayoutCell()]
			});
			oLayout.addRow(oRow);
		},

		createDropDownBoxForCode: function(oSettings) {
			if (!oSettings.View) {
				oSettings.View = this;
			}
			return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
		}
	};
}());