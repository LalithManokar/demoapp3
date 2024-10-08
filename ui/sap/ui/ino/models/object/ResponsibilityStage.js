/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.ResponsibilityStage");

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
	jQuery.sap.require("sap.ui.ino.application.Message");

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.ResponsibilityStage", {
		objectName: "sap.ino.xs.object.subresponsibility.ResponsibilityStage",

		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingSubresponsibility", {}),

		invalidation: {
			entitySets: ["StagingSubresponsibility", "StagingSubResponsibilitySearch","ResponsibilityStage"]
		},

		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				return {
					"ID": -1,
					"PLAIN_CODE": "",
					"DEFAULT_TEXT": "",
					"DEFAULT_LONG_TEXT": "",
					"IS_PUBLIC": 0
				};
			},
			onRead: function(oData, oObjectInstance) {
				var oDataHierarchy = oData;

				if (oDataHierarchy.RespValues) {
					for (var index = 0; index < oDataHierarchy.RespValues.length; index++) {
						oDataHierarchy.RespValues[index].DefaultCoaches = [{
							IDENTITY_ID: null,
							NAME: ''
							}];
						if (oDataHierarchy.RespValues[index].Coaches) {
							for (var j = 0; j < oDataHierarchy.RespValues[index].Coaches.length; j++) {
								if (oDataHierarchy.RespValues[index].Coaches[j].TYPE_CODE !== "GROUP") {
									oDataHierarchy.RespValues[index].DefaultCoaches.push({
										IDENTITY_ID: oDataHierarchy.RespValues[index].Coaches[j].IDENTITY_ID,
										NAME: oDataHierarchy.RespValues[index].Coaches[j].NAME
									});
								}
							}
						}
					}
					oDataHierarchy.RespValues = convertToHierarchy(oDataHierarchy.RespValues, "ID", "PARENT_VALUE_ID");
					oDataHierarchy.RespValues = sortObjectArray(oDataHierarchy.RespValues, "SEQUENCE_NO");
				}

				return oDataHierarchy;

			},
			onNormalizeData: function(oData) {
				// transform to flat data
				var oDataFlat = oData;

				if (oDataFlat.RespValues) {
					oDataFlat.RespValues = convertToFlatList(oDataFlat.RespValues);
				}

				return oDataFlat;
			}
		},
		addSibling: addSibling,
		addSubRespValue: addSubRespValue,
		copyRespValue: copyRespValue,
		moveRespValueUp: moveRespValueUp,
		moveRespValueDown: moveRespValueDown,
		removeRespValue: removeRespValue,
		getRespValuesByParentValueId: getRespValuesByParentValueId,
		addTag: addTag,
		addChild: addChild,
		sortRespValuesByName:sortRespValuesByName
	});

	function normalizeSequenceNo(aRespValues, iSequenceNo) {

		if (iSequenceNo === undefined) {
			iSequenceNo = 0;
		}

		for (var i = 0; i < aRespValues.length; i++) {
			iSequenceNo++;
			aRespValues[i].SEQUENCE_NO = iSequenceNo;
			if (aRespValues[i].children) {
				iSequenceNo = normalizeSequenceNo(aRespValues[i].children, iSequenceNo);
			}
		}
		//return it as an int is "call by value"
		return iSequenceNo;
	}

	function convertToFlatList(aObjects) {
		var aFlatObjects = [];
		if (!aObjects) {
			return aFlatObjects;
		}
		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i]) {
				var aChildFlatObject = [];
				aObjects[i].IS_DEACTIVE = !aObjects[i].IS_ACTIVE ? 1 : 0;
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

	function createStructure(aNodes, sParentKeyName) {
		var aObjects = {
			root: []
		};
		for (var i = 0; i < aNodes.length; i++) {
			var sProName = "Pro_" + aNodes[i][sParentKeyName];
			if (!aNodes[i].children || !jQuery.isArray(aNodes[i].children)) {
				aNodes[i].children = []; // create empty array for children later
			}
			if (isNaN(parseInt(aNodes[i][sParentKeyName], 10))) {
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

	function arrToHierarchy(oTreeNode, aNodeObjects, sKeyName) {
		if (!oTreeNode || oTreeNode.length === 0) {
			return;
		}
		for (var i = 0; i < oTreeNode.length; i++) {
			var sProName = "Pro_" + oTreeNode[i][sKeyName];
			if (aNodeObjects.hasOwnProperty(sProName)) {
				oTreeNode[i].children = aNodeObjects[sProName];
				arrToHierarchy(oTreeNode[i].children, aNodeObjects, sKeyName);
			}
		}
	}

	function convertToHierarchy(aObjects, sKeyName, sParentKeyName) {
		var aNodeObjects = createStructure(aObjects, sParentKeyName);
		var oTreeNode = aNodeObjects.root;
		arrToHierarchy(oTreeNode, aNodeObjects, sKeyName);
		return oTreeNode;
	}

	// Get PrespVlaues from Children level 
	function getRespValuesFromChildByParentValueID(sParentValueId, aRespValues, aTargetValues) {
		if (aRespValues && aRespValues.length !== 0) {
			for (var i = 0; i < aRespValues.length; i++) {
				if (aRespValues[i].PARENT_VALUE_ID === sParentValueId) {
					aTargetValues = aRespValues;
					return aTargetValues;
				} else if (aRespValues[i].children && aRespValues[i].children.length !== 0) {
					aTargetValues = getRespValuesFromChildByParentValueID(sParentValueId, aRespValues[i].children, aTargetValues);
				}
			}
			return aTargetValues;
		}

		return aTargetValues;
	}

	function getRespValuesByParentValueId(sParentValueId) {
		var oData = this.getData();
		var aRespValues = null;

		if (sParentValueId === null) {
			aRespValues = oData.RespValues;
		} else {
			aRespValues = getRespValuesFromChildByParentValueID(sParentValueId, oData.RespValues, aRespValues);
		}

		return aRespValues;
	}

	function getPreviousRespValue(aRespValues, oRespValue, oPreviousValue) {

		if (aRespValues && aRespValues.length !== 0) {
			for (var i = 0; i < aRespValues.length; i++) {
				if (aRespValues[i].ID === oRespValue.ID) {
					oPreviousValue = aRespValues[i - 1];
					return oPreviousValue;
				} else if (aRespValues[i].children && aRespValues[i].children.length !== 0) {
					oPreviousValue = getPreviousRespValue(aRespValues[i].children, oRespValue, oPreviousValue);
				}
			}

			return oPreviousValue;
		}

		return oPreviousValue;
	}

	function getNextRespValue(aRespValues, oRespValue, oNextValue) {

		if (aRespValues && aRespValues.length !== 0) {
			for (var i = 0; i < aRespValues.length; i++) {
				if (aRespValues[i].ID === oRespValue.ID) {
					oNextValue = aRespValues[i + 1];
					return oNextValue;
				} else if (aRespValues[i].children && aRespValues[i].children.length !== 0) {
					oNextValue = getNextRespValue(aRespValues[i].children, oRespValue, oNextValue);
				}
			}

			return oNextValue;
		}

		return oNextValue;
	}

	function addSibling(sID) {
		var sParentID;
		var oRespValue = {
			"PLAIN_CODE": "",
			"DEFAULT_TEXT": "",
			"SEQUENCE_NO": 0,
			"DEFAULT_LONG_TEXT": "",
			"PARENT_VALUE_CODE": "",
			"PARENT_VALUE_ID": "",
			"ACTIVE": true
		};

		//covert to flatfile

		sParentID = sID;

		var oData = this.getData();
		oData.RespValues = convertToFlatList(oData.RespValues);
		var iNextSequenceNo = getNextSequenceNo(oRespValue, oData.RespValues);

		oRespValue.SEQUENCE_NO = iNextSequenceNo;
		oRespValue.PARENT_VALUE_ID = sParentID;

		if (!sParentID) {
			oRespValue.IS_ACTIVE = 1;
			oRespValue.IS_PARENT_ACTIVE = 1;
		} else {
			jQuery.each(oData.RespValues, function(iID, oParentRespValues) {
				if (oParentRespValues.ID === sParentID) {
					oRespValue.IS_PARENT_ACTIVE = oParentRespValues.IS_ACTIVE;
					oRespValue.IS_ACTIVE = oParentRespValues.IS_ACTIVE;
				}
			});
		}

		var iHandle = this.addChild(oRespValue, "RespValues");

		//sort and get Object again 
		oData = this.getData();
		//child is not added in the hierarchy, so we need to rebuild the hierarchy
		oData.RespValues = convertToHierarchy(oData.RespValues, "ID", "PARENT_VALUE_ID");
		oData.RespValues = sortObjectArray(oData.RespValues, "SEQUENCE_NO");
		this.setData(oData);

		return iHandle;

	}

	function addSubRespValue(sParentID) {

		var oRespValue = {
			"PLAIN_CODE": "",
			"DEFAULT_TEXT": "",
			"SEQUENCE_NO": 0,
			"DEFAULT_LONG_TEXT": "",
			"PARENT_VALUE_CODE": "",
			"PARENT_VALUE_ID": "",
			"ACTIVE": true
		};

		if (sParentID) {
			oRespValue.PARENT_VALUE_ID = sParentID;
		}

		var oData = this.getData();
		oData.RespValues = convertToFlatList(oData.RespValues);
		jQuery.each(oData.RespValues, function(iID, oParentRespValues) {
			if (oParentRespValues.ID === sParentID) {
				oRespValue.IS_PARENT_ACTIVE = oParentRespValues.IS_ACTIVE;
				oRespValue.IS_ACTIVE = oParentRespValues.IS_ACTIVE;
				oRespValue.IS_DEACTIVE = oParentRespValues.IS_ACTIVE ? 1 : 0;
			}
		});

		var iNextSequenceNo = getNextSequenceNo(oRespValue, oData.RespValues);

		oRespValue.SEQUENCE_NO = iNextSequenceNo;

		var iHandle = this.addChild(oRespValue, "RespValues");

		//sort and get Object again 
		oData = this.getData();
		//child is not added in the hierarchy, so we need to rebuild the hierarchy
		oData.RespValues = convertToHierarchy(oData.RespValues, "ID", "PARENT_VALUE_ID");
		oData.RespValues = sortObjectArray(oData.RespValues, "SEQUENCE_NO");
		this.setData(oData);

		return iHandle;
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

	function getNextSequenceNo(oRespValue, aRespValues) {
		var iMaxSequenceNo = 0;
		var iSequenceNo = 1;

		for (var i = 0; i < aRespValues.length; i++) {
			if (aRespValues[i].SEQUENCE_NO > iMaxSequenceNo) {
				iMaxSequenceNo = aRespValues[i].SEQUENCE_NO;
			}
		}
		iSequenceNo = iMaxSequenceNo + 1;

		return iSequenceNo;
	}

	function copyRespValue(sPlainCode, sName, oRespValue) {
		var oNewRespValue = {
			"PLAIN_CODE": sPlainCode,
			"DEFAULT_TEXT": sName,
			"SEQUENCE_NO": 0,
			"DEFAULT_LONG_TEXT": oRespValue.DEFAULT_LONG_TEXT,
			"PARENT_VALUE_CODE": oRespValue.PARENT_VALUE_CODE,
			"PARENT_VALUE_ID": oRespValue.PARENT_VALUE_ID,
			"IS_ACTIVE": oRespValue.IS_ACTIVE,
			"IS_PARENT_ACTIVE": oRespValue.IS_PARENT_ACTIVE,
			"Coaches": JSON.parse(JSON.stringify(oRespValue.Coaches || [])),
			"Experts": JSON.parse(JSON.stringify(oRespValue.Experts || [])),
			"Tags": JSON.parse(JSON.stringify(oRespValue.Tags || []))
		};
		//Copy Coaches/Experts/Tags
		jQuery.each(oNewRespValue.Coaches, function(iID, oCoach) {
			oCoach.ID = "";
		});

		jQuery.each(oNewRespValue.Experts, function(iID, oExpert) {
			oExpert.ID = "";
		});
		jQuery.each(oNewRespValue.Tags, function(iID, oTag) {
			oTag.ID = "";
		});
		var oData = this.getData();

		oData.RespValues = convertToFlatList(oData.RespValues);
		var iNextSequenceNo = getNextSequenceNo(oNewRespValue, oData.RespValues);
		oNewRespValue.SEQUENCE_NO = iNextSequenceNo;
		var iHandle = this.addChild(oNewRespValue, "RespValues");
		//sort and get Object again 
		oData = this.getData();
		//child is not added in the hierarchy, so we need to rebuild the hierarchy
		oData.RespValues = convertToHierarchy(oData.RespValues, "ID", "PARENT_VALUE_ID");
		oData.RespValues = sortObjectArray(oData.RespValues, "SEQUENCE_NO");
		this.setData(oData);
		return iHandle;
	}

	function moveRespValueDown(oRespValue) {
		var oNextValue = null;
		var oData = this.getData();
		var oNextRespValue = getNextRespValue(oData.RespValues, oRespValue, oNextValue);

		if (oNextRespValue) {
			var iNextSequenceNo = oNextRespValue.SEQUENCE_NO;
			oNextRespValue.SEQUENCE_NO = oRespValue.SEQUENCE_NO;
			oRespValue.SEQUENCE_NO = iNextSequenceNo;
			this.updateNode(oRespValue, "RespValues");
			this.updateNode(oNextRespValue, "RespValues");
			//get the data again
			oData = this.getData();
			oData.RespValues = sortObjectArray(oData.RespValues, "SEQUENCE_NO");
			this.setData(oData);
		}
	}

	function moveRespValueUp(oRespValue) {
		var oPreviousValue = null;
		var oData = this.getData();
		var oPreviousRespValue = getPreviousRespValue(oData.RespValues, oRespValue, oPreviousValue);

		if (oPreviousRespValue) {
			var iPreviousSequenceNo = oPreviousRespValue.SEQUENCE_NO;
			oPreviousRespValue.SEQUENCE_NO = oRespValue.SEQUENCE_NO;
			oRespValue.SEQUENCE_NO = iPreviousSequenceNo;
			this.updateNode(oRespValue, "RespValues");
			this.updateNode(oPreviousRespValue, "RespValues");
			//get the data again
			oData = this.getData();
			oData.RespValues = sortObjectArray(oData.RespValues, "SEQUENCE_NO");
			this.setData(oData);
		}
	}

	function removeRespValue(oRespValue) {
		this.removeChild(oRespValue);
	}

	function addTag(oNewTag, sNodeName) {
		var oMessage;
		var aTags = this.getProperty("/" + sNodeName);

		if (!oNewTag.NAME || jQuery.trim(oNewTag.NAME).length === 0) {
			oMessage = new sap.ui.ino.application.Message({
				key: "MSG_INVALID_EMPTY_TAG",
				level: sap.ui.core.MessageType.Error,
				group: "TAG"
			});
			return oMessage;
		}

		oNewTag.NAME = jQuery.trim(oNewTag.NAME);

		if (!oNewTag.TAG_ID && oNewTag.NAME) {
			// Tags are created "on the fly"
			// so for new tags (not only tag assignment)
			// a new handle is used
			oNewTag.TAG_ID = this.getNextHandle();
		}
		var aMatches = [];
		if (aTags) {
			aMatches = jQuery.grep(aTags, function(oTag) {
				return oTag.TAG_ID === oNewTag.TAG_ID;
			});
		}

		if (aMatches.length === 0) {
			this.addChild(oNewTag, sNodeName);
		}
	}

	function addChild(oChild, sNodeName) {
		var oMetadata = this.getApplicationObject().getApplicationObjectMetadata();
		var node = sNodeName;
		if (node) {
			if (sNodeName.indexOf("Coaches") > -1) {
				node = "Coaches";
			} else if (sNodeName.indexOf("Experts") > -1) {
				node = "Experts";
			} else if (sNodeName.indexOf("Tags") > -1) {
				node = "Tags";
			}
		}
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
	
	function sortObjectArrayByName(aObjects, sSortKeyName,sortType) {
		if(sortType === "ASC"){
		  aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] < o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});
		} else {
		  aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] > o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});		    
		}

		for (var i = 0; i < aObjects.length; i++) {
			// if there are children sort them too
			aObjects[i].SEQUENCE_NO = i + 1;
			if (aObjects[i].children) {
				sortObjectArrayByName(aObjects[i].children, sSortKeyName, sortType);
			}
		}

		return aObjects;
	}
	
	function sortRespValuesByName(sortType){
	    var oData = this.getData();
		var aRespValues = oData.RespValues;
		if(aRespValues.length <= 0){
		    return;
		}
		oData.RespValues = sortObjectArrayByName(aRespValues, "DEFAULT_TEXT",sortType);
        normalizeSequenceNo(aRespValues, 0);		
		this.setData(oData);
	}
})();