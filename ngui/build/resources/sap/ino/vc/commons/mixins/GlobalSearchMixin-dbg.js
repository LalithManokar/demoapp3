sap.ui.define([
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
	"sap/ino/commons/application/Configuration"
], function(PropertyModel, MessageToast, JSONModel, Configuration) {

	var GlobalSearchMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	var openSearch = {
		'search': {
			key: 'search',
			value: 'CTRL_GLOBAL_SEARCH_ALL'
		},
		'campaignlist': {
			key: 'campaignlist',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGNS'
		},
		'campaignlistvariant': {
			key: 'campaignlistvariant',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGNS'
		},
		'idealist': {
			key: 'idealist',
			value: 'CTRL_GLOBAL_SEARCH_IDEAS'
		},
		'idealistbycompany': {
			key: 'idealistbycompany',
			value: Configuration.getGroupConfiguration().DISPLAY_LABEL,
			bNotFormatter: true
		},
		'idealistvariant': {
			key: 'idealistvariant',
			value: 'CTRL_GLOBAL_SEARCH_IDEAS'
		},
		'peoplelist': {
			key: 'peoplelist',
			value: 'CTRL_GLOBAL_SEARCH_USERS'
		},
		'peoplelistvariant': {
			key: 'peoplelistvariant',
			value: 'CTRL_GLOBAL_SEARCH_USERS'
		},
		'walllist': {
			key: 'walllist',
			value: 'CTRL_GLOBAL_SEARCH_WALLS'
		},
		'walllistvariant': {
			key: 'walllistvariant',
			value: 'CTRL_GLOBAL_SEARCH_WALLS'
		},
		'taglist': {
			key: 'taglist',
			value: 'CTRL_GLOBAL_SEARCH_TAGS'
		},
		'taglistvariant': {
			key: 'taglistvariant',
			value: 'CTRL_GLOBAL_SEARCH_TAGS'
		},
		'campaign': {
			key: 'campaign',
			value: 'CTRL_GLOBAL_SEARCH_CURRENT_CAMPAIGN'
		},
		'searchcategory': {
			key: 'searchcategory',
			value: 'CTRL_GLOBAL_SEARCH_CURRENT_CAMPAIGN'
		},
		'campaign-idealist': {
			key: 'campaign-idealist',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGN_IDEAS'
		},
		'campaign-idealistvariant': {
			key: 'campaign-idealistvariant',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGN_IDEAS'
		},
		'campaign-idealistbycompany': {
			key: 'campaign-idealistbycompany',
			value: Configuration.getGroupConfiguration().DISPLAY_LABEL,
			bNotFormatter: true
		},
		'campaign-bloglist': {
			key: 'campaign-bloglist',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGN_BLOGS'
		},
		'campaign-bloglistvariant': {
			key: 'campaign-bloglistvariant',
			value: 'CTRL_GLOBAL_SEARCH_CAMPAIGN_BLOGS'
		},
		'bloglist': {
			key: 'bloglist',
			value: 'CTRL_GLOBAL_SEARCH_BLOGS'
		},
		'bloglistvariant': {
			key: 'bloglistvariant',
			value: 'CTRL_GLOBAL_SEARCH_BLOGS'
		}
	};

	var searchCategory = [openSearch.search, openSearch.campaignlist, openSearch.idealist, openSearch.peoplelist, openSearch.walllist,
			openSearch.taglist];

	var searchType = {
		ALL: 'all',
		CAMPAIGN: 'campaign'
	};

	var searchVariant = {
		ALL: 'all',
		MANAGE: 'manage'
	};

	GlobalSearchMixin.setCategroyData = function() {
		var searchModel = this.getOwnerComponent().getModel('search');
		if (searchModel) {
			if (Configuration.getSystemSetting("sap.ino.config.PEOPLE_MENU_FOR_ALL_ACTIVE") !== "1") {
				this._removeCategory(openSearch.peoplelist.key);
			}
			searchModel.setProperty('/category', searchCategory);
		}
	};

	GlobalSearchMixin.listenRouteMatch = function() {
		var self = this;
		this.getOwnerComponent().getRootView().attachEvent('routeMatchedEvent', function(e) {
			var category = e.getParameters().name;
			var selectedCategory = this.getModel('search').getProperty('/selectedCategory');
			var searchAguments = $.extend({}, e.getParameters().arguments);
			self._handleSearchRule(category, searchAguments, selectedCategory);
		});
	};

	// stupid design. 
	GlobalSearchMixin._handleSearchRule = function(key, searchAguments, selectedCategory) {
		var self = this;
		var searchModel = self.getOwnerComponent().getModel('search');
		var params = searchAguments;
		var category = (key === "idea-display" ? openSearch.campaign.key : key);

		//enable company'idea search only for backoffice access
		var userAccess = this.getOwnerComponent().getModel("component").getProperty("/SHOW_BACKOFFICE");
		var companyViewEnabled = Configuration.getGroupConfiguration().ENABLE_GROUP_VIEW;
		if (!userAccess || !companyViewEnabled) {
			this._removeCategory(openSearch['campaign-idealistbycompany'].key);
			this._removeCategory(openSearch.idealistbycompany.key);
			selectedCategory = category;
		} else if (userAccess && companyViewEnabled) {
			if (category === 'campaign-idealistvariant' || category === 'campaign-idealist') {
				this._addCategory(openSearch['campaign-idealistbycompany']);
				this._removeCategory(openSearch.idealistbycompany.key);
				selectedCategory = selectedCategory !== 'campaign-idealistbycompany' ? category : selectedCategory;
			} else if (category === 'idealistvariant' || category === 'idealist') {
				this._addCategory(openSearch.idealistbycompany);
				this._removeCategory(openSearch['campaign-idealistbycompany'].key);
				selectedCategory = selectedCategory !== 'idealistbycompany' ? category : selectedCategory;
			} else if (category === 'home') {
				this._addCategory(openSearch.idealistbycompany);
				this._removeCategory(openSearch['campaign-idealistbycompany'].key);
				selectedCategory = category;
			} else {
				this._removeCategory(openSearch['campaign-idealistbycompany'].key);
				this._removeCategory(openSearch.idealistbycompany.key);
				selectedCategory = category;
			}
		}

		switch (category) {
			case openSearch.campaignlistvariant.key:
				this._replaceKey([openSearch.campaignlist.key], openSearch.campaignlistvariant.key);
				break;
			case openSearch.campaignlist.key:
				this._replaceKey([openSearch.campaignlistvariant.key], openSearch.campaignlist.key);
				break;
			case openSearch.idealistvariant.key:
				this._replaceKey([openSearch.idealist.key], openSearch.idealistvariant.key);
				break;
			case openSearch.idealist.key:
				this._replaceKey([openSearch.idealistvariant.key], openSearch.idealist.key);
				break;
			case openSearch.campaign.key:
				this._addCategory(openSearch.campaign);
				break;
			case openSearch.searchcategory.key:
				this._addCategory(openSearch.searchcategory);
				break;
			case openSearch.walllist.key:
				this._replaceKey([openSearch.walllistvariant.key], openSearch.walllist.key);
				break;
			case openSearch.walllistvariant.key:
				this._replaceKey([openSearch.walllist.key], openSearch.walllistvariant.key);
				break;
			case openSearch.taglist.key:
				this._replaceKey([openSearch.taglistvariant.key], openSearch.taglist.key);
				break;
			case openSearch.taglistvariant.key:
				this._replaceKey([openSearch.taglist.key], openSearch.taglistvariant.key);
				break;
			case openSearch.peoplelist.key:
				this._replaceKey([openSearch.peoplelistvariant.key], openSearch.peoplelist.key);
				break;
			case openSearch.peoplelistvariant.key:
				this._replaceKey([openSearch.peoplelist.key], openSearch.peoplelistvariant.key);
				break;
			case openSearch['campaign-idealist'].key:
				this._addCategory(openSearch['campaign-idealist']);
				break;
			case openSearch['campaign-idealistvariant'].key:
				this._addCategory(openSearch['campaign-idealistvariant']);
				break;
			case openSearch['campaign-bloglist'].key:
				this._addCategory(openSearch['campaign-bloglist']);
				break;
			case openSearch['campaign-bloglistvariant'].key:
				this._addCategory(openSearch['campaign-bloglistvariant']);
				break;
			case openSearch.bloglist.key:
				this._addCategory(openSearch.bloglist);
				break;
			case openSearch.bloglistvariant.key:
				this._addCategory(openSearch.bloglistvariant);
				break;
			default:
				category = this._getSelectedCate(key, category);
				break;
		}

		if (category !== openSearch.campaign.key) {
			this._removeCategory(openSearch.campaign.key);
		}

		if (category !== openSearch.searchcategory.key) {
			this._removeCategory(openSearch.searchcategory.key);
		}

		if (category !== openSearch['campaign-idealist'].key) {
			this._removeCategory(openSearch['campaign-idealist'].key);
		}

		if (category !== openSearch['campaign-idealistvariant'].key) {
			this._removeCategory(openSearch['campaign-idealistvariant'].key);
		}

		if (category !== openSearch['campaign-bloglist'].key) {
			this._removeCategory(openSearch['campaign-bloglist'].key);
		}

		if (category !== openSearch['campaign-bloglistvariant'].key) {
			this._removeCategory(openSearch['campaign-bloglistvariant'].key);
		}

		if (category !== openSearch.bloglist.key) {
			this._removeCategory(openSearch.bloglist.key);
		}

		if (category !== openSearch.bloglistvariant.key) {
			this._removeCategory(openSearch.bloglistvariant.key);
		}
		if (key !== "idea-display") {
			searchModel.setProperty('/searchAguments', params);
		}

		if (selectedCategory === 'idealistbycompany' || selectedCategory === 'campaign-idealistbycompany') {
			searchModel.setProperty('/selectedCategory', selectedCategory);
		} else {
			searchModel.setProperty('/selectedCategory', category);
		}

	};

	GlobalSearchMixin._getParams = function(key, params) {
		if (key === "idea-display") {
			return openSearch.campaign.key;
		}
		return params;
	};

	GlobalSearchMixin._getSelectedCate = function(key, category) {
		if (key === "idea-display") {
			return openSearch.campaign.key;
		}
		return openSearch[key] ? category : openSearch.search.key;
	};

	GlobalSearchMixin._replaceKey = function(keys, replace) {
		var result = this._findCategory(keys);
		if (!result.value || !openSearch[replace]) {
			return false;
		}
		searchCategory[result.index] = openSearch[replace];
	};

	GlobalSearchMixin._findCategory = function(keys) {
		var result = {};
		for (var i = 0; i < searchCategory.length; i++) {
			if (~keys.indexOf(searchCategory[i].key)) {
				result.value = searchCategory[i];
				result.index = i;
				break;
			}
		}
		return result;
	};

	GlobalSearchMixin._addCategory = function(category) {
		if (!category || !category.key || !category.value) {
			return false;
		}
		var result = this._findCategory([category.key]);
		if (result.value) {
			return false;
		}
		searchCategory.unshift(category);
	};

	GlobalSearchMixin._removeCategory = function(key) {
		var result = this._findCategory([key]);
		if (!result.value) {
			return false;
		}
		searchCategory.splice(result.index, 1);
	};

	GlobalSearchMixin._handleSearchNavgate = function(keyword, data) {
		var category = openSearch[data.category] ? data.category : openSearch.search.key;
		if (!data.param.variant && category === "idealistvariant") {
			category = "idealist";
		}
		var query = $.extend({}, data.param['?query']);
		var userAccess = this.getOwnerComponent().getModel("component").getProperty("/SHOW_BACKOFFICE");
		var defaulVariant = userAccess ? searchVariant.MANAGE : searchVariant.ALL;

		var navToParams = {
			query: query,
			variant: data.param.variant || defaulVariant
		};

		if (keyword) {
			navToParams.query.search = keyword;
		}

		if (!keyword && !$.isEmptyObject(navToParams.query)) {
			delete navToParams.query.search;
		}

		if (!keyword && $.isEmptyObject(navToParams.query)) {
			return false;
		}

		if (navToParams.query.type) {
			delete navToParams.query.type;
		}

		if (navToParams.query.id) {
			delete navToParams.query.id;
		}

		switch (category) {
			case openSearch.searchcategory.key:
				$.extend(navToParams, {
					query: {
						type: searchType.CAMPAIGN,
						id: data.param['?query'].id,
						search: keyword || '',
						managed: 0
					}
				});
				break;
			case openSearch.campaign.key:
				category = openSearch.searchcategory.key;
				$.extend(navToParams, {
					query: {
						type: searchType.CAMPAIGN,
						id: data.param.id,
						search: keyword || '',
						managed: 0
					}
				});
				break;
			case openSearch['campaign-bloglist'].key:
			case openSearch['campaign-bloglistvariant'].key:
			case openSearch['campaign-idealistvariant'].key:
			case openSearch['campaign-idealist'].key:
			case openSearch['campaign-idealistbycompany'].key:
				$.extend(true, navToParams, {
					id: data.param.id
				});
				break;
			case openSearch.search.key:
				$.extend(navToParams, {
					query: {
						type: searchType.ALL,
						search: keyword || '',
						managed: Number(userAccess || false)
					}
				});
				break;
			default:
				$.extend(true, navToParams, {
					query: {
						search: keyword || ''
					}
				});
				break;
		}

		// set company view route
		if (category === 'idealistbycompany') {
			if (data.param.variant) {
				category = 'idealistvariant';
			} else {
				category = 'idealist';
			}
		} else if (category === 'campaign-idealistbycompany') {
			if (data.param.variant) {
				category = 'campaign-idealistvariant';
			} else {
				category = 'campaign-idealist';
			}

		}

		this.getOwnerComponent().navigateTo(category, navToParams);

	};

	GlobalSearchMixin.onSearch = function(oEvent) {
		var params = oEvent.getParameters();
		var searchKey = window.encodeURIComponent(params.search);

		if (params.search && params.category && params.param && (params.param.variant === 'all' || params.param.variant === 'manage')) {
			params.param['?query'] = params.param['?query'] || {};
			params.param['?query'].sort = "SEARCH_SCORE DESC";
		} else if (params.param && params.param['?query']) {
			params.param['?query'].sort = "";
		}
		this._handleSearchNavgate(searchKey, params);
	};

	return GlobalSearchMixin;
});