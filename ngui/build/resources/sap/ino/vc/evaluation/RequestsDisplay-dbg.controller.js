sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/models/object/EvaluationRequest",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/evaluation/EvaluationFormatter"
], function(BaseController, EvaluationRequest, MessageToast, JSONModel, TopLevelPageFacet, EvaluationFormatter) {
	"use strict";

	return BaseController.extend("sap.ino.vc.evaluation.RequestsDisplay", jQuery.extend({}, TopLevelPageFacet, {

		formatter: EvaluationFormatter,
		routes: ["evaluationrequest-display"],

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
		},

		onRouteMatched: function(oEvent) {
			var oController = this;
			BaseController.prototype.onRouteMatched.apply(oController, arguments);
			oController.setHelp("EVALUATIONREQUESTS_DISPLAY");
			oController.setViewProperty("/USER_IMAGE_ID", oController.getOwnerComponent().getCurrentUserImageId());

			var oRouteArgs = oEvent.getParameter("arguments");
			var oQuery = oRouteArgs["?query"];
			var sSection = (oQuery && oQuery.section) || "sectionExperts";
			this.showSection(sSection);
		},

		createObjectModel: function(vObjectKey) {
			return new EvaluationRequest(vObjectKey, {
				nodes: ["Root"],
				actions: ["update", "del", "executeStatusTransition", "submit"],
				continuousUse: true,
				readSource: {
					model: this.getDefaultODataModel()
				}
			});
		},

		getODataEntitySet: function() {
			return "EvaluationRequest";
		},
		
		onTabSelect: function(oEvent) {
			var oSection = oEvent.getParameter("section");
			this.navigateTo(this.getCurrentRoute(), {
				id: this.getObjectModel().getKey(),
				query: {
					section: this.getLocalElementId(oSection)
				}
			});
		},
		onRequestItemPress: function(oEvent) {
			var nId = oEvent.getSource().getBindingContext("object").getProperty("EVALUATION_ID");
			if (nId) {
				this.navigateTo("evaluation-display", {
					id: nId
				});
			}
		},

		onEdit: function() {
			this.navigateTo("evaluationrequest-edit", {
				id: this.getObjectModel().getKey()
			}, true);
		},

		onIdeaPressed: function() {
			var iId = this.getObjectModel().getProperty("/IDEA_ID");
			this.navigateTo("idea-display", {
				id: iId
			}, true);
		},
		onOpenCreator: function(oEvent) {
			var oSource = oEvent.getSource();
			var iIdentityId = oSource.getCustomData()[0].getProperty("value");
			if (!this.oIdentityCardView) {
				this.oIdentityCardView = sap.ui.xmlview({
					viewName: "sap.ino.vc.iam.IdentityCard"
				});
				this.getView().addDependent(this.oIdentityCardView);
			}
			this.oIdentityCardView.getController().open(oSource, iIdentityId);
		},
		
        onBeforeHide:function(){
            this.setObjectModel(null);
        }
	}));
});