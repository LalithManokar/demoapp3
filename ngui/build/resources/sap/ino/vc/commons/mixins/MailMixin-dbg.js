sap.ui.define([
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast"
], function() {
	"use strict";

	/**
	 * @class
	 * Mixin that generate mail body and subject
	 */
	var MailMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	MailMixin.createMailContent = function() {
		var oContextObjectModel = this.getView().getModel("object") || this.getView().getModel("contextObject");
		if (oContextObjectModel) {
			var sSubject = "";
			var sContextObjectName = oContextObjectModel.getProperty("/NAME");
			var sContextObjectType = oContextObjectModel.getProperty("/_OBJECT_TYPE_CODE");
			if (sContextObjectType === "IDEA") {
				sSubject = this.getText("MAIL_SUBJECT_TEMPLATE", [oContextObjectModel.getProperty("/CAMPAIGN_NAME"), sContextObjectName]);
			} else {
				sSubject = sContextObjectName;
			}

			var sBody = "";
			var iContextObjectId = oContextObjectModel.getProperty("/ID");
			if (sContextObjectType && iContextObjectId) {
				var sNavigationTarget = sContextObjectType.toLowerCase();
				if (sNavigationTarget === "idea" || sNavigationTarget === "evaluation") {
					sNavigationTarget += "-display";
				}
				var sOrigin = document.location.origin;
				if (!sOrigin) {
					sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
				}
				var sURL = sOrigin +
					document.location.pathname +
					this.getOwnerComponent().getNavigationLink(sNavigationTarget, {
						id: iContextObjectId
					});
				sBody = this.getText("MAIL_TEMPLATE_" + sContextObjectType, sURL);
			}
			return {
				subject: sSubject,
				body: sBody
			};
		} else {
			var sSubject = "";
			var sBody = "";
			var sOrigin = document.location.origin;

			if (!sOrigin) {
				sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
			}

			var sURL = sOrigin +
				document.location.pathname;

			sBody = this.getText("MAIL_TEMPLATE_INM", sURL);
			
			return {
				subject: sSubject,
				body: sBody
			};
		}
	};

	return MailMixin;
});