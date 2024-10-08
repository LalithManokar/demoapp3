sap.ui.define([
   "sap/ino/installation/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
    "sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/Text"
], function(BaseController, JSONModel, SimpleType, ValidateException, MessageToast, Dialog, DialogType, Button, Text) {
	"use strict";
	return BaseController.extend("sap.ino.installation.controller.InstallationCreateProcess", {
		onInit: function() {
			if (BaseController.prototype.onInit) {
				BaseController.prototype.onInit.apply(this, arguments);
			}

			var oRouter = this.getRouter();
			oRouter.getRoute("installationCreateProcess").attachMatched(this.onRouteMatched, this);
		},
		formatEditButton: function(bEditForm, bProcessing, bExisted) {
			return !bExisted && !bEditForm && !bProcessing;
		},
		formatReviewButton: function(bEditForm, bProcessing, bExisted) {
			return !bExisted && bEditForm && !bProcessing;
		},
		visbileInputButtonToolbar: function(bProcessing) {
			return !bProcessing;
		},
		visibleProcessButtonToolbar: function(bStartToProcess) {
			return bStartToProcess;
		},
		visibleSystemMessageStatusBox: function(configStatus, cacheStatus, timeoutStatus) {
			if (!configStatus && !cacheStatus && !timeoutStatus) {
				return false;
			} else {
				return true;
			}
		},
		visibleCreateProcessInputText: function(iStatus) {
			return iStatus === 2;
		},
		formatCreateProcessInputText: function(sMessage, iStatus) {
			if (iStatus === 2) {
				var sText = this.getTextResourceBundle().getText("MSG_GENERAL_INFO_ERROR_TEXT");
				return sMessage + " " + sText;
			}
		},
		formatSystemStatus: function(configStatus, cacheStatus, timeoutStatus) {
			if (configStatus === 1 && cacheStatus === 1 && timeoutStatus === 1) {
				return this.getTextResourceBundle().getText("MSG_STATUS_TEXT_SUCCESS");
			} else if (configStatus === 2 || cacheStatus === 2 || timeoutStatus === 2) {
				return this.getTextResourceBundle().getText("MSG_STATUS_TEXT_ERROR");
			}
		},
		visibleSystemMessageBox: function(configStatus, cacheStatus, timeoutStatus) {
			if (configStatus === 2 || cacheStatus === 2 || timeoutStatus === 2) {
				return true;
			} else {
				return false;
			}
		},
		formatSystemMessage: function(configStatus, cacheStatus, timeoutStatus, configMsg, cacheMsg, timeoutMsg) {
			if (configStatus === 2) {
				return configMsg;
			} else
			if (cacheStatus === 2) {
				return cacheMsg;
			} else if (timeoutStatus === 2) {
				return timeoutMsg;
			}
		},
		formatSMTPlink: function(sSuffix) {
			return this.getBackendRootURL() + sSuffix;
		},
		editableWhiteList: function(bEditForm, bCacheEnable) {
			return bEditForm && (bCacheEnable !== "yes");
		},
		onRouteMatched: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._validateErrorArray = [];
			//this.systemHasAlreadyUpgradeOrInstall(); 
			var oCheckModel = this.getOwnerComponent().getModel("preCheck");
			if (oCheckModel.getProperty("/upgrade")) {
				oRouter.navTo("installationUpgrade");
				return;
			}
			var aWhiteList = [{
					key: "yes",
					text: this.getTextResourceBundle().getText("CREATE_INPUT_YES")
				},
				{
					key: "no",
					text: this.getTextResourceBundle().getText("CREATE_INPUT_NO")
				}];
			var oModel;
			oModel = this.getView().getModel("installation");

			if (!oModel) {
				oModel = new JSONModel();
				//CallService to set data to the model();
				this.getView().setModel(oModel, "installation");
				oModel.setProperty("/EDIT_FORM", true);
				oModel.setProperty("/STEP_TO_PROCESS", false);
				oModel.setProperty("/STARTED_TO_PROCESS", false);
			}
			var oLatestStep = this.getLatestSteps();
			//oLatestStep.error = true;
			if (oLatestStep.error) {
				MessageToast.show(this.getTextResourceBundle().getText("GET_STEPS_ERROR"));
				return;
			}

			oModel.setProperty("/whiteListSection", aWhiteList);
			oModel.setProperty("/STEPS", oLatestStep.steps);
			var that = this;
			var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/installationService.xsjs/getSettingInfo";
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
			oAjaxPromise.done(function(oResponseBody, sResponseText, oResponse) {
				var oData;
				if (oResponseBody.success) {
					if (JSON.stringify(oResponseBody.data) === "{}") {
						oData = that.getInitalObjectForCreation();
						oModel.setProperty("/USEREXISTED", false);
						oModel.setProperty("/EDIT_FORM", true);
					} else {
						oData = oResponseBody.data;
						oModel.setProperty("/USEREXISTED", true);
						oModel.setProperty("/EDIT_FORM", false);
					}
					//For test Usage
					// 		oData = that.getInitalObjectForCreation();
					// 		oModel.setProperty("/USEREXISTED", false);
					// 		oModel.setProperty("/EDIT_FORM", true);

					oModel.setProperty("/FORM_DATA", oData);
				} else {
					oData = that.getInitalObjectForCreation();
					oModel.setProperty("/USEREXISTED", false);
					oModel.setProperty("/EDIT_FORM", true);
				}
				oModel.setProperty("/FORM_DATA", oData);
			});

			var bFinal = this.isApproachedFinalStep(oLatestStep.steps);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (bFinal) {
				oRouter.navTo("installationCreateSuccess");
				oModel.setProperty("/EXISTED", true);
			} else if (oLatestStep.steps.length > 0) {
				oModel.setProperty("/EXISTED", true);
			} else {
				oModel.setProperty("/EXISTED", false);
			}

			if (oModel.getProperty("/EXISTED")) {
				var oWizard = this.byId("createProcessWizard");
				if (!this.byId("createInput").isActive()) {
					oWizard._activateStep(this.byId("createInput"));
				}
				this.byId("createInputBtn").firePress();
				this.setExecutedActionsStatus(oLatestStep.steps);
				//this.byId("createInputProcessBtn").firePress();
			}
		},
		onPressCancel: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().setModel(undefined, "installation");
			var oWizard = this.byId("createProcessWizard");
			oWizard.discardProgress(this.byId("createInput"));
			oRouter.navTo("installationCreate");
		},
		onActivate: function(oEvent) {
			var test = 1234;
		},
		onComplete: function(oEvent) {
			var test = 1234;
		},
		onPressNext: function(oEvent) {
			var oWizard = this.byId("createProcessWizard");
			oWizard.setCurrentStep(this.byId("createProcessing"));
		},
		onPressCreateInputSubmit: function(oEvent) {
			var oModel = this.getView().getModel("installation");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var oPreapareData = oModel.getProperty("/FORM_DATA");
			if (!oModel.getProperty("/USEREXISTED")) {
				var oMessageObject = {
					status: "",
					message: ""
				};
				var that = this;
				var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/installationService.xsjs/saveSetting";
				var oAjaxPromise = jQuery.ajax({
					url: sURL,
					headers: {
						"X-CSRF-Token": that._xCSRFToken
					},
					data: JSON.stringify(oPreapareData),
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
						var sMsg = oResponseBody.msg;
						oMessageObject = {
							status: 2,
							message: sMsg
						};
					}
					oModel.setProperty("/MSG_STRIP_CREATE_INPUT", oMessageObject);
				});
				oAjaxPromise.fail(function(oResponse) {
					oMessageObject = {
						status: 2,
						message: oResponse.message
					};
					oModel.setProperty("/MSG_STRIP_CREATE_INPUT", oMessageObject);
				});
			}
			if (oModel.getProperty("/MSG_STRIP_CREATE_INPUT/status") !== 2) {
				var oWizard = this.byId("createProcessWizard");
				oWizard.setCurrentStep(this.byId("createProcessing"));
				oModel.setProperty("/STEP_TO_PROCESS", true);
				oModel.setProperty("/EDIT_FORM", false);
				oModel.setProperty("/STARTED_TO_PROCESS", true);
			}

		},
		onPressCreateInputProcess: function(oEvent) {
			var oModel = this.getView().getModel("installation");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oModel.setProperty("/STARTED_TO_PROCESS", false);

			var aActions = ["CREATE_USER", "SET_SYS_CONFIG", "SET_SYS_CACHE", "SET_SYS_TIMEOUT", "SET_APP_CONFIG",
			                 "SET_SQLCC", "RUN_NEW_CONFIG", "RESTART_DB", "RUN_CONFIG", "SET_UP_JOBS", "REVOKE_TIMEOUT"];
			var i, aNeedExectueActions = [],
				bContinue;

			var aLatestSteps = oModel.getProperty("/STEPS");
			aNeedExectueActions = this.getNeedExecuteActions(aActions, aLatestSteps);
			//For test Usage
			// 			aNeedExectueActions = aActions;
			//	    this.sRandomAction = aActions[Math.floor((Math.random() * aActions.length))];
			//this.sRandomAction = "SET_APP_CONFIG";
			// 			for (i = 0; i < aNeedExectueActions.length; i++) {
			// 				bContinue = this.callServiceToProcess(aNeedExectueActions[i]);
			// 				if (!bContinue) {
			// 					break;
			// 				}
			// 				if (bContinue && aNeedExectueActions[i] === "REVOKE_TIMEOUT") {
			// 					oRouter.navTo("installationCreateSuccess");
			// 				}
			// 			}

			if (aNeedExectueActions.length === 0) {
				//already to excuted then will jump to the success Page;
				oRouter.navTo("installationCreateSuccess");
			} else {

				this.callServiceToProcess(aNeedExectueActions);
			}
		},
		onReprocess: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var aActions = ["CREATE_USER", "SET_SYS_CONFIG", "SET_SYS_CACHE", "SET_SYS_TIMEOUT", "SET_APP_CONFIG",
			                 "SET_SQLCC", "RUN_NEW_CONFIG", "RESTART_DB", "RUN_CONFIG", "SET_UP_JOBS", "REVOKE_TIMEOUT"];
			var i, aNeedExectueActions = [],
				bContinue;
			var oModel = this.getView().getModel("installation");

			var oLatestStep = this.getLatestSteps();
			if (oLatestStep.error) {
				MessageToast.show(this.getTextResourceBundle().getText("GET_STEPS_ERROR"));
				return;
			}
			oModel.setProperty("/STARTED_TO_PROCESS", false);
			oModel.setProperty("/STEPS", oLatestStep.steps);
			var aLatestSteps = oModel.getProperty("/STEPS");
			//For test Usage
			// 			aLatestSteps = [{ACTION_CODE:"CREATE_USER",STATUS: 1, MESSAGE:"Done"},
			// 			                     {ACTION_CODE:"SET_SYS_CONFIG",STATUS: 1, MESSAGE:"Done"},
			// 			                     {ACTION_CODE:"SET_SYS_CACHE",STATUS: 1, MESSAGE:"Done"},
			// 			                     {ACTION_CODE:"SET_SYS_TIMEOUT",STATUS: 1, MESSAGE:"Done"},
			//                                  {ACTION_CODE:"SET_APP_CONFIG",STATUS: 2, MESSAGE:"APP config failed"}
			//                                 ];	
			//             this.sRandomAction = "";                    
			aNeedExectueActions = this.getNeedExecuteActions(aActions, aLatestSteps);
			//this.setExecutedActionsStatus(aLatestSteps);
			// 			aNeedExectueActions = ["SET_SYS_TIMEOUT", "SET_APP_CONFIG",
			// 			                 "SET_SQLCC", "RUN_NEW_CONFIG", "RESTART_DB", "RUN_CONFIG", "SET_UP_JOBS", "REVOKE_TIMEOUT"]; 
			//aActions;
			//this.sRandomAction = aActions[Math.floor((Math.random() * aActions.length))];

			this.callServiceToProcess(aNeedExectueActions);

		},
		onPressCreateInputSummaryNextBtn: function(oEvent) {

			var oWizard = this.byId("createProcessWizard");
			oWizard.setCurrentStep(this.byId("createProcessing"));
			this.byId('createInputSummaryToolbar').setVisible(false);

		},
		onPressCreateInputPreview: function(oEvent) {
			var oModel = this.getView().getModel("installation");
			var aControls = ["processCreateSystemManagerFirstName",
                			"processCreateSystemManagerLstName",
                			"processCreateSystemManagerPW",
                			"processCreateSystemManagerPWVerify",
                			"processCreateSystemManagerEmail",
                			"processCreateTechnicalUserPW",
                			"processCreateTechnicalUserPWVerify",
                			"processCreateExtensionPackage"
                			];
			for (var i = 0; i < aControls.length; i++) {
				this.byId(aControls[i]).fireChange();
			}

			if (this._validateErrorArray.length === 0) {
				oModel.setProperty("/EDIT_FORM", false);
			}
		},
		onPressCreateInputEdit: function(oEvent) {
			var oModel = this.getView().getModel("installation");
			oModel.setProperty("/EDIT_FORM", true);
		},
		onEmailChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				this._validateEmailInput(oInput);
			}
		},
		onEmailSenderChange: function(oEvent) {
			var oInput = oEvent.getSource();
			if (oInput.getValue() !== "") {
				this._validateEmailInput(oInput);
			}
		},
		_validateEmailInput: function(oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var oTextBundle = this.getTextResourceBundle();
			var rexMail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
			try {
				if (!oInput.getValue().match(rexMail)) {
					throw new ValidateException(oTextBundle.getText("INVALID_EMAIL_ADDRESS", oInput.getValue()));
				}
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		_validateSamePassword: function(oInput, sProperty) {
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var oTextBundle = this.getTextResourceBundle();
			var oModel = this.getView().getModel("installation");
			try {
				if (oModel.getProperty("/FORM_DATA/" + sProperty) !== oInput.getValue()) {
					throw new ValidateException(oTextBundle.getText("VERIFY_PASSWORD_FAILED"));
				} else {
					var sControlChain;
					switch (sProperty) {
						case "INNO_MANAGER_REPASSWORD":
							sControlChain = "processCreateSystemManagerPWVerify";
							break;
						case "TECH_USER_REPASSWORD":
							sControlChain = "processCreateTechnicalUserPWVerify";
							break;
						case "INNO_MANAGER_PASSWORD":
							sControlChain = "processCreateSystemManagerPW";
							break;
						case "TECH_USER_PASSWORD":
							sControlChain = "processCreateTechnicalUserPW";
							break;
					}
					this.byId(sControlChain).setValueState(sValueState);
					this.byId(sControlChain).setValueStateText(sValueStateText);
					this.storeValidateControlStatus(bValidationError, this.byId(sControlChain));
				}
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		_validateCorrectPassword: function(oInput) {
			var oTextBundle = this.getTextResourceBundle();
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var rexPassWord = /^[a-zA-Z]\w{5,17}$/;
			try {
				if (!oInput.getValue().match(rexPassWord)) {
					throw new ValidateException(oTextBundle.getText("INVALID_PASSWORD"));
				}
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		onFirstNameChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				// this._validateName(oInput, "FIRST_NAME");
			}
		},
		onLastNameChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				// this._validateName(oInput, "LAST_NAME");
			}
		},
		_validateName: function(oInput, sName) {
			var oTextBundle = this.getTextResourceBundle();
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var rexName = /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/;
			var sText = "INVALID_" + sName;
			try {
				if (!oInput.getValue().match(rexName)) {
					throw new ValidateException(oTextBundle.getText(sText));
				}
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		onPasswordChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				bValidError = this._validateCorrectPassword(oInput);
			}
			if (!bValidError) {
				this._validateSamePassword(oInput, "INNO_MANAGER_REPASSWORD");
			}
		},
		onTechUserPasswordChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				bValidError = this._validateCorrectPassword(oInput);
			}
			if (!bValidError) {
				this._validateSamePassword(oInput, "TECH_USER_REPASSWORD");
			}
		},
		onVerifyPasswordChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				this._validateSamePassword(oInput, "INNO_MANAGER_PASSWORD");
			}

		},
		onTechUserVerifyPasswordChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				this._validateSamePassword(oInput, "TECH_USER_PASSWORD");
			}
		},
		onChangePackageName: function(oEvent) {
			var oInput = oEvent.getSource();
			var bValidError = this._validateInput(oInput);
			if (!bValidError) {
				this._validateCorrectPackageName(oInput);
			}

		},
		_validateCorrectPackageName: function(oInput) {
			var oTextBundle = this.getTextResourceBundle();
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var rexPacageName = /^([a-z]+\.?[a-z])+$/;
			try {
				if (!oInput.getValue().match(rexPacageName)) {
					throw new ValidateException(oTextBundle.getText("INVALID_PACKAGE_NAME"));
				}
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		_validateInput: function(oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var sValueStateText = "";
			var oBinding = oInput.getBinding("value");

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
				sValueStateText = oException.message;
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			this.storeValidateControlStatus(bValidationError, oInput);
			return bValidationError;
		},
		storeValidateControlStatus: function(bError, oControl) {
			var aNewValidate = [];
			var i;
			if (bError) {
				for (i = 0; i < this._validateErrorArray.length; i++) {
					if (this._validateErrorArray[i].getId() !== oControl.getId()) {
						aNewValidate.push(this._validateErrorArray[i]);
					}
				}
				aNewValidate.push(oControl);
			} else {
				for (i = 0; i < this._validateErrorArray.length; i++) {
					if (this._validateErrorArray[i].getId() !== oControl.getId()) {
						aNewValidate.push(this._validateErrorArray[i]);
					}
				}
			}
			this._validateErrorArray = aNewValidate;
		},
		callServiceToProcess: function(aActions) {
			if (aActions.length === 0) {
				return;
			}
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sAction = aActions[0];
			var oModel = this.getView().getModel("installation");
			var oServiceNameControl = this.getServiceNameControl(sAction);
			if (sAction === "SET_SYS_CONFIG" || sAction === "SET_SYS_CACHE" || sAction === "SET_SYS_TIMEOUT") {
				this.callSystemSettingService(aActions, oServiceNameControl.controlID, oServiceNameControl.serviceName);
			}
			var oMessageObject = {
				status: "",
				message: ""
			};
				var that = this;
			if (sAction !== "SET_UP_JOBS" && sAction !== "SET_SYS_CONFIG" && sAction !== "SET_SYS_CACHE" && sAction !== "SET_SYS_TIMEOUT") {

				var oControl = this.byId(oServiceNameControl.controlID);
				oControl.setBusy(true);
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
					oControl.setBusy(false);
					//For test usage
					// 	if (sAction === that.sRandomAction) {
					// 	oResponseBody.success = false;
					// 	oResponseBody.msg = "Msg ERROR test Successfully";
					// 	} 

					if (oResponseBody.success) {
						var iStatus = 1;
						if (oResponseBody.status) {
							iStatus = oResponseBody.status;
						}
						oMessageObject = {
							status: iStatus,
							message: oResponseBody.msg
						};
						if (sAction === "REVOKE_TIMEOUT") {
							oRouter.navTo("installationCreateSuccess");
						} else {
							aActions.shift(0, 1);
							that.callServiceToProcess(aActions);
						}
					} else {
						var sMsg = oResponseBody.msg;
						if (sAction === "RESTART_DB") {
							sMsg = that.getTextResourceBundle().getText("MSG_RESTART_DB_MSG");
						}
						oMessageObject = {
							status: 2,
							message: sMsg
						};
					}

					oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);
				});
				oAjaxPromise.fail(function(oResponse) {
					oControl.setBusy(false);
					oMessageObject = {
						status: 2,
						message: oResponse.message
					};
					oModel.setProperty("/" + oServiceNameControl.controlID, oMessageObject);
				});

			}
			if (sAction === "SET_UP_JOBS") {
				var aJobs = ["sap.ino.xs.batch::attachment_cleanup",
			                    "sap.ino.xs.batch::completed_campaigns_to_all_users",
			                    "sap.ino.xs.batch::consumptionReport",
			                    "sap.ino.xs.batch::delete_expired_users",
			                    "sap.ino.xs.batch::evaluation_request_expire",
			                    "sap.ino.xs.batch::feed",
			                    "sap.ino.xs.batch::feed_email",
			                    "sap.ino.xs.batch::feed_inst_email",
			                    "sap.ino.xs.batch::identity_email",
			                    "sap.ino.xs.batch::integration_deletion",
			                    "sap.ino.xs.batch::integration_update_external_object",
			                    "sap.ino.xs.batch::notification",
			                    "sap.ino.xs.batch::notification_deletion",
			                    "sap.ino.xs.batch::notification_mail",
			                    "sap.ino.xs.stestdfdsfdsfdsf",
			                    "sap.ino.xs.batch::anonymous_actor",
			                    "sap.ino.xs.batch::setup_hints",
			                    "sap.ino.xs.batch::tracker"];
			    var oDataModel = new JSONModel();
			    var sJobOdatUrl = this.getBackendRootURL() + "/sap/hana/xs/admin/jobs/service/jobs.xsodata/Jobs";
			    oDataModel.loadData(sJobOdatUrl,true);
			    
			oDataModel.attachRequestCompleted(function( aData) {
             var aAllJobs = aData.getSource().getProperty("/d/results");
             aJobs = aJobs.filter(function(sJob){
                return aAllJobs.filter(function(item){
                       return item.NAME === sJob;   
                }).length > 0;
             });
             that.callSetUpJobsService(aActions, aJobs, oServiceNameControl.controlID, oServiceNameControl.serviceName);	            
			});			    
						
			}
		},
		callSetUpJobsService: function(aActions, aJobs, sControlID, sServiceName) {
			var that = this;
			var oModel = this.getView().getModel("installation");

			//For test Usage
			// 			var aJobs = [
			//                         "sap.ino.xs.batch::delete_expired_users",
			//                         "sap.ino.xs.batch::integration_deletion",
			//                         "sap.ino.xs.batch::integration_update_external_object"];
			// this.sRandomJob = aJobs[Math.floor((Math.random() * aJobs.length))];				
			var sURL = this.getBackendRootURL() + sServiceName;
			var oControl = this.byId(sControlID);
			oControl.setBusy(true);
			var oFromData = oModel.getProperty("/FORM_DATA");
			var oMessageObject = {
				status: "",
				message: ""
			};

			var oJobInfo = {
				"USER": oFromData.TECH_USER_ACCOUNT,
				"STATUS": true,
				"START_TIME": "",
				"NAME": "",
				"LOCALE": "en",
				"SESSION_TIMEOUT": "0",
				"END_TIME": "",
				"PASSWORD": oFromData.TECH_USER_PASSWORD
			};

			oJobInfo.NAME = aJobs[0];

			let oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify(oJobInfo),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: true
			});
			oAjaxPromise.done(function(oResponseBody) {
				if (aJobs.length === 1) {
					oControl.setBusy(false);
				}
				if (oResponseBody.success) {
					var iStatus = 1;
					if (oResponseBody.status) {
						iStatus = oResponseBody.status;
					}
					oMessageObject = {
						status: iStatus,
						message: oResponseBody.message
					};
					if (aJobs.length > 1) {
						aJobs.shift(0, 1);
						that.callSetUpJobsService(aActions, aJobs, sControlID, sServiceName);
					} else {
						var oActionInfo = {
							"actionCode": "SET_UP_JOBS",
							"status": 1,
							"msg": "Setup jobs successfully"
						};

						var oAjaxLogService = that.callLogService(oActionInfo);
						oAjaxLogService.done(function(oResult) {
							aActions.shift(0, 1);
							that.callServiceToProcess(aActions);
						});

					}
				} else {
					var oActionError = {
						"actionCode": "SET_UP_JOBS",
						"status": 2,
						"msg": aJobs[0] + ":" + oResponseBody.message
					};
				   
					var oAjaxLogServiceError = that.callLogService(oActionError);
					oAjaxLogServiceError.done(function(oResult) {

					});
					oControl.setBusy(false);
					oMessageObject = {
						status: 2,
						message: aJobs[0] + ":" + oResponseBody.message
					};
				}
				//For test usage
				// 	if (aJobs[i] === that.sRandomJob) {
				// 		oMessageObject = {
				// 			status: 2,
				// 			message: "Test Job Failed"
				// 		};
				// 	}
				oModel.setProperty("/" + sControlID, oMessageObject);

			});
			oAjaxPromise.fail(function(oResponse) {
				oControl.setBusy(false);
				oMessageObject = {
					status: 2,
					message: oResponse.message
				};
				oModel.setProperty("/" + sControlID, oMessageObject);
			});
		},
		callLogService: function(oActionInfo) {
			var oAjaxLogService = jQuery.ajax({
				url: this.getBackendRootURL() + "/sap/ino/xs/rest/installation/logService.xsjs/log",
				headers: {
					"X-CSRF-Token": this._xCSRFToken
				},
				data: JSON.stringify(oActionInfo),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: true
			});
			return oAjaxLogService;
		},
		callSystemSettingService: function(aActions, sControlID, sServiceName) {
			var that = this;
			var sAction = aActions[0];
			var oModel = this.getView().getModel("installation");
			var oControl = this.byId(sControlID);
			oControl.setBusy(true);
			var oMessageObject = {
				status: "",
				message: ""
			};
			var sActionControlID = sControlID + sAction;
			var sURL = this.getBackendRootURL() + "/sap/ino/xs/rest/installation/installationService.xsjs/" + sServiceName;
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
				if (sAction === "SET_SYS_TIMEOUT") {
					oControl.setBusy(false);
				}
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
					that.callServiceToProcess(aActions);
				} else {
					oMessageObject = {
						status: 2,
						message: oResponseBody.msg
					};
				}
				if (that.sRandomAction === sAction) {
					oMessageObject = {
						status: 2,
						message: "System Msg Test"
					};
				}
				oModel.setProperty("/" + sActionControlID, oMessageObject);
			});
			oAjaxPromise.fail(function(oResponse) {
				oControl.setBusy(false);
				oMessageObject = {
					status: 2,
					message: oResponse.message
				};
				oModel.setProperty("/" + sActionControlID, oMessageObject);
			});
		},
		showMessageDetail: function(oEvent) {
			var oSource = oEvent.getSource();
			if (!this.oErrorMessageDialog) {
				var oText = new Text();
				oText.setText(oSource.getCustomData()[0].getValue());
				this.oErrorMessageDialog = new Dialog({
					title: this.getTextResourceBundle().getText("ERROR_MESSAGE_TEXT_TITLE"),
					contentWidth: "50%",
					contentHeight: "50%",
					content: [oText],
					buttons: new Button({
						type: "Emphasized",
						text: "OK",
						press: function() {
							this.oErrorMessageDialog.close();
						}.bind(this)
					})
				});
				//this.getView().addDependent(this.oErrorMessageDialog);
			}

			this.oErrorMessageDialog.open();
		},
		getInitalObjectForCreation: function() {

			var oInitObject = {
				"INNO_MANAGER_ACCOUNT": "INNO_SYSTEM_MANAGER_1",
				"INNO_MANAGER_FIRST_NAME": "",
				"INNO_MANAGER_LAST_NAME": "",
				"INNO_MANAGER_PASSWORD": "",
				"INNO_MANAGER_REPASSWORD": "",
				"INNO_MANAGER_EMAIL": "",
				"TECH_USER_ACCOUNT": "INNO_TECH_USER_1",
				"TECH_USER_PASSWORD": "",
				"TECH_USER_REPASSWORD": "",
				"SMTP_SERVER": "",
				"SMTP_PORT": null,
				"EMAIL_SENDER": "",
				"INTERNAL_HOST": "",
				"EXTERNAL_HOST": "",
				"PACKAGE_NAME": "",
				"PERFORMANCE": {
					"TIME_OUT": null,
					"THRESHOLD_FACTOR": null,
					"CACHE_ENABLE": null,
					"WHITE_LIST": null,
					"RECOMPILATION_ENABLED": null,
					"CACHE_SIZE": null,
					"PLAN_CACHE_SIZE": null
				}
			};
			return oInitObject;
		},
		onComboBoxChange: function(oEvent) {
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("installation");
			var oSelectedKey = oSource.getSelectedKey();
			if (oSelectedKey === "yes") {
				oModel.setProperty("/FORM_DATA/PERFORMANCE/WHITE_LIST", '"SAP.INO".*');
			} else {
				oModel.setProperty("/FORM_DATA/PERFORMANCE/WHITE_LIST", '');
			}

		}
	});
});