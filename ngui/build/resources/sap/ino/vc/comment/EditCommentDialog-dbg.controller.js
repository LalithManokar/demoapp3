sap.ui.define(["sap/ino/vc/commons/BaseObjectModifyController"],
    function (Controller) {
    "use strict";

     return Controller.extend("sap.ino.vc.comment.EditCommentDialog", {

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
            var CommentModelType = jQuery.sap.getObject(sModelObjectType, 0);
            var oCommentModel = new CommentModelType(iId, oSettings);
            that.setObjectModel(oCommentModel);
            var oView = that.getView();
            oView.byId("editCommentDialog").open();
        },
 
        onDeletePressed : function(oEvent) {
           var oDelPromise = this.executeObjectAction("del", {messages: {
               confirm : "MSG_DEL_CONFIRM",
               success : "MSG_DEL_SUCCESS_COMMENT"
            }} );
            var oView = this.getView();
            oDelPromise.done(function(oResponse) {
                oView.getParent().getController()._commentMixinRefresh();
                oView.byId("editCommentDialog").close();
            });
            oDelPromise.fail(function(oResponse) {
                // do not use MessageSupportView here to avoid marking the comments field red
            });
            oDelPromise.always(function() {
            });

        },
        
        onUpdatePressed : function(oEvent) {
            var oModifyPromise = this.executeObjectAction("modify", { messages: {success : "MSG_UPDATE_SUCCESS_COMMENT"} } );
            var oView = this.getView();
            oModifyPromise.done(function(oResponse) {
                oView.byId("editCommentDialog").close();
            });
            oModifyPromise.fail(function(oResponse) {
                // do not use MessageSupportView here to avoid marking the comments field red
            });
            oModifyPromise.always(function() {
            });
        },
        
        onCancelPressed : function(oEvent) {
            var oView = this.getView();
            this.resetInputTypeValidations();
            oView.byId("editCommentDialog").close();
        }
    });
});