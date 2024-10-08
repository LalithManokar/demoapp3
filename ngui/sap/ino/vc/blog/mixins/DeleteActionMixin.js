sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Blog",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast"
], function(BaseController, JSONModel, Blog, PropertyModel, MessageToast) {
    "use strict";

    /**
     * Mixin that handles blog deletion in lists
     * @mixin
     */
    var DeleteActionMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    DeleteActionMixin.onDeleteBlog = function (oEvent) {
        var oSource = oEvent.getSource();
        var iBlogId = oSource.getBindingContext("data").getProperty("ID");
        var oSettings = { nodes: [], actions : ["del"] };
        var that = this;

        var fnDelete = function (oPropertyEvent) {
            var oPropModel = oPropertyEvent.getSource();
            var bDeleteAllowed = oPropModel.getProperty("/actions/del/enabled");
            if (!bDeleteAllowed) {
                MessageToast.show(that.getText("OBJECT_MSG_DELETE_FAILED"));
            } else {
                var oDelRequest = BaseController.prototype.executeObjectAction.call(that, Blog, "del", { 
                staticparameters: iBlogId,
                messages : {
                    confirm : "MSG_DEL_CONFIRM",
                    success : "MSG_DEL_SUCCESS"
                }});
                oDelRequest.done(function(oResponse){
                    if(oResponse && oResponse.confirmationCancelled === true){
                        if (oSource && jQuery.type(oSource.focus) === "function") {
                            oSource.focus();
                        }
                        return;
                    }
                    if (that.bindList && typeof(that.bindList) === "function") {
                        // context: idea list (campaign / all)
                        that.bindList();
                    } else if (that._bindBlogs && typeof(that._bindBlogs) === "function" && that._sBlogViewKey) {
                        // context: campaign and normal homepage
                        that._bindBlogs(that._sBlogViewKey);
                    }
                });
            }
        };
        
        var oProp = new PropertyModel("sap.ino.xs.object.blog.Blog", iBlogId, oSettings, false, fnDelete);
    };

   
    return DeleteActionMixin;
});