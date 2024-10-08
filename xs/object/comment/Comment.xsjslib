var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var CommentMessage = $.import("sap.ino.xs.object.comment", "message");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var trackingLog = $.import("sap.ino.xs.xslib", "trackingLog");

var oModelForObject = {
	idea: "sap.ino.xs.object.idea.Comment",
	campaign: "sap.ino.xs.object.campaign.Comment",
	blog: "sap.ino.xs.object.blog.Comment"
};

var oObjectTypeCode = {
	idea: "IDEA",
	campaign: "CAMPAIGN",
	blog: "BLOG"
};

function object(sType, oSettings) {
	var sTypeLowerCase = sType.toLowerCase();

	var sObjectTypeCode = "";
	var sPrivilege;
	if (sTypeLowerCase === "idea") {
		sObjectTypeCode = IdentityRole.ObjectType.Comment;
	} else if (sTypeLowerCase === "campaign") {
		sObjectTypeCode = IdentityRole.ObjectType.CampaignComment;
		sPrivilege = "sap.ino.xs.rest.admin.application::campaign";
	} else if (sTypeLowerCase === "blog") {
		sObjectTypeCode = IdentityRole.ObjectType.Blog;
	}
	return {
		actions: {
			create: {
				authorizationCheck: authCheckAdminOr(sTypeLowerCase, "create", CommentMessage.AUTH_MISSING_COMMENT_CREATE, sPrivilege),
				executionCheck: createExecutionCheck,
				historyEvent: "COMMENT_CREATED",
				impacts: oSettings && oSettings.impacts && oSettings.impacts.create
			},
			update: {
				authorizationCheck: auth.instanceAccessCheck("sap.ino.db." + sTypeLowerCase + "::v_auth_comment_update", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_UPDATE),
				executionCheck: updateEnabledCheck,
				historyEvent: "COMMENT_UPDATED"
			},
			del: {
				authorizationCheck: auth.instanceAccessCheck("sap.ino.db." + sTypeLowerCase + "::v_auth_comment_delete", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_DELETE),
				historyEvent: "COMMENT_DELETED",
				impacts: oSettings && oSettings.impacts && oSettings.impacts.del
			},
			read: {
				authorizationCheck: authCheckAdminOr(sTypeLowerCase, "read", CommentMessage.AUTH_MISSING_COMMENT_READ, sPrivilege)
			},
			removeAttachments: {
				authorizationCheck: authCheckAttachmentRm("sap.ino.db." + sTypeLowerCase + "::v_auth_comment_delete", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_ATTACHMENT_DELETE),
				historyEvent: "COMMENT_ATTACHMENT_REMOVED",
				execute: removeCommentAttachments,
				isStatic: true
			},
			delComment: {
				authorizationCheck: false,
				historyEvent: "COMMENT_DELETED",
				execute: delComment,
				impacts: oSettings && oSettings.impacts && oSettings.impacts.del,
				isStatic: true
			}
		},
		Root: {
			table: "sap.ino.db.comment::t_comment",
			historyTable: "sap.ino.db.comment::t_comment_h",
			sequence: "sap.ino.db.comment::s_comment",
			determinations: {
				onCreate: [createOwner],
				onModify: [determine.systemAdminData, onTrackCommentLog],
				onPersist: oSettings && oSettings.onPersist
			},
			nodes: {
				Owner: IdentityRole.node(sObjectTypeCode, IdentityRole.Role.CommentOwner, true),
				Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Comment, AttachmentAssignment.FilterTypeCode.Frontoffice),
				Imgs: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Comment, AttachmentAssignment.FilterTypeCode.Frontoffice,
					AttachmentAssignment.RoleCode.CommentContentImg)
			},
			attributes: {
				OBJECT_ID: {
					foreignKeyTo: "sap.ino.xs.object." + sTypeLowerCase + "." + sTypeLowerCase.charAt(0).toUpperCase() + sTypeLowerCase.slice(1) + ".Root",
					readOnly: check.readOnlyAfterCreateCheck(CommentMessage.COMMENT_IDEA_UNCHANGEABLE)
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
					constantKey: "COMMUNITY_COMMENT"
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

function checkIllegalTags(oContext) {

	var keyWords = ["iframe", "object", "embed"];

	for (var i = 0; i < keyWords.length; i++) {
		var regexp = new RegExp("<(\\s*?)" + keyWords[i] + "(.*?)>", "gi");
		if (oContext.match(regexp) !== null) {
			return true;
		}
	}
	return false;
}

function authCheckAdminOr(sObjectType, sActionType, sAuthMsg, sStaticPrivilege) {
	return function(vKey, oRequest, fnMessage, oContext) {
		var fnInstanceCheck;
		var fnPrivilegeCheck;

		if (sActionType === "create") {
			fnInstanceCheck = auth.parentInstanceAccessCheck("sap.ino.db." + sObjectType + "::v_auth_comment_create", sObjectType.toUpperCase() +
				"_ID", "OBJECT_ID", sAuthMsg);
		}
		if (sActionType === "read") {
			fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db." + sObjectType + "::v_auth_comment_read", "COMMENT_ID", sAuthMsg);
		}
		if (sStaticPrivilege) {
			fnPrivilegeCheck = auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", sAuthMsg);
		}

		var fnMessageIgnoreFunction = function() {};

		var bSuccess = fnInstanceCheck(vKey, oRequest, fnMessageIgnoreFunction, oContext);
		if (!bSuccess && fnPrivilegeCheck) {
			fnPrivilegeCheck(vKey, oRequest, fnMessage, oContext);
		}
		return bSuccess;
	};
}

function createExecutionCheck(vKey, oRequest, oComment, oPersistedComment, addMessage, oContext) {
	if (oRequest.PARENT_ID) {
		auth.instanceAccessCheck("sap.ino.db.comment::t_comment", "ID", CommentMessage.AUTH_MISSING_COMMENT_REPLY)(oRequest.PARENT_ID,
			oRequest, addMessage, oContext);
	}

	if (oComment.OBJECT_TYPE_CODE === "IDEA") {
		var containedIllegalTags = checkIllegalTags(oComment.COMMENT)
		if (containedIllegalTags) {
			addMessage(Message.MessageSeverity.Error, CommentMessage.COMMENT_CONTAINED_ILLEGAL_TAGS);
			return;
		}
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
	var oHQ = oContext.getHQ();
	var oCommentModel;
	var sSelQuery =
		'SELECT ID FROM "sap.ino.db.comment::t_comment" AS comment WHERE PARENT_ID = ?;';
	var result = [];
	if (oReq.ALL_DATA > 0) {
		result = oHQ.statement(sSelQuery).execute(oReq.COMMENT_ID);
	}
	if (oReq.OBJECT_TYPE === oObjectTypeCode.idea) {
		oCommentModel = AOF.getApplicationObject(oModelForObject.idea);
	} else if (oReq.OBJECT_TYPE === oObjectTypeCode.campaign) {
		oCommentModel = AOF.getApplicationObject(oModelForObject.campaign);
	} else if (oReq.OBJECT_TYPE === oObjectTypeCode.blog) {
		oCommentModel = AOF.getApplicationObject(oModelForObject.blog);
	}
	result.push({
		ID: oReq.COMMENT_ID
	});
	if (result && result.length > 0) {
		_.each(result, function(oComment) {
			oCommentModel.del(oComment.ID);
		});
	}
}

function onTrackCommentLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {

	trackingLog.onTrackCommentLog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext);

}

function updateEnabledCheck(vKey, oRequest, oComment, oPersistedComment, addMessage, oContext) {
	if (oComment.OBJECT_TYPE_CODE === "IDEA") {
		var containedIllegalTags = checkIllegalTags(oComment.COMMENT)
		if (containedIllegalTags) {
			addMessage(Message.MessageSeverity.Error, CommentMessage.COMMENT_CONTAINED_ILLEGAL_TAGS);
			return;
		}
	}
}

//end