sap.ui.define([
   "sap/ino/installation/controller/BaseController",
      "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/Text"	
], function(BaseController, JSONModel, MessageToast, MessageBox,Dialog,DialogType,Button,Text) {
	"use strict";
	return BaseController.extend("sap.ino.installation.controller.InstallationUpgradeProcess", {
		onInit: function() {
			if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			}
			var oRouter = this.getRouter();
			oRouter.getRoute("installationUpgradeProcess").attachMatched(this.onRouteMatched, this);
		},
		visbileUpgradeButtonToolbar: function(bProcess) {
			return !bProcess;
		},
		visibleStartToProcessBtn: function(bStart) {
			return bStart;
		},
		visibleUpgradePrepareMsgStrip: function(bStatus) {
			if (bStatus === 2) {
				return true;
			} else {
				return false;
			}
		},
		visibleUpgradePostMsgStrip: function(bStatus) {
			if (bStatus === 1) {
				return true;
			} else {
				return false;
			}
		},
		formatInstallDuLink: function(sLinkText){
		    return this.getBackendRootURL() + sLinkText;
		},
		onRouteMatched: function(oEvent) {
			//Call Service to check the status
			//this.systemHasAlreadyUpgradeOrInstall(); 
			var oModel;
			oModel = this.getView().getModel("installation");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.systemHasAlreadyUpgradeOrInstall(); 
            var oCheckModel = this.getOwnerComponent().getModel("preCheck");	
            if(!oCheckModel.getProperty("/upgrade")){
			   oRouter.navTo("installationCreate");  
			   	return;
            }			
			
			
			if (!oModel) {
				oModel = new JSONModel();
				//CallService to set data to the model();
				this.getView().setModel(oModel, "installation");
				oModel.setProperty("/STEP_TO_PROCESS", false);
				oModel.setProperty("/STEP_TO_INSTALLDU", false);
			}
			var oLatestStep = this.getLatestSteps();
			//oLatestStep.error = true;
			if (oLatestStep.error) {
				MessageToast.show(this.getTextResourceBundle().getText("GET_STEPS_ERROR"));
				return;
			}
			if(oLatestStep.steps.length >= 9 ){
			    oModel.setProperty("/STEPS", []); 
			} else {
			    oModel.setProperty("/STEPS", oLatestStep.steps);
			}
			var bCancelStep = this.hasCancelStep(oLatestStep.steps);
			var bFinal;
				bFinal = this.isApproachedFinalStep(oLatestStep.steps);			
// 			if (!bCancelStep) {

// 				if (bFinal) {
// 				// 	oRouter.navTo("installationUpgradeSuccess");
// 					oModel.setProperty("/EXISTED", false);
// 				} else if (oLatestStep.steps.length > 0) {
// 					oModel.setProperty("/EXISTED", true);
// 				} else {
// 					oModel.setProperty("/EXISTED", false);
// 				}
// 			} else {
// 				oModel.setProperty("/EXISTED", false);
// 			}
	        var aSuccessSteps = oLatestStep.steps.filter(function(oStep){
	             return oStep.STATUS === 1;
	        });
			if(bCancelStep){
			    if(aSuccessSteps.length === 4 || (aSuccessSteps.length === 2 && aSuccessSteps.length === oLatestStep.steps.length) || 
			       aSuccessSteps.length === 1 ){
			       oModel.setProperty("/STEPS", []); 
			    }
			} else {
			    if(aSuccessSteps.length === 3){
			       oModel.setProperty("/STEPS", []); 
			    }			    
			}
			var aSteps = oModel.getProperty("/STEPS");
			//If step existed, then auto fire the step to do
			if (aSteps.length > 0) {
				var oWizard = this.byId("UpgradeProcessWizard");
				if (!this.byId("upgradePrepare").isActive()) {
					oWizard._activateStep(this.byId("upgradePrepare"));
				}
				this.onPressPrepareNextButton();
				this.setExecutedUpgradeActionsStatus(oLatestStep.steps);
				if((bCancelStep && aSteps.length > 2) || (!bCancelStep && aSteps.length > 1)){
				     this.onPressInstallDuNextButton();
				}
				//this.byId("createInputProcessBtn").firePress();
			}

		},
		onReprocess: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var aActions = ["RUN_CONFIG", "REVOKE_TIMEOUT"];
			var i, aNeedExectueActions = [],
				bContinue;
			var oModel = this.getView().getModel("installation");
		
			var oLatestStep = this.getLatestSteps();
			if (oLatestStep.error) {
				MessageToast.show(this.getTextResourceBundle().getText("GET_STEPS_ERROR"));
				return;
			}
			oModel.setProperty("/STEPS", oLatestStep.steps);
			var bCancelStep = this.hasCancelStep(oLatestStep.steps);			
	        var aSuccessSteps = oLatestStep.steps.filter(function(oStep){
	             return oStep.STATUS === 1;
	        });
			if(bCancelStep){
			    if(aSuccessSteps.length === 4 || (aSuccessSteps.length === 2 && aSuccessSteps.length === oLatestStep.steps.length) || 
			       aSuccessSteps.length === 1 ){
			       oModel.setProperty("/STEPS", []); 
			    }
			} else {
			    if(aSuccessSteps.length === 3){
			       oModel.setProperty("/STEPS", []); 
			    }			    
			}			
			oModel.setProperty("/STARTED_TO_PROCESS", false);				
			var aLatestSteps = oModel.getProperty("/STEPS");
			aNeedExectueActions = this.getNeedExecuteActions(aActions, aLatestSteps);
			// 			aNeedExectueActions = ["SET_SYS_TIMEOUT", "SET_APP_CONFIG",
			// 			                 "SET_SQLCC", "RUN_NEW_CONFIG", "RESTART_DB", "RUN_CONFIG", "SET_UP_JOBS", "REVOKE_TIMEOUT"]; 
			//aActions;
			//this.sRandomAction = aActions[Math.floor((Math.random() * aActions.length))];
			//this.sRandomAction = "";
			// 			for (i = 0; i < aNeedExectueActions.length; i++) {
			// 				bContinue = this.callServiceToProcess(aNeedExectueActions[i]);
			// 				if (!bContinue) {
			// 					break;
			// 				}
			// 				if (bContinue && aNeedExectueActions[i] === "REVOKE_TIMEOUT") {
			// 					oRouter.navTo("installationUpgradeSuccess");
			// 				}
			// 			}  
			this.callServiceToProcess(aNeedExectueActions);

		},
		onPressStart: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("installationUpgrade");

		},
		onPressInstallDuNextButton: function(oEvent) {
			//var oSource = oEvent.getSource();
// 			var oModel = this.getView().getModel("installation");
// 			var oWizard = this.byId("UpgradeProcessWizard");
// 			oWizard.setCurrentStep(this.byId("upgradePrepare"));
// 			oModel.setProperty("/STEP_TO_INSTALLDU", true);
// 			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oWizard = this.byId("UpgradeProcessWizard");
			var oModel = this.getView().getModel("installation");
			oWizard.setCurrentStep(this.byId("upgradePost"));
			oModel.setProperty("/STEP_TO_PROCESS", true);
			oModel.setProperty("/STARTED_TO_PROCESS", true);


		},

		onPressPrepareNextButton: function(oEvent) {
			var oModel = this.getView().getModel("installation");
			var oWizard = this.byId("UpgradeProcessWizard");
// 			oWizard.setCurrentStep(this.byId("upgradeInstallDu"));
// 			oModel.setProperty("/STEP_TO_INSTALLDU", true);
			this.getView().setBusy(true);
			var bContinue;
			if (oModel.getProperty("/STEPS").length === 0) {
				bContinue = this.callSysTimeOutProcess("SET_SYS_TIMEOUT");
				if (bContinue) {
					oWizard.setCurrentStep(this.byId("upgradeInstallDu"));
					oModel.setProperty("/STEP_TO_INSTALLDU", true);
				}
			} else {
				oWizard.setCurrentStep(this.byId("upgradeInstallDu"));
				oModel.setProperty("/STEP_TO_INSTALLDU", true);
			}
			this.getView().setBusy(false);
		},

		onPressUpgradePost: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oModel = this.getView().getModel("installation");
			oModel.setProperty("/STARTED_TO_PROCESS", false);
			var aNeedExectueActions = [];
			var aLatestSteps = oModel.getProperty("/STEPS");
			var aActions = ["RUN_CONFIG", "REVOKE_TIMEOUT"];
			aNeedExectueActions = this.getNeedExecuteActions(aActions, aLatestSteps);
			//this.sRandomAction = aActions[Math.floor((Math.random() * aActions.length))];
			this.callServiceToProcess(aNeedExectueActions);

		},
		onPressCancel: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().setModel(undefined, "installation");
			var oWizard = this.byId("UpgradeProcessWizard");
			oWizard.discardProgress(this.byId("upgradePrepare"));
			oRouter.navTo("installationUpgrade");
		},
		onPressUpgradeCancel: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTextModel = this.getTextResourceBundle();
			var that = this;
			var oWizard = this.byId("UpgradeProcessWizard");
			MessageBox.confirm(oTextModel.getText("CONFIRM_UPGRADE_CANCEL_MESSAGEBOX"), {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(sAction) {
					if (sAction === MessageBox.Action.YES) {
						that.getView().setBusy(true);
						var bContinue = that.callSysTimeOutProcess("CANCEL_TIMEOUT");
						if (bContinue) {
							that.getView().setModel(undefined, "installation");
							oWizard.discardProgress(that.byId("upgradePrepare"));
							that.getView().setBusy(false);
							oRouter.navTo("installationUpgrade");
						}
					}
				}
			});

		},
		callServiceToProcess: function(aActions) {
			if (aActions.length === 0) {
				return;
			}
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sAction = aActions[0];
			var oModel = this.getView().getModel("installation");
			var oServiceNameControl = this.getServiceNameControl(sAction);
			var that = this;
			var oControl = this.byId(oServiceNameControl.controlID);
			if (oControl) {
				oControl.setBusy(true);
			}
			var oMessageObject = {
				status: "",
				message: ""
			};
			var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/installationService.xsjs/" + oServiceNameControl.serviceName;
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify({}),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: true
			});

			oAjaxPromise.done(function(oResponseBody) {
				if (oControl) {
					oControl.setBusy(false);
				}
				//For test usage
				// if(sAction === that.sRandomAction){
				//     oResponseBody.success = false;
				//     oResponseBody.msg = "Test Success";
				// }
				
				if (oResponseBody.success) {
					var iStatus = 1;
					if (oResponseBody.status) {
						iStatus = oResponseBody.status;
					}
					oMessageObject = {
						status: iStatus,
						message: oResponseBody.msg
					};
					aActions.shift(0, 1);
					if (sAction === "REVOKE_TIMEOUT") {
						oRouter.navTo("installationUpgradeSuccess");
					} else {
						that.callServiceToProcess(aActions);
					}
				} else {
					oMessageObject = {
						status: 2,
						message: oResponseBody.msg
					};
				}
				oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);

			});
			oAjaxPromise.fail(function(oResponse) {
				if (oControl) {
					oControl.setBusy(false);
				}
				oMessageObject = {
					status: 2,
					message: oResponse.message
				};
				oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);
			});
		},
		callSysTimeOutProcess: function(sAction) {
			var oModel = this.getView().getModel("installation");
			var oServiceNameControl = this.getServiceNameControl(sAction);
			var that = this;
			var oControl = this.byId(oServiceNameControl.controlID);
			if (oControl) {
				oControl.setBusy(true);
			}
			var oMessageObject = {
				status: "",
				message: ""
			};
			var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/installationService.xsjs/" + oServiceNameControl.serviceName;
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify({}),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: false
			});

			oAjaxPromise.done(function(oResponseBody) {

				if (oResponseBody.success) {
					var iStatus = 1;
					if (oResponseBody.status) {
						iStatus = oResponseBody.status;
					}
					oMessageObject = {
						status: iStatus,
						message: oResponseBody.msg
					};
				} else {
					oMessageObject = {
						status: 2,
						message: oResponseBody.msg
					};
				}
				oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);

			});
			oAjaxPromise.fail(function(oResponse) {
				oMessageObject = {
					status: 2,
					message: oResponse.message
				};
				oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);
			});
			if (oControl) {
				oControl.setBusy(false);
			}
			if (oModel.getProperty("/" + oServiceNameControl.controlID + "/status") === 2) {
				return false;
			} else {
				return true;
			}
		},
		hasCancelStep: function(aSteps) {
			var bCancel = false;
			for (var i = 0; i < aSteps.length; i++) {
				if (aSteps[i].ACTION_CODE === "CANCEL_TIMEOUT") {
					bCancel = true;
					break;
				}
			}
			return bCancel;
		},
		onPressinStallDuBtn: function(oEvent) {
			var oWizard = this.byId("UpgradeProcessWizard");
			oWizard.setCurrentStep(this.byId("upgradePrepare"));
		},
		onPressUpgradePrepareBtn: function(oEvent) {
			var oWizard = this.byId("UpgradeProcessWizard");
			oWizard.setCurrentStep(this.byId("upgradePost"));
		},
		onActivateUpgradePost: function(oEvent) {
			//this.byId('upgradePrepareBtn').setVisible(false); 
		},
		showMessageDetail: function(oEvent){
		    var oSource = oEvent.getSource();
			if (!this.oUpgradeErrorMessageDialog) {
			    var oText = new Text();
			    oText.setText(oSource.getCustomData()[0].getValue());
				this.oUpgradeErrorMessageDialog = new Dialog({
					title: this.getTextResourceBundle().getText("ERROR_MESSAGE_TEXT_TITLE"),
					contentWidth: "50%",
					contentHeight: "50%",
					content: [oText],
					buttons: new Button({
						type: "Emphasized",
						text: "OK",
						press: function () {
							this.oUpgradeErrorMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oUpgradeErrorMessageDialog.open();		    
		}		
	});
});