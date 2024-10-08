sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ino/controls/OrientationType",
    "sap/ui/Device",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/mixins/TagGroupMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/commons/mixins/ExtensibilityMixin",
    "sap/ui/core/mvc/ViewType"
], function(BaseController, OrientationType, Device, Sorter, Filter, FilterOperator, JSONModel, Configuration, TopLevelPageFacet,
	ObjectListFormatter, TagGroupMixin, FollowMixin, RegistrationMixin, ExtensibilityMixin, ViewType) {
	"use strict";

	var mOrder = {
		ASC: "ASC",
		DESC: "DESC"
	};

	var mSort = {
		NONE: '',
		SEARCH_SCORE: "SEARCH_SCORE",
		NAME: "tolower(NAME)",
		REGISTER_TO: "REGISTER_TO",
		SUBMIT_TO: "SUBMIT_TO",
		VALID_TO: "VALID_TO",
		CREATED_AT: "CREATED_AT",
		CHANGED_AT: "CHANGED_AT"
	};

	var mVariant = {
		ALL: "all",
		ACTIVE: "active",
		OPEN: 'open',
		FUTURE: "future",
		PAST: "past",
		MANAGE: "manage",
		DRAFT: "draft",
		PUBLISH: "publish",
		SUBMITTABLE: "submittable",
		REGISTERED: "registered"
	};

	var mFilter = {
		NONE: undefined,
		ACTIVE: "activeCampaigns",
		OPEN: "openCampaigns",
		FUTURE: "futureCampaigns",
		PAST: "pastCampaigns",
		MANAGE: "managedCampaigns",
		DRAFT: "draftCampaigns",
		PUBLISH: "publishCampaigns",
		SUBMITTABLE: "submittableCampaigns",
		REGISTERED: "registeredCampaigns"
	};

	var mListContext = {
		CAMPAIGN: "campaignlist",
		CAMPAIGN_VARIANT: "campaignlistvariant"
	};
	var mListBlogVariant = {
		NULL: "",
		YES: "1",
		NO: "0"
	};
	var mList = {
		ADJUSTMENT_TITLE: "IDEA_LIST_TIT_ADJUSTMENT",
		NAME: "CAMPAIGN_LIST_TIT_NAME",
		MANAGEDNAME: "CAMPAIGN_LIST_TIT_MANAGEDNAME",
		Filter: {},
		QuickSorter: [
			{
				TEXT: "SORT_MIT_MOST_RECENT",
				ACTION: mSort.CREATED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_LATEST_CHANGE",
				ACTION: mSort.CHANGED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }
		],
		Sorter: {
			Values: [{
				TEXT: "SORT_MIT_CAMPAIGN_END",
				ACTION: mSort.VALID_TO,
				DEFAULT_ORDER: mOrder.ASC
            }, {
				TEXT: "SORT_MIT_REGISTER_TO",
				ACTION: mSort.REGISTER_TO,
				DEFAULT_ORDER: mOrder.ASC
            }, {
				TEXT: "SORT_MIT_SUBMIT_TO",
				ACTION: mSort.SUBMIT_TO,
				DEFAULT_ORDER: mOrder.ASC
            }, {
				TEXT: "SORT_MIT_TITLE",
				ACTION: mSort.NAME,
				DEFAULT_ORDER: mOrder.ASC
            }],
			Limit: 2
		},
		Order: {
			Values: [{
				TEXT: "ORDER_MIT_ASC",
				ACTION: mOrder.ASC
		    }, {
				TEXT: "ORDER_MIT_DESC",
				ACTION: mOrder.DESC
		    }]
		},
		Variants: {
			DEFAULT_VARIANT: mVariant.ALL,
			TITLE: "CAMPAIGN_LIST_TIT_VARIANTS",
			Values: [{
				TEXT: "CAMPAIGN_LIST_MIT_ALL",
				ACTION: mVariant.ALL,
				FILTER: mFilter.NONE,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.NAME,
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_ACTIVE",
				ACTION: mVariant.ACTIVE,
				FILTER: mFilter.ACTIVE,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_OPEN",
				ACTION: mVariant.OPEN,
				FILTER: mFilter.OPEN,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_FUTURE",
				ACTION: mVariant.FUTURE,
				FILTER: mFilter.FUTURE,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_CLOSED",
				ACTION: mVariant.PAST,
				FILTER: mFilter.PAST,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_REGISTERED",
				ACTION: mVariant.REGISTERED,
				FILTER: mFilter.REGISTERED,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.REGISTER_TO,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				VISIBLE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_MANAGE",
				ACTION: mVariant.MANAGE,
				FILTER: mFilter.MANAGE,
				INCLUDE_DRAFT: true,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				VISIBLE: true,
				COUNT: "0",
				MANAGE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_DRAFT",
				ACTION: mVariant.DRAFT,
				FILTER: mFilter.DRAFT,
				INCLUDE_DRAFT: true,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				VISIBLE: true,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				MANAGE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_PUBLISH",
				ACTION: mVariant.PUBLISH,
				FILTER: mFilter.PUBLISH,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.VALID_TO,
				VISIBLE: true,
				HIERARCHY_LEVEL: "1",
				COUNT: "0",
				MANAGE: true
            }, {
				TEXT: "CAMPAIGN_LIST_MIT_OPEN",
				ACTION: mVariant.SUBMITTABLE,
				FILTER: mFilter.SUBMITTABLE,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.SUBMIT_TO,
				COUNT: "0",
				VISIBLE: true,
				HIERARCHY_LEVEL: "1",
				MANAGE: true
            }]
		}
	};

	var oCampaignList = BaseController.extend("sap.ino.vc.campaign.List", jQuery.extend({}, TopLevelPageFacet, TagGroupMixin, FollowMixin,
		RegistrationMixin, {

			/* Controller reacts when these routes match */
			routes: ["campaignlist", "campaignlistvariant"],

			// make sure the vaiant filter is focused, as always there can be timing problems => explicitly focus the control on route match
			initialFocus: "mainFilterButton",

			/* ListModel defining filter, sorter and variants of the list */
			list: mList,

			formatter: ObjectListFormatter,

			/* ViewModel storing the current configuration of the list */
			view: {
				NAME: "CAMPAIGN_LIST",
				List: {
					SORT: mSort.NAME,
					ORDER: undefined,
					MANAGE: false,
					VARIANT: mVariant.ALL,
					TAGS: [],
					Default: {
						SORT: mSort.NAME,
						ORDER: undefined,
						VARIANT: mVariant.ALL
					},
					"RESP_CODE": "",
					"HAS_BLOG": "",
					"IS_SHOW_MORE_FILTER": false,
					"IS_FILTER_SUBPAGE": true,
					"TAGCLOUD": true,
					"TAGCLOUD_EXPABLE": true,
					"TAGCLOUD_EXP": false,
					"TAGCLOUD_BAR_VISIBLE": false
				},
				ORIENTATION: Configuration.getPersonalize().CAMPAIGN_VIEW ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE
			},

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);

				this.oViewModel = this.getModel("view") || new JSONModel({});
				this.oViewModel.setData(this.view, true);

				this.getList().addStyleClass(this.getPortraitStyle());
				this.getList().setWrapping(true);

				this.getList().attachUpdateFinished(this.onUpdateFinished, this);
			},

			//TODO remove toplevelpagefacet, implement show function w/ signature to 1: route 2: query
			onRouteMatched: function(oEvent, oObject) {
				var oQuery;
				var sVariant;

				if (oEvent && oEvent.getParameter) {
					var oArguments = oEvent.getParameter("arguments");
					this._sRoute = oEvent.getParameter("name");
					oQuery = oArguments["?query"];
					sVariant = oArguments.variant;
				} else {
					this._sRoute = oEvent;
					oQuery = oObject;
					sVariant = oObject.variant;
				}
                if(this.getVariant(sVariant) && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")){
				    var bChangedShowBackoffice = this.getVariant(sVariant).MANAGE ? true : false;
				    this.getModel("component").setProperty("/SHOW_BACKOFFICE",bChangedShowBackoffice);
				} 
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				var sDefaultVariant = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access") && bShowBackoffice ? mVariant.MANAGE :
					this.getListProperty("/Variants/DEFAULT_VARIANT");

				this.setViewProperty("/List/VARIANT", sVariant || sDefaultVariant);

				sVariant = this.getViewProperty("/List/VARIANT");

				var aSorter, aQuickSorter;
				var oVariant = jQuery.extend(true, {}, this.getVariant(sVariant));
				this.checkSort(oQuery, oVariant.DEFAULT_SORT);
				this.changeDefaultSortOfVariant(oVariant, oQuery);
				var bBound = this.getList().isBound("items");

				// even if there is no query defined, we need to add the default sorter that is applied
				if (!oQuery || !oQuery.sort) {
					var sDefaultSort = oVariant.DEFAULT_SORT;
					var sDefaultOrder = this.getSort(sDefaultSort)[0].DEFAULT_ORDER;

					oQuery = oQuery || {};
					oQuery.sort = oQuery.sort || sDefaultSort;

					// enhance for sort combination
					oQuery.sort = oQuery.sort + " " + (oQuery.order || sDefaultOrder);
				}

				var bRebindRequired = this.hasStateChanged(this._sRoute, sVariant, oQuery, Device.orientation.portrait);

				if (!bBound || bRebindRequired) {
					// update the VISIBILITY flag of all variants for binding in Filter
					this.setVariantVisibility();

					this.setParameters(oQuery, oVariant);

					aSorter = this.getSort(this.getViewProperty("/List/SORT"));
					aQuickSorter = this.getQuickSort(this.getViewProperty("/List/QUICKSORT"));

					this.setSorter(aQuickSorter.concat(aSorter));
					this.updateFilter();

					//TODO move to ListPage
					var iOrientation = this.getViewProperty("/ORIENTATION");
					this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

					this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));
					this.bindList();
					this.initialSorterItems();
					if (this.isFilterVisible()) {
						this.bindTagCloud();
					}
				}

				/* used to prevent opening and closing the filter while changing the variant, etc. */
				this._bInnerViewNavigation = true;

				// do not change the search context in case of global search
				if (this.bGlobalSearchContext) {
					return;
				}
				//search count 
				var search = oQuery.search || "";
				var sRespListValueCode = this.getViewProperty("/List/RESP_CODE") || '';
				var sHasBlog = this.getViewProperty("/List/HAS_BLOG") || '';
				var aTags = this.getViewProperty("/List/TAGS");
				var tagGroup = {};
				var tagGroupKey = [];

				aTags.forEach(function(item, index) {
					if (!tagGroup[item.ROOTGROUPID]) {
						tagGroup[item.ROOTGROUPID] = [];
						tagGroup[item.ROOTGROUPID].push(item.ID);
						tagGroupKey.push(item.ROOTGROUPID);
					} else {
						tagGroup[item.ROOTGROUPID].push(item.ID);
					}
				});

				var searchObject = {
					searchToken: window.decodeURIComponent(search),
					resp_code: sRespListValueCode,
					has_camp_blog: sHasBlog,
					tagTokens: tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
					tagTokens1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
					tagTokens2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
					tagTokens3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
					tagTokens4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : ""
				};
				var aVariants = this.getModel("list").getProperty("/Variants/Values");
				var oCampaignModel = this.getModel("list");
				Configuration.getCampaignFilterCount(searchObject, oCampaignModel, aVariants);

				this.setHelp("CAMPAIGN_LIST");
			},

			onAfterShow: function() {
				// 			this._bPreviouslyFullscreen = this.getFullScreen();
				// 			if (!this._bPreviouslyFullscreen) {
				// 				this.setFullScreen(true);
				// 			}
			},

			onBeforeHide: function() {
				// 			this.setFullScreen(this._bPreviouslyFullscreen);
			},

			setVariantVisibility: function() {
				var aVariants = this.getModel("list").getProperty("/Variants/Values");
				// var CampaignFilterModel = Configuration.getCampaignFilterCount(sSearchTerm);
				// // var count = Configuration.getCampaignFilterCountProperty();

				// for (var i = 0; i < aVariants.length; i += 1) {
				// 	this.getModel("list").setProperty("/Variants/Values/" + i + "/COUNT", CampaignFilterModel[this.getModel("list").getProperty(
				// 		"/Variants/Values/" + i + "/ACTION")]);

				// }
				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];
					var bIsManage = oVariant.MANAGE || false;

					var bVisible = (!bIsManage) ||
						// user has general backoffice privileges and variant has manage flag
						(bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));
					this.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
				}
			},

			getPortraitStyle: function() {
				return "sapInoCampaignListCardItems";
			},

			getList: function() {
				return this.byId("objectlist");
			},

			getBindingParameter: function() {
				var sVariant, sVariantFilter;
				sVariant = this.getViewProperty("/List/VARIANT");
				sVariantFilter = this.getCurrentVariant().FILTER;
				var sSearchTerm = this.getViewProperty("/List/SEARCH");
				var aTags = this.getViewProperty("/List/TAGS");
				var aTagId = jQuery.map(aTags, function(oTag) {
					return oTag.ID;
				});
				var tagGroup = {};
				var tagGroupKey = [];

				aTags.forEach(function(item, index) {
					if (!tagGroup[item.ROOTGROUPID]) {
						tagGroup[item.ROOTGROUPID] = [];
						tagGroup[item.ROOTGROUPID].push(item.ID);
						tagGroupKey.push(item.ROOTGROUPID);
					} else {
						tagGroup[item.ROOTGROUPID].push(item.ID);
					}
				});

				return {
					Variant: sVariant,
					VariantFilter: sVariantFilter,
					SearchTerm: sSearchTerm,
					TagIds: aTagId,
					tagGroup: tagGroup,
					tagGroupKey: tagGroupKey
				};
			},

			getBindingPath: function(oQuery) {
				var iFilterBackoffice = this._check4ManagingList() ? 1 : 0;
				if (!oQuery || oQuery === {} ||
					(oQuery.search === undefined && oQuery.tags === undefined && oQuery.variant === undefined)) {
					return {
						Path: "CampaignFull"
					};
				}
				return {
					Path: "CampaignSearchParams(searchToken='" + (oQuery.search || "") + "'," +
						"tagsToken='" + (oQuery.tagGroup[oQuery.tagGroupKey[0]] ? oQuery.tagGroup[oQuery.tagGroupKey[0]].join(",") : "") + "'," +
						"tagsToken1='" + (oQuery.tagGroup[oQuery.tagGroupKey[1]] ? oQuery.tagGroup[oQuery.tagGroupKey[1]].join(",") : "") + "'," +
						"tagsToken2='" + (oQuery.tagGroup[oQuery.tagGroupKey[2]] ? oQuery.tagGroup[oQuery.tagGroupKey[2]].join(",") : "") + "'," +
						"tagsToken3='" + (oQuery.tagGroup[oQuery.tagGroupKey[3]] ? oQuery.tagGroup[oQuery.tagGroupKey[3]].join(",") : "") + "'," +
						"tagsToken4='" + (oQuery.tagGroup[oQuery.tagGroupKey[4]] ? oQuery.tagGroup[oQuery.tagGroupKey[4]].join(",") : "") + "'," +
						"filterName='" + (oQuery.variant || "") + "'," +
						"filterBackoffice=" + (iFilterBackoffice || "0") + ")/Results"
				};
			},

			bindList: function() {
				this.saveState();

				var oBindingParameter = this.getBindingParameter();
				var oBindingData = this.getBindingPath({
					search: oBindingParameter.SearchTerm,
					tags: oBindingParameter.TagIds,
					tagGroup: oBindingParameter.tagGroup,
					tagGroupKey: oBindingParameter.tagGroupKey,
					variant: oBindingParameter.VariantFilter
				});
				this.setPath("data>/" + oBindingData.Path);

				BaseController.prototype.bindList.apply(this);
			},

			includeDrafts: function() {
				return this.getCurrentVariant().INCLUDE_DRAFT;
			},

			bindTagCloud: function() {
				var oBindingParameter = this.getBindingParameter();

				var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagcloud_campaigns.xsjs";

				var aParameter = [];
				if (!this.includeDrafts()) {
					aParameter.push("EXCL_STATUS=sap.ino.config.CAMP_DRAFT");
				}
				if (oBindingParameter && oBindingParameter.TagIds) {
					jQuery.each(oBindingParameter.TagIds, function(key, iValue) {
						aParameter.push("TAG=" + iValue);
					});
				}
				if (oBindingParameter.SearchTerm && oBindingParameter.SearchTerm.length > 0) {
					aParameter.push("SEARCHTERM=" + oBindingParameter.SearchTerm);
				}
				if (oBindingParameter.VariantFilter) {
					aParameter.push("FILTERNAME=" + oBindingParameter.VariantFilter);
				}
				if (this.getViewProperty("/List/RESP_CODE")) {
					aParameter.push("RESP_VALUE_CODE=" + this.getViewProperty("/List/RESP_CODE"));
				}
				if (this.getViewProperty("/List/HAS_BLOG")) {
					aParameter.push("HAS_BLOG=" + this.getViewProperty("/List/HAS_BLOG"));
				}
				sPath = sPath + "?";
				if (aParameter.length > 0) {
					sPath = sPath + "&" + aParameter.join("&");
				}
				// swap last path for refresh checking
				// check whether refresh is necessary
				if (this._lastTagServicePath === sPath) {
					return;
				}
				this._attachRequestCompleted(sPath);
				this._lastTagServicePath = sPath;
			},

			_attachRequestCompleted: function(sPath) {
				var oController = this;
				var sOtherTxt = oController.getText("CAMPAIGN_LIST_FLD_TAG_GROUP_OTHER");
				var oTagModel = new sap.ui.model.json.JSONModel(sPath);
				oTagModel.attachRequestCompleted(null, function() {
					var oRankedTag = oTagModel.getData().RANKED_TAG;
					var aTagGroup = oTagModel.getData().TAG_GROUP;
					var oTagGroups = oController.groupByTagGroup(oRankedTag, oController.getViewProperty("/List/TAGS"), sOtherTxt);
					jQuery.each(oTagGroups, function(element, object) {
						if (object.GROUP_NAME === "Other") {
							aTagGroup.push(object);
						}
					});
					oController.setTagCloudProperty(oTagGroups, oTagModel.getData().WITHOUT_GROUP !== "X");
					oTagModel.setData({
						"RANKED_TAG": oTagGroups,
						"TAG_GROUP": aTagGroup
					}, false);
					oController.setFilterModel(oTagModel, "tag");
				}, oTagModel);
			},

			getItemTemplate: function() {
				var sRequiredTemplate;
				var bIsManaged = this._check4ManagingList();
				if (bIsManaged) {
					sRequiredTemplate = "Managed_Protrait";
				}

				if (bIsManaged) {

					if (this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE) {
						sRequiredTemplate = "Managed_Landscape";
					}
				} else if ((!Device.system.desktop && Device.orientation.landscape) ||
					(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
					sRequiredTemplate = "Landscape";
				} else {
					sRequiredTemplate = "Portrait";

				}

				var oTemplate;
				switch (sRequiredTemplate) {
					case "Managed_Landscape":
						oTemplate = this.getFragment("sap.ino.vc.campaign.fragments.CampaignListItem");
						break;
					case "Landscape":
						oTemplate = this.getFragment("sap.ino.vc.campaign.fragments.FlatListItem");
						break;
					case "Portrait":
						oTemplate = this.getFragment("sap.ino.vc.campaign.fragments.CardListItem");
						break;
					case "Managed_Protrait":
						oTemplate = this.getFragment("sap.ino.vc.campaign.fragments.ManagedCardListItem");
						break;
					default:
						break;
				}
				return oTemplate;
			},

			//TODO move to ListPage
			onOrientationChange: function(eOrientation) {
				var bIsManaged = this._check4ManagingList();
				if (this.getList()) {
					if (bIsManaged) {
						if (this.getPortraitStyle) {
							this.getList().addStyleClass(this.getPortraitStyle());
						}
						if (this.getLandscapeStyle) {
							this.getList().removeStyleClass(this.getLandscapeStyle());
						}
					}
				}
				if (this.getList()) {
					if (bIsManaged || eOrientation === OrientationType.LANDSCAPE || eOrientation.landscape) {

						if (eOrientation === OrientationType.LANDSCAPE) {
							if (this.getPortraitStyle) {
								this.getList().removeStyleClass(this.getPortraitStyle());
							}
							if (this.getLandscapeStyle) {
								this.getList().addStyleClass(this.getLandscapeStyle());
							}

						}
					} else {
						if (this.getPortraitStyle) {
							this.getList().addStyleClass(this.getPortraitStyle());
						}
						if (this.getLandscapeStyle) {
							this.getList().removeStyleClass(this.getLandscapeStyle());
						}
					}

					this.getList().setWrapping(!(eOrientation === OrientationType.LANDSCAPE));
				}
			},
			setParameters: function(oQuery, oVariant) {
				BaseController.prototype.setParameters.apply(this, arguments);
				// var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
				this.setViewProperty("/List/MANAGE", oVariant.MANAGE);
				this.setViewProperty("/List/TAGCLOUD", true);
				oQuery = oQuery || {};
				var sRespList = oQuery.respCode;
				var sHasBlog = oQuery.hasBlog;
				this.setViewProperty("/List/RESP_CODE", sRespList);
				this.setViewProperty("/List/HAS_BLOG", sHasBlog);
				this.removeSubFilterPageContent();
				this.addSubFilterPageContent(this.getAdditionalFilter());
			},

			onVariantPress: function(sVariantAction, oEvent) {
				BaseController.prototype.onVariantPress.apply(this, [sVariantAction, oEvent, "campaignlistvariant", "campaignlist"]);
			},

			updateFilter: function() {
				var aFilters = [];
				this.setFilter([]);
				if (!this.getCurrentVariant().INCLUDE_DRAFT && !this.isCampaignDraftFilterExisted()) {
					aFilters.push(new Filter("STATUS_CODE", FilterOperator.NE, "sap.ino.config.CAMP_DRAFT"));
				}
				var sRespListValueCode = this.getViewProperty("/List/RESP_CODE");
				if (sRespListValueCode) {
					aFilters.push(new Filter("RESP_CODE", FilterOperator.EQ, sRespListValueCode));
				}
				var sHasBlog = this.getViewProperty("/List/HAS_BLOG");
				switch (sHasBlog) {
					case "1":
						aFilters.push(new Filter("BLOG_COUNTS", FilterOperator.GE, 1));
						break;
					case "0":
						aFilters.push(new Filter("BLOG_COUNTS", FilterOperator.EQ, null));
						break;
					default:
						break;
				}
				if (aFilters.length > 0) {
					this.addFilter(new Filter({
						filters: aFilters,
						and: true
					}));
				}
			},

			isCampaignDraftFilterExisted: function() {
				var aExistFilters = this.getFilter();
				var oFilter;

				for (var iIdx = 0; iIdx < aExistFilters.length; iIdx++) {
					oFilter = aExistFilters[iIdx];

					if (oFilter.aFilters && oFilter.aFilters.length > 0) {
						if (oFilter.aFilters[0].oValue1 === "sap.ino.config.CAMP_DRAFT" && oFilter.aFilters[0].sOperator === FilterOperator.NE &&
							oFilter.aFilters[
								0].sPath === "STATUS_CODE") {
							return true;
						}
					}
				}
				return false;
			},

			onItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("campaign", {
						id: oContext.getProperty("ID")
					});
				}
			},

			onCardItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oCampaignCard = oItem.getAggregation("content")[0];
				oCampaignCard.getFocusDomRef().focus();
			},

			onCreateIdea: function(oEvent) {
				this.navigateTo("idea-create", {
					query: {
						campaign: oEvent.getParameter("campaignId")
					}
				});
			},

			onSetFilterBarVisible: function() {
				this.bindTagCloud();
			},

			onApplyFilter: function() {
				var oFilterDialog = this.getFilterDialog();
				if (JSON.stringify(this.getViewModelBackup()) === JSON.stringify(this.getViewProperty("/"))) {
					oFilterDialog.close();
					return;
				}

				var oQuery = this.getQuery();

				var sVariant = this.getViewProperty("/List/VARIANT");
				var route = this.getRoute();
				// var isAll = sVariant === this.getListProperty("/Variants/DEFAULT_VARIANT");
				var params = {
					query: oQuery
				};
				// if (!isAll) {
				params.variant = sVariant;
				// }

				// this.navigateTo(this.getRoute(!isAll), params, true, true);
				this.navigateTo(this.getRoute(true), params, true, true);

				oFilterDialog.close();
			},

			formatObjectListVariantsVisible: function(bIsManage, bIsExpert) {
				// all list variants are visible by default
				return true;
			},

			_check4ManagingList: function() {
				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");

				if (bBackoffice) {
					var sVariant = this.getViewProperty("/List/VARIANT");
					var aVariants = this.getListProperty("/Variants/Values");

					var vVariant = jQuery.grep(aVariants, function(oVariant) {
						return oVariant.ACTION === sVariant;
					});

					vVariant = (vVariant && vVariant.length > 0) ? vVariant[0] : {};

					return vVariant.MANAGE || false;
				}

				return false;
			},

			onCampaignsListItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("campaign", {
						id: oContext.getProperty("ID")
					});
				}
			},

			onOpenCampaignSettings: function(oEvent) {
				var oSource = oEvent.getSource();
				var oContext = oSource.getBindingContext("data");
				this.navigateToByURLInNewWindow(Configuration.getCampaignSettingsURL(oContext.getProperty("ID")));
			},
			//Add more filter
			createState: function(sRoute, sVariant, oQuery, bPortrait) {
				var oState = BaseController.prototype.createState.apply(this, arguments);
				oState.query.status = oQuery.status;
				oState.query.respCode = oQuery.respCode;
				oState.query.hasBlog = oQuery.hasBlog;
				return oState;
			},
			getQuery: function() {
				var oQuery = {};
				var sSort = this.getViewProperty("/List/SORT");
				//var sOrder = this.getViewProperty("/List/ORDER");
				var sRespList = this.getViewProperty("/List/RESP_CODE");
				var sHasBlog = this.getViewProperty("/List/HAS_BLOG");
				var aTags = this.getViewProperty("/List/TAGS");
				var quickSort = this.getViewProperty('/List/QUICKSORT');
				var search = this.getViewProperty('/List/SEARCH');
				if (sSort) {
					oQuery.sort = sSort;
					/*if (sOrder) {
						oQuery.order = sOrder;
					}*/
				}
				if (sRespList) {
					oQuery.respCode = sRespList;
					//oQuery.respName = sRespName;
				}
				if (sHasBlog) {
					oQuery.hasBlog = sHasBlog;
				}
				if (aTags && aTags.length > 0) {
					oQuery.tags = JSON.stringify(aTags);
				}

				if (quickSort) {
					oQuery.quickSort = quickSort;
				}

				if (search) {
					oQuery.search = search;
				}
				return oQuery;
			},
			addSubFilterPageContent: function(vContent) {

				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				aPages[0].getContent()[0].addItem(vContent);
			},

			removeSubFilterPageContent: function() {

				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oFilterContainer = aPages[0].getContent()[0];
				if (oFilterContainer.getItems().length > 2) {
					//oFilterContainer.removeItem(oFilterContainer.getItems()[3]);
					oFilterContainer.getItems()[2].destroy(true);
				}
			},
			onFilterRespListChange: function(oEvent) {
				var oSource = oEvent.getSource().getSelectedItem();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				var sKey = oSource.getProperty("key");
				//var sText = oSource.getProperty("text");
				this.setViewProperty("/List/RESP_CODE", sKey);
				this.navigateIntern(this.getQuery(), true, true);
			},
			onFilterHasBlogChange: function(oEvent) {
				var oSource = oEvent.getSource().getSelectedItem();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				var sKey = oSource.getProperty("key");
				//var sText = oSource.getProperty("text");
				this.setViewProperty("/List/HAS_BLOG", sKey);
				this.navigateIntern(this.getQuery(), true, true);
			},
			getAdditionalFilter: function() {
				var oFragment;
				oFragment = this.createFragment("sap.ino.vc.campaign.fragments.FilterItems", this.createIdForFilterElement());
				//var oFilterItemsLayout = this.getFilterElementById("filterItems");
				//this._extensibilityExtensionFilterItems(oFilterItemsLayout);
				// this._oIdeaFilterFrag = oFragment;

				return oFragment;
			},
			onMoreFilterChange: function(oEvent) {
				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oFilterContainer = aPages[0].getContent()[0];
				if (oFilterContainer.getItems().length > 2) {
					var _fncallback = function(oContainer) {
						//oContainer.$().find('*[tabindex="0"]')[oContainer.getItems().length - 1].focus();
						// hide busyindicator
						this.getFilterElementById("filterItems").setBusy(false);
					}.bind(this, oFilterContainer);

					this.setViewProperty("/List/IS_SHOW_MORE_FILTER", true);
					oEvent.getSource().setVisible(false);
					this.getFilterElementById("filterItems").setBusyIndicatorDelay(0).setBusy(true);

					setTimeout(function(fnCallback) {
						this.bindFilters(fnCallback);
					}.bind(this, _fncallback), 0);
				}
			},
			bindFilters: function(fnCallback) {
				var that = this;
				var oViewModel = this.getModel("view");
				var sRespListUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/campaign_filter_resp_values.xsjs";
				var oParameters = {
					CAMPAIGN_ID: this.getBindingParameter().CampaignId === undefined ? undefined : parseInt(this.getBindingParameter().CampaignId, 10)
				};
				var aHasBlog = [];
				aHasBlog.push({
					code: mListBlogVariant.NULL,
					text: ""
				});
				//CAMPAIGN_LIST_MIT_FILTER_YES
				aHasBlog.push({
					code: mListBlogVariant.YES,
					text: that.getText("CAMPAIGN_LIST_MIT_FILTER_YES")
				});
				aHasBlog.push({
					code: mListBlogVariant.NO,
					text: that.getText("CAMPAIGN_LIST_MIT_FILTER_NO")
				});
				oViewModel.setProperty("/HAS_BLOG", aHasBlog);
				jQuery.ajax({
					url: sRespListUrl,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					data: oParameters,
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: false,
					success: function(oResponse) {
						var aRes = oResponse.RespValues;
						if (aRes && aRes.length > 0) {
							aRes.sort(function(oPrev, oNext) {
								return oPrev.DEFAULT_TEXT.localeCompare(oNext.DEFAULT_TEXT);
							});
						}
						var oData = [{
							CODE: "",
							DEFAULT_LONG_TEXT: "",
							DEFAULT_TEXT: ""
						}].concat(aRes);
						oViewModel.setProperty("/resp", oData);
						if (fnCallback && typeof fnCallback === "function") {
							fnCallback();
						}
					}
				});

			},
			resetFilter: function() {
				var route = this.getRoute();
				this.setViewProperty("/List/RESP_CODE", "");
				this.setViewProperty("/List/HAS_BLOG", "");

				BaseController.prototype.resetFilter.apply(this, arguments);
			},
			onFilterReset: function() {
				this.setViewProperty("/List/TAGS", []);
				this.setViewProperty("/List/IS_TAGS_SELECTION", false);
				this.setViewProperty("/List/IS_SHOW_MORE_FILTER", false);
				this.resetFilter();
				if (!Device.system.desktop) {
					//no navigation on mobile phones yet
					return;
				}

				this.navigateIntern(this.getQuery(), true);
			},

			changeDefaultSortOfVariant: function(oVariant, oQuery) {
				if (oQuery && oQuery.search && (oVariant.ACTION === "manage" || oVariant.ACTION === "all")) {
					oVariant.DEFAULT_SORT = "SEARCH_SCORE";
				} else if (oVariant.ACTION === "manage" || oVariant.ACTION === "all") {
					jQuery.each(this.list.Variants.Values, function(iIdx, sSorter) {
						if (sSorter.ACTION === oVariant.ACTION) {
							oVariant.DEFAULT_SORT = sSorter.DEFAULT_SORT;
							return false;
						}
					});
				}
			},

			onOfficeToggle: function() {
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				bShowBackoffice = !bShowBackoffice;
				this.getModel("component").setProperty("/SHOW_BACKOFFICE", bShowBackoffice);
				var oVariant = {
					query: {},
					variant: ''
				};
				if (bShowBackoffice) {
					oVariant.variant = mVariant.MANAGE;
				} else {
					oVariant.variant = mVariant.ALL;
				}
				if(this.getViewProperty("/List/SEARCH")){
					oVariant.query.search = this.getViewProperty("/List/SEARCH");
					oVariant.query.sort = this.getViewProperty("/List/SORT");
				}
				this.navigateTo("campaignlistvariant", oVariant, true, true);
			}
			//end
		}));

	/* ListModel defining filter, sorter and variants of the list */
	oCampaignList.list = mList;
	oCampaignList.listContext = mListContext;

	return oCampaignList;
});