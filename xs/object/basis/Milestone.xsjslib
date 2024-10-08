var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.Milestone = {
    CampaignStart : "CAMP_START",
    CampaignEnd : "CAMP_END",
    CampaignRegisterStart : "CAMP_REGISTER_START",
    CampaignRegisterEnd : "CAMP_REGISTER_END",
    IdeaSubmitStart : "IDEA_SUBMIT_START",
    IdeaSubmitEnd : "IDEA_SUBMIT_END"
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.basis::t_milestone",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_milestone"
        }
    }
};