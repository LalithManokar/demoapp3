var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.RoleCode = {
	CampaignUser : "CAMPAIGN_USER",
	CampaignIdeaReader : "CAMPAIGN_IDEA_READER",
	CampaignManager : "CAMPAIGN_MANAGER",
	CampaignCoach : "CAMPAIGN_COACH",
	IdeaSubmitter : "IDEA_SUBMITTER",
	CampaignExpert : "CAMPAIGN_EXPERT",
	IdeaExpert : "IDEA_EXPERT",
	EvaluationOwner : "EVALUATION_OWNER",
	IdeaContributor : "IDEA_CONTRIBUTOR",
	CommentOwner : "COMMENT_OWNER",
	AttachmentOwner : "ATTACHMENT_OWNER",
	FolderOwner : "FOLDER_OWNER",
	FolderAccessor : "FOLDER_ACCESSOR",
	WallOwner : "WALL_OWNER",
	WallReader : "WALL_READER",
	WallWriter : "WALL_WRITER",
	WallAdmin : "WALL_ADMIN",
	RespExpert : "RESP_EXPERT" 
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.iam::t_role",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_role"
        }
    }
};