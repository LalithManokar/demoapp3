/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	// global controls
	oCriterionDetailView: null,

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.EvaluationModelModifyDefinitionFacet";
	},

	onShow: function() {
		this.revalidateMessages();
	},

	createFacetContent: function() {
		var bEdit = this.getController().isInEditMode();
		var oGroupGeneral = this.createLayoutGeneral(bEdit);
		var oGroupCriterions = this.createLayoutCriterions(bEdit);

		return [oGroupGeneral, oGroupCriterions];
	},

	createLayoutGeneral: function(bEdit) {
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
		var oView = this;
		var oFormulaChk = this.createControl({
			Type: "checkbox",
			Node: "Root",
			Text: "/ENABLE_FORMULA",
			Editable: bEdit,
			onChange: function(oEvent) {
				if (oEvent.getParameter("checked")) {
					var aCriterions = oView.getController().getModel("applicationObject").getProperty("/Criterion");
					if (aCriterions && aCriterions.length > 0) {
						for (var index = 0; index < aCriterions.length; index++) {
							if (aCriterions[index].IS_OVERALL_RESULT === 1) {
								oView.getController().getModel("applicationObject").setProperty("/ENABLE_FORMULA", 0);
								sap.ui.commons.MessageBox.show(
									oView.getController().getTextModel().getText("BO_MODEL_FLD_CALC_FORMULA_MSG"),
									sap.ui.commons.MessageBox.Icon.ERROR,
									oView.getController().getTextModel().getText("BO_MODEL_FLD_CALC_FORMULA_MSG_TITLE")
								);
								break;
							}
						}
					}
				}
			}
		});

		var oFormulaTxt = this.createControl({
			Type: "textfield",
			Node: "Root",
			Text: "/CALC_FORMULA",
			Editable: bEdit,
			Visible: {
				path: this.getFormatterPath("ENABLE_FORMULA", true),
				type: null,
				formatter: function(nEnabelFormula) {
					return !!nEnabelFormula && nEnabelFormula > 0;
				}
			}
		});

		var oFormulaLbl = new sap.m.HBox({
			visible: {
				path: this.getFormatterPath("ENABLE_FORMULA", true),
				type: null,
				formatter: function(nEnabelFormula) {
					return !!nEnabelFormula && nEnabelFormula > 0;
				}
			}
		});
		oFormulaLbl.addItem(this.createControl({
			Type: "label",
			Text: "BO_MODEL_FLD_CALC_FORMULA",
			Tooltip: "{i18n>BO_MODEL_FLD_CALC_FORMULA_TIP}",
			LabelControl: oFormulaTxt
		}));
		var oIcon = new sap.ui.core.Icon({
			src: "sap-icon://message-information",
			tooltip: "{i18n>BO_MODEL_FLD_CALC_FORMULA_TIP}"
		});
		oIcon.addStyleClass("sapUiInoEvaluationDetailInfo");
		oFormulaLbl.addItem(oIcon);

		var oRow1 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_MODEL_FLD_DEFAULT_TEXT",
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
					Text: "BO_MODEL_FLD_DEFAULT_LONG_TEXT",
					LabelControl: oDescriptionText
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				rowSpan: 3
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionText,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 3
			})]
		});
		oContent.addRow(oRow1);

		var oRow2 = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_MODEL_FLD_PLAIN_CODE",
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

		var oRowFormulaChk = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_MODEL_FLD_ENABLE_FORMULA",
					LabelControl: oFormulaChk
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oFormulaChk,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowFormulaChk);

		var oRowFormula = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oFormulaLbl,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oFormulaTxt,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				colSpan: 3
			})]
		});
		oContent.addRow(oRowFormula);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_MODEL_GENERAL_INFO_TIT"),
			content: [oContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	setCriterionContext: function(oBindingContext) {
		this.oCriterionDetailView.setCriterionContext(oBindingContext);
	},

	setCriterionContextByID: function(iCriterionID) {
		this.oCriterionDetailView.setCriterionContextByID(iCriterionID);
	},

	getSelectedCriterionContext: function() {
		return this.oCriterionDetailView.getSelectedCriterionContext();
	},

	createLayoutCriterions: function(bEdit) {

		this.oCriterionDetailView = sap.ui.view({
			viewName: "sap.ui.ino.views.backoffice.config.EvaluationModelCriterionDetail",
			type: sap.ui.core.mvc.ViewType.JS,
			viewData: {
				parentView: this,
				includeToolbar: true
			}
		});
		this.oCriterionDetailView.facetView = this;

		var oBinding = {
			path: this.getFormatterPath("Criterion", true),
			parameters: {
				arrayNames: ["children"]
			},
			sorter: [new sap.ui.model.Sorter("SEQUENCE_NO")]
		};

		this.oCriterionDetailView.setCriterionBinding(oBinding);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_MODEL_CRITERION_TIT"),
			content: [this.oCriterionDetailView, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	revalidateMessages: function() {
		this.oCriterionDetailView.revalidateMessages();
		// super call
		sap.ui.ino.views.common.FacetAOView.revalidateMessages.apply(this, arguments);
	}
}));