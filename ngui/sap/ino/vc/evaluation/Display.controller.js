sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/models/object/Evaluation",
    "sap/ino/vc/evaluation/EvaluationFacet",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(BaseController,
            Evaluation,
            EvaluationFacet,
            MessageToast,
            JSONModel,
            Attachment,
            TopLevelPageFacet) {
    "use strict";
    var attachmentUploadUrl = Attachment.getEndpointURL();
    return BaseController.extend("sap.ino.vc.evaluation.Display", jQuery.extend({}, TopLevelPageFacet, EvaluationFacet, {

        routes: ["evaluation-display"],
        
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);
            if (!this.getModel("local")) {
				this.setModel(new JSONModel({
					ATTACHMENT_UPLOAD_URL: attachmentUploadUrl
				}), "local");
			}
            this.setModel(new JSONModel({
                EVAL_REWORK: "sap.ino.config.EVAL_REWORK",
                V_REWORK: false,
                EVAL_PUB_SUBMITTER: "sap.ino.config.EVAL_PUB_SUBMITTER",
                V_PUB_SUBMITTER: false,
                EVAL_PUB_COMMUNITY: "sap.ino.config.EVAL_PUB_COMMUNITY",
                V_PUB_COMMUNITY: false,
                EVAL_UNPUBLISH: "sap.ino.config.EVAL_UNPUBLISH",
                V_UNPUBLISH: false
            }), "status");
            var oViewModel = this.getModel("view");
            if (!oViewModel) {
                oViewModel = new JSONModel({});
                this.setModel(oViewModel, "view");
            }
            oViewModel.setProperty("/IDEA_NAVIGATION_SECTION", "sectionEvaluations");
            oViewModel.setProperty("/EDIT_MODE", false);
            this.aBusyControls = [this.byId("evaluationLayout")];
            this.initMatrixControl();
            this.scrollDockElement("evaluationDisplay", "evaluationMatrix");
            this._sResizeEvalList = this.attachListControlResized(this.byId("criteriaList"));
        },
        
        onExit: function() {
            BaseController.prototype.onExit.apply(this, arguments);
            this.detachListControlResized(this._sResizeEvalList);
        },
        
        resetStatusModel: function() {
            var oStatusModel = this.getModel("status");
            oStatusModel.setProperty("/V_REWORK", false);
            oStatusModel.setProperty("/V_PUB_COMMUNITY", false);
            oStatusModel.setProperty("/V_PUB_SUBMITTER", false);
            oStatusModel.setProperty("/V_UNPUBLISH", false);
        },
        
        setStatusChangeButtons: function() {
            var sNextStatus = this.getObjectModel() &&
                              this.getObjectModel().getPropertyModel().getData().actions.executeStatusTransition.customProperties &&
                              this.getObjectModel().getPropertyModel().getData().actions.executeStatusTransition.customProperties.statusTransitions;
            if(!sNextStatus){
                return;
            }

            this.resetStatusModel();
            var oStatusModel = this.getModel("status");
            jQuery.each(sNextStatus, function(iIdx, sKey){
                switch (sKey.STATUS_ACTION_CODE){
                    case "sap.ino.config.EVAL_REWORK":
                        oStatusModel.setProperty("/V_REWORK", true);
                        break;
                    case "sap.ino.config.EVAL_PUB_SUBMITTER":
                        oStatusModel.setProperty("/V_PUB_SUBMITTER", true);
                        break;
                    case "sap.ino.config.EVAL_PUB_COMMUNITY":
                        oStatusModel.setProperty("/V_PUB_COMMUNITY", true);
                        break;
                    case "sap.ino.config.EVAL_UNPUBLISH":
                        oStatusModel.setProperty("/V_UNPUBLISH", true);
                        break;
                    default:
                        break;
                }
            });
        },
        
        onRouteMatched: function(oEvent) {
            BaseController.prototype.onRouteMatched.apply(this, arguments);
            var that = this;
            var oEvaluation = this.getObjectModel();

            oEvaluation.getDataInitializedPromise().done(function() {
                that.setHelp("EVALUATION_DISPLAY");
            });
            oEvaluation.getPropertyModel().attachEvent("modelInitialized", function(){
                that.setStatusChangeButtons();
            });

            this.bindMatrix();
        },

        createObjectModel: function(vObjectKey) {
            return new Evaluation(vObjectKey, {
                actions: ["update", "del", "executeStatusTransition", "submit"],
                continuousUse: true,
                readSource: {
                    model: this.getDefaultODataModel(),
                    groupSetting: {
                        EvalAttachments: "IdeaEvalAttachments"
                    }
                }
            });
        },

        onExecuteStatusTransition: function(oEvent) {
    	    var that = this;
    	    var oEvaluation = this.getObjectModel();   
    	    var oActionRequest;
            if (!oEvaluation) {
                return;
            }
            var sStatusAction = oEvent.getSource().getCustomData()[0].getValue();
            var bIsEvaluationReworkAction = sStatusAction === "sap.ino.config.EVAL_REWORK";
            oActionRequest = oEvaluation.executeStatusTransition({
                STATUS_ACTION_CODE : sStatusAction,
                IDEA_ID: oEvaluation.getProperty("/IDEA_ID")
            });
            if (oActionRequest) {
                oActionRequest.done(function() {
                    MessageToast.show(that.getText("OBJECT_MSG_STATUS_CHANGE_SUCCESS"));
                    if (bIsEvaluationReworkAction) {
                        that.resetStatusModel();
                        that.setObjectModel(undefined);
                        that.onNavBack(true);
                    }
                    
                });
                oActionRequest.fail(function(o) {
                    if (bIsEvaluationReworkAction) {
                        that.onNavBack(true);
                    }
                    if (o.MESSAGES && o.MESSAGES.length > 0) {
                        MessageToast.show(that.getText(o.MESSAGES[0].MESSAGE_TEXT));
                    }           
                });
            }
        },
        
        onEdit: function() {
            this.navigateTo("evaluation-edit", {id: this.getObjectModel().getKey()});
        },
        onClose: function(){
             this.navigateBack();
        }
        
    }));
});