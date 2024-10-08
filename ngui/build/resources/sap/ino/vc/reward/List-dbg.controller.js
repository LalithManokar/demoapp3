sap.ui.define([
    "sap/ui/Device",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/commons/models/object/RewardList",
    "sap/ino/controls/OrientationType",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ino/vc/reward/RewardFormatter",
    "sap/ino/vc/reward/mixins/MassActionMixin",
    "sap/ino/vc/reward/mixins/CreateActionMixin",
    "sap/ino/vc/commons/mixins/ExportMixin",
    "sap/ui/model/json/JSONModel"
], function(
	Device,
	Sorter,
	Filter,
	FilterOperator,
	MessageBox,
	Configuration,
	ObjectListFormatter,
	ApplicationObjectChange,
	RewardList,
	OrientationType,
	TopLevelPageFacet,
	BaseController,
	EvaluationFormatter,
	RewardFormatter,
	MassActionMixin,
	CreateActionMixin,
	ExportMixin,
	JSONModel) {
	"use strict";

	var mRoutes = {
		REWARD: "rewardlist",
		REWARD_VARIANT: "rewardlistvariant"
	};

	var mVariant = {
		REWARD_MANAGE: "rewardmanage",
		REWARD_QUALIFIED: "rewardqualified",
		REWARD_REWARDED: "rewardobjects",
		REWARD_EXPORTED: "rewarddownloaded",
		REWARD_GAMIFICATION: "rewardgamificationreport"
	};

	var mFilter = {
		REWARD_MANAGE: "rewardManage",
		REWARD_QUALIFIED: "qualifiedIdeaForReward",
		REWARD_REWARDED: "readyForDownloadReward",
		REWARD_EXPORTED: "downloadedReward",
		REWARD_GAMIFICATION: "rewardGamificationReport"
	};

	var mList = {
		NAME: "IDEA_LIST_MIT_REWARD_NAME",
		Variants: {
			DEFAULT_VARIANT: mVariant.REWARD_MANAGE,
			TITLE: "IDEA_LIST_MIT_REWARD_MANAGE",
			Values: [{
					TEXT: "IDEA_LIST_MIT_REWARD_MANAGE",
					ACTION: mVariant.REWARD_MANAGE,
					FILTER: mFilter.REWARD_MANAGE,
					// DEFAULT_SORT: mSort.SUBMITTED_AT,
					CAMPAIGN_MANAGE: true,
					VISIBLE: true
            }, {
					TEXT: "IDEA_LIST_MIT_REWARD_QUALIFIED",
					ACTION: mVariant.REWARD_QUALIFIED,
					FILTER: mFilter.REWARD_QUALIFIED,
					// INCLUDE_DRAFT: false,
					// DEFAULT_SORT: mSort.SUBMITTED_AT,
					HIERARCHY_LEVEL: "1",
					CAMPAIGN_MANAGE: true,
					VISIBLE: true
            }, {
					TEXT: "IDEA_LIST_MIT_REWARD_REWARDED",
					ACTION: mVariant.REWARD_REWARDED,
					FILTER: mFilter.REWARD_REWARDED,
					// DEFAULT_SORT: mSort.SUBMITTED_AT,
					HIERARCHY_LEVEL: "1",
					CAMPAIGN_MANAGE: true
            }, {
					TEXT: "IDEA_LIST_MIT_REWARD_EXPORTED",
					ACTION: mVariant.REWARD_EXPORTED,
					FILTER: mFilter.REWARD_EXPORTED,
					// DEFAULT_SORT: mSort.SUBMITTED_AT,
					HIERARCHY_LEVEL: "1",
					CAMPAIGN_MANAGE: true
            },
				{
					TEXT: "IDEA_LIST_MIT_REWARD_GAMIFICATION_REPORT",
					ACTION: mVariant.REWARD_GAMIFICATION,
					FILTER: mFilter.REWARD_GAMIFICATION,
					// DEFAULT_SORT: mSort.SUBMITTED_AT,
					HIERARCHY_LEVEL: "1",
					CAMPAIGN_MANAGE: true
            }
            ]
		}
	};

	var oList = BaseController.extend("sap.ino.vc.reward.List", jQuery.extend({}, TopLevelPageFacet, ExportMixin, MassActionMixin,
		CreateActionMixin, {

			formatter: jQuery.extend({}, ObjectListFormatter, EvaluationFormatter, RewardFormatter),

			initialFocus: "filterButton",

			list: mList,

			routes: ["rewardlist", "rewardlistvariant"],

			view: {
				"List": {
					"VARIANT": mVariant.REWARD_MANAGE,
					"MANAGE": false,
					"TAGS": [],
					"IS_TAGS_SELECTION": false,
					"TAGCLOUD": false,
					"TAGCLOUD_EXPABLE": true,
					"TAGCLOUD_EXP": false,
					"TAGCLOUD_BAR_VISIBLE": false,
					"HIDE_PPT_EXPORT": true,
					"SELECT_ALL_ENABLE": false,
					"SELECT_ALL": false,
					"IS_IDEA_LIST": false,
					"IS_GAMIFICATION_REPORT": false
				},
				"ORIENTATION": OrientationType.PORTRAIT
			},

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this.oViewModel = this.getModel("view");
				this.oViewModel.setData(this.view, true);
				this.initApplicationObjectChangeListeners();
			},

			onRouteMatched: function(oEvent) {
				this.setGlobalFilter([]);
          var bBOPrivilege = this.getModel("user").getProperty("/privileges")["sap.ino.ui::backoffice.access"];
            if(!bBOPrivilege){
              this.navigateTo("home"); 
              return;
              }   					
				this.setHelp("REWARD_LIST");
				this.setCurrentRouteCampaignID();
				this.show(oEvent);
			},
            setCurrentRouteCampaignID: function(){
				var oHistoryModel = this.getModel("history");
				var sCurrentHash = oHistoryModel.getProperty("/CurrentHash/hash");
				if( sCurrentHash && sCurrentHash.indexOf('campaign/') >= 0){
			    var sCampaignID = sCurrentHash.substr(9);
			    this.setViewProperty("/List/CAMPAIGN",sCampaignID);
				var oCampaignFilterList = this.byId("panelFilterFragment--campaignFilterList");
				var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
				for (var i = 0; i < oCampaignFilterItems.length; i++) {
					if (oCampaignFilterItems[i].getProperty("key") === sCampaignID) {
						oCampaignFilterList.setSelectionItem(oCampaignFilterItems[i]);
						break;
					}
				}			    
			    this.setFilter(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sCampaignID));
				}                
            },
			onCampaignDialogItemsSelect: function(oEvent) {
				var sSelectedKey = oEvent.getParameter("selectedItem").data("ID") + "";
				var oCampaignFilterList = this.byId("panelFilterFragment--campaignFilterList");
				oCampaignFilterList.getBinding("suggestionItems").filter([]);
				var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
				for (var i = 0; i < oCampaignFilterItems.length; i++) {
					if (oCampaignFilterItems[i].getProperty("key") === sSelectedKey) {
						oCampaignFilterList.setSelectionItem(oCampaignFilterItems[i]);
						break;
					}
				}
				if (sSelectedKey !== this.getViewProperty("/List/CAMPAIGN")) {
					this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
					this.setFilter(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sSelectedKey));
                    var oBindingInfo = this.getList().getBindingInfo("items");
                     oBindingInfo.filters = this._aFilter;
                    this.getList().bindItems(oBindingInfo);
				}
			},

			onCampaignDialogSearch: function(oEvent) {
				var oBinding = oEvent.getParameter("itemsBinding");
				var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
				oBinding.filter(new Filter("SHORT_NAME", FilterOperator.Contains, sValue));
				oBinding.sort(new Sorter("SHORT_NAME"));
			},

			onCampaignSuggestion: function(oEvent) {
				var oViewModel = this.getModel("view");
				var oBinding = oEvent.getSource().getBinding("suggestionItems");
				var mEvent = jQuery.extend({}, oEvent, true);
				var sValue = mEvent.getParameter("suggestValue");
				this.resetClientMessages();
				this.byId("panelFilterFragment--campaignFilterList").setFilterSuggests(false);
				oViewModel.setProperty("/campaignSuggestion", this._aCampaignSuggestion);
				oBinding.filter(new Filter("SHORT_NAME", FilterOperator.Contains, sValue));
				oBinding.sort(new Sorter("SHORT_NAME"));
			},

			onFilterReset: function() {
				this.setViewProperty("/List/CAMPAIGN", undefined);
				this.byId("panelFilterFragment--campaignFilterList").setValue(undefined);
				this.setFilter([]);

				if (!Device.system.desktop) {
					//no navigation on mobile phones yet
					return;
				}

				this._filter();
			},

			onFilterCampaignChange: function(oEvent) {
				var sSelectedKey = oEvent.getParameter("selectedItem") ? Number(oEvent.getParameter("selectedItem").getProperty("key")) : undefined;
				if (sSelectedKey !== this.getViewProperty("/List/CAMPAIGN")) {
					this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
					this.setFilter(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sSelectedKey));
					this._filter();
				}

			},

			onClearCampaignFilter: function(oEvent) {
				var sValue = oEvent.getParameter("value");
				if (sValue.trim() === "") {
					this.setViewProperty("/List/CAMPAIGN", undefined);
					this.setFilter([]);
					this._filter();
				}
			},

			onHandleCampaignFilterHelp: function() {
				var oViewModel = this.getModel("view");
				if (!this._oCampaignlistDialog) {
					this._oCampaignlistDialog = this.createCampaignListDialog();
				}
				oViewModel.setProperty("/campaignSuggestion", this._aCampaignSuggestion);
				this._oCampaignlistDialog.open();
			},

			onDownloadReward: function() {
				var that = this;
				var oTable = this.getList();
				var aRewardId = [];
				var aRewardListId = [];
				var aSelect = oTable.getSelectedIndices();
				if (aSelect.length) {
					for (var i = 0; i < aSelect.length; i++) {
						aRewardId.push(oTable.getContextByIndex(aSelect[i]).getProperty("ID"));
						if (aRewardListId.indexOf(oTable.getContextByIndex(aSelect[i]).getProperty("REWARD_LIST_ID")) === -1) {
							aRewardListId.push(oTable.getContextByIndex(aSelect[i]).getProperty("REWARD_LIST_ID"));
						}
					}
				}

				var oDownloadRequest = BaseController.prototype.executeObjectAction.call(that, RewardList, "download", {
					staticparameters: {
						"REWARD_ID": aRewardId,
						"REWARD_LIST_ID": aRewardListId
					}
				});
				oDownloadRequest.done(function() {
					if (that.bindList && typeof(that.bindList) === "function") {
						that.bindList();
					}
				});
			},

			onListExportXLS: function() {
				var that = this;
				if (!this.getViewProperty("/List/IS_IDEA_LIST") && this.isDownloaded()) {
					MessageBox.confirm(this.getText("IDEA_LIST_REWARD_LIST_INS_EXPORT_CONFIRMATION"), {
						title: this.getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"),
						icon: MessageBox.Icon.NONE,
						onClose: function(bResult) {
							if (bResult === "OK") {
								ExportMixin.onListExportXLS.call(that);
							}
						}
					});
				} else {
					ExportMixin.onListExportXLS.call(that);
				}
			},

			onListExportCSV: function() {
				var that = this;
				if (!this.getViewProperty("/List/IS_IDEA_LIST") && this.isDownloaded()) {
					MessageBox.confirm(this.getText("IDEA_LIST_REWARD_LIST_INS_EXPORT_CONFIRMATION"), {
						title: this.getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"),
						icon: MessageBox.Icon.NONE,
						onClose: function(bResult) {
							if (bResult === "OK") {
								ExportMixin.onListExportCSV.call(that);
							}
						}
					});
				} else {
					ExportMixin.onListExportCSV.call(that);
				}
			},
			visibleItem: function(bVisible) {
				return bVisible;
			},
			onTableSelectionChange: function(oEvent) {
				if (!this._bIsWarned) {
					this._bIsWarned = true;
					MessageBox.show(this.getText("SELECTION_WITH_COAUTHOR_MESSAGE"), MessageBox.Icon.INFORMATION, this.getText("MESSAGE_TIT_WARNING"), [
						MessageBox.Action.OK]);
				}
				if (this._bIsTableSelectionChanging) {
					/* when selecting items and triggering this event, do not handle this event */
					return;
				}
				var oTable = this.getList();
				var aSelect = oTable.getSelectedIndices();
				var iCount = oEvent.getParameter("rowIndex") === -1 || oEvent.getParameter("selectAll") ? 0 : oTable._iBindingLength;
				var iRewardId = oEvent.getParameter("rowIndex") === -1 || oEvent.getParameter("selectAll") ? 0 : oTable.getContextByIndex(oEvent.getParameter(
					"rowIndex")).getProperty("REWARD_LIST_ID");
				var bSelected = aSelect.indexOf(oEvent.getParameter("rowIndex")) >= 0 ? true : false;
				var bDeletable = false;
				var bExportable = false;

				/* select items which shares the same "REWARD_LIST_ID" */
				for (var j = 0; j < iCount; j++) {
					this._bIsTableSelectionChanging = true;
					if (oTable.getContextByIndex(j).getProperty("REWARD_LIST_ID") === iRewardId && j !== oEvent.getParameter("rowIndex")) {
						if (bSelected) {
							oTable.addSelectionInterval(j, j);
						} else {
							oTable.removeSelectionInterval(j, j);
						}
					}
				}
				this._bIsTableSelectionChanging = false;

				/* logic to set delete/export button enable/disable */
				aSelect = oTable.getSelectedIndices();
				for (var i = 0; i < aSelect.length; i++) {
					if (Number(oTable.getContextByIndex(aSelect[i]).getProperty("DOWNLOAD_COUNT"))) {
						bDeletable = false;
						break;
					} else {
						bDeletable = true;
					}
				}
				if (aSelect.length) {
					bExportable = true;
				}
				if (this.byId("sapInoMassDeleteBtn")) {
					this.byId("sapInoMassDeleteBtn").setEnabled(bDeletable);
				}
				if (this.byId("sapInoMassExportBtn")) {
					this.byId("sapInoMassExportBtn").setEnabled(bExportable);
				}
			},

			onOpenIdeaReward: function(oEvent) {
				var iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("IDEA_ID");
				if (iIdeaId) {
					this.navigateTo("idea-display", {
						id: iIdeaId,
						query: {
							section: "sectionRewards"
						}
					});
				}
			},

			onOrientationChange: function() {},

			_check4ManagingList: function() {
				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");

				if (bBackoffice) {
					var sVariant = this.getViewProperty("/List/VARIANT");
					var aVariants = this.getListProperty("/Variants/Values");

					var vVariant = jQuery.grep(aVariants, function(oVariant) {
						return oVariant.ACTION === sVariant;
					});

					vVariant = (vVariant && vVariant.length > 0) ? vVariant[0] : {};

					return vVariant.MANAGE || vVariant.CAMPAIGN_MANAGE || false;
				}

				return false;
			},

			_filter: function() {
				var aFilters = [];
				if (this.getViewProperty("/List/CAMPAIGN")) {
					aFilters.push(new Filter("CAMPAIGN_ID", FilterOperator.EQ, this.getViewProperty("/List/CAMPAIGN")));
				}
				if (this.getViewProperty("/List/IS_IDEA_LIST")) {
					this.getList()
						.getBinding("items")
						.filter(aFilters.length ? new Filter(aFilters, true) : null, "Application");
				} else {
					this.getList()
						.getBinding("rows")
						.filter(aFilters.length ? new Filter(aFilters, true) : null, "Application");
				}
			},

			createCampaignListDialog: function() {
				if (!this._campaignDialog) {
					this._campaignDialog = this.createFragment("sap.ino.vc.idea.fragments.CampaignSuggestionSelectList", this.getView().getId());
					this.getView().addDependent(this._campaignDialog);
				}
				return this._campaignDialog;
			},
            _setCampaignFilter:function (){
			    var sCampaignID = this.getViewProperty("/List/CAMPAIGN");
				var oCampaignFilterList = this.byId("panelFilterFragment--campaignFilterList");
				var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
				for (var i = 0; i < oCampaignFilterItems.length; i++) {
					if (oCampaignFilterItems[i].getProperty("key") === sCampaignID) {
						oCampaignFilterList.setSelectionItem(oCampaignFilterItems[i]);
						break;
					}
				}                
            },
			bindList: function() {
				var that = this;
				this.saveState();

				// see MassActionMixin.js - cleans all internal state for mass action execution
				this.resetActionState();

				var sPath = "";
				var bIsManaged = this._check4ManagingList();
				var oBindingParameter = this.getBindingParameter();

				function fnCallback() {
					var aData = arguments[0].getParameter("data").results;
					var aNewData = [];
					var oViewModel = that.getModel("view");
					jQuery.each(aData, function(iIndex, oItem) {
						if (jQuery.grep(aNewData, function(oNewItem) {
							return oNewItem.ID === oItem.CAMPAIGN_ID;
						}).length === 0 || aNewData.length === 0) {
							aNewData.push({
								ID: oItem.CAMPAIGN_ID,
								SHORT_NAME: oItem.CAMPAIGN_NAME
							});
						}
					});
					oViewModel.setProperty("/campaignSuggestion", aNewData);
					that._aCampaignSuggestion = aNewData;
					that._filter();
					that._setCampaignFilter();
				}

				if (oBindingParameter.Variant === mVariant.REWARD_QUALIFIED) {
					sPath += "IdeaMediumBackofficeSearchParams";
					sPath += "(searchToken='" + (oBindingParameter.SearchTerm ? jQuery.sap.encodeURL(oBindingParameter.SearchTerm) : "") + "'," +
					    "searchType=" + 0 + "," +
						"tagsToken='" + (oBindingParameter.TagIds.join(",") || "") + "'," +
						"filterName='" + (oBindingParameter.VariantFilter || "") + "'," +
						"filterBackoffice=" + (bIsManaged ? "1" : "0") + ",c1='',o1=-1,v1='',c2='',o2=-1,v2='',c3='',o3=-1,v3=''" +
						",cvt='" + "" + "'," + "cvr=0," + "cvy=0" +
						",tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='')/Results";
				} else if (oBindingParameter.Variant === mVariant.REWARD_GAMIFICATION) {
					sPath += "SearchGamificationReportParams(searchLanguage='" + Configuration.getCurrentUser().LOCALE + "')/Results";

				} else {
					sPath += "RewardSearchParams";
					sPath += "(searchToken='" + (oBindingParameter.SearchTerm ? jQuery.sap.encodeURL(oBindingParameter.SearchTerm) : "") + "'," +
						"filterName='" + (oBindingParameter.VariantFilter || "") + "'" + ")/Results";
				}

				this.setPath("data>/" + sPath);

				if (oBindingParameter.Variant === mVariant.REWARD_QUALIFIED) {
					this.getList().bindItems({
						parameters: {
							operationMode: "Client"
						},
						path: this.getPath(),
						filters: this._aFilter,
						template: this.getItemTemplate(),
						groupHeaderFactory: this.getGroupHeaderFactory(),
						events: {
							dataRequested: function() {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(true);
									}
								});
							},
							dataReceived: function() {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(false);
									}
								});

								if (jQuery.type(fnCallback) === "function") {
									fnCallback.apply(this, arguments);
								}
							}
						}
					});
				} else if (oBindingParameter.Variant === mVariant.REWARD_GAMIFICATION) {
					this.getList().bindRows({
						path: this.getPath()
					});

				} else {
					this.getList().bindRows({
						parameters: {
							operationMode: "Client"
						},
						path: this.getPath(),
						events: {
							dataRequested: function() {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(true);
									}
								});
							},
							dataReceived: function() {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(false);
									}
								});

								if (jQuery.type(fnCallback) === "function") {
									fnCallback.apply(this, arguments);
								}
							}
						}
					});

				}
			},

			fnCompleted: function(oController) {
				return function() {
					if (!oController.getViewProperty("/List/IS_IDEA_LIST") && !oController.getViewProperty("/List/IS_GAMIFICATION_REPORT")) {
						oController.onDownloadReward();
					} else {
						return null;
					}
				};
			},

			getExportControl: function() {
				if (this.getViewProperty("/List/GAMIFICATION_DETAIL_OPEN")) {
					return this.byId('gamificationReportTableDetail');
				} else {
					return this.getList();
				}
			},

			getBindingParameter: function() {
				var sVariant, sVariantFilter;
				sVariant = this.getViewProperty("/List/VARIANT");
				sVariantFilter = this.getCurrentVariant().FILTER;
				var sSearchTerm = this.getViewProperty("/List/SEARCH");
				var aTags = this.getViewProperty("/List/TAGS");
				var sCampaignId = this.getViewProperty("/List/CAMPAIGN");

				var aTagId = jQuery.map(aTags, function(oTag) {
					return oTag.ID;
				});

				return {
					Variant: sVariant,
					VariantFilter: sVariantFilter,
					SearchTerm: sSearchTerm,
					TagIds: aTagId,
					CampaignId: sCampaignId
				};
			},

			getList: function() {
				var oFragmentShow = this.getViewProperty("/List/IS_GAMIFICATION_REPORT") ? this.byId(
					"rewardTableGamificationFragment--gamificationReportTable") : this.byId("rewardTableFragment--objectTable");
				return this.getViewProperty("/List/IS_IDEA_LIST") ? this.byId("rewardListFragment--objectlist") : oFragmentShow;
			},

			getVariantVisibility: function(sVariant) {
				var aVariants, bVisible;

				aVariants = this.getModel("list").getProperty("/Variants/Values");

				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];

					if (oVariant.ACTION === sVariant) {
						bVisible = oVariant.VISIBLE;
					}
				}

				return bVisible;
			},

			getExportPrefix: function() {
				if (!this.getViewProperty("/List/IS_IDEA_LIST")) {
					if (this.getViewProperty("/List/IS_GAMIFICATION_REPORT")) {
						return this.getText("EXPORT_PREFIX_GAMIFICATION");
					}
					return this.getText("EXPORT_PREFIX_REWARD");
				} else {
					return this.getText("EXPORT_PREFIX_IDEA");
				}
			},

			getItemTemplate: function() {
				return this.getFragment("sap.ino.vc.reward.fragments.RewardListItem");
			},

			isDownloaded: function() {
				var oTable = this.getList();
				var aSelect = oTable.getSelectedIndices();
				var bDownloaded = false;
				if (aSelect.length) {
					for (var i = 0; i < aSelect.length; i++) {
						if (oTable.getContextByIndex(aSelect[i]).getProperty("DOWNLOAD_COUNT") > 0) {
							bDownloaded = true;
							break;
						}
					}
				}
				return bDownloaded;
			},

			initApplicationObjectChangeListeners: function() {
				var that = this;
				var aActions = ["create", "del", "modifyAndSubmit", "executeStatusTransition", "forward"];

				var fnAOChangeListener = function(oEvent) {
					var sAction = oEvent.getParameter("actionName");
					if (sAction && aActions.indexOf(sAction) > -1 && oEvent.getParameter("object").getMetadata().getName() ===
						"sap.ino.commons.models.object.RewardList") {
						that.bindList();
					}
				};

				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
			},

			show: function(oEvent, oObject) {
				var oQuery;
				var sVariant;
				if (oEvent && oEvent.getParameter) {
					var oArguments = oEvent.getParameter("arguments");
					oQuery = oArguments["?query"];
					sVariant = oArguments.variant;
				} else {
					sVariant = oObject.variant;
					oQuery = oObject;
				}

				if (sVariant === this.list.Variants.Values[4].ACTION) {
					//Hide the Campaign Filter when select the gamification variant
					this.setViewProperty("/List/IS_GAMIFICATION_REPORT", true);
				} else {
					this.setViewProperty("/List/IS_GAMIFICATION_REPORT", false);
				}
				var that = this;

				var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
				this.setViewProperty("/isre", sVariant || sDefaultVariant);

				sVariant = this.getViewProperty("/isre");
				var oVariant = this.getVariant(sVariant);
				this.setViewProperty("/List/VARIANT", oVariant.ACTION);

				var bBound = this.getList() && this.getList().isBound("rows") || this.getList() && this.getList().isBound("items");

				var bRebindRequired = this.hasStateChanged(this.getCurrentRoute(), sVariant, oQuery, Device.orientation.portrait);
				bRebindRequired = bRebindRequired || this._bListChanged;
				this._bListChanged = false;

				if (!bBound || bRebindRequired) {
					// update the VISIBILITY flag of all variants for binding in Filter
					this.setVariantVisibility();

					this.setParameters(oQuery, oVariant);

					var iOrientation = this.getViewProperty("/ORIENTATION");
					this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

					//check visiablity for current Variiant
					var bVisible = this.getVariantVisibility(sVariant);

					if (bVisible === false || typeof(bVisible) === "undefined") {
						MessageBox.show(
							that.getText("NOT_AUTHORIZED_MESSAGE"),
							MessageBox.Icon.INFORMATION,
							that.getText("NOT_AUTHORIZED_DIALOG_TITLE"), [MessageBox.Action.OK],
							function() {
								that.navigateTo("home");
							});
						return;
					}

					this.bindList();
				}
			},

			setParameters: function(oQuery, oVariant) {
				oQuery = oQuery || {};
				var sVariant = oVariant.ACTION;
				this.setViewProperty("/List/TAGCLOUD", false);
				this.setViewProperty("/List/IDEA_NAVIGATION_SECTION", "sectionRewards");
				this.setViewProperty("/DISABLE_ORIENTATION", true);
				this.setViewProperty("/List/VARIANT", oVariant.ACTION);
				this.setViewProperty("/List/MANAGE", oVariant.MANAGE || oVariant.CAMPAIGN_MANAGE);
				if (this.byId("sapInoMassDeleteBtn")) {
					this.byId("sapInoMassDeleteBtn").setVisible(sVariant !== mVariant.REWARD_EXPORTED);
				}
				if (sVariant === mVariant.REWARD_QUALIFIED) {
					this.setViewProperty("/List/IS_IDEA_LIST", true);
					this.setViewProperty("/List/HIDE_PPT_EXPORT", false);
					if (!this._sResizeListId) {
						this._sResizeListId = this.attachListControlResized(this.getList());
					}
				} else {
					this.setViewProperty("/List/IS_IDEA_LIST", false);
					this.setViewProperty("/List/HIDE_PPT_EXPORT", true);
					if (this._sResizeRegId) {
						this.detachListControlResized(this.getList());
					}
				}
			},

			setVariantVisibility: function() {
				var aVariants = this.getModel("list").getProperty("/Variants/Values");

				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];
					var bIsManage = oVariant.MANAGE || false;
					var bIsExpert = oVariant.EXPERT || false;
					var bIsCampaignManage = oVariant.CAMPAIGN_MANAGE || false;

					var bVisible = (!bIsManage && !bIsExpert && !bIsCampaignManage) ||
						// user has expert role and variant is for experts
						(bIsExpert && Configuration.hasCurrentUserPrivilege("sap.ino.ui::expert")) ||
						// user has campaign manager role and variant is for campaign manager
						(bIsCampaignManage && (Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager") ||
								Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute")) &&
							Configuration.getSystemSetting("sap.ino.config.REWARD_ACTIVE") === "1") ||
						// user has general backoffice privileges and variant has manage flag
						(bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));
					//Gamification enable the will display the list
					if (aVariants[i].ACTION === mVariant.REWARD_GAMIFICATION) {
						bVisible = bVisible && !!this.getView().getModel("config").getProperty("/ENABLE_GAMIFICATION");
					}

					this.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
				}
			},

			onObjectListUpdateFinished: function(event) {
				var parameters = event && event.getParameters();

				if (parameters && parameters.total > 0) {
					this.setViewProperty("/List/SELECT_ALL_ENABLE", true);
				} else {
					this.setViewProperty("/List/SELECT_ALL_ENABLE", false);
				}

				BaseController.prototype.onObjectListUpdateFinished.apply(this, arguments);
			},
			onPressCurrentValue: function(oEvent) {
				var oSource = oEvent.getSource();
				var sPath = oSource.getBindingInfo("text").binding.getContext().sPath;
				var oDataModel = this.getModel("data");
				var iDimensionId, iIdentityId, sUserName;
				if (sPath) {
					iDimensionId = oDataModel.getProperty(sPath + "/DIMENSION_ID");
					iIdentityId = oDataModel.getProperty(sPath + "/IDENTITY_ID");
					sUserName = oDataModel.getProperty(sPath + "/USER_NAME");
				}
				var oGamificationDialog = this.getGamificationDetailDialog();
				//var aFilter = new Filter([new Filter("DIMENSION_ID", FilterOperator.EQ, iDimensionId),new Filter("IDENTITY_ID", FilterOperator.EQ, iIdentityId)], true);
				var sDetailOdataPath = "data>/SearchGamificationReportDetailParams(dimensionId=" + iDimensionId + "," + "identityId=" + iIdentityId +
					"," + "searchLanguage='" + Configuration.getCurrentUser().LOCALE + "'" + ")/Results";
				var oDetailSorder = new sap.ui.model.Sorter("CREATED_AT", true);
				this.byId('gamificationReportTableDetail').bindAggregation("rows", {
					path: sDetailOdataPath,
					sorter: oDetailSorder
				});
				oGamificationDialog.setTitle(this.getText("IDEA_LIST_REWARD_LIST_GAMIFICATION_REPORT_DETAIL_VIEW", sUserName));
				this.setViewProperty("/List/GAMIFICATION_DETAIL_OPEN", true);
				oGamificationDialog.open();
			},
			onPressGamificationDetailClose: function(oEvent) {
				var oGamificationDialog = this.getGamificationDetailDialog();
				this.setViewProperty("/List/GAMIFICATION_DETAIL_OPEN", false);
				oGamificationDialog.close();
			},
			getGamificationDetailDialog: function() {
				if (!this._oGamifcationDialog) {
					this._oGamifcationDialog = this.createFragment("sap.ino.vc.reward.fragments.RewardGamificationReportDetail", this.getView().getId());
					this.getView().addDependent(this._oGamifcationDialog);
				}
				return this._oGamifcationDialog;
			},
			onGamiTableSelectionChange: function(oEvent) {
				var oTable = this.getList();
				var oExportBtn = this.byId("sapInoMassExportBtn");
				var aSelectRows = oTable.getSelectedIndices();
				if (aSelectRows.length) {
					oExportBtn.setEnabled(true);
				} else {
					oExportBtn.setEnabled(false);
				}
			},
			onGamiTableDetailSelectionChange: function(oEvent) {
				var oTable = this.byId("gamificationReportTableDetail");
				var oExportBtn = this.byId("exportDetailBtn");
				var aSelectRows = oTable.getSelectedIndices();
				if (aSelectRows.length) {
					oExportBtn.setEnabled(true);
				} else {
					oExportBtn.setEnabled(false);
				}

			},
			onOpenSubmitter: function(oEvent) {
				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty(oSource.getBindingContext("data").sPath + "/EMPLOYEE_ID");
				this.openIdentityQuickView(oSource, iIdentityId);
			}			
		}));

	oList.list = mList;
	oList.routes = mRoutes;

	return oList;
});