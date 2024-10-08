var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var WallMessage = $.import("sap.ino.xs.object.wall", "message");
var WallUtil = $.import("sap.ino.xs.object.wall", "util");

this.definition = {
    cascadeDelete : ["sap.ino.xs.object.wall.WallItem"],
    actions : {
        create : {
            authorizationCheck : false,
            historyEvent : "WALL_CREATED"
        },
        update : {
            authorizationCheck : auth.instanceAccessCheck("sap.ino.db.wall::v_auth_wall_write", "WALL_ID", WallMessage.AUTH_MISSING_WALL_WRITE),
            executionCheck : updateExecutionCheck,
            historyEvent : "WALL_UPDATED"
        },
        del : {
            authorizationCheck : auth.instanceAccessCheck("sap.ino.db.wall::v_auth_wall_delete", "WALL_ID", WallMessage.AUTH_MISSING_WALL_ADMIN),
            historyEvent : "WALL_DELETED"
        },
        read : {
            authorizationCheck : auth.instanceAccessCheck("sap.ino.db.wall::v_auth_wall", "WALL_ID", WallMessage.AUTH_MISSING_WALL_READ),
        },
        copy : {
            authorizationCheck : auth.instanceAccessCheck("sap.ino.db.wall::v_auth_wall", "WALL_ID", WallMessage.AUTH_MISSING_WALL_READ),
            historyEvent : "WALL_CREATED"
        }
    },
    Root : {
        table : "sap.ino.db.wall::t_wall",
        sequence : "sap.ino.db.wall::s_wall",
        historyTable : "sap.ino.db.wall::t_wall_h",
        attributes : {
            CREATED_AT : {
                readOnly : true
            },
            CREATED_BY_ID : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            CHANGED_AT : {
                readOnly : true,
            },
            CHANGED_BY_ID : {
                readOnly : true,
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            },
            WALL_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.wall.WallType.Root"
            },
            IS_LOCKED : {
                readOnly : true
            },
            WALL_SESSION_UUID : {
                readOnly : true
            },
            VIEW_COUNT : {
                readOnly : true
            }
        },
        determinations : {
            onCreate : [initWall],
            onModify : [determine.systemAdminData, determineBackground, setWallSession],
            onDelete : [setWallSession],
            onCopy : [onCopy],
            onRead : [lockAssignedWall],
            onPersist : [copyWallItemsAfterCopy, setWallSessionAfterDelete]
        },
        consistencyChecks : [backgroundColorCheck, backgroundImagePositionCheck, backgroundImageZoomCheck, distinctUserPermissionCheck],
        nodes : {
            Owner : IdentityRole.node(IdentityRole.ObjectType.Wall, IdentityRole.Role.WallOwner, true),
            Readers : IdentityRole.node(IdentityRole.ObjectType.Wall, IdentityRole.Role.WallReader, false),
            Writers : IdentityRole.node(IdentityRole.ObjectType.Wall, IdentityRole.Role.WallWriter, false),
            Admins : IdentityRole.node(IdentityRole.ObjectType.Wall, IdentityRole.Role.WallAdmin, false),
            BackgroundImage : AttachmentAssignment.node(AttachmentAssignment.ObjectType.Wall, undefined, AttachmentAssignment.RoleCode.WallBackgroundImage)
        }
    }
};

function initWall(vKey, oWall, oPersistedObject, addMessage, getNextHandle, oContext) {
    oWall.Owner = [{
        IDENTITY_ID : oContext.getUser().ID
    }];

    if (!oWall.BACKGROUND_COLOR && !oWall.BACKGROUND_IMAGE_URL && oWall.BackgroundImage.length === 0) {
        oWall.BACKGROUND_COLOR = "FFFFFF";
    }
}

function updateExecutionCheck(vKey, oChangeRequest, oWall, oPersistedWall, addMessage, oContext) {
    if (oWall.IS_LOCKED === 1) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_IS_LOCKED, vKey, "Root", "IS_LOCKED");
    }
    if (oChangeRequest.Readers || oChangeRequest.Writers || oChangeRequest.Admins) {
        var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.wall::v_auth_wall_admin", "WALL_ID", WallMessage.AUTH_MISSING_WALL_ADMIN);
        fnInstanceCheck(oWall.ID, oChangeRequest, addMessage, oContext);
    }
}
    
function onCopy(vKey, oWall, oPersistedObject, addMessage, getNextHandle, oContext) {
    initWall(vKey, oWall, oPersistedObject, addMessage, getNextHandle, oContext);
    oWall.Readers = [];
    oWall.Writers = [];
    oWall.Admins = [];

    if (oWall.BackgroundImage && oWall.BackgroundImage.length > 0) {

        var Attachment = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.attachment.Attachment");

        var iHandle = getNextHandle();
        var oResponse = Attachment.copy(oWall.BackgroundImage[0].ATTACHMENT_ID, {
            ID : iHandle
        });

        addMessage(oResponse.messages);

        if (oResponse.generatedKeys[iHandle]) {
            oWall.BackgroundImage = [{
                ATTACHMENT_ID : oResponse.generatedKeys[iHandle]
            }];
        }
    }
}

function determineBackground(vKey, oWall, oPersistedObject, addMessage, getNextHandle, oContext) {
    
    var bBackgroundColorChanged, bBackgroundURLChanged, bBackgroundCustomImageChanged;
    
    if (oPersistedObject) {
        bBackgroundColorChanged = !!oWall.BACKGROUND_COLOR && oWall.BACKGROUND_COLOR !== oPersistedObject.BACKGROUND_COLOR; 
        bBackgroundURLChanged = !!oWall.BACKGROUND_IMAGE_URL && oWall.BACKGROUND_IMAGE_URL !== oPersistedObject.BACKGROUND_IMAGE_URL;
        bBackgroundCustomImageChanged = !!oWall.BackgroundImage && oWall.BackgroundImage.length > 0 && oWall.BackgroundImage.length !== oPersistedObject.BackgroundImage.length;
    } else {
        // for new wall
        bBackgroundColorChanged = !!oWall.BACKGROUND_COLOR; 
        bBackgroundURLChanged = !!oWall.BACKGROUND_IMAGE_URL;
        bBackgroundCustomImageChanged = !!oWall.BackgroundImage  && oWall.BackgroundImage.length > 0;
    }
    var iChangeCount = (bBackgroundColorChanged ? 1 : 0) + (bBackgroundURLChanged ? 1 : 0) + (bBackgroundCustomImageChanged ? 1 : 0);
    if (iChangeCount > 1) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_AMBIGUOUS_BACKGROUND_CHANGES, vKey, "Root", "BACKGROUND_COLOR");
    }

    if (bBackgroundColorChanged) {
        oWall.BACKGROUND_IMAGE_URL = null;
        oWall.BACKGROUND_IMAGE_ZOOM = null;
        oWall.BACKGROUND_IMAGE_POSITION_X = null;
        oWall.BACKGROUND_IMAGE_POSITION_Y = null;
        oWall.BACKGROUND_IMAGE_WIDTH = null;
        oWall.BACKGROUND_IMAGE_HEIGHT = null;
        oWall.BACKGROUND_IMAGE_REPEAT = null;
        oWall.BackgroundImage = [];
    }
    if (bBackgroundURLChanged) {
        oWall.BACKGROUND_COLOR = null;
        oWall.BACKGROUND_IMAGE_ZOOM = null;
        oWall.BACKGROUND_IMAGE_POSITION_X = null;
        oWall.BACKGROUND_IMAGE_POSITION_Y = null;
        oWall.BACKGROUND_IMAGE_WIDTH = null;
        oWall.BACKGROUND_IMAGE_HEIGHT = null;
        oWall.BACKGROUND_IMAGE_REPEAT = null;
        oWall.BackgroundImage = [];
    }
    if (bBackgroundCustomImageChanged) {
        oWall.BACKGROUND_COLOR = null;
        oWall.BACKGROUND_IMAGE_URL = null;
    }
}

function backgroundColorCheck(vKey, oWall, addMessage, oContext, oNodeMetadata) {
    if (oWall.BACKGROUND_COLOR && !_.isHexColor(oWall.BACKGROUND_COLOR)) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_INVALID_BACKGROUND_COLOR, vKey, "Root", "BACKGROUND_COLOR", oWall.BACKGROUND_COLOR);
    }
}

function backgroundImagePositionCheck(vKey, oWall, addMessage, oContext, oNodeMetadata) {
    if (oWall.BackgroundImage && oWall.BackgroundImage.length > 0) {
        if (!_.isNumber(oWall.BACKGROUND_IMAGE_POSITION_X) || oWall.BACKGROUND_IMAGE_POSITION_X < 0 || !_.isNumber(oWall.BACKGROUND_IMAGE_POSITION_Y) || oWall.BACKGROUND_IMAGE_POSITION_Y < 0) {
            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_INVALID_BACKGROUND_POS, vKey, "Root");
        }
    }
}

function backgroundImageZoomCheck(vKey, oWall, addMessage, oContext, oNodeMetadata) {
    if (oWall.BackgroundImage && oWall.BackgroundImage.length > 0) {
        if (!_.isNumber(oWall.BACKGROUND_IMAGE_ZOOM) || oWall.BACKGROUND_IMAGE_ZOOM <= 0) {
            addMessage(Message.MessageSeverity.Error, WallMessage.WALL_INVALID_BACKGROUND_ZOOM, vKey, "Root");
        }
    }
    
    if (oWall.BACKGROUND_IMAGE_ZOOM && oWall.BACKGROUND_IMAGE_ZOOM > 0 && !(oWall.BackgroundImage && oWall.BackgroundImage.length > 0)) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_INVALID_BACKGROUND_ZOOM, vKey, "Root");
    }
}

function lockAssignedWall(vKey, oReadObject, oNodeMetadata, oContext) {
    var oStatement = oContext.getHQ().statement("select ID from \"sap.ino.db.wall::t_wall_assignment\" where WALL_ID = ?");
    var aResult = oStatement.execute(oReadObject.ID);
    if (aResult.length > 0) {
        oReadObject.IS_LOCKED = 1;
    }
}

function copyWallItemsAfterCopy(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata, oActionInfo) {
    var WallItem = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.wall.WallItem");
    var aResult;
    var oItemCopyMap = {};
    
    function copyItems(aItem) {
        _.each(aItem, function(oItem) {
            var oResponse = WallItem.copy(oItem.ID, {
                ID : -1,
                WALL_ID : oWorkObject.ID,
                PARENT_WALL_ITEM_ID : oItem.PARENT_WALL_ITEM_ID ? oItemCopyMap[oItem.PARENT_WALL_ITEM_ID] : undefined
            });
            if (oResponse.generatedKeys && oResponse.generatedKeys[-1]) {
                oItemCopyMap[oItem.ID] = oResponse.generatedKeys[-1];
            }
            addMessage(oResponse.messages);
        });
        
        var aParentId = _.pluck(aItem, "ID");
        var aChildItem = _.filter(aResult, function(oResult) {
            return oResult.PARENT_WALL_ITEM_ID && _.contains(aParentId, oResult.PARENT_WALL_ITEM_ID);
        });

        if (aChildItem.length > 0) {
            copyItems(aChildItem);
        }
    }

    if (oContext.getAction().name === "copy") {
        var oStatement = oContext.getHQ().statement("select ID, PARENT_WALL_ITEM_ID from \"sap.ino.db.wall::t_wall_item\" where WALL_ID = ?");
        aResult = oStatement.execute(oActionInfo.originalKey); 
        if (aResult.length > 0) {
            var aRootItem = _.filter(aResult, function(oResult) {
                return !oResult.PARENT_WALL_ITEM_ID;
            });
            copyItems(aRootItem);
        }
    }
}

function distinctUserPermissionCheck(vKey, oWall, addMessage, oContext, oNodeMetadata) {
    var aDistinctUsers = _.uniq(_.pluck(_.union(oWall.Owner, oWall.Readers, oWall.Writers, oWall.Admins), "IDENTITY_ID"));
    if (aDistinctUsers.length < oWall.Owner.length + oWall.Readers.length + oWall.Writers.length + oWall.Admins.length) {
        addMessage(Message.MessageSeverity.Error, WallMessage.WALL_NON_DISTINCT_USER_PERMISSION, vKey, "Root");
    }
}

function setWallSession(vKey, oWall, oPersistedObject, addMessage, getNextHandle, oContext) {
    WallUtil.setWallSession(oWall, oContext.getHQ());
}

function setWallSessionAfterDelete(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata, oActionInfo) {
    if (oContext.getAction().name == "del") {
        WallUtil.updateWallSession("sap.ino.db.wall::t_wall_h", vKey, oContext.getRequestTimestamp(), oContext.getHQ());
    }
}