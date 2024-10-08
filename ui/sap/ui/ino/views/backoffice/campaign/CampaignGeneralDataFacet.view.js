/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ExtensionPointHelper");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

jQuery.sap.require("sap.ui.ino.controls.MessageLog");
jQuery.sap.require("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");

jQuery.sap.require("sap.ui.ino.models.object.Campaign");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignGeneralDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignGeneralDataFacet";
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

		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createLanguageLayout(bEdit)]
		}));
		oLayout.addRow(oLanguageRow);

		this._oLanguageTemplate = this._createLanguageTemplateLayout(bEdit);

		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oLanguageTemplate]
		}));
		oLayout.addRow(oTemplateRow);

		var oAdminRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oAdminRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createAdminLayout(bEdit)]
		}));
		oLayout.addRow(oAdminRow);

		var oAnonymousRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oAnonymousRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createAnonymousField(bEdit)]
		}));
		oLayout.addRow(oAnonymousRow);

		var oVanityCodeRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createVanityCodeRowField(bEdit)]
		}));
		oLayout.addRow(oVanityCodeRow);

		var content = [new sap.ui.ux3.ThingGroup({
			content: oLayout,
			colspan: true
		})];

		var oExtensionContent = this._createExtensionGroup(bEdit);
		if (oExtensionContent) {
			content.push(oExtensionContent);
		}

		return content;
	},

	_createLanguageLayout: function(bEdit) {

		var oController = this.getController();
		var oView = this;
		var oModel = oController.getModel();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["30%", "20px", "70%"]
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
			Editable: bEdit,
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

		// 		this._oLanguageDropdown = new sap.ui.commons.ComboBox({
		// 			width: "75%",
		// 			visible: true,
		// 			editable: bEdit,
		// 			selectedKey: '',
		// 			ariaLabelledBy:oLanguageTextView,
		// 			change: function(oEvent) {
		// 				oController.onLanguageChange(oEvent);
		// 			},
		// 			liveChange: function(oEvent) {
		// 				oController.onLanguageChange(oEvent);
		// 			}
		// 		});
		// 		var oLanguageItem = new sap.ui.core.ListItem({
		//             key : "{CODE}",
		//             text : {
		//                 parts: [{path: "DEFAULT_TEXT"}, {path: "CODE"}],
		//                 formatter: function(sDefaultText, sCode) {
		//                     var sText = this.getText(sCode);
		//                     if (sText === sCode || sText === "") {
		//                         return sDefaultText;
		//                     }
		//                     return sText;
		//                 }
		//             }
		//         });

		//         this._oLanguageDropdown.bindItems({
		//             path : "/Locale",
		//             template : oLanguageItem,
		//             length: 1000
		//         });

		oModel.getDataInitializedPromise().done(function() {
			// 			oView._oLanguageDropdown.fireChange({
			// 				newValue: oView._oLanguageDropdown.getSelectedKey()
			// 			}); 
			oController._initialLanguageBinding();
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

	/*
    
    // WORKAROUND FOR RTE VALUE BINDING PROBLEM
    onModelInitialized : function() {
        if (this.getController().getModel() && this._oTemplateField) {
            this.initRichTextEditor(this._oTemplateField, "IDEA_DESCRIPTION_TEMPLATE", this.getController().getModel().getProperty("/IDEA_DESCRIPTION_TEMPLATE"));
        }        
    },
    
    */

	_createLanguageTemplateLayout: function(bEdit) {
		var oView = this;
		var oController = this.getController();
		var oModel = oController.getModel();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["30%", "20px", "70%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Title
		 */
		var oTitleTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_TITLE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTitleRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTitleLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTitleTextView]
		});

		var oTitleField;

		if (bEdit) {
			oTitleField = new sap.ui.commons.TextField({
				value: this.getBoundPath("NAME", false),
				width: '75%',
				required: true,
				maxLength: this.getBoundPath("/meta/nodes/LanguageTexts/attributes/NAME/maxLength"),
				liveChange: [this.getController().onLiveNameChange, this.getController()],
				ariaLabelledBy: oTitleTextView
			});
		} else {
			oTitleField = new sap.ui.commons.TextView({
				text: this.getBoundPath("NAME", false),
				ariaLabelledBy: oTitleTextView
			});
		}

		oTitleTextView.setLabelFor(oTitleField);

		var oTitle = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTitleField]
		});

		oTitleRow.addCell(oTitleLabel);
		oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTitleRow.addCell(oTitle);

		oLayout.addRow(oTitleRow);

		/*
		 * Short name
		 */
		var oShortNameTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_SHORTNAME"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oShortNameRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oShortNameLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oShortNameTextView]
		});

		var oShortNameField;

		if (bEdit) {
			oShortNameField = new sap.ui.commons.TextField({
				value: this.getBoundPath("SHORT_NAME", false),
				width: '75%',
				required: true,
				maxLength: this.getBoundPath("/meta/nodes/LanguageTexts/attributes/SHORT_NAME/maxLength"),
				liveChange: [this.getController().onLiveChange, this.getController()],
				ariaLabelledBy: oShortNameTextView
			});
		} else {
			oShortNameField = new sap.ui.commons.TextView({
				text: this.getBoundPath("SHORT_NAME", false),
				ariaLabelledBy: oShortNameTextView
			});
		}

		oShortNameTextView.setLabelFor(oShortNameField);

		var oShortName = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oShortNameField]
		});

		oShortNameRow.addCell(oShortNameLabel);
		oShortNameRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oShortNameRow.addCell(oShortName);

		oLayout.addRow(oShortNameRow);

		/*
		 * Description
		 */
		var oDescriptionTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_DESCRIPTION"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oDescriptionRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oDescriptionLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oDescriptionTextView]
		});

		var oDescriptionField = new sap.ui.commons.TextArea({
			rows: 10,
			width: "75%",
			value: this.getBoundPath("DESCRIPTION"),
			maxLength: this.getBoundPath("/meta/nodes/LanguageTexts/attributes/DESCRIPTION/maxLength"),
			enabled: bEdit,
			ariaLabelledBy: oDescriptionTextView
		}).addStyleClass("sapUiInoBackofficeTextAreaDisabled");

		oDescriptionTextView.setLabelFor(oDescriptionField);

		var oDescription = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oDescriptionField]
		});

		oDescriptionRow.addCell(oDescriptionLabel);
		oDescriptionRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oDescriptionRow.addCell(oDescription);

		oLayout.addRow(oDescriptionRow);

		/*
		 * Template
		 */
		var oTemplateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_TEMPLATE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTemplateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTemplateTextView]
		});

		var oTemplate = new sap.ui.commons.layout.MatrixLayoutCell();

		if (bEdit) {
			// delay for IE (otherwise the RTE behaves ugly or throws exceptions)
			var sAgent = window.navigator.userAgent;
			var bIsMSIE = sAgent.indexOf("MSIE ") > -1;

			setTimeout(function() {
				oView._oTemplateField = sap.ui.ino.application.ControlFactory.createRichTextEditor(undefined,
					"specialLanguageModel>/IDEA_DESCRIPTION_TEMPLATE", "350px", true, undefined, undefined, "CAMP_TEMP_DESC", false);

				// WORKAROUND FOR RTE VALUE BINDING PROBLEM
				oView._oTemplateField.attachChange(function() {
					var sValue = oView._oTemplateField.getValue();

					if (oController.getModel() && oController.getModel().getData() && jQuery.type(oController.getModel().getData().LanguageTexts) ===
						"array") {
						var aLang = oController.getModel().getData().LanguageTexts;
						for (var ii = 0; ii < aLang.length; ++ii) {
							if (aLang[ii].LANG === oView.getThingInspectorController()._sCurrentLanguage) {
								oController.getModel().setProperty("/LanguageTexts/" + ii + "/IDEA_DESCRIPTION_TEMPLATE", sValue);
								break;
							}
						}
					}
				}, this);

				oTemplate.addContent(oView._oTemplateField);

				oView._oTemplateField.attachBeforeEditorInit(function() {
					this._sFocusBeforeRTEInit = sap.ui.getCore().getCurrentFocusedControlId();
				}, this);

				oView._oTemplateField.attachReady(function() {
					if (this._sFocusBeforeRTEInit) {
						setTimeout(function() {
							sap.ui.getCore().getElementById(this._sFocusBeforeRTEInit).focus();
							this._sFocusBeforeRTEInit = null;
						}, 0);
					}
				}, this);

			}, bIsMSIE ? 500 : 0);
		} else {
			this._oTemplateField = new sap.ui.core.HTML({
				width: "75%",
				content: {
					path: this.getFormatterPath("IDEA_DESCRIPTION_TEMPLATE"),
					formatter: function(sTemplate) {
						// content is expected to be wrapped by proper HTML
						// we ensure this by adding the divs around it
						return "<div style='word-wrap: break-word;'>" + (sTemplate || "") + "</div>";
					}
				},
				sanitizeContent: true
			});

			oTemplate.addContent(this._oTemplateField);
		}

		oTemplate.addStyleClass("sapUiInoMltRichTextEditorCampaign");
		if (!bEdit) {
			oTemplate.addStyleClass("sapUIInoCampaignHTMLBox");
		} else {
			oTemplate.addStyleClass("sapUiInoRTEContainer");
		}

		oTemplateRow.addCell(oTemplateLabel);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(oTemplate);

		oLayout.addRow(oTemplateRow);

		/*
		 * Form Administration Idea Form
		 */
		var oCustomIdeaFormTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_FORM_ADMINISTRATION"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oCustomIdeaFormRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oCustomIdeaFormLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oCustomIdeaFormTextView]
		});

		this._oCustomIdeaFormDropdown = this.createDropDownBoxForCode({
			Path: "/FORM_CODE",
			CodeTable: "sap.ino.xs.object.ideaform.IdeaForm.Root",
			Editable: bEdit,
			Visible: true,
			Filters: new sap.ui.model.Filter({
				filters: [new sap.ui.model.Filter("IS_ADMIN_FORM", "NE", 1), new sap.ui.model.Filter("CODE", "EQ", "")],
				and: false
			}),
			// 			onChange: function(oEvent) {
			// 				oController.onCustomerIdeaFormChange(oEvent);
			// 			},
			// 			onLiveChange: function(oEvent) {
			// 				oController.onCustomerIdeaFormChange(oEvent);
			// 			},
			WithEmpty: true,
			LabelControl: oCustomIdeaFormTextView,
			Width: "75%"
		});

		var oCustomIdeaForm = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oCustomIdeaFormDropdown]
		});

		oCustomIdeaFormRow.addCell(oCustomIdeaFormLabel);
		oCustomIdeaFormRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oCustomIdeaFormRow.addCell(oCustomIdeaForm);
		oLayout.addRow(oCustomIdeaFormRow);
		/*
		 * Admin Form
		 */
		var oFormAdminTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_ADMIN_FORM"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oFormAdminRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oFormAdminLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oFormAdminTextView]
		});

		this._oFormAdminDropdown = this.createDropDownBoxForCode({
			Path: "/ADMIN_FORM_CODE",
			CodeTable: "sap.ino.xs.object.ideaform.IdeaForm.Root",
			Editable: bEdit,
			Visible: true,
			Filters: new sap.ui.model.Filter({
				filters: [new sap.ui.model.Filter("IS_ADMIN_FORM", "EQ", 1), new sap.ui.model.Filter("CODE", "EQ", "")],
				and: false
			}),
			// 			onChange: function(oEvent) {
			// 				oController.onFormAdminChange(oEvent);
			// 			},
			// 			onLiveChange: function(oEvent) {
			// 				oController.onFormAdminChange(oEvent);
			// 			},
			WithEmpty: true,
			LabelControl: oFormAdminTextView,
			Width: "75%"
		});

		var oFormAdmin = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oFormAdminDropdown]
		});

		oFormAdminRow.addCell(oFormAdminLabel);
		oFormAdminRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oFormAdminRow.addCell(oFormAdmin);
		oLayout.addRow(oFormAdminRow);
		/*
		 * Responsibility List
		 */
		var oResponsibilityListTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_RESPONSIBILITY_LIST"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oResponsibilityListLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oResponsibilityListTextView]
		});
		this._oResponsibilityListDropdown = this.createDropDownBoxForCode({
			Path: "/RESP_CODE",
			CodeTable: "sap.ino.xs.object.subresponsibility.ResponsibilityStage.Root",
			Editable: bEdit,
			Visible: true,
			ShowTechName: true,
			DisplaySecondaryValues: true,
			onChange: function(oEvent) {
				oController.onResponsibilityListChange(oEvent);
			},
			onLiveChange: function(oEvent) {
				oController.onResponsibilityListChange(oEvent);
			},
			WithEmpty: true,
			LabelControl: oResponsibilityListTextView
		});
		var bBtnCreateEdit = !bEdit ? false : (sap.ui.ino.application.Configuration.hasCurrentUserPrivilege(
			"sap.ino.xs.rest.admin.application::execute") || sap.ui.ino.application.Configuration.hasCurrentUserPrivilege(
			"sap.ino.ui::campaign_manager"));
		var oBtnCreateResponsiblity = new sap.ui.commons.Button({
			enabled: bBtnCreateEdit,
			visible: bEdit,
			text: "{i18n>BO_CAMPAIGN_FACET_ROLES_FLD_CREATE_RESPONSIBILITY}",
			press: function() {
				var selKey = oView._oResponsibilityListDropdown.getSelectedKey();
				var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModify");
				oModifyView.attachCloseOnce(function() {
					if (!sap.ui.ino.models.core.CodeModel.getProperty("/sap.ino.xs.object.subresponsibility.ResponsibilityStage.Root")) {
						sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.subresponsibility.ResponsibilityStage.Root", undefined, {
							includeEmptyCode: true
						});
						if (selKey) {
							oView._oResponsibilityListDropdown.setSelectedKey(selKey);
						}
					}
				});
				oModifyView.show(-1, "edit");
			}
		});
		var oRespLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["100%", "2px", "150px"],
			width: "75%"
		});
		var oRespLayoutRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRespLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: this._oResponsibilityListDropdown
		}));
		oRespLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRespLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: oBtnCreateResponsiblity,
			hAlign: sap.ui.commons.layout.HAlign.Right
		}));
		oRespLayout.addRow(oRespLayoutRow);
		var oResponsibilityList = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRespLayout]
		});
		var oResponsibilityListRow = new sap.ui.commons.layout.MatrixLayoutRow({
			//            colums:4,
			//            widths: ["24%", "3px","30%", "46%"]
		});

		oResponsibilityListRow.addCell(oResponsibilityListLabel);
		oResponsibilityListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oResponsibilityListRow.addCell(oResponsibilityList);
		oLayout.addRow(oResponsibilityListRow);

		/*
		 * Tags
		 */
		oLayout.addRow(this._createTagRow(bEdit));

		/*
		 *   Reward
		 */
		var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
		var oGamificationSetting = sap.ui.ino.application.Configuration.getBackendConfiguration().gamificationSetting;
		var isRewardActive = oSystemSetting.getProperty("/sap.ino.config.REWARD_ACTIVE") === "0" ? false : true;

		//var isRewardActive = sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.REWARD_ACTIVE") === "0" ? false : true;
		var oRewardCheckBoxTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_REWARD"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			visible: isRewardActive,
			width: "100%"
		});
		var oRewardCheckBoxRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oRewardCheckBoxLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRewardCheckBoxTextView]
		});

		var oRewardCheckBox;

		//Reward Check and Uncheck Popup Dialog CallBack functions
		var fnUncheckReward = function(bResult) {
			if (bResult) {
				oView.RewardUnitCodeText.setVisible(false);
				oView.RewardUnitCodeListDropdown.setVisible(false);
			} else {
				oController.getModel().oData.REWARD = 1;
				oRewardCheckBox.setChecked(true); //prevent the binding change
			}
		};

		var fnCheckReward = function(bResult) {
			if (bResult) {
				oView.RewardUnitCodeText.setVisible(true);
				oView.RewardUnitCodeListDropdown.setVisible(true);
			} else {
				oController.getModel().oData.REWARD = 0;
				oRewardCheckBox.setChecked(false); //prevent the binding change
			}
		};

		oRewardCheckBox = new sap.ui.commons.CheckBox({
			ariaLabelledBy: oRewardCheckBoxTextView,
			editable: {
				path: this.getFormatterPath("property/nodes/Root/attributes/REWARD/changeable", true),
				formatter: function(bChangeable) {
					return (bEdit && bChangeable);
				}
			},
			checked: {
				path: this.getFormatterPath("REWARD", true),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			visible: isRewardActive,
			change: function() {
				if (oController.getModel().oData.REWARD === 1) {
					if (oController.getModel().oData.IDEAS_NEED_CONTRIBUTION_SHARE) {
						sap.ui.ino.controls.MessageBox.confirm(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_INS_ENABLE_REWARD_CONFIRM"),
							fnCheckReward, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_ENABLE_REWARD_CONFIRM"));
					}
				} else {
					if (oController.getModel().oData.ID > 0) {
						sap.ui.ino.controls.MessageBox.confirm(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_INS_UNABLE_REWARD_CONFIRM"),
							fnUncheckReward, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_UNABLE_REWARD_CONFIRM"));
					}
				}
			}
		});

		oRewardCheckBoxTextView.setLabelFor(oRewardCheckBox);

		var oReward = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRewardCheckBox]
		});

		oRewardCheckBoxRow.addCell(oRewardCheckBoxLabel);
		oRewardCheckBoxRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRewardCheckBoxRow.addCell(oReward);

		oLayout.addRow(oRewardCheckBoxRow);

		/*
		 *   Reward Unit Code
		 */
		if (isRewardActive) {
			var oRewardUnitCodeTextView = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_UNIT_CODE"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				required: bEdit,
				visible: {
					path: this.getFormatterPath("REWARD", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			this.RewardUnitCodeText = oRewardUnitCodeTextView;

			var oRewardUnitCodeListRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oRewardUnitCodeListLabel = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oRewardUnitCodeTextView]
			});
			this._oRewardUnitCodeListDropdown = this.createDropDownBoxForCode({
				Path: "/REWARD_UNIT_CODE",
				CodeTable: "sap.ino.xs.object.basis.Unit.Root",
				Editable: {
					path: this.getFormatterPath("property/nodes/Root/attributes/REWARD_UNIT_CODE/changeable", true),
					formatter: function(bChangeable) {
						return (bEdit && bChangeable);
					}
				},
				Visible: {
					path: this.getFormatterPath("REWARD", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				onChange: function(oEvent) {
					oController.onRewardUnitCodeChange(oEvent);
				},
				onLiveChange: function(oEvent) {
					oController.onRewardUnitCodeChange(oEvent);
				},
				WithEmpty: true,
				LabelControl: oRewardUnitCodeTextView,
				Width: "23.5%"
			});
			this.RewardUnitCodeListDropdown = this._oRewardUnitCodeListDropdown;

			if (!oModel.getProperty("/REWARD_UNIT_CODE")) {
				var sSystemRewardUnitCode = oSystemSetting.getProperty("/sap.ino.config.REWARD_UNIT_CODE");
				this.RewardUnitCodeListDropdown.setSelectedKey(sSystemRewardUnitCode);
			}

			var oRewardUnitCodeList = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [this._oRewardUnitCodeListDropdown]
			});

			oRewardUnitCodeListRow.addCell(oRewardUnitCodeListLabel);
			oRewardUnitCodeListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRewardUnitCodeListRow.addCell(oRewardUnitCodeList);
			oLayout.addRow(oRewardUnitCodeListRow);
		}
		if (oGamificationSetting && oGamificationSetting.ENABLE_GAMIFICATION > 0) {
			/*
            gamification 
            */
			var oGamificationTextView = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_GAMIFICATION"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			});
			var oGamificationRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oGamificationLabel = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oGamificationTextView]
			});

			var oGamificationCheckbox = new sap.ui.commons.CheckBox({
				editable: {
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_GAMIFICATION_ACTIVE/changeable", true),
					formatter: function(bChangeable) {
						return (bEdit && bChangeable);
					}
				},
				checked: {
					path: this.getFormatterPath("IS_GAMIFICATION_ACTIVE", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				ariaLabelledBy: oGamificationTextView,
				tooltip: {
					parts: [{
						path: this.getFormatterPath("property/nodes/Root/attributes/IS_GAMIFICATION_ACTIVE/changeable", true)
                }, {
						path: this.getFormatterPath("property/nodes/Root/attributes/IS_GAMIFICATION_ACTIVE/messages", true)
                }],
					formatter: function(bChangeable, aMessages) {
						if (bEdit && bChangeable === false /* undefined is ok */ ) {
							if (aMessages && aMessages.length > 0) {
								var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
								return oMsg.getText(aMessages[0].messageKey);
							}
							return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
						} else {
							return undefined;
						}
					}
				}
			});

			oGamificationTextView.setLabelFor(oGamificationCheckbox);

			var oGamificationbox = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oGamificationCheckbox]
			});

			oGamificationRow.addCell(oGamificationLabel);
			oGamificationRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oGamificationRow.addCell(oGamificationbox);

			//oBlackboxLayout.addRow(oBlackboxRow);
			oLayout.addRow(oGamificationRow);

			var oGamificationCmbox = new sap.m.MultiComboBox({
				enabled: {
					path: this.getFormatterPath("IS_GAMIFICATION_ACTIVE", true),
					type: new sap.ui.ino.models.types.IntBooleanType(),
					formatter: function(bActive) {
						return (bEdit && bActive);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_GAMIFICATION_ACTIVE", true),
					type: new sap.ui.ino.models.types.IntBooleanType(),
					formatter: function(bActive) {
						return bActive;
					}
				},
				selectedKeys: this.getBoundPath("GAMIFICATION_DIMENSIONS", true),
				width: "60%"
			});
			var oItemTemplate = new sap.ui.core.ListItem({
				text: {
					path: "ALL_GAMIFICATION_DIMENSIONS>NAME"
				},
				key: {
					path: "ALL_GAMIFICATION_DIMENSIONS>ID"
				},
				tooltip: {
					path: "ALL_GAMIFICATION_DIMENSIONS>NAME"
				}
			});
			oGamificationCmbox.bindItems({
				path: "ALL_GAMIFICATION_DIMENSIONS>/",
				template: oItemTemplate
			});
			var oGamificationCmboxLabel = new sap.ui.commons.Label({
				visible: {
					path: this.getFormatterPath("IS_GAMIFICATION_ACTIVE", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				text: "{i18n>BO_CAMPAIGN_FACET_GENERAL_FLD_GAMIFICATION_DIMENSION}",
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%",
				tooltip: "{i18n>BO_CAMPAIGN_FACET_GENERAL_FLD_GAMIFICATION_DIMENSION}"
			});
			oGamificationCmboxLabel.setLabelFor(oGamificationCmbox);

			var oGamificationCmboxRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oGamificationCmboxLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oGamificationCmboxLabel]
			});
			var oGamificationCmboxCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oGamificationCmbox]
			});
			oGamificationCmboxRow.addCell(oGamificationCmboxLabelCell);
			oGamificationCmboxRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oGamificationCmboxRow.addCell(oGamificationCmboxCell);
			oLayout.addRow(oGamificationCmboxRow);
			/*
            gamification end
            */
		}
		return oLayout;
	},

	onclick: function(oEvent) {
		if (typeof this._oTemplateField.removeFocus === "function") {
			this._oTemplateField.removeFocus(oEvent);
		}
	},

	onkeyup: function(oEvent) {
		if (typeof this._oTemplateField.removeFocus === "function") {
			this._oTemplateField.removeFocus(oEvent);
		}
	},

	_createTagRow: function(bEdit) {
		var oController = this.getController();
		var oTagsLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_GENERAL_FLD_TAGS}",
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});

		var oTagLayout = new sap.ui.layout.VerticalLayout({
			width: "100%"
		});

		var oMessageLogTags = new sap.ui.ino.controls.MessageLog({
			messages: "{" + this.getThingInspectorView().MESSAGE_LOG_MODEL_NAME + ">/messages}",
			groups: ["TAG"]
		});

		oTagLayout.addContent(oMessageLogTags);
		var oTagRepeater = new sap.ui.ino.controls.Repeater();

		function fnRemoveTag(oEvent) {
			oController.onTagRemoved(oEvent);
		}
		var oTagTemplate = sap.ui.ino.application.backoffice.ControlFactory.createTagTemplate(oController.getModelName(), "TAG_ID", "NAME",
			bEdit, fnRemoveTag);

		//var oEditTagLayout = new sap.ui.commons.layout.HorizontalLayout();
		var oEditTagLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ["24%", "3px", "30%", "46%"]
		});

		if (bEdit) {
			var oAddTagTextField = new sap.ui.ino.controls.AutoComplete({
				placeholder: "{i18n>BO_CAMPAIGN_FACET_GENERAL_FLD_ADD_TAG}",
				maxLength: 50,
				maxPopupItems: 10,
				displaySecondaryValues: false,
				searchThreshold: 500,
				width: "100%",
				suggest: function(oEvent) {
					var sValue = oEvent.getParameter("suggestValue");
					var oListTemplate = new sap.ui.core.ListItem({
						text: "{NAME}",
						key: "{ID}"
					});
					oEvent.getSource().bindAggregation("items", {
						path: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"].createSearchPath(sValue),
						template: oListTemplate,
						length: 30,
						parameters: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"].parameters
					});
				}
			});
			var fnTagSapEnter = oAddTagTextField.onsapenter;
			oAddTagTextField.onsapenter = function() {
				fnTagSapEnter.apply(oAddTagTextField, []);
				oController.onTagAdded(oAddTagTextField);
			};

			oAddTagTextField.setFilterFunction(function(sValue, oItem) {
				var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1);
				var model = oController.getModel();
				var aTags = model.getProperty("/Tags");

				var fnFind = function(array, id) {
					return jQuery.grep(array, function(object, idx) {
						return object.TAG_ID === id;
					});
				};

				return bEquals && (fnFind(aTags, oItem.getKey()).length === 0);
			});

			var oAddTagButton = new sap.ui.commons.Button({
				text: "{i18n>BO_CAMPAIGN_FACET_GENERAL_BUT_ADD_TAG}",
				tooltip: "{i18n>BO_CAMPAIGN_FACET_GENERAL_EXP_ADD_TAG}",
				press: function() {
					oController.onTagAdded(oAddTagTextField);
				}
			});

			var oAddTagFromClipboardButton = new sap.ui.commons.Button({
				text: "{i18n>BO_COMMON_BUT_ADD_FROM_CLIPBOARD}",
				enabled: {
					path: "clipboard>/changed",
					formatter: function() {
						var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag);
						return !bEmpty;
					}
				}
			});
			oAddTagFromClipboardButton.attachPress(function() {
				oController.addTagsFromClipboard(oAddTagFromClipboardButton);
			});

			var oTagTextFieldCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: oAddTagTextField
			});
			var oTagTextBtnCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAddTagButton, oAddTagFromClipboardButton]
			});
			var oTagLayoutRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oTagLayoutRow.addCell(oTagTextFieldCell);
			oTagLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oTagLayoutRow.addCell(oTagTextBtnCell);
			oTagLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oEditTagLayout.addRow(oTagLayoutRow);

			oTagLayout.addContent(oEditTagLayout);
		}

		oTagRepeater.bindRows(this.getFormatterPath("Tags", true), oTagTemplate);
		oTagLayout.addContent(oTagRepeater);

		return new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oTagsLabel
				}), new sap.ui.commons.layout.MatrixLayoutCell()
            , new sap.ui.commons.layout.MatrixLayoutCell({
					content: oTagLayout
				})]
		});
	},

	_createDateRow: function(bEdit, sStartLabel, sEndLabel, sFrom, sTo, bRequired) {

		var oController = this.getController();

		//var oStartLayout = new sap.ui.commons.layout.MatrixLayout({
		//columns : 3,
		//widths : ["40%", "20px", "60%"]
		//});

		/*
		 * Start date
		 */
		var oStartDateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_" + sStartLabel),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		//var oStartDateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oStartDateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oStartDateTextView]
		});

		var oStartDateField = null;

		if (bEdit) {
			oStartDateField = new sap.ui.commons.DatePicker({
				value: {
					path: this.getFormatterPath(sFrom, true),
					type: new sap.ui.model.type.Date({
						style: "medium"
					})
				},
				width: '100%',
				ariaLabelledBy: oStartDateTextView,
				required: bRequired
			});

			oStartDateField.attachChange(function(oEvent) {
				if (oEvent.getParameter("invalidValue")) {
					oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
				} else {
					oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
					oController.synchronizeCampaignMilestone(oEvent);
					oController.changeMilestoneYears(oEvent);
				}
			});
		} else {
			oStartDateField = new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath(sFrom, true),
					type: null,
					formatter: sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTimeFormat
				},
				ariaLabelledBy: oStartDateTextView
			});
		}

		oStartDateTextView.setLabelFor(oStartDateField);

		var oStartDate = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oStartDateField]
		});

		// oStartDateRow.addCell(oStartDateLabel);
		// oStartDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		// oStartDateRow.addCell(oStartDate);

		// oStartLayout.addRow(oStartDateRow);

		// var oEndLayout = new sap.ui.commons.layout.MatrixLayout({
		//     columns : bEdit ? 4 : 3,
		//     widths : ["40%", "20px", "40%", "20%"]
		// });

		/*
		 * End date
		 */
		var oEndDateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_" + sEndLabel),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		//var oEndDateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oEndDateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEndDateTextView]
		});

		var oEndDateField = null;
		var oEndDateInfiniteCheckbox = null;
		var oEndDateInfiniteCheckboxCell = null;

		if (bEdit) {

			var oView = this;

			(function() {

				// we allow one day infinity tolerance to be on the safe side with timezone conversions
				var oDateInfinity = new Date("9999-12-30T00:00:00.000Z");
				var oDateInfinite = new Date("9999-12-31T00:00:00.000Z");

				var oClosureStartDateField = oStartDateField;

				oEndDateField = new sap.ui.commons.DatePicker({
					value: {
						path: oView.getFormatterPath(sTo, true),
						type: new sap.ui.model.type.Date({
							style: "medium"
						})
					},
					enabled: {
						path: oView.getFormatterPath(sTo, true),
						type: null,
						formatter: function(oDate) {
							if (oDate) {
								if (oDate >= oDateInfinity) {
									return false;
								}
							}
							return true;
						}
					},
					locale: oView.getThingInspectorController().getTextModel().sLocale,
					width: '100%',
					ariaLabelledBy: oEndDateTextView,
					required: bRequired
				});

				oEndDateField.attachChange(function(oEvent) {
					if (oEvent.getParameter("invalidValue")) {
						oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
					} else {
						oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
						oController.synchronizeCampaignMilestone(oEvent);
					}
				});

				var oEndDate = null;
				var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyyMMdd"
				});
				oEndDateInfiniteCheckbox = new sap.ui.commons.CheckBox({
					text: "{i18n>BO_CAMPAIGN_INSTANCE_FLD_INFINITE}",
					checked: {
						path: oView.getFormatterPath(sTo, true),
						type: null,
						formatter: function(oDate) {
							if (oDate) {
								if (oDate >= oDateInfinity) {
									return true;
								}
							}
							return false;
						},
						mode: sap.ui.model.BindingMode.OneWay
					},
					change: function(oEvent) {
						oEndDateField.setEnabled(!oEvent.getParameter("checked"));
						if (oEvent.getParameter("checked")) {
							oEndDate = oEndDateField.getBinding("value").getValue();
							oEndDateField.setYyyymmdd(oFormat.format(oDateInfinite));
						} else {
							if (!oEndDate) {
								var oStartDate = oClosureStartDateField.getBinding("value").getValue();
								if (oStartDate) {
									oEndDate = new Date(oStartDate.getTime());
									oEndDate.setFullYear(oEndDate.getFullYear() + 1);
									var oToday = new Date();
									if (oEndDate < oToday) {
										oEndDate = oToday;
									}
								}
							}
							oEndDateField.setYyyymmdd(oFormat.format(oEndDate));
						}
						oController.synchronizeCampaignMilestone(oEvent);
					}
				});
				oEndDateInfiniteCheckboxCell = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oEndDateInfiniteCheckbox]
				});
			})();

		} else {
			oEndDateField = new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath(sTo, true),
					type: null,
					formatter: sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTimeFormat
				},
				ariaLabelledBy: oEndDateTextView
			});
		}

		oEndDateTextView.setLabelFor(oEndDateField);

		var oEndDate = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEndDateField]
		});

		// oEndDateRow.addCell(oEndDateLabel);
		// oEndDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		// oEndDateRow.addCell(oEndDate);
		//if (oEndDateInfiniteCheckboxCell) {
		//oEndDateRow.addCell(oEndDateInfiniteCheckboxCell);
		//}

		//oEndLayout.addRow(oEndDateRow);

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oRow.addCell(oStartDateLabel);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oStartDate);
		oRow.addCell(oEndDateLabel);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oEndDate);
		if (oEndDateInfiniteCheckboxCell) {
			oRow.addCell(oEndDateInfiniteCheckboxCell);
		} else {
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		}
		// oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
		//     content : [new sap.ui.core.HTML({
		//         content : "<div/>"
		//     })]
		// }));

		return oRow;
	},

	_createAdminLayout: function(bEdit) {
		var oController = this.getController();

		var oValidRow = this._createDateRow(bEdit, "STARTDATE", "ENDDATE", "VALID_FROM", "VALID_TO", true);
		var oSubmitRow = this._createDateRow(bEdit, "SUBMIT_STARTDATE", "SUBMIT_ENDDATE", "SUBMIT_FROM", "SUBMIT_TO", false);
		var oRegisterRow = this._createDateRow(bEdit, "REGISTER_STARTDATE", "REGISTER_ENDDATE", "REGISTER_FROM", "REGISTER_TO", false);

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			//columns : 4,
			//widths : ["40%", "5%", "40%", "15%"]
			columns: 7,
			widths: ["30%", "20px", "20%", "15%", "20px", "20%", "15%"]
		});

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		oLayout.addRow(oValidRow);
		oLayout.addRow(oSubmitRow);
		oLayout.addRow(oRegisterRow);

		/*
		 * Registration Auto Approve
		 */
		var oAutoApproveTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_AUTOAPPROVE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oAutoApproveRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oAutoApproveLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAutoApproveTextView]
		});

		var oAutoApproveCheckbox = new sap.ui.commons.CheckBox({
			editable: {
				path: this.getFormatterPath("property/nodes/Root/attributes/IS_REGISTER_AUTO_APPROVE/changeable", true),
				formatter: function(bChangeable) {
					return (bEdit && bChangeable);
				}
			},
			checked: {
				path: this.getFormatterPath("IS_REGISTER_AUTO_APPROVE", true),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			ariaLabelledBy: oAutoApproveTextView,
			tooltip: {
				parts: [{
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_REGISTER_AUTO_APPROVE/changeable", true)
                }, {
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_REGISTER_AUTO_APPROVE/messages", true)
                }],
				formatter: function(bChangeable, aMessages) {
					if (bEdit && bChangeable === false /* undefined is ok */ ) {
						if (aMessages && aMessages.length > 0) {
							var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
							return oMsg.getText(aMessages[0].messageKey);
						}
						return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
					} else {
						return undefined;
					}
				}
			}
		});

		oAutoApproveTextView.setLabelFor(oAutoApproveCheckbox);

		var oAutoApprovebox = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAutoApproveCheckbox]
		});

		oAutoApproveRow.addCell(oAutoApproveLabel);
		oAutoApproveRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oAutoApproveRow.addCell(oAutoApprovebox);

		//oBlackboxLayout.addRow(oBlackboxRow);
		oLayout.addRow(oAutoApproveRow);

		/*
		 * Blackbox
		 */
		// var oBlackboxLayout = new sap.ui.commons.layout.MatrixLayout({
		//     columns : 3,
		//     widths : ["20%", "20px", "80%"]
		// });

		var oBlackBoxTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_BLACKBOX"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oBlackboxRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oBlackboxLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oBlackBoxTextView]
		});

		var oBlackboxCheckbox = new sap.ui.commons.CheckBox({
			editable: {
				path: this.getFormatterPath("property/nodes/Root/attributes/IS_BLACK_BOX/changeable", true),
				formatter: function(bChangeable) {
					return (bEdit && bChangeable);
				}
			},
			checked: {
				path: this.getFormatterPath("IS_BLACK_BOX", true),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			ariaLabelledBy: oBlackBoxTextView,
			tooltip: {
				parts: [{
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_BLACK_BOX/changeable", true)
                }, {
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_BLACK_BOX/messages", true)
                }],
				formatter: function(bChangeable, aMessages) {
					if (bEdit && bChangeable === false /* undefined is ok */ ) {
						if (aMessages && aMessages.length > 0) {
							var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
							return oMsg.getText(aMessages[0].messageKey);
						}
						return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
					} else {
						return undefined;
					}
				}
			}
		});

		oBlackBoxTextView.setLabelFor(oBlackboxCheckbox);

		var oBlackbox = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oBlackboxCheckbox]
		});

		oBlackboxRow.addCell(oBlackboxLabel);
		oBlackboxRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oBlackboxRow.addCell(oBlackbox);

		//oBlackboxLayout.addRow(oBlackboxRow);
		oLayout.addRow(oBlackboxRow);

		//Auto Assign Responsiblity Coach
		var oAutoAssignTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_ASSIGN_COACH"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oAutoAssignRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oAutoAssignLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAutoAssignTextView]
		});

		var oAutoAssignCheckbox = new sap.ui.commons.CheckBox({
			editable: bEdit ? {
				parts: [{
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_AUTO_ASSIGN_RL_COACH/changeable", true)
				}, {
					path: this.getFormatterPath("RESP_CODE", true)
					}],
				formatter: function(bChangeable, sRL) {
					return (bEdit && bChangeable && sRL);
				}
			} : false,
			checked: {
				path: this.getFormatterPath("IS_AUTO_ASSIGN_RL_COACH", true),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			ariaLabelledBy: oAutoAssignTextView,
			tooltip: {
				parts: [{
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_AUTO_ASSIGN_RL_COACH/changeable", true)
                }, {
					path: this.getFormatterPath("property/nodes/Root/attributes/IS_AUTO_ASSIGN_RL_COACH/messages", true)
                }],
				formatter: function(bChangeable, aMessages) {
					if (bEdit && bChangeable === false /* undefined is ok */ ) {
						if (aMessages && aMessages.length > 0) {
							var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
							return oMsg.getText(aMessages[0].messageKey);
						}
						return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
					} else {
						return undefined;
					}
				}
			}
		});

		oAutoAssignTextView.setLabelFor(oAutoAssignCheckbox);

		var oAutoAssign = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAutoAssignCheckbox]
		});

		oAutoAssignRow.addCell(oAutoAssignLabel);
		oAutoAssignRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oAutoAssignRow.addCell(oAutoAssign);

		//oBlackboxLayout.addRow(oBlackboxRow);
		oLayout.addRow(oAutoAssignRow);

		// 		var oRow2 = new sap.ui.commons.layout.MatrixLayoutRow();

		// 		// oRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
		// 		//     content : [oBlackboxLayout]
		// 		// }));
		// 		oRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		// 		oRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
		// 			content: [new sap.ui.core.HTML({
		// 				content: "<br/>",
		// 				sanitizeContent: true
		// 			})]
		// 		}));

		// 		// oRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
		// 		//     content : [new sap.ui.core.HTML({
		// 		//         content : "<br/>"
		// 		//     })]
		// 		// }));

		// 		oLayout.addRow(oRow2);

		return oLayout;
	},

	_createAnonymousField: function(bEdit) {
		var oController = this.getController();

		var systemSettingForAnoymousEnable = !!parseInt(sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.ANONYMOUS_ENABLE"));
		var systemSettingForAnoymousFully = !!parseInt(sap.ui.ino.application.Configuration.getSystemSetting(
			"sap.ino.config.ANONYMOUS_FOR_ENABLE_ALL"));
		var systemSettingForAnoymousPartially = !!parseInt(sap.ui.ino.application.Configuration.getSystemSetting(
			"sap.ino.config.ANONYMOUS_FOR_ENABLE_PARTLY"));
		var systemSettingForAnoymousPartiallyOptions = systemSettingForAnoymousPartially && sap.ui.ino.application.Configuration.getSystemSetting(
			"sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION") ? sap.ui.ino.application.Configuration.getSystemSetting(
			"sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION").split(",") : [];

		if (systemSettingForAnoymousEnable) {
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				//columns : 4,
				//widths : ["40%", "5%", "40%", "15%"]
				columns: 12,
				widths: ["30%", "20px", "6%", "15%", "1%", "6%", "15%", "1%", "6%", "15%", "1%", "6%"]
			});

			// 		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			// 			height: "20px"
			// 		}));
			//open Anonymous function for idea
			var oAnonymousTextView = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			});
			var oAnonymousRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oAnonymousRow2 = new sap.ui.commons.layout.MatrixLayoutRow();
			var oAnonymousRow3 = new sap.ui.commons.layout.MatrixLayoutRow();
			var oAnonymousRow4 = new sap.ui.commons.layout.MatrixLayoutRow();
			var oAnonymousLabel = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextView]
			});

			var oAnonymousCheckbox = new sap.ui.commons.CheckBox({
				editable: bEdit,
				checked: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				ariaLabelledBy: oAnonymousTextView
			});

			oAnonymousTextView.setLabelFor(oAnonymousCheckbox);

			var oAnonymousAssign = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckbox]
			});
			//anonymous text
			var oAnonymousTextNone = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_NOT"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_NOT"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelNone = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextNone]
			});
			var oAnonymousCheckboxNone = new sap.ui.commons.CheckBox({
				editable: bEdit,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "NOT_ANONYMOUS"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "NOT_ANONYMOUS") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						// var bchecked;
						for (var o in val) {
							if (val[o].CODE === "NOT_ANONYMOUS") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextNone.setLabelFor(oAnonymousCheckboxNone);
			var oAnonymousAssignNone = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxNone]
			});
			//anonymous text
			var oAnonymousTextAll = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_FULLY"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_FULLY"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelAll = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextAll]
			});
			var oAnonymousCheckboxAll = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousFully,
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "ANONYMOUS_FOR_ALL"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "ANONYMOUS_FOR_ALL") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "ANONYMOUS_FOR_ALL") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextAll.setLabelFor(oAnonymousCheckboxAll);
			var oAnonymousAssignAll = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxAll]
			});
			//anonymous text
			var oAnonymousTextPart = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPart = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPart]
			});
			var oAnonymousCheckboxPart = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartially,
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "NOT_ANONYMOUS_CAMPAIGN_MANAGER"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "NOT_ANONYMOUS_CAMPAIGN_MANAGER") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "NOT_ANONYMOUS_CAMPAIGN_MANAGER") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPart.setLabelFor(oAnonymousCheckboxPart);
			var oAnonymousAssignPart = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPart]
			});
			//anonymous text
			var oAnonymousTextPartVisibleToCoach = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToCoach = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToCoach]
			});
			var oAnonymousCheckboxPartVisibleToCoach = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_COACH"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_COACH"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_COACH") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_COACH") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToCoach.setLabelFor(oAnonymousCheckboxPartVisibleToCoach);
			var oAnonymousAssignPartVisibleToCoach = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToCoach]
			});
			//anonymous text
			var oAnonymousTextPartVisibleToExpert = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_EXPERT"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_EXPERT"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToExpert = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToExpert]
			});
			var oAnonymousCheckboxPartVisibleToExpert = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_EXPERT"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_EXPERT"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_EXPERT") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_EXPERT") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToExpert.setLabelFor(oAnonymousCheckboxPartVisibleToExpert);
			var oAnonymousAssignPartVisibleToExpert = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToExpert]
			});
			//anonymous text
			var oAnonymousTextPartVisibleToParticipant = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_PARTICIPANT"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_PARTICIPANT"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToParticipant = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToParticipant]
			});
			var oAnonymousCheckboxPartVisibleToParticipant = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_PARTICIPANT"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_PARTICIPANT"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_PARTICIPANT") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_PARTICIPANT") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToParticipant.setLabelFor(oAnonymousCheckboxPartVisibleToParticipant);
			var oAnonymousAssignPartVisibleToParticipant = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToParticipant]
			});
			//anonymous text
			var oAnonymousTextPartVisibleToCoachAndExpert = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_AND_EXPERT"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_AND_EXPERT"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToCoachAndExpert = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToCoachAndExpert]
			});
			var oAnonymousCheckboxPartVisibleToCoachAndExpert = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_COACH_AND_EXPERT"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_COACH_AND_EXPERT"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_COACH_AND_EXPERT") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_COACH_AND_EXPERT") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToCoachAndExpert.setLabelFor(oAnonymousCheckboxPartVisibleToCoachAndExpert);
			var oAnonymousAssignPartVisibleToCoachAndExpert = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToCoachAndExpert]
			});

			//anonymous text
			var oAnonymousTextPartVisibleToCoachPool = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_POOL"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_POOL"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToCoachPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToCoachPool]
			});
			var oAnonymousCheckboxPartVisibleToCoachPool = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_COACH_POOL"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_COACH_POOL"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_COACH_POOL") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_COACH_POOL") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToCoachPool.setLabelFor(oAnonymousCheckboxPartVisibleToCoachPool);
			var oAnonymousAssignPartVisibleToCoachPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToCoachPool]
			});

			//anonymous text
			var oAnonymousTextPartVisibleToExpertPool = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_EXPERT_POOL"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_EXPERT_POOL"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToExpertPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToExpertPool]
			});
			var oAnonymousCheckboxPartVisibleToExpertPool = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_EXPERT_POOL"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_EXPERT_POOL"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_EXPERT_POOL") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_EXPERT_POOL") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToExpertPool.setLabelFor(oAnonymousCheckboxPartVisibleToExpertPool);
			var oAnonymousAssignPartVisibleToExpertPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToExpertPool]
			});

			//anonymous text
			var oAnonymousTextPartVisibleToCoachPoolAndExpertPool = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_POOL_AND_EXPERT_POOL"),
				tooltip: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_OPEN_ANONYMOUS_TEXT_PARTLY_COACH_POOL_AND_EXPERT_POOL"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				width: "100%"
			});
			var oAnonymousTextLabelPartVisibleToCoachPoolAndExpertPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousTextPartVisibleToCoachPoolAndExpertPool]
			});
			var oAnonymousCheckboxPartVisibleToCoachPoolAndExpertPool = new sap.ui.commons.CheckBox({
				editable: bEdit && systemSettingForAnoymousPartiallyOptions.includes("VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL"),
				change: function(oEvent) {
					var oModel = oController.getModel();
					var aAnonymousText = oModel.getProperty("/AnonymousText");
					if (oEvent.getSource().getChecked()) {
						var oAnonymousText = {
							"ID": -1,
							"CODE": "VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL"
						};
						aAnonymousText.push(oAnonymousText);
					} else {
						var intDelIndex;
						jQuery.each(aAnonymousText, function(index, obj) {
							if (obj.CODE === "VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL") {
								intDelIndex = index;
							}
						});
						aAnonymousText.splice(intDelIndex, 1);
					}
				},
				visible: {
					path: this.getFormatterPath("IS_OPEN_ANONYMOUS_FUNCTION", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				checked: {
					path: this.getFormatterPath("AnonymousText", true),
					formatter: function(val) {
						for (var o in val) {
							if (val[o].CODE === "VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL") {

								return true;
							}
						}
					},
					type: null
				}
			});
			oAnonymousTextPartVisibleToCoachPoolAndExpertPool.setLabelFor(oAnonymousCheckboxPartVisibleToCoachPoolAndExpertPool);
			var oAnonymousAssignPartVisibleToCoachPoolAndExpertPool = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAnonymousCheckboxPartVisibleToCoachPoolAndExpertPool]
			});

			oAnonymousRow.addCell(oAnonymousLabel);
			oAnonymousRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow.addCell(oAnonymousAssign);

			oAnonymousRow.addCell(oAnonymousTextLabelNone);
			oAnonymousRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow.addCell(oAnonymousAssignNone);

			oAnonymousRow.addCell(oAnonymousTextLabelAll);
			oAnonymousRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow.addCell(oAnonymousAssignAll);

			oAnonymousRow.addCell(oAnonymousTextLabelPart);
			oAnonymousRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow.addCell(oAnonymousAssignPart);

			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

			oAnonymousRow2.addCell(oAnonymousTextLabelPartVisibleToCoach);
			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow2.addCell(oAnonymousAssignPartVisibleToCoach);

			oAnonymousRow2.addCell(oAnonymousTextLabelPartVisibleToExpert);
			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow2.addCell(oAnonymousAssignPartVisibleToExpert);

			oAnonymousRow2.addCell(oAnonymousTextLabelPartVisibleToCoachAndExpert);
			oAnonymousRow2.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow2.addCell(oAnonymousAssignPartVisibleToCoachAndExpert);

			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

			oAnonymousRow3.addCell(oAnonymousTextLabelPartVisibleToCoachPool);
			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow3.addCell(oAnonymousAssignPartVisibleToCoachPool);

			oAnonymousRow3.addCell(oAnonymousTextLabelPartVisibleToExpertPool);
			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow3.addCell(oAnonymousAssignPartVisibleToExpertPool);

			oAnonymousRow3.addCell(oAnonymousTextLabelPartVisibleToParticipant);
			oAnonymousRow3.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow3.addCell(oAnonymousAssignPartVisibleToParticipant);

			oAnonymousRow4.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow4.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow4.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

			oAnonymousRow4.addCell(oAnonymousTextLabelPartVisibleToCoachPoolAndExpertPool);
			oAnonymousRow4.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAnonymousRow4.addCell(oAnonymousAssignPartVisibleToCoachPoolAndExpertPool);

			//oBlackboxLayout.addRow(oBlackboxRow);
			oLayout.addRow(oAnonymousRow);
			oLayout.addRow(oAnonymousRow2);
			oLayout.addRow(oAnonymousRow3);
			oLayout.addRow(oAnonymousRow4);
			return oLayout;
		}
	},

	_createVanityCodeRowField: function(bEdit) {
		var oController = this.getController();
		var oVanityCodeTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_VANITY_CODE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["30%", "20px", "70%"]
		});
		var oVanityCodeRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oVanityCodeField;
		if (bEdit) {
			oVanityCodeField = new sap.ui.commons.TextField({
				value: this.getBoundPath("VANITY_CODE", true),
				width: '50%',
				maxLength: this.getBoundPath("/meta/nodes/LanguageTexts/attributes/VANITY_CODE/maxLength"),
				liveChange: [oController.onLiveChange, oController],
				ariaLabelledBy: oVanityCodeTextView
			});
		} else {
			oVanityCodeField = new sap.ui.commons.TextView({
				text: this.getBoundPath("VANITY_CODE", true),
				ariaLabelledBy: oVanityCodeTextView
			});
		}
		oVanityCodeTextView.setLabelFor(oVanityCodeField);
		oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVanityCodeTextView]
		}));
		oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVanityCodeField]
		}));

		oLayout.addRow(oVanityCodeRow);
		return oLayout;
	},

	getLanguageDropdown: function() {
		return this._oLanguageDropdown;
	},

	_createExtensionGroup: function(bEdit) {
		// EXTENSION POINT
		var sExtensionPointFragment = !bEdit ? "sap.ui.ino.views.backoffice.extension.CampaignDetailFacetExtension" :
			"sap.ui.ino.views.backoffice.extension.CampaignDetailEditFacetExtension";
		var oThingGroup = sap.ui.ino.views.common.ExtensionPointHelper.getFacetExtensionThingGroup(sap.ui.xmlfragment(sExtensionPointFragment,
			this.getController()));
		if (oThingGroup) {
			oThingGroup.bindProperty("title", "i18n>BO_CAMPAIGN_GENERAL_EXTENSION");
			oThingGroup.setColspan(true);
			return oThingGroup;
		}
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	}

}));