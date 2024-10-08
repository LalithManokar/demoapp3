var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

var TypeCode = $.import("sap.ino.xs.object.iam", "TypeCode");
var SourceTypeCode = $.import("sap.ino.xs.object.iam", "SourceTypeCode");

var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

var bBatchMode = false;

function setBatchMode() {
	bBatchMode = true;
}

var aGroupId = [];

function finalizeBatchMode(oHQ) {
	if (aGroupId && aGroupId.length > 0) {
		oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_update_identity_group_member_transitive").execute();
	}
	aGroupId = [];
}

function registerForBatchFinalization(iGroupId) {
	aGroupId.push({
		ID: iGroupId
	});
}

this.definition = {
	Root: {
		table: "sap.ino.db.iam::t_identity",
		sequence: "sap.ino.db.iam::s_identity",
		historyTable: "sap.ino.db.iam::t_identity_h",
		determinations: {
			onModify: [determine.systemAdminData],
			onPersist: [recomputeMembers]
		},
		consistencyChecks: [check.duplicateCheck('NAME', IAMMessage.IDENTITY_NAME_UNIQUE), check.duplicateAlternativeKeyCheck("NAME", IAMMessage.IDENTITY_NAME_UNIQUE)],
		attributes: {
			TYPE_CODE: {
				constantKey: TypeCode.TypeCode.Group,
				foreignKeyTo: "sap.ino.xs.object.iam.TypeCode.Root"
			},
			SOURCE_TYPE_CODE: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.SourceTypeCode.Root"
			},
			ERASED: {
				constantKey: 0
			},
			STAGED: {
				constantKey: 0
			},
			USER_NAME: {
				required: false
			},
			NAME: {
				required: true,
				isName: true
			}
		},

		nodes: {
			Members: {
				table: "sap.ino.db.iam::t_identity_group_member",
				sequence: "sap.ino.db.iam::s_identity_group_member",
				historyTable: "sap.ino.db.iam::t_identity_group_member_h",
				parentKey: "GROUP_ID",
				consistencyChecks: [check.duplicateCheck("MEMBER_ID", IAMMessage.IDENTITY_DUPLICATE_IDENTITY_ASSIGNMENT), memberCheck],
				attributes: {
					MEMBER_ID: {
						required: true,
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			GroupAttribute: {
				table: "sap.ino.db.iam::t_group_attribute",
				sequence: "sap.ino.db.iam::s_group_attribute",
				parentKey: "GROUP_ID",
				attributes: {

				}
			},
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Identity)
		}
	},
	actions: {
		// Because these are administrative functions
		// all INSTANCE authorization checks are disabled.
		// Authorizations must be enforced by end point protection.
		create: {
			authorizationCheck: false,
			historyEvent: "IDENTITY_CREATED"
		},
		update: {
			authorizationCheck: false,
			historyEvent: "IDENTITY_UPDATED",
			enabledCheck: updateEnabledCheck
		},
		del: {
			authorizationCheck: false,
			historyEvent: "IDENTITY_DELETED",
			enabledCheck: deleteEnabledCheck,
			persist: deleteAndDeleteMemberAssignments
		},
		read: {
			authorizationCheck: false
		},
		getMemberShip: {
			authorizationCheck: false,
			execute: getMemberShip,
			isStatic: true
		},
		updateMemberShip: {
			authorizationCheck: false,
			execute: updateMemberShip,
			isStatic: true
		}
		// getMemberGroups: {
		//     authorizationCheck : false,
		//     execute: getMemberGroup,
		//     isStatic: true
		// }
		// assignMemberGroup: {
		//     authorizationCheck : false,
		//     execute: assignMemberGroup,
		//     historyEvent : "IDENTITY_UPDATED",
		//     massActionName: "massAssignMemberGroup"
		// }
	}
};

function memberCheck(vKey, oWorkObjectNode, addMessage, oContext) {
	var oGroup = oContext.getProcessedObject();
	_.each(oWorkObjectNode, function(oMember) {
		if (oMember.MEMBER_ID && oMember.MEMBER_ID == oGroup.ID) {
			// a member of the group cannot be the group itself
			addMessage(Message.MessageSeverity.Error, IAMMessage.GROUP_MEMBER_RECURSION, oMember.ID, "Members", "MEMBER_ID", oGroup.NAME);
		}
	});
}

function recomputeGroupMembers(iGroupId, oHQ) {
	if (bBatchMode) {
		registerForBatchFinalization(iGroupId);
	} else {
		oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_update_delta_identity_group_member_transitive")
			.execute({
				IT_MEMBER_IDS: [{
					ID: iGroupId
				}]
			});
	}
}

function recomputeMembers(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	recomputeGroupMembers(oWorkObject.ID, oContext.getHQ());
}

function deleteAndDeleteMemberAssignments(vKey, oObject, oDB, addMessage, oContext) {
	const hq = oContext.getHQ();
	var DB = $.import("sap.ino.xs.aof.core", "db");

	const sSelect = 'select GROUP_ID from "sap.ino.db.iam::t_identity_group_member" where member_id = ?';
	var aResult = hq.statement(sSelect).execute(oObject.ID);

	var oHistoryRow = {
		ID: undefined, // will be filled in loop below
		MEMBER_ID: oObject.ID,
		GROUP_ID: undefined, // will be filled in loop below
		HISTORY_DB_EVENT: 'DELETED',
		HISTORY_BIZ_EVENT: oContext.getHistoryEvent(),
		HISTORY_AT: oContext.getRequestTimestamp(),
		HISTORY_ACTOR_ID: oContext.getUser().ID
	};
	const sInsert =
		'insert into "sap.ino.db.iam::t_identity_group_member_h" (ID, MEMBER_ID, GROUP_ID, HISTORY_DB_EVENT, HISTORY_BIZ_EVENT, HISTORY_AT, HISTORY_ACTOR_ID) ' +
		'VALUES ("sap.ino.db.iam::s_identity_group_member".nextval, ?, ?, ?, ?, ?, ?)';

	_.each(aResult, function(oResult) {
		oHistoryRow.GROUP_ID = oResult.GROUP_ID;
		hq.statement(sInsert).execute(oHistoryRow.MEMBER_ID, oHistoryRow.GROUP_ID, oHistoryRow.HISTORY_DB_EVENT, oHistoryRow.HISTORY_BIZ_EVENT,
			oHistoryRow.HISTORY_AT, oHistoryRow.HISTORY_ACTOR_ID);
		DB.invalidateObject("sap.ino.xs.object.iam.Group", oResult.GROUP_ID);
	});

	const sDelete = 'delete from "sap.ino.db.iam::t_identity_group_member" where member_id = ?';
	hq.statement(sDelete).execute(oObject.ID);

	oDB.del(oObject);

	recomputeGroupMembers(oObject.ID, hq);
}

function updateEnabledCheck(vKey, oObject, addMessage, oContext) {
	if (!bBatchMode) {
		//in online mode(from the UI) identities from other sources cannot be changed
		// if (   oObject.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Upload 
		var sQuery = 'select * from "sap.ino.db.iam::v_auth_application_user" as app_user inner join' +
			'"sap.ino.db.iam::v_identity_static_roles" as static_roles on app_user.id = static_roles.identity_id where static_roles.logical_role_name = ? ';
		const oHQ = oContext.getHQ();
		var aResults = oHQ.statement(sQuery).execute("INNOVATION_MANAGER");
		if (aResults.length === 0) {
			if (oObject.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.IdentityProvider || oObject.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode
				.Automatic) {
				addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oObject.SOURCE_TYPE_CODE);
			}
		}
	} else {
		//in Batch mode automatically created groups cannot be changed
		if (oObject.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Automatic) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oObject.SOURCE_TYPE_CODE);
		}
	}
}

function deleteEnabledCheck(vKey, oObject, addMessage, oContext) {
	if (!bBatchMode) {
		//in online mode(from the UI) identities from other sources cannot be changed
		if (oObject.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Upload || oObject.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.IdentityProvider ||
			oObject.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Automatic) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oObject.SOURCE_TYPE_CODE);
		}
	} else {
		//in Batch mode automatically created groups cannot be changed
		if (oObject.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Automatic) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oObject.SOURCE_TYPE_CODE);
		}
	}
	const hq = oContext.getHQ();
	const sSelect = 'select TOP 1 * from "sap.ino.db.iam::t_object_identity_role" where identity_id = ?';
	var result = hq.statement(sSelect).execute(oObject.ID);
	if (result.length > 0) {
		addMessage(Message.MessageSeverity.Error, IAMMessage.GROUP_IN_USE_DELETE_NOT_POSSIBLE, vKey);
	}
}

function getMemberGroup(oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	var hq = oContext.getHQ();
	var sSelect = "select group_member.GROUP_ID from \"sap.ino.db.iam::t_identity_group_member\" as group_member " +
		"inner join \"sap.ino.db.iam::v_group_attribute\" as group_attribute on group_member.group_id = group_attribute.group_id where member_id = ? and group_attribute.is_public = 1";
	var memberId = oContext.getUser().ID;
	var aResult = hq.statement(sSelect).execute(memberId);
	return aResult;
}

function getMemberShip(oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	var hq = oContext.getHQ();
	var sSelect = 'select * from  "sap.ino.db.iam::v_group_member" where group_id = ?';
	var groupId = oParameters.id;
	var aResult = hq.statement(sSelect).execute(groupId);
	return aResult;
}

function updateMemberShip(oParameters, oWorkObject, addMessage, getNextHandle, oContext) {

}