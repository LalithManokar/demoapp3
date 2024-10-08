/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.models.object.CampaignPhaseStage");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.config.CampaignPhaseList",
       jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController,
            {
                 getSettings : function() {
                    var mSettings = {
                        aRowSelectionEnabledButtons : ["BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                        mTableViews : {
                            "staging" : {
                                "default" : true,
                                sBindingPathTemplate : "/StagingPhaseSearchParams(searchToken='{searchTerm}')/Results",
                                oSorter : new sap.ui.model.Sorter("CODE", false),
                                aVisibleActionButtons : ["BUT_CREATE", "BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                                aVisibleColumns : ["CODE", "PACKAGE_ID", "DEFAULT_TEXT",
                                                   "DEFAULT_LONG_TEXT", "CREATED_AT", "CREATED_BY",
                                                   "CHANGED_AT", "CHANGED_BY"]
                            }
                        },
                        sApplicationObject : "sap.ui.ino.models.object.CampaignPhaseStage"
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
                  this.openPhaseModifyDialog("{i18n>BO_PHASE_TIT_DIALOG_CREATE}", -1, true);
                },

                onNavigateToPhase : function(iId) {
                    this.openPhaseModifyDialog("{i18n>BO_PHASE_TIT_DIALOG_MODIFY}", iId, false);
                },
                
                onEditPressed : function() {
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }
                    this.openPhaseModifyDialog("{i18n>BO_PHASE_TIT_DIALOG_MODIFY}", iId, true);
                },
                
                onCopyAsPressed : function(){
                    var oView = this.getView();
                    var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
                    var oBindingContext = oView.getSelectedRowContext();
                    if (oBindingContext) {
                        var sPlainCode = oBindingContext.getObject().CODE;
                        sPlainCode = sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sPlainCode);
                        var sPrefix = oBundle.getText("BO_PHASE_COPY_CODE_PREFIX");
                        sPlainCode = sPrefix + sPlainCode;
                        oView.oCopyAsCodeField.setValue(sPlainCode);
                        oView.oCopyAsDialog.open();
                    }
                },
                
                onCopyPressed : function(sCopyCode) {
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }
                    var oView = this.getView();
                    oView.setBusy(true);
                    this._hideDetailsView();
                    var that = this;
                    
                    var oCopyRequest = sap.ui.ino.models.object.CampaignPhaseStage.copy(iId, {
                        ID : -1,
                        PLAIN_CODE : sCopyCode,
                    });

                    oCopyRequest.always(function() {
                        oView.setBusy(false);
                    });

                    oCopyRequest.done(function(oResponse) {
                        that.openPhaseModifyDialog("{i18n>BO_PHASE_TIT_DIALOG_MODIFY}", oResponse.GENERATED_IDS[-1], true);

                        // wait a moment before displaying and rerendering
                        setTimeout(function() {
                            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                            var oMessageParameters = {
                                key : "MSG_PHASE_COPIED",
                                level : sap.ui.core.MessageType.Success,
                                parameters : [],
                                group : "group",
                                text : oMsg.getResourceBundle().getText("MSG_PHASE_COPIED")
                            };

                            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                            oApp.addNotificationMessage(oMessage);
                        }, 500);
                        oView.oCopyAsDialog.close();
                    });

                    oCopyRequest.fail(function(oResponse) {
                    	oView.getController()._handleCopyFail(oResponse);
                    });
                },

                onDeletePressed : function() {
                    sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("configuration_phase");
                    
                    var iId = this.getSelectedId();
                    if (!iId) {
                        return;
                    }

                    var that = this;
                    function deleteInstance(bResult) {
                        if (bResult) {
                            var oDeleteRequest = sap.ui.ino.models.object.CampaignPhaseStage.del(iId);
                            that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
                            oDeleteRequest.done(function() {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                                var oMessageParameters = {
                                    key : "MSG_PHASE_DELETED",
                                    level : sap.ui.core.MessageType.Success,
                                    parameters : [],
                                    group : "configuration_phase",
                                    text : oMsg.getResourceBundle().getText("MSG_PHASE_DELETED")
                                };

                                var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                                var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                                oApp.addNotificationMessage(oMessage);
                            });
                        }
                    };

                    var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
                    sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_PHASE_INS_DEL"),
                            deleteInstance, oBundle.getText("BO_PHASE_TIT_DEL"));
                },

                executeActionRequest : function(oActionRequest, oTriggerButton, bRevalidate, sGroup) {
                    var oView = this.getView();
                    // Not all views are message-enabled
                    if(oView.removeAllMessages) {
                    	oView.removeAllMessages(sGroup);
                    }
                    sap.ui.ino.application.backoffice.Application.getInstance()
                            .removeNotificationMessages(sGroup);

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
                                                sGroup);
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
                        var iPhaseId = oSelectedRowContext.getObject().ID;
                        oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                                "sap.ino.xs.object.campaign.PhaseStage", iPhaseId, {
                                	staticActions : [{"create": {}}],
                                	actions : ["create", "update", "copy", "del"]
                                });
                       
                    }  else {
                    	oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                                "sap.ino.xs.object.campaign.PhaseStage", 0, {
                                	staticActions : [{"create": {}}],
                                	actions : ["create", "update", "copy", "del"]
                                });
                    }     
                    oView.setModel(oPropertyModel, "property");
                },
                
                openPhaseModifyDialog : function(sTitle, iId, bEdit) {
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
                    var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.CampaignPhaseModify");
                    oModifyView.show(iId, sMode);
                },
                
                _handleCopyFail : function(oResponse){
                	var oView = this.getView();
                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                    var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "group");
                    if(aActionMessages){
                    	var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                        jQuery.each(aActionMessages, function(iIndex, oMessage){
                            oMessage.setReferenceControl(oView.getCopyAsCodeField());
                            oApp.addNotificationMessage(oMessage);
                        	oMessage.showValueState();
                        });
                    }else{
                    	var oMessageParameters = {
                                key : "MSG_PHASE_COPY_FAILURE",
                                level : sap.ui.core.MessageType.Error,
                                parameters : [],
                                group : "group",
                                text : "MSG_PHASE_COPY_FAILURE"
                        };
                        var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                        var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                        oApp.addNotificationMessage(oMessage);
                        oView.getCopyAsDialog().close();
                    }
                }
            }));