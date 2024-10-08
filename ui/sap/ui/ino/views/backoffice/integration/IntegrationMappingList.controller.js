/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.object.SystemIntegration");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.integration.IntegrationMappingList",
	jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {
		getSettings: function() {
			var mSettings = {
				aRowSelectionEnabledButtons: ["BUT_EDIT", "BUT_DELETE", "BUT_SYNC"],
				mTableViews: {
					"staging": {
						"default": true,
						sBindingPathTemplate: "/SystemIntegration",
						oSorter: new sap.ui.model.Sorter("CHANGED_AT", true),
						aVisibleActionButtons: ["BUT_CREATE", "BUT_EDIT", "BUT_DELETE", "BUT_SYNC"],
						aVisibleColumns: ["TECH_NAME", "PACKAGE", "NAME", "TARGET_SYSTEM", "STATUS"]
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.SystemIntegration"
			};

			return mSettings;
		},
		
		onAfterInit: function() {
		    // get target system
			var oDeffered = sap.ui.ino.models.object.SystemIntegration.getAllDestinations();
			oDeffered.done(function(oResp) {
			    this.getView().setModel(new sap.ui.model.json.JSONModel(oResp.RESULT), "targetSystems");
			}.bind(this));
			// hide right tool bar items
			setTimeout(function() {
				this.getView()._oTable.getToolbar().getRightItems().forEach(function(oItem) {
					oItem.setVisible(false);
				});
			}.bind(this), 0);
		},
		
		formatTargetSystemName: function(sSystemName, aAllTargetSystem) {
		    var oTargetSystem = aAllTargetSystem.filter(function(oSystem) {
		        return oSystem.standardName === sSystemName;
		    })[0];
		    if (oTargetSystem) {
		        return oTargetSystem.destName;
		    } else {
		        return "";
		    }
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
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMapping");
			var sMode = "display";
			if (bEdit === true) {
				sMode = "edit";
			}
			oModifyView.show(iId, sMode);
		},
		
		_showDetailsView : function(oSelectedRowContext) {
            var oSelectedRowObj = oSelectedRowContext.oModel.getProperty(oSelectedRowContext.sPath);
            var oDetailsView = this.getView()._oDetailsView;
            var aAllTargetSystem = this.getView().getModel("targetSystems").getData() || [];
            var oTargetSystem;
            if (!oSelectedRowObj.SYSTEM_HOST && !oSelectedRowObj.SYSTEM_PORT) {
                oTargetSystem = aAllTargetSystem.filter(function(oSystem) {
                    return oSystem.standardName === oSelectedRowObj.SYSTEM_NAME;
                })[0];
                if (oTargetSystem) {
                    oSelectedRowObj.SYSTEM_HOST = oTargetSystem.destHost ? oTargetSystem.destHost + ':' + oTargetSystem.destPort + oTargetSystem.destPathPrefix : '';
                    oSelectedRowObj.SYSTEM_NAME_EXTEND = oTargetSystem.destName;
                }
            }
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

		handleEdit: function() {
			this.onNavigateToModel(undefined, true);
		},
        
        handleSync: function() {
            sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("integration_mapping_list");

			var iTechnicalName = this.getSelectedRowObject() ? this.getSelectedRowObject().TECHNICAL_NAME : '';
			if (!iTechnicalName) {
				return;
			}

			var that = this;

			function syncInstance(bResult) {
				if (bResult) {
					var oDeleteRequest = sap.ui.ino.models.object.SystemIntegration.syncMappingField({
					    TECHNICAL_NAME : iTechnicalName
					});
					that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
					oDeleteRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_INTEGRATION_MAPPING_SYNCHRONIZED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "integration_mapping_list",
							text: oMsg.getResourceBundle().getText("MSG_INTEGRATION_MAPPING_SYNCHRONIZED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_INTEGRATION_MAPPING_INS_SYNC"),
				syncInstance, oBundle.getText("BO_INTEGRATION_MAPPING_TIT_SYNC"));
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
					var oDeleteRequest = sap.ui.ino.models.object.SystemIntegration.del(iId);
					that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
					oDeleteRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_INTEGRATION_MAPPING_DELETED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "integration_mapping_list",
							text: oMsg.getResourceBundle().getText("MSG_INTEGRATION_MAPPING_DELETED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_INTEGRATION_MAPPING_INS_DEL"),
				deleteInstance, oBundle.getText("BO_INTEGRATION_MAPPING_TIT_DEL"));
		}
	}));