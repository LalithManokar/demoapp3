/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.controls.CampaignTile");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.models.types.RelativeDateType");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.models.types.ShortendNumberType");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignTilesContainer", {

    onInit : function() {
        var that = this;
        this._initApplicationObjectChangeListeners();
        var oContainer = this.getView().getTilesContainer();        
        oContainer.attachTilePress(function(oEvent) {
            var iCampaignId = oEvent.getParameters().getProperty("objectId");
            that.openCampaignInstance(iCampaignId);
        });        
    },

    setHistoryState : function(oHistoryState) {
        if (oHistoryState) {
            this.setFilter(oHistoryState.tableView);
            if (oHistoryState.searchTerm) {
                this.setSearchTerm(oHistoryState.searchTerm);
            }
        }
        this._bindTiles();
    },

    _initApplicationObjectChangeListeners : function() {
        var that = this;
        var fRevalidateCampaignEntity = function(oEvent, oTilesContainer) {
            var iCampaignId = oEvent.getParameter("key");
            if (iCampaignId) {
                if (oTilesContainer && oTilesContainer.getBindingInfo("tiles") && oTilesContainer.getBindingInfo("tiles").binding) {
                    var aTileEntityKeys = oTilesContainer.getBindingInfo("tiles").binding.aKeys;
                    jQuery.each(aTileEntityKeys, function(iTilesEntityKeyIndex, sTilesEntityKey) {
                        if (sap.ui.ino.models.core.InvalidationManager.entityKeyContainsId(sTilesEntityKey, iCampaignId)) {
                            sap.ui.ino.models.core.InvalidationManager.validateEntity(sTilesEntityKey);
                        }
                    });
                }
            }
        };
        this._fUpdateFunction = function(oEvent) {
            fRevalidateCampaignEntity(oEvent, that.getView().getTilesContainer());
        };
        sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Update, this._fUpdateFunction);

        this._fCreateFunction = function(oEvent) {

            if (oEvent.getParameter("object").getMetadata().getName() == "sap.ui.ino.models.object.Campaign") {
                that._bindTiles();
            }
        };
        sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Create, this._fCreateFunction);

        this._fCopyFunction = function(oEvent) {
            if (oEvent.getParameter("object").getMetadata().getName() == "sap.ui.ino.models.object.Campaign") {
                that._bindTiles();
            }
        };
        sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Copy, this._fCopyFunction);

        this._fDelFunction = function(oEvent) {
            if (oEvent.getParameter("object").getMetadata().getName() == "sap.ui.ino.models.object.Campaign") {
                that._bindTiles();
            }
        };
        sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, this._fDelFunction);

        this._fCustomActionFunction = function(oEvent) {
            if (oEvent.getParameter("object").getMetadata().getName() == "sap.ui.ino.models.object.Campaign") {
                that._bindTiles();
            }
        };
        sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Action, this._fCustomActionFunction);
    },

    setFilter : function(sFilter) {
        this._sFilter = sFilter;
    },

    getFilter : function() {
        if (!this._sFilter) {
            return "active";
        }
        return this._sFilter;
    },

    setSearchTerm : function(sSearch) {
        this._sSearchTerm = sSearch;
    },

    getSearchTerm : function(bURIEncoded) {
        if (this._sSearchTerm == "" || this._sSearchTerm == undefined)
            return "";
        if (bURIEncoded) {
            return encodeURIComponent(this._sSearchTerm);
        }
        return this._sSearchTerm;
    },

    _bindTiles : function() {
        var oController = this;
        var sFilter = this.getFilter();
        var oContainer = this.getView().getTilesContainer();
        var sBindingPath;
        var sSearchTerm = this.getSearchTerm() ? this.getSearchTerm(true) : "";

        // Special logic for innovation manager
        var bShowAll = sap.ui.ino.application.Configuration.hasCurrentUserPrivilege('sap.ino.xs.rest.admin.application::campaign');
        var sFilterBackoffice = bShowAll ? 'filterBackoffice=0' : 'filterBackoffice=1';

        if (sFilter === "completed") {
            sBindingPath = "/CampaignSearchParams(searchToken='" + sSearchTerm + "',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='pastCampaigns'," + sFilterBackoffice + ")/Results?$filter=STATUS_CODE%20ne%20%27sap.ino.config.CAMP_DRAFT%27";
        } else if (sFilter === "draft") {
            sBindingPath = "/CampaignSearchParams(searchToken='" + sSearchTerm + "',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName=''," + sFilterBackoffice + ")/Results?$filter=STATUS_CODE%20eq%20%27sap.ino.config.CAMP_DRAFT%27";
        } else if (sFilter === "future") {
            sBindingPath = "/CampaignSearchParams(searchToken='" + sSearchTerm + "',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='futureCampaigns'," + sFilterBackoffice + ")/Results?$filter=STATUS_CODE%20ne%20%27sap.ino.config.CAMP_DRAFT%27";
        } else { // active campaigns are rendered by default
            sBindingPath = "/CampaignSearchParams(searchToken='" + sSearchTerm + "',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='activeCampaigns'," + sFilterBackoffice + ")/Results?$filter=STATUS_CODE%20ne%20%27sap.ino.config.CAMP_DRAFT%27";
        }

        
        oContainer.bindAggregation("tiles", sBindingPath, new sap.ui.ino.controls.CampaignTile({
            objectId : "{ID}",
            headerTitle : "{SHORT_NAME}",
            headerColor : "{COLOR_CODE}",
            status : sFilter,
            draftText : "{i18n>BO_CAMPAIGN_TILE_DRAFT}",
            unassignedIdeasCount : {
                path : "UNASSIGNED_IDEAS_COUNT",
                type : new sap.ui.ino.models.types.ShortendNumberType()
            },
            unassignedIdeasText : "{i18n>BO_CAMPAIGN_TILE_UNASSIGNED}",
            completedIdeasCount : {
                path : "COMPLETED_IDEAS_COUNT",
                type : new sap.ui.ino.models.types.ShortendNumberType()
            },
            completedIdeasText : "{i18n>BO_CAMPAIGN_TILE_COMPLETED}",
            discontinuedIdeasCount : {
                path : "DISCONTINUED_IDEAS_COUNT",
                type : new sap.ui.ino.models.types.ShortendNumberType()
            },
            discontinuedIdeasText : "{i18n>BO_CAMPAIGN_TILE_DISCONTINUED}",
            allIdeasCount : {
                path : "ALL_IDEAS_COUNT",
                type : new sap.ui.ino.models.types.ShortendNumberType()
            },
            allIdeasText : "{i18n>BO_CAMPAIGN_TILE_ALL_IDEAS}",
            dateStatusText : {
                parts : [{
                    path : "VALID_FROM"
                }, {
                    path : "VALID_TO"
                }, {
                    path : "SUBMIT_TO"
                }],
                formatter : function(dValidFrom, dValidTo, dSubmitTo) {
                    var oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
                    var sRelativeDate;
                    if (oController.getFilter() === "active") {
                        if (dSubmitTo > new Date("Dec 31 9999")) {
                            return oTextBundle.getText("BO_CAMPAIGN_TILE_CAMPAIGN_INFINITE");
                        } else {
                            sRelativeDate = new sap.ui.ino.models.types.RelativeDateType().formatValue(dSubmitTo, "string");
                            return oTextBundle.getText("BO_CAMPAIGN_TILE_SUBMISSION_ENDS", [sRelativeDate]);
                        }
                    }
                    if (oController.getFilter() === "future") {
                        sRelativeDate = new sap.ui.ino.models.types.RelativeDateType().formatValue(dValidFrom, "string");
                        return oTextBundle.getText("BO_CAMPAIGN_TILE_CAMPAIGN_STARTS", [sRelativeDate]);
                    }
                    if (oController.getFilter() === "completed" || oController.getFilter() === "draft") {
                        var sFrom = sap.ui.core.format.DateFormat.getInstance().format(dValidFrom, false);
                        var sTo = sap.ui.core.format.DateFormat.getInstance().format(dValidTo, false);
                        return oTextBundle.getText("BO_CAMPAIGN_TILE_CAMPAIGN_FROM_TO", [sFrom, sTo]);
                    }
                    return "";
                }
            },
            participantsCount : {
                path : "PARTICIPANTS_COUNT",
                type : new sap.ui.ino.models.types.ShortendNumberType()
            },
            participantsText : "{i18n>BO_CAMPAIGN_TILE_PARTICIPANTS}",
            clipboardBtn : sap.ui.ino.application.backoffice.ControlFactory.createClipboardToggleButton(sap.ui.ino.models.object.Campaign),
            duplicateEnabled : this.isContentCreationEnabled(),
            campaignSettingsPressed : function(oEvent) {
                var iCampaignId = oEvent.getParameter("campaignId");
                oController.openCampaignInstance(iCampaignId);
            },
            campaignDuplicatePressed : oController.onCampaignDuplicatePressed,
            settingsBtnTooltipText : "{i18n>BO_CAMPAIGN_TILE_CAMPAIGN_SETTINGS_TOOLTIP}",
            duplicateBtnTooltipText : "{i18n>BO_CAMPAIGN_TILE_CAMPAIGN_DUPLICATE_TOOLTIP}"
        }).addStyleClass("sapMPointer sapMTile"));
        // {onsapspace: function () { arguments[0].stopPropagation(); arguments[0].srcControl.firePress() }})
        var oModel = sap.ui.getCore().getModel();
        oModel.setSizeLimit(1000);
        var fnComplete = null;
        fnComplete = function() {
            var oBinding = oContainer.getBinding("tiles");
            if(oBinding && oBinding.oModel){
                oBinding.oModel.iSizeLimit=1000;
            }
            oController.getView().getLoadingTextView().setVisible(false);
            if (oController.getView().getTilesContainer().getTiles().length > 0) {
                oController.getView().getTilesContainer().setVisible(true);
                oController.getView().getNoDataTextView().setVisible(false);
            } else {
                oController.getView().getNoDataTextView().setVisible(true);
            }
            oModel.detachRequestCompleted(fnComplete);
        };
        oModel.attachRequestCompleted(fnComplete);
    },

    isContentCreationEnabled : function() {
        if (!this.oStaticPropertyModel) {
            this.oStaticPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.campaign.Campaign", 0, {
                staticActions : [{
                    create : {}
                }]
            }, true);
            this.bContentCreationEnabled = this.oStaticPropertyModel.getProperty("/actions/create/enabled");
        }
        return this.bContentCreationEnabled;
    },

    onCreatePressed : function() {
        var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
        oInstanceView.show(-1, "edit");
    },

    openCampaignInstance : function(iCampaignId) {
        var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
        oInstanceView.show(iCampaignId, "display", function() {
        });
    },

    onCampaignDuplicatePressed : function(oEvent) {
        var oController = this;
        var iCampaignId = oEvent.getParameter("campaignId");
        sap.ui.ino.controls.BusyIndicator.show(0);

        var fnSetFailMessage = function() {
            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
            var oMessageParameters = {
                key : "MSG_CAMPAIGN_COPY_FAILURE",
                level : sap.ui.core.MessageType.Error,
                parameters : [],
                group : "campaign",
                text : oMsg.getResourceBundle().getText("MSG_CAMPAIGN_COPY_FAILURE")
            };

            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
            oApp.addNotificationMessage(oMessage);
        };

        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");

        var oCopyRequest = sap.ui.ino.models.object.Campaign.copy(iCampaignId, {
            ID : -1
        });

        oCopyRequest.always(function() {
            sap.ui.ino.controls.BusyIndicator.hide();
        });

        oCopyRequest.done(function(oResponse) {
            var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
            oInstanceView.show(oResponse.GENERATED_IDS[-1], "edit");

            // wait a moment before displaying and rerendering
            setTimeout(function() {
                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                var oMessageParameters = {
                    key : "MSG_CAMPAIGN_COPIED",
                    level : sap.ui.core.MessageType.Success,
                    parameters : [],
                    group : "campaign",
                    text : oMsg.getResourceBundle().getText("MSG_CAMPAIGN_COPIED")
                };
                var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                oApp.addNotificationMessage(oMessage);
            }, 500);
        });

        oCopyRequest.fail(function(oResponse) {
            fnSetFailMessage();

            if (oResponse.MESSAGES) {
                for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                    var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oResponse.MESSAGES[i], oController.getView(), "campaign");
                    sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
                }
            }
        });

    },

    onShowTableView : function(oEvent, oData) {
        sap.ui.ino.application.ApplicationBase.getApplication().navigateTo("campaignlist", {
            tableView : this.getFilter(),
            showPreview : oData.preview,
            searchTerm : this.getSearchTerm(true)
        });
    },

    onSearch : function(oEvent) {
        var sSearchTerm = oEvent.getParameter("query").replace(/'/g, "''");
        this.setSearchTerm(sSearchTerm);
        this._bindTiles();
    },

    onExit : function(oEvent) {
        this._detachApplicationObjectListeners();
    },

    _detachApplicationObjectListeners : function() {
        sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Update, this._fUpdateFunction);
        sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Create, this._fCreateFunction);
        sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Copy, this._fCopyFunction);
        sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, this._fDelFunction);
        sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Action, this._fCustomActionFunction);
    },

});