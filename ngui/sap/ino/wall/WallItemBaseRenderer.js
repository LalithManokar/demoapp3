/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemBaseRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemBase renderer.
     * @static
     */
    sap.ino.wall.WallItemBaseRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.WallItemBaseRenderer.render = function(oRM, oControl) {
        var aChilds = oControl.getChilds() || [], 
            oParent = oControl.getParent(),
            bIsChild = oControl.getParent() instanceof sap.ino.wall.WallItemBase && !(oParent instanceof sap.ino.wall.WallItemGroup), 
            i = 0;

        // write outer wall item div
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallWIB");
        oRM.writeAttribute("tabindex", "-1"); // wall handles the tabchain
        oRM.writeAttribute("role", "group");
        oRM.writeAttribute("aria-labelledby", oControl.getId() + "-wallitem-description"); // description handled by specific item

        // callback to inherited control's method
        if (this.addOuterStyleClasses) {
            this.addOuterStyleClasses(oRM);
        }

        if (oControl.getFlipped()) {
            oRM.addClass("flipped");
        }
        if (!oControl.getEnabled()) {
            oRM.addClass("sapInoWallWIBDisabled");
        }
        if (oControl.getSelected()) {
            oRM.addClass("sapInoWallWIBSelected");
        }
        if (bIsChild) {
            oRM.addClass("sapInoWallWIBChild");
        }
        oRM.writeClasses();

        // write styles (childs do not have left and top, width and height only if set explicitly, z-index)
        oRM.writeAttribute("style", (!bIsChild ? "left: " + oControl.getX() + "; top: " + oControl.getY() + ";" : "") + (oControl.getW() ? " width: " + oControl.getW() + ";" : "") + (oControl.getH() ? " height: " + oControl.getH() + ";" : "") + (!bIsChild ? " z-index:" + oControl.getDepth() : ""));
        oRM.write(">");

        // callback to inherited control's method
        if (this.renderItem) {
            this.renderItem(oRM, oControl);
        }

        // render children container
        if (!(oControl instanceof sap.ino.wall.WallItemGroup)) {
            oRM.write('<div id="' + oControl.getId() + '-childs" class="sapInoWallWIBChilds' + (!aChilds.length ? " sapInoWallInvisible" : "") + '">');
            for (; i < aChilds.length; i++) {
                oRM.renderControl(aChilds[i]);
            }
            oRM.write('</div>'); 
        }
        
        // show bounding boxes for collision detection
        // TODO: use real front containers width and height here
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            oRM.write('<div class="sapInoWallWIBIntersectionBox"></div>');
            oRM.write('<div class="sapInoWallWIBNeighbourBox" style="padding: ' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px; left: -' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px; top: -' + sap.ino.wall.config.Config.getWallCollisionThreshold() + 'px"></div>');
        }
        
        oRM.write("</div>");
    };

    sap.ino.wall.WallItemBaseRenderer.renderResizeHandler = function(oRM, oControl) {
        if (oControl.getResizable()) {
            oRM.write("<div class=\"sapInoWallWIResizeHandle\">");
            // TODO: might be better performance if we write the DOM directly:
            // sap.ui.core.IconPool.getIconInfo("sap-icon://dropdown").content
            oRM.renderControl(oControl._getIconResize());
            oRM.write("</div>");
        }
    };
    
})();