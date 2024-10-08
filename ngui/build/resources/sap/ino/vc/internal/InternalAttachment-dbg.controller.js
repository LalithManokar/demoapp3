sap.ui.define([
    "sap/ino/vc/commons/BaseBlockController",
    "sap/ino/vc/attachment/AttachmentMixin",
    "sap/ui/model/json/JSONModel", 
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/Configuration",
     "sap/m/MessageToast"
], function(BaseController,
            AttachmentMixin,
            JSONModel,
            Attachment,
            Configuration,
            MessageToast){
                
    "use strict";

    var attachmentUploadUrl = Attachment.getEndpointURL();

    return BaseController.extend("sap.ino.vc.internal.InternalAttachment", jQuery.extend({}, AttachmentMixin, {
        
        onInit : function() {
            BaseController.prototype.onInit.apply(this, arguments);
            if (!this.getModel("local")) {
                this.setModel(new JSONModel({
                    ATTACHMENT_UPLOAD_URL : attachmentUploadUrl
                }), "local");
            }
        },
        onAfterRendering : function() {
            this._attachmentMixinInit({
                attachmentId: "InternalAttachments",
                updateObject: function(oObject){
                    oObject.update();
                },
                uploadSuccess: function(oObject, oResponse){
                    oObject.addInternalAttachment({
                        "CREATED_BY_NAME" : Configuration.getCurrentUser().NAME,
                        "ATTACHMENT_ID" : oResponse.attachmentId,
                        "FILE_NAME" : oResponse.fileName,
                        "MEDIA_TYPE" : oResponse.mediaType,
                        "CREATED_AT" : new Date()
                    });
                    oObject.update().fail(function(){
                        oObject.getMessageParser().parse(oResponse);
                        MessageToast.show(this.getText("OBJECT_MSG_ATTACHMENT_FAILED"));
                        return true;
                    });
                }
            });
            
        }
        
    }));
});