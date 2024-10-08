sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ino/vc/idea/mixins/FollowUpMixin",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/models/object/Vote",
    "sap/ino/vc/idea/mixins/AssignmentActionMixin",
    "sap/ino/vc/idea/mixins/ChangeStatusActionMixin",
    "sap/ino/vc/commons/mixins/MailMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/idea/mixins/MergeActionMixin",
    "sap/ino/commons/application/WebAnalytics",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/CheckBox",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/commons/models/object/RewardList",
    "sap/ino/vc/idea/mixins/CreateRewardActionMixin",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/vc/idea/RewardFormatter",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/controls/IdeaStatusType",
    "sap/ino/vc/idea/mixins/ChangeAuthorActionMixin",
    "sap/ino/vc/idea/mixins/ChangeAuthorActionFormatter",
    "sap/ino/vc/idea/mixins/ChangeDecisionMixin",
    "sap/ino/commons/models/object/IdeaObjectIntegration",
    "sap/ino/commons/models/object/IdeaLatest",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/m/FlexBox",
    "sap/m/Link",
    "sap/m/Button",
	"sap/m/ButtonType",
    "sap/ui/core/HTML"	
], function(BaseController,
	EvaluationFormatter,
	FollowUpMixin,
	Idea,
	Configuration,
	JSONModel,
	MessageToast,
	TopLevelPageFacet,
	Vote,
	AssignmentActionMixin,
	ChangeStatusActionMixin,
	MailMixin,
	VoteMixin,
	VolunteerMixin,
	MergeActionMixin,
	WebAnalytics,
	Label,
	Text,
	CheckBox,
	CodeModel,
	FollowMixin,
	TagCardMixin,
	Reward,
	CreateRewardActionMixin,
	PropertyModel,
	RewardFormatter,
	ApplicationObjectChange,
	IdeaStatusType,
	ChangeAuthorActionMixin,
	ChangeAuthorActionFormatter,
	ChangeDecisionMixin,
	IdeaObjectIntegration,
	IdeaLatest,
	Dialog,
	DialogType,
	ValueState,
	MessageBox,
	FlexBox,
	Link,
	Button,
	ButtonType,
	HTML
) {
	"use strict";

	var oFormatter = {
		decisionQuickViewVisibility: function(sDecisionPhaseCode, sDecisionStatusCode, sIdeaPhaseCode, sIdeaStatusCode, bDecisionVisible,
			sReasonCode, bBackofficePrivilege, sReasonComment) {
			if (sDecisionStatusCode !== sIdeaStatusCode || (sDecisionPhaseCode !== sIdeaPhaseCode || !sReasonCode || sReasonCode.trim() === '') &&
				(!sReasonComment || sReasonComment.trim() === '')) {
				return false;
			}
			if (bBackofficePrivilege || bDecisionVisible === 1) {
				return true;
			} else {
				return false;
			}
		},

		decisionValueOption: function(sReasonCode, sReasonComment) {
			if (sReasonCode && sReasonCode.trim() !== "") {
				return BaseController.prototype.formatter.valueOption.call(this, sReasonCode);
			}
			if (sReasonComment && sReasonComment.trim() !== "") {
				return sReasonComment.substr(0, 6);
			}
			return "";
		},

		voteTabVisibility: function(bPublish, bPublic, sCommentType, bBackofficePrivillge) {
			if (!bPublish & !bPublic && sCommentType !== 'TEXT' && sCommentType !== 'LIST') {
				return false;
			} else if (bBackofficePrivillge) {
				return true;
			} else if (bPublish) {
				return true;
			} else {
				return false;
			}
		},
		enableEditDecision: function(bEnable, aDecision, sIdeaPhaseCode, sIdeaStatusCode) {

			if (bEnable && aDecision && aDecision.length > 0) {
				aDecision.sort(function(a, b) {
					return b.ID - a.ID;
				});
				if (aDecision[0].STATUS_CODE !== sIdeaStatusCode || (aDecision[0].PHASE_CODE !== sIdeaPhaseCode || !aDecision[0].REASON_CODE ||
						aDecision[0].REASON_CODE
						.trim() === '') &&
					(!aDecision[0].REASON || aDecision[0].REASON.trim() === '')) {
					return false;
				}
				return true;
			} else {
				return false;
			}
		},
		editDecisionCustomData: function(aDecision) {
			if (aDecision && aDecision.length > 0) {
				aDecision.sort(function(a, b) {
					return b.ID - a.ID;
				});
				return aDecision[0].ID;
			}

		},
		visibleDecision: function(bBackofficePrivilege, aDecision, sIdeaPhaseCode, sIdeaStatusCode) {

			if (aDecision && aDecision.length > 0) {
				aDecision.sort(function(a, b) {
					return b.ID - a.ID;
				});
				if (aDecision[0].STATUS_CODE !== sIdeaStatusCode || (aDecision[0].PHASE_CODE !== sIdeaPhaseCode || !aDecision[0].REASON_CODE ||
						aDecision[0].REASON_CODE
						.trim() === '') &&
					(!aDecision[0].REASON || aDecision[0].REASON.trim() === '')) {
					return false;
				}
				if (bBackofficePrivilege || aDecision[0].DECISION_REASON_LIST_VISIBLE === 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		adjustDesWidth: function(bBackofficePrivilege, aDecision, sIdeaPhaseCode, sIdeaStatusCode) {
			var bVisible = oFormatter.visibleDecision(bBackofficePrivilege, aDecision, sIdeaPhaseCode, sIdeaStatusCode);
			if (bVisible === false) {
				return "IDEA_DEATAIL_WIDTH";
			} else {
				return "null";
			}
		},

		sectionTitle: function(iCounter, sText) {
			if (iCounter > 0) {
				return sText && sText + "(" + String(iCounter) + ")";
			} else {
				return sText;
			}
		},
		sectionInternalTitle: function(iNotesCount, iAttachCount, sText) {
			if (!parseInt(iNotesCount, 10) && !parseInt(iAttachCount, 10)) {
				return sText;
			} else {
				//return sText && sText + "(" + String(iNotesCount) + "/" + String(iAttachCount) + ")";
				return sText && sText + this.getText("MENU_MIT_INTERNAL_COUNTS", [String(iNotesCount), String(iAttachCount)]);
			}
		},
		sectionInternalTitleToolTip: function(iNotesCount, iAttachCount, sText) {
			if (!parseInt(iNotesCount, 10) && !parseInt(iAttachCount, 10)) {
				return null;
			} else {
				return sText;
			}
		},
		setIdeaDetailCommentsTab: function(iComment) {
			if (iComment === 1) {
				return "LATESTUPDATE_COMMENT_TAB";
			} else {
				return "null";
			}
		},
		setIdeaDetailCreateIcon: function(iCreate, iDisableImage) {
			if (iCreate === 1 && iDisableImage === false) {
				return "LATESTCTEATE_ICON";
			} else {
				return "null";
			}
		},

		isPreviousEnabled: function(ideaId) {
			var oideaListModel = this.getView().getModel("ideaList");
			if (oideaListModel && oideaListModel.getData()) {
				var ideaList = oideaListModel.getData();
				if (ideaList && ideaList.length >= 0) {
					var index = 0;
					$.each(ideaList, function(i, n) {
						if (n === ideaId) {
							index = i;
							return false;
						}
					});
					if (index - 1 >= 0) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}

		},

		isNextEnabled: function(ideaId) {
			var ideaList = this.getView().getModel.getModel("ideaList").getData();
			if (ideaList && ideaList.length >= 0) {
				var index = 0;
				$.each(ideaList, function(i, n) {
					if (n === ideaId) {
						index = i;
						return false;
					}
				});
				if (index + 1 < ideaList.length) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		isPreviousOrNextVisible: function(ideaId) {
			var ideaList = this.getView().getModel("ideaList").getData();
			if (ideaList && ideaList.length >= 0) {
				var indicators = $.grep(ideaList, function(n, i) {
					return n === ideaId;
				});
				if (indicators.length > 0) {
					return true;
				}
				return false;
			} else {
				return false;
			}
		},
		aContributorsFirstPerson: function(aContributors) {
			if (!aContributors || aContributors.length <= 0) {
				return "";
			}
			if (aContributors.length === 1) {
				return aContributors[0].NAME;
			} else if (aContributors.length > 1) {
				return aContributors[0].NAME + "...";
			}
		},
		formatPressPreviousButton: function(indicator) {
			if (indicator === 1) {
				return false;
			}

		},
		formatPressNextButton: function(indicator, pageSize) {
			if (indicator === pageSize) {
				return false;
			}

		},
		enableLinkObject: function(system) {
			if (system) {
				return true;
			} else {
				return false;
			}
		}

	};

	jQuery.extend(oFormatter, BaseController.prototype.formatter, FollowUpMixin.followUpMixinFormatter, EvaluationFormatter, RewardFormatter,
		ChangeAuthorActionFormatter);

	/**
	 * @mixes TopLevelPageFacet, AssignmentActionMixin, ChangeStatusActionMixin, FollowUpMixin, MailMixin, VoteMixin
	 */
	return BaseController.extend("sap.ino.vc.idea.Display", jQuery.extend({}, TopLevelPageFacet, AssignmentActionMixin,
		ChangeStatusActionMixin, FollowUpMixin, MailMixin, VoteMixin, MergeActionMixin, FollowMixin, TagCardMixin, CreateRewardActionMixin,
		VolunteerMixin, ChangeAuthorActionMixin, ChangeDecisionMixin, {
			routes: ["idea-display"],
			formatter: oFormatter,
			preCheck: true,

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this.setViewProperty("/EDIT", false);
				this.aBusyControls = [this.byId("ideaDisplay")];

				this.setModel(new JSONModel({
					EvaluationSelection: {},
					CreateAverageEvaluationEnabled: false,
					CreateTotalEvaluationEnabled: false
				}), "objectContext");

				this._initHandleRewardsAOChange();
			},

			createObjectModel: function(vObjectKey) {
				var oSettings = {
					nodes: ["Root", "Extension"],
					actions: ["modify", "modifyAndSubmit", "del", "assignCoach", "executeStatusTransition", "assignToMe", "unassignCoach",
						"mergeIdeas", "markAsDuplicate", "addExpert", "reassignCampaign", "changeAuthorStatic", "changeDecision", "createObject",
						"linkExistedObject", "copy"],
					continuousUse: true,
					readSource: {
						model: this.getDefaultODataModel(),
						includeNodes: [
							{
								name: "CampaignExperts",
								parentNode: "Root",
								primaryKey: "ID"
							},
							{
								name: "RespExperts",
								parentNode: "Root",
								primaryKey: "ID"
							}, {
								name: "CampaignManagers",
								parentNode: "Root",
								primaryKey: "ID"
							},
							{
								name: "Decisions",
								parentNode: "Root",
								primaryKey: "ID"
							},
							{
								name: "StatusDecisions",
								parentNode: "Root",
								primaryKey: "ID"
							}

                    ]
					}
				};
				WebAnalytics.logIdeaView(vObjectKey);
				return new Idea(vObjectKey, oSettings);
			},

			onRouteMatched: function(oEvent) {
				BaseController.prototype.onRouteMatched.apply(this, arguments);
				var that = this;
				var oIdea = this.getObjectModel();
				var oFormFields = this.byId("vBoxFormIdeals");
				var oAdminFormFields = this.byId("vBoxAdminFormIdeals");

				oIdea.getDataInitializedPromise().done(function(oDataInitializedData) {
					var iImageId = oDataInitializedData.CAMPAIGN_BACKGROUND_IMAGE_ID;
					var iSmallImageId = oDataInitializedData.CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID;
					that.setBackgroundImages(iImageId, iSmallImageId);
					that.setViewProperty("/CO_AUTHOR", false);
					if (oIdea.oData.Contributors.length > 0) {
						that.setViewProperty("/CO_AUTHOR", true);
					}

					if (oFormFields) {
						oFormFields.removeAllItems();
					}
					if (oAdminFormFields) {
						oAdminFormFields.removeAllItems();
					}
					if (!!oIdea.oData.FieldsValue && oIdea.oData.FieldsValue.length > 0) {
						that.bindingFormIdeals(oFormFields, oIdea);
					}
					if (!!oIdea.oData.AdminFieldsValue && oIdea.oData.AdminFieldsValue.length > 0) {
						that.bindingAdminFormIdeals(oAdminFormFields, oIdea);
					}
					that.setVisibilityForRewards(oDataInitializedData);

					var oSearchModel = that.getOwnerComponent().getModel('search');
					if (oSearchModel) {
						oSearchModel.setProperty('/searchAguments', {
							"id": oIdea.getProperty("/CAMPAIGN_ID")
						});
					}
					//For mark as read when go to the detail section/comment section
					var oSectionTabSelected = that.byId('objectpage') ? that.byId('objectpage').getSelectedSection() : "";
					var aTypeCode = [];
					var bComment = oSectionTabSelected && (oSectionTabSelected.indexOf("sectionComments") > -1) ? true : false;
					var bDetail = oSectionTabSelected && (oSectionTabSelected.indexOf("sectionDetails") > -1) ? true : false;
					if (oIdea.getProperty("/SHOW_CREATED_VIEWER") === 1) {
						aTypeCode.push("CreatedViewer");
					}
					if (oIdea.getProperty("/SHOW_STATUSCHANGE_VIEWER") === 1) {
						aTypeCode.push("StatusChangeViewer");
					}
					if (bDetail && oIdea.getProperty("/SHOW_UPDATED_VIEWER") === 1) {
						aTypeCode.push("UpdatedViewer");
					}
					if (bComment && oIdea.getProperty("/SHOW_COMMENT_VIEWER") === 1) {
						aTypeCode.push("CommentViewer");
					}
					if (!bComment && that._commentAlreadyRead) {
						oIdea.setProperty("/SHOW_COMMENT_VIEWER", 0);
						that._commentAlreadyRead = false;
					}
					if (aTypeCode.length > 0) {
						var oMarkAsReadPara = {
							TYPE_CODE: aTypeCode,
							IDEA_ID: oIdea.getProperty("/ID")
						};
						var oMarkAsRequest = IdeaLatest.deleteViewerByObjectIdAndTypeCode(oMarkAsReadPara);
						oMarkAsRequest.done(function(oRes) {
							if (bComment && oIdea.getProperty("/SHOW_COMMENT_VIEWER") === 1) {
								that._commentAlreadyRead = true;
							}
						});
					}
					var bAttachment = oSectionTabSelected && (oSectionTabSelected.indexOf("sectionAttachments") > -1) ? true : false;
					if (bAttachment) {
						oIdea.setProperty("/EDITABLE", false);
					}
				});
				var objectContextModel = that.getModel("objectContext");
				var aAvgEvalId = Object.keys(objectContextModel.getProperty("/EvaluationSelection") || {});
				if (aAvgEvalId.length > 0) {
					objectContextModel.setProperty("/EvaluationSelection", {});
					objectContextModel.setProperty("/CreateAverageEvaluationEnabled", false);
					objectContextModel.setProperty("/CreateTotalEvaluationEnabled", false);
				}
				// TODO: Why can't we do that in a declarative mode? There is no dynamics contained at all
				this.setHelp("IDEA_DISPLAY", "IDEA_DISPLAY_ADDITIONAL");
				var ideaId = oEvent.getParameter("arguments").id;
				this.initPageIndicatorLabel(ideaId);
				var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/update_object_view_count.xsjs";
				var oBody = {
					OBJECT_TYPE: "IDEA",
					OBJECT_ID: ideaId,
					USER_NAME: Configuration.getCurrentUser().USER_NAME
				};
				var oAjaxPromise = jQuery.ajax({
					url: sURL,
					headers: {
						"X-CSRF-Token": Configuration.getXSRFToken()
					},
					data: JSON.stringify(oBody),
					dataType: "json",
					type: "POST",
					contentType: "application/json; charset=UTF-8",
					async: true
				});
				oAjaxPromise.done();
			},

			onAfterRendering: function() {
				//var objectContextModel = that.getModel("objectContext");
				var that = this;
				var systeamSetting = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE");
				var systeamSettingPhaseBar = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR");
				that.setViewProperty('/DISABLE_IDEA_IMAGE', !!(systeamSetting * 1) || !!(systeamSettingPhaseBar * 1));
				that.setViewProperty('/DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR', !!(systeamSettingPhaseBar * 1));
				that.setPageContentTopStyle();
				//preload for evaluation
				jQuery.sap.delayedCall(0, that, function() {
				    CodeModel.getCodes("sap.ino.xs.object.evaluation.Model.Criterion");
				    CodeModel.getCodes("sap.ino.xs.object.basis.Unit.Root");
				    CodeModel.getCodes("sap.ino.xs.object.status.Action.Root");
				});
			},

			bindingAdminFormIdeals: function(oFormFields, oIdea) {
				var that = this;
				jQuery.each(oIdea.oData.AdminFieldsValue, function(i, oField) {
					if (oField.STATE_OF_PUBLISH === 1) {
						var lblText = oField.DEFAULT_TEXT + ":";
						if (oField.UOM_CODE) {
							lblText = oField.DEFAULT_TEXT + "(" + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", oField.UOM_CODE) + "):";
						}
						var oLabel = new Label({
							text: lblText,
							tooltip: oField.DEFAULT_LONG_TEXT
						});
						oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
						var sDataType;
						if (oField.DATATYPE_CODE === "BOOLEAN") {
							sDataType = "BOOL_VALUE";
						} else if (oField.DATATYPE_CODE === "TEXT") {
							sDataType = "TEXT_VALUE";
						} else if (oField.DATATYPE_CODE === "RICHTEXT") {
							sDataType = "RICH_TEXT_VALUE";
						} else if (oField.DATATYPE_CODE === "DATE") {
							sDataType = "DATE_VALUE";
						} else {
							sDataType = "NUM_VALUE";
						}
						var oTxt = oField[sDataType];
						var valueList = oField.valueOptionList;
						if (!valueList) {
							if (oField.VALUE_OPTION_LIST_CODE) {
								var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oField.VALUE_OPTION_LIST_CODE;
								valueList = CodeModel.getCodes(sCodeTable, function(oCode) {
									return oCode.ACTIVE === 1;
								});
							}
						}
						if (!!valueList && valueList.length > 0 && oTxt !== undefined && oTxt !== null && oTxt !== "") {
							jQuery.each(valueList, function(index, data) {
								if (data.CODE.toString() === oTxt.toString()) {
									oTxt = data.DEFAULT_TEXT;
									return;
								}
							});
						}
						if (oField.DATATYPE_CODE === "BOOLEAN" && (!valueList || valueList.length === 0)) {
							var bValue = oField[sDataType] === 0 || !oField[sDataType] ? false : true;
							var oCheckBox = new CheckBox({
								text: oField.DEFAULT_TEXT,
								selected: bValue,
								editable: false,
								tooltip: oField.DEFAULT_LONG_TEXT
							});
							var oCheckLabel = oCheckBox._getLabel();
							oCheckLabel.addStyleClass("sapInoIdeaFormLabelStyle");
							oFormFields.addItem(oCheckBox);
						} else {
							var contentLbl;
							if (oField.DATATYPE_CODE === "NUMERIC" && !!oTxt && (!valueList || valueList.length === 0)) {
								var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
									groupingEnabled: true,
									groupingSeparator: ","
								});
								contentLbl = new Text();
								contentLbl.setText(oNumberFormat.format(oTxt));
							} else if (oField.DATATYPE_CODE === "RICHTEXT" && !!oTxt && (!valueList || valueList.length === 0)) {
								contentLbl = new sap.ui.core.HTML({
									sanitizeContent: true,
									preferDOM: false
								});
								contentLbl.setContent(oTxt);
							} else if (oField.DATATYPE_CODE === "DATE" && !!oTxt && (!valueList || valueList.length === 0)) {
								// 			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
								// 				relative: false
								// 			});
								contentLbl = new Text();
								// 			contentLbl.setText(oDateFormat.format(oTxt));
								contentLbl.setText(oFormatter.toDate(oTxt));
							} else {
								contentLbl = new Text();
								contentLbl.setText(oTxt);
							}
							oFormFields.addItem(oLabel);
							oFormFields.addItem(contentLbl);
						}
					}
				});

			},

			bindingFormIdeals: function(oFormFields, oIdea) {
				var that = this;

				jQuery.each(oIdea.oData.FieldsValue, function(i, oField) {
					var lblText = oField.DEFAULT_TEXT + ":";
				
				if(oField.IS_DISPLAY_ONLY){
				var oRichTextHtml = new HTML({
					sanitizeContent: true,
					preferDOM: false,
					content: {
						model: "object",
						path: "/FieldsValue/" + i + "/DISPLAY_TEXT",
						formatter: that.formatter.wrapHTML
					}
				});
				 oFormFields.addItem(oRichTextHtml);
				 return true;   
				}					
					
					if (oField.UOM_CODE) {
						lblText = oField.DEFAULT_TEXT + "(" + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", oField.UOM_CODE) + "):";
					}
					var oLabel = new Label({
						text: lblText,
						tooltip: oField.DEFAULT_LONG_TEXT
					});
					oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
					var sDataType;
					if (oField.DATATYPE_CODE === "BOOLEAN") {
						sDataType = "BOOL_VALUE";
					} else if (oField.DATATYPE_CODE === "TEXT") {
						sDataType = "TEXT_VALUE";
					} else if (oField.DATATYPE_CODE === "RICHTEXT") {
						sDataType = "RICH_TEXT_VALUE";
					} else if (oField.DATATYPE_CODE === "DATE") {
						sDataType = "DATE_VALUE";
					} else {
						sDataType = "NUM_VALUE";
					}
					var oTxt = oField[sDataType];
					var valueList = oField.valueOptionList;
					if (!!valueList && valueList.length > 0 && oTxt !== undefined && oTxt !== null && oTxt !== "") {
						jQuery.each(valueList, function(index, data) {
							if (data.CODE.toString() === oTxt.toString()) {
								oTxt = data.DEFAULT_TEXT;
								return;
							}
						});
					}
					if (oField.DATATYPE_CODE === "BOOLEAN" && (!valueList || valueList.length === 0)) {
						if (oField.IS_HIDDEN === 1) {
							var hiddenTxt = new Text();
							hiddenTxt.setText("******");
							hiddenTxt.setTooltip(that.getText("IDEA_DISPLAY_FORM_HIDDEN_TOOLTIP"));
							oFormFields.addItem(oLabel);
							oFormFields.addItem(hiddenTxt);
						} else {
							var bValue = oField[sDataType] === 0 || !oField[sDataType] ? false : true;
							var oCheckBox = new CheckBox({
								text: oField.DEFAULT_TEXT,
								selected: bValue,
								editable: false,
								tooltip: oField.DEFAULT_LONG_TEXT
							});
							var oCheckLabel = oCheckBox._getLabel();
							oCheckLabel.addStyleClass("sapInoIdeaFormLabelStyle");
							oFormFields.addItem(oCheckBox);
						}
					} else {
						var contentLbl;
						if (oField.DATATYPE_CODE === "NUMERIC" && !!oTxt && (!valueList || valueList.length === 0)) {
							var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
								groupingEnabled: true,
								groupingSeparator: ","
							});
							contentLbl = new Text();
							contentLbl.setText(oNumberFormat.format(oTxt));
						} else if (oField.DATATYPE_CODE === "RICHTEXT" && !!oTxt && (!valueList || valueList.length === 0)) {
							contentLbl = new sap.ui.core.HTML({
								sanitizeContent: true,
								preferDOM: false
							});
							contentLbl.setContent(oTxt);
						} else if (oField.DATATYPE_CODE === "DATE" && !!oTxt && (!valueList || valueList.length === 0)) {
							// 			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
							// 				relative: false
							// 			});
							contentLbl = new Text();
							// 			contentLbl.setText(oDateFormat.format(oTxt));
							contentLbl.setText(oFormatter.toDate(oTxt));
						} else {
							contentLbl = new Text();
							contentLbl.setText(oTxt);
						}
						if (oField.IS_HIDDEN === 1) {
							if (oField.DATATYPE_CODE === "RICHTEXT") {
								contentLbl = new Text();
							}
							contentLbl.setText("******");
							contentLbl.setTooltip(that.getText("IDEA_DISPLAY_FORM_HIDDEN_TOOLTIP"));
						}
						oFormFields.addItem(oLabel);
						oFormFields.addItem(contentLbl);
					}
				});
			},

			hasBackgroundImage: function() {
				// todo: why do we have to implement this not just give a parameter
				return true;
			},

			getODataEntitySet: function() {
				// can be redefined if OData Model is needed;
				return "IdeaFull";
			},

			onCampaignPressed: function(oEvent) {
				// prevent href
				oEvent.preventDefault();

				var iId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
				this.navigateTo("campaign", {
					id: iId
				});
			},

			onIdeaPressed: function(oEvent) {
				// prevent href
				oEvent.preventDefault();

				var iId = this.getObjectModel().getProperty("/LINK_IDEA_ID");
				this.navigateTo("idea-display", {
					id: iId
				});
			},

			onEdit: function(oEvent) {
				this.navigateTo("idea-edit", {
					id: this.getObjectModel().getKey()
				});
			},

			onGeneralEdit: function(oEvent) {
				if (!this._oEditActionSheet) {
					this._oEditActionSheet = this.createFragment("sap.ino.vc.idea.fragments.EditActionSheet", this.getView().getId());
					this.getView().addDependent(this._oEditActionSheet);
				}
				this._oEditActionSheet.openBy(oEvent.getSource());
			},

			onRewardCreateEanble: function(IdeaId) {
				if (IdeaId) {
					return PropertyModel.getStaticActionEnabledStaticFormatter("sap.ino.xs.object.reward.RewardList", "create", {
						IDEA_ID: IdeaId
					})(IdeaId);
				}
				return false;
			},
			onCreate: function(oEvent) {
				//   var oIdea = this.getObjectModel();
				//             this.setViewProperty("/CREATE_REWARD",this.onRewardCreateEanble(oIdea.oData.ID));

				if (!this._oCreateActionSheet) {
					this._oCreateActionSheet = this.createFragment("sap.ino.vc.idea.fragments.CreateActionSheet", this.getView().getId());
					this.getView().addDependent(this._oCreateActionSheet);
				}
				this._oCreateActionSheet.openBy(oEvent.getSource());
			},

			onCreateEvaluation: function() {
				var oController = this;
				this.navigateTo("evaluation-create", {
					query: oController._getEvaluationQuery()
				});
			},

			_getEvaluationQuery: function() {
				var oQuery = {
					ideaId: this.getObjectModel().getKey()
				};
				var oData = this.getModel("data").oData;
				var oRegex = /^EvaluationRequestFullItem\((\d+)\)$/igm;
				var sRequestId;
				if (oData) {
					for (var prop in oData) {
						if (oData.hasOwnProperty(prop)) {
							var oMatch = oRegex.exec(prop);
							if (oMatch && oMatch.length > 1) {
								sRequestId = oMatch[1];
							}
						}
					}
				}
				if (sRequestId) {
					oQuery.EvalReqItemId = sRequestId;
				}
				return oQuery;
			},

			onCreateAverageEvaluation: function() {
				var oController = this;
				var fnCreateAvgEval = function(includeAttachs) {
					var aAvgEvalId = Object.keys(oController.getModel("objectContext").getProperty("/EvaluationSelection") || {});
					if (aAvgEvalId.length > 0) {
						oController.navigateTo("evaluation-create", {
							query: {
								ideaId: oController.getObjectModel().getKey(),
								EvalReqItemId: oController.getObjectModel().getKey(),
								evalIds: aAvgEvalId.join(","),
								evalAction: 1,
								includeAttachs: includeAttachs
							}
						});
					}
				};
				var aActions = [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO];
				sap.m.MessageBox.confirm(oController.getText("IDEA_OBJECT_MSG_NEW_CREATE_AVERAGE_EVALUATION"), {
					actions: aActions,
					onClose: function(sAction) {
						var index = Math.pow(aActions.length, aActions.indexOf(sAction) + 1);
						if (index === 2) {
							fnCreateAvgEval(1);
						}
					}
				});
			},

			onCreateTotalEvaluation: function() {
				var oController = this;
				var fnCreateTotalEval = function(includeAttachs) {
					var aAvgEvalId = Object.keys(oController.getModel("objectContext").getProperty("/EvaluationSelection") || {});
					if (aAvgEvalId.length > 0) {
						oController.navigateTo("evaluation-create", {
							query: {
								ideaId: oController.getObjectModel().getKey(),
								EvalReqItemId: oController.getObjectModel().getKey(),
								evalIds: aAvgEvalId.join(","),
								evalAction: 2,
								includeAttachs: includeAttachs
							}
						});
					}
				};
				var aActions = [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO];
				sap.m.MessageBox.confirm(oController.getText("IDEA_OBJECT_MSG_NEW_CREATE_TOTAL_EVALUATION"), {
					actions: aActions,
					onClose: function(sAction) {
						var index = Math.pow(aActions.length, aActions.indexOf(sAction) + 1);
						if (index === 2) {
							fnCreateTotalEval(1);
						}
					}
				});
			},

			onContactPeople: function(oEvent) {
				var oSource = oEvent.getSource();

				if (!this._oContactActionSheet) {
					this._oContactActionSheet = this.createFragment("sap.ino.vc.idea.fragments.ContactActionSheet", this.getView().getId());
					this.getView().addDependent(this._oContactActionSheet);
				}

				this._oContactActionSheet.openBy(oSource);
			},

			onContactContributors: function() {
				var oIdeaModel = this.getObjectModel();
				var aPeople = oIdeaModel.getProperty("/Contributors").concat(
					oIdeaModel.getProperty("/Submitter"));
				if (this.getObjectModel().getPropertyModel().getProperty("/nodes/Root/customProperties/EmailVisibilies").CONTRIBUTORS) {
					this.triggerMail(aPeople);
				} else {
					this.onIdeaContactMail(aPeople);
				}
			},

			onContactCoach: function() {
				var oIdeaModel = this.getObjectModel();
				var aPeople = oIdeaModel.getProperty("/Coach");
				if (this.getObjectModel().getPropertyModel().getProperty("/nodes/Root/customProperties/EmailVisibilies").COACHES) {
					this.triggerMail(aPeople);
				} else {
					this.onIdeaContactMail(aPeople);
				}
			},

			onContactIdeaExperts: function() {
				var oIdeaModel = this.getObjectModel();
				var aPeople = oIdeaModel.getProperty("/Experts");
				if (this.getObjectModel().getPropertyModel().getProperty("/nodes/Root/customProperties/EmailVisibilies").IDEA_EXPERTS) {
					this.triggerMail(aPeople);
				} else {
					this.onIdeaContactMail(aPeople);
				}
			},

			onContactCampaignExperts: function() {
				var oIdeaModel = this.getObjectModel();
				var aPeople = oIdeaModel.getProperty("/CampaignExperts");
				if (this.getObjectModel().getPropertyModel().getProperty("/nodes/Root/customProperties/EmailVisibilies").CAMP_EXPERTS) {
					this.triggerMail(aPeople);
				} else {
					this.onIdeaContactMail(aPeople);
				}
			},

			triggerMail: function(aPeople) {

				var sMailAddress = aPeople.filter(function(oPerson) {
					return oPerson.IS_VALID_EMAIL && oPerson.EMAIL;
				}).map(function(oRecipient) {
					return oRecipient.EMAIL;
				}).reduce(function(aRecipients, oRecipient) {
					if (aRecipients.indexOf(oRecipient) < 0) {
						aRecipients.push(oRecipient);
					}
					return aRecipients;
				}, []).join(";");

				var oMailContent = this.createMailContent();
				sap.m.URLHelper.triggerEmail(sMailAddress, oMailContent.subject, oMailContent.body);
			},

			onCreateWall: function(oEvent) {
				var that = this;
				var oIdea = this.getObjectModel();
				if (oIdea) {
					oIdea.createWall(this.getOwnerComponent()).done(function(iWallID) {
						that.navigateToWall("wall", {
							id: iWallID
						});
					});
				}
			},

			getCopyDialog: function(oEvent) {
				if (!this._oCopyIdeaDialog) {
					this._oCopyIdeaDialog = this.createFragment("sap.ino.vc.idea.fragments.Copy", this.getView().getId());
					this.getView().addDependent(this._oCopyIdeaDialog);
					this._oCopyOkBtn = this.byId(this.createId("copyok"));
					this._oCopyIdeaDialog.setInitialFocus();
				}
				return this._oCopyIdeaDialog;
			},

			onCopyIdea: function() {
				var oIdea = this.getObjectModel();
				var oDialog = this.getCopyDialog();
				oDialog.setModel(new JSONModel({
					"NAME": this.getText("IDEA_OBJECT_FLD_COPY_PREFIX", [oIdea.getProperty("/NAME")])
				}), "copy");

				oDialog.open();
			},

			onCopyIdeaTitleChange: function(oEvent) {
				if (oEvent.getParameters().newValue && oEvent.getParameters().newValue.length > 0) {
					this._oCopyOkBtn.setEnabled(true);
				} else {
					this._oCopyOkBtn.setEnabled(false);
				}
			},

			onCopyDialogOk: function() {
				var that = this;
				var oDialog = this.getCopyDialog();
				var sCopyTitle = oDialog.getModel("copy").getProperty("/NAME");

				oDialog.setBusy(true);

				var oCopyRequest = that.executeObjectAction("copy", {
					parameters: {
						ID: -1,
						NAME: sCopyTitle
					},
					messages: {
						success: "IDEA_OBJECT_MSG_COPY_SUCCESS",
						error: "IDEA_OBJECT_MSG_COPY_FAILURE"
					}
				});

				oCopyRequest.done(function(oResponse) {
					oDialog.close();
					// wait for success toast
					setTimeout(function() {
						that.navigateTo("idea-edit", {
							id: oResponse.getKey()
						});
					}, 500);
				});

				oCopyRequest.always(function() {
					oDialog.setBusy(false);
				});
			},

			onCopyDialogClose: function() {
				this.getCopyDialog().close();
			},

			onCopyDialogAfterClose: function() {
				this.resetClientMessages();
				//reset the dialog
				this.getCopyDialog().destroy();
				this._oCopyIdeaDialog = undefined;
			},

			onOpenDecisionQuickView: function(oEvent) {
				var oSource = oEvent.getSource();
				var iDecisionId = oSource.getBindingContext("object").getProperty("ID");
				if (oSource && iDecisionId) {
					if (!this._oDecisionCardView || !this._oDecisionCardView.getController()) {
						this._oDecisionCardView = sap.ui.xmlview({
							viewName: "sap.ino.vc.idea.DecisionQuickView"
						});
						oSource.addDependent(this._oDecisionCardView);
					}
					this._oDecisionCardView.getController().open(oSource, iDecisionId);
				}
			},

			onRespListHint: function(oEvent) {
				var oDialog = this._getRespListHintDialog();
				var oIdea = this.getObjectModel();
				var sCode = oIdea.getProperty("/RESP_VALUE_CODE");
				oDialog.bindElement({
					path: "data>/RespValues('" + sCode + "')/"
				});
				oDialog.open();
			},

			onRespListHintDialogClose: function() {
				var oDialog = this._getRespListHintDialog();
				oDialog.close();
			},

			_getRespListHintDialog: function() {
				var oDialog = this._oRespListHintDialog;
				if (!oDialog) {
					oDialog = this.createFragment("sap.ino.vc.idea.fragments.ResponsibilityDetail", this.getView().getId());
					this.getView().addDependent(oDialog);
					this._oRespListHintDialog = oDialog;
					this._oRespListHintDialog.setInitialFocus(this.createId("TagToken"));
				}
				return oDialog;
			},

			showPopupTagCard: function(oEvent) {
				if (!this._oPopover) {
					this._oPopover = sap.ui.xmlfragment("sap.ino.vc.tag.fragments.TagCardPopover", this);
					this.getView().addDependent(this._oPopover);
				}
				var oToken = oEvent.getSource();
				var sPath = "/SearchTagsAll(searchToken='',ID=" + oToken.getKey() + ")";
				var oDatamodel = this.getModel("data");
				var that = this;
				oDatamodel.read(sPath, {
					async: true,
					success: function(oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						that._oPopover.setModel(oModel, "Tag");
						jQuery.sap.delayedCall(0, that, function() {
							that._oPopover.openBy(oToken);
						});
					}
				});
			},

			/**
			 * Update the reward create button visible, once an reward is
			 * created, deleted
			 */
			_initHandleRewardsAOChange: function() {
				var oController = this;

				var fnAOChangeListener = function(oEvent) {
					if (oEvent.getParameter("object").getMetadata().getName() === "sap.ino.commons.models.object.RewardList" && oController &&
						oController.getObjectModel()) {
						oController.getObjectModel().checkUpdate(true, false);
					}
				};

				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
			},

			/**
			 * set visibility for reward section manually to fix the redirect error from reward list page
			 */
			setVisibilityForRewards: function(oData) {
				if (this.byId("sectionRewards") && oData) {
					this.byId("sectionRewards").setVisible(oData.IDEA_HAS_REWARDS > 0 || oData.REWARD_ACTIVE > 0);
				}
			},
			hasPendingChanges: function() {
				var oIdea = this.getObjectModel();
				if (!oIdea) {
					return false;
				}
				var oCommentView = oIdea.getProperty("/IDEA_COMMENT_VIEW");
				var oInternalCommentView = oIdea.getProperty("/IDEA_INTERNAL_COMMENT_VIEW");
				var oCommentModel = oCommentView ? oCommentView.getModel("comment") : null;
				var oInternalCommentModel = oInternalCommentView ? oInternalCommentView.getModel("comment") : null;
				if (oCommentModel && (this.getCurrentRoute() !== "idea-display" || oCommentModel.getProperty("/OBJECT_ID") !== oIdea.getProperty(
					"/ID") || (this.getCurrentRoute() === "idea-display" && this.getRouter().getContext().indexOf("idea/") < 0))) {
					// 	return oCommentModel.hasPendingChanges();
					//	oCommentModel.revertChanges();
					oCommentView.setModel(null, "comment");
					oCommentModel = null;
				}
				if (oInternalCommentModel && (this.getCurrentRoute() !== "idea-display" || oInternalCommentModel.getProperty("/OBJECT_ID") !== oIdea
					.getProperty("/ID") || (this.getCurrentRoute() === "idea-display" && this.getRouter().getContext().indexOf("idea/") < 0))) {
					//return oInternalCommentModel.hasPendingChanges();
					//oInternalCommentModel.revertChanges();
					oInternalCommentView.setModel(null, "comment");
					oInternalCommentModel = null;
				}

				return false;
			},
			// 			resetPendingChanges: function() {
			// 				var oIdea = this.getObjectModel();
			// 				var oCommentView = oIdea.getProperty("/IDEA_COMMENT_VIEW");
			// 				var oInternalCommentView = oIdea.getProperty("/IDEA_INTERNAL_COMMENT_VIEW");
			// 				var oCommentModel = oCommentView ? oCommentView.getModel("comment") : null;
			// 				var oInternalCommentModel = oInternalCommentView ? oInternalCommentView.getModel("comment") : null;
			// 				if (oCommentModel && oCommentModel.hasPendingChanges()) {
			// 					oCommentModel.revertChanges();
			// 				}
			// 				if (oInternalCommentModel && oInternalCommentModel.hasPendingChanges()) {
			// 					oInternalCommentModel.revertChanges();
			// 				}
			// 			},
			getCorrespondingCommentModel: function(scommentType) {
				var oIdea = this.getObjectModel();
				var oModel, oCommentView;
				if (scommentType === "IDEA") {
					oCommentView = oIdea.getProperty("/IDEA_COMMENT_VIEW");
					oModel = oCommentView ? oCommentView.getModel("comment") : null;
				} else if (scommentType === "INTERNAL") {
					oCommentView = oIdea.getProperty("/IDEA_INTERNAL_COMMENT_VIEW");
					oModel = oCommentView ? oCommentView.getModel("comment") : null;
				}
				return oModel;
			},
			onCreateEvaluationRequest: function(oEvent) {
				this.navigateTo("evaluationrequest-create", {
					query: {
						idea: this.getObjectModel().getKey()
					}
				});
			},
			onOpenDecisionMaker: function(oEvent) {

				var oSource = oEvent.getSource();
				var oBindingContext = oSource.getBindingContext("object");
				var iIdentityId = oBindingContext.getProperty(oBindingContext.sPath + "/DECIDER_ID");
				if (!this._oIdentityCardView) {
					this._oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this._oIdentityCardView);
				}
				this._oIdentityCardView.getController().open(oSource, iIdentityId);
			},
			onAuthorPressed: function(oEvent) {
				var oSource = oEvent.getSource();
				var oBindingContext = oSource.getBindingContext("object");
				var iSubmitterID = oBindingContext.getProperty(oBindingContext.sPath + "SUBMITTER_ID");
				this.callIdentityView(oSource, iSubmitterID);
			},
			onCoauthorPressed: function(oEvent) {
				var oSource = oEvent.getSource();
				var oBindingContext = oSource.getBindingContext("object");
				//var iCoauthorID = oBindingContext.getProperty(oBindingContext.sPath + "/IDENTITY_ID");
				var iFirstCoauthorID = oBindingContext.getProperty(oBindingContext.sPath + "Contributors")[0].IDENTITY_ID;
				this.callIdentityView(oSource, iFirstCoauthorID);
			},
			onCoachPressed: function(oEvent) {
				var oSource = oEvent.getSource();
				var oBindingContext = oSource.getBindingContext("object");
				var iCoachID = oBindingContext.getProperty(oBindingContext.sPath + "COACH_ID");
				this.callIdentityView(oSource, iCoachID);
			},
			callIdentityView: function(oSource, iIdentityId) {
				if (!this._oIdentityCardView) {
					this._oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this._oIdentityCardView);
				}
				this._oIdentityCardView.getController().open(oSource, iIdentityId);
			},
			getIntegrationObjectDialog: function() {
				if (!this._oCopyIntegrationObject) {
					this._oCopyIntegrationObject = this.createFragment("sap.ino.vc.idea.fragments.IntegrationObjectDialog", this.getView().getId());
					this.getView().addDependent(this._oCopyIntegrationObject);
				}
				return this._oCopyIntegrationObject;
			},

			onCreateIntegrationObject: function() {
				var that = this;
				var oDialog = this.getIntegrationObjectDialog();
				IdeaObjectIntegration.getAllApiFromCampaign({
					CAMPAIGN_ID: this.getObjectModel().getProperty("/CAMPAIGN_ID")
				}).done(function(oData) {
					if (oData && oData.RESULT && oData.RESULT.length === 1) {
						that.enableCreateIntegrationObjectTag = true;
    					that.getIntegrationObjectDialog().getModel("objectContext").setProperty("/enableCreateIntegrationObjectBtn", true);
    					that.objectTechnicalName = oData.RESULT[0].TECHNICAL_NAME;
					} else {
						oData.enableCreateIntegrationObjectBtn = false;
					}
					setTimeout(function() {
						oDialog.setModel(new JSONModel(oData), "objectContext");
						oDialog.open();
					}, 500);
				}).fail(function(odata) {
					odata.RESULT = [];
				});
			},

			onIntegrationObjectTargetConfim: function() {
				var that = this;
				var oDialog = this.getIntegrationObjectDialog();
				oDialog.setBusy(true);
				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};
				IdeaObjectIntegration.createObject({
					API_TECH_NAME: this.objectTechnicalName,
					CAMPAIGN_ID: this.getObjectModel().getProperty("/CAMPAIGN_ID"),
					IDEA_ID: this.getObjectModel().getProperty("/ID")
				}).done(function(res) {
					oDialog.setBusy(false);
					oDialog.close();
					var requestText = res.RESULT.status.toString().includes('20') ?
						'Your request to create a new object request has been sent successfully.' :
						'Your request to create a new object request has been failed.';
					var sShowText = requestText + 'The request ID is ' + (res.RESULT.generatedId ? res.RESULT.generatedId[-1] : '') +
						' and message status is: ' + (res.RESULT.status ? res.RESULT.status : '') + '.';
					var oTextControl = new Text({
						text: sShowText
					});
					var oLinkControl = new Link({
						href: Configuration.getBackendRootURL() + '/sap/ino/config#integrationMonitorList',
						text: 'For more detail, please navigate to Innovation Office->Monitor->Integration',
						target: '_blank'
					});
					if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
							state: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
							content: new FlexBox({
								items: [oTextControl, oLinkControl],
								alignItems: "Start",
								justifyContent: "Start",
								alignContent: "Start"
							}),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function() {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
					}

					this.oSuccessMessageDialog.open();
				}).fail(function() {
					oDialog.setBusy(false);
					oDialog.close();
					MessageToast.show(that.getText("INTEGRATION_TARGET_MSG_STATUS_CREATE_FAILED"), oMessageToast);
				});
			},

			onIntegrationObjectDialogClose: function() {
				this.getIntegrationObjectDialog().close();
				this.getIntegrationObjectDialog().destroy();
				this._oCopyIntegrationObject = undefined;
			},

			selectIntegrationTarget: function(oEvent) {
				this.getIntegrationObjectDialog().getModel("objectContext").setProperty("/enableCreateIntegrationObjectBtn", true);
				this.objectTechnicalName = oEvent.getParameter("listItem").getBindingContext("objectContext").getProperty("TECHNICAL_NAME");
			},

			onUpdateFinished: function(oEvent) {
				if (this.enableCreateIntegrationObjectTag) {
					this.enableCreateIntegrationObjectTag = false;
					var oIntegrationTargetList = this.byId("integrationTargetList");
					if (oIntegrationTargetList && oIntegrationTargetList.getItems()) {
						oIntegrationTargetList.setSelectedItem(oIntegrationTargetList.getItems()[0]);
					}
				}
			},

			onLinkExternalObject: function() {
				var oDialog = this.getLinkExternalObjectDialog();
				IdeaObjectIntegration.getAllApiFromCampaign({
					CAMPAIGN_ID: this.getObjectModel().getProperty("/CAMPAIGN_ID")
				}).done(function(oData) {
					setTimeout(function() {
						oDialog.setModel(new JSONModel(oData), "ExternalObjectModel");
						oDialog.getModel("ExternalObjectModel").setProperty("/LINK_OBJECT_INFO", {
							API_TECHNICAL_NAME: oData && oData.RESULT && oData.RESULT.length === 1 ? oData.RESULT[0].TECHNICAL_NAME : null,
							OBJECT_ID: null,
							OBJECT_TYPE: null
						});
						oDialog.open();
					}, 500);
				}).fail(function(odata) {
					odata.RESULT = [];
				});
			},

			getLinkExternalObjectDialog: function() {
				if (!this._oLinkExternalObject) {
					this._oLinkExternalObject = this.createFragment("sap.ino.vc.idea.fragments.LinkExternalObjectDialog", this.getView().getId());
					this.getView().addDependent(this._oLinkExternalObject); // attach view configurations (includes model) to fragement
				}
				return this._oLinkExternalObject;
			},

			onTargetSystemChange: function(oEvent) {
				var oSource = oEvent.getSource();
			},

			onLinkExternalObjectSave: function() {
				var that = this;
				var oDialog = this.getLinkExternalObjectDialog();
				if (this.getView().getController().hasAnyClientErrorMessages()) {
					return;
				}
				var oModel = oDialog.getModel("ExternalObjectModel");
				oDialog.setBusy(true);
				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};
				IdeaObjectIntegration.linkExistedObject({
					API_TECH_NAME: oModel.getProperty("/LINK_OBJECT_INFO/API_TECHNICAL_NAME"),
					OBJECT_ID: oModel.getProperty("/LINK_OBJECT_INFO/OBJECT_ID"),
					OBJECT_TYPE: oModel.getProperty("/LINK_OBJECT_INFO/OBJECT_TYPE"),
					CAMPAIGN_ID: this.getObjectModel().getProperty("/CAMPAIGN_ID"),
					IDEA_ID: this.getObjectModel().getProperty("/ID")
				}).done(function(res) {
					if (res.RESULT.existed) {
						oDialog.setBusy(false);
						MessageBox.show(that.getText("IDEA_OBJECT_MSG_INTEGRATION_LINK_EXISTED"), {
							title: that.getText("IDEA_OBJECT_TITLE_INTEGRATION_LINK_EXISTED"),
							icon: MessageBox.Icon.WARNING,
							actions: [MessageBox.Action.OK],
							onClose: function(sDialogAction) {}
						});
					} else {
						oDialog.setBusy(false);
						oDialog.close();

						var sMsgPara1 = res.RESULT.status.toString().includes('20') ? that.getText("IDEA_OBJECT_MSG_INTEGRATION_LINK_SUCCESS") : that.getText(
							"IDEA_OBJECT_MSG_INTEGRATION_LINK_FAILED");
						var sMsgPara2 = res.RESULT.generatedId ? res.RESULT.generatedId[-1] : '';
						var sMsgPara3 = res.RESULT.status ? res.RESULT.status : '';
						var sShowText = that.getText("IDEA_OBJECT_MSG_INTEGRATION_LINK_SHOW_TEXT", [sMsgPara1, sMsgPara2, sMsgPara3]);
						var oTextControl = new Text({
							text: sShowText
						});
						var oLinkControl = new Link({
							href: Configuration.getBackendRootURL() + '/sap/ino/config#integrationMonitorList',
							text: that.getText("IDEA_OBJECT_MSG_INTEGRATION_LINK_MORE_DETAIL"),
							target: '_blank'
						});
						that.oLinkMessageDialog = new Dialog({
							type: DialogType.Message,
							title: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
							state: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
							content: new FlexBox({
								items: [oTextControl, oLinkControl],
								alignItems: "Start",
								justifyContent: "Start",
								alignContent: "Start"
							}),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function() {
									that.oLinkMessageDialog.close();
								}.bind(this)
							})
						});

						that.oLinkMessageDialog.open();
					}
				}).fail(function() {
					oDialog.setBusy(false);
					oDialog.close();
					MessageToast.show(that.getText("INTEGRATION_TARGET_MSG_STATUS_CREATE_FAILED"), oMessageToast);
				});

			},

			onLinkExternalObjectDialogClose: function() {
				this.getLinkExternalObjectDialog().close();
				this.getLinkExternalObjectDialog().destroy();
				this._oLinkExternalObject = undefined;
			},

			onDelete: function(oEvent) {
				var oController = this;
				var oDelBtn = oEvent.getSource();
				var oObjectModel = oController.getObjectModel();
				var ppmConfig = Configuration.getSystemSettingsModel().getProperty("/sap.ino.config.PPM_INTEGRATION_ACTIVE");
				var intObjectExisted = oObjectModel.getProperty("/INTEGRATION_OBJECT_EXIST");
				var bHasReward = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/hasReward");
				var bDeleteAllowed = oObjectModel.getPropertyModel().getProperty("/actions/del/enabled");
				var bIsMergedWithVote = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/isMergeedWithVote");
				if (bHasReward) {
					//has reward ==> can't delete
					MessageToast.show(this.getText("MSG_IDEA_HAVE_REWARD_CANNOT_DELETE"));
				} else if (!bDeleteAllowed) {
					MessageToast.show(this.getText("OBJECT_MSG_DELETE_FAILED"));
				} else if (bIsMergedWithVote) {
					MessageToast.show(this.getText("MSG_IDEA_MERGED_WITH_VOTE_CANNOT_DELETE"));
				} else {
					//EVALUATION 
					var bHasEvaluation = oObjectModel.getProperty("/EVALUATION_COUNT");
					var isManager = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/isManager");
					if (!bHasEvaluation || (bHasEvaluation && isManager)) {
						//havn't evaluation / hava evaluation and the user is manager/coach ==>add ppm check, then delete
						//var msgConfirm = ppmConfig === "1" ? "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM_HAVE_PPM" : "MSG_DEL_CONFIRM";
						var msgConfirm = "MSG_DEL_CONFIRM";
						if (ppmConfig === "1" || intObjectExisted) { //PPM Check and integration object check
							msgConfirm = "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM_HAVE_PPM_INTEGRATION";
						}

						var oDelRequest = oController.executeObjectAction("del", {
							messages: {
								confirm: msgConfirm,
								success: "MSG_DEL_SUCCESS"
							}
						});
						oDelRequest.done(function(oResponse) {
							if (oResponse && oResponse.confirmationCancelled === true) {
								if (oDelBtn && jQuery.type(oDelBtn.focus) === "function") {
									oDelBtn.focus();
								}
								return;
							}
							oController.navigateTo("idealist");
						});

					} else {
						MessageToast.show(this.getText("MSG_IDEA_DEL_FAILED_SUBMITTER_HAVE_EVALUATION"));
					}
				}

			},

			onPressPrevious: function() {
				var iId = this.getObjectModel().getProperty("/ID");
				var oIdeaCountModel = this.getView().getModel("ideaList");
				var ideaList = oIdeaCountModel.getData();
				var index;
				$.each(ideaList, function(i, n) {
					if (n === iId) {
						index = i;
						return false;
					}
				});
				var preItem = ideaList[index - 1];
				if (preItem) {
					this.setViewProperty("/PAGE_INDICATOR", index);
					this.navigateTo("idea-display", {
						id: preItem
					});
				}
			},

			onPressNext: function() {
				var iId = this.getObjectModel().getProperty("/ID");
				var oIdeaCountModel = this.getView().getModel("ideaList");
				var ideaList = oIdeaCountModel.getData();
				var index;
				$.each(ideaList, function(i, n) {
					if (n === iId) {
						index = i;
						return false;
					}
				});
				var nextItem = ideaList[index + 1];
				if (nextItem) {
					this.setViewProperty("/PAGE_INDICATOR", index + 2);
					this.navigateTo("idea-display", {
						id: nextItem
					});
				}
			},
			onExit: function() {
				BaseController.prototype.onExit.apply(this, arguments);
			},
			initPageIndicatorLabel: function(iId) {
				var that = this;

				//var oIdeaCountModel = this.getView().getModel("ideaList");
				var iOldIndicator, iOldPageSize;
				iOldIndicator = this.getViewProperty("/PAGE_INDICATOR");
				iOldPageSize = this.getViewProperty("/PAGE_SIZE");

				// if(oIdeaCountModel.getData().length > 0){
				var oIdeaSearchParams = sap.ui.getCore().getModel("ideaSearchParams");
				if (oIdeaSearchParams && oIdeaSearchParams.getData()) {
					var pageIndicatorCountPath = oIdeaSearchParams.getData().path;
					if (oIdeaSearchParams.getData().path.indexOf('IdeaMediumBackofficeSearchParams') > -1) {
						pageIndicatorCountPath = pageIndicatorCountPath.replace('IdeaMediumBackofficeSearchParams',
							'IdeaMediumBackofficeSearchParamsCount');
					} else {
						pageIndicatorCountPath = pageIndicatorCountPath.replace('IdeaMediumSearchParams', 'IdeaMediumSearchParamsCount');
					}

					jQuery.ajax({
						url: pageIndicatorCountPath,
						headers: {
							'X-CSRF-Token': 'Fetch'
						},
						type: 'GET',
						contentType: 'application/json; charset=UTF-8',
						async: true,
						success: function(oData) {
							var oModel = new JSONModel();
							var ideaList = $.map(oData.d.results, function(idea) {
								return idea.ID;
							});
							oModel.setData(ideaList);
							that.getView().setModel(oModel, "ideaList");
							var index;
							$.each(ideaList, function(i, n) {
								if (n === parseInt(iId, 10)) {
									index = i;
									return false;
								}
							});
							var sContainerId = that.getViewProperty("/IDEA_SECTION_CONTAINER_ID");
							if (index !== undefined) {
								that.byId("pageIndicatorPanel").setVisible(true);
								that.setViewProperty("/IS_IN_CURRENT_IDEA_LIST", true);
								if (sContainerId) {
									that.byId("ideaPageToolbar").setHeight("5rem");
									$(sContainerId).css("top", "5rem");
								}
								var iPageSize = ideaList.length;
								// var oPageSizeLabel = that.byId("pageSizeLabel");
								// oPageSizeLabel.setText(iPageSize);

								// var oPageIndicatorLabel = that.byId("pageIndicatorLabel");
								// oPageIndicatorLabel.setText(index + 1);
								if (iOldPageSize !== iPageSize) {
									that.setViewProperty("/PAGE_SIZE", iPageSize);
								}
								if (iOldIndicator !== index + 1) {
									that.setViewProperty("/PAGE_INDICATOR", index + 1);
								}

								// if (index - 1 >= 0) {
								// 	that.byId("previousIdeaBtn").setEnabled(true);
								// 	//this.byId("previousIdeaBtn").setVisible(true);
								// } else {
								// 	that.byId("previousIdeaBtn").setEnabled(false);
								// 	//this.byId("previousIdeaBtn").setVisible(false);
								// }
								// if (index + 1 < ideaList.length) {
								// 	that.byId("nextIdeaBtn").setEnabled(true);
								// 	//this.byId("nextIdeaBtn").setVisible(true);
								// } else {
								// 	that.byId("nextIdeaBtn").setEnabled(false);
								// 	//this.byId("nextIdeaBtn").setVisible(false);
								// }
							} else {
								that.byId("pageIndicatorPanel").setVisible(false);
								if (sContainerId) {
									that.byId("ideaPageToolbar").setHeight("2.5rem");
									$(sContainerId).css("top", "2.5rem");
								}
							}
						},
						error: function(oMessage) {
							that.byId("pageIndicatorPanel").setVisible(false);
							var sContainerId = that.getViewProperty("/IDEA_SECTION_CONTAINER_ID");
							if (sContainerId) {
								that.byId("ideaPageToolbar").setHeight("2.5rem");
								$(sContainerId).css("top", "2.5rem");
							}
						}
					});
				} else {
					that.byId("pageIndicatorPanel").setVisible(false);
				}
			},

			setPageContentTopStyle: function() {
				var oideaListModel = this.getView().getModel("ideaList");
				var sContainerId = "#" + this.byId("ideaDisplay").getScrollDelegate()._sContainerId;
				this.setViewProperty("/IDEA_SECTION_CONTAINER_ID", sContainerId);
				if ((oideaListModel && oideaListModel.getData().length > 0) && this.getViewProperty("/IS_IN_CURRENT_IDEA_LIST")) {
					this.byId("ideaPageToolbar").setHeight("5rem");
					$(sContainerId).css("top", "5rem");
				} else {
					this.byId("ideaPageToolbar").setHeight("2.5rem");
					$(sContainerId).css("top", "2.5rem");
				}

			}

		}));
});