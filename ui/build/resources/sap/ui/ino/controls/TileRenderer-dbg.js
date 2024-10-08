/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.TileRenderer");
jQuery.sap.require("sap.m.CustomTileRenderer");
jQuery.sap.require("sap.ui.core.Renderer");

sap.ui.ino.controls.TileRenderer = sap.ui.core.Renderer.extend(sap.m.CustomTileRenderer);

sap.ui.ino.controls.TileRenderer._renderContent = function(oRenderManager, oControl) {
    oControl.renderContent(oRenderManager, oControl);
};