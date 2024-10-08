/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemLine", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-line"],
        
        onDataInitialized : function() {
            this.initLine();
        },
        
        initLine : function () {
            var sOrientation = this.getObjectProperty("/CONTENT/ORIENTATION");
            var sStyle = this.getObjectProperty("/CONTENT/STYLE");
            var sThickness = this.getObjectProperty("/CONTENT/THICKNESS");
            if(sThickness && sStyle && sOrientation) {
                this.setInitLines([sOrientation, sStyle, sThickness.toString()]);    
            }
            
        }
        
    }));
});