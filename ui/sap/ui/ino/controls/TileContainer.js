/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.TileContainer");
(function() {
    "use strict";
   
    sap.m.TileContainer.extend("sap.ui.ino.controls.TileContainer", {
         metadata : {
            events : {
                tilePress : {}
            } 
        },
        fnForwardPress : function(oEvent) {
            var oTile = oEvent.getSource();
            oTile.getParent().fireTilePress(oTile);
        },
        addTile : function(oTile){
            sap.m.TileContainer.prototype.addTile.apply(this, arguments);

            oTile.attachPress(this.fnForwardPress);
        },
        setEditable : function(bEdit) {
            var oControl = this;
            
            if (sap.m.TileContainer.prototype.setEditable) {
                sap.m.TileContainer.prototype.setEditable.apply(this, arguments);
            }

            setTimeout(function() {
                var aTiles = oControl.getTiles();
                if (aTiles.length > 0) {
                    aTiles.forEach(function(oTile) {
                        oTile.$().attr("tabindex", "-1");
                    });
                    aTiles[0].$().attr("tabindex", "0");
                }
            }, 100);
        },
        
        init : function() {
            var oControl = this;
            
            if (sap.m.TileContainer.prototype.init) {
                sap.m.TileContainer.prototype.init.apply(this, arguments);
            }
            
            this.attachTileDelete(function(oEvent) {
                var oTile = oEvent.mParameters.tile;
                oTile.detachPress(this.fnForwardPress);
                var iIndex = oControl.indexOfTile(oTile);
                var aTiles = oControl.getTiles();
                var iNewIndex = iIndex < aTiles.length ? iIndex : iIndex-1;
                if(aTiles.length > iNewIndex) {
                	var oNewFocusTile = aTiles[iNewIndex];
                	jQuery(oNewFocusTile.getDomRef()).focus();
                }
            });
         
            var oRenderer = this.getRenderer();
            var fnRender = oRenderer.render;
            oRenderer.render = function() {
                if (fnRender) {
                    fnRender.apply(oRenderer, arguments);
                }

                setTimeout(function() {
                    var aTiles = oControl.getTiles();
                    if (aTiles.length > 0) {
                        aTiles.forEach(function(oTile) {
                            oTile.$().attr("tabindex", "-1");
                            oTile.$().removeClass("sapMPointer");
                        });
                        aTiles[0].$().attr("tabindex", "0");
                    }
                }, 200);
            }
        },

        renderer : "sap.m.TileContainerRenderer"
    });
})();