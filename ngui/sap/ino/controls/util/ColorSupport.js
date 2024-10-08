/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.controls.util.ColorSupport");
(function() {
    "use strict";

    sap.ino.controls.util.ColorSupport = {};

    sap.ino.controls.util.ColorSupport.calculateTitleTextColor = function(r, g, b) {
        var brightness;
        brightness = (parseInt(r, 16) * 0.299) + (parseInt(g, 16) * 0.587) + (parseInt(b, 16) * 0.114);

        // values range from 0 to 1
        if ((255 -brightness) < 105) {
            return "Dark";
        } else {
            return "Light";
        }
    };

    sap.ino.controls.util.ColorSupport.calculateMediaTextColor = function(r, g, b) {
        var brightness;
        brightness = (parseInt(r, 16) * 299) + (parseInt(g, 16) * 587) + (parseInt(b, 16) * 114);
        brightness = brightness / 255000;

        // values range from 0 to 1
        if (brightness >= 0.9) {
            var iR = parseInt(r, 16);
            iR = (iR - 40 > 0) ? iR - 40 : 0;
            r = iR.toString(16);
            var iG = parseInt(g, 16);
            iG = (iG - 40 > 0) ? iG - 40 : 0;
            g = iG.toString(16);
            var iB = parseInt(b, 16);
            iB = (iB - 40 > 0) ? iB - 40 : 0;
            b = iB.toString(16);
            return "#" + r + g + b;
        } else {
            return "#FFFFFF";
        }
    };
})();