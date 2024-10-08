/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.common.UserSettings", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {

	init: function() {
		this.initMessageSupportView();
	},

	exit: function() {
		this.exitMessageSupportView();
		sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
	},

	getControllerName: function() {
		return "sap.ui.ino.views.common.UserSettings";
	},

	createContent: function() {
		var oSettingsLayout = this.getSettingsLayout();
		var oDetailsLayout = this.getDetailsLayout();

		var oUserSettingsNavItem = new sap.ui.ux3.NavigationItem({
			text: "{i18n>CTRL_USERSETTINGSCTRL_SETTINGS_NAV_ITEM}",
			key: "settings"
		});

		var oNavigationBar = new sap.ui.ux3.NavigationBar({
			id: this.createId("UserSettingsNavBar"),
			topLevelVariant: true,
			items: [oUserSettingsNavItem, new sap.ui.ux3.NavigationItem({
				text: "{i18n>CTRL_USERSETTINGSCTRL_PERSONAL_NAV_ITEM}",
				key: "personal"
			})],
			selectedItem: oUserSettingsNavItem,
			select: function(oEvent) {
				if (oEvent.getParameter("item").getKey() === "settings") {
					oSettingsLayout.setVisible(true);
					oDetailsLayout.setVisible(false);
				} else if (oEvent.getParameter("item").getKey() === "personal") {
					oSettingsLayout.setVisible(false);
					oDetailsLayout.setVisible(true);
				}
			}
		});

		var oPopupLayout = new sap.ui.layout.VerticalLayout(this.createId("PopupLayout"), {
			content: [oNavigationBar, oSettingsLayout, oDetailsLayout]
		});

		return oPopupLayout;
	},

	getSettingsLayout: function() {
		var oController = this.getController();

		var oSettingsLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 3,
			width: "430px",
			widths: ["100px", "80px", "250px"]
		});

		var that = this;
		var oUserImageFileUploader = new sap.ui.ino.controls.FileUploader({
			assignmentId: "{write>/Settings/TITLE_IMAGE_ASSIGN_ID}",
			attachmentId: "{write>/Settings/TITLE_IMAGE_ID}",
			attachmentMediaType: "{write>/Settings/TITLE_IMAGE_MEDIA_TYPE}",
			ownerId: "{write>USER_ID}",
			uploadTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_UPLOAD_USER_IMAGE}",
			clearTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_CLEAR_USER_IMAGE}",
			zoomPlusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_PLUS_USER_IMAGE}",
			zoomMinusTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_ZOOM_MINUS_USER_IMAGE}",
			moveUpTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_MOVE_UP_USER_IMAGE}",
			moveDownTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_MOVE_DOWN_USER_IMAGE}",
			moveLeftTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_MOVE_LEFT_USER_IMAGE}",
			moveRightTooltip: "{i18n>CTRL_USERSETTINGSCTRL_EXP_MOVE_RIGHT_USER_IMAGE}",
			showZoomControls: true,
			showMoveControls: false,
			zoomStep: 5,
			accept: "image/*",
			multiple: false,
			style: sap.ui.ino.controls.FileUploaderStyle.UserImage,
			uploadSuccessful: function(evt) {
				that.getModel("write").setUserImage({
					ATTACHMENT_ID: evt.getParameters().attachmentId,
					FILE_NAME: evt.getParameters().fileName,
					MEDIA_TYPE: evt.getParameters().mediaType
				});
				that.removeAllMessages("userimage");
			},
			uploadFailed: function(evt) {
				that.replaceBackendMessages(evt.getParameters().messages, "userimage");
			},
			clearSuccessful: function(evt) {
				that.getModel("write").clearUserImage(evt.getParameters().assignmentId);
				that.removeAllMessages("userimage");
			},
			clearFailed: function(evt) {
				that.replaceBackendMessages(evt.getParameters().messages, "userimage");
			}
		});
		this.oUserImageFileUploader = oUserImageFileUploader;

		var oLanguageDropdown = new sap.ui.commons.ComboBox(this.createId("languagedropdown"), {
			width: "100%",
			selectedKey: "{write>/Settings/LOCALE}"
		});

		// Workaround due to rendering issue in Chrome.
		// If the UserSettings are rendered in a Popup we need to rerender it when the
		// dropdown box looses the focus.
		var oPopup = this.getViewData().container;
		if (oPopup) {
			var fnOnFocusOut = oLanguageDropdown.onfocusout;
			oLanguageDropdown.onfocusout = function() {
				if (typeof(fnOnFocusOut) === "function") {
					fnOnFocusOut.apply(this, arguments);
				}
				sap.ui.core.RenderManager.forceRepaint(oPopup.getId());
			};
		}

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				rowSpan: 3,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				padding: sap.ui.commons.layout.Padding.Neither,
				content: [oUserImageFileUploader]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				padding: sap.ui.commons.layout.Padding.Neither,
				content: [new sap.ui.commons.Label({
					text: "{i18n>CTRL_USERSETTINGSCTRL_LBL_LANGUAGE}",
					labelFor: oLanguageDropdown
				}).addStyleClass("sapUiToolPopupSmallFont sapUiToolPopupLabelAlign")]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				padding: sap.ui.commons.layout.Padding.Neither,
				content: [oLanguageDropdown]
			})]
		}).addStyleClass("sapUiToolPopupBottomPadding");

		oSettingsLayout.addRow(oRow);

// 		var oMailNotifcationCheck = new sap.ui.commons.CheckBox({
// 			id: this.createId("mailNotificationCheckbox"),
// 			text: "{i18n>CTRL_USERSETTINGSCTRL_CKL_NOTIFICATION_MAIL}",
// 			checked: {
// 				path: "write>/Settings/MAIL",
// 				formatter: function(sMail) {
// 					return sMail === sap.ui.ino.application.ApplicationBase.MAIL_ACTIVE;
// 				},
// 				mode: sap.ui.model.BindingMode.OneWay
// 			}
// 		}).addStyleClass("sapUiToolPopupSmallFont");

// 		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
// 			height: "34px",
// 			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
// 				padding: sap.ui.commons.layout.Padding.Neither,
// 				colSpan: 2,
// 				content: [oMailNotifcationCheck]
// 			})]
// 		});

// 		oSettingsLayout.addRow(oRow);

		// Theme
		var oHighContrast = new sap.ui.commons.CheckBox({
			id: this.createId("highContrastCheckbox"),
			text: "{i18n>CTRL_USERSETTINGSCTRL_CKL_HIGHCONTRAST}",
			checked: {
				path: "write>/Settings/THEME",
				formatter: function(sTheme) {
					return sTheme === sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST;
				},
				mode: sap.ui.model.BindingMode.OneWay
			}
		});

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			height: "34px",
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				height: "100%",
				padding: sap.ui.commons.layout.Padding.Neither,
				colSpan: 2,
				content: oHighContrast
			})]
		}).addStyleClass("sapUiToolPopupSmallFont");

		oSettingsLayout.addRow(oRow);

		/*// Tracking
        var oTracking = new sap.ui.commons.CheckBox({
            id : this.createId("trackingCheckbox"),
            text : "{i18n>CTRL_USERSETTINGSCTRL_CKL_TRACKING}",
            enabled : navigator.doNotTrack !== "1",
            checked : {
                path : "write>/Settings/TRACKING",
                formatter : function(sDoNotTrack) {
                    if (navigator.doNotTrack === "1") {
                        return true;
                    }
                    return sDoNotTrack === sap.ui.ino.application.ApplicationBase.DO_NOT_TRACK;
                },
                mode : sap.ui.model.BindingMode.OneWay
            }
        });

        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                height : "100%",
                padding : sap.ui.commons.layout.Padding.Neither,
                colSpan : 2,
                content : oTracking
            })]
        }).addStyleClass("sapUiToolPopupSmallFont");

        oSettingsLayout.addRow(oRow);*/

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3,
				padding: sap.ui.commons.layout.Padding.None,
				content: [new sap.ui.commons.HorizontalDivider({
					height: sap.ui.commons.HorizontalDividerHeight.Medium
				})]
				// .addStyleClass("sapUiInoUserSettingsControlHeadDivider")]
			})]
		});

		oSettingsLayout.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3,
				hAlign: sap.ui.commons.layout.HAlign.Right,
				padding: sap.ui.commons.layout.Padding.Neither,
				content: [new sap.ui.commons.Button({
					text: "{i18n>FO_COMMON_BUT_SAVE}",
					press: function() {
						oController.onSave();
					}
				}), new sap.ui.commons.Button({
					text: "{i18n>FO_COMMON_BUT_CANCEL}",
					press: function() {
						oController.onCancel();
					}
				})]
			})]
		});

		oSettingsLayout.addRow(oRow);

		return oSettingsLayout;
	},

	getDetailsLayout: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: false,
			columns: 2,
			width: "430px",
			widths: ["25%", "75%"]
		});

		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_LAST_NAME}", "{LAST_NAME}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_FIRST_NAME}", "{FIRST_NAME}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_USER_NAME}", "{USER_NAME}"));

		var oExternalCheckBox = new sap.ui.commons.CheckBox({
			checked: {
				path: "IS_EXTERNAL",
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			tooltip: "{i18n>BO_IDENT_EXP_EXTERNAL}",
			enabled: false
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.ui.commons.Label({
					text: "{i18n>BO_IDENT_FLD_EXTERNAL}",
					labelFor: oExternalCheckBox
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oExternalCheckBox
			})]
		});
		oLayout.addRow(oRow);

		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_EMAIL}", "{EMAIL}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_PHONE}", "{PHONE}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_MOBILE}", "{MOBILE}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_COSTCENTER}", "{COST_CENTER}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_ORGANIZATION}", "{ORGANIZATION}"));
		oLayout.addRow(this.getDetailTextRow("{i18n>BO_IDENT_FLD_OFFICE}", "{OFFICE}"));
		oLayout.addRow(this.getDetailDateTextRow("{i18n>BO_IDENT_FLD_VALIDATIONTO}", "VALIDATION_TO"));

		return oLayout;
	},

	getDetailTextRow: function(sLabelBinding, sTextBinding) {
		var oTextView = new sap.ui.commons.TextView({
				text: sTextBinding
			});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.ui.commons.Label({
					text: sLabelBinding,
					design: sap.ui.commons.LabelDesign.Bold,
					labelFor: oTextView
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTextView
			})]
		});
		return oRow;
	},
	getDetailDateTextRow: function(sLabelBinding, sTextBinding) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				style: "medium"
			});
  
		var oTextView = new sap.ui.commons.TextView({
				text: {
					path: sTextBinding,
					formatter: function(oDate) {
						if (!oDate) {
							oDate = new Date("9999-12-31T00:00:00.000Z");
						}
						return oDateFormat.format(oDate);
					}
				}
			});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: new sap.ui.commons.Label({
					text: sLabelBinding,
					design: sap.ui.commons.LabelDesign.Bold,
					labelFor: oTextView
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTextView]
			})]
		});
		return oRow;
	}
}));