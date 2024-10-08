/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationAction", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.NotificationAction";
	},
	
	show: function(iId, sActionType, sMode, fnChangeCallback) {
	    this._sActionType = sActionType;
	    sap.ui.ino.views.common.ThingInspectorAOView.show.apply(this, [iId, sMode, fnChangeCallback]);
	},
	
	createHeaderContent: function() {
	    var that = this; 
		this.removeAllHeaderGroups();
		
		// Title information
		var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					content: [new sap.ui.commons.TextView({
						text: {
						    path: "applicationObject>/ACTION_CODE",
						    formatter: function(sActionCode) {
						        return that.getText(sActionCode + "_TEXT");
						    }
						}, // should be bind NAME path
						design: sap.ui.commons.TextViewDesign.Bold
					})],
					colSpan: 2
				})]
			})],
			widths: ["30%", "70%"]
		});
		
		// Technical information
		var oTechnicalInformationContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [
			    this.createRow(this.getText("BO_NOTIFICATION_ACTION_DETAIL_LABEL_TECH_NAME") + ":", new sap.ui.commons.TextView({
    				text: this.getBoundPath("ACTION_CODE", true)
    			}))
			],
			widths: ["40%", "60%"]
		});
		
		// Admin information
		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(this.getText("BO_NOTIFICATION_ACTION_DETAIL_LABEL_CREATED_ON") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_NOTIFICATION_ACTION_DETAIL_LABEL_CREATED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CREATED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_NOTIFICATION_ACTION_DETAIL_LABEL_CHANGED_ON") + ":", new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_NOTIFICATION_ACTION_DETAIL_LABEL_CHANGED_BY") + ":", new sap.ui.commons.Link({
				text: {
					path: this.getFormatterPath("CHANGED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["40%", "60%"]
		});
		
		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NOTIFICATION_ACTION_DETAIL_NAME_TIT_TITLE_INFO"),
			content: oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NOTIFICATION_ACTION_DETAIL_TECH_INO_TIT_TITLE_INFO"),
			content: oTechnicalInformationContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: this.getText("BO_NOTIFICATION_ACTION_DETAIL_ADMIN_DATA_TIT_TITLE_INFO"),
			content: oAdminDataContent
		}));

		this.refreshHeaderGroups();
	},
	
	setThingInspectorConfiguration: function() {
	    var oController = this.getController();

		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_NOTIFICATION_ACTION_DETAIL_TIT_TITLE_INFO");

		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("evaluation_method_48x48.png");
		this.sType = "ConfigNotification";
		this.sHelpContext = "";

        // show different facet content by action code
        var sFacetName;
        switch(this._sActionType) {
            case "IDEA":
            case "CAMPAIGN":
                //sFacetName = "sap.ui.ino.views.backoffice.config.NotificationActionSimpleFacet";
                sFacetName = "sap.ui.ino.views.backoffice.config.NotificationActionWithTemplateFacet";
                break;
            case "SYSTEM":
            case "FOLLOW":
                sFacetName = "sap.ui.ino.views.backoffice.config.NotificationActionWithTemplateFacet";
                break;
            case "STATUS":
                sFacetName = "sap.ui.ino.views.backoffice.config.NotificationActionStatusModelFacet";
                break;
            default:
                sFacetName = "sap.ui.ino.views.backoffice.config.NotificationActionStatusModelFacet";
        }
        this.addFacet(
            sFacetName, 
            oController.getTextModel().getText("BO_NOTIFICATION_ACTION_DETAIL_DEFINITION_TIT"));

		this.addStandardButtons({
			save: true,
			edit: true,
			cancel: true,
			del: false
		});
	}
}));