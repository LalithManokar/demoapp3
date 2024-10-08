sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/EvaluationRequest",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/evaluation/mixins/ExpertFinderMixin",
    "sap/ino/vc/idea/mixins/AddExpertFromClipboardMixin",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/ino/commons/util/DateUtil"
], function(BaseController, JSONModel, EvaluationRequest, Filter, FilterOperator, Sorter, MessageType, Message, TopLevelPageFacet,
	ExpertFinderMixin, AddExpertFromClipboardMixin, EvaluationFormatter, DateUtil) {
	"use strict";

	var mRoutes = {
		create: "evaluationrequest-create",
		edit: "evaluationrequest-edit"
	};

	return BaseController.extend("sap.ino.vc.evaluation.RequestsModify", jQuery.extend({}, TopLevelPageFacet, ExpertFinderMixin,
		AddExpertFromClipboardMixin, {

			view: {
				CLIPBOARD_ITEM_SELECT_COUNTER: 0, // used to refresh data bindings
				IS_EVALUATION_REQUEST: false // used to distinguish whether in evaluation request dialog or idea detail page
			},
			routes: [mRoutes.create, mRoutes.edit],
			_INPUT_EXPERTS_SETTING: {
				childNodeName: "Experts",
				childNodeNameSingular: "Expert",
				suggestion: {
					key: "ID",
					text: "NAME",
					additionalText: "USER_NAME",
					path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
					sorter: new Sorter("NAME")
				},
				token: {
					key: "IDENTITY_ID",
					text: "NAME"
				}
			},

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this.addMultiInputHandling(this.byId("inputExperts"), this._INPUT_EXPERTS_SETTING);
				this.byId("inputExperts").attachTokenUpdate(this._tokenUpdate, this);
				this.getView().setModel(new JSONModel(this.view), "view");
				this.setViewProperty("/IS_EVALUATION_REQUEST", true);
			},

			_initExpertsFilters: function() {
				this._findFilters(this.getObjectModel().getProperty("/Experts"), function(oExpert) {
					return oExpert.IDENTITY_ID;
				});
			},

			_tokenUpdate: function(oEvent) {
				if (!oEvent.getSource().getAggregation("tokenizer")) {
					return;
				}
				var aTokens = oEvent.getSource().getAggregation("tokenizer").getAggregation("tokens");
				this._findFilters(aTokens, function(oToken) {
					return oToken.getProperty("key");
				});
			},

			_findFilters: function(aKeys, fnGetKey) {
				this._INPUT_EXPERTS_SETTING.suggestion.filters = undefined;
				if (!aKeys || aKeys.length <= 0) {
					return;
				}

				var aFilters = [];
				jQuery.each(aKeys, function(index, oKey) {
					aFilters.push(new sap.ui.model.Filter({
						path: "ID",
						operator: "NE",
						value1: fnGetKey(oKey)
					}));
				});
				this._INPUT_EXPERTS_SETTING.suggestion.filters = new sap.ui.model.Filter({
					filters: aFilters,
					and: true
				});
			},

			createObjectModel: function(vObjectKey, sRoute, oRouteArgs) {
				var oController = this;
				var oKey = vObjectKey;
				var oSettings = {
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true,
					readSource: {
						model: this.getDefaultODataModel()
					}
				};
				var oRequest = new EvaluationRequest(oKey, oSettings);

				if (!oKey) {
					var mQuery = oRouteArgs["?query"] || {};
					var nIdeaId = parseInt(mQuery.idea, 10);
					try {
						oController.getView().setBusy(true);
						jQuery.when(oRequest.getReadSourceModel().read("/IdeaMedium(" + nIdeaId + ")", {
							success: function(oIdea) {
								oRequest.setProperty("/RESP_VALUE_CODE", oIdea.RESP_VALUE_CODE);
								oRequest.setProperty("/IDEA_NAME", oIdea.NAME);
								oRequest.setProperty("/IDEA_ID", oIdea.ID);
								oRequest.setProperty("/IDEA_PHASE_CODE", oIdea.PHASE);
								oRequest.setProperty("/CAMPAIGN_SUBMIT_TO", oIdea.CAMPAIGN_SUBMIT_TO);
							}
						})).done(function() {
							oController.getView().setBusy(false);
						});
						jQuery.when(oRequest.getReadSourceModel().read("/IdeaFull(" + nIdeaId + ")/Experts", {
							success: function(oIdea) {
								oRequest.setProperty("/IdeaExpertsForDialog", oIdea.results);
							}
						})).done(function() {
							oController.getView().setBusy(false);
						});
						jQuery.when(oRequest.getReadSourceModel().read("/IdeaFull(" + nIdeaId + ")/RespExperts", {
							success: function(oIdea) {
								oRequest.setProperty("/RespExpertsForDialog", oIdea.results);
							}
						})).done(function() {
							oController.getView().setBusy(false);
						});
						jQuery.when(oRequest.getReadSourceModel().read("/IdeaFull(" + nIdeaId + ")/CampaignExperts", {
							success: function(oIdea) {
								oRequest.setProperty("/CampExpertsForDialog", oIdea.results);
							}
						})).done(function() {
							oController.getView().setBusy(false);
						});
					} catch (oError) {
						jQuery.sap.log.error("Failed parsing creation arguments", oError, "evaluationrequest-create");
					}
				}
				return oRequest;
			},

			onRouteMatched: function() {
				var oController = this;
				BaseController.prototype.onRouteMatched.apply(this, arguments);
				oController.setHelp("EVALUATIONREQUESTS_MODIFY");
				oController.getObjectModel().getDataInitializedPromise().done(function() {
					oController._initExpertsFilters();
				});
			},

			onSubmit: function() {
				var oController = this;
				oController.resetClientMessages();
				if (!oController.validateContent()) {
					return;
				}
				var oData = oController.getObjectModel().oData;
				// oData.ACCEPT_DATE = DateUtil.convertToUtcString(oData.ACCEPT_DATE);
				// oData.COMPLETE_DATE = DateUtil.convertToUtcString(oData.COMPLETE_DATE);
				var oConfirmRequest = sap.ino.commons.models.object.EvaluationRequest.checkBeforeUpdate(oData);
				oConfirmRequest.done(function(oResponse) {
					if (oResponse && oResponse.RESULT) {
						oController.onConfirmDialog(oResponse.RESULT);
					} else {
						oController.onModify();
					}
				});
			},

			onModify: function() {
				var oController = this;
				var oCurrrentModel = oController.getObjectModel();
				var oData = oController.getObjectModel().oData;
				oData.ACCEPT_DATE = DateUtil.convertToUtcString(oData.ACCEPT_DATE);
				oData.COMPLETE_DATE = DateUtil.convertToUtcString(oData.COMPLETE_DATE);
				var oModifyRequest = this.executeObjectAction("modify", {
					messages: {
						error: "MSG_EVAL_REQ_INVALID_ERROR"
					}
				});
				oModifyRequest.done(function() {
					oController.navigateTo("idea-display", {
						id: oCurrrentModel.getProperty("/IDEA_ID"),
						query: {
							section: "sectionEvaluations"
						}
					}, true);
				});
				oModifyRequest.fail(function() {
    				oData.ACCEPT_DATE = DateUtil.convertToLocalDate(oData.ACCEPT_DATE);
    				oData.COMPLETE_DATE = DateUtil.convertToLocalDate(oData.COMPLETE_DATE);
				});
			},

			onIdeaPressed: function() {
				var iId = this.getObjectModel().getProperty("/IDEA_ID");
				this.navigateTo("idea-display", {
					id: iId
				}, true);
			},

			onDelete: function(oEvent) {
				var oController = this;
				oController.resetClientMessages();
				var oDelBtn = oEvent.getSource();
				var oDelRequest = this.executeObjectAction("del", {
					messages: {
						confirm: "MSG_DEL_CONFIRM",
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
					oController.navigateBack();
				});
			},

			onConfirmDialog: function(aResponse) {
				var _CONFIG_MSG = {
					"EXPERT_AMOUNT_WARNING": "MSG_EVAL_REQ_MAX_EXPERT_WARNING",
					"DUPLICATED_EXPERT_WARNING": "MSG_EVAL_REQ_DUPLICATED_EXPERT_WARNING",
					"EXISTED_EVALUATION_WARNING": "MSG_EVAL_REQ_EXISTED_EVALUATION_WARNING"
				};
				var oController = this;
				var oVBox = new sap.m.VBox();
				if (!aResponse || aResponse.length <= 0) {
					oController.onModify();
					return;
				}
				jQuery.each(aResponse, function(index, data) {
					var bObject = data instanceof Object;
					var sCode = data;
					if (bObject) {
						sCode = data.MSG_CODE;
					}
					var sText = oController.getText(_CONFIG_MSG[sCode]);
					var oText = new sap.m.Text({
						text: sText
					});
					if (!bObject) {
						oText.addStyleClass("sapUiSmallMarginBottom");
					}
					oVBox.addItem(oText);
					var sDuplExperts = '';
					if (bObject && data.DuplExperts) {
						jQuery.each(data.DuplExperts, function(indexExpert, sExpertName) {
							sDuplExperts += "<li>" + sExpertName + "</li>";
						});
						oVBox.addItem(new sap.ui.core.HTML({
							content: "<ul class='sapUiTinyMarginTop sapUiSmallMarginBottom'>" + sDuplExperts + "</ul>",
							sanitizeContent: true
						}));
					}
				});
				var dialog = new sap.m.Dialog({
					title: oController.getText('IDEA_OBJECT_TIT_CONFIRM_EVALUATION_REQUEST'),
					type: 'Message',
					content: [oVBox],
					beginButton: new sap.m.Button({
						text: oController.getText('BTN_OK'),
						press: function() {
							var aExperts = oController.getObjectModel().getProperty("/Experts");
							jQuery.each(aResponse, function(index, data) {
								jQuery.each(data.DuplExperts, function(indexExpert, sExpertName) {
									for (var iExpert = aExperts.length - 1; iExpert >= 0; iExpert--) {
										if (aExperts[iExpert].NAME === sExpertName) {
											aExperts.splice(iExpert, 1);
										}
									}
								});
							});
							oController._initExpertsFilters();
							oController.getObjectModel().setProperty("/Experts", aExperts);
							oController.onModify();
							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: oController.getText("BTN_CANCEL"),
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			},

			validateContent: function() {
				var oController = this;
				var oModel = oController.getObjectModel();
				var aExperts = oModel.getProperty("/Experts");
				if (!aExperts || aExperts.length <= 0) {
					var oMsgEmptyExperts = new Message({
						code: "MSG_EVAL_REQ_EXPERTS_MANDATORY_ERROR",
						type: MessageType.Error
					});
					oController.setClientMessage(oMsgEmptyExperts, oController.byId("inputExperts"));
					return false;
				}

				if (!oModel.getProperty("/ACCEPT_DATE")) {
					oController.setClientMessage(new Message({
						code: "MSG_EVAL_REQ_ACCEPTANCE_MANDATORY_ERROR",
						type: MessageType.Error
					}), oController.byId("dpAcceptDate"));
					return false;
				}

				if (!oModel.getProperty("/COMPLETE_DATE")) {
					oController.setClientMessage(new Message({
						code: "MSG_EVAL_REQ_COMPLETION_MANDATORY_ERROR",
						type: MessageType.Error
					}), oController.byId("dpCompletetDate"));
					return false;
				}

				if (!oModel.getProperty("/DESCRIPTION")) {
					oController.setClientMessage(new Message({
						code: "MSG_EVAL_REQ_DESCRIPTION_MANDATORY_ERROR",
						type: MessageType.Error
					}), oController.byId("txtAreaDesc"));
					return false;
				}
				return true;
			},

			toSubmitDate: function(txt, date) {
				return txt + " " + EvaluationFormatter.toDate(date);
			}
		}));
});