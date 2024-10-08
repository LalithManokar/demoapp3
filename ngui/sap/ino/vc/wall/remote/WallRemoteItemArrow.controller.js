/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemArrow", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-arrow"],

        onDataInitialized : function() {
            this.initArrow();
        },
        
        initArrow : function () {
            var sHead = this.getObjectProperty("/CONTENT/HEAD_STYLE");
            var sStyle = this.getObjectProperty("/CONTENT/STYLE");
            var sThickness = this.getObjectProperty("/CONTENT/THICKNESS");
            if(sHead && sStyle && sThickness) {
                this.setInitLines([sHead, sStyle, sThickness.toString()]);
            }
        }
    }));
});