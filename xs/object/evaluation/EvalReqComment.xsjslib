var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CommentMessage = $.import("sap.ino.xs.object.comment", "message");

var counts = $.import("sap.ino.xs.object.evaluation","EvalReqCounts");

this.definition = {
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_comment_create", "EVAL_REQ_ID", "OBJECT_ID",  CommentMessage.AUTH_MISSING_COMMENT_CREATE),
			historyEvent: "COMMENT_CREATED",
			impacts: ["sap.ino.xs.object.evaluation.EvaluationRequest"]
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_comment_update", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_UPDATE),
			historyEvent: "COMMENT_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_comment_delete", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_DELETE),
			historyEvent: "COMMENT_DELETED",
			impacts: ["sap.ino.xs.object.evaluation.EvaluationRequest"]
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_comment_read", "COMMENT_ID", CommentMessage.AUTH_MISSING_COMMENT_READ)
		}
	},
	Root: {
		table: "sap.ino.db.comment::t_comment",
		historyTable: "sap.ino.db.comment::t_comment_h",
		sequence: "sap.ino.db.comment::s_comment",
		determinations: {
			onCreate: [createOwner],
			onModify: [determine.systemAdminData],
			onPersist: [counts.update]
		},
		nodes: {
			Owner: IdentityRole.node("EVAL_REQUEST", IdentityRole.Role.CommentOwner, true)
		},
		attributes: {
			OBJECT_ID: {
				foreignKeyTo: "sap.ino.xs.object.evaluation.EvaluationRequest.Root",
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
				constantKey: "EVAL_REQUEST"
			},
			TYPE_CODE: {
				constantKey: "COMMUNITY_COMMENT"
			}
		}
	}
};

function createOwner(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    var iUserId = oContext.getUser().ID;
    oWorkObject.Owner = [{
        ID : fnNextHandle(),
        IDENTITY_ID : iUserId,
        OBJECT_TYPE_CODE : "EVAL_REQUEST"
    }];
}