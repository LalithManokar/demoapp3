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

var bLoginMode = false;

function setLoginMode() {
	bLoginMode = true;
}

function resetLoginMode() {
	bLoginMode = false;
}

this.definition = {
	Root: {
		table: "sap.ino.db.iam::t_identity",
		sequence: "sap.ino.db.iam::s_identity",
		historyTable: "sap.ino.db.iam::t_identity_h",
		readOnly: rootReadOnlyCheck,
		determinations: {},

		consistencyChecks: [check.DBForeignKeyCheck("USER_NAME", IAMMessage.IDENTITY_NAME_UNKNWON, '"SYS"."USERS"', "USER_NAME"),
                             check.duplicateAlternativeKeyCheck("USER_NAME", IAMMessage.IDENTITY_USER_NAME_UNIQUE)],
		attributes: {
			TYPE_CODE: {
				constantKey: TypeCode.TypeCode.User,
				foreignKeyTo: "sap.ino.xs.object.iam.TypeCode.Root"
			},
			SOURCE_TYPE_CODE: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.SourceTypeCode.Root"
			},
			USER_NAME: {
				required: true
			},
			NAME: {
				required: true,
				isName: true
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
		assignGroups : {
		    authorizationCheck : false,
            execute: assignGroups,
            historyEvent : "UPDATE_USER_GROUP_ASSIGNMENT"
		}
	}
};

function rootReadOnlyCheck(vKey, oUser, addMessage, oContext, oNodeMetadata) {
	if (oUser.ID !== null) {
		if (!bBatchMode) {
			if ((oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Upload ||
					oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.Automatic ||
					oUser.SOURCE_TYPE_CODE === SourceTypeCode.SourceTypeCode.IdentityProvider) &&
				!bLoginMode) {
				addMessage(Message.MessageSeverity.Error, IAMMessage.IDENTITY_NOT_CHANGEABLE, vKey, "Root", "SOURCE_TYPE_CODE", oUser.SOURCE_TYPE_CODE);
				return true;
			}
		} else {
			//in Batch mode automatically created groups cannot be changed
			if (oUser.SOURCE_TYPE_CODE == SourceTypeCode.SourceTypeCode.Automatic) {
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

function assignGroups(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext){
    var oHQ = oContext.getHQ();
    
    var selectStatement = "select groups.group_id from \"sap.ino.db.iam::t_identity_group_member\" as groups inner join \"sap.ino.db.iam::t_group_attribute\" as group_attribute " +
                          "on groups.group_id = group_attribute.group_id where groups.member_id = ? and group_attribute.is_public = '1'";
    
    var oStatement = oHQ.statement(selectStatement);
    
    var aResult = oStatement.execute(oWorkObject.ID); 
    
    var groupToRemove = _.reject(aResult, function(oMemberOf) {
		return _.contains(oParameters.keys, oMemberOf.GROUP_ID);
	});
	var groupToAdd = _.difference(oParameters.keys, _.pluck(oWorkObject.MemberOf, "GROUP_ID"));
	
	if (groupToRemove.length){
         _.each(groupToRemove, function(sGroup) {
            for(var index = oWorkObject.MemberOf.length - 1; index > 0; index--){
                if(oWorkObject.MemberOf[index].GROUP_ID === sGroup.GROUP_ID){
    		        oWorkObject.MemberOf.splice(index);
                }
            }
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
