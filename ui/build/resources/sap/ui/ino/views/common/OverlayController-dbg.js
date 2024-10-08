/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.OverlayController");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

(function() {

    var MessageParam = {
        Group : "group",
        SuccessKey : "success",
        Create : "create",
        Save : "save",
        Delete : "del",
        Title : "title",
        Dialog : "dialog"
    };

    sap.ui.ino.views.common.OverlayController = {

        onInit : function() {
            sap.ui.ino.application.backoffice.Application.getInstance().setActiveOverlay(this.getView());
        },

        onExit : function() {
            sap.ui.ino.application.backoffice.Application.getInstance().clearActiveOverlay();
        },

        hasPendingChanges : function() {
            if (this.getModel()) {
                return this.getModel().hasPendingChanges();
            } else {
                return false;
            }
        },

        actionSelected : function(oEvent) {
            var oAction = oEvent.getParameter("action");
            oAction.fireSelect({
                id : oAction.getId(),
                action : oAction
            });

            // keep the focus in the action bar
            var oOverlay = this.oView.getOverlay();
            if (oOverlay) {
                var oActionBar = oOverlay.getActionBar();

                if (oActionBar) {
                	var aActionButtons = oActionBar.getAggregation("_businessActionButtons");
                	if (aActionButtons && aActionButtons.length > 0) {
                        aActionButtons[0].focus();                        
                    }
                }
            }
        },

        viewSelected : function(oEvent, sViewKey) {
        },

        viewSelectedCallback : function(oEvent) {
        },

        close : function(oEvent) {
            if (oEvent) {
                oEvent.preventDefault();
            }
            var oView = this.oView;
            var oController = oView.getController();
            oController.closeFunction(oView);
        },

        closeFunction : function(oView) {
            var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
            oApp.isNavigationAllowed(function() {
                oView.close();
            });
        },

        openNew : function(oEvent) {
            var oView = this.getView();
            sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(oView.sType.toLowerCase(), {
                id : this.getModelKey(),
                mode : this.getMode()
            });
        },

        onEnterEditMode : function() {
            // Users can override to subscribe
        },

        onExitEditMode : function() {
            // Users can override to subscribe
        },

        initModel : function(iId, sCode) {
            // We need the model in any case for the header content on the side
            var bModelwasInitial = (this.oModel == null);
            if (sCode == undefined) {
                iId = iId || this.getModelKey();
            }
            this.createModel(iId, sCode);
            this.bindInstance(bModelwasInitial);
        },

        getModel : function() {
            return this.oModel;
        },

        getModelKey : function() {
            return this.oModel && this.oModel.getKey();
        },

        createModel : function(iId, sCode) {
            if (this.oModel == null) {
                jQuery.sap.log
                        .warning(
                                "createModel() is not implemented in the generic ThingInspector "
                                        + "since the Write Model is specific to the entity being written. Please override this method in your implementation",
                                undefined, "sap.ui.ino.views.common.OverlayController");
                this.oModel = null; //redefine that
            }
            return this.oModel;
        },

        setMode : function(sMode) {
            if (sMode == null || sMode == "") {
                sMode = "display";
            }
            if (sMode == "display" || sMode == "edit") {
                if (this.sMode !== sMode) {
                    if (this.sMode == "edit") {
                        //switch from edit to display
                        this.onExitEditMode();
                    } else {
                        //switch from display to edit
                        this.onEnterEditMode();
                    }
                    this.sMode = sMode;
                    this.triggerModeSwitch();
                }
            } else {
                jQuery.sap.log.warning(
                        "SetMode was called on a ThingInspector with an invalid mode argument: " + sMode, undefined,
                        "sap.ui.ino.views.common.OverlayController");
            }
        },

        revalidate : function() {
            this.bindInstance(false);
        },

        bindInstance : function(bInit) {
            var oOverlay = this.getView().getOverlay();
            if (oOverlay) {
                oOverlay.setModel(this.getModel(), this.sModelName);
            }
        },

        onModeSwitch : function(newMode) {
            // Users can override to subscribe
        },

        triggerModeSwitch : function() {
            var oView = this.getView();
            var oOverlay = oView.getOverlay();
            if (oOverlay != null) {
                oView.refresh();
                oView.initActions();
            }
        },

        getMode : function() {
            return this.sMode;
        },

        isInMode : function(sMode) {
            return (this.sMode === sMode);
        },

        isInEditMode : function() {
            return this.isInMode("edit");
        },

        setEditMode : function(bEdit) {
            if (bEdit) {
                this.setMode("edit");
            } else {
                this.setMode("display");
            }
        },

        sTextModelPrefix : "i18n>",
        sCodeModelPrefix : "code>",

        sModelPrefix : "applicationObject>",
        sModelName : "applicationObject",

        getTextModelPrefix : function() {
            return this.sTextModelPrefix;
        },

        getCodeModelPrefix : function() {
            return this.sCodeModelPrefix;
        },

        getTextModel : function() {
            if (this.i18n == null) {
                this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            }
            return this.i18n;
        },

        getTextModelLanguageKey : function() {
            if (!this._sLanguageKey) {
                var sLanguageKey = this.getTextModel().sLocale;
                sLanguageKey = sLanguageKey.replace("_", "-");
                var iIdx = sLanguageKey.indexOf("-");
                if (iIdx != -1) {
                    sLanguageKey = sLanguageKey.substring(0, iIdx);
                }
                this._sLanguageKey = sLanguageKey;
            }

            return this._sLanguageKey;
        },

        getModelPrefix : function() {
            return this.sModelPrefix;
        },

        getModelName : function() {
            return this.sModelName;
        },

        getBoundPath : function(oBinding, absolute) {
            if (absolute)
                return "{" + this.getModelPrefix() + "/" + oBinding + "}";
            else
                return "{" + this.getModelPrefix() + oBinding + "}";
        },

        getBoundObject : function(oBinding, absolute, oType) {
            if (oType) {
                if (absolute) {
                    return {
                        path : this.getModelPrefix() + "/" + oBinding,
                        type : oType
                    };
                } else {
                    return {
                        path : this.getModelPrefix() + oBinding,
                        type : oType
                    };
                }
            } else {
                if (absolute) {
                    return {
                        path : this.getModelPrefix() + "/" + oBinding
                    };
                } else {
                    return {
                        path : this.getModelPrefix() + oBinding
                    };
                }
            }
        },

        getFormatterPath : function(oBinding, absolute) {
            if (absolute)
                return this.getModelPrefix() + "/" + oBinding;
            else
                return this.getModelPrefix() + oBinding;
        },

        getTextPath : function(oBinding) {
            return "{" + this.getTextModelPrefix() + oBinding + "}";
        },

        onCancel : function() {
            var oModel = this.getModel();
            var that = this;
            var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
            oApp.isNavigationAllowed(function() {
                if (!oModel.isNew()) {
                    oModel.revertChanges();
                    that.setEditMode(false);
                } else {
                    that.closeFunction(that.oView);
                }
            });
        },

        onEdit : function() {
            this.setEditMode(true);
            this.bindInstance();
            this.getView().oOverlay.destroyHeaderContent();
            this.getView().createContent();
        },

        onChange : function() {
            if (typeof this._fnChangeCallback === "function") {
                this._fnChangeCallback();
            }
        },

        onDelete : function() {
            this.onModelAction(this.getModel().del, MessageParam.Delete, true, true);
        },

        onSave : function() {
            this.onModelAction(this.getModel().modify, MessageParam.Save, true, false);
        },

        onModelAction : function(fnAction, sSection, bChange, bClose) {
            var oView = this.getView();
            var that = this;
            var oModel = this.getModel();
            var bMessageGroup = false;

            if (this.mMessageParameters[MessageParam.Group]) {
                bMessageGroup = true;
                sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages();
            } else {
                jQuery.sap.log.warning("No message group defined, message handling disabled", null,
                        "sap.ui.ino.views.common.OverlayController");
            }

            function fnRun(bResult) {
                if (bResult) {
                    if (oModel) {
                        oView.setBusy(true);

                        var oRequest = fnAction.apply(oModel);

                        oRequest.always(function(oResponse) {
                            oView.setBusy(false);
                        });

                        oRequest.done(function(oResponse) {

                            if (bChange) {
                                that.onChange();
                            }
                            if (bClose) {
                                that.close();
                            }

                            if (bMessageGroup && that.mMessageParameters[sSection]
                                    && that.mMessageParameters[sSection][MessageParam.SuccessKey]) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                                var oMessageParameters = {
                                    key : that.mMessageParameters[sSection][MessageParam.SuccessKey],
                                    level : sap.ui.core.MessageType.Success,
                                    parameters : [],
                                    group : that.mMessageParameters[MessageParam.Group],
                                    text : oMsg.getResourceBundle().getText(
                                            that.mMessageParameters[sSection][MessageParam.SuccessKey])
                                };

                                var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                                var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                                oApp.addNotificationMessage(oMessage);
                            }

                            var oEvtBus = sap.ui.getCore().getEventBus();
                            oEvtBus.publish(that.oView.getControllerName(), "model_" + sSection, {
                                bSuccess : true
                            });
                        });

                        oRequest.fail(function(oResponse) {
                            if (oResponse.MESSAGES && bMessageGroup) {
                                for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                                    var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(
                                            oResponse.MESSAGES[i], that.getView(),
                                            that.mMessageParameters[MessageParam.Group]);
                                    oView.addMessage(oMessage);
                                    sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(
                                            oMessage);
                                }
                            }

                            var oEvtBus = sap.ui.getCore().getEventBus();
                            oEvtBus.publish(that.oView.getControllerName(), "model_" + sSection, {
                                bSuccess : false
                            });
                        });
                    }
                }
            };

            if (this.mMessageParameters[sSection] && this.mMessageParameters[sSection][MessageParam.Dialog]
                    && this.mMessageParameters[sSection][MessageParam.Title]) {
                var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
                sap.ui.ino.controls.MessageBox.confirm(oBundle
                        .getText(this.mMessageParameters[sSection][MessageParam.Dialog]), fnRun, oBundle
                        .getText(this.mMessageParameters[sSection][MessageParam.Title]));
            } else {
                fnRun(true);
            }
        },
    };

    sap.ui.ino.views.common.OverlayController.MessageParam = MessageParam;

})();