/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.UserSettings");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    var AttachmentRole = {
        UserImage: "IDENTITY_IMAGE"
    };

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.UserSettings", {
        objectName: "sap.ino.xs.object.iam.UserSettings",
        readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Identity", {
            includeNodes: [{
                name: "Settings",
                parentNode: "Root"
            }, {
                name: "Attachments",
                parentNode: "Root"
            }]
        }),
        actions: {
            create: {
                enabledCheck: function(oUserSettings, bEnabled) {
                    return false;
                }
            }
        },
        setUserImage: setUserImage,
        clearUserImage: clearUserImage
    });

    function setUserImage(oInput) {
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
        this.setProperty("/Attachments", []);
        this.setProperty("/Settings/TITLE_IMAGE_ASSIGN_ID", null);
        this.setProperty("/Settings/TITLE_IMAGE_ID", null);
        this.setProperty("/Settings/TITLE_IMAGE_MEDIA_TYPE", null);
    }
})();