sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/m/MessageToast",
    "sap/ino/vc/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ino/commons/models/object/User",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/models/object/Idea"
], function(BaseActionMixin, MessageToast, BaseController, MessageBox, User, Filter, FilterOperator, Idea) {
    "use strict";

	var AddExpertFromClipboardMixin = jQuery.extend({}, BaseActionMixin);

    AddExpertFromClipboardMixin.onAddFromClipboard = function() {
		var oDialog = this.getAddFromClipboardDialog();
		oDialog.open();
		this._bindFromClipboard();
	};

	AddExpertFromClipboardMixin._bindFromClipboard = function() {
		var oList = this.byId("AddExpertList");
		var oTemplate = this._getClipboardListItem();
		var aExpertId = this._getClipboardExpertIds();
		if (aExpertId.length > 0) {
			var oFilter = this._getClipboardItemsFilter(aExpertId);
			// we cannot do the aggregation binding declaratively in XML view, due to data-dependent ODATA filter
			oList.bindAggregation("items", {
				path: "data>/SearchIdentity(searchToken='*')/Results",
				template: oTemplate,
				filters: oFilter,
				parameters: {
					select: "ID,NAME,ORGANIZATION,IMAGE_ID"
				}
			});
		} else {
			oList.unbindAggregation("items");
		}
		this.aSelectedExperts = [];
		this.getModel("view").setProperty("/CLIPBOARD_ITEM_SELECT_COUNTER", this.view.CLIPBOARD_ITEM_SELECT_COUNTER + 1); // refresh bindings
	};

	AddExpertFromClipboardMixin._getClipboardListItem = function() {
		if (!this._oClipboardListItem) {
			this._oClipboardListItem = this.createFragment("sap.ino.vc.idea.fragments.AddExpertFromClipboardListItem");
		}
		return this._oClipboardListItem;
	};

	AddExpertFromClipboardMixin._getClipboardExpertIds = function() {
		var oClipboardModel = this._getClipboardModel();
		return oClipboardModel.getObjectKeys(User);
	};

	AddExpertFromClipboardMixin._getClipboardItemsFilter = function(aClipboardItems) {
		var aFilter = [];
		jQuery.each(aClipboardItems, function(i, iExpertId) {
			var oFilter = new Filter({
				path: "ID",
				operator: FilterOperator.EQ,
				value1: iExpertId
			});
			aFilter.push(oFilter);
		});
		return (aFilter.length === 0) ? [] : [new Filter(aFilter, false)];
	};

	AddExpertFromClipboardMixin.getAddFromClipboardDialog = function() {
		if (!this._oAddFromClipboardDialog) {
			this._oAddFromClipboardDialog = this.createFragment("sap.ino.vc.idea.fragments.AddExpertFromClipboard");
			this.getView().addDependent(this._oAddFromClipboardDialog);
		}
		return this._oAddFromClipboardDialog;
	};

	AddExpertFromClipboardMixin.onAddFromClipboardDialogSelectAll = function() {
		var that = this;
		this.aSelectedExperts = [];
		var oList = this.byId("AddExpertList");
		var aListItem = oList.getAggregation("items") || [];
		jQuery.each(aListItem, function(i, oListItem) {
			var oExpert = {
				id: oListItem.getBindingContext("data").getProperty("ID"),
				name: oListItem.getBindingContext("data").getProperty("NAME")
			};
			that.aSelectedExperts.push(oExpert);
		});
		this.getModel("view").setProperty("/CLIPBOARD_ITEM_SELECT_COUNTER", this.getModel("view").getProperty("/CLIPBOARD_ITEM_SELECT_COUNTER") + 1); // refresh bindings
	};

	AddExpertFromClipboardMixin.onAddFromClipboardItemSelected = function(oEvent) {
		var oCheckbox = oEvent.getSource();
		var bSelected = oCheckbox.getSelected();
		var iExpertId = oCheckbox.data("id");
		var aMatchedExperts = jQuery.grep(this.aSelectedExperts, function(oExpert) {
			return oExpert.id === iExpertId;
		});
		if (bSelected && aMatchedExperts.length === 0) {
			var oExpert = {
				id: iExpertId,
				name: oCheckbox.data("name")
			};
			this.aSelectedExperts.push(oExpert);
		} else if (!bSelected && aMatchedExperts.length !== 0) {
			// remove expert from array
			this.aSelectedExperts = jQuery.grep(this.aSelectedExperts, function(oExpert) {
				return oExpert.id !== iExpertId;
			});
		}
	};

	AddExpertFromClipboardMixin.isClipboardItemEnabled = function(iExpertId, iCounter) {
	    var aIdeaExperts = this.isActionContextSingleIdeaDisplay() || this.getViewProperty("/IS_EVALUATION_REQUEST") ? this.getObjectModel().getProperty("/Experts") : [];
		return jQuery.grep(aIdeaExperts, function(o) {
			return o.IDENTITY_ID === iExpertId;
		}).length === 0;
	};

	AddExpertFromClipboardMixin.isClipboardItemSelected = function(iExpertId, iCounter) {
	    var aIdeaExperts = this.isActionContextSingleIdeaDisplay() || this.getViewProperty("/IS_EVALUATION_REQUEST") ? this.getObjectModel().getProperty("/Experts") : [];
		var aExistingExperts = jQuery.grep(aIdeaExperts, function(o) {
			return o.IDENTITY_ID === iExpertId;
		});
		if (aExistingExperts.length > 0) {
			return false;
		}
		var aMatchedExperts = jQuery.grep(this.aSelectedExperts, function(oExpert) {
			return oExpert.id === iExpertId;
		});
		return aMatchedExperts.length > 0;
	};

	AddExpertFromClipboardMixin.onAddFromClipboardDialogCancel = function() {
		var oDialog = this.getAddFromClipboardDialog();
		oDialog.close();
	};

	AddExpertFromClipboardMixin.onAddFromClipboardDialogOK = function() {
		var that = this;
		var aExpert = [];
	    jQuery.each(this.aSelectedExperts, function(i, oExpert) {
	        if(that.getViewProperty("/IS_EVALUATION_REQUEST")){
	            aExpert.push({
    	            IDENTITY_ID: oExpert.id,
    	            NAME: oExpert.name
    	        }); 
	        } else {
	            aExpert.push({
    	            IDENTITY_ID: oExpert.id
    	        });    
	        }
		});
		if (aExpert.length > 0) {
	    	that._addExpert(aExpert);
		}
		var oDialog = this.getAddFromClipboardDialog();
		oDialog.close();
		if(this._oAssignExpertDialog){
    		oDialog = this._oAssignExpertDialog;
    		oDialog._dialog.close();
    		oDialog.destroy();
    		this._oAssignExpertDialog = undefined;
    		this.resetActionState(oDialog.data("context") === "mass");
    		this.restoreFocusAfterActionDialogClose();
		}
	};
	
	AddExpertFromClipboardMixin._addExpert = function(aExpert, sExpertName) {
		var that = this;
		var oModel = this.isActionContextSingleIdeaDisplay() || this.getViewProperty("/IS_EVALUATION_REQUEST") ? this.getObjectModel() : Idea;
		if (this.getViewProperty("/IS_EVALUATION_REQUEST")) {
		    if(Array.isArray(aExpert) && aExpert.length){
    		    jQuery.each(aExpert, function(i, oExpert) {
        			oModel.addExpert(oExpert);
        		});
        	}
		} else {
			var vIdeaID, sActionName;
		    if(this.isActionContextSingleIdeaDisplay()){
		        vIdeaID = this.getObjectModel().getKey();
		    } else {
		        if(this.getModel("assignment") && this.getModel("assignment").getProperty("/IDS")){
		            vIdeaID = this.getModel("assignment").getProperty("/IDS");
		        } else if (this.getModel("assignment") && this.getModel("assignment").getProperty("/ID")){
		            vIdeaID = this.getModel("assignment").getProperty("/ID");
		        }
		    }
		    var bIsMassAction = Array.isArray(vIdeaID);
		    var oParameters = {};
		    oParameters.Experts = aExpert;
			var oMessages = {
				success: function() {
					return sExpertName ? that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_SUCCESS", [sExpertName]) : that.getText("IDEA_OBJECT_MSG_EXPERTS_ASSIGNED_SUCCESS");
				},
				error: function() {
					return sExpertName ? that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_ERROR", [sExpertName]) : that.getText("IDEA_OBJECT_MSG_EXPERTS_ASSIGNED_ERROR");
				}
			};
		    var oOptions = {
    			parameters: oParameters,
    			messages: oMessages,
    			staticparameters: this.isActionContextSingleIdeaDisplay() || bIsMassAction ? undefined : vIdeaID //undefine: for model instance, vIdeaID: for model static method
    		};
    		if (bIsMassAction) {
    			oOptions.parameters.keys = vIdeaID;
    			sActionName = "massAddExpert";
    		} else {
    		    sActionName = "addExpert";
    		}
			var oActionPromise = BaseController.prototype.executeObjectAction.call(this, oModel, sActionName, oOptions);
			return oActionPromise;
		}
	};

	AddExpertFromClipboardMixin._removeExpert = function(aExpert, sExpertName) {
		var that = this;
		var oModel = this.getObjectModel();

		if (this.getViewProperty("/IS_EVALUATION_REQUEST")) {
			oModel = this.getObjectModel();
			oModel.removeExpert(aExpert[0].IDENTITY_ID);
		} else {
			MessageBox.confirm(this.getText("MSG_DEL_CONFIRM"), {
				onClose: function(sDialogAction) {
					if (sDialogAction !== MessageBox.Action.OK) {
						return;
					} else {
						var oParameters = {};
		                oParameters.Experts = aExpert;
        				var oMessages = {
        					success: function() {
        						return that.getText("IDEA_OBJECT_MSG_EXPERT_UNASSIGNED_SUCCESS", [sExpertName]);
        					},
        					error: function() {
        						return that.getText("IDEA_OBJECT_MSG_EXPERT_UNASSIGNED_ERROR", [sExpertName]);
        					}
        				};
        				var oOptions = {
        					parameters: oParameters,
        					messages: oMessages,
        					staticparameters: undefined
        				};
        				BaseController.prototype.executeObjectAction.call(that, oModel, 'removeExpert', oOptions);
					}
				}
			});
		}
	};
	
	AddExpertFromClipboardMixin.isActionContextSingleIdeaDisplay = function() {
        return !!(this.getObjectModel && 
            this.getObjectModel() &&
            this.getObjectModel().getMetadata && 
            this.getObjectModel().getMetadata().getName() === "sap.ino.commons.models.object.Idea");
    };
    
    return AddExpertFromClipboardMixin;	
});