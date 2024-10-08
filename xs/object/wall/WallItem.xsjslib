var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var check = $.import("sap.ino.xs.aof.lib", "check");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

var WallItem = $.import("sap.ino.xs.object.wall", "WallItem");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var WallMessage = $.import("sap.ino.xs.object.wall", "message");
var WallUtil = $.import("sap.ino.xs.object.wall", "util");

var WallItemType = {
    Group : "sap.ino.config.GROUP",
    Attachment : "sap.ino.config.ATTACHMENT",
    Headline : "sap.ino.config.HEADLINE",
    Image : "sap.ino.config.IMAGE",
    Line : "sap.ino.config.LINE",
    Link : "sap.ino.config.LINK",
    Person : "sap.ino.config.PERSON",
    Sprite : "sap.ino.config.SPRITE",
    Sticker : "sap.ino.config.STICKER",
    Text : "sap.ino.config.TEXT",
    Video : "sap.ino.config.VIDEO",
    Arrow : "sap.ino.config.ARROW"
};

var RefObjectType = {
    Idea : "IDEA"
};

var WallItemDescriptionFields = {
    "sap.ino.config.TEXT" : {
        FIELDS : ["CAPTION", "TEXT"]
    },
    "sap.ino.config.STICKER" : {
        FIELDS : ["TEXT"],
    },
    "sap.ino.config.HEADLINE" : {
        FIELDS : ["TEXT"]
    },
    "sap.ino.config.IMAGE" : {
        FIELDS : ["CAPTION"]
    },
    "sap.ino.config.SPRITE" : {
        FIELDS : ["TEXT"]
    },
    "sap.ino.config.GROUP" : {
        FIELDS : ["TEXT"]
    },
    "sap.ino.config.VIDEO" : {
        FIELDS : ["CAPTION"]
    },
    "sap.ino.config.LINK" : {
        FIELDS : ["TEXT"]
    },
    "sap.ino.config.ATTACHMENT" : {
        FIELDS : ["CAPTION", "TYPE", "FILE_NAME"]
    },
    "sap.ino.config.ARROW" : {
        FIELDS : ["TEXT"]
    }
};

var WallItemContentFields = {
    "sap.ino.config.TEXT" : {
        CAPTION : "STRING",
        TEXT : "STRING"
    },
    "sap.ino.config.STICKER" : {
        COLOR : "HEX_COLOR", // 123DEF
        TEXT : "STRING"
    },
    "sap.ino.config.HEADLINE" : {
        STYLE : "ENUM_HEADLINE_STYLE",
        SIZE : "ENUM_FONT_SIZE",
        TEXT : "STRING"
    },
    "sap.ino.config.IMAGE" : {
        CAPTION : "STRING",
        SHOW_AS_ICON : "BOOLEAN"
    },
    "sap.ino.config.SPRITE" : {
        COLOR : "HEX_COLOR",
        SHAPE : "ENUM_SHAPE",
        TEXT : "STRING"
    },
    "sap.ino.config.GROUP" : {
        COLOR : "HEX_COLOR",
        TEXT : "STRING"
    },
    "sap.ino.config.VIDEO" : {
        URL : "STRING",
        CAPTION : "STRING"
    },
    "sap.ino.config.PERSON" : {
        /*
         * We offer the possibility to store properties of existing users and non-existing users. BUT: We do not save
         * the identity_id as leading property of the existing users, as the user has the possibility to overwrite each
         * property (name, email, ...). To avoid a mismatch of properties and identity_id, the name and email property
         * must be treated as leading before the identity_id. Identity_id is only stored for the case to identify a user
         * and the name is not unique.
         */
        NAME : "STRING",
        PHONE : "STRING",
        EMAIL : "STRING",
        ORIGIN_ID : "NUMBER",
        REQUEST_IMAGE : "BOOLEAN"
    },
    "sap.ino.config.LINK" : {
        TEXT : "STRING",
        URL : "STRING",
        ICON : "ENUM_LINK_ICON_TYPE"
    },
    "sap.ino.config.LINE" : {
        ORIENTATION : "ENUM_ORIENTATION",
        THICKNESS : "NUMBER",
        STYLE : "ENUM_LINE_STYLE",
        COLOR : "HEX_COLOR"
    },
    "sap.ino.config.ATTACHMENT" : {
        CAPTION : "STRING",
        FILE_NAME : "STRING",
        TYPE : "ENUM_ATT_TYPE"
    },
    "sap.ino.config.ARROW" : {
        TEXT : "STRING",
        COLOR : "HEX_COLOR",
        THICKNESS : "NUMBER",
        STYLE : "ENUM_LINE_STYLE",
        HEAD_STYLE : "ENUM_ARROW_HEAD_STYLE",
        X1 : "NUMBER",
        Y1 : "NUMBER",
        X2 : "NUMBER",
        Y2 : "NUMBER"
    }
};

// TODO change this back to uppercase only in with the final version of the wall lib
// enumerations
var WallItemContentEnumSet = {
    ENUM_HEADLINE_STYLE : ["CLEAR", "SIMPLE", "BRAG", "ELEGANT", "COOL"],
    ENUM_FONT_SIZE : ["H1", "H2", "H3", "H4", "H5", "H6"],
    ENUM_SHAPE : ["ROUND", "SQUARE", "MELT", "LEAF", "FLOWER", "SHIELD"],
    ENUM_ATT_TYPE : ["IMAGE", "VIDEO", "AUDIO", "TEXT", "DOCUMENT", "ERROR"],
    ENUM_LINK_ICON_TYPE : ["MISC", "COLLABORATE", "WIKI", "PRIVATE", "WALL", "IDEA"],
    ENUM_ORIENTATION : ["VERTICAL", "HORIZONTAL"],
    ENUM_LINE_STYLE : ["SOLID", "DASHED", "DOTTED"],
    ENUM_ARROW_HEAD_STYLE : ["NONE", "START", "END", "BOTH"]
};

this.definition = {
    actions : {
        create : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.wall::v_auth_wall_write", "WALL_ID", "WALL_ID", WallMessage.AUTH_MISSING_WALL_WRITE),
            historyEvent : "WALL_ITEM_CREATED"
        },
        update : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.wall::v_auth_wall_write", "WALL_ID", "WALL_ID", WallMessage.AUTH_MISSING_WALL_WRITE),
            historyEvent : "WALL_ITEM_UPDATED"
        },
        del : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.wall::v_auth_wall_write", "WALL_ID", "WALL_ID", WallMessage.AUTH_MISSING_WALL_WRITE),
            historyEvent : "WALL_ITEM_DELETED"
        },
        read : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.wall::v_auth_wall", "WALL_ID", "WALL_ID", WallMessage.AUTH_MISSING_WALL_READ)
        },
        copy : {
            authorizationCheck : auth.parentInstanceAccessCheck("sap.ino.db.wall::v_auth_wall_write", "WALL_ID", "WALL_ID", WallMessage.AUTH_MISSING_WALL_WRITE),
            historyEvent : "WALL_ITEM_CREATED"
        }
    },
    Root : {
        table : "sap.ino.db.wall::t_wall_item",
        sequence : "sap.ino.db.wall::s_wall_item",
        historyTable : "sap.ino.db.wall::t_wall_item_h",
        attributes : {
            CREATED_AT : {
                readOnly : true
            },
            CREATED_BY_ID : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            CHANGED_AT : {
                readOnly : true
            },
            CHANGED_BY_ID : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            WALL_ID : {
                foreignKeyTo : "sap.ino.xs.object.wall.Wall.Root"
            },
            PARENT_WALL_ITEM_ID : {
                foreignKeyTo : "sap.ino.xs.object.wall.WallItem.Root"
            },
            WALL_ITEM_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.wall.WallItemType.Root"
            },
            REF_OBJECT_TYPE_CODE : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.aof.object.ApplicationObject.Root"
            },
            DESCRIPTION : {
                readOnly : true
            },
            WALL_SESSION_UUID : {
                readOnly : true
            }
        },
        determinations : {
            onCreate : [initWallItem],
            onModify : [determine.systemAdminData, updateDescription, setWallSession],
            onDelete : [onDelete, setWallSession],
            onCopy : [onCopy],
            onPersist : [setWallSessionAfterDelete]
        },
        consistencyChecks : [check.objectReferenceCheck("REF_OBJECT_TYPE_CODE", "REF_OBJECT_ID", "Root"), contentCheck, sizeCheck, attachmentAssignmentCheck],
        nodes : {
            Image : AttachmentAssignment.node(AttachmentAssignment.ObjectType.WallItem, undefined, AttachmentAssignment.RoleCode.WallItemImage),
            Attachment : AttachmentAssignment.node(AttachmentAssignment.ObjectType.WallItem, undefined, AttachmentAssignment.RoleCode.Attachment)
        }
    }
};

function initWallItem(vKey, oWallItem, oPersistedObject, addMessage, getNextHandle, oContext) {
    if (oWallItem.WALL_ITEM_TYPE_CODE == WallItemType.Idea) {
        oWallItem.REF_OBJECT_TYPE_CODE = RefObjectType.Idea;
    }
}

function updateDescription(vKey, oWallItem, oPersistedObject, addMessage, getNextHandle, oContext) {
    var oContent = parseContent(vKey, oWallItem.CONTENT, addMessage);

    var oDescriptionDef = WallItemDescriptionFields[oWallItem.WALL_ITEM_TYPE_CODE];
    if (!oContent || !oDescriptionDef) {
        oWallItem.DESCRIPTION = "";
        return;
    }
    var sDescription = "";
    _.each(oDescriptionDef.FIELDS, function(sField) {
        if (!sDescription) {
            sDescription = _.stripTags(oContent[sField] || "");
        } else {
            sDescription += " " + _.stripTags(oContent[sField] || "");
        }
    });
    oWallItem.DESCRIPTION = sDescription.substring(0, 5000);
}

function onDelete(vKey, oWallItem, oPersistedObject, addMessage, getNextHandle, oContext) {
    // attachment and image are not deleted immediately but by regular job
}

function onCopy(vKey, oWallItem, oPersistedObject, addMessage, getNextHandle, oContext) {
    // Copy Attachment + Image

    var Attachment = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.attachment.Attachment");
    var iHandle;
    var oResponse;

    // copy Image node
    if (oWallItem.Image && oWallItem.Image.length > 0) {

        iHandle = getNextHandle();
        oResponse = Attachment.copy(oWallItem.Image[0].ATTACHMENT_ID, {
            ID : iHandle
        });
        addMessage(oResponse.messages);

        if (oResponse.generatedKeys[iHandle]) {
            oWallItem.Image = [{
                ATTACHMENT_ID : oResponse.generatedKeys[iHandle]
            }];
        }
    }

    // copy Attachment node
    if (oWallItem.Attachment && oWallItem.Attachment.length > 0) {

        iHandle = getNextHandle();
        oResponse = Attachment.copy(oWallItem.Attachment[0].ATTACHMENT_ID, {
            ID : iHandle
        });
        addMessage(oResponse.messages);

        if (oResponse.generatedKeys[iHandle]) {
            oWallItem.Attachment = [{
                ATTACHMENT_ID : oResponse.generatedKeys[iHandle]
            }];
        }
    }
}

function parseContent(vKey, sJSON, addMessage) {
    var oContent;
    try {
        oContent = JSON.parse(sJSON);
    } catch(oException) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_CONTENT, vKey, "Root", "CONTENT", oException);
    }
    return oContent;
}

function sizeCheck(vKey, oWallItem, addMessage, oContext) {
    // check WIDTH >=0 and HEIGHT >=0
    if (_.isNaN(oWallItem.WIDTH) || !_.isNumber(oWallItem.WIDTH) || oWallItem.WIDTH < 0) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_SIZE, vKey, "Root", "WIDTH");
    }
    if (_.isNaN(oWallItem.HEIGHT) || !_.isNumber(oWallItem.HEIGHT) || oWallItem.HEIGHT < 0) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_SIZE, vKey, "Root", "HEIGHT");
    }
}

function contentCheck(vKey, oWallItem, addMessage, oContext) {
    // Check content fields by item type against WallItemContentFields
    var oContent = parseContent(vKey, oWallItem.CONTENT, addMessage);
    var oDefFields = WallItemContentFields[oWallItem.WALL_ITEM_TYPE_CODE];
    if (!oDefFields) {
        return;
    }

    // check all defined fields are present in instance
    _.each(oDefFields, function(val, key, list) {
        var sFieldName = key;
        var sFieldType = val;
        var vFieldVal = oContent[sFieldName];

        if (vFieldVal === undefined || vFieldVal === null) { // check if field value is provided (not null)
            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_MISSING_CONTENT_FIELD, vKey, "Root", "CONTENT", sFieldName, oWallItem.WALL_ITEM_TYPE_CODE);
        } else {
            if ((typeof vFieldVal).toUpperCase() != sFieldType) {
                // check instance field type = data definition field type
                var sDefType = oDefFields[sFieldName].toUpperCase();
                switch (sDefType) {
                    case "HEX_COLOR" :
                        // color type validation
                        if (!_.isHexColor(vFieldVal)) {
                            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_COLOR, vKey, "Root", "CONTENT", typeof vFieldVal, sFieldName);
                        }
                        break;
                    // check enumerations
                    case "ENUM_HEADLINE_STYLE" :
                    case "ENUM_FONT_SIZE" :
                    case "ENUM_SHAPE" :
                    case "ENUM_ATT_TYPE" :
                    case "ENUM_LINK_ICON_TYPE" :
                    case "ENUM_ORIENTATION" :
                    case "ENUM_LINE_STYLE" :
                    case "ENUM_ARROW_HEAD_STYLE" :
                        var aEnum = WallItemContentEnumSet[sDefType];
                        if (aEnum.indexOf(vFieldVal) === -1) {
                            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_ENUM_VALUE, vKey, "Root", "CONTENT", vFieldVal, sDefType);
                        }
                        break;
                    default :
                        // generic type mismatch
                        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_CONTENT_FIELD_TYPE, vKey, "Root", "CONTENT", typeof vFieldVal, sFieldName);
                }
            }
        }
    });

    // check that instance has no more fields as defined
    _.each(oContent, function(val, key, list) {
        var sFieldName = key;
        var vFieldVal = oDefFields[sFieldName];
        if (vFieldVal === undefined || vFieldVal === null) { // check if field value is provided (not null)
            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_CONTENT_FIELD, vKey, "Root", "CONTENT", sFieldName, oWallItem.WALL_ITEM_TYPE_CODE);
        }
    });
}

function attachmentAssignmentCheck(vKey, oWallItem, addMessage, oContext) {
    if (oWallItem.Image && oWallItem.Image.length > 0 && oWallItem.WALL_ITEM_TYPE_CODE != WallItemType.Image && oWallItem.WALL_ITEM_TYPE_CODE != WallItemType.Person) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_IMAGE_ASSIGNMENT, vKey, "Root", "WALL_ITEM_TYPE_CODE");
    }
    if (oWallItem.Attachment && oWallItem.Attachment.length > 0 && oWallItem.WALL_ITEM_TYPE_CODE != WallItemType.Attachment) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_ITEM_INVALID_ATTACHMENT_ASSIGNMENT, vKey, "Root", "WALL_ITEM_TYPE_CODE");
    }
}

function setWallSession(vKey, oWallItem, oPersistedObject, addMessage, getNextHandle, oContext) {
    WallUtil.setWallSession(oWallItem, oContext.getHQ());
}

function setWallSessionAfterDelete(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata, oActionInfo) {
    if (oContext.getAction().name == "del") {
        WallUtil.updateWallSession("sap.ino.db.wall::t_wall_item_h", vKey, oContext.getRequestTimestamp(), oContext.getHQ());
    }
}