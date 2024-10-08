/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.models.object.NotificationSystemSetting");

sap.ui.controller("sap.ui.ino.views.backoffice.config.NotificationAction", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_sys_notification",
			save: {
				success: "MSG_NOTIFICATION_SETTING_SAVED"
			}
		},

		createModel: function(iId) {
			var that = this;
			var aActions = ["read", "update", "modify"];
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.NotificationSystemSetting(iId, {
					actions: aActions,
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
				this.oModel.getDataInitializedPromise().done(function() {
					var oTI = that.getView().getInspector();
					if (oTI) {
						var oFacetController = that.getFacet(that.selectedFacet).getController();
						if (oFacetController.handleShowPreview) {
							oFacetController.handleShowPreview();
							that.oModel.attachPropertyChange(oFacetController.handleAppModelPropertyChange, oFacetController);
						}
					}
					if (that.oModel) {
						var oTempReceivers = that.oModel.getProperty("/Receivers");
						if (oTempReceivers) {
							oTempReceivers.forEach(function(oReceiver) {
								oReceiver.ROLE_NAME = that.getView().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + oReceiver.ROLE_CODE);
							});
							oTempReceivers.sort(function(oPrev, oNext) {
								if (oPrev.ROLE_NAME > oNext.ROLE_NAME) {
									return 1;
								} else if (oPrev.ROLE_NAME < oNext.ROLE_NAME) {
									return -1;
								} else {
									return 0;
								}
							});
							if (that.oModel._oBeforeData) {
            					that.oModel._oBeforeData.Receivers = jQuery.extend(true, [], oTempReceivers);
            				}
						}
					}
				});
			}
			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		},

		onSave: function() {
			var oAppData = this.oModel.getData();
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages('notifiction_sys_settting', sap.ui.core.MessageType
				.Error);
			if (["SYSTEM", "FOLLOW"].indexOf(this.getView()._sActionType) > -1 && oAppData.receivedRoles.length === 0) {
				var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(new sap.ui.ino.application.Message({
					key: 'notifiction_sys_settting_receivers',
					level: sap.ui.core.MessageType.Error,
					parameters: [],
					group: 'notifiction_sys_settting',
					text: oMsg.getResourceBundle().getText('MSG_NOTIFICATION_SETTING_RECEIVERS_EMPTY')
				}));
				return;
			}
			if (oAppData.STANDARD) {
				this.oModel.setProperty("/ID", -1);
				this.oModel._isNew = undefined;
			}
			sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
		}
	}));