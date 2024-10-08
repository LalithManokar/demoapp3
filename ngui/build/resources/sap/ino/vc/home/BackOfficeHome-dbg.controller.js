sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/iam/mixins/IdentityProfileMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/idea/mixins/FollowUpMixin",
    "sap/ino/vc/idea/mixins/AssignmentActionMixin",
    "sap/ino/vc/idea/mixins/ChangeStatusActionMixin",
    "sap/ino/vc/idea/mixins/DeleteActionMixin",
    "sap/ino/vc/idea/mixins/AddExpertFromClipboardMixin",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ino/vc/idea/mixins/MergeActionMixin",
    "sap/ino/vc/blog/mixins/DeleteActionMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/idea/RewardFormatter",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/follow/mixins/FeedsMixin",
    "sap/ino/vc/idea/mixins/IdeaFormCriteriaFilterMixin",
    "sap/ino/commons/models/object/Homepagewidget",
    "sap/ui/model/json/JSONModel"
], function(Controller,
	IdentityProfileMixin,
	ObjectListFormatter,
	Sorter,
	Filter,
	Configuration,
	FollowUpMixin,
	AssignmentActionMixin,
	ChangeStatusActionMixin,
	DeleteActionMixin,
	AddExpertFromClipboardMixin,
	EvaluationFormatter,
	MergeActionMixin,
	BlogDeleteActionMixin,
	TagCardMixin,
	RegistrationMixin,
	FollowMixin,
	RewardFormatter,
	VoteMixin,
	VolunteerMixin,
	FeedsMixin,
	IdeaFormCriteriaFilterMixin,
	Homepagewidget,
	JSONModel
) {
	"use strict";
	var mList = {
		"follow": {
			filterParam: "",
			filter: [new Filter("FOLLOW_UP_ID", "NE", null), new Filter("STATUS", "NE", "sap.ino.config.DRAFT")],
			sorter: new Sorter("FOLLOW_UP_DATE", false)
		},
		"coachme": {
			filterParam: "",
			filter: [new Filter("COACH_ID", "EQ", Configuration.getCurrentUser().USER_ID), new Filter("STATUS", "NE", "sap.ino.config.DRAFT")],
			sorter: new Sorter("SUBMITTED_AT", false)
		},
		"unassigned": {
			filterParam: "unassignedCoach",
			filter: [new Filter("STATUS", "NE", "sap.ino.config.DRAFT")],
			sorter: new Sorter("SUBMITTED_AT", true)
		},
		"evaldone": {
			filterParam: "evaluatedIdeas",
			filter: [new Filter("STATUS", "NE", "sap.ino.config.DRAFT")],
			sorter: new Sorter("LAST_PUBL_EVAL_AT", true)
		}
	};
	var mBlogList = {
		"published": {
			filterParam: "publishedBlogs",
			filter: [],
			sorter: new Sorter("PUBLISHED_AT", true),
			name: "publish"
		},
		"draft": {
			filterParam: "draftBlogs",
			filter: [],
			sorter: new Sorter("CHANGED_AT", true),
			name: "draft"
		},
		"all": {
			filterParam: "",
			filter: [],
			sorter: new Sorter("PUBLISHED_AT", true),
			name: "all"
		}
	};
	var mIdentityProfile = {
		Backoffice: {
			PATH: "/BackofficeEntityCount(1)",
			Binding: [{
					ICON: "sap-icon://lightbulb",
					LINK_TEXT: "PROFILE_LNK_IDEAS_COACHED",
					COUNT: "COACHED_BY_ME_IDEA_COUNT",
					Route: {
						NAME: "idealistvariant",
						QUERY: {
							variant: "coachme"
						}
					},
					ROLES: ["sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
					ICON: "sap-icon://InoIcons/campaign",
					LINK_TEXT: "PROFILE_LNK_MANAGED_CAMPAIGNS",
					COUNT: "MANAGED_CAMPAIGN_COUNT",
					Route: {
						NAME: "campaignlistvariant",
						QUERY: {
							variant: "manage"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role"]
            }, {
					ICON: "sap-icon://lightbulb",
					LINK_TEXT: "PROFILE_LNK_IDEAS_UNASSIGNED",
					COUNT: "UNASSIGNED_IDEA_COUNT",
					Route: {
						NAME: "idealistvariant",
						QUERY: {
							variant: "unassigned"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
					ICON: "sap-icon://hr-approval",
					LINK_TEXT: "REGISTER_APPR_LIST_TIT", // my pending approvals
					COUNT: "MY_PENDING_APPR_COUNT",
					Route: {
						NAME: "registerapprovallistvariant",
						QUERY: {
							variant: "pending"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role"]
            }, {
					ICON: "sap-icon://lightbulb",
					LINK_TEXT: "PROFILE_LNK_IDEA_FOLLOWUP",
					COUNT: "FOLLOW_UP_IDEA_COUNT",
					Route: {
						NAME: "idealistvariant",
						QUERY: {
							variant: "follow"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
					ICON: "sap-icon://lightbulb",
					LINK_TEXT: "PROFILE_LNK_IDEAS_EVALUATED",
					COUNT: "EVALUATED_IDEA_COUNT",
					Route: {
						NAME: "idealistvariant",
						QUERY: {
							variant: "evaldone"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }
    //         , {
				// ICON: "sap-icon://activity-individual",
				// LINK_TEXT: "PROFILE_LNK_PENDING_EVAL_REQ_MY",
				// COUNT: "MY_PENDING_EVAL_ITEM_COUNT",
				// Route: {
				// 	NAME: "evalreqlistvariant",
				// 	QUERY: {
				// 		variant: "my"
				// 	}
				// },
				// ROLES: ["sap.ino.ui::camps_mgr_role"]
    //         }
            , {
					ICON: "sap-icon://competitor",
					LINK_TEXT: "REWARDS_MANAGEMENT_LIST_TIT",
					COUNT: "REWARDS_MANAGEMENT_COUNT",
					Route: {
						NAME: "rewardlist",
						QUERY: {
							variant: "rewardmanage"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role"]
            }, {
					ICON: "sap-icon://InoIcons/following",
					LINK_TEXT: "PROFILE_LNK_FOLLOWED_MY",
					COUNT: "MY_FOLLOWED_COUNT",
					Route: {
						NAME: "followlistvariant",
						QUERY: {
							variant: "campaign"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
					ICON: "sap-icon://lightbulb",
					LINK_TEXT: "IDEA_LIST_MIT_COMPLETED",
					COUNT: "COMPLETED_IDEA_COUNT",
					Route: {
						NAME: "idealistvariant",
						QUERY: {
							variant: "managedcompleted"
						}
					},
					ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }]
		}
	};

	var mReport = {
		"UnchangedIdeasFrame": "ReportTemplates('sap.ino.config.7')",
		"VotesFrame": "ReportTemplates('sap.ino.config.16')"
	};

	// mapping of container and content ids for each layout size
	var mLayout = {
		XS: {
			centerProfileContainer: "identityProfileFragment--identityProfile",
			centerReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas",
			centerReportUnchangedIdeasSplitContainer: undefined,
			leftReportUnchangedIdeasContainer: undefined,
			rightReportUnchangedIdeasContainer: undefined,
			centerReportVotesContainer: "votesFragment--votes",
			centerReportVotesSplitContainer: undefined,
			leftReportVotesContainer: undefined,
			rightReportVotesContainer: undefined
		},
		S: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas",
			centerReportVotesContainer: "votesFragment--votes"
		},
		M: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerReportUnchangedIdeasSplitContainer: "unchangedIdeasFragment--unchangedIdeas",
			centerReportVotesSplitContainer: "votesFragment--votes"
		},
		L: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			leftReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas",
			leftReportVotesContainer: "votesFragment--votes"
		},
		XL: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			rightReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas",
			rightReportVotesContainer: "votesFragment--votes"
		}
	};

	return Controller.extend("sap.ino.vc.home.BackOfficeHome", jQuery.extend({}, IdentityProfileMixin, FollowUpMixin, AssignmentActionMixin,
		ChangeStatusActionMixin, DeleteActionMixin, MergeActionMixin, BlogDeleteActionMixin, TagCardMixin, RegistrationMixin, FollowMixin,
		ObjectListFormatter, VoteMixin, VolunteerMixin, FeedsMixin, AddExpertFromClipboardMixin, IdeaFormCriteriaFilterMixin, {

			formatter: jQuery.extend(this.formatter, ObjectListFormatter, EvaluationFormatter, FollowUpMixin.followUpMixinFormatter,
				RewardFormatter),

			feedTitleLink: function(iObjectId, sObjectTypeCode) {
				if (!isNaN(parseInt(iObjectId, 10))) {
					switch (sObjectTypeCode) {
						case 'CAMPAIGN':
							return this.formatter.navigationLink.apply(this, ["campaign", {
								id: iObjectId
        				    }]);
						case 'IDEA':
							return this.formatter.navigationLink.apply(this, ["idea-display", {
								id: iObjectId
        				    }]);
						default:
							break;
					}

				}
				return undefined;
			},

			initialFocus: "backofficeButton--backofficeToogle",

			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
				this.aBusyControls = [this.getView()];
				this._sBOHResizeIdeaListId = this.attachListControlResized(this.byId("ideasFragment--ideasList"));

				// get home page widget configuration
				var oDeffered = Homepagewidget.getBackofficeHomepageWidget();
				oDeffered.done(function(oData) {
					var oWidgetData = oData.RESULT[0] || {
						IS_VISIBLE: false,
						HTML_CONTENT: ""
					};
					oWidgetData.IS_VISIBLE = !!oWidgetData.IS_VISIBLE;
					this.getView().setModel(new JSONModel(oWidgetData), "widget");
				}.bind(this));
			},

			onExit: function() {
				Controller.prototype.onExit.apply(this, arguments);
				this.detachListControlResized(this._sBOHResizeIdeaListId);
			},

			getIdeaList: function() {
				return this.byId("ideasFragment--ideasList");
			},

			getCampaignList: function() {
				return this.byId("campaignsListFragment--campaignsList");
			},

			show: function(oParentView) {
				this._oParentView = oParentView;
				this.bindViewData();
				this.setIdentityProfileBinding();
				this.getIdeaList().attachUpdateFinished(this._onIdeaListUpdateFinished, this);
				this.getCampaignList().attachUpdateFinished(this._onCampaignListUpdateFinished, this);
			},

			_onIdeaListUpdateFinished: function() {
				// accessibility: we need to update the aria property like this due to (for us) not usable behaviour of UI5
				var oList = this.getIdeaList();

				oList.$().find(".sapMListUl").attr("role", "list");

				var aItems = oList.$().find("li");
				jQuery.each(aItems, function(iIdx, oItemDom) {
					var $Item = jQuery(oItemDom);
					$Item.attr("role", "group");
					var $Label = $Item.find(".sapInoItemAriaLabel");
					if ($Label && $Label.length > 0) {
						$Item.attr("aria-labelledby", $Label[0].id);
					}
					var $Content = $Item.find(".sapMLIBContent");
					if ($Content && $Content.length > 0) {
						$Content.attr("role", "listitem");
					}
				});
			},

			_onCampaignListUpdateFinished: function() {
				// accessibility: we need to update the aria property like this due to (for us) not usable behaviour of UI5
				var oList = this.getCampaignList();

				oList.$().find(".sapMListUl").attr("role", "list");

				var aItems = oList.$().find("li");
				jQuery.each(aItems, function(iIdx, oItemDom) {
					var $Item = jQuery(oItemDom);
					$Item.attr("role", "group");
					var $Label = $Item.find(".sapInoItemAriaLabel");
					if ($Label && $Label.length > 0) {
						$Item.attr("aria-labelledby", $Label[0].id);
					}
					var $Content = $Item.find(".sapMLIBContent");
					if ($Content && $Content.length > 0) {
						$Content.attr("role", "listitem");
					}
				});
			},

			_replaceReportName: function(oItems) {
				var that = this;
				oItems.forEach(function(oItem) {
    				var sKey = oItem.getProperty("name");
    				var sText = that.getText(sKey);
    				oItem.setProperty("name", sText);
				});
			},

			_changeReportTitle: function(oReport) {
				var that = this;
				if (oReport.getFeeds()) {
					oReport.getFeeds().forEach(function(oFeed) {
						var sKey = oFeed.getProperty("values");
						var sText = that.getText(sKey);
						oFeed.setProperty("values", [sText]);
					});
				}
				if (oReport.getDataset() && oReport.getDataset().getMeasures()) {
				    that._replaceReportName(oReport.getDataset().getMeasures());
				}
				if (oReport.getDataset() && oReport.getDataset().getDimensions()) {
				    that._replaceReportName(oReport.getDataset().getDimensions());
				}
			},

			onAfterRendering: function() {
				var that = this;
				var oUnchangedIdeas = this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");
				var oVotes = this.byId("votesFragment--VotesFrame");
				var oVizProperties = {
					title: {
						visible: false
					},
					legendGroup: {
						layout: {
							position: "auto"
						}
					},
					categoryAxis: {
						title: {
							visible: false
						},
						label: {
							visible: false
						}
					},
					valueAxis: {
						title: {
							visible: false
						}
					}
				};
				if (oUnchangedIdeas) {
					oUnchangedIdeas.setVizProperties(oVizProperties);
					if (!this.getModel("device").getProperty("/system/phone") && !oUnchangedIdeas.aBindParameters) {
						oUnchangedIdeas.attachBrowserEvent("click", this.onNavigateToReport, this);
					}
					that._changeReportTitle(oUnchangedIdeas);
				}
				if (oVotes) {
					// show the x-axis label on mobile
					if (this.getModel("device").getProperty("/system/phone")) {
						oVizProperties.categoryAxis.label.visible = true;
					}
					oVotes.setVizProperties(oVizProperties);
					if (!this.getModel("device").getProperty("/system/phone") && !oVotes.aBindParameters) {
						oVotes.attachBrowserEvent("click", this.onNavigateToReport, this);
					}
					that._changeReportTitle(oVotes);
				}
			},

			getLayout: function(sLayout) {
				return mLayout[sLayout];
			},

			setIdentityProfileBinding: function() {
				this.bindIdentityProfile(this.byId("identityProfileFragment--identityProfile"), mIdentityProfile.Backoffice);

				if (this.getModel("data").getProperty(mIdentityProfile.Backoffice.PATH)) {
					var oController = this;
					this.getModel("data").read(mIdentityProfile.Backoffice.PATH, {
						success: function() {
							var oBinding = oController.byId("identityProfileFragment--identityProfileList").getBindingInfo("items");
							oController.byId("identityProfileFragment--identityProfileList").bindItems(oBinding);
						}
					});
				}
			},

			bindViewData: function() {
				this._bindCampaigns();
				// bind idea list
				var sIdeaViewKey;
				if (this.getModel("device").getProperty("/system/phone")) {
					sIdeaViewKey = this.byId("ideasFragment--sapInoCampHomeIdeasSelect").getSelectedKey();
				} else {
					sIdeaViewKey = this.byId("ideasFragment--sapInoCampHomeIdeasButtons").getSelectedKey();
				}
				this._sIdeaViewKey = sIdeaViewKey || Object.keys(mList)[0];
				this._bindIdeas(this._sIdeaViewKey);
				//For Blog 
				var sBlogViewKey;
				if (this.getModel("device").getProperty("/system/phone")) {
					sBlogViewKey = this.byId("blogsFragment--sapInoCampHomeBlogsSelect").getSelectedKey();
				} else {
					sBlogViewKey = this.byId("blogsFragment--sapInoCampHomeBlogsButtons").getSelectedKey();
				}
				this._sBlogViewKey = sBlogViewKey || Object.keys(mBlogList)[0];
				if (!this.getModel("component").getProperty("/SHOW_BACKOFFICE_BLOG")) { //Coach
					this._sBlogViewKey = Object.keys(mBlogList)[2];
				}
				this._bindBlogs(this._sBlogViewKey);
				//due to sizing issues we need to create a separate model
				this._bindUnchangedIdeas();
				this._bindVotes();
			},

			_bindCampaigns: function() {
				var bIsPhone = this.getModel("device").getProperty("/system/phone");
				// Special logic for innovation manager
				var bShowAll = Configuration.hasCurrentUserPrivilege('sap.ino.xs.rest.admin.application::campaign');
				var sFilterBackoffice = bShowAll ? 'filterBackoffice=0' : 'filterBackoffice=1';

				var sPath = "data>/CampaignSearchParams(searchToken=''," +
					"tagsToken=''," + "tagsToken1=''," + "tagsToken2=''," + "tagsToken3=''," + "tagsToken4=''," +
					"filterName='submittableCampaigns'," +
					sFilterBackoffice + ")/Results";
				if (bIsPhone) {
					var oCarousel = this.byId("campaignsListFragment--campaignsCarousel");
					oCarousel.bindAggregation(
						"pages", {
							path: sPath,
							template: this.createFragment("sap.ino.vc.home.fragments.CampaignBanner"),
							length: 4,
							top: 4,
							filters: [new Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
							sorter: new Sorter("SUBMIT_TO", false)
						});
				} else {
					var oList = this.byId("campaignsListFragment--campaignsList");
					oList.bindItems({
						path: sPath,
						template: this.getFragment("sap.ino.vc.campaign.fragments.HomeCampaignListItem"),
						length: 3,
						top: 3,
						filters: [new Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
						sorter: new Sorter("SUBMIT_TO", false)
					});
				}
			},
			_bindIdeas: function(sKey) {
				var bIsPhone = this.getModel("device").getProperty("/system/phone");
				var sPath = "data>/IdeaMediumBackofficeSearchParams(searchToken=''," +
					"searchType=" + "0" + "," +
					"tagsToken=''," + "tagsToken1=''," + "tagsToken2=''," + "tagsToken3=''," + "tagsToken4=''," +
					"filterName='" + mList[sKey].filterParam + "'," +
					"filterBackoffice=1" + this.getEmptyIdeaformFilters() +
					",cvt='" + "" + "'," + "cvr=" + "0" + "," + "cvy=" + "0" +
					")/Results";
				var oList = this.byId("ideasFragment--ideasList");
				var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting(
					"sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;
				var template = Number(disableImage) ? this.getFragment("sap.ino.vc.idea.fragments.ManageListItemNoImage") : this.getFragment(
					"sap.ino.vc.idea.fragments.ManageListItem");
				oList.bindItems({
					path: sPath,
					template: template,
					sorter: mList[sKey].sorter,
					filters: mList[sKey].filter,
					length: 4
				});
				//add "aria-label" to the right dom elements to make jaws read
				// var oBinding = oList.getBinding("items");
				// oBinding.attachDataReceived(function() {
				// 	jQuery.each(this.byId("ideasFragment--ideasList").getItems(), function(index0, item0) {
				// 	   item0.$().attr("aria-labelledby",item0.getContent()[1].getId());
				// 	});
				// }, this); 

				// set title accordingly to one of
				// CAMPAIGN_HOME_PANEL_IDEAS_FOLLOW CAMPAIGN_HOME_PANEL_IDEAS_UNASSIGNED CAMPAIGN_HOME_PANEL_IDEAS_COACHME CAMPAIGN_HOME_PANEL_IDEAS_EVALDONE
				var oTitle = this.byId("ideasFragment--panelTitle");
				oTitle.setText(this.getText("CAMPAIGN_HOME_PANEL_IDEAS_" + sKey.toUpperCase()));

				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");
				var sOdataPath = "";
				if (bBackoffice) {
					sOdataPath = "/sap/ino/xs/rest/backoffice/odata.xsodata";
				} else {
					sOdataPath = "/sap/ino/xs/rest/community/odata.xsodata";
				}
				sPath = Configuration.getBackendRootURL() + sOdataPath + oList.mBindingInfos.items.binding.sPath + "?$format=json";
				var sFilter = oList.mBindingInfos.items.binding.sFilterParams;
				var sSorter = oList.mBindingInfos.items.binding.sSortParams;
				var sSelect = "&$select(ID)";
				sPath = sPath + "&" + sSorter + "&" + sFilter + sSelect;
				var oIdeaSearchParams = new JSONModel();
				oIdeaSearchParams.setData({
					path: sPath
				});
				sap.ui.getCore().setModel(oIdeaSearchParams, "ideaSearchParams");
			},

			_bindBlogs: function(sKey) {
				if (Configuration.getCurrentUser().USER_ID) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var sPath = "data>/BlogSearchParams(searchToken=''," +
						"tagsToken=''," +
						"filterName='" + mBlogList[sKey].filterParam + "')/Results";
					var oBinding = {
						path: sPath,
						template: this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),
						sorter: mBlogList[sKey].sorter,
						length: 4,
						top: 4
					};
					if (bIsPhone) {
						var oCarousel = this.byId("blogsFragment--blogsCarousel");
						oCarousel.bindAggregation("pages", oBinding);
					} else {
						var oList = this.byId("blogsFragment--blogsList");
						if (oList) {
							oList.bindItems(oBinding);
						}
					}
					var oTitle = this.byId("blogsFragment--panelBlogTitle");
					if (this.getModel("component").getProperty("/SHOW_BACKOFFICE_BLOG")) {
						oTitle.setText(this.getText("CAMPAIGN_HOME_PANEL_BLOGS_" + sKey.toUpperCase()));
					} else {
						oTitle.setText(this.getText("HOMEPAGE_PANEL_CAMPAIGN_BLOGS"));
					}
				}
			},

			_bindUnchangedIdeas: function() {
				// bind Unchanged Ideas chart
				var oVizFrame = this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");

				var oDatamodel = this.getModel("data");
				oDatamodel.read("/UnchangedIdeas", {
					async: true,
					success: function(oData) {
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						oVizFrame.setModel(oModel);
					}
				});
			},

			_bindVotes: function() {
				// bind votes chart
				var oVizFrame = this.byId("votesFragment--VotesFrame");

				var oDatamodel = this.getModel("data");
				oDatamodel.read("/IdeaVotes", {
					async: true,
					sorters: [new Sorter("CHANGED_AT_YEAR_MONTH", false)],
					success: function(oData) {
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						oVizFrame.setModel(oModel);
					}
				});
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

			onNavigateToCampaigns: function() {
				this.navigateTo("campaignlistvariant", {
					variant: "submittable"
				});
			},

			onOfficeToggle: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					if (oController.switchView) {
						oController.switchView();
					}
				}
			},

			onOpenCampaignSettings: function(oEvent) {
				if (this._oParentView) {
					var oSource = oEvent.getSource();
					var oContext = oSource.getBindingContext("data");
					var oController = this._oParentView.getController();
					if (oController.openCampaignSettings) {
						oController.openCampaignSettings(oContext.getProperty("ID"));
					}
				}
			},

			onBackofficeSettings: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					if (oController.onBackofficeSettings) {
						oController.onBackofficeSettings();
					}
				}
			},

			onCreateIdea: function(oEvent) {
				this.navigateTo("idea-create", {
					query: {
						campaign: oEvent.getParameter("campaignId")
					}
				});
			},

			onIdeaListTypeSelect: function(oEvent) {
				// two options: either by SegmentedButton or Select
				this._sIdeaViewKey = oEvent.getParameter("key") || oEvent.getParameter("selectedItem") && oEvent.getParameter("selectedItem").getKey();
				this._bindIdeas(this._sIdeaViewKey);
			},
			onBlogListTypeSelect: function(oEvent) {
				this._sBlogViewKey = oEvent.getParameter("key") || oEvent.getParameter("selectedItem") && oEvent.getParameter("selectedItem").getKey();
				this._bindBlogs(this._sBlogViewKey);
			},

			onOpenSubmitter: function(oEvent) {
				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty("SUBMITTER_ID");
				this.openIdentityQuickView(oSource, iIdentityId);
			},

			onOpenCoach: function(oEvent) {
				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty("COACH_ID");
				this.openIdentityQuickView(oSource, iIdentityId);
			},

			onNavigateToIdeas: function() {
				if (!this._sIdeaViewKey) {
					this.navigateTo("idealist");
				} else {
					this.navigateTo("idealistvariant", {
						variant: this._sIdeaViewKey
					});
				}
			},

			onNavigateToBlogs: function() {
				if (!this._sBlogViewKey) {
					this.navigateTo("bloglist");
				} else {
					this.navigateTo("bloglistvariant", {
						variant: mBlogList[this._sBlogViewKey].name
					});
				}
			},

			onNavigateToReport: function(oEvent) {
				var aIdComponents = ((oEvent.currentTarget && oEvent.currentTarget.id) ||
					(oEvent.oSource.sId)).split("--");
				var sFrameId = aIdComponents[aIdComponents.length - 1];

				this.navigateTo("report", {
					code: mReport[sFrameId]
				});
			},

			onItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("idea-display", {
						id: oContext.getProperty("ID")
					});
				}
			},

			onBlogItemPress: function(oEvent) {
				if (this._bIsTokenPressed) {
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

			onOpenCreator: function(oEvent) {
				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty("CREATED_BY_ID");
				if (!this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				this.oIdentityCardView.getController().open(oSource, iIdentityId);
			},

			onNavigateToFeedList: function() {
				this.navigateTo("feedlist");
			},

			showPopupTagCard: function(oEvent) {
				this._bIsTokenPressed = true;
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
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						that._oPopover.setModel(oModel, "Tag");
						jQuery.sap.delayedCall(0, that, function() {
							that._oPopover.openBy(oToken);
						});
					}
				});

			}
		}));
});