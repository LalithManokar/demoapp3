sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/m/MessageToast"
], function(Controller, BaseFormatter, TopLevelPageFacet, MessageToast) {
	"use strict";

	return Controller.extend("sap.ino.vc.evaluation.RequestsClarificationList", jQuery.extend({}, TopLevelPageFacet, {
		formatter: BaseFormatter,

		onBeforeRendering: function() {
			this.setViewProperty("/USER_IMAGE_ID", this.getOwnerComponent().getCurrentUserImageId());
		},

		onClarificationSubmit: function(oEvent) {
			var oController = this;
			var oEvaluationRequest = oController.getModel("object");
			if (!oEvaluationRequest) {
				return;
			}
			var nId = oEvent.getSource().getCustomData()[0].getValue();
			var nToIdentity = oEvent.getSource().getCustomData()[1].getValue();
			var sContent = oEvent.getSource().getProperty("value");
			var oActionRequest = oEvaluationRequest.sendClarification({
				EVAL_REQ_ITEM_ID: nId,
				TO_IDENTITY: nToIdentity,
				CONTENT: sContent
			});
			if (oActionRequest) {
				oActionRequest.done(function() {
					MessageToast.show(oController.getText("EVAL_REQ_MSG_CLARIFICATION_SUCCESS"));
				});
				oActionRequest.fail(function(o) {
					if (o.MESSAGES && o.MESSAGES.length > 0) {
						MessageToast.show(oController.getText(o.MESSAGES[0].MESSAGE_TEXT));
					}
				});
			}
		},

		onOpenCreatorInFirstClarification: function(oEvent) {
			this._onOpenCreator(oEvent, "CREATED_BY_ID");
		},

		onOpenCreatorInClarification: function(oEvent) {
			this._onOpenCreator(oEvent, "CREATED_BY_ID");
		},

		_onOpenCreator: function(oEvent, sProperty) {
			var oSource = oEvent.getSource();
			var oDomRef = oEvent.getParameter("domRef");
			var oContext = oSource.getBindingContext("object");
			var iIdentityId = oContext.getProperty(sProperty);
			if (oDomRef) {
				var oReferenceControl = sap.ui.getCore().byId(oDomRef.id);
			}
			if (!this.oIdentityCardView) {
				this.oIdentityCardView = sap.ui.xmlview({
					viewName: "sap.ino.vc.iam.IdentityCard"
				});
				this.getView().addDependent(this.oIdentityCardView);
			}
			if (oReferenceControl) {
				this.oIdentityCardView.getController().open(oReferenceControl, iIdentityId);
			} else {
				this.oIdentityCardView.getController().open(oSource, iIdentityId);
			}
		}

	}));
});