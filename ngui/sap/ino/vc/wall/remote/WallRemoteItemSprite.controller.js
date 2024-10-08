/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemSprite", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-sprite"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.initSprite();
        },
        
        onDataInitialized : function () {
        },
        
        initSprite : function () {

            var oSpriteDesign = {
                ROUND : "ROUND",
                SQUARE : "SQUARE",
                MELT : "MELT",
                LEAF : "LEAF",
                FLOWER : "FLOWER",
                SHIELD : "SHIELD"
            };
            var oItem, sKey, oSelect = this.byId("shapeSelect");
            for (sKey in oSpriteDesign) {
                if (oSpriteDesign.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : oSpriteDesign[sKey],
                        text : this.getText("WALL_ITEM_SPRITE_TYPE_" + oSpriteDesign[sKey])
                    });
                    oSelect.addItem(oItem);
                }
            }
        }
    }));
});