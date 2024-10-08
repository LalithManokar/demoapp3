/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.controls.Milestone");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignMilestoneValidationMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignDefaultDateMixin");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.Device");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignSettingPageFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, sap.ui.ino.views.backoffice.campaign.CampaignMilestoneDateConverterMixin, sap.ui.ino.views.backoffice.campaign.CampaignMilestoneValidationMixin,
	sap.ui.ino.views.backoffice.campaign.CampaignDefaultDateMixin, sap.ui.Device, {
		onSelectionChanged: function(oEvent, sId, sPath) {
			var oView = this.getView();
			var nIndex = oEvent.getSource().getSelectedIndex();
			var oCore = sap.ui.getCore();
			var oTable = oCore.byId(sId);
			oTable.setBindingContext(oEvent.getParameter("rowContext"), this.getModelName());
			if (sId === oView._CONST_CONFIG.Task.DetailId) {
				oCore.byId(oView._CONST_CONFIG.Milestone.ListId).bindRows({
					path: this.getFormatterPath("Tasks/" + nIndex + "/Milestones", true)
				});
				var milestoneProperty = "/" + oView._CONST_CONFIG.Milestone.SelectedProName;
				this.getModel().setProperty(milestoneProperty, -1);
			}
			this.getModel().setProperty(sPath, -1);
			this.getModel().setProperty(sPath, nIndex);
		},

		onChangeCampaginMilestoneEnabled: function(oEvent) {
			var oModel = this.getModel();
			var bChecked = oEvent.getParameter("checked");
			if (!bChecked) {
				return;
			}
			oModel.addDefaultTasksAndMilestones();
		},

		addAttachment: function(attachmentId, fileName, mediaType) {
			var oView = this.getView();
			var taskProperty = "/" + oView._CONST_CONFIG.Task.SelectedProName;
			var milestoneProperty = "/" + oView._CONST_CONFIG.Milestone.SelectedProName;
			var oModel = oView.getController().getModel();
			oModel.addMilestoneAttachment({
				ATTACHMENT_ID: attachmentId,
				FILE_NAME: fileName,
				MEDIA_TYPE: mediaType
			}, oModel.getProperty(taskProperty), oModel.getProperty(milestoneProperty));
		},

		removeAttachment: function(assignmentId) {
			var oView = this.getView();
			var taskProperty = "/" + oView._CONST_CONFIG.Task.SelectedProName;
			var milestoneProperty = "/" + oView._CONST_CONFIG.Milestone.SelectedProName;
			var oModel = oView.getController().getModel();
			oModel.removeMilestoneAttachment(assignmentId, oModel.getProperty(taskProperty), oModel.getProperty(milestoneProperty));
		},

		newCampaignTask: function() {
			var sDefaultTaskKey = "";
			var oTaskCtrl = sap.ui.getCore().byId("cmdMilestoneTask");
			var oModel = this.getModel();
			if (oTaskCtrl && oTaskCtrl.getItems() && oTaskCtrl.getItems().length > 0) {
				sDefaultTaskKey = oTaskCtrl.getItems()[0].getProperty("key");
			}
			var iHandle = this.getModel().newCampaignTask(sDefaultTaskKey, this.convertDefaultTaskDate(oModel.getProperty("/VALID_FROM"), oModel.getProperty(
				"/VALID_TO")));
			if (iHandle !== 0) {
				this.setTableDataContextByID(this.getView()._CONST_CONFIG.Task.ListId, iHandle, oModel.getProperty("/Tasks").length);
			}
		},

		deleteCampaignTask: function(oEvent, sId) {
			var oTable = sap.ui.getCore().byId(sId);
			if (oTable.getSelectedIndex() < 0) {
				return;
			}
			this.getModel().deleteCampaignTask(oTable.getSelectedIndex());
			oTable.setSelectedIndex(-1);
		},

		newMilestone: function() {
			var oModel = this.getModel();
			var nParentIndex = oModel.getProperty("/" + this.getView()._CONST_CONFIG.Task.SelectedProName);
			var oTask = oModel.getProperty("/Tasks/" + nParentIndex);
			var iHandle = this.getModel().newMilestone(nParentIndex, this.convertDefaultMilestoneDate(oTask.DATE_TYPE_CODE, oTask.START_DATE, oTask
				.START_YEAR, oTask.START_QUARTER_CODE, oTask.START_MONTH_CODE, oModel.getProperty("/VALID_FROM")));
			if (iHandle !== 0) {
				this.setTableDataContextByID(this.getView()._CONST_CONFIG.Milestone.ListId, iHandle, oModel.getProperty("/Tasks/" + nParentIndex +
					"/Milestones").length);
			}
		},

		deleteMilestone: function(oEvent, sId) {
			var oTable = sap.ui.getCore().byId(sId);
			if (oTable.getSelectedIndex() < 0) {
				return;
			}
			this.getModel().deleteMilestone(this.getModel().getProperty("/" + this.getView()._CONST_CONFIG.Task.SelectedProName), oTable.getSelectedIndex());
			oTable.setSelectedIndex(-1);
		},

		handleColorPickerLiveChange: function(oEvent) {
			var oConstConfig = this.getView()._CONST_CONFIG;
			var nIndex = sap.ui.getCore().byId(oConstConfig.Milestone.ListId).getSelectedIndex();
			var oColors = oEvent.getParameters();
			var oModel = this.getModel();
			var sColor = "FFFFFF";
			var sPath = "/Tasks/" + oModel.getProperty("/" + oConstConfig.Task.SelectedProName) + "/Milestones/" + nIndex +
				"/MILESTONE_COLOR_CODE";
			if (oColors.hex && oColors.hex.length === 7) {
				sColor = oColors.hex.substr(1);
			}
			oModel.setProperty(sPath, sColor);
		},

		onTaskUpDownPressed: function(oEvent, sID, bUpDown) { //if bUpDown is True which Means Up pressed,else means Down pressed
			var oView = this.getView();
			var oModel = this.getModel();
			var oTable = sap.ui.getCore().byId(sID);
			var iSelectedId = oModel.getProperty("/" + oView._CONST_CONFIG.Task.SelectedProName);
			var oSelectedRowContext = oTable.getContextByIndex(iSelectedId);

			if (!oSelectedRowContext) {
				var oTextModel = this.getTextModel();
				jQuery.sap.log.error(oTextModel.getText("BO_CAMPAIGN_TASK_ADMINISTRATION_INS_SELECT_CRITERION"));
				return;
			}
			var oTask = oSelectedRowContext.getObject();
			if (bUpDown) {
				oModel.moveTaskUp(oTask);
				oTable.setSelectedIndex(iSelectedId - 1);
			} else {
				oModel.moveTaskDown(oTask);
				oTable.setSelectedIndex(iSelectedId + 1);
			}
		},

		formaterDate: function(sDateTypeCode, sDate, sMoth, sQuarter, sYear) {
			var oCode = this.getView()._CONST_CONFIG.DateTypeCode;
			if (sDateTypeCode === oCode.Day) {
				if (!sDate) {
					return "";
				}
				if (typeof(sDate) === "string") {
					return sDate;
				}
				return sap.ui.ino.models.formatter.DateFormatter.formatInfinity(sDate);
			}
			if (sDateTypeCode === oCode.Month) {
				if (sMoth && sYear) {
					return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", sMoth) + " " + sYear;
				}
				return "";
			}
			if (sDateTypeCode === oCode.Quarter) {
				if (sQuarter && sYear) {
					return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", sQuarter) + " " + sYear;
				}
				return "";
			}
			return "";
		},

		setTableDataContextByID: function(sId, iTaskID, nCount) {
			var oModel = this.getModel();
			var oTable = sap.ui.getCore().byId(sId);
			for (var i = 0; i < nCount; i++) {
				var oRowContext = oTable.getContextByIndex(i);
				var iID = oModel.getProperty("ID", oRowContext);
				if (iID === iTaskID) {
					oTable.setSelectedIndex(i);
					oTable.setFirstVisibleRow(i);
					return;
				}
			}
		},

		onChangeSortDateOfMilestone: function() {
			var oController = this;
			var oModel = oController.getModel();
			var oView = oController.getView();
			var taskProperty = "/" + oView._CONST_CONFIG.Task.SelectedProName;
			oController.convertDateOfMilestoneIncludeDay("/Tasks" + taskProperty + "/START_DATE", oModel.getProperty("/Tasks" + taskProperty +
					"/END_DATE"),
				oModel.getProperty("/Tasks" + taskProperty + "/Milestones"), "SortDate");
		},

		onMileStonePreview: function(oEvent) {
			var oView = this.getView();
			var that = this;
			var oModel = this.getModel();
			var oOriginTasks = {
				Tasks: oModel.oData.Tasks
			};
			var oNewTasks = {};
			jQuery.extend(true, oNewTasks, oOriginTasks);
			var aTasks = oNewTasks.Tasks;
			this.convertDateOfTaskAndMilestone(oModel.getProperty("/VALID_FROM"), oModel.getProperty("/VALID_TO"), aTasks);
			jQuery.each(aTasks, function(index, oTask) {
				if (!oTask.TASK_NAME) {
					oTask.TASK_NAME = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.MilestoneTask.Root", oTask.TASK_CODE);
				}
				oTask.END_MONTH = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", oTask.END_MONTH_CODE);
				oTask.END_QUARTER = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", oTask.END_QUARTER_CODE);
				oTask.START_MONTH = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", oTask.START_MONTH_CODE);
				oTask.START_QUARTER = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions", oTask.START_QUARTER_CODE);

				if (!oTask.Milestones) {
					oTask.Milestones = [];
				} else {
					jQuery.each(oTask.Milestones, function(i, oMilestone) {
						if (!oMilestone.Attachment) {
							oMilestone.Attachment = [];
						} else if (oMilestone.Attachment.length) {
							oMilestone.Attachment[0].LABEL = that.getTextModel().getText("BO_MILESTONE_BTN_DOWNLOAD");
							oMilestone.Attachment[0].ATTACHMENT_URL = sap.ui.ino.application.Configuration.getAttachmentDownloadURL(oMilestone.Attachment[0].ATTACHMENT_ID);
						}
						oMilestone.MILESTONE_MONTH = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions",
							oMilestone.MILESTONE_MONTH_CODE);
						oMilestone.MILESTONE_QUARTER = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.ValueOptions",
							oMilestone.MILESTONE_QUARTER_CODE);
					});
				}
			});
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("milestonevalidations", sap.ui.core.MessageType.Error);
			if (!this.validateRequireField(aTasks) || !this.validateCount(aTasks) || !this.validateDate(aTasks, oModel.getProperty("/VALID_FROM"),
				oModel.getProperty("/VALID_TO"))) {
				return;
			}
			var oMileStone = new sap.ui.ino.controls.Milestone({
				tasks: aTasks,
				visible: true
			});
			oView.oPreviewDialog.removeAllContent();
			oView.oPreviewDialog.addContent(oMileStone);
			oView.oPreviewDialog.open();
			sap.ui.Device.resize.attachHandler(function() {
				oView.oPreviewDialog.close();
			});
		}
	}));