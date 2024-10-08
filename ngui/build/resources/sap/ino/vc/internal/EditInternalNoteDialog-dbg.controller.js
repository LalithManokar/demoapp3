sap.ui.define(["sap/ino/vc/commons/BaseObjectModifyController"],
    function (Controller) {
    "use strict";

     return Controller.extend("sap.ino.vc.internal.EditInternalNoteDialog", {

        open : function(iId, sModelObjectType){
            var that = this;
            var oSettings = {
                actions :["modify", "del"],
                continuousUse : true,
                readSource : {
                    model : this.getDefaultODataModel()
                }
            };

            jQuery.sap.require(sModelObjectType);
            var NoteModelType = jQuery.sap.getObject(sModelObjectType, 0);
            var oNoteModel = new NoteModelType(iId, oSettings);
            that.setObjectModel(oNoteModel);
            var oView = that.getView();
            oView.byId("editInternalNoteDialog").open();
        },
 
        onDeletePressed : function(oEvent) {
           var oDelPromise = this.executeObjectAction("del", {messages: {
               confirm : "MSG_DEL_CONFIRM",
               success : "MSG_DEL_SUCCESS_NOTE"
            }} );
            var oView = this.getView();
            oDelPromise.done(function(oResponse) {
                oView.getParent().getController()._commentMixinRefresh();
                oView.byId("editInternalNoteDialog").close();
            });
            oDelPromise.fail(function(oResponse) {
                // do not use MessageSupportView here to avoid marking the comments field red
            });
            oDelPromise.always(function() {
            });

        },
        
        onUpdatePressed : function(oEvent) {
            var oModifyPromise = this.executeObjectAction("modify", { messages: {success : "MSG_UPDATE_SUCCESS_NOTE"} } );
            var oView = this.getView();
            oModifyPromise.done(function(oResponse) {
                oView.byId("editInternalNoteDialog").close();
            });
            oModifyPromise.fail(function(oResponse) {
                // do not use MessageSupportView here to avoid marking the comments field red
            });
            oModifyPromise.always(function() {
            });
        },
        
        onCancelPressed : function(oEvent) {
            var oView = this.getView();
            oView.byId("editInternalNoteDialog").close();
        }
    });
});