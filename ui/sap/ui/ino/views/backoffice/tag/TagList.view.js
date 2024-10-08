/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.tag.TagList";
    },

    createColumns : function() {

        var oController = this.getController();
        
        //set Multiple Selection Model for Master Detail List 
        this.setMultiToggleSelectionMode();

        return [sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(this.createId("CLIPBOARD"), sap.ui.ino.models.object.Tag),
        sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("NAME"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_DEFAULT_TEXT}"
            }),
            template : new sap.ui.commons.Link({
                text : "{NAME}",
                press : function(oControlEvent) {
                    oController.onNavigateToTag(oControlEvent);
                },
            }),
            sortProperty : "NAME",
            filterProperty : "NAME"
        })),
        sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("VANITY_CODE"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_VANITY_CODE_TEXT}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "VANITY_CODE"
                }
            }),
            sortProperty : "VANITY_CODE",
            filterProperty : "VANITY_CODE"
        })),

        new sap.ui.table.Column(this.createId("COUNT"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_COUNT_TEXT}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "USAGE_COUNT",
                    type : new sap.ui.model.type.Integer()
                }
            }),
            sortProperty : "USAGE_COUNT",
            filterProperty : "USAGE_COUNT",
            filterType : new sap.ui.model.type.Integer()
        }),

        new sap.ui.table.Column(this.createId("CREATED_AT"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_CREATED_AT}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "CREATED_AT",
                    type : new sap.ui.model.type.Date()
                }
            }),
            sortProperty : "CREATED_AT"
        // cannot be filtered by intention, due to problem w/ date filter
        }),

        sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CREATED_BY"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_CREATED_BY}"
            }),
            template : new sap.ui.commons.Link({
                text : "{CREATED_BY}",
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
            }),
            sortProperty : "CREATED_BY",
            filterProperty : "CREATED_BY"
        })),

        new sap.ui.table.Column(this.createId("CHANGED_AT"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_CHANGED_AT}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "CHANGED_AT",
                    type : new sap.ui.model.type.Date()
                }
            }),
            sortProperty : "CHANGED_AT"
        // cannot be filtered by intention, due to problem w/ date filter
        }),

        sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CHANGED_BY"), {
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_TAG_ROW_CHANGED_BY}"
            }),
            template : new sap.ui.commons.Link({
                text : "{CHANGED_BY}",
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
            }),
            sortProperty : "CHANGED_BY",
            filterProperty : "CHANGED_BY"
        }))];
    },

    createActionButtons : function(oController) {

        this._oCreateButton = new sap.ui.commons.Button({
            id : this.createId("BUT_CREATE"),
            text : "{i18n>BO_TAG_BUT_CREATE}",
            press : [oController.onCreatePressed, oController],
            lite : false,
            enabled : true
        });

        this._oEditButton = new sap.ui.commons.Button({
            id : this.createId("BUT_EDIT"),
            text : "{i18n>BO_TAG_BUT_EDIT}",
            press : [oController.onEditPressed, oController],
            lite : false,
            enabled : "{property>/actions/update/enabled}"
        });

        this._oMergeButton = new sap.ui.commons.Button({
            id : this.createId("BUT_MERGE_CLIPBOARD"),
            text : "{i18n>BO_TAG_MODIFY_BUT_MERGE}",
            press : [oController.onMergeWithClipboardPressed, oController],
            lite : false,
            enabled : {
                parts : [{
                    path : "clipboard>/changed"
                }, {
                    path : "property>/actions/merge/enabled"
                }],
                // TODO: Investigate why bIsEmpty is an invalid date
                formatter : function(bIsEmpty, bEnabled) {
                    return !sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag) && bEnabled;
                }
            },

        });

        this._oDeleteButton = new sap.ui.commons.Button({
            id : this.createId("BUT_DELETE"),
            text : "{i18n>BO_TAG_BUT_DELETE}",
            press : [oController.onDeletePressed, oController],
            lite : false,
            enabled : "{property>/actions/del/enabled}"
        });

        // also precreate the dialog
        this.createDeleteConfirmationDialog();

        return [this._oCreateButton, this._oEditButton, this._oMergeButton, this._oDeleteButton];
    },
    
    createDetailsView : function() {
        return sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagListDetails");
    },

    createDeleteConfirmationDialog : function() {
        var oView = this;
        var oController = this.getController();
        var oDialogDeleteButton = new sap.ui.commons.Button({
            text : "{i18n>BO_COMMON_BUT_DELETE}",
            press : function(oEvent) {
                oController.onDeleteConfirmed();
                oView.oDeleteConfirmationDialog.close();
            }
        });
        var oDialogCancelButton = new sap.ui.commons.Button({
            text : "{i18n>BO_COMMON_BUT_CANCEL}",
            press : function() {
                oView.oDeleteConfirmationDialog.close();
            }
        });

        var oConfirmationText = new sap.ui.commons.TextView({
            text : oController.getTextModel().getText("BO_TAG_LIST_INS_DEL_TAG")
        });

        var oUsageText = new sap.ui.commons.TextView({
            text : {
                parts : [{
                    path : "property>/actions/del/customProperties/AFFECTED_IDEAS_COUNT"
                }, {
                    path : "property>/actions/del/customProperties/AFFECTED_CAMPAIGNS_COUNT"
                }, ],
                formatter : function(iIdeaCount, iCampaignCount) {
                    if (iIdeaCount == 1 && iCampaignCount == 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEA_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 0 && iCampaignCount == 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 1 && iCampaignCount == 0) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEA", [iIdeaCount]);
                    } else if (iIdeaCount > 1 && iCampaignCount == 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS_CAMPAIGN", [iIdeaCount]);
                    } else if (iIdeaCount == 1 && iCampaignCount > 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEA_CAMPAIGNS", [iIdeaCount]);
                    } else if (iIdeaCount > 1 && iCampaignCount == 0) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS", [iIdeaCount]);
                    } else if (iIdeaCount == 0 && iCampaignCount > 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_CAMPAIGNS", [iIdeaCount]);
                    } else if (iCampaignCount > 1 && iIdeaCount > 1) {
                        return oController.getTextModel().getText("BO_TAG_INS_DEL_IDEAS_CAMPAIGNS", [iIdeaCount, iCampaignCount]);
                    }
                    return oController.getTextModel().getText("BO_TAG_INS_DEL_NO_USAGE");
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