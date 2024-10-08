/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.views.extensibility.StableIdentifier");
jQuery.sap.require("sap.ui.ino.application.Configuration");

var StableIdentifier = sap.ui.ino.views.extensibility.StableIdentifier;

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {

    getApplication : function() {
        if (!this._oApp) {
            this._oApp = sap.ui.ino.application.backoffice.Application.getInstance();
        }

        return this._oApp;
    },

    getSettings : function() {
        var StableView = StableIdentifier.BackOffice.List.Campaign.View;
        var StableColumn = StableIdentifier.BackOffice.List.Campaign.Column;
        var oDefaultSorter = new sap.ui.model.Sorter(StableColumn.ValidFrom, true);
        
        // Special logic for innovation manager
        var bShowAll = sap.ui.ino.application.Configuration.hasCurrentUserPrivilege('sap.ino.xs.rest.admin.application::campaign');
        var sFilterBackoffice = bShowAll ? 'filterBackoffice=0' : 'filterBackoffice=1';

        var mSettings = {
            sBindingPathTemplate : "/CampaignSearchParams(searchToken='{searchTerm}',tagsToken='{tagsToken}',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='{filterName}'," + sFilterBackoffice + ")/Results",
            aRowSelectionEnabledButtons : [],
            aVisibleActionButtons : ["BUT_CREATE", "BUT_EDIT", "BUT_COPY", "BUT_DELETE"],
            mTableViews : {},
            sApplicationObject : "sap.ui.ino.models.object.Campaign"
        };

        mSettings.mTableViews[StableView.ActiveCampaigns] = {
            "default" : true,
            mBindingPathParameters : {
                filterName : "activeCampaigns"
            },
            aFilters : [new sap.ui.model.Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
            oSorter : oDefaultSorter
        };

        mSettings.mTableViews[StableView.DraftCampaigns] = {
            mBindingPathParameters : {
                filterName : ""
            },
            aFilters : [new sap.ui.model.Filter("STATUS_CODE", "EQ", "sap.ino.config.CAMP_DRAFT")],
            oSorter : oDefaultSorter
        };

        mSettings.mTableViews[StableView.FutureCampaigns] = {
            mBindingPathParameters : {
                filterName : "futureCampaigns"
            },
            aFilters : [new sap.ui.model.Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
            oSorter : oDefaultSorter
        };

        mSettings.mTableViews[StableView.CompletedCampaigns] = {
            mBindingPathParameters : {
                filterName : "pastCampaigns"
            },
            aFilters : [new sap.ui.model.Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
            oSorter : oDefaultSorter
        };

        return mSettings;
    },

    switchTableView : function(oViewState) {
        if (oViewState && oViewState.showPreview != undefined) {
            this._bShowPreview = oViewState.showPreview;
        }
        if(oViewState && oViewState.searchTerm != undefined) {
            this.setDynamicBindingPathParameter("searchTerm", oViewState.searchTerm);
        }
        sap.ui.ino.views.common.MasterDetailController.switchTableView.call(this, oViewState);
    },

    _setCurrentTableView : function(sTableViewName) {
        sap.ui.ino.views.common.MasterDetailController._setCurrentTableView.call(this, sTableViewName);
        if (this._bShowPreview != undefined) {
            this._oCurrentTableView.showPreview = this._bShowPreview;
        }

    },

    onShowTiles : function(oEvent) {
        sap.ui.ino.application.ApplicationBase.getApplication().navigateTo("campaigntiles", {
            tableView : this.getCurrentTableViewName(),
            searchTerm: encodeURIComponent(this._mDynamicBindingPathParameters.searchTerm)
        });
        
    },

    onCreatePressed : function() {
        var oController = this;
        var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
        oInstanceView.show(-1, "edit");
    },

    onDisplayPressed : function() {
        var oController = this;
        this._hideDetailsView();
        var oBindingContext = this.getView().getSelectedRowContext();
        var sEntityKey = oBindingContext.getPath().substring(1);
        if (oBindingContext) {
            var oInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance");
            oInstanceView.show(oBindingContext.getProperty("ID"), "display", function() {
            });
        }
    },

    onCopyPressed : function() {
        var oView = this.getView();
        var oController = this;

        sap.ui.ino.controls.BusyIndicator.show(0);

        this._hideDetailsView();
        var oBindingContext = this.getView().getSelectedRowContext();

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

        if (oBindingContext) {
            var oCopyRequest = sap.ui.ino.models.object.Campaign.copy(oBindingContext.getProperty("ID"), {
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
                        var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oResponse.MESSAGES[i], oView, "campaign");
                        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
                    }
                }
            });
        } else {
            sap.ui.ino.controls.BusyIndicator.hide();
            fnSetFailMessage();
        }
    },

    onDeletePressed : function() {
        var oView = this.getView();
        var oController = this;

        var oSelectedRowContext = oView.getSelectedRowContext();
		if(!oSelectedRowContext){
			return;
		}
		
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");
        function fnDeleteInstance(bResult) {
            if (bResult) {
                sap.ui.ino.controls.BusyIndicator.show(0);

                var oDeleteRequest = sap.ui.ino.models.object.Campaign.del(oSelectedRowContext.getProperty("ID"));

                oDeleteRequest.done(function(oResponse) {
                    sap.ui.ino.controls.BusyIndicator.hide();

                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                    var oMessageParameters = {
                        key : "MSG_CAMPAIGN_DELETED",
                        level : sap.ui.core.MessageType.Success,
                        parameters : [],
                        group : "campaign",
                        text : oMsg.getResourceBundle().getText("MSG_CAMPAIGN_DELETED")
                    };

                    var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
                    var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
                    oApp.addNotificationMessage(oMessage);
                    oController.clearSelection();
                });

                oDeleteRequest.fail(function(oResponse) {
                    sap.ui.ino.controls.BusyIndicator.hide();
                    if (oResponse.MESSAGES) {
                        for (var i = 0; i < oResponse.MESSAGES.length; i++) {
                            var oMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oResponse.MESSAGES[i], oView, "campaign");
                            sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
                        }
                    }
                });
            }
        };

        var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_LIST_INS_DEL_CAMPAIGN"), fnDeleteInstance, i18n.getText("BO_CAMPAIGN_LIST_TIT_DEL_CAMPAIGN"));
    },

    clearSelection : function() {
        var oView = this.getView();
        oView._oTable.setSelectedIndex(-1);
        sap.ui.ino.views.common.MasterDetailController.clearSelection.apply(this);
    },

    updatePropertyModel : function() {
        /* don't know why, but binding the properties directly to the buttons causes flickering */
        var oView = this.getView();
        var oSelectedRowContext = oView.getSelectedRowContext();
        if (oSelectedRowContext) {
            var oObject = oSelectedRowContext.getObject();
            if (oObject) {
                var iId = oSelectedRowContext.getObject().ID;
                var oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.campaign.Campaign", iId, {
                    actions : ["del", "copy"]
                }, true);
                var bDelete = oPropertyModel.getProperty("/actions/del/enabled");
                var bCopy = oPropertyModel.getProperty("/actions/copy/enabled");
                
                // display button is always enabled, whenever a campaign is selected
                oView._oDisplayButton.setEnabled(true);
                
                if (oView._oDeleteButton.getEnabled() != bDelete) {
                    oView._oDeleteButton.setEnabled(bDelete);
                };
                if (oView._oCopyButton.getEnabled() != bCopy) {
                    oView._oCopyButton.setEnabled(bCopy);
                };
            } else {
                oView._oDisplayButton.setEnabled(false);
                oView._oDeleteButton.setEnabled(false);
                oView._oCopyButton.setEnabled(false);
            }
        } else {
            oView._oDisplayButton.setEnabled(false);
            oView._oDeleteButton.setEnabled(false);
            oView._oCopyButton.setEnabled(false);
        }
    }
}));