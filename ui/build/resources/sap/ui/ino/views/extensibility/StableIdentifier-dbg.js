/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.extensibility.StableIdentifier");

(function() {
    "use strict";

    sap.ui.ino.views.extensibility.StableIdentifier = {
        BackOffice : {
            List : {
                Action : {
                    Export : "BUT_EXPORT"
                },
                Idea : {
                    View : {
                        IdeasToFollowUp : "followup",
                        UnassignedIdeas : "unassigned",
                        IdeasCoachedByMe : "mycoached",
                        IdeasInMyCampaigns : "mycampaigns",
                        EvaluatedIdeas : "evaluated",
                        AllIdeas : "all"
                    },
                    Column : {
                        Clipboard : "CLIPBOARD",
                        Name : "NAME",
                        FollowUpIsDue : "FOLLOW_UP_DUE",
                        FollowUpDate : "FOLLOW_UP_AT",
                        CoachName : "COACH_NAME",
                        AuthorName : "SUBMITTER_NAME",
                        Phase : "PHASE",
                        Status : "STATUS",
                        EvaluationCount : "EVALUATION_COUNT",
                        EvaluationCountInPhase : "EVALUATION_IN_PHASE_COUNT",
                        EvaluationInPhase : "EVAL_IN_PHASE",
                        EvaluationDate : "EVAL_DATE",
                        EvaluationOverallResult : "EVAL_OVERALL_RESULT",
                        ChangedAt : "CHANGED_AT",
                        SubmittedAt : "SUBMITTED_AT",
                        Score : "SCORE",
                        ExpertScore : "EXP_SCORE",
                        CommentCount : "COMMENT_COUNT",
                        CampaignName : "CAMPAIGN_NAME"
                    },
                    Action : {
                        AssignToCoach : "BUT_ASSIGN_TO",
                        AssignToMe : "BUT_ASSIGN_TO_ME",
                        UnassignCoach : "BUT_UNASSIGN",
                        ChangeStatus : "BUT_STATUS_TRANSITION",
                        FollowUp : "BUT_FOLLOW_UP",
                        Merge : "BUT_MERGE",
                        Del : "BUT_DELETE"
                    }
                },
                Campaign : {
                    View : {
                        ActiveCampaigns : "active",
                        DraftCampaigns : "draft",
                        FutureCampaigns : "future",
                        CompletedCampaigns : "completed"
                    },
                    Column : {
                        ShortName : "SHORT_NAME",
                        ValidFrom : "VALID_FROM",
                        ValidTo : "VALID_TO",
                        SubmitFrom : "SUBMIT_FROM",
                        SubmitTo : "SUBMIT_TO",
                        Status : "STATUS",
                        OpenForSubmission : "IS_OPEN_FOR_SUBMISSION",
                        Blackbox : "IS_BLACK_BOX"
                    },
                    Action : {
                        Display: "BUT_DISPLAY",
                        Create : "BUT_CREATE",
                        Edit : "BUT_EDIT",
                        Copy : "BUT_COPY",
                        Delete : "BUT_DELETE"
                    }
                }
            }
        },
        Mashup : {}
    };
})();