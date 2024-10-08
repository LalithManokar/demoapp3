/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.controls.StatusModelViz");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignProcessFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

	onVotingTypeChanged: function(oEvent) {
		var oVoteType = oEvent.getParameters();
		var sKey = oVoteType.selectedItem.getProperty("key");

		if (sKey) {
			this.getModel().oData.VOTE_TYPE_CODE = sKey;
		}
	},

	onAfterModelAction: function(sActionName) {
		this.getView()._oTable.setSelectedIndex(-1);
	},

	onStatusModelSelectionChanged: function(oEvent) {
		var aPhases = this.getModel().getProperty("/Phases");
		var oObjectModel = this.getModel();
		var Configuration = sap.ui.ino.application.Configuration;
		var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
		var sPath = "/Phases/" + this.getView()._oTable.getSelectedIndex();
		var oSelectPhase = oObjectModel.getProperty(sPath);
		var aExistsPhase = null;
		aPhases.forEach(function(oPhase) {
			if (oPhase.STATUS_MODEL_CODE === oSelectPhase.STATUS_MODEL_CODE && oPhase.ID !== oSelectPhase.ID) {
				if (oPhase.CampaignNotificationStatus && oPhase.CampaignNotificationStatus.length > 0) {
					aExistsPhase = oPhase;
				}
			}
		});
		aPhases.forEach(function(phase) {
			if (phase.STATUS_MODEL_CODE === oEvent.getSource().getSelectedKey()) {
				if (aExistsPhase) {
					if (phase.ID !== aExistsPhase.ID) {
						phase.CampaignNotificationStatus = [];
						aExistsPhase.CampaignNotificationStatus.forEach(function(oItem) {
							phase.CampaignNotificationStatus.push({
								ID: oObjectModel.getNextHandle(),
								CAMPAIGN_PHASE_ID: phase.ID,
								STATUS_ACTION_CODE: phase.STATUS_MODEL_CODE,
								TEXT_MODULE_CODE: oItem.TEXT_MODULE_CODE
							});
						});
					}
				} else {
					var oTransitionModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
						"/StatusModelCode('" + phase.STATUS_MODEL_CODE + "')/Transitions");
					phase.CampaignNotificationStatus = [];
					oTransitionModel.attachRequestCompleted(oTransitionModel, function() {
						var oData = oTransitionModel.getProperty("/d/results");
						if (oData) {
							oData.forEach(function(oItem) {
								phase.CampaignNotificationStatus.push({
									ID: oObjectModel.getNextHandle(),
									CAMPAIGN_PHASE_ID: phase.ID,
									STATUS_ACTION_CODE: phase.STATUS_MODEL_CODE,
									TEXT_MODULE_CODE: oItem.INCLUDE_RESPONSE > 0 ? oItem.TEXT_MODULE_CODE : ""
								});
							});
						}
					});
				}
			}
		});

	},

	onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable, bEdit) {

		this._updateDetails(iSelectedIndex, oSelectedRowContext);

		/*
		 * TODO // remember current selection to display the correct value after mode switch
		 * this.getThingInspectorController()._iProcessSelectedIndex = iSelectedIndex;
		 */

		if (!bEdit) {
			return;
		}
		var oObjectModel = this.getModel();
		var aPhases = oObjectModel.getProperty("/Phases");

		var aIndex = [];
		aPhases.forEach(function(oPhase, i) {
			if (!oPhase.CampaignNotificationStatus || oPhase.CampaignNotificationStatus.length === 0) {
				oPhase.CampaignNotificationStatus = [];
				aIndex.push(i);
			}
		});
		if (aIndex.length > 0) {
			aIndex.forEach(function(iIndex) {
				var aExistsNotificationStatus = null;
				aPhases.forEach(function(oPhase) {
					if (oPhase.STATUS_MODEL_CODE === aPhases[iIndex].STATUS_MODEL_CODE) {
						if (oPhase.CampaignNotificationStatus && oPhase.CampaignNotificationStatus.length > 0) {
							aExistsNotificationStatus = oPhase.CampaignNotificationStatus;
						}
					}
				});
				if (aExistsNotificationStatus) {
					aPhases[iIndex].CampaignNotificationStatus = [];
					aExistsNotificationStatus.forEach(function(oItem) {
						aPhases[iIndex].CampaignNotificationStatus.push({
							ID: oObjectModel.getNextHandle(),
							CAMPAIGN_PHASE_ID: aPhases[iIndex].ID,
							STATUS_ACTION_CODE: aPhases[iIndex].STATUS_MODEL_CODE,
							TEXT_MODULE_CODE: oItem.TEXT_MODULE_CODE
						});
					});
				} else {
					var Configuration = sap.ui.ino.application.Configuration;
					var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
					var oTransitionModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
						"/StatusModelCode('" + aPhases[iIndex].STATUS_MODEL_CODE + "')/Transitions");
					oTransitionModel.attachRequestCompleted(oTransitionModel, function() {
						var oData = oTransitionModel.getProperty("/d/results");
						if (oData) {
							oData.forEach(function(oItem) {
								aPhases[iIndex].CampaignNotificationStatus.push({
									ID: oObjectModel.getNextHandle(),
									CAMPAIGN_PHASE_ID: aPhases[iIndex].ID,
									STATUS_ACTION_CODE: aPhases[iIndex].STATUS_MODEL_CODE,
									TEXT_MODULE_CODE: oItem.INCLUDE_RESPONSE > 0 ? oItem.TEXT_MODULE_CODE : ""
								});
							});
						}
					});
				}
			});
		}
		var oView = this.getView();
		var oThingInspectorController = oView.getThingInspectorController();
		oView._oAdvancedChangeLayout.setBindingContext(iSelectedIndex >= 0 ? oSelectedRowContext : null, oThingInspectorController.getModelName());

		var oModel = oThingInspectorController.getModel();

		var oPhasesObject = oModel.getProperty("/property/nodes/Phases");
		for (var sKey in oPhasesObject) {
			if (!oPhasesObject[sKey].readOnly) {
				this._updateButtons(iSelectedIndex, oTable.getRows().length);
				break;
			}
		}
	},

	selectPhaseRow: function(iRow) {
		var oView = this.getView();
		oView._oTable.setFirstVisibleRow(iRow);
		oView._oTable.setSelectedIndex(iRow);
	},

	onNewButtonPressed: function(oEvent) {
		var oView = this.getView();
		var oCampaign = this.getModel();
		var aPhases = oCampaign.getProperty("/Phases");

		oCampaign.addChild(oCampaign.determinePhaseCreate(), "Phases");

		this._updateTable();
		this.selectPhaseRow(aPhases.length - 1);

		var oPhasesObject = oCampaign.getProperty("/property/nodes/Phases");
		for (var sKey in oPhasesObject) {
			if (!oPhasesObject[sKey].readOnly) {
				this._updateButtons(aPhases.length - 1, oView._oTable.getRows().length);
				break;
			}
		}
	},

	onDeleteButtonPressed: function(oEvent) {
		var oView = this.getView();
		var iSelectedIdx = oView._oTable.getSelectedIndex();

		oView._oTable.setSelectedIndex(-1);

		var aPhases = this.getModel().getProperty("/Phases");
		if (iSelectedIdx >= 0 && iSelectedIdx < aPhases.length) {
			aPhases.splice(iSelectedIdx, 1);

			this.getModel().setProperty("/Phases", aPhases);
			if (iSelectedIdx >= aPhases.length) {
				iSelectedIdx--;
				oView._oTable.setSelectedIndex(iSelectedIdx);
			} else {
				// we need a change in the selection to update the details view
				oView._oTable.setSelectedIndex(-1);
			}
		}
	},

	onUpButtonPressed: function(oEvent) {
		var aPhases = this.getModel().getProperty("/Phases");
		var iSelectedIdx = this.getView()._oTable.getSelectedIndex();
		if (iSelectedIdx > 0 && iSelectedIdx < aPhases.length) {
			aPhases.splice(iSelectedIdx - 1, 0, aPhases.splice(iSelectedIdx, 1)[0]);
			this._updateTable();
			var oView = this.getView();
			oView._oTable.setSelectedIndex(iSelectedIdx - 1);
		}
	},

	onDownButtonPressed: function(oEvent) {
		var aPhases = this.getModel().getProperty("/Phases");
		var iSelectedIdx = this.getView()._oTable.getSelectedIndex();
		if (iSelectedIdx >= 0 && iSelectedIdx < aPhases.length - 1) {
			aPhases.splice(iSelectedIdx + 1, 0, aPhases.splice(iSelectedIdx, 1)[0]);
			this._updateTable();
			var oView = this.getView();
			oView._oTable.setSelectedIndex(iSelectedIdx + 1);
		}
	},

	_updateButtons: function(iSelectedIndex, iNumRows) {
		var oView = this.getView();
		var oCampaign = this.getModel();
		var aPhases = oCampaign.getProperty("/Phases");
		var aPhaseCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.campaign.Phase.Root");
		oView._oNewButton.setEnabled(aPhases.length !== aPhaseCodes.length);

		if (iSelectedIndex < 0) {
			oView._oDeleteButton.setEnabled(false);
			oView._oUpButton.setEnabled(false);
			oView._oDownButton.setEnabled(false);
		} else {

			// TODO use binding instead

			var bEnabled = true;
			// if this is a new created row => enable delete
			if (aPhases[iSelectedIndex].ID >= 0) {
				// else check if the phase is readonly
				var oPhasesProperty = oCampaign.getProperty("/property/nodes/Phases");
				for (var sKey in oPhasesProperty) {
					if (oPhasesProperty[sKey].attributes && oPhasesProperty[sKey].attributes.PHASE_CODE) {
						bEnabled = (true !== oPhasesProperty[sKey].attributes.PHASE_CODE.readOnly);
						break;

						// TODO set the tooltip of the button to the correct message
					}
				}
			}
			oView._oDeleteButton.setEnabled(bEnabled);

			if (iSelectedIndex === 0 && iSelectedIndex == aPhases.length - 1) {
				oView._oUpButton.setEnabled(false);
				oView._oDownButton.setEnabled(false);
			} else if (iSelectedIndex === 0) {
				oView._oUpButton.setEnabled(false);
				oView._oDownButton.setEnabled(true);
			} else if (iSelectedIndex == aPhases.length - 1) {
				oView._oUpButton.setEnabled(true);
				oView._oDownButton.setEnabled(false);
			} else {
				oView._oUpButton.setEnabled(true);
				oView._oDownButton.setEnabled(true);
			}

			var sSelectedPhaseCode = oCampaign.getProperty("/Phases/" + iSelectedIndex).PHASE_CODE;
			this._updateWithValidPhases(oView._oPhase, sSelectedPhaseCode);
		}
	},

	_updateWithValidPhases: function(oPhaseDropdown, sPhaseCode) {
		if (this.isInEditMode()) {
			var oView = this.getView();
			var oCampaign = this.getModel();

			var aPhases = oCampaign.getProperty("/Phases");
			var aPhaseCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.campaign.Phase.Root");

			if (aPhases && aPhaseCodes) {
				aPhaseCodes.forEach(function(oPhaseCode) {
					var bAdd2Items = true;
					for (var jj = 0; jj < aPhases.length; jj++) {
						if (oPhaseCode["CODE"] === aPhases[jj]["PHASE_CODE"] && oPhaseCode["CODE"] !== sPhaseCode) {
							bAdd2Items = false;
							break;
						}
					}

					if (bAdd2Items) {
						var iIndex = 0;
						for (var mm = 0; mm < oPhaseDropdown.getItems().length; mm++) {
							if (oPhaseDropdown.getItems()[mm].getText() < oPhaseCode["TEXT"]) {
								iIndex = mm + 1;
							}

							if (oPhaseDropdown.getItems()[mm].getKey() === oPhaseCode["CODE"]) {
								bAdd2Items = false;
								// we don't care about the index from now on
								break;
							}
						}

						if (bAdd2Items) {
							var oNewItem = new sap.ui.core.ListItem();
							oNewItem.setText(sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")(oPhaseCode["CODE"]));
							oNewItem.setKey(oPhaseCode["CODE"]);
							oPhaseDropdown.insertItem(oNewItem, iIndex);
						}
					} else {
						setTimeout(function() {
							// we need to call with the index as the listbox remove fails w/ the key
							for (var kk = 0; kk < oPhaseDropdown.getItems().length; kk++) {
								if (oPhaseDropdown.getItems()[kk].getKey() === oPhaseCode["CODE"]) {
									oPhaseDropdown.removeItem(kk);
								}
							}
						}, 100);
					}
				});
			}

			if (sPhaseCode) {
				oPhaseDropdown.setSelectedKey(sPhaseCode);
			}
		}
	},

	_updateDetails: function(iSelectedIndex, oSelectedRowContext) {
		var oView = this.getView();
		var oThingInspectorController = oView.getThingInspectorController();
		this._updateStatusModellViz(oSelectedRowContext, oView.oStatusModelViz);

		oView._oDetails.setBindingContext(oSelectedRowContext, oThingInspectorController.getModelName());

		if (this.isInEditMode()) {
			var oThingInspectorController = oView.getThingInspectorController();
			oThingInspectorController.getModel().getDataInitializedPromise().done(function() {
				var oContext = oView._oDetails.getBindingContext(oThingInspectorController.getModelName());
				if (oContext) {
					// Phase
					var sPhaseKey = oContext.getProperty("PHASE_CODE");
					oView._oPhase.setSelectedKey(sPhaseKey);
					// Status Model
					var sStatusModelKey = oContext.getProperty("STATUS_MODEL_CODE");
					oView._oStatusModel.setSelectedKey(sStatusModelKey);
					// Evaluation Model
					var sEvaluationModelKey = oContext.getProperty("EVALUATION_MODEL_CODE");
					oView._oEvaluationModel.setSelectedKey(sEvaluationModelKey);
				}
			});
		}

		if (iSelectedIndex < 0) {
			oView._oDetails.setVisible(false);
			oView.oStatusModelVizLayout.setVisible(false);
		} else {
			oView._oDetails.setVisible(true);
			oView.oStatusModelVizLayout.setVisible(true);
		}
	},

	_updateStatusModellViz: function(oStatusModelCode, oStatusModelViz) {
		if (oStatusModelCode && oStatusModelViz) {
			var oView = this.getView();
			if (oStatusModelCode.oModel) {
				var sStatusModelCode = oStatusModelCode.getObject().STATUS_MODEL_CODE;
			} else if (typeof oStatusModelCode === "string" || oStatusModelCode instanceof String) {
				var sStatusModelCode = oStatusModelCode;
			} else {
				var sStatusModelCode = oStatusModelCode.getProperty("key");
			}
			oStatusModelViz.bindData({
				path: "/StatusModelCode('" + sStatusModelCode + "')/Transitions",
				template: oView.oStatusModelVizData
			});
		}
	},

	_updateTable: function() {
		var oView = this.getView();
		// unbind / bind to update the displayed values in the rows
		// oView._oTable.unbindRows();
		// oView._oTable.bindRows({
		//     path : this.getFormatterPath("Phases", true)
		// });

		// refresh model data ; 
		var oModel = this.getModel();
		oModel.refresh();

		// rerender to update the rows itself, e.g. remove no longer needed rows etc.
		// rerender is not work .
		oView._oTable.rerender();
	},

	setAdvanceChange: function(oChange) {
		this._oAdvanceChange = oChange;
	},

	getAdvanceChange: function() {
		return this._oAdvanceChange;
	},

	getAdvanceChangeBindingContext: function() {
		return this.getView()._oDetails.getBindingContext("applicationObject");
	},

	showVoteChangeDialog: function(oEvent) {
		var oThingInspectorController = this.getView().getThingInspectorController();
		var oModel = oThingInspectorController.getModel();
		var oController = this;
		var oView = this.getView();
		var aNotes = oModel.getProperty("/property/actions/replaceVoteType/messages");

		var oCurrentVoting = new sap.ui.commons.TextView({
			text: {
				path: "advanceChange>/VOTE_TYPE_CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.VoteType.Root")
			}
		});

		var fnChange = function(oEvent) {
			var oVoteType = oEvent.getParameters();
			var sCurrentVoting = oModel.getProperty("/VOTE_TYPE_CODE");

			var sKey = null;
			if (oVoteType.hasOwnProperty("liveValue")) {
				var oDropDown = oEvent.getSource();
				var aItems = oDropDown.getItems();
				for (var ii = 0; ii < aItems.length; ++ii) {
					if (oVoteType.liveValue === aItems[ii].getText()) {
						sKey = aItems[ii].getKey();
						break;
					}
				}
			} else {
				sKey = oVoteType.selectedItem.getProperty("key");
			}

			oController.setAdvanceChange({
				"VOTE_TYPE_CODE": sKey
			});

			oController.oChangeView.oConfirmButton.setEnabled(sKey !== sCurrentVoting);
		};

		var oNewVotingDropdown = new sap.ui.commons.DropdownBox({
			width: "75%",
			editable: true,
			visible: true,
			liveChange: fnChange,
			change: fnChange,
			selectedKey: {
				path: "advanceChange>/VOTE_TYPE_CODE",
				mode: sap.ui.model.BindingMode.OneWay
			}
		});

		// default to current vote type
		var sCurrentVoteType = oModel.getProperty("/VOTE_TYPE_CODE");
		oController.setAdvanceChange({
			"VOTE_TYPE_CODE": sCurrentVoteType
		});

		var sCodeTable = "sap.ino.xs.object.campaign.VoteType.Root";
		var sCodePath = "code>CODE";
		var sCodeBoundPath = "{" + sCodePath + "}";
		var sCodeItemPath = "code>/" + sCodeTable;

		var oItemTemplate = oView._getCodeItemTemplate(sCodePath, sCodeTable, sCodeBoundPath);

		oNewVotingDropdown.bindItems({
			path: sCodeItemPath,
			template: oItemTemplate,
			parameters: {
				includeEmptyCode: true
			}
		});

		var oContent = oView._createAdvanceChangeContent([{
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_CURRENT_VOTING}",
			object: oCurrentVoting
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_NEW_VOTING}",
			object: oNewVotingDropdown
        }, {
			divider: true
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_AFFECTED_IDEAS}",
			text: "{advanceChange>/property/actions/replaceVoteType/customProperties/AFFECTED_IDEAS}"
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_DELETE_VOTES}",
			text: "{advanceChange>/property/actions/replaceVoteType/customProperties/AFFECTED_VOTES}"
        }]);

		this._createAdvanceChangeDialog(oModel.replaceVoteType, "{i18n>BO_CAMPAIGN_TIT_ADVANCE_CHANGE_VOTING}", [oContent], aNotes,
			oNewVotingDropdown);
	},

	showPhaseChangeDialog: function(oEvent) {
		var oThingInspectorController = this.getView().getThingInspectorController();
		var oModel = oThingInspectorController.getModel();
		var oController = this;
		var oView = this.getView();
		var aNotes = oModel.getProperty("/property/actions/replacePhaseCode/messages");

		var oCurrentPhaseCode = new sap.ui.commons.TextView({
			text: {
				path: "advanceChange>PHASE_CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
			}
		});

		var fnChange = function(oEvent) {
			var oNewPhaseCode = oEvent.getParameters();
			var sCurrentPhaseCode = oModel.getProperty(this.getBindingContext("advanceChange").sPath + "/PHASE_CODE");

			var sKey = sCurrentPhaseCode;
			if (oNewPhaseCode.hasOwnProperty("liveValue")) {
				var oDropDown = oEvent.getSource();
				var aItems = oDropDown.getItems();
				for (var ii = 0; ii < aItems.length; ++ii) {
					if (oNewPhaseCode.liveValue === aItems[ii].getText()) {
						sKey = aItems[ii].getKey();
						break;
					}
				}
			} else {
				sKey = oNewPhaseCode.selectedItem.getProperty("key");
			}

			oController.setAdvanceChange({
				"NEW_PHASE_CODE": sKey,
				"PHASE_CODE": sCurrentPhaseCode
			});

			oController.oChangeView.oConfirmButton.setEnabled(sKey !== sCurrentPhaseCode);
		};

		var oNewPhaseCodeDropdown = new sap.ui.commons.DropdownBox({
			width: "75%",
			editable: true,
			visible: true,
			liveChange: fnChange,
			change: fnChange,
			selectedKey: {
				path: "advanceChange>PHASE_CODE",
				mode: sap.ui.model.BindingMode.OneWay
			}
		});

		// default to current phase code
		var sCurrentPhaseCode = oModel.getProperty(this.getAdvanceChangeBindingContext().sPath + "/PHASE_CODE");
		oController.setAdvanceChange({
			"NEW_PHASE_CODE": sCurrentPhaseCode,
			"PHASE_CODE": sCurrentPhaseCode
		});

		this._updateWithValidPhases(oNewPhaseCodeDropdown, sCurrentPhaseCode);

		var oAffectedIdeas = new sap.ui.commons.TextView({
			text: {
				parts: [{
					path: "advanceChange>PHASE_CODE"
                }, {
					path: "advanceChange>/property/actions/replacePhaseCode/customProperties/Phases"
                }],
				formatter: function(sCode, oPhases) {
					if (oPhases[sCode]) {
						return oPhases[sCode].AFFECTED_COUNT;
					} else {
						return 0;
					}
				}
			}
		});

		var oContent = oView._createAdvanceChangeContent([{
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_CURRENT_PHASE_CODE}",
			object: oCurrentPhaseCode
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_NEW_PHASE_CODE}",
			object: oNewPhaseCodeDropdown
        }, {
			divider: true
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_AFFECTED_IDEAS}",
			object: oAffectedIdeas
        }]);

		this._createAdvanceChangeDialog(oModel.replacePhaseCode, "{i18n>BO_CAMPAIGN_TIT_ADVANCE_CHANGE_PHASE_CHANGE}", [oContent], aNotes,
			oNewPhaseCodeDropdown);
	},

	showStatusChangeDialog: function(oEvent) {
		var oThingInspectorController = this.getView().getThingInspectorController();
		var oModel = oThingInspectorController.getModel();
		var oController = this;
		var oView = this.getView();
		var aNotes = oModel.getProperty("/property/actions/replaceStatusModelCode/messages");

		var oCurrentStatusModelCode = new sap.ui.commons.TextView({
			text: {
				path: "advanceChange>STATUS_MODEL_CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Model.Root")
			}
		});

		var fnChange = function(oEvent) {
			var oNewStatusModelCode = oEvent.getParameters();
			var sCurrentPhaseCode = oModel.getProperty(this.getBindingContext("advanceChange").sPath + "/PHASE_CODE");
			var sCurrentStatusModel = oModel.getProperty(this.getBindingContext("advanceChange").sPath + "/STATUS_MODEL_CODE");

			var sKey = sCurrentPhaseCode;
			if (oNewStatusModelCode.hasOwnProperty("liveValue")) {
				var oDropDown = oEvent.getSource();
				var aItems = oDropDown.getItems();
				for (var ii = 0; ii < aItems.length; ++ii) {
					if (oNewStatusModelCode.liveValue === aItems[ii].getText()) {
						sKey = aItems[ii].getKey();
						break;
					}
				}
			} else {
				sKey = oNewStatusModelCode.selectedItem.getProperty("key");
			}

			oController.setAdvanceChange({
				"NEW_STATUS_MODEL_CODE": sKey,
				"PHASE_CODE": sCurrentPhaseCode
			});

			oController.oChangeView.oConfirmButton.setEnabled(sKey !== sCurrentStatusModel);

			var oPhasesObject = oModel.getProperty("/property/actions/replaceStatusModelCode/customProperties/Phases");

			if (oPhasesObject && oPhasesObject[sCurrentPhaseCode] && oPhasesObject[sCurrentPhaseCode].AFFECTED_NEW_COUNTS && typeof oPhasesObject[
				sCurrentPhaseCode].AFFECTED_NEW_COUNTS[sKey] === "number") {
				oAffectedNewIdeas.setText(oPhasesObject[sCurrentPhaseCode].AFFECTED_NEW_COUNTS[sKey]);
			} else {
				var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
				oAffectedNewIdeas.setText(i18n.getText("BO_CAMPAIGN_ADVANCE_CHANGE_FLD_UNKNOWN"));
			}
		};

		var oNewStatusModelCodeDropdown = new sap.ui.commons.DropdownBox({
			width: "75%",
			editable: true,
			visible: true,
			liveChange: fnChange,
			change: fnChange,
			selectedKey: {
				path: "advanceChange>STATUS_MODEL_CODE",
				mode: sap.ui.model.BindingMode.OneWay
			}
		});

		// default to current phase code
		var sCurrentPhaseCode = oModel.getProperty(this.getAdvanceChangeBindingContext().sPath + "/PHASE_CODE");
		var sCurrentStatusModelCode = oModel.getProperty(this.getAdvanceChangeBindingContext().sPath + "/STATUS_MODEL_CODE");
		oController.setAdvanceChange({
			"NEW_STATUS_MODEL_CODE": sCurrentStatusModelCode,
			"PHASE_CODE": sCurrentPhaseCode
		});

		var sCodeTable = "sap.ino.xs.object.status.Model.Root";
		var sCodePath = "code>CODE";
		var sCodeBoundPath = "{" + sCodePath + "}";
		var sCodeItemPath = "code>/" + sCodeTable;

		var oItemTemplate = oView._getCodeItemTemplate(sCodePath, sCodeTable, sCodeBoundPath);

		oNewStatusModelCodeDropdown.bindItems({
			path: sCodeItemPath,
			template: oItemTemplate,
            length: 300
		});
		var oDiagramNoImageLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_NODISPLAY_DIAGRAM_DES}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		}).addStyleClass('sapUiNodiaplayedDes');

		var oStatusModelVizDialog = new sap.ui.ino.controls.StatusModelViz({
			width: "500px",
			height: "320px",
			diagramNoImage: oDiagramNoImageLabel
		});

		oNewStatusModelCodeDropdown.attachChange(function(oEvent) {
			oController._updateStatusModellViz(oEvent.getParameters().selectedItem, oStatusModelVizDialog);
		});

		var oAffectedIdeas = new sap.ui.commons.TextView({
			text: {
				parts: [{
					path: "advanceChange>PHASE_CODE"
                }, {
					path: "advanceChange>/property/actions/replaceStatusModelCode/customProperties/Phases"
                }],
				formatter: function(sCode, oPhases) {
					return (oPhases[sCode] && oPhases[sCode].AFFECTED_COUNT) ? oPhases[sCode].AFFECTED_COUNT : 0;
				}
			}
		});

		var oAffectedNewIdeas = new sap.ui.commons.TextView({
			// this is the correct default, as we set the same status model by default
			text: "0"
		});

		var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var sNewText = i18n.getText("BO_CAMPAIGN_ADVANCE_CHANGE_FLD_AFFECTED_IDEAS_INITIAL");

		var oContent = oView._createAdvanceChangeContent([{
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_CURRENT_STATUS_MODEL_CODE}",
			object: oCurrentStatusModelCode
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_NEW_STATUS_MODEL_CODE}",
			object: oNewStatusModelCodeDropdown
        }, {
			divider: true
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_AFFECTED_IDEAS}",
			object: oAffectedIdeas
        }, {
			label: sNewText,
			object: oAffectedNewIdeas
        }, {
			divider: true
        }, {
			label: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION}",
			object: oStatusModelVizDialog,
			bColSpan: true
        }]);
		var fnInitDialog = function() {
			oController._updateStatusModellViz(oController.getAdvanceChange().NEW_STATUS_MODEL_CODE, oStatusModelVizDialog)
		};
		this._createAdvanceChangeDialog(oModel.replaceStatusModelCode, "{i18n>BO_CAMPAIGN_TIT_ADVANCE_CHANGE_STATUS_MODEL_CHANGE}", [oContent],
			aNotes, oNewStatusModelCodeDropdown, null, null, fnInitDialog, true);
	},

	showPhaseDeleteDialog: function(oEvent) {
		var oThingInspectorController = this.getView().getThingInspectorController();
		var oModel = oThingInspectorController.getModel();
		var oController = this;
		var oView = this.getView();
		var aNotes = oModel.getProperty("/property/actions/deletePhase/messages");

		var oCurrentPhaseCode = new sap.ui.commons.TextView({
			text: {
				path: "advanceChange>PHASE_CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
			}
		});

		var sCurrentPhaseCode = oModel.getProperty(oView._oDetails.getBindingContext(oThingInspectorController.getModelName()).sPath +
			"/PHASE_CODE");

		var oNewPhaseCode = new sap.ui.commons.TextView({
			text: {
				parts: [{
					path: "advanceChange>PHASE_CODE"
                }, {
					path: "advanceChange>/property/actions/deletePhase/customProperties/Phases"
                }],
				formatter: function(sCode, oPhases) {
					var fnFormatter = sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root");
					var sNewPhaseCode = (oPhases[sCode] && oPhases[sCode].NEW_PHASE_CODE) ? oPhases[sCode].NEW_PHASE_CODE : "";
					return sNewPhaseCode ? fnFormatter(sNewPhaseCode) : sNewPhaseCode;
				}
			}
		});

		var oAffectedIdeas = new sap.ui.commons.TextView({
			text: {
				parts: [{
					path: "advanceChange>PHASE_CODE"
                }, {
					path: "advanceChange>/property/actions/deletePhase/customProperties/Phases"
                }],
				formatter: function(sCode, oPhases) {
					if (oPhases[sCode]) {
						return oPhases[sCode].AFFECTED_COUNT;
					} else {
						return 0;
					}
				}
			}
		});

		var oContent = oView._createAdvanceChangeContent([{
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_PHASE_TO_DELETE}",
			object: oCurrentPhaseCode
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_NEW_PHASE}",
			object: oNewPhaseCode
        }, {
			divider: true
        }, {
			label: "{i18n>BO_CAMPAIGN_ADVANCE_CHANGE_FLD_AFFECTED_IDEAS}",
			object: oAffectedIdeas
        }]);

		var fnSuccess = function() {
			var oView = this.getView();
			var iSelectedIdx = oView._oTable.getSelectedIndex();
			oView._oTable.setSelectedIndex(-1);
			var aPhases = this.getModel().getProperty("/Phases");
			if (iSelectedIdx >= aPhases.length) {
				iSelectedIdx--;
			}
			oView._oTable.setSelectedIndex(iSelectedIdx);
		};

		this._createAdvanceChangeDialog(oModel.deletePhase, "{i18n>BO_CAMPAIGN_TIT_ADVANCE_CHANGE_PHASE_DELETE}", [oContent], aNotes, undefined,
			fnSuccess, true);

		// set change
		this.setAdvanceChange({
			"PHASE_CODE": sCurrentPhaseCode
		});
	},

	_isPublishChangeAllowed: function(fnAllowedFunction, fnNotAllowedFunction) {
		var oTIController = this.getThingInspectorController();

		function fnSubmit(bResult) {
			if (bResult) {
				var oModel = oTIController.getModel();
				oTIController.onModelAction(oModel.publish, "submit", true);
				if (fnAllowedFunction) {
					fnAllowedFunction();
				} else {
					if (fnNotAllowedFunction) {
						fnNotAllowedFunction();
					}
				}
			}
		}

		function fnFeed(bResult) {
			if (bResult) {
				var oModel = oTIController.getModel();
				oTIController.onModelAction(oModel.majorpublish, "submit", true, false, false, oTIController.getModel().getChangeRequest());
				if (fnAllowedFunction) {
					fnAllowedFunction();
				} else {
					if (fnNotAllowedFunction) {
						fnNotAllowedFunction();
					}
				}
			}
		}
		var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
		if (oApp.hasCurrentViewPendingChanges()) {

			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("campaign");

			// function fnSubmit(bResult) {
			//     if (bResult) {
			//         var oModel = oTIController.getModel();
			//         oTIController.onModelAction(oModel.publish, "silent", true);

			//         if (fnAllowedFunction) {
			//             fnAllowedFunction();
			//         }
			//     } else {
			//         if (fnNotAllowedFunction) {
			//             fnNotAllowedFunction();
			//         }
			//     }
			// }

			var sChangedFields = oTIController.getChangedFields();
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			if (sChangedFields === '') {
				sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_FACET_PROCESS_INS_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"), fnSubmit,
					i18n.getText("BO_CAMPAIGN_FACET_PROCESS_TIT_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"));
			} else {
				sap.ui.ino.controls.MessageBox.show(i18n.getText("BO_CAMPAIGN_FACET_PROCESS_INS_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"),
					sap.ui.commons.MessageBox.Icon.NONE, i18n.getText("BO_CAMPAIGN_FACET_PROCESS_TIT_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"), [sap.ui.commons
						.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO, sap.ui.commons.MessageBox.Action.CANCEL], function(bResult) {
						if (bResult === sap.ui.commons.MessageBox.Action.YES) {
							fnFeed(bResult);
						} else if (bResult === sap.ui.commons.MessageBox.Action.NO) {
							fnSubmit(bResult);
						}
					}, sap.ui.commons.MessageBox.Action.CLOSE, 'FEED_DIALOG');
				document.getElementById("FEED_DIALOG--btn-YES").childNodes[0].nodeValue = i18n.getText("BO_CAMPAIGN_BTN_MAJOR_PUBLISH");
				document.getElementById("FEED_DIALOG--btn-NO").childNodes[0].nodeValue = i18n.getText("BO_CAMPAIGN_BTN_NOFEED_PUBLISH");
			}
			// 
			// sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_FACET_PROCESS_INS_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"), fnSubmit, i18n.getText("BO_CAMPAIGN_FACET_PROCESS_TIT_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"));

		} else {
			if (fnAllowedFunction) {
				fnAllowedFunction();
			}
		}
	},

	_createAdvanceChangeDialog: function(fnModelAction, sTitle, aContent, aNotes, vInitialFocus, fnSuccess, bEnableConfirm, fnInitDialog,
		bRelativeNote) {
		var oThingInspectorController = this.getView().getThingInspectorController();
		var oModel = oThingInspectorController.getModel();
		var oController = this;
		if (fnInitDialog) {
			fnInitDialog();
		}
		// default (undefined) to false
		bEnableConfirm = bEnableConfirm ? true : false;

		this._isPublishChangeAllowed(function() {
			var oChangeView = sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignAdvanceChange");
			oController.oChangeView = oChangeView;
			if (bRelativeNote) {
				var oNote = oController.oChangeView.oContent.getAggregation("content") && oController.oChangeView.oContent.getAggregation("content")[
					0];
				oNote.addStyleClass("StatusModel");
			}

			oChangeView.addBackendMessages(aNotes, "campaignAdvanceChangeNote");
			oChangeView.setModel(oModel, "advanceChange");
			oChangeView.setBindingContext(oController.getView()._oDetails.getBindingContext(oThingInspectorController.getModelName()),
				"advanceChange");
			oChangeView.setContent(aContent);

			oChangeView.setOnApplyChangesCallback(function() {
				oDialog.setBusy(true);
				oChangeView.enableButtons(false);
				var oRequest = oThingInspectorController.onModelAction(fnModelAction, "submittedChange", true, false, false, oController.getAdvanceChange());
				oRequest.always(function(oResponse) {
					oDialog.setBusy(false);
					this._oAdvanceChange = undefined;
				});
				oRequest.done(function(oResponse) {
					if (typeof fnSuccess === "function") {
						fnSuccess.apply(oController, []);
					}
					oDialog.close();
				});
				oRequest.fail(function(oResponse) {
					oChangeView.enableButtons(true);
				});
			}, this);

			var that = this;
			var iHeight = $(window).height();
			var sHeight;
			if (iHeight >= 610) {
				sHeight = "610px";
			} else if (iHeight < 610 && iHeight >= 400) {
				sHeight = "80%";
			} else {
				sHeight = "300px";
			}
			var oDialog = new sap.ui.commons.Dialog({
				title: sTitle,
				content: [oChangeView],
				minWidth: "300px",
				width: "700px",
				minHeight: "300px",
				height: sHeight,
				modal: true,
				resizable: false,
				closed: function(oEvent) {
					oChangeView.destroy();
					that.oActiveDialog = null;
				}
			});
			oChangeView.addDialogButtons(oDialog, bEnableConfirm);
			this.oActiveDialog = oDialog;

			if (vInitialFocus) {
				oDialog.setInitialFocus(vInitialFocus);
			}

			oDialog.open();
		});
	}
}));