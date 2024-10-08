/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.EvaluationModelStage");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

sap.ui.controller("sap.ui.ino.views.backoffice.config.EvaluationModelModify", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController, {

	mMessageParameters: {
		group: "configuration_evaluation",
		save: {
			success: "MSG_MODEL_SAVED"
		},
		del: {
			success: "MSG_MODEL_DELETED", // text key for delete success message
			title: "BO_MODEL_TIT_DEL", // text key for dialog title
			dialog: "BO_MODEL_INS_DEL" // text key for dialog message
		}
	},

	createModel: function(iId) {
		if (this.oModel == null) {
			this.oModel = new sap.ui.ino.models.object.EvaluationModelStage(iId > 0 ? iId : undefined, {
				actions: ["modify", "del"],
				nodes: ["Root", "Criterion"],
				continuousUse: true,
				concurrencyEnabled: true
			});
		}

		// this binding to the unnamed global model is used for read-only facets like comments, evaluations
		// where data is not contained in the Application Object model
		if (iId && iId > 0) {
			this.getView().bindElement("/StagingEvaluationModel(" + iId + ")");
		}

		return this.oModel;
	},

	onInit: function() {
		sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
		this.triggerRefreshOnClose = false;
	},

	validFormula: function(sFormula, aCriterion) {
		var regex = /\$([^+\-*\/\s\)\(,]+)/gm;
		var m;
		if (!sFormula) {
			return true;
		}
		if (!aCriterion || aCriterion.length <= 0) {
			return false;
		}
		while ((m = regex.exec(sFormula)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			if (!m || m.length !== 2 || !this.isExistsCode(aCriterion, m[1])) {
				return false;
			}
		}
		var sFormulaExpress = sFormula.replace(regex, 10),
			result;
		try {
			result = Number.isNaN(Number(window.eval(sFormulaExpress)));
		} catch (ex) {
			return false;
		}
		return result === false;
	},

	isExistsCode: function(aCriterion, sKey) {
		var result = false;
		for (var index = 0; index < aCriterion.length; index++) {
			if (aCriterion[index].children && this.isExistsCode(aCriterion[index].children, sKey)) {
				return true;
			}
			if (aCriterion[index].PLAIN_CODE !== sKey) {
				continue;
			}
			if (aCriterion[index].DATATYPE_CODE === "INTEGER" || aCriterion[index].DATATYPE_CODE === "NUMERIC") {
				return true;
			}
		}
		return result;
	},

	onSave: function() {
		this.getView().resetBindingLookup();
		var oView = this.getView(),
			oMessage;
		if (!this.getModel("applicationObject").getProperty("/CALC_FORMULA") && this.getModel("applicationObject").getProperty(
			"/ENABLE_FORMULA")) {
			oMessage = oView.addBackendMessage({
				MESSAGE: "MSG_REQUIRE_CAL_FORMULA",
				PARAMETERS: [this.getModel("applicationObject").getProperty("/CALC_FORMULA")],
				REF_FIELD: "CALC_FORMULA",
				REF_NODE: "Root",
				TYPE: "E"
			}, this.mMessageParameters.group);
			sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
			return void 0;
		}
		var aCriterion = this.getModel("applicationObject").getProperty("/Criterion");
		if (!this.validFormula(this.getModel("applicationObject").getProperty("/CALC_FORMULA"), aCriterion)) {
			oMessage = oView.addBackendMessage({
				MESSAGE: "MSG_INVALID_CAL_FORMULA",
				PARAMETERS: [this.getModel("applicationObject").getProperty("/CALC_FORMULA")],
				REF_FIELD: "CALC_FORMULA",
				REF_NODE: "Root",
				TYPE: "E"
			}, this.mMessageParameters.group);
			sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
			return void 0;
		}
		var that = this, isValid = true;
		aCriterion.forEach(function(oCriterion) {
			if (oCriterion.AGGREGATION_TYPE === "FORMULA" && !that.validFormula(oCriterion.FORMULA, aCriterion)) {
				oMessage = oView.addBackendMessage({
					MESSAGE: "MSG_INVALID_CAL_FORMULA",
					PARAMETERS: [oCriterion.FORMULA],
					REF_FIELD: "FORMULA",
					REF_NODE: "Criterion",
					REF_ID: oCriterion.ID,
					TYPE: "E"
				}, that.mMessageParameters.group);
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
				isValid = false;
			}
		});
        if(!isValid){
            return void 0;
        }
		return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
	},

	shouldTriggerRefreshOnClose: function() {
		return this.triggerRefreshOnClose;
	},

	onCriterionSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {
		var oView = this.getView();
		if (iSelectedIndex >= 0) {
			oView._oDeleteButton.setEnabled(true);
		} else {
			oView._oDeleteButton.setEnabled(false);
		}
	},

	onCriterionCreatePressed: function() {
		this.getEvaluationModel().addCriterion();
		var oView = this.getView();
		var iLength = oView.oTable.getBindingInfo("rows").binding.getLength();
		setTimeout(function() {
			jQuery.sap.byId(oView.oTable.getRows()[iLength - 1].getCells()[0].getId()).focus();
		}, 250);
	},

	onCriterionDeletePressed: function(oEvent) {
		var aSelectedRowContext = this.getView().getSelectedRowContexts();
		var aCriterion = [];
		jQuery.each(aSelectedRowContext, function(i, selectedRowContext) {
			aCriterion.push(selectedRowContext.getObject());
		});
		var oEvaluationModel = this.getEvaluationModel();
		jQuery.each(aCriterion, function(i, oCriterion) {
			oEvaluationModel.removeCriterion(oCriterion);
		});
		this.getView().oTable.clearSelection();
	},

	scrollToTop: function() {
		var oView = this.getView();
		jQuery(oView.oDialog.getDomRef()).find(".sapUiDlgCont").animate({
			scrollTop: 0
		});
	}
}));