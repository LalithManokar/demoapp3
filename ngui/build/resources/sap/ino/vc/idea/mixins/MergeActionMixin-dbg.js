sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/commons/models/core/ModelSynchronizer",
    "sap/ino/commons/models/aof/PropertyModel",
    'sap/ino/commons/models/object/Idea',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/CheckBox",
    "sap/m/MessageToast",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageBox",
    "sap/ino/commons/models/object/MergeConfig",
    "sap/ino/controls/IdeaStatusType"
], function(BaseActionMixin,
            BaseController,
            JSONModel,
            ClipboardModel,
            ModelSynchronizer,
            PropertyModel,
            Idea, 
            Filter, 
            FilterOperator,
            Sorter,
            CheckBox,
            MessageToast,
            Configuration,
            MessageBox,
            MergeConfig,
            IdeaStatusType) {
    "use strict";
    
    var MergeActionMixin = jQuery.extend({}, BaseActionMixin);

    /**
    * Event handler triggered by pressing merge either in idea display or list
    *
    * @param    {Event}     oEvent      press event by respective buttons
    */
    MergeActionMixin.onIdeaMerge = function(oEvent) {
        // @Todo: check initially whether merging of the source idea is allowed at all - if no, break with error
        var oDialog, iIdeaId, sName, aFilters, oClipboard, oMergeModel;
        var oSource = oEvent.getSource();
        
        // get current idea ID and Name
        if (this.isActionContextSingleIdeaDisplay()) {
            iIdeaId = this.getObjectModel().getProperty("/ID");
            sName = this.getObjectModel().getProperty("/NAME");
        } else {
            iIdeaId = oSource.getBindingContext("data").getProperty("ID");
            sName = oSource.getBindingContext("data").getProperty("NAME");
        }
        
        // internal model for merge feature
        oMergeModel = new JSONModel({
            // current page in NavController
            pageview: "merge01",
            // source idea info (idea on which merge is initially executed)
            sourceId : iIdeaId,
            sourceName: sName,
            // leading idea
            leadingIdeaId: iIdeaId,
            // all ideas initially loaded for selection
            allIdeas: [],
            // selected ideas in first step
            selectedIdeas: [],
            // enriched model with merged property model information
            selectedIdeaObjects: []
        });

        // get idea IDs from clipboard and create filter array
        oClipboard = this._getClipboardModel();
        if (oClipboard) {
            // get clipboard ideas except currently selected idea
            var aCBIdeas = oClipboard.getObjectKeys(Idea).filter(function (iTempIdeaId) {
                    // filter source Idea
                    return iTempIdeaId !== iIdeaId;
                });
            aFilters = aCBIdeas.map(function (iTempIdeaId) {
                    // return Filter
                    return new Filter("ID", FilterOperator.EQ, iTempIdeaId);
                });
            oMergeModel.setProperty("/selectedIdeas", aCBIdeas);
            // Note: must be a clone, otherwise array object is the same!
            oMergeModel.setProperty("/allIdeas", aCBIdeas.slice(0));
        }
        var all_ideaID = aCBIdeas;
        all_ideaID.push(iIdeaId);
        var mergeRequestBody = {
            idea_id :all_ideaID.join(",")
        };
        var that = this;
        var finalResult;
        var checkRequest = jQuery.ajax({
    			url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/check_merge_anonymous_idea.xsjs",
    			data: mergeRequestBody,
    				success: function(res) {
    				    finalResult = res;
    				},
    			type: "GET",
			    contentType: "application/json; charset=UTF-8",
			    async: false
    		});
    	// if one of ideas is anonymous ,the merge operation will be rejected
    	 if (finalResult === 0) {
            MessageToast.show(that.getText("IDEA_MERGE_MSG_ANONYMOUS_IDEA_CANNOT_BE_MERGED"));
            return;
        }
        // there must be ideas in clipboard in order to being able to merge
        if (aFilters.length === 0) {
            MessageToast.show(that.getText("MSG_IDEA_MERGE_NO_IDEA_IN_CLIPBOARD"));
            return;
        }
        
        // check whether a merge operation is allowed on the selected idea
       
        var aProp = new PropertyModel("sap.ino.xs.object.idea.Idea", iIdeaId, {actions : ["mergeIdeas"]}, false, function(oPropEvent) {
            var oData = oPropEvent.getSource().getData();
            
            if (oData && oData.actions && oData.actions.mergeIdeas) {
                var oMergeIdeas = oData.actions.mergeIdeas;
                if (oMergeIdeas.enabled) { 
                    // internal model - i18n and data are inherited due to dependency
                    that.setModel(oMergeModel, "merge");
    
                    // Create the Dialog
                    oDialog = that._getIdeaMergeDialog();
                    that._prepareListItemForIdeaMerge(aFilters);
            
                    oDialog.open();
                } else {
                    MessageToast.show(oMergeIdeas.messages && oMergeIdeas.messages.length > 0 && oMergeIdeas.messages[0].MESSAGE_TEXT || this.getText("IDEA_MERGE_MSG_IDEA_CANNOT_BE_MERGED"));
                }
            }
        });
    };

    /**
     * returns the MergeDialog
     * 
     * @private
     * @return {sap.m.Dialog}   The merge dialog
     */
    MergeActionMixin._getIdeaMergeDialog = function() {
        if (!this._oMergeDialog) {
            this._oMergeDialog = this.createFragment("sap.ino.vc.idea.fragments.IdeaMergeDialog", this.getView().getId());
            this.getView().addDependent(this._oMergeDialog);
            this._sResizeMergeDialog = this.attachListControlResized(this.byId("ideaSelection"));
        }
        return this._oMergeDialog;
    };
    
    /**
     * creates the idea template and binds it to the dialog selection list
     * 
     * @private
     * @param   {Filter[]}  aFilters    filters corresponding to selectable ideas for OData filtering
     */ 
    MergeActionMixin._prepareListItemForIdeaMerge = function(aFilters){
        var oActionBox , oCheckBox , oSelectionList;
        
        // prepare FlatListItemForMerge template by adding checkbox
        if (!this._oIdeaMergeListItemTemplate) {
            this._oIdeaMergeListItemTemplate = this.getFragment("sap.ino.vc.idea.fragments.FlatListItemForMerge");
            // as this is a template, we need to get the idea via Fragment's byId
            oActionBox = sap.ui.core.Fragment.byId(this.getView().getId(), "flatListIdeaActions");
            // remove the first checkbox
            oActionBox.removeItem(oActionBox.getItems()[0]);
            oCheckBox = new CheckBox({
                selected: {
                    parts: [{path: "data>ID"}, {path: "merge>/selectedIdeas"}], formatter: this.formatIsInSelectedIdeas
                }, 
                select: this.onIdeaMergeIdeaSelect});
            oActionBox.addItem(oCheckBox);
        }
        
        // bind to idea data from IdeaMedium with filters
        oSelectionList = this.byId("ideaSelection");
        oSelectionList.bindItems({
            path: "data>/IdeaMedium",
            filters: aFilters,
            sorter: new Sorter("NAME"),
            template: this._oIdeaMergeListItemTemplate
        });
    };
    
    /**
     * event handler for selection of ideas in step 1
     * 
     * @param   {Event}     oEvent  event triggered by checkbox in each list item
     */
    MergeActionMixin.onIdeaMergeIdeaSelect = function(oEvent) {
        var oSource, bSelected, iIdeaId, aSelectedIdeas;
        
        // register (selection) and update model respectively
        oSource = oEvent.getSource();
        bSelected = oEvent.getParameter("selected");
        iIdeaId = oSource.getBindingContext("data").getProperty("ID");
        // must be a copy or the formatter will not be re-evaluated
        aSelectedIdeas = this.getModel("merge").getProperty("/selectedIdeas").slice(0);
        
        if (bSelected) {
            if (aSelectedIdeas.indexOf(iIdeaId) === -1) {
                aSelectedIdeas.push(iIdeaId);
            }
        } else {
            if (aSelectedIdeas.indexOf(iIdeaId) > -1) {
                aSelectedIdeas.splice(aSelectedIdeas.indexOf(iIdeaId), 1);
            }
        }
        this.getModel("merge").setProperty("/selectedIdeas", aSelectedIdeas);
    };
    
    /**
     * event handler for button "select all"
     * 
     * @aparam  {Event} oEvent      press event
     */ 
    MergeActionMixin.onSelectAllMergeIdeas = function(oEvent) {
        // note: MUST be a clone (slice), otherwise array will be decoupled
        var aAllIdeasClone = this.getModel("merge").getProperty("/allIdeas").slice(0);
        this.getModel("merge").setProperty("/selectedIdeas", aAllIdeasClone);
    };
    
    /**
     * event handler for select box when a new leading idea is selected
     * 
     * @param   {Event} oEvent      the event
     */ 
    MergeActionMixin.onChangeLeadingMergeIdea = function(oEvent) {
        var oLeadingItem = oEvent.getParameter("selectedItem");
        var iLeadingIdeaId = oLeadingItem.getKey();
        var oMergeModel = this.getModel("merge");
        // re-create objects to ensure clean slate
        var aIdeaObjects = oMergeModel.getProperty("/selectedIdeaObjects").map(function (oItem) { return {ID: oItem.ID, NAME: oItem.NAME}; });
        oMergeModel.setProperty("/leadingIdeaId", iLeadingIdeaId);
        // update with new simulation results
        this._simulateMergeTransition(iLeadingIdeaId, aIdeaObjects);
    };
    
    /**
     * cleans up the dialog and the model
     * @private
     */
    MergeActionMixin._disposeIdeaMergeDialog = function() {
        var oDialog = this._getIdeaMergeDialog();
        this.detachListControlResized(this._sResizeMergeDialog);
        oDialog.close();
        oDialog.destroy();
        this._oMergeDialog = null;
    };

    /**
     * event handler for aborting merge by cancel button
     * 
     * @param   {Event} oEvent      the event
     */ 
    MergeActionMixin.onIdeaMergeCancel = function(oEvent) {
        this._disposeIdeaMergeDialog();
    };
    
    /**
     * event handler for button triggering navigation to step 2
     * 
     * @param   {Event} oEvent      the event
     */ 
    MergeActionMixin.onIdeaMergeNextStep = function(oEvent) {
        var oMergeModel = this.getModel("merge");
        var aSelectedIdeas = oMergeModel.getProperty("/selectedIdeas");
        var oSelectionList = this.byId("ideaSelection");
        var iIdeaId = oMergeModel.getProperty("/sourceId");
        var iLeadingIdeaId = oMergeModel.getProperty("/leadingIdeaId");
        var aIdeaObjects = [];
        
        // create idea objects with ID/NAME for binding
        jQuery.each(oSelectionList.getItems(), function (iIdx, oItem) {
            var iItemId = oItem.getBindingContext("data").getProperty("ID");
            var sItemName = oItem.getBindingContext("data").getProperty("NAME");
            if (aSelectedIdeas.indexOf(iItemId) > -1) {
                aIdeaObjects.push({ID: iItemId, NAME: sItemName});
            }
        });
        // add source idea as well
        aIdeaObjects.push({ID: iIdeaId, NAME: oMergeModel.getProperty("/sourceName")});

        this._simulateMergeTransition(iLeadingIdeaId, aIdeaObjects);
    };
    
    /**
     * triggers the simulation by asynchronously requesting the backend property model
     * 
     * @private
     * @param   {int}       iLeadingIdeaId  the ID of the idea currently marked as leading
     * @param   {object[]}  aIdeaObjects    list of ideas to simulate merging with
     */ 
    MergeActionMixin._simulateMergeTransition = function(iLeadingIdeaId, aIdeaObjects) {
        var that = this;
        var oMergeModel = this.getModel("merge");
        
        // Helper function - returns first matching item
        var fnFindFirst = function(aItems, sKey, vValue) {
            for (var i = 0; i < aItems.length; i += 1 ) {
                var oItem = aItems[i];
                if (oItem[sKey] === vValue) {
                    return oItem;
                }
            }
            return null;
        };
        
        // callback receives data and enriches merge model
        var fnCallback = function(oPropEvent) {
            var oNavCont;
            var oData = oPropEvent.getSource().getData();
            
            if (oData && oData.actions && oData.actions.mergeIdeas) {
                var oTemp = oData.actions.mergeIdeas;
                // assemble outcomes into idea object data
                jQuery.each(oTemp.customProperties.outcome, function (iIdx, oItem) {
                    var oIdeaItem = fnFindFirst(aIdeaObjects, "ID", oItem.ID) || {};
                    oIdeaItem.outcome = oItem;
                });
                // merge messages into idea object data
                if(oTemp.messages && oTemp.messages.length !== 0 ){
                    jQuery.each(oTemp.messages, function (iIdx, oItem) {
                        var oIdeaItem = fnFindFirst(aIdeaObjects, "ID", oItem.REF_ID) || {};
                        oIdeaItem.messages = oItem;
                    });
                }
            }
            // set resulting model
            oMergeModel.setProperty("/selectedIdeaObjects", aIdeaObjects);
            oMergeModel.setProperty("/pageview", "merge02");
            // trigger navigation to step 2
            oNavCont = that.byId("ideaMergeNavCon");
            oNavCont.to(that.byId("merge02"));
        };
        
        // execute property model / transition simulation
        var oPropModel =  new PropertyModel("sap.ino.xs.object.idea.Idea", iLeadingIdeaId, {
            actions : [{
                "mergeIdeas" : aIdeaObjects.map(function (oItem) { return oItem.ID; }).filter(function (iId) { return iId !== iLeadingIdeaId; })
            }]
        }, false, fnCallback);
    };
    
    /**
     * event handler for navigating back to step 1
     * 
     * @param   {Event}     oEvent      the event
     */
    MergeActionMixin.onIdeaMergePrevStep = function(oEvent) {
        var oNavCont = this.byId("ideaMergeNavCon");
        this.getModel("merge").setProperty("/pageview", "merge01");
        oNavCont.backToPage(this.byId("merge01"));
    };
    
    /**
     * event handler for triggering the actual merge action
     * 
     * @param   {Event}     oEvent      the event
     */ 
    MergeActionMixin.onMergeIdeasExecute = function(oEvent) {
        var iLeadingIdea = this.getModel("merge").getProperty("/leadingIdeaId");
        var aMergeIdeaObjects = this.getModel("merge").getProperty("/selectedIdeaObjects");
        var aMergeIdeaIds = aMergeIdeaObjects.filter(function (oItem) {
            // filter leading idea and not-mergable ideas
            return oItem.ID !== iLeadingIdea && oItem.outcome && oItem.outcome.OUTCOME !== "IDEA_MERGE_NOT_MERGABLE";
        }).map(function (oItem) { return oItem.ID; });
        var oActionRequest;
        this.isActionContextSingleIdeaDisplay();
        oActionRequest = Idea.mergeIdeas(iLeadingIdea, aMergeIdeaIds);
        var that = this;
        oActionRequest.done(function(){
            // notify ModelSynchronizer about updated ideas
            aMergeIdeaIds.map(function(iIdeaId) {
                ModelSynchronizer.update(null, "mergeIdeas", Idea, iIdeaId);
            });
            // close dialog and clean up
            that._disposeIdeaMergeDialog();
            MessageToast.show(that.getText("MSG_IDEA_MERGE_SUCCESS"));
        });
        //show message when the ideamerge operation is not sucessfull
        oActionRequest.fail(function(oResponse) {
            var aMessages = oResponse.MESSAGES;
            
            jQuery.each(aMessages, function(iIdx, oMessage) {
                var sText;
                if (oMessage.MESSAGE_TEXT) {
                    sText = oMessage.MESSAGE_TEXT;
                } else {
                    sText = that.getText(oMessage.MESSAGE, oMessage.REF_ID);
                }
                MessageToast.show(sText);
            });
        });
    };
    
    /**
     * formatter: opportunistic enabled check for idea lists - checks status and clipboard status.
     * This formatter should only be used for idea lists, as it doesn't query the backend. However,
     * in certain situations, the result could be wrong!
     * 
     * @param   {string}    sStatus     an idea's current status
     * @returns {boolean}               true if merge action is most probably enabled
     */
    MergeActionMixin.formatIdeaMergeActionEnabled = function(sStatus) {
        return !this.formatter.isFinal(sStatus) && this._getClipboardModel().getProperty("/enabled");
    };
    
    /**
     * formatter: returns either a translation of the outcome or a given message text delivered by the server
     * 
     * @param   {string}    sOutcome    the outcome of a merge simulation
     * @param   {object}    oMessage    a message object from the server
     * @param   {string}                a message representing the simulation's outcome
     */ 
    MergeActionMixin.formatIdeaMergeResult = function(sOutcome, oMessage) {
        return oMessage && oMessage.MESSAGE_TEXT || this.getText(sOutcome);
    };
    
    /**
     * formatter: naive check whether a server error / warning message is a valid object
     * 
     * @param   {object}    oMessage    a message object from the server
     * @returns {boolean}               true if a message object exists
     */
    MergeActionMixin.formatIdeaMergeResultErroneous = function (oMessage) {
        return !!oMessage;
    };
   
    /**
     * formatter: checks whether the given idea id is in aSelectedIdeas
     * 
     * @param   {int}   iId             the idea id
     * @param   {int[]} aSelectedIdeas  list of idea ids
     * @returns {boolean}               true if id is contained
     */ 
    MergeActionMixin.formatIsInSelectedIdeas = function(iId, aSelectedIdeas) {
        return aSelectedIdeas.indexOf(iId) !== -1;
    }; 
    
    /**
     * formatter: checks whether there are ideas selected to enable the next step (simulation) 
     * 
     * @param   {int[]} aSelectedIdeas  a list of selected idea ids
     * @returns {boolean}               true if next step is enabled 
     */ 
    MergeActionMixin.formatIdeaMergeNextStepEnabled = function(aSelectedIdeas) {
        return aSelectedIdeas && aSelectedIdeas.length > 0 || false;
    };
    
    /**
     * formatter: checks whether merging is enabled for at least two of the selected ideas
     * 
     * @param   {object[]}  aIdeaObjects    list of idea objects with outcome information
     * @returns {boolean}                   true if at least 2 mergable ideas are present
     */ 
    MergeActionMixin.formatMergeActionEnabled = function(aIdeaObjects) {
        var iValidCount = 0;
        if (aIdeaObjects) {
            jQuery.each(aIdeaObjects, function(idx, oItem) {
                if (oItem.outcome && oItem.outcome.OUTCOME !== "IDEA_MERGE_NOT_MERGABLE") {
                    iValidCount += 1;
                }
            });
        }
        return iValidCount >= 2;
    };
    
    MergeActionMixin.handleMassMerge = function(oEvent) {
        if (this.getViewProperty("/List/SELECT_ALL")) {
			var oBindingParams = this.getBindingParameter();
			var bIsManaged = this._check4ManagingList();
			var sFilterParams = this.getList().getBinding('items').sFilterParams;
            var aTags = this.getViewProperty("/List/TAGS");
		    var tagGroup = {};
            var tagGroupKey = [];
            aTags.forEach(function(item){
                        if(!tagGroup[item.ROOTGROUPID]){
                            tagGroup[item.ROOTGROUPID] = [];
                            tagGroup[item.ROOTGROUPID].push(item.ID);
                            tagGroupKey.push(item.ROOTGROUPID);
                        } else {
                            tagGroup[item.ROOTGROUPID].push(item.ID);
                        }   
                    });
            
			var oParameter = {
				searchToken: oBindingParams.SearchTerm || "",
				tagsToken:  tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
    			tagsToken1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
    			tagsToken2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
    			tagsToken3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
    			tagsToken4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
				filterName: oBindingParams.VariantFilter || "",
				filterBackoffice: bIsManaged ? "1" : "0",
				filterString: sFilterParams || ""
			};
    		if(this.setQueryObjectIdeaformFilters){
    		    this.setQueryObjectIdeaformFilters(oParameter);
    		}
    		if(this.getCampaignFormQuery){
    		    oParameter.ideaFormId = this.getCampaignFormQuery() || "";
    		}
    		if(this.getSearchType){
			    oParameter.searchType = this.getSearchType();
			}
			if (this.setQueryObjectCompanyViewFilters) {
				this.setQueryObjectCompanyViewFilters(oParameter);
			}
			// call back end service
			var that = this;
			var oSource = oEvent.getSource();
			// disable button
			oSource.setEnabled(false);
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/select_all_ideas.xsjs",
				data: oParameter,
				success: function(res) {
					// enable button
					oSource.setEnabled(true);
					if (res.Ideas.length === 0) {
						MessageBox.show(that.getText("NO_IDEAS_AND_RELOAD_PAGE"), {
							icon: MessageBox.Icon.INFORMATION,
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function() {
								that.bindList();
							}
						});
						return;
					}
					// clear selection map
					that._oSelectionMap = {};
					jQuery.each(res.Ideas, function(iIdx, oData) {
						if (!that._oDeselectionMap[oData.ID]) {
							// create data structure as property model
							oData.property = that._createPropertyData(oData);
							that._oSelectionMap[oData.ID] = oData;
						}
					});
					// call mass merge action
					that._onMassMerge();
				},
				error: function(res) {
					MessageToast.show(that.getText(res.responseJSON.messageKey));
				}
			});
		} else {
			// call mass merge action
			this._onMassMerge();
		}
    };
    
    MergeActionMixin._onMassMerge = function() {
        var oDialog, iIdeaId, oMergeModel, aCBIdeas, aSelListIdeas, aFilters, aSelectedIdeas;
        
        var oClipboard = this._getClipboardModel();
        if (oClipboard) {
            // get clipboard ideas except currently selected idea
            aCBIdeas = oClipboard.getObjectKeys(Idea).filter(function (iTempIdeaId) {
                // filter source Idea
                return iTempIdeaId !== iIdeaId;
            });
        }
        if (this.isActionContextSingleIdeaDisplay()) {
            aSelListIdeas = [this.getObjectModel().getProperty("/ID")];
        } else {
            aSelListIdeas = Object.keys(this._oSelectionMap).map(function(sIdeaId) {
                return parseInt(sIdeaId, 10);
            });
        }
        aCBIdeas = aCBIdeas || [];
        aSelectedIdeas = aSelListIdeas.concat(aCBIdeas);
        aFilters = aSelectedIdeas.map(function(iTempIdeaId) {
            return new Filter("ID", FilterOperator.EQ, iTempIdeaId);
        });
        
        // var aCBIdeas = Object.keys(this._oSelectionMap).map(function(iIdeaKey) {
        //     return that._oSelectionMap[iIdeaKey];
        // }).sort(function(oIdea1, oIdea2) {
        //     return oIdea2.SUBMITTED_AT_DT.getTime() - oIdea1.SUBMITTED_AT_DT.getTime();
        // });
        

        //iIdeaId = aCBIdeas[0].ID;
        
        // internal model for merge feature
        oMergeModel = new JSONModel({
            // current page in NavController
            pageview: "massMerge01",
            // leading idea
            leadingIdeaId: -1,
            // selected ideas in first step
            selectedIdeas: aSelectedIdeas,
            leadingIdeaList: [],
            mergeResultList: [],
            // merge button enable
            mergeable: false,
            // merge rule enable
            mergeRuleEnable: !!(Configuration.getSystemSetting("sap.ino.config.ENABLE_IDEA_MERGE_RULE") * 1),
            // vote merge enable
            voteMergeEnable: true
        });

        // exclude the first element
        // var aSourceIdeas = aCBIdeas.slice(1);
        // oMergeModel.setProperty("/selectedIdeas", aCBIdeas);
    
        oDialog = this._getIdeaMassMergeDialog();
        oDialog.setModel(oMergeModel, "merge");
        this._prepareListItemForMassIdeaMerge(aFilters);
        
        var oNavCon = this.byId("massIdeaMergeNavCon");
        oNavCon.to(this.byId("massMerge01"));

        oDialog.open();
    };
    
    MergeActionMixin._getIdeaMassMergeDialog = function() {
        if (!this._oMassMergeDialog) {
            this._oMassMergeDialog = this.createFragment("sap.ino.vc.idea.fragments.IdeaMassMergeDialog", this.getView().getId());
            this._oMassMergeDialog.setEscapeHandler(this.handleEscapePress, this);
            this.getView().addDependent(this._oMassMergeDialog);
        }
        return this._oMassMergeDialog;
    };
    
    MergeActionMixin._prepareListItemForMassIdeaMerge = function(aFilters) {
        var oActionBox, oSelectionList, oCheckBox, aLeadingIdeaList = [{ID: -1, NAME: ""}];
        var oMergeModel = this._getIdeaMassMergeDialog().getModel("merge");
        
        // prepare FlatListItemForMerge template by adding checkbox
        if (!this._oIdeaMassMergeListItemTemplate) {
            this._oIdeaMassMergeListItemTemplate = this.getFragment("sap.ino.vc.idea.fragments.FlatListItemForMerge");
            // as this is a template, we need to get the idea via Fragment's byId
            oActionBox = sap.ui.core.Fragment.byId(this.getView().getId(), "mergeListIdeaActions");
            // remove the first checkbox
            oActionBox.removeItem(oActionBox.getItems()[0]);
            var _fnFormatCheckboxTooltip = this.formatCheckboxTooltip.bind(this);
            oCheckBox = new CheckBox({
                selected: {
                    parts: ["data>ID", "merge>/leadingIdeaId", "merge>/selectedIdeas"], formatter: this.formatSelectedState
                }, 
                tooltip: {
                    parts: ["data>ID", "merge>/leadingIdeaId", "merge>/selectedIdeas"], formatter: _fnFormatCheckboxTooltip
                },
                enabled: {
                    parts: ["data>ID", "merge>/leadingIdeaId", "data>STATUS"], formatter: this.formatIsLeadingIdea
                },
                select: this.onIdeaMergeIdeaSelect});
            oActionBox.addItem(oCheckBox);
        }
        
        // bind to idea data from IdeaMedium with filters
        var oIdeaIdsFilter = new Filter({
            filters: aFilters,
            and: false
        });
        var oStatusFilter = new Filter("STATUS", FilterOperator.NE, IdeaStatusType.Merged);
        oSelectionList = this.byId("ideaToMerge");
        oSelectionList.bindItems({
            path: "data>/IdeaMedium",
            sorter: new Sorter("NAME"),
            filters: new Filter({
                filters: [oIdeaIdsFilter, oStatusFilter],
                and: true
            }),// aFilters, new Filter("ID", FilterOperator.EQ, iTempIdeaId);
            template: this._oIdeaMassMergeListItemTemplate
        });
        oSelectionList.getBinding("items").attachDataReceived(function() {
            jQuery.each(oSelectionList.getItems(), function (iIdx, oItem) {
                var iItemId = oItem.getBindingContext("data").getProperty("ID");
                var sItemName = oItem.getBindingContext("data").getProperty("NAME");
                var sVoteTypeCode = oItem.getBindingContext("data").getProperty("VOTE_TYPE_TYPE_CODE");
                aLeadingIdeaList.push({ID: iItemId, NAME: sItemName, VOTE_TYPE_TYPE_CODE: sVoteTypeCode});
            });
            oMergeModel.setProperty("/leadingIdeaList", aLeadingIdeaList);
        }, this);
    };
    
    MergeActionMixin.handleChangeLeadingMergeIdea = function() {
        var oMergeModel = this._getIdeaMassMergeDialog().getModel("merge");
        var iLeadingIdeaId = parseInt(oMergeModel.getData().leadingIdeaId, 10);
        //var aSelectedIdeas = oMergeModel.getProperty("/selectedIdeas");
        var aAllIdeas = oMergeModel.getProperty("/leadingIdeaList");
        oMergeModel.setProperty("/selectedIdeas", aAllIdeas.filter(function(oIdea) {
            //return iIdeaID !== iLeadingIdeaId;
            return oIdea.ID !== iLeadingIdeaId && oIdea.ID !== -1;
        }).map(function(oIdea) {
            return oIdea.ID;
        }));
    };
    
    MergeActionMixin.handleMassIdeaMergePrevStep = function() {
        var oDialog = this._getIdeaMassMergeDialog();
        var oMergeModel = oDialog.getModel("merge");
        var iCurrentPage = parseInt(/massMerge0(\d)/.exec(oMergeModel.getProperty("/pageview"))[1], 10);
        var sNewPage;
        if (iCurrentPage === 3 && !oMergeModel.getProperty("/mergeRuleEnable")) {
            sNewPage = "massMerge01";
        } else {
            sNewPage = "massMerge0" + (iCurrentPage - 1);
        }
        oMergeModel.setProperty("/pageview", sNewPage);
        
        var oNavCon = this.byId("massIdeaMergeNavCon");
        oNavCon.to(this.byId(sNewPage));
    };
    
    MergeActionMixin.handleMassIdeaMergeNextStep = function() {
        var oDialog = this._getIdeaMassMergeDialog();
        var oMergeModel = oDialog.getModel("merge");
        if (oMergeModel.getProperty("/mergeRuleEnable")) {
            this.handleMassIdeaMergeToRuleStep();
        } else {
            this.handleMassIdeaMergeToConfirmStep();
        }
    };
    
    MergeActionMixin.handleMassIdeaMergeToRuleStep = function() {
        var that = this;
        var oNavCon = this.byId("massIdeaMergeNavCon");
        oNavCon.to(this.byId("massMerge02"));
        
        var oDialog = this._getIdeaMassMergeDialog();
        var oMergeModel = oDialog.getModel("merge");
        oMergeModel.setProperty("/pageview", "massMerge02");
        
        // reset mergeable property
        oMergeModel.setProperty("/mergeable", false);
        
        oDialog.setBusy(true);
        // get merge rule config
        var oDeffered = MergeConfig.getMergeConfig();
        oDeffered.done(function(oData) {
            if (oData.RESULT.length === 0) {
                oData.RESULT = [{
                    MERGE_TYPE: that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_AUTHOR'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'AUTHOR'
                }, {
                    MERGE_TYPE: that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_EXPERTS'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'EXPERT'
                }, {
                    MERGE_TYPE: that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_VOTES'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'VOTE'
                }, {
                    MERGE_TYPE: that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_COMMENTS'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'COMMENT'
                }];
            } else {
                oData.RESULT.forEach(function(oRule) {
                    switch(oRule.OBJECT_TYPE_CODE) {
                        case "AUTHOR":
                            oRule.MERGE_TYPE = that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_AUTHOR');
                            break;
                        case "EXPERT":
                            oRule.MERGE_TYPE = that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_EXPERTS');
                            break;
                        case "VOTE":
                            oRule.MERGE_TYPE = that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_VOTES');
                            break;
                        case "COMMENT":
                            oRule.MERGE_TYPE = that.getText('IDEA_MASS_MERGE_RULE_TABLE_LABEL_COMMENTS');
                            break;
                    }
                    oRule.ADD = !!oRule.ADD;
                    oRule.IGNORE = !!oRule.IGNORE;
                    oRule.PROMPT = !!oRule.PROMPT;
                });
            }
            // compute the vote rule
            //that._computeVoteRule(oData.RESULT, oMergeModel.getData());
            var oRuleModel = new JSONModel(oData.RESULT);
            oDialog.setModel(oRuleModel, "rule");
            
            oRuleModel.attachPropertyChange(that._handleRuleChange, that);
            oRuleModel.firePropertyChange();
            
            oDialog.setBusy(false);
        });
    };
    
    MergeActionMixin.handleMassIdeaMergeToConfirmStep = function() {
        var oDialog = this._getIdeaMassMergeDialog();
        var oMergeModel = oDialog.getModel("merge");
        var iLeadingIdeaId = parseInt(oMergeModel.getProperty("/leadingIdeaId"), 10);
        var aTargetIdeas = [iLeadingIdeaId].concat(oMergeModel.getProperty("/selectedIdeas"));
        var aLeadingIdeaList = oMergeModel.getProperty("/leadingIdeaList");
        
        var that = this;
        // generate merge results
        oMergeModel.setProperty("/mergeResultList", aTargetIdeas.map(function(iIdeaID) {
            var oIdea = aLeadingIdeaList.filter(function(oIdeaData) {
                return oIdeaData.ID === iIdeaID;
            })[0];
            return {
                ideaType: oIdea.ID === iLeadingIdeaId ? that.getText("IDEA_MASS_MERGE_CONFIRM_TABLE_COL_LEADING_TYPE") : that.getText("IDEA_MASS_MERGE_CONFIRM_TABLE_COL_SOURCE_TYPE"),
                ideaName: oIdea.NAME,
                ideaID: oIdea.ID,
                result: oIdea.ID === iLeadingIdeaId ? that.getText("IDEA_MASS_MERGE_CONFIRM_TABLE_COL_RESULT_CONTINUE") : that.getText("IDEA_MASS_MERGE_CONFIRM_TABLE_COL_RESULT_STOP"),
                isLeading: oIdea.ID === iLeadingIdeaId
            };
        }));
        
        var oNavCon = this.byId("massIdeaMergeNavCon");
        oNavCon.to(this.byId("massMerge03"));
        
        oMergeModel.setProperty("/pageview", "massMerge03");
    };
    
    MergeActionMixin.handleMassIdeaMergeCancel = function() {
        this._getIdeaMassMergeDialog().close();
    };
    
    MergeActionMixin.handleEscapePress = function(oPromise) {
        oPromise.reject();
    };
    
    MergeActionMixin.formatIsLeadingIdea = function(iIdeaID, iLeadingIdeaID) {
        return iIdeaID !== parseInt(iLeadingIdeaID, 10);
    };
    
    MergeActionMixin.formatSelectedState = function(iIdeaID, iLeadingIdeaID, aSelectedIdeas) {
        return iIdeaID !== parseInt(iLeadingIdeaID, 10) && aSelectedIdeas.indexOf(iIdeaID) !== -1;
    };
    
    MergeActionMixin.formatCheckboxTooltip = function(iIdeaID, iLeadingIdeaID, aSelectedIdeas) {
        if (!MergeActionMixin.formatIsLeadingIdea(iIdeaID, iLeadingIdeaID)) {
            return "";
        }
        var bChecked = MergeActionMixin.formatSelectedState(iIdeaID, iLeadingIdeaID, aSelectedIdeas);
        return bChecked ? this.getText("IDEA_MASS_MERGE_SOURCE_IDEA_DESELECTED") : this.getText("IDEA_MASS_MERGE_SOURCE_IDEA_SELECTED");
    };

    MergeActionMixin.formatMergeEnable = function(bMergeRuleEnable, bMergeable, sLeadingIdeaId, aSelectedIdeas) {
        if (!bMergeRuleEnable) {
            return parseInt(sLeadingIdeaId, 10) !== -1 && aSelectedIdeas.length > 0;
        } else {
            return bMergeable;
        }
    };
    
    MergeActionMixin.formatVoteMergeAbleMsgDisplay = function(sPageView, aSelectedIdeas, iLeadingIdeaId, aAllIdeas) {
        if (sPageView !== 'massMerge03') {
            return false;
        }
        if (aSelectedIdeas.length > 1) {
            // show vote disable merge message
            return true;
        }
        var aMergedIdeaIds = [aSelectedIdeas[0], parseInt(iLeadingIdeaId, 10)];
        // get source idea vote type
        var aMergedIdeas = aAllIdeas.filter(function(oIdea) {
            if (aMergedIdeaIds.indexOf(oIdea.ID) > -1) {
                return true;
            }
            return false;
        });
        return aMergedIdeas[0].VOTE_TYPE_TYPE_CODE !== aMergedIdeas[1].VOTE_TYPE_TYPE_CODE;
    };
    
    MergeActionMixin._computeVoteRule = function(oSysRuleData, oMergeData) {
        var aNotLikeVoteIdea = oMergeData.selectedIdeas.filter(function(oIdea) {
            return oIdea.VOTE_TYPE_TYPE_CODE !== "LIKE";
        });
        var oVoteRule;
        if (aNotLikeVoteIdea.length > 0) {
            oVoteRule = oSysRuleData.filter(function(oRule) {
                return oRule.OBJECT_TYPE_CODE === "VOTE";
            })[0];
            oVoteRule.ADD = false;
            oVoteRule.IGNORE = true;
            oVoteRule.PROMPT = false;
        }
    };
    
    MergeActionMixin._handleRuleChange = function(oEvent) {
        var aRuleData = oEvent.getSource().getData();
        // check all rule valid
        var aNoChoosed = aRuleData.filter(function(oRule) {
            if (!oRule.ADD && !oRule.IGNORE) {
                return true;
            } else {
                return false;
            }
        });
        if (aNoChoosed.length === 0) {
            this._getIdeaMassMergeDialog().getModel('merge').setProperty('/mergeable', true);
        }
    };
    
    MergeActionMixin.handleMassMergeExecute = function() {
        
        var oDialog = this._getIdeaMassMergeDialog();
        oDialog.setBusy(true);
        var oMergeModel = oDialog.getModel("merge");
        var iLeadingIdeaId = parseInt(oMergeModel.getProperty("/leadingIdeaId"), 10);
        var aMergeIdeaIds = oMergeModel.getProperty("/selectedIdeas");
        var aMergeRuleData = oMergeModel.getProperty("/mergeRuleEnable") ? oDialog.getModel("rule").getData() : [];
        
        var oActionRequest = Idea.mergeIdeas(iLeadingIdeaId, {
            SOURCE_IDEAS: aMergeIdeaIds,
            MERGE_RULE: aMergeRuleData
        });
        var that = this;
        oActionRequest.done(function(){
            oDialog.setBusy(false);
            oDialog.close();
            // notify ModelSynchronizer about updated ideas
            aMergeIdeaIds.forEach(function(iIdeaId) {
                ModelSynchronizer.update(null, "mergeIdeas", Idea, iIdeaId);
            });
            if (typeof that.bindList === "function") {
                that.bindList();
            }
            // close dialog and clean up
            //that._disposeIdeaMergeDialog();
            MessageToast.show(that.getText("MSG_IDEA_MERGE_SUCCESS"));
        });
        //show message when the ideamerge operation is not sucessfull
        oActionRequest.fail(function(oResponse) {
            var aMessages = oResponse.MESSAGES;
            
            jQuery.each(aMessages, function(iIdx, oMessage) {
                var sText;
                if (oMessage.MESSAGE_TEXT) {
                    sText = oMessage.MESSAGE_TEXT;
                } else {
                    sText = that.getText(oMessage.MESSAGE, oMessage.REF_ID);
                }
                MessageToast.show(sText);
            });
        });
    };
    
    return MergeActionMixin;
});