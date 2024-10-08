sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/Idea"
], function(BaseActionMixin,
	BaseObjectController,
	JSONModel,
	MessageToast,
	Filter,
	FilterOperator,
	MessageBox,
	Configuration) {
	"use strict";

	var ChangeAuthorActionMixin = jQuery.extend({}, BaseActionMixin);

	var fnChangeAuthor = function(oReqBody) {
		if (this._oChangeAuthorConfirmDialog && this._oChangeAuthorConfirmDialog.isOpen()) {
			this._oChangeAuthorConfirmDialog.close();
		}
		var that = this;
		BaseObjectController.prototype.executeObjectAction.call(this, "changeAuthorStatic", {
			messages: {
				success: function() {
					if (typeof that.getObjectModel === "function") {
						that.setBusy(true);
						that.getObjectModel().sync();
						that.getObjectModel().getDataInitializedPromise().always(function() {
							that.setBusy(false);
						});
					} else if (typeof that.bindList === "function") {
						that.bindList();
					}
					MessageToast.show(that.getText("OBJECT_MSG_AUTHOR_CHANGE_SUCCESS"), {
						autoClose: false
					});
				},
				error: function(oResp) {
					if (oResp.MESSAGES && oResp.MESSAGES.length > 0) {
						MessageToast.show(that.getText(oResp.MESSAGES[0].MESSAGE_TEXT,oResp.MESSAGES[0].PARAMETERS), {
							autoClose: false
						});
					}
				}
			},
			staticparameters: oReqBody,
			objectModelExt: jQuery.sap.getObject("sap.ino.commons.models.object.Idea", 0)
		});
	};

	var fnGetTargetIdeasIDs = function() {
		if (typeof this.getObjectModel === "function") {
			return [this.getObjectModel().getProperty("/ID")];
		} else {
			return Object.keys(this._oSelectionMap);
		}
	};

	var fnGetTargetIdeasAuthor = function() {
		var oIdea;
		if (typeof this.getObjectModel === "function") {
			oIdea = this.getObjectModel().getData();
			return {
				"ID": oIdea.CREATED_BY_ID,
				"NAME": oIdea.CREATED_BY_NAME
			};
		} else {
			oIdea = this._oSelectionMap[Object.keys(this._oSelectionMap)[0]];
			return {
				"ID": oIdea.SUBMITTER_ID,
				"NAME": oIdea.SUBMITTER_NAME
			};
		}
	};

	var fnGetTargetCampaignIDs = function() {
		if (typeof this.getObjectModel === "function") {
			return [this.getObjectModel().getProperty("/CAMPAIGN_ID")];
		} else {
			var aCampaingIDs = [];
			Object.keys(this._oSelectionMap).forEach(function(sKey) {
				if (aCampaingIDs.indexOf(this._oSelectionMap[sKey].CAMPAIGN_ID) > -1) {
					return;
				}
				aCampaingIDs.push(this._oSelectionMap[sKey].CAMPAIGN_ID);
			}.bind(this));
			return aCampaingIDs;
		}
	};

	ChangeAuthorActionMixin.onChangeAuthorSearch = function(oEvent) {
		this.bindAuthors(oEvent.getSource(), oEvent.getParameter("value"));
	};

	ChangeAuthorActionMixin.onChangeAuthor = function() {
		var oDialog = this.getChangeAuthorDialog();
		this.bindAuthors(oDialog);
		oDialog.open();
	};

	ChangeAuthorActionMixin.onMassChangeAuthor = function(oEvent) {
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
					// call change author action
					that._massChangeAuthor();
				},
				error: function(res) {
					MessageToast.show(that.getText(res.responseJSON.messageKey));
				}
			});
		} else {
			// call change author action
			this._massChangeAuthor();
		}
	};

	ChangeAuthorActionMixin._massChangeAuthor = function() {
		var oDialog = this.getMassChangeAuthorDialog();
		this.bindAuthors(oDialog);
		oDialog.open();
	};

	ChangeAuthorActionMixin.onChangeAuthorConfirm = function() {
		var oConfirmData = this._oChangeAuthorConfirmDialog.getModel("confirm").getData();
		var oOldAuthor = fnGetTargetIdeasAuthor.call(this);
		var aIdeaIDs = fnGetTargetIdeasIDs.call(this);
		var oReqBody = {
			"ORIGIN_AUTHOR_ID": oOldAuthor.ID,
			"AUTHOR_ID": oConfirmData.newAuthorID,
			"Reward": oConfirmData.changeReward || false,
			"Selfevaluation": oConfirmData.changeEval || false,
			"keys": aIdeaIDs
		};
		fnChangeAuthor.call(this, oReqBody);
	};

	ChangeAuthorActionMixin.onChangeRewardAndEvluYes = function() {
		var oConfirmData = this._oChangeAuthorConfirmDialog.getModel("confirm").getData();
		var oOldAuthor = fnGetTargetIdeasAuthor.call(this);
		var aIdeaIDs = fnGetTargetIdeasIDs.call(this);
		var oReqBody = {
			"ORIGIN_AUTHOR_ID": oOldAuthor.ID,
			"AUTHOR_ID": oConfirmData.newAuthorID,
			"Reward": oConfirmData.REWARDCOUNT > 0,
			"Selfevaluation": oConfirmData.SELFEVALUATIONCOUNT > 0,
			"keys": aIdeaIDs
		};
		fnChangeAuthor.call(this, oReqBody);
	};

	ChangeAuthorActionMixin.onChangeRewardAndEvaluNO = function() {
		var oConfirmData = this._oChangeAuthorConfirmDialog.getModel("confirm").getData();
		var oOldAuthor = fnGetTargetIdeasAuthor.call(this);
		var aIdeaIDs = fnGetTargetIdeasIDs.call(this);
		var oReqBody = {
			"ORIGIN_AUTHOR_ID": oOldAuthor.ID,
			"AUTHOR_ID": oConfirmData.newAuthorID,
			"Reward": false,
			"Selfevaluation": false,
			"keys": aIdeaIDs
		};
		fnChangeAuthor.call(this, oReqBody);
	};

	ChangeAuthorActionMixin.getChangeAuthorDialog = function() {
		if (!this._oChangeAuthorDialog) {
			var _enhanceDialog = function(oSelectDialog) {
				oSelectDialog._oList.setMode("SingleSelectLeft");
				// remove default handler for single row selection change
				oSelectDialog._oList.mEventRegistry.selectionChange = [];
				//oSelectDialog._oDialog.setBeginButton(oSelectDialog._getOkButton());
				oSelectDialog._oDialog.setEndButton(oSelectDialog._getCancelButton());
			};
			this._oChangeAuthorDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeAuthor");
			this._oChangeAuthorDialog.attachConfirm(this.onChangeAuthorDialogOK, this);
			this.getView().addDependent(this._oChangeAuthorDialog);
			_enhanceDialog(this._oChangeAuthorDialog);
		}
		return this._oChangeAuthorDialog;
	};

	ChangeAuthorActionMixin.getMassChangeAuthorDialog = function() {
		if (!this._oChangeAuthorDialog) {
			var _enhanceDialog = function(oSelectDialog) {
				oSelectDialog._oList.setMode("SingleSelectLeft");
				// remove default handler for single row selection change
				oSelectDialog._oList.mEventRegistry.selectionChange = [];
				//oSelectDialog._oDialog.setBeginButton(oSelectDialog._getOkButton());
				oSelectDialog._oDialog.setEndButton(oSelectDialog._getCancelButton());
			};
			this._oChangeAuthorDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeAuthor");
			this._oChangeAuthorDialog.attachConfirm(this.onMassChangeAuthorDialogOK, this);
			this._oChangeAuthorDialog.data("context", "mass");
			this.getView().addDependent(this._oChangeAuthorDialog);
			_enhanceDialog(this._oChangeAuthorDialog);
		}
		return this._oChangeAuthorDialog;
	};

	ChangeAuthorActionMixin.getChangeAuthorConfirmDialog = function() {
		if (!this._oChangeAuthorConfirmDialog) {
			this._oChangeAuthorConfirmDialog = this.createFragment("sap.ino.vc.idea.fragments.ChangeAuthorConfirm");
			this.getView().addDependent(this._oChangeAuthorConfirmDialog);
		}
		return this._oChangeAuthorConfirmDialog;
	};

	ChangeAuthorActionMixin.onChangeAuthorDialogOK = function(oEvent) {
		// check rewards and self evalution
		var sIdeaID = this.getObjectModel().getProperty("/ID");
		var oSelectItem = oEvent.getParameter("selectedItem");
		if (!oSelectItem) {
			return;
		}
		var oChangedSAuthor = oSelectItem.getBindingContext("data").getObject();
		var that = this;
		this.getView().setBusy(true);
		this.getModel("data").read('/IdeaFull(' + sIdeaID + ')/RewardSelfevaluationCount', {
			async: true,
			success: function(oData) {
				oData.SELFEVALUATIONCOUNT = parseInt(oData.SELFEVALUATIONCOUNT, 10);
				oData.REWARDCOUNT = parseInt(oData.REWARDCOUNT, 10);
				if (oData.SELFEVALUATIONCOUNT > 0 || oData.REWARDCOUNT > 0) {
					that.getView().setBusy(false);
					var oChangeAuthorConfirmDialog = that.getChangeAuthorConfirmDialog();
					oChangeAuthorConfirmDialog.setModel(new JSONModel({
						REWARDCOUNT: oData.REWARDCOUNT,
						SELFEVALUATIONCOUNT: oData.SELFEVALUATIONCOUNT,
						oldAuthor: that.getObjectModel().getProperty("/CREATED_BY_NAME"),
						newAuthor: oChangedSAuthor.NAME,
						newAuthorID: oChangedSAuthor.ID
					}), "confirm");
					oChangeAuthorConfirmDialog.open();
				} else {
					var oIdea = that.getObjectModel();
					var oReqBody = {
						"ORIGIN_AUTHOR_ID": oIdea.getProperty("/CREATED_BY_ID"),
						"AUTHOR_ID": oChangedSAuthor.ID,
						"Reward": false,
						"Selfevaluation": false,
						"keys": [oIdea.getProperty("/ID")]
					};
					fnChangeAuthor.call(that, oReqBody);
				}
			}
		});
	};

	ChangeAuthorActionMixin.onMassChangeAuthorDialogOK = function(oEvent) {
		// check rewards and self evalution
		var oSelectItem = oEvent.getParameter("selectedItem");
		if (!oSelectItem) {
			return;
		}
		var oChangedSAuthor = oSelectItem.getBindingContext("data").getObject();
		var oOldAuthor = fnGetTargetIdeasAuthor.call(this);
		var that = this;
		var aFilters = Object.keys(this._oSelectionMap).map(function(sIdeaID) {
			return new Filter({
				path: "ID",
				operator: FilterOperator.EQ,
				value1: sIdeaID
			});
		});
		var _processCountData = function(oData) {
			var iRewardCnt = 0,
				iSelfeEvalCnt = 0;
			oData.some(function(data) {
				if (data.REWARDCOUNT > 0) {
					iRewardCnt = 1;
				}
				if (data.SELFEVALUATIONCOUNT > 0) {
					iSelfeEvalCnt = 1;
				}
				if (iRewardCnt === 1 && iSelfeEvalCnt === 1) {
					return true;
				} else {
					return false;
				}
			});
			return {
				"REWARDCOUNT": iRewardCnt,
				"SELFEVALUATIONCOUNT": iSelfeEvalCnt
			};
		};
		this.getView().setBusy(true);
		this.getModel("data").read('/IdeaRewardSelfevaluationCount', {
			async: true,
			filters: aFilters,
			success: function(oData) {
				var oProcessData = _processCountData(oData.results);
				// oData.SELFEVALUATIONCOUNT = parseInt(oData.SELFEVALUATIONCOUNT, 10);
				// oData.REWARDCOUNT = parseInt(oData.REWARDCOUNT, 10);
				if (oProcessData.SELFEVALUATIONCOUNT > 0 || oProcessData.REWARDCOUNT > 0) {
					that.getView().setBusy(false);
					var oChangeAuthorConfirmDialog = that.getChangeAuthorConfirmDialog();
					oChangeAuthorConfirmDialog.data("context", "mass");
					oChangeAuthorConfirmDialog.setModel(new JSONModel({
						REWARDCOUNT: oProcessData.REWARDCOUNT,
						SELFEVALUATIONCOUNT: oProcessData.SELFEVALUATIONCOUNT,
						oldAuthor: oOldAuthor.NAME,
						newAuthor: oChangedSAuthor.NAME,
						newAuthorID: oChangedSAuthor.ID
					}), "confirm");
					oChangeAuthorConfirmDialog.open();
				} else {
					var oReqBody = {
						"ORIGIN_AUTHOR_ID": oOldAuthor.ID,
						"AUTHOR_ID": oChangedSAuthor.ID,
						"Reward": false,
						"Selfevaluation": false,
						"keys": Object.keys(that._oSelectionMap)
					};
					fnChangeAuthor.call(that, oReqBody);
				}
			}
		});
	};

	ChangeAuthorActionMixin.bindAuthors = function(oDialog, sSearchTerm) {
		var sCampaignIDs = fnGetTargetCampaignIDs.call(this).join(",");
		sSearchTerm = sSearchTerm ? jQuery.sap.encodeURL(sSearchTerm) : "*";
		if (!/.*[\u4e00-\u9fa5]+.*$/.test(sSearchTerm) && sSearchTerm.length < 3) {
			oDialog.removeAllItems();
			return;
		}
		var oOptions = {
			path: "data>/SearchCampaignParticipantsParams(searchToken='" + sSearchTerm + "',campaignIdsToken='" + sCampaignIDs + "')/Results",
			template: oDialog.getBindingInfo("items").template
		};
		var sOldAuthorID;
		if (oDialog.data("context") === "mass") {
			sOldAuthorID = fnGetTargetIdeasAuthor.call(this).ID;
		} else {
			sOldAuthorID = this.getObjectModel().getProperty("/CREATED_BY_ID");
		}
		oOptions.filters = [new Filter({
			path: "ID",
			operator: FilterOperator.NE,
			value1: sOldAuthorID
		})];
		oDialog.bindAggregation("items", oOptions);
	};

	ChangeAuthorActionMixin.handleAuthorSelect = function(oEvent) {
		var oChangeAuthorModel = this.getChangeAuthorDialog().getModel("changedAuthor");
		var oSelItem = oEvent.getParameter("selectedItem");
		oChangeAuthorModel.setProperty("/ID", oSelItem.getKey());
		oChangeAuthorModel.setProperty("/NAME", oSelItem.getText());
	};

	return ChangeAuthorActionMixin;
});