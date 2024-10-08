/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ScrollableToolbarRenderer");

(function() {
    "use strict";

    /**
     * @class ScrollableToolbar renderer. 
     * @static
     */
    sap.ino.wall.ScrollableToolbarRenderer = {
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    sap.ino.wall.ScrollableToolbarRenderer.render = function (oRM, oControl) { 
        var aItems = oControl.getContent();

        // return immediately if control is not visible
        if (!oControl.getVisible()) {
            return;
        }

        // render wrapper div
        oRM.write("<div ");
        oRM.addClass("sapInoWallScrollableToolbar");
        oRM.addClass("sapInoWallScrollableToolbar" + oControl.getOrientation());
        if (oControl._scrollable) {
            oRM.addClass("sapInoWallScrollableToolbarScrollable");
            if (!oControl._bPreviousScrollForward) {
                oRM.addClass("sapInoWallScrollableToolbarNoScrollForward");
            }
            if (!oControl._bPreviousScrollBack) {
                oRM.addClass("sapInoWallScrollableToolbarNoScrollBack");
            }
        } else {
            oRM.addClass("sapInoWallScrollableToolbarNotScrollable");
        }

        oRM.writeControlData(oControl);
        oRM.writeClasses();
        oRM.write(">");

        // render left scroll arrow
        oRM.renderControl(oControl._getScrollingArrow(oControl.getOrientation() === "Horizontal" ? "left" : "up"));

        // render scroll container on touch devices
        if (oControl._bDoScroll) {
            oRM.write("<div id='" + oControl.getId() + "-scrollContainer' class='sapInoWallScrollableToolbarScrollContainer'>");
        }

        oRM.write("<div id='" + oControl.getId() + "-head'");
        oRM.addClass("sapInoWallScrollableToolbarInner");

        oRM.writeClasses();
        oRM.write(">");

        jQuery.each(aItems, function (iIndex, oItem) {
            if (!oItem.getVisible()) {
                return; // only render visible items
            }
            oRM.renderControl(oItem);
        });

        oRM.write("</div>");

        if (oControl._bDoScroll) {
            oRM.write("</div>"); //scrollContainer
        }

        // render right scroll arrow
        oRM.renderControl(oControl._getScrollingArrow(oControl.getOrientation() === "Horizontal" ? "right" : "down"));

        // end wrapper div
        oRM.write("</div>");
    };

})();