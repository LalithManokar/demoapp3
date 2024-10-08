/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.Slider");
(function() {
    "use strict";

    /**
     * 
     * This separate control is needed to enhance the SAPUI5 slider with always displaying value of the "grip" directly
     * (not only in a tooltip).
     * 
     */
    sap.ui.commons.Slider.extend("sap.ui.ino.controls.Slider", {

        onAfterRendering : function() {
            sap.ui.commons.Slider.prototype.onAfterRendering.apply(this, arguments);
            var sValue = this._getGripValue();
            if (!!sValue) {
                // Attention! oGrip is an internal state of the slider - which may change
                jQuery(this.oGrip).append("<div class=\"sapUiInoSliGripVal\">" + sValue + "</div>");
            }
            this._adjustTicks();
        },

        changeGrip : function() {
            sap.ui.commons.Slider.prototype.changeGrip.apply(this, arguments);
            var sValue = this._getGripValue();
            if (!!sValue) {
                jQuery(this.oGrip).find(".sapUiInoSliGripVal").text(sValue);                
            }
            this._adjustTicks();
        },

        _getGripValue : function() {
            // set text content of grip to value
            if (this.getValue()) {
                var sValue = "";
                if (this.valueDataType == "INTEGER") {
                    sValue = Math.round(this.getValue());
                } else {
                    sValue = (Math.round(this.getValue() * 100) / 100).toLocaleString();
                }
                return sValue;
            }
            return undefined;
        },
        
        _adjustTicks : function() {
            var iWidth = parseInt(jQuery(jQuery(this.getDomRef()).find(".sapUiSliTick")[1]).css("left")) + 9;
            var sWidth = iWidth + "px";
            jQuery(this.getDomRef()).find(".sapUiSliTextLeft").css("right", sWidth);
            jQuery(this.getDomRef()).find(".sapUiSliTextLeft").css("left", "auto");
            jQuery(this.getDomRef()).find(".sapUiSliTextRight").css("right", "auto");
            jQuery(this.getDomRef()).find(".sapUiSliTextRight").css("left", sWidth);
        },

        onresize : function() {
            sap.ui.commons.Slider.prototype.onresize.apply(this, arguments);
            this._adjustTicks();
        },

        renderer : "sap.ui.commons.SliderRenderer"

    });

})();