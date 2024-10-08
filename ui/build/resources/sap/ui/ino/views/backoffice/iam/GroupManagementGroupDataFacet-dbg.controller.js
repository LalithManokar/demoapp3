/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.object.GroupDetail");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.GroupAssignment");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.GroupManagementGroupDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

	onLiveChange: function(oEvent) {
		var oField = oEvent.getSource();

		oField.setValue(oEvent.getParameter("liveValue"));

		// explicitly update the model
		this.getModel().setProperty(oField.mBindingInfos.value.binding.sPath, oEvent.getParameter("liveValue"));
	},

	onAfterModelAction: function(event) {
		this.initMemberBinding();
	},

	initMemberData: function() {
		var self = this;
		var param = {
			//			id: this.getModel().getInitKey(),
			id: this.getModel().getInitKey() ? this.getModel().getInitKey() : this.getModel().getKey(),
			maxMember: 1000,
			page: 1
		};
		var odataModel = self.getModel();
		odataModel.getDataInitializedPromise().done(function() {
			sap.ui.ino.models.object.GroupDetail.getMemberShip(param).done(function(data) {
				self.getModel().setProperty('/MemberShip', data.RESULT || []);
				self._updateMemberCount();
			});
		});
	},

	initMemberBinding: function() {
		var self = this;
		var oView = this.getView();

		self.initMemberData();

		oView._oTableMembers.bindRows({
			path: self.getFormatterPath("MemberShip", true)
		});
	},

	onEnterEditMode: function() {
		var oView = this.getView();
		// Assure that the table is cleared
		oView._oTableMembers.removeAllColumns();
		oView._oTableMembers.unbindRows();
	},

	onExitEditMode: function() {
		var oView = this.getView();
		// Assure that the table is cleared
		oView._oTableMembers.removeAllColumns();
		oView._oTableMembers.unbindRows();
	},

	updateMemberShip: function(message) {
		var self = this;
		var successMessage = message || 'BO_GROUPMGMT_MGS_DEF_SUCCESS';
		sap.ui.ino.models.object.GroupDetail.update(self.getModel().getInitKey(), {
			Members: self.cleanData(self.getModel().getProperty('/MemberShip'))
		}).done(function() {
			self.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Success, successMessage);
		});
	},

	updateMemberShipAssignment: function(message, sKey) {
		var that = this;
		var oView = this.getView();
		var successMessage = message || 'BO_GROUPMGMT_MGS_DEF_SUCCESS';
		oView.setBusy(true);
		if (that.getModel().oData.ID < 0) {
			var oThingInspector = that.getThingInspectorController();
			var oGroupPromise = oThingInspector.onModelAction(this.getModel().modify, oThingInspector.MessageParam.Save, true, false);
			oGroupPromise.done(function() {
				sap.ui.ino.models.object.GroupAssignment.update(sKey, {
					MemberOf: that.getModel().oData.ID
				}).done(function() {
					that.initMemberBinding();
					oThingInspector.setFacetMessage(sap.ui.core.MessageType.Success, successMessage);
				}).always(function() {
					oView.setBusy(false);
					that.setFilterForColumns();
				});
			});
		} else {
			sap.ui.ino.models.object.GroupAssignment.update(sKey, {
				MemberOf: that.getModel().oData.ID
			}).done(function() {
				that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Success, successMessage);
			}).always(function() {
				oView.setBusy(false);
				//oView._oTableMembers;
				that.setFilterForColumns();

			});
		}
	},

	setFilterForColumns: function() {
		var oView = this.getView();
		var aColumns = oView._oTableMembers.getColumns();
		for (var i = 0; i < aColumns.length; i++) {
			if (aColumns[i].getFilterValue()) {
				aColumns[i].filter(aColumns[i].getFilterValue());
			}
		}
	},
	addIdentity: function(oField) {
		var self = this;
		this.getThingInspectorController().clearFacetMessages();

		if (oField.getValue() === "") {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_REQUIRED_MEMBER", oField);
		} else {
			oField.setValueState(sap.ui.core.ValueState.None);
			var sKey = oField.getSelectedKey();
			var bSuccess = false;
			for (var ii = 0; ii < oField.getItems().length; ++ii) {
				if (sKey === oField.getItems()[ii].getKey()) {
					var oBindingInfo = oField.getBindingInfo("items");
					if (oBindingInfo && oBindingInfo.binding && oBindingInfo.binding.getContexts()) {
						var aContexts = oBindingInfo.binding.getContexts();

						if (aContexts.length > ii) {
							var sPath = aContexts[ii].sPath;
							if (sPath.length > 0 && sPath[0] === '/') {
								sPath = sPath.substr(1);
							}

							var oIdentity = sap.ui.getCore().getModel().oData[sPath];
							bSuccess = this._doAddIdentity(oIdentity);
						}
					}
					break;
				}
			}

			if (!bSuccess) {
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_VALUE_INVALID_MEMBER", oField);
			} else {

				self.updateMemberShipAssignment('BO_GROUPMGMT_MGS_ADD_SUCCESS', sKey);

				oField.setValue("");

				oField.unbindItems();
			}
		}
	},

	addIdentityFromClipboard: function() {
		var that = this;
		var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
		var aUserKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.User);
		var aGroupKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Group);
		var aIdentityKeys = aUserKeys.concat(aGroupKeys);

		if (!aIdentityKeys || aIdentityKeys == []) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_REQUIRED_MEMBER", oClipboard);
		} else {
			var sKey = "";

			for (var i = 0; i < aUserKeys.length; ++i) {
				sKey = aUserKeys[i];

				var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.User, sKey);
				oReadRequest.done(function(oIdentity) {
					var bUserSuccess = that._doAddIdentity(oIdentity);
					that.updateMemberShipAssignment('BO_GROUPMGMT_MGS_ADD_SUCCESS', oIdentity.ID);
					if (!bUserSuccess) {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_VALUE_INVALID_MEMBER", oClipboard);
					}
				});
				oReadRequest.fail(function(oIdentity) {
					that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_VALUE_INVALID_MEMBER", oClipboard);
				});
			}
			for (var i = 0; i < aGroupKeys.length; ++i) {
				sKey = aGroupKeys[i];

				var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Group, sKey);
				oReadRequest.done(function(oIdentity) {
					var bGroupSuccess = that._doAddIdentity(oIdentity);
					that.updateMemberShipAssignment('BO_GROUPMGMT_MGS_ADD_SUCCESS', oIdentity.ID);
					if (!bGroupSuccess) {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_VALUE_INVALID_MEMBER", oClipboard);
					}
				});
				oReadRequest.fail(function(oIdentity) {
					that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_GROUPMGMT_VALUE_INVALID_MEMBER", oClipboard);
				});
			}
		}
	},
	_doAddIdentity: function(oIdentity) {
		var bSuccess = false;
		if (oIdentity) {
			// we need to copy as the identity may be re-read while editing the group and the handle would be
			// overwritten by the id
			// but we don't care about the subnodes, so no deep copy is required
			var oIdentity2Add = jQuery.extend({}, oIdentity);
			this._cleanIdentity(oIdentity2Add);

			var iGroupID = this.getModel().getProperty("/ID");
			oIdentity2Add.GROUP_ID = iGroupID;
			oIdentity2Add.MEMBER_ID = oIdentity2Add.ID;
			oIdentity2Add.MEMBER_NAME = oIdentity.NAME;
			oIdentity2Add.ID = this.getModel().getNextHandle();

			// check for duplicates => if the user is faster than the context update
			var bIsDuplicate = false;

			if (oIdentity2Add.MEMBER_ID == iGroupID) {
				bIsDuplicate = true;
			}

			if (!bIsDuplicate) {
				var aIdentities = this.getModel().getProperty("/MemberShip");
				for (var ii = 0; ii < aIdentities.length; ++ii) {
					if (aIdentities[ii].MEMBER_ID === oIdentity2Add.MEMBER_ID) {
						bIsDuplicate = true;
						break;
					}
				}
			}

			if (!bIsDuplicate) {
				this.getModel().getProperty("/MemberShip").push(oIdentity2Add);
				this.getView()._oTableMembers.bindRows({
					path: this.getFormatterPath("/MemberShip")
				});

				bSuccess = true;

				this._updateMemberCount();
			}
		}
		return bSuccess;
	},

	cleanData: function(source) {
		var arr = [];
		for (var i = 0; i < source.length; i++) {
			arr.push({
				ID: source[i].ID,
				MEMBER_ID: source[i].MEMBER_ID
			});
		}
		return arr;
	},

	_cleanIdentity: function(oIdentity) {
		delete oIdentity["__metadata"];
		delete oIdentity["Groups"];
		delete oIdentity["SEARCH_SCORE"];
	},

	removeIdentity: function(oEvent) {
		this.getThingInspectorController().clearFacetMessages();
		var oModel = this.getModel();
		var oTable = this.getView()._oTableMembers;

		var iIdx = oTable.getSelectedIndex();
		var oContext = oTable.getContextByIndex(iIdx);
		var aChildren = oModel.getProperty("/MemberShip");
		var removeID = oModel.getProperty(oContext.sPath + "/MEMBER_ID");

		aChildren.splice(oContext.sPath.substr(12), 1);

		this.getView()._oTableMembers.bindRows({
			path: this.getFormatterPath("/MemberShip")
		});

		this.updateMemberShipAssignment('BO_GROUPMGMT_MGS_REMOVE_SUCCESS', removeID);

		this._updateMemberCount();
		this.onSelectionChanged(undefined, -1, undefined, true);
	},

	_updateMemberCount: function() {
		var oModel = this.getModel();
		oModel.setProperty("/MEMBERS", oModel.getProperty("/MemberShip").length);
	},

	onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable, bEdit) {
		if (!bEdit) {
			return;
		}
		this.getView()._oRemoveIdentityButton.setEnabled(iSelectedIndex > -1);
	},

	formatterPublic: function(cid, id) {
		return id <= 0 || !id || sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute") ||
			Number(cid) === sap.ui.ino.application.Configuration.getCurrentUser().USER_ID;
	},
	setGroupImage: function(iAttachmenId, sFileName, sMediaType) {
		this._setImage(this.getModel().setGroupImage, iAttachmenId, sFileName, sMediaType);
	},
	_setImage: function(fMethod, iAttachmenId, sFileName, sMediaType) {
		fMethod.call(this.getModel(), {
			ATTACHMENT_ID: iAttachmenId,
			FILE_NAME: sFileName,
			MEDIA_TYPE: sMediaType
		});
	},
	clearGroupImage: function(iAssignmentId) {
		this.getModel().clearGroupImage(iAssignmentId);
	}
}));