/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.extensions.sap.ui.ux3.Shell");
jQuery.sap.require("sap.ui.ux3.Shell");

(function() {
    "use strict";
    var _setNotifyVisibility = sap.ui.ux3.Shell.prototype._setNotifyVisibility;
    sap.ui.ux3.Shell.prototype._setNotifyVisibility = function(sVisibleStatus) {
        _setNotifyVisibility.apply(this, arguments);
        jQuery(".sapUiUx3ShellNotify").css("z-index", 99999999);
    };
    
    var _updateOverlaysOnToolPaletteChange = sap.ui.ux3.Shell.prototype._updateOverlaysOnToolPaletteChange;
    sap.ui.ux3.Shell.prototype._updateOverlaysOnToolPaletteChange = function() {
        this.currentToolPaletteWidth = 0;   
        _updateOverlaysOnToolPaletteChange.apply(this, arguments);
    };    
})();