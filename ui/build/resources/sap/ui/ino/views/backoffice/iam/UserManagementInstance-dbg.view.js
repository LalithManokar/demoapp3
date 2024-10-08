/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserManagementInstance";
	},

	createHeaderContent: function() {
		var oController = this.getController();

		this.removeAllHeaderGroups();

		/**
		 * Title information
		 */
		var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					content: [new sap.ui.commons.TextView({
						text: oController.getBoundPath("/NAME"),
						design: sap.ui.commons.TextViewDesign.Bold
					})],
					colSpan: 2
				})]
			})],
			widths: ["40%", "60%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_IDENT_GRP_HEADER_NAME"),
			content: oTitleContent
		}));

		var oBasicInformationContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			rows: [this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_LAST_NAME"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("LAST_NAME", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_FIRST_NAME"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("FIRST_NAME", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_USER_NAME"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("USER_NAME", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_EXTERNAL"), 1, new sap.ui.commons.CheckBox({
				checked: {
					path: oController.getFormatterPath("IS_EXTERNAL", true),
					type: new sap.ui.ino.models.types.IntBooleanType()
				},
				tooltip: oController.getTextModel().getText("BO_IDENT_EXP_EXTERNAL"),
				enabled: false
			}), 2)]
		});

		// 		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
		// 			title: oController.getTextModel().getText("BO_IDENT_GRP_HEADER_BASIC_DATA"),
		// 			content: oBasicInformationContent
		// 		}));

		var oMailLink = new sap.ui.commons.Link({
			text: oController.getBoundPath("EMAIL", true),
			href: {
				path: oController.getFormatterPath("EMAIL", true),
				formatter: function(sVal) {
					return "mailto:" + sVal;
				},
				type: null
			},
			wrapping: false,
			width: "160px"
		});

		var oPhoneLink = new sap.ui.commons.Link({
			text: oController.getBoundPath("PHONE", true),
			href: {
				path: oController.getFormatterPath("PHONE", true),
				formatter: function(sVal) {
					return "tel:" + sVal;
				},
				type: null
			},
			target: "_blank",
			wrapping: false,
			width: "160px"
		});

		var oMobileLink = new sap.ui.commons.Link({
			text: oController.getBoundPath("MOBILE", true),
			href: {
				path: oController.getFormatterPath("MOBILE", true),
				formatter: function(sVal) {
					return "tel:" + sVal;
				},
				type: null
			},
			target: "_blank",
			wrapping: false,
			width: "160px"
		});

		var oContactContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_PHONE"), 1, oPhoneLink, 2), this.createRow(oController.getTextModel()
				.getText("BO_IDENT_FLD_MOBILE"), 1, oMobileLink, 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_EMAIL"), 1,
				oMailLink, 2)]
		});

		// 		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
		// 			title: oController.getTextModel().getText("BO_IDENT_GRP_HEADER_CONTACT"),
		// 			content: oContactContent
		// 		}));

		var oDepartmentContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_COSTCENTER"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("COST_CENTER", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_ORGANIZATION"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("ORGANIZATION", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_COMPANY"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("COMPANY", true),
				wrapping: false,
				width: "160px"
			}), 2), this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_OFFICE"), 1, new sap.ui.commons.TextView({
				text: oController.getBoundPath("OFFICE", true),
				wrapping: false,
				width: "160px"
			}), 2)]
		});

		// 		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
		// 			title: oController.getTextModel().getText("BO_IDENT_GRP_HEADER_DEPARTMENT"),
		// 			content: oDepartmentContent
		// 		}));

		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			// Do not add User ID to comply to data protection requirements (Incident 1580008013) 
			rows: [this.createRow(oController.getTextModel().getText("BO_IDENT_FLD_SOURCE"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("SOURCE_TYPE_CODE", true),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.SourceTypeCode.Root")
				}
			})), this.createRow(this.getText("BO_IDENT_FLD_CREATED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_IDENT_FLD_CREATED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CREATED_BY_NAME", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_IDENT_FLD_CHANGED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_IDENT_FLD_CHANGED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CHANGED_BY_NAME", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["40%", "60%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_IDENT_GRP_HEADER_ADMIN_DATA"),
			content: oAdminDataContent
		}));

		this.refreshHeaderGroups();
	},

	setThingInspectorConfiguration: function() {
		var oController = this.getController();

		this.sType = "User";
		this.sHelpContext = "BO_USER";
		/**
		 * Thing Inspector Settings
		 */
		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_IDENT_TIT_TYPE");
		this.oSettings.icon = {
			path: oController.getFormatterPath("IDENTITY_IMAGE_ID", true),
			formatter: function(iId) {
				return sap.ui.ino.application.Configuration.getAttachmentTitleImageDownloadURL(iId, sap.ui.ino.controls.ThemeFactory.getImage(
					"user_48x48.png"));
			},
			type: null
		};

		this.addFacet("sap.ui.ino.views.backoffice.iam.UserManagementUserDataFacet", "{i18n>BO_IDENT_TIT_DETAIL_GENERAL}");
		if (this._hasAdminPrivilege()) {
			this.addFacet("sap.ui.ino.views.backoffice.iam.UserManagementUserDiscloseData", "{i18n>BO_IDENT_TIT_DISCLOSE_DATA_GENERAL}");
			this.addFacet("sap.ui.ino.views.backoffice.iam.UserDiscloseDataViewLog", "{i18n>BO_IDENT_TIT_VIEW_LOG_GENERAL}");
			this.addFacet("sap.ui.ino.views.backoffice.iam.UserManagementUserLog", "{i18n>BO_IDENT_TIT_CHANGE_LOG}");
		}
		this.addStandardButtons({
			save: true,
			edit: true,
			cancel: true,
			del: this._hasAdminPrivilege(),
			toggleClipboard: this._hasAdminPrivilege()
		});
		if (this._oPendingViewElementBinding) {
			var oResetPwdButton = new sap.ui.ux3.ThingAction({
				text: oController.getTextModel().getText("BO_IDENT_BUT_PASSWORD_RESET"),
				enabled: this.getBoundPath("property/actions/del/enabled", true),
				select: [oController.resetPassword, oController]
			});
			this.addAction(oResetPwdButton, true);
		}
	},

	showUpdateMessages: function() {
		// 		var oController = this.getController();
		// 		var bUpdate = oController.oModel.getProperty("/property/actions/update/enabled");

		// 		if (!bUpdate) {
		// 			var aMessages = oController.oModel.getProperty("/property/actions/update/messages");
		// 			if (aMessages && aMessages.length > 0) {
		// 				oController.addMessages(aMessages);
		// 			}
		// 		}
	},

	onShow: function() {
		var oView = this;

		if (oView.oTI) {
			if (oView.oTI.isOpen()) {
				oView.showUpdateMessages();
			} else {
				var fnUpdateMessages = undefined;
				fnUpdateMessages = function() {
					oView.oTI.detachOpen(fnUpdateMessages, oView);

					setTimeout(function() {
						oView.showUpdateMessages();
					}, 250);
				};
				oView.oTI.attachOpen(fnUpdateMessages, oView);
			}
		}
	},
	_hasAdminPrivilege: function() {
		return Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute");
	}
}));