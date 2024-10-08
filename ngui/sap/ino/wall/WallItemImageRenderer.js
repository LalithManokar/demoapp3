/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemImageRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.util.Logger");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemImage renderer.
     * @static
     */
    sap.ino.wall.WallItemImageRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemImageRenderer.renderItem = function(oRM, oControl) {
        var oInputTitle = oControl._getInputTitle(), oBusyIndicator = oControl._getBusyIndicator(), oPreview = oControl.getAggregation("imagePreview");
        var oDropUpload = oControl._getDropUpload();
        var oCheckBox = oControl._getCheckBox();

        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */

        oRM.write("<div id=" + oControl.getId() + "-front");
        if (!oControl.getShowAsIcon()) {
            oRM.addClass("sapInoWallWII");
        }
        oRM.addClass("gradients");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        // add busy state to preview
        if (oControl.getStatus() === "Busy" && oPreview) {
            oPreview.addStyleClass("sapInoWallImageBusy");
        }

        // image wrapper
        oRM.write('<div id="' + oControl.getId() + '-imagePreviewWrapper" class="sapInoWallWIIImageWrapper">');

        // link
        // oRM.write("<a " + (oControl.getImage() ? "href=\"" + oControl.getImage() + "\" " : "") + "\">");
        // TODO: put this in onbeforeRendering
        if (!oPreview) {
            sap.ino.wall.util.Logger.warning("Preview image not found");
            oRM.renderControl(oControl._getIcon());
        } else {
            oRM.renderControl(oPreview.addStyleClass("noflip"));
        }

        // link end
        // oRM.write("</a>");

        // wrapper end
        oRM.write("</div>");

        // render a busy indicator
        if (oControl.getStatus() !== "Busy") {
            oBusyIndicator.addStyleClass("sapInoWallInvisible");
        }
        oRM.renderControl(oBusyIndicator);

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div");
            oRM.addClass("sapInoWallWITitle sapInoWallWITitleText sapInoWallWIITitle");
            if (oControl.getShowAsIcon()) {
                oRM.addClass("sapInoWallWIITitleIcon");
            }
            oRM.writeClasses();
            oRM.write(">");
            oRM.writeEscaped(oControl.getTitle());
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
        oRM.addClass("sapInoWallWII");
        oRM.addClass("gradients");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") + "\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // icon drop / upload area
            oRM.write("<div class=\"sapInoWallWIIPreviewEdit\">");
            oRM.renderControl(oDropUpload);
            oRM.write("</div>");
            // title
            oRM.write("<div class=\"sapInoWallWIIitleEdit\">");
            oRM.renderControl(oInputTitle.setProperty("placeholder", oControl._oRB.getText("WALL_ITEMHEADLINE_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");
            // check box
            oRM.write("<div class=\"sapInoWallWIShowAsIcon\">");
            oRM.renderControl(oCheckBox);
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