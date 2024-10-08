var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var date = $.import("sap.ino.xs.aof.lib", "date");
var i18n = $.import("sap.ino.xs.xslib", "i18n");
var Metadata = $.import("sap.ino.xs.aof.core", "metadata");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var CampaignIntegration = $.import("sap.ino.xs.object.integration", "CampaignIntegration");
var IdentityRoleLimitation = $.import("sap.ino.xs.object.iam", "ObjectIdentityLimitationAction");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var Extension = $.import("sap.ino.xs.object.basis", "Extension");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var CampMessage = $.import("sap.ino.xs.object.campaign", "message");
var VoteType = $.import("sap.ino.xs.object.campaign", "VoteType");
var Phase = $.import("sap.ino.xs.object.campaign", "Phase");
var StatusModel = $.import("sap.ino.xs.object.idea", "StatusModel");

var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

var Status = this.Status = {
	Draft: "sap.ino.config.CAMP_DRAFT",
	Published: "sap.ino.config.CAMP_PUBLISHED"
};

// used for campaign major publish
var Messages = {
	OBJECT_NOT_FOUND: "MSG_OBJECT_NOT_FOUND",
	INVALID_HANDLE_KEY: "MSG_INVALID_HANDLE_KEY",
	INVALID_OBJECT_KEY: "MSG_INVALID_OBJECT_KEY",
	NO_OBJECT_KEYS: "MSG_NO_OBJECT_KEYS",
	CONCURRENCY_TOKEN_CONFLICT: "MSG_CONCURRENCY_TOKEN_CONFLICT",
	CONCURRENCY_TOKEN_NOT_ENABLED: "MSG_CONCURRENCY_TOKEN_NOT_ENABLED",
	ATTRIBUTE_REQUIRED: "MSG_ATTRIBUTE_REQUIRED",
	NODE_READ_ONLY: "MSG_NODE_READ_ONLY",
	NODE_UNKNOWN: "MSG_NODE_UNKNOWN",
	NODE_INSTANCE_UNKNOWN: "MSG_NODE_INSTANCE_UNKNOWN",
	ATTRIBUTE_READ_ONLY: "MSG_ATTRIBUTE_READ_ONLY",
	INTERNAL_ACTION_CALLED: "MSG_INTERNAL_ACTION_CALLED"
};

var MessageSeverity = Message.MessageSeverity;

this.definition = {
	isExtensible: true,
	cascadeDelete: ["sap.ino.xs.object.analytics.Report",
	                "sap.ino.xs.object.campaign.Registration",
	                "sap.ino.xs.object.blog.Blog"],
	actions: {
		create: {
			authorizationCheck: auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", CampMessage.AUTH_MISSING_CAMPAIGN_CREATE),
			historyEvent: "CAMP_CREATED"
		},
		copy: {
			/* same as create */
			authorizationCheck: auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", CampMessage.AUTH_MISSING_CAMPAIGN_CREATE),
			historyEvent: "CAMP_CREATED"
		},
		update: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_UPDATE),
			executionCheck: updateExecutionCheck,
			historyEvent: "CAMP_UPDATED"
		},
		del: {
			authorizationCheck: auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", CampMessage.AUTH_MISSING_CAMPAIGN_DELETE),
			enabledCheck: deleteEnabledCheck,
			historyEvent: "CAMP_DELETED"
		},
		read: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_read", CampMessage.AUTH_MISSING_CAMPAIGN_READ)
		},
		submit: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT),
			execute: submit,
			historyEvent: "CAMP_SUBMITTED"
		},
		majorpublish: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT),
			execute: majorpublish,
			historyEvent: "CAMP_MAJOR_PUBLISH"
		},
		replaceVoteType: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT_UPDATE),
			enabledCheck: replaceVoteTypeEnabledCheck,
			execute: replaceVoteType,
			historyEvent: "CAMP_SUBMITTED_VOTING_REPLACED",
			customProperties: replaceVoteTypeProperties
		},
		replacePhaseCode: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT_UPDATE),
			enabledCheck: replacePhaseCodeEnabledCheck,
			execute: replacePhaseCode,
			historyEvent: "CAMP_SUBMITTED_PHASE_CODE_REPLACED",
			customProperties: replacePhaseCodeProperties
		},
		replaceStatusModelCode: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT_UPDATE),
			enabledCheck: replaceStatusModelCodeEnabledCheck,
			execute: replaceStatusModelCode,
			historyEvent: "CAMP_SUBMITTED_STATUS_CODE_REPLACED",
			customProperties: replaceStatusModelCodeProperties
		},
		deletePhase: {
			authorizationCheck: authCheckAdminOr("sap.ino.db.campaign::v_auth_campaigns_manage", CampMessage.AUTH_MISSING_CAMPAIGN_SUBMIT_UPDATE),
			enabledCheck: deletePhaseEnabledCheck,
			execute: deletePhase,
			historyEvent: "CAMP_SUBMITTED_PHASE_DELETED",
			customProperties: deletePhaseProperties
		},
		deleteTagAssignments: TagAssignment.includeDeleteTagAssignment(),
		mergeTagAssignments: TagAssignment.includeMergeTagAssignment()
	},
	Root: {
		table: "sap.ino.db.campaign::t_campaign",
		sequence: "sap.ino.db.campaign::s_campaign",
		historyTable: "sap.ino.db.campaign::t_campaign_h",
		determinations: {
			onRead: [determineShortName],
			onCreate: [initCampaign],
			onCopy: [initCampaign, updateTitles, copyAttachments],
			onModify: [determine.systemAdminData, updateCounts, updatePhases, validateDates, adjustLanguageTexts, handleBlackbox, TagAssignment.createTags,
				onCampaignIntegration, validCampIntegrationAttLayout,
				updateRewardRelatedRecord, determineEvalReqs, determinIntegrationAdminData],
			onPersist: [IdentityRole.registerLeaved, updateDraftIdea, generateVanityCodeForTag]
		},
		consistencyChecks: [languageTextDefined, rolesDefined, titleImageDefined, phasesDefined, validatePages, generalConsistencyCeck,
		checkDuplicationForVanityCode, checkSpecialCharactersForVanityCode],
		customProperties: rootCustomProperties,
		nodes: {
			Managers:IdentityRoleLimitation.nodeCampManager(IdentityRoleLimitation.ObjectType.Campaign, IdentityRoleLimitation.Role.CampaignManager, false),
			Coaches: IdentityRole.node(IdentityRole.ObjectType.Campaign, IdentityRole.Role.CampaignCoach, false),
			Experts: IdentityRole.node(IdentityRole.ObjectType.Campaign, IdentityRole.Role.CampaignExpert, false),
			Participants: IdentityRoleLimitation.node(IdentityRoleLimitation.ObjectType.Campaign, IdentityRoleLimitation.Role.CampaignUser, false),
			Registers: {
				table: "sap.ino.db.iam::t_object_identity_limitation_action",
				historyTable: "sap.ino.db.iam::t_object_identity_limitation_action_h",
				sequence: "sap.ino.db.iam::s_object_identity_limitation_action",
				parentKey: "OBJECT_ID",
				readOnly: false,
				consistencyChecks: [check.duplicateCheck("IDENTITY_ID", Message.DUPLICATE_IDENTITY)],
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					},
					OBJECT_TYPE_CODE: {
						constantKey: "CAMPAIGN"
					},
					ACTION_CODE: {
						constantKey: "CAMPAIGN_REGISTER"
					},
					DISABLED: {
						consistencyChecks: [check.booleanCheck]
					}
				}
			},
			AnonymousText: {
				table: "sap.ino.db.campaign::t_campaign_anonymous_text",
				sequence: "sap.ino.db.campaign::s_campaign_anonymous_text",
				historyTable: "sap.ino.db.campaign::t_campaign_anonymous_text_h",
				parentKey: "CAMPAIGN_ID",
				readOnly: false,
				consistencyChecks: [check.duplicateCheck("CODE", Message.CAMP_ANONYMOUS_DUPLICATION)]
			},
			GamificationDimension: {
				table: "sap.ino.db.campaign::t_campaign_gamification_dimension",
				sequence: "sap.ino.db.campaign::s_campaign_gamification_dimension",
				parentKey: "CAMPAIGN_ID"
			},

			IdeaReaders: IdentityRole.node(IdentityRole.ObjectType.Campaign, IdentityRole.Role.CampaignIdeaReader, true),
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Campaign),
			Tags: TagAssignment.node(TagAssignment.ObjectTypeCode.Campaign),
			LanguageTexts: {
				table: "sap.ino.db.campaign::t_campaign_t",
				sequence: "sap.ino.db.campaign::s_campaign_t",
				historyTable: "sap.ino.db.campaign::t_campaign_t_h",
				parentKey: "CAMPAIGN_ID"
			},
			CampaignNotification: {
				table: "sap.ino.db.newnotification::t_notification_campaign_setting",
				sequence: "sap.ino.db.newnotification::s_notification_campaign_setting",
				parentKey: "CAMPAIGN_ID",
				attributes: {},
				nodes: {
					CampaignNotificationReceiver: {
						table: "sap.ino.db.newnotification::t_notification_campaign_setting_receiver",
						sequence: "sap.ino.db.newnotification::s_notification_campaign_setting_receiver",
						parentKey: "ACTION_ID"
					}
				}
			},
			CampaignIntegration: {
				table: "sap.ino.db.integration::t_campaign_integration",
				sequence: "sap.ino.db.integration::s_campaign_integration",
				parentKey: "CAMPAIGN_ID",
				attributes: {
					// 		   CREATED_AT: {
					// 				//readOnly: true
					// 			},
					// 			CREATED_BY_ID: {
					// 				//readOnly: true
					// 			},
					// 			CHANGED_AT: {
					// 				//readOnly: true,
					// 				concurrencyControl: true
					// 			},
					// 			CHANGED_BY_ID: {
					// 				//readOnly: true
					// 			},
					APINAME: {
						required: true
					},
					TECHNICAL_NAME: {
						required: true
					},
					SYSTEM_NAME: {
						required: true
					},
					SYSTEM_PACKAGE_NAME: {
						required: true
					},
					CREATE_METHOD: {
						required: true
					},
					CREATE_PATH: {
						required: false
					},
					FETCH_METHOD: {
						required: false
					},
					FETCH_PATH: {
						required: false
					},
					CREATE_REQ_JSON: {
						required: true
					},
					CREATE_RES_JSON: {
						required: false
					},
					FETCH_REQ_JSON: {
						required: false
					},
					FETCH_RES_JSON: {
						required: false
					},
					STATUS: {
						required: true
					},
					CAMPAIGN_ID: {
						required: true
					}
				},
				nodes: {
					AttributesLayout: {
						table: "sap.ino.db.integration::t_campaign_integration_api_attributes_layout",
						sequence: "sap.ino.db.integration::s_campaign_integration_api_attributes_layout",
						historyTable: "sap.ino.db.integration::t_campaign_integration_api_attributes_layout_h",
						parentKey: "API_ID",
						attributes: {
							MAPPING_FIELD_CODE: {
								required: true
							},
							DISPLAY_NAME: {
								required: true
							},
							DISPLAY_SEQUENCE: {
								required: false
							},
							API_ID: {
								required: true
							}
						}
					}
				}
			},
			Phases: {
				table: "sap.ino.db.campaign::t_campaign_phase",
				sequence: "sap.ino.db.campaign::s_campaign_phase",
				historyTable: "sap.ino.db.campaign::t_campaign_phase_h",
				parentKey: "CAMPAIGN_ID",
				attributes: {
					PHASE_CODE: {
						foreignKeyTo: "sap.ino.xs.object.campaign.Phase.Root",
						readOnly: phasesReadOnly
						// consistency checked via foreign key property (only valid phase codes are stored in this table)
					},
					NEXT_PHASE_CODE: {
						readOnly: true
					},
					STATUS_MODEL_CODE: {
						foreignKeyTo: "sap.ino.xs.object.status.Model.Root",
						readOnly: phasesReadOnly,
						consistencyChecks: [checkStatusModelCode]
					},
					EVALUATION_MODEL_CODE: {
						foreignKeyTo: "sap.ino.xs.object.evaluation.Model.Root",
						readOnly: false
						// consistency checked via foreign key property (only valid phase codes are stored in this table)
					},
					VOTING_ACTIVE: {
						consistencyChecks: [check.booleanCheck],
						readOnly: false
					},
					SHOW_IDEA_IN_COMMUNITY: {
						consistencyChecks: [check.booleanCheck],
						readOnly: false
					},
					IDEA_CONTENT_EDITABLE: {
						consistencyChecks: [check.booleanCheck],
						readOnly: false
					},
					REWARD: {
						consistencyChecks: [check.booleanCheck],
						readOnly: false
					}
				},
				nodes: {
					CampaignNotificationStatus: {
						table: "sap.ino.db.newnotification::t_notification_campaign_status_setting",
						sequence: "sap.ino.db.newnotification::s_notification_campaign_status_setting",
						parentKey: "CAMPAIGN_PHASE_ID",
						attributes: {
							TEXT_MODULE_CODE: {
								foreignKeyTo: "sap.ino.xs.object.basis.TextModule.Root"
							},
							STATUS_ACTION_CODE: {
								readOnly: false
							}
						}
					}
				}
			},
			LanguagePages: {
				table: "sap.ino.db.campaign::t_campaign_page_t",
				sequence: "sap.ino.db.campaign::s_campaign_page_t",
				historyTable: "sap.ino.db.campaign::t_campaign_page_t_h",
				parentKey: "CAMPAIGN_ID"
			},
			Tasks: {
				table: "sap.ino.db.campaign::t_campaign_task",
				sequence: "sap.ino.db.campaign::s_campaign_task",
				parentKey: "CAMPAIGN_ID",
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					TASK_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.MilestoneTask.Root"
					},
					DATE_TYPE_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.Datetype.Root"
					},
					START_MONTH_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
					},
					END_MONTH_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
					},
					START_QUARTER_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
					},
					END_QUARTER_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
					}
				},
				nodes: {
					Milestones: {
						table: "sap.ino.db.campaign::t_campaign_milestone",
						sequence: "sap.ino.db.campaign::s_campaign_milestone",
						parentKey: "CAMPAIGN_TASK_ID",
						attributes: {
							ID: {
								isPrimaryKey: true
							},
							MILESTONE_CODE: {
								foreignKeyTo: "sap.ino.xs.object.basis.Milestone.Root"
							},
							DATE_TYPE_CODE: {
								foreignKeyTo: "sap.ino.xs.object.basis.Datetype.Root"
							},
							MILESTONE_QUARTER_CODE: {
								foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
							},
							MILESTONE_MONTH_CODE: {
								foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"
							}
						},
						nodes: {
							Attachment: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Milestone)
						}
					}
				}
			},
			Extension: Extension.node(Extension.ObjectType.Campaign)
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			SHORT_NAME: {
				readOnly: false,
				isName: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			STATUS_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
				// consistency checked via foreign key (status codes for different objects) and readOnly (internally set)
			},
			VOTE_TYPE_CODE: {
				foreignKeyTo: "sap.ino.xs.object.campaign.VoteType.Root",
				readOnly: voteTypeReadOnly
				// consistency checked via foreign key (only valid vote types possible in this table)
			},
			PHASE_COUNT: {
				readOnly: true
			},
			PAGE_COUNT: {
				readOnly: true
			},
			IS_BLACK_BOX: {
				consistencyChecks: [check.booleanCheck]
			},
			VIEW_COUNT: {
				readOnly: true
			},
			VISITOR_COUNT: {
				readOnly: true
			},
			ACTIVE_PARTICIPANT_COUNT: {
				readOnly: true
			},
			MAIL_TEMPLATE_CODE: {
				foreignKeyTo: "sap.ino.xs.object.notification.MailTemplate.Root"
			},
			MAIL_SUCCESS_CODE: {
				foreignKeyTo: "sap.ino.xs.object.basis.TextModule.Root"
			},
			MAIL_REJECTION_CODE: {
				foreignKeyTo: "sap.ino.xs.object.basis.TextModule.Root"
			},
			MAIL_PHASE_CHANGE_CODE: {
				foreignKeyTo: "sap.ino.xs.object.basis.TextModule.Root"
			},
			REWARD_UNIT_CODE: {
				foreignKeyTo: "sap.ino.xs.object.basis.Unit.Root",
				readOnly: rewardUnitReadOnly
			},
			FORM_CODE: {
				foreignKeyTo: "sap.ino.xs.object.ideaform.IdeaForm.Root"
			},
			ADMIN_FORM_CODE: {
				foreignKeyTo: "sap.ino.xs.object.ideaform.IdeaForm.Root"
			}
		}
	}
};

function phasesReadOnly(vKey, oPhases, addMessage, oContext) {
	if (vKey && oPhases && oContext.getProcessedObject().STATUS_CODE !== Status.Draft) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_PHASE_ERR, vKey, "Phases");
		return true;
	}
	return false;
}

function voteTypeReadOnly(vKey, oCampaign, addMessage, oContext) {
	if (vKey && oCampaign && oCampaign.STATUS_CODE !== Status.Draft) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_VOTE_ERR, vKey, "Root", "VOTE_TYPE_CODE");
		return true;
	}
	return false;
}

function rewardUnitReadOnly(vKey, oCampaign, addMessage, oContext) {
	if (vKey && oCampaign && oCampaign.REWARD) {
		var oHQ = oContext.getHQ();
		var sSelect = 'select top 1 * from "sap.ino.db.reward::v_reward" where campaign_id = ?';
		var result = oHQ.statement(sSelect).execute(oCampaign.ID);
		if (result.length > 0) {
			return true;
		}
	}
	return false;
}

function authCheckAdminOr(sAuthView, sAuthFailMsg) {
	return function(vKey, oRequest, fnMessage, oContext) {
		var fnCampInstanceCheck = auth.instanceAccessCheck(sAuthView, "CAMPAIGN_ID", sAuthFailMsg);
		var fnRespInstanceCheck = auth.instanceAccessCheck(sAuthView, "RESP_CODE", sAuthFailMsg);
		var fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);
		var fnPrivilegeCheck = auth.privilegeCheck("sap.ino.xs.rest.admin.application::campaign", sAuthFailMsg);
		var fnMessageIgnoreFunction = function() {};

		var bSuccess = fnPrivilegeCheck(vKey, oRequest, fnMessageIgnoreFunction, oContext);
		if (!bSuccess) {
			bSuccess = fnInstanceCheck([vKey, oRequest.RESP_CODE], oRequest, fnMessage, oContext);
		}

		return bSuccess;
	};
}

function initCampaign(vKey, oCampaign, oPersistedObject, addMessage, fnNextHandle, oContext) {
	oCampaign.STATUS_CODE = Status.Draft;
	oCampaign.CREATED_AT = null;
	oCampaign.CREATED_BY = null;
	oCampaign.CHANGED_AT = null;
	oCampaign.CHANGED_BY = null;
	if (oCampaign.COLOR_CODE === null || oCampaign.COLOR_CODE === undefined) {
		oCampaign.COLOR_CODE = "FFFFFF";
	}
	oCampaign.VANITY_CODE = null;
	oCampaign.VIEW_COUNT = 0;
	oCampaign.VISITOR_COUNT = 0;
	oCampaign.ACTIVE_PARTICIPANT_COUNT = 0;

	validCampTasks(vKey, oCampaign, oPersistedObject, addMessage, fnNextHandle, oContext);
}

function copyAttachments(vKey, oCampaign, oPersistedObject, addMessage, fnNextHandle, oContext) {
	if (oCampaign.Attachments.length > 0) {
		var Attachment = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.attachment.Attachment");

		var sAttachmentPath = AttachmentAssignment.getAttachmentDownloadUrl(oContext.getHQ());

		for (var ii = 0; ii < oCampaign.Attachments.length; ++ii) {
			var iAttachmentId = oCampaign.Attachments[ii].ATTACHMENT_ID;
			var iHandle = fnNextHandle();

			var oCopyResponse = Attachment.copy(iAttachmentId, {
				ID: iHandle
			});

			var iNewAttachmentId = oCopyResponse.generatedKeys && oCopyResponse.generatedKeys[iHandle];
			oCampaign.Attachments[ii].ATTACHMENT_ID = iNewAttachmentId;
			oCampaign.Attachments[ii].ID = fnNextHandle();

			/* jshint loopfunc: true */
			_.each(oCopyResponse.messages, function(oMessage) {
				addMessage(oMessage.severity, oMessage.messageKey, oMessage.refKey, oMessage.refNode, oMessage.refAttribute, oMessage.parameters);
			});

			// update links in pages
			for (var jj = 0; jj < oCampaign.LanguagePages.length; ++jj) {
				oCampaign.LanguagePages[jj].HTML_CONTENT = AttachmentAssignment.replaceAttachmentReference(oCampaign.LanguagePages[jj].HTML_CONTENT,
					sAttachmentPath, iAttachmentId, iNewAttachmentId);
			}
		}
	}
}

function checkStatusModelCode(vKey, oStatusModel, addMessage, oContext) {
	var StatusModel = AOF.getApplicationObject("sap.ino.xs.object.idea.StatusModel");
	if (!StatusModel.exists(oStatusModel.value)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_STATUS_MODEL_CODE, vKey, "Phases", "STATUS_MODEL_CODE",
			oStatusModel.value);
	}
}

function determineShortName(vKey, oCampaign, oNodeMetadata, oContext) {
	if (!oCampaign) {
		return;
	}
	var oHQ = oContext.getHQ();
	var sSystemDefaultShortName = "";
	var sSessionShortName = "";
	var sSessionLang = i18n.getSessionLanguage(oHQ);
	var sSystemDefaultLang = i18n.getSystemDefaultLanguage(oContext.getHQ());

	for (var ii = 0; ii < oCampaign.LanguageTexts.length; ++ii) {
		var sLang = oCampaign.LanguageTexts[ii].LANG;
		if (sLang == sSessionLang) {
			sSessionShortName = oCampaign.LanguageTexts[ii].SHORT_NAME ? oCampaign.LanguageTexts[ii].SHORT_NAME : oCampaign.LanguageTexts[ii].NAME;
		}
		if (sLang == sSystemDefaultLang) {
			sSystemDefaultShortName = oCampaign.LanguageTexts[ii].SHORT_NAME ? oCampaign.LanguageTexts[ii].SHORT_NAME : oCampaign.LanguageTexts[ii].NAME;
		}
	}

	oCampaign.SHORT_NAME = sSessionShortName ? sSessionShortName : sSystemDefaultShortName;
}

function updateTitles(vKey, oCampaign, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var textBundle = $.import("sap.ino.xs.xslib", "textBundle");

	for (var ii = 0; ii < oCampaign.LanguageTexts.length; ++ii) {
		var sName = oCampaign.LanguageTexts[ii].NAME;
		var sShortName = oCampaign.LanguageTexts[ii].SHORT_NAME;
		var sLang = oCampaign.LanguageTexts[ii].LANG;

		var sPrefix = textBundle.getText("uitexts", "BO_CAMPAIGN_COPY_PREFIX", [], sLang, false, oContext.getHQ());

		sName = sPrefix + sName;
		sShortName = sPrefix + sShortName;

		// check length
		var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("LanguageTexts");
		sName = sName.substr(0, oMeta.attributes.NAME.maxLength);
		sShortName = sShortName.substr(0, oMeta.attributes.SHORT_NAME.maxLength);

		oCampaign.LanguageTexts[ii].NAME = sName;
		oCampaign.LanguageTexts[ii].SHORT_NAME = sShortName;
	}
}

function updateCounts(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	oCampaign.PHASE_COUNT = _.size(oCampaign.Phases || []);
	// Page count currently not language dependent
	oCampaign.PAGE_COUNT = _.size(oCampaign.LanguagePages || []);
}

function updatePhases(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	// we only show this message once
	var bDuplicate = false;
	var iNextSeq;
	var iNextIdx;

	for (var ii = 0; ii < oCampaign.Phases.length; ++ii) {
		var iCurrentSeq = oCampaign.Phases[ii].SEQUENCE_NO;

		if (typeof iCurrentSeq !== "number") {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PHASE_SEQUENCE_INVALID, vKey, "Phases", "SEQUENCE_NO", iCurrentSeq,
				oCampaign.Phases[ii].PHASE_CODE);
			continue;
		}

		iNextSeq = undefined;
		iNextIdx = undefined;
		for (var jj = 0; jj < oCampaign.Phases.length; ++jj) {
			var iSeq = oCampaign.Phases[jj].SEQUENCE_NO;
			if (ii !== jj && iCurrentSeq === iSeq) {
				if (!bDuplicate) {
					addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_DUPLICATE_PHASE_SEQUENCE, vKey, "Phases", "SEQUENCE_NO");
					bDuplicate = true;
				}
			} else if (iCurrentSeq < iSeq && (iNextSeq === undefined || iNextSeq > iSeq)) {
				iNextSeq = iSeq;
				iNextIdx = jj;
			}
		}
		oCampaign.Phases[ii].NEXT_PHASE_CODE = (iNextSeq !== undefined) ? oCampaign.Phases[iNextIdx].PHASE_CODE : null;
	}
}

function submit(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext) {
	validPhaseReward(vKey, oCampaign, null, addMessage, getNextHandle, oContext);
	validRewardUnitCode(vKey, oCampaign, null, addMessage, getNextHandle, oContext);
	validCampTasks(vKey, oCampaign, null, addMessage, getNextHandle, oContext);
	oCampaign.STATUS_CODE = Status.Published;
}

function majorpublish(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext, oMetadataAccess, fnVisitObject) {
	var oPersistedCampaign = _.copyDeep(oCampaign);
	oCampaign = _mergeObjects(oCampaign, oParameters, oMetadataAccess, addMessage, fnVisitObject, oContext);
	updateExecutionCheck(vKey, oParameters, oCampaign, oPersistedCampaign, addMessage, oContext);

}

function _getNodeName(sKey) {
	return (sKey === undefined) ? Metadata.Node.Root : sKey;
}

function isHandle(vValue) {
	return !vValue || parseInt(vValue) < 0;
}

function _mergeObjects(oDestination, oSource, oMetadataAccess, oMessageBuffer, fnVisitObject, oRequestContext) {

	_.visitInstanceTree(oSource, function(oSourceObject, sKey, bObjectInArray, oContext) {
		var sNodeName = _getNodeName(sKey);
		var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
		if (!oNodeMetadata) {
			oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
			return {
				key: sKey,
				destinationObject: {}
			};
		}
		var bReadOnly = oNodeMetadata.readOnly;

		var vKey;
		var oDestinationObject;

		if (!oContext || bObjectInArray) {

			// Root node
			if (!oContext) {
				oDestinationObject = oDestination;
				vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
				bReadOnly = bReadOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(vKey, oDestinationObject, oMessageBuffer.addMessage,
					oRequestContext, oNodeMetadata));
			} else {
				var vSourceKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
				oDestinationObject = _.find(oContext.allDestinationObjects, function(oDestinationObject) {
					return vSourceKey === oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
				});
				if (oDestinationObject) {
					// Read only check has been done in call for array
					bReadOnly = bReadOnly || !_.isUndefined(_.find(oContext.readOnlyDestinationObjects, function(oDestinationObject) {
						return vSourceKey === oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
					}));
				} else {
					// New instance
					if (!isHandle(vSourceKey)) {
						oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_INSTANCE_UNKNOWN, vSourceKey, sNodeName, oNodeMetadata.primaryKey,
							vSourceKey, sNodeName);
					}
					bReadOnly = bReadOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(undefined, {}, oMessageBuffer.addMessage,
						oRequestContext, oNodeMetadata));
				}
			}

			if (!bReadOnly) {

				var oCleanSourceObject = {};
				vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);

				_.each(oNodeMetadata.attributes, function(oMetadataAttribute) {
					if (_.has(oSourceObject, oMetadataAttribute.name)) {
						var bAttrChanged = !_.has(oDestinationObject || {}, oMetadataAttribute.name) || !_.isEqual(oDestinationObject[oMetadataAttribute.name],
							oSourceObject[oMetadataAttribute.name]);

						if (bAttrChanged && oMetadataAttribute.readOnly) {
							oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.ATTRIBUTE_READ_ONLY, vKey, sNodeName, oMetadataAttribute.name,
								oMetadataAttribute.name);
						} else if (bAttrChanged && oMetadataAttribute.checkReadOnly && oMetadataAttribute.checkReadOnly(vKey, oDestinationObject,
							oMessageBuffer.addMessage, oRequestContext, oNodeMetadata)) {
							oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.ATTRIBUTE_READ_ONLY, vKey, sNodeName, oMetadataAttribute.name,
								oMetadataAttribute.name);
						} else {
							oCleanSourceObject[oMetadataAttribute.name] = oSourceObject[oMetadataAttribute.name];
						}
					}
				});

				// Set constant key values
				_.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
					oCleanSourceObject[sAttributeName] = sValue;
				});

				if (oDestinationObject) {
					_.extend(oDestinationObject, oCleanSourceObject);
				} else {
					oDestinationObject = oCleanSourceObject;
				}
				if (oContext) {
					oContext.destinationObjects.push(oDestinationObject);
				}

				if (fnVisitObject) {
					vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
					fnVisitObject(vKey, oCleanSourceObject, sNodeName);
				}

			} else {
				if (!!_.find(oNodeMetadata.persistedAttributes, function(sAttributeName) {
					return sAttributeName !== oNodeMetadata.primaryKey && _.has(oSourceObject, sAttributeName);
				})) {
					vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
					oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.NODE_READ_ONLY, vKey, sNodeName, undefined, sNodeName);
				}
			}

			return {
				key: sKey,
				destinationObject: oDestinationObject
			};

		} else {

			oDestinationObject = oContext.destinationObject;

			var aAllDestinationChildObject = [];
			var aReadOnlyDestinationChildObject = [];

			if (oDestinationObject && oDestinationObject[sNodeName]) {
				aAllDestinationChildObject = oDestinationObject[sNodeName];
				aReadOnlyDestinationChildObject = _.filter(aAllDestinationChildObject, function(oDestinationChildObject) {
					var vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationChildObject);
					var bReadOnly = oNodeMetadata.readOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(vKey, oDestinationChildObject,
						oMessageBuffer.addMessage, oRequestContext, oNodeMetadata));
					if (bReadOnly) {
						// Set only constant key values
						_.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
							oDestinationChildObject[sAttributeName] = sValue;
						});
					}
					return bReadOnly;
				});
			}

			oDestinationObject[sNodeName] = _.clone(aReadOnlyDestinationChildObject);

			return {
				key: sKey,
				destinationObjects: oDestinationObject[sNodeName],
				readOnlyDestinationObjects: aReadOnlyDestinationChildObject,
				allDestinationObjects: aAllDestinationChildObject
			};
		}
	});

	return oDestination;
}

function updateExecutionCheck(vKey, oChangeRequest, oCampaign, oPersistedCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE === Status.Published) {
		// there are some properties that must not be changed in a published campaign
		if (oChangeRequest.Attachments && !_.findWhere(oCampaign.Attachments, {
			ROLE_TYPE_CODE: "CAMPAIGN_DETAIL_IMG"
		})) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_TITLE_IMAGE_ERR, vKey, "Root", "CAMPAIGN_IMAGE_ID");
		}
		// the already existing phases need to be unchanged, except...
		// changes of flags are ok
		// the evaluation model may be changed
		// new phases are ok, the order may be changed
		if (oChangeRequest.Phases) {
			_.each(oPersistedCampaign.Phases, function(oPersistedPhase) {
				var oChangePhase = _.findWhere(oChangeRequest.Phases, {
					ID: oPersistedPhase.ID
				});
				if (!oChangePhase) {
					addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_PHASE_DELETE_ERR, oPersistedPhase.ID, "Phases", "ID",
						oPersistedPhase.ID);
				} else {
					if (oChangePhase.hasOwnProperty("PHASE_CODE") && oChangePhase.PHASE_CODE !== oPersistedPhase.PHASE_CODE) {
						addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_PHASE_CHANGE_ERR, oPersistedPhase.ID, "Phases", "PHASE_CODE",
							oPersistedPhase.PHASE_CODE, oChangePhase.PHASE_CODE);
					}
					if (oChangePhase.hasOwnProperty("STATUS_MODEL_CODE") && oChangePhase.STATUS_MODEL_CODE !== oPersistedPhase.STATUS_MODEL_CODE) {
						addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PUBLISH_PHASE_CHANGE_ERR, oPersistedPhase.ID, "Phases",
							"STATUS_MODEL_CODE", oPersistedPhase.STATUS_MODEL_CODE, oChangePhase.STATUS_MODEL_CODE);
					}
				}
			});
		}

		if (oPersistedCampaign.RESP_CODE && oChangeRequest.RESP_CODE && oChangeRequest.RESP_CODE !== oPersistedCampaign.RESP_CODE) {
			checkRespList(vKey, oCampaign, addMessage, oContext);
		}
		checkForAnonymousIdea(vKey, oCampaign, addMessage, oContext);
		adjustLanguageTexts(vKey, oCampaign);
		checkLanguageTexts(vKey, oCampaign, addMessage, oContext);
		validPhaseReward(vKey, oCampaign, oPersistedCampaign, addMessage, null, oContext);
		validRewardUnitCode(vKey, oCampaign, oPersistedCampaign, addMessage, null, oContext);
		validCampTasks(vKey, oCampaign, oPersistedCampaign, addMessage, null, oContext);
	}
}

function checkForAnonymousIdea(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.IS_OPEN_ANONYMOUS_FUNCTION === 0) {
		var oStatment = oContext.getHQ().statement(
			"select setting.anonymous_for from\"sap.ino.db.idea::t_idea\" as idea left outer join \"sap.ino.db.idea::t_ideas_setting\" as setting on idea.id = setting.idea_id where campaign_id = ? and setting.anonymous_for != \'NONE\'"
		);
		var aResult = oStatment.execute(oCampaign.ID);
		if (aResult.length > 0) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMP_ANONYMOUS_FUNCTION_UNCHANGEABLE, oCampaign.ID);
		}
	}
}

function checkRespList(vKey, oCampaign, addMessage, oContext) {
	var oStatment = oContext.getHQ().statement(
		'select Top 1 1 from "sap.ino.db.idea::t_idea" where CAMPAIGN_ID = ? and status_code != \'sap.ino.config.DRAFT\'');
	var aResult = oStatment.execute(oCampaign.ID);
	if (aResult.length > 0) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMP_RESP_LIST_UNCHANGABLE, oCampaign.ID);
	}
}

function adjustLanguageTexts(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	for (var ii = 0; ii < oCampaign.LanguageTexts.length; ++ii) {
		if (!oCampaign.LanguageTexts[ii].NAME && !oCampaign.LanguageTexts[ii].SHORT_NAME && !oCampaign.LanguageTexts[ii].DESCRIPTION && !
			oCampaign.LanguageTexts[ii].IDEA_DESCRIPTION_TEMPLATE) {
			oCampaign.LanguageTexts.splice(ii, 1);
			--ii;
		}
	}
}

function handleBlackbox(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oCampaign.IS_BLACK_BOX || oCampaign.Participants.length === 0) {
		oCampaign.IdeaReaders = [];
	} else if (!oCampaign.IS_BLACK_BOX && oCampaign.Participants.length > 0) {
		if (!oPersistedObject || _.difference(oCampaign.Participants, oPersistedObject.Participants).length > 0) {
			oCampaign.IdeaReaders = _.map(oCampaign.Participants, function(oIdentity) {
				var oNewIdentity = _.clone(oIdentity);
				oNewIdentity.ROLE_CODE = "CAMPAIGN_IDEA_READER";
				oNewIdentity.ID = getNextHandle();
				return oNewIdentity;
			});
		}
	}
}

function checkLanguageTexts(vKey, oCampaign, addMessage, oContext) {
	var iSeverity = oCampaign.STATUS_CODE == Status.Published ? Message.MessageSeverity.Error : Message.MessageSeverity.Warning;
	for (var ii = 0; ii < oCampaign.LanguageTexts.length; ++ii) {
		if (!oCampaign.LanguageTexts[ii].NAME || oCampaign.LanguageTexts[ii].NAME === "") {
			addMessage(iSeverity, CampMessage.CAMPAIGN_LANGUAGE_INCOMPLETE_TITLE, oCampaign.LanguageTexts[ii].ID, "LanguageTexts", "NAME",
				"{code>sap.ino.xs.object.basis.Language.Root:" + i18n.getLanguageCodeForIso(oContext.getHQ(), oCampaign.LanguageTexts[ii].LANG) + "}");
		}
		if (!oCampaign.LanguageTexts[ii].SHORT_NAME || oCampaign.LanguageTexts[ii].SHORT_NAME === "") {
			addMessage(iSeverity, CampMessage.CAMPAIGN_LANGUAGE_INCOMPLETE_SHORT_TITLE, oCampaign.LanguageTexts[ii].ID, "LanguageTexts",
				"SHORT_NAME", "{code>sap.ino.xs.object.basis.Language.Root:" + i18n.getLanguageCodeForIso(oContext.getHQ(), oCampaign.LanguageTexts[ii]
					.LANG) + "}");
		}
	}
}

function languageTextDefined(vKey, oCampaign, addMessage, oContext) {
	checkLanguageTexts(vKey, oCampaign, addMessage, oContext);

	var sDefaultLanguage = i18n.getSystemDefaultLanguage(oContext.getHQ());
	var bDefaultSuccess = false;
	if (oCampaign.LanguageTexts.length > 0) {
		for (var ii = 0; ii < oCampaign.LanguageTexts.length; ++ii) {
			if (oCampaign.LanguageTexts[ii].LANG === sDefaultLanguage) {
				bDefaultSuccess = true;
				break;
			}
		}

		if (!bDefaultSuccess) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_DEFAULT_LANGUAGE_MANDATORY, vKey, "LanguageTexts", "LANG",
				"{code>sap.ino.xs.object.basis.Language.Root:" + i18n.getLanguageCodeForIso(oContext.getHQ(), sDefaultLanguage) + "}");
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_DEFAULT_LANGUAGE_MANDATORY, vKey, "LanguageTexts", "LANG",
			"{code>sap.ino.xs.object.basis.Language.Root:" + i18n.getLanguageCodeForIso(oContext.getHQ(), sDefaultLanguage) + "}");
	}

}

function generalConsistencyCeck(vKey, oCampaign, addMessage, oContext) {
	if (!oCampaign.COLOR_CODE || oCampaign.COLOR_CODE.length !== 6 || !(/^[0-9A-F]{6}$/i.test(oCampaign.COLOR_CODE))) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_COLOR_CODE, vKey, "Root", "COLOR_CODE", oCampaign.COLOR_CODE);
	}
	// the other codes are checked via the foreign key propertiy
}

function rolesDefined(vKey, oCampaign, addMessage, oContext) {
	if (!oCampaign.Managers || oCampaign.Managers.length < 1) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ONE_CAMPAIGN_MANAGER_RECOMMENDED, vKey);
	}
	if (!oCampaign.RESP_CODE && (!oCampaign.Coaches || oCampaign.Coaches.length < 1)) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ONE_COACH_RECOMMENDED, vKey);
	}
	if (!oCampaign.RESP_CODE && (!oCampaign.Experts || oCampaign.Experts.length < 1)) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ONE_EXPERT_RECOMMENDED, vKey);
	}
	if (!oCampaign.Participants || oCampaign.Participants.length < 1) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ONE_PARTICIPANT_RECOMMENDED, vKey);
	}
}

function phasesDefined(vKey, oCampaign, addMessage, oContext) {
	if (!oCampaign.Phases || oCampaign.Phases.length === 0) {
		var iSeverity = (oCampaign.STATUS_CODE == Status.Draft) ? Message.MessageSeverity.Warning : Message.MessageSeverity.Error;
		addMessage(iSeverity, CampMessage.CAMPAIGN_ONE_PHASE_MANDATORY, vKey, "Phases");
	}

	var aDuplicateCodes = [];

	for (var ii = 0; ii < oCampaign.Phases.length; ++ii) {
		if (aDuplicateCodes.indexOf(oCampaign.Phases[ii].PHASE_CODE) == -1) {
			if (_.where(oCampaign.Phases, {
				PHASE_CODE: oCampaign.Phases[ii].PHASE_CODE
			}).length > 1) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PHASE_DUPLICATION, vKey, "Phases", "PHASE_CODE", oCampaign.Phases[ii].PHASE_CODE);
				aDuplicateCodes.push(oCampaign.Phases[ii].PHASE_CODE);
			}
		}
	}
}

function titleImageDefined(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.Attachments.length === 0 || !_.findWhere(oCampaign.Attachments, {
		ROLE_TYPE_CODE: "CAMPAIGN_DETAIL_IMG"
	})) {
		// title image can only be empty for draft campaigns
		var iSeverity = (oCampaign.STATUS_CODE == Status.Draft) ? Message.MessageSeverity.Warning : Message.MessageSeverity.Error;
		addMessage(iSeverity, CampMessage.CAMPAIGN_IMAGE_MANDATORY, vKey, "Root", "CAMPAIGN_IMAGE_ID");
	}
}

function validateDates(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oCampaign.SUBMIT_FROM && oCampaign.SUBMIT_TO && !date.isInSequence(oCampaign.SUBMIT_FROM, oCampaign.SUBMIT_TO)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_SUBMIT_PERIOD, vKey, "Root", "SUBMIT_TO");
	}
	if (0 > date.getRelationToNow(oCampaign.SUBMIT_TO) && oCampaign.SUBMIT_TO) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_SUBMIT_PERIOD_PAST, vKey, "Root", "SUBMIT_TO");
	}

	if (!date.isInSequence(oCampaign.VALID_FROM, oCampaign.VALID_TO)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_VALIDITY, vKey, "Root", "VALID_TO");
	}
	if (0 > date.getRelationToNow(oCampaign.VALID_TO)) {
		addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_VALIDITY_PAST, vKey, "Root", "VALID_TO");
	}

	if (oCampaign.SUBMIT_FROM && !date.isInSequence(oCampaign.VALID_FROM, oCampaign.SUBMIT_FROM)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_SUBMIT_PERIOD, vKey, "Root", "SUBMIT_FROM");
	}
	if (oCampaign.SUBMIT_TO && !date.isInSequence(oCampaign.SUBMIT_TO, oCampaign.VALID_TO)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_SUBMIT_PERIOD, vKey, "Root", "SUBMIT_TO");
	}

	if (!oCampaign.REGISTER_FROM && !oCampaign.SUBMIT_FROM) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_SUBMIT_FROM_MANDATORY, vKey);
	}
	if (oCampaign.REGISTER_FROM && !oCampaign.REGISTER_TO) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_TO_MANDATORY, vKey, "Root", "REGISTER_TO", oCampaign.REGISTER_TO);
	}
	if (oCampaign.SUBMIT_FROM && !oCampaign.SUBMIT_TO) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_SUBMIT_TO_MANDATORY, vKey, "Root", "SUBMIT_TO", oCampaign.SUBMIT_TO);
	}
	if (oCampaign.REGISTER_FROM && !date.isInSequence(oCampaign.VALID_FROM, oCampaign.REGISTER_FROM)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_PERIOD, vKey, "Root", "REGISTER_FROM");
	}
	if (oCampaign.REGISTER_TO && !date.isInSequence(oCampaign.REGISTER_TO, oCampaign.VALID_TO)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_PERIOD, vKey, "Root", "REGISTER_TO");
	}
	if (oCampaign.REGISTER_FROM && oCampaign.REGISTER_TO && !date.isInSequence(oCampaign.REGISTER_FROM, oCampaign.REGISTER_TO)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REGISTER_PERIOD, vKey, "Root", "REGISTER_TO");
	}
}

function validatePages(vKey, oCampaign, addMessage, oContext) {
	for (var ii = 0; ii < oCampaign.LanguagePages.length; ++ii) {
		var sCode = i18n.getLanguageCodeForIso(oContext.getHQ(), oCampaign.LanguagePages[ii].LANG);
		if (!oCampaign.LanguagePages[ii].TITLE || oCampaign.LanguagePages[ii].TITLE === "") {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PAGE_INCOMPLETE_TITLE, oCampaign.LanguagePages[ii].ID, "LanguagePages",
				"TITLE", "{code>sap.ino.xs.object.basis.Language.Root:" + sCode + "}");
		}
		if (!oCampaign.LanguagePages[ii].HTML_CONTENT || oCampaign.LanguagePages[ii].HTML_CONTENT === "") {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PAGE_INCOMPLETE_CONTENT, oCampaign.LanguagePages[ii].ID, "LanguagePages",
				"HTML_CONTENT", "{code>sap.ino.xs.object.basis.Language.Root:" + sCode + "}");
		}
		if (_.where(oCampaign.LanguagePages, {
			PAGE_NO: oCampaign.LanguagePages[ii].PAGE_NO,
			LANG: oCampaign.LanguagePages[ii].LANG
		}).length > 1) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PAGE_DUPLICATION, vKey, "LanguagePages", "LANG",
				"{code>sap.ino.xs.object.basis.Language.Root:" + sCode + "}");
// 			addMessage(Message.MessageSeverity.Error,  "MSG:"+ii+",no:"+oCampaign.LanguagePages[ii].PAGE_NO+",lang:"+ oCampaign.LanguagePages[ii].LANG);
		}
	}
}

function saveEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE == Status.Published) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ONLY_PUBLISH, vKey);
	}
}

function deleteEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	var hq = oContext.getHQ();
	var sSelect = 'select TOP 1 * from "sap.ino.db.idea::t_idea" where campaign_id = ? and status_code <> ? ';
	var result = hq.statement(sSelect).execute(oCampaign.ID, 'sap.ino.config.DRAFT');
	if (result.length > 0) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_DELETE_NOT_EMPTY, vKey);
	}
}

function replaceVoteType(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext) {

	if (oParameters && oParameters.VOTE_TYPE_CODE) {
		var VoteType = AOF.getApplicationObject("sap.ino.xs.object.campaign.VoteType");
		if (VoteType.exists(oParameters.VOTE_TYPE_CODE)) {
			oCampaign.VOTE_TYPE_CODE = oParameters.VOTE_TYPE_CODE;

			var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
			var oResponse = Idea.bulkDeleteVotes({
				CAMPAIGN_ID: oCampaign.ID
			});

			addMessage(oResponse.messages);
		} else {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_VOTE_TYPE, vKey, "Root", "VOTE_TYPE_CODE", oParameters.VOTE_TYPE_CODE);
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PARAMETER_REQUIRED, vKey, "Root", "VOTE_TYPE_CODE",
			"VOTE_TYPE_CODE");
	}
}

function replaceVoteTypeEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE !== Status.Published) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_ONLY_PUBLISHED, vKey);
	}
}

function replaceVoteTypeProperties(vKey, oParameters, oCampaign, addMessage, oContext) {

	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oCount = Idea.staticProperties({
		actions: [{
			name: "bulkDeleteVotes",
			parameters: {
				CAMPAIGN_ID: oCampaign.ID
			}
        }]
	});

	addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ADVANCE_CHANGE_VOTING_DELETE, vKey);

	return {
		"AFFECTED_IDEAS": oCount.actions.bulkDeleteVotes.customProperties.AFFECTED_IDEAS,
		"AFFECTED_VOTES": oCount.actions.bulkDeleteVotes.customProperties.AFFECTED_VOTES
	};
}

function replacePhaseCode(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.PHASE_CODE && oParameters.NEW_PHASE_CODE) {

		var Phase = AOF.getApplicationObject("sap.ino.xs.object.campaign.Phase");
		var bPhaseValid = Phase.exists(oParameters.PHASE_CODE);
		var bNewPhaseValid = Phase.exists(oParameters.NEW_PHASE_CODE);

		if (!bPhaseValid || !bNewPhaseValid) {
			if (!bPhaseValid) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_PHASE_CODE, vKey, "Phases", "PHASE_CODE", oParameters.PHASE_CODE);
			}
			if (!bNewPhaseValid) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_PHASE_CODE, vKey, "Phases", "NEW_PHASE_CODE", oParameters.NEW_PHASE_CODE);
			}
		} else {

			var oPhase = _.findWhere(oCampaign.Phases, {
				PHASE_CODE: oParameters.PHASE_CODE
			});

			var oNewPhase = _.findWhere(oCampaign.Phases, {
				PHASE_CODE: oParameters.NEW_PHASE_CODE
			});

			if (oPhase) {
				if (!oNewPhase || oParameters.NEW_PHASE_CODE === oParameters.PHASE_CODE) {
					oPhase.PHASE_CODE = oParameters.NEW_PHASE_CODE;

					var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
					var oResponse = Idea.bulkReplacePhaseCode({
						CAMPAIGN_ID: oCampaign.ID,
						CURRENT_PHASE_CODE: oParameters.PHASE_CODE,
						NEW_PHASE_CODE: oParameters.NEW_PHASE_CODE,
						RESET_STATUS_CODE: false
					});

					addMessage(oResponse.messages);
				} else {
					addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_PHASE_DUPLICATION, vKey, "Phases", "PHASE_CODE", oParameters.NEW_PHASE_CODE);
				}
			} else {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PHASE_NOT_FOUND, vKey, "Phases", "PHASE_CODE",
					oParameters.PHASE_CODE);
			}
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PARAMETER_REQUIRED, vKey, "Phases", "PHASE_CODE",
			"PHASE_CODE, NEW_PHASE_CODE");
	}

}

function replacePhaseCodeEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE !== Status.Published) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_ONLY_PUBLISHED, vKey);
	}
}

function replacePhaseCodeProperties(vKey, oParameters, oCampaign, addMessage, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oResult = {};

	_.each(oCampaign.Phases, function(oPhase) {
		var oCount = Idea.staticProperties({
			actions: [{
				name: "bulkReplacePhaseCode",
				parameters: {
					CAMPAIGN_ID: oCampaign.ID,
					CURRENT_PHASE_CODE: oPhase.PHASE_CODE
				}
            }]
		});

		oResult[oPhase.PHASE_CODE] = {
			AFFECTED_COUNT: oCount.actions.bulkReplacePhaseCode.customProperties
		};
	});

	addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PHASE_CODE_CHANGE, vKey);

	return {
		"Phases": oResult
	};
}

function replaceStatusModelCode(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.PHASE_CODE && oParameters.NEW_STATUS_MODEL_CODE) {

		var Phase = AOF.getApplicationObject("sap.ino.xs.object.campaign.Phase");
		var bPhaseValid = Phase.exists(oParameters.PHASE_CODE);

		var StatusModel = AOF.getApplicationObject("sap.ino.xs.object.idea.StatusModel");
		var bStatusModelValid = StatusModel.exists(oParameters.NEW_STATUS_MODEL_CODE);

		if (!bPhaseValid || !bStatusModelValid) {
			if (!bPhaseValid) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_PHASE_CODE, vKey, "Phases", "PHASE_CODE", oParameters.PHASE_CODE);
			}
			if (!bStatusModelValid) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_STATUS_MODEL_CODE, vKey, "Phases", "NEW_STATUS_MODEL_CODE",
					oParameters.NEW_STATUS_MODEL_CODE);
			}
		} else {
			var oPhase = _.findWhere(oCampaign.Phases, {
				PHASE_CODE: oParameters.PHASE_CODE
			});

			if (oPhase) {
				var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
				var oResponse = Idea.bulkAdaptStatusCode({
					CAMPAIGN_ID: oCampaign.ID,
					CURRENT_PHASE_CODE: oParameters.PHASE_CODE,
					NEW_STATUS_MODEL_CODE: oParameters.NEW_STATUS_MODEL_CODE
				});

				addMessage(oResponse.messages);
				oPhase.CampaignNotificationStatus = [];
				if (oCampaign.Phases && oCampaign.Phases.length > 0) {
					var oExistsPhase = _.findWhere(oCampaign.Phases, {
						STATUS_MODEL_CODE: oParameters.NEW_STATUS_MODEL_CODE
					});
					if (oExistsPhase && oExistsPhase.CampaignNotificationStatus) {
						_.each(oExistsPhase.CampaignNotificationStatus, function(oItem) {
							oPhase.CampaignNotificationStatus.push({
								STATUS_MODEL_CODE: oParameters.NEW_STATUS_MODEL_CODE,
								STATUS_ACTION_CODE: oItem.STATUS_ACTION_CODE,
								TEXT_MODULE_CODE: oItem.TEXT_MODULE_CODE
							});
						});
					}
				}
				oPhase.STATUS_MODEL_CODE = oParameters.NEW_STATUS_MODEL_CODE;

			} else {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PHASE_NOT_FOUND, vKey, "Phases", "PHASE_CODE",
					oParameters.PHASE_CODE);
			}
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PARAMETER_REQUIRED, vKey, "Phases", "PHASE_CODE",
			"PHASE_CODE, NEW_STATUS_MODEL_CODE");
	}
}

function replaceStatusModelCodeEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE !== Status.Published) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_ONLY_PUBLISHED, vKey);
	}
}

function replaceStatusModelCodeProperties(vKey, oParameters, oCampaign, addMessage, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oResult = {};

	_.each(oCampaign.Phases, function(oPhase) {
		var oNewCounts = Idea.staticProperties({
			actions: [{
				name: "bulkAdaptStatusCode",
				parameters: {
					CAMPAIGN_ID: oCampaign.ID,
					CURRENT_PHASE_CODE: oPhase.PHASE_CODE
				}
            }]
		});

		var oAllCount = Idea.staticProperties({
			actions: [{
				name: "bulkReplacePhaseCode",
				parameters: {
					CAMPAIGN_ID: oCampaign.ID,
					CURRENT_PHASE_CODE: oPhase.PHASE_CODE
				}
            }]
		});

		oResult[oPhase.PHASE_CODE] = {
			AFFECTED_NEW_COUNTS: oNewCounts.actions.bulkAdaptStatusCode.customProperties,
			AFFECTED_COUNT: oAllCount.actions.bulkReplacePhaseCode.customProperties
		};
	});

	addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ADVANCE_CHANGE_STATUS_MODEL_CODE_CHANGE, vKey, undefined, undefined,
		"{code>sap.ino.xs.object.status.Status.Root:sap.ino.config.NEW_IN_PHASE}");

	return {
		"Phases": oResult
	};
}

function deletePhase(vKey, oParameters, oCampaign, addMessage, getNextHandle, oContext) {
	if (oCampaign.Phases.length < 2) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ONE_PHASE_MANDATORY, vKey, "Phases");
	} else if (oParameters && oParameters.PHASE_CODE) {
		var oHQ = oContext.getHQ();
		var Phase = AOF.getApplicationObject("sap.ino.xs.object.campaign.Phase");

		if (!Phase.exists(oParameters.PHASE_CODE)) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_PHASE_CODE, vKey, "Phases", "PHASE_CODE", oParameters.PHASE_CODE);
		} else {
			var oPhase = _.findWhere(oCampaign.Phases, {
				PHASE_CODE: oParameters.PHASE_CODE
			});

			var sNextPhaseCode = oPhase.NEXT_PHASE_CODE;
			var iSeq = oPhase.SEQUENCE_NO;

			var oPrevPhase = _.findWhere(oCampaign.Phases, {
				NEXT_PHASE_CODE: oParameters.PHASE_CODE
			});

			if (!oPrevPhase) {
				// use the next phase instead
				oPrevPhase = _.findWhere(oCampaign.Phases, {
					PHASE_CODE: sNextPhaseCode
				});

				sNextPhaseCode = oPrevPhase.NEXT_PHASE_CODE;
			}

			oPrevPhase.NEXT_PHASE_CODE = sNextPhaseCode;

			var iIdx = oCampaign.Phases.indexOf(oPhase);
			oCampaign.Phases.splice(iIdx, 1);

			// update the SEQUENCE_NO => triggers the required history event during update
			for (var ii = 0; ii < oCampaign.Phases.length; ++ii) {
				// close the gap
				if (oCampaign.Phases[ii].SEQUENCE_NO > iSeq) {
					oCampaign.Phases[ii].SEQUENCE_NO--;
				}
			}

			var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
			var oResponse = Idea.bulkReplacePhaseCode({
				CAMPAIGN_ID: oCampaign.ID,
				CURRENT_PHASE_CODE: oParameters.PHASE_CODE,
				NEW_PHASE_CODE: oPrevPhase.PHASE_CODE,
				RESET_STATUS_CODE: true
			});

			addMessage(oResponse.messages);

			bulkDeleteEvalReqs(oCampaign.ID, oParameters.PHASE_CODE, oHQ);

			//not support the bulk access delete
			// 			var oEvalReqResponse = EvalReq.bulkDeleteEvalReqs({
			// 			    CAMPAIGN_ID: oCampaign.ID,
			// 			    PHASE_CODE: oParameters.PHASE_CODE
			// 			});

			// 			addMessage(oEvalReqResponse.messages);
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PARAMETER_REQUIRED, vKey, "Phases", "PHASE_CODE",
			"PHASE_CODE");
	}
}

function deletePhaseEnabledCheck(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.STATUS_CODE === Status.Published) {
		if (!oCampaign.Phases || oCampaign.Phases.length < 2) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ONE_PHASE_MANDATORY, vKey, "Phases");
		}
	} else {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ADVANCE_CHANGE_ONLY_PUBLISHED, vKey);
	}
}

function deletePhaseProperties(vKey, oParameters, oCampaign, addMessage, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oResult = {};

	_.each(oCampaign.Phases, function(oPhase) {
		var oCount = Idea.staticProperties({
			actions: [{
				name: "bulkReplacePhaseCode",
				parameters: {
					CAMPAIGN_ID: oCampaign.ID,
					CURRENT_PHASE_CODE: oPhase.PHASE_CODE
				}
            }]
		});

		var oPrevPhase = _.findWhere(oCampaign.Phases, {
			NEXT_PHASE_CODE: oPhase.PHASE_CODE
		});

		if (!oPrevPhase) {
			var sNextPhaseCode = oPhase.NEXT_PHASE_CODE;

			// use the next phase instead
			oPrevPhase = _.findWhere(oCampaign.Phases, {
				PHASE_CODE: sNextPhaseCode
			});
		}

		oResult[oPhase.PHASE_CODE] = {
			AFFECTED_COUNT: oCount.actions.bulkReplacePhaseCode.customProperties,
			NEW_PHASE_CODE: oPrevPhase ? oPrevPhase.PHASE_CODE : ""
		};
	});

	addMessage(Message.MessageSeverity.Warning, CampMessage.CAMPAIGN_ADVANCE_CHANGE_PHASE_DELETE, vKey, undefined, undefined,
		"{code>sap.ino.xs.object.status.Status.Root:sap.ino.config.NEW_IN_PHASE}");

	return {
		"Phases": oResult
	};
}

function rootCustomProperties(vKey, oPersistedCampaign, addMessage, oContext) {
	var fnCreateEvaluationAllowed = auth.instanceAccessCheck("sap.ino.db.evaluation::v_auth_evaluation_create", "CAMPAIGN_ID", CampMessage.AUTH_MISSING_EVALUATION_CREATE);
	var fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_managed_campaign", "ID", CampMessage.AUTH_MISSING_BACKOFFICE_PRIVILEGES);
	var bBackofficeCampaignPrivilege = fnInstanceCheck(oPersistedCampaign.ID || 0, oPersistedCampaign, function() {}, oContext);
	fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_auth_registration_campaign_privilege", "CAMPAIGN_ID", CampMessage.AUTH_MISSING_REGISTER_PRIVILEGES);
	var bRegistrationCampaignPrivilege = fnInstanceCheck(oPersistedCampaign.ID || 0, oPersistedCampaign, function() {}, oContext);
	fnInstanceCheck = auth.instanceAccessCheck("sap.ino.db.campaign::v_auth_campaigns_read", "CAMPAIGN_ID", CampMessage.AUTH_MISSING_REGISTER_PRIVILEGES);
	var bCommunityCampaignPrivilege = fnInstanceCheck(oPersistedCampaign.ID || 0, oPersistedCampaign, function() {}, oContext);
	var bCampaignMgrEditRespPrivilege = fnCampaignMgrEditRespPrivilege(oContext, oPersistedCampaign);
	var oCampaignInstanceRoles = fnCampaignInstanceRoles(oContext, oPersistedCampaign);
	return {
		campaignMgrEditRespPrivilege: bCampaignMgrEditRespPrivilege,
		expertInCampaign: fnCreateEvaluationAllowed(vKey, undefined, function() {}, oContext),
		backofficeCampaignPrivilege: bBackofficeCampaignPrivilege,
		registrationCampaignPrivilege: bRegistrationCampaignPrivilege,
		communityCampaignPrivilege: bCommunityCampaignPrivilege,
		campaignInstanceRoles: oCampaignInstanceRoles
	};
}

function validRewardUnitCode(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	var oCode = SystemSettings.getValue("sap.ino.config.REWARD_UNIT_CODE");
	if (oCampaign.REWARD === 1 && !oCampaign.REWARD_UNIT_CODE && (!oPersistedObject || !oPersistedObject.REWARD_UNIT_CODE)) {
		oCampaign.REWARD_UNIT_CODE = oCode;
	}
	if (oCampaign.REWARD === 1 && !oCampaign.REWARD_UNIT_CODE) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_REWARD_ACTIVE_ALLOWED_MANDATORY, vKey, undefined, undefined);
	}
}

function validPhaseReward(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oCampaign.REWARD === 1) {
		for (var i = 0; i < oCampaign.Phases.length; i++) {
			if (oCampaign.Phases[i].REWARD === 1) {
				return true;
			}
		}
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_ONE_REWARD_PHASE_MANDATORY, vKey, undefined, undefined);
	}
}

function updateRewardRelatedRecord(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oCampaign.REWARD === 0) {
		oCampaign.REWARD_UNIT_CODE = "";
		oCampaign.Phases.forEach(function(val) {
			if (val.REWARD === 1) {
				val.REWARD = 0;
			}
		});
	}
}

function bulkDeleteEvalReqs(iCampaignID, sPhaseCode, oHQ) {
	var sSelectEvalReq =
		'select id from "sap.ino.db.evaluation::v_evaluation_request" \
			                     where campaign_id = ? and idea_phase_code = ?';
	var aResult = oHQ.statement(sSelectEvalReq).execute(iCampaignID, sPhaseCode);
	var EvalReq = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequest");

	_.each(aResult, function(oResult) {
		EvalReq.del(oResult.ID);
	});
}

function determineEvalReqs(vKey, oCampaign, oPersistedCampaign, addMessage, getNextHandle, oContext) {
	if (oPersistedCampaign) {
		//if change the evaluation method to null, the related eval reqs will be deleted
		_.each(oCampaign.Phases, function(oPhase) {
			if (!oPhase.EVALUATION_MODEL_CODE && oPhase.ID > 0) {
				var oPersistedPhase = _.find(oPersistedCampaign.Phases, function(oFindPhase) {
					return oFindPhase.ID == oPhase.ID;
				});
				if (oPersistedPhase && oPersistedPhase.EVALUATION_MODEL_CODE) {
					bulkDeleteEvalReqs(oCampaign.ID, oPersistedPhase.PHASE_CODE, oContext.getHQ());
				}
			}
		});
	}
}

function getTaskNameByCode(sCode, oHQ) {
	return oHQ.statement('select default_text from "sap.ino.db.basis::t_milestone_task" where code = ?').execute(sCode)[0].DEFAULT_TEXT;
}

function validCampTasks(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oCampaign.Tasks && oCampaign.Tasks.length > 0) {
		// 		var ValueOptionList = AOF.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
		// 		var oMonth = ValueOptionList.read('sap.ino.config.MONTH');
		// 		var oQuarter = ValueOptionList.read('sap.ino.config.QUARTER');
		var iMilestoneCount = 0;
		var iTaskCount = 0;
		var oHQ = oContext.getHQ();

		var isValidCampDate = function(aDates) {
			for (var i = 0; i < aDates.length; i++) {
				if (aDates[i] < oCampaign.VALID_FROM || aDates[i] > oCampaign.VALID_TO) {
					return false;
				}
			}

			return true;
		};

		_.each(oCampaign.Tasks, function(oTask) {
			var iTaskMilestoneCount = 0;

			if (oTask.IS_TASK_DISPLAY) {
				iTaskCount++;
			}

			if (oTask.START_DATE >= oTask.END_DATE) {
				addMessage(Message.MessageSeverity.Error, CampMessage.TASK_INVALID_DATE, vKey, "Tasks", "START_DATE", getTaskNameByCode(oTask.TASK_CODE,
					oHQ));
			}

			if (!isValidCampDate([oTask.START_DATE, oTask.END_DATE])) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_TASK_INVALID_DATE, vKey, "Tasks", "START_DATE", getTaskNameByCode(oTask
					.TASK_CODE, oHQ));
			}

			_.each(oTask.Milestones, function(oMilestone) {
				if (oMilestone.IS_MILESTONE_DISPLAY && oTask.IS_TASK_DISPLAY) {
					iMilestoneCount++;
					iTaskMilestoneCount++;
				}

				if (!oMilestone.MILESTONE_NAME || oMilestone.MILESTONE_NAME === "") {
					addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_MILESTONE_NAME_MISSING, vKey, "Milestones", "MILESTONE_NAME");
				}

				if (oMilestone.MILESTONE_DATE < oTask.START_DATE || oMilestone.MILESTONE_DATE > oTask.END_DATE) {
					addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_MILESTONE_INVALID_DATE, vKey, "Milestones", "MILESTONE_DATE",
						oMilestone.MILESTONE_NAME);
				}
			});

			if (iTaskMilestoneCount > 9) {
				addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_TASK_MILESTONE_INVALID_COUNT, vKey, "Tasks", "TASK_CODE",
					getTaskNameByCode(oTask.TASK_CODE, oHQ));
			}

			// 			switch (oTask.DATE_TYPE_CODE) {
			// 				case 'MONTH':
			// 					var iStartMonth = (new Date(oTask.START_DATE)).getMonth() + 1;
			// 					var iEndMonth = (new Date(oTask.END_DATE)).getMonth() + 1;
			// 					var iStartMonthValue = _.find(oMonth.ValueOptions, function(option) {
			// 						return option.CODE === oTask.START_MONTH_CODE;
			// 					}).NUM_VALUE;
			// 					var iEndMonthValue = _.find(oMonth.ValueOptions, function(option) {
			// 						return option.CODE === oTask.END_MONTH_CODE;
			// 					}).NUM_VALUE;

			// 					if (iStartMonth !== iStartMonthValue || iEndMonth !== iEndMonthValue) {
			// 						//addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_TASK_INVALID_DATE);
			// 					}
			// 					break;
			// 				case 'QUARTER':
			// 					break;
			// 				default:
			// 			}
		});

		if (iTaskCount > 5) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_TASK_INVALID_COUNT, vKey, "Tasks");
		}

		if (iMilestoneCount > 15) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_MILESTONE_INVALID_COUNT, vKey, "Milestones");
		}
	}
}

function updateDraftIdea(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (!oContext.getAction() || oContext.getAction().name !== "del") {
		return;
	}
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var hq = oContext.getHQ();
	var sSelect = 'select * from "sap.ino.db.idea::t_idea" where campaign_id = ? and status_code = ? ';
	var result = hq.statement(sSelect).execute(oCampaign.ID, 'sap.ino.config.DRAFT');
	if (result.length > 0) {
		_.each(result, function(oIdea) {
			Idea.reassignCampaign(oIdea.ID, {
				CAMPAIGN_ID: 0
			});
		});
	}
}

function generateVanityCodeForTag(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oContext.getAction() && oContext.getAction().name !== "create" && oContext.getAction().name !== "update" && oContext.getAction().name !==
		"submit" && oContext.getAction().name !== "majorpublish") {
		return;
	}
	if (oCampaign.Tags && oCampaign.Tags.length > 0) {
		var aTags = [];
		_.each(oCampaign.Tags, function(oTag) {
			if (oTag.NAME && (oTag.hasOwnProperty('VANITY_CODE') || !oTag.VANITY_CODE)) {
				if (/^([a-zA-Z]|\d|-|_)+$/.test(oTag.NAME)) {
					oTag.VANITY_CODE = oTag.NAME.substring(0, 29);
				}
				if (oTag.hasOwnProperty('VANITY_CODE') && oTag.VANITY_CODE) {
					aTags.push(" SELECT " + oTag.TAG_ID + "  AS ID, '" + oTag.VANITY_CODE + "' AS VANITY_CODE FROM DUMMY ");
				}
			}
		});
		if (aTags.length > 0) {
			var sSql = 'UPDATE A ' +
				'SET A.VANITY_CODE = B.VANITY_CODE, ' +
				'	 A.CHANGED_AT = CURRENT_UTCTIMESTAMP,  ' +
				'	 A.CHANGED_BY_ID = ? ' +
				'FROM "sap.ino.db.tag::t_tag" AS A ' +
				'	 INNER JOIN ( ' +
				'		 SELECT ID,  ' +
				'			 VANITY_CODE ' +
				'		 FROM ( ' +
				aTags.join(" UNION ALL ") +
				' ) ' +
				'	 ) AS B ' +
				'	 ON A.ID = B.ID; ';
			oContext.getHQ().statement(sSql).execute(oCampaign.CHANGED_BY_ID);
		}
	}
}

function fnCampaignMgrEditRespPrivilege(oContext, oPersistedCampaign) {
	var oHQ = oContext.getHQ();
	var sUserName = $.session.getUsername();
	var sSelect =
		'SELECT TOP 1  1 AS COUNT FROM sys.effective_privileges WHERE USER_NAME = ? AND PRIVILEGE = \'sap.ino.xs.rest.admin.application::execute\' ' +
		' UNION ALL ' +
		' SELECT TOP 1  2 AS COUNT FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS ROLES   ' +
		' INNER JOIN "sap.ino.db.iam::t_identity" AS IDEN ' +
		' ON IDEN.ID = ROLES.IDENTITY_ID AND ROLES.OBJECT_TYPE_CODE = \'CAMPAIGN\' AND ROLES.ROLE_CODE = \'CAMPAIGN_MANAGER\' ' +
		' INNER JOIN "sap.ino.db.subresponsibility::t_responsibility_stage" as RL ' +
		' ON  RL.CREATED_BY_ID = IDEN.ID ' +
		' WHERE IDEN.USER_NAME = ? AND RL.CODE= ? ' +
		' UNION ALL ' +
		' SELECT TOP 1 3 AS COUNT FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS ROLES   ' +
		' INNER JOIN "sap.ino.db.iam::t_identity" AS IDEN ' +
		' ON IDEN.ID = ROLES.IDENTITY_ID ' +
		' INNER JOIN "sap.ino.db.campaign::t_campaign" AS CAMPAIGN ' +
		' ON CAMPAIGN.ID = ROLES.OBJECT_ID AND ROLES.OBJECT_TYPE_CODE = \'CAMPAIGN\' AND ROLES.ROLE_CODE = \'CAMPAIGN_MANAGER\' ' +
		' INNER JOIN "sap.ino.db.subresponsibility::t_responsibility_stage" AS RL ' +
		' ON  CAMPAIGN.RESP_CODE = RL.CODE ' +
		' WHERE IDEN.USER_NAME = ? AND RL.IS_MANAGER_PUBLIC = 1 AND CAMPAIGN.ID = ?';
	var result = oHQ.statement(sSelect).execute(
		sUserName,
		sUserName,
		oPersistedCampaign.RESP_CODE,
		sUserName,
		oPersistedCampaign.ID
	);
	if (result.length <= 0) {
		return false;
	}
	return true;
}

function fnCampaignInstanceRoles(oContext, oPersistedCampaign) {
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.campaign.ext::v_ext_campaign_instance_roles" WHERE CAMPAIGN_ID = ?';
	return oHQ.statement(sSelect).execute(oPersistedCampaign.ID);
}

function onCampaignIntegration(vKey, oCampaign, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (!oPersistedObject || !oCampaign) {
		return;
	}
	var aNewCampaignIntegration = _.pluck(oCampaign.CampaignIntegration, 'ID');
	var aPersistedCampaignIntegration = oPersistedObject.CampaignIntegration;
	var aDeleteApi = [];

	aPersistedCampaignIntegration.forEach(function(element) {
		if (!~aNewCampaignIntegration.indexOf(element.ID)) {
			aDeleteApi.push(element);
		}
	});

	if (aDeleteApi.length > 0) {
		var LayoutAO = AOF.getApplicationObject("sap.ino.xs.object.integration.LayoutOfIntegrationApi");
		aDeleteApi.forEach(function(element) {
			const sApiId = element.ID;
			if (element.AttributesLayout.length > 0) {
				element.AttributesLayout.forEach(function(layoutItem) {
					LayoutAO.create({
						ID: -1,
						API_ID: sApiId,
						MAPPING_FIELD_CODE: layoutItem.MAPPING_FIELD_CODE,
						DISPLAY_SEQUENCE: layoutItem.DISPLAY_SEQUENCE,
						DISPLAY_NAME: layoutItem.DISPLAY_NAME
					});
				});
			}
		});
	}

}

function validCampIntegrationAttLayout(vKey, oCampaign, oPersistedCampaign, addMessage, getNextHandle, oContext) {

	var aCampaignIntegration = oCampaign.CampaignIntegration;
	if (aCampaignIntegration) {
		//  for(var i = 0; i < aCampaignIntegration.length; i++){
		_.each(aCampaignIntegration, function(oCampaignIntegration, i) {
			if (oCampaignIntegration.AttributesLayout) {
				_.each(oCampaignIntegration.AttributesLayout, function(oAttribute, index) {

					if (!oAttribute.MAPPING_FIELD_CODE || !oAttribute.DISPLAY_NAME) {
						return addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INTEGRATION_LAYOUT_FIELD_NULL, vKey, "AttributesLayout",
							"DISPLAY_NAME");
					} else if (oAttribute.MAPPING_FIELD_CODE && oAttribute.MAPPING_FIELD_CODE.trim().length === 0) {
						return addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INTEGRATION_LAYOUT_FIELD_BLANK, vKey, "AttributesLayout",
							"MAPPING_FIELD_CODE");
					} else if (oAttribute.DISPLAY_NAME && oAttribute.DISPLAY_NAME.trim().length === 0) {
						return addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INTEGRATION_LAYOUT_FIELD_BLANK, vKey, "AttributesLayout",
							"DISPLAY_NAME");
					}

				});
			}
		});
		//  }
	}
}

function determinIntegrationAdminData(vKey, oWorkObject, oPersistedObject, fnMessage, fnHandle, oContext) {
	var sNowISO = oContext.getRequestTimestamp();

	var oUser = oContext.getUser();
	var iUserId = oUser && oUser.ID;

	oWorkObject.CampaignIntegration.forEach(function(oCampIntegr) {
		if (!oCampIntegr.CREATED_AT) {
			oCampIntegr.CREATED_AT = sNowISO;
			oCampIntegr.CREATED_BY_ID = iUserId;
		}
	});
}

function checkDuplicationForVanityCode(vKey, oCampaign, addMessage, oContext) {
	if (oCampaign.VANITY_CODE) {
		var oHQ = oContext.getHQ();
		var aAltKeyDuplicate = oHQ.statement('SELECT camp.ID, ' + 
'	camp_t.NAME ' +
'FROM "sap.ino.db.campaign::t_campaign" AS camp ' +
'	INNER JOIN "sap.ino.db.campaign::t_campaign_t" AS camp_t ' +
'	ON camp.id = camp_t.campaign_id ' +
'	INNER JOIN "sap.ino.db.basis::v_sys_default_language" AS LANG ' +
'	ON camp_t.LANG = LANG.ISO_CODE ' +
'WHERE UPPER(camp.VANITY_CODE) = ? AND camp.ID != ?').execute(
			oCampaign.VANITY_CODE.toUpperCase(), oCampaign.ID);
		if (aAltKeyDuplicate.length > 0) {
			addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_DUPLICATE_VANITY_CODE, oCampaign.ID,
				'Root', "VANITY_CODE", [aAltKeyDuplicate[0].ID, aAltKeyDuplicate[0].NAME]);
		}
	}
}

function checkSpecialCharactersForVanityCode(vKey, oCampaign, addMessage, oContext) {
	// deny special characters
	if (oCampaign.VANITY_CODE && !/^([a-zA-Z]|\d|-|_){1,30}$/.test(oCampaign.VANITY_CODE)) {
		addMessage(Message.MessageSeverity.Error, CampMessage.CAMPAIGN_INVALID_VANITY_CODE, vKey, undefined, "VANITY_CODE");
	}
}

//end