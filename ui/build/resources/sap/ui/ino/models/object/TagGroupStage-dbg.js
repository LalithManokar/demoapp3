/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.TagGroupStage");
jQuery.sap.require("sap.ui.ino.application.Configuration");

var Configuration = sap.ui.ino.application.Configuration;
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.TagGroupStage", {
		objectName: "sap.ino.xs.object.tag.TagGroup",

		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("TagGroups", {}),

		invalidation: {
			entitySets: ["TagGroups", "SearchTagGroups"]
		},

		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				return {
					"ID": -1,
					"PLAIN_CODE": "",
					"DEFAULT_TEXT": "",
					"DEFAULT_LONG_TEXT": ""
				};
			},
			onRead: function(oData) {
				var oDataHierarchy = oData;
				var iGroupID = oData.ID;
				var sUrl = Configuration.getBackendRootURL();
				var oServiceData = jQuery.ajax({
					url: sUrl + "/sap/ino/xs/rest/common/tagGroupQuery.xsjs",
					type: "GET",
					dataType: "json",
					data: {
						GROUP_ID: iGroupID
					},
					async: false

				});
				oServiceData.done(function(oResponse) {
					oDataHierarchy.AssignmentTags = oResponse.children;
				// 	normalizeSequenceNo(oDataHierarchy.AssignmentTags);
				    updateGroupTagCount(oDataHierarchy);
					oDataHierarchy.AssignmentTags = sortObjectArray(oDataHierarchy.AssignmentTags, "SEQUENCE_NO");
				});

				return oDataHierarchy;
			},
			onNormalizeData: function(oData) {
				// transform to flat data
				var oDataFlat = oData;
				if (oDataFlat.AssignmentTags) {
					oDataFlat.AssignmentTags = convertToFlatStructure(oDataFlat.AssignmentTags);
				}
				return oDataFlat;
			}
		},
		getAssignmentTagGroupByParentValueId: getAssignmentTagGroupByParentValueId,
		addSibling: addSibling,
		removeTagorGroup: removeTagorGroup,
		addSubTagorGroup: addSubTagorGroup,
		addChild: addChild
	});
	function updateGroupTagCount(oHirachy) {
		var aHirachyTags = oHirachy.AssignmentTags;
		var aFlatAssignedTags = convertToFlatListNodelete(aHirachyTags, false);
		var aAssignedTags = [];
		aAssignedTags = jQuery.grep(aFlatAssignedTags, function(oAssignedObject) {
			return oAssignedObject.OBJECT_TYPE_CODE !== "TAG_GROUP";
		});
     oHirachy.TAGS_COUNT = aAssignedTags.length;
     oHirachy.COUNT_OF_TAGS = aAssignedTags.length;
	}
	function arrToHierarchy(oTreeNode, aNodeObjects, sKeyName) {
		if (!oTreeNode || oTreeNode.length === 0) {
			return;
		}
		for (var i = 0; i < oTreeNode.length; i++) {
			var sProName = "Pro_" + oTreeNode[i][sKeyName];
			if (aNodeObjects.hasOwnProperty(sProName) && oTreeNode[i].OBJECT_TYPE_CODE === "TAG_GROUP") {
				oTreeNode[i].children = aNodeObjects[sProName];
				arrToHierarchy(oTreeNode[i].children, aNodeObjects, sKeyName);
			}
		}
	}

	function createStructure(aNodes, sParentID, sParentKeyName) {
		var aObjects = {
			root: []
		};
		for (var i = 0; i < aNodes.length; i++) {
			var sProName = "Pro_" + aNodes[i][sParentKeyName];
			//var sProName = "Pro_" + aNodes[i].TAG_ID;
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
	}

	function convertToHierarchy(aObjects, sParentID, sKeyName, sParentKeyName) {
		var aNodeObjects = createStructure(aObjects, sParentID, sParentKeyName);
		var oTreeNode = aNodeObjects.root;
		arrToHierarchy(oTreeNode, aNodeObjects, sKeyName);
		return oTreeNode;
	}

	function sortObjectArray(aObjects, sSortKeyName) {
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
				sortObjectArray(aObjects[i].children, sSortKeyName);
			}
		}
		return aObjects;
	}

	// Get PrespVlaues from Children level 
	function getTagGroupFromChildByParentValueID(sParentValueId, aRespValues, aTargetValues) {
		if (aRespValues && aRespValues.length !== 0) {
			for (var i = 0; i < aRespValues.length; i++) {
				if (aRespValues[i].PARENT_VALUE_ID === sParentValueId) {
					aTargetValues = aRespValues;
					return aTargetValues;
				} else if (aRespValues[i].children && aRespValues[i].children.length !== 0) {
					aTargetValues = getTagGroupFromChildByParentValueID(sParentValueId, aRespValues[i].children, aTargetValues);
				}
			}
			return aTargetValues;
		}

		return aTargetValues;
	}

	function getAssignmentTagGroupByParentValueId(sParentValueId) {
		var oData = this.getData();
		var aRespValues = null;

		if (sParentValueId === null) {
			aRespValues = oData.RespValues;
		} else {
			aRespValues = getTagGroupFromChildByParentValueID(sParentValueId, oData.RespValues, aRespValues);
		}

		return aRespValues;
	}

	// 	function normalizeSequenceNo(aAssignmentTagAndGroup) {

	// 		var iSequenceNo = 0;
	// 			for (var i = 0; i < aAssignmentTagAndGroup.length; i++) {
	// 				iSequenceNo++;
	// 				aAssignmentTagAndGroup[i].SEQUENCE_NO = iSequenceNo;
	// 				//aAssignmentTagAndGroup[i].OBJECT_TYPE_CODE = "TAG";
	// 			}
	// 	}
	function normalizeSequenceNo(aAssignmentTags) {
		if (!aAssignmentTags[0].SEQUENCE_NO) {
			var iSequenceNo = 0;
			for (var i = 0; i < aAssignmentTags.length; i++) {
				iSequenceNo++;
				aAssignmentTags[i].SEQUENCE_NO = iSequenceNo;
				aAssignmentTags[i].OBJECT_TYPE_CODE = "TAG";
				if (aAssignmentTags[i].children && aAssignmentTags[i].children.length > 0) {
					normalizeSequenceNo(aAssignmentTags[i].children);
				}
			}
		}
	}

	function convertToFlatStructure(aObjects) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				// first get the children
				// if (aObjects[i].children && aObjects[i].children.length > 0) {
				// 	aChildFlatObject = convertGroupData(aObjects[i].children);

				// }
				delete aObjects[i].children;
				aFlatObjects.push(aObjects[i]);
				// add the children if there are any
				// if (aChildFlatObject.length > 0) {
				// 	aFlatObjects = aFlatObjects.concat(aChildFlatObject);
				// }
			}
		}

		return aFlatObjects;

	}

	function convertGroupData(aObjects) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				// first get the children
				if (aObjects[i].children && aObjects[i].children.length > 0) {
					aChildFlatObject = convertGroupData(aObjects[i].children);
					aFlatObjects.push(aObjects[i]);
				}
				if (aObjects[i].ID < 0) {
					aFlatObjects.push(aObjects[i]);
				}
				delete aObjects[i].children;
				// add the children if there are any
				if (aChildFlatObject.length > 0) {
					aFlatObjects = aFlatObjects.concat(aChildFlatObject);
				}
			}
		}

		return aFlatObjects;

	}

	function convertToFlatList(aObjects) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				// first get the children
				if (aObjects[i].children) {
					aChildFlatObject = convertToFlatList(aObjects[i].children);
				}
				delete aObjects[i].children;
				aFlatObjects.push(aObjects[i]);
				// add the children if there are any
				if (aChildFlatObject.length > 0) {
					aFlatObjects = aFlatObjects.concat(aChildFlatObject);
				}
			}
		}

		return aFlatObjects;
	}
	function convertToFlatListNodelete (aObjects, bRelease) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				// first get the children
				if (aObjects[i].children) {
					aChildFlatObject = convertToFlatListNodelete(aObjects[i].children, bRelease);
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
	}
	function getNextSequenceNo(oAssigmentValue, AssignmentTagAndGroup) {
		var iMaxSequenceNo = 0;
		var iSequenceNo = 1;

		for (var i = 0; i < AssignmentTagAndGroup.length; i++) {
			if (!AssignmentTagAndGroup[i].SEQUENCE_NO && oAssigmentValue.TAG_GROUP_ID === AssignmentTagAndGroup[i].TAG_GROUP_ID) {
				iMaxSequenceNo++;
				//AssignmentTagAndGroup[i].SEQUENCE_NO = iMaxSequenceNo;
			} else {
				if (oAssigmentValue.TAG_GROUP_ID === AssignmentTagAndGroup[i].TAG_GROUP_ID && AssignmentTagAndGroup[i].SEQUENCE_NO > iMaxSequenceNo) {
					iMaxSequenceNo = AssignmentTagAndGroup[i].SEQUENCE_NO;
				}

			}
		}
		iSequenceNo = iMaxSequenceNo + 1;

		return iSequenceNo;
	}

	function addSibling(sID) {
		var sParentID;
		var oAssigmentValue = {
			"TAG_ID": "",
			"TAG_GROUP_ID": "",
			"OBJECT_TYPE_CODE": ""
		};

		//covert to flatfile

		sParentID = sID;
		oAssigmentValue.TAG_GROUP_ID = sParentID;
		var oData = this.getData();
		oData.AssignmentTags = convertToFlatList(oData.AssignmentTags);
		oData.AssignmentTags = deleteDuplicateRecords(oData.AssignmentTags);
		var iNextSequenceNo = getNextSequenceNo(oAssigmentValue, oData.AssignmentTags);

		oAssigmentValue.SEQUENCE_NO = iNextSequenceNo;
		var iHandle = this.addChild(oAssigmentValue, "AssignmentTags");

		//sort and get Object again 
		oData = this.getData();

		//child is not added in the hierarchy, so we need to rebuild the hierarchy
		oData.AssignmentTags = convertToHierarchy(oData.AssignmentTags, oData.ID, "TAG_ID", "TAG_GROUP_ID");
		oData.AssignmentTags = sortObjectArray(oData.AssignmentTags, "SEQUENCE_NO");
		this.setData(oData);

		return iHandle;

	}

	function deleteDuplicateRecords(arry) {
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

	function addChild(oChild, sNodeName) {
		var oMetadata = this.getApplicationObject().getApplicationObjectMetadata();
		var node = sNodeName;
		var oNodeMetadata = oMetadata.nodes[node];
		if (!oNodeMetadata) {
			jQuery.sap.log.error(sNodeName + " in " + this.getObjectName() + " is not known");
			return 0;
		}

		var iHandle = this.getNextHandle();
		oChild[oNodeMetadata.primaryKey] = iHandle;
		var oNodeArray = this.getProperty("/" + sNodeName);
				if (!oNodeArray) {
					oNodeArray = [];
					this.setProperty("/" + sNodeName, oNodeArray);
				}
		oNodeArray.push(oChild);
		this.checkUpdate(true);
		return iHandle;
	}

	function removeTagorGroup(oTagGroup) {
		var aFlatAssignedTags = convertToFlatList(this.getProperty("/AssignmentTags"));
		var aAcutalFlatAssignedTags = deleteDuplicateRecords(aFlatAssignedTags);
		var aExistTags = jQuery.grep(aAcutalFlatAssignedTags, function(oAssignment) {
			return oAssignment.ID !== oTagGroup.ID;
		});
		this.setProperty("/AssignmentTags", convertToHierarchy(aExistTags, this.oData.ID, "TAG_ID", "TAG_GROUP_ID"));
		//this.removeChild(oTagGroup);
	}

	function addSubTagorGroup(sParentID) {
		var oAssignmentTagorGroup = {
			"TAG_ID": "",
			"TAG_GROUP_ID": "",
			"OBJECT_TYPE_CODE": "TAG"
		};

		if (sParentID) {
			oAssignmentTagorGroup.TAG_GROUP_ID = sParentID;
		}

		var oData = this.getData();
		oData.AssignmentTags = convertToFlatList(oData.AssignmentTags);
		oData.AssignmentTags = deleteDuplicateRecords(oData.AssignmentTags);
		var iNextSequenceNo = getNextSequenceNo(oAssignmentTagorGroup, oData.AssignmentTags);

		oAssignmentTagorGroup.SEQUENCE_NO = iNextSequenceNo;

		var iHandle = this.addChild(oAssignmentTagorGroup, "AssignmentTags");

		//sort and get Object again 
		oData = this.getData();
		var sRootID = this.getData().ID;
		//child is not added in the hierarchy, so we need to rebuild the hierarchy
		oData.AssignmentTags = convertToHierarchy(oData.AssignmentTags, sRootID, "TAG_ID", "TAG_GROUP_ID");
		oData.AssignmentTags = sortObjectArray(oData.AssignmentTags, "SEQUENCE_NO");
		this.setData(oData);

		return iHandle;

	}

})();