/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.views.common.PeopleFacetController");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.controller("sap.ui.ino.views.backoffice.tag.TagGroupTreeCriteria", jQuery.extend({}, sap.ui.ino.views.common.PeopleFacetController, {

	onLiveChange: function(oEvent) {
		oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
	},

	setParentController: function(oController) {
		this.oParentController = oController;
	},

	getUsageModel: function() {
		var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_USAGE");
		var oUsageModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + '/' + sOdataPath, false);

		return oUsageModel;
	},

	getModelName: function() {
		return this.oParentController.getModelName();
	},

	isInEditMode: function() {
		return this.oParentController.isInEditMode();
	},

	getModel: function() {
		return this.oParentController.getModel();
	},

	onAddSibling: function(oEvent, oSelectedRowContext) {
		var oModel = this.getModel();
		var iHandle;
		if (!oSelectedRowContext) {
			//add Tag or Groups to the FirstLevle
			iHandle = oModel.addSibling(oModel.getProperty("/ID"));
		} else {
			var sID = oModel.getProperty("TAG_GROUP_ID", oSelectedRowContext);
			iHandle = oModel.addSibling(sID);
		}

		if (iHandle !== 0) {
			this.getView().setTagGroupContextBySiblingID(iHandle);
		}
	},
	enableAddchild: function(bEdit, oSelectedRowContext) {

	},
	onAddChild: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		var oModel = this.getModel();
		var sParentID = oModel.getProperty("TAG_ID", oSelectedRowContext);

		var ihandle = oModel.addSubTagorGroup(sParentID);
		//var iParentKeyID = oModel.getProperty("ID", oSelectedRowContext);
		var iSelectedIndex = this.getView().oGroupTreeTable.getSelectedIndex();
		this.getView().setTagGroupContextByChildID(sParentID, ihandle, iSelectedIndex);
	},

	onDeleteAssignmentTagGroup: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		this.oSeletedTagorGroup = oSelectedRowContext.getObject();
		var oModel = this.getModel();
		this.getView().oGroupTreeTable.setSelectedIndex(-1);
		this.getView().oGroupTreeDetailLayout.destroyRows();
		this.getView().oDeleteButton.setEnabled(false);
		oModel.removeTagorGroup(this.oSeletedTagorGroup);
		this.updateGroupTagCount();
	},
	onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {
		this.getThingInspectorController().clearFacetMessages();
		var oView = this.getView();
		if (iSelectedIndex >= 0) {
			oView.setTagGroupValueContext(oSelectedRowContext);
		} else {
			oView.setTagGroupValueContext(null);
		}
	},
	onCreateNewTagGroup: function() {
		// 	sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow('taggroup', {
		// 		id: -1
		// 	});
		var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance");
		oModifyView.show(-1, "edit");

	},
	onCreateNewTag: function() {
		var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagModify");
		oModifyView.show(-1, "edit");
	},
	onExpandAll: function() {
		var oTreeTable = this.getView().oGroupTreeTable;
		var nCount = this._getTagGroupsCount();
		for (var index = 0; index < nCount; index++) {
			oTreeTable.expand(index);
		}
		//delat call revalidate messages because it would not render all fields immediately
		this.getView().delayRevalidateMessages();
	},

	_getTagGroupsCount: function() {
		var oModel = this.getModel().getProperty("/AssignmentTags");
		return this._getChildrenCount(oModel);
	},

	_getChildrenCount: function(oModel) {
		var nCount = 0;
		if (!oModel || oModel.length <= 0) {
			return nCount;
		}
		for (var index = 0; index < oModel.length; index++) {
			nCount++;
			nCount += this._getChildrenCount(oModel[index].children);
		}
		return nCount;
	},

	getModelPrefix: function() {
		return this.oParentController.getModelPrefix();
	},

	getTextPath: function(oBinding) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		return "{" + this.getTextModelPrefix() + oBinding + "}";
	},

	getTextModelPrefix: function() {
		return this.oParentController.getTextModelPrefix();
	},

	getBoundPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (absolute) {
			return "{" + this.getModelPrefix() + "/" + oBinding + "}";
		} else {
			return "{" + this.getModelPrefix() + oBinding + "}";
		}
	},

	getBoundObject: function(oBinding, absolute, oType) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (oType) {
			if (absolute) {
				return {
					path: this.getModelPrefix() + "/" + oBinding,
					type: oType
				};
			} else {
				return {
					path: this.getModelPrefix() + oBinding,
					type: oType
				};
			}
		} else {
			if (absolute) {
				return {
					path: this.getModelPrefix() + "/" + oBinding
				};
			} else {
				return {
					path: this.getModelPrefix() + oBinding
				};
			}
		}
	},
	getTextModel: function() {
		if (!this.i18n) {
			this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		}
		return this.i18n;
	},

	getFormatterPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (absolute) {
			return this.getModelPrefix() + "/" + oBinding;
		} else {
			return this.getModelPrefix() + oBinding;
		}
	},

	getThingInspectorController: function() {
		return this.oParentController.getThingInspectorController();
	},

	getThingInspectorView: function() {
		return this.getThingInspectorController().getView();
	},

	addTagsFromClipboard: function(oButton, sNodeName) {
		var oController = this;
		var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
		var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
		var oResponsibility = this.getModel();

		jQuery.each(aTagKeys, function(iTagKeyIndex, oTagKey) {
			var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Tag, oTagKey);
			oReadRequest.done(function(oTag) {
				var oMessage = oResponsibility.addTag({
					TAG_ID: oTag.ID,
					NAME: oTag.NAME
				}, sNodeName);
				if (oMessage) {
					oMessage.setReferenceControl(oButton);
					oController.getThingInspectorView().addMessage(oMessage);
				}
			});

			oReadRequest.fail(function(oTag) {
				var oMessage = new sap.ui.ino.application.Message({
					key: "MSG_IDEA_FLD_TAG_LOAD_FAILED",
					level: sap.ui.core.MessageType.Error,
					group: "TAG",
					parameters: [oTagKey]
				});
				oController.getThingInspectorView().addMessage(oMessage);
			});
		});
	},

	onTagAdded: function(oTextField, sNodeName) {
		var oTIView = this.getThingInspectorView();
		oTIView.removeAllMessages("TAG");
		var oSelectedItem = sap.ui.getCore().byId(oTextField.getSelectedItemId());
		var iTagId;
		var sName;

		if (oSelectedItem) {
			iTagId = parseInt(oSelectedItem.getKey(), 10);
			sName = oSelectedItem.getText();
		} else {
			sName = oTextField.getValue();
		}

		var oResponsibility = this.getModel();
		var oMessage = oResponsibility.addTag({
			TAG_ID: iTagId,
			NAME: sName
		}, sNodeName);

		if (oMessage) {
			oMessage.setReferenceControl(oTextField);
			oTIView.addMessage(oMessage);
		} else {
			oTextField.setValue("");
		}
	},

	onTagRemoved: function(oEvent) {
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		oApp.removeNotificationMessages("TAG");
		var oTag = oEvent.getSource().getBindingContext(this.getModelName()).getObject();
		this.getModel().removeChild(oTag);
	},

	getBindingPath: function(oBindingContext) {
		if (!oBindingContext || !oBindingContext.sPath) {
			throw new Error("invalid path");
		}
		var path = oBindingContext.sPath + "/";
		if (oBindingContext.sPath.indexOf("/") === 0) {
			path = oBindingContext.sPath.substring(1) + "/";
		}
		return path;
	},

	addTagOrGroup: function(oField, oBindingContext) {
		this.getThingInspectorController().clearFacetMessages();
		if (!oField || !oField.getValue()) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_REQUIRED_TAG_OR_TAG_GROUP", oField);
			return;
		}
		oField.setValueState(sap.ui.core.ValueState.None);
		var sKey = oField.getSelectedKey();
		var sValue = oField.getValue();
		var itemList = oField.getItems();
		var index = 0;
		var oTagorGroup;
		for (; index < itemList.length; ++index) {
			if (!sKey) {//If the Key is null,then use the text to compare, then get the correct key;
				if (itemList[index].getText() === sValue) {
					sKey = itemList[index].getKey();
				} else {
					continue;
				}
			}
			if (sKey !== itemList[index].getKey()) {
				continue;
			} else {
			    if(oField.getSelectedItemId().indexOf(itemList[index].getId()) < 0){
			       continue;
			    }
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
			oTagorGroup = sap.ui.getCore().getModel().oData[sPath];
			if (!oTagorGroup) {
				continue;
			}
			break;
		}
		if (!oTagorGroup) {
			this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_NOT_EXISTS_TAG_OR_TAG_GROUP",
				oField);
			return;
		}

		if (!this._doAddTagGroup(oTagorGroup, oBindingContext, oField)) {
			return;
		}
		oField.setValue("");
		oField.unbindItems();
	},

	_doAddTagGroup: function(oTagGroup, oBindingContext, oField) {
		if (!oTagGroup) {
			return false;
		}
		var that = this;
		var oObjectModel = this.getModel("applicationObject");
		var oParentGroupID = oObjectModel.getProperty(oBindingContext.sPath + "/TAG_GROUP_ID");
		var aTagsAndGroups = this.deleteDuplicateRecords(this.convertToFlatList(oObjectModel.getProperty("/AssignmentTags"), false));
		//Can not add the root group to itself 
		if (oObjectModel.getProperty("/ID") > 0 && oTagGroup.ID === oObjectModel.getProperty("/ID")) {
			that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_CAN_NOT_ADD_SELF",
				oField);
			return false;
		}
		//Check the children which group can not add itself
		if (oTagGroup.ID === oParentGroupID && oTagGroup.OBJECT_TYPE_CODE === "TAG_GROUP") {
			that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_CAN_NOT_ADD_SELF",
				oField);
			return false;
		}
		//Duplicate check       
		for (var i = 0; i < aTagsAndGroups.length; i++) {
		    var sObjectTypeCode = aTagsAndGroups[i].OBJECT_TYPE_CODE ? aTagsAndGroups[i].OBJECT_TYPE_CODE : "TAG";
			if (aTagsAndGroups[i].TAG_ID === oTagGroup.ID && sObjectTypeCode === oTagGroup.OBJECT_TYPE_CODE && aTagsAndGroups[i].TAG_GROUP_ID === oParentGroupID) {
				that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_DUPLICATE_TAG_AND_GROUP",
					oField);
				return false;
			}

		}

		if (oTagGroup.OBJECT_TYPE_CODE === "TAG_GROUP") {
			var oServiceData = jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/tagGroupQuery.xsjs",
				type: "GET",
				dataType: "json",
				data: {
					GROUP_ID: oTagGroup.ID
				},
				async: false

			});
			var bError = false;
			oServiceData.done(function(oResponse) {
				var aAddGroup = [];
				aAddGroup = that.deleteDuplicateRecords(that.convertToFlatList(oResponse.children, false));
				jQuery.each(aAddGroup, function(index, oAddGroup) {
					if (oAddGroup.TAG_ID === oParentGroupID && oAddGroup.OBJECT_TYPE_CODE === "TAG_GROUP") {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_VALUE_DUPLICATE_NESTED_GROUP",
							oField);
						bError = true;
						return false;
					}
				});
				if (!bError) {
					that.setModelProperty(oObjectModel, oTagGroup, oBindingContext);
					oObjectModel.getProperty(oBindingContext.sPath).children = that.sortObjectArray(oResponse.children,"SEQUENCE_NO");
					that.updateGroupTagCount();
				}
			});
			return !bError;
		} else {
			this.setModelProperty(oObjectModel, oTagGroup, oBindingContext);
			this.updateGroupTagCount();
			return true;
		}
	},
	
	sortObjectArray: function(aObjects, sSortKeyName) {
		aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] < o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});

		for (var i = 0; i < aObjects.length; i++) {
			// if there are children sort them too
			if (aObjects[i].children) {
				this.sortObjectArray(aObjects[i].children, sSortKeyName);
			}
		}
		return aObjects;
	},

	deleteDuplicateRecords: function(arry) {
		var aObjects = [];
		var temp = {};
		for (var i = 0; i < arry.length; i++) {
			if (temp[arry[i].ID + "_" + arry[i].OBJECT_TYPE_CODE]) {
				continue;
			} else {
				temp[arry[i].ID + "_" + arry[i].OBJECT_TYPE_CODE] = true;
				aObjects.push(arry[i]);
			}
		}

		return aObjects;

	},
	getDiffLevelGroups: function(currentGroupid, aTagGroups, rootGroupID) {
		var aGroups = [];
		var that = this;
		// 		jQuery.each(aTagGroups, function(index, oTagGroup) {
		// 			var aParentGroups = [];
		// 			if (oTagGroup.OBJECT_TYPE_CODE === "TAG_GROUP" && oTagGroup.TAG_ID === currentGroupid) {
		// 				aGroups.push(oTagGroup);
		// 				aTagGroups.splice(index, 1);
		// 				aParentGroups = that.getDiffLevelGroups(oTagGroup.TAG_GROUP_ID, aTagGroups);
		// 			}
		// 			if (aParentGroups.length > 0) {
		// 				aGroups = aGroups.concat(aParentGroups);
		// 			}
		// 		});

		for (var i = 0; i < aTagGroups.length; i++) {
			var aParentGroups = [];
			if (aTagGroups[i].OBJECT_TYPE_CODE === "TAG_GROUP" && aTagGroups[i].TAG_ID === currentGroupid) {
				aGroups.push(aTagGroups[i]);
				var oTemp = aTagGroups[i];
				aTagGroups.splice(i, 1);
				if (oTemp.TAG_GROUP_ID !== rootGroupID) {
					aParentGroups = that.getDiffLevelGroups(oTemp.TAG_GROUP_ID, aTagGroups);
				} else {
					continue;
				}
			}
			if (aParentGroups.length > 0) {
				aGroups = aGroups.concat(aParentGroups);
			}

		}

		return aGroups;
	},
	updateGroupTagCount: function() {
		var oModel = this.getModel("applicationObject");
		var aHirachyTags = oModel.getProperty("/AssignmentTags");
		var aFlatAssignedTags = this.convertToFlatList(aHirachyTags, false);
		var aAssignedTags = [];
		aAssignedTags = jQuery.grep(aFlatAssignedTags, function(oAssignedObject) {
			return oAssignedObject.OBJECT_TYPE_CODE !== "TAG_GROUP";
		});

		oModel.setProperty("/TAGS_COUNT", aAssignedTags.length);
		oModel.setProperty("/COUNT_OF_TAGS", aAssignedTags.length);
	},
	getNextSequenceNo: function(AssignmentTagAndGroup) {
		var iMaxSequenceNo = 0;
		var iSequenceNo = 1;

		for (var i = 0; i < AssignmentTagAndGroup.length; i++) {
			if (AssignmentTagAndGroup[i].SEQUENCE_NO > iMaxSequenceNo) {
				iMaxSequenceNo = AssignmentTagAndGroup[i].SEQUENCE_NO;
			}
		}
		iSequenceNo = iMaxSequenceNo + 1;

		return iSequenceNo;
	},
	arrToHierarchy: function(oTreeNode, aNodeObjects, sKeyName) {
		if (!oTreeNode || oTreeNode.length === 0) {
			return;
		}
		for (var i = 0; i < oTreeNode.length; i++) {
			var sProName = "Pro_" + oTreeNode[i][sKeyName];
			if (aNodeObjects.hasOwnProperty(sProName) && oTreeNode[i].OBJECT_TYPE_CODE === "TAG_GROUP") {
				oTreeNode[i].children = aNodeObjects[sProName];
				this.arrToHierarchy(oTreeNode[i].children, aNodeObjects, sKeyName);
			}
		}
	},

	createStructure: function(aNodes, sParentID, sParentKeyName) {
		var aObjects = {
			root: []
		};
		for (var i = 0; i < aNodes.length; i++) {
			var sProName = "Pro_" + aNodes[i][sParentKeyName];
			if (!aNodes[i].children || !jQuery.isArray(aNodes[i].children)) {
				aNodes[i].children = []; // create empty array for children later
			}
			if (aNodes[i].TAG_GROUP_ID === sParentID) {
				aObjects.root.push(aNodes[i]);
			} else {
				if (!aObjects.hasOwnProperty(sProName)) {
					aObjects[sProName] = [];
				}
				aObjects[sProName].push(aNodes[i]);
			}
		}
		return aObjects;
	},

	convertToHierarchy: function(aObjects, sKeyName, sParentID, sParentKeyName) {
		var aNodeObjects = this.createStructure(aObjects, sParentID, sParentKeyName);
		var oTreeNode = aNodeObjects.root;
		this.arrToHierarchy(oTreeNode, aNodeObjects, sKeyName);
		return aNodeObjects;
	},
	convertToFlatList: function(aObjects, bRelease) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				// first get the children
				if (aObjects[i].children) {
					aChildFlatObject = this.convertToFlatList(aObjects[i].children, bRelease);
				}
				if (bRelease) {
					delete aObjects[i].children;
				}
				aFlatObjects.push(aObjects[i]);
				// add the children if there are any
				if (aChildFlatObject.length > 0) {
					aFlatObjects = aFlatObjects.concat(aChildFlatObject);
				}
			}
		}

		return aFlatObjects;
	},
	setModelProperty: function(oModel, oTagGroup, oBindingContext) {
		oModel.setProperty(oBindingContext.sPath + "/TAG_ID", oTagGroup.ID);
		oModel.setProperty(oBindingContext.sPath + "/OBJECT_TYPE_CODE", oTagGroup.OBJECT_TYPE_CODE);
		oModel.setProperty(oBindingContext.sPath + "/CHANGED_BY_ID", oTagGroup.CHANGED_BY);
		oModel.setProperty(oBindingContext.sPath + "/CHANGED_AT", oTagGroup.CHANGED_AT);
		oModel.setProperty(oBindingContext.sPath + "/CREATED_BY_ID", oTagGroup.CREATED_BY);
		oModel.setProperty(oBindingContext.sPath + "/CREATED_AT", oTagGroup.CREATED_AT);
		oModel.setProperty(oBindingContext.sPath + "/CREATED_BY", oTagGroup.CREATED_BY);
		oModel.setProperty(oBindingContext.sPath + "/CHANGED_BY", oTagGroup.CHANGED_BY);
		oModel.setProperty(oBindingContext.sPath + "/USAGE_COUNT", oTagGroup.USAGE_COUNT);
		oModel.setProperty(oBindingContext.sPath + "/NAME", oTagGroup.NAME);
	}
}));