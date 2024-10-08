/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemLineRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemLineRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRM the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallItemLineRenderer.render = function(oRM, oControl) {
        // write outer wall item div
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.writeAttribute("tabindex", "-1"); // wall handles the tabchain
        oRM.addClass("sapInoWallWIB");
        oRM.addClass("sapInoWallWILine" + oControl.getOrientation());// modification, we do this already on the base
                                                                    // class (to shrink the container size)
        if (oControl.getFlipped()) {
            oRM.addClass("flipped");
        }
        oRM.writeClasses();
        // TODO zooming, measurements
        oRM.writeAttribute("style", "left: " + (oControl.getOrientation() === "HORIZONTAL" ? "0px" : oControl.getX()) + "; top: " + (oControl.getOrientation() === "HORIZONTAL" ? oControl.getY() : "0px") + "; z-index:" + oControl.getDepth());
        oRM.write(">");

        // callback to inherited control's method
        if (this.renderItem) {
            this.renderItem(oRM, oControl);
        }

        // show bounding boxes for collision detection
        // TODO: use real front containers width and height here
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            oRM.write('<div class="sapInoWallWIBIntersectionBox"></div>');
            oRM.write('<div class="sapInoWallWIBNeighbourBox" style="padding: ' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px; left: -' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px; top: -' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px"></div>');
        }

        oRM.write("</div>");
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemLineRenderer.renderItem = function(oRM, oControl) {
        var sId = oControl.getId(), sBorderStyle = oControl.getStyle();
        var iDim = 13 - parseInt(oControl.getThickness() / 2);
        var sDim = (oControl.getOrientation() === "VERTICAL") ? "width" : "height";
                
        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWILine");
        oRM.addClass("sapInoWallWILine" + oControl.getOrientation());
        oRM.addClass("sapInoWallWILine" + sBorderStyle);
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // text
            oRM.write("<div class=\"sapInoWallWILineFirst\" style=\"" + sDim + ": " + iDim + "px; border-width: ");
            oRM.writeEscaped(oControl.getThickness().toString());
            oRM.write("px; border-color: ");
            oRM.writeEscaped(oControl.getColor());
            oRM.write("; border-" + (oControl.getOrientation() === "HORIZONTAL" ? "bottom" : "right") + "-style: ");
            oRM.writeEscaped(sBorderStyle.toLowerCase());
            oRM.write("\">");
            oRM.write("</div>");
            oRM.write("<div class=\"sapInoWallWILineSecond\" style=\"" + sDim + ": " + iDim + "px;\">");
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWILine");
        oRM.addClass("sapInoWallWILine" + oControl.getOrientation());
        oRM.addClass("sapInoWallWILine" + sBorderStyle);
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // text
            oRM.write("<div class=\"sapInoWallWILineFirst\" style=\"" + sDim + ": " + iDim + "px; border-width: ");
            oRM.writeEscaped(oControl.getThickness().toString());
            oRM.write("px; border-color: ");
            oRM.writeEscaped(oControl.getColor());
            oRM.write("; border-" + (oControl.getOrientation() === "HORIZONTAL" ? "bottom" : "right") + "-style: ");
            oRM.writeEscaped(sBorderStyle.toLowerCase());
            oRM.write("\">");
            oRM.write("</div>");
            oRM.write("<div class=\"sapInoWallWILineSecond\" style=\"" + sDim + ": " + iDim + "px;\">");
            oRM.write("</div>");
            // edit buttons (keep style)
            var $Buttons = oControl.$().find(".sapInoWallWILineEditButtons");
            var sStyle = "";
            if ($Buttons) {
                sStyle = $Buttons.attr("style");
            }
            oRM.write("<div id=\"" + sId + "-editButtons\" style=\"" + sStyle + "\" class=\"sapInoWallWILineEditButtons\">");
            // orientation selector
            oRM.renderControl(oControl._getButtonOrientationH());
            oRM.renderControl(oControl._getButtonOrientationV());
            // type selector
            oRM.renderControl(oControl._getButtonStyleSolid());
            oRM.renderControl(oControl._getButtonStyleDashed());
            oRM.renderControl(oControl._getButtonStyleDotted());
            // thickness selector
            oRM.renderControl(oControl._getButtonThickness1px());
            oRM.renderControl(oControl._getButtonThickness3px());
            oRM.renderControl(oControl._getButtonThickness5px());
            // color selector
            oRM.renderControl(oControl._getButtonColorSelector());
            // back button (is not mirrored on line item, so we have to use the inverse icon to stay in sync)
            oRM.renderControl(oControl._getButtonFlip().setIcon("sap-icon://undo").removeStyleClass("sapInoWallWIFlipBackButton").addStyleClass("sapInoWallWILineButton"));
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }
        oRM.write("</div>");

        // end wrapper
        oRM.write("</div>");
    };

})();