/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMapping", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.integration.IntegrationMapping";
	},
	
	createHeaderContent: function() {
	    var oController = this.getController();
		this.removeAllHeaderGroups();
		
		// Title information
		var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					content: [new sap.ui.commons.TextView({
						text: this.getBoundPath("APINAME", true), // should be bind NAME path
						design: sap.ui.commons.TextViewDesign.Bold
					})],
					colSpan: 2
				})]
			})],
			widths: ["30%", "70%"]
		});
		
		// Technical information
		var oTechnicalInformationContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_TECH_NAME") + ":", new sap.ui.commons.TextView({
				text: this.getBoundPath("TECHNICAL_NAME", true)
			}))
// 			, this.createRow(oController.getTextModel().getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_PACKAGE") + ":", new sap.ui.commons.TextView({
// 				text: this.getBoundPath("SYSTEM_PACKAGE_NAME", true),
// 				wrapping: false,
// 				width: "140px"
// 			}))
			],
			widths: ["40%", "60%"]
		});
		
		// Admin information
		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(this.getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_CREATE_ON") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_CREATE_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CREATE_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_CHANGE_ON") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_INTEGRATION_MAPPING_DETAIL_LABEL_CHANGE_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CHANGE_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["40%", "60%"]
		});
		
		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NTEGRATION_MAPPING_NAME_TIT_TITLE_INFO"),
			content: oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NTEGRATION_MAPPING_TECH_INO_TIT_TITLE_INFO"),
			content: oTechnicalInformationContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NTEGRATION_MAPPING_ADMIN_DATA_TIT_TITLE_INFO"),
			content: oAdminDataContent
		}));

		this.refreshHeaderGroups();
	},
	
	setThingInspectorConfiguration: function() {
	    var oController = this.getController();

		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_NTEGRATION_MAPPING_TIT_TITLE_INFO");

		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("");
		this.sType = "ConfigIntegration";
		this.sHelpContext = "";

		this.addFacet("sap.ui.ino.views.backoffice.integration.IntegrationMappingDefinitionFacet", oController.getTextModel().getText(
			"BO_INTEGRATION_MAPPING_DEFINITION_TIT"));
		this.addFacet("sap.ui.ino.views.backoffice.integration.IntegrationMappingUsageFacet", oController.getTextModel().getText(
			"BO_INTEGRATION_MAPPING_USAGE_TIT"));

		this.addStandardButtons({
			save: true,
			edit: true,
			cancel: true,
			del: true
		});
	},
	
	setFocus: function(oDialog) {
// 		oDialog.setInitialFocus(this.oCodeTextView);
	}
}));