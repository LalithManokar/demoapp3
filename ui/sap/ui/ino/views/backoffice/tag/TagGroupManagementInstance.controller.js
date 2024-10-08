/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.TagGroupStage");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.controller("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController, {

	mMessageParameters: {
		group: "configuration_taggroup",
		save: {
			success: "MSG_GROUP_SAVED"
		},
		del: {
			success: "MSG_GROUP_DELETED",
			title: "BO_GROUPMGMT_TIT_DEL_GROUP",
			dialog: "BO_GROUPMGMT_INS_DEL_GROUP"
		}
	},

	/*getODataPath: function() {
		// can be redefined if OData Model is needed;
		return "/TagGroups";
	}, */

	createModel: function(iId) {
		/*var bEdit = this.isInEditMode();
		var oReadSourceSettings = {
			onlyRoot: false
		};

		if (!bEdit) {
			oReadSourceSettings.onlyRoot = true;
		} */

		if (!this.oModel) {
			this.oModel = new sap.ui.ino.models.object.TagGroupStage(iId > 0 ? iId : undefined, {
				actions: ["create", "update", "modify", "del", "cancel"],
				nodes: ["Root", "AssignmentTags"],
				continuousUse: true,
				concurrencyEnabled: true
			});
		}

		// we also need an oData Model
		//this.bindODataModel(iId);

		if (iId && iId > 0) {
			this.getView().bindElement("/TagGroups(" + iId + ")");
		}

		return this.oModel;
	},

	onInit: function() {
		sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
		this.triggerRefreshOnClose = false;
	},

	onSave: function() {
		var that = this;
		var bMessage = false;
		this.getView().resetBindingLookup();
		var aFlatObjects = this.convertToFlatList(this.getModel().oData.AssignmentTags, false);

		jQuery.each(aFlatObjects, function(index, oFlatObject) {
			if (oFlatObject.ID < 0 && (oFlatObject.TAG_ID === "" || !oFlatObject.TAG_ID)) {
				bMessage = true;
				return false;
			}
		});
		if (bMessage) {
			//MSGCRT
			this.setFacetMessage(sap.ui.core.MessageType.Error, "MSG_TAG_GROUP_NOT_FILL_VALUE");
			return;
		}
		this.normalizeFirstLevelSequenceNo(this.getModel().oData.AssignmentTags);
		var oSaveRequest = sap.ui.ino.models.object.TagGroupStage.updateTagGroup(this.oModel.getData());
		oSaveRequest.done(function(oResponse) {
			return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(that, arguments);
		});
		oSaveRequest.fail(function(oResponse) {
			for (var i = oResponse.MESSAGES.length - 1; i >= 0; i--) {
				var oView = that.getView();
				var oMessage = oView.addBackendMessage(oResponse.MESSAGES[i], "configuration_taggroup");
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
			}

		});
	},

	shouldTriggerRefreshOnClose: function() {
		return this.triggerRefreshOnClose;
	},
	onDelete: function() {
		var that = this;
		var iID = this.oModel.getData().ID;
		var oODataModel = new sap.ui.model.odata.ODataModel(Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE"), true);
		oODataModel.read("/GroupAssigned?$filter=GROUP_ID eq " + iID, null, null, false, function(oResponse) {
			if (oResponse.results && oResponse.results.length > 0) {
				var oView = that.getView();
				var oModel = that.getModel("applicationObject");
				oModel.setProperty("/AssignedGroup", oResponse.results);
				oView.oDeletionDialog.setModel(oModel, that.getModelName());
				var oBinding = {
					path: oView.getFormatterPath("AssignedGroup", true)
				};
				oView.oTableDisplay.bindRows(oBinding);
				oView.oDeletionDialog.open();
			} else {
				return sap.ui.ino.views.common.ThingInspectorAOController.onDelete.apply(that, arguments);
			}
		});

	},
	normalizeFirstLevelSequenceNo: function(aAssignmentTags) {

		var iSequenceNo = 0;
		for (var i = 0; i < aAssignmentTags.length; i++) {
			iSequenceNo++;
			aAssignmentTags[i].SEQUENCE_NO = iSequenceNo;
			//aAssignmentTagAndGroup[i].OBJECT_TYPE_CODE = "TAG";
		}
	},
	onDeletionOKPressed: function() {
		var oView = this.getView();
		oView.oDeletionDialog.close();
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
	hasPendingChanges: function() {
		var oModel = this.getModel();
		var oBeforeData = oModel.getBeforeData();
		var oCurrentData = oModel.getData();

		var bResult = sap.ui.ino.views.common.ThingInspectorAOController.hasPendingChanges.apply(this, arguments);
		if (bResult) {
			return bResult;
		} else {
		    if(oBeforeData){
    			var aBeforeChildrenData = [];
    			var aCurrentChildrenData = [];
    			aBeforeChildrenData = this.getChildrenData(oBeforeData.AssignmentTags);
    			aCurrentChildrenData = this.getChildrenData(oCurrentData.AssignmentTags);
    
    			if (aBeforeChildrenData.length !== aCurrentChildrenData.length) {
    				bResult = true;
    				return bResult;
    			}
    			jQuery.each(aCurrentChildrenData, function(idx1, oCurrentChild ) {
                     if(oCurrentChild.ID < 0)
                    {
                        bResult = true;
                        return;
                    }
    				jQuery.each(aBeforeChildrenData, function(idx2, oBeforeChild) {
    					if (oBeforeChild.ID === oCurrentChild.ID && (oBeforeChild.OBJECT_TYPE_CODE !== oCurrentChild.OBJECT_TYPE_CODE || oBeforeChild.SEQUENCE_NO !==
    						oCurrentChild.SEQUENCE_NO || oBeforeChild.TAG_GROUP_ID !== oCurrentChild.TAG_GROUP_ID || oBeforeChild.TAG_ID !== oCurrentChild.TAG_ID
    					)) {
    						bResult = true;
    						return;
    					}
    				});
    				if (bResult) {
    					return;
    				}
    			});
		    }
			return bResult;
		}
	},
	getChildrenData: function(aObjets) {
		var aResult = [];
		jQuery.each(aObjets, function(index,oAssignmentTag) {
			if (oAssignmentTag.children && oAssignmentTag.children.length > 0) {
				aResult.push(oAssignmentTag);
			}
		});
		aResult = this.deleteDuplicateRecords(this.convertToFlatList(aResult, false));
		return aResult;
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

	}
	/*
    onEnterEditMode : function() {
        // clear model to be recreated
        this.oModel = null;
    },

    onExitEditMode : function() {
        // clear model to be recreated
        this.oModel = null;
    }*/
}));