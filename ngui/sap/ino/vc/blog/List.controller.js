sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Item",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/controls/OrientationType",
    "sap/ino/vc/blog/mixins/DeleteActionMixin",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/vc/commons/mixins/TagGroupMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/blog/mixins/BlogCardMixin"
], function(
	BaseController,
	Device,
	JSONModel,
	Sorter,
	Item,
	Configuration,
	CodeModel,
	ViewType,
	Filter,
	FilterOperator,
	ObjectListFormatter,
	OrientationType,
	DeleteActionMixin,
	MessageToast,
	MessageBox,
	ApplicationObjectChange,
	TagGroupMixin,
	TagCardMixin,
	BlogCardMixin) {
	"use strict";

	var mOrder = {
		ASC: "ASC",
		DESC: "DESC"
	};

	var mBlogRoutes = {
		BLOG: "bloglist",
		BLOG_VARIANT: "bloglistvariant"
	};

	var mSort = {
		CREATED_AT: "CREATED_AT",
		CHANGED_AT: "CHANGED_AT",
		// case insensitive sort order
		NAME: "tolower(TITLE)"
	};

	var mVariant = {
		ALL: "all",
 		MY: "my",
		DRAFT: "draft",
		PUBLISH: "publish"
	};

	var mFilter = {
		NONE: undefined,
 		MY: "myBlogs",
		DRAFT: "draftBlogs",
		PUBLISH: "publishedBlogs"
	};

	var mList = {
		ADJUSTMENT_TITLE: "BLOG_LIST_TIT_ADJUSTMENT",
		Filter: {},
		Sorter: {
			Values: [{
				TEXT: "SORT_MIT_CREATED",
				ACTION: mSort.CREATED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_CHANGED",
				ACTION: mSort.CHANGED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_TITLE",
				ACTION: mSort.NAME,
				DEFAULT_ORDER: mOrder.ASC
            }]
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
			TITLE: "BLOG_LIST_TIT_VARIANTS",
			Values: [{
				TEXT: "BLOG_LIST_MIT_ALL",
				ACTION: mVariant.ALL,
				FILTER: mFilter.NONE,
				INCLUDE_DRAFT: true,
				VISIBLE: true,
				DEFAULT_SORT: mSort.CREATED_AT,
				MANAGE: false
            }, 
    //         {
				// TEXT: "BLOG_LIST_MIT_MY",
				// ACTION: mVariant.MY,
				// FILTER: mFilter.MY,
				// INCLUDE_DRAFT: true,
				// DEFAULT_SORT: mSort.CREATED_AT,
				// VISIBLE: false,
				// HIERARCHY_LEVEL: "1",
				// MANAGE: true
    //         }, 
            {
				TEXT: "BLOG_LIST_MIT_DRAFT",
				ACTION: mVariant.DRAFT,
				FILTER: mFilter.DRAFT,
				INCLUDE_DRAFT: true,
				DEFAULT_SORT: mSort.CREATED_AT,
				VISIBLE: false,
				HIERARCHY_LEVEL: "1",
				MANAGE: true
            }, {
				TEXT: "BLOG_LIST_MIT_PUBLISH",
				ACTION: mVariant.PUBLISH,
				FILTER: mFilter.PUBLISH,
				INCLUDE_DRAFT: false,
				DEFAULT_SORT: mSort.CREATED_AT,
				VISIBLE: false,
				HIERARCHY_LEVEL: "1",
				MANAGE: true
            }]
		}
	};
	
	/**
	 * @mixes DeleteActionMixin, TagGroupMixin, TagCardMixin
	 */
	var oBlogList = BaseController.extend("sap.ino.vc.blog.List", jQuery.extend({}, 
	            DeleteActionMixin, TagGroupMixin, TagCardMixin, BlogCardMixin, {
            
			/* ListModel defining filter, sorter and variants of the list */
			list: mList,

			// id of control that get initial focus
			initialFocus: "filterButton",

			/* ViewModel storing the current configuration of the list */
			view: {
				"List": {
					"SORT": mSort.CREATED_AT,
					"ORDER": undefined,
					"VARIANT": mVariant.ALL,
					"MANAGE": false,
					"TAGS": [],
					"IS_TAGS_SELECTION": false,
					"CAMPAIGN": undefined,
					"TAGCLOUD": true,
					"TAGCLOUD_EXPABLE": true,
					"TAGCLOUD_EXP": false,
					"TAGCLOUD_BAR_VISIBLE": false,
					"IS_FILTER_SUBPAGE": true
				},
				"ORIENTATION": OrientationType.PORTRAIT,
				"DISABLE_ORIENTATION": true,
				"IS_COMMUNITY_VIEW" : false
			},

			formatter: jQuery.extend({}, ObjectListFormatter),

			onInit: function() {
				this.formatter.filterStyleClass = function(sValue) {
					return sValue === undefined ? "" : "sapUiTinyMarginBegin";
				};

				BaseController.prototype.onInit.apply(this, arguments);

				this.oViewModel = this.getModel("view");
				this.oViewModel.setData(this.view, true);
                
                // only blog list navigated from user home or global search adds additional filter
			    this.addSubFilterPageContent(this.getAdditionalFilter());

				// TODO currently we always start with the card layout => instead use orientation in viewdata / real orientation
				this.getList().addStyleClass(this.getPortraitStyle());

				this.getList().attachUpdateFinished(this.onUpdateFinished, this);
				this.initApplicationObjectChangeListeners();
			},
			
			//TODO limit signature to 1: route 2: query => no support for onRouteMatched Signature
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

				var that = this;

				var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
				this.setViewProperty("/List/VARIANT", sVariant || sDefaultVariant);

				sVariant = this.getViewProperty("/List/VARIANT");
				var oVariant = this.getVariant(sVariant);

				var aSorter;
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

				var bRebindRequired = this.hasStateChanged(this.getCurrentRoute(), sVariant, oQuery, Device.orientation.portrait);
				bRebindRequired = bRebindRequired || this._bListChanged;
				this._bListChanged = false;

				if (!bBound || bRebindRequired) {
					// update the VISIBILITY flag of all variants for binding in Filter
					this.setVariantVisibility();

					this.setParameters(oQuery, oVariant);

					/* -- Do not show the filterbar automatically but let the user change it -- */

					aSorter = this.getSort(this.getViewProperty("/List/SORT"));
					this.setSorter(aSorter);
					this.updateFilter();

					//TODO move to ListPage
					var iOrientation = this.getViewProperty("/ORIENTATION");
					this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

					this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));

					//check visiablity for current Variiant
					var bVisible = this.getVariantVisibility(sVariant);

					if (bVisible === false || typeof(bVisible) === "undefined") {
						MessageBox.show(that.getText("NOT_AUTHORIZED_MESSAGE"), MessageBox.Icon.INFORMATION, that.getText("NOT_AUTHORIZED_DIALOG_TITLE"), [
    						MessageBox.Action
    					.OK], function() {
							that.navigateTo("BlogList");
						});
						return;
					}

					this.bindList();
					this.initialSorterItems();
					if (this.isFilterVisible()) {
						this.bindTagCloud();
					}
				}
				
				this.setHelp("BLOG_LIST");
			},

			setVariantVisibility: function() {
				var aVariants = this.getModel("list").getProperty("/Variants/Values");

				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];
					var bIsManage = oVariant.MANAGE || false;

					var bVisible = (!bIsManage) || (bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager"));
					this.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
				}
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

			getPortraitStyle: function() {
				return "sapInoBlogList";
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
				// add for tag cloud
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

			bindList: function() {
				this.saveState();

				var oBindingParameter = this.getBindingParameter();
				var sPath = "";
				var searchTerm = oBindingParameter.SearchTerm || "";
				var bIsLandscape = false;
				var bIsManaged = this._check4ManagingList();

				sPath += "BlogSearchParams";
				sPath += "(searchToken='" + searchTerm + "'," +
					"tagsToken='" + (oBindingParameter.TagIds.join(",") || "") + "'," +
					"filterName='" + (oBindingParameter.VariantFilter || "") + "'" +
					")/Results";

				this.setPath("data>/" + sPath);

				if ((!Device.system.desktop && Device.orientation.landscape) ||
					(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
					bIsLandscape = true;
				}

				var _bindList = function(fnCallback) {
        			var that = this;
        			var oList = this.getList().bindItems({
        				path: this.getPath(),
        				template: this.getItemTemplate(),
        				sorter: this.getSorter(),
        				filters: this.getFilter(),
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
        							fnCallback.apply(this);
        						}
        					}
        				}
        			});
        		};

				_bindList.apply(this);
			},

			_check4ManagingList: function() {
				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager");

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
			
			includeDrafts: function() {
    			return this.getCurrentVariant().INCLUDE_DRAFT;
    		},

			bindTagCloud: function() {
				var oBindingParameter = this.getBindingParameter();
				var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagcloud_blogs.xsjs";
				var oController = this;
				
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
    			if (aParameter.length > 0) {
    				sPath = sPath + "?" + aParameter.join("&");
    			}
    			
				// check whether refresh is necessary
				if (this._lastTagServicePath !== sPath) {
					var oTagModel = new JSONModel(sPath);
					var sOtherTxt = this.getText("BLOG_LIST_MIT_FILTER_TAG_OTHER");
					oTagModel.attachRequestCompleted(null, function() {
						var oRankedTag = oTagModel.getData().RANKED_TAG;
						var oTagData = oController.groupByTagGroup(oRankedTag, oController.getViewProperty("/List/TAGS"), sOtherTxt);
						oController.setTagCloudProperty(oTagData, oTagModel.getData().WITHOUT_GROUP !== "X");
						oTagModel.setData({
							"RANKED_TAG": oTagData
						}, false);
						this.setFilterModel(oTagModel, "tag");
					}, this);
				}
				// swap last path for refresh checking
				this._lastTagServicePath = sPath;
			},

			onBlogItemPress: function(oEvent) {
			    if(this._bIsTokenPressed){
			        this._bIsTokenPressed = false;
			        return;
			    }
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("blog-display", {
						id: oContext.getProperty("ID")
					});
				}
			},

			updateFilter: function() {
				var sVariant = this.getViewProperty("/List/VARIANT");
				var sCampaign = this.getViewProperty("/List/CAMPAIGN");

				var bIsManaged = this._check4ManagingList();
				var aFilters = [];

				this.setFilter([]);

				if (sCampaign && sCampaign !== "0") {
					aFilters.push(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sCampaign));
				}

				if (aFilters.length > 0) {
					this.addFilter(new Filter({
						filters: aFilters,
						and: true
					}));
				}
			},
			
			onFilterCampaignChange: function(oEvent) {
				var oSource = oEvent.getSource().getSelectedItem();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				var sKey = oSource.getProperty("key");
				this.setViewProperty("/List/CAMPAIGN", sKey);
				this.navigateIntern(this.getQuery(), true, true);
			},
			
			resetFilter: function() {
				this.setViewProperty("/List/CAMPAIGN", undefined);
				BaseController.prototype.resetFilter.apply(this, arguments);
			},

			getQuery: function() {
				var oQuery = {};

				var sSort = this.getViewProperty("/List/SORT");
				var sOrder = this.getViewProperty("/List/ORDER");
				var sSearchTerm = this.getViewProperty("/List/SEARCH");
				var sCampaign = this.getViewProperty("/List/CAMPAIGN");
				var aTags = this.getViewProperty("/List/TAGS");

				if (sSort) {
					oQuery.sort = sSort;
					if (sOrder) {
						oQuery.order = sOrder;
					}
				}
				if (sSearchTerm) {
					oQuery.search = sSearchTerm;
				}
				if (sCampaign) {
					oQuery.campaign = sCampaign;
				}
				if (aTags && aTags.length > 0) {
					oQuery.tags = JSON.stringify(aTags);
				}

				return oQuery;
			},

			setParameters: function(oQuery, oVariant) {
				oQuery = oQuery || {};

				var oSorter = this.getSort(oVariant.DEFAULT_SORT);

				var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
				var sOrder = this.checkOrder(oQuery, oSorter.DEFAULT_ORDER);
				var aTags = this.checkTags(oQuery.tags);
				var sCampaign = oQuery.campaign;

				this.setViewProperty("/List/VARIANT", oVariant.ACTION);
				this.setViewProperty("/List/SORT", sSort);
				this.setViewProperty("/List/ORDER", sOrder);
				this.setViewProperty("/List/TAGS", aTags);
				this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);
				this.setViewProperty("/List/SEARCH", oQuery.search);
				this.setViewProperty("/List/MANAGE", oVariant.MANAGE);
				this.setViewProperty("/List/CAMPAIGN", sCampaign);
			},

			getItemTemplate: function() {
				return this.getFragment("sap.ino.vc.blog.fragments.ListItem");
			},

			createFilterController: function() {
				return sap.ui.controller("sap.ino.vc.blog.Filter");
			},

			createFilterView: function() {
				return this.createView({
					type: ViewType.XML,
					viewName: "sap.ino.vc.blog.Filter",
					controller: this._oFilterController
				});
			},

			createState: function(sRoute, sVariant, oQuery, bPortrait) {
				var oState = BaseController.prototype.createState.apply(this, arguments);
				oState.query.campaign = oQuery.campaign;

				return oState;
			},

			onOpenCampaign: function(oEvent) {
				this.navigateTo("campaign", {
					id: oEvent.getParameter("campaignId")
				});
			},

			onSetFilterBarVisible: function() {
				this.bindTagCloud();
			},
			
			getAdditionalFilter: function() {
				var oFragment = this.createFragment("sap.ino.vc.blog.fragments.FilterItems", this.createIdForFilterElement());
				return oFragment;
			},

			reloadData: function() {
				this.bindList();
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
				if (sVariant === this.getListProperty("/Variants/DEFAULT_VARIANT")) {
					this.navigateTo(this.getRoute(false), {
						query: oQuery
					}, true, true);
				} else {
					this.navigateTo(this.getRoute(true), {
						variant: sVariant,
						query: oQuery
					}, true, true);
				}

				oFilterDialog.close();
			},

			formatObjectListVariantsVisible: function(bIsManage) {
				if (
					// user has general backoffice privileges and variant has manage flag
					!bIsManage || (bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager"))) {
					return true;
				}
				return false;
			},

			initApplicationObjectChangeListeners: function() {
				var that = this;
				that._bListChanged = false;
				var aActions = ["create", "del", "modifyAndSubmit", "submit", "majorPublishSubmit", "publishSubmit", "unPublishSubmit"];

				var fnAOChangeListener = function(oEvent) {
					var sAction = oEvent.getParameter("actionName");
					if (sAction && aActions.indexOf(sAction) > -1 && oEvent.getParameter("object").getMetadata().getName() ===
						"sap.ino.commons.models.object.Blog") {
						that._bListChanged = true;
					}
				};

				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
			},
			
			showPopupTagCard: function(oEvent) {
    			if (!this._oPopover) {
    				this._oPopover = sap.ui.xmlfragment("sap.ino.vc.tag.fragments.TagCardPopover", this);
    				this.getView().addDependent(this._oPopover);
    			}
                var oToken = oEvent.getSource();
                var sPath = "/SearchTagsAll(searchToken='',ID=" + oToken.getKey() + ")";
                var oDatamodel = this.getModel("data");
                var that = this;
                oDatamodel.read(sPath, {
                    async: true,
                    success: function(oData) {
                        var oModel = new JSONModel();
                        oModel.setData(oData);
                        that._oPopover.setModel(oModel, "Tag");
                        jQuery.sap.delayedCall(0, that, function() {
            				that._oPopover.openBy(oToken);
            			});
                    }
                });
    		}
			
		}));

	oBlogList.list = mList;
	oBlogList.routes = mBlogRoutes;

	return oBlogList;
});