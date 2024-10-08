/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

(function() {

    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

    var Mode = {
        Display: "display",
        Edit: "edit"
    };

    sap.ui.ino.views.common.ThingInspectorAOView = jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {

        init: function() {
            this.initMessageSupportView();
        },

        exit: function() {
            this.exitMessageSupportView();
            sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
        },

        hasPendingChanges: function() {
            return this.getController().hasPendingChanges();
        },

        addStandardButtons: function(oDisplay) {
            oDisplay = oDisplay ? oDisplay : {
                save: true,
                edit: true,
                cancel: true,
                del: true,
                close: false,
                toggleClipboard: false
            };

            var oController = this.getController();

            if (oDisplay.edit) {
                var oEditButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_EDIT}",
                    enabled: this.getBoundPath("property/actions/update/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/update/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onEdit, oController]
                });
                this.addAction(oEditButton, true);
            }

            if (oDisplay.save) {
                var oSaveButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_SAVE}",
                    enabled: this.getBoundPath("property/actions/modify/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/modify/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onSave, oController]
                });
                this.addAction(oSaveButton, false, true);
            }

            if (oDisplay.del) {
                var oDeleteButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_DELETE}",
                    enabled: this.getBoundPath("property/actions/del/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/del/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onDelete, oController]
                });
                this.addAction(oDeleteButton, true, true);
            }

            if (oDisplay.cancel) {
                var oCancelButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_CANCEL}",
                    enabled: true,
                    tooltip: "{i18n>BO_TI_BUT_CANCEL}",
                    select: [oController.onCancel, oController]
                });
                this.addAction(oCancelButton, false, true);
            }

            if (oDisplay.close) {
                var oCloseButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_COMMON_BUT_CLOSE}",
                    enabled: true,
                    tooltip: "{i18n>BO_COMMON_BUT_CLOSE}",
                    select: [oController.onClose, oController]
                });
                this.addAction(oCloseButton, true, true);
            }
            
            if (oDisplay.toggleClipboard) {
                var oToggleClipboardButton = new sap.ui.ux3.ThingAction({                    
                    text : {
                        parts : [{
                            path : "clipboard>/changed"
                        }, {
                            path : "i18n>BO_APPLICATION_BUT_CLIPBOARD_ADD"
                        }, {
                            path : "i18n>BO_APPLICATION_BUT_CLIPBOARD_REMOVE_LONG"
                        }, {
                            path : this.getFormatterPath("ID", true)
                        }],
                        formatter : function(vChanged, sTextNotInClipboard, sTextInClipboard, iId) {
                            var oModel = oController.getModel();
                            if (sap.ui.ino.models.core.ClipboardModel.sharedInstance().isInClipboard(oModel, iId)) {
                                return sTextInClipboard;
                            }
                            return sTextNotInClipboard;
                        }
                    },
                    enabled: true,
                    tooltip: "{i18n>BO_APPLICATION_BUT_CLIPBOARD_ADD}",
                    select: [oController.onToggleClipboard, oController]
                });
                this.addAction(oToggleClipboardButton, true, true);
            }
        },
        
        addStatusNameButtons: function(oDisplay) {
            oDisplay = oDisplay ? oDisplay : {
                save: true,
                edit: true,
                cancel: true,
                del: true
            };

            var oController = this.getController();

            if (oDisplay.edit) {
                var oEditButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_EDIT}",
                    enabled: this.getBoundPath("property/actions/update/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/update/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onEdit, oController]
                });
                this.addAction(oEditButton, true);
            }

            if (oDisplay.save) {
                var oSaveButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_SAVE}",
                    enabled: this.getBoundPath("property/actions/modify/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/modify/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onStatusNameSave, oController]
                });
                this.addAction(oSaveButton, false, true);
            }

            if (oDisplay.del) {
                var oDeleteButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_DELETE}",
                    enabled: this.getBoundPath("property/actions/del/enabled", true),
                    tooltip: {
                        path: this.getFormatterPath("property/actions/del/messages", true),
                        formatter: function(aMessages) {
                            if (aMessages && aMessages.length > 0) {
                                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG)
                                    .getResourceBundle();
                                return oMsg.getText(aMessages[0].MESSAGE, aMessages[0].PARAMETERS);
                            } else {
                                return undefined;
                            }
                        }
                    },
                    select: [oController.onDelete, oController]
                });
                this.addAction(oDeleteButton, true, true);
            }

            if (oDisplay.cancel) {
                var oCancelButton = new sap.ui.ux3.ThingAction({
                    text: "{i18n>BO_TI_BUT_CANCEL}",
                    enabled: true,
                    tooltip: "{i18n>BO_TI_BUT_CANCEL}",
                    select: [oController.onCancel, oController]
                });
                this.addAction(oCancelButton, false, true);
            }
            
        },

        createContent: function(oController) {
            return null; // Does nothing since the TI is not part of the normal view hierarchy
        },

        createHeaderContent: function() {
            // Implementations should create and return their headercontent from here
        },

        setThingInspectorConfiguration: function() {
            // Empty, users are responsible for initializing their thing inspector settings here
            // Exists only so call doesn't fail if user doesn't implement
        },

        onShow: function() {
            // Empty, users are responsible for setting the thing inspector context here (model and instance binding)
            // Exists only so call doesn't fail if user doesn't implement
        },

        close: function() {
            var oController = this.getController();
            var oModel = oController.getModel();
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();

            if (oModel) {
                oModel.revertChanges();
            }
            if (this.onBeforeClose) {
                this.onBeforeClose();
            }

            var oTI = this.getInspector();
            if (oController.isInEditMode()) {
                oController.getModel().revertChanges();
            }

            if (this.bHistoryNav) {
                oApp.navigateBack();
            }

            oApp.showDelayedNotificationMessages();
            //
            if (oTI.isOpen()) {
                oTI.close();
            }
            if (this.oTI != null) {
                this.oTI.destroy();
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
            this.aSidePanelGroups = [];
            this.aNavigationItems = [];
            this.oFacets = {};
            this.oSettings = {};

            if (this.sHelpContext) {
                sap.ui.ino.application.backoffice.Application.getInstance().popHelpContext();
            }

            if (this._sPreviousFocusId) {
                var oView = this;
                // there is a bug in IE that caused the TI to reopen after close
                // for now we simple reselect the opening link later so the misterious bubbling event does not trigger the reopen
                setTimeout(function() {
                    jQuery.sap.byId(oView._sPreviousFocusId).focus();
                    oView._sPreviousFocusId = undefined;
                }, 100);
            }

            this.fireEvent("close");
            this.destroy();
        },

        bindElement: function(sPath, mParameters) {
            sap.ui.core.mvc.View.prototype.bindElement.apply(this, arguments);
            if (this.oTI) {
                this.oTI.bindElement(sPath, mParameters);
            } else {
                this._oPendingViewElementBinding = {
                    path: sPath,
                    parameters: mParameters
                };
            }
        },

        createRow: function(sLabel, iLabelSpan, oControl, iControlSpan, sTooltip) {

            sTooltip = sTooltip || sLabel;
            sTooltip = sTooltip.replace(/:/, "").trim();

            if (Object.prototype.toString.call(iLabelSpan) != "[object Number]") {
                oControl = iLabelSpan;
                iLabelSpan = 1;
                iControlSpan = 1;
            }

            if (typeof oControl === "string") {
                oControl = new sap.ui.commons.TextView({
                    text: oControl
                });
            }

            var oLabel = new sap.ui.commons.Label({
                text: sLabel,
                textAlign: sap.ui.core.TextAlign.End,
                wrapping: true,
                tooltip: sTooltip,
                labelFor: oControl
            });
            var oMLCell1 = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.End,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                content: [oLabel],
                colSpan: iLabelSpan
            });
            var oMLCell2 = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                separation: sap.ui.commons.layout.Separation.Small,
                content: [oControl],
                colSpan: iControlSpan
            });

            /* due to a change in UI5 1.28 this must be done anymore 
            if (oControl.addAriaLabelledBy) {
                if (oControl.removeAllAriaLabelledBy) {
                    oControl.removeAllAriaLabelledBy();
                }
                oControl.addAriaLabelledBy(oLabel);
            }
            */
            
            return new sap.ui.commons.layout.MatrixLayoutRow({
                cells: [oMLCell1, oMLCell2]
            });
        },

        addHeaderGroup: function(oContent) {
            this.aSidePanelGroups.push(oContent);
        },

        removeAllHeaderGroups: function() {
            this.aSidePanelGroups = [];
        },

        refreshHeaderGroups: function() {
            if (this.oTI) {
                this.oTI.removeAllHeaderContent();
                for (var ii = 0; ii < this.aSidePanelGroups.length; ii++) {
                    this.oTI.addHeaderContent(this.aSidePanelGroups[ii]);
                }
            }
        },

        /**
         * Method to add a Facet to the Thing Inspector
         *
         * @param sFacetViewName
         *            ID of the facet view (used to intiate the view)
         * @param sTitle
         *            The title of the facet
         */
        addFacet: function(sFacetViewName, sTitle, sPrivilege) {
            var bAllowed = true;
            if(sPrivilege){
                bAllowed = sap.ui.ino.application.backoffice.Application.getInstance().hasCurrentUserPrivilege(sPrivilege);
            }
            if(!bAllowed){
                return;
            }
            var oNavItem = new sap.ui.ux3.NavigationItem({
                key: sFacetViewName,
                text: sTitle
            });
            this.aNavigationItems.push(oNavItem);
        },

        addAction: function(vAction, fnCallback, bDisplayShow, bEditShow) {
            var oAction;

            if (typeof vAction == "string") {
                oAction = new sap.ui.ux3.ThingAction({
                    text: this.getText(vAction)
                });

                oAction.attachSelect(fnCallback, this.getController());
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
        },

        getActiveFacet: function() {
            return this.getController().getActiveFacet();
        },

        createInspector: function() {
            var that = this;
            var oController = this.getController();
            // Merge Users Settings with standard functions
            var finalSettings = {};
            jQuery.extend(finalSettings, {
                followActionEnabled: false,
                flagActionEnabled: false,
                favoriteActionEnabled: false,
                updateActionEnabled: false,
                facets: this.aNavigationItems,
                headerContent: this.aSidePanelGroups,
                openNew: [oController.openNew, oController],
                facetSelected: this.getController().facetSelected,
                actionSelected: this.getController().actionSelected,
                actions: this.aActions[this.getController().getMode()],
                close: this.getController().close
            }, this.oSettings);
            this.oTI = new sap.ui.ux3.ThingInspector(this.createId("TI"), finalSettings);
            this.oTI.oView = this;
            this.executeViewElementBinding();
            this.getController().bindInstance();
            
            // Workaround for Accessibility: JAWS reads whole menu instead of first item (IE only)
            if (that.aNavigationItems.length > 0) {
                var oParent = that.aNavigationItems[0].getParent();
                var fnBarAfterRendering = oParent.onAfterRendering;
                
                oParent.onAfterRendering = function() {
                    if (fnBarAfterRendering) {
                        fnBarAfterRendering.apply(oParent, arguments);
                    }
                        
                    oParent.$().attr("tabindex", "-1");
                    that.aNavigationItems[0].$().attr("tabindex", "0");                    
                };
            }            
            /*
            var fnTIAfterRendering = this.oTI.onAfterRendering;
            this.oTI.onAfterRendering = function() {
                if (fnTIAfterRendering) {
                    fnTIAfterRendering.apply(that.oTI, arguments);
                }
                        
                // Workaround for Accessibility: JAWS reads nothing instead of first item (IE only)
                setTimeout(function() {
                    var oActionParent = that.oTI.getActionBar();
                    
                    var fnUpdateActionBar = function() {
                        setTimeout(function() {
                            var aCurrentActions = oActionParent.getAggregation("_businessActionButtons");
                            if (aCurrentActions.length > 0) {
                                oActionParent.$().attr("tabindex", "-1");
                                aCurrentActions[0].$().attr("tabindex", "0");
                            }
                        }, 0); // let UI5 render first   
                    };
                    
                    fnUpdateActionBar();
                    
                    var fnActionsAfterRendering = oActionParent.onAfterRendering;
                    
                    oActionParent.onAfterRendering = function() {
                        if (fnActionsAfterRendering) {
                            fnActionsAfterRendering.apply(oActionParent, arguments);
                        }
                            
                        fnUpdateActionBar();                                       
                    };
                }, 0); // let UI5 render first
            };
            */            
            return this.oTI;
        },

        executeViewElementBinding: function() {
            // the view element binding might have been done *before* 
            // the thing inspector has been created thus we re-do it
            if (this._oPendingViewElementBinding) {
                var oViewElementBinding = this._oPendingViewElementBinding;
                this.oTI.bindElement(oViewElementBinding.path, oViewElementBinding.parameters);
                this._oPendingViewElementBinding = undefined;
            };
        },

        getInspector: function() {
            return this.oTI;
        },

        setBusy: function(bBusy) {
            if (this.oTI) {
                this.oTI.setBusy(bBusy);
            }
        },

        setHistoryState: function(sPath, oHistoryState) {
            if (typeof oHistoryState !== "object") {
                oHistoryState = {
                    id: oHistoryState,
                    mode: Mode.Display
                };
            }
            this.bHistoryNav = false;
            this.show(oHistoryState.id, oHistoryState.mode);
        },

        initialize: function(iId, sMode, fnChangeCallback) {
            // remember the currently focused element
            this._sPreviousFocusId = document.activeElement.id;

            if (sMode == null) {
                sMode = "display";
            }

            // initialize variables
            this.aActions = {
                display: [],
                edit: []
            };
            this.aSidePanelGroups = [];
            this.aNavigationItems = [];
            this.oFacets = {};
            this.oSettings = {};
            this.sHelpContext = undefined;
            this.sAdditionalHelpContext = '';

            // init the objects
            this.getController().setMode(sMode);
            this.getController().initModel(iId);

            this.getController()._fnChangeCallback = fnChangeCallback;

            //set the configuration
            this.setThingInspectorConfiguration();

            //create the header Content
            this.createHeaderContent();
            
            this.createInspector();
            if (this.sHelpContext) {
                sap.ui.ino.application.backoffice.Application.getInstance().pushHelpContext(this.sHelpContext, this.sAdditionalHelpContext);
            }

            this.setBindingLookupRoot(this.getInspector());
            
            //init the facets
            this.getController().initFacets(); 
        },

        show: function(iId, sMode, fnChangeCallback) {
            this.initialize(iId, sMode, fnChangeCallback);

            if (!this.oTI.isOpen()) {
                this.oTI.open();
            }
            
            this.onShow();
        },

        destroyActions: function() {
            for (var mode in this.aActions) {
                var actions = this.aActions[mode];
                for (var i = 0; i < actions.length; i++) {
                    actions[i] = null;
                }
            }
        },

        getBoundPath: function(sPath, bAbsolute) {
            return this.getController().getBoundPath(sPath, bAbsolute);
        },

        getBoundObject: function(oBinding, absolute, oType) {
            return this.getController().getBoundObject(oBinding, absolute, oType);
        },

        getFormatterPath: function(sPath, bAbsolute) {
            return this.getController().getFormatterPath(sPath, bAbsolute);
        },

        getText: function(sTextKey) {
            return this.getController().getTextModel().getText(sTextKey);
        },

        attachClose: function() {
            var aArgs = ["close"];
            aArgs = aArgs.concat(jQuery.makeArray(arguments));
            this.attachEvent.apply(this, aArgs);
        },

        attachCloseOnce: function() {
            var aArgs = ["close"];
            aArgs = aArgs.concat(jQuery.makeArray(arguments));
            this.attachEventOnce.apply(this, aArgs);
        }
    });

    sap.ui.ino.views.common.ThingInspectorAOView.Mode = Mode;

})();