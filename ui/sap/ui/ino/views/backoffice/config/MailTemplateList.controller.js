/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.models.object.MailTemplateStage");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.config.MailTemplateList",
       jQuery.extend({},sap.ui.ino.views.common.MasterDetailController,
            {
                getSettings : function() {
                    var mSettings = {
                        aRowSelectionEnabledButtons : ["BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                        mTableViews : {
                            "staging" : {
                                "default" : true,
                                sBindingPathTemplate : "/StagingMailTemplateSearchParams(searchToken='{searchTerm}')/Results",
                                oSorter : new sap.ui.model.Sorter("CODE", false),
                                aVisibleActionButtons : ["BUT_CREATE", "BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                                aVisibleColumns : ["CODE", "PACKAGE_ID", "DEFAULT_TEXT",
                                                   "DEFAULT_LONG_TEXT", "CREATED_AT", "CREATED_BY",
                                                   "CHANGED_AT", "CHANGED_BY"]
                            }
                        },
                        sApplicationObject : "sap.ui.ino.models.object.MailTemplateStage"
                    };

                    return mSettings;
                },

                hasPendingChanges : function() {
                    if (this.oActiveDialog) {
                        return this.oActiveDialog.getContent()[0].hasPendingChanges();
                    }
                    return false;
                },

                onCreatePressed : function() {
                  this.openMailTemplateModifyDialog("{i18n>BO_MAIL_TEMPLATE_TIT_DIALOG_CREATE}", -1, true);
                },
                
                onNavigateToMailTemplate : function(iId) {
                    this.openMailTemplateModifyDialog("{i18n>BO_MAIL_TEMPLATE_TIT_DIALOG_MODIFY}", iId, false);
                },

                onEditPressed : function() {
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }
                    this.openMailTemplateModifyDialog("{i18n>BO_MAIL_TEMPLATE_TIT_DIALOG_MODIFY}", iId, true);
                },
                
                onCopyAsPressed : function(){
                    var oView = this.getView();
                    var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
                    var oBindingContext = oView.getSelectedRowContext();
                    if (oBindingContext) {
                        var sPlainCode = oBindingContext.getObject().CODE;
                        sPlainCode = sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sPlainCode);
                        var sPrefix = oBundle.getText("BO_MAIL_TEMPLATE_COPY_CODE_PREFIX");
                        sPlainCode = sPrefix + sPlainCode;
                        oView.oCopyAsCodeField.setValue(sPlainCode);
                        oView.oCopyAsDialog.open();
                    }
                },
                
                onCopyPressed : function(sCopyCode) {
                    sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("configuration_mail_template");
                    
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }
                    var oView = this.getView();
                    oView.setBusy(true);
                    this._hideDetailsView();
                    var that = this;
                    
                    var oCopyRequest = sap.ui.ino.models.object.MailTemplateStage.copy(iId, {
                        ID : -1,
                        PLAIN_CODE : sCopyCode,
                    });

                    oCopyRequest.always(function() {
                        oView.setBusy(false);
                    });

                    oCopyRequest.done(function(oResponse) {
                        that.openMailTemplateModifyDialog("{i18n>BO_MAIL_TEMPLATE_TIT_DIALOG_MODIFY}", oResponse.GENERATED_IDS[-1], true);

                        // wait a moment before displaying and rerendering
                        setTimeout(function() {
                            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                            var oMessageParameters = {
                                key : "MSG_MAIL_TEMPLATE_COPIED",
                                level : sap.ui.core.MessageType.Success,
                                parameters : [],
                                group : "configuration_mail_template",
                                text : oMsg.getResourceBundle().getText("MSG_MAIL_TEMPLATE_COPIED")
                            };

                            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                            oApp.addNotificationMessage(oMessage);
                        }, 500);
                        oView.getCopyAsDialog().close();
                    });

                    oCopyRequest.fail(function(oResponse) {
                    	oView.getController()._handleCopyFail(oResponse);
                    });
                },

                onDeletePressed : function() {
                    sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("configuration_mail_template");
                    
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }

                    var that = this;
                    function deleteInstance(bResult) {
                        if (bResult) {
                            var oDeleteRequest = sap.ui.ino.models.object.MailTemplateStage.del(iId);
                            that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
                            oDeleteRequest.done(function() {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                                var oMessageParameters = {
                                    key : "MSG_MAIL_TEMPLATE_DELETED",
                                    level : sap.ui.core.MessageType.Success,
                                    parameters : [],
                                    group : "configuration_mail_template",
                                    text : oMsg.getResourceBundle().getText("MSG_MAIL_TEMPLATE_DELETED")
                                };

                                var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                                var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                                oApp.addNotificationMessage(oMessage);                            
                            });
                        }
                    };

                    var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
                    sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_MAIL_TEMPLATE_INS_DEL"),
                            deleteInstance, oBundle.getText("BO_MAIL_TEMPLATE_TIT_DEL"));
                },

                executeActionRequest : function(oActionRequest, oTriggerButton, bRevalidate) {
                    var oView = this.getView();
                    // Not all views are message-enabled
                    if(oView.removeAllMessages) {
                    	oView.removeAllMessages("configuration_mail_template");
                    }
                    sap.ui.ino.application.backoffice.Application.getInstance()
                            .removeNotificationMessages("configuration_mail_template");

                    if (oTriggerButton) {
                        oTriggerButton.setBusy(true);
                    }
                    var that = this;
                    oActionRequest.done(function() {
                        if (oTriggerButton) {
                            oTriggerButton.setBusy(false);
                        }
                    });
                    oActionRequest
                            .fail(function(oResponse) {
                                if (oTriggerButton) {
                                    oTriggerButton.setBusy(false);
                                }
                                var aActionMessages = sap.ui.ino.models.core.MessageSupport
                                        .convertBackendMessages(oResponse.MESSAGES, oView,
                                                "configuration_mail_template");
                                if (aActionMessages) {
                                    // Not all views are message-enabled
                                    if(oView.addMessages) {
                                    	oView.addMessages(aActionMessages);
                                    }
                                    sap.ui.ino.application.backoffice.Application.getInstance()
                                            .addNotificationMessages(aActionMessages);
                                }
                            });
                },

                updatePropertyModel : function() {
                    var oSelectedRowContext = this.getSelectedRowContext();
                    var oView = this.getView();
                    var oPropertyModel;
                    if (oSelectedRowContext) {                       
                        var iMailTemplateId = oSelectedRowContext.getObject().ID;
                        oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                                "sap.ino.xs.object.notification.MailTemplateStage", iMailTemplateId, {
                                	staticActions : [{"create": {}}],
                                    actions : ["create", "update", "copy", "del"]
                                });                       
                    } else {
                    	oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                                "sap.ino.xs.object.notification.MailTemplateStage", 0, {
                                	staticActions : [{"create": {}}],
                                    actions : ["create", "update", "copy", "del"]
                                });                      
                    }
                    oView.setModel(oPropertyModel, "property");
                },
                
                openMailTemplateModifyDialog : function(sTitle, iId, bEdit) {
                    if (!iId) {
                        iId = this.getSelectedId();
                    }
                    if (!iId) {
                        return;
                    }
                    this._hideDetailsView();
                    var that = this;
                    var sMode = "display";
                    if(bEdit == true){
                        sMode = "edit";
                    }
                    var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.MailTemplateModify");
                    oModifyView.show(iId, sMode);
                },
                
                _handleCopyFail : function(oResponse){
                	var oView = this.getView();
                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                    var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "configuration_mail_template");
                    if(aActionMessages){
                    	var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                        jQuery.each(aActionMessages, function(iIndex, oMessage){
                            oMessage.setReferenceControl(oView.getCopyAsCodeField());
                            oApp.addNotificationMessage(oMessage);
                        	oMessage.showValueState();
                        });
                    }else{
                    	var oMessageParameters = {
                                key : "MSG_MAIL_TEMPLATE_COPY_FAILURE",
                                level : sap.ui.core.MessageType.Error,
                                parameters : [],
                                group : "configuration_mail_template",
                                text : "MSG_MAIL_TEMPLATE_COPY_FAILURE"
                        };
                        var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                        var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                        oApp.addNotificationMessage(oMessage);
                		oView.getCopyAsDialog().close();
                    }
                }
            }));