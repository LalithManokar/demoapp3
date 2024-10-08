var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var date = $.import("sap.ino.xs.aof.lib", "date");
var status = $.import("sap.ino.xs.object.status", "Status");
var ideaCount = $.import("sap.ino.xs.object.idea", "ideaCounts");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var Link = $.import("sap.ino.xs.object.link", "Link");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var WallAssignment = $.import("sap.ino.xs.object.wall", "Assignment");
var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var Extension = $.import("sap.ino.xs.object.basis", "Extension");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var ObjectOnPersistCallBack = $.import("sap.ino.xs.xslib", "ObjectOnPersistCallback");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IdeaMessage = $.import("sap.ino.xs.object.idea", "message");
var RewardMessage = $.import("sap.ino.xs.object.reward", "message");
var DataType = $.import("sap.ino.xs.object.basis", "Datatype").DataType;
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");
var EvaluationReqDelete = $.import("sap.ino.xs.object.evaluation", "EvaluationRequest");
var IntegrationMessage = $.import("sap.ino.xs.object.integration", "message");
var trackingLog = $.import("sap.ino.xs.xslib", "trackingLog");
var Status = this.Status = {
	Draft: "sap.ino.config.DRAFT",
	NewInPhase: "sap.ino.config.NEW_IN_PHASE",
	Discontinued: "sap.ino.config.DISCONTINUED",
	Completed: "sap.ino.config.COMPLETED",
	Merged: "sap.ino.config.MERGED"
};

var StatusAction = {
	Discontinue: "sap.ino.config.DISCONTINUE"
};

var Node = {
	Root: "Root"
};

var Action = {
	Copy: "copy",
	Del: "del"
};

this.definition = {
	isExtensible: true,
	cascadeDelete: ["sap.ino.xs.object.idea.Comment", "sap.ino.xs.object.idea.InternalNote", "sap.ino.xs.object.idea.Vote",
		"sap.ino.xs.object.evaluation.Evaluation", "sap.ino.xs.object.followup.FollowUp", "sap.ino.xs.object.integration.IdeaObjectIntegration"],
	actions: {
		create: {
			// All authenticated application users may create ideas (as they are initially drafts)
			// Campaign authorization is checked when submitting the idea
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck,
			historyEvent: "IDEA_CREATED"
		},
		copy: {
			authorizationCheck: authorizationCopyCheck,
			enabledCheck: copyEnabledCheck,
			historyEvent: "IDEA_CREATED"
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_UPDATE),
			executionCheck: modifyExecutionCheck,
			enabledCheck: updateEnabledCheck,
			historyEvent: "IDEA_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_delete", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_DELETE),
			executionCheck: delExecutionCheck,
			enabledCheck: deleteEnabledCheck,
			customProperties: delCustomProperties,
			//execute: deleteIdeaEvaluationRequest,
			historyEvent: "IDEA_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_read", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_READ)
		},
		submit: {
			// TODO for 1.2 or 2.0: move the check for (campaign == null) away from the auth check, due to this causes a
			// HTTP 403 for a missing campaign
			authorizationCheck: auth.compositeAccessCheck([auth.conditionCheck("sap.ino.db.idea::t_idea", "ID", "not CAMPAIGN_ID = '0'", IdeaMessage
				.AUTH_CAMP_MUST_NOT_BE_NULL, "Root", "CAMPAIGN_ID"), auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_submit", "IDEA_ID",
				IdeaMessage.AUTH_MISSING_IDEA_SUBMIT)]),
			enabledCheck: submitEnabledCheck,
			execute: submit,
			historyEvent: "STATUS_ACTION_SUBMIT"
		},
		executeStatusTransition: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_status_transition", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_STATUS_TRANSITION),
			execute: executeStatusTransition,
			enabledCheck: executeStatusTransitionEnabledCheck,
			historyEvent: "STATUS_ACTION",
			customProperties: statusTransitionProperties,
			massActionName: "massExecuteStatusTransition"
		},
		assignToMe: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_coach_assign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH_ASSIGN),
			execute: assignToMe,
			enabledCheck: assignToMeEnabledCheck,
			historyEvent: "COACH_ASSIGNED"
		},
		assignCoach: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_coach_assign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH_ASSIGN),
			execute: assignCoach,
			enabledCheck: assignCoachEnabledCheck,
			historyEvent: "COACH_ASSIGNED",
			massActionName: "massAssignCoach"
		},
		unassignCoach: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_coach_unassign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH_UNASSIGN),
			execute: unassignCoach,
			enabledCheck: unassignCoachEnabledCheck,
			historyEvent: "COACH_UNASSIGNED",
			massActionName: "massUnassignCoach"
		},
		autoAssignCoach: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_read", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_READ),
			historyEvent: "AUTO_COACH_ASSIGNED",
			execute: autoAssignCoach
		},
		autoVote: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_read", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_READ),
			historyEvent: "AUTO_VOTE",
			execute: autoVote
		},
		addExpert: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_idea_expert_assign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH_ASSIGN),
			execute: addExpert,
			enabledCheck: addExpertEnabledCheck,
			historyEvent: "EXPERT_ASSIGNED",
			massActionName: "massAddExpert"
		},
		removeExpert: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_idea_expert_unassign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH_ASSIGN),
			execute: removeExpert,
			enabledCheck: removeExpertEnabledCheck,
			historyEvent: "EXPERT_UNASSIGNED",
			massActionName: "massRemoveExpert"
		},
		assignTag: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_UPDATE),
			execute: assignTag,
			enabledCheck: assignTagEnabledCheck,
			historyEvent: "IDEA_UPDATED",
			massActionName: "massAssignTag"
		},
		reassignCampaign: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_idea_privilege", "IDEA_ID", IdeaMessage.AUTH_MISSING_REASSIGN_IDEA),
			execute: reassignCampaign,
			enabledCheck: reassignCampaignEnabledCheck,
			historyEvent: "IDEA_CAMPAIGN_REASSIGN",
			massActionName: "massReassignCampaign"
		},
		bulkReplacePhaseCode: {
			authorizationCheck: false,
			execute: bulkReplacePhaseCode,
			historyEvent: "CAMPAIGN_PHASE_CODE_REPLACEMENT",
			isStatic: true,
			isInternal: true,
			customProperties: bulkReplacePhaseCodeProperties
		},
		bulkAdaptStatusCode: {
			authorizationCheck: false,
			execute: bulkAdaptStatusCode,
			historyEvent: "CAMPAIGN_STATUS_MODEL_CODE_REPLACEMENT",
			isStatic: true,
			isInternal: true,
			customProperties: bulkAdaptStatusCodeProperties
		},
		bulkDeleteVotes: {
			authorizationCheck: false,
			execute: bulkDeleteVotes,
			historyEvent: "CAMPAIGN_VOTE_TYPE_REPLACEMENT",
			isStatic: true,
			isInternal: true,
			customProperties: bulkDeleteVotesProperties
		},
		deleteTagAssignments: TagAssignment.includeDeleteTagAssignment(),
		mergeTagAssignments: TagAssignment.includeMergeTagAssignment(),
		mergeIdeas: {
			// Authorization is not checked by framework, to provide a meaningful response. Is checked in the action
			// implementation
			authorizationCheck: false,
			enabledCheck: mergeIdeasEnabledCheck,
			execute: mergeIdeas,
			historyEvent: "RELATION_UPDATED",
			impacts: ["sap.ino.xs.object.idea.Idea"],
			customProperties: mergeIdeasProperties
		},
		createIdeaFromIdeas: {
			authorizationCheck: false,
			execute: createIdeaFromIdeas,
			isStatic: true,
			impacts: ["sap.ino.xs.object.idea.Idea"],
			customProperties: createIdeaFromIdeasProperties
		},
		setStatusMerged: {
			authorizationCheck: false,
			execute: setStatusMerged,
			historyEvent: "RELATION_UPDATED",
			isInternal: true
		},
		addRelation: {
			authorizationCheck: false,
			execute: addRelation,
			historyEvent: "RELATION_UPDATED",
			isInternal: true
		},
		removeRelation: {
			authorizationCheck: false,
			execute: removeRelation,
			historyEvent: "RELATION_UPDATED",
			isInternal: true
		},
		markAsDuplicate: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_UPDATE),
			execute: markAsDuplicate,
			historyEvent: "RELATION_UPDATED",
			customProperties: markAsDuplicateProperties
		},
		unmarkAsDuplicate: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_UPDATE),
			execute: unmarkAsDuplicate,
			historyEvent: "RELATION_UPDATED",
			customProperties: unmarkAsDuplicateProperties
		},
		bulkDeleteRelations: {
			authorizationCheck: false,
			execute: bulkDeleteRelations,
			historyEvent: "RELATION_UPDATED",
			isStatic: true,
			isInternal: true
		},
		evalReqAssignExpert: {
			authorizationCheck: false,
			execute: evalReqAssignExpert,
			historyEvent: "EVAL_REQ_EXPERT_ASSIGNED",
			isInternal: true
		},
		evalReqUnassignExpert: {
			authorizationCheck: false,
			execute: evalReqUnassignExpert,
			historyEvent: "EVAL_REQ_EXPERT_UNASSIGNED",
			isInternal: true
		},
		dismissReward: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.reward::v_auth_rewards_create", "IDEA_ID", RewardMessage.AUTH_MISSING_REWARD_CREATE),
			execute: dismissReward,
			historyEvent: "IDEA_REWARD_DISMISSED"
		},
		changeAuthorStatic: {
			authorizationCheck: false,
			enabledCheck: bulkChangeAuthorCheck,
			execute: changeAuthorStatic,
			historyEvent: "IDEA_CHANGE_AUTHOR",
			isStatic: true
		},
		changeDecision: {
			authorizationCheck: false,
			execute: changeDecision,
			enabledCheck: changeDecisionEnabledCheck,
			historyEvent: "CHANGE_DECISION"
		},
		createObject: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_idea_privilege", "IDEA_ID", IntegrationMessage.MSG_INTEGRATION_API_NO_CREATE_OBJECT_PRIVILEGE),
			execute: createObject,
			enabledCheck: createObjectEnabledCheck
		},
		removeCoauthor: {
			authorizationCheck: false,
			execute: removeCoauthor,
			historyEvent: "REMOVE_COAUTHOR"
		},
		updateAdminForms: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_UPDATE),
			enabledCheck: updateEnabledCheck,
			execute: updateAdminForms,
			historyEvent: "ADMIN_FORM_WITHOUT_PUBLISH"
		},
		linkExistedObject: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_idea_privilege", "IDEA_ID", IntegrationMessage.MSG_INTEGRATION_API_NO_CREATE_OBJECT_PRIVILEGE),
			execute: linkExistedObject,
			enabledCheck: linkExistedObjectEnabledCheck
		}
	},
	Root: {
		table: "sap.ino.db.idea::t_idea",
		sequence: "sap.ino.db.idea::s_idea",
		historyTable: "sap.ino.db.idea::t_idea_h",
		determinations: {
			onCreate: [initIdea],
			onPrepareCopy: [initIdea],
			onDelete: [deleteIdeaEvaluationRequest],
			onCopy: [copy],
			onUpdate: [reassignIdeaToCampaign, autoFollowIdea],
			onModify: [removeUnhealthyCharacters, updateShortDescription, determine.systemAdminData, TagAssignment.createTags,
				copyOrDeleteAssignedWalls, determineFieldValues, determineAdminFieldValues],
			onPersist: [ideaCount.update, deleteVotesForReassignIdea, deleteRelationsOfRelatedIdeasAfterDelete, deleteAssignedWallsAfterDelete,
				ObjectOnPersistCallBack.entry]
		},
		consistencyChecks: [contributorNotSubmitterCheck, expertNotSubmitterOrContributorCheck],
		customProperties: rootCustomProperties,
		nodes: {
			Submitter: IdentityRole.node(IdentityRole.ObjectType.Idea, IdentityRole.Role.IdeaSubmitter, true),
			Contributors: IdentityRole.node(IdentityRole.ObjectType.Idea, IdentityRole.Role.IdeaContributor, false),
			Coach: IdentityRole.node(IdentityRole.ObjectType.Idea, IdentityRole.Role.IdeaCoach, false),
			Experts: IdentityRole.node(IdentityRole.ObjectType.Idea, IdentityRole.Role.IdeaExpert, false),
			Links: Link.node(Link.ObjectType.Idea, Link.Type.URL, false),
			Relations: Link.node(Link.ObjectType.Idea, Link.Type.OBJECT, true),
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Idea, AttachmentAssignment.FilterTypeCode.Frontoffice),
			InternalAttachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Idea, AttachmentAssignment.FilterTypeCode.Backoffice),
			ContentAttachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.IdeaContentImg, AttachmentAssignment.FilterTypeCode.Frontoffice,
				AttachmentAssignment.RoleCode.IdeaContentImg),
			Walls: WallAssignment.node(WallAssignment.ObjectType.Idea, WallAssignment.FilterTypeCode.Frontoffice, WallAssignment.RoleTypeCode.Wall),
			InternalWalls: WallAssignment.node(WallAssignment.ObjectType.Idea, WallAssignment.FilterTypeCode.Backoffice, WallAssignment.RoleTypeCode
				.Wall),
			Tags: TagAssignment.node(TagAssignment.ObjectTypeCode.Idea),
			Decisions: {
				table: "sap.ino.db.idea::t_decision",
				historyTable: "sap.ino.db.idea::t_decision_h",
				sequence: "sap.ino.db.idea::s_decision",
				parentKey: "IDEA_ID",
				readOnly: true,
				attributes: {
					DECIDER_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},

			AnonymousFor: {
				table: "sap.ino.db.idea::t_ideas_setting",
				sequence: "sap.ino.db.idea::s_ideas_setting",
				parentKey: "IDEA_ID",
				attributes: {
					ANONYMOUS_FOR: {
						required: true
					}
				}
			},
			Extension: Extension.node(Extension.ObjectType.Idea),
			FieldsValue: {
				table: "sap.ino.db.ideaform::t_field_value",
				historyTable: "sap.ino.db.ideaform::t_field_value_h",
				sequence: "sap.ino.db.ideaform::s_field_value",
				parentKey: "IDEA_ID",
				attributes: {
					FIELD_TYPE_CODE: {
						constantKey: "CUSTOM_FIELD"
					},
					FIELD_CODE: {
						foreignKeyTo: "sap.ino.xs.object.ideaform.IdeaForm.Root.Fields"
					}
				}
			},
			ContributionShare: {
				table: "sap.ino.db.reward::t_contribution_share",
				sequence: "sap.ino.db.reward::s_contribution_share",
				parentKey: "IDEA_ID",
				attributes: {
					AUTHOR_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			AdminFieldsValue: {
				table: "sap.ino.db.ideaform::t_field_value",
				historyTable: "sap.ino.db.ideaform::t_field_value_h",
				sequence: "sap.ino.db.ideaform::s_field_value",
				parentKey: "IDEA_ID",
				attributes: {
					FIELD_TYPE_CODE: {
						constantKey: "ADMIN_FIELD"
					},
					FIELD_CODE: {
						foreignKeyTo: "sap.ino.xs.object.ideaform.IdeaForm.Root.Fields"
					}
				}
			}
			// 			IdeaRead: {
			// 				table: "sap.ino.db.idea::t_idea_read",
			// 				sequence: "sap.ino.db.idea::s_idea_read",
			// 				parentKey: "IDEA_ID",
			// 				attributes: {
			// 					ID: {
			// 						isPrimaryKey: true
			// 					},
			// 					CREATED_BY_ID: {
			// 						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			// 					}
			// 				}
			// 			}
		},
		attributes: {
			CAMPAIGN_ID: {
				foreignKeyTo: "sap.ino.xs.object.campaign.Campaign.Root",
				consistencyChecks: [check.attributeCheck(isOpenCampaign, IdeaMessage.CAMPAIGN_STATUS_DRAFT)],
				readOnly: campaignReadOnly
			},
			NAME: {
				readOnly: contentReadOnly,
				isName: true
			},
			DESCRIPTION: {
				readOnly: contentReadOnly
			},
			// for performance reasons (DESCRIPTION is NCLOB)
			// we redundantly persist an unformatted short description
			// to display e.g. on the back of the idea cards
			SHORT_DESCRIPTION: {
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
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			PHASE_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.campaign.Phase.Root"
			},
			STATUS_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
			},
			SUBMITTED_AT: {
				readOnly: true
			},
			DESCRIPTION_MIME_TYPE: {
				readOnly: true
			},
			COMMENT_COUNT: {
				readOnly: true
			},
			VIEW_COUNT: {
				readOnly: true
			},
			EVALUATION_COUNT: {
				readOnly: true
			},
			EVALUATION_IN_PHASE_COUNT: {
				readOnly: true
			},
			REWARD_DISMISSED: {
				readOnly: true
			},
			RESPONSIBILITY_VALUE_CHANGEABLE: {
				readOnly: ResponValueReadOnly
			}
		}
	}
};

function initIdea(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oWorkObject.Submitter = [{
		ID: fnNextHandle(),
		IDENTITY_ID: iUserId
    }];
	oWorkObject.STATUS_CODE = Status.Draft;
	oWorkObject.PHASE_CODE = null;
	oWorkObject.DESCRIPTION_MIME_TYPE = 'text/html';
	oWorkObject.COMMENT_COUNT = 0;
	oWorkObject.VIEW_COUNT = 0;
	oWorkObject.EVALUATION_COUNT = 0;
	oWorkObject.EVALUATION_IN_PHASE_COUNT = 0;

	// 	oWorkObject.IdeaRead = [{
	// 		CREATED_BY_ID: iUserId,
	// 		CREATED_AT: oContext.getRequestTimestamp(),
	// 		IS_READ: 0
	// 	}];
}

function updateShortDescription(vKey, oWorkObject) {
	oWorkObject.SHORT_DESCRIPTION = _.stripTags(oWorkObject.DESCRIPTION || "").substring(0, 500);
}

// This is a workaround for HANA incident 1570030882
// covering the most prominent vertical tab which is usually copied from a PPT
function removeUnhealthyCharacters(vKey, oWorkObject) {
	const
		rSpecialChars = /\v/gi;
	oWorkObject.NAME = oWorkObject.NAME && oWorkObject.NAME.replace(rSpecialChars, "");
	oWorkObject.DESCRIPTION = oWorkObject.DESCRIPTION && oWorkObject.DESCRIPTION.replace(rSpecialChars, "");
}

// Once the idea is reassigned to a new campaign, the idea's phase and status are reseted.
function reassignIdeaToCampaign(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	// check if the idea has been assigned to a new campaign
	if (oPersistedObject.STATUS_CODE != Status.Draft) {
		// check if the idea has status draft (in which case no status has to be changed)
		if (oWorkObject.CAMPAIGN_ID != oPersistedObject.CAMPAIGN_ID) {

			if (!oWorkObject.CAMPAIGN_ID || oWorkObject.CAMPAIGN_ID <= 0) {
				fnMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_CAMPAIGN_MANDATORY, vKey, "Root", "CAMPAIGN_ID");
			} else {
				// reset the idea phase code to the first phase of the new campaign
				oWorkObject.PHASE_CODE = getFirstCampaignPhase(oWorkObject).PHASE_CODE;
				// and set the status to new
				//oWorkObject.STATUS_CODE = Status.NewInPhase;
				oWorkObject.STATUS_CODE = status.getInitialStatus(oWorkObject.CAMPAIGN_ID, oWorkObject.PHASE_CODE);

				// check if the idea's coach should be removed in the new campaign
				// TraceWrapper.log_exception("Coach"+JSON.stringify(oWorkObject.Coach));
				if (oWorkObject.Coach && oWorkObject.Coach.length > 0) {
					var oStatment = oContext.getHQ().statement(
						'select CAMPAIGN_ID from "sap.ino.db.campaign::v_campaign_coach_transitive" where CAMPAIGN_ID = ? and ID = ?');
					var aResult = oStatment.execute(oWorkObject.CAMPAIGN_ID, oWorkObject.Coach[0].IDENTITY_ID);
					var sSelectRespCoach =
						'select A.*  from "sap.ino.db.subresponsibility::v_responsibility_value_coach" as A \
					 inner join "sap.ino.db.subresponsibility::v_responsibility_value" as B on B.id = A.resp_value_id \
                     where B.code = ? and A.identity_id = ? ';
					var aRespCoaches = oContext.getHQ().statement(sSelectRespCoach).execute(oWorkObject.RESP_VALUE_CODE, oWorkObject.Coach[0].IDENTITY_ID);
					// 	TraceWrapper.log_exception("aRespCoaches"+JSON.stringify(aRespCoaches));
					// 	TraceWrapper.log_exception("aResult"+JSON.stringify(aResult));
					if (aResult.length === 0 && aRespCoaches.length === 0) {
						oWorkObject.Coach = [];
					}
				}
				if (oWorkObject.Coach.length === 0) {
					///Ready for Auto Assign Coach
					var oHQ = oContext.getHQ();
					var sCampaignConfigSelect = 'select IS_AUTO_ASSIGN_RL_COACH from "sap.ino.db.campaign::t_campaign" where ID = ? ';
					var aConfig = oHQ.statement(sCampaignConfigSelect).execute(oWorkObject.CAMPAIGN_ID);
					if (aConfig.length > 0 && aConfig[0].IS_AUTO_ASSIGN_RL_COACH) {
						var sSelectDefaultCoach = 'select DEFAULT_COACH from "sap.ino.db.subresponsibility.ext::v_ext_responsibility_value" WHERE CODE = ? ';
						var aDefaultCoach = oHQ.statement(sSelectDefaultCoach).execute(oWorkObject.RESP_VALUE_CODE);
						// 		TraceWrapper.log_exception("aDefaultCoach"+JSON.stringify(aDefaultCoach));
						if (aDefaultCoach.length > 0 && aDefaultCoach[0].DEFAULT_COACH) {
							oWorkObject.Coach = [{
								ID: fnNextHandle(),
								IDENTITY_ID: aDefaultCoach[0].DEFAULT_COACH
                    }];
						}
					}
				}
			}
		}
	}
}

function autoFollowIdea(vKey, oWorkObject, oPersistedObject, addMessage, fnNextHandle, oContext) {
	//If the Co-author has been changed
	if (!oWorkObject.SUBMITTED_AT) {
		return;
	}
	var Follow = AOF.getApplicationObject("sap.ino.xs.object.follow.Follow");
	var oResponse;
	var aWorkObjectAuthors = oWorkObject.Submitter;
	var aPersistedObjectAuthors = oPersistedObject.Submitter;
	if (oWorkObject.Contributors.length > 0) {
		aWorkObjectAuthors = aWorkObjectAuthors.concat(oWorkObject.Contributors);
	}

	if (oPersistedObject.Contributors.length > 0) {
		aPersistedObjectAuthors = aPersistedObjectAuthors.concat(oPersistedObject.Contributors);
	}
	var aDiffAuthors = [];
	for (var i = 0; i < aWorkObjectAuthors.length; i++) {
		if (_.filter(aPersistedObjectAuthors, function(data) {
			return data.IDENTITY_ID === aWorkObjectAuthors[i].IDENTITY_ID;
		}).length === 0) {
			aDiffAuthors.push(aWorkObjectAuthors[i].IDENTITY_ID);
		}
	}
	if (aDiffAuthors.length > 0) {
		//Check the different author has followed the correponding IDEA
		var sSelctIDs = aDiffAuthors.join(',');
		var sSelFollowObject =
			'select CREATED_BY_ID AS IDENTITY_ID FROM "sap.ino.db.follow::t_follow" where object_type_code = \'IDEA\' AND OBJECT_ID = ? AND CREATED_BY_ID IN (' +
			sSelctIDs + ')';
		var aResultFollowed = oContext.getHQ().statement(sSelFollowObject).execute(vKey);
		var aNotFollowAuthors = [];
		_.each(aDiffAuthors, function(oIdentityID) {
			if (_.filter(aResultFollowed, function(data) {
				return data.IDENTITY_ID === oIdentityID;
			}).length === 0) {
				aNotFollowAuthors.push(oIdentityID);
			}
		});
		if (aNotFollowAuthors.length === 0) {
			return;
		}
		_.each(aNotFollowAuthors, function(followAuthor) {
			oResponse = Follow.create({
				OBJECT_TYPE_CODE: 'IDEA',
				OBJECT_ID: vKey,
				CREATED_BY_ID: followAuthor
			});
			addMessage(oResponse.messages);
		});

	} else {
		return;
	}

}

function deleteVotesForReassignIdea(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	// check if the idea has status draft (in which case no status has to be changed)
	if (oPersistedObject.STATUS_CODE != Status.Draft) {
		// check if the idea has been assigned to a new campaign
		if (oWorkObject.CAMPAIGN_ID != oPersistedObject.CAMPAIGN_ID) {
			var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
			var oOldCampaign = Campaign.read(oPersistedObject.CAMPAIGN_ID);
			var oNewCampaign = Campaign.read(oWorkObject.CAMPAIGN_ID);
			if (oNewCampaign.VOTE_TYPE_CODE !== oOldCampaign.VOTE_TYPE_CODE) {
				var Vote = AOF.getApplicationObject("sap.ino.xs.object.idea.Vote");
				var oResponse = Vote.bulkDeleteVotes({
					IDEA_ID: oWorkObject.ID
				});
				fnMessage(oResponse.messages);
			}
		}
	}
}

function isOpenCampaign(iCampaignId) {
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
	var CampaignStatus = $.import("sap.ino.xs.object.campaign", "Campaign").Status;
	var oCampaign = Campaign.read(iCampaignId);
	if (!oCampaign || oCampaign.messages) {
		return true;
	}
	return oCampaign && oCampaign.STATUS_CODE !== CampaignStatus.Draft;
}

function campaignReadOnly(vKey, oIdea, addMessage, oContext) {
	// an idea draft can be always assigned to another campaign
	if (!vKey || !oIdea || oIdea.STATUS_CODE === Status.Draft) {
		return false;
	}
	//When Idea has integration Object. Not allow to change it
	var sIntegrationQuery = 'select * from "sap.ino.db.integration::t_idea_object_integration" where idea_id = ? ';
	var oHQ = oContext.getHQ();
	var aIntegrationObject = oHQ.statement(sIntegrationQuery).execute(vKey);
	if (aIntegrationObject && aIntegrationObject.length > 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.REASSIGN_CAMPAIGN_NOT_AVAILABLE_INTEGRATION_OBJECT, vKey, "Root");
		return true;
	}

	// if user has privilege to reassign campaign
	var fnCampInstanceCheck = auth.parentInstanceAccessCheck("sap.ino.db.campaign::v_auth_campaigns_reassign_idea", "CAMPAIGN_ID",
		"CAMPAIGN_ID",
		IdeaMessage.AUTH_MISSING_REASSIGN_IDEA);
	var fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.subresponsibility::v_auth_responsibility_reassign_idea", "RESP_VALUE_CODE",
		IdeaMessage.AUTH_MISSING_REASSIGN_IDEA);
	var fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);
	if (fnInstanceCheck([oIdea.CAMPAIGN_ID, oIdea.RESP_VALUE_CODE], oIdea, function() {}, oContext)) {
		return false;
	}

	// if the idea is in the first campaign phase and in status "new in phase"
	if (oIdea.PHASE_CODE === getFirstCampaignPhase(oIdea).PHASE_CODE &&
		oIdea.STATUS_CODE === status.getInitialStatus(oIdea.CAMPAIGN_ID, getFirstCampaignPhase(oIdea).PHASE_CODE)) {
		//if (oIdea.PHASE_CODE === getFirstCampaignPhase(oIdea).PHASE_CODE && oIdea.STATUS_CODE === Status.NewInPhase) {    
		var oCampaign = getCampaign(oIdea);
		// and the campaign of the idea is still running
		if (date.isNowBetween(oCampaign.VALID_FROM, oCampaign.VALID_TO)) {
			// then the campaign of the idea can be changed
			return false;
		}
	}

	// by default the idea's campaign is not editable
	return true;
}

function ResponValueReadOnly(vKey, oIdea, addMessage, oContext) {

	var oHQ = oContext.getHQ();
	var oUserPrivileges = getCurrentUserPrivilege($.session, oHQ);

	/**if (oIdea.Contributors && oIdea.Contributors.length > 0 && _.findWhere(oIdea.Contributors, {
		IDENTITY_ID: oUserPrivileges.USER_ID
	})) {
		return false;
	}

	if (oIdea.Coach && oIdea.Coach.length > 0 && _.findWhere(oIdea.Coach, {
		IDENTITY_ID: oUserPrivileges.USER_ID
	})) {
		return false;
	}

	if (oIdea.Experts && oIdea.Experts.length > 0 && _.findWhere(oIdea.Experts, {
		IDENTITY_ID: oUserPrivileges.USER_ID
	})) {
		return false;
	}

	if (oIdea.Submitter && oIdea.Submitter.length > 0 && _.findWhere(oIdea.Submitter, {
		IDENTITY_ID: oUserPrivileges.USER_ID
	})) {
		return false;
	}**/

	return false;

}

function getCampaign(oIdea) {
	if (!oIdea.CAMPAIGN_ID) {
		return undefined;
	}
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
	return Campaign.read(oIdea.CAMPAIGN_ID);
}

function getFirstCampaignPhase(oIdea) {
	var oCampaign = getCampaign(oIdea);
	if (oCampaign) {
		return _.findWhere(oCampaign.Phases || [], {
			SEQUENCE_NO: 0
		});
	}
}

function getCurrentCampaignPhase(oIdea) {
	var oCampaign = getCampaign(oIdea);
	return _.findWhere(oCampaign.Phases || [], {
		PHASE_CODE: oIdea.PHASE_CODE
	});
}

function authorizationCopyCheck(vKey, oIdea, fnMessage, oContext) {
	var fnSubmitCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_submit", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_SUBMIT),
		fnCampaignCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_auth_submittable_campaign", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_IDEA_SUBMIT);
	var isResult = fnSubmitCheck(oIdea.ID, oIdea, function() {}, oContext);
	var fnCopyCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_read", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_READ);
	if (isResult) {
		isResult = fnCampaignCheck(oIdea.CAMPAIGN_ID, oIdea, function() {}, oContext);
	}
	if (!isResult) {
		fnMessage(AOF.MessageSeverity.Fatal, IdeaMessage.AUTH_MISSING_IDEA_SUBMIT, vKey, AOF.Node.Root, null);
		return false;
	}
	isResult = fnCopyCheck(oIdea.ID, oIdea, function() {}, oContext);
	if (!isResult) {
		fnMessage(AOF.MessageSeverity.Fatal, IdeaMessage.AUTH_MISSING_IDEA_SUBMIT, vKey, AOF.Node.Root, null);
	}
	return isResult;
}

function rootCustomProperties(vKey, oPersistedIdea, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var oCampaign = getCampaign(oPersistedIdea) || {};
	var oUserPrivileges = getCurrentUserPrivilege($.session, oHQ);
	var sSelectEmailAttr = 'select * from "sap.ino.db.iam.ext::v_ext_identity_attribute" where code = ?';
	var bEmailPublic = oHQ.statement(sSelectEmailAttr).execute('sap.ino.config.EMAIL')[0].IS_PUBLIC;
	//for idea display contact whether the emails are visible or not
	var oEmailVisibilies = {};

	if (bEmailPublic ||
		(oUserPrivileges.IS_EXTERNAL === 0 && oUserPrivileges.HAS_BACKOFFICE_PRIVILEGE)) {
		oEmailVisibilies = {
			CONTRIBUTORS: true,
			COACHES: true,
			IDEA_EXPERTS: true,
			CAMP_EXPERTS: true
		};
	} else if (oUserPrivileges.IS_EXTERNAL === 0) {
		//internal users can see all info of other internal users
		var aContributors = getInternalUser(oHQ, IdentityRole.Role.IdeaContributor, IdentityRole.ObjectType.Idea, vKey);
		var aCoaches = getInternalUser(oHQ, IdentityRole.Role.IdeaCoach, IdentityRole.ObjectType.Idea, vKey);
		var aIdeaExperts = getInternalUser(oHQ, IdentityRole.Role.IdeaExpert, IdentityRole.ObjectType.Idea, vKey);
		var aCampExperts = getInternalUser(oHQ, IdentityRole.Role.CampaignExpert, IdentityRole.ObjectType.Campaign, oCampaign.ID || '');

		oEmailVisibilies = {
			CONTRIBUTORS: aContributors.length === oPersistedIdea.Contributors.length,
			COACHES: aCoaches.length === oPersistedIdea.Coach.length,
			IDEA_EXPERTS: aIdeaExperts.length === oPersistedIdea.Experts.length,
			CAMP_EXPERTS: aCampExperts.length === oCampaign.Experts ? oCampaign.Experts.length : ''
		};
	} else {
		oEmailVisibilies = {
			CONTRIBUTORS: false,
			COACHES: false,
			IDEA_EXPERTS: false,
			CAMP_EXPERTS: false
		};
	}

	var fnCampInstanceCheck, fnRespInstanceCheck, fnInstanceCheck, fnIdeaUpdateCheck, fnEvalReqCheck;
	var bBackofficeCampaignPrivilege, bBackofficeIdeaModifyPrivilege, bFrontofficeEvalReqPrivilege;

	fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_responsibility_privilege", "RESP_VALUE_CODE",
		IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
	fnCampInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_campaign_privilege", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
	fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);
	fnIdeaUpdateCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
	fnEvalReqCheck = auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_request_item_read", "IDEA_ID", IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
	bBackofficeCampaignPrivilege = fnInstanceCheck([oPersistedIdea.CAMPAIGN_ID || 0, oPersistedIdea.RESP_VALUE_CODE], oPersistedIdea, function() {},
		oContext);
	bBackofficeIdeaModifyPrivilege = fnIdeaUpdateCheck(vKey, oPersistedIdea, function() {}, oContext);
	bFrontofficeEvalReqPrivilege = fnEvalReqCheck(vKey, oPersistedIdea, function() {}, oContext);

	var bChangeExpertPrivilege = bBackofficeCampaignPrivilege && oPersistedIdea.STATUS_CODE !== Status.Draft && !status.isFinalIdeaStatus(
		oPersistedIdea.STATUS_CODE);
	return {
		contentEditable: isContentEditable(oPersistedIdea),
		backofficeCampaignPrivilege: bBackofficeCampaignPrivilege,
		backofficeChangeExpertPrivilege: bChangeExpertPrivilege,
		backofficeIdeaModifyPrivilege: bBackofficeIdeaModifyPrivilege,
		backofficeEvalReqPrivilege: bBackofficeCampaignPrivilege,
		frontofficeEvalReqPrivilege: bFrontofficeEvalReqPrivilege,
		EmailVisibilies: oEmailVisibilies,
		backofficeChangeAuthorPrivilege: bBackofficeCampaignPrivilege
	};
}

function isContentEditable(oIdea) {
	if (!oIdea || oIdea.STATUS_CODE === Status.Draft || !oIdea.CAMPAIGN_ID) {
		return true;
	}
	var oCurrentPhase = getCurrentCampaignPhase(oIdea);
	return _.toBool(oCurrentPhase.IDEA_CONTENT_EDITABLE);
}

function contentReadOnly(vKey, oIdea, addMessage, oContext) {
	if (!vKey) {
		return false;
	}
	var bEditable = isContentEditable(oIdea);
	if (!bEditable) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ATTRIBUTE_NOT_CHANGEABLE, vKey, "Root");
	}
	return !bEditable;
}

function deleteEnabledCheck(vKey, oIdea, addMessage, oContext) {
	// Deletion enablement depends on authorization
	// --> Authorization check

	//reward check
	var oStatment = oContext.getHQ().statement(
		'select * from "sap.ino.db.reward::t_reward_list" where IDEA_ID = ?');
	var aResult = oStatment.execute(oIdea.ID);
	if (aResult.length > 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_HAVE_REWARD_CANNOT_DELETE, vKey, "Root");
		return false;
	}
	//
	if (oIdea.STATUS_CODE === 'sap.ino.config.MERGED') {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_MERGED_CANNOT_DELETE, vKey, "Root");
		return false;
	}

	return;
}

function deleteIdeaEvaluationRequest(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	//delete evaluaiton Request
	EvaluationReqDelete.delDueToIdeaDel(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext);

}
//vKey, oWorkObject, oMessageBuffer.addMessage, oContext
function updateEnabledCheck(vKey, oPersistedIdea, addMessage, oContext) {
	if (status.isFinalIdeaStatus(oPersistedIdea.STATUS_CODE) || 'sap.ino.config.MERGED' === oPersistedIdea.STATUS_CODE) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NOT_CHANGEABLE, oPersistedIdea.ID, "Root", "STATUS_CODE");
		return;
	}
	var backofficePrivilege = $.session.hasSystemPrivilege("sap.ino.ui::backoffice.access");
	var editable = isContentEditable(oPersistedIdea);
	if (backofficePrivilege === false && editable === false) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NOT_CHANGEABLE, oPersistedIdea.ID, "Root", "STATUS_CODE");
		return;
	}

}

function copyEnabledCheck(vKey, oIdea, addMessage, oContext) {
	var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_auth_submittable_campaign", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_IDEA_SUBMIT);
	fnInstanceCheck([oIdea.CAMPAIGN_ID || 0], oIdea, addMessage, oContext)
	var bEnable = true;
	if (oIdea.AnonymousFor && oIdea.AnonymousFor.length > 0) {
		if (oIdea.AnonymousFor[0].ANONYMOUS_FOR === "PARTLY" || oIdea.AnonymousFor[0].ANONYMOUS_FOR === "ALL") {
			bEnable = false;
		}

	}
	if (bEnable === false) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NOT_REPRODUCIABLE, oIdea.ID, "Root", "AnonymousFor");
		return;
	}
}

function modifyExecutionCheck(vKey, oChangeRequest, oIdea, oPersistedIdea, addMessage, oContext) {
	var fnRespInstanceCheck, fnCampInstanceCheck, fnInstanceCheck;
	if (oContext.getAction().name === "update") {
		updateEnabledCheck(vKey, oPersistedIdea, addMessage, oContext);
	}
	if (oIdea.RESP_VALUE_CODE) {
		var oStatment = oContext.getHQ().statement(
			'select DEFAULT_TEXT from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where CODE = ? and IS_DEACTIVE = 1');
		var aResult = oStatment.execute(oIdea.RESP_VALUE_CODE);
		if (aResult.length > 0) {
			addMessage(Message.MessageSeverity.Warning, IdeaMessage.IDEA_SUBRESPONSIBILITY_LIST_DISABLED, oIdea.ID, "Root", "RESP_VALUE_CODE",
				aResult[0].DEFAULT_TEXT);
			return;
		}
	}

	

	if("DESCRIPTION" in oChangeRequest){
    	var containedIllegalTags = checkIllegalTags(oChangeRequest.DESCRIPTION)
    	if (containedIllegalTags) {
    		addMessage(Message.MessageSeverity.Error, IdeaMessage.DESCRIPTION_CONTAINED_ILLEGAL_TAGS, oChangeRequest.ID, "Root", "STATUS_CODE");
    		return;
    	} 
	}
	//anonymous check for campaign setting
	if (oIdea.AnonymousFor.length > 0 && oIdea.AnonymousFor[0].ANONYMOUS_FOR !== 'NONE') {
		const sqlText =
			`select campaign.id from  "sap.ino.db.idea::t_idea" as idea
                            inner join "sap.ino.db.campaign::t_campaign"  as campaign
                            on campaign.id = idea.campaign_id
                            where campaign.IS_OPEN_ANONYMOUS_FUNCTION = 0 and idea.id = ?`;
		var oAnonymousForStatment = oContext.getHQ().statement(sqlText);
		var aAnonymousForResult = oAnonymousForStatment.execute(oIdea.ID);
		if (aAnonymousForResult.length > 0) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_SUBMIT_ANONYMOUS_FAILED, oIdea.ID, "Root", "AnonymousFor");
			return;
		}

	}

	if (oChangeRequest.InternalAttachments || oChangeRequest.InternalWalls) {
		if (!oIdea.CAMPAIGN_ID || oIdea.STATUS_CODE === Status.Draft) {
			oIdea.InternalAttachments = [];
			oIdea.InternalWalls = [];
		} else {
			fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_responsibility_privilege", "RESP_VALUE_CODE",
				IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
			fnCampInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_campaign_privilege", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_BACKOFFICE_ATTACHMENT);
			fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);

			if (!fnInstanceCheck([oIdea.CAMPAIGN_ID, oIdea.RESP_VALUE_CODE], oChangeRequest, function() {}, oContext)) {
				// Reset internal nodes
				oIdea.InternalAttachments = (oPersistedIdea && oPersistedIdea.InternalAttachments) || [];
				oIdea.InternalWalls = (oPersistedIdea && oPersistedIdea.InternalWalls) || [];
			}
		}

		// Internal attachment can not be the title image
		_.each(oChangeRequest.InternalAttachments, function(oInternalAttachment) {
			if (oInternalAttachment.ROLE_TYPE_CODE && oInternalAttachment.ROLE_TYPE_CODE === "IDEA_TITLE_IMAGE") {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.INTERNAL_ATTACHMENT_TITLE_IMAGE_NOT_ALLOWED, oInternalAttachment.ID,
					"InternalAttachments", "ROLE_TYPE_CODE");
			}
		});
	}

	// Attachments may not be changed at all when the content is not editable
	if (oChangeRequest.Attachments && !isContentEditable(oPersistedIdea)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ATTRIBUTE_NOT_CHANGEABLE, vKey, "Attachments");
	}

	if (oChangeRequest.Coach && oChangeRequest.Coach.length > 0) {
		if (!oIdea.ID || oIdea.STATUS_CODE === Status.Draft) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.AUTH_MISSING_IDEA_COACH);
		} else {
			fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_coach_assign", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_COACH);
			fnInstanceCheck(oIdea.ID, oChangeRequest, addMessage, oContext);
		}
		if (oChangeRequest.Coach.length > 1) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_ONLY_ONE_COACH);
		}
	}

	if (oChangeRequest.Experts && oChangeRequest.Experts.length > 0) {
		if (!oIdea.CAMPAIGN_ID || !oIdea.STATUS_CODE || oIdea.STATUS_CODE === Status.Draft) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.AUTH_MISSING_IDEA_EXPERT);
		} else {
			fnCampInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_idea_expert_assign", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_IDEA_EXPERT);
			fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_idea_expert_assign", "RESP_VALUE_CODE", IdeaMessage.AUTH_MISSING_IDEA_EXPERT);
			fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);
			fnInstanceCheck([oIdea.CAMPAIGN_ID, oIdea.RESP_VALUE_CODE], oChangeRequest, addMessage, oContext);
		}
	}

	// Check if the idea can be reassigned to another campaign
	if (oIdea.STATUS_CODE && oIdea.STATUS_CODE != Status.Draft && oChangeRequest.CAMPAIGN_ID) {
		// get the campaign to which the idea has to be assigned
		var oCampaign = getCampaign(oChangeRequest);
		// check if the user can reassign an idea to new campaign
		fnInstanceCheck = auth.parentInstanceAccessCheck("sap.ino.db.campaign::v_auth_campaigns_reassign_idea", "CAMPAIGN_ID", "CAMPAIGN_ID",
			IdeaMessage.AUTH_MISSING_REASSIGN_IDEA);
		if (fnInstanceCheck(oChangeRequest.CAMPAIGN_ID, oIdea, function() {}, oContext)) {
			// report error if the new campaign is closed
			if (!date.isNowBetween(oCampaign.VALID_FROM, oCampaign.VALID_TO)) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.CAMPAIGN_VALIDITY, vKey, "Root", "CAMPAIGN_ID");
			}
		} else {
			// the user is submitter or contributor, report error if the submission period of the new campaign is closed
			if (!date.isNowBetween(oCampaign.SUBMIT_FROM, oCampaign.SUBMIT_TO)) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.CAMPAIGN_VALIDITY, vKey, "Root", "CAMPAIGN_ID");
			}
		}

		authCheckAdminOrReadCampaign(oChangeRequest.CAMPAIGN_ID, oCampaign, addMessage, oContext);
	}
	//Contribution Share Sum should be 100
	if (oChangeRequest.ContributionShare && oChangeRequest.ContributionShare.length > 0) {
		var iSum = 0;
		_.each(oIdea.ContributionShare, function(oContribution) {
			iSum += oContribution.PERCENTAGE;
		});

		if (iSum !== 100) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_INVALID_CONTRIBUTION_SHARE, vKey);
		}
	}
}

function isManager(oWorkObject, oContext) {
	var hq = oContext.getHQ();
	var sSelect = 'select IDENTITY_ID from "sap.ino.db.idea::v_auth_backoffice_campaign_privilege" where CAMPAIGN_ID = ?';
	var result = hq.statement(sSelect).execute(oWorkObject.CAMPAIGN_ID || 0);
	if (result.length >= 1) {
		return true;
	}
	sSelect = 'select IDENTITY_ID from "sap.ino.db.idea::v_auth_backoffice_responsibility_privilege" where RESP_VALUE_CODE = ?';
	result = hq.statement(sSelect).execute(oWorkObject.RESP_VALUE_CODE);
	if (result.length >= 1) {
		return true;
	}
	return false;
}

function hasReward(vKey, oContext) {
	var oStatment = oContext.getHQ().statement(
		'select * from "sap.ino.db.reward::t_reward_list" where IDEA_ID = ?');
	var aResult = oStatment.execute(vKey);
	if (aResult.length > 0) {
		return true;
	}
	return false;
}

function isMergeedWithVote(vKey, oPersistedObject, oContext) {
	if (oPersistedObject.STATUS_CODE == 'sap.ino.config.MERGED') {
		var oStatement = oContext.getHQ().statement('select * from "sap.ino.db.idea::t_vote" where source_idea_id = ?');
		var result = oStatement.execute(vKey);
		if (result.length > 0) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}

function isMerged(vKey, oPersistedObject, oContext) {
	if (oPersistedObject.STATUS_CODE === 'sap.ino.config.MERGED') {
		return true;
	} else {
		return false
	}
}

function delExecutionCheck(vKey, oChangeRequest, oWorkObject, oPersistedObject, addMessage, oContext) {
	var fnDelCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_delete", "IDEA_ID", IdeaMessage.AUTH_MISSING_IDEA_DELETE);
	fnDelCheck(vKey, oWorkObject, addMessage, oContext);

	// comment by new feature : deletion of idea evaluation request
	// 	if (!isManager(oWorkObject, oContext)) {
	// 		var hq = oContext.getHQ();
	// 		var sSelect = 'select IDEA_ID from "sap.ino.db.evaluation::t_evaluation_request" where IDEA_ID = ?';
	// 		var result = hq.statement(sSelect).execute(vKey);
	// 		if (result.length >= 1) {
	// 			addMessage(AOF.MessageSeverity.Fatal, IdeaMessage.IDEA_EXISTS_EVALUATION_REQUEST, vKey, AOF.Node.Root, null);
	// 		}
	// 	}
}

// Check if the user has an admin privilege for the new campaign or has a privilege to read this campaign
function authCheckAdminOrReadCampaign(vKey, oRequest, fnMessage, oContext) {
	var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_auth_campaigns_read", "CAMPAIGN_ID", IdeaMessage.AUTH_MISSING_CAMPAIGN_READ);
	var fnPrivilegeCheck = auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", IdeaMessage.AUTH_MISSING_CAMPAIGN_READ);
	var bSuccess = fnPrivilegeCheck(vKey, oRequest, function() {}, oContext);
	if (!bSuccess) {
		bSuccess = fnInstanceCheck(vKey, oRequest, fnMessage, oContext);
	}
	return bSuccess;
}

function contributorNotSubmitterCheck(vKey, oIdea, addMessage, oContext) {
	if (oIdea.Contributors && oIdea.Contributors.length > 0 && oIdea.Submitter && oIdea.Submitter.length > 0 && _.findWhere(oIdea.Contributors, {
		IDENTITY_ID: _.first(oIdea.Submitter).IDENTITY_ID
	})) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.CONTRIBUTOR_NOT_SUBMITTER, vKey);
	}
}

function expertNotSubmitterOrContributorCheck(vKey, oIdea, addMessage, oContext) {
	if (oIdea.Experts && oIdea.Experts.length > 0 && _.find(oIdea.Experts, function(oExpert) {
		return (oIdea.Submitter && oIdea.Submitter.length > 0 && oExpert.IDENTITY_ID === _.first(oIdea.Submitter).IDENTITY_ID) || (oIdea.Contributors &&
			oIdea.Contributors.length > 0 && _.findWhere(oIdea.Contributors, {
				IDENTITY_ID: oExpert.IDENTITY_ID
			}));
	})) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.EXPERT_NOT_SUBMITTER_OR_CONTRIBUTOR, vKey);
	}
}

function assignCoachEnabledCheck(vKey, oIdea, addMessage, oContext) {
	var oHQ = oContext.getHQ();

	if (status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_NO_COACH_AVAILABLE, vKey, "Root");
	}
	var aResponsibilityCoach;
	if (oIdea.RESP_VALUE_CODE) {
		aResponsibilityCoach = oHQ.statement(
			'select id \
                        from "sap.ino.db.subresponsibility::v_responsibility_value_coach_transitive" \
                        where resp_value_code = ?'
		).execute(oIdea.RESP_VALUE_CODE);
	}
	var aCampaignCoach = oHQ.statement(
		'select id \
                        from "sap.ino.db.campaign::v_campaign_coach_transitive" \
                        where campaign_id = ?'
	).execute(oIdea.CAMPAIGN_ID);
	if (aCampaignCoach.length < 1 && aResponsibilityCoach && aResponsibilityCoach.length < 1) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_NO_COACH_AVAILABLE, vKey, "Root");
	}
}

function assignCoach(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.IDENTITY_ID || !oIdea.CAMPAIGN_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		return;
	}

	var oHQ = oContext.getHQ();
	var aResponsibilityCoach;
	if (oIdea.RESP_VALUE_CODE) {
		aResponsibilityCoach = oHQ.statement(
			'select id \
                        from "sap.ino.db.subresponsibility::v_responsibility_value_coach_transitive" \
                        where resp_value_code = ? and id = ?'
		).execute(oIdea.RESP_VALUE_CODE, oParameters.IDENTITY_ID);
		/*	if (aResponsibilityCoach.length < 1) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		}*/
	}
	TraceWrapper.log_exception(oContext.getUser().Name);
	TraceWrapper.log_exception($.session.getUsername());

	var aCampaignCoach = oHQ.statement('select id from "sap.ino.db.campaign::v_campaign_coach_transitive" where campaign_id = ? and id = ?').execute(
		oIdea.CAMPAIGN_ID, oParameters.IDENTITY_ID);

	if (aCampaignCoach.length < 1 && aResponsibilityCoach && aResponsibilityCoach.length < 1) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		return;
	}
	oIdea.Coach = [{
		ID: getNextHandle(),
		IDENTITY_ID: oParameters.IDENTITY_ID
    }];
}

function autoAssignCoach(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oIdea.CAMPAIGN_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		return;
	}
	var oHQ = oContext.getHQ();
	var sManagerName = oHQ.statement(
			'select  top 1 USER_NAME from "sap.ino.db.campaign::v_campaign_manager" where campaign_id = ? and erased = 0 and type_code = ?'
		)
		.execute(oIdea.CAMPAIGN_ID, 'USER');
	var sManagerUserName;
	if (sManagerName.length < 1) { //Don't have the Manager when the type is 'USER', then go to get the group user
		var sGroupManagerName = oHQ.statement(
				'select  top 1 USER_NAME,IDENTITY_ID from "sap.ino.db.campaign::v_campaign_manager" where campaign_id = ? and erased = 0 and type_code = ?'
			)
			.execute(oIdea.CAMPAIGN_ID, 'GROUP');
		if (sGroupManagerName.length > 0) {
			var group_top1_member_name = oHQ.statement(
				' select TOP 1 user_name from "sap.ino.db.iam::v_group_member_transitive"  where group_id = ? and type_code = \'USER\'').execute(
				sGroupManagerName[0].IDENTITY_ID);
			if (group_top1_member_name.length > 0) {
				sManagerUserName = group_top1_member_name[0].USER_NAME;
			}
		}
	} else {

		sManagerUserName = sManagerName[0].USER_NAME;
	}
	if (!sManagerUserName) { //Use Admin to Log when the retrieved manager's name is null
		var aAdminUser = oHQ.statement(
			'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = created_by_id order by erased asc, created_at asc').execute();
		sManagerUserName = aAdminUser[0].USER_NAME;
	}
	authSetUser.setApplicationUser(sManagerUserName);
	if (oParameters.DEFAULT_COACH) {
		oIdea.Coach = [{
			ID: getNextHandle(),
			IDENTITY_ID: oParameters.DEFAULT_COACH
    }];
	}
}

function assignToMeEnabledCheck(vKey, oIdea, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aResponsibilityCoach = [];
	if (status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_NO_COACH_AVAILABLE, vKey, "Root", "IDENTITY_ID", oContext.getUser().ID);
	}
	if (oIdea.RESP_VALUE_CODE) {
		aResponsibilityCoach = oHQ.statement(
			'select id \
                        from "sap.ino.db.subresponsibility::v_responsibility_value_coach_transitive" \
                        where resp_value_code = ? and id = ?'
		).execute(oIdea.RESP_VALUE_CODE, oContext.getUser().ID);
	}
	var aCampaignCoach = oHQ.statement(
		'select id \
                    from "sap.ino.db.campaign::v_campaign_coach_transitive" \
                    where campaign_id = ? and id = ?'
	).execute(oIdea.CAMPAIGN_ID, oContext.getUser().ID);

	if (aCampaignCoach.length < 1 && aResponsibilityCoach && aResponsibilityCoach.length < 1) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_NO_COACH_AVAILABLE, vKey, "Root", "IDENTITY_ID", oContext.getUser().ID);
	}

	// No error message when user is already assign as coach
	/*
	 * else if (_.findWhere(oIdea.Coach, { IDENTITY_ID : oContext.getUser().ID })) {
	 * addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_ALREADY_SET, vKey, "Root", "IDENTITY_ID",
	 * oContext.getUser().ID); }
	 */
}

function assignToMe(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters) {
		oParameters = {};
	}
	oParameters.IDENTITY_ID = oContext.getUser().ID;
	assignCoach(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext);
}

function unassignCoach(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	oIdea.Coach = [];
}

function unassignCoachEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (!oIdea.Coach || (oIdea.Coach && oIdea.Coach.length === 0) || status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_NO_COACH_ASSIGNED, vKey, "Root");
	}
}

function addExpert(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.Experts) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ADD_EXPERT_INVALID_EXPERT, vKey, "Root", "IDENTITY_ID");
		return;
	}

	//Expert already added to this idea
	_.each(oParameters.Experts, function(oNewExpert) {
		var aMatches = _.filter(oIdea.Experts, function(oExpert) {
			return (oExpert.IDENTITY_ID === oNewExpert.IDENTITY_ID);
		});

		if (aMatches.length === 0) {
			oIdea.Experts.push({
				ID: getNextHandle(),
				IDENTITY_ID: oNewExpert.IDENTITY_ID
			});
		}
	});
}

function addExpertEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ADD_EXPERT_NO_EXPERT_AVAILABLE, vKey, "Root");
	}
}

function removeExpert(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.Experts) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ADD_EXPERT_INVALID_EXPERT, vKey, "Root", "IDENTITY_ID");
		return;
	}

	var aNewExperts = oIdea.Experts;
	_.each(oParameters.Experts, function(oNewExpert) {
		aNewExperts = _.filter(aNewExperts, function(oExpert) {
			return (oExpert.IDENTITY_ID !== oNewExpert.IDENTITY_ID);
		});
	});

	oIdea.Experts = aNewExperts;
}

function assignTag(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.Tags) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_TAG_INVALID_TAG, vKey, "Root", "TAG_ID");
		return;
	}
	_.each(oParameters.Tags, function(oNewTag) {
		if ((!oNewTag.NAME && !oNewTag.TAG_ID) ||
			(oNewTag.NAME && oNewTag.NAME.replace(/(^\s*)|(\s*$)/g, "").length === 0 && oNewTag.TAG_ID)) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_TAG_INVALID_TAG, vKey, "Root", "TAG_ID");
			return;
		}

		if (!oNewTag.TAG_ID && oNewTag.NAME) {
			// Tags are created "on the fly"
			// so for new tags (not only tag assignment)
			// a new handle is used
			oNewTag.TAG_ID = getNextHandle();
		}

		//Tag already added to this idea
		var aMatches = _.filter(oIdea.Tags, function(oTag) {
			return (oTag.TAG_ID === oNewTag.TAG_ID);
		});

		if (aMatches.length === 0) {
			oIdea.Tags.push({
				TAG_ID: oNewTag.TAG_ID,
				NAME: oNewTag.NAME,
				ID: getNextHandle()
			});
		}
	});

}

function assignTagEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_TAG_NO_TAG_AVAILABLE, vKey, "Root");
	}
}

function removeExpertEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (!oIdea.Experts || (oIdea.Experts && oIdea.Experts.length === 0)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ADD_EXPERT_NO_EXPERT_ASSIGNED, vKey, "Root");
	}
}

function reassignCampaignEnabledCheck(vKey, oIdea, addMessage, oContext) {
	// 	if (status.isFinalIdeaStatus(oIdea.STATUS_CODE)) {
	// 		addMessage(Message.MessageSeverity.Error, IdeaMessage.REASSIGN_CAMPAIGN_NOT_AVAILABLE, vKey, "Root");
	// 	}
	///Need to query the integration Object is existed, if yes, then can't do the reassign action
	var sIntegrationQuery = 'select * from "sap.ino.db.integration::t_idea_object_integration" where idea_id = ? ';
	var oHQ = oContext.getHQ();
	var aIntegrationObject = oHQ.statement(sIntegrationQuery).execute(vKey);
	if (aIntegrationObject && aIntegrationObject.length > 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.REASSIGN_CAMPAIGN_NOT_AVAILABLE_INTEGRATION_OBJECT, vKey, "Root");
	}

}

function reassignCampaignAuthorizationCheck(vKey, oIdea, addMessage, oContext) {
	var sCondition = "ID = " + oIdea.CAMPAIGN_ID;
	var fnAuthReassignCampaign = auth.conditionCheck("sap.ino.db.idea::v_idea_campaign_reassign", "IDEA_ID", sCondition, IdeaMessage
		.AUTH_CAMP_MUST_NOT_BE_NULL, "Root", "CAMPAIGN_ID");

	var bCheckResult = fnAuthReassignCampaign(vKey, oIdea, function() {}, oContext);
	return bCheckResult;
}

function reassignCampaign(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	oIdea.CAMPAIGN_ID = oParameters.CAMPAIGN_ID;

	if (oParameters.FieldsValue && oParameters.FieldsValue.length > 0) {
		var aFieldValue = [];
		_.each(oParameters.FieldsValue, function(oObject) {
			oObject.ID = getNextHandle();
			aFieldValue.push(oObject);
		});
		oIdea.FieldsValue = aFieldValue;
	}
	if (oParameters.AdminFieldsValue && oParameters.AdminFieldsValue.length > 0) {
		var aAdminFieldValue = [];
		_.each(oParameters.AdminFieldsValue, function(oObject) {
			oObject.ID = getNextHandle();
			aAdminFieldValue.push(oObject);
		});
		oIdea.AdminFieldsValue = aAdminFieldValue;
	}
	oIdea.RESP_VALUE_CODE = oParameters.RESP_VALUE_CODE;
}

function submitEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (!oIdea.CAMPAIGN_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_CAMPAIGN_MANDATORY, vKey, "Root", "CAMPAIGN_ID");
	}

	if (oIdea.STATUS_CODE !== Status.Draft) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NO_FURTHER_SUBMIT, vKey, "Root", "STATUS_CODE");
	}

	var oCampaign = getCampaign(oIdea);
	if (!date.isNowBetween(oCampaign.SUBMIT_FROM, oCampaign.SUBMIT_TO)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.CAMPAIGN_VALIDITY, vKey, "Root", "CAMPAIGN_ID");
	}
}

function submit(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	//oIdea.STATUS_CODE = Status.NewInPhase;
	oIdea.PHASE_CODE = getFirstCampaignPhase(oIdea).PHASE_CODE;
	oIdea.STATUS_CODE = status.getInitialStatus(oIdea.CAMPAIGN_ID, getFirstCampaignPhase(oIdea).PHASE_CODE);
	oIdea.SUBMITTED_AT = oContext.getRequestTimestamp();
	//Update Tracking for Submitter or Coauther
	//(identity_id,action_type,object_id,object_type,acted_at)
	var oHQ = oContext.getHQ();
	var sInsertTrackLogStatement = `INSERT INTO "sap.ino.db.tracker::t_action_log" values(?,?,?,?,current_utctimestamp)`;
	var sTest = `select * from"sap.ino.db.idea::t_idea" where id = ?`;
	var oTestRes = oHQ.statement(sTest).execute(oIdea.ID);
	var aAuthor = oIdea.Submitter;
	if (oIdea.Contributors.length > 0) {
		aAuthor = aAuthor.concat(oIdea.Contributors);
	}
	var Follow = AOF.getApplicationObject("sap.ino.xs.object.follow.Follow");
	var sSelFollowObject =
		'select CREATED_BY_ID AS IDENTITY_ID FROM "sap.ino.db.follow::t_follow" where object_type_code = \'IDEA\' AND OBJECT_ID = ? AND CREATED_BY_ID = ? ';
	var oResponse;
	try {
		for (var i = 0; i < aAuthor.length; i++) {
			oHQ.statement(sInsertTrackLogStatement).execute(aAuthor[i].IDENTITY_ID, trackingLog.TrackingActionType.submitIdea, vKey, "IDEA");
			var aResultAuthorFollowed = oHQ.statement(sSelFollowObject).execute(vKey, aAuthor[i].IDENTITY_ID);
			if (aResultAuthorFollowed.length === 0) {
				oResponse = Follow.create({
					OBJECT_TYPE_CODE: 'IDEA',
					OBJECT_ID: vKey,
					CREATED_BY_ID: aAuthor[i].IDENTITY_ID
				});
				addMessage(oResponse.messages);
			}
		}
	} catch (e) {
		TraceWrapper.log_exception(e);
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_SUBMIT_TRACKING_LOG_FAILED, undefined, "", "");
	}
	return {
		SELF_EVALUATION_ACTIVE: !!getFirstCampaignPhase(oIdea).SELF_EVALUATION_ACTIVE
	};
}

function autoVote(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	var bHasPrivilege = oHQ.statement('select id from"sap.ino.db.idea::v_auth_idea_vote" \
                                where id = ?').execute(
		oIdea.CAMPAIGN_ID);
	if (bHasPrivilege.length > 0) {
		var Vote = AOF.getApplicationObject("sap.ino.xs.object.idea.Vote");
		var iHandle = getNextHandle();
		var iScore;
		if (oParameters.VOTE_TYPE_TYPE_CODE === "STAR") {
			iScore = oParameters.MAX_STAR_NO;
		} else {
			iScore = 1;
		}
		var oResponse = Vote.create({
			ID: iHandle,
			IDEA_ID: vKey,
			SCORE: iScore
		});

		addMessage(oResponse.messages);
	}
}

function statusTransitionProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                        from "sap.ino.db.idea::v_idea_possible_status_transition" \
                        where idea_id = ?  order by SEQUENCE_NO ASC'
	).execute(vKey);
	return {
		statusTransitions: aStatusTransition
	};
}

function delCustomProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	return {
		isManager: isManager(oPersistedObject, oContext),
		hasReward: hasReward(vKey, oContext),
		isMergeedWithVote: isMergeedWithVote(vKey, oPersistedObject, oContext),
		isMerged: isMerged(vKey, oPersistedObject, oContext)
	};
}

function executeStatusTransitionEnabledCheck(vKey, oIdea, addMessage, oContext) {
	var oStatusProperties = statusTransitionProperties(vKey, null, oIdea, addMessage, oContext);
	var aStatusTransition = oStatusProperties.statusTransitions;
	if (aStatusTransition.length === 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NO_MORE_STATUS_TRANSITION, vKey);
	}
}

function executeStatusTransition(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.STATUS_ACTION_CODE) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_INVALID_STATUS_TRANSITION, vKey);
	}

	var sStatusActionCode = oParameters.STATUS_ACTION_CODE;

	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                        from "sap.ino.db.idea::v_idea_possible_status_transition" \
                        where idea_id = ? and status_action_code = ?'
	).execute(vKey, sStatusActionCode);
	if (_.size(aStatusTransition) !== 1) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_INVALID_ACTION_CODE_TRANSITION, vKey);
		return;
	}

	var oStatusTransition = _.first(aStatusTransition);

	//bulk Expire Evaluation Request Items 
	if ((oStatusTransition.NEXT_PHASE_CODE && (oIdea.PHASE_CODE !== oStatusTransition.NEXT_PHASE_CODE)) || oStatusTransition.NEXT_STATUS_CODE ===
		'sap.ino.config.DISCONTINUED' || oStatusTransition.NEXT_STATUS_CODE === 'sap.ino.config.COMPLETED') {
		var EvalReqItem = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
		EvalReqItem.bulkExpireItems({
			IDEA_ID: oIdea.ID,
			IDEA_PHASE_CODE: oIdea.PHASE_CODE
		});

		//The indicator of reward dismiss will be returned if the phase changed
		oIdea.REWARD_DISMISSED = 0;
	}

	oIdea.STATUS_CODE = oStatusTransition.NEXT_STATUS_CODE;
	oIdea.PHASE_CODE = oStatusTransition.NEXT_PHASE_CODE;

	oContext.setHistoryEvent("STATUS_ACTION_" + oStatusTransition.STATUS_ACTION_CODE);

	if (_.toBool(oStatusTransition.DECISION_RELEVANT)) {
		if (!oParameters.DECIDER_ID || !oParameters.DECISION_DATE || (oParameters.DECISION_REASON_LIST_CODE && !oParameters.REASON_CODE) ||
			(oParameters.DECISION_REASON_LIST_CODE && oParameters.REASON_CODE === '') ||
			(!oParameters.DECISION_REASON_LIST_CODE && !oParameters.REASON) ||
			(!oParameters.DECISION_REASON_LIST_CODE && oParameters.REASON === '')) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_STATUS_TRANSITION_DECISION_MISSING, vKey, "Root");
			return;
		}
		if (oParameters.SEND_RESPONSE && !oParameters.TEXT_MODULE_CODE && (!oParameters.RESPONSE || oParameters.RESPONSE === '')) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_STATUS_TRANSITION_RESPONSE_MISSING, vKey, "Root");
			return;
		}
	}

	if (_.toBool(oStatusTransition.DECISION_RELEVANT) || _.toBool(oParameters.SEND_RESPONSE)) {
		oIdea.Decisions.push({
			ID: getNextHandle(),
			CREATED_AT: oContext.getRequestTimestamp(),
			CREATED_BY_ID: oContext.getUser().ID,
			DECIDER_ID: oParameters.DECIDER_ID,
			DECISION_DATE: oParameters.DECISION_DATE || oContext.getRequestTimestamp(),
			REASON: oParameters.REASON,
			STATUS_ACTION_CODE: sStatusActionCode,
			PHASE_CODE: oIdea.PHASE_CODE,
			STATUS_CODE: oIdea.STATUS_CODE,
			SEND_RESPONSE: oParameters.SEND_RESPONSE,
			RESPONSE: oParameters.RESPONSE,
			TEXT_MODULE_CODE: oParameters.TEXT_MODULE_CODE,
			REASON_CODE: oParameters.REASON_CODE,
			DECISION_REASON_LIST_CODE: oParameters.DECISION_REASON_LIST_CODE,
			DECISION_REASON_LIST_VISIBLE: oParameters.DECISION_REASON_LIST_VISIBLE,
			LINK_LABEL: oParameters.LINK_LABEL,
			LINK_URL: oParameters.LINK_URL
		});
	}
}

function _bulkReplacePhaseCode(oBulkAccess, addMessage, iUserId, dTime, iCampaignId, sCurrentPhaseCode, sNewPhaseCode, bResetStatusCode,
	bSimulate) {

	// validity (business) of codes is checked by the caller,
	// validity via foreign key property is checked during db update
	var oRootUpdate = {
		CHANGED_BY_ID: iUserId,
		CHANGED_AT: dTime,
		PHASE_CODE: sNewPhaseCode
	};

	if (bResetStatusCode) {
		//oRootUpdate.STATUS_CODE = Status.NewInPhase;
		oRootUpdate.STATUS_CODE = status.getInitialStatus(iCampaignId, sNewPhaseCode);
	}

	var oResponse = oBulkAccess.update({
		Root: oRootUpdate
	}, {
		condition: "CAMPAIGN_ID = ? and PHASE_CODE = ?",
		conditionParameters: [iCampaignId, sCurrentPhaseCode]
	}, bSimulate || false);

	addMessage(oResponse.messages);

	return oResponse.affectedNodes.Root.count;
}

function bulkReplacePhaseCode(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.CAMPAIGN_ID && oParameters.CURRENT_PHASE_CODE && oParameters.NEW_PHASE_CODE) {
		return _bulkReplacePhaseCode(oBulkAccess, addMessage, oContext.getUser().ID, oContext.getRequestTimestamp(), oParameters.CAMPAIGN_ID,
			oParameters.CURRENT_PHASE_CODE, oParameters.NEW_PHASE_CODE, oParameters.RESET_STATUS_CODE);
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_PHASE_CODE_PARAMETER_REQUIRED, undefined, "Root",
			"CAMPAIGN_ID, CURRENT_PHASE_CODE, NEW_PHASE_CODE");
		return null;
	}
}

function bulkReplacePhaseCodeProperties(oParameters, oBulkAccess, addMessage, oContext) {
	// no special handling for drafts needed as PHASE_CODE is null
	// no update of PHASE_CODE or STATUS_CODE required and they are already filtered out by their PHASE_CODE

	if (oParameters && oParameters.CAMPAIGN_ID && oParameters.CURRENT_PHASE_CODE) {
		return _bulkReplacePhaseCode(oBulkAccess, addMessage, oContext.getUser().ID, oContext.getRequestTimestamp(), oParameters.CAMPAIGN_ID,
			oParameters.CURRENT_PHASE_CODE, undefined, undefined, true);
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_PHASE_CODE_PARAMETER_REQUIRED, undefined, "Root",
			"CAMPAIGN_ID, CURRENT_PHASE_CODE");
		return null;
	}
}

function _bulkAdaptStatusCode(oBulkAccess, addMessage, iUserId, dTime, iCampaignId, sCurrentPhaseCode, sNewStatusModelCode, bSimulate) {
	// validity of codes is checked by the caller, due to codes are not written but only read
	// no inconsistency can be created here
	var oResponse = oBulkAccess.update({
		Root: {
			CHANGED_BY_ID: iUserId,
			CHANGED_AT: dTime,
			//STATUS_CODE: Status.NewInPhase
			STATUS_CODE: status.getInitialStatusByModel(sNewStatusModelCode)
		}
	}, {
		condition: "CAMPAIGN_ID = ? and PHASE_CODE = ? and STATUS_CODE not in " +
			"(select distinct(CURRENT_STATUS_CODE) as STATUS_CODE from \"sap.ino.db.status::t_status_model_transition\" where STATUS_MODEL_CODE = ? " +
			"union distinct " +
			"select distinct(NEXT_STATUS_CODE) as STATUS_CODE from \"sap.ino.db.status::t_status_model_transition\" where STATUS_MODEL_CODE = ?)" +
			" AND STATUS_CODE<>'sap.ino.config.MERGED' AND STATUS_CODE <> 'sap.ino.config.DRAFT'",
		conditionParameters: [iCampaignId, sCurrentPhaseCode, sNewStatusModelCode, sNewStatusModelCode]
	}, bSimulate || false);

	addMessage(oResponse.messages);

	return oResponse.affectedNodes.Root.count;
}

function bulkAdaptStatusCode(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.CAMPAIGN_ID && oParameters.CURRENT_PHASE_CODE && oParameters.NEW_STATUS_MODEL_CODE) {
		return _bulkAdaptStatusCode(oBulkAccess, addMessage, oContext.getUser().ID, oContext.getRequestTimestamp(), oParameters.CAMPAIGN_ID,
			oParameters.CURRENT_PHASE_CODE, oParameters.NEW_STATUS_MODEL_CODE);
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_PHASE_CODE_PARAMETER_REQUIRED, undefined, "Root",
			"CAMPAIGN_ID, CURRENT_PHASE_CODE, NEW_STATUS_MODEL_CODE");
		return null;
	}
}

function bulkAdaptStatusCodeProperties(oParameters, oBulkAccess, addMessage, oContext) {
	// no special handling for drafts needed
	// no update of STATUS_CODE required and they are already filtered out by their STATUS_CODE

	if (oParameters && oParameters.CAMPAIGN_ID && oParameters.CURRENT_PHASE_CODE) {
		var hq = oContext.getHQ();
		var sSelect = 'select CODE from "sap.ino.db.status::t_status_model" where object_type_code = ?';
		var result = hq.statement(sSelect).execute('IDEA');

		var oResult = {};
		_.each(result, function(oObject) {
			var iCount = _bulkAdaptStatusCode(oBulkAccess, addMessage, oContext.getUser().ID, oContext.getRequestTimestamp(), oParameters.CAMPAIGN_ID,
				oParameters.CURRENT_PHASE_CODE, oObject.CODE, true);
			oResult[oObject.CODE] = iCount;
		});

		return oResult;
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_STATUS_MODEL_CODE_PARAMETER_REQUIRED, undefined, "Root",
			"CAMPAIGN_ID, CURRENT_PHASE_CODE, NEW_STATUS_MODEL_CODE");
		return null;
	}
}

function bulkDeleteVotes(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.CAMPAIGN_ID) {
		var oResponse = oBulkAccess.update({
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: "CAMPAIGN_ID = ? and ID in (select IDEA_ID from \"sap.ino.db.idea::t_vote\")",
			conditionParameters: [oParameters.CAMPAIGN_ID]
		});

		var Vote = AOF.getApplicationObject("sap.ino.xs.object.idea.Vote");
		oResponse = Vote.bulkDeleteVotes({
			CAMPAIGN_ID: oParameters.CAMPAIGN_ID
		});

		addMessage(oResponse.messages);

	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_VOTE_DELETE_PARAMETER_REQUIRED, undefined, "Root", "CAMPAIGN_ID");
	}
}

function bulkDeleteVotesProperties(oParameters, oBulkAccess, addMessage, oContext) {
	if (oParameters && oParameters.CAMPAIGN_ID) {
		var Vote = AOF.getApplicationObject("sap.ino.xs.object.idea.Vote");
		var oCount = Vote.staticProperties({
			actions: [{
				name: "bulkDeleteVotes",
				parameters: {
					CAMPAIGN_ID: oParameters.CAMPAIGN_ID
				}
            }]
		});

		// this update is always simulated to gain the affected idea count
		var oIdeaCount = oBulkAccess.update({
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: "CAMPAIGN_ID = ? and ID in (select IDEA_ID from \"sap.ino.db.idea::t_vote\")",
			conditionParameters: [oParameters.CAMPAIGN_ID]
		}, true);

		return {
			"AFFECTED_VOTES": oCount.actions.bulkDeleteVotes.customProperties,
			"AFFECTED_IDEAS": oIdeaCount.affectedNodes.Root.count
		};
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_VOTE_DELETE_PARAMETER_REQUIRED, undefined, "Root", "CAMPAIGN_ID");
		return null;
	}
}

function mergeIdeasCheckAuthorization(oIdea, addMessage, oContext) {
	var fnCampInstanceCheck = auth.parentInstanceAccessCheck("sap.ino.db.campaign::v_auth_campaigns_idea_merge", "CAMPAIGN_ID", "CAMPAIGN_ID",
		IdeaMessage.AUTH_MISSING_IDEA_MERGE);
	var fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.subresponsibility::v_auth_responsibility_idea_merge", "RESP_VALUE_CODE",
		IdeaMessage.AUTH_MISSING_IDEA_MERGE);
	var fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);

	var oMessageBuffer = Message.createMessageBuffer(true);
	var bAuth = fnInstanceCheck([oIdea.CAMPAIGN_ID, oIdea.RESP_VALUE_CODE], oIdea, oMessageBuffer.addMessage, oContext);
	var aMessage = oMessageBuffer.getMessages();
	if (aMessage.length > 0) {
		// add idea data into message - the current message is based on campaign
		aMessage[0].parameters = [oIdea.NAME, aMessage[0].refKey];
		aMessage[0].refKey = oIdea.ID;
		aMessage[0].refAttribute = "ID";
	}
	addMessage(aMessage);
	return bAuth;
}

function mergeIdeasEnabledCheck(vKey, oIdea, addMessage, oContext) {
	if (!checkMergeIdeaEnabled(vKey, oIdea, addMessage, oContext)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_MERGE_NOT_ALLOWED_FOR_IDEA, vKey, "Root", "ID", oIdea.NAME);
	}
}

function checkMergeIdeaEnabled(vKey, oIdea, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect = 'select top 1 * from "sap.ino.db.reward::v_reward" where idea_id = ? and download_count > 0';
	var aResult = oHQ.statement(sSelect).execute(vKey);

	if (aResult.length > 0) {
		return false;
	}

	return oIdea && oIdea.STATUS_CODE && oIdea.STATUS_CODE != Status.Draft && !status.isMergedStatus(oIdea.STATUS_CODE);
}

function checkMergeParameters(vKey, oParameters, addMessage, oContext) {
	var aCheckResult = [];

	if (!_.isArray(oParameters)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_MERGE_PARAMETER_REQUIRED, undefined, "Root");
		return [];
	}
	var aMergingIdeaKey = _.uniq(_.without(oParameters, vKey));
	if (aMergingIdeaKey.length === 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_MERGE_PARAMETER_REQUIRED, undefined, "Root");
		return [];
	}

	var AOFIdea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");

	_.each(aMergingIdeaKey, function(vMergingIdeyKey) {
		var oProperties = AOFIdea.properties(vMergingIdeyKey, {
			actions: [{
				name: "mergeIdeas",
				parameters: []
            }]
		});
		if (oProperties.actions) {
			// Error messages from properties turned into info messages
			_.each(oProperties.actions.mergeIdeas.messages, function(oMessage) {
				oMessage.severity = Message.MessageSeverity.Info;
			});
			addMessage(oProperties.actions.mergeIdeas.messages);

			aCheckResult.push({
				id: vMergingIdeyKey,
				idea: AOFIdea.read(vMergingIdeyKey),
				outcome: oProperties.actions.mergeIdeas.enabled ? "IDEA_MERGE_OUTCOME_MERGED" : "IDEA_MERGE_NOT_MERGABLE",
				canBeLeading: oProperties.actions.mergeIdeas.enabled
			});
		} else {
			addMessage({
				severity: Message.MessageSeverity.Error,
				messageKey: "MSG_OBJECT_NOT_FOUND",
				refKey: vMergingIdeyKey
			});
		}
	});

	return aCheckResult;
}

function mergeIdeasProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	var oResult = {
		outcome: []
	};

	var oMessageBuffer = null;
	if (vKey) {
		oMessageBuffer = Message.createMessageBuffer(true);
		oResult.outcome.push({
			ID: vKey,
			OUTCOME: "IDEA_MERGE_OUTCOME_CONTINUE",
			CAN_BE_LEADING: mergeIdeasCheckAuthorization(oPersistedObject, oMessageBuffer.addMessage, oContext) && checkMergeIdeaEnabled(vKey,
				oPersistedObject, oMessageBuffer.addMessage, oContext)
		});
		_.each(oMessageBuffer.getMessages(), function(oMessage) {
			oMessage.severity = Message.MessageSeverity.Error;
			addMessage(oMessage);
		});
	}

	var bExecute = false;
	var bDetails = false;

	if (_.isArray(oParameters) && oParameters.length > 0) {
		bExecute = true;
		bDetails = true;
	} else if (oParameters && typeof oParameters.details == "boolean" && _.isArray(oParameters.keys) && oParameters.keys.length > 0) {
		bExecute = true;
		bDetails = oParameters.details;
	}

	if (bExecute) {
		if (bDetails) {
			var aCheckResult = checkMergeParameters(vKey, oParameters.details ? oParameters.keys : oParameters, addMessage, oContext);
			_.each(aCheckResult, function(oCheckResult) {
				oResult.outcome.push({
					ID: oCheckResult.id,
					OUTCOME: oCheckResult.outcome,
					CAN_BE_LEADING: oCheckResult.canBeLeading
				});
			});
		} else {
			oResult.outcome = _.map(oParameters.keys, function(key) {
				return {
					id: key
				};
			});
		}
	}

	return oResult;
}

function mergeIdeas(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var aSourceIdeas = oParameters.SOURCE_IDEAS;
	var aMergeRule = oParameters.MERGE_RULE;
	var aCheckResult = checkMergeParameters(vKey, aSourceIdeas, addMessage, oContext);
	if (aCheckResult.length > 0) {
		_mergeIdeas(vKey, aCheckResult, oIdea, addMessage, getNextHandle, oContext, aMergeRule);
	}
}

function _mergeIdeas(vKey, aCheckResult, oIdea, addMessage, getNextHandle, oContext, aMergeRule) {
	var AOFIdea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
	var Wall = AOF.getApplicationObject("sap.ino.xs.object.wall.Wall");
	var RewardList = AOF.getApplicationObject("sap.ino.xs.object.reward.RewardList");

	var oHQ = oContext.getHQ();
	var sSystemSettingForMerge =
		`select value from "sap.ino.db.basis::v_local_system_setting"
                            where code = 'sap.ino.config.ENABLE_IDEA_MERGE_RULE'`;
	var aSystemSettingForMerge = oHQ.statement(sSystemSettingForMerge).execute();
	var bSystemSettingForMerge = aSystemSettingForMerge.length === 1 ? aSystemSettingForMerge[0].VALUE : 0;
	var sRoleAuthorizationOfStatus, aRoleAuthorizationOfStatus, bIdeaVotePhase, sLeadingIdeaVoteMethod, bLeadingIdeaAllowVote;
	if (bSystemSettingForMerge) {
		//IDEA STATUS AUTHORIZATION 
		sRoleAuthorizationOfStatus =
			`SELECT * FROM(
                select distinct idea_id as id ,campaign_underStatus.IDENTITY_ID,campaign_underStatus.ACTION_CODE from"sap.ino.db.campaign::v_campaign_identity_role_underStatus" as campaign_underStatus
                where campaign_underStatus.SETTING_CODE = 'OPEN_STATUS_AUTHORIZATION' and campaign_underStatus.VALUE = 1
                and (campaign_underStatus.action_code = 'IDEA_VOTE' or campaign_underStatus.action_code = 'IDEA_COMMENT') and campaign_underStatus.can_do_action = 1
                UNION ALL 
              select distinct idea_id as id ,idea_underStatus.IDENTITY_ID,idea_underStatus.ACTION_CODE from"sap.ino.db.idea::v_idea_identity_role_underStatus" as idea_underStatus
                where idea_underStatus.SETTING_CODE = 'OPEN_STATUS_AUTHORIZATION' and idea_underStatus.VALUE = 1
                and (idea_underStatus.action_code = 'IDEA_VOTE' or idea_underStatus.action_code = 'IDEA_COMMENT') and idea_underStatus.can_do_action = 1)
                WHERE ID = ?`;

		aRoleAuthorizationOfStatus = oHQ.statement(sRoleAuthorizationOfStatus).execute(oIdea.ID);

		bIdeaVotePhase = getIdeaPhaseVoteEnable(oHQ, oIdea);

		var sSelectIdeaVoteMethod =
			` select campaign_vote.TYPE_CODE from"sap.ino.db.idea::t_idea" as idea
                                            left outer join "sap.ino.db.campaign::t_campaign" as campaign
                                            on campaign.id = idea.campaign_id
                                            left outer join "sap.ino.db.campaign::t_vote_type" as campaign_vote
                                            on campaign_vote.code = campaign.vote_type_code
                                        where idea.id = ?`;
		var sLeadingIdeaVoteMethodResult = oHQ.statement(sSelectIdeaVoteMethod).execute(oIdea.ID);
		sLeadingIdeaVoteMethod = sLeadingIdeaVoteMethodResult.length === 1 ? sLeadingIdeaVoteMethodResult[0].TYPE_CODE : null;
		bLeadingIdeaAllowVote = bIdeaVotePhase && aCheckResult.length === 1;
	}

	_.each(aCheckResult, function(oCheckResult) {
		var oMergingIdea = oCheckResult.idea;
		if (!oMergingIdea) {
			return;
		}
		if (bSystemSettingForMerge) {
			mergeObjectForNewRule(oMergingIdea, oIdea, AOFIdea, Attachment, Wall, RewardList, getNextHandle, oContext, addMessage,
				bLeadingIdeaAllowVote, aRoleAuthorizationOfStatus, sLeadingIdeaVoteMethod, aMergeRule);
		}
		mergeObjectForOldRule(oMergingIdea, oIdea, AOFIdea, Attachment, Wall, RewardList, getNextHandle, oContext, addMessage);

	});
	updateCommentCount(oIdea, oHQ);
	// Update Contribution Share
	var iContributors = oIdea.Contributors.length + 1;
	var iShare = parseInt((100 / iContributors).toFixed(0), 10);
	if (iContributors > 1) {
		_.each(oIdea.ContributionShare, function(oContributionShare, iIndex) {
			var iPercentage = iIndex !== (iContributors - 1) ? iShare : (100 - iShare * (iContributors - 1));
			oContributionShare.PERCENTAGE = iPercentage;
		});
	}

	//delete rewards of the leading idea
	RewardList.bulkDeleteIdeaRewards({
		IDEA_ID: oIdea.ID
	});

	return oIdea;
}

//new merge functionality for new rule 
function mergeObjectForNewRule(oMergingIdea, oIdea, AOFIdea, Attachment, Wall, RewardList, getNextHandle, oContext, addMessage,
	bLeadingIdeaAllowVote, aRoleAuthorizationOfStatus, sLeadingIdeaVoteMethod, aMergeRule) {

	// Add author of merging idea as co-author
	var bMergeAuthor = _.find(aMergeRule, function(element) {
		return element.OBJECT_TYPE_CODE === 'AUTHOR' && element.ADD;
	});
	if (bMergeAuthor) {
		if ((oIdea.AnonymousFor.length === 0 || oIdea.AnonymousFor[0].ANONYMOUS_FOR === "NONE") && (oMergingIdea.AnonymousFor.length === 0 ||
			oMergingIdea.AnonymousFor[0].ANONYMOUS_FOR === "NONE")) {

			if (oMergingIdea.Submitter.length > 0 && oIdea.Submitter.length > 0 && oMergingIdea.Submitter[0].IDENTITY_ID !== oIdea.Submitter[0].IDENTITY_ID &&
				!_.find(oIdea.Contributors, function(oContributor) {
					return oContributor.IDENTITY_ID === oMergingIdea.Submitter[0].IDENTITY_ID;
				})) {
				oIdea.Contributors.push({
					IDENTITY_ID: oMergingIdea.Submitter[0].IDENTITY_ID
				});
			}
			if (oMergingIdea.Contributors.length > 0) {
				_.each(oMergingIdea.Contributors, function(sourceCoauthor) {
					if (!_.find(oIdea.Contributors, function(oContributor) {
						return oContributor.IDENTITY_ID === sourceCoauthor.IDENTITY_ID;
					})) {
						oIdea.Contributors.push({
							IDENTITY_ID: sourceCoauthor.IDENTITY_ID
						});
					}
				});
			}
		}
	}
	// Add expert of merging idea as expert
	var bMergeExpert = _.find(aMergeRule, function(element) {
		return element.OBJECT_TYPE_CODE === 'EXPERT' && element.ADD;
	});
	if (bMergeExpert) {
		_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Experts", "IDENTITY_ID", ["IDENTITY_ID"]);
	}
	//add vote for authorization
	try {
		var oHQ = oContext.getHQ();
		var oConn = oHQ.getConnection();
		var bMergeVote = _.find(aMergeRule, function(element) {
			return element.OBJECT_TYPE_CODE === 'VOTE' && element.ADD;
		});
		if (bMergeVote) {
			mergeIdeaVote(oHQ, oMergingIdea, oIdea, bLeadingIdeaAllowVote, aRoleAuthorizationOfStatus, sLeadingIdeaVoteMethod);
		}
		var bMergeComment = _.find(aMergeRule, function(element) {
			return element.OBJECT_TYPE_CODE === 'COMMENT' && element.ADD;
		});
		if (bMergeComment) {
			mergeIdeaComment(oHQ, oMergingIdea, oIdea, aRoleAuthorizationOfStatus);
		}
		oConn.commit();
	} catch (e) {
		throw e;
	}

	function mergeIdeaComment(oHQ, oMergingIdea, oIdea, aRoleAuthorizationOfStatus) {
		const sSelectIdeaComment =
			`
    	                        select ID AS COMMENT_ID,CREATED_AT,CREATED_BY_ID,CHANGED_AT,CHANGED_BY_ID,COMMENT AS COMMENT,PARENT_ID from"sap.ino.db.comment::t_comment"
                                where object_id = ? and object_type_code = 'IDEA' and type_code = 'COMMUNITY_COMMENT'
    	                            `;
		var IdeaMergeCommentAO = AOF.getApplicationObject("sap.ino.xs.object.comment.CommentForIdeaMerge");
		var aSourceIdeaCommentResult = oHQ.statement(sSelectIdeaComment).execute(oMergingIdea.ID);
		var bIdeaStatusAuthorization = getIdeaStatusAuthorizationEnable(oHQ, oIdea);
		var aCampaginParticipantscantComment = _.pluck(getCampaginParticipantsCommentAuthorization(oHQ, oMergingIdea, oIdea), 'IDENTITY_ID');
		var aRoleAuthorizationOfStatusCanComment = _.map(aRoleAuthorizationOfStatus, function(element) {
			if (element.ACTION_CODE === 'IDEA_COMMENT' && element.ID === oIdea.ID) {
				return element.IDENTITY_ID;
			}
		});
		var commentMerResult;
		var aNewOldCommentMapping = [];
		aSourceIdeaCommentResult.forEach(function(element) {
			if (!bIdeaStatusAuthorization && !~aCampaginParticipantscantComment.indexOf(element.CREATED_BY_ID)) {
				if (element.PARENT_ID) {
					const sSelectNewComment =
						`
    	                        select ID AS COMMENT_ID from"sap.ino.db.comment::t_comment"
                                where object_id = ? and object_type_code = 'IDEA' and type_code = 'COMMUNITY_COMMENT' and source_id = ?
    	                            `;
					var aNewParentCommentId = oHQ.statement(sSelectNewComment).execute(oIdea.ID, element.PARENT_ID);
					element.PARENT_ID = aNewParentCommentId.length > 0 ? aNewParentCommentId[0].COMMENT_ID : '';
				}
				commentMerResult = IdeaMergeCommentAO.create({
					ID: -1,
					CREATED_AT: element.CREATED_AT,
					CREATED_BY_ID: element.CREATED_BY_ID,
					CHANGED_AT: element.CHANGED_AT,
					CHANGED_BY_ID: element.CHANGED_BY_ID,
					COMMENT: element.COMMENT,
					OBJECT_ID: oIdea.ID,
					PARENT_ID: element.PARENT_ID,
					SOURCE_ID: element.COMMENT_ID,
					Owner: [{
						ID: -2,
						IDENTITY_ID: element.CREATED_BY_ID,
						OBJECT_TYPE_CODE: 'COMMENT'
                                }]

				});

			} else if (bIdeaStatusAuthorization && ~aRoleAuthorizationOfStatusCanComment.indexOf(element.CREATED_BY_ID) && !~
				aCampaginParticipantscantComment.indexOf(element.CREATED_BY_ID)) {
				if (element.PARENT_ID) {
					const sSelectNewComment =
						`
    	                        select ID AS COMMENT_ID from"sap.ino.db.comment::t_comment"
                                where object_id = ? and object_type_code = 'IDEA' and type_code = 'COMMUNITY_COMMENT' and source_id = ?
    	                            `;
					var aNewParentCommentId = oHQ.statement(sSelectNewComment).execute(oIdea.ID, element.PARENT_ID);
					element.PARENT_ID = aNewParentCommentId.length > 0 ? aNewParentCommentId[0].COMMENT_ID : '';
				}
				commentMerResult = IdeaMergeCommentAO.create({
					ID: -1,
					CREATED_AT: element.CREATED_AT,
					CREATED_BY_ID: element.CREATED_BY_ID,
					CHANGED_AT: element.CHANGED_AT,
					CHANGED_BY_ID: element.CHANGED_BY_ID,
					COMMENT: element.COMMENT,
					OBJECT_ID: oIdea.ID,
					PARENT_ID: element.PARENT_ID,
					SOURCE_ID: element.COMMENT_ID,
					Owner: [{
						ID: -2,
						IDENTITY_ID: element.CREATED_BY_ID,
						OBJECT_TYPE_CODE: 'COMMENT'
                                }]

				});
			}
		});
	}

	function mergeIdeaVote(oHQ, oMergingIdea, oIdea, bLeadingIdeaAllowVote, aRoleAuthorizationOfStatus, sLeadingIdeaVoteMethod) {
		if (!bLeadingIdeaAllowVote) {
			return;
		}
		var sSelectSourceIdeaVoteMethod =
			`select campaign_vote.TYPE_CODE from"sap.ino.db.idea::t_idea" as idea
                                            left outer join "sap.ino.db.campaign::t_campaign" as campaign
                                            on campaign.id = idea.campaign_id
                                            left outer join "sap.ino.db.campaign::t_vote_type" as campaign_vote
                                            on campaign_vote.code = campaign.vote_type_code
                                        where idea.id = ?`;
		var sSourceIdeaVoteMethodResult = oHQ.statement(sSelectSourceIdeaVoteMethod).execute(oMergingIdea.ID);
		var sSourceIdeaVoteMethod = sSourceIdeaVoteMethodResult.length === 1 ? sSourceIdeaVoteMethodResult[0].TYPE_CODE : undefined;
		if (sLeadingIdeaVoteMethod !== sSourceIdeaVoteMethod) {
			return;
		}
		var IdeaVoteAO = AOF.getApplicationObject("sap.ino.xs.object.idea.VoteForIdeaMerge");
		var aRoleAuthorizationOfStatusCanVote = _.map(aRoleAuthorizationOfStatus, function(element) {
			if (element.ACTION_CODE === 'IDEA_VOTE' && element.ID === oIdea.ID) {
				return element.IDENTITY_ID;
			}
		});

		const sSelectIdeaVote =
			`
    	                        select idea_vote.IDEA_ID,
                                       idea_vote.USER_ID,
                                       idea_vote.SCORE,
                                       idea_vote.VOTE_REASON,
                                       idea_vote.VOTE_COMMENT,
                                       idea.CAMPAIGN_ID,
                                       campaign_vote.CODE,
                                       campaign_vote.TYPE_CODE
                                from"sap.ino.db.idea::t_vote" as idea_vote
                                inner join "sap.ino.db.idea::t_idea" as idea
                                on idea_vote.idea_id = idea.id
                                inner join "sap.ino.db.campaign::t_campaign" as campaign
                                on idea.campaign_id = campaign.id
                                inner join "sap.ino.db.campaign::t_vote_type" as campaign_vote
                                on campaign_vote.code = campaign.vote_type_code
                                where idea_vote.idea_id = ?
    	                            `;
		var aIdeaVoteResult = oHQ.statement(sSelectIdeaVote).execute(oMergingIdea.ID);

		var bIdeaStatusAuthorization = getIdeaStatusAuthorizationEnable(oHQ, oIdea);
		var aCampaginParticipantscantVote = _.pluck(getCampaginParticipantsVoteAuthorization(oHQ, oMergingIdea, oIdea), 'IDENTITY_ID');

		var ideaMergeVoteResult;
		aIdeaVoteResult.forEach(function(element) {
			var sSelectLeadingIdeaVote, aLeadingIdeaVoteResult;
			if (!bIdeaStatusAuthorization && !~aCampaginParticipantscantVote.indexOf(element.USER_ID)) {
				sSelectLeadingIdeaVote =
					`select 
    	                               distinct
    	                               idea_vote.IDEA_ID,
                                       idea_vote.USER_ID,
                                       idea_vote.SCORE,
                                       idea_vote.VOTE_REASON,
                                       idea_vote.VOTE_COMMENT,
                                       idea.CAMPAIGN_ID,
                                       campaign_vote.CODE,
                                       campaign_vote.TYPE_CODE
                                from"sap.ino.db.idea::t_vote" as idea_vote
                                inner join "sap.ino.db.idea::t_idea" as idea
                                on idea_vote.idea_id = idea.id
                                inner join "sap.ino.db.campaign::t_campaign" as campaign
                                on idea.campaign_id = campaign.id
                                inner join "sap.ino.db.campaign::t_vote_type" as campaign_vote
                                on campaign_vote.code = campaign.vote_type_code
                                where idea_vote.idea_id = ? and idea_vote.user_id = ?`;
				aLeadingIdeaVoteResult = oHQ.statement(sSelectLeadingIdeaVote).execute(oIdea.ID, element.USER_ID);
				if (aLeadingIdeaVoteResult.length === 0) {
					ideaMergeVoteResult = IdeaVoteAO.create({
						ID: -1,
						USER_ID: element.USER_ID,
						IDEA_ID: oIdea.ID,
						SOURCE_IDEA_ID: oMergingIdea.ID,
						SCORE: element.SCORE,
						VOTE_COMMENT: element.VOTE_COMMENT,
						VOTE_REASON: element.VOTE_REASON
					});
				}
			} else if (bIdeaStatusAuthorization && ~aRoleAuthorizationOfStatusCanVote.indexOf(element.USER_ID) && !~aCampaginParticipantscantVote.indexOf(
				element.USER_ID)) {
				sSelectLeadingIdeaVote =
					`select 
    	                               distinct
    	                               idea_vote.IDEA_ID,
                                       idea_vote.USER_ID,
                                       idea_vote.SCORE,
                                       idea_vote.VOTE_REASON,
                                       idea_vote.VOTE_COMMENT,
                                       idea.CAMPAIGN_ID,
                                       campaign_vote.CODE,
                                       campaign_vote.TYPE_CODE
                                from"sap.ino.db.idea::t_vote" as idea_vote
                                inner join "sap.ino.db.idea::t_idea" as idea
                                on idea_vote.idea_id = idea.id
                                inner join "sap.ino.db.campaign::t_campaign" as campaign
                                on idea.campaign_id = campaign.id
                                inner join "sap.ino.db.campaign::t_vote_type" as campaign_vote
                                on campaign_vote.code = campaign.vote_type_code
                                where idea_vote.idea_id = ? and idea_vote.user_id = ?`;
				aLeadingIdeaVoteResult = oHQ.statement(sSelectLeadingIdeaVote).execute(oIdea.ID, element.USER_ID);
				if (aLeadingIdeaVoteResult.length === 0) {
					ideaMergeVoteResult = IdeaVoteAO.create({
						ID: -1,
						USER_ID: element.USER_ID,
						IDEA_ID: oIdea.ID,
						SOURCE_IDEA_ID: oMergingIdea.ID,
						SCORE: element.SCORE,
						VOTE_COMMENT: element.VOTE_COMMENT,
						VOTE_REASON: element.VOTE_REASON
					});
				}
			} else {
				return;
			}
		});
	}
}

function updateCommentCount(oIdea, oHQ) {
	const sSlectCommentCount =
		` select count(id) as count from "sap.ino.db.idea::v_idea_comment"
                    where parent_id is null and object_id = ?`;
	var commentCount = oHQ.statement(sSlectCommentCount).execute(oIdea.ID);
	oIdea.COMMENT_COUNT = parseInt(commentCount[0].COUNT.toString());
}

function getCampaginParticipantsCommentAuthorization(oHQ, oMergingIdea, oIdea) {
	var sCampaignParticipantsAuthorization =
		`select    distinct 
                                                              limitation.identity_id
                                                       from"sap.ino.db.iam::v_object_identity_limitation_action" as limitation
                                                       inner join (select CREATED_BY_ID from "sap.ino.db.comment::t_comment" 
                                                    where  object_id = ? )as vote_user
                                                       on vote_user.CREATED_BY_ID = limitation.identity_id
                                                       where limitation.object_id = ? and limitation.DISABLED = 1 and limitation.ACTION_CODE = 'IDEA_COMMENT'`;
	var aCampaginParticipantsCommentAuthorization = oHQ.statement(sCampaignParticipantsAuthorization).execute(oMergingIdea.ID, oIdea.CAMPAIGN_ID);
	return aCampaginParticipantsCommentAuthorization;
}

function getIdeaPhaseVoteEnable(oHQ, oIdea) {
	var sIdeaPhaseVote =
		`select idea.id,phase.voting_active from"sap.ino.db.idea::t_idea" as  idea
                                    left outer join "sap.ino.db.campaign::t_campaign_phase" as phase
                                    on idea.campaign_id = phase.campaign_id and 
                                           idea.phase_code = phase.phase_code 
                                    where idea.id = ? `;
	var aIdeaPhaseVoteResult = oHQ.statement(sIdeaPhaseVote).execute(oIdea.ID);
	var bIdeaPhaseVote = aIdeaPhaseVoteResult.length === 1 ? aIdeaPhaseVoteResult[0].VOTING_ACTIVE : 0;
	return bIdeaPhaseVote;
}

function getIdeaStatusAuthorizationEnable(oHQ, oIdea) {
	var sIdeaStatusAuthorization =
		` select idea.id,status_setting.code,status_setting.value from"sap.ino.db.idea::t_idea" as idea
                                            left outer join "sap.ino.db.status::v_status_authorization_setting" as status_setting 
                                            on status_setting.code = idea.status_code 
                                            where status_setting.value = 1 and idea.id = ? 
    	                                    `;
	var aIdeaStatusAuthorizationResult = oHQ.statement(sIdeaStatusAuthorization).execute(oIdea.ID);
	var bIdeaStatusAuthorization = aIdeaStatusAuthorizationResult.length === 1 ? aIdeaStatusAuthorizationResult[0].VALUE : 0;
	return bIdeaStatusAuthorization;
}

function getCampaginParticipantsVoteAuthorization(oHQ, oMergingIdea, oIdea) {
	var sCampaignParticipantsVoteAuthorization =
		`select    distinct 
                                                              limitation.identity_id
                                                       from "sap.ino.db.iam::v_object_identity_limitation_action" as limitation
                                                       inner join (select user_id from "sap.ino.db.idea::t_vote" 
                                                    where  idea_id = ? )as vote_user
                                                       on vote_user.user_id = limitation.identity_id
                                                       where limitation.object_id = ? and limitation.DISABLED = 1 and limitation.ACTION_CODE = 'IDEA_VOTE'`;
	var aCampaginParticipantsVoteAuthorization = oHQ.statement(sCampaignParticipantsVoteAuthorization).execute(oMergingIdea.ID, oIdea.CAMPAIGN_ID);
	return aCampaginParticipantsVoteAuthorization;
}

function mergeObjectForOldRule(oMergingIdea, oIdea, AOFIdea, Attachment, Wall, RewardList, getNextHandle, oContext, addMessage) {

	//Check the program's robustness when the submitter is initial
	// 	var oSubmitterID = oIdea.Submitter.length > 0 ? oIdea.Submitter[0].IDENTITY_ID : undefined;
	// 	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Contributors", "IDENTITY_ID", ["IDENTITY_ID"], oSubmitterID);

	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Links", undefined, ["URL", "LABEL"]);
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Tags", "TAG_ID", ["TAG_ID"]);
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Attachments", undefined, ["ATTACHMENT_ID"], undefined, function(oAttachment) {
		var iHandle = getNextHandle();
		var oCopyResponse = Attachment.copy(oAttachment.ATTACHMENT_ID, {
			ID: iHandle
		});
		addMessage(oCopyResponse.messages);
		oAttachment.ATTACHMENT_ID = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
		oAttachment.ROLE_TYPE_CODE = AttachmentAssignment.RoleCode.Attachment;
		return oAttachment;
	});
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "InternalAttachments", undefined, ["ATTACHMENT_ID"], undefined, function(oAttachment) {
		var iHandle = getNextHandle();
		var oCopyResponse = Attachment.copy(oAttachment.ATTACHMENT_ID, {
			ID: iHandle
		});
		addMessage(oCopyResponse.messages);
		oAttachment.ATTACHMENT_ID = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
		oAttachment.ROLE_TYPE_CODE = AttachmentAssignment.RoleCode.Attachment;
		return oAttachment;
	});
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "Walls", undefined, ["WALL_ID"], undefined, function(oWall) {
		var iHandle = getNextHandle();
		var oCopyResponse = Wall.copy(oWall.WALL_ID, {
			ID: iHandle
		});
		addMessage(oCopyResponse.messages);
		oWall.WALL_ID = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
		return oWall;
	});
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "InternalWalls", undefined, ["WALL_ID"], undefined, function(oWall) {
		var iHandle = getNextHandle();
		var oCopyResponse = Wall.copy(oWall.WALL_ID, {
			ID: iHandle
		});
		addMessage(oCopyResponse.messages);
		oWall.WALL_ID = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
		return oWall;
	});

	// Merge Description
	var iHandle = getNextHandle();
	var oCreateResponse = Attachment.create({
		ID: iHandle,
		DATA: _.stripTags(oMergingIdea.DESCRIPTION) || ' ',
		FILE_NAME: _.stripFilename(oMergingIdea.NAME) + ".txt"
	});
	addMessage(oCreateResponse.messages);
	var iAttachmentId = oCreateResponse.generatedKeys && oCreateResponse.generatedKeys[iHandle];
	oIdea.InternalAttachments.push({
		ATTACHMENT_ID: iAttachmentId,
		ROLE_TYPE_CODE: AttachmentAssignment.RoleCode.Attachment
	});

	// Add Relation
	oIdea.Relations.push({
		TARGET_OBJECT_TYPE_CODE: Link.ObjectType.Idea,
		TARGET_OBJECT_ID: oMergingIdea.ID,
		SEMANTIC: Link.Semantic.Merged
	});

	AOFIdea.setStatusMerged(oMergingIdea.ID);

	// Merge Contribution Share
	_.mergeNodeIfNotExists(oIdea, oMergingIdea, "ContributionShare", "AUTHOR_ID", ["AUTHOR_ID", "PERCENTAGE"], undefined);

	//delete related reward list and rewards
	RewardList.bulkDeleteIdeaRewards({
		IDEA_ID: oMergingIdea.ID
	});
}

function setStatusMerged(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	oIdea.STATUS_CODE = Status.Merged;
}

function createIdeaFromIdeasProperties(oParameters, oBulkAccess, addMessage, oContext) {
	return mergeIdeasProperties(undefined, oParameters, undefined, addMessage, oContext);
}

function createIdeaFromIdeas(oParameters, oBulkAccess, addMessage, getNextHandle, oContext, oMetadata) {
	var AOFIdea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");

	var aCheckResult = checkMergeParameters(undefined, oParameters, addMessage, oContext);
	if (aCheckResult.length === 0) {
		return {};
	}

	var sName = TextBundle.getText("uitexts", "IDEA_MERGE_DEFAULT_NAME", [], "", false, oContext.getHQ());
	var sDescription = TextBundle.getText("uitexts", "IDEA_MERGE_DEFAULT_DESCRIPTION", [], "", false, oContext.getHQ());
	if (aCheckResult.length == 1) {
		sName = TextBundle.getText("uitexts", "IDEA_MERGE_NAME_COPY_PREFIX", [], "", false, oContext.getHQ()) + " " + aCheckResult[0].idea.NAME;
		sDescription = aCheckResult[0].idea.DESCRIPTION;
	}

	sName = sName.substr(0, oMetadata.getNodeMetadata("Root").attributes.NAME.maxLength);

	var oResponse = AOFIdea.create({
		ID: -1,
		NAME: sName,
		DESCRIPTION: sDescription,
		CAMPAIGN_ID: 0
	});
	addMessage(oResponse.messages);
	var vKey = oResponse.generatedKeys && oResponse.generatedKeys[-1];

	var oIdea = {
		ID: vKey,
		Submitter: [{
			IDENTITY_ID: oContext.getUser().ID
        }],
		Contributors: [],
		Experts: [],
		Attachments: [],
		InternalAttachments: [],
		Links: [],
		Tags: [],
		Relations: [],
		Walls: [],
		InternalWalls: []
	};

	_mergeIdeas(vKey, aCheckResult, oIdea, addMessage, getNextHandle, oContext);

	var aRelation = oIdea.Relations;

	delete oIdea.Submitter;
	delete oIdea.Experts;
	delete oIdea.InternalAttachments;
	delete oIdea.Relations;
	delete oIdea.InternalWalls;

	AOFIdea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	oResponse = AOFIdea.update(oIdea);
	addMessage(oResponse.messages);
	oResponse = AOFIdea.addRelation(oIdea.ID, aRelation);
	addMessage(oResponse.messages);

	return {
		ID: vKey
	};
}

function copy(vKey, oIdea, oOriginalIdea, addMessage, getNextHandle, oContext, oNodeMetadata) {
	var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");

	if (oIdea.NAME === oOriginalIdea.NAME) {
		oIdea.NAME = TextBundle.getText("uitexts", "IDEA_MERGE_NAME_COPY_PREFIX", [], "", false, oContext.getHQ()) + " " + oIdea.NAME;
	}

	oIdea.NAME = oIdea.NAME.substr(0, oNodeMetadata.objectMetadata.getNodeMetadata("Root").attributes.NAME.maxLength);

	oIdea.Contributors = _.reject(oIdea.Contributors, function(oContributor) {
		return oContributor.IDENTITY_ID === oIdea.Submitter[0].IDENTITY_ID;
	});
	if (oOriginalIdea.Submitter[0].IDENTITY_ID !== oIdea.Submitter[0].IDENTITY_ID) {
		oIdea.Contributors.push({
			IDENTITY_ID: oOriginalIdea.Submitter[0].IDENTITY_ID
		});
	}
	oIdea.Coach = [];
	oIdea.Experts = [];
	oIdea.InternalAttachments = [];
	oIdea.Decisions = [];
	oIdea.Relations = [];
	oIdea.InternalWalls = [];
	oIdea.AdminFieldsValue = [];

	var sAttachmentPath = AttachmentAssignment.getAttachmentDownloadUrl(oContext.getHQ());

	var aAttachment = [];
	_.each(oIdea.Attachments, function(oAttachment) {
		var iHandle = getNextHandle();
		var oCopyResponse = Attachment.copy(oAttachment.ATTACHMENT_ID, {
			ID: iHandle
		});
		addMessage(oCopyResponse.messages);
		var iAttachmentCopyId = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
		aAttachment.push({
			ATTACHMENT_ID: iAttachmentCopyId,
			ROLE_TYPE_CODE: oAttachment.ROLE_TYPE_CODE
		});

		oIdea.DESCRIPTION = AttachmentAssignment.replaceAttachmentReference(oIdea.DESCRIPTION, sAttachmentPath, oAttachment.ATTACHMENT_ID,
			iAttachmentCopyId);
	});
	oIdea.Attachments = aAttachment;

	oIdea.Relations.push({
		TARGET_OBJECT_TYPE_CODE: Link.ObjectType.Idea,
		TARGET_OBJECT_ID: oOriginalIdea.ID,
		SEMANTIC: Link.Semantic.Copied
	});

	if (oIdea.FieldsValue.length > 0) {
		var IdeaForm = AOF.getApplicationObject("sap.ino.xs.object.ideaform.IdeaForm");
		var oNewIdeaForm = {};
		var aNewIdeaForm = [];
		var frmCode = getCurrentFormCode(oIdea, oContext);
		if (frmCode) {
			var ideaFrm = IdeaForm.read(frmCode);
			if (ideaFrm) {
				var aFormFields = ideaFrm.Fields;
				_.each(oIdea.FieldsValue, function(oFieldValue) {
					var oField = aFormFields.filter(function(oFormField) {
						return oFormField.CODE === oFieldValue.FIELD_CODE && oFormField.IS_ACTIVE === 1;
					})[0];
					oNewIdeaForm = {};
					if (oField) {
						oNewIdeaForm.ID = getNextHandle();
						oNewIdeaForm.FIELD_CODE = oFieldValue.FIELD_CODE;
						oNewIdeaForm.SEQUENCE_NO = oField.SEQUENCE_NO;
						oNewIdeaForm.BOOL_VALUE = oFieldValue.BOOL_VALUE;
						oNewIdeaForm.DATE_VALUE = oFieldValue.DATE_VALUE;
						oNewIdeaForm.NUM_VALUE = oFieldValue.NUM_VALUE;
						oNewIdeaForm.RICH_TEXT_VALUE = oFieldValue.RICH_TEXT_VALUE;
						oNewIdeaForm.TEXT_VALUE = oFieldValue.TEXT_VALUE;
						aNewIdeaForm.push(oNewIdeaForm);
					}
				});

				oIdea.FieldsValue = _.sortBy(aNewIdeaForm, "SEQUENCE_NO");
			}
		}
	}
}

function addRelation(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	if (!Array.isArray(oParameter)) {
		oParameter = [oParameter];
	}
	_.each(oParameter, function(oRelation) {
		oIdea.Relations.push(oRelation);
	});
}

function removeRelation(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	if (!Array.isArray(oParameter)) {
		oParameter = [oParameter];
	}
	_.each(oParameter, function(oRelation) {
		oIdea.Relations = _.reject(oIdea.Relations, function(oExistingRelation) {
			return oRelation.TARGET_OBJECT_TYPE_CODE === oExistingRelation.TARGET_OBJECT_TYPE_CODE && oRelation.TARGET_OBJECT_ID ===
				oExistingRelation.TARGET_OBJECT_ID && oRelation.SEMANTIC === oExistingRelation.SEMANTIC;
		});
	});
}

function checkMarkDuplicateParameters(vKey, oParameters, addMessage, oContext) {
	if (!_.isArray(oParameters)) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DUPLICATE_PARAMETER_REQUIRED, undefined, "Root");
		return [];
	}
	var aIdeaKey = _.uniq(_.without(oParameters, vKey));
	if (aIdeaKey.length === 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DUPLICATE_PARAMETER_REQUIRED, undefined, "Root");
		return [];
	}
	return aIdeaKey;
}

function markAsDuplicateProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	var aIdeaKey = checkMarkDuplicateParameters(vKey, oParameters, addMessage, oContext);
	_.each(aIdeaKey, function(vIdeaKey) {
		if (_.find(oPersistedObject.Relations, function(oRelation) {
			return oRelation.TARGET_OBJECT_TYPE_CODE == Link.ObjectType.Idea && oRelation.TARGET_OBJECT_ID == vIdeaKey && oRelation.SEMANTIC ==
				Link.Semantic.Duplicate;
		})) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DUPLICATE_ALREADY_MARKED_AS_DUPLICATE, vKey, "Root", undefined, vIdeaKey);
		}
	});
	return {};
}

function markAsDuplicate(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var aIdeaKey = checkMarkDuplicateParameters(vKey, oParameters, addMessage, oContext);
	if (aIdeaKey.length > 0) {
		_.each(aIdeaKey, function(vIdeaKey) {
			if (!_.find(oIdea.Relations, function(oRelation) {
				return oRelation.TARGET_OBJECT_TYPE_CODE == Link.ObjectType.Idea && oRelation.TARGET_OBJECT_ID == vIdeaKey && oRelation.SEMANTIC ==
					Link.Semantic.Duplicate;
			})) {
				oIdea.Relations.push({
					TARGET_OBJECT_TYPE_CODE: Link.ObjectType.Idea,
					TARGET_OBJECT_ID: vIdeaKey,
					SEMANTIC: Link.Semantic.Duplicate
				});
			}
		});
	}
}

function unmarkAsDuplicateProperties(vKey, oParameters, oPersistedObject, addMessage, oContext) {
	var aIdeaKey = checkMarkDuplicateParameters(vKey, oParameters, addMessage, oContext);
	_.each(aIdeaKey, function(vIdeaKey) {
		if (!_.find(oPersistedObject.Relations, function(oRelation) {
			return oRelation.TARGET_OBJECT_TYPE_CODE == Link.ObjectType.Idea && oRelation.TARGET_OBJECT_ID == vIdeaKey && oRelation.SEMANTIC ==
				Link.Semantic.Duplicate;
		})) {
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DUPLICATE_NOT_MARKED_AS_DUPLICATE, vKey, "Root", undefined, vIdeaKey);
		}
	});
	return {};
}

function unmarkAsDuplicate(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var aIdeaKey = checkMarkDuplicateParameters(vKey, oParameters, addMessage, oContext);
	if (aIdeaKey.length > 0) {
		_.each(aIdeaKey, function(vIdeaKey) {
			oIdea.Relations = _.reject(oIdea.Relations, function(oRelation) {
				return oRelation.TARGET_OBJECT_TYPE_CODE === Link.ObjectType.Idea && oRelation.TARGET_OBJECT_ID === vIdeaKey && oRelation.SEMANTIC ===
					Link.Semantic.Duplicate;
			});
		});
	}
}

function deleteRelationsOfRelatedIdeasAfterDelete(vKey, oIdea, oPersistedObject, fnMessage, fnNextHandle, oContext, oMetadata) {
	if (oContext.getAction().name == Action.Del) {
		var AOFIdea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
		var oResponse = AOFIdea.bulkDeleteRelations({
			IDEA_ID: oIdea.ID
		});
		fnMessage(oResponse.messages);
	}
}

function bulkDeleteRelations(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_DELETE_RELATIONS_PARAMETER_REQUIRED, undefined, "Root");
		return;
	}
	var oResponse = oBulkAccess.del({
		Relations: {
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}
	}, {
		condition: "TYPE_CODE = '" + Link.Type.OBJECT + "' and TARGET_OBJECT_TYPE_CODE = '" + Link.ObjectType.Idea +
			"' and TARGET_OBJECT_ID = ?",
		conditionParameters: [oParameters.IDEA_ID]
	});
	addMessage(oResponse.messages);
}

function copyOrDeleteAssignedWalls(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	_copyOrDeleteAssignedWalls(oWorkObject.Walls, oPersistedObject ? oPersistedObject.Walls : [], addMessage);
	_copyOrDeleteAssignedWalls(oWorkObject.InternalWalls, oPersistedObject ? oPersistedObject.InternalWalls : [], addMessage);
}

function _copyOrDeleteAssignedWalls(aWall, aPersistedWall, addMessage) {
	var aWorkWallId = _.pluck(aWall, "WALL_ID");
	var aPersistedWallId = _.pluck(aPersistedWall, "WALL_ID");
	var aNewWallId = _.difference(aWorkWallId, aPersistedWallId);
	var Wall = AOF.getApplicationObject("sap.ino.xs.object.wall.Wall");
	if (aNewWallId.length > 0) {
		var mCopyWall = {};
		_.each(aNewWallId, function(iWallId) {
			var oResponse = Wall.copy(iWallId, {
				ID: -1
			});
			addMessage(oResponse.messages);
			mCopyWall[iWallId] = oResponse.generatedKeys && oResponse.generatedKeys[-1];
		});
		_.each(aWall, function(oWallAssignment) {
			if (mCopyWall[oWallAssignment.WALL_ID]) {
				oWallAssignment.WALL_ID = mCopyWall[oWallAssignment.WALL_ID];
			}
		});
	}
	var aDelWallId = _.difference(aPersistedWallId, aWorkWallId);
	if (aDelWallId.length > 0) {
		_.each(aDelWallId, function(iWallId) {
			var oResponse = Wall.del(iWallId);
			addMessage(oResponse.messages);
		});
	}
}

function deleteAssignedWallsAfterDelete(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	if (oContext.getAction().name == Action.Del) {
		var aWallId = _.union(_.pluck(oWorkObject.Walls, "WALL_ID"), _.pluck(oWorkObject.InternalWalls, "WALL_ID"));
		if (aWallId.length > 0) {
			var Wall = AOF.getApplicationObject("sap.ino.xs.object.wall.Wall");
			_.each(aWallId, function(iWallId) {
				var oResponse = Wall.del(iWallId);
				addMessage(oResponse.messages);
			});
		}
	}
}

function checkFieldValue(oFieldValue, oField, addMessage) {
	var DataTypeAttr = {};
	DataTypeAttr[DataType.Boolean] = "BOOL_VALUE";
	DataTypeAttr[DataType.Numeric] = "NUM_VALUE";
	DataTypeAttr[DataType.Integer] = "NUM_VALUE";
	DataTypeAttr[DataType.Text] = "TEXT_VALUE";
	DataTypeAttr[DataType.RichText] = "RICH_TEXT_VALUE";
	DataTypeAttr[DataType.Date] = "DATE_VALUE";

	function inRange(vNumValue, vMin, vMax, vStepSize) {
		return vNumValue ? ((vMin <= vNumValue || vMin === null || vMin === undefined) && (vNumValue <= vMax || vMax === null || vMax ===
			undefined) || vMin == vMax) : true;
	}

	var bValid = false;
	switch (oField.DATATYPE_CODE) {
		case DataType.Boolean:
			bValid = !oFieldValue.NUM_VALUE && !oFieldValue.TEXT_VALUE && !oFieldValue.RICH_TEXT_VALUE && !oFieldValue.DATE_VALUE && (!oFieldValue.BOOL_VALUE ||
				(_.toBool(oFieldValue.BOOL_VALUE) !== undefined));
			break;
		case DataType.Numeric:
			bValid = !oFieldValue.BOOL_VALUE && !oFieldValue.TEXT_VALUE && !oFieldValue.RICH_TEXT_VALUE && !oFieldValue.DATE_VALUE && (!oFieldValue.NUM_VALUE ||
				(_.isFinite(oFieldValue.NUM_VALUE) && inRange(oFieldValue.NUM_VALUE, oField.NUM_VALUE_MIN, oField.NUM_VALUE_MAX, oField.NUM_VALUE_STEP_SIZE))
			);
			break;
		case DataType.Integer:
			bValid = !oFieldValue.BOOL_VALUE && !oFieldValue.TEXT_VALUE && !oFieldValue.RICH_TEXT_VALUE && !oFieldValue.DATE_VALUE && (!oFieldValue.NUM_VALUE ||
				(_.isInteger(oFieldValue.NUM_VALUE) && inRange(oFieldValue.NUM_VALUE, oField.NUM_VALUE_MIN, oField.NUM_VALUE_MAX, oField.NUM_VALUE_STEP_SIZE))
			);
			break;
		case DataType.Text:
			bValid = !oFieldValue.NUM_VALUE && !oFieldValue.BOOL_VALUE && !oFieldValue.RICH_TEXT_VALUE && !oFieldValue.DATE_VALUE && (!oFieldValue.TEXT_VALUE ||
				_.isString(oFieldValue.TEXT_VALUE));
			break;
		case DataType.RichText:
			bValid = !oFieldValue.NUM_VALUE && !oFieldValue.BOOL_VALUE && !oFieldValue.TEXT_VALUE && !oFieldValue.DATE_VALUE && (!oFieldValue.RICH_TEXT_VALUE ||
				_.isString(oFieldValue.RICH_TEXT_VALUE));
			break;
		case DataType.Date:
			bValid = !oFieldValue.NUM_VALUE && !oFieldValue.BOOL_VALUE && !oFieldValue.TEXT_VALUE && !oFieldValue.RICH_TEXT_VALUE && (!oFieldValue.DATE_VALUE ||
				_.isDate(oFieldValue.DATE_VALUE));
			break;
		default:
			bValid = true;
			break;
	}

	if (bValid && oField.VALUE_OPTION_LIST_CODE && oFieldValue[DataTypeAttr[oField.DATATYPE_CODE]]) {
		var ValueOptionList = AOF.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
		var oValueOptionList = ValueOptionList.read(oField.VALUE_OPTION_LIST_CODE);
		var oWhere = {};
		oWhere[DataTypeAttr[oField.DATATYPE_CODE]] = oFieldValue[DataTypeAttr[oField.DATATYPE_CODE]];
		bValid = !!_.findWhere(oValueOptionList.ValueOptions, oWhere);
	}

	if (!bValid) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.FIELD_VALUE_INVALID_DATA, oFieldValue.ID);
	}
}

function determineFieldValues(vKey, oIdea, oPersistedIdea, addMessage, getNextHandle, oContext) {
	if (oIdea.ID > 0 && oIdea.FieldsValue.length > 0) {
		var IdeaForm = AOF.getApplicationObject("sap.ino.xs.object.ideaform.IdeaForm");
		var frmCode = getCurrentFormCode(oIdea, oContext);
		if (frmCode) {
			var oIdeaForm = IdeaForm.read(frmCode);
			_.each(oIdea.FieldsValue, function(oValue, iIndex) {
				var aFormFields = _.where(oIdeaForm.Fields || [], {
					CODE: oValue.FIELD_CODE
				});

				checkFieldValue(oValue, aFormFields[0], _.wrap(addMessage, function(fnAddMessage) {
					fnAddMessage.apply(undefined, (_.rest(_.toArray(arguments))));
				}));
			});
		}
	}
}

function determineAdminFieldValues(vKey, oIdea, oPersistedIdea, addMessage, getNextHandle, oContext) {
	if (oIdea.ID > 0 && oIdea.AdminFieldsValue.length > 0) {
		var IdeaForm = AOF.getApplicationObject("sap.ino.xs.object.ideaform.IdeaForm");
		var oIdeaForm = IdeaForm.read(getCurrentAdminFormCode(oIdea, oContext));

		_.each(oIdea.AdminFieldsValue, function(oValue, iIndex) {
			var aFormFields = _.where(oIdeaForm.Fields || [], {
				CODE: oValue.FIELD_CODE
			});

			checkFieldValue(oValue, aFormFields[0], _.wrap(addMessage, function(fnAddMessage) {
				fnAddMessage.apply(undefined, (_.rest(_.toArray(arguments))));
			}));
		});
	}
}

function getCurrentAdminFormCode(oIdea, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect = 'select top 1 form_code from "sap.ino.db.ideaform::t_field" where code = ?';
	var aResult = oHQ.statement(sSelect).execute(oIdea.AdminFieldsValue[0].FIELD_CODE);

	return aResult[0].FORM_CODE;
}

function getCurrentFormCode(oIdea, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect = 'select top 1 form_code from "sap.ino.db.ideaform::t_field" where code = ?';
	var aResult = oHQ.statement(sSelect).execute(oIdea.FieldsValue[0].FIELD_CODE);
	if (!aResult || aResult.length == 0) {
		return "";
	}
	return aResult[0].FORM_CODE;
}

function evalReqAssignExpert(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameter || !oParameter.IDENTITY_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		return;
	}

	oIdea.Experts.push({
		ID: getNextHandle(),
		IDENTITY_ID: oParameter.IDENTITY_ID
	});
}

function evalReqUnassignExpert(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	if (!oParameter || !oParameter.IDENTITY_ID) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.ASSIGN_COACH_INVALID_COACH, vKey, "Root", "IDENTITY_ID");
		return;
	}

	oIdea.Experts = _.reject(oIdea.Experts, function(oExpert) {
		return oExpert.IDENTITY_ID === oParameter.IDENTITY_ID;
	});
}

function dismissReward(vKey, oParameter, oIdea, addMessage, getNextHandle, oContext) {
	if (!oIdea.REWARD_DISMISSED) {
		oIdea.REWARD_DISMISSED = 1;
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.INVALID_REWARD_DISMISS, vKey, "Root", "REWARD_DISMISSED");
	}
}

function getCurrentUserPrivilege(oSession, oHQ) {
	//select IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"
	//$.session.hasSystemPrivilege("sap.ino.ui::backoffice.access");
	var oResult = {};

	var sSelect = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	var aResult = oHQ.statement(sSelect).execute();

	oResult.USER_ID = aResult[0].ID;
	oResult.IS_EXTERNAL = aResult[0].IS_EXTERNAL;
	oResult.HAS_BACKOFFICE_PRIVILEGE = oSession.hasSystemPrivilege("sap.ino.ui::backoffice.access");

	return oResult;
}

//provide a function to user contact email visible
function getInternalUser(oHQ, sRole, sObjectType, iObjectId) {
	var sSelect =
		'select distinct identity_role.identity_id from "sap.ino.db.iam::t_object_identity_role" as identity_role \
        inner join "sap.ino.db.iam::t_identity" as identity \
            on identity_role.identity_id = identity.id \
    where identity_role.role_code = ? and identity_role.object_type_code = ? and identity_role.object_id = ? and identity.is_external = 0';
	var aResult = oHQ.statement(sSelect).execute(sRole, sObjectType, iObjectId);

	return aResult;
}

function bulkChangeAuthorCheck(oParameters, oBulkAccess, addMessage, oContext) {
	if (oParameters && oParameters.AUTHOR_ID && oParameters.keys && oParameters.keys.length > 0 && oParameters
		.hasOwnProperty("Reward") &&
		oParameters.hasOwnProperty("Selfevaluation")) {
		var oHQ = oContext.getHQ();
		var sAuthorCondition = "AND (OBJECT_ID = ? ";
		for (var iIdea = 1; iIdea < oParameters.keys.length; iIdea++) {
			sAuthorCondition += " OR OBJECT_ID = ? ";
		}
		sAuthorCondition += ") ";

		// 		var sCheckAuthor =
		// 			`
		// SELECT COUNT(ID) AS NUM
		// FROM "SAP_INO"."sap.ino.db.iam::t_object_identity_role" AS IR
		// WHERE OBJECT_TYPE_CODE = 'IDEA'
		// 	AND ROLE_CODE = 'IDEA_SUBMITTER'
		// 	AND IDENTITY_ID = ? 
		// `;
		// 		sCheckAuthor += sAuthorCondition;

		var sParticipantsCondition = "AND (I.ID = ? ";
		for (var iParticipants = 1; iParticipants < oParameters.keys.length; iParticipants++) {
			sParticipantsCondition += " OR I.ID = ? ";
		}
		sParticipantsCondition += ") ";
		var sCheckParticipants =
			`
SELECT COUNT(1) AS NUM
FROM (
SELECT DISTINCT I.ID, 
	RT.IDENTITY_ID
FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS RT
	INNER JOIN "sap.ino.db.idea::t_idea" AS I
	ON RT.OBJECT_ID = I.CAMPAIGN_ID
WHERE RT.ROLE_CODE = 'CAMPAIGN_USER'
	AND RT.OBJECT_TYPE_CODE = 'CAMPAIGN'
	AND IDENTITY_ID = ? 
`;
		sCheckParticipants += sParticipantsCondition + ")";

		var sOperatorCondition = "AND (ID = ? ";
		for (var index = 1; index < oParameters.keys.length; index++) {
			sOperatorCondition += " OR ID = ? ";
		}
		sOperatorCondition += ") ";
		var sCheckOperator =
			`
SELECT COUNT(1) AS NUM
FROM (
		SELECT DISTINCT RT.IDENTITY_ID, 
			I.ID
		FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS RT
			INNER JOIN "sap.ino.db.idea::t_idea" AS I
			ON RT.OBJECT_ID = I.CAMPAIGN_ID
		WHERE RT.OBJECT_TYPE_CODE = 'CAMPAIGN'
			AND (ROLE_CODE = 'CAMPAIGN_COACH'
				OR ROLE_CODE = 'CAMPAIGN_MANAGER')

		UNION

		SELECT DISTINCT RT.IDENTITY_ID, 
			I.ID
		FROM "sap.ino.db.idea::t_idea" AS I
			INNER JOIN "sap.ino.db.campaign::t_campaign" AS C
			ON I.CAMPAIGN_ID = C.ID
			INNER JOIN "sap.ino.db.subresponsibility::t_responsibility_value_stage" AS RE
			ON C.RESP_CODE = RE.RESP_CODE
			INNER JOIN "sap.ino.db.iam::v_object_identity_role_transitive" AS RT
			ON RE.ID = RT.OBJECT_ID
		WHERE RT.ROLE_CODE = 'RESP_COACH'
			AND RT.OBJECT_TYPE_CODE = 'RESPONSIBILITY'
	)
WHERE IDENTITY_ID = ? 
`;

		sCheckOperator += sOperatorCondition;

		var sAnonymousCondition = "AND (IDEA_ID = ? ";
		for (var iAnonymousIdea = 1; iAnonymousIdea < oParameters.keys.length; iAnonymousIdea++) {
			sAnonymousCondition += " OR IDEA_ID = ? ";
		}
		sAnonymousCondition += ") ";

		var sCheckAnonymous =
			`
SELECT COUNT(setting.IDEA_ID) AS NUM
FROM "sap.ino.db.idea::t_ideas_setting" AS setting
	INNER JOIN "sap.ino.db.idea::t_idea" AS idea
	ON setting.idea_id = idea.id
	INNER JOIN "sap.ino.db.iam::t_identity" AS iden
	ON iden.id = idea.created_by_id
		AND iden.erased <> 1
WHERE ANONYMOUS_FOR <> 'NONE'
`;
		sCheckAnonymous += sAnonymousCondition;

		var sqlCheck = sCheckParticipants + " UNION ALL " + sCheckOperator + " UNION ALL " + sCheckAnonymous;
		try {
			var aParameter = [oParameters.AUTHOR_ID]
				.concat(oParameters.keys)
				.concat([oContext.getUser().ID])
				.concat(oParameters.keys)
				.concat(oParameters.keys);
			var aResult = oHQ.statement(sqlCheck).execute(aParameter);
			// 			if (parseInt(aResult[0].NUM.toString()) !== oParameters.keys.length) {
			// 				addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_WRONG_AUTHOR_ID, undefined, "", "");
			// 			}
			if (parseInt(aResult[0].NUM.toString()) !== oParameters.keys.length) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_AUTHOR_ID_IS_NOT_PARTICIPANTS, undefined, "", "");
			}
			if (parseInt(aResult[1].NUM.toString()) !== oParameters.keys.length) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_HAS_NO_AUTHORIZATION, undefined, "", "");
			}
			if (parseInt(aResult[2].NUM.toString()) > 0) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_HAS_ANONYMOUS_IDEA, undefined, "", "");
			}
		} catch (e) {
			TraceWrapper.log_exception(e);
			addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
		}
	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
	}
}

function changeAuthorStatic(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.AUTHOR_ID && oParameters.keys && oParameters.keys.length > 0 && oParameters
		.hasOwnProperty("Reward") &&
		oParameters.hasOwnProperty("Selfevaluation")) {
		var sId = _.map(oParameters.keys, function(o) {
			return o;
		}).join(',');
		var oHQ = oContext.getHQ();
		//Check the New author is current experts or current Coach

		var sExpertSql = 'select distinct identity_id,idea_id from "sap.ino.db.idea::v_idea_experts" where idea_id in (' + sId + ')';

		var aExpert = oHQ.statement(sExpertSql).execute();

		if (aExpert.length > 0) {
			var oFindPerson = aExpert.find(function(oValue) {
				return oValue.IDENTITY_ID === oParameters.AUTHOR_ID;
			});
			if (oFindPerson) {
				addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_EXPERT, undefined, "", "", oFindPerson.IDEA_ID);
			}

		}

		//CHANGE contribution share   
		//changeIdeaContributionShare(oParameters, oContext, addMessage);
		//CHANGE OBJECT IDENTITY ROLE
		changeIdentityObjectRole(oParameters, oContext, addMessage);
		//change reward
		var oResponse;
		if (oParameters.Reward) {
			var ChangeAuthor_RewardList = AOF.getApplicationObject("sap.ino.xs.object.reward.RewardList");
			oResponse = ChangeAuthor_RewardList.changeAuthorIdeaRewards({
				"AUTHOR_ID": oParameters.AUTHOR_ID,
				"ORIGIN_AUTHOR_ID": oParameters.ORIGIN_AUTHOR_ID,
				"keys": oParameters.keys
			});
			addMessage(oResponse.messages);
		}
		//change self evaluation
		if (oParameters.Selfevaluation) {
			var ChangeAuthor_Evaluation = AOF.getApplicationObject("sap.ino.xs.object.evaluation.Evaluation");
			oResponse = ChangeAuthor_Evaluation.changeAuthorIdeaSelfEvaluation({
				"AUTHOR_ID": oParameters.AUTHOR_ID,
				"ORIGIN_AUTHOR_ID": oParameters.ORIGIN_AUTHOR_ID,
				"keys": oParameters.keys
			});
			addMessage(oResponse.messages);
		}
		var sCondition = "(ID = ? ";
		for (var index = 1; index < oParameters.keys.length; index++) {
			sCondition += " OR ID = ? ";
		}
		sCondition += ")";
		oResponse = oBulkAccess.update({
			Root: {
				CREATED_BY_ID: oParameters.AUTHOR_ID,
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: sCondition,
			conditionParameters: oParameters.keys
		});
		addMessage(oResponse.messages);
		//static method will not execute onpersist determination, so call it manually
		var oParam = oHQ.statement('select ID, CAMPAIGN_ID from "sap.ino.db.idea::t_idea" where id in (' + sId + ')').execute();
		ObjectOnPersistCallBack.updateOnpersist(oParam, oContext);

		///If new author is in the co-author list then remove it from the co-authors
		var aContributorsContainAuthor = oHQ.statement(
			'select idea_id,identity_id from "sap.ino.db.idea::v_idea_lean_contributors" where IDENTITY_ID =' + oParameters.AUTHOR_ID +
			' AND idea_id in (' + sId + ')').execute();
		if (aContributorsContainAuthor.length > 0) {
			var IdeaObject = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
			for (var i = 0; i < aContributorsContainAuthor.length; i++) {
				var oRemoveResponse = IdeaObject.removeCoauthor(aContributorsContainAuthor[i].IDEA_ID, {
					CO_AUTHOR: aContributorsContainAuthor[i].IDENTITY_ID
				});
				addMessage(oRemoveResponse.messages);
			}

		}
		//If author doesn't follow the idea then auto follow the corresponding Idea
		var sSelFollowObject =
			'select OBJECT_ID AS IDEA_ID FROM "sap.ino.db.follow::t_follow" where object_type_code = ? AND  CREATED_BY_ID = ? AND OBJECT_ID in (' +
			sId + ')';
		var aResultFollowed = oContext.getHQ().statement(sSelFollowObject).execute('IDEA', oParameters.AUTHOR_ID);

		var aDiffIdea = _.difference(_.map(oParameters.keys, function(id) {
			return parseInt(id, 10);
		}), _.map(aResultFollowed, function(oResult) {
			return oResult.IDEA_ID;
		}));
		var Follow = AOF.getApplicationObject("sap.ino.xs.object.follow.Follow");
		_.each(aDiffIdea, function(id) {
			oResponse = Follow.create({
				OBJECT_TYPE_CODE: 'IDEA',
				OBJECT_ID: id,
				CREATED_BY_ID: oParameters.AUTHOR_ID
			});
			addMessage(oResponse.messages);
		});

	} else {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
	}
}

function changeIdentityObjectRole(oParameters, oContext, addMessage) {
	var sCondition = "AND (IR.OBJECT_ID = ? ";
	for (var index = 1; index < oParameters.keys.length; index++) {
		sCondition += " OR IR.OBJECT_ID = ? ";
	}

	var sHistorySql =
		`
INSERT INTO "SAP_INO"."sap.ino.db.iam::t_object_identity_role_h"
(
    "HISTORY_DB_EVENT",
	"HISTORY_BIZ_EVENT",
	"HISTORY_AT",
	"HISTORY_ACTOR_ID",
	"ID",
	"IDENTITY_ID",
	"OBJECT_ID",
	"OBJECT_TYPE_CODE",
	"ROLE_CODE"
) 
SELECT 'UPDATED', 
	'IDETITY_ROLE_CHANGE_AUTHOR', 
	?, 
	?, 
	IR."ID", 
	?, 
	IR."OBJECT_ID", 
	IR."OBJECT_TYPE_CODE", 
	'IDEA_SUBMITTER'
FROM "SAP_INO"."sap.ino.db.iam::t_object_identity_role_h" AS IR
WHERE IR.OBJECT_TYPE_CODE = 'IDEA' 
	AND IR.ROLE_CODE = 'IDEA_SUBMITTER' 
	AND IR.HISTORY_BIZ_EVENT = 'IDEA_CREATED'
`;
	sHistorySql = sHistorySql + sCondition + ") ";

	var sUpdateSql =
		`
UPDATE IR
SET IR.IDENTITY_ID = ?
FROM "SAP_INO"."sap.ino.db.iam::t_object_identity_role" AS IR
WHERE IR.OBJECT_TYPE_CODE = 'IDEA'
	AND IR.ROLE_CODE = 'IDEA_SUBMITTER' 
	`;

	sUpdateSql = sUpdateSql + sCondition + ") ";

	var oHQ = oContext.getHQ();
	try {
		oHQ.statement(sHistorySql).execute([oContext.getRequestTimestamp(), oContext.getUser().ID,
			oParameters.AUTHOR_ID].concat(oParameters.keys));

		oHQ.statement(sUpdateSql).execute([oParameters.AUTHOR_ID].concat(oParameters.keys));
		var aIdenObject = [];
		if (oParameters.ORIGIN_AUTHOR_ID) {
			var sIdenObjectSql =
				`SELECT 
		            IR.OBJECT_ID 
		        FROM "sap.ino.db.iam::t_object_identity_role" AS IR
                WHERE IR.OBJECT_TYPE_CODE = 'IDEA'
                	AND IR.ROLE_CODE = 'IDEA_SUBMITTER' AND (IR.IDENTITY_ID= ? ) `
			sIdenObjectSql = sIdenObjectSql + sCondition + ") ";
			aIdenObject = oHQ.statement(sIdenObjectSql).execute([oParameters.AUTHOR_ID].concat(oParameters.keys));
		}
		for (var i = 0; i < oParameters.keys.length; i++) {
			if (!oParameters.ORIGIN_AUTHOR_ID || (aIdenObject && _.filter(aIdenObject, function(data) {
				return data.OBJECT_ID === Number(oParameters.keys[i]);
			}).length === 0)) {
				var sInsertSql =
					`INSERT INTO "SAP_INO"."sap.ino.db.iam::t_object_identity_role" VALUES(
            	"SAP_INO"."sap.ino.db.iam::s_object_identity_role".nextVal,
            	?,
            	?,
            	'IDEA',
        	    'IDEA_SUBMITTER'
            )
	    `;
				oHQ.statement(sInsertSql).execute([oParameters.AUTHOR_ID].concat(oParameters.keys[i]));
			}
		}
	} catch (e) {
		TraceWrapper.log_exception(e);
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
	}
}

// function changeIdeaContributionShare(oParameters, oContext, addMessage) {
// 	var sCondition = "AND (CS.IDEA_ID = ? ";
// 	for (var index = 1; index < oParameters.keys.length; index++) {
// 		sCondition += " OR CS.IDEA_ID = ? ";
// 	}

// 	var sUpdateSql =
// 		`
// UPDATE CS
// SET CS.AUTHOR_ID = ?
// FROM "SAP_INO"."sap.ino.db.reward::t_contribution_share" AS CS
// WHERE CS.AUTHOR_ID = ? 
// 	`;
// 	sUpdateSql = sUpdateSql + sCondition + ") ";
// 	var oHQ = oContext.getHQ();
// 	try {
// 		oHQ.statement(sUpdateSql).execute([oParameters.AUTHOR_ID, oParameters.ORIGIN_AUTHOR_ID].concat(oParameters.keys));
// 	} catch (e) {
// 		TraceWrapper.log_exception(e);
// 		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
// 	}
// }

function changeDecisionEnabledCheck(vKey, oIdea, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var oUserPrivileges = getCurrentUserPrivilege($.session, oHQ);
	var sSelect = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	var aResult = oHQ.statement(sSelect).execute();

	var sCampaingCoachSelect = 'select IDENTITY_ID from "sap.ino.db.campaign::v_campaign_coach" where campaign_id = ?';
	var aCampaignCoaches = oHQ.statement(sCampaingCoachSelect).execute(oIdea.CAMPAIGN_ID);
	var sCampaignManagerSelect = 'select IDENTITY_ID from "sap.ino.db.idea.ext::V_EXT_CAMPAIGN_MANAGER" where object_id = ?';
	var aCampaignManagers = oHQ.statement(sCampaignManagerSelect).execute(oIdea.CAMPAIGN_ID);

	var aFinalPersonsResult = aCampaignManagers.concat(aCampaignCoaches).concat(oIdea.Coach);

	var aAccessCheckResult = aFinalPersonsResult.filter(function(oPerson) {
		return oPerson.IDENTITY_ID === aResult[0].ID;
	});

	if (aAccessCheckResult.length === 0) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_NO_AUTHORIZATION_CHANGE_DECISION, vKey);
	}

}

function changeDecision(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var aDecisions = oIdea.Decisions;
	if (!oParameters.DECIDER_ID || !oParameters.DECISION_DATE || (oParameters.DECISION_REASON_LIST_CODE && !oParameters.REASON_CODE) ||
		(oParameters.DECISION_REASON_LIST_CODE && oParameters.REASON_CODE === '') ||
		(!oParameters.DECISION_REASON_LIST_CODE && !oParameters.REASON) ||
		(!oParameters.DECISION_REASON_LIST_CODE && oParameters.REASON === '')) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DECISION_CHANGE_DECISION_MISSING, vKey, "Root");
		return;
	}
	if (oParameters.SEND_RESPONSE && !oParameters.TEXT_MODULE_CODE && (!oParameters.RESPONSE || oParameters.RESPONSE === '')) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_DECISION_CHANGE_RESPONSE_MISSING, vKey, "Root");
		return;
	}

	for (var i = 0; i < aDecisions.length; i++) {
		if (aDecisions[i].ID === oParameters.ID) {
			aDecisions[i].CHANGED_AT = oContext.getRequestTimestamp();
			aDecisions[i].CHANGED_BY_ID = oContext.getUser().ID;
			aDecisions[i].DECIDER_ID = oParameters.DECIDER_ID;
			aDecisions[i].DECISION_DATE = oParameters.DECISION_DATE || oContext.getRequestTimestamp();
			aDecisions[i].REASON = oParameters.REASON;
			aDecisions[i].SEND_RESPONSE = oParameters.SEND_RESPONSE;
			aDecisions[i].RESPONSE = oParameters.RESPONSE;
			aDecisions[i].REASON_CODE = oParameters.REASON_CODE;
			aDecisions[i].LINK_LABEL = oParameters.LINK_LABEL;
			aDecisions[i].LINK_URL = oParameters.LINK_URL;
		}
	}
	oIdea.Decisions = aDecisions;

}

function removeCoauthor(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	var aNeedRemoveCoauthor = oParameters.CO_AUTHOR;
	var aNewContributors = oIdea.Contributors;
	aNewContributors = _.filter(aNewContributors, function(oContributor) {
		return (oContributor.IDENTITY_ID !== oParameters.CO_AUTHOR);
	});
	oIdea.Contributors = aNewContributors;
}
//enable check for create idea object integration
function createObjectEnabledCheck(vKey, oIdea, addMessage, oContext) {
	const campaign_id = oIdea.CAMPAIGN_ID;
	var oHQ = oContext.getHQ();
	const sSelectCampaignIntegrationQuery =
		`SELECT TOP 1 campaign_integration.CREATE_REQ_JSON,campaign.IS_INTEGRATION_ACTIVE
                                                FROM "sap.ino.db.integration::t_campaign_integration" as campaign_integration 
                                                LEFT OUTER JOIN "sap.ino.db.campaign::t_campaign" as campaign
                                                ON campaign.ID = campaign_integration.CAMPAIGN_ID
                                                WHERE campaign.ID = ? AND campaign_integration.STATUS = 'active'`;
	const aCampaignIntegration = oHQ.statement(sSelectCampaignIntegrationQuery).execute(campaign_id);
	if (aCampaignIntegration.length > 0 && aCampaignIntegration[0].CREATE_REQ_JSON && aCampaignIntegration[0].IS_INTEGRATION_ACTIVE) {
		return true;
	} else {
		addMessage(Message.MessageSeverity.Error, '', vKey, "Root");
	}
}

//create object empty function ,please see details in ideaObjectIntegration BO
function createObject() {

}

function linkExistedObject() {

}

function linkExistedObjectEnabledCheck(vKey, oIdea, addMessage, oContext) {
	const campaign_id = oIdea.CAMPAIGN_ID;
	var oHQ = oContext.getHQ();
	const sSelectCampaignIntegrationQuery =
		`SELECT TOP 1 campaign_integration.FETCH_RES_JSON,campaign.IS_INTEGRATION_ACTIVE
                                                FROM "sap.ino.db.integration::t_campaign_integration" as campaign_integration 
                                                LEFT OUTER JOIN "sap.ino.db.campaign::t_campaign" as campaign
                                                ON campaign.ID = campaign_integration.CAMPAIGN_ID
                                                WHERE campaign.ID = ? AND campaign_integration.STATUS = 'active'`;
	const aCampaignIntegration = oHQ.statement(sSelectCampaignIntegrationQuery).execute(campaign_id);
	if (aCampaignIntegration.length > 0 && aCampaignIntegration[0].IS_INTEGRATION_ACTIVE) {
		return true;
	} else {
		addMessage(Message.MessageSeverity.Error, '', vKey, "Root");
	}
}

function updateAdminForms(vKey, oParameters, oIdea, addMessage, getNextHandle, oContext) {
	if (oParameters.IS_PUBLISH) {
		oContext.setHistoryEvent("ADMIN_FORM_WITH_PUBLISH");
	}
	oIdea.AdminFieldsValue = oParameters.AdminFieldsValue;
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