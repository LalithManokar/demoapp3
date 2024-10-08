// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.Page.
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/Control",
    "sap/ui/core/dnd/DragDropInfo",
    "sap/ui/core/library",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/PageRenderer"
], function (
    Button,
    mLibrary,
    Text,
    Control,
    DragDropInfo,
    coreLibrary,
    resources
    // PageRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mLibrary.ButtonType;

    // shortcut for sap.ui.core.TextAlign
    var TextAlign = coreLibrary.TextAlign;

    /**
     * Constructor for a new Page.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The Page represents a collection of groups.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.71.58
     *
     * @private
     * @alias sap.ushell.ui.launchpad.Page
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var Page = Control.extend("sap.ushell.ui.launchpad.Page", /** @lends sap.ushell.ui.launchpad.Page.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies whether the addGroup button is visible.
                 */
                edit: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies whether group reordering is enabled. Relevant only for desktop devices.
                 */
                enableGroupReordering: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * This text is displayed when the control contains no groups.
                 */
                noGroupsText: { type: "string", group: "Misc", defaultValue: "" },

                /**
                 * Defines whether or not the text specified in the <code>noGroupsText</code> property is displayed.
                 */
                showNoGroupsText: { type: "boolean", group: "Misc", defaultValue: true }
            },
            defaultAggregation: "groups",
            aggregations: {

                /**
                 * The groups displayed in the Page.
                 */
                "groups": { type: "sap.ushell.ui.launchpad.Section", multiple: true, singularName: "group", dnd: true },

                /**
                 * Internal aggregation to show the addGroup buttons if the edit property is enabled.
                 */
                "_addGroupButtons": { type: "sap.m.Button", multiple: true, visibility: "hidden" },

                /**
                 * Internal aggregation to show the noGroupText.
                 */
                "_noGroupText": { type: "sap.m.Text", multiple: false, visibility: "hidden" }
            },
            events: {

                /**
                 * Fires when the addGroup Button is pressed.
                 */
                addGroupButtonPressed: {
                    parameters: {

                        /**
                         * The index the new group should be added.
                         */
                        index: { type: "int" }
                    }
                },

                /**
                 *  Fires when the groups are dropped on the page.
                 */
                groupDrop: {
                    parameters: {

                        /**
                         * The group that was dragged.
                         */
                        draggedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * The group where the dragged group was dropped.
                         */
                        droppedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * A string defining from what direction the dragging happend.
                         */
                        dropPosition: { type: "string" }
                    }
                }
            }
        }
    });

    Page.prototype.init = function () {
        this.setAggregation("_noGroupText", new Text({
            text: resources.i18n.getText("Page.NoGroupText"),
            width: "100%",
            textAlign: TextAlign.Center
        }));

        this._oDragDropInfo = new DragDropInfo({
            sourceAggregation: "groups",
            targetAggregation: "groups",
            dropPosition: "Between",
            drop: function (oInfo) {
                this.fireGroupDrop(oInfo.getParameters());
            }.bind(this)
        });
    };

    Page.prototype.exit = function () {
        this._oDragDropInfo.destroy();
    };

    Page.prototype.onBeforeRendering = function () {
        var iNrOfGroups = this.getGroups().length,
            aAddGroupButtons = this.getAggregation("_addGroupButtons") || [],
            oAddGroupButton,
            i;

        for (i = aAddGroupButtons.length - 1; i < iNrOfGroups; i++) {
            oAddGroupButton = new Button({
                type: ButtonType.Transparent,
                icon: "sap-icon://add",
                text: resources.i18n.getText("add_group_at"),
                press: this.fireAddGroupButtonPressed.bind(this, { index: aAddGroupButtons.length })
            });
            oAddGroupButton.addStyleClass("sapUshellPageAddGroupButton");
            oAddGroupButton.addStyleClass("sapContrastPlus");
            this.addAggregation("_addGroupButtons", oAddGroupButton);
        }
    };

    Page.prototype.setEnableGroupReordering = function (value) {
        this.setProperty("enableGroupReordering", !!value);

        if (value) {
            this.addDragDropConfig(this._oDragDropInfo);
        } else {
            this.removeDragDropConfig(this._oDragDropInfo);
        }

        return this;
    };

    Page.prototype.setNoGroupsText = function (text) {
        this.setProperty("noGroupsText", text);

        var oNoGroupText = this.getAggregation("_noGroupText");
        oNoGroupText.setText(text || resources.i18n.getText("Page.NoGroupText"));

        return this;
    };

    return Page;
});
