/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ResponsibilityListModifyDefinitionFacet";
	},

	createFacetContent: function() {
		var bEdit = this.getController().isInEditMode();
		var oGroupGeneral = this.createLayoutGeneral(bEdit);
		var oGroupCriterions = this.createLayoutRespValues(bEdit);

		return [oGroupGeneral, oGroupCriterions];
	},

	createLayoutGeneral: function(bEdit) {
		var oController = this.getController();
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['100px', '150px', '100px', '40%']
		});

		var oCodeText = this.createControl({
			Type: "textfield",
			Node: "Root",
			Text: "/PLAIN_CODE",
			Editable: bEdit
		});

		var oDescriptionText = this.createControl({
			Type: "textarea",
			Node: "Root",
			Text: "/DEFAULT_LONG_TEXT",
			Editable: bEdit
		});

		var oNameText = this.createControl({
			Type: "textfield",
			Node: "Root",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit
		});

		var oPublicChkbox = this.createControl({
			Type: "checkbox",
			Node: "Root",
			Text: "/IS_MANAGER_PUBLIC",
			Editable: !bEdit ? false : {
				parts: [{
					path: this.getFormatterPath("/CREATED_BY_ID"),
					type: null
				}, {
					path: this.getFormatterPath("/ID"),
					type: null
				}],
				formatter: function(cId, id) {
					return oController.formatterPublic(cId, id);
				}
			}
		});

		var oRow1 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_RESPONSIBILITY_LIST_LIST_ROW_DEFAULT_TEXT",
					LabelControl: oNameText
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameText,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_RESPONSIBILITY_LIST_LIST_ROW_DEFAULT_LONG_TEXT",
					LabelControl: oDescriptionText
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				rowSpan: 2
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionText,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 2
			})]
		});
		oContent.addRow(oRow1);

		var oRow2 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_RESPONSIBILITY_LIST_LIST_ROW_CODE",
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
		oContent.addRow(oRow2);

		var oRowPublic = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_RESPONSIBILITY_LIST_LIST_ROW_IS_MANAGER_PUBLIC",
					LabelControl: oPublicChkbox
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oPublicChkbox,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowPublic);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_GENERAL_INFO_TIT"),
			content: [oContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createLayoutRespValues: function() {
		this.oRespValuesDetailView = sap.ui.view({
			viewName: "sap.ui.ino.views.backoffice.config.ResponsibilityListValueCriteria",
			type: sap.ui.core.mvc.ViewType.JS,
			viewData: {
				parentView: this,
				includeToolbar: true
			}
		});

		this.oRespValuesDetailView.facetView = this;

		var oBinding = {
			path: this.getFormatterPath("RespValues", true),
			parameters: {
				arrayNames: ["children"]
			},
			sorter: [new sap.ui.model.Sorter("SEQUENCE_NO")]
		};

		this.oRespValuesDetailView.setRespValuesBinding(oBinding);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_RESPONSIBILITY_LIST_RESPONSIBILITY_LIST_VALUE_TIT"),
			content: [this.oRespValuesDetailView, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	revalidateMessages: function() {
		this.oRespValuesDetailView.revalidateMessages();
		// super call
		sap.ui.ino.views.common.FacetAOView.revalidateMessages.apply(this, arguments);
	}
}));