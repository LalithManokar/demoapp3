/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.controls.IFrame");

jQuery.sap.require("sap.ui.ino.models.object.Campaign");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignMailTemplateFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignMailTemplateFacet";
	},

	onHide: function() {
		var oController = this.getController();
		if (this.getThingInspectorController().getModel()) {
			this.getThingInspectorController().getModel().detachRequestCompleted(oController._initialLanguageBinding, oController);
		}
		var oEvtBus = sap.ui.getCore().getEventBus();
		oEvtBus.unsubscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
	},

	onShow: function() {
		var oController = this.getController();
		oController._initialTemplateBinding();
		oController._initialLanguageBinding();
		this.revalidateMessages();
		var oEvtBus = sap.ui.getCore().getEventBus();
		oEvtBus.unsubscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
		oEvtBus.subscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
	},

	createFacetContent: function() {
		var oController = this.getController();
		var bEdit = oController.isInEditMode();

		var oLayout = new sap.ui.commons.layout.MatrixLayout();

		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createTemplateLayout(bEdit, "notification.MailTemplate", "MAIL_TEMPLATE", oController.onTemplateChange)]
		}));
		oLayout.addRow(oTemplateRow);

		var oSuccessTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oSuccessTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createTemplateLayout(bEdit, "basis.TextModule", "MAIL_SUCCESS", oController.onTextChange)]
		}));
		oLayout.addRow(oSuccessTextRow);

		var oRejectionTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRejectionTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createTemplateLayout(bEdit, "basis.TextModule", "MAIL_REJECTION", oController.onTextChange)]
		}));
		oLayout.addRow(oRejectionTextRow);

		var oDecisionTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oDecisionTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createTemplateLayout(bEdit, "basis.TextModule", "MAIL_PHASE_CHANGE", oController.onTextChange)]
		}));
		oLayout.addRow(oDecisionTextRow);

		var oNotificationTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oNotificationTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createTemplateLayout(bEdit, "basis.TextModule", "MAIL_NOTIFICATION_SUMMARY", oController.onTextChange)]
		}));
		oLayout.addRow(oNotificationTextRow);

		var oPreviewLayout = new sap.ui.commons.layout.MatrixLayout();

		this._oLanguageTemplate = this._createLanguageLayout(bEdit);
		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oLanguageTemplate]
		}));
		oPreviewLayout.addRow(oLanguageRow);

		var oPreviewRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oPreviewRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createPreviewLayout(bEdit)]
		}));
		oPreviewLayout.addRow(oPreviewRow);

		var content = [new sap.ui.ux3.ThingGroup({
			content: oLayout,
			colspan: true
		}), new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_CAMPAIGN_FACET_MAIL_TEMPLATE_FLD_TEMPLATE}",
			content: oPreviewLayout,
			colspan: true
		})];

		return content;
	},

	_createTemplateLayout: function(bEdit, sTemplateType, sTemplateTypeCode, fnChange) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		var oTemplateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_MAIL_TEMPLATE_FLD_" + sTemplateTypeCode),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTemplateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTemplateTextView]
		});

		this._oTemplateDropdown = this.createDropDownBoxForCode({
			Path: this.getFormatterPath(sTemplateTypeCode + "_CODE", true),
			CodeTable: "sap.ino.xs.object." + sTemplateType + ".Root",
			Editable: bEdit,
			Visible: true,
			onChange: function(oEvent) {
				if (fnChange !== undefined) {
					fnChange.call(oController, oEvent);
				}
			},
			/*
            onLiveChange : function(oEvent) {
                fnChange.apply(oController, [oEvent]);
            },*/
			WithEmpty: true,
			LabelControl: oTemplateTextView,
			Width: "75%"
		});

		var oTemplate = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oTemplateDropdown]
		});

		oTemplateRow.addCell(oTemplateLabel);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(oTemplate);
		oLayout.addRow(oTemplateRow);

		return oLayout;
	},

	_createLanguageLayout: function(bEdit) {
		var oController = this.getController();
		var oView = this;
		var oModel = oController.getModel();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Language
		 */
		var oLanguageTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_LANGUAGE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLanguageLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLanguageTextView]
		});

		this._oLanguageDropdown = this.createDropDownBoxForCode({
			Path: "",
			CodeTable: "sap.ino.xs.object.basis.Language.Root",
			Editable: true,
			Visible: true,
			onChange: function(oEvent) {
				oController.onLanguageChange(oEvent);
			},
			onLiveChange: function(oEvent) {
				oController.onLanguageChange(oEvent);
			},
			WithEmpty: false,
			LabelControl: oLanguageTextView,
			Width: "75%"
		});

		oModel.getDataInitializedPromise().done(function() {
			oView._oLanguageDropdown.fireChange({
				newValue: oView._oLanguageDropdown.getSelectedKey()
			});
		});

		var oLanguage = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oLanguageDropdown]
		});

		oLanguageRow.addCell(oLanguageLabel);
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oLanguageRow.addCell(oLanguage);
		oLayout.addRow(oLanguageRow);

		return oLayout;
	},

	_createPreviewLayout: function() {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ["20%", "20px", "60%", "20%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		var oTemplateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_MAIL_TEMPLATE_FLD_TEMPLATE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTemplateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTemplateTextView],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});

		this._oTemplateField = new sap.ui.ino.controls.IFrame({
			height: "450px"
		});

		oTemplateTextView.setLabelFor(this._oTemplateField);

		var oTemplate = new sap.ui.commons.layout.MatrixLayoutCell({
			height: "450px",
			content: [this._oTemplateField]
		});

		oTemplateRow.addCell(oTemplateLabel);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(oTemplate);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		oLayout.addRow(oTemplateRow);

		return oLayout;
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	getLanguageDropdown: function() {
		return this._oLanguageDropdown;
	}
}));