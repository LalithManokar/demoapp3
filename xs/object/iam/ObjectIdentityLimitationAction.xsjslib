var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var check = $.import("sap.ino.xs.aof.lib", "check");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CampMessage = $.import("sap.ino.xs.object.campaign", "message");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);

this.Action = {
IDEA_VOTE:"IDEA_VOTE1",
CAMPAIGN_SUBMIT:"CAMPAIGN_SUBMIT",
CAMPAIGN_REGISTER:"CAMPAIGN_REGISTER",
IDEA_COMMENT:"IDEA_COMMENT",
MGR_DISPLAY_HOMEPAGE:"MGR_DISPLAY_HOMEPAGE"
};
var that = this;

this.Role = {
    AttachmentOwner : "ATTACHMENT_OWNER",
    AttachmentFolderOwner : "FOLDER_OWNER",
    AttachmentFolderAccessor : "FOLDER_ACCESSOR",
    CampaignManager : "CAMPAIGN_MANAGER",
    CampaignCoach : "CAMPAIGN_COACH",
    CampaignExpert : "CAMPAIGN_EXPERT",
    CampaignUser : "CAMPAIGN_USER",
    CampaignIdeaReader : "CAMPAIGN_IDEA_READER",
    CommentOwner : "COMMENT_OWNER",
    InternalNoteOwner : "INTERNAL_NOTE_OWNER",
    EvaluationOwner : "EVALUATION_OWNER",
    IdeaSubmitter : "IDEA_SUBMITTER",
    IdeaContributor : "IDEA_CONTRIBUTOR",
    IdeaCoach : "IDEA_COACH",
    IdeaExpert : "IDEA_EXPERT",
    WallOwner : "WALL_OWNER",
    WallReader : "WALL_READER",
    WallWriter : "WALL_WRITER",
    WallAdmin : "WALL_ADMIN",
    ResponsibilityCoach : "RESP_COACH",
    ResponsibilityExpert : "RESP_EXPERT",
    BlogAuthor : "BLOG_AUTHOR",
    EvaluationRequestOwner : "EVAL_REQUEST_OWNER",
    EvaluationRequestExpert : "EVAL_REQUEST_EXPERT"
};

this.ObjectType = {
    Attachment : "ATTACHMENT",
    AttachmentFolder : "FOLDER",
    AttachmentFolderShare : "SHARE",
    Campaign : "CAMPAIGN",
    Comment : "COMMENT",
    CampaignComment : "CAMPAIGN_COMMENT",
    InternalNote : "INTERNAL_NOTE",
    Evaluation : "EVALUATION",
    Idea : "IDEA",
    Wall : "WALL",
    Responsibility : "RESPONSIBILITY",
    Blog : "BLOG",
    EvaluationRequest : "EVAL_REQUEST",
    EvaluationRequestItem : "EVAL_REQUEST_ITEM"
};
function node(sObjectType, sRole,bReadOnly) {
    return {
        table : "sap.ino.db.iam::t_object_identity_role",
        historyTable : "sap.ino.db.iam::t_object_identity_role_h",
        sequence : "sap.ino.db.iam::s_object_identity_role",
        parentKey : "OBJECT_ID",
        readOnly : bReadOnly,
        consistencyChecks : [check.duplicateCheck("IDENTITY_ID", Message.DUPLICATE_IDENTITY)],
        attributes : {
            OBJECT_TYPE_CODE : {
                constantKey : sObjectType
            },
            ROLE_CODE : {
                constantKey : sRole
            },
            IDENTITY_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            }
        },
        nodes :{
            LimitOfParticipants: {
                table : "sap.ino.db.iam::t_object_identity_limitation_action",
                historyTable : "sap.ino.db.iam::t_object_identity_limitation_action_h",
                sequence : "sap.ino.db.iam::s_object_identity_limitation_action",
                parentKey : "OBJECT_ROLE_ID",
                readOnly : bReadOnly,
                consistencyChecks : [check.duplicateCheck("OBJECT_ROLE_ID", Message.OBJECT_ROLE_ID)],
                attributes : {
                    OBJECT_TYPE_CODE : {
                        constantKey : sObjectType
                    },
                    ACTION_CODE : {
                      consistencyChecks: [checkActionCode]
                    },
                    DISABLED :{
                      consistencyChecks :[check.booleanCheck]
                    }
                }
            }
        }
    };
}
function checkActionCode(vKey, oActionCode, addMessage, oContext) {
	var ActionCode = that.Action;
	if(!ActionCode.hasOwnProperty(oActionCode.value.toString()))
	{
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_LIMITATION_ACTION_CODE, vKey, "Limitation", "ACTION_CODE",
			oActionCode.value);
	}
}
function nodeCampManager(sObjectType, sRole,bReadOnly) {
    return {
        table : "sap.ino.db.iam::t_object_identity_role",
        historyTable : "sap.ino.db.iam::t_object_identity_role_h",
        sequence : "sap.ino.db.iam::s_object_identity_role",
        parentKey : "OBJECT_ID",
        readOnly : bReadOnly,
        consistencyChecks : [check.duplicateCheck("IDENTITY_ID", Message.DUPLICATE_IDENTITY)],
        attributes : {
            OBJECT_TYPE_CODE : {
                constantKey : sObjectType
            },
            ROLE_CODE : {
                constantKey : sRole
            },
            IDENTITY_ID : {
                foreignKeyTo : "sap.ino.xs.object.iam.Identity.Root"
            }
        },
        nodes :{
            LimitOfCampaignManagers: {
                table : "sap.ino.db.iam::t_object_identity_limitation_action",
                historyTable : "sap.ino.db.iam::t_object_identity_limitation_action_h",
                sequence : "sap.ino.db.iam::s_object_identity_limitation_action",
                parentKey : "OBJECT_ROLE_ID",
                readOnly : bReadOnly,
                consistencyChecks : [check.duplicateCheck("OBJECT_ROLE_ID", Message.OBJECT_ROLE_ID)],
                attributes : {
                    OBJECT_TYPE_CODE : {
                        constantKey : sObjectType
                    },
                    ACTION_CODE : {
                      consistencyChecks: [checkActionCode]
                    },
                    DISABLED :{
                      consistencyChecks :[check.booleanCheck]
                    }
                }
            }
        }
    };
}


