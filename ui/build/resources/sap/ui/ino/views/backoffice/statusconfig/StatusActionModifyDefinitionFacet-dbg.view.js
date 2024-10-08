/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusActionModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.statusconfig.StatusActionModifyDefinitionFacet";
	},

	createFacetContent: function(oController) {
		var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createLayoutGeneral(bEdit);

		return [oGroupGeneral];
	},

	createLayoutGeneral: function(bEdit) {
		var oStatusNameLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['200px', '200px', '100px', '40%']
		});

		var oNameLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_ACTION_FLD_DEFAULT_TEXT",
			Tooltip: "BO_STATUS_ACTION_FLD_DEFAULT_TEXT"
		});
		var oNameField = this.createControl({
			Type: "textfield",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit,
			LabelControl: oNameLabel
		});

		var oDescriptionLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_ACTION_FLD_DEFAULT_LONG_TEXT",
			Tooltip: "BO_STATUS_ACTION_FLD_DEFAULT_LONG_TEXT"
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
				rowSpan: 2
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 2
			})]
		});
		oStatusNameLayout.addRow(oRow);

		var oCodeLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_ACTION_FLD_PLAIN_CODE",
			Tooltip: "BO_STATUS_ACTION_FLD_PLAIN_CODE"
		});

		var oCodeField = this.createControl({
			Type: "textfield",
			Text: "/PLAIN_CODE",
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
		oStatusNameLayout.addRow(oRow);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_STATUS_ACTION_GENERAL_INFO_TIT"),
			content: [oStatusNameLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	}

}));