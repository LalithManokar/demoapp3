sap.ui.define(["sap/ino/vc/commons/BaseObjectController","sap/ino/commons/application/Configuration","sap/ino/vc/iam/mixins/IdentityProfileMixin","sap/ui/model/Sorter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel","sap/ino/vc/evaluation/EvaluationFormatter","sap/ui/core/TextAlign","sap/ino/vc/idea/mixins/AssignmentActionMixin","sap/ino/vc/idea/mixins/ChangeStatusActionMixin","sap/ino/vc/idea/mixins/DeleteActionMixin","sap/ino/vc/idea/mixins/FollowUpMixin","sap/ino/vc/comment/CommentMixin","sap/ino/vc/idea/mixins/MergeActionMixin","sap/ino/vc/commons/mixins/TagCardMixin","sap/ino/vc/blog/mixins/DeleteActionMixin","sap/ino/commons/formatters/ObjectListFormatter","sap/ino/vc/commons/mixins/FollowMixin","sap/ino/vc/campaign/mixins/RegistrationMixin","sap/ino/vc/blog/mixins/BlogCardMixin","sap/ino/vc/idea/mixins/VoteMixin","sap/ino/vc/idea/mixins/VolunteerMixin","sap/ino/vc/follow/mixins/FeedsMixin","sap/ino/vc/campaign/mixins/MilestoneMixin","sap/ino/vc/idea/mixins/IdeaFormCriteriaFilterMixin"],function(C,a,I,S,F,b,J,E,T,A,c,D,d,e,M,f,B,g,h,R,j,V,k,l,m,n){"use strict";var L={"follow":{filterParam:"",filter:[new F("FOLLOW_UP_ID","NE",null),new F("STATUS","NE","sap.ino.config.DRAFT")],sorter:new S("FOLLOW_UP_DATE",false)},"coachme":{filterParam:"",filter:[new F("COACH_ID","EQ",a.getCurrentUser().USER_ID),new F("STATUS","NE","sap.ino.config.DRAFT")],sorter:new S("SUBMITTED_AT",false)},"unassigned":{filterParam:"unassignedCoach",filter:[new F("STATUS","NE","sap.ino.config.DRAFT")],sorter:new S("SUBMITTED_AT",true)},"evaldone":{filterParam:"evaluatedIdeas",filter:[new F("STATUS","NE","sap.ino.config.DRAFT")],sorter:new S("LAST_PUBL_EVAL_AT",true)}};var o={"published":{filterParam:"publishedBlogs",filter:[],sorter:new S("PUBLISHED_AT",true),name:"publish"},"draft":{filterParam:"draftBlogs",filter:[],sorter:new S("CHANGED_AT",true),name:"draft"},"all":{filterParam:"",filter:[],sorter:new S("PUBLISHED_AT",true),name:"all"}};var p={Backoffice:{PATH_TEMPLATE:"/CampaignEntityCount",SHOW_CRTBLOG_AUTH:true,Binding:[{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_IDEAS_COACHED",COUNT:"IDEAS_COACHED_BY_ME",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"coachme"}},ROLES:["camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_IDEAS_UNASSIGNED",COUNT:"UNASSIGNED_IDEAS_COUNT",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"unassigned"}},ROLES:["camp_instance_mgr_role","camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_IDEAS_EVALUATED",COUNT:"EVALUATED_IDEAS",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"evaldone"}},ROLES:["camp_instance_mgr_role","camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_IDEA_FOLLOWUP",COUNT:"FOLLOW_UP_IDEAS",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"follow"}},ROLES:["camp_instance_mgr_role","camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_QUALIFIED_IDEAS_FOR_REWARDS",COUNT:"QUALIFIED_IDEAS_FOR_REWARDS",Route:{NAME:"rewardlistvariant",QUERY:{variant:"rewardqualified"}},ROLES:["camp_instance_mgr_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_EVALUATION_PENDING_BY_ME",COUNT:"EVALUATION_PENDING_BY_ME",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"manage"}},ROLES:["camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"PROFILE_LNK_IDEAS_MANAGED",COUNT:"IDEAS_MANAGED_BY_ME",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"manage"}},ROLES:["camp_instance_mgr_role","camp_instance_coach_role","camp_instance_resp_coach_role"]},{ICON:"sap-icon://lightbulb",LINK_TEXT:"IDEA_LIST_MIT_COMPLETED",COUNT:"COMPLETED_IDEA_COUNT",Route:{NAME:"campaign-idealistvariant",QUERY:{variant:"managedcompleted"}},ROLES:["sap.ino.ui::camps_mgr_role","sap.ino.ui::camps_coach_role","sap.ino.ui::camps_resp_coach_role"]},{ICON:"sap-icon://hr-approval",LINK_TEXT:"REGISTER_APPR_LIST_TIT",COUNT:"MY_PENDING_APPR_COUNT",Route:{NAME:"campaign-registerapprovallistvariant",QUERY:{variant:"pending"}},ROLES:["camp_instance_mgr_role"]}]}};var r={"UnchangedIdeasFrame":"ReportTemplates('sap.ino.config.7')","CampaignActivitiesFrame":"ReportTemplates('sap.ino.config.14')"};var q={XS:{centerProfileContainer:"identityProfileFragment--identityProfile",centerCommentContainer:"ideasCommentFragment--campaignComment",centerTagsContainer:"campaignTagsFragment--campaignTags",centerReportUnchangedIdeasContainer:"unchangedIdeasFragment--unchangedIdeas",centerReportUnchangedIdeasSplitContainer:undefined,leftReportUnchangedIdeasContainer:undefined,rightReportUnchangedIdeasContainer:undefined,centerReportCampaignActivitiesContainer:"campaignActivitiesFragment--campaignActivities",centerReportCampaignActivitiesSplitContainer:undefined,leftReportCampaignActivitiesContainer:undefined,rightReportCampaignActivitiesContainer:undefined},S:{leftProfileContainer:"identityProfileFragment--identityProfile",centerCommentContainer:"ideasCommentFragment--campaignComment",centerTagsContainer:"campaignTagsFragment--campaignTags",centerReportCampaignActivitiesContainer:"campaignActivitiesFragment--campaignActivities",centerReportUnchangedIdeasContainer:"unchangedIdeasFragment--unchangedIdeas"},M:{leftProfileContainer:"identityProfileFragment--identityProfile",centerCommentContainer:"ideasCommentFragment--campaignComment",centerTagsContainer:"campaignTagsFragment--campaignTags",centerReportCampaignActivitiesSplitContainer:"campaignActivitiesFragment--campaignActivities",centerReportUnchangedIdeasSplitContainer:"unchangedIdeasFragment--unchangedIdeas"},L:{leftProfileContainer:"identityProfileFragment--identityProfile",leftCommentContainer:"ideasCommentFragment--campaignComment",leftTagsContainer:"campaignTagsFragment--campaignTags",leftReportCampaignActivitiesContainer:"campaignActivitiesFragment--campaignActivities",leftReportUnchangedIdeasContainer:"unchangedIdeasFragment--unchangedIdeas"},XL:{leftProfileContainer:"identityProfileFragment--identityProfile",leftCommentContainer:"ideasCommentFragment--campaignComment",leftTagsContainer:"campaignTagsFragment--campaignTags",rightReportCampaignActivitiesContainer:"campaignActivitiesFragment--campaignActivities",rightReportUnchangedIdeasContainer:"unchangedIdeasFragment--unchangedIdeas"}};return C.extend("sap.ino.vc.campaign.BackOfficeHome",jQuery.extend({},I,A,c,d,D,e,M,f,B,h,R,j,V,k,g,l,m,n,{initialFocus:["backofficeButton--backofficeToogle","identityProfileFragment--createBlog"],formatter:jQuery.extend({unchangedIdeasColor:function(i){switch(i){case 0:return'Good';case 1:return'Neutral';case 2:return'Critical';default:return'Error';}},unchangedIdeasLabel:function(i){switch(i){case 0:return'1';case 1:return'<= 7';case 2:return'<= 30';default:return'> 30';}}},this.formatter,E,d.followUpMixinFormatter,g),onInit:function(){C.prototype.onInit.apply(this,arguments);this.aBusyControls=[this.getView()];this._sBOHResizeIdeaListId=this.attachListControlResized(this.byId("ideasFragment--ideasList"));},onExit:function(){C.prototype.onExit.apply(this,arguments);this.detachListControlResized(this._sBOHResizeIdeaListId);},bindViewData:function(){this.getModel("view").setProperty("/CAMPAIGN_COMMENT_NAVIGATION_SECTION","campaignSectionComments");var i;if(this.getModel("device").getProperty("/system/phone")){i=this.byId("ideasFragment--sapInoCampHomeIdeasSelect").getSelectedKey();}else{i=this.byId("ideasFragment--sapInoCampHomeIdeasButtons").getSelectedKey();}this._sIdeaViewKey=i||Object.keys(L)[0];this._bindIdeas(this._sIdeaViewKey);var s;if(this.getModel("device").getProperty("/system/phone")){s=this.byId("blogsFragment--sapInoCampHomeBlogsSelect").getSelectedKey();}else{s=this.byId("blogsFragment--sapInoCampHomeBlogsButtons").getSelectedKey();}this._sBlogViewKey=s||Object.keys(o)[0];if(!this.getModel("component").getProperty("/SHOW_BACKOFFICE_BLOG")){this._sBlogViewKey=Object.keys(o)[2];}this._bindBlogs(this._sBlogViewKey);this._bindUnchangedIdeas();this._bindActivities();this._bindComments();this._bindTags();},onAfterRendering:function(){var u=this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");var i=this.byId("campaignActivitiesFragment--CampaignActivitiesFrame");var v={title:{visible:false},legendGroup:{layout:{position:"auto"}},categoryAxis:{title:{visible:false},label:{visible:false}},valueAxis:{title:{visible:false}}};if(u){u.setVizProperties(v);}if(i){i.setVizProperties(v);}if(!this.getModel("device").getProperty("/system/phone")){if(!u.aBindParameters){u.attachBrowserEvent("click",this.onNavigateToReport,this);}if(!i.aBindParameters){i.attachBrowserEvent("click",this.onNavigateToReport,this);}}},getList:function(){return this.byId("ideasFragment--ideasList");},show:function(P){this._oParentView=P;this.bindViewData();this.setIdentityProfileBinding();this.getList().attachUpdateFinished(this._onListUpdateFinished,this);this.bindMilestone(this.getCampaignId());},_onListUpdateFinished:function(){var i=this.getList();i.$().find(".sapMListUl").attr("role","list");var s=i.$().find("li");jQuery.each(s,function(t,u){var $=jQuery(u);$.attr("role","group");var v=$.find(".sapInoItemAriaLabel");if(v&&v.length>0){$.attr("aria-labelledby",v[0].id);}var w=$.find(".sapMLIBContent");if(w&&w.length>0){w.attr("role","listitem");}});},getLayout:function(s){return q[s];},setIdentityProfileBinding:function(){var s=this.getView().getBindingContext("data").getProperty("SHORT_NAME");var t=p.Backoffice;var u=this.getView().getBindingContext("data").getProperty("IS_REGISTER_AUTO_APPROVE");var v=new Date();var w=this.getView().getBindingContext("data").getProperty("REGISTER_FROM");var x=this.getView().getBindingContext("data").getProperty("REGISTER_TO");var y=false;if(v>=w&&v<=x){y=true;}if(!u){if(y){jQuery.each(t.Binding,function(i,G){if(G.COUNT==="MY_PENDING_APPR_COUNT"){G.VISIBLE=true;}});}}if(this.getView().getBindingContext("data").getProperty("REWARD")){jQuery.each(t.Binding,function(i,G){if(G.COUNT==="QUALIFIED_IDEAS_FOR_REWARDS"){G.VISIBLE=true;}});}t.HEADLINE=s;t.HEADLINE_BACKGROUND="#"+(this.getView().getBindingContext("data").getProperty("COLOR_CODE")||"FFFFFF");t.PATH=p.Backoffice.PATH_TEMPLATE+"("+this.getCampaignId()+")";this.getView().setModel(new J({ID:this.getCampaignId(),NAME:s,_OBJECT_TYPE_CODE:"CAMPAIGN"}),"contextObject");this.bindIdentityProfile(this.byId("identityProfileFragment--identityProfile"),t,this.getCampaignId(),this.byId("identityProfileFragment--identityProfileButtons"));if(this.getModel("data").getProperty(t.PATH)){var z=this.byId("identityProfileFragment--identityProfileList");this.getModel("data").read(t.PATH,{success:function(){var i=z.getBindingInfo("items");z.bindItems(i);}});}},getCampaignId:function(){return this.getView().getBindingContext("data")?this.getView().getBindingContext("data").getProperty("ID"):undefined;},_bindIdeas:function(K,i){var s=this.getModel("device").getProperty("/system/phone");if(i||this.getCampaignId()&&true){var P="data>/IdeaMediumBackofficeSearchParams(searchToken='',"+"searchType="+"0"+","+"tagsToken='',"+"tagsToken1='',"+"tagsToken2='',"+"tagsToken3='',"+"tagsToken4='',"+"filterName='"+L[K].filterParam+"',"+"filterBackoffice=1"+this.getEmptyIdeaformFilters()+",cvt='"+""+"',"+"cvr="+"0"+","+"cvy="+"0"+")/Results";var t=this.byId("ideasFragment--ideasList");var u=a.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE")*1||a.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR")*1;var v=Number(u)?this.getFragment("sap.ino.vc.idea.fragments.ManageListItemNoImage"):this.getFragment("sap.ino.vc.idea.fragments.ManageListItem");if(s){}else{}t.bindItems({path:P,template:v,sorter:L[K].sorter,filters:L[K].filter.concat(new F("CAMPAIGN_ID","EQ",i||this.getCampaignId())),length:4});var w=this.byId("ideasFragment--panelTitle");w.setText(this.getText("CAMPAIGN_HOME_PANEL_IDEAS_"+K.toUpperCase()));var x=a.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");var O="";if(x){O="/sap/ino/xs/rest/backoffice/odata.xsodata";}else{O="/sap/ino/xs/rest/community/odata.xsodata";}P=a.getBackendRootURL()+O+t.mBindingInfos.items.binding.sPath+"?$format=json";var y=t.mBindingInfos.items.binding.sFilterParams;var z=t.mBindingInfos.items.binding.sSortParams;var G="&$select(ID)";P=P+"&"+z+"&"+y+G;var H=new J();H.setData({path:P});sap.ui.getCore().setModel(H,"ideaSearchParams");}},_bindBlogs:function(K){if(this.getCampaignId()){var i=this.getModel("device").getProperty("/system/phone");var P="data>/BlogSearchParams(searchToken='',"+"tagsToken='',"+"filterName='"+o[K].filterParam+"')/Results";var s={path:P,template:this.getFragment("sap.ino.vc.blog.fragments.ListItemHome"),sorter:o[K].sorter,filters:o[K].filter.concat(new F("CAMPAIGN_ID","EQ",this.getCampaignId())),length:4,top:4};if(i){var t=this.byId("blogsFragment--blogsCarousel");t.bindAggregation("pages",s);}else{var u=this.byId("blogsFragment--blogsList");if(u){u.bindItems(s);}}var v=this.byId("blogsFragment--panelBlogTitle");if(this.getModel("component").getProperty("/SHOW_BACKOFFICE_BLOG")){v.setText(this.getText("CAMPAIGN_HOME_PANEL_BLOGS_"+K.toUpperCase()));}else{v.setText(this.getText("HOMEPAGE_PANEL_CAMPAIGN_BLOGS"));}}},_bindUnchangedIdeas:function(){var u=this.byId("unchangedIdeasFragment--UnchangedIdeasFrame");u.getParent().setVisible(true);var i=this.getModel("data");i.read("/CampaignUnchangedIdeas",{async:true,filters:[new F("CAMPAIGN_ID","EQ",this.getCampaignId())],success:function(s){if(s.results&&s.results[0]){u.getParent().setVisible(true);u.getParent().getParent().getContent()[1].setVisible(false);var t=new sap.ui.model.json.JSONModel();t.setData(s);u.setModel(t);}else{u.getParent().setVisible(false);u.getParent().getParent().getContent()[1].setVisible(true);}}});},_bindActivities:function(){var i=this.byId("campaignActivitiesFragment--CampaignActivitiesFrame");i.getParent().setVisible(true);var s=this.getModel("data");s.read("/CampaignActivities",{async:true,filters:[new F("CAMPAIGN_ID","EQ",this.getCampaignId())],success:function(u){if(u.results&&u.results[0]){i.getParent().setVisible(true);i.getParent().getParent().getContent()[1].setVisible(false);var v=new sap.ui.model.json.JSONModel();v.setData(u);i.setModel(v);}else{i.getParent().setVisible(false);i.getParent().getParent().getContent()[1].setVisible(true);}}});var t=this.byId("campaignActivitiesFragment--panelTitle");t.setText(this.getText("MW_TCO_TIT_ACTIVITIES_MONTH",[this.getText("MONTH_FLD_"+(new Date().getMonth()+1))]));},_bindComments:function(){var i=this.byId("ideasCommentFragment--campaginCommentList");var s=i.getBindingInfo("items");i.bindItems(s);},_bindTags:function(){if(!this._oTagTokenizer){this._oTagTokenizer=this.byId("campaignTagsFragment--campaignTags").getContent()[0];}this.byId("campaignTagsFragment--campaignTags").getContent()[0].setBusy(true);var t=this.byId("campaignTagsFragment--Tags");var i=t.getBindingInfo("tokens");t.bindAggregation("tokens",i);var s=this.getModel("data");var P=this.getView().getBindingContext("data").sPath+"/Tags";var u=this;s.read(P,{async:true,success:function(v){var w=u.byId("campaignTagsFragment--campaignTags");w.removeContent(w.getContent()[0]);if(v.results.length===0){var H=new sap.m.HBox().addStyleClass("sapInoCampaignTagsContainerNoTags");H.addItem(new sap.m.Text({text:u.getText("CAMPAIGN_LIST_FLD_NO_TAGS"),width:"100%"}).setTextAlign(T.Center));w.addContent(H);}else{w.addContent(u._oTagTokenizer);}u.byId("campaignTagsFragment--campaignTags").getContent()[0].setBusy(false);}});},_bindFeed:function(){var s=this;var P=a.getBackendRootURL()+"/sap/ino/xs/rest/common/feed.xsjs";var i=[];if(this.getCampaignId()){i.push("campaign="+this.getCampaignId());i.push("top=4");}if(i.length>0){P=P+"?"+i.join("&");}var t=new J(P);t.attachRequestCompleted(null,function(){if(t.oData.results){jQuery.each(t.oData.results,function(v,w){w.EVENT_AT=new Date(w.EVENT_AT);});}var u=s.byId("feedsFragment--feedList");u.setModel(t,"feed");},t);},onIdeaListTypeSelect:function(i){this._sIdeaViewKey=i.getParameter("key")||i.getParameter("selectedItem")&&i.getParameter("selectedItem").getKey();this._bindIdeas(this._sIdeaViewKey);},onBlogListTypeSelect:function(i){this._sBlogViewKey=i.getParameter("key")||i.getParameter("selectedItem")&&i.getParameter("selectedItem").getKey();this._bindBlogs(this._sBlogViewKey);},onOpenSubmitter:function(i){var s=i.getSource();var t=s.getBindingContext("data").getProperty("SUBMITTER_ID");this.openIdentityQuickView(s,t);},onOpenCoach:function(i){var s=i.getSource();var t=s.getBindingContext("data").getProperty("COACH_ID");this.openIdentityQuickView(s,t);},onNavigateToIdeas:function(){var i=this.getCampaignId();if(!this._sIdeaViewKey){this.navigateTo("campaign-idealist",{id:i});}else{this.navigateTo("campaign-idealistvariant",{id:i,variant:this._sIdeaViewKey});}},onNavigateToBlogs:function(){var i=this.getCampaignId();if(!this._sBlogViewKey){this.navigateTo("campaign-bloglist",{id:i});}else{this.navigateTo("campaign-bloglistvariant",{id:i,variant:o[this._sBlogViewKey].name});}},onItemPress:function(i){var s=i.getSource();s.$().attr("aria-label",this.getText());var t=s.getBindingContext("data");if(t){this.navigateTo("idea-display",{id:t.getProperty("ID")});}},onNavigateToComment:function(){var i=this.getCampaignId();this.navigateTo("campaign-comment",{id:i});},onNavigateToCampaignFeeds:function(i){this.navigateTo("campaign-feeds",{id:this.getCampaignId()});},onNavigateToReport:function(i){var s=this.getCampaignId();var t=((i.currentTarget&&i.currentTarget.id)||(i.oSource.sId)).split("--");var u=t[t.length-1];this.navigateTo("report",{code:r[u],query:{campaign:s}});},onOfficeToggle:function(){if(this._oParentView){var i=this._oParentView.getController();if(i.switchView){i.switchView();}}},onOpenCampaignSettings:function(){if(this._oParentView){var i=this._oParentView.getController();if(i.openCampaignSettings){i.openCampaignSettings(this.getCampaignId());}}},showPopupTagCard:function(i){this._bIsTokenPressed=true;if(!this._oPopover){this._oPopover=sap.ui.xmlfragment("sap.ino.vc.tag.fragments.TagCardPopover",this);this.getView().addDependent(this._oPopover);}var t=i.getSource();var P="/SearchTagsAll(searchToken='',ID="+t.getKey()+")";var s=this.getModel("data");var u=this;s.read(P,{async:true,success:function(v){var w=new J();w.setData(v);u._oPopover.setModel(w,"Tag");jQuery.sap.delayedCall(0,u,function(){u._oPopover.openBy(t);});}});},onEditBlog:function(i){var s=i.getSource();this.navigateTo("blog-edit",{id:s.getBindingContext("data").getProperty("ID")});},onBlogItemPress:function(i){if(this._bIsTokenPressed){this._bIsTokenPressed=false;return;}var s=i.getSource();var t=s.getBindingContext("data");if(t){this.navigateTo("blog-display",{id:t.getProperty("ID")});}}}));});
