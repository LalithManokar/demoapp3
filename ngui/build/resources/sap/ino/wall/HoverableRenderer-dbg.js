/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.HoverableRenderer");

(function() {
    "use strict";

    /**
     * @class Hoverable renderer.
     * @static
     */
    sap.ino.wall.HoverableRenderer = {};

    /**
     * Renders the inner control
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.HoverableRenderer.render = function(oRM, oControl) {
        oRM.renderControl(oControl.getContent());
    };

})();