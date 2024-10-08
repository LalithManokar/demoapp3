/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.DropUploadRenderer");

(function() {
    "use strict";

    /**
     * @class DropUpload renderer.
     * @static
     */
    sap.ino.wall.DropUploadRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.DropUploadRenderer.render = function(oRM, oControl) {
        var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");

        // write the HTML into the render manager
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallDropUpload");
        oRM.writeClasses();
        oRM.write(">");

        oRM.write('<div id="' + oControl.getId() + '-fileDrop" tabindex="0" class="sapInoWallDropUploadArea">');
        oRM.write('<div class="sapInoWallDropUploadAreaInner noflip" title="' + oRB.getText("WALL_DROPUPLOAD_STATUSMSG_DROP") + '">');
        oRM.renderControl(oControl._getIcon());
        oRM.write('</div>');
        oRM.write('</div>');
        // upload form (hidden)
        oRM.write('<form><input name="' + oControl.getId() + '-fileUpload" id="' + oControl.getId() + '-fileUpload" class="sapInoWallDropUploadForm" type="file" accept="');
        oRM.writeEscaped(oControl.getAccept());
        oRM.write('"></form>');

        oRM.write("</div>");
    };

})();