/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.config.Config");

(function() {
    "use strict";

    sap.ino.wall.config.Config = {

        getWallSaveDelay : function() {
            return 3000;
        },

        getWallSaveDelayAuto : function() {
            return 250;
        },

        getWallSyncDelay : function() {
            return 0;
        },

        getWallSyncDelayAuto : function() {
            return !sap.ui.Device.system.tablet ? 1000 : 3000;
        },

        getWallCollisionThreshold : function() {
            return 50;
        },

        getEnableRichtTextEditing : function() {
            return true;
        },

        getEnableChildItems : function() {
            return true;
        },

        getZoomCapable : function() {
            return !(sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.firefox || sap.ui.Device.browser.safari);
        },

        getDebugPositioning : function() {
            return false;
        }
    };
})();