/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UnitModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.UnitModify";
    },

    createHeaderContent : function() {
        var oController = this.getController();
        this.removeAllHeaderGroups();

        // Title information
        var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Center,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.commons.TextView({
                        text : this.getBoundPath("DEFAULT_TEXT", true),
                        design : sap.ui.commons.TextViewDesign.Bold
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["30%", "70%"],
        });

        // Technical information
        var oTechnicalInformationContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(oController.getTextModel().getText("BO_UNIT_FLD_PLAIN_CODE") + ":", new sap.ui.commons.TextView({
                text : this.getBoundPath("PLAIN_CODE", true),
            })), this.createRow(oController.getTextModel().getText("BO_UNIT_FLD_PACKAGE_ID") + ":", new sap.ui.commons.TextView({
                text : this.getBoundPath("PACKAGE_ID", true),
                wrapping : false,
                width : "140px"
            }))],
            widths : ["30%", "70%"]
        });

        // Admin information
        var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(this.getText("BO_UNIT_ROW_CREATED_AT") + ":", new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CREATED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_UNIT_ROW_CREATED_BY") + ":", new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CREATED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
            })), this.createRow(this.getText("BO_UNIT_ROW_CHANGED_AT") + ":", new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CHANGED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_UNIT_ROW_CHANGED_BY") + ":", new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CHANGED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
            }))],
            widths : ["30%", "70%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_UNIT_TIT_TITLE_INFO"),
            content : oTitleContent
        }));

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_UNIT_TIT_TECHNICAL_INFO"),
            content : oTechnicalInformationContent
        }));

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_UNIT_TIT_ADMIN_INFO"),
            content : oAdminDataContent
        }));

        this.refreshHeaderGroups();
    },

    setThingInspectorConfiguration : function() {
        var oController = this.getController();

        this.oSettings.firstTitle = null;
        this.oSettings.type = oController.getTextModel().getText("BO_UNIT_TIT");

        this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("unit_48x48.png");
        this.sType = "ConfigUnit";
        this.sHelpContext = "BO_UNIT";

        this.addFacet("sap.ui.ino.views.backoffice.config.UnitDefinitionFacet", oController.getTextModel().getText("BO_UNIT_DEFINITION_TIT"));
        this.addFacet("sap.ui.ino.views.backoffice.config.UnitUsageFacet", oController.getTextModel().getText("BO_COMMON_USAGE_TIT"));

        this.addStandardButtons({
            save : true,
            edit : true,
            cancel : true,
            del : true,
            close : false,
        });
    }

}));