sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/controls/OrientationType",
    "sap/m/MessageToast",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin"
], function(BaseController,
	Device,
	Sorter,
	JSONModel,
	Filter,
	FilterOperator,
	Configuration,
	ObjectListFormatter,
	TopLevelPageFacet,
	FollowMixin,
	TagCardMixin,
	OrientationType,
	MessageToast,
	RegistrationMixin,
	VoteMixin,
	VolunteerMixin
) {
	"use strict";

	var mOrder = {
		ASC: "ASC",
		DESC: "DESC"
	};

	var mSort = {
		NAME: "NAME",
		CREATED_AT: "FOLLOW_DATE"
	};

	var mVariant = {
		CAMPAIGN: "campaign",
		IDEA: "idea",
		TAG: "tag"
	};

	var mFilter = {
		NONE: undefined
	};

	var mList = {
		ADJUSTMENT_TITLE: "FOLLOWED_OBJECT_LIST_TIT_ADJUSTMENT",
		Filter: {},
		Sequence: ['campaign', 'idea', 'tag'],
		Sorter: {
			Values: [{
				TEXT: "SORT_MIT_NAME",
				ACTION: mSort.NAME,
				DEFAULT_ORDER: mOrder.ASC
            }, {
				TEXT: "SORT_MIT_FOLLOW",
				ACTION: mSort.CREATED_AT,
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
			DEFAULT_VARIANT: mVariant.CAMPAIGN,
			TITLE: "FOLLOWED_OBJECT_LIST_TIT_VARIANTS",
			Values: [{
					TEXT: "FOLLOWED_OBJECT_LIST_MIT_CAMPAIGN",
					ACTION: mVariant.CAMPAIGN,
					FILTER: mFilter.NONE,
					DEFAULT_SORT: mSort.NAME,
					VISIBLE: true,
					OBJECT_COUNT: undefined
            }, {
					TEXT: "FOLLOWED_OBJECT_LIST_MIT_IDEA",
					ACTION: mVariant.IDEA,
					FILTER: mFilter.NONE,
					DEFAULT_SORT: mSort.NAME,
					VISIBLE: true,
					OBJECT_COUNT: undefined
            }, {
					TEXT: "FOLLOWED_OBJECT_LIST_MIT_TAG",
					ACTION: mVariant.TAG,
					FILTER: mFilter.NONE,
					DEFAULT_SORT: mSort.NAME,
					VISIBLE: true,
					OBJECT_COUNT: undefined
            }
        ]
		}
	};

	var mListContext = {
		FOLLOW: "followlist",
		FOLLOW_VARIANT: "followlistvariant"
	};

	var oFollowList = BaseController.extend("sap.ino.vc.follow.List", jQuery.extend({}, TopLevelPageFacet, RegistrationMixin, FollowMixin,
		TagCardMixin, VoteMixin, VolunteerMixin, {
			/* Controller reacts when these routes match */
			routes: ["followlist", "followlistvariant"],

			initialFocus: "mainFilterButton",

			/* ListModel defining filter, sorter and variants of the list */
			list: mList,

			formatter: ObjectListFormatter,

			/* ViewModel storing the current configuration of the list */
			view: {
				"List": {
					"SORT": mSort.NAME,
					"ORDER": undefined,
					"VARIANT": mVariant.CAMPAIGN,
					"Default": {
						"SORT": mSort.NAME,
						"ORDER": undefined,
						"VARIANT": mVariant.CAMPAIGN
					}
				},
				"ORIENTATION": OrientationType.LANDSCAPE
			},

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);

				this.oViewModel = this.getModel("view") || new JSONModel({});
				this.oViewModel.setData(this.view, true);

				this.getList().attachUpdateFinished(this.onListUpdateFinished, this);
			},

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

				var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");

				this.setViewProperty("/List/VARIANT", sVariant || sDefaultVariant);

				sVariant = this.getViewProperty("/List/VARIANT");

				var aSorter;
				var oVariant = this.getVariant(sVariant);

				var bBound = this.getList().isBound("items");

				// even if there is no query defined, we need to add the default sorter that is applied
				if (!oQuery || !oQuery.sort) {
					var sDefaultSort = oVariant.DEFAULT_SORT;
					var sDefaultOrder = this.getSort(sDefaultSort).DEFAULT_ORDER;

					oQuery = oQuery || {};

					oQuery.sort = oQuery.sort || sDefaultSort;
					// enhance for sort combination
					oQuery.sort = oQuery.sort + " " + (oQuery.order || sDefaultOrder);
				}

				var bRebindRequired = this.hasStateChanged(this._sRoute, sVariant, oQuery, Device.orientation.portrait);

				if (!bBound || bRebindRequired) {

					this.setParameters(oQuery, oVariant);

					aSorter = this.getSort(this.getViewProperty("/List/SORT"));

					this.setSorter(aSorter);

					//TODO move to ListPage
					var iOrientation = this.getViewProperty("/ORIENTATION");
					this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

					this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));

					this.bindList();
					this.initialSorterItems();
				}

				/* used to prevent opening and closing the filter while changing the variant, etc. */
				this._bInnerViewNavigation = true;
				/* auto open the filter bar when the page loaded */
				if (Device.system.desktop &&
					this._bAutoOpenFilter !== false /* undefined is ok */ ) {
					this.onShowFilterBar(true);
					this._bAutoOpenFilter = false;
				}
				this.setHelp("FOLLOW_LIST");
			},

			bindList: function() {
				var sVariant = this.getViewProperty("/List/VARIANT");
				this.saveState();

				this.setPath("data>/" + this.getBindingPath(sVariant));

				BaseController.prototype.bindList.apply(this);
			},

			getBindingPath: function(sVariant) {
				if (sVariant === "campaign") {
					return "MyCampaignFollow";
				} else if (sVariant === "idea") {
					return "MyIdeaFollow";
				} else {
					return "MyTagFollow";
				}
			},

			getVariantNumer: function(sVariant) {
				var sequence = this.getListProperty("/Sequence");
				return sequence && sequence.indexOf(sVariant);
			},

			getList: function() {
				return this.byId("objectlist");
			},

			onListUpdateFinished: function(object) {
				var sVariant = this.getViewProperty("/List/VARIANT");
				this.setListProperty("/Variants/Values/" + this.getVariantNumer(sVariant) + '/OBJECT_COUNT', object.getParameter('total'));
			},

			getItemTemplate: function() {
				var sVariant = this.getViewProperty("/List/VARIANT");
				if (sVariant === 'tag') {
					return this.getFragment("sap.ino.vc.tag.fragments.CardListItem");
				}
				var sRequiredTemplate;

				if ((!Device.system.desktop && Device.orientation.landscape) ||
					(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
					sRequiredTemplate = "Landscape";
				} else {
					sRequiredTemplate = "Portrait";
				}

				var oTemplate;
				switch (sRequiredTemplate) {

					case "Landscape":
						oTemplate = this.getFragment("sap.ino.vc." + sVariant + ".fragments.FlatListItem");
						break;
					case "Portrait":
						oTemplate = this.getFragment("sap.ino.vc." + sVariant + ".fragments.CardListItem");
						break;
					default:
						break;
				}
				return oTemplate;
			},

			//TODO move to ListPage
			onOrientationChange: function(eOrientation) {
				if (this.getList()) {
					var sVariant = this.getViewProperty("/List/VARIANT");
					if (sVariant === 'tag') {
						if (this.getPortraitStyle) {
							this.getList().addStyleClass(this.getPortraitStyle());
						}
						if (this.getLandscapeStyle) {
							this.getList().removeStyleClass(this.getLandscapeStyle());
						}
					    this.getList().setWrapping(true);
						return;
					}
					if (eOrientation === OrientationType.LANDSCAPE || eOrientation.landscape) {
						if (this.getPortraitStyle) {
							this.getList().removeStyleClass(this.getPortraitStyle());
						}
						if (this.getLandscapeStyle) {
							this.getList().addStyleClass(this.getLandscapeStyle());
						}
					} else {
						if (this.getPortraitStyle) {
							this.getList().addStyleClass(this.getPortraitStyle());
						}
						if (this.getLandscapeStyle) {
							this.getList().removeStyleClass(this.getLandscapeStyle());
						}
					}

					this.getList().setWrapping(!(eOrientation === OrientationType.LANDSCAPE || eOrientation.landscape));
				}
			},

			setParameters: function(oQuery, oVariant) {
				BaseController.prototype.setParameters.apply(this, arguments);
			},

			getDefaultVariantValue: function() {
				return [{
					TEXT: "FOLLOWED_OBJECT_LIST_MIT_CAMPAIGN",
					ACTION: mVariant.CAMPAIGN,
					FILTER: mFilter.NONE,
					DEFAULT_SORT: mSort.NAME,
					VISIBLE: true
		    }];
			},
			onOpenIdea: function(oEvent) {
				var iIdeaId;

				if (oEvent.getParameter("ideaId")) {
					iIdeaId = oEvent.getParameter("ideaId");
				} else {
					try {
						if (oEvent.getSource().getProperty("objectId")) {
							iIdeaId = oEvent.getSource().getProperty("objectId");
						}
					} catch (e) {
						iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
					}
				}
				if (iIdeaId) {
					this.navigateTo("idea-display", {
						id: iIdeaId
					});
				}
			},
			onOpenCampaign: function(oEvent) {
				this.navigateTo("campaign", {
					id: oEvent.getParameter("campaignId")
				});
			},
			onItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				var isIdea = oEvent.getSource().getBindingContext("data").getProperty("CAMPAIGN_ID");
				if (isIdea) {
					this.navigateTo("idea-display", {
						id: oEvent.getSource().getBindingContext("data").getProperty("ID")
					});
				} else if (oContext) {
					this.navigateTo("campaign", {
						id: oContext.getProperty("ID")
					});
				}
			},
			onCreateIdea: function(oEvent) {
				this.navigateTo("idea-create", {
					query: {
						campaign: oEvent.getParameter("campaignId")
					}
				});
			},
			onIdeaCommentPress: function(oEvent) {
				var iIdeaId;
				if (oEvent.getParameter("ideaId")) {
					iIdeaId = oEvent.getParameter("ideaId");
				} else {
					try {
						if (oEvent.getSource().getProperty("objectId")) {
							iIdeaId = oEvent.getSource().getProperty("objectId");
						}
					} catch (e) {
						iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
					}
				}
				if (iIdeaId) {
					this.navigateTo("idea-display", {
						id: iIdeaId,
						query: {
							section: "sectionComments"
						}
					});
				}
			}
		}));

	oFollowList.list = mList;
	oFollowList.listContext = mListContext;

	return oFollowList;
});