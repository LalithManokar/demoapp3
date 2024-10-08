/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemTextRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemTextRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemTextRenderer.renderItem = function(oRM, oControl) {
        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIT");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");

            // description
            oRM.write("<div class=\"sapInoWallWITDescription sapInoWallWITDescriptionText\">");
            oRM.renderControl(oControl._getScrollContainerDescription());

            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        // resize handle
        this.renderResizeHandler(oRM, oControl);

        // end front side
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIT");
        oRM.addClass("gradients");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMTEXT_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");

            // description
            oRM.write("<div class=\"sapInoWallWITDescription\">");
            oRM.renderControl(oControl._getTextareaDescription());
            oRM.write("</div>");
        } else {
            oRM.write("back");
        }

        // resize handle
        this.renderResizeHandler(oRM, oControl);

        // end back side
        oRM.write("</div>");

        // back button
        oRM.renderControl(oControl._getButtonFlip());

        // end wrapper
        oRM.write("</div>");
    };
    
})();