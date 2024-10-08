var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

var TypeCode = $.import("sap.ino.xs.object.iam", "TypeCode");
var SourceTypeCode = $.import("sap.ino.xs.object.iam", "SourceTypeCode");

var AOF = $.import("sap.ino.xs.aof.core", "framework");
var SourceTypeCode = $.import("sap.ino.xs.object.iam", "SourceTypeCode");
var IdentityLog = $.import("sap.ino.xs.object.iam", "IdentityLog");

var bBatchMode = false;

function setBatchMode() {
	bBatchMode = true;
}

var oDicSettingCode = {
	"sap.ino.config.COMPANY": "COMPANY",
	"sap.ino.config.COST_CENTER": "COST_CENTER",
	"sap.ino.config.OFFICE": "OFFICE",
	"sap.ino.config.PHONE": "PHONE",
	"sap.ino.config.MOBILE": "MOBILE",
	"sap.ino.config.EMAIL": "EMAIL",
	"sap.ino.config.STREET": "STREET",
	"sap.ino.config.ZIP_CODE": "ZIP_CODE",
	"sap.ino.config.CITY": "CITY",
	"sap.ino.config.COUNTRY": "COUNTRY"
};

// login Mode is needed by login.xsjslib to facilitate SAML user update                                                                                                          
var bLoginMode = false;

function setLoginMode() {
	bLoginMode = true;
}

function resetLoginMode() {
	bLoginMode = false;
}

function autoGroupUser(oHQ, aUserId) {
	var result = oHQ.procedure('SAP_INO', 'sap.ino.db.iam::p_auto_group_user').execute({
		IT_USER_ID: aUserId
	});
	if (result.OV_FAILED_TO_RECOMPUTE_TRANSITIVE_CLOSURE !== 0) {
		oHQ.procedure('SAP_INO', 'sap.ino.db.iam::p_update_identity_group_member_transitive').execute();
	}
}

var aUserId = [];

function finalizeBatchMode(oHQ) {
	if (aUserId && aUserId.length > 0) {
		autoGroupUser(oHQ, aUserId);
	}
	aUserId = [];
}

function registerForBatchFinalization(iUserId) {
	aUserId.push({
		ID: iUserId
	});
}

this.definition = {
	Root: {
		table: "sap.ino.db.iam::t_identity",
		sequence: "sap.ino.db.iam::s_identity",
		historyTable: "sap.ino.db.iam::t_identity_h",
		determinations: {
			onCreate: [setStaged],
			onModify: [determine.systemAdminData,
                        determineErased],
			onDelete: [erase],
			onPersist: [recomputeMembers]
		},

		consistencyChecks: [],
		attributes: {
		
			SOURCE_TYPE_CODE: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.SourceTypeCode.Root"
			},
		
			STAGED: {
				readOnly: true
			},
			IS_EXTERNAL: {
				consistencyChecks: [check.booleanCheck]
			}
		},
		nodes: {
			MemberOf: {
				table: "sap.ino.db.iam::t_identity_group_member",
				sequence: "sap.ino.db.iam::s_identity_group_member",
				historyTable: "sap.ino.db.iam::t_identity_group_member_h",
				parentKey: "MEMBER_ID",
				consistencyChecks: [check.duplicateCheck("GROUP_ID", IAMMessage.IDENTITY_DUPLICATE_GROUP_ASSIGNMENT)],
				attributes: {
					GROUP_ID: {
						required: true,
						foreignKeyTo: "sap.ino.xs.object.iam.Group.Root"
					}
				}
			}
		   /* MemberOfTransitive: {
				table: "sap.ino.db.iam::t_identity_group_member_transitive",
				parentKey: "MEMBER_ID",
				consistencyChecks: [check.duplicateCheck("GROUP_ID", IAMMessage.IDENTITY_DUPLICATE_GROUP_ASSIGNMENT)],
				attributes: {
					GROUP_ID: {
						required: true,
						foreignKeyTo: "sap.ino.xs.object.iam.Group.Root"
					}
				}
		    }*/
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
			historyEvent: "IDENTITY_UPDATED"
		},
		del: {
			authorizationCheck: false,
			historyEvent: "IDENTITY_DELETED",
			persist: executeErase,
			enabledCheck: deleteEnabledCheck
		},
		read: {
			authorizationCheck: false
		},

		assignStaticRoles: {
			authorizationCheck: false,
			historyEvent: "UPDATE_STATIC_ROLE_ASSIGNMENT",
			execute: assignStaticRoles
		},
		// activates staged user
		activate: {
			authorizationCheck: false,
			historyEvent: "USER_ACTIVATED",
			execute: activate
		},
		assignSAMLGroups: {
			authorizationCheck: false,
			historyEvent: "UPDATE_SAML_GROUP_ASSIGNMENT",
			execute: assignSAMLGroups
		},
		assignGroups : {
		    authorizationCheck : false,
            execute: assignGroups,
            historyEvent : "UPDATE_USER_GROUP_ASSIGNMENT"
		}
	}
};

function recomputeGroupMembers(iUserId, oHQ) {
	if (bBatchMode) {
		registerForBatchFinalization(iUserId);
	} else {
		const aUserId = [{
			ID: iUserId
		}];
		autoGroupUser(oHQ, aUserId);
		oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_update_delta_identity_group_member_transitive")
			.execute({
				IT_MEMBER_IDS: aUserId
			});
	}
}

function createIdentityLog(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	var sActionName = oContext.getAction().name;//sPreviousActionName;
	if (sActionName !== "create" && sActionName !== "update") {
		return;
	}
	if (!bBatchMode) {
		var iHandle = getNextHandle();
		var oIdentityLog = AOF.getApplicationObject("sap.ino.xs.object.iam.IdentityLog");
		var oHQ = oContext.getHQ();
		var oSettings = oHQ.statement('select * from "sap.ino.db.iam::t_identity_log_setting"').execute();
		if (oSettings) {
			_.each(oSettings, function(oSetting) {
				if (!oSetting.IS_LOG) {
					return true;
				}
				var oNewFieldValue = oWorkObject[oDicSettingCode[oSetting.CODE]];
				if (sActionName === "create"  && oNewFieldValue) {
					oIdentityLog.create({
						ID: iHandle,
						CREATED_AT: new Date(),
						CREATED_BY_ID: oWorkObject.ID,
						CHANGED_AT: new Date(),
						CHANGED_BY_ID: oWorkObject.ID,
						IDENTITY_ID: oWorkObject.ID,
						CHANGED_ATTRIBUTE: oSetting.CODE,
						CHANGED_ATTRIBUTE_TYPE: "INSERT",
						STRING_NEW_VALUE: oWorkObject[oDicSettingCode[oSetting.CODE]]
					});
				} else if (sActionName === "update" && oNewFieldValue !== oPersistedObject[oDicSettingCode[oSetting.CODE]]) {
					oIdentityLog.create({
						ID: iHandle,
						CREATED_AT: new Date(),
						CREATED_BY_ID: oPersistedObject.ID,
						CHANGED_AT: new Date(),
						CHANGED_BY_ID: oPersistedObject.ID,
						IDENTITY_ID: vKey,
						CHANGED_ATTRIBUTE: oSetting.CODE,
						CHANGED_ATTRIBUTE_TYPE: "UPDATE",
						STRING_NEW_VALUE: oNewFieldValue,
						STRING_OLD_VALUE: oPersistedObject[oDicSettingCode[oSetting.CODE]]
					});
				}
			});
		}
	}
}


function recomputeMembers(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	recomputeGroupMembers(oWorkObject.ID, oContext.getHQ());
}

function setStaged(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	oWorkObject.STAGED = 1;
}

function executeErase(vKey, oObject, oDB, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aIdentity = oHQ.statement('select i.USER_NAME from "sap.ino.db.iam::t_identity" as i, sys.users as u ' +
		"where ID = ? and TYPE_CODE = 'USER' and i.user_name = u.user_name").execute(vKey);
	var sUSER_NAME = aIdentity[0] && aIdentity[0].USER_NAME;
	if (sUSER_NAME) {
		var oSecondaryHQ = oContext.getSecondaryHQ();

		var aStaticRoles = oHQ.statement('select qualified_role_name from "sap.ino.db.iam::v_static_roles"').execute();
		var aRevokeRoles = _.pluck(aStaticRoles, 'QUALIFIED_ROLE_NAME');

		_.each(aRevokeRoles, function(sRoleName) {
			oSecondaryHQ.procedure("SAP_INO", "sap.ino.db.iam::p_restricted_revoke_activated_role").execute(sRoleName, sUSER_NAME);
			updateHistory(oHQ, 'REVOKE', sRoleName, vKey);
		});
	}

	oDB.update(oObject);

	recomputeGroupMembers(oObject.ID, oContext.getHQ());
	recomputeObjectIndentityRole(oObject.ID, addMessage, oContext.getHQ());
}

function rootReadOnlyCheck(vKey, oUser, addMessage, oContext, oNodeMetadata) {
	if (oUser.ID !== null) {
		/*if (!bBatchMode) {
			if ((oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Upload ||
					oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Automatic ||
					oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.IdentityProvider) &&
				!bLoginMode) {
				addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oUser.SOURCE_TYPE_CODE);
				return true;
			}
		}*/
		if (bBatchMode) {
			//in Batch mode automatically created groups cannot be changed
			if (oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Automatic) {
				addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oUser.SOURCE_TYPE_CODE);
				return true;
			}
		}
		var hq = oContext.getHQ();
		var sSelect = 'select USER_DEACTIVATED from USERS where USER_NAME = ?';
		var result = hq.statement(sSelect).execute(oUser.USER_NAME);
		if (result.length === 0) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.USER_NOT_FOUND, vKey);
			return true;
		} else if (_.toBool(result[0].USER_DEACTIVATED)) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.USER_DEACTIVATED, vKey);
			return true;
		}
	}
}

function updateEnabledCheck(vKey, oUser, addMessage, oContext) {
	var hq = oContext.getHQ();
	var sSelect = 'select USER_DEACTIVATED from USERS where USER_NAME = ?';
	var result = hq.statement(sSelect).execute(oUser.USER_NAME);
	if (result.length === 0) {
		addMessage(Message.MessageSeverity.Error, IAMMessage.USER_NOT_FOUND, vKey);
	} else if (_.toBool(result[0].USER_DEACTIVATED)) {
		addMessage(Message.MessageSeverity.Error, IAMMessage.USER_DEACTIVATED, vKey);
	}
}

function deleteEnabledCheck(vKey, oUser, addMessage, oContext) {
	if (!bBatchMode) {
		if (
			//oUser.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Upload           ||
			oUser.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Automatic ||
			oUser.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.IdentityProvider) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oUser.SOURCE_TYPE_CODE);
		}
	} else {
		//in Batch mode automatically created groups cannot be changed
		if (oUser.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Automatic) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oUser.SOURCE_TYPE_CODE);
		}
	}
}

function determineErased(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	// if the action is "del" then set ERASED to true no matter if
	// we will delete the object or not
	oWorkObject.ERASED = oContext.getAction().name == "del" ? 1 : 0;
}

function userNameToUpperCase(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	oWorkObject.USER_NAME = oWorkObject.USER_NAME.toUpperCase();
}

function erase(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	// We do not support to delete identities. Instead they will be "erased".
	// This avoids expensive where used checks. 
	oWorkObject = _.extend(oWorkObject, {
		ERASED: 1,
		NAME: "erased",
		FIRST_NAME: "erased",
		LAST_NAME: "erased",
		EMAIL: "erased",
		// the user name is intentionally in lower case since
		// any valid databbase user name is always upper case
		USER_NAME: "erased",
		PHONE: "erased",
		MOBILE: "erased",
		COST_CENTER: "erased",
		ORGANIZATION: "erased",
		OFFICE: "erased",
		DESCRIPTION: 'erased',
		COMPANY: 'erased',
		STREET: 'erased',
		CITY: 'erased',
		COUNTRY: 'erased',
		ZIP_CODE: 'erased',
		STAGED: 0
		//VALIDATION_TO: Date.now()
	});
}

function updateHistory(oHQ, sAction, sRole, sIdentityID) {
	oHQ.statement(
		'insert into "sap.ino.db.iam::t_static_role_grant_h" ( ' +
		"history_db_event, " +
		"history_biz_event, " +
		"history_at, " +
		"history_actor_id, " +
		"id, " +
		"role_name " +
		") select " +
		"action.action      as history_db_event, " +
		"action.action      as history_biz_event, " +
		"current_timestamp  as history_at, " +
		"usr.id             as history_actor_id, " +
		"action.identity_id as id, " +
		"action.role        as role_name " +
		"from " +
		"(select ? as action, ? as role, ? as identity_id from dummy) as action, " +
		'"sap.ino.db.iam::v_auth_application_user" as usr'
	).execute(sAction, sRole, sIdentityID.toString());
}

function assignStaticRoles(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	function isAdmissibleRole(oSTATIC_ROLE_ASSIGNMENT) {
		return _.contains(['INNOVATION_SYSTEM_MANAGER', 'INNOVATION_MANAGER', 'INNOVATION_OFFICE_USER', 'COMMUNITY_USER'],
			oSTATIC_ROLE_ASSIGNMENT.ROLE_CODE);
	}

	var oHQ = oContext.getHQ();
	var oSecondaryHQ = oContext.getSecondaryHQ();

	// UI users are not allowed to grant or revoke innovation system manager role
	var usesInnovationSystemManagerDCL = function(oSTATIC_ROLE_ASSIGNMENT) {
		return oSTATIC_ROLE_ASSIGNMENT.ROLE_CODE == 'INNOVATION_SYSTEM_MANAGER';
	};
	_.each(_.filter(oParameters.STATIC_ROLE_ASSIGNMENT, usesInnovationSystemManagerDCL), function() {
		addMessage(Message.MessageSeverity.Error, IAMMessage.STATIC_ROLE_MISSING_AUTH, vKey, "Root", ["INNOVATION_SYSTEM_MANAGER"]);
	});
	var aSTATIC_ROLE_ASSIGNMENT = _.reject(oParameters.STATIC_ROLE_ASSIGNMENT, usesInnovationSystemManagerDCL);
	oParameters.STATIC_ROLE_ASSIGNMENT = aSTATIC_ROLE_ASSIGNMENT;

	var aIdentity = oHQ.statement('select USER_NAME from "sap.ino.db.iam::t_identity" ' +
		"where ID = ? and TYPE_CODE = 'USER'").execute(vKey);
	if (aIdentity.length === 0) {
		addMessage(Message.MessageSeverity.Error, IAMMessage.INVALID_IDENTITY, vKey, "IDENTITY_ID");
	} else {
		_.each(_.reject(oParameters.STATIC_ROLE_ASSIGNMENT, isAdmissibleRole), function(oSTATIC_ROLE_ASSIGNMENT) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.STATIC_ROLE_DOES_NOT_EXIST, vKey, "STATIC_ROLE_ASSIGNMENT", "ROLE_CODE",
				oSTATIC_ROLE_ASSIGNMENT.ROLE_CODE);
		});

		var targetRoles = _.map(_.filter(oParameters.STATIC_ROLE_ASSIGNMENT, isAdmissibleRole),
			function(oSTATIC_ROLE_ASSIGNMENT) {
				return oSTATIC_ROLE_ASSIGNMENT.ROLE_CODE;
			});

		var currentRoles =
			_.map(oHQ.statement('select logical_role_name as role_code from "sap.ino.db.iam::v_identity_static_roles" where identity_id = ?').execute(
				vKey), function(row) {
				return row.ROLE_CODE;
			});

		var aStaticRoles = oHQ.statement(
			'select logical_role_name as role_code, qualified_role_name as technical_role_code from "sap.ino.db.iam::v_static_roles"').execute();
		var oRoleMap = _.mapObjects(_.indexBy(aStaticRoles, 'ROLE_CODE'), function(oObject) {
			return oObject.TECHNICAL_ROLE_CODE;
		});

		var sUSER_NAME = aIdentity[0].USER_NAME;

		if (oParameters.GRANT !== true) {
			// the REVOKE parameters says that you only want to revoke the given roles
			var aRevokeRoles = oParameters.REVOKE ? targetRoles : _.difference(currentRoles, targetRoles);
			_.each(aRevokeRoles, function(sRoleCode) {
				var sRoleName = oRoleMap[sRoleCode];
				oSecondaryHQ.procedure("SAP_INO", "sap.ino.db.iam::p_restricted_revoke_activated_role").execute(sRoleName, sUSER_NAME);
				updateHistory(oHQ, 'REVOKE', sRoleName, vKey);
			});
		}

		if (oParameters.REVOKE !== true) {
			var aGrantRoles = _.difference(targetRoles, currentRoles);
			_.each(aGrantRoles, function(sRoleCode) {
				var sRoleName = oRoleMap[sRoleCode];
				oSecondaryHQ.procedure("SAP_INO", "sap.ino.db.iam::p_restricted_grant_activated_role").execute(sRoleName, sUSER_NAME);
				updateHistory(oHQ, 'GRANT', sRoleName, vKey);
			});
		}
	}
}

function activate(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	oWorkObject.STAGED = 0;
	assignStaticRoles(vKey, {
		// usually this revokes other innovation management roles
		// but we only want to grant 
		GRANT: true,
		STATIC_ROLE_ASSIGNMENT: [{
			ROLE_CODE: 'COMMUNITY_USER'
        }]
	}, oWorkObject, addMessage, getNextHandle, oContext);
}

function assignSAMLGroups(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	//try to get IDs for new Groups
	var Group = AOF.getApplicationObject("sap.ino.xs.object.iam.Group");

	var oHQ = oContext.getHQ();
	var oStatement = oHQ.statement('select ID from "sap.ino.db.iam::t_identity" where name = ? and type_code = \'GROUP\' and erased = 0');

	_.each(oParameters.GROUPS_TO_ADD, function(sGroupName) {
		var aResult = oStatement.execute(sGroupName);
		if (aResult.length === 0) {
			var iHandle = getNextHandle();
			var oCreateResponse = Group.create({
				ID: iHandle,
				NAME: sGroupName,
				SOURCE_TYPE_CODE: SourceTypeCode.SourceTypeCode.IdentityProvider
			});
			var iGroupId = oCreateResponse.generatedKeys && oCreateResponse.generatedKeys[iHandle];
			oWorkObject.MemberOf.push({
				GROUP_ID: iGroupId,
				ID: getNextHandle()
			});
		} else {
			oWorkObject.MemberOf.push({
				GROUP_ID: aResult[0].ID,
				ID: getNextHandle()
			});
		}
		
	});

	//get IDs for groups to be removed
	if (oParameters.GROUPS_TO_REMOVE.length > 0) {
		var sReplacement = "?, ".repeat(oParameters.GROUPS_TO_REMOVE.length - 1) + "?";
		oStatement = oHQ.statement('select ID from "sap.ino.db.iam::t_identity" where name in (' + sReplacement +
			') and type_code = \'GROUP\' and erased = 0');
		var aResult = oStatement.execute(oParameters.GROUPS_TO_REMOVE);
		var aGroupIds = _.pluck(aResult, 'ID');
		oWorkObject.MemberOf = _.reject(oWorkObject.MemberOf, function(oMemberOf) {
			return _.contains(aGroupIds, oMemberOf.GROUP_ID);
		});
	}
}

function assignGroups(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext){
    var oHQ = oContext.getHQ();
    
    var selectStatement = "select groups.group_id from \"sap.ino.db.iam::t_identity_group_member\" as groups inner join \"sap.ino.db.iam::t_group_attribute\" as group_attribute " +
                          "on groups.group_id = group_attribute.group_id where groups.member_id = ? and group_attribute.is_public = '1'";
    
    var oStatement = oHQ.statement(selectStatement);
    
    var aResult = oStatement.execute(oWorkObject.ID); 
    
    var groupToRemove = _.reject(aResult, function(oMemberOf) {
		return _.contains(oParameters.keys, oMemberOf.GROUP_ID);
	});
	var groupToAdd = _.difference(oParameters.keys, _.pluck(oWorkObject.MemberOf,"GROUP_ID"));
	
	if (groupToRemove.length){
         _.each(groupToRemove, function(sGroup) {
            var sIndex = _.indexOf(oWorkObject.MemberOf,sGroup.GROUP_ID);
    		oWorkObject.MemberOf.splice(sIndex);
    
        });
	}
	if(groupToAdd.length){
        _.each(groupToAdd, function(sGroup) {
    
    		oWorkObject.MemberOf.push({
    			GROUP_ID: sGroup,
    			ID: getNextHandle()
    		});
        });
	}
}


function recomputeObjectIndentityRole(iUserId, addMessage, oHQ) {
	if (bBatchMode) {
		registerForBatchFinalization(iUserId);
	} else {
		var deleteStatement = "delete from \"sap.ino.db.iam::t_object_identity_role\" where identity_id = ?";
		var oStatement = oHQ.statement(deleteStatement);
// 		var aResult = oStatement.execute(iUserId);
// 		if (!aResult){
// 		    addMessage(Message.MessageSeverity.Error, IAMMessage.USER_DELETE_FAIL, iUserId, "Root", ["INNOVATION_SYSTEM_MANAGER"]);
// 		}
		try {
		    oStatement.execute(iUserId);
		}
		catch(oException){
		     addMessage(Message.MessageSeverity.Error, IAMMessage.USER_DELETE_FAIL, iUserId, "Root", ["INNOVATION_SYSTEM_MANAGER"]); 
		}

	}
}