const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = hQuery.hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var tagGroupID;
if ($.request.method === 1) {
	tagGroupID = $.request.parameters.get("GROUP_ID");
	var aTagGroup = [];
	var oTagObjectQuery, oTagObjectGroupQuery, oTagObject;
	var newNodes, finalRes;
	var aAllRootTagGroup = [];
	if (tagGroupID) {

		oTagObject = newTagObject();

		aTagGroup = findTagGroup(tagGroupID);

		setTagGroupID(oTagObject, tagGroupID);
		setTag(oTagObject, tagGroupID);
		var bPost = false;
		newNodes = tagIterator(aTagGroup, bPost);
		finalRes = setNodes(oTagObject, newNodes);
	} else {
	
		var aAllRootGroupId = GetAllRootTagGroup();
		aAllRootGroupId.forEach(function(object) {
			oTagObject = newTagListObject();
			tagGroupID = object.ID;
			aTagGroup = findTagGroup(tagGroupID);

			setTagGroupProperties(oTagObject, object);
			//setTag(oTagObject, tagGroupID);
			var bPost = false;
			newNodes = tagIteratorWithoutTag(aTagGroup, bPost,[]);
			finalRes = setNodes(oTagObject, newNodes);
			aAllRootTagGroup.push(finalRes);
		});
	}
	var JSONstr;
	if (aAllRootTagGroup.length > 0) {
		JSONstr = JSON.stringify(aAllRootTagGroup, null, 4);
	} else {
		JSONstr = JSON.stringify(finalRes, null, 4);
	}
	$.response.contentType = "applition/json";
	$.response.setBody(JSONstr);
} else if ($.request.method === 3) {
	var aTagGroup = [];
	var request = $.request;
	var bodyAsString = request.body.asString();
	var jsonText = JSON.parse(bodyAsString);
	var oTagObjectQuery, oTagObjectGroupQuery, oTagObject;
	oTagObject = newTagObject();
	tagGroupID = jsonText.GROUP_ID;
	var aOtherGroup = jsonText.TagList[jsonText.TagList.length - 1].GROUP_TAGS;
	if (tagGroupID === null) {
		aOtherGroup = LoopOtherGroup(aOtherGroup);
		JSONstr = JSON.stringify(aOtherGroup, null, 4);
		$.response.contentType = "applition/json";
		$.response.setBody(JSONstr);

	} else {
		var allTagArray = getAllTag(jsonText.TagList);
		var finalRes;
		if (jsonText.TagHierarchy) {
			finalRes = tagObjectRecursion(jsonText.TagHierarchy, allTagArray);
		} else {
			aTagGroup = findTagGroup(tagGroupID);
			setTagGroupID(oTagObject, tagGroupID);
			setTagFromUse(oTagObject, tagGroupID, allTagArray);
			var bPost = true;
			var newNodes = tagIterator(aTagGroup, bPost, allTagArray);
			finalRes = setNodes(oTagObject, newNodes);
		}
		var JSONstr = JSON.stringify(finalRes, null, 4);
		$.response.contentType = "applition/json";
		$.response.setBody(JSONstr);
	}
}

function GetAllRootTagGroup() {
	var aRootTagResult = oHQ.statement(
		"select * from\"sap.ino.db.tag::t_group_tag\" as tagGroup where tagGroup.id not in(select assign.tag_id from\"sap.ino.db.tag::v_assignment_tag_and_group\" as assign where assign.tag_id is not null and assign.object_type_code = 'TAG_GROUP')"
	).execute();
	return aRootTagResult;
}

function LoopOtherGroup(aOtherGroup) {
	aOtherGroup.forEach(function(object) {
		object.checked = "Unchecked";
	});
	return aOtherGroup;
}

function getAllTag(req) {
	var aTagList = [];
	if (req.length > 0) {
		_.each(req, function(object, index) {

			aTagList = aTagList.concat(object.GROUP_TAGS);

		});
	}
	return aTagList;
}

function tagIteratorWithoutTag(aTagGroup, bPost, allTagArray) {
	if (aTagGroup.length > 0) {
		_.each(aTagGroup, function(object, index, list) {

			tagGroupID = object.TAG_ID;
			object.children = [];
			object.ACTION = object.TAG_ID + "";
			object.FILTER = undefined;
			object.TEXT = object.NAME;
            object.DEFAULT_SORT = "NAME";
            object.HIERARCHY_LEVEL = "1";
            object.VISIBLE = true;

			var aTagGroup = findTagGroup(tagGroupID);

			var newNodes = tagIteratorWithoutTag(aTagGroup, bPost, allTagArray);
			setNodes(object, newNodes);
		});
	}
	return aTagGroup;
}

function tagIterator(aTagGroup, bPost, allTagArray) {
	if (aTagGroup.length > 0) {
		_.each(aTagGroup, function(object, index, list) {

			tagGroupID = object.TAG_ID;
			object.children = [];
			object.bDisplay = true;
			object.checked = "Unchecked";
			if (bPost) {
				setTagFromUse(object, tagGroupID, allTagArray);
			} else {
				setTag(object, tagGroupID);
			}

			var aTagGroup = findTagGroup(tagGroupID);

			var newNodes = tagIterator(aTagGroup, bPost, allTagArray);
			setNodes(object, newNodes);
		});
	}
	return aTagGroup;
}

function findTagGroup(tagGroupID) {
	var aTagGroupResult = oHQ.statement(
		'select * from"sap.ino.db.tag::v_assignment_tag_and_group" where tag_group_id = ? and object_type_code = ?  order by SEQUENCE_NO').execute(tagGroupID,
		"TAG_GROUP");

	return aTagGroupResult;
}

function setTag(oObject, tagGroupID) {
	var aTagResult = oHQ.statement(
		'select * from"sap.ino.db.tag::v_assignment_tag_and_group" where tag_group_id = ? and (object_type_code is null or object_type_code = ? ) order by SEQUENCE_NO'
	).execute(tagGroupID, "TAG");
	oObject.children = oObject.children.concat(aTagResult);
	return oObject;
}

function setTagFromUse(oObject, tagGroupID, aTaglist) {
	var aTagResult = oHQ.statement(
		'select * from"sap.ino.db.tag::v_assignment_tag_and_group" where tag_group_id = ? and (object_type_code is null or object_type_code = ? ) order by SEQUENCE_NO'
	).execute(tagGroupID, "TAG");
	var newTagList = [];
	_.each(aTagResult, function(aTagResultObject, index1) {
		var bNeed = false;
		var oTag = aTagResultObject;
		_.each(aTaglist, function(object, index2) {
			if (!bNeed) {
				bNeed = oTag.TAG_ID !== object.ID ? false : true;
			}
		});
		if (bNeed) {
			aTagResultObject.checked = "Unchecked";
			aTagResultObject.bDisplay = true;
			oObject.children.push(aTagResultObject);
			bNeed = false;
		} else {
			aTagResultObject.checked = "Unchecked";
			aTagResultObject.bDisplay = false;
		}

	});

	return oObject;
}

function setNodes(oObject, aNodes) {

	oObject.children = oObject.children.concat(aNodes);
	return oObject;
}

function newTagObject() {
	var oTagObject = {
		tagGroupID: "",
		checked: "Unchecked",
		bDisplay: true,
		children: []
	};
	return oTagObject;

}

function newTagListObject() {
	var oTagObject = {
		tagGroupID: "",
		ACTION : "",
        FILTER : undefined,
        DEFAULT_SORT : "NAME",
        HIERARCHY_LEVEL: "1",
        VISIBLE: true,
		children: []
	};
	return oTagObject;

}

function setTagGroupID(oObject, sId) {
	oObject.tagGroupID = sId;
	return oObject;
}

function setTagGroupProperties(oObject,oTagGroupObject){
    oObject.tagGroupID = oTagGroupObject.ID;
    oObject.NAME = oTagGroupObject.NAME;
    oObject.TEXT = oTagGroupObject.NAME;
    oObject.ACTION = oTagGroupObject.ID + "";
	return oObject;
}

function tagObjectRecursion(oTag, aTaglist) {
	// 	for (var i = oTag.children.length - 1; i >= 0; i--) {
	_.each(oTag.children, function(aChild) {
		var object = aChild;
		var bNeed = false;
		if (object.children) {
			tagObjectRecursion(aChild, aTaglist);
		} else {
			var oChildTag = object;
			_.each(aTaglist, function(oTagItem) {
				if (!bNeed) {
					bNeed = oChildTag.TAG_ID !== oTagItem.ID ? false : true;
				}
			});
			if (bNeed) {
				oChildTag.bDisplay = true;
				bNeed = false;
			} else {
				oChildTag.bDisplay = false;
			}
		}
	});

	return oTag;
}