/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemAttachmentRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemAttachmentRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemAttachmentRenderer.renderItem = function(oRM, oControl) {
        var oInputTitle = oControl._getInputTitle();
        var oBusyIndicator = oControl._getBusyIndicator();
        var oURL = oControl.getAggregation("URL");
        var oDropUpload = oControl._getDropUpload();
        
        // start wrapper
        oRM.write("<div class=\"flippable sapInoWallWIAtt\">");

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
        oRM.addClass("sapInoWallWIAttLayout");
        oRM.writeClasses();
        oRM.write(">");
        
        // render a busy indicator
        if (oControl.getStatus() !== "Busy") {
            oBusyIndicator.addStyleClass("sapInoWallInvisible");
        }
        oRM.renderControl(oBusyIndicator);

        // icon with surrounding div (content will be replaced dynamically when type changes)
        var sClasses = "sapInoWallWIAttIconWrapper";
        
        oRM.write("<div id=\"" + oControl.getId() + "-iconWrapper\" class=\"" + sClasses + "\">");
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
        oRM.addClass("sapInoWallWIAttRight");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("</div>");
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIAttLayout");
        oRM.addClass("gradients");
        oRM.addClass("back");
        oRM.writeClasses();
        // TODO: fix this: workaround for re-rendering issue (when selecting type)
        if (sap.ui.Device.browser.internet_explorer === true && oControl.getFlipped()) {
            oRM.write(" style=\"backface-visibility:visible\"");
        }
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // icon drop / upload area
            oRM.write("<div class=\"sapInoWallWIAttDocEdit\">");
            oRM.renderControl(oDropUpload);
            oRM.write("</div>");
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oInputTitle.setProperty("placeholder", oControl._oRB.getText("WALL_ITEMATTACHMENT_PLACEHOLDER_TITLE"), true));
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