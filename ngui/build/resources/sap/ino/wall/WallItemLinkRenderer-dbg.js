/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemLinkRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemLink renderer.
     * @static
     */
    sap.ino.wall.WallItemLinkRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemLinkRenderer.renderItem = function(oRM, oControl) {
        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIL");
        oRM.addClass("front");
        oRM.writeClasses();
        // TODO: fix this: workaround for re-rendering issue (when selecting type)
        if (sap.ui.Device.browser.internet_explorer === true && oControl.getFlipped()) {
            oRM.write(" style=\"display: none\"");
        }
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // icon (with surrounding div (content will be replaced when type changes)
            oRM.write("<div id=\"" + oControl.getId() + "-icon\">");
            oRM.renderControl(oControl._getIcon());
            oRM.write("</div>");

            oRM.write("<div class=\"sapInoWallWILMeta\">");

            // title
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");

            // description
            oRM.write("<div class=\"sapInoWallWILDescription\"><a");
            oRM.writeAttributeEscaped("href", oControl.getDescription());
            oRM.writeAttribute("target", "_blank");
            oRM.addClass("sapInoWallWILDescriptionLink");
            oRM.writeClasses();
            oRM.write(" noflip\">");
            oRM.write("<span class=\"sapInoWallWILLinkText\">");
            oRM.write(oControl.getLinkText());
            oRM.write("</span></a></div>");

            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIL");
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
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMLINK_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");

            // type
            oRM.write("<div class=\"sapInoWallWILTypeEdit\">");
            oRM.renderControl(oControl._getSelectType());
            oRM.write("</div>");

            // description
            oRM.write("<div class=\"sapInoWallWILLinkInput\">");
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