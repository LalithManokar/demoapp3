/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemText", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-text"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
        }
    }));
});