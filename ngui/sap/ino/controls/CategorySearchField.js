/*
*   Search control for inm global search;
*   
*/

sap.ui.define([
    'sap/ui/core/Control',
    'sap/m/SearchField',
    'sap/m/Button',
    'sap/m/ActionSelect',
    'sap/ui/core/InvisibleText',
    'sap/ui/core/ListItem',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/application/Configuration"
],function(Control, SearchField, Button, ActionSelect, InvisibleText, ListItem, Filter, FilterOperator, Configuration){
    'use strict';
    
    return Control.extend("sap.ino.controls.CategorySearchField", {
        metadata: {
            properties: {
                enbaled: {
                    type: 'boolean'
                },
                selectedCategory: {
                    type: 'string'
                },
                category: {
                    type: 'object[]'
                }
            },
            aggregations: {
                _SearchField: {
                    type: 'sap.m.SearchField',
                    multiple: false,
                    visibility: false
                },
                _CategoryDropDown: {
                    type: 'sap.m.ActionSelect',
                    multiple: false,
                    visibility: false
                }
            },
            events: {
                search: {}
            }
        },
        
        init: function() {
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},
        
        _onSearch: function(event,keyword){
            var searchAguments =  this.getModel('search').getProperty('/searchAguments');
            this.fireSearch({
                category: this.getProperty('selectedCategory'),
                search: keyword || event.getParameters().query.trim(),
                param: searchAguments
            });
        },
       
        _selectCategory: function(event){
            var param = event.getParameters();
            var item = param && param.selectedItem;
            var key = item && item.getKey();
            this.setProperty('selectedCategory', key);
            this.getModel('search').setProperty('/selectedCategory',key);
            var searchField = this.getAggregation('_SearchField');
            if(key === 'idealistbycompany' || key === 'campaign-idealistbycompany'){
                 
                if(!searchField.getEnableSuggestions()){
                    searchField.attachSuggest(function(oEvent) {
                    var sValue = oEvent.getParameter("suggestValue");
                    var oGroupSetting = Configuration.getGroupConfiguration();
                    var TYPENAME = oGroupSetting.GROUP === 'COMPANY' ? 1 : 2;
                    // Encoding needed for IE!
                     searchField.getModel("data").read("/SearchIdentityOrgCompanyParams(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results", {
                         urlParameters: {
							"$skip": 0,
							"$top":30,
							"$filter":'TYPENAME eq \'' + TYPENAME + '\''
						},
						success: function(oData) {
							searchField.removeAllSuggestionItems();
							// we cannot set all items at once, therefore we use 
							// 0..n-1 addAggregation w/o list update
							// n addSuggestionItem which triggers a list refresh
							
							for (var ii = 0; ii < oData.results.length - 1; ii++) {
								searchField.addAggregation("suggestionItems", new sap.m.SuggestionItem({
									key: oData.results[ii][oGroupSetting.GROUP],
									text: oData.results[ii].DISPLAYLABEL
								}), true);
							}
							if (oData.results.length > 0) {
								searchField.addSuggestionItem(new sap.m.SuggestionItem({
									key: oData.results[oData.results.length - 1][oGroupSetting.GROUP],
									text: oData.results[oData.results.length - 1].DISPLAYLABEL
								}));
							}
							searchField.suggest(true);
						}
					});
                    
                    
    			 //   searchField.getBinding("suggestionItems").filter(aFilters);
                    
                });
            searchField.setEnableSuggestions(true);
                }
			    
            }else{
                searchField.setEnableSuggestions(false);  
                searchField.destroySuggestionItems();
            }
            
        },
        
        _SearchInput: function(){
            var self = this;
            var searchField = self.getAggregation('_SearchField');
            if(!searchField){
                searchField = new SearchField({
                    showSearchButton: true,
                    value: "{path: 'search>/searchAguments/?query/search', formatter: 'sap.ino.commons.formatters.BaseFormatter.URIdecoding'}",
                    search: function(e){
                        var oItem = e.getParameter("suggestionItem");
                        //selected from suggestionItem
                        if(oItem){
                            e.getSource().setValue(oItem.getKey());
                        }
                        var searchKey = oItem ? oItem.getKey() : null;
                        self._onSearch(e,searchKey);  
                    }
                }).addStyleClass('sapInoGlobalSearchInput');
                self.setAggregation('_SearchField', searchField, true);
            }
            return searchField;
        },
        
        _SearchCategory: function(){
            var self = this;
            var categoryDropDown = self.getAggregation('_CategoryDropDown');
            if(!categoryDropDown){
                categoryDropDown = new ActionSelect({
                    autoAdjustWidth: true,
                    selectedKey: '{search>/selectedCategory}',//self.getProperty('selectedCategory'),
                    change:function(e){
                        self._selectCategory(e);   
                    }
                }).bindItems({
                    path: 'search>/category',
                    template: new ListItem({
                        key: '{search>key}',
                        tooltip: "{parts: [{path: 'search>value'}, {path: 'search>bNotFormatter'}], formatter: 'sap.ino.commons.formatters.BaseFormatter.formatGlobalSearchKey'}",
                        text: "{parts: [{path: 'search>value'}, {path: 'search>bNotFormatter'}], formatter: 'sap.ino.commons.formatters.BaseFormatter.formatGlobalSearchKey'}"
                    })
                }).addStyleClass('sapInoGlobalSearchDropDown');
                self.setAggregation('_CategoryDropDown', categoryDropDown, true);
            }
            return categoryDropDown;
        },
        
        renderer: function(oRM, oControl){
            oRM.write('<div');
            oRM.addClass('sapInoGlobalSearch');
            oRM.writeClasses();
            oRM.write('>');
            oRM.renderControl(oControl._SearchCategory());
            oRM.renderControl(oControl._SearchInput());
            oRM.write('</div>');
        }
    });
});