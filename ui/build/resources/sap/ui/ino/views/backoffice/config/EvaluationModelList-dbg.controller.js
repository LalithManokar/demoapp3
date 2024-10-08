/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.object.EvaluationModelStage");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.config.EvaluationModelList", jQuery.extend({},
        sap.ui.ino.views.common.MasterDetailController, {
            getSettings : function() {
                var mSettings = {
                    aRowSelectionEnabledButtons : ["BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                    mTableViews : {
                        "staging" : {
                            "default" : true,
                            sBindingPathTemplate : "/StagingEvaluationModelSearchParams(searchToken='{searchTerm}')/Results",
                            oSorter : new sap.ui.model.Sorter("CODE", false),
                            aVisibleActionButtons : ["BUT_CREATE", "BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
                            aVisibleColumns : ["CODE", "PACKAGE_ID", "DEFAULT_TEXT",
                                    "DEFAULT_LONG_TEXT", "CREATED_AT", "CREATED_BY",
                                    "CHANGED_AT", "CHANGED_BY"]
                        }
                    },
                    sApplicationObject : "sap.ui.ino.models.object.EvaluationModelStage"
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
                this.onNavigateToModel(-1, true);
            },

            onNavigateToModel : function(iId, bEdit) {
                if (!iId) {
                    iId = this.getSelectedId();
                }
                if (!iId) {
                    return;
                }
                this._hideDetailsView();
                var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelModify");
                var sMode = "display";
                if(bEdit === true){
                    sMode = "edit";
                }
                oModifyView.show(iId, sMode);
            },

            onEditPressed : function() {
                this.onNavigateToModel(undefined, true);
            },
            
            onCopyAsPressed : function(){
                var oView = this.getView();
                var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
                var oBindingContext = oView.getSelectedRowContext();
                if (oBindingContext) {
                    var sPlainCode = oBindingContext.getObject().CODE;
                    sPlainCode = sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sPlainCode);
                    var sPrefix = oBundle.getText("BO_MODEL_COPY_CODE_PREFIX");
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
                
                var oCopyRequest = sap.ui.ino.models.object.EvaluationModelStage.copy(iId, {
                    ID : -1,
                    PLAIN_CODE : sCopyCode
                });

                oCopyRequest.always(function() {
                    oView.setBusy(false);
                });

                oCopyRequest.done(function(oResponse) {
                    that.onNavigateToModel(oResponse.GENERATED_IDS[-1], true);

                    // wait a moment before displaying and rerendering
                    setTimeout(function() {
                        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                        var oMessageParameters = {
                            key : "MSG_MODEL_COPIED",
                            level : sap.ui.core.MessageType.Success,
                            parameters : [],
                            group : "configuration_evaluation",
                            text : oMsg.getResourceBundle().getText("MSG_MODEL_COPIED")
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
                sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("configuration_evaluation");
                
                var iId = this.getSelectedId();
                if (!iId) {
                    return;
                }

                var that = this;
                function deleteInstance(bResult) {
                    if (bResult) {
                        var oDeleteRequest = sap.ui.ino.models.object.EvaluationModelStage.del(iId);
                        that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
                        oDeleteRequest.done(function() {                            
                            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                            var oMessageParameters = {
                                key : "MSG_MODEL_DELETED",
                                level : sap.ui.core.MessageType.Success,
                                parameters : [],
                                group : "configuration_evaluation",
                                text : oMsg.getResourceBundle().getText("MSG_MODEL_DELETED")
                            };

                            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                            oApp.addNotificationMessage(oMessage);
                        });
                    }
                }

                var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
                sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_MODEL_INS_DEL"),
                        deleteInstance, oBundle.getText("BO_MODEL_TIT_DEL"));                
            },
            
            updatePropertyModel : function() {
                var oSelectedRowContext = this.getSelectedRowContext();
                var oView = this.getView();
                var oPropertyModel;
                if (oSelectedRowContext) {
                    var iModelId = oSelectedRowContext.getObject().ID;
                    oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                            "sap.ino.xs.object.evaluation.ModelStage", iModelId, {
                            	staticActions : [{"create": {}}],
                                actions : ["update", "copy", "del"],
                            });                    
                } else {
                	oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
                            "sap.ino.xs.object.evaluation.ModelStage", 0, {
                            	staticActions : [{"create": {}}],
                                actions : ["update", "copy", "del"]
                    });                    
                } 
                oView.setModel(oPropertyModel, "property");
            },
            
            _handleCopyFail : function(oResponse){
            	var oView = this.getView();
                var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "configuration_evaluation");
                var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                if(aActionMessages){
                    jQuery.each(aActionMessages, function(iIndex, oMessage){
                        oMessage.setReferenceControl(oView.getCopyAsCodeField());
                        oApp.addNotificationMessage(oMessage);
                    	oMessage.showValueState();
                    });
                }else{
                	var oMessageParameters = {
                            key : "MSG_MODEL_COPY_FAILURE",
                            level : sap.ui.core.MessageType.Error,
                            parameters : [],
                            group : "configuration_evaluation",
                            text : "MSG_MODEL_COPY_FAILURE"
                    };
                    var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                    oApp.addNotificationMessage(oMessage);
                    oView.getCopyAsDialog().close();
                }
            }
        }));