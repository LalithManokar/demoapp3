sap.ui.define([
    "sap/ino/commons/models/object/Idea",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ino/controls/IFrame",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/ListItem"
], function(Idea, MessageToast, JSONModel, CodeModel, ObjectFormatter, Message, MessageType, IFrame, Configuration, ListItem) {
	"use strict";

	/**
	 * @class
	 * Mixin that provides an event for user voting
	 */
	var ChangeDecisionMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	// 	ChangeDecisionMixin.reasonCodeExist = function(sReasonListCode) {
	// 		return (sReasonListCode && sReasonListCode !== '' ? true : false);
	// 	};

	// 	ChangeDecisionMixin.formatter = ObjectFormatter;

	ChangeDecisionMixin.onOpenChangeDecision = function(oEvent) {
		var oDialog = this._getChangeDecisionDialog();
		var oIdea = this.getObjectModel();
		this.resetClientMessages();
		var aDecisions = oIdea.getProperty("/Decisions");
		var oSource = oEvent.getSource();
		var sID = oSource.getCustomData()[0].getValue();
		// 		var aSelectedDecsision = aDecisions.filter(function(oDecision) {
		// 			return oDecision.ID === sID;
		// 		});
		var oSelectedDecision, iIndex;
		for (var i = 0; i < aDecisions.length; i++) {
			if (sID === aDecisions[i].ID) {
				oSelectedDecision = aDecisions[i];
				iIndex = i;
			}
		}
		if (oSelectedDecision) {
			var oExtendDecision = jQuery.extend({}, oSelectedDecision);
			var oDecisionModel = new JSONModel(oExtendDecision);
			oDialog.setModel(oDecisionModel, "decision");
			if (oSelectedDecision.DECISION_REASON_LIST_CODE) {
				var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.ValueOptions";
				var aReasonList = CodeModel.getCodes(sCodeTable, function(oCode) {
					return oCode.LIST_CODE === oSelectedDecision.DECISION_REASON_LIST_CODE && oCode.ACTIVE === 1;
				});
			}
		}
		oDecisionModel.setProperty("/reasonList", aReasonList);
		oDecisionModel.setProperty("/INDEX", iIndex);
		oDecisionModel.setProperty("/SEND_RESPONSE", 1);
		oDecisionModel.setProperty("/IS_DECISION_RELEVANT", true);
		oDialog.open();
	};
	ChangeDecisionMixin._getChangeDecisionDialog = function() {
		var oDialog = this._oChangeDecisionDialog;
		if (!oDialog) {
			oDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeDecision", this.getView().getId());
			this.getView().addDependent(oDialog);
			this._oChangeDecisionDialog = oDialog;
		}
		return oDialog;
	};

	ChangeDecisionMixin.onChangeDecisionDialogCancel = function() {
		var oDialog = this._getChangeDecisionDialog();

		oDialog.close();
		this.resetClientMessages();
		var oDecisionModel = oDialog.getModel("decision");
		oDecisionModel.setData(null);
		this._oChangeDecisionDialog.destroy();
		this._oChangeDecisionDialog = undefined;
	};
	ChangeDecisionMixin.onChangeDecisionSuggestionUserSelected = function(oEvent) {
		var oDialog = this._getChangeDecisionDialog();
		var oDecisionModel = oDialog.getModel("decision");
		this.resetClientMessages();
		var oItem = oEvent.getParameters().selectedItem;
		if (oItem) {
			var iId = parseInt(oItem.getProperty("key"), 10);
			oDecisionModel.setProperty("/DECIDER_ID", iId);
		} else {
			var oUser = Configuration.getCurrentUser();
			oDecisionModel.setProperty("/DECIDER_ID", oUser.USER_ID);
		}
	};
	ChangeDecisionMixin.onChangeDecisionSuggestUser = function(oEvent) {
		var sValue = oEvent.getParameter("suggestValue");
		var oTemplate = new ListItem({
			text: "{data>NAME}",
			additionalText: "{data>USER_NAME}",
			key: "{data>ID}"
		});
		oEvent.getSource().bindAggregation("suggestionItems", {
			path: "data>/SearchIdentity(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results",
			template: oTemplate,
			parameters: {
				select: "searchToken,ID,NAME,USER_NAME"
			}
		});
	};
	ChangeDecisionMixin.onChangeDecisionDialogOK = function() {
		var oDialog = this._getChangeDecisionDialog();
		var oDecisionModel = oDialog.getModel("decision");
		var oIdea = this.getObjectModel();
		var oActionRequest;
		var that = this;
		if (oDecisionModel.getProperty("/SEND_RESPONSE") === 0) {
			oDecisionModel.setProperty("/RESPONSE", "");
		}
		oDialog.setBusy(true);
		if (!that.hasAnyClientErrorMessages()) {
			oActionRequest = Idea.changeDecision(oIdea.getProperty("/ID"), oDecisionModel.getData());
		}

		if (oActionRequest) {
			oActionRequest.fail(function(o) {
				if (o.MESSAGES && o.MESSAGES.length > 0) {
					MessageToast.show(that.getText(o.MESSAGES[0].MESSAGE_TEXT));
				}
				oDialog.setBusy(false);
				//MessageToast.show(that.getText("OBJECT_MSG_STATUS_CHANGE_FAILED"));
			});
			oActionRequest.done(function() {
				var oDatamodel = that.getModel("data");
				oDatamodel.read("/IdeaDecision(" + oDecisionModel.getProperty("/ID") + ")", {
					success: function(result) {
						oDialog.setBusy(false);
						oDialog.close();
						MessageToast.show(that.getText("OBJECT_MSG_DECISION_CHANGE_SUCCESS"));
						delete result.__metadata;
						oIdea.setProperty("/Decisions/" + oDecisionModel.getProperty("/INDEX"), result);
						oIdea.setProperty("/Decisions/" + oDecisionModel.getProperty("/INDEX") + "/DECISION_DATE", oDecisionModel.getProperty(
							"/DECISION_DATE"));
						that._oChangeDecisionDialog.destroy();
						that._oChangeDecisionDialog = undefined;
					}
				});
			});
// 			oActionRequest.always(function() {
// 				oDialog.setBusy(false);
// 			});
		} else {
			oDialog.setBusy(false);
		}
	};
	ChangeDecisionMixin.onAddLinkChangeDecisionDialogCancel = function() {
		this.resetClientMessages();
		this._oLinkDialog.close();
		this._oLinkDialog.destroy();
		this._oLinkDialog = undefined;
	};

	ChangeDecisionMixin.onAddLinkChangeDecision = function() {
		var oDialog = this.getLinkChangeDecisionDialog();
		oDialog.setModel(new JSONModel({
			URL: "",
			LABEL: ""
		}), "link");
		oDialog.bindElement({
			path: "link>/"
		});

		this.resetClientMessages();
		oDialog.open();
	};

	ChangeDecisionMixin.onAddLinkChangeDecisionDialogOK = function() {
		var oDialog = this.getLinkChangeDecisionDialog();
		var oModel = oDialog.getModel("link");

		var sURL = oModel.getProperty("/URL");
		var sLabel = oModel.getProperty("/LABEL");

		this.resetClientMessages();
		var oMessage = this.addLinkChangeDecision(sURL, sLabel);
		if (oMessage) {
			this.setClientMessage(oMessage, this.byId("URLChangeDecisionInput"));
		} else {
			this._oLinkDialog.close();
			this._oLinkDialog.destroy();
			this._oLinkDialog = undefined;
		}
	};

	ChangeDecisionMixin.addLinkChangeDecision = function(sURL, sLabel) {
		/* jshint validthis: true */
		var oMessage;
		var oDecisionModel = this._getChangeDecisionDialog().getModel("decision");

		sURL = sURL.trim();

		if (!sURL || sURL === "") {
			oMessage = new Message({
				code: "IDEA_OBJECT_MSG_LINK_URL_NOT_ALLOWED",
				type: MessageType.Error
			});
			return oMessage;
		}

		if (sURL && sURL.indexOf("http://") !== 0 && sURL.indexOf("https://") !== 0 && sURL.indexOf("mailto:") !== 0) {
			sURL = "http://" + sURL;
		}

		if (!sURL || sURL === "" || !jQuery.sap.validateUrl(sURL)) {
			oMessage = new Message({
				code: "IDEA_OBJECT_MSG_LINK_URL_NOT_ALLOWED",
				type: MessageType.Error
			});
			return oMessage;
		}

		if (!sLabel || sLabel === "") {
			sLabel = null;
		}

		oDecisionModel.setProperty("/LINK_LABEL", sLabel);
		oDecisionModel.setProperty("/LINK_URL", sURL);
		this.getLinkButtonChangeDecision().setVisible(false);
	};

	ChangeDecisionMixin.getLinkChangeDecisionDialog = function() {
		if (!this._oLinkDialog) {
			this._oLinkDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeDecisionLink", this.getView().getId());
			this.getView().addDependent(this._oLinkDialog);
			this._oLinkDialog.setInitialFocus(this.createId("URLChangeDecisionInput"));
		}
		return this._oLinkDialog;
	};

	ChangeDecisionMixin.onEditLinkChangeDecision = function() {
		var oDialog = this.getLinkChangeDecisionDialog();
		var oDecisionModel = this._getChangeDecisionDialog().getModel("decision");

		var sURL = oDecisionModel.getProperty("/LINK_URL");
		var sLabel = oDecisionModel.getProperty("/LINK_LABEL");
		oDialog.setModel(new JSONModel({
			URL: sURL,
			LABEL: sLabel
		}), "link");
		oDialog.bindElement({
			path: "link>/"
		});
		oDialog.open();
	};

	ChangeDecisionMixin.onDeleteLinkChangeDecision = function() {
		var oDecisionModel = this._getChangeDecisionDialog().getModel("decision");

		oDecisionModel.setProperty("/LINK_LABEL", "");
		oDecisionModel.setProperty("/LINK_URL", "");
		this.getLinkButtonChangeDecision().setVisible(true);
	};

	ChangeDecisionMixin.getLinkButtonChangeDecision = function() {
		return this.byId("addLinkChangeDecision");
	};

	ChangeDecisionMixin.initLinkButtonChangeDecision = function() {
		this.byId("addLinkChangeDecision").setVisible(true);
	};
	ChangeDecisionMixin.onShowChangeDecisionMailPreview = function(oEvent) {
		var oDialog = this._getChangeDecisionDialog();
		var oDecisionModel = oDialog.getModel("decision");
		var sText = oDecisionModel.getProperty("/RESPONSE");
		var sUserLang = navigator.language || navigator.userLanguage;
		var oParams = {
			CONTENT: jQuery.sap.encodeHTML(sText || ""),
			IDEA: oDecisionModel.getProperty("/IDEA_ID"),
			ACTOR: oDecisionModel.getProperty("/DECIDER_ID"),
			LOCALE: sUserLang.split("-")[0],
			ACTION: oDecisionModel.getProperty("/STATUS_ACTION_CODE"),
			PHASE: oDecisionModel.getProperty("/PHASE_CODE"),
			STATUS: oDecisionModel.getProperty("/STATUS_CODE"),
			TEXT_CODE: oDecisionModel.getProperty("/TEXT_MODULE_CODE"),
			REASON: jQuery.sap.encodeHTML(oDecisionModel.getProperty("/REASON") || ""),
			REASON_CODE: oDecisionModel.getProperty("/REASON_CODE"),
			LINK_LABEL: oDecisionModel.getProperty("/LINK_LABEL"),
			LINK_URL: oDecisionModel.getProperty("/LINK_URL")
		};
		var oModel = new JSONModel(Configuration.getMailPreviewURL(oParams));
		if (!this._oChangeDecisionMailPreviewDialog) {
			this._oChangeDecisionMailPreviewDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeDecisionMailPreviewDialog");
			this.getView().addDependent(this._oChangeDecisionMailPreviewDialog);
		}
		oModel.attachRequestCompleted(this.onMailTextLoad, this);
	};

	ChangeDecisionMixin.onMailTextLoad = function(oEvent) {
		var oHTML = new IFrame({
			content: oEvent.getSource().getData().TEXT
		});
		this._oChangeDecisionMailPreviewDialog.addContent(oHTML);
		this._oChangeDecisionMailPreviewDialog.open();
	};

	ChangeDecisionMixin.onChangeDecisionMailViewClose = function() {
		if (this._oChangeDecisionMailPreviewDialog) {
			this._oChangeDecisionMailPreviewDialog.close();
			this._oChangeDecisionMailPreviewDialog.removeAllContent();
		}
	};

	ChangeDecisionMixin.onChangeDecisionMakerChange = function(oEvent) {
		var oSource = oEvent.getSource();
		var sValue = oSource.getValue();
		var that = this,
			iId;
		var oStatusModel = typeof this.getChangeStatusDialog === "function" ? this.getChangeStatusDialog().getModel("status") : undefined;
		var oDecisionModel = this._getChangeDecisionDialog().getModel("decision");
		var aSuggestItems = oSource.getAggregation("suggestionItems");
		if (aSuggestItems) {
			for (var i = 0; i < aSuggestItems.length; i++) {
				if (sValue === aSuggestItems[i].getText()) {
					iId = parseInt(aSuggestItems[i].getProperty("key"), 10);
				} else if (sValue === aSuggestItems[i].getAdditionalText()) {
					iId = parseInt(aSuggestItems[i].getProperty("key"), 10);
				}
				if (iId) {
					if (oStatusModel) {
						oStatusModel.setProperty("/DECIDER_ID", iId);
					}
					if (oDecisionModel) {
						oDecisionModel.setProperty("/DECIDER_ID", iId);
					}
					break;
				}
			}
		}

		if (!iId) {
			that.resetClientMessages();
			that.setClientMessage(
				new Message({
					code: "IDEA_OBJECT_MSG_DECISION_MAKER_VALUE_WRONG_INPUT",
					type: MessageType.Error
				}),
				oSource);
		} else {
			that.resetClientMessages();
		}

	};
	return ChangeDecisionMixin;
});