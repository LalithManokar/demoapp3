sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"   
], function(Controller,MessageToast) {
	"use strict";
	return Controller.extend("sap.ino.installation.BaseController", {

		onInit: function() {
			if (Controller.prototype.onInit) {
				Controller.prototype.onInit.apply(this, arguments);
			}

			this._xCSRFToken = this.getOwnerComponent()._xCSRFToken;
			this.getView().setModel(this.getOwnerComponent().getModel("preCheck"), "preCheck");
		},

		onShowHello: function() {
			// show a native JavaScript alert
			alert("base controller");
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		getBackendRootURL: function() {
			var sBackendRootURL = window.location.protocol + '//' + window.location.host;
			return sBackendRootURL;
		},
		getTextResourceBundle: function() {
			var oTextModel = this.getOwnerComponent().getModel("i18n");
			return oTextModel.getResourceBundle();
		},
		formatTitleText: function(text, version, patch, sp) {
			//this.getTextResourceBundle().getText("")
			return text + " " + version + "." + sp + "." + patch;
		},
		formatCreateSuccessText: function(version, patch, sp) {
			return this.getTextResourceBundle().getText("DESCRIPTION_OF_INSTALLATION_CREATE_SUCCESS", [version, sp, patch]);
		},
		formatUpgradeSuccessTitle: function(version, patch, sp) {
			return this.getTextResourceBundle().getText("UPGRADE_INNOVATION_MANAGEMENT_SYSTEM_PROCESS", [version, sp, patch]);
		},
		formatUpgradeDescriptionText: function(version, patch, sp, pVersion, pPatch, pSp) {
			return this.getTextResourceBundle().getText("DESCRIPTION_OF_INSTALLATION_UPGRADE", [version, sp, patch , pVersion, pPatch, pSp]);
		},
		formatUpgradeVersionText: function(version, patch, sp, pVersion, pPatch, pSp) {
			return this.getTextResourceBundle().getText("POST_INFO_INSTALLATION_UPGRADE_VERSION", [ pVersion,  pSp, pPatch,version, sp, patch]);
		},
		formatUpgradeSuccessText: function(version, patch, sp) {
			return this.getTextResourceBundle().getText("DESCRIPTION_OF_INSTALLATION_UPGRADE_SUCCESS", [version, sp,patch]);
		},
		visibleMessageBox: function(iStatus) {
			if (iStatus === 1 || !iStatus) {
				return false;
			} else {
				return true;
			}
		},
		visibleMessageStatusBox: function(iStatus) {
			if (!iStatus) {
				return false;
			} else {
				return true;
			}
		},
		formatStatusText: function(iStatus)
		{
		    if(iStatus === 1){
		        return this.getTextResourceBundle().getText("MSG_STATUS_TEXT_SUCCESS");		        
		    }
		    else {
		        return this.getTextResourceBundle().getText("MSG_STATUS_TEXT_ERROR");		        
		    }
		    
		},

		systemHasAlreadyUpgradeOrInstall: function() {
			var oCheckModel = this.getOwnerComponent().getModel("preCheck");
			var oRouter = this.getRouter();
// 			var sDuVersion = oCheckModel.getProperty("/du_version/version") + "." + oCheckModel.getProperty("/du_version/version_sp") + "." +
// 				oCheckModel.getProperty("/du_version/version_patch");
// 			var sPreVersion = oCheckModel.getProperty("/prevVersion/version") + "." + oCheckModel.getProperty("/prevVersion/version_sp") + "." +
// 				oCheckModel.getProperty("/prevVersion/version_patch");
			var sTarget;
			if (oCheckModel.getProperty("/upgrade")) {
					sTarget = "installationUpgrade";
			} else {
				sTarget = "installationCreate";
			}
			//For test Usage
            //sTarget = "installationCreate";
			oRouter.navTo(sTarget);
		},
		getLatestSteps: function() {
			var that = this;
			//var oModel = this.getView().getModel("installation");
			var oStepObject = {error:"",steps:[]};
			var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/logService.xsjs/getLastSteps";
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
					oStepObject.error = false;
					oStepObject.steps = oResponseBody.data;
				} else {
					oStepObject.error = true;
					 oStepObject.steps = [];
				} 
			});
			oAjaxPromise.fail(function(oResponse){
			    oStepObject.error = true;
			    oStepObject.steps = [];
			});
			//For Test Usage;
			///Create Test
// 			oStepObject.steps = [{ACTION_CODE:"CREATE_USER",STATUS: 1, MESSAGE:"Done"},
// 			                     {ACTION_CODE:"SET_SYS_CONFIG",STATUS: 1, MESSAGE:"Done"},
// 			                     {ACTION_CODE:"SET_SYS_CACHE",STATUS: 1, MESSAGE:"Done"},
// 			                     {ACTION_CODE:"SET_SYS_TIMEOUT",STATUS: 1, MESSAGE:"Done"},
//                                  {ACTION_CODE:"SET_APP_CONFIG",STATUS: 1, MESSAGE:"Done"},   			                     
// 			                     {ACTION_CODE:"SET_SQLCC",STATUS: 1, MESSAGE:"Done"},
//                                  {ACTION_CODE:"RUN_NEW_CONFIG",STATUS: 1, MESSAGE:"Done"},
//                                 {ACTION_CODE:"RESTART_DB",STATUS: 2, MESSAGE:"Error"}       
//                                 ];

          //oStepObject.steps = [];                      
			//Upgrade Test
// 			oStepObject.steps = [{ACTION_CODE:"SET_SYS_TIMEOUT",STATUS: 1, MESSAGE:"Done"},
// 			                     {ACTION_CODE:"CANCEL_TIMEOUT",STATUS: 1, MESSAGE:"Done"}];  
// 			oStepObject.steps = [{ACTION_CODE:"SET_SYS_TIMEOUT",STATUS: 1, MESSAGE:"Done"},
// 			                     {ACTION_CODE:"CANCEL_TIMEOUT",STATUS: 1, MESSAGE:"Done"}];  
			                 //oStepObject.steps = [];
			                     
			return oStepObject;
		},
		getNeedExecuteActions: function(aActions, aLatestSteps) {
			var bExectuedStep, aNeedExectueActions = [];
			if (aLatestSteps.length > 0) {
				for (var i = 0; i < aActions.length; i++) {
					bExectuedStep = false;
					for (var j = 0; j < aLatestSteps.length; j++) {
						if (aActions[i] === aLatestSteps[j].ACTION_CODE && aLatestSteps[j].STATUS !== 2) {
							bExectuedStep = true;
							break;
						}
					}
					if (!bExectuedStep) {
						aNeedExectueActions.push(aActions[i]);
					}
				}
			} else {
			    aNeedExectueActions = aActions;
			}
			return aNeedExectueActions;
		},
		setExecutedActionsStatus: function(aLatestSteps) {
			var oModel = this.getView().getModel("installation");

			for (var i = 0; i < aLatestSteps.length; i++) {
				let oServiceNameControl = this.getServiceNameControl(aLatestSteps[i].ACTION_CODE);
				let oMessageObject = {
					status: aLatestSteps[i].STATUS,
					message: aLatestSteps[i].MESSAGE
				};
				if (aLatestSteps[i].ACTION_CODE === "RESTART_DB" && aLatestSteps[i].STATUS === 2) {
				   oMessageObject.message = this.getTextResourceBundle().getText("MSG_RESTART_DB_MSG");
				}
				
				if (aLatestSteps[i].ACTION_CODE === "SET_SYS_CONFIG" || aLatestSteps[i].ACTION_CODE === "SET_SYS_CACHE" || aLatestSteps[i].ACTION_CODE ===
					"SET_SYS_TIMEOUT") {
					var sActionControlID = oServiceNameControl.controlID + aLatestSteps[i].ACTION_CODE;
					oModel.setProperty("/" + sActionControlID, oMessageObject);
				} else {
					oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);
				}
			}
		},
		setExecutedUpgradeActionsStatus: function(aLatestSteps) {
			var oModel = this.getView().getModel("installation");

			for (var i = 0; i < aLatestSteps.length; i++) {
				let oServiceNameControl = this.getServiceNameControl(aLatestSteps[i].ACTION_CODE);
				let oMessageObject = {
					status: aLatestSteps[i].STATUS,
					message: aLatestSteps[i].MESSAGE
				};
					oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);

			}
		},
		getServiceNameControl: function(sAction) {
			var sServiceName, sControlID;
			switch (sAction) {
				case "CREATE_USER":
					sServiceName = "createUser";
					sControlID = sServiceName;
					break;
				case "SET_SYS_CONFIG":
					sServiceName = "setSystemConfig";
					sControlID = sServiceName;
					break;
				case "SET_SYS_CACHE":
					sServiceName = "setSystemCache";
					sControlID = "setSystemConfig";
					break;
				case "SET_SYS_TIMEOUT":
					sServiceName = "setSystemTimeout";
					sControlID = "setSystemConfig";
					break;
				case "SET_APP_CONFIG":
					sServiceName = "setApplicationConfig";
					sControlID = sServiceName;
					break;
				case "SET_SQLCC":
					sServiceName = "setSqlcc";
					sControlID = sServiceName;
					break;
				case "RUN_NEW_CONFIG":
					sServiceName = "runNewConfig";
					sControlID = sServiceName;
					break;
				case "RESTART_DB":
					sServiceName = "checkRestartDB";
					sControlID = sServiceName;
					break;
				case "RUN_CONFIG":
					sServiceName = "runConfig";
					sControlID = sServiceName;
					break;
				case "SET_UP_JOBS":
					sServiceName = "/sap/hana/xs/admin/server/xsjob/updateJob.xscfunc";
					sControlID = "setUpJobs";
					break;
				case "REVOKE_TIMEOUT":
					sServiceName = "revokeTimeout";
					sControlID = sServiceName;
					break;
			    case "CANCEL_TIMEOUT":
					sServiceName = "cancelTimeout";
					sControlID = sServiceName;
					break;
				default:
					sServiceName = "NONE";
					sControlID = sServiceName;
			}
			return {
				serviceName: sServiceName,
				controlID: sControlID
			};
		},
		isApproachedFinalStep: function(steps){
		    var bFinal = false;
		  for(var i = 0; i < steps.length; i++){
		      if(steps[i].ACTION_CODE === "REVOKE_TIMEOUT"){
		          bFinal = true;
		          break;
		      }
		  }
		    return bFinal;
		},
	onPressLogin: function(oEvent){
	        var that = this;
	        var sHost = this.getBackendRootURL();
			var sURL = sHost + "/sap/hana/xs/formLogin/logout.xscfunc";
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
              window.location.href = sHost + "/sap/ino/";
			});
	}	
	});
});