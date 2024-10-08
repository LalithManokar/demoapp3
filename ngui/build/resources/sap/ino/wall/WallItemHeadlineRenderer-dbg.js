/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemHeadlineRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemHeadline renderer.
     * @static
     */
    sap.ino.wall.WallItemHeadlineRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Adds style classes to the base item {@link sap.ui.core.RenderManager}.
     * 
     * @override
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     */
    sap.ino.wall.WallItemHeadlineRenderer.addOuterStyleClasses = function(oRM) {
        oRM.addClass("sapInoWallWIHeadline");
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallItemHeadlineRenderer.renderItem = function(oRM, oControl) {
        // start wrapper
        oRM.write("<div class=\"flippable sapInoWallWIHL\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIHeadline");
        oRM.addClass("sapInoWallWIH" + oControl.getType());
        oRM.addClass("sapInoWallWIH" + oControl.getSize());
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // text
            oRM.write("<div class=\"sapInoWallWITitleText sapInoWallWIHeadlineText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIHeadline");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMHEADLINE_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");
            // type
            oRM.write("<div class=\"sapInoWallWIHTypeEdit\">");
            oRM.renderControl(oControl._getSelectType());
            oRM.write("</div>");
            // size
            oRM.write("<div class=\"sapInoWallWIHSizeEdit\">");
            oRM.renderControl(oControl._getSelectSize());
            oRM.write("</div>");
        } else {
            oRM.write("back");
        }

        oRM.write("</div>");

        // back button
        oRM.renderControl(oControl._getButtonFlip());

        // end wrapper
        oRM.write("</div>");
    };

})();