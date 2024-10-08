/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/commons/BaseController", 
    "sap/m/MessageBox", 
    "sap/ino/wall/config/Config",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ListItem",
    "sap/m/ListMode"
], function(BaseController, MessageBox, WallConfig, BaseFormatter, JSONModel, ListItem, ListMode) {

    var oFormatter = jQuery.extend({}, BaseFormatter);
    oFormatter.isTypeWall = function(sWallType) {
        return sWallType === 'sap.ino.config.WALL';
    };
    
    oFormatter.isTypeTemplate = function(sWallType) {
        return sWallType === 'sap.ino.config.TEMPLATE';
    };
    
    oFormatter.isModeDelete = function(bWallEditable) {
        return bWallEditable ? ListMode.Delete : ListMode.None;
    };
    
    oFormatter.isEditableText = function(bWallEditable) {
        return bWallEditable ? this.getText("WALL_SETTING_EDITABLE_YES") : this.getText("WALL_SETTING_EDITABLE_NO");
    };
    
    return BaseController.extend("sap.ino.vc.wall.WallSettings", {
        
        formatter: oFormatter,
        
        onInit : function() {
            if (BaseController.prototype.onInit) {
                BaseController.prototype.onInit.apply(this, arguments);
            }
            var that = this;
            this.byId("suggestUser").setFilterFunction(function(sValue, oItem) {
                return that.handleSuggestFilter(sValue, oItem);
            });
        },
        
        onAfterRendering : function() {
            var oView = this.getView();
            oView.getDomRef().setAttribute = function() {};
            jQuery(oView.getDomRef()).parent()[0].setAttribute = function() {};
        },
        
        getBackgroundSettings : function() {
            return this.byId("backgroundSettings");    
        },
        
        refresh : function() {
            this.getBackgroundSettings().getController().refresh();
        },
        
        getWallModel : function() {
            return this.getView().getModel("object");
        },
        
        getWall : function() {
            var oControl = this.getView().getParent();
            while (oControl) {
                if (typeof oControl.getController == "function" && typeof oControl.getController().getWall == "function") {
                    return oControl.getController().getWall();
                }
                oControl = oControl.getParent();                
            }
            return null;
        },
        
        getWallController : function() {
            var oControl = this.getView().getParent();
            while (oControl) {
                if (typeof oControl.getController == "function" && typeof oControl.getController().getWall == "function") {
                    return oControl.getController();
                }
                oControl = oControl.getParent();                
            }
            return null;
        },

        addUser : function(oEvent) {
            var oInputSuggestUsers = this.byId("suggestUser");
            var oSelectedItem = oEvent.getParameters().selectedItem;
            if (!oSelectedItem) {
                var aResult = jQuery.grep(oInputSuggestUsers.getSuggestionItems(), function(oSuggestionItem) {
                    return oSuggestionItem.getText() === oInputSuggestUsers.getValue();
                });
                if (aResult.length > 0) {
                    oSelectedItem = aResult[0]; 
                }                
            }
            if (oSelectedItem) {
                var iIdentityId = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
                var sName = oSelectedItem.getText();
                var oWallModel = this.getWallModel();
                if (oWallModel.addPermission({
                    IDENTITY_ID : iIdentityId,
                    ROLE_CODE : "WALL_READER",
                    IDENTITY_NAME : sName
                })) {
                    this.getWall()._notifyChanged("permissions");
                    this.handleSettingsChange();
                }
            }
            oInputSuggestUsers.setValue("");
            oInputSuggestUsers.focus();
        },

        updateUserPermission : function(oEvent) {
            var oItem = oEvent.getSource().getParent();
            var sPermissionId = oItem.getBindingContext("object").getProperty("ID");
            var oWallModel = this.getWallModel();
            if (oWallModel.notifyPermissionUpdated(sPermissionId)) {
                this.getWall()._notifyChanged("permissions");
            }
        },

        removeUser : function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var sPermissionId = oItem.getBindingContext("object").getProperty("ID");
            var oWallModel = this.getWallModel();
            if (oWallModel.removePermission(sPermissionId)) {
                this.getWall()._notifyChanged("permissions");
                this.handleSettingsChange();
            }
        },

        onDelete : function(oEvent) {
            var that = this;
            var oWallModel = this.getWallModel();
            function deleteWall(oAction) {
                if (oAction == MessageBox.Action.OK) {
                    that.setAutoSync(false);
                    var oDeleteRequest = oWallModel.del();
                    oDeleteRequest.done(function() {
                        oWallModel._bDeleted = true;
                        that.navigateTo("walllist");
                    });
                    oDeleteRequest.fail(function(oResponse) {
                    });
                }
            }
            MessageBox.confirm(this.getText("WALL_INS_WALL_DELETE"), deleteWall, this.getText("WALL_TIT_WALL_DELETE"));
        },

        onCopy : function(oEvent) {
            var that = this;
            var oWallModel = this.getWallModel();
            var sWallName = this.getText("WALL_FLD_WALL_NAME_COPY_PREFIX") + " " + oWallModel.getProperty("/NAME");
            this.openWallActionDialog(sWallName, "WALL_TIT_WALL_COPY_DIALOG_TITLE", "WALL_FLD_WALL_NEW_NAME", "BTN_COPY", "BTN_COPY_AND_OPEN", function(sName, bOpen) {
                that.setBusy(true);
                var oCopyRequest = oWallModel.copy({
                    ID : -1,
                    NAME : sName
                });
                oCopyRequest.always(function() {
                    that.setBusy(false);
                });
                oCopyRequest.done(function(oWallCopy) {
                    if (bOpen) {
                        that.navigateToWall("wall", {
                            id : oWallCopy.getInitKey()
                        });
                    }
                });
                oCopyRequest.fail(function(oResponse) {
                });
            });
        },

        onSaveAsTemplate : function() {
            var that = this;
            var oWallModel = this.getWallModel();
            var sWallName = oWallModel.getProperty("/NAME");
            this.openWallActionDialog(sWallName, "WALL_TIT_WALL_SAVE_TEMPLATE_DIALOG_TITLE", "WALL_FLD_WALL_TEMPLATE_NEW_NAME", "BTN_SAVE", "BTN_SAVE_AND_OPEN", function(sName, bOpen) {
                that.setBusy(true);
                var oCopyRequest = oWallModel.copy({
                    ID : -1,
                    NAME : sName,
                    WALL_TYPE_CODE : "sap.ino.config.TEMPLATE"
                });
                oCopyRequest.always(function() {
                    that.setBusy(false);
                });
                oCopyRequest.done(function(oWallCopy) {
                    if (bOpen) {
                        that.navigateToWall("wall", {
                            id : oWallCopy.getInitKey()
                        });
                    }
                });
                oCopyRequest.fail(function(oResponse) {
                });
            });
        },

        onCreateFromTemplate : function() {
            var that = this;
            var oWallModel = this.getWallModel();
            var sWallName = oWallModel.getProperty("/NAME");
            this.openWallActionDialog(sWallName, "WALL_TIT_WALL_CREATE_FROM_TEMPLATE_DIALOG_TITLE", "WALL_FLD_WALL_NEW_NAME", "BTN_CREATE", "BTN_CREATE_AND_OPEN", function(sName, bOpen) {
                that.setBusy(true);
                var oCopyRequest = oWallModel.copy({
                    ID : -1,
                    NAME : sName,
                    WALL_TYPE_CODE : "sap.ino.config.WALL"
                });
                oCopyRequest.always(function() {
                    that.setBusy(false);
                });
                oCopyRequest.done(function(oWallCopy) {
                    if (bOpen) {
                        that.navigateToWall("wall", {
                            id : oWallCopy.getInitKey()
                        });
                    }
                });
                oCopyRequest.fail(function(oResponse) {
                });
            });
        },

        onCreateIdeaFromWall : function() {
            this.navigateTo("idea-create", { "query" : { wall : this.getWallModel().getKey() } });
        },

        deactivateAutoSync : function() {
            this.byId("autoSyncSwitch").setState(false);
            this.setAutoSync(false);
        },

        onAutoSync : function(oEvent) {
            this.setAutoSync(oEvent.getSource().getState());
        },

        setAutoSync : function(bAutoSync) {
            var oWall = this.getWall();
            if (oWall) {
                if (bAutoSync) {
                    oWall.setWallSaveDelay(WallConfig.getWallSaveDelayAuto());
                    oWall.setWallSyncDelay(WallConfig.getWallSyncDelayAuto());
                    // oWall.setWallSyncMode(true);
                } else {
                    oWall.setWallSaveDelay(WallConfig.getWallSaveDelay());
                    oWall.setWallSyncDelay(WallConfig.getWallSyncDelay());
                    // oWall.setWallSyncMode(false);
                }
            }
        },
        
        actionDialogValueLiveChange : function(oEvent) {
            oEvent.getSource().setValue(oEvent.getParameters().newValue);
        },
        
        actionDialogOnOK : function(oEvent) {
            this._oActionDialog.close();
            if (this._oActionDialogHandler) {
                this._oActionDialogHandler(this._oActionDialog.getModel("dialog").getProperty("/value"), false);
            }
        },
        
        actionDialogOnOKOpen : function(oEvent) {
            this._oActionDialog.close();
            if (this._oActionDialogHandler) {
                this._oActionDialogHandler(this._oActionDialog.getModel("dialog").getProperty("/value"), true);
            }
        },
        
        actionDialogOnCancel : function(oEvent) {
            this._oActionDialog.close();
        },
        
        openWallActionDialog : function(sValue, sTitle, sValueLabel, sButtonTextCode, sButtonOpenTextCode, fnHandler) {
            if (!this._oActionDialog) {
                this._oActionDialog = this.createFragment("sap.ino.vc.wall.fragments.WallSettingsActionDialog");
                this.getView().addDependent(this._oActionDialog);
            }
            var oDialogModel = new JSONModel({
                "title" : this.getText(sTitle),
                "value" : this.getText(sValue),
                "label" : this.getText(sValueLabel),
                "okBtnTitle" : this.getText(sButtonTextCode),
                "okOpenBtnTitle" : this.getText(sButtonOpenTextCode)
            });
            this._oActionDialogHandler = fnHandler;
            this._oActionDialog.setModel(oDialogModel, "dialog");
            this._oActionDialog.open();
            return this._oActionDialog;
        },
        
        handleSuggest : function(oEvent) {
            var that = this;
            var sValue = oEvent.getParameter("suggestValue");
            var oTemplate = new ListItem({
                text : "{data>NAME}",
                additionalText : "{data>USER_NAME}",
                key : "{data>ID}"
            });            
            oEvent.getSource().bindAggregation("suggestionItems", { 
                path : "data>/SearchIdentity(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results",
                template : oTemplate,
                parameters : {
                    select : "searchToken,ID,NAME,USER_NAME"
                }
            });
        },
        
        handleSuggestFilter : function(sValue, oItem) {
            var oWall = this.getWallModel();
            var sItemKey = oItem.getKey();
            // remove owner
            if (oWall.getProperty("/Owner/0/IDENTITY_ID") == sItemKey) {
                return false;
            }
            // remove already defined users
            var aPermission = oWall.getProperty("/Permissions");
            var aMatch = jQuery.grep(aPermission, function(oPermission) {
                return oPermission.IDENTITY_ID == sItemKey;
            });
            return aMatch.length === 0;
        },
        
        handleSettingsChange : function() {
            var oScrollToolbar = this.getWallController() && this.getWallController().getScrollableToolbar();
            if (oScrollToolbar) {
                oScrollToolbar.validate();
            }
        }
    });
});