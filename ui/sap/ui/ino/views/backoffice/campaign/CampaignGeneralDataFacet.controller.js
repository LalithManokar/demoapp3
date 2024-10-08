/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignGeneralDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

		onLiveChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
		},

		onLiveNameChange: function(oEvent) {
			this.onLiveChange(oEvent);
			var oField = oEvent.getSource();
			var oBindingContext = oField.getBindingContext(this.getModelName());
			if (oBindingContext && oBindingContext.sPath) {
				var sPath = oBindingContext.sPath;
				var aParts = sPath.split("/");
				var iLanguageIdx = aParts[aParts.length - 1];

				var sUserLanguage = this.getView().getThingInspectorController().getTextModelLanguageKey();

				var aLanguages = this.getModel().oData["LanguageTexts"];
				if (aLanguages && aLanguages[iLanguageIdx]) {
					var sEditLanguage = aLanguages[iLanguageIdx].LANG;

					if (sEditLanguage === sUserLanguage) {
						// Also write the "/NAME" property for the header section
						this.getModel().setProperty("/NAME", oEvent.getParameter("liveValue"));
					} else if (sEditLanguage === sap.ui.ino.application.Configuration.getSystemDefaultLanguage()) {
						var iUserLanguagesIdx = -1;
						for (var ii = 0; ii < aLanguages.length; ++ii) {
							if (aLanguages[ii].LANG === sUserLanguage) {
								iUserLanguagesIdx = ii;
								break;
							}
						}

						if (iUserLanguagesIdx != -1) {
							var sUserValue = aLanguages[iUserLanguagesIdx] ? aLanguages[iUserLanguagesIdx].NAME : null;

							// If there is already a value in the users language do not overwrite with default language
							if (!sUserValue || sUserValue.length == 0) {
								this.getModel().setProperty("/NAME", oEvent.getParameter("liveValue"));
							}
						}
					}
				}
			}
		},

		onAfterModeSwitch: function() {
			this._initialLanguageBinding();
		},

		_initialLanguageBinding: function() {
			this.getThingInspectorController()._initialLanguageBinding(this.getView());
		},

		_isPeopleValid: function() {
			var oController = this;
			var oModel = oController.getModel();
			var rListData = oModel.getProperty("/RESP_CODE");
			var expertsData = oModel.getProperty("/Experts");
			var coachesData = oModel.getProperty("/Coaches");
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var oDeferred = new jQuery.Deferred();

			function fnConfirm(bResult) {
				if (bResult) {
					oModel.setProperty("/Experts", []);
					oModel.setProperty("/Coaches", []);
					oDeferred.resolve();
				} else {
					oDeferred.reject();
				}
			}

			if (rListData && (expertsData.length || coachesData.length)) {
				sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_CAMPAIGN_INSTANCE_INS_SUBMIT_CAMPAIGN_BEFORE_PUBLISH_CHANGE"), fnConfirm, i18n
					.getText("BO_CAMPAIGN_INSTANCE_TIT_ASSIGNMENT_RESPONSIBILITY_CONFIRM"));
			} else {
				oDeferred.resolve();
			}
			return oDeferred;
		},

		onTagAdded: function(oTextField) {
			var oTIView = this.getThingInspectorView();
			oTIView.removeAllMessages("TAG");
			var oSelectedItem = sap.ui.getCore().byId(oTextField.getSelectedItemId());
			var iTagId = undefined;
			var sName = undefined;

			if (oSelectedItem) {
				iTagId = parseInt(oSelectedItem.getKey(), 10);
				sName = oSelectedItem.getText();
			} else {
				sName = oTextField.getValue();
			}

			var oIdea = this.getModel();
			var oMessage = oIdea.addTag({
				TAG_ID: iTagId,
				NAME: sName
			});

			if (oMessage) {
				oMessage.setReferenceControl(oTextField);
				oTIView.addMessage(oMessage);
			} else {
				oTextField.setValue("");
			}
		},

		onTagRemoved: function(oEvent) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			oApp.removeNotificationMessages("TAG");
			var oTag = oEvent.getSource().getBindingContext(this.getModelName()).getObject();
			this.getModel().removeChild(oTag);
		},
		onCustomerIdeaFormChange: function(oEvent) {
			var oCustomIdeaForm = oEvent.getParameters();
			var sKey = oCustomIdeaForm.selectedItem.getProperty("key");

			if (sKey) {
				this.getModel().oData["FORM_CODE"] = sKey;
			}
		},
		onFormAdminChange: function(oEvent) {
			var oFormAdmin = oEvent.getParameters();
			var sKey = oFormAdmin.selectedItem.getProperty("key");

			if (sKey) {
				this.getModel().oData["ADMIN_FORM_CODE"] = sKey;
			}
		},

		onResponsibilityListChange: function(oEvent) {
			var oController = this;
			var oResponsibilityList = oEvent.getParameters();
			var sKey = oResponsibilityList.selectedItem.getProperty("key");

			if (sKey) {
				oController.getModel().setProperty("RESP_CODE", sKey);
			} else {
				oController.getModel().setProperty("/IS_AUTO_ASSIGN_RL_COACH", 0);
			}
		},

		onRewardUnitCodeChange: function(oEvent) {
			var oRewardUnitCode = oEvent.getParameters();
			var sKey = oRewardUnitCode.selectedItem.getProperty("key");
			if (sKey) {
				this.getModel().oData.REWARD_UNIT_CODE = sKey;
			}
		},

		onLanguageChange: function(oEvent) {
			var oView = this.getView();
			if (oEvent.getParameter("liveValue")) {
				oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
			}
			var aItems = oEvent.getSource().getItems();
			var sKey = oEvent.getSource().getSelectedKey();
			var oItem = undefined;

			var aLanguages = this.getModel().oData["LanguageTexts"];
			if (aLanguages) {
				// Remember current selection to display the correct value after mode switch
				if (sKey) {
					this.getThingInspectorController()._sCurrentLanguageKey = sKey;
				}
				for (var ii = 0; ii < aItems.length; ++ii) {
					if (aItems[ii].getKey() === sKey) {
						oItem = aItems[ii];
						break;
					}
				}
				if (oItem) {
					var iLanguageIdx = 0;
					for (var i = 0; i < aLanguages.length; i++) {
						var oLanguage = this.getThingInspectorController().getLanguageByLang(aLanguages[i].LANG);
						if (oLanguage && oLanguage.CODE === sKey) {
							var sLanguage = aLanguages[i].LANG;
							this.getThingInspectorController()._sCurrentLanguage = sLanguage;

							// WORKAROUND FOR RTE VALUE BINDING PROBLEM
							this.getThingInspectorController().initLanguageTemplateModel();

							iLanguageIdx = i;
							break;
						}
					}
					oView._oLanguageTemplate.bindElement(this.getFormatterPath("LanguageTexts/" + iLanguageIdx, true));
				}
			}
			oView.revalidateMessages();
		},

		addTagsFromClipboard: function(oButton) {
			var oController = this;
			var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
			var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
			var oCampaign = this.getModel();
			jQuery.each(aTagKeys, function(iTagKeyIndex, oTagKey) {
				var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Tag, oTagKey);
				oReadRequest.done(function(oTag) {
					var oMessage = oCampaign.addTag({
						TAG_ID: oTag.ID,
						NAME: oTag.NAME
					});
					if (oMessage) {
						oMessage.setReferenceControl(oButton);
						oController.getThingInspectorView().addMessage(oMessage);
					}
				});
				oReadRequest.fail(function(oTag) {
					var oMessage = new sap.ui.ino.application.Message({
						key: "MSG_IDEA_FLD_TAG_LOAD_FAILED",
						level: sap.ui.core.MessageType.Error,
						group: "TAG",
						parameters: [oTagKey]
					});
					oController.getThingInspectorView().addMessage(oMessage);
				});
			});
		},

		changeMilestoneYears: function(oEvent) {
			var sPath;
			if (oEvent.getParameter("id").indexOf("picker") > -1) {
				sPath = oEvent.oSource.getBindingInfo("value").binding.sPath;
			} else {
				sPath = oEvent.oSource.getBindingInfo("checked").binding.sPath;
			}
			if (!sPath) {
				return;
			}
			var oModel = this.getModel();
			if (sPath === "/VALID_FROM") {
				oModel.initMilestoneYears();
			}
		},

		synchronizeCampaignMilestone: function(oEvent) {
			var oController = this;
			var oModel = this.getModel();
			var aTask = oModel.getProperty("/Tasks");
			if (!aTask || aTask.length === 0) {
				return;
			}
			var sPath;
			if (oEvent.getParameter("id").indexOf("picker") > -1) {
				sPath = oEvent.oSource.getBindingInfo("value").binding.sPath;
			} else {
				sPath = oEvent.oSource.getBindingInfo("checked").binding.sPath;
			}
			if (!sPath) {
				return;
			}
			var newDate = oModel.getProperty(sPath);
			if (sPath === "/VALID_FROM") {
				oController._updateCampMilestones(aTask, null, null, "START_DATE", "CAMP_OVERALL", "CAMP_START", newDate);
				return;
			}
			if (sPath === "/VALID_TO") {
				oController._updateCampMilestones(aTask, null, "addValidToMilestone", "END_DATE", "CAMP_OVERALL", "CAMP_END", newDate);
				return;
			}
			if (sPath === "/SUBMIT_FROM") {
				oController._updateCampMilestones(aTask, "addSubmissionTask", "addSubmissionMilestone", "START_DATE", "IDEA_SUBMISSION",
					"IDEA_SUBMIT_START", newDate);
				return;
			}
			if (sPath === "/SUBMIT_TO") {
				oController._updateCampMilestones(aTask, "addSubmissionTask", "addSubmissionMilestone", "END_DATE", "IDEA_SUBMISSION",
					"IDEA_SUBMIT_END", newDate);
				return;
			}
			if (sPath === "/REGISTER_FROM") {
				oController._updateCampMilestones(aTask, "addRegistratorTask", "addRegistratorMilestone", "START_DATE", "CAMP_REGISTRATION",
					"CAMP_REGISTER_START", newDate);
				return;
			}
			if (sPath === "/REGISTER_TO") {
				oController._updateCampMilestones(aTask, "addRegistratorTask", "addRegistratorMilestone", "END_DATE", "CAMP_REGISTRATION",
					"CAMP_REGISTER_END", newDate);
			}
		},

		//oController._updateCampOther(aTask, "addRegistratorTask", "addRegistratorMilestone", "START_DATE", "CAMP_REGISTRATION","CAMP_REGISTER_START", newDate);
		_updateCampMilestones: function(aTask, sTaskMethod, sMilestoneMethod, sFieldName, sTaskCode, sMilestoneCode, newDate) {
			var oExistsMilestone, nIndexMilestone, oExistsTask, nIndexTask, oModel = this.getModel(),
				oController = this;
			var oDelMilestonesData = oModel.getProperty("/DELETE_MILESTONES_DATA");
			if (!oDelMilestonesData) {
				oDelMilestonesData = {};
				oModel.setProperty("/DELETE_MILESTONES_DATA", oDelMilestonesData);
			}
			jQuery.each(aTask, function(index, oTask) {
				if ((oTask.TASK_CODE === "sap.ino.config." + sTaskCode)) {
					var aMilestone = oTask.Milestones;
					jQuery.each(aMilestone, function(i, oMilestone) {
						if (oMilestone.MILESTONE_CODE === sMilestoneCode) {
							oExistsMilestone = oMilestone;
							nIndexMilestone = i;
						}
					});
					if (!oExistsMilestone) {
						if (newDate.getFullYear() < 9999) {
							if (!oDelMilestonesData[sMilestoneCode]) {
								oModel[sMilestoneMethod].call(oModel, aMilestone);
							} else {
								var oMilestoneFromDel = oDelMilestonesData[sMilestoneCode];
								oController._updateMilestoneDate(oMilestoneFromDel.Data, "MILESTONE_DATE", newDate);
								aMilestone.splice(oMilestoneFromDel.Index, 0, oMilestoneFromDel.Data);
							}
						}
					} else {
						if (!newDate || newDate.getFullYear() >= 9999) {
							var oDelMilestone = aMilestone.splice(nIndexMilestone, 1);
							if (oDelMilestone[0].ID > 0) {
								oDelMilestonesData[sMilestoneCode] = {
									Data: oDelMilestone[0],
									Index: nIndexMilestone
								};
							}
						} else {
							oController._updateMilestoneDate(oExistsMilestone, "MILESTONE_DATE", newDate);
						}
					}
					oTask.MILESTONE_COUNT = aMilestone.length;
				}
				if (oTask.TASK_CODE === "sap.ino.config." + sTaskCode) {
					nIndexTask = index;
					oExistsTask = oTask;
				}
			});
			if (!oExistsTask) {
				if (!oDelMilestonesData["sap.ino.config." + sTaskCode]) {
					if (sTaskMethod) {
						oModel[sTaskMethod].call(oModel, aTask);
					}
				} else {
					var oTaskFromDel = oDelMilestonesData["sap.ino.config." + sTaskCode];
					oController._updateMilestoneDate(oTaskFromDel.Data, sFieldName, newDate);
					aTask.splice(oTaskFromDel.Index, 0, oTaskFromDel.Data);
				}
			} else {
				if (!newDate) {
					var oDelTask = aTask.splice(nIndexTask, 1);
					if (oDelTask[0].ID > 0) {
						oDelMilestonesData["sap.ino.config." + sTaskCode] = {
							Data: oDelTask[0],
							Index: nIndexTask
						};
					}
				} else {
					oController._updateMilestoneDate(oExistsTask, sFieldName, newDate);
				}
			}
		},

		_updateMilestoneDate: function(oObject, sFieldName, newDate) {
			oObject[sFieldName] = newDate;
		}
	}));