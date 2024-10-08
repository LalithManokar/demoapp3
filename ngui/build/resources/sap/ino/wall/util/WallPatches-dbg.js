/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.core.Popup");
jQuery.sap.require("sap.m.Popover");

/**
 * Wall patch for increase z-Index to allow for a custom range between 100-10000
 */
(function() {
    "use strict";

    for (var i = 0; i < 1000; i++) {
        sap.ui.core.Popup.prototype.getNextZIndex();
    }
})();

/**
 * Wall patch for the load module renderer, catch all url loading problems (e.g. user is not logged in anymore)
 */
(function() {
    "use strict";

    var ___jQuerySapRequire = jQuery.sap.require;
    jQuery.sap.require = function() {
        try {
            ___jQuerySapRequire.apply(this, arguments);
        } catch (oError) {
            if (/Unexpected token </.test(oError.message)) {
                // user is not logged in anymore: reload the page
                document.location.reload();
            } else {
                throw (oError);
            }
        }
    };

})();

/**
 * Wall patch for the popup to fix position issues with zoom css property
 */
(function() {
    "use strict";

    var ___sapUiCorePopupApplyPosition = sap.ui.core.Popup.prototype._applyPosition;
    sap.ui.core.Popup.prototype._applyPosition = function(oPosition) {
        ___sapUiCorePopupApplyPosition.apply(this, arguments);
        var $Ref = this._$();
        // mod start
        // wall position of the popups with zoom factor
        var $wall = jQuery(oPosition.of).closest(".sapInoWallWOuter"), oWall, fZoomFactor;
        if ($wall.length > 0) {
            oWall = sap.ui.getCore().byId($wall.attr("id"));
            fZoomFactor = oWall.getZoom() / 100;

            // add zoom/scale factor to popup
            if (sap.ui.Device.browser.internet_explorer) { // scale
                $Ref.css("-ms-transform", "scale(" + fZoomFactor + ")");
            } else if (sap.ui.Device.browser.firefox) { // scale
                $Ref.css("-moz-transform", "scale(" + fZoomFactor + ")");
            } else if (sap.ui.Device.browser.safari) { // scale
                $Ref.css("-webkit-transform", "scale(" + fZoomFactor + ")");
            } else { // zoom
                $Ref.css("zoom", fZoomFactor);
            }

            if (jQuery(this._oPosition.of).control(0) instanceof sap.m.Select) { // zoom
                // adopt select list to select width
                if (!sap.ino.wall.config.Config.getZoomCapable()) {
                    $Ref.css("width", parseInt(this._oLastOfRect.width, 10) / fZoomFactor);
                } else {
                    $Ref.css("width", parseInt(this._oLastOfRect.width, 10));
                }
                $Ref.css("min-width", "inherit");
                $Ref.find(".sapMList").css("width", "100%");
            }
            // Allow also top positioning and centering
            // ff+ie+sf: re-calculate the correct position (scaling the popup will center the dimensions)
            if (!sap.ino.wall.config.Config.getZoomCapable()) {
                var iWidth = parseInt($Ref.css("width"), 10), iHeight = parseInt($Ref.css("height"), 10);

                // we have to deduct the half of the difference to the normal size
                $Ref.css("left", parseInt(this._oLastOfRect.left, 10) + (iWidth * fZoomFactor - iWidth) / 2.0);
                $Ref.css("top", parseInt(this._oLastOfRect.top, 10) + (iHeight * fZoomFactor - iHeight) / 2.0 + parseInt(this._oLastOfRect.height, 10));
                $Ref.css("right", "");
            } else {
                $Ref.css("left", parseInt(this._oLastOfRect.left, 10));
                $Ref.css("top", (parseInt(this._oLastOfRect.top, 10) + this._oLastOfRect.height));
                $Ref.css("right", "");
            }
        }
        // mod end
    };

    
    // Suppress arrow positioning, which also repositions the popover 
    var ___sapMPopoverAdjustPositionAndArrow = sap.m.Popover.prototype._adjustPositionAndArrow;
    sap.m.Popover.prototype._adjustPositionAndArrow = function () {
        // mod start
        var $parent = jQuery(this._getOpenByDomRef());
        var $wall = jQuery($parent).closest(".sapInoWallWOuter"), oWall, fZoomFactor;
        if ($wall.length > 0) {
            this.addStyleClass("sapInoWallZoomableSelectPopup");
            return;
        }
        // mod end
        ___sapMPopoverAdjustPositionAndArrow.apply(this);
    };

})();