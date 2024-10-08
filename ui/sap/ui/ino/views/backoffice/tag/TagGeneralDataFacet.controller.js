/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;
sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.tag.TagGeneralDataFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {

		onLiveNameChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
		},
		setGroupsButtonState: function(bState) {
			if (this.getView().oRemoveGroupButton) {
				this.getView().oRemoveGroupButton.setEnabled(bState);
			}
		},
		removeFromTable: function(oTable) {
			this.getThingInspectorController().clearFacetMessages();
			var iIdx = oTable.getSelectedIndex();
			var oObject = oTable.getContextByIndex(iIdx).getObject();
			this.getModel().removeChild(oObject);
		},
		_updateTableSelectionAfterRemove: function(oTable, iLength) {
			var iSelectedIdx = oTable.getSelectedIndex();

			if (iSelectedIdx >= iLength) {
				iSelectedIdx--;
			} else {
				oTable.setSelectedIndex(-1);
			}
			oTable.setSelectedIndex(iSelectedIdx);
		},
		removeGroup: function(oEvent) {
			this.removeFromTable(this.getView().oTableGroups);
			var aGroups = this.getModel().getProperty("/MemberOf") || [];
			this._updateTableSelectionAfterRemove(this.getView().oTableGroups, aGroups.length);
		},
		_doAddTagGroup: function(oTagGroup) {
			var bSuccess = false;
			if (oTagGroup) {
				// we need to copy as the identity may be re-read while editing the group and the handle
				// would be overwritten by the id
				// but we don't care about the subnodes, so no deep copy is required
				var oTagGroupAdd = jQuery.extend({}, oTagGroup);
				//this._cleanIdentity(oTagGroupAdd);
				oTagGroupAdd.DESCRIPTION = oTagGroup.DESCRIPTION;
				oTagGroupAdd.TAG_GROUP_ID = oTagGroupAdd.ID;
				oTagGroupAdd.NAME = oTagGroup.NAME;
				oTagGroupAdd.ID = this.getModel().getNextHandle();
				oTagGroupAdd.OBJECT_TYPE_CODE = "TAG";
				//Read the sequence number for TagGroups
				var oServiceData = jQuery.ajax({
					url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagGroupQuery.xsjs",
					type: "GET",
					dataType: "json",
					data: {
						GROUP_ID: 	oTagGroupAdd.TAG_GROUP_ID
					},
					async: false

				});
				oServiceData.done(function(oResponse) {
					var aAddGroup = oResponse.children;
					var iMaxSequenceNo = 0;
					jQuery.each(aAddGroup, function(index, oAddGroup) {
						if (!oAddGroup.SEQUENCE_NO) {
							iMaxSequenceNo = 0;
							return;
						} else {
							if (oAddGroup.SEQUENCE_NO > iMaxSequenceNo) {
								iMaxSequenceNo = oAddGroup.SEQUENCE_NO;
							}
						}
					});
					if (iMaxSequenceNo) {
						oTagGroupAdd.SEQUENCE_NO = iMaxSequenceNo + 1;
					}
				});

				// check for duplicates => if the user is faster than the context update
				var bIsDuplicate = false;
				var aGroups = this.getModel().getProperty("/MemberOf");
				for (var ii = 0; ii < aGroups.length; ++ii) {
					if (aGroups[ii].TAG_GROUP_ID === oTagGroupAdd.TAG_GROUP_ID) {
						bIsDuplicate = true;
						break;
					}
				}

				if (!bIsDuplicate) {
					this.getModel().addChild(oTagGroupAdd, "MemberOf");
					bSuccess = true;
				}
			}
			return bSuccess;
		},

		addGroup: function(oField) {
			this.getThingInspectorController().clearFacetMessages();

			if (oField.getValue() === "") {
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_REQUIRED_GROUP", oField);
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

								var oTagGroup = sap.ui.getCore().getModel().oData[sPath];
								bSuccess = this._doAddTagGroup(oTagGroup);
							}
						}
						break;
					}
				}

				if (!bSuccess) {
					this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_INVALID_GROUP", oField);
				} else {
					oField.setValue("");
					oField.unbindItems();
				}
			}
		}

	}));