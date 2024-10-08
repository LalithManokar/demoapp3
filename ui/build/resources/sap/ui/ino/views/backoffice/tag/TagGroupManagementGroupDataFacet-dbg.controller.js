/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");

sap.ui.controller("sap.ui.ino.views.backoffice.tag.TagGroupManagementGroupDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

	onLiveChange: function(oEvent) {
		var oField = oEvent.getSource();
		oField.setValue(oEvent.getParameter("liveValue"));
		this.getModel().setProperty(oField.mBindingInfos.value.binding.sPath, oEvent.getParameter("liveValue"));
	},

	initTagBinding: function() {
		var oView = this.getView();
// 		oView._oTableTags.bindRows({
// 			path: this.getFormatterPath("AssignmentTags", true)
// 		});
	},

	onEnterEditMode: function() {
		//this.resetTableTags();
	},

	onExitEditMode: function() {
		//this.resetTableTags();
	},

	resetTableTags: function() {
		var oView = this.getView();
		oView._oTableTags.removeAllColumns();
		oView._oTableTags.unbindRows();
	},

	addIdentity: function(oField) {
		this.getThingInspectorController().clearFacetMessages();
		if (!oField || !oField.getValue()) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_REQUIRED_TAG", oField);
			return;
		}
		oField.setValueState(sap.ui.core.ValueState.None);
		var sKey = oField.getSelectedKey();
		var itemList = oField.getItems();
		var index = 0;
		var oIdentity;
		for (; index < itemList.length; ++index) {
			if (sKey !== itemList[index].getKey()) {
				continue;
			}
			var oBindingInfo = oField.getBindingInfo("items");
			if (!oBindingInfo || !oBindingInfo.binding || !oBindingInfo.binding.getContexts()) {
				continue;
			}
			var aContexts = oBindingInfo.binding.getContexts();
			if (!aContexts || aContexts.length <= index) {
				continue;
			}
			var sPath = aContexts[index].sPath;
			if (sPath && sPath.length > 0 && sPath[0] === '/') {
				sPath = sPath.substr(1);
			}
			oIdentity = sap.ui.getCore().getModel().oData[sPath];
			if (!oIdentity) {
				continue;
			}
			break;
		}
		if (!oIdentity) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_NOT_EXISTS_TAG", oField);
			return;
		}
		if (!this._doAddIdentity(oIdentity)) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_DUPLICATE_TAG", oField);
			return;
		}
		oField.setValue("");
		oField.unbindItems();
	},

	_doAddIdentity: function(oIdentity) {
		if (!oIdentity) {
			return false;
		}
		// we need to copy as the identity may be re-read while editing the group and the handle would be
		// overwritten by the id
		// but we don't care about the subnodes, so no deep copy is required
		var oIdentity2Add = jQuery.extend({}, oIdentity);
		this._cleanIdentity(oIdentity2Add);

		var iGroupID = this.getModel().getProperty("/ID");
		oIdentity2Add.TAG_GROUP_ID = iGroupID;
		oIdentity2Add.TAG_ID = oIdentity.ID;
		oIdentity2Add.NAME = oIdentity.NAME;
		oIdentity2Add.ID = this.getModel().getNextHandle();
		oIdentity2Add.USAGE_COUNT = oIdentity.USAGE_COUNT;
		oIdentity2Add.CREATED_AT = oIdentity.CREATED_AT;
		oIdentity2Add.CREATED_BY = oIdentity.CREATED_BY;
		oIdentity2Add.CHANGED_AT = oIdentity.CHANGED_AT;
		oIdentity2Add.CHANGED_BY = oIdentity.CHANGED_BY;

		var aIdentities = this.getModel().getProperty("/AssignmentTags");
		for (var index = 0; index < aIdentities.length; ++index) {
			if (aIdentities[index].TAG_ID === oIdentity2Add.TAG_ID) {
				return false;
			}
		}

		this.getModel().getProperty("/AssignmentTags").push(oIdentity2Add);
		this.getView()._oTableTags.bindRows({
			path: this.getFormatterPath("/AssignmentTags")
		});
		this._updateTagCount();
		return true;
	},

	_cleanIdentity: function(oIdentity) {
		delete oIdentity.__metadata;
		delete oIdentity.Groups;
		delete oIdentity.SEARCH_SCORE;
	},

	addIdentityFromClipboard: function() {
		var that = this;
		var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
		var aIdentityKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
		if (!aIdentityKeys || aIdentityKeys === []) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_REQUIRED_TAG", oClipboard);
			return;
		}
		for (var i = 0; i < aIdentityKeys.length; ++i) {
			var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Tag, aIdentityKeys[i]);
			oReadRequest.done(function(oIdentity) {
				if (!oIdentity) {
					that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_NOT_EXISTS_TAG", oClipboard);
				} else {
					var bUserSuccess = that._doAddIdentity(oIdentity);
					if (!bUserSuccess) {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_DUPLICATE_TAG", oClipboard);
					}
				}
			});
			oReadRequest.fail(function() {
				that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_NOT_EXISTS_TAG", oClipboard);
			});
		}
	},

	removeIdentity: function() {
		this.getThingInspectorController().clearFacetMessages();
		var oTable = this.getView()._oTableTags;
		var iIdx = oTable.getSelectedIndex();
		var aChildren = this.getModel().getProperty("/AssignmentTags");
		aChildren.splice(iIdx, 1);
		this.getView()._oTableTags.bindRows({
			path: this.getFormatterPath("/AssignmentTags")
		});
		this._updateTagCount();
		this.onSelectionChanged(undefined, -1, undefined, true);
	},

	_updateTagCount: function() {
		var oModel = this.getModel();
		oModel.setProperty("/TAGS_COUNT", oModel.getProperty("/AssignmentTags").length);
	},

	onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable, bEdit) {
		if (!bEdit) {
			return;
		}
		this.getView()._oRemoveIdentityButton.setEnabled(iSelectedIndex >= 0);
	}
}));