sap.ui.define(["sap/ino/commons/models/aof/PropertyModel",
               "sap/ino/commons/formatters/ObjectFormatter",
               "sap/ino/controls/OrientationType",
               "sap/ino/commons/models/object/Idea"
               ], 
    function(PropertyModel, ObjectFormatter, OrientationType, Idea) {
    "use strict";

    /**
     * @class
     * This mixin provides common functionality for several ActionMixins on ideas / idea lists. Further it provides mass action handling
     * on select-enabled lists. It is only used as a base "class" (via jQuery.extend) for other action mixins.
     */
    var BaseActionMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    /**
     * returns whether the code in this mixin is called within an idea or within a list of ideas
     * 
     * @returns {boolean} true if context is single idea, false if context is idea lists or campaign home page
     */ 
    BaseActionMixin.isActionContextSingleIdeaDisplay = function() {
        return !!(this.getObjectModel && 
            this.getObjectModel() &&
            this.getObjectModel().getMetadata && 
            this.getObjectModel().getMetadata().getName() === "sap.ino.commons.models.object.Idea");
    };
    
    /**
     * stores the current focussed before opening an action dialog (for accessibility)
     */ 
    BaseActionMixin.saveCurrentFocusBeforeActionDialogOpen = function() {
        this._sActionCurrentFocusId = sap.ui.getCore().getCurrentFocusedControlId();
    };
    
    /**
     * restores the current focussed after an action dialog has been closed
     */ 
    BaseActionMixin.restoreFocusAfterActionDialogClose = function() {
        if (this._sActionCurrentFocusId) {
            var oControl = sap.ui.getCore().getElementById(this._sActionCurrentFocusId);
            if (oControl && oControl.focus) {
                oControl.focus();
            }
            this._sActionCurrentFocusId = undefined;
        }
    };
    
    /**
     * cleans up selection states of ManagedIdeaList items and client message context, if applicable
     * 
     * @param   {boolean}   bIsMassAction   <code>true</code> if the action that was executed was a mass action
     */ 
    BaseActionMixin.resetActionState = function(bIsMassAction) {
        // context is single idea - reset client messages
        if (this.isActionContextSingleIdeaDisplay() && typeof(this.resetClientMessages) === "function") {
            this.resetClientMessages();
        }
        // in any case, the mass actions have to be refreshed / reset.
        if (bIsMassAction) {
            this._refreshMassActionState();
        } else {
            this._resetMassActionState();
        }
    };

    /**
     * @deprecated - move back again
     * convenience event handler for cleaning up after an action dialog has been closed
     */ 
    BaseActionMixin.onAfterActionDialogClose = function(oEvent) {
        // the respective closed dialog is always the source of the event
        var oDialog = oEvent.getSource();
        this.resetActionState(oDialog.data("context") === "mass");
    };

    // ---------------- MASS ACTION HANDLING ------------------------------------------
    
    /**
     * helper function: returns a consolidated aggregation of information of all selected ideas
     * 
     * This is used for deciding whether a specific action is executable or not.
     * 
     * @returns {object}        the aggregated information or <code>null</code> if selection is empty
     */
    BaseActionMixin._computeActionAggregations = function () {
        return jQuery
            .map(this._oSelectionMap, function (oValue) { return oValue; }) // transform to array
            .reduce(function (oLastVal, oIdea) { 
                var isFinalStatus = ObjectFormatter.isFinal(oIdea.STATUS);
                if (oLastVal) {
                    // just Idea IDs
                    oLastVal.ideas.push(oIdea.ID);
                    oLastVal.authors.push(oIdea.SUBMITTER_ID);
                    // we need the union
                    if (oLastVal.campaigns.indexOf(oIdea.CAMPAIGN_ID) === -1) {
                        oLastVal.campaigns.push(oIdea.CAMPAIGN_ID);
                    }
                    if (oLastVal.phases.indexOf(oIdea.PHASE) === -1) {
                        oLastVal.phases.push(oIdea.PHASE);
                    }
                    if (oLastVal.status.indexOf(oIdea.STATUS) === -1) {
                        oLastVal.status.push(oIdea.STATUS);
                    }
                    if(oLastVal.respValueCode.indexOf(oIdea.RESP_VALUE_CODE) === -1)
                    {
                       oLastVal.respValueCode.push(oIdea.RESP_VALUE_CODE);
                    }
                    oLastVal.addExpert.push(oIdea.property.actions.addExpert.enabled); 
                    oLastVal.assignTag.push(oIdea.property.actions.assignTag.enabled);
                    oLastVal.assignCoach.push(oIdea.property.actions.assignCoach.enabled);
                    oLastVal.assignToMe.push(oIdea.property.actions.assignToMe.enabled);
                    oLastVal.unassignCoach.push(oIdea.property.actions.unassignCoach.enabled);
                    oLastVal.executeStatusTransition.push(oIdea.property.actions.executeStatusTransition.enabled);
                    oLastVal.followUp.push(!isFinalStatus);
                    oLastVal.reassignCampaign.push(oIdea.property.actions.reassignCampaign.enabled);
                    // we need intersection
                    var aStatusActionCodes = oIdea.property.actions.executeStatusTransition.customProperties.statusTransitions.map(function (oTrans) { return oTrans.STATUS_ACTION_CODE; });
                    oLastVal.transitions = oLastVal.transitions.filter(function (sCode) { return aStatusActionCodes.indexOf(sCode) !== -1; });
                    
                    oLastVal.changeAuthor = oLastVal.changeAuthor && oLastVal.authors[oLastVal.authors.length - 1] === oLastVal.authors[0];
                    
                    oLastVal.merge.push(oIdea.property.actions.mergeIdeas.enabled);
                    return oLastVal;
                } else {
                    return { 
                        ideas: [oIdea.ID],
                        campaigns: [oIdea.CAMPAIGN_ID],
                        phases: [oIdea.PHASE],
                        status: [oIdea.STATUS],
                        respValueCode:[oIdea.RESP_VALUE_CODE],
                        addExpert: [oIdea.property.actions.addExpert.enabled],
                        assignTag: [oIdea.property.actions.assignTag.enabled],
                        assignCoach: [oIdea.property.actions.assignCoach.enabled], 
                        assignToMe: [oIdea.property.actions.assignToMe.enabled],
                        unassignCoach: [oIdea.property.actions.unassignCoach.enabled],
                        reassignCampaign:[oIdea.property.actions.reassignCampaign.enabled],
                        executeStatusTransition: [oIdea.property.actions.executeStatusTransition.enabled],
                        followUp: [!isFinalStatus],
                        transitions: oIdea.property.actions.executeStatusTransition.customProperties.statusTransitions.map(function (oTrans) { return oTrans.STATUS_ACTION_CODE; }),
                        authors: [oIdea.SUBMITTER_ID],
                        changeAuthor: oIdea.SUBMITTER_ID !== 0,
                        merge: [oIdea.property.actions.mergeIdeas.enabled]
                    };
                }
            }, null);
    };
    
    /**
     * unselect all selected items and cleans up internal selection map
     * 
     * This is called directly after all executed actions
     */ 
    BaseActionMixin._resetMassActionState = function () {
        // empty selections on selected items
        var that = this;
        if (this._oSelectionMap) {
            jQuery.each(this._oSelectionMap, function (vIndex, oIdea) {
                if (oIdea.oSource && oIdea.oSource.setSelected) {
                    oIdea.oSource.setSelected(false);
                }
            });
        }
        // empty internal map of selected ideas
        this._oSelectionMap = {};
        this._oDeselectionMap = {};
        this.setViewProperty("/List/SELECT_ALL", false);
        // reset mass action buttons
        var aButtons = ["sapInoMassAddExpertBtn", "sapInoMassAssignBtn", "sapInoMassStatusBtn", "sapInoMassFollowUpBtn", "sapInoMassDeleteRewardBtn", "sapInoMassDeleteEvalReqBtn",
            "sapInoMassAcceptBtn", "sapInoMassRejectBtn", "sapInoMassFowardBtn", "sapInoMassCreateEvalBtn", "sapInoMassExportBtn", "sapInoMassChangeAuthorBtn", "sapInoMassMergeBtn"];
        jQuery.each(aButtons, function (iIdx, sElementID) {
            var oBtn = that.byId(sElementID);
            if (oBtn) {
                oBtn.setEnabled(false);
            }
            if (sElementID === "sapInoMassExportBtn" && that.getViewProperty("/List/EXPORT_ALL")){
                oBtn.setEnabled(true);
            }
        });
    };
    
    /**
     * sets selected ideas to busy and calls _resetMassActionState afterwards.
     * 
     * This is called as cleanup after mass actions
     */ 
    BaseActionMixin._refreshMassActionState = function () {
        jQuery.each(this._oSelectionMap, function(vIndex, oItem) {
            if (oItem.oSource) {
                // DANGER ZONE - 
                //oItem.oSource.getParent().getParent().getParent().setBusy(true);
            }
        });
        if (this._resetMassActionState) {
            this._resetMassActionState();
        }
    };
    
    BaseActionMixin._deriveMassActionButtonEnabledStatus = function () {
        var oAggregatedVals = this._computeActionAggregations();
        
        var _checkActionIsEnabled = function(bValue) {
            return !!bValue;
        };
        
        // Add Expert is only visible when at least one action can be executed on all selected ideas
        var oBtnAddExpert = this.byId("sapInoMassAddExpertBtn");
        if (oBtnAddExpert) {
            oBtnAddExpert.setEnabled(
                !!oAggregatedVals && (
                    oAggregatedVals.addExpert.every(_checkActionIsEnabled) && oAggregatedVals.campaigns.length === 1
                ));
        }
        
        // Assignment is only visible when at least one action can be executed on all selected ideas
        var oBtnAssign = this.byId("sapInoMassAssignBtn");
        if (oBtnAssign) {
            oBtnAssign.setEnabled(
                !!oAggregatedVals && (
                    oAggregatedVals.assignToMe.every(_checkActionIsEnabled) || 
                    oAggregatedVals.unassignCoach.every(_checkActionIsEnabled) || 
                    oAggregatedVals.assignTag.every(_checkActionIsEnabled) ||
                    (oAggregatedVals.assignCoach.every(_checkActionIsEnabled) && oAggregatedVals.campaigns.length === 1) || 
                    (oAggregatedVals.addExpert.every(_checkActionIsEnabled) && oAggregatedVals.campaigns.length === 1) ||
                    (oAggregatedVals.reassignCampaign.every(_checkActionIsEnabled) && oAggregatedVals.campaigns.length === 1)
                ));
        }
        
        // Status change is only visible when all selected ideas are in the same campaign and have the same status and phase
        var oBtnStatus = this.byId("sapInoMassStatusBtn");
        if (oBtnStatus) {
            oBtnStatus.setEnabled(
                !!oAggregatedVals &&
                oAggregatedVals.campaigns.length === 1 &&
                oAggregatedVals.phases.length === 1 &&
                oAggregatedVals.status.length === 1 &&
                oAggregatedVals.executeStatusTransition.every(_checkActionIsEnabled)
                );
        }
        
        // Follow Up is only visible when at least one idea is selected
        var oBtnFollowUp = this.byId("sapInoMassFollowUpBtn");
        if (oBtnFollowUp) {
            oBtnFollowUp.setEnabled(
                !!oAggregatedVals && 
                oAggregatedVals.ideas.length > 0&&
                oAggregatedVals.followUp.every(_checkActionIsEnabled));
        }
        
        // Export only visible when at least one idea is selected
        var oBtnExport = this.byId("sapInoMassExportBtn");
        if (oBtnExport) {
            oBtnExport.setEnabled(!!oAggregatedVals && oAggregatedVals.ideas.length > 0);
            if(!this.getModel("component").getProperty("/SHOW_BACKOFFICE")){
                oBtnExport.setEnabled(true);
            }
        }
        
        // change author enable when selected idea' author should be same
        var oBtnChangeAuthor = this.byId("sapInoMassChangeAuthorBtn");
        if (oBtnChangeAuthor) {
            oBtnChangeAuthor.setEnabled(!!oAggregatedVals && oAggregatedVals.changeAuthor);
        }
        
        // Merge idea visible when every idea can be merged
        var oBtnMerge = this.byId("sapInoMassMergeBtn");
        if (oBtnMerge) {
            var aClipboardIdeas = this._oClipboardModel ? this._oClipboardModel.getObjectKeys(Idea) : [];
            var iTotalLength = 0;
            if (oAggregatedVals) {
                iTotalLength = oAggregatedVals.ideas.length + aClipboardIdeas.length;
                oBtnMerge.setEnabled(!!oAggregatedVals && 
                    iTotalLength > 1 && iTotalLength <= 10 &&
                    oAggregatedVals.merge.every(_checkActionIsEnabled));
            } else {
                oBtnMerge.setEnabled(aClipboardIdeas.length > 1 && aClipboardIdeas.length <= 10);
            }
        }
    };
    
    /**
     * event handler that's fired on each selection on a ManagedIdeaListItem's checkbox
     * 
     * @param   {Event} oEvent  the event object
     */ 
    BaseActionMixin.onManagedListSelectionChange = function(oEvent) {
        var that = this;
        var bSelected = oEvent.getParameter("selected");
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext("data").getObject();
        function addToSelectionMap(oPropertyEvent) {
            var oPropData = oPropertyEvent.getSource().getData();
            oData.property = oPropData;
            that._oSelectionMap[oData.ID] = oData;
            that._oSelectionMap[oData.ID].oSource = oSource;
            that._deriveMassActionButtonEnabledStatus.call(that);
        }
        
        if (bSelected) {
            var oSettings = { actions : ["addExpert", "assignTag", "assignCoach", "assignToMe", "unassignCoach", "executeStatusTransition","reassignCampaign","mergeIdeas"] };
            // async!
            var oProp = new PropertyModel("sap.ino.xs.object.idea.Idea", oData.ID, oSettings, false, addToSelectionMap);
            if (this.getViewProperty("/List/SELECT_ALL")) {
                delete this._oDeselectionMap[oData.ID];
            }
        } else {
            delete this._oSelectionMap[oData.ID];
            if (this.getViewProperty("/List/SELECT_ALL")) {
                this._oDeselectionMap[oData.ID] = oData.ID;
            }
            this._deriveMassActionButtonEnabledStatus();
        }
        
        oSource.setTooltip(bSelected ? this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP') : this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP'));
    };
    
    BaseActionMixin.onFlatListSelectionChange = function(oEvent) {
        var bSelected = oEvent.getParameter("selected");
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext("data").getObject();
        
        if (bSelected) {
            this._oSelectionMap[oData.ID] = oData;
            this._oSelectionMap[oData.ID].oSource = oSource;
            if (this.getViewProperty("/List/SELECT_ALL")) {
                delete this._oDeselectionMap[oData.ID];
            }
        } else {
            delete this._oSelectionMap[oData.ID];
            if (this.getViewProperty("/List/SELECT_ALL")) {
                this._oDeselectionMap[oData.ID] = oData.ID;
            }
        }
        
        // export button
        var oBtnExport = this.byId("sapInoMassExportBtn");
        if (oBtnExport) {
            oBtnExport.setEnabled(!jQuery.isEmptyObject(this._oSelectionMap));
        }
        
        oSource.setTooltip(bSelected ? this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP') : this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP'));
    };
    
    /**
     * event handler for select all action
     * 
     * @param   {aItems?}       the array object of idea items
     *          {bSelected?}    is selected or not
     * 
     * note: if you pass the {aItems} parameter, you should pass the {bSelected} parameter together.
     */
    BaseActionMixin.onMassIdeaSelect = function(aItems, bSelected, bGrowing) {
        var aIdeaItem = this.getList().getItems();
        if (Object.prototype.toString.call(aItems) === "[object Array]") {
            aIdeaItem = aItems;
            this.setViewProperty("/List/SELECT_ALL", bSelected);
        } else {
            this.setViewProperty("/List/SELECT_ALL", !this.getViewProperty("/List/SELECT_ALL"));
        }

        var that = this;
        var oBtnExport = this.byId("sapInoMassExportBtn");
        if (this.getViewProperty("/List/SELECT_ALL")) {
            // change the text to deselect-all
            oBtnExport.setEnabled(true);
        
            jQuery.each(aIdeaItem, function(iIdx, oItem) {
                // get the layout object
                var aAggs = oItem.findAggregatedObjects(false, function(oObj) {
                    return (oObj instanceof sap.ui.layout.VerticalLayout);
                });
                // get the flexbox outer
                var oBox = aAggs[0].getContent()[0];
                // get the content flexbox inner
                var oBoxInner = oBox.getItems()[oBox.getItems().length - 1];
                // get the check box
                var oCheckbox = oBoxInner.getItems()[oBoxInner.getItems().length - 1].getItems()[0];
                
                var oData = oItem.getBindingContext("data").getObject();
                // if (that.getViewProperty("/List/SELECT_ALL")) {
                    if (that.getViewProperty("/List/MANAGE")) {
                        oData.property = that._createPropertyData(oItem);
                    }
                    that._oSelectionMap[oData.ID] = oData;
                    that._oSelectionMap[oData.ID].oSource = oCheckbox;
                // } else {
                //     delete that._oSelectionMap[oData.ID];
                // }
            });
            
        } else if(!bGrowing){
            that._oSelectionMap = {};
            // oBtnExport.setEnabled(false);
        }
        
        if (this.getViewProperty("/List/MANAGE")) {
            this._deriveMassActionButtonEnabledStatus();    
        }

    };
    
    BaseActionMixin._createPropertyData = function(oIdea) {
        var oPropertyData = {
            actions: {
                addExpert: {},
                assignCoach: {},
                assignTag: {},
                assignToMe: {},
                executeStatusTransition: {
                    customProperties: {
                        statusTransitions: []
                    }
                },
                reassignCampaign: {},
                unassignCoach: {},
                mergeIdeas: {}
            }
        };
        //var sStatus = oIdea.getBindingContext("data").getProperty("STATUS");
        var sStatus;
        if (oIdea.getBindingContext) {
            sStatus = oIdea.getBindingContext("data").getProperty("STATUS");
        } else {
            sStatus = oIdea.STATUS;
        } 
        oPropertyData.actions.addExpert.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.assignCoach.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.assignTag.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.assignToMe.enabled = !ObjectFormatter.isFinal(sStatus);
        //oPropertyData.actions.reassignCampaign.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.unassignCoach.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.executeStatusTransition.enabled = !ObjectFormatter.isFinal(sStatus);
        oPropertyData.actions.mergeIdeas.enabled = !ObjectFormatter.isMerged(sStatus) && !ObjectFormatter.isFinal(sStatus);
        
        return oPropertyData;
    };
    
    BaseActionMixin.formatMergeBtnEnable = function(aClipboardItems) {
        aClipboardItems = aClipboardItems || [];
        var aIdeaItems = aClipboardItems.filter(function(oClipboardItem) {
            return oClipboardItem.name === "sap.ino.commons.models.object.Idea";
        });
        var iTotalLength = 0;
        if (aIdeaItems.length > 0) {
            iTotalLength = aIdeaItems[0].entry.length + Object.keys(this._oSelectionMap || {}).length;
        } else {
            iTotalLength = Object.keys(this._oSelectionMap || {}).length;
        }
        return iTotalLength > 1 && iTotalLength <= 10;
    };
    
    BaseActionMixin.formatIdeaCheckBoxTooltip = function(bSelectAll) {
        return bSelectAll ? this.getText('IDEA_LIST_CHECKBOX_DESELECT_TOOLTIP') : this.getText('IDEA_LIST_CHECKBOX_SELECT_TOOLTIP');
    };

    return BaseActionMixin;
});