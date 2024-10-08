sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/vc/commons/BaseController",
    "sap/ino/vc/evaluation/EvaluationFacet",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/m/GroupHeaderListItem",
    "sap/ino/commons/application/Configuration"     
], function (ApplicationObjectChange,
             BaseController,
             EvaluationFacet,
             EvaluationFormatter,
             GroupHeaderListItem,
             Configuration) {
    "use strict";
    
    var oFormatter = {};
    jQuery.extend(oFormatter, EvaluationFormatter);
    
    // Format the header of the evaluations group
    oFormatter.formatGroupHeader = function(oGroup) {
        return new GroupHeaderListItem({
            title: oFormatter.ideaPhase(oGroup.ideaPhaseCode),
            upperCase: false
        });
    };

    return BaseController.extend("sap.ino.vc.idea.Evaluations", {
        
        formatter: oFormatter,
        
        // Use group order as key and map group order to phase code
        // in order to format the group header later on
        grouper: function(oContext){
            return {
                key: oContext.getProperty("GROUP_ORDER"),
                ideaPhaseCode: oContext.getProperty("IDEA_PHASE_CODE")
            };
        },
        
        onInit: function(){
            var aEvalListIds = ["evaluationList", "myEvaluationList", "pubEvaluationList"];
            var that = this;
            BaseController.prototype.onInit.apply(this, arguments);
            this._initHandleEvaluationAOChange();
			this._initHandleEvaluationRequestAOChange();            
            
            aEvalListIds.forEach(function(sEvalListId){
                var oEvalList = that.byId(sEvalListId);
                if(oEvalList) {
                    if (!that._aResizeEvalList) {
                        that._aResizeEvalList = [];
                    }
                    that._aResizeEvalList.push(that.attachListControlResized(oEvalList));
                }
            });
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.attachRouteMatched(this._resetSelList, this);
        },
        
        onExit: function() {
            var that = this;
            BaseController.prototype.onExit.apply(this, arguments);
            that._aResizeEvalList.forEach(function(fnResizeEvalList){
                that.detachListControlResized(fnResizeEvalList);
            });
            this._oRouter.detachRouteMatched(this._resetSelList, this);
        },
        
        onItemPress: function(oEvent) {
            var oContext = oEvent.getSource() && oEvent.getSource().getBindingContext("data");
            if (oContext) {
                this.navigateTo("evaluation-display", {id: oContext.getProperty("ID")});
            }
        },
		onItemRequestPressManager: function(oEvent) {
			var oContext = oEvent.getSource() && oEvent.getSource().getBindingContext("data");
			if (oContext) {
				this.navigateTo("evaluationrequest-display", {
					id: oContext.getProperty("ID")
				});
			}
		},
		onItemRequestPressExpert: function(oEvent) {
			var oContext = oEvent.getSource() && oEvent.getSource().getBindingContext("data");
			if (oContext) {
				this.navigateTo("evaluationrequest-item", {
					id: oContext.getProperty("ID")
				});
			}
		},        
        onSelectionChange : function(oEvent) {
            if (!this._oSelectionMap) {
                this._oSelectionMap = {};
            }
            var bSelected = oEvent.getParameter("selected");
            var oSource = oEvent.getSource();
            var oData = oSource.getBindingContext("data").getObject();
            
            var oObjectContextModel = this.getModel("objectContext");

            if (bSelected) {
                this._oSelectionMap[oData.ID] = oData.MODEL_CODE;
            } else {
                delete this._oSelectionMap[oData.ID];
            }
            var oObjectModel = this.getModel("object");
            oObjectContextModel.setProperty("/EvaluationSelection", this._oSelectionMap);
            var bValidModel = true;
            jQuery.each(this._oSelectionMap, function(iEvaluationId, sEvaluationModelCode) {
                if (sEvaluationModelCode !== oObjectModel.getProperty("/CURR_PHASE_EVALUATION_MODEL")) {
                    bValidModel = false;
                }
            });
            var bEnabled = bValidModel && Object.keys(this._oSelectionMap).length >= 2;
            oObjectContextModel.setProperty("/CreateAverageEvaluationEnabled", bEnabled);
            oObjectContextModel.setProperty("/CreateTotalEvaluationEnabled", bEnabled);
        },
        
        /**
         * Update the evaluation lists, once an evaluation is
         * created, deleted, status changed or submitted.
         */
        _initHandleEvaluationAOChange: function() {
            var that = this;
            
            var fnAOChangeListener = function(oEvent){
                
                var sAction = oEvent && oEvent.getParameter("actionName");
                if (sAction && ["create", "del", "submit", "modifyAndSubmit", "executeStatusTransition"].indexOf(sAction) > -1) {
                    that.rebindList(that.getView().byId("myEvaluationList"));
                    var sStatusCode = oEvent &&
                                      oEvent.getParameter("instance") && 
                                      oEvent.getParameter("instance").getProperty("/STATUS_CODE");
                    if (sStatusCode !== "sap.ino.config.EVAL_DRAFT") {
                        that.rebindList(that.getView().byId("pubEvaluationList"));
                        that.rebindList(that.getView().byId("evalationRequestExpert"));
                    }
                    var oChangeRequest = oEvent.getParameter("changeRequest");
                    if ((sAction && ["create","del", "submit", "modifyAndSubmit"].indexOf(sAction) > -1) || oChangeRequest && oChangeRequest.STATUS_ACTION_CODE === "sap.ino.config.EVAL_REWORK") {
                        that.rebindList(that.getView().byId("evaluationList"));
                        that.rebindList(that.getView().byId("evalationRequestExpert"));
                    }
                }
            };
            ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
            ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
            ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
        },
		_initHandleEvaluationRequestAOChange: function(oEvent) {
			var that = this;
		
			var fnAOChangeListener = function(oEvent) {
				var sAction = oEvent && oEvent.getParameter("actionName");
				var oChangeRequest = oEvent.getParameter("changeRequest");
				if (oEvent.getParameter("object").getMetadata().getName() === "sap.ino.commons.models.object.EvaluationRequest" && that && that.getView()
					.byId("evalationRequestManager")) {

					if (sAction && ["create", "del", "submit", "modifyAndSubmit", "bulkDeleteEvalReqs"].indexOf(sAction) > -1) {

						if ((sAction && ["del", "submit", "modifyAndSubmit", "create"].indexOf(sAction) > -1) || oChangeRequest) {
							that.rebindList(that.getView().byId("evalationRequestManager"));
						}
					}
				} else if (oEvent.getParameter("object").getMetadata().getName() === "sap.ino.commons.models.object.EvaluationRequestItem" && that &&
					that.getView().byId("evalationRequestExpert")) {
					if (sAction && ["create", "del", "submit", "modifyAndSubmit", "forward","executeStatusTransition"].indexOf(sAction) > -1) {
						if ((sAction && ["del", "submit", "modifyAndSubmit", "create"].indexOf(sAction) > -1) || oChangeRequest) {
							that.rebindList(that.getView().byId("evalationRequestExpert"));
						}
					}
				}

			};

			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
		},        
        onEvaluatorPressed: function(oEvent) {
            oEvent.preventDefault();
            var oSource = oEvent.getSource();
            if (oSource) {
                var iIdentityId = oSource.getBindingContext("data") && 
                                  oSource.getBindingContext("data").getProperty("EVALUATOR_ID");
                if (iIdentityId !== undefined && !this.oIdentityCardView) {
                    this.oIdentityCardView = sap.ui.xmlview({
                        viewName : "sap.ino.vc.iam.IdentityCard"
                    });
                    this.getView().addDependent(this.oIdentityCardView);
                }
                if (this.oIdentityCardView && this.oIdentityCardView.getController()) {
                    this.oIdentityCardView.getController().open(oSource, iIdentityId);    
                }
            }
        },
		onEvaluationRequestOwnerPressed: function(oEvent) {
			oEvent.preventDefault();
			var oSource = oEvent.getSource();
			if (oSource) {
				var iIdentityId = oSource.getBindingContext("data") &&
					oSource.getBindingContext("data").getProperty("OWNER_ID");
				if (iIdentityId !== undefined && !this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				if (this.oIdentityCardView && this.oIdentityCardView.getController()) {
					this.oIdentityCardView.getController().open(oSource, iIdentityId);
				}
			}
		}  ,
			
	    rebindList:function(oList){
            if (oList) {
                var oBindingInfo = oList.getBindingInfo("items");
                oList.bindItems(oBindingInfo);
            }
        },
        
        _resetSelList:function(){
            var oObjectContextModel = this.getModel("objectContext");
			var aAvgEvalId = Object.keys(oObjectContextModel.getProperty("/EvaluationSelection") || {});
			if (aAvgEvalId.length <= 0 && this.getCurrentRoute() === "idea-display") {
			    this._oSelectionMap = {};
			    this.rebindList(this.getView().byId("evaluationList"));
			    this.rebindList(this.getView().byId("myEvaluationList"));
                this.rebindList(this.getView().byId("pubEvaluationList"));
			}
        }
        
    });
});