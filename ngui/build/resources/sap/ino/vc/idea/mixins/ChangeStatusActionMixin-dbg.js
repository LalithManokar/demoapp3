sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/models/types/IntBooleanType",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/m/MessageToast",
    "sap/ino/controls/IFrame",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/ListItem",
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/m/MessageBox"
], function(BaseActionMixin, JSONModel, Idea, PropertyModel, IntBooleanType, Message, MessageType, MessageToast, IFrame, Configuration,
	ListItem, ObjectFormatter, MessageBox) {
	"use strict";

	/**
	 * Mixin that handles changing Idea status in Idea Display and Idea List
	 * @mixin
	 */
	var ChangeStatusActionMixin = jQuery.extend({}, BaseActionMixin);

	ChangeStatusActionMixin.ChangeStatusMixinData = {
		// for mass actions
		aIdeaIds: [],
		iIdeaId: null,
		oPropertyModel: undefined
	};

	ChangeStatusActionMixin.reasonCodeExist = function(sReasonListCode) {
		return (sReasonListCode && sReasonListCode !== '' ? true : false);
	};

	ChangeStatusActionMixin.formatter = ObjectFormatter;

	ChangeStatusActionMixin.onChangeStatus = function(oEvent) {
		// action is triggered from idea detail
		var oDialog = this.getChangeStatusDialog();
		oDialog.data("context", "single");
		var oIdea = this.getObjectModel();
		this.ChangeStatusMixinData.iIdeaId = oIdea.getProperty("/ID");
		this.ChangeStatusMixinData.bIdeaPhaseNeedReward = oIdea.getProperty("/IDEA_PHASE_NEED_REWARD");
		this.ChangeStatusMixinData.bHasIncompletedEvalReq = oIdea.getProperty("/IDEA_HAS_INCOMPLETED_EVAL_REQ");
		this.ChangeStatusMixinData.bRewardDismissed = oIdea.getProperty("/REWARD_DISMISSED");
		this.ChangeStatusMixinData.oPropertyModel = oIdea.getPropertyModel();
		var sInitStatusAction = this.ChangeStatusMixinData.oPropertyModel.getProperty(
			"/actions/executeStatusTransition/customProperties/statusTransitions/0/STATUS_ACTION_CODE");
		this.bindStatusModel(sInitStatusAction);
		this.initLinkButton();
		oDialog.open();
	};

	ChangeStatusActionMixin.onChangeStatusInList = function(oEvent) {

		this.saveCurrentFocusBeforeActionDialogOpen();

		// action is triggered from idea list
		var oSource = oEvent.getSource();
		var oDialog = this.getChangeStatusDialog();
		oDialog.data("context", "single");
		this.ChangeStatusMixinData.iIdeaId = oSource.getBindingContext("data").getProperty("ID");
		this.ChangeStatusMixinData.iCampaignId = oSource.getBindingContext("data").getProperty("CAMPAIGN_ID");
		this.ChangeStatusMixinData.sPhase = oSource.getBindingContext("data").getProperty("PHASE");
		this.ChangeStatusMixinData.bIdeaPhaseNeedReward = oSource.getBindingContext("data").getProperty("IDEA_PHASE_NEED_REWARD");
		this.ChangeStatusMixinData.bHasIncompletedEvalReq = oSource.getBindingContext("data").getProperty("IDEA_HAS_INCOMPLETED_EVAL_REQ");
		this.ChangeStatusMixinData.bRewardDismissed = oSource.getBindingContext("data").getProperty("REWARD_DISMISSED");
		var oSettings = {
			actions: ["executeStatusTransition"]
		};
		this.ChangeStatusMixinData.oPropertyModel = new PropertyModel("sap.ino.xs.object.idea.Idea", this.ChangeStatusMixinData.iIdeaId,
			oSettings, false, function() {
				var sInitStatusAction = this.ChangeStatusMixinData.oPropertyModel.getProperty(
					"/actions/executeStatusTransition/customProperties/statusTransitions/0/STATUS_ACTION_CODE");
				this.bindStatusModel(sInitStatusAction);
				oDialog.open();
			}.bind(this, arguments));
	};

	/**
	 * mass action on change status
	 *
	 */
	ChangeStatusActionMixin.onMassChangeStatus = function(oEvent) {
		// if it's a select all mass action
		if (this.getViewProperty("/List/SELECT_ALL")) {
			var oBindingParams = this.getBindingParameter();
			var bIsManaged = this._check4ManagingList();
			var sFilterParams = this.getList().getBinding('items').sFilterParams;
			var aTags = this.getViewProperty("/List/TAGS");
			var tagGroup = {};
			var tagGroupKey = [];
			aTags.forEach(function(item, index) {
				if (!tagGroup[item.ROOTGROUPID]) {
					tagGroup[item.ROOTGROUPID] = [];
					tagGroup[item.ROOTGROUPID].push(item.ID);
					tagGroupKey.push(item.ROOTGROUPID);
				} else {
					tagGroup[item.ROOTGROUPID].push(item.ID);
				}
			});

			var oParameter = {
				searchToken: oBindingParams.SearchTerm || "",
				tagsToken: tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
				tagsToken1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
				tagsToken2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
				tagsToken3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
				tagsToken4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
				filterName: oBindingParams.VariantFilter || "",
				filterBackoffice: bIsManaged ? "1" : "0",
				filterString: sFilterParams || ""
			};
			if (this.setQueryObjectIdeaformFilters) {
				this.setQueryObjectIdeaformFilters(oParameter);
			}
			if (this.getCampaignFormQuery) {
				oParameter.ideaFormId = this.getCampaignFormQuery() || "";
			}
			if(this.getSearchType){
			    oParameter.searchType = this.getSearchType();
			}
			if (this.setQueryObjectCompanyViewFilters) {
				this.setQueryObjectCompanyViewFilters(oParameter);
			}
			// call back end service
			var that = this;
			var oObjEvt = jQuery.extend({}, oEvent);
			var oSource = oEvent.getSource();
			// disable button
			oSource.setEnabled(false);
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/select_all_ideas.xsjs",
				data: oParameter,
				success: function(res) {
					// enable button
					oSource.setEnabled(true);
					if (res.Ideas.length === 0) {
						MessageBox.show(that.getText("NO_IDEAS_AND_RELOAD_PAGE"), {
							icon: MessageBox.Icon.INFORMATION,
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function() {
								that.bindList();
							}
						});
						return;
					}
					// clear selection map
					that._oSelectionMap = {};
					jQuery.each(res.Ideas, function(iIdx, oData) {
						if (!that._oDeselectionMap[oData.ID]) {
							// create data structure as property model
							oData.property = that._createPropertyData(oData);
							that._oSelectionMap[oData.ID] = oData;
						}
					});
					// call general assign action
					that._onMassChangeStatus(oObjEvt);
				},
				error: function(res) {
					MessageToast.show(that.getText(res.responseJSON.messageKey));
				}
			});
		} else {
			// general assign action
			this._onMassChangeStatus(oEvent);
		}
	};

	/*
	 * event when change status is executed as mass action
	 *
	 * Prerequisite is that all selected ideas belong to the same campaign and are in the same phase and status.
	 *
	 * @param {Event}   oEvent      Event parameter
	 */
	ChangeStatusActionMixin._onMassChangeStatus = function(oEvent) {
		var oDialog = this.getChangeStatusDialog();
		oDialog.data("context", "mass");
		this.ChangeStatusMixinData.aIdeaIds = jQuery.map(this._oSelectionMap, function(oIdea) {
			return oIdea.ID;
		});
		// as all ideas have same status, we only take the first idea for displaying the dialog
		this.ChangeStatusMixinData.iIdeaId = this.ChangeStatusMixinData.aIdeaIds[0];
		var oSettings = {
			actions: ["executeStatusTransition"]
		};
		this.ChangeStatusMixinData.oPropertyModel = new PropertyModel("sap.ino.xs.object.idea.Idea", this.ChangeStatusMixinData.iIdeaId,
			oSettings, false, function() {
				var sInitStatusAction = this.ChangeStatusMixinData.oPropertyModel.getProperty(
					"/actions/executeStatusTransition/customProperties/statusTransitions/0/STATUS_ACTION_CODE");
				this.bindStatusModel(sInitStatusAction);
				oDialog.open();
			}.bind(this, arguments));
	};

	ChangeStatusActionMixin.bindStatusModel = function(sStatusAction) {
		var oStatusModel = Idea.executeStatusTransitionModel(this.ChangeStatusMixinData.oPropertyModel, sStatusAction);
		var oDialog = this.getChangeStatusDialog();
		oDialog.setModel(this.ChangeStatusMixinData.oPropertyModel, "property");
		oDialog.setModel(oStatusModel, "status");
		return oStatusModel;
	};

	/*
        check if reward objects already exist, plus reward feature is disabled in next phase
    */
	ChangeStatusActionMixin.isIdeaPhaseNeedReward = function() {
		var oDialog = this.getChangeStatusDialog();
		var oStatusModel = oDialog.getModel("status");
		if (this.ChangeStatusMixinData.bIdeaPhaseNeedReward && oStatusModel.getProperty("/REWARD_ACTIVE") && !this.ChangeStatusMixinData.bRewardDismissed) {
			return true;
		}
		return false;
	};

	/*
        check if incomplete evaluation request item objects already exist
    */
	ChangeStatusActionMixin.isIdeaHasEvalReq = function() {
		if (this.ChangeStatusMixinData.bHasIncompletedEvalReq && Configuration.getSystemSetting("sap.ino.config.EVAL_REQ_ACTIVE")) {
			return true;
		}
		return false;
	};

	ChangeStatusActionMixin.getChangeStatusDialog = function() {
		if (!this._oChangeStatusDialog) {
			this._oChangeStatusDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeStatus");
			this.getView().addDependent(this._oChangeStatusDialog);
		}
		return this._oChangeStatusDialog;
	};

	ChangeStatusActionMixin.onChangeStatusSuggestUser = function(oEvent) {
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

	ChangeStatusActionMixin.onStatusActionChanged = function(oEvent) {
		var sStatusAction = oEvent.getSource().getSelectedKey();
		this.resetClientMessages();
		this.clearClientMessages();
		this.initLinkButton();
		this.bindStatusModel(sStatusAction);
	};

	ChangeStatusActionMixin.onChangeStatusDialogOK = function(oEvent) {
		var oDialog = this.getChangeStatusDialog();
		var oStatusModel = oDialog.getModel("status");
		var statusData = oStatusModel.getData('data');
		var that = this;
		var oActionRequest;

		// 		if(!statusData.REASON_CODE && statusData.reasonList && statusData.reasonList[0]){
		// 		    oStatusModel.setProperty('/REASON_CODE', statusData.reasonList[0].CODE);
		// 		}

		function fnOK() {
			oDialog.setBusy(true);
			if (oDialog.data("context") === "mass") {
				if (!that.hasAnyClientErrorMessages()) {
					oActionRequest = Idea.massExecuteStatusTransition(jQuery.extend({}, oStatusModel.getData(), {
						keys: that.ChangeStatusMixinData.aIdeaIds
					}));
				}
			} else {
				if (that.isActionContextSingleIdeaDisplay()) {
					// action is triggered from idea detail
					var oIdea = that.getObjectModel();
					if (!that.hasAnyClientErrorMessages()) {
						oActionRequest = oIdea.executeStatusTransition(oStatusModel.getData(), true);
					}
				} else {
					// action is triggered from idea list
					if (!that.hasAnyClientErrorMessages()) {
						oActionRequest = Idea.executeStatusTransition(that.ChangeStatusMixinData.iIdeaId, oStatusModel.getData());
					}
				}
			}
			if (oActionRequest) {
				oActionRequest.fail(function(o) {
					if (o.MESSAGES && o.MESSAGES.length > 0) {
						MessageToast.show(that.getText(o.MESSAGES[0].MESSAGE_TEXT));
					}
					//MessageToast.show(that.getText("OBJECT_MSG_STATUS_CHANGE_FAILED"));
				});
				oActionRequest.done(function() {
					that.restoreFocusAfterActionDialogClose();
					if (typeof that.bindList === "function") {
						that.bindList();
					}

					oDialog.close();
					MessageToast.show(that.getText("OBJECT_MSG_STATUS_CHANGE_SUCCESS"));
					that._oChangeStatusDialog.destroy();
					that._oChangeStatusDialog = undefined;
				});
				oActionRequest.always(function() {
					oDialog.setBusy(false);
				});
			} else {
				oDialog.setBusy(false);
			}
		}

		var bIsIdeaPhaseNeedReward = this.isIdeaPhaseNeedReward();
		var bIsIdeaHasEvalReq = this.isIdeaHasEvalReq();
		var sConfirmText;
		if (bIsIdeaPhaseNeedReward && bIsIdeaHasEvalReq) {
			sConfirmText = this.getText("OBJECT_MSG_STATUS_CHANGE_DOUBLE_CONFIRMATION");
		} else if (bIsIdeaPhaseNeedReward) {
			sConfirmText = this.getText("OBJECT_MSG_STATUS_CHANGE_CONFIRMATION");
		} else if (bIsIdeaHasEvalReq) {
			sConfirmText = this.getText("OBJECT_MSG_STATUS_CHANGE_EVAL_CONFIRMATION");
		}

		if ((bIsIdeaPhaseNeedReward || bIsIdeaHasEvalReq) &&
			statusData.STATUS_ACTION_CODE === "sap.ino.config.START_NEXT_PHASE") {
			MessageBox.confirm(sConfirmText, {
				title: this.getText("IDEA_OBJECT_TIT_STATUS_CHANGE_CONFIRMATION"),
				icon: MessageBox.Icon.NONE,
				onClose: function(bResult) {
					if (bResult === "OK") {
						fnOK();
					} else {
						that.onChangeStatusDialogCancel();
					}
				}
			});
		} else {
			fnOK();
		}
	};

	ChangeStatusActionMixin.onChangeStatusDialogCancel = function(oEvent) {
		var oDialog = this.getChangeStatusDialog();
		if (this.resetInputTypeValidations) {
			this.resetInputTypeValidations(oDialog);
		}

		this.restoreFocusAfterActionDialogClose();

		this._oChangeStatusDialog.close();
		this._oChangeStatusDialog.destroy();
		this._oChangeStatusDialog = undefined;

	};

	ChangeStatusActionMixin.onAfterChangeStatusDialogClose = function(oEvent) {
		// the respective closed dialog is always the source of the event
		// 		var oDialog = oEvent.getSource();
		// 		this.resetActionState(oDialog.data("context") === "mass");
	};

	ChangeStatusActionMixin.onShowMailPreview = function(oEvent) {
		var oDialog = this.getChangeStatusDialog();
		var oStatusModel = oDialog.getModel("status");
		//	var reasonList = oStatusModel.getProperty("/reasonList");
		//	var reasonCode = oStatusModel.getProperty("/REASON_CODE");
		// if(!reasonCode && reasonList && reasonList[0]){
		//  oStatusModel.setProperty('/REASON_CODE', reasonList[0].CODE);
		//	}
		var oTextMouduleParams = {
			CAMPAIGN_ID: this.ChangeStatusMixinData.iCampaignId,
			PHASE: this.ChangeStatusMixinData.sPhase,
			STATUS_ACTION_CODE: oStatusModel.getProperty("/STATUS_ACTION_CODE"),
			NEXT_STATUS_CODE: oStatusModel.getProperty("/NEXT_STATUS_CODE")
		};
		var oObjectModel = this.getObjectModel && this.getObjectModel();
		if(oObjectModel){
		    oTextMouduleParams.CAMPAIGN_ID = oObjectModel.getProperty("/CAMPAIGN_ID");
		    oTextMouduleParams.PHASE = oObjectModel.getProperty("/PHASE");
		    oTextMouduleParams.STATUS_CODE = oObjectModel.getProperty("/STATUS_CODE");
		}
		var oTextMoudule = new JSONModel(Configuration.getTextMoudleURL(oTextMouduleParams));
		oTextMoudule.attachRequestCompleted(null ,function(){
			var sText = oStatusModel.getProperty("/RESPONSE");
			var sUserLang = this.getModel("user").getData().data.LOCALE;
			var oParams = {
				CONTENT: jQuery.sap.encodeHTML(sText || ""),
				IDEA: this.ChangeStatusMixinData.iIdeaId,
				DECIDER: oStatusModel.getProperty("/DECIDER_ID"),
				ACTOR:Configuration.getCurrentUser().USER_ID,
				LOCALE: sUserLang,
				ACTION: oStatusModel.getProperty("/STATUS_ACTION_CODE"),
				PHASE: oStatusModel.getProperty("/NEXT_PHASE_CODE"),
				STATUS: oStatusModel.getProperty("/NEXT_STATUS_CODE"),
				TEXT_CODE: !oTextMoudule.getData()[0] ? "null" : oTextMoudule.getData()[0].TEXT_MODULE_CODE,
				REASON: jQuery.sap.encodeHTML(oStatusModel.getProperty("/REASON") || ""),
				REASON_CODE: oStatusModel.getProperty("/REASON_CODE"),
				LINK_LABEL: oStatusModel.getProperty("/LINK_LABEL"),
				LINK_URL: oStatusModel.getProperty("/LINK_URL")
			};
			var oModel = new JSONModel(Configuration.getMailPreviewURL(oParams));
			if (!this._oMailPreviewDialog) {
				this._oMailPreviewDialog = this.createFragment("sap.ino.vc.idea.fragments.MailPreviewDialog");
				this.getView().addDependent(this._oMailPreviewDialog);
			}
			oModel.attachRequestCompleted(this.onMailTextLoaded, this);
		},this);
	};

	ChangeStatusActionMixin.onMailTextLoaded = function(oEvent) {
		var oHTML = new IFrame({
			content: oEvent.getSource().getData().TEXT
		});
		this._oMailPreviewDialog.addContent(oHTML);
		this._oMailPreviewDialog.open();
	};

	ChangeStatusActionMixin.onMailViewClose = function() {
		if (this._oMailPreviewDialog) {
			this._oMailPreviewDialog.close();
			this._oMailPreviewDialog.removeAllContent();
		}
	};

	ChangeStatusActionMixin.onChangeStatusSuggestionUserSelected = function(oEvent) {
		var oDialog = this.getChangeStatusDialog();
		var oStatusModel = oDialog.getModel("status");
	    this.resetClientMessages();
		var oItem = oEvent.getParameters().selectedItem;
		if (oItem) {
			var iId = parseInt(oItem.getProperty("key"), 10);
			oStatusModel.setProperty("/DECIDER_ID", iId);
		} else {
			var oUser = Configuration.getCurrentUser();
			oStatusModel.setProperty("/DECIDER_ID", oUser.USER_ID);
		}
	};

	ChangeStatusActionMixin.onAddLinkDialogCancel = function() {
		this.resetClientMessages();
		this._oLinkDialog.close();
		this._oLinkDialog.destroy();
		this._oLinkDialog = undefined;
	};

	ChangeStatusActionMixin.onAddLink = function() {
		var oDialog = this.getLinkDialog();
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

	ChangeStatusActionMixin.onAddLinkDialogOK = function() {
		var oDialog = this.getLinkDialog();
		var oModel = oDialog.getModel("link");

		var sURL = oModel.getProperty("/URL");
		var sLabel = oModel.getProperty("/LABEL");

		this.resetClientMessages();
		var oMessage = this.addLink(sURL, sLabel);
		if (oMessage) {
			this.setClientMessage(oMessage, this.byId("URLInput"));
		} else {
			this._oLinkDialog.close();
			this._oLinkDialog.destroy();
			this._oLinkDialog = undefined;
		}
	};

	ChangeStatusActionMixin.addLink = function(sURL, sLabel) {
		/* jshint validthis: true */
		var oMessage;
		var oStatusModel = this.getChangeStatusDialog().getModel("status");

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

		oStatusModel.setProperty("/LINK_LABEL", sLabel);
		oStatusModel.setProperty("/LINK_URL", sURL);
		this.getLinkButton().setVisible(false);
	};

	ChangeStatusActionMixin.getLinkDialog = function() {
		if (!this._oLinkDialog) {
			this._oLinkDialog = this.createFragment("sap.ino.vc.idea.fragments.Link", this.getView().getId());
			this.getView().addDependent(this._oLinkDialog);
			this._oLinkDialog.setInitialFocus(this.createId("URLInput"));
		}
		return this._oLinkDialog;
	};

	ChangeStatusActionMixin.onEditLink = function() {
		var oDialog = this.getLinkDialog();
		var oStatusModel = this.getChangeStatusDialog().getModel("status");

		var sURL = oStatusModel.getProperty("/LINK_URL");
		var sLabel = oStatusModel.getProperty("/LINK_LABEL");
		oDialog.setModel(new JSONModel({
			URL: sURL,
			LABEL: sLabel
		}), "link");
		oDialog.bindElement({
			path: "link>/"
		});
		oDialog.open();
	};

	ChangeStatusActionMixin.onDeleteLink = function() {
		var oStatusModel = this.getChangeStatusDialog().getModel("status");

		oStatusModel.setProperty("/LINK_LABEL", "");
		oStatusModel.setProperty("/LINK_URL", "");
		this.getLinkButton().setVisible(true);
	};

	ChangeStatusActionMixin.getLinkButton = function() {
		return this.byId("addLink");
	};

	ChangeStatusActionMixin.initLinkButton = function() {
		this.byId("addLink").setVisible(true);
	};

	ChangeStatusActionMixin.clearClientMessages = function() {
		// clear validation on response
		var oMessageManager = new sap.ui.getCore().getMessageManager();
		//oMessageManager.removeAllMessages();
		var aMessages = oMessageManager.getMessageModel().getData();
		var aTextAreaMessages = [];
		jQuery.each(aMessages, function(index, oMessage) {
			if (oMessage.target.indexOf("responseRequireTextArea") > -1 || oMessage.target.indexOf("responseRequireTextAreaDecision") > -1) {
				aTextAreaMessages.push(oMessage);
			}
		});
		oMessageManager.removeMessages(aTextAreaMessages);
	};
	ChangeStatusActionMixin.onChangeStatusMakerChange = function(oEvent) {
		var oSource = oEvent.getSource();
		var sValue = oSource.getValue();
		var that = this,
			iId;
		var oStatusModel = this.getChangeStatusDialog().getModel("status");
		var oDecisionModel = typeof this._getChangeDecisionDialog === "function" ? this._getChangeDecisionDialog().getModel("decision") : undefined;
		var aSuggestItems = oSource.getAggregation("suggestionItems");
		if(aSuggestItems){
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

	return ChangeStatusActionMixin;
});