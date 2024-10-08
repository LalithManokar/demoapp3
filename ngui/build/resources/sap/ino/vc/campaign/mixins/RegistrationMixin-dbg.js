sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
     "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/Registration",
    "sap/ui/core/IconPool",
    "sap/ui/model/json/JSONModel"
], function(BaseActionMixin, BaseController, PropertyModel, MessageToast, RegistrationService, IconPool, JSONModel) {
	"use strict";

	var RegistrationMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	RegistrationMixin.Register = function(event) {
		var self = this;
		var source = event.getSource();
		var id = source.getBindingContext("data").getProperty("ID");
		var value = source.getBindingContext("data").getProperty("REGISTER_ID");
		var status = source.getBindingContext('data').getProperty('REGISTER_STATUS');
		var isAutoApprove = source.getBindingContext('data').getProperty('IS_REGISTER_AUTO_APPROVE');
		var service, text;

		if (source.setEnabled) {
			source.setEnabled(false);
		}

		if (!value) {
			service = RegistrationService.Register(value, id);
			text = 'REGISTER_MSG_REGISTER';
		} else if (status === 3) {
			service = RegistrationService.Register(null, id);
			text = 'REGISTER_MSG_REGISTER';
		} else {
			service = RegistrationService.Leave(value, id);
			text = 'REGISTER_MSG_LEAVE';
		}

		if (isAutoApprove && isAutoApprove === 1 && text !== 'REGISTER_MSG_LEAVE') {
			text = 'REGISTER_MSG_SUCCESS';
		}

		service.done(function() {
			source.setEnabled(true);
			MessageToast.show(self.getText(text));
			if (isAutoApprove && isAutoApprove === 1 && text !== 'REGISTER_MSG_LEAVE') {
				self.navigateTo('campaignlist');
				self.navigateTo("campaign", {
					id: id
				});

			}
			if (status === 2) {
				PropertyModel.invalidateCachedProperties('sap.ino.xs.object.campaign.Campaign', id);
				return self.navigateTo('campaignlist');
			}
			if (self.isGlobalSearch) {
				self.getSearchResult(self.getViewProperty("/SEARCH_QUERY"));
			}
		}).fail(function() {
			source.setEnabled(true);
			MessageToast.show(self.getText('MSG_CAMPAIGN_REGISTER_ERROR'));
		});

	};

	RegistrationMixin.Approved = function(event) {
		var self = this;
		var source = event.getSource();
		var value = source.getBindingContext("data").getProperty("REGISTER_ID");
		var service = RegistrationService.Approved(value);
		var text = 'REGISTER_MSG_APPROVED';

		if (source.setEnabled) {
			source.setEnabled(false);
		}

		service.done(function() {
			MessageToast.show(self.getText(text));
			source.setEnabled(true);
			self.bindList();

		}).fail(function() {
			MessageToast.show(self.getText('REGISTER_ERROR_MASSAGE'));
		});
	};

	RegistrationMixin.Rejected = function(event) {
		var self = this;
		var source = event.getSource();
		var value = source.getBindingContext("data").getProperty("REGISTER_ID");
		// var service = RegistrationService.Rejected(value);
		var text = 'REGISTER_MSG_REJECTED';

		var oRejectDialog = this.getRejectReasonDialog();
		var oModel = new JSONModel({
			REJECT_REASON: "",
			VALUE: value
		});
		oRejectDialog.setModel(oModel, "register");
		oRejectDialog.open();

		// if(source.setEnabled){
		//     source.setEnabled(false);
		// }

		// service.done(function(){
		//     MessageToast.show(self.getText(text));
		//     source.setEnabled(true);
		//     self.bindList();
		// }).fail(function(){
		//      MessageToast.show( self.getText('REGISTER_ERROR_MASSAGE'));
		// });

	};

	RegistrationMixin.Leave = function(event) {
		var self = this;
		var source = event.getSource();
		var value = source.getBindingContext("data").getProperty("REGISTER_ID");
		var service = RegistrationService.Leave(value);
		var text = 'REGISTER_MSG_LEAVE';

		if (source.setEnabled) {
			source.setEnabled(false);
		}

		service.done(function() {
			MessageToast.show(self.getText(text));
			source.setEnabled(true);
		}).fail(function() {
			MessageToast.show(self.getText('REGISTER_ERROR_MASSAGE'));
		});

	};

	RegistrationMixin.isVisabled = function(id, isopen, status) {
		return (!!id && !!isopen) || (!!id && !isopen && status === 2);
	};

	RegistrationMixin.isVisabledForApprove = function(status) {
		return status === 1;
	};

	RegistrationMixin.isVisabledForList = function(id, isopen, status) {

		return !!id && !!isopen && status !== 2;
	};

	RegistrationMixin.isEnabled = function(status, disabled, setting) {
		if (status !== 1) {
			if (setting === 1) {
				if (disabled === 0) {
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		} else {
			return false;
		}
	};

	RegistrationMixin.onApprovalListSelectionChange = function(oEvent) {
		var that = this;
		var bSelected = oEvent.getParameter("selected");
		var oSource = oEvent.getSource();
		var oData = oSource.getBindingContext("data").getObject();
		if (!this._oSelectionMap) {
			this._oSelectionMap = [];
		}
		if (!this._oSelectedCheckBox) {
			this._oSelectedCheckBox = [];
		}

		function deriveMassActionButtonEnabledStatus(_oSelectionMap) {
			var oBtnAccept = that.byId("sapInoMassRegisterAcceptBtn");
			var oBtnReject = that.byId("sapInoMassRegisterRejectBtn");
			if (oBtnAccept && oBtnReject) {
				oBtnAccept.setEnabled(_oSelectionMap.length > 0);
				oBtnReject.setEnabled(_oSelectionMap.length > 0);
			}
		}
		this.actionButtonEnabledStatus = deriveMassActionButtonEnabledStatus;

		if (bSelected) {
			this._oSelectionMap.push(oData.REGISTER_ID);
			this._oSelectedCheckBox.push(oSource);
		} else {
			var index = this._oSelectionMap.indexOf(oData.REGISTER_ID);
			this._oSelectionMap.splice(index, 1);
		}

		deriveMassActionButtonEnabledStatus(this._oSelectionMap);
	};

	RegistrationMixin.onApprovalMassAction = function(oEvent) {
		var registerIDs = this._oSelectionMap;
		var selectedCheckBox = this._oSelectedCheckBox;
		var self = this;
		var actionbtnStatus = oEvent.getSource().getCustomData();
		var sStatus = actionbtnStatus[0].getValue() * 1 ? "sap.ino.config.REGISTER_APPROVED" : "sap.ino.config.REGISTER_REJECTED";
		var text = actionbtnStatus[0].getValue() * 1 ? "OBJECT_MSG_REG_ACCEPT_SUCCESS" : "OBJECT_MSG_REG_REJECT_SUCCESS";
		var sErrorMsg = actionbtnStatus[0].getValue() * 1 ? "REGISTER_APPROVE_MSG_ERROR" : "REGISTER_REJECT_MSG_ERROR";
		// mass action handling
		var oOptions = {
			parameters: {
				ids: registerIDs,
				status: sStatus
			}
		};

		if (actionbtnStatus[0].getValue() * 1) {
			var massReq = BaseController.prototype.executeObjectAction.call(this, RegistrationService, "massUpdate", oOptions);
			massReq.done(function() {
				MessageToast.show(self.getText(text));
				self.bindList();
				self._oSelectionMap = [];
			}).fail(function() {
				MessageToast.show(self.getText(sErrorMsg));
				for (var i = 0; i < selectedCheckBox.length; i++) {
					selectedCheckBox[i].setSelected(false);
				}
			});
			registerIDs = [];
			this.actionButtonEnabledStatus.call(this, registerIDs);
		} else {
			var oRejectDialog = this.getRejectReasonDialog();
			var oModel = new JSONModel({
				REJECT_REASON: "",
				MASS_ACTION_REJECT: true
			});
			oRejectDialog.setModel(oModel, "register");
			oRejectDialog.open();
		}
	};

	RegistrationMixin.transText = function(status) {
		var text;
		switch (status) {
			case 0:
				text = 'REGISTER_TEXT_REGISTER';
				break;
			case 1:
				text = 'REGISTER_TEXT_PENDING';
				break;
			case 2:
				text = 'REGISTER_TEXT_LEAVE';
				break;
			case 3:
				text = 'REGISTER_TEXT_REGISTER';
				break;
			default:
				text = 'REGISTER_TEXT_REGISTER';
				break;
		}

		return this.getText(text);
	};

	RegistrationMixin.transTooltip = function(status, disabled, setting) {
		var text;
		if (setting === 1 && disabled === 1) {
			text = 'REGISTER_TOOLTIP_REGISTER_DISABLED';
			return this.getText(text);
		}
		switch (status) {
			case 0:
				text = 'REGISTER_TOOLTIP_REGISTER';
				break;
			case 1:
				text = 'REGISTER_TOOLTIP_PENDING';
				break;
			case 2:
				text = 'REGISTER_TOOLTIP_LEAVE';
				break;
			case 3:
				text = 'REGISTER_TOOLTIP_REGISTER';
				break;
			default:
				text = 'REGISTER_TOOLTIP_REGISTER';
				break;
		}

		return this.getText(text);
	};

	RegistrationMixin.transIcon = function(status) {
		var icon;
		switch (status) {
			case 0:
				icon = IconPool.getIconURI('register', 'InoIcons');
				break;
			case 1:
				icon = IconPool.getIconURI('pending', 'InoIcons');
				break;
			case 2:
				icon = IconPool.getIconURI('journey-depart');

				break;
			case 3:
				icon = IconPool.getIconURI('register', 'InoIcons');
				break;
			default:
				icon = IconPool.getIconURI('register', 'InoIcons');
				break;
		}
		return icon;
	};
	RegistrationMixin.getRejectReasonDialog = function() {
		if (!this._rejectReasonDialog) {
			this._rejectReasonDialog = this.createFragment("sap.ino.vc.campaign.fragments.RejectReasonDialog", this.getView().getId());
			this.getView().addDependent(this._rejectReasonDialog);
		}
		return this._rejectReasonDialog;
	};

	RegistrationMixin.onHandleRejectCancel = function(oEvent) {
		var oDialog = this.getRejectReasonDialog();
		var oModel = oDialog.getModel("register");
		oDialog.close();
	};

	RegistrationMixin.onHandleRejectOK = function(oEvent) {
		var self = this;
		var text = 'REGISTER_MSG_REJECTED';
		var oRejectDialog = this.getRejectReasonDialog();
		var oModel = oRejectDialog.getModel("register");
		var value = oModel.getProperty("/VALUE");
		var sReason = oModel.getProperty("/REJECT_REASON");
		
		oRejectDialog.setBusy(true);
		if (!oModel.getProperty("/MASS_ACTION_REJECT")) {
			var service = RegistrationService.Rejected(value, sReason);
			service.done(function() {
				MessageToast.show(self.getText(text));
				oRejectDialog.setBusy(false);
				oRejectDialog.close();
				self.bindList();
			}).fail(function() {
				oRejectDialog.setBusy(false);
				MessageToast.show(self.getText('REGISTER_ERROR_MASSAGE'));
			});
		} else {
			var registerIDs = this._oSelectionMap;
			var selectedCheckBox = this._oSelectedCheckBox;
			var sStatus = "sap.ino.config.REGISTER_REJECTED";
			var sRejectText = "OBJECT_MSG_REG_REJECT_SUCCESS";
			var sErrorMsg = "REGISTER_REJECT_MSG_ERROR";
			// mass action handling
			var oOptions = {
				parameters: {
					ids: registerIDs,
					status: sStatus,
					REASON: sReason
				}
			};
			var massReq = BaseController.prototype.executeObjectAction.call(this, RegistrationService, "massUpdate", oOptions);
			massReq.done(function() {
				MessageToast.show(self.getText(sRejectText));
				oRejectDialog.setBusy(false);
				self.bindList();
				self._oSelectionMap = [];
				oRejectDialog.close();
			}).fail(function() {
				oRejectDialog.setBusy(false);
				MessageToast.show(self.getText(sErrorMsg));
				for (var i = 0; i < selectedCheckBox.length; i++) {
					selectedCheckBox[i].setSelected(false);
				}
			});
			registerIDs = [];
			this.actionButtonEnabledStatus.call(this, registerIDs);

		}

	};
    RegistrationMixin.onRejectReasonLiveChange = function(oEvent){
        var oSource = oEvent.getSource();
        var oRejectBtn = this.byId("rejectReasonBtn");
        if(oSource.getValue().length > 0){
            oRejectBtn.setEnabled(true);
        } else {
            oRejectBtn.setEnabled(false);
        }
        
    };
	return RegistrationMixin;
});