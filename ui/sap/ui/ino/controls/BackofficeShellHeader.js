/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.BackofficeShellHeader");

jQuery.sap.require("sap.ui.ino.controls.ColorSupport");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");


(function() {
    "use strict";

    /**
     * 
     * BackofficeShell Data is an element representing data for the backoffice shell.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * </ul>
     */
    sap.ui.layout.HorizontalLayout.extend("sap.ui.ino.controls.BackofficeShellHeader", {
        metadata : {
            properties : {
                colorCode : "string",
                campaignId : "int",
            },
        },

        onAfterRendering : function() {
            this.updateHeaderColor();
            //set focus on home button
            this.$().find(".sapUiInoBOShellHeaderHomeBtn")[0].focus();
        },

        onBeforeRendering : function() {
            var sColorCode = this.getColorCode();
            if (!sColorCode) {
                this.removeStyleClass("sapUiInoBOShellHeaderLight");
                this.removeStyleClass("sapUiInoBOShellHeaderDark");
                this.addStyleClass("sapUiInoBOShellHeaderNotSet");
            } else {
                var colorType = sap.ui.ino.controls.ColorSupport.calculateTitleTextColor(sColorCode.substr(0, 2), sColorCode.substr(2, 2), sColorCode.substr(4, 2));
                this.removeStyleClass("sapUiInoBOShellHeaderLight");
                this.removeStyleClass("sapUiInoBOShellHeaderDark");
                this.addStyleClass("sapUiInoBOShellHeader" + colorType);
                this.removeStyleClass("sapUiInoBOShellHeaderNotSet");
            }
        },

        updateHeaderColor : function() {
            function hexToRgb(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r : parseInt(result[1], 16),
                    g : parseInt(result[2], 16),
                    b : parseInt(result[3], 16)
                } : null;
            }
            var sColorCode = this.getColorCode();
            if (sColorCode && this.getVisible()) {
                this.$().toggleClass("sapUiInoBOShellHeaderLayoutFramed", sColorCode === "FFFFFF");
                var aRGB = hexToRgb(sColorCode);
                this.$().css("background-color", "#" + sColorCode);
                var sBGBodyColor;
                if (sColorCode === "FFFFFF") {
                    sBGBodyColor = "";
                    this.$().parents("body").css("background-image", sBGBodyColor);
                } else {
                    var sBGBodyColorWebKit = "-webkit-linear-gradient(top, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.4) 100%)";
                    var sBGBodyColorIE = "-ms-linear-gradient(top, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.4) 100%)";
                    var sBGBodyColorW3C = "linear-gradient(to bottom, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.4) 100%)";
                    var sBGBodyColorFF = "-moz-linear-gradient(top, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.4) 100%)";
                    this.$().parents("body").css("background-image", sBGBodyColorWebKit);
                    this.$().parents("body").css("background-image", sBGBodyColorIE);
                    this.$().parents("body").css("background-image", sBGBodyColorW3C);
                    this.$().parents("body").css("background-image", sBGBodyColorFF);
                }
            } else {
                this.$().parents("body").css("background-image", "");
                this.$().css("background-color", "");
            }
        },

        settingsBtnPressed : function(oEvent, oData) {
            sap.ui.ino.application.ApplicationBase.getApplication().campaignSettingsPressed({
                campaignId : oData.getCampaignId()
            });
        },

        renderer : "sap.ui.layout.HorizontalLayoutRenderer"

    });

})();