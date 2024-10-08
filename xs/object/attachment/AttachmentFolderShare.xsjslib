var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var Message = $.import("sap.ino.xs.aof.lib", "message");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var AttachmentMessage = $.import("sap.ino.xs.object.attachment", "message");

this.definition = {
    actions : {
        create : {
            authorizationCheck : auth.parentInstanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_share_create", "FOLDER_ID", 
                    "FOLDER_ID", AttachmentMessage.AUTH_MISSING_FOLDER_SHARE_CREATE),
            historyEvent : "SHARE_CREATED"
        },
        update : {
            authorizationCheck : auth.parentInstanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_share_update", "FOLDER_ID", 
                    "FOLDER_ID", AttachmentMessage.AUTH_MISSING_FOLDER_SHARE_UPDATE),
            historyEvent : "SHARE_UPDATED"
        },
        del : {
            authorizationCheck : auth.parentInstanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_share_delete", "FOLDER_ID", 
                    "FOLDER_ID", AttachmentMessage.AUTH_MISSING_FOLDER_SHARE_DELETE),
            historyEvent : "SHARE_DELETED"
        },
        read : {
            authorizationCheck : auth.parentInstanceAccessCheck(
                    "sap.ino.db.attachment.folder::v_auth_attachment_folder_share_read", "FOLDER_ID", 
                    "FOLDER_ID", AttachmentMessage.AUTH_MISSING_FOLDER_SHARE_READ)
        }
    },
    Root : {
        table : "sap.ino.db.attachment.folder::t_attachment_folder_share",
        sequence : "sap.ino.db.attachment.folder::s_attachment_folder_share",
        determinations : {
            onCreate : [createOwner, createAccessor],
            onModify : [determine.systemAdminData]            
        },
        nodes : {
            Owner : IdentityRole.node(IdentityRole.ObjectType.AttachmentFolderShare,
                    IdentityRole.Role.AttachmentFolderOwner, true),
            Accessor : IdentityRole.node(IdentityRole.ObjectType.AttachmentFolderShare,
                    IdentityRole.Role.AttachmentFolderAccessor, true),
        },
        consistencyChecks : [duplicateFolderIdentityCheck],
        attributes : {
            FOLDER_ID : {
                foreignKeyTo : "sap.ino.xs.object.attachment.AttachmentFolder.Root"
            },
            IDENTITY_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
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

function createAccessor(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    if (oWorkObject.IDENTITY_ID) {
        oWorkObject.Accessor = [{
            ID : getNextHandle(),
            IDENTITY_ID : oWorkObject.IDENTITY_ID
        }];
    } else {
        oWorkObject.Accessor = [];
    }
}

function duplicateFolderIdentityCheck(vKey, oWorkObjectNode, addMessage, oContext) {
    var oHQ = oContext.getHQ();
    var aExistingFolderShare = oHQ
            .statement(
                    "select ID from \"sap.ino.db.attachment.folder::t_attachment_folder_share\" where folder_id = ? and identity_id = ?")
            .execute(oWorkObjectNode.FOLDER_ID, oWorkObjectNode.IDENTITY_ID);
    if (aExistingFolderShare.length > 0) {
        addMessage(Message.MessageSeverity.Error, AttachmentMessage.DUPLICATE_FOLDER_SHARE, vKey, "Root", "IDENTITY_ID");
    }
}