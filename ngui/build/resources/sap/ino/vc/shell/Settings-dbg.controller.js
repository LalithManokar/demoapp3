sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/UserSettings",
    "sap/ino/commons/models/object/Attachment",
   "sap/m/MessageToast",
   "sap/ino/commons/models/core/ModelSynchronizer"
], function (BaseController,
             Configuration,
             UserSettings,
             Attachment,
             MessageToast,
             ModelSynchronizer) {
    "use strict";

    return BaseController.extend("sap.ino.vc.shell.Settings", {

        formatter : jQuery.extend({
            mailLanguageText : function(sDefaultText, sCode) {
                return sDefaultText;
                // var sText = this.getText(sCode);
                // if (sText === sCode || sText === "") {
                //     return sDefaultText;
                // }
                // return sText;
            }
        }, BaseController.prototype.formatter),

        onInit : function () {
            BaseController.prototype.onInit.apply(this, arguments);

            this.setViewProperty("/EDIT", true);
            this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());

            this.aBusyControls = [this.byId("userSettings")];
        },
        
        setUserDataModel : function (oUserDataModel) {
            this._oUserDataModel = oUserDataModel;
        },
        
        onBeforeRendering : function(){
            var iUserId = Configuration.getCurrentUser().USER_ID;
            var oUserSettings = new UserSettings(iUserId, {
                continuousUse : true,
                actions : ["updateUserLocale"],
                readSource : {
                    model : this.getDefaultODataModel()
                }
            });
            this.setObjectModel(oUserSettings);
            this.bindDefaultODataModel(iUserId); 
            if (this._oUserDataModel) {
                ModelSynchronizer.addAOInstanceDependency(oUserSettings, this._oUserDataModel, function(oAOInstance, oDependentModel){
                    if (oAOInstance && oAOInstance.getProperty("/Settings") && oDependentModel) {
                        oDependentModel.setProperty("/IMAGE_ID", oAOInstance.getProperty("/Settings").TITLE_IMAGE_ID);
                    }
                });
            }
        },
        
        getODataEntitySet : function() {
            return "Identity";
        },
        
        onFileUploaderChange : function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFile = oEvent.getParameter("files");
            oFileUploader.setBusy(true);
            Attachment.prepareFileUploader(oFileUploader, aFile);
        },
        
        onFileUploaderComplete : function(oEvent) {
            var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
            var oFileUploader = oEvent.getSource();
            if (oResponse) {
                var oObject = this.getObjectModel();
                if (oResponse.success) {
                    oObject.setUserImage({
                        "ATTACHMENT_ID" : oResponse.attachmentId,
                        "FILE_NAME" : oResponse.fileName,
                        "MEDIA_TYPE" : oResponse.mediaType
                    });
                } else {
                    MessageToast.show(this.getText("SETTINGS_MSG_USER_IMAGE_FAILED"));
                }
            } else {
                MessageToast.show(this.getText("SETTINGS_MSG_USER_IMAGE_ERROR"));
            }
            oFileUploader.setBusy(false);
            oFileUploader.clear();
        },
        
        onImageSettingClear : function(oEvent) {
            var oObject = this.getObjectModel();
            oObject.clearUserImage();
            var oFileUploader = this.byId("imageSettingUploader");
            oFileUploader.setValue(null);
        }

    });
});