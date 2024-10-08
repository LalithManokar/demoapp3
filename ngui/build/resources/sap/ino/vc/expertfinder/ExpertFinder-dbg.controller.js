sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/ui/core/ListItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/vc/commons/mixins/ClipboardMixin",
    "sap/ino/vc/commons/mixins/IdentityQuickviewMixin"
], function(BaseController,
            Configuration,
            JSONModel,
            TopLevelPageFacet,
            Device,
            ListItem,
            Filter,
            FilterOperator,
            ClipboardMixin,
            IdentityQuickviewMixin) {
    "use strict";
    
    return BaseController.extend("sap.ino.vc.expertfinder.ExpertFinder", jQuery.extend({}, TopLevelPageFacet, ClipboardMixin, IdentityQuickviewMixin, {

        routes: ["expertfinder"],
        
        view: {
            INPUT: "",
            IDEACARD_SECTION_VISIBLE: 'TAG',  // used in ExpertDetails.fragment.xml
            Tags: []  
        },
        
        onRouteMatched: function(oEvent) {
            var oView = this.getView();
            this.view.Tags = [];
            oView.setModel(new JSONModel(this.view), "view");
            var oExpertModel = new JSONModel({});
          var bBOPrivilege = this.getModel("user").getProperty("/privileges")["sap.ino.ui::backoffice.access"];
            if(!bBOPrivilege){
              this.navigateTo("home"); 
              return;
              }            
            oView.setModel(oExpertModel, "proposedExperts");
            this.displayExpertDetail(false);
            this.setHelp("EXPERT_FINDER");
            // set object exists property
  
            var sActive = this.getModel("config").oData["sap.ino.config.EXPERT_FINDER_ACTIVE"];
            this.setObjectExists(bBOPrivilege && (sActive === "1"));
        },
        
        displayExpertDetail: function(bDisplayDetail) {
            var oExpertDetailContainer = this.getView().byId("expertDetailContainer");
            oExpertDetailContainer.toggleStyleClass("sapInoInvisible", !bDisplayDetail);
            var oExpertGraphContainer = this.getView().byId("expertGraphContainer");
            oExpertGraphContainer.toggleStyleClass("sapInoExpertGraphContainerDetail", bDisplayDetail);
            oExpertGraphContainer.toggleStyleClass("sapInoExpertGraphContainer", !bDisplayDetail);
        },
        
        onSuggestTag: function (oEvent) {
		    var oControl = oEvent.getSource();
            var that = this;
            var sValue = oEvent.getParameter("suggestValue");
            var oTemplate = new ListItem({
                key : "{data>ID}",
                text : "{data>NAME}"
            });
            var sSuggestPath = "/SearchIdeaTagsParams(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results";
            var oFilter = this._getSuggestionItemsFilter(this.view.Tags);
            oControl.bindAggregation("suggestionItems", { 
                path: "data>" + sSuggestPath,
                filters: oFilter,
                template : oTemplate
            });
        },

        _getSuggestionItemsFilter: function(aExcludeTags) {
            var aFilter = [];
            jQuery.each(aExcludeTags, function(i, oTag) {
                var oFilter = new Filter({
                    path: "NAME",
                    operator: FilterOperator.NE,
                    value1: oTag.NAME
                    
                });
                aFilter.push(oFilter);
            });
            return (aFilter.length === 0) ? [] : [new Filter(aFilter, true)];
        },
        
        onAddTag: function(oEvent) {
            var oView = this.getView();
            var oViewModel = oView.getModel("view");

            // retrieve tag
            var oInput = this.byId("suggestTag");
            var oSelectedItem;

            var aResult = jQuery.grep(oInput.getSuggestionItems(), function(oSuggestionItem) {
                return oSuggestionItem.getText().toLowerCase() === oInput.getValue().toLowerCase();
            });
            if (aResult.length > 0) {
                oSelectedItem = aResult[0]; 
                this.view.INPUT = oSelectedItem.getText();
            }                
            var oNewTag = {
                TAG_ID: oSelectedItem && oSelectedItem.getKey(),
                NAME: oSelectedItem && oSelectedItem.getText()
            };
            
            if (oNewTag.NAME && oNewTag.NAME.length !== 0) {
                // update view model
                var aTags = oViewModel.getProperty("/Tags");
                var aDuplicateTags = jQuery.grep(aTags, function(oTag) {
                    return oTag.NAME.toLowerCase() === oNewTag.NAME.toLowerCase();  // Tags are case-insensitive
                });
                if (aDuplicateTags.length === 0) {
                    aTags.push(oNewTag);
                    oViewModel.setProperty("/Tags", []); // workaround for UI5 bug with duplicate token ids
                    oViewModel.setProperty("/Tags", aTags);
                    // update expert graph
                    var sUrl = this._getExpertUrl(this.view.Tags);
                    oView.getModel("proposedExperts").loadData(sUrl);
                    oView.getModel("proposedExperts").refresh();
                }
                oInput.setValue("");
                oInput.setValueState("None");
                oInput.focus();
            } else if (oInput.getValue().length !== 0) {
                oInput.setValueState("Error");
            }
        },

        onChangeTag: function(oEvent) {
            var oView = this.getView();
            var oViewModel = oView.getModel("view");
            if (oEvent.getParameter("type") === "removed") {
                var oToken = oEvent.getParameter("token");
                var oRemoveTag = {
                    TAG_ID: oToken && oToken.getKey(),
                    NAME: oToken && oToken.getText()
                };
                if (oRemoveTag.NAME) {
                    var aTags = jQuery.grep(oViewModel.getProperty("/Tags"), function(oTag) {
                        return oTag.NAME !== oRemoveTag.NAME;
                    });
                    oViewModel.setProperty("/Tags", []); // workaround for UI5 bug with duplicate token ids
                    oViewModel.setProperty("/Tags", aTags);
                    if (this.view.Tags.length > 0) {
                        var sUrl = this._getExpertUrl(this.view.Tags);
                        oView.getModel("proposedExperts").loadData(sUrl);
                    } else {
                        oView.getModel("proposedExperts").setData({});
                        this.bindExpert(null);
                        this.displayExpertDetail(false);
                    }
                }
            }
        },

        _getExpertUrl: function(aObjectTags) {
            var aStringTags = aObjectTags.map(function(oTag) {return oTag.NAME;});
            var sUrl = Configuration.getIdeaExpertsByTagsURL(aStringTags);
            return sUrl;
        },

        bindExpert : function(oExpert) {
            var oView = this.getView();
            var oPanel = this.getView().byId("expertDetails");
            var aSelectedExpertIndex = jQuery.map(oView.getModel("proposedExperts").getData(), function(o,i){if (o.ID === oExpert.PERSON_ID) {return i;}});
            if (aSelectedExpertIndex.length > 0) {
                oPanel.bindElement("proposedExperts>/" + aSelectedExpertIndex[0]);
            } else {
                oPanel.unbindElement("proposedExperts");
            }
        },

        onClickNode: function(oEvent) {
            if (oEvent.getParameters().group && oEvent.getParameters().group !== "0") { // group !== 0 is used to identify Person
                var oExpert = oEvent.getParameters();
                this.bindExpert(oExpert);
                this.displayExpertDetail(true);
            }
        },
        
        onOpenIdea: function (oEvent) {
            if (Device.system.phone) {
                this.getView().getParent().close();
            }
            var oContext = oEvent.getSource().getBindingContext("proposedExperts");
            var iIdeaId = oContext.getProperty("IDEA/ID");
            if (iIdeaId) {
                this.navigateTo("idea-display", {id: iIdeaId});
            }
        },
        
        onExpertExpand: function (oEvent) {
            var oControl = oEvent.getSource().getParent();
            oControl.toggleStyleClass("sapInoIdeaExpertItemSelected");
        },
        
        isExpertActionable: function() {
            return false;
        },
        
        isExpertAddedForDialog: function(){
            return false;  
        },

    }));
});