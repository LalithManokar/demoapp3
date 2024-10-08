/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.controls.ContentPane");
jQuery.sap.require("sap.ui.ino.controls.MessageLog");
jQuery.sap.require("sap.ui.ino.controls.AttachmentControl");
jQuery.sap.require("sap.ui.ino.controls.Attachment");
jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");
jQuery.sap.require("sap.ui.ino.controls.ContentPane");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");

var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignLandingPageFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignLandingPageFacet";
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

		var oDesignRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oDesignRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createDesignLayout(bEdit)]
		}));
		oLayout.addRow(oDesignRow);

		var oAttachmentRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createAttachmentLayout(bEdit)]
		}));
		oLayout.addRow(oAttachmentRow);

		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createLanguageLayout(bEdit)]
		}));
		oLayout.addRow(oLanguageRow);

		var oPageTableRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oPageTableRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createPageTableLayout(bEdit)]
		}));
		oLayout.addRow(oPageTableRow);

		var oPageTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oPageTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createPageTemplateLayout(bEdit)]
		}));
		oLayout.addRow(oPageTemplateRow);

		this._oPageTemplate.setVisible(false);

		var content = [new sap.ui.ux3.ThingGroup({
			content: oLayout,
			colspan: true
		})];

		return content;
	},

	_createDesignLayout: function(bEdit) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "15px", "80%"]
			// 15px due to the color picker
		});

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		var oColorRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oColorLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_COLOR"),
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});

		var oColorLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oColorLabel]
		});

		var oColorPickerCell = new sap.ui.commons.layout.MatrixLayoutCell();

		if (bEdit) {
			this.getThingInspectorController().getModel().getDataInitializedPromise().done(function() {
				var sColor = oController.getModel().oData["COLOR_CODE"];

				if (sColor) {
					sColor = "#" + sColor;
				} else {
					sColor = "#FFFFFF";
				}

				var oColor = new sap.ui.commons.ColorPicker({
					colorString: sColor
				});
				oColor.addStyleClass("sapUiInoCampaignColorPicker");
				oColor.attachLiveChange(oController._handleColorPickerLiveChange, oController);

				oColorPickerCell.addContent(oColor);
				oColorLabel.setLabelFor(oColor);
			});
		} else {
			var oColor = new sap.ui.core.HTML({
				content: {
					path: this.getFormatterPath("COLOR_CODE", true),
					formatter: function(sColor) {
						if (!sColor) {
							sColor = "FFFFFF";
						}
						sColor = "#" + sColor;
						return "<div class='sapUiInoCampaignColorSample' style='background-color: " + sColor + ";'>&nbsp;</div>";
					}
				},
				sanitizeContent: true
			});
			oColorPickerCell.addStyleClass("sapUiInoCampaignColorSampleContainer");
			oColorPickerCell.addContent(oColor);
			oColorLabel.setLabelFor(oColor);
		}

		oColorRow.addCell(oColorLabelCell);
		oColorRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oColorRow.addCell(oColorPickerCell);
		oLayout.addRow(oColorRow);

		return oLayout;
	},

	_createAttachmentLayout: function(bEdit) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});

		if (bEdit) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

			var oMessageLogAttachments = new sap.ui.ino.controls.MessageLog({
				messages: "{" + this.getThingInspectorView().MESSAGE_LOG_MODEL_NAME + ">/messages}",
				groups: ["attachments"]
			});

			var oCampaignTitleImageLayout = new sap.ui.commons.layout.HorizontalLayout();
			oCampaignTitleImageLayout.addContent(oMessageLogAttachments);
			var oCampaignTitleImageFileUploader = new sap.ui.ino.controls.FileUploader({
				attachmentId: this.getBoundPath("CAMPAIGN_IMAGE_ID", true),
				assignmentId: this.getBoundPath("CAMPAIGN_IMAGE_ASSIGN_ID", true),
                attachmentMediaType: "image/png",
                uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_SET_TITLE_IMAGE_CAMPAIGN}",
    			clearTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CLEAR_USER_IMAGE}",
    			zoomPlusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_PLUS_USER_IMAGE}",
    			zoomMinusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_MINUS_USER_IMAGE}",
    			cropTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CROP_USER_IMAGE}",
    			showZoomControls: true,
    			showMoveControls: false,
    			showCropControls: true,
				showUploadFileControls: true,
				uploadFileControlsTooltip:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_IMAGE}",
				uploadFileControlsText:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_TEXT}",
    			zoomStep: 5,
    			accept: "image/*",
        		style: sap.ui.ino.controls.FileUploaderStyle.CampaignTitleImage,
				uploadSuccessful: function(evt) {
					oController.setCampaignImage(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("titleimage");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "titleimage");
						oApp.addNotificationMessage(msg);
					}
				},
				clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					oController.clearCampaignImage(evt.getParameters().assignmentId);
				},
				clearFailed: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "titleimage");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oCampaignTitleImageLayout.addContent(oCampaignTitleImageFileUploader);

			var oCampaignListImageLayout = new sap.ui.commons.layout.HorizontalLayout();
			oCampaignListImageLayout.addContent(oMessageLogAttachments);
			var oCampaignListFileUploader = new sap.ui.ino.controls.FileUploader({
				attachmentId: this.getBoundPath("CAMPAIGN_LIST_IMAGE_ID", true),
				assignmentId: this.getBoundPath("CAMPAIGN_LIST_IMAGE_ASSIGN_ID", true),
                attachmentMediaType: "image/png",
                uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_SET_LIST_IMAGE_CAMPAIGN}",
    			clearTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CLEAR_USER_IMAGE}",
    			zoomPlusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_PLUS_USER_IMAGE}",
    			zoomMinusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_MINUS_USER_IMAGE}",
    			cropTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CROP_USER_IMAGE}",
    			showZoomControls: true,
    			showMoveControls: false,
    			showCropControls: true,
				showUploadFileControls: true,
				uploadFileControlsTooltip:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_IMAGE}",
				uploadFileControlsText:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_TEXT}",
    			zoomStep: 5,
    			accept: "image/*",
        		style: sap.ui.ino.controls.FileUploaderStyle.CampaignListImage,
				uploadSuccessful: function(evt) {
					oController.setCampaignListImage(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("titleimage");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "titleimage");
						oApp.addNotificationMessage(msg);
					}
				},
				clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					oController.clearCampaignListImage(evt.getParameters().assignmentId);
				},
				clearFailed: function(evt) {
					oApp.removeNotificationMessages("titleimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "titleimage");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oCampaignListImageLayout.addContent(oCampaignListFileUploader);

			var oBackgroundImageLayout = new sap.ui.commons.layout.HorizontalLayout();
			oBackgroundImageLayout.addContent(oMessageLogAttachments);
			var sURL = Configuration.getFrontofficeDefaultBackgroundImageURL(false);
			if (jQuery.isNumeric(sURL)) {
				sURL = Configuration.getAttachmentTitleImageDownloadURL(sURL);
			}
			var oBackgroundImageFileUploader = new sap.ui.ino.controls.FileUploader({
				uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_SET_BACKGROUND_IMAGE_CAMPAIGN}",
				style: sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue,
				imageDefaultValue: "/" + sURL,
				attachmentId: this.getBoundPath("CAMPAIGN_BACKGROUND_IMAGE_ID", true),
				assignmentId: this.getBoundPath("CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", true),
				accept: "image/*",
				showUploadFileControls: true,
				uploadFileControlsTooltip:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_IMAGE}",
				showFileUploaderTextControls:false,
				compressed: false,
				uploadSuccessful: function(evt) {
					oController.setCampaignBackgroundImage(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("backgroundimage");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "backgroundimage");
						oApp.addNotificationMessage(msg);
					}
				},
				clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					oController.clearCampaignBackgroundImage(evt.getParameters().assignmentId);
				},
				clearFailed: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "backgroundimage");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oBackgroundImageLayout.addContent(oBackgroundImageFileUploader);

			var oBackgroundMobileSmallImageLayout = new sap.ui.commons.layout.HorizontalLayout();
			oBackgroundMobileSmallImageLayout.addContent(oMessageLogAttachments);
			sURL = Configuration.getMobileSmallDefaultBackgroundImageURL();
			if (jQuery.isNumeric(sURL)) {
				sURL = Configuration.getAttachmentTitleImageDownloadURL(sURL);
			}
			var oBackgroundMobileSmallImageFileUploader = new sap.ui.ino.controls.FileUploader({
				uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_SET_MOBILE_SMALL_BACKGROUND_IMAGE}",
				style: sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue,
				imageDefaultValue: "/" + sURL,
				attachmentId: this.getBoundPath("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID", true),
				assignmentId: this.getBoundPath("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", true),
				accept: "image/*",
				showUploadFileControls: true,
				uploadFileControlsTooltip:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_IMAGE}",
				showFileUploaderTextControls:false,
				compressed: false,
				uploadSuccessful: function(evt) {
					oController.setCampaignMobileSmallBackgroundImage(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters()
						.mediaType);
					oApp.removeNotificationMessages("backgroundimage");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "backgroundimage");
						oApp.addNotificationMessage(msg);
					}
				},
				clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					oController.clearCampaignMobileSmallBackgroundImage(evt.getParameters().assignmentId);
				},
				clearFailed: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "backgroundimage");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oBackgroundMobileSmallImageLayout.addContent(oBackgroundMobileSmallImageFileUploader);

			var oAttachmentFileLayout = new sap.ui.commons.layout.HorizontalLayout();
			oAttachmentFileLayout.addContent(oMessageLogAttachments);
			var oAttachmentFileUploader = new sap.ui.ino.controls.FileUploader({
				uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_ADD}",
				style: sap.ui.ino.controls.FileUploaderStyle.Attachment,
				showUploadFileControls: true,
				uploadFileControlsTooltip:"{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_FILE_IMAGE}",
				showFileUploaderTextControls:false,
				compressed: false,
				uploadSuccessful: function(evt) {
					oController.addAttachment(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("attachments");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("attachments");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "attachments");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			var oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
				attachmentFileUploader: oAttachmentFileUploader,
				ariaLivePriority: sap.ui.ino.controls.AriaLivePriority.assertive,
				useRoleFilter: true,
				roleFilters: ["ATTACHMENT"]
			});
			var oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
				assignmentId: this.getBoundPath("ID"),
				attachmentId: this.getBoundPath("ATTACHMENT_ID"),
				roleFilter: this.getBoundPath("ROLE_TYPE_CODE"),
				mediaType: this.getBoundPath("MEDIA_TYPE"),
				fileName: this.getBoundPath("FILE_NAME"),
				url: {
					path: this.getFormatterPath("ATTACHMENT_ID"),
					formatter: function(attachmentId) {
						return sap.ui.ino.application.Configuration.getAttachmentDownloadURL(attachmentId);
					}
				},
				removeTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_REMOVE}",
				editable: true,
				backendRemove: false,
				removeSuccessful: function(evt) {
					oController.removeAttachment(evt.getParameters().assignmentId);
					oApp.removeNotificationMessages("attachments");
				},
				removeFailed: function(evt) {
					oApp.removeNotificationMessages("attachments");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "attachments");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oAttachmentControl.bindAttachments({
				path: this.getFormatterPath("Attachments", true),
				template: oAttachmentTemplate
			});
			oAttachmentFileLayout.addContent(oAttachmentControl);

			var oCampaignTitleImageRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oCampaignTitleImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("CTRL_ATTACHMENT_CONTROL_SET_TITLE_IMAGE_CAMPAIGN"),
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oCampaignTitleImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oCampaignTitleImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oCampaignTitleImageLayout]
			}));

			var oCampaignListImageRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oCampaignListImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("CTRL_ATTACHMENT_CONTROL_SET_LIST_IMAGE_CAMPAIGN"),
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oCampaignListImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oCampaignListImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oCampaignListImageLayout]
			}));

			var oBackgroundImageRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oBackgroundImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("CTRL_ATTACHMENT_CONTROL_SET_BACKGROUND_IMAGE_CAMPAIGN"),
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oBackgroundImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oBackgroundImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oBackgroundImageLayout]
			}));

			var oBackgroundMobileSmallImageRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oBackgroundMobileSmallImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("CTRL_ATTACHMENT_CONTROL_SET_MOBILE_SMALL_BACKGROUND_IMAGE"),
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oBackgroundMobileSmallImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oBackgroundMobileSmallImageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oBackgroundMobileSmallImageLayout]
			}));

			var oAttachmentRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("CTRL_ATTACHMENT_CONTROL_ADD"),
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAttachmentFileLayout]
			}));

			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			    height: "20px"
		    }));
			oLayout.addRow(oCampaignTitleImageRow);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			    height: "20px"
		    }));
			oLayout.addRow(oCampaignListImageRow);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			    height: "20px"
		    }));
			oLayout.addRow(oBackgroundImageRow);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			    height: "20px"
		    }));
			oLayout.addRow(oBackgroundMobileSmallImageRow);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			    height: "20px"
		    }));
			oLayout.addRow(oAttachmentRow);
			return oLayout;

		} else {
			var oAttachmentLayout = new sap.ui.commons.layout.HorizontalLayout();
			var oAttachmentControl = new sap.ui.ino.controls.AttachmentControl();
			var oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
				assignmentId: this.getBoundPath("ID"),
				attachmentId: this.getBoundPath("ATTACHMENT_ID"),
				roleFilter: this.getBoundPath("ROLE_TYPE_CODE"),
				mediaType: this.getBoundPath("MEDIA_TYPE"),
				fileName: this.getBoundPath("FILE_NAME"),
				url: {
					path: this.getFormatterPath("ATTACHMENT_ID", false),
					formatter: function(attachmentId) {
						return Configuration.getAttachmentDownloadURL(attachmentId);

					}
				},
				editable: false
			});
// 			oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
// 				attachments: {
// 					path: this.getFormatterPath("Attachments", false),
// 					template: oAttachmentTemplate,
// 					formatter: function(Attachments) {
// 						var test = [];
// 						for (var i = 0; i < Attachments.length;i++) {
// 							if (Attachments[i].ROLE_TYPE_CODE === "BACKGROUND_IMG") {
// 								test.push(Attachments[i]);
// 							}
// 						}
// 						return test;
// 					}
// 				}
// 			});

			oAttachmentControl.bindAttachments({
				path: this.getFormatterPath("Attachments", true),
				template: oAttachmentTemplate
			});

			oAttachmentLayout.addContent(oAttachmentControl);

			var oAttachmentRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.TextView({
					text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_ATTACHMENTS"),
					design: sap.ui.commons.TextViewDesign.Bold,
					textAlign: sap.ui.core.TextAlign.Right,
					width: "100%"
				})]
			}));
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oAttachmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAttachmentLayout]
			}));

			oLayout.addRow(oAttachmentRow);

			return oLayout;
		}
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
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_LANGUAGE"),
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
		});

		oModel.getDataInitializedPromise().done(function() {
			oView._oLanguageDropdown.fireChange({
				newValue: oView._oLanguageDropdown.getSelectedKey()
			});
		});

		var oLanguageContainer = new sap.ui.ino.controls.ContentPane({
			fullsize: false,
			content: this._oLanguageDropdown
		}).addStyleClass("sapUiInoCampaignLandingPageLanguageContainer");

		var oLanguage = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLanguageContainer]
		});

		oLanguageRow.addCell(oLanguageLabel);
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oLanguageRow.addCell(oLanguage);
		oLayout.addRow(oLanguageRow);

		return oLayout;
	},

	_createPageTableLayout: function(bEdit) {

		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Buttons
		 */
		this._oNewButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_LANDINGPAGE_BUT_NEW_PAGE}",
			press: [oController.onNewButtonPressed, oController],
			lite: false,
			enabled: bEdit
		});

		this._oDeleteButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_LANDINGPAGE_BUT_DELETE_PAGE}",
			press: [oController.onDeleteButtonPressed, oController],
			lite: false,
			enabled: false
		});

		this._oUpButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_LANDINGPAGE_BUT_PHASE_UP}",
			press: [oController.onUpButtonPressed, oController],
			lite: false,
			enabled: false
		});

		this._oDownButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_LANDINGPAGE_BUT_PHASE_DOWN}",
			press: [oController.onDownButtonPressed, oController],
			lite: false,
			enabled: false
		});

		/*
		 * Table
		 */
		this._oTable = new sap.ui.table.Table({
			enableColumnReordering: true,
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource(), bEdit);
			},
			visibleRowCount: 5,
			toolbar: new sap.ui.commons.Toolbar({
				items: [this._oNewButton, this._oDeleteButton, this._oUpButton, this._oDownButton]
			})
		});

		var oTableContainer = new sap.ui.ino.controls.ContentPane({
			fullsize: false,
			content: this._oTable
		}).addStyleClass("sapUiInoCampaignLandingPageTableContainer");

		var oTitleColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_TITLE}"
			}),
			template: new sap.ui.commons.TextView({
				text: this.getBoundPath("TITLE")
			})
		});
		this._oTable.addColumn(oTitleColumn);

		this._oTable.bindRows({
			path: this.getFormatterPath("LanguagePages", true),
			filters: [new sap.ui.model.Filter("LANG", "EQ", this.getThingInspectorController()._sCurrentLanguage)]
		});

		var oTableRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oTableLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_TABLE"),
				design: sap.ui.commons.TextViewDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			})]
		});

		oTableRow.addCell(oTableLabel);
		oTableRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTableRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTableContainer]
		}));
		oLayout.addRow(oTableRow);

		return oLayout;
	},

	_createPageTemplateLayout: function(bEdit) {
		var oView = this;
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Title
		 */
		var oTitleLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_TITLE"),
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});

		var oTitleLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTitleLabel]
		});

		var oTitleField;

		if (bEdit) {
			oTitleField = new sap.ui.commons.TextField({
				value: "{specialLanguageModel>/TITLE}",
				maxLength: this.getBoundPath("/meta/nodes/LanguagePages/attributes/TITLE/maxLength"),
				width: '100%',
				required: true,
				ariaLabelledBy: oTitleLabel
			});
			this._oPageTitle = oTitleField;

			// WORKAROUND FOR RTE VALUE BINDING PROBLEM
			this._oPageTitle.attachChange(function() {
				var sValue = oView._oPageTitle.getValue();

				if (oController.getModel()) {
					var oContext = oView._oTable.getContextByIndex(oView._oTable.getSelectedIndex());
					oController.getModel().setProperty(oContext.sPath + "/TITLE", sValue);
				}
			}, this);
		} else {
			oTitleField = new sap.ui.commons.TextView({
				text: this.getBoundPath("TITLE"),
				ariaLabelledBy: oTitleLabel
			});
		}

		oTitleLabel.setLabelFor(oTitleField);

		var oTitleContainer = new sap.ui.ino.controls.ContentPane({
			fullsize: false,
			content: oTitleField
		}).addStyleClass("sapUiInoCampaignLandingPageTitleContainer");

		var oTitle = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTitleContainer]
		});

		var oTitleRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oTitleRow.addCell(oTitleLabelCell);
		oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTitleRow.addCell(oTitle);
		oLayout.addRow(oTitleRow);
		
		/*
		 * Description
		 */
		var oTextCell = new sap.ui.commons.layout.MatrixLayoutCell();

		var sContentId = oTextCell.getId() + "--" + this.createId("textcontent");

		/*
		 * Preview
		 */
		var oPreviewLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_PREVIEW"),
				design: sap.ui.commons.TextViewDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			})]
		});

		var sContent = "<div class='sapUiInoBackofficeCampaignPagePreviewArea'></div>";
		var sUrl = sap.ui.ino.application.Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_UI_CAMPAIGN_PREVIEW");

		var oPreview = new sap.ui.commons.layout.MatrixLayoutCell();

		if (bEdit) {
		    // add richeditor mode switch button
    		var oMenuButtonRow = new sap.ui.commons.layout.MatrixLayoutRow();
    		oMenuButtonRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
    		oMenuButtonRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
    		var oMenuButton = new sap.m.SegmentedButton({
    			items: [new sap.m.SegmentedButtonItem({
    			    key: "visualized",
    			    text: "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_VISUALIZED}"
    			}), new sap.m.SegmentedButtonItem({
    			    key: "expert",
    			    text: "{i18n>BO_HOME_PAGE_WIDGET_SEGMENTED_EXPERT}"
    			})],
    			selectionChange: function(oEvent) {
    			    var sSelKey = oEvent.getParameter("item").getKey();
    		        oView._oText.setVisible(sSelKey === "visualized");
    		        oView._oTextExpertField.setVisible(sSelKey === "expert");
    			}
    		});
    		oMenuButtonRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
    		    content: [oMenuButton]
    		}));
    		oLayout.addRow(oMenuButtonRow);
		    
			// delay for IE (otherwise the RTE behaves ugly or throws exceptions)
// 			var sAgent = window.navigator.userAgent;
// 			var bIsMSIE = sAgent.indexOf("MSIE ") > -1;

			setTimeout(function() {
			 //   sId, sValueBindingPath, sHeight, bAdvancedMode, bValidateBlank, bSanitizeValue, sFileLabel, bHideImg
				oView._oText = sap.ui.ino.application.ControlFactory.createRichTextEditor(undefined, "specialLanguageModel>/HTML_CONTENT", "400px",
					true, undefined, undefined, "LANDING_PAGE", false);
				oView._oText.addStyleClass("sapUiInoRTEContainer");

				// WORKAROUND FOR RTE VALUE BINDING PROBLEM
				var _fnSyncHTMLContent = function(oEvent) {
				    var sValue = oEvent.getParameter("newValue");
					if (oController.getModel() && oView._oTable.getSelectedIndex() > -1) {
						var oContext = oView._oTable.getContextByIndex(oView._oTable.getSelectedIndex());
						oController.getModel().setProperty(oContext.sPath + "/HTML_CONTENT", sValue);
					}
				};
				oView._oText.attachChange(_fnSyncHTMLContent);

				var oTextContainer = new sap.ui.ino.controls.ContentPane({
					fullsize: false,
					content: oView._oText
				}).addStyleClass("sapUiInoCampaignLandingPageTextContainer");

				oTextCell.addContent(oTextContainer);
				
				oView._oTextExpertField = new sap.ui.commons.TextArea({
        			value: "{specialLanguageModel>/HTML_CONTENT}",
        			height: "400px",
        			width: "100%",
        			visible: false
        		});
        		oView._oTextExpertField.attachChange(_fnSyncHTMLContent);
        		var oExpertTextContainer = new sap.ui.ino.controls.ContentPane({
        			fullsize: false,
        			content: oView._oTextExpertField
        		}).addStyleClass("sapUiInoCampaignLandingPageTitleContainer");
        		oTextCell.addContent(oExpertTextContainer);

				if (sUrl) {
					sContent = "<div class='sapUiInoBackofficeCampaignPagePreviewArea'><iframe data-sap-id='" + oView._oText.getId() +
						"' name='campaign_preview' src='" + sUrl + "' width='100%' height='100%' style='border:0'></iframe></div>";
				}
				var oPreviewField = new sap.ui.core.HTML({
					content: sContent,
					sanitizeContent: true
				});

				oPreview.addContent(oPreviewField);
			}, sap.ui.Device.browser.msie ? 500 : 0);
		} else {
			this._oText = new sap.ui.core.HTML({
				width: "100%",
				content: {
					path: this.getFormatterPath("HTML_CONTENT"),
					formatter: function(sHTMLContent) {
						// do not write "null" as content
						if (sHTMLContent == null || sHTMLContent == undefined) {
							sHTMLContent = "";
						}
						// content is expected to be wrapped by proper HTML
						// we ensure this by adding the divs around it
						return "<div style='word-wrap: break-word;'>" + sHTMLContent + "</div>";
					}
				},
				sanitizeContent: true
			});
			this._oText.addStyleClass("sapUIInoCampaignHTMLBox");

			var oTextContainer = new sap.ui.ino.controls.ContentPane({
				fullsize: false,
				content: this._oText
			}).addStyleClass("sapUiInoCampaignLandingPageTextContainer").addStyleClass("sapUIInoCampaignHTMLBox");

			oTextCell.addContent(oTextContainer);

			if (sUrl) {
				sContent = "<div class='sapUiInoBackofficeCampaignPagePreviewArea'><iframe data-sap-id='" + oView._oText.getId() +
					"' name='campaign_preview' src='" + sUrl + "' width='100%' height= '100%'></iframe></div>";
			}
			var oPreviewField = new sap.ui.core.HTML({
				content: sContent,
				sanitizeContent: true
			});

			oPreview.addContent(oPreviewField);
		}

		var oTextRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oTextLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_TEXT"),
				design: sap.ui.commons.TextViewDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			})]
		});

		oTextRow.addCell(oTextLabelCell);
		oTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTextRow.addCell(oTextCell);
		oLayout.addRow(oTextRow);

		if (bEdit) {
			var oRefreshRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oRefresh = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.Button({
					text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_BUT_PREVIEW_REFRESH"),
					press: [oController.onPreviewRefresh, oController]
				})]
			});

			oRefreshRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRefreshRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRefreshRow.addCell(oRefresh);
			oLayout.addRow(oRefreshRow);
		}

		var oEmptyRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oEmptyRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oEmptyRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oEmptyRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oLayout.addRow(oEmptyRow);

		var oPreviewLabelRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oPreviewLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_LANDINGPAGE_FLD_PREVIEW_COMMENT"),
				design: sap.ui.commons.TextViewDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Left,
				width: "100%"
			})]
		});

		oPreviewLabelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oPreviewLabelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oPreviewLabelRow.addCell(oPreviewLabelCell);
		oLayout.addRow(oPreviewLabelRow);

		var oPreviewRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oPreviewRow.addCell(oPreviewLabel);
		oPreviewRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oPreviewRow.addCell(oPreview);
		oLayout.addRow(oPreviewRow);

		this._oPageTemplate = oLayout;

		var oContainer = new sap.ui.ino.controls.ContentPane({
			fullsize: false,
			content: oLayout
		}).addStyleClass("sapUiInoCampaignLandingPageTemplateContainer");

		return oContainer;
	},

	onclick: function(oEvent) {
		if (this._oText && typeof this._oText.removeFocus === "function") {
			this._oText.removeFocus(oEvent);
		}
	},

	onkeyup: function(oEvent) {
		if (this._oText && typeof this._oText.removeFocus === "function") {
			this._oText.removeFocus(oEvent);
		}
	},

	getLanguageDropdown: function() {
		return this._oLanguageDropdown;
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	revalidateMessages: function() {
		if (!this._oTable) {
			return;
		}
		var oController = this.getController();
		//in teardown/close of the TI the controller may be already destroyed
		if (oController) {
			var oThingInspectorView = this.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateTableMessages(this._oTable, "LanguagePages");
		}

	}
}));
