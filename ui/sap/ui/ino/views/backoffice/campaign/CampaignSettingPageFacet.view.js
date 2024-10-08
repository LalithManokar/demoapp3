/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.controls.AttachmentControl");
jQuery.sap.require("sap.ui.ino.controls.Attachment");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

var Configuration = sap.ui.ino.application.Configuration;
sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignSettingPageFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
	_CONST_CONFIG: {
		EnableMilestoneName: "IS_MILESTONE_ACTIVE",
		DateTypeCode: {
			Day: "DAY",
			Month: "MONTH",
			Quarter: "QUARTER"
		},
		Task: {
			ListId: "tableTaskList",
			DetailId: "layoutTaskDetail",
			SelectedProName: "SELECTED_TASK",
			Code: {
				Overall: "sap.ino.config.CAMP_OVERALL",
				Submission: "sap.ino.config.IDEA_SUBMISSION",
				Register: "sap.ino.config.CAMP_REGISTRATION"
			}
		},
		Milestone: {
			ListId: "tableMilestoneList",
			DetailId: "layoutMilestoneDetail",
			SelectedProName: "SELECTED_MILESTONE"
		},
		TableType: {
			Task: 0,
			Milestone: 1
		}
	},

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignSettingPageFacet";
	},

	createFacetContent: function() {
		var oView = this;
		var oController = oView.getController();
		var bEdit = oController.isInEditMode();
		oView._resetFacetContent();
		oView._destoryFacetContent();
		var oLayout = new sap.ui.commons.layout.MatrixLayout();
		oView._createEnableMilestoneRow(oLayout, bEdit);
		//tasklist
		var oContentLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: true
		});
		oView._createPreviewButton(oContentLayout);
		oView._createPreviewDialog();
		oView._createTaskListTitle(oContentLayout);
		oView._createTaskListButtonToolbar(oContentLayout, bEdit);
		oView._createTaskList(oContentLayout);
		oView._createTaskDetail(oContentLayout, bEdit);
		//Milestone
		var oMilestoneContentLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				parts: [{
					path: oController.getFormatterPath(oView._CONST_CONFIG.Task.SelectedProName, true)
                }],
				formatter: function(nIndex) {
					return nIndex >= 0;
				}
			}
		});
		oView._createMilestoneListButtonToolbar(oMilestoneContentLayout, bEdit);
		oView._createMilestoneList(oMilestoneContentLayout);
		oView._createMilestoneDetail(oMilestoneContentLayout, bEdit);
		//add task row
		var oContentRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oContentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oContentLayout]
		}));
		oLayout.addRow(oContentRow);
		//add milestone row
		var oMilestoneContentRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMilestoneContentRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oMilestoneContentLayout]
		}));
		oLayout.addRow(oMilestoneContentRow);
		//add into group
		var content = [new sap.ui.ux3.ThingGroup({
			content: oLayout,
			colspan: true
		})];
		return content;
	},

	_createEnableMilestoneRow: function(oLayout, bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLabel = oView.createControl({
			Type: "label",
			Text: "BO_CAMPAIGN_FACET_SETTING_FLD_ENABLE_MILESTONES"
		});
		oLabel.addStyleClass("sapInoCampaginMilestoneEnabled");
		var oChkBox = new sap.ui.commons.CheckBox({
			editable: bEdit,
			checked: {
				path: oController.getFormatterPath(oView._CONST_CONFIG.EnableMilestoneName, true),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			ariaLabelledBy: oLabel,
			change: function(oEvent) {
				oController.onChangeCampaginMilestoneEnabled(oEvent);
			}
		});

		oLabel.setLabelFor(oChkBox);
		var oHBox = new sap.m.HBox({
			items: [oLabel, new sap.ui.commons.Label({
				width: "20px"
			}), oChkBox]
		});
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oHBox]
		}));
		oLayout.addRow(oRow);
	},

	_createPreviewButton: function(oLayout) {
		var oView = this;
		var oController = oView.getController();
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			height: "30px"
		});
		var oPreviewBtn = new sap.ui.commons.Button({
			text: oController.getTextPath("BO_MILESTONE_BTN_PREVIEW"),
			enabled: {
				path: oController.getFormatterPath("Tasks", true),
				formatter: function(aTask) {
					return aTask && aTask.length >= 1;
				}
			},
			press: [

				function(oEvent) {
					oController.onMileStonePreview(oEvent);
				},
				this]
		});
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: oPreviewBtn
		}));
		oLayout.addRow(oRow);
	},
	_createPreviewDialog: function() {
		this.oPreviewDialog = new sap.ui.commons.Dialog({
			title: "Preview",
			content: [],
			width: "70%",
			resizable: false,
			//height: "50%",
			modal: true
		}).addStyleClass("milestone-preview-dialog");
	},
	_createTaskListTitle: function(oLayout) {
		var oView = this;
		var oTaskTitleRow = new sap.ui.commons.layout.MatrixLayoutRow({
			height: "30px"
		});
		oTaskTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView.createControl({
				Type: "label",
				Text: "BO_MILESTONE_FLD_TITLE_OF_ACTIVITY_TEXT"
			})]
		}));
		oLayout.addRow(oTaskTitleRow);
	},

	_createTaskListButtonToolbar: function(oLayout, bEdit) {
		var oView = this;
		var bUpDown = true;
		var oController = oView.getController();
		oLayout.addRow(oView._createButtonToolbarRow(bEdit, oView._CONST_CONFIG.Task.SelectedProName, function(oEvent) {
			oController.newCampaignTask(oEvent);
		}, function(oEvent) {
			oController.deleteCampaignTask(oEvent, oView._CONST_CONFIG.Task.ListId);
		}, bUpDown));
	},

	_createTaskList: function(oLayout) {
		var oView = this;
		var oController = oView.getController();
		var oTaskListRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTable = new sap.ui.table.Table({
			id: oView._CONST_CONFIG.Task.ListId,
			rows: oController.getBoundPath("Tasks", true),
			selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCount: 5,
			columns: [new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_TITLE_OF_ACTIVITY_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: oController.getFormatterPath("TASK_CODE"),
						formatter: function(sTaskCode) {
							return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.MilestoneTask.Root", sTaskCode);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_START_DATE_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						parts: [{
							path: oController.getFormatterPath("DATE_TYPE_CODE")
                        }, {
							path: oController.getFormatterPath("START_DATE"),
							type: new sap.ui.model.type.Date({
								style: "medium"
							})
                        }, {
							path: oController.getFormatterPath("START_MONTH_CODE")
                        }, {
							path: oController.getFormatterPath("START_QUARTER_CODE")
                        }, {
							path: oController.getFormatterPath("START_YEAR")
                        }],
						formatter: function(sDateTypeCode, sDate, sMoth, sQuarter, sYear) {
							return oController.formaterDate(sDateTypeCode, sDate, sMoth, sQuarter, sYear);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_END_DATE_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						parts: [{
							path: oController.getFormatterPath("DATE_TYPE_CODE")
                        }, {
							path: oController.getFormatterPath("END_DATE"),
							type: new sap.ui.model.type.Date({
								style: "medium"
							})
                        }, {
							path: oController.getFormatterPath("END_MONTH_CODE")
                        }, {
							path: oController.getFormatterPath("END_QUARTER_CODE")
                        }, {
							path: oController.getFormatterPath("END_YEAR")
                        }],
						formatter: function(sDateTypeCode, sDate, sMoth, sQuarter, sYear) {
							return oController.formaterDate(sDateTypeCode, sDate, sMoth, sQuarter, sYear);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_NUMBER_OF_MILESTONE_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: oController.getFormatterPath("MILESTONE_COUNT")
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_ENABLED_TEXT"
				}),
				template: oView.createControl({
					Type: "checkbox",
					Text: "IS_TASK_DISPLAY",
					Editable: false
				})
			})],
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent, oView._CONST_CONFIG.Task.DetailId, "/" + oView._CONST_CONFIG.Task.SelectedProName);
			}
		});
		oTaskListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTable]
		}));
		oLayout.addRow(oTaskListRow);
	},

	_createTaskDetail: function(oLayout, bEdit) {
		var oView = this;
		oView._createDetail(oLayout, oView._CONST_CONFIG.Task.DetailId, oView._CONST_CONFIG.Task.SelectedProName, [oView._createTaskTypeRow(
				bEdit)
    		, oView._createDateTypeRow(bEdit, "DATE_TYPE_CODE", oView._CONST_CONFIG.TableType.Task)
    		, oView._createTaskDateRow(bEdit)
    		, oView._createEnableRow(bEdit, "IS_TASK_DISPLAY", "BO_MILESTONE_FLD_ENABLE_TASK_TEXT")]);
	},

	_createTaskTypeRow: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oTaskTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTaskTypeLabel = new sap.ui.commons.Label({
			required: true,
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_TITLE_OF_ACTIVITY_TEXT"),
			textAlign: sap.ui.core.TextAlign.Right
		});
		var oValueListSettings = {
			Id: "cmdMilestoneTask",
			Path: "TASK_CODE",
			CodeTable: "sap.ino.xs.object.basis.MilestoneTask.Root",
			Visible: {
				path: oView.getFormatterPath("TASK_CODE"),
				formatter: function(sTaskCode) {
					return bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG.Task.Code.Submission &&
						sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
				}
			},
			Editable: true,
			Node: "Tasks",
			LabelControl: oTaskTypeLabel,
			Filters: new sap.ui.model.Filter([
			    new sap.ui.model.Filter("CODE", sap.ui.model.FilterOperator.NE, oView._CONST_CONFIG.Task.Code.Overall),
			    new sap.ui.model.Filter("CODE", sap.ui.model.FilterOperator.NE, oView._CONST_CONFIG.Task.Code.Submission),
			    new sap.ui.model.Filter("CODE", sap.ui.model.FilterOperator.NE, oView._CONST_CONFIG.Task.Code.Register)
		    ], true)
		};
		var oTaskname = new sap.ui.commons.TextView({
			text: {
				path: oController.getFormatterPath("TASK_CODE"),
				formatter: function(sTaskCode) {
					return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.MilestoneTask.Root", sTaskCode);
				}
			},
			visible: {
				path: oView.getFormatterPath("TASK_CODE"),
				formatter: function(sTaskCode) {
					return !bEdit || sTaskCode === oView._CONST_CONFIG.Task.Code.Overall || sTaskCode === oView._CONST_CONFIG.Task.Code.Submission ||
						sTaskCode === oView._CONST_CONFIG.Task.Code.Register;
				}
			}
		});
		oTaskTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTaskTypeLabel],
			hAlign: sap.ui.commons.layout.HAlign.End
		}));
		oTaskTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTaskTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView._createDropDownBoxForCode(oValueListSettings), oTaskname]
		}));
		return oTaskTypeRow;
	},

	_createEnableRow: function(bEdit, sPath, sTxtBinding) {
		var oView = this;
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLabel = oView.createControl({
			Type: "label",
			Text: sTxtBinding
		});
		var oChkBox = new sap.ui.commons.CheckBox({
			editable: {
				path: oView.getFormatterPath("TASK_CODE"),
				formatter: function(sTaskCode) {
					if (sPath === "IS_TASK_DISPLAY") {
						return bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall;
					}
					return bEdit;
				}
			},
			checked: {
				path: oView.getFormatterPath(sPath),
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			ariaLabelledBy: oLabel
		});

		oLabel.setLabelFor(oChkBox);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLabel],
			hAlign: sap.ui.commons.layout.HAlign.End
		}));
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oChkBox]
		}));
		return oRow;
	},

	_createTaskDateRow: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oStartDateLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_STARTDATE"),
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			visible: {
				path: oController.getFormatterPath("DATE_TYPE_CODE"),
				formatter: function(sCode) {
					return !!sCode;
				}
			}
		});
		var oStartDateLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oStartDateLabel]
		});
		var oStartDateCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView._getDateField(oStartDateLabel, bEdit, true, false)]
		});
		var oEndDateLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_ENDDATE"),
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			visible: {
				path: oController.getFormatterPath("DATE_TYPE_CODE"),
				formatter: function(sCode) {
					return !!sCode;
				}
			}
		});
		var oEndDateLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEndDateLabel]
		});

		var oEndDateCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView._getDateField(oEndDateLabel, bEdit, true, true)]
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(oStartDateLabelCell);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oStartDateCell);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oEndDateLabelCell);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oEndDateCell);
		return oRow;
	},

	//milestone
	_createMilestoneListButtonToolbar: function(oLayout, bEdit) {
		var oView = this;
		var oController = oView.getController();
		oLayout.addRow(oView._createButtonToolbarRow(bEdit, oView._CONST_CONFIG.Milestone.SelectedProName, function(oEvent) {
			oController.newMilestone(oEvent);
		}, function(oEvent) {
			oController.deleteMilestone(oEvent, oView._CONST_CONFIG.Milestone.ListId);
		}));
	},

	_createMilestoneList: function(oLayout) {
		var oView = this;
		var oController = oView.getController();
		var oListRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTable = new sap.ui.table.Table({
			id: oView._CONST_CONFIG.Milestone.ListId,
			selectionMode: sap.ui.table.SelectionMode.Single,
			//rows: oController.getBoundPath("Milestones"),
			visibleRowCount: 10,
			columns: [new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_MILESTONES_NAME_TEXT"
				}),
				template: oView.createControl({
					Type: "textview",
					Text: "MILESTONE_NAME",
					Editable: false
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_MILESTONE_DATE_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						parts: [{
							path: oController.getFormatterPath("DATE_TYPE_CODE")
                        }, {
							path: oController.getFormatterPath("MILESTONE_DATE"),
							type: new sap.ui.model.type.Date({
								style: "medium"
							})
                        }, {
							path: oController.getFormatterPath("MILESTONE_MONTH_CODE")
                        }, {
							path: oController.getFormatterPath("MILESTONE_QUARTER_CODE")
                        }, {
							path: oController.getFormatterPath("MILESTONE_YEAR")
                        }],
						formatter: function(sDateTypeCode, sDate, sMoth, sQuarter, sYear) {
							return oController.formaterDate(sDateTypeCode, sDate, sMoth, sQuarter, sYear);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_COLOR_TEXT"
				}),
				template: new sap.ui.core.HTML({
					content: {
						path: oController.getFormatterPath("MILESTONE_COLOR_CODE"),
						formatter: function(sColor) {
							if (!sColor) {
								sColor = "FFFFFF";
							}
							sColor = "#" + sColor;
							return "<div class='sapUiInoCampaignMilestoneColorSample' style='background-color: " + sColor + ";'>&nbsp;</div>";
						}
					},
					sanitizeContent: true
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_ATTACHMENT_TEXT"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: oController.getFormatterPath("Attachment"),
						formatter: function(aAttachment) {
							if (aAttachment && aAttachment.length > 0) {
								return aAttachment[0].FILE_NAME;
							}
							return "";
						}
					}
				})
			}), new sap.ui.table.Column({
				label: oView.createControl({
					Type: "label",
					Text: "BO_MILESTONE_FLD_ENABLED_TEXT"
				}),
				template: oView.createControl({
					Type: "checkbox",
					Text: "IS_MILESTONE_DISPLAY",
					Editable: false
				})
			})],
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent, oView._CONST_CONFIG.Milestone.DetailId, "/" + oView._CONST_CONFIG.Milestone.SelectedProName);
			}
		});
		oListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTable]
		}));
		oLayout.addRow(oListRow);
	},

	_createMilestoneDetail: function(oLayout, bEdit) {
		var oView = this;
		oView._createDetail(oLayout, oView._CONST_CONFIG.Milestone.DetailId, oView._CONST_CONFIG.Milestone.SelectedProName, [oView
			._createMilestoneNameAndAttachmentRow(bEdit)
    		, oView._createDateTypeRow(bEdit, "DATE_TYPE_CODE", oView._CONST_CONFIG.TableType.Milestone)
			, oView._createMilestoneDateRow(bEdit)
			, oView._createMilestoneColorRow(bEdit)
    		, oView._createEnableRow(bEdit, "IS_MILESTONE_DISPLAY", "BO_MILESTONE_FLD_ENABLE_MILESTONE_TEXT")]);
	},

	_createMilestoneNameAndAttachmentRow: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oNameLabel = new sap.ui.commons.Label({
			required: true,
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_MILESTONES_NAME_TEXT"),
			textAlign: sap.ui.core.TextAlign.Right
		});
		var oNameField = oView.createControl({
			Type: "textfield",
			Text: "MILESTONE_NAME",
			LabelControl: oNameLabel,
			Node: "Tasks/Milestones",
			Editable: true,
			Visible: {
				path: oController.getFormatterPath("MILESTONE_CODE"),
				formatter: function(sCode) {
					return !sCode && bEdit;
				}
			}
		});
		var oNameTxtField = new sap.ui.commons.TextView({
			visible: {
				parts: [{
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sCode) {
					return !!sCode || !bEdit;
				}
			},
			text: {
				path: oController.getFormatterPath("MILESTONE_NAME")
			},
			ariaLabelledBy: oNameLabel
		});
		oNameLabel.setLabelFor(oNameTxtField);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oNameLabel],
			hAlign: sap.ui.commons.layout.HAlign.End
		}));
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oNameField, oNameTxtField]
		}));
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		var oAttachmentLabel = oView.createControl({
			Type: "label",
			Text: "BO_MILESTONE_FLD_ATTACHMENT_TEXT"
		});
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oAttachmentLabel],
			hAlign: sap.ui.commons.layout.HAlign.End
		}));
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			rowSpan: 5,
			vAlign: sap.ui.commons.layout.VAlign.Top,
			content: [oView._createMilestoneAttachmentCntrl(bEdit)]
		}));
		return oRow;
	},

	_createMilestoneAttachmentCntrl: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oAttachmentControl, oAttachmentTemplate;
		if (bEdit) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			var oAttachmentFileUploader = new sap.ui.ino.controls.FileUploader({
				visible: {
					path: oController.getFormatterPath("Attachment"),
					formatter: function(aAttachment) {
						if (aAttachment && aAttachment.length > 0) {
							return false;
						}
						return true;
					}
				},
				uploadTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_ADD}",
				style: sap.ui.ino.controls.FileUploaderStyle.Attachment,
				uploadSuccessful: function(evt) {
					oController.addAttachment(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("milestoneattachments");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("milestoneattachments");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "milestoneattachments");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
				attachmentFileUploader: oAttachmentFileUploader,
				ariaLivePriority: sap.ui.ino.controls.AriaLivePriority.assertive,
				useRoleFilter: true,
				roleFilters: ["ATTACHMENT"]
			});
			oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
				assignmentId: oController.getBoundPath("ID"),
				attachmentId: oController.getBoundPath("ATTACHMENT_ID"),
				roleFilter: oController.getBoundPath("ROLE_TYPE_CODE"),
				mediaType: oController.getBoundPath("MEDIA_TYPE"),
				fileName: oController.getBoundPath("FILE_NAME"),
				url: {
					path: oController.getFormatterPath("ATTACHMENT_ID"),
					formatter: function(attachmentId) {
						return Configuration.getAttachmentDownloadURL(attachmentId);
					}
				},
				removeTooltip: "{i18n>CTRL_ATTACHMENT_CONTROL_REMOVE}",
				editable: true,
				backendRemove: false,
				removeSuccessful: function(evt) {
					oController.removeAttachment(evt.getParameters().assignmentId);
					oApp.removeNotificationMessages("milestoneattachments");
				},
				removeFailed: function(evt) {
					oApp.removeNotificationMessages("milestoneattachments");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "milestoneattachments");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			oAttachmentControl.bindAttachments({
				path: oController.getFormatterPath("Attachment"),
				template: oAttachmentTemplate
			});
		} else {
			oAttachmentControl = new sap.ui.ino.controls.AttachmentControl();
			oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
				assignmentId: oController.getBoundPath("ID"),
				attachmentId: oController.getBoundPath("ATTACHMENT_ID"),
				roleFilter: oController.getBoundPath("ROLE_TYPE_CODE"),
				mediaType: oController.getBoundPath("MEDIA_TYPE"),
				fileName: oController.getBoundPath("FILE_NAME"),
				url: {
					path: oController.getFormatterPath("ATTACHMENT_ID", false),
					formatter: function(attachmentId) {
						return Configuration.getAttachmentDownloadURL(attachmentId);
					}
				},
				editable: false
			});
			oAttachmentControl.bindAttachments({
				path: oController.getFormatterPath("Attachment"),
				template: oAttachmentTemplate
			});
		}
		return oAttachmentControl;
	},

	_createMilestoneDateRow: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oDateLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_MILESTONE_DATE_TEXT"),
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			visible: {
				path: oController.getFormatterPath("DATE_TYPE_CODE"),
				formatter: function(sCode) {
					return !!sCode;
				}
			}
		});
		var oDateLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oDateLabel]
		});
		var oDateCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView._getDateField(oDateLabel, bEdit, false, false)]
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(oDateLabelCell);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oDateCell);
		return oRow;
	},

	_createMilestoneColorRow: function(bEdit) {
		var oView = this;
		var oController = oView.getController();
		var oColorLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_COLOR_TEXT"),
			design: sap.ui.commons.TextViewDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oColorLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oColorLabel]
		});
		var oColorPickerCell = new sap.ui.commons.layout.MatrixLayoutCell();
		if (bEdit) {
			var oColorPicker = new sap.ui.commons.ColorPicker({
				colorString: {
					path: oController.getFormatterPath("MILESTONE_COLOR_CODE"),
					formatter: function(sColor) {
						if (sColor) {
							return "#" + sColor;
						}
						return "#FFFFFF";
					}
				},
				liveChange: function(oEvent) {
					oController.handleColorPickerLiveChange(oEvent);
				}
			});
			oColorPicker.addStyleClass("sapUiInoCampaignColorPicker");
			oColorPickerCell.addContent(oColorPicker);
			oColorLabel.setLabelFor(oColorPicker);
		} else {
			var oColorHtml = new sap.ui.core.HTML({
				content: {
					path: oController.getFormatterPath("MILESTONE_COLOR_CODE"),
					formatter: function(sColor) {
						if (!sColor) {
							sColor = "FFFFFF";
						}
						sColor = "#" + sColor;
						return "<div class='sapUiInoCampaignsettingColorSample' style='background-color: " + sColor + ";'>&nbsp;</div>";
					}
				},
				sanitizeContent: true
			});
			oColorPickerCell.addStyleClass("sapUiInoCampaignColorSampleContainer");
			oColorPickerCell.addContent(oColorHtml);
			oColorLabel.setLabelFor(oColorHtml);
		}
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(oColorLabelCell);
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRow.addCell(oColorPickerCell);
		return oRow;
	},

	//common method
	_createDetail: function(oLayout, sId, sPath, aRows) {
		var oView = this;
		var oController = oView.getController();
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oDetailLayout = new sap.ui.commons.layout.MatrixLayout({
			id: sId,
			visible: {
				parts: [{
					path: oController.getFormatterPath(sPath, true)
                }],
				formatter: function(nIndex) {
					return nIndex >= 0;
				}
			},
			columns: 8,
			widths: ['180px', '20px', '40%', '20px', '130px', '20px', '40%', '20%']
		});

		for (var index = 0; index <= aRows.length - 1; index++) {
			oDetailLayout.addRow(aRows[index]);
		}
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oDetailLayout]
		}));
		oLayout.addRow(oRow);
	},

	_createDateTypeRow: function(bEdit, sPath, nTableType) {
		var oView = this;
		var oController = oView.getController();
		var oDateTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oDateTypeLabel = new sap.ui.commons.Label({
			required: true,
			text: oController.getTextModel().getText("BO_MILESTONE_FLD_DATE_TYPE_TEXT"),
			textAlign: sap.ui.core.TextAlign.Right
		});
		var oValueListSettings = {
			Path: sPath,
			CodeTable: "sap.ino.xs.object.basis.Datetype.Root",
			Visible: {
				parts: [{
					path: oView.getFormatterPath("TASK_CODE")
				}, {
					path: oView.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sTaskCode, sMilestoneCode) {
					if (nTableType === oView._CONST_CONFIG.TableType.Task) {
						return bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG.Task.Code.Submission &&
							sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return bEdit && !sMilestoneCode;
					}
				}
			},
			Node: nTableType === oView._CONST_CONFIG.TableType.Task ? "Tasks" : "Tasks/Milestones",
			Editable: true,
			LabelControl: oDateTypeLabel
		};
		var oDatetypName = new sap.ui.commons.TextView({
			text: {
				path: oController.getFormatterPath("DATE_TYPE_CODE"),
				formatter: function(sTypeCode) {
					return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Datetype.Root", sTypeCode);
				}
			},
			visible: {
				parts: [{
					path: oView.getFormatterPath("TASK_CODE")
				}, {
					path: oView.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sTaskCode, sMilestoneCode) {
					if (nTableType === oView._CONST_CONFIG.TableType.Task) {
						return !bEdit || sTaskCode === oView._CONST_CONFIG.Task.Code.Overall || sTaskCode === oView._CONST_CONFIG.Task.Code.Submission ||
							sTaskCode === oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return !bEdit || !!sMilestoneCode;
					}
				}
			}
		});
		oDateTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oDateTypeLabel],
			hAlign: sap.ui.commons.layout.HAlign.End
		}));
		oDateTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oDateTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oView._createDropDownBoxForCode(oValueListSettings), oDatetypName]
		}));
		return oDateTypeRow;
	},

	_createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	_createButtonToolbarRow: function(bEdit, sPath, onNewPress, onDeletePress, bUpDown) {
		var oView = this;
		var oController = oView.getController();
		var oToolbar = new sap.ui.commons.Toolbar();
		var oNewButton = new sap.ui.commons.Button({
			text: oController.getTextPath("BO_MILESTONE_BTN_CREATE"),
			press: [onNewPress, oController],
			enabled: bEdit
		});
		oToolbar.addItem(oNewButton);
		var oDelButton = new sap.ui.commons.Button({
			text: oController.getTextPath("BO_MILESTONE_BTN_DELETE"),
			press: [onDeletePress, oController],
			enabled: {
				parts: [{
					path: oController.getFormatterPath(sPath, true)
                }],
				formatter: function(nIndex) {
					var oModel = oController.getModel();
					if (sPath === oView._CONST_CONFIG.Task.SelectedProName) {
						var sTaskCode = oModel.getProperty("/Tasks/" + nIndex + "/TASK_CODE");
						return bEdit && nIndex >= 0 && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG.Task.Code
							.Submission && sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else if (sPath === oView._CONST_CONFIG.Milestone.SelectedProName) {
						var nSelIndex = oModel.getProperty("/" + oView._CONST_CONFIG.Task.SelectedProName);
						var sMilestoneCode = oModel.getProperty("/Tasks/" + nSelIndex + "/Milestones/" + nIndex + "/MILESTONE_CODE");
						return bEdit && nIndex >= 0 && !sMilestoneCode;
					}
					return bEdit && nIndex >= 0;
				}
			}
		});
		oToolbar.addItem(oDelButton);
		if (bUpDown) //Create Up and Down Button
		{
			var oUpButton = new sap.ui.commons.Button({
				text: oController.getTextPath("BO_MILESTONE_BTN_UP"),
				press: [

				function(oEvent) {
						oController.onTaskUpDownPressed(oEvent, oView._CONST_CONFIG.Task.ListId, true);
            },
				this],
				enabled: {
					parts: [{
							path: oController.getFormatterPath(sPath, true)
                },
						{
							path: oController.getFormatterPath("Tasks", true)
                }],
					formatter: function(nIndex, aTask) {
						return bEdit && nIndex >= 1 && aTask.length > 1;
					}
				}
			});
			oToolbar.addItem(oUpButton);
			var oDownButton = new sap.ui.commons.Button({
				text: oController.getTextPath("BO_MILESTONE_BTN_DOWN"),
				press: [

				function(oEvent) {
						oController.onTaskUpDownPressed(oEvent, oView._CONST_CONFIG.Task.ListId, false);
                }],
				enabled: {
					parts: [{
							path: oController.getFormatterPath(sPath, true)
                    },
						{
							path: oController.getFormatterPath("Tasks", true)
                    }
                ],
					formatter: function(nIndex, aTask) {
						return bEdit && aTask.length > 1 && nIndex < aTask.length - 1 && nIndex >= 0;
					}
				}
			});
			oToolbar.addItem(oDownButton);
		}
		return new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oToolbar
			})]
		});
	},

	_getDateField: function(oLabel, bEdit, bIsTask, bIsEndDate) {
		var oView = this;
		if (!bIsTask) {
			return oView._getFieldOfDay(oLabel, bEdit, "MILESTONE_DATE", oView._CONST_CONFIG.TableType.Milestone)
				.concat(oView._getFieldOfMonth(oLabel, bEdit, "MILESTONE_MONTH_CODE", "MILESTONE_YEAR", oView._CONST_CONFIG.TableType.Milestone))
				.concat(oView._getFieldOfQuarter(oLabel, bEdit, "MILESTONE_QUARTER_CODE", "MILESTONE_YEAR", oView._CONST_CONFIG.TableType.Milestone));
		}
		if (!bIsEndDate) {
			return oView._getFieldOfDay(oLabel, bEdit, "START_DATE", oView._CONST_CONFIG.TableType.Task)
				.concat(oView._getFieldOfMonth(oLabel, bEdit, "START_MONTH_CODE", "START_YEAR", oView._CONST_CONFIG.TableType.Task))
				.concat(oView._getFieldOfQuarter(oLabel, bEdit, "START_QUARTER_CODE", "START_YEAR", oView._CONST_CONFIG.TableType.Task));
		}
		return oView._getFieldOfDay(oLabel, bEdit, "END_DATE", oView._CONST_CONFIG.TableType.Task)
			.concat(oView._getFieldOfMonth(oLabel, bEdit, "END_MONTH_CODE", "END_YEAR", oView._CONST_CONFIG.TableType.Task))
			.concat(oView._getFieldOfQuarter(oLabel, bEdit, "END_QUARTER_CODE", "END_YEAR", oView._CONST_CONFIG.TableType.Task));
	},

	_getFieldOfDay: function(oLabel, bEdit, sPath, sTableType) {
		var oView = this;
		var oController = oView.getController();
		var sDateType = oView._CONST_CONFIG.DateTypeCode.Day;
		var oPickerDateField = new sap.ui.commons.DatePicker({
			visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                }, {
					path: oView.getFormatterPath("TASK_CODE")
				}, {
					path: oView.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG
							.Task.Code.Submission && sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return sDateTypeCode === sDateType && bEdit && !sMilestoneCode;
					}
				}
			},
			value: {
				path: oController.getFormatterPath(sPath),
				type: new sap.ui.model.type.Date({
					style: "medium"
				})
			},
			enabled: true,
			width: '100%',
			ariaLabelledBy: oLabel,
			change: function(oEvent) {
				if (sTableType === oView._CONST_CONFIG.TableType.Milestone) {
					oController.onChangeSortDateOfMilestone(oEvent);
				}
			}
		});

		oPickerDateField.attachChange(function(oEvent) {
			if (oEvent.getParameter("invalidValue")) {
				oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
			}
		});
		var oDateField = new sap.ui.commons.TextView({
			visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                }, {
					path: oView.getFormatterPath("TASK_CODE")
				}, {
					path: oView.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && (!bEdit || sTaskCode === oView._CONST_CONFIG.Task.Code.Overall || sTaskCode === oView._CONST_CONFIG
							.Task.Code.Submission || sTaskCode === oView._CONST_CONFIG.Task.Code.Register);
					} else {
						return sDateTypeCode === sDateType && (!bEdit || !!sMilestoneCode);
					}
				}
			},
			text: {
				path: oController.getFormatterPath(sPath),
				type: new sap.ui.model.type.Date({
					style: "medium"
				}),
				formatter: function(sDate) {
					return oController.formaterDate(sDateType, sDate, null, null, null);
				}
			},
			ariaLabelledBy: oLabel
		});
		oLabel.setLabelFor(oPickerDateField);
		oLabel.setLabelFor(oDateField);
		return [oPickerDateField, oDateField];
	},

	_getFieldOfMonth: function(oLabel, bEdit, sDatePath, sYearPath, sTableType) {
		var oView = this;
		var oController = oView.getController();
		var sDateType = oView._CONST_CONFIG.DateTypeCode.Month;
		var oSettings = {
			Path: sDatePath,
			CodeTable: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions",
			Editable: true,
			Filters: new sap.ui.model.Filter([
			    new sap.ui.model.Filter("LIST_CODE", sap.ui.model.FilterOperator.EQ, "sap.ino.config.MONTH")
			    ], false),
			Visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                }, {
					path: oController.getFormatterPath("TASK_CODE")
				}, {
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG
							.Task.Code.Submission && sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return sDateTypeCode === sDateType && bEdit && !sMilestoneCode;
					}
				}
			},
			WithEmpty: false,
			Sorter: new sap.ui.model.Sorter('NUM_VALUE', false, false, function(a, b) {
				var nPrevious = parseInt(a, 10);
				var nNext = parseInt(b, 10);
				if (nPrevious < nNext) {
					return -1;
				}
				if (nPrevious > nNext) {
					return 1;
				}
				return 0;
			}),
			onChange: function(oEvent) {
				if (sTableType === oView._CONST_CONFIG.TableType.Milestone) {
					oController.onChangeSortDateOfMilestone(oEvent);
				}
			}
		};
		var oDateField = new sap.ui.commons.TextView({
			visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                }, {
					path: oController.getFormatterPath("TASK_CODE")
				}, {
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && (!bEdit || sTaskCode === oView._CONST_CONFIG.Task.Code.Overall || sTaskCode === oView._CONST_CONFIG
							.Task.Code.Submission || sTaskCode === oView._CONST_CONFIG.Task.Code.Register);
					} else {
						return sDateTypeCode === sDateType && (!bEdit || !!sMilestoneCode);
					}
				}
			},
			text: {
				parts: [{
					path: oController.getFormatterPath(sDatePath)
                    }, {
					path: oController.getFormatterPath(sYearPath)
				}],
				formatter: function(sMonth, sYear) {
					return oController.formaterDate(sDateType, null, sMonth, null, sYear);
				}
			},
			ariaLabelledBy: oLabel
		});
		oLabel.setLabelFor(oDateField);
		return [oView._createFieldForDrop(oSettings, bEdit, sDateType, sYearPath, sTableType), oDateField];
	},

	_getFieldOfQuarter: function(oLabel, bEdit, sDatePath, sYearPath, sTableType) {
		var oView = this;
		var oController = oView.getController();
		var sDateType = oView._CONST_CONFIG.DateTypeCode.Quarter;
		var oSettings = {
			Path: sDatePath,
			CodeTable: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions",
			Editable: true,
			Filters: new sap.ui.model.Filter([
			    new sap.ui.model.Filter("LIST_CODE", sap.ui.model.FilterOperator.EQ, "sap.ino.config.QUARTER")
		    ], false),
			Visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                }, {
					path: oController.getFormatterPath("TASK_CODE")
				}, {
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG
							.Task.Code.Submission && sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return sDateTypeCode === sDateType && bEdit && !sMilestoneCode;
					}
				}
			},
			WithEmpty: false,
			onChange: function(oEvent) {
				if (sTableType === oView._CONST_CONFIG.TableType.Milestone) {
					oController.onChangeSortDateOfMilestone(oEvent);
				}
			}
		};
		var oDateField = new sap.ui.commons.TextView({
			visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                    }, {
					path: oController.getFormatterPath("TASK_CODE")
				}, {
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && (!bEdit || sTaskCode === oView._CONST_CONFIG.Task.Code.Overall || sTaskCode === oView._CONST_CONFIG
							.Task.Code.Submission || sTaskCode === oView._CONST_CONFIG.Task.Code.Register);
					} else {
						return sDateTypeCode === sDateType && (!bEdit || !!sMilestoneCode);
					}
				}
			},
			text: {
				parts: [{
					path: oController.getFormatterPath(sDatePath)
                    }, {
					path: oController.getFormatterPath(sYearPath)
				}],
				formatter: function(sQuarter, sYear) {
					return oController.formaterDate(sDateType, null, null, sQuarter, sYear);
				}
			},
			ariaLabelledBy: oLabel
		});
		oLabel.setLabelFor(oDateField);
		return [oView._createFieldForDrop(oSettings, bEdit, sDateType, sYearPath, sTableType), oDateField];
	},

	_createFieldForDrop: function(oSettings, bEdit, sDateType, sYearPath, sTableType) {
		var oView = this;
		var oController = oView.getController();
		var oHBox = new sap.m.HBox({
			visible: {
				parts: [{
					path: oController.getFormatterPath("DATE_TYPE_CODE")
                    }, {
					path: oController.getFormatterPath("TASK_CODE")
				}, {
					path: oController.getFormatterPath("MILESTONE_CODE")
				}],
				formatter: function(sDateTypeCode, sTaskCode, sMilestoneCode) {
					if (sTableType === oView._CONST_CONFIG.TableType.Task) {
						return sDateTypeCode === sDateType && bEdit && sTaskCode !== oView._CONST_CONFIG.Task.Code.Overall && sTaskCode !== oView._CONST_CONFIG
							.Task.Code.Submission && sTaskCode !== oView._CONST_CONFIG.Task.Code.Register;
					} else {
						return sDateTypeCode === sDateType && bEdit && !sMilestoneCode;
					}
				}
			}
		});
		oHBox.addItem(oView._createDropDownBoxForCode(oSettings));
		oHBox.addItem(new sap.ui.commons.Label({
			width: "20px"
		}));
		
		var oYearCmb = new sap.ui.commons.DropdownBox({
			selectedKey: {
				path: oController.getFormatterPath(sYearPath),
				type: new sap.ui.model.type.String()
			},
			editable: bEdit,
			width: "100%",
			//items: aYears,
			change: function(oEvent) {
				if (sTableType === oView._CONST_CONFIG.TableType.Milestone) {
					oController.onChangeSortDateOfMilestone(oEvent);
				}
			}
		});
		oYearCmb.bindItems({
		    path : oController.getFormatterPath("MILESTONE_START_YEARS", true),
            template : new sap.ui.core.ListItem({
                text : {
                    path : oController.getFormatterPath("yearkey")
                },
                key : {
    				path: oController.getFormatterPath("yearkey")
			    }
            })
		});
		oHBox.addItem(oYearCmb);
		return oHBox;
	},

	_resetFacetContent: function() {
		var oView = this;
		var taskProperty = "/" + oView._CONST_CONFIG.Task.SelectedProName;
		var milestoneProperty = "/" + oView._CONST_CONFIG.Milestone.SelectedProName;
		var oModel = oView.getController().getModel();
		oModel.setProperty(taskProperty, -1);
		oModel.setProperty(milestoneProperty, -1);
	},

	_destoryFacetContent: function() {
		if (sap.ui.getCore().byId("cmdMilestoneTask")) {
			sap.ui.getCore().byId("cmdMilestoneTask").destroy();
		}
		if (sap.ui.getCore().byId("tableTaskList")) {
			sap.ui.getCore().byId("tableTaskList").destroy();
		}
		if (sap.ui.getCore().byId("tableMilestoneList")) {
			sap.ui.getCore().byId("tableMilestoneList").destroy();
		}
		if (sap.ui.getCore().byId("layoutTaskDetail")) {
			sap.ui.getCore().byId("layoutTaskDetail").destroy();
		}
		if (sap.ui.getCore().byId("layoutMilestoneDetail")) {
			sap.ui.getCore().byId("layoutMilestoneDetail").destroy();
		}
	}
}));