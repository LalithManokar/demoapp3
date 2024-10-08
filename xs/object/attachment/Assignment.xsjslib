var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var check = $.import("sap.ino.xs.aof.lib", "check");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var AttachmentMessage = $.import("sap.ino.xs.object.attachment", "message");

var ObjectType = this.ObjectType = {
    Idea : "IDEA",
    Campaign : "CAMPAIGN",
    Identity : "IDENTITY",
    Wall : "WALL",
    WallItem : "WALL_ITEM",
    LocalSystemSetting : "LOCAL_SYSTEM_SETTING",
    Blog : "BLOG",
    BlogContent : "BLOGCONTENT",
    Milestone: "MILESTONE",
    Comment: "COMMENT",
    Evaluation: "EVALUATION",
    IdeaContentImg: "IDEACONTENT",
    Dimension:"DIMENSION_BADGE"
};

var RoleCode = this.RoleCode = {
    Attachment : "ATTACHMENT",
    IdeaTitleImage : "IDEA_TITLE_IMAGE",
    WallBackgroundImage : "WALL_BG_IMAGE",
    WallItemImage : "WALL_ITEM_IMAGE",
    CommentContentImg: "COMMENT_CONTENT_IMG",
    BlogContentImg: "BLOG_CONTENT_IMG",
    IdeaContentImg: "IDEA_CONTENT_IMG",
    DimensionBadgeImg:"DIMENSION_BADGE_IMG"
};

var FilterTypeCode = this.FilterTypeCode = {
    Frontoffice : "FRONTOFFICE",
    Backoffice : "BACKOFFICE"
};

function node(sObjectType, sFilterType, sRoleType) {
    return {
        table : "sap.ino.db.attachment::t_attachment_assignment",
        historyTable : "sap.ino.db.attachment::t_attachment_assignment_h",
        sequence : "sap.ino.db.attachment::s_attachment_assignment",
        parentKey : "OWNER_ID",
        consistencyChecks : [check.duplicateCheck("ATTACHMENT_ID", AttachmentMessage.ATTACHMENT_DUPLICATE_ASSIGNMENT), duplicateRoleTypeCheck, invalidMediaTypeCheck, filterTypeRoleTypeCheck, checkVideoEnabled],
        attributes : {
            ATTACHMENT_ID : {
                foreignKeyTo : "sap.ino.xs.object.attachment.Attachment.Root"
            },
            OWNER_TYPE_CODE : {
                constantKey : sObjectType
            },
            ROLE_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.attachment.AttachmentRoleType.Root",
                constantKey : sRoleType
            },
            FILTER_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.attachment.AttachmentFilterType.Root",
                constantKey : sFilterType
            }
        }
    };
}

function duplicateRoleTypeCheck(vKey, aWorkObjectNode, addMessage, oContext) {
    if (!_.isArray(aWorkObjectNode)) {
        return;
    }

    var aRoleTypeCodes = ["IDEA_TITLE_IMAGE", "CAMPAIGN_DETAIL_IMG", "USER_IMAGE", "WALL_BG_IMAGE"];

    var aAssignmentsPerTypeCode = _.groupBy(aWorkObjectNode, function(oAssignment) {
        return oAssignment.ROLE_TYPE_CODE;
    });

    _.each(aRoleTypeCodes, function(sRoleTypeCode) {
        var aAssignments = aAssignmentsPerTypeCode[sRoleTypeCode];
        if (aAssignments && aAssignments.length > 1) {
            addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_DUPLICATE_ROLE_TYPE, vKey, "Attachments", "ROLE_TYPE_CODE", sRoleTypeCode);
        }
    });
}

function invalidMediaTypeCheck(vKey, aWorkObjectNode, addMessage, oContext) {
    if (!_.isArray(aWorkObjectNode)) {
        return;
    }
    var oHQ = oContext.getHQ();
    _.each(aWorkObjectNode, function(oWorkObjectNode) {
        var aInvalidAttachment = oHQ.statement("select ID from \"sap.ino.db.attachment::v_attachment_invalid_media_type\" where id = ? and role_type_code = ?").execute(oWorkObjectNode.ATTACHMENT_ID, oWorkObjectNode.ROLE_TYPE_CODE);
        if (aInvalidAttachment.length > 0) {
            addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_INVALID_MEDIA_TYPE, vKey, "Attachments", "ATTACHMENT_ID", oWorkObjectNode.ATTACHMENT_ID);
        }
    });
}

function filterTypeRoleTypeCheck(vKey, aWorkObjectNode, addMessage, oContext) {
    if (!_.isArray(aWorkObjectNode)) {
        return;
    }
    _.each(aWorkObjectNode, function(oWorkObjectNode) {
        if (FilterTypeCode.Backoffice == oWorkObjectNode.FILTER_TYPE_CODE && RoleCode.IdeaTitleImage == oWorkObjectNode.ROLE_TYPE_CODE) {
            addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_INVALID_ROLE_TYPE, vKey, "Attachments", "ROLE_TYPE_CODE", oWorkObjectNode.ATTACHMENT_ID);
        }
    });
}

function checkVideoEnabled(vKey, aWorkObjectNode, addMessage, oContext) {
    var oHQ = oContext.getHQ();
    var aResult = oHQ.statement("select VALUE from \"sap.ino.db.basis::t_system_setting\" where code = ?").execute('sap.ino.config.CREATE_IDEA_VIDEO_ACTIVE');
    var bVideoEnabled = aResult.length > 0 && aResult[0].VALUE == 1;
    if (!bVideoEnabled) {
        _.each(aWorkObjectNode, function(oWorkObjectNode) {
            if (oWorkObjectNode.ROLE_TYPE_CODE != RoleCode.Attachment) {
                var aAttachment = oHQ.statement("select MEDIA_TYPE from \"sap.ino.db.attachment::v_attachment\" where id = ?").execute(oWorkObjectNode.ATTACHMENT_ID);
                if (aAttachment.length > 0 && aAttachment[0].MEDIA_TYPE.indexOf("video/") === 0) {
                    addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_VIDEO_NOT_ENABLED, vKey, "Attachments", "ATTACHMENT_ID", oWorkObjectNode.ATTACHMENT_ID);
                }
            }
        });
    }
}

function getAttachmentDownloadUrl(oHQ) {
    var sAttachmentPath = "";
    var sSelect = 'select value from "SAP_INO_EXT"."sap.ino.db.basis.ext::v_ext_system_setting" where code = ?';
    var aResult = oHQ.statement(sSelect).execute("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD");
    if (aResult.length >= 0) {
        sAttachmentPath = aResult[0].VALUE;
        if (sAttachmentPath.lastIndexOf("/") === sAttachmentPath.length - 1) {
            sAttachmentPath = sAttachmentPath.substr(0, sAttachmentPath.length - 1);
        }
    }
    return sAttachmentPath;
}

function replaceAttachmentReference(sText, sAttachmentPath, iAttachmentId, iAttachmentIdNew) {
    if (sAttachmentPath) {
        var rExp = new RegExp(sAttachmentPath + "/" + iAttachmentId, 'g');
        sText = sText.replace(rExp, sAttachmentPath + "/" + iAttachmentIdNew);
    }
    return sText;
}