/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.TextEditorRenderer");

(function() {
    "use strict";

    /**
     * @class TextEditor renderer.
     * @static
     */
    sap.ino.wall.TextEditorRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.TextEditorRenderer.render = function(oRM, oControl) {
        oRM.write("<div");
        oRM.writeControlData(oControl);
        oRM.addClass("sapInoWallTextEditor");
        oRM.writeClasses();
        oRM.write(">");

        // hide the original nicedit panel
        oRM.write("<div id=\"" + oControl.getId() + "-nicPanel\" class=\"sapInoWallInvisible\"></div>");
        // display our own editor controls instead of the ones from nicedit to have a UI5 look and feel
        oRM.write("<div id=\"" + oControl.getId() + "-editorControls\" class=\"sapInoWallTextEditorControls\" role=\"toolbar\" aria-label=\"" + oControl._oRB.getText("CRTL_WALL_TEXTEDITOR_EXP_CONTROLS_TOOLBAR") + "\">");
        oRM.renderControl(oControl._getEditorControls());
        oRM.write("</div>");
        // render a dummy textarea that will be replaced with the rich text editor
        oRM.write("<div id=\"" + oControl.getId() + "-nicContent\" class=\"sapInoWallTextEditorContent sapMInputBaseInner sapMTextAreaInner\"><textarea id=\"" + oControl.getId() + "-nicContentTA\" class=\"sapMInputBaseInner sapInoWallTextEditorContent\">");
        oRM.writeEscaped(oControl.getValue());
        oRM.write("</textarea>");
        oRM.write("</div>");
        oRM.write("</div>");
    };

})();