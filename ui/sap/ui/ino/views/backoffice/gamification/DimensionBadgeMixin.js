/*!
 * @copyright@
 */

jQuery.sap.declare("sap.ui.ino.views.backoffice.gamification.DimensionBadgeMixin");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.models.types.IntegerNullableType");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.controls.AttachmentControl");
jQuery.sap.require("sap.ui.ino.controls.Attachment");
var Configuration = sap.ui.ino.application.Configuration;

(function() {
	sap.ui.ino.views.backoffice.gamification.DimensionBadgeMixin = {
        BAGES_INIT_COUNT: 10,
		createBadgeThingGroup: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oLayout = new sap.ui.commons.layout.MatrixLayout();
			this.createBadgeContent(oLayout, bEdit);
			return new sap.m.Panel({
				visible: {
					parts: [{
						path: oController.getFormatterPath("REDEEM", true),
						type: null
					}],
					formatter: function(oRedeem) {
						return !oRedeem || Number(oRedeem) < 1;
					}
				},
				headerText: this.getController().getTextPath("BO_GAMIFICATION_DIMENSION_BADGE_TIT"),
				content: [oLayout]
			});
		},

		createBadgeContent: function(oLayout, bEdit) {
			this._createBadgeToolbar(oLayout, bEdit);
			this._createBadgeTable(oLayout, bEdit);
			this._createBadgeDetail(oLayout, bEdit);
		},

		_createBadgeToolbar: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oToolbar = new sap.ui.commons.Toolbar();
			var oNewButton = new sap.ui.commons.Button({
				text: oController.getTextPath("BO_GAMIFICATION_DIMENSION_BADGE_BTN_CREATE"),
				press: function(oEvent) {
					oController.createBadge(oEvent);
				},
				enabled: {
					parts: [{
						path: oController.getFormatterPath("Badge", true)
                    }],
					formatter: function(aBadge) {
						return bEdit && (!aBadge || aBadge.length < oView.BAGES_INIT_COUNT);
					}
				}
			});
			oToolbar.addItem(oNewButton);
			var oDelButton = new sap.ui.commons.Button({
				text: oController.getTextPath("BO_GAMIFICATION_DIMENSION_BADGE_BTN_DELETE"),
				press: function(oEvent) {
					oController.delBadge(oEvent);
				},
				enabled: {
					parts: [{
						path: oController.getFormatterPath("SELECTED_BADGE_INDEX", true)
                    }],
					formatter: function(nIndex) {
						return bEdit && nIndex >= 0;
					}
				}
			});
			oToolbar.addItem(oDelButton);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oToolbar
				})]
			}));
		},

		_createBadgeTable: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oListRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oTable = new sap.ui.table.Table({
				id: "BadgeTable",
				selectionMode: sap.ui.table.SelectionMode.Single,
				visibleRowCount: 5,
				rows: {
					path: oController.getFormatterPath("Badge", true)
				},
				columns: [new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_BADGE_NAME"
					}),
					template: oView.createControl({
						Type: "textview",
						Text: "NAME",
						Editable: false
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_BADGE_ATTACHMENT"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: oController.getFormatterPath("Attachment"),
							formatter: function(aAttachment) {
								if (aAttachment && aAttachment.length > 0) {
									return aAttachment[0].FILE_NAME;
								}
								return "";
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_BADGE_DESCRIPTION"
					}),
					template: oView.createControl({
						Type: "textview",
						Text: "DESCRIPTION",
						Editable: false
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_BADGE_VALUE"
					}),
					template: oView.createControl({
						Type: "textview",
						Text: "BADGE_VALUE",
						Editable: false
					})
				})],
				rowSelectionChange: function(oEvent) {
					var oCurrentBadgeModel = oView.getController().getModel();
					oCurrentBadgeModel.setProperty("/SELECTED_BADGE_INDEX", oEvent.getSource().getSelectedIndex());
					var oBadgeDetail = sap.ui.getCore().byId("badgeDetail");
					if (oBadgeDetail) {
						oBadgeDetail.setBindingContext(oEvent.getParameter('rowContext'), oView.getController().getModelName());
					}
				}
			});
			oListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTable]
			}));
			oLayout.addRow(oListRow);
		},

		_createBadgeDetail: function(oLayout, bEdit) {
			var oController = this.getController();
			var oDetailLayout = new sap.ui.commons.layout.MatrixLayout({
				id: "badgeDetail",
				columns: 5,
				widths: ['15%', '35%', '50px', '15%', '35%'],
				visible: {
					parts: [{
						path: oController.getFormatterPath("SELECTED_BADGE_INDEX", true)
                    }],
					formatter: function(nIndex) {
						return nIndex >= 0;
					}
				}
			});
			this._createNameAndDescRow(oDetailLayout, bEdit);
			this._createValueRow(oDetailLayout, bEdit);
			this._createAttachmentRow(oDetailLayout, bEdit);
			var oListRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oDetailLayout]
			}));
			oLayout.addRow(oListRow);
		},

		_createNameAndDescRow: function(oDetailLayout, bEdit) {
			var oController = this.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oNameLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_BADGE_NAME",
				Tooltip: "BO_GAMIFICATION_DIMENSION_BADGE_NAME"
			});
			var oNameField = this.createControl({
				Type: "textfield",
				Text: {
					path: oController.getFormatterPath("NAME")
				},
				Editable: bEdit,
				required: true,
				LabelControl: oNameLabel
			});
			var oDescLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_BADGE_DESCRIPTION",
				Tooltip: "BO_GAMIFICATION_DIMENSION_BADGE_DESCRIPTION"
			});
			var oDesc = this.createControl({
				Type: "textarea",
				Text: {
					path: oController.getFormatterPath("DESCRIPTION")
				},
				Editable: bEdit,
				LabelControl: oDescLabel
			});

			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oNameLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oNameField]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oDescLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oDesc],
				rowSpan: 2
			}));
			oDetailLayout.addRow(oRow);
		},

		_createValueRow: function(oDetailLayout, bEdit) {
			var oController = this.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oValueLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_BADGE_VALUE",
				Tooltip: "BO_GAMIFICATION_DIMENSION_BADGE_VALUE"
			});
			var oValueField = this.createControl({
				Type: "textfield",
				Text: {
					path: oController.getFormatterPath("BADGE_VALUE")
				},
				DataType: new sap.ui.ino.models.types.IntegerNullableType(),
				Editable: bEdit,
				required: true,
				LabelControl: oValueLabel
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueField]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},

		_createAttachmentRow: function(oDetailLayout, bEdit) {
			var oView = this;
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oAttachmentLabel = oView.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_BADGE_ATTACHMENT"
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oAttachmentLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				vAlign: sap.ui.commons.layout.VAlign.Top,
				content: [oView._createAttachmentCntrl(bEdit)]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);

			oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oView.createControl({
					Type: "label",
					Text: "BO_GAMIFICATION_DIMENSION_BADGE_ATTACHMENT_TIPS"
				})]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},

		_createAttachmentCntrl: function(bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oAttachmentControl, oAttachmentTemplate;
			if (bEdit) {
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				var oAttachmentFileUploader = new sap.ui.ino.controls.FileUploader({
					assignmentId: oController.getBoundPath("ID"),
					attachmentId: oController.getBoundPath("Attachment/0/ATTACHMENT_ID"),
					clearTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CLEAR_USER_IMAGE}",
					zoomPlusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_PLUS_USER_IMAGE}",
					zoomMinusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_MINUS_USER_IMAGE}",
					cropTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CROP_USER_IMAGE}",
					attachmentMediaType: "image/png",
					showZoomControls: true,
					showMoveControls: false,
					showCropControls: true,
					zoomStep: 1,
					accept: ".jpg,.jpeg,.png",
					uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_ADD}",
					style: sap.ui.ino.controls.FileUploaderStyle.DimensionBadgeImage,
					uploadSuccessful: function(evt) {
						oController.addAttachment(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
						evt.getSource().setBusy(false);
						oApp.removeNotificationMessages("gamificationbadgeattachments");
					},
					uploadFailed: function(evt) {
						oApp.removeNotificationMessages("gamificationbadgeattachments");
						for (var i = 0; i < evt.getParameters().messages.length; i++) {
							var msg_raw = evt.getParameters().messages[i];
							var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "gamificationbadgeattachments");
							oApp.addNotificationMessage(msg);
						}
					},
					clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("gamificationbadgeattachments");
					oController.removeAttachment(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
    				},
    				clearFailed: function(evt) {
    					oApp.removeNotificationMessages("gamificationbadgeattachments");
    					for (var i = 0; i < evt.getParameters().messages.length; i++) {
    						var msg_raw = evt.getParameters().messages[i];
    						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "gamificationbadgeattachments");
    						oApp.addNotificationMessage(msg);
    					}
    				}
				});
				oAttachmentFileUploader.attachUploadStart(function(oEvent){
				    oEvent.getSource().setBusy(true);
				});
				oAttachmentControl = oAttachmentFileUploader;
			} else {
				oAttachmentControl = new sap.ui.ino.controls.AttachmentControl();
				oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
					assignmentId: oController.getBoundPath("ID"),
					attachmentId: oController.getBoundPath("ATTACHMENT_ID"),
					roleFilter: oController.getBoundPath("ROLE_TYPE_CODE"),
					mediaType: oController.getBoundPath("MEDIA_TYPE"),
					fileName: oController.getBoundPath("FILE_NAME"),
					url: {
						path: oController.getFormatterPath("ATTACHMENT_ID", false),
						formatter: function(attachmentId) {
							return Configuration.getAttachmentDownloadURL(attachmentId);
						}
					},
					editable: false
				});
				oAttachmentControl.bindAttachments({
					path: oController.getFormatterPath("Attachment"),
					template: oAttachmentTemplate
				});
			}
			return oAttachmentControl;
		}
	};
}());