/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemGroupRenderer");

(function() {
    "use strict";

    jQuery.sap.declare("sap.ino.wall.WallItemGroupRenderer");
    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemGroup renderer.
     * @static
     */
    sap.ino.wall.WallItemGroupRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallItemGroupRenderer.renderItem = function(oRM, oControl) {
        var aGroupItems = oControl.getChilds(), sColor = oControl.getColor(), fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sap.ino.wall.util.Helper.shadeColor(sColor, -20)), sBackgroundColor = sap.ino.wall.util.Helper.transparentColor(sap.ino.wall.util.Helper.shadeColor(sColor, -30), 30);

        var i = 0;

        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWallItemGroup");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "; border-color: " + sColor + "; background-color: " + sBackgroundColor + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWIGTitle\">");
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\" style=\"background-color: " + sap.ino.wall.util.Helper.shadeColor(sColor, -20) + "; color : " + (fLuminance <= 0.6 ? "#F5F5F5" : "#232323") + "; border-color: " + sap.ino.wall.util.Helper.shadeColor(sColor, -10) + "; background-image: " + sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sColor, 5) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sColor, -5) + " 100%)") + "\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");
            oRM.write("</div>");

            // group container
            oRM.write("<div class=\"sapInoWallWIGroupContent\">");
            for (; i < aGroupItems.length; i++) {
                oRM.renderControl(aGroupItems[i]);
            }
            oRM.write('</div>');
        } else {
            oRM.write("front");
        }

        // resize handle
        this.renderResizeHandler(oRM, oControl);

        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWallItemGroup");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "; border-color: " + sColor + "; background-color: " + sBackgroundColor + "\"");
        oRM.write(">"); // span element

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMGROUP_PLACEHOLDER_TITLE"), true));
            oRM.renderControl(oControl._getButtonColorSelector());
            oRM.write("</div>");
        }

        // resize handle
        this.renderResizeHandler(oRM, oControl);

        oRM.write("</div>");

        // back button
        oRM.renderControl(oControl._getButtonFlip());

        // end wrapper
        oRM.write("</div>");
    };

})();