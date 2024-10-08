/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemSpriteRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemSpriteRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Adds style classes to the base item {@link sap.ui.core.RenderManager}.
     * 
     * @override
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     */
    sap.ino.wall.WallItemSpriteRenderer.addOuterStyleClasses = function(oRM) {
        oRM.addClass("sapInoWallWISprite");
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemSpriteRenderer.renderItem = function(oRM, oControl) {
        var sColor = oControl.getColor(), sType = oControl.getType(), fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sColor);

        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWISprite");
        oRM.addClass("sapInoWallWISprite" + sType);
        oRM.addClass("front");
        oRM.writeClasses();

        // sprite color and size
        oRM.write("style=\"border-color:" + sap.ino.wall.util.Helper.shadeColor(sColor, -10) + "; background-color:" + sColor + "; color: " + (fLuminance <= 0.6 ? "#F5F5F5" : "#232323") + "; background-image: " + sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sColor, 5) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sColor, -5) + " 100%)") + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title (only 1 char)
            oRM.write("<div class=\"sapInoWallWITitleText sapInoWallWISpriteText\">");
            oRM.writeEscaped(oControl.getTitle(), true);
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
        oRM.addClass("sapInoWallWISprite");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMSPRITE_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");
            oRM.renderControl(oControl._getSelectType());
            oRM.renderControl(oControl._getButtonColorSelector());
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