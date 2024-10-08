sap.ui.define([
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/commons/models/object/User",
    "sap/ino/commons/models/object/Idea"
    ], 
    function(ClipboardModel, User, Idea) {
    "use strict";

    /**
     * @class
     * Mixin that provides common functionality for Clipboard handling
     */
    var ClipboardMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    ClipboardMixin._getClipboardModel = function() {
        if (!this._oClipboardModel) {
            this._oClipboardModel = this.getModel("clipboard");
        }
        return this._oClipboardModel;
    };
    
    ClipboardMixin.formatIsIdeaInClipboard = function(iIdeaId) {
        var oClipboardModel = this._getClipboardModel();
        if (oClipboardModel) {
            return oClipboardModel.getProperty("/enabled") && oClipboardModel.isInClipboard(Idea, iIdeaId);
        } else {
            return false;
        }
    };
    
    ClipboardMixin.formatHasIdeasInClipboard = function() {
        var oClipboardModel = this._getClipboardModel();
        return oClipboardModel ? oClipboardModel.getProperty("/enabled") && !oClipboardModel.isClipboardEmpty(Idea) : false;
    };
    
    ClipboardMixin.formatHasOtherIdeasInClipboard = function(iIdeaId) {
        var oClipboardModel = this._getClipboardModel();
        var bHasMoreIdeas = oClipboardModel.getObjectKeys(Idea).filter(function (iTempIdeaId) {
            return iTempIdeaId !== iIdeaId;
        }).length > 0;
        return oClipboardModel ? oClipboardModel.getProperty("/enabled") && bHasMoreIdeas : false;
    };
    
    ClipboardMixin.formatIdeasInClipboardAndParam = function() {
        for (var i = 0; i < arguments.length; i += 1) {
            if (!arguments[i]) {
                return false;
            }
        }
        return this.formatHasIdeasInClipboard();
    };

    ClipboardMixin.formatIdeaPinTooltip = function(iIdeaId) {
        var oClipboardModel = this._getClipboardModel();
        if (oClipboardModel) {
            return oClipboardModel.isInClipboard(Idea, iIdeaId) ? this.getText("CLIPBOARD_BTN_TOOLTIP_IDEA_REMOVE") : this.getText("CLIPBOARD_BTN_TOOLTIP_IDEA_ADD");
        } else {
            return "";
        }
    };
    
    ClipboardMixin.formatIsUserInClipboard = function(iIdentityId) {
        var oClipboardModel = this._getClipboardModel();
        if (oClipboardModel) {
            return oClipboardModel.getProperty("/enabled") && oClipboardModel.isInClipboard(User, iIdentityId);
        } else {
            return false;
        }
    };
    
    ClipboardMixin.formatHasUsersInClipboard = function() {
        var oClipboardModel = this._getClipboardModel();
        return oClipboardModel ? oClipboardModel.getProperty("/enabled") && !oClipboardModel.isClipboardEmpty(User) : false;
    };
    
    ClipboardMixin.onIdeaPinPressed = function(oEvent) {
        var oClipboardModel = this._getClipboardModel();
        var oSource = oEvent.getSource();
        var sModel = oSource.data("model") || "data";
        var iIdeaId = oSource.getBindingContext(sModel).getProperty("ID");
        var sName = oSource.getBindingContext(sModel).getProperty("NAME");
        var bPinned = oSource.getPressed();
        if (oClipboardModel && iIdeaId) {
            var bAlreadyPinned = oClipboardModel.isInClipboard(Idea, iIdeaId);
            if (bPinned && !bAlreadyPinned) {
                oClipboardModel.add(Idea, iIdeaId, sName);
            } else if (!bPinned && bAlreadyPinned) {
                oClipboardModel.remove(Idea, iIdeaId);
            }
        }
    };
    
    ClipboardMixin.onUserPinPressed = function(oEvent) {
        var oClipboardModel = this._getClipboardModel();
        var iIdentityId = oEvent.getParameter("identityId");
        var sUserName = oEvent.getParameter("userName");
        var bPinned = oEvent.getParameter("pinned");
        if (oClipboardModel && iIdentityId) {
            var bAlreadyPinned = oClipboardModel.isInClipboard(User, iIdentityId);
            if (bPinned && !bAlreadyPinned) {
                oClipboardModel.add(User, iIdentityId, sUserName);
            } else if (!bPinned && bAlreadyPinned) {
                oClipboardModel.remove(User, iIdentityId);
            }
        }
    };

    return ClipboardMixin;
});