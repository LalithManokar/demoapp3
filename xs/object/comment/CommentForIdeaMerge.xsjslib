var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CommentMessage = $.import("sap.ino.xs.object.comment", "message");
var counts = $.import("sap.ino.xs.object.idea", "ideaCounts");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

this.definition = {
            Root: {
			table: "sap.ino.db.comment::t_comment",
			historyTable: "sap.ino.db.comment::t_comment_h",
			sequence: "sap.ino.db.comment::s_comment",
			determinations: {
			},
			nodes: {
				Owner: IdentityRole.node('COMMENT', IdentityRole.Role.CommentOwner, true),
				Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Comment, AttachmentAssignment.FilterTypeCode.Frontoffice),
				Imgs: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Comment, AttachmentAssignment.FilterTypeCode.Frontoffice,
					AttachmentAssignment.RoleCode.CommentContentImg)
			},
			attributes: {
				OBJECT_ID: {
					foreignKeyTo: "sap.ino.xs.object.idea.Idea.Root"
				},
				CREATED_AT: {
					required: true
				},
				CREATED_BY_ID: {
					required: true
				},
				CHANGED_AT: {
					required: true
				},
				CHANGED_BY_ID: {
					required: true
				},
				OBJECT_TYPE_CODE: {
					constantKey: 'IDEA'
				},
				TYPE_CODE: {
					constantKey: "COMMUNITY_COMMENT"
				}
			}
		},
	actions: {
			create: {
				authorizationCheck: false,
				historyEvent: "COMMENT_CREATED"
			}
		}
};






//end