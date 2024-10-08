/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.settings.SystemSettings", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {
    aSpecialLabels: ["sap.ino.config.DISABLE_GOOGLE_TRANSLATION_TIP"
        , "sap.ino.config.OPEN_MASK_USER_NAME_COMM_USER"
        , "sap.ino.config.PEOPLE_MENU_FOR_ALL_ACTIVE"
        , "sap.ino.config.ENABLE_RETENTION_PERIOD"],
        
	init: function() {
		this.initMessageSupportView();
	},

	exit: function() {
		this.exitMessageSupportView();
		sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
	},

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.settings.SystemSettings";
	},

	hasPendingChanges: function() {
		return this.getController().hasPendingChanges();
	},

	createContent: function() {
		var oController = this.getController();
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			widths: ["100%"]
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		this.oSaveButton = new sap.ui.commons.Button({
			id: this.createId("BUT_SAVE"),
			text: "{i18n>BO_LOCAL_SYSTEM_SETTING_BUT_SAVE}",
			press: [oController.onSavePressed, oController],
			lite: false,
			enabled: false
		});

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.oSaveButton]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		// ==== old layout ==============
		// oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		// this.oRepeaterLayout = new sap.ui.commons.layout.MatrixLayout({
		//     columns : 4,
		//     widths : ["40%", "40%", "20%"]
		// });

		// this.bindRows();
		// oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		//     content : [this.oRepeaterLayout]
		// });
		// oRow.addCell(oCell);
		// oLayout.addRow(oRow);
		// ==== old layout ==============

		// ==== new layout ==============
		this.createLayout(oLayout);

		this.createRows();
		// ==== new layout ==============

		return oLayout;
	},

	createLayout: function(oLayout) {
		this.groups = [{
			GROUP_ID: 1,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_SHELL_BAR_BACKGROUND}"
        }, {
			GROUP_ID: 2,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_LANGUAGE_TERM}"
        }, {
			GROUP_ID: 3,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_USAGE_EXPERT_FINDER}"
        }, {
			GROUP_ID: 4,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_FILE_SIZE_REWARDS}"
        }, {
			GROUP_ID: 5,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_EVALUATION_REQUEST}"
        }, {
			GROUP_ID: 6,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_IDEA_LIST_IDEA}"
        }, {
			GROUP_ID: 7,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_NOTIFICATION}"
        }, {
			GROUP_ID: 8,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_ANONYMOUS_CONFIG}"
        }, {
			GROUP_ID: 99,
			TITLE: "{i18n>BO_LOCAL_SYSTEM_SETTING_TIT_OTHERS}"
        }];
		var oRow, oCell;
		this.groups.forEach(function(o) {
			oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oPanel = new sap.m.Panel({
				backgroundDesign: "Transparent",
				headerToolbar: new sap.m.OverflowToolbar({
					content: [new sap.m.Title({
						text: o.TITLE
					})]
				}),
				content: [new sap.ui.commons.layout.MatrixLayout({
					columns: 4,
					widths: ["30%", "40%", "30%"]
				})]
			});
			o.PANEL = oPanel;
			oCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPanel]
			});
			oRow.addCell(oCell);
			oLayout.addRow(oRow);
		});
	},

	refreshRows: function() {
		this.groups.forEach(function(o) {
			o.PANEL.getContent()[0].removeAllRows();
		});
		this.createRows();
	},

	createRows: function() {
		var oView = this;
		var oController = this.getController();
		var oSorter = new sap.ui.model.Sorter("GROUP_ID,GROUP_ORDER", false);
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		this.oSystemSettings = {};

		sap.ui.getCore().getModel().read("/LocalSystemSetting", {
			sorters: [oSorter],
			success: function(oData) {
				var oSettingModel = new sap.ui.model.json.JSONModel(oData.results);
				oView.setModel(oSettingModel);
				var oRepeaterLayout;
				oData.results.forEach(function(oSetting, iIndex) {
					var oContext;
					var oGroup = oView.groups.filter(function(o) {
						return o.GROUP_ID === oSetting.GROUP_ID;
					})[0];
					if (!oGroup) {
						return;
					}
					oRepeaterLayout = oGroup.PANEL.getContent()[0];

					oContext = new sap.ui.model.Context(oSettingModel, "/" + iIndex);
					var sControlWidth = "200px";
					var oTypeDescr = {
						bindingRef: "VALUE",
						editable: true,
						dataType: oContext.getProperty("DATATYPE_CODE"),
						width: sControlWidth
					};

					if (oContext.getProperty("DATATYPE_CODE") === "BLOB") {
						oTypeDescr.blob = {};
						oTypeDescr.blob.oStyle = sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue;
						oTypeDescr.blob.bMultiple = false;
						oTypeDescr.blob.sAccept = "image/*";

						oTypeDescr.blob.oAttachmentId = {
							path: "VALUE",
							formatter: function(sValue) {
								if (sValue && jQuery.isNumeric(sValue)) {
									return parseInt(sValue, 10);
								}
								return undefined;
							}
						};
						var sMessageGroupName;
						var sTooltipBindingPath;

						if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_BACKGROUND_IMAGE") {
							sMessageGroupName = "backgroundimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_BACKGROUND_IMAGE_CAMPAIGN}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						} else if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_LOGO_IMAGE") {
							sMessageGroupName = "logoimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_LOGO_IMAGE}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						} else if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_MOBILE_SMALL_DEFAULT_BACKGROUND_IMAGE") {
							sMessageGroupName = "backgroundimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_MOBILE_SMALL_BACKGROUND_IMAGE}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						}


						oTypeDescr.blob.oUploadTooltip = sTooltipBindingPath;

						oTypeDescr.blob.fUploadSuccessful = function(evt) {
							oController.updateValue(oContext.getObject(), evt.getParameters().attachmentId);
							oApp.removeNotificationMessages(sMessageGroupName);
						};
						oTypeDescr.blob.fUploadFailed = function(evt) {
							oApp.removeNotificationMessages(sMessageGroupName);
							for (var i = 0; i < evt.getParameters().messages.length; i++) {
								var msg_raw = evt.getParameters().messages[i];
								var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, sMessageGroupName);
								oApp.addNotificationMessage(msg);
							}
						};
						oTypeDescr.blob.fClearSuccessful = function() {
							var oLocalSystemSetting = oContext.getObject();
							oController.updateValue(oLocalSystemSetting, oLocalSystemSetting.DEFAULT_VALUE);
							oApp.removeNotificationMessages(sMessageGroupName);
						};
						oTypeDescr.blob.fClearFailed = function(evt) {
							oApp.removeNotificationMessages(sMessageGroupName);
							for (var i = 0; i < evt.getParameters().messages.length; i++) {
								var msg_raw = evt.getParameters().messages[i];
								var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, sMessageGroupName);
								oApp.addNotificationMessage(msg);
							}
						};
					}
						if(oContext.getProperty("CODE") === "sap.ino.config.RETENTION_PERIOD_VALUE"){
						    oTypeDescr.required = true;
						}
					oView.oSystemSettings[oContext.getProperty("CODE")] = oContext.getProperty("VALUE");

					var oControl, oSettings, oRefControl;
					if (oContext.getProperty("DATATYPE_CODE") === "CODE") {
						if (oContext.getProperty("CODE") === "sap.ino.config.RETENTION_PERIOD_UNIT") {

							oSettings = {
								Path: "VALUE",
								Editable: true,
								Visible: true,
								WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
								Width: sControlWidth,
								View: oView
							};
							oControl = sap.ui.ino.views.common.GenericControl.createDropDownBox(oSettings);
						} else {
							oSettings = {
								Path: "VALUE",
								CodeTable: oContext.getProperty("CODE_TABLE"),
								Editable: true,
								Visible: true,
								WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
								Width: sControlWidth,
								View: oView
							};

							oControl = sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
						}
					} else if (oContext.getProperty("DATATYPE_CODE") === "TOKEN") {
						oSettings = {
							SelKeys: oContext.getProperty("VALUE") ? oContext.getProperty("VALUE").split(",") : [],
							Editable: true,
							Visible: true,
							WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
							Width: sControlWidth,
							View: oView
						};

						oControl = sap.ui.ino.views.common.GenericControl.createMultiComboBox(oSettings, oContext.getProperty("CODE"));

						oRefControl = sap.ui.ino.views.common.GenericControl.createTokenizer({
							MultiComboBox: oControl,
							View: oView
						});

						oControl.data("relControl", oRefControl);

						oControl.attachSelectionChange(
							sap.ui.ino.views.common.GenericControl._handleIdeaFiltersSelChange.bind(null, oRefControl));
					} else {
						oControl = sap.ui.ino.views.common.ControlFactory.getControlForType("VALUE", oTypeDescr);
					}

					if (oControl.attachLiveChange) {
						oControl.attachLiveChange(oController.onValueChanged, oController);
					}
					if (oControl.attachChange) {
						oControl.attachChange(oController.onValueChanged, oController);
					}
					if (oControl.attachSelectionFinish) {
						oControl.attachSelectionFinish(oController.onValueChanged, oController);
					}

					var oLabel = new sap.ui.commons.Label({
						text: {
							path: "CODE",
							formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.basis.SystemSetting.Root")
						},
						design: sap.ui.commons.LabelDesign.Bold,
						textAlign: sap.ui.core.TextAlign.Right,
						width: "100%"
					});
					if(oView.aSpecialLabels.indexOf(oContext.getProperty("CODE")) > -1){
					    oLabel.addStyleClass("sapUiInoSettingsBlueLabel");
					}
					oLabel.setLabelFor(oControl);
					oLabel.setLabelFor(oControl);

					var oButton = new sap.ui.commons.Button({
						text: "{i18n>BO_LOCAL_SYSTEM_SETTING_BUT_RESET}",
						press: [oController.onSetDefaultValue, oController],
						lite: false,
						enabled: {
							parts: [{
								path: "VALUE"
							}, {
								path: "DEFAULT_VALUE"
							}],
							// 	formatter : function(oValue, oDefaultValue) {
							// 	    oValue += "";
							// 		return !!oDefaultValue && oValue !== oDefaultValue;
							// 	}
							formatter: oController.resetButtonEnable.bind(oController)
						}
					});
					oController.mapButtonToInput(oButton.getId(), oControl);
					oController.mapCodeToButton(oContext.getObject().CODE, oButton);

					var aControls = [oControl];
					if (oRefControl) {
						aControls.push(oRefControl);
					}

					if (oContext.getProperty("CODE") === "sap.ino.config.SWA_ACTIVE") {
						oView._oEnableTrackUsage = oControl;
						oControl.attachChange(oController.handleEnableTrackUsage, oController);
					}
					// add notes for notification template related settings
					var oNoteText;
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_NEW_NOTIFICATION") {
						oNoteText = new sap.ui.commons.TextView({
							text: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
							tooltip: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
							width: "100%"
						});
						aControls.push(oNoteText);
						oView._oEnableNewNotification = oControl;
						oControl.attachChange(oController.handleEnableNewNotificationChange, oController);
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_DELETE_INTEGRATION_HISTORY") {
						oView._oEnableIntegrationDeletion = oControl;
						oControl.attachChange(oController.handleEnableIntegrationDeletion, oController);
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_DELETE_NOTIFICATION_HIS") {
						oView._oEnableNotificationDeletion = oControl;
						oControl.attachChange(oController.handleEnableNotificationDeletion, oController);
					}

					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_IDEA_COMPANY_VIEW") {
						oView._oEnableIdeaCompanyViewCheckbox = oControl;
						oControl.attachChange(oController.handleEnableIdeaCompanyView, oController);
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_ENABLE") {
						// oNoteText = new sap.ui.commons.TextView({
						//     text : "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
						//     tooltip: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
						//     width : "100%"
						// });
						//aControls.push(oNoteText);
						oView._oEnableAnonymousSetting = oControl;
						oControl.attachChange(oController.handleEnableAnonymousSetting, oController);
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_FOR_ENABLE_PARTLY") {
						oNoteText = new sap.ui.commons.TextView({
							text: "{i18n>BO_LOCAL_SYSTEM_SETTING_ANONYMOUS_FOR_ENABLE_PARTLY_NOTES}",
							tooltip: "{i18n>BO_LOCAL_SYSTEM_SETTING_ANONYMOUS_FOR_ENABLE_PARTLY_NOTES}",
							width: "100%"
						});
						aControls.push(oNoteText);
						oView._oAnonymousEnablePartiallyCheckbox = oControl;
						oControl.attachChange(oController.handleEnableAnonymousPartiallyOptionSetting, oController);
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_RETENTION_PERIOD") {
						oView._oEnableRetentionPeriodCheckBox = oControl;
						oControl.attachChange(oController.handleEnableRetentionPeriod, oController);
					}				
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_CUSTOM_REPORTS") {
						oView._oEnableCustomReportsCheckBox = oControl;
						oControl.attachChange(oController.handleEnableCustomReports, oController);
					}							
					
					//Disable Idea Image&Disable Idea Image Hide Phase bar
					if (oContext.getProperty("CODE") === "sap.ino.config.DISABLE_IDEA_IMAGE") {
						oView._oDisableIdeaImageCheckbox = oControl;
						oControl.attachChange(oController.handleDisableIdeaImagePhaseBar, oController);
					}

					if (oContext.getProperty("CODE") === "sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") {
						oView._oDisableIdeaImageHidePhaseBarCheckbox = oControl;
						oControl.attachChange(oController.handleDisableIdeaImage, oController);
					}

					var oMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oLabel]
						}), new sap.ui.commons.layout.MatrixLayoutCell({
							content: aControls
						}), new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oButton]
						})]
					}).addStyleClass("sapUiInoSettingsRow");
					if (aControls.length > 1) {
						oLabel.addStyleClass("sapUiInoSettingsMultiRowLabel");
						oButton.addStyleClass("sapUiInoSettingsMultiRowBtn");
						oMatrixRow.getCells()[0].setVAlign("Top");
						oMatrixRow.getCells()[2].setVAlign("Top");
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.USAGE_REPORTING_ACTIVE") {
						oView._oUsageReportingRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableTrackUsage.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_JOB_FOR_NEW_NOTIFICATION") {
						oView._oActiveJobRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNewNotification.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.NOTIFICATION_IMME_MAIL_TEMPLATE_CODE") {
						oView._oImmeMailTemplateRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNewNotification.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.NOTIFICATION_MAIL_TEXT_CODE") {
						oView._oSummaryMailTemplateTextRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNewNotification.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.DELETE_INTEGRATION_WITHIN_DAYS") {
						oView._oDeletionOfIntegrationRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableIntegrationDeletion.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.DELETE_NOTIFICATION_WITHINDAYS") {
						oView._oDeletionOfNotificationRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNotificationDeletion.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.IDEA_COMPANY_VIEW_OPTION") {
						oView._oEnableIdeaCompanyViewRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableIdeaCompanyViewCheckbox.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.IDEA_COMPANY_VIEW_TXT") {
						oView._oEnableIdeaCompanyViewTxtRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableIdeaCompanyViewCheckbox.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_FOR_ENABLE_ALL") {
						oView._oAnonymousEnableAllRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableAnonymousSetting.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_FOR_ENABLE_PARTLY") {
						oView._oAnonymousEnablePartiallyRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableAnonymousSetting.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION") {
						oView._oAnonymousEnablePartiallyOptionRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableAnonymousSetting.getChecked() && oView._oAnonymousEnablePartiallyCheckbox.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.RETENTION_PERIOD_VALUE" ) {
						oView._oRetentionPeriodValueRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableRetentionPeriodCheckBox.getChecked());
					}					
					if (oContext.getProperty("CODE") === "sap.ino.config.RETENTION_PERIOD_UNIT" ) {
						oView._oRetentionPeriodUnitRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableRetentionPeriodCheckBox.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.CUSTOM_REPORTS_TILE_NAME" ) {
						oView._oCustomReportsTileNameRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableCustomReportsCheckBox.getChecked());
					}					
					oMatrixRow.setBindingContext(oContext);
					oRepeaterLayout.addRow(oMatrixRow);
				});
				if (oView._oDisableIdeaImageCheckbox.getChecked()) {
					oView._oDisableIdeaImageHidePhaseBarCheckbox.setEnabled(false);
				}
				if (oView._oDisableIdeaImageHidePhaseBarCheckbox.getChecked()) {
					oView._oDisableIdeaImageCheckbox.setEnabled(false);
				}
			}
		});

	},

	bindRows: function() {
		var oView = this;
		var oController = this.getController();
		var oSorter = new sap.ui.model.Sorter("GROUP_ID,GROUP_ORDER", false);
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		this.oSystemSettings = {};

		this.oRepeaterLayout.bindAggregation("rows", {
			sorter: oSorter,
			path: "/LocalSystemSetting",
			factory: function(sId, oContext) {
				if (oContext) {
					var sControlWidth = "200px";
					var oTypeDescr = {
						bindingRef: "VALUE",
						editable: true,
						dataType: oContext.getProperty("DATATYPE_CODE"),
						width: sControlWidth
					};

					if (oContext.getProperty("DATATYPE_CODE") === "BLOB") {
						oTypeDescr.blob = {};
						oTypeDescr.blob.oStyle = sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue;
						oTypeDescr.blob.bMultiple = false;
						oTypeDescr.blob.sAccept = "image/*";

						oTypeDescr.blob.oAttachmentId = {
							path: "VALUE",
							formatter: function(sValue) {
								if (sValue && jQuery.isNumeric(sValue)) {
									return parseInt(sValue, 10);
								}
								return undefined;
							}
						};
						var sMessageGroupName;
						var sTooltipBindingPath;

						if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_BACKGROUND_IMAGE") {
							sMessageGroupName = "backgroundimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_BACKGROUND_IMAGE_CAMPAIGN}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						} else if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_LOGO_IMAGE") {
							sMessageGroupName = "logoimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_LOGO_IMAGE}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						} else if (oContext.getProperty("CODE") === "sap.ino.config.URL_PATH_UI_MOBILE_SMALL_DEFAULT_BACKGROUND_IMAGE") {
							sMessageGroupName = "backgroundimage";
							sTooltipBindingPath = "{i18n>CTRL_ATTACHMENT_CONTROL_SET_MOBILE_SMALL_BACKGROUND_IMAGE}";
							oTypeDescr.blob.sImageDefaultValue = "/" + oContext.getProperty("DEFAULT_VALUE");
						}

						oTypeDescr.blob.oUploadTooltip = sTooltipBindingPath;

						oTypeDescr.blob.fUploadSuccessful = function(evt) {
							oController.updateValue(oContext.getObject(), evt.getParameters().attachmentId);
							oApp.removeNotificationMessages(sMessageGroupName);
						};
						oTypeDescr.blob.fUploadFailed = function(evt) {
							oApp.removeNotificationMessages(sMessageGroupName);
							for (var i = 0; i < evt.getParameters().messages.length; i++) {
								var msg_raw = evt.getParameters().messages[i];
								var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, sMessageGroupName);
								oApp.addNotificationMessage(msg);
							}
						};
						oTypeDescr.blob.fClearSuccessful = function(evt) {
							var oLocalSystemSetting = oContext.getObject();
							oController.updateValue(oLocalSystemSetting, oLocalSystemSetting.DEFAULT_VALUE);
							oApp.removeNotificationMessages(sMessageGroupName);
						};
						oTypeDescr.blob.fClearFailed = function(evt) {
							oApp.removeNotificationMessages(sMessageGroupName);
							for (var i = 0; i < evt.getParameters().messages.length; i++) {
								var msg_raw = evt.getParameters().messages[i];
								var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, sMessageGroupName);
								oApp.addNotificationMessage(msg);
							}
						};
					}

					oView.oSystemSettings[oContext.getProperty("CODE")] = oContext.getProperty("VALUE");

					var oControl, oSettings, oRefControl;
					if (oContext.getProperty("DATATYPE_CODE") === "CODE") {

						if (oContext.getProperty("CODE") === "sap.ino.config.RETENTION_PERIOD_UNIT") {

							oSettings = {
								Path: "VALUE",
								Editable: true,
								Visible: true,
								WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
								Width: sControlWidth,
								View: oView
							};
							oControl = sap.ui.ino.views.common.GenericControl.createDropDownBox(oSettings);
						} else {
							oSettings = {
								Path: "VALUE",
								CodeTable: oContext.getProperty("CODE_TABLE"),
								Editable: true,
								Visible: true,
								WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
								Width: sControlWidth,
								View: oView
							};
							oControl = sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
						}

					} else if (oContext.getProperty("DATATYPE_CODE") === "TOKEN") {
						oSettings = {
							SelKeys: oContext.getProperty("VALUE") ? oContext.getProperty("VALUE").split(",") : [],
							Editable: true,
							Visible: true,
							WithEmpty: oContext.getProperty("DEFAULT_VALUE") === null,
							Width: sControlWidth,
							View: oView
						};

						oControl = sap.ui.ino.views.common.GenericControl.createMultiComboBox(oSettings);

						oRefControl = sap.ui.ino.views.common.GenericControl.createTokenizer({
							MultiComboBox: oControl,
							View: oView
						});

						oControl.data("relControl", oRefControl);

						oControl.attachSelectionChange(
							sap.ui.ino.views.common.GenericControl._handleIdeaFiltersSelChange.bind(null, oRefControl));
					} else {
						oControl = sap.ui.ino.views.common.ControlFactory.getControlForType("VALUE", oTypeDescr);
					}

					if (oControl.attachLiveChange) {
						oControl.attachLiveChange(oController.onValueChanged, oController);
					}
					if (oControl.attachChange) {
						oControl.attachChange(oController.onValueChanged, oController);
					}
					if (oControl.attachSelectionFinish) {
						oControl.attachSelectionFinish(oController.onValueChanged, oController);
					}

					var oLabel = new sap.ui.commons.Label({
						text: {
							path: "CODE",
							formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.basis.SystemSetting.Root")
						},
						design: sap.ui.commons.LabelDesign.Bold,
						textAlign: sap.ui.core.TextAlign.Right,
						width: "100%"
					});
					if(oView.aSpecialLabels.indexOf(oContext.getProperty("CODE")) > -1){
					    oLabel.addStyleClass("sapUiInoSettingsBlueLabel");
					}
					oLabel.setLabelFor(oControl);

					var oButton = new sap.ui.commons.Button({
						text: "{i18n>BO_LOCAL_SYSTEM_SETTING_BUT_RESET}",
						press: [oController.onSetDefaultValue, oController],
						lite: false,
						enabled: {
							parts: [{
								path: "VALUE"
							}, {
								path: "DEFAULT_VALUE"
							}],
							formatter: function(oValue, oDefaultValue) {
								return oValue !== oDefaultValue;
							}
						}
					});
					oController.mapButtonToInput(oButton.getId(), oControl);
					oController.mapCodeToButton(oContext.getObject().CODE, oButton);

					var aControls = [oControl];
					if (oRefControl) {
						aControls.push(oRefControl);
					}

					// add notes for notification template related settings
					var oNoteText;
					if (oContext.getProperty("CODE") === "sap.ino.config.ENABLE_NEW_NOTIFICATION") {
						oNoteText = new sap.ui.commons.TextView({
							text: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
							tooltip: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
							width: "100%"
						});
						aControls.push(oNoteText);
						oView._oEnableNewNotification = oControl;
						oControl.attachChange(oController.handleEnableNewNotificationChange, oController);
					}
					// if (oContext.getProperty("CODE") === "sap.ino.config.ANONYMOUS_ENABLE") {
					//     // oNoteText = new sap.ui.commons.TextView({
					//     //     text : "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
					//     //     tooltip: "{i18n>BO_LOCAL_SYSTEM_SETTING_ENABLE_NEW_NOTIFICATION_NOTES}",
					//     //     width : "100%"
					//     // });
					//     //aControls.push(oNoteText);
					//     oView._oEnableAnonymousSetting = oControl;
					//     oControl.attachChange(oController.handleEnableAnonymousSetting, oController);
					// }

					var oMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oLabel]
						}), new sap.ui.commons.layout.MatrixLayoutCell({
							content: aControls
						}), new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oButton]
						})]
					}).addStyleClass("sapUiInoSettingsRow");
					if (aControls.length > 1) {
						oLabel.addStyleClass("sapUiInoSettingsMultiRowLabel");
						oButton.addStyleClass("sapUiInoSettingsMultiRowBtn");
						oMatrixRow.getCells()[0].setVAlign("Top");
						oMatrixRow.getCells()[2].setVAlign("Top");
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.NOTIFICATION_IMME_MAIL_TEMPLATE_CODE") {
						oView._oImmeMailTemplateRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNewNotification.getChecked());
					}
					if (oContext.getProperty("CODE") === "sap.ino.config.NOTIFICATION_MAIL_TEXT_CODE") {
						oView._oSummaryMailTemplateTextRow = oMatrixRow;
						oView.toggleMatrixRowDisplay(oMatrixRow, oView._oEnableNewNotification.getChecked());
					}
					return oMatrixRow;
				}
			}
		});
	},

	getBoundPath: function(sPath) {
		return "{" + sPath + "}";
	},

	toggleMatrixRowDisplay: function(oMatrixRow, bVisible) {
		oMatrixRow.getCells().forEach(function(oCell) {
			oCell.getContent().forEach(function(oControl) {
				oControl.setVisible(bVisible);
			});
		});
	}
}));