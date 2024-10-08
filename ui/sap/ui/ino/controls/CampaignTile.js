/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.CampaignTile");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.TileRenderer");
    jQuery.sap.require("sap.ui.ino.controls.Tile");

    /**
     * A tile for a campaign is a component that has a header that contains a title and a content and a footer. The tile
     * has a default size of 318px * 126px and needs to be included in a TileBrowser control. CampaignTile inherits from
     * sap.ui.ino.controls.Tile.
     * 
     * <ul>
     * <li>Additional Aggregations
     * <ul>
     * <li>clipboardBtn: a clipboard button</li>
     * </ul>
     * <li>Additional Events
     * <ul>
     * <li>campaignSettingsPressed: To get notified, whenever the settings button of the tile is Pressed.</li>
     * </ul>
     * </li>
     * </ul>
     */

    sap.ui.ino.controls.Tile.extend("sap.ui.ino.controls.CampaignTile", {
        metadata : {
            properties : {
                status : "string",
                draftText : "string",
                unassignedIdeasCount : {
                    type : "string",
                    defaultValue : "0"
                },
                unassignedIdeasText : "string",
                completedIdeasCount : "string",
                completedIdeasText : "string",
                discontinuedIdeasCount : "string",
                discontinuedIdeasText : "string",
                allIdeasCount : "string",
                allIdeasText : "string",
                participantsCount : "string",
                participantsText : "string",
                dateStatusText : "string",
                duplicateEnabled : "boolean",
                settingsBtnTooltipText : "string",
                duplicateBtnTooltipText : "string"
            },
            aggregations : {
                _settingsBtn : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                _duplicateBtn : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                clipboardBtn : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                }
            },
            events : {
                campaignSettingsPressed : {},
                campaignDuplicatePressed : {},
            }
        },

        get_footerBtns : function() {
            var oSettingsBtn = this.getAggregation("_settingsBtn");
            var oDuplicateBtn = this.getAggregation("_duplicateBtn");
            if (!oSettingsBtn) {
                oSettingsBtn = new sap.ui.commons.Button({
                    icon : "sap-icon://action-settings",
                    press : [this.getObjectId(), this.campaignSettingsPressed, this],
                    tooltip : this.getSettingsBtnTooltipText()
                }).addStyleClass("sapUiInoCampaignTileBtns");
                this.setAggregation("_settingsBtn", oSettingsBtn, true);
            }
            if (!oDuplicateBtn) {
                oDuplicateBtn = new sap.ui.commons.Button({
                    icon : "sap-icon://duplicate",
                    enabled : this.getDuplicateEnabled(),
                    press : [this.getObjectId(), this.campaignDuplicatePressed, this],
                    tooltip : this.getDuplicateBtnTooltipText()
                }).addStyleClass("sapUiInoCampaignTileBtns");
                this.setAggregation("_duplicateBtn", oDuplicateBtn, true);
            }
        },

        constructor : function() {
            sap.ui.ino.controls.Tile.apply(this, arguments);
            this.get_footerBtns();
        },

        renderer : "sap.ui.ino.controls.TileRenderer",

        renderContent : function(oRm, oControl) {
            sap.ui.ino.controls.Tile.prototype.renderContent(oRm, oControl);
            this._renderDateHeader(oRm, oControl);
            this._renderCounts(oRm, oControl);
            this._renderFooter(oRm, oControl);
        },

        _renderDateHeader : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("sapUiInoCampaignTileDateHeader");
            oRm.writeClasses();
            oRm.write(">");
            oRm.writeEscaped(this.getDateStatusText());
            oRm.write("</div>");
        },

        _renderCounts : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("sapUiInoCampaignTileIdeas");
            if (this.getStatus() === "draft") {
                oRm.addClass("sapUiInoCampaignTileDraftIdeas");
            } else if (this.getStatus() === "completed") {
                oRm.addClass("sapUiInoCampaignTileCompletedIdeas");
            } else if (this.getStatus() === "future") {
                oRm.addClass("sapUiInoCampaignTileFutureIdeas");
            }
            oRm.writeClasses();
            oRm.write(">");
            var aNamesActive = ["UnassignedIdeas", "AllIdeas", "Participants"];
            var aNamesCompleted = ["DiscontinuedIdeas", "CompletedIdeas", "AllIdeas", "Participants"];
            var aNamesDraft = ["Participants"];
            var aNamesFuture = ["Participants"];
            var iParticipantsCount = this.getParticipantsCount() == "" ? "0" : this.getParticipantsCount();
            var iUnassignedIdeasCount = this.getUnassignedIdeasCount() == "" ? "0" : this.getUnassignedIdeasCount();
            var iAllIdeasCount = this.getAllIdeasCount() == "" ? "0" : this.getAllIdeasCount();
            var iCompletedIdeasCount = this.getCompletedIdeasCount() == "" ? "0" : this.getCompletedIdeasCount();
            var iDiscontinuedIdeasCount = this.getDiscontinuedIdeasCount() == "" ? "0" : this.getDiscontinuedIdeasCount();
            if (this.getStatus() === "draft") {
                oRm.write("<div");
                oRm.addClass("sapUiInoCampaignTileDraftLabel");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(this.getDraftText());
                oRm.write("</div>");
                var aValueItems = [this.getParticipantsText()];
                var aValueCounts = [iParticipantsCount];
                this._renderColumn(aNamesDraft, aValueItems, "ItemValue", oRm);
                this._renderColumn(aNamesDraft, aValueCounts, "ItemCount", oRm);
            } else if (this.getStatus() === "active") {
                var aValueItems = [this.getUnassignedIdeasText(), this.getAllIdeasText(), this.getParticipantsText()];
                var aValueCounts = [iUnassignedIdeasCount, iAllIdeasCount, iParticipantsCount];
                this._renderColumn(aNamesActive, aValueItems, "ItemValue", oRm);
                this._renderColumn(aNamesActive, aValueCounts, "ItemCount", oRm);
            } else if (this.getStatus() === "completed") {
                var aValueItems = [this.getDiscontinuedIdeasText(), this.getCompletedIdeasText(), this.getAllIdeasText(), this.getParticipantsText()];
                var aValueCounts = [iDiscontinuedIdeasCount, iCompletedIdeasCount, iAllIdeasCount, iParticipantsCount];
                this._renderColumn(aNamesCompleted, aValueItems, "ItemValue", oRm);
                this._renderColumn(aNamesCompleted, aValueCounts, "ItemCount", oRm);
            } else if (this.getStatus() === "future") {
                var aValueItems = [this.getParticipantsText()];
                var aValueCounts = [iParticipantsCount];
                this._renderColumn(aNamesFuture, aValueItems, "ItemValue", oRm);
                this._renderColumn(aNamesFuture, aValueCounts, "ItemCount", oRm);
            }
            oRm.write("</div>");
        },

        _renderColumn : function(aNames, aValues, sType, oRm) {
            oRm.write("<div");
            oRm.addClass("sapUiInoCampaignTile" + sType + "Column");
            oRm.writeClasses();
            oRm.write(">");
            for (var i = 0; i < aNames.length; i++) {
                oRm.write("<div");
                oRm.addClass("sapUiInoCampaignTileValueItem");
                oRm.addClass("sapUiInoCampaignTile" + aNames[i] + sType);
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(aValues[i]);
                oRm.write("</div>");
            }
            oRm.write("</div>");
        },

        _renderFooter : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("sapUiInoCampaignTileFooter");
            oRm.writeClasses();
            oRm.write(">");

            var oDuplicateBtn = oControl.getAggregation("_duplicateBtn");
            oDuplicateBtn.setTooltip(this.getDuplicateBtnTooltipText())
            oRm.renderControl(oDuplicateBtn);

            var oSettingsBtn = oControl.getAggregation("_settingsBtn");
            oSettingsBtn.setTooltip(this.getSettingsBtnTooltipText())
            oRm.renderControl(oSettingsBtn);

            var oClipboardBtn = oControl.getAggregation("clipboardBtn").addStyleClass("sapUiInoCampaignTileBtns");
            oClipboardBtn.addStyleClass("sapUiInoCampaignTileClipboardBtn");
            oClipboardBtn.setLite(false);
            oRm.renderControl(oClipboardBtn);

            oRm.write("</div>");
        },

        campaignSettingsPressed : function(oEvent) {
            var oControl = this;
            this.fireCampaignSettingsPressed({
                campaignId : oControl.getObjectId()
            });
        },

        campaignDuplicatePressed : function(oEvent) {
            var oControl = this;
            this.fireCampaignDuplicatePressed({
                campaignId : oControl.getObjectId()
            });
        }

    })
})();