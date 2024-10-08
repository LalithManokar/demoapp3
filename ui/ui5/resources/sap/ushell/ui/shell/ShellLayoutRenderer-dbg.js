/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
// Provides default renderer for control sap.ushell.ui.shell.ShellLayout
sap.ui.define([],
    function () {
        "use strict";

        /**
         * Shell Layout renderer.
         * @namespace
         */
        var ShellLayoutRenderer = {};

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
         * @param {sap.ui.core.Control} oShell an object representation of the control that should be rendered
         */
        ShellLayoutRenderer.render = function (rm, oShell) {
            var id = oShell.getId(),
                sClassName,
                canvasWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width,
                canvasHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

            rm.write("<div");
            rm.writeControlData(oShell);
            rm.addClass("sapUshellShell");
            if (!oShell.getHeaderVisible()) {
                rm.addClass("sapUshellShellNoHead");
            }
            rm.addClass("sapUshellShellHead" + (oShell._showHeader ? "Visible" : "Hidden"));

            rm.writeClasses();
            rm.write(">");

            // Background
            rm.write("<div style='z-index:-2' class='sapUiShellBackgroundImage sapUiGlobalBackgroundImageForce sapUshellShellBG sapContrastPlus'></div>");
            if (oShell.getEnableCanvasShapes()) {
                rm.write("<canvas id=" + id + "-shapes height=" + canvasHeight + " width=" + canvasWidth + " aria-hidden=true style=position:absolute;z-index:-1 >");
                rm.write("</canvas>");
            }

            if (oShell.getToolArea()) {
                rm.write("<aside>");
                rm.renderControl(oShell.getToolArea());
                rm.write("</aside>");
            }

            if (oShell.getRightFloatingContainer()) {
                rm.write("<aside>");
                rm.renderControl(oShell.getRightFloatingContainer());
                rm.write("</aside>");
            }

            sClassName = "sapUshellShellCntnt sapUshellShellCanvas";
            rm.write("<div id='", id, "-cntnt' class='" + sClassName + "'>");

            rm.renderControl(oShell.getCanvasSplitContainer());

            rm.write("</div>");

            rm.write("<span id='", id, "-main-focusDummyOut' tabindex='-1'></span>");

            rm.renderControl(oShell.getFloatingActionsContainer());

            // Render the footer container
            var oFooter = oShell.getFooter();
            rm.openStart("footer", id + "-footer");
            rm.class("sapMPageFooter");
            if (!oFooter) {
                rm.class("sapUiHidden");
            }
            rm.openEnd(); // footer - tag


            if (oFooter) {
                if (oFooter._applyContextClassFor) {
                    oFooter._applyContextClassFor("footer");
                }
                rm.renderControl(oFooter);
            }

            rm.close("footer");

            rm.write("</div>");
        };

        return ShellLayoutRenderer;

    }, /* bExport= */ true);
