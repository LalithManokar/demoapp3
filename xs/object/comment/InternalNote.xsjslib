var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CommentMessage = $.import("sap.ino.xs.object.comment", "message");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

function object(sType) {
	var sTypeLowerCase = sType.toLowerCase();

	var sObjectTypeCode = "";
	if (sTypeLowerCase === "idea") {
		sObjectTypeCode = IdentityRole.ObjectType.InternalNote;
	}
	return {
		actions: {
			create: {
				authorizationCheck: authCheckAdminOr("sap.ino.xs.rest.admin.application::campaign", CommentMessage.AUTH_MISSING_INTERNAL_NOTE_CREATE,
					"create", sTypeLowerCase),
				executionCheck: createExecutionCheck,
				historyEvent: "INTERNAL_NOTE_CREATED"
			},
			update: {
				authorizationCheck: auth.instanceAccessCheck("sap.ino.db." + sTypeLowerCase + "::v_auth_internal_note_update", "INTERNAL_NOTE_ID",
					CommentMessage.AUTH_MISSING_INTERNAL_NOTE_UPDATE),
			    executionCheck: updateEnabledCheck,
				historyEvent: "INTERNAL_NOTE_UPDATED"
			},
			del: {
				authorizationCheck: auth.instanceAccessCheck("sap.ino.db." + sTypeLowerCase + "::v_auth_internal_note_delete", "INTERNAL_NOTE_ID",
					CommentMessage.AUTH_MISSING_INTERNAL_NOTE_DELETE),
				historyEvent: "INTERNAL_NOTE_DELETED"
			},
			read: {
				authorizationCheck: authCheckAdminOr("sap.ino.xs.rest.admin.application::campaign", CommentMessage.AUTH_MISSING_INTERNAL_NOTE_CREATE,
					"read", sTypeLowerCase)
			},
			removeAttachments: {
				authorizationCheck: authCheckAttachmentRm("sap.ino.db." + sTypeLowerCase + "::v_auth_internal_note_delete", "INTERNAL_NOTE_ID",
					CommentMessage.AUTH_MISSING_INTERNAL_NOTE_DELETE),
				historyEvent: "COMMENT_ATTACHMENT_REMOVED",
				execute: removeCommentAttachments,
				isStatic: true
			},
			delComment: {
				authorizationCheck: false,
				execute: delComment,
				isStatic: true
			}
		},
		Root: {
			table: "sap.ino.db.comment::t_comment",
			historyTable: "sap.ino.db.comment::t_comment_h",
			sequence: "sap.ino.db.comment::s_comment",
			determinations: {
				onCreate: [createOwner],
				onModify: [determine.systemAdminData]
			},
			nodes: {
				Owner: IdentityRole.node(sObjectTypeCode, IdentityRole.Role.InternalNoteOwner, true),
				Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Comment, AttachmentAssignment.FilterTypeCode.Frontoffice)
			},
			attributes: {
				OBJECT_ID: {
					foreignKeyTo: "sap.ino.xs.object." + sTypeLowerCase + "." + sTypeLowerCase.charAt(0).toUpperCase() + sTypeLowerCase.slice(1) + ".Root",
					readOnly: check.readOnlyAfterCreateCheck(CommentMessage.INTERNAL_NOTE_IDEA_UNCHANGEABLE)
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
				},
				OBJECT_TYPE_CODE: {
					constantKey: sType.toUpperCase()
				},
				TYPE_CODE: {
					constantKey: "INTERNAL_NOTE"
				}
			}
		}
	};
}

function createOwner(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oWorkObject.Owner = [{
		ID: fnNextHandle(),
		IDENTITY_ID: iUserId,
		OBJECT_TYPE_CODE: oWorkObject.OBJECT_TYPE_CODE.toUpperCase()
    }];
}

function checkIllegalTags(oContext){
    
    var keyWords = ["iframe","object","embed"];
    
    for(var i = 0 ; i < keyWords.length ; i++){
        var regexp = new RegExp("<(\\s*?)" + keyWords[i] + "(.*?)>","gi");
        if(oContext.match( regexp ) !== null){
            return true;
        }
    }
    return false;
}

function authCheckAdminOr(sAuthView, sAuthFailMsg, sActionType, sObjectType) {
	return function(vKey, oRequest, fnMessage, oContext) {
		var fnInstanceCheck;
		if (sActionType === "create") {
			fnInstanceCheck = auth.parentInstanceAccessCheck("sap.ino.db." + sObjectType + "::v_auth_internal_note_create", sObjectType.toUpperCase() +
				"_ID", "OBJECT_ID", CommentMessage.AUTH_MISSING_INTERNAL_NOTE_CREATE);
		}
		if (sActionType === "read") {
			fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db." + sObjectType + "::v_auth_internal_note_read", "INTERNAL_NOTE_ID",
				CommentMessage.AUTH_MISSING_INTERNAL_NOTE_READ);
		}
		var fnPrivilegeCheck = auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", sAuthFailMsg);
		var fnMessageIgnoreFunction = function() {};

		var bSuccess = fnPrivilegeCheck(vKey, oRequest, fnMessageIgnoreFunction, oContext);
		if (!bSuccess) {
			bSuccess = fnInstanceCheck(vKey, oRequest, fnMessage, oContext);
		}

		return bSuccess;
	};
}


function createExecutionCheck(vKey, oRequest, oComment, oPersistedComment, addMessage, oContext) {
	if (oRequest.PARENT_ID) {
		auth.instanceAccessCheck("sap.ino.db.comment::t_comment", "ID", CommentMessage.AUTH_MISSING_COMMENT_REPLY)(oRequest.PARENT_ID,
			oRequest, addMessage, oContext);
	}
	
	var containedIllegalTags = checkIllegalTags(oComment.COMMENT);
	if (containedIllegalTags) {
		addMessage(Message.MessageSeverity.Error, CommentMessage.NOTE_CONTAINED_ILLEGAL_TAGS);
		return;
	} 
}

function authCheckAttachmentRm(sAuthView, vAuthKeyColumn, sAuthFailMsg) {
	return function(oReq, fnMessage, oContext) {
		var hq = oContext.getHQ();
		var sSelect = 'select ' + vAuthKeyColumn + ' from "' + sAuthView + '" where ' + vAuthKeyColumn + ' = ?';
		var result = hq.statement(sSelect).execute(oReq.ID);
		if (result.length < 1) {
			fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, oReq.ID, AOF.Node.Root, null);
			return false;
		}
		return true;
	};
}

function removeCommentAttachments(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oHQ = oContext.getHQ();
	var sDelQuery = 'DELETE FROM "sap.ino.db.attachment::t_attachment" AS attachment WHERE ID = ?; ';
	var sDelQueryData = 'DELETE FROM "sap.ino.db.attachment::t_attachment_data" AS attachment WHERE ID = ?';
	var sDelQueryAssign = 'DELETE FROM "sap.ino.db.attachment::t_attachment_assignment" AS assignment WHERE ATTACHMENT_ID = ?';
	oHQ.statement(sDelQuery).execute(oReq.ATTACHMENT_ID);
	oHQ.statement(sDelQueryData).execute(oReq.ATTACHMENT_ID);
	oHQ.statement(sDelQueryAssign).execute(oReq.ATTACHMENT_ID);
	oHQ.getConnection().commit();
}

function delComment(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oInternalNote = AOF.getApplicationObject("sap.ino.xs.object.idea.InternalNote");
	oInternalNote.del(oReq.COMMENT_ID);
	if (oReq.ALL_DATA > 0) {
		var oHQ = oContext.getHQ();
		var sSelQuery =
			'SELECT ID FROM "sap.ino.db.comment::t_comment" AS COMMENT WHERE PARENT_ID = ?;';
		var result = oHQ.statement(sSelQuery).execute(oReq.COMMENT_ID);
		_.each(result, function(oComment) {
			oInternalNote.del(oComment.ID);
		});
	}
}

function updateEnabledCheck(vKey, oRequest, oComment, oPersistedComment, addMessage, oContext) {
    var containedIllegalTags = checkIllegalTags(oComment.COMMENT);
	if (containedIllegalTags) {
		addMessage(Message.MessageSeverity.Error, CommentMessage.NOTE_CONTAINED_ILLEGAL_TAGS);
		return;
	}
}




//end