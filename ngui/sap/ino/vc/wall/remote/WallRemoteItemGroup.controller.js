/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemGroup", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-group"]
    }));
});