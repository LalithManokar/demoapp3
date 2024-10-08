// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * @name Page renderer.
     * @static
     * @private
     */
    var PageRenderer = {
        apiVersion: 2,

        /**
         * Renders the HTML for the given control, using the provided
         * {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} rm
         *            The RenderManager that can be used for writing to the render
         *            output buffer
         * @param {sap.ushell.ui.launchpad.Page} page
         *            Page control that should be rendered
         */
        render: function (rm, page) {
            var aGroups = page.getGroups(),
                iNrOfGroups = aGroups.length,
                oGroup,
                index;

            rm.openStart("div", page);
            rm.class("sapUshellPage");
            rm.openEnd(); // div - tag

            if (page.getEdit() && !iNrOfGroups) {
                rm.renderControl(page.getAggregation("_addGroupButtons")[0]);
            }

            // render "NoGroupsText" when there are no groups
            if (!iNrOfGroups && page.getShowNoGroupsText()) {
                rm.renderControl(page.getAggregation("_noGroupText"));
            }

            for (index = 0; index < iNrOfGroups; index++) {
                oGroup = aGroups[index];

                if (page.getEdit()) {
                    rm.openStart("div");
                    rm.class("sapUshellPageGroup");
                    rm.attr("tabindex", "0");
                    rm.openEnd(); // div - tag
                    rm.renderControl(oGroup);
                    rm.close("div");
                    rm.renderControl(page.getAggregation("_addGroupButtons")[index + 1]);
                } else {
                    rm.renderControl(oGroup);
                }
            }

            rm.close("div");
        }
    };

    return PageRenderer;
});
