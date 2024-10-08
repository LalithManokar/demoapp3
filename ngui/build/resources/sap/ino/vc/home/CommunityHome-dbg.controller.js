
sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/iam/mixins/IdentityProfileMixin",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/vc/idea/RewardFormatter",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ui/core/IconPool",
    "sap/ino/vc/follow/mixins/FeedsMixin",
    "sap/ino/commons/models/object/Homepagewidget",
    "sap/ui/model/json/JSONModel"
], function(Controller,
	IdentityProfileMixin,
	Configuration,
	Sorter,
	Filter,
	VoteMixin, 
	FollowMixin, 
	ObjectListFormatter, 
	TagCardMixin, RegistrationMixin, RewardFormatter, VolunteerMixin, IconPool, FeedsMixin, Homepagewidget, JSONModel) {
	"use strict";

	var mIdentityProfile = {
		Community: {
			PATH: "/EntityCount(1)",
			SHOW_BUTTONS: true,
			Binding: [{
				ICON: "sap-icon://InoIcons/campaign",
				LINK_TEXT: "PROFILE_LNK_CAMPAIGNS_OPENED",
				COUNT: "OPEN_CAMPAIGN_COUNT",
				Route: {
					NAME: "campaignlistvariant",
					QUERY: {
						variant: "open"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role","sap.ino.ui::camps_part_role"]
            }, 
    //         {
				// ICON: "sap-icon://lightbulb",
				// LINK_TEXT: "PROFILE_LNK_PENDING_EVAL_MY",
				// COUNT: "EVALUATION_PENDING_COUNT",
				// EXPERT: true,
				// Route: {
				// 	NAME: "idealistvariant",
				// 	QUERY: {
				// 		variant: "evalpending"
				// 	}
				// },
				// ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
				// 	"sap.ino.ui::camps_resp_expert_role"]
    //         }, 
            {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_OPEN_FOR_EVALUATION",
				COUNT: "EVALUATION_OPEN_COUNT",
				EXPERT: true,
				Route: {
					NAME: "idealistvariant",
					QUERY: {
						variant: "evalopen"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_IDEAS_MY",
				COUNT: "AUTHORED_IDEA_COUNT",
				Route: {
					NAME: "idealistvariant",
					QUERY: {
						variant: "my"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_part_role"]
            }, {
				ICON: "sap-icon://lightbulb",
				LINK_TEXT: "PROFILE_LNK_EVAL_BY_ME",
				COUNT: "EVALUATED_IDEA_COUNT",
				EXPERT: true,
				Route: {
					NAME: "idealistvariant",
					QUERY: {
						variant: "eval"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role"]
            }, {
				ICON: "sap-icon://InoIcons/wall",
				LINK_TEXT: "PROFILE_LNK_WALLS_MY",
				COUNT: "MY_WALLS_COUNT",
				Route: {
					NAME: "walllistvariant",
					QUERY: {
						variant: "my"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_part_role"]
            }, {
				ICON: "sap-icon://InoIcons/heart",
				LINK_TEXT: "PROFILE_LNK_MY_VOTES",
				COUNT: "MY_VOTES_IDEA_COUNT",
				Route: {
					NAME: "idealistvariant",
					QUERY: {
						variant: "voted"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_part_role"]
            }, {
				ICON: "sap-icon://comment",
				LINK_TEXT: "PROFILE_LNK_MY_COMMENTS",
				COUNT: "MY_COMMENTS_IDEA_COUNT",
				Route: {
					NAME: "idealistvariant",
					QUERY: {
						variant: "commented"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_part_role"]
            }, {
				ICON: IconPool.getIconURI('following', 'InoIcons'),
				LINK_TEXT: "PROFILE_LNK_FOLLOWED_MY",
				COUNT: "MY_FOLLOWED_COUNT",
				Route: {
					NAME: "followlistvariant",
					QUERY: {
						variant: "campaign"
					}
				},
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_part_role"]
            }
    //         , {
				// ICON: "sap-icon://clinical-tast-tracker",
				// LINK_TEXT: "PROFILE_LNK_PENDING_EVAL_REQ_MY",
				// COUNT: "MY_PENDING_EVAL_ITEM_COUNT",
				// Route: {
				// 	NAME: "evalreqlistvariant",
				// 	QUERY: {
				// 		variant: "forme"
				// 	}
				// },
				// ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role", "sap.ino.ui::camps_expert_role",
				// 	"sap.ino.ui::camps_resp_expert_role"]              
    //         }
            ]
		}
	};

	var mList = {
		"my": {
			sPath: "data>/MyIdeaMediumCommunity",
			sorter: new Sorter("CHANGED_AT", true)
		},
		"all": {
			sPath: "data>/IdeaMediumCommunity",
			filter: [new Filter("STATUS", "NE", "sap.ino.config.DRAFT")],
			sorter: new Sorter("SUBMITTED_AT", true)
		},
		"completed": {
		    sPath: "data>/IdeaMediumSearchParams(searchToken='',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='completedIdeas',filterBackoffice=0,c1='',o1=-2,v1='',c2='',o2=-1,v2='',c3='',o3=-1,v3='',cvt='',cvr=0,cvy=0)/Results",
			sorter: new Sorter("SUBMITTED_AT", true)
		}
	};

	// mapping of container and content ids for each layout size
	var mLayout = {
		XS: {
			centerProfileContainer: "identityProfileFragment--identityProfile",
			centerTopContributorContainer: "topContributorFragment--topContributor",
			centerBlogContainer: "blogsFragment--blogCommunity",
			rightTopContributorContainer: undefined,
			leftProfileContainer: undefined
		},
		S: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerTopContributorContainer: "topContributorFragment--topContributor",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		M: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerTopContributorContainer: "topContributorFragment--topContributor",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		L: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			centerTopContributorContainer: "topContributorFragment--topContributor",
			centerBlogContainer: "blogsFragment--blogCommunity"
		},
		XL: {
			leftProfileContainer: "identityProfileFragment--identityProfile",
			rightTopContributorContainer: "topContributorFragment--topContributor",
			rightTopBlogContainer: "blogsFragment--blogCommunity"
		}
	};

	return Controller.extend("sap.ino.vc.home.CommunityHome", jQuery.extend({}, IdentityProfileMixin, VoteMixin, FollowMixin, TagCardMixin,
		RegistrationMixin, VolunteerMixin, ObjectListFormatter, FeedsMixin, {

			identityProfile : mIdentityProfile,
			list : mList,
			
			formatter: jQuery.extend({}, ObjectListFormatter, RewardFormatter),

			initialFocus: ["backofficeButton--backofficeToogle", "identityProfileFragment--createIdea"],

			onInit: function() {
				Controller.prototype.onInit.apply(this, arguments);
				this.aBusyControls = [this.getView()];
				
				// get home page widget configuration
				var oDeffered = Homepagewidget.getCommunityHomepageWidget();
				oDeffered.done(function(oData) {
				    var oWidgetData = oData.RESULT[0] || {IS_VISIBLE: false, HTML_CONTENT: ""};
                    oWidgetData.IS_VISIBLE = !!oWidgetData.IS_VISIBLE;
                    this.getView().setModel(new JSONModel(oWidgetData), "widget");
				}.bind(this));
			},

			feedTitleLink: function(iObjectId, sObjectTypeCode) {
				if (!isNaN(parseInt(iObjectId, 10))) {
					switch (sObjectTypeCode) {
						case 'CAMPAIGN':
							return ObjectListFormatter.navigationLink.apply(this, ["campaign", {
								id: iObjectId
    				    }]);
						case 'IDEA':
							return ObjectListFormatter.navigationLink.apply(this, ["idea-display", {
								id: iObjectId
    				    }]);
    				    default:
    				        break;
					}

				}
				return undefined;
			},

			show: function(oParentView) {
				this._oParentView = oParentView;
				this.setIdentityProfileBinding();
				this.bindViewData();
			},

			setIdentityProfileBinding: function() {
				this.bindIdentityProfile(this.byId("identityProfileFragment--identityProfile"), mIdentityProfile.Community);

				if (this.getModel("data").getProperty(mIdentityProfile.Community.PATH)) {
					var oController = this;
					this.getModel("data").read(mIdentityProfile.Community.PATH, {
						success: function() {
							var oBinding = oController.byId("identityProfileFragment--identityProfileList").getBindingInfo("items");
							oController.byId("identityProfileFragment--identityProfileList").bindItems(oBinding);
						}
					});
				}
			},

			bindViewData: function() {
				this._bindCampaigns();
				this.setViewProperty("/IS_COMMUNITY_VIEW", true); //->Mark Community view, No edit&delete button in Blog list
				var sIdeaViewKey;
				if (this.getModel("device").getProperty("/system/phone")) {
					sIdeaViewKey = Object.keys(mList)[0];
				} else {
					sIdeaViewKey = this.byId("ideasFragment--sapInoHomeIdeasButtons").getSelectedKey();
				}
				this._sIdeaViewKey = sIdeaViewKey || Object.keys(mList)[0];
				this._bindIdeas(this._sIdeaViewKey);
				this._bindBlogs();
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

			_bindCampaigns: function() {
				var sPath = "data>/CampaignSearchParams(searchToken=''," +
					"tagsToken=''," + "tagsToken1=''," + "tagsToken2=''," + "tagsToken3=''," + "tagsToken4=''," +
					"filterName='openCampaigns'," +
					"filterBackoffice=0)/Results";
				var oCarousel = this.byId("campaignsListFragment--campaignsCarousel");
				oCarousel.bindAggregation(
					"pages", {
						path: sPath,
						template: this.createFragment("sap.ino.vc.home.fragments.CampaignBanner"),
						length: 4,
						top: 4,
						filters: [new Filter("STATUS_CODE", "NE", "sap.ino.config.CAMP_DRAFT")],
						sorter: new Sorter("SUBMIT_TO", false)
					}
				);
			},

			_bindIdeas: function(sKey) {
				var bIsPhone = this.getModel("device").getProperty("/system/phone");
                var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;
				var template = Number(disableImage) ? this.getFragment("sap.ino.vc.idea.fragments.CardListItemNoImage") : this.getFragment("sap.ino.vc.idea.fragments.CardListItem");
				var oTemplate = {
					path: mList[sKey].sPath,
					template: template,
					length: 4,
					top: 4,
					sorter: mList[sKey].sorter,
					filters: mList[sKey].filter
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
					oCarousel.bindAggregation("pages", oTemplate);
					sPath = Configuration.getBackendRootURL() + sOdataPath + oCarousel.mBindingInfos.pages.binding.sPath + "?$format=json";
    				sFilter = oCarousel.mBindingInfos.pages.binding.sFilterParams;
    				sSorter = oCarousel.mBindingInfos.pages.binding.sSortParams;
				} else {
					var oList = this.byId("ideasFragment--ideasList");
					oList.bindItems(oTemplate);
					oList.attachEventOnce("updateFinished", function(oEvent) {
						that.onResizeLayoutChange(null, that._sCurrentLayout);
					});
					sPath = Configuration.getBackendRootURL() + sOdataPath + oList.mBindingInfos.items.binding.sPath + "?$format=json";
    				sFilter = oList.mBindingInfos.items.binding.sFilterParams;
    				sSorter = oList.mBindingInfos.items.binding.sSortParams;
				}

				// set title accordingly
				var oTitle = this.byId("ideasFragment--panelTitle");
				oTitle.setText(this.getText("HOMEPAGE_PANEL_IDEAS_" + sKey.toUpperCase()));
				// set idea list search params
				sPath = sPath + "&" + sSorter + "&" + sFilter + sSelect;
				var oIdeaSearchParams = new JSONModel();
				oIdeaSearchParams.setData({
				    path: sPath
				});
				sap.ui.getCore().setModel(oIdeaSearchParams, "ideaSearchParams");
			},

			_bindBlogs: function() {
				if (Configuration.getCurrentUser().USER_ID) {
					var bIsPhone = this.getModel("device").getProperty("/system/phone");
					var sPath = "data>/BlogSearchParams(searchToken=''," +
						"tagsToken=''," +
						"filterName='publishedBlogs')/Results";
					var oBinding = {
						path: sPath,
						template: this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),
						sorter: new Sorter("PUBLISHED_AT", true),
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

			onIdeaListTypeSelect: function(oEvent) {
				// two options: either by SegmentedButton or Select
				this._sIdeaViewKey = oEvent.getParameter("key") || oEvent.getParameter("selectedItem") && oEvent.getParameter("selectedItem").getKey();
				this._bindIdeas(this._sIdeaViewKey);
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
				this.navigateTo("bloglist");
			},

			onNavigateToCampaigns: function() {
				this.navigateTo("campaignlistvariant", {
					variant: "open"
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

			onCardItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oIdeaCard = oItem.getAggregation("content")[0];
				oIdeaCard.getFocusDomRef().focus();
			},

			onCreateIdea: function(oEvent) {
				this.navigateTo("idea-create", {
					query: {
						campaign: oEvent.getParameter("campaignId")
					}
				});
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

			onOpenCampaign: function(oEvent) {
				this.navigateTo("campaign", {
					id: oEvent.getParameter("campaignId")
				});
			},

			getLayout: function(sLayout) {
				return mLayout[sLayout];
			},

			onBackofficeSettings: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					if (oController.onBackofficeSettings) {
						oController.onBackofficeSettings();
					}
				}
			},

			onNavigateToFeedList: function() {
				this.navigateTo("feedlist");
			},

			onOfficeToggle: function() {
				if (this._oParentView) {
					var oController = this._oParentView.getController();
					if (oController.switchView) {
						oController.switchView();
					}
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