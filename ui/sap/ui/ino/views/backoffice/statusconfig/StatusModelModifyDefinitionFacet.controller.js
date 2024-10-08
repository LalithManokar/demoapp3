/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {

		onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {

			if (iSelectedIndex >= 0) {
				this.getView().setTransitionContext(oSelectedRowContext);
				this.updateButtonVisible(iSelectedIndex);
			} else {
				this.getView().setTransitionContext(null);
				this.updateButtonInvisible();
			}
		},
		onStatusCreatePressed: function(oEvent) {
			var oModel = this.getModel();
			var iHandle = oModel.addTransition();

			if (iHandle !== 0) {
				this.getView().setTransitionContextByID(iHandle);
			}
		},
		onStatusDeletePressed: function(oEvent, oSelectedRowContext) {
			if (!oSelectedRowContext) {
				var oTextModel = this.getTextModel();
				jQuery.sap.log.error(oTextModel.getText("BO_STATUS_MODEL_ADMINISTRATION_INS_SELECT_CRITERION"));
				return;
			}
			var oStatus = oSelectedRowContext.getObject();
			var oModel = this.getModel();

			this.getView().oTransitionTable.setSelectedIndex(-1);
			oModel.removeTransition(oStatus);
			this.getView().oTransitionDetailLayout.destroyRows();
		},
		onStatusUpPressed: function(oEvent, oSelectedRowContext) {
			if (!oSelectedRowContext) {
				var oTextModel = this.getTextModel();
				jQuery.sap.log.error(oTextModel.getText("BO_STATUS_MODEL_ADMINISTRATION_INS_SELECT_CRITERION"));
				return;
			}
			var oStatus = oSelectedRowContext.getObject();
			var oModel = this.getModel();
			oModel.moveUpTransition(oStatus);
			this.getView().setTransitionContextByID(oStatus.ID);

		},
		onStatusDownPressed: function(oEvent, oSelectedRowContext) {
			if (!oSelectedRowContext) {
				var oTextModel = this.getTextModel();
				jQuery.sap.log.error(oTextModel.getText("BO_STATUS_MODEL_ADMINISTRATION_INS_SELECT_CRITERION"));
				return;
			}
			var oStatus = oSelectedRowContext.getObject();
			var oModel = this.getModel();
			oModel.moveDownTransition(oStatus);
			this.getView().setTransitionContextByID(oStatus.ID);
		},
		onLiveChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
		},

		onAfterModelAction: function() {
			this.getView().refreshTransitionDetailContent();
		},

		formatIdeaStatus: function(sStatus) {
			return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Status.Root", sStatus);
		},

		formatIdeaAction: function(sAction) {
			return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", sAction);
		},
		formatCode: function(sCode) {
			return sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sCode);
		},
		updateButtonVisible: function(iIdx) {
			var bEdit = this.isInEditMode();
			var bNew = this.getModel().isNew();
			if (!bNew && this.getModel().getPropertyModel()) {
				bNew = !this.getModel().getPropertyModel().getProperty("/actions/update/customProperties/bModelUsed");
			}
			if (bEdit && bNew) {
				var aRows = this.getModel().oData.Transitions;
				var oView = this.getView();
				if (iIdx === 0) {
					if (aRows.length === 1) {
						oView._oDeleteButton.setEnabled(true);
						oView._oUpButton.setEnabled(false);
						oView._oDownButton.setEnabled(false);
					} else {
						oView._oDeleteButton.setEnabled(true);
						oView._oUpButton.setEnabled(false);
						oView._oDownButton.setEnabled(true);
					}

				} else if (iIdx === aRows.length - 1 && aRows.length !== 1) {
					oView._oDeleteButton.setEnabled(true);
					oView._oUpButton.setEnabled(true);
					oView._oDownButton.setEnabled(false);
				} else {
					oView._oDeleteButton.setEnabled(true);
					oView._oUpButton.setEnabled(true);
					oView._oDownButton.setEnabled(true);
				}
			}
		},
		updateButtonInvisible: function() {
			var bEdit = this.isInEditMode();
			var oView = this.getView();
			var bNew = this.getModel().isNew();
			if (!bNew && this.getModel().getPropertyModel()) {
				bNew = !this.getModel().getPropertyModel().getProperty("/actions/update/customProperties/bModelUsed");
			}
			if (bEdit && bNew) {
				oView._oDeleteButton.setEnabled(false);
				oView._oUpButton.setEnabled(false);
				oView._oDownButton.setEnabled(false);
			}
		},
		onDecisionChange: function(oEvent) {
			var oView = this.getView();
			var oModel = this.getModel();
			var oDecisionListRow = oView.oDecisionListRow;
			var oContent = oView.oTransitionDetailLayout;
			var sPath = oContent.oBindingContexts.applicationObject.sPath;
			if (oEvent.mParameters.checked) {
				oContent.insertRow(oDecisionListRow, 5);
			} else {
				oContent.removeRow(oDecisionListRow);
				oModel.setProperty(sPath + "/DECISION_REASON_LIST_CODE", "");
			}

		},
		onIncludeRespChange: function(oEvent) {
			var oView = this.getView();
			var oModel = this.getModel();
			var oTextModuleListRow = oView.oTextModuleListRow;
			var oContent = oView.oTransitionDetailLayout;
			var sPath = oContent.oBindingContexts.applicationObject.sPath;
			if (oEvent.mParameters.checked) {
				oContent.addRow(oTextModuleListRow);
			} else {
				oContent.removeRow(oTextModuleListRow);
				oModel.setProperty(sPath + "/TEXT_MODULE_CODE", "");
			}

		},
		onEnterEditMode: function(newMode) {
			var oView = this.getView();
			oView.oTextModuleField = null;
			oView.oValueHelpField = null;
		}

	}));