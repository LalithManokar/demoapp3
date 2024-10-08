/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.ThemeFactory");

(function() {
    "use strict";

    sap.ui.core.Element.extend("sap.ino.wall.ThemeFactory", {
        metadata : {

        }
    });

    sap.ino.wall.ThemeFactory.getImage = function(sImage, sPath) {
        if (!sPath) {
            sPath = "sap.ino.wall";
        }

        // always get the current theme
        var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
        var bRTL = sap.ui.getCore().getConfiguration().getRTL();

        return sap.ui.resource(sPath, "themes/" + sCurrentTheme + "/img" + (bRTL ? "-RTL" : "") + "/ThemeFactory/" + sImage);
    };
})();