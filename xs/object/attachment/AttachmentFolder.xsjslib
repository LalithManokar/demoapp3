var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var AttachmentMessage = $.import("sap.ino.xs.object.attachment", "message");

this.definition = {
    actions : {
        create : {
            authorizationCheck : false,
            historyEvent : "FOLDER_CREATED"
        },
        update : {
            authorizationCheck : auth.instanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_update", "FOLDER_ID",
                    AttachmentMessage.AUTH_MISSING_FOLDER_UPDATE),
            historyEvent : "FOLDER_UPDATED"
        },
        del : {
            authorizationCheck : auth.instanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_delete", "FOLDER_ID",
                    AttachmentMessage.AUTH_MISSING_FOLDER_DELETE),
            historyEvent : "FOLDER_DELETED"
        },
        read : {
            authorizationCheck : auth.instanceAccessCheck("sap.ino.db.attachment.folder::v_auth_attachment_folder_read",
                    "FOLDER_ID", AttachmentMessage.AUTH_MISSING_FOLDER_READ)
        }
    },
    Root : {
        table : "sap.ino.db.attachment.folder::t_attachment_folder",
        sequence : "sap.ino.db.attachment.folder::s_attachment_folder",
        determinations : {
            onCreate : [createOwner],
            onModify : [determine.systemAdminData],
            onDelete : [deleteCascading]
        },
        nodes : {
            Owner : IdentityRole.node(IdentityRole.ObjectType.AttachmentFolder,
                    IdentityRole.Role.AttachmentFolderOwner, true)
        },
        attributes : {
            NAME : {
                required : true
            },
            CREATED_AT : {
                readOnly : true
            },
            CREATED_BY_ID : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true
            },
            CHANGED_BY_ID : {
                readOnly : true
            }
        }
    }
};

function createOwner(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    var iUserId = oContext.getUser().ID;
    oWorkObject.Owner = [{
        ID : getNextHandle(),
        IDENTITY_ID : iUserId
    }];
}

function deleteCascading(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    var oHQ = oContext.getHQ();
    var AOF = $.import("sap.ino.xs.aof.core", "framework");

    var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");

    var aAttachments = oHQ.statement("select ID from \"sap.ino.db.attachment::v_attachment\" where folder_id = ?")
            .execute(oPersistedObject.ID);

    _.each(aAttachments, function(oAttachment) {
        var oDeleteResponse = Attachment.del(oAttachment.ID);
        _.each(oDeleteResponse.messages, function(oMessage) {
            addMessage(oMessage);
        });
    });

    var AttachmentFolderShare = AOF.getApplicationObject("sap.ino.xs.object.attachment.AttachmentFolderShare");

    var aAttachmentFolderShare = oHQ.statement(
            "select ID from \"sap.ino.db.attachment.folder::t_attachment_folder_share\" where folder_id = ?").execute(
            oPersistedObject.ID);

    _.each(aAttachmentFolderShare, function(oAttachmentFolderShare) {
        var oDeleteResponse = AttachmentFolderShare.del(oAttachmentFolderShare.ID);
        _.each(oDeleteResponse.messages, function(oMessage) {
            addMessage(oMessage);
        });
    });
}