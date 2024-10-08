/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/models/object/Attachment",
    "sap/m/MessageToast",
    "sap/ino/wall/WallItemAttachment"
], function(WallRemoteItemController, TopLevelPageFacet, Attachment, MessageToast, WallItemAttachment) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemAttachment", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-attachment"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());
        },
        
        onFileUploaderComplete : function (oEvent) {
            var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
            var oFileUploader = oEvent.getSource();
            var that = this;
            if (oResponse) {
                var oObject = this.getObjectModel();
                oObject.getMessageParser().parse(oResponse);
                if (oResponse.success) {
                    var iAttachmendId = oResponse.attachmentId;
                    var sAttachmentName = oResponse.fileName;
                    var sFileType = WallItemAttachment.mapType(oResponse.mediaType);
                    oObject.setProperty("/Attachment", [{
                            ID: oObject.getProperty("/Attachment/0/ID") || undefined,
                            ATTACHMENT_ID : iAttachmendId,
                            FILE_NAME: sAttachmentName
                        }]);
                    oObject.setProperty("/CONTENT", {
                            CAPTION: sAttachmentName,
                            FILE_NAME: sAttachmentName,
                            TYPE: sFileType
                        });  
                    that.save();
                } else {
                    MessageToast.show(this.getText("WALL_REMOTE_ATTACHMENT_UPLOAD_FAILED"));
                }
            } else {
                MessageToast.show(this.getText("WALL_REMOTE_ATTACHMENT_UPLOAD_ERROR"));
            }
            oFileUploader.setBusy(false);
            oFileUploader.clear();
        },
        
        onClear : function() {
            var oObject = this.getObjectModel();
            oObject.setProperty("/Attachment", []);
            this.save();
        }
        
    }));
});