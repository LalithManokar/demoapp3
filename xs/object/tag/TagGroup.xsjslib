const check = $.import("sap.ino.xs.aof.lib", "check");
const determine = $.import("sap.ino.xs.aof.lib", "determination");
const TagMessage = $.import("sap.ino.xs.object.tag", "message");
const Message = $.import("sap.ino.xs.aof.lib", "message");
const AOF = $.import("sap.ino.xs.aof.core", "framework");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

this.definition = {
	actions: {
		create: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck
		},
		update: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck
		},
		del: {
			authorizationCheck: false
		},
		read: {
			authorizationCheck: false
		},
		deleteTagAssignments: {
			isStatic: true,
			isInternal: true,
			authorizationCheck: false,
			historyEvent: "TAG_ASSIGNMENT_DELETED",
			execute: deleteTagAssignments
		},
		mergeTagAssignments: {
			isStatic: true,
			isInternal: true,
			authorizationCheck: false,
			historyEvent: "TAG_ASSIGNMENT_DELETED",
			execute: mergeTagAssignments
		},
		updateTagGroup: {
			authorizationCheck: false,
			execute: updateTagGroup,
			isStatic: true
		}
	},
	Root: {
		table: "sap.ino.db.tag::t_group_tag",
		sequence: "sap.ino.db.tag::s_group_tag",
		consistencyChecks: [check.duplicateCheck('NAME', TagMessage.DUPLICATE_TAG_GROUP), check.duplicateAlternativeKeyCheck("NAME", TagMessage.DUPLICATE_TAG_GROUP,
			true)],
		determinations: {
			onModify: [determine.systemAdminData, determineTopNumber, determineGroupName]
		},
		nodes: {
			AssignmentTags: {
				table: "sap.ino.db.tag::t_assignment_tag",
				sequence: "sap.ino.db.tag::s_assignment_tag",
				parentKey: "TAG_GROUP_ID",
				attributes: {
					TAG_ID: {
						readOnly: false
					},
					TAG_GROUP_ID: {
						readOnly: false
					},
					ID: {
						isPrimaryKey: true
					},
					OBJECT_TYPE_CODE: {
						readOnly: false
					},
					SEQUENCE_NO: {
						readOnly: false
					}
				}
			}

		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			NAME: {
				required: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		}
	}
};

function modifyExecutionCheck(vKey, oChangeRequest, oTagGroup, oPersistedTagGroup, addMessage, oContext) {
	const MAX_NUMBER = 30;
	//Because of the hierarchy for tag group. no need to check the max number
	// 	if (oChangeRequest.TOP_NUMBER && !/^[0-9]+$/.test(oChangeRequest.TOP_NUMBER)) {
	// 		addMessage(Message.MessageSeverity.Error, TagMessage.TOP_NUMBER_ERROR, vKey, "Root", "TOP_NUMBER");
	// 	}

	// 	if (oChangeRequest.TOP_NUMBER && parseInt(oChangeRequest.TOP_NUMBER, 0) > MAX_NUMBER) {
	// 		addMessage(Message.MessageSeverity.Error, TagMessage.CHECK_TOP_NUMBER, vKey, "Root", "TOP_NUMBER", MAX_NUMBER);
	// 	}

	if (!oTagGroup.NAME) {
		addMessage(Message.MessageSeverity.Error, TagMessage.ATTRIBUTE_REQUIRED, vKey, "Root", "NAME");
	}
}

function determineTopNumber(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	//oWorkObject.TOP_NUMBER = parseInt(oWorkObject.TOP_NUMBER, 0);
}

function determineGroupName(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	oWorkObject.NAME = oWorkObject.NAME.trim();
}

function deleteTagInTaggroup(vKey, oContext) {
	var oHQ = oContext.getHQ();
	var sDelete = 'delete from "sap.ino.db.tag::t_assignment_tag" where TAG_ID = ?';
	var quantityOfDeleted = oHQ.statement(sDelete).execute([vKey]);
	return quantityOfDeleted;
}

function getDeleteTagAssignmentsBulkStatement(oContext) {
	return {
		AssignmentTags: {
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}
	};
}

function getDeleteTagAssignmentsBulkCondition(iTagID) {
	return {
		condition: 'tag_id = ?',
		conditionParameters: [iTagID]
	};
}

function deleteTagAssignments(iTagID, oBulkAccess, addMessage, getNextHandle, oContext) {
	var oStatement = getDeleteTagAssignmentsBulkStatement(oContext);
	var oCondition = getDeleteTagAssignmentsBulkCondition(iTagID);
	var oResponse = oBulkAccess.del(oStatement, oCondition, false);
	addMessage(oResponse.messages);
}

function mergeTagAssignments(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	_.each(oParameters.mergingTagIDs, function(iMergingTagID) {
		var oResponse = oBulkAccess.update({
			AssignmentTags: {
				TAG_ID: oParameters.leadingTagID,
				Root: {
					CHANGED_BY_ID: oContext.getUser().ID,
					CHANGED_AT: oContext.getRequestTimestamp()
				}
			}
		}, {
			condition: 'tag_id = ? ' + 'and tag_group_id not in ' + '(select tag_group_id from "sap.ino.db.tag::t_assignment_tag" as tags2 ' +
				'where tags2.tag_group_id = tags.tag_group_id and tags2.tag_id=?)',
			conditionParameters: [iMergingTagID, oParameters.leadingTagID],
			conditionNodeAlias: "tags"
		});
		addMessage(oResponse.messages);
	});
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

function convertToFlatList(aObjects) {
	var aFlatObjects = [];
	if (!aObjects) {
		return aFlatObjects;
	}
	for (var i = 0; i < aObjects.length; i++) {
		if (aObjects[i]) {
			var aChildFlatObject = [];
			// first get the children
			if (aObjects[i].children && aObjects[i].children.length > 0) {
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

function updateTagGroup(oReq, oBulkAccess, addMessage, oContext) {
	//var oRootId = oReq.ID;
	var aAssignmentTags = oReq.AssignmentTags;
	var aFinalGroupTag = [];
	var aFromSecondGroupTag = [];
	//Filter only from the second level, Group and Tag;
	_.each(aAssignmentTags, function(oAssignmentTag) {
		if (oAssignmentTag.children && oAssignmentTag.children.length > 0) {
			aFromSecondGroupTag.push(oAssignmentTag);
		}
	});
	var aGroupFlat = convertToFlatList(aFromSecondGroupTag);
	var aOtherGroupFlat = deleteDuplicateRecords(aGroupFlat);
	var temp = {};
	_.each(aOtherGroupFlat, function(oTagGroup) {
		if (oTagGroup.OBJECT_TYPE_CODE === "TAG_GROUP") {
			var aChildren = [];
			var iSequenceNO = 0;
			_.each(aOtherGroupFlat, function(oChild) {
				//var aExistedChildren = [];
				if (oChild.TAG_GROUP_ID === oTagGroup.TAG_ID) {
					delete oChild.USAGE_COUNT;
					if (!oChild.SEQUENCE_NO) {
						iSequenceNO++;
						oChild.SEQUENCE_NO = iSequenceNO;
					}
					aChildren.push(oChild);

				}
			});
			if (!temp[oTagGroup.TAG_ID]) {
				temp[oTagGroup.TAG_ID] = true;
				aFinalGroupTag.push({
					groupID: oTagGroup.TAG_ID,
					childrenFlat: aChildren
				});
			}
		}

	});
	var TagGroup = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.tag.TagGroup");
	_.each(aFinalGroupTag, function(oGroup) {
		var oResponse = TagGroup.update({
			ID: oGroup.groupID,
			AssignmentTags: oGroup.childrenFlat
		});
		addMessage(oResponse.messages);
	});

}