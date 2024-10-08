/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.ValueOptionListModify";
    },

    createHeaderContent : function() {
        var oController = this.getController();
        this.removeAllHeaderGroups();

        /**
         * Title information
         */

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

        /**
         * Technical Information
         */
        var oTechnicalInformationContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(oController.getTextModel().getText("BO_VALUE_OPTION_LIST_FLD_CODE") + ":", new sap.ui.commons.TextView({
                text : this.getBoundPath("PLAIN_CODE", true),
            })), this.createRow(oController.getTextModel().getText("BO_VALUE_OPTION_LIST_FLD_PACKAGE_ID") + ":", new sap.ui.commons.TextView({
                text : this.getBoundPath("PACKAGE_ID", true),
                wrapping : false,
                width : "140px"
            })), ],
            widths : ["30%", "70%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_VALUE_OPTION_LIST_TIT_TITLE"),
            content : oTitleContent
        }));

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_VALUE_OPTION_LIST_TIT_TECHNICAL_INFO"),
            content : oTechnicalInformationContent
        }));

        var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(this.getText("BO_VALUE_OPTION_LIST_ROW_CREATED_AT") + ":", new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CREATED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_VALUE_OPTION_LIST_ROW_CREATED_BY") + ":", new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CREATED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
            })), this.createRow(this.getText("BO_VALUE_OPTION_LIST_ROW_CHANGED_AT") + ":", new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CHANGED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_VALUE_OPTION_LIST_ROW_CHANGED_BY") + ":", new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CHANGED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
            }))],
            widths : ["30%", "70%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_VALUE_OPTION_LIST_TIT_ADMIN_DATA"),
            content : oAdminDataContent
        }));

        this.refreshHeaderGroups();
    },

    setThingInspectorConfiguration : function() {
        var oController = this.getController();

        /**
         * Thing Inspector Settings
         */
        this.oSettings.firstTitle = null;
        this.oSettings.type = oController.getTextModel().getText("BO_VALUE_OPTION_LIST_TIT_VOL");

        this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("value_list_48x48.png");
        this.sType = "ConfigValueOption";
        this.sHelpContext = "BO_VALUE_OPTION_LIST";

        this.addFacet("sap.ui.ino.views.backoffice.config.ValueOptionListDefinitionFacet", oController.getTextModel().getText("BO_VALUE_OPTION_LIST_DEFINITION_TIT"));
        this.addFacet("sap.ui.ino.views.backoffice.config.ValueOptionListUsageFacet", oController.getTextModel().getText("BO_EVALUATION_USAGE_TIT"));
        this.addFacet("sap.ui.ino.views.backoffice.config.ValueOptionListUsageVoteTypeFacet", oController.getTextModel().getText("BO_VOTE_TYPE_USAGE_TIT"));
        this.addFacet("sap.ui.ino.views.backoffice.config.ValueOptionListUsageStatusModelFacet", oController.getTextModel().getText("BO_STATUS_MODEL_USAGE_TIT"));
        this.addFacet("sap.ui.ino.views.backoffice.config.ValueOptionListUsageCustomFormFacet", oController.getTextModel().getText("BO_CUSTOM_IDEA_FORMS_USAGE_TIT"));

        this.addStandardButtons({
            save : true,
            edit : true,
            cancel : true,
            del : true,
            close : false
        });
    },

    setFocus : function(oDialog) {
        oDialog.setInitialFocus(this.oCodeTextView);
    },

    addBackendMessage : function(oBackendMessage, sGroup) {
        if (oBackendMessage.REF_FIELD == "TEXT_VALUE" || oBackendMessage.REF_FIELD == "NUM_VALUE" || oBackendMessage.REF_FIELD == "BOOL_VALUE") {
            oBackendMessage.REF_FIELD = "VALUE";
        }
        if (oBackendMessage.REF_FIELD == "CODE") {
            oBackendMessage.REF_FIELD = "PLAIN_CODE";
        }
        return sap.ui.ino.views.common.MessageSupportView.addBackendMessage.apply(this, [oBackendMessage, sGroup]);
    },

}));