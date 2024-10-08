/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.views.extensibility.StableIdentifier");
var StableIdentifier = sap.ui.ino.views.extensibility.StableIdentifier;

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
    
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignList";
    },

    setHistoryState : function(oHistoryState) {
        sap.ui.ino.views.common.MasterDetailView.setHistoryState.call(this, oHistoryState);
        if (oHistoryState && oHistoryState.searchTerm) {
            this.oSearchField.setValue(oHistoryState.searchTerm);
        }
    },

    getAdditionalViewButton : function(oController) {
        return new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_CAMPAIGN_TILE_CAMPAIGN_BUT_SHOW_TILES}",
            icon : sap.ui.ino.controls.ThemeFactory.getImage("tile_view.png"),
            iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("tile_view_hover.png"),
            iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("tile_view_active.png"),
            press : [oController.onShowTiles, oController]
        });
    },

    createColumns : function() {
        var that = this;

        var oClipboardColumn = sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(this.createId("CLIPBOARD"), sap.ui.ino.models.object.Campaign);

        var oStatusColumn = new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.Status),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_STATUS}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "STATUS_CODE",
                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root")
                }
            }),
            sortProperty : "STATUS_CODE",
            filterProperty : "STATUS_CODE"
        });

        var oStatusMenu = new sap.ui.commons.Menu({
            items : [sap.ui.ino.application.backoffice.ControlFactory.createTableColumnCodeFilterMenu(this._oTable, oStatusColumn, "sap.ino.xs.object.campaign.Status.Root")]
        });
        oStatusColumn.setMenu(oStatusMenu);

        var oBlackBoxColumn = new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.Blackbox),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_IS_BLACKBOX}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "IS_BLACK_BOX",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            }),
            sortProperty : "IS_BLACK_BOX",
            filterProperty : "IS_BLACK_BOX"
        });

        var oBlackBoxFilterMenu = new sap.ui.commons.Menu({
            items : [sap.ui.ino.application.backoffice.ControlFactory.createTableColumnBoolFilterMenu(this._oTable, oBlackBoxColumn)]
        });

        oBlackBoxColumn.setMenu(oBlackBoxFilterMenu);

        var oOpenSubmitColumn = new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.OpenForSubmission),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_IS_OPEN_FOR_SUBMISSION}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "IS_OPEN_FOR_SUBMISSION",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            }),
            sortProperty : "IS_OPEN_FOR_SUBMISSION",
            filterProperty : "IS_OPEN_FOR_SUBMISSION"
        });

        var oOpenSubmitFilterMenu = new sap.ui.commons.Menu({
            items : [sap.ui.ino.application.backoffice.ControlFactory.createTableColumnBoolFilterMenu(this._oTable, oOpenSubmitColumn)]
        });

        oOpenSubmitColumn.setMenu(oOpenSubmitFilterMenu);

        return [oClipboardColumn, sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.NAME),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_CAMPAIGN}"
            }),
            template : new sap.ui.commons.Link({
                editable : false,
                text : {
                    path : "NAME"
                },
                press : function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var iID = oRowBindingContext.getProperty("ID");
                    var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
                    oInstanceView.show(iID, "display", function() {
                    });
                }
            }),
            sortProperty : "NAME",
            filterProperty : "NAME"
        })), new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.ValidFrom),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_VALID_FROM}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "VALID_FROM",
                    type : new sap.ui.model.type.Date()
                }
            }),
            sortProperty : "VALID_FROM"
        }), new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.SubmitFrom),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_SUBMIT_FROM}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "SUBMIT_FROM",
                    type : new sap.ui.model.type.Date()
                }
            }),
            sortProperty : "SUBMIT_FROM"
        }), new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.SubmitTo),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_SUBMIT_TO}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "SUBMIT_TO",
                    formatter : sap.ui.ino.models.formatter.DateFormatter.formatInfinity
                }
            }),
            sortProperty : "SUBMIT_TO"
        }), new sap.ui.table.Column({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Column.ValidTo),
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_ROW_VALID_TO}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "VALID_TO",
                    formatter : sap.ui.ino.models.formatter.DateFormatter.formatInfinity
                }
            }),
            sortProperty : "VALID_TO"
        }), oStatusColumn, oOpenSubmitColumn, oBlackBoxColumn];
    },

    createActionButtons : function(oController) {
        var oStaticPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.campaign.Campaign", 0, {
            staticActions : [{
                create : {}
            }]
        }, true);

        this._oCreateButton = new sap.ui.commons.Button({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Action.Create),
            text : "{i18n>BO_CAMPAIGN_BUT_NEW_CAMPAIGN}",
            press : [oController.onCreatePressed, oController],
            lite : false,
            enabled : oStaticPropertyModel.getProperty("/actions/create/enabled")
        });

        this._oDisplayButton = new sap.ui.commons.Button({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Action.Display),
            text : "{i18n>BO_CAMPAIGN_BUT_DISPLAY}",
            press : [oController.onDisplayPressed, oController],
            lite : false,
            enabled : false
        });

        this._oCopyButton = new sap.ui.commons.Button({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Action.Copy),
            text : "{i18n>BO_CAMPAIGN_BUT_COPY}",
            press : [oController.onCopyPressed, oController],
            lite : false,
            enabled : false
        });

        this._oDeleteButton = new sap.ui.commons.Button({
            id : this.createId(StableIdentifier.BackOffice.List.Campaign.Action.Delete),
            text : "{i18n>BO_CAMPAIGN_BUT_DELETE}",
            press : [oController.onDeletePressed, oController],
            lite : false,
            enabled : false
        });

        return [this._oCreateButton, this._oDisplayButton, this._oCopyButton, this._oDeleteButton];
    },

    createDetailsView : function() {
        return sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignListDetails");
    },

    createExtensionColumnFragment : function() {
        return sap.ui.xmlfragment("sap.ui.ino.views.backoffice.extension.CampaignListExtension", this.getController());
    },

    createTableExtensionArea : function() {
        var oController = this.getController();
        var oExtension = new sap.ui.view({
            viewName : "sap.ui.ino.views.common.TagFilter",
            type : sap.ui.core.mvc.ViewType.JS,
            viewData : {
                objectInstance : "sap.ino.xs.object.tag.Tag"
            }
        });
        oExtension.attachChange(function() {
            var sSelectedTags = this.getController().getSelectedTagIds();
            oController.setDynamicBindingPathParameter("tagsToken", sSelectedTags);
        });
        return oExtension;
    }
}));