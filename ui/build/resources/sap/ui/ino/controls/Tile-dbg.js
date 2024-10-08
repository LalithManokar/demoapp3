/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.Tile");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.TileRenderer");
    jQuery.sap.require("sap.ui.ino.controls.ColorSupport");
    var ColorSupport = sap.ui.ino.controls.ColorSupport;

    /**
     * A tile is a component that has a header that contains a title and a content. The tile has a default size of 318px *
     * 126px and needs to be included in a TileBrowser control.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>objectId: Id of the object that is visualized by this tile. Needed to rearrange tiles on the screen</li>
     * <li>headerTitle: Title of the tile.</li>
     * <li>headerColor: Color code of the tile header</li>
     * <li>headerMetadata: Object that is thrown when a click on the tile header is performed</li>
     * <li>tileMetadata: Object that is thrown when a click on the tile is performed</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>content: Control containing the content of the tile</li>
     * </ul>
     * <li>Events
     * <ul>
     * <li>headerClicked: The event is thrown when the header is clicked and a headerMetadata object is available.</li>
     * <li>tileClicked: The event is thrown when a click on the tile is performed. The event contains the tileMetadata
     * object.</li>
     * <li>tileDeleted: Event is thrown when the delete button is pressed. The TileContainer has to be set to edit mode
     * before.</li>
     * </ul>
     * </li>
     * </ul>
     */

    sap.m.CustomTile.extend("sap.ui.ino.controls.Tile", {
        metadata : {
            properties : {
                objectId : "int",
                headerTitle : {
                    type : "string",
                    defaultValue : undefined
                },
                headerColor : {
                    type : "string",
                    defaultValue : undefined
                },
                headerMetadata : {
                    type : "object",
                    defaultValue : undefined
                },
                tileMetadata : {
                    type : "object",
                    defaultValue : undefined
                }
            }
        },

        constructor : function() {
            sap.m.CustomTile.apply(this, arguments);

        },

        onAfterRendering : function(oEvent) {
            var oControl = this;
            var oDomRef = jQuery(oControl.getDomRef());

            if (sap.m.CustomTile.prototype.onAfterRendering) {
                sap.m.CustomTile.prototype.onAfterRendering.apply(oControl, arguments);
            }

        },

        _renderHeader : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("sapUiInoTileHeader");
            var sHeaderColor = "FFFFFF";
            if (this.getHeaderColor() !== undefined) {
                sHeaderColor = this.getHeaderColor();
            }
            else {
                this.setProperty("headerColor", sHeaderColor, true); // no rerendering
            }
            oRm.writeAttributeEscaped("style", "background-color: #" + sHeaderColor + ";");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("<label");
            oRm.addClass("sapUiLbl");
            oRm.addClass("sapUiLblNowrap");

            var sTextColorStyle = "sapUiInoTileHeaderTitle" + ColorSupport.calculateTitleTextColor(sHeaderColor.substr(0, 2), sHeaderColor.substr(2, 2), sHeaderColor.substr(4, 2));
            oRm.addClass("sapUiInoTileHeaderTitle");
            oRm.addClass(sTextColorStyle);
            oRm.writeClasses();
            oRm.write(">");
            if(!oControl.getHeaderTitle()) {
                oRm.write(" ");
            } 
            else {
                // replace write with writeEscaped to avoid security problem
                oRm.writeEscaped(oControl.getHeaderTitle());
            }    
            oRm.write("</label>");
            oRm.write("</div>");
        },

        renderContent : function(oRm, oControl) {
            oControl.addStyleClass("sapUiInoTile");
            oControl._renderHeader(oRm, oControl);
        },

        renderer : "sap.ui.ino.controls.TileRenderer"

    });
})();