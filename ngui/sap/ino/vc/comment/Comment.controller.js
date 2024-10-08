sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ui/core/mvc/ViewType",
    "sap/ino/vc/comment/CommentMixin"
], function (Controller, ViewType, CommentMixin) {
    "use strict";
    
    return Controller.extend("sap.ino.vc.comment.Comment", jQuery.extend({}, CommentMixin, {
        
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },

        onBeforeRendering: function (oEvent) {
            this.commentMixinInit({ 
                commentInputId :  "commentInputField",
                commentListId : "commentList",
                successMessageKey : "MSG_CREATE_SUCCESS_COMMENT",
                editDialogViewName : "sap.ino.vc.comment.EditCommentDialog"
            });
        },
        
        onAfterRendering: function (){
           this.byId("commentList").addEventDelegate({
                onAfterRendering : function(oEvent) {
                    var oList = oEvent.srcControl;
                    //oList.$().find(".sapMListUl").attr("role", "list"); 
                    var aItems = oList.$().find("li");
                    jQuery.each(aItems, function(iIdx, oItemDom) {
                        var $Item = jQuery(oItemDom);
                        $Item.attr("aria-label", $Item.getEncodedText());
                       
                      
                    });
                }
            });
        }
        
    }));
});