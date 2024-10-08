/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.ThemeFactory");

(function() {
    "use strict";

    sap.ui.core.Element.extend("sap.ui.ino.controls.ThemeFactory", {
        metadata : {

        }
    });

    sap.ui.ino.controls.ThemeFactory.getImage = function(sImage, sPath) {
        if (!sPath) {
            sPath = "sap.ui.ino.controls";
        }

        // always get the current theme
        var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
        var bRTL = sap.ui.getCore().getConfiguration().getRTL();

        return sap.ui.resource(sPath, "themes/" + sCurrentTheme + "/img" + (bRTL ? "-RTL" : "") + "/ThemeFactory/" + sImage);
    };
})();