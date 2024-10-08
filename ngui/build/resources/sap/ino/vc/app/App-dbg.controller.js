sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/MessageType",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration"
], function(BaseController, MessageBox, MessageType, Device, Configuration) {
	"use strict";

	/**
	 * Constructor for the UI basis of the application.
	 *
	 * Holding the general setup. Setting up models etc.
	 *
	 * @class Holding the UI5 App responsible for navigation etc..
	 * @extends sap.ino.vc.commons.BaseController
	 * @version 1.3.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ino.vc.app.App
	 */
	return BaseController.extend("sap.ino.vc.app.App", {

		_iBusyDelay: 1000,
		_mVisitedRoutes: {},

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			//attach close event to record user action for system message
			var oSystemMessage = this.byId("systemMessage");
			oSystemMessage.attachClose(function() {
				oSystemMessage.data("msgClosed", true);
				this.getParent().getController()._oComponent.getRootController().byId("innerShell").removeStyleClass("sapInoInnoMgmtMShellMsg");
			});
			if (Configuration.systemMessage()) {
				oSystemMessage.setText(Configuration.systemMessage());
			} else {
				//if the system message is not maintained, consider the message is closed
				oSystemMessage.data("msgClosed", true);
				oSystemMessage.setVisible(false);
			}
			//set module model 
			// 			var oModuleModel = this.getModuelModel();
			// 			this.getView().setModel(oModuleModel,"module");
		},

		getPages: function() {
			var oInnerShell = this.byId("innerShell");
			var oInnerApp = oInnerShell.getApp();
			return oInnerApp.getPages();
		},

		getCurrentPage: function() {
			var oInnerShell = this.byId("innerShell");
			var oInnerApp = oInnerShell.getApp();
			return oInnerApp.getCurrentPage();
		},

		onBypassed: function(oEvent) {
			this.showMessage(MessageType.ERROR, this.getModel("i18n").getResourceBundle().getText("NAVIGATION_EXP_UNKNOWN_TARGET"));
		},

		showMessage: function(eSeverity, sMessage, sTitle, onClose) {
			var oSeverity = this._getSeverity(eSeverity, sTitle);

			MessageBox.show(sMessage, {
				icon: oSeverity.icon,
				title: oSeverity.title,
				actions: [MessageBox.Action.OK],
				onClose: onClose ? onClose : undefined,
				styleClass: this.getDensityClass()
			});
		},

		showConfirmation: function(eSeverity, sMessage, sTitle, onClose) {
			var oSeverity = this._getSeverity(eSeverity, sTitle);

			MessageBox.confirm(sMessage, {
				icon: oSeverity.icon,
				title: oSeverity.title,
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: onClose ? onClose : undefined,
				styleClass: this.getDensityClass()
			});
		},

		showDataLossPopup: function(fnNavigate) {
			var that = this;
			var confirmNavigation = function(oAction) {
				if (oAction === MessageBox.Action.OK) {
					that.resetPendingChanges();
					fnNavigate();
				}
				// TODO the url patter was already updated
				/*
                else {
                    var oRouter = that.getOwnerComponent().getRouter();
                    oRouter.silentReverse();
                }
                */
				else {
				    //For cancel Operation
					var oView = that.getCurrentPage();
					if (oView) {
						var oController = oView.getController();
						if (oController.cancelOperationAction) {
							oController.cancelOperationAction();
						}
					}

				}
			};
			this.showConfirmation(MessageType.QUESTION, this.getText("COMMON_INS_DATALOSS"), this.getText("COMMON_TIT_DATALOSS"),
				confirmNavigation);
		},

		isNavigationAllowed: function() {
			var oView = this.getCurrentPage();
			if (oView) {
				var oController = oView.getController();
				if (oController.hasPendingChanges && oController.hasPendingChanges()) {
					return false;
				}
			}
			return true;
		},

		isCloseAllowed: function() {
			// To be called when a Browser Window/Tab is closed
			// The logic of this method is like this (this is defined by browser vendors)
			// If we return a value a popup when leaving the application is displayed.
			// The string we return is added to a default browser popup which cannot be
			// influenced by the application
			if (!this.isNavigationAllowed()) {
				return this.getText("COMMON_INS_DATALOSS");
			}
		},

		resetPendingChanges: function() {
			var oView = this.getCurrentPage();
			if (oView) {
				var oController = oView.getController();
				if (oController.resetPendingChanges) {
					oController.resetPendingChanges();
				}
			}
		},

		onBypassedNavigate: function() {
			var oBusyControl = this._oBusyElement || this.getView();

			oBusyControl.setBusy(false);
			oBusyControl.setBusyIndicatorDelay(this._iBusyDelay);
		},

		onAfterNavigate: function() {
			var oBusyControl = this._oBusyElement || this.getView();
			var that = this;
			// the transition takes some time, so delay the busy indicator removal
			setTimeout(function() {
				oBusyControl.setBusy(false);
				oBusyControl.setBusyIndicatorDelay(that._iBusyDelay);
			}, 500);
		},

		onBeforeNavigate: function(sRoute) {
			if (!this._oBusyElement) {
				if (this.getView().getDomRef()) {
					var $MainShell = jQuery(".sapInoInnoMgmtShell");
					if ($MainShell && $MainShell.length > 0) {
						// get the surrounding shell if we run as standalone application
						this._oBusyElement = sap.ui.getCore().getElementById($MainShell.attr("id") + "-container");
					}

					this._oBusyElement = this._oBusyElement || this.getView();
				}
				// else we are not yet rendered => try next time again
			}

			var oBusyControl = this._oBusyElement || this.getView();

			// set the indicator delay to 0 for the first navigation to each route
			// additional resources might need to be loaded (libs)
			// better would be the target, but we don't get this information
			if (!this._mVisitedRoutes[sRoute] && sRoute) {
				oBusyControl.setBusyIndicatorDelay(0);
				this._mVisitedRoutes[sRoute] = true;
			}
			oBusyControl.setBusy(true);

			var oCurrentPage = this.getCurrentPage();
			if (oCurrentPage && oCurrentPage.getController().onBeforeNavigateFrom) {
				oCurrentPage.getController().onBeforeNavigateFrom();
			}
		},

		onNavigate: function(oEvent) {
			var oFrom = oEvent.getParameter("from");
			var oFromController = oFrom.getController();
			if (oFromController.onNavigateFrom) {
				oFromController.onNavigateFrom(oEvent);
			}
			var oTo = oEvent.getParameter("to");
			var oToController = oTo.getController();
			if (oToController.onNavigateTo) {
				oToController.onNavigateTo(oEvent);
			}
		},

		_getSeverity: function(eSeverity, sTitle) {
			var oSeverity = {
				title: "",
				icon: undefined
			};
			switch (eSeverity) {
				case MessageType.ERROR:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_ERROR");
					oSeverity.icon = MessageBox.Icon.ERROR;
					break;
				case MessageType.INFORMATION:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_INFORMATION");
					oSeverity.icon = MessageBox.Icon.INFORMATION;
					break;
				case MessageType.SUCCESS:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_SUCCESS");
					oSeverity.icon = MessageBox.Icon.SUCCESS;
					break;
				case MessageType.QUESTION:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_QUESTION");
					oSeverity.icon = MessageBox.Icon.QUESTION;
					break;
				case MessageType.WARNING:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_WARNING");
					oSeverity.icon = MessageBox.Icon.WARNING;
					break;
				default:
					oSeverity.title = sTitle ? sTitle : this.getText("MESSAGE_TIT_NONE");
					oSeverity.icon = MessageBox.Icon.NONE;
					break;
			}
			return oSeverity;
		},

		openHelpScreen: function(sTextId) {
			var oComponent = this.getOwnerComponent();
			if (!this._oHelp) {
				this._oHelp = new sap.ui.core.mvc.XMLView({
					viewName: "sap.ino.vc.app.Help"
				});
				this._oHelp.setModel(oComponent.getModel("i18n"), "i18n");
				this._oHelp.setModel(oComponent.getModel("device"), "device");
			}
			this._oHelp.setModel(oComponent.getModel("help"), "help");
			this._oHelp.getController().show(sTextId ? this.getModel("i18n").getResourceBundle().getText(sTextId) : undefined);
		}
	});
});