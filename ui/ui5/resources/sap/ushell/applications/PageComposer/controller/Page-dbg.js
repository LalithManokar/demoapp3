// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/isEmptyObject",
    "sap/ui/model/json/JSONModel",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/NumericContent",
    "sap/m/TileContent",
    "sap/ushell/Config"
], function (
    isEmptyObject,
    JSONModel,
    GenericTile,
    ImageContent,
    NumericContent,
    TileContent,
    Config
) {
    "use strict";

    /**
     * @typedef {object} GroupError An error that occured in a group
     * @property {string} type The error type
     * @property {string} title The title of the error
     * @property {string} subtitle The subtitle of the error
     * @property {string} description The description of the error
     */

    var oMainController,
        oPage,
        resources = {};

    var oViewSettingsModel = new JSONModel({
        sizeBehavior: Config.last("/core/home/sizeBehavior")
    });

    var _aDoableObject = Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
        oViewSettingsModel.setProperty("/sizeBehavior", sSizeBehavior);
    });

    /**
     * Returns the model relevant indicies from the given widget
     *
     * @param {sap.ui.core.Control} oWidget The widget that is inside of a model.
     * @return {object} The relevant indicies of the model
     * @private
     */
    function _getModelDataFromWidget (oWidget) {
        var aPath = oWidget.getBindingContext().getPath().split("/"),
            iWidgetIndex = aPath.pop();

        aPath.pop();
        return {
            widgetIndex: iWidgetIndex,
            groupIndex: aPath.pop()
        };
    }

    return {
        /**
         * Initializes the Page fragment logic
         *
         * @param {sap.ui.core.mvc.Controller} oController The controller that uses the Page fragment
         *
         * @protected
         */
        init: function (oController) {
            oMainController = oController;

            oPage = oController.getView().byId("page");
            oPage.setModel(oController.getModel());
            oPage.setModel(oViewSettingsModel, "viewSettings");

            resources.i18n = oController.getResourceBundle();

            var bEdit = oController.getModel().getProperty("/edit");
            oPage.toggleStyleClass("sapUshellPageComposing", !!bEdit);
        },

        exit: function () {
            _aDoableObject.off();
        },

        /**
         * Creates the content inside of the GridContainers
         *
         * @param {string} sId The ID of the content
         * @param {sap.ui.model.Context} oContext The data for the specific content
         * @returns {sap.m.GenericTile} A control that is a content of the GridContainer
         *
         * @private
         */
        itemFactory: function (sId, oContext) {
            var oContextData = oContext.getProperty(oContext.sPath),
                oCatalogTile = oMainController.mCatalogTiles[oContextData.vizId],
                oControl;

            if (oCatalogTile) {
                var oLPService = sap.ushell.Container.getService("LaunchPage");
                var sHeader = oLPService.getCatalogTilePreviewTitle(oCatalogTile) || oLPService.getCatalogTileTitle(oCatalogTile);
                var sSubheader = oLPService.getCatalogTilePreviewSubtitle(oCatalogTile);
                var sFooter = oLPService.getCatalogTilePreviewInfo(oCatalogTile);
                var sIcon = oLPService.getCatalogTilePreviewIcon(oCatalogTile);
                var bShowCount;
                var oContentControl;

                // TBD: The following content definition logic is a temporary solution
                // until the corresponding API is provided by the service:
                if (oCatalogTile.getChip) { // ABAP
                    bShowCount = oCatalogTile.getChip().getBaseChipId() === "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER";
                } else if (oCatalogTile.tileResolutionResult) { // CDM
                    bShowCount = !!oCatalogTile.tileResolutionResult.indicatorDataSource;
                } else { // Local
                    bShowCount = oCatalogTile.tileType === "sap.ushell.ui.tile.DynamicTile";
                }

                if (bShowCount) {
                    oContentControl = new NumericContent({ // Dynamic Tile
                        icon: sIcon,
                        value: "0",
                        width: "100%"
                    });
                } else {
                    oContentControl = new ImageContent({ // Static Tile
                        src: sIcon
                    });
                }

                oControl = new GenericTile(sId, {
                    header: sHeader,
                    subheader: sSubheader,
                    tileContent: [new TileContent({
                        footer: sFooter,
                        content: [oContentControl]
                    })]
                });

                if (oContextData.error) {
                    oControl.setState("Failed");
                }
            } else if (!isEmptyObject(oMainController.mCatalogTiles)) {
                oControl = new GenericTile(sId, { state: "Failed" });
            } else {
                oControl = new GenericTile(sId, { state: "Loading" });
            }

            oControl.attachPress(function (oEvent) {
                if (oEvent.getParameter("action") === "Remove") {
                    var oContent = oEvent.getSource(),
                        oWidgetModelData = _getModelDataFromWidget(oContent);

                    oMainController.deleteContentInGroup(oWidgetModelData.widgetIndex, oWidgetModelData.groupIndex);
                }
            });

            // sizeBehavior for tiles: Small/Responsive
            oControl.bindProperty("sizeBehavior", "viewSettings>/sizeBehavior");
            oControl.setScope(oMainController.getModel().getProperty("/edit") ? "Actions" : "Display");

            return oControl;
        },

        /**
         * Collects all errors that occured in the groups.
         *
         * @returns {GroupError[]} A collection of errors that occured in the groups.
         *
         * @protected
         */
        collectErrors: function () {
            var aErrors = [];

            oPage.getGroups().forEach(function (oGroup, iGroupIndex) {

                var oGroupTitle = oGroup.byId("title-edit");
                if (oGroup.getTitle() === "") {
                    oGroupTitle.setValueState("Warning");
                    oGroupTitle.setValueStateText(resources.i18n.getText("Message.InvalidGroupTitle"));
                    aErrors.push({
                        type: "Warning",
                        title: resources.i18n.getText("Title.NoGroupTitle", iGroupIndex + 1),
                        description: resources.i18n.getText("Message.NoGroupTitle", iGroupIndex + 1)
                    });
                } else {
                    oGroupTitle.setValueState("None");
                }

                oGroup.getWidgets().forEach(function (oTile, iTileIndex) {
                    if (oTile.getState() === "Failed") {
                        if (oTile.getHeader() === "" && oTile.getSubheader() === "") {
                            aErrors.push({
                                type: "Error",
                                title: resources.i18n.getText("Title.UnsufficientRoles"),
                                subtitle: resources.i18n.getText("Title.ContentIsNotVisible"),
                                description: resources.i18n.getText("Message.LoadTileError", [(iTileIndex + 1) + ".", oGroup.getTitle()])
                            });
                        } else {
                            aErrors.push({
                                type: "Warning",
                                title: resources.i18n.getText("Message.NavigationTargetError"),
                                subtitle: resources.i18n.getText("Title.ContentNotNavigateable"),
                                description: resources.i18n.getText("Message.NavTargetResolutionError", oTile.getHeader())
                            });
                        }
                    }
                });
            });

            return aErrors;
        },

        /**
         * Adds a new Group to the Page.
         *
         * @param {sap.ui.base.Event} [oEvent] The event data. If not given, group is added at the first position.
         *
         * @protected
         */
        addGroup: function (oEvent) {
            var iGroupIndex = oEvent ? oEvent.getParameter("index") : 0;

            oMainController.addGroupAt(iGroupIndex);
        },

        /**
         * Deletes a Group from the Page
         *
         * @param {sap.ui.base.Event} oEvent contains event data
         *
         * @private
         */
        deleteGroup: function (oEvent) {
            var oGroup = oEvent.getSource();

            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                function deleteGroup (oAction) {
                    if (oAction === MessageBox.Action.DELETE) {
                        oMainController.deleteGroup(oPage.indexOfGroup(oGroup));
                    }
                }

                sap.ushell.Container.getService("Message").confirm(
                    resources.i18n.getText("Message.DeleteGroup", oGroup.getTitle()),
                    deleteGroup,
                    resources.i18n.getText("Button.Delete"),
                    [
                        MessageBox.Action.DELETE,
                        MessageBox.Action.CANCEL
                    ]
                );
            });
        },

        /**
         * Moves a group inside of the Page
         *
         * @param {object} oInfo Drag and drop event data
         * @private
         */
        moveGroup: function (oInfo) {
            var oDragged = oInfo.getParameter("draggedControl"),
                oDropped = oInfo.getParameter("droppedControl"),
                sInsertPosition = oInfo.getParameter("dropPosition"),
                iDragPosition = oPage.indexOfGroup(oDragged),
                iDropPosition = oPage.indexOfGroup(oDropped);

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
            }

            oMainController.moveGroup(iDragPosition, iDropPosition);
        },

        /**
         * Moves a content inside or between different groups.
         *
         * @param {object} oDropInfo Drag and drop event data
         *
         * @private
         */
        moveContent: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                sInsertPosition = oDropInfo.getParameter("dropPosition"),
                oDroppedModelData = _getModelDataFromWidget(oDropped),
                iDropContentPosition = oDroppedModelData.widgetIndex,
                iDropGroupPosition = oDroppedModelData.groupIndex;

            if (oDragged.isA("sap.m.CustomTreeItem")) {
                var fnDragSessionCallback = oDropInfo.getParameter("dragSession").getComplexData("callback");
                if (sInsertPosition === "After") {
                    iDropContentPosition++;
                }
                fnDragSessionCallback(iDropContentPosition, iDropGroupPosition);
                return;
            }
            var oDraggedModelData = _getModelDataFromWidget(oDragged),
                iDragContentPosition = oDraggedModelData.widgetIndex,
                iDragGroupPosition = oDraggedModelData.groupIndex;

            if (iDragGroupPosition === iDropGroupPosition) {
                if (sInsertPosition === "After") {
                    if (iDropContentPosition < iDragContentPosition) {
                        iDropContentPosition++;
                    }
                } else if (iDropContentPosition > iDragContentPosition) {
                    iDropContentPosition--;
                }
            } else if (sInsertPosition === "After") {
                iDropContentPosition++;
            }

            oMainController.moveContentInGroup(iDragContentPosition, iDropContentPosition, iDragGroupPosition, iDropGroupPosition);
        },

        /**
         * Adds content to a group in the Page.
         *
         * @param {object} oDropInfo Drag and drop event data
         *
         * @private
         */
        addContent: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                iDropContentPosition = oDropped.getWidgets().length,
                iDropGroupPosition = oPage.indexOfGroup(oDropped);

            if (oDragged.isA("sap.m.CustomTreeItem")) {
                oDropInfo.getParameter("dragSession").getComplexData("callback")(iDropContentPosition, iDropGroupPosition);
                return;
            }

            var oDraggedModelData = _getModelDataFromWidget(oDragged),
                iDragContentPosition = oDraggedModelData.widgetIndex,
                iDragGroupPosition = oDraggedModelData.groupIndex;

            oMainController.moveContentInGroup(iDragContentPosition, iDropContentPosition, iDragGroupPosition, iDropGroupPosition);
        }
    };
});
