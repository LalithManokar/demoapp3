/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

var ObjectType = {
    Campaign : "campaign",
    User : "user",
    Group : "group"
};

sap.ui.controller("sap.ui.ino.views.backoffice.SearchResults", {

    onInit : function() {
        this.historyPath = this.getView().getHistoryPath();
        this._filterModel = new sap.ui.model.json.JSONModel({
            navigationItem : "",
            searchTerm : "",
            filters : []
        });

        this.getView().setModel(this._filterModel, "filter");

        // name the filters model to be able to bind against it in the tag cloud
        sap.ui.getCore().setModel(this._filterModel, "filter");

        // As we do paging in backoffice search result inline count is needed. A separate OData Model is needed as the
        // common OData Model does not use inline counts due to performance reasons
        var oDataModel = new sap.ui.model.odata.ODataModel(Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE"), false);
        oDataModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);

        this.getView().setModel(oDataModel);
    },

    setHistoryState : function(oHistoryState) {
        if (oHistoryState && (typeof oHistoryState === "object")) {
            this._filterModel.setProperty("/navigationItem", oHistoryState.searchTerm || ObjectType.Campaign);
            this._filterModel.setProperty("/searchTerm", oHistoryState.searchTerm || "");
            this._filterModel.setProperty("/filters", {});
            this._filterModel.setProperty("/filters/campaign", oHistoryState.campaignFilters || []);
        }
        this.updateBindings();
    },

    saveStateInHistory : function() {
        var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
        oApp.navigateTo(this.historyPath, {
            navigationItem : this.getNavigationItem(),
            searchTerm : this.getSearchTerm(),
            campaignFilters : this.getFilters(ObjectType.Campaign)
        });
    },

    getNavigationItem : function() {
        return this._filterModel.getProperty("/navigationItem");
    },

    setNavigationItem : function(sNavigationItem) {
        this._filterModel.setProperty("/navigationItem", sNavigationItem);
        this._filterModel.checkUpdate();
    },

    getSearchTerm : function() {
        return this._filterModel.getProperty("/searchTerm");
    },

    setSearchTerm : function(sSearchTerm) {
        this._filterModel.setProperty("/searchTerm", sSearchTerm);
        this._filterModel.checkUpdate();
    },

    getFilters : function(sType) {
        return this._filterModel.getProperty("/filters/" + sType);
    },

    updateBindings : function() {
        this.updateTagObjectListBindings([ObjectType.Campaign]);
        this.updateTagCloudBindings([ObjectType.Campaign]);
        this.updateObjectListBindings([ObjectType.User, ObjectType.Group]);
    },

    updateFilterRelevantBindings : function(sType) {
        this.updateTagObjectListBindings([sType]);
        this.updateTagCloudBindings([sType]);
    },

    updateGroupListBindings : function() {
        this.getView().oRowRepeaterGroups.bindRows({
            path : "/SearchIdentityGroup(searchToken='" + jQuery.sap.encodeURL(this.getSearchTerm().replace(/'/g, "''")) + "')/Results",
            template : this.getView().oGroupTemplate,
            filters : [new sap.ui.model.Filter("TYPE_CODE", "EQ", "GROUP")],
            sorter : new sap.ui.model.Sorter("SEARCH_SCORE", false)
        });

        var oComponentsGroup = {
            binding : this.getView().oRowRepeaterGroups.getBinding('rows'),
            navigationItem : this.getView().oNavigationItemGroups,
            textKey : "BO_SEARCH_TXT_GROUP"
        };

        this.getView().oRowRepeaterGroups.getBinding('rows').attachDataReceived(this.onSetCount, oComponentsGroup);
    },

    updateObjectListBindings : function(aType) {
        var oTypeConfig = {
            user : {
                path : "/SearchIdentity",
                columns : "ID,NAME,USER_NAME,EMAIL,TYPE_CODE,IMAGE_ID,DESCRIPTION",
                filter : [new sap.ui.model.Filter("TYPE_CODE", "EQ", "USER")],
                text : "BO_SEARCH_TXT_USER"
            },
            group : {
                path : "/SearchIdentity",
                columns : "ID,NAME,USER_NAME,EMAIL,TYPE_CODE,IMAGE_ID,DESCRIPTION",
                filter : [new sap.ui.model.Filter("TYPE_CODE", "EQ", "GROUP")],
                text : "BO_SEARCH_TXT_GROUP"
            }
        };

        var sType = "";
        for (var iType in aType) {
            sType = aType[iType];

            var sSearchTerm = jQuery.sap.encodeURL(this.getSearchTerm().replace(/'/g, "''"));

            this.getView().oRowRepeater[sType].unbindRows();
            this.getView().oRowRepeater[sType].bindRows({
                path : oTypeConfig[sType].path + "(searchToken='" + sSearchTerm + "')/Results",
                template : this.getView().oTemplate[sType],
                filters : oTypeConfig[sType].filter,
                parameters : {
                    select : oTypeConfig[sType].columns
                },
                sorter : new sap.ui.model.Sorter("SEARCH_SCORE", false)
            });

            var oComponents = {
                binding : this.getView().oRowRepeater[sType].getBinding('rows'),
                navigationItem : this.getView().oNavigationItem[sType],
                textKey : oTypeConfig[sType].text
            };

            this.getView().oRowRepeater[sType].getBinding('rows').attachDataReceived(this.onSetCount, oComponents);
        }
    },

    updateTagObjectListBindings : function(aType) {
        var oTypeConfig = {
            campaign : {
                path : "/CampaignSearchParams",
                columns : "ID,NAME,STATUS_CODE,VALID_FROM,VALID_TO,DESCRIPTION",
                filter : [new sap.ui.model.Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
                text : "BO_SEARCH_TXT_CAMPAIGN"
            }
        };

        var sType = "";
        for (var iType in aType) {
            sType = aType[iType];

            var sSearchTerm = jQuery.sap.encodeURL(this.getSearchTerm().replace(/'/g, "''"));
            var sTagFilter = "";
            var aFilter = this.getFilters(sType);

            if (aFilter.length > 0) {
                for (var ii = 0; ii < aFilter.length; ++ii) {
                    var aKeys = Object.keys(aFilter[ii]);
                    if (aKeys.length > 0 && aKeys[0] == "TAG") {
                        sTagFilter += (aFilter[ii][aKeys[0]] + ",");
                    }
                }
                if (sTagFilter.length > 0) {
                    sTagFilter = sTagFilter.substring(0, sTagFilter.length - 1);
                }
            }

            this.getView().oRowRepeater[sType].unbindRows();
            this.getView().oRowRepeater[sType].bindRows({
                path : oTypeConfig[sType].path + "(searchToken='" + sSearchTerm + "',tagsToken='" + sTagFilter + "',filterName='',filterBackoffice=0)/Results",
                filters : oTypeConfig[sType].filter,
                parameters : {
                    select : oTypeConfig[sType].columns
                },
                template : this.getView().oTemplate[sType],
                sorter : new sap.ui.model.Sorter("SEARCH_SCORE", true)
            });

            var oComponents = {
                binding : this.getView().oRowRepeater[sType].getBinding('rows'),
                navigationItem : this.getView().oNavigationItem[sType],
                textKey : oTypeConfig[sType].text
            };

            this.getView().oRowRepeater[sType].getBinding('rows').attachDataReceived(this.onSetCount, oComponents);
        }
    },

    updateTagCloudBindings : function(aType) {
        var oTypeConfig = {
            campaign : {
                path : "/sap/ino/xs/rest/common/tagcloud_campaigns.xsjs?EXCL_STATUS=sap.ino.config.CAMP_DRAFT"
            }
        };

        var sType = "";
        for (var iType in aType) {
            sType = aType[iType];

            if (!this.getView().oResultLayout[sType].getVisible()) {
                continue;
            }

            var sPath = Configuration.getBackendRootURL() + oTypeConfig[sType].path;
            var aFilter = this.getFilters(sType);
            for (var ii = 0; ii < aFilter.length; ++ii) {
                var aKeys = Object.keys(aFilter[ii]);
                if (aKeys.length > 0) {
                    sPath += ("&" + aKeys[0] + "=" + aFilter[ii][aKeys[0]]);
                }
            }
            if (this.getSearchTerm() && this.getSearchTerm().length > 0) {
                sPath += ("&SEARCHTERM=" + this.getSearchTerm(true));
            }

            var oTagModel = new sap.ui.model.json.JSONModel(sPath);
            this.getView().oTagRepeater[sType].setModel(oTagModel);
            this.getView().oTagRepeater[sType].bindRows("/RANKED_TAG", this.getView().oTagTemplate[sType]);
        }
    },

    onSetCount : function(oEvent) {
        var iRowCount = this.binding.getLength();

        if(iRowCount === 0) {
            this.navigationItem.setVisible(false);
        } else {
            this.navigationItem.setVisible(true);

            var oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
            var sText = oTextBundle.getText(this.textKey, [iRowCount]);
            this.navigationItem.setText(sText);
        }
    },

    onSearch : function(oEvent) {
        var sSearchTerm = oEvent.getParameter("query");
        this.setSearchTerm(sSearchTerm);
        this.saveStateInHistory();
    },

    onSwitchView : function(oEvent) {
        this.filter = oEvent.getParameter("item").getKey();
        switch (this.filter) {
            case ObjectType.Campaign :
                this.getView().oResultLayout[ObjectType.Campaign].setVisible(true);
                this.getView().oResultLayout[ObjectType.User].setVisible(false);
                this.getView().oResultLayout[ObjectType.Group].setVisible(false);

                this.updateTagCloudBindings([ObjectType.Campaign]);
                break;
            case ObjectType.User :
                this.getView().oResultLayout[ObjectType.Campaign].setVisible(false);
                this.getView().oResultLayout[ObjectType.User].setVisible(true);
                this.getView().oResultLayout[ObjectType.Group].setVisible(false);
                break;
            case ObjectType.Group :
                this.getView().oResultLayout[ObjectType.Campaign].setVisible(false);
                this.getView().oResultLayout[ObjectType.User].setVisible(false);
                this.getView().oResultLayout[ObjectType.Group].setVisible(true);
                break;
            default :
                this.getView().oResultLayout[ObjectType.Campaign].setVisible(true);
                this.getView().oResultLayout[ObjectType.User].setVisible(false);
                this.getView().oResultLayout[ObjectType.Group].setVisible(false);

                this.updateTagCloudBindings([ObjectType.Campaign]);
                break;
        }
    },

    removeFilter : function(sType, aRemove) {
        var bHasChanged = false;
        var aFilter = this.getFilters(sType);
        if (aRemove) {
            for (var ii = 0; ii < aRemove.length; ++ii) {
                for (var jj = 0; jj < aFilter.length; ++jj) {
                    if (JSON.stringify(aFilter[jj].TAG) == JSON.stringify(aRemove[ii].TAG)) {
                        aFilter.splice(jj, 1);
                        bHasChanged = true;
                        break;
                    }
                }
            }
        }
        if (bHasChanged) {
            this._filterModel.checkUpdate();
            this.saveStateInHistory();
        }
    },

    getFilterName : function() {
        var sFilterName = this._filterModel.getProperty("/filterName");
        if (sFilterName == null) {
            sFilterName = this.getView().getFilterName();
            if (sFilterName == null) {
                return "";
            }
        }
        return sFilterName;
    },

    addFilter : function(sType, aAdd) {
        var bDuplicate = false;
        var bHasChanged = false;
        if (aAdd) {
            var aFilter = this.getFilters(sType);
            for (var ii = 0; ii < aAdd.length; ++ii) {
                for (var jj = 0; jj < aFilter.length; ++jj) {
                    if (JSON.stringify(aFilter[jj].TAG) == JSON.stringify(aAdd[ii].TAG)) {
                        bDuplicate = true;
                        break;
                    }
                }
                if (!bDuplicate) {
                    aFilter.push(aAdd[ii]);
                    bHasChanged = true;
                }
                bDuplicate = false;
            }
        }

        if (bHasChanged) {
            this._filterModel.checkUpdate();
            this.saveStateInHistory();
        }

        return bHasChanged;
    }
});