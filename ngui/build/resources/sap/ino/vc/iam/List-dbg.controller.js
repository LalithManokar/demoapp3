sap.ui.define([
   "sap/ino/vc/commons/BaseVariantListController",
   "sap/ui/Device",
   "sap/ui/model/Sorter",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/Filter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/controls/OrientationType",
    "sap/ino/commons/application/Configuration"
], function (BaseController,
             Device,
             Sorter,
             JSONModel,
             Filter,
             TopLevelPageFacet,
             OrientationType,Configuration) {
   "use strict"; 
   
    var mOrder = {
        ASC : "ASC",
        DESC : "DESC"
    };

    var mSort = {
        CHANGED_AT : "CHANGED_AT",
        NAME : "NAME",
        SEARCH_SCORE: "SEARCH_SCORE"
    };

    var mVariant = {
        ALL : "all"
    };
	    
    var mFilter = {
        NONE : undefined,
        USER : "USER"
    };
    
    var mListContext = {
        PEOPLE : "peoplelist",
        PEOPLE_VARIANT : "peoplelistvariant"
    };
    
    var mList = {
        NAME:"PEOPLE_LIST_TIT_NAME",
        ADJUSTMENT_TITLE : "IDENTITY_LIST_TIT_ADJUSTMENT",
        Filter : {},
        Sorter : {
            Values : [{
                TEXT : "SORT_MIT_CHANGED",
                ACTION : mSort.CHANGED_AT,
                DEFAULT_ORDER : mOrder.DESC
            }, {
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
            TITLE : "PEOPLE_LIST_TIT_VARIANTS",
            Values : [{
                TEXT : "PEOPLE_LIST_MIT_USER",
                ACTION : mVariant.ALL,
                FILTER : mFilter.USER,
                DEFAULT_SORT : mSort.NAME,
                VISIBLE: true
            }]
        }
    };
	
    var oIAMList = BaseController.extend("sap.ino.vc.iam.List", jQuery.extend({}, TopLevelPageFacet, {
	   
       /* Controller reacts when these routes match */ 
        routes : ["peoplelist", "peoplelistvariant"],
        
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
      
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);

            var oViewModel = this.getModel("view") || new JSONModel({});
            oViewModel.setData(this.view, true);

            this.getList().attachUpdateFinished(this.onUpdateFinished, this);
            if (Device.system.phone && !Device.orientation.portrait) {
                this.getList().setWrapping(false);
            }
            else {
                //this.getList().addStyleClass("sapInoIdeaListCardItems");
                this.getList().setWrapping(true);
            }
             
        },        
    
        //TODO remove toplevelpagefacet, implement show function w/ signature to 1: route 2: query
        onRouteMatched : function(oEvent, oObject) {
            var oQuery;
            var sVariant;
            var aSorter;
            var oVariant;
            var sVariantFilter;
	        
	        var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
	        
            if (oEvent && oEvent.getParameter) {
                var oArguments = oEvent.getParameter("arguments");    
                this._sRoute = oEvent.getParameter("name");
                oQuery = oArguments["?query"];
                sVariant = oArguments.variant;
            }
            else {
                this._sRoute = oEvent;
                oQuery = oObject;
                sVariant = oObject.variant;
            }
             
            var oViewModel = this.getModel("view");
            oViewModel.setData(this.view, true);
	         
            var bBound = this.getList().isBound("items");
             
            // even if there is no query defined, we need to add the default sorter that is applied
            if (!oQuery || !oQuery.sort) {
                var sDefaultSort = this.getViewProperty("/List/Default/SORT");
                var sDefaultOrder = this.getSort(sDefaultSort)[0].DEFAULT_ORDER;
	             
                oQuery = oQuery || {};

				oQuery.sort = oQuery.sort || sDefaultSort;
				
				// enhance for sort combination
				oQuery.sort = oQuery.sort + " " + (oQuery.order || sDefaultOrder);
	        }
	         
            var bRebindRequired = this.hasStateChanged(this._sRoute, sVariant, oQuery, Device.orientation.portrait); 
	         
            if (!bBound || bRebindRequired) {
                oVariant = this.getVariant(sVariant);
                if (!oVariant) {
                    oVariant = this.getVariant(sDefaultVariant);
                }
                sVariantFilter = oVariant.FILTER;
	             
                this.setParameters(oQuery, oVariant);
	             
	            /* -- Do not show the filterbar automatically but let the user change it -- */
	             
                aSorter = this.getSort(this.getViewProperty("/List/SORT"));
	             
                this.setSorter(aSorter);
                this.updateFilter();
	
	            this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));
	
                var sSearchTerm = this.getViewProperty("/List/SEARCH");
                this.bindList(sSearchTerm, sVariantFilter);
                this.initialSorterItems();
            }
	         
            /* used to prevent opening and closing the filter while changing the variant, etc. */
            this._bInnerViewNavigation = true;

            this.setHelp("IDENTITY_LIST");
	     },
	     
        getBindingPath : function(oQuery) {
            if(!oQuery || oQuery === {}) {
                return { Path: this.getIdentiryEntityName() };
            } else {
                var oBindingData = {};
    
                if (oQuery.search === undefined) {
                    oBindingData.Path = this.getIdentiryEntityName();
                } else {
                    oBindingData.Path = "SearchIdentityPeopleList(searchToken='" + (oQuery.search || "") + "')/Results";
                }
                
                if(oQuery.variant) {
                    oBindingData.Filter = [new Filter("TYPE_CODE", "EQ", oQuery.variant)];
                }
                return oBindingData;
            }
        },
        getIdentiryEntityName: function() {
			if (Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
				return "Identity";
			}
			return "LeanIdentity";
	    },
        updateListAccessibilityUserCard : function() {
            // accessibility: we need to update the aria property like this due to (for us) not usable behaviour of UI5
         this.getList().getBinding("items").attachDataReceived(function() {
                    var oList = this.getList();
                    //oList.$().find(".sapMListUl").attr("role", "list"); 
                    var aItems = oList.$().find("li");
                    jQuery.each(aItems, function(iIdx, oItemDom) {
                        var $Item = jQuery(oItemDom);
                        $Item.attr("aria-label", $Item.getEncodedText()); 
                      
                    });
                }, this);
        
        },
     
        bindList : function(sSearchTerm, sVariantFilter) {
            var sRoute = this.getCurrentRoute();
	         
            var sVariant;
            if (sRoute === "identitylistvariant") {
                sVariant = this.getCurrentVariant().ACTION;
            }
	
            this.saveState(sVariant);
	         
            var oBindingData = this.getBindingPath({
                search: sSearchTerm,
                variant: sVariantFilter
            });
            this.setPath("data>/" + oBindingData.Path);
            BaseController.prototype.setFilter.apply(this, oBindingData.Filter);
            BaseController.prototype.bindList.apply(this, arguments);
            this.updateListAccessibilityUserCard();
        },
        
        getList : function() {
            return this.byId("objectlist");
        },

        getItemTemplate : function() {
            return this.getFragment("sap.ino.vc.iam.fragments.IdentityListItem");
        },

        onVariantPress : function(sVariantAction, oEvent) {
            BaseController.prototype.onVariantPress.apply(this, [sVariantAction, oEvent, "identitylistvariant", "identitylist"]);
        },
        
        onRefresh: function() {
            var oList = this.getList();
            var oBindingInfo = oList.getBindingInfo("items");
			oList.bindAggregation("items", oBindingInfo);
		},
 
        updateFilter : function() {
            //nothing to do
        },  

        onUserPressed: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("data");
            if (oContext) {
                this.navigateTo("userdetail", { id: oContext.getProperty("ID") });
            }
        },
        
        formatObjectListVariantsVisible: function () {
            return true;
        }
        
    }));
    
    /* ListModel defining filter, sorter and variants of the list */
    oIAMList.list = mList;
    oIAMList.listContext = mListContext;
    
    return oIAMList;
});