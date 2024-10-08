/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.util.Logger");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class wall renderer.
     * @static
     */
    sap.ino.wall.WallRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallRenderer.render = function(oRM, oControl) {
        var i = 0, aItems = oControl.getItems(), sBackgroundColor = oControl.getBackgroundColor();

        // we never want to re-render the wall while working with the wall items so we log a warning to detect
        // unnecessary re-renderings
        sap.ino.wall.util.Logger.warning("Wall rerendering for \"" + oControl.getId() + "\" (sId: " + oControl.getStorageId() + ") was triggered!");

        // write the HTML into the render manager
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.write("class=\"sapInoWallWOuter\">");

        oRM.write("<div id=\"" + oControl.getId() + "-wall-selector-begin\" style=\"height:0px;width:0px;overflow:hidden\" class=\"sapInoWallSelectorBegin\" tabindex=\"0\"></div>");

        // the inner container contains all the items
        oRM.write("<div id=\"" + oControl.getId() + "-inner\" class=\"sapInoWallWInner\" aria-live=\"polite\" role=\"region\"");
        if (!sBackgroundColor) {
            if (oControl.getBackgroundImage().indexOf("http://") === 0 || oControl.getBackgroundImage().indexOf("https://") === 0) {
                oRM.addStyle("background-image", "url(" + oControl.getBackgroundImage() + ")");
                if (oControl.getBackgroundImageTiled()) {
                    oRM.addStyle("background-position", "initial");
                    oRM.addStyle("background-repeat", "repeat");
                } else {
                    oRM.addStyle("background-position", "50% 50%");
                    oRM.addStyle("background-repeat", "no-repeat");
                }
                oRM.addStyle("background-size", oControl.getBackgroundImageZoom() + "%");
            } else {
                oRM.addStyle("background-image", "url(/sap/ino/ngui/sap/ino/assets/img/wall/bg/" + oControl.getBackgroundImage() + ")");
                oRM.addStyle("background-position", "initial");
                oRM.addStyle("background-repeat", "repeat");
            }
        } else {
            oRM.addStyle("background-color", "#" + sBackgroundColor);
            oRM.addStyle("background-image", sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sBackgroundColor, 10) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sBackgroundColor, -10) + " 100%)"));
        }
        oRM.writeStyles();
        oRM.writeAttribute("tabindex", "-1");
        oRM.write(">"); // span element
        for (i = 0; i < aItems.length; i++) {
            oRM.renderControl(aItems[i]);
        }

        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            // show bounding box
            oRM.write("<div id=" + oControl.getId() + "-boundingBox");
            oRM.addClass("sapInoWallWBB");
            oRM.writeClasses();
            oRM.write("></div>");
            // show cluster box
            oRM.write("<div id=" + oControl.getId() + "-clusterBox");
            oRM.addClass("sapInoWallWCB");
            oRM.writeClasses();
            oRM.write("></div>");
        }

        oRM.write("</div>");

        // render the trash bin
        oRM.renderControl(oControl._oHLTrashAbove);
        oRM.renderControl(oControl._oHLTrash);

        // render the selection rectangle
        oRM.renderControl(oControl._oSelectionRectangle);

        // render the lock
        oRM.renderControl(oControl._oLock);

        // render the template indicator
        oRM.renderControl(oControl._oTemplateIndicator);

        oRM.write("<div id=\"" + oControl.getId() + "-wall-selector\" class=\"sapInoWallSelector\" tabindex=\"-1\" aria-labelledby=\"" + oControl.getId() + "-wall-description\"></div>");

        oRM.write("<div id=\"" + oControl.getId() + "-wall-description\" class=\"sapInoWallDescription\" style=\"height:0px;width:0px;overflow:hidden;position:absolute;\">");
        oRM.writeEscaped(oControl._oRB.getText("CRTL_WALL_DESCRIPTION", [oControl.getTitle()]));
        oRM.write("</div>");

        oRM.write("<div id=\"" + oControl.getId() + "-wall-selector-end\" style=\"height:0px;width:0px;overflow:hidden\" class=\"sapInoWallSelectorEnd\" tabindex=\"0\"></div>");

        oRM.write("</div>");

        // show drag indicator
        oRM.write("<div id=\"" + oControl.getId() + "-drag\" class=\"sapInoWallWDragPreview\">");
        oRM.write("<div id=\"" + oControl.getId() + "-drag\" class=\"sapInoWallWDragPreviewInner\">");
        oRM.write("</div>");
        oRM.write("</div>");

        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            // show drag indicator
            oRM.write("<div id=" + oControl.getId() + "-dragIndicator");
            oRM.addClass("sapInoWallWDI");
            oRM.writeClasses();
            oRM.write(">D</div>");

            // show mouse pointer indicator
            oRM.write("<div id=" + oControl.getId() + "-pointerIndicator");
            oRM.addClass("sapInoWallWPI");
            oRM.writeClasses();
            oRM.write(">M</div>");
        }
    };

})();