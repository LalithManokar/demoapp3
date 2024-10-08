/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemVideo", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-video"]
    }));
});