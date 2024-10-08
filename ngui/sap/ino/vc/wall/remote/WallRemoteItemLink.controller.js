/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemLink", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-link"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.initLink();
        },
        
        initLink : function () {
            var oLinkType = {
                MISC : "MISC",
                COLLABORATE : "COLLABORATE",
                WIKI : "WIKI", 
                PRIVATE : "PRIVATE",
                WALL : "WALL",
                IDEA : "IDEA"
            };
            
            var oItem, sKey, oSelect = this.byId("iconSelect");
            for (sKey in oLinkType) {
                if (oLinkType.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : oLinkType[sKey],
                        text : this.getText("WALL_ITEM_LINK_TYPE_" + oLinkType[sKey])
                    });
                    oSelect.addItem(oItem);
                }
            }
        }
        
    }));
});