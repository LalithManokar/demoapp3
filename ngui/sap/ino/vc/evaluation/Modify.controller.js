sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/Evaluation",
    "sap/ino/vc/evaluation/EvaluationFacet",
    "sap/ino/commons/models/types/IntBooleanType",
    "sap/ino/commons/models/types/IntNullableBooleanType",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/vc/attachment/AttachmentMixin",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageToast",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(BaseController,
	Evaluation,
	EvaluationFacet,
	IntBooleanType,
	IntegerType,
	JSONModel,
	Attachment,
	AttachmentMixin,
	Configuration,
	MessageToast,
	TopLevelPageFacet) {
	"use strict";

	var mRoutes = {
		create: "evaluation-create",
		edit: "evaluation-edit"
	};

	var attachmentUploadUrl = Attachment.getEndpointURL();
	return BaseController.extend("sap.ino.vc.evaluation.Modify", jQuery.extend({}, TopLevelPageFacet, EvaluationFacet, AttachmentMixin, {

		routes: [mRoutes.create, mRoutes.edit],

		intBoolean: new IntBooleanType(),
		integerType: new IntegerType(),

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			if (!this.getModel("local")) {
				this.setModel(new JSONModel({
					ATTACHMENT_UPLOAD_URL: attachmentUploadUrl
				}), "local");
			}
			if (!this.getModel("view")) {
				this.setModel(new JSONModel({
					"IDEA_NAVIGATION_SECTION": "ideaSectionEvaluations"
				}), "view");
			}
			var oViewModel = this.getModel("view");
			if (!oViewModel.getProperty("/IDEA_NAVIGATION_SECTION")) {
				oViewModel.setProperty("/IDEA_NAVIGATION_SECTION", "ideaSectionEvaluations");
			}
			oViewModel.setProperty("/EDIT_MODE", true);
			this.aBusyControls = [this.byId("evaluationLayout")];
			this.initMatrixControl();
			this.scrollDockElement("evaluationModify", "evaluationMatrix");
			this._sResizeEvalList = this.attachListControlResized(this.byId("criteriaList"));
		},

		onExit: function() {
			BaseController.prototype.onExit.apply(this, arguments);
			this.detachListControlResized(this._sResizeEvalList);
		},

		onRouteMatched: function(oEvent) {
			var that = this;
			var oArgs = oEvent.getParameter("arguments");
			var oEvaluation = this.getObjectModel();
			var sRoute = oEvent.getParameter("name");

			this.setObjectExists(true);

			var oSettings = {
				actions: ["del", "modify", "modifyAndSubmit", "submit"],
				nodes: ["Root"],
				continuousUse: true,
				readSource: {
					model: this.getDefaultODataModel()
				}
			};

			function setEvaluationModel(oEvaluation) {
				that.setObjectModel(oEvaluation);

				oEvaluation.getDataInitializedPromise().done(function() {
					that.setHelp("EVALUATION_MODIFY");
				});
				oEvaluation.getDataInitializedPromise().fail(function() {
					that.setObjectExists(false);
				});

				that.bindMatrix();
			}

			if (sRoute === mRoutes.create) {
				var mQuery = oArgs["?query"] || {};
				if (jQuery.isNumeric(mQuery.ideaId)) {
					if (mQuery.evalIds) {
						// Average Evaluation
						var aEvaluationId = mQuery.evalIds.split(",");
						var oDataModel = this.getModel("data");
						var aDeferred = [];
						jQuery.each(aEvaluationId, function(iIndex, iEvaluationId) {
							var oDeferred = new jQuery.Deferred();
							oDataModel.read("/IdeaEvaluation(" + iEvaluationId + ")/CriterionValues", {
								success: function(oData) {
									oDeferred.resolve({
										"CriterionValues": oData.results
									});
								},
								error: function(oError) {
									oDeferred.reject(oError);
								}
							});
							aDeferred.push(oDeferred);
							if (mQuery.includeAttachs * 1) {
								var oAttachDeferred = new jQuery.Deferred();
								oDataModel.read("/IdeaEvaluation(" + iEvaluationId + ")/EvalAttachments", {
									success: function(oData) {
										oAttachDeferred.resolve({
											"EvalAttachments": oData.results
										});
									},
									error: function(oError) {
										oAttachDeferred.reject(oError);
									}
								});
								aDeferred.push(oAttachDeferred);
							}
						});
						jQuery.when.apply(jQuery, aDeferred).done(function() {
							var aCriterionValues = [],
								aEvalAttachments = [],
								keyObj = {};
							jQuery.each(arguments, function(index, oData) {
								if (oData.hasOwnProperty("CriterionValues") && oData.CriterionValues) {
									aCriterionValues.push(oData.CriterionValues);
								} else if (oData.hasOwnProperty("EvalAttachments") && oData.EvalAttachments) {
									jQuery.each(oData.EvalAttachments, function(iNewIndex, evalA) {
										if (!keyObj.hasOwnProperty(evalA.ATTACHMENT_ID)) {
											keyObj[evalA.ATTACHMENT_ID] = true;
											aEvalAttachments.push(evalA);
										}
									});
								}
							});
							var nAction = Number(mQuery.evalAction);
							if (nAction === 1) {
								oEvaluation = Evaluation.createAverageEvaluation(parseInt(mQuery.ideaId, 10), aCriterionValues, oSettings, aEvalAttachments
								, that.getText("IDEA_OBJECT_DEFAULT_AVE_EVALUATION_COMMENT"));
							} else if (nAction === 2) {
								oEvaluation = Evaluation.createTotalEvaluation(parseInt(mQuery.ideaId, 10), aCriterionValues, oSettings, aEvalAttachments,
									that.getText("IDEA_OBJECT_DEFAULT_TOTAL_EVALUATION_COMMENT"), aEvaluationId[0], function(aArgs, nType) {
										return nType === 1 ? {
										    msg: that.getText("MSG_EVALUATION_MAX_WARNING_TXT", aArgs),
											msg_tooltip: that.getText("MSG_EVALUATION_MAX_WARNING_INFO", aArgs)
										} : {
										    msg: that.getText("MSG_EVALUATION_MAX_WARNING_TXT", aArgs),
											msg_tooltip: that.getText("MSG_EVALUATION_MIN_WARNING_INFO", aArgs)
										};
									});
							}
							setEvaluationModel(oEvaluation);
						});
					} else {
						var oCustomSetting = {
							IDEA_ID: parseInt(mQuery.ideaId, 10)
						};
						if (parseInt(mQuery.EvalReqItemId, 10) > 0) {
							oCustomSetting.EVAL_REQ_ITEM_ID = parseInt(mQuery.EvalReqItemId, 10);
						}
						oEvaluation = new Evaluation(oCustomSetting, oSettings);
						setEvaluationModel(oEvaluation);
					}
				}
			} else {
				if (jQuery.isNumeric(oArgs.id)) {
					var iEvaluationId = parseInt(oArgs.id, 10);
					if (!oEvaluation || (oEvaluation.getKey() !== iEvaluationId)) {
						oEvaluation = new Evaluation(iEvaluationId, oSettings);
					}
					this.bindDefaultODataModel(iEvaluationId);
					setEvaluationModel(oEvaluation);
				}
			}
		},

		onAfterRendering: function() {
			this._attachmentMixinInit({
				attachmentId: "EvalAttachments",
				updateObject: function(oObject) {},
				uploadSuccess: function(oObject, oResponse) {
					oObject.addAttachment({
						"CREATED_BY_NAME": Configuration.getCurrentUser().NAME,
						"ATTACHMENT_ID": oResponse.attachmentId,
						"FILE_NAME": oResponse.fileName,
						"MEDIA_TYPE": oResponse.mediaType,
						"CREATED_AT": new Date()
					});
				}
			});
		},

		onSave: function() {
			var oController = this;
			var bIsNewEvaluation = oController.getObjectModel().isNew();
			var oModifyRequest = oController.executeObjectAction("modify");
			oModifyRequest.done(function() {
				var oEvaluation = oController.getObjectModel();
				if (bIsNewEvaluation) {
					oController.navigateTo("evaluation-edit", {
						id: oEvaluation.getKey()
					}, true);
				}
			});
		}

	}));
});