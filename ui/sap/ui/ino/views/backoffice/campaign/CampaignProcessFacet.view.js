/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.controls.StatusModelVizData");
jQuery.sap.require("sap.ui.ino.controls.StatusModelViz");
jQuery.sap.require("sap.ui.ino.application.Configuration");


sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignProcessFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignProcessFacet";
	},

	createFacetContent: function() {
		var oController = this.getController();
		var bEdit = oController.isInEditMode();

		this._oAdvancedChangeLayout = this._createNoteLayout(bEdit);

		var oLayout = new sap.ui.layout.VerticalLayout();
		oLayout.addContent(this._oAdvancedChangeLayout);
		oLayout.addContent(this._createVotingLayout(bEdit));
		oLayout.addContent(this._createPhasesLayout(bEdit));

		var oFlow1 = new sap.ui.layout.Grid({
			defaultSpan: "L12 M12 S12",
			containerQuery: true
		});
		oLayout.addContent(oFlow1);
		var oDetails = this._createDetailsLayout(bEdit);
		oDetails.setLayoutData(new sap.ui.layout.GridData({
			span: "L6 M12 S12"
		}));
		var oStatusViz = this._createStatusModellViz(bEdit);
		oStatusViz.setLayoutData(new sap.ui.layout.GridData({
			span: "L6 M12 S12"
		}));
		oFlow1.addContent(oDetails);
		oFlow1.addContent(oStatusViz);

		var content = [new sap.ui.ux3.ThingGroup({
			content: oLayout,
			colspan: true
		})];

		return content;
	},

	_createNoteLayout: function(bEdit) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			widths: ["100%"],
			visible: {
				parts: [{
					path: this.getFormatterPath("STATUS_CODE", true),
					type: null
                }, {
					path: this.getFormatterPath("property/nodes/Phases", true)
                }, {
					path: this.getFormatterPath("property/actions", true)
                }],
				formatter: function(sStatusCode, oPhasesObject, oActions) {
					for (var sKey in oPhasesObject) {
						if (oPhasesObject[sKey].attributes && (oPhasesObject[sKey].attributes.STATUS_MODEL_CODE || oPhasesObject[sKey].attributes.PHASE_CODE)) {
							var bReadOnly = ((oPhasesObject[sKey].attributes.PHASE_CODE && oPhasesObject[sKey].attributes.PHASE_CODE.readOnly) || (
								oPhasesObject[sKey].attributes.STATUS_MODEL_CODE && oPhasesObject[sKey].attributes.STATUS_MODEL_CODE.readOnly));
							return bEdit && bReadOnly;
						}
					}
					return false;
				}
			}

		});

		var oPanel = new sap.ui.commons.Panel({
			width: "100%",
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Transparent,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			title: new sap.ui.core.Title({
				icon: sap.ui.ino.controls.ThemeFactory.getImage("icon_warning.png"),
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_TIT_NOTE}"
			}),
			visible: true,
			content: [new sap.ui.core.HTML({
				content: "{i18n>BO_CAMPAIGN_FACET_PROCESS_EXP_NOTE}",
				sanitizeContent : true
			})]
		});

		var fnPanelAfterRendering = oPanel.onAfterRendering;
		oPanel.onAfterRendering = function() {
			if (fnPanelAfterRendering) {
				fnPanelAfterRendering.apply(oPanel, arguments);
			}

			// adding missing aria attributes as panel does not support this by default
			var $Panel = oPanel.$();
			var sPanelId = $Panel.attr("id");
			$Panel.attr("aria-labelledby", sPanelId + "-title " + sPanelId + "-cont");
		};

		var oNoteRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oNoteCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oPanel]
		});
		oNoteRow.addCell(oNoteCell);
		oLayout.addRow(oNoteRow);

		var oVoteChangeButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_NOTE_CHANGE_VOTING}",
			press: [oController.showVoteChangeDialog, oController],
			enabled: {
				path: this.getFormatterPath("property/actions/replaceVoteType/enabled", true),
				type: null,
				formatter: function(bEnabled) {
					return bEdit && bEnabled;
				}
			}
		});

		var oPhaseChangeButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_NOTE_CHANGE_PHASES}",
			press: [oController.showPhaseChangeDialog, oController],
			enabled: {
				parts: [{
					path: this.getFormatterPath("ID", false),
					type: null
                }, {
					path: this.getFormatterPath("property/actions/replacePhaseCode/enabled", true),
					type: null
                }],
				formatter: function(iPhaseId, bEnabled) {
					return bEdit && iPhaseId != null && iPhaseId > 0 && bEnabled;
				}
			}
		});
		var oStatusChangeButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_NOTE_CHANGE_STATUS_MODEL}",
			press: [oController.showStatusChangeDialog, oController],
			enabled: {
				parts: [{
					path: this.getFormatterPath("ID", false),
					type: null
                }, {
					path: this.getFormatterPath("property/actions/replaceStatusModelCode/enabled", true),
					type: null
                }],
				formatter: function(iPhaseId, bEnabled) {
					return bEdit && iPhaseId != null && iPhaseId > 0 && bEnabled;
				}
			}
		});
		var oPhaseDeleteButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_NOTE_DELETE_PHASE}",
			press: [oController.showPhaseDeleteDialog, oController],
			enabled: {
				parts: [{
					path: this.getFormatterPath("ID", false),
					type: null
                }, {
					path: this.getFormatterPath("property/actions/deletePhase/enabled", true),
					type: null
                }],
				formatter: function(iPhaseId, bEnabled) {
					return bEdit && iPhaseId != null && iPhaseId > 0 && bEnabled;
				}
			}
		});

		var oButtonRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oButtonCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVoteChangeButton, oPhaseChangeButton, oStatusChangeButton, oPhaseDeleteButton]
		});
		oButtonRow.addCell(oButtonCell);
		oLayout.addRow(oButtonRow);

		oLayout.addStyleClass("sapUiInoCampaignProcessNote");
		return oLayout;
	},

	_createVotingLayout: function(bEdit) {

		var oController = this.getController();
		var oView = this;

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Voting Model
		 */
		var oVotingRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oVotingLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_PROCESS_FLD_VOTE_MODEL"),
			visible: true,
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		});
		var oLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVotingLabel]
		});

		var oVotingDropdown = new sap.ui.commons.DropdownBox({
			width: "50%",
			visible: true,
			selectedKey: this.getBoundPath("VOTE_TYPE_CODE", true),
			//liveChange: [oController.onVotingTypeChanged, oController],
			change: [oController.onVotingTypeChanged, oController],
			editable: {
				path: this.getFormatterPath("property/nodes/Root/attributes/VOTE_TYPE_CODE/changeable", true),
				formatter: function(bChangeable) {
					return (bEdit && bChangeable);
				}
			},
			tooltip: {
				parts: [{
					path: this.getFormatterPath("property/nodes/Root/attributes/VOTE_TYPE_CODE/changeable", true)
                }, {
					path: this.getFormatterPath("property/nodes/Root/attributes/VOTE_TYPE_CODE/messages", true)
                }],
				formatter: function(bChangeable, aMessages) {
					if (bEdit && bChangeable === false /* undefined is ok */ ) {
						if (aMessages && aMessages.length > 0) {
							var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
							return oMsg.getText(aMessages[0].messageKey);
						}
						return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
					} else {
						return undefined;
					}
				}
			},
			ariaLabelledBy: oVotingLabel ? oVotingLabel : undefined
		});

		if (oVotingLabel && typeof oVotingLabel.setLabelFor === "function") {
			oVotingLabel.setLabelFor(oVotingDropdown);
		}

		var sCodeTable = "sap.ino.xs.object.campaign.VoteType.Root";
		var sCodePath = this.getController().getCodeModelPrefix() + "CODE";
		var sCodeBoundPath = "{" + sCodePath + "}";
		var sCodeItemPath = oView.getController().getCodeModelPrefix() + "/" + sCodeTable;

		var oItemTemplate = new sap.ui.core.ListItem({
			text: {
				path: sCodePath,
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable)
			},
			key: sCodeBoundPath,
			tooltip: {
				path: sCodePath,
				formatter: sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
			}
		});
		oVotingDropdown.bindItems({
			path: sCodeItemPath,
			template: oItemTemplate,
			parameters: {
				includeEmptyCode: true
			}
		});

		var oVotingCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVotingDropdown]
		});
		oVotingRow.addCell(oLabelCell);
		oVotingRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oVotingRow.addCell(oVotingCell);
		oLayout.addRow(oVotingRow);

		return oLayout;
	},

	_createPhasesLayout: function(bEdit) {
        var that = this;
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Phases
		 */
		var oHeaderRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES"),
				design: sap.ui.commons.TextViewDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Left,
				width: "100%"
			})]
		});

		oHeaderRow.addCell(oLabel);
		oLayout.addRow(oHeaderRow);

		/*
		 * Buttons
		 */
		this._oNewButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_NEW_PHASE}",
			press: [oController.onNewButtonPressed, oController],
			lite: false,
			enabled: bEdit
		});

		this._oDeleteButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_DELETE_PHASE}",
			press: [oController.onDeleteButtonPressed, oController],
			lite: false,
			enabled: false
		});

		this._oUpButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_PHASE_UP}",
			press: [oController.onUpButtonPressed, oController],
			lite: false,
			enabled: false
		});

		this._oDownButton = new sap.ui.commons.Button({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_BUT_PHASE_DOWN}",
			press: [oController.onDownButtonPressed, oController],
			lite: false,
			enabled: false
		});

		/*
		 * Table
		 */
		this._oTable = new sap.ui.table.Table({
			enableColumnReordering: true,
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource(), bEdit);
			},
			visibleRowCount: 5,
			toolbar: new sap.ui.commons.Toolbar({
				items: [this._oNewButton, this._oDeleteButton, this._oUpButton, this._oDownButton]
			})
		});

		var oPhaseColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASE_HEADER}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("PHASE_CODE"),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
				}
			})
		});
		this._oTable.addColumn(oPhaseColumn);

		var oStatusModelColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_STATUS_MODEL_HEADER}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("STATUS_MODEL_CODE"),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Model.Root")
				}
			})
		});
		this._oTable.addColumn(oStatusModelColumn);

		var oEvalModelColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_EVAL_MODEL_HEADER}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("EVALUATION_MODEL_CODE"),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.evaluation.Model.Root")
				}
			})
		});
		this._oTable.addColumn(oEvalModelColumn);

		var oAutoPublEvalColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_AUTO_PUB_EVAL_HEADER}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("AUTO_EVAL_PUB_CODE"),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.evaluation.AutoPublication.Root")
				}
			})
		});
		this._oTable.addColumn(oAutoPublEvalColumn);

		var oVoteColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_VOTE_HEADER}"
			}),
			template: new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: this.getFormatterPath("VOTING_ACTIVE"),
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			})
		});
		this._oTable.addColumn(oVoteColumn);

		var oCommunityColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_COMMUNITY_HEADER}"
			}),
			template: new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: this.getFormatterPath("SHOW_IDEA_IN_COMMUNITY"),
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			})
		});
		this._oTable.addColumn(oCommunityColumn);

		var oEditColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_EDITABLE_HEADER}"
			}),
			template: new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: this.getFormatterPath("IDEA_CONTENT_EDITABLE"),
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			})
		});
		this._oTable.addColumn(oEditColumn);

		var oSelfAssessmentColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_SELF_ASSESSMENT_HEADER}"
			}),
			template: new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: this.getFormatterPath("SELF_EVALUATION_ACTIVE"),
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			})
		});
		this._oTable.addColumn(oSelfAssessmentColumn);
		
		/*
		    Reward
		*/
		oController.getModel().getDataInitializedPromise().done(function(){
		    var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
    		var isRewardVisible = (oSystemSetting.getProperty("/sap.ino.config.REWARD_ACTIVE") === "0" ? false : true) && (oController.getModel().oData.REWARD === 1 ? true : false);
    		if (isRewardVisible)
    		{
    		    var oRewardColumn = new sap.ui.table.Column({
        		    label : new sap.ui.commons.Label({
        		       text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_REWARD_HEADER}"
        		    }),
        		    template : new sap.ui.commons.CheckBox({
        		        editable: false,
        		        checked: {
        		            path: that.getFormatterPath("REWARD"),
        		            type: new sap.ui.ino.models.types.IntBooleanType()
        		        }
        		    })
        		});
                that._oTable.addColumn(oRewardColumn);
    		}
    		
            
    		that._oTable.bindRows({
    			path: that.getFormatterPath("Phases", true)
    		});
    
    		var oTableRow = new sap.ui.commons.layout.MatrixLayoutRow();
    		oTableRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
    			content: [that._oTable]
    		}));
    		oLayout.addRow(oTableRow);
		})

		return oLayout;
	},

	_createDetailsLayout: function(bEdit) {

		var that = this;
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ["50%", "10px", "40%", "20px"],
			visible: false
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Phase
		 */
		var oPhaseRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oPhaseLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASE_HEADER");

		oPhaseRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oPhaseLabel]
		}));
		oPhaseRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		this._oPhase = this._createCodeControl("PHASE_CODE", "sap.ino.xs.object.campaign.Phase.Root");
		oController._updateWithValidPhases(this._oPhase);

		this._setLabelledBy(oPhaseLabel, this._oPhase);

		oPhaseRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oPhase]
		}));
		oLayout.addRow(oPhaseRow);

		/*
		 * Status Model
		 */
		var oStatusModelRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oStatusModelLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_STATUS_MODEL_HEADER");

		oStatusModelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oStatusModelLabel]
		}));
		oStatusModelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		this._oStatusModel = this._createCodeControl("STATUS_MODEL_CODE", "sap.ino.xs.object.status.Model.Root",false,oController.onStatusModelSelectionChanged);

		this._setLabelledBy(oStatusModelLabel, this._oStatusModel);

		oStatusModelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oStatusModel]
		}));
		oLayout.addRow(oStatusModelRow);

		/*
		 * Evaluation Model
		 */
		var oEvalRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oEvalLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_EVAL_MODEL_HEADER");

		oEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEvalLabel]
		}));
		oEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		this._oEvaluationModel = this._createCodeControl("EVALUATION_MODEL_CODE", "sap.ino.xs.object.evaluation.Model.Root", true);

		this._setLabelledBy(oEvalLabel, this._oEvaluationModel);

		oEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oEvaluationModel]
		}));
		oLayout.addRow(oEvalRow);

		/*
		 * Automatic Evaluation Publication
		 */
		var oAutoPubEvalRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oAutoPubEvalLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_AUTO_PUB_EVAL_HEADER");

		oAutoPubEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAutoPubEvalLabel]
		}));
		oAutoPubEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		this._oAutoPubEval = this._createCodeControl("AUTO_EVAL_PUB_CODE", "sap.ino.xs.object.evaluation.AutoPublication.Root", true);

		this._setLabelledBy(oAutoPubEvalLabel, this._oAutoPubEval);

		oAutoPubEvalRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oAutoPubEval]
		}));
		oLayout.addRow(oAutoPubEvalRow);

		if (this._oEvaluationModel.attachChange) {
			this._oEvaluationModel.attachChange(function(oEvent) {
				var oEvaluationName = oEvent.getParameter("newValue");
				var bEvaluationSelected = !!oEvaluationName && oEvaluationName != "";
				that._oAutoPubEval.setEnabled(bEvaluationSelected);
				if (!bEvaluationSelected) {
					that._oAutoPubEval.setSelectedKey("");
				}
			});
		}

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		/*
		 * Voting
		 */
		var oVoteRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oVoteLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_VOTE_HEADER");
		var oVotingBox = this._createCheckBox("VOTING_ACTIVE", bEdit);

		this._setLabelledBy(oVoteLabel, oVotingBox);

		oVoteRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVoteLabel]
		}));
		oVoteRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oVoteRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oVotingBox]
		}));

		oLayout.addRow(oVoteRow);

		/*
		 * Community
		 */
		var oCommunityRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oCommunityLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_COMMUNITY_HEADER");
		var oCommunityBox = this._createCheckBox("SHOW_IDEA_IN_COMMUNITY", bEdit);

		this._setLabelledBy(oCommunityLabel, oCommunityBox);

		oCommunityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oCommunityLabel]
		}));
		oCommunityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oCommunityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oCommunityBox]
		}));

		oLayout.addRow(oCommunityRow);

		/*
		 * Editing
		 */
		var oEditRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oEditLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_EDITABLE_HEADER");
		var oEditBox = this._createCheckBox("IDEA_CONTENT_EDITABLE", bEdit);

		this._setLabelledBy(oEditLabel, oEditBox);

		oEditRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEditLabel]
		}));
		oEditRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oEditRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEditBox]
		}));

		oLayout.addRow(oEditRow);

		/*
		 * Self Assessment enabled
		 */
		var oSelfAssessmentRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oSelfAssessmentLabel = this._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_SELF_ASSESSMENT_HEADER");
		var oSelfAssessmentBox = this._createCheckBox("SELF_EVALUATION_ACTIVE", bEdit);

		this._setLabelledBy(oSelfAssessmentLabel, oSelfAssessmentBox);

		oSelfAssessmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oSelfAssessmentLabel]
		}));
		oSelfAssessmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oSelfAssessmentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oSelfAssessmentBox]
		}));

		oLayout.addRow(oSelfAssessmentRow);
		
		/*
		* Enable Reward
		*/
		oController.getModel().getDataInitializedPromise().done(function(){
    		var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
    		var isRewardVisible = (oSystemSetting.getProperty("/sap.ino.config.REWARD_ACTIVE") === "0" ? false : true) && (oController.getModel().oData.REWARD === 1 ? true : false);
    		if (isRewardVisible)
    		{
    		    var oRewardRow = new sap.ui.commons.layout.MatrixLayoutRow();
        		var oRewardLabel = that._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_REWARD_HEADER");
        		var oRewardBox = that._createCheckBox("REWARD", bEdit);
        		
        		that._setLabelledBy(oRewardLabel, oRewardBox);
        		
        		oRewardRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
        		    content : [oRewardLabel]
        		}));
        		oRewardRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
        		oRewardRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
        		    content : [oRewardBox]
        		}));
        		oLayout.addRow(oRewardRow);
    		}
    	
    
    		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
    			height: "20px"
    		}));
    		
    		that._oDetails = oLayout;
    		
		});

		this._oDetails = oLayout;

		return oLayout;
	},

	_createStatusModellViz: function(bEdit) {

		var that = this;
		var oController = this.getController();

		var oLayout = new sap.ui.layout.VerticalLayout({
			visible: false,
			width: "100%"
		});

		this.oStatusModelVizData = new sap.ui.ino.controls.StatusModelVizData({
			code: "{CODE}",
			currentStatusCode: "{CURRENT_STATUS_CODE}",
			currentStatusType: "{CURRENT_STATUS_TYPE}",
			nextStatusCode: "{NEXT_STATUS_CODE}",
			nextStatusType: "{NEXT_STATUS_TYPE}",
			statusActionCode: "{STATUS_ACTION_CODE}",
		    decisionRelevant: {
				path: "DECISION_RELEVANT",
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			decisionReasonListCode: "{DECISION_REASON_LIST_CODE}"
		});

		oLayout.addContent(that._createLabel("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION"));
		var oStatusModelViz;
		var fnClick;
		fnClick = function(oEvent) {
			var oDialog = new sap.ui.commons.Dialog({
				title: oController.getTextModel().getText("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION"),
				content: oStatusModelViz.clone().setWidth("100%").setHeight("100%").detachEvent("click", fnClick),
				minWidth: "300px",
				width: "700px",
				minHeight: "300px",
				height: "610px",
				resizable: false,
				autoClose: true
			});
			oDialog.open();
		};

		var oDiagramLegendLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION_LEGEND}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		});

		var oDiagramReasonLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION_REASON}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		});
		
		var oDiagramNoImageLabel = new sap.ui.commons.Label({
    			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_NODISPLAY_DIAGRAM_DES}",
    			textAlign: sap.ui.core.TextAlign.Left,
    			width: "80%",
    			wrapping: true
    	}).addStyleClass('sapUiNodiaplayedDes');
		
		oStatusModelViz = new sap.ui.ino.controls.StatusModelViz({
			width: "450px",
			height: "350px",
			zoom: false,
			click: fnClick,
			diagramLegend: oDiagramLegendLabel,
			diagramReason: oDiagramReasonLabel,
			diagramNoImage: oDiagramNoImageLabel
		});
		oLayout.addContent(oStatusModelViz);

		if (bEdit) {
			this._oStatusModel.attachChange(function(oEvent) {
				oController._updateStatusModellViz(oEvent.getParameters().selectedItem, oStatusModelViz);
			});
		}

		this.oStatusModelViz = oStatusModelViz;
		this.oStatusModelVizLayout = oLayout;

		return oLayout;
	},

	_createLabel: function(sBundleKey) {
		var oController = this.getController();

		return new sap.ui.commons.Label({
			text: oController.getTextModel().getText(sBundleKey),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		});
	},

	_setLabelledBy: function(oLabel, oControl) {
		if (oLabel.setLabelFor) {
			oLabel.setLabelFor(oControl);
		}

		if (oControl.addAriaLabelledBy) {
			if (oControl.removeAllAriaLabelledBy) {
				oControl.removeAllAriaLabelledBy();
			}
			oControl.addAriaLabelledBy(oLabel);
		}
	},

	_createCheckBox: function(sPath, bEdit) {
		var oController = this.getController();
		return new sap.ui.commons.CheckBox({
// 			editable: {
// 				path: this.getFormatterPath("property/nodes/Phases", true),
// 				formatter: function(oPhasesObject) {
// 					for (var sKey in oPhasesObject) {
// 						return (bEdit && !oPhasesObject[sKey].readOnly);
// 					}
// 					return false;
// 				}
// 			},
            editable: {
                parts: [{
						path: this.getFormatterPath("property/nodes/Phases", true)
                    }, {
						path: this.getFormatterPath("ID", false),
						type: null
                    }],
                formatter: function(oPhasesObject, iPhaseId) {
						if (iPhaseId < 0) {
							return true;
						} else {
							for (var sKey in oPhasesObject) {
								if (oPhasesObject[sKey].attributes && oPhasesObject[sKey].attributes[sPath]) {
									return bEdit && !oPhasesObject[sKey].attributes[sPath].readOnly;
								}
							}
							return false;
						}
					}
            },
			checked: {
				path: this.getFormatterPath(sPath),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			tooltip: {
				path: this.getFormatterPath("property/nodes/Phases", true),
				formatter: function(oPhasesObject) {
					for (var sKey in oPhasesObject) {
						if (bEdit && oPhasesObject[sKey].readOnly) {
							var aMessages = oPhasesObject[sKey].messages;
							if (aMessages && aMessages.length > 0) {
								var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
								return oMsg.getText(aMessages[0].messageKey);
							}
							return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
						}
					}
					return undefined;
				}
			}
		});
	},

	_createCodeControl: function(sRootKey, sCode, bEmpty, fnChange) {
		var oCodeControl;
		var oController = this.getController();
		if (oController.isInEditMode()) {
			oCodeControl = new sap.ui.commons.DropdownBox({
				selectedKey: this.getBoundPath(sRootKey, false),
				enabled: {
					parts: [{
						path: this.getFormatterPath("property/nodes/Phases", true)
                    }, {
						path: this.getFormatterPath("ID", false),
						type: null
                    }],
					formatter: function(oPhasesObject, iPhaseId) {
						if (iPhaseId < 0) {
							return true;
						} else {
							for (var sKey in oPhasesObject) {
								if (oPhasesObject[sKey].attributes && oPhasesObject[sKey].attributes[sRootKey]) {
									return !oPhasesObject[sKey].attributes[sRootKey].readOnly;
								}
							}
							return false;
						}
					}
				},
				tooltip: {
					parts: [{
						path: this.getFormatterPath("property/nodes/Phases", true)
                    }, {
						path: this.getFormatterPath("ID", false),
						type: null
                    }],
					formatter: function(oPhasesObject, iPhaseId) {
						if (iPhaseId < 0) {
							return undefined;
						}

						for (var sKey in oPhasesObject) {
							if (oPhasesObject[sKey].attributes && oPhasesObject[sKey].attributes[sRootKey] && oPhasesObject[sKey].attributes[sRootKey].readOnly) {
								var aMessages = oPhasesObject[sKey].attributes[sRootKey].messages;
								if (aMessages && aMessages.length > 0) {
									var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
									return oMsg.getText(aMessages[0].messageKey);
								}
								return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_MSG_PUBLISH_LIMIT");
							}
						}
						return undefined;
					}
				},
				change: function(oEvent){
				    if(fnChange){
				        fnChange.apply(oController,[oEvent]); 
				    }else{
				        return;
				    }
				}
			});

			oCodeControl.addStyleClass("sapUiInoControlMinWidth50");

			var oItemTemplate = new sap.ui.core.ListItem();
			oItemTemplate.bindProperty("text", {
				path: "code>CODE",
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCode)
			});
			oItemTemplate.bindProperty("key", {
				path: "code>CODE"
			});

			oCodeControl.bindAggregation("items", {
				path: "code>/" + sCode,
				template: oItemTemplate,
				parameters: {
					includeEmptyCode: bEmpty
				},
				length: 300
			});
		} else {
			oCodeControl = new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath(sRootKey, false),
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCode)
				}
			});
		}
		return oCodeControl;
	},

	_createAdvanceChangeContent: function(aContent) {
		var oMatrix = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["40%", "10px", "60%"]
		});

		var oRow;
		var oCell;

		jQuery.each(aContent, function(iIdx, oValue) {
			oRow = new sap.ui.commons.layout.MatrixLayoutRow();

			oCell = new sap.ui.commons.layout.MatrixLayoutCell();
			var oLabel = undefined;
			if (oValue.label) {
				oLabel = new sap.ui.commons.Label({
					text: oValue.label,
					wrapping: true
				});
				oCell.addContent(oLabel);
			}
			oRow.addCell(oCell);

			oCell = new sap.ui.commons.layout.MatrixLayoutCell();
			oRow.addCell(oCell);

			oCell = new sap.ui.commons.layout.MatrixLayoutCell();
			var oTextView = undefined;
			if (oValue.bColSpan) {
				var oNextRow = new sap.ui.commons.layout.MatrixLayoutRow({
					height: "320px"
				});
				var oNextCell = new sap.ui.commons.layout.MatrixLayoutCell({
					colSpan: 3
				});
				oNextCell.addContent(oValue.object);
				oNextRow.addCell(oNextCell);
				oMatrix.insertRow(oNextRow, iIdx + 1);
			} else if (oValue.object) {
				oCell.addContent(oValue.object);
			} else if (oValue.text) {
				oTextView = new sap.ui.commons.TextView({
					text: oValue.text
				});
				oCell.addContent(oTextView);
			}
			oRow.addCell(oCell);

			if (oLabel) {
				if (oTextView) {
					oTextView.addAriaLabelledBy(oLabel);
					oLabel.setLabelFor(oTextView);
				} else if (oValue.object && typeof oValue.object.addAriaLabelledBy === "function") {
					oValue.object.addAriaLabelledBy(oLabel);
					oLabel.setLabelFor(oValue.object);
				}
			}

			if (oValue.divider) {
				oRow.addStyleClass("sapUiInoVerticalDiv");
			}

			oMatrix.insertRow(oRow, iIdx);
		});

		return oMatrix;
	},

	_getCodeItemTemplate: function(sCodePath, sCodeTable, sCodeBoundPath) {
		return new sap.ui.core.ListItem({
			text: {
				path: sCodePath,
				formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable)
			},
			key: sCodeBoundPath,
			tooltip: {
				path: sCodePath,
				formatter: sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
			}
		});
	}

}));