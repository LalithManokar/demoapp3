/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.commons.TextView");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayoutRow");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayoutCell");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.commons.LabelDesign");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.OverflowToolbar");
jQuery.sap.require("sap.m.Title");
jQuery.sap.require("sap.ui.table.Column");
jQuery.sap.require("sap.m.SegmentedButton");
jQuery.sap.require("sap.m.SegmentedButtonItem");
jQuery.sap.require("sap.ui.model.type.Date");
jQuery.sap.require("sap.ui.model.type.String");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.DimensionListDetail", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.gamification.DimensionListDetail";
	},

	createContent: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['10%', '40%', '10%', '40%']
		});

		this._createGeneralContent(oLayout);

		// This is important to take the full height of the shell content
		this.setHeight('100%');
		// this avoids scrollbars for 100% height
		this.setDisplayBlock(true);

		var oPanel = new sap.ui.commons.Panel({
			content: oLayout,
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_GAMIFICATION_DIMENSION_DETAIL_HEADER}"
		});

		return oPanel;
	},

	_createGeneralContent: function(oLayout) {
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_NAME",
				"NAME"
			)).concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_CREATE_ON",
				"CREATED_AT",
				1,
				null,
				new sap.ui.model.type.Date()
			))
		}));

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_TECH_NAME",
				"TECHNICAL_NAME"
			)).concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_CREATE_BY",
				"CREATED_BY"
			))
		}));

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_STATUS",
				"STATUS", 1, null, null, function(sStatus) {
					var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
					if (sStatus && Number(sStatus) === 1) {
						return oBundle.getText("BO_GAMIFICATION_DIMENSION_DETAIL_ACTIVE_ITEM");
					}
					return oBundle.getText("BO_GAMIFICATION_DIMENSION_DETAIL_INACTIVE_ITEM");
				}
			)).concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_CHANGE_ON",
				"CHANGED_AT",
				1,
				null,
				new sap.ui.model.type.Date()
			))
		}));

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_REDEEM",
				"REDEEM",
				1,
				new sap.ui.commons.CheckBox({
					editable: false,
					checked: {
						path: "REDEEM",
						type: new sap.ui.ino.models.types.IntBooleanType()
					}
				})
			)).concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_CHANGE_BY",
				"CHANGED_BY"
			))
		}));
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_UNIT",
				"UNIT",
				2,
				null,
				null,
				sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.basis.Unit.Root")
			))
		}));
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [].concat(this._createElement(
				"i18n>BO_GAMIFICATION_DIMENSION_DETAIL_LABEL_DESCRIPTION",
				"DESCRIPTION",
				3
			))
		}));
	},

	_createElement: function(sLabelPath, sContentPath, iColSpan, oCtrl, sDataType, fnFormatter) {
		iColSpan = iColSpan || 1;
		var oLabel = new sap.ui.commons.Label({
			text: {
				path: sLabelPath
			},
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oContent = oCtrl || new sap.ui.commons.TextView({
			text: {
				path: sContentPath,
				type: sDataType || new sap.ui.model.type.String(),
				formatter: fnFormatter
			}
		});

		return [new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLabel]
		}), new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oContent],
			colSpan: iColSpan
		})];
	}
});