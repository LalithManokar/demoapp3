/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
    "use strict";

    var AttachmentRole = {
        UserImage: "IDENTITY_IMAGE"
    };
    
    var Theme = {
        HCB : "sap_hcb"
    };

    var Mail = {
        Active : "active",
        Inactive : "inactive"
    };

    var UserSettings = ApplicationObject.extend("sap.ino.commons.models.object.UserSettings", {
        objectName : "sap.ino.xs.object.iam.UserSettings",
        readSource : ReadSource.getDefaultODataSource("Identity", {
            includeNodes: [{
                name: "Settings",
                parentNode: "Root"
            }, {
                name: "Attachments",
                parentNode: "Root"
            }]
        }),
        actions : {
            create : {
                enabledCheck: function() {
                    return false;
                }
            }
        },
        setUserImage: setUserImage,
        clearUserImage: clearUserImage
    });
    
    UserSettings.Mail = Mail;
    UserSettings.Theme = Theme;
	    
    function setUserImage(oInput) {
        /* jshint validthis: true */
        var aAttachments = this.getProperty("/Attachments");
        var oUserImage;
        if (aAttachments === undefined || aAttachments === null || aAttachments.length === 0) {
            oUserImage = {};
            oUserImage.ID = this.getNextHandle();
        } else {
            oUserImage = aAttachments[0];
        }
    
        oUserImage.ATTACHMENT_ID = oInput.ATTACHMENT_ID;
        oUserImage.FILE_NAME = oInput.FILE_NAME;
        oUserImage.MEDIA_TYPE = oInput.MEDIA_TYPE;
        oUserImage.ROLE_TYPE_CODE = AttachmentRole.UserImage;
    
        this.setProperty("/Settings/TITLE_IMAGE_ASSIGN_ID", oUserImage.ID);
        this.setProperty("/Settings/TITLE_IMAGE_ID", oUserImage.ATTACHMENT_ID);
        this.setProperty("/Settings/TITLE_IMAGE_MEDIA_TYPE", oUserImage.MEDIA_TYPE);
        this.setProperty("/Attachments", [oUserImage]);
    }

    function clearUserImage() {
        /* jshint validthis: true */
        this.setProperty("/Attachments", []);
        this.setProperty("/Settings/TITLE_IMAGE_ASSIGN_ID", null);
        this.setProperty("/Settings/TITLE_IMAGE_ID", null);
        this.setProperty("/Settings/TITLE_IMAGE_MEDIA_TYPE", null);
    }
    
    return UserSettings;
});