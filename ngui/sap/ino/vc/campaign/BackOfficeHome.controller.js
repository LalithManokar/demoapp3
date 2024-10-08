sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/iam/mixins/IdentityProfileMixin",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ui/core/TextAlign",
    "sap/ino/vc/idea/mixins/AssignmentActionMixin",
    "sap/ino/vc/idea/mixins/ChangeStatusActionMixin",
    "sap/ino/vc/idea/mixins/DeleteActionMixin",
    "sap/ino/vc/idea/mixins/FollowUpMixin",
    "sap/ino/vc/comment/CommentMixin",
    "sap/ino/vc/idea/mixins/MergeActionMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/blog/mixins/DeleteActionMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/blog/mixins/BlogCardMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/follow/mixins/FeedsMixin",
    "sap/ino/vc/campaign/mixins/MilestoneMixin",
    "sap/ino/vc/idea/mixins/IdeaFormCriteriaFilterMixin"
], function(Controller, Configuration, IdentityProfileMixin,
	Sorter, Filter, FilterOperator, JSONModel, EvaluationFormatter, TextAlign,
	AssignmentActionMixin, ChangeStatusActionMixin, DeleteActionMixin, FollowUpMixin, CommentMixin, MergeActionMixin, TagCardMixin,
	BlogDeleteActionMixin, FeedFormatter, FollowMixin, RegistrationMixin, BlogCardMixin, VoteMixin, VolunteerMixin, FeedsMixin,
	MilestoneMixin, IdeaFormCriteriaFilterMixin) {
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
			PATH_TEMPLATE: "/CampaignEntityCount",
			//SHOW_BUTTONS_AUTH: true,
			SHOW_CRTBLOG_AUTH: true,
			Binding: [{
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_COACHED",
				COUNT: "IDEAS_COACHED_BY_ME",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "coachme"
					}
				},
				ROLES: ["camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_UNASSIGNED",
				COUNT: "UNASSIGNED_IDEAS_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "unassigned"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_EVALUATED",
				COUNT: "EVALUATED_IDEAS",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "evaldone"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEA_FOLLOWUP",
				COUNT: "FOLLOW_UP_IDEAS",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "follow"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_QUALIFIED_IDEAS_FOR_REWARDS",
				COUNT: "QUALIFIED_IDEAS_FOR_REWARDS",
				Route: {
					NAME: "rewardlistvariant",
					QUERY: {
						variant: "rewardqualified"
					}
				},
				ROLES: ["camp_instance_mgr_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_EVALUATION_PENDING_BY_ME",
				COUNT: "EVALUATION_PENDING_BY_ME",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "manage"
					}
				},
				ROLES: ["camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_MANAGED",
				COUNT: "IDEAS_MANAGED_BY_ME",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "manage"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role"]
            }, {
                ICON: "sap-icon://lightbulb",
                LINK_TEXT: "IDEA_LIST_MIT_COMPLETED",
                COUNT: "COMPLETED_IDEA_COUNT",
                Route: {
                    NAME: "campaign-idealistvariant",
                    QUERY: {
						variant: "managedcompleted"
					}
                },
                ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            },{
				ICON: "sap-icon://hr-approval",
				LINK_TEXT: "REGISTER_APPR_LIST_TIT", // my pending approvals
				COUNT: "MY_PENDING_APPR_COUNT",
				Route: {
					NAME: "campaign-registerapprovallistvariant",
					QUERY: {
						variant: "pending"
					}
				},
				ROLES: ["camp_instance_mgr_role"]
            }]
		}
	};

	var mReport = {
		"UnchangedIdeasFrame": "ReportTemplates('sap.ino.config.7')",
		"CampaignActivitiesFrame": "ReportTemplates('sap.ino.config.14')"
	};

	// mapping of container and content ids for each layout size
	var mLayout = {
		XS: {
			centerProfileContainer: "identityProfileFragment--identityProfile",
			centerCommentContainer: "ideasCommentFragment--campaignComment",
			centerTagsContainer: "campaignTagsFragment--campaignTags",
			centerReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas",
			centerReportUnchangedIdeasSplitContainer: undefined,
			leftReportUnchangedIdeasContainer: undefined,
			rightReportUnchangedIdeasContainer: undefined,
			centerReportCampaignActivitiesContainer: "campaignActivitiesFragment--campaignActivities",
			centerReportCampaignActivitiesSplitContainer: undefined,
			leftReportCampaignActivitiesContainer: undefined,
			rightReportCampaignActivitiesContainer: undefined
		},
		S: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerCommentContainer: "ideasCommentFragment--campaignComment",
			centerTagsContainer: "campaignTagsFragment--campaignTags",
			centerReportCampaignActivitiesContainer: "campaignActivitiesFragment--campaignActivities",
			centerReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas"
		},
		M: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerCommentContainer: "ideasCommentFragment--campaignComment",
			centerTagsContainer: "campaignTagsFragment--campaignTags",
			centerReportCampaignActivitiesSplitContainer: "campaignActivitiesFragment--campaignActivities",
			centerReportUnchangedIdeasSplitContainer: "unchangedIdeasFragment--unchangedIdeas"
		},
		L: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			leftCommentContainer: "ideasCommentFragment--campaignComment",
			leftTagsContainer: "campaignTagsFragment--campaignTags",
			leftReportCampaignActivitiesContainer: "campaignActivitiesFragment--campaignActivities",
			leftReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas"
		},
		XL: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			leftCommentContainer: "ideasCommentFragment--campaignComment",
			leftTagsContainer: "campaignTagsFragment--campaignTags",
			rightReportCampaignActivitiesContainer: "campaignActivitiesFragment--campaignActivities",
			rightReportUnchangedIdeasContainer: "unchangedIdeasFragment--unchangedIdeas"
		}
	};

	return Controller.extend("sap.ino.vc.campaign.BackOfficeHome", jQuery.extend({}, IdentityProfileMixin, AssignmentActionMixin,
		ChangeStatusActionMixin, FollowUpMixin, DeleteActionMixin, CommentMixin, MergeActionMixin, TagCardMixin, BlogDeleteActionMixin,
		FollowMixin, RegistrationMixin, BlogCardMixin, VoteMixin, VolunteerMixin, FeedFormatter, FeedsMixin, MilestoneMixin,
		IdeaFormCriteriaFilterMixin, {

			// id of control that get initial focus
			//initialFocus: "backofficeButton--backofficeToogle",
			initialFocus: ["backofficeButton--backofficeToogle", "identityProfileFragment--createBlog"],
			formatter: jQuery.extend({
				unchangedIdeasColor: function(iCategory) {
					switch (iCategory) {
						case 0:
							return 'Good';
						case 1:
							return 'Neutral';
						case 2:
							return 'Critical';
						default:
							return 'Error';
					}
				},
				unchangedIdeasLabel: function(iCategory) {
					switch (iCategory) {
						case 0:
							return '1';
						case 1:
							return '<= 7';
						case 2:
							return '<= 30';
						default:
							return '> 30';
					}
				}

			}, this.formatter, EvaluationFormatter, FollowUpMixin.followUpMixinFormatter, FeedFormatter),

			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
				this.aBusyControls = [this.getView()];
				this._sBOHResizeIdeaListId = this.attachListControlResized(this.byId("ideasFragment--ideasList"));
			},

			onExit: function() {
				Controller.prototype.onExit.apply(this, arguments);
				this.detachListControlResized(this._sBOHResizeIdeaListId);
			},

			bindViewData: function() {
				this.getModel("view").setProperty("/CAMPAIGN_COMMENT_NAVIGATION_SECTION", "campaignSectionComments");
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

				this._bindUnchangedIdeas();
				this._bindActivities();
				this._bindComments();
				//this._bindFeed();
				this._bindTags();
			},

			onAfterRendering: function() {
				var oUnchangedIdeas = this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");
				var oCampaignActivities = this.byId("campaignActivitiesFragment--CampaignActivitiesFrame");
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
				}
				if (oCampaignActivities) {
					oCampaignActivities.setVizProperties(oVizProperties);
				}

				//vizFrame register the click event to navigate to report
				if (!this.getModel("device").getProperty("/system/phone")) {
					if (!oUnchangedIdeas.aBindParameters) {
						oUnchangedIdeas.attachBrowserEvent("click", this.onNavigateToReport, this);
					}

					if (!oCampaignActivities.aBindParameters) {
						oCampaignActivities.attachBrowserEvent("click", this.onNavigateToReport, this);
					}
				}
			},

			getList: function() {
				return this.byId("ideasFragment--ideasList");
			},

			// it is guaranteed that the data is already available, it is not guaranteed that the view is already rendered
			show: function(oParentView) {
				this._oParentView = oParentView;
				this.bindViewData();
				this.setIdentityProfileBinding();

				this.getList().attachUpdateFinished(this._onListUpdateFinished, this);
				this.bindMilestone(this.getCampaignId());
			},

			_onListUpdateFinished: function() {
				// accessibility: we need to update the aria property like this due to (for us) not usable behaviour of UI5
				var oList = this.getList();

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

			getLayout: function(sLayout) {
				return mLayout[sLayout];
			},

			setIdentityProfileBinding: function() {
				var sCampaignName = this.getView().getBindingContext("data").getProperty("SHORT_NAME");
				var mSettings = mIdentityProfile.Backoffice;
				
				var bRegisterAutoApprove = this.getView().getBindingContext("data").getProperty("IS_REGISTER_AUTO_APPROVE");
				var oCurrentDate = new Date();
			    var oRegisterFrom = this.getView().getBindingContext("data").getProperty("REGISTER_FROM");
			    var oRegisterTo = this.getView().getBindingContext("data").getProperty("REGISTER_TO");
				var bBetweenRegisterPeriod = false;
				if(oCurrentDate >= oRegisterFrom && oCurrentDate <= oRegisterTo){
				    bBetweenRegisterPeriod = true;
				}
				if(!bRegisterAutoApprove) {
				if(bBetweenRegisterPeriod){
				  jQuery.each(mSettings.Binding, function(i,oBinding){
				      if(oBinding.COUNT === "MY_PENDING_APPR_COUNT"){
				          oBinding.VISIBLE = true; 
				      }
				  });				    
				}}
				
				
				if(this.getView().getBindingContext("data").getProperty("REWARD")){
				  jQuery.each(mSettings.Binding, function(i,oBinding){
				      if(oBinding.COUNT === "QUALIFIED_IDEAS_FOR_REWARDS"){
				          oBinding.VISIBLE = true; 
				      }
				  });
				}
				

				mSettings.HEADLINE = sCampaignName;
				mSettings.HEADLINE_BACKGROUND = "#" + (this.getView().getBindingContext("data").getProperty("COLOR_CODE") || "FFFFFF");
				mSettings.PATH = mIdentityProfile.Backoffice.PATH_TEMPLATE + "(" + this.getCampaignId() + ")";

				this.getView().setModel(new JSONModel({
					ID: this.getCampaignId(),
					NAME: sCampaignName,
					_OBJECT_TYPE_CODE: "CAMPAIGN"
				}), "contextObject");

				this.bindIdentityProfile(this.byId("identityProfileFragment--identityProfile"), mSettings, this.getCampaignId(), this.byId(
					"identityProfileFragment--identityProfileButtons"));

				if (this.getModel("data").getProperty(mSettings.PATH)) {
					var oIdentityProfileList = this.byId("identityProfileFragment--identityProfileList");
					this.getModel("data").read(mSettings.PATH, {
						success: function() {
							var oBinding = oIdentityProfileList.getBindingInfo("items");
							oIdentityProfileList.bindItems(oBinding);
						}
					});
				}
			},

			getCampaignId: function() {
				return this.getView().getBindingContext("data") ? this.getView().getBindingContext("data").getProperty("ID") : undefined;
			},

			_bindIdeas: function(sKey, iCampId) {
				var bIsPhone = this.getModel("device").getProperty("/system/phone");
				if (iCampId || this.getCampaignId() && true) {
					var sPath = "data>/IdeaMediumBackofficeSearchParams(searchToken=''," + 
					   	"searchType=" + "0" + "," +
						"tagsToken=''," + "tagsToken1=''," + "tagsToken2=''," + "tagsToken3=''," + "tagsToken4=''," +
						"filterName='" + mList[sKey].filterParam + "'," +
						"filterBackoffice=1" + this.getEmptyIdeaformFilters() + 
						",cvt='" + "" + "'," + "cvr=" + "0"  + "," +  "cvy=" + "0"  + 
						")/Results";
					var oList = this.byId("ideasFragment--ideasList");
					var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;					
					var template = Number(disableImage) ? this.getFragment("sap.ino.vc.idea.fragments.ManageListItemNoImage") : this.getFragment(
						"sap.ino.vc.idea.fragments.ManageListItem");
					if (bIsPhone) {
						//oList.toggleStyleClass("sapInoListWidthXXXS", true);
						//oList.toggleStyleClass("sapInoListWidthL", false);
					} else {
						//oList.toggleStyleClass("sapInoListWidthXXXS", false);
						//oList.toggleStyleClass("sapInoListWidthL", true);
					}
					oList.bindItems({
						path: sPath,
						template: template,
						sorter: mList[sKey].sorter,
						filters: mList[sKey].filter.concat(new Filter("CAMPAIGN_ID", "EQ", iCampId || this.getCampaignId())),
						length: 4
					});
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

				}
			},
			_bindBlogs: function(sKey) {
				if (this.getCampaignId()) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var sPath = "data>/BlogSearchParams(searchToken=''," +
						"tagsToken=''," +
						"filterName='" + mBlogList[sKey].filterParam + "')/Results";
					var oBinding = {
						path: sPath,
						template: this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),
						sorter: mBlogList[sKey].sorter,
						filters: mBlogList[sKey].filter.concat(new Filter("CAMPAIGN_ID", "EQ", this.getCampaignId())),
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
				var oUnchangedIdeasFrame = this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");

				oUnchangedIdeasFrame.getParent().setVisible(true);
				var oDatamodel = this.getModel("data");
				oDatamodel.read("/CampaignUnchangedIdeas", {
					async: true,
					filters: [new Filter("CAMPAIGN_ID", "EQ", this.getCampaignId())],
					success: function(oData) {
						if (oData.results && oData.results[0]) {
							oUnchangedIdeasFrame.getParent().setVisible(true);
							oUnchangedIdeasFrame.getParent().getParent().getContent()[1].setVisible(false);

							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData);
							oUnchangedIdeasFrame.setModel(oModel);
						} else {
							oUnchangedIdeasFrame.getParent().setVisible(false);
							oUnchangedIdeasFrame.getParent().getParent().getContent()[1].setVisible(true);
						}
					}
				});
			},

			_bindActivities: function() {
				// bind votes chart
				var oCampaignActivitiesFrame = this.byId("campaignActivitiesFragment--CampaignActivitiesFrame");

				oCampaignActivitiesFrame.getParent().setVisible(true);
				var oDatamodel = this.getModel("data");
				oDatamodel.read("/CampaignActivities", {
					async: true,
					filters: [new Filter("CAMPAIGN_ID", "EQ", this.getCampaignId())],
					success: function(oData) {
						if (oData.results && oData.results[0]) {
							oCampaignActivitiesFrame.getParent().setVisible(true);
							oCampaignActivitiesFrame.getParent().getParent().getContent()[1].setVisible(false);

							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData);
							oCampaignActivitiesFrame.setModel(oModel);
						} else {
							oCampaignActivitiesFrame.getParent().setVisible(false);
							oCampaignActivitiesFrame.getParent().getParent().getContent()[1].setVisible(true);
						}
					}
				});

				var oTitle = this.byId("campaignActivitiesFragment--panelTitle");
				oTitle.setText(this.getText("MW_TCO_TIT_ACTIVITIES_MONTH", [this.getText("MONTH_FLD_" + (new Date().getMonth() + 1))]));
			},

			_bindComments: function() {
				var oCommentList = this.byId("ideasCommentFragment--campaginCommentList");
				var oBindingInfo = oCommentList.getBindingInfo("items");
				oCommentList.bindItems(oBindingInfo);
			},

			_bindTags: function() {
				if (!this._oTagTokenizer) {
					this._oTagTokenizer = this.byId("campaignTagsFragment--campaignTags").getContent()[0];
				}
				this.byId("campaignTagsFragment--campaignTags").getContent()[0].setBusy(true);

				var oTagsTokenizer = this.byId("campaignTagsFragment--Tags");
				var oBindingInfo = oTagsTokenizer.getBindingInfo("tokens");
				oTagsTokenizer.bindAggregation("tokens", oBindingInfo);

				var oDatamodel = this.getModel("data");
				var sPath = this.getView().getBindingContext("data").sPath + "/Tags";
				var that = this;
				oDatamodel.read(sPath, {
					async: true,
					success: function(oData) {
						var oCampaignTags = that.byId("campaignTagsFragment--campaignTags");
						oCampaignTags.removeContent(oCampaignTags.getContent()[0]);
						if (oData.results.length === 0) {
							var oHBox = new sap.m.HBox().addStyleClass("sapInoCampaignTagsContainerNoTags");
							oHBox.addItem(new sap.m.Text({
								text: that.getText("CAMPAIGN_LIST_FLD_NO_TAGS"),
								width: "100%"
							}).setTextAlign(TextAlign.Center));
							oCampaignTags.addContent(oHBox);
						} else {
							oCampaignTags.addContent(that._oTagTokenizer);
						}
						that.byId("campaignTagsFragment--campaignTags").getContent()[0].setBusy(false);
					}
				});
			},

			_bindFeed: function() {
				var self = this;
				var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/feed.xsjs";
				var aParameter = [];
				if (this.getCampaignId()) {
					aParameter.push("campaign=" + this.getCampaignId());
					aParameter.push("top=4");
				}

				if (aParameter.length > 0) {
					sPath = sPath + "?" + aParameter.join("&");
				}

				var oFeedModel = new JSONModel(sPath);

				oFeedModel.attachRequestCompleted(null, function() {
					if (oFeedModel.oData.results) {
						jQuery.each(oFeedModel.oData.results, function(iIndex, oFeed) {
							oFeed.EVENT_AT = new Date(oFeed.EVENT_AT);
						});
					}
					var oFeedList = self.byId("feedsFragment--feedList");
					oFeedList.setModel(oFeedModel, "feed");
				}, oFeedModel);
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
				var iCampId = this.getCampaignId();
				if (!this._sIdeaViewKey) {
					this.navigateTo("campaign-idealist", {
						id: iCampId
					});
				} else {
					this.navigateTo("campaign-idealistvariant", {
						id: iCampId,
						variant: this._sIdeaViewKey
					});
				}
			},
			onNavigateToBlogs: function() {
				var iCampId = this.getCampaignId();
				if (!this._sBlogViewKey) {
					this.navigateTo("campaign-bloglist", {
						id: iCampId
					});
				} else {
					this.navigateTo("campaign-bloglistvariant", {
						id: iCampId,
						variant: mBlogList[this._sBlogViewKey].name
					});
				}
			},

			onItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				oItem.$().attr("aria-label", this.getText());
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("idea-display", {
						id: oContext.getProperty("ID")
					});
				}
			},

			onNavigateToComment: function() {
				var iCampId = this.getCampaignId();
				this.navigateTo("campaign-comment", {
					id: iCampId
				});
			},

			onNavigateToCampaignFeeds: function(oEvent) {
				this.navigateTo("campaign-feeds", {
					id: this.getCampaignId()
				});
			},

			onNavigateToReport: function(oEvent) {
				var iCampId = this.getCampaignId();

				//var aIdComponents = oEvent.currentTarget.id.split("--");
				var aIdComponents = ((oEvent.currentTarget && oEvent.currentTarget.id) ||
					(oEvent.oSource.sId)).split("--");
				var sFrameId = aIdComponents[aIdComponents.length - 1];

				this.navigateTo("report", {
					code: mReport[sFrameId],
					query: {
						campaign: iCampId
					}
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

			onOpenCampaignSettings: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					if (oController.openCampaignSettings) {
						oController.openCampaignSettings(this.getCampaignId());
					}
				}
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
						var oModel = new JSONModel();
						oModel.setData(oData);
						that._oPopover.setModel(oModel, "Tag");
						jQuery.sap.delayedCall(0, that, function() {
							that._oPopover.openBy(oToken);
						});
					}
				});
			},
			onEditBlog: function(oEvent) {
				var oSource = oEvent.getSource();
				this.navigateTo("blog-edit", {
					id: oSource.getBindingContext("data").getProperty("ID")
				});
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
			}

		}));
});