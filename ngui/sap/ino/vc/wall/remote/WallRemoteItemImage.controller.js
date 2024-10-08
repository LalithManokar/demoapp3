/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/models/object/Attachment"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet, Attachment) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemImage", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-image"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());
        },
        
        onDataInitialized : function() {
            WallRemoteItemController.prototype.onDataInitialized.apply(this, arguments);
            this.initImage();
        }
        
    }));
});