var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var AOFRestAdapter = $.import("sap.ino.xs.aof.rest", "adapter");

var ContentType = {
    Plain : "text/plain",
    JSON : "application/json"
};

var oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);

var handleRequest = function() {

    var sWallSessionUUID = $.request.headers.get("wall-session-uuid");
    if (sWallSessionUUID) {
        if (!/^[0-9A-Z]{32}$/.test(sWallSessionUUID)) {
            throw new Error("Invalid wall session uuid");
        }
        oHQ.statement("set 'WALL_SESSION_UUID' = '" + sWallSessionUUID + "'").execute();
    }

    var iId;
    if ($.request.headers.get("wall-id")) {
        if (!/^[0-9]*$/.test($.request.headers.get("wall-id").trim())) {
            iId = parseInt($.request.headers.get("wall-id").trim(), 10);
        }
        if (!iId || isNaN(iId)) {
            throw new Error("Invalid wall id");
        }
    }

    var aWallId;
    if ($.request.headers.get("wall-wallIds")) {
        if (!/^[0-9,]*$/.test($.request.headers.get("wall-wallIds").trim())) {
            throw new Error("Invalid wall ids");
        }
        aWallId = $.request.headers.get("wall-wallIds").trim().split(",").map(function(item) {
            return parseInt(item, 10);
        });
    }

    var aWallItemId;
    if ($.request.headers.get("wall-wallItemIds")) {
        if (!/^[0-9,]*$/.test($.request.headers.get("wall-wallItemIds").trim())) {
            throw new Error("Invalid wall item ids");
        }
        aWallItemId = $.request.headers.get("wall-wallItemIds").split(",").map(function(item) {
            return parseInt(item, 10);
        });
    }
    
    var vWallItemId;
    if ($.request.headers.get("wall-wallItemId")) {
        if (!/^[0-9]*$/.test($.request.headers.get("wall-wallItemId").trim())) {
            throw new Error("Invalid wall item id");
        }
        vWallItemId = parseInt($.request.headers.get("wall-wallItemId"),10);
    }

    var sLastReadDate = null;
    var sLastRead = $.request.headers.get("wall-last-read");
    if (sLastRead) {
        var oDate = new Date(sLastRead);
        if (isNaN(oDate.getTime())) {
            throw new Error("Invalid last read date");
        }
        sLastReadDate = oDate.toISOString();
    }

    var sAction = $.request.headers.get("wall-action");
    if (sAction) {
        if (!/^[a-zA-Z]*$/.test(sAction)) {
            throw new Error("Invalid action");
        }
    }

    if ($.request.method == $.net.http.GET) {
        switch (sAction) {
            case "read" :
                if (iId > 0) {
                    readWall(iId, sLastReadDate, sWallSessionUUID);
                    return;
                }
                break;
            case "readWalls" :
                if (aWallId && aWallId.length > 0) {
                    readWalls(aWallId, sLastReadDate, sWallSessionUUID);
                    return;
                }
                break;
            case "readItems" :
                if (aWallId && aWallId.length > 0) {
                    readItems4Walls(aWallId, sLastReadDate, sWallSessionUUID);
                    return;
                }
                break;
            case "readItemsById" :
                if (aWallItemId && aWallItemId.length > 0) {
                    readItemsById(aWallItemId, sLastReadDate, sWallSessionUUID);
                    return;
                }
                break;
            case "readItemById" :
                if (vWallItemId) {
                    readItemById(vWallItemId, sLastReadDate, sWallSessionUUID);
                    return;
                }
                break;
            case "" :
            case undefined :
            case null :
                if (getId() > 0) {
                    var aParts = $.request.queryPath.split("/") || [];
                    if (aParts.length === 1) {
                        readWall(getId(), sLastReadDate, sWallSessionUUID);
                    } else {
                       // Delegate to AOF adapter for AOF properties
                        AOFRestAdapter.handleRequest("sap.ino.xs.object.wall.Wall", $.request, $.response);
                    }
                    return;
                }
                break;
            default :
                throw new Error("Invalid action");
        }
        $.response.contentType = ContentType.Plain;
        $.response.setBody("Not found");
        $.response.status = $.net.http.NOT_FOUND;

    } else if ($.request.method == $.net.http.POST || $.request.method == $.net.http.PUT) {
        if ($.request.queryPath.indexOf("/") == -1) {
            handleTransaction(function() {
                var oPayload;
                if ($.request.body) {
                    try {
                        oPayload = JSON.parse($.request.body.asString());
                    } catch (e) {
                        throw new Error("Invalid body");
                    }
                }
                if (_.isObject(oPayload)) {
                    var oWall = oPayload;
                    return writeWall(oWall);
                } else {
                    $.response.contentType = ContentType.Plain;
                    $.response.setBody("No body");
                    $.response.status = $.net.http.BAD_REQUEST;
                }
                return false;
            });
        } else {
            // Delegate to AOF adapter for AOF actions
            AOFRestAdapter.handleRequest("sap.ino.xs.object.wall.Wall", $.request, $.response);
        }
    } else if ($.request.method === $.net.http.DEL) {
        handleTransaction(function() {
            if (getId() > 0) {
                return deleteWalls([getId()]);
            } else if (aWallId) {
                return deleteWalls(aWallId);
            } else if (aWallItemId) {
                return deleteItems(aWallItemId);
            } else {
                $.response.contentType = ContentType.Plain;
                $.response.setBody("Not found");
                $.response.status = $.net.http.NOT_FOUND;
                return false;
            }
        });
    } else {
        $.response.status = $.net.http.METHOD_NOT_ALLOWED;
        $.response.contentType = ContentType.Plain;
        $.response.setBody("Method not allowed");
    }
};

function readWallData(iId, sLastReadDate, sWallSessionUUID) {
    var oWall = readWallObject(iId, sLastReadDate, sWallSessionUUID);
    var aWallItem = [];
    if (oWall || sLastReadDate) {
        aWallItem = readItemObjects([iId], sLastReadDate, sWallSessionUUID) || [];
    }
    if (oWall) {
        oWall.Items = aWallItem;
    } else if (aWallItem && aWallItem.length > 0) {
        oWall = {
            ID : iId,
            ACTION_CODE : "UPDATED",
            ITEM_SCOPE : true
        };
        oWall.Items = aWallItem;
    }
    return oWall;
}

function readWall(iId, sLastReadDate, sWallSessionUUID) {
    var oWall = readWallData(iId, sLastReadDate, sWallSessionUUID);
    if (oWall) {
        setResultResponse(oWall);
    } else {
        var aResults = oHQ.statement('select * from "sap.ino.db.wall.ext::v_ext_wall" where ID = ?').execute(iId);
        if (aResults && aResults.length > 0) {
            $.response.contentType = ContentType.Plain;
            $.response.setBody("Not modified");
            $.response.status = $.net.http.NOT_MODIFIED;
        } else {
            $.response.contentType = ContentType.Plain;
            $.response.setBody("Not found");
            $.response.status = $.net.http.NOT_FOUND;
        }
    }
}

function readWalls(aWallId, sLastReadDate, sWallSessionUUID) {
    var aResult = readWallObjects(aWallId, sLastReadDate, sWallSessionUUID);
    var aItemResult = readItemObjects(aWallId, sLastReadDate, sWallSessionUUID);
    _.each(aResult, function(oResult) {
        oResult.Items = _.filter(aItemResult, function(oItemResult) {
            return oItemResult.WALL_ID == oResult.ID;
        }) || [];
    });
    setResultResponse(aResult);
}

function readWallObjects(aWallId, sLastReadDate, sWallSessionUUID) {
    var aResults = [];
    if (aWallId && aWallId.length > 0) {
        var sStatement;
        if (!sLastReadDate) {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall" where ID in (';
        } else {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_delta" where ACTION_AT > TO_TIMESTAMP(?)';
            if (sWallSessionUUID) {
                sStatement += ' and WALL_SESSION_UUID <> ?';
            }
            sStatement += ' and WALL_ID in (';
        }
        sStatement += _.map(_.range(aWallId.length), _.constant("?")).join(",") + ")";
        var oStatement = oHQ.statement(sStatement);

        if (!sLastReadDate) {
            aResults = oStatement.execute(aWallId);
        } else {
            var aParameter = [sLastReadDate];
            if (sWallSessionUUID) {
                aParameter.push(sWallSessionUUID);
            }
            aParameter = aParameter.concat(aWallId);
            aResults = oStatement.execute(aParameter);
        }
        _.each(aResults, function(oWall) {
            oWall.BackgroundImage = [];
            if (oWall.BACKGROUND_IMAGE_ATTACHMENT_ID > 0) {
                oWall.BackgroundImage = [{
                    ATTACHMENT_ID : oWall.BACKGROUND_IMAGE_ATTACHMENT_ID
                }];
            }
        });
    }
    return aResults;
}

function readWallObject(iId, sLastReadDate, sWallSessionUUID) {
    var sStatement;
    if (!sLastReadDate) {
        sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall" where ID = ?';
    } else {
        sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_delta" where ACTION_AT > TO_TIMESTAMP(?)';
        if (sWallSessionUUID) {
            sStatement += ' and WALL_SESSION_UUID <> ?';
        }
        sStatement += ' and ID = ?';
    }
    var oStatement = oHQ.statement(sStatement);
    var aResults;
    if (!sLastReadDate) {
        aResults = oStatement.execute(iId);
    } else {
        if (sWallSessionUUID) {
            aResults = oStatement.execute(sLastReadDate, sWallSessionUUID, iId);
        } else {
            aResults = oStatement.execute(sLastReadDate, iId);
        }
    }
    if (aResults && aResults.length > 0) {
        var oWall = aResults[0];

        oWall.BackgroundImage = [];
        if (oWall.BACKGROUND_IMAGE_ATTACHMENT_ID > 0) {
            oWall.BackgroundImage = [{
                ATTACHMENT_ID : oWall.BACKGROUND_IMAGE_ATTACHMENT_ID
            }];
        }

        // Read permissions
        oWall.Owner = [];
        oWall.Readers = [];
        oWall.Writers = [];
        oWall.Admins = [];

        var oStmtPermissions = oHQ.statement('select * from "sap.ino.db.wall.ext::v_ext_wall_permission" where OBJECT_ID = ?');
        var aPermissions = oStmtPermissions.execute(iId);
        _.each(aPermissions, function(oPermission) {
            switch (oPermission.ROLE_CODE) {
                case "WALL_OWNER" :
                    oWall.Owner.push(oPermission);
                    break;
                case "WALL_READER" :
                    oWall.Readers.push(oPermission);
                    break;
                case "WALL_WRITER" :
                    oWall.Writers.push(oPermission);
                    break;
                case "WALL_ADMIN" :
                    oWall.Admins.push(oPermission);
                    break;
            }
        });

        return oWall;
    }
    return undefined;
}

function readItemObjects(aWallId, sLastReadDate, sWallSessionUUID) {
    // TODO: Optimization: Check read authorization for aWallId, filter ids... => remove item authorization check
    var aResults = [];
    var aAttachmentResults = [];
    var aAttachments4Walls = [];
    var oItem;
    var sNode;

    if (aWallId && aWallId.length > 0) {
        var sStatement;
        if (!sLastReadDate) {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_item" where WALL_ID in (';
        } else {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_item_delta" where ACTION_AT > TO_TIMESTAMP(?)';
            if (sWallSessionUUID) {
                sStatement += ' and WALL_SESSION_UUID <> ?';
            }
            sStatement += ' and WALL_ID in (';
        }
        sStatement += _.map(_.range(aWallId.length), _.constant("?")).join(",") + ")";
        var oStatement = oHQ.statement(sStatement);

        if (!sLastReadDate) {
            aResults = oStatement.execute(aWallId);
        } else {
            var aParameter = [sLastReadDate];
            if (sWallSessionUUID) {
                aParameter.push(sWallSessionUUID);
            }
            aParameter = aParameter.concat(aWallId);
            aResults = oStatement.execute(aParameter);
        }

        if (aResults && aResults.length > 0) {
            // read all attachments for the used walls
            sStatement = 'select * from "sap.ino.db.attachment.ext::v_ext_attachment_wall_item" where WALL_ID in (';

            var aPlaceholder = [];
            _.each(aResults, function(oItem) {
                if (_.isString(oItem.CONTENT)) {
                    try {
                        oItem.CONTENT = JSON.parse(oItem.CONTENT);
                    } catch (e) {
                        throw new Error("Invalid content json data");
                    }
                }
                if (-1 === _.indexOf(aAttachments4Walls, oItem.WALL_ID)) {
                    aAttachments4Walls.push(oItem.WALL_ID);
                    aPlaceholder.push("?");
                }
            });

            sStatement += aPlaceholder.join(",") + ")";
            oStatement = oHQ.statement(sStatement);

            aAttachmentResults = oStatement.execute(aAttachments4Walls);

            _.each(aAttachmentResults, function(oAttachment) {
                oItem = _.findWhere(aResults, {
                    ID : oAttachment.WALL_ITEM_ID
                });
                if (oItem) {
                    sNode = (oItem.WALL_ITEM_TYPE_CODE === "sap.ino.config.IMAGE" || oItem.WALL_ITEM_TYPE_CODE === "sap.ino.config.PERSON") ? "Image" : "Attachment";
                    if (!oItem[sNode]) {
                        oItem[sNode] = [];
                    }
                    oItem[sNode].push({
                        ATTACHMENT_ID : oAttachment.ATTACHMENT_ID,
                        ID : oAttachment.ID,
                        FILE_NAME : oAttachment.FILE_NAME
                    });
                }
            });
        }
    }
    return aResults;
}

function readItemObjectsById(aWallItemId, sLastReadDate, sWallSessionUUID) {
    // TODO: Optimization: Check read authorization for aWallItemId, filter ids... => remove item authorization check
    var aResults = [];
    var aAttachmentResults = [];
    var aAttachments4Items = [];
    var oItem;
    var sNode;

    if (aWallItemId && aWallItemId.length > 0) {
        var sStatement;
        if (!sLastReadDate) {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_item" where ID in (';
        } else {
            sStatement = 'select * from "sap.ino.db.wall.ext::v_ext_wall_item_delta" where ACTION_AT > TO_TIMESTAMP(?)';
            if (sWallSessionUUID) {
                sStatement += ' and WALL_SESSION_UUID <> ?';
            }
            sStatement += ' and ID in (';
        }
        sStatement += _.map(_.range(aWallItemId.length), _.constant("?")).join(",") + ")";
        var oStatement = oHQ.statement(sStatement);

        if (!sLastReadDate) {
            aResults = oStatement.execute(aWallItemId);
        } else {
            var aParameter = [sLastReadDate];
            if (sWallSessionUUID) {
                aParameter.push(sWallSessionUUID);
            }
            aParameter = aParameter.concat(aWallItemId);
            aResults = oStatement.execute(aParameter);
        }

        if (aResults && aResults.length > 0) {
            // read all attachments for the used walls
            sStatement = 'select * from "sap.ino.db.attachment.ext::v_ext_attachment_wall_item" where WALL_ITEM_ID in (';

            var aPlaceholder = [];
            _.each(aResults, function(oItem) {
                if (_.isString(oItem.CONTENT)) {
                    try {
                        oItem.CONTENT = JSON.parse(oItem.CONTENT);
                    } catch (e) {
                        throw new Error("Invalid content json data");
                    }
                }
                if (-1 === _.indexOf(aAttachments4Items, oItem.ID)) {
                    aAttachments4Items.push(oItem.ID);
                    aPlaceholder.push("?");
                }
            });

            sStatement += aPlaceholder.join(",") + ")";
            oStatement = oHQ.statement(sStatement);

            aAttachmentResults = oStatement.execute(aAttachments4Items);

            _.each(aAttachmentResults, function(oAttachment) {
                oItem = _.findWhere(aResults, {
                    ID : oAttachment.WALL_ITEM_ID
                });
                if (oItem) {
                    sNode = (oItem.WALL_ITEM_TYPE_CODE === "sap.ino.config.IMAGE" || oItem.WALL_ITEM_TYPE_CODE === "sap.ino.config.PERSON") ? "Image" : "Attachment";
                    if (!oItem[sNode]) {
                        oItem[sNode] = [];
                    }
                    oItem[sNode].push({
                        ATTACHMENT_ID : oAttachment.ATTACHMENT_ID,
                        ID : oAttachment.ID,
                        FILE_NAME : oAttachment.FILE_NAME
                    });
                }
            });
        }
    }
    return aResults;
}

function readItems4Walls(aWallId, sLastReadDate, sWallSessionUUID) {
    var aResults = readItemObjects(aWallId, sLastReadDate, sWallSessionUUID);
    setResultResponse(aResults);
}

function readItemsById(aWallItemId, sLastReadDate, sWallSessionUUID) {
    var aResults = readItemObjectsById(aWallItemId, sLastReadDate, sWallSessionUUID);
    setResultResponse(aResults);
}

function readItemById(vWallItemId, sLastReadDate, sWallSessionUUID) {
    var aResults = readItemObjectsById([vWallItemId], sLastReadDate, sWallSessionUUID);
    if(aResults.length === 1) {
        setResultResponse(aResults[0]);
    } else {
        setResultResponse({});
    }
   
}

function writeWall(oWall) {
    var Wall = AOF.getApplicationObject("sap.ino.xs.object.wall.Wall");
    var WallItem = AOF.getApplicationObject("sap.ino.xs.object.wall.WallItem");

    var aWallItem = oWall.Items || [];
    delete oWall.Items;
    delete oWall.Owner;

    if (!oWall.ID) {
        oWall.ID = -1;
    }

    if (oWall.ID < 0) {
        _.each(oWall.Readers || [], function(oReader) {
            if (oReader.ID >= 0) {
                delete oReader.ID;
            }
        });
        _.each(oWall.Writers || [], function(oWriter) {
            if (oWriter.ID >= 0) {
                delete oWriter.ID;
            }
        });
        _.each(oWall.Admins || [], function(oAdmin) {
            if (oAdmin.ID >= 0) {
                delete oAdmin.ID;
            }
        });
        _.each(oWall.BackgroundImage || [], function(oBackgroundImage) {
            if (oBackgroundImage.ID >= 0) {
                delete oBackgroundImage.ID;
            }
        });
    }

    var oResponse = {};

    if (oWall.ID > 0) {
        if (!_.isEmpty(_.difference(_.keys(oWall), ["ID"]))) {
            oResponse = Wall.update(oWall);
        }
    } else {
        oResponse = Wall.create(oWall);
    }

    _.each(oResponse.messages || [], function(oMessage) {
        oMessage.refObject = "WALL";
    });

    var aMessage = oResponse.messages || [];
    var oGeneratedKeys = oResponse.generatedKeys || {};

    var iWallId = oWall.ID > 0 ? oWall.ID : oGeneratedKeys[oWall.ID];

    var oItemWriteMap = {};

    function writeItems(aItem) {
        _.each(aItem, function(oItem) {
            oResponse = {};

            // handle long length for content.
            if(oItem.CONTENT && oItem.CONTENT.length >= 5000){
                var itemObject = JSON.parse(oItem.CONTENT);
                if(itemObject.TEXT){
                    itemObject.TEXT = itemObject.TEXT.substring(0, 4500) + '...';
                }
                oItem.CONTENT = JSON.stringify(itemObject);
            }

            if (oItem.PARENT_WALL_ITEM_ID < 0 && oItemWriteMap[oItem.PARENT_WALL_ITEM_ID]) {
                oItem.PARENT_WALL_ITEM_ID = oItemWriteMap[oItem.PARENT_WALL_ITEM_ID];
            }

            if (oItem.ID > 0) {
                oResponse = WallItem.update(oItem);
                oItemWriteMap[oItem.ID] = oItem.ID;
            } else {
                oResponse = WallItem.create(oItem);
            }

            if (oResponse.messages && oResponse.messages.length > 0) {
                _.each(oResponse.messages, function(oMessage) {
                    oMessage.refObject = "WALL_ITEM";
                });
                aMessage = _.union(aMessage, oResponse.messages);
            }
            if (oResponse.generatedKeys) {
                oGeneratedKeys = _.extend(oGeneratedKeys, oResponse.generatedKeys);
                if (oItem.ID < 0 && oResponse.generatedKeys[oItem.ID]) {
                    oItemWriteMap[oItem.ID] = oResponse.generatedKeys[oItem.ID];
                }
            }
        });

        var aParentId = _.pluck(aItem, "ID");
        var aChildItem = _.filter(aWallItem, function(oWallItem) {
            return oWallItem.PARENT_WALL_ITEM_ID && _.contains(aParentId, oWallItem.PARENT_WALL_ITEM_ID);
        });

        if (aChildItem.length > 0) {
            writeItems(aChildItem);
        }
    }

    if (iWallId > 0) {
        _.each(aWallItem, function(oWallItem) {
            if (oWall.ID < 0 && oWallItem.ID >= 0) {
                delete oWallItem.ID;
            }

            oWallItem.WALL_ID = iWallId;

            if (_.isObject(oWallItem.CONTENT)) {
                oWallItem.CONTENT = JSON.stringify(oWallItem.CONTENT);
            }

            if (!oWallItem.ID || oWallItem.ID < 0) {
                _.each(oWallItem.Image || [], function(oImage) {
                    if (oImage.ID >= 0) {
                        delete oImage.ID;
                    }
                });
                _.each(oWallItem.Attachment || [], function(oAttachment) {
                    if (oAttachment.ID >= 0) {
                        delete oAttachment.ID;
                    }
                });
            }
        });

        var aStartItem = _.filter(aWallItem, function(oWallItem) {
            return !oWallItem.PARENT_WALL_ITEM_ID || oWallItem.PARENT_WALL_ITEM_ID > 0;
        });
        writeItems(aStartItem);
    }

    return handleMessages(aMessage, oGeneratedKeys);
}

function deleteWalls(aWallId) {
    if (aWallId && aWallId.length > 0) {
        var Wall = AOF.getApplicationObject("sap.ino.xs.object.wall.Wall");
        var aMessage = [];
        _.each(aWallId, function(iWallId) {
            var oResponse = Wall.del(iWallId);
            _.each(oResponse.messages || [], function(oMessage) {
                oMessage.refObject = "WALL";
            });
            aMessage = _.union(aMessage, oResponse.messages);
        });
        return handleMessages(aMessage);
    } else {
        $.response.contentType = ContentType.Plain;
        $.response.setBody("No walls specified");
        $.response.status = $.net.http.BAD_REQUEST;
        return false;
    }
}

function deleteItems(aWallItemId) {
    if (aWallItemId && aWallItemId.length > 0) {
        var WallItem = AOF.getApplicationObject("sap.ino.xs.object.wall.WallItem");
        var aMessage = [];
        _.each(aWallItemId, function(iWallItemId) {
            var oResponse = WallItem.del(iWallItemId);
            _.each(oResponse.messages || [], function(oMessage) {
                oMessage.refObject = "WALL_ITEM";
            });
            aMessage = _.union(aMessage, oResponse.messages);
        });
        return handleMessages(aMessage);
    } else {
        $.response.contentType = ContentType.Plain;
        $.response.setBody("No items specified");
        $.response.status = $.net.http.BAD_REQUEST;
        return false;
    }
}

function handleTransaction(fnExecute) {
    var oTransaction;
    try {
        oTransaction = AOF.getTransaction();
        var bSuccess = fnExecute();
        if (bSuccess) {
            oTransaction.commit();
        } else {
            oTransaction.rollback();
        }
    } catch (oException) {
        if (oTransaction) {
            oTransaction.rollback();
        }
        throw oException;
    }
}

function setResultResponse(vData) {
    $.response.contentType = ContentType.JSON;
    $.response.headers.set("Last-Modified", new Date().toGMTString());
    $.response.setBody(JSON.stringify(vData));
    $.response.status = $.net.http.OK;
}

function handleMessages(aMessage, oGeneratedKeys) {
    var iMinSeverity = AOF.MessageSeverity.Success;
    var bFound = true;
    var bAuthError = false;
    if (aMessage && aMessage.length > 0) {
        iMinSeverity = _.min(_.pluck(aMessage, "severity"));
        bFound = !_.find(aMessage, function(oMessage) {
            return oMessage.messageKey === "MSG_OBJECT_NOT_FOUND";
        });
        bAuthError = !!_.find(aMessage, function(oMessage) {
            return oMessage.messageKey.indexOf("AUTH") > -1;
        });
    }
    var bSuccess = iMinSeverity > AOF.MessageSeverity.Error;
    $.response.contentType = ContentType.JSON;
    $.response.setBody(JSON.stringify({
        MESSAGES : AOFRestAdapter.mapMessages(aMessage),
        GENERATED_IDS : bSuccess && oGeneratedKeys && !_.isEmpty(oGeneratedKeys) ? oGeneratedKeys : undefined
    }));
    $.response.status = bFound ? (bSuccess ? $.net.http.OK : (bAuthError ? $.net.http.FORBIDDEN : $.net.http.BAD_REQUEST)) : $.net.http.NOT_FOUND;
    return bSuccess;
}

function getId() {
    var queryPath = $.request.queryPath;
    if (queryPath) {
        var queryPathParts = queryPath.split("/") || [];
        if (queryPathParts.length >= 1 && !isNaN(queryPathParts[0])) {
            var id = parseInt(queryPathParts[0]);
            return id;
        }
    }
    return 0;
}