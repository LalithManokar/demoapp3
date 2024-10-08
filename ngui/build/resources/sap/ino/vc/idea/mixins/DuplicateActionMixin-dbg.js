sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/models/object/Idea",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/CheckBox"
], function(Filter,
            FilterOperator,
            Idea,
            JSONModel,
            MessageToast,
            PropertyModel,
            CheckBox) {
    "use strict";
    
    /**
     * @class
     * Mixin that handles mass actions in "manage ideas" list view
     */
    var DuplicateActionMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    DuplicateActionMixin._getMarkDuplicateFromClipboardDialog = function() {
        if (!this._oAddMarkDuplicateFromClipboardDialog) {
			this._oAddMarkDuplicateFromClipboardDialog = this.createFragment("sap.ino.vc.idea.fragments.AddDuplicateIdeaFromClipboard");
			this.getView().addDependent(this._oAddMarkDuplicateFromClipboardDialog);
			this._sResizeDuplicateDialog = this.attachListControlResized(this.byId("AddDuplicateIdeaList"));
		}
		return this._oAddMarkDuplicateFromClipboardDialog;
    };
    
    DuplicateActionMixin.onAfterClose = function() {
        var oDialog = this._getMarkDuplicateFromClipboardDialog();
        this.detachListControlResized(this._sResizeDuplicateDialog);
        this.getView().removeDependent(oDialog);
        oDialog.destroy();
        this._oAddMarkDuplicateFromClipboardDialog = undefined;
        this.getModel("duplicate").destroy();
    };
    
    DuplicateActionMixin.getDuplicateItemTemplate = function () {
        // prepare FlatListItem template by adding checkbox
        if (!this._oIdeaDupClipboardListItemTemplate) {
            this._oIdeaDupClipboardListItemTemplate = this.createFragment("sap.ino.vc.idea.fragments.FlatListItem", this.getView().getId() + "--duplicate");
            // as this is a template, we need to get the idea via Fragment's byId
            var oActionBox = sap.ui.core.Fragment.byId(this.getView().getId() + "--duplicate", "flatListIdeaActions");
            var oCheckBox = new CheckBox({
                selected: {
                    parts: [{path: "data>ID"}, {path: "duplicate>/selectedDupIdeas"}], formatter: this.isClipboardIdeaSelected
                }, 
                select: this.onAddFromClipboardIdeaSelected.bind(this)});
            oActionBox.addItem(oCheckBox);
        }
        return this._oIdeaDupClipboardListItemTemplate; 
        //return this.getFragment("sap.ino.vc.idea.fragments.AddDuplicateIdeaFromClipboardListItem");
    };
    
    //Open Dialog
    DuplicateActionMixin.onMarkDuplicateFromClipboard = function() {
        // Dialog must be created first, as _bindFromClipboard will try to access the list by Id
        var oDialog = this._getMarkDuplicateFromClipboardDialog();
        // create model
        var oDupModel = new JSONModel();
        // initially, no ideas are selected
        oDupModel.setProperty("/selectedDupIdeas", []);
        this.getView().setModel(oDupModel, "duplicate");
	    this._bindFromClipboard();
	    oDialog.open();
    };
    
    //Cancel
    DuplicateActionMixin.onAddFromClipboardDialogCancel = function(oEvent) {
        this._getMarkDuplicateFromClipboardDialog().close();
	};
	
	//OK
	DuplicateActionMixin.onAddFromClipboardDialogOK = function(oEvent) {
	    var aSelectedIdeas = this.getModel("duplicate").getProperty("/selectedDupIdeas");
	    if (aSelectedIdeas && aSelectedIdeas.length > 0) {
	        var that = this;
    		var oView = this.getView();
            oView.setBusy(true);
            var iIdeaId = that.getObjectModel().getProperty("/ID");
            var aMarkAsDuplicatePromises = aSelectedIdeas.map(function(oIdea) {
                return Idea.markAsDuplicate(oIdea.id, [iIdeaId]);
    		});
    		jQuery.when.apply(jQuery, aMarkAsDuplicatePromises).always(function() {
                oView.setBusy(false);
                that._getMarkDuplicateFromClipboardDialog().close();
            }).done(function(){
    		    that.rebindRelatedItemsList();
            }).fail(function(){
                MessageToast.show(that.getText("IDEA_RELATED_TIT_MARK_AS_DUPLICATE_FAILED"));
            });
	    }
	};
	
	//Select All
	DuplicateActionMixin.onAddFromClipboardDialogSelectAll = function(oEvent) {
		var aSelectedIdeas = [];
		var oList = this.byId("AddDuplicateIdeaList");
		var aListItem = oList.getAggregation("items") || [];
		jQuery.each(aListItem, function(i, oListItem) {
			aSelectedIdeas.push({id: oListItem.getBindingContext("data").getProperty("ID")});
		});
		this.getModel("duplicate").setProperty("/selectedDupIdeas", aSelectedIdeas); // refresh bindings
	};
    
    //Bind Ideas
    DuplicateActionMixin._bindFromClipboard = function() {
		var oList = this.byId("AddDuplicateIdeaList");
		var aClipboardIdeaIds = this._getClipboardModel().getObjectKeys(Idea);
		var iIdeaId = this.getObjectModel().getProperty("/ID");
		// remove current idea from list
		aClipboardIdeaIds = aClipboardIdeaIds.filter(function (iId) { return iId !== iIdeaId; });
		var that = this;
		if (aClipboardIdeaIds.length > 0) {
	        var aMarkAsDuplicatePromises = aClipboardIdeaIds.map(function(iClipboardIdeaId){
	            var oPropertyModel = new PropertyModel(
                    "sap.ino.xs.object.idea.Idea",
                    iClipboardIdeaId,
                    {actions : [{"markAsDuplicate": [iIdeaId]}, {"unmarkAsDuplicate": [iIdeaId]}]},
                    false);
                return oPropertyModel.getDataInitializedPromise();
	        });
	        var aUpdateableIdeaIds = [];
	        jQuery.when.apply(jQuery, aMarkAsDuplicatePromises).done(function() {
	            jQuery.each(arguments, function(iIndex, oData){
	                if (oData && oData.actions && oData.actions.markAsDuplicate.enabled) {
	                    aUpdateableIdeaIds.push(aClipboardIdeaIds[iIndex]);
	                }
	            });
	            aClipboardIdeaIds = jQuery.grep(aClipboardIdeaIds, function(iClipboardIdeaId) {
            		return aUpdateableIdeaIds.indexOf(iClipboardIdeaId) > -1;
            	});
				var oFilter = that._getClipboardItemsFilter(aClipboardIdeaIds);
				if (oFilter.length > 0) {
					oList.bindAggregation("items", {
        				path: "data>/IdeaMedium",
        				template: that.getDuplicateItemTemplate(),
        				filters: oFilter
    			    });
				} else {
				 	oList.unbindAggregation("items");
				}
	        });
		} else {
			oList.unbindAggregation("items");
		}
	};
	
	//Filter Ideas exclude dupicated and leading idea
	DuplicateActionMixin._getClipboardItemsFilter = function(aClipboardItems) {
		var aFilter = [];
		jQuery.each(aClipboardItems, function(i, iIdeaId) {
			aFilter.push(new Filter({
				path: "ID",
				operator: FilterOperator.EQ,
				value1: iIdeaId
		    }));
		});
		
		return (aFilter.length === 0) ? [] : [new Filter(aFilter, false)];
	};
    
    DuplicateActionMixin.isClipboardIdeaSelected = function(iIdeaid) {
        var aSelectedIdeas = this.getModel("duplicate").getProperty("/selectedDupIdeas");
        if(!aSelectedIdeas){
            return false;
        }
        var aMatchedIdeas = jQuery.grep(aSelectedIdeas, function(oIdea) {
			return oIdea.id === iIdeaid;
		});
		
	    return aMatchedIdeas.length > 0;
    };
    
    DuplicateActionMixin.onAddFromClipboardIdeaSelected = function(oEvent) {
		var oSource = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");
		var iIdeaId = oSource.getBindingContext("data").getProperty("ID");
		var aSelectedIdeas = this.getModel("duplicate").getProperty("/selectedDupIdeas").slice(0);
		var aMatchedIdeas = jQuery.grep(aSelectedIdeas, function(oIdea) {
			return oIdea.id === iIdeaId;
		});
		if (bSelected && aMatchedIdeas.length === 0) {
			aSelectedIdeas.push({id: iIdeaId});
		} else if (!bSelected && aMatchedIdeas.length !== 0) {
			// remove expert from array
			aSelectedIdeas = jQuery.grep(aSelectedIdeas, function(oIdea) {
				return oIdea.id !== iIdeaId;
			});
		}
		this.getModel("duplicate").setProperty("/selectedDupIdeas", aSelectedIdeas);
	};
	
	/**
     * Event handler: Opens Assignment Action sheet with assignment options and prepare the internal private model
     * 
     * @param {Event} oEvent the event
     **/
    DuplicateActionMixin.onDuplicate = function(oEvent) {
        var that = this;
        var oSource = oEvent.getSource();
        var iDuplicateIdeaId = oEvent.getSource() && 
                               oEvent.getSource().getBindingContext("data") && 
                               oEvent.getSource().getBindingContext("data").getProperty("ID");
        var iIdeaId = this.getObjectModel().getProperty("/ID");
        var oPropertyModel = new PropertyModel(
            "sap.ino.xs.object.idea.Idea",
            iDuplicateIdeaId,
            {actions : [{"markAsDuplicate": [iIdeaId]}, {"unmarkAsDuplicate": [iIdeaId]}]},
            false);
        oPropertyModel.getDataInitializedPromise().done(function(oData){
            if (oData && oData.actions && oData.actions.markAsDuplicate && oData.actions.unmarkAsDuplicate) {
                that.setModel(new JSONModel(oData), "duplicate");
                that.getModel("duplicate").setProperty("/duplicateIdeaId", iDuplicateIdeaId);
                that._openDuplicateActionSheet(oSource);
            }
        });
    };
    
    DuplicateActionMixin._openDuplicateActionSheet = function (oSource) {
        if (!this._oDuplicateActionSheet) {
            this._oDuplicateActionSheet = this.createFragment("sap.ino.vc.idea.fragments.DuplicateActionSheet", this.getView().getId());
            this.getView().addDependent(this._oDuplicateActionSheet);
        }
		jQuery.sap.delayedCall(0, this, function () {
			this._oDuplicateActionSheet.openBy(oSource);
		});
    };
    
    DuplicateActionMixin.onUnmarkAsDuplicate = function () {
        this.onMark(Idea.unmarkAsDuplicate, this.getText("IDEA_RELATED_TIT_UNMARK_AS_DUPLICATE_FAILED"));
    };
    
    DuplicateActionMixin.onMarkAsDuplicate = function () {
        this.onMark(Idea.markAsDuplicate, this.getText("IDEA_RELATED_TIT_MARK_AS_DUPLICATE_FAILED"));
    };
    
    DuplicateActionMixin.onMark = function (fnMark, sToastMessage) {
        var iIdeaId = this.getObjectModel().getProperty("/ID");
        var iDuplicateIdeaId = this.getModel("duplicate") && this.getModel("duplicate").getProperty("/duplicateIdeaId");
        var that = this;
        if(iDuplicateIdeaId) {
            fnMark(iDuplicateIdeaId, [iIdeaId]).done(function(){
    		    that.rebindRelatedItemsList();
            }).fail(function(){
                MessageToast.show(sToastMessage);
            });
        }
    };
    
    DuplicateActionMixin.rebindRelatedItemsList = function() {
        var oList = this.byId("idealist-related");
        oList.bindItems(oList.getBindingInfo("items"));
    };
    
    return DuplicateActionMixin;
});