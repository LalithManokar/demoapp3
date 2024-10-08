/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

sap.ui.controller("sap.ui.ino.views.backoffice.tag.TagModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "tag",
        save : {
            success : "MSG_TAG_SAVE_SUCCESS",
        },
        del : {
            success : "MSG_TAG_DELETED", // text key for delete success message
            title : "BO_TAG_MODIFY_TIT_DEL_TAG", // text key for dialog title
            dialog : "BO_TAG_MODIFY_INS_DEL_TAG" // text key for dialog message
        },
        merge : {
            success : "MSG_TAG_MERGED" // text key for merge success message
        }
    },

    getODataPath : function() {
        // can be redefined if OData Model is needed;
        return "/Tags";
    },

    createModel : function(iId) {
        if (this.oModel == null) {
            this.oModel = new sap.ui.ino.models.object.Tag(iId > 0 ? iId : undefined, {
                actions : ["modify", "del", "reindex", "merge", "mergeAllSimilarTags"],
                nodes : ["Root"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }

        // this binding to the unnamed global model is used for read-only facets like usage or similarity
        // where data is not contained in the Application Object model
        this.bindODataModel(iId);

        return this.oModel;
    },

    onMergeWithClipboardPressed : function() {
        var oController = this;
        var oView = this.getView();
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("tag");
        oView.setBusy(true);
        var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
        var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
        var iTagID = this.getModel().getProperty("/ID");
        var oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.tag.Tag", iTagID, {
            actions : [{
                "merge" : aTagKeys
            }]
        });

        var oMergeSelectedConfirmationDialog = new sap.ui.commons.Dialog({
            title : "{i18n>BO_TAG_MODIFY_TIT_MERGE_TAG}",

        });

        oMergeSelectedConfirmationDialog.setModel(oPropertyModel, "property");

        var oConfirmationDialog = sap.ui.view({
            viewName : "sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog",
            type : sap.ui.core.mvc.ViewType.JS,
            viewData : {
                action : "merge",
                parentController : this, // controller
                fnMerge : function(oParentController) {

                    oController.onMergeWithClipboard(oParentController, aTagKeys, iTagID);

                }, // function to call the merge
                confirmationDialog : oMergeSelectedConfirmationDialog,
                objectName : this.getModel().getProperty("/NAME")
            }
        });

    },

    onMergeWithClipboard : function(that, aTagKeys, iTagID) {

        var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
        var oMergeRequest = sap.ui.ino.models.object.Tag.merge(iTagID, aTagKeys);

        oMergeRequest.done(function(oResponse) {

            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
            var oMessageParameters = {
                key : "MSG_TAG_MERGED",
                level : sap.ui.core.MessageType.Success,
                parameters : [],
                group : "tag",
                text : oMsg.getResourceBundle().getText("MSG_TAG_MERGED")
            };
            that.getView().setBusy(false);

            // remove all keys from the clipboard
            for (var i = 0; i < aTagKeys.length; i++) {
                var iID = aTagKeys[i];
                // remove all tags from the clipboard as they where deleted except the leading one
                if (iTagID != iID) {
                    oClipboard.remove(sap.ui.ino.models.object.Tag, iID);
                }
            }

            that.onChange();
            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
            oApp.addNotificationMessage(oMessage);

        });

        oMergeRequest.fail(function(oResponse) {
            that.getView().setBusy(false);
            
            if (oResponse.MESSAGES) {
                for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                    var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oResponse.MESSAGES[i], that.getView(), "tag");
                    sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
                }
            }
        });

    },

    onMerge : function() {
        var oController = this;
        var oView = this.getView();
        function fnMergeWithClipboard(bResult) {
            if (bResult) {
                var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
                var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
                if (!aTagKeys) {
                    return;
                }
                var oModel = oController.getModel();
                // get the ID
                var iTagID = oModel.getProperty("/ID");

                var oRequest = oController.onModelAction(oModel.merge, "merge", true, false, true, aTagKeys);
                oRequest.done(function(oResponse) {
                    // remove all keys from the clipboard
                    for (var i = 0; i < aTagKeys.length; i++) {
                        var iID = aTagKeys[i];
                        // remove all tags from the clipboard as they where deleted except the leading one
                        if (iTagID != iID) {
                            oClipboard.remove(sap.ui.ino.models.object.Tag, iID);
                        }
                    }
                });
            }
        }

        var oBundle = this.getTextModel();
        sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_TAG_MODIFY_INS_MERGE_TAG"), fnMergeWithClipboard, oBundle.getText("BO_TAG_MODIFY_TIT_MERGE_TAG"));
    },

    onDeletePressed : function(oEvent) {
        // redefinition to show popup
        var oView = this.getView();
        oView.oDeleteConfirmationDialog.setModel(this.getModel(), this.getModelName());
        oView.oDeleteConfirmationDialog.open();
    },

    onDeleteConfirmed : function(oEvent) {
        // remove messages to suppress generic confirmation pop up
        this.mMessageParameters["del"] = null;
        // now finally move to super call
        sap.ui.ino.views.common.ThingInspectorAOController.onDelete.apply(this, undefined);
    }
}));
