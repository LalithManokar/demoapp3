/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(WallRemoteItemController, TopLevelPageFacet) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemHeadline", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-headline"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.initHeadline(); 
        },
        
        //HEADLINE
        initHeadline : function() {
            var oHeadlineType = {
                CLEAR : "CLEAR",
                SIMPLE : "SIMPLE",
                BRAG : "BRAG",
                ELEGANT : "ELEGANT",
                COOL : "COOL"
            };
            
            var oHeadlineSize = {
                H1 : "H1",
                H2 : "H2",
                H3 : "H3",
                H4 : "H4",
                H5 : "H5",
                H6 : "H6"
            };
            
            var oItem, sKey, oSelect = this.byId("styleSelect");
            for (sKey in oHeadlineType) {
                if (oHeadlineType.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : oHeadlineType[sKey],
                        text : this.getText("WALL_ITEM_HEADLINE_TYPE_"+ oHeadlineType[sKey])
                    });
                    oSelect.addItem(oItem);
                }
            }
            oSelect = this.byId("sizeSelect");
            for (sKey in oHeadlineSize) {
                if (oHeadlineSize.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sKey,
                        text : this.getText("WALL_ITEM_HEADLINE_SIZE_"+ sKey)
                    });
                    oSelect.addItem(oItem);
                }
            }
        }
    }));
});