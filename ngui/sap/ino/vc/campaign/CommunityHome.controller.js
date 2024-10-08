sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/ResizeHandler",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ui/core/TextAlign",
    "sap/ino/vc/comment/CommentMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/campaign/mixins/CampaignProfileMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/blog/mixins/BlogCardMixin",
    "sap/ui/core/IconPool",
    "sap/ino/vc/follow/mixins/FeedsMixin",
    "sap/ino/vc/campaign/mixins/MilestoneMixin"
], function(Controller, Device, JSONModel, TopLevelPageFacet, Configuration, ResizeHandler,
	Sorter, Filter, FilterOperator, EvaluationFormatter, TextAlign,
	CommentMixin, VoteMixin, TagCardMixin, FollowMixin, FeedFormatter, RegistrationMixin, CampaignProfileMixin, VolunteerMixin, BlogCardMixin,
	IconPool, FeedsMixin, MilestoneMixin) {
	"use strict";

	var mIdentityProfile = {
		Community: {
			PATH_TEMPLATE: "/CampaignCommunityEntityCount",
			SHOW_BUTTONS_AUTH: true,
			Binding: [{
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_ALL",
				COUNT: "ALL_IDEAS_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "all"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role", "camp_instance_part_role",
				"camp_instance_expert_role", "camp_instance_resp_expert_role"]
            },
			    {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_OPEN_FOR_VOTING",
				COUNT: "OPEN_VOTING_IDEAS_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "vote"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role", "camp_instance_part_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_EVA_PENDING_FOR_ME",
				COUNT: "EVALUATION_PENDING_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "evalpending"
					}
				},
				ROLES: ["camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_OPEN_FOR_EVA",
				COUNT: "OPEN_EVALUATION_IDEA_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "evalopen"
					}
				},
				ROLES: ["camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_EVA_BY_ME",
				COUNT: "MY_EVALUATED_IDEA_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "eval"
					}
				},
				ROLES: ["camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }
    //         , {
				// ICON: "sap-icon://lightbulb",
				// LINK_TEXT: "PROFILE_LNK_IDEAS_SUBMITTED",
				// COUNT: "SUBMITTED_IDEA_COUNT",
				// Route: {
				// 	NAME: "campaign-idealist",
				// 	QUERY: {
				// 	    variant: "myAuthoredIdeas"
				// 	}
				// },
				// ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role", "camp_instance_part_role",
				// 	"camp_instance_expert_role", "camp_instance_resp_expert_role"]
    //         }
            , {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_MY",
				COUNT: "MY_ALL_IDEA_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "my"
					}
				},
				ROLES: ["camp_instance_part_role", "camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }, {
				ICON: "sap-icon://comment",
				LINK_TEXT: "PROFILE_LNK_IDEAS_MY_COMMENTS",
				COUNT: "MY_COMMENT_IDEA_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "commented"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role", "camp_instance_part_role",
					"camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }, {
				ICON: "sap-icon://InoIcons/heart",
				LINK_TEXT: "PROFILE_LNK_IDEAS_MY_VOTES",
				COUNT: "MY_VOTE_IDEA_COUNT",
				Route: {
					NAME: "campaign-idealistvariant",
					QUERY: {
						variant: "voted"
					}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role", "camp_instance_resp_coach_role", "camp_instance_part_role",
					"camp_instance_expert_role", "camp_instance_resp_expert_role"]
            }, {
				ICON: "sap-icon://survey",
				LINK_TEXT: "HOMEPAGE_PANEL_CAMPAIGN_BLOGS",
				COUNT: "CAMPAIGN_BLOGS_COUNT",
				Route: {
					NAME: "campaign-bloglist",
					QUERY: {}
				},
				ROLES: ["camp_instance_mgr_role", "camp_instance_coach_role"]
            }]
		}
	};

	var mLayout = {
		XS: {
			centerProfileContainer: "CampaignProfileFragment--campaignProfile",
			centerCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers",
			centerCampaignTagsContainer: "campaignTagsFragment--campaignTags",
			rightTopCommentatorContainer: undefined,
			centerTopCommentatorSplitContainer: undefined,
			centerCommentContainer: "commentFragment--campaignComment",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		S: {
			leftProfileContainer: "CampaignProfileFragment--campaignProfile",
			centerCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers",
			centerCampaignTagsContainer: "campaignTagsFragment--campaignTags",
			rightTopCommentatorContainer: undefined,
			centerTopCommentatorSplitContainer: undefined,
			centerCommentContainer: "commentFragment--campaignComment",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		M: {
			leftProfileContainer: "CampaignProfileFragment--campaignProfile",
			centerCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers",
			centerCampaignTagsContainer: "campaignTagsFragment--campaignTags",
			rightTopCommentatorContainer: undefined,
			centerTopCommentatorSplitContainer: undefined,
			centerCommentSplitContainer: "commentFragment--campaignComment",
			centerBlogSplitContainer: "blogsFragment--blogCommunity"
		},
		L: {
			leftProfileContainer: "CampaignProfileFragment--campaignProfile",
			leftCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers",
			leftCampaignTagsContainer: "campaignTagsFragment--campaignTags",
			centerTopCommentatorSplitContainer: "topCommentatorFragment--topCommentator",
			centerCommentSplitContainer: "commentFragment--campaignComment",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		XL: {
			leftProfileContainer: "CampaignProfileFragment--campaignProfile",
			leftCampaignManagerContainer: "CampaignManagersFragment--CampaignManagers",
			leftCampaignTagsContainer: "campaignTagsFragment--campaignTags",
			rightTopCommentatorContainer: "topCommentatorFragment--topCommentator",
			rightCommentContainer: "commentFragment--campaignComment",
			rightBlogContainer: "blogsFragment--blogCommunity"
		}
	};

	return Controller.extend("sap.ino.vc.campaign.CommunityHome", jQuery.extend({}, FeedFormatter, CommentMixin, VoteMixin, TagCardMixin,
		FollowMixin,
		RegistrationMixin, CampaignProfileMixin, VolunteerMixin, BlogCardMixin, FeedsMixin, MilestoneMixin, {

			identityProfile: mIdentityProfile,

			formatter: jQuery.extend({}, this.formatter, EvaluationFormatter, FeedFormatter),

			// id of control that get initial focus
			initialFocus: ["backofficeButton--backofficeToogle", "identityProfileFragment--createIdea"],

			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
				this.aBusyControls = [this.getView()];
			},

			bindViewData: function() {
				this.getModel("view").setProperty("/CAMPAIGN_COMMENT_NAVIGATION_SECTION", "campaignSectionComments");
				this.setViewProperty("/IS_COMMUNITY_VIEW", true);
				this._bindIdeas(this.getCampaignId());
				this._bindBlogs(this.getCampaignId());
				this._bindTopList();
				this._bindComments();
				this._bindTags();
				//this._bindFeed();
				this._bindRegisterButton();

				this.getView().setModel(new JSONModel({
					ID: this.getView().getBindingContext("data").getProperty("ID"),
					NAME: this.getView().getBindingContext("data").getProperty("SHORT_NAME"),
					_OBJECT_TYPE_CODE: "CAMPAIGN"
				}), "contextObject");
				//this._bindBannerList();
			},

			show: function(oParentView) {
				if (!this.getView().getBindingContext("data")) {
					return;
				}
				this._oParentView = oParentView;
				this.bindViewData();
				this.setIdentityProfileBinding();
				var banner = this.byId('campaignBannerList');
				banner.addEventDelegate({
					onAfterRendering: jQuery.proxy(function() {
                        $(".sapMCrslInner.sapMCrslBottomOffset").height($('#' + banner.getActivePage()).parents('.sapMCrslItem').height() + "px");					    
						$('#' + banner.getActivePage()).parents('.sapMCrslItem ').fadeIn();
						//banner.firePageChanged();
					}, this)
				});
				this.bindMilestone(this.getCampaignId());
			},

			getLayout: function(sLayout) {
				return mLayout[sLayout];
			},

			setIdentityProfileBinding: function() {
				var sCampaignName = this.getView().getBindingContext("data").getProperty("SHORT_NAME");

				var mSettings = mIdentityProfile.Community;

				mSettings.HEADLINE = sCampaignName;
				mSettings.HEADLINE_BACKGROUND = "#" + (this.getView().getBindingContext("data").getProperty("COLOR_CODE") || "FFFFFF");
				mSettings.PATH = mIdentityProfile.Community.PATH_TEMPLATE + "(" + this.getCampaignId() + ")";

				this.bindIdentityProfile(this.byId("CampaignProfileFragment--campaignProfile"), mSettings, this.getCampaignId(), this.byId(
					"CampaignProfileFragment--identityProfileButtons"));

				if (this.getModel("data").getProperty(mSettings.PATH)) {
					var oIdentityProfileList = this.byId("CampaignProfileFragment--identityProfileList");
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

			onResizeLayoutChange: function(sOldSize, sNewSize) {
				var that = this;

				function setVisibility(aList, iNrShown) {
					for (var i = 0; i < aList.length; i += 1) {
						if (i < iNrShown) {
							aList[i].setVisible(true);
						} else {
							aList[i].setVisible(false);
						}
					}
				}

				function setVisibleItems(sListId) {
					var oList = that.byId(sListId);
					var aItems = oList.getItems();
					switch (sNewSize) {
						case "XL":
							//campaign blogs list should be shown 3 items on the right
							if (sListId === "blogsFragment--blogsList") {
								setVisibility(aItems, 3);
							} else {
								setVisibility(aItems, 4);
							}
							break;
						case "L":
							setVisibility(aItems, 4);
							break;
						case "M":
							setVisibility(aItems, 3);
							break;
						case "S":
							setVisibility(aItems, 2);
							break;
						case "XS":
							setVisibility(aItems, 1);
							break;
						default:
							break;
							// do nothing - unknown size
					}
				}

				var bIsPhone = this.getModel("device").getProperty("/system/phone");
				if (!bIsPhone) {
					// card hiding based on size
					setVisibleItems("ideasFragment--ideasList");
					setVisibleItems("blogsFragment--blogsList");
				}
			},

			_bindIdeas: function(iCampId) {
				if (iCampId || this.getCampaignId()) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;					
					var template = Number(disableImage) ? this.getFragment("sap.ino.vc.idea.fragments.CardListItemNoImage") : this.getFragment(
						"sap.ino.vc.idea.fragments.CardListItem");
					var oBinding = {
						path: "data>/IdeaMediumCommunity",
						template: template,
						sorter: new Sorter("SUBMITTED_AT", true),
						filters: [
                        new Filter("STATUS", "NE", "sap.ino.config.DRAFT"),
                        new Filter("CAMPAIGN_ID", "EQ", iCampId || this.getCampaignId())
                    ],
						length: 4,
						top: 4
					};
					var that = this;
					var sPath = "";
    				var sFilter = "";
    				var sSorter = "";
        			var sSelect = "&$select(ID)";
        			var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");
    			    var sOdataPath = "";
    			    if (bBackoffice) {
    			        sOdataPath = "/sap/ino/xs/rest/backoffice/odata.xsodata";
    			    } else {
    			        sOdataPath = "/sap/ino/xs/rest/community/odata.xsodata";
    			    }
					if (bIsPhone) {
						var oCarousel = this.byId("ideasFragment--ideasCarousel");
						oCarousel.bindAggregation("pages", oBinding);
						sPath = Configuration.getBackendRootURL() + sOdataPath + oCarousel.mBindingInfos.pages.binding.sPath + "?$format=json";
        				sFilter = oCarousel.mBindingInfos.pages.binding.sFilterParams;
        				sSorter = oCarousel.mBindingInfos.pages.binding.sSortParams;
					} else {
						var oList = this.byId("ideasFragment--ideasList");
						if (oList) {
							oList.bindItems(oBinding);
							oList.attachEventOnce("updateFinished", function() {
								that.onResizeLayoutChange(null, that._sCurrentLayout);
							});
							sPath = Configuration.getBackendRootURL() + sOdataPath + oList.mBindingInfos.items.binding.sPath + "?$format=json";
            				sFilter = oList.mBindingInfos.items.binding.sFilterParams;
            				sSorter = oList.mBindingInfos.items.binding.sSortParams;
						}
					}
					sPath = sPath + "&" + sSorter + "&" + sFilter + sSelect;
    				var oIdeaSearchParams = new JSONModel();
    				oIdeaSearchParams.setData({
    				    path: sPath
    				});
    				sap.ui.getCore().setModel(oIdeaSearchParams, "ideaSearchParams");
				}
			},
			_bindBlogs: function() {
				if (this.getCampaignId()) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var sPath = "data>/BlogSearchParams(searchToken=''," +
						"tagsToken=''," +
						"filterName='publishedBlogs')/Results";
					var oBinding = {
						path: sPath,
						template: this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),
						sorter: new Sorter("PUBLISHED_AT", true),
						filters: [new Filter("CAMPAIGN_ID", "EQ", this.getCampaignId())],
						length: 4,
						top: 4
					};
					var that = this;
					if (bIsPhone) {
						var oCarousel = this.byId("blogsFragment--blogsCarousel");
						oCarousel.bindAggregation("pages", oBinding);
					} else {
						var oList = this.byId("blogsFragment--blogsList");
						if (oList) {
							oList.bindItems(oBinding);
							oList.attachEventOnce("updateFinished", function() {
								that.onResizeLayoutChange(null, that._sCurrentLayout);
							});
						}
					}
					var oTitle = this.byId("blogsFragment--panelBlogTitle");
					oTitle.setText(this.getText("HOMEPAGE_PANEL_CAMPAIGN_BLOGS"));
				}
			},

			_bindTopList: function() {
			    var bHasHomePageSetting = !!this.getView().getBindingContext("data").getProperty("MANAGER_HAS_DISPLAY_HOMEPAGE_SETTING");
				var oCampaignManagerBind = this.byId("CampaignManagersFragment--CampaignManagersList").getBindingInfo("items");
				var oCommentatorsBind = this.byId("topCommentatorFragment--topCommentatorsList").getBindingInfo("items");
				if(bHasHomePageSetting){
				   oCampaignManagerBind.sorter = [];
				   var oCampMgrFilter = new Filter("DISPLAY_HOMEPAGE","EQ",1);
				   oCampaignManagerBind.filters = oCampMgrFilter;
				}
				this.byId("CampaignManagersFragment--CampaignManagersList").bindItems(oCampaignManagerBind);
				this.byId("topCommentatorFragment--topCommentatorsList").bindItems(oCommentatorsBind);
			},

			_bindComments: function() {
				var oCommentList = this.byId("commentFragment--campaginCommentList");
				var oBindingInfo = oCommentList.getBindingInfo("items");
				oCommentList.bindItems(oBindingInfo);
			},

			_bindRegisterButton: function() {
				var oRegisterButton = this.byId("CampaignProfileFragment--registerButton");
				var oBindingInfo;
				var iCampaignId = this.getView().getBindingContext("data").getProperty("ID");
				var sPath = "/CampaignFull(" + iCampaignId + ")";
				this.getModel("data").read(sPath, {
					urlParameters: {
						"$select": "REGISTER_STATUS"
					},
					success: function() {
						oBindingInfo = oRegisterButton.getBindingInfo("enabled");
						oRegisterButton.bindProperty("enabled", oBindingInfo);
						oBindingInfo = oRegisterButton.getBindingInfo("icon");
						oRegisterButton.bindProperty("icon", oBindingInfo);
						oBindingInfo = oRegisterButton.getBindingInfo("text");
						oRegisterButton.bindProperty("text", oBindingInfo);
						oBindingInfo = oRegisterButton.getBindingInfo("visible");
						oRegisterButton.bindProperty("visible", oBindingInfo);
					}
				});
			},

			_bindBannerList: function() {
				var oBannerList = this.byId("campaignBannerList");
				//if (oBannerList.getAggregation("pages") && oBannerList.getAggregation("pages")[0]) {
					var oBinding = oBannerList.getBindingInfo("pages");
					oBannerList.setActivePage(0);
					oBannerList.firePageChanged();
					oBannerList.bindAggregation("pages", oBinding);
				//}
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

			onAfterRendering: function() {
				this._bindBannerList();
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

			onOpenCampaign: function() {
				// we do not want to do anything, as we are already on the campaign page
			},

			onNavigateToIdeas: function() {
				this.navigateTo("campaign-idealist", {
					id: this.getCampaignId()
				});
			},
			onNavigateToBlogs: function() {
				this.navigateTo("campaign-bloglist", {
					id: this.getCampaignId()
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
			},
			onCardItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oIdeaCard = oItem.getAggregation("content")[0];
				oIdeaCard.getFocusDomRef().focus();
			},

			onNavigateToComment: function() {
				this.navigateTo("campaign-comment", {
					id: this.getCampaignId()
				});
			},
			onNavigateToCampaignFeeds: function() {
				this.navigateTo("campaign-feeds", {
					id: this.getCampaignId()
				});
			},
			onOfficeToggle: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					oController.switchView();
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

			onNavigateToManagers: function() {
				this.navigateTo("campaign-managerlist", {
					id: this.getCampaignId()
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
			},

			onChangePage: function(event) {
				var parameters = event.getParameters();
				var newPage = parameters.newActivePageId;
				$(".sapMCrslInner.sapMCrslBottomOffset").height($('#' + newPage).parents('.sapMCrslItem').height() + "px");
				$('#' + newPage).parents('.sapMCrslItem').fadeIn().siblings().hide().fadeIn();
			}

		}));

});