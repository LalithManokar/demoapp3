/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.formatter.GenericFormatter");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");

var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.tag.TagModify";
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
                        text : this.getBoundPath("NAME", true),
                        design : sap.ui.commons.TextViewDesign.Bold
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_TAG_MODIFY_ROW_TITLE"),
            content : oTitleContent
        }));

        /**
         * Usage information
         */
        var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Center,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.commons.TextView({
                        text : this.getBoundPath("USAGE_COUNT", true),
                        design : sap.ui.commons.TextViewDesign.Bold
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_TAG_MODIFY_ROW_USAGE"),
            content : oTitleContent
        }));

        /**
         * Administrative data
         */
        var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(this.getText("BO_TAGDETAIL_FLD_ID"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("ID", true),
                    formatter : sap.ui.ino.models.formatter.GenericFormatter.formatIdNoHandle
                }
            })), this.createRow(this.getText("BO_TAGDETAIL_FLD_CREATED_AT"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CREATED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_TAGDETAIL_FLD_CREATED_BY"), new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CREATED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
            })), this.createRow(this.getText("BO_TAGDETAIL_FLD_CHANGED_AT"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CHANGED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_TAGDETAIL_FLD_CHANGED_BY"), new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CHANGED_BY", true)
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
            }))],
            widths : ["40%", "60%"],
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_TAG_MODIFY_ADMIN_DATA_TIT"),
            content : oAdminDataContent
        }));

        this.refreshHeaderGroups();

        // precreate dialogs
        this.createDeleteConfirmationDialog();

    },

    setThingInspectorConfiguration : function() {
        var oController = this.getController();
        var oView = this;

        this.sType = "Tag";
        this.sHelpContext = "BO_TAG";

        this.oSettings.firstTitle = null;
        this.oSettings.type = oController.getTextModel().getText("BO_TAG_MODIFY_TIT_TYPE");
        this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("tag_48x48.png");

        this.addFacet("sap.ui.ino.views.backoffice.tag.TagGeneralDataFacet", oController.getTextModel().getText("BO_TAG_MODIFY_TIT_GENERAL"));
        this.addFacet("sap.ui.ino.views.backoffice.tag.TagUsageFacet", oController.getTextModel().getText("BO_TAG_MODIFY_TIT_USAGE"), "sap.ino.xs.rest.admin.application::execute");
        this.addFacet("sap.ui.ino.views.backoffice.tag.TagSimilarityFacet", oController.getTextModel().getText("BO_TAG_SIMILARITY_TIT"), "sap.ino.xs.rest.admin.application::execute");

        var oMergeButton = new sap.ui.ux3.ThingAction({
            text : "{i18n>BO_TAG_MODIFY_BUT_MERGE}",
            enabled : {
                parts : [{
                    path : "clipboard>/changed"
                }, {
                    path : this.getFormatterPath("/property/actions/merge/enabled")
                }],
                // bIsEmpty is never read, but used to get notified upon model updates
                formatter : function(bIsEmpty, bEnabled) {
                    if (!bEnabled) {
                        return false;
                    }
                    return !sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag);
                }
            },
            tooltip : {
                path : this.getFormatterPath("property/actions/merge/messages", true),
                formatter : function(aMessages) {
                    if (aMessages && aMessages.length > 0) {
                        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
                        return oMsg.getText(aMessages[0].MESSAGE);
                    } else {
                        return undefined;
                    }
                }
            },
            select : [oController.onMergeWithClipboardPressed, oController]
        });
        this.addAction(oMergeButton, false, true);

        var oSaveButton = new sap.ui.ux3.ThingAction({
            text : "{i18n>BO_TI_BUT_SAVE}",
            enabled : this.getBoundPath("property/actions/modify/enabled", true),
            tooltip : {
                path : this.getFormatterPath("property/actions/modify/messages", true),
                formatter : function(aMessages) {
                    if (aMessages && aMessages.length > 0) {
                        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
                        return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                    }
                    return undefined;
                }
            },
            select : [oController.onSave, oController]
        });
        this.addAction(oSaveButton, false, true);

        var oDeleteButton = new sap.ui.ux3.ThingAction({
            text : "{i18n>BO_TI_BUT_DELETE}",
            enabled : this.getBoundPath("property/actions/del/enabled", true),
            tooltip : {
                path : this.getFormatterPath("property/actions/del/messages", true),
                formatter : function(aMessages) {
                    if (aMessages && aMessages.length > 0) {
                        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
                        return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                    } else {
                        return undefined;
                    }
                }
            },
            select : [oController.onDeletePressed, oController]
        });

        this.addAction(oDeleteButton, false, true);

        this.addStandardButtons({
            edit : true,
            close : false,
            cancel : true,
            // del : false,
            toggleClipboard : true,
        });
    },

    createDeleteConfirmationDialog : function() {
        var oTIView = this;
        var oTIController = this.getController();
        var oDialogDeleteButton = new sap.ui.commons.Button({
            text : "{i18n>BO_COMMON_BUT_DELETE}",
            press : function(oEvent) {
                oTIController.onDeleteConfirmed();
                oTIView.oDeleteConfirmationDialog.close();
            }
        });
        var oDialogCancelButton = new sap.ui.commons.Button({
            text : "{i18n>BO_COMMON_BUT_CANCEL}",
            press : function() {
                oTIView.oDeleteConfirmationDialog.close();
            }
        });

        var oConfirmationText = new sap.ui.commons.TextView({
            text : oTIController.getTextModel().getText("BO_TAG_LIST_INS_DEL_TAG")
        });

        var oUsageText = new sap.ui.commons.TextView({
            text : {
                parts : [{
                    path : this.getFormatterPath("/property/actions/del/customProperties/AFFECTED_IDEAS_COUNT")
                }, {
                    path : this.getFormatterPath("/property/actions/del/customProperties/AFFECTED_CAMPAIGNS_COUNT")
                }, ],
                formatter : function(iIdeaCount, iCampaignCount) {
                    if (iIdeaCount == 1 && iCampaignCount == 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEA_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 0 && iCampaignCount == 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 1 && iCampaignCount == 0) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEA", [iIdeaCount]);
                    } else if (iIdeaCount > 1 && iCampaignCount == 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 1 && iCampaignCount > 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEA_CAMPAIGNS", [iIdeaCount]);
                    } else if (iIdeaCount > 1 && iCampaignCount == 0) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS", [iIdeaCount]);
                    } else if (iIdeaCount == 0 && iCampaignCount > 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_CAMPAIGNS", [iIdeaCount]);
                    } else if (iCampaignCount > 1 && iIdeaCount > 1) {
                        return oTIController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS_CAMPAIGNS", [iIdeaCount, iCampaignCount]);
                    }
                    return oTIController.getTextModel().getText("BO_TAG_INS_DEL_NO_USAGE");
                }
            }
        });

        var oConfirmationLayout = new sap.ui.commons.layout.VerticalLayout({
            content : [oConfirmationText, oUsageText]
        });

        this.oDeleteConfirmationDialog = new sap.ui.commons.Dialog({
            title : "{i18n>BO_TAG_LIST_TIT_DEL_TAG}",
            content : [oConfirmationLayout]
        });
        this.oDeleteConfirmationDialog.addButton(oDialogDeleteButton);
        this.oDeleteConfirmationDialog.addButton(oDialogCancelButton);
    },
}));