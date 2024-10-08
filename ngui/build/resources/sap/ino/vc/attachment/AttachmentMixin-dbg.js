sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/m/UploadCollectionParameter",
    "sap/ino/commons/models/object/Attachment",
    "sap/m/MessageToast"
], function (Configuration, UploadCollectionParameter, Attachment, MessageToast){
    "use strict";    
    /**
     * @class
     * Mixin that handles actions for Comment and Internal Note
     */
    var AttachmentMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    AttachmentMixin._attachmentMixinInit = function(oSetting) {
        this._attachmentMixinSetting = oSetting;
        var oAttachments = this.byId(this._attachmentMixinSetting.attachmentId);
        var attachMentsList = this.getView().byId(this._attachmentMixinSetting.attachmentId);
        if(!oAttachments.getUploadEnabled()) {
            oAttachments.addStyleClass("sapInoAttachmentUploadInvisible");
        }
        attachMentsList.addEventDelegate({
		    onAfterRendering: jQuery.proxy(function () {
                this.setAccessibility();
			}, this)
		});
    };
    
    
    // called once per upload (not per file)
    AttachmentMixin.attachmentMixinOnChange = function(oEvent) {
        var oUploadCollection = oEvent.getSource();
        var oCustomerHeaderToken = new UploadCollectionParameter({
            name : "x-csrf-token",
            value : Configuration.getXSRFToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
    };
    
    AttachmentMixin.attachmentMixinonFileDeleted = function(oEvent) {
        var oItem = oEvent.getParameter("item");
        var oObject = this.getModel("object");
        oObject.removeAttachment(parseInt(oItem.getDocumentId(), 10));
        this._attachmentMixinSetting.updateObject(oObject);
    };
    
    // called for every file
    AttachmentMixin.attachmentMixinonBeforeUploadStarts = function(oEvent) {
        var oCustomerHeaderFilename = new UploadCollectionParameter({
            name : "unicode_filename",
            value : Attachment.stringToUnicode(oEvent.getParameter("fileName"))
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderFilename);      
    };
    
    AttachmentMixin.attachmentMixinonUploadComplete = function(oEvent) {
        var that = this;
        var oObject = this.getModel("object");
        var aFile = oEvent.getParameter("files");
        if (aFile.length > 0) {
            var bError = false;
            aFile.forEach(function(oFile) {
                var oResponse = Attachment.parseUploadResponse(oFile.responseRaw);
                oObject.getMessageParser().parse(oResponse);
                if (oResponse) {
                    if (oResponse.success) {
                        bError = that._attachmentMixinSetting.uploadSuccess(oObject, oResponse);
                    } else {
                        MessageToast.show(that.getText("OBJECT_MSG_ATTACHMENT_FAILED"));
                        bError = true;
                    }
                } else {
                    MessageToast.show(that.getText("OBJECT_MSG_ATTACHMENT_ERROR"));
                    bError = true;
                }
            });
            if (bError) {
                var oUploadCollection = this.getView().byId(this._attachmentMixinSetting.attachmentId);
                // Access to UI5 internal property to remove failed uploads
                oUploadCollection.aItems = [];
                // Force re-rendering to make invalid attachments disappear
                oUploadCollection.rerender();
            }
        }
    };
    
    AttachmentMixin.setAccessibility = function(){
        var view = this.getView();
        var element = view.byId(this._attachmentMixinSetting.attachmentId).$();
        var isNone= element.find('.sapMListNoData');
        var list = element.find('.sapMListModeNone ');
        
        if(isNone.length){
            list.hide();
            list.siblings().attr('tabindex', '-1');
        }
    }
    return AttachmentMixin;
});