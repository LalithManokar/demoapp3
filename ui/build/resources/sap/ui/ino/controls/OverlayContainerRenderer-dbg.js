/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.OverlayContainerRenderer");
jQuery.sap.require("sap.ui.ux3.OverlayContainerRenderer");
jQuery.sap.require("sap.ui.core.Renderer");

sap.ui.ino.controls.OverlayContainerRenderer = sap.ui.core.Renderer.extend(sap.ui.ux3.OverlayContainerRenderer);

sap.ui.ino.controls.OverlayContainerRenderer.renderContent = function(oRenderManager, oControl) {
    var rm = oRenderManager;
    rm.write("<div role='Main' class='sapUiUx3OCContent' id='"+oControl.getId()+"-content'>");
    oControl.renderContent(oRenderManager, oControl);
    rm.write("</div>");
};