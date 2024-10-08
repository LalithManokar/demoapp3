/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemNoteRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemNoteRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemNoteRenderer.renderItem = function(oRM, oControl) {
        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIN");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write(">"); // span element

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // number
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWINNumber sapInoWallWINNumberText\">");
            oRM.write(oControl.getNumber());
            oRM.write("</div>");

            // title
            oRM.write("<div class=\"sapInoWallWINoteTitle sapInoWallWITitleText\">");
            // oRM.write("<a href=\"http://service.sap.com/sap/support/notes/" + oControl.getNumber() + "\" target=\"_blank\" class=\"noflip\"> " + oControl.getTitle() + "</a>");
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIN");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write(">"); // span element

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // number
            oRM.write("<div class=\"sapInoWallWINNumberEdit\">");
            oRM.renderControl(oControl._getInputNumber());
            oRM.write("</div>");

            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMNOTE_PLACEHOLDER_TITLE"), true));
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