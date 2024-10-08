sap.ui.define([
    "sap/ino/vc/library",
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Item",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/controls/OrientationType",
    "sap/ino/vc/idea/mixins/AssignmentActionMixin",
    "sap/ino/vc/idea/mixins/ChangeStatusActionMixin",
    "sap/ino/vc/idea/mixins/FollowUpMixin",
    "sap/ino/vc/idea/mixins/DeleteActionMixin",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/ino/vc/evaluation/EvaluationFormatter",
    "sap/m/Token",
    "sap/ino/vc/commons/mixins/ExportMixin",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/idea/mixins/MergeActionMixin",
    "sap/ino/vc/commons/mixins/ExtensibilityMixin",
    "sap/m/MessageBox",
    "sap/ino/commons/models/object/PersonalizeSetting",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/vc/commons/mixins/TagGroupMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/idea/mixins/ChangeStatusActionFormatter",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/vc/idea/mixins/AddExpertFromClipboardMixin",
    "sap/ino/vc/idea/mixins/CommonFilterMixin",
    "sap/ino/vc/idea/mixins/DueFilterMixin",
    "sap/ino/vc/idea/mixins/CampaignFormFilterMixin",
    "sap/ino/vc/idea/mixins/IdeaFormCriteriaFilterMixin",
    "sap/ino/vc/idea/mixins/ChangeAuthorActionMixin",
    "sap/ino/vc/idea/mixins/ChangeAuthorActionFormatter",
    "sap/ino/vc/idea/mixins/MarkAsReadActionMixin",
    "sap/ino/vc/idea/mixins/CompanyViewFilterMixin"
], function(lib,
	BaseController,
	Device,
	JSONModel,
	Sorter,
	Item,
	Configuration,
	CodeModel,
	ViewType,
	Filter,
	FilterOperator,
	ObjectListFormatter,
	OrientationType,
	AssignmentActionMixin,
	ChangeStatusActionMixin,
	FollowUpMixin,
	DeleteActionMixin,
	MessageToast,
	ValueState,
	DateFormat,
	EvaluationFormatter,
	Token,
	ExportMixin,
	VoteMixin,
	MergeActionMixin,
	ExtensibilityMixin,
	MessageBox,
	PersonalizeSetting,
	ApplicationObjectChange,
	TagGroupMixin,
	FollowMixin,
	ChangeStatusActionFormatter,
	VolunteerMixin,
	AddExpertFromClipboardMixin,
	CommonFilterMixin,
	DueFilterMixin,
	CampaignFormFilterMixin,
	IdeaFormCriteriaFilterMixin,
	ChangeAuthorActionMixin,
	ChangeAuthorActionFormatter,
	MarkAsReadActionMixin,
	CompanyViewFilterMixin
) {
	"use strict";

	var mStatus = {
		EMPTY: "",
		COMPLETED: "COMPLETED",
		NODISCONTINUED: "NODISCONTINUED",
		DISCONTINUED: "DISCONTINUED",
		ACTIVE: "ACTIVE",
		NEW: "NEW"
	};
	var mLatestUpdate = {
		EMPTY: "",
		// 		NEW_IDEAS: "SHOW_CREATED_VIEWER",
		NEW_UPDATES: "SHOW_UPDATED_VIEWER",
		NEW_STATUSES: "SHOW_STATUSCHANGE_VIEWER",
		NEW_COMMENTS: "SHOW_COMMENT_VIEWER"
	};
	var mOrder = {
		ASC: "ASC",
		DESC: "DESC"
	};

	var mIdeaRoutes = {
		IDEA: "idealist",
		IDEA_VARIANT: "idealistvariant"
	};

	var mOperator = {
		EQ: "EQ",
		GE: "GE",
		LE: "LE"
	};

	var mSort = {
		CHANGED_AT: "CHANGED_AT_DT",
		COMMENT_COUNT: "COMMENT_COUNT",
		EVALUATION_COUNT: "EVALUATION_COUNT",
		EXP_SCORE: "EXP_SCORE",
		FOLLOW_UP_DATE: "FOLLOW_UP_AT_DT",
		LAST_PUBL_EVAL_AT: "LAST_PUBL_EVAL_AT",
		NAME: "tolower(NAME)", // case insensitive sort order
		RESP_VALUE_LIST: "tolower(RESP_VALUE_NAME)",
		SCORE: "SCORE",
		SEARCH_SCORE: "SEARCH_SCORE",
		SUBMITTED_AT: "SUBMITTED_AT_DT",
		VOTE_COUNT: "VOTE_COUNT",
		CREATED_AT: "CREATED_AT"
	};

	var mVariant = {
		ALL: "all",
		MY: "my",
		VOTED: "voted",
		COMMENTED: "commented",
		VOTE: "vote",
		COMPLETED: "completed",
		MANAGED_COMPLETED: "managedcompleted",
		EVAL: "eval",
		EVAL_PENDING: "evalpending",
		MANAGE: "manage",
		FOLLOW_UP: "follow",
		UNASSIGNED: "unassigned",
		COACH_ME: "coachme",
		EVAL_DONE: "evaldone",
		EVAL_OPEN: "evalopen",
// 		MY_GROUP_COMPANY_AUTH: "mycompany",
// 		MY_GROUP_COMPANY_VOTED: "mycompanyvoted",
// 		MY_GROUP_COMPANY_COMMENTED: "mycompanycommented",
// 		MY_GROUP_ORGANIZATION_AUTH: "myorganization",
// 		MY_GROUP_ORGANIZATION_VOTED: "myorganizationvoted",
// 		MY_GROUP_ORGANIZATION_COMMENTED: "myorganizationcommented",
		MY_GROUP_VIEW_AUTH: "mygroup",
		MY_GROUP_VIEW_VOTED: "mygroupvoted",
		MY_GROUP_VIEW_COMMENTED: "mygroupcommented",
		FOLLOWING:"following"
	};

	var mFilter = {
		NONE: undefined,
		MY_AUTH: "myAuthoredIdeas",
		MY_VOTED: "myVotedIdeas",
		MY_COMMENTED: "myCommentedIdeas",
// 		MY_GROUP_COMPANY_AUTH: "myCompanyAuthoredIdeas",
// 		MY_GROUP_COMPANY_VOTED: "myCompanyVotedIdeas",
// 		MY_GROUP_COMPANY_COMMENTED: "myCompanyCommentedIdeas",	
// 		MY_GROUP_ORGANIZATION_AUTH: "myOrgAuthoredIdeas",
// 		MY_GROUP_ORGANIZATION_VOTED: "myOrgVotedIdeas",
// 		MY_GROUP_ORGANIZATION_COMMENTED: "myOrgCommentedIdeas",	
		MY_GROUP_VIEW_AUTH: "myGroupAuthoredIdeas",
		MY_GROUP_VIEW_VOTED: "myGroupVotedIdeas",
		MY_GROUP_VIEW_COMMENTED: "myGroupCommentedIdeas",
		OPEN_VOTE: "ideasIcanVoteFor",
		COMPLETED: "completedIdeas",
		MANAGED_COMPLETED: "managedCompletedIdeas",
		MY_EVAL: "myEvaluatedIdeas",
		EVAL_REQUIRED: "myEvaluatableIdeas",
		UNASSIGNED_COACH: "unassignedCoach",
		EVALUATED: "evaluatedIdeas",
		FOLLOW_UP: "followedupIdeas",
		COACH_ME: "coachedIdeasByMe",
		MANAGE: "",
		EVAL_OPEN: "openForEvaluation",
		FOLLOWING:"myFollowingIdeas"
	};

	var mList = {
		NAME: "IDEA_LIST_TIT_NAME",
		MANAGEDNAME: "IDEA_LIST_TIT_MANAGEDNAME",
		
		IS_FILTER_SUBPAGE: true,
		ADJUSTMENT_TITLE: "IDEA_LIST_TIT_ADJUSTMENT",
		Filter: {
			Values: [{
				TEXT: "IDEA_LIST_MIT_FILTER_PHASE",
				KEY: "PHASE"
            }, {
				TEXT: "IDEA_LIST_MIT_FILTER_STATUS",
				KEY: "STATUS"
            }],
			/* this is fixed content and not equal to "sap.ino.xs.object.idea.Status.Root" */
			Status: [
		  //  {
				// TEXT: "IDEA_LIST_MIT_FILTER_STATUS_EMPTY",
				// KEY: mStatus.EMPTY
    //         }, 
				{
					TEXT: "IDEA_LIST_MIT_FILTER_STATUS_COMPLETED",
					KEY: mStatus.COMPLETED
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_STATUS_NODISCONTINUED",
					KEY: mStatus.NODISCONTINUED
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_STATUS_DISCONTINUED",
					KEY: mStatus.DISCONTINUED
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_STATUS_ACTIVE",
					KEY: mStatus.ACTIVE
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_STATUS_NEW_IDEAS",
					KEY: mStatus.NEW
            }],
			PhaseBinding: {
				MODEL: "code",
				CODE_PATH: "CODE",
				TABLE_PATH: "sap.ino.xs.object.campaign.Phase.Root",
				EMPTY_CODE_TEXT: "IDEA_LIST_MIT_FILTER_PHASE_EMPTY"
			},
			LatestUpdate: [
				// {
				// 	TEXT: "IDEA_LIST_MIT_FILTER_LATEST_UPDATE_NEW_IDEAS",
				// 	KEY: mLatestUpdate.NEW_IDEAS
    //         }, 
				{
					TEXT: "IDEA_LIST_MIT_FILTER_LATEST_UPDATE_NEW_UPDATES",
					KEY: mLatestUpdate.NEW_UPDATES
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_LATEST_UPDATE_NEW_STATUSES",
					KEY: mLatestUpdate.NEW_STATUSES
            }, {
					TEXT: "IDEA_LIST_MIT_FILTER_LATEST_UPDATE_NEW_COMMENTS",
					KEY: mLatestUpdate.NEW_COMMENTS
            }]
		},
		QuickSorter: [
			{
				TEXT: "SORT_MIT_MOST_RECENT",
				ACTION: mSort.CREATED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_LATEST_CHANGE",
				ACTION: mSort.CHANGED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_MOST_VOTE",
				ACTION: mSort.VOTE_COUNT,
				DEFAULT_ORDER: mOrder.DESC
            }
		],
		Sorter: {
			Values: [{
				TEXT: "SORT_MIT_CHANGED",
				ACTION: mSort.CHANGED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_SUBMITTED",
				ACTION: mSort.SUBMITTED_AT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_TITLE",
				ACTION: mSort.NAME,
				DEFAULT_ORDER: mOrder.ASC
            }, {
				TEXT: "SORT_MIT_VOTE",
				ACTION: mSort.SCORE,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_VOTE_NUM",
				ACTION: mSort.VOTE_COUNT,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_RESP_VALUE_LIST",
				ACTION: mSort.RESP_VALUE_LIST,
				DEFAULT_ORDER: mOrder.DESC
            }, {
				TEXT: "SORT_MIT_SEARCH_SCORE",
				ACTION: mSort.SEARCH_SCORE,
				DEFAULT_ORDER: mOrder.DESC
            }],
			Limit: 2
		},
		Order: {
			Values: [{
				TEXT: "ORDER_MIT_ASC",
				ACTION: mOrder.ASC
		    }, {
				TEXT: "ORDER_MIT_DESC",
				ACTION: mOrder.DESC
		    }]
		},
		Operator: {
			Values: [{
				TEXT: "OPERATOR_MIT_EQ",
				ACTION: mOperator.EQ
		    }, {
				TEXT: "OPERATOR_MIT_GE",
				ACTION: mOperator.GE
		    }, {
				TEXT: "OPERATOR_MIT_LE",
				ACTION: mOperator.LE
		    }]
		},
		Variants: {
			DEFAULT_VARIANT: mVariant.ALL,
			TITLE: "IDEA_LIST_TIT_VARIANTS",
			Values: [{
				TEXT: "IDEA_LIST_MIT_EVAL_PENDING",
				ACTION: mVariant.EVAL_PENDING,
				FILTER: mFilter.EVAL_REQUIRED,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 0,
				OBJECT_TYPE_CODE: mFilter.EVAL_REQUIRED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ENABLED: 1,
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_OPEN_FOR_EVAL",
				ACTION: mVariant.EVAL_OPEN,
				FILTER: mFilter.EVAL_OPEN,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 1,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.EVAL_OPEN,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_expert_role",
					"sap.ino.ui::camps_resp_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_MY_EVAL",
				ACTION: mVariant.EVAL,
				FILTER: mFilter.MY_EVAL,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 2,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_EVAL,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_VOTE",
				ACTION: mVariant.VOTE,
				FILTER: mFilter.OPEN_VOTE,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 3,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.OPEN_VOTE,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_part_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_MY",
				ACTION: mVariant.MY,
				FILTER: mFilter.MY_AUTH,
				INCLUDE_DRAFT: true,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 4,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_AUTH,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_VOTED",
				ACTION: mVariant.VOTED,
				FILTER: mFilter.MY_VOTED,
				INCLUDE_DRAFT: true,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 5,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_VOTED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_COMMENTED",
				ACTION: mVariant.COMMENTED,
				FILTER: mFilter.MY_COMMENTED,
				INCLUDE_DRAFT: true,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 6,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_COMMENTED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_expert_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_COMPLETED",
				ACTION: mVariant.COMPLETED,
				FILTER: mFilter.COMPLETED,
				INCLUDE_DRAFT: false,
				COUNT: 0,
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 7,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.COMPLETED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
				    "sap.ino.ui::camps_part_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_ALL",
				ACTION: mVariant.ALL,
				FILTER: mFilter.NONE,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				ACTIVE: true,
				SEQUENCE: 8,
				OBJECT_TYPE_CODE: "all",
				ENABLED: 1,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role", "sap.ino.ui::camps_part_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_MANAGE",
				ACTION: mVariant.MANAGE,
				FILTER: mFilter.MANAGE,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 9,
				ENABLED: 1,
				OBJECT_TYPE_CODE: "IdeaTobeManaged",
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_FOLLOW_UP",
				ACTION: mVariant.FOLLOW_UP,
				FILTER: mFilter.FOLLOW_UP,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.FOLLOW_UP_DATE,
				HIERARCHY_LEVEL: "1",
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 10,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.FOLLOW_UP,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_UNASSIGNED",
				ACTION: mVariant.UNASSIGNED,
				FILTER: mFilter.UNASSIGNED_COACH,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 11,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.UNASSIGNED_COACH,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_COACH_ME",
				ACTION: mVariant.COACH_ME,
				FILTER: mFilter.COACH_ME,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 12,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.COACH_ME,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_EVAL_DONE",
				ACTION: mVariant.EVAL_DONE,
				FILTER: mFilter.EVALUATED,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.LAST_PUBL_EVAL_AT,
				HIERARCHY_LEVEL: "1",
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 13,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.EVALUATED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            }, {
				TEXT: "IDEA_LIST_MIT_COMPLETED",
				ACTION: mVariant.MANAGED_COMPLETED,
				FILTER: mFilter.MANAGED_COMPLETED,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.SUBMITTED_AT,
				HIERARCHY_LEVEL: "1",
				MANAGE: true,
				ACTIVE: true,
				SEQUENCE: 14,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MANAGED_COMPLETED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role"]
            },
          {   
				TEXT: "IDEA_LIST_MIT_FOLLOWING",
				ACTION: mVariant.FOLLOWING,
				FILTER: mFilter.FOLLOWING,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 15,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.FOLLOWING,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            } ,        

            {   
				TEXT: "IDEA_LIST_MIT_GROUP_" + Configuration.getGroupConfiguration().GROUP + "_AUTH",
				ACTION: mVariant.MY_GROUP_VIEW_AUTH,
				FILTER: mFilter.MY_GROUP_VIEW_AUTH,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 16,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_GROUP_VIEW_AUTH,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				DISPLAY_LABEL: Configuration.getGroupConfiguration().DISPLAY_LABEL,
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            },
            {   
				TEXT: "IDEA_LIST_MIT_GROUP_" + Configuration.getGroupConfiguration().GROUP + "_VOTED",
				ACTION: mVariant.MY_GROUP_VIEW_VOTED,
				FILTER: mFilter.MY_GROUP_VIEW_VOTED,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 17,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_GROUP_VIEW_VOTED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				DISPLAY_LABEL: Configuration.getGroupConfiguration().DISPLAY_LABEL,				
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            } ,
            {   
				TEXT: "IDEA_LIST_MIT_GROUP_" + Configuration.getGroupConfiguration().GROUP + "_COMMENTED",
				ACTION: mVariant.MY_GROUP_VIEW_COMMENTED,
				FILTER: mFilter.MY_GROUP_VIEW_COMMENTED,
				INCLUDE_DRAFT: false,
				COUNT: "0",
				DEFAULT_SORT: mSort.CHANGED_AT,
				HIERARCHY_LEVEL: "1",
				ACTIVE: true,
				SEQUENCE: 18,
				ENABLED: 1,
				OBJECT_TYPE_CODE: mFilter.MY_GROUP_VIEW_COMMENTED,
				TYPE_CODE: "QUICK_LINK_STANDARD_IDEA",
				DISPLAY_LABEL: Configuration.getGroupConfiguration().DISPLAY_LABEL,				
				ROLES: ["sap.ino.ui::camps_mgr_role", "sap.ino.ui::camps_coach_role", "sap.ino.ui::camps_resp_coach_role",
					"sap.ino.ui::camps_part_role", "sap.ino.ui::camps_expert_role", "sap.ino.ui::camps_resp_expert_role"]
            }           
            
            
            
            ]
		}
	};

	var DateFormatter = DateFormat.getInstance({
		pattern: "YYYY-MM-dd"
	});

	var mTypeCode = ["QUICK_LINK_CUSTOM_IDEA", "QUICK_LINK_STANDARD_IDEA"];

	/**
	 * @mixes AssignmentActionMixin, ChangeStatusActionMixin, FollowUpMixin, ExportMixin, VoteMixin, MergeActionMixin, ExtensibilityMixin, TagGroupMixin, FollowMixin
	 */
	var oIdeaList = BaseController.extend("sap.ino.vc.idea.List", jQuery.extend({}, AssignmentActionMixin, ChangeStatusActionMixin,
		FollowUpMixin, DeleteActionMixin, ExportMixin, VoteMixin, MergeActionMixin, ExtensibilityMixin, TagGroupMixin, FollowMixin,
		VolunteerMixin, AddExpertFromClipboardMixin, CommonFilterMixin, DueFilterMixin, CampaignFormFilterMixin, IdeaFormCriteriaFilterMixin,
		ChangeAuthorActionMixin, MarkAsReadActionMixin, CompanyViewFilterMixin, {
			/* ListModel defining filter, sorter and variants of the list */
			list: mList,
			// id of control that get initial focus
			initialFocus: "filterButton",
			/* ViewModel storing the current configuration of the list */
			view: {
				"NAME": "IDEA_LIST",
				"List": {
					"SORT": mSort.SUBMITTED_AT,
					"ORDER": undefined,
					"PHASE": [],
					"LATEST_UPDATE": [],
					"STATUS": [], //mStatus.EMPTY,
					"SUB_STATUS": [],
					"VARIANT": mVariant.ALL,
					"MANAGE": false,
					"TAGS": [],
					"IS_TAGS_SELECTION": false,
					"CAMPAIGN": undefined,
					"DUE": undefined,
					"AUTHORS": [],
					"COACHES": [],
					"TAGCLOUD": true,
					"EXTENSION": {},
					"RESP_VALUE_CODE": [],
					"RESP_VALUE_NAME": "",
					"VOTE_OPERATOR": mOperator.EQ,
					"VOTE_NUMBER": "",
					"TAGCLOUD_EXPABLE": true,
					"TAGCLOUD_EXP": false,
					"TAGCLOUD_BAR_VISIBLE": false,
					"HIDE_PPT_EXPORT": false,
					"IS_FILTER_SUBPAGE": true,
					"IS_SHOW_MORE_FILTER": true,
					"SELECT_ALL": false,
					"SELECT_ALL_ENABLE": false,
					"SHOW_MASS_ACTION_BAR": true,
					"EXPORT_ALL": false,
					"EXPORT_IDEA_VIA_EMAIL": Configuration.getSystemSettingsModel().getProperty("/sap.ino.config.EXPORT_IDEALIST_VIA_EMAIL_ACTIVE") ===
						"1",
					"IDEA_FILTER_SWITCH_VISIBLE": Configuration.getPersonalize().FILTER_ACTIVE_IDEA,
					"IDEA_FILTER_NEW_AND_INPROCESS": Configuration.getPersonalize().FILTER_ACTIVE_IDEA ? Configuration.getPersonalize().FILTER_ACTIVE_IDEA : false,
					"IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW": false,
					"IDEA_FILTER_COMMUNITY_GROUP_VIEW_VISIBLE": Configuration.getGroupConfiguration().ENABLE_GROUP_VIEW,
					"IDEA_LIST_FILTER_PERSONALIZATION": null,
					"QUICKLINKNAME": undefined,
					"ADDSHORTBYVALUE": true,
					"SELECTQUICKLINKID": undefined
				},
				"ORIENTATION": Configuration.getPersonalize().IDEA_VIEW ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE,
				"CLIPBOARD_ITEM_SELECT_COUNTER": 0,
				"QUICK_LINK_COUNT": 0,
				"NEWQUICKLINKFUNCTION": false,
				"ORIGINALVARIANT": undefined,
				"CURRENTURL": undefined
			},

			formatter: jQuery.extend({}, ObjectListFormatter, FollowUpMixin.followUpMixinFormatter, EvaluationFormatter,
				ChangeStatusActionFormatter, ChangeAuthorActionFormatter),

			onInit: function() {
				this.formatter.filterStyleClass = function(sValue) {
					return sValue === undefined ? "" : "sapUiTinyMarginBegin";
				};

				BaseController.prototype.onInit.apply(this, arguments);

				this.oViewModel = this.getModel("view");
				this.oViewModel.setData(this.view, true);

				// TODO currently we always start with the card layout => instead use orientation in viewdata / real orientation
				this.getList().addStyleClass(this.getPortraitStyle());
				this.getList().setWrapping(true);

				this.getList().attachUpdateFinished(this.onUpdateFinished, this);
				this.initApplicationObjectChangeListeners();

				// if(this.byId("subStatusSelect")._oTokenizer){
				// this.byId("subStatusSelect")._oTokenizer.setEditable(false);
				// }
				this.initFilterItemModel();
				this.initCompanyView();
			},

			onAfterRendering: function() {
				/*var that = this;
				["panelFilterFragment--communityQuickLinkIdeaList","panelFilterFragment--backOfficeQuickLinkIdeaList"].forEach(function(oId){
					var quickLinkIdeaList = that.byId(oId);
					quickLinkIdeaList.addEventDelegate({
						onAfterRendering: function(oEvent){
							that.firstQuickIdea = quickLinkIdeaList.getVisibleItems()[0];
						} 
					},that);
				});*/
			},

			getScrollContainer: function() {
				return this.byId("scrollContainer");
			},

			addSubFilterPageContent: function(vContent) {
				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				aPages[0].getContent()[0].addItem(vContent);
				this.onSetFilterBarVisible("authorFilter", "coachFilter");
			},

			removeSubFilterPageContent: function() {
				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oFilterContainer = aPages[0].getContent()[0];
				if (oFilterContainer.getItems().length > 2) {
					//oFilterContainer.removeItem(oFilterContainer.getItems()[3]);
					oFilterContainer.getItems()[2].destroy(true);
				}
			},

			//TODO limit sietnature to 1: route 2: query => no support for onRouteMatched Signature
			show: function(oEvent, oObject) {
				var oQuery;
				var sVariant;
				if (oEvent && oEvent.getParameter) {
					var oArguments = oEvent.getParameter("arguments");
					oQuery = oArguments["?query"];
					sVariant = oArguments.variant;
				} else {
					sVariant = oObject.variant;
					oQuery = oObject;
				}

				var that = this;
				var currentUrl = location.href.split("#/")[1];
				if (currentUrl) {
					this.setViewProperty("/CURRENTURL", decodeURIComponent(currentUrl));
				}

				this.setViewProperty("/ORIGINALVARIANT", sVariant);
				if (this.getVariant(sVariant) && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
					var bChangedShowBackoffice = this.getVariant(sVariant).MANAGE ? true : false;
					this.getModel("component").setProperty("/SHOW_BACKOFFICE", bChangedShowBackoffice);
				}
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				var sDefaultVariant = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access") && !this._iCampaignId &&
					bShowBackoffice ? mVariant.MANAGE : this.getListProperty("/Variants/DEFAULT_VARIANT");
                if(this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW")){
                    sDefaultVariant = mVariant.MY;
                }
                
				//For Global search results
				if (oQuery && oQuery.managed && !sVariant) {
					if (!this.getModel("component").getProperty("/SHOW_BACKOFFICE")) {
						sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
					} else {
						sDefaultVariant = mVariant.MANAGE;
					}
					this.setViewProperty("/ORIGINALVARIANT", sVariant || sDefaultVariant);
					oQuery.sort = mSort.SEARCH_SCORE;
				}

				this.setViewProperty("/isre", sVariant || sDefaultVariant);
				this.setViewProperty("/Variants/DEFAULT_VARIANT", sDefaultVariant);

				sVariant = this.getViewProperty("/isre");
				var oVariant = jQuery.extend(true, {}, this.getVariant(sVariant));
				this.changeDefaultSortOfVariant(oVariant, oQuery);
				this.setViewProperty("/List/VARIANT", oVariant.ACTION);
				this.campaignId = oObject && oObject.campaign || '';

				var aSorter, aQuickSorter;
				var bBound = this.getList().isBound("items");

				// even if there is no query defined, we need to add the default sorter that is applied
				if ((!oQuery || !oQuery.sort) && oVariant.DEFAULT_SORT) {
					var sDefaultSort = oVariant.DEFAULT_SORT;
					var sDefaultOrder;
					var aSort = this.getSort(sDefaultSort);
					if (aSort.length > 0) {
						sDefaultOrder = aSort[0].DEFAULT_ORDER;
					}
					oQuery = oQuery || {};

					oQuery.sort = oQuery.sort || sDefaultSort;

					// enhance for sort combination
					oQuery.sort = oQuery.sort + " " + (oQuery.order || sDefaultOrder);
				}
				// //If it's the search mode just use the search Score to sort
				// if(window.location.hash.indexOf('search') > -1){   
				//          oQuery = oQuery || {};
				// 	     oQuery.sort = mSort.SEARCH_SCORE + " " + mOrder.DESC;
				// 	     this.setViewProperty("/List/SORT",mSort.SEARCH_SCORE);
				// }
				var bRebindRequired = this.hasStateChanged(this.getCurrentRoute(), sVariant, oQuery, Device.orientation.portrait);
				bRebindRequired = bRebindRequired || this._bListChanged;
				this._bListChanged = false;

				var systeamSetting = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE");
				this.setViewProperty('/List/DISABLE_IDEA_IMAGE', !!(systeamSetting * 1));

				var sIdeaFilterChange = this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS");
				if (!bBound || bRebindRequired) {

					this.setParameters(oQuery, oVariant);

					// update the VISIBILITY flag of all variants for binding in Filter
					this.setVariantVisibility(oVariant);

					//remove some filters not available in the variants
					this.removeInvalidFilters(oQuery.variant ? oQuery : {
						variant: sVariant
					});

					/* -- Do not show the filterbar automatically but let the user change it -- */

					aSorter = this.getSort(this.getViewProperty("/List/SORT"));
					aQuickSorter = this.getQuickSort(this.getViewProperty("/List/QUICKSORT"));

					this.setSorter(aQuickSorter.concat(aSorter));
					this.updateFilter();

					//TODO move to ListPage
					var iOrientation = this.getViewProperty("/ORIENTATION");
					this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

					//this.setSortIcon(this.byId("panelFilterFragment--sortreverse"), this.getViewProperty("/List/ORDER"));

					//idea count  
					this.getIdeaFilterCount(oQuery); 

					//quick links
					this.getQuickLinkSetting(oVariant, oEvent, oQuery);

					//filter setting
					this.getIdeaFilterSetting();

					this.bindList();
					this.initialSorterItems();
					this.bindTagCloud();
					if (this.getViewProperty("/List/IS_SHOW_MORE_FILTER")) {
						this.bindFilters();
					}
				}

				["statusSelect", "subStatusSelect", "phaseSelect"].forEach(function(sId) {
					var oControl = that.byId(sId);
					if (!oControl) {
						return;
					}
					oControl.onAfterRendering = function() {
						if (oControl._oTokenizer) {
							oControl._oTokenizer.setEditable(false);
						}
					};
				});

				this._deriveMassActionButtonEnabledStatus();
				this.setShortByIcon("shortByIcon1", "shortByIcon2");
			},

			getIdeaFilterSetting: function() {
				var that = this;
				PersonalizeSetting.getFilterSettings().done(function(data) {
					var oViewModel = that.getModel("view");
					oViewModel.setProperty("/List/IDEA_LIST_FILTER_PERSONALIZATION", data.RESULT);
				});
			},

			getIdeaFilterCount: function(oQuery) {
				var aVariants = this.getModel("list").getProperty("/Variants/Values") || '';
				var aStatus = this.getViewProperty("/List/STATUS") || [];
				var sSubStatus = this.getViewProperty("/List/SUB_STATUS") && this.getViewProperty("/List/SUB_STATUS").toString();
				var sRespListValueCode = this.getViewProperty("/List/RESP_VALUE_CODE").map(function(oResp) {
					return oResp.code;
				});
				//var sRespName = this.getViewProperty("/List/RESP_VALUE_NAME") || '';
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				var sPhase = this.getViewProperty("/List/PHASE") && this.getViewProperty("/List/PHASE").toString();
				var sCampaign = this.getViewProperty("/List/CAMPAIGN") || '';
				var oCampaignId = this.campaignId;
				var search = oQuery.search || "";
				var sVoteNum = this.getViewProperty("/List/VOTE_NUMBER");
				var sVoteOperator = this.getViewProperty("/List/VOTE_OPERATOR");
				var authorKeys = this.getViewProperty("/List/AUTHORS") && this.getViewProperty("/List/AUTHORS").toString();
				var coachKeys = this.getViewProperty("/List/COACHES") && this.getViewProperty("/List/COACHES").toString();
				var sLatestUpdate = this.getViewProperty("/List/LATEST_UPDATE") && this.getViewProperty("/List/LATEST_UPDATE").toString();
				var aTags = this.getViewProperty("/List/TAGS");
				var tagGroup = {};
				var tagGroupKey = [];

				aTags.forEach(function(item) {
					if (!tagGroup[item.ROOTGROUPID]) {
						tagGroup[item.ROOTGROUPID] = [];
						tagGroup[item.ROOTGROUPID].push(item.ID);
						tagGroupKey.push(item.ROOTGROUPID);
					} else {
						tagGroup[item.ROOTGROUPID].push(item.ID);
					}
				});
				if (oCampaignId === '') {
					oCampaignId = sCampaign;
				}

				var sIdeaFilterChangeNum = this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS");
				var oCamObeject = {
					searchToken: window.decodeURIComponent(search),
					searchType: this.getSearchType(),
					CAMPAIGN_ID: oCampaignId,
					oIdeaFilterChange: sIdeaFilterChangeNum,
					phase: sPhase,
					status_code: sSubStatus,
					status_type: aStatus.join(","),
					resp_code: sRespListValueCode.length > 0 ? sRespListValueCode.join(",") : "",
					dueFrom: this.getFilterItem("/DueFrom"),
					dueTo: this.getFilterItem("/DueTo"),
					vote_num: sVoteNum,
					vote_operator: sVoteOperator,
					authorKeys: authorKeys,
					coachKeys: coachKeys,
					latestUpdate: sLatestUpdate,
					tagTokens: tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
					tagTokens1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
					tagTokens2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
					tagTokens3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
					tagTokens4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
					ideaFormId: this.getCampaignFormQuery(),
					bShowBackoffice: bShowBackoffice
				};
				this.getIdeaformQuery(oCamObeject);
				this.getCompanyViewQuery(oCamObeject);
				var oListModel = this.getModel("list");
				var oCurrentQuickLink = this.getModel("list").getProperty("/CURRENTQUICKLINK");
				Configuration.getIdeaFilterCount(oCamObeject, oListModel, aVariants, oCurrentQuickLink);
			},

			getQuickLinkSetting: function(oCurrentVariant, oEvent, oQuery) {
				var that = this;
				var aVariants = this.getModel("list").getProperty("/Variants/Values") || '';
				this.getModel("list").setProperty("/CURRENTQUICKLINK", undefined);
				PersonalizeSetting.getQuickLinkSettings({
					'TYPE_CODE': mTypeCode
				}).done(function(data) {
					if (data.RESULT.length > 0 && aVariants) {
						data.RESULT.forEach(function(oResult) {
							aVariants.forEach(function(oVariant) {
								if (oResult.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oVariant.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oResult.OBJECT_TYPE_CODE ===
									oVariant.OBJECT_TYPE_CODE) {
									oVariant.ACTIVE = oResult.ACTIVE === 1 ? true : false;
									oVariant.SEQUENCE = oResult.SEQUENCE;
									oVariant.ID = oResult.ID;
									oVariant.ENABLED = oResult.ENABLED;
								} else if (oResult.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
									// get filter infomation from link url
									// oResult.FILTER_INFO = that.getFilterInfoByLink(oResult.LINK_URL);
									var newQuickLink = aVariants.every(function(oitem) {

										if (oitem.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA") {
											return true;
										}

										if (oitem.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
											return oResult.ID !== oitem.ID;
										}
									});

									if (newQuickLink && oVariant.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oResult.OBJECT_TYPE_CODE === oVariant.OBJECT_TYPE_CODE) {
										oResult.ACTIVE = oResult.ACTIVE === 1 ? true : false;
										oResult.FILTER = oVariant.FILTER;
										oResult.ACTION = oVariant.ACTION;
										oResult.ROLES = oVariant.ROLES;
										if (oVariant.MANAGE) {
											oResult.MANAGE = oVariant.MANAGE;
										}
										aVariants.push(oResult);
									}
								}
							});
						});
						that.setViewProperty("/NEWQUICKLINKFUNCTION", true);
					}
					that.getModel("list").setProperty("/Variants/Values", aVariants);
					that.setVariantVisibility(oCurrentVariant);

					//check visiablity for current Variiant
					var bVisible = that.getVariantVisibility(oCurrentVariant.ACTION);
					if (bVisible === false || typeof(bVisible) === "undefined") {
						that.navigateToTopLink(oQuery);
						return;
					}

					 	that.getCurrentUrlId();
					// 	var originalVariant = that.getViewProperty("/ORIGINALVARIANT");
					//  		var newQuickLinkFunction = that.getViewProperty("/NEWQUICKLINKFUNCTION");
					//  		if((!originalVariant && newQuickLinkFunction && oEvent.getParameter) || that.bOfficeToggle){
					//  			that.bOfficeToggle = false;
					// 		that.navigateToTopLink(oQuery);
					// 	}
				});
			},

			navigateToTopLink: function(oQuery) {
				var oQuickLinkList = this.getCurrentQuickIdeaList();
				this.navigateToFirstQuickLink(oQuickLinkList.getVisibleItems(), oQuery);

			},

			getFilterInfoByLink: function(sLink) {
				sLink = sLink || '';
				sLink = sLink.split('?');
				if (sLink.length >= 2) {
					sLink = sLink[1];
				}
				var aFilter = sLink !== '' ? sLink.split('&') : [];
				var oResult = {},
					aFound, sKey, sValue;
				var oRegex = /(.*)=([^&]+)/;
				for (var i = 0; i < aFilter.length; i++) {
					aFound = aFilter[i].match(oRegex);
					if (aFound && aFound.length === 3) {
						sKey = aFound[1].toUpperCase();
						sValue = aFound[2];
						oResult[sKey] = sValue;
					}
				}
				return oResult;
			},

			setShortByIcon: function(shortByIconA, shortByIconB) {
				var oIcon1 = this.byId(shortByIconA) || this.getFilterElementById(shortByIconA);
				var aIcons = ["sap-icon://sort-ascending", "sap-icon://sort-descending"];
				var sSort = this.getViewProperty("/List/SORT");
				var aSortOrder = sSort.split(",");
				var aSO1 = aSortOrder[0].split(" ");
				if (aSO1[1] === "ASC" && oIcon1) {
					oIcon1.setSrc(aIcons[0]);
					oIcon1.setTooltip(this.getText('EXP_ASCENDING_SORT_BUTTON'));
				} else if (aSO1[1] === "DESC" && oIcon1) {
					oIcon1.setSrc(aIcons[1]);
					oIcon1.setTooltip(this.getText('EXP_DESCENGDING_SORT_BUTTON'));
				}
				if (aSortOrder[1]) {
					var oIcon2 = this.byId(shortByIconB) || this.getFilterElementById(shortByIconB);
					var aSO2 = aSortOrder[1].split(" ");
					if (aSO2[1] === "ASC" && oIcon2) {
						oIcon2.setSrc(aIcons[0]);
						oIcon2.setTooltip(this.getText('EXP_ASCENDING_SORT_BUTTON'));
					} else if (aSO2[1] === "DESC" && oIcon2) {
						oIcon2.setSrc(aIcons[1]);
						oIcon2.setTooltip(this.getText('EXP_DESCENGDING_SORT_BUTTON'));
					}
				}
			},

			setVariantVisibility: function(oQueryVariant) {
				var aVariants = this.getModel("list").getProperty("/Variants/Values");
				// var oCampaignId;
				//  var IdeaFilterModel;
				// if(this.campaignId){
				//     oCampaignId = this.campaignId;
				//       IdeaFilterModel = Configuration.getIdeaFilterCount(oCampaignId);
				// }else{

				//      IdeaFilterModel = Configuration.getIdeaFilterCount();
				// }

				//             for(var i = 0; i < aVariants.length; i += 1){
				//             this.getModel("list").setProperty("/Variants/Values/" + i + "/COUNT",IdeaFilterModel[this.getModel("list").getProperty("/Variants/Values/" + i + "/ACTION")]);

				//}   
				var oExistsRoles = this.getModel("user").getProperty("/privileges");
				// fix in campaign idea list quicklink toggle office button not work issue
				// if (this.getModel('component').getProperty('/SHOW_BACKOFFICE') && oQueryVariant && !oQueryVariant.MANAGE) {
				// 	this.getModel('component').setProperty('/SHOW_BACKOFFICE', false);
				// }
				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];
					// 	var bIsManage = oVariant.MANAGE || false;
					// 	var bIsExpert = oVariant.EXPERT || false;
					// 	var bIsCampaignManage = oVariant.CAMPAIGN_MANAGE || false;

					// 	var bVisible = (!bIsManage && !bIsExpert && !bIsCampaignManage) ||
					// 		// user has expert role and variant is for experts
					// 		(bIsExpert && Configuration.hasCurrentUserPrivilege("sap.ino.ui::expert")) ||
					// 		// user has campaign manager role and variant is for campaign manager
					// 		(bIsCampaignManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager")) ||
					// 		// user has general backoffice privileges and variant has manage flag
					// 		(bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));
					var bVisible = false;
					if (oExistsRoles) {
						for (var iRoleIndex = 0; iRoleIndex <= oVariant.ROLES.length - 1; iRoleIndex++) {
							if (oExistsRoles[oVariant.ROLES[iRoleIndex]]) {
								bVisible = true;
								break;
							}
						}
					}
					if( !this.getModel('component').getProperty('/SHOW_BACKOFFICE') && this.getViewProperty("/List/IDEA_FILTER_COMMUNITY_GROUP_VIEW_VISIBLE") ){
                              
                              if(oVariant.ACTION === mVariant.MY_GROUP_VIEW_AUTH
                                  || oVariant.ACTION === mVariant.MY_GROUP_VIEW_VOTED
                                  || oVariant.ACTION === mVariant.MY_GROUP_VIEW_COMMENTED 
                                  || oVariant.ACTION === mVariant.FOLLOWING){
                              bVisible = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW");
                              } else {
                                bVisible = !this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW");
                              }
                              if(this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW") && 
                                (oVariant.ACTION === mVariant.MY  || oVariant.ACTION === mVariant.COMMENTED || oVariant.ACTION === mVariant.VOTED )){
                                 bVisible = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW"); 
                              }
					}
					if(!this.getViewProperty("/List/IDEA_FILTER_COMMUNITY_GROUP_VIEW_VISIBLE") && oVariant.TEXT && oVariant.TEXT.indexOf("_GROUP_") > -1){
					    bVisible = false;
					}
					
					if (this.getModel('component').getProperty('/SHOW_BACKOFFICE') && Configuration.hasCurrentUserPrivilege(
						"sap.ino.ui::backoffice.access")) {
						bVisible = (oVariant.MANAGE || false) && bVisible;

						if (oVariant.ACTION === mVariant.MANAGED_COMPLETED && this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS")) {
							bVisible = false;
						}
					}
					

					
					this.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
				}
			},

			getVariantVisibility: function(sVariant) {
				var aVariants, bVisible;

				aVariants = this.getModel("list").getProperty("/Variants/Values");

				for (var i = 0; i < aVariants.length; i += 1) {
					var oVariant = aVariants[i];

					if (oVariant.ACTION === sVariant) {
						bVisible = oVariant.VISIBLE;
					}
				}

				return bVisible;
			},

			getPortraitStyle: function() {
				return "sapInoIdeaListCardItems";
			},

			getList: function() {
				return this.byId("objectlist");
			},

			getExportControl: function() {
				return this.getList();
			},

			removeInvalidFilters: function(oQuery) {
				var bIsManage = false;
				var sVariant = oQuery.variant ? oQuery.variant : this.getViewProperty("/List/VARIANT");
				if (sVariant) {
					var oVariant = this.getVariant(sVariant);
					bIsManage = oVariant ? oVariant.MANAGE : false;
				}

				if (!bIsManage) {
					// update the given query
					delete oQuery.due;
					delete oQuery.authors;
					delete oQuery.coaches;
					jQuery.each(this.getViewProperty("/List/EXTENSION") || {}, function(iIndex, sExtensionField) {
						delete oQuery[sExtensionField.toLowerCase()];
					});

					this.restDue();
					this.setViewProperty("/List/AUTHORS", []);
					this.setViewProperty("/List/COACHES", []);
					this.setViewProperty("/List/EXTENSION", {});
				}

				if (this.getViewProperty("/List/HIDE_STATUS")) {
					delete oQuery.status;
					this.setViewProperty("/List/STATUS", undefined);
				}
			},

			getBindingParameter: function() {
				var sVariant, sVariantFilter;
				sVariant = this.getViewProperty("/List/VARIANT");
				sVariantFilter = this.getCurrentVariant().FILTER;
				var sSearchTerm = this.getViewProperty("/List/SEARCH");
				var aTags = this.getViewProperty("/List/TAGS");
				var sCampaignId = this.getViewProperty("/List/CAMPAIGN");

				var aTagId = jQuery.map(aTags, function(oTag) {
					return oTag.ID;
				});

				var aRespValueCode = this.getViewProperty("/List/RESP_VALUE_CODE").map(function(oResp) {
					return oResp.code;
				});
				var aFilters = [{
						key: "ideaFilterContinuingChange",
						value: (this._check4ManagingList() && this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS")) ? 'true' : 'false'
				    }, {
						key: "status",
						value: this.getViewProperty("/List/STATUS")
				    }, {
						key: "sub_status",
						value: this.getViewProperty("/List/SUB_STATUS")
				    }, {
						key: "resp_value_code",
						value: aRespValueCode.join(",")
				    }, {
						key: "vote_number",
						value: this.getViewProperty("/List/VOTE_NUMBER")
				    }, {
						key: "vote_operator",
						value: this.getViewProperty("/List/VOTE_OPERATOR")
				    }, {
						key: "phase",
						value: this.getViewProperty("/List/PHASE")
				    }, {
						key: "authors",
						value: this.getViewProperty("/List/AUTHORS")
				    }, {
						key: "coaches",
						value: this.getViewProperty("/List/COACHES")
			    },
					{
						key: "latest_update",
						value: this.getViewProperty("/List/LATEST_UPDATE")
			    }
			    ];

				jQuery.each(this.getViewProperty("/List/EXTENSION"), function(sExtensionField, vValue) {
					if (vValue || vValue === 0 || vValue === 0.0) {
						aFilters.push(new Filter(sExtensionField, FilterOperator.EQ, vValue));
					}
				});
				if (this.hasDueFilter()) {
					aFilters.push(this.getDueFilter());
				}

				if (this.hasCampaignFormFilter()) {
					aFilters.push(this.getCampaignFormFilter());
				}

				return {
					Variant: sVariant,
					VariantFilter: sVariantFilter,
					SearchTerm: sSearchTerm,
					TagIds: aTagId,
					CampaignId: sCampaignId,
					Filters: aFilters
				};
			},

			onOpenSubmitter: function(oEvent) {

				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty("SUBMITTER_ID") || oSource.getBindingContext("data").getProperty(
					"EMPLOYEE_ID");
				if (!this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				this.oIdentityCardView.getController().open(oSource.getAggregation("_ideaSubmitter") || oSource, iIdentityId);
			},

			onOpenCoach: function(oEvent) {
				var oSource = oEvent.getSource();
				var iIdentityId = oSource.getBindingContext("data").getProperty("COACH_ID");
				if (!this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				this.oIdentityCardView.getController().open(oSource, iIdentityId);
			},

			bindList: function() {
				this.saveState();

				// see BaseActionMixin.js - cleans all internal state for mass action execution
				this.resetActionState();

				var oBindingParameter = this.getBindingParameter();
				var sPath = "";
				var bIsLandscape = false;
				var searchTerm = oBindingParameter.SearchTerm || "";
				var bIsManaged = this._check4ManagingList();

				var orientationButton = this.byId('orientationButton');
				var tagGroup = {};
				var tagGroupKey = [];
				var aTagPool = this.getModel("view").getProperty("/List/TAGS");

				aTagPool.forEach(function(item, index) {
					if (!tagGroup[item.ROOTGROUPID]) {
						tagGroup[item.ROOTGROUPID] = [];
						tagGroup[item.ROOTGROUPID].push(item.ID);
						tagGroupKey.push(item.ROOTGROUPID);
					} else {
						tagGroup[item.ROOTGROUPID].push(item.ID);
					}
				}); 
				
                
				if (bIsManaged) { //for idea list to be managed
				    var searchType = this.getSearchType();
					sPath += "IdeaMediumBackofficeSearchParams";
					sPath += "(searchToken='" + searchTerm + "'," + 
					    "searchType=" + searchType + "," +
						"tagsToken='" + (tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "") + "'," +
						"tagsToken1='" + (tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "") + "'," +
						"tagsToken2='" + (tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "") + "'," +
						"tagsToken3='" + (tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "") + "'," +
						"tagsToken4='" + (tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "") + "'," +
						"filterName='" + (oBindingParameter.VariantFilter || "") + "'," +
						"filterBackoffice=" + (bIsManaged ? "1" : "0") + this.getIdeaformFilters() + this.getCompanyViewFilters() +  ")/Results";
				} else { //for other idea list
                   var aGroupVariant = this.getGroupViewParameters(oBindingParameter);
					sPath += "IdeaMediumSearchParams";
					sPath += "(searchToken='" + searchTerm + "'," +
						"tagsToken='" + (tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "") + "'," +
						"tagsToken1='" + (tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "") + "'," +
						"tagsToken2='" + (tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "") + "'," +
						"tagsToken3='" + (tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "") + "'," +
						"tagsToken4='" + (tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "") + "'," +
						"filterName='" + (oBindingParameter.VariantFilter || "") + "'," +
						"filterBackoffice=" + (bIsManaged ? "1" : "0") + this.getIdeaformFilters() +  "," +
						"cvt='" + aGroupVariant.groupToken + "'," + "cvr=" + aGroupVariant.groupRole  + "," +  "cvy=" + aGroupVariant.groupType  + 
						")/Results";
				}

				if (bIsManaged) {
					orientationButton.setVisible(false);
				} else {
					orientationButton.setVisible(true);
				}

				// if possible, access the "cheap" idea view
				if (!oBindingParameter.SearchTerm && oBindingParameter.TagIds.length === 0 && !oBindingParameter.VariantFilter && !bIsManaged && !
					this.hasCampaignFormFilter() && !this.hasIdeaformFilters()) {
					sPath = "IdeaMediumCommunity";
				}

				this.setPath("data>/" + sPath);

				if ((!Device.system.desktop && Device.orientation.landscape) ||
					(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
					bIsLandscape = true;
				}
				this.getList().setWrapping(!(bIsManaged || bIsLandscape));
				BaseController.prototype.bindList.apply(this);
			},
     
			//TODO move to ListPage
			onOrientationChange: function(eOrientation) {
				var bIsManaged = this._check4ManagingList();
				if (bIsManaged || eOrientation === OrientationType.LANDSCAPE || eOrientation.landscape) {
					if (this.getPortraitStyle) {
						this.getList().removeStyleClass(this.getPortraitStyle());
					}
					if (this.getLandscapeStyle) {
						this.getList().addStyleClass(this.getLandscapeStyle());
					}
				} else {
					if (this.getPortraitStyle) {
						this.getList().addStyleClass(this.getPortraitStyle());
					}
					if (this.getLandscapeStyle) {
						this.getList().removeStyleClass(this.getLandscapeStyle());
					}
				}

				this.getList().setWrapping(!(bIsManaged || eOrientation === OrientationType.LANDSCAPE || eOrientation.landscape));
				this.setViewProperty("/ORIENTATION", eOrientation);
				this.setViewProperty("/List/EXPORT_ALL", eOrientation === OrientationType.PORTRAIT && !bIsManaged);

				// toggle the display of select all button
				// this.byId("sapInoMassSelect").setVisible((eOrientation === OrientationType.LANDSCAPE) || bIsManaged);
			},

			_check4ManagingList: function() {
				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");

				if (bBackoffice) {
					var sVariant = this.getViewProperty("/List/VARIANT");
					var aVariants = this.getListProperty("/Variants/Values");

					var vVariant = jQuery.grep(aVariants, function(oVariant) {
						return oVariant.ACTION === sVariant;
					});

					vVariant = (vVariant && vVariant.length > 0) ? vVariant[0] : {};

					return vVariant.MANAGE || vVariant.CAMPAIGN_MANAGE || false;
				}

				return false;
			},

			bindTagCloud: function() {
				var bIsManaged = this._check4ManagingList();
				var oBindingParameter = this.getBindingParameter();
				var sPath = Configuration.getTagcloudServiceURL(oBindingParameter.CampaignId, oBindingParameter.TagIds, oBindingParameter.SearchTerm,
					oBindingParameter.VariantFilter, !this.includeDrafts(), bIsManaged, oBindingParameter.Filters);

				var oController = this;

				// check whether refresh is necessary
				if (this._lastTagServicePath !== sPath) {
					var oTagModel = new JSONModel(sPath);
					var sOtherTxt = this.getText("IDEA_LIST_MIT_FILTER_TAG_OTHER");
					oTagModel.attachRequestCompleted(null, function() {
						var oRankedTag = oTagModel.getData().RANKED_TAG || [];
						var aTagGroup = oTagModel.getData().TAG_GROUP;
						var oTagData = oController.groupByTagGroup(oRankedTag, oController.getViewProperty("/List/TAGS"), sOtherTxt);
						jQuery.each(oTagData, function(element, object) {
							if (object.GROUP_NAME === "Other") {
								aTagGroup.push(object);
							}
						});
						oController.setTagCloudProperty(oTagData, oTagModel.getData().WITHOUT_GROUP !== "X");
						oTagModel.setData({
							"RANKED_TAG": oTagData,
							"TAG_GROUP": aTagGroup
						}, false);
						this.setFilterModel(oTagModel, "tag");
					}, this);
				}
				// swap last path for refresh checking
				this._lastTagServicePath = sPath;
			},

			onItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("data");
				if (oContext) {
					this.navigateTo("idea-display", {
						id: oContext.getProperty("ID")
					});
				}
			},

			onCardItemPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oIdeaCard = oItem.getAggregation("content")[0];
				oIdeaCard.getFocusDomRef().focus();
			},

			onIdeaCommentPress: function(oEvent) {
				var iIdeaId;

				if (oEvent.getParameter("ideaId")) {
					iIdeaId = oEvent.getParameter("ideaId");
				} else {
					try {
						if (oEvent.getSource().getProperty("objectId")) {
							iIdeaId = oEvent.getSource().getProperty("objectId");
						}
					} catch (e) {
						iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
					}
				}
				if (iIdeaId) {
					this.navigateTo("idea-display", {
						id: iIdeaId,
						query: {
							section: "sectionComments"
						}
					});
				}
			},

			onCardItemAfterRendering: function() {},

			includeDrafts: function() {
				return this.getCurrentVariant().INCLUDE_DRAFT;
			},

			updateFilter: function() {
				var aStatus = this.getViewProperty("/List/STATUS") || [];
				var sSubStatus = this.getViewProperty("/List/SUB_STATUS");
				var sRespListValueCode = this.getViewProperty("/List/RESP_VALUE_CODE") || [];
				var sVoteNum = this.getViewProperty("/List/VOTE_NUMBER");
				var sPhase = this.getViewProperty("/List/PHASE");
				var sLatestUpdate = this.getViewProperty("/List/LATEST_UPDATE");
				var sCampaign = this.getViewProperty("/List/CAMPAIGN");
				var aAuthorKeys = this.getViewProperty("/List/AUTHORS");
				var aCoachKeys = this.getViewProperty("/List/COACHES");
				var oExtension = this.getViewProperty("/List/EXTENSION");
				var bIsManaged = this._check4ManagingList();
				var oIdeaFilterNewAndInprocess = this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS");
				
				//var bIdeaGroupView = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW");
				var aFilters = [];
				var that = this;
				this.setFilter([]);

				if (oIdeaFilterNewAndInprocess && bIsManaged) {
					var aTmpFilters = [];
					aTmpFilters.push(new Filter("STATUS_TYPE", FilterOperator.EQ, ""));
					aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.COMPLETED"));
					aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DISCONTINUED"));
					aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.MERGED"));
					aFilters.push(new Filter({
						filters: [new Filter({
							filters: [
					            new Filter("STATUS_TYPE", FilterOperator.NE, "COMPLETED"),
					            new Filter("STATUS_TYPE", FilterOperator.NE, "DISCONTINUED"),
					            new Filter("BASE_PACKAGE", FilterOperator.NE, "sap.ino.config")
					        ],
							and: true
						}), new Filter({
							filters: aTmpFilters,
							and: true
						})],
						and: false
					}));
				} else if (oIdeaFilterNewAndInprocess === false) {
					aFilters = [];
				}
				if (sSubStatus && sSubStatus.length > 0) {
					var subStatus = [];
					jQuery.each(sSubStatus, function(iIdx, sKey) {
						subStatus.push(new Filter("STATUS", FilterOperator.EQ, sKey));
					});
					aFilters.push(new Filter({
						filters: subStatus,
						and: false
					}));
				} else if (aStatus.length > 0) {
					var aReducedFilters = aStatus.reduce(function(aStatusFilters, sStatus) {
						/* we are using fixed filters here as the status of "sap.ino.xs.object.idea.Status.Root"
                        cannot be used 1:1 in the UI but need to be combined to make sense, see below */
						switch (sStatus) {
							case mStatus.COMPLETED:
								aStatusFilters.push(new Filter({
									filters: [
    							        new Filter("STATUS_TYPE", FilterOperator.EQ, "COMPLETED"),
    							        new Filter({
											filters: [
    							                new Filter("STATUS_TYPE", FilterOperator.EQ, ""),
    							                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.COMPLETED")
    							            ],
											and: true
										})
    							    ],
									and: false
								}));
								break;
							case mStatus.NODISCONTINUED:
								// aStatusFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DISCONTINUED"));
								// aStatusFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.MERGED")); 
								aStatusFilters.push(new Filter({
									filters: [new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DISCONTINUED"),
								 new Filter("STATUS", FilterOperator.NE, "sap.ino.config.MERGED")],
									and: true
								}));

								that.setViewProperty("/List/IS_DISCONTINUED_CHECKBOX_SELECTED", true);
								break;
							case mStatus.DISCONTINUED:
								aStatusFilters.push(new Filter({
									filters: [
    							        new Filter("STATUS_TYPE", FilterOperator.EQ, "DISCONTINUED"),
    							        new Filter({
											filters: [
    							                new Filter("STATUS_TYPE", FilterOperator.EQ, ""),
    							                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.DISCONTINUED")
    							            ],
											and: true
										}),
    							        new Filter({
											filters: [
        						                new Filter("STATUS_TYPE", FilterOperator.EQ, ""),
        						                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.MERGED")
        						            ],
											and: true
										})
    							    ],
									and: false
								}));
								break;
							case mStatus.ACTIVE:
								var aTmpFilters = [];
								aTmpFilters.push(new Filter("STATUS_TYPE", FilterOperator.EQ, ""));
								aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.COMPLETED"));
								aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DISCONTINUED"));
								aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.MERGED"));
								aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.NEW_IN_PHASE"));
								if (!bIsManaged && !that.getCurrentVariant().INCLUDE_DRAFT) {
									aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DRAFT"));
								}
								aStatusFilters.push(new Filter({
									filters: [new Filter({
										filters: [
    							            new Filter("STATUS_TYPE", FilterOperator.NE, "COMPLETED"),
    							            new Filter("STATUS_TYPE", FilterOperator.NE, "DISCONTINUED"),
    							            new Filter("STATUS_TYPE", FilterOperator.NE, "NEW"),
    							            new Filter("BASE_PACKAGE", FilterOperator.NE, "sap.ino.config")
    							        ],
										and: true
									}), new Filter({
										filters: aTmpFilters,
										and: true
									})],
									and: false
								}));
								break;
							case mStatus.NEW:
								aStatusFilters.push(new Filter({
									filters: [
    							            new Filter("STATUS_TYPE", FilterOperator.EQ, "NEW"),
        							        new Filter({
											filters: [
        							                new Filter("STATUS_TYPE", FilterOperator.EQ, ""),
        							                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.NEW_IN_PHASE")
        							            ],
											and: true
										})
    							        ],
									and: false
								}));
								break;
							default:
								break;
						}
						return aStatusFilters;
					}, []);
					//var oStatusValue = this.getStatus(sStatus);

					aFilters.push(new Filter({
						filters: aReducedFilters,
						and: false
					}));
				}

				if (sPhase && sPhase.length > 0) {
					var oPhase = [];
					jQuery.each(sPhase, function(iIdx, sKey) {
						oPhase.push(new Filter("PHASE", FilterOperator.EQ, sKey));
					});
					aFilters.push(new Filter({
						filters: oPhase,
						and: false
					}));
				}

				if (sCampaign && sCampaign !== "0") {
					aFilters.push(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sCampaign));
				}

				if (sRespListValueCode && sRespListValueCode.length > 0) {
					var oRespFilter = [];
					sRespListValueCode.forEach(function(oResp) {
						oRespFilter.push(new Filter("RESP_VALUE_CODE", FilterOperator.EQ, oResp.code));
					});
					aFilters.push(new Filter({
						filters: oRespFilter,
						and: false
					}));
				}

				if (sVoteNum) {
					var oOperator;
					var sOperator = this.getViewProperty("/List/VOTE_OPERATOR");
					switch (sOperator) {
						case mOperator.EQ:
							oOperator = FilterOperator.EQ;
							break;
						case mOperator.GE:
							oOperator = FilterOperator.GE;
							break;
						case mOperator.LE:
							oOperator = FilterOperator.LE;
							break;
						default:
							oOperator = FilterOperator.EQ;
					}
					aFilters.push(new Filter("VOTE_COUNT", oOperator, sVoteNum));
				}

				if (this.hasDueFilter()) {
					aFilters.push(this.getDueFilter());
				}

				if (this.hasCampaignFormFilter()) {
					aFilters.push(this.getCampaignFormFilter());
				}

				if (aAuthorKeys && aAuthorKeys.length > 0) {
					var aAuthorFilters = [];
					jQuery.each(aAuthorKeys, function(iIdx, sKey) {
						aAuthorFilters.push(new Filter("SUBMITTER_ID", FilterOperator.EQ, sKey));
					});
					aFilters.push(new Filter({
						filters: aAuthorFilters,
						and: false
					}));
				}

				if (aCoachKeys && aCoachKeys.length > 0) {
					var aCoachFilters = [];
					jQuery.each(aCoachKeys, function(iIdx, sKey) {
						aCoachFilters.push(new Filter("COACH_ID", FilterOperator.EQ, sKey));
					});
					aFilters.push(new Filter({
						filters: aCoachFilters,
						and: false
					}));
				}
				//add latest filter
				if (sLatestUpdate && sLatestUpdate.length > 0) {
					var oLatestUpdate = [];
					jQuery.each(sLatestUpdate, function(iIdx, sKey) {
						oLatestUpdate.push(new Filter(sKey, FilterOperator.EQ, 1));
					});
					aFilters.push(new Filter({
						filters: oLatestUpdate,
						and: false
					}));
				}

				// add some additional filters based on the managed list variant
				if (bIsManaged || !this.includeDrafts()) {
					// never include drafts
					aFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DRAFT"));

					// 	switch (sVariant) {
					// 		case mVariant.MANAGE:
					// 			break;
					// 		case mVariant.FOLLOW_UP:
					// 			aFilters.push(new Filter("FOLLOW_UP_ID", FilterOperator.NE, null));
					// 			break;
					// 		case mVariant.COACH_ME:
					// 			aFilters.push(new Filter("COACH_ID", FilterOperator.EQ, this.getModel("user").getProperty("/data/USER_ID")));
					// 			break;
					// 	}
				}

				jQuery.each(oExtension, function(sExtensionField, vValue) {
					if (vValue || vValue === 0 || vValue === 0.0) {
						aFilters.push(new Filter(sExtensionField, FilterOperator.EQ, vValue));
					}
				});

				if (aFilters.length > 0) {
					this.addFilter(new Filter({
						filters: aFilters,
						and: true
					}));
				}
			},

			onFilterStatusChange: function(oEvent) {
				var aSelectedItems = oEvent.getParameter("selectedItems");
				if (aSelectedItems.length > 0) {
					// clear sub status list
					this.oViewModel.setProperty("/List/SUB_STATUS", []);
					// clear selected sub status
					this.oViewModel.setProperty("/subStatus", []);
				} else {
					this.bindFilters();
				}
			},

			onFilterSubStatusChange: function(oEvent) {
				var oSource = oEvent.getSource();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				this.setViewProperty("/List/SUB_STATUS", oSource.getProperty("key"));
				// this.navigateIntern(this.getQuery(), true, true);
			},
			handlePhaseSelectionFinish: function(oEvent) {
				var oSource = oEvent.getSource();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				this.setViewProperty("/List/PHASE", oSource.getSelectedKeys());
				// this.navigateIntern(this.getQuery(), true, true);

			},

			handleSubstatusSelectionFinish: function(oEvent) {
				var oSource = oEvent.getSource();
				oSource._oTokenizer.onAfterRendering = function() {
					oSource._oTokenizer.setEditable(false);
				};
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				this.setViewProperty("/List/SUB_STATUS", oSource.getSelectedKeys());
				// this.navigateIntern(this.getQuery(), true, true);
			},
			handleLatestUpdateSelectionFinish: function(oEvent) {
				var oSource = oEvent.getSource();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				this.setViewProperty("/List/LATEST_UPDATE", oSource.getSelectedKeys());

			},
			onFilterVoteOperatorChange: function(oEvent) {
				var oSource = oEvent.getSource();
				if (!oSource.getSelectedItem()) {
					return;
				}
				var oVoteNum = this.getFilterElementById("voteNumber");
				if (oVoteNum.getValue() === undefined || oVoteNum.getValue().trim() === "") {
					return;
				}
				this.setViewProperty("/List/VOTE_OPERATOR", oSource.getSelectedItem().getProperty("key"));
				// this.navigateIntern(this.getQuery(), true, true);
			},

			onFilterVoteNumChange: function(oEvent) {
				var oVoteOperator = this.getFilterElementById("voteOperatorSelect");
				if (!oVoteOperator.getSelectedItem()) {
					return;
				}
				var oSource = oEvent.getSource();
				if (oSource.getValue() === undefined || oSource.getValue().trim() === "") {
					this.setViewProperty("/List/VOTE_NUMBER", "");
				} else {
					this.setViewProperty("/List/VOTE_NUMBER", oSource.getValue().trim());
				}
				// this.navigateIntern(this.getQuery(), true, true);
			},

			// 			onFilterRespListChange: function(oEvent) {
			// 				if (oEvent.getParameter("selectedItem")) {
			// 					var oSource = oEvent.getParameter("selectedItem");
			// 					var sKey = oSource.getProperty("key");
			// 					var sText = oSource.getProperty("text");
			// 					this.setViewProperty("/List/RESP_VALUE_CODE", sKey);
			// 					this.setViewProperty("/List/RESP_VALUE_NAME", sText);
			// 				}
			// 			},

			onHandleRespFilterRequest: function() {
				this.getRespFilterHelpDialog().open();
				this.oViewModel.setProperty("/oldResp",jQuery.extend(true,[],this.oViewModel.getData().resp));
				
			},

			getRespFilterHelpDialog: function() {
				if (!this._respHelpDialog) {
					this._respHelpDialog = this.createFragment("sap.ino.vc.idea.fragments.RespValueHelpDialog", this.getView().getId());
					this.getView().addDependent(this._respHelpDialog);
				}
				return this._respHelpDialog;
			},

			// 			onClearRespFilter: function(oEvent) {
			// 				var sValue = oEvent.getParameter("value");
			// 				if (sValue.trim() === "") {
			// 					this.setViewProperty("/List/RESP_VALUE_CODE", '');
			// 					this.setViewProperty("/List/RESP_VALUE_NAME", '');
			// 					// 	this.navigateIntern(this.getQuery(), true, true);
			// 				}
			// 			},

			// 			onRespSuggestion: function(oEvent) {
			// 				var oViewModel = this.getModel("view");
			// 				var that = this;
			// 				this.resetClientMessages();
			// 				var suggestResp = [];
			// 				jQuery.each(oViewModel.getProperty("/resp"), function(index, respValue) {
			// 					if (respValue.DEFAULT_TEXT.includes(oEvent.mParameters.suggestValue)) {
			// 						suggestResp.push(respValue);
			// 					}

			// 				});
			// 				oViewModel.setProperty("/respSuggestion", suggestResp);

			// 				var oRespFilter = that.byId("respListSuggestInput") || that.getFilterElementById("respListSuggestInput");
			// 				oRespFilter.setFilterSuggests(false);

			// 			},

			onHandleRespTokenUpdate: function(oEvent) {
				var aDelTokens = oEvent.getParameter("removedTokens");
				var fnFilterOutFilterData = function(aRemovedTokens, aTarget) {
					return aRemovedTokens.reduce(function(aData, oToken) {
						return aData.filter(function(oData) {
							return oData.code !== oToken.getKey();
						});
					}, aTarget);
				};
				var fnFilterOutHelperSel = function(aRemovedTokens, aTarget) {
					var _fnDeselect = function(oData, sDelKey) {
						if (oData.children && oData.children.length > 0) {
							oData.children.forEach(function(oChild) {
								_fnDeselect(oChild, sDelKey);
							});
						}
						if (oData.CODE === sDelKey && oData.checked) {
							oData.checked = "Unchecked";
							return true;
						} else {
							return false;
						}
					};
					return aRemovedTokens.reduce(function(aData, oToken) {
						aData.some(function(oData) {
							return _fnDeselect(oData, oToken.getKey());
						});
						return aData;
					}, aTarget);
				};
				var that = this;
				var fnCheckUntickRootSel = function(aRespValues) {

					for (var j = 0; j < aRespValues.length; j++) {
						var bChildCheckedAll, bChildUnCheckedAll;
						if (aRespValues[j].children && aRespValues[j].children.length > 0) {
							bChildUnCheckedAll = true;
							bChildCheckedAll = true;
							//bChildCheckedAll = that.checkChildUntickAll(aRespValues[j].children,bChildCheckedAll);
							bChildUnCheckedAll = that.checkChildUntickAll(aRespValues[j].children, bChildUnCheckedAll);
							bChildCheckedAll = that.checkChildTickAll(aRespValues[j].children, bChildCheckedAll);

						}
						if (bChildUnCheckedAll === false && bChildCheckedAll === false) {
							aRespValues[j].checked = "Mixed";
						} else if (bChildUnCheckedAll) {
							aRespValues[j].checked = "Unchecked";
						} else if (bChildCheckedAll) {
							aRespValues[j].checked = "Checked";
						}

					}
					return aRespValues;

				};
				if (aDelTokens && aDelTokens.length > 0) {
					// update view model && helper model
					this.oViewModel.getData().List.RESP_VALUE_CODE =
						fnFilterOutFilterData(aDelTokens, this.oViewModel.getProperty("/List/RESP_VALUE_CODE"));
					// get selected resp data from helper
					this.oViewModel.getData().resp = fnFilterOutHelperSel(aDelTokens, this.oViewModel.getData().resp);
					this.oViewModel.getData().resp = fnCheckUntickRootSel(this.oViewModel.getData().resp);

					// update helper dialog tree binding
					this.oViewModel.setProperty("/resp", this.oViewModel.getData().resp);
				}
			},

			onHandleRespHelpOK: function() {
				var aResp = [];
				this.oViewModel.getData().resp.forEach(function(oRespData) {
					this.getSelectedResp(aResp, oRespData);
				}.bind(this));
				this.oViewModel.setProperty('/List/RESP_VALUE_CODE', aResp);
				this._respHelpDialog.close();
			},

			getSelectedResp: function(aResp, vRespData) {
				if (vRespData.children && vRespData.children.length > 0) {
					vRespData.children.forEach(function(oRespData) {
						this.getSelectedResp(aResp, oRespData);
					}.bind(this));
				}
				if (vRespData.checked === "Checked" && vRespData.PARENT_CODE) {
					aResp.push({
						code: vRespData.CODE,
						text: vRespData.DEFAULT_TEXT
					});
				}
			},

			onHandleRespHelpCancel: function() {
                this.oViewModel.setProperty("/resp",jQuery.extend(true,[],this.oViewModel.getData().oldResp));
				this._respHelpDialog.close();				
				
			},

			onHandleRespSelectionChange: function(oEvent) {
				var cxt = oEvent.getSource().getParent().getBindingContext("view");
				var path = cxt.getPath();
				this.validateChild(this.oViewModel, path);
				// path = path.substring(0, path.lastIndexOf('/'));
				// this.validateParent(this.oViewModel, path);
				var sRootPath = path.substring(0, path.indexOf('children'));
				this.validateRootRespList(this.oViewModel, sRootPath);
			},

			setChildState: function(obj, state) {
				var that = this;
				this.getChildren(obj).forEach(function(x) {
					x.checked = state;
					that.setChildState(x, state);
				});
			},

			validateChild: function(model, path) {
				var cur = model.getProperty(path);
				if (cur.checked === "Checked" && cur.PARENT_CODE) {
					this.setChildState(cur, cur.checked);
				} else if (!cur.PARENT_CODE) {
					this.setChildState(cur, cur.checked);
				}
			},

			getChildren: function(obj) {
				if (obj.children) {
					return obj.children;
				} else {
					return [];
				}

			},
			checkChildUntickAll: function(array, bUnCheckAll) {
				for (var i = 0; i < array.length; i++) {
					if (array[i].checked && array[i].checked !== 'Unchecked') {
						bUnCheckAll = false;
						break;
					} else {
						if (array[i].children && array[i].children.length > 0) {
							bUnCheckAll = this.checkChildUntickAll(array[i].children, bUnCheckAll);
						}
					}
				}
				return bUnCheckAll;
			},
			checkChildTickAll: function(array, bCheckAll) {
				for (var i = 0; i < array.length; i++) {
					if (array[i].checked && array[i].checked === 'Unchecked') {
						bCheckAll = false;
						break;
					} else {
						if (array[i].children && array[i].children.length > 0) {
							bCheckAll = this.checkChildTickAll(array[i].children, bCheckAll);
						}
					}
				}
				return bCheckAll;
			},
			validateRootRespList: function(model, path) {

				if (path === '') {
					return;
				}
				var oRootList = model.getProperty(path);
				var bChildUnCheckedAll, bChildCheckedAll;
				if (oRootList.children && oRootList.children.length > 0) {
					bChildUnCheckedAll = true;
					bChildCheckedAll = true;
					bChildUnCheckedAll = this.checkChildUntickAll(oRootList.children, bChildUnCheckedAll);
					bChildCheckedAll = this.checkChildTickAll(oRootList.children, bChildCheckedAll);
				}

				if (bChildUnCheckedAll === false && bChildCheckedAll === false) {
					oRootList.checked = "Mixed";
				} else if (bChildUnCheckedAll) {
					oRootList.checked = "Unchecked";
				} else if (bChildCheckedAll) {
					oRootList.checked = "Checked";
				}
				model.setProperty(path, oRootList);

			},
			validateParent: function(model, path) {
				if (path === '/children' || path === '') {
					return;
				}
				var obj = model.getProperty(path);
				var children = this.getChildren(obj);

				var selectedCount = children.filter(function(x) {
					return x.checked === 'Checked';
				}).length;

				if (selectedCount === children.length) {
					obj.checked = 'Checked';
				} else {
					var unselectedCount = children.filter(function(x) {
						return x.checked === 'Unchecked';
					}).length;
					unselectedCount += children.filter(function(x) {
						return x.checked === void 0;
					}).length;
					if (!obj.PARENT_CODE) {
						if (unselectedCount === children.length) {
							obj.checked = 'Unchecked';
						} else {
							obj.checked = 'Mixed';
						}
					}
				}

				model.setProperty(path, obj);
				path = path.substring(0, path.lastIndexOf('/'));
				if (path !== '/children') {
					this.validateParent(model, path);
				}
			},

			onFilterPhaseChange: function(oEvent) {
				var oSource = oEvent.getSource().getSelectedItem();
				if (oSource.getSelectedItem) {
					oSource = oSource.getSelectedItem();
				}
				this.setViewProperty("/List/PHASE", oSource.getProperty("key"));
				// this.navigateIntern(this.getQuery(), true, true);
			},

			onFilterCampaignChange: function(oEvent) {
				//var sSelectedKey = oEvent.getParameter("selectedItem").getProperty("key");
				this.setCampaignForm(undefined);
				this.clearIdeaFormFieldsCriterias();
				var oSource = oEvent.getParameter("selectedItem");
				if (oSource) {
					var sSelectedKey = oSource.getProperty("key");
					this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
					this.getIdeaFormFieldsCriterias();
					// 	this.navigateIntern(this.getQuery(), true, true);
				}
			},

			onFilterDueFromChange: function(oEvent) {
				this.clearDueValueState();
				this.setDueFrom(oEvent);
			},

			onFilterDueToChange: function(oEvent) {
				this.clearDueValueState();
				this.setDueTo(oEvent);
			},

			onFilterAuthorChange: function(oControl) {
				this._onFilterIdentityChange(oControl, "/List/AUTHORS");
			},

			onFilterCoachChange: function(oControl) {
				this._onFilterIdentityChange(oControl, "/List/COACHES");
			},

			_onFilterIdentityChange: function(oControl, sPath) {
				if (!oControl) {
					return;
				}

				var aKeys = [];
				var aTokens = oControl.getTokens();
				jQuery.each(aTokens, function(iIdx, oToken) {
					aKeys.push(oToken.getProperty("key"));
				});

				this.setViewProperty(sPath, aKeys);
				// this.navigateIntern(this.getQuery(), true, true);
			},

			resetFilter: function() {
				var route = this.getRoute();

				this.setViewProperty("/List/STATUS", "");
				this.setViewProperty("/List/SUB_STATUS", "");
				this.setViewProperty("/List/PHASE", "");
				this.restDue();
				this.setViewProperty("/List/AUTHORS", []);
				this.setViewProperty("/List/COACHES", []);
				this.setViewProperty("/List/EXTENSION", {});
				this.setViewProperty("/List/RESP_VALUE_CODE", "");
				this.setViewProperty("/List/RESP_VALUE_NAME", "");
				this.setViewProperty("/List/VOTE_NUMBER", "");
				this.setViewProperty("/List/VOTE_OPERATOR", mOperator.EQ);
				this.setFilterItem("/IdeaFormCriterias", "");
				this.setViewProperty("/List/LATEST_UPDATE", "");

				if (route === 'idealist') {
					this.setViewProperty("/List/CAMPAIGN", "");
					this.restCampaignForm();
					this.restIdeaFormFieldsCriterias();
					this.getIdeaFormFieldsCriterias();
					this.resetCompanyCriterias();

					var oCampaignFilter = this.byId("campaignFilterList") || this.getFilterElementById("campaignFilterList");
					if (oCampaignFilter) {
						oCampaignFilter.removeAllSuggestionItems();
						oCampaignFilter.setValue("");
					}

					var oCampaignFormFilter = this.byId("campaignFormFilterList") || this.getFilterElementById("campaignFormFilterList");
					if (oCampaignFormFilter) {
						oCampaignFormFilter.removeAllSuggestionItems();
						oCampaignFormFilter.setValue("");
					}

					var oCoachFilter = this.byId("coachFilter") || this.getFilterElementById("coachFilter");
					if (oCoachFilter) {
						oCoachFilter.removeAllSuggestionItems();
						oCoachFilter.removeAllTokens();
					}

					var oAuthorFilter = this.byId("authorFilter") || this.getFilterElementById("authorFilter");
					if (oAuthorFilter) {
						oAuthorFilter.removeAllSuggestionItems();
						oAuthorFilter.removeAllTokens();
					}
				}

				BaseController.prototype.resetFilter.apply(this, arguments);
			},

			initialCampaignItems: function() {
				var sCampaignId = this.getViewProperty("/List/CAMPAIGN");
				if (!sCampaignId) {
					return;
				}
				var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
				var oViewModel = this.getModel("view");
				var that = this;
				var sManaged = this._check4ManagingList() ? "managedCampaigns" : "";

				oModel.read("/CampaignSuggestionParams(searchToken='',filterName='" + sManaged + "')/Results", {
					urlParameters: {
						"$orderby": "SHORT_NAME",
						"$filter": "ID eq " + sCampaignId
					},
					success: function(oData) {
						oViewModel.setProperty("/campaignSuggestion", oData.results);
						var oCampaignFilter = that.byId("campaignFilterList") || that.getFilterElementById("campaignFilterList");
						oCampaignFilter.setFilterSuggests(false);
						if (oCampaignFilter.getSuggestionItems().length > 0) {
							oCampaignFilter.setSelectionItem(oCampaignFilter.getSuggestionItems()[0]);
						}
					}
				});
			},

			addPhaseItems: function() {
				var sEmpty = this.getListProperty("/Filter/PhaseBinding/EMPTY_CODE_TEXT");
				var sPath = this.getListProperty("/Filter/PhaseBinding/TABLE_PATH");
				var sTablePath = "view>/Phases";
				var sCodePath = "view" + ">" + this.getListProperty("/Filter/PhaseBinding/CODE_PATH");
				var sPhaseUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea_filter_phase.xsjs";
				var oParameters = {
					CAMPAIGN_ID: this.getBindingParameter().CampaignId === undefined ? undefined : parseInt(this.getBindingParameter().CampaignId, 10)
				};
				var oViewModel = this.getModel("view");
				jQuery.ajax({
					url: sPhaseUrl,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					data: oParameters,
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: false,
					success: function(oResponse) {
						var oData = oResponse.Phases;
						oViewModel.setProperty("/Phases", oData);
					}
				});
				var that = this;
				var fnFormatter = CodeModel.getFormatter(sPath);
				var oTemplate = new Item({
					text: {
						path: sCodePath,
						formatter: function(sCode) {
							return (!sCode) ? that.getText(sEmpty) : fnFormatter(sCode);
						}
					},
					key: {
						path: sCodePath
					}
				});

				var oPhaseSelect = this.getFilterElementById("phaseSelect");
				if (oPhaseSelect) {
					oPhaseSelect.bindItems({
						path: sTablePath,
						template: oTemplate,
						parameters: {
							includeEmptyCode: true
						}
					});
				}
			},

			addRespListItems: function() {
				var oViewModel = this.getModel("view");
				var sRespListUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea_filter_resp_values.xsjs";
				var oParameters = {
					CAMPAIGN_ID: this.getBindingParameter().CampaignId === undefined ? undefined : parseInt(this.getBindingParameter().CampaignId, 10)
				};
				jQuery.ajax({
					url: sRespListUrl,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					data: oParameters,
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: false,
					success: function(oResponse) {
						var aRes = oResponse.RespValues;
						if (aRes && aRes.length > 0) {
							aRes.sort(function(oPrev, oNext) {
								return oPrev.DEFAULT_TEXT.localeCompare(oNext.DEFAULT_TEXT);
							});
						}
						var oData = [{
							CODE: "",
							DEFAULT_LONG_TEXT: "",
							DEFAULT_TEXT: ""
						}].concat(aRes);
						oViewModel.setProperty("/resp", oData);
					}
				});
			},

			addSubStatusFilterItems: function() {
				var oViewModel = this.getModel("view");
				/*if (oViewModel.getData().hasOwnProperty("subStatus")) {
					var o = oViewModel.getData();
					o.subStatus = [];
				}*/
				if (oViewModel.getProperty("/subStatus")) {
					oViewModel.setProperty("/subStatus", []);
				}
				var aFilters = [];
				var bIsManaged = this._check4ManagingList();
				var sStatus = this.getViewProperty("/List/STATUS");
				switch (sStatus) {
					case mStatus.COMPLETED:
						aFilters.push(new Filter({
							filters: [
						        new Filter("STATUS_TYPE", FilterOperator.EQ, "COMPLETED"),
						        new Filter({
									filters: [

						                new Filter("STATUS", FilterOperator.EQ, 'sap.ino.config.COMPLETED')
						            ],
									and: true
								})
						    ],
							and: false
						}));
						break;
					case mStatus.DISCONTINUED:
						aFilters.push(new Filter({
							filters: [
						        new Filter("STATUS_TYPE", FilterOperator.EQ, "DISCONTINUED"),
						        new Filter({
									filters: [

						                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.DISCONTINUED")
						            ],
									and: true
								}),
						        new Filter({
									filters: [

						                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.MERGED")
						            ],
									and: true
								})
						    ],
							and: false
						}));
						break;
					case mStatus.ACTIVE:
						var aTmpFilters = [];

						aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.COMPLETED"));
						aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DISCONTINUED"));
						aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.MERGED"));
						if (!bIsManaged && !this.getCurrentVariant().INCLUDE_DRAFT) {
							aTmpFilters.push(new Filter("STATUS", FilterOperator.NE, "sap.ino.config.DRAFT"));
						}
						aFilters.push(new Filter({
							filters: [new Filter({
								filters: [
						            new Filter("STATUS_TYPE", FilterOperator.NE, "COMPLETED"),
						            new Filter("STATUS_TYPE", FilterOperator.NE, "DISCONTINUED"),
						            new Filter("BASE_PACKAGE", FilterOperator.NE, "sap.ino.config")
						        ],
								and: true
							}), new Filter({
								filters: aTmpFilters,
								and: true
							})],
							and: false
						}));
						break;
					case mStatus.NEW:
						aFilters.push(new Filter({
							filters: [
					            new Filter("STATUS_TYPE", FilterOperator.EQ, "NEW"),
						        new Filter({
									filters: [

						                new Filter("STATUS", FilterOperator.EQ, "sap.ino.config.NEW_IN_PHASE")
						            ],
									and: true
								})
					        ],
							and: false
						}));
						break;
					default:
						aFilters = [];
				}
				var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
				//var that = this;
				var oParameters = {
					success: function(oData) {
						oData = [{
							STATUS: "",
							TEXT: "",
							STATUS_TYPE: "",
							BASE_PACKAGE: ""
				        }].concat(oData.results);
						oViewModel.setProperty("/subStatus", oData);
						/*if (that._global) {
						    that._global.getModel("view").setProperty("/subStatus", oData);
						}*/
					}
				};
				if (aFilters.length > 0) {
					oParameters.filters = aFilters;
				}
				if (this.getViewProperty('/List/CAMPAIGN')) {
					oModel.read("/AuthIdeasStatusParams(campaignId=" + this.getViewProperty('/List/CAMPAIGN') + ")/Results", oParameters);
				} else {
					oModel.read("/AuthIdeasStatusParams(campaignId=0)/Results", oParameters);
				}

			},

			// INM-477: sort/filter behavior
			getQuery: function(oParam) {
				var oQuery = {};
				var bSorterChange = oParam && oParam.bSorterChange;
				var bFilterChange = oParam && oParam.bFilterChange;

				if (bSorterChange) {
					var sSort = this.getViewProperty("/List/SORT");
					var quickSort = this.getViewProperty('/List/QUICKSORT');
				}

				if (bFilterChange) {
					//var sOrder = this.getViewProperty("/List/ORDER");
					var aStatus = this.getViewProperty("/List/STATUS");
					var sSubStatus = this.getViewProperty("/List/SUB_STATUS");
					var sVoteNum = this.getViewProperty("/List/VOTE_NUMBER");
					var sVoteOperator = this.getViewProperty("/List/VOTE_OPERATOR");
					//var sRespList = this.getViewProperty("/List/RESP_VALUE_CODE");
					var aRespList = this.getViewProperty("/List/RESP_VALUE_CODE");
					var sPhase = this.getViewProperty("/List/PHASE");
					var sCampaign = this.getViewProperty("/List/CAMPAIGN");
					var aAuthorKeys = this.getViewProperty("/List/AUTHORS");
					var aCoachKeys = this.getViewProperty("/List/COACHES");
					var oExtension = this.getViewProperty("/List/EXTENSION");
					var sLatestUpdate = this.getViewProperty("/List/LATEST_UPDATE");
					var bDueFromExisted = this.hasDueFromFilter();
					var bDueToExisted = this.hasDueToFilter();
					var bCampaignFormExisted = this.hasCampaignFormFilter();
				}

				//sorter
				if (sSort) {
					oQuery.sort = sSort;
					/*if (sOrder) {
						oQuery.order = sOrder;
					}*/
				}
				if (quickSort) {
					oQuery.quickSort = quickSort;
				}

				//filter
				if (aStatus && aStatus.length > 0) {
					oQuery.status = aStatus;
				}
				if (sSubStatus && sSubStatus.length > 0) {
					oQuery.subStatus = sSubStatus;
				}
				if (aRespList && aRespList.length > 0) {
					oQuery.respCode = aRespList.map(function(oResp) {
						return {
							code: encodeURIComponent(oResp.code),
							text: encodeURIComponent(oResp.text)
						};
					});
					oQuery.respCode = JSON.stringify(oQuery.respCode);
				}
				if (sPhase && sPhase.length > 0) {
					oQuery.phase = sPhase;
				}
				if (sVoteNum) {
					oQuery.voteNum = sVoteNum;
					if (sVoteOperator) {
						oQuery.voteOperator = sVoteOperator;
					}
				}
				if (sCampaign) {
					oQuery.campaign = sCampaign;
				}
				if (bDueFromExisted) {
					oQuery.dueFrom = this.getFilterItem("/DueFrom");
				}
				if (bDueToExisted) {
					oQuery.dueTo = this.getFilterItem("/DueTo");
				}
				if (aAuthorKeys && aAuthorKeys.length > 0) {
					oQuery.authors = aAuthorKeys;
				}
				if (aCoachKeys && aCoachKeys.length > 0) {
					oQuery.coaches = aCoachKeys;
				}
				if (bCampaignFormExisted) {
					oQuery.ideaformid = this.getCampaignFormQuery();
				}
				if (sLatestUpdate && sLatestUpdate.length > 0) {
					oQuery.latestUpdate = sLatestUpdate;
				}
				this.setIdeaformCriteriaToQuery(oQuery);
				this.setCompanyCriteriaToQuery(oQuery);

				jQuery.each(oExtension, function(sExtensionField, vValue) {
					if (vValue || vValue === 0 || vValue === 0.0) {
						oQuery[sExtensionField.toLowerCase()] = vValue;
					}
				});

				if (this._oQuery) {
					jQuery.each(this._oQuery, function(sKey, vValue) {
						if ((bFilterChange && !bSorterChange && (sKey === 'sort' || sKey === 'quickSort')) ||
							(bSorterChange && !bFilterChange && (sKey !== 'sort' && sKey !== 'quickSort')) ||
							(!bSorterChange && !bFilterChange)) {
							oQuery[sKey] = vValue;
						}
					});
				}

				// search
				var sSearchTerm = this.getViewProperty("/List/SEARCH");
				if (sSearchTerm) {
					oQuery.search = sSearchTerm;
				}

				// tags
				var aTags = this.getViewProperty("/List/TAGS");
				if (aTags && aTags.length > 0) {
					oQuery.tags = JSON.stringify(aTags);
				}

				// new and process
				var bIsManaged = this._check4ManagingList();
				var sIdeaFilterChange = this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS");
				if (bIsManaged) {
					oQuery.sIdeaFilterChange = sIdeaFilterChange;
				}
				if(!bIsManaged){
				var bIdeaGroupView = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW");				
                oQuery.bIdeaGroupView = bIdeaGroupView;
				}
				this._oQuery = jQuery.extend(true, {}, oQuery);

				return oQuery;
			},

			getSort: function(sSorterOrder) {
				var sVariant = this.getViewProperty("/List/VARIANT");
				var oVariant = this.getVariant(sVariant);

				var aManageSorter = [{
					TEXT: "SORT_MIT_FOLLOW_UP_DATE",
					ACTION: mSort.FOLLOW_UP_DATE,
					DEFAULT_ORDER: mOrder.ASC
                    }, {
					TEXT: "SORT_MIT_LAST_PUBL_EVAL_AT",
					ACTION: mSort.LAST_PUBL_EVAL_AT,
					DEFAULT_ORDER: mOrder.DESC
                    }, {
					TEXT: "SORT_MIT_EVAL_COUNT",
					ACTION: mSort.EVALUATION_COUNT,
					DEFAULT_ORDER: mOrder.DESC
                    }, {
					TEXT: "SORT_MIT_EXPERT_SCORE",
					ACTION: mSort.EXP_SCORE,
					DEFAULT_ORDER: mOrder.DESC
                    }, {
					TEXT: "SORT_MIT_SEARCH_SCORE",
					ACTION: mSort.SEARCH_SCORE,
					DEFAULT_ORDER: mOrder.DESC
                    }];

				var aExtensionSorter = this._extensibilityExtensionFieldSorter() || [];

				// must be managed and user must have backoffice privileges, otherwise FOLLOW_UP_DATE etc. are not contained in OData Service
				if (oVariant && oVariant.MANAGE && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")) {
					this.addSorterConfig(aManageSorter, true);
					if (aExtensionSorter.length > 0) {
						this.addSorterConfig(aExtensionSorter, true);
					}
				} else {
					this.removeSorterConfig(aManageSorter);
					if (aExtensionSorter.length > 0) {
						this.removeSorterConfig(aExtensionSorter);
					}
				}

				// sort Sort list items
				var that = this;
				var aSorter = this.getListProperty("/Sorter/Values");
				aSorter.sort(function(obj1, obj2) {
					var sT1 = that.getText(obj1.TEXT);
					var sT2 = that.getText(obj2.TEXT);
					if (sT1 > sT2) {
						return 1;
					} else if (sT1 < sT2) {
						return -1;
					} else {
						return 0;
					}
				});
				return BaseController.prototype.getSort.call(this, sSorterOrder);
			},

			setParameters: function(oQuery, oVariant) {
				oQuery = oQuery || {};
				var sVariant = oVariant.ACTION;
				//var oSorter = this.getSort(oVariant.DEFAULT_SORT);

				var sSort = this.checkSort(oQuery, oVariant.DEFAULT_SORT);
				//var sOrder = this.checkOrder(oQuery, oSorter.DEFAULT_ORDER);
				var aStatus = this.checkStatus(oQuery.status, []);
				var sPhase = this.checkPhase(oQuery.phase, []);
				var sLatestUpdate = this.checkPhase(oQuery.latestUpdate, []);
				var aTags = this.checkTags(oQuery.tags);
				var sCampaign = oQuery.campaign;
				//var sRespList = oQuery.respCode;
				var aRespList = this.checkRespList(oQuery.respCode);
				var sRespName = oQuery.respName;
				var sSubStatus = this.checkIdentities(oQuery.subStatus, []);
				var sVoteOperator = oQuery.voteOperator;
				var sVoteNum = oQuery.voteNum;
				var sDueFrom = oQuery.dueFrom;
				var sDueTo = oQuery.dueTo;
				var aAuthorKeys = this.checkIdentities(oQuery.authors, []);
				var aCoachKeys = this.checkIdentities(oQuery.coaches, []);
				var sQuickSort = oQuery.quickSort;

				if (oQuery.sIdeaFilterChange === "false") {
					this.setViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS", false);
				} else if (oQuery.sIdeaFilterChange === "true") {
					this.setViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS", true);
				}
				if (oQuery.bIdeaGroupView === "false") {
					this.setViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW", false);
				} else if (oQuery.bIdeaGroupView === "true") {
					this.setViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW", true);
				}				
				

				this.setViewProperty("/List/VARIANT", oVariant.ACTION);
				this.setViewProperty("/List/SORT", sSort);
				//this.setViewProperty("/List/ORDER", sOrder);
				this.setViewProperty("/List/STATUS", aStatus);
				this.setViewProperty("/List/SUB_STATUS", sSubStatus);
				//this.setViewProperty("/List/RESP_VALUE_CODE", sRespList ? decodeURIComponent(sRespList) : '');
				this.setViewProperty("/List/RESP_VALUE_CODE", (function() {
					return aRespList.map(function(oResp) {
						return {
							code: decodeURIComponent(oResp.code),
							text: decodeURIComponent(oResp.text)
						};
					});
				}()));
				this.setViewProperty("/List/RESP_VALUE_NAME", sRespName);
				this.setViewProperty("/List/VOTE_NUMBER", sVoteNum);
				this.setViewProperty("/List/VOTE_OPERATOR", sVoteOperator);
				this.setViewProperty("/List/PHASE", sPhase);
				this.setViewProperty("/List/LATEST_UPDATE", sLatestUpdate);
				this.setViewProperty("/List/TAGS", aTags);
				this.setViewProperty("/List/IS_TAGS_SELECTION", aTags.length > 0);
				this.setViewProperty("/List/SEARCH", oQuery.search);
				this.setViewProperty("/List/MANAGE", oVariant.MANAGE || oVariant.CAMPAIGN_MANAGE);
				this.setViewProperty("/List/CAMPAIGN", sCampaign);
				this.setCampaignForm(oQuery.ideaformid);
				this.getIdeaFormFieldsCriterias();
				this.setDueFromValue(sDueFrom);
				this.setDueToValue(sDueTo);
				this.setViewProperty("/List/AUTHORS", aAuthorKeys);
				this.setViewProperty("/List/COACHES", aCoachKeys);
				this.setViewProperty("/List/QUICKSORT", sQuickSort);

				//	if (!!sCampaign || !!sPhase || !!sStatus || !!sSubStatus || !!sRespList || (
				//		aAuthorKeys.length > 0) || (aCoachKeys.length > 0) || !!sDueFrom || !!sDueTo) {
				//		this.setViewProperty("/List/IS_SHOW_MORE_FILTER", true);
				//	}

				var that = this;
				this.setViewProperty("/List/EXTENSION", {});
				jQuery.each(oQuery, function(sParam, vValue) {
					if (sParam.indexOf("_") === 0) {
						that.setViewProperty("/List/EXTENSION/" + sParam.toUpperCase(), vValue);
					}
				});
				this.initIdeaFormItems(oQuery);
				this.initCompanyViewItems(oQuery);
				this.setViewProperty("/List/TAGCLOUD", true);
				//this.setViewProperty("/List/IS_FILTER_SUBPAGE", true);
				this.setViewProperty("/List/HIDE_STATUS", false);
				this.setViewProperty("/List/SELECT_ALL", false);
				this.removeSubFilterPageContent();
				if ([mVariant.MANAGE, mVariant.FOLLOW_UP, mVariant.UNASSIGNED, mVariant.COACH_ME, mVariant.EVAL_DONE].indexOf(sVariant) >= 0) {
					this.setViewProperty("/List/MANAGE", true);
					this.addSubFilterPageContent(this.getAdditionalFilter());
					this.setMultiInputContent(this.getFilterElementById("authorFilter"), aAuthorKeys, true);
					this.setMultiInputContent(this.getFilterElementById("coachFilter"), aCoachKeys, true);
				} else if (mVariant.COMPLETED === sVariant) {
					this.setViewProperty("/List/MANAGE", false);
					this.setViewProperty("/List/HIDE_STATUS", true);
					this.setViewProperty("/List/STATUS", undefined);
					this.addSubFilterPageContent(this.getAdditionalFilter());
				} else {
					this.addSubFilterPageContent(this.getAdditionalFilter());
					this.setViewProperty("/List/MANAGE", false);
				}
				this.setViewProperty("/List/EXPORT_ALL", this.getViewProperty("/ORIENTAION") === OrientationType.PORTRAIT && !this.getViewProperty(
					"/List/MANAGE"));
			},

			getItemTemplate: function() {
				var sRequiredTemplate;

				if (this._check4ManagingList()) {
					sRequiredTemplate = "Managed";
				} else if ((!Device.system.desktop && Device.orientation.landscape) ||
					(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
					sRequiredTemplate = "Landscape";
				} else {
					sRequiredTemplate = "Portrait";
				}

				var oTemplate;
				var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting(
					"sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;
				//if(!this.getViewProperty('/List/DISABLE_IDEA_IMAGE'))				
				switch (sRequiredTemplate) {
					case "Managed":
						//oTemplate = this.getFragment("sap.ino.vc.idea.fragments.ManageListItem");
						oTemplate = disableImage ? this.getFragment("sap.ino.vc.idea.fragments.ManageListItemNoImage") : this.getFragment(
							"sap.ino.vc.idea.fragments.ManageListItem");
						break;
					case "Landscape":
						//oTemplate = this.getFragment("sap.ino.vc.idea.fragments.FlatListItem");
						oTemplate = disableImage ? this.getFragment("sap.ino.vc.idea.fragments.FlatListItemNoImage") : this.getFragment(
							"sap.ino.vc.idea.fragments.FlatListItem");
						break;
					case "Portrait":
						//oTemplate = this.getFragment("sap.ino.vc.idea.fragments.CardListItem");
						oTemplate = disableImage ? this.getFragment("sap.ino.vc.idea.fragments.CardListItemNoImage") : this.getFragment(
							"sap.ino.vc.idea.fragments.CardListItem");
						break;
					default:
						break;
				}

				return oTemplate;
			},

			createFilterController: function() {
				return sap.ui.controller("sap.ino.vc.idea.Filter");
			},

			createFilterView: function() {
				return this.createView({
					type: ViewType.XML,
					viewName: "sap.ino.vc.idea.Filter",
					controller: this._oFilterController
				});
			},

			createFilterDialog: function() {
				return sap.ui.xmlfragment("sap.ino.vc.idea.fragments.FilterDialog", this);
			},

			createState: function(sRoute, sVariant, oQuery, bPortrait) {
				var oState = BaseController.prototype.createState.apply(this, arguments);
				oState.query.status = oQuery.status;
				oState.query.subStatus = oQuery.subStatus;
				oState.query.respCode = oQuery.respCode;
				oState.query.respName = oQuery.respName;
				oState.query.phase = oQuery.phase;
				oState.query.campaign = oQuery.campaign;
				oState.query.due = oQuery.due;
				oState.query.authors = oQuery.authors;
				oState.query.coaches = oQuery.coaches;
				oState.query.voteNum = oQuery.voteNum;
				oState.query.voteOperator = oQuery.voteOperator;
				oState.query.sIdeaFilterChange = this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS");
				return oState;
			},

			onOpenIdea: function(oEvent) {
				var iIdeaId;

				if (oEvent.getParameter("ideaId")) {
					iIdeaId = oEvent.getParameter("ideaId");
				} else {
					try {
						if (oEvent.getSource().getProperty("objectId")) {
							iIdeaId = oEvent.getSource().getProperty("objectId");
						}
					} catch (e) {
						iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
					}
				}
				if (iIdeaId) {
					this.navigateTo("idea-display", {
						id: iIdeaId
					});
				}
			},

			onOpenCampaign: function(oEvent) {
				this.navigateTo("campaign", {
					id: oEvent.getParameter("campaignId")
				});
			},

			setMultiInputContent: function(oControl, aUserIds, bSuppressTokenChangeEvent) {
				if (!oControl) {
					return;
				}
				if (bSuppressTokenChangeEvent) {
					// TODO find a better way to supress unwanted reuest due to token changes
					this._aIgnoreTokenChanges = this._aIgnoreTokenChanges ? this._aIgnoreTokenChanges : [];
					this._aIgnoreTokenChanges.push(oControl);
				}

				if (!aUserIds || aUserIds.length === 0) {
					oControl.removeAllTokens();
				} else {
					var oTokenTemplate = new Token({
						text: "{data>NAME}",
						key: "{data>ID}"
					});

					var aFilters = [];
					jQuery.each(aUserIds, function(iIdx, sId) {
						aFilters.push(new Filter({
							path: 'ID',
							operator: 'EQ',
							value1: sId
						}));
					});

					var aIdentityFilters = [];
					aIdentityFilters.push(new Filter({
						filters: aFilters,
						and: false
					}));

					var oMultiInput = oControl;
					oControl.bindAggregation("tokens", {
						path: "data>/Identity",
						filters: aIdentityFilters,
						template: oTokenTemplate,
						events: {
							dataRequested: function() {
								// if the system is slow and the list request is still running the binding of the token can take some time
								oMultiInput.setBusy(true);
							},
							dataReceived: function() {
								oMultiInput.setBusy(false);
							}
						}
					});
				}

				if (bSuppressTokenChangeEvent) {
					this._aIgnoreTokenChanges = this._aIgnoreTokenChanges.filter(function(o) {
						return o.id !== oControl.id;
					});
				}

			},

			addMultiInputHandling: function(oControl, mSettings) {
				if (!oControl) {
					return;
				}
				var that = this;
				var fnSuggestHandler = this._createSuggestHandler(mSettings.suggestion);
				oControl.attachSuggest(fnSuggestHandler, this);

				oControl.attachTokenUpdate(function(oEvent) {
					if (!that._aIgnoreTokenChanges || that._aIgnoreTokenChanges.filter(function(o) {
						return o.id === oEvent.oSource.id;
					}).length === 0) {
						if (oEvent.getParameter("type") === "removed") {
							if (oEvent.getParameter('removedTokens').length > 0) {
								oEvent.getSource().removeToken(oEvent.getParameter('removedTokens')[0]);
							}
							mSettings.tokenChangeCallback.apply(that, [oEvent.getSource()]);
						} else if (oEvent.getParameter("type") === "added") {
							mSettings.tokenChangeCallback.apply(that, [oEvent.getSource()]);
						}
					}
				});

				if (mSettings.identity) {
					this.setMultiInputContent(oControl, mSettings.identity);
				}
			},

			onSetFilterBarVisible: function(authorFilterId, coachFilterId) {
				/*this.addPhaseItems();
				this.addRespListItems();
				this.addSubStatusFilterItems();*/
				this.bindTagCloud();
				var oAuthorFilter = this.getFilterElementById(authorFilterId);
				if (oAuthorFilter && !oAuthorFilter.mEventRegistry.hasOwnProperty("tokenUpdate")) {
					this.addMultiInputHandling(oAuthorFilter, {
						suggestion: {
							key: "ID",
							text: "NAME",
							additionalText: "USER_NAME",
							path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
							filters: [new Filter({
								path: "TYPE_CODE",
								operator: FilterOperator.EQ,
								value1: "USER"
							})],
							sorter: new Sorter("NAME")
						},
						identity: this.getViewProperty("/List/AUTHORS"),
						tokenChangeCallback: this.onFilterAuthorChange,
						token: {
							key: "IDENTITY_ID",
							text: "NAME"
						}
					});
				}

				var oCoachFilter = this.getFilterElementById(coachFilterId);
				if (oCoachFilter && !oCoachFilter.mEventRegistry.hasOwnProperty("tokenUpdate")) {
					this.addMultiInputHandling(oCoachFilter, {
						suggestion: {
							key: "ID",
							text: "NAME",
							additionalText: "USER_NAME",
							path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
							filters: [new Filter({
								path: "TYPE_CODE",
								operator: FilterOperator.EQ,
								value1: "USER"
							})],
							sorter: new Sorter("NAME")
						},
						identity: this.getViewProperty("/List/COACHES"),
						tokenChangeCallback: this.onFilterCoachChange,
						token: {
							key: "IDENTITY_ID",
							text: "NAME"
						}
					});
				}
			},

			bindFilters: function(fnCallback) {
				// init campaign filter list
				this.initialCampaignItems();
				this.initCampaignFormItems();
				var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea_filter.xsjs";
				var oParameters = {
					CAMPAIGN_ID: this.getBindingParameter().CampaignId ? parseInt(this.getBindingParameter().CampaignId, 10) : undefined,
					STATUS: this.getViewProperty("/List/STATUS"),
					IS_MANAGED: this._check4ManagingList(),
					INCLUDE_DRAFT: this.getCurrentVariant().INCLUDE_DRAFT
				};
				var oViewModel = this.getModel("view");
				var that = this;

				jQuery.ajax({
					url: sPath,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					data: oParameters,
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: true,
					success: function(oResponse) {
						// set phase model
						oViewModel.setProperty("/Phases", oResponse.Phases);
						// set resp model
						var aRes = oResponse.RespValues;
						if (aRes && aRes.length > 0) {
							aRes.sort(function(oPrev, oNext) {
								return oPrev.DEFAULT_TEXT.localeCompare(oNext.DEFAULT_TEXT);
								//return oPrev.SEQUENCE_NO < oNext.SEQUENCE_NO;
							});
						}
						oViewModel.setProperty("/resp", that._filterRespValues(aRes));
						oViewModel.setSizeLimit(1000);
						// set substatus model
						oViewModel.setProperty("/subStatus", oResponse.Substatus);
						// bind phase filter manually
						that._bindPhase("phaseSelect");

						if (fnCallback && typeof fnCallback === "function") {
							fnCallback();
						}
					}
				});
			},

			_bindPhase: function(phaseseId) {
				var that = this;
				var sEmpty = that.getListProperty("/Filter/PhaseBinding/EMPTY_CODE_TEXT");
				var sTbPath = that.getListProperty("/Filter/PhaseBinding/TABLE_PATH");
				var sTablePath = "view>/Phases";
				var sCodePath = "view" + ">" + that.getListProperty("/Filter/PhaseBinding/CODE_PATH");
				var fnFormatter = CodeModel.getFormatter(sTbPath);
				var oTemplate = new Item({
					text: {
						path: sCodePath,
						formatter: function(sCode) {
							return (!sCode) ? that.getText(sEmpty) : fnFormatter(sCode);
						}
					},
					key: {
						path: sCodePath
					}
				});

				var oPhaseSelect = that.getFilterElementById(phaseseId);
				if (oPhaseSelect) {
					oPhaseSelect.bindItems({
						path: sTablePath,
						template: oTemplate,
						parameters: {
							includeEmptyCode: true
						}
					});
				}
			},

			_filterRespValues: function(respValues) {
				var that = this,
					respCode = that.getQuery(),
					aRespCode;
				if (!respCode || !respValues || respValues.length === 0) {
					return respValues;
				}
				try {
					aRespCode = JSON.parse(that.getQuery().respCode);
				} catch (ex) {
					return respValues;
				}
				if (!aRespCode || aRespCode.length === 0) {
					return respValues;
				}
				aRespCode.forEach(function(oRespCode) {
					that._filterRespChildrenValues(oRespCode, respValues);
				});
				return respValues;
			},

			_filterRespChildrenValues: function(oRespCode, oChildrenRespValues) {
				var that = this;
				oChildrenRespValues.forEach(function(oParent) {
					if (oRespCode.code === oParent.CODE) {
						oParent.checked = "Checked";
					}
					if (oParent.children && oParent.children.length > 0) {
						that._filterRespChildrenValues(oRespCode, oParent.children);
						/*if (oParent.children.length === oParent.children.filter(function(x) {
							return x.checked === 'Checked';
						}).length) {
							oParent.checked = "Checked";
						} else if (oParent.children.filter(function(x) {
							return x.checked === 'Checked';
						}).length === 0 && oParent.children.filter(function(x) {
							return x.checked === 'Mixed';
						}).length === 0) {
							oParent.checked = "Unchecked";
						} else {
							oParent.checked = "Mixed";
						}*/
					}
				});
			},

			getAdditionalFilter: function() {
				var oFragment;

				// if (this._oIdeaFilterFrag) {
				// 	return this._oIdeaFilterFrag;
				// }

				oFragment = this.createFragment("sap.ino.vc.idea.fragments.FilterItems", this.createIdForFilterElement());
				var oFilterItemsLayout = this.getFilterElementById("filterItems");
				this._extensibilityExtensionFilterItems(oFilterItemsLayout);
				// this._oIdeaFilterFrag = oFragment;

				return oFragment;
			},

			onApplyFilterToQuery: function() {
				if (this.isCanApply()) {
					this.navigateIntern(this.getQuery({
						bFilterChange: true
					}), true, true);
				}
			},

			reloadData: function() {
				this.bindList();
				this.bindTagCloud();
			},

			checkDate: function(dDate, dDefault) {
				var dCheck = new Date(dDate);
				return isNaN(dCheck.getTime()) ? dDefault : dCheck;
			},

			checkStatus: function(sStatus, sDefault) {
				if (sStatus && sStatus.length > 0) {
					return sStatus.split(",");
				} else {
					return sDefault;
				}
			},

			checkPhase: function(sName, sDefault) {
				var sPath = this.getListProperty("/Filter/PhaseBinding/TABLE_PATH");
				var name = sName;
				var aCodes = CodeModel.getCodes(sPath);
				if (sName) {
					var aResult = jQuery.grep(aCodes, function(oCode) {
						var aName = name.split(",");
						var code = oCode;
						return jQuery.grep(aName, function(oName) {
							return oName === code.CODE;
						});
					});

					if (aResult && aResult.length > 0) {
						return sName.split(",");
					}
				}
				return sDefault;
			},

			checkIdentities: function(sIdentities, oDefault) {
				if (!sIdentities) {
					return oDefault;
				} else {
					return sIdentities.split(",");
				}
			},

			onApplyFilter: function() {
				var oFilterDialog = this.getFilterDialog();
				if (JSON.stringify(this.getViewModelBackup()) === JSON.stringify(this.getViewProperty("/")) && JSON.stringify(this.getFilterItemModelBackup()) ===
					JSON.stringify(this.getModel("filterItemModel"))) {
					oFilterDialog.close();
					return;
				}

				var oQuery = this.getQuery({
					bFilterChange: true
				});

				var sVariant = this.getViewProperty("/List/VARIANT");
				var route = this.getRoute();
				// var isAll = sVariant === this.getListProperty("/Variants/DEFAULT_VARIANT");
				var params = {
					query: oQuery
				};
				if (route === "campaign-idealist" || route === "campaign-idealistvariant") {
					params.id = oQuery.campaign || this.campaignId;
				}
				// if (!isAll) {
				params.variant = sVariant;
				// }

				// this.navigateTo(this.getRoute(!isAll), params, true, true);
				this.navigateTo(this.getRoute(true), params, true, true);

				oFilterDialog.close();
			},

			getExportPrefix: function() {
				return this.getText("EXPORT_PREFIX_IDEA");
			},

			onMoreFilterChange: function(oEvent) {
				var oNavContainer = this.getFilterNavContainer();
				var aPages = oNavContainer.getPages();
				var oFilterContainer = aPages[0].getContent()[0];
				if (oFilterContainer.getItems().length > 2) {
					var _fncallback = function(oContainer) {
						oContainer.$().find('*[tabindex="0"]')[oContainer.getItems().length - 1].focus();
						// hide busyindicator
						this.getFilterElementById("filterItems").setBusy(false);
					}.bind(this, oFilterContainer);

					this.setViewProperty("/List/IS_SHOW_MORE_FILTER", true);
					oEvent.getSource().setVisible(false);
					this.getFilterElementById("filterItems").setBusyIndicatorDelay(0).setBusy(true);

					setTimeout(function(fnCallback) {
						this.bindFilters(fnCallback);
					}.bind(this, _fncallback), 0);
				}
			},

			onFilterReset: function() {
				this.setViewProperty("/List/TAGS", []);
				this.setViewProperty("/List/IS_TAGS_SELECTION", false);
				this.setViewProperty("/List/SORT", "");
				this.setViewProperty("/List/SELECTQUICKLINKID", undefined);
				this.getModel("list").setProperty("/CURRENTSELECTLINK", undefined);
				this.getModel("list").setProperty("/TITLESELECTQUICKLINK", undefined);
				//this.setViewProperty("/List/IS_SHOW_MORE_FILTER", false);
				this.resetFilter();

				// hide more filter items
				/*var oMoreFilters = this.getFilterElementById("filterItems");
				if (oMoreFilters) {
					oMoreFilters.setVisible(false);
					this.byId(this.getFilterFragmentId() + "--showMoreFiltersBtn").setVisible(true);
				}*/

				if (!Device.system.desktop) {
					//no navigation on mobile phones yet
					return;
				}

				this.navigateIntern(this.getQuery({
					bFilterChange: true,
					bSorterChange: true
				}), true);
			},

			onCampaignSuggestion: function(oEvent) {
				var oViewModel = this.getModel("view");
				var that = this;
				var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
				var mEvent = jQuery.extend({}, oEvent, true);
				var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
				var sManaged = this._check4ManagingList() ? "managedCampaigns" : "";
				this.resetClientMessages();
				oModel.read("/CampaignSuggestionParams(searchToken='" + sTerm + "',filterName='" + sManaged + "')/Results", {
					urlParameters: {
						"$orderby": "SHORT_NAME"
					},
					success: function(oData) {
						oViewModel.setProperty("/campaignSuggestion", oData.results);
						var oCampFilter = that.byId("campaignFilterList") || that.getFilterElementById("campaignFilterList");
						oCampFilter.setFilterSuggests(false);
					}
				});
			},

			onClearCampaignFilter: function(oEvent) {
				var sValue = oEvent.getParameter("value");
				if (sValue.trim() === "") {
					this.setViewProperty("/List/CAMPAIGN", "");
					// 	this.navigateIntern(this.getQuery(), true, true);
				}
				this.setCampaignForm(undefined);
				this.clearIdeaFormFieldsCriterias();
			},

			onCampaignDialogSearch: function(oEvent) {
				var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
				var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
				var oViewModel = this.getModel("view");
				var sManaged = this._check4ManagingList() ? "managedCampaigns" : "";
				oModel.read("/CampaignSuggestionParams(searchToken='" + sValue + "',filterName='" + sManaged + "')/Results", {
					urlParameters: {
						"$orderby": "SHORT_NAME"
					},
					success: function(oData) {
						oViewModel.setProperty("/campaignSuggestion", oData.results);
					}
				});
			},

			onCampaignDialogItemsSelect: function(oEvent) {
				var sSelectedKey = oEvent.getParameter("selectedItem").data("ID") + "";
				var oCampaignFilterList = this.byId("campaignFilterList") || this.getFilterElementById("campaignFilterList");
				var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
				oCampaignFilterItems.forEach(function(item) {
					if (item.getProperty("key") === sSelectedKey) {
						oCampaignFilterList.setSelectionItem(item);

					}
				});

				this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
				this.clearIdeaFormFieldsCriterias();
				this.getIdeaFormFieldsCriterias();
				// this.navigateIntern(this.getQuery(), true, true);
			},

			onPressOpenIdeaListFilterPersonalization: function() {
				var that = this;
				var oViewModel = this.getModel("view");
				if (this._check4ManagingList()) {
					PersonalizeSetting.getFilterSettingsForDialogForBackoffice().done(function(data) {
						oViewModel.setProperty("/List/IDEA_LIST_FILTER_PERSONALIZATION_SETTING", data.RESULT);
						// create dialog
						var oIdeaListFilterPersonalizeDialog = that.createIdeaListFilterPersonalizeDialog();
						oIdeaListFilterPersonalizeDialog.open();
					});
				} else {
					PersonalizeSetting.getFilterSettingsForDialogForCommunity().done(function(data) {
						oViewModel.setProperty("/List/IDEA_LIST_FILTER_PERSONALIZATION_SETTING", data.RESULT);
						// create dialog
						var oIdeaListFilterPersonalizeDialog = that.createIdeaListFilterPersonalizeDialog();
						oIdeaListFilterPersonalizeDialog.open();
					});
				}

			},

			onUpdateIdeaFilterPersonzalization: function(oEvent) {
				var thatEvent = oEvent.getSource();
				var oViewModel = this.getModel("view");
				var oPersonalizationSetting = oViewModel.getProperty("/List/IDEA_LIST_FILTER_PERSONALIZATION_SETTING");
				var oPayload = {};
				var that = this;
				oPersonalizationSetting.forEach(function(item, index) {
					oPayload[item.CODE] = {
						VALUE: Number(item.VALUE),
						SEQUENCE: item.SEQUENCE !== undefined ? item.SEQUENCE + 1 : 9999
					};
				});
				PersonalizeSetting.updateFilterSettings({
					'IDEA_LIST_FILTER_PERSONALIZATION': oPayload
				}).done(function() {
					oViewModel.setProperty("/List/IDEA_LIST_FILTER_PERSONALIZATION", oPayload);
					thatEvent.close();
					that.resetFilter();
					//thatEvent.destroy();
				});
			},

			onIdeaFilterPersonzalizationCancel: function(oEvent) {
				oEvent.getSource().close();
				//oEvent.getSource().destroy();
			},

			handleIdeaFilterPersonzalizationSearch: function(oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilter = new Filter("CODE", sap.ui.model.FilterOperator.Contains, sValue);
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([oFilter]);
			},

			onHandleCampaignFilterHelp: function() {
				var that = this;
				var oViewModel = this.getModel("view");
				var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
				var sManaged = this._check4ManagingList() ? "managedCampaigns" : "";
				oModel.read("/CampaignSuggestionParams(searchToken='',filterName='" + sManaged + "')/Results", {
					urlParameters: {
						"$orderby": "SHORT_NAME"
					},
					success: function(oData) {
						oViewModel.setProperty("/campaignSuggestion", oData.results);
						var oCampFilter = that.byId("campaignFilterList") || that.getFilterElementById("campaignFilterList");
						oCampFilter.setFilterSuggests(false);
						// create dialog
						var oCampaignlistDialog = that.createCampaignListDialog();
						oCampaignlistDialog.open();
					}
				});
				that.setCampaignForm(undefined);
			},

			createIdeaListFilterPersonalizeDialog: function() {
				if (!this._IdeaListFilterPersonalizeDialog) {
					this._IdeaListFilterPersonalizeDialog = this.createFragment("sap.ino.vc.idea.fragments.IdeaListPersonalizeFilterPop", this.getView()
						.getId());
					this.getView().addDependent(this._IdeaListFilterPersonalizeDialog);
				}
				return this._IdeaListFilterPersonalizeDialog;
			},

			createCampaignListDialog: function() {
				if (!this._campaignDialog) {
					this._campaignDialog = this.createFragment("sap.ino.vc.idea.fragments.CampaignSuggestionSelectList", this.getView().getId());
					this.getView().addDependent(this._campaignDialog);
				}
				return this._campaignDialog;
			},

			initApplicationObjectChangeListeners: function() {
				var that = this;
				that._bListChanged = false;
				var aActions = ["create", "del", "modifyAndSubmit", "executeStatusTransition"];

				var fnAOChangeListener = function(oEvent) {
					var sAction = oEvent.getParameter("actionName");
					if (sAction && aActions.indexOf(sAction) > -1 && oEvent.getParameter("object").getMetadata().getName() ===
						"sap.ino.commons.models.object.Idea") {
						that._bListChanged = true;
					}
				};

				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
				ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
			},

			onObjectListUpdateFinished: function(event) {
				var parameters = event && event.getParameters();
				if (parameters && parameters.total > 0) {
					this.setViewProperty("/List/SELECT_ALL_ENABLE", true);
					// 	this.byId("sapInoMassExportBtn").setEnabled(this.getViewProperty("/List/EXPORT_ALL"));
				} else {
					this.setViewProperty("/List/SELECT_ALL_ENABLE", false);
					// 	this.byId("sapInoMassExportBtn").setEnabled(false);
				}
				BaseController.prototype.onObjectListUpdateFinished.apply(this, arguments);
				this.initIdeaSearchParam();
			},

			changeDefaultSortOfVariant: function(oVariant, oQuery) {
				if (oQuery && oQuery.search && (oVariant.ACTION === "manage" || oVariant.ACTION === "all")) {
					oVariant.DEFAULT_SORT = "SEARCH_SCORE";
				} else if (oVariant.ACTION === "manage" || oVariant.ACTION === "all") {
					jQuery.each(this.list.Variants.Values, function(iIdx, sSorter) {
						if (sSorter.ACTION === oVariant.ACTION) {
							oVariant.DEFAULT_SORT = sSorter.DEFAULT_SORT;
							return false;
						}
					});
				}
			},

			activeIdeaFilterSwitchChange: function() {
				this.setViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS", !this.getViewProperty("/List/IDEA_FILTER_NEW_AND_INPROCESS"));
				this.navigateIntern(this.getQuery(), true, true);
			},
            activeIdeaFilterCommunityGroupView: function(){
				this.setViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW", !this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW"));
				var aVariants = this.getModel("list").getProperty("/Variants/Values");
				var sText;
				for(var i = 0; i < aVariants.length; i ++){
				    var oVariant = aVariants[i]; 
				    sText = oVariant.TEXT;
				    if(oVariant.ACTION === mVariant.VOTED){
				        sText = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW") ?  "IDEA_LIST_MIT_MY_VOTED" : "IDEA_LIST_MIT_VOTED";
				    } else if(oVariant.ACTION === mVariant.COMMENTED)
				    {
				        sText = this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW") ?   "IDEA_LIST_MIT_MY_COMMENTED" : "IDEA_LIST_MIT_COMMENTED";
				    }
				    this.getModel("list").setProperty("/Variants/Values/" + i + "/TEXT", sText);
				}
				
				
				var oRouteParams = {
					query: this.getQuery(),
					variant: ""
				};
				
				if (this.getViewProperty("/List/SEARCH")) {
					oRouteParams.query.search = this.getViewProperty("/List/SEARCH");
				}				
			   	var sRoute = "idealistvariant";
			   	if(this.getViewProperty("/List/IS_IDEA_FILTER_COMMUNITY_GROUP_VIEW")){
					oRouteParams.variant = mVariant.MY;
			   	} else {
			   	    oRouteParams.variant = mVariant.ALL;
			   	}
				if (this.getRoute().indexOf("campaign") > -1) {
					oRouteParams.id = this._iCampaignId;
					sRoute = "campaign-idealistvariant";
				} 			   	
								
				this.navigateTo(sRoute, oRouteParams, true, true);				
				
				
				
				//this.navigateIntern(this.getQuery(), true, true);                
            },
			onOfficeToggle: function() {
				this.bOfficeToggle = true;
				var newQuickLinkFunction = this.getViewProperty("/NEWQUICKLINKFUNCTION");
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				bShowBackoffice = !bShowBackoffice;
				this.getModel("component").setProperty("/SHOW_BACKOFFICE", bShowBackoffice);
				var oRouteParams = {
					query: {},
					variant: ""
				};
				if (this.getViewProperty("/List/SEARCH")) {
					oRouteParams.query.search = this.getViewProperty("/List/SEARCH");
					oRouteParams.query.sort = this.getViewProperty("/List/SORT");
				}
				var sRoute = "idealistvariant";
				// if (bShowBackoffice && !newQuickLinkFunction) {
				// 	oRouteParams.variant = mVariant.MANAGE;
				// 	this.navigateTo(sRoute, oRouteParams, true, true);
				// } else if(!bShowBackoffice && !newQuickLinkFunction){
				// 	oRouteParams.variant = mVariant.ALL;
				// 	this.navigateTo(sRoute, oRouteParams, true, true);
				// }
				if (bShowBackoffice) {
					oRouteParams.variant = mVariant.MANAGE;
				} else {
					oRouteParams.variant = mVariant.ALL;
				}

				// if (this.getRoute().indexOf("campaign") > -1 && !newQuickLinkFunction) {
				// 	oRouteParams.id = this._iCampaignId;
				// 	sRoute = "campaign-idealistvariant";
				// 	this.navigateTo(sRoute, oRouteParams, true, true);
				// 	return;
				// } 

				if (this.getRoute().indexOf("campaign") > -1) {
					oRouteParams.variant = bShowBackoffice ? mVariant.MANAGE : mVariant.ALL;
					oRouteParams.id = this._iCampaignId;
					sRoute = "campaign-idealistvariant";
				}
				// if(this.getRoute().indexOf("campaign") === -1 ){
				//     this.navigateTo("idealist");
				//     return;
				// }
				this.navigateTo(sRoute, oRouteParams, true, true);
			},

			getCurrentUrlId: function() {
				this.setViewProperty("/List/SELECTQUICKLINKID", undefined);
				var aValues = this.getModel("list").getProperty("/Variants/Values");
				var currentUrl = this.getViewProperty("/CURRENTURL");
				var selectId = this.getViewProperty("/List/SELECTQUICKLINKID");
				var sVariant = this.getViewProperty("/isre");
				var that = this;
				var aCurrentUrl = currentUrl.split("/");
				if (aCurrentUrl[0].indexOf("campaign") > -1) {
					aCurrentUrl.splice(0, 2);
					currentUrl = aCurrentUrl.join("/");
				}
				aValues.forEach(function(oValues) {
					if (oValues.LINK_URL && decodeURIComponent(oValues.LINK_URL) === currentUrl) {
						that.setViewProperty("/List/SELECTQUICKLINKID", oValues.ID);
						that.getModel("list").setProperty("/TITLESELECTQUICKLINK", oValues);
						selectId = oValues.ID;
						return;
					}
				});

				if (selectId) {
					return;
				}

				aValues.forEach(function(oValues) {
					if (oValues.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oValues.ACTION === sVariant) {
						that.setViewProperty("/List/SELECTQUICKLINKID", oValues.ID);
						that.getModel("list").setProperty("/TITLESELECTQUICKLINK", oValues);
						selectId = oValues.ID;
						return;
					}
				});

				if (selectId) {
					return;
				} else {
					this.setViewProperty("/List/SELECTQUICKLINKID", undefined);
				}
			},

			getCurrentQuickIdeaList: function() {
				var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
				var oQuickLinkList;
				if (bShowBackoffice) {
					oQuickLinkList = this.byId("panelFilterFragment--backOfficeQuickLinkIdeaList");
				} else {
					oQuickLinkList = this.byId("panelFilterFragment--communityQuickLinkIdeaList");
				}

				return oQuickLinkList;
			},

			navigateToFirstQuickLink: function(aVisibelLink, oQuery) {
				var sCampaignId = this.campaignId;
				if (!Array.isArray(aVisibelLink) || !aVisibelLink.length) {
					return;
				}
				var sCustomerQuickLinkUrl;
				var currentFirstLink = aVisibelLink[0].getBindingContext("list").getObject();
				this.setViewProperty("/List/SELECTQUICKLINKID", currentFirstLink.ID);
				this.getModel("list").setProperty("/CURRENTSELECTLINK", currentFirstLink);
				this.getModel("list").setProperty("/TITLESELECTQUICKLINK", currentFirstLink);
				if (currentFirstLink.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
					//this.getModel("list").setProperty("/CURRENTQUICKLINK" , currentFirstLink);
					sCustomerQuickLinkUrl = sCampaignId ?
						location.href.split("#")[0] + "#/campaign/" + sCampaignId + "/" + currentFirstLink.LINK_URL :
						location.href.split("#")[0] + "#/" + currentFirstLink.LINK_URL;
					sCustomerQuickLinkUrl = "search" in oQuery ? location.href.split("#")[0] + "#/" + currentFirstLink.LINK_URL + "&search=" + oQuery.search :
						location.href.split("#")[0] + "#/" + currentFirstLink.LINK_URL;
					this.setViewProperty("/firstQuickLink", sCustomerQuickLinkUrl);
					this.navigateToByURL(sCustomerQuickLinkUrl);
				} else {
					var oRouteParams = {
						variant: currentFirstLink.ACTION
					};
					if (sCampaignId) {
						oRouteParams.id = sCampaignId;

						sCustomerQuickLinkUrl = location.href.split("#")[0] + "#/campaign/" + sCampaignId + "/ideas-" + oRouteParams.variant;
					} else {
						sCustomerQuickLinkUrl = location.href.split("#")[0] + "#/ideas-" + oRouteParams.variant;
					}

					sCustomerQuickLinkUrl = "search" in oQuery ? sCustomerQuickLinkUrl + "/?search=" + oQuery.search : sCustomerQuickLinkUrl;
					// 	sCustomerQuickLinkUrl = location.href.split("#")[0] + "#/ideas-" + oRouteParams.variant;                
					this.setViewProperty("/firstQuickLink", sCustomerQuickLinkUrl);
					//this.navigateTo(this.getRoute(true), oRouteParams, true, true);
					this.navigateToByURL(sCustomerQuickLinkUrl);
				}
			},

			refreshQuickLinkSettings: function(data, aVariants) {
				var sVariant = this.getViewProperty("/isre");
				var oVariant = jQuery.extend(true, {}, this.getVariant(sVariant));
				if (data.RESULT.length > 0 && aVariants) {
					data.RESULT.forEach(function(oResult) {
						aVariants.forEach(function(oVariant) {
							if (oResult.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oVariant.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oResult.OBJECT_TYPE_CODE ===
								oVariant.OBJECT_TYPE_CODE) {
								oVariant.ACTIVE = oResult.ACTIVE === 1 ? true : false;
								oVariant.SEQUENCE = oResult.SEQUENCE;
								oVariant.ID = oResult.ID;
								oVariant.ENABLED = oResult.ENABLED;
							} else if (oResult.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
								// get filter infomation from link url
								// oResult.FILTER_INFO = that.getFilterInfoByLink(oResult.LINK_URL);
								var newQuickLink = aVariants.every(function(oitem) {
									if (oitem.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA") {
										return true;
									}

									if (oitem.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA") {
										return oResult.ID !== oitem.ID;
									}
								});
								if (newQuickLink && oVariant.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA" && oResult.OBJECT_TYPE_CODE === oVariant.OBJECT_TYPE_CODE) {
									oResult.ACTIVE = oResult.ACTIVE === 1 ? true : false;
									oResult.FILTER = oVariant.FILTER;
									oResult.ACTION = oVariant.ACTION;
									oResult.ROLES = oVariant.ROLES;
									if (oVariant.MANAGE) {
										oResult.MANAGE = oVariant.MANAGE;
									}
									aVariants.push(oResult);
								}
							}
						});
					});
				}
				this.getModel("list").setProperty("/Variants/Values", aVariants);
				this.setVariantVisibility(oVariant);
			},

			setQuicklinkFilterListValue: function() {
				var that = this;
				var oViewModel = this.getModel("view");
				var oCampaignFilter = this.byId("campaignFilterList");
				var campaignFilterValue = oCampaignFilter.getValue();
				oViewModel.setProperty("/quickLinkcampaignName", campaignFilterValue);

				var aSelect = [];
				["phaseSelect", "statusSelect", "subStatusSelect", "latestUpdateSelect"].forEach(function(oSelect) {
					var oSelectItem = that.byId(oSelect).getSelectedItems();
					oSelectItem.forEach(function(oItem) {
						aSelect.push(oItem.getText());
					});
					oViewModel.setProperty("/quickLink" + oSelect, aSelect.toString());
					aSelect = [];
				});

				var aFilter = [];
				["authorFilter", "coachFilter", "respListMultiInput"].forEach(function(oFilter) {
					var oTokensItem = that.byId(oFilter).getTokens();
					oTokensItem.forEach(function(oItem) {
						aFilter.push(oItem.getProperty("text"));
					});
					oViewModel.setProperty("/quickLink" + oFilter, aFilter.toString());
					aFilter = [];
				});

				var aDate = [];
				["dpDue", "dpDueTo"].forEach(function(oDate) {
					var oDateValue = that.byId(oDate).getValue();
					aDate.push(oDateValue);
					oViewModel.setProperty("/quickLinkdateFilter", aDate.toString());
				});

				var sVoteOperator = this.byId("voteOperatorSelect").getSelectedItem().getText();
				oViewModel.setProperty("/quickLinkvoteOperator", sVoteOperator);

				var aCriterias = this.getModel("filterItemModel").getProperty("/IdeaFormCriterias");
				var aCampaignForm = this.getModel("filterItemModel").getProperty("/CAMPAIGNFORM");
				var aIdeaFormList = this.getModel("filterItemModel").getProperty("/IdeaFormList");
				var aCampaignFormName = this.byId("campaignFormFilterList").getValue();

				var aCampaignFormValue = [];
				if (aIdeaFormList && aCriterias) {
					aIdeaFormList.forEach(function(oIdeaFormList) {
						aCriterias.forEach(function(oCriteria) {
							if (oCriteria.CriteriaCode === oIdeaFormList.CODE) {
								if (oCriteria.CriteriaValue === "1" && oCriteria.CriteriaValueDataType === 1) {
									aCampaignFormValue.push(oIdeaFormList.DEFAULT_TEXT + ": true");
								} else if (oCriteria.CriteriaValue === "0" && oCriteria.CriteriaValueDataType === 1) {
									aCampaignFormValue.push(oIdeaFormList.DEFAULT_TEXT + ": false");
								} else {
									aCampaignFormValue.push(oIdeaFormList.DEFAULT_TEXT + ": " + oCriteria.CriteriaValue);
								}
							}
						});
					});
				}

				var bCriteriaValue = aCriterias.every(function(oCriteria) {
					return oCriteria.CriteriaValue === "" || oCriteria.CriteriaValue === undefined;
				});

				if (aCampaignForm !== "" && aCampaignForm !== undefined) {
					if (bCriteriaValue) {
						oViewModel.setProperty("/quickLinkCampaignForm", aCampaignFormName.toString());
					} else {
						oViewModel.setProperty("/quickLinkCampaignForm", aCampaignFormName + "(" + aCampaignFormValue.toString() + ")");
					}
				} else if (bCriteriaValue) {
					oViewModel.setProperty("/quickLinkCampaignForm", "");
				} else {
					oViewModel.setProperty("/quickLinkCampaignForm", aCampaignFormValue.toString());
				}
			},

			onQuickLinkOpen: function() {
				this.setQuicklinkFilterListValue();
				this.getQuickLinkDialog().open();
				this.setShortByIcon("shortByIcon3", "shortByIcon4");
			},

			getQuickLinkDialog: function() {
				if (!this._quickLinkDialog) {
					this._quickLinkDialog = this.createFragment("sap.ino.vc.idea.fragments.QuickLinkDialog", this.getView().getId());
					this.getView().addDependent(this._quickLinkDialog);
				}
				return this._quickLinkDialog;
			},

			onHandleQuickLinkOK: function() {
				var oQuickLinkName = this.byId("quickLinkName");
				if (oQuickLinkName.getValue() === "" || oQuickLinkName.getValue() === undefined) {
					oQuickLinkName.setValueState("Error");
					return;
				} else {
					this.createQuickLinkCustomSettings();
				}
			},

			createQuickLinkCustomSettings: function() {
				var that = this;
				var nACTIVE = 1;
				var aVisibelLink = this.getCurrentQuickIdeaList().getVisibleItems();
				if (aVisibelLink.length > 9) {
					nACTIVE = 0;
				}
				var aSequence = [];
				var aVariants = this.getModel("list").getProperty("/Variants/Values");
				aVariants.forEach(function(oVariant) {
					aSequence.push(oVariant.SEQUENCE);
				});
				var minSequence = Math.min.apply(null, aSequence);

				var linkUrl = this.getCustomLinkUrl();
				var linkText = this.getViewProperty("/List/QUICKLINKNAME");
				var objectTypeCode = this.getCurrentVariant().OBJECT_TYPE_CODE;
				var aSettings = [];
				aSettings.push({
					"ID": -1,
					"ACTIVE": nACTIVE,
					"SEQUENCE": minSequence - 1,
					"TYPE_CODE": "QUICK_LINK_CUSTOM_IDEA",
					"OBJECT_TYPE_CODE": objectTypeCode,
					"LINK_TEXT": linkText,
					"LINK_URL": linkUrl
				});

				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};

				if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length === 0) {
					this._quickLinkDialog.setBusy(true);
					PersonalizeSetting.updateQuickLinkSettings(aSettings).done(function() {
						PersonalizeSetting.getQuickLinkSettings({
							'TYPE_CODE': mTypeCode
						}).done(function(data) {
							that.refreshQuickLinkSettings(data, aVariants);
							var oList = that.getCurrentQuickIdeaList();
							oList.bindItems(oList.getBindingInfo('items'));
							//aVisibelLink = that.getQuickIdeaListVisiableItems();
							that._quickLinkDialog.setBusy(false);
							that.onHandleQuickLinkCancel();
							MessageToast.show(that.getText("QUICK_LINK_CREATE_CUSTOMER_IDEA_SUCCESS"), oMessageToast);
							//that.navigateToFirstQuickLink(aVisibelLink);
						});
					}).fail(function() {
						that._quickLinkDialog.setBusy(false);
						that.onHandleQuickLinkCancel();
						MessageToast.show(that.getText("QUICK_LINK_CREATE_CUSTOMER_IDEA_FAILURE"), oMessageToast);
					});
				}
			},

			getCustomLinkUrl: function() {
				var oQuery = this.getQuery();
				if ("search" in oQuery) {
					delete oQuery.search;
				}
				var sVariant = this.getViewProperty("/List/VARIANT");
				var currentRoute = this.getCurrentRoute();
				var params = {
					query: oQuery
				};

				if (currentRoute === "idealist") {
					currentRoute = "idealistvariant";
				}

				if (currentRoute === "campaign-idealist" || currentRoute === "campaign-idealistvariant") {
					params.id = oQuery.campaign || this.campaignId;
				}
				params.variant = sVariant;
				var oUrl = this.getRouter().getURL(currentRoute, params);
				return decodeURIComponent(oUrl);

			},

			onHandleQuickLinkCancel: function() {
				this._quickLinkDialog.close();
				this._quickLinkDialog.destroy();
				this._quickLinkDialog = undefined;
				this.setViewProperty("/List/QUICKLINKNAME", "");
			},

			onQuickLinkInfoPopoverOpen: function(oEvent) {
				if (this._oQuickLinkInfoPopover) {
					this._oQuickLinkInfoPopover.close();
					this._oQuickLinkInfoPopover = null;
				}
				this._oQuickLinkInfoPopover = this.createFragment("sap.ino.vc.idea.fragments.QuickLinkInfoPopover");
				this.getView().addDependent(this._oQuickLinkInfoPopover);
				this._oQuickLinkInfoPopover.openBy(oEvent.getSource());
			},

			onQuickLinkStandListDialogOpen: function() {
				this._currentItemIndex = -1;
				this._currentData = jQuery.extend(true, [], this.getModel('list').getProperty('/Variants/Values'));
				this.deleteId = [];
				this.getQuickLinkStandardListDialog().open();
				this.onQuickLinkSelectionChange();
			},

			getQuickLinkStandardListDialog: function() {
				var oTable, aItem;
				if (!this._quickLinkStandardListDialog) {
					this._quickLinkStandardListDialog = this.createFragment("sap.ino.vc.idea.fragments.QuickLinkStandardListDialog", this.getView().getId());
					this.getView().addDependent(this._quickLinkStandardListDialog);
					oTable = this.byId('quickLinkStandardListTable');
					// 	oTable.addEventDelegate({
					// 	    onAfterRendering: function(){
					// 	        this.updateQuickLinkCount(oTable.getVisibleItems().length);
					// 	        if(this._currentItemIndex >= 0 && oTable.getVisibleItems()[this._currentItemIndex]){
					// 	            oTable.getVisibleItems()[this._currentItemIndex].getCells()[2].firePress();
					// 	        }
					// 	    }
					// 	},this);
					aItem = oTable.getVisibleItems();
					for (var i = 0; i < aItem.length; i++) {
						aItem[i].addEventDelegate({
							onAfterRendering: function() {
								var aCurrentItem = oTable.getVisibleItems();
								if (this._currentItemIndex >= 0 && aCurrentItem[this._currentItemIndex]) {
									var oItem = aCurrentItem[this._currentItemIndex];
									if (oItem && oItem.getCells && oItem.getCells()[2] && oItem.getCells()[2].firePress) {
										oItem.getCells()[2].firePress();
									}
								}
							}
						}, this);
					}
					this.updateQuickLinkCount(aItem.length);
				} else {
					oTable = this.byId('quickLinkStandardListTable');
					aItem = oTable.getVisibleItems();
					this.updateQuickLinkCount(aItem.length);
				}
				return this._quickLinkStandardListDialog;
			},

			updateQuickLinkCount: function(iCount) {
				this.getModel('view').setProperty('/QUICK_LINK_COUNT', iCount);
			},

			onQuickLinkStandListMenuButtonPress: function(oEvent) {
				var oSource = oEvent.getSource();
				if (!this._quickLinkMenuPopover) {
					this._quickLinkMenuPopover = this._quickLinkStandardListDialog.getContent()[0].getContent()[1];
					this._quickLinkMenuPopover.setVisible(true);
					this.getView().addDependent(this._quickLinkMenuPopover);
				}
				this.setQuickLinkMenuButtonStatus(oSource.getParent().getParent(), oSource.getParent());

				this._quickLinkMenuPopover.getContent()[0].bindElement('list>' + oSource.getParent().getBindingContextPath());
				this._quickLinkMenuPopover.openBy(oSource);
			},

			setQuickLinkMenuButtonStatus: function(oTable, oSelectedItem) {
				var aControl = this._quickLinkMenuPopover.getContent()[0].getItems();
				var oMoveUpButton = aControl[0];
				var oMoveDownButton = aControl[1];
				var oDeleteButton = aControl[2];
				var aItems = oTable.getVisibleItems();
				var oContext = oSelectedItem.getBindingContext('list');
				var bDeleteButtonEnabled = oContext.getProperty(oContext.getPath() + '/TYPE_CODE') === 'QUICK_LINK_CUSTOM_IDEA';
				oMoveUpButton.setEnabled(oSelectedItem !== aItems[0]);
				oMoveDownButton.setEnabled(oSelectedItem !== aItems[aItems.length - 1]);
				oDeleteButton.setEnabled(bDeleteButtonEnabled);
			},

			onQuickLinkMoveUpButtonPress: function(oEvent) {
				var oContext = oEvent.getSource().getBindingContext('list');
				this.setQuickLinkItemSequence(oContext, 'UP');
				this._quickLinkMenuPopover.close();
			},

			onQuickLinkMoveDownButtonPress: function(oEvent) {
				var oContext = oEvent.getSource().getBindingContext('list');
				this.setQuickLinkItemSequence(oContext, 'DOWN');
				this._quickLinkMenuPopover.close();
			},

			setQuickLinkItemSequence: function(oContext, sDirection) {
				var that = this;
				var oTable = this.byId('quickLinkStandardListTable');
				var oModel = oContext.getModel();
				var sPath = oContext.getPath();
				var aItem = oTable.getVisibleItems();
				var oCurrentItem, oPrevItem, oNextItem, sCurrentPath, sPrevPath, sNextPath, iCurrentSequence, iPrevSequence, iNextSequence;
				for (var i = 0; i < aItem.length; i++) {
					oCurrentItem = aItem[i];
					sCurrentPath = oCurrentItem.getBindingContext('list').getPath();
					if (sCurrentPath === sPath) {
						iCurrentSequence = oCurrentItem.getBindingContext('list').getProperty(sCurrentPath + '/SEQUENCE');
						if (sDirection === 'UP') {
							oPrevItem = aItem[i - 1];
							sPrevPath = oPrevItem.getBindingContext('list').getPath();
							iPrevSequence = oPrevItem.getBindingContext('list').getProperty(sPrevPath + '/SEQUENCE');
							oModel.setProperty(sCurrentPath + '/SEQUENCE', iPrevSequence);
							oModel.setProperty(sPrevPath + '/SEQUENCE', iCurrentSequence);
							that._currentItemIndex = i - 1;
						}
						if (sDirection === 'DOWN') {
							oNextItem = aItem[i + 1];
							sNextPath = oNextItem.getBindingContext('list').getPath();
							iNextSequence = oNextItem.getBindingContext('list').getProperty(sNextPath + '/SEQUENCE');
							oModel.setProperty(sCurrentPath + '/SEQUENCE', iNextSequence);
							oModel.setProperty(sNextPath + '/SEQUENCE', iCurrentSequence);
							that._currentItemIndex = i + 1;
						}
						// this will not trigger table onafterrendering, but listitem onafterrendering, which fix the duplicated id issue
						oModel.refresh(true);
						//   oTable.bindItems(oTable.getBindingInfo('items'));
						return false;
					}
				}

			},

			onQuickLinkDeleteButtonPress: function(oEvent) {
				var oContext = oEvent.getSource().getBindingContext('list');
				var oObject = oContext.getObject();
				var oTable = this.byId('quickLinkStandardListTable');
				var aItem = oTable.getVisibleItems();
				var oCurrentItem, sCurrentPath;
				for (var i = 0; i < aItem.length; i++) {
					oCurrentItem = aItem[i];
					sCurrentPath = oCurrentItem.getBindingContext('list').getPath();
					if (oContext.getPath() === sCurrentPath) {
						oCurrentItem.getBindingContext('list').getObject().DELETE = 1;
						//  oTable.removeItem(oCurrentItem);
					}
				}
				this.getModel('list').refresh(true);
				this._currentItemIndex = -1;
				this.deleteId.push(oObject.ID);
				this.updateQuickLinkCount(oTable.getVisibleItems().length);
				this.onQuickLinkSelectionChange();
			},

			onQuickLinkInformationPopoverOpen: function(oEvent) {
				var oSource = oEvent.getSource();
				if (!this._quickLinkInfoPopover) {
					this._quickLinkInfoPopover = this.createFragment("sap.ino.vc.idea.fragments.QuickLinkInfoPopover");
					this.getView().addDependent(this._quickLinkInfoPopover);
				}
				this._quickLinkInfoPopover.openBy(oSource);
			},

			onQuickLinkSelectionChange: function() {
				var oListTable = this.byId("quickLinkStandardListTable");
				var aVailableList = oListTable.getVisibleItems();
				var selectNum = 0;
				var aUnselectItem = [];
				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};
				aVailableList.forEach(function(oItem) {
					var bSelected = oItem.getAggregation("cells")[0].getSelected();
					if (bSelected === true) {
						selectNum += 1;
					} else {
						aUnselectItem.push(oItem);
					}
				});

				if (selectNum > 9) {
					MessageToast.show(this.getText("QUICK_LINK_LIST_SELECT_OVER_LIMIT"), oMessageToast);
					aUnselectItem.forEach(function(oUnselectItem) {
						oUnselectItem.getAggregation("cells")[0].setEnabled(false);
					});
				} else if (selectNum === 0) {
					MessageToast.show(this.getText("QUICK_LINK_LIST_SELECT_BELOW_LIMIT"), oMessageToast);
					this.byId('quickLinkStandardListDialogOKButton').setEnabled(false);
				} else {
					aUnselectItem.forEach(function(oUnselectItem) {
						oUnselectItem.getAggregation("cells")[0].setEnabled(true);
					});
					this.byId('quickLinkStandardListDialogOKButton').setEnabled(true);
				}
			},

			onHandleQuickLinkStandardListDialogOK: function() {
				var oListTable = this.byId("quickLinkStandardListTable");
				var aVailableList = oListTable.getVisibleItems();
				var selectNum = 0;
				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};
				aVailableList.forEach(function(oItem) {
					var bSelected = oItem.getAggregation("cells")[0].getSelected();
					if (bSelected === true) {
						selectNum += 1;
					}
				});

				if (selectNum === 0) {
					MessageToast.show(this.getText("QUICK_LINK_LIST_SELECT_BELOW_LIMIT"), oMessageToast);
					return;
				}
				this.updateQuickLinkStandardSettings();
			},

			updateQuickLinkStandardSettings: function() {
				var that = this;
				var aValues = this.getModel("list").getProperty("/Variants/Values");
				var aSettings = [];
				var oMessageToast = {
					duration: 7000,
					width: '20em'
				};
				aValues.forEach(function(oValues) {
					if (oValues.TYPE_CODE === "QUICK_LINK_STANDARD_IDEA") {
						aSettings.push({
							"ID": oValues.ID ? oValues.ID : -1,
							"ACTIVE": oValues.ACTIVE === true ? 1 : 0,
							"SEQUENCE": oValues.SEQUENCE,
							"TYPE_CODE": "QUICK_LINK_STANDARD_IDEA",
							"OBJECT_TYPE_CODE": oValues.OBJECT_TYPE_CODE
						});
					} else {
						aSettings.push({
							"ID": oValues.ID ? oValues.ID : -1,
							"ACTIVE": oValues.ACTIVE === true ? 1 : 0,
							"SEQUENCE": oValues.SEQUENCE,
							"TYPE_CODE": "QUICK_LINK_CUSTOM_IDEA",
							"OBJECT_TYPE_CODE": oValues.OBJECT_TYPE_CODE,
							"LINK_TEXT": oValues.LINK_TEXT,
							"LINK_URL": oValues.LINK_URL
						});
					}
				});

				if (this.deleteId.length > 0) {
					aSettings.forEach(function(oSetting) {
						that.deleteId.forEach(function(oId) {
							if (oSetting.ID === oId) {
								oSetting.DELETE = 1;
							}
						});
					});

					this.deleteId.forEach(function(oId) {
						aValues = aValues.filter(function(oValues) {
							return oValues.ID !== oId;
						});
					});
				}
				PersonalizeSetting.updateQuickLinkSettings(aSettings).done(function() {
					PersonalizeSetting.getQuickLinkSettings({
						'TYPE_CODE': mTypeCode
					}).done(function(data) {
						that.refreshQuickLinkSettings(data, aValues);
						var oList = that.getCurrentQuickIdeaList();
						oList.bindItems(oList.getBindingInfo('items'));
						that._quickLinkStandardListDialog.close();
						MessageToast.show(that.getText("QUICK_LINK_UPDATE_SUCCESS"), oMessageToast);
					});
				}).fail(function() {
					that._quickLinkStandardListDialog.close();
					MessageToast.show(that.getText("QUICK_LINK_UPDATE_FAILURE"), oMessageToast);
				});
			},

			onHandleQuickLinkStandardListDialogCancel: function() {
				this.getModel('list').setProperty('/Variants/Values', this._currentData);
				this._quickLinkStandardListDialog.close();
				this._quickLinkStandardListDialog.destroy();
				this._quickLinkStandardListDialog = undefined;
			},

			onQuickLinkNameChange: function(oEvent) {
				var that = this;
				var oControl = oEvent.getSource();
				var sName = oControl.getValue();
				var aData = this.getModel('list').getProperty('/Variants/Values');
				var aStandardName = [
                    this.getText('IDEA_LIST_MIT_EVAL_PENDING'),
                    this.getText('IDEA_LIST_MIT_OPEN_FOR_EVAL'),
                    this.getText('IDEA_LIST_MIT_MY_EVAL'),
                    this.getText('IDEA_LIST_MIT_VOTE'),
                    this.getText('IDEA_LIST_MIT_MY'),
                    this.getText('IDEA_LIST_MIT_VOTED'),
                    this.getText('IDEA_LIST_MIT_COMMENTED'),
                    this.getText('IDEA_LIST_MIT_COMPLETED'),
                    this.getText('IDEA_LIST_MIT_ALL'),
                    this.getText('IDEA_LIST_MIT_FOLLOW_UP'),
                    this.getText('IDEA_LIST_MIT_MANAGE'),
                    this.getText('IDEA_LIST_MIT_UNASSIGNED'),
                    this.getText('IDEA_LIST_MIT_COACH_ME'),
                    this.getText('IDEA_LIST_MIT_EVAL_DONE')
                ];
				if (!PersonalizeSetting.checkQuickLinkNameValid(aData, sName, aStandardName)) {
					oControl.fireValidationError({
						element: oControl,
						property: 'value',
						type: 'Error',
						message: that.getText('MSG_QUICK_LINK_NAME_DUPLICATED')
					});
				} else {
					oControl.fireValidationSuccess({
						element: oControl,
						property: 'value'
					});
				}
			},

			initIdeaSearchParam: function() {
				var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");
				var sOdataPath = "";
				if (bBackoffice) {
					sOdataPath = "/sap/ino/xs/rest/backoffice/odata.xsodata";
				} else {
					sOdataPath = "/sap/ino/xs/rest/community/odata.xsodata";
				}
				var sPath = Configuration.getBackendRootURL() + sOdataPath + this.getList().mBindingInfos.items.binding.sPath + "?$format=json";
				var sFilter = this.getList().mBindingInfos.items.binding.sFilterParams;
				var sSorter = this.getList().mBindingInfos.items.binding.sSortParams;
				var sSelect = "&$select(ID)";
				sPath = sPath + "&" + sSorter + "&" + sFilter + sSelect;
				var oIdeaSearchParams = new JSONModel();
				oIdeaSearchParams.setData({
					path: sPath
				});
				sap.ui.getCore().setModel(oIdeaSearchParams, "ideaSearchParams");
			},
			getGroupViewParameters: function(oBindingParameter){
			    var sGroup = Configuration.getGroupConfiguration().GROUP;
				var sGroupVariant;
				if(sGroup === "COMPANY"){
				    sGroupVariant = 1;
				} else if(sGroup === "ORGANIZATION"){
				    sGroupVariant = 2;
				}
				var sRoleType;
				if( oBindingParameter.Variant === mVariant.MY_GROUP_VIEW_AUTH){
				    sRoleType = 1;
				} else if (oBindingParameter.Variant === mVariant.MY_GROUP_VIEW_VOTED){
				    sRoleType = 2;
				} else if (oBindingParameter.Variant === mVariant.MY_GROUP_VIEW_COMMENTED){
				    sRoleType = 3;
				}
				sRoleType = sRoleType ? sRoleType : 0;
				sGroupVariant = sGroupVariant ? sGroupVariant : 0;
				return {groupToken:'',
				        groupType:sGroupVariant,
				        groupRole:sRoleType
				};
			},
			getSearchType: function(){
			        var selectedCategory = this.getModel('search').getProperty('/selectedCategory');
				    var searchType = 0;
				    if(selectedCategory === 'campaign-idealistbycompany' || selectedCategory === 'idealistbycompany'){
				        searchType = 1;
				    }
				    return searchType;
			}
			

			//end
		}));

	oIdeaList.list = mList;
	oIdeaList.routes = mIdeaRoutes;

	return oIdeaList;
});