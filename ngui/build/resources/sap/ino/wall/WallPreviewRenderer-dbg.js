/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallPreviewRenderer");

(function() {
    "use strict";

    /**
     * @class wall renderer.
     * @static
     */
    sap.ino.wall.WallPreviewRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallPreviewRenderer.render = function(oRM, oControl) {
        var sMode = oControl.getMode(), oWall = oControl.getWallControl(), sTitle, sText = "";

        switch (sMode) {
            case "Wall" :
                sTitle = oWall.getTitle();
                break;
            default :
                sTitle = "";
                sText = "";
        }

        // debug
        jQuery.sap.log.info("Preview rendering \"" + oControl.getId() + "\" (wall: " + sTitle + ") was triggered!");

        // render control div
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallPreview");
        if (sMode === "New" || sMode === "NewTemplate") {
            oRM.addClass("new");
        } else if (sMode === "More") {
            oRM.addClass("more");
        } else if (sMode === "Error") {
            oRM.addClass("error");
        }
        
        oRM.writeClasses();
        oRM.write(">");

        // render preview wrapper (canvas will be displayed too bing in height otherwise)
        oRM.write('<div class="sapInoWallPreviewCanvasWrapper">');
        if (oWall && oWall.getType() === "Template") {
            oRM.write('<div class="sapInoWallTemplateIndicatorPreview"></div>');
        }
        // render preview (Wall = canvas, New/Error = div
        oRM.write('<' + (sMode === 'Wall' ? 'canvas' : 'div') + ' width="300" height="200" id="' + oControl.getId() + '-canvas"');
        oRM.addClass("sapInoWallPreviewCanvas");
        if (sMode === "New" || sMode === "NewTemplate") {
            oRM.addClass("new");
        } else if (sMode === "More") {
            oRM.addClass("more");
        } else if (sMode === "Error") {
            oRM.addClass("error");
        }
        oRM.writeClasses();
        oRM.write(">");
        if (sMode === "New") {
            oRM.write('<div class="sapInoWallPreviewCreateNew">');
            oRM.renderControl(oControl._getIconNew());
            oRM.write('</div>');
            oRM.write('<div class="sapInoWallPreviewCreateTemplate">');
            oRM.renderControl(oControl._getIconTemplate());
            oRM.write('</div>');
        } else if (sMode === "NewTemplate") {
            oRM.renderControl(oControl._getIconNew());
        } else if (sMode === "More") {
            oRM.write(sText);
        }
        oRM.write('</' + (sMode === 'Wall' ? 'canvas' : 'div') + '>');
        oRM.write('</div>');

        oRM.renderControl(oControl._getFooter(sTitle, oControl.getOwner() || ""));

        if (oControl.getShowRemoveIcon()) {
            oRM.renderControl(oControl._getIconRemove());
        }

        oRM.write("</div>");
    };

})();