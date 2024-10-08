/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/wall/util/Helper"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemSticker", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-sticker"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
        },
        
        onDataInitialized : function () {
        }
    }));
});