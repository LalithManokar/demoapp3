/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.TileContainer");
jQuery.sap.require("sap.ui.ino.views.extensibility.StableIdentifier");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");

var StableIdentifier = sap.ui.ino.views.extensibility.StableIdentifier;

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignTilesContainer", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignTilesContainer";
    },

    setHistoryState : function(oHistoryState) {
        if(oHistoryState && oHistoryState.searchTerm) {
            this.oSearchField.setValue(oHistoryState.searchTerm);
        }
        this.getController().setHistoryState(oHistoryState);
    },

    createContent : function(oController) {

        this.setHeight("100%");

        var oVLayout = new sap.ui.commons.layout.MatrixLayout({
            height : "100%"
        });
        
        var oTilesButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_CAMPAIGN_TILE_CAMPAIGN_BUT_SHOW_TILES}",
            icon : sap.ui.ino.controls.ThemeFactory.getImage("tile_view.png"),
            iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("tile_view_hover.png"),
            iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("tile_view_active.png")
        });
        
        var oPreviewButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>GENERAL_MASTER_DETAIL_BUT_SHOW_TABLE_PREVIEW}",
            icon : sap.ui.ino.controls.ThemeFactory.getImage("list_preview.png"),
            iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("list_preview_hover.png"),
            iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("list_preview_active.png"),
            press : [{preview: true}, oController.onShowTableView, oController]
        });

        var oRowOnlyButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>GENERAL_MASTER_DETAIL_BUT_SHOW_TABLE_ALL_ROWS}",
            icon : sap.ui.ino.controls.ThemeFactory.getImage("list.png"),
            iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("list_hover.png"),
            iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("list_active.png"),
            press : [{preview: false}, oController.onShowTableView, oController]
        });

        var aButtons = [oTilesButton, oPreviewButton, oRowOnlyButton];

        var oSegmentedButton = new sap.ui.commons.SegmentedButton({
            buttons : aButtons,
            selectedButton : oTilesButton
        }).addStyleClass("sapUiInoSegmentedButtonStyle");
        
        this.oSearchField = new sap.ui.commons.SearchField({
            enableListSuggest : false,
            enableFilterMode : true,
            enableClear : true,
            search : [oController.onSearch, oController]
        });
        
        var oRightUiItems = new sap.ui.commons.layout.HorizontalLayout({content: [this.oSearchField, oSegmentedButton]}).addStyleClass("sapUiInoCampaignTilesRightUiItems");

        var oCreateBtn = this.createButton(this.getController());

        var oToolbarRow = new sap.ui.commons.layout.MatrixLayoutRow({
            height : "30px",
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : [oCreateBtn, oRightUiItems]
            }).addStyleClass("sapUiInoTileContainerCell")]
        }).addStyleClass('sapInoCampaignToolbar');

        this._loadingTextView = new sap.ui.commons.TextView({
            text : "{i18n>BO_CAMPAIGN_TILE_LOADING}"
        });

        this._noDataTextView = new sap.ui.commons.TextView({
            text : "{i18n>BO_CAMPAIGN_TILE_NO_DATA}",
            visible : false
        });

        this._tiles = new sap.ui.ino.controls.TileContainer({
            height : "100%",
            visible : false
        }).addStyleClass("sapUiInoCampaignTileContainer");

        var _oContainerRow = new sap.ui.commons.layout.MatrixLayoutRow({
            height : "100%",
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : [this._loadingTextView, this._noDataTextView, this._tiles]
            }).addStyleClass("sapUiInoTileContainerCell")]
        });

        oVLayout.addRow(oToolbarRow);
        oVLayout.addRow(_oContainerRow);

        return oVLayout;
    },

    getTilesContainer : function() {
        return this._tiles;
    },

    getLoadingTextView : function() {
        return this._loadingTextView;
    },

    getNoDataTextView : function() {
        return this._noDataTextView;
    },

    createButton : function(oController) {
        this._oCreateButton = new sap.ui.commons.Button({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Action.Create),
            text : "{i18n>BO_CAMPAIGN_BUT_NEW_CAMPAIGN}",
            press : [oController.onCreatePressed, oController],
            lite : false,
            enabled : oController.isContentCreationEnabled()
        });

        return this._oCreateButton;
    }
});