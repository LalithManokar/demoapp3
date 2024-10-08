var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var determine = $.import("sap.ino.xs.aof.lib", "determination");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var BlogMessage = $.import("sap.ino.xs.object.blog", "message");

var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

var auth = $.import("sap.ino.xs.aof.lib", "authorization");

var Status = this.Status = {
	Draft: "sap.ino.config.DRAFT",
	Published: "sap.ino.config.BLOG_PUBLISHED"
};

this.definition = {
	cascadeDelete: ["sap.ino.xs.object.blog.Comment"],
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.blog::v_auth_blogs_create", "OBJECT_ID", "OBJECT_ID", BlogMessage.AUTH_MISSING_BLOG_CREATE),
			historyEvent: "BLOG_CREATED"
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_update", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_UPDATE),
			executionCheck: modifyExecutionCheck,
			historyEvent: "BLOG_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_delete", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_DELETE),
			historyEvent: "BLOG_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_read", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_READ)
		},
		publish: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_update", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_UPDATE),
			execute: publish,
			historyEvent: "BLOG_PUBLISH"
		},
		unPublish: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_update", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_UPDATE),
			execute: unPublish,
			historyEvent: "BLOG_UNPUBLISH"
		},
		majorPublish: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.blog::v_auth_blogs_update", "BLOG_ID", BlogMessage.AUTH_MISSING_BLOG_UPDATE),
			execute: publish,
			historyEvent: "BLOG_MAJORPUBLISH"
		},
		deleteTagAssignments: TagAssignment.includeDeleteTagAssignment(),
		mergeTagAssignments: TagAssignment.includeMergeTagAssignment()
	},
	Root: {
		table: "sap.ino.db.blog::t_blog",
		sequence: "sap.ino.db.blog::s_blog",
		historyTable: "sap.ino.db.blog::t_blog_h",
		determinations: {
			onCreate: [initBlog],
			onModify: [determine.systemAdminData, TagAssignment.createTags, updateShortDescription],
			onPersist: []
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			TITLE: {},
			DESCRIPTION: {},
			DESCRIPTION_MIME_TYPE: {},
			OBJECT_ID: {
				foreignKeyTo: "sap.ino.xs.object.campaign.Campaign.Root"
			},
			OBJECT_TYPE_CODE: {},
			IS_MAJOR_CHANGE: {},
			STATUS_CODE: {
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
			},
			PUBLISHED_AT: {
				readOnly: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			COMMENT_COUNT: {
				readOnly: true
			},
			VIEW_COUNT: {
				readOnly: true
			}
		},
		nodes: {
			Author: IdentityRole.node(IdentityRole.ObjectType.Blog, IdentityRole.Role.BlogAuthor, true),
			Tags: TagAssignment.node(TagAssignment.ObjectTypeCode.Blog),
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Blog, AttachmentAssignment.FilterTypeCode.Frontoffice),
			ContentAttachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.BlogContent, AttachmentAssignment.FilterTypeCode.Frontoffice,
				AttachmentAssignment.RoleCode.BlogContentImg)
		}
	}
};

function initBlog(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oWorkObject.Author = [{
		ID: fnNextHandle(),
		IDENTITY_ID: iUserId
    }];

	oWorkObject.STATUS_CODE = Status.Draft;
	oWorkObject.DESCRIPTION_MIME_TYPE = 'text/html';
	oWorkObject.IS_MAJOR_CHANGE = 0;
	oWorkObject.COMMENT_COUNT = 0;
	oWorkObject.VIEW_COUNT = 0;
}

function publish(vKey, oParameters, oBlog, addMessage, getNextHandle, oContext) {
	oBlog.STATUS_CODE = Status.Published;
	oBlog.PUBLISHED_AT = oContext.getRequestTimestamp();
}

function unPublish(vKey, oParameters, oBlog, addMessage, getNextHandle, oContext) {
	oBlog.STATUS_CODE = Status.Draft;
}

function updateShortDescription(vKey, oWorkObject) {
	oWorkObject.SHORT_DESCRIPTION = _.stripTags(oWorkObject.DESCRIPTION || "").substring(0, 500);
}

function modifyExecutionCheck(vKey, oChangeRequest, oBlog, oPersistedBlog, addMessage, oContext) {
	if (oBlog.Author.length !== 1) {
		addMessage(Message.MessageSeverity.Error, BlogMessage.CHECK_AUTHOR_LENGTH, vKey);
	}

}