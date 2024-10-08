sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseController",
    "sap/ui/core/format/DateFormat",
    "sap/ino/commons/models/object/FollowUp",
    "sap/ino/vc/idea/mixins/FollowUpFormatter",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/commons/models/types/FollowUpRelativeDateType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageBox",
    "sap/ui/core/Locale"
], function(BaseActionMixin,
            BaseController,
            DateFormat,
            FollowUp,
            FollowUpFormatter,
            BaseFormatter,
            FollowUpRelativeDateType,
            JSONModel,
            MessageToast,
            Configuration,
            MessageBox,
            Locale) {
    "use strict";
    
    var _oFollowUpMixinDateFormatter;
    var fnGetFollowUpMixinDateFormatter = function(that) {
        if (!_oFollowUpMixinDateFormatter) {
            if (that.getOwnerComponent) {
                _oFollowUpMixinDateFormatter = DateFormat.getDateInstance({pattern: "YYYY-MM-dd"}, new Locale(that.getOwnerComponent().getModel("user").getProperty("/data/LOCALE")));
            }
            else {
                // currently no locale available
                return DateFormat.getDateInstance({pattern: "YYYY-MM-dd"});
            }
        }
        
        return _oFollowUpMixinDateFormatter;
    };

    /**
     * Mixin that handles follow up date for the idea
     * 
     * @mixin
     */
    var FollowUpMixin = jQuery.extend({}, BaseActionMixin);
    
    FollowUpMixin.followUpRelativeDateType = new FollowUpRelativeDateType();
    
    FollowUpMixin.followUpMixinFormatter = FollowUpFormatter;
    
    FollowUpMixin.getFollowUpMixinFollowUpDialog = function() {
        if (!this._oFollowUpMixinFollowUpDialog) {
            this._oFollowUpMixinFollowUpDialog = this.createFragment("sap.ino.vc.idea.fragments.FollowUp", this.getView().getId());
            this.getView().addDependent(this._oFollowUpMixinFollowUpDialog);
            this._oFollowUpMixinFollowUpDialog.setInitialFocus(this.createId("relativeDate"));
        }
        return this._oFollowUpMixinFollowUpDialog;
    };
        
    FollowUpMixin.onFollowUpMixinFollowUp = function(oEvent) {
        var oIdea, iIdeaID, iFollowUpID, dFollowUpDate;
        
        if (this.isActionContextSingleIdeaDisplay()) {
            this.resetClientMessages();
            
            oIdea = this.getObjectModel();
            iIdeaID = oIdea.getProperty("/ID");
            iFollowUpID = oIdea.getProperty("/FOLLOW_UP_ID");
            dFollowUpDate = oIdea.getProperty("/FOLLOW_UP_DATE");
        } else {
            oIdea = oEvent.getSource().getBindingContext("data");
            iIdeaID = oIdea.getProperty("ID");
            iFollowUpID = oIdea.getProperty("FOLLOW_UP_ID");
            dFollowUpDate = oIdea.getProperty("FOLLOW_UP_DATE");
        }
        var oDialog = this.getFollowUpMixinFollowUpDialog();
        oDialog.data("context", "single");
        oDialog.setModel(new JSONModel({
            "ID": iIdeaID,
            "FOLLOW_UP_ID": iFollowUpID,
            "FOLLOW_UP_DATE": dFollowUpDate,
            "FOLLOW_UP_RELATIVE_DATES": FollowUp.relativeDates
        }), "followUp");
        
        oDialog.open();
    };
    
    FollowUpMixin.onMassFollowUp = function(oEvent) {
        // if it's a select all mass action
	    if (this.getViewProperty("/List/SELECT_ALL")) {
	        var oBindingParams = this.getBindingParameter();
    		var bIsManaged = this._check4ManagingList();
    		var sFilterParams = this.getList().getBinding('items').sFilterParams;
    		var aTags = this.getViewProperty("/List/TAGS");
		    var tagGroup = {};
            var tagGroupKey = [];
            aTags.forEach(function(item,index){
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
        			        if (oData.FOLLOW_UP_DATE) {
        			            oData.FOLLOW_UP_DATE = new Date(oData.FOLLOW_UP_DATE);
        			        }
        			        that._oSelectionMap[oData.ID] = oData;
    			        }
    			    });
    			    // call general assign action
	                that.onFollowUpMixinMassFollowUp();
    			},
    			error: function(res) {
    			    MessageToast.show(that.getText(res.responseJSON.messageKey));
    			}
    		});
	    } else {
	        // general assign action
	        this.onFollowUpMixinMassFollowUp();
	    }
    };
    
    FollowUpMixin.onFollowUpMixinMassFollowUp = function () {
        var aIdeaIDs = jQuery.map(this._oSelectionMap, function (oIdea) {
            return oIdea.ID;
        });
        var dFirstFollowUpDate = jQuery.map(this._oSelectionMap, function (oIdea) {
            return oIdea.FOLLOW_UP_DATE;
        }).reduce(
            // IE-compatible version of Array.prototype.find
            function (vPrevValue, vCurrValue) {
            if (vPrevValue) {
                return vPrevValue;
            } else {
                return vCurrValue;
            } 
        }, null);
        var oDialog = this.getFollowUpMixinFollowUpDialog();
        oDialog.data("context", "mass");
        oDialog.setModel(new JSONModel({
            "IDS": aIdeaIDs,
            "ID": null,
            "FOLLOW_UP_ID": -1,
            "FOLLOW_UP_DATE": dFirstFollowUpDate,
            "FOLLOW_UP_RELATIVE_DATES": FollowUp.relativeDates
        }), "followUp");
        oDialog.open();
    };
    
    FollowUpMixin.onFollowUpMixinFollowUpDialogOK = function(oEvent) {
        var that = this;
        var oDialog = this.getFollowUpMixinFollowUpDialog();
        oDialog.setBusy(true);
        var oFollowUp = oDialog.getModel("followUp");
        var sDate = oFollowUp.getProperty("/FOLLOW_UP_DATE") && fnGetFollowUpMixinDateFormatter(this).format(oFollowUp.getProperty("/FOLLOW_UP_DATE"));
        if (oDialog.data("context") === "mass") {
            // mass action handling
            var oOptions = {
                parameters: {
                    ideaIds: oFollowUp.getProperty("/IDS"),
                    date: sDate
                },
                messages: {
                    success: function() {
                        oDialog.close();
                        return that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_SUCCESS");
                    },
                    error: function() {
                        return that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_FAILED");
                    }
                }
            };
            var oMassRequest = BaseController.prototype.executeObjectAction.call(this, FollowUp, "massModify", oOptions);
            oMassRequest.always(function() {
                oDialog.setBusy(false);
            });
        } else {
            //var oIdea = this.getObjectModel();
            if (sDate) {
                var oModifyRequest = FollowUp.modify(oFollowUp.getProperty("/FOLLOW_UP_ID") || -1, {
                    DATE: sDate,
                    OBJECT_ID: oFollowUp.getProperty("/ID"),
                    OBJECT_TYPE_CODE: "IDEA"
                });
                oModifyRequest.done(function(){
                    oDialog.close();
                    MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_SUCCESS"));
                });
                oModifyRequest.fail(function(){
                    MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_FAILED"));
                });
                oModifyRequest.always(function() {
                    oDialog.setBusy(false);
                });
            } else {
                if (oFollowUp.getProperty("/FOLLOW_UP_ID")) {
                    var oDeleteRequest = FollowUp.del(oFollowUp.getProperty("/FOLLOW_UP_ID"), {OBJECT_ID: oFollowUp.getProperty("/ID")});
                    oDeleteRequest.done(function(){
                        oDialog.setModel(undefined, "followUp");
                        oDialog.close();
                        MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_DEL_SUCCESS"));
                    });
                    oDeleteRequest.fail(function(){
                        MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_DEL_FAILED"));
                    });
                    oDeleteRequest.always(function() {
                        oDialog.setBusy(false);
                    });
                } else {
                    oDialog.setBusy(false);
                }
            }
        }
    };
        
    FollowUpMixin.onFollowUpMixinFollowUpDialogDelete = function(oEvent) {
        var that = this;
        var oDialog = this.getFollowUpMixinFollowUpDialog();
        oDialog.setBusy(true);
        var oFollowUp = oDialog.getModel("followUp");
        var sFollowUpId = oFollowUp && oFollowUp.getProperty("/FOLLOW_UP_ID");
        if (oDialog.data("context") === "mass") {
            // mass action handling
            var oOptions = {
                parameters: {
                    ideaIds: oFollowUp.getProperty("/IDS"),
                    date: null
                },
                messages: {
                    success: function() {
                        oDialog.close();
                        return that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_SUCCESS");
                    },
                    error: function() {
                        return that.getText("OBJECT_MSG_FOLLOW_UP_SAVE_FAILED");
                    }
                }
            };
            var oMassRequest = BaseController.prototype.executeObjectAction.call(this, FollowUp, "massModify", oOptions);
            oMassRequest.always(function() {
                oDialog.setBusy(false);
            });
        } else {
            if (sFollowUpId) {
                var oDeleteRequest = FollowUp.del(sFollowUpId, {OBJECT_ID: oFollowUp.getProperty("/ID")});
                oDeleteRequest.done(function(){
                    oDialog.close();
                    MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_DEL_SUCCESS"));
                });
                oDeleteRequest.fail(function(){
                    MessageToast.show(that.getText("OBJECT_MSG_FOLLOW_UP_DEL_FAILED"));
                });
                oDeleteRequest.always(function() {
                    oDialog.setBusy(false);
                });
            } else {
                oDialog.setBusy(false);
                oDialog.close();
            }
        }
    };

    FollowUpMixin.onFollowUpMixinFollowUpDialogCancel = function() {
        var oDialog = this.getFollowUpMixinFollowUpDialog();
        if (this.isActionContextSingleIdeaDisplay()) {
            this.resetInputTypeValidations(oDialog);
        }
        oDialog.close();
    };

    /**
     * event after dialog close; cleans up the error messages, mass action status and the dialog
     */ 
    FollowUpMixin.onFollowUpMixinFollowUpAfterClose = function(oEvent) {
        var oDialog = oEvent.getSource();
        //this.resetActionState(oDialog.data("context") === "mass");
        oDialog.destroy();
        this._oFollowUpMixinFollowUpDialog = undefined;
    };

    return FollowUpMixin;
});

