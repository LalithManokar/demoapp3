/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/wall/Wall",
    "sap/ino/commons/models/util/WallMapper",
    "sap/ino/commons/application/Configuration"
], function(Wall, WallMapper, Configuration) {
    "use strict";
    
    var WallFactory = {};
    
    /**
     * Create INO JSON based on a Wall.
     */
    WallFactory.createInoJSONFromWall = function(oWall) {
        return WallMapper.mapWallToIno(oWall);
    };

    /**
     * Create a Wall based on INO JSON.
     */
    WallFactory.createWallFromInoJSON = function(vIno) {
        if (typeof vIno === "string") {
            vIno = JSON.parse(vIno);
        }
        var oWall = WallMapper.mapWallFromIno(vIno);
        return Wall.createWallFromJSON(oWall);
    };

    /**
     * Update a Wall based on INO JSON.
     */
    WallFactory.updateWallFromInoJSON = function(oWall, vIno) {
        if (typeof vIno === "string") {
            vIno = JSON.parse(vIno);
        }
        if (vIno.BackgroundImage && vIno.BackgroundImage.length > 0) {
            oWall.setBackgroundImage(Configuration.getAttachmentDownloadURL(vIno.BackgroundImage[0].ATTACHMENT_ID));
        }
        var oWallData = WallMapper.mapWallFromIno(vIno);
        oWall.updateWallFromJSON(oWallData);
    };

    /**
     * Create a Wall Items based on INO JSON
     */
    WallFactory.createWallItemsFromInoJSON = function(vIno) {
        if (typeof vIno === "string") {
            vIno = JSON.parse(vIno);
        }
        return WallMapper.mapItemsFromIno(vIno);
    };
    
    return WallFactory;
});