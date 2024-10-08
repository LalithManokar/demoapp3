/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/application/Configuration"
], function(Configuration) {
    "use strict";

    var WallMode = {
        Readonly : "Readonly",
        Write : "Write"
    };

    var _fnFormatWallUnitOfLength = function(vValue) {
        return vValue ? vValue + "px" : "0px";
    };

    var _fnFormatInoUnitOfLength = function(vValue) {
        return parseInt(vValue, 10);
    };

    var _fnMapColor = function(sValue) {
        return _oColorMapping[sValue];
    };

    var _fnURLtoID = function(sURL) {
        return sURL ? parseInt(sURL.substring(sURL.lastIndexOf("/") + 1), 10) : undefined;
    };

    var _fnIDtoURL = function(iID) {
        return Configuration.getAttachmentDownloadURL(iID);
    };

    var _oColorMapping = {
        "Yellow" : "FCF294",
        "FCF294" : "Yellow",
        "Pink" : "E5B0E8",
        "E5B0E8" : "Pink",
        "Cyan" : "87E0FD",
        "87E0FD" : "Cyan",
        "Green" : "D2FF52",
        "D2FF52" : "Green",
        "Neutral" : "FFFFFF",
        "FFFFFF" : "Neutral",
        "Orange" : "FFA84C",
        "FFA84C" : "Orange",
        "Red" : "FF3019",
        "FF3019" : "Red",
        "Rose" : "F9D6D6",
        "F9D6D6" : "Rose",
        "Lavender" : "C4C6FF",
        "C4C6FF" : "Lavender",
        "Black" : "45484D",
        "45484D" : "Black"
    };

    var _fnToInoColor = function(sValue) {
        if (sValue.length === 7 && sValue[0] === "#") {
            return sValue.substr(1);
        } else if (sValue.length === 4 && sValue[0] === "#") {
            return sValue[1] + sValue[1] + sValue[2] + sValue[2] + sValue[3] + sValue[3];
        }
        return undefined;
    };

    var _fnToWallColor = function(sValue) {
        if (sValue.length === 6) {
            return "#" + sValue;
        } else if (sValue.length === 3) {
            return "#" + sValue[1] + sValue[1] + sValue[2] + sValue[2] + sValue[3] + sValue[3];
        }
        return undefined;
    };

    var _oItemTypeMapping = {
        "sap.ino.config.GROUP" : "sap.ino.wall.WallItemGroup",
        "sap.ino.wall.WallItemGroup" : "sap.ino.config.GROUP",

        "sap.ino.config.ATTACHMENT" : "sap.ino.wall.WallItemAttachment",
        "sap.ino.wall.WallItemAttachment" : "sap.ino.config.ATTACHMENT",

        "sap.ino.config.DOCUMENT" : "sap.ino.wall.WallItemDocument",
        "sap.ino.wall.WallItemDocument" : "sap.ino.config.DOCUMENT",

        "sap.ino.config.HEADLINE" : "sap.ino.wall.WallItemHeadline",
        "sap.ino.wall.WallItemHeadline" : "sap.ino.config.HEADLINE",

        "sap.ino.config.IMAGE" : "sap.ino.wall.WallItemImage",
        "sap.ino.wall.WallItemImage" : "sap.ino.config.IMAGE",

        "sap.ino.config.LINE" : "sap.ino.wall.WallItemLine",
        "sap.ino.wall.WallItemLine" : "sap.ino.config.LINE",

        "sap.ino.config.LINK" : "sap.ino.wall.WallItemLink",
        "sap.ino.wall.WallItemLink" : "sap.ino.config.LINK",

        "sap.ino.wall.WallItemPerson" : "sap.ino.config.PERSON",
        "sap.ino.config.PERSON" : "sap.ino.wall.WallItemPerson",

        "sap.ino.config.SPRITE" : "sap.ino.wall.WallItemSprite",
        "sap.ino.wall.WallItemSprite" : "sap.ino.config.SPRITE",

        "sap.ino.config.STICKER" : "sap.ino.wall.WallItemSticker",
        "sap.ino.wall.WallItemSticker" : "sap.ino.config.STICKER",

        "sap.ino.config.TEXT" : "sap.ino.wall.WallItemText",
        "sap.ino.wall.WallItemText" : "sap.ino.config.TEXT",

        "sap.ino.config.VIDEO" : "sap.ino.wall.WallItemVideo",
        "sap.ino.wall.WallItemVideo" : "sap.ino.config.VIDEO",

        "sap.ino.config.ARROW" : "sap.ino.wall.WallItemArrow",
        "sap.ino.wall.WallItemArrow" : "sap.ino.config.ARROW"
    };

    /*
     * Mapping for Wall object ( WALL -> INO & INO -> WALL) support property & formatter
     */
    var _oWallMapping = {
        "WALL" : {
            "storageId" : {
                property : "ID"
            },
            "title" : {
                property : "NAME"
            },
            "backgroundImage" : {
                property : "BACKGROUND_IMAGE_URL"
            },
            "backgroundImageZoom" : {
                property : "BACKGROUND_IMAGE_ZOOM",
                formatter : function(vValue) {
                    var iValue = parseInt(vValue, 10);
                    return isNaN(iValue) ? 1 : iValue;
                }
            },
            "backgroundImageTiled" : {
                property : "BACKGROUND_IMAGE_REPEAT",
                formatter : function(bTiled) {
                    return bTiled ? 1 : 0;
                }
            },
            "backgroundColor" : {
                property : "BACKGROUND_COLOR"
            },
            "mode" : {
                property : "IS_LOCKED",
                formatter : function(sMode) {
                    return sMode == WallMode.Readonly ? 1 : 0;
                }
            },
            "type" : {
                property : "WALL_TYPE_CODE",
                formatter : function(sType) {
                    return sType === "Template" ? "sap.ino.config.TEMPLATE" : "sap.ino.config.WALL";
                }
            },
            "actionCode" : {
                property : "ACTION_CODE"
            }
        /* owner / CREATED_BY calculated in backend */
        },
        "INO" : {
            "ID" : {
                property : "storageId"
            },
            "NAME" : {
                property : "title"
            },
            "BACKGROUND_IMAGE_URL" : {
                property : "backgroundImage"
            },
            "BACKGROUND_IMAGE_ZOOM" : {
                property : "backgroundImageZoom",
                formatter : function(vValue) {
                    var iValue = parseInt(vValue, 10);
                    return isNaN(iValue) ? 1 : iValue;
                }
            },
            "BACKGROUND_IMAGE_REPEAT" : {
                property : "backgroundImageTiled",
                formatter : function(iRepeat) {
                    return iRepeat == 1;
                }
            },
            "BACKGROUND_COLOR" : {
                property : "backgroundColor"
            },
            "CREATED_BY_NAME" : {
                property : "owner"
            },
            "IS_LOCKED" : {
                property : "mode",
                formatter : function(iIsLocked) {
                    return iIsLocked == 1 ? WallMode.Readonly : WallMode.Write;
                }
            },
            "WALL_TYPE_CODE" : {
                property : "type",
                formatter : function(sWallTypeCode) {
                    return sWallTypeCode === "sap.ino.config.TEMPLATE" ? "Template" : "Wall";
                }
            },
            "ACTION_CODE" : {
                property : "actionCode"
            }
        }
    };

    /*
     * Default Wall Item Mapping (WALL -> INO & INO -> WALL) support property & initial & formatter & parent & children
     */
    var _oDefaultItemMapping = {
        "WALL" : {
            "storageId" : {
                property : "ID"
            },
            "id" : {
                initial : true,
                /*
                 * only write id when it's empty we need this special handling for the create case, when there is no
                 * storage id but only a handle
                 */
                property : "ID"
            },
            "parentId" : {
                property : "PARENT_WALL_ITEM_ID",
                formatter : function(sParentId) {
                    return (sParentId !== "0") ? sParentId : null;
                }
            },
            "w" : {
                property : "WIDTH",
                formatter : function(sValue) {
                    return _fnFormatInoUnitOfLength(sValue) || 0;
                }
            },
            "h" : {
                property : "HEIGHT",
                formatter : function(sValue) {
                    return _fnFormatInoUnitOfLength(sValue) || 0;
                }
            },
            "depth" : {
                property : "ZINDEX"
            },
            "className" : {
                property : "WALL_ITEM_TYPE_CODE",
                formatter : function(sClass) {
                    return _oItemTypeMapping[sClass];
                }
            },
            "title" : {
                parent : "CONTENT",
                property : "TEXT"
            },
            "position" : {
                children : {
                    "x" : {
                        property : "POSITION_X",
                        formatter : _fnFormatInoUnitOfLength
                    },
                    "y" : {
                        property : "POSITION_Y",
                        formatter : _fnFormatInoUnitOfLength
                    }
                }
            },
            "actionCode" : {
                property : "ACTION_CODE"
            }
        },
        "INO" : {
            "ID" : {
                property : "storageId"
            },
            "PARENT_WALL_ITEM_ID" : {
                property : "parentId"
            },
            "NAME" : {
                property : "title"
            },
            "CONTENT" : {
                children : {
                    "TEXT" : {
                        property : "title"
                    }
                }
            },
            "WIDTH" : {
                property : "w",
                formatter : _fnFormatWallUnitOfLength
            },
            "HEIGHT" : {
                property : "h",
                formatter : _fnFormatWallUnitOfLength
            },
            "ZINDEX" : {
                property : "depth"
            },
            "WALL_ITEM_TYPE_CODE" : {
                property : "className",
                formatter : function(sClass) {
                    return _oItemTypeMapping[sClass];
                }
            },
            "POSITION_X" : {
                parent : "position",
                property : "x",
                formatter : _fnFormatWallUnitOfLength
            },
            "POSITION_Y" : {
                parent : "position",
                property : "y",
                formatter : _fnFormatWallUnitOfLength
            },
            "ACTION_CODE" : {
                property : "actionCode"
            }
        }
    };

    /*
     * Specific Wall Item Mapping (WALL -> INO & INO -> WALL) support property & formatter & parent & children
     */
    var _oSpecificItemMapping = {
        // WALL -> INO
        "WALL" : {
            "sap.ino.wall.WallItemHeadline" : {
                "size" : {
                    parent : "CONTENT",
                    property : "SIZE"
                },
                "type" : {
                    parent : "CONTENT",
                    property : "STYLE"
                }
            },
            "sap.ino.wall.WallItemLink" : {
                "description" : {
                    parent : "CONTENT",
                    property : "URL"
                },
                "type" : {
                    parent : "CONTENT",
                    property : "ICON"
                }
            },
            "sap.ino.wall.WallItemSticker" : {
                "color" : {
                    parent : "CONTENT",
                    property : "COLOR",
                    formatter : _fnMapColor
                },
                "description" : {
                    parent : "CONTENT",
                    property : "TEXT"
                }
            },
            "sap.ino.wall.WallItemGroup" : {
                "color" : {
                    parent : "CONTENT",
                    property : "COLOR",
                    formatter : _fnToInoColor
                }
            },
            "sap.ino.wall.WallItemImage" : {
                "content" : {
                    children : {
                        "image" : {
                            parent : "Image",
                            array : true,
                            property : "ATTACHMENT_ID",
                            formatter : _fnURLtoID
                        },
                        "preview" : {
                            initial : true,
                            parent : "Image",
                            array : true,
                            property : "ATTACHMENT_ID",
                            formatter : _fnURLtoID
                        },
                        "assignmentId" : {
                            parent : "Image",
                            array : true,
                            property : "ID"
                        },
                        "showAsIcon" : {
                            parent : "CONTENT",
                            property : "SHOW_AS_ICON"
                        }
                    }
                },
                "title" : {
                    parent : "CONTENT",
                    property : "CAPTION"
                }
            },
            "sap.ino.wall.WallItemText" : {
                "description" : {
                    parent : "CONTENT",
                    property : "TEXT"
                },
                "title" : {
                    parent : "CONTENT",
                    property : "CAPTION"
                }
            },
            "sap.ino.wall.WallItemLine" : {
                "orientation" : {
                    parent : "CONTENT",
                    property : "ORIENTATION"
                },
                "thickness" : {
                    parent : "CONTENT",
                    property : "THICKNESS"
                },
                "style" : {
                    parent : "CONTENT",
                    property : "STYLE"
                },
                "color" : {
                    parent : "CONTENT",
                    property : "COLOR",
                    formatter : _fnToInoColor
                },
                "title" : {
                    property : "NAME"
                }
            },
            "sap.ino.wall.WallItemSprite" : {
                "color" : {
                    parent : "CONTENT",
                    property : "COLOR",
                    formatter : _fnToInoColor
                },
                "type" : {
                    parent : "CONTENT",
                    property : "SHAPE"
                }
            },
            "sap.ino.wall.WallItemPerson" : {
                "title" : {
                    parent : "CONTENT",
                    property : "NAME"
                },
                "content" : {
                    children : {
                        "image" : {
                            parent : "Image",
                            array : true,
                            property : "ATTACHMENT_ID",
                            formatter : _fnURLtoID
                        },
                        "phone" : {
                            parent : "CONTENT",
                            property : "PHONE"
                        },
                        "email" : {
                            parent : "CONTENT",
                            property : "EMAIL"
                        },
                        "originId" : {
                            parent : "CONTENT",
                            property : "ORIGIN_ID"
                        },
                        "requestImage" : {
                            parent : "CONTENT",
                            property : "REQUEST_IMAGE"
                        },
                        "assignmentId" : {
                            parent : "Image",
                            array : true,
                            property : "ID"
                        }
                    }
                }
            },
            "sap.ino.wall.WallItemVideo" : {
                "content" : {
                    children : {
                        "video" : {
                            parent : "CONTENT",
                            property : "URL"
                        },
                        "preview" : {
                            initial : true,
                            parent : "CONTENT",
                            property : "URL"
                        }
                    }
                },
                "title" : {
                    parent : "CONTENT",
                    property : "CAPTION"
                }
            },
            "sap.ino.wall.WallItemDocument" : {
                "title" : {
                    parent : "CONTENT",
                    property : "CAPTION"
                },
                "description" : {
                    parent : "CONTENT",
                    property : "URL"
                },
                "type" : {
                    parent : "CONTENT",
                    property : "DOC_TYPE"
                }
            },
            "sap.ino.wall.WallItemAttachment" : {
                "title" : {
                    parent : "CONTENT",
                    property : "CAPTION"
                },
                "content" : {
                    children : {
                        "URL" : {
                            parent : "Attachment",
                            array : true,
                            property : "ATTACHMENT_ID",
                            formatter : _fnURLtoID
                        },
                        "assignmentId" : {
                            parent : "Attachment",
                            array : true,
                            property : "ID"
                        },
                        "type" : {
                            parent : "CONTENT",
                            property : "TYPE"
                        },
                        "fileName" : {
                            parent : "CONTENT",
                            property : "FILE_NAME"
                        }
                    }
                }
            },
            "sap.ino.wall.WallItemArrow" : {
                "thickness" : {
                    parent : "CONTENT",
                    property : "THICKNESS"
                },
                "style" : {
                    parent : "CONTENT",
                    property : "STYLE"
                },
                "headStyle" : {
                    parent : "CONTENT",
                    property : "HEAD_STYLE"
                },
                "color" : {
                    parent : "CONTENT",
                    property : "COLOR",
                    formatter : _fnToInoColor
                },
                "title" : {
                    parent : "CONTENT",
                    property : "TEXT"
                },
                "x1" : {
                    parent : "CONTENT",
                    property : "X1"
                },
                "y1" : {
                    parent : "CONTENT",
                    property : "Y1"
                },
                "x2" : {
                    parent : "CONTENT",
                    property : "X2"
                },
                "y2" : {
                    parent : "CONTENT",
                    property : "Y2"
                }
            }
        },
        // INO -> WALL
        "INO" : {
            "sap.ino.config.HEADLINE" : {
                "CONTENT" : {
                    children : {
                        "SIZE" : {
                            property : "size"
                        },
                        "STYLE" : {
                            property : "type"
                        },
                        "TEXT" : {
                            property : "title"
                        }
                    }
                }
            },
            "sap.ino.config.LINK" : {
                "CONTENT" : {
                    children : {
                        "URL" : {
                            property : "description"
                        },
                        "ICON" : {
                            property : "type"
                        },
                        "TEXT" : {
                            property : "title"
                        }
                    }
                }
            },
            "sap.ino.config.STICKER" : {
                "CONTENT" : {
                    children : {
                        "COLOR" : {
                            property : "color",
                            formatter : _fnMapColor
                        },
                        "TEXT" : {
                            property : "description"
                        }
                    }
                }
            },
            "sap.ino.config.GROUP" : {
                "CONTENT" : {
                    children : {
                        "COLOR" : {
                            property : "color",
                            formatter : _fnToWallColor
                        },
                        "TEXT" : {
                            property : "title"
                        }
                    }
                }
            },
            "sap.ino.config.IMAGE" : {
                "CONTENT" : {
                    children : {
                        "CAPTION" : {
                            property : "title"
                        },
                        "SHOW_AS_ICON" : {
                            parent : "content",
                            property : "showAsIcon"
                        }
                    }
                },
                "Image" : {
                    children : {
                        "ATTACHMENT_ID" : {
                            parent : "content",
                            property : ["image", "preview"],
                            formatter : _fnIDtoURL
                        },
                        "ID" : {
                            parent : "content",
                            property : "assignmentId"
                        }
                    }
                }
            },
            "sap.ino.config.TEXT" : {
                "CONTENT" : {
                    children : {
                        "CAPTION" : {
                            property : "title"
                        },
                        "TEXT" : {
                            property : "description"
                        }
                    }
                }
            },
            "sap.ino.config.LINE" : {
                "CONTENT" : {
                    children : {
                        "ORIENTATION" : {
                            property : "orientation"
                        },
                        "THICKNESS" : {
                            property : "thickness"
                        },
                        "STYLE" : {
                            property : "style"
                        },
                        "COLOR" : {
                            property : "color",
                            formatter : _fnToWallColor
                        }
                    }
                },
                "NAME" : {
                    property : "title"
                }
            },
            "sap.ino.config.SPRITE" : {
                "CONTENT" : {
                    children : {
                        "COLOR" : {
                            property : "color",
                            formatter : _fnToWallColor
                        },
                        "SHAPE" : {
                            property : "type"
                        },
                        "TEXT" : {
                            property : "title"
                        }
                    }
                }
            },
            "sap.ino.config.PERSON" : {
                "CONTENT" : {
                    children : {
                        "NAME" : {
                            property : "title"
                        },
                        "IMAGE" : {
                            property : "image",
                            parent : "content"
                        },
                        "PHONE" : {
                            property : "phone",
                            parent : "content"
                        },
                        "EMAIL" : {
                            property : "email",
                            parent : "content"
                        },
                        "ORIGIN_ID" : {
                            property : "originId",
                            parent : "content"
                        },
                        "REQUEST_IMAGE" : {
                            property : "requestImage",
                            parent : "content"
                        }
                    }
                },
                "Image" : {
                    children : {
                        "ATTACHMENT_ID" : {
                            parent : "content",
                            property : ["image", "preview"],
                            formatter : _fnIDtoURL
                        },
                        "ID" : {
                            parent : "content",
                            property : "assignmentId"
                        }
                    }
                }
            },
            "sap.ino.config.VIDEO" : {
                "CONTENT" : {
                    children : {
                        "URL" : {
                            parent : "content",
                            property : ["video", "preview"]
                        },
                        "CAPTION" : {
                            property : "title"
                        }
                    }
                }
            },
            "sap.ino.config.DOCUMENT" : {
                "CONTENT" : {
                    children : {
                        "URL" : {
                            property : "description"
                        },
                        "CAPTION" : {
                            property : "title"
                        },
                        "DOC_TYPE" : {
                            property : "type"
                        }
                    }
                }
            },
            "sap.ino.config.ATTACHMENT" : {
                "CONTENT" : {
                    children : {
                        "CAPTION" : {
                            property : "title"
                        },
                        "TYPE" : {
                            property : "type",
                            parent : "content"
                        },
                        "FILE_NAME" : {
                            property : "fileName",
                            parent : "content"
                        }
                    }
                },
                "Attachment" : {
                    children : {
                        "ATTACHMENT_ID" : {
                            property : "URL",
                            parent : "content",
                            formatter : _fnIDtoURL
                        },
                        "ID" : {
                            property : "assignmentId",
                            parent : "content"
                        }
                    }
                }
            },
            "sap.ino.config.ARROW" : {
                "CONTENT" : {
                    children : {
                        "THICKNESS" : {
                            property : "thickness"
                        },
                        "STYLE" : {
                            property : "style"
                        },
                        "HEAD_STYLE" : {
                            property : "headStyle"
                        },
                        "COLOR" : {
                            property : "color",
                            formatter : _fnToWallColor
                        },
                        "TEXT" : {
                            property : "title"
                        },
                        "X1" : {
                            property : "x1"
                        },
                        "Y1" : {
                            property : "y1"
                        },
                        "X2" : {
                            property : "x2"
                        },
                        "Y2" : {
                            property : "y2"
                        }
                    }
                }
            }
        }
    };

    var _fnMapProperty = function(oItem, vProperty, fnFormatter, bInitial, sValue) {
        if (vProperty) {
            if (jQuery.type(vProperty) == "array") {
                vProperty.forEach(function(sProperty) {
                    if (!bInitial || !oItem[sProperty]) {
                        oItem[sProperty] = fnFormatter ? fnFormatter(sValue) : sValue;
                    }
                });
            } else {
                if (!bInitial || !oItem[vProperty]) {
                    oItem[vProperty] = fnFormatter ? fnFormatter(sValue) : sValue;
                }
            }
        }
    };

    var _fnMapPropertyWithParent = function(oItem, vProperty, sParent, fnFormatter, bInitial, sValue, bArray) {
        if (vProperty) {
            if (sParent) {
                if (!oItem[sParent]) {
                    if (bArray) {
                        oItem[sParent] = [];
                    } else {
                        oItem[sParent] = {};
                    }
                }

                if (bArray && oItem[sParent].length === 0) {
                    oItem[sParent].push({});
                }

                var oObject = bArray ? oItem[sParent][0] : oItem[sParent];

                _fnMapProperty(oObject, vProperty, fnFormatter, bInitial, sValue);

                if (bArray && JSON.stringify(oObject) === "{}") {
                    oItem[sParent].pop();
                }
            } else {
                _fnMapProperty(oItem, vProperty, fnFormatter, bInitial, sValue);
            }
        }
    };

    var _fnMapItem = function(oItem, oMapping, vValue) {
        var oValue = (jQuery.type(vValue) === "array") ? vValue[0] : vValue;
        var fnFormatter, vProperty, sParent, bArray, bInitial;
        if (oValue !== undefined) {
            if (oMapping.children) {
                for ( var childkey in oMapping.children) {
                    fnFormatter = oMapping.children[childkey].formatter;
                    vProperty = oMapping.children[childkey].property;
                    sParent = oMapping.children[childkey].parent;
                    bArray = oMapping.children[childkey].array;
                    bInitial = oMapping.children[childkey].initial;

                    _fnMapPropertyWithParent(oItem, vProperty, sParent, fnFormatter, bInitial, oValue[childkey], bArray);
                }
            } else {
                fnFormatter = oMapping.formatter;
                vProperty = oMapping.property;
                sParent = oMapping.parent;
                bArray = oMapping.array;
                bInitial = oMapping.initial;

                _fnMapPropertyWithParent(oItem, vProperty, sParent, fnFormatter, bInitial, oValue, bArray);
            }
        }
    };

    var WallMapper = {};

    WallMapper.mapItemToIno = function(vWallItem) {
        var oItem = {};
        var sItemType = vWallItem.className;
        var oDefault = _oDefaultItemMapping.WALL;
        var oSpecific = _oSpecificItemMapping.WALL[sItemType];

        for ( var key in vWallItem) {
            if (vWallItem.hasOwnProperty(key)) {
                if (oSpecific && oSpecific[key]) {
                    _fnMapItem(oItem, oSpecific[key], vWallItem[key]);
                } else if (oDefault[key]) {
                    _fnMapItem(oItem, oDefault[key], vWallItem[key]);
                }
                // else ignore this value
            }
        }

        return oItem;
    };

    WallMapper.mapItemsFromIno = function(vIno, bDelta) {

        var fnMap = function(oIno) {
            var oItem = {};
            var sItemType = oIno.WALL_ITEM_TYPE_CODE;
            var oDefault = _oDefaultItemMapping.INO;
            var oSpecific = _oSpecificItemMapping.INO[sItemType];

            for ( var key in oIno) {
                if (oIno.hasOwnProperty(key)) {
                    if (oSpecific && oSpecific[key]) {
                        _fnMapItem(oItem, oSpecific[key], oIno[key]);
                    } else if (oDefault[key]) {
                        _fnMapItem(oItem, oDefault[key], oIno[key]);
                    }
                    // else ignore this value
                }
            }

            return oItem;
        };

        var aItems = [];
        var aIno = jQuery.type(vIno) == "array" ? vIno : [vIno];

        if (bDelta) {

            aIno.forEach(function(oIno) {
                aItems.push(fnMap(oIno));
            });

        } else {

            var aParents = [];
            var oChildren = {};

            aIno.forEach(function(oIno) {
                var oItem = fnMap(oIno);
                aParents.push(oItem);
                if (oItem.parentId > 0) {
                    if (!oChildren[oItem.parentId]) {
                        oChildren[oItem.parentId] = [];
                    }
                    oChildren[oItem.parentId].push(oItem);
                } else {
                    aItems.push(oItem);
                }
            });

            for ( var key in oChildren) {
                if (oChildren.hasOwnProperty(key)) {
                    var aParent = aParents.filter(function(o) {
                        return o.storageId /* int */ == key /* string */;
                    });

                    if (aParent && aParent.length > 0) {
                        // Note: "childs"?
                        aParent[0].childs = oChildren[key];
                    }
                }
            }
        }

        return aItems;
    };

    WallMapper.setInoProperty = function(oWall, sInoProperty, sValue) {
        if (jQuery.sap.startsWith(sInoProperty, "/")) {
            sInoProperty = sInoProperty.substring(1);
        }
        var oMapProperty = _oWallMapping.INO[sInoProperty];
        if (oMapProperty && oMapProperty.property) {
            var sSetter = "set" + oMapProperty.property.substring(0, 1).toUpperCase() + oMapProperty.property.substring(1);
            if (typeof oWall[sSetter] === "function") {
                oWall[sSetter].apply(oWall, [oMapProperty.formatter ? oMapProperty.formatter(sValue) : sValue]);
            } else {
                oWall.setProperty(oMapProperty.property, oMapProperty.formatter ? oMapProperty.formatter(sValue) : sValue);
                oWall._notifyChanged(oMapProperty.property);
            }
            return true;
        } else {
            jQuery.sap.log.warning("no mapping available for property '" + sInoProperty + "'", undefined, "WallMapper");
            return false;
        }
    };

    WallMapper._checkWallPrivilege = function(aGroup, iUserId) {
        if (iUserId === undefined) {
            iUserId = Configuration.getCurrentUser().USER_ID;
        }

        if (aGroup && jQuery.type(aGroup === "array")) {
            var aGroupMember = aGroup.filter(function(oIdentity) {
                return oIdentity.IDENTITY_ID === iUserId;
            });

            if (aGroupMember.length > 0) {
                return true;
            }
        }

        return false;
    };

    WallMapper.mapWallFromIno = function(oIno, bDelta) {
        var oWall;
        if (oIno) {
            oWall = {};
            for ( var key in oIno) {
                if (oIno.hasOwnProperty(key) && _oWallMapping.INO[key] && _oWallMapping.INO[key].property) {
                    oWall[_oWallMapping.INO[key].property] = _oWallMapping.INO[key].formatter ? _oWallMapping.INO[key].formatter(oIno[key]) : oIno[key];
                }
            }

            // we currently don't count the hits
            oWall.hits = 0;
            // we currently have no favorite handling
            oWall.favorite = false;
            oWall.timestamp = new Date(oIno.CHANGED_AT).getTime();

            // set strongest auth property
            var iUserId = Configuration.getCurrentUser().USER_ID;
            var bMember = WallMapper._checkWallPrivilege(oIno.Owner, iUserId);
            var sStrongestAuth = "owner";
            if (!bMember) {
                bMember = WallMapper._checkWallPrivilege(oIno.Admins, iUserId);
                sStrongestAuth = "admin";
            }
            if (!bMember) {
                bMember = WallMapper._checkWallPrivilege(oIno.Writers, iUserId);
                sStrongestAuth = "write";
            }
            if (!bMember) {
                bMember = WallMapper._checkWallPrivilege(oIno.Readers, iUserId);
                sStrongestAuth = "read";
            }
            if (!bMember) {
                sStrongestAuth = "none";
            }

            oWall.strongestAuth = sStrongestAuth;

            var aItems = [];
            oWall.numberOfItems = oIno.Items ? oIno.Items.length : 0;
            if (oWall.numberOfItems > 0) {
                aItems = WallMapper.mapItemsFromIno(oIno.Items, bDelta);
            }
            oWall.items = aItems;
        }
        return oWall;
    };

    WallMapper.mapWallToIno = function(oWall) {

        var oJSON = oWall.formatToJSON();
        var aItems = [];

        var oIno = {};
        for ( var key in oJSON) {
            if (oJSON.hasOwnProperty(key) && _oWallMapping.WALL[key] && _oWallMapping.WALL[key].property) {
                oIno[_oWallMapping.WALL[key].property] = _oWallMapping.WALL[key].formatter ? _oWallMapping.WALL[key].formatter(oJSON[key]) : oJSON[key];
            }
        }

        var aWallItems = oWall.getItems();

        if (jQuery.type(aWallItems) === "array") {
            aWallItems.forEach(function(oItem) {
                aItems = aItems.concat(WallMapper.mapWallToInoItem(oItem));
            });
        }

        oIno.Items = aItems;

        return oIno;
    };

    WallMapper.mapWallToInoItem = function(oItem) {
        var oInoItem = WallMapper.mapItemToIno(oItem.formatToJSON());
        var aInoItem = [oInoItem];

        if (oItem.getChilds().length > 0) {
            oItem.getChilds().forEach(function(oChildItem) {
                aInoItem = aInoItem.concat(WallMapper.mapWallToInoItem(oChildItem));
            });
        }

        return aInoItem;
    };
    
    return WallMapper;
});