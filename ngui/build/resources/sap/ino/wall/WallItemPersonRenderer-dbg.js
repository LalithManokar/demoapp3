/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemPersonRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemPerson renderer.
     * @static
     */
    sap.ino.wall.WallItemPersonRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemPersonRenderer.renderItem = function(oRM, oControl) {
        var oBusyIndicator = oControl._getBusyIndicator(), oImage = oControl._getImage(), oDropUpload = oControl._getDropUpload();

        // add busy state to preview
        if (oControl.getStatus() === "Busy" && oImage) {
            oImage.addStyleClass("sapInoWallImageBusy");
        }

        // start wrapper
        oRM.write("<div class=\"flippable\">");

        /* front panel (view) */
        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIPFlip");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write(">");
        
        oRM.write("<div");
        oRM.addClass("sapInoWallWIP sapInoWallWIPPerson");
        oRM.addClass("front");        
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // person image
            oRM.write('<div id="' + oControl.getId() + '-imageWrapper" class="sapInoWallWIPImageWrapper sapInoWallWIPImageWrapperDefaultImage">');
            oRM.renderControl(oImage.addStyleClass("sapInoWallWIPImage").addStyleClass("noflip"));
            oRM.write("</div>");

            // render a busy indicator
            if (oControl.getStatus() !== "Busy") {
                oBusyIndicator.addStyleClass("sapInoWallInvisible");
            }
            oRM.renderControl(oBusyIndicator);

            // meta wrapper (only shown if title / email / phone is set)
            oRM.write("<div class=\"sapInoWallWIPMeta " + (!oControl.getTitle() && !oControl.getEmail() && !oControl.getPhone() ? " sapInoWallInvisible" : "") + "\">");

            // name
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");

            // mail
            oRM.write("<div class=\"sapInoWallWIPMail\">");
            oRM.renderControl(oControl._getLinkEmail());
            oRM.write("</div>");

            // phone
            oRM.write("<div class=\"sapInoWallWIPPhone\">");
            oRM.renderControl(oControl._getLinkPhone());
            oRM.write("</div>");

            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIP sapInoWallWIPPerson");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // icon drop / upload area
            oRM.write("<div class=\"sapInoWallWIPPreviewEdit\">");
            oRM.renderControl(oDropUpload);
            oRM.write("</div>");
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMPERSON_PLACEHOLDER_NAME"), true));
            oRM.write("</div>");
            // email
            oRM.write("<div class=\"sapInoWallWIPEmailEdit\">");
            oRM.renderControl(oControl._getInputEmail());
            oRM.write("</div>");
            // phone
            oRM.write("<div class=\"sapInoWallWIPPhoneEdit\">");
            oRM.renderControl(oControl._getInputPhone());
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