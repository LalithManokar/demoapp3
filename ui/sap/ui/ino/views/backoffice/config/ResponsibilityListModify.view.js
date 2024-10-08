/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ResponsibilityListModify";
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
			rows: [this.createRow(oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_FLD_CODE") + ":", new sap.ui.commons.TextView({
				text: this.getBoundPath("PLAIN_CODE", true)
			})), this.createRow(oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_FLD_PACKAGE_ID") + ":", new sap.ui.commons.TextView({
				text: this.getBoundPath("PACKAGE_ID", true),
				wrapping: false,
				width: "140px"
			}))],
			widths: ["30%", "70%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_TITLE_TIT"),
			content: oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_TECHNICAL_INFO_TIT"),
			content: oTechnicalInformationContent
		}));

		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(this.getText("BO_RESPONSIBILITY_LIST_FLD_CREATED_AT") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_RESPONSIBILITY_LIST_FLD_CREATED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CREATED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_RESPONSIBILITY_LIST_FLD_CHANGED_AT") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_RESPONSIBILITY_LIST_FLD_CHANGED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CHANGED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["30%", "70%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_RESPONSIBILITY_LIST_ADMIN_DATA_TIT"),
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
		this.oSettings.type = oController.getTextModel().getText("BO_RESPONSIBILITY_LIST_TIT");

		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("evaluation_method_48x48.png");
		this.sType = "ConfigResponsibilityList";
		this.sHelpContext = "BO_RESPONSIBILITY_LIST";

		this.addFacet("sap.ui.ino.views.backoffice.config.ResponsibilityListModifyDefinitionFacet", oController.getTextModel().getText(
			"BO_RESPONSIBILITY_LIST_DEFINITION_TIT"));
		this.addFacet("sap.ui.ino.views.backoffice.config.ResponsibilityListModifyUsageFacet", oController.getTextModel().getText(
			"BO_RESPONSIBILITY_LIST_USAGE_TIT"));

		this.addStandardButtons({
			save: true,
			// edit : true,
			cancel: true,
			// del : true,
			close: false
		});
		var oEditButton = new sap.ui.ux3.ThingAction({
			text: "{i18n>BO_TI_BUT_EDIT}",
// 			enabled: this.getBoundPath("property/actions/update/enabled", true),
			enabled: {
				parts: [{
					path: "applicationObject>/property/actions/update/enabled",
					type: null
				}, {
					path: "applicationObject>/IS_MANAGER_PUBLIC",
					type: null
				}],
				formatter: function(bEnable, bIsManagerPublic) {
					if (sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute")) {
						return bEnable;
					}
					return bEnable && bIsManagerPublic === 1;
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
		this.addAction(oEditButton, true);
		var oDeleteButton = new sap.ui.ux3.ThingAction({
			text: "{i18n>BO_TI_BUT_DELETE}",
// 			enabled: this.getBoundPath("property/actions/del/enabled", true),	
			enabled: {
				parts: [{
					path: "applicationObject>/property/actions/update/enabled",
					type: null
				}, {
					path: "applicationObject>/IS_MANAGER_PUBLIC",
					type: null
				}],
				formatter: function(bEnable, bIsManagerPublic) {
					if (sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute")) {
						return bEnable;
					}
					return bEnable && bIsManagerPublic === 1;
				}
			},
			tooltip: {
				path: this.getFormatterPath("property/actions/del/messages", true),
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
			select: [oController.onDelete, oController]
		});
		this.addAction(oDeleteButton, true, true);
	}
}));