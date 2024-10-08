/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.controls.MessageLog");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignAdvanceChange", jQuery.extend({},
        sap.ui.ino.views.common.MessageSupportView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.campaign.CampaignAdvanceChange";
            },

            init : function() {
                this.initMessageSupportView();
            },

            exit : function() {
                this.exitMessageSupportView();
                sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
            },
            
            setContent : function(aContent) {
            	var oView = this;
            	jQuery.each(aContent, function(iIdx, oValue) {
            		oView.oContent.insertContent(oValue, iIdx);
            	});
            },

            createContent : function(oController) {
                var oView = this;
                this.oContent = new sap.ui.layout.VerticalLayout();
                
                sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");

                var oNote = new sap.ui.ino.controls.MessageLog({
                    messages : "{" + this.MESSAGE_LOG_MODEL_NAME + ">/messages}",
                    groups : ["campaignAdvanceChangeNote"]
                }).addStyleClass("sapUiInoAdvanceChangeNote");

                this.oContent.addContent(oNote);

                return this.oContent;
            },

            addDialogButtons : function(oDialog, bEnableConfirm) {
                this.oDialog = oDialog;
                var oController = this.getController();
                this.oConfirmButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_COMMON_BUT_APPLY_CHANGES}",
                    press : function() {
                        oController.onApplyChanges();
                    },
                    enabled : bEnableConfirm
                });

                oDialog.addButton(this.oConfirmButton);

                oDialog.addButton(new sap.ui.commons.Button({
                    text : "{i18n>BO_COMMON_BUT_CANCEL}",
                    press : function() {
                        oController.onCancel();
                    }
                }));
            },
            
            enableButtons : function(bEnable) {
                var aButtons = this.oDialog.getButtons();
                jQuery.each(aButtons, function(iIdx, oButton) {
                    oButton.setEnabled(bEnable);
                });
            },

            setOnApplyChangesCallback : function(fnCallback, oHandler) {
            	this.getController()._fnCallback = fnCallback;
            	this.getController()._oCallbackHandler = oHandler;
            }
        }));