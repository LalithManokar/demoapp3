/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.CommentController");

jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Message");

(function() {
    "use strict";

    sap.ui.ino.views.common.CommentController = {
        
        getCommentModelId : function() {
            // TO BE IMPLEMENTED BY SUBCLASS
        },

        setCommentModel : function() {
            var iId = this.getCommentModelId();
            var oComment = this.getCommentTemplate(iId);
            this.getView().setModel(oComment, "comment");
        },

        getCommentTemplate : function(iId) {
            // REFINE IN SUBCLASS
        },

        getCommentModel : function() {
            return this.getView().getModel("comment");
        },

        submitComment : function(oEvent) {
            var oButton = oEvent.getSource();
            oButton.setEnabled(false);

            var oView = this.getView();
            var oMasterView;

            // PLEASE NOTE that TI and main view will be used interchangeably depending on availablibity
            if (this.getThingInspectorView) {
                var oMasterView = this.getThingInspectorView();
            } else {
                oMasterView = oView;
            }
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

            oView.oCommentsRepeater.oFocus = undefined;
            oMasterView.removeAllMessages();
            oApp.removeNotificationMessages();
            oMasterView.showValidationMessages();
            if (oMasterView.hasValidationMessages()) {
                oButton.setEnabled(true);
                oApp.addNotificationMessages(oMasterView.getMessages());
                return;
            }

            oView.setBusy(true);
            var oComment = this.getCommentModel();
            var oCreateRequest = oComment.create();

            var that = this;
            oCreateRequest.done(function() {
                // Initialize comment after submit
                that.setCommentModel();
                oView.refreshComments();
            });

            oCreateRequest.fail(function(oResponse) {
                oMasterView.addBackendMessages(oResponse.MESSAGES);
                oApp.addNotificationMessages(oMasterView.getMessages());

            });

            oCreateRequest.always(function() {
                oView.oPostTextView.focus();
                oView.setBusy(false);
                oButton.setEnabled(true);
            });
        },

        deleteComment : function(oEvent) {
            var that = this;
            var oView = this.getView();
            var oMasterView;
            if (this.getThingInspectorView) {
                var oMasterView = this.getThingInspectorView();
            } else {
                oMasterView = oView;
            }
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
            var iCommentId = oEvent.getParameter("commentId");

            oMasterView.removeAllMessages();
            oApp.removeNotificationMessages();
            oView.oCommentsRepeater.oFocus = undefined;
            function fnDeleteComment(bResult) {
                if (bResult) {
                    oView.setBusy(true);
                    var oComment = that.getAOFObject();
                    var oDelRequest = oComment.del(iCommentId);

                    oDelRequest.done(function(oResponse) {
                        oView.refreshComments();
                        oView.oPostTextView.focus();
                    });

                    oDelRequest.fail(function(oResponse) {
                        // do not use MessageSupportView here to avoid marking the comments field red
                        var aMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "comment");
                        if (aMessages) {
                            oApp.addNotificationMessages(aMessages);
                        }
                    });
                    oDelRequest.always(function() {
                        oView.setBusy(false);
                    });
                }
            };

            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_IDEA_COMMENTS_INS_DELETE_COMMENT"), fnDeleteComment, i18n.getText("BO_IDEA_COMMENTS_TIT_DELETE_COMMENT"));
        },

        updateComment : function(oEvent) {
            var that = this;
            var oView = this.getView();
            var oMasterView;
            if (this.getThingInspectorView) {
                var oMasterView = this.getThingInspectorView();
            } else {
                oMasterView = oView;
            }
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

            oMasterView.removeAllMessages();
            oApp.removeNotificationMessages();

            var iCommentId = oEvent.getParameter("commentId");
            var sComment = oEvent.getParameter("comment");

            if (sComment && sComment.length > 0) {
                oView.setBusy(true);
                var oUpdateRequest = this.getAOFObject().update(iCommentId, {
                        COMMENT : sComment
                    });
                 
                oUpdateRequest.done(function() {
                    oView.refreshComments();
                });

                oUpdateRequest.fail(function(oResponse) {
                    // do not use MessageSupportView here to avoid marking the comments field red
                    var aMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "comment");
                    if (aMessages) {
                        oApp.addNotificationMessages(aMessages);
                    }
                });

                oUpdateRequest.always(function() {
                    oView.setBusy(false);
                });

            } else {
                var oMessageParameters = {
                    key : "MSG_COMMENT_TEXT_MANDATORY",
                    level : sap.ui.core.MessageType.Error,
                    referenceControl : oEvent.getSource().getTextArea(),
                    group : "idea"
                };
                var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                oApp.addNotificationMessage(oMessage);
                oMasterView.addMessage(oMessage);
            }
        }

    }
})();