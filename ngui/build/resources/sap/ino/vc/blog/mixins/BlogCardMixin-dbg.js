sap.ui.define([
], function() {
	"use strict";

	/**
	 * Mixin that handles blog card actions
	 * @mixin
	 */
	var BlogCardMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	BlogCardMixin.onOpenCreator = function(oEvent) {
		var oSource = oEvent.getSource();
		var iIdentityId = oSource.getBindingContext("data").getProperty("CREATED_BY_ID");
		if (!this.oIdentityCardView) {
			this.oIdentityCardView = sap.ui.xmlview({
				viewName: "sap.ino.vc.iam.IdentityCard"
			});
			this.getView().addDependent(this.oIdentityCardView);
		}
		this.oIdentityCardView.getController().open(oSource, iIdentityId);
	};

	return BlogCardMixin;
});