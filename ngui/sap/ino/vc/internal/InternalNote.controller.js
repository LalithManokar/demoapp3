sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ui/core/mvc/ViewType",
    "sap/ino/vc/comment/CommentMixin" 
], function (Controller, ViewType, CommentMixin) {
    "use strict";

    return Controller.extend("sap.ino.vc.internal.InternalNote", jQuery.extend({}, CommentMixin, {

        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },

        onBeforeRendering: function (oEvent) {
            this.commentMixinInit({ 
                commentInputId : "internalNoteInputField",
                commentListId : "internalNoteList",
                successMessageKey : "MSG_CREATE_SUCCESS_NOTE",
                editDialogViewName : "sap.ino.vc.internal.EditInternalNoteDialog"
            });
        }
    }));
});