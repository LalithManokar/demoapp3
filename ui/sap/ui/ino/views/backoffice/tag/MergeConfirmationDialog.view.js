/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.Repeater");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog";
    },

    isValidMerge : function(sAction, bIsInverted) {
        return {
            path : "property>/actions/" + sAction + "/customProperties/AFFECTED_OBJECTS",
            formatter : function(iAffectedObjects) {
                if (iAffectedObjects == undefined) {
                    return false;
                }
                if (iAffectedObjects) {
                    return (!bIsInverted) ? iAffectedObjects.length > 0 : !iAffectedObjects.length > 0;
                } else {
                    return (!bIsInverted) ? false : true;
                }
            }
        };
    },
    createContent : function(oController) {
        var oViewData = this.getViewData();
        var sAction = oViewData.action;

        var oParentController = oViewData.parentController;
        var fnMerge = oViewData.fnMerge;
        this.oConfirmationDialog = oViewData.confirmationDialog;

        var oDialogMergeButton = new sap.ui.commons.Button({
            text : "{i18n>BO_TAG_BUT_MERGE_TAG}",
            enabled : this.isValidMerge(sAction),
            press : function(oEvent) {
                oViewData.fnMerge(oParentController);
                oViewData.confirmationDialog.close();
            }
        });
        var that = this;
        var oDialogCancelButton = new sap.ui.commons.Button({
            text : "{i18n>BO_TAG_BUT_CANCEL}",
            press : function() {
                oParentController.getView().setBusy(false);
                that.oConfirmationDialog.close();
            }
        });

        var oConfirmationTextInfo = new sap.ui.commons.TextView({
            text : oParentController.getTextModel().getText("BO_TAG_MODIFY_INS_MERGE_TAG"),
        });

        var oConfirmationTextReplacingTag = new sap.ui.commons.TextView({
            text : oParentController.getTextModel().getText("BO_TAG_MODIFY_INS_MERGE_REPLACING_TAG_INFO", [oViewData.objectName]),
        });

        var oConfirmationTextReplacedTag = new sap.ui.commons.TextView({
            text : oParentController.getTextModel().getText("BO_TAG_MODIFY_INS_MERGE_REPLACED_TAG_INFO"),
        });

        var oUsageText = new sap.ui.commons.TextView({
            text : {
                parts : [{
                    path : "property>/actions/" + sAction + "/customProperties/AFFECTED_IDEAS_COUNT"
                }, {
                    path : "property>/actions/" + sAction + "/customProperties/AFFECTED_CAMPAIGNS_COUNT"
                }],
                formatter : function(iIdeaCount, iCampaignCount) {
                    if (iIdeaCount > 0 && iCampaignCount > 0) {
                        return oParentController.getTextModel().getText("BO_TAG_MODIFY_MERGE_IDEA_CAMPAIGN", [iIdeaCount, iCampaignCount]);
                    }
                    if (iIdeaCount > 0) {
                        return oParentController.getTextModel().getText("BO_TAG_MODIFY_MERGE_IDEA", [iIdeaCount]);
                    }
                    if (iCampaignCount > 0) {
                        return oParentController.getTextModel().getText("BO_TAG_MODIFY_MERGE_IDEA", [iCampaignCount]);
                    } else {
                        return oParentController.getTextModel().getText("BO_TAG_MODIFY_MERGE_NO_USAGE");
                    }
                }
            }
        });

        var oRejectText = new sap.ui.commons.TextView({
            visible : true,
            text : {
                parts : [{
                    path : "property>/actions/" + sAction + "/customProperties/AFFECTED_OBJECTS"
                }],
                formatter : function(aAffectedObjects) {
                    // if no tags can be merged.
                    if (!aAffectedObjects || aAffectedObjects.length == 0 || jQuery.isEmptyObject(aAffectedObjects)) {
                        return oParentController.getTextModel().getText("BO_TAG_MODIFY_MERGE_NO_TAGS_AVAILABLE", [oViewData.objectName]);
                    }
                    return "";
                }
            }
        });

        var oTagRepeater = new sap.ui.ino.controls.Repeater({
            floatHorizontal : false,
        });

        var oTagTemplate = new sap.ui.commons.TextView({
            text : {
                path : "property>NAME",
                formatter : function(sName) {
                    return "-  " + sName;
                }
            }
        });

        oTagRepeater.bindRows("property>/actions/" + sAction + "/customProperties/AFFECTED_OBJECTS", oTagTemplate);

        var oConfirmationLayout = new sap.ui.commons.layout.VerticalLayout({
            content : [oConfirmationTextInfo, oConfirmationTextReplacingTag, oConfirmationTextReplacedTag, oTagRepeater, oUsageText],
            visible : this.isValidMerge(sAction)
        });

        var oRejectLayout = new sap.ui.commons.layout.VerticalLayout({
            content : [oRejectText],
            visible : this.isValidMerge(sAction, true)
        });

        this.oConfirmationDialog.addContent(oConfirmationLayout);
        this.oConfirmationDialog.addContent(oRejectLayout);

        this.oConfirmationDialog.addButton(oDialogMergeButton);
        this.oConfirmationDialog.addButton(oDialogCancelButton);
        this.oConfirmationDialog.attachClosed(function(){
             oParentController.getView().setBusy(false);
        });

        // oConfirmationDialog.open();
    }
});
