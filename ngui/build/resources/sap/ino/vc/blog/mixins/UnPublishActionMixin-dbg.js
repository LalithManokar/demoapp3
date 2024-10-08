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
    var UnPublishActionMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    UnPublishActionMixin.onUnPublishBlog = function (oEvent) {
        var oSource = oEvent.getSource();
        var iBlogId = oSource.getBindingContext("data").getProperty("ID");
        var oSettings = { nodes: [], actions : ["unpublish"] };
        var that = this;

        var fnUnPublish = function (oPropertyEvent) {
            var oPropModel = oPropertyEvent.getSource();
            var bUnPublishAllowed = oPropModel.getProperty("/actions/unpublish/enabled");
            if (!bUnPublishAllowed) {
                MessageToast.show(that.getText("OBJECT_MSG_UnPublish_FAILED"));
            } else {
                var oUnPublishRequest = BaseController.prototype.executeObjectAction.call(that, Blog, "unpublish", { 
                staticparameters: iBlogId,
                messages : {
                    confirm : "MSG_UNPUBLISH_CONFIRM",
                    success : "MSG_UNPUBLISH_SUCCESS"
                }});
                oUnPublishRequest.done(function(oResponse){
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
        
        var oProp = new PropertyModel("sap.ino.xs.object.blog.Blog", iBlogId, oSettings, false, fnUnPublish);
    };

   
    return UnPublishActionMixin;
});