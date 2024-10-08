/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.Dimension");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.views.backoffice.gamification.DimensionValidMixin");

sap.ui.controller("sap.ui.ino.views.backoffice.gamification.Dimension", jQuery.extend({},
	sap.ui.ino.views.backoffice.gamification.DimensionValidMixin,
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_gamification",
			save: {
				success: "MSG_GAMIFICATION_DIMENSION_SAVED"
			},
			del: {
				success: "MSG_GAMIFICATION_DIMENSION_DELETED", // text key for delete success message
				title: "BO_GAMIFICATION_DIMENSION_TIT_DEL", // text key for dialog title
				dialog: "BO_GAMIFICATION_DIMENSION_INS_DEL" // text key for dialog message
			}
		},

		createModel: function(iId) {
			var that = this;
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.Dimension(iId > 0 ? iId : undefined, {
					actions: ["read", "modify", "create", "del", "update"],
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
				that.oModel.setProperty("/LoadPhase", false);
				var Configuration = sap.ui.ino.application.Configuration;
				var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
				var oPhaseModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
					"/StagingPhase?$skip=0&$top=1000&$orderby=DEFAULT_TEXT%20asc&$SELECT=DEFAULT_TEXT,CODE");
				oPhaseModel.attachRequestCompleted(oPhaseModel, function() {
					var oData = oPhaseModel.getProperty("/d/results");
					that.oModel.setProperty("/LoadPhase", true);
					oData.unshift({
						"CODE": "",
						"DEFAULT_TEXT": ""
					});
					jQuery.each(oData,function(index,oPhase){
					    oPhase.DISPLAY = true;
					});
					var oTI = that.getView().getInspector();
					if (oTI) {
						oTI.setModel(new sap.ui.model.json.JSONModel(oData), "AllPhases");
					}
				}, this);
				
				var oDeffered = sap.ui.ino.models.object.Dimension.getAllActivities();
				oDeffered.done(function(oData) {
					var aActivity = oData.RESULT;
					if (aActivity && aActivity.length > 0) {
						aActivity.forEach(function(oActivity) {
							oActivity.NAME = that.getTextModel().getText("BO_GAMIFICATION_DIMENSION_ACTIVITY_" + oActivity.CODE);
						});
						aActivity.unshift({
							"CODE": "",
							"PHASE_CONFIGURABLE": false,
							"TIME_CONFIGURABLE": false,
							"NAME": ""
						});
					}
					var oTI = that.getView().getInspector();
					if (oTI) {
						oTI.setModel(new sap.ui.model.json.JSONModel(aActivity), "AllActivities");
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
			if (!this.valid()) {
				return;
			}
			var oModel = this.getModel();
			oModel.setProperty("/AllActivities", this.getView().getInspector().getModel("AllActivities").getProperty("/"));
			sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
		}

	}));