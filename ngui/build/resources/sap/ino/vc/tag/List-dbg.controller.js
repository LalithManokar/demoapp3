sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/application/Configuration",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/controls/OrientationType",
    "sap/m/MessageToast",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin"
], function(BaseController,
     Device,
     ObjectListFormatter,
     Sorter,
     JSONModel,
     Filter,
     FilterOperator,
     Configuration,
     TopLevelPageFacet,
     OrientationType,
     MessageToast,
     FollowMixin,
     TagCardMixin) {
    "use strict";
    
    var mOrder = {
        ASC : "ASC",
        DESC : "DESC"
    };
    
    var mSort = {
        NAME : "NAME"
    };
    
    var mVariant = {
        ALL : "all",
        OTHER : "other"
    };
    
    var mFilter = {
        NONE : undefined
    };
    
    var mList = {
        NAME:"TAG_LIST_TIT_NAME",
        ADJUSTMENT_TITLE : "TAG_LIST_TIT_ADJUSTMENT",
        Filter : {},
        Sorter : {
            Values : [ {
                TEXT : "SORT_MIT_NAME",
                ACTION : mSort.NAME,
                DEFAULT_ORDER : mOrder.ASC
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
        Variants : {
            DEFAULT_VARIANT : mVariant.ALL,
            TITLE : "TAG_LIST_TIT_VARIANTS",
            Values : [{
                TEXT : "TAG_LIST_MIT_TAGS",
                NAME : "TAG_LIST_MIT_TAGS",
                ACTION : mVariant.ALL,
                FILTER : mFilter.NONE,
                DEFAULT_SORT : mSort.NAME,
                VISIBLE: true
            }]
        }
    };
    
    var mListContext = {
		TAG: "taglist",
		TAG_VARIANT: "taglistvariant"
	};

    var oTAGList = BaseController.extend("sap.ino.vc.tag.List", jQuery.extend({}, TopLevelPageFacet, FollowMixin, TagCardMixin, {
        /* Controller reacts when these routes match */
        routes : ["taglist", "taglistvariant"],
        
        initialFocus : "mainFilterButton",
        
        /* ListModel defining filter, sorter and variants of the list */
        list : mList,
        
        /* ViewModel storing the current configuration of the list */
        view : {
            "List" : {
                "SORT" : mSort.NAME,
                "ORDER" : undefined,
                "VARIANT" : mVariant.ALL,
                "Default" : {
                    "SORT" : mSort.NAME,
                    "ORDER" : undefined,
                    "VARIANT" : mVariant.ALL
                }
            },
            "ORIENTATION" : OrientationType.PORTRAIT,
            "DISABLE_ORIENTATION" : true
        },
        
        onInit : function() {
            BaseController.prototype.onInit.apply(this, arguments);
            
            this.oViewModel = this.getModel("view") || new JSONModel({});
			this.oViewModel.setData(this.view, true);
        },
        
        onRouteMatched : function(oEvent, oObject) {
            // bind variant list
            this.bindVariants();
            
            var oViewModel = this.getModel("view");
            oViewModel.setData(this.view, true);

            var oQuery;
			var sVariant;
            var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");

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

			this.setViewProperty("/List/VARIANT", sVariant || sDefaultVariant);
			sVariant = this.getViewProperty("/List/VARIANT");

			var aSorter;
			var oVariant = this.getVariant(sVariant) || oViewModel.getProperty("/List/CURRENTVAR");
			if(!oVariant){
			    oVariant = {ACTION: sVariant, DEFAULT_SORT:"NAME"};
			}
			var bBound = this.getList().isBound("items");
			// even if there is no query defined, we need to add the default sorter that is applied
			if (!oQuery  || !oQuery.sort) {
				var sDefaultSort = oVariant.DEFAULT_SORT;
				var sDefaultOrder = this.getSort(sDefaultSort)[0].DEFAULT_ORDER;
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
				this.updateFilter();
				this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));

				this.bindList(oQuery);
				this.initialSorterItems();
	        }
	        
	        /* used to prevent opening and closing the filter while changing the variant, etc. */
            this._bInnerViewNavigation = true;

            // TODO Set help
            this.setHelp("TAG_LIST");
        },
        
        bindList : function(oQuery) {
            this.saveState();

            this.setPath("data>/" + this.getBindingPath(oQuery));
            
            BaseController.prototype.bindList.apply(this);
        },
        
        bindVariants : function() {
            var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagGroupQuery.xsjs";
            var oTagGroupModel = new JSONModel(sPath);
            //var aVariants = this.getModel("list").getProperty("/Variants/Values");
            var aVariants = this.getDefaultVariantValue();
            var that = this;
            oTagGroupModel.attachRequestCompleted(null, function() {
                var aTagGroup = oTagGroupModel.getData();
                if (aTagGroup.length > 0) {
                    
                    // add other group
                    aTagGroup.push({
                        TEXT : "TAG_LIST_MIT_OTHER",
                        NAME : "TAG_LIST_MIT_OTHER",
                        ACTION : mVariant.OTHER,
                        FILTER : mFilter.NONE,
                        DEFAULT_SORT : mSort.NAME,
                        HIERARCHY_LEVEL: "1",
                        VISIBLE: true
                    });
                }
                aTagGroup = aVariants.concat(aTagGroup);
                that.getModel("list").setProperty("/Variants/Values", aTagGroup);
            }, oTagGroupModel);
         // var test = oTagGroupModel.loadData(sPath,undefined,false);   

            
        },

        getList: function() {
			return this.byId("objectlist");
		},
		
		getItemTemplate : function() {
            return this.getFragment("sap.ino.vc.tag.fragments.CardListItem");
        },
        
        getBindingPath : function(oQuery) {
            var searchValue = oQuery && oQuery.search || "";
            if (this.getFilter().length === 0) {
                return "SearchTagsAllParams(searchToken='" + searchValue + "')/Results";
            } else {
                return "SearchTagsAllFullParams(searchToken='" + searchValue + "')/Results";
            }
        },
		
		updateFilter: function() {
		    var aFilter = [];
		    this.setFilter([]);
		    // add filter by variant
		    var sVariant = this.getViewProperty("/List/VARIANT");
		    if (sVariant === mVariant.ALL) {
		        return;
		    } else if (sVariant === mVariant.OTHER) {
		        var aTagGroup = this.getModel("list").getProperty("/Variants/Values");
		        jQuery.each(aTagGroup, function(idx, oTagGroup) {
		            if (oTagGroup.ACTION !== mVariant.ALL && oTagGroup.ACTION !== mVariant.OTHER) {
		                aFilter.push(new Filter("GROUP_ID", FilterOperator.NE, oTagGroup.ACTION));
		            }
		        });
		    } else {
		        aFilter.push(new Filter("GROUP_ID", FilterOperator.EQ, this.getViewProperty("/List/VARIANT")));
		    }
		    this.addFilter(new Filter({
		        filters : aFilter,
		        and: true
		    }));
		},
		
		setParameters: function(oQuery, oVariant) {
		    BaseController.prototype.setParameters.apply(this, arguments);
		},
		
		getDefaultVariantValue : function() {
		    return [{
		        TEXT : "TAG_LIST_MIT_TAGS",
                ACTION : mVariant.ALL,
                NAME : "TAG_LIST_MIT_TAGS",
                FILTER : mFilter.NONE,
                DEFAULT_SORT : mSort.NAME,
                VISIBLE: true
		    }];
		},
		
		follow: function(){
		    MessageToast.show("test");
		}
    }));

    oTAGList.list = mList;
    oTAGList.listContext = mListContext;
    
    return oTAGList;
});