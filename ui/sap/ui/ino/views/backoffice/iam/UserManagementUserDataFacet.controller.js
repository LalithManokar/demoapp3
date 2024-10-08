/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserManagementUserDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

    removeFromTable : function(oTable) {
        this.getThingInspectorController().clearFacetMessages();
        var iIdx = oTable.getSelectedIndex();
        var oObject = oTable.getContextByIndex(iIdx).getObject();
        this.getModel().removeChild(oObject);
    },

    onRolesTableSelectionChange : function(oEvent) {
        var oView = this.getView();
        var iIndex = oView.oTableRoles.getSelectedIndex();
        if (oEvent) {
            var oRowContext = oEvent.getParameter("rowContext");
            var sRoleCode = oRowContext && oRowContext.getProperty("ROLE_CODE");
        }
        this.setRolesButtonState((iIndex > -1) && sRoleCode === sap.ui.ino.models.object.User.StaticRoles.InnovationManager);
    },

    addRole : function(oEvent) {
        var oView = this.getView();

        var sRoleCode = oEvent.getParameter("item").getBindingContext().getProperty("ROLE_CODE");
        var sTechnicalRoleCode = oEvent.getParameter("item").getBindingContext().getProperty("TECHNICAL_ROLE_CODE");

        var aRoles = this.getModel().getProperty("/Roles") || [];
        aRoles.push({
            ROLE_CODE : sRoleCode,
            TECHNICAL_ROLE_CODE : sTechnicalRoleCode
        });
        this.getModel().setProperty("/Roles", aRoles);

        oView.oTableRoles.bindRows({
            path : this.getFormatterPath("/Roles")
        });

        oView._updateRoleButtons();
    },

    _updateTableSelectionAfterRemove : function(oTable, iLength) {
        var iSelectedIdx = oTable.getSelectedIndex();

        if (iSelectedIdx >= iLength) {
            iSelectedIdx--;
        } else {
            oTable.setSelectedIndex(-1);
        }
        oTable.setSelectedIndex(iSelectedIdx);
    },

    removeRole : function(oEvent) {
        var oTable = this.getView().oTableRoles;
        this.removeFromTable(oTable);
        this.getView()._updateRoleButtons();
        this.onRolesTableSelectionChange();

        var aRoles = this.getModel().getProperty("/Roles") || [];
        this._updateTableSelectionAfterRemove(oTable, aRoles.length);
    },

    setRolesButtonState : function(bState) {
        if (this.getView().oRemoveRoleButton) {
            this.getView().oRemoveRoleButton.setEnabled(bState);
        }
    },

    setGroupsButtonState : function(bState) {
        if (this.getView().oRemoveGroupButton) {
            this.getView().oRemoveGroupButton.setEnabled(bState);
        }
    },

    // TODO => duplicate code campaign & group mgmt
    addGroup : function(oField) {
        this.getThingInspectorController().clearFacetMessages();

        if (oField.getValue() === "") {
            this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_IDENT_REQUIRED_GROUP", oField);
        } else {
            oField.setValueState(sap.ui.core.ValueState.None);
            var sKey = oField.getSelectedKey();
            var bSuccess = false;
            for (var ii = 0; ii < oField.getItems().length; ++ii) {
                if (sKey === oField.getItems()[ii].getKey()) {
                    var oBindingInfo = oField.getBindingInfo("items");
                    if (oBindingInfo && oBindingInfo.binding && oBindingInfo.binding.getContexts()) {
                        var aContexts = oBindingInfo.binding.getContexts();

                        if (aContexts.length > ii) {
                            var sPath = aContexts[ii].sPath;
                            if (sPath.length > 0 && sPath[0] === '/') {
                                sPath = sPath.substr(1);
                            }

                            var oIdentity = sap.ui.getCore().getModel().oData[sPath];
                            bSuccess = this._doAddIdentity(oIdentity);
                        }
                    }
                    break;
                }
            }

            if (!bSuccess) {
                this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_IDENT_VALUE_INVALID_GROUP", oField);
            } else {
                oField.setValue("");
                oField.unbindItems();
            }
        }
    },
    
    addGroupFromClipboard : function() {
        var that = this;
        var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
        var aGroupKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Group);
        
        if (!aGroupKeys || aGroupKeys == []) {
            this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_IDENT_REQUIRED_GROUP", oClipboard);
        } else {
            var sKey = "";

            for (var i = 0; i < aGroupKeys.length; ++i) {
                sKey = aGroupKeys[i];

                var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Group, sKey);
                oReadRequest.done(function(oIdentity) {
                    var bGroupSuccess = that._doAddIdentity(oIdentity);
                    if(!bGroupSuccess){
                        that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_IDENT_VALUE_INVALID_GROUP", oClipboard);
                    }
                });
                oReadRequest.fail(function(oIdentity) {
                    that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_IDENT_VALUE_INVALID_GROUP", oClipboard);
                });
            }
        }
    },
    
    _doAddIdentity : function(oIdentity){
        var bSuccess = false;
        if (oIdentity) {
            // we need to copy as the identity may be re-read while editing the group and the handle
            // would be overwritten by the id
            // but we don't care about the subnodes, so no deep copy is required
            var oIdentity2Add = jQuery.extend({}, oIdentity);
            this._cleanIdentity(oIdentity2Add);

            oIdentity2Add.MEMBER_ID = this.getModel().getProperty("/ID");
            oIdentity2Add.DESCRIPTION = oIdentity.DESCRIPTION;
            oIdentity2Add.GROUP_ID = oIdentity2Add.ID;
            oIdentity2Add.GROUP_NAME = oIdentity.NAME;
            oIdentity2Add.ID = this.getModel().getNextHandle();

            // check for duplicates => if the user is faster than the context update
            var bIsDuplicate = false;
            var aIdentities = this.getModel().getProperty("/MemberOf");
            for (var ii = 0; ii < aIdentities.length; ++ii) {
                if (aIdentities[ii].GROUP_ID === oIdentity2Add.GROUP_ID) {
                    bIsDuplicate = true;
                    break;
                }
            }

            if (!bIsDuplicate) {
                this.getModel().addChild(oIdentity2Add, "MemberOf");
                bSuccess = true;
            }
        }
        return bSuccess;
    },

    _cleanIdentity : function(oIdentity) {
        delete oIdentity["__metadata"];
        delete oIdentity["Groups"];
        delete oIdentity["SEARCH_SCORE"];
    },

    removeGroup : function(oEvent) {
        this.removeFromTable(this.getView().oTableGroups);
        var aGroups = this.getModel().getProperty("/MemberOf") || [];
        this._updateTableSelectionAfterRemove(this.getView().oTableGroups, aGroups.length);
    },
    
    handleFullNameChange: function() {
        var oModel = this.getController().getModel();
        var sFirstName = oModel.getProperty("/FIRST_NAME");
        var sLastName = oModel.getProperty("/LAST_NAME");
        if (sFirstName && sLastName) {
            oModel.setProperty("/NAME", sFirstName + " " + sLastName);
        }
    }
}));