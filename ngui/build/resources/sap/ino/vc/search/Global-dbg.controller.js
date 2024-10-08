
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/core/mvc/ViewType",
    "sap/ino/controls/OrientationType",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/mixins/GlobalSearchMixin",
    "sap/ino/wall/Wall",
    "sap/ino/vc/wall/util/WallFactory",
    "sap/ino/commons/application/Configuration", 
    "sap/ino/vc/blog/mixins/BlogCardMixin",
    "sap/ui/model/type/DateTime",
    "sap/m/MessageToast",
    "sap/ino/vc/idea/mixins/VolunteerMixin"
], function(BaseController, Device, JSONModel, TopLevelPageFacet, ViewType, OrientationType, VoteMixin, FollowMixin, TagCardMixin, RegistrationMixin, ObjectListFormatter, GlobalSearchMixin, Wall, WallFactory, Configuration, BlogCardMixin, DateTime, MessageToast, VolunteerMixin){
	"use strict";

	return BaseController.extend("sap.ino.vc.search.Global", jQuery.extend({}, TopLevelPageFacet, VoteMixin, FollowMixin, TagCardMixin, RegistrationMixin, GlobalSearchMixin, BlogCardMixin, VolunteerMixin, {
		/* Controller reacts when these routes match */
		routes: ["search", "searchcategory"],
        
		formatter: $.extend({
		    variantTitle: function() {
		         return "Search";
		    }}, ObjectListFormatter, BaseController.prototype.formatter),

        onInit: function() {
            BaseController.prototype.onInit.apply(this, arguments);
        },

		onBeforeHide: function(oEvent) {
		    
		},
		
		onBeforeRendering: function(){
            
		},
		isGlobalSearch: function(){
		  return true;  
		},
		onRouteMatched: function(oEvent, oObject) {
			
			var params = oEvent.getParameters();
			var searchArguments = params.arguments;
			var query = searchArguments['?query'];
            var view = this.getView();
            
            this.setViewProperty("/SEARCH_QUERY",query);
            
			this.setHelp("GLOBAL_SEARCH");
			
			if(!view.getBusy()){
			    view.setBusy(true);
			}
			this.getSearchResult(query);
		},

        getSearchResult: function(data){
            var self = this;
            var view = this.getView();
            var params = {
                keyword: data.search && window.decodeURIComponent(data.search) || '',
                id: data.id || '',
                type: data.type || '',
                managed: data.managed
            };
            var searhService = $.get('xs/rest/common/search.xsjs', params);
            view.setBusy(true);
            searhService.done(function(result){
                // Done
                self.setModel(new JSONModel(result), 'data');
                self.bindSearchResult(result);
                view.setBusy(false);
            });
            
            searhService.fail(function(err){
                // Fail
                if(err){
                    MessageToast.show(err);
                }
                view.setBusy(false);
            });
            
            searhService.error(function(err){
                // Error
                if(err){
                    MessageToast.show(err);
                }
                view.setBusy(false);
            });
        },

        bindSearchResult: function(result){
            var self = this;
            var campaignList = this.getCampaignList(); 
            var ideaList = this.getIdeaList();
            var tagList = this.getTagList();
            var userList = this.getUserList();
            var wallList = this.getWallList();
            var blogList = this.getBlogList();
            
            if(result.Campaigns && campaignList){
               campaignList.bindItems({
					path: 'data>/Campaigns/data',
					template: self.getFragment("sap.ino.vc.campaign.fragments.CardListItem")
				});
            }
            if(result.Ideas && ideaList){
                var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1;
                var template = disableImage ? this.getFragment("sap.ino.vc.idea.fragments.CardListItemNoImage") : this.getFragment("sap.ino.vc.idea.fragments.CardListItem");
                ideaList.bindItems({
					path: 'data>/Ideas/data',
					template: template
				});
            }
            if(result.Tags && tagList){
                tagList.bindItems({
                    path: 'data>/Tags/data',
                    template: self.getFragment('sap.ino.vc.tag.fragments.CardListItem')
                });
            }
            
            if(result.Users && userList){
                userList.bindItems({
                    path: 'data>/Users/data',
                    template: self.getFragment('sap.ino.vc.iam.fragments.IdentityListItem')
                });
            }
            
            if(result.Walls && wallList){
                wallList.bindItems({
                    path: 'data>/Walls/data',
                    template: self.getFragment('sap.ino.vc.wall.fragments.WallListItem')
                }).addStyleClass("sapInoWallListPreviewItems");
                self.bindWallList(wallList, result.Walls.data);
                
                var binding = this.getWallList().getBinding("items");
                
                if (binding) {
                    binding.attachDataReceived(this.bindWallList, this);
                }
            }
            
            if(result.Blogs && blogList){
                blogList.bindItems({
                    path: 'data>/Blogs/data',
                    template: self.getFragment('sap.ino.vc.search.fragments.BlogListItem')
                }).addStyleClass('sapInoBlogList');
            }
        },

        bindWallList: function(list, data){
            var listItems = list.getItems();
            var data = data;
            var wallIds = [];
            var self = this;
            self._oPreview2Wall = self._oPreview2Wall || {};
            for(var i = 0; i < listItems.length; i++){
                var wallPreview = listItems[i].getAggregation("content")[1];
                var iId = wallPreview.getBindingContext("data").getProperty("ID");
                var wallData = data.filter(function(item) {
                    return item.ID === iId;
                });
                
                if (!wallPreview.getWallControl()) {
                    if (wallData && wallData.length > 0) {
                        wallIds.push(iId);
                        
                        var wall = WallFactory.createWallFromInoJSON(wallData[0]);
                        if (wallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID) {
                            wall.setBackgroundImage(Configuration.getAttachmentDownloadURL(wallData[0].BACKGROUND_IMAGE_ATTACHMENT_ID));
                        }
                        self._oPreview2Wall[iId] = wall;
                        wallPreview.setWall(wall);
                        wallPreview.invalidate();
                    }
                } else if (!wallPreview.getWallControl().getItems().length) {
                    if (wallData && wallData.length > 0) {
                        wallIds.push(iId);
                    }
                }
            }
        },

        getCampaignList: function(){
            return this.getView().byId('objectCampaignList');
        },
        
        getIdeaList: function(){
            return this.getView().byId('objectIdeaList');
        },

        getTagList: function(){
            return this.getView().byId('objectTagList');  
        },

        getUserList: function(){
            return this.getView().byId('objectUserList');  
        },

        getWallList: function(){
            return this.getView().byId('objectWallList');
        },
        
        getBlogList: function(){
            return this.getView().byId('objectBlogList');
        },

		getListController: function() {
			return this._oListController;
		},

		setListController: function(oController) {
			this._oListController = oController;
		},

		getListView: function() {
			return this._oListView;
		},

		setListView: function(oView) {
			this._oListView = oView;
		},

		displayListView: function(bShow) {
			var oView = this.getListView();
			if (bShow) {
				oView.removeStyleClass("sapInoMobileObjectListNotVisible");
			} else {
				if (!oView.hasStyleClass("sapInoMobileObjectListNotVisible")) {
					oView.addStyleClass("sapInoMobileObjectListNotVisible");
				}
			}
		},

		/**
		 * Function to enable/disable list binding.
		 *
		 * Used during the filter dialog is opened (phone/table only).
		 *
		 * @public
		 * @function
		 */
		enableListBinding: function(bEnable) {
			if (bEnable) {
				this.getListController().bindList = this.getListController().bindListCore;
			} else {
				this.getListController().bindList = function() {};
			}
		},

		onVariantBasePress: function() {
			var oListController = this.getListController();
			oListController.onVariantBasePress.apply(oListController, arguments);
		},

		onTagSelected: function() {
			var oListController = this.getListController();
			oListController.onTagSelected.apply(oListController, arguments);
		},

		onTagDeselected: function() {
			var oListController = this.getListController();
			oListController.onTagDeselected.apply(oListController, arguments);
		},

		onTagItemDeselectPress: function() {
			var oListController = this.getListController();
			oListController.onTagItemDeselectPress.apply(oListController, arguments);
		},
		getList: function() {
			return this.getListController() && this.getListController().getList();
		},

		getPath: function() {
			return this.getListController() && this.getListController()._sPath;
		},

		getItemTemplate: function() {
			return this.getListController() && this.getListController().getItemTemplate();
		},

		// fix the issue that global filter bar can not close
		getListLayout: function() {
			return this.byId("searchresults");
		},
        
        showMoreLink: function(result){
            return !!(result && result.data && result.counts > result.data.length);
        },
        
        onItemPress: function(event){
            var source = event.getSource();
            var contextData = source.getBindingContext('data');
            var params = event.getParameters();
            if(params.campaignId){
                this.navigateTo('campaign', {id: params.campaignId});
            }
            
            if(contextData.getProperty('WALL_TYPE_CODE')){
                this.navigateToWall("wall", {
    	            id: contextData.getProperty('ID')
    	        });
            }
        },

        onOpenCampaign: function(oEvent) {
			this.navigateTo("campaign", {
				id: oEvent.getParameter("campaignId")
			});
		},

        onOpenIdea: function(event){
           var item = event.getSource();
			var context = item.getBindingContext("data");
			if (context) {
				this.navigateTo("idea-display", {
					id: context.getProperty("ID")
				});
			}
        },

        onBlogItemPress: function(event) {
			var Item = event.getSource();
			var context = Item.getBindingContext("data");
			if (context) {
				this.navigateTo("blog-display", {
					id: context.getProperty("ID")
				});
			}
		},

	    navigateToMore: function(category, extendsParams){
	        var searchModel = this.getModel('search');
	        var data = searchModel.getData();
	        var searchAguments = data.searchAguments;
	        var searchKey = searchAguments['?query'] && searchAguments['?query'].search;
	        var searchParams = {
                category: category,
                search: searchKey,
                param: $.extend(searchAguments, extendsParams || {})
            };
		if (searchParams.category && searchParams.param && searchParams.category === 'idealist') {
			searchParams.param['?query'] = searchParams.param['?query'] || {};
			searchParams.param['?query'].sort = "SEARCH_SCORE DESC";
		}            
	        this._handleSearchNavgate(searchKey, searchParams);
	    },
	    goCampaigns: function(){
	        this.navigateToMore('campaignlist');
	    },
	    goIdeas: function(){
	        var extensData = {};
	        var category = 'idealist';
	        var searchModel = this.getModel('search');
	        var data = searchModel.getData();
	        var searchAguments = data.searchAguments;
	        var query = searchAguments && searchAguments['?query'];
	        var type = query && query.type;
	        if(type === 'campaign'){
	            extensData.id = query.id;
	            category = 'campaign-idealist';
	        }
	        this.navigateToMore(category, extensData);
	    },
	    goTags: function(){
	        this.navigateToMore('taglist');
	    },
	    goUsers: function(){
	        this.navigateToMore('peoplelist');
	    },
	    goWalls: function(){
	        this.navigateToMore('walllist');
	    },
	    goBlogs: function(){
	        var searchModel = this.getModel('search');
	        var data = searchModel.getData();
	        var campaignid = data.searchAguments && data.searchAguments['?query'] && data.searchAguments['?query'].id;
	        if(!campaignid){
	            return false;
	        }
	        this.navigateToMore('campaign-bloglist', {id: campaignid});
	    },
	    
	    isShown: function(data) {
	        return !!data && !!data.data;
	    },
	    
	    transToDate: function(str){
	        var date = new Date(str);
	        return date.toDateString();
	    },
	    
	    showResultCount: function(text, num, result){
	        var bNumberPlus = !!(result && result.data && result.counts > result.data.length);
	        var title = text;
	        var count = num || 0;
	        if(bNumberPlus){
	        return title + '  (' + ( count - 1 ) + '+)';
	        } 
	        else{
	           return title + '  (' + count + ')'; 
	        }
	    }
	}));
});