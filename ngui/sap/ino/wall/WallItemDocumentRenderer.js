/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemDocumentRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemDocumentRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemDocumentRenderer.renderItem = function(oRM, oControl) {
        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("front");
        oRM.writeClasses();
        // TODO: fix this: workaround for re-rendering issue (when selecting type)
        if (sap.ui.Device.browser.internet_explorer === true && oControl.getFlipped()) {
            oRM.write(" style=\"display: none\"");
        }
        oRM.write(">");

        oRM.write("<div id=" + oControl.getId() + "-frontInner");
        oRM.addClass("sapInoWallWID");
        oRM.writeClasses();
        oRM.write(">");

        // icon with surrounding div (content will be replaced dynamically when type changes)
        oRM.write("<div id=\"" + oControl.getId() + "-icon\" class=\"sapInoWallWIDIconWrapper\">");
        oRM.renderControl(oControl._getIcon());
        oRM.write("</div>");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");
        // dogear div
        oRM.write("<div id=" + oControl.getId() + "-frontRight");
        oRM.addClass("sapInoWallWIDRight");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("</div>");
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWID");
        oRM.addClass("gradients");
        oRM.addClass("back");
        oRM.writeClasses();
        // TODO: fix this: workaround for re-rendering issue (when selecting type)
        if (sap.ui.Device.browser.internet_explorer === true && oControl.getFlipped()) {
            oRM.write(" style=\"backface-visibility:visible\"");
        }
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMDOCUMENT_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");

            // type
            oRM.write("<div class=\"sapInoWallWIDTypeEdit\">");
            oRM.renderControl(oControl._getSelectType());
            oRM.write("</div>");

            // description
            oRM.write("<div class=\"sapInoWallWIDDescriptionEdit\">");
            oRM.renderControl(oControl._getInputLink());
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