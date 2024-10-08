/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.OverlayView");
jQuery.sap.require("sap.ui.ino.controls.OverlayContainer");
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

(function() {

    var Mode = {
        Display : "display",
        Edit : "edit"
    };

    sap.ui.ino.views.common.OverlayView = jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {
        init: function() {
            this.initMessageSupportView();
        },

        exit: function() {
            this.exitMessageSupportView();
            sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
        },

        hasPendingChanges : function() {
            return this.getController().hasPendingChanges();
        },

        addStandardButtons : function(oDisplay) {
            oDisplay = oDisplay ? oDisplay : {
                save : true,
                edit : true,
                cancel : true,
                del : true
            };

            var oController = this.getController();

            if (oDisplay.edit) {
                var oEditButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_TI_BUT_EDIT}",
                    enabled : this.getBoundPath("property/actions/update/enabled", true),
                    tooltip : {
                        path : this.getFormatterPath("property/actions/update/messages", true),
                        formatter : function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                        .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select : [oController.onEdit, oController]
                });
                this.addAction(oEditButton, true);
            }

            if (oDisplay.save) {
                var oSaveButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_TI_BUT_SAVE}",
                    //enabled : this.getBoundPath("property/actions/modify/enabled", true),
                    tooltip : {
                        //path : this.getFormatterPath("property/actions/modify/messages", true),
                        formatter : function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                        .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select : [oController.onSave, oController]
                });
                this.addAction(oSaveButton, false, true);
            }

            if (oDisplay.del) {
                var oDeleteButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_TI_BUT_DELETE}",
                    enabled : this.getBoundPath("property/actions/del/enabled", true),
                    tooltip : {
                        path : this.getFormatterPath("property/actions/del/messages", true),
                        formatter : function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                        .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select : [oController.onDelete, oController]
                });
                this.addAction(oDeleteButton, false, true);
            }

            if (oDisplay.cancel) {
                this.addAction("BO_TI_BUT_CANCEL", oController.onCancel, false, true);
            }
        },

        createContent : function(oController) {
            return null; // Does nothing since the TI is not part of the normal view hierarchy
        },

        createHeaderContent : function(oController) {
            return []; // Implementations should create and return their headercontent from here
        },

        beforeOverlayInit : function() {
            // Empty, users are responsible for initializing their overlay settings here
            // Exists only so call doesn't fail if user doesn't implement
        },

        afterOverlayInit : function() {
            // Empty, users are responsible for setting the overlay context here (model and instance binding)
            // Exists only so call doesn't fail if user doesn't implement
        },

        afterOverlayShow : function() {
            // Empty, users are responsible for setting the overlay context here (model and instance binding)
            // Exists only so call doesn't fail if user doesn't implement
        },

        close : function() {
            var oController = this.getController();
            var oOverlay = this.getOverlay();
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

            var oModel = oController.getModel();
            if (oModel) {
                oModel.revertChanges();
            }

            if (this.onBeforeClose) {
                this.onBeforeClose();
            }

            if (this.bHistoryNav) {
                oApp.navigateBack();
            }

            oApp.showDelayedNotificationMessages();

            if (oOverlay.isOpen()) {
                oOverlay.close();
            }

            if (this.oOverlay !== null) {
                this.oOverlay.destroy();
            }
            for (var key in this.oFacets) {
                if (this.oFacets.hasOwnProperty(key)) {
                    this.oFacets[key].destroy();
                }
            }

            this.destroyActions();
            this.aActions = {
                display: [],
                edit: []
            };
            this.oSettings = {};

            if (this.sHelpContext) {
                sap.ui.ino.application.backoffice.Application.getInstance().popHelpContext();
            }

            if (this._sPreviousFocusId) {
                jQuery.sap.byId(this._sPreviousFocusId).focus();
                this._sPreviousFocusId = undefined;
            }

            this.fireEvent("close");
            this.destroy();
        },

        bindElement : function(sPath, mParameters) {
            sap.ui.core.mvc.View.prototype.bindElement.apply(this, arguments);
            if (this.oOverlay) {
                this.oOverlay.bindElement(sPath, mParameters);
            } else {
                this._oPendingViewElementBinding = {
                    path : sPath,
                    parameters : mParameters
                };
            }
        },

        createRow : function(sLabel, iLabelSpan, oControl, iControlSpan, sTooltip) {

            sTooltip = sTooltip || sLabel;

            if (Object.prototype.toString.call(iLabelSpan) != "[object Number]") {
                oControl = iLabelSpan;
                iLabelSpan = 1;
                iControlSpan = 1;
            }

            if (typeof oControl === "string") {
                oControl = new sap.ui.commons.TextView({
                    text : oControl
                });
            }

            var oLabel = new sap.ui.commons.Label({
                text : sLabel,
                textAlign : sap.ui.core.TextAlign.End,
                wrapping : true,
                tooltip : sTooltip,
                labelFor : oControl
            });
            var oMLCell1 = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.End,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [oLabel],
                colSpan : iLabelSpan
            });
            var oMLCell2 = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                separation : sap.ui.commons.layout.Separation.Small,
                content : [oControl],
                colSpan : iControlSpan
            });

            if (oControl.addAriaLabelledBy) {
                if (oControl.removeAllAriaLabelledBy) {
                    oControl.removeAllAriaLabelledBy();
                }
                oControl.addAriaLabelledBy(oLabel);
            }

            return new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [oMLCell1, oMLCell2]
            });
        },

        addAction : function(vAction, fnCallback, bDisplayShow, bEditShow) {
            var oAction;

            if (typeof vAction == "string") {
                oAction = new sap.ui.commons.Button({
                    text : this.getText(vAction)
                });

                oAction.attachPress(fnCallback, this.getController());
            } else {
                oAction = vAction;
                bEditShow = bDisplayShow;
                bDisplayShow = fnCallback;
            }

            if (bDisplayShow) {
                this.aActions[Mode.Display].push(oAction);
            }
            if (bEditShow) {
                this.aActions[Mode.Edit].push(oAction);
            }

            return oAction;
        },

        initActions : function() {
            var aActions = this.aActions[this.getController().getMode()];

            this.oOverlay.removeAllActions();

            for (var i = 0; i < aActions.length; i++) {
                this.oOverlay.addAction(aActions[i]);
            }
        },

        createOverlay : function() {
            var oController = this.getController();
            // Merge Users Settings with standard functions
            var finalSettings = {};
            jQuery.extend(finalSettings, {
                openNew : [oController.openNew, oController],
                actionSelected : this.getController().actionSelected,
                actions : this.aActions[this.getController().getMode()],
                close : this.getController().close
            }, this.oSettings);
            this.oOverlay = new sap.ui.ino.controls.OverlayContainer(this.createId("TI"), finalSettings);
            this.oOverlay.oView = this;
            this.oOverlay.addStyleClass("sapUiInoOverlay");
            this.executeViewElementBinding();
            this.getController().bindInstance();
            return this.oOverlay;
        },

        executeViewElementBinding : function() {
            // the view element binding might have been done *before* 
            // the overlay has been created thus we re-do it
            if (this._oPendingViewElementBinding) {
                var oViewElementBinding = this._oPendingViewElementBinding;
                this.oOverlay.bindElement(oViewElementBinding.path, oViewElementBinding.parameters);
                this._oPendingViewElementBinding = undefined;
            }
        },

        getOverlay : function() {
            return this.oOverlay;
        },

        setBusy : function(bBusy) {
            if (this.oOverlay) {
                this.oOverlay.setBusy(bBusy);
            }
        },

        setHistoryState : function(sPath, oHistoryState) {
            if (typeof oHistoryState !== "object") {
                oHistoryState = {
                    id : oHistoryState,
                    mode : Mode.Display
                };
            }
            this.bHistoryNav = true;
            this.show(oHistoryState.id, oHistoryState.mode);
        },

        initialize : function(iId, sCode, sMode, fnChangeCallback) {
            // remember the currently focused element
            this._sPreviousFocusId = document.activeElement.id;

            if (sMode === null) {
                sMode = "display";
            }

            // initialize variables
            this.aActions = {
                display : [],
                edit : []
            };
            this.oViews = {};
            this.oSettings = {};

            // init the objects
            this.getController().setMode(sMode);
            this.getController().initModel(iId, sCode);

            this.getController()._fnChangeCallback = fnChangeCallback;

            this.beforeOverlayInit();

            this.createOverlay();

            this.afterOverlayInit();

            this.setBindingLookupRoot(this.getOverlay());
        },

        show : function(iId, sCode, sMode, fnChangeCallback) {

            this.initialize(iId, sCode, sMode, fnChangeCallback);

            if (!this.oOverlay.isOpen()) {
                this.oOverlay.open();
            }

            this.afterOverlayShow();
        },

        destroyActions : function() {
            for (var mode in this.aActions) {
                var actions = this.aActions[mode];
                for (var i = 0; i < actions.length; i++) {
                    actions[i] = null;
                }
            }
        },

        getBoundPath : function(sPath, bAbsolute) {
            return this.getController().getBoundPath(sPath, bAbsolute);
        },
        
        getBoundObject : function(oBinding, absolute, oType){
            return this.getController().getBoundObject(oBinding, absolute, oType);
        },

        getFormatterPath : function(sPath, bAbsolute) {
            return this.getController().getFormatterPath(sPath, bAbsolute);
        },

        getText : function(sTextKey, aParameter) {
            return this.getController().getTextModel().getText(sTextKey, aParameter);
        },

        attachClose : function() {
            var aArgs = ["close"];
            aArgs = aArgs.concat(jQuery.makeArray(arguments));
            this.attachEvent.apply(this, aArgs);
        },

        attachCloseOnce : function() {
            var aArgs = ["close"];
            aArgs = aArgs.concat(jQuery.makeArray(arguments));
            this.attachEventOnce.apply(this, aArgs);
        }
    });

    sap.ui.ino.views.common.OverlayView.Mode = Mode;

})();
