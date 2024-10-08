/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    'sap/ui/core/library',
    'sap/m/library'
], function() {
    "use strict";
    
    sap.ui.getCore().initLibrary({
        name : "sap.ino.wall",
        dependencies : ["sap.ui.core", "sap.m"],
        types : [], 
        interfaces : [],
        controls : [
            "sap.ino.wall.ColorPicker",
            "sap.ino.wall.DragButton",
            "sap.ino.wall.DropUpload",
            "sap.ino.wall.Hoverable",
            "sap.ino.wall.LightBox",
            "sap.ino.wall.ResponsiveOptionSelector",
            "sap.ino.wall.ScrollableToolbar",
            "sap.ino.wall.TextEditor",
            "sap.ino.wall.Wall",
            "sap.ino.wall.WallItemAttachment",
            "sap.ino.wall.WallItemBase",
            "sap.ino.wall.WallItemDocument",
            "sap.ino.wall.WallItemGroup",
            "sap.ino.wall.WallItemHeadline",
            "sap.ino.wall.WallItemImage",
            "sap.ino.wall.WallItemLine",
            "sap.ino.wall.WallItemLink",
            "sap.ino.wall.WallItemPerson",
            "sap.ino.wall.WallItemSprite",
            "sap.ino.wall.WallItemSticker",
            "sap.ino.wall.WallItemText",
            "sap.ino.wall.WallItemVideo",
            "sap.ino.wall.WallPreview"
        ],
        elements : [
            "sap.ino.wall.Pos"
        ],
        version : "2.4.16"
    });
});