/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.ResponsiveOptionSelectorRenderer");

(function() {
    "use strict";

    /**
     * @class ResponsiveOptionSelector renderer.
     * @static
     */
    sap.ino.wall.ResponsiveOptionSelectorRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.ResponsiveOptionSelectorRenderer.render = function(oRM, oControl) {
        // begin wrapper
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallROS");
        oRM.writeClasses();
        oRM.write(">");

        // render the inner controls based on the state
        if (oControl.getEditable()) {
            if (oControl.getMode() === "Large") {
                oRM.renderControl(oControl._getSegmentedButton());
            } else if (oControl.getMode() === "Small") {
                oRM.renderControl(oControl._getSelect());
            }
        } else {
            oRM.renderControl(oControl._getLabel());
        }

        // end wrapper
        oRM.write("</div>");
    };

})();