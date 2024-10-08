/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.object.Dimension");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.gamification.DimensionList",
	jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {
		getSettings: function() {
			var mSettings = {
				aRowSelectionEnabledButtons: ["BUT_COPY", "BUT_EDIT", "BUT_DELETE"],
				mTableViews: {
					"staging": {
						"default": true,
						sBindingPathTemplate: "/SearchDimensionFullParams(searchToken='{searchTerm}')/Results",
						oSorter: new sap.ui.model.Sorter("NAME", true),
						aVisibleActionButtons: ["BUT_CREATE", "BUT_COPY", "BUT_EDIT", "BUT_DELETE"],
						aVisibleColumns: ["NAME", "TECHNICAL_NAME", "STATUS", "REDEEM", "DESCRIPTION", "UNIT"]
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.Dimension"
			};

			return mSettings;
		},

		onAfterInit: function() {
			// hide right tool bar items
			setTimeout(function() {
				this.getView()._oTable.getToolbar().getRightItems().forEach(function(oItem) {
					oItem.setVisible(false);
				});
			}.bind(this), 0);
		},

		hasPendingChanges: function() {
			if (this.oActiveDialog) {
				return this.oActiveDialog.getContent()[0].hasPendingChanges();
			}
			return false;
		},

		onNavigateToModel: function(iId, bEdit) {
			if (!iId) {
				iId = this.getSelectedId();
			}
			if (!iId) {
				return;
			}
			this._hideDetailsView();
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.Dimension");
			var sMode = "display";
			if (bEdit === true) {
				sMode = "edit";
			}
			oModifyView.show(iId, sMode);
		},

		_showDetailsView: function(oSelectedRowContext) {
			var oDetailsView = this.getView()._oDetailsView;
			this._setDetailViewContext(oSelectedRowContext);
			if (oDetailsView && typeof oDetailsView.setVisible === "function") {
				oDetailsView.setVisible(true);
			}
		},

		updatePropertyModel: function() {
			var oSelectedRowContext = this.getSelectedRowContext();
			var oView = this.getView();
			var oPropertyModel;
			if (oSelectedRowContext) {
				oPropertyModel = new sap.ui.model.json.JSONModel({
					actions: {
						create: {
							enabled: true
						},
						update: {
							enabled: true
						},
						del: {
							enabled: true
						}
					}
				});
			} else {
				oPropertyModel = new sap.ui.model.json.JSONModel({
					actions: {
						create: {
							enabled: true
						},
						update: {
							enabled: false
						},
						del: {
							enabled: false
						}
					}
				});
			}
			oView.setModel(oPropertyModel, "property");
		},

		hanldeCreate: function() {
			this.onNavigateToModel(-1, true);
		},

		onCopyAsPressed: function() {
			var oView = this.getView();
			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			var oBindingContext = oView.getSelectedRowContext();
			if (oBindingContext) {
				var sPlainCode = oBindingContext.getObject().TECHNICAL_NAME;
				sPlainCode = sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sPlainCode);
				var sPrefix = oBundle.getText("BO_GAMIFICATION_DIMENSION_COPY_CODE_PREFIX");
				sPlainCode = sPrefix + sPlainCode;
				oView.oCopyAsCodeField.setValue(sPlainCode);
				oView.oCopyAsDialog.open();
			}
		},

		onCopyPressed: function(sCopyCode) {
			var iId = this.getSelectedId();
			if (!iId) {
				return;
			}
			var oView = this.getView();
			oView.setBusy(true);
			this._hideDetailsView();
			var that = this;

			var oCopyRequest = sap.ui.ino.models.object.Dimension.copy(iId, {
				ID: -1,
				TECHNICAL_NAME: sCopyCode
			});

			oCopyRequest.always(function() {
				oView.setBusy(false);
			});

			oCopyRequest.done(function(oResponse) {
			    that.onNavigateToModel(oResponse.GENERATED_IDS[-1], true);
				// that.openModifyDialog("{i18n>BO_GAMIFICATION_DIMENSION_TIT_DIALOG_MODIFY}", oResponse.GENERATED_IDS[-1], true);
				// wait a moment before displaying and rerendering
				setTimeout(function() {
					var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
					var oMessageParameters = {
						key: "MSG_GAMIFICATION_DIMENSION_COPIED",
						level: sap.ui.core.MessageType.Success,
						parameters: [],
						group: "gamification",
						text: oMsg.getResourceBundle().getText("MSG_GAMIFICATION_DIMENSION_COPIED")
					};

					var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
					var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
					oApp.addNotificationMessage(oMessage);
				}, 500);
				oView.oCopyAsDialog.close();
			});

			oCopyRequest.fail(function(oResponse) {
				oView.getController()._handleCopyFail(oResponse);
			});
		},

		_handleCopyFail: function(oResponse) {
			var oView = this.getView();
			var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "gamification");
			if (aActionMessages) {
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				jQuery.each(aActionMessages, function(iIndex, oActionMsg) {
					oActionMsg.setReferenceControl(oView.getCopyAsCodeField());
					oApp.addNotificationMessage(oActionMsg);
					oActionMsg.showValueState();
				});
			} else {
				var oMessageParameters = {
					key: "MSG_CAMPAIGN_TASK_COPY_FAILURE",
					level: sap.ui.core.MessageType.Error,
					parameters: [],
					group: "gamification",
					text: "MSG_CAMPAIGN_TASK_COPY_FAILURE"
				};
				var oMsgPara = new sap.ui.ino.application.Message(oMessageParameters);
				oApp.addNotificationMessage(oMsgPara);
				oView.getCopyAsDialog().close();
			}
		},

		handleEdit: function() {
			this.onNavigateToModel(undefined, true);
		},

		handleDelete: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("integration_mapping_list");

			var iId = this.getSelectedId();
			if (!iId) {
				return;
			}

			var that = this;

			function deleteInstance(bResult) {
				if (bResult) {
					var oDeleteRequest = sap.ui.ino.models.object.Dimension.del(iId);
					that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
					oDeleteRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_GAMIFICATION_DIMENSION_DELETED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "dimension_list",
							text: oMsg.getResourceBundle().getText("MSG_GAMIFICATION_DIMENSION_DELETED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_GAMIFICATION_DIMENSION_INS_DEL"),
				deleteInstance, oBundle.getText("BO_GAMIFICATION_DIMENSION_TIT_DEL"));
		}
	}));