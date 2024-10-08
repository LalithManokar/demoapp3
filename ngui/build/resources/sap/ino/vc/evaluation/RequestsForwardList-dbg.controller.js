sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(Controller, BaseFormatter, TopLevelPageFacet) {
	"use strict";

	return Controller.extend("sap.ino.vc.evaluation.RequestsForwardList", jQuery.extend({}, TopLevelPageFacet, {
		formatter: BaseFormatter,
		onOpenCreatorInToForward: function(oEvent) {
			this._onOpenCreator(oEvent, "TO_IDENTITY");
		},

		onOpenCreatorInForward: function(oEvent) {
			this._onOpenCreator(oEvent, "FROM_IDENTITY");
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