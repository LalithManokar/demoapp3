/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.models.formatter.GenericFormatter");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.GroupManagementInstance";
	},

	createHeaderContent: function() {
		var oController = this.getController();

		this.removeAllHeaderGroups();

		this.oTitleContent = new sap.ui.commons.layout.MatrixLayout({
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

		this.oBasicInformationContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [
                this.createRow(oController.getTextModel().getText("BO_GROUPMGMT_FLD_MEMBERS"), new sap.ui.commons.TextView({
					text: {
						path: oController.getFormatterPath("MEMBERS", true),
						formatter: function(sMembers) {
							if (!sMembers) {
								return "0";
							}
							return sMembers;
						}
					}
				}))],
			widths: ["40%", "60%"],
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_GROUPMGMT_GRP_HEADER_NAME"),
			content: this.oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_GROUPMGMT_GRP_HEADER_GENERAL"),
			content: this.oBasicInformationContent
		}));

		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_GROUPMGMT_FLD_ID"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("ID", true),
					type: new sap.ui.model.type.Integer(),
					formatter: sap.ui.ino.models.formatter.GenericFormatter.formatIdNoHandle
				}
			})), this.createRow(oController.getTextModel().getText("BO_GROUPMGMT_FLD_SOURCE"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("SOURCE_TYPE_CODE", true),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.SourceTypeCode.Root")
				}
			})), this.createRow(this.getText("BO_GROUPMGMT_FLD_CREATED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_GROUPMGMT_FLD_CREATED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CREATED_BY_NAME", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_GROUPMGMT_FLD_CHANGED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_GROUPMGMT_FLD_CHANGED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CHANGED_BY_NAME", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["40%", "60%"],
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_GROUPMGMT_GRP_ADMIN_DATA"),
			content: oAdminDataContent
		}));

		this.refreshHeaderGroups();
	},

	setThingInspectorConfiguration: function() {
		var oController = this.getController();

		this.sType = "Group";
		this.sHelpContext = "BO_GROUP";

		/**
		 * Thing Inspector Settings
		 */
		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_GROUPMGMT_TIT_TYPE");
		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("group_48x48.png");

		this.addFacet("sap.ui.ino.views.backoffice.iam.GroupManagementGroupDataFacet", "{i18n>BO_GROUPMGMT_TIT_GROUP_DATA}");
		this.addStandardButtons({
			save: true,
			//edit: true,
			cancel: true,
			toggleClipboard: true
		});

		this.oEditButton = new sap.ui.ux3.ThingAction({
			text: "{i18n>BO_TI_BUT_EDIT}",
			enabled: {
				parts: [{
					path: this.getFormatterPath("property/actions/update/enabled", true),
					type: null
				}, {
					path: this.getFormatterPath("/GroupAttribute/0/IS_MANAGER_PUBLIC"),
					type: null
				}, {
					path: this.getFormatterPath("/CREATED_BY_ID"),
					type: null
				}],
				formatter: function(bEnable, nMgrPublic, id) {
				    var isAdmin = sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute");
				    var isCampaignMgr = sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager");
					if (bEnable && isAdmin) {
						return true;
					}
					if (bEnable && isCampaignMgr && !!nMgrPublic) {
						return true;
					}
					if (bEnable && isCampaignMgr
					    && sap.ui.ino.application.Configuration.getCurrentUser().USER_ID === Number(id)) {
						return true;
					}
					return false;
				}
			},
			tooltip: {
				path: this.getFormatterPath("property/actions/update/messages", true),
				formatter: function(aMessages) {
					if (aMessages && aMessages.length > 0) {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
							.getResourceBundle();
						return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
					} else {
						return undefined;
					}
				}
			},
			select: [oController.onEdit, oController]
		});
		this.addAction(this.oEditButton, true);

		// we need the delete button as member variable to hide/disable it in create case
		this.oDeleteButton = new sap.ui.ux3.ThingAction({
			text: "{i18n>BO_GROUPMGMT_BUT_DELETE}",
			enabled: "{" + oController.getModelPrefix() + "/property/actions/del/enabled}",
			tooltip: {
				path: oController.getModelPrefix() + "/property/actions/del/messages",
				formatter: function(aMessages) {
					var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
					var i18n = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
					if (aMessages && aMessages.length > 0) {
						return oMsg.getText(aMessages[0].MESSAGE);
					} else {
						return i18n.getText("BO_GROUPMGMT_EXP_DELETE");
					}
				}
			}
		});
		this.oDeleteButton.attachSelect(oController.onDelete, oController);
		this.addAction(this.oDeleteButton, false, true);
	}

}));