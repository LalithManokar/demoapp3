// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.Section.
sap.ui.define([
    "sap/f/GridContainerItemLayoutData",
    "sap/m/library",
    "sap/ui/core/XMLComposite",
    "sap/ushell/resources",
    "sap/ushell/utils"
], function (
    GridContainerItemLayoutData,
    library,
    XMLComposite,
    resources,
    utils
) {
    "use strict";

    var TileSizeBehavior = library.TileSizeBehavior;

    /**
     * Constructor for a new Section.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The Section represents a structured collection of widgets.
     * @extends sap.ui.core.XMLComposite
     *
     * @author SAP SE
     * @version 1.71.58
     *
     * @private
     * @alias sap.ushell.ui.launchpad.Section
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var Section = XMLComposite.extend("sap.ushell.ui.launchpad.Section", /** @lends sap.ushell.ui.launchpad.Section.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies if the section should display in the edit mode.
                 */
                editable: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies if the 'Add Widget' button should be shown during editing of the section. (See editable property)
                 * The 'Add Widget' button triggers the addWigetButtonPressed event when it is pressed.
                 */
                enableAddButton: { type: "boolean", group: "Behavior", defaultValue: true },

                /**
                 * Specifies if the 'Delete Group' button should be shown during editing of the section. (See editable property)
                 * The 'Delete Group' button triggers the deleteButtonPressed event when it is pressed.
                 */
                enableDeleteButton: { type: "boolean", group: "Behavior", defaultValue: true },

                /**
                 * Specifies if the grid breakpoints are used.
                 * This is to limit the reordering during resizing, it might break certain layouts.
                 */
                enableGridBreakpoints: { type: "boolean", grop: "Appearance", defaultValue: false },

                /**
                 * Specifies if the 'Reset Group' button should be shown during editing of the section. (See editable property)
                 * The 'Reset Group' button triggers the resetButtonPressed event when it is pressed.
                 */
                enableResetButton: { type: "boolean", group: "Behavior", defaultValue: true },

                /**
                 * Specifies if the 'Show / Hide Group' button should be shown during editing of the section. (See editable property)
                 */
                enableShowHideButton: { type: "boolean", group: "Behavior", defaultValue: true },

                /**
                 * Specifies whether widget reordering is enabled. Relevant only for desktop devices.
                 */
                enableWidgetReordering: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * This text is displayed when the control contains no widgets.
                 */
                noWidgetsText: { type: "string", group: "Appearance", defaultValue: resources.i18n.getText("Section.NoWidgetsText") },

                /**
                 * Specifies the title of the section.
                 */
                title: { type: "string", group: "Appearance", defaultValue: resources.i18n.getText("Section.DefaultTitle") },

                /**
                 * Defines whether or not the text specified in the <code>noWidgetsText</code> property is displayed.
                 */
                showNoWidgetsText: { type: "boolean", group: "Behavior", defaultValue: false },

                /**
                 * Specifies if the section should be visible during non editing of the section. (See editable property)
                 */
                showSection: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Specifies the sizeBehavior of the grid.
                 */
                sizeBehavior: { type: "sap.m.TileSizeBehavior", group: "Misc", defaultValue: TileSizeBehavior.Responsive }
            },
            defaultAggregation: "widgets",
            aggregations: {

                /**
                 * Defines the wigets contained within this section.
                 */
                widgets: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    forwarding: {
                        idSuffix: "--innerGrid",
                        aggregation: "items"
                    },
                    dnd: true
                }
            },
            events: {

                /**
                 * Fires when the add widget button is pressed.
                 */
                "add": {},

                /**
                 * Fires when the delete button is pressed
                 */
                "delete": {},

                /**
                 * Fires when the reset button is pressed.
                 */
                "reset": {},

                /**
                 * Fires when the title is changed.
                 */
                "titleChange": {},

                /**
                 * Fires when a control is dropped on the grid.
                 */
                "widgetDrop": {
                    parameters: {

                        /**
                         * The control that was dragged.
                         */
                        draggedControl: { type: "sap.ui.core.Control" },

                        /**
                         * The control where the dragged control was dropped.
                         */
                        droppedControl: { type: "sap.ui.core.Control" },

                        /**
                         * A string defining from what direction the dragging happend.
                         */
                        dropPosition: { type: "string" }
                    }
                }
            }
        },
        resourceModel: resources.i18nModel
    });

    Section.prototype.init = function () {
        this.oVBox = this.byId("content");

        this.byId("innerGrid").addEventDelegate({
            onAfterRendering: function () {
                this.oVBox.toggleStyleClass("sapUshellSectionNoWidgets", !this.getWidgets().length);
            }.bind(this)
        });
    };

    Section.prototype.setEditable = function (value) {
        this.setProperty("editable", !!value);
        this.oVBox.toggleStyleClass("sapUshellSectionEdit", !!value);
    };

    Section.prototype.setShowSection = function (value) {
        this.setProperty("showSection", !!value);
        this.oVBox.toggleStyleClass("sapUshellSectionHidden", !value);
    };

    /**
     * Delegates event to reorder widgets
     *
     * @param {object} oInfo Drag and drop event data
     * @private
     */
    Section.prototype._reorderWidgets = function (oInfo) {
        this.fireWidgetDrop(oInfo.getParameters());
    };

    /**
     * @param {sap.ui.core.Control} oWidget The widget that defines the size of the indicator
     * @returns {object} The correct indicator size for the given widget
     * @private
     */
    Section.prototype._getDropIndicatorSize = function (oWidget) {
        return this._getWidgetLayoutData(oWidget);
    };

    Section.prototype.addAggregation = function (sAggregationName, oObject) {
        XMLComposite.prototype.addAggregation.apply(this, arguments);

        if (sAggregationName === "widgets") {
            this._addWidgetLayoutData(oObject);
        }

        return this;
    };

    Section.prototype.insertAggregation = function (sAggregationName, oObject, iIndex) {
        XMLComposite.prototype.insertAggregation.apply(this, arguments);

        if (sAggregationName === "widgets") {
            this._addWidgetLayoutData(oObject);
        }

        return this;
    };

     /**
     * Returns the LayoutData for the given item.
     *
     * @param {sap.ui.core.Control} oWidget The widget to retrieve the LayoutData from.
     * @returns {sap.ui.core.LayoutData} The LayoutData object.
     * @private
     */
    Section.prototype._getWidgetLayoutData = function (oWidget) {
        // standard dimensions
        var oLayoutData = {
            rows: 2,
            columns: 2
        };

        if (oWidget.isA("sap.ui.integration.widgets.Card")) {
            var oCardManifest = oWidget.getManifest(),
                sCardRow = utils.getMember(oCardManifest, "sap|flp.rows") || 3,
                sCardColumn = utils.getMember(oCardManifest, "sap|flp.columns") || 3;

            oLayoutData = {
                rows: parseInt(sCardRow, 10),
                columns: parseInt(sCardColumn, 10)
            };
        } else if (oWidget.isA("sap.f.Card")) {
            oLayoutData = {
                columns: 4
            };
        }

        return oLayoutData;
    };

    /**
     * Adds GridContainerItemLayoutData to a widget
     *
     * @param {sap.ui.core.Control} oWidget A widget which gets a layout
     * @private
     */
    Section.prototype._addWidgetLayoutData = function (oWidget) {
        if (!oWidget.getLayoutData()) {
            var oLayoutData = this._getWidgetLayoutData(oWidget);

            oWidget.setLayoutData(new GridContainerItemLayoutData(oLayoutData));
        }
    };

    return Section;
});
