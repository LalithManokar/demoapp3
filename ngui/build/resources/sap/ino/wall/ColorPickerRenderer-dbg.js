/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ColorPickerRenderer");

(function() {
    "use strict";

    /**
     * @class ColorPicker renderer.
     * @static
     */
    sap.ino.wall.ColorPickerRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.ColorPickerRenderer.render = function(oRM, oControl) {
        // write the HTML into the render manager
        oRM.write("<span");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallColorPicker");
        oRM.writeClasses();
        oRM.write(">"); // span element
        oRM.write("</span>");
    };

})();