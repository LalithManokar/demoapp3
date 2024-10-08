/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemArrowRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");
    jQuery.sap.require("sap.ui.core.IconPool");
    
    /**
     * @class WallItemText renderer.
     * @static
     */
    sap.ino.wall.WallItemArrowRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    sap.ino.wall.WallItemArrowRenderer.addOuterStyleClasses = function(oRM) {
        oRM.addClass("sapInoWallWIArrow");
    };
    
    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallItemArrowRenderer.renderItem = function(oRM, oControl) {
        var sId = oControl.getId(), sKey = null;

        // start wrapper
        oRM.write("<div class=\"flippable\">");

        oRM.write("<label id=\"" + oControl.getId() + "-wallitem-description\" class=\"sapInoWallItemDescription\" style=\"height:0px;width:0px;overflow:hidden;position:absolute;\">");
        // this is only to prevent text bundle errors if color is not yet set in model
        var sText = sap.ino.wall.util.Helper.stripTags(oControl.getTitle());
        if (sText && sText.trim() !== "") {
            oRM.write(oControl._oRB.getText("CRTL_WALL_ITEMARROW_EXP_READERTEXT", [sText]));
        }
        else {
            oRM.writeEscaped(oControl._oRB.getText("CRTL_WALL_ITEMARROW_EXP_READERTEXT_EMPTY"));
        }
        oRM.write("</label>");

        /* front panel (view) */
        
        var f = oControl.calcFigures();
        
        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIArrow");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write("style=\"" + (f.w ? "width: " + f.w : "") + (f.h ? "px; height: " + f.h : "") + "px\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // Arrow
            sap.ino.wall.WallItemArrowRenderer.renderArrow(oRM, oControl, "front", f);
        } else {
            oRM.write("front");
        }
        
        oRM.write("<div class=\"sapInoWallWIArrowMoveHandle\"");
        oRM.write("style=\"" + "transform: rotateZ(" + f.r + "rad); width: " + f.d + "px; height: " + f.t + "px; left: " + (f.hx-f.x) + "px; top: " + (f.hy-f.y) + "px; color: " + oControl.getColor() + "\"");
        oRM.write(">");
        if (oControl.getTitle()) {
            oRM.writeEscaped(oControl.getTitle());
        }
        oRM.write("</div>");
        
        oRM.write("<div class=\"sapInoWallWIArrowStartHandle\"");
        oRM.write("style=\"" + "left: " + (f.x1-f.x-f.hs/2) + "px; top: " + (f.y1-f.y-f.hs/2) + "px\"");
        oRM.write(">");
        oRM.write("</div>");

        oRM.write("<div class=\"sapInoWallWIArrowEndHandle\"");
        oRM.write("style=\"" + "left: " + (f.x2-f.x-f.hs/2) + "px; top: " + (f.y2-f.y-f.hs/2) + "px\"");
        oRM.write(">");
        oRM.write("</div>");
        
        // end front side
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIArrow");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write("style=\"" + (f.w ? "width: " + f.w : "") + (f.h ? "px; height: " + f.h : "") + "px\"");
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // Arrow
            sap.ino.wall.WallItemArrowRenderer.renderArrow(oRM, oControl, "back", f);
            // Flip
            oRM.write("<div class=\"sapInoWallWIFlipEdit\">");
            // back button (is not mirrored on line item, so we have to use the inverse icon to stay in sync)
            oRM.renderControl(oControl._getButtonFlip().setIcon("sap-icon://undo").removeStyleClass("sapInoWallWIFlipBackButton").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonFlip"));
            oRM.write("</div>");
            // Title
            oRM.write("<div class=\"sapInoWallWITitleEdit sapInoWallWITitleEditArrow\">");
            oRM.renderControl(oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMTEXT_PLACEHOLDER_TITLE"), true));
            oRM.write("</div>");
            // style
            oRM.write("<div class=\"sapInoWallWIStyleEdit\">");
            oRM.renderControl(oControl._getButtonStyleSolid());
            oRM.renderControl(oControl._getButtonStyleDashed());
            oRM.renderControl(oControl._getButtonStyleDotted());
            oRM.write("</div>");
            // thickness selector
            oRM.write("<div class=\"sapInoWallWIThicknessEdit\">");
            oRM.renderControl(oControl._getButtonThickness3());
            oRM.renderControl(oControl._getButtonThickness4());
            oRM.renderControl(oControl._getButtonThickness5());
            oRM.write("</div>");
            // head style selector
            oRM.write("<div class=\"sapInoWallWIHeadStyleEdit\">");
            oRM.renderControl(oControl._getButtonHeadStyleNone());
            oRM.renderControl(oControl._getButtonHeadStyleStart());
            oRM.renderControl(oControl._getButtonHeadStyleEnd());
            oRM.renderControl(oControl._getButtonHeadStyleBoth());
            oRM.write("</div>");
            // color selector
            oRM.write("<div class=\"sapInoWallWIColorEdit\">");
            oRM.renderControl(oControl._getButtonColorSelector());
            oRM.write("</div>");
        } else {
            oRM.write("back");
        }

        // end back side
        oRM.write("</div>");
        
        // end wrapper
        oRM.write("</div>");
    };
    
    sap.ino.wall.WallItemArrowRenderer.renderArrow = function(oRM, oControl, sSideId, f) {
        var sMarkerStartId = oControl.getId() + "-" + sSideId + "-start-triangle";
        var sMarkerEndId = oControl.getId() + "-" + sSideId + "-end-triangle";
        var sMarkerStart = oControl.getHeadStyle() == "START" || oControl.getHeadStyle() == "BOTH" ? "url(#" + sMarkerStartId + ")" : "none";
        var sMarkerEnd = oControl.getHeadStyle() == "END" || oControl.getHeadStyle() == "BOTH" ? "url(#" + sMarkerEndId + ")" : "none";
        var sDashArray = "none";
        switch (oControl.getStyle()) {
            case "DOTTED":
                sDashArray = "4, 4";
                break;
            case "DASHED":
                sDashArray = "10, 5";
                break;
            case "SOLID" :
                /* falls through */
            default:
                break;
        }
        oRM.write("<svg id=\"" + oControl.getId() + "-" + sSideId + "-arrow" + "\" class=\"sapInoWallWIArrowMarker\" xmlns=\"http://www.w3.org/2000/svg\" width=\"" + f.w + "px\" height=\"" + f.h + "px\" viewBox=\"0 0 " + f.w + " " + f.h + "\">");
        oRM.write("<marker id=\"" + sMarkerStartId + "\" viewBox=\"0 0 10 10\" refX=\"" + (oControl.getThickness() / 2) + "\" refY=\"5\" markerUnits=\"strokeWidth\" markerWidth=\"" + oControl.getThickness() + "\" markerHeight=\"" + oControl.getThickness() + "\" stroke-dasharray=\"none\" orient=\"auto\" overflow=\"visible\">");
        oRM.write("<path d=\"M -2 5 L 8 0 L 8 10 z\" fill=\"" + oControl.getColor() + "\"/>");
        oRM.write("</marker>");
        oRM.write("<marker id=\"" + sMarkerEndId + "\" viewBox=\"0 0 10 10\" refX=\"" + (6 + oControl.getThickness() / 2) + "\" refY=\"5\" markerUnits=\"strokeWidth\" markerWidth=\"" + oControl.getThickness() + "\" markerHeight=\"" + oControl.getThickness() + "\" orient=\"auto\"> overflow=\"visible\"");
        oRM.write("<path d=\"M 0 0 L 10 5 L 0 10 z\" fill=\"" + oControl.getColor() + "\"/>");
        oRM.write("</marker>");
        oRM.write("<line x1=\"" + (f.x1-f.x) + "\" y1=\"" + (f.y1-f.y) + "\" x2=\"" + (f.x2-f.x) + "\" y2=\"" + (f.y2-f.y) + "\" marker-start=\"" + sMarkerStart + "\" marker-end=\"" + sMarkerEnd + "\" stroke-dasharray=\"" + sDashArray + "\" stroke=\"" + oControl.getColor() + "\" stroke-width=\"" + oControl.getThickness() + "\"/>");
        oRM.write("</svg>");
    }
})();