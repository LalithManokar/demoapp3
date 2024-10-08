/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.EvaluationModelModify";
	},

	createHeaderContent: function() {
		var oController = this.getController();
		this.removeAllHeaderGroups();

		/**
		 * Title Information
		 */

		var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					content: [new sap.ui.commons.TextView({
						text: this.getBoundPath("DEFAULT_TEXT", true),
						design: sap.ui.commons.TextViewDesign.Bold
					})],
					colSpan: 2
				})]
			})],
			widths: ["30%", "70%"]
		});

		/**
		 * Technical information
		 */
		var oTechnicalInformationContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_MODEL_FLD_CODE") + ":", new sap.ui.commons.TextView({
				text: this.getBoundPath("PLAIN_CODE", true)
			})), this.createRow(oController.getTextModel().getText("BO_MODEL_FLD_PACKAGE_ID") + ":", new sap.ui.commons.TextView({
				text: this.getBoundPath("PACKAGE_ID", true),
				wrapping: false,
				width: "140px"
			}))],
			widths: ["30%", "70%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_MODEL_TITLE_TIT"),
			content: oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_MODEL_TECHNICAL_INFO_TIT"),
			content: oTechnicalInformationContent
		}));

		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(this.getText("BO_MODEL_FLD_CREATED_AT") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_MODEL_FLD_CREATED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CREATED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_MODEL_FLD_CHANGED_AT") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_MODEL_FLD_CHANGED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CHANGED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["30%", "70%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_MODEL_ADMIN_DATA_TIT"),
			content: oAdminDataContent
		}));

		this.refreshHeaderGroups();
	},

	setThingInspectorConfiguration: function() {
		var oController = this.getController();

		/**
		 * Thing Inspector Settings
		 */
		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_MODEL_TIT");

		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("evaluation_method_48x48.png");
		this.sType = "ConfigEvaluationModel";
		this.sHelpContext = "BO_EVAL_MODEL";

		this.addFacet("sap.ui.ino.views.backoffice.config.EvaluationModelModifyDefinitionFacet", oController.getTextModel().getText(
			"BO_MODEL_DEFINITION_TIT"));
		this.addFacet("sap.ui.ino.views.backoffice.config.EvaluationModelModifyUsageFacet", oController.getTextModel().getText(
			"BO_MODEL_USAGE_TIT"));
		this.addFacet("sap.ui.ino.views.backoffice.config.EvaluationModelModifyPreviewFacet", oController.getTextModel().getText(
			"BO_MODEL_PREVIEW_TIT"));

		this.addStandardButtons({
			save: true,
			edit: true,
			cancel: true,
			del: true,
			close: false
		});
	},

	setFocus: function(oDialog) {
		oDialog.setInitialFocus(this.oCodeTextView);
	}
}));